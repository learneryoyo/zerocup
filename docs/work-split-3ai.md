# 三条线并行施工方案（GPT / Claude / DeepSeek）

> 目标：让访客走完「领略之美 → 走进生活 → 看见危机 → 想要传承」四步。
> 现状：美与生活两条线有内容但入口断，危机线被降级成小游戏，传承线缺失。

## 0. 为什么这样切

三个 AI 共用同一个工作目录（`C:/Users/smart/Desktop/zerocup`），
**不能各自切 git 分支**——同一个工作目录只能有一个分支，切来切去会把别人的改动带走。

所以并行的唯一依据是 **文件所有权互不相交**：

- 每条线独占一组文件，别人不碰
- 会碰所有页面的改动（导航栏）留到最后统一做
- 需要两边都定稿才能做的改动（交叉链接）也留到最后

## 1. 文件所有权表

| 线 | 负责 | 独占文件 | 对应目标 |
|---|---|---|---|
| **A** | GPT | `heritage/ceramics.html`<br>`heritage/woodblock-print.html`<br>`assets/css/heritage-story.css`<br>`index.html`<br>`assets/css/home-classic.css` | ① 领略之美 |
| **B** | Claude | `assets/js/revival.js`<br>`assets/js/revival-vitrine.js`<br>`revival.html`<br>`about.html` | ② 走进生活 |
| **C** | DeepSeek | `games/spectrum.html`<br>`category/objects.html`<br>`category/opera.html`<br>`category/food.html`<br>`category/festival.html`<br>`category/dance.html`<br>新增 `assets/js/spectrum-contact.js` | ③ 危机与传承 |
| **收口** | 谁先完成谁领<br>（或主控代做） | 全站 12 个页面的 `<header>`<br>分类页与古艺新生的交叉链接 | ④ 串成一条线 |

## 2. 铁律（违反会直接抹掉别人的工作）

1. **不许碰** `assets/css/site.css`、`assets/js/site.js`、`assets/js/revival-data.js`、
   `assets/js/artisan-diary-data.js`。
   前两个是全站共享，后两个是队友考据过的数据，一个字都别动。
2. **不许碰** 任何页面里 `<header class="site-header">…</header>` 之间的内容。收口阶段统一改。
3. **不许执行** `git checkout` / `git reset` / `git stash` / `git pull` / `git push`。
   三个人共用一个工作目录，这些操作会抹掉别人的改动。commit 也留到收口时统一做。
4. **不许新增配色、字号、字体、装饰元素**。只加结构和文本，
   排版一律复用页面已有的 class。需要新 class 时，只能加在自己独占的 CSS 文件里。
5. **同一个文件不要并行发多个 Edit**。实测一批 18 个 Edit 打到同一个 HTML，
   最终只有 3 个落盘（写入竞争，后写覆盖前写）。要批量改就串行，或写成脚本一次替换。
6. **素材文件名一律 ASCII**。中文名会被安全策略拦住，`git add` 直接 Permission denied。
7. **每个数字必须有来源**，写成「（据《xxx》20xx 年报道）」。
   找不到可靠来源就只写定性（"学徒稀少""传承人年事已高"），**不要编数字**。
   这一条是硬要求：本项目所有数据文件都严格标注了出处与免责，不能在这里破例。

## 3. 三线任务

### A 线 · 美（GPT）

**A-1 填掉两个空故事页（最高优先，首页第一个点击就是它们）**

`heritage/ceramics.html` 和 `heritage/woodblock-print.html` 现在只有一个首屏大图
和一行空的 `<div class="story-content"></div>`，CSS 里 `min-height: 85vh`，
所以点进去就是一大片空白。

注意：这两页是首页弹层（`.story-overlay` 的 iframe）加载的，
**不要给它们加站点头部导航**，那是错的。

- 内容来源：`category/objects.html` 里 `#porcelain` 已有的工艺段落、
  `assets/js/artisan-diary-data.js` 第 1 条（邓希平与颜色釉）、
  图片在 `category/objects/jingdezhen-porcelain/images/`
- 组织方式：按**工序**分段（拉坯 → 利坯 → 画坯 → 施釉 → 烧窑），一屏一步。
  这是全站唯一能把"美"从"结果"变成"过程"的地方。
- 木版年画：素材在 `assets/images/woodblock-new-year.svg`、
  `category/objects/images/`；`revival-data.js` 里 05 与 25 两条桃花坞年画案例可参考写法
  （但**不要改那个数据文件**，只读）

**A-2 首页加一条「今天它长这样」**

现在首页顺序是：hero → 两张故事卡 → 时间轴 → manifesto。
在时间轴**之前**插一条横向条带，放 3–5 件焕新成品（图从 `assets/images/revival/` 取），
每件配一行字。目的：让"走进生活"在首页就被看见，而不是只靠导航文字。

验收：点首页两张卡，弹层里是完整内容而不是空白；首页没有空区块。

### B 线 · 生活（Claude）

**B-1 把 `access` 提到卡片正面**

`revival-data.js` 每条案例都有 `access.where`（线下在哪能摸到）和 `access.price`，
这是全站唯一能证明"这不是概念稿、真的能去能买"的字段，现在埋在弹窗最底下。
把它提到卡片正面（`revival.js` 的 `cover()` 一带）。

**B-2 填掉 `about.html` 的「待填」**

`about.html` 里有 4 处 `<!-- 待填 -->`：题记引语、三段正文、成员名单、邮箱。
题记要回答的是「我们为什么做这个站、怎么理解传承、想对读者说什么」——
这一页本该是"传承"这件事的落点，现在最空。

注意：`about.html` 的样式内联在 `<style>` 里，变量都以 `--ab-` 前缀，
**不要污染 `:root`，也不要改 `site.css`**。

验收：卡片正面能看到"在哪能摸到"；about 页搜不到「待填」。

### C 线 · 危机与传承（DeepSeek）

**C-1 光谱页（先做这个，价值最高）**

`games/spectrum.html` 是全站情绪最重的页面（101 项、五维评分、转名录讨论），
但内容上还缺两头：

- 页首：现在 h1 之后直接进光谱控件，没有一句"这一页为什么存在"。
  补一段铺垫——这些分数不是官方评级，是我们对"还剩多少人在做"的判断。
- 页尾：`notes` 之后加一段「你能做什么」。

**「你能做什么」不要凭空编，已经有现成数据了。**

项目根目录外有一份现成产物：`D:/work/wb/零杯想法/非遗-传承入口/`，里面有

- `data.json` —— 101 条，每条含 `units`（属地非遗保护中心 + 省文旅厅非遗处）、
  `venue`（工坊/传习所/研培计划/团校）、`how`（具体怎么报名）、`find`（查保护单位链接）
- `spectrum-contact.js` —— 同一份数据按项目名索引的 JS 模块（66 KB），
  `window.SPECTRUM_CONTACT["皮影戏"]` 直接取

用法：把 `spectrum-contact.js` 复制到 `site/assets/js/`，
在 `spectrum.html` 的 `</body>` 前加一行 `<script src="../assets/js/spectrum-contact.js"></script>`。
抽屉里渲染时用页面已有的 `.d-sec` / `.muted` / `a` 样式（README 里有现成片段）。

这份数据的取舍很重要，**不要改**：只给机构（保护单位/文化馆/文旅厅），
不给匠人个人手机号微信——理由是个人信息、会过期、官方转介才是正路。
`data.json` 里也**故意没有电话和地址**（三个月就旧了）。

另外光谱页现有的 `DATA` 已经有 `s`（濒危指数）和 `w`（为什么濒危），
页尾可以顺势点出：分数最高那几项，恰好就是最难找到学习入口的几项。

**C-2 分类页加「存续现状」**

5 个分类页共 **21 项**非遗（器物 4 / 戏曲 4 / 食物 4 / 节日 5 / 舞蹈 4），
每项在 `.project-body` 之后加一行现状，
**复用已有的 `.project-meta`，不新增 CSS**：

```html
<p class="project-meta">存续 · 国家级传承人 3 位（据《xxx》2024 年报道）· 全县从业者不足 200 人 · 日常使用场景仍在</p>
```

数据来源与陷阱：

- 只有 4 项能和光谱对上：**景德镇制瓷、京剧、皮影戏、送王船**。
  可直接引用 `games/spectrum.html` 里 `DATA` 的 `s`（濒危指数）与 `w`（为什么濒危），
  但**必须带上"编辑性评估、非官方认定"这句免责**（光谱页 notes 里已有原话）。
- 木偶戏要注意：光谱里的是「泉州提线木偶戏」，本站写的是「潮州铁枝木偶戏」，
  **是两个不同项目，不能互相引用**。
- 木版年画只有门类级对应（光谱里是滩头、梁平，不是桃花坞），不要张冠李戴。
- 剩下 17 项**没有现成数据**，要自己找来源。找不到就只写定性，不写数字。

验收：5 个分类页每一项都有一行现状；全页搜不到无出处的数字。

## 4. 收口（三条线都完成后）

按这个顺序，一次做完，避免二次冲突：

1. **导航**：把「濒危光谱」从「更多」下拉提到一级导航。
   现在它和「开酥·荆门酥饼」并列，标签是"小游戏"——这是全站最重的内容被降级成彩蛋。
   涉及 12 个页面的 `<header>`，必须一次改完。
2. **交叉链接**：分类页每项末尾加「它的新生 →」，古艺新生案例加「它的旧艺 ←」。
   **不要硬编一对一**——17 项和 30 个案例重合极少。
   按门类链（器物页 → 日用新生类），只有真对应才做项目级
   （已知：皮影戏 → 案例 28 华县皮影；景德镇制瓷 → 案例 17 高淳陶瓷属同类不同项）。
3. **统一 commit**，commit message 前缀标线别：`[A]` `[B]` `[C]`。

## 5. 三段可直接粘贴的 prompt

每段都自包含，整段贴给对应的 AI 即可。

---

### A 线 prompt（给 GPT）

```
你在一个网页设计比赛项目里工作，目录 C:/Users/smart/Desktop/zerocup。

【项目是什么】
一个介绍中国非物质文化遗产的静态网站，纯手写 HTML/CSS/JS，无框架无第三方库。
主张是：非遗不是被束之高阁的旧物，而是仍在被人一遍遍做成新的今天。
站点在 site/ 下，首页 site/index.html。

【你负责什么】
你负责「让人第一眼被非遗的美打动」这一环。只做两件事，做完就停。

任务一：填掉两个空白故事页
site/heritage/ceramics.html 和 site/heritage/woodblock-print.html 现在是空的——
只有一个首屏大图，正文区是一个空的 <div class="story-content"></div>，
而 CSS 里 .story-content 有 min-height:85vh，所以点进去是一大片白。
首页第一张、第二张故事卡就指向这两页，这是访客的第一个点击，现在直接掉进空白。

注意：这两页是首页弹层用 iframe 加载的子页，**不要给它们加站点头部导航**。
样式写在 site/assets/css/heritage-story.css（这个文件归你独占，可以改）。

内容来源（只读，不要修改这些文件）：
- site/category/objects.html 里 id="porcelain" 那一项的工艺段落
- site/assets/js/artisan-diary-data.js 第 1 条（邓希平与颜色釉的故事）
- 图片在 site/category/objects/jingdezhen-porcelain/images/

组织方式要求：按**工序**分段（拉坯 → 利坯 → 画坯 → 施釉 → 烧窑），一屏一步，
滚动时逐步显现。这是全站唯一能把「美」从结果变成过程的地方，不要写成一整段散文。
木版年画那页同理，素材在 site/assets/images/woodblock-new-year.svg 和
site/category/objects/images/。想参考写法可以读 site/assets/js/revival-data.js
里 id 05 和 25 两条桃花坞年画案例，但**那个文件一个字都不许改**。

任务二：首页加一条「今天它长这样」
现在 site/index.html 的顺序是：hero → 两张故事卡 → 时间轴 → 结尾 manifesto。
在时间轴 section（class="tl-layer"）**之前**插一条横向条带，放 3–5 件焕新成品，
图片从 site/assets/images/revival/ 里取，每件配一行短文字。
目的：让访客在首页就知道「这些手艺今天变成了能买能用的小东西」。
排版复用 site/assets/css/home-classic.css 里已有的写法。

【铁律，违反会毁掉别人的工作】
1. 不许碰 site/assets/css/site.css、site/assets/js/site.js。
   不许碰任何页面里 <header class="site-header">…</header> 之间的内容。
2. 不许执行 git checkout / reset / stash / pull / push / commit。
   三个人在同一个目录并行工作，这些操作会抹掉别人的改动。
3. 不许自己定配色、字号、字体、装饰元素。只加结构和文本，
   排版一律复用页面已有的 class；确实需要新 class 时，只能加在
   heritage-story.css 或 home-classic.css 里（这两个归你）。
4. 同一个文件不要并行发多个 Edit，会互相覆盖。要批量改就串行，或写脚本一次替换。
5. 图片文件名一律用 ASCII，中文名会被安全策略拦掉。
6. 你只动这四个文件：heritage/ceramics.html、heritage/woodblock-print.html、
   index.html、assets/css/heritage-story.css。

【验收】
点首页两张故事卡，弹层里是完整内容而不是空白；首页没有空区块。
做完告诉我改了哪些文件、每个文件加了什么，不要贴大段代码。
```

---

### B 线 prompt（给 Claude）

```
你在一个网页设计比赛项目里工作，目录 C:/Users/smart/Desktop/zerocup。

【项目是什么】
一个介绍中国非物质文化遗产的静态网站，纯手写 HTML/CSS/JS，无框架无第三方库。
主张是：非遗不是被束之高阁的旧物，而是仍在被人一遍遍做成新的今天。
站点在 site/ 下。

【你负责什么】
你负责「让人相信非遗真的走进了日常生活」这一环。只做两件事，做完就停。

任务一：把 access 字段提到卡片正面
site/assets/js/revival-data.js 里 30 条焕新案例，每条都有 access 字段：
  access.where  —— 线下在哪能摸到、在哪能买
  access.price   —— 价格
这是全站唯一能证明「这不是概念稿、真的能去能买」的字段，
现在却埋在弹窗最底下，卡片正面看不到。
请在 site/assets/js/revival.js 的 cover() 一带把它提到卡片正面。
（如果展柜视图也涉及，site/assets/js/revival-vitrine.js 也归你。）

**注意：revival-data.js 是队友逐条考据过的数据，一个字都不许改，只读。**

任务二：填掉 about.html 的「待填」
site/about.html 里有 4 处 <!-- 待填 -->：
  1. 题记的引语（.ab-lede）
  2. 三段正文（.ab-cols 里三个 <p>）
  3. 成员名单（.ab-credit，现在是"成员甲/乙/丙/丁 · 待填"）
  4. 邮箱（.ab-mail，现在是 href="mailto:" 和"邮箱待填"）

题记要回答的是：我们为什么做这个站、怎么理解「传承」这件事、想对读者说什么。
这一页本该是「传承」的落点，现在最空。
成员和邮箱如果是占位，就写成不含真实个人信息的合理版本（比如按职责分工写），
不要编造真实姓名和邮箱。

注意：about.html 的样式内联在 <style> 里，变量都以 --ab- 前缀声明在 .ab-page 上。
**不要污染 :root，也不要改 site.css。**

【铁律，违反会毁掉别人的工作】
1. 不许碰 site/assets/css/site.css、site/assets/js/site.js、site/assets/js/revival-data.js。
   不许碰任何页面里 <header class="site-header">…</header> 之间的内容。
2. 不许执行 git checkout / reset / stash / pull / push / commit。
   三个人在同一个目录并行工作，这些操作会抹掉别人的改动。
3. 不许自己定配色、字号、字体、装饰元素。只加结构和文本，复用已有 class。
4. 同一个文件不要并行发多个 Edit，会互相覆盖。要批量改就串行。
5. 素材文件名一律 ASCII，中文名会被安全策略拦掉。
6. 你只动这四个文件：assets/js/revival.js、assets/js/revival-vitrine.js、
   revival.html、about.html。

【验收】
古艺新生的卡片正面能直接看到「在哪能摸到」；about 页全文搜不到「待填」。
做完告诉我改了哪些文件、每个文件加了什么，不要贴大段代码。
```

---

### C 线 prompt（给 DeepSeek）

```
你在一个网页设计比赛项目里工作，目录 C:/Users/smart/Desktop/zerocup。

【项目是什么】
一个介绍中国非物质文化遗产的静态网站，纯手写 HTML/CSS/JS，无框架无第三方库。
主张是：非遗不是被束之高阁的旧物，而是仍在被人一遍遍做成新的今天。
站点在 site/ 下。

【你负责什么】
你负责「让人意识到很多非遗正在失传，并且觉得自己能做点什么」这一环。
这是全站最弱的一环。做两件事，按顺序做。

任务一：升级光谱页（先做这个，价值最高）
site/games/spectrum.html 是一个把 101 项非遗按濒危程度排进光谱的交互页，
有双滑块筛选、五维评分说明、UNESCO 转名录讨论，内容是全站最硬的。
但它缺两头：

- 页首：现在 h1 之后直接就是光谱控件，没有一句「这一页为什么存在」。
  补一段铺垫：这些分数不是官方评级，是我们依据公开信息对「还剩多少人在做」的判断。
- 页尾：在 <section class="notes"> 之后加一段「你能做什么」。

**「你能做什么」不要凭空编，已经有现成数据了，直接用。**

项目根目录外有一份现成产物：D:/work/wb/零杯想法/非遗-传承入口/
里面有 spectrum-contact.js（66 KB）和 data.json，覆盖光谱全部 101 项，每条含：
  units —— 属地非遗保护中心 + 省文旅厅非遗处
  venue —— 工坊 / 传习所 / 研培计划 / 团校 这类入口
  how   —— 具体怎么报名
  find  —— 查这一项保护单位的链接

用法：
1. 把 非遗-传承入口/spectrum-contact.js 复制到 site/assets/js/spectrum-contact.js
2. 在 spectrum.html 的 </body> 前加 <script src="../assets/js/spectrum-contact.js"></script>
3. 抽屉里渲染时用页面已有的 .d-sec / .muted / a 样式，
   window.SPECTRUM_CONTACT[项目名] 取数据

这份数据的取舍是刻意的，**不要改**：只给机构，不给匠人个人手机号微信
（个人信息、会过期、官方转介才是正路），也故意没写电话和地址（三个月就旧）。
你可以读 D:/work/wb/零杯想法/非遗-传承入口/README.md 了解完整理由。

页尾还可以顺势点一句：分数最高那几项，恰好就是最难找到学习入口的几项。

注意：这一页的样式内联在 <style> 里，变量以 -- 开头，直接改这个文件即可。
页首页尾的排版复用页面已有的 .lede / .notes / .dim 等 class。

任务二：给 5 个分类页的每一项加一行「存续现状」
文件：site/category/objects.html、opera.html、food.html、festival.html、dance.html
共 21 项非遗（器物 4 / 戏曲 4 / 食物 4 / 节日 5 / 舞蹈 4）。
每一项在 .project-body 之后加一行，**复用已有的 .project-meta，不新增 CSS**：

<p class="project-meta">存续 · 国家级传承人 3 位（据《xxx》2024 年报道）· 全县从业者不足 200 人 · 日常使用场景仍在</p>

数据来源，这里有坑，注意看：
- 只有 4 项能和光谱数据对上：景德镇制瓷、京剧、皮影戏、送王船。
  这 4 项可以引用 site/games/spectrum.html 里 DATA 的 s（濒危指数）和 w（为什么濒危），
  但**必须带上「编辑性评估、非官方认定」这句免责**（光谱页 notes 里有原话可抄）。
- 木偶戏要小心：光谱里是「泉州提线木偶戏」，本站写的是「潮州铁枝木偶戏」，
  是两个不同项目，不能互相引用。
- 木版年画只有门类级对应：光谱里是滩头木版年画、梁平木版年画，不是桃花坞。
  不要张冠李戴。
- 剩下 17 项没有现成数据，要自己查来源。

【最重要的一条】
**每个数字必须有来源**，写成「（据《xxx》20xx 年报道）」。
查不到可靠来源就只写定性（「学徒稀少」「传承人年事已高」「仍有节庆使用场景」），
**绝对不要编数字**。
这个项目所有数据文件都严格标注了出处和免责（比如"不据此认定国家级传承人身份"、
"配图为示意"），在这里破例会直接毁掉整个站的可信度。

【铁律，违反会毁掉别人的工作】
1. 不许碰 site/assets/css/site.css、site/assets/js/site.js、
   site/assets/js/revival-data.js、site/assets/js/artisan-diary-data.js。
   不许碰任何页面里 <header class="site-header">…</header> 之间的内容。
2. 不许执行 git checkout / reset / stash / pull / push / commit。
   三个人在同一个目录并行工作，这些操作会抹掉别人的改动。
3. 不许自己定配色、字号、字体、装饰元素。只加结构和文本，复用已有 class。
4. 同一个文件不要并行发多个 Edit，会互相覆盖。5 个分类页请一个一个串行改。
5. 图片文件名一律 ASCII，中文名会被安全策略拦掉。
6. 你只动这几个文件：games/spectrum.html、category/ 下那 5 个页面，
   以及新增的 assets/js/spectrum-contact.js（从 非遗-传承入口/ 复制过来）。

【验收】
光谱页有页首铺垫和页尾「你能做什么」；5 个分类页每一项都有一行现状；
全文搜不到没有出处的数字。
做完告诉我改了哪些文件、每个文件加了什么、哪些项没找到来源，不要贴大段代码。
```
