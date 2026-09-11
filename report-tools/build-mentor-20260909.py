"""현재 프로토타입의 실제 캡처로 만드는 A4 5쪽 멘토링 보고서. 별도 표지 없음."""
from pathlib import Path
import json
from pypdf import PdfReader
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
TMP = ROOT / "tmp/pdfs/mentor-2026-09-09"
OUT = ROOT / "output/pdf/gachisup-mentor-report-2026-09-09-compact.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)
pdfmetrics.registerFont(TTFont("Korean", "/System/Library/Fonts/Supplemental/AppleGothic.ttf"))
W, H = A4
M = 28
CW = W - 2 * M
INK, MUTED, LINE, ACCENT = map(HexColor, ["#303D38", "#657168", "#DDE1D7", "#497A70"])
C = canvas.Canvas(str(OUT), pagesize=A4, pageCompression=1)
C.setTitle("같이숲 디자인 작업 보고 | 2026.09.09")
C.setAuthor("같이숲 프로젝트")
C.setSubject("멘토링 검토용 - 실제 화면 캡처 중심, A4 5쪽")
C.setViewerPreference("DisplayDocTitle", "true")
DATA = json.loads((TMP / "captures.json").read_text())
SOURCES = {s["name"]: s for s in DATA["shots"]}
PAGE, BOUNDS, IMAGES = 0, [], []

def text(value, x, y, size=9, color=INK):
    C.setFillColor(color)
    C.setFont("Korean", size)
    C.drawString(x, H-y-size, value)
    BOUNDS.append((PAGE,x,y,pdfmetrics.stringWidth(value,"Korean",size),size,value))

def para(value,x,y,width,size=9,color=MUTED,leading=14):
    start=y
    for part in value.split("\n"):
        line=""
        for char in part:
            if line and pdfmetrics.stringWidth(line+char,"Korean",size)>width:
                text(line,x,y,size,color); y+=leading; line=char
            else:
                line+=char
        text(line,x,y,size,color); y+=leading
    return y-start

def rule(y):
    C.setStrokeColor(LINE); C.setLineWidth(.5)
    C.line(M,H-y,W-M,H-y)

def page(title,note):
    global PAGE
    if PAGE: C.showPage()
    PAGE+=1
    C.bookmarkPage("p"+str(PAGE))
    C.addOutlineEntry(title,"p"+str(PAGE))
    text("같이숲 / 디자인 작업 보고",M,18,8.5,MUTED)
    text("2026.09.09",W-M-55,18,8.5,MUTED)
    text(title,M,35,16)
    text(note,M,58,8.3,MUTED)
    rule(811)
    text("실제 웹 화면 캡처 · 예시 데이터 포함 · 앱·서버 연동 전",M,820,7.2,MUTED)
    text(str(PAGE)+" / 5",W-M-24,820,7.5,MUTED)

def shot(name,x,y,width,height,frame=True):
    source=SOURCES[name]; image=ImageReader(source["file"]); iw,ih=image.getSize()
    scale=min(width/iw,height/ih); rw,rh=iw*scale,ih*scale
    px=x+(width-rw)/2; py=y
    C.drawImage(image,px,H-py-rh,rw,rh)
    if frame:
        C.setStrokeColor(LINE);C.setLineWidth(.35);C.rect(px,H-py-rh,rw,rh,fill=0)
    IMAGES.append({"page":PAGE,"name":name,"source":source,"box":[px,py,rw,rh]})
    return px,py,rw,rh

def caption(value,x,y,width):
    para(value,x,y,width,8.5,INK,12)

page("01  섬 메인과 모바일", "섬을 중심으로 탐색하고, 건물 기능은 같은 지도에 연결된 패널에서 사용합니다.")
shot("village",M,80,CW,326)
caption("섬 전체 · 건물 7곳 개방 / 같은 원화에서 확대·축소 / 길을 따라 캐릭터 이동",M,414,CW)
col=(CW-18)/2
shot("mobile-village",M,443,col,331,False)
shot("town",M+col+18,443,col,331)
caption("모바일 전용 베젤 · 실제 클릭 가능한 앱 화면",M,782,col)
caption("마을회관 · 섬 현황과 기능 진입",M+col+18,782,col)

page("02  활동에 따라 달라지는 집중 화면", "독서는 모닥불, 공부·작업은 테이블, 휴식은 낚시. 타이머·기록 유형을 함께 연결했습니다.")
col=(CW-24)/3
for i,(name,label) in enumerate([("activity-read","독서 · 모닥불"),("activity-study","공부 · 테이블"),("activity-rest","휴식 · 무료 기본 낚싯대")]):
    x=M+i*(col+12)
    shot(name,x,81,col,372)
    caption(label,x,460,col)
rule(484)
shot("gather-landscape",M,500,CW,254,False)
caption("공동 낚시의 가로 화면 · 풍경과 타이머를 나란히 배치, 회전해도 같은 세션 유지",M,766,CW)
caption("휴식은 집중·퀘스트·재화에서 분리. 공동 낚시의 동료 두 명은 접속자가 아닌 연출 예시입니다.",M,782,CW)

page("03  같이 만든 장소에 다시 모이기", "부두 프로젝트와 모임 퀘스트를 연결했습니다. 장소·세계 속 행동과 현실의 집중 유형을 구분합니다.")
col=(CW-20)/2
shot("project",M,81,col,431)
shot("meeting-create",M+col+20,81,col,431)
caption("장소 만들기 · 기여하기 또는 완성 상태 미리보기",M,523,col)
caption("모임 작성 · 시간대 / 개인 목표 / 반복 요일",M+col+20,523,col)
rule(549)
text("부두 마련 → 모임 약속 → 공동 낚시 → 같은 부두에 기록",M,562,11,ACCENT)
shot("memory",M,596,260,150)
caption("모임 종료 후 장소에 남는 기록",M,758,260)
x=M+280
text("이번에 연결한 범위",x,596,10,INK)
para("20:00~21:00 안에서 각자 25분 집중.\n늦은 합류는 시간창과 겹친 만큼 인정.\n먼저 종료해도 기록과 장소는 유지.",x,618,CW-280,9,INK,16)
para("60분 건설 조건은 시연값입니다.\n25분 기록은 격리 시계로 만든 캡처용 예시.\n실제 공동 기여·접속·초대는 서버 연결 전입니다.",x,678,CW-280,8.3,MUTED,14)
caption("논의할 점: 부두 완성 조건·비용 / 모임 참여 조건 / 새 장소가 열어줄 다음 공동 액션",M,785,CW)

page("04  게시판 작성과 집중 기록", "공지 작성·임시저장 흐름과 개인·섬 단위 통계를 화면에 연결했습니다. 아래 수치는 예시를 포함합니다.")
col=(CW-18)/2
for i,(name,label) in enumerate([
    ("notice","게시판 · 공지 목록 / 그룹장 작성"),
    ("notice-compose","공지 작성 · 입력 / 임시저장 / 미리보기"),
    ("stats-group","오두막 · 우리 섬의 주간 기록"),
    ("stats-personal","오두막 · 개인 기록 / 기간·과목·목표")
]):
    row,index=divmod(i,2);x=M+index*(col+18);y=81+row*360
    shot(name,x,y,col,324)
    caption(label,x,y+331,col)
caption("공지·퀘스트는 그룹장, 자료·댓글은 구성원 작성. 실제 전송·OS 앱 차단·스크린타임은 미연결입니다.",M,785,CW)

page("05  캐릭터별 리깅과 산책 작업실", "캐릭터 선택·타임라인·관절 조절을 실제 브라우저에서 확인한 정지 캡처입니다.")
shot("reading-studio",M,80,CW,315)
caption("독서 5종 · 모모 / 강아지 / 골든 리트리버 / 카피바라 / 레서판다",M,403,CW)
shot("walking-studio",M,434,CW,315)
caption("산책 4종 · 모모 / 강아지 / 카피바라 / 레서판다",M,758,CW)
caption("섬 이동에는 모모 적용. 골든 산책은 미구현이며, 앱 렌더러·실기기 성능 검증은 별도 과제입니다.",M,778,CW)
caption("PDF에는 정지 화면만 포함됩니다. 애니메이션·상호작용은 실행 중인 로컬 브라우저에서 확인합니다.",M,792,CW)

assert PAGE==5
for pg,x,y,width,height,value in BOUNDS:
    assert x>=0 and y>=0 and x+width<=W+.2 and y+height<=H,(pg,value,x,y,width,height)
for item in IMAGES:
    x,y,width,height=item["box"]
    assert x>=M-.1 and x+width<=W-M+.1 and y>=78 and y+height<807,item
C.save()
reader=PdfReader(OUT)
assert len(reader.pages)==5
texts=[p.extract_text() for p in reader.pages]
assert all("같이숲" in t and "\ufffd" not in t and "\u25a0" not in t for t in texts)
assert len({i["name"] for i in IMAGES})==16
manifest={"pdf":str(OUT),"pages":5,"bytes":OUT.stat().st_size,"images":IMAGES,"texts":texts,"captureChecks":DATA["checks"]}
(TMP/"report-manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print(json.dumps({"pdf":str(OUT),"pages":5,"screenshots":len(IMAGES),"bytes":OUT.stat().st_size},ensure_ascii=False))
