/* 古艺新生：左侧大类标签切换，右侧每类六件新作，点开看档案。数据见 revival-data.js。 */
(() => {
  'use strict';

  const ICONS = [
    // 日用新生：茶盏
    '<path d="M6 11h14v3a7 7 0 0 1-14 0z"/><path d="M20 12.5h1.5a2.5 2.5 0 0 1 0 5H19"/><path d="M4 23h18"/><path d="M11 4c-1 1.5 1 2.5 0 4M15 4c-1 1.5 1 2.5 0 4"/>',
    // 跨界相逢：两环相扣
    '<circle cx="11" cy="14" r="6.5"/><circle cx="17" cy="14" r="6.5"/>',
    // 形态新造：编织网格
    '<path d="M5 9c3-3 6 3 9 0s6 3 9 0M5 14c3-3 6 3 9 0s6 3 9 0M5 19c3-3 6 3 9 0s6 3 9 0"/><path d="M9 5v18M14 5v18M19 5v18"/>',
    // 数字焕新：扇面加信号
    '<path d="M14 23 5 12a12 12 0 0 1 18 0z"/><path d="M14 23v-9M10 15l4 8 4-8"/><path d="M19 5a6 6 0 0 1 4 3M20.5 2.5a9 9 0 0 1 5.5 4.5"/>',
    // 体验共创：执笔
    '<path d="M19 4 9 18l-1.5 4.5L12 21 22 7z"/><path d="M17 7l3 2"/><path d="M5 25c4-1 7 0 10-1"/>'
  ];

  const PATHS = [
    { name: '日用新生', line: '从展柜珍藏，到朝夕相伴。' },
    { name: '跨界相逢', line: '牵手时尚设计，奔赴生活新场景。' },
    { name: '形态新造', line: '旧艺为根，新形而生。' },
    { name: '数字焕新', line: '一触即达，让传统被世界看见。' },
    { name: '体验共创', line: '不做旁观者，成为故事的一笔。' }
  ];

  // 卡片底部用的短名，按案例编号。
  const SHORT = {
    '01': '三门石窗 · 微型石窗与夜灯', '02': '会理绿陶 · 耳饰与冰箱贴', '03': '费县手绣 · 虎头挂件',
    '04': '查干湖鱼皮 · 书签首饰', '05': '桃花坞年画 · 丝巾杯垫', '06': '永春香 · 车载便携香',
    '07': '豆瓣×银花丝 · 豆瓣红口红', '08': '孝感米酿 · 荔枝冰酿', '09': '紫砂×蓝印花布 · 紫韵蓝雅',
    '10': '蓝印花布 · 布老虎盲盒', '11': '苗绣×世界杯 · 冲浪板', '12': '京绣·景泰蓝 × WAKUKU',
    '13': '汉中藤编 · 悬浮藤椅', '14': '唐氏竹编 · 竹包与落地灯', '15': '泥金彩漆 · 冠军奖杯',
    '16': '王星记 · NFC智能扇', '17': '高淳陶瓷 · 窑变釉炻器', '18': '蜀锦 · 智能织造套装',
    '19': '赫哲文化 · 「希特」IP', '20': '绵竹年画 · 福缘绘梦', '21': '南京云锦 · 非遗智能体',
    '22': '孟连神鸟舞 · 逆水寒', '23': '佛山狮头 · 醒狮之旅H5', '24': '马头琴 · 桃源深处有人家',
    '25': '镇江香醋 · 坛中酿山河', '26': '查干湖鱼皮 · DIY材料包', '27': '上海绒绣 · 自噶绣体验课',
    '28': '华县皮影 · 多媒体小哪吒', '29': '杨柳青年画 · 玉成号体验坊', '30': '铜官陶瓷 · 亲子研学'
  };

  const COUNTER_LINE = '轻叩三次橱窗，遇见一件非遗新作。';
  const cases = window.CASES || [];
  const tabList = document.getElementById('rv-tabs');
  const panel = document.getElementById('rv-panel');
  const counter = document.getElementById('rv-museum');
  const page = document.getElementById('main-content');
  const viewSwitch = document.getElementById('rv-switch');
  const grid = document.getElementById('rv-grid');
  const lineEl = document.getElementById('rv-line');
  const dialog = document.getElementById('rv-dialog');
  const dialogBody = document.getElementById('rv-dialog-body');
  if (!tabList || !grid) return;

  let current = 0;
  let open = null;      // 当前弹窗里的案例
  let trigger = null;   // 打开弹窗的卡片，关闭后焦点回去

  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const icon = index => `<svg viewBox="0 0 28 28" aria-hidden="true">${ICONS[index]}</svg>`;
  const inPath = index => cases.filter(item => item.category === index);

  function cover(item, cls) {
    const box = el('div', cls);
    const holder = el('div', 'rv-holder');
    holder.innerHTML = icon(item.category);
    holder.append(el('small', '', '影像待补'));
    box.append(holder);
    if (item.image) {
      const img = el('img');
      img.alt = item.imageMeta?.alt || item.title;
      img.loading = cls === 'rv-detail-media' ? 'eager' : 'lazy';
      img.decoding = 'async';
      img.addEventListener('load', () => { holder.hidden = true; });
      img.addEventListener('error', () => { holder.hidden = false; img.remove(); });
      img.src = item.image;
      box.append(img);
      if (item.imageMeta?.reference && cls === 'rv-card-media') {
        box.append(el('span', 'rv-image-kind', '工艺 / 系列参考'));
      }
    }
    return box;
  }

  function card(item, order) {
    const button = el('button', 'rv-card');
    button.type = 'button';
    button.style.setProperty('--i', order);
    button.setAttribute('aria-label', `${SHORT[item.id] || item.title}，查看档案`);
    button.append(cover(item, 'rv-card-media'));
    if (item.overseas) button.append(el('span', 'rv-star', '★ 出海'));
    const bar = el('span', 'rv-card-bar');
    const name = el('span', 'rv-card-name');
    name.append(el('b', '', item.id), document.createTextNode(SHORT[item.id] || item.title));
    bar.append(name, el('span', 'rv-card-hook', item.hook));
    const plus = el('span', 'rv-plus');
    plus.setAttribute('aria-hidden', 'true');
    bar.append(plus);
    button.append(bar);
    button.addEventListener('click', () => openCase(item, button));
    return button;
  }

  function setLine(text) {
    lineEl.classList.remove('is-in');
    void lineEl.offsetWidth;
    lineEl.textContent = text;
    lineEl.classList.add('is-in');
  }

  function select(index, focus) {
    current = index;
    [...tabList.children].forEach((tab, i) => {
      const on = i === index;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
    });
    panel.setAttribute('aria-labelledby', `rv-tab-${index}`);
    setLine(PATHS[index].line);
    grid.replaceChildren(...inPath(index).map(card));
    if (window.matchMedia('(max-width: 720px)').matches) {
      tabList.children[index].scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }
  }

  PATHS.forEach((path, index) => {
    const tab = el('button', 'rv-tab');
    tab.type = 'button';
    tab.id = `rv-tab-${index}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', 'rv-panel');
    tab.innerHTML = `<span class="rv-badge">${icon(index)}</span>`;
    tab.append(el('span', 'rv-tab-name', path.name));
    tab.addEventListener('click', () => select(index));
    tabList.append(tab);
  });

  tabList.addEventListener('keydown', event => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      select(event.key === 'Home' ? 0 : PATHS.length - 1, true);
    } else if (step) {
      event.preventDefault();
      select((current + step + PATHS.length) % PATHS.length, true);
    }
  });

  function row(label, content) {
    const wrap = el('div', 'rv-row');
    wrap.append(el('h3', '', label));
    if (typeof content === 'string') wrap.append(el('p', '', content));
    else wrap.append(content);
    return wrap;
  }

  function compare(text) {
    const at = text.indexOf('→');
    if (at < 0) return el('p', '', text);
    const box = el('div', 'rv-compare');
    const past = el('div', 'rv-compare-side');
    past.append(el('b', '', '古'), el('p', '', text.slice(0, at).trim()));
    const now = el('div', 'rv-compare-side');
    now.append(el('b', '', '今'), el('p', '', text.slice(at + 1).trim()));
    const arrow = el('span', 'rv-compare-arrow', '→');
    arrow.setAttribute('aria-hidden', 'true');
    box.append(past, arrow, now);
    return box;
  }

  function fill(item) {
    open = item;
    const group = inPath(item.category);
    const at = group.indexOf(item);
    const body = el('div', 'rv-detail');
    body.append(cover(item, 'rv-detail-media'));

    const text = el('div', 'rv-detail-text');
    text.append(el('p', 'rv-detail-meta', `${PATHS[item.category].name} · No.${item.id}${item.overseas ? ' · ★ 出海' : ''}`));
    const title = el('h2', '', item.title);
    title.id = 'rv-dialog-title';
    text.append(title, el('p', 'rv-detail-hook', item.hook));
    if (item.imageMeta) {
      const meta = item.imageMeta;
      const caption = el('div', 'rv-image-caption');
      caption.append(el('p', '', meta.alt));
      const source = el('a', '', `图片来源：${meta.credit}`);
      source.href = meta.source;
      source.target = '_blank';
      source.rel = 'noopener noreferrer';
      caption.append(source, el('p', '', `来源日期：${meta.date}`));
      text.append(caption);
    }
    text.append(row('古今对照', compare(item.compare)));
    text.append(row('案例总述', item.summary));
    text.append(row('产品档案', item.archive));
    const tags = el('ul', 'rv-tags');
    item.tags.forEach(tag => tags.append(el('li', '', tag)));
    text.append(row('创新标签', tags));
    const list = el('ul', 'rv-sources');
    item.sources.forEach(source => {
      const a = el('a', '', source.label);
      a.href = source.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      const li = el('li');
      li.append(a);
      list.append(li);
    });
    text.append(row('资料来源', list));
    text.append(el('p', 'rv-note', '非遗级别指所依托的代表性项目，产品本身不获非遗认定；数字均为报道时口径。'));

    const nav = el('div', 'rv-detail-nav');
    const prev = el('button', '', '← 上一个');
    const next = el('button', '', '下一个 →');
    prev.type = next.type = 'button';
    prev.addEventListener('click', () => fill(group[(at - 1 + group.length) % group.length]));
    next.addEventListener('click', () => fill(group[(at + 1) % group.length]));
    nav.append(prev, el('span', '', `${at + 1} / ${group.length}`), next);
    text.append(nav);

    body.append(text);
    dialogBody.replaceChildren(body);
    dialogBody.scrollTop = 0;
  }

  function openCase(item, from) {
    trigger = from;
    fill(item);
    dialog.showModal();
    dialog.querySelector('.rv-close').focus();
  }

  dialog.querySelector('.rv-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    // 弹窗里翻到别的案例时，焦点回到对应卡片。
    const match = open && [...grid.children].find(node => node.getAttribute('aria-label').startsWith(SHORT[open.id] || open.title));
    (match || trigger)?.focus();
  });

  // 左上角滑动开关：柜台 / 分类两页。
  const segments = [...viewSwitch.querySelectorAll('button')];

  function setView(view, focus) {
    const onPaths = view === 'paths';
    page.dataset.view = view;
    counter.hidden = onPaths;
    tabList.hidden = !onPaths;
    panel.hidden = !onPaths;
    setLine(onPaths ? PATHS[current].line : COUNTER_LINE);
    segments.forEach(segment => {
      const on = segment.dataset.view === view;
      segment.setAttribute('aria-checked', String(on));
      segment.tabIndex = on ? 0 : -1;
      if (on && focus) segment.focus();
    });
    if (onPaths) select(current);
  }

  segments.forEach(segment => {
    segment.addEventListener('click', () => {
      if (segment.getAttribute('aria-checked') !== 'true') setView(segment.dataset.view);
    });
  });

  viewSwitch.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    setView(page.dataset.view === 'counter' ? 'paths' : 'counter', true);
  });

  // 按住滑块拖动，松手吸附到近的一边；只是点一下时走上面的 click。
  let drag = null;
  viewSwitch.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    const onPaths = page.dataset.view === 'paths';
    const range = viewSwitch.querySelector('.rv-switch-thumb').offsetWidth;
    drag = { id: event.pointerId, startX: event.clientX, origin: onPaths ? range : 0, range, moved: false };
  });
  // 手指或鼠标滑出开关时仍要跟随，所以移动和松手都挂在 window 上。
  window.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const delta = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(delta) < 4) return;
    if (!drag.moved) {
      drag.moved = true;
      viewSwitch.classList.add('is-dragging');
    }
    drag.x = Math.min(drag.range, Math.max(0, drag.origin + delta));
    viewSwitch.style.setProperty('--thumb-x', `${drag.x}px`);
  });
  const endDrag = event => {
    if (!drag || event.pointerId !== drag.id) return;
    const { moved, x, range } = drag;
    drag = null;
    if (!moved) return;
    viewSwitch.classList.remove('is-dragging');
    viewSwitch.style.removeProperty('--thumb-x');
    const view = x > range / 2 ? 'paths' : 'counter';
    if (view !== page.dataset.view) setView(view);
  };
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  select(0);
  setView('counter');
})();
