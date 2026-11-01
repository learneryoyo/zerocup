# 六色块方案留存

本文件保留首页回滚前的六色块方案工程说明。该方案现已移至 `site/home-mosaic.html`，
相关 `site/assets/css/home.css`、`site/assets/js/home.js`、SVG 线稿及 PNG 素材均原样保留。
下文中的 `index.html` 指当时的入口；预览和继续开发请使用 `home-mosaic.html`。
将来如用于「非遗辑录」第二页，再统一调整页面入口和导航高亮。

---

# 前端协作说明

## 运行

双击 `site/index.html` 即可打开；推荐在 `site/` 下运行：

```bash
python -m http.server 8000
```

浏览器访问 http://localhost:8000。无 npm 安装、构建或第三方组件库。
所有图片、字体回退和代码在本地可用，无运行时 CDN 依赖。

## 文件与分工

| 文件 | 用途 |
|---|---|
| `site/index.html` | 首页：独立大字首屏、六色块分类组合、专题篇章入口、唯一的子页阅读容器 |
| `site/assets/css/site.css` | 所有顶级页面共用：导航、页脚、阅读容器 |
| `site/assets/css/home.css` | 仅首页：色块几何、配色、图像位置、开场与漂浮动画 |
| `site/assets/js/site.js` | 手机菜单、阅读容器的展开、关闭、焦点管理、全屏切换 |
| `site/assets/js/home.js` | 仅首页：开场动画（标志展开为首页） |
| `site/assets/images/home/` | 六个分类的 SVG 勾边线稿与保留的历史去背景图像 |
| `site/heritage/ceramics.html` | 陶瓷独立子页 |
| `site/heritage/woodblock-print.html` | 木版年画独立子页 |
| `site/heritage/template.html` | 供新非遗项目复制的起点 |
| `site/assets/css/heritage-story.css` | 子页默认样式，可覆盖或替换 |
| `site/assets/js/heritage-story.js` | 子页向容器传递 Escape 和键盘焦点消息 |
| `site/template.html` | 顶级页面模板（含导航、页脚） |
| `site/category/index.html` | 分类资料入口，也是首页「其他」模块的去处 |

首页之外的三个顶级页面按当前需求留白，各分类的正文和图片保留。
导航显示「首页 / 非遗辑录 / 古艺新生 / 关于我们」，现有文件名不变。
导航使用普通 HTML，顶部与底部各一份；变更时同步各顶级页面、模板与分类页。
分类页目前保留原布局；其后续视觉设计由对应协作者负责。

## 页眉标志

原先的红色「录」方块已移除，页眉只显示站名「非遗辑录」。
正式标志定稿后，在每页 `.brand` 链接里、站名之前加入：

```html
<img class="brand-logo" src="assets/images/logo.svg" alt="">
```

`site.css` 中的 `.brand-logo` 已预设 34px 高度。站名保留在旁边，所以图片 `alt` 留空即可。
开场的六色块标志只用于首页开场，不放进页眉。

## 首页：大字首屏与标志展开

首页先展示米白底、大字号标题和引言，向下进入分类区，再到专题篇章。
「向下探索」链接指向 `#collection`。分节布局及首屏字号位于 `home.css` 的页面框架段。

### 标志即首页

开场标志和首页的六个分类模块是**同一组元素**的两种状态：
标志是这组色块整体倾斜 30°、缩小居中；开场时它们旋转摆正、放大、移动到各自的模块位置。
二者共用一套几何数据，所以颜色、比例与相对位置始终一致。

### 几何数据（唯一来源）

在 `site/assets/css/home.css` 顶部：

```css
.mosaic { --cols: 43; --rows: 33; --mcols: 21; --mrows: 48; --tilt: 30; }
.module--objects  { --x: 0;  --y: 8;  --w: 10; --h: 14; --mx: 0;  --my: 0;  --tone: 47 69 57; }
...
```

- 网格单位：一列宽 10，列间距 1，整组 43 × 33。
- `--x / --y / --w / --h`：桌面与平板布局，同时也是标志的形状。
  `home.js` 读取这四个值和 `--tilt` 计算标志，不另存比例。
- 六块统一宽 10、高 14，绿色与蓝色不再加长；四列顶部依次为 8、4、0、12。
  手机整体为 21 × 48，左列顶部为 0、15、30，右列为 4、19、34。
  Logo 与页面读取同一组宽高，修改时保持六块等大。
- `--mx / --my`：手机（宽度 < 700px）两列布局中的位置。宽高仍用 `--w / --h`，比例不变。
- 改动后需保持各块不重叠、间距为 1 个单位。

| 模块 | 类名 | 颜色 | 链接 |
|---|---|---|---|
| 器物 | `.module--objects` | 深林绿 `47 69 57` | `category/objects.html` |
| 戏曲 | `.module--opera` | 沙色 `199 181 154` | `category/opera.html` |
| 舞蹈 | `.module--dance` | 暗酒红 `84 41 41` | `category/dance.html` |
| 食物 | `.module--food` | 土褐 `94 61 47` | `category/food.html` |
| 节日 | `.module--festival` | 深棕 `46 33 32` | `category/festival.html` |
| 其他 | `.module--other` | 靛蓝 `37 42 64` | `category/index.html` |

五个分类沿用仓库已有的分类页与文件名，是本站的编辑分组，**不是**国家级名录的官方十大类；
首页上已注明这一点。

### 修改颜色、文字、链接与图像

- **颜色**：改对应类名的 `--tone`（RGB 三元组）。色底透明度统一由 `:root` 的 `--field-alpha`（默认 .93）控制，
  只作用于色底层 `.module__field`，文字与图像不透明。
  浅色底（目前只有戏曲）另设 `--on` 为墨色；对应 SVG 内部也使用墨色描边。
- **文字与链接**：在 `index.html` 中改对应 `<li class="module module--…">` 里的 `href`、`.module__label` 与 `.module__examples`。
- **图像**：当前使用 `site/assets/images/home/*-outline.svg`，为原创透明底纯描边线稿。
  可直接编辑 SVG 路径、`stroke` 与 `stroke-width`，或替换 `<img>` 的路径、`alt`、宽高。
  所有线稿统一靠右：`--media: 8% 4% 26% 28%`（上、右、下、左）。
  图像和文字互不影响；不再用照片叠加投影模拟线稿。六张旧 PNG 保留，便于队友按需复用。
- 新素材的来源与许可记到 `docs/sources.md`；若重新使用馆藏照片，须同步图片说明与署名。

### 三层结构

```
li.module          布局层：网格定位；开场时 home.js 在这一层写入位移、旋转、缩放
  div.module__float  漂浮层：开场结束后的待机漂移（CSS 动画，只用 translate）
    a.module__card     交互层：链接本身；悬停与键盘焦点时 scale(1.03)
```

三层各自持有一个 transform，开场、漂浮、悬停不会互相覆盖。
每块的漂浮周期、相位与幅度（2–5px）在 `home.css` 中分别设定（`--float-*`）；页面隐藏时暂停，
系统开启「减少动态效果」时不漂浮。触屏设备不使用悬停效果。

### 开场动画

- 时间在 `home.js` 顶部的 `TIMING`：淡入 380ms、停留 560ms、旋转与展开 1500ms，共约 2.4 秒。
  `rotateEnd`、`expandStart` 控制旋转与展开的重叠，`revealAt` 控制文字与图像出现的时刻。
- 实现方式：色块先按最终布局排好，脚本测量最终位置，再用 Web Animations 从标志姿态播放回原位（FLIP）。
  因此在桌面、平板、手机上都会展开到当时真实的布局。
- 每个浏览器会话只播放一次（`sessionStorage` 的 `heritage-intro-seen`）；
  关闭子页、从其他页面返回都不会重播。
- 跳过：「跳过动画」按钮（可用键盘操作）、滚轮、触摸滑动、按任意键或改变窗口大小都会立即结束开场。
- 系统要求减少动态效果、浏览器不支持 Web Animations 或禁用 JavaScript 时，直接显示最终首页；
  `?intro=1` 也不会覆盖系统的减少动态效果偏好。
  头部脚本另设 3.5 秒保险，开场状态不会卡住页面。
- 开发调试：地址后加 `?intro=1` 强制重播，`?intro=0` 跳过；
  或在控制台运行 `sessionStorage.removeItem("heritage-intro-seen")` 后刷新。

## 添加一项非遗（独立子页）

1. 复制 `site/heritage/template.html` 为英文文件名，如 `paper-cutting.html`。
2. 改标题、封面路径、图片描述与署名，在正文编辑区自由设计。
3. 独有样式放在 `site/heritage/paper-cutting.css`，在 HTML 内引用。
   子页位于 iframe 中，CSS 与首页及其他子页天然隔离。
   默认样式只是起点，可以完全替换；保留键盘消息脚本即可获得 Escape 退出能力。
4. 在首页「专题篇章」列表 `.story-links` 中复制一项，修改链接、`data-story-url`、`data-story-title` 与文字。
   链接和 `data-story-url` 保持一致。

```html
<li>
  <a class="story-link" href="heritage/paper-cutting.html"
     data-story-url="heritage/paper-cutting.html"
     data-story-title="剪纸" aria-haspopup="dialog">
    <strong>剪纸</strong><span>一句引言</span>
  </a>
</li>
```

带 `data-story-url` 的任何链接都会在首页阅读容器中打开，无需修改 JS。
链接是普通 `<a>`：禁用 JS、按住 Ctrl/⌘ 点击或在新标签打开时仍可独立访问。
分类色块是另一组链接，与专题链接互不嵌套。

## 阅读容器约定

- 宽度大于 700px 时默认宽 50vw、高 90vh，居中显示。
- 手机默认占满视口，保留关闭与全屏按钮；内部内容独立滚动。
- 「全屏」指网页内铺满视口，不调用浏览器或系统级全屏。
- 点击链接后从链接位置展开；支持关闭键、遮罩点击、Escape 退出并回到原链接焦点。
- 支持减少动态效果的系统偏好；阅读期间背景不可交互。
- 子页可自由使用自己的 HTML、CSS、JS，不需要框架、路由器或构建配置。
- 子页可独立打开；全屏和关闭按钮属于首页容器。

## 当前图片

首页现用六张原创 SVG 主题线稿：花纹瓷瓶、水袖戏曲人物、长袖舞者、执壶斟茶、龙舟与桨手、古琴与抚琴双手。
它们是分类主题示意，不是特定文物的摹本，也不宣称还原某个具体非遗项目的标准动作。

此前的六张去背景 PNG 保留在原目录，目前首页不再引用。它们来自博物馆开放获取或开放许可藏品，详见 `docs/sources.md`：
器物为克利夫兰艺术博物馆的乾隆珐琅彩蒜头瓶，戏曲为大都会艺术博物馆的皮影影偶，
舞蹈为大都会艺术博物馆的唐代陶舞俑，食物为 Wikimedia Commons 上的砖茶（CC BY-SA 4.0），
节日为芝加哥艺术博物馆的端午五毒纹盘，其他为大都会艺术博物馆的古琴。
它们是藏品照片，不代表各分类页介绍的具体项目；分类负责人可换成更贴合自己内容的透明底图像。

陶瓷子页复用仓库原图 `porcelain-03-wheel-hands-tuan-nguyen.jpg`，
按素材清单署名 Tuan Nguyen；原始来源链接与许可尚待素材负责人补全。
木版年画子页为原创 SVG 花鸟示意图，已在子页标为占位，并非历史年画实物。
既有素材说明见 `site/category/objects/assets.md`。
