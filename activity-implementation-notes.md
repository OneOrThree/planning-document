# 장소별 활동 · 바다 개선 기록

구현일: 2026-09-09. 범위: 로컬 HTML 프로토타입. 실제 앱 차단·서버 동기화·멀티플레이는 미연결.

후속 수정: 책상 원화·크기·배치, 휴대폰 기본 구도, 입항·출항 모션은 [가구·휴대폰·입출항 개선 기록](world-polish-notes.md)이 최신이다. 아래 최초 자산·출항 설명은 당시 구현 기록으로 보존한다.

## 바로 확인

- 마을: https://oneorthree.github.io/planning-document/
- 독서 준비: https://oneorthree.github.io/planning-document/?activity=read
- 공부 준비: https://oneorthree.github.io/planning-document/?activity=study
- 휴식 준비: https://oneorthree.github.io/planning-document/?activity=rest

링크는 활동 선택만 열며 세션을 자동 시작하지 않는다. 진행 중인 세션이 있다면 그것을 먼저 복원한다.

## 구현 범위

| 활동 | 장소와 동작 | 기록 |
| --- | --- | --- |
| 독서 | 기존 모닥불로 이동, 모모의 기존 독서·책장 넘김 | 집중 |
| 공부·작업 | 마을에 추가한 4인 테이블로 이동, 시작 인사 후 필기·고개·꼬리 관절 모션 | 집중 |
| 휴식 | 항구로 이동, 작은 배를 타고 해안 밖으로 출항, 호흡·고개·꼬리와 배 흔들림 | 별도 휴식 |

공부의 세 자리는 현재 빈자리이며 친구 착석·대화는 미구현이다. 새 공부·휴식 리깅은 모모만 적용했다. 휴식 종료는 확인 후 마을로 즉시 복귀하며 귀항 애니메이션은 아직 없다. 세션은 이동 시작부터 시간을 기록한다. UI의 움직임 줄이기와 OS의 동작 줄이기를 반영한다.

휴식은 기존 저장소의 `kind: rest` 또는 `tag: 휴식`으로 식별한다. 집중 통계·랭킹·집중 퀘스트·집중 연속일에서 제외하며, 오두막 > 나의 기록 > 휴식에서 확인한다. 내 기록 JSON 내보내기에도 `restSessions`로 분리했다. 기존 v3 저장소와 원본 세션 이력을 보존했다.

## 이미지 제작과 구현

사용 모드: 내장 image generation tool. image-to-code 방식으로 원화를 먼저 생성하고, 승인된 기존 마을 톤과 캐릭터를 기준으로 UI·월드 배치·관절을 구현했다. API/CLI 우회나 이미지 배경 제거 스크립트는 사용하지 않았다.

| 선택 파일 | 용도 | 크기 / 배경 |
| --- | --- | --- |
| assets/village-map-ocean-v2.png | 기존 섬 원화의 바다 편집. 해안 물결, 얕은 수심, 바위 주변 포말과 깊은 바다 색 | 1536 × 1024, 원본과 같은 해상도 |
| assets/momo-rest-boat.png | 작은 나무배에서 쉬는 모모, 휴식 리깅 소스 | 1254 × 1254, 알파 |
| assets/momo-study-table-key.png | 4인 테이블에서 필기하는 모모, 공부 리깅 소스 | 1254 × 1254, 마젠타 키 |
| assets/study-table-empty-key.png | 활동 전 마을의 빈 공부 테이블 | 1254 × 1254, 마젠타 키 |

바다는 미술 디테일 개선이며 4K 업스케일은 아니다. 육지·건물·길 좌표는 그대로 사용한다. 확대·축소·미니맵은 같은 새 원화를 참조한다. 원화 밖은 저채도 물빛과 잔물결 SVG로 연장했다.

공부 이미지의 생성된 체크무늬 문제는 단색 마젠타 원화로 재생성해서 해결했다. 원본 파일을 보존하고, 브라우저 초기화 시 Canvas에서 키 색을 알파로 합성한 뒤 투명 텍스처를 리깅 엔진에 전달한다. 원본 마젠타 PNG 자체는 투명 PNG가 아니다. 앱 이전 시 이 텍스처 준비 단계 또는 별도 승인된 에셋 내보내기 과정이 필요하다.

기존 `momo-rig.js`의 WebGL 메시 엔진을 재사용한다. 테이블·배 자체는 고정 뼈대, 캐릭터 부위는 가중치 영역으로 분리한다. 새 공부·휴식 프로필에는 눈깜빡임/책장 넘김이 없다. 독서는 기존 독서 리깅을 유지한다.

## 주요 파일

- `village-activities.js`: 활동 정의, 키 배경 합성, 원화/관절 프로필, 선택 UI, 월드 소품.
- `village-activities.css`: 바다 연장, 활동별 무대, 모바일, 동작 줄임.
- `village.js`: 길 이동 → 착석/출항 → 활동 → 종료, 카메라, 복원과 전환 취소.
- `village-store.js`: 집중/휴식 집계 분리.
- `village-features.js`, `building-panels.js`: 휴식 기록·결과·내보내기, 활동 선택.

## 검증 명령

```sh
node verify-activities-store.cjs
node verify-store.cjs
node verify-activities.cjs
node verify-activity-edges.cjs
node verify-focus.cjs
node verify-features.cjs
node verify-panels.cjs
```

브라우저 검증은 격리 컨텍스트만 사용하며 실제 사용자 저장소는 수정하지 않는다. 활동 검증 캡처: `screenshots/activities/`.

## 최종 선택 이미지 프롬프트

원화 편집/생성은 아래 프롬프트를 사용했다. 공부의 두 최종 프롬프트는 먼저 생성한 테이블 구도를 참고 이미지로 사용해 키 배경으로 다시 생성한 것이다.

### ocean

```text
Use case: precise-object-edit. Edit target: the attached existing 1536x1024 isometric cozy island game map. Produce a high-resolution 3:2 landscape upgraded map, preferably 3072x2048. Change ONLY THE OCEAN WATER around the island. Preserve exact normalized position, silhouette, size, shape and appearance of EVERY land feature: all seven buildings, paths, trees, flowers, fire, shoreline rocks, pier and moored boat. No reframing, no new land, no new buildings, no characters, no text, no UI. Ocean art direction: quiet low-saturation muted lagoon teal, subtle layered depth with translucent pale aqua shallows following the real coastline, elegant fine pale cream foam tracing rocks, refined sparse curved ripples and delicate sun caustics just near shore; soft deeper blue teal further away. Make the water feel detailed and luminous but calm, premium hand-finished clean 2.5D vector-like cel shading, NOT watercolor, NOT photographic, NOT glitter, NOT dense repeating white wave dashes. Keep water near outermost image boundaries a consistent muted teal (#6fadb4 approximately), unobtrusive and easy to blend into more open sea. Preserve the island landscape precisely; only improve ocean finish and resolution.
```

### boat

```text
Use case: stylized-concept. Generate a high quality game PROP SPRITE on TRUE transparent alpha background. Image 1 is Momo identity reference (cream calico cat, dark brown left forehead patch, ochre orange right forehead patch, olive brown OPEN eyes, exact same face and fur colors); Image 2 is island game style/perspective reference. Scene: Momo relaxing in a SMALL wooden rowboat, completely visible in 3/4 elevated isometric perspective, bow pointing toward lower-right. One Momo only, sits comfortably inside the middle of the boat, upper body and open gentle eyes visible above gunwale, paws resting loosely near rim, tail tucked in. NO BOOK and no notebook. Quiet contented pose looking out at water, shoulders relaxed. Warm walnut wooden hull with fine coherent planks, cream seat cushion, two oars tucked along inside hull (not actively rowing), small coil of rope near bow. Cat upper middle, boat lower two thirds, enough silhouette separation for subtle breathing/head animation. Crisp premium 2.5D cel shaded vector-like illustration, muted warm natural colors matched exactly to existing cat and island, no watercolor texture. Complete isolated sprite with 10% transparent padding all sides, square high resolution 1536 or 2048. Absolutely NO water, no wake, no ocean, no background, no floor shadow, no labels, no text, no checkerboard. Real transparency. Preserve Momo's identity.
```

### studyClean

```text
Edit target: attached study table sprite. Change ONLY the background. The current image has a baked checkerboard pattern; remove EVERY checkerboard square and replace ALL background areas including gaps between the table legs and benches with absolutely uniform pure RGB #FF00FF magenta chroma key. No shadows on background, no gradient, no texture. Keep exact same pixel placement, scale, cat identity, notebook, pencil cup, table and leg geometry. Do not redraw subjects. High resolution square clean crisp image. The magenta will be keyed out by the game renderer. All holes/gaps MUST be pure magenta too. No checkerboard anywhere.
```

### emptyTable

```text
Edit target: attached study table sprite. Remove ONLY the cat and the cat's held pencil, reconstructing the now empty portion of tabletop/bench where needed. Keep exactly same tabletop, legs, benches, notebook and pencil cup, composition, size and positions. This is the EMPTY unoccupied version for a game state, precisely aligned to occupied version. Replace ALL checkerboard background with absolutely uniform pure RGB #FF00FF magenta chroma key, including gaps between legs and benches. No shadow on background, no gradient, no texture. No characters, no text. Every background and interior hole pure magenta. Keep the same square resolution and padding.
```
