# 모바일 활동 선택·건물 패널 개선 · 2026-09-09

## 적용 범위
main의 `doc/design-md/gachisup-v2`에 적용한다. 승인된 원화·리깅·세션 저장을 보존하며, 드러난 활동 선택과 모바일 가독성·주요 조작 크기를 개선한다. 분리 에셋 지도 기본 전환 및 다른 친구의 공부 모션은 이번 범위에서 제외한다.

## 시안 분석
`image-to-code`에 따라 내장 `imagegen`으로 두 개의 개별 화면 시안을 생성하고 확인했다. 신규 캐릭터나 지도를 생성해 교체하는 작업은 아니다.

- 활동: 종이색의 단일 패널, 상단 3개 선택, 선택된 장소의 단일 미리보기, 시간 선택, 고정된 시작 버튼 순서. 선택 상태는 색상뿐 아니라 밑줄·체크로 구분한다. 약 24px 좌우 여백, 본문 16px, 보조 설명 12px, 주요 버튼 최소 44px를 코드 기준으로 사용한다.
- 게시판: 따뜻한 모래색 공지 면과 물빛 액센트, 큰 제목 다음 본문·댓글의 순서. 공지 본문 16px/1.7, 보조 설명 12px. 생성 시안의 큰 빈 영역을 그대로 복제하지 않고 실제 게시글 수와 작성 권한을 따른다.
- 생성 시안은 853×1844 기준의 시각 참고이며 실제 390×844 뷰포트로 구현·검증한다. 원화가 부정확하게 재해석된 부분과 잘못 생성된 한글은 채택하지 않는다. 런타임 UI는 이미지 한 장이 아니라 기존 HTML 버튼·텍스트·상태 연결로 구현한다.

## 생성 기록
모드: 내장 imagegen 편집. 기존 실제 화면 캡처를 참고 입력으로 사용했다. 원본 생성 결과는 보존했다.

- [활동 선택 참고](assets/ia-references/activity-choice-v3.png)
- [게시판 참고](assets/ia-references/notice-readable-v2.png)

### 활동 시안 프롬프트
```text
Use case: ui-mockup. Make a fresh high-fidelity implementation reference for the existing Korean cozy island focus app Catus. Input image is a reference of the existing actual screen, preserve the same island and calico cat identity and muted sand/sea-glass visual family. Portrait image showing ONE 390x844 mobile interface at readable larger resolution, no phone bezel, no collage. Improve the bottom activity sheet: top 190px glimpse of the exact island with small island-name control. Rounded top sheet begins below. Paper #fff9ed, ink #3b4944, secondary ink #60685f, teal #4d7975, fine divider #e2d9c8. No watercolor UI, no new character design.
Sheet header compact row: small same map camp thumbnail, 오늘의 활동 in Jua-style24px, right expand and close each44px target. No second repeated headline. Immediately beneath a FLAT 3-way choice always visible, labels 독서 공부 휴식, 16px text with minimalist line icons, active 독서 has teal underline and small selected check. Not three feature cards, no nested boxes. One selected activity overview: original approved reading cat small132px wide on left, title 모닥불에서 독서 on right, short body 책장을 넘기며 조용히 집중해요. in readable16px. Below divider time heading 집중 시간 and optional25분 onright, three equal44px-minimum buttons 25분 50분 90분, selected filledteal. One plain row 쉬어 갈 앱 with chevron, no decorativecard. Bottom sticky primarybutton 25분 독서 시작하기, 52px tall16px. Below readable12px limitnote 로컬 시연 · 실제 앱 차단은 연결되지 않았어요. Use24px gutters16-24px vertical rhythm, calm legible composition, visible activity choices+preview+time+button within viewport. Preserve functions, reduce redundant moodcopy and tiny labels. No giant repeated headers, no ornamental gradients, no tiny9px text.
```

### 게시판 시안 프롬프트
```text
Use case: ui-mockup. Fresh high-fidelity mobile UI readability reference for existing Korean island app Catus. Input screenshot is reference; preserve all existing notice content and functionality and island-thumbnail style. ONE standalone full 390x844 mobile screen, portrait readable larger resolution, no bezel or collage. Warm sand paper#fff9ed, dark ink#3b4944, secondary#60685f, sea-glass#4d7975, divider#e2d9c8. Existing rounded top sheet with small glimpse of island above. Header uses44px existing map noticeboard thumbnail, 게시판 24px Jua-style, supporting 우리 섬의 소식 12px, two44x44 actualcontrols expand+close. Tabs 퀘스트 공지 자료 공유 each44high16px, active공지 tealunderline. Pinnednotice warm paleparchment thinborder no shadow, woodpin topright, inner24pxpadding. Metadata 고정 공지 · 모모 12px. Heading 오늘도 각자의 속도로. 22px Jua. Body16px with1.65lineheight, exact text 늦게 와도 괜찮아요. 모닥불 곁에는 늘 자리가 있으니까. 오늘의 작은 집중을 댓글로 나눠주세요. Footer 댓글 0 andarrow 14px. Beneath notice readable12px short role note 공지는 그룹장이, 댓글은 누구나. Rest ofsheet calmemptyreadingroom. Stickyfullwidth tealprimary 공지 쓰기 52high16px. Footer12px 이 브라우저에 저장 · 다른 사람에게 전송되지 않아요, wrapped naturally if needed. Make small text visibly stronger and bigger than screenshot, NOT a restyle. No forest-green, no gradients, no fake widgets, no new illustrations.
```

## 구현·검증 결과
main에 적용 완료. 이미지 시안 생성 후 실제 HTML·CSS로 구현했으며 런타임 원화·리깅 파일과 로컬 저장 모델은 교체하지 않았다.

- 독서·공부·휴식의 라디오 선택을 처음부터 노출. 한 개의 장소 미리보기와 시간·시작 문구가 함께 변경된다. 공부 아래 작업 태그 유지.
- 좌우·상하 방향키, Home/End 선택과 포커스 복원을 지원한다. 선택 상태를 밑줄·체크로 표시하고 IA 주소 및 모바일 프레임으로 전달한다.
- 휴식은 무료 기본 낚싯대와 5·10·15분, 기본 10분. 기존 휴식/집중 기록 분리와 모션은 유지했다.
- 게시판 목록·상세·댓글 본문 16px, 저장/미전송 설명과 통계 요약 12px. 활동 설명은 기본 16px, 좁거나 높이가 짧은 화면에서 15px.
- 닫기·펼치기, 통계 기간·날짜 조작은 실제 44×44px 이상. 작은 화면에서 활동 시간 선택이 하단 버튼에 가리지 않도록 시트 높이를 조정했다.
- 마을의 모바일 진입 이름을 ‘오늘의 활동’으로 변경. 최신 README를 갱신하고 초기 올리브색 시안 문서는 역사 기록으로 구분했다.

### 실제 캡처

- [390×844 활동 선택](screenshots/design-polish/390×844-read.png)
- [320×640 작은 휴대폰](screenshots/design-polish/320×640-read.png)
- [390×770 공부/작업](screenshots/design-polish/390×770-study.png)
- [390×844 낚시 휴식](screenshots/design-polish/390×844-rest.png)
- [390×844 게시판](screenshots/design-polish/390×844-notice.png)
- [390×844 통계](screenshots/design-polish/390×844-cabin.png)
- [1440×960 활동 선택](screenshots/design-polish/1440×960-read.png)
- [모바일 베젤](screenshots/design-polish/mobile-bezel.png)

### 검증

독립 브라우저 컨텍스트에서 실행했으며 사용자의 로컬 저장소를 초기화하지 않았다.

| 검사 | 통과 |
| --- | ---: |
| 새 활동 UI·키보드·가독성·조작 크기·짧은 화면 | 106 |
| 활동 시작·이동·리깅·복원·기록 분리 | 101 |
| IA 44개 화면 × 3개 너비 | 132 |
| 모바일 베젤·화면 전환·회전 상태 | 68 |
| IA 구조·낚시·섬 패널 테마 | 58 |
| 작성·첨부·권한·통계 등 기능 흐름 | 40 |
| 메인 진입·배경 전달 | 21 |
| **합계** | **526** |

새 UI 검사는 320×640, 390×770, 390×844, 768×1024, 1440×960에서 수행했다. 관련 JavaScript 구문 검사 및 런타임/로컬 에셋 오류 검사도 통과했다.
IA 전체 132개 검사는 기본 테마 반영 후 실행했으며 후속 짧은 높이 조정은 106개 신규 검사와 68개 모바일 검사로 재검증했다.

### 남은 경계

- 기본 지도는 여전히 1536×1024 단일 원화다. 분리 에셋 기본 전환·해상도 문제 해결 완료로 간주하지 않는다.
- 공부하는 다른 친구의 애니메이션은 미구현이다. 화면에서 준비 중임을 명시했다.
- 이번 변경은 실제 기기·네이티브 앱 이식·VoiceOver 인증이나 전면 접근성 통과를 의미하지 않는다. 월별 차트의 촘촘한 눈금은 별도 모바일 대안 검토가 남아 있다.
