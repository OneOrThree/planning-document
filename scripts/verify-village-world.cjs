const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("response", (r) => {
      if (r.status() >= 400) errors.push(r.url() + ": " + r.status());
    });
    await page.goto(
      (process.env.BASE_URL || "http://127.0.0.1:4184/") + "village-world.html",
    );
    await page.waitForFunction(() => window.prototype);
    assert.equal(
      await page.evaluate(() => window.prototype.objects().length),
      109,
    );
    await page.selectOption("#tile-size", "32");
    assert.equal(
      await page.evaluate(() => window.prototype.mapData().tiles.length),
      1536,
    );
    await page.selectOption("#tile-size", "64");
    await page.locator('[data-stage="bare"]').click();
    assert.equal(
      await page.evaluate(() => window.prototype.state.layers.buildings),
      false,
    );
    await page.locator('[data-stage="village"]').click();
    const routes = await page.evaluate(() => {
      const p = window.prototype,
        doors = p
          .roadData()
          .lines.filter((r) => r.door)
          .map((r) => r.door);
      return [...doors, p.crossings.dock.arrival, [200, 170]].map(
        ([x, y]) => p.route(x, y).length,
      );
    });
    assert(
      routes.every((n) => n > 0),
      "모든 문·부두·작은 섬이 연결되어야 한다",
    );
    const download = page.waitForEvent("download");
    await page.locator("#export").click();
    const zip = fs.readFileSync(await (await download).path());
    for (const name of [
      "sprites/dock.png",
      "sprites/bridge.png",
      "roads/overlay.png",
      "map.json",
      "tiles/0-0.png",
    ])
      assert(zip.includes(Buffer.from(name)), name);
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify({
        result: "PASS",
        objects: 109,
        tiles32: 1536,
        routes: routes.length,
        download: true,
        errors,
      }),
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
