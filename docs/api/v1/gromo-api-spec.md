# GROMO 화면별 API 스펙 · v1 협의안

버전: 0.7-proposed · 2026-09-17

## 문서 상태

- 이 문서는 R61 화면 흐름을 기준으로 백엔드에 전달할 목표 계약을 정리한 협의안이다. 현재 운영 API나 구현 완료 목록이 아니다.
- 아래 `확정 정책`은 제품 동작의 현재 기준이다. endpoint 경로·요청/응답 필드·오류 코드·HTTP 상태·실시간 전송 방식은 별도 표시가 없으면 백엔드 협의 전 제안이다.
- 화면별 스펙을 본문 원본으로 삼고, 도메인별 백엔드 전달 메모의 권한·해금·오류·읽기 모델 제안을 합쳤다. 서로 다른 endpoint 수 분류는 이 문서의 98개 기능 계약으로 통일했다.
- 결정되지 않은 내용은 문서 끝의 `미정 정책`에 남긴다. 미정 항목을 임의로 채우지 않고, 합의할 때 정책 ID별로 갱신한다.

## 확정 정책

- 재화는 섬 공동 물고기 하나다. 개인 지갑·마을 포인트는 제공하지 않는다. 집중한 섬에만 적립하며 주민 탈퇴 뒤에도 공동 잔액은 남는다.
- 유효 집중 60초마다 물고기 1마리. 주민 1명이 섬 1곳에서 하루 최대 480마리(유효 집중 8시간어치), 상한 뒤에도 집중 기록은 쌓인다. 이동·휴식 제외. 쉬었다 이어가도 유효 누적·할 일·획득 수·기존 자리가 유지된다.
- 같이 집중 보너스 황금 물고기: 섬마다 1분에 한 번 추첨해 황금 물고기 한 마리가 나타나면, 그 순간 ACTIVE인 주민 모두가 함께 낚고 섬 잔액에 50마리를 한 번 적립한다(인원수만큼 곱하지 않음). 확률은 추첨 순간 같은 섬 ACTIVE 주민 수(휴식 제외·최대 5명)로만 정한다 — 1명 0.1%·2명 0.4%·3명 1.2%·4명 2.4%·5명 이상 4%. 480마리 상한을 채운 주민도 ACTIVE면 인원에 포함하고, 황금 물고기는 상한과 별도로 지급한다. 함께 낚은 주민의 누적 획득 기록·건설 각자 몫에는 50÷인원(내림)씩 더하고 나머지는 섬 잔액에만 남는다. 앱은 나타난 순간 참여한 고양이 모두가 함께 낚는 모션을 보여 준다.
- 집중은 목표 시간 없는 카운트업이다. 홈 → 배 이동 → 낚시섬 자유 위치 → 할 일 입력 → 시작. 이동·걷기 프레임별 API나 자리 번호/예약 목록은 없다.
- 휴식 버튼을 누르는 순간 집중을 멈추고 휴식 시간을 시작한다. 이동 시간도 휴식에 포함한다. 전용 모닥불 화면에서 현재 쉬는 고양이들이 식빵을 굽고, 이름·휴식 경과 시간을 표시한다. 별도 의자 선택·채팅·건물 진입은 없으며 음악·감정표현은 유지한다. 재개하면 같은 낚시 위치로 돌아간다.
- 사용자 프로필의 고양이 털색은 검정·치즈·크림·회색·흰색·삼색 6종이다. 상점 상품은 의상·장신구·공동 테마이며 배 종류·배 꾸미기는 포함하지 않는다.
- 인증은 accountType=GUEST|MEMBER와 단일 authProvider=APPLE|GOOGLE|KAKAO|null. 한 회원 계정은 로그인 수단 하나만 가지며 변경·추가·연동 해제 API는 없다. 이메일로 자동 병합하지 않는다.
- 게스트도 서버 사용자·토큰으로 고양이·섬 생성/가입·집중을 유지한다. 친구 추가·편지 발송·상점 구매에서 회원 전환. 공개 상품 열람 등까지 임의로 제한하지 않는다.
- 게스트 상태의 소셜 로그인은 회원 전환/충돌 확인 흐름을 사용한다. 미연결 소셜 로그인으로 전환 시 같은 사용자 데이터를 유지한다. 기존 회원 identity 충돌은 명시 확인 뒤 기존 회원 우선, 게스트 개인 데이터 병합 없음. 이미 섬에 적립한 물고기·공동 거래는 되돌리지 않는다.
- 기존 회원으로 전환 확인 시 주민 있는 섬 방장은 위임/정리, 진행 집중은 종료가 필요하다. 발견만으로 게스트 데이터를 지우지 않으며 취소하면 유지한다.
- 섬 정원은 1~15명, 생성 때 입력하지 않으면 15명. 방장 포함 현재 주민만 세고 승인 대기 신청·NPC는 세지 않는다. 마을회관에서 현재 주민 수보다 작게 줄이면 거부. 주민 수가 정원에 도달하면 즉시 가입·초대 코드 입장·새 가입 신청을 막고 정원이 가득 찼다고 안내한다. 가득 찬 섬은 섬 찾기·이름 검색 결과에 표시하지 않고, 초대 코드로 찾으면 섬 정보는 보여 주되 입장만 막는다. 승인 대기 중에 가득 차면 신청은 유지하고 승인만 막으며(승인 때 정원 재확인) 방장에게 정원을 늘리도록 안내한다. 마지막 한 자리 동시 가입은 한 명만 성공한다.
- 회관 → 게시판은 초기 고정 목표. 이후 도서관·전망대·우체통·축음기 자유 순서, 한 번에 하나만 진행. 상점은 다른 모든 건물 완공 뒤 선택한다.
- 건설 총액은 주민 수와 무관하게 고정한다. 회관 60, 게시판 추가 240, 축음기 1,360, 도서관 2,720, 우체통 4,080, 전망대 5,440, 상점 6,800마리다. 후속 건물은 목표 선택 당시 주민을 대상으로 총액÷인원(올림)의 각자 몫을 선택 뒤부터 채우며, 전원 각자 몫과 섬 잔액 총액을 함께 판정한다.
- 일일 퀘스트 개인 달성은 본인이 받기를 눌러 섬에 10마리 1회 적립. 전원 달성은 대상 인원×5마리 즉시 자동 적립, 대상 주민 각각 축하 1회. 확인 버튼은 재지급하지 않는다. 건설 퀘스트는 추가 물고기 보상 없음.
- 통계·집중 기록·스크린타임·전체 주민 누적 물고기 조회는 도서관 완공 후다. 이번 집중 결과·홈 현재 요약·퀘스트 달성 확인은 다른 기능이다. 기록은 완공 전에도 수집한다.
- 도서관 공개 범위는 전체 공개 고정, 다른 섬 주민도 열람한다. 기록 없음(DATA_NONE)·측정 권한 없음(NO_PERMISSION)·정상 측정을 구분하고, 정상 측정은 실제0과 양수값을 모두 표현한다. 조회 권한 없음은 측정 권한 없음과 다르다.
- 전망대는 섬 간 주간 평균 랭킹만 제공. 평균은 해당 섬 집중 합계÷전체 주민 수, 일요일 00시 새 주. 초기화는 과거 기록 삭제가 아니다. 복수 소속 허용, 가입만으로 이전 소속에서 탈퇴하지 않는다.
- 친구는 전체 닉네임 정확 일치 검색과 상대 수락으로 성립한다. 보낸 요청 취소·받은 요청 거절·재신청·친구 삭제가 가능하고, 2.0 범위에는 차단을 넣지 않는다. 친구 관리에 우체통 완공 조건을 붙이지 않는다.
- 우체통은 섬 전체 편지방과 친구에게 보내는 1회성 비동기 편지를 제공한다. 받는 친구의 섬에 우체통이 없어도 발송할 수 있고, 받은 사람은 자신이 속한 섬 중 우체통이 완공된 곳에서 확인한다. 받은 편지는 열고 닫으면 양쪽 목록에서 삭제하며, 친구를 삭제하면 미열람 편지도 삭제한다. 실시간 1:1 채팅방·입력중 상태·대화방 API는 없다.
- 일반 주민은 마지막 소속 섬에서 탈퇴할 수 없다. 주민이 방장 한 명뿐인 섬은 예외로, 삭제 범위와 다음 도착지를 확인하면 섬을 삭제하고 나간다.
- 주민 누구나 공동 물고기로 상품·음원을 구매하고 공동 테마를 적용/해제한다. 의상·장신구는 구매자 개인 소유, 테마·음원은 섬 소유. 개인 착용은 내 뗏목, 음원 구매·재생은 완공 축음기에서 상점 없이.
- 공동 곡 변경·재생·정지는 주민 공동 상태. 기기 음량·음소거·나만 미리듣기는 로컬이며 공동 곡을 바꾸지 않는다.

## 공통 계약

- auth·약관 공개 조회 외에는 사용자 인증 세션을 검사한다. 인증 세션 보유와 주민/방장/회원 행동 권한은 다르다. 본인 데이터·편지는 서버가 소유자를 검증한다.
- 변경은 서버가 권한·해금·가격·잔액·현재 상태를 판정한다. 역할/잠금 이유·가능 행동을 내려줘 UI가 안내하되 클라이언트 표시만 믿고 실행하지 않는다.
- 성공은 `{data, meta: {requestId, serverTime, version?, nextCursor?}}`, 오류는 `{error: {code, message, details}, meta: {requestId}}`를 제안한다. null은 현재 세션 없음, 빈 목록은 기록 항목 없음이다.
- 시간은 UTC ISO와 집계용 IANA timezone·날짜 범위를 구분한다. 시간량은 초, 물고기는 정수. 화면은 시간을 포맷하고 서버 기준 시각/확정 진행을 기준으로 보간한다.
- 목록은 cursor 페이지네이션. 검색어·기간·주민·분류 변경 시 cursor 초기화. 편지 보유·보상·확인 상태는 작성자/수신자/회차 소유 범위로 검사한다.
- 재시도되는 변경은 Idempotency-Key를 사용하고 동일 키·동일 요청은 같은 결과를 받는다. 보상·집중 종료·구매·건설은 DB 단계에서도 중복 지급/차감을 막는다.
- expectedVersion은 경쟁 변경이 있는 목표 선택·건설·공동 음악·테마 등에 적용한다. 모든 GET·로그인·단순 명령에 일괄 요구하지 않는다. 충돌 시 최신 상태를 조회하고 필요한 경우 사용자에게 재확인한다.
- 오류 범주는 입력·인증·본인/역할·시설 잠금·가입/정원·활성 집중·잔액 부족·동시 변경·일시 통신 장애로 구분한다. 개별 상세 코드·HTTP 선택은 서버 팀이 고정한다.
- 잠긴 기능을 읽는 응답은 `blockedReason`과 가능한 다음 행동을 함께 내려주는 안을 우선 검토한다. 오류 코드만 보고 화면 문구를 조립하지 않는다.
- 도서관 상태 조회는 미완공 안내를 반환할 수 있다. 실제 과거 기록 조회는 미완공 시 차단한다. 초기 건설·이번 결과·일일 달성·스크린타임 수집에는 도서관 완공 조건을 붙이지 않는다.
- 방장 강퇴·탈퇴·위임·섬 삭제 뒤 접근·구독을 다시 검사한다. 혼자 남은 방장의 섬 삭제는 삭제 범위와 다음 도착지를 확인한 뒤 처리한다. 공동 자산 정리와 보존 기간은 계정 삭제와 구분해 서버 계약에서 명시한다.
- 원장 차감·구매 소유권, 공사 시작, 보상 지급은 관련 상태와 함께 원자적으로 처리한다. 창을 닫거나 미리보기만으로 차감·공동 적용하지 않는다.

### 공통 오류 코드 제안

아래 식별자는 도메인별 백엔드 전달 메모에서 가져온 협의용 이름이다. 제품 정책이 아니라 API 표현이므로 이름과 HTTP 상태는 백엔드 합의 때 바뀔 수 있다.

|오류 코드 제안|사용 조건|HTTP 제안|비고|
|---|---|---|---|
|LIBRARY_NOT_BUILT|도서관 완공 전 과거 집중·스크린타임·누적 물고기 기록 조회|403|`library-status`의 미완공 상태 조회 자체는 성공 응답 가능|
|BUILDING_NOT_BUILT|우체통·상점·축음기 등 완공이 필요한 실제 기능 호출|403|건물별 상태 조회와 실제 기능 호출을 구분|
|AUTH_PROVIDER_ALREADY_SET|이미 로그인 수단이 있는 회원에게 두 번째 수단 추가 시도|409|로그인 수단 추가 API는 제공하지 않음|
|AUTH_PROVIDER_IMMUTABLE|회원 전환 뒤 로그인 수단 변경·연동 해제 시도|409|현재 단일 제공자 정책|
|IDENTITY_ALREADY_LINKED|게스트가 이미 다른 회원에 연결된 identity로 전환 시도|409|짧게 만료되는 `conflictId`와 차단 사유 반환 제안|
|HOST_TRANSFER_REQUIRED|주민이 남은 섬의 게스트 방장이 기존 회원 계정 사용을 확정하려는 경우|409|위임 또는 섬 정리 뒤 재시도|
|ACTIVE_FOCUS_SESSION|진행 중 집중 때문에 계정 전환·섬 이동 등 상태 변경이 막힌 경우|409|종료 뒤 재시도; 허용 범위는 endpoint별 확인|
|VERSION_CONFLICT|`expectedVersion`과 최신 자원 version이 다른 경우|409|최신 상태를 다시 조회하고 필요 시 재확인|

## 도메인 책임

|도메인|책임|제안 계약 수|
|---|---|---|
|인증·계정|서버 사용자·로그인 세션·단일 제공자, 계정 전환, 내 고양이 프로필과 계정 설정.|14|
|섬·소속·탐색|섬 정보·주민·방장·가입·초대·탈퇴·방문·현재 소속 섬과 섬 간 검색·랭킹.|20|
|집중·휴식·주민 상태|하나의 집중 세션과 유효 구간·휴식, 낚시 위치·주민 표시 상태. 이동과 애니메이션 표현은 구분한다.|11|
|공동 물고기·거래|섬 공동 잔액과 적립·지출 원장. 주민별 누적 획득 기록과 잔액을 구분한다.|2|
|건설|초기 공동 고정 목표, 후속 고정 총액·주민별 각자 몫 달성, 공동 잔액 조건과 공사.|4|
|게시판·퀘스트·공지|일일 회차와 개인 수령·전원 자동 보너스, 공지 본문·댓글. 건설 데이터는 건설 도메인을 참조한다.|15|
|도서관·기록·스크린타임|기록 저장·측정 수집과 도서관 조회를 분리한다. 공개 범위는 전체 공개 고정이다.|5|
|친구·편지|친구는 섬 소속과 무관하다. 개인 편지는 비동기 문서 단위이며 섬 전체 편지방과 수신 범위가 다르다.|14|
|상점·보유품·테마|개인 구매자는 의상을 소유하고 섬은 공동 테마를 소유한다. 지출은 공동 물고기 거래에 남는다.|9|
|축음기·공동 음악|섬 음원 소유·공동 재생 상태. 개인 미리듣기와 기기 음량은 공동 상태를 바꾸지 않는다.|4|

섬 소속·공동 잔액·건설 데이터는 여러 건물에서 같은 도메인을 사용한다.

## 건물별 표시 내용·행동

|장소|보여줄 최소 내용|주요 행동|API 참조|조건|
|---|---|---|---|---|
|내 뗏목|내 고양이·착용품, 꾸미기·친구 요청 요약·내 정보·설정|보유품 착용·해제, 친구 관리, 프로필 수정|me, inventory, appearance, friend-requests, account, settings|무료 털색과 유료 의상을 구분. 배 종류·배 장식 상품 없음.|
|마을회관|책상에서 섬 등록증·주민·공동 가계부·건물 건설. 가입 신청은 방장용 등록증에 통합한다.|방장 정보 수정·가입 승인·강퇴·위임·목표 선택·1인 섬 삭제, 주민 열람·본인 탈퇴|island, members, join-incoming, ledger, buildables, build-target, leave|통계는 도서관. 주민 목록을 방장 전용으로 막지 않는다. 디자인 프레임 42~60과 IA ID는 별도다.|
|도서관|내/이웃 일기장. 기간 합계·그래프·할 일별 집중, 스크린타임 분류·측정 상태, 누적 물고기|주민·기록 종류·일/주/월·이전/다음 기간 선택|library-status, focus-stats, screen-stats, fish-earnings|전체 공개·타 섬 주민 열람. 수집과 조회 해금을 분리.|
|게시판|퀘스트/공지. 내·주민 달성, 건설 대상·잔액·도장·공사, 공지 본문·댓글|방장 퀘스트/공지 관리·공사 시작, 주민 댓글·개인 보상받기|quests, quest, construction, build, claim, reward-notifications, notice, comments|개인 수령과 전원 자동 보너스를 분리. 건설 퀘스트 추가 물고기 보상 없음.|
|전망대|섬 간 주간 평균 랭킹, 이름/초대 코드 탐색, 정원·가입 방식·소속/신청 상태|다른 섬 구경·가입·신청 취소·소속 이동·원래 섬 귀환|rankings, search, invite-resolve, join, my-requests, join-cancel, switch, visit|섬 내부 주민 랭킹 없음. 첫 섬 찾기는 전망대 없이 가능.|
|우체통|우리 섬 편지방 + 친구 받은/보낸 편지. 도착한 편지 수·편지 상세·작성|섬 글 남기기, 친구 선택·편지 발송·열람 종료 후 삭제|island-messages, island-message, letters-received, letters-sent, letter, letter-send, letter-read|친구 검색·관리는 내 뗏목. 개인 편지는 1회성 비동기 발송.|
|상점|공동 잔액, 개인/공동 상품·상세·가격·소유·적용·예상 잔액, 개인/공동 내역|상품 구매, 공동 테마 적용·해제|wallet, catalog, product, purchase, themes, theme-save, my-orders, island-orders|개인 착용은 내 뗏목. 다른 모든 건물 공사 완료 후 상점.|
|축음기|공동 보유·현재 곡, 판매 음원·가격·미리듣기, 내 기기 음량·음소거|공동 곡 변경·재생·정지·음원 구매, 개인 미리듣기|gramophone, audio-catalog, audio-purchase, playback|상점 없이 직접 구매. 개인 음량·음소거·미리듣기는 로컬.|

### 건물별 권장 읽기 모델

필드 이름은 화면에 필요한 정보를 빠뜨리지 않기 위한 전달 제안이다. 최종 DTO 이름과 중첩 구조는 백엔드 계약 확정 때 정한다.

|장소|권장 응답 키·상태|
|---|---|
|마을회관|`islandWallet.balance`, `resourceLedger[]`, `members[]`, `constructionOptions[]`, `targetSnapshot`|
|도서관|`libraryStatus`, `accessible`, 일·주·월 집중/스크린타임 series, `members[].cumulativeEarnedFish`, `DATA_NONE`·`NO_PERMISSION`·정상 측정 구분|
|게시판|일일 `occurrence`, 주민별 달성, `stampReady`, 개인 claim·전원 자동 보너스 상태, 공지·댓글|
|전망대|다른 섬 주간 평균 랭킹, 공개 검색 결과, 가입·신청·방문 가능 상태|
|우체통|섬 전체 편지, 친구 요청 상태, 받은·보낸 편지, 편지 상세·열람 가능 상태|
|상점|`islandWallet.balance`, 개인/공동 상품 소유권·적용 상태, 구매 전후 잔액, 개인/섬 구매 내역|
|축음기|완공 상태, 공동 보유 음원, 판매·미리듣기 정보, 현재 공동 playback; 개인 음량·음소거는 제외|

## 화면별 API 연결

|화면 번호|화면|API 참조|조건|
|---|---|---|---|
|01|첫 시작|guest, oauth, terms, consent, account|게스트/소셜 로그인·약관 동의|
|02|내 고양이와 이름|me, profile|고양이 털색 6종; 닉네임 대소문자 무시 고유·앞뒤 공백 제거|
|03|혼자 시작 / 기존 섬 참여|memberships, discover, island-create|첫 참여는 전망대 없이 가능|
|04|초대 코드 입력|invite-resolve, join|코드 확인은 가입 확정과 별도|
|05|새 섬 만들기|island-create|이름·소개·가입 방식·정원 1~15명(기본 15명)|
|06|함께할 섬 찾기|discover, search, join|승인 불필요 즉시 가입 / 승인 필요 대기|
|07|가입 신청 대기 중|my-requests, join-cancel|취소·재신청 가능|
|08|처음 떠나는 항해|island, memberships|배·고양이·이동 문맥; 애니메이션은 로컬|
|09|앵무새 안내 1 · 인사|me|대사·페이지·건너뛰기·재보기는 로컬 가능|
|10|앵무새 안내 2 · 고양이가 낚시|me|대사·페이지·건너뛰기·재보기는 로컬 가능|
|11|앵무새 안내 3 · 낚시섬으로|me|대사·페이지·건너뛰기·재보기는 로컬 가능|
|12|앵무새 안내 4 · 모닥불|me|대사·페이지·건너뛰기·재보기는 로컬 가능|
|13|앵무새 안내 5 · 마무리|me|대사·페이지·건너뛰기·재보기는 로컬 가능|
|14|건물 없는 첫 섬|island, home-summary, construction, wallet|시설 미완공이어도 첫 집중·초기 목표 조회|
|15|첫 마을회관 건설|construction, build, wallet|회관 60/1분, 게시판 추가240/15분; 방장 차감 실행|
|16|마을회관 공사 중|construction, build, wallet|회관 60/1분, 게시판 추가240/15분; 방장 차감 실행|
|17|회관 다음은 게시판|construction, build, wallet|회관 60/1분, 게시판 추가240/15분; 방장 차감 실행|
|18|함께 자란 우리 섬|island, home-summary, current-session|홈 복원·시설 상태·현재 집중 확인|
|19|낚시섬으로 출발|current-session, focus-members|항해·걷기는 유효 집중에서 제외|
|20|도착 · 원하는 곳 누르기|focus-members|지도 기준 자유 좌표; 자리 번호 없음|
|21|누른 곳에서 집중 준비|focus-start|자리 도착·할 일 입력 후 집중 시작|
|22|낚시섬에서 함께 집중|session, progress, focus-members|같은 섬 주민의 위치·할 일·시간·획득 수|
|23|내 낚시 자리 가까이|session, progress, focus-members|확대·둘러보기는 클라이언트 처리|
|24|낚시섬에서 보내는 응원|emote|5종·집중 상태 불변; 만료 시간 미정|
|25|집중 중 음악 바꾸기|gramophone, playback|완공된 축음기의 동일 공동 상태 재사용|
|26|모닥불에서 쉬기|pause, rest-members, current-session|API 문서 번호. 디자인 갤러리 30번과 같은 화면; 버튼 순간부터 이동 포함 휴식|
|27|휴식 종료 · 이번 집중 결과|finish, session|API 문서 번호. 디자인 갤러리 31번과 같은 화면; 1회 정산 → 결과 → 홈|
|28|집중 종료 확인|session|확인 취소 시 같은 집중 유지|
|29|낚시섬에서 이번 집중 결과|finish, session, reward-notifications, claim|집중 획득·미수령 개인 보상·자동 보너스 구분|
|30|우리 섬으로 돌아오는 항해|island|이미 종료한 뒤 이동; 보상 재지급 없음|
|31|첫 집중 후 · 마을회관 안내|home-summary, construction, me|첫 집중 완료 후 초기 회관 목표 안내|
|32|도서관 짓기 전|library-status|미완공 상태 조회; 기록은 반환하지 않음|
|33|도서관 입장|library-status|도서관 완공·기록/주민 선택|
|34|내 일기장 · 집중 기록|focus-stats, screen-stats|기간·대상 사용자·할 일별 집중 집계|
|35|내 일기장 · 스크린타임|focus-stats, screen-stats|기간·대상 사용자·측정 분류/상태|
|36|이웃들의 일기장 · 이웃 집중 기록|library-status, focus-stats, screen-stats|선택 주민의 기간별 집중 집계|
|37|이웃 · 스크린타임 권한 없음|library-status, focus-stats, screen-stats|측정 권한 없음·0·기록 없음 구분|
|38|이웃들의 일기장 · 물고기 장|fish-earnings|도서관 완공 후 주민별 누적 획득|
|39|마을회관 · 책상|island, construction, ledger|섬·건설·원장의 요약 조회|
|40|섬 관리 · 섬 정보|island, island-save, invite|방장 수정·주민 읽기; 초대 권한 미정|
|41|섬 관리 · 주민|members, kick, transfer, leave|주민 열람; 강퇴·위임은 방장|
|41A|섬 관리 · 가입 신청|join-incoming, join-answer|대상 방장의 신청 목록·건수·승인/거절|
|42|마을회관 · 공동 가계부|wallet, ledger|월·적립/지출 필터·기간 합계|
|43|마을회관 · 목각 건물 고르기|buildables, build-target|기능·대상·총액·각자 몫·공사 시간·잠금 이유|
|44|마을회관 · 건물 청사진|buildables, build-target|기능·대상·총액·각자 몫·공사 시간·잠금 이유|
|45|퀘스트 종이 카드|quests, quest|제목·시간대/목표·상한·회차·측정 상태|
|46|그룹원 달성률|quests, quest|제목·시간대/목표·상한·회차·측정 상태|
|47|폰 사용 퀘스트|quests, quest|제목·시간대/목표·상한·회차·측정 상태|
|48|퀘스트 보상받기|reward-notifications, claim|claim 성공 후 섬에 10마리 1회 적립|
|49|모두 달성 축하|reward-notifications, reward-ack|보너스 자동 지급 후 대상별 확인|
|50|시간대 집중 퀘스트 만들기|quest-create, quest-edit|건설 퀘스트는 별도 목표 선택; 당일 수정 적용 미정|
|51|하루 폰 사용 퀘스트 만들기|quest-create, quest-edit|건설 퀘스트는 별도 목표 선택; 당일 수정 적용 미정|
|52|건설 퀘스트 카드|construction, build|대상 달성+잔액 도장·방장 차감·완공 시 다음 목표|
|53|건설 퀘스트 자세히|construction, build|대상 달성+잔액 도장·방장 차감·완공 시 다음 목표|
|54|도서관 공사 중|construction, build|공사 중 집중은 다음 건물 각자 몫에 미포함·완공 후 다음 목표|
|55|우리 섬 공지|notices, notice, notice-create, notice-edit, notice-delete, comments, comment-create, comment-delete|주민 공지 목록 조회|
|56|공지 내용과 댓글|notices, notice, notice-create, notice-edit, notice-delete, comments, comment-create, comment-delete|공지 본문·댓글 조회/작성; 삭제 예외 미정|
|57|공지 작성|notices, notice, notice-create, notice-edit, notice-delete, comments, comment-create, comment-delete|방장 공지 작성·수정|
|58|섬 간 랭킹|rankings|일요일 새 주; 내부 주민 랭킹 없음|
|59|섬 찾기|search, invite-resolve, memberships, my-requests|소속됨·신청 대기·정원 표시|
|60|다른 섬 구경|visit, join, my-requests, join-cancel|방문·가입·소속 전환을 구분|
|61|참여 신청 완료 토스트|visit, join, my-requests, join-cancel|가입 신청 상태·취소·승인 결과|
|62|배를 타고 섬 사이 이동|switch, visit, memberships|집중 종료·목적지 접근 검사; 방문 귀환은 원래 소속 복원|
|63|우체통|island-messages, letters-received, letters-sent|섬 전체 편지방과 친구 개인 편지|
|64|우리 섬 편지방|island-messages, island-message|섬 전체 읽기/쓰기; 실패 시 작성문 유지|
|65|편지 작성과 보내기|island-messages, island-message|섬 전체 읽기/쓰기; 실패 시 작성문 유지|
|66|친구 편지함|letters-received, letters-sent, friends|받은/보낸 편지·읽지 않은 수|
|67|편지 상세·작성|letter, letter-read, friends, letter-send|개인 편지 상세·친구 선택·발송·닫을 때 양쪽 삭제|
|68|내 꾸미기 상품|wallet, catalog, product, purchase|섬 공동 차감·구매자 개인 소유·회원 전환|
|69|개인 상품 미리보기|wallet, catalog, product, purchase|섬 공동 차감·구매자 개인 소유·회원 전환|
|70|물고기로 구매 확인|wallet, catalog, product, purchase|섬 공동 차감·구매자 개인 소유·회원 전환|
|71|우리 섬과 건물 테마|catalog, product, themes, theme-save, purchase|주민 누구나·섬/대상 건물 소유 검사|
|72|섬 외양 구매와 적용|catalog, product, themes, theme-save, purchase|주민 누구나·섬/대상 건물 소유 검사|
|73|건물별 테마 적용|catalog, product, themes, theme-save, purchase|주민 누구나·섬/대상 건물 소유 검사|
|74|내 구매 내역|my-orders, island-orders|개인 구매와 현재 선택 섬 공동 거래 구분|
|75|섬 공동 구매 내역|my-orders, island-orders|개인 구매와 현재 선택 섬 공동 거래 구분|
|76|나의 뗏목|me, inventory, appearance, friend-requests|보유품 선택=착용; 배 상품 없음|
|77|옷·장신구 선택|me, inventory, appearance, friend-requests|보유품 선택=착용; 배 상품 없음|
|78|친구 관리|friend-search, friends, friend-requests, friend-send, friend-answer, friend-cancel, friend-delete|친구 요청 수락·거절·취소·삭제|
|79|친구 찾기|friend-search, friends, friend-requests, friend-send, friend-answer, friend-cancel, friend-delete|대소문자 없이 전체 닉네임 정확 일치; 본인·탈퇴 사용자 제외|
|80|내 프로필과 계정|me, profile, account, convert, conflict|프로필·단일 제공자·게스트 전환|
|81|로그아웃과 회원 탈퇴|logout, delete-account|로그아웃; 계정 삭제 상세 정책 미정|
|82|앱·알림·소리 설정|settings, settings-save, terms|계정 알림 선호와 기기 설정 분리|
|83|측정 권한과 앱 정보|settings, settings-save, terms|OS 권한은 기기 처리; 앱 약관 조회|
|84|섬에서 축음기 열기|gramophone, audio-catalog, audio-purchase, playback, wallet|상점 없이 공동 구매; 개인 미리듣기·음량 분리|
|85|축음기 · 음원 미리듣기와 구매|gramophone, audio-catalog, audio-purchase, playback, wallet|상점 없이 공동 구매; 개인 미리듣기·음량 분리|

### 디자인 갤러리 번호 연결

위 표의 번호는 API 문서의 기존 링크를 보존한다. 최신 디자인 갤러리 번호는 별도 식별자이며 IA ID를 바꾸지 않는다.

|디자인 프레임|화면|기존 API·IA 연결|
|---|---|---|
|30|모닥불에서 쉬기|API 26 · `FO-5`|
|31|휴식 종료 · 이번 집중 결과|API 27 · `FO-3`|
|42|회관 책상|API 39 · `VH-1`|
|43~45|섬 등록증·수정·주민 뷰|API 40 · `VH-3`|
|46~50|주민·가입 신청 상태|API 41·41A · `VH-3`/`SH-8`; 가입 신청은 방장 등록증에 통합|
|51~52|공동 가계부·빈 상태|API 42 · `VH-4`|
|53~54|목각 건물 선택 상태|API 43 · `VH-5`|
|55~60|청사진 상태·주민 뷰|API 44 · `VH-5`|

## 화면 집계 13종과 실제 화면 비교

GROMO-1784(2026-09-12, phone 저장소 PR #749)는 진입 때 조회 계약을 2개 이상 부르던 화면 13곳을 서버 집계 GET `/screens/...`으로 묶었다. 설계 기준은 화면별 API 스펙 v0.3-proposed(도메인 66계약, 다중 조회 화면 그룹 14개를 13개로 합침)라 9/14 정책 변경 뒤 이 문서의 화면 구성과 비교했다.
기준 문서는 phone 저장소 `docs/prd/bff-screens/`(13화면 적용표·필수/생략 조각·외부 TTL 0·트리거 행동 제외 B12)다. 상태: 차이 확인 완료 · BE 합의 전. 구현 1785~1787의 현재 진행 상태는 확인하지 않았다.
`지금 필요한 계약`은 위 화면 표 API 참조에서 조회 계약만 뽑은 것이다. 앱이 진입 때 실제로 동시에 부르는지는 확인하지 못했고, 추측한 곳은 (추론)으로 표시했다.

|집계 화면(1784)|1784 조합 계약|지금 화면(번호)|지금 필요한 계약|차이|제안|
|---|---|---|---|---|---|
|home `/screens/home`|island·home-summary·session; build 제외|18 함께 자란 우리 섬, 14 건물 없는 첫 섬|18: island·home-summary·current-session / 14: island·home-summary·construction·wallet|18은 조합 같음(session `/focus-sessions/current` → current-session `/v1/me/focus-session`). 14는 construction·wallet 추가: 초기 건설 기여가 island 응답 안(initialConstruction)에서 construction 계약·섬 잔액 합산으로 분리됨|home에 construction·wallet 조각을 넣어 14~17·31까지 한 집계로 볼지 결정|
|travel `/screens/travel/{islandId}`|island(목적지 주민 상세)·playback; switch 제외|62 배를 타고 섬 사이 이동|visit·memberships; switch 행동|목적지 island 대신 visit(공개 요약)·memberships. 이동 중 음악은 지금 화면 표에 없음(필요 여부 확인 못 함)|소속 섬 이동은 island, 비소속 방문은 visit로 나눌지 확정. playback 조각은 화면 확인 뒤|
|focus `/screens/focus`|session·focus-group·playback; emote·pause·finish 제외|22 낚시섬에서 함께 집중, 23 내 낚시 자리 가까이|session·focus-members·gramophone(완공 시 현재 곡); progress는 PUT|focus-group → focus-members(같은 경로). 재생 상태 조회가 gramophone에 합쳐졌고 지금 `playback`은 변경(PUT) 이름. 목표 시간 없는 카운트업·배 외양 없음|조합을 session·focus-members·gramophone으로 갱신. 19도 같은 집계 재사용 검토|
|sound `/screens/sound`|shared-inventory·playback; playback-save 제외|84 섬에서 축음기 열기, 85 음원 미리듣기와 구매|gramophone·audio-catalog·wallet; audio-purchase·playback 행동|보유 음원·현재 곡이 gramophone 하나로 합쳐짐. 축음기 직접 구매로 판매 음원·섬 잔액 추가. 섬·건물 테마 보유는 상점 themes로 분리|조합을 gramophone·audio-catalog·wallet으로 갱신|
|rest `/screens/rest`|session·rest-members; resume·finish 제외|26 모닥불에서 쉬기|current-session·rest-members; pause 행동|조합 같음(session 경로만 바뀜). 휴식 자리 번호 대신 표시 위치|경로 이름만 갱신. 휴식 경과 기준은 P-SESSION-TIME 뒤|
|hall `/screens/hall`|focus-stats·screen-stats(회관 통계, from·to·scope)|34·35 내 일기장, 36·37 이웃 일기장|library-status·focus-stats·screen-stats(`/library/statistics/*`, period·기준 날짜·대상 userId)|기록 조회가 회관에서 도서관으로 이동. 경로·입력·해금(도서관 완공)·다른 섬 주민 열람이 바뀜. 지금 39 마을회관 책상은 island·construction·ledger|hall 집계를 도서관 일기장 집계로 바꾸고 새 입력에 맞춤|
|island-manage `/screens/island-manage`|island·members·requests(방장만)|40 섬 정보, 41 주민, 41A 가입 신청|island·members·join-incoming(방장만)|조합 같음(requests → join-incoming, 같은 경로). 탭 3개라 탭마다 조회 1개일 수 있음(추론). 정원·현재 주민 수 표시 필요|island 응답에 정원(maxResidents)·주민 수가 있는지 확인|
|board `/screens/board`|quests·notices|45~47 퀘스트 카드, 52 건설 퀘스트 카드, 55 우리 섬 공지|quests·notices; claim 행동|quests 경로 `/quests/current` → `/quests`. 보상 통화가 마을 포인트에서 섬 물고기(개인 10마리·전원 대상×5)로 바뀜. 건설 퀘스트 카드 추가(quests의 연결 카드로 받는지 확인 필요)|보상 DTO를 섬 물고기로 갱신. 건설 카드를 quests 안에 둘지 construction 조각으로 넣을지 결정|
|tower `/screens/tower`|rank(섬 안 주민 랭킹)·rank-islands|58 섬 간 랭킹|rankings(rank-islands와 같은 경로)|섬 내부 주민 랭킹이 없어져 조회 1개만 남음|tower 집계 폐지, rankings 단일 GET 사용|
|explore `/screens/explore`|islands·memberships; invite-resolve 제외|59 섬 찾기|search·memberships·my-requests; invite-resolve 행동|`/v1/islands?q` → search `/v1/islands/search`, `/v1/me/islands` → `/v1/me/memberships`. 신청 대기 표시용 my-requests 추가. 가득 찬 섬은 검색 결과에서 제외|조합에 my-requests 추가 검토. 첫 섬 찾기(03·06)는 아래 목록|
|visit `/screens/visit/{islandId}`|island(공개 whitelist)·join-status; join·join-cancel 제외|60 다른 섬 구경, 61 참여 신청 완료 토스트|visit·my-requests; join·join-cancel 행동|방문 전용 visit가 공개 장면·가입 상태를 이미 포함해 1개로 충분할 수 있음(추론). 신청 단건 조회 → my-requests 목록. 가득 찬 섬 입장 불가 상태 필요|visit 응답에 본인 신청·정원 상태가 있으면 집계 폐지 검토|
|shop `/screens/shop`|wallet(개인 물고기·마을 포인트)·catalog·shared-inventory|68~70 내 꾸미기 상품, 71~73 섬·건물 테마|wallet(섬 물고기)·catalog·themes; product·purchase·theme-save는 선택 뒤|단일 재화로 두 지갑이 섬 물고기 하나가 됨(`/shop/wallets` → `/wallet`, `/shop/products` → `/shop/catalog`). 음원은 축음기로 옮겨 공동 보유 음원 불필요, 테마 보유는 themes|조합을 wallet·catalog·themes로 갱신|
|boat `/screens/boat`|me·inventory(배 종류 포함)|76 나의 뗏목, 77 옷·장신구 선택|me·inventory·friend-requests; appearance 행동|배 종류·배 꾸미기 상품 없음. 로그인 수단 목록 → 단일 authProvider. 친구 요청 요약 추가|조합에 friend-requests 요약 추가, 배 종류 제거|

13종에 없는데 집계가 필요해 보이는 화면. 화면 목적에 맞는 조회 계약이 2개 이상인 곳이며, 참조를 공유하는 화면 묶음은 화면별로 나눠 셌다(모두 추론).

- 첫 시작·첫 참여: 01 첫 시작(terms·account, 로그인 전후로 나뉘면 1개씩), 03 혼자 시작 / 기존 섬 참여(memberships·discover), 06 함께할 섬 찾기(discover·search, 검색어 입력 전엔 discover 1개), 08 처음 떠나는 항해(island·memberships)
- 초기 건설: 15~17 첫 마을회관 건설·공사 중·게시판(construction·wallet), 31 첫 집중 후 · 마을회관 안내(home-summary·construction·me)
- 집중: 19 낚시섬으로 출발(current-session·focus-members), 29 낚시섬에서 이번 집중 결과(session·reward-notifications, finish 응답으로 충분하면 불필요)
- 마을회관: 39 책상(island·construction·ledger), 42 공동 가계부(wallet·ledger, ledger가 현재 잔액을 주면 1개)
- 게시판·우체통·친구: 56 공지 내용과 댓글(notice·comments), 63 우체통(island-messages·letters-received·letters-sent), 66 친구 편지함(letters-received·letters-sent·friends), 67 편지 상세·작성(letter·friends), 78 친구 관리(friends·friend-requests)
- 계정: 80 내 프로필과 계정(me·account)
- 잔액·건설 진행·인가를 같은 시점에 읽어야 하는 15~17·31·39·42는 1784 방식(단일 조회 묶음) 후보, 나머지는 기존 계약을 Business에서 묶는 후보다(추론).

13종 중 바뀌거나 사라진 화면.

- tower: 섬 내부 주민 랭킹이 없어져 조회 1개만 남아 집계 대상에서 사실상 사라짐.
- hall: 회관 통계가 도서관 일기장(33~37)으로 이동. 지금 마을회관은 섬 관리·건설·가계부.
- shop: 개인 물고기·마을 포인트 두 지갑이 섬 공동 물고기 하나로 바뀌고 음원 판매는 축음기로 이동.
- sound: 공동 보유 인벤토리 조회가 축음기(gramophone)·판매 음원·잔액으로 바뀜.
- board: 퀘스트 보상이 섬 물고기로 바뀌고 건설 퀘스트 카드가 추가됨.
- boat: 배 종류·배 꾸미기 상품이 없어짐.

트리거 행동 제외(B12) 확인: 구매·건설·목표 선택·가입·전송·종료·휴식 전환·보상받기는 지금도 별도 명령 계약이라 기준과 맞다. 다만 `progress`(PUT 진행 검증, 22·23)·`letter-read`(DELETE 열람 종료와 양쪽 삭제, 67)·`invite-resolve`(POST 코드 확인, 04·59)는 화면에 머무는 중 부를 수 있어 집계 GET에 넣지 않는다고 명시가 필요하고, `playback`은 1784에선 재생 상태 조회·지금은 재생 변경(PUT)이라 이름을 구분해야 한다.

## 집중·휴식·이동 계약

섬 홈 → 부두까지 걷기 → 항해 → 낚시섬 도착 → 자유 위치까지 걷기 → 할 일 준비 → 집중 시작. 앞의 모든 이동·준비는 집중 시간에서 제외한다. 배를 눌러 준비 전 귀환할 때는 집중 정산이 없다.

집중 → 휴식 요청 즉시 유효 집중 중지와 `restStartedAt` 기록 → 이동 연출 → 전용 모닥불 화면. 이동도 휴식 경과에 포함한다. 현재 쉬는 주민만 `restSeat`에 자동 배치하며 별도 의자 선택 API는 두지 않는다.

휴식 → 낚시섬 항해·기존 자리까지 걷기 → resume 확정 → 동일 집중 재개. 휴식 종료는 finish → 결과 → 홈. 집중 중 종료 확인 취소는 같은 집중 유지, 확정은 finish → 결과 → 귀환 항해 → 홈.

집중 세션은 귀속 섬·할 일·유효 누적·휴식 구간·기존 낚시 좌표·확정 획득 수를 가진다. 종료 결과는 이미 지급된 집중 획득과 미수령 개인 퀘스트 보상·자동 지급 보너스를 구분하고, 같은 세션을 재정산하지 않는다. 물고기 지급 시점은 P-FISH-TIMING으로 남긴다.

실시간 장면은 scene·고양이 외양·지도 기준 위치/목적지·시간 기준을 공유한다. 경로 찾기·좌우 반전·걷기/깜빡임/식빵 굽기/낚시 프레임은 앱이 그린다. 서버는 정상 활동 위치를 검증할 수 있으나 집중 자리 번호·휴식 의자 선택·물고기 그림 단계별 API는 필요 없다.

황금 물고기는 섬 단위로 서버가 1분마다 (섬, 추첨 시각) 기준으로 한 번만 추첨한다. 재시도·중복 처리로 같은 추첨을 다시 하지 않는다. 나타나면 섬 잔액 50마리 적립과 참여 주민별 기록·각자 몫 배분을 같은 처리로 확정한다. 같은 섬에서 집중 중인 주민 모두가 같은 순간 함께 낚는 모션을 보여야 하므로 참여 주민 목록과 함께 섬 실시간 채널로 알리는 것을 전제로 하며, 세부 전달 방식은 P-GOLDEN-NOTIFY로 남긴다. 확률·50마리·최대 인원 5명은 60·480과 같이 서버 정책 설정으로 관리한다.

재실행/재접속은 내 현재 집중과 현재 섬 주민 snapshot을 조회한다. 복구된 획득은 같은 구간을 중복 지급하지 않는다. 종료 응답 유실은 같은 정산 결과를 재조회/재시도해 복구한다. 백그라운드 이탈 처리 정책은 미정이다.

## 건설·퀘스트·소유권 기준

|건물|총액|공사 시간|
|---|---|---|
|마을회관|초기 공동 누적60|1분|
|게시판|초기 공동 누적 추가240|15분|
|축음기|대상 무관 고정1,360|30분|
|도서관|대상 무관 고정2,720|1시간|
|우체통|대상 무관 고정4,080|1시간 30분|
|전망대|대상 무관 고정5,440|2시간 30분|
|상점|대상 무관 고정6,800|4시간|

후속 건설(축음기~상점)의 총액은 대상 인원과 무관한 고정값이다. 목표 선택 당시 주민은 각자 `총액 ÷ 대상 인원(올림)`을 선택 뒤부터 모은다. 전원이 각자 몫을 채우고 섬 잔액이 총액 이상이면 완료 도장을 표시하며, 방장이 건설하기를 누르면 총액을 차감해 공사를 시작한다. 기존 보유분이나 이전 건물에서 모은 각자 몫은 다음 건물 요구량에 인정하지 않는다. 다음 건물 목표는 공사 완료 후에만 열리고 새 가입자는 자동 추가하지 않으며 탈퇴·강퇴자는 대상에서 제외한다. 첫 회관과 게시판은 주민별 몫 없이 섬 잔액 합산으로 판정한다.

건설 상태는 목표 준비 → 전원 각자 몫+잔액 충족(도장) → 방장 실행·차감 → 공사 → 완공이다. 목표 변경·대상 제외·잔액 사용이 있으면 서버가 다시 계산한다. 건설용 각자 몫과 도서관의 주민별 누적 획득 기록은 별도 값이다.

일일 퀘스트 설정과 날짜별 occurrence를 구분한다. 개인 claim 성공과 전원 자동 보너스는 다른 거래다. 전원 지급은 대상의 UI 접속/확인 여부와 무관하게 한 번 처리한다. 각 대상의 축하 확인은 조회/확인 상태로 복구한다.

소유권: 집중/퀘스트 보상·테마·음원은 섬, 의상·장신구는 구매자 개인. 공동 거래는 섬 원장, 개인/공동 구매 내역은 그 거래의 조회 모델이다. 게스트 전환 충돌 정리나 주민 탈퇴를 이유로 이미 적립된 공동 거래를 취소하지 않는다.

## API 기능 계약


### 인증·계정

서버 사용자·로그인 세션·단일 제공자, 계정 전환, 내 고양이 프로필과 계정 설정.

#### guest · 게스트 시작

`POST /v1/auth/guest-sessions`

- 입력·조회: 약관 동의·기기 복원 문맥
- 반환·변경: GUEST 사용자·토큰·온보딩 상태
- 권한: 비로그인
- 해금·조건: 처음부터

#### oauth · 소셜 로그인

`POST /v1/auth/oauth/sessions`

- 입력·조회: APPLE|GOOGLE|KAKAO 제공자 credential
- 반환·변경: MEMBER 사용자·토큰·온보딩 상태
- 권한: 비로그인
- 해금·조건: 처음부터

#### refresh · 토큰 갱신

`POST /v1/auth/token/refresh`

- 입력·조회: refresh token
- 반환·변경: 새 인증 세션
- 권한: 해당 세션
- 해금·조건: 처음부터

#### logout · 현재 기기 로그아웃

`DELETE /v1/auth/session`

- 입력·조회: 현재 인증 세션
- 반환·변경: 현재 세션 폐기; 서버 데이터 유지
- 권한: 본인
- 해금·조건: 처음부터

#### terms · 약관 조회

`GET /v1/terms/current`

- 입력·조회: 없음
- 반환·변경: 필수·선택 약관 version·본문 링크
- 권한: 비로그인
- 해금·조건: 처음부터

#### consent · 약관 동의 저장

`POST /v1/me/terms-consents`

- 입력·조회: 약관 version·동의 여부
- 반환·변경: 사용자 동의 기록
- 권한: 본인
- 해금·조건: 처음부터

#### account · 계정 상태 조회

`GET /v1/me/account`

- 입력·조회: 없음
- 반환·변경: accountType·단일 authProvider·guestRestrictions[]·termsConsents[]·회원 전환 필요 행동
- 권한: 본인
- 해금·조건: 처음부터

#### convert · 게스트 회원 전환

`POST /v1/me/auth-identity`

- 입력·조회: 제공자 credential
- 반환·변경: 같은 userId 회원 전환 또는 IDENTITY_ALREADY_LINKED·HOST_TRANSFER_REQUIRED·ACTIVE_FOCUS_SESSION 충돌과 차단 사유
- 권한: 게스트 본인
- 해금·조건: 처음부터; 회원의 두 번째 수단 추가·기존 수단 변경은 AUTH_PROVIDER_ALREADY_SET·AUTH_PROVIDER_IMMUTABLE 제안

#### conflict · 기존 회원 계정 사용 확인

`POST /v1/me/identity-conflicts/{conflictId}/resolve`

- 입력·조회: USE_EXISTING_ACCOUNT 명시 확인
- 반환·변경: 기존 회원 세션·게스트 개인 데이터 정리 결과
- 권한: 충돌의 당사자
- 해금·조건: 확인·방장/집중 조건 검사

#### me · 내 정보·첫 진입 복원

`GET /v1/me`

- 입력·조회: 없음
- 반환·변경: 사용자 ID·닉네임·고양이 털색·착용품·현재 소속 섬·온보딩 상태
- 권한: 본인
- 해금·조건: 처음부터

#### profile · 고양이 프로필 저장

`PATCH /v1/me/profile`

- 입력·조회: 앞뒤 공백을 제거한 닉네임·catColor; 닉네임은 대소문자를 구분하지 않고 고유
- 반환·변경: 저장한 프로필; 단일 로그인 수단은 변경하지 않음
- 권한: 본인
- 해금·조건: 처음부터

#### settings · 계정 설정 조회

`GET /v1/me/settings`

- 입력·조회: 없음
- 반환·변경: 계정에 저장할 알림 선호; 기기 OS 권한과 구분
- 권한: 본인
- 해금·조건: 처음부터

#### settings-save · 계정 설정 저장

`PATCH /v1/me/settings`

- 입력·조회: 알림 선호 등 계정 설정
- 반환·변경: 저장된 선호; OS 권한을 부여하는 명령 아님
- 권한: 본인
- 해금·조건: 처음부터

#### delete-account · 회원 탈퇴 — 보류 계약

`DELETE /v1/me`

- 입력·조회: 삭제·재인증 입력 미정
- 반환·변경: 삭제·보존 범위 미정; 성공 결과를 확정하지 않음
- 권한: 본인
- 해금·조건: 상세 정책 결정 전 구현 보류


### 섬·소속·탐색

섬 정보·주민·방장·가입·초대·탈퇴·방문·현재 소속 섬과 섬 간 검색·랭킹.

#### island-create · 섬 생성

`POST /v1/islands`

- 입력·조회: 이름·소개·approvalMode·maxResidents(1~15, 미입력 시 15)
- 반환·변경: 섬·방장 소속·초기 건설 상태
- 권한: 게스트·회원
- 해금·조건: 처음부터

#### island · 섬 홈·시설 상태 조회

`GET /v1/islands/{islandId}`

- 입력·조회: 섬 ID·주민/방문 문맥
- 반환·변경: 공개 섬 정보·성장/시설/테마·내 소속·가능 행동·잠금 이유
- 권한: 주민 또는 허용된 방문자
- 해금·조건: 방문 범위는 공개 정보

#### island-save · 섬 정보 수정

`PATCH /v1/islands/{islandId}`

- 입력·조회: 이름·소개·가입 방식·정원(1~15)
- 반환·변경: 저장한 정보·주민 수·정원
- 권한: 방장
- 해금·조건: 회관; 초기 운영 진입은 미정; 현재 주민 수보다 작은 정원은 거부

#### memberships · 내 소속 섬

`GET /v1/me/memberships`

- 입력·조회: 없음
- 반환·변경: 복수 소속·현재 소속 섬·각 섬 이동 가능 여부
- 권한: 본인
- 해금·조건: 조회는 첫 진입 복원에도 사용

#### discover · 첫 공개 섬 발견

`GET /v1/islands/discover`

- 입력·조회: 발견/다음 후보 문맥
- 반환·변경: 가입 방식·정원·공개 섬 후보·내 신청 상태; 가득 찬 섬 제외
- 권한: 게스트·회원
- 해금·조건: 첫 섬 선택은 전망대 없이 가능

#### search · 공개 섬 이름 검색

`GET /v1/islands/search`

- 입력·조회: 검색어·cursor
- 반환·변경: 섬 요약·소속/신청/가입 가능 상태; 가득 찬 섬 제외
- 권한: 게스트·회원
- 해금·조건: 첫 가입 또는 전망대 탐색

#### invite-resolve · 초대 코드 확인

`POST /v1/invitations/resolve`

- 입력·조회: 초대 코드
- 반환·변경: 목적지 섬·가입 방식·정원·현재 주민 수·초대 유효 상태; 아직 가입 아님; 가득 찬 섬은 정보만 반환하고 입장 불가·정원 가득 안내
- 권한: 게스트·회원
- 해금·조건: 첫 가입 또는 전망대 초대 입력

#### join · 가입 또는 가입 신청

`POST /v1/islands/{islandId}/join-requests`

- 입력·조회: 목적지 섬·유효 초대 문맥(있는 경우)
- 반환·변경: 승인 불필요면 주민 등록; 필요면 PENDING 신청
- 권한: 게스트·회원
- 해금·조건: 첫 가입/전망대·정원·가입 방식 검사; 가득 찬 섬은 가입·초대 코드 입장·새 신청 거부(정원 가득 안내); 마지막 한 자리 동시 요청은 한 명만 성공

#### my-requests · 내 가입 신청 상태

`GET /v1/me/join-requests`

- 입력·조회: 필요시 섬/상태·cursor
- 반환·변경: 대기·승인·거절 신청과 목적지
- 권한: 본인
- 해금·조건: 첫 가입·전망대 공통

#### join-cancel · 대기 신청 취소

`DELETE /v1/me/join-requests/{requestId}`

- 입력·조회: 본인 신청 ID
- 반환·변경: 취소 상태; 이후 재신청 가능
- 권한: 신청자 본인
- 해금·조건: 승인 대기 중

#### join-incoming · 받은 가입 신청 조회

`GET /v1/islands/{islandId}/join-requests`

- 입력·조회: 상태·cursor
- 반환·변경: 신청자 고양이·닉네임·시각·대기 건수
- 권한: 대상 섬 방장
- 해금·조건: 회관; 완공 전 진입 정책 미정

#### join-answer · 가입 승인·거절

`PATCH /v1/islands/{islandId}/join-requests/{requestId}`

- 입력·조회: accept|reject
- 반환·변경: 신청 상태·승인 시 주민 등록·정원 재확인
- 권한: 대상 섬 방장
- 해금·조건: 회관; 완공 전 진입 정책 미정; 대기 중 가득 차면 신청 유지·승인만 거부·방장에게 정원 늘리기 안내

#### invite · 초대 발급·공유

`POST /v1/islands/{islandId}/invites`

- 입력·조회: 섬 ID
- 반환·변경: 유효 초대 코드/링크·만료·가입 방식
- 권한: 방장/초대 가능 주민 범위 미정
- 해금·조건: 회관; 초기 진입·발급 권한 미정

#### members · 주민 목록 조회

`GET /v1/islands/{islandId}/members`

- 입력·조회: cursor
- 반환·변경: 주민·방장·고양이·가입 시각·공개 활동 요약
- 권한: 주민 열람; 방장 전용 아님
- 해금·조건: 섬 관리; 방문자 요약은 섬 공개 조회

#### kick · 주민 강퇴

`POST /v1/islands/{islandId}/members/{userId}/kick`

- 입력·조회: 대상 주민·확인
- 반환·변경: 소속 해제·건설 대상 제외·공동 잔액 유지
- 권한: 방장
- 해금·조건: 회관

#### transfer · 방장 위임

`POST /v1/islands/{islandId}/host-transfer`

- 입력·조회: 대상 현재 주민·확인
- 반환·변경: 새 방장·갱신한 역할
- 권한: 방장
- 해금·조건: 회관; 초기 정리 진입 미정

#### leave · 섬 탈퇴

`POST /v1/islands/{islandId}/leave`

- 입력·조회: 본인·확인; 방장 1인 섬 삭제는 파괴적 확인 토큰
- 반환·변경: 일반 탈퇴는 소속 해제·다음 섬, 방장 1인 섬은 공동 데이터 삭제·남은 메인 섬 또는 첫 섬 선택 화면
- 권한: 본인; 주민이 남은 방장은 위임 후 실행
- 해금·조건: 일반 주민의 마지막 소속 섬 탈퇴는 차단. 주민이 방장 한 명뿐인 섬은 삭제 범위와 도착지를 확인한 뒤 예외 허용

#### switch · 소속 섬 전환

`POST /v1/islands/{islandId}/switch`

- 입력·조회: 목적지 소속 섬
- 반환·변경: 새 현재 소속 섬·이동 문맥
- 권한: 해당 섬 주민 본인
- 해금·조건: 전망대·진행 집중 종료

#### visit · 다른 섬 구경 정보

`GET /v1/islands/{islandId}/visit`

- 입력·조회: 목적지 섬
- 반환·변경: 공개 장면·시설·주민 요약·가입 상태·방문 가능한 행동
- 권한: 허용된 방문자
- 해금·조건: 전망대·집중 종료 검사; 권한 제한

#### rankings · 섬 간 주간 평균 랭킹

`GET /v1/rankings/islands`

- 입력·조회: 주간·cursor
- 반환·변경: 섬별 순위·평균 집중·주민 수·집계 기간/기준
- 권한: 주민
- 해금·조건: 전망대 완공


### 집중·휴식·주민 상태

하나의 집중 세션과 유효 구간·휴식, 낚시 위치·주민 표시 상태. 이동과 애니메이션 표현은 구분한다.

#### home-summary · 홈 오늘 집중 요약

`GET /v1/me/focus-summary`

- 입력·조회: 날짜·현재 섬 문맥
- 반환·변경: 오늘 집중 초·현재 세션 참조; 기록 통계 API와 별도
- 권한: 본인
- 해금·조건: 처음부터; 집계 섬 범위 확인 필요

#### current-session · 현재 집중 복원

`GET /v1/me/focus-session`

- 입력·조회: 없음
- 반환·변경: 진행 세션 또는 null·귀속 섬·할 일·상태·시간·기존 위치·획득 수
- 권한: 본인
- 해금·조건: 처음부터

#### focus-members · 낚시섬 주민 조회

`GET /v1/islands/{islandId}/focus-members`

- 입력·조회: 섬 ID
- 반환·변경: 준비/집중 주민 고양이·위치·할 일·시간 기준·획득 수
- 권한: 같은 섬 주민
- 해금·조건: 첫 도착에도 조회; 내 세션 ID 불필요

#### focus-start · 집중 시작

`POST /v1/islands/{islandId}/focus-sessions`

- 입력·조회: task·지도 기준 자유 위치
- 반환·변경: 새 집중·귀속 섬·FOCUSING·시간 기준
- 권한: 본인·해당 섬 주민; 게스트 허용
- 해금·조건: 낚시섬 자리 도착·할 일 입력 후

#### session · 집중 상태/최종 결과 조회

`GET /v1/focus-sessions/{sessionId}`

- 입력·조회: 본인 세션 ID
- 반환·변경: 상태·유효 초·휴식 구간·낚시 위치·확정 물고기·종료 결과
- 권한: 세션 소유자 본인
- 해금·조건: 종료 후 재조회도 가능

#### progress · 집중 진행 복구·검증

`PUT /v1/focus-sessions/{sessionId}/progress`

- 입력·조회: 세션 유효 진행/구간·재시도 식별
- 반환·변경: 서버 수락 진행·확정 획득 수·잔액/퀘스트 변화
- 권한: 세션 소유자 본인
- 해금·조건: 유효 집중만; 지급 시점 정책은 미정

#### pause · 휴식 전환

`POST /v1/focus-sessions/{sessionId}/pause`

- 입력·조회: 본인 세션·전환 문맥
- 반환·변경: 유효 집중 즉시 중지·`restStartedAt`·기존 자리/획득 유지·전용 휴식 화면 상태
- 권한: 세션 소유자 본인
- 해금·조건: 집중 중; 요청 순간부터 이동을 포함해 휴식 시간으로 기록

#### resume · 같은 집중 재개

`POST /v1/focus-sessions/{sessionId}/resume`

- 입력·조회: 기존 자리 도착 확인
- 반환·변경: 같은 세션·할 일·획득·유효 누적 유지·집중 시간 재개
- 권한: 세션 소유자 본인
- 해금·조건: 쉬는 중; 귀환 항해·걷기 후 실행

#### finish · 집중/휴식 종료 정산

`POST /v1/focus-sessions/{sessionId}/finish`

- 입력·조회: 본인 세션·종료 문맥
- 반환·변경: 이번 유효 시간·집중 물고기·퀘스트 달성·보상 상태·최종 결과
- 권한: 세션 소유자 본인
- 해금·조건: 집중 중/휴식 중 동일 정산; 이동 전

#### rest-members · 모닥불 휴식 주민

`GET /v1/islands/{islandId}/rest-members`

- 입력·조회: 섬 ID
- 반환·변경: 현재 쉬는 고양이·이름·`restStartedAt`·경과 기준·서버 자동 `restSeat`
- 권한: 같은 섬 주민
- 해금·조건: 전용 휴식 화면; 다른 시설 해금 불필요; 별도 자리 선택 없음

#### emote · 집중 이모티콘

`POST /v1/islands/{islandId}/emotes`

- 입력·조회: hello|cheer|sleepy|laugh|hearts
- 반환·변경: 발신자·표현·만료 시각; 집중 상태 불변
- 권한: 같은 섬 집중 주민 본인
- 해금·조건: 집중 중; 표시 2/3초 통일 미정


### 공동 물고기·거래

섬 공동 잔액과 적립·지출 원장. 주민별 누적 획득 기록과 잔액을 구분한다.

#### wallet · 공동 잔액

`GET /v1/islands/{islandId}/wallet`

- 입력·조회: 섬 ID
- 반환·변경: currency=fish·ownerType=island·balance·version
- 권한: 주민
- 해금·조건: 초기 건설에도 조회 가능

#### ledger · 공동 가계부

`GET /v1/islands/{islandId}/resources/ledger`

- 입력·조회: 월/기간·적립/지출 필터·cursor
- 반환·변경: 현재 잔액·기간 적립/사용 합계·원인·행위자·시각·거래 내역
- 권한: 주민
- 해금·조건: 회관; 공통 차감/적립 처리는 항상 서버 내부


### 건설

초기 공동 고정 목표, 후속 고정 총액·주민별 각자 몫 달성, 공동 잔액 조건과 공사.

#### buildables · 목각 건물·청사진

`GET /v1/islands/{islandId}/construction-options`

- 입력·조회: 섬 ID
- 반환·변경: 건물 기능·총액·대상 수·각자 몫·주민별 목표 선택 뒤 모은 양·공사 시간·상태·잠금 이유
- 권한: 주민
- 해금·조건: 게시판 이후 목표 선택; 상점은 마지막

#### build-target · 후속 목표 선택·변경

`PUT /v1/islands/{islandId}/construction-target`

- 입력·조회: 건물 종류·현재 version
- 반환·변경: 고정된 대상 주민·각자 몫·주민별 선택 뒤 모은 양·잔액 조건·연결 건설 퀘스트; 선택 시점 주민별 기준값 저장
- 권한: 방장
- 해금·조건: 게시판 완공·공사 시작 전

#### construction · 초기/후속 목표·공사 상태

`GET /v1/islands/{islandId}/constructions/current`

- 입력·조회: 섬 ID
- 반환·변경: 목표·준비량/총액·각자 몫·주민별 선택 뒤 모은 양·잔액 조건·stampReady·공사/완공 시각
- 권한: 주민
- 해금·조건: 회관·게시판 미완공 때 초기 목표도 조회

#### build · 공사 시작

`POST /v1/islands/{islandId}/constructions`

- 입력·조회: 건물 목표·expectedVersion
- 반환·변경: 한 번 차감한 비용·공사 상태·완공 예정·잔액
- 권한: 방장
- 해금·조건: 초기 고정 목표 또는 후속 달성+잔액 충족


### 게시판·퀘스트·공지

일일 회차와 개인 수령·전원 자동 보너스, 공지 본문·댓글. 건설 데이터는 건설 도메인을 참조한다.

#### quests · 퀘스트 종이 카드

`GET /v1/islands/{islandId}/quests`

- 입력·조회: 날짜/회차 문맥
- 반환·변경: 일일 조건·내 달성·보상 상태·연결 건설 카드
- 권한: 주민
- 해금·조건: 게시판

#### quest · 일일 퀘스트 상세

`GET /v1/quests/{questId}`

- 입력·조회: 회차/날짜
- 반환·변경: 제목·유형·시간대/목표·대상 주민 프로필·달성·측정 상태·보상
- 권한: 해당 섬 주민
- 해금·조건: 게시판

#### quest-create · 일일 퀘스트 만들기

`POST /v1/islands/{islandId}/quests`

- 입력·조회: 제목·집중 시간대+목표 또는 하루 폰 사용 상한
- 반환·변경: 퀘스트 설정·적용 회차
- 권한: 방장
- 해금·조건: 게시판

#### quest-edit · 일일 목표 수정

`PATCH /v1/quests/{questId}`

- 입력·조회: 수정한 조건·적용 문맥
- 반환·변경: 저장한 설정·적용 회차; 당일 처리 정책 미정
- 권한: 방장
- 해금·조건: 게시판

#### claim · 개인 보상받기

`POST /v1/quest-occurrences/{occurrenceId}/rewards/me`

- 입력·조회: 해당 일일 회차
- 반환·변경: 섬에 개인 달성 보상 10마리 1회 적립·수령 상태
- 권한: 달성 대상 주민 본인; 게스트 허용
- 해금·조건: 이미 달성한 회차; 도서관 불필요

#### reward-notifications · 미수령·미확인 보상 안내

`GET /v1/me/reward-notifications`

- 입력·조회: 선택 섬·cursor
- 반환·변경: 미수령 개인 보상·이미 지급된 전원 보너스·미확인 축하
- 권한: 대상 사용자 본인
- 해금·조건: 달성 회차; 오프라인 후에도 조회

#### reward-ack · 축하 확인

`POST /v1/me/reward-notifications/{notificationId}/ack`

- 입력·조회: 본인 축하 안내 ID
- 반환·변경: 확인 완료; 추가 지급 없음
- 권한: 대상 사용자 본인
- 해금·조건: 전원 보너스는 확인 전 이미 지급

#### notices · 공지 쪽지 목록

`GET /v1/islands/{islandId}/notices`

- 입력·조회: cursor
- 반환·변경: 제목·작성자·시각·댓글 수
- 권한: 주민
- 해금·조건: 게시판

#### notice · 공지 본문

`GET /v1/notices/{noticeId}`

- 입력·조회: 공지 ID
- 반환·변경: 제목·본문·작성자·시각·댓글 수·가능 행동
- 권한: 해당 섬 주민
- 해금·조건: 게시판

#### notice-create · 공지 작성

`POST /v1/islands/{islandId}/notices`

- 입력·조회: 제목·본문
- 반환·변경: 저장한 공지
- 권한: 방장
- 해금·조건: 게시판

#### notice-edit · 공지 수정

`PATCH /v1/notices/{noticeId}`

- 입력·조회: 제목·본문
- 반환·변경: 저장한 공지
- 권한: 방장; 작성자/운영자 예외 미정
- 해금·조건: 게시판

#### notice-delete · 공지 삭제

`DELETE /v1/notices/{noticeId}`

- 입력·조회: 공지 ID
- 반환·변경: 삭제 상태
- 권한: 방장; 작성자/운영자 예외 미정
- 해금·조건: 게시판

#### comments · 댓글 조회

`GET /v1/notices/{noticeId}/comments`

- 입력·조회: cursor
- 반환·변경: 작성자 고양이·이름·시각·본문·가능 행동
- 권한: 해당 섬 주민
- 해금·조건: 게시판

#### comment-create · 댓글 남기기

`POST /v1/notices/{noticeId}/comments`

- 입력·조회: 본문
- 반환·변경: 저장한 댓글
- 권한: 해당 섬 주민
- 해금·조건: 게시판

#### comment-delete · 댓글 삭제 — 권한 확인 필요

`DELETE /v1/comments/{commentId}`

- 입력·조회: 댓글 ID
- 반환·변경: 삭제 상태
- 권한: 작성자/방장·운영자 범위 확인 필요
- 해금·조건: 게시판; 세부 권한 미정


### 도서관·기록·스크린타임

기록 저장·측정 수집과 도서관 조회를 분리한다. 공개 범위는 전체 공개 고정이다.

#### library-status · 도서관 진입·기록 선택

`GET /v1/islands/{islandId}/library/summary`

- 입력·조회: 섬 ID
- 반환·변경: 완공/접근 상태·선택 가능한 주민·기록 종류; 미완공 시 기록 미반환
- 권한: 주민·허용된 타 섬 방문자
- 해금·조건: 상태 조회는 미완공에도 가능

#### focus-stats · 일기장 집중 장

`GET /v1/islands/{islandId}/library/statistics/focus`

- 입력·조회: period=day|week|month·기준 날짜·대상 userId
- 반환·변경: 조회 범위·합계·날짜별 시간·할 일별 합계·dataStatus
- 권한: 주민·타 섬 주민 열람
- 해금·조건: 대상 섬 도서관 완공

#### screen-stats · 일기장 스크린타임 장

`GET /v1/islands/{islandId}/library/statistics/screen-time`

- 입력·조회: 기간·기준 날짜·대상 userId
- 반환·변경: 합계·측정 분류별 시간·측정 상태·측정/갱신 시각
- 권한: 주민·타 섬 주민 열람
- 해금·조건: 대상 섬 도서관 완공

#### fish-earnings · 주민별 누적 물고기 장

`GET /v1/islands/{islandId}/library/fish-earnings`

- 입력·조회: 섬 ID
- 반환·변경: 주민 프로필·섬 기준 누적 획득; 잔액과 별도
- 권한: 주민·타 섬 주민 열람
- 해금·조건: 대상 섬 도서관 완공; 건설 달성 확인은 별도 허용

#### screen-upload · 기기 스크린타임 수집

`PUT /v1/me/screen-time/{date}`

- 입력·조회: 날짜·시간대·기기/측정 출처·집계값·측정 상태
- 반환·변경: 서버 수락 측정·갱신 상태·관련 일일 평가
- 권한: 본인; 게스트 허용
- 해금·조건: 도서관 없이 수집; 병합·지연 정산 정책 미정


### 친구·편지

친구는 섬 소속과 무관하다. 개인 편지는 비동기 문서 단위이며 섬 전체 편지방과 수신 범위가 다르다.

#### friend-search · 친구 찾기

`GET /v1/users/search`

- 입력·조회: 전체 닉네임 정확 일치 검색어·cursor
- 반환·변경: 사용자 식별·닉네임·고양이·친구/요청 상태
- 권한: 인증 회원
- 해금·조건: 우체통 건설 조건 없음

#### friends · 친구 목록

`GET /v1/me/friends`

- 입력·조회: cursor
- 반환·변경: 친구 프로필·친구 관계; 표시 섬 기준 미정
- 권한: 본인
- 해금·조건: 우체통 건설 조건 없음

#### friend-requests · 받은·보낸 친구 요청

`GET /v1/me/friend-requests`

- 입력·조회: incoming|outgoing·cursor
- 반환·변경: 요청자/상대 프로필·상태·시각·건수
- 권한: 본인
- 해금·조건: 우체통 건설 조건 없음

#### friend-send · 친구 요청

`POST /v1/me/friend-requests`

- 입력·조회: 상대 userId
- 반환·변경: 대기 요청; 수락 전 친구 아님
- 권한: 회원 본인; 게스트는 전환
- 해금·조건: 우체통 건설 조건 없음

#### friend-answer · 친구 요청 수락·거절

`PATCH /v1/me/friend-requests/{requestId}`

- 입력·조회: accept|reject
- 반환·변경: 수락 시 양방향 친구; 거절 후 재신청 가능
- 권한: 수신자 본인; 게스트 행동 범위 확인 필요
- 해금·조건: 우체통 건설 조건 없음

#### friend-cancel · 보낸 친구 요청 취소

`DELETE /v1/me/friend-requests/{requestId}`

- 입력·조회: 본인 대기 요청
- 반환·변경: 취소 상태
- 권한: 발신자 본인
- 해금·조건: 우체통 건설 조건 없음

#### friend-delete · 친구 삭제

`DELETE /v1/me/friends/{friendId}`

- 입력·조회: 친구 ID
- 반환·변경: 관계 해제; 새 편지 발송 차단; 이미 도착한 미열람 편지도 삭제
- 권한: 본인
- 해금·조건: 우체통 건설 조건 없음

#### island-messages · 우리 섬 편지방 읽기

`GET /v1/islands/{islandId}/messages`

- 입력·조회: 이전 편지 cursor
- 반환·변경: 작성자 고양이·닉네임·시각·본문; 섬 전체 수신
- 권한: 해당 섬 주민
- 해금·조건: 우체통 완공

#### island-message · 우리 섬에 글 남기기

`POST /v1/islands/{islandId}/messages`

- 입력·조회: 본문
- 반환·변경: 저장된 섬 전체 글; 개인 읽음 표시 없음
- 권한: 해당 섬 회원 주민; 게스트는 전환
- 해금·조건: 우체통 완공

#### letters-received · 받은 편지

`GET /v1/me/letters/received`

- 입력·조회: 접근 islandId·cursor
- 반환·변경: 열지 않은 편지 목록·발신자·시각·요약·읽지 않은 수
- 권한: 수신자 회원 본인
- 해금·조건: 수신자가 이용하는 우체통 완공

#### letters-sent · 보낸 편지

`GET /v1/me/letters/sent`

- 입력·조회: 접근 islandId·cursor
- 반환·변경: 상대가 아직 닫지 않은 보낸 편지 목록·수신자·시각·요약
- 권한: 발신자 본인
- 해금·조건: 접근 섬 우체통 완공

#### letter · 편지 상세

`GET /v1/me/letters/{letterId}`

- 입력·조회: 접근 islandId·편지 ID
- 반환·변경: 아직 닫지 않은 편지의 발신자·수신자·본문·시각
- 권한: 해당 편지 발신자/수신자 본인
- 해금·조건: 우체통 진입 조건 검사

#### letter-send · 친구에게 편지 발송

`POST /v1/me/letters`

- 입력·조회: 접근 islandId·친구 수신자·본문
- 반환·변경: 저장된 비동기 편지·발송 시각; 채팅방 없음
- 권한: 회원 발신자·현재 친구; 게스트는 전환
- 해금·조건: 발신자가 접근한 섬의 우체통 완공; 수신자 쪽 우체통 완공은 요구하지 않음

#### letter-read · 받은 편지 열람 종료·삭제

`DELETE /v1/me/letters/{letterId}`

- 입력·조회: 접근 islandId·편지 ID
- 반환·변경: 수신 편지 삭제·열람 종료 시각; 같은 요청 재시도는 멱등 처리
- 권한: 수신자 본인
- 해금·조건: 편지를 연 뒤 닫을 때 호출; 우체통 진입 조건 검사


### 상점·보유품·테마

개인 구매자는 의상을 소유하고 섬은 공동 테마를 소유한다. 지출은 공동 물고기 거래에 남는다.

#### catalog · 상품 목록

`GET /v1/islands/{islandId}/shop/catalog`

- 입력·조회: 개인/공동 분류·cursor
- 반환·변경: 상품·가격·기능/미리보기·소유 대상·보유/적용 상태
- 권한: 주민; 게스트 보기 허용
- 해금·조건: 상점 완공

#### product · 상품 상세

`GET /v1/islands/{islandId}/shop/products/{productId}`

- 입력·조회: 상품 ID
- 반환·변경: 이름·설명·가격·미리보기·소유/적용·현재 잔액·예상 잔액
- 권한: 주민; 게스트 보기 허용
- 해금·조건: 상점 완공

#### purchase · 상품 구매

`POST /v1/islands/{islandId}/shop/purchases`

- 입력·조회: 상품 ID·확인
- 반환·변경: 한 번 차감·개인 또는 섬 보유품·구매 내역·잔액
- 권한: 회원 주민 누구나; 게스트는 전환
- 해금·조건: 상점 완공·공동 잔액 검사

#### inventory · 내 의상·장신구

`GET /v1/me/inventory`

- 입력·조회: 분류·cursor
- 반환·변경: 본인 개인 보유품·현재 착용
- 권한: 본인
- 해금·조건: 내 뗏목; 상점/현재 섬 탈퇴와 무관하게 보유 유지

#### appearance · 착용·해제

`PUT /v1/me/appearance`

- 입력·조회: 보유 의상/장신구 슬롯·기본값
- 반환·변경: 갱신한 고양이 외양·주민 표시 변화
- 권한: 본인·보유품 검사
- 해금·조건: 내 뗏목; 구매와 별도

#### themes · 공동 테마 보유·적용

`GET /v1/islands/{islandId}/themes`

- 입력·조회: 섬 ID
- 반환·변경: 섬/건물별 보유·적용 상태
- 권한: 주민
- 해금·조건: 상점; 서버 내부 장면 복원과 구분

#### theme-save · 공동 테마 적용·해제

`PUT /v1/islands/{islandId}/themes`

- 입력·조회: 대상 섬/건물·보유 themeId 또는 기본값
- 반환·변경: 갱신한 공동 외양
- 권한: 주민 누구나·보유/대상 검사
- 해금·조건: 상점 완공

#### my-orders · 내 구매 내역

`GET /v1/me/purchase-history`

- 입력·조회: 필요시 섬·cursor
- 반환·변경: 내 개인 상품 구매·차감한 섬·가격·시각
- 권한: 본인
- 해금·조건: 상점 구매 내역 진입

#### island-orders · 섬 공동 구매 내역

`GET /v1/islands/{islandId}/purchase-history`

- 입력·조회: 상품/음원 종류·cursor
- 반환·변경: 해당 섬 공동 상품/음원·구매 주민·가격·시각
- 권한: 주민
- 해금·조건: 상점 구매 내역; 회관 원장과 같은 거래 근거


### 축음기·공동 음악

섬 음원 소유·공동 재생 상태. 개인 미리듣기와 기기 음량은 공동 상태를 바꾸지 않는다.

#### gramophone · 축음기 상태·보유 음원

`GET /v1/islands/{islandId}/gramophone`

- 입력·조회: 섬 ID
- 반환·변경: 완공 상태·보유 트랙/미디어·현재 곡·재생·변경 시각
- 권한: 주민; 허용된 방문자 듣기 범위 확인 필요
- 해금·조건: 실제 보유·재생은 축음기 완공

#### audio-catalog · 판매 음원·미리듣기

`GET /v1/islands/{islandId}/gramophone/catalog`

- 입력·조회: cursor
- 반환·변경: 음원·설명·가격·미리듣기 미디어·보유 여부
- 권한: 주민
- 해금·조건: 축음기 완공; 상점 불필요

#### audio-purchase · 공동 음원 구매

`POST /v1/islands/{islandId}/gramophone/purchases`

- 입력·조회: trackId·구매 확인
- 반환·변경: 공동 보유 음원·한 번 차감·거래 내역·잔액
- 권한: 주민 누구나; 게스트 구매 허용 미정
- 해금·조건: 축음기 완공; 상점 불필요

#### playback · 공동 재생·변경·정지

`PUT /v1/islands/{islandId}/gramophone/playback`

- 입력·조회: 보유 trackId·재생/정지·expectedVersion
- 반환·변경: 공동 곡·재생 상태·변경 기준 시각·변경자
- 권한: 주민 누구나
- 해금·조건: 축음기 완공; 홈/집중 동일 상태


## 실시간·알림 계약

|이벤트 제안|수신 범위|전달 내용|처리 기준|
|---|---|---|---|
|focus.member.updated|같은 섬 주민|고양이 외양·낚시 위치·할 일·집중 상태·시간 기준·확정 획득 수|상태 변경·진행 갱신; 매초 프레임 전송 불필요|
|rest.member.updated|같은 섬 주민|휴식 주민·휴식 시간 기준·표시 위치|휴식 시작·재개·종료|
|member.position.updated|같은 섬 주민|장면·지도 기준 위치/목적지·이동 시작 기준|공유할 이동 상태만; 경로/걷기 프레임은 앱 보간|
|focus.emote|같은 섬 집중 주민|사용자·5종 표현·expiresAt|휘발; 만료 이벤트는 복구 때 재노출 안 함|
|wallet.updated|해당 섬 주민|섬 잔액·거래 version|집중 지급·퀘스트·구매·건설|
|construction.updated|해당 섬 주민|목표·각자 몫 진행·잔액 조건·도장·공사/완공|각자 몫 진행 유지; 잔액 부족으로 도장 해제·복구|
|quest.progress.updated|해당 섬 주민|일일 회차·주민 달성·개인 수령/전원 지급 상태|중복 보상 없이 서버 판정|
|reward.notification.created|대상 사용자만|미수령 개인 보상 또는 지급된 전원 보너스 축하|오프라인 미확인은 REST 재조회|
|join.request.updated|신청자·대상 방장|가입 신청 상태·승인 결과|승인 뒤 소속·주민 snapshot 갱신|
|island.members.updated|해당 섬·영향받은 사용자|가입·탈퇴·강퇴·위임·접근 변경|강퇴 후 보호 데이터 구독 해제|
|notice.updated|해당 섬 주민|공지·댓글 변화 참조|필요한 목록/상세 재조회|
|message.created|섬 전체 편지방 주민|섬 글·작성자·시각|친구 개인 편지와 분리|
|friend-request.updated|요청 당사자만|친구 요청·관계 변화|수락·거절·취소·삭제|
|letter.created / letter.closed|편지 발신자·수신자만|개인 편지 도착·열람 종료와 양쪽 삭제|실시간 알림이 가능해도 채팅방 모델은 아님|
|inventory.updated / member.appearance.updated|개인 보유품은 본인; 공개 외양은 같은 섬|개인 구매·착용/털색 변화|비공개 보유품 목록을 다른 주민에게 전송하지 않음|
|island.appearance.updated|해당 섬 주민|섬/건물 테마 적용·해제|공동 장면 갱신|
|playback.updated|공동 음악 청취자|섬·보유 트랙·재생/정지·변경 시각·version|개인 미리듣기/음량은 전송하지 않음|

실시간 연결은 인증 사용자·소속 섬·접근 장소에 따라 구독 범위를 검사한다. 재연결 때 현재 snapshot을 받으며 이벤트 ID/자원 version으로 중복·역순을 처리한다. 개인 편지·보유품·보상은 당사자에게만 전달한다. 동일 섬 주민이 아닌 방문자는 보호 데이터를 받지 않는다.

위치 변화는 사용할 실시간 전달 채널의 사용자 명령으로 검증·공유할 수 있다. 별도 REST 걷기 프레임 API는 없다. 새 편지·가입 승인·미확인 축하는 앱 재진입 조회로도 복구한다. 푸시 토큰 등록·WebSocket/SSE·전송 보존/주기는 구현자 설계 항목이며 독립 알림센터 화면은 요구하지 않는다.

## 미정 정책

아래 항목은 구현 전 결정이 필요하다.

|정책 ID|주제|남은 결정|이미 확정된 부분|
|---|---|---|---|
|P-FISH-TIMING|물고기 지급·사용 시점|1분마다 즉시 공동 잔액에 적립해 집중 중 사용할지, 집중 종료 때 적립할지.|60초마다 1마리, 주민 1명·섬 1곳 하루 최대 480마리, 이동·휴식 제외, 같은 구간 중복 지급 금지.|
|P-EARNED-SCOPE|각자 몫 포함 범위|공사 전 목표를 바꿀 때 이미 모은 각자 몫을 이어서 셀지. 일일 퀘스트 보상을 각자 몫에 넣을지.|목표 선택 뒤 모은 양만 인정. 공동 잔액에는 적립하고 구매·건설로 주민 누적은 감소하지 않는다.|
|P-SESSION-TIME|집중·휴식 시간|화면 잠금·백그라운드·앱 종료 때 집중과 휴식을 유지·중지·종료하는 기준.|휴식 버튼을 누른 시각부터 이동을 포함해 휴식으로 기록. 휴식은 유효 집중에서 제외하고 같은 세션·기존 자리로 재개.|
|P-DAILY|일일 퀘스트 대상|그날 대상 주민을 확정하는 시점과 중도 가입·탈퇴한 주민의 처리.|개인 달성 10마리, 전원 보너스 대상 수×5마리, 집중·스크린타임 퀘스트 보상 같음. 건설 퀘스트 대상 고정 규칙은 별도.|
|P-DAILY-EDIT|일일 퀘스트 수정|당일 변경한 목표를 오늘 회차부터 적용할지, 다음 날부터 적용할지.|일일 회차별 보상은 각각 1회. 건설 퀘스트는 일일 초기화하지 않음.|
|P-UNCLAIMED|미수령 개인 보상|날짜가 바뀐 뒤에도 수령 가능하게 유지할지, 자동 지급할지, 만료할지.|개인 보상은 본인이 받기를 눌러 지급. 전원 보너스는 자동 지급.|
|P-SCREEN-FINAL|폰 사용 퀘스트 확정|다음 날 정산 여부·확정 시각과 측정 자료가 늦게 도착하거나 없을 때의 처리.|하루 상한·일일 회차, 권한 없음·기록 없음·0 구분.|
|P-RECORD-SCOPE|도서관 조회 범위|완공 뒤 건설 이전 기록 조회 여부, 내 일기장의 현재 섬/전체 개인 범위, 로그인 없는 외부 열람.|미완공 동안 이전 기록 조회 제한, 이번 결과는 허용, 타 섬 주민 열람·전체 공개 고정.|
|P-POSITION|낚시 위치|다른 주민과 위치가 겹칠 때의 처리.|자유 지도 좌표·자리 번호 없음.|
|P-GOLDEN-NOTIFY|황금 물고기 알림|섬 실시간 이벤트의 이름·내용(참여 주민·배분량), 재연결 때 놓친 이벤트 복구, 앱을 꺼 둔 채 집중 중인 주민에게 다시 켰을 때 알려 줄지.|섬마다 1분 1회 서버 추첨, 확률표, 섬 잔액 50마리 1회, 참여 주민 50÷인원(내림) 배분, 480 상한과 별도. 앱은 계산하지 않고 알림을 받아 참여한 고양이 모두의 함께 낚기 모션을 보여 준다.|
|P-FRIEND|친구 검색·프로필 표시|복수 소속 친구의 메인 섬 외 추가 정보를 어디까지 표시할지.|대소문자 없이 정확한 닉네임 검색, 수락으로 친구, 요청 취소·거절·삭제·재신청, 삭제 시 미열람 편지 삭제, 차단은 2.0 제외.|
|P-MAIL-GATE|편지·게스트 접근|게스트의 편지 읽기·친구 요청 수락을 허용할지.|발신자가 쓰는 우체통은 완공 필요, 수신자 섬 우체통은 불필요, 친구 추가·편지 발송은 회원 전환, 실시간 1:1 채팅방 없음.|
|P-MUSIC|음악·게스트 음원 구매|기본 보유 곡, 같은 곡만 맞출지 재생 구간까지 맞출지, 게스트 축음기 구매·방문자 듣기.|주민 공동 변경·직접 구매, 상점 불필요, 개인 음량·음소거·미리듣기 분리.|
|P-TIME|집계 시간 기준|일일/주간 시간대, 랭킹 주민 수 분모 시점·동점, 여러 기기 측정 병합.|일요일 00시 새 주, 해당 섬 집중 합계÷전체 주민 수.|
|P-EARLY|초기 운영·초대|회관이 없을 때 가입 승인·초대·방장 위임의 진입 방식. 초대를 방장만 발급할지, 주민도 발급할지.|첫 생성·가입·집중·초기 건설은 회관 없이 가능. 초대가 승인/정원/이동 잠금을 우회하지 않음.|
|P-MODERATION|공지·댓글·신고|본인 댓글 삭제·방장의 다른 주민 댓글 삭제 권한, 공지 작성자/운영자 예외, 신고·차단 제공 범위.|방장 공지 작성·수정, 주민 댓글. 차단 도입은 미정.|
|P-LOCAL|설정·안내·이모티콘|기기를 바꿔도 유지할 설정·튜토리얼 완료 상태와 이모티콘 표시 시간.|OS 권한은 기기에서, 기기 음량·음소거는 공동 상태 불변.|
|P-HELD|계정·기존 데이터 — 보류|계정 삭제·보존 범위, 닉네임 상세 규칙, 기존 GROMO 계정·재화 이전.|단일 로그인 제공자와 게스트 전환·충돌 처리.|
