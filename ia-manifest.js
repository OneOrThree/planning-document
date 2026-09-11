/* 원본 35개 화면·36개 연결을 보존하고 공동 장소 CP-1을 추가했다. 상세 상태는 ia-structure.js. */
window.GachisupIA={
  "source": "사용자 제공 원본: ia-flow.html",
  "screens": [
    {"id":"cp1","label":"CP-1 우리의 작은 부두","context":"공동 장소"},
    {
      "id": "pr1",
      "label": "PR-1 프로필",
      "context": "프로필과 꾸미기"
    },
    {
      "id": "pr2",
      "label": "PR-2 친구 꾸미기",
      "context": "프로필과 꾸미기"
    },
    {
      "id": "pr3",
      "label": "PR-3 섬 꾸미기",
      "context": "프로필과 꾸미기"
    },
    {
      "id": "on1",
      "label": "ON-1 시작",
      "context": "처음 만나는 섬"
    },
    {
      "id": "on2",
      "label": "ON-2 로그인",
      "context": "처음 만나는 섬"
    },
    {
      "id": "on3",
      "label": "ON-3 기존 사용자 안내",
      "context": "처음 만나는 섬"
    },
    {
      "id": "on4",
      "label": "ON-4 친구 만들기",
      "context": "처음 만나는 섬"
    },
    {
      "id": "on5",
      "label": "ON-5 소속 선택",
      "context": "처음 만나는 섬"
    },
    {
      "id": "on5a",
      "label": "ON-5a 섬 만들기",
      "context": "처음 만나는 섬"
    },
    {
      "id": "on5b",
      "label": "ON-5b 섬 참여",
      "context": "처음 만나는 섬"
    },
    {
      "id": "on6",
      "label": "ON-6 우리 섬에 입항",
      "context": "처음 만나는 섬"
    },
    {
      "id": "plaza",
      "label": "PL-1 마을 전체",
      "context": "마을"
    },
    {
      "id": "fo1",
      "label": "FO-1 활동 시작",
      "context": "집중과 휴식"
    },
    {
      "id": "fo2",
      "label": "FO-2 활동 중",
      "context": "집중과 휴식"
    },
    {
      "id": "fo3",
      "label": "FO-3 세션 결과",
      "context": "집중과 휴식"
    },
    {
      "id": "fo4",
      "label": "FO-4 잠금화면 시안",
      "context": "집중과 휴식"
    },
    {
      "id": "vh1",
      "label": "VH-1 섬 현황",
      "context": "마을회관"
    },
    {
      "id": "vh2",
      "label": "VH-2 집중 기록",
      "context": "오두막"
    },
    {
      "id": "vh3",
      "label": "VH-3 섬 설정",
      "context": "마을회관"
    },
    {
      "id": "vh4",
      "label": "VH-4 금고 내역",
      "context": "마을회관"
    },
    {
      "id": "bd1",
      "label": "BD-1 공지",
      "context": "게시판"
    },
    {
      "id": "bd1a",
      "label": "BD-1a 공지 상세",
      "context": "게시판"
    },
    {
      "id": "bd2",
      "label": "BD-2 퀘스트",
      "context": "게시판"
    },
    {
      "id": "bd3",
      "label": "BD-3 퀘스트 상세",
      "context": "게시판"
    },
    {
      "id": "bd3a",
      "label": "BD-3a 자료 공유",
      "context": "게시판"
    },
    {
      "id": "bd4",
      "label": "BD-4 퀘스트 만들기",
      "context": "게시판"
    },
    {
      "id": "ob1",
      "label": "OB-1 그룹 주간 순위",
      "context": "전망대"
    },
    {
      "id": "ob2",
      "label": "OB-2 섬 간 순위",
      "context": "전망대"
    },
    {
      "id": "po1",
      "label": "PO-1 받은 편지함",
      "context": "우체국"
    },
    {
      "id": "po2",
      "label": "PO-2 편지 보내기",
      "context": "우체국"
    },
    {
      "id": "po3",
      "label": "PO-3 콕 찌르기",
      "context": "우체국"
    },
    {
      "id": "po4",
      "label": "PO-4 수신 설정",
      "context": "우체국"
    },
    {
      "id": "hb1",
      "label": "HB-1 내 섬",
      "context": "항구"
    },
    {
      "id": "hb2",
      "label": "HB-2 섬 찾기",
      "context": "항구"
    },
    {
      "id": "hb3",
      "label": "HB-3 다른 섬 구경",
      "context": "항구"
    }
  ],
  "edges": [
    {"from":"plaza","to":"cp1","label":"같이 만든 장소"},
    {"from":"cp1","to":"bd2","label":"모임 퀘스트"},
    {"from":"cp1","to":"fo2","label":"참여 후 집중"},
    {"from":"fo3","to":"cp1","label":"같은 부두로"},
    {
      "from": "on1",
      "to": "on2"
    },
    {
      "from": "on2",
      "to": "on3",
      "label": "기존 유저"
    },
    {
      "from": "on2",
      "to": "on4"
    },
    {
      "from": "on4",
      "to": "on5"
    },
    {
      "from": "on5",
      "to": "on5a"
    },
    {
      "from": "on5",
      "to": "on5b"
    },
    {
      "from": "on5a",
      "to": "on6"
    },
    {
      "from": "on5b",
      "to": "on6"
    },
    {
      "from": "on6",
      "to": "plaza",
      "label": "입항 연출"
    },
    {
      "from": "plaza",
      "to": "fo1",
      "label": "활동 선택"
    },
    {
      "from": "fo1",
      "to": "fo2"
    },
    {
      "from": "fo2",
      "to": "fo3",
      "label": "종료 확인 후 결과"
    },
    {
      "from": "fo2",
      "to": "fo4",
      "label": "잠금화면 시안"
    },
    {
      "from": "plaza",
      "to": "vh1"
    },
    {
      "from": "vh1",
      "to": "vh2"
    },
    {
      "from": "vh1",
      "to": "vh3"
    },
    {
      "from": "vh1",
      "to": "vh4"
    },
    {
      "from": "plaza",
      "to": "bd1"
    },
    {
      "from": "bd1",
      "to": "bd1a"
    },
    {
      "from": "bd1",
      "to": "bd2",
      "label": "탭 전환"
    },
    {
      "from": "bd2",
      "to": "bd3",
      "label": "포스트잇 탭"
    },
    {
      "from": "bd3",
      "to": "bd3a"
    },
    {
      "from": "bd2",
      "to": "bd4"
    },
    {
      "from": "plaza",
      "to": "ob1"
    },
    {
      "from": "ob1",
      "to": "ob2"
    },
    {
      "from": "ob2",
      "to": "hb3",
      "label": "다른 섬 구경"
    },
    {
      "from": "plaza",
      "to": "po1"
    },
    {
      "from": "po1",
      "to": "po2"
    },
    {
      "from": "po1",
      "to": "po3"
    },
    {
      "from": "po1",
      "to": "po4"
    },
    {
      "from": "plaza",
      "to": "hb1"
    },
    {
      "from": "hb1",
      "to": "hb2"
    },
    {
      "from": "hb2",
      "to": "hb3",
      "label": "미리보기"
    },
    {
      "from": "plaza",
      "to": "pr1",
      "label": "내 아바타 탭"
    },
    {
      "from": "pr1",
      "to": "pr2"
    },
    {
      "from": "pr1",
      "to": "pr3"
    }
  ],
  "sheets": [
    {
      "id": "sh1",
      "label": "SH-1 앱 차단·권한 안내",
      "context": "집중과 휴식",
      "parent": "fo1"
    },
    {
      "id": "sh2",
      "label": "SH-2 활동 종료 확인",
      "context": "집중과 휴식",
      "parent": "fo2"
    },
    {
      "id": "sh3",
      "label": "SH-3 공지 작성·수정",
      "context": "게시판",
      "parent": "bd1"
    },
    {
      "id": "sh4",
      "label": "SH-4 자료 작성·첨부",
      "context": "게시판",
      "parent": "bd3a"
    },
    {
      "id": "sh5",
      "label": "SH-5 자료 신고",
      "context": "게시판",
      "parent": "bd3a"
    },
    {
      "id": "sh6",
      "label": "SH-6 친구 상세",
      "context": "우체국",
      "parent": "po3"
    },
    {
      "id": "sh7",
      "label": "SH-7 초대·공유",
      "context": "마을회관",
      "parent": "vh3"
    },
    {
      "id": "sh8",
      "label": "SH-8 가입 승인",
      "context": "마을회관",
      "parent": "vh3"
    },
    {
      "id": "sh9",
      "label": "SH-9 구매 확인",
      "context": "프로필과 꾸미기",
      "parent": "pr2"
    }
  ]
};
