/* 실행: node verify-design-polish.cjs. 격리 브라우저 데이터만 사용한다. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.VILLAGE_URL||(process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '');
const out=path.join(__dirname,'tmp/verification','design-polish');fs.mkdirSync(out,{recursive:true});
let count=0;const errors=[];
const ok=(value,label)=>{assert.ok(value,label);count++;console.log('✓ '+label);};
const ready=async page=>{await page.waitForFunction(()=>window.GachisupIAApp&&document.querySelector('#load-state').hidden);await page.evaluate(()=>Promise.all([document.fonts.ready,GachisupActivities.ready]));};
const size=locator=>locator.evaluateAll(elements=>elements.map(e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height,top:r.top,bottom:r.bottom};}));
const choose=async(page,id)=>{await page.locator('#activity-choice-'+id).click();await page.waitForFunction(id=>GachisupVillage.state.activityTag===GachisupActivities.specs[id].tag,id);};
(async()=>{
  const browser=await chromium.launch();
  try{
    for(const [width,height] of [[390,844],[320,640],[390,770],[768,1024],[1440,960]]){
      const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
      const page=await context.newPage(),label=width+'×'+height;
      page.on('pageerror',e=>errors.push(label+' '+e.message));
      page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(r.status()+' '+r.url());});
      try{
        await page.goto(base+'/index.html?ia=fo1&preview=1');await ready(page);
        const options=await size(page.locator('.activity-choices [role=radio]'));
        ok(options.length===3&&options.every(r=>r.width>=44&&r.height>=44&&r.top>0&&r.bottom<height),label+' 세 활동이 처음부터 보이고 조작 영역 44px 이상');
        ok(await page.locator('.activity-choices [aria-checked=true]').count()===1&&await page.locator('#activity-choice-read').getAttribute('tabindex')==='0',label+' 단일 선택·키보드 진입점');
        ok(await page.locator('.activity-preview p').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=15),label+' 활동 설명 15px 이상');
        const footer=await size(page.locator('.panel-footer [data-action=start]'));
        ok(footer[0].height>=52&&footer[0].bottom<=height,label+' 시작 버튼은 스크롤과 별도로 화면에 유지');
        const durationVisible=await page.locator('.duration-options').evaluate(e=>e.getBoundingClientRect().bottom<=document.querySelector('.panel-footer').getBoundingClientRect().top);
        ok(durationVisible,label+' 초기 시간 선택이 고정 하단에 가리지 않음');
        await page.screenshot({path:path.join(out,label+'-read.png')});
        await page.locator('#activity-choice-read').focus();await page.keyboard.press('ArrowRight');
        ok(await page.locator('#focus-task').inputValue()==='공부'&&await page.locator('#activity-choice-study').evaluate(e=>e===document.activeElement),label+' 방향키 선택 후 포커스 유지');
        await page.locator('#activity-kind-work').click();
        ok(await page.locator('#focus-task').inputValue()==='작업'&&(await page.locator('[data-action=start]').innerText()).includes('작업'),label+' 공부의 작업 세부 기록 유지');
        await page.locator('[data-duration="50"]').click();
        await choose(page,'read');
        ok(await page.evaluate(()=>GachisupVillage.state.duration)===50,label+' 독서·공부 사이 선택 시간 유지');
        await choose(page,'rest');
        ok(await page.evaluate(()=>GachisupVillage.state.duration)===10&&(await page.locator('.fishing-default-item').innerText()).includes('무료 제공'),label+' 휴식은 10분 기본·무료 낚싯대');
        ok(new URL(page.url()).searchParams.get('activity')==='rest',label+' 선택 활동과 IA 주소 동기화');
        ok(await page.locator('.activity-preview').getAttribute('data-preview')==='rest'&&(await page.locator('[data-action=start]').innerText()).includes('낚시하며'),label+' 장소 미리보기와 시작 문구 함께 변경');
        await page.screenshot({path:path.join(out,label+'-rest.png')});
        await page.locator('#activity-choice-rest').focus();await page.keyboard.press('Home');
        ok(await page.locator('#focus-task').inputValue()==='독서',label+' Home 키 첫 활동 선택');
        await page.keyboard.press('End');
        ok(await page.locator('#focus-task').inputValue()==='휴식',label+' End 키 마지막 활동 선택');
        await page.locator('#focus-task').selectOption('작업');
        ok(await page.locator('#activity-choice-study').getAttribute('aria-checked')==='true',label+' 기존 태그 API와 새 UI 일치');
        await page.screenshot({path:path.join(out,label+'-study.png')});
        await page.goto(base+'/index.html?ia=bd1&preview=1');await ready(page);
        ok(await page.locator('.board-post p').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize)===16),label+' 공지 본문 16px');
        ok(await page.locator('.panel-footer .panel-footnote').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=12),label+' 저장·미전송 안내 12px 이상');
        const header=page.locator('.panel-header button:visible');
        ok((await size(header)).every(r=>r.width>=44&&r.height>=44),label+' 닫기·펼치기 실제 영역 44px');
        await page.screenshot({path:path.join(out,label+'-notice.png')});
        await page.locator('.board-post').first().click();
        ok(await page.locator('.post-content').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)===16),label+' 게시글 상세도 본문 16px');
        await page.goto(base+'/index.html?ia=vh2&preview=1');await ready(page);
        ok((await size(page.locator('.stat-period button,.date-navigator button'))).every(r=>r.width>=44&&r.height>=44),label+' 통계 기간·날짜 조작 영역 44px');
        ok(await page.locator('.stat-highlights small').evaluateAll(es=>es.every(e=>parseFloat(getComputedStyle(e).fontSize)>=12)),label+' 통계 요약 캡션 12px');
        const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1||[...document.querySelectorAll('.building-content,.panel-header,.panel-footer')].some(e=>e.scrollWidth>e.clientWidth+2));
        ok(!overflow,label+' 패널 가로 넘침 없음');
        await page.screenshot({path:path.join(out,label+'-cabin.png')});
      }finally{await context.close();}
    }
    ok(errors.length===0,'런타임·로컬 리소스 오류 없음: '+errors.join('; '));
    console.log(count+'개 디자인 개선 검증 통과');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
