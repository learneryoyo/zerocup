# 前端协作说明

> 2026-11-08 更新：六色块备选首页（`home-mosaic.html`）连同 `home.css`、`home.js`、
> `assets/images/home/` 已整体删除，本文下面关于它的表格行和调试参数只作历史记录。
> 六色块方案的完整工程说明仍在 `docs/mosaic-design.md`。

## 当前页面与留存方案

首页已恢复为首版的「米白底大标题 + 陶瓷大图 + 木版年画次图 + 黑底理念」排版。
页眉继续预留正式 Logo 的位置。导航其余三个顶级页面暂留空，既有分类资料和独立非遗子页均保留。

| 入口 / 文件 | 用途 |
|---|---|
| `site/index.html` | 当前正式首页，首版双图布局 |
| `site/assets/css/home-classic.css` | 仅供首版首页使用的样式 |
| ~~`site/home-mosaic.html`~~ | 已删除（2026-11-08） |
| ~~`site/assets/css/home.css`~~ | 已删除（2026-11-08） |
| ~~`site/assets/js/home.js`~~ | 已删除（2026-11-08） |
| ~~`site/assets/images/home/`~~ | 已删除（2026-11-08） |
| `docs/mosaic-design.md` | 六色块方案回滚前的完整工程说明 |
| `site/assets/css/site.css` | 两个方案共用的导航、页脚及阅读容器 |
| `site/assets/js/site.js` | 两个方案共用的菜单和阅读容器交互 |
| `site/heritage/` | 独立非遗子页与模板 |
| `site/category/index.html` | 分类资料入口 |

两个方案分别引用自己的 CSS，正式首页不引用 `home.css` 或 `home.js`，
因此不会播放六色块开屏动画。留存页面仍保留完整动画和分类入口。
「非遗辑录」的导航仍指向 `heritage.html`，尚未将留存方案接入第二页。

## 本地运行

双击 `site/index.html` 或 `site/home-mosaic.html` 可分别查看。
推荐在 `site/` 目录中运行：

```bash
python -m http.server 8000
```

随后访问 http://localhost:8000/ 或 http://localhost:8000/home-mosaic.html 。
均无需安装依赖或构建，使用本地资产和系统字体回退。

留存方案的动画调试参数仍可用：
- `home-mosaic.html?intro=1` 强制重播（仍尊重减少动态效果偏好）。
- `home-mosaic.html?intro=0` 跳过。
- `home-mosaic.html?intro=1&intro-seek=700` 固定在指定毫秒，方便检查 Logo。

## 首页与素材编辑

在 `index.html` 的 `<main>` 中编辑标题、引言、两张专题图片和理念文字。
首版首页布局样式在 `home-classic.css` 中，不要将六色块专用样式混入其中。
陶瓷图复用仓库原图并保留 Tuan Nguyen 署名，木版年画是明确标注的原创示意占位图。
来源与许可记录见 `docs/sources.md`，旧图与线稿未删除。

顶部与底部导航使用普通 HTML，各页面与模板的导航需保持一致。
页眉预留的正式 Logo 使用 `.brand-logo`，高度已在共享 CSS 中配置。

## 添加独立非遗子页

1. 复制 `site/heritage/template.html` 为英文文件名，例如 `paper-cutting.html`。
2. 在子页中修改标题、封面、图片描述和署名，自由设计正文与交互。
3. 独有 CSS 放在同目录并从子页引用。iframe 隔离样式，不影响其他页面。
4. 保留 `assets/js/heritage-story.js` 的相对引用，以支持子页内 Escape 退出。
5. 在首页 `.story-grid` 中复制卡片，修改 `href`、`data-story-url`、`data-story-title`、图片及文字。

```html
<a class="story-card story-card--secondary"
   href="heritage/paper-cutting.html"
   data-story-url="heritage/paper-cutting.html"
   data-story-title="剪纸" aria-haspopup="dialog">
  <img src="assets/images/paper-cutting.jpg" alt="具体描述图片内容">
  <span class="story-card-shade" aria-hidden="true"></span>
  <span class="story-card-content">
    <span class="story-card-kicker">一句引言</span>
    <strong>剪纸</strong>
    <span class="story-card-action">展开辑录 ↗</span>
  </span>
</a>
```

带 `data-story-url` 的普通链接会被共享脚本识别，不需要逐项修改 JS。
多人协作时各自维护子页与专属资源，由首页负责人统一添加入口。

## 阅读容器约定

- 桌面默认宽 50vw、高 90vh，居中显示；手机铺满视口。
- 子页独立滚动，右上角提供网页内全屏与关闭。
- 支持关闭按钮、遮罩点击与 Escape；退出后恢复原卡片焦点。
- 背景在阅读时不可交互，支持系统减少动态效果偏好。
- 禁用 JavaScript、按住 Ctrl/⌘ 点击或新标签打开时，子页仍可独立访问。

## 之后用于第二页

需要启用六色块方案时，以 `home-mosaic.html` 为起点：
按新页面位置调整资源和链接的相对路径，将导航高亮改为「非遗辑录」，
再确定是否保留开屏动画、标题与专题入口。完整参数说明见 `docs/mosaic-design.md`。
不要直接把 `home.css` 加到当前首页，以免两套布局互相影响。

## 2026-11-06 前端补充（本地工作区，未提交）

| 文件 | 变更 |
|---|---|
| `site/category/dance.html` + `assets/css/category-dance.css` | 新建舞蹈页：农乐舞、英歌、火龙灯舞、鱼灯舞四项，版式沿用分类页，单幅 4:3 大图 + 「观看要点」 |
| `site/about.html` + `assets/css/about.css` | 新建关于我们：缘起 / 怎么走一遍 / 材料从哪里来 / 怎么搭起来 / 谁做的，五节，不含个人信息 |
| `site/category/index.html` + `assets/css/category-index.css` | 分类索引页从空白页改为五类目录 |
| `site/assets/images/favicon.svg` | 新增站点图标；各页 `<head>` 补 `rel="icon"` 与 `theme-color` |
| `site/assets/css/home-classic.css` | 首屏、章节头、双图卡片的间距与断点整体调过；次图改用墨色文字 + 纸色遮罩 |
| `site/assets/images/woodblock-new-year.svg` | 重绘为团花图案，去掉图内文字；仍是占位插画，替换说明不变 |
| `site/assets/css/category.css` | hero 与项目图补 `height:auto`（同时写 width/height 属性时会被固定高度）；新增 `.cat-also` 次入口样式 |
| `site/category/opera.html` | 底部新增「瓦舍勾栏另有 · 传统舞蹈」入口，指向 `dance.html` |
| 四个分类页 | 顶部导航把「非遗辑录」标为 `is-current`，与当前页呼应 |
| `site/heritage.html` | 标题由重复的「非遗辑录 · 非遗辑录」改为「非遗辑录 · 四类长卷」 |
| `site/index.html` | 首页加「时间轴图层」：18 站（14 技艺 + 4 名录法规），底图是透明水墨长卷，固定视口正中，不折叠；待考和待增补的条目已删 |
| `site/assets/js/timeline.js` | 新建：页面滚动进度 → 长卷与轨道同步横向位移（线性）；节点按 `--x` 定位；右缘卷轴 `.tl-roller` 是展开和收起的入口，打开页面时提示一次；左右两端悬停 / 点击 / 开屏动画时升到内容之上，右上赭红方块退出 |
| `site/assets/css/home-classic.css` | 追加图层样式：环带（中间 36px、两端收薄、延伸到视口外）、竖排年份／名称／简介、底层与升起的两种状态 |

图层始终固定在视口正中（`top: 50%`），高度固定、不折叠；默认 `z-index: -1` 压在页面内容下面，
只在页面空白处透出来，`opacity` 降到 .3 作为底纹。

上浮只有三种触发：**鼠标停在左右两端**（各 180px 内）、**点击这一带**、**开屏动画**（`<html>`/`<body>` 带 `intro` 类）。
升起时 `z-index: 30`，纸色底与背景模糊放在 `.tl-layer.is-raised::before` 上；
纸底、环带、文字一起加竖向遮罩，越靠近上下端越透明，最上、最下端约 50%，中间保持不透明。
两个角标（左下墨绿、右上赭红退出键）不参与遮罩，始终清晰可点。
右上角 30×20 的赭红方块是退出键，点击后落回底层；
左下角 10×10 的墨绿方块是装饰。退出后若指针仍在图层范围内，会先压住不再上浮，离开后恢复。
图层 `pointer-events: none` 不挡页面点击，只有退出键可点；坐标判断时 `elementFromPoint` 命中
`.story-card` 或 `img` 不触发上浮，避免抢走首页图片的悬停与点击。触屏点一下这一带即可上浮。

上浮逻辑的保守约束（2026-11-06 之后）：
- 故事子页（`body.is-story-open`）或任何 `dialog[open]` 打开时不响应悬停，已抬起的 hover 状态先放下，手动固定的保持；
- 「点击这一带」跳过 `a / button / input / select / textarea / label / summary / [role=button]`，也不响应拖选文字后的 click；
- 退出键点过之后，`suppressed` 只在指针真的离开这一带（或窗口失焦）时才解除，避免一次瞬时判定把它清掉；
- 图层矩形在 `measure()` 里缓存，`mousemove` 不再逐次读布局。

### 角标与键（2026-11-06 之后追加）

- 首页每个版面（`.intro`、`.feature-section`、`.manifesto`）右上角 30×15 赭红、左下角 30×15 墨绿，贴到距页面边缘 12px 的位置，
  纯装饰，`pointer-events: none`；墨色版面上换成略亮的 `#b8503a / #3f6a53` 以保证可见。
  时间轴图层左下角的墨绿装饰块同样 30×15。
- 全站的「退出键」统一为 30×20 赭红矩形，「全屏键」为 30×20 墨绿矩形，两者都带 30×20 的不规则纹样：
  赭红是流云曲线加小旋涡，墨绿是层叠的等高线状闭环。纹样是内联 SVG 的 data URI，写在 `site.css` 的 `--mark-pattern-red / --mark-pattern-green` 里，不引外部图片。
  涉及：首页故事子页的关闭 / 全屏（`.story-control`）、分类页灯箱的关闭（`.cat-lightbox button`）、古艺新生档案弹窗的关闭（`.rv-close`）、时间轴图层的退出键（`.tl-layer__exit`）。

- 为了放这些矩形，`.manifesto span` 改成 `.manifesto > span:not(.sec-mark)`，避免版面的角标 span 被版式规则带上边距。

时间轴的节点出处见 `docs/sources.md` 的「首页时间轴」一节。

舞蹈页的图全部复用仓库既有素材，作者与授权记录见 `docs/sources.md` 的「舞蹈页」一节。
新增页面同样不引第三方库、字体或 CDN，`file://` 下可直接打开。

