/*
  首页的三件小事：

  1. 脉（.pulse）：左侧朱线从首屏底牵到页尾那句话，随滚动画到视口中线；
  2. 一排线（[data-threads]）：数据来自 home-threads-data.js，
     鼠标划过 / 手指按住滑动 / 左右方向键，逐项读出名字、地区、指数；
  3. 缝（.tl-window）：缝对到视口中间时，把时间长卷从水印提到正常浓度。

  不依赖任何库；数据没加载到时，线不画，读数区保留 HTML 里的静态文字。
*/
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ── 1. 脉 ─────────────────────────────────────────────── */
  var pulse = document.querySelector(".pulse");
  var hero = document.querySelector(".hero");
  var pulseEnd = document.querySelector("[data-pulse-end]");
  var main = document.querySelector("main");
  var pulseTop = 0;
  var pulseHeight = 0;
  var frame = 0;

  function pageTop(element) {
    return element.getBoundingClientRect().top + window.scrollY;
  }

  function measurePulse() {
    if (!pulse || !hero || !pulseEnd || !main) return;
    var mainTop = pageTop(main);
    pulseTop = pageTop(hero) + hero.offsetHeight;
    var end = pageTop(pulseEnd) + pulseEnd.offsetHeight / 2;
    pulseHeight = Math.max(0, end - pulseTop);
    pulse.style.setProperty("--pulse-top", (pulseTop - mainTop) + "px");
    pulse.style.setProperty("--pulse-height", pulseHeight + "px");
    drawPulse();
  }

  function drawPulse() {
    frame = 0;
    if (!pulse || !pulseHeight) return;
    var progress = 1;
    if (!reduceMotion.matches) {
      var reach = window.scrollY + window.innerHeight * 0.55 - pulseTop;
      progress = Math.min(1, Math.max(0, reach / pulseHeight));
    }
    pulse.style.setProperty("--pulse-progress", progress.toFixed(4));
    pulse.style.setProperty("--pulse-done", progress >= 0.999 ? "1" : "0");
  }

  function requestDraw() {
    if (!frame) frame = window.requestAnimationFrame(drawPulse);
  }

  if (pulse) {
    window.addEventListener("scroll", requestDraw, { passive: true });
    window.addEventListener("resize", measurePulse);
    window.addEventListener("load", measurePulse);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measurePulse).catch(function () {});
    if (window.ResizeObserver && main) new ResizeObserver(measurePulse).observe(main);
    measurePulse();
  }

  /* ── 2. 一排线 ───────────────────────────────────── */
  var LEVELS = ["活力良好", "脆弱", "中度濒危", "高度濒危", "极度濒危"];
  function levelOf(score) {
    return Math.min(4, Math.floor(score / 20));
  }

  var box = document.querySelector("[data-threads]");
  var data = window.HOME_THREADS;
  if (box && data && data.length) {
    var field = box.querySelector(".threads__field");
    var read = box.querySelector(".threads__read");
    var nameEl = box.querySelector(".threads__name");
    var metaEl = box.querySelector(".threads__meta");
    var scoreEl = box.querySelector(".threads__score b");
    var levelEl = box.querySelector(".threads__score span");
    var highEl = document.querySelector("[data-threads-high]");
    var lines = [];
    var current = -1;

    var fragment = document.createDocumentFragment();
    data.forEach(function (row, index) {
      var line = document.createElement("i");
      var score = row[3];
      // 分数越高，剩下的线越短：10 分约九成长，96 分不到两成
      line.style.setProperty("--len", (100 - score * 0.86).toFixed(1) + "%");
      line.style.setProperty("--i", index);
      line.setAttribute("data-level", levelOf(score));
      lines.push(line);
      fragment.appendChild(line);
    });
    field.appendChild(fragment);
    field.setAttribute("aria-valuemax", data.length);

    if (highEl) {
      highEl.textContent = data.filter(function (row) { return row[3] >= 60; }).length;
    }

    var select = function (index) {
      index = Math.min(data.length - 1, Math.max(0, index));
      if (index === current) return;
      if (current > -1) lines[current].classList.remove("is-on");
      current = index;
      lines[index].classList.add("is-on");
      var row = data[index];
      var level = levelOf(row[3]);
      nameEl.textContent = row[0];
      metaEl.textContent = row[1] + "，" + row[2];
      scoreEl.textContent = row[3];
      levelEl.textContent = LEVELS[level];
      read.setAttribute("data-level", level);
      field.setAttribute("aria-valuenow", index + 1);
      field.setAttribute("aria-valuetext", row[0] + "，" + row[2] + "，指数 " + row[3] + "，" + LEVELS[level]);
    };

    var pick = function (event) {
      var rect = field.getBoundingClientRect();
      if (!rect.width) return;
      select(Math.floor((event.clientX - rect.left) / rect.width * data.length));
    };

    field.addEventListener("pointermove", pick);
    field.addEventListener("pointerdown", pick);
    field.addEventListener("keydown", function (event) {
      var step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 }[event.key];
      if (step) select(current + step);
      else if (event.key === "Home") select(0);
      else if (event.key === "End") select(data.length - 1);
      else return;
      event.preventDefault();
    });

    select(data.length - 1);

    if (window.IntersectionObserver && !reduceMotion.matches) {
      var drawn = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        box.classList.add("is-drawn");
        drawn.disconnect();
      }, { threshold: 0.35 });
      drawn.observe(field);
    } else {
      box.classList.add("is-drawn");
    }
  }

  /* ── 3. 缝与首屏 ───────────────────────────────────────── */
  var layer = document.querySelector(".tl-layer");
  var windows = document.querySelectorAll(".tl-window");
  if (window.IntersectionObserver) {
    if (layer && windows.length) {
      var open = new Set();
      // 只看视口正中那一条：缝压到中线时才算打开
      var watcher = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) open.add(entry.target);
          else open.delete(entry.target);
        });
        layer.classList.toggle("is-window", open.size > 0);
      }, { rootMargin: "-38% 0px -38% 0px" });
      windows.forEach(function (item) { watcher.observe(item); });
    }
    if (hero) {
      new IntersectionObserver(function (entries) {
        root.classList.toggle("is-on-hero", entries[0].isIntersecting);
      }, { threshold: 0.25 }).observe(hero);
    }
  }
}());
