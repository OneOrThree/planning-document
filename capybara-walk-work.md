# 카피바라 산책 리깅 작업 기록

## 결과

- 앞 원화: `assets/capybara-walk-front-v1.png`
- 뒤 원화: `assets/capybara-walk-back-v1.png`
- 프로파일: `walk-profile-capybara.js`
- 검증: `node verify-capybara-walk.cjs`
- 시각 증거: `screenshots/capybara-walk-qa.png`, `capybara-walk-front-left.png`, `capybara-walk-back-right.png`, `capybara-walk-bones.png`

기존 독서 원화·프로파일은 수정하지 않았다. 공유 산책 런타임과 작업실 UI는 루트 에이전트가 연결한다.

## 이미지 생성

이전 작업에서 완전히 읽은 imagegen 스킬과 prompting 지침을 계속 적용했다. 이번 입력인 카피바라 독서 원화, 모모 앞·뒤 걷기 원화를 모두 view_image로 확인했다. built-in image_gen만 사용했고 직접 마스킹·배경 제거 후처리·CLI/API 우회는 하지 않았다. Pillow와 Canvas는 픽셀 읽기 검증에만 사용했다.

출력 디렉터리: `생성 이력: 01a08104-f857-7d01-b7e5-9cc4ae0be139/`.

| 시도 | 생성 파일 | 판정 |
| --- | --- | --- |
| 앞모습 1차 | `exec-eac2b74b-48b3-4a22-8e3b-266eb4ea18bb.png` | RGB 1190×1322, 체크무늬 배경. 미채택 |
| 앞모습 방식 전환 | `exec-59aafd83-7188-4965-9beb-f3524fab0998.png` | RGBA 1254×1254, 앞 원화로 복사 |
| 뒷모습 1차 | `exec-65957fe2-12a7-42f0-a567-f9e37d1719cf.png` | RGB 1254×1254, 체크무늬 배경. 미채택 |
| 뒷모습 방식 전환 | `exec-7ae898ad-1d87-427c-8769-4ed9580196ae.png` | RGBA 1254×1254, 뒤 원화로 복사 |

앞모습 재생성은 초기 허용된 추가 1회를 사용했다. 뒷모습 실패 뒤에는 자동 반복을 멈추고 보고했으며 루트가 방식 전환 1회를 추가 승인했다. 두 재생성 모두 이전 결과를 편집 대상으로 보존하기보다 외형 참고로만 사용해 새 투명 스프라이트를 만드는 방식이다.

두 채택 파일은 1:1 정사각형이며, 파일을 가공하지 않고 프로젝트 assets로 복사했다. 앞 원화 알파0=936,394, 알파255=1,069, 중간 알파=635,053. 뒤 원화 알파0=963,361, 알파255=1,163, 중간 알파=607,992. 실제 투명 픽셀과 생성 도구의 가장자리 알파를 그대로 보존했다. 단순히 체크무늬가 그려진 RGB 파일과 구분해 검사했다.

앞은 남서쪽을 보는 3/4 앞모습, 뒤는 북동쪽을 보는 3/4 뒷모습이다. 같은 작은 둥근 귀, 큰 둥근 머리, 금갈색 털, 갈색 앞발과 짧은 다리를 유지했다. 책·소품·꼬리가 없으며 양팔을 내려 양발 사이 공간을 확보했다. 뒷모습에 얼굴을 새로 그리지 않았다.

### 프롬프트: 앞 1차

```text
Create a new transparent PNG game character sprite: the capybara from Image 1 standing upright on two feet in a neutral walking-rig pose, full body, three-quarter FRONT view facing diagonally toward the lower left (southwest).
Image 1 is the character identity and color reference ONLY. Preserve its same cute broad capybara face, two open brown eyes, small round ears with pink inside, large brown muzzle, warm muted golden-brown fur, brown paws, rounded chubby body and short legs. Remove the book and all props. The capybara has NO visible tail.
Image 2 is ONLY a reference for standing stance and camera direction; do not use any cat traits, cat ears, patches or tail. Arms hang relaxed at its sides, separated from the torso enough for a 2D rig. Two short legs and both feet are distinct with a small gap; feet resting naturally on the same ground plane. Entire character visible with empty margins, centered, soles close to the lower edge but not cropped. Keep head and body proportions true to Image 1 and the same soft detailed illustration style, with subdued colors.
Genuinely transparent background with real PNG alpha. The background consists only of empty transparent pixels. No floor, no cast shadow, no checkerboard, no gray squares, no white or colored background, no text, no book, no accessories, no tail.
```

입력 1은 `capybara-reading-rig-v2.png` 외형 참고, 입력 2는 `momo-walk-front.png` 자세 참고였다.

### 프롬프트: 채택한 앞

```text
Create a new square PNG sprite of this standing capybara, on a genuinely transparent background with real PNG alpha.
The attached image is only a character identity and pose reference. Use the same cute capybara face, open brown eyes, small round ears, warm muted golden-brown fur, brown muzzle and paws, chubby body, short legs and lowered arms. Full-body upright biped neutral pose, three-quarter front facing lower-left. No book and no visible tail. Keep both feet clearly separated. Square canvas with comfortable empty margins and the full character visible.
The background must consist of empty transparent pixels. There is no backdrop. Do not copy the reference's checkerboard. Avoid a visible checkerboard, gray squares, white background, colored background, backdrop texture, floor, shadow, new objects, closed eyes, redesign. The output background must be empty transparent pixels, not a picture of transparency.
```

입력은 앞 1차의 생성 결과 한 장이며, 그 캐릭터와 자세만 참고했다.

### 프롬프트: 뒤 1차

```text
Create a new square transparent PNG game sprite showing the BACK view of the same standing capybara from Image 1, facing diagonally away toward the upper right (northeast).
Image 1 is the character identity, exact palette, body size and proportions reference. Keep its large rounded head, small round capybara ears, warm muted golden-brown fur, chubby body, short legs, brown paws and same detailed soft illustration style. Show the back of the head and back of the body, no eyes or muzzle visible. NO TAIL: capybaras have no visible tail. No book, no props. Both arms hang at the sides with a small gap from the torso, and both short legs and feet are separated. Keep the same standing height and comfortable margins as Image 1, with soles near the bottom of the square canvas.
Image 2 is only a BACK camera/stance reference; do not use its cat colors, patches, triangular ears, or tail.
Genuinely transparent background with real PNG alpha. The background must consist of empty transparent pixels. There is no backdrop. No visible checkerboard, gray squares, white background, colored background, floor, shadow, text or new objects. Output a 1:1 square canvas.
```

입력 1은 채택한 앞 원화, 입력 2는 `momo-walk-back.png` 자세 참고였다.

### 프롬프트: 채택한 뒤

```text
Create a new square PNG sprite of this standing capybara seen from behind, on a genuinely transparent background with real PNG alpha.
The attached image is only a character identity and pose reference. Use the same small round ears, warm muted golden-brown fur, brown paws, chubby body, short legs and lowered arms. Full-body upright biped neutral pose, three-quarter back facing upper-right, no face visible. No book and no visible tail. Keep both feet clearly separated. Keep the exact same standing body size, proportions and position as the reference within a square canvas, with comfortable empty margins and the full character visible.
The background must consist of empty transparent pixels. There is no backdrop. Do not copy the reference's checkerboard. Avoid a visible checkerboard, gray squares, white background, colored background, backdrop texture, floor, shadow, new objects, eyes, tail, redesign. The output background must be empty transparent pixels, not a picture of transparency.
```

입력은 뒤 1차의 생성 결과 한 장이며, 그 캐릭터와 자세만 참고했다.

## 관절 좌표

모든 좌표는 전체 원화 기준 원본 픽셀×1000/1254다. 독서 좌표나 모모 관절을 복사하지 않고 두 걷기 이미지를 각각 측정했다. root, pelvis, body, head, 양귀, 양팔·팔꿈치·앞발, 양다리·무릎·발목으로 총 18관절이다. 없는 꼬리 관절은 넣지 않았다.

| 기준점 | 앞 | 뒤 |
| --- | --- | --- |
| 발 사이 지면 anchor | (490,950) | (489,946) |
| 골반 | (481,811) | (487,812) |
| 몸통 | (485,657) | (495,641) |
| 머리와 목 경계 | (482,480) | (509,458) |
| 양 귀의 머리 부착점 | (352,126), (650,179) | (351,142), (652,154) |
| 양쪽 어깨 | (323,502), (612,526) | (351,490), (612,501) |
| 양쪽 팔꿈치 | (270,592), (690,611) | (287,575), (681,582) |
| 갈색 앞발 중심 | (241,673), (724,704) | (252,654), (721,676) |
| 양쪽 넓적다리 | (367,800), (598,817) | (380,799), (585,811) |
| 양쪽 무릎 | (368,858), (620,877) | (372,859), (590,867) |
| 발목 | (365,911), (612,937) | (372,908), (606,924) |

팔과 다리의 피부 가중치는 상위 부위부터 말단 부위 순으로 적용하고 경계에서 부드럽게 섞었다. 모모의 꼬리 영역이나 삼색 털 보정은 적용하지 않았다.

## 보행 조정과 검증

초기 제안값 stepLift18, thigh8, knee10, arm6에서는 좁은 다리 경계와 팔 바깥 경계의 일부 삼각형이 뒤집혔다. 카피바라의 짧은 다리와 두꺼운 팔에 맞춰 최종값을 bob2.2, stepLift14, stepReach6, thigh6, knee8, arm4, ear0.8, tail0으로 조정했다. 앞 왼쪽 넓적다리의 바깥 가중치 영역도 넓혀 발이 들릴 때 윤곽 경계가 접히지 않게 했다. 보행은 공통 런타임의 이동 거리 기반 stride74를 사용한다.

- 프로파일 및 검증 스크립트 syntax 검사 통과.
- 공통 WebGL 런타임에서 양 시점 로딩 성공, 브라우저 오류 없음.
- 두 시점 각각 2,401정점·4,608삼각형, 18관절 가중치 합 1, 유한 좌표 확인.
- 앞·뒤 각각 41개 걸음 위상을 검사했으며 삼각형 뒤집힘은 모두 0. 최소 부호 보정 면적은 앞16.96, 뒤84.39.
- 지지발의 수직 변화량은 정규화 좌표 앞1.83, 뒤2.38 이내다. 출력 원화 1254px로 약2.3px, 3.0px다.
- 정지, 앞 왼발·오른발, 뒤 왼발·오른발, 남동 반전, 북서 반전, 관절 표시 9상태를 캡처해 시각 확인했다.
- 책이나 꼬리 없이 양발과 양팔이 번갈아 움직이고, 방향 전환에서 앞뒤 시점과 좌우 반전이 적용된다.
- 앞뒤 중간 털색 표본의 HSV hue는 약0.080~0.083으로 일치한다. 독서 원화의 약0.077~0.079에 가까운 금갈색이며 걷기 원화는 조금 더 밝다. 앞뒤에는 `palette:'none'`을 명시해 기존 모모 필터가 섞이지 않게 했다.

이는 앞뒤 원화에 가중치를 적용하는 2D 메시 걷기 프리뷰다. 독립 부위 텍스처·3D·Spine/Rive 파일이 아니며 생성 원화의 미세 알파와 밝기 차이는 보존한다. 큰 각도로 관절을 뒤집는 동작은 목표에 포함하지 않았다.
