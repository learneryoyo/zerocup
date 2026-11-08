/* 首页容器只负责交互；各非遗的内容、CSS 留在独立 HTML 中。 */
(function () {
  "use strict";

  /* 有指针皮肤时，按 site.js 的位置加载 cursor.js */
  (function () {
    var me = document.currentScript;
    if (!me || !me.src) return;
    var skin = "";
    try { skin = localStorage.getItem("zc-cursor") || ""; } catch (e) { return; }
    if (!skin) return;
    var el = document.createElement("script");
    el.src = me.src.replace(/site\.js(\?.*)?$/, "cursor.js");
    el.defer = true;
    document.head.appendChild(el);
  }());

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".primary-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function () {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* 导航「更多」：点击开合，点外部或 Esc 收起；桌面悬停交给 CSS */
  var more = document.querySelector(".nav-more");
  var moreBtn = more && more.querySelector(".nav-more-btn");
  if (moreBtn && more.querySelector(".nav-more-panel")) {
    var setMore = function (open) {
      more.classList.toggle("is-open", open);
      moreBtn.setAttribute("aria-expanded", String(open));
    };
    moreBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      setMore(!more.classList.contains("is-open"));
    });
    document.addEventListener("click", function (event) {
      if (!more.contains(event.target)) setMore(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && more.classList.contains("is-open")) {
        setMore(false);
        moreBtn.focus();
      }
    });
  }
  var overlay = document.querySelector(".story-overlay");
  if (!overlay) return;

  var shell = overlay.querySelector(".story-shell");
  var frame = overlay.querySelector(".story-frame");
  var title = overlay.querySelector("#story-dialog-title");
  var fullButton = overlay.querySelector("[data-story-fullscreen]");
  var closeButton = overlay.querySelector("button[data-story-close]");
  var activeCard = null;
  var closing = false;
  var timer = null;
  var background = Array.from(document.body.children).filter(function (element) {
    return element !== overlay && element.tagName !== "SCRIPT";
  });

  // 关闭态直接移出渲染树，别让固定层和模糊背景留在页面里（残影来源）。
  overlay.classList.add("is-idle");

  function setBackgroundInert(value) {
    background.forEach(function (element) { element.inert = value; });
  }

  function setOrigin(card) {
    var rect = card.getBoundingClientRect();
    // 读取真实布局尺寸，与 CSS 断点保持一致，无需重复维护宽高比例。
    var width = shell.offsetWidth;
    var height = shell.offsetHeight;
    shell.style.setProperty("--shift-x", rect.left + rect.width / 2 - window.innerWidth / 2 + "px");
    shell.style.setProperty("--shift-y", rect.top + rect.height / 2 - window.innerHeight / 2 + "px");
    // 起始略小于卡片，向四周展开到最终阅读区域。
    var scale = Math.min(rect.width / width, rect.height / height, 0.72);
    shell.style.setProperty("--scale-x", scale);
    shell.style.setProperty("--scale-y", scale);
  }

  function resetFullscreen() {
    overlay.classList.remove("is-fullscreen");
    fullButton.setAttribute("aria-label", "全屏查看");
    fullButton.setAttribute("title", "全屏查看");
    fullButton.setAttribute("aria-pressed", "false");
  }

  function openStory(card) {
    if (activeCard) return;
    window.clearTimeout(timer);
    activeCard = card;
    closing = false;
    resetFullscreen();
    // 先回到渲染树，否则量不到弹层尺寸（display: none 时 offsetWidth 为 0）。
    overlay.classList.remove("is-idle");
    setOrigin(card);
    title.textContent = card.dataset.storyTitle || "非遗子页";
    frame.title = title.textContent + " · 独立子页";
    frame.src = card.href;
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-story-open");
    setBackgroundInert(true);
    // 强制应用起始位置，再开始展开。
    void shell.offsetWidth;
    overlay.classList.add("is-open");
    closeButton.focus();
  }

  function closeStory() {
    if (!activeCard || closing) return;
    closing = true;
    setOrigin(activeCard);
    overlay.classList.remove("is-open");
    var delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 520;
    timer = window.setTimeout(function () {
      var previousCard = activeCard;
      overlay.setAttribute("aria-hidden", "true");
      // 动画走完再整层收起；全屏状态也在隐藏后复位，下一次展开量到的一定是最终宽度。
      overlay.classList.add("is-idle");
      resetFullscreen();
      shell.style.removeProperty("--shift-x");
      shell.style.removeProperty("--shift-y");
      shell.style.removeProperty("--scale-x");
      shell.style.removeProperty("--scale-y");
      frame.removeAttribute("src");
      document.body.classList.remove("is-story-open");
      setBackgroundInert(false);
      activeCard = null;
      closing = false;
      previousCard.focus({ preventScroll: true });
    }, delay);
  }

  document.querySelectorAll("[data-story-url]").forEach(function (card) {
    card.addEventListener("click", function (event) {
      // 保留新标签打开、复制链接和禁用 JS 时的独立页面访问能力。
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openStory(card);
    });
  });

  overlay.querySelectorAll("[data-story-close]").forEach(function (button) {
    button.addEventListener("click", closeStory);
  });
  fullButton.addEventListener("click", function () {
    if (closing) return;
    var full = overlay.classList.toggle("is-fullscreen");
    var label = full ? "退出全屏" : "全屏查看";
    fullButton.setAttribute("aria-label", label);
    fullButton.setAttribute("title", label);
    fullButton.setAttribute("aria-pressed", String(full));
  });

  document.addEventListener("keydown", function (event) {
    if (!activeCard) return;
    if (event.key === "Escape") closeStory();
    if (event.key === "Tab" && event.shiftKey && document.activeElement === fullButton) {
      event.preventDefault();
      frame.focus();
    }
  });
  // 旧浏览器不支持 inert 时，焦点仍留在阅读容器内。
  document.addEventListener("focusin", function (event) {
    if (activeCard && !overlay.contains(event.target)) closeButton.focus();
  });
  // iframe 有独立的键盘事件；仅接受当前子页发来的关闭消息（兼容 file://）。
  window.addEventListener("message", function (event) {
    if (event.source === frame.contentWindow && event.data === "heritage:close") closeStory();
    if (event.source === frame.contentWindow && event.data === "heritage:focus-controls") fullButton.focus();
  });
}());
