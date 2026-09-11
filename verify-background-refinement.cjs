const assert=require('node:assert/strict');
const {chromium}=require('playwright');
let count=0;const ok=(value,label)=>{assert.ok(value,label);console.log('✓ '+label);count++;};
(async()=>{const browser=await chromium.launch();try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const frame=()=>page.frames().find(f=>f.url().includes('/index.html'));
  await page.goto(((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '') + '/mobile.html?background=refined'),{waitUntil:'networkidle'});
  ok(await frame().evaluate(()=>GachisupBackground.variant==='refined'),'모바일 뷰에서 선택한 배경을 앱에 전달');
  ok(await frame().evaluate(()=>{const i=document.querySelector('#map-image');return i.naturalWidth===1536&&i.naturalHeight===1024&&i.width===1536&&i.height===1024;}),'실제 해상도와 월드 좌표 확인: 1536 × 1024');
  const common=await frame().evaluate(()=>{const src=GachisupBackground.map.src;return document.querySelector('#map-image').getAttribute('src')===src&&document.querySelector('.mini-map img').getAttribute('src')===src&&[...document.querySelectorAll('.building-thumb image')].every(e=>e.getAttribute('href')===src)&&document.querySelector('link[rel=preload][as=image]').getAttribute('href')===src;});
  ok(common,'마을·축소 지도·건물 썸네일·미리 읽기 자산 일치');
  await page.click('#landscape');await page.waitForTimeout(150);ok(await frame().evaluate(()=>innerWidth===844&&GachisupBackground.variant==='refined'),'가로 회전에도 같은 배경 유지');
  for(const id of ['pr3','on6','fo2']){await page.selectOption('#mobile-screen',id);await page.waitForFunction(id=>document.querySelector('iframe').contentWindow.GachisupIAApp?.ui.current===id,id);const same=await frame().evaluate(id=>{const src=GachisupBackground.map.src;if(id==='pr3')return document.querySelector('.ia-shop-island svg image').getAttribute('href')===src;if(id==='on6')return document.querySelector('.ia-arrival-world .ia-island').getAttribute('src')===src;return document.querySelector('#map-image').getAttribute('src')===src;},id);ok(same,id+' 같은 보강 배경 사용');}
  await Promise.all([frame().waitForNavigation({waitUntil:'networkidle'}),frame().evaluate(()=>{setTimeout(()=>location.reload(),0);})]);await page.waitForFunction(()=>document.querySelector('iframe').contentWindow.GachisupIAApp?.ui.current==='fo2');ok(await frame().evaluate(()=>GachisupBackground.variant==='refined'),'앱 내부 새로고침에도 배경 유지');
  await page.goto(((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '') + '/ia.html?screen=on6&background=refined'),{waitUntil:'networkidle'});ok((await page.locator('#mobile-link').getAttribute('href')).includes('background=refined')&&(await page.locator('#standalone-link').getAttribute('href')).includes('background=refined'),'화면 목록의 별도 열기·모바일 링크에도 배경 유지');
  for(const query of ['', '?background=invalid']){await page.goto(((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '') + '/mobile.html')+query,{waitUntil:'networkidle'});ok(await frame().evaluate(()=>GachisupBackground.variant==='refined'&&document.querySelector('#map-image').getAttribute('src')==='assets/village-map-cel-v3.png'),'기본/알 수 없는 선택은 보강 배경 사용 '+query);}
  ok(!errors.length,'런타임 오류 없음 '+errors.join(';'));console.log(count+'개 배경 비교 검증 통과');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
