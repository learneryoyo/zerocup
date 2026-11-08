/* Local, credited creator data. Works with file:// and without a build step. */
(() => {
  'use strict';
  const people = [
  {
    "name": "江寻千（九月）",
    "field": "确山铁花、糖画、通草花、传统手工",
    "role": "非遗技艺学习者、传承与传播创作者",
    "story": "曾做游戏原画师的江寻千，把对色彩与造型的兴趣带进了真实的手艺世界。从糖画开始，她一次次去拜师、练习，再把学习过程拍成视频。打铁花尤其需要勇气和耐心：绚丽的火光背后，是对动作与安全的反复训练。她的作品既呈现技艺完成时的惊艳，也让观众看见自己怎样从门外汉一步步学会。",
    "achievements": [
      "拜师学习并表演确山铁花",
      "持续创作糖画、鱼灯等传统技艺系列"
    ],
    "source": "https://static.nfnews.com/content/202505/03/c11255582.html",
    "home": "https://weibo.com/u/6394994683",
    "homeLabel": "前往微博主页 ↗",
    "image": "../assets/img/creators/creator-02.webp",
    "photoSource": "https://static.nfnews.com/content/202505/03/c11255582.html",
    "photoLabel": "高清正面人物照",
    "position": "65% 38%"
  },
  {
    "name": "李子柒",
    "field": "传统技艺、漆艺与田园生活",
    "role": "非遗文化传播者",
    "story": "李子柒的镜头从一日三餐与四季农事出发，慢慢走进了更复杂的传统工艺。她把寻找材料、请教匠人和反复动手的过程，编织成有起承转合的生活故事。暂停更新的日子里，她继续走访手艺人；重新回到镜头前时，漆艺与蜀锦成为了新的讲述。那些安静而漫长的制作过程，让屏幕前的人重新注意到一件器物背后的时间。",
    "achievements": [
      "以漆艺、蜀锦等作品传播传统技艺",
      "2024年参加全国青年非遗传承人交流活动"
    ],
    "source": "https://www.thepaper.cn/newsDetail_forward_29517867",
    "home": "https://www.weibo.com/mianyangdanshen",
    "homeLabel": "前往微博主页 ↗",
    "image": "../assets/img/creators/creator-01.webp",
    "photoSource": "https://galapagosfrog.hatenablog.com/entry/2019/09/19/%E6%9D%8E%E5%AD%90%E6%9F%92%E3%81%8CForbes%E4%B8%AD%E5%9B%BD%E7%89%88%E3%81%A750%E4%BA%BA%E3%81%AE%E3%82%AA%E3%83%94%E3%83%8B%E3%82%AA%E3%83%B3%E3%83%AA%E3%83%BC%E3%83%80%E3%83%BC%E3%81%AE1",
    "photoLabel": "人物正面照",
    "position": "50% 35%"
  },
  {
    "name": "彭传明",
    "field": "古法造纸、制墨与传统生活器物",
    "role": "传统手工艺与非遗文化传播者",
    "story": "在福建山间，彭传明把寻常院落变成了自己的手工作坊。竹子如何变成纸，烟灰怎样成为墨，他愿意用很长的时间把答案做出来，再把漫长的工序浓缩进短短几分钟。视频里的衣着、工具与环境都很朴素，吸引人的却是每一步劳动的实在。他让古籍里的方法重新落到手上，也让观众看到传统材料的来处。",
    "achievements": [
      "完成古法造纸、制墨等系列作品",
      "将历时两年多的制墨过程浓缩为短视频"
    ],
    "source": "https://www.thepaper.cn/newsDetail_forward_18823849",
    "home": "https://space.bilibili.com/589188442",
    "homeLabel": "前往 B 站主页 ↗",
    "image": "../assets/img/creators/creator-03.webp",
    "photoSource": "https://www.thepaper.cn/newsDetail_forward_18823849",
    "photoLabel": "人物生活照",
    "position": "50% 35%"
  },
  {
    "name": "彭南科",
    "field": "乡村手艺、农耕用具与古法工艺",
    "role": "乡村守艺人、非遗纪实创作者",
    "story": "彭南科回到湘西乡村，把熟悉的老物件重新做了一遍：一件蓑衣、一架曲辕犁、一口石磨，都是他与乡土生活重新建立联系的方式。他在视频里细细记录取材、加工和试用，不急着让观众看到成品，而是把手艺如何服务生活讲清楚。那些渐渐退出日常的工具，因此又有了可以被年轻人看见和理解的机会。",
    "achievements": [
      "复现蓑衣、曲辕犁、石磨等乡村器物",
      "以“乡村守艺人”系列记录农耕手艺"
    ],
    "source": "https://www.cnr.cn/hunan/zhxw/20230117/t20230117_526129421.shtml",
    "home": "https://space.bilibili.com/1475425645",
    "homeLabel": "前往 B 站主页 ↗",
    "image": "../assets/img/creators/creator-04.webp",
    "photoSource": "https://www.cnr.cn/hunan/zhxw/20230117/t20230117_526129421.shtml",
    "photoLabel": "制作糍粑视频截图",
    "position": "50% 35%"
  },
  {
    "name": "杨柳",
    "field": "独竹漂与传统舞蹈表达",
    "role": "独竹漂表演者、传统技艺传播者",
    "story": "杨柳七岁起跟随祖母学习独竹漂，在一次次落水与重新站稳中练出了平衡。她也一直喜欢舞蹈，于是试着把舞步搬到竹子上，再穿上汉服，在水面上完成转身与舒展。镜头里的轻盈来自多年练习。她用自己熟悉的身体语言，为家乡的水上技艺添了一种新的表达，也把这门本领介绍给了更远处的观众。",
    "achievements": [
      "将舞蹈与汉服融入独竹漂表演",
      "独竹漂创作获人民日报等媒体报道"
    ],
    "source": "https://cpc.people.com.cn/n1/2021/1129/c64387-32293967.html",
    "home": "https://space.bilibili.com/513192993",
    "homeLabel": "前往 B 站主页 ↗",
    "image": "../assets/img/creators/creator-05.webp",
    "photoSource": "https://j.people.com.cn/n3/2021/0910/c94638-9894919.html",
    "photoLabel": "独竹漂表演照",
    "position": "50% 35%"
  },
  {
    "name": "山白（向宏俊）",
    "field": "徽墨、印泥、纸张与传统器物",
    "role": "团队型传统手工艺与非遗传播账号",
    "story": "“山白”背后是湘西的一对叔侄：向宏俊在镜头前动手，向清标参与策划与拍摄。两人查资料、找材料，也在实践中反复摸索，把徽墨、印泥和传统纸张的制作拍成安静的乡村影像。一个短视频常常对应许多天的等待与劳动。观看这些作品，像跟着他们在院子里待了一阵，慢慢明白一件手作为什么值得等。",
    "achievements": [
      "完成徽墨、印泥、传统纸张等工艺影像",
      "由出镜与拍摄主创协作呈现完整工序"
    ],
    "source": "https://m.thepaper.cn/newsDetail_forward_24320485",
    "home": "https://weibo.com/u/7840319821",
    "homeLabel": "前往微博主页 ↗",
    "image": "../assets/img/creators/creator-06.webp",
    "photoSource": "https://m.thepaper.cn/newsDetail_forward_24320485",
    "photoLabel": "向宏俊人物工作照",
    "position": "50% 35%"
  },
  {
    "name": "南翔",
    "field": "传统美食、炭花舞、漆器与民俗探访",
    "role": "传统文化与非遗传播者",
    "story": "南翔本名史海峰，曾做金融数据分析，后来从挑战难做的菜、复刻文学作品里的美食开始创作。对“这到底怎么做”的好奇，又把他带到了手艺人身边。他走进漆器、炭花舞等不同项目，亲自学习，也把摸索中的困难留在视频里。从一道菜到一门手艺，他不断扩展题材，让观众跟着自己的好奇心走近传统文化。",
    "achievements": [
      "从传统美食复刻拓展至非遗探访",
      "拍摄炭花舞、漆器等学习体验作品"
    ],
    "source": "https://www.xinhuanet.com/local/20261003/348ffd278ba14547825a0fb6d901f30b/c.html",
    "home": "https://www.weibo.com/u/7397682499",
    "homeLabel": "前往微博主页 ↗",
    "image": "../assets/img/creators/creator-07.webp",
    "photoSource": "https://news.sina.cn/2025-01-28/detail-inehnwwh7074386.d.html",
    "photoLabel": "正面人物照",
    "position": "50% 35%"
  },
  {
    "name": "朱铁雄",
    "field": "国风变装、川剧元素与传统文化叙事",
    "role": "国风短视频与非遗文化传播者",
    "story": "朱铁雄把小时候对英雄的想象，拍成了今天的国风短片。普通人的生活片段常常是故事的开头，随后借助表演、服装和视觉特效，转入戏曲与传统人物的世界。川剧变脸、吐火、舞狮等元素，在他的作品里参与叙事，而不只是一个漂亮背景。他用年轻人熟悉的短视频语言，让传统文化与当下的情感相遇。",
    "achievements": [
      "以国风剧情与特效呈现川剧、舞狮等元素",
      "2022年获中国网络视频学院奖“最新锐网络达人”"
    ],
    "source": "https://cbgc.scol.com.cn/news/3943724",
    "home": "https://www.weibo.com/u/5256149975",
    "homeLabel": "前往微博主页 ↗",
    "image": "../assets/img/creators/creator-08.webp",
    "photoSource": "https://www.thepaper.cn/newsDetail_forward_24635924",
    "photoLabel": "人物视频截图",
    "position": "50% 35%"
  },
  {
    "name": "凌云（马赵凌云）",
    "field": "峨眉武术",
    "role": "峨眉武术传承人、武术短视频创作者",
    "story": "凌云从小习武，后来通过短视频，把峨眉武术带进了更多人的日常视野。剑法与身法既可以出现在山水之间，也可以融入生活场景；流畅的动作背后，是从童年延续至今的基本功。她又与伙伴们组建峨眉派女子功夫团，从个人拍摄走向团队演出，让更多人看见女性习武者的力量与传统武术的美。",
    "achievements": [
      "参与创建峨眉派女子功夫团",
      "通过短视频与演出传播峨眉武术"
    ],
    "source": "https://ent.people.com.cn/n1/2025/0218/c1012-40420302.html",
    "home": "https://weibo.com/u/7030023973",
    "homeLabel": "前往微博主页 ↗",
    "image": "../assets/img/creators/creator-09.webp",
    "photoSource": "https://www.thepaper.cn/newsDetail_forward_29825469",
    "photoLabel": "武术人物展示照",
    "position": "50% 35%"
  },
  {
    "name": "邹小和",
    "field": "夹江豆腐乳与川渝传统美食",
    "role": "夹江豆腐乳第六代传人、传统美食创作者",
    "story": "邹小和接过家里制作夹江豆腐乳的手艺后，也在寻找一种让老味道被更多人认识的方法。2019年，他开始和伙伴学习拍摄，把腐乳和川味家常食物做成短视频。熟悉的四川口音、长辈传下来的经验与热腾腾的灶台，构成了他的讲述。他也在直播里解释做法，与观众交流，让地方手艺继续出现在今天的餐桌上。",
    "achievements": [
      "夹江豆腐乳制作工艺第六代传人",
      "2019年开始以短视频传播传统美食"
    ],
    "source": "https://www.mct.gov.cn/preview/special/2020whhzrycr/fygwj/202006/t20200617_855033.htm",
    "home": "https://www.bilibili.com/video/BV1pd4y1A7Av/",
    "homeLabel": "查看 B 站作品 ↗",
    "image": "../assets/img/creators/creator-10.webp",
    "photoSource": "https://www.sohu.com/a/401216004_120006290",
    "photoLabel": "人物工作照",
    "position": "50% 35%"
  }
];
  const root = document.getElementById('creatorCarousel');
  if (!root) return;
  root.innerHTML = `<div class="creator-heading"><span>让非遗被看见</span><span class="creator-count"></span></div>
    <button type="button" class="creator-open" aria-haspopup="dialog" aria-controls="creatorDialog"><span class="creator-picture"><img><img aria-hidden="true" alt=""></span><span class="creator-caption"><span class="creator-name"></span><span class="creator-field"></span><span class="creator-cta">读一读 TA 的故事 ↗</span></span></button>
    <div class="creator-controls"><button type="button" class="creator-pause" aria-pressed="false">暂停轮播</button><div class="creator-arrows"><button type="button" class="creator-prev" aria-label="上一位创作者">←</button><button type="button" class="creator-next" aria-label="下一位创作者">→</button></div></div><span class="creator-sr" aria-live="polite"></span>`;
  const dialog = document.createElement('dialog');
  dialog.id = 'creatorDialog'; dialog.className = 'creator-dialog'; dialog.setAttribute('aria-labelledby','creatorTitle');
  dialog.innerHTML = `<button type="button" class="creator-close" aria-label="关闭人物详情" autofocus>×</button><div class="creator-detail"><figure><img><figcaption></figcaption></figure><div class="creator-text"><p class="creator-eyebrow">镜头里的守艺人</p><h2 id="creatorTitle"></h2><p class="creator-role"></p><p class="creator-story"></p><h3>代表创作与成果</h3><ul class="creator-achievements"></ul><div class="creator-links"><a class="creator-home" target="_blank" rel="noopener noreferrer"></a><a class="creator-reference" target="_blank" rel="noopener noreferrer">资料出处 ↗</a></div><p class="creator-link-note"></p></div></div>`;
  document.body.append(dialog);
  const q = s => root.querySelector(s), d = s => dialog.querySelector(s);
  const images = [...root.querySelectorAll('.creator-picture img')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0, layer = 0, revision = 0, timer, hovered = false, inView = true, paused = motion.matches, oldOverflow = '';
  const opener = q('.creator-open');
  function schedule() {
    clearTimeout(timer);
    if (!paused && !hovered && !root.contains(document.activeElement) && !document.hidden && inView && !dialog.open) timer = setTimeout(() => show(index+1),6500);
  }
  function show(next, manual=false) {
    index = (next+people.length)%people.length; const p = people[index], token = ++revision;
    const target = images[1-layer];
    const commit = () => {
      if (token !== revision) return;
      images[layer].setAttribute('aria-hidden','true'); images[layer].alt='';
      target.alt=p.name+' · '+p.photoLabel;target.style.objectPosition=p.position;target.setAttribute('aria-hidden','false');layer=1-layer;
      q('.creator-name').textContent=p.name;q('.creator-field').textContent=p.field;
      q('.creator-count').textContent=String(index+1).padStart(2,'0')+' / 10';
      opener.setAttribute('aria-label','了解'+p.name+'的创作故事');
      if(manual) q('.creator-sr').textContent='第'+(index+1)+'位，'+p.name;
      schedule();
      const preload=new Image();preload.src=people[(index+1)%people.length].image;
    };
    target.onload=commit;target.onerror=()=>{if(token===revision){target.alt=p.name+'（图片暂时无法加载）';commit();}};
    target.src=p.image;if(target.complete && target.naturalWidth){target.onload=null;commit();}
  }
  q('.creator-prev').onclick=()=>show(index-1,true);q('.creator-next').onclick=()=>show(index+1,true);
  function pauseLabel(){q('.creator-pause').textContent=paused?'播放轮播':'暂停轮播';q('.creator-pause').setAttribute('aria-pressed',String(paused));schedule();}
  q('.creator-pause').onclick=()=>{paused=!paused;pauseLabel();};
  root.addEventListener('mouseenter',()=>{hovered=true;schedule();});root.addEventListener('mouseleave',()=>{hovered=false;schedule();});
  root.addEventListener('focusin',schedule);root.addEventListener('focusout',()=>setTimeout(schedule,0));
  document.addEventListener('visibilitychange',schedule);
  new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;schedule();}).observe(root);
  motion.addEventListener('change',()=>{if(motion.matches){paused=true;pauseLabel();}});
  opener.onclick=()=>{
    const p=people[index];d('#creatorTitle').textContent=p.name;d('.creator-role').textContent=p.role;
    d('.creator-story').textContent=p.story;
    d('figure img').src=p.image;d('figure img').alt=p.name+' · '+p.photoLabel;
    const credit=document.createElement('a');credit.href=p.photoSource;credit.target='_blank';credit.rel='noopener noreferrer';credit.textContent='图片来源 ↗';
    d('figcaption').replaceChildren(document.createTextNode(p.photoLabel+' · '),credit);
    d('.creator-achievements').replaceChildren(...p.achievements.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
    d('.creator-home').href=p.home;d('.creator-home').textContent=p.homeLabel;d('.creator-reference').href=p.source;
    d('.creator-link-note').textContent=p.homeLabel.includes('作品')?'账号主页暂未核实，可从作品页进入作者空间。':'在新标签页打开创作者主页';
    oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();dialog.scrollTop=0;schedule();
  };
  d('.creator-close').onclick=()=>dialog.close();
  let backdropDown=false;
  dialog.addEventListener('pointerdown',e=>{backdropDown=e.target===dialog;});
  dialog.addEventListener('click',e=>{if(e.target===dialog&&backdropDown){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{document.body.style.overflow=oldOverflow;opener.focus({preventScroll:true});schedule();});
  pauseLabel();show(0);
})();
