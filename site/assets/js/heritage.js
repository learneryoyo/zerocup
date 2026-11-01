(() => {
  'use strict';
  const exhibition = document.querySelector('[data-heritage]');
  if (!exhibition) return;
  const gallery = exhibition.querySelector('.heritage-gallery');
  const cards = [...exhibition.querySelectorAll('[data-category]')];
  const pictures = [...gallery.querySelectorAll('.gallery-image')];
  const dotsBox = gallery.querySelector('.gallery-dots');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const base = 'assets/images/heritage/';
  const collections = {
    objects: { title: '天工开物 · 器物', seal: '壹', color: '#24478c', label: '传统手工艺', verse: '一器一世界', slides: [
      ["carousel/pottery.webp","陶艺"], ["carousel/umbrella.webp","油纸伞"], ["carousel/brocade.webp","云锦"], ["carousel/inkstone.webp","制作砚台"], ["carousel/bamboo.webp","竹编"]
    ] },
    opera: { title: '瓦舍勾栏 · 百戏', seal: '贰', color: '#a8352a', label: '戏曲音乐曲艺 · 舞蹈武术游艺', verse: '一腔唱古今', slides: [
      ["carousel/long-drum.webp","朝鲜族长鼓舞"], ["carousel/peking-opera.webp","京剧"], ["carousel/puppetry.webp","木偶戏"], ["carousel/yingge.webp","普宁英歌"], ["carousel/water-sleeves.webp","戏曲水袖"]
    ] },
    festival: { title: '四时有节 · 民俗', seal: '叁', color: '#2f7a68', label: '民俗节庆', verse: '一节聚人间', slides: [
      ["carousel/parade.webp","花车"], ["carousel/fire-dragon.webp","火龙灯舞"], ["carousel/miao.webp","苗族"], ["carousel/temple-fair.webp","庙会"], ["carousel/fish-lantern.webp","鱼灯"]
    ] },
    food: { title: '寻味山河 · 饮食', seal: '肆', color: '#8c6421', label: '饮食制作技艺', verse: '一味是故乡', slides: [
      ["carousel/peach-cake.webp","潮汕红桃粿"], ["carousel/dingsheng-cake.webp","定胜糕"], ["carousel/dragon-beard.webp","龙须酥"], ["carousel/qingtuan.webp","青团"], ["carousel/persimmon.webp","柿饼"], ["carousel/sugar-painting.webp","糖画"]
    ] }
  };
  let category = 'objects';
  let index = 0;
  let visible = 0;
  let request = 0;
  let timer;
  let userPaused = reducedMotion.matches;
  let hovered = false;
  let focused = false;
  let inView = true;
  const status = gallery.querySelector('.gallery-status');
  const cache = new Map();
  function load(src) {
    if (!cache.has(src)) {
      const promise = new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => { cache.delete(src); reject(new Error('Image unavailable')); };
        img.src = src;
      });
      cache.set(src, promise);
    }
    return cache.get(src);
  }
  // 圆点：只在分类切换时重建，数量跟随该分类的图片数
  function buildDots(key) {
    const slides = collections[key].slides;
    dotsBox.textContent = '';
    slides.forEach((slide, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'gallery-dot';
      dot.tabIndex = -1;
      dot.setAttribute('aria-label', `第 ${i + 1} 张，${slide[1]}`);
      dot.addEventListener('click', () => {
        if (i === index) return;
        show(category, i, i > index ? 'slide-next' : 'slide-prev');
      });
      dotsBox.append(dot);
    });
    dotsBox.dataset.for = key;
    syncDots();
  }
  function syncDots() {
    [...dotsBox.children].forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  }
  function schedule() {
    clearTimeout(timer);
    const single = collections[category].slides.length < 2;
    if (!single && !userPaused && !hovered && !focused && !document.hidden && inView) {
      timer = setTimeout(() => show(category, index + 1, 'slide-next', false), 3250);
    }
  }
  async function show(key, number, animation = 'fade-in', announce = true) {
    clearTimeout(timer);
    const ticket = ++request;
    const collection = collections[key];
    const selectedIndex = (number + collection.slides.length) % collection.slides.length;
    const slide = collection.slides[selectedIndex];
    gallery.setAttribute('aria-busy', 'true');
    try { await load(base + slide[0]); }
    catch {
      if (ticket !== request) return;
      gallery.removeAttribute('aria-busy');
      status.textContent = '这张图片暂时无法载入，已保留上一张。可通过入辑查看分类。';
      userPaused = true;
      schedule();
      return;
    }
    if (ticket !== request) return;
    category = key;
    index = selectedIndex;
    const incoming = pictures[1 - visible];
    const outgoing = pictures[visible];
    incoming.className = 'gallery-image';
    incoming.src = base + slide[0];
    incoming.alt = slide[1];
    incoming.removeAttribute('aria-hidden');
    incoming.classList.toggle('is-contained', Boolean(slide[2]));
    incoming.style.zIndex = '2';
    outgoing.style.zIndex = '1';
    outgoing.setAttribute('aria-hidden', 'true');
    // Restart the entry animation when alternating the two local image layers.
    void incoming.offsetWidth;
    incoming.classList.add('is-current');
    if (!reducedMotion.matches) incoming.classList.add(animation);
    outgoing.classList.remove('slide-next', 'slide-prev', 'fade-in');
    incoming.onanimationend = () => {
      if (ticket === request) outgoing.classList.remove('is-current');
    };
    if (reducedMotion.matches) outgoing.classList.remove('is-current');
    visible = 1 - visible;
    exhibition.style.setProperty('--active', collection.color);
    gallery.querySelector('.gallery-kicker').textContent = collection.verse;
    if (dotsBox.dataset.for !== key) buildDots(key);
    syncDots();
    cards.forEach(card => {
      const selected = card.dataset.category === category;
      card.classList.toggle('is-selected', selected);
      card.querySelector('button').setAttribute('aria-pressed', String(selected));
    });
    gallery.removeAttribute('aria-busy');
    if (announce) status.textContent = `${collection.title}，${slide[1]}，第 ${index + 1} 张，共 ${collection.slides.length} 张`;
    schedule();
  }
  function select(key) {
    if (key !== category || gallery.hasAttribute('aria-busy')) show(key, 0);
  }
  cards.forEach(card => {
    card.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') select(card.dataset.category); });
    card.addEventListener('focusin', () => select(card.dataset.category));
    card.querySelector('button').addEventListener('click', () => select(card.dataset.category));
  });
  document.querySelectorAll('[data-color]').forEach(link => link.addEventListener('click', () => select(link.dataset.color)));
  gallery.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') { hovered = true; schedule(); } });
  gallery.addEventListener('pointerleave', () => { hovered = false; schedule(); });
  gallery.addEventListener('focusin', () => { focused = true; schedule(); });
  gallery.addEventListener('focusout', event => { if (!gallery.contains(event.relatedTarget)) { focused = false; schedule(); } });
  gallery.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(category, index + (event.key === 'ArrowRight' ? 1 : -1), event.key === 'ArrowRight' ? 'slide-next' : 'slide-prev');
    }
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      userPaused = true;
      pictures[1 - visible].classList.remove('is-current');
    }
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);
  new IntersectionObserver(entries => { inView = entries[0].isIntersecting; schedule(); }).observe(gallery);
  buildDots(category);
  schedule();
})();
