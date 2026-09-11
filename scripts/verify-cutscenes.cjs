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
      // 카메라·지면 등록은 정지 기준판. 물·하늘의 변경 범위는 각각 별도로 검사한다.
      const previousWater=CutsceneSettings.waterMotion,previousBirds=CutsceneSettings.seabirds;CutsceneSettings.waterMotion=false;CutsceneSettings.seabirds=false;
      for(const key of ['room','sand','coastHome','shore']){
        const canvas=document.createElement('canvas');canvas.width=180;canvas.height=320;const ctx=canvas.getContext('2d');ctx.scale(.25,.25);
        const frames=[0,12,24].map(t=>{CutsceneActors.background(ctx,CutsceneActors.images[key],t);return canvas.toDataURL();});
        backgroundChecks.push({key,stable:new Set(frames).size===1});
      }
      CutsceneSettings.waterMotion=previousWater;CutsceneSettings.seabirds=previousBirds;
      for(const f of CutsceneProduction.films){
        filmIds.add(f.id);
        for(let i=0;i<=500;i++){
          const p=GachisupCinema.preparationAt(f,f.timing.prepareEnd*i/500);packingSamples++;
          if(p.lift>0&&p.closing<1)warnings.push(f.id+' 표지 닫기 전 들기');
          if(p.stow>0&&p.lift<1)warnings.push(f.id+' 들기 완료 전 가방에 넣기');
          if(p.shoulder>0&&p.stow<1)warnings.push(f.id+' 책 넣기 완료 전 가방 들기');
          if(p.bagClosure>0&&p.stow<1)warnings.push(f.id+' 책 넣기 완료 전 덮개 닫기');
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
    const waterSurfaceCheck=await page.evaluate(()=>{
      const previousBirds=CutsceneSettings.seabirds;CutsceneSettings.seabirds=false;
      const results=[],canvas=()=>{const c=document.createElement('canvas');c.width=960;c.height=1280;return c;};
      for(const scene of ['shore','home']){
        const source=CutsceneActors.images[scene==='shore'?'shore':'coastHome'],mask=canvas(),m=mask.getContext('2d');
        m.beginPath();CutsceneWaterMotion.boundaries[scene].forEach(([x,y],i)=>i?m.lineTo(x,y):m.moveTo(x,y));m.closePath();m.fill();const alpha=m.getImageData(0,0,960,1280).data;
        const base=canvas(),c=base.getContext('2d');CutsceneSettings.waterMotion=false;CutsceneActors.background(c,source,0);const original=c.getImageData(0,0,960,1280).data;
        CutsceneSettings.waterMotion=true;
        for(const time of [0,2,4,6]){
          CutsceneActors.background(c,source,time);const pixels=c.getImageData(0,0,960,1280).data;let outsideChanged=0,insideChanged=0;
          for(let i=0;i<pixels.length;i+=4){if(pixels[i]!==original[i]||pixels[i+1]!==original[i+1]||pixels[i+2]!==original[i+2]||pixels[i+3]!==original[i+3]){if(alpha[i+3]===0)outsideChanged++;else insideChanged++;}}
          results.push({scene,time,outsideChanged,insideChanged});
        }
      }
      let maxOffset=0,maxStep=0;for(let y=304;y<=1280;y+=8)for(let frame=0;frame<=576;frame++){const t=frame/24,v=CutsceneWaterMotion.offset(y,t);maxOffset=Math.max(maxOffset,Math.abs(v));maxStep=Math.max(maxStep,Math.abs(v-CutsceneWaterMotion.offset(y,t+1/24)));}
      CutsceneSettings.seabirds=previousBirds;
      return{results,maxOffset,maxStep,defaultEnabled:CutsceneProduction.films.every(f=>f.tuning.waterMotion&&f.tuning.raftContact)};
    });
    assert.ok(waterSurfaceCheck.results.every(r=>r.outsideChanged===0),'물 마스크 밖의 집·부두·육지는 원본 픽셀을 유지해야 합니다.');
    assert.ok(waterSurfaceCheck.results.every(r=>r.insideChanged>1000));assert.ok(waterSurfaceCheck.maxOffset<3.2);assert.ok(waterSurfaceCheck.maxStep<.11);assert.ok(waterSurfaceCheck.defaultEnabled);
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
    const landingCheck=await page.evaluate(async()=>{
      const data=await CutscenePoses.load(),c=document.createElement('canvas').getContext('2d');
      const phases=[.01,.34,.68,1.01].map(landing=>CutscenePoses.draw(c,100,180,176,0,{landing}));
      const registrations=await Promise.all([...data.jump,...data.landing].map(f=>new Promise((resolve,reject)=>{
        const im=new Image();im.onerror=()=>reject(Error(f.file));im.onload=()=>{
          const canvas=document.createElement('canvas');canvas.width=im.width;canvas.height=im.height;const ctx=canvas.getContext('2d');ctx.drawImage(im,0,0);const pixels=ctx.getImageData(0,0,im.width,im.height).data;
          let bottom=-1;for(let y=im.height-1;y>=0&&bottom<0;y--)for(let x=0;x<im.width;x++)if(pixels[(y*im.width+x)*4+3]>128){bottom=y;break;}
          resolve({file:f.file,originY:f.originY,opaqueBottom:bottom,error:Math.abs(bottom-f.originY)});
        };im.src='assets/cutscenes/poses-black/'+f.file;
      })));
      return{states:phases.map(p=>p.state),frames:phases.map(p=>p.frame),registrations};
    });
    assert.ok(landingCheck.states.every(s=>s==='landing-individual-poses'));assert.deepEqual(landingCheck.frames,[0,1,2,-1]);
    assert.ok(landingCheck.registrations.every(r=>r.error<=1),'승선 자세는 실제 원화 발바닥과 등록선이 일치해야 합니다.');
    const paddleCheck=await page.evaluate(async()=>{
      await CutscenePaddleRig.ready;
      const ctx=document.createElement('canvas').getContext('2d');
      const options={paddleTime:1.2,grip:1,lean:.08};
      const blinks=[-.1,.02,.1,.2,.3].map(blinkTime=>CutscenePaddleRig.draw(ctx,80,160,176,0,{...options,blinkTime}));
      // 출항의 첫 0.55초는 진입 보간이다. 이후 정상 상태 한 주기의 폐합을 검사한다.
      const loop=Array.from({length:169},(_,i)=>CutscenePaddleRig.draw(ctx,80,160,176,2.8+i/60,{grip:1,lean:.08}));
      const start=loop[0],end=loop.at(-1);
      const pickup=[0,.25,.5,.75,1].map(grip=>CutscenePaddleRig.draw(ctx,80,160,176,0,{grip}));
      return{state:start.state,blinkFrames:blinks.map(s=>s.blinkFrame),blinkHandStable:blinks.every(s=>Math.hypot(s.hand.x-blinks[0].hand.x,s.hand.y-blinks[0].hand.y)<1e-8),loopClosure:Math.hypot(start.hand.x-end.hand.x,start.hand.y-end.hand.y),handRange:Math.max(...loop.map(s=>s.hand.x))-Math.min(...loop.map(s=>s.hand.x)),finite:[...loop,...pickup].every(s=>Number.isFinite(s.hand.x)&&Number.isFinite(s.hand.y)),defaultEnabled:CutsceneProduction.films.every(f=>f.tuning.paddleRig===true)};
    });
    assert.equal(paddleCheck.state,'paddle-local-rig');assert.deepEqual(paddleCheck.blinkFrames,[-1,0,1,0,-1]);
    assert.ok(paddleCheck.blinkHandStable);assert.ok(paddleCheck.loopClosure<1e-8);assert.ok(paddleCheck.handRange>5);
    assert.ok(paddleCheck.finite);assert.ok(paddleCheck.defaultEnabled);
    const paddleWeightCheck=await page.evaluate(()=>{
      const weights=Array.from({length:1001},(_,i)=>CutscenePaddleRig.weightAt(i*5.6/1000,1,true));
      const baselineError=Math.max(...weights.map(w=>Math.abs(820+w.shear*1142-w.shear*w.baseline-820)));
      const stationary=[-2,-1,0].map(t=>CutscenePaddleRig.weightAt(t,1,true));
      const ungipped=CutscenePaddleRig.weightAt(1.4,0,true),disabled=CutscenePaddleRig.weightAt(1.4,1,false);
      return{samples:weights.length,baselineError,maxShear:Math.max(...weights.map(w=>Math.abs(w.shear))),maxAdjacentShear:Math.max(...weights.slice(1).map((w,i)=>Math.abs(w.shear-weights[i].shear))),stationary:stationary.every(w=>w.shear===0),ungripped:ungipped.shear===0,disabled:disabled.shear===0,defaultEnabled:CutsceneProduction.films.every(f=>f.tuning.paddleWeight===true)};
    });
    assert.ok(paddleWeightCheck.baselineError<1e-8);assert.ok(paddleWeightCheck.maxShear<=.0375);assert.ok(paddleWeightCheck.maxAdjacentShear<.002);assert.ok(paddleWeightCheck.stationary&&paddleWeightCheck.ungripped&&paddleWeightCheck.disabled&&paddleWeightCheck.defaultEnabled);
    const pickupCheck=await page.evaluate(()=>{
      const c=document.createElement('canvas');c.width=90;c.height=160;let samples=0,waiting=0,maxWaitingDrift=0;
      for(const f of CutsceneProduction.films)for(let i=0;i<=30;i++){
        const t=f.timing.boardingEnd+2.01+i/30*.35,s=GachisupCinema.settlingAt(f,t),m=GachisupCinema.render(c,f,t);samples++;
        if(s.grip<=.65){waiting++;maxWaitingDrift=Math.max(maxWaitingDrift,Math.hypot(m.seat.paddle.pivot.x-46,m.seat.paddle.pivot.y+8));}
      }
      return{samples,waiting,maxWaitingDrift};
    });
    assert.ok(pickupCheck.waiting>0);assert.ok(pickupCheck.maxWaitingDrift<1e-8);
    const paddleWaterCheck=await page.evaluate(()=>{
      let maxContactError=0,minFeather=1,maxImmersion=0;const warnings=[];
      for(let i=0;i<=1000;i++){
        const cycle=i/1000,m=CutscenePaddleRig.motionAt(cycle*2.8),angle=-1.02+m.stroke*.39-m.lift*.64,pivot={x:42,y:-38};
        const w=CutsceneActors.paddleWaterAt(cycle,pivot,angle,1),rest=CutsceneActors.paddleWaterAt(cycle,pivot,angle,0);
        if(![w.wet,w.feather,w.immersion,w.contact.x,w.contact.y].every(Number.isFinite))warnings.push('비정상 수면 값');
        if(cycle>=.64&&w.immersion!==0)warnings.push('복귀 중 입수');
        if(rest.immersion!==0||rest.feather!==1)warnings.push('대기 노에 수면 효과');
        if(w.immersion>0&&w.surfaceY<=pivot.y+50)warnings.push('수면이 손잡이에 접근');
        const dx=w.contact.x-pivot.x,dy=w.contact.y-pivot.y;
        maxContactError=Math.max(maxContactError,Math.abs(dx*Math.cos(angle)+dy*Math.sin(angle)));
        minFeather=Math.min(minFeather,w.feather);maxImmersion=Math.max(maxImmersion,w.immersion);
      }
      return{samples:1001,maxContactError,minFeather,maxImmersion,warnings,note:'노 축과 입수 접점·복귀 분리만 검사. 물리 시뮬레이션이나 시각 승인이 아님.'};
    });
    assert.deepEqual(paddleWaterCheck.warnings,[]);assert.ok(paddleWaterCheck.maxContactError<1e-8);
    assert.ok(paddleWaterCheck.minFeather>=.239&&paddleWaterCheck.minFeather<.25);assert.equal(paddleWaterCheck.maxImmersion,16);
    const coastCameraCheck=await page.evaluate(()=>{
      const c=document.createElement('canvas');c.width=72;c.height=128;const films=[];
      for(const f of CutsceneProduction.films){
        let minRightMargin=720,maxCameraStep=0,previous=null;const warnings=[];
        for(let i=0;i<=240;i++){
          const t=f.timing.departureStart+(24-f.timing.departureStart)*i/240,m=GachisupCinema.render(c,f,t),cam=m.camera;
          const tipX=360+(m.seat.paddle.worldTip.x-cam.x)*cam.z;
          minRightMargin=Math.min(minRightMargin,720-tipX);
          if(cam.x-360/cam.z<-.001||cam.x+360/cam.z>CutsceneActors.coastWidth+.001)warnings.push('배경 가로 범위 밖');
          if(cam.y-640/cam.z<-.001||cam.y+640/cam.z>1280.001)warnings.push('배경 세로 범위 밖');
          if(previous)maxCameraStep=Math.max(maxCameraStep,Math.hypot(cam.x-previous.x,cam.y-previous.y));previous=cam;
        }
        films.push({id:f.id,samples:241,minRightMargin,maxCameraStep,warnings});
      }
      return{worldWidth:CutsceneActors.coastWidth,films,note:'입수 기준점의 화면 여유와 카메라 범위 검사. 원화의 부두·발 접촉은 확대 캡처로 별도 확인.'};
    });
    assert.equal(coastCameraCheck.worldWidth,960);
    for(const f of coastCameraCheck.films){assert.deepEqual(f.warnings,[]);assert.ok(f.minRightMargin>16,f.id+' 노 끝이 화면 가장자리에 너무 가깝습니다.');assert.ok(f.maxCameraStep<8,f.id+' 출항 카메라가 튑니다.');}
    const pathCheck=await page.evaluate(()=>CutsceneProduction.films.map(f=>{
      const start=GachisupCinema.walkPathAt(f,-1),end=GachisupCinema.walkPathAt(f,10000);
      const expectedStart=f.directionId==='journey'?(f.storyIndex===2?{x:182,y:520}:{x:112,y:423}):f.directionId==='emotion'?{x:180,y:606}:{x:117,y:619};
      const expectedEnd=f.directionId==='journey'?{x:407,y:714}:{x:284,y:581};
      const points=Array.from({length:701},(_,i)=>GachisupCinema.walkPathAt(f,i));
      return{id:f.id,start,end,expectedStart,expectedEnd,continuous:points.slice(1).every((p,i)=>Math.hypot(p.x-points[i].x,p.y-points[i].y)<=1.000001),localWalkEnabled:f.tuning.walkRig===true};
    }));
    for(const p of pathCheck){assert.deepEqual(p.start,p.expectedStart);assert.deepEqual(p.end,p.expectedEnd);assert.ok(p.continuous);assert.ok(p.localWalkEnabled);}
    const walkPlantCheck=await page.evaluate(()=>{
      let stancePairs=0,maxPlantDrift=0,maxTargetStep=0,samples=0;const warnings=[];
      for(const f of CutsceneProduction.films){
        let previous;const rigSize=f.directionId==='journey'?(f.storyIndex===2?157:141):176;
        for(let i=0;i<=900;i++){
          const travel=i*.5,p=GachisupCinema.walkPathAt(f,travel),size=rigSize*(1+.1*i/900);
          const feet=CutsceneWalkRig.targets(p.x,p.y,size,{travel,rigSize,rigStride:rigSize*.27,walk:1,pathAtDistance:d=>GachisupCinema.walkPathAt(f,d)});samples++;
          for(const [j,foot]of feet.entries()){
            if(!Number.isFinite(foot.foot.x)||!Number.isFinite(foot.foot.y))warnings.push(f.id+' 발 좌표 비정상');
            if(previous){
              const old=previous[j],drift=Math.hypot(foot.foot.x-old.foot.x,foot.foot.y-old.foot.y);maxTargetStep=Math.max(maxTargetStep,drift);
              if(foot.stance&&old.stance&&foot.step===old.step){stancePairs++;maxPlantDrift=Math.max(maxPlantDrift,drift);}
            }
          }
          previous=feet;
        }
      }
      return{samples,stancePairs,maxPlantDrift,maxTargetStep,warnings,note:'접지 목표 좌표 검사. 원화의 윤곽·관절 연결을 시각 승인하지 않음.'};
    });
    assert.deepEqual(walkPlantCheck.warnings,[]);assert.ok(walkPlantCheck.stancePairs>0);
    assert.ok(walkPlantCheck.maxPlantDrift<1e-8,'몸체 원근 크기가 변해도 심어 둔 발 목표는 움직이지 않아야 합니다.');
    assert.ok(walkPlantCheck.maxTargetStep<3,'0.5 거리 이동에서 발 목표가 순간 이동하면 안 됩니다.');
    const walkBlinkCheck=await page.evaluate(()=>{
      const c=document.createElement('canvas');c.width=600;c.height=600;const ctx=c.getContext('2d'),times=[-1,.02,.1,.19,.3],states=[],pixels=[];
      for(const blinkTime of times){ctx.clearRect(0,0,600,600);states.push(CutsceneWalkRig.draw(ctx,280,450,384,2,{travel:20,walk:1,blinkTime}));pixels.push(ctx.getImageData(0,0,600,600).data);}
      const reg=.300488,allowed={left:280+(580-670.218)*reg,right:280+(1020-670.218)*reg,top:450+(400-1142)*reg-3,bottom:450+(695-1142)*reg};
      let changedOutsideEyes=0,changedInsideEyes=0;
      for(const frame of pixels.slice(1))for(let i=0;i<frame.length;i+=4){
        if(frame[i]===pixels[0][i]&&frame[i+1]===pixels[0][i+1]&&frame[i+2]===pixels[0][i+2]&&frame[i+3]===pixels[0][i+3])continue;
        const x=(i/4)%600,y=Math.floor(i/4/600);if(x<allowed.left||x>allowed.right||y<allowed.top||y>allowed.bottom)changedOutsideEyes++;else changedInsideEyes++;
      }
      const actualFilms=CutsceneProduction.films.map(f=>{const m=GachisupCinema.render(c,f,f.timing.prepareEnd+1.0);return{id:f.id,state:m.actorState.state,blinkFrame:m.actorState.blinkFrame};});
      return{blinkFrames:states.map(s=>s.blinkFrame),feetStable:states.every(s=>JSON.stringify(s.feet)===JSON.stringify(states[0].feet)),changedOutsideEyes,changedInsideEyes,actualFilms};
    });
    assert.deepEqual(walkBlinkCheck.blinkFrames,[-1,0,1,0,-1]);assert.ok(walkBlinkCheck.feetStable);assert.equal(walkBlinkCheck.changedOutsideEyes,0);assert.ok(walkBlinkCheck.changedInsideEyes>0);
    for(const f of walkBlinkCheck.actualFilms){assert.equal(f.state,'walk-local-rig');assert.equal(f.blinkFrame,1);}
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
    await page.selectOption('#export-version','draft-v01');await page.waitForFunction(()=>window.cutsceneExportBatch?.version==='draft-v01');assert.equal(await page.locator('#exports video').count(),0);
    assert.equal(await page.locator('#exports .archive-link').count(),9);assert.match(await page.locator('#exports .archive-link').first().getAttribute('href'),/^https:\/\/github\.com\/OneOrThree\/planning-document\/blob\/main\/output\/cutscenes\/videos\/draft-v01\/.*\.mp4\?raw=1$/);
    await page.goto(url+'figma-cats.html');assert.equal(await page.locator('#cat-grid .body').count(),6);
    await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
    assert.equal(await page.locator('[data-cat="white"] .body').getAttribute('src'),'assets/figma-cats/white-standing-generated.png');
    assert.deepEqual(errors,[]);
    const report={result:'PASS',films:9,packingTimelineSamples:result.packingSamples,settlingTimelineSamples:result.settlingSamples,backgroundRegistration:result.backgroundChecks,waterSurfaceContract:waterSurfaceCheck,individualPoseContract:poseCheck,landingContract:landingCheck,paddleRigContract:paddleCheck,paddleWeightContract:paddleWeightCheck,paddlePickupContract:pickupCheck,paddleWaterContract:paddleWaterCheck,coastCameraContract:coastCameraCheck,walkPathContract:pathCheck,walkPlantContract:walkPlantCheck,walkBlinkContract:walkBlinkCheck,exportedVersion,exportedPlayback:playback,catBodies:6,range:true,errors};
    fs.mkdirSync(path.join(root,'output/cutscenes/qa'),{recursive:true});
    fs.writeFileSync(path.join(root,'output/cutscenes/qa/browser-check.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify(report,null,2));
  }finally{if(browser)await browser.close();if(own)await new Promise(r=>own.server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
