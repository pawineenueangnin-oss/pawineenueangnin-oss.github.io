/* Zoomrow v2: Arrow Escape — P-Prece Studio */
(function () {
  'use strict';
  var C = window.ZRCore, A = window.ZRAudio, DX = C.DX, DY = C.DY;
  var LEVELS = (window.ZR_LEVELS || []).map(C.unpack), TOTAL = LEVELS.length;
  var $ = function (id) { return document.getElementById(id); };
  var qa = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  // ================= i18n =================
  var T = {
    th: { presents: 'นำเสนอ', subtitle: 'แตะลูกศรหนีกระดาน', play: 'เล่นต่อ', levels: 'เลือกด่าน', endless: 'ไม่รู้จบ', daily: 'ภารกิจรายวัน', shop: 'ร้านค้า', shopSub: 'ธีม · ลายลูกศร · ตัวช่วย',
      hint: 'คำใบ้', hammer: 'ค้อนทุบ', wand: 'ไม้กายสิทธิ์', restart: 'เริ่มใหม่', settings: 'ตั้งค่า', left: 'เหลือ', clear: 'ผ่านด่าน!', next: 'ด่านต่อไป', replay: 'เล่นอีกครั้ง', menu: 'เมนู',
      outHearts: 'หัวใจหมดแล้ว', tryAgain: 'ลองวางลำดับใหม่อีกครั้งนะ', retryFree: 'เล่นใหม่ (ฟรี)', refill: 'เติมหัวใจ +3 ❤️ ด้วย 40 เหรียญ', refillNo: 'เหรียญไม่พอ (ต้องใช้ 40)',
      music: 'เพลงประกอบ', sfx: 'เสียงเอฟเฟกต์', vibrate: 'สั่น', dark: 'โหมดมืด', darkNote: 'ใช้ได้กับธีมครีมมินิมอล', language: 'ภาษา', done: 'เสร็จสิ้น',
      tut: 'แตะลูกศรที่ทางข้างหน้าว่าง', level: 'ด่าน', stage: 'รอบ', best: 'สถิติ', noHint: 'คำใบ้หมดแล้ว', perfect: 'สมบูรณ์แบบ ไม่พลาดเลย!', good: 'เก่งมาก! พลาดไป {n} ครั้ง',
      allDone: 'ผ่านครบ 100 ด่านแล้ว! สุดยอด!', endlessNext: 'รอบต่อไป', endlessOver: 'จบรอบไม่รู้จบ ทำได้ {n} รอบ', combo: 'คอมโบ',
      hard: 'ด่านยาก', boss: 'ด่านบอส', tagHard: 'ยาก', tagBoss: 'บอส',
      lockedMsg: 'ปลดล็อกด้วยกุญแจก่อน', iceMsg: 'ปล่อยลูกศรข้างๆ เพื่อกระเทาะน้ำแข็ง', boom: 'ระเบิด! -1 ❤️ ได้เวลาเพิ่ม +3', disarm: 'ปลดชนวนแล้ว!',
      hammerMode: 'แตะลูกศรที่ต้องการทุบ', wandNone: 'ไม่มีลูกศรที่ไปได้ตอนนี้', newMech: 'กลไกใหม่!', gotIt: 'เข้าใจแล้ว', cancel: 'ยกเลิก',
      buyHintT: 'คำใบ้หมดแล้ว', buyHintX: 'ซื้อคำใบ้ 3 ครั้ง ราคา 30 เหรียญ?', buyHammerT: 'ค้อนทุบหมดแล้ว', buyHammerX: 'ซื้อค้อนทุบ 1 อัน ราคา 60 เหรียญ?', buyWandT: 'ไม้กายสิทธิ์หมดแล้ว', buyWandX: 'ซื้อไม้กายสิทธิ์ 1 อัน ราคา 80 เหรียญ?',
      buy: 'ซื้อ', equip: 'ใช้งาน', using: 'กำลังใช้', notEnough: 'เหรียญไม่พอ', bought: 'ซื้อสำเร็จ!', owned: 'มีอยู่', themes: 'ธีมกระดาน', finishes: 'ลายลูกศร', boosters: 'ตัวช่วย',
      hintPack: 'คำใบ้ x3', hintPackD: 'ชี้ทางขั้นต่อไปที่ถูกต้อง', hammerD: 'ทุบลูกศรอันไหนก็ได้ทันที', wandD: 'ปล่อยลูกศรที่ไปได้ให้อัตโนมัติ 3 อัน',
      streak: 'สถิติต่อเนื่อง (วัน)', todayPuzzle: 'ด่านของวันนี้', dailyReward: '+60 เหรียญ เมื่อผ่านด่านครั้งแรกของวัน', playToday: 'เล่นภารกิจวันนี้', playAgain: 'ทำสำเร็จแล้ว ✓ เล่นอีกครั้ง',
      dailyDone: 'สำเร็จวันนี้', dailyTodo: 'ด่านใหม่ทุกวัน', dailyClear: 'ภารกิจรายวันสำเร็จ!', dailyShort: 'รายวัน', dailyBack: 'ดูปฏิทินรายวัน', building: 'กำลังสร้างด่าน…', streakDays: 'ต่อเนื่อง {n} วัน',
      days: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'], months: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'], arrowsN: '{n} ลูกศร', coinsW: 'เหรียญ',
      m_wall: 'กำแพงหิน', m_key: 'กุญแจ & โซ่', m_ice: 'ลูกศรน้ำแข็ง', m_bomb: 'ลูกศรระเบิด', m_sw: 'สวิตช์กลับทิศ',
      r_wall: 'ก้อนหินขยับไม่ได้ และขวางทางหนีของลูกศรทุกอัน', r_key: 'ลูกศรติดโซ่จะไปไม่ได้ จนกว่าลูกศรที่มีกุญแจสีเดียวกันจะหนีออกไปก่อน', r_ice: 'ปล่อยลูกศรที่อยู่ติดกันให้หนีออกไป เพื่อกระเทาะน้ำแข็งจนตัวเลขเหลือ 0',
      r_bomb: 'ทุกครั้งที่ลูกศรหนีออก ตัวเลขจะลดลง 1 พาระเบิดออกไปก่อนถึง 0!', r_sw: 'แตะปุ่ม ⇄ เพื่อกลับหัวลูกศรที่มีสีเชื่อมกัน ให้ชี้ไปอีกทาง',
      shapes: { full: '', diamond: 'เพชร', heart: 'หัวใจ', cross: 'กากบาท', frame: 'กรอบ', circle: 'วงกลม', house: 'บ้าน', hourglass: 'นาฬิกาทราย', star: 'ดาว', crown: 'มงกุฎ' },
      th_ivory: 'ครีมมินิมอล', th_neon: 'นีออนไซเบอร์', th_zen: 'ไม้ญี่ปุ่น', th_pastel: 'พาสเทลลูกกวาด', th_cosmic: 'อวกาศ', f_glossy: 'คลาสสิกเงา', f_crystal: 'คริสตัล', f_neon: 'เรืองแสง' },
    en: { presents: 'presents', subtitle: 'Tap arrows, clear the board', play: 'Continue', levels: 'Levels', endless: 'Endless', daily: 'Daily Challenge', shop: 'Shop', shopSub: 'Themes · Arrow skins · Boosters',
      hint: 'Hint', hammer: 'Hammer', wand: 'Wand', restart: 'Restart', settings: 'Settings', left: 'Left', clear: 'Level Clear!', next: 'Next Level', replay: 'Replay', menu: 'Menu',
      outHearts: 'Out of hearts', tryAgain: 'Try a different order', retryFree: 'Retry (free)', refill: 'Refill +3 ❤️ for 40 coins', refillNo: 'Not enough coins (40)',
      music: 'Music', sfx: 'Sound effects', vibrate: 'Vibration', dark: 'Dark mode', darkNote: 'For the Warm Ivory theme', language: 'Language', done: 'Done',
      tut: 'Tap an arrow with a clear path', level: 'Level', stage: 'Stage', best: 'Best', noHint: 'No hints left', perfect: 'Perfect, no mistakes!', good: 'Nice! {n} mistake(s)',
      allDone: 'All 100 levels cleared! Amazing!', endlessNext: 'Next stage', endlessOver: 'Endless run over: {n} stage(s)', combo: 'Combo',
      hard: 'HARD', boss: 'BOSS', tagHard: 'HARD', tagBoss: 'BOSS',
      lockedMsg: 'Unlock it with the key first', iceMsg: 'Free neighbouring arrows to crack the ice', boom: 'BOOM! -1 ❤️, +3 moves', disarm: 'Disarmed!',
      hammerMode: 'Tap an arrow to smash', wandNone: 'No arrow can move right now', newMech: 'New mechanic!', gotIt: 'Got it', cancel: 'Cancel',
      buyHintT: 'Out of hints', buyHintX: 'Buy 3 hints for 30 coins?', buyHammerT: 'Out of hammers', buyHammerX: 'Buy 1 hammer for 60 coins?', buyWandT: 'Out of wands', buyWandX: 'Buy 1 wand for 80 coins?',
      buy: 'Buy', equip: 'Equip', using: 'In use', notEnough: 'Not enough coins', bought: 'Purchased!', owned: 'Owned', themes: 'Board themes', finishes: 'Arrow finishes', boosters: 'Boosters',
      hintPack: 'Hint x3', hintPackD: 'Shows the exact next winning move', hammerD: 'Smash any arrow instantly', wandD: 'Auto-clears up to 3 free arrows',
      streak: 'Day streak', todayPuzzle: "Today's puzzle", dailyReward: '+60 coins on your first clear today', playToday: "Play today's challenge", playAgain: 'Completed ✓ Play again',
      dailyDone: 'Done today', dailyTodo: 'A new puzzle every day', dailyClear: 'Daily Challenge complete!', dailyShort: 'Daily', dailyBack: 'View daily calendar', building: 'Building puzzle…', streakDays: '{n}-day streak',
      days: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], arrowsN: '{n} arrows', coinsW: 'coins',
      m_wall: 'Stone Wall', m_key: 'Key & Lock', m_ice: 'Frozen Arrow', m_bomb: 'Bomb Arrow', m_sw: 'Direction Switch',
      r_wall: 'Stones never move and block every arrow path.', r_key: 'A chained arrow stays put until the arrow carrying its matching key escapes.', r_ice: 'Free neighbouring arrows to crack the ice down to 0.',
      r_bomb: 'Every escape ticks the counter down by 1 — get the bomb out before it hits 0!', r_sw: 'Tap the ⇄ switch to flip linked arrows end-for-end.',
      shapes: { full: '', diamond: 'Diamond', heart: 'Heart', cross: 'Cross', frame: 'Frame', circle: 'Circle', house: 'House', hourglass: 'Hourglass', star: 'Star', crown: 'Crown' },
      th_ivory: 'Warm Ivory', th_neon: 'Cyber Neon', th_zen: 'Zen Wood', th_pastel: 'Soft Pastel', th_cosmic: 'Cosmic Space', f_glossy: 'Glossy', f_crystal: 'Crystal Gem', f_neon: 'Neon Aura' }
  };

  // ================= save =================
  var KEY = 'zoomrow.save.v2';
  var save = { unlocked: 1, stars: {}, cleared: {}, coins: 150, inv: { hint: 3, hammer: 2, wand: 1 }, music: true, sfx: true, vib: true, dark: false, lang: 'th',
    theme: 'ivory', finish: 'glossy', ownedThemes: { ivory: 1 }, ownedFinishes: { glossy: 1 }, endlessBest: 0, seen: {}, daily: {} };
  try {
    var s0 = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!s0) { var v1 = JSON.parse(localStorage.getItem('zoomrow.save.v1') || 'null'); if (v1) { save.lang = v1.lang || 'th'; save.dark = !!v1.dark; } }
    if (s0) for (var k in s0) save[k] = s0[k];
  } catch (e) {}
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {} }
  function t(k, n) { var s = (T[save.lang] || T.th)[k]; if (s === undefined) s = T.th[k]; if (typeof s === 'string' && n !== undefined) s = s.replace('{n}', n); return s; }

  // ================= themes / finishes =================
  var THEMES = {
    ivory: { price: 0, css: { '--bg': '#FBF6EC', '--bg2': '#F3EADA', '--ink': '#2A2F45', '--ink2': '#6B6F82', '--card': '#FFFFFF', '--tile': '#EFE5D3', '--tile2': '#E6D9C2', '--line': 'rgba(42,47,69,.10)', '--shadow': '0 6px 18px rgba(80,60,30,.12)' },
      tile: '#EFE5D3', tileEdge: '#E2D4BA', dot: 'rgba(120,90,50,.16)', shadow: 'rgba(70,45,10,.22)', wallA: '#7A7F8E', wallB: '#4A4E5C', glow: 0, bg: null,
      palette: ['#FF5E4D', '#3D7BFF', '#14B8A6', '#FFAA1F', '#8B5CF6', '#F0468C', '#22A95B', '#1F6FB8', '#FF7A1A', '#C2410C', '#0E9F9A', '#6D4BD8'] },
    ivoryDark: { css: { '--bg': '#171A26', '--bg2': '#1F2333', '--ink': '#EEF0F7', '--ink2': '#A3A8BD', '--card': '#252A3C', '--tile': '#262B3E', '--tile2': '#2E3449', '--line': 'rgba(255,255,255,.08)', '--shadow': '0 6px 18px rgba(0,0,0,.35)' },
      tile: '#262B3E', tileEdge: '#1C2030', dot: 'rgba(255,255,255,.10)', shadow: 'rgba(0,0,0,.45)', wallA: '#5E6478', wallB: '#383C4C', glow: 0, bg: null, darkish: 1,
      palette: ['#FF6B5A', '#5B8CFF', '#2DD4BF', '#FFB43D', '#A27BFF', '#FF5FA2', '#34C77B', '#4AA3FF', '#FF8A3D', '#E25B2B', '#22C3BE', '#8A6BFF'] },
    neon: { price: 120, css: { '--bg': '#0B1026', '--bg2': '#141B3D', '--ink': '#E8F0FF', '--ink2': '#94A3D6', '--card': '#18214A', '--tile': '#1B2452', '--tile2': '#25306A', '--line': 'rgba(120,200,255,.12)', '--shadow': '0 6px 18px rgba(0,0,0,.45)' },
      tile: '#141C44', tileEdge: '#0C1232', dot: 'rgba(0,240,255,.22)', shadow: 'rgba(0,0,0,.5)', wallA: '#3B4778', wallB: '#20284D', glow: 1, bg: 'grid', darkish: 1,
      palette: ['#00F0FF', '#FF2E97', '#B6FF3B', '#FFD400', '#A66BFF', '#FF6B2E', '#2EFFB4', '#3D8BFF'] },
    zen: { price: 150, css: { '--bg': '#F6EAD3', '--bg2': '#E6CFA6', '--ink': '#3A2A1A', '--ink2': '#7A6248', '--card': '#FFF8EC', '--tile': '#E6CDA2', '--tile2': '#D6B88A', '--line': 'rgba(90,60,30,.14)', '--shadow': '0 6px 18px rgba(90,60,20,.16)' },
      tile: '#E3C69A', tileEdge: '#C49E6C', dot: 'rgba(110,70,30,.18)', shadow: 'rgba(80,45,10,.28)', wallA: '#6E6458', wallB: '#423A31', glow: 0, bg: 'wood',
      palette: ['#B3261E', '#1F1F1F', '#C9971C', '#2F5D50', '#7A3E2B', '#3B4F7A', '#D2552E', '#556B2F'] },
    pastel: { price: 150, css: { '--bg': '#F4ECFF', '--bg2': '#FFE8DC', '--ink': '#4A3B66', '--ink2': '#8A7AA8', '--card': '#FFFFFF', '--tile': '#EADFFB', '--tile2': '#DCCDF3', '--line': 'rgba(120,90,180,.12)', '--shadow': '0 6px 18px rgba(140,100,200,.15)' },
      tile: '#ECE2FB', tileEdge: '#DACBF3', dot: 'rgba(140,110,200,.2)', shadow: 'rgba(120,80,170,.2)', wallA: '#A79BBE', wallB: '#7D7196', glow: 0, bg: null,
      palette: ['#FF8FA3', '#7FB3FF', '#5FCFA8', '#FFB37A', '#B69CFF', '#FF8AD8', '#5CCFE6', '#E8C547'] },
    cosmic: { price: 220, css: { '--bg': '#0A0E26', '--bg2': '#1B0F3B', '--ink': '#F0ECFF', '--ink2': '#A89FD1', '--card': '#1D1842', '--tile': '#231D4F', '--tile2': '#2D2563', '--line': 'rgba(200,180,255,.12)', '--shadow': '0 6px 18px rgba(0,0,0,.5)' },
      tile: 'rgba(160,140,255,.10)', tileEdge: 'rgba(0,0,0,.35)', dot: 'rgba(255,255,255,.18)', shadow: 'rgba(0,0,0,.55)', wallA: '#4A3F7A', wallB: '#2A2350', glow: 0.7, bg: 'stars', darkish: 1,
      palette: ['#FF5EDB', '#5EE7FF', '#FFD25E', '#9C8BFF', '#5EFFA8', '#FF7A5E', '#7FA8FF', '#FF9FF3'] }
  };
  var THEME_IDS = ['ivory', 'neon', 'zen', 'pastel', 'cosmic'];
  var FINISHES = { glossy: { price: 0 }, crystal: { price: 140 }, neon: { price: 180 } };
  var FINISH_IDS = ['glossy', 'crystal', 'neon'];
  var PAIR = ['#FFC531', '#FF4FD8', '#3DF0FF'], SWC = '#A855F7';
  var preview = null;
  function themeObj(id) { id = id || save.theme; if (id === 'ivory' && save.dark) return THEMES.ivoryDark; return THEMES[id] || THEMES.ivory; }
  function applyTheme() {
    var th = themeObj(), b = document.body;
    for (var k in th.css) b.style.setProperty(k, th.css[k]);
    THEME_IDS.forEach(function (id) { b.classList.toggle('th-' + id, save.theme === id); });
    b.classList.toggle('dark', save.theme === 'ivory' && save.dark);
    var m = document.querySelector('meta[name=theme-color]'); if (m) m.content = th.css['--bg'];
    drawLogo(); if (G.L) recolor();
  }

  // ================= screens =================
  var cur = 'splash';
  function show(id) {
    qa('.screen').forEach(function (el) { el.classList.toggle('active', el.id === id); });
    cur = id; refreshCoins();
    if (id === 'menu') refreshMenu();
    if (id === 'levels') buildLevelGrid();
    if (id === 'shop') buildShop();
    if (id === 'daily') buildDaily();
    if (id === 'game') requestAnimationFrame(resize);
  }
  function applyLang() {
    document.documentElement.lang = save.lang;
    qa('[data-i18n]').forEach(function (el) { var v = t(el.getAttribute('data-i18n')); if (typeof v === 'string') el.textContent = v; });
    qa('#sLang button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-v') === save.lang); });
    if (G.L) updateHud(); refreshMenu(); refreshToggles();
    if (cur === 'shop') buildShop(); if (cur === 'daily') buildDaily(); if (cur === 'levels') buildLevelGrid();
  }
  function refreshToggles() {
    $('sMusic').classList.toggle('on', !!save.music); $('sSfx').classList.toggle('on', !!save.sfx); $('sVib').classList.toggle('on', !!save.vib);
    $('sDark').classList.toggle('on', !!save.dark && save.theme === 'ivory'); $('sDark').disabled = save.theme !== 'ivory'; $('darkNote').textContent = save.theme !== 'ivory' ? t('darkNote') : '';
    A.setSfx(save.sfx); A.setMusic(save.music);
  }
  function refreshCoins() { qa('.coin-val').forEach(function (el) { el.textContent = save.coins; }); }
  function bumpCoins() { refreshCoins(); qa('.coin-pill').forEach(function (el) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }); }
  function refreshMenu() {
    var nxt = Math.min(save.unlocked, TOTAL), k = C.kindOf(nxt);
    $('playLv').textContent = t('level') + ' ' + nxt + (k !== 'normal' ? ' · ' + t(k) : '');
    $('endlessBest').textContent = save.endlessBest ? (t('best') + ' ' + save.endlessBest) : '';
    var td = today(), st = streak();
    $('dailySub').textContent = save.daily[td] ? t('dailyDone') + ' ✓' : t('dailyTodo');
    $('dailyBadge').textContent = st ? '🔥 ' + st : '';
    var tot = 0; for (var s in save.stars) tot += save.stars[s]; $('lvStarsSm').textContent = '★ ' + tot + '/300';
  }
  function vib(p) { if (save.vib && navigator.vibrate) try { navigator.vibrate(p); } catch (e) {} }

  // ================= drawing helpers =================
  function rr(x, X, Y, W, H, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + W, Y, X + W, Y + H, r); x.arcTo(X + W, Y + H, X, Y + H, r); x.arcTo(X, Y + H, X, Y, r); x.arcTo(X, Y, X + W, Y, r); x.closePath(); }
  function hexRgb(hex) { var n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function shade(hex, f) { var c = hexRgb(hex), r = c[0], g = c[1], b = c[2]; if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; } return 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')'; }
  function mix(a, b, f) { var A1 = hexRgb(a), B1 = hexRgb(b); return '#' + [0, 1, 2].map(function (i) { var v = Math.round(A1[i] * (1 - f) + B1[i] * f); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function rgba(hex, a) { var c = hexRgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function sparkle(x, px, py, r, col) { x.save(); x.fillStyle = col; x.beginPath(); x.moveTo(px, py - r * 2); x.quadraticCurveTo(px, py, px + r * 2, py); x.quadraticCurveTo(px, py, px, py + r * 2); x.quadraticCurveTo(px, py, px - r * 2, py); x.quadraticCurveTo(px, py, px, py - r * 2); x.fill(); x.restore(); }

  // pts: screen points tail->head. o: {glow, flash, head, tailHead, finish, th, dim, t}
  function drawRibbon(x, pts, col, c, alpha, o) {
    if (pts.length < 2) return;
    o = o || {}; var th = o.th || themeObj(), fin = o.finish || save.finish;
    var lw = c * 0.34, hx = pts[pts.length - 1][0], hy = pts[pts.length - 1][1];
    var p2 = pts[pts.length - 2], vx = hx - p2[0], vy = hy - p2[1], vl = Math.hypot(vx, vy) || 1; vx /= vl; vy /= vl;
    var tx = pts[0][0], ty = pts[0][1], q2 = pts[1], ux = tx - q2[0], uy = ty - q2[1], ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul;
    var hs = o.head === undefined ? 1 : o.head, ts = o.tailHead || 0;
    var body = pts.slice(); body[body.length - 1] = [hx - vx * c * 0.12 * hs, hy - vy * c * 0.12 * hs];
    if (ts > 0) body[0] = [tx - ux * c * 0.12 * ts, ty - uy * c * 0.12 * ts];
    x.save(); x.globalAlpha = alpha; x.lineCap = 'round'; x.lineJoin = 'round';
    function path() { x.beginPath(); x.moveTo(body[0][0], body[0][1]); for (var i = 1; i < body.length; i++) x.lineTo(body[i][0], body[i][1]); }
    function head(px0, py0, ax, ay, sc) {
      if (sc <= 0.01) return;
      var tip = c * 0.46 * sc, back = c * 0.16 * sc, hw = c * 0.38 * sc, px = -ay, py = ax;
      x.moveTo(px0 + ax * tip, py0 + ay * tip);
      x.lineTo(px0 - ax * back + px * hw, py0 - ay * back + py * hw);
      x.quadraticCurveTo(px0 + ax * c * 0.02, py0 + ay * c * 0.02, px0 - ax * back - px * hw, py0 - ay * back - py * hw); x.closePath();
    }
    function heads(sc) { x.beginPath(); head(hx, hy, vx, vy, hs * sc); if (ts > 0) head(tx, ty, ux, uy, ts * sc); }
    var main = o.flash ? mix(col, '#FF2D2D', o.flash) : col;
    if (o.dim) main = mix(main, th.darkish ? '#3A3F55' : '#B9B3A8', o.dim);
    var glow = (o.glow || 0) + (fin === 'neon' ? 0.9 : 0) + (th.glow || 0) * 0.6;
    x.save(); x.translate(0, c * 0.07); x.strokeStyle = th.shadow; x.lineWidth = lw; path(); x.stroke(); x.fillStyle = th.shadow; heads(1); x.fill(); x.restore();
    if (glow > 0) { x.shadowColor = main; x.shadowBlur = c * 0.5 * Math.min(1.6, glow); }
    if (fin === 'neon') {
      x.strokeStyle = rgba(main, 0.35); x.lineWidth = lw * 1.5; path(); x.stroke();
      x.strokeStyle = main; x.lineWidth = lw * 0.95; path(); x.stroke(); x.shadowBlur = 0;
      x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = lw * 0.3; path(); x.stroke();
      x.fillStyle = main; x.shadowColor = main; x.shadowBlur = c * 0.6; heads(1.05); x.fill(); x.shadowBlur = 0;
      x.fillStyle = 'rgba(255,255,255,.55)'; heads(0.5); x.fill();
    } else {
      x.strokeStyle = shade(main, -0.18); x.lineWidth = lw + c * 0.05; path(); x.stroke();
      x.strokeStyle = main; x.lineWidth = lw; path(); x.stroke();
      x.shadowBlur = 0;
      if (fin === 'crystal') {
        for (var i = 0; i < body.length - 1; i++) {
          var a0 = body[i], a1 = body[i + 1], sx = a1[0] - a0[0], sy = a1[1] - a0[1], sl = Math.hypot(sx, sy); if (sl < 1) continue;
          var nx = -sy / sl, ny = sx / sl, steps = Math.max(1, Math.round(sl / (c * 0.33)));
          for (var k = 0; k < steps; k++) {
            var f0 = k / steps, f1 = (k + 1) / steps, mx0 = a0[0] + sx * f0, my0 = a0[1] + sy * f0, mx1 = a0[0] + sx * f1, my1 = a0[1] + sy * f1;
            x.fillStyle = k % 2 ? 'rgba(255,255,255,.34)' : 'rgba(0,0,0,.10)';
            x.beginPath(); x.moveTo(mx0 + nx * lw * 0.5, my0 + ny * lw * 0.5); x.lineTo(mx1 + nx * lw * 0.5, my1 + ny * lw * 0.5); x.lineTo((mx0 + mx1) / 2, (my0 + my1) / 2); x.closePath(); x.fill();
            x.fillStyle = k % 2 ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.22)';
            x.beginPath(); x.moveTo(mx0 - nx * lw * 0.5, my0 - ny * lw * 0.5); x.lineTo(mx1 - nx * lw * 0.5, my1 - ny * lw * 0.5); x.lineTo((mx0 + mx1) / 2, (my0 + my1) / 2); x.closePath(); x.fill();
          }
        }
        x.fillStyle = shade(main, -0.25); heads(1.12); x.fill(); x.fillStyle = main; heads(1); x.fill();
        x.fillStyle = 'rgba(255,255,255,.45)'; x.beginPath(); x.moveTo(hx + vx * c * 0.4 * hs, hy + vy * c * 0.4 * hs); x.lineTo(hx - vy * c * 0.2 * hs, hy + vx * c * 0.2 * hs); x.lineTo(hx, hy); x.closePath(); x.fill();
        var tw = 0.5 + 0.5 * Math.sin((o.t || 0) * 4 + pts.length), mb = body[Math.floor(body.length / 2)];
        sparkle(x, mb[0] + lw * 0.15, mb[1] - lw * 0.2, c * 0.13 * (0.5 + tw * 0.7), 'rgba(255,255,255,' + (0.5 + tw * 0.5) + ')');
      } else {
        x.strokeStyle = 'rgba(255,255,255,.32)'; x.lineWidth = lw * 0.28; x.save(); x.translate(-c * 0.03, -c * 0.045); path(); x.stroke(); x.restore();
        x.fillStyle = shade(main, -0.22); heads(1.12); x.fill(); x.fillStyle = main; heads(1); x.fill();
      }
    }
    if (ts <= 0) { x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.arc(body[0][0], body[0][1], lw * 0.18, 0, 7); x.fill(); }
    x.restore();
  }
  function drawWall(x, X, Y, c, th) {
    var g = c * 0.06, s = c - 2 * g, gr = x.createLinearGradient(X, Y, X + c, Y + c);
    gr.addColorStop(0, th.wallA); gr.addColorStop(1, th.wallB);
    x.fillStyle = 'rgba(0,0,0,.28)'; rr(x, X + g, Y + g + c * 0.06, s, s, c * 0.16); x.fill();
    x.fillStyle = gr; rr(x, X + g, Y + g, s, s, c * 0.16); x.fill();
    x.fillStyle = 'rgba(255,255,255,.18)'; x.beginPath(); x.moveTo(X + g + c * 0.12, Y + g + c * 0.1); x.lineTo(X + c - g - c * 0.14, Y + g + c * 0.1); x.lineTo(X + c - g - c * 0.26, Y + g + c * 0.28); x.lineTo(X + g + c * 0.2, Y + g + c * 0.3); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = Math.max(1, c * 0.035); x.lineCap = 'round';
    x.beginPath(); x.moveTo(X + c * 0.3, Y + c * 0.55); x.lineTo(X + c * 0.45, Y + c * 0.66); x.lineTo(X + c * 0.42, Y + c * 0.8); x.moveTo(X + c * 0.45, Y + c * 0.66); x.lineTo(X + c * 0.64, Y + c * 0.6); x.stroke();
    x.strokeStyle = 'rgba(255,255,255,.12)'; x.beginPath(); x.moveTo(X + c * 0.32, Y + c * 0.58); x.lineTo(X + c * 0.46, Y + c * 0.69); x.stroke();
  }
  function badgeBase(x, px, py, r, fill, ring) { x.save(); x.shadowColor = 'rgba(0,0,0,.3)'; x.shadowBlur = r * 0.5; x.shadowOffsetY = r * 0.12; x.fillStyle = fill; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill(); x.restore(); if (ring) { x.strokeStyle = ring; x.lineWidth = r * 0.16; x.beginPath(); x.arc(px, py, r * 0.92, 0, 7); x.stroke(); } }
  function drawKeyGlyph(x, px, py, r, col) {
    x.save(); x.strokeStyle = col; x.lineWidth = r * 0.24; x.lineCap = 'round';
    x.beginPath(); x.arc(px - r * 0.34, py, r * 0.3, 0, 7); x.stroke();
    x.beginPath(); x.moveTo(px - r * 0.04, py); x.lineTo(px + r * 0.62, py); x.moveTo(px + r * 0.42, py); x.lineTo(px + r * 0.42, py + r * 0.28); x.moveTo(px + r * 0.62, py); x.lineTo(px + r * 0.62, py + r * 0.34); x.stroke(); x.restore();
  }
  function drawKeyBadge(x, px, py, r, col) { badgeBase(x, px, py, r, col, 'rgba(255,255,255,.85)'); drawKeyGlyph(x, px, py, r * 0.95, '#3A2A00'); }
  function drawLockBadge(x, px, py, r, col, shake) {
    px += shake || 0; badgeBase(x, px, py, r, '#2B2F3F', col);
    x.save(); x.strokeStyle = col; x.lineWidth = r * 0.2; x.beginPath(); x.arc(px, py - r * 0.12, r * 0.3, Math.PI, 0); x.stroke();
    x.fillStyle = col; rr(x, px - r * 0.45, py - r * 0.12, r * 0.9, r * 0.66, r * 0.14); x.fill();
    x.fillStyle = '#2B2F3F'; x.beginPath(); x.arc(px, py + r * 0.14, r * 0.1, 0, 7); x.fill(); x.fillRect(px - r * 0.04, py + r * 0.16, r * 0.08, r * 0.18); x.restore();
  }
  function drawChain(x, pts, c, col, shake) {
    x.save(); var step = c * 0.3, acc = 0, k = 0;
    for (var i = 0; i < pts.length - 1; i++) {
      var a0 = pts[i], a1 = pts[i + 1], sx = a1[0] - a0[0], sy = a1[1] - a0[1], sl = Math.hypot(sx, sy), an = Math.atan2(sy, sx);
      while (acc < sl) {
        var px = a0[0] + sx * acc / sl + (shake || 0), py = a0[1] + sy * acc / sl;
        x.save(); x.translate(px, py); x.rotate(an + (k % 2 ? Math.PI / 2 : 0));
        x.strokeStyle = '#2B2F3F'; x.lineWidth = c * 0.09; x.beginPath(); x.ellipse(0, 0, c * 0.13, c * 0.07, 0, 0, 7); x.stroke();
        x.strokeStyle = col; x.lineWidth = c * 0.05; x.beginPath(); x.ellipse(0, 0, c * 0.13, c * 0.07, 0, 0, 7); x.stroke(); x.restore();
        acc += step; k++;
      }
      acc -= sl;
    }
    x.restore();
  }
  function drawSnowflake(x, px, py, r, col) {
    x.save(); x.strokeStyle = col; x.lineWidth = Math.max(1, r * 0.14); x.lineCap = 'round';
    for (var i = 0; i < 3; i++) {
      var an = i * Math.PI / 3, ca = Math.cos(an), sa = Math.sin(an); x.beginPath(); x.moveTo(px - ca * r, py - sa * r); x.lineTo(px + ca * r, py + sa * r); x.stroke();
      [-1, 1].forEach(function (sg) { var bx = px + ca * r * 0.6 * sg, by = py + sa * r * 0.6 * sg; [-0.6, 0.6].forEach(function (d) { var a2 = an + (sg > 0 ? Math.PI : 0) + d; x.beginPath(); x.moveTo(bx, by); x.lineTo(bx + Math.cos(a2) * r * 0.3, by + Math.sin(a2) * r * 0.3); x.stroke(); }); });
    }
    x.restore();
  }
  function numText(x, n, px, py, size, col) { x.save(); x.font = '800 ' + Math.round(size) + 'px Prompt, "Noto Sans Thai", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = col; x.fillText(String(n), px, py + size * 0.05); x.restore(); }
  function drawIceBadge(x, px, py, r, n) { badgeBase(x, px, py, r, '#E6FAFF', '#4FC3F7'); drawSnowflake(x, px, py, r * 0.72, 'rgba(41,182,246,.45)'); numText(x, n, px, py, r * 1.05, '#0277BD'); }
  function drawBombBadge(x, px, py, r, n, pulse) {
    var urgent = n <= 3;
    if (urgent) { x.save(); x.globalAlpha *= 0.35 + 0.35 * pulse; x.fillStyle = '#FF3B2F'; x.beginPath(); x.arc(px, py, r * (1.35 + 0.2 * pulse), 0, 7); x.fill(); x.restore(); }
    x.save(); x.strokeStyle = '#8A6A3A'; x.lineWidth = r * 0.16; x.lineCap = 'round'; x.beginPath(); x.moveTo(px + r * 0.5, py - r * 0.6); x.quadraticCurveTo(px + r * 0.9, py - r * 1.1, px + r * 1.15, py - r * 0.9); x.stroke(); x.restore();
    sparkle(x, px + r * 1.18, py - r * 0.92, r * (0.16 + 0.08 * pulse), '#FFD23F');
    var g = x.createRadialGradient(px - r * 0.35, py - r * 0.35, r * 0.1, px, py, r); g.addColorStop(0, '#5A5F70'); g.addColorStop(1, '#14161F');
    badgeBase(x, px, py, r, g, urgent ? '#FF5A3D' : '#FFB020');
    numText(x, n, px, py, r * 1.05, urgent ? '#FFDDD6' : '#FFFFFF');
  }
  function drawSwitchGlyph(x, px, py, r, col) {
    x.save(); x.strokeStyle = col; x.fillStyle = col; x.lineWidth = r * 0.2; x.lineCap = 'round'; x.lineJoin = 'round';
    x.beginPath(); x.moveTo(px - r * 0.6, py - r * 0.25); x.lineTo(px + r * 0.5, py - r * 0.25); x.stroke();
    x.beginPath(); x.moveTo(px + r * 0.72, py - r * 0.25); x.lineTo(px + r * 0.36, py - r * 0.52); x.lineTo(px + r * 0.36, py + r * 0.02); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(px + r * 0.6, py + r * 0.3); x.lineTo(px - r * 0.5, py + r * 0.3); x.stroke();
    x.beginPath(); x.moveTo(px - r * 0.72, py + r * 0.3); x.lineTo(px - r * 0.36, py + r * 0.03); x.lineTo(px - r * 0.36, py + r * 0.57); x.closePath(); x.fill();
    x.restore();
  }
  function drawSwitchTile(x, X, Y, c, pulse, press) {
    var g = c * 0.08, s = c - 2 * g, d = press ? c * 0.05 : 0;
    x.save(); x.shadowColor = SWC; x.shadowBlur = c * (0.3 + 0.35 * pulse);
    x.fillStyle = '#5B21B6'; rr(x, X + g, Y + g + c * 0.07, s, s, c * 0.2); x.fill();
    var gr = x.createLinearGradient(X, Y, X, Y + c); gr.addColorStop(0, '#C084FC'); gr.addColorStop(1, '#8B3FE8');
    x.fillStyle = gr; rr(x, X + g, Y + g + d, s, s, c * 0.2); x.fill(); x.restore();
    x.strokeStyle = 'rgba(255,255,255,.6)'; x.lineWidth = c * 0.04; rr(x, X + g * 1.6, Y + g * 1.6 + d, s - g * 1.2, s - g * 1.2, c * 0.16); x.stroke();
    drawSwitchGlyph(x, X + c / 2, Y + c / 2 + d, c * 0.32, '#FFFFFF');
  }
  function drawRevMark(x, px, py, c, ux, uy) {
    x.save(); x.fillStyle = SWC; x.strokeStyle = '#fff'; x.lineWidth = c * 0.04;
    x.beginPath(); x.arc(px, py, c * 0.14, 0, 7); x.fill(); x.stroke();
    drawSwitchGlyph(x, px, py, c * 0.1, '#FFFFFF'); x.restore();
  }
  function drawBoardBg(x, W, H, th, tm) {
    if (th.bg === 'stars') { x.save(); for (var i = 0; i < 70; i++) { var px = ((i * 137.5) % W), py = ((i * 71.9 + i * i * 3.7) % H), tw = 0.4 + 0.6 * Math.abs(Math.sin(tm * 1.3 + i)); x.fillStyle = 'rgba(255,255,255,' + (0.25 + 0.6 * tw) + ')'; x.beginPath(); x.arc(px, py, (i % 7 === 0 ? 1.6 : 0.9), 0, 7); x.fill(); } var g = x.createRadialGradient(W * 0.7, H * 0.3, 10, W * 0.7, H * 0.3, W * 0.7); g.addColorStop(0, 'rgba(180,90,255,.18)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H); x.restore(); }
    if (th.bg === 'grid') { x.save(); x.strokeStyle = 'rgba(0,240,255,.06)'; x.lineWidth = 1; for (var gx = 0; gx < W; gx += 26) { x.beginPath(); x.moveTo(gx, 0); x.lineTo(gx, H); x.stroke(); } for (var gy = 0; gy < H; gy += 26) { x.beginPath(); x.moveTo(0, gy); x.lineTo(W, gy); x.stroke(); } x.restore(); }
  }
  function drawTile(x, X, Y, c, th) {
    var g = c * 0.07;
    x.fillStyle = th.tileEdge; rr(x, X + g, Y + g + c * 0.035, c - 2 * g, c - 2 * g, c * 0.2); x.fill();
    x.fillStyle = th.tile; rr(x, X + g, Y + g, c - 2 * g, c - 2 * g, c * 0.2); x.fill();
    if (th.bg === 'wood') { x.save(); rr(x, X + g, Y + g, c - 2 * g, c - 2 * g, c * 0.2); x.clip(); x.strokeStyle = 'rgba(120,75,30,.16)'; x.lineWidth = Math.max(1, c * 0.025); for (var k = 0; k < 4; k++) { x.beginPath(); x.moveTo(X, Y + c * (0.2 + k * 0.22)); x.bezierCurveTo(X + c * 0.3, Y + c * (0.12 + k * 0.22), X + c * 0.7, Y + c * (0.3 + k * 0.22), X + c, Y + c * (0.18 + k * 0.22)); x.stroke(); } x.restore(); }
    x.fillStyle = th.dot; x.beginPath(); x.arc(X + c / 2, Y + c / 2, c * 0.06, 0, 7); x.fill();
  }
  function iceCoat(x, pts, c) {
    x.save(); x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = 'rgba(200,245,255,.62)'; x.lineWidth = c * 0.5;
    x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]); x.stroke();
    x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = c * 0.05; x.setLineDash([c * 0.08, c * 0.22]); x.stroke(); x.restore();
  }

  // ================= menu logo & previews =================
  var DEMO = [
    { cells: [[0, 3], [1, 3], [2, 3], [2, 2], [2, 1]], col: 0 }, { cells: [[4, 0], [4, 1], [4, 2], [5, 2], [6, 2]], col: 1, key: 1 },
    { cells: [[8, 3], [7, 3], [6, 3], [5, 3]], col: 2, ice: 2 }, { cells: [[7, 0], [8, 0], [8, 1]], col: 3, bomb: 5 }];
  function drawDemo(cv2, thId, finId, opts) {
    var x = cv2.getContext('2d'), W = cv2.width, H = cv2.height, th = themeObj(thId); x.clearRect(0, 0, W, H);
    if (opts && opts.bg) { x.fillStyle = th.css['--bg']; x.fillRect(0, 0, W, H); drawBoardBg(x, W, H, th, 0); }
    var cols = 9, rows = 4, c = Math.min((W - 20) / cols, (H - 20) / rows), ox = W / 2 - c * cols / 2, oy = H / 2 - c * rows / 2;
    for (var y = 0; y < rows; y++) for (var xx = 0; xx < cols; xx++) { if (xx === 3 && y === 1) drawWall(x, ox + xx * c, oy + y * c, c, th); else drawTile(x, ox + xx * c, oy + y * c, c, th); }
    DEMO.forEach(function (a) {
      var pts = a.cells.map(function (p) { return [ox + (p[0] + 0.5) * c, oy + (p[1] + 0.5) * c]; });
      drawRibbon(x, pts, th.palette[a.col % th.palette.length], c, 1, { th: th, finish: finId, t: 1 });
      var m = pts[Math.floor((pts.length - 1) / 2)];
      if (opts && opts.badges) { if (a.key) drawKeyBadge(x, m[0], m[1], c * 0.24, PAIR[0]); if (a.ice) { iceCoat(x, pts, c); drawIceBadge(x, m[0], m[1], c * 0.24, a.ice); } if (a.bomb) drawBombBadge(x, m[0], m[1], c * 0.24, a.bomb, 0.5); }
    });
  }
  function drawLogo() { var c2 = $('logoCanvas'); if (c2) drawDemo(c2, save.theme, save.finish, { badges: true }); }

  // ================= game state =================
  var cv = $('board'), ctx = cv.getContext('2d'), DPR = 1, CW = 300, CH = 300;
  var view = { c0: 40, z: 1, ox: 0, oy: 0 };
  var G = { L: null, S: null, va: [], mode: 'level', n: 1, hearts: 3, mistakes: 0, over: false, combo: 0, comboT: 0, hint: null, hammer: false, busy: 0,
    parts: [], sparks: [], flyers: [], rings: [], shake: 0, tut: false, escapes: 0, earned: 0, stage: 1, date: null, swPress: {}, time: 0 };
  var conf = [];

  function assignColors(L) {
    var P = C.prep(L), pal = themeObj().palette, n = P.n, cols = new Array(n).fill(-1);
    for (var i = 0; i < n; i++) {
      var used = {}; P.adj[i].forEach(function (j) { if (cols[j] >= 0) used[cols[j]] = 1; });
      var start = (i * 5) % pal.length, k = start;
      for (var s = 0; s < pal.length; s++) { var c2 = (start + s) % pal.length; if (!used[c2]) { k = c2; break; } }
      cols[i] = k;
    }
    return cols;
  }
  function recolor() { var cols = assignColors(G.L), pal = themeObj().palette; G.va.forEach(function (v, i) { v.ci = cols[i]; v.col = pal[cols[i] % pal.length]; }); }
  function rayLenOf(i) { return C.curRay(G.L, G.S, i).length; }
  function mkVis(i) {
    var cells = C.curCells(G.L, G.S, i).map(function (p) { return [p[0], p[1]]; }), d = C.curDir(G.L, G.S, i);
    var v = G.va[i] || { appear: 0, flash: 0, shake: 0, flipT: 1, crack: 0 };
    v.id = i; v.cells = cells; v.dir = d; v.len = cells.length; v.rayLen = rayLenOf(i); v.state = v.state === 'gone' ? 'gone' : 'idle'; v.s = 0; v.v = 0; v.t = 0;
    var tr = cells.slice(), h = cells[cells.length - 1]; for (var k = 1; k <= v.rayLen + v.len + 5; k++) tr.push([h[0] + DX[d] * k, h[1] + DY[d] * k]); v.traj = tr;
    return v;
  }
  function startLevel(L, mode) {
    hideOverlays(); conf = [];
    G.L = L; G.S = C.initState(L); G.mode = mode; G.hearts = 3; G.mistakes = 0; G.over = false; G.combo = 0; G.hint = null; G.hammer = false; G.busy = 0;
    G.parts = []; G.sparks = []; G.flyers = []; G.rings = []; G.shake = 0; G.escapes = 0; G.earned = 0; G.swPress = {};
    $('toast').classList.remove('show'); $('combo').classList.remove('show'); $('floats').innerHTML = '';
    G.va = []; for (var i = 0; i < L.arrows.length; i++) { G.va[i] = null; G.va[i] = mkVis(i); G.va[i].appear = 0; G.va[i].lockVis = !!L.arrows[i].lk; G.va[i].iceVis = L.arrows[i].ice || 0; }
    var keyN = 0; L.arrows.forEach(function (a, i) { if (a.k !== undefined && a.k >= 0) { var pc = PAIR[keyN++ % PAIR.length]; G.va[i].keyCol = pc; G.va[a.k].lockCol = pc; } });
    recolor();
    G.tut = mode === 'level' && L.n === 1;
    $('tut').classList.toggle('hidden', !G.tut); $('tutBubble').classList.toggle('hidden', !G.tut);
    $('modeBar').classList.add('hidden'); qa('.tool').forEach(function (b) { b.classList.remove('active'); });
    view.z = 1; view.ox = 0; view.oy = 0;
    show('game'); resize(); updateHud();
    setTimeout(function () { maybeIntro(); }, 350);
  }
  function aliveIds() { var r = []; for (var i = 0; i < G.va.length; i++) if (G.S.alive[i]) r.push(i); return r; }
  function freeIds() { var occ = C.occGrid(G.L, G.S); return aliveIds().filter(function (i) { return !C.blockOf(G.L, G.S, i, occ); }); }
  function blockedIds() { var occ = C.occGrid(G.L, G.S); return aliveIds().filter(function (i) { var b = C.blockOf(G.L, G.S, i, occ); return b && (b.why === 'arrow' || b.why === 'wall' || b.why === 'self'); }); }
  function updateHud() {
    if (!G.L) return;
    var L = G.L, k = G.mode === 'daily' ? 'daily' : G.mode === 'endless' ? 'endless' : L.kind;
    $('lvText').textContent = G.mode === 'endless' ? t('endless') + ' · ' + t('stage') + ' ' + G.stage : G.mode === 'daily' ? t('dailyShort') : t('level') + ' ' + L.n;
    var bd = $('lvBadge'); bd.className = 'kbadge ' + k; bd.textContent = k === 'hard' ? '🔥 ' + t('hard') : k === 'boss' ? '👑 ' + t('boss') : k === 'daily' ? '📅 ' + fmtDate(G.date, true) : '';
    var sh = (t('shapes') || {})[L.shape] || ''; $('lvSub').textContent = (sh ? sh + ' · ' : '') + L.w + '×' + L.h + ' · ' + t('arrowsN', L.arrows.length);
    $('leftCount').textContent = aliveIds().length;
    var hs = $('hearts').children; for (var i = 0; i < 3; i++) hs[i].classList.toggle('off', i >= G.hearts);
    [['cHint', 'hint'], ['cHammer', 'hammer'], ['cWand', 'wand']].forEach(function (p) { var el = $(p[0]), n = save.inv[p[1]] || 0; el.textContent = n > 0 ? n : '+'; el.classList.toggle('buy', n <= 0); });
    refreshCoins();
  }

  // ================= layout =================
  function resize() {
    var r = cv.getBoundingClientRect(); if (!r.width) return;
    DPR = Math.min(3, window.devicePixelRatio || 1); CW = r.width; CH = r.height;
    cv.width = Math.round(CW * DPR); cv.height = Math.round(CH * DPR);
    var fx = $('fx'); fx.width = Math.round(window.innerWidth * DPR); fx.height = Math.round(window.innerHeight * DPR);
    if (G.L) { var pad = 12; view.c0 = Math.min((CW - pad * 2) / G.L.w, (CH - pad * 2) / G.L.h, 76); }
    clampView();
  }
  function cell() { return view.c0 * view.z; }
  function origin() { var c = cell(); return [CW / 2 - G.L.w * c / 2 + view.ox, CH / 2 - G.L.h * c / 2 + view.oy]; }
  function toScreen(px, py) { var c = cell(), o = origin(); return [o[0] + (px + 0.5) * c, o[1] + (py + 0.5) * c]; }
  function clampView() {
    if (!G.L) return; var c = cell(), bw = G.L.w * c, bh = G.L.h * c;
    var mx = Math.max(0, (bw - CW) / 2 + 30), my = Math.max(0, (bh - CH) / 2 + 30);
    view.ox = Math.max(-mx, Math.min(mx, view.ox)); view.oy = Math.max(-my, Math.min(my, view.oy));
    if (view.z <= 1.001) { view.ox = 0; view.oy = 0; }
  }
  function setZoom(z, cx, cy) {
    z = Math.max(1, Math.min(3.2, z)); if (cx === undefined) { cx = CW / 2; cy = CH / 2; }
    var c1 = cell(), o = origin(), bx = (cx - o[0]) / c1, by = (cy - o[1]) / c1;
    view.z = z; var c2 = cell();
    view.ox += cx - (CW / 2 - G.L.w * c2 / 2 + view.ox + bx * c2); view.oy += cy - (CH / 2 - G.L.h * c2 / 2 + view.oy + by * c2);
    clampView();
  }
  function samplePts(a) {
    var s = a.s, L = a.len, tr = a.traj, pts = [], i0 = Math.floor(s), f = s - i0;
    function at(i, ff) { var p = tr[Math.min(i, tr.length - 1)], q = tr[Math.min(i + 1, tr.length - 1)]; return [p[0] + (q[0] - p[0]) * ff, p[1] + (q[1] - p[1]) * ff]; }
    if (s >= 0) { pts.push(at(i0, f)); for (var i = i0 + 1; i <= i0 + L - 1; i++) pts.push(tr[Math.min(i, tr.length - 1)]); if (f > 0) pts.push(at(i0 + L - 1, f)); }
    else { for (var j = 0; j < L; j++) pts.push(tr[j]); var h = pts[L - 1], p = pts[L - 2]; pts[L - 1] = [h[0] + (h[0] - p[0]) * s, h[1] + (h[1] - p[1]) * s]; }
    return pts;
  }
  function midCell(i) { var cs = G.va[i].cells; if (cs.length % 2 === 0) { var a = cs[cs.length / 2 - 1], b = cs[cs.length / 2]; return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; } return cs[(cs.length - 1) / 2]; }
  function badgeCell(i) { var cs = G.va[i].cells; return cs[Math.max(0, Math.floor((cs.length - 2) / 2))]; }
  function clientOf(bx, by) { var p = toScreen(bx, by), r = cv.getBoundingClientRect(); return [r.left + p[0], r.top + p[1]]; }

  // ================= input =================
  var ptrs = {}, gesture = null;
  cv.addEventListener('pointerdown', function (e) {
    cv.setPointerCapture && cv.setPointerCapture(e.pointerId);
    ptrs[e.pointerId] = { x: e.offsetX, y: e.offsetY, sx: e.offsetX, sy: e.offsetY };
    var ids = Object.keys(ptrs);
    if (ids.length === 2) { var a = ptrs[ids[0]], b = ptrs[ids[1]]; gesture = { type: 'pinch', d0: Math.hypot(a.x - b.x, a.y - b.y), z0: view.z, moved: true }; }
    else if (ids.length === 1) gesture = { type: 'tap', moved: false, ox0: view.ox, oy0: view.oy };
    e.preventDefault();
  });
  cv.addEventListener('pointermove', function (e) {
    var p = ptrs[e.pointerId]; if (!p) return; p.x = e.offsetX; p.y = e.offsetY;
    var ids = Object.keys(ptrs);
    if (gesture && gesture.type === 'pinch' && ids.length >= 2) { var a = ptrs[ids[0]], b = ptrs[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y); setZoom(gesture.z0 * d / Math.max(20, gesture.d0), (a.x + b.x) / 2, (a.y + b.y) / 2); }
    else if (gesture && ids.length === 1) { var dx = p.x - p.sx, dy = p.y - p.sy; if (Math.hypot(dx, dy) > 10) gesture.moved = true; if (gesture.moved && view.z > 1.001) { view.ox = gesture.ox0 + dx; view.oy = gesture.oy0 + dy; clampView(); } }
  });
  function endPtr(e) {
    var p = ptrs[e.pointerId]; if (!p) return; delete ptrs[e.pointerId];
    if (gesture && gesture.type === 'tap' && !gesture.moved && Object.keys(ptrs).length === 0) handleTap(p.x, p.y);
    if (Object.keys(ptrs).length === 0) gesture = null;
  }
  cv.addEventListener('pointerup', endPtr);
  cv.addEventListener('pointercancel', function (e) { delete ptrs[e.pointerId]; if (!Object.keys(ptrs).length) gesture = null; });
  cv.addEventListener('wheel', function (e) { if (!G.L) return; e.preventDefault(); setZoom(view.z * (e.deltaY < 0 ? 1.12 : 0.89), e.offsetX, e.offsetY); }, { passive: false });
  function distSeg(px, py, ax, ay, bx, by) { var vx = bx - ax, vy = by - ay, l = vx * vx + vy * vy, tt = l ? Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / l)) : 0; return Math.hypot(px - ax - vx * tt, py - ay - vy * tt); }
  function boardXY(sx, sy) { var c = cell(), o = origin(); return [(sx - o[0]) / c - 0.5, (sy - o[1]) / c - 0.5]; }
  function pickSwitch(sx, sy) { var b = boardXY(sx, sy), sws = G.L.sw || []; for (var k = 0; k < sws.length; k++) if (Math.abs(b[0] - sws[k].x) <= 0.5 && Math.abs(b[1] - sws[k].y) <= 0.5) return k; return -1; }
  function pickArrow(sx, sy) {
    var c = cell(), b = boardXY(sx, sy), bx = b[0], by = b[1], best = -1, bd = 1e9;
    G.va.forEach(function (a, i) {
      if (!G.S.alive[i] || a.state === 'exit' || a.state === 'gone') return;
      var cs = a.cells, d = 1e9;
      for (var k = 0; k < cs.length - 1; k++) d = Math.min(d, distSeg(bx, by, cs[k][0], cs[k][1], cs[k + 1][0], cs[k + 1][1]));
      var h = cs[cs.length - 1]; d = Math.min(d, distSeg(bx, by, h[0], h[1], h[0] + DX[a.dir] * 0.45, h[1] + DY[a.dir] * 0.45));
      if (d < bd) { bd = d; best = i; }
    });
    return bd <= Math.max(0.62, 26 / c) ? best : -1;
  }
  function handleTap(sx, sy) {
    if (!G.L || G.over || cur !== 'game' || G.busy > 0) return;
    if (!G.hammer) { var k = pickSwitch(sx, sy); if (k >= 0) { pressSwitch(k); return; } }
    var i = pickArrow(sx, sy); if (i < 0) return;
    if (G.hammer) smash(i); else tapArrow(i);
  }

  // ================= gameplay =================
  var toastT = 0;
  function toast(msg) { var el = $('toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('show'); }, 1600); }
  function floatAt(cx, cy, text, cls) { var el = document.createElement('div'), ar = $('app').getBoundingClientRect(); el.className = 'float ' + (cls || ''); el.textContent = text; el.style.left = Math.max(90, Math.min(ar.width - 90, cx - ar.left)) + 'px'; el.style.top = (cy - ar.top) + 'px'; $('floats').appendChild(el); setTimeout(function () { el.remove(); }, 1150); }
  function floatBoard(bx, by, text, cls) { var p = clientOf(bx, by); floatAt(p[0], p[1], text, cls); }
  function burst(bx, by, col, n, sp) { for (var k = 0; k < n; k++) { var an = Math.random() * 6.283, s = (sp || 2.2) * (0.4 + Math.random()); G.parts.push({ x: bx, y: by, vx: Math.cos(an) * s, vy: Math.sin(an) * s, life: 0.45 + Math.random() * 0.35, t: 0, col: col, r: 0.05 + Math.random() * 0.07 }); } }
  function shards(bx, by, n) { for (var k = 0; k < n; k++) { var an = Math.random() * 6.283, s = 1.5 + Math.random() * 2.5; G.parts.push({ x: bx, y: by, vx: Math.cos(an) * s, vy: Math.sin(an) * s - 1, life: 0.6 + Math.random() * 0.3, t: 0, col: k % 2 ? '#E6FAFF' : '#81D4FA', r: 0.06 + Math.random() * 0.06, shard: 1, rot: Math.random() * 6 }); } }
  function addCoins(n, cx, cy) { save.coins += n; persist(); bumpCoins(); A.coin(); if (cx !== undefined) floatAt(cx, cy, '+' + n + ' 🪙', 'coin'); }
  function loseHeart() {
    G.hearts--; G.mistakes++; vib([30, 40, 30]); updateHud();
    var hs = $('hearts').children, hi = Math.max(0, G.hearts); if (hs[hi]) { hs[hi].classList.remove('lose'); void hs[hi].offsetWidth; hs[hi].classList.add('lose'); }
    if (G.hearts <= 0) { G.over = true; setTimeout(onLose, 650); }
  }
  function tapArrow(i) {
    var occ = C.occGrid(G.L, G.S), b = C.blockOf(G.L, G.S, i, occ), v = G.va[i];
    if (b && b.why === 'locked') { v.shake = 0.45; A.rattle(); vib(15); toast('🔒 ' + t('lockedMsg')); return; }
    if (b && b.why === 'ice') { v.shake = 0.3; A.icy(); vib(10); toast('❄️ ' + t('iceMsg')); var m = midCell(i); floatBoard(m[0], m[1], '❄ ' + G.S.ice[i], 'ice'); return; }
    if (b) {
      v.state = 'bump'; v.t = 0; v.flash = 1; v.bumpMax = Math.max(0.25, (b.dist || 1) - 0.55); A.bump(); G.combo = 0; showCombo();
      if (b.idx !== undefined) { var bx = b.idx % G.L.w, by = Math.floor(b.idx / G.L.w); G.sparks.push({ x: bx, y: by, t: 0 }); if (b.id !== undefined && G.va[b.id]) G.va[b.id].flash = 0.6; }
      G.shake = Math.max(G.shake, 0.12); var h = v.cells[v.cells.length - 1]; floatBoard(h[0], h[1], '-1 ♥', 'bad');
      loseHeart(); return;
    }
    escape(i);
  }
  function escape(i, silent) {
    var v = G.va[i], ev = C.applyRemove(G.L, G.S, i, false); G.S = ev.S;
    v.exitEnd = v.traj.length - v.len; v.state = 'exit'; v.t = 0; v.v = 6; v.s = 0;
    G.escapes++; if (G.tut) { G.tut = false; $('tut').classList.add('hidden'); $('tutBubble').classList.add('hidden'); }
    var now = performance.now(); G.combo = (now - G.comboT < 2300) ? G.combo + 1 : 1; G.comboT = now;
    A.escape(G.combo); vib(12); showCombo();
    var h = v.cells[v.cells.length - 1];
    if (G.combo >= 3) { var bonus = G.combo >= 5 ? 3 : 1; G.earned += bonus; save.coins += bonus; persist(); bumpCoins(); floatBoard(h[0], h[1], '+' + bonus + ' 🪙', 'coin'); }
    if (G.L.arrows[i].bomb && G.va[i]) { var mb = badgeCell(i); floatBoard(mb[0], mb[1], t('disarm'), 'combo'); A.disarm(); }
    handleEvents(i, ev);
    G.hint = null; updateHud(); checkWin();
  }
  function handleEvents(i, ev) {
    ev.unlocked.forEach(function (j) { var from = badgeCell(i), to = badgeCell(j); G.flyers.push({ from: [from[0], from[1]], to: [to[0], to[1]], t: 0, target: j, col: G.va[i].keyCol || PAIR[0] }); A.keyFly(); });
    ev.iceHit.forEach(function (j) { var vj = G.va[j], m = badgeCell(j); vj.crack = Math.min(3, (vj.crack || 0) + 1); vj.iceVis = G.S.ice[j]; vj.shake = 0.15; shards(m[0], m[1], 5); A.iceCrack(); });
    ev.iceBroke.forEach(function (j) { var m = midCell(j); shards(m[0], m[1], 18); A.iceBreak(); G.rings.push({ x: m[0], y: m[1], t: 0, col: '#81D4FA' }); });
    if (ev.ticked.length) A.tick(ev.ticked.some(function (b) { return G.S.bomb[b] <= 3; }));
    ev.exploded.forEach(function (b) {
      var m = badgeCell(b); G.S.bomb[b] = 3; burst(m[0], m[1], '#FF6A2D', 26, 4); burst(m[0], m[1], '#FFD23F', 14, 3); G.rings.push({ x: m[0], y: m[1], t: 0, col: '#FF5A2D', big: 1 });
      G.shake = 0.5; A.explode(); vib([60, 40, 90]); toast('💥 ' + t('boom')); floatBoard(m[0], m[1], '+3', 'bad');
      G.combo = 0; loseHeart();
    });
  }
  function smash(i) {
    var v = G.va[i]; save.inv.hammer = Math.max(0, (save.inv.hammer || 0) - 1); persist();
    var ev = C.applyRemove(G.L, G.S, i, true); G.S = ev.S; v.state = 'gone';
    v.cells.forEach(function (c) { burst(c[0], c[1], v.col, 5, 2.6); }); var m = midCell(i); G.rings.push({ x: m[0], y: m[1], t: 0, col: v.col, big: 1 });
    G.shake = 0.3; A.hammer(); vib([20, 30, 40]);
    handleEvents(i, ev); setHammer(false); G.hint = null; updateHud(); checkWin();
  }
  function pressSwitch(k) {
    G.S = C.applySwitch(G.L, G.S, k); G.swPress[k] = 0.25; A.flip(); vib(15);
    (G.L.sw[k].l || []).forEach(function (i) { if (!G.S.alive[i]) return; var keep = { appear: G.va[i].appear, flash: 0, shake: 0, crack: G.va[i].crack, lockVis: G.va[i].lockVis, iceVis: G.va[i].iceVis, keyCol: G.va[i].keyCol, lockCol: G.va[i].lockCol, ci: G.va[i].ci, col: G.va[i].col }; var nv = mkVis(i); for (var q in keep) nv[q] = keep[q]; nv.flipT = 0; G.va[i] = nv; });
    G.hint = null; updateHud();
  }
  function checkWin() { if (C.allGone(G.S) && !G.over) { G.over = true; setTimeout(onWin, 700); } }
  var comboTimer = 0;
  function showCombo() {
    var el = $('combo'); clearTimeout(comboTimer);
    if (G.combo >= 2) { el.textContent = G.combo >= 5 ? '🔥 x' + G.combo + '!' : t('combo') + ' x' + G.combo; el.classList.toggle('fire', G.combo >= 5); el.classList.add('show'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); comboTimer = setTimeout(function () { el.classList.remove('show'); }, 1300); }
    else el.classList.remove('show');
  }
  function setHammer(on) { G.hammer = on; $('tHammer').classList.toggle('active', on); var mb = $('modeBar'); mb.textContent = '🔨 ' + t('hammerMode'); mb.classList.toggle('hidden', !on); }
  function solveNow() { return C.solve(G.L, G.S, { limit: 80000 }); }
  function useHint() {
    if (!G.L || G.over) return;
    if ((save.inv.hint || 0) <= 0) { askBuy('hint'); return; }
    var r = solveNow(); if (!r.ok || !r.path.length) { toast(t('tryAgain')); return; }
    var mv = r.path[0]; G.hint = mv.t === 's' ? { sw: mv.i, t: 0 } : { id: mv.i, t: 0 };
    save.inv.hint--; persist(); A.hint(); updateHud();
  }
  function useHammer() { if (!G.L || G.over) return; if (G.hammer) { setHammer(false); return; } if ((save.inv.hammer || 0) <= 0) { askBuy('hammer'); return; } A.click(); setHammer(true); }
  function useWand() {
    if (!G.L || G.over || G.busy) return;
    if ((save.inv.wand || 0) <= 0) { askBuy('wand'); return; }
    var r = solveNow(), plan = [];
    if (r.ok) for (var k = 0; k < r.path.length && plan.filter(function (m) { return m.t === 'a'; }).length < 3; k++) plan.push(r.path[k]);
    else freeIds().slice(0, 3).forEach(function (i) { plan.push({ t: 'a', i: i }); });
    if (!plan.length) { toast(t('wandNone')); return; }
    save.inv.wand--; persist(); A.wand(); updateHud(); setHammer(false); G.busy = plan.length;
    plan.forEach(function (mv, q) { setTimeout(function () {
      G.busy--; if (G.over && !C.allGone(G.S)) return;
      if (mv.t === 's') pressSwitch(mv.i);
      else if (G.S.alive[mv.i] && !C.blockOf(G.L, G.S, mv.i, C.occGrid(G.L, G.S))) { var m = midCell(mv.i); G.rings.push({ x: m[0], y: m[1], t: 0, col: '#B57BFF' }); burst(m[0], m[1], '#FFE36E', 10, 2); escape(mv.i); }
    }, 120 + q * 300); });
  }
  var askFn = null;
  function askBuy(kind) {
    var price = { hint: 30, hammer: 60, wand: 80 }[kind], cap = kind.charAt(0).toUpperCase() + kind.slice(1);
    $('askTitle').textContent = t('buy' + cap + 'T'); $('askText').textContent = t('buy' + cap + 'X');
    var y = $('askYes'); y.innerHTML = '<i class="coin-ico"></i> ' + price; y.disabled = save.coins < price;
    if (save.coins < price) $('askText').textContent += ' (' + t('notEnough') + ')';
    askFn = function () { if (buyBooster(kind)) { $('askOv').classList.remove('show'); updateHud(); } };
    $('askOv').classList.add('show');
  }
  function buyBooster(kind) {
    var price = { hint: 30, hammer: 60, wand: 80 }[kind], qty = kind === 'hint' ? 3 : 1;
    if (save.coins < price) { toast(t('notEnough')); return false; }
    save.coins -= price; save.inv[kind] = (save.inv[kind] || 0) + qty; persist(); bumpCoins(); A.coin(); return true;
  }

  // ================= win / lose =================
  function hideOverlays() { ['winOv', 'loseOv', 'setOv', 'introOv', 'askOv', 'loadOv'].forEach(function (id) { $(id).classList.remove('show'); }); }
  function onWin() {
    var L = G.L, st = Math.max(1, G.hearts), reward = 0, first = false, badge = '', title = t('clear');
    if (G.mode === 'level') {
      first = !save.cleared[L.n]; var base = L.kind === 'boss' ? 80 : L.kind === 'hard' ? 45 : 25;
      var prev = save.stars[L.n] || 0; reward = first ? base + st * 5 : 5 + Math.max(0, st - prev) * 5;
      save.cleared[L.n] = 1; save.stars[L.n] = Math.max(prev, st); save.unlocked = Math.max(save.unlocked, Math.min(TOTAL, L.n + 1));
      if (L.kind !== 'normal') badge = L.kind === 'boss' ? '👑 ' + t('boss') : '🔥 ' + t('hard');
    } else if (G.mode === 'daily') {
      first = !save.daily[G.date]; reward = first ? 60 + st * 5 : 5; save.daily[G.date] = Math.max(save.daily[G.date] || 0, st);
      badge = '📅 ' + t('streakDays', streak()); title = t('dailyClear');
    } else { reward = 15 + G.stage * 2; save.endlessBest = Math.max(save.endlessBest || 0, G.stage); badge = '♾ ' + t('stage') + ' ' + G.stage; }
    persist();
    var bEl = $('winBadge'); bEl.textContent = badge; bEl.style.background = G.mode === 'daily' ? 'linear-gradient(90deg,#3D7BFF,#7C5CFF)' : L.kind === 'boss' ? 'linear-gradient(90deg,#7C3AED,#C026D3)' : G.mode === 'endless' ? 'linear-gradient(90deg,#14B8A6,#22A95B)' : 'linear-gradient(90deg,#FF7A1A,#FF3D57)';
    $('winTitle').textContent = title;
    $('winMsg').textContent = (G.mode === 'level' && L.n === TOTAL) ? t('allDone') : G.mistakes ? t('good', G.mistakes) : t('perfect');
    $('winCoins').innerHTML = '<i class="coin-ico"></i> +' + (reward + G.earned);
    $('wNext').textContent = G.mode === 'endless' ? t('endlessNext') : G.mode === 'daily' ? t('dailyBack') : t('next');
    $('wNext').classList.toggle('hidden', G.mode === 'level' && L.n >= TOTAL);
    var ss = $('winStars').children; for (var j = 0; j < 3; j++) ss[j].className = '';
    $('winOv').classList.add('show'); A.win(); confetti(L.kind === 'boss' ? 220 : 130);
    for (var q = 0; q < 3; q++) (function (q) { setTimeout(function () { ss[q].className = (q < st ? 'on ' : '') + 'pop'; if (q < st) A.click(); }, 280 + q * 220); })(q);
    setTimeout(function () { var r = $('winCoins').getBoundingClientRect(); addCoins(reward, r.left + r.width / 2 + 80, r.top + r.height / 2); refreshMenu(); }, 900);
  }
  function onLose() {
    A.lose(); var r = $('lRefill'); r.innerHTML = save.coins >= 40 ? '<i class="coin-ico"></i> ' + t('refill') : t('refillNo'); r.disabled = save.coins < 40;
    $('lRetry').textContent = t('retryFree'); $('loseOv').classList.add('show');
  }
  function refillHearts() { if (save.coins < 40) return; save.coins -= 40; persist(); bumpCoins(); A.coin(); G.hearts = 3; G.over = false; $('loseOv').classList.remove('show'); updateHud(); }
  function confetti(n) {
    var W = window.innerWidth, pal = themeObj().palette;
    for (var i = 0; i < n; i++) conf.push({ x: W / 2 + (Math.random() - 0.5) * 80, y: window.innerHeight * 0.35, vx: (Math.random() - 0.5) * 16, vy: -6 - Math.random() * 12, w: 6 + Math.random() * 6, h: 3 + Math.random() * 4, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, col: pal[i % pal.length], t: 0 });
  }

  // ================= mechanic intros =================
  function mechsOf(L) {
    var m = []; if ((L.walls || []).length) m.push('wall');
    if (L.arrows.some(function (a) { return a.k !== undefined && a.k >= 0; })) m.push('key');
    if (L.arrows.some(function (a) { return a.ice; })) m.push('ice');
    if (L.arrows.some(function (a) { return a.bomb; })) m.push('bomb');
    if ((L.sw || []).length) m.push('sw');
    return m;
  }
  var introQ = [];
  function maybeIntro() {
    if (cur !== 'game' || !G.L) return;
    introQ = mechsOf(G.L).filter(function (m) { return !save.seen[m]; });
    nextIntro();
  }
  function nextIntro() {
    if (!introQ.length) { $('introOv').classList.remove('show'); return; }
    var m = introQ[0]; drawIntroIcon(m);
    $('introTitle').textContent = t('m_' + m); $('introText').textContent = t('r_' + m); $('introOv').classList.add('show');
  }
  function drawIntroIcon(m) {
    var c2 = $('introIcon'), x = c2.getContext('2d'), W = c2.width, th = themeObj(), c = W / 3; x.clearRect(0, 0, W, W);
    x.fillStyle = th.css['--tile']; rr(x, 6, 6, W - 12, W - 12, 34); x.fill();
    var pts = [[c * 0.5, c * 2.2], [c * 1.5, c * 2.2], [c * 1.5, c * 1.2], [c * 2.5, c * 1.2]], col = th.palette[1];
    if (m === 'wall') { drawWall(x, c * 0.9, c * 0.9, c * 1.2, th); return; }
    if (m === 'sw') { drawSwitchTile(x, c * 0.75, c * 0.75, c * 1.5, 0.6, false); return; }
    drawRibbon(x, pts, m === 'bomb' ? th.palette[3] : col, c, 1, { th: th });
    if (m === 'key') { drawChain(x, pts, c, PAIR[0]); drawLockBadge(x, c * 1.5, c * 1.7, c * 0.42, PAIR[0]); }
    if (m === 'ice') { iceCoat(x, pts, c); drawIceBadge(x, c * 1.5, c * 1.7, c * 0.42, 2); }
    if (m === 'bomb') drawBombBadge(x, c * 1.5, c * 1.7, c * 0.42, 5, 0.6);
  }

  // ================= loop & render =================
  var last = performance.now();
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now; G.time += dt;
    if (cur === 'game' && G.L) { step(dt); render(); }
    renderFx(dt);
    requestAnimationFrame(frame);
  }
  function easeOut(k) { return 1 - (1 - k) * (1 - k); }
  function easeOutBack(k) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); }
  function step(dt) {
    G.va.forEach(function (a) {
      if (!a) return;
      if (a.appear < 1) a.appear = Math.min(1, a.appear + dt * 3.2);
      if (a.flipT < 1) a.flipT = Math.min(1, a.flipT + dt * 3.5);
      if (a.shake > 0) a.shake = Math.max(0, a.shake - dt);
      if (a.state === 'exit') {
        a.v = Math.min(34, a.v + dt * 70); a.s += a.v * dt; a.t += dt;
        if (Math.random() < 0.8) { var pts = samplePts(a), h = pts[pts.length - 1]; G.parts.push({ x: h[0], y: h[1], vx: (Math.random() - 0.5) * 0.8 - DX[a.dir] * 1.2, vy: (Math.random() - 0.5) * 0.8 - DY[a.dir] * 1.2, life: 0.4, t: 0, col: a.col, r: 0.05 + Math.random() * 0.05, trail: 1 }); }
        if (a.s >= a.exitEnd) a.state = 'gone';
      } else if (a.state === 'bump') {
        a.t += dt; var T1 = 0.11, T2 = 0.32;
        if (a.t < T1) a.s = a.bumpMax * easeOut(a.t / T1); else if (a.t < T2) a.s = a.bumpMax * (1 - easeOutBack((a.t - T1) / (T2 - T1))); else { a.s = 0; a.state = 'idle'; }
      }
      if (a.flash > 0) a.flash = Math.max(0, a.flash - dt * 2.2);
    });
    G.sparks = G.sparks.filter(function (s) { s.t += dt; return s.t < 0.6; });
    G.rings = G.rings.filter(function (s) { s.t += dt; return s.t < 0.6; });
    G.parts = G.parts.filter(function (p) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy *= 0.94; if (p.shard) p.vy += 4 * dt; return p.t < p.life; });
    G.flyers = G.flyers.filter(function (f) {
      f.t += dt * 2.2;
      if (f.t >= 1) { var v = G.va[f.target]; if (v) { v.lockVis = false; v.shake = 0.2; } burst(f.to[0], f.to[1], f.col, 16, 2.8); G.rings.push({ x: f.to[0], y: f.to[1], t: 0, col: f.col }); A.unlock(); return false; }
      return true;
    });
    for (var k in G.swPress) { G.swPress[k] -= dt; if (G.swPress[k] <= 0) delete G.swPress[k]; }
    if (G.shake > 0) G.shake = Math.max(0, G.shake - dt);
    if (G.hint) G.hint.t += dt;
    if (G.tut) placeTut();
  }
  function placeTut() { var f = freeIds(); if (!f.length) return; var m = midCell(f[0]), p = toScreen(m[0], m[1]), el = $('tut'); el.style.left = p[0] + 'px'; el.style.top = p[1] + 'px'; }
  function render() {
    var x = ctx, L = G.L, c = cell(), o = origin(), th = themeObj(), tm = G.time;
    x.setTransform(DPR, 0, 0, DPR, 0, 0); x.clearRect(0, 0, CW, CH);
    drawBoardBg(x, CW, CH, th, tm);
    if (G.shake > 0) { var m = G.shake * c * 0.22; x.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m); }
    var P = C.prep(L);
    for (var yy = 0; yy < L.h; yy++) for (var xx = 0; xx < L.w; xx++) { if (L.mask[yy].charAt(xx) !== '#') continue; var X = o[0] + xx * c, Y = o[1] + yy * c; if (P.wall[yy * L.w + xx]) drawWall(x, X, Y, c, th); else drawTile(x, X, Y, c, th); }
    (L.sw || []).forEach(function (s, k) {
      var X = o[0] + s.x * c, Y = o[1] + s.y * c, hl = G.hint && G.hint.sw === k ? 0.5 + 0.5 * Math.sin(G.hint.t * 7) : 0;
      if (hl) { x.save(); x.strokeStyle = SWC; x.globalAlpha = 0.5 + 0.5 * hl; x.lineWidth = c * 0.1; rr(x, X - c * 0.04, Y - c * 0.04, c * 1.08, c * 1.08, c * 0.26); x.stroke(); x.restore(); }
      drawSwitchTile(x, X, Y, c, 0.5 + 0.5 * Math.sin(tm * 3) + hl, !!G.swPress[k]);
    });
    if (G.hint && G.hint.id !== undefined) {
      var ha = G.va[G.hint.id];
      if (ha && G.S.alive[G.hint.id] && ha.state !== 'exit') {
        var hh = ha.cells[ha.cells.length - 1], pulse = 0.5 + 0.5 * Math.sin(G.hint.t * 7);
        x.save(); x.strokeStyle = ha.col; x.globalAlpha = 0.55 + 0.3 * pulse; x.lineWidth = c * 0.09; x.setLineDash([c * 0.14, c * 0.18]); x.lineCap = 'round';
        var s1 = toScreen(hh[0] + DX[ha.dir] * 0.6, hh[1] + DY[ha.dir] * 0.6), s2 = toScreen(hh[0] + DX[ha.dir] * (ha.rayLen + 0.6), hh[1] + DY[ha.dir] * (ha.rayLen + 0.6));
        x.beginPath(); x.moveTo(s1[0], s1[1]); x.lineTo(s2[0], s2[1]); x.stroke(); x.restore();
      }
    }
    var order = G.va.filter(function (a) { return a && a.state !== 'gone'; }).sort(function (a, b) { return (a.state === 'exit') - (b.state === 'exit'); });
    var pulseB = 0.5 + 0.5 * Math.sin(tm * 8);
    order.forEach(function (a) {
      var i = a.id, pts = samplePts(a).map(function (p) { return toScreen(p[0], p[1]); }), alpha = a.appear, exiting = a.state === 'exit';
      if (exiting) { var beyond = a.s - (a.len + a.rayLen - 1); alpha = Math.max(0, 1 - Math.max(0, beyond) / 3.2); }
      var sh = a.shake > 0 ? Math.sin(a.shake * 60) * c * 0.08 * Math.min(1, a.shake * 4) : 0;
      if (sh) pts = pts.map(function (p) { return [p[0] + sh, p[1]]; });
      var glow = (G.hint && G.hint.id === i) ? 0.6 + 0.4 * Math.sin(G.hint.t * 7) : exiting ? 0.8 : 0;
      var locked = !exiting && a.lockVis, frozen = !exiting && G.S.ice[i] > 0;
      if (a.appear < 1) { x.save(); var sc = 0.85 + 0.15 * easeOut(a.appear); x.translate(CW / 2, CH / 2); x.scale(sc, sc); x.translate(-CW / 2, -CH / 2); }
      var fl = a.flipT < 1 ? easeOut(a.flipT) : 1;
      drawRibbon(x, pts, a.col, c, alpha, { th: th, glow: glow, flash: a.flash, head: fl, tailHead: 1 - fl, dim: locked ? 0.35 : 0, t: tm });
      if (!exiting) {
        var bc = badgeCell(i), bp = toScreen(bc[0], bc[1]); bp[0] += sh;
        var lk = L.arrows[i];
        if (frozen) { iceCoat(x, pts, c); if (a.crack) { x.save(); x.strokeStyle = 'rgba(255,255,255,.9)'; x.lineWidth = c * 0.03; var mp = pts[Math.floor(pts.length / 2)]; for (var q = 0; q < a.crack * 2; q++) { var an = q * 2.1 + i; x.beginPath(); x.moveTo(mp[0], mp[1]); x.lineTo(mp[0] + Math.cos(an) * c * 0.3, mp[1] + Math.sin(an) * c * 0.3); x.stroke(); } x.restore(); } }
        if (locked) drawChain(x, pts, c, a.lockCol || PAIR[0], sh);
        if (lk.sw !== undefined && lk.sw >= 0) { var tp = pts[0]; drawRevMark(x, tp[0], tp[1], c); }
        if (locked) drawLockBadge(x, bp[0], bp[1], c * 0.27, a.lockCol || PAIR[0], 0);
        else if (frozen) drawIceBadge(x, bp[0], bp[1], c * 0.27, G.S.ice[i]);
        else if (G.S.bomb[i] > 0) drawBombBadge(x, bp[0], bp[1], c * 0.27, G.S.bomb[i], pulseB);
        if (lk.k !== undefined && lk.k >= 0 && G.S.alive[lk.k] && G.va[lk.k].lockVis) { var kc = midCell(i), kp = toScreen(kc[0], kc[1]); if (Math.hypot(kp[0] - bp[0], kp[1] - bp[1]) < c * 0.3) kp = toScreen(a.cells[a.cells.length - 1][0], a.cells[a.cells.length - 1][1]); if (!(G.S.bomb[i] > 0) && !frozen) drawKeyBadge(x, bp[0], bp[1], c * 0.25, a.keyCol); else drawKeyBadge(x, kp[0], kp[1], c * 0.22, a.keyCol); }
      }
      if (a.appear < 1) x.restore();
    });
    G.flyers.forEach(function (f) {
      var k = easeOut(Math.min(1, f.t)), bx = f.from[0] + (f.to[0] - f.from[0]) * k, by = f.from[1] + (f.to[1] - f.from[1]) * k - Math.sin(k * Math.PI) * 1.4, p = toScreen(bx, by);
      x.save(); x.shadowColor = f.col; x.shadowBlur = c * 0.6; drawKeyBadge(x, p[0], p[1], c * (0.28 + 0.08 * Math.sin(k * Math.PI)), f.col); x.restore();
    });
    G.sparks.forEach(function (s) {
      var p = toScreen(s.x, s.y), k = s.t / 0.6; x.save(); x.globalAlpha = 1 - k; x.strokeStyle = '#FF3B2F'; x.lineWidth = c * 0.08; x.beginPath(); x.arc(p[0], p[1], c * (0.25 + 0.35 * k), 0, 7); x.stroke();
      x.fillStyle = '#FFD23F'; for (var i = 0; i < 6; i++) { var an = i * 1.047 + k, r1 = c * (0.2 + 0.4 * k); x.beginPath(); x.arc(p[0] + Math.cos(an) * r1, p[1] + Math.sin(an) * r1, c * 0.05 * (1 - k), 0, 7); x.fill(); } x.restore();
    });
    G.rings.forEach(function (s) { var p = toScreen(s.x, s.y), k = s.t / 0.6; x.save(); x.globalAlpha = (1 - k) * 0.9; x.strokeStyle = s.col; x.lineWidth = c * 0.1 * (1 - k); x.beginPath(); x.arc(p[0], p[1], c * (s.big ? 0.4 + 1.6 * k : 0.3 + 0.8 * k), 0, 7); x.stroke(); x.restore(); });
    G.parts.forEach(function (p) {
      var s = toScreen(p.x, p.y), k = p.t / p.life; x.globalAlpha = 1 - k; x.fillStyle = p.col;
      if (p.shard) { x.save(); x.translate(s[0], s[1]); x.rotate(p.rot + k * 4); x.beginPath(); x.moveTo(0, -c * p.r * 1.4); x.lineTo(c * p.r, c * p.r); x.lineTo(-c * p.r, c * p.r * 0.6); x.closePath(); x.fill(); x.restore(); }
      else { if (p.trail) { x.shadowColor = p.col; x.shadowBlur = c * 0.3; } x.beginPath(); x.arc(s[0], s[1], c * p.r * (1 - k * 0.5), 0, 7); x.fill(); x.shadowBlur = 0; }
    });
    x.globalAlpha = 1;
  }
  var fxc = $('fx').getContext('2d');
  function renderFx(dt) {
    if (!conf.length) return;
    var W = window.innerWidth, H = window.innerHeight; fxc.setTransform(DPR, 0, 0, DPR, 0, 0); fxc.clearRect(0, 0, W, H);
    conf = conf.filter(function (p) { p.t += dt; p.vy += 22 * dt; p.x += p.vx * dt * 30; p.y += p.vy * dt * 30; p.vx *= 0.985; p.r += p.vr; return p.y < H + 20 && p.t < 4; });
    conf.forEach(function (p) { fxc.save(); fxc.translate(p.x, p.y); fxc.rotate(p.r); fxc.fillStyle = p.col; fxc.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); fxc.restore(); });
    if (!conf.length) fxc.clearRect(0, 0, W, H);
  }

  // ================= modes =================
  function playLevel(n) { n = Math.max(1, Math.min(TOTAL, n)); G.n = n; startLevel(LEVELS[n - 1], 'level'); }
  function withLoading(fn) { $('loadOv').classList.add('show'); setTimeout(function () { var L = fn(); $('loadOv').classList.remove('show'); return L; }, 60); }
  function playEndless(stage) { stage = stage || 1; withLoading(function () { G.stage = stage; var L = C.makeEndless(stage, (Date.now() & 0xffffff) ^ (stage * 7919)); startLevel(L, 'endless'); G.stage = stage; updateHud(); }); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function dkey(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function today() { return dkey(new Date()); }
  function fmtDate(s, short) { if (!s) return ''; var p = s.split('-'), d = +p[2], m = +p[1] - 1, y = +p[0]; return short ? d + ' ' + t('months')[m] : d + ' ' + t('months')[m] + ' ' + (save.lang === 'th' ? y + 543 : y); }
  function streak() { var d = new Date(), n = 0; if (!save.daily[dkey(d)]) d.setDate(d.getDate() - 1); while (save.daily[dkey(d)]) { n++; d.setDate(d.getDate() - 1); } return n; }
  var dailyCache = {};
  function dailyLevel(date) { if (!dailyCache[date]) dailyCache[date] = C.makeDaily(date); return dailyCache[date]; }
  function playDaily(date) { date = date || today(); withLoading(function () { var L = dailyLevel(date); G.date = date; startLevel(L, 'daily'); G.date = date; updateHud(); }); }
  function restart() { if (!G.L) return; A.click(); if (G.mode === 'level') playLevel(G.L.n); else { var L = G.L, st = G.stage, dt = G.date; L._p = null; startLevel(L, G.mode); G.stage = st; G.date = dt; updateHud(); } }
  function nextAfterWin() {
    hideOverlays();
    if (G.mode === 'endless') playEndless(G.stage + 1);
    else if (G.mode === 'daily') show('daily');
    else if (G.L.n < TOTAL) playLevel(G.L.n + 1); else show('levels');
  }

  // ================= level select =================
  function maskIcon(L) {
    if (L.shape === 'full') return ''; var r = '';
    for (var y = 0; y < L.h; y++) for (var x = 0; x < L.w; x++) if (L.mask[y].charAt(x) === '#') r += '<rect x="' + x + '" y="' + y + '" width="1.02" height="1.02"/>';
    return '<svg class="shape" viewBox="0 0 ' + L.w + ' ' + L.h + '">' + r + '</svg>';
  }
  function buildLevelGrid() {
    var g = $('lvGrid'); g.innerHTML = ''; var total = 0;
    for (var n = 1; n <= TOTAL; n++) {
      var b = document.createElement('button'), st = save.stars[n] || 0, L = LEVELS[n - 1], k = L.kind; total += st;
      b.className = 'lv' + (n > save.unlocked ? ' locked' : '') + (n === save.unlocked ? ' current' : '') + (k !== 'normal' ? ' ' + k + ' has-tag' : '');
      var stars = ''; for (var i = 0; i < 3; i++) stars += i < st ? '★' : '<i>★</i>';
      var tag = k !== 'normal' ? '<span class="tag ' + k + '">' + (k === 'boss' ? '👑 ' + t('tagBoss') : t('tagHard')) + '</span>' : '';
      b.innerHTML = maskIcon(L) + (n > save.unlocked ? '<svg viewBox="0 0 24 24" style="width:20px;height:20px;opacity:.7"><path d="M7 10V8a5 5 0 0 1 10 0v2h1v10H6V10h1Zm2 0h6V8a3 3 0 0 0-6 0v2Z"/></svg>' : '<span>' + n + '</span><span class="st">' + stars + '</span>') + tag;
      (function (n) { b.addEventListener('click', function () { if (n <= save.unlocked) { A.click(); playLevel(n); } }); })(n);
      g.appendChild(b);
    }
    $('totalStars').textContent = total;
  }

  // ================= shop =================
  function priceBtn(owned, using, price) {
    if (using) return '<span class="sbtn using">✓ ' + t('using') + '</span>';
    if (owned) return '<span class="sbtn equip">' + t('equip') + '</span>';
    return '<span class="sbtn buy"><i class="coin-ico"></i>' + price + '</span>';
  }
  function setPreview(kind, id) { preview = { kind: kind, id: id }; drawShopPreview(); }
  function drawShopPreview() {
    var thId = preview && preview.kind === 'theme' ? preview.id : save.theme, fin = preview && preview.kind === 'finish' ? preview.id : save.finish;
    drawDemo($('shopPreview'), thId, fin, { bg: true, badges: true });
    $('pvLabel').textContent = t('th_' + thId) + ' · ' + t('f_' + fin);
  }
  function buildShop() {
    var tg = $('themeGrid'); tg.innerHTML = '';
    THEME_IDS.forEach(function (id) {
      var th = THEMES[id], owned = !!save.ownedThemes[id], using = save.theme === id, el = document.createElement('button');
      el.className = 'sitem' + (using ? ' sel' : ''); el.setAttribute('data-theme', id);
      el.innerHTML = '<canvas width="240" height="120"></canvas><div class="nm">' + t('th_' + id) + '</div>' + priceBtn(owned, using, th.price);
      tg.appendChild(el); drawDemo(el.querySelector('canvas'), id, save.finish, { bg: true });
      el.addEventListener('click', function () { A.click(); setPreview('theme', id); buyOrEquip('theme', id); });
    });
    var fg = $('finishGrid'); fg.innerHTML = '';
    FINISH_IDS.forEach(function (id) {
      var f = FINISHES[id], owned = !!save.ownedFinishes[id], using = save.finish === id, el = document.createElement('button');
      el.className = 'sitem' + (using ? ' sel' : ''); el.setAttribute('data-finish', id);
      el.innerHTML = '<canvas width="240" height="120"></canvas><div class="nm">' + t('f_' + id) + '</div>' + priceBtn(owned, using, f.price);
      fg.appendChild(el); drawDemo(el.querySelector('canvas'), save.theme, id, { bg: true });
      el.addEventListener('click', function () { A.click(); setPreview('finish', id); buyOrEquip('finish', id); });
    });
    var bl = $('boosterList'); bl.innerHTML = '';
    [['hint', 'hintPack', 'hintPackD', 30, '💡'], ['hammer', 'hammer', 'hammerD', 60, '🔨'], ['wand', 'wand', 'wandD', 80, '🪄']].forEach(function (b) {
      var el = document.createElement('div'); el.className = 'brow';
      el.innerHTML = '<div class="bi">' + b[4] + '</div><div class="bt">' + t(b[1]) + ' <small>' + t(b[2]) + ' · ' + t('owned') + ' ' + (save.inv[b[0]] || 0) + '</small></div><button class="sbtn buy" data-buy="' + b[0] + '"><i class="coin-ico"></i>' + b[3] + '</button>';
      el.querySelector('button').addEventListener('click', function () { if (buyBooster(b[0])) { toast(t('bought')); buildShop(); } else { A.bump(); flashCoins(); } });
      bl.appendChild(el);
    });
    drawShopPreview();
  }
  function flashCoins() { qa('.coin-pill').forEach(function (el) { el.classList.remove('deny'); void el.offsetWidth; el.classList.add('deny'); }); shopToast(t('notEnough')); }
  function shopToast(msg) { var r = $('app').getBoundingClientRect(); floatAt(r.left + r.width / 2, r.top + 90, msg, 'bad'); }
  function buyOrEquip(kind, id) {
    var owned = kind === 'theme' ? save.ownedThemes : save.ownedFinishes, price = (kind === 'theme' ? THEMES[id] : FINISHES[id]).price;
    if (!owned[id]) {
      if (save.coins < price) { A.bump(); flashCoins(); return; }
      save.coins -= price; owned[id] = 1; A.coin(); bumpCoins(); var r = $('app').getBoundingClientRect(); floatAt(r.left + r.width / 2, r.top + 90, t('bought'), 'coin'); confetti(40);
    }
    if (kind === 'theme') save.theme = id; else save.finish = id;
    persist(); preview = null; applyTheme(); refreshToggles(); buildShop();
  }

  // ================= daily =================
  function buildDaily() {
    var td = today(), st = streak(); $('streakNum').textContent = st; $('dlDate').textContent = fmtDate(td);
    var cal = $('cal'); cal.innerHTML = ''; var d0 = new Date(); d0.setDate(d0.getDate() - 3);
    for (var i = 0; i < 7; i++) {
      var d = new Date(d0); d.setDate(d0.getDate() + i); var k = dkey(d), el = document.createElement('div');
      el.className = 'd' + (save.daily[k] ? ' done' : '') + (k === td ? ' today' : '') + (k > td ? ' future' : '');
      el.innerHTML = '<small>' + t('days')[d.getDay()] + '</small>' + d.getDate() + (save.daily[k] ? '<span class="ck">✓</span>' : '');
      cal.appendChild(el);
    }
    var meta = $('dlMeta'); meta.innerHTML = '<span class="chip">⏳</span>';
    $('btnDailyPlay').textContent = save.daily[td] ? t('playAgain') : t('playToday');
    setTimeout(function () {
      var L = dailyLevel(td), ms = mechsOf(L), ic = { wall: '🪨', key: '🔑', ice: '❄️', bomb: '💣', sw: '⇄' };
      meta.innerHTML = '<span class="chip">' + L.w + '×' + L.h + '</span><span class="chip">' + t('arrowsN', L.arrows.length) + '</span>' + ms.map(function (m) { return '<span class="chip">' + ic[m] + ' ' + t('m_' + m) + '</span>'; }).join('');
    }, 30);
  }

  // ================= wiring =================
  function on(id, fn) { $(id).addEventListener('click', fn); }
  on('btnPlay', function () { A.click(); playLevel(Math.min(save.unlocked, TOTAL)); });
  on('btnLevels', function () { A.click(); show('levels'); });
  on('btnEndless', function () { A.click(); playEndless(1); });
  on('btnShop', function () { A.click(); preview = null; show('shop'); });
  on('btnDaily', function () { A.click(); show('daily'); });
  on('btnDailyPlay', function () { A.click(); playDaily(today()); });
  qa('.back').forEach(function (b) { b.addEventListener('click', function () { A.click(); preview = null; show('menu'); }); });
  on('gBack', function () { A.click(); hideOverlays(); setHammer(false); show(G.mode === 'daily' ? 'daily' : 'menu'); });
  on('tHint', useHint); on('tHammer', useHammer); on('tWand', useWand); on('tRestart', restart);
  on('tSettings', function () { A.click(); refreshToggles(); $('setOv').classList.add('show'); });
  on('menuSettings', function () { A.click(); refreshToggles(); $('setOv').classList.add('show'); });
  on('sClose', function () { A.click(); $('setOv').classList.remove('show'); });
  on('sMusic', function () { save.music = !save.music; persist(); refreshToggles(); A.click(); });
  on('sSfx', function () { save.sfx = !save.sfx; persist(); refreshToggles(); A.click(); });
  on('sVib', function () { save.vib = !save.vib; persist(); refreshToggles(); vib(20); });
  on('sDark', function () { if (save.theme !== 'ivory') return; save.dark = !save.dark; persist(); refreshToggles(); applyTheme(); });
  qa('#sLang button').forEach(function (b) { b.addEventListener('click', function () { save.lang = b.getAttribute('data-v'); persist(); applyLang(); A.click(); }); });
  $('setOv').addEventListener('click', function (e) { if (e.target === this) this.classList.remove('show'); });
  on('introOk', function () { A.click(); var m = introQ.shift(); if (m) { save.seen[m] = 1; persist(); } nextIntro(); });
  on('askYes', function () { A.click(); if (askFn) askFn(); });
  on('askNo', function () { A.click(); $('askOv').classList.remove('show'); });
  on('wNext', function () { A.click(); nextAfterWin(); });
  on('wReplay', function () { hideOverlays(); restart(); });
  on('wMenu', function () { A.click(); hideOverlays(); show('menu'); });
  on('lRefill', refillHearts);
  on('lRetry', function () { hideOverlays(); restart(); });
  on('lMenu', function () { A.click(); hideOverlays(); show('menu'); });
  on('zIn', function () { if (G.L) setZoom(view.z * 1.3); });
  on('zOut', function () { if (G.L) setZoom(view.z / 1.3); });
  on('zFit', function () { view.z = 1; view.ox = 0; view.oy = 0; });
  window.addEventListener('resize', resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe($('boardWrap'));
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && cur !== 'menu') { hideOverlays(); show('menu'); } });
  window.addEventListener('popstate', function () { if (cur !== 'menu') { hideOverlays(); show('menu'); history.pushState({ zr: 1 }, ''); } });
  try { history.pushState({ zr: 1 }, ''); } catch (e) {}
  document.addEventListener('visibilitychange', function () { if (document.hidden) A.setMusic(false); else A.setMusic(save.music); });

  // ================= boot =================
  applyTheme(); applyLang(); refreshToggles(); refreshCoins();
  var fill = $('loadfill'), p0 = performance.now(), fontsReady = false;
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { fontsReady = true; drawLogo(); });
  (function boot() {
    var k = Math.min(1, (performance.now() - p0) / 1300); fill.style.width = (k * 100) + '%';
    if (k < 1 || (!fontsReady && performance.now() - p0 < 3000)) return requestAnimationFrame(boot);
    show('menu');
  })();
  requestAnimationFrame(frame);

  // ================= test hooks =================
  window.ZR = {
    G: G, save: save, levels: LEVELS, C: C, screen: function () { return cur; },
    play: playLevel, endless: playEndless, daily: playDaily, today: today, streak: streak, freeIds: freeIds, blockedIds: blockedIds, persist: persist,
    arrowPoint: function (id) { var m = badgeCell(id), cs = G.va[id].cells; if (cs.length >= 2) { var a = cs[0], b = cs[1]; m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; } return clientOf(m[0], m[1]); },
    switchPoint: function (k) { var s = G.L.sw[k]; return clientOf(s.x, s.y); },
    next: function () { var r = C.solve(G.L, G.S, { limit: 80000 }); return r.ok ? r.path[0] : null; },
    music: function () { return A.musicPlaying(); },
    find: function (pred) { for (var i = 0; i < LEVELS.length; i++) if (pred(LEVELS[i])) return i + 1; return -1; },
    idle: function () { return !G.busy && !G.flyers.length && G.va.every(function (a) { return !a || a.state === 'idle' || a.state === 'gone'; }); },
    view: view
  };
})();
