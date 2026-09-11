# 보행 접지 국소 관절 실험 프롬프트

세션 이미지 생성으로 기준 얼굴·몸체를 유지한 파츠를 만들었다. 검토 40에서 v6 접합부 합성 방식과 발 접지를 기본 시연에 채택했다. 이전 8자세는 `?walk=pose`로 비교한다. v07 MP4까지는 이전 보행이다. 작동 중인 sprite-gen cutout으로 실제 알파를 분리했다.

## walk-leg-soft-root-v2.png

몸통과 겹치는 다리 위쪽의 진한 윤곽선을 덜어낸 원화. 같은 위치·발 모양을 유지한다. 가까운 두 다리에 쓰며 몸체와 겹치는 위쪽은 런타임 마스크로 부드럽게 연결한다.

Edit this EXACT isolated charcoal kitten foreleg layer for cleaner cutout-puppet attachment. Keep the same one leg silhouette, paw, two ivory claws, scale, position and 1254 x 1254 canvas. The leg is between about x=540..755 and y=790..1126. Change ONLY the attachment area in its upper half: remove the dark brown outer stroke along BOTH SIDES above y=945 and replace that stroke with the same charcoal-gray fur color. The top edge must also have NO dark outline. The opaque gray top can overlap the identically colored torso without a visible black seam. From y=945 downward, gently resume the original warm dark line toward the ankle and paw, and preserve the bottom foot and claws EXACTLY. Do not add a body, head, joints, skeleton or another limb. Do not move, shrink or enlarge the leg. One isolated solid opaque leg layer; uniform pure #00FF00 chroma green everywhere outside it. No checkerboard, no labels, no shadows, no transparency gradients in the fur.

## walk-body-soft-bottom-v3.png

v4 보행 비교에서 배 아래 윤곽선이 옷자락처럼 보여 제거한 원화. 머리·꼬리·몸체 위치를 유지하며 검토 40에서 채택했다. 그림 원본을 변형 저장하지 않고 합성용 다리 마스크를 런타임에 만든다.

Edit this EXACT isolated kitten puppet body layer. Keep the head, face, eyes, ears, whiskers, tail, upper body, scale, position and entire 1254x1254 registration unchanged. This layer will overlap three moving legs. The current rounded bottom of the torso has a very dark thick curved outline that looks like the hem of a shirt when composited over legs. Remove ONLY that bottom outline along the belly from approximately x=400,y=910 through x=680,y=967 to x=920,y=900. Replace the dark stroke with the same charcoal-gray fur as the immediately adjacent belly; keep the same rounded opaque silhouette, not transparent holes. Keep the outline on both upper sides, head, and tail exactly as it is. The low belly boundary should be a crisp clean charcoal-colored edge without a dark brown hem line, while all other outer edges remain normally outlined. No legs, no paws, no props, no ground shadow, no new marks. This is a cutout animation technical layer; do not redesign, resize or move anything. Flat pure #00FF00 green background outside the silhouette, no checkerboard, no gradients in the background, no text.

## walk-body-base-v1

몸체가 너무 길게 남아 미채택. 생성 임시본만 보존한다.

Create a clean walking-puppet BASE LAYER from this exact illustrated kitten. Preserve its head, face, eyes looking up-right, ears, neck, torso and tail exactly at the same coordinates, size and colors on the same 1254x1254 canvas. Remove ONLY the three visible lower legs and paws, from the bottom of the belly downward. Complete the torso behind the legs as a small softly rounded gray belly ending around y=970; maintain the original narrow torso width and chest silhouette, do NOT inflate or enlarge the body. There must be no paws, claws or long leg stumps on this base layer. This is a technical layer of a friendly cutout animation puppet, not an injured character; its three moving legs will be composited separately. Keep the entire existing head and tail unchanged. Warm dark outline and charcoal gray fur exactly match the reference. Flat solid #00FF00 background outside the silhouette, no shadow, no guide marks, no text, no checkerboard, only one base layer.

## walk-body-base-v2

짧은 몸체로 수정한 비교용 파츠.

Edit only the LOWER BELLY of this puppet base. The current base hangs too low, ending near y=1100. Shorten the lower torso substantially: raise its rounded bottom contour by approximately 160 pixels, so the very bottom of the belly is at y=945 on the same 1254 x 1254 canvas. Fill all of the removed low belly area with the same pure green background. Leave the head, eyes, ears, entire tail, neck and upper chest exactly unchanged in size and position. The torso below the head should now be a compact short bean-shaped belly, NOT a tall egg and NOT a long oval. Keep the side under the tail starting around (400,835), curve gently across a shallow belly to (870,940), then into the right chest; its lowest boundary must remain clearly ABOVE the former planted-foot line. There are still no legs or paws because three moving leg layers will be added below it. Warm dark outline, matching charcoal-gray colors. Do not move the cat upward or shrink the entire cat. Only remove the excess lower body. One base layer, no props, no text, no guide marks, flat #00FF00 outside.

## walk-front-paw-layer-v1

예상보다 긴 발목이 포함된 결과. 실제 위·아래 등록점을 확인해 다리 레이어 실험에 사용한다.

Create ONLY one isolated lower front paw layer from this exact black kitten, suitable for a cutout animation rig. Extract the MIDDLE planted foot (the rounded gray paw near x=655,y=1090 with two pale ivory claw marks). Keep the same original charcoal fur, warm dark outline, gentle shading, the two claw shapes, width and frontal 3/4 angle. Include a short broad gray ankle overlap tab extending upward to about y=945, with a flat unoutlined open top that can blend into a moving lower leg. Preserve this foot's exact original scale and location on the SAME 1254 x 1254 canvas; its bottom stays near y=1140 and its width about 175 pixels. Remove absolutely everything else: no head, no body, no other feet, no tail. One opaque paw and short ankle tab in the lower middle of the square, all other pixels flat pure #00FF00 green. No labels, no shadows, no checkerboard, no panel sheet. Do not enlarge or center the foot.
