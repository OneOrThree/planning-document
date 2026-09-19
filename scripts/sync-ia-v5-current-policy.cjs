const fs = require('node:fs');
const path = require('node:path');

const target = path.join(__dirname, '..', 'docs', 'ia', 'v5', 'index.html');
const html = fs.readFileSync(target, 'utf8');
const pattern = /(<script id="data" type="application\/json">)([\s\S]*?)(<\/script>)/;
const match = html.match(pattern);

if (!match) {
  throw new Error('IA v5 embedded data was not found.');
}

const data = JSON.parse(match[2]);
const updates = {
  'FO-1': {
    purpose: '할 일을 입력하고 기본 뗏목으로 낚시 섬에 이동한다. 원하는 위치를 누르면 목표 시간 입력 없이 카운트업 집중을 시작한다.',
  },
  'FO-2': {
    purpose: '카운트업으로 집중을 진행하는 화면. 기본 뗏목으로 작은 낚시 섬에 도착한 뒤 사용자가 원하는 위치를 눌러 자리를 잡는다. 고정 부두·좌석 목록은 두지 않는다. 유효 집중 1분마다 물고기 1마리를 낚고, 내 집중 과목·경과 시간과 다른 주민의 이름·집중 과목·경과 시간을 표시한다. 휴식·종료·이모티콘·공동 음원 조작을 제공한다. 확대·축소 등 화면 조작은 별도 화면 명세에서 관리한다.',
  },
  'fn-pause': {
    purpose: '누르는 순간 집중을 멈추고 휴식 시간을 시작한다. 이동 연출을 포함한 휴식 구간은 유효 집중·낚시 보상에서 제외한다. 전용 모닥불 화면에 현재 쉬는 주민만 자동 배치한다.',
  },
  'FO-5': {
    title: '모닥불 · 전용 휴식 화면',
    purpose: '휴식 버튼을 누른 뒤 들어오는 전용 화면이다. 현재 쉬는 고양이를 모닥불 주변에 자동 배치하고 식빵을 굽는 모습을 보여준다. 이름·휴식 경과 시간을 표시하며 음악·감정표현·집중 재개·집중 종료를 제공한다. 별도 의자 선택, 채팅, 건물 진입은 제공하지 않는다.',
    states: ['식빵 굽기 휴식', '음악·감정표현', '집중 재개', '집중 종료'],
  },
  'fn-camp-rest': {
    purpose: '현재 쉬는 주민을 전용 모닥불 화면에 자동 배치한다. 식빵 굽기와 이름·휴식 경과 시간을 보여 주고, 음악과 감정표현은 유지한다. 재개하면 낚시 섬의 직전 집중 위치로 돌아간다.',
  },
  'VH-5': {
    purpose: '방장이 건설 목표를 선택·변경한다. 목표를 선택하거나 변경한 시점의 현재 주민으로 참여 대상을 다시 정하고 각자 몫도 새로 계산한다. 이전 목표에서 모은 각자 몫은 다음 목표에 인정하지 않는다. 공사 완료 후 다음 목표를 선택하며 상점은 다른 모든 건물 공사 완료 이후 선택한다.',
  },
  'fn-island-manage': {
    purpose: '섬 등록증에서 섬 이름·소개·가입 방식·정원과 가입 신청을, 주민 화면에서 멤버 관리·방장 위임·섬 탈퇴를 다룬다. 주민은 읽기와 본인 탈퇴만 한다. 마지막 소속 섬에서도 탈퇴할 수 있고, 혼자 남은 방장은 섬 삭제 확인 뒤 섬을 삭제하고 탈퇴한다.',
  },
  'fn-field-28': {
    purpose: '방장 위임·섬 탈퇴 — 섬 정보·운영의 세부 기능. 마지막 소속 섬에서도 탈퇴할 수 있다. 혼자 남은 방장은 삭제 범위와 다음 도착지를 확인하고 섬을 삭제한다. 다른 소속이 있으면 남은 메인 섬으로, 마지막 소속이었다면 첫 섬 선택으로 이동한다.',
  },
  'SYS-6': {
    purpose: '탈퇴·강퇴·섬 삭제 뒤 접근할 수 없는 홈에서 빠져나와 남은 소속 섬이나 첫 소속 선택으로 연결한다. 마지막 소속 섬에서 탈퇴하거나 혼자 남은 방장이 섬을 삭제해 소속이 없어지면 첫 소속 선택으로 간다. 마지막 섬에서 강퇴된 사용자의 처리는 추가 결정이 필요하다. 기존 자산과 과거 기록은 별도로 보존한다.',
    states: ['탈퇴', '강퇴', '섬 삭제', '남은 메인 섬 이동', '첫 섬 선택'],
  },
  'PO-1': {
    purpose: '우체통은 우리 섬 전체 채팅방과 친구에게 보내는 1회성 비동기 편지를 제공한다. 친구는 같은 섬에 있지 않아도 편지를 보낼 수 있다. 받은 편지는 열었다가 닫으면 양쪽 목록에서 지우며 실시간 1:1 채팅방은 제공하지 않는다. 친구 검색·추가·관리는 내 뗏목에서 한다. 받는 친구의 섬에 우체통이 없어도 보낼 수 있고, 받은 친구는 자신이 속한 섬 중 우체통이 완공된 섬에서 확인한다.',
  },
  'PO-3': {
    purpose: '내게 도착한 친구 편지를 시간순으로 확인한다. 발신자·보낸 시각을 표시하고 편지를 누르면 상세 내용을 연다. 연 편지는 닫으면 양쪽 목록에서 지운다. 친구 관계를 삭제하면 아직 확인하지 않은 편지도 지운다. 내가 속한 섬 중 우체통이 완공된 섬에서 확인한다.',
  },
  'fn-friend-sent-letters': {
    purpose: '내가 친구에게 보낸 편지 중 상대가 아직 닫지 않은 편지를 확인한다. 상대가 편지를 열었다가 닫으면 목록에서 사라진다.',
  },
};

function visit(value) {
  if (!value || typeof value !== 'object') return;
  if (value.id && updates[value.id]) Object.assign(value, updates[value.id]);
  if (value.id === 'focus' && 'label' in value) value.label = '낚시섬 · 함께 집중';
  if (value.id === 'FO-5' && 'label' in value) value.label = '모닥불 · 전용 휴식 화면';
  for (const child of Object.values(value)) visit(child);
}

visit(data);
const next = html.replace(pattern, `$1${JSON.stringify(data)}$3`);
fs.writeFileSync(target, next);
