/* 실제 인코딩 MP4를 디코딩한 표본. Canvas 재렌더가 아니며, 생성 자체는 검토 완료가 아니다. */
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const {startServer}=require('./serve.cjs');
const root=path.resolve(__dirname,'..');
(async()=>{
  const value=(n,d)=>process.argv.find(a=>a.startsWith('--'+n+'='))?.slice(n.length+3)??d;
  const version=value('version',''),label=value('label','');
  if(!/^[a-z0-9-]+$/.test(version)||!/^[a-z0-9-]+$/.test(label))throw Error('버전과 새로운 검토 이름이 필요합니다.');
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'output/cutscenes/videos',version,'manifest.json')));
  if(manifest.films.length!==9)throw Error('9편 출력이 완료된 버전만 검사합니다.');
  const out=path.join(root,'output/cutscenes/reviews',label);if(fs.existsSync(out))throw Error('기존 검토 근거는 덮어쓰지 않습니다.');
  fs.mkdirSync(out,{recursive:true});const {server,url}=await startServer({prefix:'/planning-document/'});let browser;
  try{
    browser=await chromium.launch();const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url+'cutscenes.html');await page.evaluate(()=>document.fonts.ready);
    const films=[];
    for(const film of manifest.films){
      const result=await page.evaluate(async film=>{
        const video=document.createElement('video');video.muted=true;video.preload='auto';video.src=film.path;document.body.append(video);
        const event=name=>new Promise((resolve,reject)=>{
          const timer=setTimeout(()=>finish(Error('MP4 '+name+' 시간 초과')),10000);
          const ok=()=>finish(),bad=()=>finish(Error('MP4 디코딩 실패'));
          function finish(error){clearTimeout(timer);video.removeEventListener(name,ok);video.removeEventListener('error',bad);error?reject(error):resolve();}
          video.addEventListener(name,ok,{once:true});video.addEventListener('error',bad,{once:true});
        });
        await event('loadeddata');
        if(video.videoWidth!==film.width||video.videoHeight!==film.height)throw Error('MP4 해상도 불일치');
        const times=[.8,2.5,4.2,6.2,8.5,10.5,12.5,14.2,16,18,20.5,23.5];
        const canvas=document.createElement('canvas');canvas.width=648;canvas.height=1656;const c=canvas.getContext('2d');c.fillStyle='#f3edde';c.fillRect(0,0,648,1656);
        for(let i=0;i<times.length;i++){
          const done=event('seeked');video.currentTime=times[i];await done;
          c.drawImage(video,i%3*216,Math.floor(i/3)*414,216,384);
          c.fillStyle='#334d3e';c.font='12px system-ui';c.fillText(film.id+' · '+times[i].toFixed(1)+'s',i%3*216+6,Math.floor(i/3)*414+402);
        }
        video.remove();return{png:canvas.toDataURL('image/png').split(',')[1],times};
      },film);
      fs.writeFileSync(path.join(out,film.id+'.png'),Buffer.from(result.png,'base64'));
      films.push({id:film.id,sha256:film.sha256,times:result.times});console.log(film.id+' · 실제 MP4 12개 표본');
    }
    if(errors.length)throw Error(errors.join('\n'));
    fs.writeFileSync(path.join(out,'frames.json'),JSON.stringify({version,fingerprint:manifest.fingerprint,kind:'decoded-mp4-samples',status:'awaiting-visual-review',note:'실제 영상을 디코딩한 표본이다. 생성·규격 검사 자체는 시각 검토 횟수가 아니다.',errors,films},null,2)+'\n');
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
