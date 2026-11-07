(() => {
  "use strict";

  const scene = document.querySelector(".heritage-scroll__scene");
  const background = scene?.querySelector(".scroll-scene");
  const parallax = scene?.querySelector(".heritage-scroll__parallax");
  const copy = scene?.querySelector(".heritage-scroll__copy");
  const figures = [...document.querySelectorAll(".heritage-scroll__hotspot:not([data-random-explore])")];
  const swatches = [...document.querySelectorAll("[data-scroll-color]")];
  if (!scene || !parallax || figures.length === 0) return;

  // 景深视差：底图和人物抠像在同一个容器里整体移动，层间永不分离。
  // 卷首语反向微动，制造前后景的纵深。
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  function render() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    parallax.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
    if (copy) copy.style.transform = `translate3d(${(-currentX * 0.35).toFixed(2)}px, ${(-currentY * 0.35).toFixed(2)}px, 0)`;
    if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
      frame = requestAnimationFrame(render);
    } else {
      frame = 0;
    }
  }

  function queueRender() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  if (!reducedMotion.matches) {
    scene.addEventListener("pointermove", (event) => {
      const rect = scene.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * -16;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * -9;
      queueRender();
    });
    scene.addEventListener("pointerleave", () => {
      targetX = 0;
      targetY = 0;
      queueRender();
    });
  }

  // 保持一个低调的选中反馈：悬停或键盘聚焦时，把对应色块变成分类色。
  function activate(category) {
    swatches.forEach((swatch) => {
      const active = swatch.dataset.scrollColor === category;
      swatch.style.color = active ? "var(--c)" : "";
      swatch.style.fontWeight = active ? "700" : "";
    });
  }

  figures.forEach((figure) => {
    figure.addEventListener("pointerenter", () => activate(figure.dataset.category));
    figure.addEventListener("focusin", () => activate(figure.dataset.category));
  });
  scene.addEventListener("pointerleave", () => activate(""));
  scene.addEventListener("focusout", () => activate(""));

  const randomButton = document.querySelector("[data-random-explore]");
  if (randomButton) {
    randomButton.addEventListener("click", (event) => {
      event.preventDefault();
      const targets = figures.map((figure) => figure.getAttribute("href"));
      const next = targets[Math.floor(Math.random() * targets.length)];
      window.location.href = next;
    });
  }
})();
