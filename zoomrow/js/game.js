/* Zoomrow: Arrow Escape — P-Prece Studio */
(function () {
  'use strict';
  var C = window.ZRCore, A = window.ZRAudio, DX = C.DX, DY = C.DY;
  var LEVELS = (window.ZR_LEVELS || []).map(C.unpack);
  var TOTAL = LEVELS.length;
  var $ = function (id) { return document.getElementById(id); };

  // ---------------- i18n ----------------
  var T = {
    th: { presents: 'นำเสนอ', subtitle: 'แตะลูกศรหนีกระดาน', play: 'เล่นต่อ', levels: 'เลือกด่าน', endless: 'โหมดไม่รู้จบ', hint: 'คำใบ้', restart: 'เริ่มใหม่',
      sound: 'เสียง', settings: 'ตั้งค่า', left: 'เหลือ', clear: 'ผ่านด่าน!', next: 'ด่านต่อไป', replay: 'เล่นอีกครั้ง', menu: 'เมนู', outHearts: 'หัวใจหมดแล้ว',
      tryAgain: 'ลองวางลำดับใหม่อีกครั้งนะ', retryFree: 'เล่นใหม่ (ฟรี)', vibrate: 'การสั่น', dark: 'โหมดมืด', language: 'ภาษา', done: 'เสร็จสิ้น',
      tut: 'แตะลูกศรที่ทางข้างหน้าว่าง', level: 'ด่าน', stage: 'รอบ', best: 'สถิติ', arrows: 'ลูกศร', noHint: 'คำใบ้หมดแล้ว', perfect: 'สมบูรณ์แบบ ไม่พลาดเลย!',
      good: 'เก่งมาก! พลาดไป {n} ครั้ง', allDone: 'ผ่านครบทุกด่านแล้ว! ลองโหมดไม่รู้จบต่อได้เลย', endlessNext: 'รอบต่อไป', endlessOver: 'จบรอบไม่รู้จบ ทำได้ {n} รอบ',
      combo: 'คอมโบ', shapes: { full: '', diamond: 'เพชร', heart: 'หัวใจ', cross: 'กากบาท', frame: 'กรอบ', circle: 'วงกลม', house: 'บ้าน', hourglass: 'นาฬิกาทราย' }, startLv: 'เริ่มด่าน {n}' },
    en: { presents: 'presents', subtitle: 'Tap arrows, clear the board', play: 'Continue', levels: 'Levels', endless: 'Endless Mode', hint: 'Hint', restart: 'Restart',
      sound: 'Sound', settings: 'Settings', left: 'Left', clear: 'Level Clear!', next: 'Next Level', replay: 'Replay', menu: 'Menu', outHearts: 'Out of hearts',
      tryAgain: 'Try a different order', retryFree: 'Retry (free)', vibrate: 'Vibration', dark: 'Dark mode', language: 'Language', done: 'Done',
      tut: 'Tap an arrow with a clear path', level: 'Level', stage: 'Stage', best: 'Best', arrows: 'arrows', noHint: 'No hints left', perfect: 'Perfect, no mistakes!',
      good: 'Nice! {n} mistake(s)', allDone: 'All levels cleared! Try Endless Mode', endlessNext: 'Next stage', endlessOver: 'Endless run over: {n} stage(s)',
      combo: 'Combo', shapes: { full: '', diamond: 'Diamond', heart: 'Heart', cross: 'Cross', frame: 'Frame', circle: 'Circle', house: 'House', hourglass: 'Hourglass' }, startLv: 'Start level {n}' }
  };

  // ---------------- save ----------------
  var KEY = 'zoomrow.save.v1';
  var save = { unlocked: 1, stars: {}, sound: true, vib: true, dark: false, lang: 'th', endlessBest: 0, tutDone: false };
  try { var s0 = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s0) for (var k in s0) save[k] = s0[k]; } catch (e) {}
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {} }
  function t(k, n) { var s = (T[save.lang] || T.th)[k]; if (typeof s === 'string' && n !== undefined) s = s.replace('{n}', n); return s; }

  // ---------------- theme ----------------
  var PALETTE = ['#FF5E4D', '#3D7BFF', '#14B8A6', '#FFAA1F', '#8B5CF6', '#F0468C', '#22A95B', '#1F6FB8', '#FF7A1A', '#C2410C', '#0E9F9A', '#6D4BD8'];
  function themeColors() {
    var dark = save.dark;
    return { tile: dark ? '#262B3E' : '#EFE5D3', tileEdge: dark ? '#20253A' : '#E5D8C0', dot: dark ? 'rgba(255,255,255,.10)' : 'rgba(120,90,50,.16)', shadow: dark ? 'rgba(0,0,0,.45)' : 'rgba(70,45,10,.22)' };
  }

  // ---------------- screens ----------------
  var cur = 'splash';
  function show(id) {
    document.querySelectorAll('.screen').forEach(function (el) { el.classList.toggle('active', el.id === id); });
    cur = id;
    if (id === 'menu') refreshMenu();
    if (id === 'levels') buildLevelGrid();
    if (id === 'game') requestAnimationFrame(resize);
  }
  function applyLang() {
    document.documentElement.lang = save.lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) { var v = t(el.getAttribute('data-i18n')); if (typeof v === 'string') el.textContent = v; });
    document.querySelectorAll('#sLang button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-v') === save.lang); });
    if (G.level) updateHud();
    refreshMenu();
  }
  function applyTheme() {
    document.body.classList.toggle('dark', !!save.dark);
    var m = document.querySelector('meta[name=theme-color]'); if (m) m.content = save.dark ? '#171A26' : '#FBF6EC';
    drawLogo();
  }
  function refreshToggles() {
    $('sSound').classList.toggle('on', !!save.sound); $('sVib').classList.toggle('on', !!save.vib); $('sDark').classList.toggle('on', !!save.dark);
    $('soundIcon').innerHTML = save.sound ? '<path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
      : '<path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M17 9l5 6M22 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
    $('tSound').classList.toggle('off', !save.sound);
    A.setEnabled(save.sound);
  }
  function refreshMenu() {
    var nxt = Math.min(save.unlocked, TOTAL);
    $('playLv').textContent = t('level') + ' ' + nxt;
    $('endlessBest').textContent = save.endlessBest ? (t('best') + ' ' + save.endlessBest + ' ' + t('stage')) : '';
  }
  function vib(p) { if (save.vib && navigator.vibrate) try { navigator.vibrate(p); } catch (e) {} }

  // ---------------- logo (menu) ----------------
  function drawLogo() {
    var cv = $('logoCanvas'), x = cv.getContext('2d'); x.clearRect(0, 0, 600, 300);
    var c = 52, ox = 300 - c * 4.5, oy = 150 - c * 2.2;
    var demo = [
      { cells: [[0, 3], [1, 3], [2, 3], [2, 2], [2, 1]], dir: 0, col: PALETTE[0] },
      { cells: [[4, 0], [4, 1], [4, 2], [5, 2], [6, 2]], dir: 1, col: PALETTE[1] },
      { cells: [[8, 3], [7, 3], [6, 3], [5, 3]], dir: 3, col: PALETTE[2] },
      { cells: [[7, 0], [8, 0], [8, 1]], dir: 2, col: PALETTE[3] }
    ];
    var th = themeColors();
    for (var y = 0; y < 4; y++) for (var xx = 0; xx < 9; xx++) { x.fillStyle = th.tile; rr(x, ox + xx * c + 3, oy + y * c + 3, c - 6, c - 6, 10); x.fill(); }
    demo.forEach(function (a) { drawRibbon(x, a.cells.map(function (p) { return [ox + (p[0] + 0.5) * c, oy + (p[1] + 0.5) * c]; }), a.col, c, 1, a.dir, false, 0, th); });
  }
  function rr(x, X, Y, W, H, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + W, Y, X + W, Y + H, r); x.arcTo(X + W, Y + H, X, Y + H, r); x.arcTo(X, Y + H, X, Y, r); x.arcTo(X, Y, X + W, Y, r); x.closePath(); }
  function shade(hex, f) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
    return 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
  }
  // pts: screen points tail->head; dirHead: unit vector of head
  function drawRibbon(x, pts, col, c, alpha, dir, glow, flash, th) {
    if (pts.length < 2) return;
    var lw = c * 0.34, hx = pts[pts.length - 1][0], hy = pts[pts.length - 1][1];
    var p2 = pts[pts.length - 2], vx = hx - p2[0], vy = hy - p2[1], vl = Math.hypot(vx, vy) || 1; vx /= vl; vy /= vl;
    if (dir !== undefined && dir !== null && vl < 0.001) { vx = DX[dir]; vy = DY[dir]; }
    // shorten body so it ends under arrowhead base
    var body = pts.slice(); body[body.length - 1] = [hx - vx * c * 0.12, hy - vy * c * 0.12];
    x.save(); x.globalAlpha = alpha; x.lineCap = 'round'; x.lineJoin = 'round';
    function path() { x.beginPath(); x.moveTo(body[0][0], body[0][1]); for (var i = 1; i < body.length; i++) x.lineTo(body[i][0], body[i][1]); }
    function head(sc) {
      var tip = c * 0.46, back = c * 0.16, hw = c * 0.38 * sc, px = -vy, py = vx;
      x.beginPath(); x.moveTo(hx + vx * tip, hy + vy * tip);
      x.lineTo(hx - vx * back + px * hw, hy - vy * back + py * hw);
      x.quadraticCurveTo(hx + vx * c * 0.02, hy + vy * c * 0.02, hx - vx * back - px * hw, hy - vy * back - py * hw); x.closePath();
    }
    if (glow) { x.shadowColor = col; x.shadowBlur = c * 0.6 * glow; }
    // drop shadow
    x.save(); x.translate(0, c * 0.07); x.strokeStyle = th.shadow; x.lineWidth = lw; path(); x.stroke(); x.fillStyle = th.shadow; head(1); x.fill(); x.restore();
    var main = flash ? mix(col, '#FF2D2D', flash) : col;
    x.strokeStyle = shade(main, -0.18); x.lineWidth = lw + c * 0.05; path(); x.stroke();
    x.strokeStyle = main; x.lineWidth = lw; path(); x.stroke();
    x.shadowBlur = 0;
    x.strokeStyle = 'rgba(255,255,255,.32)'; x.lineWidth = lw * 0.28; x.save(); x.translate(-c * 0.03, -c * 0.045); path(); x.stroke(); x.restore();
    x.fillStyle = shade(main, -0.22); head(1.12); x.fill();
    x.fillStyle = main; head(1); x.fill();
    // tail cap dot
    x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.arc(body[0][0], body[0][1], lw * 0.18, 0, 7); x.fill();
    x.restore();
  }
  function mix(a, b, f) {
    var A1 = parseInt(a.slice(1), 16), B1 = parseInt(b.slice(1), 16);
    var r = ((A1 >> 16) * (1 - f) + (B1 >> 16) * f) | 0, g = (((A1 >> 8) & 255) * (1 - f) + ((B1 >> 8) & 255) * f) | 0, bb = ((A1 & 255) * (1 - f) + (B1 & 255) * f) | 0;
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + bb).toString(16).slice(1);
  }

  // ---------------- game state ----------------
  var G = { level: null, mode: 'level', n: 1, stage: 1, arrows: [], occ: {}, hearts: 3, hints: 3, combo: 0, mistakes: 0, over: false, won: false, hint: null, sparks: [], parts: [] };
  var cv = $('board'), ctx = cv.getContext('2d'), DPR = 1, CW = 0, CH = 0;
  var view = { c0: 40, z: 1, ox: 0, oy: 0 };

  function assignColors(L) {
    var n = L.arrows.length, cellOwner = {}, cols = new Array(n).fill(-1);
    L.arrows.forEach(function (a, i) { a.cells.forEach(function (c) { cellOwner[c[1] * L.w + c[0]] = i; }); });
    for (var i = 0; i < n; i++) {
      var used = {};
      L.arrows[i].cells.forEach(function (c) { for (var d = 0; d < 4; d++) { var o = cellOwner[(c[1] + DY[d]) * L.w + c[0] + DX[d]]; if (o !== undefined && o !== i && cols[o] >= 0 && c[0] + DX[d] >= 0 && c[0] + DX[d] < L.w) used[cols[o]] = 1; } });
      var start = (i * 5 + L.n * 3) % PALETTE.length;
      for (var k = 0; k < PALETTE.length; k++) { var cc = (start + k) % PALETTE.length; if (!used[cc]) { cols[i] = cc; break; } }
      if (cols[i] < 0) cols[i] = start;
    }
    return cols.map(function (k) { return PALETTE[k]; });
  }

  function startLevel(L, mode) {
    G.level = L; G.mode = mode; G.hearts = 3; G.hints = 3; G.combo = 0; G.mistakes = 0; G.over = false; G.won = false; G.hint = null; G.sparks = []; G.parts = [];
    var cols = assignColors(L);
    conf = []; fxc.setTransform(1, 0, 0, 1, 0, 0); fxc.clearRect(0, 0, $('fx').width, $('fx').height);
    G.arrows = L.arrows.map(function (a, i) {
      var ray = C.rayCells(L, a), traj = a.cells.slice();
      var last = a.cells[a.cells.length - 1];
      var extra = ray.length + a.cells.length + 3;
      for (var k = 1; k <= extra; k++) traj.push([last[0] + DX[a.dir] * k, last[1] + DY[a.dir] * k]);
      return { id: i, cells: a.cells, dir: a.dir, col: cols[i], traj: traj, len: a.cells.length, state: 'idle', s: 0, v: 0, t: 0, flash: 0, rayLen: ray.length, appear: 0 };
    });
    rebuildOcc();
    view.z = 1; view.ox = 0; view.oy = 0;
    hideOverlays(); show('game'); updateHud(); resize();
    G.startT = performance.now();
    var showTut = mode === 'level' && L.n === 1;
    $('tut').classList.toggle('hidden', !showTut); $('tutBubble').classList.toggle('hidden', !showTut); G.tut = showTut;
  }
  function rebuildOcc() { G.occ = {}; var w = G.level.w; G.arrows.forEach(function (a) { if (a.state === 'idle' || a.state === 'bump') a.cells.forEach(function (c) { G.occ[c[1] * w + c[0]] = a.id; }); }); }
  function aliveCount() { return G.arrows.filter(function (a) { return a.state === 'idle' || a.state === 'bump'; }).length; }
  function blockerInfo(a) {
    var L = G.level, x = a.cells[a.cells.length - 1][0] + DX[a.dir], y = a.cells[a.cells.length - 1][1] + DY[a.dir], dist = 1;
    while (C.inBox(L, x, y)) { var o = G.occ[y * L.w + x]; if (o !== undefined && o !== a.id) return { id: o, x: x, y: y, dist: dist }; x += DX[a.dir]; y += DY[a.dir]; dist++; }
    return null;
  }
  function freeIds() { return G.arrows.filter(function (a) { return a.state === 'idle' && !blockerInfo(a); }).map(function (a) { return a.id; }); }

  function updateHud() {
    if (!G.level) return;
    if (G.mode === 'level') { $('lvText').textContent = t('level') + ' ' + G.level.n; var sh = t('shapes')[G.level.shape] || ''; $('lvSub').textContent = G.level.w + '×' + G.level.h + (sh ? ' · ' + sh : ''); }
    else { $('lvText').textContent = t('endless'); $('lvSub').textContent = t('stage') + ' ' + G.stage + (save.endlessBest ? ' · ' + t('best') + ' ' + save.endlessBest : ''); }
    var h = $('hearts'); if (h.children.length !== 3) { h.innerHTML = '<i>♥</i><i>♥</i><i>♥</i>'; }
    for (var i = 0; i < 3; i++) h.children[i].classList.toggle('off', i >= G.hearts);
    $('hintCount').textContent = G.hints; $('tHint').classList.toggle('off', G.hints <= 0);
    $('leftCount').textContent = aliveCount();
  }

  // ---------------- layout / transform ----------------
  function resize() {
    var r = cv.getBoundingClientRect(); if (!r.width) return;
    DPR = Math.min(3, window.devicePixelRatio || 1); CW = r.width; CH = r.height;
    cv.width = Math.round(CW * DPR); cv.height = Math.round(CH * DPR);
    var fx = $('fx'); fx.width = Math.round(window.innerWidth * DPR); fx.height = Math.round(window.innerHeight * DPR);
    if (G.level) { var pad = 16; view.c0 = Math.min((CW - pad * 2) / G.level.w, (CH - pad * 2) / G.level.h, 76); }
    clampView();
  }
  function cell() { return view.c0 * view.z; }
  function origin() { var c = cell(); return [CW / 2 - G.level.w * c / 2 + view.ox, CH / 2 - G.level.h * c / 2 + view.oy]; }
  function toScreen(px, py) { var c = cell(), o = origin(); return [o[0] + (px + 0.5) * c, o[1] + (py + 0.5) * c]; }
  function clampView() {
    if (!G.level) return; var c = cell(), bw = G.level.w * c, bh = G.level.h * c;
    var mx = Math.max(0, (bw - CW) / 2 + 30), my = Math.max(0, (bh - CH) / 2 + 30);
    view.ox = Math.max(-mx, Math.min(mx, view.ox)); view.oy = Math.max(-my, Math.min(my, view.oy));
    if (view.z <= 1.001) { view.ox = 0; view.oy = 0; }
  }
  function setZoom(z, cx, cy) {
    z = Math.max(1, Math.min(3.2, z)); if (cx === undefined) { cx = CW / 2; cy = CH / 2; }
    var c1 = cell(), o = origin(), bx = (cx - o[0]) / c1, by = (cy - o[1]) / c1;
    view.z = z; var c2 = cell();
    view.ox += cx - (CW / 2 - G.level.w * c2 / 2 + view.ox + bx * c2); view.oy += cy - (CH / 2 - G.level.h * c2 / 2 + view.oy + by * c2);
    clampView();
  }

  // ---------------- snake sampling ----------------
  function samplePts(a) {
    var s = a.s, L = a.len, tr = a.traj, pts = [];
    var i0 = Math.floor(s), f = s - i0;
    function at(i, ff) { var p = tr[Math.min(i, tr.length - 1)], q = tr[Math.min(i + 1, tr.length - 1)]; return [p[0] + (q[0] - p[0]) * ff, p[1] + (q[1] - p[1]) * ff]; }
    if (s >= 0) {
      pts.push(at(i0, f));
      for (var i = i0 + 1; i <= i0 + L - 1; i++) pts.push(tr[Math.min(i, tr.length - 1)]);
      if (f > 0) pts.push(at(i0 + L - 1, f));
    } else { // negative = pulled back (bounce): extend tail backwards along first segment
      for (var j = 0; j < L; j++) pts.push(tr[j]);
      var h = pts[L - 1], p = pts[L - 2]; pts[L - 1] = [h[0] + (h[0] - p[0]) * s, h[1] + (h[1] - p[1]) * s];
    }
    return pts;
  }

  // ---------------- input ----------------
  var ptrs = {}, gesture = null;
  cv.addEventListener('pointerdown', function (e) {
    cv.setPointerCapture && cv.setPointerCapture(e.pointerId);
    ptrs[e.pointerId] = { x: e.offsetX, y: e.offsetY, sx: e.offsetX, sy: e.offsetY, t: performance.now() };
    var ids = Object.keys(ptrs);
    if (ids.length === 2) {
      var a = ptrs[ids[0]], b = ptrs[ids[1]];
      gesture = { type: 'pinch', d0: Math.hypot(a.x - b.x, a.y - b.y), z0: view.z, moved: true };
    } else if (ids.length === 1) gesture = { type: 'tap', moved: false, ox0: view.ox, oy0: view.oy };
    e.preventDefault();
  });
  cv.addEventListener('pointermove', function (e) {
    var p = ptrs[e.pointerId]; if (!p) return; p.x = e.offsetX; p.y = e.offsetY;
    var ids = Object.keys(ptrs);
    if (gesture && gesture.type === 'pinch' && ids.length >= 2) {
      var a = ptrs[ids[0]], b = ptrs[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y);
      setZoom(gesture.z0 * d / Math.max(20, gesture.d0), (a.x + b.x) / 2, (a.y + b.y) / 2);
    } else if (gesture && ids.length === 1) {
      var dx = p.x - p.sx, dy = p.y - p.sy;
      if (Math.hypot(dx, dy) > 10) gesture.moved = true;
      if (gesture.moved && view.z > 1.001) { view.ox = gesture.ox0 + dx; view.oy = gesture.oy0 + dy; clampView(); }
    }
  });
  function endPtr(e) {
    var p = ptrs[e.pointerId]; if (!p) return; delete ptrs[e.pointerId];
    if (gesture && gesture.type === 'tap' && !gesture.moved && Object.keys(ptrs).length === 0) handleTap(p.x, p.y);
    if (Object.keys(ptrs).length === 0) gesture = null;
  }
  cv.addEventListener('pointerup', endPtr); cv.addEventListener('pointercancel', function (e) { delete ptrs[e.pointerId]; if (!Object.keys(ptrs).length) gesture = null; });
  cv.addEventListener('wheel', function (e) { if (!G.level) return; e.preventDefault(); setZoom(view.z * (e.deltaY < 0 ? 1.12 : 0.89), e.offsetX, e.offsetY); }, { passive: false });

  function distSeg(px, py, ax, ay, bx, by) { var vx = bx - ax, vy = by - ay, l = vx * vx + vy * vy, tt = l ? Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / l)) : 0; return Math.hypot(px - ax - vx * tt, py - ay - vy * tt); }
  function pickArrow(sx, sy) {
    var c = cell(), o = origin(), bx = (sx - o[0]) / c - 0.5, by = (sy - o[1]) / c - 0.5;
    var best = null, bd = 1e9;
    G.arrows.forEach(function (a) {
      if (a.state !== 'idle') return;
      var cs = a.cells, d = 1e9;
      for (var i = 0; i < cs.length - 1; i++) d = Math.min(d, distSeg(bx, by, cs[i][0], cs[i][1], cs[i + 1][0], cs[i + 1][1]));
      var h = cs[cs.length - 1]; d = Math.min(d, distSeg(bx, by, h[0], h[1], h[0] + DX[a.dir] * 0.45, h[1] + DY[a.dir] * 0.45));
      if (d < bd) { bd = d; best = a; }
    });
    var thr = Math.max(0.62, 26 / c);
    return bd <= thr ? best : null;
  }
  function handleTap(sx, sy) {
    if (!G.level || G.over || cur !== 'game') return;
    var a = pickArrow(sx, sy); if (!a) return;
    tapArrow(a);
  }
  function tapArrow(a) {
    if (G.over || a.state !== 'idle') return false;
    var b = blockerInfo(a);
    if (G.tut) { G.tut = false; $('tut').classList.add('hidden'); $('tutBubble').classList.add('hidden'); save.tutDone = true; persist(); }
    if (G.hint && G.hint.id === a.id) G.hint = null;
    if (!b) {
      a.state = 'exit'; a.v = 9; a.t = 0; rebuildOcc();
      G.combo++; A.escape(G.combo); vib(12); showCombo();
      updateHud();
      if (aliveCount() === 0) { G.over = true; G.won = true; setTimeout(onWin, 650); }
      return true;
    }
    // blocked
    a.state = 'bump'; a.t = 0; a.bumpMax = Math.min(0.34, Math.max(0.12, b.dist - 0.62)); a.flash = 1;
    var blk = G.arrows[b.id]; blk.flash = Math.max(blk.flash, 0.7);
    G.sparks.push({ x: b.x, y: b.y, t: 0 });
    burst(b.x, b.y, '#FF5A3D', 10);
    G.combo = 0; showCombo(); G.mistakes++; G.hearts--; A.bump(); vib([28, 40, 18]);
    var hs = $('hearts').children; if (hs[G.hearts]) { hs[G.hearts].classList.remove('lose'); void hs[G.hearts].offsetWidth; hs[G.hearts].classList.add('lose'); }
    updateHud();
    if (G.hearts <= 0) { G.over = true; setTimeout(onLose, 700); }
    return false;
  }
  var comboTimer = null;
  function showCombo() {
    var el = $('combo');
    if (G.combo >= 2) { el.textContent = t('combo') + ' x' + G.combo; el.classList.add('show'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); clearTimeout(comboTimer); comboTimer = setTimeout(function () { el.classList.remove('show'); }, 1800); }
    else el.classList.remove('show');
  }
  function useHint() {
    if (!G.level || G.over) return;
    if (G.hints <= 0) { toast(t('noHint')); return; }
    var f = freeIds(); if (!f.length) return;
    // prefer the arrow that unblocks the most others
    var bestId = f[0], bestScore = -1;
    f.forEach(function (id) { var sc = 0; G.arrows.forEach(function (o) { if (o.state === 'idle' && o.id !== id) { var bi = blockerInfo(o); if (bi && bi.id === id) sc++; } }); if (sc > bestScore) { bestScore = sc; bestId = id; } });
    G.hint = { id: bestId, t: 0 }; G.hints--; A.hint(); updateHud();
  }
  var toastT = null;
  function toast(msg) { var el = $('combo'); el.textContent = msg; el.classList.add('show'); clearTimeout(comboTimer); comboTimer = setTimeout(function () { el.classList.remove('show'); }, 1400); }

  // ---------------- particles ----------------
  function burst(x, y, col, n) {
    for (var i = 0; i < n; i++) { var an = Math.random() * 6.283, sp = 1.5 + Math.random() * 3; G.parts.push({ x: x, y: y, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, life: 0.5 + Math.random() * 0.3, t: 0, col: col, r: 0.05 + Math.random() * 0.06 }); }
  }

  // ---------------- win / lose ----------------
  function starsFor() { return Math.max(1, G.hearts); }
  function onWin() {
    var st = starsFor();
    A.win(); vib([20, 60, 20]); confetti();
    var msg = G.mistakes === 0 ? t('perfect') : t('good', G.mistakes);
    if (G.mode === 'level') {
      var n = G.level.n; save.stars[n] = Math.max(save.stars[n] || 0, st);
      if (n + 1 > save.unlocked) save.unlocked = Math.min(TOTAL, n + 1);
      if (n === TOTAL) { save.unlocked = TOTAL; msg = t('allDone'); }
      $('wNext').textContent = n === TOTAL ? t('endless') : t('next');
    } else {
      if (G.stage > save.endlessBest) save.endlessBest = G.stage;
      $('wNext').textContent = t('endlessNext');
    }
    persist();
    $('winMsg').textContent = msg;
    var ss = $('winStars').children;
    for (var i = 0; i < 3; i++) { ss[i].className = ''; }
    $('winOv').classList.add('show');
    for (var j = 0; j < 3; j++) (function (j) { setTimeout(function () { ss[j].className = (j < st ? 'on ' : '') + 'pop'; if (j < st) A.click(); }, 300 + j * 220); })(j);
  }
  function onLose() {
    A.lose();
    if (G.mode === 'endless') { $('loseOv').querySelector('.win-msg').textContent = t('endlessOver', G.stage - 1); }
    else $('loseOv').querySelector('.win-msg').textContent = t('tryAgain');
    $('loseOv').classList.add('show');
  }
  function hideOverlays() { ['winOv', 'loseOv', 'setOv'].forEach(function (id) { $(id).classList.remove('show'); }); }

  var conf = [];
  function confetti() {
    var W = window.innerWidth; for (var i = 0; i < 90; i++) conf.push({ x: W / 2 + (Math.random() - 0.5) * 80, y: window.innerHeight * 0.38, vx: (Math.random() - 0.5) * 14, vy: -6 - Math.random() * 10, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4, col: PALETTE[i % PALETTE.length], t: 0, w: 6 + Math.random() * 6, h: 4 + Math.random() * 4 });
  }

  // ---------------- level flow ----------------
  function playLevel(n) { n = Math.max(1, Math.min(TOTAL, n)); G.n = n; startLevel(LEVELS[n - 1], 'level'); }
  function playEndless(stage) {
    G.stage = stage; var seed = (Date.now() ^ (stage * 2654435761)) >>> 0;
    var L = C.makeEndless(stage, seed); startLevel(L, 'endless');
  }
  function restart() { if (!G.level) return; A.click(); if (G.mode === 'level') playLevel(G.level.n); else { startLevel(G.level, 'endless'); } }

  // ---------------- render loop ----------------
  var last = performance.now();
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (cur === 'game' && G.level) { step(dt); render(); }
    renderFx(dt);
    requestAnimationFrame(frame);
  }
  function step(dt) {
    G.arrows.forEach(function (a) {
      if (a.appear < 1) a.appear = Math.min(1, a.appear + dt * 3.2);
      if (a.state === 'exit') {
        a.v = Math.min(34, a.v + dt * 70); a.s += a.v * dt; a.t += dt;
        if (Math.random() < 0.7) { var pts = samplePts(a), h = pts[pts.length - 1]; G.parts.push({ x: h[0] - 0.5 * 0, y: h[1], vx: (Math.random() - 0.5) * 0.8 - DX[a.dir] * 1.2, vy: (Math.random() - 0.5) * 0.8 - DY[a.dir] * 1.2, life: 0.35, t: 0, col: a.col, r: 0.05 + Math.random() * 0.05 }); }
        if (a.s > a.len + a.rayLen + 3) a.state = 'gone';
      } else if (a.state === 'bump') {
        a.t += dt; var T1 = 0.11, T2 = 0.32;
        if (a.t < T1) a.s = a.bumpMax * easeOut(a.t / T1);
        else if (a.t < T2) { var k = (a.t - T1) / (T2 - T1); a.s = a.bumpMax * (1 - easeOutBack(k)); }
        else { a.s = 0; a.state = 'idle'; }
      }
      if (a.flash > 0) a.flash = Math.max(0, a.flash - dt * 2.2);
    });
    G.sparks = G.sparks.filter(function (s) { s.t += dt; return s.t < 0.6; });
    G.parts = G.parts.filter(function (p) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy *= 0.94; return p.t < p.life; });
    if (G.hint) { G.hint.t += dt; if (G.hint.t > 3.5) G.hint = null; }
    if (G.tut) placeTut();
  }
  function easeOut(k) { return 1 - (1 - k) * (1 - k); }
  function easeOutBack(k) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); }
  function placeTut() {
    var f = freeIds(); if (!f.length) return; var a = G.arrows[f[0]];
    var mid = a.cells[Math.floor((a.cells.length - 1) / 2)], p = toScreen(mid[0], mid[1]);
    var el = $('tut'); el.style.left = p[0] + 'px'; el.style.top = p[1] + 'px';
  }
  function render() {
    var x = ctx, L = G.level, c = cell(), o = origin(), th = themeColors();
    x.setTransform(DPR, 0, 0, DPR, 0, 0); x.clearRect(0, 0, CW, CH);
    // board tiles
    var g = c * 0.07;
    for (var yy = 0; yy < L.h; yy++) for (var xx = 0; xx < L.w; xx++) {
      if (L.mask[yy].charAt(xx) !== '#') continue;
      var X = o[0] + xx * c, Y = o[1] + yy * c;
      x.fillStyle = th.tileEdge; rr(x, X + g, Y + g + c * 0.035, c - 2 * g, c - 2 * g, c * 0.2); x.fill();
      x.fillStyle = th.tile; rr(x, X + g, Y + g, c - 2 * g, c - 2 * g, c * 0.2); x.fill();
      x.fillStyle = th.dot; x.beginPath(); x.arc(X + c / 2, Y + c / 2, c * 0.06, 0, 7); x.fill();
    }
    // hint ray
    if (G.hint) {
      var ha = G.arrows[G.hint.id];
      if (ha && ha.state === 'idle') {
        var hh = ha.cells[ha.cells.length - 1], pulse = 0.5 + 0.5 * Math.sin(G.hint.t * 7);
        x.save(); x.strokeStyle = ha.col; x.globalAlpha = 0.55 + 0.3 * pulse; x.lineWidth = c * 0.09; x.setLineDash([c * 0.14, c * 0.18]); x.lineCap = 'round';
        var s1 = toScreen(hh[0] + DX[ha.dir] * 0.6, hh[1] + DY[ha.dir] * 0.6), s2 = toScreen(hh[0] + DX[ha.dir] * (ha.rayLen + 0.6), hh[1] + DY[ha.dir] * (ha.rayLen + 0.6));
        x.beginPath(); x.moveTo(s1[0], s1[1]); x.lineTo(s2[0], s2[1]); x.stroke(); x.restore();
      }
    }
    // arrows (idle first, moving on top)
    var order = G.arrows.filter(function (a) { return a.state !== 'gone'; }).sort(function (a, b) { return (a.state === 'exit') - (b.state === 'exit'); });
    order.forEach(function (a) {
      var pts = samplePts(a).map(function (p) { return toScreen(p[0], p[1]); });
      var alpha = a.appear;
      if (a.state === 'exit') { var beyond = a.s - (a.len + a.rayLen - 1); alpha = Math.max(0, 1 - Math.max(0, beyond) / 3.2); }
      var glow = (G.hint && G.hint.id === a.id) ? 0.6 + 0.4 * Math.sin(G.hint.t * 7) : 0;
      if (a.appear < 1) { x.save(); var cx0 = CW / 2, cy0 = CH / 2, sc = 0.85 + 0.15 * easeOut(a.appear); x.translate(cx0, cy0); x.scale(sc, sc); x.translate(-cx0, -cy0); }
      drawRibbon(x, pts, a.col, c, alpha, a.dir, glow, a.flash, th);
      if (a.appear < 1) x.restore();
    });
    // sparks on blocking spot
    G.sparks.forEach(function (s) {
      var p = toScreen(s.x, s.y), k = s.t / 0.6;
      x.save(); x.globalAlpha = 1 - k; x.strokeStyle = '#FF3B2F'; x.lineWidth = c * 0.08;
      x.beginPath(); x.arc(p[0], p[1], c * (0.25 + 0.35 * k), 0, 7); x.stroke();
      x.fillStyle = '#FFD23F'; for (var i = 0; i < 6; i++) { var an = i * 1.047 + k; var r1 = c * (0.2 + 0.4 * k); x.beginPath(); x.arc(p[0] + Math.cos(an) * r1, p[1] + Math.sin(an) * r1, c * 0.05 * (1 - k), 0, 7); x.fill(); }
      x.restore();
    });
    G.parts.forEach(function (p) { var s = toScreen(p.x, p.y), k = p.t / p.life; x.globalAlpha = 1 - k; x.fillStyle = p.col; x.beginPath(); x.arc(s[0], s[1], c * p.r * (1 - k * 0.5), 0, 7); x.fill(); });
    x.globalAlpha = 1;
  }
  var fxc = $('fx').getContext('2d');
  function renderFx(dt) {
    if (!conf.length) { return; }
    var W = window.innerWidth, H = window.innerHeight; fxc.setTransform(DPR, 0, 0, DPR, 0, 0); fxc.clearRect(0, 0, W, H);
    conf = conf.filter(function (p) { p.t += dt; p.vy += 22 * dt; p.x += p.vx * dt * 30; p.y += p.vy * dt * 30; p.vx *= 0.985; p.r += p.vr; return p.y < H + 20 && p.t < 4; });
    conf.forEach(function (p) { fxc.save(); fxc.translate(p.x, p.y); fxc.rotate(p.r); fxc.fillStyle = p.col; fxc.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); fxc.restore(); });
    if (!conf.length) fxc.clearRect(0, 0, W, H);
  }

  // ---------------- level select ----------------
  function maskIcon(L) {
    if (L.shape === 'full') return '';
    var r = '';
    for (var y = 0; y < L.h; y++) for (var x = 0; x < L.w; x++) if (L.mask[y].charAt(x) === '#') r += '<rect x="' + x + '" y="' + y + '" width="1.02" height="1.02"/>';
    return '<svg class="shape" viewBox="0 0 ' + L.w + ' ' + L.h + '">' + r + '</svg>';
  }
  function buildLevelGrid() {
    var g = $('lvGrid'); g.innerHTML = ''; var total = 0;
    for (var n = 1; n <= TOTAL; n++) {
      var b = document.createElement('button'), st = save.stars[n] || 0; total += st;
      b.className = 'lv' + (n > save.unlocked ? ' locked' : '') + (n === save.unlocked ? ' current' : '');
      var stars = ''; for (var i = 0; i < 3; i++) stars += i < st ? '★' : '<i>★</i>';
      var ic = maskIcon(LEVELS[n - 1]);
      b.innerHTML = ic + (n > save.unlocked ? '<svg viewBox="0 0 24 24" style="width:20px;height:20px;opacity:.7"><path d="M7 10V8a5 5 0 0 1 10 0v2h1v10H6V10h1Zm2 0h6V8a3 3 0 0 0-6 0v2Z"/></svg>' : '<span>' + n + '</span><span class="st">' + stars + '</span>');
      (function (n) { b.addEventListener('click', function () { if (n <= save.unlocked) { A.click(); playLevel(n); } }); })(n);
      g.appendChild(b);
    }
    $('totalStars').textContent = total;
  }

  // ---------------- wiring ----------------
  function on(id, fn) { $(id).addEventListener('click', fn); }
  on('btnPlay', function () { A.click(); playLevel(Math.min(save.unlocked, TOTAL)); });
  on('btnLevels', function () { A.click(); show('levels'); });
  on('btnEndless', function () { A.click(); playEndless(1); });
  on('lvBack', function () { A.click(); show('menu'); });
  on('gBack', function () { A.click(); hideOverlays(); show('menu'); });
  on('tHint', useHint);
  on('tRestart', restart);
  on('tSound', function () { save.sound = !save.sound; persist(); refreshToggles(); A.click(); });
  on('tSettings', function () { A.click(); $('setOv').classList.add('show'); });
  on('menuSettings', function () { A.click(); $('setOv').classList.add('show'); });
  on('sClose', function () { A.click(); $('setOv').classList.remove('show'); });
  on('sSound', function () { save.sound = !save.sound; persist(); refreshToggles(); A.click(); });
  on('sVib', function () { save.vib = !save.vib; persist(); refreshToggles(); vib(20); });
  on('sDark', function () { save.dark = !save.dark; persist(); refreshToggles(); applyTheme(); });
  document.querySelectorAll('#sLang button').forEach(function (b) { b.addEventListener('click', function () { save.lang = b.getAttribute('data-v'); persist(); applyLang(); A.click(); }); });
  $('setOv').addEventListener('click', function (e) { if (e.target === this) this.classList.remove('show'); });
  on('wNext', function () {
    A.click(); hideOverlays();
    if (G.mode === 'level') { if (G.level.n >= TOTAL) playEndless(1); else playLevel(G.level.n + 1); }
    else playEndless(G.stage + 1);
  });
  on('wReplay', function () { hideOverlays(); restart(); });
  on('wMenu', function () { A.click(); hideOverlays(); show('menu'); });
  on('lRetry', function () { hideOverlays(); if (G.mode === 'endless') { startLevel(G.level, 'endless'); } else restart(); });
  on('lMenu', function () { A.click(); hideOverlays(); show('menu'); });
  on('zIn', function () { if (G.level) setZoom(view.z * 1.3); });
  on('zOut', function () { if (G.level) setZoom(view.z / 1.3); });
  on('zFit', function () { view.z = 1; view.ox = 0; view.oy = 0; });
  window.addEventListener('resize', resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe($('boardWrap'));
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && cur === 'game') show('menu'); });
  // Android back button (Capacitor later) / browser back: keep inside app
  window.addEventListener('popstate', function () { if (cur === 'game' || cur === 'levels') { hideOverlays(); show('menu'); history.pushState({ zr: 1 }, ''); } });
  try { history.pushState({ zr: 1 }, ''); } catch (e) {}

  // ---------------- boot ----------------
  applyTheme(); applyLang(); refreshToggles();
  var fill = $('loadfill'), p0 = performance.now(), fontsReady = false;
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { fontsReady = true; drawLogo(); });
  (function boot() {
    var k = Math.min(1, (performance.now() - p0) / 1300); fill.style.width = (k * 100) + '%';
    if (k < 1 || (!fontsReady && performance.now() - p0 < 3000)) return requestAnimationFrame(boot);
    show('menu');
  })();
  requestAnimationFrame(frame);

  // ---------------- test / debug hooks ----------------
  window.ZR = {
    G: G, save: save, levels: LEVELS, screen: function () { return cur; },
    play: playLevel, endless: playEndless, freeIds: freeIds,
    blockedIds: function () { return G.arrows.filter(function (a) { return a.state === 'idle' && blockerInfo(a); }).map(function (a) { return a.id; }); },
    arrowPoint: function (id) { // client coords of a body point of arrow id
      var a = G.arrows[id], m = a.cells[Math.floor((a.cells.length - 1) / 2)], p = toScreen(m[0], m[1]), r = cv.getBoundingClientRect(); return [r.left + p[0], r.top + p[1]];
    },
    view: view
  };
})();
