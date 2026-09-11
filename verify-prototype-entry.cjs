const assert=require('node:assert/strict');
const {chromium}=require('playwright');
let count=0;const errors=[];const ok=(value,label)=>{assert.ok(value,label);count++;console.log('✓ '+label);};
const base=((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '') + '/');
(async()=>{const browser=await chromium.launch();try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  for(const [width,height] of [[1440,1000],[834,1112],[390,844],[320,740]]){
    await page.setViewportSize({width,height});await page.goto(base,{waitUntil:'networkidle'});await page.waitForFunction(()=>window.GachisupVillage&&document.querySelector('#load-state').hidden);
    ok(await page.locator('#entry-ia').isVisible()&&await page.locator('#entry-mobile').isVisible(),width+' 첫 화면에서 IA·모바일 바로가기 노출');
    ok(await page.evaluate(()=>GachisupBackground.variant==='refined'&&document.querySelector('#map-image').getAttribute('src')==='assets/village-map-cel-v3.png'),width+' 새 배경이 별도 URL 없이 기본 적용');
    const layout=await page.evaluate(()=>{const nav=document.querySelector('#prototype-entry').getBoundingClientRect(),map=document.querySelector('#map-viewport').getBoundingClientRect();return Math.abs(nav.bottom-map.top)<1&&map.bottom<=innerHeight+1&&document.documentElement.scrollWidth<=innerWidth&&[...document.querySelectorAll('#prototype-entry a')].every(e=>{const r=e.getBoundingClientRect();return r.height>=44&&r.right<=innerWidth;});});
    ok(layout,width+' 바로가기 44px 조작·마을 가림·문서 넘침 없음');await page.screenshot({path:__dirname+'/screenshots/entry-'+width+'.png'});
  }
  await page.click('#entry-ia');await page.waitForURL('**/ia.html**');await page.locator('#home-hub [data-screen=plaza]').click();await page.waitForFunction(()=>document.querySelector('#screen-preview')?.contentWindow.GachisupVillage);
  let frame=page.frames().find(f=>f.url().includes('/index.html'));ok(await frame.evaluate(()=>GachisupBackground.variant==='refined')&&!await frame.locator('#prototype-entry').isVisible(),'첫 화면→IA 이동·새 배경·내부 작업실 메뉴 중복 없음');
  await page.goto(base,{waitUntil:'networkidle'});await page.click('#entry-mobile');await page.waitForURL('**/mobile.html**');await page.waitForFunction(()=>document.querySelector('#mobile-preview')?.contentWindow.GachisupVillage);
  frame=page.frames().find(f=>f.url().includes('/index.html'));ok(await frame.evaluate(()=>GachisupBackground.variant==='refined')&&!await frame.locator('#prototype-entry').isVisible(),'첫 화면→모바일 이동·새 배경·베젤 내부 메뉴 중복 없음');
  await page.goto(base,{waitUntil:'networkidle'});await page.locator('[data-action=quiet]').click();ok(!await page.locator('#prototype-entry').isVisible(),'마을만 보기에서는 작업실 메뉴 숨김');await page.locator('[data-action=quiet]').click();ok(await page.locator('#prototype-entry').isVisible(),'메뉴 다시 보기에서 진입 링크 복원');
  await page.evaluate(()=>GachisupVillage.chooseActivity('read'));await page.locator('[data-action=start]:visible').click();ok(!await page.locator('#prototype-entry').isVisible(),'집중 중에는 작업실 메뉴가 몰입 화면을 가리지 않음');await page.evaluate(()=>GachisupVillage.finishSession());
  await page.goto(base+'?background=original',{waitUntil:'networkidle'});ok(await page.evaluate(()=>GachisupBackground.variant==='original'),'이전 원본은 명시적 비교 URL에서 보존');
  await page.click('#entry-mobile');await page.waitForFunction(()=>document.querySelector('#mobile-preview')?.contentWindow.GachisupBackground?.variant==='original');ok(new URL(page.url()).searchParams.get('background')==='original','원본 비교 선택을 모바일로 전달');
  await page.selectOption('#mobile-screen','on6');await page.waitForFunction(()=>document.querySelector('#mobile-preview')?.contentWindow.GachisupIAApp?.ui.current==='on6');
  frame=page.frames().find(f=>f.url().includes('/index.html'));ok(await frame.evaluate(()=>document.querySelector('.ia-arrival-world .ia-island').getAttribute('src')==='assets/village-map-ocean-v2.png'),'이전 원본 비교도 입항까지 일관되게 유지');
  ok(!errors.length,'런타임 오류 없음 '+errors.join(';'));console.log(count+'개 첫 화면·전체 배경 반영 검증 통과');await context.close();
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
