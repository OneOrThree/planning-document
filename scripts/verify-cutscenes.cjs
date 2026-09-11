const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const {startServer}=require('./serve.cjs');
const root=path.resolve(__dirname,'..');
(async()=>{
  const own=process.env.BASE_URL?null:await startServer({prefix:'/planning-document/'}),url=process.env.BASE_URL||own.url;
  let browser;
  try{
    browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url+'cutscenes.html');await page.waitForFunction(()=>window.cutsceneReady);
    assert.equal(await page.locator('#choices button').count(),9);
    await page.locator('#choices button').nth(8).click();assert.match(page.url(),/film=unfinished-pier-storybook/);
    assert.equal(await page.locator('#choices button[aria-pressed="true"]').count(),1);
    await page.reload();await page.waitForFunction(()=>window.cutsceneReady);
    assert.equal(await page.locator('#choices button').nth(8).getAttribute('aria-pressed'),'true');
    const result=await page.evaluate(()=>{
      const c=document.getElementById('film');c.width=180;c.height=320;
      const filmIds=new Set(),hashes=[],warnings=[];
      for(const f of CutsceneProduction.films){
        filmIds.add(f.id);
        for(const t of [0,.8,f.timing.prepareEnd,f.timing.walkEnd,f.timing.boardingEnd,f.timing.departureStart,f.timing.seaStart,24]){
          const m=GachisupCinema.render(c,f,t);
          if(!m.phase||!Number.isFinite(m.catFoot.x)||!Number.isFinite(m.catFoot.y))warnings.push(f.id+' 상태 오류');
        }
        GachisupCinema.render(c,f,2.5);hashes.push(c.toDataURL());
      }
      for(const m of CutsceneSprites.manifests){
      for(const [state,rects] of Object.entries(m.frame_layout.rows)){
        if(rects.length!==m.animation.rows[state].frames)warnings.push(state+' 프레임 수 불일치');
        for(const r of rects)if(r.x<0||r.y<0||r.x+r.w>m.frame_layout.sheetWidth||r.y+r.h>m.frame_layout.sheetHeight)warnings.push(state+' 잘린 셀');
      }
      }
      return{ids:filmIds.size,uniquePrepares:new Set(hashes).size,warnings};
    });
    assert.equal(result.ids,9);assert.equal(result.uniquePrepares,9);assert.deepEqual(result.warnings,[]);
    await page.waitForSelector('#exports video');assert.equal(await page.locator('#exports video').count(),9);
    const playback=await page.evaluate(async()=>{
      const v=document.querySelector('#exports video');v.muted=true;await v.play();
      await new Promise(r=>setTimeout(r,650));v.pause();return{duration:v.duration,time:v.currentTime,width:v.videoWidth,height:v.videoHeight};
    });
    const exported=await page.evaluate(()=>window.cutsceneExportBatch.films[0]);
    assert.equal(playback.duration,exported.duration);assert.ok(playback.time>.2);assert.equal(playback.width,exported.width);assert.equal(playback.height,exported.height);
    const mp4=await page.locator('#exports video source').first().getAttribute('src');
    const range=await fetch(url+mp4,{headers:{Range:'bytes=0-63'}});assert.equal(range.status,206);assert.equal(range.headers.get('content-type'),'video/mp4');assert.equal((await range.arrayBuffer()).byteLength,64);
    const suffix=await fetch(url+mp4,{headers:{Range:'bytes=-32'}});assert.equal(suffix.status,206);assert.equal((await suffix.arrayBuffer()).byteLength,32);
    const bad=await fetch(url+mp4,{headers:{Range:'bytes=8-2'}});assert.equal(bad.status,416);
    await page.selectOption('#export-version','draft-v01');await page.waitForFunction(()=>window.cutsceneExportBatch?.version==='draft-v01');assert.equal(await page.locator('#exports video').count(),9);
    await page.goto(url+'figma-cats.html');assert.equal(await page.locator('#cat-grid .body').count(),6);
    await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
    assert.equal(await page.locator('[data-cat="white"] .body').getAttribute('src'),'assets/figma-cats/white-standing-generated.png');
    assert.deepEqual(errors,[]);
    const report={result:'PASS',films:9,exportedPlayback:playback,catBodies:6,range:true,errors};
    fs.mkdirSync(path.join(root,'output/cutscenes/qa'),{recursive:true});
    fs.writeFileSync(path.join(root,'output/cutscenes/qa/browser-check.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify(report,null,2));
  }finally{if(browser)await browser.close();if(own)await new Promise(r=>own.server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
