/* 모바일 베젤, 회전 상태 보존, 실제 화면 흐름의 경계 검증. 독립 브라우저 저장소만 사용한다. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
let count=0;const errors=[];const ok=(value,label)=>{assert.ok(value,label);count++;console.log('✓ '+label);};
const base=((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '') + '/mobile.html');
const app=page=>page.frames().find(frame=>frame.url().includes('/index.html'));
const wait=async(page,id)=>{await page.waitForFunction(id=>document.querySelector('#mobile-screen').value===id&&document.querySelector('#mobile-preview').contentWindow.GachisupIAApp?.ui.current===id,id);await page.waitForTimeout(160);};
const choose=async(page,id)=>{await page.selectOption('#mobile-screen',id);await wait(page,id);};
const shot=(page,name)=>page.screenshot({path:__dirname+'/screenshots/mobile-'+name+'.png'});
(async()=>{const browser=await chromium.launch();try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base,{waitUntil:'networkidle'});await wait(page,'plaza');
  ok(await page.locator('#mobile-screen option').count()===45,'기존 화면·시트와 공동 장소 CP-1 모두 선택 가능');
  ok(await app(page).evaluate(()=>innerWidth===390&&innerHeight===770),'390 × 844 화면에서 상태표시줄·홈 영역을 제외한 실제 앱 뷰포트');
  await shot(page,'portrait');
  await app(page).evaluate(()=>window.mobileSentinel={token:42});await page.click('#landscape');await page.waitForTimeout(250);
  ok(await app(page).evaluate(()=>innerWidth===844&&innerHeight===390&&mobileSentinel.token===42),'가로 회전은 같은 iframe 인스턴스 유지');
  const targets=await app(page).locator('.village-dock button:visible').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return r.width>=44&&r.height>=43&&r.bottom<innerHeight-12;}));
  ok(targets.length===5&&targets.every(Boolean),'가로 마을 바로가기 다섯 개가 안전 영역 안에 표시');
  await shot(page,'landscape');await app(page).locator('.village-dock [data-select=town]').click();await wait(page,'vh1');
  ok(await page.locator('#phone').getAttribute('data-orientation')==='portrait'&&await page.locator('#landscape').isDisabled(),'건물 상세 진입 시 자동 세로 전환 및 상위 선택기 동기화');
  await app(page).evaluate(()=>GachisupIAApp.navigate('plaza'));await wait(page,'plaza');
  ok(await page.locator('#phone').getAttribute('data-orientation')==='landscape','마을 복귀 시 선호하던 가로 방향 복원');
  await choose(page,'fo2');const session=await app(page).evaluate(()=>JSON.stringify(GachisupVillage.state.session));
  await page.click('#portrait');await page.waitForTimeout(200);await page.click('#landscape');await page.waitForTimeout(200);
  ok(await app(page).evaluate(()=>JSON.stringify(GachisupVillage.state.session))===session,'회전 전후 집중 세션·시작 시각 그대로 유지');
  const focus=await app(page).evaluate(()=>{const hud=document.querySelector('#session-hud').getBoundingClientRect(),footer=document.querySelector('#focus-footer').getBoundingClientRect();return hud.bottom<footer.top&&hud.left>innerWidth*.6&&footer.bottom<=innerHeight-20;});
  ok(focus,'가로 집중 화면은 타이머와 종료 조작을 겹치지 않게 배치');await shot(page,'focus');
  await app(page).locator('[data-ia-go=fo4]').click();await wait(page,'fo4');ok(await page.locator('#phone').getAttribute('data-orientation')==='portrait','잠금화면 시안은 세로 유지');
  await app(page).locator('[data-ia-go=fo2]').click();await wait(page,'fo2');ok(await app(page).evaluate(()=>JSON.stringify(GachisupVillage.state.session))===session,'잠금화면 왕복도 동일 세션 유지');
  await choose(page,'pr3');await app(page).locator('[data-ia-action=try-product][data-value=table]').click();await app(page).locator('[data-ia-action=study-preview][data-value=north]').click();
  const shop=await app(page).evaluate(()=>{const left=document.querySelector('.ia-shop-scene').getBoundingClientRect(),right=document.querySelector('.ia-shop-selection').getBoundingClientRect();return left.right<right.left&&getComputedStyle(document.querySelector('.ia-shop-selection')).overflowY==='auto';});
  ok(shop,'가로 상점의 배치 미리보기·독립 스크롤 상품 목록');await shot(page,'shop');
  await page.click('#portrait');await page.waitForTimeout(200);await page.click('#landscape');await page.waitForTimeout(200);
  ok(await app(page).evaluate(()=>GachisupIAApp.ui.product==='table'&&GachisupIAApp.ui.studyPlot==='north'),'회전 중 선택 상품과 배치 자리 유지');
  await app(page).locator('[data-ia-action=purchase-sheet]').click();await wait(page,'sh9');ok(await page.locator('#phone').getAttribute('data-orientation')==='portrait','구매 확인은 읽기 쉬운 세로 시트');
  await app(page).locator('[data-ia-action=confirm-purchase]').click();await wait(page,'pr3');await app(page).locator('[data-ia-action=place-study]').click();
  ok(await app(page).evaluate(()=>GachisupIAApp.design.get().treasury===800&&GachisupActivities.specs.study.point[0]===828),'베젤 안에서 구매→배치까지 실제 동작');await shot(page,'placed');
  await choose(page,'sh3');await app(page).locator('input[name=title]').fill('회전해도 남는 공지');await page.click('#portrait');
  ok(await app(page).locator('input[name=title]').inputValue()==='회전해도 남는 공지','세로 작성 화면 입력 보존');
  await choose(page,'hb3');await page.click('#landscape');await page.waitForTimeout(200);await shot(page,'visit');
  ok(await app(page).locator('.ia-visit-controls button').isVisible(),'가로 다른 섬 구경의 복귀 버튼 접근 가능');
  for(const viewport of [{width:1280,height:800},{width:390,height:844},{width:320,height:740}]){
    await page.setViewportSize(viewport);await page.click('#portrait');await page.waitForTimeout(180);
    const fits=await page.evaluate(()=>{const stage=document.querySelector('#preview-stage').getBoundingClientRect(),phone=document.querySelector('#phone').getBoundingClientRect();return document.documentElement.scrollWidth<=innerWidth&&phone.left>=stage.left&&phone.right<=stage.right+1&&phone.top>=stage.top&&phone.bottom<=stage.bottom+1;});
    ok(fits,viewport.width+' × '+viewport.height+' 브라우저에서 기기 전체 맞춤 및 가로 넘침 없음');await shot(page,'host-'+viewport.width);
  }
  await page.setViewportSize({width:1280,height:800});await page.click('#actual-size');ok(await page.locator('#phone').evaluate(e=>Math.abs(e.getBoundingClientRect().width-414)<1),'원래 크기 100%에서 실제 CSS 크기 유지');await page.click('#actual-size');
  await page.goto(base+'?screen=invalid&orientation=broken&role=broken',{waitUntil:'networkidle'});await wait(page,'plaza');ok(await page.locator('#mobile-role').inputValue()==='OWNER','잘못된 미리보기 URL은 안전한 기본 화면으로');
  const ids=await page.locator('#mobile-screen option').evaluateAll(es=>es.map(e=>e.value));
  for(const id of ids){await choose(page,id);const valid=await app(page).evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight&&GachisupIAApp.ui.current===document.body.dataset.iaScreen);ok(valid,id+' 실제 휴대폰 콘텐츠 높이에서 화면 표시·문서 넘침 없음');}
  await choose(page,'plaza');await page.selectOption('#mobile-role','MEMBER');await wait(page,'plaza');ok(await app(page).evaluate(()=>GachisupVillage.model.get().role==='MEMBER'),'그룹원 역할을 앱 시연에 반영');
  await app(page).evaluate(()=>location.reload());await wait(page,'plaza');ok(await app(page).evaluate(()=>document.documentElement.classList.contains('mobile-device')),'앱 내부 새로고침에도 휴대폰 모드 유지');
  ok(!errors.length,'런타임 오류 없음 '+errors.join(';'));console.log(count+'개 모바일 미리보기 검증 통과');await context.close();
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
