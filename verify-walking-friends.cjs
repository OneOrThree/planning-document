const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.VILLAGE_URL||(process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '');
const ids=['puppy','capybara','red-panda'];
let count=0;const ok=(value,label)=>{assert.ok(value,label);count++;console.log('✓ '+label);};
(async()=>{
  const browser=await chromium.launch();
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base+'/walk.html');await page.locator('#walk-mount[data-walk-state=ready]').waitFor();
    ok(await page.locator('#walk-character-options button').count()===4,'모모와 새 친구 세 종의 산책 선택 목록');
    for(const id of ids){
      await page.selectOption('#walk-character-select',id);await page.locator('#walk-mount[data-walk-state=ready]').waitFor();
      ok(await page.locator('#walk-mount').getAttribute('data-walk-character')===id,id+' 독립 보행 리그 선택');
      ok(await page.locator(`#walk-character-options [data-walk-character="${id}"]`).getAttribute('aria-pressed')==='true',id+' 드롭다운과 썸네일 선택 동기화');
      const profile=await page.evaluate(id=>GachisupWalkProfiles[id],id),bones=Object.keys(profile.hierarchy);
      ok(bones.length===(id==='capybara'?18:20),id+' 종별 관절 수와 꼬리 유무');
      for(const side of ['front','back']){
        const alpha=await page.evaluate(async src=>{const image=new Image();image.src=src;await image.decode();const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);const data=ctx.getImageData(0,0,image.width,image.height).data;let clear=0,solid=0;for(let i=3;i<data.length;i+=4){if(data[i]===0)clear++;if(data[i]>=250)solid++;}return {clear,solid,width:image.width,height:image.height,corners:[3,image.width*4-1,(image.height-1)*image.width*4+3,data.length-1].map(i=>data[i])};},profile.views[side].src);
        ok(alpha.clear>300000&&alpha.solid>100000&&alpha.corners.every(n=>n===0)&&alpha.width===alpha.height,id+' '+side+' 정방형 실제 투명 원화');
      }
      const distance=await page.locator('#walk-mount').getAttribute('data-distance');await page.waitForTimeout(200);
      ok(distance!==await page.locator('#walk-mount').getAttribute('data-distance'),id+' 산책 자동 재생과 거리 증가');
      await page.locator('#walk-cycle').fill('0.25');
      ok(Number(await page.locator('#walk-mount').getAttribute('data-left-lift'))>0&&Number(await page.locator('#walk-mount').getAttribute('data-right-lift'))===0,id+' 왼발 들기·오른발 지지');
      const first=await page.locator('#walk-mount canvas').evaluate(canvas=>canvas.toDataURL());
      await page.locator('#walk-cycle').fill('0.75');
      ok(Number(await page.locator('#walk-mount').getAttribute('data-right-lift'))>0&&Number(await page.locator('#walk-mount').getAttribute('data-left-lift'))===0,id+' 반 주기 뒤 반대 발 지지');
      ok(first!==await page.locator('#walk-mount canvas').evaluate(canvas=>canvas.toDataURL()),id+' 실제 보행 메시 픽셀 변형');
      const frozen=await page.locator('#walk-mount').getAttribute('data-distance');await page.waitForTimeout(140);
      ok(frozen===await page.locator('#walk-mount').getAttribute('data-distance'),id+' 타임라인 일시정지');
      for(const direction of ['ne','nw','se','sw']){
        await page.locator(`[data-direction="${direction}"]`).click();
        const side=direction[0]==='n'?'back':'front';
        ok(await page.locator('#walk-mount').getAttribute('data-direction')===direction&&(await page.locator('.walk-fallback').getAttribute('src'))===profile.views[side].src,id+' '+direction+' 전용 원화와 좌우 방향');
        ok(await page.locator('#walk-mount').evaluate((element,palette)=>element.style.getPropertyValue('--walk-palette')===(palette||'none'),profile.views[side].palette),id+' '+direction+' 모모 색 보정과 독립');
      }
      await page.locator('#walk-bones').click();ok(await page.locator('[data-walk-bone]').count()===bones.length,id+' 관절 계층 시각화');
      const joint=profile.controls.includes('shinL')?'shinL':profile.controls[0];
      const before=await page.locator('#walk-mount canvas').evaluate(canvas=>canvas.toDataURL());
      await page.locator('#walk-joint-'+joint).fill(await page.locator('#walk-joint-'+joint).getAttribute('max'));
      ok(before!==await page.locator('#walk-mount canvas').evaluate(canvas=>canvas.toDataURL()),id+' 수동 관절이 실제 원화에 적용');
      await page.locator('#walk-reset').click();await page.locator('#walk-bones').click();
      const pending=page.waitForEvent('download');await page.locator('#export-walk').click();const download=await pending;
      const exported=JSON.parse(await fs.readFile(await download.path(),'utf8'));
      ok(download.suggestedFilename()===id+'-walk-rig.json'&&exported.profile.id===id&&exported.stride===profile.stride,id+' 보폭·캐릭터·프로파일 JSON 내보내기');
      for(const view of ['front','back']){const mesh=exported.views[view].mesh;ok(mesh.vertices.length===4802&&mesh.indices.length===13824&&mesh.weights.every(row=>row.length===bones.length&&row.every(n=>n>=0)&&Math.abs(row.reduce((a,b)=>a+b,0)-1)<.00001),id+' '+view+' 2,401정점·4,608삼각형·가중치 합 1');}
      ok((await page.locator('.motion-nav a[href^="rig.html"]').getAttribute('href')).includes('character='+id),id+' 독서 작업실로 같은 캐릭터 연결');
      await page.locator('[data-walk-clip=idle]').click();await page.waitForTimeout(450);
      ok(Number(await page.locator('#walk-mount').getAttribute('data-left-lift'))<1&&Number(await page.locator('#walk-mount').getAttribute('data-right-lift'))<1,id+' 대기 시 두 발 내려놓기');
      await page.locator('[data-walk-clip=walk]').click();await page.locator('#walk-cycle').fill('0.25');
      await page.screenshot({path:path.join(__dirname,`screenshots/${id}-walk-final-desktop.png`),fullPage:true});
      for(const width of [320,390,768]){await page.setViewportSize({width,height:844});ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),id+' '+width+'px 가로 넘침 없음');if(width===390)await page.screenshot({path:path.join(__dirname,`screenshots/${id}-walk-final-mobile.png`),fullPage:true});}
      await page.setViewportSize({width:1440,height:1100});await page.reload();await page.locator('#walk-mount[data-walk-state=ready]').waitFor();
      ok(await page.locator('#walk-character-select').inputValue()===id,id+' 새로고침 선택 유지');
      await page.locator('.motion-nav a[href^="rig.html"]').click();await page.locator('#character-mount[data-rig-state=ready]').waitFor();
      ok(await page.locator('#character-select').inputValue()===id,id+' 독서 작업실로 실제 이동해도 선택 유지');
      await page.locator('.motion-nav a[href^="walk.html"]').click();await page.locator('#walk-mount[data-walk-state=ready]').waitFor();
      ok(await page.locator('#walk-character-select').inputValue()===id,id+' 산책 작업실로 돌아와도 선택 유지');
      await page.locator('#walk-character-options [data-walk-character=momo]').click();await page.locator('#walk-mount[data-walk-state=ready]').waitFor();
      ok(await page.locator('#walk-mount').evaluate(element=>!element.style.getPropertyValue('--walk-palette'))&&await page.locator('[data-walk-bone]').count()===20,id+' 선택 후 모모 원래 보정·관절 복원');
    }
    const reduced=await browser.newPage({reducedMotion:'reduce'});await reduced.goto(base+'/walk.html?character=capybara');await reduced.locator('#walk-mount[data-walk-state=ready]').waitFor();
    const start=await reduced.locator('#walk-mount').getAttribute('data-distance');await reduced.waitForTimeout(150);
    ok(start===await reduced.locator('#walk-mount').getAttribute('data-distance'),'새 친구도 동작 줄이기 자동 재생 방지');
    await reduced.locator('#walk-play').click();await reduced.waitForTimeout(200);ok(start!==await reduced.locator('#walk-mount').getAttribute('data-distance'),'명시적 재생으로 산책 시작');await reduced.close();
    ok(errors.length===0,'캐릭터 전환·방향·재생 런타임 오류 없음');
    console.log('\n'+count+'개 검증 통과');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
