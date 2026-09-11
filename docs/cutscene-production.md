# 고양이 첫 항해 · 제작 하네스

목표는 이야기 3개 × 연출 3개, 9편이다. 영상별 검토·개선 30회를 목표로 하며, 2026-09-12 오전 10시(KST)까지 개선한다. 출력 횟수·자동 테스트·아틀라스 생성 횟수는 시각 검토 완료 횟수로 계산하지 않는다.

## 원본과 담당 파일

| 바꿀 내용 | 파일 | 지켜야 할 선 |
| --- | --- | --- |
| 세 이야기와 가입 흐름 | `prologue-scenarios-data.js` | 이야기는 후보다. 실제 초대·동료를 꾸며내지 않는다. |
| 아홉 영상·타이밍·조정값 | `cutscene-production.js` | 이야기 × 연출의 9개 ID 유지 |
| 장면·카메라·동선·자막 | `cutscene-cinema.js` | 같은 캐릭터의 위치·크기·소품 연결 확인 |
| 검정 고양이 파츠의 색 연결 | `cutscene-fur-palette.js` | 중간톤·외곽선 측정값으로 런타임에서 보정. 원본 PNG·알파 불변. `?tone=source`로 원본 비교 |
| 뗏목·책·가방 레이어·나무 노 | `cutscene-renderer.js` | 기존 3편 시험 렌더러도 남아 있으나 현재 재생은 Cinema 사용 |
| 생성 동작 아틀라스 | `cutscene-sprites.js`, `assets/cutscenes/sprites/black/` | `manifest.json.frame_layout` 좌표로만 샘플링 |
| 개별 자세·발·손 등록점 | `cutscene-poses.js`, `assets/cutscenes/poses-black/walk-v1.json` | 현재 기본 `poses`. 원화·등록점·실험 상태를 구분 |
| 노 젓기 국소 관절 | `cutscene-paddle-rig.js`, `poses-black/paddle-*` | 기본 채택. 한 어깨 관절과 고정 몸체·눈 감김. 완성형 전신 리깅과 구분 |
| 수면 미세 흐름·물 영역 마스크 | `cutscene-water-motion.js` | 검토 52부터 기본. `?water=still`로 정지 원화 비교. 육지 픽셀 불변 검사 |
| 보행 국소 관절 | `cutscene-walk-rig.js`, `poses-black/walk-body-*`, `walk-leg-*` | 검토 40 이후 기본. `?walk=pose`로 이전 8자세 비교 |
| 착지·자세별 등록선 | `walk-v1.json.jump`, `walk-v1.json.landing` | 실제 원화 발바닥을 읽고 확인. 등록선을 일괄 지정하지 않음 |
| 관절 파츠 실험 | `cutscene-rig.js`, `assets/cutscenes/rig-black/` | 기본 재생과 별도. `actorMode: 'rig'`로 비교 |
| 캐릭터 여섯 종 출처 | `figma-cats.js`, `assets/figma-cats/README.md` | 추출 원본과 생성 파생본 구분 |
| 생성 프롬프트 | `assets/cutscenes/PROMPTS.md` | 사용 도구·기준 이미지·채택 여부를 정직하게 기록 |
| 선택·재생·다운로드 | `cutscenes.html`, `cutscene-studio.js` | Canvas 최신 연출과 MP4 고정 버전 구분 |
| 출력 버전·공개 범위 | `cutscene-export-catalog.js` | 최근 세 버전은 Pages 재생, 이전 MP4는 GitHub 원본 링크 |
| 영상 색 변환·디코딩 회귀 검사 | `scripts/cutscene-video-profile.cjs`, `scripts/verify-cutscene-video-color.cjs` | 출력 당시 RGB 기준을 manifest에 보존. 최신 Canvas와 옛 MP4를 비교하지 않음 |
| 검토 기록 | `cutscene-review-log.js` | 실제 확인한 범위·발견·수정·근거만 추가 |

## 현재 제공물

`cutscenes.html`에서 9편을 선택하고 실시간 연출과 MP4 초안을 볼 수 있다. `draft-v17`부터 `draft-v01`까지 열일곱 버전, 각각 9개 무음 MP4·포스터와 소스·에셋 지문을 가진 `manifest.json`이 있다. 총 153개는 버전별 보존본이며 서로 다른 이야기 153개가 아니다. 최근 세 버전은 페이지에서 재생하며 이전 버전은 같은 선택기에서 GitHub 원본 다운로드로 연결한다. 모두 24초·24fps·576프레임의 H.264/faststart이며 v01은 720 × 1280, v02 이후는 1080 × 1920이다. 실제 스트림 검사상 v01~v12는 full-range `yuvj420p`, v13부터는 limited-range `yuv420p`다.

v17은 검토 58번까지의 작은 갈매기 활공과 노 주기에 맞춘 전진을 포함한다. v16은 검토 56번까지의 작은 꼬리 관절을 포함한다. v15는 검토 55번까지이며 천을 접어 갑판 모서리에 싣는 동작과 연속 부두 앞발을 포함한다. v14는 검토 53번까지이며 뗏목 접촉 물결·수면 미세 흐름·노를 당길 때의 작은 상체 기울기를 포함한다. v13은 검토 50번까지이며 실제 MP4에서 확인한 색 변환 문제를 수정했다. v12는 검토 49번까지의 넓은 해안·출항 카메라·노의 입수와 복귀 표현을 포함하지만, 디코딩 색 문제를 발견해 최신 공개본 승격을 보류하고 v13으로 교체했다. v11은 검토 47번까지이며 책을 보는 네 자세의 색·천 가방 레이어·나무 노의 재질과 집기를 포함한다. v10은 검토 44번까지이며 30개 파츠의 털·외곽선 색을 맞춘다. v09는 검토 43번까지의 보행 눈 깜빡임과 접촉 그림자다. v08은 기록 41번까지의 발 접지 보행·실제 발바닥을 맞춘 도약·착지 회복, v07은 기록 39번까지의 고개 들기와 순차 노 잡기다. v06은 기록 38번까지의 앞발 국소 관절·손 옆의 노·감정형 섬광 제거, v05는 기록 35번까지, v04는 기록 30번까지다. 기록 58번 시점의 영상별 실제 검토 횟수는 53~55회다. 적용 대상별로 계산하며 출력·자동 검사는 더하지 않는다. 아직 완성형 리깅이나 사용자가 선택한 최종 시나리오가 아니다.

실시간 Canvas는 출력 후 수정 사항을 먼저 보여줄 수 있다. 이때 MP4를 같은 최신본이라고 표시하지 않는다. 다음 버전은 별도 폴더로 출력한다.

현재 Canvas의 기본 캐릭터는 개별 원화 방식(`poses`)이다. 걷기 8자세, 도약 5자세, 앞발 3자세, 일반 눈깜빡임과 노를 쥔 눈깜빡임을 기준 얼굴에 맞춰 생성했다. 이전 아틀라스는 `cutscenes.html?actor=sprite`, 관절 파츠 실험은 `?actor=rig`에서 비교한다. 보행 원화의 작은 발 움직임과 주기 경계 높이 차이 때문에 명세의 `experimental` 상태는 유지한다. 기본 채택은 시연 연결이지 완성형 리깅 승인과 다르다.

노 젓기는 `paddleRig: true`를 기본으로 쓴다. 같은 몸체 원화 뒤에서 앞발 하나를 어깨 기준으로 회전하고 그 변환으로 손잡이 접점을 계산한다. `?paddle=pose`로 고정 앞발 방식을 비교할 수 있다. 눈 감김은 몸체 원화만 교체하므로 손의 궤적은 바뀌지 않는다. 주기 폐합·손 이동·눈 감김 독립성은 자동 검사하되 체중 이동이나 미술적 자연스러움 통과로 취급하지 않는다.

검토 45부터 보정 대상은 34개다. 렌더러의 내려다보기·들기·내려놓기 원화도 로드 시 같은 보정표를 통과한다. 배경·소품·다른 고양이는 보정하지 않는다. 검토 46의 나무 노는 `paddleSprite`에 손잡이와 길이를 등록하고 `paddleRest`의 낮은 위치에서 기다린다. 앞발이 접근할 동안에는 고양이·짐 뒤에 그리며 실제 들어 올린 뒤 앞에 그린다.

검토 47의 `satchel()`은 몸체·손잡이·덮개 앞뒤 네 원화를 쓴다. `layer: back/front`로 책·앞발 사이에 입구 앞면을 끼워 넣고 덮개를 회전한다. 준비 장면은 `preparationAt().bagClosure`가 수납 완료 뒤에만 시작하는지 검사한다. 가방 원본의 채도는 보존하고 합성 시에만 낮춘다. 생성 프롬프트와 채택 범위는 `PROPS-PROMPTS.md`, `SATCHEL-LAYERS-PROMPTS.md`에 남긴다.

검토 48은 `paddleWaterAt()`의 노 축·수면 교점에 물결을 등록하고, 잠긴 날만 옅게 합성한다. 복귀 시 날 폭을 줄여 돌아 나오는 모양을 낸다. 2D 표현이며 유체 시뮬레이션이 아니다. 검토 49는 `coastWidth=960`의 넓은 배경과 카메라를 쓴다. 새 원화는 1086 × 1448이며 원본을 그대로 유지한 4K 아웃페인팅이 아니다. `COAST-EXTENSION-PROMPTS.md`에 부분 합성 실패와 전체 새 배경 채택을 기록한다. 부두 대기점·밧줄·승선 시작도 함께 등록한다. 카메라 2,169개 표본에서 노 끝의 화면 여유와 배경 바깥 노출을 검사한다.

검토 50에서는 Chromium에서 실제 MP4를 디코딩해 Canvas 원본과 비교했다. JPEG의 BT.601 full-range를 BT.709 limited-range로 명시 변환하고 `setparams`와 출력 메타데이터에 sRGB 전달 함수·BT.709 원색을 함께 기록한다. 9편 × 3시점의 프로파일 비교에서 RGB 평균 절대 오차가 약 10.00에서 1.98로 줄었다. v13 실제 영상에는 출력 시 저장한 3시점 × 84개 5×5 RGB 영역을 비교하는 회귀 검사를 추가했다. 총 2,268개 영역 검사와 실제 디코딩 장면 108개 확인을 통과했다. 모든 모바일 재생기·디스플레이의 색 인증을 뜻하지 않는다. `videoProfile`이 없는 이전 버전은 색 변환 미검증 경고와 함께 보존한다.

검토 51은 `raft-water-rim-v1.png`를 갑판 아래에 등록하고 딱딱한 타원 그림자를 부드럽게 바꾼다. `?raft=shadow`로 이전 접촉 표현을 비교한다. 검토 52는 `cutscene-water-motion.js`를 본편에 연결한다. 두 해안의 물 영역만 약 3.18 논리 픽셀 이내에서 굴절시키고 육지·부두 픽셀은 유지한다. `?water=still`로 정지 원화와 비교한다. `scripts/review-water-surface.cjs`는 마스크·원본 크기 물 부분·차이 영상을 남긴다. 두 기능은 v13에는 없고 v14부터 포함된다.

검토 53은 발바닥 선을 고정한 작은 상체 기울기를 노 젓는 주기에 맞춘다. 몸체·앞발·손잡이 좌표에 같은 변환을 적용하고, 처음 잡을 때 0.55초에 걸쳐 시작한다. `?weight=still`로 이전 몸체를 비교한다. 전신 체중 이동 리깅이 아니라 2D 변환이다. 접점·발바닥 불변 자동 검사와 9편 확대 표본, 연속 프레임을 함께 확인했다.

검토 54는 두 번째 이야기의 덮개를 두 방향으로 차례로 접고 `raft-cloth-folded-v1.png`로 연결한다. 접힌 천은 갑판 모서리에 남아 뗏목의 이동·회전·크기를 함께 따른다. 부두로 옮기던 중간 실험은 미채택했다. `?cloth=shrink`로 이전 축소 방식을 비교한다. 격자 변형이며 실제 천 물리나 양손 리깅은 아니다. `CLOTH-FOLD-PROMPTS.md`에 생성·채택 범위를 기록한다.

검토 55는 `dockAt()`에서 앞발 뻗기·당기기·내려놓기를 연속 좌표로 잇는다. 얼굴 원화는 바꾸지 않고 밧줄 끝은 실제 손 좌표를 따른다. `?dock=pose`로 이전 세 자세를 비교한다. 1,001개 좌표 표본과 고정 얼굴 영역·눈 감김 독립성을 검사한다. 전신·양손·밧줄 역학은 별도다.

검토 56은 `paddle-tail-layer-v1.png`를 부두와 노 젓기 자세에 연결한다. 기존 몸의 꼬리만 런타임 마스크로 가리고 뿌리를 몸 뒤에 등록했다. 얼굴·수염·손 접점은 유지하며 `?tail=still`로 이전 꼬리를 비교한다. 577개 시간 표본과 눈 세 상태 × 7시점의 얼굴 영역 변경 0·손 접점 오차 0을 확인했다. 걷기·도약·책을 보는 자세에는 쓰지 않는다. 색 보정 대상은 이 파츠를 포함해 35개다. v15에는 없고 v16부터 포함된다.

검토 57은 `seagull-glide-v1.png`를 먼 하늘의 두 마리 활공에 연결한다. 여정형에서 화면 위로 잘리던 첫 배치를 낮췄다. `?birds=off`로 비교하며 방·모래 배경·하늘 아래 픽셀은 바꾸지 않는다. 원화 한 장의 작은 기울기·경로 표현이고 날갯짓이나 비행 물리가 아니다. v16 MP4에는 없고 v17부터 포함된다.

보행도 검토 40 이후 `walkRig: true`를 쓴다. 같은 얼굴·몸체 뒤와 앞에 세 다리를 합성하고, 실제 동선 위의 접지 목표와 몸의 이동을 분리한다. 복부 밑선과 다리 윗선의 과한 윤곽은 생성 원화에서 정리하고 겹침 경계만 런타임 마스크로 잇는다. 8,109개 거리 표본에서 접지 목표가 고정되는지 검사한다. 고정 상체·단순한 다리이며 전신 체중 이동과 방향 전환은 별도 개선 대상이다. 이전 8자세는 `?walk=pose`로 비교한다.

검토 42부터 보행의 얼굴 바탕(`walk-body-no-eyes-v1`)과 눈 세 상태(`walk-eyes-*-layer-v1`)를 분리한다. 걷기 시작 0.9초 뒤부터 0.24초 동안 윗눈꺼풀이 내려왔다 돌아온다. 같은 자세의 픽셀 비교로 눈 밖 변경 0과 발 좌표 보존을 검사한다. 첫 사각형 얼굴 패치 실험은 색 경계가 보여 미채택했으며 `WALK-BLINK-PROMPTS.md`에 생성·폐기 판단을 남긴다. 검토 43의 그림자는 2D 접촉 표현이며 실제 광원이나 지형 높이 시뮬레이션이 아니다.

부두에 내린 뒤가 아니라 **뗏목에 착지한 뒤** 짐을 정리한다. 착지부터 출항 전까지 v06은 1.65초, v07은 2.2초, v08은 착지 회복을 늘린 2.36초다. 첫 0.36초에 무게 받기→몸 세우기 세 원화를 거친다. `settlingAt()`의 `elapsed`는 실제 착지 후 시간, `motionElapsed`는 추가한 0.16초를 제외한 짐 정리 시간이다. 가방 내려놓기→책 꺼내기→펼치기→내려놓기→고개 들기→노 잡기 순서와 `preparationAt()`의 출발 준비 순서는 각각 4,509개 시간 표본으로 검사한다. 고개 들기 원화 다섯 장은 `walk-v1.json.recovery`에 명시한다. 도약·착지 8장의 알파 발바닥과 등록선 일치도 검사한다. 앞발이 접근하는 초기 구간에는 노가 제자리에 남는지 별도 검사한다. 이 좌표 검사는 접점 보존만 보장하며 어깨·팔 전체의 자연스러움을 판정하지 않는다.

## 검토·출력 명령

검토 58의 `strokeTravel()`은 기존 동선과 시종점을 유지하며 2.8초 노 주기에 작은 전진 박자를 더한다. `?travel=even`으로 이전 시간 곡선을 비교한다. 실제 유체·부력·노 힘 계산은 아니다. `verify-cutscene-oar-travel.cjs`에서 18개 구간의 단조 진행과 시종점 보존을 검사한다.

출력기는 `--fps=24|30|48|60`을 지원한다. 기본은 24이며 v17까지의 9편 배치는 모두 24fps다. `cadence-60-study-v1`은 첫 감정형 한 편만 60fps로 출력한 비교용 원본이고 9편 배치로 세지 않는다. 24fps 영상을 보간한 것이 아니라 같은 시간 함수에서 1/60초마다 다시 그린다. 색 표본 시간은 fps와 무관하게 2.5·16·23.5초로 유지한다.

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

더 촘촘한 확대 검토는 아래 명령을 사용한다. `--samples`는 2~24개, `--crop`은 논리 화면의 180~720px이다. 확대 중심은 캐릭터의 발 위치를 따라가므로 화면 전체의 동선 평가는 개요 캡처와 함께 해야 한다. `--anchor=ground`는 모래 그림처럼 발 아래 상호작용을 함께 보여준다. `boarding-link`, `book-lift`, `walk-link`, `paddle-loop`, `dock` 구간도 제공한다. `dock`은 두 번째 이야기의 1.4초 덮개 동작과 다른 이야기의 0.95초 부두 동작을 각각 따른다. 파일은 `output/cutscenes/details/<label>/`에 저장하며 기존 이름을 덮어쓰지 않는다.

```sh
node scripts/review-cutscene-detail.cjs --label=boarding-review --phase=boarding-link --from=0 --to=1 --samples=12 --crop=280

# 이전 아틀라스와 개별 원화의 같은 시점 비교 MP4·연속 프레임
node scripts/review-walk-poses.cjs --label=walk-comparison --film=new-morning-emotion --phase=walk --adjacent

# 몸체는 유지하고 앞발만 움직이는 국소 관절 비교
node scripts/review-walk-poses.cjs --label=paddle-comparison --film=new-morning-emotion --phase=paddle --paddle=rig --adjacent

# 현재 시연의 짧은 동작만 실제 속도로 출력하고 모든 연속 프레임을 묶는다.
node scripts/review-walk-poses.cjs --label=recovery-motion --film=new-morning-emotion --phase=recovery --single --adjacent

# 인코딩된 MP4 자체에서 표본 추출. 캔버스 재렌더와 별도
node scripts/review-video-batch.cjs --version=draft-v06 --label=decoded-version-review

# 해당 출력 당시의 RGB 표본과 실제 MP4 색 비교
node scripts/verify-cutscene-video-color.cjs --version=draft-v13

# 인코딩 프로파일별 정지 장면 비교. 0.5초 시험 파일은 본편 수에 포함하지 않음
node scripts/review-color-pipeline.cjs --label=color-study --profiles=legacy,tagged-srgb

# 원화 알파 경계 읽기. 발바닥인지 직접 확인한 뒤 명세에 등록한다.
node scripts/inspect-pose-registration.cjs jump-landing-reach-v1 jump-touchdown-soft-v2
```

비교 스크립트의 `phase`는 `packing`, `walk`, `walk-blink`, `dock`, `boarding`, `settle`, `recovery`, `paddle`, `blink`를 지원한다. `packing`은 준비 장면 후반의 책 수납과 가방 들기, `dock`은 부두에서 출발을 준비하는 짧은 동작이다. `blink`는 노를 젓는 중 실제 눈깜빡임, `walk-blink`는 각 영상의 보행 중 실제 깜빡임 시각을 중심으로 잡는다. `--single`은 현재 기본 보행까지 따르고, `--walk=rig` 비교는 왼쪽 8자세와 오른쪽 관절 보행을 명시한다. `--water=compare`, `--setting=raftContact`, `--setting=paddleWeight`, `--setting=clothFold`, `--setting=dockRig`, `--setting=tailRig`로 같은 시점의 수정 전후를 비교한다. 출력한 비교 영상과 순서표를 열어 확인하기 전에는 검토 횟수에 포함하지 않는다.

연속 동작 비교에도 `--crop=180~720`을 쓸 수 있다. `--anchor=water`는 고양이 아래·옆의 노와 물을 함께 보도록 중심을 낮춘다. 잘린 노를 확대 검토에서 놓치지 않도록 전체 장면 캡처도 함께 확인한다.

책을 보는 자세들은 sprite-gen 준비 단계 오류 뒤 사용자 지시대로 세션 이미지 생성으로 전환한 결과다. `poses-black/`의 원본 크기와 발 등록 좌표를 코드에 명시한다. 작동하던 `cutout`만 알파 분리에 썼으며, 이 개별 PNG를 아틀라스 추출물이라고 부르지 않는다. 생성 모델이 그린 체크무늬는 투명도가 아니므로 단색 검사판에서 실제 알파를 확인한다.

## 공개·이식 경계

현재 영상은 생성한 2D 그림과 코드를 조합한 결과다. AI 비디오 생성 모델의 출력은 아니다. WebGL 의존성은 없지만 앱 포팅은 별도 구현이다. Figma 원본은 네 가지 전신 220px 비트맵이며 생성한 고해상도 파생본을 원본 벡터라고 소개하지 않는다. 과거 모모·다른 동물 시연 파일은 기록으로 보존하고 이 컷신에는 재사용하지 않는다.

생성 임시 런의 개인 절대 경로·인증·도구 캐시를 공개 저장소에 복사하지 않는다. 아틀라스와 상대경로 명세·선택한 결과·검토 근거만 전달한다.

확대 검토 이미지(`output/cutscenes/details`, `reviews`, `asset-qa`)는 Git에 전부 보존하되 Pages 빌드에는 중복 복사하지 않는다. 공개 검토실은 JSON 기록과 GitHub의 해당 프레임 폴더를 함께 연결한다. 출력 카탈로그의 최근 세 버전 MP4·모든 포스터·앱 에셋은 원본 화질로 배포한다. 이전 MP4는 Git에 그대로 보존하고 선택기에서 원본 다운로드로 연결한다. 빌드는 공개 묶음이 1,000,000,000바이트에 도달하면 중단한다. [GitHub Pages 공식 용량 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)를 기준으로 삼으며, 용량 때문에 원본이나 검토 이력을 지우지 않는다.
