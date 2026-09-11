# ELI5 설명 페이지

2026-09-09. 앱 구현 변경이 아닌 기획 설명 자료.

- 페이지: https://oneorthree.github.io/planning-document/eli5.html
- 흐름: 각자 집중 → 장소 완성 → 방장이 시간 퀘스트로 초대 → 같은 장소에 다시 모임.
- 자료: 기존 캐릭터 원화와 설명용 SVG 도식. 새로운 배경·리깅 원화는 생성하지 않았다.
- 효과는 검증 전 기대사항으로 표시했다. 건설 조건·비용·보상은 미정이며 실제 앱 기능으로 표현하지 않았다.
- 원본 기획: [cooperative-places-planning.md](cooperative-places-planning.md).
- 앱의 JavaScript·스타일·기록 저장소는 수정하지 않았다.

## 스킬 설치와 적용

`find-skills`로 후보를 찾고, `skill-installer`로 아래 ELI5만 설치했다. 설치 전 원본 지침을 확인했고, 설치 후 파일을 다시 읽어 적용했다.
`eli5`는 ‘큰 그림과 적은 글의 HTML 설명’ 방식이다. 전문용어 설명을 늘리는 대신 네 장면의 이야기·현재와의 차이·기대 효과를 보여주도록 사용했다.

- 소스: https://github.com/anthropics/claude-plugins-community/tree/main/eli5/skills/eli5
- 설치 위치: `로컬 설치 스킬`
- 설치 방식: 기본 다운로드가 로컬 Python 인증서 오류로 실패하여, 제공된 설치 도구의 Git 방식을 사용했다. TLS 검증을 끄지 않았다.
- 다음 턴부터 설치된 스킬 목록에 반영된다. 이번 턴에는 설치된 지침을 직접 읽어 적용했다.

## 검증

`node verify-eli5.cjs`: 76개 통과.
1440·390·320px 너비에서 4개 장면, 가로 넘침 없음, 단계 선택·키보드·링크 해시 복원, 44px 탭 조작, 로컬 저장소 미변경, 런타임·로컬 리소스 오류 없음을 확인했다.
실제 캡처: `screenshots/eli5/`.
