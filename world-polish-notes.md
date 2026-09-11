# 가구 배치 · 휴대폰 가시성 · 입출항 개선

2026-09-09 · 로컬 HTML 디자인 시연. 실제 앱·서버·결제 변경 없음.

## 확인 링크

- 마을: https://oneorthree.github.io/planning-document/ia.html?screen=plaza
- 가구 구매·배치: https://oneorthree.github.io/planning-document/index.html?ia=pr3&preview=1 — 오크 공부 테이블 선택
- 입항: https://oneorthree.github.io/planning-document/index.html?ia=on6&preview=1
- 출항: https://oneorthree.github.io/planning-document/index.html?activity=rest — 휴식 시작

## 바뀐 점과 설계 이유

### 책상은 배경과 같은 크기·재질·바닥 접점을 가진다

기존 210×210 월드 크기를 160×160으로 줄였다. 주황색 목재와 두꺼운 외곽선을 누그러뜨린 원화로 교체했다. 넓은 주변 그림자, 네 다리의 접촉 그림자, 발밑 앞을 가리는 작은 잔디를 별도 레이어로 두었다. 낮·밤 조명과 카메라는 원래 마을과 공유한다.

가구 배치 시안은 자유 드래그 대신 ‘숲길 옆 / 회관 아래’ 두 개의 검토된 자리에 맞추는 방식이다. 구매 전에는 미리보기만 바뀐다. 구매 후 확정하면 가구·그림자·앞 잔디·걷기 목적지·착석·집중 카메라가 함께 옮겨진다. 섬별로 저장하고, 그룹원 변경·미구매 배치·중복 차감을 막는다. 기존 공동 테이블을 활용하는 배치 흐름 시안이며, 구매하지 않아도 기본 자리에서 공부할 수 있다.

확장 시에는 모든 가구가 원화 기준 크기, 바닥 기준점, 바닥 그림자, 앞쪽 가림 레이어, 앉는 자리와 진입 경로를 가져야 한다. 현재는 두 자리만 검토했으며 임의 좌표 충돌 검사·가구 회전·여러 테이블 배치는 구현하지 않았다.

### 휴대폰은 가까운 마을, 패드는 전체 섬

600px 이하에서 기본 진입을 근경으로 바꿨다. 섬 이름과 친구 수를 간결하게 보여주고, 회관·게시판·오두막·더 보기와 집중 시작을 하단에 뒀다. 모든 주요 조작은 44px 이상이다. 화면 밖 장소는 메뉴나 ‘섬 전체’로 찾는다. 우체국·전망대·항구·낮/밤·확대/축소 조작은 더 보기에 있다. 마을만 보기·집중 중에는 메뉴를 숨긴다. 600px 초과 패드·데스크톱의 기존 전체 섬 구도와 메뉴 레이아웃은 유지했다.

### 배는 방향·이동·카메라를 따로 제어한다

입항은 부두 쪽을 보는 새 뒷모습 원화를 사용한다. 섬과 같은 좌표판 위에서 북서쪽으로 이동하며 크기를 조금 줄이고 감속한다. 6.8초 한 번 재생 후 정박하며, 시스템 동작 줄임에서는 즉시 정착한다. 기존 배를 평면으로 회전시키거나 반대 방향으로 미끄러뜨리지 않는다. 크기 피드백을 반영해 좌표판 너비의 18%에서 10%로 약 44% 축소하고, 뱃머리의 정박 위치를 유지하도록 도착 좌표도 조정했다. 휴식 배 크기는 변경하지 않았다.

휴식은 부두 끝까지 걸어간 뒤 650ms 승선, 6.8초 곡선 출항, 정박 순서다. 뱃머리 방향을 경로에 맞추고 카메라는 조금 늦게 따라간다. 이동 물결은 속도에 따라 나타나고 멈추면 사라진다. 배는 낮은 수면 접촉 그림자와 작은 흔들림만 남긴다. 중도 종료·움직임 줄임·복원을 유지했다. 종료 후 귀항 애니메이션은 여전히 없으며 기록 결과와 마을로 복귀한다.

## 검증

- 마을 개선 전용 검증: 34개 통과 (배치 모델·권한·실제 구매/배치/착석/복원·320/390/834px·입출항 동작·입항 배 비율).
- 기존 활동 101개, 활동 경계 13개, IA 모델 43개, 실제 기능 흐름 40개, IA 연결 36개 통과.
- IA 화면 35개 + 보조 시트 9개 × 320/390/768px = 132개. 화면 경로·JS 오류·가로 넘침 실패 0.
- 최종 공부/빈 테이블 텍스처: 모서리 알파 0, 잔여 불투명 마젠타 픽셀 0 확인.
- 캡처: `screenshots/activities/polish-*.png`. 자동 검증은 격리된 브라우저 저장소만 사용했다.

## 이미지 기록

`image-to-code`로 휴대폰 구도와 가구 원화를 먼저 생성·분석하고 HTML에 반영했다. 새 지도 지형을 만들지 않고 기존 섬 좌표를 유지했다. 내장 이미지 생성 도구를 사용했고 CLI/API 우회는 하지 않았다. 생성 원본은 그대로 보존했다.

| 파일 | 용도 |
| --- | --- |
| assets/momo-study-table-v2.png | 기존 관절 좌표를 유지한 저채도 공부 원화 · 알파 PNG |
| assets/study-table-empty-v2-key.png | 같은 테이블의 빈 상태 · 마젠타 키 PNG, 브라우저의 기존 합성 단계에서 알파화 |
| assets/momo-arrival-boat-v2.png | 부두를 향하는 입항용 뒷모습 · 알파 PNG |
| assets/ia-references/mobile-village-v2.png | 휴대폰 메뉴·화면 구도의 이미지 참조 |

빈 테이블 생성본 중 실제 알파가 아닌 체크무늬 출력은 채택하지 않았다. 앱 이식 시 빈 테이블은 실제 알파 텍스처로 내보내거나 같은 합성 단계를 옮겨야 한다. 아래 프롬프트 중 empty의 첫 출력은 채택하지 않고 emptyKey의 출력만 사용했다.

## 이미지 프롬프트

### study

```text
Use case: style-transfer. Image 1 is the EDIT TARGET: the seated calico cat at a four-place picnic study table. Image 2 is the STYLE REFERENCE: approved isometric island map. Revise the first image to blend into the second map when composited as a placeable game prop. Preserve EXACT normalized placement, camera angle, outer geometry, cat identity, open eyes, notebook, pencil and limbs of image 1 because an existing rig depends on those positions. Change ONLY material/color/render finish: table to muted weathered warm oak/taupe matching benches in image 2; reduce orange saturation, reduce thick dark contour contrast to thin soft brown edges, finer restrained grain and flat clean 2.5D cel-shaded light from upper left. Not watercolor, not realistic wood photograph. Cat's cream brown orange markings stay identical. Pure true transparent alpha background including every gap between legs. No ground, no grass, no checkerboard, no magenta, no drop shadow, no text. Square sprite.
```

### phone

```text
Use case: ui-mockup. Create ONE high-fidelity portrait mobile app home reference at 390x844 proportions for the existing Korean cozy isometric village app 같이숲. Image 1 is the exact approved map and art direction. Image 2 is the existing phone UI to improve. Keep all geography, buildings and art style of image 1, keep muted warm cream typography panels and moss green actions. Key change: phone default is a comfortably zoomed LOCAL village scene, not a tiny whole island. Center campfire and table and cat, show neighboring buildings partly at screen edges. Top left compact island name '느티나무 섬', below small '친구 5명'; right only one round profile control and one unobtrusive '마을만' toggle. Keep illustration dominant. Bottom cream navigation shelf with 4 generous 48px labelled destinations '회관' '게시판' '오두막' '더 보기' and a clear separated primary control '집중 시작'. One compact floating '섬 전체' overview button at left just above shelf, not a tall stack of zoom icons. Readable 13–15px labels and 44px targets. Cat and nearby props have correct relative world scale, no giant tabletop. Minimal chrome. No phone bezel, no collage, no extra landscape, no baked screenshots within cards. Standalone clean readable mobile app screen.
```

### arrival

```text
Use case: stylized-concept. New arrival-direction game sprite. Image 1 is the exact calico cat identity, wooden rowboat and rendering style reference. Image 2 is the island game's raised isometric perspective reference. Draw the SAME little wooden rowboat and SAME calico Momo from the reverse camera direction, with the BOW clearly pointing UPPER LEFT toward a dock outside the image, stern lower right. Elevated 3/4 isometric view, boat's long axis runs upper-left to lower-right. Cat sits facing toward the upper-left bow so mostly back of head and one small cheek visible, preserve exact cream, dark brown and orange markings and short ears, quiet arrival. Boat complete in frame, simple fine walnut planks, same cream cushion, oars tucked inside and rope, no active rowing. Muted wood like reference island, thin soft edges, clean 2.5D cel shading, no watercolor. One isolated sprite on TRUE transparent alpha background, including all surrounding area, no baked checkerboard, no floor, no shadow, no waves, no ocean, no scenery or UI. Square high resolution. Do not just rotate the flat original image: redraw from the rear perspective so the boat remains upright on the water.
```

### empty

```text
Use case: precise-object-edit. Edit the attached game sprite. Remove ONLY the seated calico cat, its tail and the pencil held in its paw, and reconstruct the small occluded tabletop/back bench. Keep the EXACT table silhouette, tabletop perspective and corners, legs and benches, full image framing and all normalized coordinates. Keep the open notebook and the pencil cup on the table EXACTLY as they are. Preserve muted weathered oak/taupe palette, soft thin outlines, clean cel-shaded finish, upper-left lighting. Output same square dimensions and same transparent padding, TRUE transparent alpha background including gaps between all legs, no checkerboard, no ground shadow, no scenery, no new objects. This empty sprite will crossfade with the occupied original at the exact same world position; do not resize, move or redesign the table.
```

### emptyKey

```text
Edit the attached empty table sprite. Preserve exact table, book, cup, all wood colors, corners, bench positions, and square framing. Replace ONLY every single background pixel, including all gray-white checkerboard squares and every hole between all legs, with absolutely uniform solid vivid RGB #FF00FF magenta. The background must be 100 percent opaque pure magenta, flat, no gradient, no texture, no checkerboard, no shadows. Do NOT attempt transparency. Keep the table unchanged. Clean production chroma-key sprite.
```
