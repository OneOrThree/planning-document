const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.VILLAGE_URL || (process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '');

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 1880 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/reading-profile-capybara.js');
    await page.setContent('<!doctype html><html lang="ko"><head><base href="' + base + '/"><style>body{margin:0;padding:20px;background:#e9eedf;font:18px sans-serif;display:grid;grid-template-columns:repeat(2,560px);gap:20px}section{background:#f8f3e6;border-radius:16px;padding:10px;box-sizing:border-box}h2{font-size:18px;margin:4px 12px}.mount{width:540px;height:540px;position:relative}</style></head><body></body></html>');
    await page.addStyleTag({ url: base + '/momo-rig.css' });
    await page.addScriptTag({ url: base + '/reading-profile-capybara.js' });
    await page.addScriptTag({ url: base + '/momo-rig.js' });
    const results = await page.evaluate(async () => {
      const profile = GachisupReadingProfiles.capybara;
      const scenarios = [
        ['original', '독서 · 0초', 'read', 0],
        ['blink', '눈 깜빡임 · 4.96초', 'read', 4.96],
        ['page', '책장 · 10.2초', 'read', 10.2],
        ['idle', '쉬기 · 2초', 'idle', 2],
        ['nod', '끄덕임 · 0.83초', 'nod', 0.83],
        ['bones', '관절 위치', 'read', 0],
        ['half-blink', '눈 절반 감기 · 4.86초', 'read', 4.86],
        ['page-left', '책장 왼쪽 · 10.7초', 'read', 10.7]
      ];
      window.capybaraQA = {};
      for (const [id, label, clip, time] of scenarios) {
        const section = document.createElement('section');
        section.innerHTML = '<h2>' + label + '</h2><div class="mount" id="capybara-' + id + '"></div>';
        document.body.append(section);
        const rig = GachisupCatRig.create(section.lastElementChild, { profile, paused: true, resolution: 1254, clip, label: '카피바라' });
        await rig.ready;
        if (!rig.loaded) throw new Error(rig.error);
        rig.seek(time);
        if (id === 'bones') rig.setDebug(true);
        window.capybaraQA[id] = rig;
      }
      const rig = window.capybaraQA.original;
      const exported = rig.exportRig();
      const order = rig.names;
      const parentFirst = order.every((name, i) => !rig.bones[name].parent || order.indexOf(rig.bones[name].parent) < i);
      const baseline = Array.from(rig.positions);
      const movement = {};
      for (const name of order.filter(name => name !== 'root')) {
        rig.setBone(name, rig.bones[name].limit);
        movement[name] = Math.max(...rig.positions.map((value, i) => Math.abs(value - baseline[i])));
        rig.overrides = {};
        rig.render();
      }
      rig.seek(0);
      const keypoints = { head: [500, 360], earL: [370, 110], earR: [709, 175], book: [430, 650], armL: [180, 594], armR: [609, 657], body: [750, 800] };
      const assignments = Object.fromEntries(Object.entries(keypoints).map(([name, xy]) => {
        const weights = rig.weightsAt(...xy);
        return [name, { dominant: order[weights.indexOf(Math.max(...weights))], weight: Math.max(...weights) }];
      }));
      let minimumTriangleArea = Infinity;
      for (const clip of ['read', 'idle', 'nod']) {
        rig.setClip(clip);
        for (let time = 0; time <= 12; time += 0.5) {
          rig.seek(time);
          for (let i = 0; i < rig.mesh.indices.length; i += 3) {
            const [a, b, c] = Array.from(rig.mesh.indices.slice(i, i + 3), index => index * 2);
            const p = rig.positions;
            const area = -((p[b] - p[a]) * (p[c + 1] - p[a + 1]) - (p[b + 1] - p[a + 1]) * (p[c] - p[a]));
            minimumTriangleArea = Math.min(minimumTriangleArea, area);
          }
        }
      }
      rig.setClip('read');
      rig.seek(0);
      const ctx = document.createElement('canvas').getContext('2d');
      ctx.canvas.width = ctx.canvas.height = 1254;
      ctx.drawImage(rig.images[0], 0, 0);
      const pixels = ctx.getImageData(0, 0, 1254, 1254).data;
      let alpha0 = 0;
      for (let i = 3; i < pixels.length; i += 4) if (pixels[i] === 0) alpha0++;
      return {
        parentFirst, movement, assignments, alpha0, minimumTriangleArea,
        joints: order.length,
        finite: Array.from(rig.positions).every(Number.isFinite),
        normalizedWeights: exported.mesh.weights.every(row => row.length === order.length && Math.abs(row.reduce((sum, weight) => sum + weight, 0) - 1) < 0.0001),
        blink: window.capybaraQA.blink.blinkValue,
        pageOpacity: window.capybaraQA.page.page.getAttribute('opacity'),
        pageClip: window.capybaraQA.page.overlay.querySelector('.momo-page-window').getAttribute('d'),
        capabilities: exported.capabilities
      };
    });
    assert.equal(results.joints, 8);
    assert.ok(results.parentFirst && results.finite && results.normalizedWeights);
    assert.ok(results.alpha0 > 800000);
    assert.ok(results.blink > 0.99 && Number(results.pageOpacity) > 0.9);
    assert.ok(Object.values(results.movement).every(value => value > 0.5));
    assert.ok(Object.entries(results.assignments).every(([name, value]) => value.dominant === name));
    assert.ok(results.minimumTriangleArea > 0, '세 모션 전체 구간의 삼각형 뒤집힘 없음');
    assert.equal(errors.length, 0, errors.join('\n'));
    await page.screenshot({ path: path.join(__dirname, 'tmp/verification/capybara-rig-qa.png'), fullPage: true });
    await page.locator('#capybara-blink').screenshot({ path: path.join(__dirname, 'tmp/verification/capybara-rig-blink.png') });
    await page.locator('#capybara-page').screenshot({ path: path.join(__dirname, 'tmp/verification/capybara-rig-page.png') });
    await page.locator('#capybara-half-blink').screenshot({ path: path.join(__dirname, 'tmp/verification/capybara-rig-half-blink.png') });
    await page.locator('#capybara-page-left').screenshot({ path: path.join(__dirname, 'tmp/verification/capybara-rig-page-left.png') });
    console.log(JSON.stringify(results, null, 2));
    console.log('카피바라 관절·알파·깜빡임·책장 렌더링 검증 통과');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
