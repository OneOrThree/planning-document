/* 꼬리 국소 관절: 얼굴·손 불변과 변환 연속성을 확인한다. 자연스러움 승인은 별도다. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const {startServer}=require('./serve.cjs');
(async()=>{
  const {server,url}=await startServer({prefix:'/planning-document/'});let browser;
  try{
    browser=await chromium.launch();const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url+'cutscenes.html');await page.waitForFunction(()=>window.cutsceneReady);
    const result=await page.evaluate(()=>{
      const R=CutscenePaddleRig,canvas=document.createElement('canvas');canvas.width=1254;canvas.height=1254;const c=canvas.getContext('2d');
      let maxAngle=0,maxStep=0,prior=null,headChanges=0,handError=0,changed=0;const cases=[];
      for(let i=0;i<=576;i++){
        const angle=R.tailAt(i/24).angle;maxAngle=Math.max(maxAngle,Math.abs(angle));if(prior!==null)maxStep=Math.max(maxStep,Math.abs(angle-prior));prior=angle;
      }
      for(const time of [0,.3,1,2.4,8,16,23.5])for(const blinkTime of [-1,.02,.1]){
        const draw=tailRig=>{c.clearRect(0,0,1254,1254);const state=R.draw(c,670.218,1142,384/.300488,time,{tailRig,weightShift:false,blinkTime});return{state,pixels:c.getImageData(0,0,1254,1254).data};};
        const a=draw(false),b=draw(true);let diff=0;
        for(let y=0;y<1254;y++)for(let x=0;x<1254;x++){
          const p=(y*1254+x)*4,different=[0,1,2,3].some(k=>a.pixels[p+k]!==b.pixels[p+k]);
          if(different){diff++;if(x>=350&&x<=1050&&y<720&&a.pixels[p+3]>250)headChanges++;}
        }
        handError=Math.max(handError,Math.hypot(a.state.hand.x-b.state.hand.x,a.state.hand.y-b.state.hand.y));changed+=diff;cases.push({time,blinkTime,changedPixels:diff});
      }
      return{samples:577,maxAngle,maxStep,headChanges,handError,changed,cases};
    });
    assert.ok(result.maxAngle<.051);assert.ok(result.maxStep<.004);assert.equal(result.headChanges,0);assert.equal(result.handError,0);assert.ok(result.changed>0);assert.deepEqual(errors,[]);
    const report={result:'PASS',...result,errors,note:'고정 원화 얼굴의 불투명 영역과 손 접점 보존. 꼬리 관절 하나이며 전신·물리·다른 자세 꼬리 리깅은 아님.'};
    fs.writeFileSync(path.resolve(__dirname,'../output/cutscenes/qa/tail-check.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
