/* 캐릭터·소품 접촉을 확대 캡처한다. 정지 표본을 연속 동작 통과로 계산하지 않는다. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const {startServer}=require('./serve.cjs');
const root=path.resolve(__dirname,'..');
(async()=>{
  const args=process.argv.slice(2),value=(n,d)=>args.find(a=>a.startsWith('--'+n+'='))?.slice(n.length+3)??d;
  const label=value('label',''),phase=value('phase','prepare'),from=Number(value('from',.28)),to=Number(value('to',.95)),selected=value('film',null),samples=Number(value('samples',6)),cropSize=Number(value('crop',360)),anchor=value('anchor','actor');
  if(!/^[a-z0-9-]+$/.test(label)||!Number.isFinite(from)||!Number.isFinite(to)||from<0||to>1||from>=to)throw Error('검토 이름과 0~1 구간이 필요합니다.');
  if(!Number.isInteger(samples)||samples<2||samples>24||!Number.isFinite(cropSize)||cropSize<180||cropSize>720)throw Error('표본 수는 2~24, 확대 영역은 180~720이어야 합니다.');
  if(!['actor','ground'].includes(anchor))throw Error('확대 기준은 actor 또는 ground입니다.');
  const actor=value('actor',null);if(actor&&!['sprite','poses','rig'].includes(actor))throw Error('없는 캐릭터 렌더 방식');
  const out=path.join(root,'output/cutscenes/details',label);if(fs.existsSync(out))throw Error('새 검토 이름을 사용하세요.');fs.mkdirSync(out,{recursive:true});
  const {server,url}=await startServer({prefix:'/planning-document/'});let browser;
  try{
    browser=await chromium.launch();const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url+'cutscenes.html'+(actor?'?actor='+actor:''));await page.waitForFunction(()=>window.cutsceneReady);
    const data=await page.evaluate(({phase,from,to,selected,samples,cropSize,anchor})=>{
      const source=document.createElement('canvas');source.width=1440;source.height=2560;
      return CutsceneProduction.films.filter(f=>!selected||f.id===selected).map(f=>{
        const k=f.timing,blinkAt=Math.ceil((k.departureStart+1-3.2)/4.7)*4.7+3.2,range={prepare:[0,k.prepareEnd],walk:[k.prepareEnd,k.walkEnd],boarding:[k.walkEnd,k.boardingEnd],'boarding-link':[k.walkEnd-.25,k.boardingEnd+.45],'book-lift':[k.prepareEnd*.46,k.prepareEnd*.85],'walk-link':[k.prepareEnd-.25,k.prepareEnd+.8],'paddle-loop':[k.departureStart+1,k.departureStart+3.8],blink:[blinkAt-.08,blinkAt+.32],settle:[k.boardingEnd,k.departureStart],depart:[k.departureStart,k.seaStart],sea:[k.seaStart,24]}[phase];
        if(!range)throw Error('없는 검토 구간');
        const sheet=document.createElement('canvas');sheet.width=960;sheet.height=Math.ceil(samples/3)*350;const c=sheet.getContext('2d');c.fillStyle='#f3edde';c.fillRect(0,0,sheet.width,sheet.height);const frames=[];
        for(let i=0;i<samples;i++){
          const t=range[0]+(range[1]-range[0])*(from+(to-from)*i/(samples-1)),m=GachisupCinema.render(source,f,t),cam=m.camera;
          const sx=360+(m.catFoot.x-cam.x)*cam.z,sy=640+(m.catFoot.y-cam.y)*cam.z;
          const crop={x:Math.max(0,Math.min(720-cropSize,sx-cropSize*.378)),y:Math.max(0,Math.min(1280-cropSize,sy-cropSize*(anchor==='ground'?.5:.778))),size:cropSize};
          c.drawImage(source,crop.x*2,crop.y*2,cropSize*2,cropSize*2,(i%3)*320,Math.floor(i/3)*350,320,320);
          c.fillStyle='#3c4d40';c.font='13px system-ui';c.fillText(`${f.id} · ${t.toFixed(2)}s`,(i%3)*320+8,Math.floor(i/3)*350+341);
          frames.push({time:t,crop,...m});
        }
        return{id:f.id,png:sheet.toDataURL('image/png').split(',')[1],frames};
      });
    },{phase,from,to,selected,samples,cropSize,anchor});
    if(!data.length)throw Error('선택한 영상이 없습니다.');
    const hash=crypto.createHash('sha256');for(const file of ['cutscene-renderer.js','cutscene-cinema.js','cutscene-production.js','cutscene-sprites.js','cutscene-poses.js'])hash.update(file).update(fs.readFileSync(path.join(root,file)));
    for(const film of data){fs.writeFileSync(path.join(out,film.id+'.png'),Buffer.from(film.png,'base64'));delete film.png;}
    const assets=dir=>{for(const item of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const file=path.join(dir,item.name);if(item.isDirectory())assets(file);else hash.update(path.relative(root,file)).update(fs.readFileSync(file));}};assets(path.join(root,'assets/cutscenes'));
    fs.writeFileSync(path.join(out,'frames.json'),JSON.stringify({label,phase,actor:actor||'production-default',from,to,samples,cropSize,anchor,fingerprint:hash.digest('hex'),errors,films:data},null,2)+'\n');
    console.log(JSON.stringify({label,films:data.length,frames:data.length*samples,errors}));if(errors.length)process.exitCode=1;
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
