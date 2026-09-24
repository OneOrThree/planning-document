# 섬 창 · 낚시 휴식 개선
2026-09-09. 원화는 내장 imagegen으로 생성/편집했다. CLI/API 미사용.

## 건물 창 참조 분석
assets/ia-references/island-panel-v1.png
- 모래빛 아이보리 바탕, 낮은 채도의 바다 유리색 강조, 실제 지도 속 건물 썸네일.
- 24px 여백, 둥근 제목 22px, 읽기용 본문, 44~52px 조작 영역을 유지한다.
- 공지는 옅은 모래색과 가는 테두리, 나무색 핀으로 정리한다.
- 통계/작성/상점/알림/권한/확인 창에도 같은 색 계열을 적용한다. 수치·권한·검증은 유지한다.

## 기본 낚싯대
- 휴식은 배 위에서 낚시하며 쉬는 활동이다. 낚싯대는 항상 기본 제공하며 구매·차감·장착 조건이 없다.
- 물고기 수집/보상 게임으로 확장하지 않는다. 집중 통계·퀘스트·랭킹·지갑에 휴식 시간을 포함하지 않는다.
- 기존 모모와 배를 유지하고 낚싯줄을 코드 모션으로 연결한다.
- 최종 원화: `assets/momo-fishing-boat-v1.png`, 1254×1254 RGBA. 원본 체크무늬 후보는 사용하지 않는다.
- 낚싯대·쥐는 앞발을 같은 관절로 움직이고, 줄의 시작점은 리그의 변환된 끝점에 매 프레임 연결한다. 찌와 물결은 같은 리그 시간으로 움직여 일시정지·동작 줄임을 따른다.
- 출항을 건너뛴 뒤 실제 화면 안의 배를 IntersectionObserver가 비가시로 판정해 모션이 멈추는 경로를 수정했다. 카메라가 따라가는 활동 리그만 가시성 관찰을 끄고, 기존 활성/정지 상태 및 문서 숨김으로 재생을 제어한다. 다른 캐릭터의 관찰 방식은 유지한다.

## 확인
- IA 전체 화면 132개: 35화면+9시트 × 320/390/768px. 경로·런타임·가로 넘침 실패 0.
- `verify-ia-revision.cjs` 58개: 구조/검색/5개 크기/실제 활동/무료 낚싯대/일시정지/휴식 결과/모바일 왕복/역할/섬 창 원화.
- `verify-activities.cjs` 101개: 실제 시작·이동·모션·정지·새로고침 복원·기록 분리. 위 가시성 문제 수정 후 전체 재검사 통과.
- `verify-mobile-preview.cjs` 68개, `verify-prototype-entry.cjs` 21개, `verify-ia-edges.cjs` 기존 36개 연결 통과.
- 캡처: `screenshots/ia-overview-*.png`, `screenshots/ia-cabin-*.png`, `screenshots/fishing-phone.png`, `screenshots/ia/`.

## 프롬프트
### 건물 창 UI 참조
```text
Use case: ui-mockup. Make one high-fidelity standalone Korean mobile building-panel design for the existing cozy island app 'Catus', using Image1 as the functional layout reference and Image2 as the world/art/color reference. This is a UI theme refinement, preserve the screen's existing functions and readable hierarchy. Image1 currently is too forest-green stationery; make the panel belong to the sandy shore, turquoise sea, terracotta-roof and warm wood of Image2. Portrait1024x1536, single readable full mobile screen with small glimpse of island map above rounded top of sheet. NOT a collage, no phone bezel.
Warm shell-ivory paper #fff9ec main sheet, clear dark ink#3b4944, desaturated sea-glass teal#4d7975 primaryaction, pale seafoam#e3efeb selectedtab, sandy stone#ddd4bf dividers, small terracotta#b87f61 pin. Crisp thin strokes and flat gentlecel colors, not watercolor, no dark greenforestbuttons, no gradients, no leaf borders, no noisytextures, no heavyshadows.
Header: small rounded-square thumbnail of the EXACT wooden noticeboard from Image2 instead of generic green icon; label '게시판' with smaller '우리 섬의 소식과 약속', right chevrondown andclose,44pxcontrols. Thin sandydivider. Flat tabs '퀘스트', active '공지', '자료 공유'; active subduedtealunderline. A pinned notice with offwhite parchment(not mustardyellow), woodenpin, fineborder: '고정 공지 · 모모 · 처음 제공된 글'; title '오늘도 각자의 속도로.'; body '늦게 와도 괜찮아요.\n모닥불 곁에는 늘 자리가 있으니까.\n\n오늘의 작은 집중을 댓글로 나눠주세요.'; footer '댓글 0' andarrow. Use Jua-like rounded Korean headings, readable Korean sans-serifbody14px target. Below notice small '현재 역할 · 그룹장 · 공지/퀘스트는 그룹장, 자료/댓글은 모든 멤버'. Large purposeful empty readingroom until stickybottomfullwidth desaturatedseaglassbutton '공지 쓰기', secondarymutedfooter '이 브라우저에 저장 · 다른 사람에게 전송되지 않아요'. Enforce24pxgutters, consistent16radius,48pxactions, generous verticalrhythm. Exact realmapnoticeboard thumbnail, not a different building. The final must feel like the same island world, calmcoastalstationery and warmwood, legible balancedconsistent.
```
### 낚시 원화
```text
Use case: precise-object-edit. Edit target: attached transparent game sprite of Momo the calico cat in a small wooden rowboat. Preserve the SAME cat identity, open olive eyes, exact calico orange/dark-brown/cream fur patches, gentle face, cozy crisp cel/vector-like style, boat silhouette, perspective, beige cushions, oars, rope coil and original square composition. Do NOT enlarge boat or change camera. Keep actual transparent alpha background, no white fill, no checkerboard pixels, no scenery.
Only change the cat's viewer-right front paw pose so it gently holds one simple fishing rod for a calm fishing break. Basic default rod: slender warm bamboo/honey-brown rod, minimal wrapped cream grip, no fancy reel or ornament, modest free starter item. Grip sits near the cat's current viewer-right paw at normalized (620,560) in a1000x1000coordinate canvas. Rod extends diagonally upwards to viewer-right, entirely to the RIGHT of the cat's face, from grip(620,560) to rod tip around(900,145). The tip gently curves, but do not cross or cover the cat's eyes/face. Keep the cat's other paw resting on the boat gunwale. The rod must fit within existing transparent canvas margins. IMPORTANT: render the rod and gripping paw only; do NOT draw any fishing line, float, fish, hook, water, effects, text, label or background. The thin fishing line and bobber will be animated in code separately from rod tip. Preserve all other positions to make existing character rig reusable. Sharp clean contours, low saturation, restrained two-tone shading, not watercolor or fuzzy paint.
```
### 투명 배경 수정
첫 생성은 체크무늬가 불투명 픽셀로 포함되어 그대로 사용하지 않았다.
```text
Use case: background-extraction. Edit target Image1 is the approved Momo cat holding a bamboo fishing rod in a wooden rowboat. Remove ONLY the baked gray checkerboard background and replace it with real transparent alpha pixels. Preserve the cat, rod, hands, boat, oar, rope, colors, contours, exact positions and square canvas framing. No redraw or restyle. Keep all foreground pixels including fine fishing rod tip, no missing objects, no added line or water. This PNG must have a genuine RGBA alpha channel with transparent exterior; DO NOT render a picture of transparency, no checkerboard pixels, no gray or white solid background. Same calm cel game sprite, ready to composite over the sea.
```
