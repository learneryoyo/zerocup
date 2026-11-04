/* Original vanilla-JS exhibition interaction. No runtime dependencies. */
(() => {
  'use strict';
  const selections = [
    { id:'02', old:'从一只绿釉陶罐', fresh:'到耳畔的一抹会理绿', object:'传统绿釉陶器', product:'绿陶耳饰与冰箱贴', date:'2025', color:'#829688' },
    { id:'06', old:'从香案上的一缕香', fresh:'到随身携带的气息', object:'传统香器与篾香', product:'车载香与文创香牌', date:'2026.10', color:'#b29160' },
    { id:'07', old:'从银丝里的千回百转', fresh:'到唇间的一抹豆瓣红', object:'传统银花丝器物', product:'豆瓣红银花丝口红', date:'2026.06', color:'#b56554' },
    { id:'11', old:'从衣襟上的一针一线', fresh:'到滑板上的自在远行', object:'传统苗绣衣片', product:'苗绣世界杯陆地冲浪板', date:'2026.07', color:'#678f99' },
    { id:'12', old:'从铜胎上的细密掐丝', fresh:'到掌心里的国风角色', object:'传统景泰蓝器物', product:'WAKUKU非遗限定潮玩', date:'2026.05', color:'#627c9b' },
    { id:'16', old:'从扇面上的一幅画', fresh:'到轻触便能打开的故事', object:'传统折扇', product:'王星记NFC智能扇', date:'2025—2026', color:'#a18d74' }
  ];
  // All image fields remain empty until approved photographs are supplied.
  // Set oldImage/newImage to local paths, e.g. assets/cases/02-old.jpg.
  selections.forEach(item => {
    const original = window.CASES.find(x => x.id === item.id);
    item.oldImage = '';
    item.newImage = original?.imageMeta?.reference ? '' : (original?.image || '');
  });
  const main = document.getElementById('main');
  const museum = document.getElementById('museum');
  const grid = document.getElementById('cabinet-grid');
  const progress = document.getElementById('museum-progress');
  const dialog = document.getElementById('reward-dialog');
  const content = document.getElementById('reward-content');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const states = new Map();
  let timer = null, lastFocus = null, pending = false;
  const node = (tag, cls, text) => {const n=document.createElement(tag); if(cls)n.className=cls; if(text!==undefined)n.textContent=text; return n;};
  const report = () => {progress.textContent=`已收集 ${[...states.values()].filter(s=>s.hits===3).length} / 6`;};
  function imageSlot(item, fresh) {
    const box=node('div',fresh?'new-object':'old-object');
    const url=fresh?item.newImage:item.oldImage;
    const label=fresh?item.product:item.object;
    const fallback=node('div','image-placeholder');
    fallback.append(node('span','object-label',label),node('small','',fresh?'新品图片待补':'传统器物图片待补'));
    box.append(fallback);
    if(url){const img=node('img');img.src=url;img.alt=label;img.loading='lazy';img.onload=()=>fallback.hidden=true;img.onerror=()=>img.remove();box.append(img);}
    return box;
  }
  function reveal(item, button) {
    if(dialog.open)return;
    lastFocus=button;
    const original=window.CASES.find(x=>x.id===item.id);
    content.replaceChildren();
    dialog.style.setProperty('--accent',item.color);
    content.append(node('p','reward-kicker','新作入藏 · '+item.id),node('h2','',item.product));
    content.querySelector('h2').id='reward-title';
    content.append(imageSlot(item,true),node('p','reward-transition',item.old+'，'+item.fresh+'。'));
    if (item.newImage && original.imageMeta) {
      const meta = original.imageMeta;
      const credit = node('p', 'reward-sources', meta.alt + ' · ');
      const link = node('a', '', meta.credit);
      link.href = meta.source; link.target = '_blank'; link.rel = 'noopener noreferrer';
      credit.append(link); content.append(credit);
    }
    const tags=node('div','reward-tags');original.tags.forEach(tag=>tags.append(node('span','',tag)));content.append(tags);
    const detail=node('details','reward-details');detail.append(node('summary','','阅读这件新作的故事'),node('p','',original.summary));
    const sources=node('div','reward-sources');original.sources.forEach(s=>{const a=node('a','',s.label+' ↗');a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';sources.append(a);});detail.append(sources);content.append(detail);
    const done=node('button','reward-done','已收入我的新生图鉴 · 继续探索');done.type='button';done.onclick=()=>dialog.close();content.append(done);
    dialog.showModal();dialog.scrollTop=0;dialog.querySelector('.reward-close').focus();
  }
  function build() {
    if(timer){clearTimeout(timer);timer=null;}
    pending=false;states.clear();grid.replaceChildren();
    selections.forEach((item,index)=>{
      const state={hits:0,busy:false};states.set(item.id,state);
      const card=node('article','cabinet');card.style.setProperty('--accent',item.color);
      card.append(node('p','cabinet-number',`展柜 ${String(index+1).padStart(2,'0')} / ${item.object}`));
      const button=node('button','cabinet-window');button.type='button';
      const update=()=>button.setAttribute('aria-label',`${item.object}，已敲击${state.hits}次，${state.hits<3?'再敲'+(3-state.hits)+'次揭晓新作':'查看已收集新作'}`);
      update();button.append(imageSlot(item,false));
      button.addEventListener('keydown',e=>{if(e.repeat && (e.key==='Enter'||e.key===' '))e.preventDefault();});
      const glass=node('span','glass');glass.setAttribute('aria-hidden','true');
      // Hand-authored crack paths. The second layer extends the first impact.
      glass.innerHTML='<svg viewBox="0 0 320 300" preserveAspectRatio="none"><g class="crack-one"><path d="M155 148 L134 119 141 88 115 61 M155 148 L194 134 221 151 246 146 M155 148 L148 184 167 205 159 238 M155 148 L118 155 91 180"/></g><g class="crack-two"><path d="M115 61 L92 21 101 0 M141 88 L179 63 197 23 221 0 M194 134 L210 100 247 84 269 38 320 15 M246 146 L283 161 320 145 M167 205 L205 221 223 260 263 300 M159 238 L132 267 121 300 M91 180 L47 175 25 203 0 209 M134 119 L88 105 61 67 0 56 M148 184 L113 224 69 240 40 300 M155 148 L167 122 194 134 M155 148 L177 168 167 205"/></g></svg>';
      for(let j=0;j<8;j++){const shard=node('i','glass-shard');shard.style.setProperty('--dx',`${(j%4-1.5)*120}px`);shard.style.setProperty('--dy',`${(j<4?-1:1)*(110+j*13)}px`);shard.style.setProperty('--rotate',`${j%2?65:-65}deg`);shard.style.left=`${(j%4)*25}%`;shard.style.top=j<4?'0':'50%';glass.append(shard);}
      button.append(glass,node('span','hit-mark','✦'));
      const caption=node('p','cabinet-caption',item.old);
      const hint=node('p','cabinet-hint','轻叩三次，遇见新作');
      const dots=node('div','hit-dots');dots.setAttribute('aria-hidden','true');for(let i=0;i<3;i++)dots.append(node('i'));
      button.addEventListener('click',()=>{
        if(state.busy || pending)return;
        if(state.hits===3){reveal(item,button);return;}
        state.hits++;button.dataset.hits=String(state.hits);update();
        [...dots.children].forEach((d,i)=>d.classList.toggle('lit',i<state.hits));
        button.classList.remove('impact');void button.offsetWidth;button.classList.add('impact');
        hint.textContent=state.hits===1?'第一叩 · 时光裂开一道缝':state.hits===2?'第二叩 · 新意正在透出':'第三叩 · 新作揭晓';
        if(state.hits===3){state.busy=true;pending=true;report();timer=setTimeout(()=>{state.busy=false;pending=false;button.classList.add('collected');caption.textContent=item.product;hint.textContent='已入藏 · 点击再次查看';reveal(item,button);timer=null;},reduced.matches?0:620);}
      });
      card.append(button,caption,dots,hint);grid.append(card);
    });report();
  }
  function setView(showMuseum){
    museum.hidden=!showMuseum;main.hidden=showMuseum;
    document.getElementById('museum-tab').setAttribute('aria-pressed',String(showMuseum));
    document.getElementById('archive-tab').setAttribute('aria-pressed',String(!showMuseum));
    document.body.classList.toggle('museum-open',showMuseum);
    window.scrollTo({top:0,behavior:'instant'});
    if(!showMuseum)document.querySelectorAll('.rail').forEach(rail=>rail.dispatchEvent(new Event('scroll')));
  }
  document.getElementById('museum-tab').onclick=()=>setView(true);
  document.getElementById('archive-tab').onclick=()=>setView(false);
  document.querySelectorAll('.skip').forEach(a=>a.addEventListener('click',()=>setView(false)));
  document.getElementById('reset-museum').onclick=()=>{if(dialog.open)dialog.close();build();};
  dialog.querySelector('.reward-close').onclick=()=>dialog.close();
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  dialog.addEventListener('close',()=>lastFocus?.focus());
  build();setView(true);
})();
