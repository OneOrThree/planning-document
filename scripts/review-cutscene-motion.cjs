/* 비교용 움직임을 실제 MP4와 연속 프레임으로 저장한다. 검토 완료 판정은 하지 않는다. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const {once}=require('node:events');
const {chromium}=require('playwright');
const {startServer}=require('./serve.cjs');
const root=path.resolve(__dirname,'..');
(async()=>{
  const args=process.argv.slice(2),label=args.find(a=>a.startsWith('--label='))?.slice(8),filmId=args.find(a=>a.startsWith('--film='))?.slice(7)||'new-morning-emotion';
  if(!label||!/^[a-z0-9-]+$/.test(label))throw Error('안전한 --label이 필요합니다.');
  const out=path.join(root,'output/cutscenes/motion',label);if(fs.existsSync(out))throw Error('새 검토 이름을 사용하세요.');fs.mkdirSync(out,{recursive:true});
  const {server,url}=await startServer({prefix:'/planning-document/'});let browser,ff;
  try{
    browser=await chromium.launch();const page=await browser.newPage();await page.goto(url+'cutscenes.html');await page.waitForFunction(()=>window.cutsceneReady);
    await page.evaluate(filmId=>{
      const film=CutsceneProduction.films.find(f=>f.id===filmId);if(!film)throw Error('없는 영상');
      const source=document.createElement('canvas');source.width=1440;source.height=2560;
      const output=document.createElement('canvas');output.width=840;output.height=480;
      window.drawMotion=time=>{
        const c=output.getContext('2d');c.fillStyle='#f3ecda';c.fillRect(0,0,840,480);
        let phase,t;
        if(time<4){phase='걷기 · 실제 속도';t=film.timing.prepareEnd+.25+(time%2.8);}
        else if(time<6.8){phase='승선 · 실제 속도';t=film.timing.walkEnd+(time-4);}
        else{phase='노 젓기 · 실제 속도';t=film.timing.departureStart+(time-6.8);}
        const data=[];
        for(const [i,mode] of ['sprite','rig'].entries()){
          const f={...film,tuning:{...film.tuning,actorMode:mode}},m=GachisupCinema.render(source,f,t),cam=m.camera;
          const sx=360+(m.catFoot.x-cam.x)*cam.z,sy=640+(m.catFoot.y-cam.y)*cam.z;
          const crop={x:Math.max(0,Math.min(480,sx-120)),y:Math.max(0,Math.min(1040,sy-187))};
          c.drawImage(source,crop.x*2,crop.y*2,480,480,12+i*420,48,396,396);
          c.fillStyle='#3d493e';c.font='600 18px system-ui';c.fillText(i?'관절 파츠 실험':'생성 프레임 + 변형',15+i*420,29);
          data.push({mode,time:t,phase:m.phase,foot:m.catFoot,camera:cam});
        }
        c.fillStyle='#3d493e';c.font='15px system-ui';c.fillText(phase+' · '+time.toFixed(2)+'s',15,470);
        return{jpeg:output.toDataURL('image/jpeg',.97).split(',')[1],data};
      };
    },filmId);
    const dest=path.join(out,'comparison.mp4');
    ff=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-vcodec','mjpeg','-framerate','24','-i','pipe:0','-an','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',dest]);
    let stderr='';ff.stderr.on('data',d=>{stderr+=d;});const done=new Promise((resolve,reject)=>{ff.on('error',reject);ff.on('close',code=>code?reject(Error(stderr)):resolve());});done.catch(()=>{});ff.stdin.on('error',()=>{});
    const samples=[];
    for(let i=0;i<288;i++){
      if(ff.exitCode!==null)throw Error(stderr||'인코더 종료');
      const r=await page.evaluate(t=>drawMotion(t),i/24);
      if(!ff.stdin.write(Buffer.from(r.jpeg,'base64')))await Promise.race([once(ff.stdin,'drain'),done]);
      if(i%12===0){const name='frame-'+String(i).padStart(3,'0')+'.jpg';fs.writeFileSync(path.join(out,name),Buffer.from(r.jpeg,'base64'));samples.push({frame:i,path:name,states:r.data});}
    }
    ff.stdin.end();await done;ff=null;
    const fingerprint=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'cutscene-rig.js'))).update(fs.readFileSync(path.join(root,'cutscene-cinema.js'))).digest('hex');
    fs.writeFileSync(path.join(out,'review.json'),JSON.stringify({filmId,duration:12,fps:24,frames:288,fingerprint,note:'발췌 비교용. 걷기 구간 2.8초 반복은 해당 비교 영상의 편집이며 원본 전체 장면 재생이 아니다.',samples},null,2)+'\n');
    console.log(path.relative(root,dest));
  }finally{if(ff)ff.kill('SIGTERM');if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
