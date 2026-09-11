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
      const filmIds=new Set(),hashes=[],warnings=[];let packingSamples=0,settlingSamples=0;
      const backgroundChecks=[];
      for(const key of ['room','sand','coastHome','shore']){
        const canvas=document.createElement('canvas');canvas.width=180;canvas.height=320;const ctx=canvas.getContext('2d');ctx.scale(.25,.25);
        const frames=[0,12,24].map(t=>{CutsceneActors.background(ctx,CutsceneActors.images[key],t);return canvas.toDataURL();});
        backgroundChecks.push({key,stable:new Set(frames).size===1});
      }
      for(const f of CutsceneProduction.films){
        filmIds.add(f.id);
        for(let i=0;i<=500;i++){
          const p=GachisupCinema.preparationAt(f,f.timing.prepareEnd*i/500);packingSamples++;
          if(p.lift>0&&p.closing<1)warnings.push(f.id+' 표지 닫기 전 들기');
          if(p.stow>0&&p.lift<1)warnings.push(f.id+' 들기 완료 전 가방에 넣기');
          if(p.shoulder>0&&p.stow<1)warnings.push(f.id+' 책 넣기 완료 전 가방 들기');
          const s=GachisupCinema.settlingAt(f,f.timing.boardingEnd+(f.timing.departureStart-f.timing.boardingEnd)*i/500);settlingSamples++;
          if(s.lift>0&&s.put<1)warnings.push(f.id+' 가방 내려놓기 전 책 꺼내기');
          if(s.open>0&&s.lift<1)warnings.push(f.id+' 책 꺼내기 전 펼치기');
          if(s.place>0&&s.open<1)warnings.push(f.id+' 책 펼치기 전 내려놓기');
          if(s.rise>0&&s.place<1)warnings.push(f.id+' 책 내려놓기 전 고개 들기');
          if(s.grip>0&&s.rise<1)warnings.push(f.id+' 고개 들기 완료 전 노 잡기');
          if(s.grip>0&&s.place<1)warnings.push(f.id+' 책 내려놓기 전 노 잡기');
        }
        for(const t of [0,.8,f.timing.prepareEnd,f.timing.walkEnd,f.timing.boardingEnd,f.timing.departureStart,f.timing.seaStart,24]){
          const m=GachisupCinema.render(c,f,t);
          if(!m.phase||!Number.isFinite(m.catFoot.x)||!Number.isFinite(m.catFoot.y))warnings.push(f.id+' 상태 오류');
          if(t===24&&!m.caption)warnings.push(f.id+' 마지막 프레임 자막 누락');
        }
        GachisupCinema.render(c,f,2.5);hashes.push(c.toDataURL());
      }
      for(const m of CutsceneSprites.manifests){
      for(const [state,rects] of Object.entries(m.frame_layout.rows)){
        if(rects.length!==m.animation.rows[state].frames)warnings.push(state+' 프레임 수 불일치');
        for(const r of rects)if(r.x<0||r.y<0||r.x+r.w>m.frame_layout.sheetWidth||r.y+r.h>m.frame_layout.sheetHeight)warnings.push(state+' 잘린 셀');
      }
      }
      return{ids:filmIds.size,uniquePrepares:new Set(hashes).size,packingSamples,settlingSamples,backgroundChecks,warnings};
    });
    assert.equal(result.ids,9);assert.equal(result.uniquePrepares,9);assert.deepEqual(result.warnings,[]);
    assert.ok(result.backgroundChecks.every(x=>x.stable),'배경만 움직이면 발과 바닥이 분리됩니다.');
    const poseCheck=await page.evaluate(async()=>{
      const data=await CutscenePoses.load(),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
      const steps=Array.from({length:8},(_,i)=>CutscenePoses.draw(ctx,100,180,176,0,{travel:70.4*(i+.01)/8,stride:70.4}));
      const blinks=[-.1,.02,.1,.2,.3].map(t=>CutscenePoses.draw(ctx,100,180,176,0,{neutral:true,blinkTime:t}));
      const jumps=[.08,.18,.3,.5,.8,1.05,1.15].map(t=>CutscenePoses.draw(ctx,100,180,176,0,{jump:t}));
      const reaches=[1,2,3].map(reach=>CutscenePoses.draw(ctx,100,180,176,0,{reach}));
      const gripBlinks=[-.1,.02,.1,.2,.3].map(t=>CutscenePoses.draw(ctx,100,180,176,0,{reach:1,blinkTime:t}));
      const recovery=[.01,.21,.41,.61,.81,1.01].map(recovery=>CutscenePoses.draw(ctx,100,180,176,0,{recovery}));
      return{kind:data.kind,frames:data.frames.length,steps:steps.map(s=>s.frame),blinkFrames:blinks.map(s=>s.blinkFrame),jumpFrames:jumps.map(s=>s.frame),reachHands:reaches.map(s=>s.hand),recoveryFrames:recovery.map(s=>s.frame),recoveryBaselineStable:recovery.every(s=>s.baseline===1142),gripBlinkFrames:gripBlinks.map(s=>s.blinkFrame),gripHandStable:gripBlinks.every(s=>Math.abs(s.hand.x-gripBlinks[0].hand.x)<.01&&Math.abs(s.hand.y-gripBlinks[0].hand.y)<.01),finite:steps.every(s=>Number.isFinite(s.baseline)),status:data.status};
    });
    assert.equal(poseCheck.kind,'individual-pose-sequence');assert.equal(poseCheck.frames,8);assert.deepEqual(poseCheck.steps,[0,1,2,3,4,5,6,7]);
    assert.deepEqual(poseCheck.blinkFrames,[-1,0,1,0,-1]);assert.ok(poseCheck.finite);
    assert.deepEqual(poseCheck.jumpFrames,[0,1,2,3,4,1,0]);
    assert.ok(poseCheck.reachHands.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
    assert.deepEqual(poseCheck.gripBlinkFrames,[-1,0,1,0,-1]);assert.ok(poseCheck.gripHandStable);
    assert.deepEqual(poseCheck.recoveryFrames,[0,1,2,3,4,-1]);assert.ok(poseCheck.recoveryBaselineStable);
    const paddleCheck=await page.evaluate(async()=>{
      await CutscenePaddleRig.ready;
      const ctx=document.createElement('canvas').getContext('2d');
      const options={paddleTime:1.2,grip:1,lean:.08};
      const blinks=[-.1,.02,.1,.2,.3].map(blinkTime=>CutscenePaddleRig.draw(ctx,80,160,176,0,{...options,blinkTime}));
      const loop=Array.from({length:169},(_,i)=>CutscenePaddleRig.draw(ctx,80,160,176,i/60,{grip:1,lean:.08}));
      const start=loop[0],end=loop.at(-1);
      const pickup=[0,.25,.5,.75,1].map(grip=>CutscenePaddleRig.draw(ctx,80,160,176,0,{grip}));
      return{state:start.state,blinkFrames:blinks.map(s=>s.blinkFrame),blinkHandStable:blinks.every(s=>Math.hypot(s.hand.x-blinks[0].hand.x,s.hand.y-blinks[0].hand.y)<1e-8),loopClosure:Math.hypot(start.hand.x-end.hand.x,start.hand.y-end.hand.y),handRange:Math.max(...loop.map(s=>s.hand.x))-Math.min(...loop.map(s=>s.hand.x)),finite:[...loop,...pickup].every(s=>Number.isFinite(s.hand.x)&&Number.isFinite(s.hand.y)),defaultEnabled:CutsceneProduction.films.every(f=>f.tuning.paddleRig===true)};
    });
    assert.equal(paddleCheck.state,'paddle-local-rig');assert.deepEqual(paddleCheck.blinkFrames,[-1,0,1,0,-1]);
    assert.ok(paddleCheck.blinkHandStable);assert.ok(paddleCheck.loopClosure<1e-8);assert.ok(paddleCheck.handRange>5);
    assert.ok(paddleCheck.finite);assert.ok(paddleCheck.defaultEnabled);
    const pickupCheck=await page.evaluate(()=>{
      const c=document.createElement('canvas');c.width=90;c.height=160;let samples=0,waiting=0,maxWaitingDrift=0;
      for(const f of CutsceneProduction.films)for(let i=0;i<=30;i++){
        const t=f.timing.boardingEnd+1.85+i/30*.35,s=GachisupCinema.settlingAt(f,t),m=GachisupCinema.render(c,f,t);samples++;
        if(s.grip<=.65){waiting++;maxWaitingDrift=Math.max(maxWaitingDrift,Math.hypot(m.seat.paddle.pivot.x-43,m.seat.paddle.pivot.y+25));}
      }
      return{samples,waiting,maxWaitingDrift};
    });
    assert.ok(pickupCheck.waiting>0);assert.ok(pickupCheck.maxWaitingDrift<1e-8);
    const pathCheck=await page.evaluate(()=>CutsceneProduction.films.map(f=>{
      const start=GachisupCinema.walkPathAt(f,-1),end=GachisupCinema.walkPathAt(f,10000);
      const expectedStart=f.directionId==='journey'?(f.storyIndex===2?{x:182,y:520}:{x:112,y:423}):f.directionId==='emotion'?{x:180,y:606}:{x:117,y:619};
      const expectedEnd=f.directionId==='journey'?{x:407,y:714}:{x:312,y:581};
      const points=Array.from({length:701},(_,i)=>GachisupCinema.walkPathAt(f,i));
      return{id:f.id,start,end,expectedStart,expectedEnd,continuous:points.slice(1).every((p,i)=>Math.hypot(p.x-points[i].x,p.y-points[i].y)<=1.000001),experimentalWalkDisabled:!f.tuning.walkRig};
    }));
    for(const p of pathCheck){assert.deepEqual(p.start,p.expectedStart);assert.deepEqual(p.end,p.expectedEnd);assert.ok(p.continuous);assert.ok(p.experimentalWalkDisabled);}
    await page.waitForSelector('#exports video');assert.equal(await page.locator('#exports video').count(),9);
    const playback=await page.evaluate(async()=>{
      const v=document.querySelector('#exports video');v.muted=true;await v.play();
      await new Promise(r=>setTimeout(r,650));v.pause();return{duration:v.duration,time:v.currentTime,width:v.videoWidth,height:v.videoHeight};
    });
    const exported=await page.evaluate(()=>window.cutsceneExportBatch.films[0]);
    const exportedVersion=await page.evaluate(()=>window.cutsceneExportBatch.version);
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
    const report={result:'PASS',films:9,packingTimelineSamples:result.packingSamples,settlingTimelineSamples:result.settlingSamples,backgroundRegistration:result.backgroundChecks,individualPoseContract:poseCheck,paddleRigContract:paddleCheck,paddlePickupContract:pickupCheck,walkPathContract:pathCheck,exportedVersion,exportedPlayback:playback,catBodies:6,range:true,errors};
    fs.mkdirSync(path.join(root,'output/cutscenes/qa'),{recursive:true});
    fs.writeFileSync(path.join(root,'output/cutscenes/qa/browser-check.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify(report,null,2));
  }finally{if(browser)await browser.close();if(own)await new Promise(r=>own.server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
