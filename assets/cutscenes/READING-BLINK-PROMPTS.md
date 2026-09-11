# 책을 보는 눈 깜빡임 원화

세션 imagegen으로 look-reach-v1.png를 참조해 두 장을 편집 생성했다. Figma 원본 자체가 아닌 승인된 검정 고양이 파생 자세다. 생성본 1254×1254의 배경은 실제 투명이 아니며, 체크무늬를 투명 배경으로 주장하지 않는다. 런타임에서는 원래 이미지 위에 두 눈 내부만 마스크 합성한다. 몸·알파·귀·수염·코·손 위치는 원본을 유지한다.

새 반감김 중간톤 [78,72,72]·선 [47,1,0], 감김 중간톤 [82,75,75]·선 [48,1,0]을 측정해 기존 팔레트 기준에 맞춘다. 원본 PNG는 보존한다.

## 반감김 프롬프트

Use case: precise-object-edit. Asset type: one in-between blink keyframe for a 2D cat animation. Input image 1 is the edit target: the approved charcoal black cat, right forepaw reaching down. Change ONLY the two eyes to HALF-CLOSED during a normal quick blink. Upper eyelids descend DOWN over the top 55 percent of each white eye; show the lower 45 percent of the white and the lower part of its pupil in the exact same gaze direction. Use identical charcoal fur on the lowered upper eyelids and a thin dark lid edge. Not tired, not angry, no eyebrows. Keep exactly the same nose, whiskers, head angle and silhouette, ears, body, paw, tail, outlines, color, scale, foot position and square framing. Do not redraw the cat's identity. No props, text, shadows, floor or decoration. Genuinely transparent background. This is a precise one-frame eye edit of image 1, not a new pose.

## 감김 프롬프트

Use case: precise-object-edit. Asset type: one animation blink keyframe for a 2D cat game, NOT a character redesign. Input image 1 is the edit target, the approved black cat reaching one forepaw toward a book. Change ONLY its two eyes to a fully closed, relaxed blink: upper lids travel DOWN to the lower eyelid, forming two thin dark shallow curved closed-lid lines at the lower third of each original eye. Cover the original white eye areas with the identical charcoal fur color and shading. Keep absolutely the same head angle, head silhouette, nose, whiskers, ears, tail, body, raised paw, foot positions, line weight, placement, scale and square canvas. Do not draw a smile, eyebrows, extra marks, text, props or a background. Both eyes fully closed. The rest should be a pixel-close match to the reference. Preserve the genuinely transparent background and full body, same framing.

