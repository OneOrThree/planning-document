# 마을 아트 생성 기록

기본 제공 image_gen 사용. 기준 이미지는 Catus의 낮 섬 원화다. 실제 투명 알파를 보존했다.

## 생성 프롬프트 1 · 빈 지형

Use case: precise-object-edit. Edit target: the supplied 1536x1024 illustrated island game background. Create a completely EMPTY terrain base for placing separate game sprites. Preserve the exact camera, canvas 3:2 aspect ratio, island silhouettes and positions, ocean, shoreline and coastal rock edging, painterly outlined cozy game art style and lighting. Remove ALL trees, bushes, grass tufts, flowers, inland rocks, campfire, logs, seats, fence, dock, raft and bridge. Remove ALL winding paths and replace with flat muted light yellow-green meadow ground, with only very subtle watercolor soil texture, no distinct objects. The main island should be a broad empty buildable clearing. Also clear the small upper-left and lower-right islands. Keep offshore water and natural coastline unchanged as closely as possible. No structures, no flora objects, no fire, no characters, no text, no labels. Output only the clean empty terrain, at 1536x1024 landscape.

## 생성 프롬프트 2 · 투명 소품 시트

Use case: background-extraction / stylized-concept. Reference image is only a style and object reference. Produce ONE production game sprite atlas with REAL TRANSPARENT alpha background, landscape 1536x1024, exactly 3 columns by 2 rows of equal 512x512 cells. Six completely isolated sprites, one centered in each cell, with clear empty transparent margins of 55px on every side, never touching or overlapping neighboring cells. Cell top-left: a small cluster of olive-green grass tufts. Cell top-middle: a cluster of white daisies and tiny yellow flowers, green leaves. Cell top-right: a round small leafy olive-green bush. Cell bottom-left: one round deciduous tree, visible trunk and canopy. Cell bottom-middle: one pine tree. Cell bottom-right: one small unlit campfire stone ring with dark logs inside, NO flame or glow; flame will be animated in code. Match supplied art exactly in style: cozy storybook hand-painted game props, muted sage olive greens, warm dark outlines, watercolor texture, elevated three-quarter view. Sprites should be complete standalone objects, no terrain tiles, no ground patches, no scene background, no captions, no cell borders, no text, no checkerboard pattern baked into pixels. Tree and pine tall but inside their own cells, other plants compact. Each object's base centered horizontally. Transparent background essential.

## 부두 복원

기존 dock/layers/back-day.png와 front-day.png를 같은 크기·위치로 합성했다.

## 다리 생성 프롬프트

Create one isolated wooden footbridge sprite on REAL transparent alpha background in the exact cozy hand-painted outlined game style of the reference island. The reference is for visual style only. Short complete wooden footbridge, 8 weathered tan planks, 4 short wooden posts, simple rope handrails, viewed from elevated three-quarter angle. Bridge crosses from upper-left to lower-right, gently diagonal about 15 degrees down to the right, nearly horizontal, as in the upper-left connecting bridge of the reference. Both ends completely visible, no ground, no water, no plants, no characters, no terrain, no labels or text, no baked checkerboard. Compact wide sprite with generous transparent margin, 3:2 landscape. Needs to overlay an existing island scene.
