# 고양이 첫 항해 · 제작 하네스

목표는 이야기 3개 × 연출 3개, 9편이다. 영상별 검토·개선 30회를 목표로 하며, 2026-09-12 오전 10시(KST)까지 개선한다. 출력 횟수·자동 테스트·아틀라스 생성 횟수는 시각 검토 완료 횟수로 계산하지 않는다.

## 원본과 담당 파일

| 바꿀 내용 | 파일 | 지켜야 할 선 |
| --- | --- | --- |
| 세 이야기와 가입 흐름 | `prologue-scenarios-data.js` | 이야기는 후보다. 실제 초대·동료를 꾸며내지 않는다. |
| 아홉 영상·타이밍·조정값 | `cutscene-production.js` | 이야기 × 연출의 9개 ID 유지 |
| 장면·카메라·동선·자막 | `cutscene-cinema.js` | 같은 캐릭터의 위치·크기·소품 연결 확인 |
| 뗏목·책·원본 변형 | `cutscene-renderer.js` | 기존 3편 시험 렌더러도 남아 있으나 현재 재생은 Cinema 사용 |
| 생성 동작 아틀라스 | `cutscene-sprites.js`, `assets/cutscenes/sprites/black/` | `manifest.json.frame_layout` 좌표로만 샘플링 |
| 개별 자세·발·손 등록점 | `cutscene-poses.js`, `assets/cutscenes/poses-black/walk-v1.json` | 현재 기본 `poses`. 원화·등록점·실험 상태를 구분 |
| 노 젓기 국소 관절 | `cutscene-paddle-rig.js`, `poses-black/paddle-*` | 기본 채택. 한 어깨 관절과 고정 몸체·눈 감김. 완성형 전신 리깅과 구분 |
| 보행 국소 관절 시험 | `cutscene-walk-rig.js`, `poses-black/walk-body-*`, `walk-front-paw-*` | `?walk=rig`에서만 비교. 기본 영상에는 미채택 |
| 관절 파츠 실험 | `cutscene-rig.js`, `assets/cutscenes/rig-black/` | 기본 재생과 별도. `actorMode: 'rig'`로 비교 |
| 캐릭터 여섯 종 출처 | `figma-cats.js`, `assets/figma-cats/README.md` | 추출 원본과 생성 파생본 구분 |
| 생성 프롬프트 | `assets/cutscenes/PROMPTS.md` | 사용 도구·기준 이미지·채택 여부를 정직하게 기록 |
| 선택·재생·다운로드 | `cutscenes.html`, `cutscene-studio.js` | Canvas 최신 연출과 MP4 고정 버전 구분 |
| 검토 기록 | `cutscene-review-log.js` | 실제 확인한 범위·발견·수정·근거만 추가 |

## 현재 제공물

`cutscenes.html`에서 9편을 선택하고 실시간 연출과 MP4 초안을 볼 수 있다. `draft-v06`부터 `draft-v01`까지 여섯 버전을 비교한다. 각각 9개 무음 MP4·포스터와 소스·에셋 지문을 가진 `manifest.json`이 있다. 24초·24fps·576프레임의 H.264/yuv420p/faststart이며 v01은 720 × 1280, v02 이후는 1080 × 1920이다. v06은 검토 기록 38번까지의 상태다. 같은 몸체에서 앞발만 연속 회전하는 노 젓기, 손 옆에서 노 집기, 감정형의 섬광 없는 장면 전환을 포함한다. v05는 기록 35번까지의 같은 얼굴 자세·눈깜빡임과 짐 정리, v04는 기록 30번까지의 모래 그림→공책과 경로 물결이다. 기록 38번 시점의 영상별 실제 검토 횟수는 34~36회다. 적용 대상별로 계산하며 출력·자동 검사는 더하지 않는다. 걷기·도약의 자세 연결은 아직 개선 중이며 완성형 리깅이나 사용자가 선택한 최종 시나리오가 아니다.

실시간 Canvas는 출력 후 수정 사항을 먼저 보여줄 수 있다. 이때 MP4를 같은 최신본이라고 표시하지 않는다. 다음 버전은 별도 폴더로 출력한다.

현재 Canvas의 기본 캐릭터는 개별 원화 방식(`poses`)이다. 걷기 8자세, 도약 5자세, 앞발 3자세, 일반 눈깜빡임과 노를 쥔 눈깜빡임을 기준 얼굴에 맞춰 생성했다. 이전 아틀라스는 `cutscenes.html?actor=sprite`, 관절 파츠 실험은 `?actor=rig`에서 비교한다. 보행 원화의 작은 발 움직임과 주기 경계 높이 차이 때문에 명세의 `experimental` 상태는 유지한다. 기본 채택은 시연 연결이지 완성형 리깅 승인과 다르다.

노 젓기만 `paddleRig: true`를 기본으로 쓴다. 같은 몸체 원화 뒤에서 앞발 하나를 어깨 기준으로 회전하고 그 변환으로 손잡이 접점을 계산한다. `?paddle=pose`로 고정 앞발 방식을 비교할 수 있다. 눈 감김은 몸체 원화만 교체하므로 손의 궤적은 바뀌지 않는다. 주기 폐합·손 이동·눈 감김 독립성은 자동 검사하되 체중 이동이나 미술적 자연스러움 통과로 취급하지 않는다. `?walk=rig`는 발 접지 시험으로, 복부와 다리 연결부가 어색하여 기본에는 넣지 않았다.

부두에 내린 뒤가 아니라 **뗏목에 착지한 뒤** 1.65초 동안 짐을 정리한다. `settlingAt()`의 가방 내려놓기→책 꺼내기→펼치기→내려놓기→노 잡기 순서와 `preparationAt()`의 출발 준비 순서는 각각 4,509개 시간 표본으로 검사한다. 자세별 실제 앞발 좌표에 밧줄·노 회전축을 연결한다. 이 좌표 검사는 접점 보존만 보장하며 어깨·팔 전체의 자연스러움을 판정하지 않는다.

## 검토·출력 명령

Node·Playwright·Chromium은 기존 프로젝트 환경을 사용한다. MP4 출력만 `ffmpeg`와 `ffprobe`가 추가로 필요하다.

```sh
# 장면 9편 × 3시점 검토 자료. 명령 실행 자체는 검토 완료가 아니다.
node scripts/review-cutscenes.cjs --label=round-11 --phase=boarding

# 관절 실험 비교. 기본 영상의 채택 상태는 바꾸지 않는다.
node scripts/review-cutscenes.cjs --label=rig-check --phase=walk --actor=rig

# 9편 출력. 소스와 필요한 에셋을 해당 실행 전용 스냅샷으로 고정한다.
node scripts/render-cutscenes.cjs --version=draft-v02 --width=1080

# 한 편 재출력은 별도 버전 폴더를 권장한다.
node scripts/render-cutscenes.cjs --version=emotion-study --film=new-morning-emotion --width=1080

# 프로젝트 하위 URL, 영상 실제 재생, Range 요청, 6종 전신을 검사한다.
node scripts/verify-cutscenes.cjs
npm run check
npm test
npm run build
```

`intro`, `transition`, `prepare`, `walk`, `boarding`, `settle`, `depart`, `sea` 구간을 검토할 수 있다. 검토 자료는 `output/cutscenes/reviews/<label>/`에 남는다. 3장 표본은 빠른 장면 점검일 뿐 전체 동작 통과 판정이 아니다. 걷기·눈·승선·소품 연결은 연속 프레임과 실제 재생도 확인한다.

더 촘촘한 확대 검토는 아래 명령을 사용한다. `--samples`는 2~24개, `--crop`은 논리 화면의 180~720px이다. 확대 중심은 캐릭터의 발 위치를 따라가므로 화면 전체의 동선 평가는 개요 캡처와 함께 해야 한다. `--anchor=ground`는 모래 그림처럼 발 아래 상호작용을 함께 보여준다. `boarding-link`, `book-lift`, `walk-link`, `paddle-loop` 구간도 제공한다. 파일은 `output/cutscenes/details/<label>/`에 저장하며 기존 이름을 덮어쓰지 않는다.

```sh
node scripts/review-cutscene-detail.cjs --label=boarding-review --phase=boarding-link --from=0 --to=1 --samples=12 --crop=280

# 이전 아틀라스와 개별 원화의 같은 시점 비교 MP4·연속 프레임
node scripts/review-walk-poses.cjs --label=walk-comparison --film=new-morning-emotion --phase=walk --adjacent

# 몸체는 유지하고 앞발만 움직이는 국소 관절 비교
node scripts/review-walk-poses.cjs --label=paddle-comparison --film=new-morning-emotion --phase=paddle --paddle=rig --adjacent

# 인코딩된 MP4 자체에서 표본 추출. 캔버스 재렌더와 별도
node scripts/review-video-batch.cjs --version=draft-v06 --label=decoded-version-review
```

비교 스크립트의 `phase`는 `walk`, `boarding`, `settle`, `paddle`, `blink`를 지원한다. `blink`는 실제 눈깜빡임 시각을 중심으로 잡는다. 출력한 비교 영상과 순서표를 열어 확인하기 전에는 검토 횟수에 포함하지 않는다.

책을 보는 자세들은 sprite-gen 준비 단계 오류 뒤 사용자 지시대로 세션 이미지 생성으로 전환한 결과다. `poses-black/`의 원본 크기와 발 등록 좌표를 코드에 명시한다. 작동하던 `cutout`만 알파 분리에 썼으며, 이 개별 PNG를 아틀라스 추출물이라고 부르지 않는다. 생성 모델이 그린 체크무늬는 투명도가 아니므로 단색 검사판에서 실제 알파를 확인한다.

## 공개·이식 경계

현재 영상은 생성한 2D 그림과 코드를 조합한 결과다. AI 비디오 생성 모델의 출력은 아니다. WebGL 의존성은 없지만 앱 포팅은 별도 구현이다. Figma 원본은 네 가지 전신 220px 비트맵이며 생성한 고해상도 파생본을 원본 벡터라고 소개하지 않는다. 과거 모모·다른 동물 시연 파일은 기록으로 보존하고 이 컷신에는 재사용하지 않는다.

생성 임시 런의 개인 절대 경로·인증·도구 캐시를 공개 저장소에 복사하지 않는다. 아틀라스와 상대경로 명세·선택한 결과·검토 근거만 전달한다.

확대 검토 이미지(`output/cutscenes/details`, `reviews`, `asset-qa`)는 Git에 전부 보존하되 Pages 빌드에는 중복 복사하지 않는다. 공개 검토실은 JSON 기록과 GitHub의 해당 프레임 폴더를 함께 연결한다. 실제 MP4·포스터·앱 에셋은 원본 화질로 배포한다. 빌드는 공개 묶음이 1,000,000,000바이트에 도달하면 중단한다. [GitHub Pages 공식 용량 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)를 기준으로 삼으며, 용량 때문에 원본이나 검토 이력을 지우지 않는다.
