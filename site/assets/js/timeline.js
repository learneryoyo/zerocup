/*
  首页的时间轴图层。

  - 固定在视口正中，高度固定、不折叠；默认压在页面内容下面，只在空白处透出来；
  - 页面滚动时，轨道按页面滚动进度做横向位移，两者线性对应；
  - 唤出只认右上角那一枚标签（.tl-toggle）：点一下浮起，再点一下落回底层。
    桌面端和触屏同一套操作，不再有「悬停两端」这种只有鼠标才懂的手势；
  - 浮起后，点图层这一带任意位置也能收起，但不会点到底下的图片或链接；
  - 长卷图下载中先空着（is-art-pending），下完切到长卷，下载失败才退回线条版；
  - 开屏动画（intro 类）时自动浮起，动画结束自行落下；
  - 图层 pointer-events: none，不挡页面点击；收起时靠坐标判断点没点在带上。

  保守约束：故事子页或任何 dialog 打开时不响应标签；点链接、按钮、
  或拖选文字后的 click 都不算「点在这一带上」。
*/
(function () {
  "use strict";

  var layer = document.querySelector(".tl-layer");
  if (!layer) return;

  var track = layer.querySelector(".tl-layer__track");
  var railBar = layer.querySelector(".tl-layer__railBar");
  var art = layer.querySelector(".tl-layer__art");
  var artImg = layer.querySelector(".tl-layer__art-img");
  if (!track) return;

  var items = Array.prototype.slice.call(track.children);
  if (items.length < 3) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var toggle = document.querySelector(".tl-toggle");
  var toggleText = toggle ? toggle.querySelector("[data-tl-toggle-text]") : null;
  var centers = [];
  var travel = 0;
  var artWidth = 0;
  var viewWidth = 0;
  var active = -1;
  var scrollFrame = 0;
  var moveFrame = 0;
  var introActive = false;
  var pinned = false;
  var layerTop = 0;
  var layerBottom = 0;
  var artFailed = false;

  function measure() {
    viewWidth = layer.clientWidth;
    var box = layer.getBoundingClientRect();
    layerTop = box.top;
    layerBottom = box.bottom;
    // 长卷模式：图的宽度决定总行程，图和轨道共用同一个位移量。
    // 图没加载成功就退回原来的环带与文字，不会露出破图。
    if (art && artImg && artImg.complete && artImg.naturalWidth > 0) {
      art.removeAttribute("hidden");
      layer.classList.add("is-art");
      artWidth = art.getBoundingClientRect().width;
      track.style.width = artWidth + "px";
    } else {
      artWidth = 0;
      if (art) art.setAttribute("hidden", "");
      layer.classList.remove("is-art");
      track.style.removeProperty("width");
    }
    layer.classList.toggle("is-art-pending", !!(art && artImg && !artFailed && !artWidth));

    // 先定模式再量位置：长卷模式下节点是绝对定位的
    centers = items.map(function (item) {
      return item.offsetLeft + item.offsetWidth / 2;
    });
    var last = items[items.length - 1];
    var x = last.offsetLeft + last.offsetWidth;

    travel = Math.max(0, (artWidth || x) - viewWidth);
    update();
  }

  function progress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return 0;
    return Math.min(1, Math.max(0, window.scrollY / max));
  }

  function update() {
    scrollFrame = 0;
    var p = progress();
    var shift = -p * travel;
    track.style.transform = "translate3d(" + shift.toFixed(2) + "px,0,0)";
    if (art && artWidth) {
      art.style.transform = "translate3d(" + shift.toFixed(2) + "px,0,0)";
    }
    if (railBar) railBar.style.transform = "scaleX(" + p.toFixed(4) + ")";

    var middle = viewWidth / 2;
    var best = 0;
    var bestDistance = Infinity;

    for (var i = 0; i < items.length; i += 1) {
      var distance = Math.abs(centers[i] + shift - middle);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
      // 长卷模式下文字跟着画走，不做远近淡出
      if (artWidth) {
        items[i].style.removeProperty("opacity");
        items[i].style.removeProperty("transform");
        continue;
      }
      var closeness = Math.min(1, distance / (viewWidth * 0.5));
      items[i].style.opacity = Math.max(0.05, (1 - closeness) * 1.2).toFixed(3);
      if (reduceMotion.matches) {
        items[i].style.removeProperty("transform");
      } else {
        items[i].style.transform = "scale(" + (1 - 0.08 * closeness).toFixed(3) + ")";
      }
    }

    if (best !== active) {
      if (active > -1) items[active].classList.remove("is-active");
      items[best].classList.add("is-active");
      active = best;
    }
  }

  // 故事子页、灯箱、档案弹窗打开时，不响应标签
  function blocked() {
    if (document.body.classList.contains("is-story-open")) return true;
    return !!document.querySelector("dialog[open]");
  }

  function inBand(y) {
    return y >= layerTop - 6 && y <= layerBottom + 6;
  }

  // 标签上的字跟着展开态走，读屏读的是 aria-expanded
  function syncToggle(open) {
    if (!toggle) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (toggleText) toggleText.textContent = open ? "收起时间长卷" : "展开时间长卷";
  }

  function evaluate() {
    moveFrame = 0;

    // 上层有内容时保持现状：用户点开的时间轴，不会因为弹窗出现就自己收起
    if (blocked()) return;

    var raised = introActive || pinned;

    if (raised !== layer.classList.contains("is-raised")) {
      layer.classList.toggle("is-raised", raised);
    }
    layer.classList.toggle("is-pinned", pinned && raised);
    syncToggle(raised);
  }

  function requestEvaluate() {
    if (!moveFrame) moveFrame = window.requestAnimationFrame(evaluate);
  }

  function requestUpdate() {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(update);
  }

  function readIntro() {
    var html = document.documentElement;
    var body = document.body;
    introActive = html.classList.contains("intro") || html.classList.contains("is-intro") ||
      body.classList.contains("intro") || body.classList.contains("is-intro");
    requestEvaluate();
  }

  var resizeTimer = 0;
  function onResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(measure, 160);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);

  // 唯一的唤出入口：右上角那枚标签。桌面和触屏同一套操作。
  if (toggle) {
    toggle.addEventListener("click", function () {
      if (blocked()) return;
      pinned = !pinned;
      evaluate();
    });
  }

  // 浮起之后，点这一带任意位置也能收起。用捕获阶段拦下，免得同时点开底下的图片或链接；
  // 标签自己那一小块要让过去，否则它的点击先被这里吃掉。
  window.addEventListener("click", function (event) {
    if (!pinned || blocked()) return;
    var target = event.target;
    if (target && target.closest && target.closest(".tl-toggle")) return;
    if (!inBand(event.clientY)) return;
    event.preventDefault();
    event.stopPropagation();
    pinned = false;
    evaluate();
  }, true);

  if (window.MutationObserver) {
    var observer = new MutationObserver(readIntro);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measure).catch(function () {});
  }

  // 设计图可能比脚本晚到：加载完成或失败都重测一次，决定是否切到 is-art
  if (artImg) {
    artImg.addEventListener("load", measure);
    artImg.addEventListener("error", function () { artFailed = true; measure(); });
  }

  // 长卷图不占首屏带宽：页面加载完、或用户开始滚动 / 按下时再取。
  // 普通屏取 1 倍图（4044 宽），高清屏取 2 倍图（8088 宽），由 srcset 决定。
  // 没取到之前整条先空着（is-art-pending），取到后淡入。
  if (artImg && artImg.dataset && artImg.dataset.src) {
    var artKicked = false;
    var kickArt = function () {
      if (artKicked) return;
      artKicked = true;
      var start = function () {
        if (artImg.getAttribute("src")) return;
        if (artImg.dataset.sizes) artImg.setAttribute("sizes", artImg.dataset.sizes);
        if (artImg.dataset.srcset) artImg.setAttribute("srcset", artImg.dataset.srcset);
        artImg.setAttribute("src", artImg.dataset.src);
      };
      if (window.requestIdleCallback) window.requestIdleCallback(start, { timeout: 2000 });
      else window.setTimeout(start, 1000);
    };
    window.addEventListener("load", kickArt);
    window.addEventListener("scroll", kickArt, { passive: true, once: true });
    window.addEventListener("pointerdown", kickArt, { passive: true, once: true });
  }

  window.addEventListener("load", measure);

  measure();
  readIntro();
}());
