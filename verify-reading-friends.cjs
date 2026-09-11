const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.VILLAGE_URL||(process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '');
let count=0;const errors=[];const ok=(v,label)=>{assert.ok(v,label);count++;console.log('✓ '+label);};
(async()=>{const browser=await chromium.launch();try{
  const page=await browser.newPage({viewport:{width:1440,height:1100}});page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/rig.html?character=golden');await page.locator('#character-mount[data-rig-state=ready]').waitFor();
  ok(await page.locator('#character-select').count()===1,'명시적인 캐릭터 선택 드롭다운 제공');
  ok(await page.locator('#character-select').inputValue()==='golden','직접 링크와 드롭다운 선택 동기화');
  await page.selectOption('#character-select','capybara');await page.locator('#character-mount[data-rig-state=ready]').waitFor();
  ok(await page.locator('#character-title').textContent()==='책 읽는 카피바라'&&await page.locator('[data-character=capybara][aria-pressed=true]').count()===1,'드롭다운으로 카피바라 원화와 썸네일 함께 전환');
  await page.selectOption('#character-select','red-panda');await page.locator('#character-mount[data-rig-state=ready]').waitFor();
  ok((await page.locator('#character-title').textContent()).includes('레서판다')&&page.url().includes('character=red-panda'),'드롭다운으로 레서판다 원화와 URL 함께 전환');
  await page.locator('button[data-character=golden]').click();await page.locator('#character-mount[data-rig-state=ready]').waitFor();
  ok(await page.locator('#character-select').inputValue()==='golden','썸네일 클릭과 드롭다운 선택 동기화');
  ok(await page.locator('button[data-character=golden][aria-pressed=true]').count()===1,'골든리트리버 직접 링크');
  ok(await page.locator('#character-options button').count()===5,'모모·강아지·골든·카피바라·레서판다 5종 유지');
  ok(await page.locator('#blink').isEnabled()&&await page.locator('#turn-page').isEnabled(),'골든 전용 눈·책장 조작 활성화');
  await page.locator('#timeline').fill('4.96');ok(Number(await page.locator('#character-mount').getAttribute('data-blink'))>.99,'골든 자체 감은 눈 리깅');
  await page.locator('#timeline').fill('10.2');ok(Number(await page.locator('.momo-page').getAttribute('opacity'))>.9,'골든 책장 넘기기');
  await page.locator('#bones-toggle').click();await page.locator('#joint-head').fill('2');
  ok(await page.locator('#character-mount [data-bone]').count()===12&&await page.locator('[data-bone=head]').getAttribute('data-angle')==='2','골든 전용 12관절 및 독립 고개 조작');
  const jsonPending=page.waitForEvent('download');await page.locator('#export-rig').click();const json=await jsonPending;const rig=JSON.parse(await fs.readFile(await json.path(),'utf8'));
  ok(rig.texture==='assets/golden-retriever-rig-source.png'&&rig.closedEyesTexture==='assets/golden-retriever-reading-closed-v2.png'&&Object.keys(rig.bones).length===12,'골든 JSON의 원화·관절·전용 눈 데이터 정확');
  ok(rig.mesh.weights.every(row=>row.length===12&&Math.abs(row.reduce((a,b)=>a+b,0)-1)<.0001),'골든 메시 12관절 가중치 합 1');
  const pngPending=page.waitForEvent('download');await page.locator('#export-png').click();const png=await pngPending;ok(png.suggestedFilename()==='golden-pose.png'&&(await fs.stat(await png.path())).size>100000,'골든 포즈 PNG 내보내기');
  const alpha=await page.evaluate(async()=>{const image=new Image();image.src='assets/golden-retriever-rig-source.png';await image.decode();const c=document.createElement('canvas');c.width=c.height=1254;const ctx=c.getContext('2d');ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,1254,1254).data;let transparent=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]===0)transparent++;return transparent;});ok(alpha>300000,'골든 원화 실제 투명 알파 확인');
  await page.locator('#bones-toggle').click();await page.locator('#reset-pose').click();await page.screenshot({path:path.join(__dirname,'tmp/verification/reading-friends-golden-desktop.png'),fullPage:true});
  for(const id of ['puppy','capybara','red-panda']){
    await page.locator(`button[data-character="${id}"]`).click();await page.locator('#character-mount[data-rig-state=ready]').waitFor();
    ok(await page.locator('.concept-reference').count()===0&&await page.locator('#character-mount canvas').count()===1,id+' 정적 원화 대신 리깅 프리뷰 표시');
    ok(await page.locator('#play-toggle').isEnabled()&&await page.locator('#export-rig').isEnabled()&&(await page.locator('#character-note').textContent()).includes('투명 원화'),id+' 투명 원화와 애니메이션·내보내기 활성화');
    const pending=page.waitForEvent('download');await page.locator('#export-png').click();const file=await pending;ok(file.suggestedFilename()===id+'-pose.png',(id+' 리깅 포즈 PNG 받기'));
  }
  for(const width of [320,390,1440]){await page.setViewportSize({width,height:1000});for(const id of ['momo','puppy','golden','capybara','red-panda']){await page.locator(`button[data-character="${id}"]`).click();ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+'px '+id+' 가로 넘침 없음');}}
  await page.locator('button[data-character=momo]').click();await page.locator('#character-mount[data-rig-state=ready]').waitFor();ok(await page.locator('#blink').isEnabled()&&await page.locator('#character-mount [data-bone]').count()===12,'동물 전환 뒤 모모 12관절과 눈 깜빡임 복원');
  await page.locator('button[data-character=golden]').click();await page.locator('#character-mount[data-rig-state=ready]').waitFor();await page.setViewportSize({width:390,height:1000});await page.screenshot({path:path.join(__dirname,'tmp/verification/reading-friends-golden-mobile.png'),fullPage:true});
  await page.reload();await page.locator('#character-mount[data-rig-state=ready]').waitFor();ok(await page.locator('button[data-character=golden][aria-pressed=true]').count()===1,'새로고침 뒤 선택 캐릭터 유지');
  ok(errors.length===0,'캐릭터 전환 전체 브라우저 오류 없음');console.log('\n'+count+'개 검증 통과');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
