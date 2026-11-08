/* 有指针皮肤时，子页也挂上同一支指针（样式 + 脚本）。
   首页把子页嵌在 iframe 里，外层的指针进不来，所以子页得自己画。 */
(function () {
  "use strict";
  var me = document.currentScript;
  if (!me || !me.src) return;
  var skin = "";
  try { skin = localStorage.getItem("zc-cursor") || ""; } catch (e) { return; }
  if (!skin) return;
  var css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = me.src.replace(/js\/heritage-story\.js(\?.*)?$/, "css/cursor.css");
  document.head.appendChild(css);
  var js = document.createElement("script");
  js.src = me.src.replace(/heritage-story\.js(\?.*)?$/, "cursor.js");
  js.defer = true;
  document.head.appendChild(js);
}());

/* iframe 内的 Escape 与焦点边界。独立打开时不拦截浏览器默认行为。 */
(function () {
  "use strict";
  if (window.parent === window) return;
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") window.parent.postMessage("heritage:close", "*");
    if (event.key !== "Tab") return;
    var elements = Array.from(document.querySelectorAll('a[href], button, input, select, textarea, [tabindex="0"]'))
      .filter(function (element) { return !element.disabled && element.getClientRects().length; });
    var first = elements[0];
    var last = elements[elements.length - 1];
    if (!elements.length || (!event.shiftKey && event.target === last) || (event.shiftKey && event.target === first)) {
      event.preventDefault();
      window.parent.postMessage("heritage:focus-controls", "*");
    }
  });
}());
