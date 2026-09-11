# 레서판다 산책 리그 작업 기록

2026-09-08. 상태: DONE.

## 완료 파일

- `assets/red-panda-walk-front-v1.png`: 실제 투명한 앞 3/4 원화, 기본 방향 SW.
- `assets/red-panda-walk-back-v1.png`: 실제 투명한 뒤 3/4 원화, 기본 방향 NE.
- `walk-profile-red-panda.js`: 앞·뒤 좌표를 따로 측정한 20관절 메시 프로파일.
- `red-panda-walk-qa.html`, `red-panda-walk-qa.cjs`, `red-panda-walk-qa-states.png`: 독립 검증 페이지·스크립트·화면.
- 공유 런타임과 화면 파일, 독서 프로파일은 수정하지 않았다. `walk.html` 통합 연결은 루트 담당자가 수행했다.

## 생성 방식과 보존

`imagegen/SKILL.md` 및 `references/prompting.md`를 적용하고 builtin `image_gen`만 사용했다. 독서 레서판다 원화는 외형·색 기준, 모모 산책 앞/뒤 원화는 자세·시점 참고로만 사용했다. 입력은 모두 `view_image`로 확인했다. 책 없이 양팔을 내리고 양발을 분리한 중립 이족 자세, 짙은 팔다리, 크림색 귀·눈썹·뺨, 주황색과 갈색의 고리 꼬리를 유지했다.

기본 생성 2회에서 앞/뒤 모두 RGB 체크무늬 출력이 나왔다. 각 결과를 단일 입력으로 배경 추출하는 방식으로 전환해 앞/뒤 모두 실제 알파를 확보했다. 뒷면 추출 1회는 루트 담당자의 추가 승인 뒤 진행했다. 총 4회 호출이며 추가 생성은 하지 않았다. 이미지 마스크·후처리 코드·CLI 생성은 사용하지 않았다. 최종 이미지는 생성 저장소에서 그대로 복사했고 기존 원본은 모두 보존했다.

## 1. 앞면 생성

프롬프트:

```text
Use case: stylized-concept
Create one NEW game character sprite, a square 1:1 PNG with a genuinely transparent background and real alpha. Image 1 is ONLY the red panda character identity and palette reference. Image 2 is ONLY a standing pose and 3/4 camera reference, do not copy the cat's species, markings or colors.
Show exactly the red panda from Image 1 now standing upright on two separated feet, no book. Front three-quarter view facing southwest / screen-left like Image 2. Neutral walking-rig pose, arms relaxed downward with a small clear gap from the torso, two distinct planted feet. Maintain the same large rounded head, open dark-brown eyes, cream eyebrows and cheek patches, cream-rimmed triangular ears, warm muted rust-orange fur, dark chocolate forearms/paws and legs, a dark belly with a small cream throat tuft, and the thick curled orange-and-dark-brown ringed tail visible to screen-right. Same hand-painted soft fur texture and warm brown outlines. Do not copy the cat's cream belly or calico markings.
Full character centered within one square canvas, head top around 5%, both soles around 93%, some transparent padding on every edge. Chubby short body, same scale and proportions for an upcoming matching back view. Flat neutral lighting, palette matched to Image 1 without brighter saturation.
Actual transparent pixels outside the silhouette. No checkerboard, no background color, no floor, no shadow, no book or other props, no text, no border, no extra character, no cropped tail or ears.
```

출력: `생성 이력: 01a08105-7c05-72a0-a652-3cb4f171c70d/exec-6cc0cae8-959a-41b7-ba00-a0088ae07566.png`.

픽셀 검사: RGB 1254×1254, 알파 없음. 외형은 적합했지만 체크무늬가 남아 최종 에셋으로 사용하지 않았다.

## 2. 앞면 투명화

프롬프트:

```text
Use case: background-extraction
Remove the background from this standing red panda image. Return the same red panda as a cutout on a genuinely transparent background with real PNG alpha. Change only the background. Keep its exact square framing, open eyes, face, cream ear rims and eyebrows, muted orange-and-dark-brown fur, lowered arms, two separated standing feet and curled ringed tail unchanged.
Avoid: a visible checkerboard, gray squares, white background, colored background, backdrop texture, floor, shadow, new objects, books, closed eyes, redesign. The output background must be empty transparent pixels, not a picture of transparency.
```

출력: `생성 이력: 01a08105-7c05-72a0-a652-3cb4f171c70d/exec-c25cec54-4b0f-4356-acf4-6ab3535e04ab.png`.

픽셀 검사: RGBA 1254×1254, alpha 0..255. 완전 투명 744,889픽셀, alpha253 738,414픽셀. 네 모서리 모두 (0,0,0,0).

## 3. 뒷면 생성

프롬프트:

```text
Use case: precise-object-edit
Image 1 is the red panda character to turn around. Image 2 is ONLY the rear three-quarter pose/camera reference, NOT a color or species reference.
Return the SAME red panda from Image 1 as its matching back-view walking sprite on a genuinely transparent background with real PNG alpha. Turn the red panda away from the viewer toward northeast / upper screen-right, like Image 2. Show the back of its large round rust-orange head and both cream-edged triangular ears; no eyes or face visible. Keep its short chubby standing body, rust-orange shoulders and back, small cream nape tuft only, dark chocolate-brown lower forearms/paws and legs, and thick orange-and-dark-brown ringed tail curving to screen-left. Do not copy the cat's calico patches or white stripe. Arms hang downward a little apart from the body and both feet are distinctly separated and planted.
Match Image 1's exact square 1:1 canvas, full-body character scale, head size, upper ear height about 3%, foot sole height about 96%, fur texture, warm outlines, muted palette and neutral illumination. Preserve real transparency from Image 1. Empty transparent pixels outside the silhouette, not a drawing of transparency.
No checkerboard, gray squares, white background, colored background, floor, shadow, book, accessories, text, extra character, cropped ears or tail.
```

출력: `생성 이력: 01a08105-7c05-72a0-a652-3cb4f171c70d/exec-c45b38a0-2853-49b6-8521-adc0704f5790.png`.

픽셀 검사: RGB 1254×1254, 알파 없음. 뒤쪽 형태·크기를 유지했으나 체크무늬가 남았다.

## 4. 뒷면 투명화

프롬프트:

```text
Use case: background-extraction
Remove the background from this back-view standing red panda image. Return the same red panda as a cutout on a genuinely transparent background with real PNG alpha. Change only the background. Keep its exact square framing, back-facing pose, head silhouette, cream ear rims, orange-and-dark-brown fur, lowered arms, two separated standing feet and curled ringed tail unchanged.
Avoid: a visible checkerboard, gray squares, white background, colored background, backdrop texture, floor, shadow, new objects, books, face or eyes, redesign. The output background must be empty transparent pixels, not a picture of transparency.
```

출력: `생성 이력: 01a08105-7c05-72a0-a652-3cb4f171c70d/exec-7520ba40-668c-459c-8305-fe1ef1cb8089.png`.

픽셀 검사: RGBA 1254×1254, alpha 0..255. 완전 투명 804,319픽셀, alpha253 662,122픽셀. 네 모서리 모두 (0,0,0,0).

## 정밀 좌표 기준

두 원화 모두 1254 × 1254 정방형이다. 모든 좌표는 `pixel / 1254 * 1000`으로 정규화했다. 앞과 뒤의 발밑 위치 차이를 별도 `anchor`로 맞췄다. 좌·우 관절은 각 이미지의 화면 기준이다.

| 위치 | 앞면 | 뒷면 |
| --- | --- | --- |
| 발 사이 지면 기준 | [438,958] | [540,952] |
| 골반 | [432,804] | [573,807] |
| 몸통 | [423,665] | [551,650] |
| 목·머리 연결 | [429,526] | [565,513] |
| 왼쪽/오른쪽 귀 | [286,189] / [622,215] | [408,193] / [738,226] |
| 왼쪽 발목 | [313,909] | [433,916] |
| 오른쪽 발목 | [565,936] | [646,925] |
| 꼬리 뿌리 | [686,799] | [477,746] |
| 꼬리 끝 | [843,634] | [208,639] |

기준 → 골반 → 몸통 → 머리·귀, 몸통 → 팔·팔꿈치·앞발, 골반 → 다리·무릎·발목, 골반 → 고리 꼬리·끝의 순서로 20관절을 구성했다. 각 시점 19개 변형 영역은 골반 → 몸통 → 머리·귀 → 팔·앞발 → 다리·발목 → 꼬리 순서로 덮는다. 단일 원화에 보이는 꼬리와 손발 경계를 따라 가중치 영역을 정했다.

초기 8도 허벅지/10도 무릎/18 단위 발들기에서 앞면 다리 경계의 메시 뒤집힘을 발견했다. 다리의 경계 혼합 폭을 허벅지68/무릎65/발목50으로 늘리고 보행 진폭을 아래처럼 조정했다. 최종 검증에서 앞·뒤 모든 삼각형의 방향이 유지된다.

```js
gait: { bob: 2.5, stepLift: 14, stepReach: 7, thigh: 4, knee: 5, arm: 4, tail: 2, ear: .8 }
```

## 색 검증과 표시 보정

PNG 픽셀은 그대로 보존했다. 원화의 주황색 머리 영역, 짙은 앞팔, 크림색 얼굴/목털을 읽기 전용으로 표본 측정했다. 주황색 RGB 중앙값은 독서 [229,117,54], 앞면 [232,103,46], 뒷면 [241,93,33]이었다. 모모의 기존 필터를 재사용하지 않고 레서판다의 앞/뒤에 독립적인 CSS 표시 보정을 정했다.

- 앞면: `saturate(.913) hue-rotate(2.91deg) brightness(1.053) contrast(.967)`.
- 뒷면: `saturate(.815) hue-rotate(3.54deg) brightness(1.091) contrast(.938)`.
- 보정 모델의 주황색 중앙값은 앞면 약 [227,113,53], 뒷면 약 [227,110,52]로 독서 원화에 가까워졌다.
- 최종 브라우저 화면에서 앞/뒤 주황색·갈색·크림색이 비슷하게 보이는 것을 확인했다. 흰 눈썹·뺨과 고리 꼬리의 구분이 유지된다.
- 원본 전경의 대부분은 알파253이며 빈 배경은 실제 알파0이다.

## 실행 검증

실행: `node --check walk-profile-red-panda.js`, `node red-panda-walk-qa.cjs`.

이미 설치된 프로젝트 Playwright를 사용했다. 새로운 패키지 설치는 하지 않았다. 앞서 확인한 browse daemon은 WebGL을 제공하지 않아 여기서는 루트가 지정한 기존 Playwright Chromium으로 실제 그래픽 프레임을 검증했다.

- 4방향 SW/SE/NE/NW의 앞·뒤 선택과 좌우 반전 정상.
- 8개 독립 mount가 모두 WebGL ready, JavaScript 오류 0건.
- 앞·뒤 각 65개 위상, 총 130개 보행 상태를 검사. 메시 뒤집힘 0건.
- 삼각형 면적의 원래 면적 대비 최소 비율: 앞면 0.10470, 뒷면 0.37195.
- 모든 정점 좌표가 유한하며 가중치 합의 최대 오차 `2.220446049250313e-16`.
- 양발 lift가 번갈아 14/0, 0/14가 되는 것을 확인.
- 접지 중 발 기준점의 수직 이동 범위: 앞 L1.434/R0.167, 뒤 L3.151/R1.395 정규화 단위. 260px 미리보기에서 최대 약 0.82px이다.
- 이동거리 18.5에서 주기0.25, 총74에서 정확히 한 주기를 마친다.
- JSON 직렬화/역직렬화 뒤 20관절과 양쪽 메시를 유지한다.
- 최종 시각 증거 `red-panda-walk-qa-states.png`에서 앞/뒤 몸 크기, 발 기준 정렬, 양팔·양발·꼬리의 움직임, 책 없는 원화, 실제 투명 배경을 확인했다.

앞/뒤 원화 두 장과 수평 반전으로 표현하는 2D 메시 리그이며 분리된 레이어나 3D 모델은 아니다. 캐릭터의 고유 외형을 유지하기 위해 작은 관절 각도를 사용한다.
