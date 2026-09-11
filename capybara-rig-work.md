# 카피바라 리깅 작업 기록

## 결과

- 열린 눈 투명 원화: `assets/capybara-reading-rig-v2.png`
- 감은 눈 합성용 원화: `assets/capybara-reading-closed-v2.png`
- 관절 프로파일: `reading-profile-capybara.js`
- 독립 브라우저 검증: `node verify-capybara-rig.cjs`
- 원래 `assets/capybara-reading-concept.png`는 보존했다. 공유 `momo-rig.js`, `rig-studio.js`, CSS, HTML은 담당 에이전트가 연결한다.

## 이미지 생성과 알파 검증

`imagegen/SKILL.md` 본문과 `references/prompting.md`를 읽고 built-in `image_gen`만 사용했다. 원화와 투명 참고는 `view_image`로 먼저 확인했다. 직접 마스킹, 이미지 후처리, CLI/API 우회는 하지 않았다. Pillow와 Canvas는 알파·색상 읽기 검증에만 사용했다.

생성 출력 디렉터리: `생성 이력: 01a08104-f857-7d01-b7e5-9cc4ae0be139/`.

| 시도 | 출력 파일 | 결과 |
| --- | --- | --- |
| 배경 제거 1차 | `exec-cb4d2fde-3b05-42a7-a08a-e8efba50a790.png` | 1254×1254 RGB, 알파 없음, 체크무늬 포함. 미채택 |
| 배경 제거 2차 | `exec-073dbdf3-4db3-4f22-baf5-fab71a24b832.png` | 1254×1254 RGB, 알파 없음, 체크무늬 포함. 미채택 |
| 외형 참고로 새 투명 스프라이트 생성 | `exec-6480ae62-ebc9-4c72-a6af-7f9dd8210c77.png` | 1254×1254 RGBA, 실제 투명 배경. `capybara-reading-rig-v2.png`로 그대로 복사 |
| 감은 눈 한 프레임 편집 | `exec-977b0552-87f8-4a68-979b-d844dd7972b3.png` | 1254×1254 RGB, 자연스럽게 감은 눈. 눈 영역 RGB 합성에만 사용 |

2회 실패 뒤 추가 생성을 멈추고 루트에 보고했다. 루트가 방식을 바꾼 새 투명 스프라이트 1회와, 이후 감은 눈 전용 원화 1회를 각각 승인했다.

채택한 열린 눈 파일의 전체 1,572,516픽셀 중 알파 0은 820,572개, 알파 255는 1,597개, 중간 알파는 750,347개다. 전경의 주 알파값은 253(635,900픽셀)이며 이는 도구가 생성한 채널을 그대로 보존한 것이다. 네 모서리는 모두 `(0,0,0,0)`이다. 바깥쪽 표본 `(0,500)`, `(50,50)`, `(100,500)`, `(950,500)`, `(500,975)`, `(900,900)`도 모두 완전 투명이다. 아주 낮은 알파의 미세 가장자리 픽셀이 있어 `alpha.getbbox()`는 `(0,33,1200,1234)`이며, 밝은 무대에서 체크무늬와 배경 사각형은 보이지 않는다.

감은 눈 파일은 투명 원화가 아니다. 런타임에서 열린 눈 파일의 알파를 유지하고 눈 주변의 RGB만 이 파일에서 가져와야 한다. 전체 이미지 교체나 썸네일 사용은 하지 않는다.

### 최종 열린 눈 프롬프트

```text
Create a new PNG sprite of a capybara reading a green book, on a genuinely transparent background with real PNG alpha.
The attached image is only a character identity reference. Use the same cute capybara face, both open brown eyes, small round ears, seated body proportions, warm muted golden-brown fur, brown muzzle and paws, and open forest-green hardcover book with gold bookmark. Use the same soft illustrated game character style. Full body centered with comfortable empty margins.
The background must consist of empty transparent pixels. There is no backdrop. Do not copy the reference's checkerboard. Avoid a visible checkerboard, gray squares, white background, colored background, backdrop texture, floor, shadow, new objects, closed eyes, redesign. The output background must be empty transparent pixels, not a picture of transparency.
```

참고 입력은 원래 `capybara-reading-concept.png` 한 장이다.

### 감은 눈 프롬프트

```text
Use case: precise-object-edit.
Image 1 is the edit target. Change only the capybara's two open eyes into naturally closed, peaceful eyes: two short soft curved dark-brown eyelid lines, with the surrounding golden fur continuing smoothly where the open eyes were. This is the closed-eyes frame of the same sprite animation.
Keep everything else unchanged: exact 1254x1254 canvas, character placement, head outline, face and muzzle, eyebrows, ears, paws, seated pose, book and bookmark, all colors and fur texture, transparency, silhouette and proportions. Do not move or resize the character or book. Keep both closed eyelids precisely centered at the original open eyes. No new objects, no text, no cheeks, no blush, no background. Preserve the genuinely transparent background.
```

편집 입력은 채택한 `capybara-reading-rig-v2.png` 한 장이다.

### 실패한 프롬프트

1차:

```text
Use case: background-extraction.
Image 1 is the edit target. Remove the background completely and output this same capybara holding its green book as a PNG cutout with actual transparent alpha pixels everywhere outside the character and book. The gray checkerboard in the input is an unwanted painted background: delete it. Do not paint any replacement background or checkerboard. Preserve the entire capybara, both open eyes, all paws and ears, the green book and gold bookmark, existing soft warm muted colors, original illustration style, full-body pose, proportions, framing, and fine fur edges. Change only the background. Output a genuinely transparent background, not a picture showing transparency squares.
```

2차는 원래 카피바라를 편집 입력으로, `golden-retriever-rig-source.png`를 투명 형식 참고로 함께 제공했다.

```text
Remove the background from Image 1. Transparent background.
Image 1 is the CAPYBARA edit target. Image 2 is ONLY a technical reference for a transparent PNG cutout; do not use its dog character.
Output only the unchanged capybara and its green book from Image 1 on a transparent background with real PNG alpha. Preserve the capybara's face, two open eyes, ears, paws, warm muted colors, pose and book exactly. Remove every gray and white checkerboard square. No checkerboard, no white backdrop, no black backdrop, no floor, no shadow, no text. Actual alpha=0 in all background pixels, like the transparency of Image 2. Keep the full capybara visible and centered.
```

## 좌표와 관절 근거

좌표는 전체 1254×1254 원화 기준 `원본 픽셀 × 1000 / 1254`로 정규화했다. 원본과 채택 이미지의 외형 배치가 거의 같으나, 채택 이미지를 다시 열어 귀·눈·책·앞발을 확인했다. 화면에서 보이는 좌우로 이름을 붙였다.

| 부위 | 정규화 기준점 | 기준 |
| --- | --- | --- |
| 기준 | `(514,885)` | 바닥에 닿은 발 사이의 하단 축 |
| 몸통 | `(553,822)` | 배와 뒷발 위쪽, 호흡 중심 |
| 고개 | `(483,518)` | 책 위로 드러난 턱·목 경계 |
| 왼쪽 귀 | `(380,151)` | 작은 귀가 머리에 붙는 밑부분 |
| 오른쪽 귀 | `(661,208)` | 더 낮게 보이는 귀의 안쪽 밑부분 |
| 책 | `(350,680)` | 세로 책등 중심 |
| 왼쪽 앞발 | `(192,553)` | 책 왼쪽을 잡는 앞발 위쪽 |
| 오른쪽 앞발 | `(665,610)` | 책 뒤 몸통에서 앞으로 이어지는 팔 중심 |

몸통→머리→양쪽 귀, 몸통→책→양쪽 앞발 계층이다. 없는 꼬리나 가려진 다리를 새 관절로 만들지 않았다. 뒷발 하단은 기준 관절의 잔여 가중치가 받으며 호흡을 위한 연결은 부드럽게 섞인다. 몸통·머리·귀·책·앞발 순으로 가중치를 적용해 책의 모양이 머리 움직임에 끌려가지 않게 했다. 각 앞발은 책의 움직임을 상속하면서 독립적인 미세 회전을 갖는다.

눈 중심은 `(303,297)`, `(554,357)`이다. 감은 눈 중심은 시각적으로 약 `(303,305)`, `(552,359)`여서 같은 눈 영역 안에 들어간다. 눈 반경은 검정 테두리까지 덮도록 `(29,47)`, `(58,50)`로 설정했다. 단색 눈꺼풀을 사용한 첫 QA에서 색이 평평한 타원처럼 보여 감은 눈 전용 원화로 전환했다.

책장 축은 `(334,570)`, 우측 끝 `(539,519)`, 좌측 끝 `(202,469)`이다. 해당 원화 픽셀은 각각 `(252,244,228)`, `(253,247,232)`, `(253,244,228)`의 종이색으로 읽혔다. 최초 `page.clip`은 펼친 종이 안쪽만 허용했으나, 책장이 잘 보이지 않는다는 사용자 피드백에 따라 위쪽 공간을 y=370까지 열고 `lift:72`로 높였다. 아래쪽 경계는 녹색 표지 윗선을 따라 유지해 표지와 노란 책갈피를 관통하지 않도록 한다.

## 검증과 한계

- `node --check reading-profile-capybara.js` 통과.
- 독립 Chromium/WebGL 렌더링에서 읽기 0초, 깜빡임 4.96초, 책장 10.2초, 쉬기 2초, 끄덕임 0.83초, 관절 표시, 눈 절반 감기 4.86초, 왼쪽 책장 10.7초의 8상태를 확인했다.
- 8관절의 부모 순서, 1,681정점의 유한 좌표, 가중치 합 1 확인.
- 머리·양쪽 귀·책·양쪽 앞발·몸통의 대표 픽셀 7곳 모두 의도한 관절이 지배 가중치다.
- 기준을 제외한 7관절 각각 수동 조작 시 메시가 실제로 변한다. 최대 각도에서 최대 정점 변위는 정규화 좌표 4.68~27.08이다.
- 세 모션의 0~12초를 0.5초 간격으로 검사해 모든 삼각형 방향이 유지됐다. 최소 부호 보정 면적은 349.35(기본 625)다.
- 깜빡임 값 1, 책장 opacity 1, 브라우저 오류 0 확인.
- 감은 눈 텍스처 합성을 공통 런타임에 반영한 뒤 다시 검증했다. 두 눈 모두 자연스러운 곡선으로 감기며 단색 타원 패치가 사라진 것을 확인했다.
- 공통 런타임의 위→아래 눈꺼풀 전환과 62px 종이 곡면, 책 행렬 변형을 적용한 뒤 최종 QA를 다시 통과했다. 눈은 위쪽부터 감기고 양쪽 페이지가 책등에서 들려 올라오는 것이 보인다. 녹색 표지와 책갈피를 관통하지 않는다.
- 최종 증거는 `screenshots/capybara-rig-qa.png`, `capybara-rig-blink.png`, `capybara-rig-half-blink.png`, `capybara-rig-page.png`, `capybara-rig-page-left.png`다.

이 결과는 원화 텍스처와 가중치 기반 WebGL 메시 프리뷰다. Spine/Rive 전용 파일이나 부위별 분리 텍스처가 아니며, 생성 도구가 만든 매우 낮은 알파 가장자리와 전경 253 알파를 보존했다. 원화의 감춰진 관절을 추정해 크게 꺾는 동작은 범위에 포함하지 않았다.
