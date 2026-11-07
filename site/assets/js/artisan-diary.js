// 匠人故事：每位匠人一页。版式在 1120×700 的画布上按坐标摆放，17 项互不重复；
// 窄屏不用坐标，改为按 DOM 顺序竖排（见 artisan-diary.css）。
// 视觉取自敦煌壁画的矿物色与榜题（竖排人名）；页面上的器物、织物都是真实素材的拼贴（k），不再用矢量几何代替。
(()=>{'use strict';
const data=window.ARTISAN_DIARIES;if(!data||document.querySelector('.artisan-diary'))return;
const styles=[['工坊札记','一门手艺，要在双手之间慢慢传递。'],['后台手记','看见戏台，也看见戏台后的人。'],['乡土共记','节日被记住，是因为总有人再次参与。'],['灶间日记','熟悉的滋味，来自一遍又一遍的认真。']];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// 敦煌矿物色：[壁面, 墨, 主色, 衬色]。dark 为满幅色地（壁面深、文字浅）。
const WALL={
 zhu:['#efe3cb','#33231b','#a03a25','#dcb771'],   // 粉壁 + 朱砂（盛唐）
 qing:['#ece2cc','#1f2b2f','#1d5a6d','#bccbb6'],  // 粉壁 + 石青
 lv:['#ebe4cf','#21302a','#2c6e5e','#d8bb78'],    // 粉壁 + 石绿
 tuhong:['#7f2f1f','#f7ead3','#ecc477','#5f2116'],// 土红地（北朝）
 shiqing:['#174a5b','#f3ead8','#e6c177','#0f3643'],// 石青地
 shilv:['#235a4e','#f5ecd9','#efcd86','#18443a'], // 石绿地
 mei:['#2a1f19','#f4e5ca','#dfa94f','#5c3a22'],   // 煤黑（铅粉氧化后的洞窟暗色）
 tuhuang:['#d9b26a','#2e1d12','#7a2616','#ebd29b'],// 土黄地
};

// 色块上的联珠。
const round=n=>+n.toFixed(1);
const pearls=(x1,y1,x2,y2,n,d,fill='var(--accent)')=>Array.from({length:n},(_,i)=>`<circle cx="${round(x1+(x2-x1)*i/(n-1))}" cy="${round(y1+(y2-y1)*i/(n-1))}" r="${d}" fill="${fill}"/>`).join('');

// 槽位：head/a/b/note = [x,y,宽,类名]；p = [图序,x,y,宽,类名,裁切位置,强制高]
// 画框高度默认按图片原比例算，图片不被裁切，主体不会被切掉；c（圆形）才用强制的正方形。
// 类名：c 圆 / o 椭圆 / w 带阴影的壁画框 / ring 头光环；文字槽 inv 压在色块上，mid 居中
// k = 拼贴件 [素材名,x,y,宽,旋转]，素材与署名见 ARTISAN_COLLAGE；它们垫在图片和文字下面，窄屏不显示
const LAYOUTS={
1:{ // 藻井居中压页眉：瓷的一圈圈釉色，与莲花同构
 c:WALL.qing,
 decor:`<path d="M0 0H372V218H0Z" fill="var(--soft)"/>`,
 k:[['dish-blue',596,22,280,-3],['jar',20,496,128,-2]],
 head:[48,30,316],a:[160,316,286],b:[474,326,296],note:[160,566,280],
 p:[[0,396,20,190,'w'],[3,884,30,176,'w'],[1,796,318,286,'w'],[2,848,520,216,'']]},
2:{ // 大圆与底部色块——圆即绣绷，也是头光
 c:WALL.zhu,
 decor:`<path d="M0 590C150 540 300 640 470 600S800 590 1120 610V700H0Z" fill="var(--accent)"/><circle cx="556" cy="142" r="176" fill="var(--soft)" opacity=".45"/><path d="M700 214C760 262 850 280 930 290" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="1 9" stroke-linecap="round"/>`,
 k:[['strip-dragon',-14,590,720,-1.2]],
 head:[48,30,330],a:[48,236,320],b:[640,344,430],note:[770,644,310,'inv'],
 p:[[0,386,24,340,'o ring'],[1,752,22,206,'c ring'],[2,930,238,150,'o ring'],[3,424,284,186,'w']]},
3:{ // 中线两侧交错的竖条——如悬挂的伞，石绿地
 c:WALL.shilv,
 decor:`<path d="M0 352H1120" stroke="var(--accent)" stroke-width="2"/>${pearls(0,352,1120,352,57,3.4)}<path d="M230 640H1120V700H230Z" fill="var(--soft)"/>`,
 k:[['umbrella',880,392,214,6]],
 head:[30,24,410],a:[450,20,400],b:[880,20,212],note:[880,604,212],
 p:[[0,30,190,200,''],[1,240,300,200,''],[2,450,226,200,''],[3,660,330,200,''],[4,30,452,200,'']]},
4:{ // 粗线连接的方框——梁与榫的搭接，土黄地
 c:WALL.tuhuang,
 decor:`<path d="M610 118H640M830 118H860M515 309V400M310 540H340M590 480H640" fill="none" stroke="var(--accent)" stroke-width="10" stroke-linecap="square"/>`,
 k:[['wood-band',-20,636,1160,0]],
 head:[46,30,340],a:[46,226,340],b:[640,350,430],note:[46,420,280],
 p:[[0,420,24,190,''],[1,640,24,190,'w'],[2,860,24,190,'w'],[3,46,462,264,'w'],[4,340,400,250,'w']]},
5:{ // 横向主轴上下分支——主轴如一排高桩
 c:['#efe0c2','#3a1d12','#a82c1c','#e0ae4a'],
 decor:`<path d="M0 362H1120" stroke="var(--accent)" stroke-width="12"/><path d="M540 270V362M812 310V362M1010 310V362M200 362V408" stroke="var(--accent)" stroke-width="8"/>${pearls(8,362,1112,362,70,2.6,'var(--paper)')}`,
 k:[['satin',-20,-22,396,-.6]],
 head:[46,30,322],a:[390,392,310],b:[736,392,340],note:[46,262,300],
 p:[[0,380,60,320,'w'],[1,716,30,192,'w'],[3,918,30,187,'w'],[2,56,410,296,'w']]},
6:{ // 中轴对称、两侧通高立柱——垂幔即戏台帷幕，土红地
 c:WALL.tuhong,
 decor:`<path d="M0 664H1120V700H0Z" fill="var(--soft)"/>${pearls(16,682,1104,682,46,4)}`,
 k:[['robe-band',-16,-16,1152,0]],
 head:[326,104,468,'mid'],a:[326,300,228],b:[566,300,228],note:[326,620,468,'mid'],
 p:[[0,28,64,280,''],[2,812,64,280,''],[1,28,486,280,''],[3,812,486,280,'']]},
7:{ // 粗框中的幕布——影窗，煤黑地
 c:WALL.mei,dark:1,
 decor:'<defs><radialGradient id="dp-glow" cx="50%" cy="34%" r="70%"><stop offset="0" stop-color="#7a4318"/><stop offset="1" stop-color="#2a1f19"/></radialGradient></defs><rect x="24" y="24" width="1072" height="652" fill="url(#dp-glow)" stroke="var(--accent)" stroke-width="10"/><rect x="36" y="36" width="1048" height="628" fill="none" stroke="var(--accent)" stroke-width="1"/>',
 k:[['shadow',966,224,92,3]],
 head:[70,400,300],a:[398,400,312],b:[738,400,312],note:[838,240,118],
 p:[[0,66,62,500,''],[1,582,62,240,''],[2,582,222,240,''],[3,838,62,216,'']]},
8:{ // 绳上悬挂的画幅，石青地
 c:WALL.shiqing,
 decor:`<path d="M0 44C300 104 800 104 1120 30" fill="none" stroke="var(--accent)" stroke-width="2.5"/>`,
 k:[['brocade',-20,606,1160,-.5]],
 head:[52,352,350],a:[420,414,320],b:[772,352,306],
 p:[[0,432,84,250,'w'],[1,56,100,350,'w'],[2,708,100,360,'w']]},
9:{ // 对角三角色块——帆与海
 c:WALL.qing,
 decor:`<path d="M1120 0V360L660 0Z" fill="var(--soft)"/>`,
 k:[['indigo-sea',-24,590,470,-2]],
 head:[48,30,540,'sm'],a:[48,226,530],b:[458,386,316],note:[48,366,350],
 p:[[0,610,28,470,''],[1,790,386,186,'w'],[3,246,536,186,'w'],[2,48,470,190,'w']]},
10:{ // 宝相花为头光——银饰的圆
 c:['#efdfc6','#42181f','#9c2a3a','#d9b26a'],
 decor:`${pearls(392,232,732,232,24,2.6)}`,
 k:[['indigo-ring',30,-26,358,0]],
 head:[392,30,350],a:[392,250,340],b:[752,350,330],note:[392,526,330],
 p:[[0,44,44,330,'o'],[1,764,28,176,'w'],[2,952,40,136,'w'],[3,44,356,320,'w']]},
11:{ // 连环画横贯全页——壁画里的故事本就是横着读的，五格连看像奔跑
 c:['#efe2c9','#33160c','#a8391c','#e7bd84'],
 decor:`<rect y="228" width="1120" height="244" fill="#6b2415"/>${pearls(8,240,1112,240,56,3.4,'#ecc477')}${pearls(8,460,1112,460,56,3.4,'#ecc477')}`,
 k:[['nianhua',776,6,322,1.2]],
 head:[48,36,680,'row'],a:[56,496,480],b:[578,496,486],note:[152,192,580],
 p:[[0,46,254,267,''],[1,337,254,135,''],[2,496,254,130,''],[3,650,254,267,''],[4,941,254,131,'']]},
12:{ // 色底、右侧经卷式文字栏
 c:['#cfdcc9','#14322c','#1f6657','#aec6ab'],
 decor:`<rect x="700" y="30" width="390" height="640" fill="#f3ecd9"/><rect x="708" y="38" width="374" height="624" fill="none" stroke="var(--accent)" stroke-width="1"/><path d="M0 354H470V700H0Z" fill="var(--soft)"/>`,
 k:[['indigo-bird',-18,566,492,-1]],
 head:[46,388,410,'big'],a:[726,56,338],b:[726,296,338],note:[726,572,338],
 p:[[0,34,30,430,''],[1,474,30,210,''],[2,474,190,210,''],[3,474,350,210,''],[4,474,510,210,'']]},
13:{ // 波浪页眉与点线水路——河面
 c:WALL.qing,
 decor:`<path d="M0 0H1120V200C960 250 820 170 640 212S300 250 0 196Z" fill="var(--soft)"/><path d="M0 245C120 225 300 300 430 335S640 300 730 340 760 450 768 520 860 600 1120 590" fill="none" stroke="var(--accent)" stroke-width="3" stroke-dasharray="1 10" stroke-linecap="round"/>`,
 k:[['indigo-jiaxing',440,614,300,-1.2]],
 head:[48,30,600,'row'],a:[446,414,308],b:[800,244,286],note:[800,640,286],
 p:[[0,838,16,240,'w'],[1,56,250,360,'w'],[2,450,234,276,'w'],[3,56,470,300,'w']]},
14:{ // 藻井与卷草竖带，土黄地——一碗面的热气
 c:WALL.tuhuang,
 decor:`<path d="M0 0H374V700H0Z" fill="var(--soft)" opacity=".62"/>`,
 k:[['wood-table',-20,640,1160,0],['bowl',478,568,216,-1]],
 head:[44,30,316],a:[44,262,306],b:[800,326,290],note:[44,610,306],
 p:[[0,392,28,214,'c ring',,214],[1,642,28,258,'w'],[2,918,30,168,'o'],[3,392,262,190,'w'],[4,590,306,190,'w']]},
15:{ // 大号时间数字——夜色里的凌晨四点，石青夜色
 c:['#efe3cb','#33231b','#8f5a17','#163f4c'],
 decor:'<path d="M0 0H404V700H0Z" fill="var(--soft)"/><text x="36" y="168" font-size="136" font-family="Georgia,serif" fill="#e6c177">4:00</text><circle cx="344" cy="62" r="24" fill="#e6c177"/><circle cx="356" cy="54" r="22" fill="var(--soft)"/>',
 k:[['box',118,428,156,-3]],
 head:[44,236,330,'inv'],a:[436,270,306],b:[776,270,306],note:[44,600,320,'inv'],
 p:[[0,436,28,312,'w'],[1,778,28,300,'w'],[2,436,514,210,''],[3,660,514,210,''],[4,884,514,196,'']]},
16:{ // 横带贯穿、四角分布——黄顶白身的鱼糕
 c:['#f0e6d0','#3d2a14','#845510','#e3c476'],
 decor:`<path d="M0 262H1120V448H0Z" fill="var(--soft)"/>${pearls(8,262,1112,262,56,3)}${pearls(8,448,1112,448,56,3)}`,
 k:[['basket',952,256,132,2]],
 head:[48,284,700,'row'],a:[48,26,330],b:[752,470,330],note:[770,340,170],
 p:[[0,404,24,314,'w'],[1,748,24,334,'w'],[2,48,470,250,''],[3,310,470,250,''],[4,572,464,160,'']]},
17:{ // 叠色大圆与莲花——茶汤一圈圈漾开
 c:WALL.lv,
 decor:`<circle cx="566" cy="176" r="250" fill="var(--soft)" opacity=".5"/><circle cx="880" cy="440" r="210" fill="var(--soft)" opacity=".3"/>`,
 k:[['tray',92,478,184,-2]],
 head:[48,30,292,'sm'],a:[48,242,290],b:[800,190,286],note:[800,520,286],
 p:[[0,352,40,430,'o ring'],[1,800,24,180,'o'],[2,990,24,100,''],[3,372,330,170,'w'],[4,556,340,220,'w']]},
};

const dialog=document.createElement('dialog');dialog.className='artisan-diary'+(window.rough?' has-rough':'');dialog.setAttribute('aria-labelledby','diary-name');
dialog.innerHTML='<div class="dp-sheet"><div class="dp-page"></div><div class="dp-foot"><p class="dp-disclaimer"><b class="dp-kind"></b>据公开报道整理的纪实札记，并非人物亲笔日记。</p><div class="dp-actions"><button class="dp-info-toggle" type="button" aria-expanded="false">图注与来源</button><button class="dp-close" type="button" aria-label="关闭匠人故事"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>关闭</button></div></div><aside class="dp-info" hidden></aside></div>';document.body.append(dialog);
const sheet=dialog.querySelector('.dp-sheet'),page=dialog.querySelector('.dp-page'),info=dialog.querySelector('.dp-info'),toggle=dialog.querySelector('.dp-info-toggle'),kind=dialog.querySelector('.dp-kind');
let opener=null,closing=null,settled=null;
const pct=(v,t)=>(v/t*100).toFixed(3)+'%';
const slot=(s)=>`left:${pct(s[0],1120)};top:${pct(s[1],700)};width:${pct(s[2],1120)}`;
const cls=s=>s[3]?' '+s[3]:'';
function photo(d,spec){const[i,x,y,w,c,pos,forced]=spec,p=d.photos[i],h=forced||(/\bc\b/.test(c||'')?w:w/p.r);return `<figure class="dp-photo ${c||''}" tabindex="0" style="left:${pct(x,1120)};top:${pct(y,700)};width:${pct(w,1120)};height:${pct(h,700)};--ar:${(w/h).toFixed(3)}"><span class="dp-frame"><img src="${esc(p.src)}" alt="${esc(p.cap)}" style="object-position:${pos||'50% 50%'}"></span><figcaption>${esc(p.cap)}</figcaption></figure>`}
const clip=c=>{const[id,x,y,w,r]=c,m=window.ARTISAN_COLLAGE?.[id];return m?`<img class="dp-clip" src="${esc(m.src)}" alt="" style="left:${pct(x,1120)};top:${pct(y,700)};width:${pct(w,1120)};transform:rotate(${r||0}deg)">`:''};
function block(d,i,s){const[when,what]=String(d.dates[i]).split(' · ');return `<section class="dp-slot dp-block${cls(s)}" style="${slot(s)}"><time>${esc(when)}${what?`<i>${esc(what)}</i>`:''}</time><h3>${esc(d.headings[i])}</h3><p>${esc(d.paragraphs[i])}</p></section>`}
// 榜题：人名竖排。多人时按“、”和“与”分列，每列一组。
function plaque(name){const parts=name.split(/(?<=、)|(?=与)/);return `<h2 class="dp-name${parts.length>1?' many':''}" id="diary-name">${parts.map(n=>`<span>${esc(n)}</span>`).join('')}</h2>`}
function render(d){const L=LAYOUTS[d.id],s=styles[d.group],[paper,ink,accent,soft]=L.c,photos=L.p.map(q=>q[0]);
 const st=dialog.style;st.setProperty('--paper',paper);st.setProperty('--ink',ink);st.setProperty('--accent',accent);st.setProperty('--soft',soft);
 // 深色色地：全部文字改用壁面浅色（判定依据是壁面亮度，而不是逐页写死）
 const dark=parseInt(paper.slice(1,3),16)<140;dialog.classList.toggle('is-dark',dark);
 kind.textContent=s[0];
 const rest=L.p.slice(),first=rest.shift(),n=rest.length,split=Math.ceil(n/2);
 page.innerHTML=`<div class="dp-canvas dp-l${d.id}"><svg class="dp-decor" viewBox="0 0 1120 700" preserveAspectRatio="none" aria-hidden="true">${L.decor}</svg><i class="dp-tex" aria-hidden="true"></i>${(L.k||[]).map(clip).join('')}`+
  `<header class="dp-slot dp-head${cls(L.head)}" style="${slot(L.head)}">${plaque(d.person)}<div class="dp-lead"><p class="dp-title">${esc(d.title)}</p><p class="dp-project">${esc(d.project)}<span>${esc(d.place)}</span></p><p class="dp-identity">${esc(d.identity)}</p></div></header>`+
  photo(d,first)+block(d,0,L.a)+rest.slice(0,split).map(q=>photo(d,q)).join('')+block(d,1,L.b)+rest.slice(split).map(q=>photo(d,q)).join('')+
  (L.note?`<p class="dp-slot dp-note${cls(L.note)}" style="${slot(L.note)}">${esc(s[1])}</p>`:'')+`</div>`;
 const used=[...new Set(photos)].map(i=>d.photos[i]);
 const clips=[...new Set([...(L.k||[]).map(c=>c[0]),'tex-plaster'])].map(id=>window.ARTISAN_COLLAGE?.[id]).filter(Boolean),credit=m=>`${m.url?`<a href="${esc(m.url)}" target="_blank" rel="noopener noreferrer">${esc(m.credit)} ↗</a>`:esc(m.credit)}`;
 info.innerHTML=`<h3>图片</h3><ol>${used.map(p=>`<li>${esc(p.cap)}${p.person?'（人物照片）':''}<span>${p.url?`<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(p.credit)} ↗</a>`:esc(p.credit)}</span></li>`).join('')}</ol>${clips.length?`<h3>拼贴素材</h3><ol>${clips.map(m=>`<li>${esc(m.cap)}<span>${credit(m)}</span></li>`).join('')}</ol>`:''}<h3>文字来源</h3><ol>${d.sources.map(q=>`<li><a href="${esc(q[3])}" target="_blank" rel="noopener noreferrer">${esc(q[2])} ↗</a><span>${esc(q[0])} · ${esc(q[1])}</span></li>`).join('')}</ol><p>文字按报道归纳改写，章节名为编辑拟定；人物身份与经历以对应报道时点为准。未注明“人物照片”的均为项目资料图，并非传主本人；拼贴素材经裁切、抠图或撕边处理，是馆藏或公开资料，并非传主作品。整理于 2026 年 11 月。</p>`;
 page.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.closest('figure').classList.add('is-missing')},{once:true}));
}
// 起稿线：壁画先用赭线起稿，再一笔笔上色，线和色都不会绝对规整。这里用 Rough.js 重画纹样、色块和线框，
// 消掉矢量几何过分完美的机器感。种子按人物固定，同一页每次打开都一样；脚本没加载时保留 CSS 的规整版本。
const NS='http://www.w3.org/2000/svg';
const rng=seed=>()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
// 直边默认只有两个端点，抖动不到中段，所以先按步长加点
const densify=(x,y,w,h,step=64)=>{const pts=[],line=(x1,y1,x2,y2)=>{const n=Math.max(1,Math.round(Math.hypot(x2-x1,y2-y1)/step));for(let i=0;i<n;i++)pts.push([x1+(x2-x1)*i/n,y1+(y2-y1)*i/n])};line(x,y,x+w,y);line(x+w,y,x+w,y+h);line(x+w,y+h,x,y+h);line(x,y+h,x,y);return pts};
function sketchDecor(svg,seed){const rc=rough.svg(svg),rand=rng(seed);let n=seed*100;
 [...svg.querySelectorAll('path,rect,circle')].forEach(el=>{if(el.closest('defs'))return;
  const tag=el.tagName,num=k=>+el.getAttribute(k)||0,fill=el.getAttribute('fill'),solid=fill&&fill!=='none',stroke=el.getAttribute('stroke'),transform=el.getAttribute('transform');
  if(el.getAttribute('stroke-dasharray'))return;
  // 联珠：不走 Rough，直接让每一颗的位置和大小略有出入，像手点的
  if(tag==='circle'&&num('r')<8){el.setAttribute('cx',(num('cx')+(rand()-.5)*1.5).toFixed(1));el.setAttribute('cy',(num('cy')+(rand()-.5)*1.5).toFixed(1));el.setAttribute('r',(num('r')*(.82+rand()*.36)).toFixed(1));return}
  const small=!!transform,o={seed:++n,roughness:small?.55:1,bowing:1.1,maxRandomnessOffset:small?1:2.4,stroke:stroke||(solid?fill:'none'),strokeWidth:stroke?(num('stroke-width')||1):1.2};
  if(solid){o.fill=fill;o.fillStyle='solid'}
  const draw=q=>tag==='rect'?rc.polygon(densify(num('x'),num('y'),num('width'),num('height')),q):tag==='circle'?rc.circle(num('cx'),num('cy'),num('r')*2,q):rc.path(el.getAttribute('d'),q);
  const node=draw(o),put=(m,opacity)=>{if(transform)m.setAttribute('transform',transform);if(opacity)m.setAttribute('opacity',opacity);return m};
  put(node,el.getAttribute('opacity'));el.replaceWith(node);
 });
 const edge=rc.rectangle(8,8,1104,684,{seed:++n,stroke:'var(--accent)',strokeWidth:1,roughness:.9,bowing:1.4});edge.setAttribute('opacity','.5');svg.append(edge);
}
function layer(host,w,h){const svg=document.createElementNS(NS,'svg');svg.setAttribute('class','dp-rough');svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');host.prepend(svg);return svg}
function sketchFrames(seed){let n=seed*1000;
 page.querySelectorAll('.dp-photo').forEach(fig=>{const{width:w,height:h}=fig.querySelector('.dp-frame').getBoundingClientRect();if(!w)return;
  const u=parseFloat(getComputedStyle(fig).fontSize)/15,rc=rough.svg(layer(fig,w,h)),svg=fig.querySelector('.dp-rough'),line={stroke:'var(--accent)',roughness:1,bowing:1.2};
  const ring=(pad,width,stroke='var(--accent)')=>svg.append(rc.ellipse(w/2,h/2,w+pad*u,h+pad*u,{...line,seed:++n,stroke,strokeWidth:width*u}));
  if(fig.matches('.ring')){ring(16,8,'var(--soft)');ring(30,1.8);ring(42,1)}
  else if(fig.matches('.c,.o'))ring(9,1.4);
  else svg.append(rc.rectangle(-4*u,-4*u,w+8*u,h+8*u,{...line,seed:++n,strokeWidth:1.3*u}));
 });
 const name=page.querySelector('.dp-name'),{width:w,height:h}=name.getBoundingClientRect(),u=parseFloat(getComputedStyle(page.querySelector('.dp-canvas')).fontSize)/15,svg=layer(name,w,h),rc=rough.svg(svg);
 svg.append(rc.polygon(densify(0,0,w,h,26*u),{seed:++n,fill:'var(--plaque)',fillStyle:'solid',stroke:'var(--plaque)',strokeWidth:1,roughness:1,maxRandomnessOffset:1.8*u}),rc.rectangle(-5*u,-5*u,w+10*u,h+10*u,{seed:++n,stroke:'var(--plaque)',strokeWidth:1.2*u,roughness:1,bowing:1.2}));
}
function sketch(d){if(!window.rough)return;sketchDecor(page.querySelector('.dp-decor'),d.id);sketchFrames(d.id)}
function setInfo(open){info.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'收起图注':'图注与来源'}

// 持灯入窟：光从按下的按钮处照进来，壁面由近及远亮起，随后颜料显色、榜题落下。
const clamp=(v,a,b)=>Math.min(Math.max(v,a),b);
function aimLamp(button){const r=sheet.getBoundingClientRect(),b=button?.getBoundingClientRect(),x=b?clamp(b.left+b.width/2-r.left,0,r.width):r.width/2,y=b?clamp(b.top+b.height/2-r.top,0,r.height):r.height/2,far=Math.hypot(Math.max(x,r.width-x),Math.max(y,r.height-y));
 sheet.style.setProperty('--lx',x+'px');sheet.style.setProperty('--ly',y+'px');sheet.style.setProperty('--lamp-end',Math.ceil(far*1.5)+'px')}
function open(id,button){const d=data.find(x=>x.id===id);if(!d)return;opener=button;render(d);setInfo(false);document.documentElement.classList.add('diary-no-scroll');dialog.classList.remove('is-closing');dialog.showModal();dialog.scrollTop=0;sketch(d);aimLamp(button);dialog.classList.add('is-opening');clearTimeout(settled);settled=setTimeout(()=>dialog.classList.remove('is-opening'),1200);dialog.querySelector('.dp-close').focus({preventScroll:true})}
function close(){if(!dialog.open||closing)return;dialog.classList.remove('is-opening');dialog.classList.add('is-closing');closing=setTimeout(()=>{dialog.close();reset()},240)}
// close 事件要等渲染帧才派发，后台标签页里可能迟迟不来，所以关闭时主动收尾；事件只兜底第二次按 Esc 的强制关闭。
function reset(){clearTimeout(closing);closing=null;dialog.classList.remove('is-opening','is-closing');document.documentElement.classList.remove('diary-no-scroll');opener?.focus();opener=null}
document.querySelectorAll('.project__text h2,main .cards article > h2').forEach(h=>{const d=data.find(d=>d.project===h.textContent.trim());if(!d)return;const row=document.createElement('div');row.className='artisan-title-row';h.before(row);row.append(h);const b=document.createElement('button');b.type='button';b.className='artisan-story-tag';b.textContent='匠人故事';b.setAttribute('aria-haspopup','dialog');b.setAttribute('aria-label',`打开${d.person}的匠人故事`);b.addEventListener('click',()=>open(d.id,b));row.append(b)});
toggle.addEventListener('click',()=>setInfo(info.hidden));
dialog.querySelector('.dp-close').addEventListener('click',close);
sheet.addEventListener('animationend',e=>{if(e.target===sheet)dialog.classList.remove('is-opening')});
dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
dialog.addEventListener('close',reset);
dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
})();
