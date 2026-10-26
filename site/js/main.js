/* main.js · 全站公共脚本
   只放"所有页面都要用"的东西。单个页面自己的逻辑，写在自己的 js 里。 */

/* 第一行就给 <html> 加 js 类。
   为什么：如果 CSS 里写了 .js .fade-in{opacity:0}，那 JS 挂了内容就永远看不见。
   先加这个类，再让 CSS 依赖它，特效失败时内容还在。
   —— 记住这条：特效可以失败，内容不能消失。 */
document.documentElement.classList.add('js');

/* 滚动进入视口才播的动画（需要的话自己用）
   用法：给元素加 class="reveal"，这里会自动接管。 */
(function () {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    // 老浏览器：直接显示，不做动画
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.25 });

  items.forEach(function (el) { io.observe(el); });
})();
