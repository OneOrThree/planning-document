# 레서판다 리그 작업 기록

2026-09-08. 담당 범위는 레서판다 전용 이미지·프로파일이다. 공통 렌더러와 스튜디오 파일은 루트 담당자가 연결한다.

## 입력과 보존

- 원본: `assets/red-panda-reading-concept.png`, 1254 × 1254, RGB. 회색 체크무늬가 이미지에 실제로 포함되어 있다.
- 원본의 열린 눈, 녹색 책, 노란 책갈피, 크림색·주황색·갈색 털, 둥글게 말린 줄무늬 꼬리를 보존한다.
- 기존 파일은 덮어쓰지 않는다. 생성은 builtin `image_gen`만 사용하고 이미지 후처리·마스크 코드·CLI 생성은 사용하지 않는다.
- 적용 스킬: `imagegen/SKILL.md` 및 `references/prompting.md` 전체를 읽고 배경 추출 절차를 적용했다.

## 생성 1차

프롬프트:

```text
Use case: background-extraction
Image 1 is the edit target. Remove only the background from this red panda reading a green book. Return the same illustration as a cutout PNG on a genuinely transparent alpha background. The gray-and-white checkerboard in the source is actual unwanted picture content: erase every checkerboard square into transparent pixels, do not draw or reproduce any checkerboard. Keep the entire red panda, both open eyes, face, fur, warm low-saturation orange/cream/brown palette, green book, yellow bookmark, paws and striped tail unchanged. Preserve the original centered composition, scale, contours, linework and texture. No white or gray backdrop, no new shadow, no added object, no restyling. Actual background transparency is essential.
```

출력: `생성 이력: 01a08105-7c05-72a0-a652-3cb4f171c70d/exec-34345b2e-adad-4b0f-86fd-e3ce58b0f679.png`.

Pillow 읽기 전용 검사: 1254 × 1254, RGB, 알파 채널 없음, 왼쪽 위 픽셀 `(240, 240, 242)`. 시각적으로도 체크무늬가 남았다. 실패 결과이므로 프로젝트의 최종 에셋으로 복사하지 않았다.

## 생성 2차: 최종 투명 원화

강아지 작업에서 성공한 짧은 배경 추출 요청 방식으로 한 번만 다시 생성했다.

```text
Use case: background-extraction
Remove the background from this red panda image. Return the same red panda and book as a cutout on a genuinely transparent background with real PNG alpha. Change only the background. Keep the original red panda face, open eyes, large cream-rimmed ears, low-saturation orange-and-brown fur, green book with gold bookmark, dark paws and thick striped curled tail unchanged.
Avoid: a visible checkerboard, gray squares, white background, colored background, backdrop texture, floor, shadow, new objects, closed eyes, redesign. The output background must be empty transparent pixels, not a picture of transparency.
```

입력은 원본 한 개. 출력: `생성 이력: 01a08105-7c05-72a0-a652-3cb4f171c70d/exec-b903fc09-26d6-4f7a-87b5-88c057bb32dd.png`.

프로젝트 최종 저장 위치: `assets/red-panda-reading-rig-v2.png`. 원본과 생성 저장소 파일을 보존하며 복사했다.

읽기 전용 픽셀 검사: RGBA, 1254 × 1254, alpha 범위 0..255. 완전 투명 654,615픽셀, 완전 불투명 1,800픽셀, 중간 알파 916,101픽셀이다. 전경의 대부분은 alpha 253(812,326픽셀)이며 네 모서리는 모두 `(0, 0, 0, 0)`이다. 투명 배경을 실제로 갖추었고 체크무늬가 사라진 것을 시각적으로 확인했다. 원화와 열린 눈·책·털·꼬리 외형은 유지되었으나 배치가 약간 확대·이동되어 아래 좌표는 최종 이미지에 맞춰 다시 잡았다. 추가 배경 생성은 하지 않았다.

## 닫힌 눈 전용 원화

루트 담당자의 추가 1회 승인에 따라 builtin 편집으로 닫힌 눈 원화를 생성했다. 별도 이미지 후처리를 하지 않았다.

```text
Use case: precise-object-edit
Image 1 is the edit target. Change only the red panda's two open eyes into gently closed eyes for one natural blink animation frame. Replace each open eye and its iris with surrounding orange-brown fur and one short curved dark eyelid line, matching the existing hand-painted illustration and relaxed expression. Keep every other pixel location and feature unchanged: canvas size, transparent background, character framing and exact scale, head silhouette, ears, nose, mouth, cheeks, fur texture and palette, green book, gold bookmark, paws, feet and striped tail. Do not tilt, move, crop, resize or redraw the character. Closed eyes must stay at the exact same eye centers as the open eyes. Preserve genuine transparent background; no checkerboard, white backdrop, text or added objects.
```

입력: `assets/red-panda-reading-rig-v2.png`. 생성 출력: `생성 이력: 01a08105-7c05-72a0-a652-3cb4f171c70d/exec-c9fd91be-a104-4d6e-836b-7ef0cdb3ec9a.png`.

프로젝트 저장 위치: `assets/red-panda-reading-closed-v2.png`, RGB 1254 × 1254. 이 파일은 체크무늬 배경이 남아 있지만 승인한 방식대로 **눈 영역의 RGB만 합성**하고 항상 열린 눈 원화의 알파를 사용한다. 닫힌 눈 파일 자체를 투명 에셋으로 제공하면 안 된다. 닫힌 눈 위치와 주변 코·입·털 경계가 열린 눈 원화와 일치하는 것을 확인했다.

## 최종 좌표와 가중치 근거

모든 좌표는 `pixel / 1254 * 1000`으로 정규화했다. 왼쪽·오른쪽은 화면 기준이다.

| 부위 | 정규화 기준점 | 원화 근거 |
| --- | --- | --- |
| 고개 | `[442, 544]` | 책 바로 위 목과 턱의 접합점 |
| 왼쪽 귀 | `[293, 198]` | 큰 왼쪽 귀와 머리 털의 만나는 부분 |
| 오른쪽 귀 | `[647, 271]` | 기울어진 오른쪽 귀의 안쪽 밑동 |
| 책 | `[302, 692]` | 책등의 중앙, 책갈피 뒤 |
| 왼쪽 앞발·손목 | `[163, 578]`, `[155, 631]` | 책 왼쪽 모서리를 잡은 갈색 앞발 |
| 오른쪽 앞발·손목 | `[657, 614]`, `[570, 678]` | 오른쪽 어깨 및 표지를 잡은 손목 |
| 꼬리·끝 | `[781, 731]`, `[846, 833]` | 몸통 오른쪽 꼬리 뿌리 및 아래로 말린 끝의 분기점 |
| 왼쪽 눈 | 중심 `[282, 389]`, 반경 `[54, 68]` | 최종 원화 약 `(354, 488)`의 열린 눈, -17도 회전 |
| 오른쪽 눈 | 중심 `[490, 442]`, 반경 `[72, 54]` | 최종 원화 약 `(614, 554)`의 열린 눈, 12도 회전 |
| 책장 | 책등 `[292, 597]`, 우측 `[507, 537]`, 좌측 `[157, 479]` | 최종 원화에서 실제 종이가 펼쳐진 위쪽 V 영역 |

영역 순서는 몸통 → 머리 → 귀 → 책 → 앞발 → 손목 → 꼬리 → 꼬리 끝이다. 책이 턱 하단과 겹치는 픽셀은 책의 가중치가 우선한다. 앞발은 책의 자식으로 두어 책을 들고 있는 자세가 유지된다. 꼬리는 기준 관절의 자식이므로 머리 움직임을 직접 상속하지 않는다. 꼬리 시작점 부근에는 16 단위, 꼬리 끝은 43 단위의 부드러운 가중치 경계를 사용한다.

눈 합성은 초기 작은 반경에서 왼쪽 윗눈꺼풀 잔상이 보여 두 눈의 반경을 확장했다. `read` 4.96초의 완전한 닫힌 눈 프레임에서 잔상이 사라진 것을 확인했다. 책장 클립은 표지의 상단 V 경계 아래를 가리고 위쪽 허공을 허용해 종이가 들릴 공간을 확보한다. 곡선 이동의 높이는 `lift: 36`이다.

## 검증

- `node --check reading-profile-red-panda.js` 통과.
- 12개 관절의 부모 우선 순서, 11개 영역, 모든 정규화 좌표, 진폭 제한, read/idle/nod 모션 계약 검사 통과.
- `browse` 스킬을 읽고 브라우저 탭 2에서 확인했으나 해당 daemon은 WebGL을 지원하지 않아 원화 fallback을 표시했다. 기존 프로젝트의 설치된 Playwright를 사용하라는 루트 안내를 받아 같은 로컬 페이지에서 검사했다. 새 브라우저 패키지 설치 없음.
- `node red-panda-rig-qa.cjs` 통과. read 0초/4.96초/10.2초, idle 3초, nod 0.75초, 관절 디버그의 총 6개 mount 모두 `loaded: true`, JavaScript 오류 0건, 모든 버텍스 좌표 유한.
- 모든 메시 정점 가중치 합의 최대 오차 `2.220446049250313e-16`.
- 개별 관절의 실제 메시 변위 확인: 고개 7.81, 왼쪽 귀 6.60, 오른쪽 귀 7.09, 책 5.56, 왼쪽 앞발 2.69, 오른쪽 앞발 3.19, 꼬리 6.27, 꼬리 끝 6.16(정규화 단위).
- 시각 증거: `red-panda-rig-qa-states.png`. 해당 프레임에서 열린 눈/닫힌 눈, 들고 있는 책, 귀와 꼬리 연결이 유지됨을 확인했다.
- 공통 렌더러의 최종 수정 뒤 같은 검사를 다시 통과했다. `red-panda-rig-qa-transitions.png`의 4.83/4.86/4.91/4.96초 프레임에서 위 눈꺼풀이 아래로 내려오며 감기는 방향을 확인했다. 10.05/10.2/10.5초 프레임에서 책장이 선이 아닌 종이 면으로 들리며 녹색 표지 아래를 관통하지 않는 것을 확인했다.

## 완료와 한계

레서판다 전용 에셋·프로파일 및 공통 렌더러 연결 후 독립 QA를 완료했다. `rig.html` 캐릭터 선택 화면의 최종 통합 검사는 루트 담당자가 수행한다. 알파 253인 전경은 아주 약하게 반투명하지만 실제 녹색 배경 위에서 원화가 선명하게 보인다. 분리된 여러 레이어나 벡터가 아닌 단일 원화 텍스처의 가중치 기반 메시이므로 매우 큰 관절 각도는 지원하지 않으며 2..4도 범위로 제한했다. 최종 상태는 DONE이다.
