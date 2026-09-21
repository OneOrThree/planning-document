/* 문서 탐색만 검증. 앱 기능·서버·제품 저장소는 변경하지 않는다. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const base=((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '') + '/feature-inventory.html');
let checks=0;
const check=(value,note)=>{assert.ok(value,note);checks++;};
(async()=>{
 const browser=await chromium.launch({headless:true});const errors=[];
 try{
  for(const width of [1440,1024,768,414,375,320]){
   const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   page.on('response',r=>{if(r.url().startsWith((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, ''))&&r.status()>=400)errors.push(r.status()+' '+r.url());});
   await page.goto(base,{waitUntil:'networkidle'});
   const storage=await page.evaluate(()=>JSON.stringify({...localStorage}));
   check(await page.locator('#journey-view').isVisible(),'기본 유저 저니');
   check(!(await page.locator('#growth-view').isVisible()),'성장은 기본 저니에서 분리');
   check(await page.locator('#journey-view #island-growth').count()===0,'성장 내용이 저니에 중첩되지 않음');
   check(await page.locator('[data-start-path]').count()===3,'초대/공개 섬/새 섬 경로');
   check(await page.locator('[data-start-path][data-state=confirmed]').count()===3,'세 시작 경로의 방향과 무초대 흐름 확정');
   check(!(await page.locator('.journey-entry').textContent()).includes('초안'),'첫 진입 요약의 이전 초안 표시 제거');
   check((await page.locator('#no-invite-start').textContent()).includes('해금 뒤'),'첫 섬과 이후 이동 해금 구분');
   check(await page.locator('[data-growth-step]').count()===5,'성장 다섯 단계');
   check(await page.locator('[data-growth-branch]').count()===4,'도서관·전망대·우체통·축음기 네 건물');
   check((await page.locator('[data-growth-step=connections]').textContent()).includes('순서 자유')&&(await page.locator('[data-growth-step=shop]').textContent()).includes('다른 모든 건물'),'네 건물 자유 순서·상점 마지막');
   check(await page.locator('[data-growth-optional]').count()===0,'축음기 선택 경로 없이 일반 건물 건설 퀘스트');
   check(await page.locator('.growth-open').getAttribute('data-state')==='discussing','상점 이후/구현 세부 미정');
   check(await page.locator('.growth-cost-table tbody tr').count()===8,'시작 시설·회관·게시판·네 건물·상점 조건 표');
   check(await page.locator('.growth-cost-table .is-open').count()===0&&await page.locator('.growth-cost-table tbody tr:not([data-cost=start]) td:last-child',{hasText:'확정'}).count()===7,'건설 수치는 확정 표시');
   check((await page.locator('.growth-cost-table tbody tr').evaluateAll(es=>es.map(e=>e.dataset.cost).join()))==='start,hall,board,gramophone,library,mailbox,observatory,shop','건설 표 시설 순서');
   const gramophoneCost=await page.locator('[data-cost=gramophone]').textContent(),shopCost=await page.locator('[data-cost=shop]').textContent();
   check(gramophoneCost.includes('고정 총액 1,360마리')&&gramophoneCost.includes('30분'),'축음기 고정 총액 1,360마리·공사 30분');
   check(shopCost.includes('다른 모든 건물')&&shopCost.includes('고정 총액 6,800마리')&&shopCost.includes('4시간'),'상점은 마지막·고정 총액 6,800마리·공사 4시간');
   const growthText=await page.locator('#growth-view').textContent();
   check(!/마을 포인트|\d+P\b|돛단배|개인 물고기|배 위 낚시|대상 인원 × 1인당 요구량/.test(growthText)&&growthText.includes('고정 총액')&&growthText.includes('각자 몫')&&growthText.includes('완료 도장'),'성장 탭 옛 재화·인원 비례 총액 제거, 고정 총액·각자 몫·완료 도장 규칙');
   check(await page.locator('#growth-economy .growth-economy-grid article').count()===3,'집중·일일 퀘스트·건설 퀘스트 재화 카드');
   check(await page.locator('#growth-view a[href="policy-2026-09-14.md"]').count()>0&&await page.locator('#growth-view a[href="revisions/04-island-growth.html"]').count()===1,'정책 원문 추가·04 원문 링크 유지');
   check(await page.locator('#growth-pending a[href="?tab=decisions#decision-policy-building-quest"]').count()===1&&await page.locator('#growth-pending a[href="?tab=decisions#decision-growth-tab"]').count()===1,'건설 퀘스트·탭 분리 결정 로그 연결');
   check((await page.locator('.journey-return').textContent()).includes('낚시섬의 기존 위치')&&!(await page.locator('.journey-return').textContent()).includes('부두'),'휴식 뒤 낚시섬의 기존 자유 위치로 복귀');
   const mailboxBranch=await page.locator('[data-growth-branch=mailbox]').textContent();
   check(mailboxBranch.includes('비동기 편지')&&mailboxBranch.includes('내 뗏목')&&mailboxBranch.includes('실시간 1:1 채팅방은 두지 않아요'),'우체통: 섬 편지방 + 친구 비동기 편지·친구 관리는 내 뗏목');
   check(await page.locator('#no-invite-start a[href="no-invite-story-plan.md"]').count()===1,'초대 없는 이야기 검토 초안 연결');
   await page.locator('#tab-growth').click();
   await page.locator('.growth-roadmap a[href="#growth-facility-connections"]').click();
   check(await page.locator('.growth-facility-details').evaluate(e=>e.open),'발전 지도 클릭 시 시설 설명 펼침');
   check(await page.locator('#growth-view').isVisible(),'시설 설명 바로가기에서 성장 탭 유지');
   for(const tab of ['journey','growth','story','wrapping','detail','decisions']){
    await page.locator('[data-planning-tab='+tab+']').click();
    check(await page.locator('[role=tabpanel]:visible').count()===1,tab+' 패널은 하나만');
    check(await page.locator('[role=tab][aria-selected=true]').count()===1,tab+' 선택 하나만');
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+' '+tab+' 가로 넘침 없음');
    check(await page.locator('[role=tab]').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().height>=44&&e.getBoundingClientRect().width>=44)),'탭 터치 영역');
    check(await page.locator('[role=tab] strong').evaluateAll(es=>es.every(e=>{const range=document.createRange();range.selectNodeContents(e);return range.getClientRects().length===1;})),'탭 제목 줄바꿈 없음');
   }
   const entries=await page.evaluate(()=>GachisupDecisionLog);
   check(entries.length===47,'결정 로그 47건');
   for(const id of ['catus-separate-app-policy-date','privacy-storage-baseline','auth-provider-platform-matrix','withdrawal-data-disposition','onboarding-privacy-consent','policy-golden-fish','focus-emote-symbol-stickers','policy-fish-currency','policy-building-quest','policy-daily-quest-reward','policy-focus-fishing-island','policy-library','policy-join-capacity','policy-observatory-ranking','policy-shop-anyone','policy-art-guides','policy-friends','policy-mailbox-friend-chat'])check(entries.find(e=>e.id===id)?.status==='confirmed','현재 정책 확정 로그 '+id);
   for(const id of ['focus-rest','growth','decoration','letters','music','open-policy','old-rooms'])check(entries.find(e=>e.id===id)?.status==='superseded','현재 정책으로 대체한 이전안 '+id);
   for(const state of ['confirmed','discussing','superseded']){
    await page.locator('[data-log-filter='+state+']').click();
    check(await page.locator('.decision-entry:visible').count()===entries.filter(e=>e.status===state).length,state+' 필터');
   }
   await page.locator('[data-log-filter=all]').click();
   await page.locator('[data-planning-tab=decisions]').focus();await page.keyboard.press('Home');
   check(await page.locator('#tab-journey').evaluate(e=>e===document.activeElement),'Home 키');
   await page.keyboard.press('ArrowRight');check(await page.locator('#growth-view').isVisible(),'방향키 탭 전환');
   await page.keyboard.press('End');check(await page.locator('#decisions-view').isVisible(),'End 키');
   await page.reload();check(await page.locator('#decisions-view').isVisible(),'새로고침 복원');
   await page.goBack();check(await page.locator('#growth-view').isVisible(),'뒤로가기 복원');
   await page.goForward();check(await page.locator('#decisions-view').isVisible(),'앞으로가기 복원');
   for(const [suffix,id] of [['#latest-growth-decoration','overview-view'],['#wrapping','wrapping-view'],['?mode=detail&group=focus','detail-view'],['#feature-I05','detail-view'],['?tab=journey#island-growth','growth-view'],['?tab=growth','growth-view'],['?tab=decisions#decision-mailbox','decisions-view']]){
    await page.goto(base+suffix);
    check(await page.locator('#'+id).isVisible(),'기존/새 바로가기 '+suffix);
    check(await page.locator('.planning-tabs').evaluate(e=>e.getBoundingClientRect().top>=0),'바로가기에서도 탭 노출');
   }
   check(!(await page.locator('#decision-mailbox').textContent()).includes('확인 중'),'우체통 결정 해소');
   await page.goto(base+'?tab=decisions#decision-policy-building-quest');check(await page.locator('#decision-policy-building-quest').isVisible(),'성장 탭에서 연결한 건설 퀘스트 결정 앵커');
   await page.goto(base+'?mode=detail&group=focus');await page.locator('#search').fill('낚시');
   const filtered=await page.locator('.feature:visible').count();check(filtered>0,'집중 낚시 검색 결과');
   await page.locator('#tab-story').click();await page.locator('#tab-detail').click();
   check(await page.locator('#search').inputValue()==='낚시','탭 이동 뒤 검색 유지');
   check(await page.locator('#group-filter').inputValue()==='focus','탭 이동 뒤 영역 유지');
   check(await page.locator('.feature:visible').count()===filtered,'필터 결과 유지');
   await page.locator('#tab-story').click();await page.evaluate(()=>window.scrollTo(0,4000));
   await page.locator('#tab-wrapping').click();
   check(await page.locator('#wrapping').evaluate(e=>{const box=e.getBoundingClientRect();return box.top>=0&&box.bottom<=innerHeight;}),'긴 문서에서 탭 전환하면 새 문서 상단 표시');
   await page.goto(base+'?tab=story#prologue-scenarios');
   check(await page.locator('#overview-view').isVisible(),'도입 후보 바로가기는 이야기 탭');
   check(await page.locator('[data-prologue][data-state=proposal]').count()===3,'도입 후보 세 개는 미확정');
   const options=await page.evaluate(()=>GachisupPrologues);
   const prologueMD=fs.readFileSync('prologue-scenarios.md','utf8');
   check(new Set(options.map(o=>o.id)).size===3,'도입 후보 ID 고유');
   for(const option of options){
    const card=page.locator('[data-prologue='+option.id+']');
    await card.locator('summary').first().click();
    check(await card.locator('li:visible').count()===4,'도입 장면 네 개 '+option.id);
    check((await card.textContent()).includes(option.whyRaft),'뗏목 탑승 이유 표시');
    for(const text of [...option.scenes,option.title,option.whyRaft,option.together,option.invite,option.discover,option.tradeoff,option.production,option.question])check(prologueMD.includes(text),'도입 웹/원문 동일 '+option.id);
    check(await card.locator('summary').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().height>=44)),'도입 펼침 터치 영역');
   }
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+' 펼친 도입 가로 넘침 없음');
   for(const id of ['no-invite-story-approved','prejoin-information','first-island-setup','first-island-invite'])check(entries.find(e=>e.id===id)?.status==='confirmed','최종 승인 로그 '+id);
   check(entries.find(e=>e.id==='prologue-candidates')?.status==='discussing','새 도입은 평가 전');
   check(entries.find(e=>e.id==='first-map')?.status==='superseded','지도 제안 이전 기록 보존');
   const features=await page.evaluate(()=>GachisupFeatureInventory.features);
   for(const id of ['B01','B03','B05','B08','B09','B10']){
    const feature=features.find(f=>f.id===id);
    check(feature.decision==='chosen'&&feature.proof==='pending','문서 확정과 구현 증거 분리 '+id);
   }
   if([1440,375].includes(width))await page.screenshot({path:'/tmp/gachisup-prologues-'+width+'.png'});
   check(await page.evaluate(()=>JSON.stringify({...localStorage}))===storage,'제품 localStorage 미변경');
   if([1440,768,414,375,320].includes(width)){
    await page.goto(base);await page.screenshot({path:'/tmp/gachisup-planning-'+width+'.png'});
    await page.locator('#tab-decisions').click();await page.screenshot({path:'/tmp/gachisup-decisions-'+width+'.png'});
    await page.goto(base+'?tab=growth');await page.screenshot({path:'/tmp/gachisup-growth-flow-'+width+'.png'});
   }
   const md=fs.readFileSync('decision-log.md','utf8');for(const e of entries)check(md.includes(e.title)&&md.includes(e.body),'웹/Markdown 로그 동일 '+e.id);
   await context.close();
  }
  check(!errors.length,'브라우저 오류·404 없음');console.log(JSON.stringify({checks,errors},null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
