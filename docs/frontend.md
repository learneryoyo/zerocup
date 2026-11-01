# 前端协作说明

## 当前页面与留存方案

首页已恢复为首版的「米白底大标题 + 陶瓷大图 + 木版年画次图 + 黑底理念」排版。
页眉继续预留正式 Logo 的位置。导航其余三个顶级页面暂留空，既有分类资料和独立非遗子页均保留。

| 入口 / 文件 | 用途 |
|---|---|
| `site/index.html` | 当前正式首页，首版双图布局 |
| `site/assets/css/home-classic.css` | 仅供首版首页使用的样式 |
| `site/home-mosaic.html` | 完整留存的六色块方案，后续可用于第二页 |
| `site/assets/css/home.css` | 六色块方案的几何、配色、线稿位置及动效 |
| `site/assets/js/home.js` | 六色块 Logo 旋转展开动画 |
| `site/assets/images/home/` | 六色块 SVG 线稿与原 PNG 素材，均保留 |
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
