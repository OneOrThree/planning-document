# 가방 파츠 생성 · 세션 이미지 생성

검토 47 이후 네 레이어를 시연 기본으로 채택했다. 생성 원본과 마젠타 검사판에서 실제 알파·외곽선을 확인했고, 9편의 준비·걷기·갑판 정리 및 두 연속 프레임 묶음을 확인했다. `cutscene-renderer.js`의 `satchel()`이 몸체/앞면 가림/덮개 회전/손잡이를 합성한다. 가방에만 런타임 `saturate(.68)`을 적용하며 원본 PNG는 바꾸지 않는다. 손잡이 생성물이 요청한 위치·크기를 지키지 못해 독립 등록점을 사용한다. 완성형 천 시뮬레이션이나 전신 리깅이 아니다.

## satchel-flap-back-layer-v1.png

Make the BACK/underside animation surface of this exact isolated canvas satchel flap. Preserve this 1254x1254 canvas, exact flap position, silhouette, scale, sloping top edge and overall sand-tan color. REMOVE the brass button completely and the decorative front seam stitches. The entire flap is now its plain, slightly darker khaki-tan cloth underside, smooth subtle fabric shading, same dark brown outer edge. No metal, no button imprint, no pocket, no hand, no extra objects. Do not move or recenter the component. Keep all outside areas perfectly uniform #00FF00 green, no shadow on green, no checkerboard. It will be animated as the reverse of the same hinge flap, so identity and silhouette must match.

## satchel-base-layer-v1.png

Produce ONE layered-animation component of this EXACT open tan canvas satchel. Keep the same 1254x1254 square framing, body silhouette x~280..990 y~440..980, tan colors, dark brown outline, stitching, rounded right-side thickness and dark inner opening. REMOVE ONLY the arched carrying handle and its stitched attachment tabs completely. Where those handle tabs were, reconstruct the clean back upper rim of the same bag. Keep the bag OPEN, plain front face, NO front flap and no contents. Do not shift, resize, rotate or redesign the bag. The result is only the handleless open bag body, positioned exactly like this reference for animation registration. No extra pieces, no ground shadow, no labels. Replace all transparent/outside areas with uniform pure #00FF00 chroma green.

## satchel-flap-layer-v1.png

Produce ONLY the front envelope flap of this EXACT tan canvas satchel as an isolated animation layer. Preserve the original 1254x1254 square framing and EXACT original position of the flap: roughly x285..938 y~445..810, top edge slants slightly down to the right, rounded lower corners and downward curved envelope point near x580,y790. Keep the same soft sand-tan fabric colors, brown outline, seam stitching, and antique brass button near x565,y738. REMOVE the arched handle including its stitched tabs and reconstruct clean uninterrupted flap cloth beneath it. Remove all remaining bag body, interior, side wall and any other objects, leaving ONLY this closed flap with its button. Do NOT center or enlarge the isolated piece; exact unchanged original position and scale for compositing. Use uniform pure #00FF00 green everywhere outside the flap, no shadows on green, no text, no border, no checkerboard.

## satchel-handle-layer-v1.png

Produce ONLY the arched carry handle of this EXACT tan canvas satchel as an isolated animation layer. Same 1254x1254 canvas and preserve EXACT handle position, proportions and perspective: roughly x420..845 y275..505, arched top at y278, left and right stitched rectangular attachment tabs around y435..505. Keep original sand-tan fabric shading, brown outlines, seam stitches and X stitches on the attachment tabs. REMOVE the entire bag body, flap, button and all other objects. Background must be flat uniform pure #00FF00 green, including the hole inside the arch. No cast shadow onto green, no labels, no checkerboard. Do not center, resize, rotate, or redesign the handle. This is a same-position extraction layer for animation.
