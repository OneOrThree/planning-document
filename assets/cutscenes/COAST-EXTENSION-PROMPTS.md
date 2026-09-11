# 넓은 해안 배경 생성 기록

사용 도구: 현재 세션의 이미지 생성. 불투명 배경이므로 cutout은 사용하지 않았다.

기준: `shore-v2.png`, `coastal-home-pier-v3.png`. 결과: `shore-extended-v1.png`, `coast-home-extended-v1.png` 각각 1086 × 1448 PNG.

원본 왼쪽을 유지한 오른쪽 확장을 요청했으나 실제 결과는 기존 부분의 지형과 색도 일부 바뀌었다. 원본 위에 오른쪽만 합성하면 구름 경계가 남아서 미채택했다. 전체 새 원화를 960 × 1280 논리 공간으로 사용하고, 부두의 발·밧줄 위치를 새 그림에 맞춰 확인한 안을 검토 49에서 채택한다. 원본은 삭제하지 않는다. 4K 또는 정확한 원본 보존 아웃페인팅으로 표시하지 않는다.

## 해안 요청

```text
Use case: precise outpainting for a 2D animated background plate. The attached image is the EXACT accepted scene. EXTEND ONLY ITS RIGHT EDGE with more of the same calm turquoise sea and sky, increasing the width by one third while preserving the height: original 941 x 1672 content anchored at the LEFT, desired new canvas approximately 1254 x 1672 (3:4 portrait). The original image must occupy the LEFT 75% of the new canvas without moving or scaling any cottage, coastline, jetty, rock, island, sun, horizon or waves. The new RIGHTMOST 25% is only open turquoise water below the same horizon, and matching blue sky / sparse ivory clouds above it. Continue the SAME horizontal wave shapes smoothly through the old right edge. At the lower right continue the same gently visible blue-green underwater stones/plants very sparsely. NO new foreground land, no additional docks, boats, rafts, cats, houses, objects, or extra sun. Preserve the exact existing low-saturation palette, original horizon at y~340/1672, crisp warm-brown illustrated outlines, clean smooth cel-shaded game art, no watercolor, no blur, no textures/noise. This is a camera overscan extension, NOT a new composition and NOT a zoom-out. Output the complete expanded image including the unchanged reference on the left. Highest available image resolution and very crisp contour quality. No border, no text, no labels.
```

## 집 앞 해안 요청

```text
Use case: precise outpainting for a 2D animated background plate. The attached image is the EXACT accepted scene. EXTEND ONLY ITS RIGHT EDGE with more of the same calm turquoise sea and sky, increasing the width by one third while preserving the height: original 941 x 1672 content anchored at the LEFT, desired new canvas approximately 1254 x 1672 (3:4 portrait). The original image must occupy the LEFT 75% of the new canvas without moving or scaling any cottage, coastline, jetty, rock, island, sun, horizon or waves. The new RIGHTMOST 25% is only open turquoise water below the same horizon, and matching blue sky / sparse ivory clouds above it. Continue the SAME horizontal wave shapes smoothly through the old right edge. At the lower right continue the same gently visible blue-green underwater stones/plants very sparsely. NO new foreground land, no additional docks, boats, rafts, cats, houses, objects, or extra sun. Preserve the exact existing low-saturation palette, original horizon at y~340/1672, crisp warm-brown illustrated outlines, clean smooth cel-shaded game art, no watercolor, no blur, no textures/noise. This is a camera overscan extension, NOT a new composition and NOT a zoom-out. Output the complete expanded image including the unchanged reference on the left. Highest available image resolution and very crisp contour quality. No border, no text, no labels.
```

