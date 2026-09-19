/* 문서의 선택 경로·전체 이야기·탐색만 검증한다. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium} = require('playwright');
const base = ((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '') + '/feature-inventory.html');
let checks = 0;
const check = (value, note) => {assert.ok(value, note); checks++;};
(async () => {
  const browser = await chromium.launch({headless:true});
  const errors = [];
  try {
    for (const width of [1440,768,375,320]) {
      const context = await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
      const page = await context.newPage();
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', r => {if(r.url().startsWith((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '')) && r.status() >= 400) errors.push(r.status()+' '+r.url());});
      await page.goto(base, {waitUntil:'networkidle'});
      const storage = await page.evaluate(() => JSON.stringify({...localStorage}));
      check(await page.locator('.journey-starts [data-journey-choice]').count() === 3, '세 경로 선택 연결');
      check(await page.locator('#journey-route').isHidden(), '선택 전에는 요약 루프');
      const choose = page.locator('.journey-starts [data-journey-choice=invite]');
      await choose.focus();
      await page.keyboard.press('Enter');
      check(await page.locator('#journey-route').isVisible(), '키보드로 초대 전체 경로 펼치기');
      check(await page.locator('#journey-route').getAttribute('data-active-route') === 'invite', '초대 경로 선택');
      check(await page.locator('[data-route-scene]:visible').count() === 9, '초대 경로 아홉 장면 모두 노출');
      check(await page.locator('.journey-loop').isHidden(), '선택 후 중복 요약 루프 숨김');
      check(await page.locator('#journey-route-title').evaluate(e => e === document.activeElement), '선택 뒤 본문 제목으로 포커스');
      const routes = await page.evaluate(() => GachisupJourneyRoutes);
      for (const [key, route] of Object.entries(routes)) {
        await page.locator('.route-switcher [data-journey-choice='+key+']').click();
        for (const step of route.steps) {
          const scene = page.locator('[data-route-scene='+step.id+']');
          check(await scene.isVisible(), key+' '+step.id+' 본문 노출');
          check((await scene.textContent()).includes(step.scene) && (await scene.textContent()).includes(step.next), '장면·다음 동작 누락 없음');
          check(await scene.locator('details').count() === 1, '예외·미정은 별도');
        }
        check(await page.locator('[role=tabpanel]:visible').count() === 1, '기획 탭 패널 중첩 없음');
        check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), width+' '+key+' 가로 넘침 없음');
        check(await page.locator('.journey-choice').evaluateAll(es => es.every(e => e.getBoundingClientRect().height >= 44)), '선택 링크 터치 영역');
        await page.reload();
        check(await page.locator('#journey-route').getAttribute('data-active-route') === key, '새로고침 경로 유지');
      }
      await page.goBack();
      check(await page.locator('#journey-route').getAttribute('data-active-route') === 'public', '뒤로가기 공개 섬 경로');
      await page.goForward();
      check(await page.locator('#journey-route').getAttribute('data-active-route') === 'create', '앞으로가기 새 섬 경로');
      for(const key of ['public','create']){
        await page.goto(base+'?tab=journey&route='+key+'#journey-route');
        check((await page.locator('.route-reading-note').textContent())===routes[key].readingNote,'경로별 확정 안내 '+key);
        check(routes[key].steps.every(step=>step.state.includes('확정')),'무초대 장면 확정 상태 '+key);
      }
      const pub=routes.public.steps.find(step=>step.id==='introduction');
      check(pub.boundary.includes('가입 전 비공개')&&pub.boundary.includes('공개 범위·권한'),'가입 전후 개인 정보 보호');
      const create=routes.create.steps.find(step=>step.id==='create');
      check(create.action.includes('원할 때만')&&create.action.includes('생성 전에'),'선택 소개·생성 전 공개 범위');
      check(create.next.includes('생성 성공')&&create.next.includes('방금 이름 붙인 섬'),'B1에서 B2의 같은 섬으로');
      check(routes.create.steps.find(step=>step.id==='arrival').boundary.includes('우체통 건설 전'),'우체통 전 초기 초대');
      const loop=Object.fromEntries(routes.invite.steps.map(step=>[step.id,step]));
      check(loop.focus.scene.includes('내가 고른 위치')&&loop.focus.scene.includes('카운트업')&&loop.focus.action.includes('1분마다 물고기 1마리'),'집중: 낚시 섬 자유 위치·카운트업·1분 1마리');
      check(loop.rest.scene.includes('전용 휴식 화면')&&loop.rest.scene.includes('식빵')&&loop.rest.scene.includes('휴식 경과 시간')&&loop.rest.next.includes('직전 집중 위치'),'휴식: 전용 모닥불 화면·식빵 굽기·재개 시 직전 자유 위치');
      check(!JSON.stringify(routes.public).includes('초대 코드'),'공개 섬 둘러보기에는 초대 코드 입력 없음');
      check(loop.prepare.scene.includes('목표 시간은 정하지 않는다')&&loop.finish.boundary.includes('일일 퀘스트'),'준비는 목표 시간 없음·마무리는 섬 물고기와 일일 퀘스트 보상');
      check(Object.values(routes).every(route=>!/배 위|포모도로|마을 포인트|개인에게 간다/.test(JSON.stringify(route))),'세 경로 모두 옛 집중·재화 문구 없음');
      await page.goto(base+'?tab=journey&route=invite#route-invite-join');
      await page.locator('#route-invite-join summary').click();
      const joinText = await page.locator('#route-invite-join').textContent();
      check(joinText.includes('로그인') && joinText.includes('미정') && joinText.includes('승인 대기'), '가입 순서·승인 예외를 임의 확정하지 않음');
      const md = fs.readFileSync('invite-story-plan.md','utf8');
      for (const step of routes.invite.steps) check(md.includes(step.scene) && md.includes(step.action) && md.includes(step.boundary), '웹과 초대 원문 동일 '+step.id);
      const response = await context.request.get(((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '') + '/invite-story-plan.md'));
      check(response.ok(), '초대 경로 원문 연결');
      await page.goto(base+'?tab=journey&route=invite#journey-route');
      await page.screenshot({path:'/tmp/gachisup-invite-route-'+width+'.png'});
      await page.locator('#tab-growth').click();
      check(await page.locator('#growth-view').isVisible(), '경로에서 성장 탭 이동');
      await page.goBack();
      check(await page.locator('#journey-route').getAttribute('data-active-route') === 'invite', '탭 이동 뒤 브라우저 복귀');
      await page.goto(base);
      check(await page.locator('.journey-loop').isVisible() && await page.locator('#journey-route').isHidden(), '경로 없는 기본 진입 복원');
      check(await page.evaluate(() => JSON.stringify({...localStorage})) === storage, '제품 저장소 변경 없음');
      await context.close();
    }
    check(errors.length === 0, '브라우저 오류 없음: '+errors.join(', '));
    console.log(JSON.stringify({checks,errors},null,2));
  } finally {await browser.close();}
})().catch(error => {console.error(error);process.exitCode = 1;});
