/* Zoomrow v2 core — seeded dense generator + mechanics + state-space solver (shared by browser & Node)
   Mechanics: walls, key/lock, ice, bomb countdown, direction switch. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ZRCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0]; // 0 up,1 right,2 down,3 left

  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0; var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(a, r) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function hashStr(s) { var h = 2166136261 >>> 0; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }

  // ---------------- silhouettes ----------------
  function inPoly(px, py, pts) { var c = false; for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) { var xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1]; if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) c = !c; } return c; }
  var STAR = (function () { var p = []; for (var i = 0; i < 10; i++) { var an = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 0.56 : 1.08; p.push([Math.cos(an) * rr, Math.sin(an) * rr + 0.1]); } return p; })();
  var SHAPES = {
    full: function () { return true; },
    diamond: function (x, y, w, h) { var cx = (w - 1) / 2, cy = (h - 1) / 2; return Math.abs(x - cx) / (w / 2) + Math.abs(y - cy) / (h / 2) <= 1.12; },
    circle: function (x, y, w, h) { var cx = (w - 1) / 2, cy = (h - 1) / 2; var dx = (x - cx) / (w / 2), dy = (y - cy) / (h / 2); return dx * dx + dy * dy <= 1.12; },
    house: function (x, y, w, h) { var cx = (w - 1) / 2, rows = Math.ceil(h * 0.42); if (y < rows) return Math.abs(x - cx) <= (y + 1.1) * (w / 2) / rows; return x >= 1 && x <= w - 2; },
    cross: function (x, y, w, h) { var c = Math.floor(Math.min(w, h) / 3.4); var xx = Math.min(x, w - 1 - x), yy = Math.min(y, h - 1 - y); return !(xx < c && yy < c); },
    frame: function (x, y, w, h) { var hw = Math.max(1, Math.round(w / 3.8)), hh = Math.max(1, Math.round(h / 3.8)); var x0 = Math.floor((w - hw) / 2), y0 = Math.floor((h - hh) / 2); return !(x >= x0 && x < x0 + hw && y >= y0 && y < y0 + hh); },
    heart: function (x, y, w, h) {
      var u = ((x + 0.5) / w - 0.5) * 2, v = ((y + 0.5) / h - 0.5) * 2;
      if (v < -0.35) { var a = (u - 0.47) * (u - 0.47) + (v + 0.4) * (v + 0.4), b = (u + 0.47) * (u + 0.47) + (v + 0.4) * (v + 0.4); return a <= 0.36 || b <= 0.36; }
      return Math.abs(u) <= 1.08 - (v + 0.35) * 0.74;
    },
    hourglass: function (x, y, w, h) { var cy = (h - 1) / 2, cx = (w - 1) / 2; var k = Math.abs(y - cy) / (h / 2); return Math.abs(x - cx) <= (w / 2) * (0.36 + 0.7 * k); },
    star: function (x, y, w, h) { var u = ((x + 0.5) / w - 0.5) * 2.1, v = ((y + 0.5) / h - 0.5) * 2.1; return inPoly(u, v, STAR); },
    crown: function (x, y, w, h) {
      var u = (x + 0.5) / w, v = (y + 0.5) / h;
      if (v > 0.45) return u > 0.04 && u < 0.96;
      var sp = [0.12, 0.5, 0.88]; for (var i = 0; i < 3; i++) if (Math.abs(u - sp[i]) <= (v - 0.02) * 0.62) return true; return false;
    }
  };
  function makeMask(w, h, shape) {
    var f = SHAPES[shape] || SHAPES.full, m = [];
    for (var y = 0; y < h; y++) { var row = ''; for (var x = 0; x < w; x++) row += f(x, y, w, h) ? '#' : '.'; m.push(row); }
    return m;
  }

  // ---------------- level specs ----------------
  var SHAPE_CYCLE = ['full', 'diamond', 'heart', 'full', 'cross', 'circle', 'frame', 'full', 'house', 'hourglass', 'star', 'crown'];
  function kindOf(n) { return n % 10 === 0 ? 'boss' : n % 5 === 0 ? 'hard' : 'normal'; }
  var INTRO = { wall: 5, key: 8, ice: 14, bomb: 22, sw: 30 };
  function spec(n) {
    var kind = kindOf(n);
    if (n === 1) return { n: 1, kind: 'normal', w: 4, h: 4, shape: 'full', turn: 0, minL: 2, maxL: 3, maxArrows: 4, fill: false, minDepth: 2, minDens: 0.6, mech: {} };
    if (n === 2) return { n: 2, kind: 'normal', w: 5, h: 5, shape: 'full', turn: 0.6, minL: 3, maxL: 4, maxArrows: 6, fill: false, minDepth: 3, minDens: 0.8, minBent: 3, mech: {} };
    var base = Math.min(11, 6 + Math.floor((n - 3) / 12));
    var s = kind === 'boss' ? Math.min(11, base + 1 + (n >= 40 ? 1 : 0)) : kind === 'hard' ? Math.min(11, base + 1) : base;
    var shape = (kind === 'boss' && n % 20 === 0) ? 'full' : SHAPE_CYCLE[(n * 7 + Math.floor(n / 12)) % SHAPE_CYCLE.length];
    if (kind === 'boss' && ['full', 'circle', 'heart', 'crown'].indexOf(shape) < 0) shape = ['full', 'circle', 'heart', 'crown'][n / 10 % 4];
    if ((shape === 'star' || shape === 'diamond') && s < 9) shape = 'circle';
    if (n <= 4) shape = 'full';
    if (n === 100) shape = 'crown';
    var hardBoost = kind === 'boss' ? 2 : kind === 'hard' ? 1 : 0;
    var m = {};
    if (n >= INTRO.wall) m.preWalls = n === INTRO.wall ? 3 : 1 + (n % 3) + hardBoost;
    if (n >= INTRO.wall) m.holeWalls = true;
    if (n === INTRO.key) m.keys = 1;
    else if (n > INTRO.key && (n % 3 === 2 || kind !== 'normal')) m.keys = 1 + (kind === 'boss' && n >= 40 ? 1 : 0);
    if (n === INTRO.ice) { m.ice = 1; delete m.keys; }
    else if (n > INTRO.ice && (n % 3 === 0 || kind !== 'normal')) m.ice = 1 + (n >= 50 && n % 2 === 0 ? 1 : 0);
    if (n === INTRO.bomb) { m.bombs = 1; delete m.keys; delete m.ice; }
    else if (n > INTRO.bomb && (n % 4 === 1 || kind !== 'normal')) m.bombs = 1 + (kind === 'boss' && n >= 60 ? 1 : 0);
    if (n === INTRO.sw) { m.sw = 1; m.swLinks = 1; delete m.keys; delete m.ice; delete m.bombs; }
    else if (n > INTRO.sw && (n % 4 === 3 || kind === 'boss')) { m.sw = 1; m.swLinks = 1 + (n % 2); }
    return { n: n, kind: kind, w: s, h: s, shape: shape, turn: 0.5 + Math.min(0.2, n / 500), minL: 3, maxL: Math.min(8, 5 + Math.floor(n / 40) + (hardBoost ? 1 : 0)), maxArrows: 999, fill: true,
      minDepth: Math.min(10, 4 + Math.floor(n / 14) + hardBoost), minDens: 0.84, minBent: 2, mech: m };
  }
  function endlessSpec(stage, r) {
    var s = Math.min(11, 7 + Math.floor(stage / 3));
    var shape = SHAPE_CYCLE[Math.floor(r() * SHAPE_CYCLE.length)];
    var m = { preWalls: stage >= 2 ? 1 + Math.floor(r() * 3) : 0, holeWalls: stage >= 2 };
    if (stage >= 3 && r() < 0.6) m.keys = 1;
    if (stage >= 5 && r() < 0.55) m.ice = 1;
    if (stage >= 7 && r() < 0.5) m.bombs = 1;
    if (stage >= 9 && r() < 0.45) { m.sw = 1; m.swLinks = 1 + (r() < 0.5 ? 1 : 0); }
    return { n: 0, kind: 'endless', w: s, h: s, shape: shape, turn: 0.55, minL: 3, maxL: 6, maxArrows: 999, fill: true, minDepth: Math.min(12, 4 + stage), minDens: 0.84, minBent: 2, mech: m };
  }
  function dailySpec(date, r) {
    var s = 9 + Math.floor(r() * 2);
    var shape = SHAPE_CYCLE[Math.floor(r() * SHAPE_CYCLE.length)];
    var pool = shuffle(['keys', 'ice', 'bombs', 'sw'], r), m = { preWalls: 2 + Math.floor(r() * 2), holeWalls: true };
    var k = 2 + (r() < 0.4 ? 1 : 0);
    for (var i = 0; i < k; i++) m[pool[i]] = 1;
    if (m.sw) m.swLinks = 1 + (r() < 0.5 ? 1 : 0);
    return { n: 0, kind: 'daily', date: date, w: s, h: s, shape: shape, turn: 0.55, minL: 3, maxL: 6, maxArrows: 999, fill: true, minDepth: 7, minDens: 0.84, minBent: 2, mech: m };
  }

  // ---------------- runtime model ----------------
  // Level L: {w,h,mask[],walls:[[x,y]],sw:[{x,y,l:[ids]}],arrows:[{c:[[x,y]..tail->head], k?:lockedId, lk?:1, ice?:n, bomb?:n, sw?:idx}]}
  function dirOf(cells) { var h = cells[cells.length - 1], p = cells[cells.length - 2]; var dx = h[0] - p[0], dy = h[1] - p[1]; return dy < 0 ? 0 : dx > 0 ? 1 : dy > 0 ? 2 : 3; }
  function prep(L) {
    if (L._p) return L._p;
    var w = L.w, h = L.h, n = L.arrows.length, P = { w: w, h: h, n: n, wall: new Uint8Array(w * h), mask: new Uint8Array(w * h), cells: [], rcells: [], dir: [], rdir: [], ray: [], rray: [], adj: [], keyOf: [], bombs: [], sws: L.sw || [] };
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) P.mask[y * w + x] = L.mask[y].charAt(x) === '#' ? 1 : 0;
    (L.walls || []).forEach(function (c) { P.wall[c[1] * w + c[0]] = 1; });
    function rayOf(cells, d) { var hd = cells[cells.length - 1], out = [], x = hd[0] + DX[d], y = hd[1] + DY[d]; while (x >= 0 && y >= 0 && x < w && y < h) { out.push(y * w + x); x += DX[d]; y += DY[d]; } return out; }
    var owner = {};
    L.arrows.forEach(function (a, i) {
      var c = a.c, rc = c.slice().reverse();
      P.cells.push(c.map(function (q) { return q[1] * w + q[0]; })); P.rcells.push(rc.map(function (q) { return q[1] * w + q[0]; }));
      P.dir.push(dirOf(c)); P.rdir.push(dirOf(rc));
      P.ray.push(rayOf(c, dirOf(c))); P.rray.push(rayOf(rc, dirOf(rc)));
      c.forEach(function (q) { owner[q[1] * w + q[0]] = i; });
      P.keyOf.push(-1);
      if (a.bomb) P.bombs.push(i);
    });
    L.arrows.forEach(function (a, i) { if (a.k !== undefined && a.k !== null && a.k >= 0) P.keyOf[a.k] = i; });
    L.arrows.forEach(function (a, i) {
      var s = {};
      a.c.forEach(function (q) { for (var d = 0; d < 4; d++) { var x = q[0] + DX[d], y = q[1] + DY[d]; if (x < 0 || y < 0 || x >= w || y >= h) continue; var o = owner[y * w + x]; if (o !== undefined && o !== i) s[o] = 1; } });
      P.adj.push(Object.keys(s).map(Number));
    });
    Object.defineProperty(L, '_p', { value: P, enumerable: false, writable: true });
    return P;
  }
  function initState(L) {
    var P = prep(L), n = P.n, S = { alive: new Uint8Array(n).fill(1), flip: new Uint8Array(P.sws.length), ice: new Int16Array(n), bomb: new Int16Array(n), locked: new Uint8Array(n), moves: 0 };
    L.arrows.forEach(function (a, i) { S.ice[i] = a.ice || 0; S.bomb[i] = a.bomb || 0; S.locked[i] = a.lk ? 1 : 0; });
    P.sws.forEach(function (s, k) { S.flip[k] = s.f0 === undefined ? 1 : s.f0; });
    return S;
  }
  function cloneState(S) { return { alive: S.alive.slice(), flip: S.flip.slice(), ice: S.ice.slice(), bomb: S.bomb.slice(), locked: S.locked.slice(), moves: S.moves }; }
  function isFlipped(L, S, i) { var a = L.arrows[i]; return a.sw !== undefined && a.sw !== null && a.sw >= 0 && (S.flip[a.sw] & 1) === 1; }
  function cellIdx(L, S, i) { var P = prep(L); return isFlipped(L, S, i) ? P.rcells[i] : P.cells[i]; }
  function curCells(L, S, i) { var a = L.arrows[i]; return isFlipped(L, S, i) ? a.c.slice().reverse() : a.c; }
  function curDir(L, S, i) { var P = prep(L); return isFlipped(L, S, i) ? P.rdir[i] : P.dir[i]; }
  function curRay(L, S, i) { var P = prep(L); return isFlipped(L, S, i) ? P.rray[i] : P.ray[i]; }
  function occGrid(L, S) { var P = prep(L), o = new Int16Array(P.w * P.h).fill(-1); for (var i = 0; i < P.n; i++) if (S.alive[i]) { var cs = P.cells[i]; for (var j = 0; j < cs.length; j++) o[cs[j]] = i; } return o; }
  // returns null if arrow i may escape now; else {why:'locked'|'ice'|'wall'|'arrow'|'self', idx, id}
  function blockOf(L, S, i, occ) {
    if (!S.alive[i]) return { why: 'gone' };
    if (S.locked[i]) return { why: 'locked' };
    if (S.ice[i] > 0) return { why: 'ice' };
    var P = prep(L), ray = curRay(L, S, i);
    for (var k = 0; k < ray.length; k++) {
      var c = ray[k];
      if (P.wall[c]) return { why: 'wall', idx: c, dist: k + 1 };
      var o = occ[c]; if (o >= 0) return { why: o === i ? 'self' : 'arrow', idx: c, id: o, dist: k + 1 };
    }
    return null;
  }
  // apply escape (or hammer removal when opts.hammer) -> {S, unlocked:[], iceHit:[], iceBroke:[], exploded:[], disarmed:bool}
  function applyRemove(L, S0, i, hammer) {
    var P = prep(L), S = cloneState(S0), ev = { S: S, unlocked: [], iceHit: [], iceBroke: [], exploded: [], ticked: [] };
    S.alive[i] = 0;
    var a = L.arrows[i];
    if (a.k !== undefined && a.k >= 0 && S.alive[a.k] && S.locked[a.k]) { S.locked[a.k] = 0; ev.unlocked.push(a.k); }
    P.adj[i].forEach(function (j) { if (S.alive[j] && S.ice[j] > 0) { S.ice[j]--; ev.iceHit.push(j); if (S.ice[j] === 0) ev.iceBroke.push(j); } });
    if (!hammer) {
      S.moves++;
      P.bombs.forEach(function (b) { if (b !== i && S.alive[b] && S.bomb[b] > 0) { S.bomb[b]--; ev.ticked.push(b); if (S.bomb[b] <= 0) ev.exploded.push(b); } });
    }
    return ev;
  }
  function applySwitch(L, S0, k) { var S = cloneState(S0); S.flip[k] ^= 1; return S; }
  function allGone(S) { for (var i = 0; i < S.alive.length; i++) if (S.alive[i]) return false; return true; }
  function keyOf(S) { var s = ''; for (var i = 0; i < S.alive.length; i++) s += S.alive[i] ? '1' : '0'; s += '|'; for (var k = 0; k < S.flip.length; k++) s += S.flip[k]; return s; }

  // ---------------- state-space solver ----------------
  // DFS over (alive set, switch flips) with memo. Without live bombs every free escape is monotone-safe -> greedy.
  // With live bombs: branch over free arrows, ordered by urgency, pruning any move that detonates a bomb.
  function bombNeeds(L, S, occ) {
    var P = prep(L), need = {}, q = [];
    P.bombs.forEach(function (b) { if (S.alive[b]) { q.push(b); need[b] = 1; } });
    while (q.length) {
      var x = q.shift(), ray = curRay(L, S, x);
      for (var k = 0; k < ray.length; k++) { var o = occ[ray[k]]; if (o >= 0 && !need[o]) { need[o] = 1; q.push(o); } }
      if (S.locked[x]) { var kk = P.keyOf[x]; if (kk >= 0 && S.alive[kk] && !need[kk]) { need[kk] = 1; q.push(kk); } }
      if (S.ice[x] > 0) P.adj[x].forEach(function (j) { if (S.alive[j] && !need[j]) { need[j] = 1; q.push(j); } });
    }
    return need;
  }
  function solve(L, S0, opts) {
    opts = opts || {}; var limit = opts.limit || 120000;
    var P = prep(L), seen = new Set(), nodes = 0, path = [], aborted = false;
    function rec(S) {
      if (allGone(S)) return true;
      if (++nodes > limit) { aborted = true; return false; }
      var key = keyOf(S); if (seen.has(key)) return false; seen.add(key);
      var occ = occGrid(L, S), free = [];
      for (var i = 0; i < P.n; i++) if (S.alive[i] && !blockOf(L, S, i, occ)) free.push(i);
      var live = false; for (var b = 0; b < P.bombs.length; b++) if (S.alive[P.bombs[b]]) { live = true; break; }
      if (!live) {
        if (free.length) {
          // prefer keys & ice-breakers (cosmetic: nicer hint order), still monotone-safe
          var pick = free[0];
          for (var f = 0; f < free.length; f++) { var ai = L.arrows[free[f]]; if ((ai.k !== undefined && ai.k >= 0) || P.adj[free[f]].some(function (j) { return S.ice[j] > 0; })) { pick = free[f]; break; } }
          var ev = applyRemove(L, S, pick, false);
          path.push({ t: 'a', i: pick }); if (rec(ev.S)) return true; path.pop(); return false;
        }
      } else {
        var need = bombNeeds(L, S, occ);
        free.sort(function (x, y) {
          var bx = S.bomb[x] > 0 ? 1000 - S.bomb[x] : 0, by = S.bomb[y] > 0 ? 1000 - S.bomb[y] : 0;
          if (bx !== by) return by - bx;
          var nx = need[x] ? 1 : 0, ny = need[y] ? 1 : 0; if (nx !== ny) return ny - nx;
          return x - y;
        });
        for (var m = 0; m < free.length; m++) {
          var e2 = applyRemove(L, S, free[m], false); if (e2.exploded.length) continue;
          path.push({ t: 'a', i: free[m] }); if (rec(e2.S)) return true; path.pop();
          if (aborted) return false;
        }
      }
      for (var s = 0; s < P.sws.length; s++) {
        path.push({ t: 's', i: s }); if (rec(applySwitch(L, S, s))) return true; path.pop();
        if (aborted) return false;
      }
      return false;
    }
    var ok = rec(S0);
    return { ok: ok, path: ok ? path.slice() : null, nodes: nodes, aborted: aborted };
  }

  // Independent strict replay of a move list (used by validator)
  function replay(L, moves) {
    var S = initState(L), P = prep(L), freeCounts = [], errs = [];
    for (var m = 0; m < moves.length; m++) {
      var mv = moves[m], occ = occGrid(L, S);
      var fc = 0; for (var i = 0; i < P.n; i++) if (S.alive[i] && !blockOf(L, S, i, occ)) fc++; freeCounts.push(fc);
      if (mv.t === 's') { S = applySwitch(L, S, mv.i); continue; }
      var b = blockOf(L, S, mv.i, occ); if (b) { errs.push('move ' + m + ' arrow ' + mv.i + ' blocked: ' + b.why); break; }
      var ev = applyRemove(L, S, mv.i, false); if (ev.exploded.length) { errs.push('bomb exploded at move ' + m); break; }
      S = ev.S;
    }
    if (!errs.length && !allGone(S)) errs.push('arrows remain after replay');
    return { ok: !errs.length, errors: errs, freeCounts: freeCounts };
  }

  // ---------------- generator ----------------
  function genBase(sp, r) {
    var w = sp.w, h = sp.h, mask = makeMask(w, h, sp.shape), M = function (x, y) { return x >= 0 && y >= 0 && x < w && y < h && mask[y].charAt(x) === '#'; };
    var occ = new Int16Array(w * h).fill(-1), wall = new Uint8Array(w * h), arrows = [], rays = [];
    var maskCells = []; for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) if (M(x, y)) maskCells.push([x, y]);
    // pre-placed stones (interior-ish cells)
    var pw = (sp.mech && sp.mech.preWalls) || 0, cand = shuffle(maskCells.slice(), r);
    for (var c = 0; c < cand.length && pw > 0; c++) { var q = cand[c]; if (q[0] <= 0 || q[1] <= 0 || q[0] >= w - 1 || q[1] >= h - 1) continue; var bad = false; for (var d = 0; d < 4; d++) if (wall[(q[1] + DY[d]) * w + q[0] + DX[d]]) bad = true; if (bad) continue; wall[q[1] * w + q[0]] = 1; pw--; }
    function free(x, y) { return M(x, y) && occ[y * w + x] < 0 && !wall[y * w + x]; }
    function tryBuild(hx, hy, d, minL, maxL) {
      var px = hx - DX[d], py = hy - DY[d];
      if (!free(px, py)) return null;
      var ray = {}, x = hx + DX[d], y = hy + DY[d];
      while (x >= 0 && y >= 0 && x < w && y < h) { var ii = y * w + x; if (occ[ii] >= 0 || wall[ii]) return null; ray[ii] = 1; x += DX[d]; y += DY[d]; }
      var target = minL + Math.floor(r() * (maxL - minL + 1));
      var path = [[hx, hy], [px, py]], used = {}; used[hy * w + hx] = 1; used[py * w + px] = 1;
      var md = d;
      while (path.length < target) {
        var cc = path[path.length - 1], straight = md, left = (md + 3) % 4, right = (md + 1) % 4;
        var order = sp.turn === 0 ? [straight] : r() < sp.turn ? (r() < 0.5 ? [left, right, straight] : [right, left, straight]) : (r() < 0.5 ? [straight, left, right] : [straight, right, left]);
        var got = null;
        for (var k = 0; k < order.length; k++) { var nd = order[k], nx = cc[0] - DX[nd], ny = cc[1] - DY[nd]; if (!free(nx, ny) || used[ny * w + nx] || ray[ny * w + nx]) continue; got = [nx, ny, nd]; break; }
        if (!got) break;
        path.push([got[0], got[1]]); used[got[1] * w + got[0]] = 1; md = got[2];
      }
      if (path.length < minL) return null;
      path.reverse();
      var blocks = 0;
      for (var i = 0; i < rays.length; i++) { for (var j = 0; j < path.length; j++) if (rays[i][path[j][1] * w + path[j][0]]) { blocks++; break; } }
      return { c: path, ray: ray, blocks: blocks };
    }
    function place(b) { var id = arrows.length; arrows.push({ c: b.c, p: id }); rays.push(b.ray); b.c.forEach(function (q) { occ[q[1] * w + q[0]] = id; }); }
    var fails = 0;
    while (arrows.length < sp.maxArrows && fails < 3) {
      var em = maskCells.filter(function (q) { return free(q[0], q[1]); }); if (!em.length) break;
      shuffle(em, r);
      var best = null, bs = -1, samples = 0;
      for (var e = 0; e < em.length && samples < 16; e++) {
        var ds = shuffle([0, 1, 2, 3], r);
        for (var di = 0; di < 4; di++) {
          var cd = tryBuild(em[e][0], em[e][1], ds[di], sp.minL, sp.maxL); if (!cd) continue; samples++;
          var bent = isBentCells(cd.c);
          var sc = Math.min(cd.c.length, 4) * 0.5 + cd.blocks * 2.4 + (bent ? 1 : 0) + r() * 1.4;
          if (sc > bs) { bs = sc; best = cd; } break;
        }
      }
      if (!best) { fails++; continue; }
      place(best);
    }
    if (sp.fill) {
      fails = 0;
      while (fails < 2) {
        var em2 = shuffle(maskCells.filter(function (q) { return free(q[0], q[1]); }), r), got = null;
        for (var e2 = 0; e2 < em2.length && !got; e2++) { var d2 = shuffle([0, 1, 2, 3], r); for (var k2 = 0; k2 < 4 && !got; k2++) got = tryBuild(em2[e2][0], em2[e2][1], d2[k2], 2, 4); }
        if (!got) { fails++; continue; }
        place(got);
      }
      // tail extension into holes: allowed when every arrow whose ray crosses the hole is removed AFTER the extended arrow
      var changed = true, guard = 0;
      while (changed && guard++ < 40) {
        changed = false;
        maskCells.forEach(function (q) {
          if (!free(q[0], q[1])) return;
          var idx = q[1] * w + q[0], ok = [];
          for (var d = 0; d < 4; d++) {
            var nx = q[0] + DX[d], ny = q[1] + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            var o = occ[ny * w + nx]; if (o < 0) continue; var A = arrows[o];
            if (A.c[0][0] !== nx || A.c[0][1] !== ny || A.c.length >= sp.maxL + 1) continue;
            if (rays[o][idx]) continue;
            var safe = true; for (var b = 0; b < arrows.length && safe; b++) if (b !== o && rays[b][idx] && arrows[b].p > A.p) safe = false;
            if (safe) ok.push(o);
          }
          if (!ok.length) return;
          var pick = ok[Math.floor(r() * ok.length)]; arrows[pick].c.unshift([q[0], q[1]]); occ[idx] = pick; changed = true;
        });
      }
    }
    var rayAll = new Uint8Array(w * h); rays.forEach(function (ry) { for (var k in ry) rayAll[k] = 1; });
    return { w: w, h: h, mask: mask, occ: occ, wall: wall, arrows: arrows, rays: rays, rayAll: rayAll, maskCells: maskCells };
  }
  function isBentCells(c) { for (var i = 2; i < c.length; i++) { if ((c[i - 1][0] - c[i - 2][0]) !== (c[i][0] - c[i - 1][0]) || (c[i - 1][1] - c[i - 2][1]) !== (c[i][1] - c[i - 1][1])) return true; } return false; }

  function toLevel(B, extra) {
    var walls = []; for (var i = 0; i < B.w * B.h; i++) if (B.wall[i]) walls.push([i % B.w, Math.floor(i / B.w)]);
    var L = { w: B.w, h: B.h, mask: B.mask, walls: walls, sw: extra.sw || [], arrows: B.arrows.map(function (a) { var o = { c: a.c }; ['k', 'lk', 'ice', 'bomb', 'sw'].forEach(function (f) { if (a[f] !== undefined) o[f] = a[f]; }); return o; }) };
    return L;
  }
  function baseFreeAtStart(B) {
    var w = B.w, res = [];
    B.arrows.forEach(function (a, i) {
      var d = dirOf(a.c), hd = a.c[a.c.length - 1], x = hd[0] + DX[d], y = hd[1] + DY[d], ok = true;
      while (x >= 0 && y >= 0 && x < B.w && y < B.h) { var ii = y * w + x; if (B.wall[ii] || B.occ[ii] >= 0) { ok = false; break; } x += DX[d]; y += DY[d]; }
      res.push(ok);
    });
    return res;
  }

  function addMechanics(B, sp, r) {
    var m = sp.mech || {}, n = B.arrows.length, w = B.w, A = B.arrows;
    var freeStart = baseFreeAtStart(B), special = {}, extra = { sw: [] };
    if (n < 4) return { ok: !(m.keys || m.ice || m.bombs || m.sw), extra: extra };
    // walls from leftover holes that are on no ray (and keep one hole for a switch if needed)
    var holes = B.maskCells.filter(function (q) { var i = q[1] * w + q[0]; return B.occ[i] < 0 && !B.wall[i]; });
    var swCell = null;
    if (m.sw) { var hs = shuffle(holes.slice(), r); swCell = hs[0] || null; if (!swCell) return { ok: false }; }
    if (m.holeWalls) holes.forEach(function (q) { var i = q[1] * w + q[0]; if (swCell && q[0] === swCell[0] && q[1] === swCell[1]) return; if (!B.rayAll[i]) B.wall[i] = 1; });
    // adjacency
    var adj = A.map(function () { return {}; });
    A.forEach(function (a, i) { a.c.forEach(function (q) { for (var d = 0; d < 4; d++) { var x = q[0] + DX[d], y = q[1] + DY[d]; if (x < 0 || y < 0 || x >= w || y >= B.h) continue; var o = B.occ[y * w + x]; if (o >= 0 && o !== i) adj[i][o] = 1; } }); });
    var idxs = shuffle(A.map(function (_, i) { return i; }), r);
    // keys
    for (var k = 0; k < (m.keys || 0); k++) {
      var lockC = idxs.filter(function (i) { return !special[i] && freeStart[i]; }).concat(idxs.filter(function (i) { return !special[i] && !freeStart[i]; }));
      var done = false;
      for (var li = 0; li < lockC.length && !done; li++) {
        var Lk = lockC[li];
        var keys = idxs.filter(function (i) { return !special[i] && i !== Lk && A[i].p > A[Lk].p; });
        keys.sort(function (x, y) { return (freeStart[x] ? 1 : 0) - (freeStart[y] ? 1 : 0); });
        if (!keys.length) continue;
        var K = keys[Math.floor(r() * Math.min(3, keys.length))];
        A[K].k = Lk; A[Lk].lk = 1; special[K] = special[Lk] = 1; done = true;
      }
      if (!done) return { ok: false };
    }
    // ice
    for (var ic = 0; ic < (m.ice || 0); ic++) {
      var cands = idxs.filter(function (i) { if (special[i]) return false; var c = 0; for (var j in adj[i]) if (A[j].p > A[i].p) c++; return c >= 2; });
      cands.sort(function (x, y) { return (freeStart[y] ? 1 : 0) - (freeStart[x] ? 1 : 0); });
      if (!cands.length) return { ok: false };
      var I = cands[0], cnt = 0; for (var jj in adj[I]) if (A[jj].p > A[I].p) cnt++;
      A[I].ice = Math.min(3, Math.max(2, Math.min(cnt, 2 + Math.floor(r() * 2)))); special[I] = 1;
    }
    // switch: reverse 1-2 arrows whose reversed orientation is blocked at start
    if (m.sw) {
      var links = [];
      // reversed orientation must be PERMANENTLY stuck until the switch is pressed:
      // its reversed ray hits a wall, itself, or an arrow X whose own exit ray is blocked by this arrow (mutual deadlock)
      var revC = idxs.filter(function (i) {
        if (special[i] || A[i].c.length < 2) return false;
        var rc = A[i].c.slice().reverse(), d = dirOf(rc), hd = rc[rc.length - 1], x = hd[0] + DX[d], y = hd[1] + DY[d];
        var mine = {}; A[i].c.forEach(function (q) { mine[q[1] * w + q[0]] = 1; });
        while (x >= 0 && y >= 0 && x < w && y < B.h) {
          var ii = y * w + x;
          if (B.wall[ii] || mine[ii]) return true;
          var o = B.occ[ii];
          if (o >= 0) { if (special[o]) return false; for (var cc in mine) if (B.rays[o][cc]) return true; return false; }
          x += DX[d]; y += DY[d];
        }
        return false;
      });
      revC.sort(function (x, y) { return (freeStart[y] ? 1 : 0) - (freeStart[x] ? 1 : 0); });
      for (var s = 0; s < revC.length && links.length < (m.swLinks || 1); s++) links.push(revC[s]);
      if (!links.length) return { ok: false };
      links.forEach(function (i) { A[i].sw = 0; special[i] = 1; });
      extra.sw = [{ x: swCell[0], y: swCell[1], l: links.slice(), f0: 1 }];
    }
    // bombs: pick arrows with a short prerequisite chain; counter found by search, then +1 margin
    var bombIds = [];
    for (var bb = 0; bb < (m.bombs || 0); bb++) {
      var bc = idxs.filter(function (i) { return !special[i] && !freeStart[i] && A[i].c.length >= 3; });
      if (!bc.length) bc = idxs.filter(function (i) { return !special[i]; });
      if (!bc.length) return { ok: false };
      // prefer bombs removed early in base order (higher p)
      bc.sort(function (x, y) { return A[y].p - A[x].p; });
      var Bi = bc[Math.floor(r() * Math.min(4, bc.length))]; special[Bi] = 1; bombIds.push(Bi); A[Bi].bomb = 99;
    }
    var L = toLevel(B, extra);
    if (bombIds.length) {
      bombIds.forEach(function (bi) {
        var lo = 1, hi = n + 2;
        while (lo < hi) { var mid = (lo + hi) >> 1; L.arrows[bi].bomb = mid; L._p = null; if (solve(L, initState(L), { limit: 40000 }).ok) hi = mid; else lo = mid + 1; }
        L.arrows[bi].bomb = lo;
      });
      // add +1 margin to every bomb, then require solvable even with every bomb at its tighter value
      bombIds.forEach(function (bi) { L.arrows[bi].bomb += 1; });
      var tight = JSON.parse(JSON.stringify(L)); bombIds.forEach(function (bi) { tight.arrows[bi].bomb -= 1; });
      if (!solve(tight, initState(tight), { limit: 60000 }).ok) return { ok: false };
      L._p = null;
    }
    return { ok: true, L: L };
  }

  function evaluate(L) {
    var P = prep(L), S = initState(L), sol = solve(L, S, { limit: 150000 });
    if (!sol.ok) return { ok: false };
    var rp = replay(L, sol.path); if (!rp.ok) return { ok: false };
    var masked = 0, used = 0; for (var i = 0; i < P.w * P.h; i++) if (P.mask[i]) { masked++; }
    L.arrows.forEach(function (a) { used += a.c.length; }); used += (L.walls || []).length + (L.sw || []).length;
    var fc = rp.freeCounts, avg = fc.reduce(function (s, v) { return s + v; }, 0) / Math.max(1, fc.length);
    // layered depth on base orientation ignoring mechanics (peel chain)
    var S2 = initState(L); S2.locked.fill(0); S2.ice.fill(0); S2.bomb.fill(0); S2.flip.fill(0);
    var depth = 0;
    while (!allGone(S2) && depth < 99) { var occ = occGrid(L, S2), fr = []; for (var j = 0; j < P.n; j++) if (S2.alive[j] && !blockOf(L, S2, j, occ)) fr.push(j); if (!fr.length) { depth = -1; break; } fr.forEach(function (j) { S2.alive[j] = 0; }); depth++; }
    var bent = L.arrows.filter(function (a) { return isBentCells(a.c); }).length;
    return { ok: true, density: used / masked, avgFree: avg, firstFree: fc[0], moves: sol.path.length, depth: depth, bent: bent, path: sol.path, nodes: sol.nodes };
  }

  function build(sp, seed, attempts) {
    var best = null, bestScore = -1e9;
    for (var t = 0; t < attempts; t++) {
      var r = rng(seed + t * 7919);
      var B = genBase(sp, r);
      if (sp.maxArrows < 999 && B.arrows.length < sp.maxArrows) continue;
      var mr = addMechanics(B, sp, r); if (!mr.ok) continue;
      var L = mr.L || toLevel(B, mr.extra || {});
      // shuffle arrow order (hide construction order) with id remap
      var perm = shuffle(L.arrows.map(function (_, i) { return i; }), r), inv = []; perm.forEach(function (old, nw) { inv[old] = nw; });
      L.arrows = perm.map(function (old) { var a = L.arrows[old], o = { c: a.c }; if (a.k !== undefined) o.k = inv[a.k]; ['lk', 'ice', 'bomb', 'sw'].forEach(function (f) { if (a[f] !== undefined) o[f] = a[f]; }); return o; });
      (L.sw || []).forEach(function (s) { s.l = s.l.map(function (i) { return inv[i]; }); });
      L._p = null;
      var ev = evaluate(L); if (!ev.ok) continue;
      var meets = ev.depth >= Math.min(sp.minDepth, 99) && ev.density >= sp.minDens && ev.bent >= (sp.minBent || 0) && ev.firstFree < L.arrows.length;
      var score = (meets ? 1000 : 0) + ev.density * 60 + Math.min(ev.depth, sp.minDepth + 4) * 2.5 - ev.avgFree * 3 + L.arrows.length * 1.2 - (L.walls.length / (L.w * L.h)) * 40;
      if (score > bestScore) { bestScore = score; best = L; best._ev = ev; best._meets = meets; }
      if (meets && t >= Math.min(attempts - 1, sp.quick ? 2 : 8)) break;
    }
    return best;
  }
  function finish(L, sp) { L.n = sp.n; L.kind = sp.kind; L.shape = sp.shape; if (sp.date) L.date = sp.date; return L; }
  function makeLevel(n) { var sp = spec(n); return finish(build(sp, 20261120 + n * 1013, n <= 2 ? 300 : 60), sp); }
  function makeEndless(stage, seed) { var r = rng(seed); var sp = endlessSpec(stage, r); sp.quick = true; var L = build(sp, seed ^ 0x9e3779b9, 14); L.stage = stage; return finish(L, sp); }
  function makeDaily(date) { var h = hashStr('zoomrow-daily-' + date), r = rng(h); var sp = dailySpec(date, r); sp.quick = true; return finish(build(sp, h, 14), sp); }

  function strip(L) {
    return { n: L.n, kind: L.kind, shape: L.shape, w: L.w, h: L.h, mask: L.mask, walls: L.walls, sw: L.sw, a: L.arrows,
      st: L._ev ? { d: +L._ev.density.toFixed(3), f: +L._ev.avgFree.toFixed(2), m: L._ev.moves, dp: L._ev.depth } : undefined };
  }
  function unpack(o) { return { n: o.n, kind: o.kind, shape: o.shape, w: o.w, h: o.h, mask: o.mask, walls: o.walls || [], sw: o.sw || [], arrows: o.a, st: o.st }; }

  return { DX: DX, DY: DY, rng: rng, hashStr: hashStr, spec: spec, kindOf: kindOf, INTRO: INTRO, makeMask: makeMask, makeLevel: makeLevel, makeEndless: makeEndless, makeDaily: makeDaily,
    prep: prep, initState: initState, cloneState: cloneState, blockOf: blockOf, occGrid: occGrid, applyRemove: applyRemove, applySwitch: applySwitch, solve: solve, replay: replay,
    evaluate: evaluate, curCells: curCells, curDir: curDir, curRay: curRay, isFlipped: isFlipped, dirOf: dirOf, allGone: allGone, isBentCells: isBentCells, strip: strip, unpack: unpack };
});
