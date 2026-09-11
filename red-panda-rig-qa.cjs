/* 기존 설치된 브라우저로 레서판다 전용 프레임과 메시를 검사한다. */
const { chromium } = require('playwright');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 840 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '') + '/red-panda-rig-qa.html'));
  await page.waitForSelector('body[data-ready="true"]');
  await page.screenshot({ path: path.join(__dirname, 'red-panda-rig-qa-states.png') });
  const states = await page.evaluate(() => redPandaQaRigs.map(r => ({
    loaded: r.loaded, error: r.error, clip: r.clip, time: r.time,
    blink: r.blinkValue, source: r.source, bones: r.names.length,
    pageOpacity: r.page.getAttribute('opacity'),
    finite: Array.from(r.positions).every(Number.isFinite),
    weightError: Math.max(...r.mesh.weights.map(row => Math.abs(row.reduce((a, b) => a + b, 0) - 1)))
  })));
  const movement = await page.evaluate(() => {
    const rig = redPandaQaRigs[0], samples = { head: [440, 390], earL: [270, 100], earR: [720, 210], book: [430, 700], armL: [155, 631], armR: [610, 660], tail: [905, 730], tailTip: [785, 920] };
    rig.seek(0);
    const before = Object.fromEntries(Object.entries(samples).map(([bone, point]) => [bone, rig.transformPoint(...point)]));
    const result = {};
    for (const [bone, point] of Object.entries(samples)) {
      rig.overrides = {};
      rig.setBone(bone, rig.bones[bone].limit);
      const after = rig.transformPoint(...point);
      result[bone] = Math.hypot(after[0] - before[bone][0], after[1] - before[bone][1]);
    }
    rig.overrides = {}; rig.render();
    return result;
  });
  await page.evaluate(() => {
    const times = [4.83, 4.86, 4.91, 4.96, 10.05, 10.5];
    redPandaQaRigs.forEach((rig, index) => {
      rig.setDebug(false); rig.setClip('read'); rig.seek(times[index]);
      rig.container.parentElement.querySelector('h2').textContent = `${index < 4 ? '위에서 내려오는 눈꺼풀' : '종이 넘김'} · ${times[index]}초`;
    });
  });
  await page.screenshot({ path: path.join(__dirname, 'red-panda-rig-qa-transitions.png') });
  console.log(JSON.stringify({ errors, states, movement }, null, 2));
  if (errors.length || states.some(s => !s.loaded || !s.finite || s.weightError > 1e-9)) process.exitCode = 1;
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
