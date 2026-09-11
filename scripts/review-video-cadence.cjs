/* 같은 소스에서 나온 24/60fps 실제 MP4의 인접 시간 표본. 보간 프레임을 만들지 않는다. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{spawn}=require('node:child_process'),{once}=require('node:events');
const {startServer}=require('./serve.cjs'),profile=require('./cutscene-video-profile.cjs');
const root=path.resolve(__dirname,'..');
(async()=>{
  const value=(name,fallback)=>process.argv.find(a=>a.startsWith('--'+name+'='))?.slice(name.length+3)??fallback;
  const label=value('label',''),before=value('before','draft-v17'),after=value('after','cadence-60-study-v1'),id=value('film','new-morning-emotion');
  const start=Number(value('start',7.1)),duration=Number(value('duration',1));
  if(![label,before,after,id].every(v=>/^[a-z0-9-]+$/.test(v))||!(duration>0&&duration<=3&&start>=0&&start+duration<24))throw Error('안전한 이름과 24초 안의 최대 3초 구간이 필요합니다.');
  const batches=[before,after].map(v=>JSON.parse(fs.readFileSync(path.join(root,'output/cutscenes/videos',v,'manifest.json'))));
  assert.equal(batches[0].fingerprint,batches[1].fingerprint,'프레임 속도 외 소스가 다른 영상은 비교하지 않습니다.');
  const films=batches.map(b=>b.films.find(f=>f.id===id));assert.ok(films.every(Boolean));assert.equal(films[0].fps,24);assert.equal(films[1].fps,60);
  const out=path.join(root,'output/cutscenes/details',label);if(fs.existsSync(out))throw Error('새 검토 이름을 사용하세요.');fs.mkdirSync(out,{recursive:true});
  const {server,url}=await startServer({prefix:'/planning-document/'});let browser,ff;
  try{
    browser=await chromium.launch();const p=await browser.newPage();await p.goto(url+'cutscenes.html');await p.evaluate(()=>document.fonts.ready);
    await p.evaluate(async films=>{
      window.cadenceVideos=await Promise.all(films.map(async film=>{const v=document.createElement('video');v.muted=true;v.preload='auto';document.body.append(v);const ready=new Promise((resolve,reject)=>{v.onloadeddata=resolve;v.onerror=()=>reject(Error('영상 로드 실패'));});v.src=film.path;await ready;return v;}));
      window.cadenceSheets=[];
      window.cadenceFrame=async(time,index)=>{
        const canvas=document.createElement('canvas');canvas.width=540;canvas.height=528;const c=canvas.getContext('2d');c.fillStyle='#f3edde';c.fillRect(0,0,540,528);
        for(const [i,v]of cadenceVideos.entries()){
          await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('시킹 시간 초과')),10000);v.onseeked=()=>{clearTimeout(timer);resolve();};v.currentTime=time;});
          c.drawImage(v,i*270,24,270,480);c.fillStyle='#3c493c';c.font='13px system-ui';c.fillText(i?'60fps · 실제 디코딩':'24fps · 실제 디코딩',i*270+8,17);
        }
        c.fillStyle='#3c493c';c.fillText(time.toFixed(4)+'s · 같은 장면, 같은 재생 시간',8,520);
        const group=Math.floor(index/12),slot=index%12;
        if(!cadenceSheets[group]){const s=document.createElement('canvas');s.width=1080;s.height=1056;cadenceSheets[group]=s;}
        cadenceSheets[group].getContext('2d').drawImage(canvas,slot%3*360,Math.floor(slot/3)*264,360,264);
        return canvas.toDataURL('image/jpeg',.97).split(',')[1];
      };
    },films);
    ff=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-vcodec','mjpeg','-framerate','60','-i','pipe:0','-an',...profile.args,'-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',path.join(out,'comparison.mp4')]);
    let stderr='';ff.stderr.on('data',d=>stderr+=d);const done=new Promise((resolve,reject)=>{ff.once('error',reject);ff.once('close',code=>code?reject(Error(stderr)):resolve());});done.catch(()=>{});ff.stdin.on('error',()=>{});
    const frames=Math.round(duration*60);
    for(let i=0;i<frames;i++){const jpeg=await p.evaluate(({time,index})=>cadenceFrame(time,index),{time:start+i/60,index:i});if(!ff.stdin.write(Buffer.from(jpeg,'base64')))await Promise.race([once(ff.stdin,'drain'),done]);}
    ff.stdin.end();await done;ff=null;
    const sheets=await p.evaluate(()=>cadenceSheets.map(s=>s.toDataURL('image/png').split(',')[1]));
    for(const [i,png]of sheets.entries())fs.writeFileSync(path.join(out,'adjacent-'+String(i).padStart(2,'0')+'.png'),Buffer.from(png,'base64'));
    const report={label,id,before,after,fingerprint:batches[0].fingerprint,sha256:films.map(f=>f.sha256),start,duration,fps:60,frames,status:'awaiting-visual-review',note:'두 실제 MP4를 같은 60개 시점에서 디코딩. 생성 자체는 검토 완료가 아니다.'};
    fs.writeFileSync(path.join(out,'frames.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
  }finally{if(ff)ff.kill('SIGTERM');if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
