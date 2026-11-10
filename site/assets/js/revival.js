/* 古艺新生：左侧大类标签切换，右侧每类六件新作，点开看档案。数据见 revival-data.js。 */
(() => {
  'use strict';

  // 五类标签的手绘图标，顺序与 PATHS 一致；配色固定，徽章裁成圆形。
  const ICONS = ['daily', 'crossover', 'form', 'digital', 'cocreate'];

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
    '07': '豆瓣×银花丝 · 豆瓣红口红', '08': '孝感米酿 · 荔枝冰酿', '09': '云锦×周大生 · 云锦黄金',
    '10': '王星记 · IP 联名白纸扇', '11': '苗绣×世界杯 · 冲浪板', '12': '京绣·景泰蓝 × WAKUKU',
    '13': '汉中藤编 · 悬浮藤椅', '14': '唐氏竹编 · 竹包与落地灯', '15': '泥金彩漆 · 冠军奖杯',
    '16': '王星记 · NFC智能扇', '17': '高淳陶瓷 · 成套餐具', '18': '蜀锦 · 智能织造套装',
    '19': '赫哲文化 · 「希特」IP', '20': '绵竹年画 · 福缘绘梦', '21': '南京云锦 · 非遗智能体',
    '22': '孟连神鸟舞 · 逆水寒', '23': '佛山狮头 · 醒狮之旅H5', '24': '马头琴 · 桃源深处有人家',
    '25': '桃花坞年画 · 万象更新套装', '26': '查干湖鱼皮 · DIY材料包', '27': '上海绒绣 · 自噶绣体验课',
    '28': '华县皮影 · 多媒体小哪吒', '29': '杨柳青年画 · 玉成号体验坊', '30': '铜官陶瓷 · 亲子研学'
  };

  const COUNTER_LINE = '轻叩三次展柜，遇见一件非遗新作。';
  const ACCESS_CHECKED = '2026-11-05';
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

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ratios = new Map();
  const desktopDetail = window.matchMedia('(min-width: 721px)');
  let firstSelection = true;
  let current = 0;
  let open = null;      // 当前弹窗里的案例
  let trigger = null;   // 打开弹窗的卡片，关闭后焦点回去

  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const icon = index => `<span class="rv-badge"><img src="assets/images/revival/icons/${ICONS[index]}.webp" alt="" width="92" height="92"></span>`;
  const inPath = index => cases.filter(item => item.category === index);

  function applyShape(item, body) {
    const ratio = ratios.get(item.id);
    if (!body) return;
    if (!Number.isFinite(ratio) || ratio <= 0) {
      delete body.dataset.shape;
      delete dialog.dataset.shape;
      body.style.removeProperty('--rv-ratio');
      return;
    }
    const shape = ratio >= 1.3 ? 'wide' : 'tall';
    body.dataset.shape = dialog.dataset.shape = shape;
    body.style.setProperty('--rv-ratio', ratio);
  }

  desktopDetail.addEventListener('change', () => {
    if (!dialog.open) return;
    const img = dialogBody.querySelector('.rv-detail-media > img');
    if (img) img.style.objectPosition = desktopDetail.matches && !open?.imageMeta?.crop
      ? open?.imageMeta?.focus || '' : '';
    dialogBody.querySelector('.rv-detail-media > svg')?.setAttribute(
      'preserveAspectRatio', desktopDetail.matches ? 'xMidYMid slice' : 'xMidYMid meet'
    );
  });

  function cover(item, cls) {
    const box = el('div', cls);
    const detail = cls === 'rv-detail-media';
    const crop = item.imageMeta?.crop;
    if (item.image && crop) ratios.set(item.id, crop[2] / crop[3]);
    const holder = el('div', 'rv-holder');
    holder.innerHTML = icon(item.category);
    holder.append(el('small', '', '图片加载中…'));
    box.append(holder);
    if (item.image) {
      const img = el('img');
      img.alt = item.imageMeta?.alt || item.title;
      img.loading = cls === 'rv-detail-media' ? 'eager' : 'lazy';
      img.decoding = 'async';
      img.addEventListener('load', () => {
        holder.hidden = true;
        ratios.set(item.id, crop ? crop[2] / crop[3] : img.naturalWidth / img.naturalHeight);
        const body = box.closest('.rv-detail');
        if (detail && open === item && body === dialogBody.firstElementChild) applyShape(item, body);
      });
      holder.querySelector('small').textContent = '图片加载中…';
      img.addEventListener('error', () => { holder.hidden = false; holder.querySelector('small').textContent = '图片暂未加载，仍可查看介绍'; img.remove();
        const body = box.closest('.rv-detail');
        if (detail && open === item && body === dialogBody.firstElementChild) {
          ratios.delete(item.id);
          applyShape(item, body);
        }
      });
      img.src = item.image;
      // 用内联 SVG 的视口裁去截图边框，原始照片保持完整。
      if (crop) {
        const ns = 'http://www.w3.org/2000/svg';
        const viewport = document.createElementNS(ns, 'svg');
        viewport.classList.add('rv-cropped-image');
        viewport.setAttribute('viewBox', crop.join(' '));
        viewport.setAttribute('preserveAspectRatio', detail && desktopDetail.matches ? 'xMidYMid slice' : 'xMidYMid meet');
        viewport.setAttribute('role', 'img');
        viewport.setAttribute('aria-label', img.alt);
        const photo = document.createElementNS(ns, 'image');
        photo.setAttribute('width', item.imageMeta.width);
        photo.setAttribute('height', item.imageMeta.height);
        // SVG image 不支持原生懒加载；由下方 img 进入视口后触发请求。
        img.addEventListener('load', () => photo.setAttribute('href', item.image));
        const clip = document.createElementNS(ns, 'clipPath');
        clip.id = 'rv-crop-' + cls + '-' + item.id;
        const rect = document.createElementNS(ns, 'rect');
        ['x', 'y', 'width', 'height'].forEach((key, index) => rect.setAttribute(key, crop[index]));
        clip.append(rect);
        photo.setAttribute('clip-path', 'url(#' + clip.id + ')');
        viewport.append(clip, photo);
        // 独立图片元素负责加载检测；SVG 负责统一卡片和详情的裁切。
        img.addEventListener('error', () => viewport.remove());
        img.style.opacity = '0';
        img.setAttribute('aria-hidden', 'true');
        box.append(img, viewport);
      } else {
        if (detail && desktopDetail.matches && item.imageMeta?.focus) img.style.objectPosition = item.imageMeta.focus;
        box.append(img);
      }
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
    // 「去哪里遇见它」提到卡片正面：渠道类型 + 地点首句，常驻一行；全文留在弹窗。
    if (item.access) {
      const where = item.access.where.split(/[；。（，]/)[0].trim();
      const reach = el('span', 'rv-card-hook rv-card-access', `${item.access.label} · ${where}`);
      reach.title = item.access.where;
      // 只占一行，不压住图片；超长时省略，全文在悬停提示和弹窗里。
      reach.style.whiteSpace = 'nowrap';
      reach.style.textOverflow = 'ellipsis';
      bar.append(reach);
      button.setAttribute('aria-label', `${SHORT[item.id] || item.title}，${item.access.label}：${where}，查看档案`);
    }
    button.append(bar);
    button.addEventListener('click', () => openCase(item, button));
    return button;
  }

  function setLine(text) {
    lineEl.textContent = text;
  }

  function select(index, focus) {
    const initial = firstSelection;
    firstSelection = false;
    const unchanged = !initial && current === index;
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
    if (!unchanged) {
      grid.classList.toggle('is-first-entry', initial && !reducedMotion.matches);
      grid.replaceChildren(...inPath(index).map(card));
    }
    if (window.matchMedia('(max-width: 720px)').matches) {
      tabList.children[index].scrollIntoView({ block: 'nearest', inline: 'center', behavior: reducedMotion.matches || focus ? 'instant' : 'smooth' });
    }
  }

  PATHS.forEach((path, index) => {
    const tab = el('button', 'rv-tab');
    tab.type = 'button';
    tab.id = `rv-tab-${index}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', 'rv-panel');
    tab.innerHTML = icon(index);
    tab.append(el('span', 'rv-tab-name', path.name));
    tab.addEventListener('click', event => select(index, event.detail === 0));
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

  // 渠道与价格只写核实到的内容；没有公开价格或入口的条目不出按钮。
  function access(info) {
    const box = el('div', 'rv-access');
    box.append(el('span', 'rv-access-kind', info.label), el('p', '', info.where));
    if (info.price) box.append(el('p', 'rv-access-price', `价格：${info.price}`));
    if (info.links) {
      const links = el('div', 'rv-access-links');
      info.links.forEach(link => {
        const a = el('a', '', `${link.label} ↗`);
        a.href = link.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        links.append(a);
      });
      box.append(links);
    }
    box.append(el('p', 'rv-access-date', `渠道与价格核实于 ${ACCESS_CHECKED}，以官方当期信息为准。`));
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
    const tags = el('ul', 'rv-tags rv-tags--head');
    tags.setAttribute('aria-label', '创新标签');
    item.tags.forEach(tag => tags.append(el('li', '', tag)));
    text.append(tags, el('p', 'rv-detail-lead', item.summary));
    text.append(row('古今对照', compare(item.compare)));
    if (item.access) text.append(row('去哪里遇见它', access(item.access)));

    // 档案数字、图片来源和资料出处都要留着备查，但默认收起，不打断阅读
    const more = el('details', 'rv-more');
    more.append(el('summary', '', '档案与来源'));
    more.append(row('产品档案', item.archive));
    if (item.imageMeta) {
      const meta = item.imageMeta;
      const caption = el('div', 'rv-image-caption');
      caption.append(el('p', '', meta.alt));
      const source = el(meta.source ? 'a' : 'p', '', `图片来源：${meta.credit}`);
      if (meta.source) {
        source.href = meta.source;
        source.target = '_blank';
        source.rel = 'noopener noreferrer';
      }
      caption.append(source, el('p', '', `来源日期：${meta.date}`));
      more.append(row('配图', caption));
    }
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
    more.append(row('资料来源', list));
    more.append(el('p', 'rv-note', '非遗级别指所依托的代表性项目，产品本身不获非遗认定；数字均为报道时口径。'));
    text.append(more);

    const nav = el('div', 'rv-detail-nav');
    const prev = el('button', '', '← 上一个');
    const next = el('button', '', '下一个 →');
    prev.type = next.type = 'button';
    prev.addEventListener('click', () => fill(group[(at - 1 + group.length) % group.length]));
    next.addEventListener('click', () => fill(group[(at + 1) % group.length]));
    nav.append(prev, el('span', '', `${at + 1} / ${group.length}`), next);
    text.append(nav);

    body.append(text);
    applyShape(item, body);
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

  // 外部入口：revival.html?case=05 直接落到「分类」页里对应的那件新作。
  // 首页「今天它长这样」的三张卡就靠这个参数指过来，找不到编号时保持默认的柜台页。
  const wanted = cases.find(item => item.id === new URLSearchParams(location.search).get('case'));
  if (wanted) {
    current = wanted.category;
    setView('paths');
    requestAnimationFrame(() => {
      const target = grid.children[inPath(wanted.category).indexOf(wanted)];
      if (!target) return;
      // 分类页只有六件，通常首屏就能看全；只在卡片露不出来时才滚动，避免把页头推走。
      if (typeof target.scrollIntoView === 'function') target.scrollIntoView({ block: 'nearest' });
      target.focus({ preventScroll: true });
    });
  }
})();
