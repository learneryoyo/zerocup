# 器物类素材清单

文字内容见同目录 `note.md`（队友整理的项目简介与名录信息）。

## 目录规则

```
site/category/objects/
├── note.md                  文字资料
├── assets.md                本文件
└── <项目名>/
    ├── images/              照片
    └── videos/              短视频
```

页面引用示例（`objects.html` 里写）：

```html
<img src="objects/jingdezhen-porcelain/images/porcelain-01-met-01.jpg" alt="景德镇青花瓷">
<video src="objects/jingdezhen-porcelain/videos/porcelain-painting.mp4" controls muted playsinline></video>
```

## 四个项目

| 目录 | 项目 | 名录 | 图片 | 视频 |
|---|---|---|---|---|
| `jingdezhen-porcelain` | 景德镇手工制瓷技艺 | 国家级 Ⅷ-7 · 2006 第一批 · 江西景德镇 | 20 | 1 |
| `suzhou-embroidery` | 苏绣 | 国家级 Ⅶ-18 · 2006 第一批 · 江苏苏州 | 5 | 1 |
| `oilpaper-umbrella` | 伞制作技艺（油纸伞） | 国家级 Ⅷ-140 · 2008 第二批 · 四川泸州江阳 | 4 | 1 |
| `timber-frame` | 中国传统木结构建筑营造技艺 | 人类非遗代表作 · 2009 | 4 | 1 |

---

## jingdezhen-porcelain（景德镇手工制瓷技艺）

**工序照**（拉坯、绘制，最能说明"手艺"）

| 文件 | 内容 |
|---|---|
| `porcelain-01-wheel-painting-aedrian-salazar.jpg` | 拉坯描坯 |
| `porcelain-03-wheel-hands-tuan-nguyen.jpg` | 拉坯双手 |
| `porcelain-02-painted-plates-wall-kseniia.jpg` | 彩绘瓷盘墙 |
| `porcelain-process-01` ~ `06.jpg` | 过程分解图（已抠净底，适合做步骤条） |
| `videos/porcelain-painting.mp4` | 绘制片段，1:32–1:40 |

**成品照**（博物馆藏品，不是制作现场）

| 文件 | 内容 |
|---|---|
| `porcelain-01-met-01` ~ `03.jpg` | 大都会艺术博物馆（MET）藏品 |
| `porcelain-cma-01` ~ `06.jpg` | 克利夫兰艺术博物馆（CMA）藏品 |
| `porcelain-04-black-ground-vase-pilar-c.jpg` | 黑地粉彩瓶 |
| `porcelain-painting-cover.jpg` | 绘制片段封面 |

> ⚠️ **写内容时务必分清**：MET / CMA 的是**藏品照**，说明"东西长什么样"；
> `wheel-*` 和 `process-*` 才是**工艺照**，说明"怎么做的"。
> 用藏品照配"拉坯七十二道工序"的文案，等于图文不符。

---

## suzhou-embroidery（苏绣）

| 文件 | 内容 |
|---|---|
| `embroidery-01-bird-macro.jpg` | 小鸟微距 |
| `embroidery-02-purple-peony-gold-thread.jpg` | 紫牡丹金线 |
| `embroidery-03-embroiderer-and-silk.jpg` | 绣娘与丝线（**唯一有人物的工艺照**） |
| `embroidery-04-bogu-mirror.jpg` | 博古图镜片 |
| `embroidery-05-immortals-birthday.jpg` | 灵仙祝寿图 |
| `videos/embroidery-double-sided-goldfish.mp4` | 双面绣金鱼特写，5:16–5:26 |

> 五张里只有 `03` 是人在绣，其余是成品。要讲"一根丝线劈成几十份"，
> 只有 `03` 和那段双面绣视频能支撑。

---

## oilpaper-umbrella（伞制作技艺 · 油纸伞）

| 文件 | 内容 |
|---|---|
| `umbrella-09-group-painting-tr-ng-tuy-t-ly.jpg` | 伞群彩绘 |
| `umbrella-10-two-umbrellas-warm-light-ace-lang.jpg` | 双伞暖光 |
| `umbrella-11-red-upward-flavio-mori.jpg` | 红伞仰视 |
| `umbrella-12-white-group-richardmc.jpg` | 白伞成组 |
| `videos/umbrella-scene.mp4` | 伞韵，1:27–1:38，1280×720 无字幕 |

> 四张全是**成品/氛围照，没有一张在制伞**。
> 文案写"九十多道工序"时，页面得靠视频和文字撑，不要假装图在讲工序。

---

## timber-frame（中国传统木结构建筑营造技艺）

| 文件 | 内容 |
|---|---|
| `timber-06-eaves-bracket-michael.jpg` | 飞檐斗拱 |
| `timber-07-beam-frame-redd-francisco.jpg` | 木构梁架 |
| `timber-08-bracket-upward-qui-nguyen.jpg` | 斗拱仰视 |
| `timber-process-04.jpg` | 过程图（已抠净底） |
| `videos/timber-dovetail-assembly.mp4` | 燕尾榫拼装，46.04–55s |

> 视频是**唯一真正展示榫卯动作**的素材，比三张建筑照有用得多。
> 讲"不用一钉一胶"，页面必须把这段视频放出来。

---

## 版权提醒

- 文件名里带人名的（michael、redd-francisco、qui-nguyen、tr-ng-tuy-t-ly、
  ace-lang、flavio-mori、richardmc、aedrian-salazar、kseniia、tuan-nguyen、pilar-c）
  是图库摄影者署名，**用图时要保留署名**
- MET / CMA 是博物馆开放版权藏品
- **上线前逐张确认许可**，`docs/sources.md` 里登记来源
