# 개별 승선 자세 생성 기록

세션 내장 이미지 생성으로 한 장씩 만들고 기존에 정상 동작하던 sprite-gen cutout으로 실제 알파를 분리했다. 다섯 자세 모두 단색 마젠타 검사판을 열어 확인했다. 전체 애니메이션 통과와는 별개다.

공통 원점 `670.218, 1142`, 같은 원화 축척을 사용한다. 움츠림과 공중 자세의 여백을 각각 발끝에 다시 맞추지 않아, 그려진 몸의 높이 변화가 유지된다. 기본 원화는 `neutral-forward-v1.png`이며 새 동작은 Figma 원본이 아닌 생성 파생본이다.

## jump-crouch-v1

```text
Use case: identity-preserve. One animation key pose of this EXACT cat, preparing for a small hop to a raft. Image 1 is the edit target and locked identity. Make a soft, clearly readable CROUCH: bend the short front legs and hind legs, lower the torso and head together by about 70 pixels while keeping the paw bottoms planted at y=1142. The chest lowers toward the paws; hindquarters tuck gently, storing energy. Keep the head its EXACT same size, facial proportions, eyes open and pupils looking screen-right/up, ears and whiskers identical. Only translate the head downward with the crouch, do not squash, stretch or enlarge it. Keep the same short chunky four-legged kitten anatomy, tail silhouette and charcoal palette; no long limbs or human arms. Same three-quarter facing screen-right, same horizontal registration and 1254 x 1254 square, feet in original positions. This is a gentle anticipatory crouch, not a sitting pose. All limbs intact. No props or scene. Perfect flat opaque #00FF00 green background, no shadows, checkerboard, labels or motion lines. One full-body cat.
```

## jump-takeoff-v1

```text
Use case: identity-preserve. Draw ONE genuine animation in-between of this exact kitten taking a small forward hop. Image 1 is the starting crouch pose; Image 2 is the airborne endpoint. Same cat, same scale, same head size. Show the instant of PUSHING OFF: hind paws are still at the low original ground level around y=1135, hind legs partly straightening; both front paws are lifted together just below the chest and beginning to reach right. The torso and head have risen HALFWAY from the crouch to the airborne pose, with the head centered halfway between those two reference head positions. Preserve identical facial proportions, eyes and pupils, ears, whiskers, warm dark contours and charcoal shading. No head resizing, no long skinny legs, no human limbs, no extra paws. Keep a slight forward lean, tail trailing toward screen-left. Exactly one fully visible cat, same 1254x1254 canvas registration. This must bridge the poses, not duplicate either endpoint. Pure perfectly flat #00FF00 backdrop, no shadows, floor, props, text, checkerboard, motion streaks or frame labels.
```

## jump-air-v1

```text
Use case: identity-preserve. Create ONE clear airborne pose for a SMALL FORWARD HOP of this same charcoal kitten. Image 1 is the exact face/body identity anchor; image 2 is its crouch for motion context only. Keep the identical head size, eye shapes, open eyes/pupils, ears, whiskers, nose, charcoal palette and warm outline. Head stays centered close to its location in image 1, not enlarged or stretched. The body now leans gently forward toward screen-right about 8 degrees, short FRONT PAWS reaching together forward-right and slightly down, while short HIND PAWS tuck up under the belly, leaving a visible gap under the body. A friendly little feline hop, NOT a superhero fly, no human arms, no long limbs, exactly four legs with natural overlap. Tail curves gently behind at screen-left. Keep the entire figure inside the same 1254-square frame at the same scale; no recentering or zoom. There must be generous empty space below the lifted paws. No scenery, raft, props, ground, cast shadow, motion lines or labels. Pure uniform opaque #00FF00 green background, no checkerboard.
```

## jump-landing-reach-v1

```text
Use case: identity-preserve. Image 1 is the exact edit target: this kitten airborne during a tiny hop. Draw its NEXT pose, reaching down to land. Keep exactly the same head size, face proportions, outline, charcoal colors, ears, whiskers and tail character. Both short FRONT LEGS now extend DOWN and slightly right, rounded front paw bottoms near y=1125, ready to touch the raft. Hind paws remain tucked slightly higher, near y=1025, behind the front legs. The chest tips slightly forward, head lowers only a little; pupils glance gently DOWN-RIGHT toward the landing spot while both eyes remain fully open. No long human arms, no extra paws. Four short chunky feline legs. Same 1254-square canvas, same scale, no recentering or crop. A controlled gentle landing, not falling. Full cat only on perfectly flat pure #00FF00 green background, no raft or props, no shadow, checkerboard, labels or motion streaks.
```

## jump-crouch-mid-v1

```text
Use case: identity-preserve. Draw ONE subtle animation in-between halfway from standing to crouching. Image 1 is the exact standing kitten; Image 2 is its deepest crouch. Same individual, same head size and charcoal style. Put the head and torso exactly HALFWAY between their positions in these two reference poses: lightly bent knees, chest only halfway lowered, paws still planted at the same y=1142 baseline. Keep the same head width, eyes, pupil gaze, nose, whiskers, ears, short thick limbs and tail. Do not copy the fully low crouch; this is only a small preparatory dip. No smiling, no long limbs or human arms, no extra paws, no stretching the head. Same 1254-square canvas, same horizontal scale and margins. One full cat on completely uniform opaque green #00FF00, no shadows, props, floor, labels, checkerboard or motion marks.
```
