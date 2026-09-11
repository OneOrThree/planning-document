# 뗏목 접촉 물결 후보

2026-09-12. 세션 이미지 생성 → 작동하는 sprite-gen `cutout --key green --white-check`만 사용. sprite-gen 생성 준비 단계의 이전 오류는 재시도하지 않았다.

## raft-water-rim-v1.png

기준: `raft-deck-v3.png`, `shore-extended-v1.png`. 생성 원본 1536 × 1024, 최종 RGBA 동일 크기. 알파 0 비율 98.88%. 원본과 마젠타·청록·노랑 검사판을 모두 확인했다.

상태: 검토 51에서 채택. v13에는 없으며 이후 Canvas에 반영했다. 실제 생성 위치가 요청 좌표와 달라 첫 배치가 너무 낮았다. 최종 등록은 `translate(0,width*.055)`, `drawImage(...,-width*.77,-width*.50,width*1.536,width*1.024)`이며 갑판 뒤에 먼저 그린다. 알파는 0.32~0.44, 주기 크기 변화는 ±1.6%다.

### 생성 프롬프트

Create ONE isolated subtle WATER-CONTACT RIPPLE game sprite matching the clean 2D illustrated art of the references. Reference 1 is the exact wooden raft footprint and camera angle. Reference 2 is the exact sea art direction and colors. Draw ONLY a few thin broken pale ivory/cream water ripple curves following just outside the lower front and side edges of the raft's diamond-shaped footprint. NO raft, NO wood, NO rope, NO cat, NO shadow, NO solid water disc or filled water patch. The absent raft's footprint should remain entirely background green. Think tiny gentle wavelets where a small wooden raft touches calm turquoise sea, not a fast boat wake: quiet, delicate, soft tapered ends, 3-5 irregular broken arcs, crisp smooth cel-like shapes with subtle pale cool aqua underside. NO dark outlines, no thick white foam, no bubbles, no spray, no dramatic waves, no photorealism, no watercolor. Same exact 1536 x 1024 landscape framing as reference 1: invisible raft footprint spans x270..1270 y280..735. Ripples should sit at the sides and FRONT just outside x270..1270 y430..770, with the leading/front contour matching the slanted lower edge from x550,y740 to x1250,y550. All other space is UNIFORM PURE #00FF00 green background for exact chroma cutout, including between each ripple. Keep all ripple lines entirely inside the canvas with generous margin. High-quality clean game asset with transparent-style separation but actual flat chroma green, no checkerboard, no text, no labels.
