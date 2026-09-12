# Gachisup / 첫 항해 — Claude 인수인계

> 작성일: 2026-09-12 (KST)  
> 목적: 현재 디자인·스토리·컷신 제작 맥락을 잃지 않고 다음 작업자가 이어서 진행하기 위한 기록이다.  
> 이 문서는 공개 저장소에 둘 수 있도록 로컬 절대 경로, 계정 정보, 비밀값은 쓰지 않는다.

## 0. 가장 먼저 읽을 결론

- **배포되어 실제로 보이는 기준본은 v17이다.** Pages의 최신 성공 배포는 `4f75775`이며, `fb6df0f`(v18)은 푸시됐지만 CI 검증 하나가 환경 차이로 실패해 배포되지 않았다.
- **v18은 완료·검토된 9편의 60fps 컷신 릴리스 후보**다. 다만 아직 공개되지 않았다.
- **v19와 `preparationRig`는 미완성 로컬 작업**이다. 카탈로그에 넣거나 기본값으로 켜지 말 것. 특히 현재 v19 디렉터리는 비어 있어 중단된 렌더 시도만 남아 있다.
- 우선순위는 (1) 반사 검증의 CI 안정화와 v18 배포 복구, (2) 준비 장면 팔 리그의 시각 검토/채택 여부 결정, (3) 그 뒤에 새 영상 버전 제작이다.

## 1. 저장소와 공개 문서

| 항목 | 값 |
| --- | --- |
| 저장소 | `OneOrThree/planning-document` |
| 기본 브랜치 | `main` |
| 원격 | `https://github.com/OneOrThree/planning-document.git` |
| Pages | `https://oneorthree.github.io/planning-document/` |
| 기능·스토리 보드 | `feature-inventory.html` |
| 컷신 스튜디오 | `cutscenes.html` |

현재 제품 서사와 화면 표현은 다음 문서가 기준이다.

- [전체 스토리·래핑](gachisup-story-and-wrapping.md)
- [프롤로그 3안](prologue-scenarios.md)
- [초대 없이 시작하기](no-invite-story-plan.md)
- [초대장으로 시작하기](invite-story-plan.md)
- [집중 이후 반복 루프](story-loop-plan.md)
- [표현 보드](feature-inventory.html?tab=story#prologue-scenarios)

프롤로그 3안은 아직 **후보**다. 하나가 최종 선택됐다고 기록하거나 UI를 한 안으로 잠그지 않는다.

1. `new-morning` — 오늘은 같이 시작하고 싶어서
2. `folded-promise` — 접어 둔 약속을 펴는 날
3. `unfinished-pier` — 모두의 배가 쉬어 갈 부두

각 안은 `emotion`, `journey`, `storybook` 3가지 연출 방향으로 제작되어 총 9편이다.

## 2. 절대 지켜야 할 제품·비주얼 결정

### 세계관

- 중심 문장은 **“같이 만든 장소에 다시 모인다.”** 혼자 각자 하는 화면에 상대가 배경처럼 존재하는 서비스가 아니다.
- 공부는 공동 테이블, 독서는 모닥불, 휴식도 모닥불처럼 같은 섬의 공동 장소에서 함께하는 감각을 만든다.
- 사용자는 현실의 일을 하고, 고양이 캐릭터는 그 자리에서 행동으로 함께 있음을 표현한다.
- 캐릭터끼리 가벼운 인사/이모트/동선 교차 애니메이션은 가능하지만, 오프라인 친구를 활동 중인 것처럼 만들거나 응답을 요구하면 안 된다.

### 입장 서사

- 초대 시작: **섬의 모습이 담긴 편지 → 짧은 뗏목 이동 → 섬 합류**.
- 초대 없는 시작: 망원경으로 발견 → 지도에서 기존 공개 섬을 살펴보고 합류하거나, 빈 섬 후보를 골라 새 공유 섬을 만든다.
- 공개 섬의 가입 조건·승인은 유지한다. 첫 공개 섬을 찾는 신규 사용자에게 유료 지도/전망대를 강제하지 않는다.
- 우체국 건물이 아니라 **우체통**을 쓴다. “콕 찌르기”는 제거하고 편지를 남긴다.

### 뗏목과 재화

- 뗏목은 개인의 이름표·고른 물건을 두는 관상/프로필 요소다. 꾸미기는 최소이며 **절대 개인 집중방이 아니다.**
- 집중 퀘스트의 성과는 섬의 성장(건설·증축 등), 스크린타임 성과는 개인 꾸미기 재화라는 방향을 논의 중이다. 섬이 일부를 받는 비율·폴리싱은 미정이다.

### 에셋·품질

- 새 작업에는 과거 강아지·카피바라·레서판다·이전 고양이 에셋을 쓰지 않는다.
- 고양이는 Figma의 새 `new-design` 파일에서 온 스타일/에셋을 기준으로 한다. 현재 검은 고양이 스탠딩 에셋이 컷신 기준 캐릭터다.
- 사용자는 **배경 품질을 캐릭터보다 우선**한다. 저채도는 좋지만 수채화처럼 뭉개지지 않고 선명한 벡터/일러스트 질감을 원한다.
- 한 장의 거대한 배경보다 해변·바다·부두·식생 등 조합 가능한 에셋 구조가 장기적으로 낫다.
- 웹 프로토타입은 Canvas 2D다. WebGL은 현재 요구사항이 아니다.

## 3. 배포 상태와 Git 상태

### 커밋/배포

| 버전 | 커밋 | 상태 |
| --- | --- | --- |
| v17 | `4f75775` | Pages 배포 성공. 현재 공개본. |
| v18 | `fb6df0f` | 9편 1080×1920/60fps 후보가 커밋·푸시됨. CI 실패로 Pages 미배포. |
| v19 | 없음 | 반사·눈깜빡임을 포함해 재렌더하려던 로컬 시도. 결과물 없음, 릴리스 아님. |

실패한 Actions 실행은 `34659980484`다. 실패 지점은 `scripts/verify-cutscene-reflection.cjs`이며 메시지는 다음과 같다.

```text
new-morning-journey 육지·하늘 영역 변경; 1 !== 0
```

로컬에서는 통과하지만 CI 캔버스 안티앨리어싱 경계에서 물 마스크 바깥 1픽셀이 감지되는 현상으로 보인다. 반사 기능을 꺼서 통과시키거나 검증 자체를 지우지 않는다. 아래 “다음 순서”의 방식으로 경계만 엄격하게 다룬다.

### 현재 작업 트리 (인수 시점)

다음은 아직 커밋하지 않은 준비 장면 팔 리그 실험이다.

```text
M  cutscene-cinema.js
M  cutscene-fur-palette.js
M  cutscene-renderer.js
M  cutscene-studio.js
M  output/cutscenes/qa/fur-color-check.json
M  scripts/review-cutscene-detail.cjs
?? assets/cutscenes/poses-black/prep-arm-layer-v1.png
?? assets/cutscenes/poses-black/prep-body-underlay-v1.png
?? output/cutscenes/asset-qa/*prep-*.png
?? output/cutscenes/details/prep-arm-static-v1/
?? output/cutscenes/details/prep-arm-static-v2/
?? output/cutscenes/videos/draft-v19/
```

`draft-v19/`는 현재 비어 있다. 디렉터리만 있다고 영상이 제작됐다고 판단하지 않는다.

## 4. 완료되어 검토한 컷신 작업

### v18 영상

- `output/cutscenes/videos/draft-v18/`에 9개 MP4가 있다.
- 모두 1080×1920, 24초, 60fps, 편당 1,440 프레임을 직접 렌더했다. 프레임 보간 영상이 아니다.
- H.264, `faststart`, `yuv420p`, BT.709/sRGB 표기를 사용한다.
- `output/cutscenes/reviews/decoded-v18/REVIEW.md` 및 각 샘플 시트로 9편 × 12시점을 실제 디코딩 기준 검토했다.
- `node scripts/verify-cutscene-video-color.cjs --version=draft-v18`는 통과했다.
- v18 렌더가 끝난 뒤 기본 반사·독서 눈깜빡임 설정이 조정되었으므로, v18 MP4에 그 후속 변경이 들어갔다고 말하면 안 된다.

### 실제로 검토하고 채택한 모션

리뷰 로그는 `cutscene-review-log.js`에 있다. 반복 횟수를 부풀려 기록하지 않았고, 51–60차의 실제 범위 검토가 남아 있다.

- 부드러운 접지 그림자와 수면 림
- 물 마스크 안에서만 작동하는 미세 굴절
- 뗏목의 무게 이동
- 접힌 천이 순서대로 펴지는 동작
- 부두의 팔/꼬리 로컬 리그
- 해안 하늘의 작은 갈매기 활공
- 노의 전진 리듬
- 물에만 나타나는 뗏목 반사 v3
- 독서 중 눈깜빡임 v2

반사와 눈깜빡임은 소스 기준으로는 채택했지만, 반사는 CI 문제를 해결하기 전 공개 릴리스로 보지 않는다.

### 반사 v3의 경계

- 기본 설정: `raftReflection: true`
- 쿼리: `?reflection=water|off`
- 반사는 수면 마스크 내부에만 그리며, 본체의 흔들림을 이중 적용하지 않는다.
- 전수 시트: `output/cutscenes/details/raft-reflection-all-v3/`
- 대표 비교: `raft-reflection-emotion-v3/`, `raft-reflection-storybook-v3/`

### 독서 눈깜빡임 v2의 경계

- 기본 설정: `readingBlink: true`
- 쿼리: `?readingblink=on|off`
- 원본 `look-reach-v1.png` 위에 눈 주변 타원 마스크에만 반눈/감은눈 이미지를 합성한다.
- 생성 소스의 체크무늬 배경을 투명 배경처럼 전체 합성하면 안 된다. **눈 주변만 마스크한다.**
- 검증: `node scripts/verify-cutscene-reading-blink.cjs`
- 전수 시트: `output/cutscenes/details/reading-blink-all-v2/`

## 5. 미완성: 준비 장면 팔 리그

사용자가 책을 드는 장면에서 책장/손 움직임이 어색하다고 느꼈다. 그래서 몸 전체를 흔들지 않고, 손을 뻗는 팔만 책 위치를 따라가게 하는 실험을 시작했다.

### 현재 구현 의도

- `prep-arm-layer-v1.png`: 분리된 팔 레이어. 실측상 거의 완전 투명 배경이다.
- `prep-body-underlay-v1.png`: 원래 뻗은 팔을 지운 몸 보정 레이어.
- `cutscene-cinema.js`의 `preparationBody`, `preparationArmAt`, `preparationRig`가 본체 → 팔 → 원본 얼굴 순으로 그려 얼굴·눈 정체성을 보존하려 한다.
- 런타임/스튜디오에서 `?preparation=rig|pose`로 비교할 수 있게 연결 중이다. 기본은 꺼져 있어야 한다.

### 아직 채택하면 안 되는 이유

- v1 정지 시트에서 어깨/가슴 연결부가 뭉개지고, 손이 책에 정확히 닿지 않는 문제가 있었다.
- 이를 고친 v2는 `output/cutscenes/details/prep-arm-static-v2/`에 생성하려 했으나, 인수 시점에 결과가 비어 있다. **아직 시각 검토되지 않았다.**
- 새 팔/몸 에셋은 투명도·색상 매트 검토는 했지만, 전수 장면·시간축 검토는 하지 않았다.

따라서 다음 작업자는 v2를 먼저 정지 컷으로 확인한다. 흉부 이음새, 목/얼굴 침범, 손과 책의 접점, 팔 뿌리의 깜빡임 중 하나라도 어색하면 기본값을 켜지 말고 실험으로 보류한다.

## 6. 핵심 파일 지도

| 파일 | 역할 |
| --- | --- |
| `cutscene-production.js` | 3개 이야기×3개 방향의 타임라인·기본 튜닝 |
| `cutscene-cinema.js` | 장면 구성, 캐릭터/뗏목/행동 렌더링 |
| `cutscene-renderer.js` | 에셋 로딩·배경/반사 기반 렌더링 |
| `cutscene-fur-palette.js` | 소스 고양이 털색을 런타임에서 일관되게 보정 |
| `cutscene-studio.js` | 브라우저 프리뷰와 쿼리 토글 |
| `cutscene-settings.js` | 전역 설정 파싱 |
| `cutscene-review-log.js` | 실제 수행한 검토 기록 |
| `cutscene-export-catalog.js` | 공개할 영상 버전 목록 |
| `scripts/render-cutscenes.cjs` | 스냅샷 기반 렌더/ffmpeg 출력 |
| `scripts/review-cutscene-detail.cjs` | 9편 정지 컷 전수 검토 시트 |
| `scripts/review-video-batch.cjs` | 완성 MP4 디코딩 검토 시트 |
| `scripts/verify-cutscene-*.cjs` | 반사·눈·색상 등 회귀 검증 |
| `docs/cutscene-production.md` | 제작·검토 방법 문서 |

## 7. 안전한 다음 작업 순서

### A. v18 배포를 복구한다

1. `gh run view 34659980484 --log-failed`로 실패 로그를 다시 확인한다.
2. `verify-cutscene-reflection.cjs`에서 차이가 난 좌표와 그 좌표가 수면 마스크 경계인지 기록하도록 보강한다.
3. 마스크 외부 전체 허용치로 완화하지 말고, **마스크의 1px 안티앨리어싱 경계만 확장/분리**해 경계 누수와 진짜 육지·하늘 변경을 구분한다.
4. 비경계 영역 변경은 계속 0이어야 한다. 경계 허용도 작은 상한과 좌표 로그를 둔다.
5. `npm test` 후, 검증 수정만 별도 커밋하여 푸시한다.
6. Actions와 Pages 성공 뒤 실제 공개 URL에서 `cutscenes.html#exports`를 재생해 버전·해상도·콘솔 오류를 확인한다.

반사 검증을 삭제하거나, `outsideChanged` 전체를 넉넉한 숫자로 바꿔 통과시키지 않는다.

### B. 팔 리그는 채택 전 품질 관문을 통과한다

1. 현재 더티 변경을 별도 작업 단위로 보존한다. v18 배포 복구 커밋과 섞지 않는다.
2. `preparation=rig`와 `preparation=pose`의 같은 시점을 비교해 v2 정지 시트를 만든다.
3. 9편 × 12시점 전수 시트와 `emotion/journey/storybook` 대표 연속 비교를 실제로 본다.
4. 손-책 접점, 팔 뿌리, 몸통 윤곽, 얼굴/눈, 알파·배경 누출을 검증한다.
5. 통과한 경우에만 기본 설정/리뷰 로그/문서를 갱신하고, 그렇지 않으면 기본은 `pose`를 유지한다.

### C. v19를 새로 만들려면

현재 `draft-v19/`는 비어 있으므로 새 렌더로 취급한다.

1. 반사 CI 문제와 팔 리그 채택 여부를 먼저 정한다.
2. 의도한 소스 버전의 9편을 스냅샷 렌더한다.
3. 실제 MP4 디코딩 시트, 색상 검증, 아티팩트 용량을 확인한다.
4. 그 뒤에만 `cutscene-export-catalog.js`, 제작 문서, 배포를 갱신한다.

Pages 출력 총량 제한이 약 1GB이며 v18 빌드 기준 약 844MB였다. 새 9편을 무심코 추가하기 전 `npm run build`의 출력 크기를 확인한다. 오래된 결과물을 삭제/정리하는 일은 사용자 승인 없이 하지 않는다.

## 8. 자주 쓰는 명령

저장소 루트에서 실행한다.

```bash
npm test
npm run build

node scripts/render-cutscenes.cjs --version=draft-vXX --width=1080 --fps=60
node scripts/review-video-batch.cjs --version=draft-v18 --label=decoded-v18
node scripts/verify-cutscene-video-color.cjs --version=draft-v18
node scripts/verify-cutscene-reflection.cjs
node scripts/verify-cutscene-reading-blink.cjs

node scripts/review-cutscene-detail.cjs \
  --label=review-name --phase=prepare --from=0.14 --to=0.58 \
  --samples=12 --crop=300 --film=new-morning-emotion
```

영상 렌더러는 실행 시점의 소스와 에셋을 임시 스냅샷으로 고정한다. 따라서 렌더 도중 소스를 수정해도 같은 배치에 섞이지 않는다. 반대로, 결과물 `manifest`를 보고 어떤 소스 상태에서 렌더됐는지 반드시 확인한다.

## 9. 검토 원칙

- “30회 루프” 요구는 숫자만 채우는 기록이 아니라 실제로 본 검토 단위로 남긴다. 현 로그는 51–60차까지 실제 범위 검토를 기록했다.
- 생성 이미지의 투명 배경은 알파 값과 컬러 매트로 확인한다. 체크무늬가 보인다는 이유만으로 알파라고 가정하지 않는다.
- 화면에서 좋아 보이는 한 컷만으로 채택하지 않는다. 9편·3방향의 구도, 작은 모바일 크기, 시간축을 함께 확인한다.
- 배경·에셋·애니메이션의 이질감은 전체가 아닌 접점(발-지면, 뗏목-물, 손-책, 팔-몸통, 그림자-광원)을 우선 본다.
- 공개 문서에는 로컬 절대 경로나 내부 계정 정보를 넣지 않는다. `npm run check`는 공개 산출물의 절대 경로를 경고한다.

## 10. 그 뒤의 제품 작업 후보

컷신 안정화 뒤에는 사용자와 아래를 다시 선택한다.

1. 3개 프롤로그 중 실제 온보딩의 기준 이야기 하나 선택 또는 조합.
2. 초대/공개 섬/새 섬 진입이 실제 앱 흐름과 컷신에서 같은 규칙을 쓰게 정렬.
3. 섬의 성장 단계(건물·공간·행동 해금)와 재화 수치를 별도 탭/문서로 폴리싱.
4. 동일 공간에서 함께한다는 감각을 깨지 않는 공동 행동(공동 테이블·모닥불·부두) 확장.
5. 앱 구현용으로 배경을 레이어/에셋 단위로 조합하고, 필요하면 컷신에서 재사용할 스프라이트·영상 산출물을 분리.

이후에도 핵심은 기능을 많이 나열하는 것이 아니라, 사용자가 **같이 목표를 정하고, 같은 장소에서 행동하고, 결과로 그 장소를 함께 바꾼다**는 흐름이 화면과 이야기에서 자연스럽게 이어지는지다.
