/* 기존 아틀라스와 개별 자세 실험을 같은 시간·카메라로 실제 MP4 비교한다. 자동 승인하지 않는다. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawn}=require('node:child_process'),{once}=require('node:events'),{chromium}=require('playwright');
const {startServer}=require('./serve.cjs');const root=path.resolve(__dirname,'..');
(async()=>{
  const args=process.argv.slice(2),value=(n,d)=>args.find(a=>a.startsWith('--'+n+'='))?.slice(n.length+3)??d;
  const label=value('label',''),filmId=value('film','new-morning-emotion'),phase=value('phase','walk');
  if(!['walk','boarding','settle','paddle','blink'].includes(phase))throw Error('비교 구간은 walk / boarding / settle / paddle / blink입니다.');
  if(!/^[a-z0-9-]+$/.test(label))throw Error('새 --label이 필요합니다.');
  const out=path.join(root,'output/cutscenes/details',label);if(fs.existsSync(out))throw Error('기존 비교 결과는 덮어쓰지 않습니다.');fs.mkdirSync(out,{recursive:true});
  const {server,url}=await startServer({prefix:'/planning-document/'});let browser,ff;
  try{
    browser=await chromium.launch();const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url+'cutscenes.html');await page.waitForFunction(()=>window.cutsceneReady);await page.evaluate(()=>CutscenePoses.load());
    const duration=await page.evaluate(({filmId,phase})=>{
      const film=CutsceneProduction.films.find(f=>f.id===filmId);if(!film)throw Error('없는 영상 ID');
      const k=film.timing,blinkAt=Math.ceil((k.departureStart+1-3.2)/4.7)*4.7+3.2;
      const [start,end]={walk:[k.prepareEnd,k.walkEnd],boarding:[k.walkEnd-.25,k.boardingEnd+.45],settle:[k.boardingEnd,k.departureStart],paddle:[k.departureStart+.9,k.departureStart+3.9],blink:[blinkAt-.1,blinkAt+.4]}[phase];
      const source=document.createElement('canvas');source.width=1440;source.height=2560;
      const output=document.createElement('canvas');output.width=840;output.height=480;
      const sheet=document.createElement('canvas');sheet.width=1260;sheet.height=1920;const sc=sheet.getContext('2d');sc.fillStyle='#f3ecda';sc.fillRect(0,0,sheet.width,sheet.height);
      const adjacent=[];
      window.walkPoseFrame=(elapsed,sample,frameIndex)=>{
        const c=output.getContext('2d');c.fillStyle='#f3ecda';c.fillRect(0,0,840,480);const time=start+elapsed,states=[];
        for(const [i,mode] of ['sprite','poses'].entries()){
          const f={...film,tuning:{...film.tuning,actorMode:mode}},m=GachisupCinema.render(source,f,time),cam=m.camera;
          const x=360+(m.catFoot.x-cam.x)*cam.z,y=640+(m.catFoot.y-cam.y)*cam.z;
          const crop={x:Math.max(0,Math.min(440,x-120)),y:Math.max(0,Math.min(1000,y-218)),size:280};
          c.drawImage(source,crop.x*2,crop.y*2,560,560,12+i*420,48,396,396);c.fillStyle='#3c493c';c.font='600 17px system-ui';c.fillText(i?'개별 자세 · 실험':'기존 아틀라스 · 기준',15+i*420,29);
          states.push({mode,time,phase:m.phase,foot:m.catFoot,actor:m.actorState,crop});
        }
        c.fillStyle='#3c493c';c.font='15px system-ui';c.fillText(film.id+' · '+time.toFixed(3)+'s · 실제 속도',15,470);
        if(sample>=0)sc.drawImage(output,0,0,840,480,(sample%3)*420,Math.floor(sample/3)*240,420,240);
        const group=Math.floor(frameIndex/12),slot=frameIndex%12;
        if(!adjacent[group]){const tile=document.createElement('canvas');tile.width=1260;tile.height=960;adjacent[group]=tile;}
        adjacent[group].getContext('2d').drawImage(output,0,0,840,480,(slot%3)*420,Math.floor(slot/3)*240,420,240);
        return{jpeg:output.toDataURL('image/jpeg',.97).split(',')[1],states};
      };
      window.walkAdjacentSheets=()=>adjacent.map(c=>c.toDataURL('image/png').split(',')[1]);
      window.walkPoseSheet=()=>sheet.toDataURL('image/png').split(',')[1];return end-start;
    },{filmId,phase});
    const fps=24,frames=Math.round(duration*fps),dest=path.join(out,'comparison.mp4'),sampleFrames=new Map(Array.from({length:24},(_,i)=>[Math.round(i*(frames-1)/23),i]));
    ff=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-vcodec','mjpeg','-framerate',String(fps),'-i','pipe:0','-an','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',dest]);
    let stderr='';ff.stderr.on('data',d=>{stderr+=d;});const done=new Promise((resolve,reject)=>{ff.on('error',reject);ff.on('close',code=>code?reject(Error(stderr)):resolve());});done.catch(()=>{});ff.stdin.on('error',()=>{});
    const states=[];
    for(let frame=0;frame<frames;frame++){
      if(ff.exitCode!==null)throw Error(stderr||'인코더 중단');const result=await page.evaluate(({t,sample,frameIndex})=>walkPoseFrame(t,sample,frameIndex),{t:frame/fps,sample:sampleFrames.get(frame)??-1,frameIndex:frame});
      if(!ff.stdin.write(Buffer.from(result.jpeg,'base64')))await Promise.race([once(ff.stdin,'drain'),done]);
      if(args.includes('--all-frames'))fs.writeFileSync(path.join(out,'frame-'+String(frame).padStart(3,'0')+'.jpg'),Buffer.from(result.jpeg,'base64'));
      states.push({frame,elapsed:frame/fps,sampled:sampleFrames.has(frame),actors:result.states});
    }
    ff.stdin.end();await done;ff=null;
    fs.writeFileSync(path.join(out,'contact-sheet.png'),Buffer.from(await page.evaluate(()=>walkPoseSheet()),'base64'));
    if(args.includes('--adjacent')){const adjacent=await page.evaluate(()=>walkAdjacentSheets());for(const [i,png]of adjacent.entries())fs.writeFileSync(path.join(out,'adjacent-'+String(i).padStart(2,'0')+'.png'),Buffer.from(png,'base64'));}
    const hash=crypto.createHash('sha256');for(const file of ['cutscene-cinema.js','cutscene-renderer.js','cutscene-poses.js','cutscene-sprites.js','cutscene-production.js'])hash.update(file).update(fs.readFileSync(path.join(root,file)));
    const assets=dir=>{for(const e of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const file=path.join(dir,e.name);if(e.isDirectory())assets(file);else hash.update(path.relative(root,file)).update(fs.readFileSync(file));}};assets(path.join(root,'assets/cutscenes'));
    fs.writeFileSync(path.join(out,'frames.json'),JSON.stringify({filmId,phase,duration:frames/fps,fps,frames,fingerprint:hash.digest('hex'),status:'unreviewed-experiment',note:'실제 속도의 선택 구간 비교. 전체 컷신이나 동작의 자동 통과 판정이 아니다. 연락표는 24개 시간 표본.',errors,states},null,2)+'\n');
    console.log(JSON.stringify({filmId,duration:frames/fps,frames,path:path.relative(root,dest),errors}));if(errors.length)process.exitCode=1;
  }finally{if(ff)ff.kill('SIGTERM');if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
