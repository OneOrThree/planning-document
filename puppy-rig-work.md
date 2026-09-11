# 강아지 투명 원화와 전용 리그 작업

2026-09-08. 담당 범위는 강아지 새 PNG, `reading-profile-puppy.js`, 이 문서와 강아지 전용 검증이다. 공통 런타임과 스튜디오 파일은 수정하지 않았다.

## 이미지 생성

- 방식: imagegen 스킬과 prompting 지침을 읽고 builtin `image_gen` 편집을 배경 제거 1회, 승인된 추가 눈 감은 표정 1회 사용했다. CLI, 마스크 코드, 배경 제거 라이브러리, 이미지 후처리는 사용하지 않았다.
- 편집 대상: `assets/puppy-reading-concept.png` (RGB, 1254 × 1254). 원본 보존.
- 생성 출력: `생성 이력: 01a08104-7a50-7890-862f-896732d625b0/exec-d27de221-62f6-4b68-9208-7f7ca4aa99b6.png`.
- 프로젝트 복사본: `assets/puppy-reading-rig-v2.png`.

실제 사용한 프롬프트:

```text
Use case: background-extraction
Asset type: PNG cutout texture for a reading puppy animation.
Input images: Image 1 is the edit target.
Primary request: Remove the background from this puppy image. Return the same puppy and book as a cutout on a genuinely transparent background with real PNG alpha.
Constraints: Change only the background. Preserve the exact puppy silhouette, fluffy golden and cream fur, both open brown eyes, seated pose, paws, curled tail, green book with gold bookmark, original subdued warm colors, painted shading, dark brown outlines, composition and framing. Preserve the whole subject.
Avoid: a visible checkerboard, gray squares, white background, colored background, backdrop texture, floor, shadow, new objects, closed eyes, redesign. The output background must be empty transparent pixels, not a picture of transparency.
```

## 픽셀 검사와 외형

Pillow로 픽셀을 읽기만 하여 확인했다. 생성본을 `view_image`로 직접 확인했다.

| 항목 | 원본 | 새 생성본 |
| --- | --- | --- |
| 크기 | 1254 × 1254 | 1254 × 1254 |
| 모드 | RGB | RGBA |
| 알파 최소/최대 | 255 / 255 | 0 / 255 |
| 완전투명 픽셀 | 0 | 637,735 |
| 부분 알파 픽셀 | 0 | 933,005 |
| 불투명 픽셀 | 1,572,516 | 1,776 |

새 이미지 전경 알파의 최빈값은 253이며 807,281픽셀이다. 전경은 약 99% 불투명하고 배경은 실제 알파 0이다. 상하좌우 모서리의 검정은 투명 픽셀의 RGB값이며 검정 배경이 아니다. 체크무늬는 사라졌다. 밝은 `#efe8dc` 및 어두운 `#27352e` 배경의 브라우저 화면에서 외곽에 체크무늬나 검정 테두리가 나타나지 않음을 확인했다. 열린 갈색 눈, 복슬한 황금색·크림색 털, 녹색 책, 금색 책갈피, 앉은 자세, 발바닥, 말린 꼬리는 유지된다. 생성 과정에서 피사체가 원본보다 조금 커졌으므로 원본 좌표를 재사용하지 않았다.

눈 감은 표정 출력은 `생성 이력: 01a08104-7a50-7890-862f-896732d625b0/exec-d4eaf554-7346-4467-987f-802edd55f28b.png`이며 `assets/puppy-reading-closed-v2.png`에 복사했다. 1254 × 1254 RGB 이미지이고 체크무늬 배경이 있지만, 공통 셰이더는 눈 주위 RGB만 취하고 항상 열린 원화의 실제 알파를 사용한다. 머리·코·책 위치와 크기를 유지한 것을 시각적으로 확인했다.

실제 추가 프롬프트:

```text
Use case: precise-object-edit
Asset type: closed-eye expression texture for a 2D character rig; it will be crossfaded over the original eyes, so pixel alignment is essential.
Input images: Image 1 is the edit target, the transparent reading puppy.
Primary request: Change only BOTH OPEN EYES into peacefully CLOSED EYES: two natural gently curved dark-brown eyelid lines, drawn in exactly this illustration's hand-painted style. Carefully replace the open eyeballs, irises and whites with matching cream-colored face fur and delicate closed eyelids.
Constraints: Keep the exact image dimensions, framing, subject position, scale, head outline, cheeks, eyebrows, ears, nose, mouth, body, paws, curled tail, green book, gold bookmark, colors, lighting, outlines and transparent background unchanged. The closed eyelids must be centered where the original open eyes were. Do not redraw or reposition anything outside the two eye areas. Do not zoom, crop, shift, or rescale the image.
Avoid: visible open pupils, round skin-colored stickers, straight gray bars, added objects, changed book, changed pose, changed expression of mouth, closed eyes at a different position. Only edit the two eyes.
```

## 관절 좌표 근거

모든 프로파일 좌표는 새 PNG 전체를 기준으로 정규화했다: `정규화 좌표 = 원본 픽셀 / 1254 × 1000`.

| 지점 | 새 PNG의 실제 픽셀 부근 | 정규화 좌표 | 판단 근거 |
| --- | --- | --- | --- |
| 왼쪽 눈 | 401, 434 | 320, 346 | 검은 동공과 흰자의 중앙 |
| 오른쪽 눈 | 653, 513 | 521, 409 | 오른쪽 홍채와 눈 윤곽의 중앙 |
| 왼쪽 눈 위 피부 | 392, 368 | 313, 293 | RGBA 246, 226, 201, 253 → 눈꺼풀 `#f6e2c9` |
| 오른쪽 눈 위 피부 | 650, 444 | 518, 354 | RGBA 239, 198, 158, 253 → 눈꺼풀 `#efc69e` |
| 고개 회전축 | 598, 656 | 477, 523 | 턱 아래와 상체의 연결부 |
| 왼쪽 귀 회전축 | 395, 197 | 315, 157 | 머리 왼쪽 위에서 늘어진 귀가 붙는 부위 |
| 오른쪽 귀 회전축 | 815, 283 | 650, 226 | 이마 오른쪽 털과 긴 귀의 연결부 |
| 오른쪽 앞발 회전축 | 874, 764 | 697, 609 | 긴 귀 아래 어깨와 앞발의 연결부 |
| 오른쪽 손목 | 804, 839 | 641, 669 | 책을 잡은 발과 복슬한 팔 사이 |
| 책장 중심 | 399, 719 | 318, 573 | 펼친 종이가 모이는 책등 상단 |
| 꼬리 회전축 | 1012, 1073 | 807, 856 | 몸통 뒤에서 꼬리가 시작하는 부위 |

몸통·고개·양쪽 귀·책·양팔·양손목·꼬리·꼬리 끝의 12개 관절을 사용한다. 앞발을 책의 자식으로 두어 책을 조절할 때 잡고 있는 발도 함께 움직인다. 몸통과 고개의 넓은 영역 뒤에 귀, 책, 앞발, 꼬리의 가중치를 덮는다. 귀/책/꼬리 경계에는 13~29단위의 완만한 가중치를 두고, 팔/손목은 강도를 낮춰 피부가 찢어지듯 보이지 않게 한다. 자동 고개 끄덕임은 최대 1.85도, 늘어진 귀는 약 1도, 꼬리는 최대 2.1도로 제한했다.

눈 마스크 최종 중심은 `[316,340]`, `[521,407]`이고 반지름은 `[55,68]`, `[83,59]`이다. 동공 중심보다 마스크를 약간 위로 옮겨 기존 눈의 위쪽 속눈썹까지 포함했다. 눈 감은 원화에서 자연스럽게 휘어진 갈색 눈꺼풀을 합성하며, 단색 타원으로 가리는 중간 구현은 대체했다.

책장 가림 영역은 표지의 V자 상단 경계를 따라가고 그 위 허공은 열어 둔다. 최종 `lift:55`, `depth:44`로 종이가 책 위로 솟아올라 왼쪽으로 넘어갈 공간을 확보한다. 최초 lift 80 / 공통 depth 62는 종이 끝이 눈에 닿아 강아지의 작은 책에 맞게 줄였다. 얇은 정적 종이 영역만 허용하면 중간의 넘김 모양이 잘려 보이지 않으므로 사용자의 실제 피드백에 따라 수정했다. 녹색 표지와 금색 책갈피 아래쪽은 가림 경계로 보호한다.

## 검증 상태와 한계

`node --check reading-profile-puppy.js`와 `node verify-puppy-rig.cjs`를 실행했다. 공통 런타임을 실제 Chromium에 로드하여 다음을 확인했다.

- 12개 관절, 눈 깜박임과 책장 넘김 기능 활성화, JSON에 강아지 이미지와 프로파일 저장.
- 모든 메시 정점의 가중치 합 오차 0, 음수/비유한 가중치 0.
- `read`, `idle`, `nod` 각각 0~12초를 0.125초 간격으로 검사: 총 291프레임, 프레임당 3,200삼각형에서 뒤집힘 0. 최소 원래 대비 면적비 0.457569.
- 몸통, 고개, 양쪽 귀, 책, 양팔, 양손목, 꼬리, 꼬리 끝의 11개 가동 관절이 각 부위 샘플을 실제로 움직였다. 수동 한계각의 좌우 차이는 1.24~24.92 좌표 단위였다.
- 모든 수동 조절 관절의 ±한계각에서 뒤집힘 0. 오른쪽 귀 ±5도는 극단적 압축이 생겨 양쪽 귀를 ±3도로 줄였으며, 수정 후 수동 최소 면적비는 0.302908이다.
- 열린 눈 0초, 감은 눈 4.96초, 책장 10.2초, 쉬기 2초, 끄덕임 0.75초의 스크린샷을 직접 확인했다. 원화 기반 닫힌 눈으로 단색 스티커와 남는 속눈썹 문제를 해결했다.
- 독립 마운트 검증에서 브라우저 스크립트 오류 0.

검증 스크린샷: `screenshots/puppy-rig-read-open.png`, `puppy-rig-read-blink.png`, `puppy-rig-read-page.png`, `puppy-rig-idle-dark.png`, `puppy-rig-nod.png`.

사용자 피드백 이후 ROOT가 공통 런타임에 반영한 위→아래 눈 감김과 넓은 종이 곡면을 재검증했다. 4.84초에는 윗눈꺼풀이 내려오기 시작하고 4.88초에는 눈동자가 아래로 가려지며 4.96초에는 자연스러운 곡선 눈으로 완전히 감긴다. 자동 책장 9.95초(오른쪽에서 올라옴), 10.2초(가운데로 이동), 10.8초(왼쪽에 내려옴)를 각각 시각적으로 확인했다. 실제 `rig.html?character=puppy`에서 ‘책장 넘기기’를 클릭하고 진행률 0.294 지점에 멈춰 정상 표시와 표지 위 가림을 확인했다. 최신 런타임에서도 위 geometry 검증과 스크립트 오류 0을 다시 통과했다.

추가 증거: `screenshots/puppy-rig-blink-closing.png`, `puppy-rig-blink-half.png`, `puppy-rig-page-right.png`, `puppy-rig-page-left.png`, `puppy-rig-studio-manual-page.png`.

이 파일은 원화 위의 2D 가중치 메시 리그이며, 감춰진 신체 부분을 재구성한 여러 장의 레이어나 Spine/Rive 문서는 아니다. 큰 관절 회전은 외곽을 늘릴 수 있으므로 수동 각도 제한을 작게 설정했다.
