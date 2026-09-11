# 이전 제작 기록 — 마을 중심 프로토타입과 캐릭터 리그

> 제작 당시 기록이다. 현재 기획은 [기획 작업대](https://oneorthree.github.io/planning-document/feature-inventory.html), 팀 작업 방법은 [README](README.md)를 우선한다. 아래 활동·시설 설명과 최신 결정은 다를 수 있다.

2026-09-09 갱신. 디자인 검증용 로컬 웹 프로토타입. 실제 앱·서버 및 제품 정본은 변경하지 않았다.

이 문서는 기존 디자인 폴더에서 제작한 내용을 보존한다. 이후 작업 원본은 `OneOrThree/planning-document`다.
최신 화면·모바일 기준과 실제 검증은 [디자인 개선 기록](design-polish-20260909.md)을 먼저 확인한다.
9월 8일 시안 분석 문서는 초기 의도와 원화의 출처이며, 현재 CSS·후속 기록이 우선한다.

## 실행

이 디렉터리에서 `python3 -m http.server 4173 --bind 127.0.0.1`.

- 마을: https://oneorthree.github.io/planning-document/
- 전체 IA: https://oneorthree.github.io/planning-document/ia.html
- 모바일 베젤: https://oneorthree.github.io/planning-document/mobile.html
- 활동 선택: https://oneorthree.github.io/planning-document/index.html?ia=fo1&preview=1
- 승인 원화 기반 리깅: https://oneorthree.github.io/planning-document/rig.html
- 걷기 리그 작업실: https://oneorthree.github.io/planning-document/walk.html
- 섬에서 걷기 시연: https://oneorthree.github.io/planning-document/?walk=1
- 모닥불: https://oneorthree.github.io/planning-document/?screen=camp
- 오두막 기록: https://oneorthree.github.io/planning-document/?screen=cabin
- 게시판: https://oneorthree.github.io/planning-document/?screen=board
- 집중 세션: https://oneorthree.github.io/planning-document/?screen=session

## 마을

첫 화면부터 마을이 전체 화면을 차지한다. 드래그·휠·핀치·확대축소 버튼으로
하나의 지도를 탐색한다. 전체 보기도 같은 이미지의 배율만 바꾼다.
건물 클릭 영역, 캐릭터, 길, 미리보기, 축소 지도가 같은 좌표를 쓴다.
건물 기능은 데스크톱의 옆 패널, 모바일의 하단 패널로 열린다.
‘마을만 보기’는 메뉴를 숨기며 건물 터치와 지도 이동은 계속 사용할 수 있다.

기본 마을 배경은 `assets/village-map-cel-v3.png`, 1536×1024 PNG다.
`assets-improved/`의 분리 에셋은 보존되어 있지만 `?separated=1` 실험 분기에만 연결되어 있다.
선과 디테일을 보완했지만 실제 4K 원화는 아니다. 별도 고해상도 API 작업은 진행하지 않았다.
고양이는 배경에 그려 넣지 않고 독립적인 리깅 캐릭터로 배치했다.

## 일곱 건물의 기능 화면

건물마다 이미지 시안을 생성·분석한 후 실제 HTML·SVG·CSS UI로 구현했다.
마을 원화는 바꾸지 않고, 저채도의 모래색 종이와 물빛 액센트로 기능 패널을 통일한다.
게시글 본문은 16px, 저장 안내·통계 요약은 12px, 헤더와 기간 탐색의 주요 조작은 44px 이상이다.
데스크톱은 오른쪽 패널, 모바일은 기본 64dvh 하단 시트다. 활동 선택은 72dvh,
높이 780px 이하의 휴대폰은 상단 100px을 남겨 시간 선택을 확보한다. 오두막과 작성 화면은
자동 확장한다. 손잡이 탭·스와이프나 확장 버튼으로 높이를 바꿀 수 있다.
본문만 스크롤되며 주요 버튼은 하단에 남는다. 일곱 건물은 모두 기본 개방한다.

- 오늘의 활동: 독서·공부·휴식을 처음부터 나란히 선택, 장소 원화·시간·시작 문구 동기화.
  독서는 모닥불, 공부/작업은 테이블에서 25·50·90분. 휴식은 무료 기본 낚싯대와 배에서 5·10·15분.
  휴식은 집중 목표·순위와 분리 기록하며, 친구들의 공동 공부 모션은 아직 미구현.
- 마을회관: 현재 섬 레벨·성장 길, 친구 목록, 이름 변경과 중복 이름 검증
- 게시판: 퀘스트·공지·자료 탭, 작성·자동 임시저장·미리보기·수정·삭제 확인,
  댓글·신고 기록, 공지 고정, 그룹장/그룹원 권한 시연, 집중 화면으로 이어가기
- 오두막: 개인·섬의 일·주·월 기록, 직전 기간 비교, 과목별 비율·세션 목록,
  연속 집중·최장 세션·목표 달력, 폰 사용 예시, 공개 활동 친구 평균,
  비공개 친구 보호, 목표 설정, 예시 토글, JSON 내보내기
- 항구: 목적지 선택 후 이동 확인. 현재 섬 이동 방지와 읽기 전용 방문
- 전망대: 우리 섬 주간 순위·섬 간 공개 멤버 1인당 평균 순위
- 우체국: 프리셋 편지 작성·보낸/받은 편지함, 수신 설정,
  오늘 공개 집중 기록이 없는 친구 콕찌르기(친구마다 하루 1회). 실제 전송 없음

종료한 집중 시간은 개인 기록과 시작한 섬의 기록에 각각 반영된다.
섬 이동·이름 변경으로 다른 섬 기록에 섞이지 않는다. 개인 통계는 내 모든 섬을 합산하고,
그룹 통계는 해당 섬의 공개 기록만 합산한다. 날짜는 KST, 주간 시작은 월요일이다.
텍스트·집중·설정은 localStorage, 첨부는 IndexedDB에 저장해 새로고침 후 복원한다.
첨부는 PNG/JPG/WebP/PDF, 파일당 10MB·최대 3개이며 파일 시그니처를 확인한다.
파일 선택 자체는 임시저장되지 않으므로 새로고침 전에 게시해야 원본이 보관된다.
시안 분석·원본 프롬프트는 [panel-design.md](panel-design.md), 추가 작성·통계 시안과
Gromo 기능 승계 근거는 [completion-design.md](completion-design.md)에 있다.

## 모모 리깅

사용자가 승인한 `assets/momo-reading-concept-v3.png`를 기준으로 한다.
투명 배경 에셋 `assets/momo-rig-source.png`에 12개 관절과 가중치 기반
메시를 연결한다. 1,681개 정점, 3,200개 삼각형. 원화 소스는 1254×1254,
축소 품질을 위한 GPU 밉맵 텍스처는 1024×1024다.

- 책 읽기, 잠깐 쉬기, 고개 끄덕이기
- 눈 깜빡임, 작은 호흡·귀·앞발·꼬리 움직임
- 책등 안쪽에 고정되고 표지 앞에서는 가려지는 책장 보조 애니메이션
- 관절과 메시 표시, 작은 각도의 수동 조절
- 타임라인 탐색, 속도 조절, 정지, 승인 원화 비교
- 투명 PNG 포즈와 실제 관절·정점·가중치 JSON 다운로드
- 모바일, 동작 줄이기 설정, WebGL 미지원 시 정지 원화 대체

자체 WebGL 메시 리그다. Spine/Rive 전용 파일, 완전한 3D 캐릭터,
자유로운 대각도 포즈 또는 벡터 원화로의 자동 변환은 아니다.
JSON은 텍스처 두 장과 `momo-rig.js`를 함께 사용한다.

## 현재 파일

### 독서 다섯 종 · 산책 네 종

`rig.html`에서는 모모·강아지·골든 리트리버·카피바라·레서판다를,
`walk.html`에서는 모모·강아지·카피바라·레서판다를 선택한다.
드롭다운과 원화 썸네일을 함께 제공하며 선택한 캐릭터를 URL에 보존한다.
지원하는 캐릭터는 독서/산책 작업실 사이에서도 선택을 유지한다.

새 캐릭터의 독서·보행 관절과 원화 좌표는 `reading-profile-*.js`,
`walk-profile-*.js`에 각각 분리했다. 모든 독서 캐릭터에 눈 깜빡임·책장 넘기기·
쉬기·고개 끄덕이기를 연결했다. 새 산책 캐릭터는 앞뒤 실제 투명 PNG,
네 방향, 양발 교대, 종별 관절 조절과 JSON 다운로드를 제공한다.
독서는 카피바라 8관절/그 외 12관절, 산책은 카피바라 18관절/그 외 20관절이다.
새 친구는 작업실에서 미리 보며 섬에는 기존 모모를 유지한다.

생성은 내장 `imagegen`이며 캐릭터별 Astra 에이전트가 원화·관절·검증을 맡았다.
자산 경로, 전체 프롬프트, 알파 측정과 제한사항은
[reading-friends-design.md](reading-friends-design.md)와 연결된 캐릭터별 작업 기록에 있다.

### 산책하는 모모

승인된 독서 모모를 참고해 책을 내려놓은 앞·뒤 원화를 생성했다.
`assets/momo-walk-front.png`, `assets/momo-walk-back.png`는 각각
1254×1254 실제 알파 PNG다. 체크무늬가 구워진 초안은 사용하지 않는다.

- `momo-walk.js`: 20관절, 원화당 2,401개 정점·4,608개 삼각형의 가중치 메시
- 양다리·무릎·발목, 반대 박자의 팔, 골반·머리·귀·꼬리 움직임
- 실제 경로 이동 거리로 보행 주기 진행, 도착 감속 및 대기 자세 혼합
- 앞·뒤 원화와 좌우 반전으로 네 방향 표현. 연속 3D 회전은 아님
- 서 있는 모모가 길·건물 터치를 따라 이동하고, 집중 중에는 승인된 독서 리그 사용
- 작업실에서 방향·속도·주기·개별 관절 조절과 원화별 가중치 JSON 다운로드
- 동작 줄이기 설정에서는 섬 이동을 즉시 처리, 작업실은 명시적 재생만 허용

`?walk=1`은 캐릭터를 가까이 보여주고 항구까지 한 번 걸어가는 시연 진입점이다.
기본 `/`는 전체 마을에서 시작하며 자동 이동하지 않는다.

### 파일 역할

| 파일 | 역할 |
| --- | --- |
| `index.html`, `village.js`, `village.css` | 단일 지도 카메라와 마을 상호작용 |
| `building-panels.js`, `building-panels.css` | 7개 건물·세션 결과·방문 화면과 반응형 시트 |
| `village-store.js` | 로컬 단일 모델, 게시판 권한·검증, 세션 귀속, KST 통계 집계 |
| `village-features.js`, `village-features.css` | 작성·통계·랭킹·편지·콕찌르기 화면 |
| `local-attachments.js` | 파일 형식·용량 검증, IndexedDB 원본 저장·다운로드 |
| `rig.html`, `rig-studio.js`, `rig-studio.css` | 승인 원화 기반 리깅 작업실 |
| `momo-rig.js`, `momo-rig.css` | 원화 텍스처, 메시, 관절, 동작, 렌더러 |
| `reading-profile-*.js`, `walk-profile-*.js` | 캐릭터별 원화·관절·가중치·모션 설정 |
| `momo-walk.js`, `momo-walk.css` | 앞·뒤 원화, 보행 관절, 거리 기반 보행, 섬 캐릭터 표시 |
| `walk.html`, `walk-studio.js`, `walk-studio.css` | 걷기 리그 작업실 |
| `tokens.css` | 공통 색과 서체 |
| `art.js` | 현재는 UI 아이콘 사용 |
| `assets/momo-rig-source.png` | 승인 원화의 투명 배경 버전 |
| `assets/momo-reading-concept-v2.png` | 눈 깜빡임용 눈 주변 텍스처 |
| `momo-art-direction.md` | 원화·프롬프트·피드백·구현 이력 |
| `verify-momo.cjs` | 현재 리깅 및 마을 연결 검증 |
| `verify-walk.cjs` | 보행 관절, 네 방향, 섬 이동·집중 전환, 모바일 검증 |
| `verify-reading-friends.cjs`, `verify-animal-animation.cjs` | 독서 캐릭터 선택·투명 원화·눈·책장·내보내기·반응형 검증 |
| `verify-walking-friends.cjs`, `verify-*-walk.cjs` | 새 세 종의 선택·보행·앞뒤 원화·종별 메시 검증 |
| `red-panda-walk-qa.html`, `red-panda-walk-qa.cjs` | 레서판다 보행 상태·전주기 메시·접지 검증 |
| `verify-panels.cjs` | 건물 7개·4개 화면 크기, 탭·세션·이동·개방·시트·접근성 검증 |
| `verify-store.cjs`, `verify-features.cjs` | 단일 모델 경계 및 실제 브라우저 작성·첨부·권한·통계·복원 검증 |

`app.js`, `styles.css`, `cat-rig.js`, `verify.cjs`는 이전 시안의 보존 파일이다.
현재 진입점에서는 사용하지 않는다. `verify-village.cjs`의 리깅 검사 부분도
이전 SVG 리그 대상이므로 최신 리깅 검증에는 `verify-momo.cjs`를 사용한다.

## 정본과 구현 범위

읽은 정본: 원본 저장소의 `references/legacy-design/` 내
PRD, 건물, 정책, 세계관·아트, 미확정 항목, 폐기 결정 문서.

단일 공유 섬, 고양이, 7건물, 모닥불 집중, 오두막 통계, 항구 이동,
집중 중 화면 제한, 시작 섬에 시간 귀속, 방문 읽기 전용을 유지한다.
이름·인원·성장률·주간 통계는 시연 데이터다.
레벨 기준·보상 단가는 확정하지 않았다.
실제 로그인·서버 저장·OS 앱 차단·외부 업로드·검열·보상 지급은 연결하지 않았다.
편지·신고·콕찌르기도 이 기기에만 남고 다른 사용자·운영자에게 전달되지 않는다.
브라우저 데이터 삭제, 시크릿 창 종료, 다른 브라우저·기기에서는 로컬 기록을 복원할 수 없다.
저장소 읽기가 실패하면 기존 값을 덮어쓰지 않고 임시 모드로 표시한다.

앱 이식은 프로토타입 확인 후 진행한다. PNG·관절·가중치·모션 데이터와
경로 계산은 재사용하되 브라우저 UI·렌더러 연결은 네이티브에 맞춰 옮긴다.
한 캐릭터부터 실기기 성능과 앱 복귀를 검증한 후 나머지를 이식한다.
현재 네이티브 실행이나 성능 검증을 완료한 상태는 아니다.

## 사용 스킬

사용자가 지정한 `image-to-code`를 설치하고 이미지 생성 → 분석 → 구현
흐름에 적용했다. 캐릭터는 승인된 이미지를 실제 렌더링 텍스처로 사용한다.
`imagegen`의 내장 이미지 도구로 원화와 투명 에셋을 생성했다.
프롬프트와 자산 경로는 `momo-art-direction.md`에 기록했다.

## 검증

`node verify-momo.cjs`, `node verify-walk.cjs`, `node verify-panels.cjs`,
`node verify-store.cjs`, `node verify-features.cjs`.
새 캐릭터는 `node verify-reading-friends.cjs`, `node verify-animal-animation.cjs`,
`node verify-walking-friends.cjs`로 통합 검증한다.
2026-09-08 기준 독서 26개, 걷기·섬 연결 45개, 건물 화면 62개,
단일 모델 42개, 작성·첨부·통계·편지 기능 40개 검증 통과.
새 친구 추가 후 독서 선택·내보내기 42개, 독서 애니메이션 101개,
산책 통합 100개를 통과했다. 기존 모모의 산책·섬 연결 45개도 재검증했다.
건물 화면은 320×640, 390×844, 768×844, 1440×1000에서 검사했다.
Playwright 설치 위치가 다르면 `PLAYWRIGHT_MODULE`을 지정한다.
서버 주소는 `VILLAGE_URL`로 바꿀 수 있다.
