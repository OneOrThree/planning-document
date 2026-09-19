# 같이숲 R61 전체 에셋

2026-09-20 기준 앱이 쓰는 그림과 원본 작업 폴더 `gachisup-R61-assets/assets/`의 에셋 177개, 딸기 소다 UI 킷 기본을 공개한다. Jira: GROMO-1887, GROMO-1833, GROMO-1843, GROMO-1920, GROMO-1963

- 첫 화면은 PNG 142개, JPG 29개, WAV 3개, TTF 3개를 모두 펼친다. 파일명 기준 밤 에셋은 24개다.
- 기존 104개 목록은 앱 화면에서 실제로 사용된 구현 증거였고, 이제 첫 화면의 전체 디자인 에셋 목록과 구분한다.
- 폴더 구조는 원본 작업 폴더 `gachisup-R61-assets/assets/`(또는 앱 `app/app-dev/src/assets/`)와 같다. 경로 앞부분만 `assets/gachisup-r61/`로 바뀐다.
- 공개 파일은 원본을 그대로 복사했다. 크기·색·투명도·음질을 바꾸지 않았고 첫 화면의 다운로드 버튼도 이 원본을 가리킨다.
- 사이트 첫 화면(디자인 작업실, 저장소 루트 `index.html`)에서 카테고리와 낮·밤으로 필터링할 수 있다.
- 생성 원본과 프롬프트는 원본 작업 폴더의 `_source/`에 있고 이 저장소에는 올리지 않았다.

### 2026-09-20 앱 사용 그림 추가와 보관함 정리

앱(`phone` 저장소 `app/app-dev/src/assets`) 화면이 실제로 쓰는데 여기 없던 그림 87개를 앱 경로 그대로 추가하고, 첫 화면에서 안 쓰거나 겹치는 그림을 덜어냈다. 첫 화면은 177개(PNG 142, JPG 29, WAV 3, TTF 3)다.

- 추가: `interiors/` 24개(건물 실내 배경·아바타·게시판/우체통 UI), `reference-v2/` 55개(앱 화면의 건물 아이콘·건물 배경·아바타·이모티콘·섬 전체·첫 섬 등), 휴식 모닥불 배경, 낚시섬 바다 타일.
- `interiors/`와 `reference-v2/`는 원본 작업 폴더가 아니라 앱 폴더 구조를 따른다.
- 낚시섬 낮·밤 배경은 원본 작업 폴더의 2026-09-17 재생성본(1536×1024)으로 교체했다. 옛 1254×1254 그림은 앱과 달랐다. 앱의 `day.jpg`는 이 낮 PNG의 JPG 압축본이다.
- 고양이는 색깔마다 `animations/atlas.png` 한 장만 남겼다. 이 한 장에 책 읽기·서기·자기·기타·줄넘기·걷기·눈 깜빡임 자세가 모두 들어 있다. 검정 고양이만 UI 킷과 이모티콘 리뷰 페이지가 직접 쓰는 `idle.png`·`poses/guitar.png`·`poses/reading.png`·`fishing/fishing-frame-0.png`와 낚시 아틀라스를 함께 남겼다.
- 뺀 것: 고양이 낱장 프레임 212개, 앵무새 NPC 2개, `ui/icons/` 4개, `ui/quest-board/` 7개.
- 낚싯대를 든 자세는 `animations/atlas.png`에 없다. 검정 고양이의 `animations/fishing-atlas.png`로만 확인할 수 있다.

## 첫 화면 전체 에셋 (177개)

| 폴더 | 개수 | 내용 |
| --- | --- | --- |
| `reference-v2/` | 55 | 앱 화면의 건물 아이콘·건물 배경(세로/가로)·아바타·이모티콘·섬 전체·첫 섬·회관/도서관 방 |
| `backgrounds/` | 30 | 낚시섬과 마을섬의 기본·성장 단계 낮/밤, 낚시섬 바다 타일, 휴식 모닥불 배경 |
| `interiors/` | 24 | 앱의 건물 실내 배경·건물·아바타, 게시판·우체통 UI |
| `props/` | 18 | 등불·모닥불·부두·낚시·휴식 소품 |
| `characters/` | 16 | 고양이 6색 아틀라스, 몽돌·강아지 NPC |
| `boats/` | 12 | 뗏목 낮/밤과 항해·앞뒤 레이어 |
| `buildings/` | 10 | 건물 7채와 마을회관·도서관 실내 |
| `ui/` | 5 | 상징 스티커형 집중 이모티콘 5종 |
| `audio/` | 3 | 모닥불·숲바람·파도 WAV |
| `fonts/` | 3 | 고운돋움 기본·게시판·마을회관 TTF |
| `effects/` | 1 | 따뜻한 빛 효과 |

## UI 킷 · 딸기 소다 기본 (`ui-kit/`)

시작 페이지는 `ui-kit/foundations/index.html`이다.

- 넣은 것: 공유 규칙 파일 `ui-kit/tokens.css`·`strawberry.css`·`tokens.json`과 `ui-kit/foundations/` 전체(색과 글자, 버튼, 칩과 배지, 진행과 시간, 카드와 목록, 캐릭터와 아바타, 확인 모달, 바텀시트, 입력과 컨트롤, 피드백과 빈 상태).
- 뺀 것: 화면 컴포넌트 15종과 전체 킷 첫 페이지. 옛 정책 화면(배 위 집중, 꽃나팔 방송기 등)이 섞여 있고 소리·옛 에셋 연결이 필요하다.
- UI 킷이 쓰는 파일 5개를 함께 넣었다: `backgrounds/island/base/night.png`, `characters/cat/black/poses/guitar.png`·`reading.png`, `characters/dog/idle.png`, `fonts/gowun-dodum.ttf`(고운돋움).
- 원본에서 바꾼 점: 그림·폰트 경로에서 `assets/` 한 단계만 뺐다(이 폴더에서는 그림이 UI 킷 바로 옆에 있다). 공통 컨트롤 페이지의 UI 킷 첫 페이지 링크는 `foundations/index.html`로 돌렸다.
- 공통 컨트롤 안에서 화면 컴포넌트(우체통·공지·섬 홈·내 모습)로 가는 예시 링크는 이 묶음에 없어 열리지 않는다.
