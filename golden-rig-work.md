# 골든리트리버 독립 리그 작업 기록

- 대상: `doc/design-md/gachisup-v2` 로컬 프로토타입.
- 프로파일: `reading-profile-golden.js`, 1,254 × 1,254 원화 전체 좌표를 0..1000으로 정규화한 12관절.
- 열린 눈 원화: `assets/golden-retriever-rig-source.png` (기존 RGBA, 수정하지 않음).
- 감은 눈 원화: `assets/golden-retriever-reading-closed-v2.png` (builtin imagegen 1회, 1,254 × 1,254 RGB).
- 생성 원본: `생성 이력: 01a08114-ec7d-7e21-942d-dbfa70e1e41d/exec-54a4577b-8953-40a5-8392-fca62693bef9.png`.
- imagegen 스킬과 prompting 참고문서를 읽고 입력 원화·참고 강아지 닫힌 눈·생성 결과를 직접 확인했다. CLI나 자체 이미지 편집은 사용하지 않았다.
- 생성 PNG의 배경에는 RGB 체크무늬가 있다. 런타임은 원본 RGBA의 알파를 유지하면서 눈 주변 RGB만 가져오므로 체크무늬를 화면에 합성하지 않는다. 생성 결과 전체를 열린 눈 원화 대신 사용하지 않는다.

## 전체 생성 프롬프트

```text
Use case: precise-object-edit
Asset type: closed-eye texture for the existing golden retriever reading-character animation.
Input images: Image 1 is the sole edit target: a seated golden retriever holding a dark green book, originally 1254 by 1254 pixels, with transparent surroundings.
Primary request: Change ONLY the two open eyes to peacefully closed eyes. Replace each pupil, iris, eye white and open upper eyelash outline with the surrounding golden face fur and one natural dark-brown gently down-curving closed eyelid stroke. Both eyelids must be fully closed, quiet and relaxed, like a blink, with no pupils or eye whites visible. The left-image eye is centered about pixel (436, 415), the right-image eye about (651, 465).
Composition/framing: Precisely preserve the original square canvas dimensions, the exact character scale, placement, head angle and all feature coordinates.
Constraints: Keep the entire original golden retriever identity, golden fur colors and detailed tufts, ears, eyebrows, cream muzzle, nose, mouth, cheeks, body, front and hind paws, tail, dark green book and cream pages exactly unchanged. Change only the two small eye areas. Keep the original clean outline and genuinely transparent alpha background. No checkerboard pattern, no new background, no crop, no repositioning, no resize, no text, no new objects, no restyling.
Output intent: One complete original-sized PNG with only the closed eye replacement, used as an aligned local eye texture over the unchanged original RGBA character.
```

## 좌표와 동작

- 관절은 root → body → head → earL/earR → book → armL/pawL/armR/pawR → tail/tailTip의 부모 우선 순서다.
- 골든리트리버 원화 자체의 귀·주둥이·책·앞발·꼬리 실루엣을 측정했다. 다른 캐릭터의 좌표를 복사하지 않았다.
- 눈 중심: 왼쪽 [346,329], 오른쪽 [520,371]. 마스크는 기존 속눈썹까지 포함한다.
- 종이 힌지 [339,573], 오른쪽 [526,518], 왼쪽 [211,466], 상승 60, 두께 62. 클립은 표지의 V형 경계 아래만 가리고 위쪽 공간을 열었다.
- read/idle/nod 3개 모션. 긴 귀는 수동 ±2.5°, 고개 ±3°, 꼬리 ±2.8°로 제한한다.

## 검증

`node verify-golden-rig.cjs` 통과. 기존 로컬 Playwright Chromium을 사용했고 브라우저를 새로 설치하지 않았다.

- 12개 관절의 부모 우선 순서, 유한 좌표, 실제 메시 정점 변형, 수동 각도 클램프를 확인했다. 관절마다 가중치 0.05 이상을 받는 정점이 17~310개다.
- 각 모션의 0~12초를 0.125초 간격으로 검사했다. 삼각형 최소 면적비는 read 0.8256, idle 0.7982, nod 0.6314로 모두 양수다.
- 모든 관절의 수동 양쪽 최대 각도를 검사했다. 최소 면적비는 0.3818이다. 몸통 한도를 ±1.6°로 조정해 경계의 과한 압축을 줄였다.
- 정점 가중치 합의 최대 오차는 2.22e-16이다.
- 눈 깜빡임 4.96초 값은 1.0이다. 완전 감은 눈에서 원래 동공·흰자·속눈썹 잔상이 보이지 않는다.
- 10.0초와 10.65초 책장의 opacity는 1.0, 실제 SVG 래스터 면적은 3,840px와 2,408px다. 양쪽에서 책장이 표지 위로 보이는 것을 확인했다.
- 열린 원화는 완전 투명 픽셀 835,294개, 부분 알파 736,532개, 완전 불투명 690개다. 감은 원화는 전부 RGB 불투명이며, 눈 RGB만 합성하는 사용법을 유지한다.
- 1,254×1,254 PNG 스냅샷, 투명 모서리 alpha=0, 프로파일과 3개 모션을 포함한 JSON 내보내기를 확인했다.
- 브라우저 오류 0건. 밝은 배경·짙은 녹색 배경에서 체크무늬나 사각형 배경이 나타나지 않는다.
- `screenshots/golden-rig-read-open.png`, `golden-rig-blink-closing.png`, `golden-rig-blink-half.png`, `golden-rig-read-blink.png`, `golden-rig-page-right.png`, `golden-rig-page-left.png`, `golden-rig-idle-dark.png`, `golden-rig-nod.png`, `golden-rig-debug.png`를 만들었다. `golden-rig-transparent-snapshot.png`는 실제 내보내기 결과다.

중간 눈 깜빡임의 공통 셰이더는 병렬 담당자가 이중 눈선 문제를 추가 조정 중이다. 이 기록의 완전 감은 눈·골든 전용 좌표·책장·메시 검증은 통과했으며, 최종 공통 셰이더 검증은 루트 담당자가 4종 캐릭터에 대해 다시 수행한다. 공유 `momo-rig.js`·`rig-studio.js`·CSS·`rig.html`은 이 작업에서 수정하지 않았다.
