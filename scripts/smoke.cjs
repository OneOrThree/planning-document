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
    for(const route of ['index.html','ia.html','mobile.html','feature-inventory.html','user-journey.html','eli5.html','eli5-journey.html','docs/api/v1/index.html']) {
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
      if(route==='docs/api/v1/index.html') {
        assert((await page.title()).includes('협의안'),'API 문서 상태 표시');
        assert.equal(await page.locator('.endpoint').count(),98,'API 기능 계약 수');
        assert((await page.locator('body').innerText()).includes('미정 정책'),'API 미정 정책 표시');
        await page.locator('#search').fill('게스트 회원 전환');
        assert((await page.locator('.endpoint:visible').count())>0,'API 검색');
        await page.locator('#clear').click();
        assert.equal(await page.locator('.endpoint:visible').count(),98,'API 검색 초기화');
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
