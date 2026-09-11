# IA 구조 정리 · 2026-09-09

## 기준
- 정본 설계: 원본 저장소 gachisup/buildings.md의 채택안 ①(D8), policy.md.
- 이후 사용자 결정: 활동별 독서/공부/휴식, 배치 가능한 공부 테이블, 프로토타입 모든 건물 개방.
- 현재 구현: ia-app.js, ia-coverage.md, completion-design.md, world-polish-notes.md.
- 35개 화면과 9개 시트 ID·기존 URL 유지. VH-2는 오두막에 분리. 제품 해금 정책을 변경하는 작업이 아니다.
- 원본 Downloads/ia-flow.html은 이력으로 보존한다. 현재 IA 진입점은 ia.html.

## image-to-code 시안 분석 (구현 전)
내장 imagegen으로 전체 구조와 미리보기 두 UI 참조를 생성·확인했다.

1. assets/ia-references/ia-overview-v2.png
   - 상단 브랜드 68~72px, 바로 아래 56px 밑줄 탐색. 좌우 약48px.
   - 아이보리 바탕, 올리브 잉크, 옅은 세이지 허브. 카드 중첩 대신 열린 4열 정렬.
   - 온보딩은 6단계 가로 흐름, 기존 사용자 안내와 만들기/참여를 분기한다.
   - 28px 제목 / 18px 그룹명 / 14px 행 / 11px 고정 폭 코드. 행 높이44px.
   - 보조 시트는 점선으로 분리하되 해당 기능 바로 아래 둔다. 다음 줄도 동일 열 너비.
2. assets/ia-references/ia-preview-v2.png
   - 목록 / 실제 iframe / 맥락 설명의 세 영역. 읽기 순서와 실제 화면 중심 유지.
   - 왼쪽44px 행, 중앙24px 화면 제목·폭/역할 선택, 오른쪽 설명/상태/연결을 선으로 구분.
   - 양 옆은 종이색, 중앙은 살짝 진한 중성 바탕. 장식적 그림·중첩 베젤을 더하지 않는다.
   - 생성 이미지의 오두막 아래 VH-1·3 등 잘못 배치된 번호와 가상 SH/MH 번호는 복사하지 않는다. 명칭·계층·수치는 실제 설계와 구현이 기준이다.
- 실제 앱 화면은 생성된 통계 이미지를 쓰지 않고 기존 실행 가능한 iframe을 사용한다.
- 추가 사용자 결정에 따라 허브 바로 아래에 독서/공부/낚시 휴식의 원화와 모션 바로가기를 배치했다. 같은 FO-1/FO-2의 상태이므로 가짜 화면 번호를 늘리지 않는다.
- FO-1/FO-2에서 활동 버튼으로 실제 시연을 전환하며 URL·모바일·잠금화면·결과에도 활동을 전달한다. 휴식 기본 낚싯대와 집중/휴식 기록 차이를 표시한다.
- 작은 화면에서는 4열→2열→1열, 미리보기 설명은 아래로 내려 가로 넘침을 막는다.

## 생성 방식과 최종 프롬프트
내장 imagegen 사용. API/CLI 미사용. PNG는 각각1536×1024이며 코드 UI의 시각 참조일 뿐이다.

### 전체 구조
```text
Use case: ui-mockup.
Create a highly polished, implementation-ready desktop UI reference for the Korean '같이숲' information architecture workspace, NOT a marketing landing page, NOT the app itself. Landscape 1536x1024. Show the top overview viewport; more rows continue below the viewport naturally. Quiet precise editorial design, warm ivory #f7f6f0, dark olive ink #343c32, desaturated sage #e2e9da, thin warm-gray dividers. Clean Korean sans-serif system font, restrained rounded Korean wordmark only. No gradients, no illustrative background, no watercolor, no shadows, no nested cards.
Header 72px tall: left '같이숲' and small '화면 설계'; right quiet links '마을로 돌아가기 ↗' and '모바일 미리보기 ↗'. Below a slim horizontal navigation row: underline active tab '전체 구조', inactive '화면 미리보기', right aligned search field '화면 이름·번호 검색'.
Main gutter48px, grid width1440. Title '마을에서 시작되는 모든 흐름' in28px, supporting text '건물을 기준으로 묶고, 작성·확인 화면은 해당 기능 아래에 정리했어요.' 14px. Right aligned compact metadata '35개 화면 · 9개 보조 시트'. Modest spacing and strong alignment.
First section heading '처음 만나는 숲'. Onboarding is an open horizontal six-stage flow, equal-sized tiles joined by fine arrows: 'ON-1 시작' → 'ON-2 로그인' → 'ON-4 친구 만들기' → 'ON-5 소속 선택' → two stacked alternatives 'ON-5a 섬 만들기' and 'ON-5b 섬 참여' → 'ON-6 입항'. Small secondary link under login 'ON-3 기존 사용자 안내'. Tiles are warm offwhite thinborder 8px radius and readable16px; codes11px monospace. All column centers precisely align.
Below a green-tinted single horizontal hub strip spanning full content width, text left 'PL-1  마을 전체', middle '건물 탐색 · 길 따라 걷기 · 섬 전체 보기', right '화면 보기 →'. A central thin line leads down from onboarding into this hub.
Next section heading '마을 안의 기능' with caption '기본 화면 / 보조 시트'. Four equal-width open vertical columns aligned top and bottom, 24px gutters, NO enclosing card boxes. Small muted sage top rules. Column titles in18px: '집중과 휴식', '게시판', '오두막', '마을회관'. Each column caption in13px explains function. Each screen is a flat row 44px high with thin bottomdivider, code muted monospace onleftfixedwidth58px, label onright, minimal arrow onfar right. 
Focus rows: FO-1 활동 시작, FO-2 활동 중, FO-3 세션 결과, FO-4 잠금화면 시안. A faint dashed separator and two smaller secondary rows 'SH-1 앱 차단·권한', 'SH-2 종료 확인'. Small text '독서 · 공부 · 휴식' under activity row.
Board rows: BD-1 공지, BD-1a 공지 상세, BD-2 퀘스트, BD-3 퀘스트 상세, BD-3a 자료 공유, BD-4 퀘스트 만들기; visible secondary cue '공지 작성 · 자료 첨부 · 신고'.
Cabin row: VH-2 집중 기록. Brief readable supporting sublines '개인 / 그룹 / 친구', '일·주·월 · 과목 · 달력 · 최장 세션'.
Town rows: VH-1 섬 현황, VH-3 섬 설정, VH-4 금고 내역; secondaryrows 'SH-7 초대·공유', 'SH-8 가입 승인'.
The next row of section headings '전망대', '우체국', '항구', '프로필과 꾸미기' can begin at bottom. Preserve sober easy-to-scan planning tool aesthetic; no giant hero, no decorative pills, no invented images. Readable text, purposeful white space, crisp vectors, meticulous grid.
```

### 화면 미리보기
```text
Use case: ui-mockup. A crisp desktop UI reference for the Korean '같이숲' information architecture screen-preview workspace. Landscape1536x1024, quiet warm ivory #f7f6f0, oliveink#343c32, sage#e2e9da, clean Korean sans-serif14px and generous22pxlineheight,8pxradii, thindividers, no shadows/gradients/watercolor/nestedcards. Shippable functional tool, not marketing.
Header same flat72px band: left Korean rounded wordmark '같이숲' small '화면 설계', right links '마을로 돌아가기 ↗', '모바일 미리보기 ↗'. Underheader underline tabs '전체 구조' and active '화면 미리보기', right search '화면 이름·번호 검색'.
Below use three precisely aligned regions: left240px white navigation column with grouped screen list, central spacious warm lightgrey iframe preview stage fillingremainingwidth, right280px open information inspector. Left headings '마을','집중과 휴식','게시판','오두막','마을회관'. Flat44px rows codes11pxgray labels14px: PL-1 마을 전체; FO-1 활동 시작, FO-2 활동 중, FO-3 세션 결과; BD-1 공지, BD-2 퀘스트; highlight sage 'VH-2 집중 기록'; VH-1 섬 현황,VH-3 섬 설정. Smallindented secondary SH rows. No list cards. 
Central top toolbar two concise lines: eyebrow '오두막 / VH-2', title '집중 기록'24px, right controls '화면 폭 390px ▾', '그룹장 ▾'; beneath align nav '← 이전' and '다음 →'. Centraliframe actual390pxwide rounded16rect showing calm mobile stats screen with paleivorybackground, heading '오두막', tabs '그룹 기록  나의 기록', periodselector '일  주  월', '이번 주' mutedlabel, large '12시간 30분', clean desaturated7barhistogram, simple three stats '집중 일수 5일', '최장 세션 1시간', '연속 기록 3일'. Bottomdetailtabs '과목  달력  세션' andtwoflatrows. Use recognizable cozy mobile app typography, but tool chrome cleanneutral. No photorealisticphonebezel or nested deviceframe.
Rightinspector minimal directly onpaper: heading '이 화면의 역할', body '개인·그룹·친구의 집중 기록을 한곳에서 확인해요.' Thin horizontaldivider. Heading '화면 안에서' with concise rows '범위 개인 / 그룹 / 친구', '기간 일 / 주 / 월', '상세 과목 · 달력 · 최장 세션'. Divider then '들어오는 곳', flatlinks 'PL-1 마을 전체 →','VH-1 섬 현황 →','PR-1 프로필 →'. Bottom separated actions '모바일 베젤로 보기 ↗','화면만 새 탭에서 ↗'. Smallfooterhint '실제 동작하는 디자인 시연 · 서버·OS 기능은 미연결'. Strong visual balance and immaculatealignment, exact copy readable, no icon clutter.
```
