# 강아지 걷기 원화와 리그 기록

2026-09-08. 강아지 앞·뒤 전용 원화, `walk-profile-puppy.js`, 전용 검증만 작업했다. 공유 걷기 런타임과 UI는 ROOT가 담당했다.

## 결과와 생성 방식

- 최종 앞 원화: `assets/puppy-walk-front-v1.png`, 1254 × 1254 RGBA, 알파 0..255, 완전투명 767,878픽셀.
- 최종 뒤 원화: `assets/puppy-walk-back-v1.png`, 1254 × 1254 RGBA, 알파 0..255, 완전투명 845,892픽셀.
- 앞 3/4 남서, 뒤 3/4 북동 원화와 좌우 반전으로 네 방향을 표현한다.
- imagegen 스킬과 prompting 지침에 따라 builtin image_gen을 4회 사용했다. 각 시점의 첫 생성이 RGB 체크 배경이어서 허용된 추가 배경 추출 1회를 각각 사용했다.
- 원본 독서 이미지와 생성 원본은 모두 보존했다. CLI, 직접 마스크, 배경 제거 코드, 이미지 후처리는 사용하지 않았다. 알파 검사는 Pillow로 읽기만 했다.
- 강아지 독서 원화를 외형 참고로, 모모 걷기 앞·뒤 원화를 포즈와 카메라 참고로 사용했다. 뒷모습은 새 강아지 앞모습을 외형 참고로 사용했다.

생성 기본 경로는 `생성 이력: 01a08104-7a50-7890-862f-896732d625b0/`이다.

| 작업 | 출력 파일 | 결과 |
| --- | --- | --- |
| 앞 포즈 생성 | `exec-67070862-2769-4a51-b43c-799c6a9b90a8.png` | 외형 성공, RGB 체크 배경 |
| 앞 배경 추출 | `exec-75980101-2ac9-4c86-af42-7fca16ad34be.png` | 최종 앞 RGBA |
| 뒤 포즈 생성 | `exec-c207e7ea-f5ee-43fa-9e63-3c001b542aa3.png` | 외형 성공, RGB 체크 배경 |
| 뒤 배경 추출 | `exec-044e0531-bb90-4573-b4fa-7aa488ce3dbf.png` | 최종 뒤 RGBA |

## 실제 프롬프트

### 앞 포즈

```text
Use case: precise-object-edit
Asset type: transparent 2D walking-game character sprite, square PNG.
Input images: Image 1 is the PUPPY identity and art-style reference. Image 2 is a CAT used ONLY as the standing pose, camera angle and framing reference. Do not copy cat anatomy or cat markings.
Primary request: Make the exact golden-and-cream fluffy PUPPY from Image 1 stand upright on two hind legs, without the book, in the same front three-quarter view as Image 2, facing toward the lower left (southwest). Keep the puppy's big open brown eyes, cream forehead blaze and muzzle, floppy long golden ears, tiny brown nose, fluffy golden body, cream belly and paws, cream-tipped curled puppy tail, and soft subdued warm painted colors and brown outline.
Pose: relaxed neutral bipedal walking-rig stance. Both feet planted and visibly separated by a small clear gap. Two short arms hang separately beside the body with a small clear gap from the torso, ready to swing. Full head, both paws, both feet and entire tail visible. Head occupies about half the character height, matching the cute original puppy proportions. Same high three-quarter game camera as the pose reference.
Background: genuinely transparent PNG alpha, empty pixels. Preserve clean fur outlines. No floor, no shadow, no grid, no checkerboard, no gray squares, no white backdrop.
Framing: one character centered in a 1254 by 1254 square composition, full body, small empty margin, feet near 94% of image height. Do not add the book, clothing, accessories, text or other characters.
```

### 앞 배경 추출

```text
Use case: background-extraction
Input images: Image 1 is the edit target.
Primary request: Remove the background from this standing puppy image. Return the same puppy as a clean cutout on a genuinely transparent background with real PNG alpha.
Constraints: Change only the background. Preserve the exact puppy silhouette, body pose, both open brown eyes, golden and cream fur, ears, paws, feet, curled tail, painted colors, dark brown outlines, dimensions, scale, position and framing. Keep the gap between the feet transparent too.
Avoid: a visible checkerboard, gray squares, white background, colored background, backdrop texture, floor, shadow, new objects, redesign. The output background must be empty transparent pixels, not a picture of transparency.
```

### 뒤 포즈

```text
Use case: precise-object-edit
Asset type: transparent square walking-game sprite, back view.
Input images: Image 1 is the exact PUPPY identity, standing body proportions, colors and scale reference. Image 2 is a CAT used ONLY as back-view camera and pose reference; do not copy any cat anatomy, cat colors or cat markings.
Primary request: Show the same golden-and-cream fluffy puppy from Image 1 from BEHIND in three-quarter view, facing upper right (northeast), standing upright on two hind legs in a relaxed neutral walking-rig pose like Image 2. The back of the head is visible, not its eyes or face. Keep its long floppy golden puppy ears, golden back fur, cream stripe continuing over the crown/back of head, cream paws, cream-tipped curled puppy tail, round puppy proportions and painterly brown outlines. Same puppy, not a new dog.
Pose and framing: keep Image 1 body size, head-to-body ratio and camera elevation. Full body centered, feet near 94% of the square image. Both feet clearly separated by a small gap, two short arms separated from the torso, entire curled tail visible. No book or clothes. Single 1254 by 1254 sprite.
Background: a genuinely transparent PNG with actual alpha, empty background pixels. No checkerboard, gray squares, white background, colored backdrop, floor or shadow.
```

### 뒤 배경 추출

```text
Use case: background-extraction
Input images: Image 1 is the edit target.
Primary request: Remove the background from this back-view standing puppy image. Return the exact same puppy as a clean cutout on a genuinely transparent background with real PNG alpha.
Constraints: Change only the background. Preserve the exact back-view puppy silhouette, body pose, golden and cream fur, floppy ears, arms, paws, feet, curled tail, painted colors, dark brown outlines, dimensions, scale, position and framing. Keep the gap between the feet and all empty areas around arms and tail transparent too.
Avoid: a visible checkerboard, gray squares, white background, colored background, backdrop texture, floor, shadow, new objects, redesign. The output background must be empty transparent pixels, not a picture of transparency.
```

## 좌표와 동작

모든 좌표는 새 각 PNG 전체에 대해 `픽셀 / 1254 × 1000`으로 정규화했다. 긴 귀의 부착부, 턱 아래 목, 팔꿈치, 크림색 앞발, 허벅지와 발목, 말린 꼬리 부착부를 직접 확인했다.

| 기준 | 앞 | 뒤 |
| --- | --- | --- |
| 양발 사이 지면 anchor | 474, 955 | 510, 950 |
| 골반 | 471, 779 | 510, 798 |
| 목·고개 축 | 463, 510 | 518, 486 |
| 왼쪽 / 오른쪽 귀 | 318, 147 / 652, 211 | 349, 175 / 663, 183 |
| 왼쪽 / 오른쪽 발목 | 366, 895 / 574, 940 | 407, 906 / 612, 946 |
| 꼬리 부착부 | 675, 766 | 398, 736 |

20개 관절은 기준, 골반, 몸통, 머리, 양 귀, 양 팔·팔꿈치·앞발, 양 허벅지·무릎·발목, 꼬리·꼬리 끝이다. 앞과 뒤가 각기 다른 좌표와 영역을 사용한다. 모모 전용 색 필터는 적용하지 않았다.

최종 보행 값: `bob:2.5, stepLift:12, stepReach:5, thigh:4.5, knee:6, arm:4, tail:2, ear:0.8`. 처음 제안한 큰 다리 각도는 좁은 발 사이 메시를 뒤집었으므로 실제 검증 후 줄였다. 골반 가중치를 기본으로 두어 발 외곽에서 정지 배경 가중치로 급격하게 돌아가는 문제도 막았다.

## 검증과 한계

- `node --check walk-profile-puppy.js`, `node verify-puppy-walk.cjs` 통과.
- 각 시점에서 0~1 보행 주기를 60등분한 61개 프레임, 총 122프레임 × 4,608삼각형을 검사했다.
- 앞·뒤 모두 삼각형 뒤집힘 0, 모든 정점 유한값, 가중치 합 오차 1e-12 미만. 최소 부호 면적은 앞 33.52897 / 뒤 109.46427.
- 앞·뒤 정지, 왼발/오른발 들기, 남동·북서 반전, 관절 표시의 9개 상태를 브라우저에서 직접 확인했다. 새 PNG 배경 체크는 표시되지 않는다.
- 브라우저 스크립트 오류 0, 부모 관절이 자식보다 먼저 정의됨, 총 관절 수 20.
- 증거: `screenshots/puppy-walk-qa.png`, `puppy-walk-front-left.png`, `puppy-walk-back-right.png`, `puppy-walk-bones.png`.

단일 앞·뒤 텍스처를 변형하는 2D 메시 리그다. 감춰진 관절을 별도 레이어로 재구성한 3D 모델은 아니므로 보폭을 작게 유지한다. 생성 과정에서 앞·뒤 털 무늬와 머리 비율에 작은 시점 차이가 있으며, 실제 파일은 원화와 동일한 1254 정방 크기다.
