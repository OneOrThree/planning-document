// 기획 시연의 확정된 배치를 앱용 그림·좌표로 내보낸다. 실행: node scripts/export-village-world.cjs
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const { startServer } = require("./serve.cjs");
(async () => {
  const { server, url } = await startServer({ prefix: "/planning-document/" });
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(url + "village-world.html");
    await page.waitForFunction(() => !!window.prototype);
    const result = await page.evaluate(() => {
      const images = {};
      const save = (name, c) => {
        images[name] = c.toDataURL("image/png").split(",")[1];
      };
      const cropped = (name, c) => {
        const g = c.getContext("2d"),
          d = g.getImageData(0, 0, c.width, c.height).data;
        let x0 = c.width,
          y0 = c.height,
          x1 = -1,
          y1 = -1;
        for (let y = 0; y < c.height; y++)
          for (let x = 0; x < c.width; x++)
            if (d[(y * c.width + x) * 4 + 3] > 0) {
              x0 = Math.min(x0, x);
              y0 = Math.min(y0, y);
              x1 = Math.max(x1, x);
              y1 = Math.max(y1, y);
            }
        if (x1 < 0) return null;
        const tile = document.createElement("canvas");
        tile.width = x1 - x0 + 1;
        tile.height = y1 - y0 + 1;
        tile
          .getContext("2d")
          .drawImage(
            c,
            x0,
            y0,
            tile.width,
            tile.height,
            0,
            0,
            tile.width,
            tile.height,
          );
        save(name, tile);
        return { file: name, x: x0, y: y0, w: tile.width, h: tile.height };
      };
      const data = mapData(),
        binding = {
          hall: "hall",
          "notice-board": "board",
          gramophone: "gram",
          library: "library",
          mailbox: "mail",
          observatory: "tower",
          shop: "shop",
        };
      data.objects = data.objects.map((o) => ({
        ...o,
        building: binding[o.kind] || null,
      }));
      data.doors = Object.fromEntries(
        data.roads.lines
          .filter((r) => r.objectId)
          .map((r) => {
            const o = data.objects.find((o) => o.id === r.objectId);
            return [binding[o.kind], { x: r.door[0], y: r.door[1] }];
          }),
      );
      for (const [kind, c] of Object.entries(sprites)) save(kind + ".png", c);
      const dock = document.createElement("canvas");
      dock.width = dock.height = 1024;
      dock.getContext("2d").drawImage(imgs["dock-back"], 0, 0);
      dock.getContext("2d").drawImage(imgs["dock-front"], 0, 0);
      save("dock.png", dock);
      const allLines = roadLines,
        allPlazas = roadPlazas;
      data.roadLayers = [];
      const cells = () =>
        Array.from(
          { length: 48 * 32 },
          (_, i) =>
            inLand((i % 48) * 32 + 16, Math.floor(i / 48) * 32 + 16) &&
            roadDistance((i % 48) * 32 + 16, Math.floor(i / 48) * 32 + 16) < 0,
        );
      roadLines = allLines.filter((r) => !r.objectId);
      roadPlazas = allPlazas.filter(
        (p) => !data.objects.find((o) => o.id === p.id)?.building,
      );
      paintRoads();
      data.roadLayers.push({
        ...cropped("road-base.png", roadCanvas),
        cells: cells(),
        building: null,
      });
      for (const [kind, building] of Object.entries(binding)) {
        const o = data.objects.find((o) => o.kind === kind);
        roadLines = allLines.filter((r) => r.objectId === o.id);
        roadPlazas = allPlazas.filter((p) => p.id === o.id);
        paintRoads();
        data.roadLayers.push({
          ...cropped("road-" + building + ".png", roadCanvas),
          cells: cells(),
          building,
        });
      }
      roadLines = allLines;
      roadPlazas = allPlazas;
      paintRoads();
      data.schemaVersion = 1;
      data.source = "planning-document/village-world.html";
      data.reviewStatus = "development-preview";
      return { data, images };
    });
    const out = path.resolve(__dirname, "../assets/village-world/export");
    fs.mkdirSync(out, { recursive: true });
    for (const [name, base64] of Object.entries(result.images))
      fs.writeFileSync(path.join(out, name), Buffer.from(base64, "base64"));
    fs.writeFileSync(
      path.join(out, "map.json"),
      JSON.stringify(result.data, null, 2) + "\n",
    );
    fs.copyFileSync(
      path.resolve(out, "../terrain.png"),
      path.join(out, "terrain.png"),
    );
    console.log(
      JSON.stringify({
        objects: result.data.objects.length,
        roads: result.data.roadLayers.length,
        images: Object.keys(result.images).length,
      }),
    );
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
