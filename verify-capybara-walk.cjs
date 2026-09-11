const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.VILLAGE_URL || (process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '');
(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1400, height: 1500 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/walk-profile-capybara.js');
    await page.setContent('<!doctype html><html lang="ko"><head><base href="' + base + '/"><style>body{margin:0;padding:20px;background:#e7ecdc;display:grid;grid-template-columns:repeat(3,440px);gap:20px;font:16px sans-serif}section{background:#f8f3e6;padding:10px;border-radius:12px}h2{font-size:16px;margin:4px 10px}.mount{width:420px;height:420px}</style></head><body></body></html>');
    await page.addStyleTag({ url: base + '/momo-walk.css' });
    await page.addScriptTag({ url: base + '/walk-profile-capybara.js' });
    await page.addScriptTag({ url: base + '/momo-walk.js' });
    const report = await page.evaluate(async () => {
      const profile = GachisupWalkProfiles.capybara;
      const scenarios = [['front', '앞 · 정지', 'sw', 0, false], ['front-left', '앞 · 왼발', 'sw', .25, true], ['front-right', '앞 · 오른발', 'sw', .75, true], ['back', '뒤 · 정지', 'ne', 0, false], ['back-left', '뒤 · 왼발', 'ne', .25, true], ['back-right', '뒤 · 오른발', 'ne', .75, true], ['se', '남동 · 반전', 'se', .25, true], ['nw', '북서 · 반전', 'nw', .75, true], ['bones', '18개 관절', 'sw', 0, false]];
      const instances = {};
      for (const [id, label, direction, cycle, moving] of scenarios) {
        const section = document.createElement('section');
        section.innerHTML = '<h2>' + label + '</h2><div class="mount" id="capybara-walk-' + id + '"></div>';
        document.body.append(section);
        const rig = GachisupWalkRig.create(section.lastElementChild, { profile, preview: true, resolution: 1254 });
        await rig.ready;
        if (!rig.loaded) throw new Error(rig.error);
        rig.paused = true;
        rig.setDirection(direction);
        rig.setWalking(moving);
        rig.seek(cycle);
        if (id === 'bones') rig.setDebug(true);
        instances[id] = rig;
      }
      const rig = instances.front, names = rig.names;
      const parentFirst = names.every((name, i) => !profile.hierarchy[name][0] || names.indexOf(profile.hierarchy[name][0]) < i);
      const alpha0 = [];
      for (const image of rig.images) {
        const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1254;
        const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0);
        const data = ctx.getImageData(0, 0, 1254, 1254).data;
        let count = 0; for (let i = 3; i < data.length; i += 4) if (!data[i]) count++;
        alpha0.push(count);
      }
      const geometry = {};
      for (const [view, direction] of [['front', 'sw'], ['back', 'ne']]) {
        rig.setDirection(direction); rig.setWalking(true);
        const mesh = rig.meshes[view];
        let minArea = Infinity, inverted = 0, finite = true, supportDrift = 0, minAt = null;
        const point = (m, xy) => [m[0] * xy[0] + m[2] * xy[1] + m[4], m[1] * xy[0] + m[3] * xy[1] + m[5]];
        rig.setWalking(false); rig.seek(0);
        const soles = view === 'front' ? { L: [366, 936], R: [613, 967] } : { L: [376, 938], R: [611, 956] };
        const baseline = Object.fromEntries(['L', 'R'].map(side => [side, point(rig.matrices['foot' + side], soles[side])]));
        rig.setWalking(true);
        for (let sample = 0; sample <= 40; sample++) {
          rig.seek(sample / 40);
          finite &&= Array.from(rig.positions).every(Number.isFinite);
          for (let i = 0; i < mesh.indices.length; i += 3) {
            const a = mesh.indices[i] * 2, b = mesh.indices[i + 1] * 2, c = mesh.indices[i + 2] * 2, p = rig.positions;
            const area = -((p[b] - p[a]) * (p[c + 1] - p[a + 1]) - (p[b + 1] - p[a + 1]) * (p[c] - p[a]));
            if (area < minArea) { minArea = area; minAt = { cycle: sample / 40, xy: [mesh.positions[a], mesh.positions[a + 1]], weights: Object.fromEntries(mesh.weights[a / 2].map((weight, index) => [names[index], weight]).filter(([, weight]) => weight > .01)) }; } if (area <= 0) inverted++;
          }
          for (const side of ['L', 'R']) if (rig.footLift[side] < .001) supportDrift = Math.max(supportDrift, Math.abs(point(rig.matrices['foot' + side], soles[side])[1] - baseline[side][1]));
        }
        geometry[view] = { minArea, minAt, inverted, finite, supportDrift, normalizedWeights: mesh.weights.every(row => row.length === 18 && Math.abs(row.reduce((sum, weight) => sum + weight, 0) - 1) < 0.00001) };
      }
      rig.setDirection('sw'); rig.setWalking(false); rig.seek(0);
      return { joints: names.length, parentFirst, alpha0, geometry, palette: getComputedStyle(rig.container).getPropertyValue('--walk-palette'), stride: rig.exportRig().stride, noTail: !names.includes('tail'), sourceViews: Object.fromEntries(Object.entries(rig.views).map(([key, view]) => [key, view.src])) };
    });
    await page.screenshot({ path: path.join(__dirname, 'tmp/verification/capybara-walk-qa.png'), fullPage: true });
    for (const id of ['front-left', 'back-right', 'bones']) await page.locator('#capybara-walk-' + id).screenshot({ path: path.join(__dirname, 'tmp/verification/capybara-walk-' + id + '.png') });
    console.log(JSON.stringify(report, null, 2));
    assert.equal(report.joints, 18); assert.ok(report.parentFirst && report.noTail); assert.equal(report.palette, 'none');
    assert.ok(report.alpha0.every(value => value > 900000));
    assert.ok(Object.values(report.geometry).every(value => value.finite && value.normalizedWeights && value.inverted === 0));
    assert.ok(Object.values(report.geometry).every(value => value.supportDrift < 12));
    assert.equal(errors.length, 0, errors.join('\n'));
    console.log('카피바라 앞뒤 18관절·전주기·접지·4방향 검증 통과');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
