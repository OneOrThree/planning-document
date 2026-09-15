# 같이숲 기획 작업대

[기획 문서 열기](https://oneorthree.github.io/planning-document/feature-inventory.html) · [디자인 작업실](https://oneorthree.github.io/planning-document/) · [수정 가이드](docs/editing-guide.md) · [검증·배포 하네스](docs/harness.md)

유저 저니, 이야기, 기능 표현, 세부 기능, 섬의 발전, 결정 로그를 함께 관리한다. 이 저장소가 팀 공동 수정의 원본이다. 기존 `phone` 저장소의 디자인 폴더는 이전 작업 백업이며 양쪽을 동시에 수정하지 않는다.

**기획 반영과 앱 구현은 다르다.** 기획의 최신 결정은 작업대에서 확인한다. 리깅·걷기 화면과 과거 보고서는 제작 당시의 시연이므로 최신 정책과 차이가 있을 수 있다. 실제 로그인·푸시·결제·OS 스크린타임·서버 동기화는 연결되어 있지 않다.

## 먼저 볼 곳

| 목적 | 페이지 / 원본 |
| --- | --- |
| 백엔드 API v1 협의안 | [HTML 명세](https://oneorthree.github.io/planning-document/docs/api/v1/index.html) · [Markdown 원문](docs/api/v1/gromo-api-spec.md) |
| 전체 기획·6개 탭 | [feature-inventory.html](https://oneorthree.github.io/planning-document/feature-inventory.html) |
| 첫 초대부터 집중 루프 | [초대 경로](https://oneorthree.github.io/planning-document/feature-inventory.html?tab=journey&route=invite#journey-route) |
| 시설 순서·재화·비용 | [섬의 발전](https://oneorthree.github.io/planning-document/feature-inventory.html?tab=growth) |
| 확정 에셋·UI 킷 | [디자인 작업실](https://oneorthree.github.io/planning-document/) · [딸기 소다 UI 킷](https://oneorthree.github.io/planning-document/assets/gachisup-r61/ui-kit/foundations/index.html) · [에셋 설명](assets/gachisup-r61/README.md) |
| 캐릭터 원화·애니메이션 | [리깅](https://oneorthree.github.io/planning-document/rig.html) · [걷기](https://oneorthree.github.io/planning-document/walk.html) |
| 멘토링 보고 | [2026-09-09 PDF](output/pdf/gachisup-mentor-report-2026-09-09-compact.pdf) |
| 수정 위치·정보 구조 | [기능별 수정 가이드](docs/editing-guide.md) |

## 로컬 실행

Node.js 22 이상을 사용한다.

```sh
git clone https://github.com/OneOrThree/planning-document.git
cd planning-document
npm ci
npm run dev
```

[로컬 기획 작업대](http://127.0.0.1:4173/feature-inventory.html)를 연다. 4173 포트가 이미 사용 중이면 `npm run dev -- --port 4174`로 실행한다.

## 수정하고 공유하기

```sh
git pull --ff-only
# 가이드에서 담당 파일을 찾아 수정
npm run check
npx playwright install chromium  # 브라우저 검증을 처음 실행할 때
npm test
git add <수정한-파일>
git commit -m "기획: 변경한 내용"
git push
```

동시에 같은 문서를 수정할 때는 브랜치에서 작업하고 PR로 합치는 편이 충돌을 확인하기 쉽다. `main`에 반영되면 Actions가 검증 후 Pages에 자동 배포한다. 실패하면 이전 배포가 유지되며 [Actions](https://github.com/OneOrThree/planning-document/actions)에서 원인을 확인한다.

에이전트는 [AGENTS.md](AGENTS.md)부터 읽는다. 이전 제작 설명은 [prototype-history.md](prototype-history.md), 초기 제품 설계는 [references/legacy-design](references/legacy-design)에 보관했다.
