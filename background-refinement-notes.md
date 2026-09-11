# 내장 imagegen 배경 선명도 보강 시안

## 결과와 한계

내장 imagegen을 사용했다. 별도 API/CLI나 API 키는 사용하지 않았다. 목표 크기 3072 × 2048을 프롬프트로 요청했지만 실제 결과는 **1536 × 1024**이다. 따라서 4K/고해상도 업스케일 완료가 아니라, 같은 픽셀 크기에서 잎사귀·지붕·목재·물결의 형태를 정리한 선명도 비교 시안이다. 극단적인 확대에서 캐릭터와 배경의 픽셀 밀도 차이는 남는다.

- 새 파일: assets/village-map-cel-v3.png
- 원본 유지: assets/village-map-ocean-v2.png
- 기본 배경으로 적용: https://oneorthree.github.io/planning-document/mobile.html
- 이전 원본 비교: https://oneorthree.github.io/planning-document/mobile.html?background=original
- 확대 비교: https://oneorthree.github.io/planning-document/mobile.html?screen=fo2&orientation=landscape&background=refined

사용자 요청으로 보강본을 전체 기본 배경에 반영했다. 별도 쿼리 없이 새 배경이 보이며, background=original로 들어갈 때만 이전 원본을 비교한다. 마을/축소 지도/건물 썸네일/상점/입항은 village-background.js에서 고른 같은 자산을 사용한다. 라우트 이동과 회전, iframe 새로고침에도 선택을 유지한다. 캐릭터/가구 원화, 리깅, 걷기 경로 및 1536 × 1024 논리 좌표계는 변경하지 않았다.

## 확인

같은 레티나 뷰포트, 같은 배율로 비교: screenshots/background-original-focus.png / screenshots/background-refined-focus.png.

주요 7개 건물 영역의 명도 정규화 상관 비교(4px 간격 샘플, ±8px를 2px 간격으로 탐색)에서 최적 평행 이동은 모두 dx=0, dy=0, 상관값 0.961~0.977이었다. 이는 큰 위치 이탈이 없다는 보조 검증이지 픽셀 단위의 완전 일치를 보증하지 않는다. 전체 원화와 실제 집중 화면도 직접 시각 확인했다.

## 내장 도구 최종 프롬프트

Use case: style-transfer.
Edit target: the attached approved village background. This is a fidelity upgrade, NOT a new map.
Produce the largest supported native 3:2 raster output; target 3072 × 2048 if supported. Improve drawing clarity even if the output pixel dimensions cannot increase.
Preserve EXACT geometry and framing: island silhouette, coastline, all winding paths, seven landmark positions and proportions, stepping stones, fire pit with the two benches, every building roof silhouette, pier and moored sailboat. No camera change, no crop, no added or removed objects, no extra grass or flowers in empty lawn, no cats/characters/people/text/UI.
Art direction: exceptionally clean vector-like 2.5D cel illustration. Replace soft blended edges with carefully resolved shapes. Rooftop tiles must have distinct restrained joints; window frames, door edges and fence posts must be straight and precise; stone steps and shoreline rocks use controlled planar shading; foliage uses readable scalloped clusters, not a blur of tiny leaves. Small flowers and grass are deliberate, economical shapes. Water has calm broad turquoise planes and a few fine clean white ripples, not dense painterly texture.
COLOR IS AN INVARIANT: match the source's muted yellow-green foliage, warm cream walls, softened terracotta, subdued blue-green water. Do not make this more saturated, darker, glossier or more contrasty. Shadows remain soft, edges crisp; no black tracing, no sharpen halos, no watercolor fuzz, no photorealism, no noise. Maintain the warm gentle impression while giving the BACKGROUND the same intentional crisp craftsmanship as a carefully cut-out game prop. Return only the complete edge-to-edge background.
