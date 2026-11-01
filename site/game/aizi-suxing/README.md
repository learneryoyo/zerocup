# 开酥 · 荆门酥饼制作体验

单页拖拽小游戏原型，原生 HTML + CSS + JavaScript（SVG + Pointer Events），不依赖任何库。

## 文件

- `index.html` — 页面结构、SVG 舞台（viewBox 900×600）、结算弹层
- `style.css` — 纸张/展陈视觉、响应式、拖拽与反馈动效
- `game.js` — 状态机、拖拽、火候、结算

## 状态机

`roll → fold → fill → seal → sesame → bake → result`

- `roll`：拖擀面杖左右移动，行程累积驱动面皮变扁变宽
- `fold`：拖油刷抹油酥，抓面皮边向内折两次（影响层数）
- `fill`：从碗里拖馅团到面皮中心
- `seal`：沿饼边拖动一圈收口（影响封口分数；分多次收口会留小口）
- `sesame`：拖芝麻罐扫过饼面，芝麻逐粒吸附
- `bake`：拖进饼铛、实时变色、向上拖起翻面、拖到盘中起锅
- `result`：横截面 + 三项指标

## 交互要点

- 所有拖拽使用 `pointerdown / pointermove / pointerup / pointercancel` + `setPointerCapture`
- 用 `getScreenCTM().inverse()` 换算 SVG 坐标，缩放窗口后仍跟手
- 舞台 `touch-action: none`，触屏拖拽不滚动页面
- 当前步骤外的元素隐藏或降饱和，避免误触
- “自动完成”按钮可作为演示/无障碍路径，逐步骤自动推进

## 计分

- 开酥：擀皮行程、折叠次数、油酥覆盖
- 封口：沿边拖动覆盖角度；分段收口会扣一点分并出现轻微漏馅
- 火候：翻面时机 + 起锅时机；不翻面会“只烙了一面”，过火会发黑

## 本地预览

在仓库根目录：

```bash
cd site
python -m http.server 8000
```

打开 <http://localhost:8000/game/aizi-suxing/index.html>
