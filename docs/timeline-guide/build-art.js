/*
  把 output/ 里的分段水墨图拼成首页时间轴长卷。

  用法：先在任意目录 npm i sharp，再带上 NODE_PATH 运行：
    NODE_PATH=<装了 sharp 的 node_modules> node docs/timeline-guide/build-art.js

  做的事：
  1. 去掉每段的纸底，转成透明，这样各段纸色不一致也不会露接缝；
  2. 把必须保持原样的照片贴进第 5 段预留的空白；
  3. 按 SEGMENTS 顺序拼接。某段 file 为 null 时，按 NODE_GAP 留出文字位；
  4. 输出 site/assets/images/timeline/timeline-design.webp，并打印各节点的 --x。

  换某一段：替换 output/ 里的图，重跑，再把打印出的 --x 写回 site/index.html。
*/
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "../..");
const OUT = path.join(ROOT, "site/assets/images/timeline/timeline-design.webp");
const H = 1024;             // 各段源图高度
const GAP = 60;             // 段与段之间的留白（源图像素）
const NODE_GAP = 340;       // 没有图的节点，每个占的宽度（源图像素）
const OUTPUT_HEIGHT = 880;  // 图层高 440，按 2 倍图输出
const CUT_Y = 868;          // 这条线以下留给时间轴，一律不留笔墨
const FADE = 56;            // 在 CUT_Y 之上多少像素内渐隐
const SIDE_FADE = 40;       // 左右边缘渐隐，免得贴边的笔墨被硬切

const BOOK_AREA = [[1128, 712], [1316, 746], [1316, 788], [1450, 788], [1450, 1000], [980, 1000], [980, 905], [1040, 870]];
// nodes：节点在该段源图里的横坐标；file 为 null 的段没有图，只留文字位
const SEGMENTS = [
  { file: "seg1.webp", nodes: [["河姆渡榫卯", 180], ["应县木塔", 770], ["皮影戏", 1280]] },
  { file: "seg2.webp", nodes: [["黄龙溪火龙灯舞", 330], ["潮州铁枝木偶戏", 840], ["景德镇二元配方", 1310]] },
  { file: "seg3.webp", nodes: [["泸州油纸伞", 370], ["恩施玉露", 830], ["普宁英歌", 1190]] },
  { file: "seg4.webp", nodes: [["青田鱼灯舞", 250], ["京剧", 945], ["荆门矮子馅饼", 1195]] },
  {
    file: "seg5.webp",
    nodes: [["苏绣与沈寿", 290], ["蔡林记热干面", 790], ["首批国家级名录", 1173]],
    paste: [
      { file: "paste/B-shen-shou-oval.png", left: 72, top: 52, height: 340 },
      { file: "paste/A-jesus-embroidery-oval.png", left: 306, top: 130, height: 250 },
      { scroll: "output/seg5-2006.webp", left: 1086, top: 302, height: 280, fade: 0.78 }
    ],
    // 这块是早先画在第 5 段的线装书，现在第 6 段自带，这里要清掉
    lift: BOOK_AREA
  },
  {
    file: "seg6.webp",
    nodes: [["木结构营造入遗", 340], ["《非遗法》施行", 720], ["制茶技艺入遗", 1240]],
    keepBottom: true,   // 线装书压得低，不做底部渐隐，改成整段上移
    shiftUp: 18,
    title: { text: "非遗法", tl: [609, 615], tr: [648, 624], bl: [546, 720] }
  }
];

function median(values) {
  values.sort((a, b) => a - b);
  return values[values.length >> 1];
}

// 纸色取画面底部一带的中位数
function paperOf(data, w, h) {
  const r = [], g = [], b = [];
  for (let y = h - 60; y < h - 10; y += 3) {
    for (let x = 0; x < w; x += 7) {
      const i = (y * w + x) * 4;
      r.push(data[i]); g.push(data[i + 1]); b.push(data[i + 2]);
    }
  }
  return [median(r), median(g), median(b)];
}

// 把纸色还原成透明：a 取三个通道里比纸暗得最多的比例，再反算前景色
function removePaper(data, w, h, keepBottom) {
  const paper = paperOf(data, w, h);
  const FLOOR = 0.03;
  for (let y = 0; y < h; y += 1) {
    const edge = keepBottom ? 1 : Math.min(1, Math.max(0, (CUT_Y - y) / FADE));
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 4;
      const side = Math.min(1, x / SIDE_FADE, (w - 1 - x) / SIDE_FADE);
      let a = 0;
      for (let c = 0; c < 3; c += 1) a = Math.max(a, (paper[c] - data[i + c]) / paper[c]);
      a = Math.max(0, (a - FLOOR) / (1 - FLOOR));
      if (a <= 0 || edge <= 0) { data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 0; continue; }
      for (let c = 0; c < 3; c += 1) {
        const v = (data[i + c] - paper[c] * (1 - a)) / a;
        data[i + c] = Math.max(0, Math.min(255, Math.round(v)));
      }
      data[i + 3] = Math.round(a * edge * side * 255);
    }
  }
  return paper;
}

function inkBounds(data, w, h) {
  let min = w, max = 0;
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      if (data[(y * w + x) * 4 + 3] > 26) { min = Math.min(min, x); max = Math.max(max, x); }
    }
  }
  return [Math.max(0, min - 8), Math.min(w, max + 8)];
}

function inside(x, y, polygon) {
  let hit = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

function labelSvg(w, h, title) {
  const { text, tl, tr, bl } = title;
  // 题签本地坐标 100×260，映射到透视后的题签
  const m = [(tr[0] - tl[0]) / 100, (tr[1] - tl[1]) / 100, (bl[0] - tl[0]) / 260, (bl[1] - tl[1]) / 260, tl[0], tl[1]];
  const chars = [...text].map((c, i) => `<text x="50" y="${82 + i * 76}" text-anchor="middle">${c}</text>`).join("");
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <g transform="matrix(${m.join(" ")})" font-family="KaiTi, STKaiti, SimSun, serif" font-size="66" font-weight="700" fill="#3a332b">${chars}</g></svg>`);
}

// 2006 节点的挂轴：连轴面一起去纸底，再整体调淡，让它融进周围的留白；书名写到题签上
async function makeScroll(item) {
  const { data, info } = await sharp(path.join(__dirname, item.scroll))
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  removePaper(data, w, h, true);
  for (let i = 3; i < data.length; i += 4) data[i] = Math.round(data[i] * item.fade);
  const title = [..."首批国家级名录"].map((c, i) =>
    `<text x="${512 + (i - 3) * 90}" y="388" text-anchor="middle">${c}</text>`).join("");
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <g font-family="KaiTi, STKaiti, SimSun, serif" font-size="82" font-weight="700" fill="#3a332b" fill-opacity="${item.fade}">${title}</g></svg>`);
  const box = { left: 70, top: 45, width: 885, height: 1425 };
  const png = await sharp(data, { raw: info }).modulate({ saturation: 0.8 }).composite([{ input: svg }]).png().toBuffer();
  const input = await sharp(png).extract(box).resize({ height: item.height, kernel: "lanczos3" }).png().toBuffer();
  return { input, left: item.left, top: item.top };
}

async function pieceOf(item) {
  if (item.scroll) return makeScroll(item);
  let img = sharp(path.join(__dirname, item.file)).resize({ height: item.height });
  if (item.border) {
    img = sharp(await img.toBuffer()).extend({
      top: 2, bottom: 2, left: 2, right: 2, background: { r: 104, g: 92, b: 74, alpha: 0.7 }
    });
  }
  return { input: await img.png().toBuffer(), left: item.left, top: item.top };
}

async function loadSegment(seg) {
  const { data, info } = await sharp(path.join(__dirname, "output", seg.file))
    .resize({ height: H }).ensureAlpha().raw().toBuffer({ resolveWithFile: false, resolveWithObject: true });
  const paper = removePaper(data, info.width, info.height, seg.keepBottom);
  if (seg.lift) {
    for (let y = 0; y < info.height; y += 1) {
      for (let x = 0; x < info.width; x += 1) {
        if (inside(x, y, seg.lift)) data[(y * info.width + x) * 4 + 3] = 0;
      }
    }
  }
  const [x0, x1] = inkBounds(data, info.width, info.height);
  let buffer = await sharp(data, { raw: info }).png().toBuffer();
  if (seg.paste) {
    const pieces = await Promise.all(seg.paste.map(pieceOf));
    buffer = await sharp(buffer).composite(pieces).png().toBuffer();
  }
  if (seg.title) {
    buffer = await sharp(buffer).composite([{ input: labelSvg(info.width, info.height, seg.title) }]).png().toBuffer();
  }
  const up = seg.shiftUp || 0;
  buffer = await sharp(buffer).extract({ left: x0, top: up, width: x1 - x0, height: H - up })
    .extend({ bottom: up, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  console.log(seg.file, "纸色", paper.join(","), "主体", x0, "-", x1);
  return { buffer, x0, width: x1 - x0 };
}

(async function () {
  const layers = [];
  const nodes = [];
  let x = 40;
  for (const seg of SEGMENTS) {
    if (seg.file) {
      const piece = await loadSegment(seg);
      layers.push({ input: piece.buffer, left: x, top: 0 });
      seg.nodes.forEach(([name, at]) => nodes.push([name, x + at - piece.x0]));
      x += piece.width + GAP;
    } else {
      seg.nodes.forEach(([name], i) => nodes.push([name, x + NODE_GAP * (i + 0.5)]));
      x += NODE_GAP * seg.nodes.length + GAP;
    }
  }
  const width = x + 40;
  const scale = OUTPUT_HEIGHT / H;
  await sharp({ create: { width, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(layers).png().toBuffer()
    .then((png) => sharp(png)
      .resize({ width: Math.round(width * scale), height: OUTPUT_HEIGHT })
      .webp({ quality: 82, alphaQuality: 90, effort: 5 })
      .toFile(OUT));
  console.log("长卷", Math.round(width * scale), "x", OUTPUT_HEIGHT, (fs.statSync(OUT).size / 1024).toFixed(0) + "KB");
  nodes.forEach(([name, at]) => console.log(name.padEnd(10, "　"), (at / width * 100).toFixed(2) + "%"));
  fs.writeFileSync(path.join(__dirname, "output/nodes.json"), JSON.stringify(nodes.map(([name, at]) => [name, +(at / width * 100).toFixed(2)])));
}());
