# 개별 보행 자세 생성 기록

기본 원화는 Figma 검정 고양이에서 파생한 `neutral-forward-v1.png`다. 아래는 세션 내장 이미지 생성으로 한 장씩 만든 결과이며 sprite-gen 아틀라스 출력이 아니다. 작동하던 `cutout` 유틸리티로 녹색판을 실제 알파로 분리했다. `walk-v1.json`의 선택은 비교 실험 상태이며 기본 영상의 자동 채택을 뜻하지 않는다.

미채택: `walk-between-01-v1`은 뒷발을 과하게 들었다. `walk-contact-b-v1`은 후반 접지 위치가 이전 자세와 겹쳤다. `walk-between-05-v2`는 발 높이 수정 요청이 충분히 반영되지 않아 채택하지 않았다. 미채택 생성 원본은 생성 도구의 보관 위치에 남기며 런타임에 넣지 않는다.

## walk-contact-a-v1

```text
Use case: precise-object-edit.
Asset type: ONE full-body hand-drawn animation key pose, not a sheet or grid.
Edit the attached accepted black kitten anchor into a gentle quadrupedal WALK-IN-PLACE contact pose, facing exactly the same three-quarter screen-right direction.
Change ONLY the short legs below the belly and the tiny shoulder/hip junctions needed to connect them. The near front paw (viewer-right) reaches a small step forward toward the lower-right, touching the baseline. The near hind paw (viewer-left) extends a small step backward toward lower-left, touching the same baseline. The far pair stays naturally under the body, partly occluded; exactly four legs anatomically, no extra paws. The stride must be modest and cute, NOT a running leap, bipedal march, or split.
Lock the entire head and face to the reference: exact ear tips, head size, position, eye shapes and pupil positions, whiskers, nose, outline thickness. Keep the torso center, body volume, charcoal color, tail shape, and overall placement unchanged. It is crucial the face does not shrink or shift between animation frames.
Same 1254 x 1254 square, character at exactly the same scale. Planted paw bottoms around y=1138. All paws stay within x=325..1040. No camera shift, zoom, crop, or re-centering.
Clean soft vector-like illustration, subtle shading exactly like the input. Pure flat #00FF00 chroma green empty background, edge to edge. No ground shadow, textures, labels, props, motion lines, duplicate cats or checkerboard.
```

## walk-contact-b-v1

```text
Use case: precise-object-edit.
Asset type: ONE full-body animation key pose; no grid.
Image 1 is the exact character anchor. Image 2 is the first walking contact pose, a consistency reference. Make the OPPOSITE contact pose, half a walk cycle later.
Preserve the head, face, ear tips, pupils, whiskers, torso center and volume, tail, colors, line thickness and scale of Image 1 with extreme precision. The head must stay in the identical place, same size. Change only the four short legs below the belly.
The near front leg (on viewer-right) is now planted slightly BACK under the chest, paw around x=780 y=1138; the far front paw reaches modestly forward toward x=955 y=1095. The near hind leg is planted modestly FORWARD, around x=570 y=1120; its far mate is behind, mostly occluded. Show a calm quadrupedal walking contact, not a leap, not running or bipedal. Exactly four anatomical legs, naturally overlapping so only three paws may be visible.
Use these positions as gentle pose guidance, NOT labels. Keep paws short, thick and rounded like the original. Keep the belly shape round and consistent, never stretch the torso.
Same 1254 x 1254 canvas, same object registration and baseline as both references. All paws contained in the same padded canvas. Pure perfectly flat #00FF00 background; no shadow, floor, props, text, checkerboard, frame marks or second cat.
```

## walk-contact-b-v2

```text
Use case: precise-object-edit.
Make one very precise leg-position correction to this animation frame. KEEP the head, eyes, face, ears, whiskers, tail, torso, both front legs, palette, linework, framing and canvas exactly unchanged.
Change ONLY the near HIND leg: this is the LEFTMOST visible leg below the tail. Its paw is currently too far back/left. Swing that one short hind leg FORWARD toward screen-right so the hind paw lands under the middle of the belly, centered about x=575 with its bottom at y=1135. The diagonal line from hip to paw should now lean gently RIGHT, not backward-left. Keep that leg thick and rounded and anatomically connected at the same hip. Do not add a new leg: MOVE this existing hind leg.
The other two visible paws must stay exactly as in the input. This is contact B of a calm four-legged walk, with the near hind paw at its FORWARD-most stance.
Same 1254 x 1254 green plate. Same kitten size and head registration. Uniform pure green #00FF00 background, no shadow, props, markings, checkerboard, motion streaks or extra character.
```

## walk-passing-a-v1

```text
Use case: precise-object-edit. ONE animation key pose, not a sprite sheet.
Image 1 is the locked black kitten anchor. Image 2 is contact A. Make the walking PASSING pose one quarter-cycle after contact A.
Change only the lower legs. The near front paw (viewer-right) has moved from its forward reach to directly below the chest, planted at about x=875,y=1138. The near hind paw (viewer-left) is now LIFTED a little and passing forward under the hip, at about x=460,y=1050, with its short knee gently bent. The opposite far legs counterbalance naturally, one planted support paw under the belly. Exactly four anatomical short cat legs, no extra limbs, no dangling human arms. A slow tiny walking step, not running or jumping.
Preserve the exact head and face position, head size, ear tips, open eye shapes, pupil gaze, muzzle, whiskers, torso center and volume, tail and charcoal palette of Image 1. Keep the line art and shading continuous with both references. Do not tilt or reshape the head, do not change the body proportions.
Same 1254 x 1254 green plate, exact same scale and character registration. Baseline of the planted front paw at y=1138. All paws fully contained with padding. Flat pure #00FF00 background, no shadows, floor, checkerboard, annotations, motion lines, props or duplicate character.
```

## walk-passing-b-v1

```text
Use case: precise-object-edit. ONE single full-body hand-drawn animation pose.
Image 1 is the locked kitten anchor. Image 2 is contact B; Image 3 is passing A, for exact consistency. Draw PASSING B, three quarters through a slow quadrupedal walk.
Only the lower legs change. The near front paw on viewer-right is now gently LIFTED and passing forward under the chest, paw center about x=855,y=1050, short elbow bent. The near hind paw on viewer-left is PLANTED under the hip at about x=445,y=1138. The opposite far legs move naturally in counterphase; one small far paw remains visible under the belly for support. Exactly four short cat legs with natural occlusion, no extra paws, no human arms. Calm walking, not jumping or running.
Strict invariants: absolutely identical head size and placement, ears, face contour, eyes and pupils, whiskers, nose, torso center and volume, tail silhouette, charcoal fill, warm dark-brown outline and subtle shading as Image 1. Do not rotate or enlarge the head. Do not stretch the torso. Preserve the original cute rounded paws.
Same 1254 x 1254 canvas and character registration; planted paw baseline y=1138; generous unchanged empty margins. Pure uniform #00FF00 background. No ground, shadow, labels, checkerboard, motion marks, props or second character.
```

## walk-between-01-v1

```text
Use case: precise-object-edit. Generate ONE genuinely redrawn animation in-between, not a crossfade, collage, optical-flow smear or sprite sheet.
Image 1 is walk contact A; Image 2 is passing A. Both depict the SAME locked kitten at the same scale. Draw the leg pose exactly halfway BETWEEN these two frames in time.
Keep the head, face, ears, eyes, pupils, whiskers, tail, torso and all colors perfectly registered and unchanged. Change only the legs below the belly.
The near front paw on viewer-right remains planted and moves halfway from its forward reach toward the chest, around x=930,y=1138. The near hind paw at viewer-left has just begun lifting forward: midway between the backward planted paw of Image 1 and the tucked-up paw of Image 2, around x=415,y=1090. The far pair transitions smoothly and stays anatomically correct with natural occlusion. Four short thick cat legs total, no extra paws or human arms. No running jump.
This is a smooth weight-transfer drawing, not either endpoint copied unchanged. Same 1254 x 1254 canvas, same character center and head dimensions. Pure flat #00FF00 backdrop, no floor, shadows, labels, props, grid, checkerboard or motion streaks.
```

## walk-between-01-v2

```text
Use case: precise-object-edit.
This is a very SMALL animation edit of the attached walking kitten. Preserve every part above the belly exactly. Same head, face, eye gaze, ears, tail, body, placement, colors, canvas, linework. Only change the paws a little.
The near hind paw at lower LEFT is just beginning toe-off: move it a SMALL distance toward the right and lift it only SLIGHTLY from the ground. Its bottom must remain almost level with the planted front paw, only about 25 pixels higher, not curled up to the belly. Keep its lower-left leg mostly extended with a very gentle bend. The near front paw at lower RIGHT stays planted, moved just a small amount back toward the body. The far paw remains supportive under the center.
This is the subtle first eighth of a slow walk, between a spread contact pose and a passing pose. NOT a big lifted knee, no exaggerated curl, no run, no jump, no human arms, no additional legs.
Keep the source 1254 x 1254 framing and head registration unchanged. Solid pure green #00FF00 everywhere outside the cat. No shadow, props, ground, checkerboard, labels or motion streaks. One complete kitten only.
```

## walk-between-03-v1

```text
Use case: precise-object-edit. ONE freshly drawn animation in-between, not a blended image or sheet.
Image 1 is passing A; Image 2 is contact B. Draw a smooth pose halfway between these two leg arrangements.
Lock the entire head, face, pupils, ear tips, whiskers, tail, torso volume and position, charcoal colors and warm outline exactly to the references. Same 1254 x 1254 registration and scale.
The near hind leg on viewer-left is swinging FORWARD and DOWN from its tucked passing position to its forward planted position. Its rounded paw should now be just above the ground, horizontally between the two reference paw positions, around x=550,y=1075. Its knee gently opens. It must not curl higher toward the belly or swing backwards.
The near front paw remains PLANTED, sliding a little backward under the chest from the first reference toward the second. The far front paw is beginning to reach forward from behind the chest, naturally partially occluded. Four anatomical short thick cat legs, no additional paws or human arms. Calm walking weight transfer, not jumping.
Keep every facial feature unchanged; no head bob or head resize. Pure flat #00FF00 background. No floor, shadows, labels, props, motion streaks, checkerboard, grid or duplicate cats.
```

## walk-between-05-v1

```text
Use case: precise-object-edit. ONE animation in-between of the same cat, not a sheet or image blend.
Image 1 is contact B; Image 2 is passing B. Draw the halfway leg pose between them.
Strictly lock the head size and position, face, open eyes and pupils, ears, whiskers, tail, torso volume, colors, outline thickness, canvas and registration. Only legs below the belly change.
The near front paw, the middle-right planted forepaw in Image 1, has JUST started toe-off and moves gently FORWARD and a little UP toward the lifted forepaw in Image 2. It must be halfway between the reference paw locations and only slightly above the floor, not fully curled high yet. Keep that foreleg short and rounded.
The near hind paw, the left/middle hind paw in Image 1, stays PLANTED and slides partway BACK toward its planted location in Image 2, near x=540. Keep it on the same ground baseline. Far legs counterbalance naturally and remain partly occluded. Exactly four anatomical short legs, no extra paws, no human arms.
Gentle slow quadrupedal walk. Same 1254 x 1254 image scale and generous padding. Pure uniform #00FF00 backdrop, no shadows, floor, props, labels, checkerboard, grids, motion streaks or duplicate kitten.
```

## walk-between-05-v2

```text
Use case: precise-object-edit.
Image 1 is the edit target. Image 2 is ONLY a reference for the ground level of the planted paw, not a pose to copy.
Correct one tiny animation registration issue. In Image 1, the LEFTMOST visible HIND leg is the weight-bearing leg. Extend ONLY its lower shin and paw DOWN by about 45 pixels, keeping its horizontal position and hip fixed, so its paw bottom reaches the same y=1138 ground level as the lowest front paw in Image 2. The leg should still be short and thick, just reach the ground instead of floating. Do not move the whole cat.
Keep all other legs exactly as they are, including the lifted front paw. Keep the head, face, eyes and pupils, ears, body, torso, tail, outline, shading, all colors, scale, and canvas placement absolutely unchanged. No head resizing or body shifting. No additional limb.
Same 1254 x 1254 square, pure flat #00FF00 backdrop. No shadows, ground line, guide marks, labels, props, checkerboard or motion streaks. One full-body cat.
```

## walk-between-07-v1

```text
Use case: precise-object-edit. ONE genuinely redrawn animation in-between, not a sprite sheet or blend.
Image 1 is passing B; Image 2 is contact A. Draw the halfway pose that closes the walking loop.
Lock the exact head, ears, open eyes and pupils, face contour, whiskers, tail silhouette, torso volume and center, charcoal palette and dark warm outlines. Same 1254 x 1254 canvas and registration. No change above the belly.
The near front paw on viewer-right is reaching FORWARD and DOWN from the lifted passing position toward the planted forward position. It should be halfway in height between the two reference paws, almost ready to touch down; elbow unfolds gently, short rounded paw.
The near hind paw on viewer-left stays on the floor and slides gently BACK halfway toward the rearward stance of contact A. Far legs shift naturally in counterphase with correct occlusion. Exactly four anatomical short cat legs, only the naturally visible paws. No extra limbs or human arms. Calm small quadrupedal walk, not a leap or run.
Keep the whole kitten fully in the same padded frame. Pure flat #00FF00 background, no shadows, floor, props, text, grid, checkerboard or motion streaks.
```
