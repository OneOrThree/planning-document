# 정지 자세 눈깜빡임 생성 기록

세션 내장 이미지 생성 → 정상 동작하던 sprite-gen cutout → 단색 검사판 확인. 원화의 눈 이외 신체 위치를 유지하는 별도 PNG다. 검토 중이며 아틀라스 추출물·관절 리깅이라고 표시하지 않는다.

## neutral-blink-half-v1

```text
Use case: identity-preserve. Image 1 is the exact edit target, the approved full-body cat. Change ONLY the eyes to the half-closed phase of one calm blink: both UPPER eyelids move DOWN halfway over the eyeballs, following the eye's own oval outline. Bottom edges of eyes stay exactly fixed. Upper half of each eye is covered by exactly matching charcoal facial fur; visible lower half still shows white and the bottom of its pupil. No smile, anger, eyelashes or human eyelids. Keep exact head, face width, nose, ears, whiskers, torso, all feet, tail, colors, linework, shading, size and registration of this same 1254-square image. Do not tilt or shift head. One full-body cat only. Use a perfectly flat opaque pure green #00FF00 background, no shadow, checkerboard, text or guide. Precise animation texture, not a new character.
```

## neutral-blink-closed-v1

```text
Use case: identity-preserve. Image 1 is the exact edit target, the approved half-blinking full-body cat. Finish this blink by bringing ONLY the upper eyelids further DOWN until both eyes are fully closed. Replace remaining white and pupils with the exact adjacent charcoal facial fur. Closed eyes are two short soft warm-dark curved horizontal lines, close to the LOWER edge of each original eye (viewer-left center around x=705,y=642; viewer-right center around x=925,y=585). No white or pupils remain visible. A tiny calm blink, not smiling or sleeping, no eyelashes. Keep absolutely every other detail unchanged: exact head and body dimensions, face, ears, whiskers, nose, tail, all planted paws, outline, shading, colors, 1254-square canvas registration. Do not move or reshape head. Perfectly flat opaque pure green #00FF00 backdrop. No ground, shadow, checkerboard, label or prop. One same full-body cat.
```
