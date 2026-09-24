# 모바일 베젤 미리보기

- 기본 진입: https://oneorthree.github.io/planning-document/mobile.html
- 가로 마을: https://oneorthree.github.io/planning-document/mobile.html?screen=plaza&orientation=landscape
- 가로 집중: https://oneorthree.github.io/planning-document/mobile.html?screen=fo2&orientation=landscape
- 가로 섬 꾸미기: https://oneorthree.github.io/planning-document/mobile.html?screen=pr3&orientation=landscape

## 범위와 동작

기존 앱을 하나의 iframe에 실행한다. 베젤·카메라·하드웨어 버튼·상태 표시줄·홈 인디케이터는 CSS/HTML이며, 내부는 캡처 이미지가 아닌 실제 동작하는 앱이다.

세로 화면은 390 × 844 CSS px. 상태 표시줄 50px, 홈 영역 24px를 제외한 앱 콘텐츠 뷰포트는 390 × 770이다. 가로는 844 × 390 전체를 풍경으로 채우고 카메라와 홈 인디케이터를 피해서 조작부를 배치한다. 실제 iOS safe-area나 기기 렌더링 성능을 검증하는 시뮬레이터는 아니다.

가로 지원: 마을(plaza), 다른 섬 구경(hb3), 집중 장면(fo2), 섬 꾸미기(pr3). 작성·상세·온보딩·잠금화면은 세로. 지원 화면으로 돌아가면 마지막으로 고른 방향을 복원한다. 회전 때 src를 바꾸지 않아 세션 시작 시각, 선택 상품, 배치 자리, 입력 상태가 유지된다. 화면 목록 또는 역할을 직접 바꾸는 것은 새로운 임시 시연이며 명시적으로 안내한다. 실제 사용자 저장소와 분리된 preview=1을 사용한다.

작은 브라우저에서는 기기 전체를 축소해 보여준다. 확장 아이콘은 100% CSS 크기와 화면 맞춤을 전환한다. 전체 35개 화면·9개 보조 시트는 드롭다운에서 선택하며 앱 내부 이동은 postMessage의 origin/source를 확인해 상위 화면 이름과 URL에 동기화한다.

가로 전용 CSS는 mobile-device.css의 .mobile-device 및 짧은 높이 조건으로 제한했다. village.js의 카메라 변경 역시 해당 휴대폰 모드에서만 적용한다. 상점은 같은 미리보기·상품 노드를 래퍼로 묶어 세로에서는 기존 흐름, 가로에서는 2열로 배치한다. 기존 지도 자산이나 마을 모듈 구조는 교체하지 않았다.

## 이미지에서 코드로 옮긴 기준

image-to-code 스킬에 따라 내장 이미지 생성 도구로 세로 베젤 전체 구성 1장과 가로 상세 1장을 먼저 생성하고 확인했다. 공통 기준은 따뜻한 오프화이트 배경, 어두운 흑연색 얇은 테두리, 녹색 방향 선택 버튼, 상단의 작은 도구줄, 기기 중심의 여백이다. 폰이 유일한 주 시각 요소이며 실제 앱 화면을 재생성 이미지로 대체하지 않았다.

레퍼런스(앱이 읽는 이미지가 아니라 디자인 근거):

- assets/ia-references/mobile-bezel-portrait-v1.png
- assets/ia-references/mobile-bezel-landscape-v1.png

내장 도구 사용, CLI/API 대체 경로 미사용. 최종 생성 프롬프트는 아래에 원문으로 보관한다.

### 세로 레퍼런스 프롬프트

Use case: ui-mockup. Create one crisp 1536x1024 high-fidelity desktop browser design reference for a dedicated Korean mobile app preview page, not a marketing site. Input image is a reference for the EXISTING ACTUAL app screen: preserve its lovely low-saturation cel illustrated village, same buildings and cat, and app UI; do not redesign its world. Main visual: ONE front-facing realistically proportioned modern portrait phone, dark graphite thin machined bezel, subtle metallic rim, hardware side buttons, black camera island, soft grounded shadow. Phone dominates available height, centered on a warm off-white studio backdrop #f1f0e9. Screen shows referenced app with a slim safe status strip above it and home indicator below. Keep complete phone and all controls above fold. At top a very restrained horizontal toolbar: left small Korean brand "Catus" then "모바일 미리보기"; right text link "전체 화면 목록 ↗". Beneath that top toolbar, a compact centered flat control row with dropdown "마을", connected two orientation controls "세로" (selected sage) and "가로", and separate quiet expand icon. No huge text or dashboard. Beneath phone, one line "마을 · 건물을 누르고 길을 따라 걸어보세요" and smaller subdued "390 × 844 · 화면 맞춤". Airy calm, open flat layout no enclosing cards, precise large enough controls, soft warm-gray typography with muted forest accent, clean system Korean sans serif. Faithful to an implementation in CSS device frame containing interactive iframe. Only one device, no collage, no extra phones, no decorative chips or gratuitous copy.

### 가로 레퍼런스 프롬프트

Use case: ui-mockup. Standalone LANDSCAPE orientation detail reference for same Korean app mobile preview studio as input 1. Input 1 is visual design-language reference, input 2 is existing actual app village world reference. Create one large front-facing HORIZONTAL phone (844 wide x390 tall screen ratio), black graphite slim bezel, small camera island on left safe gutter, home indicator bottom. Warm offwhite open backdrop. Same restrained toolbar "Catus | 모바일 미리보기", upper right "전체 화면 목록 ↗", centered dropdown "마을", orientation toggle "세로 / 가로" with 가로 selected sage. Phone fill 80% canvas width. Actual cel shaded island with ocean in wide landscape viewport, village prominent large enough for buildings to tap. Compact cream island name top left, two small icons top right, no bottom giant navbar; a quiet horizontal floating bottom dock with 4 village destinations plus a green "집중 시작" button. Small "섬 전체" button bottom left. One line belowphone "마을을 넓게 둘러보세요". Clean precise usable design, generous negative space, no new world art style, no extra phones, no other sections. 1536x1024 image.

## 검증

- node verify-mobile-preview.cjs: 68개 검사. 44개 내부 화면, 회전 중 상태 유지, 실제 구매·배치, 세로 자동 복귀, 호스트 1280/390/320px, 100% 크기, URL 기본값, 그룹원 모드, iframe 새로고침.
- node verify-world-polish.cjs: 34개 기존 마을 개선 회귀 검사 통과.
- node verify-ia-screens.cjs: 기존 320/390/768px 화면 조합 132개, 실패 0. 상점 래퍼 추가 후 문서·내부 가로 넘침, 빈 버튼, 라우트, 런타임 오류 확인.
- 일반 모션 설정에서도 출항 중 세로→가로 회전 후 같은 휴식 세션이 정착하는 것을 확인했다. 공부 착석도 가로에서 확인했다. screenshots/mobile-rest.png, screenshots/mobile-study.png.
- 실제 동작 캡처: screenshots/mobile-portrait.png, mobile-landscape.png, mobile-focus.png, mobile-shop.png, mobile-placed.png. 생성 이미지는 이 캡처와 구분해 별도 저장한다.
