# 무엇을 어디서 수정하나

처음에는 [기획 작업대](https://oneorthree.github.io/planning-document/feature-inventory.html)에서 바꿀 영역을 찾는다. **기획 문서 수정**인지 **실제로 움직이는 시연 수정**인지 먼저 구분한다. 두 영역은 아직 자동으로 동기화되지 않는다.

## 정보의 세 층

| 층 | 역할 | 주된 파일 |
| --- | --- | --- |
| 결정·설명 | 왜 그렇게 정했는지, 확정과 제안의 경계 | `decision-log.md`, `*-story-plan.md`, `*-revision-20260911.md` |
| 기획 작업대 | 팀이 읽는 6개 탭과 기능 목록 | `feature-inventory.html`, `*-data.js`, `planning-workbench.js` |
| 조작 시연 | 마을·IA·모바일·모션의 동작 실험 | `index.html`, `ia.html`, `mobile.html`, `rig.html`, `walk.html` |

최신 사용자 결정과 그 결정을 반영한 수정 메모가 과거 설계보다 우선한다. `revisions/`는 제공된 수정본 보관본, `references/legacy-design/`은 초기 제품 설계, `prototype-history.md`와 보고서는 과거 제작 기록이다. 날짜만 보고 제안을 확정으로 바꾸지 않는다. 충돌을 찾으면 결정 로그의 근거를 확인하고, 근거가 없으면 미정으로 남긴다.

## API 명세

백엔드 전달 협의안은 [`api/v1/gromo-api-spec.md`](api/v1/gromo-api-spec.md)가 단일 원본이다. 화면별 스펙과 도메인별 전달 메모를 다시 따로 수정하지 않는다. 확정 정책과 제안 계약·미정 정책을 구분하고, 현재 운영 API나 구현 완료로 표시하지 않는다. 수정 후 `python3 scripts/render-api-spec.py`로 [HTML](api/v1/index.html)을 갱신한다. 버전 추가와 검증 방법은 [API 문서 안내](api/README.md)를 따른다.

## 6개 탭 수정 지도

| 화면에서 바꿀 것 | 먼저 수정 | 함께 확인 |
| --- | --- | --- |
| 유저 저니: 세 시작 경로·전체 장면 | `journey-route-data.js` | `journey-route.js`, `invite-story-plan.md`, `no-invite-story-plan.md`, `story-loop-plan.md` |
| 유저 저니: 상단 요약·진입 카드 | `feature-inventory.html`의 `#journey-view` | 실제 선택 경로와 요약의 내용 일치 |
| 섬의 발전: 시설 순서·조건·비용 | 같은 HTML의 `#growth-view` | `growth-decoration-revision-20260911.md`, 기능 E/F/L, 결정 로그 |
| 이야기: 8개 큰 기능의 이야기 | `feature-overview.js` | `gachisup-story-and-wrapping.md`, `story-wrapping-notes.md` |
| 도입 이야기: 고양이가 뗏목에 오르는 3개 후보 | `prologue-scenarios-data.js` | `prologue-scenarios.js`가 표시하며 `prologue-scenarios.md`와 문장을 맞춘다. 사용자 선택 전에는 후보 상태 유지 |
| 도입 컷신: 이야기 3개 × 연출 3개 | `cutscene-production.js`, `cutscene-cinema.js` | [컷신 제작 하네스](cutscene-production.md). 생성 파생 에셋·실시간 연출·MP4 고정 버전·검토 상태를 구분 |
| 기능 표현: 기능을 섬의 물건·장소로 표현 | HTML의 `#wrapping-view` | 기능 데이터의 `world`, 위의 이야기 원문 |
| 세부 기능: 항목·상태·근거·흐름 | `feature-inventory-data.js` | `feature-inventory.js`는 렌더링·검색 담당 |
| 결정 로그: 확정·논의 중·이전안 | `planning-workbench.js`의 `entries` | `decision-log.md`에도 같은 근거·상태 반영 |
| 탭·링크 복원·키보드 이동 | `planning-workbench.js` | `feature-inventory.js`, `journey-route.js`의 URL 처리 |
| 색·대비·간격 | `planning-tokens.css`, `planning-workbench.css` | `feature-inventory.css`, `feature-overview.css`, `feature-story.css` |

현재 결정 로그의 JS와 MD, 성장 탭의 HTML과 정책 원문은 각각 존재한다. 자동 동기화된다고 가정하지 말고 관련 항목을 함께 수정한다. 이 중복은 향후 데이터 분리 대상이며 이번 이전에서는 정책 구조를 재설계하지 않았다.

## 세부 기능의 데이터 구조

`feature-inventory-data.js`는 브라우저 전역 `GachisupFeatureInventory`를 만든다. `sources`는 출처 사전, `groups`는 기능 영역, `features`는 각 영역을 펼친 목록이다. `features`를 따로 추가하지 말고 해당 `group(...)`의 행을 수정한다.

행은 `[id, title, action, world, options]` 형식이다. `options`가 생략한 값은 그룹 기본값을 상속하므로 최종 상태를 화면에서 확인한다.

| 필드 | 의미·수정 규칙 |
| --- | --- |
| `id` | 안정적인 기능 ID. 기존 ID를 다시 번호 매기지 않는다. |
| `title` / `action` | 기능 이름 / 사용자가 하는 일 |
| `world` | 그 기능을 섬에서 어떻게 보여주는가 |
| `decision` | `base` 기존 설계, `chosen` 사용자 결정, `proposal` 제안, `review` 승계 검토, `later` 보류 |
| `proof` | `local` 로컬 시연, `mock` 시안만, `illustration` 설명만, `legacy` 원앱 참조, `studio` 작업실, `pending` 연결 전 |
| `sources` | `sources` 사전의 키 배열. 이 저장소 경로와 별도 `phone` 저장소 출처를 구분한다. |
| `screens` | `ia-manifest.js`의 화면 ID. 기획에 없는 과거 시연을 억지로 매핑하지 않는다. |
| `note` | 조건·예외·구현 범위·미정 사항 |
| `document` / `studio` / `story` | 수정본 HTML / 모션 작업실 / 이야기 앵커 연결 |
| `revision` / `domain` | 집중 수정본의 상세 설명 / 집중 영역 안의 가치 묶음 |

`retiredFeatures`와 `retiredScreens`는 삭제·통합 이력이다. 제외한 ID를 새 기능에 재사용하면 예전 링크가 다른 의미가 되므로 재사용하지 않는다.

## 기능 영역별 찾아가기

아래 모든 영역의 목록 원본은 `feature-inventory-data.js`다. 마지막 열은 **시연 동작까지 바꿀 때** 읽을 파일이다. 현재 기획의 구현 완료 목록이 아니다.

| 영역 키 · ID 계열 | 내용 | 시연 관련 코드 |
| --- | --- | --- |
| `start` · A | 첫 시작·계정 | `ia-onboarding.js`, `ia-model.js` |
| `discover` · B | 섬 발견·초대·이동 | `journey-route-data.js`, `ia-onboarding.js`, `ia-sheets.js`, `ia-world.js` |
| `world` · C | 마을 둘러보기 | `village.js`, `village-background.js`, `world-polish.js` |
| `focus` · D | 집중·휴식·개인 목표 | `village-features.js`, `village-activities.js`, `village-store.js` |
| `together` · E | 섬 건설·공동 모임 | `cooperative-places.js`, `cooperative-art.js` |
| `quest` · F | 두 종류 퀘스트 | `ia-board.js`, `village-features.js`, `village-store.js` |
| `board` · G | 공지·댓글·자료 | `ia-board.js`, `village-features.js`, `local-attachments.js` |
| `stats` · H | 집중·사용량 통계 | `village-features.js`, `village-store.js` |
| `friends` · I | 친구·섬 전체 편지방 | `ia-community.js`, `village-features.js` (기존 우편 시연과 차이 확인) |
| `notifications` · J | 알림·재방문 | `ia-sheets.js`, `ia-profile.js` (실제 푸시 미연결) |
| `manage` · K | 운영·권한 | `ia-model.js`, `ia-community.js`, `village-store.js` |
| `economy` · L | 성장·재화·구매·배치 | `ia-profile.js`, `cooperative-places.js`, `village-store.js` |
| `ranking` · M | 랭킹·비교 | `village-features.js`, `ia-world.js` |
| `characters` · N | 고양이·모션 | `momo-rig.js`, `momo-walk.js`, `reading-profile-*.js`, `walk-profile-*.js` |
| `system` · O | 권한·안전·복구 | `ia-model.js`, `village-store.js`, `local-attachments.js` |
| `later` · P | 후보·보류 | 목록·원문만 수정. 채택 없이 시연 기능으로 추가하지 않는다. |

## 자주 하는 수정의 순서

### 기능 한 개의 설명을 바꾼다

1. 작업대에서 기능 ID를 확인한다. 예: `I06`.
2. 데이터 파일에서 해당 행의 `action`, `world`, `note`를 수정한다. 표현 수정이면 `decision`·`proof`는 그대로 둔다.
3. 상위 이야기에도 같은 표현이 있으면 요약을 맞춘다.
4. `?mode=detail#feature-I06`으로 직접 열고 검색·필터에서도 확인한다.

### 초대 또는 초대 없는 이야기를 바꾼다

1. `journey-route-data.js`에서 `invite`, `public`, `create` 경로를 찾는다.
2. `scene`(보이는 장면), `action`(내가 하는 일), `next`(다음), `state`(확정 범위), `boundary`(예외)를 수정한다.
3. 공통 집중 루프는 `prepare`, `focus`, `rest`, `finish` 공통 객체를 수정한다.
4. 경로 원문과 상단 요약을 맞춘다. 초대 원문 일치는 자동 검증하며, 초대 없는 원문의 의미 일치는 직접 검토한다.
5. 경로 선택·새로고침·뒤로가기·320px 화면을 확인한다.

### 건설 비용이나 보상 규칙을 바꾼다

1. 사용자 확정인지 시뮬레이션 제안인지 먼저 기록한다.
2. 성장 수정 메모 → 성장 탭 → 관련 E/F/L 기능 → 결정 로그 순으로 맞춘다.
3. 특정 일수 안에 완성된다고 단정하거나, 미정 지급량을 확정 표시하지 않는다.
4. 실제 지급 시연까지 바꾸라는 요청이 있을 때만 저장소·보상 코드를 수정한다.

### IA 화면 또는 모션을 바꾼다

IA는 `ia-manifest.js`의 등록과 `ia-structure.js`의 분류, `ia-catalog.js`의 탐색을 함께 확인한다. 화면 본문은 `ia-*.js`, `village-features.js` 등에 있다. `ia.html`과 `mobile.html`은 `index.html`을 iframe으로 보여주므로 실제 본문 수정은 그쪽에 반영한다.

독서는 `rig-studio.js`가 캐릭터 선택을, `momo-rig.js`와 `reading-profile-*.js`가 리깅을 담당한다. 걷기는 `walk-studio.js`, `momo-walk.js`, `walk-profile-*.js`다. 새 에셋은 상대경로로 참조하고 alpha·색상·눈·관절·저속 재생을 확인한다. 과거 동물 시안 보존과 현재 고양이 플레이어 정책은 별개다.

## 완료 확인

수정한 화면·원문·결정 상태가 일치하고, 기존 ID 링크가 열리며, [하네스](harness.md)의 검증이 통과하면 공유할 준비가 된 것이다. 기획만 수정한 경우 보고에 “기획 반영, 앱 구현 별도”를 명시한다.
