/* 먼 배경 움직임: 전체 구도와 하늘 확대를 함께 남긴다. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{startServer}=require('./serve.cjs');
const root=path.resolve(__dirname,'..');
(async()=>{
  const label=process.argv.find(a=>a.startsWith('--label='))?.slice(8);if(!/^[a-z0-9-]+$/.test(label||''))throw Error('새 --label이 필요합니다.');
  const out=path.join(root,'output/cutscenes/details',label);if(fs.existsSync(out))throw Error('기존 검토 보호');fs.mkdirSync(out,{recursive:true});
  const {server,url}=await startServer({prefix:'/planning-document/'});let browser;
  try{
    browser=await chromium.launch();const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url+'cutscenes.html?birds=glide');await page.waitForFunction(()=>window.cutsceneReady);
    const results=await page.evaluate(()=>{
      const canvas=(w,h)=>{const el=document.createElement('canvas');el.width=w;el.height=h;return el;},source=canvas(1440,2560);
      const films=CutsceneProduction.films.map(f=>{
        const sheet=canvas(960,800),c=sheet.getContext('2d');c.fillStyle='#f3ecda';c.fillRect(0,0,960,800);const frames=[];
        for(const [i,time]of [Math.max(8.5,f.timing.prepareEnd+.3),14,19,23.5].entries()){
          const m=GachisupCinema.render(source,f,time),birds=CutsceneActors.seabirdsAt(time,f.directionId==='journey'?'home':'shore');
          c.drawImage(source,i*240,24,240,426.6667);c.fillStyle='#3c493c';c.font='14px system-ui';c.fillText(time.toFixed(2)+'s',i*240+8,18);
          const cam=m.camera,center={x:360+(birds[0].x-cam.x)*cam.z,y:640+(birds[0].y-cam.y)*cam.z};
          const crop={x:Math.max(0,Math.min(720-220,center.x-80)),y:Math.max(0,Math.min(1280-220,center.y-70)),size:220};
          c.drawImage(source,crop.x*2,crop.y*2,440,440,i*240,478,240,240);c.font='13px system-ui';c.fillText('하늘 확대',i*240+8,742);
          frames.push({time,birds,camera:cam,crop});
        }
        c.fillText(f.id,12,785);return{id:f.id,frames,png:sheet.toDataURL('image/png').split(',')[1]};
      });
      let maxStep=0,maxAngleStep=0,minY=Infinity,maxY=-Infinity;for(const scene of ['shore','home'])for(let i=1;i<=576;i++){
        const prev=CutsceneActors.seabirdsAt((i-1)/24,scene),now=CutsceneActors.seabirdsAt(i/24,scene);
        now.forEach((b,j)=>{maxStep=Math.max(maxStep,Math.hypot(b.x-prev[j].x,b.y-prev[j].y));maxAngleStep=Math.max(maxAngleStep,Math.abs(b.angle-prev[j].angle));minY=Math.min(minY,b.y);maxY=Math.max(maxY,b.y);});
      }
      return{films,maxStep,maxAngleStep,minY,maxY};
    });
    for(const f of results.films){fs.writeFileSync(path.join(out,f.id+'.png'),Buffer.from(f.png,'base64'));delete f.png;}
    const fingerprint=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'cutscene-renderer.js'))).update(fs.readFileSync(path.join(root,'assets/cutscenes/seagull-glide-v1.png'))).digest('hex');
    fs.writeFileSync(path.join(out,'frames.json'),JSON.stringify({label,status:'unreviewed-experiment',fingerprint,errors,...results},null,2)+'\n');
    assert.ok(results.maxStep<.6);assert.ok(results.maxAngleStep<.002);assert.ok(results.minY>40&&results.maxY<190);assert.deepEqual(errors,[]);
    console.log(JSON.stringify({films:results.films.length,maxStep:results.maxStep,maxAngleStep:results.maxAngleStep,minY:results.minY,maxY:results.maxY,errors}));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
