/*
  站点鼠标指针皮肤（仅在本站内生效）—— 打铁花 · 铁水勺。
  触屏没有鼠标指针：皮肤不挂到全站，只在「换一支指针」页轻点图片时打一次铁花（ZCCursor.burst）。
  平时勺里盛一汪铁水，勺嘴尖就是指针位置；悬停时另一根击棍举起轻晃；按下时击棍砸下，火星四溅。
*/
(function () {
  "use strict";
  if (window.__ZC_CURSOR_LOADED__) return;
  window.__ZC_CURSOR_LOADED__ = true;

  var KEY = "zc-cursor";
  var root = null;
  var pointer = { x: -100, y: -100 };
  var frame = 0;
  var resetTimer = 0;
  var touchOnly = window.matchMedia("(hover: none)");
  var topDialog = null;

  // 原生弹窗（dialog.showModal）在浏览器顶层，z-index 盖不过它。
  // 指针也做成 popover 放进顶层；每打开一个弹窗，就把指针重新提到最上面。
  function raise() {
    if (!root || !root.showPopover) return;
    try {
      if (root.matches(":popover-open")) root.hidePopover();
      root.showPopover();
    } catch (e) { /* 不支持就维持原样 */ }
  }
  function syncLayer() {
    var open = document.querySelector("dialog[open]");
    if (open === topDialog) return;
    topDialog = open;
    raise();
  }

  function skin() { try { return localStorage.getItem(KEY) || ""; } catch (e) { return ""; } }
  function store(v) { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch (e) {} }
  function isInteractive(el) {
    return !!(el && el.closest && el.closest("a, button, input, select, textarea, label, summary, [role='button'], [role='slider'], .story-card"));
  }
  function place() { frame = 0; if (root) root.style.transform = "translate3d(" + pointer.x + "px," + pointer.y + "px,0)"; }

  function onMove(e) {
    pointer.x = e.clientX; pointer.y = e.clientY;
    if (root) syncLayer();
    if (!frame) frame = window.requestAnimationFrame(place);
    if (root) {
      root.classList.remove("is-hidden");
      root.classList.toggle("is-hover", isInteractive(e.target));
    }
  }

  function spray(host, count, scale, spread) {
    var burst = document.createElement("span");
    burst.className = "zc-spray";
    for (var i = 0; i < count; i += 1) {
      var s = document.createElement("i");
      var a = (spread[0] + Math.random() * spread[1]) * Math.PI / 180;
      var d = (24 + Math.random() * 48) * scale;
      s.style.setProperty("--dx", (Math.cos(a) * d).toFixed(1) + "px");
      s.style.setProperty("--dy", (Math.sin(a) * d).toFixed(1) + "px");
      s.style.setProperty("--fall", ((10 + Math.random() * 24) * scale).toFixed(1) + "px");
      s.style.animationDelay = (Math.random() * 40) + "ms";
      s.style.width = s.style.height = ((1.6 + Math.random() * 2.2) * Math.sqrt(scale)).toFixed(1) + "px";
      burst.appendChild(s);
    }
    host.appendChild(burst);
    window.setTimeout(function () { if (burst.parentNode) burst.parentNode.removeChild(burst); }, 760);
  }

  function sparks() {
    if (root) spray(root, 16, 1, [195, 80]);
  }

  // 在页面某一点单独打一次铁花，不依赖指针皮肤（触屏用）
  function burstAt(x, y, scale) {
    var host = document.createElement("span");
    host.className = "zc-burst";
    host.style.left = x + "px";
    host.style.top = y + "px";
    document.body.appendChild(host);
    spray(host, 24, scale || 1, [180, 180]);
    window.setTimeout(function () { if (host.parentNode) host.parentNode.removeChild(host); }, 800);
  }

  function onDown() {
    if (!root) return;
    root.classList.remove("is-strike");
    void root.offsetWidth;
    root.classList.add("is-strike");
    sparks();
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(function () { if (root) root.classList.remove("is-strike"); }, 300);
  }

  function build() {
    if (root) return;
    root = document.createElement("div");
    root.id = "zc-cursor";
    root.setAttribute("aria-hidden", "true");
    root.innerHTML =
      '<svg class="zc-wand" viewBox="0 0 48 48" width="48" height="48">' +
      '<g class="zc-ladle">' +
      '<circle class="zc-iron__glow" cx="12" cy="12" r="10.5" />' +
      '<path class="zc-ladle__handle" d="M21.3 17.7 43.05 37.95A3.6 3.6 0 0 1 37.95 43.05L17.7 21.3Z" />' +
      '<path class="zc-ladle__grain" d="M23.4 21.6 38.6 37.4" />' +
      '<path class="zc-ladle__collar" d="M20.7 16.5 23.5 19.3 19.3 23.5 16.5 20.7Z" />' +
      '<path class="zc-ladle__cup" d="M5 5 11.79 4.8A7.2 7.2 0 1 1 4.8 11.79Z" />' +
      '<circle class="zc-iron__pool" cx="12" cy="12" r="4.9" />' +
      '<circle class="zc-iron__core" cx="11" cy="11" r="1.9" />' +
      '<g class="zc-striker">' +
      '<path class="zc-striker__body" d="M10.40 33.24 32.59 17.02 29.99 13.47 7.80 29.69Z" />' +
      '<path class="zc-striker__grain" d="M11.45 30.61 29.77 17.23" />' +
      '<path class="zc-striker__cap" d="M8.50 35.06 10.93 33.29 7.92 29.17 5.50 30.94Z" />' +
      '<path class="zc-striker__cap" d="M32.47 17.54 34.89 15.77 31.89 11.65 29.46 13.42Z" />' +
      "</g></g></svg>";
    root.setAttribute("popover", "manual");
    document.body.appendChild(root);
    topDialog = null;
    syncLayer();
    raise();
    document.documentElement.classList.add("zc-cursor-on");
  }

  function destroy() {
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = null;
    document.documentElement.classList.remove("zc-cursor-on");
  }

  function enable(name) {
    document.documentElement.classList.remove("zc-cursor-on");
    if (name !== "hammer" || touchOnly.matches) { destroy(); return; }
    destroy(); build(); place();
  }

  function boot() {
    // 用 pointermove 而不是 mousemove：页面里的拖拽控件（如濒危光谱的拉条端点）在 pointerdown 上
    // preventDefault，浏览器会一直扣下 mousemove 直到松手，指针就会卡在按下的位置不动
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("mouseleave", function () { if (root) root.classList.add("is-hidden"); });
    // 鼠标进入 iframe（首页的非遗子页）后，外层收不到移动事件，指针会卡在边上；
    // 这时先藏起来，交给子页里的那一支
    document.addEventListener("mouseover", function (e) {
      if (root && e.target && e.target.tagName === "IFRAME") root.classList.add("is-hidden");
    });
    window.addEventListener("mouseout", function (e) {
      if (root && !e.relatedTarget) root.classList.add("is-hidden");
    });
    if (skin()) enable(skin());
    window.ZCCursor = {
      set: function (n) { store(n); enable(n); },
      current: skin,
      refresh: function () { enable(skin()); },
      burst: burstAt,
      touchOnly: function () { return touchOnly.matches; }
    };
    // 平板接上鼠标或拔掉时，跟着切换
    if (touchOnly.addEventListener) touchOnly.addEventListener("change", function () { enable(skin()); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}());
