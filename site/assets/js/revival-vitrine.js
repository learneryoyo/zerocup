/* 叩启新生：六座玻璃展柜排成 2×3，叩三次碎开。六座展柜展示苗绣、芜湖铁画、纳西七星羊皮、羌绣、大漆与湖笔的旧艺新用。 */
(() => {
  'use strict';

  const stage = document.getElementById('vitrines');
  const reset = document.getElementById('vitrine-reset');
  if (!stage || !reset) return;

  const COUNT = 6;
  let postcardTimer;
  const exhibits = [
    { kind: 'miao', oldName: '苗绣', newName: '苗绣艾草锤', oldImage: 'miao-embroidery.webp', newImage: 'miao-mugwort-mallet.webp' },
    { kind: 'iron', oldName: '芜湖铁画', newName: '铁画小夜灯', oldImage: 'wuhu-iron-painting.webp', newImage: 'wuhu-iron-nightlight.webp' },
    { kind: 'naxi', oldName: '纳西七星羊皮披肩', newName: '纳西七星羊皮小包', oldImage: 'naxi-seven-star-cape.webp', newImage: 'naxi-seven-star-bag.webp' },
    { kind: 'qiang', oldName: '羌绣', newName: '羊角花甜品', oldImage: 'qiang-embroidery.webp', newImage: 'qiang-flower-dessert.webp' },
    { kind: 'lacquer', oldName: '大漆·采漆', newName: '大漆音响', oldImage: 'lacquer-tree.webp', newImage: 'lacquer-speaker.webp' },
    { kind: 'hubi', oldName: '善琏湖笔制作', newName: '“笔未央”美妆笔', oldImage: 'hubi-making.webp', newImage: 'hubi-biweiyang-brushes.webp' }
  ];
  let postcardOpener;
  const postcard = document.createElement('dialog');
  postcard.className = 'miao-postcard';
  postcard.setAttribute('aria-labelledby', 'miao-postcard-title');
  postcard.innerHTML = `
    <button class="miao-close" type="button" aria-label="收起明信片" autofocus>×</button>
    <article class="miao-postcard-layout">
      <div class="miao-postcard-art">
        <span class="miao-edition">古艺新生 · 藏品来信 / 01</span>
        <img src="assets/images/revival/miao-mugwort-mallet.webp" alt="靛蓝绣面、花卉纹样与缠线手柄组成的两支苗绣艾草锤">
        <p>把一针一线，寄给日常。</p>
        <span class="miao-art-caption">苗绣纹样 × 艾草锤</span>
      </div>
      <div class="miao-postcard-letter">
        <div class="miao-postmark" aria-hidden="true">古艺新生<br><small>湘西 · 花垣</small></div>
        <div class="miao-stamp" aria-hidden="true"><img src="assets/images/revival/miao-embroidery.webp" alt=""><span>苗绣 · 01</span></div>
        <p class="miao-postcard-kicker">POSTCARD / 一封非遗来信</p>
        <h2 id="miao-postcard-title">苗绣艾草锤</h2>
        <p class="miao-address">寄往：每一个需要慢下来的日常</p>
        <p>你好，见字如晤。</p>
        <p>曾装点衣裳、背被与荷包的苗绣，如今有了握在手心的新模样。花鸟与几何纹样走出展柜，包裹一团艾草，也留住针线里的生活记忆。</p>
        <dl class="miao-facts">
          <div><dt>旧艺</dt><dd>湘西苗绣于 2021 年列入国家级非遗代表性项目名录扩展项目，兼具装饰与实用之美。</dd></div>
          <div><dt>新用</dt><dd>绣面、艾草、手柄与缠绳组合成日用小锤。花垣已有将手推绣与手工组装结合的生产实践。</dd></div>
        </dl>
        <p class="miao-signature">纹样留下来，生活焕个新。<br><span>—— 来自古艺新生的一份问候</span></p>
        <details class="miao-sources"><summary>来信出处与图像说明</summary><p><a href="https://www.ihchina.cn/art/detail/id/23718.html" target="_blank" rel="noopener noreferrer">中国非遗网 · 湘西苗绣</a><br><a href="https://xianf.jsu.edu.cn/shsj/sxx/6275c8977eb24d59adb8bf268297ea87.htm" target="_blank" rel="noopener noreferrer">吉首大学 · 花垣苗绣实地调研（2024）</a></p><p>配图为用户提供的设计示意，未据此认定具体产地、品牌或针法；“以旧换新”表现传统纹样的当代转化，并非将旧绣实物拆改。</p></details>
      </div>
    </article>`;
  const postcardTemplates = [postcard.innerHTML, "    <button class=\"miao-close\" type=\"button\" aria-label=\"收起明信片\" autofocus>×</button>\n    <article class=\"miao-postcard-layout\">\n      <div class=\"miao-postcard-art\">\n        <span class=\"miao-edition\">古艺新生 · 藏品来信 / 02</span>\n        <img src=\"assets/images/revival/wuhu-iron-nightlight.webp\" alt=\"木框内绘有徽派街巷的小夜灯，暖光映亮铁画线条\">\n        <p>把一幅铁画，点成一盏晚安。</p>\n        <span class=\"miao-art-caption\">芜湖铁画 × 桌边微光</span>\n      </div>\n      <div class=\"miao-postcard-letter\">\n        <div class=\"miao-postmark\" aria-hidden=\"true\">古艺新生<br><small>安徽 · 芜湖</small></div>\n        <div class=\"miao-stamp\" aria-hidden=\"true\"><img src=\"assets/images/revival/wuhu-iron-painting.webp\" alt=\"\"><span>铁画 · 02</span></div>\n        <p class=\"miao-postcard-kicker\">POSTCARD / 一封非遗来信</p>\n        <h2 id=\"miao-postcard-title\">铁画小夜灯</h2>\n        <p class=\"miao-address\">寄往：晚归时，为你亮着灯的窗</p>\n        <p>你好，见字如晤。</p>\n        <p>一枝梅、一只鸟，曾在锤与火之间化作铁的笔墨。如今，画里的线条遇见柔和灯光，徽派街巷也有了夜色中的温度。把它放在桌边，让看得见的手艺，陪伴每一个平常的夜晚。</p>\n        <dl class=\"miao-facts\">\n          <div><dt>旧艺</dt><dd>芜湖铁画锻制技艺于 2006 年入选首批国家级非遗名录。匠人以熟铁为材，经锻打、焊接等工序，让国画意境拥有立体的线条。</dd></div>\n          <div><dt>新用</dt><dd>铁画原有画灯等传统形式。这次焕新将铁画意趣与木框、暖光结合，转化为适合桌边摆放的小夜灯，让赏画融入日常照明。</dd></div>\n        </dl>\n        <p class=\"miao-signature\">铁骨藏诗意，微光照日常。<br><span>—— 来自古艺新生的一份问候</span></p>\n        <details class=\"miao-sources\"><summary>来信出处与图像说明</summary><p><a href=\"https://www.ihchina.cn/ccr_detail/14329/\" target=\"_blank\" rel=\"noopener noreferrer\">中国非遗网 · 芜湖铁画锻制技艺</a><br><a href=\"https://paper.people.com.cn/rmrbhwb/pad/content/202506/12/content_30078568.html\" target=\"_blank\" rel=\"noopener noreferrer\">人民日报海外版 · 芜湖铁画（2025）</a></p><p>配图为用户提供的焕新设计示意，未据此认定具体品牌、材质工艺或灯具参数。</p></details>\n      </div>\n    </article>\n"];
  postcardTemplates.push("    <button class=\"miao-close\" type=\"button\" aria-label=\"收起明信片\" autofocus>×</button>\n    <article class=\"miao-postcard-layout\">\n      <div class=\"miao-postcard-art\">\n        <span class=\"miao-edition\">古艺新生 · 藏品来信 / 03</span>\n        <img src=\"assets/images/revival/naxi-seven-star-bag.webp\" alt=\"以纳西七星羊皮披肩为灵感的小包与装框文创组合，保留圆饰、垂穗和黑白层次\">\n        <p>把披在肩上的星月，带在身边。</p>\n        <span class=\"miao-art-caption\">纳西七星羊皮 × 随身小包</span>\n      </div>\n      <div class=\"miao-postcard-letter\">\n        <div class=\"miao-postmark\" aria-hidden=\"true\">古艺新生<br><small>云南 · 丽江</small></div>\n        <div class=\"miao-stamp\" aria-hidden=\"true\"><img src=\"assets/images/revival/naxi-seven-star-cape.webp\" alt=\"\"><span>七星 · 03</span></div>\n        <p class=\"miao-postcard-kicker\">POSTCARD / 一封非遗来信</p>\n        <h2 id=\"miao-postcard-title\">纳西七星羊皮小包</h2>\n        <p class=\"miao-address\">寄往：带着星月，走向生活的你</p>\n        <p>你好，见字如晤。</p>\n        <p>在丽江，七星羊皮披肩把星月缝进衣裳，也把勤劳与祝福留在肩上。如今，圆饰、垂穗与黑白相间的层次，化作一只随身小包。装下日常的小物，也带上一段纳西族的服饰记忆。</p>\n        <dl class=\"miao-facts\">\n          <div><dt>旧艺</dt><dd>七星羊皮披肩是纳西族传统服饰的特色部分。七个圆饰与日月装饰构成“披星戴月”的文化意象，常被赋予勤劳的寓意。</dd></div>\n          <div><dt>新用</dt><dd>将披肩的形制与装饰缩小，转为可携带、可收纳的小包。丽江已有传承人开发七星羊皮包，让传统服饰技艺走进当代生活。</dd></div>\n        </dl>\n        <p class=\"miao-signature\">星月常相伴，步履向日常。<br><span>—— 来自古艺新生的一份问候</span></p>\n        <details class=\"miao-sources\"><summary>来信出处与图像说明</summary><p><a href=\"https://www.ccdi.gov.cn/special/jtsj/jt_jtsj/201709/t20170914_107118.html\" target=\"_blank\" rel=\"noopener noreferrer\">中央纪委国家监委网站 · 纳西族服饰介绍</a><br><a href=\"https://www.lijiang.cn/news/travel/article/150926.html\" target=\"_blank\" rel=\"noopener noreferrer\">丽江网 · 七星不落：“披星戴月”的传承之旅</a></p><p>配图为用户提供的设计示意；不同款式对传统装饰有所简化，不据图认定具体品牌、皮料或制作工艺。</p></details>\n      </div>\n    </article>\n");
  postcardTemplates.push("    <button class=\"miao-close\" type=\"button\" aria-label=\"收起明信片\" autofocus>×</button>\n    <article class=\"miao-postcard-layout\">\n      <div class=\"miao-postcard-art\">\n        <span class=\"miao-edition\">古艺新生 · 藏品来信 / 04</span>\n        <img src=\"assets/images/revival/qiang-flower-dessert.webp\" alt=\"羊角花主题甜品设计组合：花形甜点、花饰碗装甜品与高脚盘摆盘\">\n        <p>让针尖的花，开在甜蜜里。</p>\n        <span class=\"miao-art-caption\">羌绣 × 羊角花甜品</span>\n      </div>\n      <div class=\"miao-postcard-letter\">\n        <div class=\"miao-postmark\" aria-hidden=\"true\">古艺新生<br><small>四川 · 羌乡</small></div>\n        <div class=\"miao-stamp\" aria-hidden=\"true\"><img src=\"assets/images/revival/qiang-embroidery.webp\" alt=\"\"><span>羌绣 · 04</span></div>\n        <p class=\"miao-postcard-kicker\">POSTCARD / 一封非遗来信</p>\n        <h2 id=\"miao-postcard-title\">羊角花甜品</h2>\n        <p class=\"miao-address\">寄往：愿意为一朵花停留的你</p>\n        <p>你好，见字如晤。</p>\n        <p>曾绣在衣襟、围腰与鞋面上的花，带着羌乡的色彩与心意，来到今天的甜品盘中。针线间的层次，化作花瓣的起伏；日常里的祝福，也有了可以相聚分享的新模样。</p>\n        <dl class=\"miao-facts\">\n          <div><dt>旧艺</dt><dd>羌绣常以几何图案、花鸟与自然景物装点衣物，兼具装饰与实用价值，寄托对美好生活的向往。</dd></div>\n          <div><dt>新用</dt><dd>以羌绣羊角花为灵感，将纹样与配色转译为甜品的造型与装饰。人民网已有相关跨界甜品报道，让传统文化在餐桌上获得新的相遇。</dd></div>\n        </dl>\n        <p class=\"miao-signature\">花开针线间，甜意到日常。<br><span>—— 来自古艺新生的一份问候</span></p>\n        <details class=\"miao-sources\"><summary>来信出处与图像说明</summary><p><a href=\"https://www.ihchina.cn/news_1_details/11393.html\" target=\"_blank\" rel=\"noopener noreferrer\">中国非遗网 · 羌绣介绍</a><br><a href=\"https://sc.people.com.cn/n2/2026/0114/c345167-41472446.html\" target=\"_blank\" rel=\"noopener noreferrer\">人民网四川频道 · 羌绣羊角花跨界甜品（2026）</a></p><p>配图为用户提供的设计示意。焕新展示纹样与造型的转化，甜品原料、口味及品牌未据图认定；图一作为羌绣展示，不据图判定其具体纹样名称。</p></details>\n      </div>\n    </article>\n");
  postcardTemplates.push("    <button class=\"miao-close\" type=\"button\" aria-label=\"收起明信片\" autofocus>×</button>\n    <article class=\"miao-postcard-layout\">\n      <div class=\"miao-postcard-art\">\n        <span class=\"miao-edition\">古艺新生 · 藏品来信 / 05</span>\n        <img src=\"assets/images/revival/lacquer-speaker.webp\" alt=\"青绿与金色斑驳漆面包覆的立式音响，正面有两枚圆形扬声单元\">\n        <p>让山林的漆色，遇见生活的旋律。</p>\n        <span class=\"miao-art-caption\">大漆髹饰 × 日常聆听</span>\n      </div>\n      <div class=\"miao-postcard-letter\">\n        <div class=\"miao-postmark\" aria-hidden=\"true\">古艺新生<br><small>漆艺 · 新声</small></div>\n        <div class=\"miao-stamp\" aria-hidden=\"true\"><img src=\"assets/images/revival/lacquer-tree.webp\" alt=\"\"><span>大漆 · 05</span></div>\n        <p class=\"miao-postcard-kicker\">POSTCARD / 一封非遗来信</p>\n        <h2 id=\"miao-postcard-title\">大漆音响</h2>\n        <p class=\"miao-address\">寄往：愿为一首歌停留的你</p>\n        <p>你好，见字如晤。</p>\n        <p>一滴漆，从树干走向器物；一层光，在髹饰与打磨中慢慢显现。当传统漆艺遇见音响，青绿与金色在箱体上交织，熟悉的旋律，也有了可以静静欣赏的外衣。</p>\n        <dl class=\"miao-facts\">\n          <div><dt>旧艺</dt><dd>天然生漆采自漆树，是传统漆艺的重要材料。匠人通过髹涂、干燥与打磨等工序，在器物表面形成富有层次的漆面。</dd></div>\n          <div><dt>新用</dt><dd>把漆艺用于音响箱体表面，让日常电子产品承载手作肌理。长江日报报道了漆艺向蓝牙音响等用品的拓展；公开专利也记录了生漆涂饰音箱的保护与装饰应用。</dd></div>\n        </dl>\n        <p class=\"miao-signature\">漆色可赏，日常有声。<br><span>—— 来自古艺新生的一份问候</span></p>\n        <details class=\"miao-sources\"><summary>来信出处与图像说明</summary><p><a href=\"https://www.forestry.gov.cn/c/www/smcqzt/151316.jhtml\" target=\"_blank\" rel=\"noopener noreferrer\">国家林草局 · 漆树与中国漆艺</a><br><a href=\"https://cjweek.cjn.cn/html/2025-04/01/content_151733_2019972.htm\" target=\"_blank\" rel=\"noopener noreferrer\">长江日报 · 他们用非遗漆艺屡创国潮爆款（2025）</a><br><a href=\"https://patents.google.com/patent/CN201733413U/zh\" target=\"_blank\" rel=\"noopener noreferrer\">公开专利 · 一种生漆涂饰的音箱</a></p><p>配图为用户提供的设计示意，未据此认定品牌、具体髹饰技法或声学参数；报道与专利作为应用参考，不代表图示产品的认证或音质实测。</p></details>\n      </div>\n    </article>\n");
  postcardTemplates.push("    <button class=\"miao-close\" type=\"button\" aria-label=\"收起明信片\" autofocus>×</button>\n    <article class=\"miao-postcard-layout\">\n      <div class=\"miao-postcard-art\">\n        <span class=\"miao-edition\">古艺新生 · 藏品来信 / 06</span>\n        <img src=\"assets/images/revival/hubi-biweiyang-brushes.webp\" alt=\"六支带花卉与金色纹饰的美妆刷设计，刷头有圆形、扇形和斜角等不同形状\">\n        <p>用做毛笔的手，做一把美妆刷。</p>\n        <span class=\"miao-art-caption\">善琏湖笔 × 笔未央美妆笔</span>\n      </div>\n      <div class=\"miao-postcard-letter\">\n        <div class=\"miao-postmark\" aria-hidden=\"true\">古艺新生<br><small>浙江 · 善琏</small></div>\n        <div class=\"miao-stamp\" aria-hidden=\"true\"><img src=\"assets/images/revival/hubi-making.webp\" alt=\"\"><span>湖笔 · 06</span></div>\n        <p class=\"miao-postcard-kicker\">POSTCARD / 一封非遗来信</p>\n        <h2 id=\"miao-postcard-title\">“笔未央”美妆笔</h2>\n        <p class=\"miao-address\">寄往：认真描绘每一天的你</p>\n        <p>你好，见字如晤。</p>\n        <p>在善琏，匠人用双手梳理毫毛，让一支湖笔写下墨色与心意。如今，这份对笔锋与触感的细致，也走向梳妆台。手艺换了一个日常场景，仍在认真对待每一次落笔。</p>\n        <dl class=\"miao-facts\">\n          <div><dt>旧艺</dt><dd>湖笔制作技艺于 2006 年入选第一批国家级非物质文化遗产名录。善琏是湖笔的重要产地，制笔包含择料、水盆、结头、择笔等工序。</dd></div>\n          <div><dt>新用</dt><dd>“笔未央”将湖笔制笔经验转用于美妆工具，开发适应不同上妆用途的刷头，让传统手艺从书斋走进日常妆容。</dd></div>\n        </dl>\n        <p class=\"miao-signature\">笔意未央，美在日常。<br><span>—— 来自古艺新生的一份问候</span></p>\n        <details class=\"miao-sources\"><summary>来信出处与图像说明</summary><p><a href=\"https://www.ihchina.cn/project_details/9935.html\" target=\"_blank\" rel=\"noopener noreferrer\">中国非遗网 · 一支湖笔的前世今生</a><br><a href=\"https://difang.neamco.com/zj/2026-01/27/content_38561795.htm\" target=\"_blank\" rel=\"noopener noreferrer\">光明网 · “笔未央”美妆笔跨界报道（2026）</a></p><p>配图为用户提供的设计示意，未核实为“笔未央”官方产品图；不据图认定具体毛料、款式或性能。国家级非遗项目指湖笔制作技艺，美妆笔是其跨界应用。</p></details>\n      </div>\n    </article>\n");
  document.body.append(postcard);
  function openPostcard(cab) {
    window.clearTimeout(postcardTimer);
    if (!cab.root.isConnected || !cab.root.classList.contains('is-open') || document.getElementById('rv-museum').hidden) return;
    if (!cab.exhibit || postcard.open) return;
    postcard.innerHTML = postcardTemplates[cab.index];
    postcard.classList.toggle('iron-postcard', cab.exhibit.kind === 'iron');
    postcard.classList.toggle('naxi-postcard', cab.exhibit.kind === 'naxi');
    postcard.classList.toggle('qiang-postcard', cab.exhibit.kind === 'qiang');
    postcard.classList.toggle('lacquer-postcard', cab.exhibit.kind === 'lacquer');
    postcard.classList.toggle('hubi-postcard', cab.exhibit.kind === 'hubi');
    postcardOpener = cab.button;
    if (!postcard.open) postcard.showModal();
  }
  postcard.addEventListener('click', event => { if (event.target === postcard || event.target.closest('.miao-close')) postcard.close(); });
  postcard.addEventListener('close', () => { if (postcardOpener?.isConnected) postcardOpener.focus({ preventScroll: true }); });
  // 叠层画布 330×392 与 vitrine.webp 同比例；PANE 是展柜正面玻璃的范围。
  const PANE = { l: 34, t: 32, r: 296, b: 336 };
  const GROUND = 372;
  const NS = 'http://www.w3.org/2000/svg';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const rand = (min, max) => min + Math.random() * (max - min);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const round = value => Math.round(value * 10) / 10;

  const CASE_IMG = '<img class="vt-case" src="assets/images/revival/vitrine.webp" alt="" draggable="false">';

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
    if (cab.exhibit) {
      cab.button.setAttribute('aria-label', cab.exhibit.oldName + '已焕新为' + cab.exhibit.newName + '，查看明信片');
      cab.root.querySelector('.vt-caption').textContent = cab.exhibit.newName + ' · 点击读信';
      window.clearTimeout(postcardTimer);
      postcardTimer = window.setTimeout(() => openPostcard(cab), reduced.matches ? 0 : 1500);
    }
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
    const exhibit = exhibits[index];
    const root = document.createElement('div');
    root.className = 'vt-cab';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'vt-window';
    button.setAttribute('aria-label', `第 ${index + 1} 座展柜，叩三次打开`);
    button.innerHTML = `${CASE_IMG}<span class="vt-slot"></span>${GLASS_SVG}`;
    if (exhibit) {
      root.classList.add('vt-featured', 'vt-' + exhibit.kind);
      button.setAttribute('aria-label', exhibit.oldName + '展柜，叩三次让旧艺焕新');
      button.querySelector('.vt-slot').innerHTML = '<span class="vt-lamp-glow" aria-hidden="true"></span><img class="vt-old-art" src="assets/images/revival/' + exhibit.oldImage + '" alt="" draggable="false"><img class="vt-new-art" src="assets/images/revival/' + exhibit.newImage + '" alt="" draggable="false">';
      const reflection = document.createElement('span');
      reflection.className = 'vt-reflection';
      reflection.setAttribute('aria-hidden', 'true');
      button.insertBefore(reflection, button.querySelector('.vt-glass'));
    }
    root.append(button);
    if (exhibit) {
      const caption = document.createElement('span');
      caption.className = 'vt-caption';
      caption.setAttribute('aria-live', 'polite');
      caption.textContent = exhibit.oldName + ' · 叩三次，见新生';
      root.append(caption);
    }
    const cab = {
      index, exhibit, root, button, hits: 0, busy: false, tips: [],
      glass: button.querySelector('.vt-glass'),
      pane: button.querySelector('.vt-pane'),
      cracks: button.querySelector('.vt-cracks'),
      debris: button.querySelector('.vt-debris'),
      shards: button.querySelector('.vt-shards'),
      fx: button.querySelector('.vt-fx'),
      dots: [...button.querySelectorAll('.vt-dots rect')]
    };
    button.addEventListener('click', event => {
      if (cab.hits >= 3) { if (exhibit) openPostcard(cab); return; }
      if (cab.busy) return;
      const point = impactPoint(cab, event);
      if (reduced.matches) { strike(cab, point); return; }
      cab.busy = true;
      mallet(cab, point);
      // 槌子落到玻璃的那一刻才裂。
      window.setTimeout(() => { if (cab.root.isConnected) strike(cab, point); cab.busy = false; }, 128);
    });
    return cab;
  }

  function render() {
    window.clearTimeout(postcardTimer);
    if (postcard.open) postcard.close();
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
