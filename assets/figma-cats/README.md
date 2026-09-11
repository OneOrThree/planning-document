# 현재 고양이 원본

2026-09-12 사용자 지정. 새 작업에는 이전에 제작한 모모·강아지·리트리버·카피바라·래서판다 그림을 사용하지 않는다. 역사적 시연 파일의 일괄 삭제나 전면 교체를 뜻하지 않는다.

원본: [Figma / new-design](https://www.figma.com/design/XzlUvx1LGl5OZt6wHr2WRg/new-design?node-id=47-2). Figma의 원본 이미지 다운로드로 확보했으며, 스크린샷 크롭·재생성·색상 변경을 하지 않았다. 임시 다운로드 URL은 보관하지 않는다.

| 종류 | 얼굴 노드 | 전신 출처 | 파일 |
| --- | --- | --- | --- |
| 검정 | 66:92 | 71:108 그룹원 달성률 | black-avatar.png / black-standing.png |
| 치즈 | 66:97 | 71:108 그룹원 달성률 | cheese-avatar.png / cheese-standing.png |
| 크림 | 66:102 | 71:108 그룹원 달성률 | cream-avatar.png / cream-standing.png |
| 회색 | 66:107 | 71:108 그룹원 달성률 | gray-avatar.png / gray-standing.png |
| 흰색 | 66:112 | 사용자 요청 생성 파생본 | white-avatar.png / white-standing-generated.png |
| 삼색 | 66:117 | 사용자 요청 생성 파생본 | calico-avatar.png / calico-standing-generated.png |

얼굴 원본은 128 × 128, 전신 원본 네 종은 220 × 220 RGBA PNG다. 이는 벡터나 관절 분리 원본이 아니다. 리깅·확대 품질을 원본 이상이라고 표시하지 않는다.

흰색·삼색 전신은 2026-09-12 사용자 요청으로 현재 세션의 내장 이미지 생성 도구에서 제작했다. 각 얼굴 원본이 색·얼굴 기준, 크림 전신 원본이 체형·자세 기준이다. 생성물의 녹색 배경은 sprite-gen 2.1.0 `cutout --key green`으로 분리했다. 출력은 1254 × 1254 RGBA이며 투명 비율은 흰색 64.6%, 삼색 63.65%다. 청록·자홍 배경 합성에서 얼굴·발·꼬리와 내부 여백을 확인했다. 피그마에서 확보한 전신 원본으로 소개하지 않는다.

목록과 소비 경로: 루트의 `figma-cats.js`. 육안 확인: `figma-cats.html`.
