/* 부두 앞발의 연속 좌표와 고정 얼굴 검사. 미술적 자연스러움은 별도 시각 검토한다. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const {startServer}=require('./serve.cjs');
(async()=>{
  const {server,url}=await startServer({prefix:'/planning-document/'});let browser;
  try{
    browser=await chromium.launch();const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url+'cutscenes.html');await page.waitForFunction(()=>window.cutsceneReady);
    const result=await page.evaluate(()=>{
      const R=CutscenePaddleRig,canvas=document.createElement('canvas');canvas.width=1254;canvas.height=1254;const c=canvas.getContext('2d'),hands=[];
      let maxStep=0,maxHandY=-Infinity,headChanges=0,base=null;
      for(let i=0;i<=1000;i++){
        c.clearRect(0,0,1254,1254);const m=R.draw(c,0,0,176,0,{dockProgress:i/1000,blinkTime:-1}),last=hands.at(-1);if(last)maxStep=Math.max(maxStep,Math.hypot(m.hand.x-last.x,m.hand.y-last.y));hands.push(m.hand);maxHandY=Math.max(maxHandY,m.hand.y);
      }
      for(const q of [0,.25,.5,.75,1]){
        c.clearRect(0,0,1254,1254);R.draw(c,670.218,1142,384/.300488,0,{dockProgress:q,blinkTime:-1});const pixels=c.getImageData(0,0,1254,720).data;
        if(!base)base=pixels;else for(let i=0;i<pixels.length;i++)if(pixels[i]!==base[i])headChanges++;
      }
      const open=R.draw(c,0,0,176,0,{dockProgress:.55,blinkTime:-1}),closed=R.draw(c,0,0,176,0,{dockProgress:.55,blinkTime:.1});
      return{samples:hands.length,finite:hands.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)),maxStep,maxHandY,headChanges,endpointError:Math.hypot(hands[0].x-hands.at(-1).x,hands[0].y-hands.at(-1).y),blinkHandError:Math.hypot(open.hand.x-closed.hand.x,open.hand.y-closed.hand.y),defaultEnabled:CutsceneProduction.films.every(f=>f.tuning.dockRig)};
    });
    assert.ok(result.finite);assert.ok(result.maxStep<1);assert.ok(result.maxHandY<.5);assert.equal(result.headChanges,0);assert.equal(result.endpointError,0);assert.equal(result.blinkHandError,0);assert.ok(result.defaultEnabled);
    await page.goto(url+'cutscenes.html?dock=pose');await page.waitForFunction(()=>window.cutsceneReady);assert.ok(await page.evaluate(()=>CutsceneProduction.films.every(f=>!f.tuning.dockRig)));assert.deepEqual(errors,[]);
    const report={result:'PASS',...result,errors,note:'같은 몸체·앞발 파츠의 국소 관절. 전신·양손·밧줄 역학의 자동 승인은 아님.'};fs.writeFileSync(path.resolve(__dirname,'../output/cutscenes/qa/dock-check.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
