/* 물 영역의 경계·변위와 실제 배경 합성을 함께 확인하는 검토 자료. 자동 미술 승인 아님. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('playwright'),{startServer}=require('./serve.cjs');
const root=path.resolve(__dirname,'..');
(async()=>{
  const label=process.argv.find(a=>a.startsWith('--label='))?.slice(8);
  if(!/^[a-z0-9-]+$/.test(label||''))throw Error('새 --label이 필요합니다.');
  const out=path.join(root,'output/cutscenes/details',label);
  if(fs.existsSync(out))throw Error('기존 검토를 덮어쓰지 않습니다.');fs.mkdirSync(out,{recursive:true});
  const {server,url}=await startServer({prefix:'/planning-document/'});let browser;
  try{
    browser=await chromium.launch();const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url+'cutscenes.html');await page.waitForFunction(()=>window.cutsceneReady);
    if(!await page.evaluate(()=>!!window.CutsceneWaterMotion))await page.addScriptTag({path:path.join(root,'cutscene-water-motion.js')});
    const results=await page.evaluate(()=>{
      const canvas=(w=960,h=1280)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
      return ['shore','home'].map(scene=>{
        const image=scene==='shore'?CutsceneActors.images.shoreExtended:CutsceneActors.images.homeExtended;
        const base=canvas(),b=base.getContext('2d');b.drawImage(image,0,0,960,1280);
        const mask=canvas(),m=mask.getContext('2d'),edge=CutsceneWaterMotion.boundaries[scene];
        m.beginPath();edge.forEach(([x,y],i)=>i?m.lineTo(x,y):m.moveTo(x,y));m.closePath();m.fill();
        const maskPixels=m.getImageData(0,0,960,1280).data,basePixels=b.getImageData(0,0,960,1280).data;
        const overview=canvas(960,672),o=overview.getContext('2d');o.fillStyle='#f3ecda';o.fillRect(0,0,960,672);
        const close=canvas(960,1024),q=close.getContext('2d');q.fillStyle='#f3ecda';q.fillRect(0,0,960,1024);
        const measured=[];
        for(const [i,t]of [0,2,4,6].entries()){
          const moving=canvas(),c=moving.getContext('2d');c.drawImage(base,0,0);CutsceneWaterMotion.draw(c,image,scene,t);
          const data=c.getImageData(0,0,960,1280).data;let outsideChanged=0,insideChanged=0,maxDelta=0;
          for(let p=0;p<data.length;p+=4){const d=Math.max(...[0,1,2,3].map(k=>Math.abs(data[p+k]-basePixels[p+k])));if(maskPixels[p+3]===0){if(d>0)outsideChanged++;}else if(d>0){insideChanged++;maxDelta=Math.max(maxDelta,d);}}
          measured.push({time:t,outsideChanged,insideChanged,maxDelta});
          o.drawImage(moving,i*240,28,240,320);o.fillStyle='#3c493c';o.font='16px system-ui';o.fillText(scene+' · '+t+'s',i*240+8,20);
          q.drawImage(moving,480,704,480,480,i%2*480,Math.floor(i/2)*512+32,480,480);q.fillStyle='#3c493c';q.font='18px system-ui';q.fillText('수면 원해상도 · '+t+'s',i%2*480+10,Math.floor(i/2)*512+24);
        }
        const overlay=canvas(),a=overlay.getContext('2d');a.drawImage(base,0,0);a.save();a.fillStyle='#f2466270';a.beginPath();edge.forEach(([x,y],i)=>i?a.lineTo(x,y):a.moveTo(x,y));a.closePath();a.fill();a.restore();
        o.drawImage(base,0,352,240,320);o.drawImage(overlay,240,352,240,320);
        const delta=canvas(),d=delta.getContext('2d');d.drawImage(base,0,0);CutsceneWaterMotion.draw(d,image,scene,4);d.globalCompositeOperation='difference';d.drawImage(base,0,0);o.drawImage(delta,480,352,240,320);
        o.fillStyle='#3c493c';o.font='17px system-ui';o.fillText('원본 / 분홍=물 마스크 / 차이',728,382);o.fillText('검은 영역은 원본과 동일',728,410);
        return{scene,measured,overview:overview.toDataURL('image/png').split(',')[1],close:close.toDataURL('image/png').split(',')[1]};
      });
    });
    const fingerprint=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'cutscene-water-motion.js'))).digest('hex');
    for(const r of results){fs.writeFileSync(path.join(out,r.scene+'-overview.png'),Buffer.from(r.overview,'base64'));fs.writeFileSync(path.join(out,r.scene+'-detail.png'),Buffer.from(r.close,'base64'));delete r.overview;delete r.close;}
    fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({label,fingerprint,status:'unreviewed-experiment',errors,results},null,2)+'\n');
    console.log(JSON.stringify({label,errors,results}));
    if(errors.length||results.some(r=>r.measured.some(m=>m.outsideChanged)))process.exitCode=1;
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
