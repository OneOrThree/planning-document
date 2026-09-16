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
    {"id":"policy-solo-owner-delete","status":"confirmed","title":"혼자 남은 방장은 섬을 삭제하고 탈퇴할 수 있다","body":"주민이 있는 섬의 방장은 먼저 다른 주민에게 방장을 위임한다. 방장 혼자면 파괴적 확인창에서 삭제 범위와 다음 도착지를 확인한 뒤 섬을 삭제하고 탈퇴할 수 있다. 다른 소속 섬이 있으면 남은 메인 섬으로 이동하고, 마지막 소속 섬이면 계정·고양이·닉네임을 유지한 채 04 섬 선택 화면으로 이동한다. 섬 설정·공동 물고기와 원장·건물·공동 기록은 삭제하고 개인 데이터는 유지한다.","link":"feature-inventory.html?mode=detail#feature-K06","date":"2026.09.17","source":"GROMO-1843 · 현재 정책 2026-09-17"},
    {"id":"policy-hall-modal","status":"confirmed","title":"마을회관은 한 장의 등록증과 역할별 화면으로 운영한다","body":"회관 책상에서 미니섬·목각 건물·가계부로 진입한다. 섬 등록증은 기본 읽기 상태이고 방장은 별도 편집창에서 이름·소개·가입 방식·정원을 함께 수정한다. 주민에게는 가입 신청·편집·위임을 숨긴다. 가입 신청은 같은 등록증 안의 점선 목록으로 처리하고, 초대는 URL 대신 44pt 공유 아이콘으로 시작한다.","link":"feature-inventory.html?mode=detail&group=manage","date":"2026.09.16","source":"GROMO-1843 · 마을회관 모달 명세"},
    {"id":"policy-rest-screen","status":"confirmed","title":"휴식은 전용 모닥불 화면에서 식빵 굽기로 표현한다","body":"휴식은 버튼을 누른 순간 시작해 뗏목·걷기 연출도 포함한다. 서버가 빈 최소 restSeat를 자동 배정하고 기존 자리와 타이머를 유지한다. 고양이는 의자 없이 식빵을 굽고 이번 휴식 시간과 이름만 표시한다. 음악·이모티콘·재개·종료만 허용하며, 재개는 낚시섬의 같은 자리·같은 세션으로 돌아가고 종료는 결과 뒤 섬 화면으로 간다.","link":"feature-inventory.html?mode=detail#feature-D14","date":"2026.09.16","source":"GROMO-1862 · 휴식 화면 명세"},
    {"id":"policy-friend-letter","status":"confirmed","title":"친구에게는 실시간 채팅이 아닌 사라지는 편지를 보낸다","body":"친구 편지는 수신자가 열었다가 닫으면 삭제되고 발신자 목록에도 읽기 전까지만 남는다. 수신자의 현재 섬에 우체통이 없어도 보내며, 수신자가 속한 섬 중 우체통이 완공된 곳에서 읽는다. 친구 삭제 시 미확인 편지도 삭제하고 차단 기능은 2.0.0에서 제공하지 않는다. 닉네임 검색은 대소문자를 무시한 정확 일치만 허용한다.","link":"feature-inventory.html?mode=detail#feature-I09","date":"2026.09.16","source":"GROMO-1867 · 현재 정책"},
    {"id":"policy-main-island","status":"confirmed","title":"모든 사용자는 메인 섬 하나를 가지며 앱은 마지막 접속 섬에서 시작한다","body":"첫 소속이 메인 섬이 되고 내 뗏목의 내 정보에서 바꿀 수 있다. 메인 섬에서 나가거나 강퇴되면 가장 최근에 가입한 남은 섬이 메인 섬이 된다. 메인 섬 이름은 친구 목록·프로필에만 표시하며 적립·랭킹에는 영향을 주지 않는다. 마지막 섬에서 강퇴된 사용자의 처리는 미정이다.","link":"feature-inventory.html?mode=detail#feature-K10","date":"2026.09.16","source":"GROMO-1867 · 현재 정책"},
    {"id":"policy-auth-guest","status":"confirmed","title":"게스트는 섬·집중까지 이용하고 필요한 순간 한 제공자로 회원 전환한다","body":"계정 상태 GUEST/MEMBER와 로그인 제공자 APPLE/GOOGLE/KAKAO를 분리한다. 게스트는 고양이·섬·집중을 이용하고 친구 추가·편지·상점 구매에서 로그인을 요청한다. 새 소셜 계정이면 게스트 데이터를 이전하고, 기존 회원 계정이면 명시적 확인 뒤 기존 데이터를 불러온다. 회원 계정은 로그인 수단 하나를 불변 값으로 사용하며 이메일만으로 자동 병합하지 않는다.","link":"feature-inventory.html?mode=detail#feature-A10","date":"2026.09.15","source":"현재 정책 · 인증 결정"},
    {"id":"policy-building-quest","status":"confirmed","title":"건물은 고정 총액을 목표 선택 당시 주민이 나눠 채운다","body":"회관 60마리·1분, 게시판 추가 240마리·15분은 섬 통장 합산이다. 이후 총액은 축음기 1,360·도서관 2,720·우체통 4,080·전망대 5,440·상점 6,800마리로 고정하고, 대상 주민이 총액÷인원(올림)을 목표 선택 뒤부터 각자 채운다. 기존 보유분·이전 건물 기록은 인정하지 않는다. 공사 시간은 30분·1시간·1시간 30분·2시간 30분·4시간이다. 목표 변경 때 모은 몫의 이월과 일일 퀘스트 보상의 몫 포함 여부는 미정이다.","link":"feature-inventory.html?tab=growth","date":"2026.09.15","source":"GROMO-1829 · 현재 정책"},
    {"id":"policy-daily-quest-reward","status":"confirmed","title":"개인 보상은 받기를 누를 때, 전원 보너스는 즉시 지급한다","body":"주민 한 명 달성 보상 10마리는 그 주민이 보상받기 모달에서 받기를 눌렀을 때 섬에 적립한다. 전원 달성 보너스 대상 주민 수×5마리는 즉시 적립하고 대상 주민 모두에게 축하 모달을 한 번씩 보여준다. 같은 회차에서 개인 보상과 전원 보너스는 각각 한 번만 지급한다. 회차가 바뀔 때 미수령 개인 보상을 어떻게 처리할지는 미정이다.","link":"feature-inventory.html?mode=detail#feature-L05","date":"2026.09.14","source":"현재 정책 · 집중·보상 결정"},
    {"id":"policy-focus-fishing-island","status":"confirmed","title":"낚시섬에서 원하는 곳을 골라 집중하고 같은 자리로 돌아온다","body":"홈에서 기본 뗏목으로 낚시섬에 이동하며 이동 시간은 집중에 넣지 않는다. 정해진 자리 목록·번호 없이 원하는 곳을 누르고 할 일을 입력한 뒤 집중한다. 같은 섬 주민은 각자 고른 곳에서 낚시한다. 휴식 재개는 같은 자리·같은 세션으로 돌아가며, 낚시섬에서 집중 종료하면 결과 뒤 뗏목으로 원래 섬에 돌아온다.","link":"feature-inventory.html?mode=detail&group=focus","date":"2026.09.14","source":"현재 정책 · 집중·보상 결정"},
    {"id":"policy-fish-currency","status":"confirmed","title":"재화는 섬 소유 물고기 하나로 합친다","body":"유효 집중 1분마다 물고기 1마리를 집중한 섬에만 적립하고 주민 한 명의 한 섬 하루 상한은 480마리다. 잔액과 주민별 누적 획득 기록은 구분한다. 일반 탈퇴자의 기여는 섬에 남지만 방장 1인 섬을 삭제할 때는 공동 잔액과 원장도 삭제한다.","link":"feature-inventory.html?mode=detail#feature-L03","date":"2026.09.15","source":"GROMO-1830 · 현재 정책"},
    {"id":"policy-library","status":"confirmed","title":"집중 기록은 도서관에서 전체 공개로 본다","body":"마을회관 통계를 도서관으로 옮긴다. 도서관 완공 후 같은 섬 모든 주민의 집중·스크린타임 기록을 일·주·월 단위로 보고, 주민별 누적 물고기 획득 기록도 여기서 본다. 다른 섬 주민도 볼 수 있으며 공개 범위는 전체 공개로 고정해 설정을 두지 않는다. 완공 전 이전 기록은 볼 수 없다. 이번 집중 종료 직후 결과·퀘스트 결과와 구분하고, 데이터 없음·권한 없음·실제 0을 구분한다.","link":"feature-inventory.html?mode=detail#feature-H01","date":"2026.09.14","source":"사용자 결정 · 현재 정책 2026-09-14"},
    {"id":"policy-join-capacity","status":"confirmed","title":"가입 방식과 정원은 방장이 정하고 신청은 취소할 수 있다","body":"섬을 만들 때 방장이 가입 방식(승인 필요·승인 불필요)과 정원을 정하고, 정원은 마을회관에서 수정한다. 승인 대기 중인 가입 신청은 취소할 수 있고 다시 신청할 수 있다. 복수 소속을 허용하며 새로 가입해도 기존 섬에서 탈퇴하지 않는다. 2026.09.15에 정원 기준을 더 정했다. 정원은 1~15명이고 따로 정하지 않으면 15명이다. 방장을 포함한 현재 주민만 세며 승인 대기 신청은 세지 않는다. 현재 주민 수보다 작게 줄일 수 없고, 가득 찬 섬은 즉시 가입·초대 코드 입장·새 신청을 막는다. 대기 중인 신청은 승인할 때 정원을 다시 확인한다.","link":"feature-inventory.html?mode=detail#feature-B10","date":"2026.09.14","source":"사용자 결정 · 현재 정책 2026-09-14"},
    {"id":"policy-observatory-ranking","status":"confirmed","title":"전망대는 다른 섬 랭킹만 보여준다","body":"전망대는 다리로 들어가는 별도 작은 섬이다. 다른 섬 랭킹·검색·가입을 제공하고, 우리 섬 주민끼리의 순위와 지난주 1위 표시는 두지 않는다. 주간 랭킹은 매주 일요일 00시에 초기화한다. 평균은 그 섬에서 집중한 시간 합계를 그 섬 전체 주민 수로 나누며 다른 섬에서 집중한 시간은 뺀다. 초기화 시간대와 가입·탈퇴에 따른 분모 산정 시점은 구현 세부 기준으로 남는다.","link":"feature-inventory.html?mode=detail#feature-M03","date":"2026.09.14","source":"사용자 결정 · 현재 정책 2026-09-14"},
    {"id":"policy-shop-anyone","status":"confirmed","title":"주민 누구나 섬 물고기로 사고, 배는 모두 기본 뗏목","body":"주민 누구나 섬 물고기로 상점 상품과 음원을 사고 공동 섬·건물 테마를 적용·해제한다. 음원은 완공된 축음기에서 바로 사며 상점이 필요 없다. 개인 의상·장신구는 산 주민의 보유품이라 탈퇴해도 남고 내 배에서 착용한다. 배는 모두 같은 기본 뗏목이며 돛단배·배 업그레이드와 배 소품은 없다. 상품별 가격은 아직 정하지 않았다.","link":"feature-inventory.html?mode=detail#feature-L08","date":"2026.09.14","source":"사용자 결정 · 현재 정책 2026-09-14"},
    {"id":"policy-art-guides","status":"confirmed","title":"앵무새 안내 NPC와 고양이 6색을 유지한다","body":"빨강·노랑·파랑 앵무새는 섬의 장소와 기능을 안내하고 주민·퀘스트 인원으로 세지 않는다. 사용자는 고양이 6색이며 강아지는 상점 NPC 전용이다. 공동 음악 장치 이름은 축음기로 통일한다. 낚시섬은 최대 15명이 원하는 곳을 눌러 앉고, 휴식 화면은 의자 없는 식빵 굽기 에셋을 새로 사용한다.","link":"feature-inventory.html?mode=detail#feature-N01","date":"2026.09.16","source":"현재 정책 · 휴식 화면 명세"},
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
    {"id":"focus-rest","status":"superseded","title":"배 위 낚시 집중 ↔ 같은 모닥불의 독서 휴식","source":"사용자 제공 04·07 수정본","body":"배 위 또는 부두의 정해진 자리에서 집중하고 섬 홈에서 책을 읽는 이전안이다. 현재는 낚시섬 자유 자리 집중과 전용 모닥불 화면의 식빵 굽기 휴식으로 대체했다. 휴식 시간을 유효 집중·낚시 보상에서 제외하는 원칙만 유지한다.","link":"feature-inventory.html?mode=detail&group=focus"},
    {"id":"growth","status":"superseded","title":"게시판 전에는 건설, 이후에는 개인 물고기","source":"사용자 제공 04 수정본","body":"회관 → 게시판까지 물고기를 전량 초기 건설에 보탠다. 이후 새 물고기는 개인에게, 두 퀘스트 보상은 마을 포인트로 섬에 쌓인다. 전망대·우체통 뒤 마지막으로 상점이 열린다. 2026-09-14 현재 정책으로 대체했다. 재화는 섬 소유 물고기 하나이고, 게시판 다음 건물은 건설 퀘스트로 짓는다. 도서관·전망대·우체통·축음기는 순서가 자유이며 상점이 마지막이다.","link":"revisions/04-island-growth.html"},
    {"id":"decoration","status":"superseded","title":"상점에서 구매, 내 배에서 개인 꾸미기","source":"사용자 제공 07 수정본","body":"플레이어는 6색 고양이, 강아지는 상점 NPC 전용. 개인 배는 뗏목 → 돛단배 → 배로 성장하며 별도 개인 섬·집중방이 아니다. 개인 물건과 섬의 공동 꾸밈을 구분한다. 2026-09-14 현재 정책으로 대체했다. 배는 모두 같은 기본 뗏목이며 배 업그레이드는 없다. 고양이 6색·강아지 상점 NPC·개인 물건과 공동 꾸밈의 구분은 유지한다.","link":"revisions/07-personal-shared-decoration.html"},
    {"id":"letters","status":"confirmed","title":"콕찌르기 없이, 섬 전체 편지방","source":"이전 사용자 결정 + 현재 정책","body":"우체통에서 같은 섬 전체에 자유롭게 글을 남긴다. 개인 수신자 선택·읽음 표시·콕찌르기는 없다. 친구에게 보내는 비동기 편지는 I09의 별도 흐름이며 실시간 1:1 채팅방은 제공하지 않는다.","link":"feature-inventory.html?mode=detail#feature-I06"},
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
