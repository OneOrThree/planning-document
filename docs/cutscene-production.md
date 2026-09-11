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
| 관절 파츠 실험 | `cutscene-rig.js`, `assets/cutscenes/rig-black/` | 기본 재생과 별도. `actorMode: 'rig'`로 비교 |
| 캐릭터 여섯 종 출처 | `figma-cats.js`, `assets/figma-cats/README.md` | 추출 원본과 생성 파생본 구분 |
| 생성 프롬프트 | `assets/cutscenes/PROMPTS.md` | 사용 도구·기준 이미지·채택 여부를 정직하게 기록 |
| 선택·재생·다운로드 | `cutscenes.html`, `cutscene-studio.js` | Canvas 최신 연출과 MP4 고정 버전 구분 |
| 검토 기록 | `cutscene-review-log.js` | 실제 확인한 범위·발견·수정·근거만 추가 |

## 현재 제공물

`cutscenes.html`에서 9편을 선택하고 실시간 연출과 MP4 초안을 볼 수 있다. `draft-v03`, `draft-v02`, `draft-v01` 세 버전을 비교한다. 각각 9개 무음 MP4·포스터와 소스·에셋 지문을 가진 `manifest.json`이 있다. 24초·24fps·576프레임의 H.264/yuv420p/faststart이며 v01은 720 × 1280, v02·v03은 1080 × 1920이다. v03은 검토 기록 22번까지의 상태로, 새 시선·짧은 부두·이야기별 승선 준비·그림책 전환·자막 개선을 포함한다. 그 이후 가방·밧줄의 앞뒤 겹침 수정은 실시간 연출에 먼저 반영되어 있다. 완성형 리깅이나 사용자 선택된 최종 시나리오라는 의미는 아니다.

실시간 Canvas는 출력 후 수정 사항을 먼저 보여줄 수 있다. 이때 MP4를 같은 최신본이라고 표시하지 않는다. 다음 버전은 별도 폴더로 출력한다.

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

더 촘촘한 확대 검토는 아래 명령을 사용한다. `--samples`는 2~24개, `--crop`은 논리 화면의 180~720px이다. 확대 중심은 캐릭터의 발 위치를 따라가므로 화면 전체의 동선 평가는 개요 캡처와 함께 해야 한다. `boarding-link`, `book-lift`, `walk-link`, `paddle-loop` 구간도 제공한다. 파일은 `output/cutscenes/details/<label>/`에 저장하며 기존 이름을 덮어쓰지 않는다.

```sh
node scripts/review-cutscene-detail.cjs --label=boarding-review --phase=boarding-link --from=0 --to=1 --samples=12 --crop=280
```

책을 보는 두 자세는 sprite-gen 준비 단계 오류 뒤 사용자 지시대로 세션 이미지 생성으로 전환한 결과다. `poses-black/`의 원본 크기와 발 등록 좌표를 코드에 명시한다. 작동하던 `cutout`만 알파 분리에 썼으며, 이 개별 PNG를 아틀라스 추출물이라고 부르지 않는다. 생성 모델이 그린 체크무늬는 투명도가 아니므로 단색 검사판에서 실제 알파를 확인한다.

## 공개·이식 경계

현재 영상은 생성한 2D 그림과 코드를 조합한 결과다. AI 비디오 생성 모델의 출력은 아니다. WebGL 의존성은 없지만 앱 포팅은 별도 구현이다. Figma 원본은 네 가지 전신 220px 비트맵이며 생성한 고해상도 파생본을 원본 벡터라고 소개하지 않는다. 과거 모모·다른 동물 시연 파일은 기록으로 보존하고 이 컷신에는 재사용하지 않는다.

생성 임시 런의 개인 절대 경로·인증·도구 캐시를 공개 저장소에 복사하지 않는다. 아틀라스와 상대경로 명세·선택한 결과·검토 근거만 전달한다.
