const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.VILLAGE_URL||(process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '');
const ids=['puppy','capybara','red-panda','golden'];
let count=0;
const ok=(value,label)=>{assert.ok(value,label);count++;console.log('✓ '+label);};
const frame=page=>page.locator('#character-mount canvas').evaluate(canvas=>{
  const copy=document.createElement('canvas');copy.width=canvas.width;copy.height=canvas.height;
  const ctx=copy.getContext('2d');ctx.drawImage(canvas,0,0);const pixels=ctx.getImageData(0,0,copy.width,copy.height).data;
  let hash=2166136261;for(let i=0;i<pixels.length;i+=4){hash=Math.imul(hash^pixels[i],16777619);hash=Math.imul(hash^pixels[i+3],16777619);}return hash>>>0;
});
(async()=>{
  const browser=await chromium.launch();
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base+'/rig.html');
    ok(await page.locator('#character-select option').count()===5,'작업실 다섯 친구 드롭다운');
    for(const id of ids){
      await page.selectOption('#character-select',id);
      await page.locator('#character-mount[data-rig-state=ready]').waitFor();
      ok(await page.locator(`#character-mount[data-character="${id}"] canvas`).count()===1,id+' 정적 시안 대신 실제 메시 리그');
      const metadata=await page.evaluate(id=>{
        const profile=GachisupReadingProfiles[id];return {source:profile.source,closedSource:profile.closedSource||null,bones:Object.keys(profile.bones),eyes:profile.eyes.length,controls:profile.controls};
      },id);
      ok(metadata.bones.length>=8&&metadata.eyes===2,id+' 전용 다관절·양쪽 눈 설정');
      ok(await page.locator('#joint-controls input').count()===metadata.controls.length,id+' 전용 수동 관절 컨트롤');
      ok(await page.locator('#blink').isEnabled()&&await page.locator('#turn-page').isEnabled(),id+' 눈 깜빡임·책장 조작 활성화');
      const alpha=await page.evaluate(async source=>{
        const image=new Image();image.src=source;await image.decode();const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
        const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);const data=ctx.getImageData(0,0,image.width,image.height).data;
        let clear=0,solid=0;for(let i=3;i<data.length;i+=4){if(data[i]===0)clear++;if(data[i]>=250)solid++;}
        return {clear,solid,corners:[3,(image.width-1)*4+3,(image.height-1)*image.width*4+3,data.length-1].map(i=>data[i])};
      },metadata.source);
      ok(alpha.clear>300000&&alpha.solid>200000&&alpha.corners.every(value=>value===0),id+' 실제 투명 알파·불투명 전경·네 모서리 검증');
      const initial=await page.locator('#character-mount').getAttribute('data-rig-time');await page.waitForTimeout(180);
      ok(initial!==await page.locator('#character-mount').getAttribute('data-rig-time'),id+' 실시간 자동 재생');
      await page.locator('#timeline').fill('0');const open=await frame(page);
      await page.locator('#timeline').fill('2');ok(open!==await frame(page),id+' 시간에 따라 실제 캐릭터 픽셀 변형');
      const frozen=await page.locator('#character-mount').getAttribute('data-rig-time');await page.waitForTimeout(140);
      ok(frozen===await page.locator('#character-mount').getAttribute('data-rig-time'),id+' 타임라인 일시정지');
      await page.locator('#timeline').fill('4.96');
      ok(Number(await page.locator('#character-mount').getAttribute('data-blink'))>.99,id+' 캐릭터 전용 눈 감김');
      await page.locator('#rig-stage').screenshot({path:path.join(__dirname,`screenshots/${id}-animation-blink.png`)});
      await page.locator('#timeline').fill('5.5');ok(Number(await page.locator('#character-mount').getAttribute('data-blink'))===0,id+' 열린 눈 복원');
      await page.locator('#timeline').fill('10.2');
      ok(Number(await page.locator('.momo-page').getAttribute('opacity'))>.9&&(await page.locator('.momo-page-window').getAttribute('d')).length>100,id+' 원화별 종이 가림 영역을 사용하는 책장');
      await page.locator('#rig-stage').screenshot({path:path.join(__dirname,`screenshots/${id}-animation-page.png`)});
      await page.locator('#bones-toggle').click();const before=await frame(page);
      const limit=await page.locator('#joint-head').getAttribute('max');await page.locator('#joint-head').fill(limit);
      ok(await page.locator('#character-mount [data-bone]').count()===metadata.bones.length&&await page.locator('[data-bone=head]').getAttribute('data-angle')===limit,id+' 독립 고개 관절과 디버그 계층');
      ok(before!==await frame(page),id+' 수동 관절이 메시 픽셀에 적용됨');
      await page.locator('#reset-pose').click();await page.locator('#bones-toggle').click();
      for(const clip of ['idle','nod','read']){await page.locator(`[data-clip="${clip}"]`).click();await page.locator('#timeline').fill('1.3');ok(await page.locator(`[data-clip="${clip}"]`).getAttribute('aria-pressed')==='true',id+' '+clip+' 애니메이션 선택');}
      const jsonPending=page.waitForEvent('download');await page.locator('#export-rig').click();const json=await jsonPending;
      const exported=JSON.parse(await fs.readFile(await json.path(),'utf8'));
      ok(exported.version===3&&exported.profile.id===id&&exported.texture===metadata.source&&exported.closedEyesTexture===metadata.closedSource&&exported.closedEyesTexture!=='assets/momo-reading-concept-v2.png',id+' 원화·프로파일·전용 눈 정보를 포함한 JSON');
      ok(exported.mesh.weights.every(row=>row.length===metadata.bones.length&&row.every(value=>value>=0)&&Math.abs(row.reduce((a,b)=>a+b,0)-1)<.0001),id+' 가중치 차원·양수·합 1 검증');
      const pngPending=page.waitForEvent('download');await page.locator('#export-png').click();const png=await pngPending;
      ok(png.suggestedFilename()===id+'-pose.png'&&(await fs.stat(await png.path())).size>100000,id+' 애니메이션 포즈 PNG');
      await page.locator('#reference-toggle').click();ok(await page.locator('#character-mount.compare-original').count()===1,id+' 투명 원화 비교');
      await page.locator('#reference-toggle').click();await page.locator('#timeline').fill('1.3');
      await page.screenshot({path:path.join(__dirname,`screenshots/${id}-animation-desktop.png`),fullPage:true});
      for(const width of [320,390,768]){
        await page.setViewportSize({width,height:844});await page.evaluate(()=>scrollTo(0,0));
        ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),id+' '+width+'px 가로 넘침 없음');
        if(width===390)await page.screenshot({path:path.join(__dirname,`screenshots/${id}-animation-mobile.png`),fullPage:true});
      }
      await page.setViewportSize({width:1440,height:1100});await page.reload();await page.locator('#character-mount[data-rig-state=ready]').waitFor();
      ok(await page.locator('#character-select').inputValue()===id,id+' 새로고침 선택 유지');
    }
    const reduced=await browser.newPage({reducedMotion:'reduce'});
    await reduced.goto(base+'/rig.html?character=capybara');await reduced.locator('#character-mount[data-rig-state=ready]').waitFor();
    const paused=await reduced.locator('#character-mount').getAttribute('data-rig-time');await reduced.waitForTimeout(180);
    ok(paused===await reduced.locator('#character-mount').getAttribute('data-rig-time'),'동작 줄이기에서 새 동물 자동 재생 안 함');
    await reduced.locator('#play-toggle').click();await reduced.waitForTimeout(180);
    ok(paused!==await reduced.locator('#character-mount').getAttribute('data-rig-time'),'동작 줄이기에서도 명시적 재생 가능');
    await reduced.close();
    const noScript=await browser.newPage({javaScriptEnabled:false});await noScript.goto(base+'/rig.html');
    ok(await noScript.locator('#character-options button').count()===5,'스크립트 없이도 HTML에서 다섯 원화 발견 가능');await noScript.close();
    ok(errors.length===0,'네 동물 전환·애니메이션 런타임 오류 없음');
    console.log('\n'+count+'개 검증 통과');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
