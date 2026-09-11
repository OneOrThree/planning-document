# 덮개를 접는 소품 후보

`raft-cloth-folded-v1.png`는 `raft-cloth-v2.png`와 `shore-extended-v1.png`를 참고해 세션 이미지 생성으로 만든 파생본이다. sprite-gen은 정상 작동하는 `cutout --key green --white-check` 단계만 사용했다. 생성 준비 오류는 재시도하지 않았다.

1254 × 1254 RGBA, 알파 0 비율 78.5%. 원본과 청록·마젠타·노랑 검사판을 모두 확인했다. 실제 사용 영역은 x150/y355/w960/h575로 결과에 맞춰 등록했다. v14에는 없으며 검토 54부터 Canvas에 채택한다.

원래 천을 두 방향으로 접는 2D 격자 변형 뒤 이 에셋으로 연결한다. 부두에 옮기는 v1~v2 실험은 고양이 발 앞을 지나 미채택했다. 최종 v4는 뗏목 모서리에 남기며 캐릭터·책·가방과 자리를 분리한다. 실제 천 물리나 양손 접힘 리깅이라고 설명하지 않는다.

## 생성 프롬프트

Create ONE isolated game-prop sprite of the exact blue-gray protective cloth from reference 1, now FOLDED into a small compact fabric bundle to be set down on a wooden pier. Same desaturated slate blue-gray color, subtle warm brown thin outline, clean cozy 2D illustrated game art matching reference 2. The cloth is folded over itself twice, forming a low softly rectangular stack with two or three visible layered edges and one softly drooping corner. It must read as the SAME fabric folded, not a pillow, bag, book, tray, crumpled ball, or rolled sleeping bag. Elevated three-quarter camera angle, top face visible with front edge angled gently upward to the right, same isometric projection as the referenced cloth. Restrained broad smooth shading, a few carefully drawn folds, crisp cel-like curves, no noisy woven texture, no watercolor, no photorealism. Only ONE folded cloth, NO pier, no boat, no raft, no cat, no rope, no other props. Center it around x620 y720 on a square 1254x1254 canvas, overall object spans approximately x280..980 y460..900, wide low silhouette. Entire background is uniform PURE #00FF00 chroma green, absolutely no shadows cast onto green, no checkerboard, no text, no label. Preserve generous margins for alpha separation.
