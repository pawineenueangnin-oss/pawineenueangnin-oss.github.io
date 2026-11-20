/* Zoomrow v2 audio — synthesized SFX + procedural kalimba ambient music (WebAudio only) */
(function () {
  'use strict';
  var ctx = null, sfxBus = null, musBus = null, noiseBuf = null, sfxOn = true, musOn = true, musTimer = null, nextT = 0, step = 0, bar = 0;
  var PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28, 31];
  function ensure() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
      var comp = ctx.createDynamicsCompressor(); comp.connect(ctx.destination);
      sfxBus = ctx.createGain(); sfxBus.gain.value = 0.55; sfxBus.connect(comp);
      musBus = ctx.createGain(); musBus.gain.value = 0.0; musBus.connect(comp);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function unlock() { if (!ensure()) return; if (musOn) startMusic(); }
  ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, unlock, { passive: true, capture: true }); });
  document.addEventListener('visibilitychange', function () { if (!ctx) return; if (document.hidden) ctx.suspend(); else ctx.resume(); });
  function tone(freq, t0, dur, type, vol, slideTo, bus) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(bus || sfxBus); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noise(t0, dur, f0, f1, vol, q, type) {
    var s = ctx.createBufferSource(); s.buffer = noiseBuf;
    var f = ctx.createBiquadFilter(); f.type = type || 'bandpass'; f.Q.value = q || 1.2;
    f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(0.03, dur * 0.25)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t0); s.stop(t0 + dur + 0.05);
  }
  function midi(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function ok() { return sfxOn && ensure(); }
  // ---- kalimba ambient ----
  var CHORDS = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 52, 55, 60], [55, 59, 62, 67]]; // Am F C G
  var SCALE = [69, 72, 74, 76, 79, 81, 84, 86, 88];
  function kalimba(f, t, vol) {
    var o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), g2 = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 2600;
    o.type = 'sine'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 5.4;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
    g2.gain.setValueAtTime(0.0001, t); g2.gain.exponentialRampToValueAtTime(vol * 0.25, t + 0.003); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(g); o2.connect(g2); g.connect(lp); g2.connect(lp); lp.connect(musBus);
    o.start(t); o2.start(t); o.stop(t + 1.6); o2.stop(t + 0.2);
  }
  function pad(ch, t, dur) { ch.slice(0, 3).forEach(function (m) { var o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.value = midi(m - 12); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.035, t + 0.8); g.gain.linearRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(musBus); o.start(t); o.stop(t + dur + 0.1); }); }
  var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  function schedule() {
    if (!ctx) return;
    var spb = 60 / 84 / 2; // eighth notes @84bpm
    while (nextT < ctx.currentTime + 0.25) {
      var ch = CHORDS[bar % 4];
      if (step % 16 === 0) pad(ch, nextT, spb * 16);
      var pat = [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0];
      if (pat[step % 16] && rnd() < 0.85) {
        var pool = SCALE.filter(function (m) { return ch.some(function (c) { return (m - c) % 12 === 0; }) || rnd() < 0.35; });
        var m = pool[Math.floor(rnd() * pool.length)] || 72;
        kalimba(midi(m), nextT, 0.10 + rnd() * 0.05);
      }
      if (step % 8 === 0) kalimba(midi(ch[0] - 12), nextT, 0.08);
      nextT += spb; step++; if (step % 16 === 0) bar++;
    }
  }
  function startMusic() {
    if (!ensure() || musTimer) return;
    nextT = ctx.currentTime + 0.1; musBus.gain.cancelScheduledValues(ctx.currentTime); musBus.gain.setTargetAtTime(0.55, ctx.currentTime, 0.6);
    musTimer = setInterval(schedule, 90); schedule();
  }
  function stopMusic() { if (!ctx || !musTimer) { musTimer = null; return; } clearInterval(musTimer); musTimer = null; musBus.gain.setTargetAtTime(0.0, ctx.currentTime, 0.2); }
  var S = {
    setSfx: function (v) { sfxOn = !!v; },
    setMusic: function (v) { musOn = !!v; if (musOn) { if (ctx) startMusic(); } else stopMusic(); },
    musicPlaying: function () { return !!musTimer; },
    escape: function (combo) { if (!ok()) return; var t = ctx.currentTime, f = midi(72 + PENTA[Math.min(PENTA.length - 1, Math.max(0, combo - 1))]); noise(t, 0.28, 700, 5200, 0.2, 0.9); tone(f, t + 0.02, 0.24, 'triangle', 0.3); tone(f * 2, t + 0.05, 0.18, 'sine', 0.1); if (combo >= 3) tone(f * 1.5, t + 0.09, 0.2, 'sine', 0.08); },
    bump: function () { if (!ok()) return; var t = ctx.currentTime; tone(150, t, 0.18, 'sine', 0.5, 70); noise(t, 0.09, 380, 160, 0.25, 2.5); },
    rattle: function () { if (!ok()) return; var t = ctx.currentTime; for (var i = 0; i < 4; i++) { noise(t + i * 0.055, 0.05, 3200, 2400, 0.16, 6, 'bandpass'); tone(1900 + i * 140, t + i * 0.055, 0.04, 'square', 0.03); } },
    icy: function () { if (!ok()) return; var t = ctx.currentTime; [2600, 3100, 2800].forEach(function (f, i) { tone(f, t + i * 0.04, 0.12, 'sine', 0.08); }); noise(t, 0.12, 6000, 4000, 0.08, 4, 'highpass'); },
    iceCrack: function () { if (!ok()) return; var t = ctx.currentTime; noise(t, 0.16, 5200, 1800, 0.3, 3, 'bandpass'); tone(1800, t, 0.12, 'triangle', 0.08, 900); },
    iceBreak: function () { if (!ok()) return; var t = ctx.currentTime; noise(t, 0.4, 7000, 1500, 0.35, 1.5, 'bandpass'); [88, 91, 95, 100].forEach(function (m, i) { tone(midi(m), t + i * 0.05, 0.3, 'sine', 0.09); }); },
    tick: function (urgent) { if (!ok()) return; var t = ctx.currentTime; tone(urgent ? 1400 : 1000, t, 0.06, 'square', urgent ? 0.07 : 0.04); },
    explode: function () { if (!ok()) return; var t = ctx.currentTime; noise(t, 0.9, 1200, 60, 0.7, 0.6, 'lowpass'); tone(90, t, 0.6, 'sine', 0.7, 35); tone(55, t + 0.05, 0.8, 'triangle', 0.4, 30); },
    disarm: function () { if (!ok()) return; var t = ctx.currentTime; [84, 88, 91, 96].forEach(function (m, i) { tone(midi(m), t + i * 0.06, 0.25, 'sine', 0.12); }); },
    keyFly: function () { if (!ok()) return; var t = ctx.currentTime; tone(midi(84), t, 0.45, 'sine', 0.12, midi(96)); noise(t, 0.4, 2000, 8000, 0.06, 1); },
    unlock: function () { if (!ok()) return; var t = ctx.currentTime; tone(2200, t, 0.05, 'square', 0.05); noise(t + 0.03, 0.25, 4000, 1200, 0.25, 2); [79, 86].forEach(function (m, i) { tone(midi(m), t + 0.06 + i * 0.07, 0.3, 'triangle', 0.16); }); },
    flip: function () { if (!ok()) return; var t = ctx.currentTime; tone(600, t, 0.05, 'square', 0.06); tone(midi(76), t + 0.03, 0.18, 'triangle', 0.18, midi(83)); noise(t, 0.2, 900, 3000, 0.1, 1); },
    hammer: function () { if (!ok()) return; var t = ctx.currentTime; tone(120, t, 0.25, 'sine', 0.7, 45); noise(t, 0.35, 3000, 400, 0.45, 0.8); tone(midi(96), t + 0.05, 0.2, 'triangle', 0.08); },
    wand: function () { if (!ok()) return; var t = ctx.currentTime; for (var i = 0; i < 6; i++) tone(midi(84 + PENTA[i]), t + i * 0.05, 0.3, 'sine', 0.09); },
    hint: function () { if (!ok()) return; var t = ctx.currentTime; tone(midi(88), t, 0.5, 'sine', 0.22); tone(midi(93), t + 0.09, 0.6, 'sine', 0.18); tone(midi(100), t + 0.18, 0.5, 'sine', 0.08); },
    coin: function () { if (!ok()) return; var t = ctx.currentTime; tone(midi(95), t, 0.08, 'square', 0.05); tone(midi(100), t + 0.07, 0.25, 'square', 0.05); },
    click: function () { if (!ok()) return; var t = ctx.currentTime; tone(1200, t, 0.05, 'triangle', 0.12, 900); },
    win: function () { if (!ok()) return; var t = ctx.currentTime + 0.05; [72, 76, 79, 84, 79, 84, 88].forEach(function (m, i) { var dt = i < 4 ? i * 0.11 : 0.44 + (i - 4) * 0.13; tone(midi(m), t + dt, 0.32, 'triangle', 0.26); tone(midi(m - 12), t + dt, 0.3, 'sine', 0.12); }); tone(midi(91), t + 0.9, 0.9, 'sine', 0.16); },
    lose: function () { if (!ok()) return; var t = ctx.currentTime; [67, 63, 60].forEach(function (m, i) { tone(midi(m), t + i * 0.16, 0.3, 'triangle', 0.22); }); }
  };
  window.ZRAudio = S;
})();
