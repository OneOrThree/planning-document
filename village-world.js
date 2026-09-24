const W = 1536,
  H = 1024,
  $ = (s) => document.querySelector(s),
  canvas = $("#world"),
  ctx = canvas.getContext("2d");
const state = {
  mode: "play",
  stage: "village",
  time: "day",
  size: 64,
  zoom: 1,
  effects: true,
  collision: false,
  auto: false,
  edit: false,
  snap: true,
  kind: "flowers",
  selected: null,
  x: 820,
  y: 535,
  facing: 1,
  moving: false,
  frame: 0,
  path: [],
  clock: 0,
  layers: {
    roads: true,
    grass: true,
    flowers: true,
    trees: true,
    fire: true,
    buildings: true,
    cat: true,
  },
};
const imgs = {},
  sprites = {},
  tiles = [];
const keys = new Set();
let objects = [],
  nextId = 1,
  view = { scale: 1, x: 0, y: 0, gap: 0 },
  last = 0,
  drag = null,
  autoIndex = 0,
  nav = [];
const kinds = {
  grass: { label: "풀", layer: "grass", w: 44, h: 29, cell: 0 },
  flowers: { label: "꽃", layer: "flowers", w: 47, h: 39, cell: 1 },
  bush: { label: "수풀", layer: "trees", w: 87, h: 70, cell: 2 },
  tree: { label: "활엽수", layer: "trees", w: 155, h: 174, cell: 3 },
  pine: { label: "소나무", layer: "trees", w: 100, h: 164, cell: 4 },
  fire: { label: "모닥불", layer: "fire", w: 116, h: 77, cell: 5 },
  hall: { label: "회관", layer: "buildings", w: 242, h: 244 },
  library: { label: "도서관", layer: "buildings", w: 239, h: 323 },
  shop: { label: "상점", layer: "buildings", w: 262, h: 199 },
  observatory: { label: "전망대", layer: "buildings", w: 112, h: 193 },
  "notice-board": { label: "게시판", layer: "buildings", w: 80, h: 80 },
  gramophone: { label: "축음기", layer: "buildings", w: 73, h: 89 },
  mailbox: { label: "우체통", layer: "buildings", w: 46, h: 63 },
};
const land = [
  [245, 410],
  [350, 347],
  [464, 276],
  [526, 178],
  [622, 122],
  [735, 137],
  [848, 163],
  [977, 139],
  [1116, 125],
  [1245, 142],
  [1325, 226],
  [1363, 314],
  [1410, 387],
  [1416, 517],
  [1433, 631],
  [1365, 684],
  [1247, 706],
  [1147, 727],
  [1039, 768],
  [947, 786],
  [847, 820],
  [681, 810],
  [569, 791],
  [432, 738],
  [329, 660],
  [277, 543],
];

const crossings = {
  dock: {
    x: 82,
    y: 575,
    w: 380,
    h: 380,
    arrival: [250, 774],
    polygon: [
      [163, 802],
      [204, 834],
      [426, 686],
      [367, 649],
    ],
  },
  bridge: {
    x: 292,
    y: 140,
    w: 246,
    h: 147,
    polygon: [
      [306, 174],
      [330, 158],
      [521, 244],
      [492, 267],
    ],
  },
  grove: [
    [73, 122],
    [138, 77],
    [244, 82],
    [301, 135],
    [322, 193],
    [298, 219],
    [220, 238],
    [120, 224],
    [63, 178],
  ],
};
function insidePolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i],
      b = polygon[j];
    if (
      a[1] > y !== b[1] > y &&
      x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]
    )
      inside = !inside;
  }
  return inside;
}
function drawCrossings() {
  const d = crossings.dock,
    b = crossings.bridge;
  ctx.drawImage(imgs["dock-back"], d.x, d.y, d.w, d.h);
  ctx.drawImage(imgs["dock-front"], d.x, d.y, d.w, d.h);
  ctx.drawImage(sprites.bridge, b.x, b.y, b.w, b.h);
}

function inLand(x, y) {
  const polygons = [land, crossings.grove];
  if (state.layers.buildings)
    polygons.push(crossings.dock.polygon, crossings.bridge.polygon);
  return polygons.some((p) => insidePolygon(x, y, p));
}
const visible = (o) => state.layers[kinds[o.kind].layer];
function blocked(o, x, y, pad = 10) {
  const k = kinds[o.kind];
  if (k.layer === "grass" || k.layer === "flowers") return false;
  if (k.layer === "buildings")
    return (
      x > o.x - o.w * 0.46 - pad &&
      x < o.x + o.w * 0.46 + pad &&
      y > o.y - o.h * 0.22 - pad &&
      y < o.y + pad
    );
  const rx =
      o.kind === "fire"
        ? o.w * 0.46
        : o.kind === "bush"
          ? o.w * 0.37
          : o.w * 0.18,
    ry = o.kind === "fire" ? o.h * 0.38 : o.kind === "bush" ? o.h * 0.2 : 12;
  return (
    ((x - o.x) / (rx + pad)) ** 2 + ((y - (o.y - ry * 0.4)) / (ry + pad)) ** 2 <
    1
  );
}
function walkable(x, y) {
  return inLand(x, y) && !objects.some((o) => visible(o) && blocked(o, x, y));
}
const CELL = 16,
  COLS = W / CELL,
  ROWS = H / CELL;
function makeNav() {
  nav = Array.from({ length: COLS * ROWS }, (_, i) =>
    walkable((i % COLS) * CELL + 8, Math.floor(i / COLS) * CELL + 8),
  );
}
function nearest(x, y) {
  let best = -1,
    d = Infinity;
  nav.forEach((v, i) => {
    if (v) {
      const q =
        ((i % COLS) * CELL + 8 - x) ** 2 +
        (Math.floor(i / COLS) * CELL + 8 - y) ** 2;
      if (q < d) {
        d = q;
        best = i;
      }
    }
  });
  return best;
}
function route(x, y) {
  return roadRoute(x, y);
}
// 검토용 길 레이어: 원화·소품과 분리한 곡선, 입구 연결, 32px 비용 지도.
const roadCanvas = document.createElement("canvas");
roadCanvas.width = W;
roadCanvas.height = H;
let roadLines = [],
  roadCells = [],
  roadPlazas = [];
const loopPoints = [
  [530, 605],
  [623, 613],
  [746, 560],
  [881, 521],
  [1016, 453],
  [1042, 380],
  [944, 345],
  [796, 330],
  [681, 367],
  [582, 413],
  [496, 480],
  [487, 557],
];
const segmentDistance = (x, y, a, b) => {
  const dx = b[0] - a[0],
    dy = b[1] - a[1],
    t = Math.max(
      0,
      Math.min(
        1,
        ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1),
      ),
    );
  return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy);
};
function smooth(points, closed = false) {
  const out = [];
  for (let i = 0; i < (closed ? points.length : points.length - 1); i++) {
    const at = (n) =>
      points[
        closed
          ? (n + points.length) % points.length
          : Math.max(0, Math.min(points.length - 1, n))
      ];
    const p0 = at(i - 1),
      p1 = at(i),
      p2 = at(i + 1),
      p3 = at(i + 2),
      steps = Math.max(
        4,
        Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 7),
      );
    for (let j = 0; j < steps; j++) {
      const t = j / steps,
        t2 = t * t,
        t3 = t2 * t;
      out.push(
        [0, 1].map(
          (k) =>
            0.5 *
            (2 * p1[k] +
              (-p0[k] + p2[k]) * t +
              (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 +
              (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3),
        ),
      );
    }
  }
  out.push(closed ? [...out[0]] : [...points.at(-1)]);
  return out;
}
function roadDistance(x, y) {
  let best = Infinity;
  for (const r of roadLines)
    for (let i = 1; i < r.samples.length; i++)
      best = Math.min(
        best,
        segmentDistance(x, y, r.samples[i - 1], r.samples[i]) - r.width / 2,
      );
  for (const p of roadPlazas)
    best = Math.min(
      best,
      (Math.hypot((x - p.x) / p.rx, (y - p.y) / p.ry) - 1) *
        Math.min(p.rx, p.ry),
    );
  return best;
}
function closestLoop(x, y) {
  let best = null,
    d = Infinity;
  for (const p of roadLines[0].samples) {
    const n = (p[0] - x) ** 2 + (p[1] - y) ** 2;
    if (n < d) {
      d = n;
      best = p;
    }
  }
  return [...best];
}
function rebuildRoads() {
  roadLines = [
    {
      id: "village-loop",
      kind: "main",
      width: 45,
      closed: true,
      points: loopPoints,
      samples: smooth(loopPoints, true),
    },
  ];
  roadPlazas = [];
  const dockPoints = [
    [380, 688],
    [428, 651],
    [475, 608],
    [530, 605],
  ];
  roadLines.push({
    id: "dock-entry",
    kind: "branch",
    width: 28,
    points: dockPoints,
    samples: smooth(dockPoints),
  });
  for (const o of objects) {
    const layer = kinds[o.kind].layer;
    if (layer === "fire" && visible(o)) {
      roadPlazas.push({ id: o.id, x: o.x, y: o.y - 8, rx: 73, ry: 48 });
      const join = closestLoop(o.x, o.y + 43);
      const points = [join, [o.x - 25, o.y + 48], [o.x, o.y + 23]];
      roadLines.push({
        id: "fire-" + o.id,
        kind: "branch",
        width: 33,
        points,
        samples: smooth(points),
      });
    }
    if (layer !== "buildings" || !visible(o)) continue;
    const dx =
        { hall: -0.07, library: -0.23, shop: -0.13, observatory: 0 }[o.kind] ||
        0,
      door = [o.x + dx * o.w, o.y + 14],
      approach = [door[0], door[1] + 21],
      join = closestLoop(...approach);
    let points;
    if (join[1] < o.y + 4 && Math.abs(join[0] - o.x) < o.w * 0.65) {
      const side = o.x + (join[0] < o.x ? -1 : 1) * (o.w * 0.5 + 39);
      points = [
        join,
        [side, Math.max(join[1], o.y - o.h * 0.25)],
        [side, approach[1]],
        [door[0], approach[1]],
        door,
      ];
    } else
      points = [
        join,
        [(join[0] + approach[0]) * 0.5, (join[1] + approach[1]) * 0.5 + 12],
        approach,
        door,
      ];
    if (o.kind === "observatory") {
      const main = [closestLoop(530, 320), [546, 332], [510, 287], [502, 246]];
      roadLines.push({
        id: "tower-bridge-" + o.id,
        kind: "branch",
        objectId: o.id,
        door,
        width: 28,
        points: main,
        samples: smooth(main),
      });
      points = [door, [250, 223], [282, 207], [310, 184]];
    }
    roadLines.push({
      id: "door-" + o.id,
      kind: "branch",
      objectId: o.id,
      door,
      width: ["hall", "library", "shop", "observatory"].includes(o.kind)
        ? 28
        : 20,
      points,
      samples: smooth(points),
    });
    roadPlazas.push({
      id: o.id,
      x: door[0],
      y: door[1] - 3,
      rx: o.w > 100 ? 25 : 16,
      ry: 11,
    });
  }
  roadCells = Array.from(
    { length: 48 * 32 },
    (_, i) =>
      inLand((i % 48) * 32 + 16, Math.floor(i / 48) * 32 + 16) &&
      roadDistance((i % 48) * 32 + 16, Math.floor(i / 48) * 32 + 16) < 0,
  );
  paintRoads();
}
// 여러 길을 하나의 거리장으로 합쳐 겹친 이음부와 외곽 테두리를 없앤다.
function hashNoise(x, y, seed = 0) {
  let n = Math.imul(x, 374761393) + Math.imul(y, 668265263) + seed * 1013;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}
const ease = (t) => t * t * (3 - 2 * t);
function fieldNoise(x, y, scale, seed = 0) {
  x /= scale;
  y /= scale;
  const ix = Math.floor(x),
    iy = Math.floor(y),
    tx = ease(x - ix),
    ty = ease(y - iy);
  const a = hashNoise(ix, iy, seed),
    b = hashNoise(ix + 1, iy, seed),
    c = hashNoise(ix, iy + 1, seed),
    d = hashNoise(ix + 1, iy + 1, seed);
  return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
}
function paintRoads() {
  const g = roadCanvas.getContext("2d"),
    field = new Float32Array(W * H).fill(1000);
  // 곡선 전체를 연속된 캡슐로 래스터화한다. 폭 변화는 완만하게 이어진다.
  for (const r of roadLines) {
    let distance = 0;
    for (let i = 1; i < r.samples.length; i++) {
      const a = r.samples[i - 1],
        b = r.samples[i],
        dx = b[0] - a[0],
        dy = b[1] - a[1],
        length = Math.hypot(dx, dy);
      distance += length;
      const width =
          r.width *
          0.5 *
          (1 +
            Math.sin(distance / 83) * 0.055 +
            Math.sin(distance / 39 + 2) * 0.025),
        pad = width + 13;
      const left = Math.max(0, Math.floor(Math.min(a[0], b[0]) - pad)),
        right = Math.min(W - 1, Math.ceil(Math.max(a[0], b[0]) + pad)),
        top = Math.max(0, Math.floor(Math.min(a[1], b[1]) - pad)),
        bottom = Math.min(H - 1, Math.ceil(Math.max(a[1], b[1]) + pad));
      for (let y = top; y <= bottom; y++)
        for (let x = left; x <= right; x++) {
          const t = Math.max(
              0,
              Math.min(
                1,
                ((x - a[0]) * dx + (y - a[1]) * dy) / (length * length || 1),
              ),
            ),
            d = Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy) - width,
            j = y * W + x;
          if (d < field[j]) field[j] = d;
        }
    }
  }
  for (const p of roadPlazas) {
    for (
      let y = Math.max(0, Math.floor(p.y - p.ry - 14));
      y <= Math.min(H - 1, p.y + p.ry + 14);
      y++
    )
      for (
        let x = Math.max(0, Math.floor(p.x - p.rx - 14));
        x <= Math.min(W - 1, p.x + p.rx + 14);
        x++
      ) {
        const angle = Math.atan2((y - p.y) / p.ry, (x - p.x) / p.rx),
          dist =
            (Math.hypot((x - p.x) / p.rx, (y - p.y) / p.ry) - 1) *
              Math.min(p.rx, p.ry) +
            Math.sin(angle * 5 + p.id) * 1.1,
          j = y * W + x;
        if (dist < field[j]) field[j] = dist;
      }
  }
  const image = g.createImageData(W, H),
    pixels = image.data;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const d = field[y * W + x];
      if (d > 12) continue;
      const edgeNoise =
        (fieldNoise(x, y, 9, 11) - 0.5) * 5.2 +
        (fieldNoise(x, y, 3, 23) - 0.5) * 2.1;
      const boundary = d + edgeNoise;
      const coverage = ease(Math.max(0, Math.min(1, (2.2 - boundary) / 4.1)));
      if (coverage < 0.003) continue;
      const broad = fieldNoise(x, y, 52, 7) - 0.5,
        mottle = fieldNoise(x, y, 12, 13) - 0.5,
        grain = hashNoise(x, y, 17) - 0.5;
      const wear = ease(Math.max(0, Math.min(1, (-d + 2) / 20))),
        warm = fieldNoise(x, y, 27, 91) - 0.5;
      const j = (y * W + x) * 4,
        variation = broad * 18 + mottle * 12 + grain * 9;
      pixels[j] = 218 + wear * 13 + variation + warm * 3;
      pixels[j + 1] = 187 + wear * 13 + variation * 0.87;
      pixels[j + 2] = 139 + wear * 14 + variation * 0.68 - warm * 3;
      pixels[j + 3] = Math.round(
        coverage * (0.93 + wear * 0.035 + mottle * 0.025) * 255,
      );
    }
  g.clearRect(0, 0, W, H);
  g.putImageData(image, 0, 0);
  // 드문드문 놓인 작은 돌과 물감 자국. 중앙은 이동을 읽기 쉽도록 비워둔다.
  for (let y = 3; y < H - 3; y += 7)
    for (let x = 3; x < W - 3; x += 7) {
      const d = field[y * W + x],
        chance = hashNoise(x, y, 61);
      if (d > -0.5 || d < -17 || chance > 0.12) continue;
      const px = x + hashNoise(x, y, 2) * 4,
        py = y + hashNoise(x, y, 3) * 4,
        r = 0.85 + hashNoise(x, y, 5) * 1.3;
      g.fillStyle = "#ae926158";
      g.beginPath();
      g.ellipse(px, py + 0.7, r * 1.2, r * 0.55, -0.2, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#fff0c0a0";
      g.beginPath();
      g.ellipse(px, py, r, r * 0.5, -0.2, 0, Math.PI * 2);
      g.fill();
    }
  // 가장자리에 작은 잔디 결을 흩뿌려 흙과 바닥이 섞이게 한다.
  for (let y = 4; y < H - 5; y += 6)
    for (let x = 4; x < W - 5; x += 6) {
      const d = field[y * W + x];
      if (d < -1.5 || d > 3.5 || hashNoise(x, y, 73) > 0.33) continue;
      const gx = field[y * W + x + 1] - field[y * W + x - 1],
        gy = field[(y + 1) * W + x] - field[(y - 1) * W + x],
        angle = Math.atan2(gy, gx),
        height = 2.5 + hashNoise(x, y, 44) * 4;
      g.strokeStyle = hashNoise(x, y, 72) > 0.5 ? "#859547aa" : "#a3aa53a0";
      g.lineWidth = 0.7;
      for (let k = 0; k < 2; k++) {
        g.beginPath();
        g.moveTo(x + Math.cos(angle) * 2, y + Math.sin(angle) * 2);
        g.quadraticCurveTo(
          x + (k ? 2 : -2),
          y - height * 0.4,
          x + (k ? 2.5 : -1.5),
          y - height,
        );
        g.stroke();
      }
    }
  // 건물 문턱에는 흙과 석재가 이어지는 작은 돌 몇 개만 놓는다.
  for (const r of roadLines) {
    if (!r.door || r.width < 25) continue;
    const [x, y] = r.door;
    for (let i = 0; i < 3; i++) {
      const px = x + (i % 2 ? 3 : -2),
        py = y + 3 + i * 5.2,
        w = 5 + hashNoise(i, r.objectId, 3) * 2;
      g.fillStyle = "#877c6552";
      g.beginPath();
      g.ellipse(px, py + 1, w + 1, 2.7, -0.08, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = i % 2 ? "#cabda0" : "#d6c8aa";
      g.beginPath();
      g.moveTo(px - w, py);
      g.lineTo(px - w * 0.7, py - 2);
      g.lineTo(px + w * 0.6, py - 2.2);
      g.lineTo(px + w, py + 0.2);
      g.lineTo(px + w * 0.3, py + 2);
      g.lineTo(px - w * 0.65, py + 1.7);
      g.closePath();
      g.fill();
      g.strokeStyle = "#f0dfb99c";
      g.lineWidth = 0.65;
      g.beginPath();
      g.moveTo(px - w * 0.6, py - 1.7);
      g.lineTo(px + w * 0.5, py - 1.9);
      g.stroke();
    }
  }
  // 소품 배치 영역과 같은 지형 경계에서 자른다.
  g.globalCompositeOperation = "destination-in";
  g.fillStyle = "#000";
  g.beginPath();
  land.forEach((p, i) => (i ? g.lineTo(...p) : g.moveTo(...p)));
  g.closePath();
  g.fill();
  g.globalCompositeOperation = "source-over";
}

function clearRoadCenters() {
  for (const o of objects) {
    if (!["grass", "flowers", "trees"].includes(kinds[o.kind].layer)) continue;
    const margin = kinds[o.kind].layer === "trees" ? 22 : 5;
    if (roadDistance(o.x, o.y) >= margin) continue;
    let placed = false;
    for (let radius = 20; radius <= 160 && !placed; radius += 12)
      for (let j = 0; j < 24 && !placed; j++) {
        const a = (j / 24) * Math.PI * 2 + (o.id % 7),
          x = o.x + Math.cos(a) * radius,
          y = o.y + Math.sin(a) * radius;
        if (
          inLand(x, y) &&
          roadDistance(x, y) > margin &&
          roadDistance(x, y) < margin + 24 &&
          !objects.some(
            (b) => kinds[b.kind].layer === "buildings" && blocked(b, x, y, 25),
          )
        ) {
          o.x = x;
          o.y = y;
          placed = true;
        }
      }
  }
}
function roadData() {
  return {
    surface: {
      version: 4,
      render: "distance-field-watercolor",
      edge: "irregular-feather",
      seed: 919,
    },
    asset: "roads/overlay.png",
    visible: state.layers.roads,
    cellSize: 32,
    columns: 48,
    rows: 32,
    cells: roadCells,
    lines: roadLines.map(({ samples, ...r }) => r),
    plazas: roadPlazas,
    note: "길 선호 이동. 잔디도 통행 가능. 건물 표시·위치 변경 시 샛길 재계산.",
  };
}
// 대각선 이동과 길 비용을 사용하며, 장애물 모서리를 가로지르지 않는다.
function roadRoute(x, y) {
  const start = nearest(state.x, state.y),
    end = nearest(x, y);
  if (start < 0 || end < 0) return [];
  const cost = new Float64Array(nav.length).fill(Infinity),
    parent = new Int32Array(nav.length).fill(-1),
    heap = [];
  const push = (id, score) => {
    heap.push({ id, score });
    let i = heap.length - 1;
    while (i) {
      const p = (i - 1) >> 1;
      if (heap[p].score <= score) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0],
      last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      while (true) {
        let j = i * 2 + 1;
        if (j >= heap.length) break;
        if (j + 1 < heap.length && heap[j + 1].score < heap[j].score) j++;
        if (heap[i].score <= heap[j].score) break;
        [heap[i], heap[j]] = [heap[j], heap[i]];
        i = j;
      }
    }
    return top;
  };
  const h = (p) =>
    Math.hypot(
      (p % COLS) - (end % COLS),
      Math.floor(p / COLS) - Math.floor(end / COLS),
    ) * 0.8;
  cost[start] = 0;
  push(start, h(start));
  while (heap.length) {
    const { id: p, score } = pop();
    if (score > cost[p] + h(p) + 1e-8) continue;
    if (p === end) break;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const cx = (p % COLS) + dx,
          cy = Math.floor(p / COLS) + dy,
          q = cy * COLS + cx;
        if (
          cx < 0 ||
          cx >= COLS ||
          cy < 0 ||
          cy >= ROWS ||
          !nav[q] ||
          (dx && dy && (!nav[p + dx] || !nav[p + dy * COLS]))
        )
          continue;
        const onRoad =
            state.layers.roads &&
            roadCells[Math.floor(cy / 2) * 48 + Math.floor(cx / 2)],
          n = cost[p] + Math.hypot(dx, dy) * (onRoad ? 0.8 : 2.7);
        if (n < cost[q]) {
          cost[q] = n;
          parent[q] = p;
          push(q, n + h(q));
        }
      }
  }
  if (!Number.isFinite(cost[end])) return [];
  const out = [];
  for (let p = end; p !== -1; p = parent[p])
    out.push([(p % COLS) * CELL + 8, Math.floor(p / COLS) * CELL + 8]);
  return out.reverse();
}

function repairNavigation() {
  rebuildRoads();
  makeNav();
  state.path = [];
  if (!walkable(state.x, state.y)) {
    const n = nearest(state.x, state.y);
    if (n >= 0) {
      state.x = (n % COLS) * CELL + 8;
      state.y = Math.floor(n / COLS) * CELL + 8;
    }
  }
}
function add(kind, x, y, scale = 1) {
  const k = kinds[kind],
    o = { id: nextId++, kind, x, y, w: k.w * scale, h: k.h * scale };
  objects.push(o);
  return o;
}
function populate() {
  objects = [];
  nextId = 1;
  [
    ["hall", 1095, 321],
    ["library", 1235, 598],
    ["shop", 1000, 751],
    ["observatory", 205, 203],
    ["notice-board", 929, 319],
    ["gramophone", 442, 493],
    ["mailbox", 363, 603],
    ["fire", 560, 565],
  ].forEach(([k, x, y]) => add(k, x, y));
  const trees = [
    [345, 439],
    [356, 580],
    [461, 668],
    [519, 748],
    [843, 770],
    [996, 748],
    [1370, 540],
    [1321, 358],
    [1220, 211],
    [817, 214],
    [661, 244],
    [711, 402],
    [951, 488],
    [1141, 673],
    [1365, 667],
    [864, 682],
  ];
  trees.forEach(([x, y], i) =>
    add(
      i % 3 === 1 ? "pine" : i % 3 === 2 ? "bush" : "tree",
      x,
      y,
      0.8 + (i % 4) * 0.08,
    ),
  );
  let seed = 729;
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  let tries = 0;
  for (let i = 0; i < 85 && tries < 1200; tries++) {
    const x = 300 + rand() * 1080,
      y = 160 + rand() * 620;
    if (
      !inLand(x, y) ||
      objects.some(
        (o) =>
          kinds[o.kind].layer === "buildings" &&
          x > o.x - o.w * 0.65 &&
          x < o.x + o.w * 0.65 &&
          y > o.y - o.h * 0.6 &&
          y < o.y + 40,
      ) ||
      Math.hypot(x - 820, y - 535) < 85
    )
      continue;
    add(i % 3 === 0 ? "flowers" : "grass", x, y, 0.7 + rand() * 0.6);
    i++;
  }
  rebuildRoads();
  clearRoadCenters();
  repairNavigation();
}
function trimmed(image, sx = 0, sy = 0, sw = image.width, sh = image.height) {
  const c = document.createElement("canvas");
  c.width = sw;
  c.height = sh;
  const g = c.getContext("2d");
  g.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
  const d = g.getImageData(0, 0, sw, sh).data;
  let x1 = sw,
    y1 = sh,
    x2 = 0,
    y2 = 0;
  for (let y = 0; y < sh; y++)
    for (let x = 0; x < sw; x++) {
      if (d[(y * sw + x) * 4 + 3] > 36) {
        x1 = Math.min(x1, x);
        y1 = Math.min(y1, y);
        x2 = Math.max(x2, x);
        y2 = Math.max(y2, y);
      }
    }
  const t = document.createElement("canvas");
  t.width = x2 - x1 + 1;
  t.height = y2 - y1 + 1;
  t.getContext("2d").drawImage(
    c,
    x1,
    y1,
    t.width,
    t.height,
    0,
    0,
    t.width,
    t.height,
  );
  return t;
}
function splitTiles() {
  tiles.length = 0;
  for (let y = 0; y < H; y += state.size)
    for (let x = 0; x < W; x += state.size) {
      const c = document.createElement("canvas");
      c.width = c.height = state.size;
      c.getContext("2d").drawImage(
        imgs.terrain,
        x,
        y,
        state.size,
        state.size,
        0,
        0,
        state.size,
        state.size,
      );
      tiles.push(c);
    }
  $('[data-mode="grid"]').textContent = state.size + "px 경계";
  $("#scene-tag").textContent =
    `${state.size} × ${state.size} px · ${tiles.length.toLocaleString()}개 지형 타일`;
}
function transform() {
  const gap = state.mode === "explode" ? Math.max(5, state.size * 0.12) : 0,
    cols = W / state.size,
    rows = H / state.size,
    vw = W + (cols - 1) * gap,
    vh = H + (rows - 1) * gap;
  const fit = Math.min(W / vw, H / vh),
    scale = state.mode === "explode" ? fit * 0.94 : state.zoom;
  const x =
      state.mode === "explode"
        ? (W - vw * scale) / 2
        : Math.min(0, Math.max(W - W * scale, W / 2 - state.x * scale)),
    y =
      state.mode === "explode"
        ? (H - vh * scale) / 2
        : Math.min(0, Math.max(H - H * scale, H / 2 - state.y * scale));
  view = { scale, x, y, gap };
  ctx.translate(x, y);
  ctx.scale(scale, scale);
}
function drawObject(o) {
  const k = kinds[o.kind],
    sway =
      state.effects && ["grass", "flowers", "trees"].includes(k.layer)
        ? Math.sin(state.clock * 1.6 + o.id) * 0.018
        : 0;
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.rotate(sway);
  ctx.drawImage(sprites[o.kind], -o.w / 2, -o.h, o.w, o.h);
  ctx.restore();
  if (o.kind === "fire") drawFire(o);
  if (state.edit && o.id === state.selected) {
    ctx.strokeStyle = "#fff8b7";
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(o.x - o.w / 2 - 4, o.y - o.h - 4, o.w + 8, o.h + 8);
    ctx.setLineDash([]);
    ctx.fillStyle = "#244c3d";
    ctx.font = "14px system-ui";
    ctx.fillText(
      `${k.label} · ${Math.round(o.x)}, ${Math.round(o.y)}`,
      o.x - o.w / 2,
      o.y - o.h - 13,
    );
  }
}
function drawFire(o) {
  const t = state.effects ? state.clock : 0,
    x = o.x,
    y = o.y - o.h * 0.43,
    s = o.w / 116;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const glow = ctx.createRadialGradient(0, 0, 5, 0, 0, 90);
  glow.addColorStop(0, "#ffd77560");
  glow.addColorStop(1, "#ffd77500");
  ctx.fillStyle = glow;
  ctx.fillRect(-90, -90, 180, 180);
  for (let i = 0; i < 3; i++) {
    const dx = Math.sin(t * 5 + i) * 4,
      height = 46 + Math.sin(t * 7 + i * 2) * 9 - i * 9;
    ctx.fillStyle = ["#f58036", "#ffc34f", "#fff3a5"][i];
    ctx.beginPath();
    ctx.moveTo(-18 + i * 6, 6);
    ctx.bezierCurveTo(-34 + i * 8, -17, dx + 13, -height + 15, dx, -height);
    ctx.bezierCurveTo(dx + 28 - i * 6, -20, 26 - i * 7, 6, 0, 10);
    ctx.fill();
  }
  if (state.effects)
    for (let i = 0; i < 8; i++) {
      const p = (t * 0.43 + i / 8) % 1;
      ctx.fillStyle = `rgba(255,218,126,${1 - p})`;
      ctx.beginPath();
      ctx.arc(
        Math.sin(t * 2 + i) * 17,
        -25 - p * 70,
        1.8 * (1 - p) + 0.3,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  ctx.restore();
}
function drawCat() {
  ctx.save();
  ctx.translate(state.x, state.y);
  ctx.fillStyle = "#19332738";
  ctx.beginPath();
  ctx.ellipse(0, -3, 23, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.scale(state.facing, 1);
  ctx.drawImage(
    imgs[state.moving ? "walk-" + state.frame : "idle"],
    -47,
    -83,
    94,
    94,
  );
  ctx.restore();
}
function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#9fbfb7";
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  transform();
  if (state.time === "night") ctx.filter = "brightness(.52) saturate(.72)";
  const cols = W / state.size;
  tiles.forEach((tile, i) => {
    const x = (i % cols) * (state.size + view.gap),
      y = Math.floor(i / cols) * (state.size + view.gap);
    ctx.drawImage(tile, x, y);
    if (state.mode !== "play") {
      ctx.strokeStyle = "#ffffda80";
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, state.size - 1, state.size - 1);
    }
  });
  if (state.mode !== "explode") {
    if (state.layers.buildings) drawCrossings();
    if (state.layers.roads) ctx.drawImage(roadCanvas, 0, 0);
    if (state.collision) {
      nav.forEach((v, i) => {
        if (v) {
          ctx.fillStyle = "#73ffb339";
          ctx.fillRect(
            (i % COLS) * CELL,
            Math.floor(i / COLS) * CELL,
            CELL - 1,
            CELL - 1,
          );
        }
      });
    }
    if (state.path.length && state.layers.cat) {
      ctx.strokeStyle = "#fff7c9";
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 7]);
      ctx.beginPath();
      ctx.moveTo(state.x, state.y);
      state.path.forEach((p) => ctx.lineTo(...p));
      ctx.stroke();
      ctx.setLineDash([]);
    }
    const items = objects
      .filter(visible)
      .map((o) => ({ z: o.y, draw: () => drawObject(o) }));
    if (state.layers.cat) items.push({ z: state.y, draw: drawCat });
    items.sort((a, b) => a.z - b.z).forEach((i) => i.draw());
  }
  ctx.filter = "none";
  ctx.restore();
  $("#count").textContent =
    objects.filter(visible).length + "개 / " + objects.length + "개";
  $("#position").textContent = `${Math.round(state.x)}, ${Math.round(state.y)}`;
}
function setAuto(v) {
  state.auto = v;
  $("#auto").textContent = v ? "산책 멈추기" : "자동 산책";
  $("#auto").classList.toggle("active", v);
}
const stops = [
  [1000, 368],
  [680, 365],
  [505, 480],
  [575, 610],
  [740, 560],
  [1010, 465],
];
function tick(ms) {
  const dt = Math.min((ms - last) / 1000 || 0, 0.04);
  last = ms;
  state.clock += dt;
  state.moving = false;
  if (state.mode !== "explode" && !state.edit && state.layers.cat) {
    let dx =
        (keys.has("ArrowRight") || keys.has("d") ? 1 : 0) -
        (keys.has("ArrowLeft") || keys.has("a") ? 1 : 0),
      dy =
        (keys.has("ArrowDown") || keys.has("s") ? 1 : 0) -
        (keys.has("ArrowUp") || keys.has("w") ? 1 : 0);
    if (dx || dy) {
      state.path = [];
      setAuto(false);
      const n = Math.hypot(dx, dy);
      dx = (dx / n) * dt * 150;
      dy = (dy / n) * dt * 150;
      const ox = state.x,
        oy = state.y;
      if (walkable(state.x + dx, state.y)) state.x += dx;
      if (walkable(state.x, state.y + dy)) state.y += dy;
      state.moving = Math.hypot(ox - state.x, oy - state.y) > 0;
      if (dx) state.facing = dx < 0 ? -1 : 1;
    } else {
      if (state.auto && !state.path.length)
        state.path = route(...stops[autoIndex++ % stops.length]);
      if (state.path.length) {
        const p = state.path[0],
          dx = p[0] - state.x,
          dy = p[1] - state.y,
          d = Math.hypot(dx, dy),
          step = 150 * dt;
        if (d <= step) {
          state.x = p[0];
          state.y = p[1];
          state.path.shift();
        } else {
          state.x += (dx / d) * step;
          state.y += (dy / d) * step;
        }
        if (Math.abs(dx) > 0.1) state.facing = dx < 0 ? -1 : 1;
        state.moving = true;
      }
    }
  }
  state.frame = Math.floor(state.clock * 8) % 6;
  render();
  requestAnimationFrame(tick);
}
function message(text) {
  $("#message").textContent = text;
}
function updateSelection() {
  const o = objects.find((o) => o.id === state.selected);
  $("#delete").disabled = !o;
  $("#selection").textContent = o
    ? `${kinds[o.kind].label} #${o.id} · 좌표 ${Math.round(o.x)}, ${Math.round(o.y)} · ${Math.round(o.w)} × ${Math.round(o.h)} px`
    : `추가할 소품: ${kinds[state.kind].label} · 빈 땅을 눌러 추가, 기존 소품을 끌어 이동`;
}
function mode(v) {
  state.mode = v;
  document
    .querySelectorAll("[data-mode]")
    .forEach((b) => b.classList.toggle("active", b.dataset.mode === v));
  $("#hint").textContent =
    v === "explode"
      ? "빈 지형만 분할 · 소품은 별도 좌표로 보관"
      : state.edit
        ? "소품을 끌어 이동 · 빈 땅을 눌러 추가"
        : "땅을 눌러 이동 · 방향키 / WASD";
}
function setEdit(v) {
  state.edit = v;
  setAuto(false);
  state.path = [];
  keys.clear();
  if (v) mode("play");
  $("#edit").textContent = v ? "산책 모드로 돌아가기" : "배치 모드 켜기";
  $("#edit").classList.toggle("active", v);
  mode(state.mode);
}
function syncLayers() {
  document
    .querySelectorAll("[data-layer]")
    .forEach((el) => (el.checked = state.layers[el.dataset.layer]));
  repairNavigation();
}
function stage(v) {
  state.stage = v;
  document
    .querySelectorAll("[data-stage]")
    .forEach((b) => b.classList.toggle("active", b.dataset.stage === v));
  for (const k of Object.keys(state.layers))
    state.layers[k] =
      v === "village" ||
      (v === "green" && ["grass", "flowers", "trees"].includes(k));
  setAuto(false);
  state.selected = null;
  syncLayers();
  mode("play");
  updateSelection();
  message(
    v === "bare"
      ? "소품을 모두 숨긴 빈 지형입니다."
      : v === "green"
        ? "풀·꽃·나무만 올렸어요. 바닥과는 별개입니다."
        : "모닥불과 시설, 고양이까지 모두 올렸어요.",
  );
}
function point(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (((e.clientX - r.left) * W) / r.width - view.x) / view.scale,
    y: (((e.clientY - r.top) * H) / r.height - view.y) / view.scale,
  };
}
function hit(x, y) {
  return objects
    .filter(visible)
    .sort((a, b) => b.y - a.y)
    .find(
      (o) =>
        x >= o.x - o.w / 2 && x <= o.x + o.w / 2 && y >= o.y - o.h && y <= o.y,
    );
}
function placePosition(x, y) {
  return {
    x: state.snap ? Math.round(x / 32) * 32 : x,
    y: state.snap ? Math.round(y / 32) * 32 : y,
  };
}
canvas.addEventListener("pointerdown", (e) => {
  if (state.mode === "explode") return;
  canvas.focus({ preventScroll: true });
  const p = point(e);
  if (state.edit) {
    const o = hit(p.x, p.y);
    if (o) {
      state.selected = o.id;
      drag = {
        id: o.id,
        dx: p.x - o.x,
        dy: p.y - o.y,
        start: { x: o.x, y: o.y },
      };
      canvas.setPointerCapture(e.pointerId);
    } else {
      const q = placePosition(p.x, p.y);
      if (!inLand(q.x, q.y)) {
        message("소품은 큰 섬의 땅 위에 놓아주세요.");
        return;
      }
      const o = add(state.kind, q.x, q.y);
      state.selected = o.id;
      state.layers[kinds[o.kind].layer] = true;
      syncLayers();
      message(kinds[o.kind].label + "을 별도 소품으로 추가했어요.");
    }
    updateSelection();
    return;
  }
  if (!state.layers.cat) {
    message("고양이 레이어를 켜면 산책할 수 있어요.");
    return;
  }
  if (!inLand(p.x, p.y)) {
    message("바다로는 갈 수 없어요. 땅을 눌러주세요.");
    return;
  }
  setAuto(false);
  state.path = route(p.x, p.y);
  message(
    state.path.length
      ? "소품을 피해 목적지로 이동하고 있어요."
      : "이어진 이동 공간이 없어요.",
  );
});
canvas.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const p = point(e),
    q = placePosition(p.x - drag.dx, p.y - drag.dy),
    o = objects.find((o) => o.id === drag.id);
  if (o && inLand(q.x, q.y)) {
    o.x = q.x;
    o.y = q.y;
    updateSelection();
  }
});
function endDrag(e) {
  if (!drag) return;
  if (e.type === "pointercancel") {
    const o = objects.find((o) => o.id === drag.id);
    if (o) Object.assign(o, drag.start);
  }
  drag = null;
  repairNavigation();
  updateSelection();
  message("배치에 맞춰 샛길과 이동 범위를 다시 연결했어요.");
}
for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
  canvas.addEventListener(type, endDrag);
window.addEventListener("keydown", (e) => {
  if (
    ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(e.target.tagName) ||
    e.target.isContentEditable
  )
    return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (
    [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "w",
      "a",
      "s",
      "d",
    ].includes(k)
  ) {
    e.preventDefault();
    keys.add(k);
  }
  if (e.key === "Escape") setEdit(false);
});
window.addEventListener("keyup", (e) =>
  keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key),
);
window.addEventListener("blur", () => keys.clear());
document.addEventListener("visibilitychange", () => keys.clear());
document.querySelectorAll("[data-key]").forEach((b) => {
  b.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    keys.add(b.dataset.key);
  });
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
    b.addEventListener(event, () => keys.delete(b.dataset.key));
});
document
  .querySelectorAll("[data-mode]")
  .forEach((b) => (b.onclick = () => mode(b.dataset.mode)));
document
  .querySelectorAll("[data-stage]")
  .forEach((b) => (b.onclick = () => stage(b.dataset.stage)));
document.querySelectorAll("[data-layer]").forEach(
  (el) =>
    (el.onchange = () => {
      state.layers[el.dataset.layer] = el.checked;
      document
        .querySelectorAll("[data-stage]")
        .forEach((b) => b.classList.remove("active"));
      syncLayers();
    }),
);
$("#time").onchange = (e) => (state.time = e.target.value);
$("#tile-size").onchange = (e) => {
  state.size = +e.target.value;
  splitTiles();
};
$("#zoom").oninput = (e) => {
  state.zoom = +e.target.value;
  $("#zoom-value").textContent = state.zoom.toFixed(1) + "×";
};
for (const k of ["effects", "collision", "snap"])
  $("#" + k).onchange = (e) => (state[k] = e.target.checked);
$("#edit").onclick = () => setEdit(!state.edit);
$("#delete").onclick = () => {
  objects = objects.filter((o) => o.id !== state.selected);
  state.selected = null;
  repairNavigation();
  updateSelection();
  message("선택한 소품을 삭제했어요.");
};
$("#restore").onclick = () => {
  populate();
  state.selected = null;
  stage("village");
  updateSelection();
  message("처음 배치로 되돌렸어요.");
};
$("#auto").onclick = () => {
  const next = !state.auto;
  setEdit(false);
  mode("play");
  state.layers.cat = true;
  syncLayers();
  setAuto(next);
  canvas.focus();
};
$("#reset").onclick = () => {
  state.x = 820;
  state.y = 535;
  state.path = [];
  setAuto(false);
  repairNavigation();
  state.zoom = 1;
  $("#zoom").value = 1;
  $("#zoom-value").textContent = "1.0×";
  canvas.focus();
};
function mapData() {
  return {
    crossings,
    version: 4,
    prototype: true,
    width: W,
    height: H,
    tileSize: state.size,
    type: "terrain-roads-objects",
    roads: roadData(),
    time: state.time,
    animation: state.effects,
    layers: { ...state.layers },
    character: { x: state.x, y: state.y },
    tiles: tiles.map((t, i) => ({
      file: `tiles/${Math.floor(i / (W / state.size))}-${i % (W / state.size)}.png`,
      x: (i % (W / state.size)) * state.size,
      y: Math.floor(i / (W / state.size)) * state.size,
    })),
    objects: objects.map((o) => ({
      ...o,
      layer: kinds[o.kind].layer,
      asset: `sprites/${o.kind}.png`,
      anchor: "bottom-center",
    })),
    navigation: {
      cellSize: CELL,
      columns: COLS,
      rows: ROWS,
      walkable: nav,
      landPolygon: land,
    },
    notes:
      "지형은 원화 격자 분할. 밤은 렌더링 필터. 불꽃은 Canvas 효과. 충돌은 임시 영역.",
  };
}
function download(blob, name) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
$("#save").onclick = () =>
  download(
    new Blob([JSON.stringify(mapData(), null, 2)], {
      type: "application/json",
    }),
    "gachisup-world-v4.json",
  );
function crc32(bytes) {
  let c = 0xffffffff;
  for (const b of bytes) {
    c ^= b;
    for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (c ^ 0xffffffff) >>> 0;
}
function zip(entries) {
  const local = [],
    central = [];
  let offset = 0;
  for (const [name, data] of entries) {
    const n = new TextEncoder().encode(name),
      crc = crc32(data),
      h = new Uint8Array(30 + n.length),
      v = new DataView(h.buffer);
    v.setUint32(0, 0x04034b50, true);
    v.setUint16(4, 20, true);
    v.setUint32(14, crc, true);
    v.setUint32(18, data.length, true);
    v.setUint32(22, data.length, true);
    v.setUint16(26, n.length, true);
    h.set(n, 30);
    local.push(h, data);
    const c = new Uint8Array(46 + n.length),
      d = new DataView(c.buffer);
    d.setUint32(0, 0x02014b50, true);
    d.setUint16(4, 20, true);
    d.setUint16(6, 20, true);
    d.setUint32(16, crc, true);
    d.setUint32(20, data.length, true);
    d.setUint32(24, data.length, true);
    d.setUint16(28, n.length, true);
    d.setUint32(42, offset, true);
    c.set(n, 46);
    central.push(c);
    offset += h.length + data.length;
  }
  const end = new Uint8Array(22),
    v = new DataView(end.buffer);
  v.setUint32(0, 0x06054b50, true);
  v.setUint16(8, entries.length, true);
  v.setUint16(10, entries.length, true);
  v.setUint32(
    12,
    central.reduce((s, c) => s + c.length, 0),
    true,
  );
  v.setUint32(16, offset, true);
  return new Blob([...local, ...central, end], { type: "application/zip" });
}
const toBytes = async (c) =>
  new Uint8Array(await (await new Promise((r) => c.toBlob(r))).arrayBuffer());
$("#export").onclick = async () => {
  const b = $("#export");
  b.disabled = true;
  b.textContent = "지형과 소품 묶는 중…";
  try {
    const data = mapData(),
      entries = [];
    for (let i = 0; i < tiles.length; i++)
      entries.push([data.tiles[i].file, await toBytes(tiles[i])]);
    for (const [kind, c] of Object.entries(sprites))
      entries.push([`sprites/${kind}.png`, await toBytes(c)]);
    const dock = document.createElement("canvas");
    dock.width = dock.height = 1024;
    dock.getContext("2d").drawImage(imgs["dock-back"], 0, 0);
    dock.getContext("2d").drawImage(imgs["dock-front"], 0, 0);
    entries.push(["sprites/dock.png", await toBytes(dock)]);
    entries.push(["roads/overlay.png", await toBytes(roadCanvas)]);
    entries.push([
      "map.json",
      new TextEncoder().encode(JSON.stringify(data, null, 2)),
    ]);
    download(zip(entries), `gachisup-world-v4-${state.size}.zip`);
  } finally {
    b.disabled = false;
    b.textContent = "타일 + 소품 + 배치 ZIP ↓";
  }
};
async function init() {
  const data = JSON.parse($("#asset-data").textContent);
  await Promise.all(
    Object.entries(data).map(
      ([key, src]) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            imgs[key] = img;
            resolve();
          };
          img.onerror = reject;
          img.src = src;
        }),
    ),
  );
  for (const [kind, k] of Object.entries(kinds)) {
    sprites[kind] =
      k.cell !== undefined
        ? trimmed(
            imgs.atlas,
            (k.cell % 3) * 512,
            Math.floor(k.cell / 3) * 512,
            512,
            512,
          )
        : trimmed(imgs[kind]);
  }
  sprites.bridge = trimmed(imgs.bridge);
  for (const kind of [
    "grass",
    "flowers",
    "bush",
    "tree",
    "pine",
    "fire",
    "hall",
    "library",
  ]) {
    const b = document.createElement("button");
    b.dataset.kind = kind;
    b.title = kinds[kind].label;
    const img = document.createElement("img");
    img.src = sprites[kind].toDataURL();
    img.alt = "";
    b.append(img, document.createTextNode(kinds[kind].label));
    b.onclick = () => {
      state.kind = kind;
      state.selected = null;
      setEdit(true);
      document
        .querySelectorAll("[data-kind]")
        .forEach((el) => el.classList.toggle("active", el === b));
      updateSelection();
    };
    $("#palette").append(b);
  }
  splitTiles();
  populate();
  $("#loading").remove();
  window.prototype = {
    state,
    objects: () => objects,
    tiles,
    sprites,
    imgs,
    walkable,
    route,
    mapData,
    stage,
    mode,
    setEdit,
    add,
    repairNavigation,
    crossings,
    roadData,
    roadDistance,
    roadCanvas,
  };
  requestAnimationFrame(tick);
}
init().catch((e) => {
  $("#loading").textContent =
    "에셋을 불러오지 못했어요. 파일을 다시 열어주세요.";
  console.error(e);
});
