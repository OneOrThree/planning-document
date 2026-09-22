const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:4173/';
(async()=>{
  const browser = await chromium.launch({headless:true});
  const errors=[], results=[];
  try {
    const context = await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
    const page = await context.newPage();
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',res=>{if(res.url().startsWith(base) && res.status()>=400)errors.push(res.status()+' '+res.url());});
    page.on('requestfailed',req=>{if(req.url().startsWith(base) && !req.failure()?.errorText.includes('ERR_ABORTED'))errors.push(req.url()+' '+req.failure()?.errorText);});
    for(const route of ['index.html','emote-review.html','feature-inventory.html','user-journey.html','eli5.html','eli5-journey.html','docs/api/v1/index.html','docs/ia/v5/index.html','docs/user-journey/v5/index.html']) {
      const response = await page.goto(new URL(route,base).href,{waitUntil:'networkidle'});
      assert(response.ok(),route+' 응답');
      assert((await page.locator('body').innerText()).trim().length>30,route+' 빈 화면');
      if(route==='feature-inventory.html') {
        assert.equal(await page.locator('[data-planning-tab]').count(),6);
        for(const tab of ['journey','growth','story','wrapping','detail','decisions']) {
          await page.locator('[data-planning-tab='+tab+']').click();
          assert.equal(await page.locator('[role=tabpanel]:visible').count(),1);
          assert.equal(await page.locator('[data-planning-tab='+tab+']').getAttribute('aria-selected'),'true');
        }
      }
      if(route==='emote-review.html') {
        assert.equal(await page.locator('.emote').count(),5,'집중 이모티콘 5종');
        assert.equal(await page.locator('.bubble img').getAttribute('src'),'assets/gachisup-r61/ui/emotes/cheer.png','고양이 위 말풍선 예시');
      }
      if(route==='docs/api/v1/index.html') {
        assert((await page.title()).includes('협의안'),'API 문서 상태 표시');
        assert.equal(await page.locator('.api-header .back-link').getAttribute('href'),'../../../feature-inventory.html?tab=growth','API 문서 기획 화면 복귀 링크');
        assert.equal(await page.locator('.api-header a[aria-current=page]').innerText(),'API-스펙','API 문서 현재 위치 표시');
        assert.equal(await page.locator('body > aside').count(),0,'API 문서 고정 포털 사이드바 제거');
        assert.equal(await page.locator('.endpoint').count(),101,'API 기능 계약 수');
        assert((await page.locator('body').innerText()).includes('미정 정책'),'API 미정 정책 표시');
        await page.locator('#search').fill('게스트 회원 전환');
        assert((await page.locator('.endpoint:visible').count())>0,'API 검색');
        await page.locator('#clear').click();
        assert.equal(await page.locator('.endpoint:visible').count(),101,'API 검색 초기화');
      }
      if(route==='docs/ia/v5/index.html') {
        assert((await page.title()).includes('IA v5'),'IA v5 제목');
        assert.equal(await page.locator('.links a').first().getAttribute('href'),'../../../feature-inventory.html?tab=journey','IA 기획 작업대 복귀 링크');
        assert.equal(await page.locator('#data').count(),1,'IA 데이터');
        assert((await page.locator('body').innerText()).includes('우리 섬 채팅방'),'IA 채팅방 명칭');
      }
      if(route==='docs/user-journey/v5/index.html') {
        assert((await page.title()).includes('사용자 여정 v5'),'사용자 여정 v5 제목');
        assert.equal(await page.locator('[data-journey]').count(),10,'사용자 여정 10개');
        assert((await page.locator('body').innerText()).includes('게스트로 시작'),'게스트·회원 전환 여정 표시');
        assert((await page.locator('body').innerText()).includes('우리 섬 채팅방'),'사용자 여정 채팅방 명칭');
        assert(!(await page.locator('body').innerText()).includes('편지방'),'사용자 여정 이전 명칭 제거');
      }
      results.push(route);
    }
    for(const [route,selector,ids] of [['rig.html','#character-select',['momo','puppy','golden','capybara','red-panda']],['walk.html','#walk-character-select',['momo','puppy','capybara','red-panda']]]) {
      await page.goto(new URL(route,base).href,{waitUntil:'networkidle'});
      for(const id of ids){await page.locator(selector).selectOption(id);await page.waitForLoadState('networkidle');assert.equal(new URL(page.url()).searchParams.get('character'),id);results.push(route+':'+id);}
    }
    for(const file of ['decision-log.md','invite-story-plan.md','output/pdf/gachisup-mentor-report-2026-09-09-compact.pdf']) {
      const res = await context.request.get(new URL(file,base).href); assert(res.ok(),file+' 다운로드');results.push(file);
    }
    assert.deepEqual(errors,[],'브라우저·동일 사이트 리소스 오류');
    console.log(JSON.stringify({result:'PASS',base,routes:results,errors},null,2));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
