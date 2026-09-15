#!/usr/bin/env python3
"""Render the public API v1 HTML from its Markdown source."""
from pathlib import Path
from html import escape
import re

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/api/v1'
markdown = (DOC / 'gromo-api-spec.md').read_text(encoding='utf-8')
VERSION = re.search(r'^버전: (.+)$', markdown, re.MULTILINE).group(1)

def inline(value):
    text = escape(value)
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', lambda m:f'<a href="{m[2]}">{m[1]}</a>', text)
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    return text

html_parts=[]
nav=[]
in_table=False
in_list=False
heading_index=0
endpoint_open=False
for line in markdown.splitlines():
    if in_table and not line.startswith('|'):
        html_parts.append('</tbody></table></div>')
        in_table=False
    if in_list and not line.startswith('- '):
        html_parts.append('</ul>')
        in_list=False
    if not line.strip():
        continue
    if line.startswith('#'):
        level=len(line)-len(line.lstrip('#'))
        title=line[level:].strip()
        if endpoint_open:
            html_parts.append('</article>')
            endpoint_open=False
        anchor=f'heading-{heading_index}'
        heading_index+=1
        if level in (2,3):
            nav.append((anchor,title,level))
        if level==4:
            key=title.split(' · ')[0]
            anchor='api-'+key
            html_parts.append(f'<article class="endpoint" data-search="{escape(title.lower())}">')
            endpoint_open=True
        html_parts.append(f'<h{level} id="{anchor}">{inline(title)}</h{level}>')
    elif line.startswith('|'):
        cells=[c.strip() for c in line.strip('|').split('|')]
        if all(re.fullmatch(r':?-+:?',c) for c in cells):
            continue
        if not in_table:
            html_parts.append('<div class="table-wrap"><table><thead><tr>'+''.join('<th>'+inline(c)+'</th>' for c in cells)+'</tr></thead><tbody>')
            in_table=True
        else:
            html_parts.append('<tr>'+''.join('<td>'+inline(c)+'</td>' for c in cells)+'</tr>')
    elif line.startswith('- '):
        if not in_list:
            html_parts.append('<ul>')
            in_list=True
        html_parts.append('<li>'+inline(line[2:])+'</li>')
    else:
        html_parts.append('<p>'+inline(line)+'</p>')
if in_list:html_parts.append('</ul>')
if in_table:html_parts.append('</tbody></table></div>')
if endpoint_open:html_parts.append('</article>')

css='''
:root{--paper:#fffdf8;--cream:#fff3e5;--ink:#493b39;--muted:#806d65;--line:#e5d6cc;--pink:#98576b}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:95px}body{overflow-wrap:anywhere;margin:0;background:var(--paper);color:var(--ink);font:15px/1.8 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",sans-serif}a{color:var(--pink);text-decoration:none}a:hover{text-decoration:underline}aside{position:fixed;inset:0 auto 0 0;width:250px;padding:24px 20px;background:var(--cream);border-right:1px solid var(--line);overflow:auto}aside strong{font-size:27px}aside small{display:block;color:var(--muted);margin-top:4px}nav{display:grid;gap:4px;margin-top:22px}nav a{font-size:13px;padding:5px 0}nav a.sub{padding-left:12px;font-size:12px}.toolbar{position:sticky;top:0;margin-left:250px;z-index:3;background:#fffdf8f5;backdrop-filter:blur(8px);border-bottom:1px solid var(--line);padding:12px 42px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}.toolbar input{flex:1;min-width:150px;border:1px solid var(--line);border-radius:9px;background:white;padding:9px 12px;font:inherit}.toolbar button{border:1px solid var(--line);border-radius:9px;background:var(--cream);padding:9px 13px;color:var(--ink);font:inherit;cursor:pointer}.toolbar span{font-size:12px;color:var(--muted)}main{margin-left:250px;max-width:1530px;padding:28px 42px 100px}h1{font-size:38px;line-height:1.3;letter-spacing:-1px}h2{font-size:25px;margin-top:48px;border-top:1px solid var(--line);padding-top:25px}h3{font-size:22px;margin-top:36px;color:#80505b}h4{font-size:17px;margin:0 0 8px}p{max-width:1080px}li{margin:7px 0}code{font:13px/1.7 ui-monospace,SFMono-Regular,monospace;background:#f3ece3;border-radius:5px;padding:3px 5px;overflow-wrap:anywhere}.table-wrap{width:100%;overflow:auto;margin:22px 0}table{width:100%;border-collapse:collapse;min-width:780px;font-size:13px}th,td{padding:13px 15px;border:1px solid var(--line);text-align:left;vertical-align:top}th{background:var(--cream)}tr:nth-child(even) td{background:#fff9f0}td:first-child{min-width:85px;font-weight:650}.endpoint{border:1px solid var(--line);border-radius:12px;background:#fffaf2;padding:20px 22px;margin:18px 0}.endpoint p{margin:8px 0}.endpoint ul{margin-bottom:0;padding-left:20px}[hidden]{display:none!important}@media(max-width:850px){aside{position:static;width:auto;border-right:0;border-bottom:1px solid var(--line);max-height:240px}nav{display:flex;overflow:auto;gap:15px}nav a{white-space:nowrap}nav a.sub{padding-left:0}.toolbar{margin:0;padding:12px 20px}main{margin:0;padding:20px}h1{font-size:29px}.endpoint{padding:17px}table{min-width:700px}}@media print{aside,.toolbar{display:none}main{margin:0;padding:0}h2,h3,h4{break-after:avoid}.endpoint,tr{break-inside:avoid}.endpoint[hidden]{display:block!important}a{color:inherit}.table-wrap{overflow:visible}table{min-width:0;font-size:10px}td,th{padding:6px}}
'''
script='''const input=document.getElementById('search'),count=document.getElementById('count');const cards=[...document.querySelectorAll('.endpoint')];function filter(){const q=input.value.trim().toLowerCase();let visible=0;for(const card of cards){const show=!q||card.textContent.toLowerCase().includes(q);card.hidden=!show;if(show)visible++;}count.textContent=visible+' / '+cards.length+'개 API 계약';}input.addEventListener('input',filter);document.getElementById('clear').addEventListener('click',()=>{input.value='';filter();});document.querySelectorAll('nav a').forEach(link=>link.addEventListener('click',()=>{if(input.value){input.value='';filter();}}));filter();'''
html='<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GROMO API v1 협의안</title><style>'+css+'</style></head><body><aside><strong>GROMO</strong><small>화면별 API · '+VERSION+'<br>백엔드 전달 협의안</small><nav>'+''.join(f'<a class="{"sub" if level==3 else ""}" href="#{anchor}">{escape(title)}</a>' for anchor,title,level in nav)+'<a href="gromo-api-spec.md">Markdown 원문 ↗</a><a href="../../../feature-inventory.html">기획 작업대 ↗</a></nav></aside><div class="toolbar"><label for="search">API 검색</label><input id="search" type="search" placeholder="기능·경로·권한 검색"><button id="clear" type="button">초기화</button><span id="count" aria-live="polite"></span></div><main>'+''.join(html_parts)+'</main><script>'+script+'</script></body></html>'

(DOC / 'index.html').write_text(html, encoding='utf-8')
ids = re.findall(r' id="([^"]+)"', html)
assert len(ids) == len(set(ids)), 'duplicate HTML anchor'
for anchor in re.findall(r'href="#([^"]+)"', html):
    assert anchor in ids, anchor
print('API v1 HTML regenerated from Markdown')
