/* 가구 배치·휴대폰 시야·입출항의 시각/동작 경계 회귀. 사용자 저장소는 건드리지 않는다. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {create}=require('./ia-model.js');
let count=0;const errors=[];const ok=(value,label)=>{assert.ok(value,label);count++;console.log('✓ '+label);};
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)};};
const storage=memory(),m=create(storage);
assert.throws(()=>m.placeStudy('north','OWNER'));ok(m.get().placed.length===0,'미구매 테이블은 배치 불가');
m.purchase('table','OWNER');ok(m.get().treasury===800&&m.get().wallet===480,'테이블 구매는 해당 섬 금고만 차감');
assert.throws(()=>m.placeStudy('north','MEMBER'));assert.throws(()=>m.placeStudy('ocean','OWNER'));ok(!m.get().placed.includes('table'),'권한과 안전한 배치 자리 검증');
m.placeStudy('north','OWNER');ok(m.get().studySlots.home==='north'&&m.get().placed.includes('table'),'배치 자리와 사용 상태 함께 저장');
ok(!m.get({islandId:'dawn'}).placed.includes('table'),'다른 섬에 테이블 복제하지 않음');
ok(create(storage).get().studySlots.home==='north','자리 선택 새로고침 복원');
m.placeStudy('west','OWNER');ok(m.get().treasury===800&&m.get().placed.filter(x=>x==='table').length===1,'재배치는 추가 차감·복제 없음');
const base=((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '') + '/index.html');
const ready=p=>p.waitForFunction(()=>window.GachisupVillage&&document.querySelector('#load-state').hidden);
const shot=(p,name)=>p.screenshot({path:__dirname+'/screenshots/activities/'+name+'.png'});
(async()=>{const browser=await chromium.launch();try{
  for(const [width,height] of [[320,640],[390,844],[834,1112]]){
    const c=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'}),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));
    await p.goto(base+'?ia=plaza&preview=1',{waitUntil:'networkidle'});await ready(p);await p.waitForTimeout(150);
    const home=await p.evaluate(()=>({overview:GachisupVillage.state.overview,scale:new DOMMatrix(getComputedStyle(document.querySelector('#map-layer')).transform).a,overflow:document.documentElement.scrollWidth>innerWidth,dock:getComputedStyle(document.querySelector('.village-dock')).display}));
    ok(!home.overflow&&home.overview===(width>600),width+' 휴대폰 근경·패드 전체 구도');
    if(width<600){ok(home.scale>.5&&home.dock==='grid',width+' 손안에서 읽히는 기본 확대와 메뉴');
      const targets=await p.locator('.village-dock button:visible').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return r.width>=44&&r.height>=44&&r.bottom<=innerHeight;}));ok(targets.length===5&&targets.every(Boolean),width+' 다섯 개 주요 조작 44px 이상');
      await p.locator('[data-action=mobile-more]').click();await p.locator('.mobile-place-list [data-select=post]').click();ok(!await p.locator('#village-dialog').evaluate(e=>e.open)&&await p.locator('body').getAttribute('data-ia-screen')==='po1',width+' 더 보기에서 우체국 연결');await p.evaluate(()=>GachisupIAApp.navigate('plaza'));
      await p.locator('[data-action=overview]').click();ok(await p.evaluate(()=>GachisupVillage.state.overview),width+' 전체 섬 보기를 별도로 제공');await p.evaluate(()=>GachisupVillage.homeCamera());
    }
    await shot(p,'polish-'+width+'-home');
    await p.goto(base+'?ia=on6&preview=1',{waitUntil:'networkidle'});await ready(p);ok(await p.locator('.ia-arrival-vessel').evaluate(e=>getComputedStyle(e).animationName)==='none',width+' 동작 줄임 시 입항 즉시 정착');
    ok(await p.locator('.ia-arrival-vessel').evaluate(e=>Math.abs(e.getBoundingClientRect().width/e.parentElement.getBoundingClientRect().width-.1)<.001),width+' 입항 배 크기는 섬 좌표판의 10%로 유지');
    await shot(p,'polish-'+width+'-arrival');await c.close();
  }
  {
    const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'?ia=pr3',{waitUntil:'networkidle'});await p.locator('[data-ia-action=try-product][data-value=table]').click();
    const before=await p.evaluate(()=>GachisupIAApp.design.get().treasury);await p.locator('[data-ia-action=study-preview][data-value=north]').click();ok(await p.evaluate(()=>!GachisupIAApp.design.get().placed.includes('table')&&GachisupActivities.specs.study.point[0]===624),'구매 전 미리보기는 마을과 금고를 변경하지 않음');await shot(p,'polish-table-preview');
    await p.locator('[data-ia-action=purchase-sheet]').click();await p.locator('[data-ia-action=confirm-purchase]').click();await p.locator('[data-ia-action=place-study]').click();ok(await p.evaluate(()=>GachisupActivities.specs.study.point[0]===828&&GachisupIAApp.design.get().treasury===800),'구매·배치 후 실제 공부 위치 동기화');
    await p.evaluate(()=>GachisupIAApp.navigate('plaza'));await shot(p,'polish-table-placed');await p.evaluate(()=>GachisupVillage.chooseActivity('study'));await p.locator('[data-action=start]:visible').click();await p.waitForFunction(()=>GachisupVillage.state.activityPhase==='settled');
    ok(await p.locator('#study-actor').evaluate(e=>parseFloat(e.style.left)===748),'옮긴 테이블에 캐릭터 착석');await shot(p,'polish-study-session');await p.reload({waitUntil:'networkidle'});await ready(p);ok(await p.evaluate(()=>GachisupActivities.specs.study.point[0]===828&&GachisupVillage.state.session.tag==='공부'),'집중 새로고침도 구매한 배치 자리로 복원');await c.close();
  }
  {
    const c=await browser.newContext({viewport:{width:390,height:844}}),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'?ia=on6&preview=1',{waitUntil:'networkidle'});const start=await p.locator('.ia-arrival-vessel').boundingBox();await p.waitForTimeout(7200);const end=await p.locator('.ia-arrival-vessel').boundingBox();ok(end.x<start.x-20&&end.y<start.y-20&&end.width<=start.width,'입항은 뱃머리 방향으로 이동하며 원근에 맞게 작아짐');await p.waitForTimeout(900);const held=await p.locator('.ia-arrival-vessel').boundingBox();ok(Math.abs(held.x-end.x)<1&&Math.abs(held.y-end.y)<1,'입항은 한 번만 재생하고 정박 유지');await shot(p,'polish-arrival-landed');
    await p.goto(base+'?activity=rest',{waitUntil:'networkidle'});await ready(p);await p.locator('[data-action=start]:visible').click();await p.waitForFunction(()=>GachisupVillage.state.activityPhase==='sailing');await p.waitForTimeout(1200);const from=await p.locator('#rest-boat').boundingBox(),wx=await p.locator('#rest-boat').getAttribute('data-x');await shot(p,'polish-rest-departure');await p.waitForTimeout(1900);const to=await p.locator('#rest-boat').boundingBox();
    ok(Number(await p.locator('#rest-boat').getAttribute('data-x'))>Number(wx)+20,'휴식 배가 실제 해상 경로를 따라 전진');ok(Math.hypot(to.x-from.x,to.y-from.y)>5,'출항 중 화면에서도 배가 움직여 카메라 고정 스티커처럼 보이지 않음');
    await p.waitForFunction(()=>GachisupVillage.state.activityPhase==='settled');await p.waitForTimeout(500);await shot(p,'polish-rest-settled');ok(await p.locator('.boat-trail').evaluate(e=>Number(getComputedStyle(e).opacity))<.1,'멈춘 배에는 이동 물결을 남기지 않음');await c.close();
  }
  ok(!errors.length,'새 흐름 런타임 오류 없음 '+errors.join(';'));console.log(count+'개 마을 개선 검증 통과');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
