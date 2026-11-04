(() => {
  'use strict';
  const paths = [
    {name:'从展品到日用品',sub:'尺度变轻，手艺走进随身日常',tone:'#cad8cf',mark:'日'},
    {name:'跨界破壁',sub:'跨入美妆、茶饮、体育与潮玩',tone:'#ddd0c4',mark:'界'},
    {name:'材料与结构再造',sub:'旧材料遇见新的形态与技术',tone:'#c9d2d9',mark:'造'},
    {name:'IP与数字界面',sub:'在屏幕里相遇，也走向真实工坊',tone:'#d3ccd5',mark:'数'},
    {name:'体验成为产品',sub:'从观看走向亲手参与',tone:'#d7d7bf',mark:'手'}
  ];
  const cases = window.CASES || [];
  const pathList = document.getElementById('path-list');
  const container = document.getElementById('case-sections');
  const search = document.getElementById('case-search');
  const clear = document.getElementById('clear-search');
  const count = document.getElementById('search-count');
  const empty = document.getElementById('empty-state');
  const dialog = document.getElementById('case-dialog');
  const dialogContent = document.getElementById('dialog-content');
  let lastTrigger = null;

  const el = (tag, cls, value) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (value !== undefined) node.textContent = value;
    return node;
  };
  const add = (parent, ...children) => { children.forEach(child => parent.append(child)); return parent; };
  const paint = (node, index) => node.style.setProperty('--tone', paths[index].tone);

  function media(item, className) {
    const box = el('div', className);
    paint(box, item.category);
    if (item.image) {
      const img = el('img');
      img.src = item.image;
      img.alt = item.imageMeta?.alt || item.title;
      img.loading = 'lazy';
      img.addEventListener('load', () => box.classList.add('has-image'));
      img.addEventListener('error', () => { box.classList.remove('has-image'); img.remove(); });
      box.append(img);
      if (item.imageMeta?.reference) box.append(el('small', 'image-reference', '工艺 / 系列参考'));
    }
    if (className === 'card-image') {
      const placeholder = el('div', 'placeholder');
      add(placeholder, el('b', '', paths[item.category].mark), el('small', '', '影像待补'));
      box.append(placeholder);
    } else {
      box.append(el('span', '', paths[item.category].mark));
    }
    return box;
  }

  function openCase(item, trigger) {
    lastTrigger = trigger;
    dialogContent.replaceChildren();
    const body = el('div', 'dialog-body');
    add(body, el('p', 'dialog-meta', `${String(item.category + 1).padStart(2,'0')} / ${paths[item.category].name} · 档案 ${item.id}`),
      el('h2', '', item.title), el('p', 'dialog-lead', item.hook));
    const rows = [
      ['古今对照', item.compare],
      ['案例总述', item.summary],
      ['产品档案', item.archive],
      ['创新标签', item.tags.join(' / ')]
    ];
    rows.forEach(([label, content]) => {
      const row = el('div', 'dialog-grid');
      add(row, el('b', '', label), el('p', '', content));
      body.append(row);
    });
    if (item.imageMeta) {
      const meta = item.imageMeta;
      const caption = el('p', 'dialog-note', meta.alt + ' · 来源日期：' + meta.date + ' · ');
      const link = el('a', '', meta.credit);
      link.href = meta.source; link.target = '_blank'; link.rel = 'noopener noreferrer';
      caption.append(link); body.append(caption);
    }
    const sourceRow = el('div', 'dialog-grid');
    const list = el('ul', 'dialog-sources');
    item.sources.forEach(source => {
      const a = el('a', '', source.label);
      a.href = source.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      list.append(add(el('li'), a));
    });
    add(sourceRow, el('b', '', '资料来源'), list);
    body.append(sourceRow);
    body.append(el('p', 'dialog-note', '资料链接用于事实核对；图片、商标及人物肖像的使用权需单独确认。'));
    add(dialogContent, media(item, 'dialog-cover'), body);
    dialog.showModal();
    dialog.querySelector('.dialog-close').focus();
  }

  function card(item) {
    const article = el('article', 'case-card');
    article.tabIndex = 0;
    article.setAttribute('role', 'button');
    article.setAttribute('aria-label', `查看案例：${item.title}`);
    const body = el('div', 'card-body');
    const bottom = el('div', 'card-bottom');
    add(bottom, el('span', 'tag', item.tags[0] || '非遗焕新'), el('span', 'card-more', '阅读档案 ↗'));
    add(body, el('span', 'card-meta', `NO. ${item.id}${item.overseas ? '  ·  海外关联' : ''}`),
      el('h4', '', item.title), el('p', 'card-hook', item.hook), bottom);
    add(article, media(item, 'card-image'), body);
    article.addEventListener('click', () => openCase(item, article));
    article.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openCase(item, article); }
    });
    return article;
  }

  function render(query = '') {
    container.replaceChildren();
    const term = query.trim().toLocaleLowerCase('zh-CN');
    let total = 0;
    paths.forEach((path, index) => {
      const selected = cases.filter(item => item.category === index &&
        (!term || [item.title,item.hook,item.summary,item.archive,...item.tags].join(' ').toLocaleLowerCase('zh-CN').includes(term)));
      total += selected.length;
      if (!selected.length) return;
      const section = el('section', 'path-section');
      section.id = `path-${index + 1}`;
      section.setAttribute('aria-label', path.name);
      const heading = el('div', 'path-section-head wrap');
      const line = el('div', 'path-title-line');
      add(line, el('span', '', `0${index + 1}`), el('h3', '', path.name));
      const controls = el('div', 'rail-controls');
      const prev = el('button', '', '←'), next = el('button', '', '→');
      prev.type = next.type = 'button';
      prev.setAttribute('aria-label', `${path.name}向前浏览`);
      next.setAttribute('aria-label', `${path.name}向后浏览`);
      add(controls, prev, next);
      add(heading, add(el('div'), line, el('p', '', path.sub)), controls);
      const rail = el('div', 'rail');
      rail.setAttribute('aria-label', `${path.name}案例横向列表`);
      rail.tabIndex = 0;
      selected.forEach(item => rail.append(card(item)));
      const update = () => {
        prev.disabled = rail.scrollLeft <= 4;
        next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
      };
      const move = direction => rail.scrollBy({left: direction * Math.min(rail.clientWidth * .8, 820),behavior:'smooth'});
      prev.addEventListener('click', () => move(-1));
      next.addEventListener('click', () => move(1));
      rail.addEventListener('scroll', update, {passive:true});
      rail.addEventListener('keydown', event => {
        if (event.target === rail && ['ArrowLeft','ArrowRight'].includes(event.key)) {
          event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
        }
      });
      add(section, heading, rail);
      container.append(section);
      requestAnimationFrame(update);
    });
    count.textContent = term ? `找到 ${total} 个案例` : '';
    clear.hidden = !term;
    empty.hidden = total !== 0;
  }

  paths.forEach((path, index) => {
    const button = el('button', 'path-row');
    button.type = 'button';
    add(button, el('span','path-no',`0${index + 1}`),el('span','path-name',path.name),
      el('span','path-desc',path.sub),el('span','path-arrow','↘'));
    button.addEventListener('click', () => {
      if (search.value.trim()) { search.value = ''; render(); }
      document.getElementById(`path-${index + 1}`).scrollIntoView({behavior:'smooth',block:'start'});
    });
    pathList.append(button);
  });
  search.addEventListener('input', () => render(search.value));
  clear.addEventListener('click', () => { search.value = ''; render(); search.focus(); });
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !dialog.open && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
      event.preventDefault(); search.focus();
    }
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => lastTrigger?.focus());
  render();
})();
