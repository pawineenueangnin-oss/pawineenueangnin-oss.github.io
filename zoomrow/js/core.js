/* Zoomrow core: seeded generator + strict solver/validator (shared by browser & Node) */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ZRCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0]; // 0 up,1 right,2 down,3 left

  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(a, r) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // ---------- board silhouettes ----------
  var SHAPES = {
    full: function () { return true; },
    diamond: function (x, y, w, h) { var cx = (w - 1) / 2, cy = (h - 1) / 2; return Math.abs(x - cx) / (w / 2) + Math.abs(y - cy) / (h / 2) <= 1.06; },
    circle: function (x, y, w, h) { var cx = (w - 1) / 2, cy = (h - 1) / 2; var dx = (x - cx) / (w / 2), dy = (y - cy) / (h / 2); return dx * dx + dy * dy <= 1.08; },
    house: function (x, y, w, h) { var cx = (w - 1) / 2, rows = Math.ceil(h * 0.45); if (y < rows) return Math.abs(x - cx) <= (y + 0.6) * (w / 2) / rows; return x >= 1 && x <= w - 2; },
    cross: function (x, y, w, h) { var c = Math.floor(Math.min(w, h) / 3.2); var xx = Math.min(x, w - 1 - x), yy = Math.min(y, h - 1 - y); return !(xx < c && yy < c); },
    frame: function (x, y, w, h) { var hw = Math.max(1, Math.round(w / 3.6)), hh = Math.max(1, Math.round(h / 3.6)); var x0 = Math.floor((w - hw) / 2), y0 = Math.floor((h - hh) / 2); return !(x >= x0 && x < x0 + hw && y >= y0 && y < y0 + hh); },
    heart: function (x, y, w, h) {
      var u = ((x + 0.5) / w - 0.5) * 2, v = ((y + 0.5) / h - 0.5) * 2;
      if (v < -0.35) { var a = (u - 0.47) * (u - 0.47) + (v + 0.4) * (v + 0.4), b = (u + 0.47) * (u + 0.47) + (v + 0.4) * (v + 0.4); return a <= 0.33 || b <= 0.33; }
      return Math.abs(u) <= 1.04 - (v + 0.35) * 0.78;
    },
    hourglass: function (x, y, w, h) { var cy = (h - 1) / 2, cx = (w - 1) / 2; var k = Math.abs(y - cy) / (h / 2); return Math.abs(x - cx) <= (w / 2) * (0.32 + 0.72 * k); }
  };
  function makeMask(w, h, shape) {
    var f = SHAPES[shape] || SHAPES.full, m = [];
    for (var y = 0; y < h; y++) { var row = ''; for (var x = 0; x < w; x++) row += f(x, y, w, h) ? '#' : '.'; m.push(row); }
    return m;
  }

  // ---------- level specs (difficulty ramp) ----------
  var SHAPE_CYCLE = ['diamond', 'heart', 'cross', 'frame', 'circle', 'house', 'hourglass'];
  function spec(n) {
    if (n === 1) return { w: 4, h: 4, shape: 'full', turn: 0, minL: 2, maxL: 3, maxArrows: 4, minDepth: 2, minCov: 0.55, minBent: 0 };
    if (n === 2) return { w: 5, h: 5, shape: 'full', turn: 0, minL: 2, maxL: 4, maxArrows: 7, minDepth: 3, minCov: 0.7, minBent: 0 };
    if (n === 3) return { w: 5, h: 5, shape: 'full', turn: 0.55, minL: 3, maxL: 4, maxArrows: 6, minDepth: 3, minCov: 0.72, minBent: 3 };
    if (n <= 15) {
      var s = n <= 6 ? 5 : n <= 11 ? 6 : 7;
      return { w: s, h: s, shape: 'full', turn: 0.38, minL: 2, maxL: s <= 5 ? 5 : 6, maxArrows: 99, minDepth: 2 + Math.floor((n - 4) / 4), minCov: 0.8, minBent: 2 + Math.floor((n - 4) / 3) };
    }
    if (n <= 35) {
      var s2 = n <= 21 ? 7 : n <= 28 ? 8 : 9;
      var shape = (n % 4 === 3) ? 'full' : SHAPE_CYCLE[(n - 16) % SHAPE_CYCLE.length];
      return { w: s2, h: s2, shape: shape, turn: 0.42, minL: 2, maxL: 6, maxArrows: 99, minDepth: 4 + Math.floor((n - 16) / 7), minCov: 0.8, minBent: 4 };
    }
    var s3 = n <= 40 ? 9 : n <= 45 ? 10 : 11;
    var shape3 = (n % 3 === 0 || n === 50) ? 'full' : SHAPE_CYCLE[(n - 36) % SHAPE_CYCLE.length];
    return { w: s3, h: s3, shape: shape3, turn: 0.55, minL: 3, maxL: 7, maxArrows: 99, minDepth: (shape3 === 'full' ? 7 : 6) + Math.floor((n - 36) / 6), minCov: 0.82, minBent: 6 };
  }
  function endlessSpec(stage, r) {
    var s = Math.min(11, 7 + Math.floor(stage / 3));
    var shape = r() < 0.35 ? 'full' : SHAPE_CYCLE[Math.floor(r() * SHAPE_CYCLE.length)];
    return { w: s, h: s, shape: shape, turn: 0.5, minL: 2, maxL: 4 + Math.floor(s / 3), maxArrows: 99, minDepth: Math.min(8, 3 + Math.floor(stage / 2)), minCov: 0.8, minBent: 4 };
  }

  // ---------- helpers ----------
  function inMask(L, x, y) { return x >= 0 && y >= 0 && x < L.w && y < L.h && L.mask[y].charAt(x) === '#'; }
  function inBox(L, x, y) { return x >= 0 && y >= 0 && x < L.w && y < L.h; }
  function rayCells(L, a) {
    var hd = a.cells[a.cells.length - 1], out = [], x = hd[0] + DX[a.dir], y = hd[1] + DY[a.dir];
    while (inBox(L, x, y)) { out.push([x, y]); x += DX[a.dir]; y += DY[a.dir]; }
    return out;
  }
  function isBent(a) {
    for (var i = 2; i < a.cells.length; i++) {
      var c0 = a.cells[i - 2], c1 = a.cells[i - 1], c2 = a.cells[i];
      if ((c1[0] - c0[0]) !== (c2[0] - c1[0]) || (c1[1] - c0[1]) !== (c2[1] - c1[1])) return true;
    }
    return false;
  }

  // ---------- generator (reverse construction: every placed arrow has a clear exit vs. earlier ones) ----------
  function genOnce(sp, seed) {
    var r = rng(seed), w = sp.w, h = sp.h;
    var L = { w: w, h: h, mask: makeMask(w, h, sp.shape), arrows: [] };
    var occ = new Int16Array(w * h).fill(-1);
    var rays = []; // ray cell index lists of placed arrows
    var maskCount = 0, empties = [];
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) if (inMask(L, x, y)) maskCount++;
    function tryBuild(hx, hy, d) {
      var px = hx - DX[d], py = hy - DY[d];
      if (!inMask(L, px, py) || occ[py * w + px] >= 0) return null;
      var ray = {}, x = hx + DX[d], y = hy + DY[d];
      while (inBox(L, x, y)) { if (occ[y * w + x] >= 0) return null; ray[y * w + x] = 1; x += DX[d]; y += DY[d]; }
      var target = sp.minL + Math.floor(r() * (sp.maxL - sp.minL + 1));
      var path = [[hx, hy], [px, py]], used = {}; used[hy * w + hx] = 1; used[py * w + px] = 1;
      var md = d; // motion direction tail->head of current segment
      while (path.length < target) {
        var c = path[path.length - 1], opts = [];
        var straight = md, left = (md + 3) % 4, right = (md + 1) % 4;
        var order = sp.turn === 0 ? [straight] : r() < sp.turn ? (r() < 0.5 ? [left, right, straight] : [right, left, straight]) : (r() < 0.5 ? [straight, left, right] : [straight, right, left]);
        for (var k = 0; k < 3; k++) {
          var nd = order[k], nx = c[0] - DX[nd], ny = c[1] - DY[nd];
          if (!inMask(L, nx, ny) || occ[ny * w + nx] >= 0 || used[ny * w + nx] || ray[ny * w + nx]) continue;
          opts.push([nx, ny, nd]); break;
        }
        if (!opts.length) break;
        var o = opts[0]; path.push([o[0], o[1]]); used[o[1] * w + o[0]] = 1; md = o[2];
      }
      if (path.length < sp.minL && !(path.length >= 2 && sp.allowShort)) return null;
      path.reverse();
      var rl = Object.keys(ray).map(Number);
      // score: how many earlier exits this arrow would block (creates peel-order chains)
      var blocks = 0;
      for (var i = 0; i < rays.length; i++) { var rr = rays[i]; for (var j = 0; j < path.length; j++) { if (rr[path[j][1] * w + path[j][0]]) { blocks++; break; } } }
      return { cells: path, dir: d, rayIdx: rl, ray: ray, blocks: blocks };
    }
    var fails = 0;
    while (L.arrows.length < sp.maxArrows && fails < 3) {
      empties = [];
      for (var yy = 0; yy < h; yy++) for (var xx = 0; xx < w; xx++) if (inMask(L, xx, yy) && occ[yy * w + xx] < 0) empties.push([xx, yy]);
      if (!empties.length) break;
      shuffle(empties, r);
      var best = null, bestScore = -1, samples = 0;
      for (var e = 0; e < empties.length && samples < 14; e++) {
        var dirs = shuffle([0, 1, 2, 3], r);
        for (var di = 0; di < 4; di++) {
          var cand = tryBuild(empties[e][0], empties[e][1], dirs[di]);
          if (!cand) continue;
          samples++;
          var sc = Math.min(cand.cells.length, 4) * 0.6 + cand.blocks * 2.2 + (isBent(cand) ? 0.8 : 0) + r() * 1.5;
          if (sc > bestScore) { bestScore = sc; best = cand; }
          break;
        }
      }
      if (!best) { fails++; continue; }
      var id = L.arrows.length;
      L.arrows.push({ cells: best.cells, dir: best.dir });
      rays.push(best.ray);
      for (var q = 0; q < best.cells.length; q++) occ[best.cells[q][1] * w + best.cells[q][0]] = id;
    }
    // hole-filling pass: short (2-3 cell) arrows into leftover pockets
    if (sp.fillPass !== false && sp.maxArrows >= 99) {
      var keep = { minL: sp.minL, maxL: sp.maxL }; sp.minL = 2; sp.maxL = 3; fails = 0;
      while (fails < 2) {
        empties = [];
        for (var y3 = 0; y3 < h; y3++) for (var x3 = 0; x3 < w; x3++) if (inMask(L, x3, y3) && occ[y3 * w + x3] < 0) empties.push([x3, y3]);
        shuffle(empties, r); var got = null;
        for (var e3 = 0; e3 < empties.length && !got; e3++) { var ds = shuffle([0, 1, 2, 3], r); for (var d3 = 0; d3 < 4 && !got; d3++) got = tryBuild(empties[e3][0], empties[e3][1], ds[d3]); }
        if (!got) { fails++; continue; }
        var id3 = L.arrows.length; L.arrows.push({ cells: got.cells, dir: got.dir }); rays.push(got.ray);
        for (var q3 = 0; q3 < got.cells.length; q3++) occ[got.cells[q3][1] * w + got.cells[q3][0]] = id3;
      }
      sp.minL = keep.minL; sp.maxL = keep.maxL;
    }
    // shuffle arrow order so array order doesn't leak the solution
    var idx = shuffle(L.arrows.map(function (_, i) { return i; }), r);
    L.arrows = idx.map(function (i) { return L.arrows[i]; });
    var used2 = 0; L.arrows.forEach(function (a) { used2 += a.cells.length; });
    L.coverage = used2 / maskCount;
    return L;
  }

  function analyze(L) { // strict forward solver: layer by layer
    var n = L.arrows.length, alive = [], occ = {}, w = L.w;
    for (var i = 0; i < n; i++) { alive.push(true); L.arrows[i].cells.forEach(function (c) { occ[c[1] * w + c[0]] = i; }); }
    var order = [], depth = 0, freeAtStart = -1, left = n;
    while (left > 0) {
      var free = [];
      for (var k = 0; k < n; k++) if (alive[k] && blockerOf(L, k, occ) < 0) free.push(k);
      if (freeAtStart < 0) freeAtStart = free.length;
      if (!free.length) return { solvable: false, depth: depth, freeAtStart: freeAtStart, order: order };
      depth++;
      free.forEach(function (k) { alive[k] = false; left--; order.push(k); L.arrows[k].cells.forEach(function (c) { delete occ[c[1] * w + c[0]]; }); });
    }
    return { solvable: true, depth: depth, freeAtStart: freeAtStart, order: order };
  }
  // returns index of first cell on ray occupied by another arrow (or self) -> blocking arrow id, else -1
  function blockerOf(L, k, occ) {
    var ray = rayCells(L, L.arrows[k]);
    for (var i = 0; i < ray.length; i++) { var v = occ[ray[i][1] * L.w + ray[i][0]]; if (v !== undefined && v !== null && v >= 0) return v; }
    return -1;
  }

  function validate(L) {
    var errs = [], seen = {}, w = L.w;
    if (!L.arrows.length) errs.push('no arrows');
    L.arrows.forEach(function (a, i) {
      if (a.cells.length < 2) errs.push('arrow ' + i + ' too short');
      a.cells.forEach(function (c, j) {
        if (!inMask(L, c[0], c[1])) errs.push('arrow ' + i + ' cell out of board ' + c);
        var key = c[1] * w + c[0];
        if (seen[key] !== undefined) errs.push('overlap at ' + c + ' arrows ' + seen[key] + '/' + i);
        seen[key] = i;
        if (j > 0) { var p = a.cells[j - 1]; if (Math.abs(p[0] - c[0]) + Math.abs(p[1] - c[1]) !== 1) errs.push('arrow ' + i + ' not contiguous'); }
      });
      var hd = a.cells[a.cells.length - 1], pv = a.cells[a.cells.length - 2];
      if (pv && (hd[0] - pv[0] !== DX[a.dir] || hd[1] - pv[1] !== DY[a.dir])) errs.push('arrow ' + i + ' head dir mismatch');
      var own = {}; a.cells.forEach(function (c) { own[c[1] * w + c[0]] = 1; });
      rayCells(L, a).forEach(function (c) { if (own[c[1] * w + c[0]]) errs.push('arrow ' + i + ' self-blocking'); });
    });
    var an = analyze(L);
    if (!an.solvable) errs.push('UNSOLVABLE');
    return { ok: errs.length === 0, errors: errs, depth: an.depth, freeAtStart: an.freeAtStart, arrows: L.arrows.length, solution: an.order };
  }

  function build(sp, baseSeed, attempts) {
    var best = null, bestScore = -1e9;
    for (var t = 0; t < attempts; t++) {
      var L = genOnce(sp, baseSeed + t * 7919);
      var v = validate(L);
      if (!v.ok) continue;
      var bent = L.arrows.filter(isBent).length;
      var meets = v.depth >= sp.minDepth && L.coverage >= sp.minCov && bent >= sp.minBent && (v.freeAtStart < v.arrows);
      if (sp.maxArrows < 99 && L.arrows.length < sp.maxArrows) meets = false;
      var score = (meets ? 1000 : 0) + L.coverage * 40 + Math.min(v.depth, sp.minDepth + 4) * 3 - Math.max(0, v.freeAtStart - 3) * 1.5;
      if (score > bestScore) { bestScore = score; best = L; best._meets = meets; best._seed = baseSeed + t * 7919; }
      if (meets && t > attempts / 3) break;
    }
    return best;
  }
  function makeLevel(n) {
    var sp = spec(n);
    var L = build(sp, 20261120 + n * 1013, 400);
    L.n = n; L.shape = sp.shape;
    return L;
  }
  function makeEndless(stage, seed) {
    var r = rng(seed);
    var sp = endlessSpec(stage, r);
    var L = build(sp, seed, 60);
    L.n = 0; L.shape = sp.shape; L.stage = stage;
    return L;
  }
  function strip(L) { return { n: L.n, w: L.w, h: L.h, shape: L.shape, mask: L.mask, arrows: L.arrows.map(function (a) { return { c: a.cells, d: a.dir }; }) }; }
  function unpack(o) { return { n: o.n, w: o.w, h: o.h, shape: o.shape, mask: o.mask, arrows: o.arrows.map(function (a) { return { cells: a.c, dir: a.d }; }) }; }

  return { DX: DX, DY: DY, rng: rng, spec: spec, makeLevel: makeLevel, makeEndless: makeEndless, validate: validate, analyze: analyze,
    blockerOf: blockerOf, rayCells: rayCells, inMask: inMask, inBox: inBox, isBent: isBent, strip: strip, unpack: unpack, makeMask: makeMask };
});
