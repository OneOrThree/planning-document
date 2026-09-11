# 컷신 이미지 생성 프롬프트 기록

## 책을 보는 전신 자세 · 세션 이미지 생성

sprite-gen `prepare`에서 색상 인자 오류가 발생해 사용자 지시대로 복구·디버깅하지 않았다. 아래 세션 내장 이미지 생성으로 한 장씩 만들었다. 최초 투명 요청은 배경 무늬가 픽셀로 들어가 미채택. 단색 녹색판을 다시 생성했고, 기존에 동작하던 `cutout` 유틸리티만 사용해 실제 알파 PNG로 분리했다. 이 두 장은 아틀라스 파이프라인 결과가 아니다. 시선·얼굴·몸의 원본은 Figma 검정 고양이이며 파생 자세로 구분한다.

### prompt-look-mid-v1

```text
Use case: identity-preserve. Asset type: one full-body animation pose on a genuinely TRANSPARENT alpha background. Image 1 is the EDIT TARGET and exact current production cat; Image 2 is the original Figma identity reference. Make ONE subtle intermediate pose for the cat gently looking at a book near its front paws on screen-right. Change only the gaze and a very slight downward head inclination (about 5 degrees). Keep the body, planted paws, tail, ears, head width, all outlines, fur colors, eye shapes, proportions, stance and three-quarter facing EXACTLY as image 1. The eye pupils shift down-right toward the floor, visibly more downward than the original, but eyes stay fully open. No book, prop, scene, floor, background color, checkerboard, ground shadow, text or markings. One cat only. Full figure comfortably inside a square canvas. The cat must have real transparent pixels outside its silhouette; never a painted transparency pattern. This is an in-between texture for the same character, not a redesign or a different cat.
```

### prompt-look-mid-key-v1

```text
Use case: background-extraction. Image 1 is the edit target. Preserve the exact cat, every pixel of its face and body, down-right eye gaze, outlines, head position, stance, scale and canvas size. Replace ONLY the gray/white checkerboard outside the cat with perfectly uniform solid vivid GREEN #00FF00, all the way to every canvas edge. This is a chroma-key production plate, deliberately OPAQUE green, NOT a transparent image. No checkerboard, no gray, no white backdrop, no texture or pattern, no shadow. The interior fur must remain the same charcoal color, no green tint or reflection. One cat on one perfectly flat pure green background.
```

### prompt-look-reach-v1

```text
Use case: identity-preserve. Image 1 is the exact edit target: the production cat looking down-right. Keep its exact head, eyes looking down, face proportions, fur colors, outline weight, ears, tail, hind paws, body size, canvas framing and full-body position. Change ONLY the nearest FRONT PAW (the rightmost visible paw) into a gentle reaching pose: bend its elbow and extend the paw diagonally DOWN and to SCREEN RIGHT, a short reach toward an object near the floor. Paw tip should be about half a paw-height above the original foot baseline and only one paw-width beyond the body. Keep all other paws planted; preserve quadruped anatomy, do not add arms. No book, no prop. Retain the perfectly FLAT OPAQUE pure green #00FF00 background. No transparency grid, checkerboard, shadows, text, or outline changes. This is a separate animation pose of the exact same cat, not a new character.
```


## prompt-raft-cloth-v2

초기 v1은 체크무늬가 그려진 결과여서 사용하지 않는다. v2는 녹색 배경으로 생성한 뒤 sprite-gen의 cutout으로 분리한다.

```text
Use case: precise-object-edit. Edit the attached tarp asset. Keep its exact overall silhouette, position and isometric perspective. Replace the entire checkerboard and all outer shadows with perfectly uniform pure bright green #00FF00. No checkerboard anywhere. Cloth itself remains opaque muted blue-gray. Simplify the cloth surface to clean elegant 2D cel shading: one base color and two flat shadow tones, just 6-8 clear broad fold contours. REMOVE watercolor brush strokes, noisy texture, realistic fabric, tiny highlight streaks. Crisp warm-brown illustration contours matching a cozy mobile cat-game prop. Do not add wood, raft, ropes, poles, objects, or characters. Same composition and generous margins. The green is a temporary extraction background, and must not appear inside the cloth.
```

## prompt-coastal-home-pier-v3

```text
Use case: precise-object-edit. Image 1 is the exact EDIT TARGET. Preserve this same portrait cottage / broad sand / turquoise water background unchanged EXCEPT the wooden jetty near 55% height. Make that jetty shorter horizontally so its outer right end is at approximately 65% of image width instead of 80%. Keep its land connection and vertical location exactly where they are. The deck remains a charming shallow diamond with four short rope-topped timber posts and the same warm outlines. The inner left edge adjoining sand stays near 37% width; far right post should be near 65% width (about 615 px if width is 941). This leaves more empty water to the right for a raft to sail around the jetty without being forced off camera. Replace the vacated deck area with perfectly matching turquoise water, broad flat calm wave colors. Do NOT change cottage, wide porch, sandy path, shoreline rocks, trees, horizon, islands, sun, clouds or palette. No cats, people, rafts, boats, objects, text or UI added. Highest-quality clean low-saturation 2D game illustration, crisp warm brown outlines, no watercolor or photorealism. Maintain exact portrait dimensions and coherent perspective.
```

## black-paddle-prompt-v1

```text
Use case: identity-preserve. Input image is the accepted bent-front-paw cat anchor. Preserve precisely this paw pose, face, full-body shape, and illustrated NON-pixel rendering. There is no attached spacing guide: use exactly FOUR evenly spaced invisible square cells in a single horizontal strip.
Create a single horizontal sprite strip for the game character `gachisup-figma-black` in the state `paddle`.

If this is a pre-idle/simple run, the attached base image may be used as the canonical character design. In direction-anchor mode, do not use base images for final action rows; accepted idle/direction anchors own row identity. Use the attached accepted idle/direction anchor as the canonical character design for this row. If a state anchor is attached for a non-locomotion state, treat it as approved state vocabulary only. Follow the explicit numeric layout only. If an additional generated row strip is attached, use it only as a motion reference, never as a replacement identity source. Do not simply copy the still reference pose. Generate distinct animation poses that create a readable cycle or action.

Character: gachisup-figma-black.
Style contract: match the attached base/anchor reference image EXACTLY: same pixel density (logical pixel block size), same body proportions, same outline weight, same palette, same shading style, same level of detail. Do not restyle, do not change proportions, do not add or remove detail density..

Use this prompt as an authoritative sprite-production spec.

Animation action: Hold the EXACT bent-forepaw pose of the attached anchor; do not move any paw, tail, torso, head, ear or whisker. Only eyelids blink top-down. Frame 1 both eyes fully open; frame 2 upper eyelids halfway down; frame 3 both eyes fully closed with gentle horizontal curved lines; frame 4 both eyes fully open again. Same body width, head size and baseline in every frame. No paddle or prop drawn..

Anchor lock:
- Accepted idle/direction anchors own character identity, outfit details, colors, face design, asymmetric markings, and side-specific accessories for final action rows.
- Base character images and original character sheets are pre-idle sources only. Do not reinterpret or reintroduce base-character details inside a direction-anchor action row.
- This row owns motion only. Spend the variation budget on limb contacts, arm counter-swing, body height, torso lean, head bob, hair bounce, and loop continuity.
- Do not redesign or reinterpret identity details while animating. Keep face, hair shape, markings, palette, outline weight, body proportions, outfit, props, and silhouette copied from the approved anchors.
- Preserve side-specific features exactly as the approved anchors show them. Do not solve hairpin side, earring side, logos, handed props, scars, one-sided markings, asymmetric clothing, or lighting cues from scratch inside the row.
- When generating a paired left/right row, use the paired row reference only for timing, scale, and animation intensity. Rotate the body, feet, shoulders, face angle, and gaze to the target facing, but keep identity details attached according to the accepted target-direction anchor.
- For cyclic locomotion, do not let a single running/walking pose anchor determine every frame's leg phase. When a multi-pose motion reference is attached, use it for foot contacts.
- Prefer a subtler animation over any change that mutates the character identity.


Transparency and artifact rules:
- Prefer pose, expression, and silhouette changes over decorative effects.
- Effects are allowed only when state-relevant, opaque, hard-edged, sprite-like, fully inside the same frame slot, and physically touching or overlapping the character silhouette.
- Do not draw detached effects: floating stars, loose sparkles, floating punctuation, floating icons, separated smoke clouds, loose dust, disconnected outline bits, or stray pixels.
- Do not draw wave marks, motion arcs, speed lines, action streaks, afterimages, blur, smears, halos, glows, auras, floor patches, cast shadows, contact shadows, drop shadows, oval floor shadows, landing marks, or impact bursts.
- Do not include text, labels, frame numbers, visible grids, guide marks, speech bubbles, thought bubbles, UI panels, code snippets, scenery, checkerboard transparency, white backgrounds, or black backgrounds.
- Reject any pose that is cropped, overlaps another pose, crosses into a neighboring frame slot, or creates a separate disconnected component that is not attached to the character.

Layout requirements:
- Exactly 4 full-body frames, left to right, in one horizontal row.
- The invisible layout uses the 4 frame boxes, inner safe area, and centers for this row. Follow its slot count, spacing, centering, and padding.
- Do not reproduce the layout guide itself: no visible boxes, guide lines, center marks, labels, guide colors, or guide background may appear in the output.
- Treat the image as 4 equal-width invisible 384x384 frame slots. Fill every slot: each requested slot must contain exactly one complete full-body pose.
- Spread the 4 poses evenly across the whole image width. Do not leave any requested slot blank or create large empty gaps between poses.
- Center one complete pose in each slot. No pose may cross into the neighboring slot.
- Use a perfectly flat pure green #00FF00 chroma-key background across the whole image.
- Do not use #00FF00, pure green, or chroma-adjacent colors in the character, highlights, props, shadows, or effects.
- Keep the rendering faithful to the attached reference sprite: same outline weight, same palette, same detail level — do not restyle it.
- Keep every frame self-contained with at least 38 px horizontal and 38 px vertical safe padding. No character body part should be clipped by the frame slot.
- Avoid motion blur. Use clear pose changes readable at 384x384.
- Preserve the same silhouette, face, proportions, palette, material, and props across every frame.

Output only the sprite strip image.
```

## prompt-coastal-home-pier-v2

```text
Use case: precise-object-edit. Image 1 is the EDIT TARGET. Preserve this exact portrait coastal cottage / path / pier scene, camera, horizon, sunlight, muted palette, crisp brown contours, all large shapes and wood-pier position. Make ONLY the walking and staging spaces more usable: (1) Cottage front wooden porch floor must be deeper front-to-back, extending down to a wide clean rectangular landing, with room for a small cat and open book; bench and potted flowers stay behind the empty floor, not on it. Simplify the transition from porch to sandy path to ONE broad shallow step, not several skinny stairs. (2) The first bend of the sandy path below the cottage needs a generous empty sandy patch on its right half. Remove the grass clump intruding in the middle of that path; shift the nearest big rocks and grass toward the water/right edge so the path stays broad and clear down to the jetty. Keep charming dune grasses on far edges only. (3) Preserve the broad empty turquoise water to the right and below the dock for a separate raft. NO cats, books, bags, rafts, boats, signs, text or UI. Highest resolution clean 2D illustrated game background, refined vector-like contours, NOT watercolor, NOT realistic photography. Do not add a second sun or new buildings. Maintain portrait 9:16 full-bleed composition.
```

## prompt-notebook-open-v1

```text
Use case: stylized-concept. Asset: one blank open notebook for a cozy illustrated cat-game cutscene. Input 1 is rendering STYLE ONLY; do not include cat. Input 2 is background STYLE ONLY; do not copy scene. Create a beautiful small clothbound open notebook viewed perfectly straight-on from above, open flat with two symmetrical cream pages, horizontal landscape spread 1.7:1. Warm desaturated blue-gray cloth cover just visible beyond pages, rounded corners, subtly curved layered page edges at bottom, narrow center gutter. Charming crisp dark warm-brown outlines, same simple cel shaded 2D art as the cat. Not photorealistic, not watercolor, no grain/noise. The page interiors must be completely blank ivory, no lines, text, sketches, stamps, pens, hands, plants or bookmark ribbons. One notebook alone centered, 18% padding all sides, evenly lit, NO cast shadow, no floor. Genuinely transparent background, never a checkerboard. The notebook will be animated in code as a separate foreground prop.
```

## black-reach-prompt-v1

```text
Use case: identity-preserve. Input image is the exact approved Figma cat identity. Smooth illustrated art, NOT pixel art. No second image guide is attached; follow the explicit six equal-width invisible slots below.
Create a single horizontal sprite strip for the game character `gachisup-figma-black` in the state `reach`.

If this is a pre-idle/simple run, the attached base image may be used as the canonical character design. In direction-anchor mode, do not use base images for final action rows; accepted idle/direction anchors own row identity. Use the attached accepted idle/direction anchor as the canonical character design for this row. If a state anchor is attached for a non-locomotion state, treat it as approved state vocabulary only. Follow the explicit numeric layout only. If an additional generated row strip is attached, use it only as a motion reference, never as a replacement identity source. Do not simply copy the still reference pose. Generate distinct animation poses that create a readable cycle or action.

Character: gachisup-figma-black.
Style contract: match the attached base/anchor reference image EXACTLY: same pixel density (logical pixel block size), same body proportions, same outline weight, same palette, same shading style, same level of detail. Do not restyle, do not change proportions, do not add or remove detail density..

Use this prompt as an authoritative sprite-production spec.

Animation action: One gentle reach with the far/right front paw while the other three paws stay planted. Six successive poses: 1 original neutral; 2 head glances downward and right forepaw begins lifting; 3 forepaw bent halfway; 4 forepaw extends forward/right, paw at chest height; 5 forepaw lowers toward ground in front; 6 hold lowered reaching paw. Absolutely same head/body size and shared grounded feet across all six poses. No props, no book, no shadow. Right-facing three-quarter original angle. The reach uses a short feline foreleg, never a human arm..

Anchor lock:
- Accepted idle/direction anchors own character identity, outfit details, colors, face design, asymmetric markings, and side-specific accessories for final action rows.
- Base character images and original character sheets are pre-idle sources only. Do not reinterpret or reintroduce base-character details inside a direction-anchor action row.
- This row owns motion only. Spend the variation budget on limb contacts, arm counter-swing, body height, torso lean, head bob, hair bounce, and loop continuity.
- Do not redesign or reinterpret identity details while animating. Keep face, hair shape, markings, palette, outline weight, body proportions, outfit, props, and silhouette copied from the approved anchors.
- Preserve side-specific features exactly as the approved anchors show them. Do not solve hairpin side, earring side, logos, handed props, scars, one-sided markings, asymmetric clothing, or lighting cues from scratch inside the row.
- When generating a paired left/right row, use the paired row reference only for timing, scale, and animation intensity. Rotate the body, feet, shoulders, face angle, and gaze to the target facing, but keep identity details attached according to the accepted target-direction anchor.
- For cyclic locomotion, do not let a single running/walking pose anchor determine every frame's leg phase. When a multi-pose motion reference is attached, use it for foot contacts.
- Prefer a subtler animation over any change that mutates the character identity.


Transparency and artifact rules:
- Prefer pose, expression, and silhouette changes over decorative effects.
- Effects are allowed only when state-relevant, opaque, hard-edged, sprite-like, fully inside the same frame slot, and physically touching or overlapping the character silhouette.
- Do not draw detached effects: floating stars, loose sparkles, floating punctuation, floating icons, separated smoke clouds, loose dust, disconnected outline bits, or stray pixels.
- Do not draw wave marks, motion arcs, speed lines, action streaks, afterimages, blur, smears, halos, glows, auras, floor patches, cast shadows, contact shadows, drop shadows, oval floor shadows, landing marks, or impact bursts.
- Do not include text, labels, frame numbers, visible grids, guide marks, speech bubbles, thought bubbles, UI panels, code snippets, scenery, checkerboard transparency, white backgrounds, or black backgrounds.
- Reject any pose that is cropped, overlaps another pose, crosses into a neighboring frame slot, or creates a separate disconnected component that is not attached to the character.

Layout requirements:
- Exactly 6 full-body frames, left to right, in one horizontal row.
- The invisible layout uses the 6 frame boxes, inner safe area, and centers for this row. Follow its slot count, spacing, centering, and padding.
- Do not reproduce the layout guide itself: no visible boxes, guide lines, center marks, labels, guide colors, or guide background may appear in the output.
- Treat the image as 6 equal-width invisible 384x384 frame slots. Fill every slot: each requested slot must contain exactly one complete full-body pose.
- Spread the 6 poses evenly across the whole image width. Do not leave any requested slot blank or create large empty gaps between poses.
- Center one complete pose in each slot. No pose may cross into the neighboring slot.
- Use a perfectly flat pure green #00FF00 chroma-key background across the whole image.
- Do not use #00FF00, pure green, or chroma-adjacent colors in the character, highlights, props, shadows, or effects.
- Keep the rendering faithful to the attached reference sprite: same outline weight, same palette, same detail level — do not restyle it.
- Keep every frame self-contained with at least 38 px horizontal and 38 px vertical safe padding. No character body part should be clipped by the frame slot.
- Avoid motion blur. Use clear pose changes readable at 384x384.
- Preserve the same silhouette, face, proportions, palette, material, and props across every frame.

Output only the sprite strip image.
```

2026-09-12. 모두 현재 세션의 내장 이미지 생성 도구를 사용했다. CLI 이미지 생성이나 Grok 영상 생성은 사용하지 않았다. sprite-gen 2.1.0은 배치 준비·녹색 배경 분리·컴포넌트 추출·아틀라스 합성·미리보기 생성에 사용했다. 사용자가 세션 내 직접 생성을 지시한 뒤 생성 단계는 내장 도구로 수행했다.

Figma 그림은 디자인 기준이며, 여기서 만든 동작·흰색/삼색 전신·분리 파츠는 별도 생성 파생본이다. `rig-black/`은 비교 중인 관절 실험이고 현재 기본 재생에 채택되지 않았다. 선택되지 않은 가짜 체크 배경·초기 걷기 결과는 런타임에 넣지 않았다.

## prompt-room-v2

```text
Use case: style-transfer. Input image 1 is the edit target: a room background for a cozy mobile cat game. Input image 2 is STYLE reference only, the actual approved cat sprite; DO NOT draw this cat into the background. Change ONLY the illustration rendering of image 1. Preserve its portrait 9:16 composition, empty staging positions, objects and perspective. Make its linework and forms compatible with the cat reference: warm dark brown crisp outlines, rounded chunky forms, restrained muted cream/sage/aqua colors, simple clean 2-tone cel shadows, detailed but NOT realistic. Like an exquisitely crafted hand-drawn 2D game backdrop, NOT a photograph, NOT an oil or watercolor painting. Remove photorealistic light, wood grain noise, watercolor brush texture, excessive micro-detail and sharp realistic reflections. Keep large clean shapes. The water should be muted blue-green with a few broad clean wave shapes, not photographic caustics. Cat-sized furniture. No characters, no boats, no text, no logos. Portrait full-bleed background only.
```

## prompt-shore-v2

```text
Use case: style-transfer. Input image 1 is the edit target: a shore background for a cozy mobile cat game. Input image 2 is STYLE reference only, the actual approved cat sprite; DO NOT draw this cat into the background. Change ONLY the illustration rendering of image 1. Preserve its portrait 9:16 composition, empty staging positions, objects and perspective. Make its linework and forms compatible with the cat reference: warm dark brown crisp outlines, rounded chunky forms, restrained muted cream/sage/aqua colors, simple clean 2-tone cel shadows, detailed but NOT realistic. Like an exquisitely crafted hand-drawn 2D game backdrop, NOT a photograph, NOT an oil or watercolor painting. Remove photorealistic light, wood grain noise, watercolor brush texture, excessive micro-detail and sharp realistic reflections. Keep large clean shapes. The water should be muted blue-green with a few broad clean wave shapes, not photographic caustics. Cat-sized furniture. No characters, no boats, no text, no logos. Portrait full-bleed background only.
```

## prompt-sea-v2

```text
Use case: style-transfer. Input image 1 is the edit target: a sea background for a cozy mobile cat game. Input image 2 is STYLE reference only, the actual approved cat sprite; DO NOT draw this cat into the background. Change ONLY the illustration rendering of image 1. Preserve its portrait 9:16 composition, empty staging positions, objects and perspective. Make its linework and forms compatible with the cat reference: warm dark brown crisp outlines, rounded chunky forms, restrained muted cream/sage/aqua colors, simple clean 2-tone cel shadows, detailed but NOT realistic. Like an exquisitely crafted hand-drawn 2D game backdrop, NOT a photograph, NOT an oil or watercolor painting. Remove photorealistic light, wood grain noise, watercolor brush texture, excessive micro-detail and sharp realistic reflections. Keep large clean shapes. The water should be muted blue-green with a few broad clean wave shapes, not photographic caustics. Cat-sized furniture. No characters, no boats, no text, no logos. Portrait full-bleed background only.
```

## prompt-sketch-beach

```text
Use case: illustration-story. Create a portrait 9:16 full-bleed EMPTY background plate for a charming 2D mobile cat game cutscene. Reference 1 is the approved coastal background STYLE and palette; reference 2 is the CAT style reference only. Do not include any character. Scene: close low view of a quiet sandy patch on a small island shore, with plenty of flat clean warm ivory sand in the entire lower 55% and center, ready for a cat to draw a pier in the sand. Muted turquoise sea only in upper 35%, very distant green island, a tiny quiet wood jetty in far upper left. Small tufts of sage coastal grass and rounded rocks at the far corners only. Clean untextured sand from x20%-80%, y48%-85% for a character, open notebook and drawing. Flat two-tone cel shading, thick warm brown outlines, rounded shapes, detailed charming but clean vector-like game illustration matching the reference. Soft restrained low saturation cream/seafoam/olive. NO watercolor paper texture, no photorealism, no noise, no writing, no sketches already drawn, no cats, no boats, no UI. The foreground sand must clearly be dry ground, not submerged underwater. Preserve aspect ratio portrait.
```

## prompt-raft-deck-v3

```text
Use case: stylized-concept. Image 1 is the exact background style and perspective reference. Create ONE small empty wooden RAFT game prop, not a boat. Six warm honey-brown planks lashed by two beige ropes, subtly rounded hand-worked edges and restrained wood grain. Three-quarter overhead view matching the dock in image 1: upper surface a shallow diamond, horizontal span twice its vertical span; near/front edge visible. Natural proportions, compact rectangle. Crisp warm dark-brown contours, low-saturation cel shaded 2D illustration, no watercolor grain, no 3D photorealism. Raft only; no oar, sail, flag, mast, furniture, plants, cats, ropes trailing outside silhouette, water, reflections, drop shadow, ground, text. Centered with 18% padding. Perfect flat pure green #00FF00 background for alpha extraction, no checkerboard and no green inside the wood. Highest clean illustration fidelity.
```

## prompt-coastal-home-pier

```text
Use case: illustration-story. Create a portrait 9:16 high-resolution game cutscene background in exactly the low-saturation warm outline/cel-shaded illustration style of image 1. One continuous walkable coastal scene, for tracking a SMALL CAT from its home to a raft. Upper left at 12% width and 38% height: cozy tiny sea-green wooden cottage entrance with warm wood porch, open doorway, a small empty bench and potted pale daisies. A broad readable sandy path curves diagonally from the porch down-right to a short wooden pier projecting over the sea. Pier endpoint is at 55% width and 66% height, dry walking deck fully visible, NO rail blocking character. Plenty of unobstructed EMPTY TURQUOISE WATER to the right and below pier for adding separate raft/character in code. Horizon at 23% height; distant small forested islands; serene ivory cloud shapes and pale blue morning sky. Bottom-left dune grasses and pale stones frame scene; bottom-right mostly water, reserved for titles. Camera slightly elevated, fixed orthographic-like perspective. Do not include cats, people, boats, rafts, text, signs, UI, scattered clutter. Clean contour discipline, refined scenery, simple two-tone shadows, almost no texture, coherent scale between porch, path, pier. Never photorealistic or watercolor.
```

## black-blink-prompt

```text
Use case: identity-preserve. Image 1 is the exact approved Figma character identity. Image 2 is ONLY a spacing guide; do not reproduce lines. This is smooth illustrated art, NOT pixel art. Create a single horizontal sprite strip for the game character `gachisup-figma-black` in the state `blink`.

If this is a pre-idle/simple run, the attached base image may be used as the canonical character design. In direction-anchor mode, do not use base images for final action rows; accepted idle/direction anchors own row identity. Use the attached accepted idle/direction anchor as the canonical character design for this row. If a state anchor is attached for a non-locomotion state, treat it as approved state vocabulary only. Use the attached layout guide image only for frame count, slot spacing, centering, and safe padding. If an additional generated row strip is attached, use it only as a motion reference, never as a replacement identity source. Do not simply copy the still reference pose. Generate distinct animation poses that create a readable cycle or action.

Character: gachisup-figma-black.
Style contract: match the attached base/anchor reference image EXACTLY: same pixel density (logical pixel block size), same body proportions, same outline weight, same palette, same shading style, same level of detail. Do not restyle, do not change proportions, do not add or remove detail density..

Use this prompt as an authoritative sprite-production spec.

Animation action: Planted idle cat, only eyelids change: open eyes, half closed upper lids, fully closed thin curved lines, open again. Identical body and head..

Anchor lock:
- Accepted idle/direction anchors own character identity, outfit details, colors, face design, asymmetric markings, and side-specific accessories for final action rows.
- Base character images and original character sheets are pre-idle sources only. Do not reinterpret or reintroduce base-character details inside a direction-anchor action row.
- This row owns motion only. Spend the variation budget on limb contacts, arm counter-swing, body height, torso lean, head bob, hair bounce, and loop continuity.
- Do not redesign or reinterpret identity details while animating. Keep face, hair shape, markings, palette, outline weight, body proportions, outfit, props, and silhouette copied from the approved anchors.
- Preserve side-specific features exactly as the approved anchors show them. Do not solve hairpin side, earring side, logos, handed props, scars, one-sided markings, asymmetric clothing, or lighting cues from scratch inside the row.
- When generating a paired left/right row, use the paired row reference only for timing, scale, and animation intensity. Rotate the body, feet, shoulders, face angle, and gaze to the target facing, but keep identity details attached according to the accepted target-direction anchor.
- For cyclic locomotion, do not let a single running/walking pose anchor determine every frame's leg phase. When a multi-pose motion reference is attached, use it for foot contacts.
- Prefer a subtler animation over any change that mutates the character identity.


Transparency and artifact rules:
- Prefer pose, expression, and silhouette changes over decorative effects.
- Effects are allowed only when state-relevant, opaque, hard-edged, sprite-like, fully inside the same frame slot, and physically touching or overlapping the character silhouette.
- Do not draw detached effects: floating stars, loose sparkles, floating punctuation, floating icons, separated smoke clouds, loose dust, disconnected outline bits, or stray pixels.
- Do not draw wave marks, motion arcs, speed lines, action streaks, afterimages, blur, smears, halos, glows, auras, floor patches, cast shadows, contact shadows, drop shadows, oval floor shadows, landing marks, or impact bursts.
- Do not include text, labels, frame numbers, visible grids, guide marks, speech bubbles, thought bubbles, UI panels, code snippets, scenery, checkerboard transparency, white backgrounds, or black backgrounds.
- Reject any pose that is cropped, overlaps another pose, crosses into a neighboring frame slot, or creates a separate disconnected component that is not attached to the character.

Layout requirements:
- Exactly 4 full-body frames, left to right, in one horizontal row.
- The attached layout guide shows the 4 frame boxes, inner safe area, and centers for this row. Follow its slot count, spacing, centering, and padding.
- Do not reproduce the layout guide itself: no visible boxes, guide lines, center marks, labels, guide colors, or guide background may appear in the output.
- Treat the image as 4 equal-width invisible 384x384 frame slots. Fill every slot: each requested slot must contain exactly one complete full-body pose.
- Spread the 4 poses evenly across the whole image width. Do not leave any requested slot blank or create large empty gaps between poses.
- Center one complete pose in each slot. No pose may cross into the neighboring slot.
- Use a perfectly flat pure green #00FF00 chroma-key background across the whole image.
- Do not use #00FF00, pure green, or chroma-adjacent colors in the character, highlights, props, shadows, or effects.
- Keep the rendering faithful to the attached reference sprite: same outline weight, same palette, same detail level — do not restyle it.
- Keep every frame self-contained with at least 38 px horizontal and 38 px vertical safe padding. No character body part should be clipped by the frame slot.
- Avoid motion blur. Use clear pose changes readable at 384x384.
- Preserve the same silhouette, face, proportions, palette, material, and props across every frame.

Output only the sprite strip image.

```

## black-walk-prompt-v2

```text
Use case: identity-preserve. Image 1 is the exact approved Figma character identity. Image 2 is ONLY a spacing guide; do not reproduce lines. This is smooth illustrated art, NOT pixel art. Create a single horizontal sprite strip for the game character `gachisup-figma-black` in the state `walk`.

If this is a pre-idle/simple run, the attached base image may be used as the canonical character design. In direction-anchor mode, do not use base images for final action rows; accepted idle/direction anchors own row identity. Use the attached accepted idle/direction anchor as the canonical character design for this row. If a state anchor is attached for a non-locomotion state, treat it as approved state vocabulary only. Use the attached layout guide image only for frame count, slot spacing, centering, and safe padding. If an additional generated row strip is attached, use it only as a motion reference, never as a replacement identity source. Do not simply copy the still reference pose. Generate distinct animation poses that create a readable cycle or action.

Character: gachisup-figma-black.
Style contract: match the attached base/anchor reference image EXACTLY: same pixel density (logical pixel block size), same body proportions, same outline weight, same palette, same shading style, same level of detail. Do not restyle, do not change proportions, do not add or remove detail density..

Use this prompt as an authoritative sprite-production spec.

Animation action: In-place quadruped walk toward screen right in the exact reference three-quarter angle. Six distinct evenly spaced phases of a complete walking cycle, alternating front and rear paws. Identical head shape and eye direction; no overall displacement; no props..

Anchor lock:
- Accepted idle/direction anchors own character identity, outfit details, colors, face design, asymmetric markings, and side-specific accessories for final action rows.
- Base character images and original character sheets are pre-idle sources only. Do not reinterpret or reintroduce base-character details inside a direction-anchor action row.
- This row owns motion only. Spend the variation budget on limb contacts, arm counter-swing, body height, torso lean, head bob, hair bounce, and loop continuity.
- Do not redesign or reinterpret identity details while animating. Keep face, hair shape, markings, palette, outline weight, body proportions, outfit, props, and silhouette copied from the approved anchors.
- Preserve side-specific features exactly as the approved anchors show them. Do not solve hairpin side, earring side, logos, handed props, scars, one-sided markings, asymmetric clothing, or lighting cues from scratch inside the row.
- When generating a paired left/right row, use the paired row reference only for timing, scale, and animation intensity. Rotate the body, feet, shoulders, face angle, and gaze to the target facing, but keep identity details attached according to the accepted target-direction anchor.
- For cyclic locomotion, do not let a single running/walking pose anchor determine every frame's leg phase. When a multi-pose motion reference is attached, use it for foot contacts.
- Prefer a subtler animation over any change that mutates the character identity.


State-specific requirements:
- Show locomotion through body, arm, leg, hair, and prop movement only.
- Use distinct gait poses that create a readable cycle instead of repeated standing or static bobbing.
- Do not draw speed lines, dust clouds, floor shadows, motion trails, or detached motion effects.

Transparency and artifact rules:
- Prefer pose, expression, and silhouette changes over decorative effects.
- Effects are allowed only when state-relevant, opaque, hard-edged, sprite-like, fully inside the same frame slot, and physically touching or overlapping the character silhouette.
- Do not draw detached effects: floating stars, loose sparkles, floating punctuation, floating icons, separated smoke clouds, loose dust, disconnected outline bits, or stray pixels.
- Do not draw wave marks, motion arcs, speed lines, action streaks, afterimages, blur, smears, halos, glows, auras, floor patches, cast shadows, contact shadows, drop shadows, oval floor shadows, landing marks, or impact bursts.
- Do not include text, labels, frame numbers, visible grids, guide marks, speech bubbles, thought bubbles, UI panels, code snippets, scenery, checkerboard transparency, white backgrounds, or black backgrounds.
- Reject any pose that is cropped, overlaps another pose, crosses into a neighboring frame slot, or creates a separate disconnected component that is not attached to the character.

Layout requirements:
- Exactly 6 full-body frames, left to right, in one horizontal row.
- The attached layout guide shows the 6 frame boxes, inner safe area, and centers for this row. Follow its slot count, spacing, centering, and padding.
- Do not reproduce the layout guide itself: no visible boxes, guide lines, center marks, labels, guide colors, or guide background may appear in the output.
- Treat the image as 6 equal-width invisible 384x384 frame slots. Fill every slot: each requested slot must contain exactly one complete full-body pose.
- Spread the 6 poses evenly across the whole image width. Do not leave any requested slot blank or create large empty gaps between poses.
- Center one complete pose in each slot. No pose may cross into the neighboring slot.
- Use a perfectly flat pure green #00FF00 chroma-key background across the whole image.
- Do not use #00FF00, pure green, or chroma-adjacent colors in the character, highlights, props, shadows, or effects.
- Keep the rendering faithful to the attached reference sprite: same outline weight, same palette, same detail level — do not restyle it.
- Keep every frame self-contained with at least 38 px horizontal and 38 px vertical safe padding. No character body part should be clipped by the frame slot.
- Avoid motion blur. Use clear pose changes readable at 384x384.
- Preserve the same silhouette, face, proportions, palette, material, and props across every frame.

Output only the sprite strip image.

CRITICAL GAIT CORRECTION: This must be SIX successive phases, NOT repeated identical steps. Pose 1: near front paw extended forward/right touching ground; far front paw behind/left. Pose 2: near front paw begins weight bearing and moves under shoulder; far front paw lifted and bent moving forward. Pose 3: near front paw trailing behind body; far front paw reaches forward touching ground. Pose 4: swap left/right support exactly, far front paw forward bearing weight, near front paw behind. Pose 5: near front paw lifts and bends while far front paw moves under body. Pose 6: near front paw reaches forward before touch; far front paw trails. Rear legs alternate on opposite phase. Draw the actual elbows and paws in six different silhouettes. Full-body feline quadruped, never two-legged walking. Each face and ear silhouette remains exactly the original. Uniform torso size and shared floorline. One six-pose row only.
```

## black-jump-prompt

```text
Use case: identity-preserve. Image 1 is the exact approved Figma character identity. Image 2 is ONLY a spacing guide; do not reproduce lines. This is smooth illustrated art, NOT pixel art. Create a single horizontal sprite strip for the game character `gachisup-figma-black` in the state `jump`.

If this is a pre-idle/simple run, the attached base image may be used as the canonical character design. In direction-anchor mode, do not use base images for final action rows; accepted idle/direction anchors own row identity. Use the attached accepted idle/direction anchor as the canonical character design for this row. If a state anchor is attached for a non-locomotion state, treat it as approved state vocabulary only. Use the attached layout guide image only for frame count, slot spacing, centering, and safe padding. If an additional generated row strip is attached, use it only as a motion reference, never as a replacement identity source. Do not simply copy the still reference pose. Generate distinct animation poses that create a readable cycle or action.

Character: gachisup-figma-black.
Style contract: match the attached base/anchor reference image EXACTLY: same pixel density (logical pixel block size), same body proportions, same outline weight, same palette, same shading style, same level of detail. Do not restyle, do not change proportions, do not add or remove detail density..

Use this prompt as an authoritative sprite-production spec.

Animation action: Small boarding hop toward screen right: crouch with bent legs, push off with front paws raised, airborne compact body, softly landing with bent legs. Same character identity, no props, no trajectory drawn..

Anchor lock:
- Accepted idle/direction anchors own character identity, outfit details, colors, face design, asymmetric markings, and side-specific accessories for final action rows.
- Base character images and original character sheets are pre-idle sources only. Do not reinterpret or reintroduce base-character details inside a direction-anchor action row.
- This row owns motion only. Spend the variation budget on limb contacts, arm counter-swing, body height, torso lean, head bob, hair bounce, and loop continuity.
- Do not redesign or reinterpret identity details while animating. Keep face, hair shape, markings, palette, outline weight, body proportions, outfit, props, and silhouette copied from the approved anchors.
- Preserve side-specific features exactly as the approved anchors show them. Do not solve hairpin side, earring side, logos, handed props, scars, one-sided markings, asymmetric clothing, or lighting cues from scratch inside the row.
- When generating a paired left/right row, use the paired row reference only for timing, scale, and animation intensity. Rotate the body, feet, shoulders, face angle, and gaze to the target facing, but keep identity details attached according to the accepted target-direction anchor.
- For cyclic locomotion, do not let a single running/walking pose anchor determine every frame's leg phase. When a multi-pose motion reference is attached, use it for foot contacts.
- Prefer a subtler animation over any change that mutates the character identity.


State-specific requirements:
- Show the jump through pose and vertical body position only: anticipation, lift, airborne peak, descent, settle.
- Do not draw ground shadows, contact shadows, oval shadows, landing marks, dust, smears, or motion marks under the character.

Transparency and artifact rules:
- Prefer pose, expression, and silhouette changes over decorative effects.
- Effects are allowed only when state-relevant, opaque, hard-edged, sprite-like, fully inside the same frame slot, and physically touching or overlapping the character silhouette.
- Do not draw detached effects: floating stars, loose sparkles, floating punctuation, floating icons, separated smoke clouds, loose dust, disconnected outline bits, or stray pixels.
- Do not draw wave marks, motion arcs, speed lines, action streaks, afterimages, blur, smears, halos, glows, auras, floor patches, cast shadows, contact shadows, drop shadows, oval floor shadows, landing marks, or impact bursts.
- Do not include text, labels, frame numbers, visible grids, guide marks, speech bubbles, thought bubbles, UI panels, code snippets, scenery, checkerboard transparency, white backgrounds, or black backgrounds.
- Reject any pose that is cropped, overlaps another pose, crosses into a neighboring frame slot, or creates a separate disconnected component that is not attached to the character.

Layout requirements:
- Exactly 4 full-body frames, left to right, in one horizontal row.
- The attached layout guide shows the 4 frame boxes, inner safe area, and centers for this row. Follow its slot count, spacing, centering, and padding.
- Do not reproduce the layout guide itself: no visible boxes, guide lines, center marks, labels, guide colors, or guide background may appear in the output.
- Treat the image as 4 equal-width invisible 384x384 frame slots. Fill every slot: each requested slot must contain exactly one complete full-body pose.
- Spread the 4 poses evenly across the whole image width. Do not leave any requested slot blank or create large empty gaps between poses.
- Center one complete pose in each slot. No pose may cross into the neighboring slot.
- Use a perfectly flat pure green #00FF00 chroma-key background across the whole image.
- Do not use #00FF00, pure green, or chroma-adjacent colors in the character, highlights, props, shadows, or effects.
- Keep the rendering faithful to the attached reference sprite: same outline weight, same palette, same detail level — do not restyle it.
- Keep every frame self-contained with at least 38 px horizontal and 38 px vertical safe padding. No character body part should be clipped by the frame slot.
- Avoid motion blur. Use clear pose changes readable at 384x384.
- Preserve the same silhouette, face, proportions, palette, material, and props across every frame.

Output only the sprite strip image.

```

## figma-white-green-prompt

```text
Use case: identity-preserve. Make a full-body standing white cat for the same app character family. Image 1 cream full-body gives EXACT standing pose, proportions, outline weight and paw anatomy. Image 2 white avatar is the EXACT identity, face, ear colors and asymmetrical fur marking reference. Extend the avatar into the SAME full body pose as image 1. Pure warm white fur, pink inner ears, dark oval eyes; not cream or gray. All paws and tail visible. No clothes or props. Smooth crisp illustrated outlines and minimal same-reference shading, no watercolor. Centered single character occupying 75% height. Flat perfectly solid pure green #00FF00 background for deterministic sprite-gen alpha cleanup, NO checkerboard, NO shadows, NO gradient, NO floor, no green anywhere inside cat. Output only the single full-body character on green.
```

## figma-calico-green-prompt

```text
Use case: identity-preserve. Make a full-body standing calico cat for the same app character family. Image 1 cream full-body gives EXACT standing pose, proportions, outline weight and paw anatomy. Image 2 calico avatar is the EXACT identity, face, ear colors and asymmetrical fur marking reference. Extend the avatar into the SAME full body pose as image 1. Calico: cream-white face and chest/body, orange patch on viewer left forehead/ear, charcoal patch on viewer right forehead/ear, orange-and-charcoal patches on back and tail matching avatar. Keep facial markings faithfully. All paws and tail visible. No clothes or props. Smooth crisp illustrated outlines and minimal same-reference shading, no watercolor. Centered single character occupying 75% height. Flat perfectly solid pure green #00FF00 background for deterministic sprite-gen alpha cleanup, NO checkerboard, NO shadows, NO gradient, NO floor, no green anywhere inside cat. Output only the single full-body character on green.
```

## rig-head-prompt

```text
Use case: identity-preserve. This is a NON-GORY separated paper-puppet animation part of the EXACT attached cute Figma cat, NOT a new character. Match its charcoal-gray flat fur, subtle warm-gray shading and dark-brown contour precisely. Keep its smooth clean illustrated style. One isolated part only, centered on perfectly flat pure green #00FF00, no green in the part. No cast shadow, checkerboard, labels, floor, props, extra parts. Plenty of empty green padding. Extract/reconstruct ONLY THE COMPLETE HEAD from the attached cat at high resolution: both triangular ears, round cheeks, cream oval eye whites with dark pupils looking up-right, tiny nose, and whiskers all preserved exactly. No torso, legs or tail. Keep the original head shape, ear angles and asymmetrical eye shapes EXACTLY; the reference is identity truth. Close the bottom edge along the natural curved chin. The head is the entire one part. Do not make eyes bigger or add a smile.
```

## rig-torso-prompt

```text
Use case: identity-preserve. This is a NON-GORY separated paper-puppet animation part of the EXACT attached cute Figma cat, NOT a new character. Match its charcoal-gray flat fur, subtle warm-gray shading and dark-brown contour precisely. Keep its smooth clean illustrated style. One isolated part only, centered on perfectly flat pure green #00FF00, no green in the part. No cast shadow, checkerboard, labels, floor, props, extra parts. Plenty of empty green padding. Draw ONLY its small pear-shaped charcoal furry TORSO as a clean cutout puppet part. NO head, ears, face, whiskers, legs, feet, paws, tail or clothes. A short round compact bean-shaped chest/abdomen with natural shoulders, smooth curved bottom, charcoal fill and minimal matching shading, warm dark brown outside outline. It will sit BEHIND the separately placed head and paws. Keep it unadorned, no stripes, buttons or facial features.
```

## rig-front-leg-prompt

```text
Use case: identity-preserve. This is a NON-GORY separated paper-puppet animation part of the EXACT attached cute Figma cat, NOT a new character. Match its charcoal-gray flat fur, subtle warm-gray shading and dark-brown contour precisely. Keep its smooth clean illustrated style. One isolated part only, centered on perfectly flat pure green #00FF00, no green in the part. No cast shadow, checkerboard, labels, floor, props, extra parts. Plenty of empty green padding. Draw ONLY ONE full short front leg of this cat as a puppet part, from rounded hidden shoulder end down to the visible rounded paw with the exact three tiny cream claw marks from the reference. Near/front foreleg, hanging straight down with a slight natural forward curve, solid charcoal-gray short thick leg. No head, body or other paws. Aspect of part width to height approximately 0.48, the lower paw a little wider than upper leg; a soft rounded top suitable for overlapping the torso. Full leg/paw silhouette, warm dark-brown outer outline.
```

## rig-tail-prompt

```text
Use case: identity-preserve. This is a NON-GORY separated paper-puppet animation part of the EXACT attached cute Figma cat, NOT a new character. Match its charcoal-gray flat fur, subtle warm-gray shading and dark-brown contour precisely. Keep its smooth clean illustrated style. One isolated part only, centered on perfectly flat pure green #00FF00, no green in the part. No cast shadow, checkerboard, labels, floor, props, extra parts. Plenty of empty green padding. Draw ONLY the exact curled tail of the reference cat, detached as a single animation part. Tail curves up-left in a C hook, broad round upper tip, gently narrowing to root on the lower RIGHT. Preserve reference thickness, charcoal gray and dark outline. No body, ears, paws, face or second tail. This is a toy-puppet style shape, with a softly rounded root that will overlap beneath the torso.
```

## rig-head-closed-prompt

```text
Use case: precise-object-edit. Image 1 is the EDIT TARGET, a transparent cat head animation layer. Preserve the EXACT canvas dimensions, head placement, every outline, ear, whisker, fur color and every pixel outside the TWO EYES. Change ONLY eye expression: a natural complete blink with upper eyelids closed downwards, two thin gently curved dark lines in the exact former eye locations. No white eyes should remain. Neutral restful blink, not a smile, no mouth changes. Keep the original head position and size exactly identical for layered animation. Transparent background with real alpha, no solid background, no checkerboard, no shadow, no added body, text or props. This is an alternate head texture, not a redesigned illustration.
```

## rig-head-down-prompt

```text
Use case: precise-object-edit. Image 1 is the EDIT TARGET, a transparent cat head animation layer. Preserve the EXACT canvas dimensions, head placement, every outline, ear, whisker, fur color and every pixel outside the TWO EYES. Change ONLY eye expression: keep both cream eye whites exactly the same shape; move ONLY the two dark pupils down and slightly right as if looking at a book close to the paws. Pupils visibly occupy lower-right of existing eye ovals, not the top. Do not shift the eyes themselves. Keep the original head position and size exactly identical for layered animation. Transparent background with real alpha, no solid background, no checkerboard, no shadow, no added body, text or props. This is an alternate head texture, not a redesigned illustration.
```

## rig-head-closed-green-prompt

```text
Use case: background-extraction. Image 1 is the edit target. Keep this exact cat head, pose, eye expression, colors, silhouette, all whiskers, ears, and placement completely unchanged. Replace ONLY every gray checkerboard BACKGROUND area around the head with a perfectly FLAT OPAQUE pure GREEN #00FF00 chroma-key background. This is a production key plate, not a transparent image. Do NOT draw transparency grid or checkerboard anywhere. GREEN, flat and solid, edge to edge behind cat. Preserve all head details; no shadows; same canvas and same head position and size.
```

## rig-head-down-green-prompt

```text
Use case: background-extraction. Image 1 is the edit target. Keep this exact cat head, pose, eye expression, colors, silhouette, all whiskers, ears, and placement completely unchanged. Replace ONLY every gray checkerboard BACKGROUND area around the head with a perfectly FLAT OPAQUE pure GREEN #00FF00 chroma-key background. This is a production key plate, not a transparent image. Do NOT draw transparency grid or checkerboard anywhere. GREEN, flat and solid, edge to edge behind cat. Preserve all head details; no shadows; same canvas and same head position and size.
```
