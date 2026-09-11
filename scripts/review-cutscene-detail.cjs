/* 캐릭터·소품 접촉을 확대 캡처한다. 정지 표본을 연속 동작 통과로 계산하지 않는다. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const {startServer}=require('./serve.cjs');
const root=path.resolve(__dirname,'..');
(async()=>{
  const args=process.argv.slice(2),value=(n,d)=>args.find(a=>a.startsWith('--'+n+'='))?.slice(n.length+3)??d;
  const label=value('label',''),phase=value('phase','prepare'),from=Number(value('from',.28)),to=Number(value('to',.95)),selected=value('film',null);
  if(!/^[a-z0-9-]+$/.test(label)||from<0||to>1||from>=to)throw Error('검토 이름과 0~1 구간이 필요합니다.');
  const out=path.join(root,'output/cutscenes/details',label);if(fs.existsSync(out))throw Error('새 검토 이름을 사용하세요.');fs.mkdirSync(out,{recursive:true});
  const {server,url}=await startServer({prefix:'/planning-document/'});let browser;
  try{
    browser=await chromium.launch();const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url+'cutscenes.html');await page.waitForFunction(()=>window.cutsceneReady);
    const data=await page.evaluate(({phase,from,to,selected})=>{
      const source=document.createElement('canvas');source.width=1440;source.height=2560;
      return CutsceneProduction.films.filter(f=>!selected||f.id===selected).map(f=>{
        const k=f.timing,range={prepare:[0,k.prepareEnd],walk:[k.prepareEnd,k.walkEnd],boarding:[k.walkEnd,k.boardingEnd],settle:[k.boardingEnd,k.departureStart],depart:[k.departureStart,k.seaStart],sea:[k.seaStart,24]}[phase];
        if(!range)throw Error('없는 검토 구간');
        const sheet=document.createElement('canvas');sheet.width=960;sheet.height=700;const c=sheet.getContext('2d');c.fillStyle='#f3edde';c.fillRect(0,0,960,700);const frames=[];
        for(let i=0;i<6;i++){
          const t=range[0]+(range[1]-range[0])*(from+(to-from)*i/5),m=GachisupCinema.render(source,f,t),cam=m.camera;
          const sx=360+(m.catFoot.x-cam.x)*cam.z,sy=640+(m.catFoot.y-cam.y)*cam.z;
          const crop={x:Math.max(0,Math.min(360,sx-136)),y:Math.max(0,Math.min(920,sy-280)),size:360};
          c.drawImage(source,crop.x*2,crop.y*2,720,720,(i%3)*320,Math.floor(i/3)*350,320,320);
          c.fillStyle='#3c4d40';c.font='13px system-ui';c.fillText(`${f.id} · ${t.toFixed(2)}s`,(i%3)*320+8,Math.floor(i/3)*350+341);
          frames.push({time:t,crop,...m});
        }
        return{id:f.id,png:sheet.toDataURL('image/png').split(',')[1],frames};
      });
    },{phase,from,to,selected});
    if(!data.length)throw Error('선택한 영상이 없습니다.');
    const hash=crypto.createHash('sha256');for(const file of ['cutscene-renderer.js','cutscene-cinema.js','cutscene-production.js','cutscene-sprites.js'])hash.update(file).update(fs.readFileSync(path.join(root,file)));
    for(const film of data){fs.writeFileSync(path.join(out,film.id+'.png'),Buffer.from(film.png,'base64'));delete film.png;}
    fs.writeFileSync(path.join(out,'frames.json'),JSON.stringify({label,phase,from,to,fingerprint:hash.digest('hex'),errors,films:data},null,2)+'\n');
    console.log(JSON.stringify({label,films:data.length,frames:data.length*6,errors}));if(errors.length)process.exitCode=1;
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
