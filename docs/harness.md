# 실행·검증·배포 하네스

하네스는 팀원과 에이전트가 같은 방법으로 실행하고 검증하기 위한 작업 틀이다. 명령의 실제 정의는 루트 `package.json`, 배포의 실제 정의는 `.github/workflows/pages.yml`에 있다.

## 명령

| 명령 | 하는 일 | 서버 필요 |
| --- | --- | --- |
| `npm run dev` | 로컬 정적 서버, 기본 4173 | 직접 시작 |
| `npm run check` | JS 문법, 로컬 경로·민감 문자열 패턴, HTML/CSS 연결 파일, 기능·출처·장면 데이터 검증 | 없음 |
| `npm test` | 임시 포트의 `/planning-document/`에서 5개 기획 회귀·화면 스모크·9편 컷신 재생 검사 | 자동 시작·종료 |
| `npm run smoke` | 주요 페이지·캐릭터 선택·문서/PDF 접근 확인 | 기존 서버 또는 `BASE_URL` |
| `npm run build` | 정적 검증 후 배포 전용 `_site/` 재생성 | 없음 |

처음에는 `npm ci`와 `npx playwright install chromium`이 필요하다. Linux 환경은 `npx playwright install --with-deps chromium`으로 시스템 의존성도 설치한다. 일반 화면 열기는 Playwright 설치 없이 가능하다.

```sh
# 개인 포트에서 작업
npm run dev -- --port 4174

# 특정 기존 검사만 실행 (끝에 / 포함)
BASE_URL=http://127.0.0.1:4174/ node verify-journey-routes.cjs

# 배포 결과 검사
BASE_URL=https://oneorthree.github.io/planning-document/ npm run smoke
```

## 검증 범위

- 정적 검사: 끊어진 정적 리소스·개인 경로·기능 ID 중복·상태 키·출처·제외 화면 연결·장면 필수 필드.
- 기획 회귀 검사: 전체 목록, 6개 탭, 필터·검색, 3개 시작 경로, 성장·결정 로그, 새로고침·뒤로가기·키보드·모바일 폭.
- 스모크 검사: 디자인 작업실(에셋 보관함)·기획 문서·이야기·리깅·걷기·문서/PDF가 실제로 열리고 리소스 오류가 없는지.
- 컷신 검사: 9개 ID·선택 복원·서로 다른 도입부·아틀라스 범위·개별 자세 순서·눈 감김·앞발 접점·준비/짐 정리 시간표·배경 등록·MP4 실제 재생·바이트 Range·고양이 여섯 전신. 미술·전체 동작의 자연스러움은 자동 통과 범위가 아니다. 제작·출력은 [별도 하네스](cutscene-production.md)를 따른다.
- 별도 검사: `verify-*.cjs`에는 집중·저장·게시판·리깅 등 과거 기능별 테스트가 있다. 관련 시연을 바꿀 때 추가 실행한다. 기본 `npm test`가 실제 앱 전체를 검증하는 것은 아니다.

현재 일부 회귀 검사는 합의된 기능 수·정책을 명시적으로 단정한다. 기능을 의도적으로 추가하면 숫자만 통과시키지 말고 새 항목·상태·연결의 검증도 추가한다. 비공개 `phone` 소스는 이 저장소의 존재 검사에서 제외하고 출처를 명시한다. 해당 앱 코드의 유효성은 별도 저장소에서 검증한다.

테스트는 별도 브라우저 컨텍스트를 쓰며 기존 사용자의 브라우저 저장소를 읽지 않는다. 테스트 출력은 `tmp/` 또는 시스템 임시 폴더에 남긴다. 이전 제작 캡처인 `screenshots/`는 공개 보관 자료다. 다만 최종 화면에서 직접 참조하지 않는 `before`·`debug`·`FAIL-`·`EDGE-` 진단 캡처는 Git 원본에만 보존하고 Pages 묶음에서는 제외한다.

## 자동 배포

`main` push → Actions 검증 → `_site/` 생성 → GitHub Pages 배포.

- 저장소: `OneOrThree/planning-document`
- 사이트: `https://oneorthree.github.io/planning-document/`
- 주 문서: 위 주소의 `feature-inventory.html`
- Pages 설정: Settings → Pages → Source = GitHub Actions
- PR: 같은 검증을 수행하지만 운영 사이트는 배포하지 않는다.
- 검증 실패: 배포 단계로 넘어가지 않고 이전 운영 버전을 유지한다.
- 수동 재배포: Actions에서 해당 workflow의 Run workflow를 선택한다.

```sh
gh run list --repo OneOrThree/planning-document --limit 5
gh run view <실행-ID> --repo OneOrThree/planning-document --log-failed
```

사이트 루트의 `index.html`은 디자인 작업실(확정 에셋 보관함)이다. 옛 마을·IA·모바일 시연은 2026-09-15에 지웠고 Git 기록에 남아 있다. 문서 공유에는 `feature-inventory.html`을 사용한다. 상대경로를 유지해야 Pages 프로젝트 경로와 로컬에서 모두 동작한다.

## 원본과 공개 범위

문서, 시연 코드, 에셋, 수정본, 과거 캡처, 완성 PDF를 이관했다. 캐시·임시 PDF 출력·중복 ZIP·개인 도구 설정은 이관하지 않았다. 기존 폴더는 복구용 백업으로 남아 있다. 새로운 수정은 이 저장소에서 한다.

`_site/`는 생성 전용 폴더이며 빌드할 때만 지우고 다시 만든다. 원본은 수정하지 않고 필요한 정적 파일을 복사한다. `.git`, `node_modules`, 테스트 스크립트, 보고서 제작 스크립트는 배포 산출물에 포함하지 않는다. 새 에셋 폴더를 추가하면 `scripts/build.cjs`의 배포 목록도 갱신한다.

공개 저장소에는 커밋 이력까지 남는다. 민감 문자열 자동 검사는 보조 수단일 뿐 공개 안전성을 보장하지 않는다. 스크린샷·PDF의 개인정보, 실제 사용자 데이터, 인증 정보, 비공개 앱 소스를 push 전에 검토한다.

## 자주 막히는 곳

| 증상 | 확인할 것 |
| --- | --- |
| 4173 포트 충돌 | 기존 서버를 임의 종료하지 말고 `--port 4174` 사용 |
| 브라우저 실행 파일 없음 | `npx playwright install chromium` |
| 로컬은 되는데 Pages 에셋 404 | `/assets/...` 대신 `assets/...`, 대소문자 확인, build 포함 여부 |
| 선택한 탭·경로가 새로고침에 사라짐 | `planning-workbench.js`와 `journey-route.js` URL 복원, 해당 회귀 검사 |
| main push 후 화면이 그대로 | Actions 실행의 검증·배포 상태 확인, 성공 후 새로고침 |
| 기능 변경 후 개수 검사 실패 | 기능 ID·제외 이력·IA 연결·새 검증을 함께 검토 |
| PDF 재생성 실패 | 과거 `report-tools/`는 Python 패키지·macOS 폰트·새 캡처 필요. 웹 배포와 별개 |
| 다이어그램 재생성 실패 | 과거 렌더러는 로컬 gstack과 `GSTACK_BROWSE` 필요. 완성 SVG/PNG는 설치 없이 열림 |

## 변경 보고 양식

```text
변경 영역 / 기능 ID:
바뀐 사용자 경험:
수정한 원본과 연결 문서:
확정·제안 / 기획·시연 구분:
실행한 검증과 결과:
남은 미정·미구현:
배포 커밋·확인 URL (배포 요청인 경우):
```

## 타일 마을 시연

`village-world.html`은 개발 검토용 타일·소품·길 시연이다. `npm test`에 포함한
`scripts/verify-village-world.cjs`는 프로젝트 하위 경로 로딩, 레이어/타일 크기 전환,
문·부두·다리 경로와 ZIP의 필수 에셋을 확인한다.
`node scripts/export-village-world.cjs`로 앱 전달 파일을 재생성한다.
범위와 검증 증거는 [타일 마을 기록](village-world/README.md)을 따른다.
