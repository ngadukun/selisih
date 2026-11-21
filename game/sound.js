// SELISIH — sound synth.
// Every sound is synthesised with WebAudio oscillators; no audio files.
// The context is created lazily on the first user gesture so browsers
// allow it. Mute state lives in localStorage.
(function (global) {
  'use strict';

  var S = (global.SELISIH = global.SELISIH || {});
  var ctx = null;
  var muted = false;
  try { muted = global.localStorage && global.localStorage.getItem('selisih-muted') === '1'; } catch (e) { muted = false; }

  function ac() {
    if (!ctx) {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol, when, slideTo) {
    if (muted) return;
    var c = ac();
    if (!c) return;
    var t0 = c.currentTime + (when || 0);
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.15, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }

  var sound = {
    isMuted: function () { return muted; },
    setMuted: function (m) {
      muted = !!m;
      try { if (global.localStorage) global.localStorage.setItem('selisih-muted', muted ? '1' : '0'); } catch (e) {}
      return muted;
    },
    toggleMuted: function () { return sound.setMuted(!muted); },
    // Soft click when the player checks a spot.
    click: function () { tone(660, 0.07, 'triangle', 0.08); },
    // Two-note chime when a difference is found.
    chime: function () { tone(784, 0.18, 'sine', 0.16); tone(1175, 0.3, 'sine', 0.16, 0.09); },
    // Low buzz for a wrong click.
    buzz: function () { tone(160, 0.28, 'sawtooth', 0.1, 0, 110); },
    // Small arpeggio on scene complete.
    arpeggio: function () {
      var notes = [523, 659, 784, 1047];
      for (var i = 0; i < notes.length; i++) tone(notes[i], 0.22, 'triangle', 0.14, i * 0.11);
    },
    // Jingle on game complete.
    jingle: function () {
      var notes = [523, 659, 784, 1047, 784, 1047, 1319];
      for (var i = 0; i < notes.length; i++) tone(notes[i], 0.24, 'triangle', 0.14, i * 0.12);
    },
    hint: function () { tone(880, 0.12, 'sine', 0.1); tone(1108, 0.16, 'sine', 0.1, 0.08); },
  };

  S.sound = sound;
})(typeof globalThis !== 'undefined' ? globalThis : this);
