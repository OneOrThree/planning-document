const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright');
const base = (process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '');
(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1650, height: 1200 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/rig-studio.js*', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
    await page.goto(base + '/rig.html?character=puppy');
    const report = await page.evaluate(async () => {
      document.body.innerHTML = '<main id="blink-qa"></main>';
      document.body.style.cssText = 'margin:0;background:#efe8dc';
      const result = {};
      window.blinkQaRigs = [];
      for (const id of ['puppy', 'capybara', 'red-panda']) {
        const row = document.createElement('section'); row.id = 'blink-' + id;
        row.style.cssText = 'display:flex;width:1650px;height:375px';
        document.getElementById('blink-qa').append(row);
        result[id] = [];
        for (const blink of [0, .25, .5, .75, 1]) {
          const cell = document.createElement('div'); cell.style.cssText = 'width:330px;height:375px';
          cell.innerHTML = '<p style="margin:8px;text-align:center">' + id + ' · ' + blink + '</p><div style="position:relative;width:330px;height:330px"></div>';
          row.append(cell);
          const profile = GachisupReadingProfiles[id];
          const rig = GachisupCatRig.create(cell.lastElementChild, { profile, paused: true, resolution: 1000 });
          await rig.ready;
          if (!rig.loaded) throw new Error(rig.error);
          rig.seek(0);
          const gl = rig.gl;
          gl.uniform1f(rig.blinkUniform, blink);
          gl.clear(gl.COLOR_BUFFER_BIT); gl.drawElements(gl.TRIANGLES, rig.mesh.indices.length, gl.UNSIGNED_SHORT, 0);
          const pixels = new Uint8Array(1000 * 1000 * 4); gl.readPixels(0, 0, 1000, 1000, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
          let alphaCount = 0, darkEyePixels = 0;
          for (let i = 3; i < pixels.length; i += 4) if (pixels[i] === 0) alphaCount++;
          for (const eye of profile.eyes) for (let y = -30; y <= 30; y++) for (let x = -25; x <= 25; x++) {
            const px = Math.round(eye.center[0] + x), py = 999 - Math.round(eye.center[1] + y), offset = (py * 1000 + px) * 4;
            if (pixels[offset] < 100 && pixels[offset + 1] < 60 && pixels[offset + 2] < 45) darkEyePixels++;
          }
          result[id].push({ blink, alphaCount, darkEyePixels, glError: gl.getError() });
          blinkQaRigs.push(rig);
        }
      }
      return result;
    });
    for (const id of ['puppy', 'capybara', 'red-panda']) {
      assert.equal(new Set(report[id].map(frame => frame.alphaCount)).size, 1, id + ' 눈 전환에서 투명 알파 유지');
      assert.ok(report[id].every(frame => frame.glError === 0), id + ' 셰이더 오류 없음');
      assert.ok(report[id][0].darkEyePixels > report[id][4].darkEyePixels, id + ' 동공을 감은 눈선으로 교체');
      await page.locator('#blink-' + id).screenshot({ path: path.join(__dirname, 'tmp/verification/blink-regression-' + id + '.png') });
    }
    await page.evaluate(() => { blinkQaRigs[3].container.style.cssText = 'position:fixed;left:0;top:0;width:1000px;height:1000px;background:#efe8dc;z-index:100'; });
    await page.locator('#blink-puppy .momo-rig-host').nth(3).screenshot({ path: path.join(__dirname, 'tmp/verification/blink-regression-puppy-detail.png') });
    const reverse = await page.evaluate(() => {
      const rig = blinkQaRigs[0], gl = rig.gl, snapshots = [];
      for (const value of [.25, .5, .75, 1, .75, .5, .25]) {
        gl.uniform1f(rig.blinkUniform, value); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawElements(gl.TRIANGLES, rig.mesh.indices.length, gl.UNSIGNED_SHORT, 0);
        const data = new Uint8Array(1000 * 1000 * 4); gl.readPixels(0, 0, 1000, 1000, gl.RGBA, gl.UNSIGNED_BYTE, data);
        snapshots.push(data);
      }
      return [0,1,2].map(index => { let count = 0, max = 0; const a = snapshots[index], b = snapshots[6-index]; for (let pixel = 0; pixel < a.length; pixel++) { const delta = Math.abs(a[pixel]-b[pixel]); if(delta) count++; max = Math.max(max,delta); } return { count, max }; });
    });
    console.log('역방향 프레임 차이', reverse);
    assert.ok(reverse.every(frame => frame.max <= 2), '같은 감김 정도의 정방향/역방향이 2/255 이내로 일치');
    const slow = await page.evaluate(async () => {
      const rig = blinkQaRigs[0], values = [], started = performance.now();
      rig.seek(0); rig.speed = .5; rig.blink(); rig.play();
      await new Promise(resolve => { const tick = () => { values.push(rig.blinkValue); if (performance.now() - started < 760) requestAnimationFrame(tick); else resolve(); }; requestAnimationFrame(tick); });
      rig.paused = true;
      return { frames: values.length, peak: Math.max(...values), last: values.at(-1), intermediate: values.filter(value => value > .2 && value < .8).length };
    });
    assert.ok(slow.peak > .95 && slow.last === 0 && slow.intermediate >= 2, '0.5배속에서 중간 감김과 다시 뜨는 프레임 재생');
    console.log('0.5배속 검증', slow);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
