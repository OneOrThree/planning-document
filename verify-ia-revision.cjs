const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '') + '/');
let count=0;const errors=[];
const ok=(value,label)=>{assert.ok(value,label);count++;console.log('✓ '+label);};
async function ready(page,id){
  await page.waitForFunction(id=>{const f=document.querySelector('#screen-preview');return f?.contentWindow.GachisupIAApp?.ui.current===id&&document.querySelector('#preview-loading').hidden===true;},id);
  return page.frames().find(f=>f.url().includes('/index.html'));
}
(async()=>{const browser=await chromium.launch();try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base))errors.push(r.status()+' '+r.url());});
  for(const [width,height] of [[1440,1000],[1280,800],[834,1112],[390,844],[320,740]]){
    await page.setViewportSize({width,height});await page.goto(base+'ia.html',{waitUntil:'networkidle'});
    ok(await page.locator('#overview-panel').isVisible()&&!await page.locator('#preview-panel').isVisible(),width+' 기본 진입은 전체 구조');
    ok(await page.locator('.activity-card').count()===3,width+' 독서·공부·낚시 세 갈래 노출');
    ok(await page.evaluate(()=>new Set([...document.querySelectorAll('#overview-panel [data-screen]')].map(e=>e.dataset.screen)).size===45),width+' 기존 44개 항목과 공동 장소 CP-1 연결');
    ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+' 전체 구조 가로 넘침 없음');
    await page.screenshot({path:__dirname+'/screenshots/ia-overview-'+width+'.png'});
    await page.locator('#feature-grid [data-screen=vh2]').click();await ready(page,'vh2');
    ok((await page.locator('#screen-context').innerText()).includes('오두막'),width+' 기록은 회관과 분리된 오두막');
    ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+' 미리보기 가로 넘침 없음');
    await page.screenshot({path:__dirname+'/screenshots/ia-cabin-'+width+'.png'});
  }
  await page.setViewportSize({width:1440,height:1000});await page.goto(base+'ia.html');
  await page.locator('#screen-search').fill('vh-2');
  ok(await page.locator('#feature-grid .screen-node').count()===1,'화면 번호 검색과 그룹 필터');
  await page.locator('#screen-search').fill('존재하지않음123');
  ok(await page.locator('#search-empty').isVisible(),'검색 결과 없음 안내');
  await page.click('#clear-search');ok(await page.locator('#feature-grid .feature-group').count()===9,'검색 초기화 · 공동 장소 포함');
  await page.locator('.activity-card[data-activity=rest] a').click();let frame=await ready(page,'fo2');
  await frame.waitForFunction(()=>document.querySelector('#rest-boat .boat-rig')?.dataset.rigState==='ready');
  ok(await frame.evaluate(()=>GachisupVillage.state.activityTag==='휴식'),'낚시 모션 바로가기에서 휴식 세션 시작');
  ok(await frame.evaluate(()=>GachisupActivities.defaultEquipment.rest.owned&&GachisupActivities.defaultEquipment.rest.price===0),'낚싯대 기본 지급·가격 0');
  const first=await frame.locator('#rest-boat').getAttribute('data-fishing-time');
  await frame.waitForFunction(first=>document.querySelector('#rest-boat').dataset.fishingTime!==first,first,{timeout:5000});
  ok(true,'낚싯대와 연결된 줄·찌 모션 재생');
  const line=await frame.locator('.fishing-line').getAttribute('d');
  ok(/^M[\d.]+ [\d.]+ Q/.test(line)&&!line.includes('NaN'),'낚싯줄 끝점이 리그 좌표와 연결');
  await frame.locator('[data-action=motion]').click();const paused=await frame.locator('#rest-boat').getAttribute('data-fishing-time');await page.waitForTimeout(350);
  ok(paused===await frame.locator('#rest-boat').getAttribute('data-fishing-time'),'움직임 줄이기는 낚싯줄까지 정지');
  await frame.locator('[data-action=motion]').click();
  const wallet=await frame.evaluate(()=>GachisupIAApp.ctx().data.wallet);
  await frame.locator('[data-action=finish]').click();await frame.locator('[data-action=confirm-finish]').click();await ready(page,'fo3');
  ok(await frame.evaluate(wallet=>GachisupVillage.state.lastKind==='rest'&&GachisupIAApp.ctx().data.wallet===wallet,wallet), '휴식 종료는 별도 기록·재화 증가 없음');
  await page.goto(base+'ia.html?screen=fo3&activity=rest');frame=await ready(page,'fo3');
  ok(await frame.evaluate(()=>GachisupVillage.state.lastKind==='rest'),'휴식 결과 직접 링크도 휴식 영수증');
  await page.goto(base+'ia.html?screen=fo2&activity=read');await ready(page,'fo2');
  for(const [id,tag] of [['study','공부'],['rest','휴식'],['read','독서']]){
    await page.locator('[data-preview-activity='+id+']').click();frame=await ready(page,'fo2');
    await frame.waitForFunction(tag=>GachisupVillage.state.activityTag===tag,tag);
    ok(new URL(page.url()).searchParams.get('activity')===id,id+' 모션 전환·공유 URL 유지');
  }
  await page.goto(base+'ia.html?screen=vh3&role=MEMBER&background=original&width=768');frame=await ready(page,'vh3');
  ok(await page.locator('#preview-role').inputValue()==='MEMBER'&&await frame.evaluate(()=>GachisupIAApp.ctx().role==='MEMBER'),'그룹원 직접 링크의 역할 유지');
  ok(await frame.evaluate(()=>GachisupBackground.variant==='original'),'이전 배경 비교 선택 유지');
  ok(await page.locator('#screen-preview').getAttribute('width')==='768','768px 실제 iframe 폭 유지');
  await page.goto(base+'ia.html?screen=fo2&activity=rest&role=MEMBER');await ready(page,'fo2');
  await page.click('#mobile-link');await page.waitForFunction(()=>document.querySelector('#mobile-preview')?.contentWindow.GachisupVillage?.state.activityTag==='휴식');
  ok(new URL(page.url()).searchParams.get('activity')==='rest','모바일로 낚시 활동 전달');
  ok(await page.locator('#mobile-screen option').count()===45,'모바일도 같은 45개 화면 분류');
  await page.click('#catalog-link');frame=await ready(page,'fo2');
  ok(await page.locator('#preview-role').inputValue()==='MEMBER'&&await frame.evaluate(()=>GachisupVillage.state.activityTag==='휴식'),'모바일→IA 왕복 시 역할·낚시 유지');
  await page.click('#overview-tab');ok(await page.locator('#overview-panel').isVisible(),'전체 구조 탭 복귀');await page.goBack();await ready(page,'fo2');ok(await page.locator('#preview-panel').isVisible(),'브라우저 뒤로 가기 상태 복원');
  for(const [id,key] of [['vh1','town'],['bd1','board'],['vh2','cabin'],['ob1','tower'],['po1','post'],['hb1','harbor']]){
    await page.goto(base+'index.html?ia='+id+'&preview=1',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.GachisupIAApp);
    const theme=await page.evaluate(()=>{const panel=document.querySelector('#building-panel'),full=document.querySelector('#ia-page'),host=full.hidden?panel:full;return {image:host.querySelector('.island-building-art image')?.getAttribute('href'),paper:getComputedStyle(host).getPropertyValue('--panel-paper').trim()};});
    ok(theme.image==='assets/village-map-cel-v3.png'&&theme.paper==='#fff9ed',key+' 창에서 같은 지도·모래빛 테마 사용');
  }
  ok(errors.length===0,'런타임·로컬 에셋 오류 없음 '+errors.join(';'));
  console.log(count+'개 IA 구조·낚시·섬 테마 검증 통과');await context.close();
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
