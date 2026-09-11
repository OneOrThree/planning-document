const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.VILLAGE_URL || (process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '');

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1020, height: 1050 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/rig-studio.js*', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
    await page.goto(base + '/rig.html?character=golden');
    await page.setContent('<!doctype html><html lang="ko"><head><meta charset="utf-8"><base href="' + base + '/"></head><body style="margin:0;background:#efe8dc"><main style="margin:0 auto;width:1000px"><p id="qa-label" style="margin:12px;color:#423d31;text-align:center">골든리트리버 전용 리그 검증</p><div id="golden-qa" style="position:relative;width:1000px;height:1000px;background:#efe8dc"></div></main></body></html>');
    await page.addStyleTag({ url: base + '/momo-rig.css' });
    await page.addScriptTag({ url: base + '/reading-profile-golden.js' });
    await page.addScriptTag({ url: base + '/momo-rig.js' });
    await page.evaluate(async () => {
      window.goldenQa = GachisupCatRig.create(document.getElementById('golden-qa'), {
        profile: GachisupReadingProfiles.golden, resolution: 1254,
        name: 'golden-reading-rig', label: '책을 읽는 골든리트리버', paused: true
      });
      await goldenQa.ready;
      if (!goldenQa.loaded) throw new Error(goldenQa.error);
    });
    const report = await page.evaluate(async () => {
      const rig = goldenQa, names = rig.names, mesh = rig.mesh;
      const report = { loaded: rig.loaded, bones: names.length, capabilities: rig.capabilities, names, maxWeightError: 0, minAreaRatio: {}, manualMinAreaRatio: {}, effects: {}, weightedVertices: {}, assignments: {}, clamped: true };
      report.parentFirst = names.every((name, i) => !rig.bones[name].parent || names.indexOf(rig.bones[name].parent) < i);
      const area = (a, b, c, positions) => (positions[b * 2] - positions[a * 2]) * (positions[c * 2 + 1] - positions[a * 2 + 1]) - (positions[b * 2 + 1] - positions[a * 2 + 1]) * (positions[c * 2] - positions[a * 2]);
      const minArea = () => {
        let min = Infinity;
        for (let i = 0; i < mesh.indices.length; i += 3) {
          const [a, b, c] = mesh.indices.slice(i, i + 3);
          min = Math.min(min, area(a, b, c, rig.positions) / area(a, b, c, mesh.positions));
        }
        return min;
      };
      for (const weights of mesh.weights) {
        report.maxWeightError = Math.max(report.maxWeightError, Math.abs(weights.reduce((sum, w) => sum + w, 0) - 1));
        if (weights.some(w => !Number.isFinite(w) || w < 0)) throw new Error('유효하지 않은 가중치');
      }
      for (const clip of ['read', 'idle', 'nod']) {
        rig.setClip(clip);
        let minimum = Infinity;
        for (let time = 0; time <= 12; time += 0.125) {
          rig.seek(time);
          if (!Array.from(rig.positions).every(Number.isFinite)) throw new Error('유효하지 않은 메시 좌표');
          minimum = Math.min(minimum, minArea());
        }
        report.minAreaRatio[clip] = minimum;
      }
      rig.setClip('read'); rig.seek(0);
      const probes = { body: [625, 810], head: [436, 309], earL: [245, 331], earR: [677, 403], book: [418, 672], armL: [215, 577], pawL: [184, 614], armR: [679, 661], pawR: [570, 653], tail: [879, 703], tailTip: [805, 881] };
      for (const [name, point] of Object.entries(probes)) {
        const weights = rig.weightsAt(...point);
        report.assignments[name] = Object.fromEntries(names.map((bone, index) => [bone, Number(weights[index].toFixed(3))]).filter(([, weight]) => weight));
        report.weightedVertices[name] = mesh.weights.filter(row => row[names.indexOf(name)] > 0.05).length;
        rig.setBone(name, -rig.bones[name].limit); const a = rig.transformPoint(...point), positions = Array.from(rig.positions);
        rig.setBone(name, rig.bones[name].limit); const b = rig.transformPoint(...point);
        report.effects[name] = {
          point: Math.hypot(a[0] - b[0], a[1] - b[1]),
          vertices: rig.positions.filter((value, i) => Math.abs(value - positions[i]) > 0.1).length
        };
        delete rig.overrides[name]; rig.render();
      }
      for (const name of names) {
        let min = Infinity;
        for (const sign of [-1, 1]) {
          rig.setBone(name, sign * 10000);
          report.clamped &&= rig.overrides[name] === sign * rig.bones[name].limit;
          min = Math.min(min, minArea());
        }
        report.manualMinAreaRatio[name] = min;
        delete rig.overrides[name]; rig.render();
      }
      rig.seek(4.96); report.blinkPeak = rig.blinkValue;
      report.page = {};
      for (const time of [10.0, 10.65]) {
        rig.seek(time);
        const svg = rig.overlay.cloneNode(true);
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('width', '1000'); svg.setAttribute('height', '1000');
        svg.querySelector('.momo-guides').remove();
        const uri = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }));
        const image = new Image();
        await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = uri; });
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.canvas.width = ctx.canvas.height = 1000; ctx.drawImage(image, 0, 0);
        const pixels = ctx.getImageData(0, 0, 1000, 1000).data;
        let visiblePixels = 0;
        for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 100) visiblePixels++;
        URL.revokeObjectURL(uri);
        report.page[time] = { opacity: Number(rig.page.getAttribute('opacity')), progress: Number(rig.page.dataset.progress), visiblePixels, path: rig.page.getAttribute('d') };
      }
      report.alpha = [];
      for (const image of rig.images) {
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.canvas.width = image.naturalWidth; ctx.canvas.height = image.naturalHeight; ctx.drawImage(image, 0, 0);
        const data = ctx.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data;
        let zero = 0, partial = 0, opaque = 0;
        for (let i = 3; i < data.length; i += 4) { if (data[i] === 0) zero++; else if (data[i] === 255) opaque++; else partial++; }
        report.alpha.push({ width: image.naturalWidth, height: image.naturalHeight, zero, partial, opaque });
      }
      const exported = rig.exportRig();
      report.export = { texture: exported.texture, closed: exported.closedEyesTexture, profileId: exported.profile.id, joints: Object.keys(exported.bones).length, clips: exported.clips };
      rig.seek(10.0);
      const snapshot = await rig.snapshot();
      const bitmap = await createImageBitmap(snapshot);
      const ctx = document.createElement('canvas').getContext('2d');
      ctx.canvas.width = ctx.canvas.height = 1254; ctx.drawImage(bitmap, 0, 0);
      report.snapshot = { type: snapshot.type, size: snapshot.size, width: bitmap.width, height: bitmap.height, cornerAlpha: ctx.getImageData(0, 0, 1, 1).data[3] };
      return report;
    });
    console.log(JSON.stringify(report, null, 2));
    assert.equal(report.loaded, true);
    assert.equal(report.bones, 12);
    assert.ok(report.parentFirst && report.clamped);
    assert.ok(report.maxWeightError < 1e-12);
    for (const [clip, ratio] of Object.entries(report.minAreaRatio)) assert.ok(ratio > 0.25, clip + ' 자동 모션 메시가 뒤집히지 않아야 함');
    for (const [name, ratio] of Object.entries(report.manualMinAreaRatio)) assert.ok(ratio > 0.25, name + ' 수동 한계각에서 메시가 뒤집히지 않아야 함: ' + ratio);
    for (const [name, effect] of Object.entries(report.effects)) assert.ok(effect.point > 0.3 && effect.vertices > 10, name + ' 관절이 해당 형태의 정점을 실제로 움직여야 함');
    assert.ok(Object.values(report.weightedVertices).every(count => count > 5));
    assert.ok(report.blinkPeak > 0.99);
    assert.ok(Object.values(report.page).every(state => state.opacity > 0.99 && state.visiblePixels > 1000), '책장이 실제 화면에서 넓이를 가져야 함');
    assert.ok(report.alpha[0].zero > 400000 && report.alpha[0].partial > 0);
    assert.equal(report.snapshot.cornerAlpha, 0);
    assert.equal(report.snapshot.width, 1254);
    assert.equal(report.export.profileId, 'golden');
    for (const [label, clip, time, background] of [
      ['read-open', 'read', 0, '#efe8dc'], ['blink-closing', 'read', 4.84, '#efe8dc'],
      ['blink-half', 'read', 4.88, '#efe8dc'], ['read-blink', 'read', 4.96, '#efe8dc'],
      ['page-right', 'read', 10.0, '#efe8dc'], ['page-left', 'read', 10.65, '#efe8dc'],
      ['idle-dark', 'idle', 2, '#27352e'], ['nod', 'nod', 0.8, '#efe8dc'],
      ['debug', 'read', 0, '#efe8dc']
    ]) {
      await page.evaluate(({ label, clip, time, background }) => {
        goldenQa.setClip(clip); goldenQa.seek(time); goldenQa.setDebug(label === 'debug');
        document.getElementById('golden-qa').style.background = background;
        document.body.style.background = background;
        document.getElementById('qa-label').style.color = background === '#27352e' ? '#f8edce' : '#423d31';
        document.getElementById('qa-label').textContent = '골든리트리버 · ' + label + ' · ' + time + '초';
      }, { label, clip, time, background });
      await page.screenshot({ path: path.join(__dirname, 'tmp/verification/golden-rig-' + label + '.png') });
    }
    const snapshot = await page.evaluate(async () => {
      goldenQa.setDebug(false); goldenQa.setClip('read'); goldenQa.seek(10.0);
      return Array.from(new Uint8Array(await (await goldenQa.snapshot()).arrayBuffer()));
    });
    fs.writeFileSync(path.join(__dirname, 'tmp/verification/golden-rig-transparent-snapshot.png'), Buffer.from(snapshot));
    assert.deepEqual(errors, []);
    console.log('골든리트리버 12관절·알파·3개 모션·눈 깜빡임·책장·스냅샷 검증 통과');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
