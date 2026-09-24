"""멘토 공유용: 실제 브라우저 캡처만 사용하는 A4 4쪽 작업 보고서."""
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
TMP = ROOT / 'tmp/pdfs/mentor-2026-09-08'
OUT = ROOT / 'output/pdf/gachisup-mentor-report-2026-09-08-compact.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
pdfmetrics.registerFont(TTFont('Korean', '/System/Library/Fonts/Supplemental/AppleGothic.ttf'))
W, H = A4
M = 28
CONTENT = W - M * 2
INK = HexColor('#30392E')
MUTED = HexColor('#677060')
LINE = HexColor('#DDE1D7')
C = canvas.Canvas(str(OUT), pagesize=A4, pageCompression=1)
C.setTitle('Catus 작업 결과 | 2026.09.08')
C.setAuthor('Catus 프로젝트')
C.setSubject('실제 화면 캡처 중심의 4쪽 작업 보고서')
PAGE = 0
BOUNDS = []
SHOTS = []
SOURCES = {item['name']: item for item in json.loads((TMP / 'captures.json').read_text())['shots']}


def text(value, x, y, size=9, color=INK):
    C.setFillColor(color)
    C.setFont('Korean', size)
    C.drawString(x, H - y - size, value)
    BOUNDS.append((PAGE, x, y, pdfmetrics.stringWidth(value, 'Korean', size), size, value))


def rule(y):
    C.setStrokeColor(LINE)
    C.setLineWidth(.5)
    C.line(M, H - y, W - M, H - y)


def page(title, note):
    global PAGE
    if PAGE:
        C.showPage()
    PAGE += 1
    C.bookmarkPage(f'p{PAGE}')
    C.addOutlineEntry(title, f'p{PAGE}')
    text('Catus  /  작업 결과', M, 19, 9, MUTED)
    text('2026.09.08', W - M - 54, 19, 9, MUTED)
    text(title, M, 36, 15)
    text(note, M, 58, 8.5, MUTED)
    rule(811)
    text('로컬 웹 프로토타입 · 예시 데이터 포함 · 앱·서버 연동 전', M, 819, 7.5, MUTED)
    text(f'{PAGE} / 4', W - M - 22, 819, 7.5, MUTED)


def shot(name, x, y, width, height, align='center'):
    # 원본 JPEG를 그대로 임베드: PDF 확대 시에도 화면 속 텍스트를 확인할 수 있다.
    source = SOURCES[name]
    reader = ImageReader(source['file'])
    iw, ih = reader.getSize()
    scale = min(width / iw, height / ih)
    rw, rh = iw * scale, ih * scale
    px = x + (width - rw) / 2
    py = y if align == 'top' else y + (height - rh) / 2
    C.drawImage(reader, px, H - py - rh, rw, rh)
    C.setStrokeColor(LINE)
    C.setLineWidth(.35)
    C.rect(px, H - py - rh, rw, rh, fill=0)
    SHOTS.append({'page': PAGE, 'name': name, 'source': source, 'box': [px, py, rw, rh]})
    return px, py, rw, rh


def panel(name, column, row, caption):
    # 두 열·두 행. 실제 건물 패널 전체를 잘라내거나 재구성하지 않고 배치한다.
    cell_width = (CONTENT - 18) / 2
    x = M + column * (cell_width + 18)
    y = 79 + row * 366
    px, _, _, _ = shot(name, x, y, cell_width, 332, align='top')
    text(caption, px, y + 337, 8.5)


page('01  마을과 집중 화면', '마을 전체 보기·건물 클릭·길 이동을 연결하고, 집중 화면을 정리했습니다.')
shot('village-desktop', M, 80, CONTENT, 375, align='top')
text('마을 메인 · 7개 건물 개방 / 확대·축소 / 마을만 보기', M, 460, 9)
gap = 12
focus_height = (CONTENT - gap) / (2880 / 2000 + 780 / 1688)
desktop_width = focus_height * 2880 / 2000
mobile_width = focus_height * 780 / 1688
shot('focus-desktop', M, 488, desktop_width, focus_height, align='top')
shot('focus-mobile', M + desktop_width + gap, 488, mobile_width, focus_height, align='top')
text('모닥불 · 집중 타이머와 함께 읽는 캐릭터 / 데스크톱·모바일', M, 777, 9)

page('02  게시판과 집중 기록', '공지 작성·임시저장·게시 흐름, 개인·섬 단위 통계를 로컬 데이터에 연결했습니다.')
panel('board-notices', 0, 0, '게시판 · 공지 목록')
panel('board-compose', 1, 0, '공지 작성 · 미리보기·게시')
panel('cabin-personal', 0, 1, '오두막 · 개인 주간 기록')
panel('cabin-panel', 1, 1, '오두막 · 우리 섬 주간 기록')

page('03  건물별 기능 화면', '마을회관·항구·전망대·우체국을 같은 패널 구조로 정리했습니다.')
panel('town-panel', 0, 0, '마을회관 · 섬 정보·구성원·설정')
panel('harbor-panel', 1, 0, '항구 · 목적지 선택·섬 이동')
panel('tower-panel', 0, 1, '전망대 · 우리 섬·섬 간 순위')
panel('post-panel', 1, 1, '우체국 · 응원 편지·콕찌르기')

page('04  캐릭터 리깅 작업실', '독서 5종·산책 4종 선택과 모션 프리뷰. 아래는 실제 작업실의 정지 캡처입니다.')
shot('reading-studio', M, 78, CONTENT, 331, align='top')
text('독서 · 모모 / 강아지 / 골든 리트리버 / 카피바라 / 레서판다', M, 416, 9)
shot('walking-studio', M, 438, CONTENT, 331, align='top')
text('산책 · 모모 / 강아지 / 카피바라 / 레서판다', M, 776, 9)
text('현재 섬 이동 적용은 모모. 나머지는 작업실 프리뷰이며 골든 산책은 미구현입니다.', M, 791, 8, MUTED)

assert PAGE == 4
for page_no, x, y, width, height, value in BOUNDS:
    assert x >= 0 and y >= 0 and x + width <= W and y + height <= H, (page_no, value)
for item in SHOTS:
    x, y, width, height = item['box']
    assert x >= M - .1 and x + width <= W - M + .1 and y >= 78 and y + height < 805, item
C.save()
reader = PdfReader(OUT)
assert len(reader.pages) == 4
texts = [page.extract_text() for page in reader.pages]
assert all('Catus' in content for content in texts)
assert all('\ufffd' not in content for content in texts)
manifest = {
    'pdf': str(OUT),
    'pages': len(reader.pages),
    'bytes': OUT.stat().st_size,
    'screenshots': SHOTS,
    'texts': texts,
}
(TMP / 'compact-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
print(json.dumps({'pdf': str(OUT), 'pages': len(reader.pages), 'screenshots': len(SHOTS), 'bytes': OUT.stat().st_size}, ensure_ascii=False))
