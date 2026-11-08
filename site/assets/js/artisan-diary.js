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

// ── 手账槽位系统（逐页迁移中）────────────────────────────────────────────
// 画布 1120×700 切成 8 列 × 6 行：列宽 116、行高 90、槽 16、边距 40。所有色块边界落在网格线或半格（列 +58 / 行 +45）上。
// PAGES 里登记过的页走这套；没登记的仍用上面的 LAYOUTS（LAYOUTS 是回退路径，也是每页独有 decor 的存档，别删）。
const G={x0:40,y0:40,cw:116,ch:90,gap:16,cols:8};
const gx=k=>G.x0+Math.floor(k)*(G.cw+G.gap)+(k%1)*G.cw;        // 列 k 的左边（k 可为 .5）
const gy=k=>G.y0+Math.floor(k)*(G.ch+G.gap)+(k%1)*G.ch;        // 行 k 的上边
const ex=e=>e%1?gx(e):gx(e)-G.gap, ey=e=>e%1?gy(e):gy(e)-G.gap; // 跨到第 e 条线时的右/下边（整数线要退回一个槽）
// [列,行,跨列,跨行] → 像素盒；flip 时左右镜像
const box=([c,r,cs=1,rs=1],flip)=>{if(flip)c=G.cols-c-cs;const x=gx(c),y=gy(r);return{x,y,w:ex(c+cs)-x,h:ey(r+rs)-y}};
const at=b=>`left:${pct(b.x,1120)};top:${pct(b.y,700)};width:${pct(b.w,1120)};height:${pct(b.h,700)}`;

// ── §3.5 撕边：把直边和正圆全部换掉 ──────────────────────────────────────
// 所有 seed 由 d.id 派生（d.id*1000+k），同一页每次打开撕口完全一致；全程不用 Math.random()。
// 轮廓一律按屏幕坐标顺时针走（上→右→下→左），外法线 = (dy,-dx)/len；depth 为正时撕口整体朝外偏置。
function tornEdge(ax,ay,bx,by,depth,seed,step=7){const rnd=rng(seed),dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy)||1,n=Math.max(4,Math.round(len/step)),nx=dy/len,ny=-dx/len,pts=[];
 for(let i=0;i<=n;i++){const t=i/n;
  // 低频正弦给方向感，高频抖动给毛刺；0.35 的偏置让撕口整体外凸，而不是贴着边线上下对称地波动
  const wave=Math.sin(t*Math.PI*3.1+seed)*.45+(rnd()-.5)*1.15,taper=Math.sin(t*Math.PI)**.35,d=depth?depth*taper*(.35+wave):0;
  pts.push([ax+dx*t+nx*d,ay+dy*t+ny*d])}
 return pts}
// 点列 → 平滑 path（Catmull-Rom 转三次贝塞尔），放大也看不到棱角。p 为小数位（objectBoundingBox 坐标要 4 位）
function toPath(pts,closed=true,p=1){const P=closed?[...pts,pts[0]]:pts,f=v=>v.toFixed(p);let d=`M${f(P[0][0])} ${f(P[0][1])}`;
 for(let i=0;i<P.length-1;i++){const p0=P[i-1]||P[i],p1=P[i],p2=P[i+1],p3=P[i+2]||P[i+1];
  d+=`C${f(p1[0]+(p2[0]-p0[0])/6)} ${f(p1[1]+(p2[1]-p0[1])/6)} ${f(p2[0]-(p3[0]-p1[0])/6)} ${f(p2[1]-(p3[1]-p1[1])/6)} ${f(p2[0])} ${f(p2[1])}`}
 return d+(closed?'Z':'')}
// 每块纸片最多撕 2 条边，优先级 下 > 右 > 上 > 左；多给的边按优先级丢掉（limit 只给照片框的轻撕放宽）
const EDGE_ORDER=['bottom','right','top','left'];
function pickEdges(t={},limit=2){const o={top:0,right:0,bottom:0,left:0};EDGE_ORDER.filter(k=>t[k]).slice(0,limit).forEach(k=>o[k]=t[k]);return o}
function paperPts(x,y,w,h,seed,t){const e=(a,b,c,d2,dep,k)=>tornEdge(a,b,c,d2,dep,seed+k).slice(0,-1);
 return [...e(x,y,x+w,y,t.top,1),...e(x+w,y,x+w,y+h,t.right,2),...e(x+w,y+h,x,y+h,t.bottom,3),...e(x,y+h,x,y,t.left,4)]}
function paperPath(x,y,w,h,seed,torn={},limit=2){return toPath(paperPts(x,y,w,h,seed,pickEdges(torn,limit)))}
// 手撕圆：半径带扰动，替换所有 border-radius:50%。照片框 amp .035 / 头光 .02 / 印章 .06
function tornCircle(cx,cy,r,seed,amp=.05,k=7,p=1){const rnd=rng(seed),N=64,pts=[];
 for(let i=0;i<N;i++){const a=i/N*Math.PI*2,wob=1+amp*Math.sin(a*k+seed)+(rnd()-.5)*amp*.9;pts.push([cx+Math.cos(a)*r*wob,cy+Math.sin(a)*r*wob])}
 return toPath(pts,true,p)}

// 拱形（窑门）：左沿自下而上 → 半圆拱顶 → 右沿自上而下 → 底边。pad 向外扩，dep 为两侧撕口深度，amp 为拱顶半径扰动
function archPts(w,h,seed,pad=0,dep=0,amp=.02){const r=w/2,R=r+pad,rnd=rng(seed+7),pts=[...tornEdge(-pad,h,-pad,r,dep,seed+1).slice(0,-1)];
 for(let i=0,N=36;i<N;i++){const a=Math.PI+i/N*Math.PI,wob=1+amp*Math.sin(a*6+seed)+(rnd()-.5)*amp*.9;pts.push([r+Math.cos(a)*R*wob,r+Math.sin(a)*R*wob])}
 return [...pts,...tornEdge(w+pad,r,w+pad,h,dep,seed+2).slice(0,-1),...tornEdge(w+pad,h,-pad,h,0,seed+3).slice(0,-1)]}

// 母版只描述骨架。纸片 = 定位容器（不裁切）+ 撕边背景 svg + 文字层，三者分开，文字内边距 ≥ 撕口深度 + 10px。
// tone 取 --soft/--accent，o 为透明度 1/.78/.42 三档；torn 写各边撕口深度（中撕 10–16，轻撕 4–6）。
// 照片区（上沿 3–7 列、右侧 6–7 列、两纸片之间）每页按自己的图比例落位：PAGES[].slots；不写则按 scatter 自动分。
// tape = [x,y,长,角度]（像素，中心落在两块交界处）。所有坐标按“不镜像”写，flip 时整体左右翻。
const MASTERS={
 A:{ // 散点拼贴：人物强、照片质量高，让照片当主角。留白只留一处，在人名的对角（2 列 × 1 行）
  head:{at:[0,0,3,2],tone:'soft',o:.42,torn:{bottom:12,right:10}},
  // 段落纸片宽 2.5–3.5 列（一行 18–24 字）；高 2.5 行：实测 110 字的段落在 2 行高里会溢出，按“调母版不缩字号”放到半格
  blocks:{a:{at:[.5,2,3,2.5],tone:'soft',o:.78,torn:{bottom:14,right:10},rot:-.6,strip:16}, // 右沿与 b 共线，撕开才能咬合
          b:{at:[3.5,3.5,2.5,2.5],tone:'accent',inv:1,torn:{bottom:14,right:12},rot:.7,strip:120}},
  decor:[{at:[0,4.5,3.5,1.5],tone:'accent',o:.42,torn:{right:10,top:12}}],
  spot:{at:[6,2,2,2],dy:19},
  scene:{at:[6,0,2,2],tone:'soft',o:.42,torn:{bottom:12,right:10}},
  scatter:[{at:[3,0],w:2},{at:[5,0],w:1,tall:1},{at:[4,2],w:1.5}],
  note:[0,5,3,1], // 和人名同号，两行；占下方装饰纸底边，右端让开 b 的时间标签和胶带
  tape:[[178,252,118,-7],[494,648,100,4]], // 第二条压在 b 侧沿的下边距里，避开正文末行
  seal:[1036,612],
 },
 B:{ // 主轴贯穿：一条横带把上下分开，像手账里的时间轴。其余照片沿带的上沿交替跨压（下沿落在带上，高低错开）；
     // 带下左右两张段落纸，中间一栏放本页记忆点。段落纸 2.5 行高：方案的 2 行装不下 100 字以上的段落，按“调母版不缩字号”加高，带相应收窄到半行。
     // 留白只留一处：在照片列上方（带上沿照片与页眉之间），人名对角让给了 b 纸片——主轴版的 b 必须落在带下右侧。
  head:{at:[0,0,3.5,2.5],tone:'soft',o:.42,torn:{bottom:12,right:10}}, // 下沿撕口咬进横带
  band:{at:[0,2.5,8,.5],tone:'accent',o:1,torn:{bottom:5,top:5}},
  labels:[[0,2.5,'01'],[7,2.5,'02']],
  // 段落纸宽 2.5 / 3 列（一行 18–22 字），首字不下沉（方案：B/D 段落较窄）
  blocks:{a:{at:[.5,3.5,2.5,2.5],tone:'soft',o:.78,torn:{bottom:14,right:10},rot:-.5,strip:18},
          b:{at:[5,3.5,3,2.5],tone:'accent',inv:1,torn:{bottom:14,right:12},rot:.6,strip:18}},
  decor:[{at:[3.5,1,4.5,1.5],tone:'soft',o:.42,torn:{top:10,right:8}}, // 照片下垫的一条纸
         {at:[3,3.5,2,2.5],tone:'accent',o:.42,torn:{bottom:10,top:8}}], // 中间一栏给记忆点垫的卡纸
  note:[5,0,3,1], // 和人名同号，两行，需要 3 列宽
  tape:[[150,401,100,-3],[780,401,100,3]], // 第一条让开 a 角上的大号年份
  seal:[1030,646],
  vnote:false,
 },
 C:{ // 左右分区：左边一整列实色手撕纸（撕口朝右）承载人名与段落 01；右边自由——一列竖排照片 + 右上记忆点与横图 + 右下段落 02。
     // 段落 02 宽 3 列（方案的 4 列一行会到 33 字，超出 18–24 字的行宽），时间标签贴在它外侧（右）、年份压在左上角，让开上方照片。
     // 留白只留一处：note 那一行的左段（短句右对齐后空出来的 2–3 列）。
  head:{at:[0,0,3,2.5],tone:'soft',o:0}, // 2.5 行：群像页榜题常有三四列人名
  blocks:{a:{at:[.5,2.5,2.5,3.5],tone:'soft',o:0,torn:{},rot:0,strip:18,minPad:{right:28}}, // 文字直接写在左列上；右内边距让开左列 16px 的撕口
          b:{at:[4.5,3,3,3],tone:'accent',inv:1,torn:{bottom:14},rot:.6,strip:18,stripR:1,yearL:1}},
  decor:[{at:[0,0,3,6],tone:'soft',o:1,torn:{right:16,bottom:10}}], // 左列，通高
  scene:{at:[6.5,1,1.5,2],tone:'soft',o:.42,torn:{bottom:10,right:8}},
  note:[4,0,4,1],
  tape:[[420,585,100,-6],[940,358,100,4]], // 第二条让开 b 左上角的年份
  seal:[1034,615],
  vnote:false,
 },
};
// 每页：母版 + 色组 + 镜像 + 记忆点（spot）。同一母版的页靠这三件事拉开差异。
// spot.type：ring 绷圈 / arch 窑门 / records 唱片 / window 影窗。k 为拼贴件 [素材名,列,行,跨列,旋转]；seal 为印章字；scene 为长卷裁出的小景。
const SCENE='../assets/images/diary/scenes/';
const PAGES={
 1:{m:'A',c:'qing',flip:1,seal:'录',k:[['jar',.05,5,.6,-2]],
  // 记忆点：主图嵌进窑门——拱形框外两道撕边拱圈，像一层层窑砖
  spot:{type:'arch',idx:0,at:[6,2,2,1],h:282},
  slots:[{i:1,at:[3,0],w:2},{i:3,at:[5,0],w:1},{i:2,at:[4,2],w:1.5}],
  scene:{src:SCENE+'scene-porcelain-vase.webp',cap:'青花玉壶春瓶（插画局部）'}},
 2:{m:'A',c:'zhu',flip:0,seal:'传',k:[['strip-dragon',0,4.62,2,-1]],
  // 记忆点：主图做成绣绷——手撕头光即绷圈，一根丝线从绷上牵出，落到段落 02
  spot:{type:'ring',idx:1},thread:1,
  scene:{src:SCENE+'scene-suzhou-hoop.webp',cap:'绣绷上的牡丹与丝线（插画局部）'}},
 3:{m:'B',c:'shilv',flip:0,seal:'记',
  // 记忆点：人物照上撑开一面伞——手撕伞面、九根伞骨（标题里那把“不能省掉根”的伞）
  spot:{type:'umbrella',idx:0,photo:[436,460,160]},
  slots:[{i:2,x:510,w:116,bot:336},{i:4,x:636,w:190,bot:300},{i:1,x:836,w:116,bot:330},{i:3,x:962,w:116,bot:316}]},
 4:{m:'B',c:'tuhuang',flip:1,seal:'录',
  // 记忆点：梁架照装进四根出头搭接的梁枋里，像榫卯
  spot:{type:'joint',idx:0,photo:[448,380,170]},
  slots:[{i:1,x:510,w:116,bot:336},{i:3,x:638,w:146,bot:300},{i:4,x:800,w:146,bot:326},{i:2,x:962,w:116,bot:310}]},
 14:{m:'B',c:'lv',flip:0,seal:'传',
  // 记忆点：王永中端着热干面的头像做成一只碗口，三缕热气往上冒（原图是带白边的圆头像，框对准那个圆）
  spot:{type:'steam',idx:0,photo:[444,450,180],zoom:[.472,.461,.33]},
  slots:[{i:3,x:510,w:116,bot:336},{i:1,x:636,w:150,bot:304},{i:2,x:796,w:116,bot:330},{i:4,x:940,w:116,bot:314}]},
 16:{m:'B',c:'shiqing',flip:1,seal:'录',
  // 记忆点：围成一圈的鱼糕切片装进圆框，上半圈压一道粗黄边——鱼糕“黄顶白身”的切面
  spot:{type:'fishcake',idx:0,photo:[446,424,180]},
  slots:[{i:4,x:510,w:116,bot:336},{i:1,x:634,w:148,bot:300},{i:2,x:790,w:148,bot:326},{i:3,x:946,w:134,bot:304}]},
 17:{m:'B',c:'qing',flip:0,seal:'传',
  // 记忆点：白瓷盘里的干茶放进圆框，外面三圈渐淡的水纹，像茶汤一圈圈漾开
  spot:{type:'ripple',idx:1,photo:[451,440,170]},
  slots:[{i:2,x:510,w:116,bot:336},{i:0,x:634,w:157,bot:300},{i:3,x:799,w:116,bot:330},{i:4,x:923,w:157,bot:312}]},
 8:{m:'C',c:'shiqing',flip:0,seal:'传',
  // 记忆点：帘幕后的操偶照下伸出三根铁枝（题目“三根铁枝，撑起一座小戏台”）
  spot:{type:'rods',idx:0,photo:[436,146,174]},
  slots:[{i:2,x:626,y:146,w:248},{i:1,x:436,y:440,w:174}],
  scene:{src:SCENE+'scene-iron-rod-puppet.webp',cap:'铁枝木偶（插画局部）'}},
 9:{m:'C',c:'qing',flip:1,seal:'录',k:[['indigo-sea',3,4.85,1.3,-1]],
  // 记忆点：海边王船那张下面压一条手撕船身和一道水纹
  spot:{type:'hull',idx:0,photo:[626,146,200]},
  slots:[{i:3,x:882,y:146,w:198},{i:1,x:436,y:146,w:174},{i:2,x:436,y:391,w:174}]},
 10:{m:'C',c:'zhu',flip:0,seal:'记',
  // 记忆点：银冠照下沿一道银条，垂下一排银铃流苏
  spot:{type:'fringe',idx:1,photo:[436,146,174]},
  slots:[{i:4,x:626,y:146,w:284},{i:0,x:942,y:146,w:138},{i:3,x:942,y:254,w:138},{i:2,x:436,y:490,w:106}]},
 6:{m:'A',c:'tuhong',flip:0,seal:'记',k:[['robe-band',0,4.62,3,0]],
  // 记忆点：两张唱片——人物照压在两张手撕圆的唱片上（题目“两张唱片，引她走进老生的世界”）
  spot:{type:'records',idx:0,at:[6,2,2,2],discs:[[1000,298,66],[878,342,92]],photo:[912,334,156]},
  slots:[{i:3,at:[3,0],w:2},{i:2,at:[5,0],w:1},{i:1,at:[4,2],w:1.5}],
  scene:{src:SCENE+'scene-opera-stage.webp',cap:'戏台与花旦（插画局部）'}},
 7:{m:'A',c:'mei',flip:1,seal:'传',k:[['shadow',.05,4.95,.42,3]],
  // 记忆点：影窗——主图装进一道粗撕边的窗框，纱幕后的三位艺人就是窗里的戏
  spot:{type:'window',idx:0,at:[3,0,2.5,2]},
  slots:[{i:1,at:[6,2],w:2},{i:2,at:[4,2.25],w:1.4},{i:3,at:[6,3.7],w:1.5}],
  scene:{src:SCENE+'scene-shadow-screen.webp',cap:'纱幕皮影（插画局部）'}},
};

const em=px=>(px/15).toFixed(3)+'em'; // 画布 1em = 15px（按 1120 宽计）
// 纸片：bg 只放撕边 path（含一层壁面肌理），txt 放文字；撕口朝外，文字层再按深度留足内边距
function paperEl(b,q,seed,{cls='',html='',tag='div',style=''}={}){const t=pickEdges(q.torn),id=`dp-pp${seed}`,d=paperPath(0,0,b.w,b.h,seed,t),tex=window.ARTISAN_COLLAGE?.['tex-plaster'];
 const pad=k=>em(Math.max(14,t[k]+10,(q.minPad||{})[k]||0)),rot=q.rot?`;transform:rotate(${q.rot}deg)`:'';
 return `<${tag} class="dp-paper is-${q.tone}${q.inv?' inv':''}${cls}" style="${at(b)}${rot}${style}"><svg class="dp-paper-bg" viewBox="0 0 ${b.w} ${b.h}" preserveAspectRatio="none" aria-hidden="true"><clipPath id="${id}"><path d="${d}"/></clipPath><path d="${d}" fill="var(--${q.tone})" fill-opacity="${q.o||1}"/>${tex&&(q.o??1)>0?`<image href="${esc(tex.src)}" x="-20" y="-20" width="${b.w+40}" height="${b.h+40}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})" opacity=".3" style="mix-blend-mode:multiply"/>`:''}</svg>`+
  (html?`<div class="dp-paper-txt" style="padding:${pad('top')} ${pad('right')} ${pad('bottom')} ${pad('left')}">${html}</div>`:'')+`</${tag}>`}
// 照片：方角换成轻撕 4px，圆框换成手撕圆；保留“壁面色留白 + 一线矿物色”，只是那两环也跟着撕。
// shape：rect 普通 / circle 绷圈（加头光）/ arch 窑门（加拱圈）/ window 影窗（加粗窗框）
//        umbrella 伞（照片上方撑一面手撕伞面）/ joint 榫卯（四根梁枋出头搭接）/ steam 一碗热气（手撕圆 + 三缕热气）
//        fishcake 鱼糕切面（上半圈一道粗黄边 = 黄顶白身）/ ripple 茶汤漾开（三圈渐淡的水纹）
// zoom=[cx,cy,d]：图里本来就是一张圆形头像（网页配图带白边和题字）时，把框对准那个圆，cx/cy 为圆心、d 为直径占图宽的比例；只去白边，不裁主体
function tornPhoto(d,i,b,seed,defs,shape='rect',zoom){const p=d.photos[i],{w,h}=b,id=`dp-k${seed}`,P=shape==='umbrella'?140:shape==='steam'?90:shape==='rods'?72:/^(hull|fringe|ripple)$/.test(shape)?52:30,r=w/2,norm=pts=>toPath(pts.map(([x,y])=>[x/w,y/h]),true,4);
 const clipD=/^(circle|steam|fishcake|ripple)$/.test(shape)?tornCircle(.5,.5,.488,seed,.035,7,4):shape==='arch'?norm(archPts(w,h,seed,-1.5,-3,.02)):norm(paperPts(0,0,w,h,seed,{top:-4,right:-4,bottom:-4,left:-4}));
 defs.push(`<clipPath id="${id}" clipPathUnits="objectBoundingBox"><path d="${clipD}"/></clipPath>`);
 const rect=(pad,dep,k)=>paperPath(-pad,-pad,w+pad*2,h+pad*2,seed+k,{top:dep*.6,right:dep,bottom:dep,left:dep*.6},4);
 const ring={
  circle:`<path d="${tornCircle(r,h/2,r+3.4,seed+1,.035)}" fill="var(--paper)"/><path d="${tornCircle(r,h/2,r+9,seed+2,.02)}" fill="none" stroke="var(--soft)" stroke-width="8"/><path d="${tornCircle(r,h/2,r+16,seed+3,.02)}" fill="none" stroke="var(--accent)" stroke-width="1.8"/><path d="${tornCircle(r,h/2,r+22,seed+4,.02)}" fill="none" stroke="var(--accent)" stroke-width="1"/>`,
  arch:`<path d="${toPath(archPts(w,h,seed+1,3.4,2,.02))}" fill="var(--paper)"/><path d="${toPath(archPts(w,h,seed+2,10,3,.02))}" fill="none" stroke="var(--soft)" stroke-width="9"/><path d="${toPath(archPts(w,h,seed+3,18,3,.015))}" fill="none" stroke="var(--accent)" stroke-width="1.8"/><path d="${toPath(archPts(w,h,seed+4,24,2,.015))}" fill="none" stroke="var(--accent)" stroke-width="1"/>`,
  window:`<path d="${rect(3.4,2,1)}" fill="var(--paper)"/><path d="${rect(10,3,2)}" fill="none" stroke="var(--accent)" stroke-width="9"/><path d="${rect(19,3,3)}" fill="none" stroke="var(--accent)" stroke-width="1.2"/>`,
  rect:`<path d="${rect(3.2,3,1)}" fill="var(--paper)"/><path d="${rect(4.6,4,2)}" fill="none" stroke="var(--accent)" stroke-width="1"/>`};
 ring.steam=ring.circle;ring.umbrella=ring.joint=ring.rect;
 const base=`<path d="${tornCircle(r,h/2,r+3.4,seed+1,.035)}" fill="var(--paper)"/>`;
 // 半圈手撕弧：沿圆周取点，半径带轻扰动，开口路径
 const arc=(R,a0,a1,k,amp=.02)=>{const rnd=rng(seed+k),pts=[];for(let j=0;j<=40;j++){const a=a0+(a1-a0)*j/40,wob=1+amp*Math.sin(a*7+seed)+(rnd()-.5)*amp*.9;pts.push([r+Math.cos(a)*R*wob,h/2+Math.sin(a)*R*wob])}return toPath(pts,false)};
 // 鱼糕：先垫一圈壁面色的底，黄边压在底上才看得出（中间那栏的垫纸本身就是黄色调）
 ring.fishcake=`<path d="${tornCircle(r,h/2,r+16,seed+1,.03)}" fill="var(--paper)"/><path d="${arc(r+9,Math.PI*1.04,Math.PI*1.96,5)}" fill="none" stroke="var(--accent)" stroke-width="11" stroke-linecap="round"/><path d="${tornCircle(r,h/2,r+21,seed+6,.02)}" fill="none" stroke="var(--accent)" stroke-width="1.2"/>`;
 ring.ripple=base+[[10,1.6,.8],[19,1.2,.5],[28,1,.28]].map(([o,sw2,op],k)=>`<path d="${tornCircle(r,h/2,r+o,seed+7+k,.025)}" fill="none" stroke="var(--accent)" stroke-width="${sw2}" stroke-opacity="${op}"/>`).join('');
 let extra='';
 if(shape==='umbrella'){ // 伞面：上半圆，伞骨之间的伞面略向里收（扇形边），顶上一截伞尖
  const R=w*.62,cx=w/2,cy=-6,N=9,rnd=rng(seed+5),rim=[];
  for(let k=0;k<=72;k++){const a=Math.PI+k/72*Math.PI,ph=(k/72*(N-1))%1,dip=1-.045*(1-Math.abs(Math.cos(ph*Math.PI)));rim.push([cx+Math.cos(a)*R*dip*(1+(rnd()-.5)*.02),cy+Math.sin(a)*R*dip*(1+(rnd()-.5)*.02)])}
  const ribs=Array.from({length:N},(_,k)=>{const a=Math.PI+k/(N-1)*Math.PI;return `M${cx.toFixed(1)} ${cy.toFixed(1)}L${(cx+Math.cos(a)*R*.99).toFixed(1)} ${(cy+Math.sin(a)*R*.99).toFixed(1)}`}).join('');
  extra=`<path d="${toPath([...rim,[cx+R,cy+2],[cx-R,cy+2]])}" fill="var(--accent)" fill-opacity=".42"/><path d="${ribs}" fill="none" stroke="var(--accent)" stroke-width="1.4" stroke-opacity=".9"/><path d="M${cx} ${cy-R}L${cx} ${cy-R-14}" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>`}
 if(shape==='joint'){ // 梁枋：上下两根横枋、左右两根立柱，四角各出头一截，像榫卯搭接
  const o=10,x=22,line=(ax,ay,bx,by,k)=>toPath(tornEdge(ax,ay,bx,by,1.2,seed+k,9),false);
  extra=[line(-x,-o,w+x,-o,11),line(-x,h+o,w+x,h+o,12),line(-o,-x,-o,h+x,13),line(w+o,-x,w+o,h+x,14)].map(d2=>`<path d="${d2}" fill="none" stroke="var(--accent)" stroke-width="7" stroke-linecap="square"/>`).join('')}
 if(shape==='steam'){ // 三缕热气，自碗沿向上，左右轻摆
  extra=[.32,.5,.68].map((q,k)=>{const rnd=rng(seed+20+k),pts=[];for(let j=0;j<=8;j++){const t=j/8;pts.push([w*q+Math.sin(t*Math.PI*2.2+k*1.7)*7*(1-t*.3)+(rnd()-.5)*1.5,-8-t*(58-k*6)])}
   return `<path d="${toPath(pts,false)}" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round" stroke-opacity=".75"/>`}).join('')}
 if(shape==='rods'){ // 三根铁枝：自照片下沿伸出，略向中间收，末端一个手柄
  extra=[[.28,.4],[.5,.5],[.72,.6]].map(([q,e],k)=>{const x0=w*q,x1=w*(q+(e-q)*.5),pts=tornEdge(x0,h+3,x1,h+62,1,seed+30+k,8);const[ex2,ey2]=pts[pts.length-1];return `<path d="${toPath(pts,false)}" fill="none" stroke="var(--ink)" stroke-width="2.2" stroke-linecap="round"/><path d="${tornCircle(ex2,ey2+3,4,seed+35+k,.12)}" fill="var(--accent)"/>`}).join('')}
 if(shape==='hull'){ // 王船：照片下压一条手撕船身（梯形），再下一道水纹
  const e=(ax,ay,bx,by,k)=>tornEdge(ax,ay,bx,by,2,seed+40+k,8).slice(0,-1);
  extra=`<path d="${toPath([...e(-16,h+5,w+16,h+5,1),...e(w+16,h+5,w-14,h+30,2),...e(w-14,h+30,14,h+30,3),...e(14,h+30,-16,h+5,4)])}" fill="var(--accent)"/><path d="${toPath(Array.from({length:25},(_,j)=>[-24+j*(w+48)/24,h+40+Math.sin(j*1.1+seed)*3]),false)}" fill="none" stroke="var(--accent)" stroke-width="1.4" stroke-linecap="round"/>`}
 if(shape==='fringe'){ // 银饰流苏：照片下沿一道手撕银条，垂下一排长短相间的银铃
  const N=11,rnd=rng(seed+50);extra=`<path d="${paperPath(-10,h+3,w+20,9,seed+51,{bottom:2,top:1.5})}" fill="var(--accent)"/>`+Array.from({length:N},(_,k)=>{const x=-4+k*(w+8)/(N-1),L=k%2?22:34,y2=h+12+L+(rnd()-.5)*3;return `<path d="M${x.toFixed(1)} ${h+12}L${(x+(rnd()-.5)*2).toFixed(1)} ${y2.toFixed(1)}" stroke="var(--accent)" stroke-width="1.2"/><path d="${tornCircle(x,y2+3.5,3.6,seed+60+k,.12)}" fill="var(--paper)" stroke="var(--accent)" stroke-width="1.1"/>`}).join('')}
 const ringSvg=(ring[shape]||ring.rect)+extra;
 return `<figure class="dp-photo torn dp-${shape}" tabindex="0" style="${at(b)};--ar:${(w/h).toFixed(3)}"><svg class="dp-ring" viewBox="${-P} ${-P} ${w+2*P} ${h+2*P}" style="left:${(-P/w*100).toFixed(3)}%;top:${(-P/h*100).toFixed(3)}%;width:${((w+2*P)/w*100).toFixed(3)}%;height:${((h+2*P)/h*100).toFixed(3)}%" aria-hidden="true">${ringSvg}</svg><span class="dp-frame" style="clip-path:url(#${id})"><img src="${esc(p.src)}" alt="${esc(p.cap)}"${zoom?` style="position:absolute;max-width:none;width:${(100/zoom[2]).toFixed(2)}%;height:auto;left:${(50-zoom[0]/zoom[2]*100).toFixed(2)}%;top:${(50-zoom[1]/(zoom[2]*p.r)*100).toFixed(2)}%"`:""}></span><figcaption>${esc(p.cap)}</figcaption></figure>`}
// 唱片：手撕圆盘 + 几圈唱纹 + 中心标签，全用本页四色
function records(discs,seed,f){return `<svg class="dp-records" viewBox="0 0 1120 700" preserveAspectRatio="none" aria-hidden="true">${discs.map(([x,y,r],k)=>{const cx=f?1120-x:x,s=seed+k*10;
 return `<path d="${tornCircle(cx,y,r,s,.03)}" fill="var(--soft)" stroke="var(--accent)" stroke-width="1" stroke-opacity=".7"/>${[.88,.76,.64,.52].map((q,j)=>`<path d="${tornCircle(cx,y,r*q,s+j+1,.02)}" fill="none" stroke="var(--ink)" stroke-opacity=".16" stroke-width="1"/>`).join('')}<path d="${tornCircle(cx,y,r*.32,s+6,.04)}" fill="var(--accent)"/><path d="${tornCircle(cx,y,r*.045,s+7,.1)}" fill="var(--paper)"/>`}).join('')}</svg>`}

function renderGrid(d,P){const M=MASTERS[P.m],f=P.flip,s=styles[d.group],S=d.id*1000,defs=[],SP=P.spot;
 const head=box(M.head.at,f),sp=SP.at||M.spot?box(SP.at||M.spot.at,f):null;
 // 记忆点主图的盒子：ring 为正方形（竖向按 dy 微调），arch 用给定高度，window 按原图比例，records 由页面给出像素位
 const spotB=SP.type==='ring'?{x:sp.x,y:sp.y+(SP.dy??M.spot.dy),w:sp.w,h:sp.w}:SP.type==='arch'?{x:sp.x,y:sp.y,w:sp.w,h:SP.h}:SP.type==='window'?{x:sp.x,y:sp.y,w:sp.w,h:sp.w/d.photos[SP.idx].r}:
  (()=>{const[x,y,w]=SP.photo;return{x:f?1120-x-w:x,y,w,h:/^(steam|fishcake|ripple)$/.test(SP.type)?w:w/d.photos[SP.idx].r}})(),sw=spotB.w;
 // 其余照片：页面写了 slots 就照写，否则按 scatter 自动分（竖图先占 tall 槽）；高度一律按原图比例，不裁成方形
 let placed=[];
 // slots 两种写法：{i,at:[列,行],w:跨列}；或主轴母版用的像素写法 {i,x,w,bot}——照片下沿落在 bot，跨在横带上
 if(P.slots)placed=P.slots.map((q,o)=>{if(q.x!=null){const h=q.w/d.photos[q.i].r;return{i:q.i,o,b:{x:f?1120-q.x-q.w:q.x,y:q.y??q.bot-h,w:q.w,h}}}const b=box([q.at[0],q.at[1],q.w,1],f);return{i:q.i,o,b:{...b,h:b.w/d.photos[q.i].r}}});
 else{const rest=d.photos.map((p,i)=>i).filter(i=>i!==SP.idx),slots=M.scatter.slice();
  rest.sort((a,b)=>d.photos[a].r-d.photos[b].r).forEach(i=>{const tall=d.photos[i].r<.85,k=Math.max(0,slots.findIndex(q=>!!q.tall===tall)),q=slots.splice(k,1)[0];if(!q)return;
   const b=box([q.at[0],q.at[1],q.w,1],f);placed.push({i,o:M.scatter.indexOf(q),b:{...b,h:b.w/d.photos[i].r}})});
  placed.sort((a,b)=>a.o-b.o)}
 // 段落纸片 + 外置时间标签 + 角上大号年份 + 首字下沉；时间仍写在文字层里，供窄屏和读屏使用
 const block=(k,i)=>{const q=M.blocks[k],b=box(q.at,f),[when,what='']=String(d.dates[i]).split(' · '),yr=(when.match(/\d{4}/)||[''])[0];
  const html=`<time>${esc(when)}${what?`<i>${esc(what)}</i>`:''}</time><h3>${esc(d.headings[i])}</h3><p>${esc(d.paragraphs[i])}</p>`;
  // 58×90 起，字多时按竖排字数加高（.78em ≈ 11.7px/字，上下各留 9px + 撕口 5px），不缩字号
  const sh=Math.max(90,Math.ceil(Math.max(when.length,what.length)*13.5+24)),sr=(q.stripR?1:0)^(f?1:0),strip={x:sr?b.x+b.w-12:b.x-46,y:b.y+q.strip,w:58,h:sh};
  const stripEl=`<b class="dp-strip" aria-hidden="true" style="${at(strip)}"><svg class="dp-paper-bg" viewBox="0 0 58 ${sh}" preserveAspectRatio="none"><path d="${paperPath(0,0,58,sh,S+40+i,{bottom:5,right:4})}" fill="var(--accent)"/></svg><span>${esc(when)}</span>${what?`<span>${esc(what)}</span>`:''}</b>`;
  // 年份压在纸片外上角（远离时间标签那一侧）
  const yl=(q.yearL?1:0)^(f?1:0),year=yr?`<b class="dp-year${yl?' l':''}" aria-hidden="true" style="left:${pct(yl?b.x+40:b.x+b.w-40-140,1120)};top:${pct(b.y-34,700)};width:${pct(140,1120)}">${yr}</b>`:'';
  return paperEl(b,{...q,rot:(f?-1:1)*(q.rot||0),minPad:{...q.minPad,...(sr?{right:22}:{left:22})}},S+10+i*5,{cls:' dp-slot dp-block',tag:'section',html})+stripEl+year};
 const decor=M.decor.map((q,i)=>paperEl(box(q.at,f),q,S+60+i*5,{cls:' is-decor'})).join('');
 // 长卷小景：连纸底一起贴在一块手撕纸片上
 // 深色壁面上改用墨色（即浅米色）卡纸，长卷本是画在米黄纸上的
 const darkWall=parseInt(WALL[P.c][0].slice(1,3),16)<140,scene=P.scene&&M.scene?paperEl(box(M.scene.at,f),darkWall?{...M.scene,tone:"ink",o:1}:M.scene,S+80,{cls:' dp-scene-card',html:`<img class="dp-scene" src="${esc(P.scene.src)}" alt="">`}):'';
 const tape=M.tape.map(([x,y,len,deg],i)=>{const r=rng(S+90+i),cut=(2+r()*5).toFixed(1),X=f?1120-x:x;
  // 两端不齐：一端斜切（像从卷上撕下），另一端打碎 3–4 个点
  return `<i class="dp-tape" aria-hidden="true" style="left:${pct(X-len/2,1120)};top:${pct(y,700)};width:${pct(len,1120)};transform:translateY(-50%) rotate(${(f?-1:1)*deg}deg);clip-path:polygon(${cut}% 0,${(97+r()*2).toFixed(1)}% ${(r()*12).toFixed(1)}%,100% ${(38+r()*10).toFixed(1)}%,${(96+r()*3).toFixed(1)}% ${(70+r()*10).toFixed(1)}%,${(98+r()*2).toFixed(1)}% 100%,0 100%)"></i>`}).join('');
 const [sx0,sy0]=M.seal,seal=P.seal?`<b class="dp-seal" aria-hidden="true" style="left:${pct((f?1120-sx0-40:sx0),1120)};top:${pct(sy0,700)}"><svg viewBox="0 0 40 40"><path d="${tornCircle(20,20,19,S+95,.06)}" fill="var(--accent)"/></svg><span>${esc(P.seal)}</span></b>`:'';
 const clips=(P.k||[]).map(([id,c,r,cs,rot])=>{const b=box([c,r,cs,1],f);return clip([id,b.x,b.y,b.w,rot])}).join('');
 // 竖排批注：贴在 a 纸片外侧，写地点
 // 主轴横带（母版 B）：一条手撕实色带横贯全页，带上一排手点的联珠（小手撕圆，不用正圆），两端压 01 / 02 标签
 let band='';if(M.band){const bb=box(M.band.at,f),cy=bb.y+bb.h/2,rnd=rng(S+70);band=paperEl(bb,M.band,S+71,{cls:' is-decor dp-band'})+
  `<svg class="dp-pearls" viewBox="0 0 1120 700" preserveAspectRatio="none" aria-hidden="true">${Array.from({length:Math.floor(bb.w/22)},(_,k)=>`<path d="${tornCircle(bb.x+11+k*22+(rnd()-.5)*1.6,cy+(rnd()-.5)*1.6,2.4*(.85+rnd()*.3),S+700+k,.12,5)}" fill="var(--paper)" fill-opacity=".85"/>`).join('')}</svg>`+
  M.labels.map(([c,r,t],k)=>{const lb=box([c,r,1,.5],f);return `<b class="dp-label" aria-hidden="true" style="${at(lb)}"><svg class="dp-paper-bg" viewBox="0 0 ${lb.w} ${lb.h}" preserveAspectRatio="none"><path d="${paperPath(0,0,lb.w,lb.h,S+75+k,{bottom:4,right:4})}" fill="var(--paper)"/></svg><span>${t}</span></b>`}).join('')}
 const ab=box(M.blocks.a.at,f),vnote=M.vnote===false?'':`<p class="dp-vnote" aria-hidden="true" style="left:${pct(f?ab.x-24:ab.x+ab.w+10,1120)};top:${pct(ab.y+18,700)}">${esc(d.place)}</p>`;
 // 丝线：从绷圈左下牵出，落到 b 纸片右沿
 let thread='';if(P.thread){const bb=box(M.blocks.b.at,f),cx=spotB.x+sw/2,cy=spotB.y+sw/2,a0=f?Math.PI/4:Math.PI*3/4,R=sw/2+22,sx=cx+Math.cos(a0)*R,sy=cy+Math.sin(a0)*R,tx=f?bb.x-14:bb.x+bb.w+14,ty=bb.y+bb.h*.78,qx=(sx+tx)/2+(f?20:-20),qy=Math.max(sy,ty)+10,
  a=Math.atan2(ty-qy,tx-qx),hd=t=>`${round(tx-11*Math.cos(a+t))} ${round(ty-11*Math.sin(a+t))}`;
  thread=`<path d="M${round(sx)} ${round(sy)}Q${round(qx)} ${round(qy)} ${round(tx)} ${round(ty)}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="1 8" stroke-linecap="round"/><path d="M${hd(.5)}L${round(tx)} ${round(ty)}L${hd(-.5)}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`}
 const photos=placed.map((q,k)=>tornPhoto(d,q.i,q.b,S+100+k*10,defs)),split=Math.ceil(photos.length/2);
 const spotEl=(SP.type==='records'?records(SP.discs,S+300,f):'')+tornPhoto(d,SP.idx,spotB,S+200,defs,{ring:'circle',arch:'arch',window:'window',records:'rect'}[SP.type]||SP.type,SP.zoom);
 const nb=box(M.note,f);
 const headHtml=`<header class="dp-head">${plaque(d.person)}<div class="dp-lead"><p class="dp-title">${esc(d.title)}</p><p class="dp-project">${esc(d.project)}<span>${esc(d.place)}</span></p><p class="dp-identity">${esc(d.identity)}</p></div></header>`;
 return `<div class="dp-canvas dp-grid dp-m${P.m} dp-l${d.id}"><i class="dp-tex" aria-hidden="true"></i><svg class="dp-decor" viewBox="0 0 1120 700" preserveAspectRatio="none" aria-hidden="true">${thread}</svg>${decor}${band}${clips}${scene}`+
  paperEl(head,M.head,S+1,{cls:' dp-head-paper',html:headHtml})+spotEl+block('a',0)+photos.slice(0,split).join('')+block('b',1)+photos.slice(split).join('')+
  `<p class="dp-slot dp-note end${f?' start':''}" style="${at(nb)}"><span class="dp-note-t">${s[1].split(/(?<=，)/).map(x=>`<span>${esc(x)}</span>`).join('')}</span></p>${vnote}${tape}${seal}<svg class="dp-defs" width="0" height="0" aria-hidden="true">${defs.join('')}</svg></div>`;
}
// 小标题前的手绘短横（Rough.js），不用 • — ▸ 这类字体符号
function sketchGrid(seed){if(!page.querySelector('.dp-grid'))return;let n=seed*1000+500;
 page.querySelectorAll('.dp-grid .dp-paper-txt h3').forEach(h=>{const svg=document.createElementNS(NS,'svg');svg.setAttribute('class','dp-h3-mark');svg.setAttribute('viewBox','0 0 28 12');svg.setAttribute('aria-hidden','true');
  const rc=rough.svg(svg);svg.append(rc.line(1,6.5,26,5.2,{seed:++n,stroke:'currentColor',strokeWidth:2.2,roughness:1.4,bowing:2}));h.prepend(svg)})}

const dialog=document.createElement('dialog');dialog.className='artisan-diary'+(window.rough?' has-rough':'');dialog.setAttribute('aria-labelledby','diary-name');
dialog.innerHTML='<div class="dp-sheet"><div class="dp-page"></div><div class="dp-foot"><p class="dp-disclaimer"><b class="dp-kind"></b>据公开报道整理的纪实札记，并非人物亲笔日记。</p><div class="dp-actions"><button class="dp-info-toggle" type="button" aria-expanded="false"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.6h3.8L9 3.8V10.4H3z" fill="none" stroke="currentColor" stroke-width="1.05" stroke-linejoin="round"/><path d="M6.8 1.6v2.2H9" fill="none" stroke="currentColor" stroke-width="1.05" stroke-linejoin="round"/><path d="M4.6 5.9h2.8M4.6 7.9h2.8" fill="none" stroke="currentColor" stroke-width="1.05" stroke-linecap="round"/></svg><span class="dp-info-label">图注与来源</span></button><button class="dp-close" type="button" aria-label="关闭匠人故事"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>关闭</button></div></div><aside class="dp-info" hidden></aside></div>';document.body.append(dialog);
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
function render(d){const P=PAGES[d.id],L=P?{c:WALL[P.c],k:P.k}:LAYOUTS[d.id],s=styles[d.group],[paper,ink,accent,soft]=L.c,photos=P?d.photos.map((p,i)=>i):L.p.map(q=>q[0]);
 const st=dialog.style;st.setProperty('--paper',paper);st.setProperty('--ink',ink);st.setProperty('--accent',accent);st.setProperty('--soft',soft);
 // 深色色地：全部文字改用壁面浅色（判定依据是壁面亮度，而不是逐页写死）
 const dark=parseInt(paper.slice(1,3),16)<140;dialog.classList.toggle('is-dark',dark);
 kind.textContent=s[0];
 if(P)page.innerHTML=renderGrid(d,P);else{
 const rest=L.p.slice(),first=rest.shift(),n=rest.length,split=Math.ceil(n/2);
 page.innerHTML=`<div class="dp-canvas dp-l${d.id}"><svg class="dp-decor" viewBox="0 0 1120 700" preserveAspectRatio="none" aria-hidden="true">${L.decor}</svg><i class="dp-tex" aria-hidden="true"></i>${(L.k||[]).map(clip).join('')}`+
  `<header class="dp-slot dp-head${cls(L.head)}" style="${slot(L.head)}">${plaque(d.person)}<div class="dp-lead"><p class="dp-title">${esc(d.title)}</p><p class="dp-project">${esc(d.project)}<span>${esc(d.place)}</span></p><p class="dp-identity">${esc(d.identity)}</p></div></header>`+
  photo(d,first)+block(d,0,L.a)+rest.slice(0,split).map(q=>photo(d,q)).join('')+block(d,1,L.b)+rest.slice(split).map(q=>photo(d,q)).join('')+
  (L.note?`<p class="dp-slot dp-note${cls(L.note)}" style="${slot(L.note)}">${esc(s[1])}</p>`:'')+`</div>`;}
 const used=[...new Set(photos)].map(i=>d.photos[i]);
 const clips=[...new Set([...(L.k||[]).map(c=>c[0]),'tex-plaster'])].map(id=>window.ARTISAN_COLLAGE?.[id]).filter(Boolean).concat(P?.scene?[{cap:P.scene.cap,credit:'自本站首页时间轴长卷裁切'}]:[]),credit=m=>`${m.url?`<a href="${esc(m.url)}" target="_blank" rel="noopener noreferrer">${esc(m.credit)} ↗</a>`:esc(m.credit)}`;
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
 page.querySelectorAll('.dp-photo:not(.torn)').forEach(fig=>{const{width:w,height:h}=fig.querySelector('.dp-frame').getBoundingClientRect();if(!w)return;
  const u=parseFloat(getComputedStyle(fig).fontSize)/15,rc=rough.svg(layer(fig,w,h)),svg=fig.querySelector('.dp-rough'),line={stroke:'var(--accent)',roughness:1,bowing:1.2};
  const ring=(pad,width,stroke='var(--accent)')=>svg.append(rc.ellipse(w/2,h/2,w+pad*u,h+pad*u,{...line,seed:++n,stroke,strokeWidth:width*u}));
  if(fig.matches('.ring')){ring(16,8,'var(--soft)');ring(30,1.8);ring(42,1)}
  else if(fig.matches('.c,.o'))ring(9,1.4);
  else svg.append(rc.rectangle(-4*u,-4*u,w+8*u,h+8*u,{...line,seed:++n,strokeWidth:1.3*u}));
 });
 const name=page.querySelector('.dp-name'),{width:w,height:h}=name.getBoundingClientRect(),u=parseFloat(getComputedStyle(page.querySelector('.dp-canvas')).fontSize)/15,svg=layer(name,w,h),rc=rough.svg(svg);
 svg.append(rc.polygon(densify(0,0,w,h,26*u),{seed:++n,fill:'var(--plaque)',fillStyle:'solid',stroke:'var(--plaque)',strokeWidth:1,roughness:1,maxRandomnessOffset:1.8*u}),rc.rectangle(-5*u,-5*u,w+10*u,h+10*u,{seed:++n,stroke:'var(--plaque)',strokeWidth:1.2*u,roughness:1,bowing:1.2}));
}
function sketch(d){if(!window.rough)return;sketchDecor(page.querySelector('.dp-decor'),d.id);sketchFrames(d.id);sketchGrid(d.id)}
function setInfo(open){info.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.querySelector('.dp-info-label').textContent=open?'收起图注':'图注与来源'}

// 持灯入窟：光从按下的按钮处照进来，壁面由近及远亮起，随后颜料显色、榜题落下。
const clamp=(v,a,b)=>Math.min(Math.max(v,a),b);
function aimLamp(button){const r=sheet.getBoundingClientRect(),b=button?.getBoundingClientRect(),x=b?clamp(b.left+b.width/2-r.left,0,r.width):r.width/2,y=b?clamp(b.top+b.height/2-r.top,0,r.height):r.height/2,far=Math.hypot(Math.max(x,r.width-x),Math.max(y,r.height-y));
 sheet.style.setProperty('--lx',x+'px');sheet.style.setProperty('--ly',y+'px');sheet.style.setProperty('--lamp-end',Math.ceil(far*1.5)+'px')}
function open(id,button){const d=data.find(x=>x.id===id);if(!d)return;opener=button;render(d);setInfo(false);document.documentElement.classList.add('diary-no-scroll');dialog.classList.remove('is-closing');dialog.showModal();dialog.scrollTop=0;sketch(d);aimLamp(button);dialog.classList.add('is-opening');clearTimeout(settled);settled=setTimeout(()=>dialog.classList.remove('is-opening'),1200);dialog.querySelector('.dp-close').focus({preventScroll:true})}
function close(){
 if(!dialog.open||closing)return;
 clearTimeout(settled);
 const style=getComputedStyle(sheet),opening=dialog.classList.contains('is-opening');
 sheet.style.setProperty('--lamp-start',opening?style.getPropertyValue('--lamp'):style.getPropertyValue('--lamp-end'));
 sheet.style.setProperty('--lamp-transform',style.transform);
 sheet.style.setProperty('--lamp-opacity',style.opacity);
 dialog.style.setProperty('--backdrop-start',getComputedStyle(dialog,'::backdrop').opacity);
 // 保留尚未结束的显色与榜题动画，关闭光圈从当前半径接续。
 dialog.classList.add('is-closing');
 const delay=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:240;
 closing=setTimeout(()=>{dialog.close();reset()},delay);
}
// close 事件要等渲染帧才派发，后台标签页里可能迟迟不来，所以关闭时主动收尾；事件只兜底第二次按 Esc 的强制关闭。
function reset(){clearTimeout(closing);clearTimeout(settled);closing=null;sheet.style.removeProperty('--lamp-start');sheet.style.removeProperty('--lamp-transform');sheet.style.removeProperty('--lamp-opacity');dialog.style.removeProperty('--backdrop-start');dialog.classList.remove('is-opening','is-closing');document.documentElement.classList.remove('diary-no-scroll');opener?.focus();opener=null}
// 按钮图标的手绘质感：共用一个滤镜，让笔画边缘像马克笔那样微微起伏
if(!document.getElementById('astRough')){const defs=document.createElementNS('http://www.w3.org/2000/svg','svg');defs.setAttribute('width','0');defs.setAttribute('height','0');defs.setAttribute('aria-hidden','true');defs.style.position='absolute';defs.innerHTML='<filter id="astRough" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="1.6"/></filter>';document.body.append(defs);}
document.querySelectorAll('.project__text h2,main .cards article > h2').forEach(h=>{const d=data.find(d=>d.project===h.textContent.trim());if(!d)return;const row=document.createElement('div');row.className='artisan-title-row';h.before(row);row.append(h);const b=document.createElement('button');b.type='button';b.className='artisan-story-tag';b.innerHTML='<svg class="ast-icon" viewBox="0 0 48 48" aria-hidden="true"><g filter="url(#astRough)" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path class="ast-ticks" d="M5.2 15.8v4.6M5.3 24.6v.2M5.4 27.6v.2" stroke-width="2.6"/><path d="M10.4 9.6 34.8 9.1M10.1 9.9 10.4 37.4M10.6 38.6 36.1 38.2M35.8 22.6 35.9 37.6" stroke-width="3.3"/><path d="M15.2 15.6h12.6M14.8 21.4h8.4M14.9 27.4h14.6M14.7 33.2h16.4" stroke-width="2.8"/><g class="ast-pencil" transform="translate(23.4 28.6) rotate(-45)"><path d="M0 0 6.4-3.4H25.6V3.4H6.4Z" fill="var(--ast-paper)" stroke-width="2.7"/><path d="M6.6-1.2H25.2M6.6 1.2H25.2" stroke-width="1.5"/><path d="M25.6-3.4h2.8a3.4 3.4 0 0 1 0 6.8h-2.8M27.6-3.2v6.4" fill="var(--ast-paper)" stroke-width="2.7"/></g></g></svg><span>匠人故事</span>';b.setAttribute('aria-haspopup','dialog');b.setAttribute('aria-label',`打开${d.person}的匠人故事`);b.addEventListener('click',()=>open(d.id,b));row.append(b)});
toggle.addEventListener('click',()=>setInfo(info.hidden));
dialog.querySelector('.dp-close').addEventListener('click',close);
sheet.addEventListener('animationend',e=>{if(e.target===sheet)dialog.classList.remove('is-opening')});
dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
dialog.addEventListener('close',reset);
dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
})();
