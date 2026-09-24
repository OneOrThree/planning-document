# Catus R61 전체 에셋

2026-09-20 기준 앱이 쓰는 그림과 원본 작업 폴더 `gachisup-R61-assets/assets/`의 에셋 158개, 딸기 소다 UI 킷 기본을 공개한다. Jira: GROMO-1887, GROMO-1833, GROMO-1843, GROMO-1920, GROMO-1963

- 첫 화면은 PNG 123개, JPG 29개, WAV 3개, TTF 3개를 모두 펼친다. 파일명 기준 밤 에셋은 19개다.
- 폴더는 **쓰임새별**로 묶었다. 섬 화면은 `island/`, 낚시섬은 `fishing-island/`, 건물은 건물 하나당 `buildings/<건물>/` 한 폴더에 바깥 모습·아이콘·시트 배경·실내가 함께 있다.
- 공개 파일은 원본을 그대로 복사했다. 크기·색·투명도·음질을 바꾸지 않았고 첫 화면의 다운로드 버튼도 이 원본을 가리킨다.
- 사이트 첫 화면(디자인 작업실, 저장소 루트 `index.html`)에서 종류와 낮·밤으로 필터링할 수 있다.
- 생성 원본과 프롬프트는 원본 작업 폴더의 `_source/`에 있고 이 저장소에는 올리지 않았다.

## 폴더 구조 (158개)

| 폴더 | 개수 | 내용 |
| --- | --- | --- |
| `island/` | 26 | 섬 바탕 낮·밤, 성장 단계 8종, 모닥불 휴식 화면, 전체 미리보기·환영, 부두·모닥불 시트 배경 |
| `fishing-island/` | 3 | 낚시섬 낮·밤과 바다 타일 |
| `buildings/<건물>/` | 41 | 건물 7채마다 `exterior-day.png`(바깥 모습) · `icon.png`(아이콘) · `sheet-bg.jpg`(+가로) · `interior/`(실내) |
| `characters/` | 31 | `cat/<색>/atlas.png`(자세 모음)와 아바타 두 크기, `npc/`(강아지·몽돌·팰리컨·앵무새) |
| `boats/raft/` | 15 | 뗏목 낮·밤, 항해·앞뒤 레이어, 앱 화면용 뗏목 3종 |
| `ui/` | 17 | 집중 이모티콘(원본·앱), 게시판·우체통·도서관 UI, 물고기 아이콘 |
| `props/` | 18 | 등불·모닥불·부두·낚시·휴식 소품 |
| `audio/` | 3 | 모닥불·숲바람·파도 WAV |
| `fonts/` | 3 | 고운돋움 기본·게시판·마을회관 TTF |
| `effects/` | 1 | 따뜻한 빛 효과 |

## 2026-09-20 정리 내역

앱(`phone` 저장소 `app/app-dev/src/assets`)이 쓰는 그림 87개를 받은 뒤, 출처별로 흩어져 있던 폴더(`backgrounds/`·`reference-v2/`·`interiors/`)를 쓰임새별로 다시 묶고 중복을 지웠다. 177개 → 158개.

**옮긴 곳 (옛 경로 → 새 경로)**

| 옛 경로 | 새 경로 |
| --- | --- |
| `backgrounds/island/base|growth/…` | `island/base|growth/…` |
| `backgrounds/campfire/day.jpg` | `island/campfire/day.jpg` |
| `backgrounds/fishing-island/…` | `fishing-island/…` |
| `reference-v2/island-whole*.jpg`, `L-home-00-start-nocat.jpg`, `welcome.jpg` | `island/preview/…` |
| `reference-v2/bldbg-dock|fire(.jpg)`, `L-bldbg-…` | `island/sheet-bg/…` |
| `buildings/<건물>/day.png` | `buildings/<건물>/exterior-day.png` |
| `reference-v2/bld-<건물>.png` | `buildings/<건물>/icon.png` |
| `reference-v2/bldbg-<건물>.jpg`, `L-bldbg-<건물>.jpg` | `buildings/<건물>/sheet-bg.jpg`, `sheet-bg-wide.jpg` |
| `reference-v2/hall-room*.png|jpg`, `lib-room*.jpg`, `interiors/<건물>-cute-v1.png` | `buildings/<건물>/interior/room*.png|jpg` |
| `interiors/board-three-papers-v5.png` | `buildings/notice-board/interior/papers.png` |
| `characters/cat/<색>/animations/atlas.png` | `characters/cat/<색>/atlas.png` |
| `interiors/avatars/<색>.png`, `reference-v2/avatar-<색>.png` | `characters/cat/avatar/<색>-256.png`, `<색>-128.png` |
| `characters/<NPC>/npc/idle.png`, `reference-v2/parrot.png|dog.png` | `characters/npc/…` |
| `reference-v2/boat-raft*.png` | `boats/raft/app*.png` |
| `reference-v2/emote-*.png` | `ui/emotes/app/*.png` |
| `interiors/ui/board-sheet-*.png`, `blueprint-ready-stamp-v3.png` | `ui/board/…` |
| `interiors/ui/letter-envelope-v1.png` | `ui/mail/letter-envelope.png` |
| `reference-v2/fish.png`, `lib-page.png` | `ui/icons/fish.png`, `ui/library/page.png` |

**지운 중복 19개**

- 건물 바깥 모습 7채가 `buildings/`와 `interiors/buildings/`에 두 벌 있었다. `buildings/` 쪽만 남겼다.
- 마을회관 실내 한 장이 세 벌(`buildings/hall/interior/room.png`, `reference-v2/hall-room.png`, `interiors/hall-cute-v1.png`)이었다.
- 강아지 기본 그림이 두 벌이었다.
- 섬 성장 단계에서 **같은 그림을 쓰는 단계**가 있어 한 벌만 남겼다. 어느 단계가 같은 그림인지는 아래와 같다.
  - `03a-observatory-first` = `04-observatory-and-mailbox` = `06-observatory`
  - `03b-mailbox-first` = `05-mailbox`
  - `05-final-shop` = `07-shop`
  - `00-start`의 밤 그림 = `island/base/night.png`

**원본 작업 폴더와의 관계** — 이 저장소의 폴더 구조는 이제 원본 작업 폴더(`gachisup-R61-assets/assets/`)와 다르다. 다음에 원본에서 새 에셋을 받을 때는 위 매핑표를 따라 옮긴다.

## UI 킷 · 딸기 소다 기본 (`ui-kit/`)

시작 페이지는 `ui-kit/foundations/index.html`이다.

- 넣은 것: 공유 규칙 파일 `ui-kit/tokens.css`·`strawberry.css`·`tokens.json`과 `ui-kit/foundations/` 전체(색과 글자, 버튼, 칩과 배지, 진행과 시간, 카드와 목록, 캐릭터와 아바타, 확인 모달, 바텀시트, 입력과 컨트롤, 피드백과 빈 상태).
- 뺀 것: 화면 컴포넌트 15종과 전체 킷 첫 페이지. 옛 정책 화면(배 위 집중, 꽃나팔 방송기 등)이 섞여 있고 소리·옛 에셋 연결이 필요하다.
- UI 킷이 쓰는 파일 5개를 함께 넣었다: `island/base/night.png`, `characters/cat/black/guitar.png`·`reading.png`, `characters/npc/dog.png`, `fonts/gowun-dodum.ttf`(고운돋움).
- 원본에서 바꾼 점: 그림·폰트 경로에서 `assets/` 한 단계만 뺐다(이 폴더에서는 그림이 UI 킷 바로 옆에 있다). 공통 컨트롤 페이지의 UI 킷 첫 페이지 링크는 `foundations/index.html`로 돌렸다.
- 공통 컨트롤 안에서 화면 컴포넌트(우체통·공지·섬 홈·내 모습)로 가는 예시 링크는 이 묶음에 없어 열리지 않는다.
