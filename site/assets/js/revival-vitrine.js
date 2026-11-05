/* 叩启新生：六座玻璃展柜排成 2×3，叩三次碎开。展品暂留空，以后放进 .vt-slot。 */
(() => {
  'use strict';

  const stage = document.getElementById('vitrines');
  const reset = document.getElementById('vitrine-reset');
  if (!stage || !reset) return;

  const COUNT = 6;
  // 叠层画布 330×392 与 vitrine.png 同比例；PANE 是展柜正面玻璃的范围。
  const PANE = { l: 34, t: 32, r: 296, b: 336 };
  const GROUND = 372;
  const NS = 'http://www.w3.org/2000/svg';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const rand = (min, max) => min + Math.random() * (max - min);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const round = value => Math.round(value * 10) / 10;

  const CASE_IMG = '<img class="vt-case" src="assets/images/revival/vitrine.png" alt="" draggable="false">';

  const GLASS_SVG = `
    <svg class="vt-glass" viewBox="0 0 330 392" aria-hidden="true">
      <g class="vt-dots"><rect x="210" y="350" width="6" height="6"/><rect x="222" y="350" width="6" height="6"/><rect x="234" y="350" width="6" height="6"/></g>
      <rect class="vt-pane" x="${PANE.l}" y="${PANE.t}" width="${PANE.r - PANE.l}" height="${PANE.b - PANE.t}" fill="url(#vt-tint)"/>
      <g class="vt-cracks"></g>
      <g class="vt-debris"></g>
      <g class="vt-shards"></g>
      <g class="vt-fx"></g>
    </svg>`;

  const DEFS = `
    <svg class="vt-defs" width="0" height="0" aria-hidden="true"><defs>
      <linearGradient id="vt-tint" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity=".03"/></linearGradient>
      <linearGradient id="vt-shard" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#f3e3c8" stop-opacity=".5"/></linearGradient>
    </defs></svg>`;

  const svgEl = (name, attrs = {}) => {
    const node = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  };

  // 从 (x, y) 长出一条折线裂纹，碰到玻璃边缘就停。
  function ray(x, y, angle, length) {
    const steps = Math.max(2, Math.ceil(length / 30));
    let d = `M${round(x)} ${round(y)}`;
    for (let i = 0; i < steps; i++) {
      angle += rand(-0.34, 0.34);
      const step = length / steps * rand(0.75, 1.25);
      x += Math.cos(angle) * step;
      y += Math.sin(angle) * step;
      const hitEdge = x < PANE.l || x > PANE.r || y < PANE.t || y > PANE.b;
      x = clamp(x, PANE.l, PANE.r);
      y = clamp(y, PANE.t, PANE.b);
      d += ` L${round(x)} ${round(y)}`;
      if (hitEdge) break;
    }
    return { d, x, y, angle };
  }

  // 蛛网横纹：同一圈上隔段连线，不连成完整的环。
  function web(point, radius) {
    const parts = [];
    const count = 10;
    const start = rand(0, Math.PI * 2);
    for (let i = 0; i < count; i++) {
      if (Math.random() < 0.42) continue;
      const a1 = start + i / count * Math.PI * 2;
      const a2 = a1 + Math.PI * 2 / count;
      const r1 = radius * rand(0.82, 1.16);
      const r2 = radius * rand(0.82, 1.16);
      const x1 = clamp(point.x + Math.cos(a1) * r1, PANE.l, PANE.r);
      const y1 = clamp(point.y + Math.sin(a1) * r1, PANE.t, PANE.b);
      const x2 = clamp(point.x + Math.cos(a2) * r2, PANE.l, PANE.r);
      const y2 = clamp(point.y + Math.sin(a2) * r2, PANE.t, PANE.b);
      parts.push(`M${round(x1)} ${round(y1)} L${round(x2)} ${round(y2)}`);
    }
    return parts;
  }

  function drawCracks(cab, list) {
    list.forEach((d, index) => {
      const path = svgEl('path', { d, pathLength: 1 });
      path.style.animationDelay = `${index * 8}ms`;
      cab.cracks.append(path);
    });
  }

  function firstHit(cab, point) {
    const count = 6;
    const list = [];
    for (let i = 0; i < count; i++) {
      const line = ray(point.x, point.y, i / count * Math.PI * 2 + rand(-0.3, 0.3), rand(38, 92));
      cab.tips.push(line);
      list.push(line.d);
    }
    drawCracks(cab, list);
  }

  function secondHit(cab, point) {
    const list = [];
    cab.tips.forEach(tip => list.push(ray(tip.x, tip.y, tip.angle, rand(70, 170)).d));
    for (let i = 0; i < 9; i++) {
      list.push(ray(point.x, point.y, i / 9 * Math.PI * 2 + rand(-0.25, 0.25), rand(90, 240)).d);
    }
    list.push(...web(point, 46), ...web(point, 92));
    drawCracks(cab, list);
  }

  // 按矩形裁剪多边形（Sutherland–Hodgman）。
  function clipToPane(points) {
    const edges = [
      [p => p.x >= PANE.l, (a, b) => ({ x: PANE.l, y: a.y + (b.y - a.y) * (PANE.l - a.x) / (b.x - a.x) })],
      [p => p.x <= PANE.r, (a, b) => ({ x: PANE.r, y: a.y + (b.y - a.y) * (PANE.r - a.x) / (b.x - a.x) })],
      [p => p.y >= PANE.t, (a, b) => ({ x: a.x + (b.x - a.x) * (PANE.t - a.y) / (b.y - a.y), y: PANE.t })],
      [p => p.y <= PANE.b, (a, b) => ({ x: a.x + (b.x - a.x) * (PANE.b - a.y) / (b.y - a.y), y: PANE.b })]
    ];
    return edges.reduce((input, [inside, cross]) => {
      const output = [];
      input.forEach((point, i) => {
        const prev = input[(i + input.length - 1) % input.length];
        if (inside(point)) {
          if (!inside(prev)) output.push(cross(prev, point));
          output.push(point);
        } else if (inside(prev)) {
          output.push(cross(prev, point));
        }
      });
      return output;
    }, points);
  }

  const area = points => Math.abs(points.reduce((sum, p, i) => {
    const q = points[(i + 1) % points.length];
    return sum + p.x * q.y - q.x * p.y;
  }, 0)) / 2;

  // 以最后一击为中心，把玻璃切成放射状的碎片。
  function shards(point) {
    const spokes = 13;
    const radii = [0, 34, 88, 170, 300, 760];
    const angles = Array.from({ length: spokes }, (_, i) => i / spokes * Math.PI * 2 + rand(-0.12, 0.12));
    const grid = radii.map((radius, ring) => angles.map(angle => {
      const r = ring === radii.length - 1 ? radius : radius * rand(0.84, 1.16);
      return { x: point.x + Math.cos(angle) * r, y: point.y + Math.sin(angle) * r };
    }));
    const pieces = [];
    for (let ring = 0; ring < radii.length - 1; ring++) {
      for (let spoke = 0; spoke < spokes; spoke++) {
        const next = (spoke + 1) % spokes;
        const clipped = clipToPane([grid[ring][spoke], grid[ring][next], grid[ring + 1][next], grid[ring + 1][spoke]]);
        if (clipped.length >= 3 && area(clipped) > 12) pieces.push(clipped);
      }
    }
    return pieces;
  }

  function shatter(cab, point) {
    cab.root.classList.add('is-open');
    cab.pane.remove();
    cab.cracks.replaceChildren();
    cab.button.setAttribute('aria-label', `第 ${cab.index + 1} 座展柜已打开，展品待补`);
    updateReset();
    addDebris(cab);
    if (reduced.matches) return;

    cab.root.classList.add('is-shattering');
    let longest = 0;
    shards(point).forEach(points => {
      const center = points.reduce((sum, p) => ({ x: sum.x + p.x / points.length, y: sum.y + p.y / points.length }), { x: 0, y: 0 });
      const touchesEdge = points.some(p => p.x <= PANE.l || p.x >= PANE.r || p.y <= PANE.t || p.y >= PANE.b);
      const shard = svgEl('polygon', { points: points.map(p => `${round(p.x)},${round(p.y)}`).join(' ') });
      if (touchesEdge && area(points) < 2600 && Math.random() < 0.45) {
        // 贴着框的小块留下来，像没掉干净的残片。
        shard.classList.add('is-stuck');
        cab.debris.append(shard);
        return;
      }
      cab.shards.append(shard);
      const dx = center.x - point.x;
      const dy = center.y - point.y;
      const dist = Math.hypot(dx, dy) || 1;
      const burst = rand(10, 36);
      const fallX = dx / dist * rand(24, 84);
      const fallY = GROUND - center.y + rand(-8, 8);
      const spin = rand(-260, 260);
      const delay = dist * 0.55;
      const duration = rand(640, 920) + fallY * 0.2;
      longest = Math.max(longest, delay + duration);
      shard.animate([
        { transform: 'translate(0, 0) rotate(0deg)', opacity: 1, easing: 'cubic-bezier(.2,.7,.4,1)' },
        { transform: `translate(${round(dx / dist * burst)}px, ${round(dy / dist * burst)}px) rotate(${round(spin * 0.1)}deg)`, opacity: 1, offset: 0.14, easing: 'cubic-bezier(.5,0,.9,.5)' },
        { transform: `translate(${round(fallX)}px, ${round(fallY)}px) rotate(${round(spin)}deg)`, opacity: 0.9, offset: 0.88 },
        { transform: `translate(${round(fallX)}px, ${round(fallY)}px) rotate(${round(spin)}deg)`, opacity: 0 }
      ], { duration, delay, fill: 'both' }).onfinish = () => shard.remove();
    });
    window.setTimeout(() => cab.root.classList.remove('is-shattering'), longest + 40);
  }

  // 橱窗底板上留一点碎玻璃。
  function addDebris(cab) {
    for (let i = 0; i < 16; i++) {
      const x = rand(44, 286);
      const y = rand(322, 333);
      const size = rand(4, 12);
      const shard = svgEl('polygon', {
        class: 'vt-crumb',
        points: `${round(x)},${round(y)} ${round(x + size)},${round(y + rand(-3, 3))} ${round(x + rand(0, size))},${round(y + size * 0.6)}`
      });
      shard.style.animationDelay = `${rand(320, 620) | 0}ms`;
      cab.debris.append(shard);
    }
  }

  function impactPoint(cab, event) {
    // 键盘触发没有坐标，落在玻璃中部。
    if (event.detail > 0) {
      const matrix = cab.glass.getScreenCTM();
      if (matrix) {
        const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
        if (point.x > PANE.l && point.x < PANE.r && point.y > PANE.t && point.y < PANE.b) {
          return { x: point.x, y: point.y };
        }
      }
    }
    return { x: rand(120, 210), y: rand(110, 240) };
  }

  function flash(cab, point, size) {
    const ring = svgEl('circle', { cx: round(point.x), cy: round(point.y), r: size, class: 'vt-flash' });
    cab.fx.append(ring);
    ring.animate([
      { transform: 'scale(.2)', opacity: 0.95 },
      { transform: 'scale(1)', opacity: 0 }
    ], { duration: 300, easing: 'ease-out' }).onfinish = () => ring.remove();
  }

  function mallet(cab, point) {
    const group = svgEl('g', { transform: `translate(${round(point.x)} ${round(point.y)})` });
    const body = svgEl('g', { class: 'vt-mallet' });
    body.innerHTML = '<path d="M34-33 118-134l11 9L44-24z" fill="#a9754a" stroke="#5e3b24" stroke-width="2"/><path d="M-3-44 31-73l42 49-34 29z" fill="#904038" stroke="#4b2a1e" stroke-width="2.4"/><path d="M12-56 52-11" stroke="#b28750" stroke-width="3" fill="none"/>';
    group.append(body);
    cab.fx.append(group);
    body.style.transformOrigin = '124px -130px';
    body.animate([
      { transform: 'rotate(-34deg)', opacity: 0 },
      { transform: 'rotate(-34deg)', opacity: 1, offset: 0.2, easing: 'cubic-bezier(.6,0,1,.7)' },
      { transform: 'rotate(0deg)', opacity: 1, offset: 0.46 },
      { transform: 'rotate(-13deg)', opacity: 1, offset: 0.72 },
      { transform: 'rotate(-20deg)', opacity: 0 }
    ], { duration: 280 }).onfinish = () => group.remove();
  }

  const SHAKES = [3, 6, 10];

  function strike(cab, point) {
    cab.hits += 1;
    cab.root.dataset.hits = String(cab.hits);
    cab.dots[cab.hits - 1].classList.add('is-lit');
    if (!reduced.matches) {
      const amount = SHAKES[cab.hits - 1];
      cab.root.animate([
        { transform: 'translateX(0)' },
        { transform: `translateX(${-amount}px) rotate(${-amount * 0.05}deg)` },
        { transform: `translateX(${amount * 0.7}px) rotate(${amount * 0.04}deg)` },
        { transform: `translateX(${-amount * 0.3}px)` },
        { transform: 'translateX(0)' }
      ], { duration: 240 + cab.hits * 30, easing: 'ease-out' });
      flash(cab, point, 30 + cab.hits * 22);
    }
    if (cab.hits === 1) firstHit(cab, point);
    else if (cab.hits === 2) secondHit(cab, point);
    else shatter(cab, point);
    if (cab.hits < 3) {
      cab.button.setAttribute('aria-label', `第 ${cab.index + 1} 座展柜，已叩 ${cab.hits} 次，再叩 ${3 - cab.hits} 次打开`);
    }
    updateReset();
  }

  const cabinets = [];
  const updateReset = () => { reset.hidden = !cabinets.some(cab => cab.hits > 0); };

  function build(index) {
    const root = document.createElement('div');
    root.className = 'vt-cab';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'vt-window';
    button.setAttribute('aria-label', `第 ${index + 1} 座展柜，叩三次打开`);
    button.innerHTML = `${CASE_IMG}<span class="vt-slot"></span>${GLASS_SVG}`;
    root.append(button);
    const cab = {
      index, root, button, hits: 0, busy: false, tips: [],
      glass: button.querySelector('.vt-glass'),
      pane: button.querySelector('.vt-pane'),
      cracks: button.querySelector('.vt-cracks'),
      debris: button.querySelector('.vt-debris'),
      shards: button.querySelector('.vt-shards'),
      fx: button.querySelector('.vt-fx'),
      dots: [...button.querySelectorAll('.vt-dots rect')]
    };
    button.addEventListener('click', event => {
      if (cab.busy || cab.hits >= 3) return;
      const point = impactPoint(cab, event);
      if (reduced.matches) { strike(cab, point); return; }
      cab.busy = true;
      mallet(cab, point);
      // 槌子落到玻璃的那一刻才裂。
      window.setTimeout(() => { strike(cab, point); cab.busy = false; }, 128);
    });
    return cab;
  }

  function render() {
    cabinets.length = 0;
    for (let i = 0; i < COUNT; i++) cabinets.push(build(i));
    stage.innerHTML = DEFS;
    stage.append(...cabinets.map(cab => cab.root));
    updateReset();
  }

  reset.addEventListener('click', () => {
    render();
    cabinets[0].button.focus();
  });

  render();
})();
