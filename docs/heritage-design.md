# 「非遗辑录」页（heritage.html）视觉设计说明 · v3

> 实现者（GPT / 前端协作者）请先读完这份文档。参考图：
> - `docs/heritage-mockup.png`：**构图示意图**。虚线框标的是剪影的位置和大小，山水底图只是占位。最终效果以 AI 生成的水墨素材为准。
> - `docs/heritage-ref-class.jpg`：卡片风格的原始参考。左右对比的是图下方那条「CLASS 仕」古画拼贴横幅：中间一幅山水画心，大人物从右侧破框而出，一排小剪影沿画心底边站立。
>
> v3 相对 v2 的改动：①左侧轮播改为**满铺**，去掉下方说明栏；②右侧四张卡改为**古画拼贴**风格；③「寻味山河」暂时只放山水底图。色彩规则沿用 v2，不变。

---

## 0. 项目约定（同 v2）

- 只改 `site/heritage.html` 的 `<main>`。样式写在 `assets/css/heritage.css`，脚本写在 `assets/js/heritage.js`。
- 不用组件库和轮播库，也不加载任何 CDN 资源。
- 字体只有一个例外：大类标题用本地毛笔字体文件，见第 4 节。
- 必须支持 `prefers-reduced-motion`。

---

## 1. 整体布局（不变）

```
┌───────────────┬──────────┬──────────┐
│               │ 壹 天工开物 │ 贰 瓦舍勾栏 │
│  轮播（满铺）    ├──────────┼──────────┤
│               │ 叁 四时有节 │ 肆 寻味山河 │
└───────────────┴──────────┴──────────┘
```

`grid-template-columns: 1.35fr 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 20px;`，网格高 `clamp(600px, 76vh, 720px)`。

页头（眉题、大标题「非遗辑录」、右侧引言）和下方色谱条保持 v2 的写法。

---

## 2. 色彩规则（沿用 v2，并补充水墨画里的用法）

| 序 | 大类 | 颜料 | 变量 | 色值 |
|---|---|---|---|---|
| 壹 | 天工开物 | 石青 | `--h-c1` | `#24478C` |
| 贰 | 瓦舍勾栏 | 朱砂 | `--h-c2` | `#A8352A` |
| 叁 | 四时有节 | 石绿 | `--h-c3` | `#2F7A68` |
| 肆 | 寻味山河 | 赭黄 | `--h-c4` | `#8C6421` |

中性色：米绢白 `#F2EBDD`（页面底色）、**绫裱灰 `#E4E2D6`（卡片裱边，新增）**、素绢 `#FBF7EE`、赭墨 `#2B1D16`、淡赭墨 `#6E5B4C`。

规则：
1. 每张卡**只用自己的 `--c`**，用在三个地方：印章底色、激活描边、山水底图的淡染色调。其余全部是墨色和中性色。
2. 山水底图**以墨为主，只染一种颜色**，也就是本卡的颜料色，低饱和、薄薄一层，参照传统的「浅绛」「青绿」染法。这样四张画各有冷暖，但不会花。
3. 剪影人物本身是古画设色，会有一些杂色（衣服、皮肤），这没关系；但整体饱和度要压低（见 6.3 的统一滤镜）。剪影上**不要出现大面积高纯度的其他颜料色**。
4. 左侧轮播只用 `--active`（当前激活大类的颜色）。

---

## 3. 左侧轮播（v3 改为满铺）

- 图片**填满整个矩形**：`object-fit: cover`，圆角 6px，**没有内边距、外框和装饰**。
- **去掉下方整个说明栏**：没有标题、署名、计数、印章，也没有任何文字。
- 只保留两样很轻的元素：
  1. **进度条**：距底 20px、左右各缩进 24px，每张图一段，每段 2px 高、段间隔 6px，用素绢色 35% 透明度；正在播放的段从左往右填满成实色素绢色。
  2. **激活色底边**：图片最底部一条 3px 的 `--active` 色条，切换大类时跟着变色。
- 左右箭头默认隐藏，鼠标移到轮播区域时淡入（30px 圆形，背景是 `rgba(43,29,22,.35)`，素绢色箭头）。
- 底部加一层很淡的渐变（`linear-gradient(transparent 75%, rgba(0,0,0,.28))`），保证白色进度条在亮色照片上也看得清。
- 摄影署名不在画面上显示，统一写进页脚或 `docs/sources.md`，每张图的 `alt` 写完整。
- **播放逻辑与 v2 第 5.2 节完全相同**：hover 卡片后切换大类，图片左滑、停 2600ms，循环播放；鼠标悬停在轮播上时暂停；减少动态偏好下不自动播放。

---

## 4. 右侧卡片：古画拼贴

### 4.1 分层结构（从底到顶）

每张卡固定 `aspect-ratio: 380 / 340`，所有位置都用百分比，这样缩放后构图不变。

| 层 | 内容 | 位置（相对卡片） |
|---|---|---|
| ① 裱边 | 绫裱灰 `#E4E2D6`，叠一层细麻布纹噪点（SVG `feTurbulence`，16% 不透明） | 整张卡 |
| ② 画心 | 水墨山水底图 `bg.webp`，`object-fit: cover`；**四边不规则**（见 4.2） | left 4.7%，right 4.7%，top 10%，bottom 17% |
| ③ 标题组 | 竖排毛笔大字 + 本色小印章 + 竖排小字涵盖范围 | 画心左上，left 9.5%，top 15% |
| ④ 小剪影 | 3–4 个去底 PNG 人物，**脚站在画心底边上，并压出画心约 3–4%**，落到裱边上 | 底边 bottom 7.6%，横向从 left 7% 排到 left 67%，人物之间可以略微重叠 |
| ⑤ 大人物 | 一个去底 PNG，**从画心右侧破框而出**，头部和饰物高出画心上沿，身体压过画心右边线 | right 1.5%，bottom 2.4%，height 88–93%，width 自适应 |

画心底部约 18% 是**留白的地面**（底图里这一段是空的浅色，见第 7 节的生图要求），小剪影就站在这里。这是从参考图里学来的：人物站在画的「地平线」上。

层级：大人物 z-index 最高。小剪影里最右边那个可以被大人物的衣摆盖住一点，这样更有纵深。

### 4.2 画心的不规则边

画心四边不要用直线，要像撕过、或者墨洇过的纸边。两种做法任选：
- **CSS**：`clip-path: polygon(...)`，每条边取 5–7 个点，每个点向内随机偏移 0.4%–1%（示意图里就是这么做的）。
- **SVG mask**：一张手绘边缘的黑白 PNG 作为 `mask-image`，效果更自然，推荐。

四张卡的边缘形状**各不相同**（用不同的点或不同的 mask），避免一眼看出是复制的。

### 4.3 标题组

- **大类名**：竖排（`writing-mode: vertical-rl`），**毛笔行楷**，字号为卡宽的 8% 左右（`clamp(24px, 2.2vw, 32px)`），颜色赭墨，字距 .18em。
  - 字体：用开源字体 **马善政毛笔楷书（Ma Shan Zheng）**或**志莽行书（Zhi Mang Xing）**，两者都是 SIL OFL 许可。用 `pyftsubset` 只保留本页用到的字，转成 woff2，放在 `assets/fonts/`，通过 `@font-face` 本地加载，并把许可证文件一起放进去。回退字体用 `--serif`。
- **印章**：22×22px，`--c` 底，素绢色的壹 / 贰 / 叁 / 肆，圆角 2px，放在大类名右侧顶端。可以略微旋转 −3°，更像手钤的印。
- **涵盖范围**：竖排 10px，字距 .3em，淡赭墨，放在印章下方。
- 卡片上不再放引语、代表项目列表和「入辑」按钮，画面本身就是入口。这些文字放进卡片链接的 `aria-label` 和 `title` 里。

### 4.4 交互

四张卡规则统一：

| 状态 | 效果 |
|---|---|
| 默认 | 静态 |
| hover / focus-visible | ① 小剪影依次向上轻跳 4px 再落回，间隔 60ms，像一队人迈步；② 大人物向左上移 6px，并放大到 1.03；③ 画心底图在 6s 内慢慢放大到 1.04；④ 同时触发左侧轮播切到这一类 |
| 激活（左侧正在播放这一类） | 卡片加 2px `--c` 内描边（`box-shadow: inset 0 0 0 2px var(--c)`），并保持到切换为其他类 |
| 减少动态偏好 | 只保留激活描边，不做位移和缩放 |

**取消 v2 的「颜料铺满整卡」效果**，因为它会把画盖住。

整张卡是一个 `<a>`，点击进入分类页。

---

## 5. 四张卡的内容与构图

### 壹 天工开物 · 石青 → `category/objects.html`

- **底图**：远山层叠，山间几缕窑烟升起，近处一湾江水（景德镇昌江）。墨色为主，山头薄染石青。左上留出空白的天空放标题，底部留白做地面。
- **大人物（破框）**：老窑工，双手捧一只青花梅瓶，身穿粗布短褐，围裙上沾着泥。
- **小剪影**（从左到右）：
  1. 绣娘坐在绣绷前低头走针（苏绣）
  2. 女子撑一把打开的油纸伞，侧身行走（油纸伞）
  3. 木匠肩扛一根木梁，腰挂墨斗（木构营造）
  4. 匠人俯身在陶轮前拉坯（景德镇制瓷）

### 贰 瓦舍勾栏 · 朱砂 → `category/opera.html`

- **底图**：宋代瓦舍勾栏的屋檐和戏棚剪影，檐下挂几盏红灯笼，暮色。墨色为主，天色薄染朱砂。
- **大人物（破框）**：京剧武将（净角或武生），勾脸，身穿大靠，**背后的靠旗高高伸出画框**，一手持枪。
- **小剪影**：
  1. 皮影艺人坐在一方发光的影窗后，窗上映着两个皮影人（皮影戏）
  2. 艺人手提线板，下面吊着一个木偶（木偶戏）
  3. 醒狮，两人一前一后披着狮皮，狮头上扬（狮舞）
  4. 小个子的锣鼓乐师（补足画面节奏，可省略）

### 叁 四时有节 · 石绿 → `category/festival.html`

- **底图**：远山加一片开阔的江海水面，水面用古画的鱼鳞水纹线描画出，远处一叶帆船。墨色为主，山水薄染石绿。
- **大人物（破框）**：苗族盛装女子，**头戴高耸的银角**，胸前挂满银饰，百褶裙。银角从画心上沿伸出去。
- **小剪影**：
  1. 数人合抬一艘小王船（送王船）
  2. 众人肩扛台阁，台上立着扮戏的孩童（罗坊走古事）
  3. 水族骑手策马奔跑（水族端节赛马）
  4. 蚕娘双手捧一只蚕匾（双庙渚蚕花水会）

### 肆 寻味山河 · 赭黄 → `category/food.html`

- **底图**：浅绛山水，秋天的田野，田垄起伏，远处有村舍炊烟。墨色为主，薄染赭黄。
- **暂时不放任何剪影**，只有底图和标题组。等资料补齐后，按同样的结构补大人物和小剪影。
- 页面上**不要出现「待补」字样**。

---

## 6. 「不要太精致」的落地要求

参考图之所以好看，是因为它是**旧古画拼起来的**：线条松，颜色旧，纸上有颗粒。为了不让页面像精修的插画或游戏立绘，要做到以下几点。

### 6.1 生图时

- 风格锁定在**宋元人物画、写意水墨**：线条有干笔和飞白，设色淡而不匀，局部可以留白、不画满。
- 每张图都要带**旧绢底纹和轻微褪色**。
- 明确排除：3D 质感、照片写实、动漫、商业插画、矢量平涂、高光、锐利的数码线条、高饱和。

### 6.2 抠图时

- **剪影边缘不能有白边**。抠完后把边缘向内收缩 1–2px，再羽化 0.5px。之前的反馈里提过这一点，要逐张检查。
- 不加描边，不加贴纸式的白色外框。
- 导出透明底 PNG，最长边 900px 以内，压缩后每张尽量不超过 250KB。

### 6.3 在页面里统一质感

AI 生成的素材风格难免有出入，用 CSS 把它们拉回同一种气质：
- 所有剪影和底图统一加 `filter: saturate(.82) contrast(.96) sepia(.08);`
- 每张卡最上面再叠一层同一张绢纹噪点（`mix-blend-mode: multiply`，8% 不透明，`pointer-events: none`），让人物和底图看起来像印在同一张纸上。
- 剪影加一个很轻的投影：`drop-shadow(0 3px 4px rgba(43,29,22,.18))`。**不要加大投影**，参考图里的人物几乎没有投影。

---

## 7. AI 生图提示词

### 7.1 通用风格后缀（每条提示词末尾都加上）

```
Chinese Song dynasty ink wash painting, loose expressive brushwork, dry brush strokes with flying-white texture, pale mineral pigment wash, aged silk texture, slightly faded and worn, hand-painted imperfection, muted colors, minimal detail
```

### 7.2 负面提示词（工具支持的话就加）

```
3d, photorealistic, glossy, anime, cartoon, vector, clean digital lines, high saturation, neon, white outline, sticker border, heavy shadow, text, watermark, signature, frame
```

### 7.3 剪影（统一加上这一段，方便抠图）

```
single full-body figure, feet visible, three-quarter view, isolated on plain flat pale grey background, no ground, no scenery
```

> 背景用浅灰而不是纯白，抠图后边缘残留的颜色会更接近裱边色，不容易出白边。

| 文件 | 提示词主体 |
|---|---|
| `tiangong/hero.png` | an old kiln worker holding a blue-and-white porcelain vase with both hands, coarse short robe, clay-stained apron, weathered face, standing |
| `tiangong/fig-1.png` | a Suzhou embroidery woman sitting at a wooden embroidery frame, head lowered, stitching |
| `tiangong/fig-2.png` | a woman walking sideways holding an open oil-paper umbrella |
| `tiangong/fig-3.png` | a carpenter carrying a long wooden beam on his shoulder, ink line marker at his waist |
| `tiangong/fig-4.png` | a potter bending over a pottery wheel, shaping a clay vase |
| `washe/hero.png` | Peking opera general in full armor costume with four tall flags on his back, painted face, holding a spear, dramatic pose |
| `washe/fig-1.png` | a shadow puppet performer sitting behind a small glowing paper screen with two shadow puppets on it |
| `washe/fig-2.png` | a puppeteer standing, holding a marionette control bar, a string puppet hanging below |
| `washe/fig-3.png` | a southern Chinese lion dance, two performers under one lion costume, lion head raised |
| `washe/fig-4.png` | a small figure of a gong and drum musician |
| `sishi/hero.png` | a Miao woman in festival dress, tall silver horn headdress, layers of silver necklaces, pleated skirt, standing |
| `sishi/fig-1.png` | several villagers carrying a small decorated wooden royal boat on poles |
| `sishi/fig-2.png` | villagers carrying a wooden platform on their shoulders, a child in opera costume standing on top |
| `sishi/fig-3.png` | a Shui ethnic rider galloping on a horse |
| `sishi/fig-4.png` | a silkworm girl holding a round bamboo silkworm tray with both hands |

### 7.4 山水底图

所有底图统一加这一段：

```
wide landscape, empty pale sky in the upper left, the bottom fifth left as blank plain pale ground, no people, no text, 7:5 aspect ratio
```

| 文件 | 提示词主体 |
|---|---|
| `tiangong/bg.webp` | layered distant mountains, thin smoke rising from kilns among hills, a river in the foreground, ink with light azurite blue wash |
| `washe/bg.webp` | silhouettes of Song dynasty theatre pavilion roofs and eaves at dusk, a few red lanterns, ink with light cinnabar wash |
| `sishi/bg.webp` | distant mountains over a wide river with fish-scale wave line pattern, one sailing boat far away, ink with light malachite green wash |
| `xunwei/bg.webp` | autumn fields with rolling ridges, a small village with cooking smoke far away, ink with light ochre wash, qianjiang style |

底图导出 1400×1000，存成 webp，质量 75。

### 7.5 文件放置

```
site/assets/images/heritage/
├── tiangong/  bg.webp  hero.png  fig-1.png … fig-4.png
├── washe/     bg.webp  hero.png  fig-1.png … fig-4.png
├── sishi/     bg.webp  hero.png  fig-1.png … fig-4.png
└── xunwei/    bg.webp
```

素材还没生成好时，可以先用色块和占位框把页面搭起来，示意图就是这样做的。

---

## 8. 响应式

| 宽度 | 布局 |
|---|---|
| ≥ 1100px | 如第 1 节 |
| 700–1099px | 轮播占满一行（高 460px），下面 2×2 卡片，卡片保持 380:340 的比例 |
| < 700px | 轮播在上（高 360px），卡片单列，宽度 100%，比例不变。小剪影最多显示 3 个，第 4 个用 `display: none` 隐藏，避免拥挤 |

---

## 9. 无障碍

- 卡片 `<a>` 加 `aria-label`，例如「天工开物：传统手工艺，含景德镇制瓷、苏绣、油纸伞、木构营造」。
- 剪影、底图、印章、噪点层都是装饰：`alt=""` 加 `aria-hidden="true"`。
- 大类名必须是真实文字（`<h2>`），不能做成图片。
- 轮播的每张图都要有具体的 `alt`。

---

## 10. 验收清单

- [ ] 左侧轮播满铺整个矩形，上面没有任何文字
- [ ] 每张卡只用自己的颜色；四张卡的激活规则相同
- [ ] 大人物明显高出画心上沿；小剪影的脚压在画心底边上，跨到裱边
- [ ] 画心四边是不规则的，并且四张各不相同
- [ ] 剪影没有白边，整体看起来像旧画，不像精修插画
- [ ] 寻味山河只有底图和标题，看不到「待补」
- [ ] 在 1440 / 1024 / 390 三个宽度下构图不变形
- [ ] 开启减少动态偏好后没有位移动画
- [ ] 毛笔字体是本地子集文件，许可证一并放入；页面没有外部请求
