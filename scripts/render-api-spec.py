#!/usr/bin/env python3
"""Render the public API v1 HTML from its Markdown source."""
from pathlib import Path
from html import escape
import re

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/api/v1'
markdown = (DOC / 'gromo-api-spec.md').read_text(encoding='utf-8')
VERSION = re.search(r'^버전: (.+)$', markdown, re.MULTILINE).group(1)
TITLE = re.search(r'^# (.+)$', markdown, re.MULTILINE).group(1)

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
    if line.startswith('버전: '):
        continue
    if line.startswith('#'):
        level=len(line)-len(line.lstrip('#'))
        title=line[level:].strip()
        if level==1:
            continue
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
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:6.5rem}body{overflow-wrap:anywhere}.api-intro{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:var(--space-xl);padding-block:var(--space-2xl);border-bottom:2px solid var(--ink)}.api-intro .eyebrow{margin:0 0 var(--space-sm);font-size:var(--text-planning-caption);font-weight:700;letter-spacing:.08em;color:var(--sea)}.api-intro h1{max-width:18ch;font-family:var(--font-planning);font-size:clamp(2rem,4vw,3.5rem);line-height:1.08;letter-spacing:-.055em;text-wrap:balance}.api-intro-copy{max-width:65ch;margin:var(--space-md) 0 0;color:var(--muted);font-size:var(--text-planning-body)}.api-state{display:grid;min-width:10rem;padding:var(--space-md);border:1px solid var(--color-planning-rule-strong);background:var(--color-planning-surface)}.api-state strong{font-size:var(--text-planning-body)}.api-state span{margin-top:var(--space-xs);color:var(--muted);font-size:var(--text-planning-caption);font-variant-numeric:tabular-nums}.api-header a[aria-current=page]{font-weight:800;color:var(--ink);text-decoration:underline;text-underline-offset:.35rem}.api-header .back-link{font-weight:700}.api-index{border-bottom:1px solid var(--rule)}.api-index>summary{display:flex;align-items:center;gap:var(--space-sm);min-height:3.5rem;list-style:none;font-size:var(--text-planning-small);font-weight:700;color:var(--sea)}.api-index>summary::-webkit-details-marker{display:none}.api-index>summary::before{content:'+';width:1rem;font-size:1.25rem;font-weight:400}.api-index[open]>summary::before{content:'−'}.api-index>summary span{margin-left:auto;color:var(--muted);font-size:var(--text-planning-caption);font-weight:500}.api-index-nav{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0 var(--space-lg);padding:0 0 var(--space-lg)}.api-index-nav a{display:flex;align-items:center;min-height:2.75rem;border-top:1px solid var(--rule);font-size:var(--text-planning-small);text-decoration:none}.api-index-nav a:hover{background:var(--sage);color:var(--ink)}.api-index-nav a.sub{padding-left:var(--space-md);font-size:var(--text-planning-caption);color:var(--muted)}.toolbar{position:sticky;top:0;z-index:var(--z-planning-nav);border-bottom:1px solid var(--color-planning-rule-strong);background:color-mix(in oklab,var(--paper) 94%,transparent);backdrop-filter:blur(.75rem)}.toolbar-inner{display:grid;grid-template-columns:auto minmax(12rem,1fr) auto auto;align-items:center;gap:var(--space-sm);min-height:4.5rem}.toolbar label{font-size:var(--text-planning-small);font-weight:700}.toolbar input{width:100%;height:2.75rem;border:1px solid var(--color-planning-rule-strong);border-radius:.375rem;background:var(--color-planning-surface);padding:0 var(--space-sm);font:inherit}.toolbar input::placeholder{color:var(--muted)}.toolbar button{min-height:2.75rem;border:1px solid var(--color-planning-rule-strong);border-radius:.375rem;background:transparent;padding:0 var(--space-md);font-size:var(--text-planning-small);transition:background-color .2s,color .2s,transform .2s}.toolbar button:hover{background:var(--sage)}.toolbar button:active{transform:translateY(1px)}.toolbar span{color:var(--muted);font-size:var(--text-planning-caption);font-variant-numeric:tabular-nums;white-space:nowrap}.api-content{padding-block:var(--space-lg) 6rem}.api-content>h2{margin:var(--space-2xl) 0 var(--space-md);padding-top:var(--space-xl);border-top:2px solid var(--ink);font-size:var(--text-planning-heading);line-height:1.25;letter-spacing:-.04em}.api-content>h2:first-child{margin-top:0;border-top:0}.api-content>h3{margin:var(--space-2xl) 0 var(--space-md);padding:var(--space-sm) var(--space-md);background:var(--sage);font-size:var(--text-planning-subhead);letter-spacing:-.025em}.api-content h4{margin:0 0 var(--space-sm);font-size:var(--text-planning-body);letter-spacing:-.02em}.api-content p,.api-content li{max-width:75ch;font-size:var(--text-planning-body)}.api-content p{color:var(--muted)}.api-content li{margin-block:var(--space-xs)}.api-content code{border:1px solid var(--rule);border-radius:.25rem;background:var(--paper);padding:.125rem .3rem;color:var(--ink);font:var(--text-planning-small)/1.65 ui-monospace,SFMono-Regular,Menlo,monospace}.table-wrap{width:100%;overflow:auto;margin:var(--space-lg) 0;border:1px solid var(--rule);background:var(--color-planning-surface)}table{width:100%;min-width:48rem;border-collapse:collapse;font-size:var(--text-planning-small);text-align:left}th,td{padding:var(--space-md);border-bottom:1px solid var(--rule);vertical-align:top}thead{background:var(--sage);color:var(--ink)}tbody tr:last-child td{border-bottom:0}tbody tr:hover td{background:color-mix(in oklab,var(--sage) 48%,transparent)}td:first-child{min-width:5.5rem;font-weight:700}.endpoint{margin:0;padding:var(--space-lg);border:1px solid var(--rule);border-top:3px solid var(--color-planning-rule-strong);background:var(--color-planning-surface)}.endpoint+.endpoint{margin-top:var(--space-md)}.endpoint:hover{border-top-color:var(--sea)}.endpoint p{margin:var(--space-xs) 0}.endpoint ul{margin-bottom:0;padding-left:var(--space-lg)}.api-footer{display:flex;align-items:center;gap:var(--space-lg);border-top:1px solid var(--rule);padding-block:var(--space-md);color:var(--muted);font-size:var(--text-planning-caption)}.api-footer p{margin:0 auto 0 0}.api-footer a{display:inline-flex;align-items:center;min-height:2.75rem;white-space:nowrap}[hidden]{display:none!important}@media(max-width:56rem){.api-index-nav{grid-template-columns:repeat(2,minmax(0,1fr))}.toolbar-inner{grid-template-columns:auto minmax(10rem,1fr) auto}.toolbar span{grid-column:2/4}.api-content p,.api-content li{font-size:var(--text-planning-small)}}@media(max-width:37.5rem){.api-intro{display:block;padding-block:var(--space-xl)}.api-state{margin-top:var(--space-lg);min-width:0}.api-index-nav{grid-template-columns:1fr}.toolbar-inner{grid-template-columns:1fr auto;padding-block:var(--space-sm)}.toolbar label{grid-column:1/3}.toolbar input{min-width:0}.toolbar span{grid-column:1/3}.api-content{padding-top:var(--space-md)}.api-content>h2{margin-top:var(--space-xl)}.endpoint{padding:var(--space-md)}table{min-width:42rem}.api-footer{flex-wrap:wrap}.api-footer p{width:100%}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{scroll-behavior:auto!important;transition:none!important}}@media print{.skip,.api-header,.api-index,.toolbar,.api-footer{display:none!important}.api-content{width:100%;padding:0}.api-content>h2{break-after:avoid}.endpoint,tr{break-inside:avoid}.endpoint[hidden]{display:block!important}.table-wrap{overflow:visible}table{min-width:0;font-size:.625rem}td,th{padding:.375rem}a{color:inherit}}
'''
script='''const input=document.getElementById('search'),count=document.getElementById('count');const cards=[...document.querySelectorAll('.endpoint')];function filter(){const q=input.value.trim().toLowerCase();let visible=0;for(const card of cards){const show=!q||card.textContent.toLowerCase().includes(q);card.hidden=!show;if(show)visible++;}count.textContent=visible+' / '+cards.length+'개 API 계약';}input.addEventListener('input',filter);document.getElementById('clear').addEventListener('click',()=>{input.value='';filter();input.focus();});document.querySelectorAll('.api-index-nav a').forEach(link=>link.addEventListener('click',()=>{if(input.value){input.value='';filter();}}));filter();'''
html='<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f8f6ed"><meta name="description" content="Catus 2.0.0 화면별 API v1 백엔드 전달 협의안"><title>Catus API v1 협의안</title><link rel="icon" href="data:,"><link rel="stylesheet" href="../../../feature-inventory.css"><link rel="stylesheet" href="../../../planning-tokens.css"><style>'+css+'</style></head><body><a class="skip" href="#api-content">API 본문으로 건너뛰기</a><div class="shell"><header class="api-header"><a class="brand" href="../../../">Catus</a><span class="doc-kind">API 스펙</span><nav aria-label="관련 페이지"><a class="back-link" href="../../../feature-inventory.html?tab=growth">← 섬의 발전</a><a href="gromo-api-spec.md">Markdown 원문 ↗</a><a href="./" aria-current="page">API-스펙</a></nav></header><section class="api-intro" aria-labelledby="api-title"><div><p class="eyebrow">Catus · API V1</p><h1 id="api-title">'+escape(TITLE)+'</h1><p class="api-intro-copy">2.0.0 화면에 필요한 조회와 행동을 화면·도메인·시설 기준으로 함께 확인하는 백엔드 전달 문서예요.</p></div><div class="api-state"><strong>협의안</strong><span>'+escape(VERSION)+'</span></div></section><details class="api-index"><summary>문서 목차 <span>'+str(len(nav))+'개 섹션</span></summary><nav class="api-index-nav" aria-label="API 문서 목차">'+''.join(f'<a class="{"sub" if level==3 else ""}" href="#{anchor}">{escape(title)}</a>' for anchor,title,level in nav)+'</nav></details></div><div class="toolbar"><div class="toolbar-inner shell"><label for="search">API 검색</label><input id="search" type="search" placeholder="기능·경로·권한 검색"><button id="clear" type="button">초기화</button><span id="count" aria-live="polite"></span></div></div><main id="api-content" class="api-content shell">'+''.join(html_parts)+'</main><footer class="api-footer shell"><p>기획 반영과 API 구현 완료는 별개예요.</p><a href="../../../feature-inventory.html?tab=growth">← 섬의 발전</a><a href="gromo-api-spec.md">Markdown 원문 ↗</a></footer><script>'+script+'</script></body></html>'

(DOC / 'index.html').write_text(html, encoding='utf-8')
ids = re.findall(r' id="([^"]+)"', html)
assert len(ids) == len(set(ids)), 'duplicate HTML anchor'
for anchor in re.findall(r'href="#([^"]+)"', html):
    assert anchor in ids, anchor
print('API v1 HTML regenerated from Markdown')
