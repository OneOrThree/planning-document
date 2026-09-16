/* 서사 설명의 동작/경계 검증. 실제 앱이나 사용자 프로필은 변경하지 않는다. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const base=((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '') + '/feature-inventory.html');
let checks=0;
function check(value,note){assert.ok(value,note);checks++;}
(async()=>{
  const browser=await chromium.launch({headless:true}),errors=[];
  fs.mkdirSync(path.join(__dirname,'tmp/verification/feature-story'),{recursive:true});
  try{
    for(const width of [1440,768,390,320]){
      const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
      const page=await context.newPage();
      page.on('pageerror',e=>errors.push(e.message));
      page.on('response',r=>{if(r.url().startsWith((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, ''))&&r.status()>=400)errors.push(r.status()+' '+r.url());});
      await page.goto(base+'?tab=story',{waitUntil:'networkidle'});
      const before=await page.evaluate(()=>JSON.stringify({...localStorage}));
      const noOverflow=async()=>check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),width+' 가로 넘침 없음');
      check(await page.locator('[data-chapter]').count()===5,'이야기 다섯 장');
      await page.locator('[data-planning-tab=wrapping]').click();
      check(await page.locator('.overview-card:visible').count()===8,'기능 표현 탭에서 큰 기능 8개 유지');
      await page.locator('[data-planning-tab=story]').click();
      check(await page.locator('[data-village-topic]').count()===4,'02번 재검토 안건 네 묶음');
      check(await page.locator('#village-review').getAttribute('data-state')==='discussing','02번의 새 표현은 아직 논의 중');
      check(await page.locator('#village-social').getAttribute('data-state')==='proposal','마을 인사·만남 모션은 논의안');
      check(await page.locator('[data-village-interaction]').count()===2,'직접 인사와 자동 만남 모션 구분');
      const social=await page.locator('#village-social').textContent();
      check(social.includes('답장을 자동으로 만들어내지는 않아요')&&social.includes('자동 모션을 실제 사용자가 보낸'),'자동 연출을 실제 사용자 반응과 구분');
      check(social.includes('집중 중인 캐릭터의 행동을')&&social.includes('수신 숨김·차단')&&social.includes('동작 줄이기'),'집중·수신·접근성 경계 기록');
      check(await page.locator('[data-overview=stay] .village-review-link').getAttribute('href')==='#village-review','02번 카드에서 세부 논의로 연결');
      check(await page.locator('#detail-view').isHidden(),'현행 세부 목록은 별도 유지');
      check(await page.locator('#letter-decision').getAttribute('data-state')==='confirmed','콕찌르기 제외·편지 유지 결정 명시');
      const letterDecision=await page.locator('#letter-decision').textContent();
      check(letterDecision.includes('그룹 전체 대화')&&letterDecision.includes('친구 편지'),'섬 전체 편지방·친구 편지 구분');
      check(letterDecision.includes('열었다가 닫으면 삭제')&&letterDecision.includes('실시간 1:1 채팅방은 제공하지 않아요'),'휘발성 비동기 편지·채팅방 제외');
      check(letterDecision.includes('교체 전')&&letterDecision.includes('미구현'),'결정과 기존 시연의 차이 명시');
      check(await page.locator('[data-chapter=stay]').textContent()==='02함께하다','두 번째 단계는 함께하다');
      const together=await page.evaluate(()=>GachisupFeatureStory.find(s=>s.id==='stay'));
      check(together.description.includes('함께할 목표')&&together.description.includes('참여')&&together.description.includes('도전과 완성'),'함께할 목표·참여·공동 결과 명시');
      check(!together.voice.includes('각자 하던 일')&&!together.description.includes('말없이'),'수동적인 공존 문구 제거');
      const focus=await page.evaluate(()=>GachisupFeatureOverview.find(f=>f.id==='focus'));
      check(focus.action.includes('할 일')&&focus.action.includes('같은 섬 주민'),'할 일과 낚시·동료의 존재 우선');
      check(focus.place.includes('전용 모닥불 화면')&&focus.place.includes('식빵 굽기'),'전용 모닥불 화면의 식빵 굽기 휴식');
      const [grow,decorate]=await page.evaluate(()=>['grow','decorate'].map(id=>GachisupFeatureOverview.find(f=>f.id===id)));
      check(grow.place.includes('건설 퀘스트')&&grow.purpose.includes('강아지 상점 NPC')&&!/마을 포인트|\d+P\b|개인 ?80%/.test(JSON.stringify(grow)),'섬 물고기 하나·건물 건설 퀘스트·상점 마지막');
      check(decorate.action.includes('기본 뗏목')&&decorate.action.includes('주민 누구나')&&!/돛단배|마을 포인트|섬 포인트/.test(JSON.stringify(decorate)),'모두 같은 기본 뗏목·주민 누구나 구매');
      check(await page.locator('#story-ledger [data-state=confirmed]').count()===3,'진입·초대장·뗏목 방향 확정');
      check(await page.locator('#story-ledger [data-story-step]').count()===6,'대화 기록의 여섯 단계');
      check(await page.locator('[data-quest-candidate]').count()===5,'과거 퀘스트 후보 다섯 개 보존');
      check(!(await page.locator('#previous-growth-proposals').evaluate(e=>e.open)),'이전 80:20·성장 논의는 접힌 과거 기록');
      check(await page.locator('#latest-growth-decoration').isVisible(),'04·07 최신 결정을 현재 화면에 표시');
      const latest=await page.locator('#latest-growth-decoration').textContent();
      check(!/마을 포인트|\d+P\b|돛단배|배 위 낚시|개인 물고기/.test(latest)&&latest.includes('건물 건설 퀘스트')&&latest.includes('낚시섬'),'최신 결정 요약을 현재 정책으로 갱신');
      check(await page.locator('#latest-growth-decoration a[href="revisions/07-personal-shared-decoration.html"]').count()===1&&await page.locator('#latest-growth-decoration a[href="policy-2026-09-14.md"]').count()===2,'꾸미기 원문·현재 정책 연결');
      check((await page.locator('#quest-ideas').textContent()).includes('아직 선택하거나 구현한 퀘스트가 아니에요'),'퀘스트는 채택·구현 전 후보임을 명시');
      check(await page.locator('[data-reward-path]').count()===2,'두 판정 유형과 보상 연결');
      check(await page.locator('#quest-rewards').getAttribute('data-state')==='proposal','보상 분리는 아직 제안');
      check(await page.locator('#reward-split').getAttribute('data-state')==='proposal','개인·섬 비율 배분은 아직 제안');
      const split=await page.locator('#reward-split').textContent();
      check(split.includes('비율·지급량 미확정')&&split.includes('총보상 100개 = 내 주머니 80개 + 섬 공동 금고 20개'),'100의 배분 예시는 확정 수치와 구분');
      check(split.includes('추가 발행하는 것이 아니라')&&split.includes('기존 개인 잔액')&&split.includes('참여 전에'),'추가 발행·소급 징수 방지 및 사전 고지');
      check(await page.locator('#personal-raft').getAttribute('data-state')==='scope-confirmed','개인 뗏목의 용도·최소 범위 확정');
      check(await page.locator('[data-space-scope]').count()===2,'개인 꾸밈과 공동 활동 구분');
      const raftProposal=await page.locator('#personal-raft').textContent();
      check(raftProposal.includes('관상용이며 꾸미기 요소를 최소')&&raftProposal.includes('절대 집중방으로 쓰지 않아요'),'최소 꾸미기·집중방 금지 명시');
      check(raftProposal.includes('장식 종류·개수는 미정')&&raftProposal.includes('개인 재화의 주 사용처'),'장식 목록·개인 재화 용도까지 임의 확정하지 않기');
      check(raftProposal.includes('흩어져 집중하는 구조로 바꾸지 않아요')&&raftProposal.includes('현재 접속 중이라고 표시하지 않아요'),'공동 집중 유지·가짜 접속 표시 방지');
      check((await page.locator('[data-reward-path=screen]').textContent()).includes('n시간 이하'),'폰 사용 목표는 상한 이하');
      check(!(await page.locator('.earlier-quest-ideas').evaluate(e=>e.open)),'이전 다섯 아이디어는 접힌 참고로 보존');
      check(focus.action.includes('낚시섬')&&focus.boundary.includes('같은 자리·같은 세션')&&focus.boundary.includes('채팅')&&!/포모도로|배 위/.test(focus.action+focus.place+focus.boundary),'낚시섬 자유 자리·전용 휴식·조작 경계');
      check(focus.boundary.includes('restSeat')&&focus.boundary.includes('섬 화면'),'자동 휴식 자리·종료 흐름 명시');
      for(const id of ['find','stay','build','gather','return']){
        await page.locator('[data-chapter='+id+']').click();
        check(await page.locator('[data-chapter='+id+']').getAttribute('aria-current')==='step',id+' 장면 선택');
        check(await page.locator('#story-world [data-place=our-island]').count()===1,id+' 같은 섬 재사용');
        check((await page.locator('#story-world').getAttribute('aria-label')).length>10,'그림 대체 설명');
        check((await page.locator('#story-description').textContent()).length>20,'이야기 설명 존재');
        await noOverflow();
        if(['find','gather','return'].includes(id))check(await page.locator('#story-world [data-watercraft=raft]').count()===1,'이동 수단은 뗏목');
        check(await page.locator('#story-world image').evaluateAll(es=>es.every(e=>!(e.getAttribute('href')||'').includes('boat'))),'배 원화 사용 없음');
        if([1440,390].includes(width)&&['find','gather','return'].includes(id)){
          await page.locator('.story-section').scrollIntoViewIfNeeded();
          await page.screenshot({path:path.join(__dirname,'tmp/verification/feature-story',width+'-'+id+'.png')});
        }
      }
      await page.reload();check(await page.locator('[data-chapter=return]').getAttribute('aria-current')==='step','새로고침 이야기 복원');
      await page.goBack();check(await page.locator('[data-chapter=gather]').getAttribute('aria-current')==='step','뒤로가기 이야기 복원');
      await page.locator('[data-chapter=gather]').focus();await page.keyboard.press('Home');
      check(await page.locator('[data-chapter=find]').evaluate(e=>e===document.activeElement),'키보드 Home');
      await page.keyboard.press('ArrowRight');check(await page.locator('[data-chapter=stay]').getAttribute('aria-current')==='step','키보드 다음 장');
      check(await page.evaluate(()=>GachisupFeatureOverview.every(f=>f.headline&&f.action&&f.place&&f.purpose&&f.boundary)),'8개 모두 래핑·행동·역할·경계 보유');
      await page.locator('.overview-intro .wrapping-jump').click();
      for(const card of await page.locator('.overview-card').all()){
        await card.locator('summary').click();check(await card.locator('.wrapping-guard').isVisible(),'기능별 경계 표시');
        await noOverflow();await card.locator('summary').click();
      }
      if([1440,390].includes(width)){
        await page.locator('#wrapping').scrollIntoViewIfNeeded();
        await page.screenshot({path:path.join(__dirname,'tmp/verification/feature-story',width+'-wrapping.png')});
      }
      await page.locator('.story-decisions summary').click();
      const storyDecisions=await page.locator('.story-decisions').textContent();
      check(storyDecisions.includes('가격은 미정')&&storyDecisions.includes('목표 건물을 바꿀 때')&&storyDecisions.includes('휴식 자리 초과 표시')&&!/마을 포인트|\d+P\b|배 위 낚시|포모도로/.test(storyDecisions),'확정된 건설 총액과 남은 미정 정책 구분');
      check(storyDecisions.includes('해금 예외')&&storyDecisions.includes('후속 설계'),'확정 정책과 후속 설계 경계');
      await noOverflow();
      check(await page.evaluate(()=>JSON.stringify({...localStorage}))===before,'제품 저장소 미변경');
      const notes=await context.request.get(((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '') + '/story-wrapping-notes.md'));check(notes.ok(),'제안 근거 문서 연결');
      await context.close();
    }
    check(!errors.length,'브라우저/리소스 오류 없음: '+errors.join(', '));
    console.log(JSON.stringify({checks,storyChapters:5,wrappingGroups:8,errors},null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
