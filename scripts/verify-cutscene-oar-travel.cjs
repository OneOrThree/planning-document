/* 노 주기와 전진 시간의 단조성·시종점 보존. 물리 시뮬레이션 검사가 아니다. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const {startServer}=require('./serve.cjs');
(async()=>{
  const {server,url}=await startServer({prefix:'/planning-document/'});let browser;
  try{
    browser=await chromium.launch();const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url+'cutscenes.html?travel=stroke');await page.waitForFunction(()=>window.cutsceneReady);
    const result=await page.evaluate(()=>{
      const C=GachisupCinema,cases=[];let maxDisplacement=0,maxEndpointError=0,minIncrement=Infinity,maxIncrement=0;
      for(const film of CutsceneProduction.films){
        const f={...film,tuning:{...film.tuning,oarTravel:true}},old={...film,tuning:{...film.tuning,oarTravel:false}},k=f.timing;
        for(const [start,end,offset]of [[k.departureStart,k.seaStart,0],[k.seaStart,24,k.seaStart-k.departureStart]]){
          let prev=0,monotonic=true;
          for(let i=0;i<=1000;i++){
            const time=start+(end-start)*i/1000,q=C.strokeTravel(time-start,end-start,offset,true),p=C.boatAt(f,time),base=C.boatAt(old,time);
            if(i){const delta=q-prev;monotonic&&=delta>=-1e-12;minIncrement=Math.min(minIncrement,delta);maxIncrement=Math.max(maxIncrement,delta);}prev=q;
            maxDisplacement=Math.max(maxDisplacement,Math.hypot(p.x-base.x,p.y-base.y));
            if(i===0||i===1000)maxEndpointError=Math.max(maxEndpointError,Math.hypot(p.x-base.x,p.y-base.y),Math.abs(p.scale-base.scale));
          }
          cases.push({film:film.id,start,end,samples:1001,monotonic});
        }
      }
      const derivative=q=>{const t=q*2.8,eps=.0001;return(C.strokeTravel(t+eps,2.8,0,true)-C.strokeTravel(t-eps,2.8,0,true))/(2*eps)*2.8;};
      return{cases,maxDisplacement,maxEndpointError,minIncrement,maxIncrement,pullGain:derivative(.25),returnGain:derivative(.75),before:C.strokeTravel(-1,5),after:C.strokeTravel(8,5)};
    });
    assert.ok(result.cases.every(c=>c.monotonic));assert.ok(result.maxEndpointError<1e-9);assert.ok(result.maxDisplacement>0&&result.maxDisplacement<25);assert.ok(result.minIncrement>0);assert.ok(result.pullGain>1&&result.returnGain<1&&result.returnGain>.7);assert.equal(result.before,0);assert.equal(result.after,1);assert.deepEqual(errors,[]);
    await page.goto(url+'cutscenes.html?travel=even');await page.waitForFunction(()=>window.cutsceneReady);assert.ok(await page.evaluate(()=>CutsceneProduction.films.every(f=>!f.tuning.oarTravel)));
    const report={result:'PASS',...result,errors,note:'같은 경로·시종점·시간에서 작은 전진 박자만 변경. 실제 항력·노 힘·유체 계산은 아님.'};fs.writeFileSync(path.resolve(__dirname,'../output/cutscenes/qa/oar-travel-check.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
