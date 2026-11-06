/*
  把 output/ 里的分段水墨图拼成首页时间轴长卷。

  用法：先在任意目录 npm i sharp，再带上 NODE_PATH 运行：
    NODE_PATH=<装了 sharp 的 node_modules> node docs/timeline-guide/build-art.js

  做的事：
  1. 去掉每段的纸底，转成透明，这样各段纸色不一致也不会露接缝；
  2. 把必须保持原样的照片贴进第 5 段预留的空白；
  3. 按 SEGMENTS 顺序拼接。某段没有图时，按 GAP 留出文字位；
  4. 输出 site/assets/images/timeline/timeline-design.webp，并打印各节点的 --x。

  补上第 6 段：把图存成 output/seg6.webp，
  把下面对应的 file 从 null 改成文件名，重跑，再把打印出的 --x 写回 site/index.html。
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
const BOOK_SCALE = 1.6;
// 题签四角在第 5 段源图里的位置（左上、右上、左下），书名按这个斜度写上去
const LABEL = { tl: [1150, 737], tr: [1197, 748], bl: [1095, 845] };

// nodes：节点在该段源图里的横坐标；file 为 null 的段没有图，只留文字位
const SEGMENTS = [
  { file: "seg1.webp", nodes: [["河姆渡榫卯", 180], ["应县木塔", 770], ["皮影戏", 1280]] },
  { file: "seg2.webp", nodes: [["黄龙溪火龙灯舞", 330], ["潮州铁枝木偶戏", 840], ["景德镇二元配方", 1310]] },
  { file: "seg3.webp", nodes: [["泸州油纸伞", 370], ["恩施玉露", 830], ["普宁英歌", 1190]] },
  { file: "seg4.webp", nodes: [["青田鱼灯舞", 250], ["京剧", 945], ["荆门矮子馅饼", 1195]] },
  {
    file: "seg5.webp",
    nodes: [["苏绣与沈寿", 290], ["蔡林记热干面", 790], ["首批国家级名录", 1082]],
    paste: [
      { file: "paste/B-shen-shou-oval.png", left: 72, top: 52, height: 340 },
      { file: "paste/A-jesus-embroidery-oval.png", left: 306, top: 130, height: 250 },
      { scroll: "output/seg5-2006.webp", left: 962, top: 28, height: 390 }
    ],
    // 这块画的是《非遗法》线装书：从第 5 段取走，放到第 6 段
    lift: BOOK_AREA
  },
  {
    file: null,
    nodes: [["木结构营造入遗"], ["《非遗法》施行"], ["制茶技艺入遗"]],
    book: { nodeWidth: 780, bottom: 858 }
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

function bookTitleSvg(width, height, originX, originY) {
  const p = ([x, y]) => [(x - originX) * BOOK_SCALE, (y - originY) * BOOK_SCALE];
  const tl = p(LABEL.tl), tr = p(LABEL.tr), bl = p(LABEL.bl);
  // 题签本地坐标 100×260，映射到透视后的题签
  const m = [(tr[0] - tl[0]) / 100, (tr[1] - tl[1]) / 100, (bl[0] - tl[0]) / 260, (bl[1] - tl[1]) / 260, tl[0], tl[1]];
  const column = (text, x, top) => [...text].map((c, i) =>
    `<text x="${x}" y="${top + i * 30}" text-anchor="middle">${c}</text>`).join("");
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <g transform="matrix(${m.join(" ")})" font-family="KaiTi, STKaiti, SimSun, serif" font-size="27" font-weight="700" fill="#3a332b">
      ${column("中华人民共和国", 70, 42)}${column("非物质文化遗产法", 30, 27)}
    </g></svg>`);
}

async function makeBook(raw, info) {
  const { width: w, height: h } = info;
  const data = Buffer.from(raw);
  removePaper(data, w, h, true);
  const xs = BOOK_AREA.map(p => p[0]), ys = BOOK_AREA.map(p => p[1]);
  const left = Math.min(...xs), top = Math.min(...ys);
  const cropW = Math.max(...xs) - left, cropH = Math.max(...ys) - top;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (!inside(x, y, BOOK_AREA)) data[(y * w + x) * 4 + 3] = 0;
    }
  }
  const width = Math.round(cropW * BOOK_SCALE), height = Math.round(cropH * BOOK_SCALE);
  const png = await sharp(data, { raw: info }).extract({ left, top, width: cropW, height: cropH })
    .resize({ width, height, kernel: "lanczos3" }).png().toBuffer();
  return {
    input: await sharp(png).composite([{ input: bookTitleSvg(width, height, left, top) }]).png().toBuffer(),
    width, height
  };
}

// 2006 节点的挂轴：四周去纸底，轴面保持不透明，免得透出后面的街景；再把书名写到题签上
async function makeScroll(item) {
  const { data, info } = await sharp(path.join(__dirname, item.scroll))
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const original = Buffer.from(data);
  removePaper(data, w, h, true);
  const SILK = { left: 125, right: 897, top: 205, bottom: 1420 };
  for (let y = SILK.top; y < SILK.bottom; y += 1) {
    for (let x = SILK.left; x < SILK.right; x += 1) {
      const i = (y * w + x) * 4;
      data[i] = original[i]; data[i + 1] = original[i + 1]; data[i + 2] = original[i + 2]; data[i + 3] = 255;
    }
  }
  const title = [..."首批国家级名录"].map((c, i) =>
    `<text x="${512 + (i - 3) * 90}" y="388" text-anchor="middle">${c}</text>`).join("");
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <g font-family="KaiTi, STKaiti, SimSun, serif" font-size="82" font-weight="700" fill="#3a332b">${title}</g></svg>`);
  const box = { left: 70, top: 45, width: 885, height: 1425 };
  const png = await sharp(data, { raw: info }).composite([{ input: svg }]).png().toBuffer();
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

let book = null;

async function loadSegment(seg) {
  const { data, info } = await sharp(path.join(__dirname, "output", seg.file))
    .resize({ height: H }).ensureAlpha().raw().toBuffer({ resolveWithFile: false, resolveWithObject: true });
  const original = seg.lift ? Buffer.from(data) : null;
  const paper = removePaper(data, info.width, info.height);
  if (seg.lift) {
    for (let y = 0; y < info.height; y += 1) {
      for (let x = 0; x < info.width; x += 1) {
        if (inside(x, y, seg.lift)) data[(y * info.width + x) * 4 + 3] = 0;
      }
    }
    book = await makeBook(original, info);
  }
  const [x0, x1] = inkBounds(data, info.width, info.height);
  let buffer = await sharp(data, { raw: info }).png().toBuffer();
  if (seg.paste) {
    const pieces = await Promise.all(seg.paste.map(pieceOf));
    buffer = await sharp(buffer).composite(pieces).png().toBuffer();
  }
  buffer = await sharp(buffer).extract({ left: x0, top: 0, width: x1 - x0, height: H }).png().toBuffer();
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
    } else if (seg.book && book) {
      // 2009、2011、2022：中间那格放书，两边仍是文字位
      const middle = seg.book.nodeWidth;
      nodes.push([seg.nodes[0][0], x + NODE_GAP / 2]);
      nodes.push([seg.nodes[1][0], x + NODE_GAP + middle / 2]);
      nodes.push([seg.nodes[2][0], x + NODE_GAP + middle + NODE_GAP / 2]);
      layers.push({
        input: book.input,
        left: Math.round(x + NODE_GAP + (middle - book.width) / 2),
        top: seg.book.bottom - book.height
      });
      x += NODE_GAP * 2 + middle + GAP;
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
