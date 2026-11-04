/* 开酥 · 荆门酥饼制作体验
   状态机：roll → fold → fill → seal → sesame → bake → result
   所有拖拽统一走 Pointer Events + setPointerCapture。 */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  function $(id) { return document.getElementById(id); }

  var stage = $('stage');
  var stageWrap = $('stageWrap');
  var body = document.body;

  var ui = {
    rail: $('stepRail'),
    status: $('statusText'),
    meterLabel: $('meterLabel'),
    meterFill: $('meterFill'),
    meterValue: $('meterValue'),
    toast: $('toast'),
    autoBtn: $('autoBtn'),
    resetBtn: $('resetBtn'),
    layer: $('resultLayer'),
    title: $('resultTitle'),
    rank: $('resultRank'),
    note: $('resultNote'),
    layerChip: $('layerChip'),
    metOpen: $('metOpen'),
    metSeal: $('metSeal'),
    metHeat: $('metHeat'),
    numOpen: $('numOpen'),
    numSeal: $('numSeal'),
    numHeat: $('numHeat'),
    crossLayers: $('crossLayers'),
    crossSesame: $('crossSesame'),
    crossCrust: $('crossCrust'),
    againBtn: $('againBtn')
  };

  var n = {
    dough: $('dough'),
    doughTop: $('doughTop'),
    doughSide: $('doughSide'),
    doughShadow: $('doughShadow'),
    doughClip: $('doughClipEllipse'),
    oilSheen: $('oilSheen'),
    oilMarks: $('oilMarks'),
    mound: $('fillingMound'),
    sealDots: $('sealDots'),
    sealArc: $('sealArc'),
    foldCrease: $('foldCrease'),
    pin: $('pin'),
    oilDish: $('oilDish'),
    brush: $('brush'),
    bowl: $('bowl'),
    ball: $('fillingBall'),
    foldHandle: $('foldHandle'),
    sealHandle: $('sealHandle'),
    bun: $('bun'),
    bunInner: $('bunInner'),
    bunBody: $('bunBody'),
    bunGlow: $('bunGlow'),
    bunPleats: $('bunPleats'),
    charSpots: $('charSpots'),
    seeds: $('seedLayer'),
    leak: $('leakDrop'),
    jar: $('jar'),
    jarInner: $('jarInner'),
    pan: $('pan'),
    steam: $('panSteam'),
    plate: $('plate'),
    gauge: $('gauge'),
    needle: $('gaugeNeedle'),
    hintRoll: $('hintRoll'),
    hintOil: $('hintOil'),
    hintFold: $('hintFold'),
    hintFoldPath: $('hintFoldPath'),
    hintFoldText: $('hintFoldText'),
    hintFill: $('hintFill'),
    hintSeal: $('hintSeal'),
    sealHint: $('sealHintEllipse'),
    hintSesame: $('hintSesame'),
    hintPan: $('hintPan'),
    hintFlip: $('hintFlip'),
    hintPlate: $('hintPlate')
  };

  var DOUGH = { x: 300, y: 330 };
  var PAN = { x: 660, y: 352 };
  var PLATE = { x: 800, y: 140 };
  var BALL_HOME = { x: 700, y: 292 };
  var DOUGH_START = { rx: 118, ry: 34 };
  var DOUGH_END = { rx: 208, ry: 53 };
  var STEP_NAME = { roll: '擀皮', fold: '抹酥折叠', fill: '包馅', seal: '收口', sesame: '粘芝麻', bake: '上铛', result: '切开' };

  var s = {};
  var drag = null;
  var toastTimer = 0;
  var autoRun = 0;

  /* ---------------- 基础工具 ---------------- */

  function svg(name, attrs) {
    var node = document.createElementNS(NS, name);
    if (attrs) Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    return node;
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function show(node, on) { if (node) node.classList.toggle('is-hidden', !on); }
  function transform(node, x, y) {
    node.style.transform = 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px)';
  }
  function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }

  function pointOf(evt) {
    var ctm = stage.getScreenCTM();
    if (!ctm) return { x: DOUGH.x, y: DOUGH.y };
    var p = stage.createSVGPoint();
    p.x = evt.clientX;
    p.y = evt.clientY;
    var q = p.matrixTransform(ctm.inverse());
    return { x: q.x, y: q.y };
  }

  function toast(msg, ms) {
    ui.toast.textContent = msg;
    ui.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { ui.toast.classList.remove('show'); }, ms || 1900);
  }

  function floatText(parent, text, x, y) {
    var t = svg('text', {
      x: x, y: y, 'text-anchor': 'middle',
      'font-family': 'Kaiti SC, STKaiti, KaiTi, serif',
      'font-size': 18, fill: '#8a4f26'
    });
    t.textContent = text;
    t.classList.add('sfx');
    parent.appendChild(t);
    setTimeout(function () { t.remove(); }, 950);
  }

  function hexToRgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function rgbToHex(c) {
    return '#' + c.map(function (v) {
      var x = Math.round(clamp(v, 0, 255)).toString(16);
      return x.length < 2 ? '0' + x : x;
    }).join('');
  }
  function mix(c1, c2, t) {
    var a = hexToRgb(c1), b = hexToRgb(c2);
    return rgbToHex([lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]);
  }

  function crustColor(heat) {
    var t = clamp(heat, 0, 1.45);
    if (t < 0.62) return mix('#f7ecd0', '#e3aa5c', t / 0.62);
    if (t < 0.98) return mix('#e3aa5c', '#b5702f', (t - 0.62) / 0.36);
    return mix('#b5702f', '#4f2b13', clamp((t - 0.98) / 0.4, 0, 1));
  }

  /* ---------------- HUD / 步骤条 ---------------- */

  var STEP_TEXT = {
    roll: '拖住擀面杖，左右来回擀',
    fold: '油刷抹酥，再抓边折两次',
    fill: '拖一团馅，放进面皮中心',
    seal: '捏住饼边，绕一圈收口',
    sesame: '拖芝麻罐，扫过饼面',
    bake: '把饼拖进饼铛',
    result: '切开看看这一块'
  };
  var METER_TEXT = {
    roll: '面皮厚度',
    fold: '开酥折叠',
    fill: '馅料',
    seal: '收口',
    sesame: '芝麻',
    bake: '火候',
    result: '完成'
  };

  function setHud(step, value, label) {
    ui.status.textContent = STEP_TEXT[step] || STEP_TEXT.roll;
    ui.meterLabel.textContent = METER_TEXT[step] || '进度';
    var pct = Math.round(clamp(value, 0, 1) * 100);
    ui.meterFill.style.width = pct + '%';
    ui.meterValue.textContent = label != null ? label : pct + '%';
  }

  var RAIL = ['roll', 'fold', 'fill', 'sesame', 'bake'];
  function updateRail(step) {
    var active = step === 'seal' ? 'fill' : step;
    var idx = RAIL.indexOf(active);
    Array.prototype.forEach.call(ui.rail.children, function (li, i) {
      li.classList.toggle('active', i === idx);
      li.classList.toggle('done', i < idx || step === 'result');
    });
  }

  /* ---------------- 面皮 ---------------- */

  function applyDough() {
    var rx = s.doughRx || DOUGH_START.rx;
    var ry = s.doughRy || DOUGH_START.ry;
    n.doughTop.setAttribute('rx', rx.toFixed(1));
    n.doughTop.setAttribute('ry', ry.toFixed(1));
    n.doughSide.setAttribute('rx', rx.toFixed(1));
    n.doughSide.setAttribute('ry', (ry * 0.93).toFixed(1));
    n.doughSide.setAttribute('cy', '9');
    n.doughShadow.setAttribute('rx', (rx * 0.99).toFixed(1));
    n.doughShadow.setAttribute('ry', (ry * 1.05).toFixed(1));
    n.doughClip.setAttribute('rx', rx.toFixed(1));
    n.doughClip.setAttribute('ry', ry.toFixed(1));
    n.sealHint.setAttribute('rx', (rx * 0.52).toFixed(1));
    n.sealHint.setAttribute('ry', (ry * 1.1).toFixed(1));
  }

  function buildPleats() {
    n.bunPleats.innerHTML = '';
    for (var i = 0; i < 7; i++) {
      var a = -Math.PI + (i / 6) * Math.PI;
      var x = Math.cos(a) * 56;
      var y = Math.sin(a) * 30;
      n.bunPleats.appendChild(svg('path', {
        d: 'M' + x.toFixed(1) + ' ' + y.toFixed(1) +
           ' q ' + (-x * 0.12).toFixed(1) + ' 9 ' + (-x * 0.26).toFixed(1) + ' 16'
      }));
    }
  }

  function buildOilMarks() {
    n.oilMarks.innerHTML = '';
    var rows = [
      { y: -24, xs: [-128, -58, 12, 82, 150] },
      { y: 0, xs: [-150, -80, -10, 62, 132] },
      { y: 24, xs: [-118, -48, 22, 92] }
    ];
    rows.forEach(function (row) {
      row.xs.forEach(function (x) {
        n.oilMarks.appendChild(svg('ellipse', {
          cx: x, cy: row.y, rx: 25, ry: 6.5,
          fill: '#f4d794', opacity: 0,
          transform: 'rotate(-8 ' + x + ' ' + row.y + ')'
        }));
      });
    });
  }

  function buildSealDots() {
    n.sealDots.innerHTML = '';
    for (var i = 0; i < 24; i++) {
      var a = (i / 24) * Math.PI * 2 - Math.PI / 2;
      n.sealDots.appendChild(svg('circle', {
        cx: (Math.cos(a) * 190).toFixed(1),
        cy: (Math.sin(a) * 55).toFixed(1),
        r: 2.6, fill: '#c08a4e', opacity: 0
      }));
    }
  }

  var flapLayer = svg('ellipse', {
    rx: 0, ry: 0, cx: 0, cy: 0,
    fill: '#f8edd4', stroke: '#cfa970', 'stroke-width': 1.5, opacity: 0
  });
  n.dough.insertBefore(flapLayer, n.foldCrease);

  /* ---------------- 状态切换 ---------------- */

  function setStep(step) {
    s.step = step;
    body.dataset.step = step;
    updateRail(step);

    var doughVisible = step === 'roll' || step === 'fold' || step === 'fill' || step === 'seal';
    show(n.dough, doughVisible);
    show(n.pin, step === 'roll');
    show(n.oilDish, step === 'fold');
    show(n.brush, step === 'fold' && s.oil < 0.995);
    show(n.foldHandle, step === 'fold' && s.oil >= 0.995 && s.folds < 2 && !s.folding);
    show(n.bowl, step === 'fill');
    show(n.ball, step === 'fill' && !s.filled);
    show(n.sealHandle, step === 'seal' && s.sealCovered < 0.999);
    show(n.jar, step === 'sesame');
    show(n.bun, step === 'sesame' || step === 'bake' || step === 'result');
    show(n.pan, step === 'bake' || step === 'result');
    show(n.gauge, step === 'bake');
    show(n.plate, step === 'bake' && (s.inPan || s.done));
    show(n.steam, step === 'bake' && s.inPan);
    n.pan.classList.toggle('hot', step === 'bake' && s.inPan);

    n.hintRoll.classList.toggle('is-hidden', step !== 'roll');
    n.hintOil.classList.toggle('is-hidden', !(step === 'fold' && s.oil < 0.995));
    n.hintFold.classList.toggle('is-hidden', !(step === 'fold' && s.oil >= 0.995 && s.folds < 2));
    n.hintFill.classList.toggle('is-hidden', !(step === 'fill' && !s.filled));
    n.hintSeal.classList.toggle('is-hidden', step !== 'seal');
    n.hintSesame.classList.toggle('is-hidden', step !== 'sesame');
    n.hintPan.classList.toggle('is-hidden', !(step === 'bake' && !s.inPan));
    n.hintFlip.classList.toggle('is-hidden', !(step === 'bake' && s.inPan && !s.flipped && !s.done));
    n.hintPlate.classList.toggle('is-hidden', !(step === 'bake' && s.inPan && s.flipped && !s.done));

    if (step === 'roll') setHud('roll', s.roll);
    else if (step === 'fold') setHud('fold', s.oil * 0.5 + (s.folds / 2) * 0.5, s.folds + ' / 2 折');
    else if (step === 'fill') setHud('fill', s.filled ? 1 : 0, s.filled ? '已入馅' : '0%');
    else if (step === 'seal') setHud('seal', s.sealCovered, Math.round(s.sealCovered * 100) + '%');
    else if (step === 'sesame') setHud('sesame', s.seeds / 26, s.seeds + ' 粒');
    else if (step === 'bake') setHud('bake', s.inPan ? clamp(s.colorHeat / 1.1, 0, 1) : 0, Math.round(s.inPan ? s.colorHeat * 100 : 0) + '°');
    else setHud('result', 1, '完成');

    stage.setAttribute('aria-label', STEP_NAME[step] + '：' + (STEP_TEXT[step] || ''));
  }

  /* ---------------- 拖拽入口 ---------------- */

  function beginDrag(kind, node, evt) {
    if (s.done || s.step === 'result') return;
    if (!node) return;
    if (kind === 'seal' && s.step !== 'seal') return;
    evt.preventDefault();
    evt.stopPropagation();
    drag = { kind: kind, node: node, id: evt.pointerId, p: pointOf(evt) };
    try { node.setPointerCapture(evt.pointerId); } catch (err) { /* 忽略 */ }
    node.classList.add('dragging');
    s.dragStart = { x: drag.p.x, y: drag.p.y };
    if (kind === 'roll') { s.lastPinX = drag.p.x; s.lastPinY = null; }
    if (kind === 'seal') {
      s.lastAngle = null;
      if (n.sealHint) n.sealHint.classList.add('is-hidden');
    }
  }

  function onMove(evt) {
    if (!drag || evt.pointerId !== drag.id) return;
    var p = pointOf(evt);
    drag.p = p;
    if (drag.kind === 'roll') moveRoll(p);
    else if (drag.kind === 'brush') moveBrush(p);
    else if (drag.kind === 'fold') moveFold(p);
    else if (drag.kind === 'ball') moveBall(p);
    else if (drag.kind === 'seal') moveSeal(p);
    else if (drag.kind === 'jar') moveJar(p);
    else if (drag.kind === 'bun') moveBun(p);
  }

  function onUp(evt) {
    if (!drag || evt.pointerId !== drag.id) return;
    var kind = drag.kind;
    var p = drag.p;
    try { drag.node.releasePointerCapture(evt.pointerId); } catch (err) { /* 忽略 */ }
    drag.node.classList.remove('dragging');
    drag = null;

    if (kind === 'fold') endFold();
    else if (kind === 'ball') endBall(p);
    else if (kind === 'seal') endSeal();
    else if (kind === 'jar') endJar();
    else if (kind === 'bun') endBun(p);
    else if (kind === 'brush') {
      if (s.oil >= 0.995) finishOil();
    } else if (kind === 'roll') {
      if (s.roll >= 0.985) finishRoll();
    }
  }

  function onCancel(evt) {
    if (!drag || evt.pointerId !== drag.id) return;
    drag.node.classList.remove('dragging');
    drag = null;
    if (s.step === 'bake' && !s.done) {
      if (s.inPan) transform(n.bun, PAN.x, PAN.y);
    }
  }

  function bindDrag(node, kind) {
    node.addEventListener('pointerdown', function (e) { beginDrag(kind, node, e); });
  }

  /* ---------------- roll：擀皮 ---------------- */

  function pinY() { return DOUGH.y - s.doughRy - 14; }

  function positionPin(x, angle) {
    transform(n.pin, x, pinY());
    n.pin.style.transform += ' rotate(' + (angle || 0).toFixed(2) + 'deg)';
  }

  function moveRoll(p) {
    if (s.step !== 'roll') return;
    var dx = p.x - s.lastPinX;
    s.lastPinX = p.x;
    dx = clamp(dx, -64, 64);
    var px = clamp(p.x, DOUGH.x - 196, DOUGH.x + 196);
    var angle = clamp(dx * 1.6, -13, 13);
    positionPin(px, angle);
    if (Math.abs(dx) < 0.4) return;

    s.roll = clamp(s.roll + Math.abs(dx) / 340, 0, 1);
    var e = easeOut(s.roll);
    s.doughRx = lerp(DOUGH_START.rx, DOUGH_END.rx, e);
    s.doughRy = lerp(DOUGH_START.ry, DOUGH_END.ry, e);
    applyDough();
    setHud('roll', s.roll);

    if (s.roll >= 0.985) {
      s.roll = 1;
      setHud('roll', 1);
      if (!s.finishing) finishRoll();
    }
  }

  function finishRoll() {
    if (s.step !== 'roll' || s.finishing) return;
    s.finishing = true;
    s.roll = 1;
    s.doughRx = DOUGH_END.rx;
    s.doughRy = DOUGH_END.ry;
    applyDough();
    positionPin(DOUGH.x, 0);
    floatText(n.dough, '薄了', 0, -70);
    setTimeout(function () {
      s.finishing = false;
      if (s.step === 'roll') {
        setStep('fold');
        toast('面皮擀开了，用油刷抹一层油酥');
      }
    }, 420);
  }

  /* ---------------- fold：抹酥 + 折叠 ---------------- */

  function moveBrush(p) {
    if (s.step !== 'fold') return;
    transform(n.brush, p.x, p.y);
    if (s.oil >= 0.995) return;
    var inside = Math.pow((p.x - DOUGH.x) / (s.doughRx + 8), 2) +
                 Math.pow((p.y - DOUGH.y) / (s.doughRy + 8), 2) < 1;
    if (!inside) return;

    s.oil = clamp(s.oil + 0.05, 0, 1);
    n.oilSheen.style.opacity = String(clamp((s.oil - 0.12) * 1.1, 0, 0.92));
    var marks = n.oilMarks.children;
    var lit = Math.floor(s.oil * marks.length);
    for (var i = 0; i < marks.length; i++) {
      marks[i].setAttribute('opacity', i < lit ? '0.6' : '0');
    }
    setHud('fold', s.oil * 0.5 + (s.folds / 2) * 0.5, s.folds + ' / 2 折');
    if (s.oil >= 0.995) finishOil();
  }

  function finishOil() {
    if (s.step !== 'fold' || s.oil >= 0.995 && s.oilDone) return;
    s.oil = 1;
    s.oilDone = true;
    n.oilSheen.style.opacity = '0.92';
    show(n.brush, false);
    n.hintOil.classList.add('is-hidden');
    show(n.foldHandle, true);
    n.hintFold.classList.remove('is-hidden');
    updateFoldHint();
    setHud('fold', 0.5 + (s.folds / 2) * 0.5, s.folds + ' / 2 折');
    toast('抹匀了，抓住面皮边往里折');
  }

  function updateFoldHint() {
    var side = s.folds === 0 ? 1 : -1;
    var hx = DOUGH.x + side * (s.doughRx + 46);
    var hy = DOUGH.y - 8;
    transform(n.foldHandle, hx, hy);
    var x1 = DOUGH.x + side * (s.doughRx + 10);
    var x2 = DOUGH.x - side * 10;
    n.hintFoldPath.setAttribute('d',
      'M' + x1 + ' ' + (DOUGH.y - 6) + ' C ' + (x1 - side * 40) + ' ' + (DOUGH.y - 1) +
      ', ' + (x2 + side * 30) + ' ' + (DOUGH.y + 4) + ', ' + x2 + ' ' + DOUGH.y);
    n.hintFoldText.setAttribute('x', DOUGH.x + side * 60);
    n.hintFoldText.setAttribute('y', DOUGH.y - 96);
    n.hintFoldText.textContent = s.folds === 0 ? '向里折' : '再折一次';
  }

  function moveFold(p) {
    if (s.step !== 'fold' || s.folding) return;
    var side = s.folds === 0 ? 1 : -1;
    var startX = DOUGH.x + side * (s.doughRx + 46);
    var pulled = (startX - p.x) * side;
    var need = s.doughRx * 1.08;
    transform(n.foldHandle, p.x, clamp(p.y, DOUGH.y - 70, DOUGH.y + 70));

    var t = clamp(pulled / need, 0, 1);
    flapLayer.setAttribute('rx', s.doughRx * 0.62);
    flapLayer.setAttribute('ry', s.doughRy * 0.98);
    flapLayer.setAttribute('cx', side * s.doughRx * 0.58 * (1 - t * 0.9));
    flapLayer.setAttribute('cy', 0);
    flapLayer.setAttribute('opacity', (t * 0.85).toFixed(2));
    n.doughTop.setAttribute('opacity', String(1 - t * 0.18));

    if (t >= 0.92) commitFold();
  }

  function endFold() {
    if (s.step !== 'fold' || s.folding) return;
    flapLayer.setAttribute('opacity', 0);
    n.doughTop.setAttribute('opacity', 1);
    if (s.oil >= 0.995) updateFoldHint();
  }

  function commitFold() {
    if (s.folding || s.folds >= 2) return;
    s.folding = true;
    drag = null;
    n.foldHandle.classList.remove('dragging');
    show(n.foldHandle, false);
    n.hintFold.classList.add('is-hidden');
    flapLayer.setAttribute('opacity', 0);
    n.doughTop.setAttribute('opacity', 1);

    var side = s.folds === 0 ? 1 : -1;
    var glow = svg('ellipse', {
      cx: DOUGH.x + side * s.doughRx * 0.25, cy: DOUGH.y,
      rx: s.doughRx * 0.35, ry: s.doughRy * 1.15,
      fill: '#fff8e4', opacity: 0.7
    });
    glow.classList.add('pop');
    n.dough.appendChild(glow);
    setTimeout(function () { glow.remove(); }, 520);

    s.folds += 1;
    floatText(n.dough, s.folds === 1 ? '一折' : '二折', side * 50, -s.doughRy - 26);
    n.foldCrease.setAttribute('opacity', String(0.28 + s.folds * 0.26));
    s.doughRx *= 0.95;
    applyDough();
    setHud('fold', 0.5 + (s.folds / 2) * 0.5, s.folds + ' / 2 折');

    setTimeout(function () {
      s.folding = false;
      if (s.folds >= 2) {
        n.hintFold.classList.add('is-hidden');
        setStep('fill');
        toast('层次叠好了，现在包馅');
      } else {
        show(n.foldHandle, true);
        n.hintFold.classList.remove('is-hidden');
        updateFoldHint();
        toast('再折一次，层数更多');
      }
    }, 360);
  }

  /* ---------------- fill：拖馅 ---------------- */

  function moveBall(p) {
    if (s.step !== 'fill' || s.filled) return;
    transform(n.ball, p.x, p.y);
    var near = dist(p.x, p.y, DOUGH.x, DOUGH.y) < 110;
    n.ball.classList.toggle('near', near);
  }

  function endBall(p) {
    if (s.step !== 'fill' || s.filled) return;
    if (dist(p.x, p.y, DOUGH.x, DOUGH.y) < 112) {
      placeFilling();
    } else {
      transform(n.ball, BALL_HOME.x, BALL_HOME.y);
      n.ball.classList.remove('near');
      toast('再往面皮中心拖近一点');
    }
  }

  function placeFilling() {
    if (s.filled) return;
    s.filled = true;
    n.ball.classList.remove('near');
    transform(n.ball, DOUGH.x, DOUGH.y - 6);
    setTimeout(function () {
      show(n.ball, false);
      show(n.mound, true);
      n.mound.classList.remove('pop');
      void n.mound.getBoundingClientRect();
      n.mound.classList.add('pop');
      setHud('fill', 1, '已入馅');
      toast('馅心放好了，捏着边收口');
      setTimeout(function () {
        setStep('seal');
        transform(n.sealHandle, DOUGH.x, DOUGH.y - s.doughRy - 4);
        n.hintSeal.classList.remove('is-hidden');
      }, 420);
    }, 200);
  }

  /* ---------------- seal：收口 ---------------- */

  function moveSeal(p) {
    if (s.step !== 'seal') return;
    var rx = s.doughRx, ry = s.doughRy;
    var a = Math.atan2((p.y - DOUGH.y) / ry, (p.x - DOUGH.x) / rx);
    if (s.lastAngle !== null) {
      var d = a - s.lastAngle;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      if (Math.abs(d) < 0.95) {
        s.sealCovered = clamp(s.sealCovered + Math.abs(d) / (Math.PI * 2), 0, 1);
      }
    }
    s.lastAngle = a;
    transform(n.sealHandle,
      DOUGH.x + Math.cos(a) * (rx + 6),
      DOUGH.y + Math.sin(a) * (ry + 6));
    n.sealArc.setAttribute('opacity', '0.9');
    n.sealArc.setAttribute('stroke-dashoffset', (1 - s.sealCovered).toFixed(4));
    updateSealDots();
    setHud('seal', s.sealCovered, Math.round(s.sealCovered * 100) + '%');

    if (s.sealCovered >= 0.995) completeSeal();
  }

  function updateSealDots() {
    var lit = Math.floor(s.sealCovered * n.sealDots.children.length);
    for (var i = 0; i < n.sealDots.children.length; i++) {
      n.sealDots.children[i].setAttribute('opacity', i < lit ? '0.9' : '0');
    }
  }

  function endSeal() {
    if (s.step !== 'seal' || s.sealCovered >= 0.995) return;
    s.sealLifts += 1;
    if (s.sealCovered < 0.03) return;
    toast(s.sealCovered > 0.55 ? '还差一点，顺着边接着捏' : '从边上一路捏过去');
  }

  function completeSeal() {
    if (s.sealDone || s.step !== 'seal') return;
    s.sealDone = true;
    s.sealCovered = 1;
    s.sealQuality = clamp(Math.round(100 - Math.max(0, s.sealLifts) * 7), 58, 100);
    n.sealArc.setAttribute('stroke-dashoffset', '0');
    n.sealArc.setAttribute('opacity', '1');
    updateSealDots();
    show(n.sealHandle, false);
    n.hintSeal.classList.add('is-hidden');
    setHud('seal', 1, '100%');

    if (s.sealQuality < 92) {
      n.leak.setAttribute('opacity', '0.9');
      toast('收口有个小口，烙的时候会漏一点馅');
    } else {
      floatText(n.dough, '收口了', 0, -s.doughRy - 24);
      toast('收口完整，准备粘芝麻');
    }

    setTimeout(function () {
      show(n.dough, false);
      show(n.bun, true);
      transform(n.bun, DOUGH.x, DOUGH.y);
      n.bunInner.classList.remove('pop');
      void n.bun.getBoundingClientRect();
      n.bunInner.classList.add('pop');
      setStep('sesame');
    }, 560);
  }

  /* ---------------- sesame：粘芝麻 ---------------- */

  function moveJar(p) {
    if (s.step !== 'sesame') return;
    transform(n.jar, p.x, p.y);
    if (s.seeds >= 30) return;
    if (dist(p.x, p.y, DOUGH.x, DOUGH.y) > 108) return;
    if (s.lastSeedAt && performance.now() - s.lastSeedAt < 24) return;
    s.lastSeedAt = performance.now();
    addSeed();
    addSeed();
  }

  function addSeed() {
    if (s.seeds >= 30) return;
    var x = 0, y = 0, tries = 0;
    do {
      x = (Math.random() * 2 - 1) * 78;
      y = (Math.random() * 2 - 1) * 44;
      tries++;
    } while (Math.pow(x / 78, 2) + Math.pow(y / 44, 2) > 1 && tries < 24);
    var seed = svg('ellipse', {
      cx: x.toFixed(1), cy: y.toFixed(1), rx: 4.2, ry: 2.4,
      fill: '#33281f', opacity: 0.92,
      transform: 'rotate(' + Math.round(Math.random() * 180) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')'
    });
    seed.classList.add('seed-in');
    n.seeds.appendChild(seed);
    s.seeds += 1;
    setHud('sesame', s.seeds / 26, s.seeds + ' 粒');
  }

  function endJar() {
    if (s.step !== 'sesame') return;
    transform(n.jar, 700, 336);
    if (s.seeds >= 4) finishSesame();
    else toast('拖着罐子在饼面上多扫几下');
  }

  function finishSesame() {
    if (s.step !== 'sesame' || s.seedsDone) return;
    s.seedsDone = true;
    n.hintSesame.classList.add('is-hidden');
    toast('芝麻粘住了，上铛烙');
    setTimeout(function () {
      if (s.step === 'sesame') {
        setStep('bake');
        transform(n.bun, DOUGH.x, DOUGH.y);
      }
    }, 480);
  }

  /* ---------------- bake：上铛 / 翻面 / 起锅 ---------------- */

  function moveBun(p) {
    if (s.step !== 'bake' || s.done) return;
    var x = clamp(p.x, 100, 840);
    var y = clamp(p.y, 80, 510);
    transform(n.bun, x, y);
    if (s.inPan && !s.flipped && s.dragStart && s.dragStart.y - p.y > 52) {
      flipBun();
    }
  }

  function endBun(p) {
    if (s.step !== 'bake' || s.done) return;
    var onPlate = dist(p.x, p.y, PLATE.x, PLATE.y) < 130;
    var nearPan = dist(p.x, p.y, PAN.x, PAN.y) < 104;

    if (onPlate && s.inPan) {
      plateBun();
      return;
    }
    if (!s.inPan && nearPan) {
      placeInPan();
      return;
    }
    if (s.inPan) {
      transform(n.bun, PAN.x, PAN.y);
      if (!s.flipped) toast('按着饼往上拖，就能翻面');
      else toast('拖到右上角的盘里起锅');
    } else {
      transform(n.bun, DOUGH.x, DOUGH.y);
      toast('把饼拖进饼铛');
    }
  }

  function placeInPan() {
    if (s.inPan) return;
    s.inPan = true;
    transform(n.bun, PAN.x, PAN.y);
    n.bunInner.classList.remove('pop');
    void n.bun.getBoundingClientRect();
    n.bunInner.classList.add('pop');
    n.pan.classList.add('hot');
    show(n.steam, true);
    show(n.plate, true);
    n.hintPan.classList.add('is-hidden');
    n.hintFlip.classList.remove('is-hidden');
    s.promptFlip = false;
    s.promptPlate = false;
    s.promptBurn = false;
    startBakeLoop();
    toast('上铛了，看着它慢慢上色');
  }

  function startBakeLoop() {
    if (s.bakeRAF) return;
    s.baking = true;
    s.bakeLast = 0;
    s.bakeRAF = requestAnimationFrame(bakeTick);
  }

  function bakeTick(ts) {
    if (!s.baking) { s.bakeRAF = 0; return; }
    if (!s.bakeLast) s.bakeLast = ts;
    var dt = Math.min(ts - s.bakeLast, 90);
    s.bakeLast = ts;
    var speed = s.autoBake ? 5.2 : 1;

    if (s.inPan && !s.done) {
      if (!s.flipped) s.sideA += (dt * speed) / 6600;
      else s.sideB += (dt * speed) / 6600;
      s.colorHeat = clamp(s.colorHeat + (dt * speed) / 6000, 0, 1.5);
      updateBakeLook();

      if (!s.flipped && s.sideA > 0.62 && !s.promptFlip) {
        s.promptFlip = true;
        toast('边缘冒香了：按住饼往上拖，翻面');
      } else if (!s.flipped && s.sideA > 1.06 && !s.promptBurn) {
        s.promptBurn = true;
        toast('火有点大了，快翻面或起锅');
      } else if (s.flipped && s.sideB > 0.66 && !s.promptPlate) {
        s.promptPlate = true;
        toast('两面金黄了，拖到盘里起锅');
      }
    }
    s.bakeRAF = requestAnimationFrame(bakeTick);
  }

  function updateBakeLook() {
    var h = s.colorHeat;
    n.bunBody.setAttribute('fill', crustColor(h));
    n.bunBody.setAttribute('stroke', crustColor(h + 0.22));
    n.charSpots.setAttribute('opacity', String(clamp((h - 0.95) * 2.2, 0, 0.85)));
    n.bunGlow.setAttribute('opacity', s.inPan ? String(clamp(0.18 + h * 0.34, 0, 0.6)) : '0');
    var ny = 92 - clamp(h, 0, 1.35) / 1.35 * 150;
    n.needle.setAttribute('y1', ny.toFixed(1));
    n.needle.setAttribute('y2', ny.toFixed(1));
    setHud('bake', clamp(h / 1.1, 0, 1), Math.round(h * 100) + '°');
  }

  function flipBun(silent) {
    if (!s.inPan || s.flipped || s.done) return;
    s.flipped = true;
    s.sideB = 0;
    n.bunInner.classList.remove('flip');
    void n.bunInner.getBoundingClientRect();
    n.bunInner.classList.add('flip');
    transform(n.bun, PAN.x, PAN.y);
    n.hintFlip.classList.add('is-hidden');
    n.hintPlate.classList.remove('is-hidden');
    if (!silent) {
      toast('翻面了，另一面也烙到金黄');
      floatText(n.bun, '翻面', 0, -78);
    }
  }

  function plateBun(silent) {
    if (s.done || !s.inPan) return;
    s.done = true;
    s.inPan = false;
    s.baking = false;
    s.autoBake = false;
    if (s.bakeRAF) { cancelAnimationFrame(s.bakeRAF); s.bakeRAF = 0; }
    show(n.steam, false);
    n.pan.classList.remove('hot');
    n.bunGlow.setAttribute('opacity', '0');
    n.hintFlip.classList.add('is-hidden');
    n.hintPlate.classList.add('is-hidden');
    transform(n.bun, PLATE.x, PLATE.y);
    n.bunInner.classList.remove('pop');
    void n.bun.getBoundingClientRect();
    n.bunInner.classList.add('pop');
    scoreBake();
    if (!silent) toast('起锅了，切开看看');
    setTimeout(function () { showResult(); }, 720);
  }

  function scoreBake() {
    var good = function (x) { return clamp(100 - Math.abs(x - 0.8) * 165, 0, 100); };
    var heat, note;
    if (!s.flipped) {
      heat = clamp(Math.round(s.sideA * 72), 8, 74);
      note = s.sideA > 1.05 ? '没翻面，一面已经偏焦' : '没翻面，只烙了一面';
    } else {
      heat = Math.round(good(s.sideA) * 0.5 + good(s.sideB) * 0.5);
      if (s.sideA > 1.05 || s.sideB > 1.05) {
        heat = Math.max(18, heat - 12);
        note = '有一面火大了一点，带点焦香';
      } else if (s.sideA < 0.48 || s.sideB < 0.48) {
        note = '有一面偏生，颜色浅';
      } else if (s.sideA > 0.92 || s.sideB > 0.92) {
        note = '火候略深，酥皮更脆';
      } else {
        note = '两面都金黄，火候正好';
      }
    }
    s.heat = heat;
    s.heatNote = note;
  }

  /* ---------------- 结算 ---------------- */

  function scoreOpen() {
    return clamp(Math.round(30 + 25 * s.roll + 30 * (s.folds / 2) + 15 * s.oil), 0, 100);
  }

  function layerCount() {
    return 8 + s.folds * 5 + Math.round(s.oil * 2);
  }

  function showResult() {
    if (s.resultOpen) return;
    s.resultOpen = true;
    setStep('result');

    var open = scoreOpen();
    var seal = Math.round(s.sealQuality || 0);
    var heat = Math.round(s.heat || 0);
    var layers = layerCount();
    var avg = (open + seal + heat) / 3;

    ui.rank.textContent = avg >= 92 ? '酥得掉渣' : avg >= 80 ? '有模有样' : avg >= 64 ? '趁热还能吃' : '第一块，难免手生';
    ui.title.textContent = avg >= 80 ? '酥皮一开，层就出来了' : '这块饼，还有下一块的余地';
    ui.note.textContent = s.heatNote + (s.sealQuality < 92 ? ' · 收口略松，馅香漏了一点' : ' · 收口紧实');
    ui.layerChip.textContent = layers + ' 层';

    drawCrossSection(layers, heat);

    ui.metOpen.style.width = '0%';
    ui.metSeal.style.width = '0%';
    ui.metHeat.style.width = '0%';
    ui.numOpen.textContent = '0';
    ui.numSeal.textContent = '0';
    ui.numHeat.textContent = '0';

    ui.layer.hidden = false;
    body.classList.add('result-open');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        ui.metOpen.style.width = open + '%';
        ui.metSeal.style.width = seal + '%';
        ui.metHeat.style.width = heat + '%';
        ui.numOpen.textContent = open;
        ui.numSeal.textContent = seal;
        ui.numHeat.textContent = heat;
      });
    });
    setTimeout(function () { ui.againBtn.focus(); }, 120);
  }

  function drawCrossSection(layers, heat) {
    ui.crossLayers.innerHTML = '';
    var top = 66, bottom = 196;
    for (var i = 0; i < layers; i++) {
      var t = layers === 1 ? 0 : i / (layers - 1);
      var y = lerp(top, bottom, t);
      var amp = 4 + (i % 3) * 2.4;
      var d = 'M26 ' + (y + amp) +
        ' C 92 ' + (y - amp * 1.5) + ', 154 ' + (y + amp * 0.8) +
        ', 222 ' + (y - amp * 0.5) +
        ' S 342 ' + (y + amp * 1.4) + ', 418 ' + y;
      var p = svg('path', {
        d: d,
        fill: 'none',
        stroke: i % 2 ? '#d5a86c' : '#e6c795',
        'stroke-width': 2.1,
        'stroke-linecap': 'round',
        opacity: 0.78
      });
      p.style.animationDelay = (i * 26) + 'ms';
      ui.crossLayers.appendChild(p);
    }
    ui.crossCrust.setAttribute('stroke', crustColor(clamp(heat / 62, 0, 1.3)));

    ui.crossSesame.innerHTML = '';
    var count = clamp(Math.round(s.seeds / 2), 3, 15);
    for (var k = 0; k < count; k++) {
      var x = 66 + (k / Math.max(1, count - 1)) * 300 + (Math.random() * 10 - 5);
      var yy = 108 - Math.sin((x - 42) / 356 * Math.PI) * 44 + Math.random() * 22;
      var dot = svg('ellipse', {
        cx: x.toFixed(1), cy: yy.toFixed(1), rx: 4.4, ry: 2.2,
        fill: '#2f2721',
        transform: 'rotate(' + Math.round(Math.random() * 160) + ' ' + x.toFixed(1) + ' ' + yy.toFixed(1) + ')'
      });
      dot.classList.add('cross-sesame');
      dot.style.animationDelay = (200 + k * 40) + 'ms';
      ui.crossSesame.appendChild(dot);
    }
  }

  function closeResult() {
    ui.layer.hidden = true;
    s.resultOpen = false;
    body.classList.remove('result-open');
  }

  /* ---------------- 重置 ---------------- */

  function resetGame() {
    autoRun++;
    s.autoRunning = false;
    s.autoBake = false;
    if (s.bakeRAF) cancelAnimationFrame(s.bakeRAF);
    s.bakeRAF = 0;
    s.baking = false;
    drag = null;
    closeResult();

    s.step = 'roll';
    s.roll = 0;
    s.oil = 0;
    s.oilDone = false;
    s.folds = 0;
    s.folding = false;
    s.finishing = false;
    s.filled = false;
    s.sealCovered = 0;
    s.sealLifts = 0;
    s.sealQuality = 100;
    s.sealDone = false;
    s.lastAngle = null;
    s.seeds = 0;
    s.seedsDone = false;
    s.lastSeedAt = 0;
    s.inPan = false;
    s.flipped = false;
    s.done = false;
    s.sideA = 0;
    s.sideB = 0;
    s.colorHeat = 0;
    s.heat = 0;
    s.heatNote = '';
    s.promptFlip = false;
    s.promptPlate = false;
    s.promptBurn = false;
    s.dragStart = null;
    s.lastPinX = DOUGH.x;
    s.doughRx = DOUGH_START.rx;
    s.doughRy = DOUGH_START.ry;

    ui.autoBtn.disabled = false;
    ui.autoBtn.textContent = '自动完成';

    n.oilSheen.style.opacity = '0';
    n.ball.classList.remove('near');
    n.bunInner.classList.remove('pop', 'flip');
    n.pan.classList.remove('hot');
    n.doughTop.setAttribute('opacity', 1);
    n.foldCrease.setAttribute('opacity', 0);
    n.sealArc.setAttribute('opacity', 0);
    n.sealArc.setAttribute('stroke-dashoffset', 1);
    n.sealDots.innerHTML = '';
    n.seeds.innerHTML = '';
    ui.crossLayers.innerHTML = '';
    ui.crossSesame.innerHTML = '';
    n.mound.classList.add('is-hidden');
    n.leak.setAttribute('opacity', 0);
    n.charSpots.setAttribute('opacity', 0);
    n.bunGlow.setAttribute('opacity', 0);
    n.bunBody.setAttribute('fill', '#f4e6c4');
    n.bunBody.setAttribute('stroke', '#c9a468');
    n.needle.setAttribute('y1', 92);
    n.needle.setAttribute('y2', 92);
    n.hintFold.classList.add('is-hidden');
    n.hintFill.classList.add('is-hidden');
    n.hintSeal.classList.add('is-hidden');
    n.hintSesame.classList.add('is-hidden');
    n.hintPan.classList.add('is-hidden');
    n.hintFlip.classList.add('is-hidden');
    n.hintPlate.classList.add('is-hidden');
    n.hintOil.classList.remove('is-hidden');
    n.sealHint.classList.remove('is-hidden');
    flapLayer.setAttribute('opacity', 0);

    buildOilMarks();
    buildSealDots();
    applyDough();
    transform(n.ball, BALL_HOME.x, BALL_HOME.y);
    transform(n.jar, 700, 336);
    transform(n.bun, DOUGH.x, DOUGH.y);
    transform(n.plate, PLATE.x, PLATE.y);
    transform(n.gauge, 470, 168);
    transform(n.foldHandle, DOUGH.x + s.doughRx + 46, DOUGH.y - 8);
    transform(n.sealHandle, DOUGH.x, DOUGH.y - s.doughRy - 14);
    positionPin(DOUGH.x, 0);
    n.pin.classList.remove('dragging');
    n.brush.classList.remove('dragging');
    n.jar.classList.remove('dragging');
    n.bun.classList.remove('dragging');
    n.ball.classList.remove('dragging');
    n.foldHandle.classList.remove('dragging');
    n.sealHandle.classList.remove('dragging');
    setStep('roll');
    clearTimeout(toastTimer);
    ui.toast.classList.remove('show');
  }

  /* ---------------- 自动完成 ---------------- */

  async function runAuto() {
    if (s.autoRunning) return;
    resetGame();
    var token = ++autoRun;
    s.autoRunning = true;
    ui.autoBtn.disabled = true;
    var oldLabel = ui.autoBtn.textContent;
    ui.autoBtn.textContent = '自动中…';
    var alive = function () { return token === autoRun; };

    try {
      await autoRoll(alive);
      if (!alive()) return;
      await autoFold(alive);
      if (!alive()) return;
      await autoFill(alive);
      if (!alive()) return;
      await autoSeal(alive);
      if (!alive()) return;
      await autoSesame(alive);
      if (!alive()) return;
      await autoBake(alive);
    } finally {
      if (alive()) {
        s.autoRunning = false;
        ui.autoBtn.disabled = false;
        ui.autoBtn.textContent = oldLabel;
      }
    }
  }

  function tween(duration, step, alive) {
    return new Promise(function (resolve) {
      var start = performance.now();
      function frame(now) {
        if (!alive()) { resolve(); return; }
        var t = clamp((now - start) / duration, 0, 1);
        step(t);
        if (t < 1) requestAnimationFrame(frame);
        else resolve();
      }
      requestAnimationFrame(frame);
    });
  }

  async function autoRoll(alive) {
    if (s.step !== 'roll') return;
    await tween(1500, function (t) {
      s.roll = t;
      var e = easeOut(t);
      s.doughRx = lerp(DOUGH_START.rx, DOUGH_END.rx, e);
      s.doughRy = lerp(DOUGH_START.ry, DOUGH_END.ry, e);
      applyDough();
      positionPin(DOUGH.x + Math.sin(t * Math.PI * 9) * 160, Math.cos(t * Math.PI * 9) * 7);
      setHud('roll', t);
    }, alive);
    if (!alive()) return;
    finishRoll();
    await delay(620);
  }

  async function autoFold(alive) {
    if (s.step !== 'fold') return;
    await tween(1000, function (t) {
      s.oil = t;
      n.oilSheen.style.opacity = String(clamp((t - 0.12) * 1.1, 0, 0.92));
      var marks = n.oilMarks.children;
      var lit = Math.floor(t * marks.length);
      for (var i = 0; i < marks.length; i++) marks[i].setAttribute('opacity', i < lit ? '0.6' : '0');
      transform(n.brush, DOUGH.x + Math.cos(t * 14) * s.doughRx * 0.7, DOUGH.y + Math.sin(t * 11) * s.doughRy * 0.6);
      setHud('fold', t * 0.5, s.folds + ' / 2 折');
    }, alive);
    if (!alive()) return;
    finishOil();
    await delay(520);

    for (var f = 0; f < 2; f++) {
      var side = s.folds === 0 ? 1 : -1;
      var startX = DOUGH.x + side * (s.doughRx + 46);
      await tween(480, function (t) {
        var x = lerp(startX, DOUGH.x - side * 10, t);
        transform(n.foldHandle, x, DOUGH.y);
        flapLayer.setAttribute('rx', s.doughRx * 0.62);
        flapLayer.setAttribute('ry', s.doughRy * 0.98);
        flapLayer.setAttribute('cx', side * s.doughRx * 0.58 * (1 - t * 0.9));
        flapLayer.setAttribute('opacity', (t * 0.85).toFixed(2));
      }, alive);
      if (!alive()) return;
      commitFold();
      await delay(520);
      if (!alive()) return;
    }
  }

  async function autoFill(alive) {
    if (s.step !== 'fill') return;
    var from = { x: BALL_HOME.x, y: BALL_HOME.y };
    await tween(650, function (t) {
      var e = easeOut(t);
      transform(n.ball, lerp(from.x, DOUGH.x, e), lerp(from.y, DOUGH.y, e));
    }, alive);
    if (!alive()) return;
    placeFilling();
    await delay(900);
  }

  async function autoSeal(alive) {
    if (s.step !== 'seal') return;
    await tween(1300, function (t) {
      var a = -Math.PI / 2 + t * Math.PI * 2;
      s.sealCovered = t;
      transform(n.sealHandle,
        DOUGH.x + Math.cos(a) * (s.doughRx + 6),
        DOUGH.y + Math.sin(a) * (s.doughRy + 6));
      n.sealArc.setAttribute('opacity', '0.9');
      n.sealArc.setAttribute('stroke-dashoffset', (1 - t).toFixed(4));
      updateSealDots();
      setHud('seal', t, Math.round(t * 100) + '%');
    }, alive);
    if (!alive()) return;
    completeSeal();
    await delay(900);
  }

  async function autoSesame(alive) {
    if (s.step !== 'sesame') return;
    await tween(1100, function (t) {
      var a = t * Math.PI * 5;
      transform(n.jar, DOUGH.x + Math.cos(a) * 66, DOUGH.y + Math.sin(a) * 36);
    }, alive);
    if (!alive()) return;
    while (s.seeds < 4) addSeed();
    setHud('sesame', 1, s.seeds + ' 粒');
    finishSesame();
    await delay(900);
  }

  async function autoBake(alive) {
    if (s.step !== 'bake') return;
    await tween(420, function (t) {
      transform(n.bun, lerp(DOUGH.x, PAN.x, t), lerp(DOUGH.y, PAN.y, t) - Math.sin(t * Math.PI) * 40);
    }, alive);
    if (!alive()) return;
    placeInPan();
    s.autoBake = true;

    await waitFor(function () { return s.sideA >= 0.78; }, 6000, alive);
    if (!alive()) return;
    s.sideA = 0.8;
    flipBun(true);
    floatText(n.bun, '翻面', 0, -78);
    await waitFor(function () { return s.sideB >= 0.78; }, 6000, alive);
    if (!alive()) return;
    s.sideB = 0.8;
    await delay(380);
    plateBun(false);
  }

  function waitFor(cond, timeout, alive) {
    return new Promise(function (resolve) {
      var start = performance.now();
      function check() {
        if (!alive() || cond() || performance.now() - start > timeout) { resolve(); return; }
        setTimeout(check, 60);
      }
      check();
    });
  }

  /* ---------------- 初始化 ---------------- */

  function init() {
    buildPleats();
    buildOilMarks();
    buildSealDots();
    applyDough();
    transform(n.ball, BALL_HOME.x, BALL_HOME.y);
    transform(n.plate, PLATE.x, PLATE.y);
    transform(n.gauge, 470, 168);
    positionPin(DOUGH.x, 0);
    resetGame();

    bindDrag(n.pin, 'roll');
    bindDrag(n.brush, 'brush');
    bindDrag(n.foldHandle, 'fold');
    bindDrag(n.ball, 'ball');
    bindDrag(n.sealHandle, 'seal');
    bindDrag(n.jar, 'jar');
    bindDrag(n.bun, 'bun');

    stage.addEventListener('pointermove', onMove, { passive: false });
    stage.addEventListener('pointerup', onUp);
    stage.addEventListener('pointercancel', onCancel);

    ui.resetBtn.addEventListener('click', resetGame);
    ui.againBtn.addEventListener('click', function () { resetGame(); });
    ui.autoBtn.addEventListener('click', runAuto);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && s.resultOpen) resetGame();
    });
    ui.layer.addEventListener('click', function (e) {
      if (e.target === ui.layer) resetGame();
    });

    s.autoRunning = false;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
