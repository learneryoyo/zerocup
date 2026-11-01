# 非遗 · 零杯海底小纵队

2026 零杯网页设计大赛（零组）参赛项目。

首页已恢复首版双图排版，入口为 `site/index.html`。
六色块方案完整保留在 `site/home-mosaic.html`，后续可用于第二页；相关工程说明见 `docs/mosaic-design.md`。
前端运行与协作方式见 `docs/frontend.md`，既有分类资料均保留。

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

导航栏四项：**首页 / 非遗辑录 / 古艺新生 / 关于我们**。
每个页面顶部、底部各有一份导航，内容一样。要改导航，所有页面一起改。

`site/category/objects.html` 里先放了三个子项（剪纸、陶瓷、木板年画），
其他三个分类的子项还没定。

**节日页已经有内容了**：五个项目（送王船 / 苗族姊妹节 / 罗坊走古事 / 水族端节 / 双庙渚蚕花水会），
文字和素材来源见 `docs/festival.md`，图片在 `site/category/festival/`，还没插进页面。

---

## 二、目录

```
zerocup/
├── README.md              ← 你正在看的
├── git-manual.md          ← Git 傻瓜手册，没碰过 Git 的先看这个
├── site/                  ← 网站本体，最后交的就是这个文件夹
│   ├── index.html
│   ├── heritage.html
│   ├── revival.html
│   ├── about.html
│   ├── template.html      ← 新页面从它复制
│   ├── category/
│   │   ├── objects.html
│   │   ├── opera.html
│   │   ├── dance.html
│   │   ├── food.html
│   │   ├── festival.html
│   │   └── festival/      ← 节日页的 25 张照片 + 5 段动图（约 28 MB）
│   │       ├── songwangchuan/
│   │       ├── miao-zimeijie/
│   │       ├── luofang-zougushi/
│   │       ├── shuizu-duanjie/
│   │       └── canhua-shuihui/
└── docs/
    ├── sources.md         ← 资料出处表，每写一条内容就记一行
    └── festival.md        ← 节日页五个项目的完整资料（署名、来源、素材对照）
```

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
- 评分：标准分 + 加分项；所供规则说明未列明具体分值。

## 八、第二页实现与界面规格

`site/heritage.html` 已接入四分类与联动轮播：天工开物、瓦舍勾栏、四时有节、寻味山河。
以 Claude Cowork 最新四分类对话为准，原五分类设计文档保留。交接与检查记录见 `docs/heritage-implementation.md`。

- 基准分辨率：1440px；自适应：是。
- 目标运行环境：Chrome 129；无需构建，可直接打开 HTML。
- 第二页使用四组共 21 张轮播照片，WebP 优化，后续图片按需加载。

### 非自己编写的库与用途（第二页）

| 库 | 版本 | 用途 | 引入方式 |
|---|---|---|---|
| 无 | — | 页面使用原生 HTML/CSS/JS | — |

开发检查与图片优化使用 Playwright / Sharp，不进入提交网站、不作为运行依赖。图片来源、署名与许可见 `site/assets/images/heritage/README.md`。全站其他页面如有新增依赖，由相应负责人补充。