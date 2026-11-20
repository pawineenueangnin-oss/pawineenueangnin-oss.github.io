/* Zoomrow synthesized SFX — WebAudio only, no external audio files */
(function () {
  'use strict';
  var ctx = null, master = null, enabled = true, noiseBuf = null;
  var PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28, 31];
  function ensure() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
      master = ctx.createGain(); master.gain.value = 0.55;
      var comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function unlock() { ensure(); }
  ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, unlock, { passive: true, capture: true }); });
  function tone(freq, t0, dur, type, vol, slideTo) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noise(t0, dur, f0, f1, vol, q) {
    var s = ctx.createBufferSource(); s.buffer = noiseBuf;
    var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = q || 1.2;
    f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + dur * 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t0); s.stop(t0 + dur + 0.05);
  }
  function midi(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  var S = {
    setEnabled: function (v) { enabled = !!v; },
    escape: function (combo) {
      if (!enabled || !ensure()) return; var t = ctx.currentTime;
      var step = PENTA[Math.min(PENTA.length - 1, Math.max(0, combo - 1))];
      var f = midi(72 + step);
      noise(t, 0.28, 700, 5200, 0.22, 0.9);
      tone(f, t + 0.02, 0.22, 'triangle', 0.32);
      tone(f * 2, t + 0.05, 0.16, 'sine', 0.10);
    },
    bump: function () {
      if (!enabled || !ensure()) return; var t = ctx.currentTime;
      tone(150, t, 0.18, 'sine', 0.5, 70);
      noise(t, 0.09, 380, 160, 0.25, 2.5);
    },
    hint: function () {
      if (!enabled || !ensure()) return; var t = ctx.currentTime;
      tone(midi(88), t, 0.5, 'sine', 0.22); tone(midi(93), t + 0.09, 0.6, 'sine', 0.18); tone(midi(100), t + 0.18, 0.5, 'sine', 0.08);
    },
    click: function () { if (!enabled || !ensure()) return; var t = ctx.currentTime; tone(1200, t, 0.05, 'triangle', 0.12, 900); },
    win: function () {
      if (!enabled || !ensure()) return; var t = ctx.currentTime + 0.05;
      [72, 76, 79, 84, 79, 84, 88].forEach(function (m, i) { var dt = i < 4 ? i * 0.11 : 0.44 + (i - 4) * 0.13; tone(midi(m), t + dt, 0.32, 'triangle', 0.26); tone(midi(m - 12), t + dt, 0.3, 'sine', 0.12); });
      tone(midi(91), t + 0.9, 0.9, 'sine', 0.16);
    },
    lose: function () { if (!enabled || !ensure()) return; var t = ctx.currentTime; [67, 63, 60].forEach(function (m, i) { tone(midi(m), t + i * 0.16, 0.3, 'triangle', 0.22); }); }
  };
  window.ZRAudio = S;
})();
