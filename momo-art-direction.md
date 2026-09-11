# 모모 — 원화와 리깅 구현 이력

## 2026-09-08: 걷기 리그와 섬 연결

사용자가 독서 리그의 책장 가림 수정을 승인한 뒤 걷는 모모를 리깅해 섬에 연결하도록 요청했다.
독서 원화 자체는 수정하지 않고, 같은 모모의 서 있는 앞·뒤 원화를 내장 `image_gen`으로 준비했다.
사용자가 지정한 `image-to-code`의 이미지 생성 → 분석 → 코드 구현 순서를 적용했다.

- 앞 원화: `assets/momo-walk-front.png`, 1254×1254 RGBA. 원본 생성 ID `exec-d83e5157-3b8e-41ef-8c29-3e8c9d2ac2f8.png`.
- 뒤 원화: `assets/momo-walk-back.png`, 1254×1254 RGBA. 원본 생성 ID `exec-ecda66ca-99e6-430d-aeec-894292eaec3f.png`.
- `*-draft.png`는 배경에 체크무늬가 구워진 중간 산출물이다. 실제 앱에서는 사용하지 않는다. 내장 이미지 도구의 배경 추출로 알파 채널을 다시 생성했다.
- 브라우저 픽셀 검증: 이미지 바깥 알파는 0, 크림색 털 내부는 253(약 99.2% 불투명). 원본 독서 에셋도 내부 알파 253이다. 직접 색상 키잉이나 수작업 SVG 재해석은 하지 않았다.
- 앞모습 관찰: 머리와 볼이 상반신을 덮음, 왼쪽 발이 원근상 위쪽, 오른쪽 발이 아래쪽, 꼬리는 오른쪽 뒤. 뒷모습은 좌측 꼬리, 어깨 아래에 독립된 양팔, 두 발 사이의 작은 간격.
- 20개 관절의 계층과 원화별 피벗·가중치를 수동 설계했다. 원화당 48×48 그리드, 2,401개 정점과 4,608개 삼각형. 다리·무릎·발목을 분리하고 반대 박자 팔 스윙과 작은 몸통·머리 보정을 연결했다.
- `momo-walk.js`의 보행 위상은 이동 거리 / 74px로 계산한다. 실제 경로 길이와 연결된 스타일화된 2D 보행이며, 물리 엔진의 완전한 접지 IK나 충돌 검사는 아니다.
- 앞·뒤 원화를 좌우 반전해 네 방향을 만든다. 반전 방향에서는 삼색 무늬도 반전된다. 연속 3D 회전이나 사방의 독립 원화가 아니다.
- 섬에서는 기존 이동 SVG를 교체하고, 모닥불 집중 시작 시 기존 독서 리그로 전환한다. 독서 리그의 페이지 가림 로직은 유지했다.

### 생성 프롬프트

앞모습은 승인된 `momo-reading-concept-v3.png`를 참조했다: 같은 삼색 고양이의 열린 헤이즐 눈·둥근 볼·작은 귀·짧은 몸 비율을 유지하고, 책과 옷 없이 두 짧은 뒷다리로 서 있는 3/4 정면. 앞발은 양옆으로 내려놓고 두 다리 사이에 작은 간격, 꼬리는 뒤쪽. 약간 내려다보는 시점과 부드러운 셀 셰이딩 유지.

뒷모습은 최종 앞모습을 참조했다: “Create a matching BACK VIEW game sprite of this exact same compact calico cat. Rotate the cat to a three-quarter rear view facing upper right, away from viewer. Same compact anatomy, markings, cream/caramel/warm charcoal palette, short legs, two separate feet, hanging arms, curved calico tail. No face on back of head, no clothing or book. Clean finely outlined soft cel-shaded illustration. Actual alpha-transparent PNG, no drawn checkerboard.”

양쪽 배경 추출 공통: “Use case: background-extraction. Asset type: transparent PNG game sprite. Extract ONLY the cat as a clean cutout with genuinely transparent alpha. Completely delete the checkerboard background artifact. Set outside-silhouette pixels to alpha 0. Output RGBA PNG, not RGB. Keep exact same cat and position unchanged. All cream fur opaque. No shadow. No drawn checkerboard.”

이하 독서 리그 이력.

## 현재 상태: v3 승인 및 메시 리깅 연결

사용자가 눈을 뜬 v3를 승인했고 `rig.html`에 리깅 구현을 요청했다. 기존 단순 SVG 캐릭터는 현재 진입점에서 사용하지 않는다.

- `assets/momo-rig-source.png`: 내장 `image_gen`으로 v3의 배경·접촉 그림자만 제거한 투명 원화. 1254×1254, 실제 알파 채널.
- 추출 프롬프트: “Remove only the cream background and ground shadow; preserve the exact approved cat identity, open eyes, pose, painted details, canvas size and placement. Genuinely transparent alpha background, no drawn checkerboard.”
- `momo-rig.js`: 원화 위에 40×40 그리드(1,681개 정점·3,200개 삼각형)를 두고 12개 관절 가중치로 변형하는 자체 WebGL 리그. 원화를 새 SVG 도형으로 다시 그리지 않았다.
- 파츠를 별도 파일로 재생성하는 대신 영역별 가중치로 연결해 움직임 사이의 빈틈을 피했다. 큰 포즈 변경보다는 작은 독서 동작을 위한 리그다. 머리 수동 회전은 ±4°로 제한했다.
- 눈 깜빡임에는 v2의 눈 주변만 마스킹해 사용한다. 평소에는 승인된 v3의 열린 눈이다.
- 책장 보조 레이어는 책등 안쪽에 고정하고, 표지 윗선을 따라 가린다. 가림 영역도 책과 같은 관절 변형을 적용한다.
- PNG 포즈와 관절·정점·가중치 JSON을 내보낼 수 있다. Spine/Rive 전용 파일이나 편집 가능한 벡터 원화가 아니다.
- 원화 비교, 수동 관절 조절, 타임라인, 동작 줄이기, WebGL 미지원 시 정지 원화 표시를 지원한다.

이 아래 내용은 원화 승인 전의 이력이다.

## 후속 수정: 눈을 뜬 v3

사용자가 v2의 눈이 감겨 있다고 지적했다. 내장 `image_gen`으로 v2를 편집해, 책을 내려다보는 올리브·헤이즐 눈동자와 동공이 보이는 표정으로 바꿨다. 나머지 비율·무늬·포즈·책·배경은 유지하도록 요청했다.

- 현재 피드백용 원화: `assets/momo-reading-concept-v3.png`
- 프롬프트: “Change only both closed crescent eyes to clearly open, softly rounded almond-shaped eyes with muted olive-hazel irises, dark pupils and a small catchlight, looking down at the book. Preserve the exact cat identity, proportions, pose, colors, book, rendering and background.”
- v2는 비교용으로 보존했다. v3 역시 이미지 검토 단계이며 리깅 코드에는 반영하지 않았다.

사용자는 직접 작성한 SVG 고양이의 시각 품질을 거절했다. 이미지를 먼저 만들고 피드백을 받은 뒤 코드화하기로 전환했다. 기존 리깅 캐릭터를 이 원화로 교체한 상태는 아니다.

- 원화: `assets/momo-reading-concept-v2.png`
- 방식: 내장 `image_gen`, 기존 `assets/village-map.png`를 세계관·모닥불 고양이의 스타일 참고로 사용. 지도에서 잘라낸 이미지가 아니라 독립적으로 재생성했다.
- 적용 스킬: `image-to-code`의 이미지 생성 → 정밀 분석 → 구현 순서. 본래 웹용 스킬이며 캐릭터 자동 벡터화·자동 리깅 도구는 아니다.

## 원화 관찰

- 살짝 위에서 내려다보는 3/4 시점. 몸과 책이 같은 방향으로 기울어 마을 투영과 연결된다.
- 목이 거의 보이지 않고 볼이 어깨에 포개진다. 이전 SVG의 큰 머리·가느다란 목 조합과 다르다.
- 앞발은 책 가장자리를 감싸며, 종이 단면·표지 두께·곡면이 구분된다. 발바닥 두 개와 꼬리가 앉은 무게감을 만든다.
- 차분히 내려간 눈, 작은 코와 입, 비대칭 삼색 무늬. 크림 바탕·캐러멜·짙은 갈색·올리브 책·황토 리본.
- 선 두께가 부위별로 다르며 접촉부와 아래쪽에 음영이 있다. 일부 붓 질감은 남아 있어 벡터풍 수준은 사용자 확인이 필요하다.

## 구현 전 원칙

원화 피드백부터 받는다. 원화를 단순 SVG 도형으로 다시 해석해서 외형을 잃지 않는다. 승인된 원화의 머리·귀·몸통·양팔·책·꼬리를 개별 이미지 레이어로 준비하고, 가려져 있던 관절 안쪽은 보완한 뒤 기존 리그 엔진과의 연결 방식을 검토한다. 파츠 추출·메시 제작·포맷 변환은 아직 수행하지 않았다.

## 생성 프롬프트 요지

Standalone premium cozy-game calico cat reading a forest-green hardback; gentle three-quarter top-down view, compact pear-shaped seated body, broad cheeky head tucked into shoulders, small peaceful downcast eyes, paws cupping an open book, curled tail, cream/caramel/charcoal palette, fine tapered warm outlines and restrained cel shading. Plain ivory background, one full-body character, no UI or text. Use village campfire cats only as world/style reference. Prioritize appealing character design over simplifying for code.
