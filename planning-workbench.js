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
    {"id":"policy-friends","status":"confirmed","title":"친구는 내 뗏목에서 찾고, 상대가 수락하면 맺어진다","body":"친구 검색·추가·목록 관리는 내 뗏목에서 한다. 친구 요청은 상대가 수락해야 성립한다. 보낸 요청은 수락 전에 취소할 수 있고, 받은 요청은 수락하거나 거절할 수 있다. 거절돼도 다시 신청할 수 있으며 맺어진 친구 관계는 삭제할 수 있다. 친구 관계는 섬 소속과 별개다. 검색 식별자·노출 기준과 친구 삭제 뒤 기존 대화·재대화 처리는 추가 결정이 필요하고, 차단 기능 도입 여부는 아직 정하지 않았다.","link":"feature-inventory.html?mode=detail#feature-I01","date":"2026.09.14","source":"사용자 결정 · 현재 정책 2026-09-14"},
    {"id":"policy-mailbox-friend-chat","status":"confirmed","title":"우체통에서 섬 전체 편지방과 친구 1:1 채팅을 함께 쓴다","body":"우체통에 기존 우리 섬 편지방과 친구 1:1 채팅을 함께 둔다. 편지방은 섬 전체 대화, 친구 채팅은 선택한 친구와의 1:1 대화로 수신 범위를 구분한다. 서로 다른 섬에 있는 친구와도 대화할 수 있다. 친구 관리에는 우체통 건설 조건을 붙이지 않고, 우체통 진입은 기존 완공 조건을 유지한다. 상대 섬의 우체통 완공을 채팅 조건으로 요구할지는 추가 결정이 필요하다.","link":"feature-inventory.html?mode=detail#feature-I05","date":"2026.09.14","source":"사용자 결정 · 현재 정책 2026-09-14"},
    {"id":"policy-fish-currency","status":"confirmed","title":"재화는 섬 소유 물고기 하나로 합친다","body":"마을 포인트·개인 물고기 지갑·게시판 완성 전후 귀속 전환을 없앤다. 유효 집중 1분(60초)마다 물고기 1마리를 낚고, 집중한 섬에만 적립한다. 휴식 시간은 유효 집중에서 제외한다. 탈퇴해도 모은 물고기는 섬에 남는다. 물고기 잔액과 주민별 누적 획득 기록은 구분하며, 구매·건설로 잔액이 줄어도 누적 기록은 줄지 않는다. 기획 반영이며 실제 앱 구현 완료와 구분한다. 2026.09.15에 집중 보상을 5분마다 1마리에서 1분마다 1마리로 바꾸고, 주민 한 명이 한 섬에서 집중으로 낚는 물고기를 하루 최대 480마리(유효 집중 8시간어치)로 정했다. 상한에 닿아도 집중 기록은 계속 쌓이고 물고기만 더 낚지 않는다. 하루 기준 시간대는 아직 정하지 않은 초기화 시간대를 따른다.","link":"feature-inventory.html?mode=detail#feature-L03","date":"2026.09.14","source":"사용자 결정 · 현재 정책 2026-09-14"},
    {"id":"policy-building-quest","status":"confirmed","title":"회관·게시판 다음 건물은 건설 퀘스트로 짓는다","body":"마을회관(초기 공동 누적 100마리)과 게시판(추가 200마리)은 기존 순서를 유지한다. 이후 방장이 회관에서 다음 건물을 고르면 게시판에 건물 건설 퀘스트가 생긴다. 도서관·전망대·우체통·축음기는 순서가 자유이고 상점은 다른 모든 건물 완공 후에 고른다. 한 번에 한 건물만 진행한다. 대상은 목표를 고른 시점의 주민으로 고정하고 탈퇴하거나 강퇴된 주민은 뺀다. 대상 전원이 1인당 누적 요구량을 채우고 섬 잔액도 충분하면 완료 도장을 표시한다. 방장이 건설하기를 누를 때 대상 인원 × 1인당 요구량을 차감하고 공사를 시작한다. 1인당 요구량(축음기 50·도서관 100·우체통 150·전망대 200·상점 250마리)과 공사 시간(회관 1분~상점 1시간)은 위임받아 채택한 초기값이며 운영 후 조정할 수 있다. 2026.09.15에 집중 보상이 1분마다 1마리로 바뀌어 요구량을 5배로 환산했다. 공사 시간과 건물 짓는 속도는 이전과 같다.","link":"feature-inventory.html?tab=growth","date":"2026.09.14","source":"사용자 결정 · 현재 정책 2026-09-14"},
    {"id":"policy-daily-quest-reward","status":"confirmed","title":"일일 퀘스트 보상은 섬 물고기로 준다","body":"집중·스크린타임 퀘스트는 모두 일일 퀘스트이며 다음 날 새 회차가 된다. 주민 한 명이 달성하면 섬에 물고기 10마리, 전원이 달성하면 대상 주민 수 × 5마리를 더 준다. 같은 회차에서 각 주민의 달성 보상과 전원 보너스는 한 번씩만 지급한다. 퀘스트 성공 1인 10P 안은 쓰지 않는다. 건설 퀘스트는 추가 물고기 없이 건물 해금이 보상이다. 2026.09.15에 집중 보상 단위 변경에 맞춰 보상량을 5배로 환산했다. 집중 퀘스트와 스크린타임 퀘스트의 보상은 같다.","link":"feature-inventory.html?mode=detail#feature-L05","date":"2026.09.14","source":"사용자 결정 · 현재 정책 2026-09-14"},
    {"id":"policy-focus-fishing-island","status":"confirmed","title":"작은 낚시 섬 부두에서 집중하고 원래 섬 모닥불에서 쉰다","body":"목표 시간 입력 없이 할 일을 적고 카운트업으로 집중한다. 카운트다운은 제공하지 않는다. 집중을 시작하면 기본 뗏목으로 작은 낚시 섬 부두에 가서 같은 섬 주민과 함께 낚시한다. 휴식은 원래 섬 모닥불 독서이며 재개하면 낚시 섬 부두로 돌아간다. 낚시 섬의 뗏목을 누르면 본인만 원래 섬으로 돌아간다. 핀치 확대는 내 낚시 자리, 축소는 지금 낚시 중인 그룹원 전체이며 각 자리에 이름·과목·경과 시간을 표시한다. 최종 장소 형태(부두·해안가)는 아직 고르지 않았다.","link":"feature-inventory.html?mode=detail&group=focus","date":"2026.09.14","source":"사용자 결정 · 현재 정책 2026-09-14"},
    {"id":"policy-library","status":"confirmed","title":"집중 기록은 도서관에서 전체 공개로 본다","body":"마을회관 통계를 도서관으로 옮긴다. 도서관 완공 후 같은 섬 모든 주민의 집중·스크린타임 기록을 일·주·월 단위로 보고, 주민별 누적 물고기 획득 기록도 여기서 본다. 다른 섬 주민도 볼 수 있으며 공개 범위는 전체 공개로 고정해 설정을 두지 않는다. 완공 전 이전 기록은 볼 수 없다. 이번 집중 종료 직후 결과·퀘스트 결과와 구분하고, 데이터 없음·권한 없음·실제 0을 구분한다.","link":"feature-inventory.html?mode=detail#feature-H01","date":"2026.09.14","source":"사용자 결정 · 현재 정책 2026-09-14"},
    {"id":"policy-join-capacity","status":"confirmed","title":"가입 방식과 정원은 방장이 정하고 신청은 취소할 수 있다","body":"섬을 만들 때 방장이 가입 방식(승인 필요·승인 불필요)과 정원을 정하고, 정원은 마을회관에서 수정한다. 승인 대기 중인 가입 신청은 취소할 수 있고 다시 신청할 수 있다. 복수 소속을 허용하며 새로 가입해도 기존 섬에서 탈퇴하지 않는다. 2026.09.15에 정원 기준을 더 정했다. 정원은 2~15명이고 따로 정하지 않으면 15명이다. 방장을 포함한 현재 주민만 세며 승인 대기 신청은 세지 않는다. 현재 주민 수보다 작게 줄일 수 없고, 가득 찬 섬은 즉시 가입·초대 코드 입장·새 신청을 막는다. 대기 중인 신청은 승인할 때 정원을 다시 확인한다.","link":"feature-inventory.html?mode=detail#feature-B10","date":"2026.09.14","source":"사용자 결정 · 현재 정책 2026-09-14"},
    {"id":"policy-observatory-ranking","status":"confirmed","title":"전망대는 다른 섬 랭킹만 보여준다","body":"전망대는 다리로 들어가는 별도 작은 섬이다. 다른 섬 랭킹·검색·가입을 제공하고, 우리 섬 주민끼리의 순위와 지난주 1위 표시는 두지 않는다. 주간 랭킹은 매주 일요일 00시에 초기화한다. 평균은 그 섬에서 집중한 시간 합계를 그 섬 전체 주민 수로 나누며 다른 섬에서 집중한 시간은 뺀다. 초기화 시간대와 가입·탈퇴에 따른 분모 산정 시점은 구현 세부 기준으로 남는다.","link":"feature-inventory.html?mode=detail#feature-M03","date":"2026.09.14","source":"사용자 결정 · 현재 정책 2026-09-14"},
    {"id":"policy-shop-anyone","status":"confirmed","title":"주민 누구나 섬 물고기로 사고, 배는 모두 기본 뗏목","body":"주민 누구나 섬 물고기로 상점 상품과 음원을 사고 공동 섬·건물 테마를 적용·해제한다. 음원은 완공된 축음기에서 바로 사며 상점이 필요 없다. 개인 의상·장신구는 산 주민의 보유품이라 탈퇴해도 남고 내 배에서 착용한다. 배는 모두 같은 기본 뗏목이며 돛단배·배 업그레이드와 배 소품은 없다. 상품별 가격은 아직 정하지 않았다.","link":"feature-inventory.html?mode=detail#feature-L08","date":"2026.09.14","source":"사용자 결정 · 현재 정책 2026-09-14"},
    {"id":"policy-art-guides","status":"confirmed","title":"앵무새 안내 NPC와 건물 외형 기준","body":"빨강·노랑·파랑 앵무새는 섬에 원래 살던 안내 NPC다. 첫 도착·낚시 집중·모닥불 휴식·건물과 공동 기능을 한 번에 하나씩 소개하고 건너뛰기·다시 보기를 허용하며 주민·퀘스트 인원으로 세지 않는다. 공동 음악 장치의 외형·명칭은 꽃나팔 방송기이며 이전 축음기와 같은 장치다. 도서관은 세이지 녹색 지붕의 팔각 2층 책탑이고, 작은 낚시 섬 부두는 섬 정원 최대 15명이 앉는 장면을 목표로 기본 뗏목 한 대만 둔다. 수용 기준은 섬 정원과 같다.","link":"feature-inventory.html?mode=detail#feature-N09","date":"2026.09.14","source":"사용자 결정 · 현재 정책 2026-09-14"},
    {"id":"no-invite-story-approved","status":"confirmed","title":"초대 없는 합류·생성의 이야기 흐름을 확정한다","body":"망원경 → 지도에서 기존 공개 섬·새 공유 섬 후보를 고른다. 첫 발견에 유료 지도를 요구하지 않는다. 다른 섬 보기·돌아가기, 후보가 없을 때 다시 찾기·새 섬 만들기를 제공한다. 공개 섬은 바로 합류 가능 여부를 표시하고 가입 성공 또는 승인 완료 후 짧게 이동한다. 대기·취소·다른 길 선택을 제공하되 추천 우선순위·늦은 승인 충돌·지도 전환 상세는 후속 명세다. 신규 사용자의 첫 가입 예외는 유지하며 실제 앱 구현 완료와 구분한다.","link":"feature-inventory.html?tab=journey#no-invite-start","date":"2026.09.12","source":"사용자 최종 승인 · Plannotator 재검토 후 전체 채택"},
    {"id":"prejoin-information","status":"confirmed","title":"섬의 풍경 뒤에 모임의 약속을 읽고 합류한다","body":"공개 섬 이야기의 중심은 A2다. 가입 전에는 섬 풍경·모임 소개·참여 조건만 보여준다. 멤버 개인 정보·할 일·편지방은 가입 전 비공개이며, 가입 이후에도 각 공개 범위와 권한을 따른다. 소개를 읽는 것만으로 자동 가입·집중하지 않는다.","link":"feature-inventory.html?tab=journey&route=public#route-public-introduction","date":"2026.09.12","source":"사용자 최종 승인 · Plannotator 재검토 후 전체 채택"},
    {"id":"first-island-setup","status":"confirmed","title":"새 섬의 최소 설정과 첫 시간을 한 흐름으로 연결한다","body":"B1과 B2는 대안이 아니라 이어지는 장면이다. 빈 섬 후보에서 이름·선택 사항인 한 줄 소개·공개 범위를 확인하고 생성한다. 생성 성공 → 짧은 뗏목 이동 → 방금 이름 붙인 같은 섬의 첫 시간으로 이어진다. 복잡한 운영 설정은 뒤로 미루고 이름 검증·공개 범위 선택지와 기본값은 후속 명세로 남긴다. 새 섬은 함께 쓸 공유 섬이지 개인 전용 집중방이 아니다.","link":"feature-inventory.html?tab=journey&route=create#journey-route","date":"2026.09.12","source":"사용자 최종 승인 · Plannotator 재검토 후 전체 채택"},
    {"id":"first-island-invite","status":"confirmed","title":"우체통 건설 전에도 첫 동료를 초대할 수 있다","body":"새 섬 도착 직후 초기 안내에서 같이할 사람을 부를 수 있다. 먼저 집중하기와 초대하기는 서로 배타적인 선택이 아니며, 발송이나 답장을 기다리지 않고 시작할 수 있다. 외부 친구의 첫 초대와 우체통의 섬 전체 편지방은 구분하고 새 우체국 건물은 만들지 않는다. 초대 운영 권한·상시 진입 위치·회관 이전 필수 운영 상세는 후속 명세다.","link":"feature-inventory.html?mode=detail#feature-B05","date":"2026.09.12","source":"사용자 최종 승인 · Plannotator 재검토 후 전체 채택"},
    {"id":"prologue-candidates","status":"discussing","title":"고양이가 뗏목에 오르는 도입 이야기 3개를 비교한다","body":"함께 시작하고 싶은 일상, 오래된 함께함의 기억, 아직 없는 우리 부두라는 세 후보를 제안한다. 왜 출발하는지와 육지에서 뗏목에 오르는 과정을 먼저 보여준다. 실제 초대가 있으면 초대장, 없으면 망원경·지도로 연결한다. 아직 선택하지 않았으며 가짜 친구·자동 가입·뗏목 제작 시스템을 추가하기로 결정한 것은 아니다.","link":"feature-inventory.html?tab=story#prologue-scenarios","date":"2026.09.12","source":"사용자 요청에 따른 도입 후보 · 평가 전"},
    {"id":"complete-entry-routes","status":"confirmed","title":"경로를 선택하면 처음부터 집중 루프까지 펼쳐 본다","source":"사용자 직접 요청 · 초대 경로 보완","body":"확정 표시는 이야기 본문을 대신하지 않는다. 초대받았을 경우를 선택하면 초대장·합류 준비·뗏목 이동·동료 합류·집중·휴식·재방문까지 모두 읽을 수 있게 한다. 다른 두 시작 경로도 같은 방식으로 연결한다. 각 단계의 대사·세부 절차와 미정 정책을 새로 확정한 것은 아니다.","link":"feature-inventory.html?tab=journey&route=invite#journey-route"},
    {"id":"first-map","status":"superseded","title":"망원경 뒤 지도에서 기존 섬과 빈 섬을 고른다","source":"사용자 Plannotator 제안 · 초대 없는 시작 피드백 01","body":"두 메뉴를 먼저 고르는 안 대신 망원경으로 발견한 뒤 지도에서 기존 섬·빈 섬을 함께 고르는 흐름을 이야기 기준으로 반영한다. 기존 섬은 모임 확인·합류, 빈 섬은 새 공유 섬 생성 후보로 해석한다. 지도 표시·전환·과금과 빈 섬의 세부 표현은 아직 정하지 않았다. 2026-09-12에 흐름과 첫 발견 무료 원칙을 채택했으며 최신 확정 기록을 따른다.","link":"no-invite-story-plan.md"},
    {"id":"first-telescope","status":"confirmed","title":"초대 없는 첫 발견은 망원경으로","source":"사용자 Plannotator 결정 · 초대 없는 시작 피드백 02","body":"초대 없이 시작할 때 섬을 발견하는 수단은 망원경으로 정한다. 바람이 임의의 섬을 정해주는 안을 첫 경로로 쓰지 않는다. 친구 초대의 섬 그림 초대장과 짧은 뗏목 이동은 그대로 유지한다. 실제 탐색 화면의 구현 완료를 뜻하지 않는다.","link":"feature-inventory.html?mode=detail#feature-B03"},
    {"id":"first-join-exception","status":"confirmed","title":"신규 사용자의 첫 공개 섬 가입은 전망대 예외","source":"사용자 Plannotator 결정 · 초대 없는 시작 피드백 03","body":"아직 소속 섬이 없는 신규 사용자의 첫 공개 섬 발견·가입은 전망대 해금의 예외다. 가입 조건·승인은 그대로 지킨다. 소속 이후 다른 섬 탐색·방문에는 전망대가 필요하고, 귀환·탈퇴·강퇴 후 재가입까지 이번 예외를 확장하지 않는다. 이동 권한 코드는 변경하지 않았다.","link":"feature-inventory.html?tab=journey#no-invite-start"},
    {"id":"growth-tab","status":"confirmed","title":"섬의 발전을 독립 탭으로 분리한다","source":"사용자 직접 요청 · 이번 대화","body":"유저 저니는 사람의 흐름에 집중하고, 섬의 발전은 별도 탭에서 발전 순서·건설 조건·비용·재화·남은 결정을 다룬다. 읽기 대비를 높이고 확정 방향과 제안 수치를 분리한다. 비용과 보상은 이번 정리만으로 새로 확정하지 않는다.","link":"feature-inventory.html?tab=growth"},
    {"id":"growth-journey","status":"superseded","title":"사람의 여정과 섬의 발전 흐름을 함께 본다","source":"사용자 추가 요청 · 이번 대화","body":"당시에는 유저 저니 안에 시설 발전 순서를 함께 배치했다. 후속 요청으로 섬의 발전을 독립 탭으로 분리했다. 04·07의 기존 건설 방향은 유지하며, 상점 이후 공간 증축·새 공동 액션과 성장 속도는 미정이다.","link":"feature-inventory.html?tab=growth"},
    {"id":"mailbox","status":"confirmed","title":"우편은 우체통으로 통일","source":"사용자 직접 결정 · 이번 대화","body":"새 우체국 건물은 만들지 않는다. 우체통이 우편 기능을 맡고 기러기가 편지를 전달한다. 별도 건물 여부는 더 이상 미정이 아니다.","link":"feature-inventory.html?mode=detail#feature-I05"},
    {"id":"no-invite","status":"confirmed","title":"친구 초대 없는 첫 시작도 이야기한다","source":"사용자 직접 요청 · 이번 대화","body":"초대 경로만으로 첫 시작을 설명하지 않는다. 공개 섬 합류와 새 섬 만들기까지 이야기 범위에 넣는다. 두 경로의 세부 연출과 우선순위까지 확정한 것은 아니다.","link":"feature-inventory.html?tab=journey#no-invite-start"},
    {"id":"first-scene","status":"superseded","title":"초대 없이 켜면 무엇을 먼저 만날까?","source":"이번 대화의 후속 제안","body":"두 메뉴를 먼저 제시하던 이전안이다. Plannotator 피드백으로 망원경 발견과 첫 공개 섬 가입의 전망대 예외를 확정했고, 지도에서 기존 섬·빈 섬을 고르는 사용자 제안으로 장면을 다시 쓴다. 지도 상세·승인 대기·초기 초대는 계속 논의한다.","link":"story-loop-plan.md#초대-없이-시작하는-경로도-함께-쓴다"},
    {"id":"invite","status":"confirmed","title":"“우리 섬에서 같이하자”는 초대","source":"이전 사용자 결정 + Plannotator 1차 피드백","body":"기러기가 섬의 모습이 담긴 초대장을 전달한다. 지도나 특정 퀘스트 가입부터 시작하지 않는다. 초대장을 읽는 것만으로 자동 가입·집중하지 않는다.","link":"feature-inventory.html?tab=story#story-ledger"},
    {"id":"raft","status":"confirmed","title":"첫 합류는 짧은 뗏목, 재방문은 더 짧게","source":"이전 사용자 결정 + Plannotator 1차 피드백","body":"첫 초대 합류는 포탈 대신 기본 뗏목으로 표현한다. 재방문 항해는 줄인다. 정확한 초 수·건너뛰기 방식·무초대 첫 출항의 연출은 미정이다.","link":"story-loop-plan.md"},
    {"id":"companions","status":"confirmed","title":"집중 장면에서는 동료의 존재가 먼저","source":"Plannotator 1차 피드백","body":"실제 함께 집중하는 동료를 풍경에서 느낀다. 공동 진행 수치가 사람의 존재를 대신하지 않는다. 혼자 시작할 수 있지만 없는 동료·편지·답장은 만들어내지 않는다.","link":"feature-inventory.html?tab=journey"},
    {"id":"focus-rest","status":"superseded","title":"배 위 낚시 집중 ↔ 같은 모닥불의 독서 휴식","source":"사용자 제공 04·07 수정본","body":"플레이어 고양이는 배 위에서 낚시한다. 확대는 내 배, 축소는 같은 섬의 실제 낚시 동료 모두. 휴식은 섬 홈의 같은 모닥불에서 책 읽기, 재개는 배로 복귀한다. 휴식은 유효 집중·낚시 보상에서 제외한다. 2026-09-14 현재 정책에서 집중 장소를 작은 낚시 섬 부두로 바꿨고, 재개하면 낚시 섬 부두로 돌아간다. 모닥불 독서 휴식과 휴식 시간 제외는 유지한다.","link":"feature-inventory.html?mode=detail&group=focus"},
    {"id":"growth","status":"superseded","title":"게시판 전에는 건설, 이후에는 개인 물고기","source":"사용자 제공 04 수정본","body":"회관 → 게시판까지 물고기를 전량 초기 건설에 보탠다. 이후 새 물고기는 개인에게, 두 퀘스트 보상은 마을 포인트로 섬에 쌓인다. 전망대·우체통 뒤 마지막으로 상점이 열린다. 2026-09-14 현재 정책으로 대체했다. 재화는 섬 소유 물고기 하나이고, 게시판 다음 건물은 건설 퀘스트로 짓는다. 도서관·전망대·우체통·축음기는 순서가 자유이며 상점이 마지막이다.","link":"revisions/04-island-growth.html"},
    {"id":"decoration","status":"superseded","title":"상점에서 구매, 내 배에서 개인 꾸미기","source":"사용자 제공 07 수정본","body":"플레이어는 6색 고양이, 강아지는 상점 NPC 전용. 개인 배는 뗏목 → 돛단배 → 배로 성장하며 별도 개인 섬·집중방이 아니다. 개인 물건과 섬의 공동 꾸밈을 구분한다. 2026-09-14 현재 정책으로 대체했다. 배는 모두 같은 기본 뗏목이며 배 업그레이드는 없다. 고양이 6색·강아지 상점 NPC·개인 물건과 공동 꾸밈의 구분은 유지한다.","link":"revisions/07-personal-shared-decoration.html"},
    {"id":"letters","status":"confirmed","title":"콕찌르기 없이, 섬 전체 편지방","source":"이전 사용자 결정 + 04 수정본","body":"우체통에서 같은 섬 전체에 자유롭게 글을 남긴다. 개인 수신자 선택·읽음 표시·콕찌르기는 없다. 외부 친구의 첫 초대는 별도 진입 흐름이다. 2026-09-14 현재 정책에서 섬 전체 편지방의 이 원칙은 유지하고, 친구 1:1 채팅을 우체통의 별도 대화로 추가했다.","link":"feature-inventory.html?mode=detail#feature-I06"},
    {"id":"music","status":"superseded","title":"축음기는 회관에서 100P 건설, 같은 섬 공동 재생","source":"사용자 제공 04·07 수정본","body":"게시판 이후 회관에서 축음기를 건설한다. 상점 상품이나 상점 선행 조건은 아니다. 같은 섬에서 곡을 함께 듣되 기기 음량·음소거만 개인에게 적용한다. 2026-09-14 현재 정책으로 대체했다. 축음기도 1인당 10마리 건물 건설 퀘스트로 짓고, 음원은 완공된 축음기에서 섬 물고기로 산다. 같은 섬 공동 재생과 개인 음량·음소거 원칙은 유지한다.","link":"feature-inventory.html?mode=detail#feature-L16"},
    {"id":"open-policy","status":"superseded","title":"측정·공개·보상 수치는 더 정해야 한다","source":"03·04·07 통합 시 남은 논점","body":"할 일 기본 비공개와 배 위 할 일 표시의 정합성, 출항·휴식의 측정 경계, 포모도로 연결, 후기 보상 연결은 미정이다. 축음기 100P 외 대부분의 비용·보상량·한도·정산은 제안이다. 2026-09-14 현재 정책으로 정리했다. 목표 시간 없이 카운트업만 두고, 다른 주민 이름·과목·경과 시간은 표시 정보로 다루며, 휴식 시간은 유효 집중에서 빼고, 건설·일일 보상 수치는 초기값으로 채택했다. 초기화 시간대·랭킹 분모 산정 시점·중복 차감 방지는 구현 세부 기준으로 남는다.","link":"growth-decoration-revision-20260911.md"},
    {"id":"old-rooms","status":"superseded","title":"용도별 공부방·독서방, 탁자 중심 집중","source":"이전 논의 → 04·07 최신 기준으로 대체","body":"공부·독서에 따라 모임을 다른 방으로 나누는 방향과 탁자·노트북 중심 집중은 현행 기준이 아니다. 배 위 낚시와 같은 모닥불 휴식으로 이어 쓴다. 이전 그림·시연은 교체 완료로 표시하지 않는다.","link":"focus-revision-20260911.md"},
    {"id":"old-split","status":"superseded","title":"개인 80% / 섬 20%는 채택하지 않은 이전 예시","source":"이전 설명용 배분안 → 04 수정본으로 대체","body":"확정 비율이 아니며 보상 코드에 적용하지 않았다. 현재는 2026-09-14 정책의 섬 소유 물고기 하나를 따른다.","link":"feature-inventory.html?tab=wrapping#previous-growth-proposals"},
    {"id":"old-players","status":"superseded","title":"강아지·카피바라·래서판다 플레이어 시안","source":"이전 캐릭터 시연 → 07 고양이 전용 방향","body":"현재 플레이어 방향은 고양이 전용이다. 이전 캐릭터·리깅 에셋은 보존한다. 기획 변경을 기존 시연의 교체·삭제 완료로 표시하지 않는다.","link":"revisions/07-personal-shared-decoration.html"}
  ];
  const statuses = {confirmed:'확정', discussing:'논의 중', superseded:'이전안'};
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  $('#decision-log').innerHTML = entries.map(entry => `<article class="decision-entry" id="decision-${entry.id}" data-log-status="${entry.status}"><div class="decision-meta"><span class="planning-status ${entry.status==='discussing'?'is-open':''}">${statuses[entry.status]}</span><span>${escape(entry.date || "2026.09.11")} 기록</span></div><div><h3>${escape(entry.title)}</h3><p>${escape(entry.body)}</p><div class="decision-source"><span>근거: ${escape(entry.source)}</span><a href="${escape(entry.link)}">관련 내용 →</a></div></div></article>`).join('');
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
