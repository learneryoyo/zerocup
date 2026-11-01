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
