/* 생성 눈 패치 외부 원본 보존과 짧은 깜빡임 순서. 시각 승인은 별도다. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{startServer}=require('./serve.cjs');
(async()=>{
  const {server,url}=await startServer({prefix:'/planning-document/'});let browser;
  try{
    browser=await chromium.launch();const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url+'cutscenes.html');await page.waitForFunction(()=>window.cutsceneReady);
    const result=await page.evaluate(()=>{
      const G=GachisupCinema,base=G.readingFace('open'),c=document.createElement('canvas');c.width=1254;c.height=1254;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(base,0,0);
      const source=ctx.getImageData(0,0,1254,1254).data,states=[];
      for(const state of ['half','closed']){
        ctx.clearRect(0,0,1254,1254);ctx.drawImage(G.readingFace(state),0,0);const data=ctx.getImageData(0,0,1254,1254).data;let changed=0,outside=0,alpha=0,protectedChanges=0;
        for(let y=0;y<1254;y++)for(let x=0;x<1254;x++){
          const i=(y*1254+x)*4,diff=[0,1,2,3].some(k=>source[i+k]!==data[i+k]);if(source[i+3]!==data[i+3])alpha++;
          if(!diff)continue;changed++;if(x<584||x>1006||y<404||y>700)outside++;
          if(y<400||y>710||(x>=816&&x<=860&&y>=625&&y<=670)||x<580||x>1007)protectedChanges++;
        }
        states.push({state,changed,outside,alpha,protectedChanges});
      }
      const times=[-.01,0,.044,.045,.149,.15,.219,.22,1],sequence=times.map(t=>({time:t,state:G.readingBlinkAt(t)}));
      const films=CutsceneProduction.films.map(f=>({id:f.id,start:f.timing.prepareEnd*.36,end:f.timing.prepareEnd*.36+.22,prepareEnd:f.timing.prepareEnd}));
      return{states,sequence,films,openIsOriginal:base===CutsceneActors.images.lookReach};
    });
    for(const s of result.states){assert.ok(s.changed>1000);assert.equal(s.outside,0);assert.equal(s.alpha,0);assert.equal(s.protectedChanges,0);}
    assert.deepEqual(result.sequence.map(x=>x.state),['open','half','half','closed','closed','half','half','open','open']);
    assert.ok(result.openIsOriginal);assert.ok(result.films.every(f=>f.end<f.prepareEnd));assert.deepEqual(errors,[]);
    const report={result:'PASS',...result,errors,note:'두 눈 패치 밖 몸·귀·코·수염·알파 보존. 열린 눈은 원본과 같은 객체. 원본 배경 체크무늬는 패치 범위 밖이므로 소비하지 않는다. 0.22초의 원화 순서이며 연속 눈꺼풀 관절은 아님.'};
    fs.writeFileSync(path.resolve(__dirname,'../output/cutscenes/qa/reading-blink-check.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
