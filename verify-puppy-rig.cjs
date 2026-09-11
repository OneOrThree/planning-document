const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright');
const base = (process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '');

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1020, height: 1050 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/rig-studio.js*', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
    await page.goto(base + '/rig.html?character=momo');
    await page.addScriptTag({ url: base + '/reading-profile-puppy.js' });
    await page.evaluate(async () => {
      document.body.innerHTML = '<main style="margin:0 auto;width:1000px"><p id="qa-label" style="margin:12px;color:#423d31;text-align:center">강아지 전용 리그 검증</p><div id="puppy-qa" style="position:relative;width:1000px;height:1000px;background:#efe8dc"></div></main>';
      document.body.style.cssText = 'margin:0;background:#efe8dc';
      window.puppyQa = GachisupCatRig.create(document.getElementById('puppy-qa'), {
        profile: GachisupReadingProfiles.puppy, resolution: 1254,
        name: 'puppy-reading-rig', label: '책을 읽는 강아지', paused: true
      });
      await puppyQa.ready;
    });
    const report = await page.evaluate(() => {
      const rig = puppyQa, names = rig.names, mesh = rig.mesh;
      const report = { loaded: rig.loaded, bones: names.length, capabilities: rig.capabilities, names, maxWeightError: 0, minAreaRatio: Infinity, manualMinAreaRatio: {}, effects: {}, samples: {} };
      const baseArea = (a, b, c, positions) => (positions[b * 2] - positions[a * 2]) * (positions[c * 2 + 1] - positions[a * 2 + 1]) - (positions[b * 2 + 1] - positions[a * 2 + 1]) * (positions[c * 2] - positions[a * 2]);
      for (const weights of mesh.weights) {
        report.maxWeightError = Math.max(report.maxWeightError, Math.abs(weights.reduce((sum, w) => sum + w, 0) - 1));
        if (weights.some(w => !Number.isFinite(w) || w < 0)) throw new Error('유효하지 않은 가중치');
      }
      for (const clip of ['read', 'idle', 'nod']) {
        rig.setClip(clip);
        for (let time = 0; time <= 12; time += 0.125) {
          rig.seek(time);
          for (let i = 0; i < mesh.indices.length; i += 3) {
            const [a, b, c] = mesh.indices.slice(i, i + 3);
            report.minAreaRatio = Math.min(report.minAreaRatio, baseArea(a, b, c, rig.positions) / baseArea(a, b, c, mesh.positions));
          }
        }
      }
      rig.setClip('read'); rig.seek(0);
      const probes = { body: [548, 820], head: [437, 356], earL: [177, 351], earR: [729, 426], book: [440, 690], armL: [160, 603], pawL: [150, 590], armR: [658, 670], pawR: [579, 655], tail: [885, 875], tailTip: [935, 735] };
      for (const [name, point] of Object.entries(probes)) {
        report.samples[name] = Object.fromEntries(names.map((bone, index) => [bone, Number(rig.weightsAt(...point)[index].toFixed(3))]).filter(([, weight]) => weight));
        rig.setBone(name, -rig.bones[name].limit); const a = rig.transformPoint(...point);
        rig.setBone(name, rig.bones[name].limit); const b = rig.transformPoint(...point);
        report.effects[name] = Math.hypot(a[0] - b[0], a[1] - b[1]);
        delete rig.overrides[name]; rig.render();
      }
      for (const name of rig.profile.controls) {
        let min = Infinity;
        for (const sign of [-1, 1]) {
          rig.setBone(name, sign * rig.bones[name].limit);
          for (let i = 0; i < mesh.indices.length; i += 3) {
            const [a, b, c] = mesh.indices.slice(i, i + 3);
            min = Math.min(min, baseArea(a, b, c, rig.positions) / baseArea(a, b, c, mesh.positions));
          }
        }
        report.manualMinAreaRatio[name] = min;
        delete rig.overrides[name]; rig.render();
      }
      rig.seek(4.96); report.blinkPeak = rig.blinkValue;
      rig.seek(10.2); report.pageOpacity = Number(rig.page.getAttribute('opacity'));
      report.export = { texture: rig.exportRig().texture, profileId: rig.exportRig().profile.id, joints: Object.keys(rig.exportRig().bones).length };
      return report;
    });
    assert.equal(report.loaded, true);
    assert.equal(report.bones, 12);
    assert.ok(report.maxWeightError < 1e-12);
    assert.ok(report.minAreaRatio > 0, '자동 동작에서 삼각형이 뒤집히지 않아야 함');
    for (const [name, ratio] of Object.entries(report.manualMinAreaRatio)) assert.ok(ratio > 0.25, name + ' 수동 한계각에서 메시 압축을 제한해야 함');
    for (const [name, effect] of Object.entries(report.effects)) assert.ok(effect > 0.3, name + ' 관절이 해당 형태를 실제로 움직여야 함');
    assert.ok(report.blinkPeak > 0.99);
    assert.ok(report.pageOpacity > 0.99);
    for (const [label, clip, time, background] of [
      ['read-open', 'read', 0, '#efe8dc'], ['read-blink', 'read', 4.96, '#efe8dc'],
      ['blink-closing', 'read', 4.84, '#efe8dc'], ['blink-half', 'read', 4.88, '#efe8dc'],
      ['read-page', 'read', 10.2, '#efe8dc'], ['page-right', 'read', 9.95, '#efe8dc'], ['page-left', 'read', 10.8, '#efe8dc'],
      ['idle-dark', 'idle', 2, '#27352e'], ['nod', 'nod', 0.75, '#efe8dc']
    ]) {
      await page.evaluate(({ label, clip, time, background }) => {
        puppyQa.setClip(clip); puppyQa.seek(time);
        document.getElementById('puppy-qa').style.background = background;
        document.getElementById('qa-label').textContent = label;
      }, { label, clip, time, background });
      await page.screenshot({ path: path.join(__dirname, 'tmp/verification/puppy-rig-' + label + '.png') });
    }
    await page.unroute('**/rig-studio.js*');
    await page.goto(base + '/rig.html?character=puppy');
    await page.locator('#character-mount[data-rig-state=ready]').waitFor();
    await page.locator('#turn-page').click();
    await page.waitForFunction(() => Number(document.querySelector('.momo-page').dataset.progress) > 0.2);
    await page.locator('#play-toggle').click();
    report.manualPageProgress = Number(await page.locator('.momo-page').getAttribute('data-progress'));
    assert.ok(report.manualPageProgress > 0.2 && report.manualPageProgress < 0.8);
    await page.screenshot({ path: path.join(__dirname, 'tmp/verification/puppy-rig-studio-manual-page.png') });
    assert.deepEqual(errors, []);
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
