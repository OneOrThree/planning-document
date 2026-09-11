const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {chromium}=require('playwright');
const {startServer}=require('./serve.cjs');
const root=path.resolve(__dirname,'..');
async function main(){
  const args=process.argv.slice(2),label=args.find(x=>x.startsWith('--label='))?.slice(8),phase=args.find(x=>x.startsWith('--phase='))?.slice(8)||'boarding',actor=args.find(x=>x.startsWith('--actor='))?.slice(8)||null;
  if(!label||!/^[a-z0-9-]+$/.test(label))throw Error('--label=영문-숫자 검토 이름이 필요합니다.');
  const out=path.join(root,'output','cutscenes','reviews',label);if(fs.existsSync(out))throw Error('같은 검토 이름이 이미 있습니다. 기존 증거를 덮어쓰지 않습니다.');fs.mkdirSync(out,{recursive:true});
  const {server,url}=await startServer({prefix:'/planning-document/'});let browser;
  try{
    browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1280,height:960}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url+'cutscenes.html');await page.waitForFunction(()=>window.cutsceneReady);
    const data=await page.evaluate(({phase,actor})=>{
      const film=document.getElementById('film');film.width=360;film.height=640;const results=[];
      for(let d=0;d<3;d++){
        const sheet=document.createElement('canvas');sheet.width=3*216;sheet.height=3*414;const c=sheet.getContext('2d');c.fillStyle='#f3edde';c.fillRect(0,0,sheet.width,sheet.height);const frames=[];
        CutsceneProduction.films.filter(f=>f.directionIndex===d).forEach((f,row)=>{
          if(actor)f.tuning.actorMode=actor;
          const k=f.timing;const range={intro:[1.4,2.65],transition:[k.prepareEnd-.43,k.prepareEnd+.5],prepare:[.8,k.prepareEnd-.3],walk:[k.prepareEnd+.15,k.walkEnd-.05],boarding:[k.walkEnd+.1,k.boardingEnd+.15],settle:[k.boardingEnd+.01,k.departureStart],depart:[k.departureStart,k.seaStart-.1],sea:[k.seaStart+.3,23.8]}[phase];if(!range)throw Error('알 수 없는 검토 구간');
          [0,.5,1].forEach((p,col)=>{const t=range[0]+(range[1]-range[0])*p;const state=GachisupCinema.render(film,f,t);c.drawImage(film,col*216,row*414,216,384);c.fillStyle='#334d3e';c.font='12px system-ui';c.fillText(`${f.storyIndex+1} · ${f.directionTitle} · ${t.toFixed(2)}s`,col*216+7,row*414+403);frames.push(state);});
        });results.push({direction:d,png:sheet.toDataURL('image/png').split(',')[1],frames});
      }return results;
    },{phase,actor});
    const hash=crypto.createHash('sha256');
    for(const f of ['cutscene-cinema.js','cutscene-renderer.js','cutscene-water-motion.js','cutscene-production.js','cutscene-sprites.js','cutscene-fur-palette.js','cutscene-poses.js','cutscene-paddle-rig.js','cutscene-walk-rig.js','cutscene-rig.js'])hash.update(f).update(fs.readFileSync(path.join(root,f)));
    function hashAssets(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const f=path.join(dir,item.name);if(item.isDirectory())hashAssets(f);else hash.update(path.relative(root,f)).update(fs.readFileSync(f));}}
    hashAssets(path.join(root,'assets/cutscenes'));const fingerprint=hash.digest('hex');
    for(const r of data){fs.writeFileSync(path.join(out,`direction-${r.direction}.png`),Buffer.from(r.png,'base64'));delete r.png;}
    fs.writeFileSync(path.join(out,'frames.json'),JSON.stringify({phase,actor,fingerprint,errors,data},null,2)+'\n');
    console.log(JSON.stringify({label,phase,films:9,frames:27,errors,fingerprint}));if(errors.length)process.exitCode=1;
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
