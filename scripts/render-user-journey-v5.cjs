const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');

const root = path.resolve(__dirname, '..');
const directory = path.join(root, 'docs', 'user-journey', 'v5');
const sourcePath = path.join(directory, 'user-journey.md');
const outputPath = path.join(directory, 'index.html');

const escapeHtml = value => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const inline = value => escapeHtml(value).replace(
  /\[([^\]]+)\]\(([^)]+)\)/g,
  '<a href="$2">$1</a>'
);

const source = fs.readFileSync(sourcePath, 'utf8');
const sourceHash = createHash('sha256').update(source).digest('hex');
const lines = source.split(/\r?\n/);
const title = lines.find(line => line.startsWith('# '))?.slice(2).trim();
if (!title) throw new Error('유저저니 제목을 찾을 수 없습니다.');

const introIndex = lines.findIndex(line => line.startsWith('# ')) + 1;
const intro = lines.slice(introIndex).find(line => line.trim() && !line.startsWith('#'))?.trim() || '';
const sections = [];
let current = null;
for (const line of lines) {
  if (line.startsWith('## ')) {
    current = {title: line.slice(3).trim(), items: [], notes: []};
    sections.push(current);
  } else if (current && line.startsWith('- ')) {
    const content = line.slice(2).trim();
    const separator = content.indexOf(':');
    current.items.push({
      label: separator === -1 ? '' : content.slice(0, separator).trim(),
      text: separator === -1 ? content : content.slice(separator + 1).trim()
    });
  } else if (current && line.trim()) {
    current.notes.push(line.trim());
  }
}

if (sections.length !== 10) throw new Error(`유저저니 10개가 필요하지만 ${sections.length}개를 찾았습니다.`);

const renderSection = (section, index) => {
  const start = section.items.find(item => item.label === '시작');
  const finish = section.items.find(item => item.label === '완료');
  const branches = section.items.filter(item => item.label === '분기');
  const steps = section.items.filter(item => !['시작', '완료', '분기'].includes(item.label));
  const number = String(index + 1).padStart(2, '0');
  return `<section class="journey" id="journey-${index + 1}" data-journey>
    <header class="journey-heading"><span>${number}</span><h2>${inline(section.title)}</h2></header>
    <div class="boundary" aria-label="시작과 완료">
      <article><small>시작</small><p>${inline(start?.text || '')}</p></article>
      <span aria-hidden="true">→</span>
      <article><small>완료</small><p>${inline(finish?.text || '')}</p></article>
    </div>
    <ol class="steps">${steps.map((item, stepIndex) => `<li><span>${String(stepIndex + 1).padStart(2, '0')}</span><div><strong>${inline(item.label)}</strong><p>${inline(item.text)}</p></div></li>`).join('')}</ol>
    ${branches.length ? `<details class="branches"><summary>분기 ${branches.length}개 보기</summary><ul>${branches.map(item => `<li>${inline(item.text)}</li>`).join('')}</ul></details>` : ''}
    ${section.notes.length ? `<div class="notes">${section.notes.map(note => `<p>${inline(note)}</p>`).join('')}</div>` : ''}
  </section>`;
};

const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#f7f8f4">
  <meta name="source-sha256" content="${sourceHash}">
  <title>Catus — 사용자 여정 v5</title>
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="../../../planning-tokens.css">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <a class="skip" href="#journeys">사용자 여정으로 건너뛰기</a>
  <div class="shell">
    <header class="masthead">
      <div class="identity"><a class="brand" href="../../../feature-inventory.html?tab=journey">Catus</a><span>사용자 여정 v5</span></div>
      <nav aria-label="관련 문서"><a href="../../../feature-inventory.html?tab=journey">기획 작업대</a><a href="../../ia/v5/">IA v5</a><a href="user-journey.md">Markdown 원본 ↗</a></nav>
    </header>
    <main>
      <section class="hero" aria-labelledby="page-title"><div><p class="eyebrow">Catus / R61 / VERSION 5</p><h1 id="page-title">${inline(title)}</h1></div><p>${inline(intro)}</p></section>
      <nav class="index" aria-label="사용자 여정 목차">${sections.map((section, index) => `<a href="#journey-${index + 1}"><span>${String(index + 1).padStart(2, '0')}</span>${inline(section.title)}</a>`).join('')}</nav>
      <div id="journeys">${sections.map(renderSection).join('')}</div>
    </main>
    <footer><span>R61 정책 반영본 · 2026.09.17</span><span>기획 반영 ≠ 앱 구현 완료</span></footer>
  </div>
</body>
</html>`;

fs.writeFileSync(outputPath, html.replace(/^[ \t]+$/gm, ''));
console.log(`사용자 여정 v5 HTML 생성: ${path.relative(root, outputPath)} · ${sections.length}개 여정`);
