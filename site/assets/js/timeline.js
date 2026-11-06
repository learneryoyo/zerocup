/*
  首页的时间轴图层。

  - 固定在视口正中，高度固定、不折叠；默认压在页面内容下面，只在空白处透出来；
  - 页面滚动时，轨道按页面滚动进度做横向位移，两者线性对应；
  - 只有三种情况升到内容之上：鼠标停在左右两端、点击这一带、开屏动画（intro 类）；
  - 右上角的赭红方块是退出键，点击后落回底层；
  - 图层 pointer-events: none，不挡页面点击；悬停位置用坐标判断。

  保守约束：故事子页或任何 dialog 打开时不响应悬停；点击链接、按钮、
  或拖选文字后的 click 都不算「点击这一带」。
*/
(function () {
  "use strict";

  var layer = document.querySelector(".tl-layer");
  if (!layer) return;

  var track = layer.querySelector(".tl-layer__track");
  var railBar = layer.querySelector(".tl-layer__railBar");
  if (!track) return;

  var items = Array.prototype.slice.call(track.children);
  if (items.length < 3) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var centers = [];
  var travel = 0;
  var viewWidth = 0;
  var active = -1;
  var scrollFrame = 0;
  var moveFrame = 0;
  var END_ZONE = 180;
  var pointer = { x: 0, y: -1 };
  var introActive = false;
  var pinned = false;
  var suppressed = false;
  var layerTop = 0;
  var layerBottom = 0;

  function measure() {
    viewWidth = layer.clientWidth;
    var box = layer.getBoundingClientRect();
    layerTop = box.top;
    layerBottom = box.bottom;
    var widths = items.map(function (item) { return item.offsetWidth; });
    var x = 0;
    centers = widths.map(function (width) {
      var center = x + width / 2;
      x += width;
      return center;
    });
    travel = Math.max(0, x - viewWidth);
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
    if (railBar) railBar.style.width = (p * 100).toFixed(2) + "%";

    var middle = viewWidth / 2;
    var best = 0;
    var bestDistance = Infinity;

    for (var i = 0; i < items.length; i += 1) {
      var distance = Math.abs(centers[i] + shift - middle);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
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

  function overImage(x, y) {
    var element = document.elementFromPoint(x, y);
    if (!element || !element.closest) return false;
    return !!element.closest(".story-card, img");
  }

  // 故事子页、灯箱、档案弹窗打开时，不去抢悬停
  function blocked() {
    if (document.body.classList.contains("is-story-open")) return true;
    return !!document.querySelector("dialog[open]");
  }

  function inBand(y) {
    return y >= layerTop - 6 && y <= layerBottom + 6;
  }

  function evaluate() {
    moveFrame = 0;

    if (blocked()) {
      // 上层有内容时不改变状态：hover 抬起的先放下去，手动固定的保持
      if (!introActive && !pinned && layer.classList.contains("is-raised")) {
        layer.classList.remove("is-raised");
      }
      return;
    }

    var inside = inBand(pointer.y);

    var nearEnd = inside &&
      (pointer.x <= END_ZONE || pointer.x >= window.innerWidth - END_ZONE);

    var raised = introActive || (!suppressed && (pinned || nearEnd));

    if (raised !== layer.classList.contains("is-raised")) {
      layer.classList.toggle("is-raised", raised);
    }
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

  window.addEventListener("mousemove", function (event) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    // 只有指针真的离开这一带，才解除退出后的压制
    if (!inBand(event.clientY)) suppressed = false;
    requestEvaluate();
  }, { passive: true });

  document.addEventListener("mouseleave", function () {
    pointer.y = -1;
    suppressed = false;
    requestEvaluate();
  });

  window.addEventListener("blur", function () {
    pointer.y = -1;
    suppressed = false;
    requestEvaluate();
  });

  // 点击这一带 → 上浮并保持；右上角的赭红方块 → 落回底层
  var exitButton = layer.querySelector(".tl-layer__exit");
  if (exitButton) {
    exitButton.addEventListener("click", function (event) {
      event.stopPropagation();
      pinned = false;
      suppressed = true;
      requestEvaluate();
    });
  }

  var INTERACTIVE = "a, button, input, select, textarea, label, summary, [role='button']";

  window.addEventListener("click", function (event) {
    var target = event.target;
    if (target && target.closest) {
      if (target.closest(".tl-layer")) return;
      if (target.closest(INTERACTIVE)) return;
    }
    if (blocked()) return;
    if (!inBand(event.clientY)) return;
    if (overImage(event.clientX, event.clientY)) return;
    var selection = window.getSelection ? String(window.getSelection()) : "";
    if (selection.length) return;
    pinned = true;
    suppressed = false;
    requestEvaluate();
  });

  if (window.MutationObserver) {
    var observer = new MutationObserver(readIntro);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measure).catch(function () {});
  }
  window.addEventListener("load", measure);

  measure();
  readIntro();
}());
