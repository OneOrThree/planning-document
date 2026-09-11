/* 읽기 전용 기획 탭. 제품 저장소·앱 상태는 변경하지 않는다. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const tabs = [...document.querySelectorAll('[data-planning-tab]')];
  const panels = new Map(tabs.map(tab => [tab.dataset.planningTab, document.getElementById(tab.getAttribute('aria-controls'))]));
  const labels = {journey:'유저 저니', growth:'섬의 발전', story:'이야기', wrapping:'기능 표현', detail:'세부 기능 목록 및 표현', decisions:'결정 로그'};
  const tabBar = $('.planning-tabs');
  const measureTabs = () => document.documentElement.style.setProperty('--planning-nav-height', tabBar.getBoundingClientRect().height + 'px');
  measureTabs();
  new ResizeObserver(measureTabs).observe(tabBar);
  let active = '';
  let detailURL = '?mode=detail';
  function targetForHash() {
    const target = document.getElementById(location.hash.slice(1));
    return target?.closest('[role="tabpanel"]');
  }
  function selectedTab() {
    const panel = targetForHash();
    if (panel) return [...panels].find(([,value]) => value === panel)[0];
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'detail' || ['q','group','decision','proof','view'].some(key => params.has(key))) return 'detail';
    if (panels.has(params.get('tab'))) return params.get('tab');
    if (location.hash.startsWith('#chapter-')) return 'story';
    return 'journey';
  }
  function showTab({scrollToHash = false} = {}) {
    const selected = selectedTab();
    const previous = active;
    active = selected;
    for (const [key,panel] of panels) panel.hidden = key !== selected;
    for (const tab of tabs) {
      const current = tab.dataset.planningTab === selected;
      tab.setAttribute('aria-selected', String(current));
      tab.tabIndex = current ? 0 : -1;
      if (current) tab.setAttribute('aria-current', 'page'); else tab.removeAttribute('aria-current');
    }
    if (selected === 'detail') detailURL = location.search + location.hash;
    document.body.dataset.level = selected === 'detail' ? 'detail' : 'overview';
    document.body.dataset.planningView = selected;
    document.title = '같이숲 — ' + labels[selected];
    $('.skip').href = '#' + panels.get(selected).id;
    if (location.hash.startsWith('#decision-')) {
      const target = document.getElementById(location.hash.slice(1));
      if (target?.hidden) filterLog('all');
    }
    if (previous && previous !== selected && panels.get(previous)?.contains(document.activeElement)) {
      tabs.find(tab => tab.dataset.planningTab === selected).focus({preventScroll:true});
    }
    if (scrollToHash && targetForHash()) requestAnimationFrame(() => {
      const target = document.getElementById(location.hash.slice(1));
      for (let node = target?.parentElement; node; node = node.parentElement) if (node.tagName === 'DETAILS') node.open = true;
      target?.scrollIntoView({block:'start'});
    });
  }
  function navigate(tab) {
    if (tab.dataset.planningTab === active) return;
    if (active === 'detail') detailURL = location.search + location.hash;
    const href = tab.dataset.planningTab === 'detail' ? detailURL : tab.getAttribute('href');
    history.pushState(null, '', new URL(href, location.href));
    window.dispatchEvent(new PopStateEvent('popstate'));
    tab.focus({preventScroll:true});
    // 긴 문서에서 다른 탭을 열어도 이전 문서의 깊은 스크롤 위치에 남지 않는다.
    // 상단에서 선택할 때는 위치를 유지해 불필요한 화면 점프를 막는다.
    const navTop = $('.workbench-heading').getBoundingClientRect().bottom + window.scrollY;
    if (window.scrollY > navTop) window.scrollTo({top:navTop, behavior:'instant'});
  }
  for (const tab of tabs) {
    tab.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (tab.getAttribute('aria-disabled') === 'true' || tab.dataset.state === 'loading') return;
      navigate(tab);
    });
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','Home','End',' '].includes(event.key)) return;
      event.preventDefault();
      if (event.key === ' ') {navigate(tab); return;}
      const index = tabs.indexOf(tab);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      navigate(tabs[next]);
    });
  }

  const entries = [
    {"id":"complete-entry-routes","status":"confirmed","title":"경로를 선택하면 처음부터 집중 루프까지 펼쳐 본다","source":"사용자 직접 요청 · 초대 경로 보완","body":"확정 표시는 이야기 본문을 대신하지 않는다. 초대받았을 경우를 선택하면 초대장·합류 준비·뗏목 이동·동료 합류·집중·휴식·재방문까지 모두 읽을 수 있게 한다. 다른 두 시작 경로도 같은 방식으로 연결한다. 각 단계의 대사·세부 절차와 미정 정책을 새로 확정한 것은 아니다.","link":"feature-inventory.html?tab=journey&route=invite#journey-route"},
    {"id":"first-map","status":"discussing","title":"망원경 뒤 지도에서 기존 섬과 빈 섬을 고른다","source":"사용자 Plannotator 제안 · 초대 없는 시작 피드백 01","body":"두 메뉴를 먼저 고르는 안 대신 망원경으로 발견한 뒤 지도에서 기존 섬·빈 섬을 함께 고르는 흐름을 이야기 기준으로 반영한다. 기존 섬은 모임 확인·합류, 빈 섬은 새 공유 섬 생성 후보로 해석한다. 지도 표시·전환·과금과 빈 섬의 세부 표현은 아직 정하지 않았다.","link":"no-invite-story-plan.md"},
    {"id":"first-telescope","status":"confirmed","title":"초대 없는 첫 발견은 망원경으로","source":"사용자 Plannotator 결정 · 초대 없는 시작 피드백 02","body":"초대 없이 시작할 때 섬을 발견하는 수단은 망원경으로 정한다. 바람이 임의의 섬을 정해주는 안을 첫 경로로 쓰지 않는다. 친구 초대의 섬 그림 초대장과 짧은 뗏목 이동은 그대로 유지한다. 실제 탐색 화면의 구현 완료를 뜻하지 않는다.","link":"feature-inventory.html?mode=detail#feature-B03"},
    {"id":"first-join-exception","status":"confirmed","title":"신규 사용자의 첫 공개 섬 가입은 전망대 예외","source":"사용자 Plannotator 결정 · 초대 없는 시작 피드백 03","body":"아직 소속 섬이 없는 신규 사용자의 첫 공개 섬 발견·가입은 전망대 해금의 예외다. 가입 조건·승인은 그대로 지킨다. 소속 이후 다른 섬 탐색·방문에는 전망대가 필요하고, 귀환·탈퇴·강퇴 후 재가입까지 이번 예외를 확장하지 않는다. 이동 권한 코드는 변경하지 않았다.","link":"feature-inventory.html?tab=journey#no-invite-start"},
    {id:'growth-tab',status:'confirmed',title:'섬의 발전을 독립 탭으로 분리한다',source:'사용자 직접 요청 · 이번 대화',body:'유저 저니는 사람의 흐름에 집중하고, 섬의 발전은 별도 탭에서 발전 순서·건설 조건·비용·재화·남은 결정을 다룬다. 읽기 대비를 높이고 확정 방향과 제안 수치를 분리한다. 비용과 보상은 이번 정리만으로 새로 확정하지 않는다.',link:'feature-inventory.html?tab=growth'},
    {id:'growth-journey',status:'superseded',title:'사람의 여정과 섬의 발전 흐름을 함께 본다',source:'사용자 추가 요청 · 이번 대화',body:'당시에는 유저 저니 안에 시설 발전 순서를 함께 배치했다. 후속 요청으로 섬의 발전을 독립 탭으로 분리했다. 04·07의 기존 건설 방향은 유지하며, 상점 이후 공간 증축·새 공동 액션과 성장 속도는 미정이다.',link:'feature-inventory.html?tab=growth'},
    {id:'mailbox',status:'confirmed',title:'우편은 우체통으로 통일',source:'사용자 직접 결정 · 이번 대화',body:'새 우체국 건물은 만들지 않는다. 우체통이 우편 기능을 맡고 기러기가 편지를 전달한다. 별도 건물 여부는 더 이상 미정이 아니다.',link:'feature-inventory.html?mode=detail#feature-I05'},
    {id:'no-invite',status:'confirmed',title:'친구 초대 없는 첫 시작도 이야기한다',source:'사용자 직접 요청 · 이번 대화',body:'초대 경로만으로 첫 시작을 설명하지 않는다. 공개 섬 합류와 새 섬 만들기까지 이야기 범위에 넣는다. 두 경로의 세부 연출과 우선순위까지 확정한 것은 아니다.',link:'feature-inventory.html?tab=journey#no-invite-start'},
    {id:'first-scene',status:'superseded',title:'초대 없이 켜면 무엇을 먼저 만날까?',source:'이번 대화의 후속 제안',body:'두 메뉴를 먼저 제시하던 이전안이다. Plannotator 피드백으로 망원경 발견과 첫 공개 섬 가입의 전망대 예외를 확정했고, 지도에서 기존 섬·빈 섬을 고르는 사용자 제안으로 장면을 다시 쓴다. 지도 상세·승인 대기·초기 초대는 계속 논의한다.',link:'story-loop-plan.md#초대-없이-시작하는-경로도-함께-쓴다'},
    {id:'invite',status:'confirmed',title:'“우리 섬에서 같이하자”는 초대',source:'이전 사용자 결정 + Plannotator 1차 피드백',body:'기러기가 섬의 모습이 담긴 초대장을 전달한다. 지도나 특정 퀘스트 가입부터 시작하지 않는다. 초대장을 읽는 것만으로 자동 가입·집중하지 않는다.',link:'feature-inventory.html?tab=story#story-ledger'},
    {id:'raft',status:'confirmed',title:'첫 합류는 짧은 뗏목, 재방문은 더 짧게',source:'이전 사용자 결정 + Plannotator 1차 피드백',body:'첫 초대 합류는 포탈 대신 기본 뗏목으로 표현한다. 재방문 항해는 줄인다. 정확한 초 수·건너뛰기 방식·무초대 첫 출항의 연출은 미정이다.',link:'story-loop-plan.md'},
    {id:'companions',status:'confirmed',title:'집중 장면에서는 동료의 존재가 먼저',source:'Plannotator 1차 피드백',body:'실제 함께 집중하는 동료를 풍경에서 느낀다. 공동 진행 수치가 사람의 존재를 대신하지 않는다. 혼자 시작할 수 있지만 없는 동료·편지·답장은 만들어내지 않는다.',link:'feature-inventory.html?tab=journey'},
    {id:'focus-rest',status:'confirmed',title:'배 위 낚시 집중 ↔ 같은 모닥불의 독서 휴식',source:'사용자 제공 04·07 수정본',body:'플레이어 고양이는 배 위에서 낚시한다. 확대는 내 배, 축소는 같은 섬의 실제 낚시 동료 모두. 휴식은 섬 홈의 같은 모닥불에서 책 읽기, 재개는 배로 복귀한다. 휴식은 유효 집중·낚시 보상에서 제외한다.',link:'feature-inventory.html?mode=detail&group=focus'},
    {id:'growth',status:'confirmed',title:'게시판 전에는 건설, 이후에는 개인 물고기',source:'사용자 제공 04 수정본',body:'회관 → 게시판까지 물고기를 전량 초기 건설에 보탠다. 이후 새 물고기는 개인에게, 두 퀘스트 보상은 마을 포인트로 섬에 쌓인다. 전망대·우체통 뒤 마지막으로 상점이 열린다.',link:'revisions/04-island-growth.html'},
    {id:'decoration',status:'confirmed',title:'상점에서 구매, 내 배에서 개인 꾸미기',source:'사용자 제공 07 수정본',body:'플레이어는 6색 고양이, 강아지는 상점 NPC 전용. 개인 배는 뗏목 → 돛단배 → 배로 성장하며 별도 개인 섬·집중방이 아니다. 개인 물건과 섬의 공동 꾸밈을 구분한다.',link:'revisions/07-personal-shared-decoration.html'},
    {id:'letters',status:'confirmed',title:'콕찌르기 없이, 섬 전체 편지방',source:'이전 사용자 결정 + 04 수정본',body:'우체통에서 같은 섬 전체에 자유롭게 글을 남긴다. 개인 수신자 선택·읽음 표시·콕찌르기는 없다. 외부 친구의 첫 초대는 별도 진입 흐름이다.',link:'feature-inventory.html?mode=detail#feature-I06'},
    {id:'music',status:'confirmed',title:'축음기는 회관에서 100P 건설, 같은 섬 공동 재생',source:'사용자 제공 04·07 수정본',body:'게시판 이후 회관에서 축음기를 건설한다. 상점 상품이나 상점 선행 조건은 아니다. 같은 섬에서 곡을 함께 듣되 기기 음량·음소거만 개인에게 적용한다.',link:'feature-inventory.html?mode=detail#feature-L16'},
    {id:'open-policy',status:'discussing',title:'측정·공개·보상 수치는 더 정해야 한다',source:'03·04·07 통합 시 남은 논점',body:'할 일 기본 비공개와 배 위 할 일 표시의 정합성, 출항·휴식의 측정 경계, 포모도로 연결, 후기 보상 연결은 미정이다. 축음기 100P 외 대부분의 비용·보상량·한도·정산은 제안이다.',link:'growth-decoration-revision-20260911.md'},
    {id:'old-rooms',status:'superseded',title:'용도별 공부방·독서방, 탁자 중심 집중',source:'이전 논의 → 04·07 최신 기준으로 대체',body:'공부·독서에 따라 모임을 다른 방으로 나누는 방향과 탁자·노트북 중심 집중은 현행 기준이 아니다. 배 위 낚시와 같은 모닥불 휴식으로 이어 쓴다. 이전 그림·시연은 교체 완료로 표시하지 않는다.',link:'focus-revision-20260911.md'},
    {id:'old-split',status:'superseded',title:'개인 80% / 섬 20%는 채택하지 않은 이전 예시',source:'이전 설명용 배분안 → 04 수정본으로 대체',body:'확정 비율이 아니며 보상 코드에 적용하지 않았다. 현재는 게시판 이전 초기 건설 기여와 이후 개인 물고기·마을 포인트의 구분을 따른다.',link:'feature-inventory.html?tab=wrapping#previous-growth-proposals'},
    {id:'old-players',status:'superseded',title:'강아지·카피바라·래서판다 플레이어 시안',source:'이전 캐릭터 시연 → 07 고양이 전용 방향',body:'현재 플레이어 방향은 고양이 전용이다. 이전 캐릭터·리깅 에셋은 보존한다. 기획 변경을 기존 시연의 교체·삭제 완료로 표시하지 않는다.',link:'revisions/07-personal-shared-decoration.html'}
  ];
  const statuses = {confirmed:'확정', discussing:'논의 중', superseded:'이전안'};
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  $('#decision-log').innerHTML = entries.map(entry => `<article class="decision-entry" id="decision-${entry.id}" data-log-status="${entry.status}"><div class="decision-meta"><span class="planning-status ${entry.status==='discussing'?'is-open':''}">${statuses[entry.status]}</span><span>2026.09.11 기록</span></div><div><h3>${escape(entry.title)}</h3><p>${escape(entry.body)}</p><div class="decision-source"><span>근거: ${escape(entry.source)}</span><a href="${escape(entry.link)}">관련 내용 →</a></div></div></article>`).join('');
  function filterLog(status) {
    let count = 0;
    for (const row of document.querySelectorAll('[data-log-status]')) {row.hidden = status !== 'all' && row.dataset.logStatus !== status; if (!row.hidden) count++;}
    for (const button of document.querySelectorAll('[data-log-filter]')) button.setAttribute('aria-pressed',String(button.dataset.logFilter === status));
    $('#decision-count').textContent = (status === 'all' ? '전체' : statuses[status]) + ' ' + count + '건 · 기획 기록, 구현 완료 내역 아님';
  }
  for (const button of document.querySelectorAll('[data-log-filter]')) button.addEventListener('click', () => filterLog(button.dataset.logFilter));
  window.GachisupDecisionLog = entries;
  filterLog('all');
  window.addEventListener('popstate', () => showTab({scrollToHash:true}));
  window.addEventListener('hashchange', () => showTab({scrollToHash:true}));
  showTab({scrollToHash:true});
})();
