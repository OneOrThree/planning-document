/* 실제 브라우저 필터를 검사한다. 색 수치 검사는 시각 검토 회차가 아니다. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const {startServer}=require('./serve.cjs');
(async()=>{
  const {server,url}=await startServer({prefix:'/planning-document/'});let browser;
  try{
    browser=await chromium.launch();const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url+'cutscenes.html');await page.waitForFunction(()=>window.cutsceneReady);
    const result=await page.evaluate(async()=>{
      const palette=CutsceneFurPalette,files=[...Object.keys(palette.medians),...Object.keys(palette.eyeOutlines)],records=[];
      const median=a=>a.sort((x,y)=>x-y)[Math.floor(a.length/2)];
      for(const file of files){
        const image=new Image();image.src='assets/cutscenes/poses-black/'+file;await image.decode();
        const raw=document.createElement('canvas');raw.width=image.width;raw.height=image.height;const ctx=raw.getContext('2d');ctx.drawImage(image,0,0);
        const graded=palette.prepare(image,file),source=ctx.getImageData(0,0,raw.width,raw.height).data,after=graded.getContext('2d').getImageData(0,0,raw.width,raw.height).data;
        let alphaChanges=0,whiteDifference=0,whiteSamples=0;const fur=[[],[],[]],lines=[[],[],[]];
        for(let i=3;i<source.length;i+=4)if(source[i]!==after[i])alphaChanges++;
        for(let i=0;i<source.length;i+=28){
          if(source[i+3]!==255)continue;const rgb=Array.from(source.slice(i,i+3));
          if(Math.min(...rgb)>38&&Math.max(...rgb)<130&&Math.max(...rgb)-Math.min(...rgb)<45)for(let ch=0;ch<3;ch++)fur[ch].push(after[i+ch]);
          if(rgb[0]>25&&rgb[0]<160&&rgb[1]<25&&rgb[2]<25)for(let ch=0;ch<3;ch++)lines[ch].push(after[i+ch]);
          if(rgb[0]>245&&rgb[1]>240&&rgb[2]>230){whiteSamples++;whiteDifference+=rgb.reduce((n,v,ch)=>n+Math.abs(v-after[i+ch]),0)/3;}
        }
        records.push({file,alphaChanges,furMedian:fur[0].length?fur.map(median):null,lineMedian:lines.map(median),meanWhiteDifference:whiteSamples?whiteDifference/whiteSamples:0,whiteSamples,profile:palette.profile(file)});
      }
      const neutral=new Image();neutral.src='assets/cutscenes/poses-black/neutral-forward-v1.png';await neutral.decode();
      const rendererLookKeys=['lookDown','lookReach','lookHold','lookPlace'];
      return{enabled:palette.enabled,rendererLookGraded:rendererLookKeys.every(key=>CutsceneActors.images[key] instanceof HTMLCanvasElement),backgroundsUnchanged:['room','sand','shore','coastHome','deck','paddle'].every(key=>CutsceneActors.images[key] instanceof HTMLImageElement),unchangedNeutral:palette.prepare(neutral,'neutral-forward-v1.png')===neutral,unchangedUnlisted:palette.prepare(neutral,'another-cat.png')===neutral,records};
    });
    assert.ok(result.enabled);assert.ok(result.unchangedNeutral);assert.ok(result.unchangedUnlisted);assert.ok(result.rendererLookGraded);assert.ok(result.backgroundsUnchanged);
    for(const r of result.records){
      assert.equal(r.alphaChanges,0,r.file+' 알파 변경');
      if(r.furMedian&&!r.file.startsWith('walk-eyes-'))assert.ok(r.furMedian.every((v,i)=>Math.abs(v-[77,69,69][i])<=3),r.file+' 털색 기준 불일치: '+r.furMedian);
      assert.ok(Math.abs(r.lineMedian[0]-43)<=5,r.file+' 외곽선 불일치: '+r.lineMedian);
      assert.ok(r.meanWhiteDifference<10,r.file+' 눈 흰자·발톱 과도한 감광');
    }
    await page.goto(url+'cutscenes.html?tone=source');await page.waitForFunction(()=>window.cutsceneReady);assert.equal(await page.evaluate(()=>CutsceneFurPalette.enabled),false);
    assert.deepEqual(errors,[]);const report={result:'PASS',...result,sourceComparisonAvailable:true,errors};
    fs.writeFileSync(path.resolve(__dirname,'../output/cutscenes/qa/fur-color-check.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify({result:'PASS',profiles:result.records.length,alphaChanges:0,maxFurError:Math.max(...result.records.filter(r=>r.furMedian&&!r.file.startsWith('walk-eyes-')).flatMap(r=>r.furMedian.map((v,i)=>Math.abs(v-[77,69,69][i])))),errors}));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
