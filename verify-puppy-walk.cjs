const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright');
const base = (process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '');
(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1360, height: 1450 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/walk-profile-puppy.js');
    await page.setContent('<html><head><base href="' + base + '/"><style>body{margin:0;padding:20px;background:#e7ecdc;display:grid;grid-template-columns:repeat(3,420px);gap:20px;font:16px sans-serif}section{background:#f8f3e6;padding:10px}h2{font-size:16px;margin:4px 10px}.mount{width:400px;height:400px}</style></head><body></body></html>');
    await page.addStyleTag({ url: base + '/momo-walk.css' });
    await page.addScriptTag({ url: base + '/walk-profile-puppy.js' });
    await page.addScriptTag({ url: base + '/momo-walk.js' });
    const report = await page.evaluate(async () => {
      const profile = GachisupWalkProfiles.puppy, scenarios = [['front', '앞 · 정지', 'sw', 0, false], ['front-left', '앞 · 왼발', 'sw', .25, true], ['front-right', '앞 · 오른발', 'sw', .75, true], ['back', '뒤 · 정지', 'ne', 0, false], ['back-left', '뒤 · 왼발', 'ne', .25, true], ['back-right', '뒤 · 오른발', 'ne', .75, true], ['se', '남동 · 반전', 'se', .25, true], ['nw', '북서 · 반전', 'nw', .75, true], ['bones', '20개 관절', 'sw', 0, false]], rigs = {};
      for (const [id, label, direction, cycle, moving] of scenarios) {
        const section = document.createElement('section'); section.innerHTML = '<h2>' + label + '</h2><div class="mount" id="puppy-walk-' + id + '"></div>'; document.body.append(section);
        const rig = GachisupWalkRig.create(section.lastElementChild, { profile, preview: true, resolution: 1254 }); await rig.ready;
        if (!rig.loaded) throw new Error(rig.error);
        rig.paused = true; rig.setDirection(direction); rig.setWalking(moving); rig.seek(cycle); if (id === 'bones') rig.setDebug(true); rigs[id] = rig;
      }
      const rig = rigs.front, geometry = {}, alpha0 = [];
      for (const image of rig.images) {
        const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1254; const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0);
        const data = ctx.getImageData(0, 0, 1254, 1254).data; let count = 0; for (let i = 3; i < data.length; i += 4) if (!data[i]) count++; alpha0.push(count);
      }
      for (const [view, direction] of [['front', 'sw'], ['back', 'ne']]) {
        rig.setDirection(direction); rig.setWalking(true);
        const mesh = rig.meshes[view]; let minArea = Infinity, minAt, inverted = 0, finite = true;
        for (let sample = 0; sample <= 60; sample++) {
          rig.seek(sample / 60); finite &&= Array.from(rig.positions).every(Number.isFinite);
          for (let i = 0; i < mesh.indices.length; i += 3) {
            const a = mesh.indices[i] * 2, b = mesh.indices[i + 1] * 2, c = mesh.indices[i + 2] * 2, p = rig.positions;
            const area = -((p[b] - p[a]) * (p[c + 1] - p[a + 1]) - (p[b + 1] - p[a + 1]) * (p[c] - p[a]));
            if (area < minArea) { minArea = area; minAt = { cycle: sample / 60, point: [mesh.positions[a], mesh.positions[a + 1]], weights: Object.fromEntries(mesh.weights[a / 2].map((weight, index) => [rig.names[index], weight]).filter(([, weight]) => weight > .01)) }; }
            if (area <= 0) inverted++;
          }
        }
        geometry[view] = { minArea, minAt, inverted, finite, normalizedWeights: mesh.weights.every(row => row.length === 20 && Math.abs(row.reduce((a, b) => a + b, 0) - 1) < 1e-12) };
      }
      rig.setDirection('sw'); rig.setWalking(false); rig.seek(0);
      return { joints: rig.names.length, parentFirst: rig.names.every((name, index) => !profile.hierarchy[name][0] || rig.names.indexOf(profile.hierarchy[name][0]) < index), alpha0, geometry, palette: getComputedStyle(rig.container).getPropertyValue('--walk-palette'), views: Object.fromEntries(Object.entries(rig.views).map(([name, view]) => [name, view.src])) };
    });
    await page.screenshot({ path: path.join(__dirname, 'tmp/verification/puppy-walk-qa.png'), fullPage: true });
    for (const id of ['front-left', 'back-right', 'bones']) await page.locator('#puppy-walk-' + id).screenshot({ path: path.join(__dirname, 'tmp/verification/puppy-walk-' + id + '.png') });
    console.log(JSON.stringify(report, null, 2));
    assert.equal(report.joints, 20); assert.ok(report.parentFirst); assert.equal(report.palette, 'none');
    assert.ok(report.alpha0.every(count => count > 700000));
    assert.ok(Object.values(report.geometry).every(value => value.finite && value.normalizedWeights && value.inverted === 0));
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
