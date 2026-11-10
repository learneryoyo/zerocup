# 非遗 · 零杯海底小纵队

2026 零杯网页设计大赛（零组）参赛项目。

首页已恢复首版双图排版，入口为 `site/index.html`。
六色块备选首页已于 2026-11-08 移除（无入链、不进提交包），工程说明留档在 `docs/mosaic-design.md`。
前端运行与协作方式见 `docs/frontend.md`，既有分类资料均保留。

---

## 参赛信息

### 组内成员

<!-- BEGIN-MEMBERS -->

| 姓名 | 学院 | 负责页面 |
|---|---|---|
| 屈乐瑶 | 待填 | 全站版式与前端（页面结构、交互、动效） |
| 王子林 | 待填 | 图像与考据（图像检索、出处核对、名录编号） |
| 潘言 | 待填 | 文本（题记、图注、三十件新作档案） |
| 陈家瑞 | 待填 | 实测与打包（多端浏览、无障碍、提交打包） |

<!-- END-MEMBERS -->

### 非自己编写的库与用途

| 库 | 版本 | 用途 | 引入方式 |
|---|---|---|---|
| Rough.js | 精简构建（MIT，许可证见 `site/assets/js/vendor/rough.LICENSE.txt`；文件内未保留版本号，API 对应 4.x） | 分类页「匠人故事」手账中，把手绘装饰线、照片框、榜题框与小标题前的短横重绘成略带抖动的手绘笔触。只做路径绘制，不提供任何 UI 组件、预设样式或字体 | 本地文件 `site/assets/js/vendor/rough.js`，随包提交，不走 CDN |

除上表所列外，全站 HTML / CSS / JavaScript 均为本队手写：无 `package.json`、无 `node_modules`、无任何 CDN 外链、无第三方字体、无第三方图标集。
样式表之间只有一处本地 `@import`——`site/assets/css/site.css` 第 1 行引入同目录的 `cursor.css`，两个文件都是自己写的。
开发阶段用于截图核对与图片压缩的工具（Playwright / Sharp）不进入提交网站，也不作为运行依赖。

### 界面规格

- 基准分辨率：**1440px**
- 自适应：**是**（另适配 1920px、720px 两档；移动端 390px 另做响应式）
- 目标运行环境：**Chrome 129**
- 无需构建，双击 HTML 即可打开；静态浏览不依赖后端服务。

### 项目说明

参赛主题：**主题二「匠心传承，非遗焕新」**。

站点是一个非遗数字展馆，四层结构：

| 页 | 内容 |
|---|---|
| 首页 | 双图首屏 + 四分类入口 + 非遗子页容器 |
| 非遗辑录 | 天工开物 / 瓦舍勾栏 / 四时有节 / 寻味山河四组，卡片与轮播联动 |
| 分类页 | 器物、戏曲、舞蹈、食物、节日，按「工艺—工序—人」三层组织，逐图标注摄影者与来源机构 |
| 古艺新生 | 30 个非遗创新案例，柜台 / 分类两种视图，五条路径筛选，六座可叩启的玻璃展柜 |

所有图片均标注摄影者与来源机构，汇总表见 `docs/sources.md`。

---

## 一、页面结构

| # | 页面 | 文件 |
|---|---|---|
| 1 | 首页 | `site/index.html` |
| 2 | 非遗辑录 | `site/heritage.html` |
| 2-1 | 　器物 | `site/category/objects.html` |
| 2-2 | 　戏曲 | `site/category/opera.html` |
| 2-3 | 　舞蹈 | `site/category/dance.html` |
| 2-4 | 　食物 | `site/category/food.html` |
| 2-5 | 　节日 | `site/category/festival.html` |
| 3 | 古艺新生 | `site/revival.html` |
| 4 | 关于我们 | `site/about.html` |

导航栏四项：**首页 / 非遗辑录 / 古艺新生 / 存续有数**，另有「更多」下拉。
每个页面顶部、底部各有一份导航，内容一样。要改导航，所有页面一起改。

`site/category/objects.html` 里先放了三个子项（剪纸、陶瓷、木板年画），
其他三个分类的子项还没定。

**节日页已经有内容了**：五个项目（送王船 / 苗族姊妹节 / 罗坊走古事 / 水族端节 / 双庙渚蚕花水会），
文字和素材来源见 `docs/festival.md`，图片在 `site/category/festival/`，已插入页面。

---

## 二、目录

```
zerocup/
├── README.md              ← 你正在看的
├── git-manual.md          ← Git 傻瓜手册，没碰过 Git 的先看这个
├── package.py             ← 打包成比赛要的两个 zip
├── site/                  ← 网站本体，最后交的就是这个文件夹
│   ├── index.html         ← 首页
│   ├── heritage.html      ← 非遗辑录
│   ├── revival.html       ← 古艺新生
│   ├── about.html         ← 关于我们
│   ├── template.html      ← 新页面从它复制（不进提交包）
│   ├── assets/
│   │   ├── css/           ← 全站手写样式，无第三方
│   │   ├── js/            ← 全站手写脚本；vendor/ 下只有 Rough.js（见「非自己编写的库」）
│   │   └── images/        ← 首页、非遗辑录、古艺新生的图
│   ├── category/
│   │   ├── index.html     ← 分类资料入口
│   │   ├── objects.html   + objects/    ← 器物
│   │   ├── opera.html     + opera/      ← 戏曲
│   │   ├── dance.html                   ← 舞蹈
│   │   ├── food.html      + food/       ← 食物
│   │   └── festival.html  + festival/   ← 节日
│   └── heritage/          ← 非遗子页（iframe 内容页，无独立导航）
│       ├── ceramics.html
│       ├── woodblock-print.html
│       └── template.html
├── docs/                  ← 设计文档与出处表
└── prototypes/            ← 小游戏原型（无入链，不进提交包）
```

> 素材约定：分类页的图放在 `site/category/<页面名>/`，和对应的 `.html` 同级。

---

## 三、分工

一个人只碰自己那一页，别人的文件不要动。

| 页面 | 文件 | 谁 |
|---|---|---|
| 首页 | `site/index.html` | 待填 |
| 非遗辑录 | `site/heritage.html` | 待填 |
| 器物 | `site/category/objects.html` | 待填 |
| 戏曲 | `site/category/opera.html` | 待填 |
| 舞蹈 | `site/category/dance.html` | 待填 |
| 食物 | `site/category/food.html` | 待填 |
| 节日 | `site/category/festival.html` | 待填 |
| 古艺新生 | `site/revival.html` | 待填 |
| 关于我们 | `site/about.html` | 待填 |

> 这张表是**对内**用的，填 GitHub 账号名或昵称都行。
> 比赛要交的「组内成员」表在上方「参赛信息」里，那一份要填**真实姓名和学院**，别漏。

---

## 四、怎么开工

1. **先读 `git-manual.md`**，把 GitHub Desktop 装好、仓库拉到本地。
2. **认领一页**，在第三节填上名字。
3. **复制一份起点**：
   - 做 `site/` 下的页面 → 复制 `site/template.html`
   - 做分类页 → 复制 `site/category/objects.html`（里面的相对路径已经对好了）
   - 做独立非遗子页 → 复制 `site/heritage/template.html`，详见 `docs/frontend.md`
4. 顶级页面与分类页**只改 `<main>` 里面的内容**，导航和页脚保持一致。
   独立非遗子页在 `site/heritage/` 下自由设计；共用 iframe 容器提供全屏与关闭，不要求统一内部布局。
5. **文件名一律用英文**，中文写在内容里没问题。

---

## 五、本地预览

双击 `site/index.html` 就能看。更推荐起本地服务器：

```bash
cd site
python -m http.server 8000
```

然后浏览器打开 <http://localhost:8000>

---

## 六、Git 三步

```bash
git pull          # 1. 动手前先拉
#   ...改文件...
git add .
git commit -m "器物页：补了剪纸的介绍"    # 2. 写清楚改了什么
git push          # 3. 推上去
```

**先 pull，再改，最后 push。** 顺序反了会冲突。
详细步骤和冲突处理看 `git-manual.md`。

---

## 七、比赛硬信息

- 赛事：2026 零杯网页设计大赛 · 零组
- 初赛截止：**11 月 14 日 22:00**（手册和 PPT 日期不一致，按早的算）
- 提交方式：邮件到 `2402065071@qq.com`，两个压缩包
  - 完整版（含选手信息）
  - **匿名版（不能出现任何个人信息）**
- 禁止使用预设样式的组件库（Bootstrap、Element UI 等）；功能性库允许，但要注明用途
- 评分：标准分 + 加分项。零组 100 分 = 设计 45 / 功能 20 / 技术 20 / 创意 10 / 文档 5，另有移动端适配、数据后台各 +5~10（分值出自开幕式 PPT 的初赛评分细则，手册正文只写「标准分 + 加分项」）

## 八、第二页实现说明

`site/heritage.html` 已接入四分类与联动轮播：天工开物、瓦舍勾栏、四时有节、寻味山河。
以 Claude Cowork 最新四分类对话为准，原五分类设计文档保留。交接与检查记录见 `docs/heritage-implementation.md`。

第二页使用四组共 21 张轮播照片，WebP 优化，非首屏图片按需加载。
图片来源、署名与许可见 `site/assets/images/heritage/README.md`。

界面规格与库清单统一见上方「参赛信息」，此处不再重复。

---

## 九、打包提交

仓库根目录的 `package.py` 一键生成手册要求的两个压缩包：

```bash
python package.py --team 海底小纵队 --captain 队长姓名 --names 姓名1,姓名2,姓名3
```

产出在 `dist/`（已被 `.gitignore` 排除，不会进仓库）：

```
dist/零杯零组-队伍名-队长姓名.zip
├── 2026-零杯零组-队伍名-队长姓名-完整版本.zip
└── 2026-零杯零组-队伍名-队长姓名-匿名版本.zip
```

脚本自动做四件事：

| 步骤 | 说明 |
|---|---|
| 排除 | `.git`、`git-manual.md`、`prototypes/`、模板页；下划线开头的本地探针脚本（`_*.js`、`_chrome_profile*/`）；`docs/timeline-guide/`（22 MB 生成工具）；以及三张无入链的设计参考图（`docs/heritage-ref-class.jpg` 是他人网站截图，两张 `*-reference.png` 是他人作品参考）——参考图进包只会给「抄袭」判定添材料 |
| 剥 EXIF | 所有图片去掉相机型号 / GPS / 作者字段 |
| 匿名化 | 删掉 README 里的 `<!-- BEGIN-MEMBERS -->` 到 `<!-- END-MEMBERS -->` 整段 |
| 回扫 | 打包后在包内搜成员姓名、邮箱、手机号，命中姓名就报错中止 |

**提交前务必**把「参赛信息」成员表的「学院」列填完——匿名版靠那两个注释标记来删，标记别删掉。
页面（`site/about.html`）里只写分工、不写姓名，姓名只出现在这张表里，这样完整版和匿名版的站点文件完全一致。