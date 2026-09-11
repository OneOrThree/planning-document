/* 접힘 순서·좌표·갑판 고정 검사. 천 물리나 미술적 자연스러움의 자동 승인은 아니다. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const {startServer}=require('./serve.cjs');
(async()=>{
  const {server,url}=await startServer({prefix:'/planning-document/'});let browser;
  try{
    browser=await chromium.launch();const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url+'cutscenes.html');await page.waitForFunction(()=>window.cutsceneReady);
    const result=await page.evaluate(()=>{
      const A=CutsceneActors,canvas=document.createElement('canvas');canvas.width=720;canvas.height=720;const c=canvas.getContext('2d');
      const records=[],vertices=[];let previous=null,maxStep=0,monotonic=true;
      for(let i=0;i<=1000;i++){
        const s=A.clothFoldAt(i/1000);if(previous)for(const key of ['first','second','gather','carry'])if(s[key]<previous[key])monotonic=false;
        for(const u of [0,.25,.5,.75,1])for(const v of [0,.25,.5,.75,1])vertices.push(A.clothVertex(u,v,s,316));
        if(previous){const p=A.clothVertex(1,1,previous,316),n=A.clothVertex(1,1,s,316);maxStep=Math.max(maxStep,Math.hypot(n.x-p.x,n.y-p.y));}previous=s;
      }
      for(const width of [316,278.08,192.76]){
        c.clearRect(0,0,720,720);c.save();c.translate(360,360);const end=A.clothFold(c,width,1);c.restore();
        const a=c.getImageData(0,0,720,720).data;let colored=0,minX=720,maxX=0,minY=720,maxY=0;
        for(let i=3;i<a.length;i+=4)if(a[i]>100){const p=(i-3)/4,x=p%720,y=Math.floor(p/720);colored++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
        const again=A.clothFold(c,width,4);records.push({width,end,clamped:JSON.stringify(end)===JSON.stringify(again),colored,bounds:{minX,maxX,minY,maxY}});
      }
      return{samples:1001,vertices:vertices.length,finite:vertices.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)),monotonic,maxStep,start:A.clothFoldAt(-1),end:A.clothFoldAt(2),records,defaultEnabled:CutsceneProduction.films.every(f=>f.tuning.clothFold)};
    });
    assert.ok(result.finite);assert.ok(result.monotonic);assert.ok(result.maxStep<2);assert.ok(result.defaultEnabled);
    for(const key of ['first','second','gather','carry']){assert.equal(result.start[key],0);assert.equal(result.end[key],1);}
    for(const r of result.records){assert.ok(r.clamped);assert.ok(r.colored>500);assert.ok(Math.abs(r.end.x/r.width+.31)<1e-12);assert.ok(Math.abs(r.end.y/r.width+.025)<1e-12);assert.ok(r.bounds.maxX<360,'고양이 중앙 공간 침범');}
    await page.goto(url+'cutscenes.html?cloth=shrink');await page.waitForFunction(()=>window.cutsceneReady);assert.ok(await page.evaluate(()=>CutsceneProduction.films.every(f=>!f.tuning.clothFold)));
    assert.deepEqual(errors,[]);const report={result:'PASS',...result,errors,note:'갑판 로컬 좌표와 접힘 시간표 검사. 전신 상호작용·천 물리·미술적 품질의 자동 승인은 아님.'};
    fs.writeFileSync(path.resolve(__dirname,'../output/cutscenes/qa/cloth-check.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
