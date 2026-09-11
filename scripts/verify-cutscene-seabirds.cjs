/* 하늘 합성 범위와 시간 연속성만 검사한다. 미술 검토와 분리한다. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const {startServer}=require('./serve.cjs');
(async()=>{
  const {server,url}=await startServer({prefix:'/planning-document/'});let browser;
  try{
    browser=await chromium.launch();const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url+'cutscenes.html?birds=glide');await page.waitForFunction(()=>window.cutsceneReady);
    const result=await page.evaluate(()=>{
      const A=CutsceneActors,c=document.createElement('canvas');c.width=960;c.height=1280;const ctx=c.getContext('2d'),cases=[];
      CutsceneSettings.waterMotion=false;let maxStep=0,maxAngleStep=0;
      for(const key of ['shore','coastHome','room','sand'])for(const time of [0,8,16,24]){
        const draw=enabled=>{CutsceneSettings.seabirds=enabled;ctx.clearRect(0,0,960,1280);A.background(ctx,A.images[key],time);return ctx.getImageData(0,0,960,1280).data;};
        const before=draw(false),after=draw(true);let skyChanged=0,belowSkyChanged=0;
        for(let y=0;y<1280;y++)for(let x=0;x<960;x++){const p=(y*960+x)*4;if([0,1,2,3].some(k=>before[p+k]!==after[p+k])){if(y<210)skyChanged++;else belowSkyChanged++;}}
        cases.push({key,time,skyChanged,belowSkyChanged});
      }
      for(const scene of ['shore','home'])for(let i=1;i<=576;i++){
        const a=A.seabirdsAt((i-1)/24,scene),b=A.seabirdsAt(i/24,scene);b.forEach((p,j)=>{maxStep=Math.max(maxStep,Math.hypot(p.x-a[j].x,p.y-a[j].y));maxAngleStep=Math.max(maxAngleStep,Math.abs(p.angle-a[j].angle));});
      }
      return{cases,maxStep,maxAngleStep};
    });
    assert.ok(result.cases.every(c=>c.belowSkyChanged===0));assert.ok(result.cases.filter(c=>['room','sand'].includes(c.key)).every(c=>c.skyChanged===0));assert.ok(result.cases.filter(c=>['shore','coastHome'].includes(c.key)).every(c=>c.skyChanged>0));assert.ok(result.maxStep<.6);assert.ok(result.maxAngleStep<.002);
    await page.goto(url+'cutscenes.html?birds=off');await page.waitForFunction(()=>window.cutsceneReady);assert.ok(await page.evaluate(()=>CutsceneProduction.films.every(f=>!f.tuning.seabirds)));assert.deepEqual(errors,[]);
    const report={result:'PASS',...result,errors,note:'하늘 아래·방·모래 배경 픽셀 불변. 단일 활공 원화이며 날갯짓·비행 물리 승인이 아님.'};fs.writeFileSync(path.resolve(__dirname,'../output/cutscenes/qa/seabirds-check.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
