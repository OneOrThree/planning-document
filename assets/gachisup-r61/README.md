# 같이숲 R61 전체 에셋

2026-09-19 기준 원본 작업 폴더 `gachisup-R61-assets/assets/`의 표시 가능한 에셋 315개와 딸기 소다 UI 킷 기본을 공개한다. Jira: GROMO-1887, GROMO-1833, GROMO-1843, GROMO-1920

- 첫 화면은 PNG 305개, SVG 4개, WAV 3개, TTF 3개를 모두 펼친다. 파일명 기준 밤 에셋은 24개다.
- 기존 104개 목록은 앱 화면에서 실제로 사용된 구현 증거였고, 이제 첫 화면의 전체 디자인 에셋 목록과 구분한다.
- 폴더 구조는 원본 작업 폴더 `gachisup-R61-assets/assets/`와 같다. 경로 앞부분만 `assets/gachisup-r61/`로 바뀐다.
- 공개 파일은 원본을 그대로 복사했다. 크기·색·투명도·음질을 바꾸지 않았고 첫 화면의 다운로드 버튼도 이 원본을 가리킨다.
- 사이트 첫 화면(디자인 작업실, 저장소 루트 `index.html`)에서 카테고리와 낮·밤으로 필터링할 수 있다.
- 생성 원본과 프롬프트는 원본 작업 폴더의 `_source/`에 있고 이 저장소에는 올리지 않았다.

## 첫 화면 전체 에셋 (315개)

| 폴더 | 개수 | 내용 |
| --- | --- | --- |
| `characters/` | 224 | 고양이 6색의 자세·프레임·아틀라스, 몽돌·강아지·앵무새·팰리컨 NPC |
| `backgrounds/` | 28 | 낚시섬과 마을섬의 기본·성장 단계 낮/밤 |
| `buildings/` | 10 | 건물 7채와 마을회관·도서관 실내 |
| `boats/` | 12 | 뗏목 낮/밤과 항해·앞뒤 레이어 |
| `props/` | 18 | 등불·모닥불·부두·낚시·휴식 소품 |
| `effects/` | 1 | 따뜻한 빛 효과 |
| `ui/` | 16 | 상징 스티커형 집중 이모티콘 5종·아이콘·퀘스트 보드 |
| `audio/` | 3 | 모닥불·숲바람·파도 WAV |
| `fonts/` | 3 | 고운돋움 기본·게시판·마을회관 TTF |

## 물고기 에셋 (`props/fishing/`) · GROMO-1920

- 기본 재화 물고기는 `fish.png`, 반짝이는 황금 물고기는 `fish-gold.png`다.
- 집중 중 고양이 옆 물고기 더미는 같은 1024×1024 투명 캔버스와 하단 기준선을 쓴다.
- 1단계 `catch/single.png`: 집중 1~59분, 바구니 없이 물고기 한 마리.
- 2단계 `catch/pile-small.png`: 집중 60~119분, 얕은 바구니에 세 마리.
- 3단계 `catch/pile-medium.png`: 집중 120~239분, 바구니에 여섯 마리.
- 4단계 `catch/pile-large.png`: 집중 240분 이상, 물고기가 바구니 위와 양옆으로 넘치는 최종 더미.
- 실제 앱 적용 캡처: [`focus-catch-stages.png`](../../screenshots/GROMO-1920/focus-catch-stages.png), [`focus-result.png`](../../screenshots/GROMO-1920/focus-result.png).

## UI 킷 · 딸기 소다 기본 (`ui-kit/`)

시작 페이지는 `ui-kit/foundations/index.html`이다.

- 넣은 것: 공유 규칙 파일 `ui-kit/tokens.css`·`strawberry.css`·`tokens.json`과 `ui-kit/foundations/` 전체(색과 글자, 버튼, 칩과 배지, 진행과 시간, 카드와 목록, 캐릭터와 아바타, 확인 모달, 바텀시트, 입력과 컨트롤, 피드백과 빈 상태).
- 뺀 것: 화면 컴포넌트 15종과 전체 킷 첫 페이지. 옛 정책 화면(배 위 집중, 꽃나팔 방송기 등)이 섞여 있고 소리·옛 에셋 연결이 필요하다.
- UI 킷이 쓰는 파일 5개를 함께 넣었다: `backgrounds/island/base/night.png`, `characters/cat/black/poses/guitar.png`·`reading.png`, `characters/dog/idle.png`, `fonts/gowun-dodum.ttf`(고운돋움).
- 원본에서 바꾼 점: 그림·폰트 경로에서 `assets/` 한 단계만 뺐다(이 폴더에서는 그림이 UI 킷 바로 옆에 있다). 공통 컨트롤 페이지의 UI 킷 첫 페이지 링크는 `foundations/index.html`로 돌렸다.
- 공통 컨트롤 안에서 화면 컴포넌트(우체통·공지·섬 홈·내 모습)로 가는 예시 링크는 이 묶음에 없어 열리지 않는다.
