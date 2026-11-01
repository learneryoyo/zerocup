/*
  首页开场：同一组色块先以倾斜的标志出现，再旋转摆正、展开到首页模块的位置。

  做法（FLIP）：色块先按 home.css 的网格排到最终位置，测得各自的最终矩形；
  再按 --x/--y/--w/--h 与 --tilt 算出它们在「标志」里的位置，
  用 Web Animations 把每块从标志姿态（位移 + 旋转 + 等比缩放）播放回原位。
  动画只写在 .module（布局层）上；漂浮层与悬停层另有元素，互不覆盖。
*/
(function () {
  "use strict";

  var root = document.documentElement;
  var STORAGE_KEY = "heritage-intro-seen";

  // 时长（毫秒）与节奏，调整开场只改这里。
  var TIMING = {
    appear: 380,        // 标志淡入
    hold: 560,          // 标志静止，便于辨认
    motion: 1500,       // 旋转 + 展开
    rotateEnd: 0.6,     // 旋转在 motion 的 60% 处摆正
    expandStart: 0.26,  // 展开从 motion 的 26% 处开始，与旋转重叠，动作连贯
    revealAt: 0.74      // 文字与图像在 motion 的 74% 处开始出现
  };
  var LOGO_SIZE = { width: 0.72, height: 0.64 }; // 标志占可视区域的比例
  var STEPS = 36;                                 // 每块关键帧采样数

  var mosaic = document.querySelector(".mosaic");
  var skipButton = document.querySelector(".intro-skip");
  var animations = [];
  var timers = [];
  var done = false;

  trackPageVisibility();
  if (!mosaic || !root.classList.contains("intro")) return;

  try {
    play();
  } catch (error) {
    finish();
  }

  // 页面不可见时暂停待机漂浮（CSS 读取 .is-page-hidden）。
  function trackPageVisibility() {
    document.addEventListener("visibilitychange", function () {
      root.classList.toggle("is-page-hidden", document.hidden);
    });
  }

  function play() {
    if (document.hidden || typeof mosaic.animate !== "function") { finish(); return; }
    var modules = Array.prototype.slice.call(mosaic.querySelectorAll(".module"));
    var composition = readComposition();
    var blocks = modules.map(function (element, index) { return readBlock(element, index, composition); });
    var logo = logoFrame(blocks, composition);
    var total = TIMING.appear + TIMING.hold + TIMING.motion;

    blocks.forEach(function (block) {
      var animation = block.element.animate(keyframes(block, logo, composition, total), {
        duration: total,
        easing: "linear",   // 缓动已在采样中计算
        fill: "both"
      });
      animations.push(animation);
    });

    root.classList.add("intro-ready");
    showSkip();
    // 开发调试：?intro=1&intro-seek=1200 冻结在第 1200 毫秒，便于截图检查过渡中的某一帧。
    var seek = /[?&]intro-seek=(\d+)/.exec(location.search);
    if (seek) {
      animations.forEach(function (animation) { animation.pause(); animation.currentTime = Number(seek[1]); });
      if (Number(seek[1]) >= TIMING.appear + TIMING.hold + TIMING.motion * TIMING.revealAt) reveal();
      window.clearTimeout(window.__introSafety);
      return;
    }
    timers.push(window.setTimeout(reveal, TIMING.appear + TIMING.hold + TIMING.motion * TIMING.revealAt));
    timers.push(window.setTimeout(finish, total + 40));
    ["wheel", "touchmove"].forEach(function (type) { window.addEventListener(type, finish, { passive: true, once: true }); });
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", finish, { once: true });
  }

  // 读取 home.css 中的网格与倾斜角。
  function readComposition() {
    var style = getComputedStyle(mosaic);
    return {
      cols: parseFloat(style.getPropertyValue("--cols")),
      rows: parseFloat(style.getPropertyValue("--rows")),
      tilt: parseFloat(style.getPropertyValue("--tilt")) * Math.PI / 180
    };
  }

  function readBlock(element, index, composition) {
    var style = getComputedStyle(element);
    var unit = function (name) { return parseFloat(style.getPropertyValue(name)); };
    var x = unit("--x"), y = unit("--y"), w = unit("--w"), h = unit("--h");
    var rect = element.getBoundingClientRect();
    return {
      element: element,
      index: index,
      w: w,
      h: h,
      // 标志中的中心，相对整组中心，单位为网格单位。
      offset: { x: x + w / 2 - composition.cols / 2, y: y + h / 2 - composition.rows / 2 },
      // 最终位置（当前布局：桌面、平板或手机）。
      center: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      unit: rect.width / w
    };
  }

  // 标志的中心与每个网格单位的像素数：旋转后的整组放进可视区域中央。
  function logoFrame(blocks, composition) {
    var header = document.querySelector(".site-header");
    var top = header ? header.getBoundingClientRect().bottom : 0;
    var width = document.documentElement.clientWidth;
    var height = window.innerHeight - top;
    var bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
    blocks.forEach(function (block) {
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (corner) {
        var point = rotate(block.offset.x + corner[0] * block.w / 2, block.offset.y + corner[1] * block.h / 2, composition.tilt);
        bounds.minX = Math.min(bounds.minX, point.x); bounds.maxX = Math.max(bounds.maxX, point.x);
        bounds.minY = Math.min(bounds.minY, point.y); bounds.maxY = Math.max(bounds.maxY, point.y);
      });
    });
    var scale = Math.min(width * LOGO_SIZE.width / (bounds.maxX - bounds.minX), height * LOGO_SIZE.height / (bounds.maxY - bounds.minY));
    var stage = mosaic.getBoundingClientRect();
    return {
      scale: scale,
      // 让旋转后外接框的中心落在可视区域中心。
      x: width / 2 - (bounds.minX + bounds.maxX) / 2 * scale,
      y: top + height / 2 - (bounds.minY + bounds.maxY) / 2 * scale,
      // 首页组合（.mosaic）的中心：展开的终点。
      target: { x: stage.left + stage.width / 2, y: stage.top + stage.height / 2 }
    };
  }

  function keyframes(block, logo, composition, total) {
    var frames = [];
    var appearEnd = TIMING.appear / total;
    var motionStart = (TIMING.appear + TIMING.hold) / total;
    // 淡入：标志略小、透明，轻轻放大到位。
    frames.push(frame(block, logo, composition, 0, 0.94, 0, 0));
    frames.push(frame(block, logo, composition, 0, 1, 1, appearEnd));
    frames.push(frame(block, logo, composition, 0, 1, 1, motionStart));
    for (var step = 1; step <= STEPS; step += 1) {
      var t = step / STEPS;
      frames.push(frame(block, logo, composition, t, 1, 1, motionStart + t * (1 - motionStart)));
    }
    frames[frames.length - 1] = { offset: 1, transform: "none", opacity: 1 };
    return frames;
  }

  // t：motion 进度 0–1。旋转与展开各自缓动，并部分重叠。
  // 桌面与平板：每一帧都是整组的同一次旋转 + 等比缩放 + 平移，色块间距始终成比例，不会重叠。
  // 手机：两列布局是把标志的四列「折叠」成两列。各块先竖向移动、再横向移动到两列位置
  // （home.css 中的 --mx/--my 按此设计，保证移动途中互不重叠）；位移随当前缩放同步放大。
  // 桌面上最终位置与标志网格一致，竖向、横向位移都为 0。
  function frame(block, logo, composition, t, grow, opacity, offset) {
    var turn = easeInOutCubic(clamp(t / TIMING.rotateEnd));
    var spread = easeInOutQuart(clamp((t - TIMING.expandStart) / (1 - TIMING.expandStart)));
    var foldY = easeInOutCubic(clamp((t - 0.42) / 0.24));
    var foldX = easeInOutCubic(clamp((t - 0.62) / 0.26));
    var angle = composition.tilt * (1 - turn);
    var unitPx = lerp(logo.scale * grow, block.unit, spread);
    var size = unitPx / block.unit; // 等比缩放，宽高比例不变
    // 该块在标志网格与最终布局中相对组合中心的偏移（最终像素），按当前缩放换算。
    var gridOffset = { x: block.offset.x * block.unit, y: block.offset.y * block.unit };
    var finalOffset = { x: block.center.x - logo.target.x, y: block.center.y - logo.target.y };
    var local = {
      x: lerp(gridOffset.x, finalOffset.x, foldX) * size,
      y: lerp(gridOffset.y, finalOffset.y, foldY) * size
    };
    var arm = rotate(local.x, local.y, angle);
    var x = lerp(logo.x, logo.target.x, spread) + arm.x;
    var y = lerp(logo.y, logo.target.y, spread) + arm.y;
    return {
      offset: offset,
      opacity: opacity,
      transform: "translate(" + round(x - block.center.x) + "px," + round(y - block.center.y) + "px) rotate(" + round(angle * 180 / Math.PI) + "deg) scale(" + size.toFixed(4) + ")"
    };
  }

  function reveal() {
    root.classList.add("intro-reveal");
    root.classList.remove("intro-hold");
  }

  function showSkip() {
    if (!skipButton) return;
    skipButton.hidden = false;
    skipButton.addEventListener("click", finish, { once: true });
  }

  function onKey(event) {
    if (event.key === "Tab" || event.key === "Shift") return;
    if (event.target === skipButton && (event.key === "Enter" || event.key === " ")) return; // 交给 click
    finish();
  }

  // 结束（自然结束、跳过、滚动、按键或窗口变化）：直接呈现最终首页。
  function finish() {
    if (done) return;
    done = true;
    timers.forEach(window.clearTimeout);
    animations.forEach(function (animation) { animation.cancel(); });
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("wheel", finish);
    window.removeEventListener("touchmove", finish);
    window.removeEventListener("resize", finish);
    var skipHadFocus = skipButton && document.activeElement === skipButton;
    if (skipButton) skipButton.hidden = true;
    reveal();
    root.classList.remove("intro", "intro-ready");
    window.clearTimeout(window.__introSafety);
    window.setTimeout(function () { root.classList.remove("intro-reveal"); }, 1400);
    try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch (error) { /* 隐私模式下忽略 */ }
    if (skipHadFocus) {
      var main = document.getElementById("main-content");
      if (main) main.focus({ preventScroll: true });
    }
  }

  function rotate(x, y, angle) {
    var cos = Math.cos(angle), sin = Math.sin(angle);
    return { x: x * cos - y * sin, y: x * sin + y * cos };
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(value) { return Math.min(1, Math.max(0, value)); }
  function round(value) { return Math.round(value * 100) / 100; }
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeInOutQuart(t) { return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2; }
}());
