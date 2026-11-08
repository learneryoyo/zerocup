/*
  站点鼠标指针皮肤（仅在本站内生效）—— 打铁花 · 铁水棍。
  平时前端盛一汪铁水；悬停时另一根击棍举起轻晃；按下时击棍砸下，火星四溅。
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

  function skin() { try { return localStorage.getItem(KEY) || ""; } catch (e) { return ""; } }
  function store(v) { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch (e) {} }
  function isInteractive(el) {
    return !!(el && el.closest && el.closest("a, button, input, select, textarea, label, summary, [role='button'], .story-card"));
  }
  function place() { frame = 0; if (root) root.style.transform = "translate3d(" + pointer.x + "px," + pointer.y + "px,0)"; }

  function onMove(e) {
    pointer.x = e.clientX; pointer.y = e.clientY;
    if (!frame) frame = window.requestAnimationFrame(place);
    if (root) {
      root.classList.remove("is-hidden");
      root.classList.toggle("is-hover", isInteractive(e.target));
    }
  }

  function sparks() {
    if (!root) return;
    var burst = document.createElement("span");
    burst.className = "zc-spray";
    for (var i = 0; i < 16; i += 1) {
      var s = document.createElement("i");
      var a = (195 + Math.random() * 80) * Math.PI / 180;
      var d = 24 + Math.random() * 48;
      s.style.setProperty("--dx", (Math.cos(a) * d).toFixed(1) + "px");
      s.style.setProperty("--dy", (Math.sin(a) * d).toFixed(1) + "px");
      s.style.setProperty("--fall", (10 + Math.random() * 24).toFixed(1) + "px");
      s.style.animationDelay = (Math.random() * 40) + "ms";
      s.style.width = s.style.height = (1.6 + Math.random() * 2.2).toFixed(1) + "px";
      burst.appendChild(s);
    }
    root.appendChild(burst);
    window.setTimeout(function () { if (burst.parentNode) burst.parentNode.removeChild(burst); }, 760);
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
      '<g class="zc-rod">' +
      '<path class="zc-rod__body" d="M4.6 4.4 L13.6 7.6 41.4 40.2 37.6 43.4 9.2 12.6Z" />' +
      '<path class="zc-rod__rim" d="M4.6 4.4 13.6 7.6 41.4 40.2" />' +
      '<path class="zc-rod__grain" d="M10.4 9.6 36.6 39.4" />' +
      '<g class="zc-iron">' +
      '<circle class="zc-iron__glow" cx="8.6" cy="8.4" r="8.6" />' +
      '<path class="zc-iron__pool" d="M4.4 7.4c.2-2.6 2.6-3.8 4.9-3 2.2.8 3 3 2.1 5-.9 2-3.2 2.6-5.2 1.8-1.7-.7-2.6-2.1-1.8-3.8z" />' +
      '<circle class="zc-iron__core" cx="8.6" cy="7.8" r="1.9" />' +
      "</g>" +
      '<g class="zc-striker">' +
      '<path class="zc-striker__body" d="M31.2 12.2 35.6 15.2 8.6 34.6 5.2 31.2Z" />' +
      '<path class="zc-striker__tip" d="M31.2 12.2 35.6 15.2" />' +
      "</g></g></svg>";
    document.body.appendChild(root);
    document.documentElement.classList.add("zc-cursor-on");
  }

  function destroy() {
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = null;
    document.documentElement.classList.remove("zc-cursor-on");
  }

  function enable(name) {
    document.documentElement.classList.remove("zc-cursor-on");
    if (name !== "hammer") { destroy(); return; }
    destroy(); build(); place();
  }

  function boot() {
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("mouseleave", function () { if (root) root.classList.add("is-hidden"); });
    if (skin()) enable(skin());
    window.ZCCursor = { set: function (n) { store(n); enable(n); }, current: skin, refresh: function () { enable(skin()); } };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}());
