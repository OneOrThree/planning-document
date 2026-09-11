"""실제 프로토타입 캡처와 원화로 만드는 멘토링 보고서. 앱 코드는 수정하지 않는다."""
from pathlib import Path
import json
from io import BytesIO
from PIL import Image
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
TMP = ROOT / 'tmp/pdfs/mentor-2026-09-08'
OUT = ROOT / 'output/pdf/gachisup-mentor-report-2026-09-08.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
pdfmetrics.registerFont(TTFont('Korean', '/System/Library/Fonts/Supplemental/AppleGothic.ttf'))
pdfmetrics.registerFont(TTFont('Latin', '/System/Library/Fonts/Supplemental/Arial.ttf'))
pdfmetrics.registerFont(TTFont('LatinBold', '/System/Library/Fonts/Supplemental/Arial Bold.ttf'))
W, H = 960, 640
PAPER, WHITE = '#F5F2E9', '#FFFEFA'
INK, MUTED, OLIVE, LINE = '#343B2E', '#68705F', '#566B46', '#D9DFCF'
TINT, BUTTER = '#E7ECDf', '#EEE6CB'
PAGE_COUNT = 21
C = canvas.Canvas(str(OUT), pagesize=(W,H), pageCompression=1)
C.setTitle('같이숲 | 2026.09.08 멘토링 작업 결과 보고')
C.setAuthor('같이숲 프로젝트')
C.setSubject('마을 중심 디자인, 7개 건물 기능, 집중·통계·게시판, 캐릭터 리깅 및 앱 이식 계획')
C.setKeywords('같이숲, gromo, 프로토타입, 멘토링, 캐릭터 리깅')
PAGE = 0
BOUNDS = []
IMAGES = []
IMAGE_CACHE = {}

def rect(x,y,w,h,color=WHITE,r=0,stroke=None):
    C.setFillColor(HexColor(color))
    C.setStrokeColor(HexColor(stroke or color))
    if r: C.roundRect(x,H-y-h,w,h,r,stroke=bool(stroke),fill=1)
    else: C.rect(x,H-y-h,w,h,stroke=bool(stroke),fill=1)

def line(x,y,x2,y2,color=LINE,width=.7):
    C.setStrokeColor(HexColor(color));C.setLineWidth(width);C.line(x,H-y,x2,H-y2)

def text(s,x,y,size=13,color=INK,font='Korean'):
    C.setFillColor(HexColor(color));C.setFont(font,size);C.drawString(x,H-y-size,s)
    BOUNDS.append((PAGE,x,y,pdfmetrics.stringWidth(s,font,size),size,s))

def para(s,x,y,w,size=13,color=INK,leading=None):
    style=ParagraphStyle('p',fontName='Korean',fontSize=size,leading=leading or size*1.55,textColor=HexColor(color),wordWrap='CJK',spaceAfter=0)
    p=Paragraph(escape(s).replace('\n','<br/>'),style)
    _,h=p.wrap(w,H);p.drawOn(C,x,H-y-h)
    BOUNDS.append((PAGE,x,y,w,h,s));return h

def image(file,x,y,w,h,fill=False,frame=False):
    file=Path(file);assert file.exists(),file
    if file not in IMAGE_CACHE:
        # PDF 내부 비트맵만 표시 크기에 맞춰 최적화한다. 원본 파일은 변경하지 않는다.
        with Image.open(file) as original:
            bitmap=original.copy()
        transparent='A' in bitmap.getbands()
        limit=600 if transparent else 1600
        bitmap.thumbnail((limit,limit),Image.Resampling.LANCZOS)
        encoded=BytesIO()
        if transparent:bitmap.save(encoded,format='PNG',optimize=True)
        else:bitmap.convert('RGB').save(encoded,format='JPEG',quality=89,optimize=True)
        encoded.seek(0);IMAGE_CACHE[file]=ImageReader(encoded)
    reader=IMAGE_CACHE[file];iw,ih=reader.getSize()
    scale=max(w/iw,h/ih) if fill else min(w/iw,h/ih)
    rw,rh=iw*scale,ih*scale;px=x+(w-rw)/2;py=y+(h-rh)/2
    if frame: rect(x,y,w,h,WHITE,10,LINE)
    C.saveState();p=C.beginPath();p.rect(x,H-y-h,w,h);C.clipPath(p,stroke=0,fill=0)
    C.drawImage(reader,px,H-py-rh,rw,rh,mask='auto')
    C.restoreState();IMAGES.append({'page':PAGE,'path':str(file.relative_to(ROOT)) if file.is_relative_to(ROOT) else '사용자 제공 초기 시안','box':[x,y,w,h]})

def shot(name,x,y,w,h,fill=False,frame=False):image(TMP/(name+'.jpg'),x,y,w,h,fill,frame)
def asset(name,x,y,w,h):image(ROOT/'assets'/name,x,y,w,h)

def page(section,title,subtitle=''):
    global PAGE
    if PAGE:C.showPage()
    PAGE+=1;rect(0,0,W,H,PAPER)
    C.bookmarkPage('p'+str(PAGE));C.addOutlineEntry(title,'p'+str(PAGE),level=0,closed=False)
    text('같이숲 / '+section,40,23,10,OLIVE)
    text('2026.09.08  ·  멘토링 공유',744,23,10,MUTED)
    text(title,40,52,28)
    if subtitle:para(subtitle,40,94,880,12,MUTED,17)
    line(40,603,920,603)
    text('로컬 웹 프로토타입 · 화면 수치는 시연 데이터 포함',40,613,9,MUTED)
    text(f'{PAGE:02d} / {PAGE_COUNT}',870,611,10,MUTED,'Latin')

def callout(label,body,x,y,w):
    text(label,x,y,17,OLIVE)
    return para(body,x,y+31,w,13,INK)+31

def numbered(n,title,body,x,y,w):
    text(f'{n:02d}',x,y,15,OLIVE,'LatinBold');text(title,x+34,y-1,17)
    para(body,x+34,y+29,w-34,12.5,MUTED)

def table(headers,rows,x,y,widths,rowh=46):
    xx=x
    rect(x,y,sum(widths),34,OLIVE,5)
    for title,w in zip(headers,widths):text(title,xx+12,y+9,11,WHITE);xx+=w
    yy=y+34
    for i,row in enumerate(rows):
        if i%2==0:rect(x,yy,sum(widths),rowh,WHITE)
        xx=x
        for value,w in zip(row,widths):para(value,xx+12,yy+10,w-24,11.5,INK,16);xx+=w
        line(x,yy+rowh,x+sum(widths),yy+rowh)
        yy+=rowh
    return yy

# 01 / 표지
page('작업 결과','같이숲')
shot('village-only',430,116,490,422,fill=True,frame=True)
text('마을 중심',40,148,43)
text('프로토타입',40,201,43)
text('작업 결과 보고',40,260,25,OLIVE)
para('보고 싶은 풍경에서\n직접 머물고, 집중하고,\n기록을 남기는 경험으로.',42,321,342,17,INK,28)
text('디자인 + 인터랙션 + 캐릭터 모션',42,454,12,MUTED)
text('7',43,500,34,OLIVE,'LatinBold');text('건물 기능',74,516,13)
text('5',171,500,34,OLIVE,'LatinBold');text('독서 캐릭터',202,516,13)
text('4',319,500,34,OLIVE,'LatinBold');text('산책 캐릭터',350,516,13)
para('검토 목적: 오늘 구현한 결과와 남은 제품·기술 판단을 한 번에 공유합니다.',40,562,880,11,MUTED)

# 02 / 요약과 목차
page('요약','오늘 달라진 점, 세 가지','화면 시안뿐 아니라 실제 클릭·작성·집중·기록 흐름까지 연결했습니다.')
numbered(1,'마을을 앱의 중심으로','전체 화면 지도, 마을만 보기, 확대·축소, 건물 클릭을 같은 좌표계로 연결했습니다.',42,153,510)
numbered(2,'기능 화면을 작동하는 흐름으로','7개 건물을 검토용으로 모두 개방하고 작성·통계·집중 종료 후 기록 반영을 구현했습니다.',42,268,510)
numbered(3,'캐릭터 원화를 독립적인 모션으로','독서 5종, 산책 4종을 선택할 수 있습니다. 투명 배경과 종별 관절·보행을 분리했습니다.',42,383,510)
rect(612,146,308,382,WHITE,12)
text('이 보고서의 순서',634,169,18,OLIVE)
for i,(label,target) in enumerate([('마을과 화면 구조',3),('7개 건물과 핵심 기능',5),('캐릭터·리깅·길 이동',12),('검증과 구현 경계',17),('앱 이식·멘토 피드백',19)]):
    y=217+i*54;text(label,635,y,13);text(f'{target:02d}',875,y,12,OLIVE,'LatinBold');line(635,y+31,896,y+31)
    C.linkRect('', 'p'+str(target),(630,H-y-34,901,H-y+2),relative=0,thickness=0)
para('현재 산출물은 로컬 웹 프로토타입입니다. 실제 앱·서버 변경이나 외부 전송 완료를 의미하지 않습니다.',42,552,860,12,OLIVE)

# 03 / 전후
page('마을 01','화면 모음에서, 직접 둘러보는 마을로','초기 참고 시안의 분위기를 이어가되 메인 경험을 지도 자체로 옮겼습니다.')
before=ROOT / 'assets/reference/initial-design.jpg'
text('초기 참고 시안 / 사용자 제공',40,137,12,MUTED)
image(before,40,163,345,185,frame=True)
para('설명·유저 여정과 휴대폰 프레임이 중심인 검토 화면',40,367,333,14)
para('후속 방향\n낮은 채도는 유지하고, 수채화 질감을 줄이며 윤곽을 정리했습니다. 기능 화면의 개별 배경보다 마을 전체의 일관성을 우선했습니다.',40,420,329,12.5,MUTED)
text('오늘 구현한 메인 화면',414,137,12,OLIVE)
shot('village-desktop',414,163,506,351,frame=True)
para('하나의 지도 위에 건물 클릭 영역, 길, 캐릭터, 축소 지도를 함께 배치했습니다.',414,533,506,12,MUTED)

# 04 / 지도
page('마을 02','확대해도, 메뉴를 숨겨도 같은 마을','별도 이미지를 바꾸는 대신 하나의 지도에서 카메라와 UI 상태를 바꿉니다.')
shot('village-mobile',40,142,197,427,frame=True)
shot('village-only',257,142,393,211,frame=True)
shot('village-zoom',257,367,393,202,frame=True)
callout('마을만 보기','메뉴를 숨긴 상태에서도 건물 터치와 지도 탐색이 유지됩니다.',680,151,239)
callout('카메라 조작','드래그·휠·핀치와 확대·축소 버튼을 지원합니다. 전체 보기와 축소 지도도 같은 원본을 씁니다.',680,283,239)
callout('아트의 범위','마을 원화는 1536×1024 PNG입니다. 선명도를 보완했지만 4K 또는 순수 벡터 원화는 아닙니다.',680,442,239)

# 05 / 건물맵
page('기능 지도','일곱 건물을 모두 열어 검토할 수 있도록','해금 레벨을 확정한 것이 아니라, 프로토타입에서 기능을 바로 확인하도록 개방했습니다.')
table(['건물','사용자가 하는 일','현재 구현 범위'],[
    ('모닥불','일감·시간 선택 후 집중 시작','세션 시작·복원·종료와 기록 연결'),
    ('게시판','퀘스트 참여, 공지·자료 읽기와 작성','임시저장·미리보기·게시·댓글·신고'),
    ('오두막','개인·섬 기록과 목표 확인','일·주·월, 비교·과목·달력·내보내기'),
    ('마을회관','섬 정보와 구성원·설정 확인','이름 변경 검증, 역할 시연 설정'),
    ('항구','목적지 선택 후 섬 이동','선택/이동 분리, 방문 읽기 전용'),
    ('전망대','우리 섬·섬 간 순위 확인','공개 멤버 기준의 평균 순위 시연'),
    ('우체국','응원 편지·콕찌르기','프리셋·수신 설정·하루 중복 제한')
],40,146,[135,310,435],rowh=52)
para('공통 화면 구조: 데스크톱은 오른쪽 패널, 모바일은 높이 조절 시트. 본문을 스크롤해도 주요 버튼은 하단에 남습니다.',40,562,880,12,MUTED)

# 06 / 집중
page('집중 01','선택 → 집중 → 기록으로 이어지는 한 흐름','같은 마을에서 책을 읽기 시작하고, 종료한 시간은 시작한 섬에 남깁니다.')
for i,(name,label,desc) in enumerate([('camp-mobile','01  집중 준비','독서·공부·작업 / 25·50·90분'),('focus-mobile','02  함께 집중','큰 타이머, 독서 캐릭터, 최소한의 조작'),('focus-result','03  세션 결과','경과 시간과 시작한 섬을 확인')]):
    x=40+i*301;text(label,x,137,16,OLIVE);shot(name,x,170,224,370,frame=True);para(desc,x,554,270,11.5,MUTED)

# 07 / 집중화면
page('집중 02','집중할 때는 시간과 함께하는 친구만','기존 지도를 유지하면서 타이머와 캐릭터가 먼저 보이도록 집중 화면을 정리했습니다.')
shot('focus-desktop',40,145,620,430,frame=True)
callout('큰 타이머와 얇은 진행선','남은 시간은 시작 시각과 현재 시각의 차이로 계산합니다. 새로고침해도 같은 세션을 복원합니다.',689,155,229)
callout('원화 색을 유지하는 배경','배경 페이드를 캐릭터 뒤에 두어 앉은 캐릭터의 털색이 덮이지 않도록 했습니다.',689,319,229)
callout('집중 중 상호작용 제한','지도 이동과 다른 건물 진입을 막습니다. 실제 OS 앱 차단은 아직 연결하지 않았습니다.',689,456,229)

# 08 / 게시판
page('게시판 01','읽는 게시판에서, 직접 작성하는 게시판으로','공지·자료·퀘스트를 실제 입력과 상태 변화가 있는 흐름으로 확장했습니다.')
shot('board-panel',40,144,247,437,frame=True)
shot('board-compose',310,144,247,437,frame=True)
numbered(1,'글 종류와 권한','공지·퀘스트는 그룹장, 자료·댓글은 그룹원이 작성하는 정책을 로컬 모델과 화면에서 함께 검증합니다.',590,156,326)
numbered(2,'입력과 복원','제목·본문 검증, 텍스트 자동 임시저장과 새로고침 복원을 연결했습니다.',590,296,326)
numbered(3,'작성 이후까지','게시 후 상세·댓글·수정·삭제 확인·신고 기록을 제공합니다. 모든 데이터는 이 브라우저에만 저장됩니다.',590,420,326)

# 09 / 공지시퀀스
page('게시판 02','공지 작성부터 미리보기, 게시 후 상세까지','아래 공지는 보고서 캡처용 격리 브라우저에서 작성한 시연 데이터입니다. 실제 공지가 전송되지는 않습니다.')
for i,(name,title,desc) in enumerate([('board-compose','작성 + 임시저장','제목·본문·고정 여부 입력'),('board-preview','미리보기','게시 전에 실제 읽기 형태 확인'),('board-detail','게시 후 상세','내용 확인, 댓글·수정·삭제로 연결')]):
    x=40+i*301;text(title,x,140,16,OLIVE);shot(name,x,174,244,373,frame=True);para(desc,x,560,274,11.5,MUTED)

# 10 / 통계
page('오두막','Gromo 통계를 마을의 기록으로 이어받기','기존 StatsScreen·통계 DTO를 참고해, 같은 세션 데이터에서 지표를 일관되게 계산하도록 구성했습니다.')
shot('cabin-personal',40,147,247,431,frame=True)
shot('cabin-panel',310,147,247,431,frame=True)
callout('개인과 섬의 범위를 구분','개인 기록은 내 모든 섬, 섬 기록은 해당 섬에 귀속된 공개 기록만 집계합니다.',590,152,328)
callout('더 끌어온 통계','일·주·월, 직전 기간 비교, 과목별 비율, 세션 목록, 연속 집중, 최장 세션, 목표 달력, JSON 내보내기.',590,287,328)
callout('없는 데이터는 없는 상태로','예시 기록을 끄면 직접 종료한 세션만 남습니다. 실제 스크린타임이 없을 때 0분으로 꾸미지 않습니다.',590,432,328)

# 11 / 나머지건물
page('마을의 연결','설정·이동·순위·응원도 같은 화면 규칙으로','네 건물은 각각 독립 기능을 가지되, 같은 색·여백·버튼·시트 구조를 공유합니다.')
for i,(name,title,desc) in enumerate([
    ('town-panel','마을회관','이름·친구·섬 설정\n중복 이름 검증'),('harbor-panel','항구','목적지 선택 후 이동\n방문은 읽기 전용'),
    ('tower-panel','전망대','우리 섬 / 섬 간 순위\n공개 멤버 평균 기준'),('post-panel','우체국','응원 편지·콕찌르기\n실제 전송 없는 로컬 시연')]):
    x=40+i*224;text(title,x,142,16,OLIVE);shot(name,x,178,207,329,frame=True);para(desc,x,527,207,12,MUTED)

# 12 / 캐릭터
page('캐릭터 01','책을 읽는 다섯 친구','승인 원화의 방향을 유지하며 투명 배경과 캐릭터별 독립 리그를 연결했습니다.')
friends=[('momo-rig-source.png','모모','독서 12관절'),('puppy-reading-rig-v2.png','강아지','독서 12관절'),('golden-retriever-rig-source.png','골든 리트리버','독서 12관절'),('capybara-reading-rig-v2.png','카피바라','독서 8관절'),('red-panda-reading-rig-v2.png','레서판다','독서 12관절')]
for i,(file,label,detail) in enumerate(friends):
    x=40+i*178
    rect(x,165,165,240,WHITE,14)
    asset(file,x+3,182,159,178);text(label,x+12,365,14);text(detail,x+12,387,10,MUTED)
para('외형과 움직임을 따로 검토할 수 있도록 캐릭터 선택 드롭다운·썸네일·원화 비교를 제공합니다.\n눈 깜빡임, 책장 넘기기, 쉬기, 고개 끄덕이기를 각 캐릭터에서 확인할 수 있습니다.',40,438,850,15,INK,24)
para('원화 생성·편집: 내장 이미지 생성 도구. 강아지·카피바라·레서판다·골든 리그는 Astra 병렬 작업 후 통합했습니다.',40,551,875,11.5,MUTED)

# 13 / 작업실
page('캐릭터 02','원화가 실제로 움직이는 작업실','정지 이미지 교체가 아니라, 원화 메시와 관절·가중치로 움직임을 만듭니다.')
shot('reading-studio',40,141,603,431,frame=True)
callout('직접 확인하는 조작','캐릭터 선택, 재생·정지, 타임라인, 속도, 눈 깜빡임·책장 넘기기, 개별 관절 조절.',675,149,241)
callout('분리해 둔 재료','원화 PNG와 캐릭터별 관절·영역 가중치·모션 프로파일을 분리했습니다. 포즈 PNG와 리그 JSON을 받을 수 있습니다.',675,302,241)
callout('기술적인 한계','2D WebGL 메시 리그입니다. 순수 벡터, 완전한 3D 회전, Spine·Rive 전용 파일은 아닙니다.',675,460,241)

# 14 / 모션수정
page('캐릭터 03','피드백이 반영된 눈과 책장','눈이 감기는 방향과 책장 가림을 수정하고, 중간 프레임까지 확인했습니다.')
for row,(names,labels) in enumerate([
    (['open','half','closed'],['눈 뜸','위 눈꺼풀의 이동','눈 감김']),
    (['page-right','page-middle','page-left'],['책장 들기','책등을 축으로 회전','반대쪽으로 내려놓기'])]):
    for col,(name,label) in enumerate(zip(names,labels)):
        x=40+col*226;y=141+row*221
        shot('reading-'+name,x,y,206,182,frame=True)
        rect(x+1,y+172,204,10,WHITE)
        text(label,x+8,y+187,12,OLIVE)
para('눈 깜빡임\n각 캐릭터의 감은 눈 원화를 사용하고, 열린 원화의 투명도를 유지합니다.',741,158,177,13,INK,21)
para('책장 넘기기\n넓은 종이 면이 들리는 모션을 보여주고, 표지 앞에서는 가려지도록 처리했습니다.',741,363,177,13,INK,21)

# 15 / 걷기4
page('캐릭터 04','산책도 캐릭터별 앞·뒤 원화와 관절로','앞뒤 두 원화와 좌우 반전으로 네 방향을 표현합니다. 골든 리트리버의 산책 리그는 아직 범위에 포함하지 않았습니다.')
for i,(id,label,bones) in enumerate([('momo','모모',20),('puppy','강아지',20),('capybara','카피바라',18),('red-panda','레서판다',20)]):
    x=40+i*224;text(label,x,141,16,OLIVE);text(str(bones)+'관절',x+134,146,10,MUTED)
    for j,side in enumerate(['front','back']):
        y=180+j*195;shot('walk-'+id+'-'+side,x,y,206,173,frame=True)
        text('앞모습' if side=='front' else '뒷모습',x+9,y+176,10,MUTED)

# 16 / 경로
page('마을 인터랙션','길을 따라 걷고, 모닥불에서는 책을 읽어요','섬에 배치한 모모는 실제 이동 거리와 발걸음 주기를 맞춰 움직입니다.')
image(ROOT/'screenshots/momo-walk-island.png',40,150,550,330,frame=True)
para('현재 섬에는 모모를 유지합니다. 새 강아지·카피바라·레서판다의 산책은 작업실에서 비교하는 단계입니다.',40,504,550,13,INK)
steps=[('길 또는 건물 클릭','가까운 길 노드·건물 입구를 목적지로 선택'),('길 위의 경로 계산','미리 정의한 노드와 연결선에서 최단 경로 계산'),('이동 거리와 보행 연결','실제 이동량에 맞춰 양발의 보행 주기 진행'),('도착 또는 집중 시작','대기로 전환하거나 독서 리그로 전환')]
for i,(title,desc) in enumerate(steps):
    y=149+i*106;rect(629,y,290,84,WHITE,10,LINE);text(f'{i+1:02d}',643,y+14,12,OLIVE,'LatinBold');text(title,678,y+12,15);para(desc,678,y+39,221,11,MUTED,16)
    if i<3:line(772,y+85,772,y+104,OLIVE,1)

# 17 / 검증
page('검증','화면뿐 아니라 상태 변화와 경계를 검사했습니다','아래 숫자는 스크립트별 검증 항목 수입니다. 서로 겹치는 검사가 있어 전체 고유 테스트 수로 합산하지 않습니다.')
verification=json.loads((TMP/'verification.json').read_text())
actual={r['file']:r for r in verification}
for row in verification:assert row['code']==0,row
rows=[]
for name,label,scope in [
    ('verify-store.cjs','로컬 데이터 모델','권한·기간·섬 귀속·통계 집계'),
    ('verify-features.cjs','작성·첨부·통계·편지','임시저장·원본 복원·비공개 기록 보호'),
    ('verify-panels.cjs','건물 패널','7건물, 고정 버튼, 4개 화면 폭'),
    ('verify-focus.cjs','집중 흐름','새로고침·시간 경과·중복 완료 방지')]:
    rows.append((label,str(actual[name]['count'])+'개 통과',scope,'보고서 제작 시 재실행'))
rows += [('독서 선택 / 애니메이션','42 / 101개','5종 선택·눈·책장·내보내기','오늘 작업 검증 기록'),('산책 통합','100개 통과','종별 보행·4방향·왕복 선택 유지','오늘 작업 검증 기록'),('모모 산책·섬 연결','45개 통과','길 이동·집중 전환·기존 동작 회귀','오늘 작업 검증 기록')]
table(['영역','결과','확인한 내용','근거 시점'],rows,40,145,[185,127,352,216],rowh=47)
para('새 세 종의 앞뒤 보행 검사에서 메시 뒤집힘 0을 확인했습니다. 모바일·데스크톱 브라우저 검증이며, 실제 iOS/Android 성능이나 발열 검증을 대체하지 않습니다.',40,537,860,12,OLIVE)

# 18 / 경계
page('구현 범위','완료한 것과, 아직 연결하지 않은 것','멘토 검토에서 프로토타입의 동작과 실제 서비스 연동을 구분하기 위한 기준입니다.')
cols=[('로컬에서 동작',[
    '마을 지도·건물 탐색·카메라 조작','집중 세션·복원·종료 후 기록 반영','공지·자료·댓글·임시저장·첨부','개인·섬 통계와 목표 설정','독서 5종·산책 4종 작업실'
]),('시연·예시인 부분',[
    '이름·친구·레벨·성장률·기본 기록','폰 사용량·순위 예시 데이터','공지·편지·신고·콕찌르기 로컬 저장','검토를 위한 모든 건물 기본 개방','새 친구의 산책은 작업실까지'
]),('후속 연동이 필요한 부분',[
    '실제 로그인과 서버 저장·동기화','OS 앱 차단·스크린타임 권한','알림·편지·신고의 외부 전달','서버 권한·콘텐츠·파일 정책','앱 렌더러와 실기기 성능 검증'
])]
for i,(title,items) in enumerate(cols):
    x=40+i*302;rect(x,146,276,389,WHITE,12);text(title,x+18,165,17,OLIVE)
    for j,item in enumerate(items):
        y=214+j*60;text('·',x+18,y,14,OLIVE);para(item,x+34,y,224,12.5,INK,19)
para('저장 위치: 글·세션·설정은 localStorage, 첨부는 IndexedDB. 다른 기기나 브라우저로 자동 공유되지 않습니다.',40,556,880,12,MUTED)

# 19 / 앱 이식
page('다음 단계','프로토타입을 확정한 뒤, 한 캐릭터부터 앱으로','현재 실제 앱 코드는 변경하지 않았습니다. 데이터 재사용과 네이티브 실행 검증을 분리해서 진행할 계획입니다.')
for i,(n,title,body) in enumerate([
    (1,'웹에서 경험 확정','마을 탐색, 집중 흐름, 기능 화면, 캐릭터 외형·모션의 검토 기준을 먼저 맞춥니다.'),
    (2,'한 캐릭터 실기기 검증','원화·관절·모션을 앱 렌더러에 연결하고 프레임률·메모리·발열·백그라운드 복귀를 확인합니다.'),
    (3,'나머지 기능·캐릭터 이식','검증한 방식으로 확장하고 실제 인증·서버 데이터·기기 권한을 단계적으로 연결합니다.')]):
    x=40+i*301;rect(x,155,276,261,WHITE,12);text(str(n),x+20,173,37,OLIVE,'LatinBold');text(title,x+20,235,19);para(body,x+20,279,236,13,INK,21)
table(['재사용할 재료','앱에 맞게 옮길 연결부'],[('원화 PNG, 관절·가중치·모션 프로파일, 경로 계산','화면 UI, 입력 처리, 렌더러 연결, 앱 생명주기')],40,453,[440,440],rowh=58)
para('WebGL을 앱에서 그대로 실행할 수 있다고 전제하지 않습니다. 웹 HTML을 복사하는 방식이 아니라 실제 기기에서 렌더링 경로를 검증합니다.',40,560,880,11.5,MUTED)

# 20 / 피드백
page('멘토님께 여쭙고 싶은 점','다음 구현 범위를 정하기 위한 네 가지 질문','외형의 선호뿐 아니라 사용 경험과 MVP 범위에 대한 판단을 부탁드립니다.')
questions=[
    ('마을 탐색','마을이 메인인 구조에서 각 기능을 충분히 쉽게 찾을 수 있을까요? 건물 바로가기의 역할은 적절할까요?'),
    ('집중 경험','캐릭터와 배경이 집중을 돕는 수준인가요? 집중 중 남겨야 할 정보와 숨겨야 할 조작은 무엇일까요?'),
    ('MVP 범위','독서·걷기·소통·통계 중 첫 출시에서 가장 먼저 완성해야 할 범위는 어디까지일까요?'),
    ('기술 검증 순서','캐릭터 한 종의 실기기 렌더링을 먼저 확인하고 기능 연동으로 확장하는 순서가 적절할까요?')
]
for i,(title,body) in enumerate(questions):
    x=40+(i%2)*452;y=150+(i//2)*197
    text(f'Q{i+1}',x,y,15,OLIVE,'LatinBold');text(title,x+42,y-2,20);para(body,x+42,y+42,362,15,INK,25);line(x,y+158,x+412,y+158)
para('다음 액션: 피드백 반영 → 프로토타입 확인 → 한 캐릭터 앱 검증 → 범위 확장',40,568,880,13,OLIVE)

# 21 / 참고
page('부록','시연 방법과 보고서 근거','PDF만 전달해도 정지 화면은 확인할 수 있습니다. 실제 모션·상호작용은 발표자 PC에서 별도로 시연합니다.')
text('로컬 시연 순서',40,146,19,OLIVE)
items=[('마을','https://oneorthree.github.io/planning-document/','마을만 보기, 확대·축소, 건물과 길 클릭'),('독서 작업실','https://oneorthree.github.io/planning-document/rig.html','5종 선택, 눈 깜빡임, 책장, 관절 보기'),('산책 작업실','https://oneorthree.github.io/planning-document/walk.html','4종 선택, 앞뒤·좌우, 양발 교대')]
for i,(title,url,desc) in enumerate(items):
    y=191+i*102;text(title,40,y,15);text(url,40,y+28,12,MUTED,'Latin');para(desc,40,y+51,440,11.5,MUTED)
rect(547,146,373,347,WHITE,12)
text('참고한 프로젝트 자료',568,166,17,OLIVE)
para('README.md\ncompletion-design.md\nreading-friends-design.md\n캐릭터별 rig / walk 작업 기록\n현재 구현 코드와 검증 스크립트',568,208,330,13,INK,26)
para('실제 화면을 보고서 제작 시 새로 캡처했습니다.\n초기 시안은 사용자 제공 이미지입니다.\n캐릭터 이미지는 프로젝트 원화를 사용했습니다.',568,376,326,12,MUTED,21)
rect(40,534,880,49,TINT,8)
para('주의: 127.0.0.1은 발표자 컴퓨터의 로컬 주소입니다. 멘토님 컴퓨터에서 바로 열리는 공개 링크가 아닙니다. 이 작업에서는 외부 배포하지 않았습니다.',54,546,850,11.5,OLIVE,17)

assert PAGE==PAGE_COUNT,(PAGE,PAGE_COUNT)
for pg,x,y,w,h,s in BOUNDS:
    assert x>=0 and y>=0 and x+w<=W+1 and y+h<=H+1,(pg,x,y,w,h,s)
C.save()
reader=PdfReader(str(OUT))
assert len(reader.pages)==PAGE_COUNT
text_pages=[p.extract_text() for p in reader.pages]
assert all(len(t)>70 for t in text_pages)
assert not any('\ufffd' in t or '\u25a0' in t for t in text_pages)
(TMP/'report-manifest.json').write_text(json.dumps({'pdf':str(OUT),'pages':PAGE_COUNT,'images':IMAGES,'page_texts':text_pages},ensure_ascii=False,indent=2))
print(json.dumps({'path':str(OUT),'pages':len(reader.pages),'bytes':OUT.stat().st_size,'textChecks':'pass'},ensure_ascii=False))
