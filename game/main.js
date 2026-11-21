// SELISIH — main loop.
// Owns the game object (screen, run, progress, effects), the canvas
// rendering of the two pictures, the timer, and the ?shot= staging used
// for deterministic screenshots. Normal play never touches staging.
(function (global) {
  'use strict';

  var S = (global.SELISIH = global.SELISIH || {});
  var PW = S.PICTURE_W, PH = S.PICTURE_H;
  var GAP = 20, TOP = 30;
  var CANVAS_W = PW * 2 + GAP, CANVAS_H = PH + TOP + 10;

  var game = {
    screen: 'menu',      // menu | playing | paused | complete | gamecomplete
    progress: null,
    run: null,           // current scene run (state.js)
    foundSpots: [],      // {x, y, r} per found difference, in find order
    effects: [],         // transient canvas effects {kind, x, y, t0}
    hintPulse: null,     // {index, t0}
    sessionTime: 0,      // seconds across finished scenes this session
    frozen: false,       // shot staging: render once, timer stopped
    lastTs: 0,
    canvas: null,
    ctx: null,
    input: null,
  };

  function layout() {
    return { leftX: 0, rightX: PW + GAP, y: TOP, scale: 1 };
  }

  // ---- scene flow -------------------------------------------------

  function startScene(id) {
    var scene = S.scenes[id];
    if (!scene) return;
    game.run = S.state.newSceneRun(scene);
    game.foundSpots = [];
    game.effects = [];
    game.hintPulse = null;
    game.screen = 'playing';
    S.hud.showPlaying();
    S.hud.updateHUD(game.run);
    S.hud.announce(scene.name + ': find ' + scene.diffs.length + ' differences.');
  }

  function completeScene() {
    var result = S.state.finishScene(game.progress, game.run);
    game.sessionTime += result.time;
    game.screen = 'complete';
    S.sound.arpeggio();
    var hasNext = game.run.scene.id + 1 < S.scenes.length;
    S.hud.updateHUD(game.run);
    S.hud.showComplete(result, game.run, hasNext);
    S.hud.announce(game.run.scene.name + ' complete! ' + result.stars + ' stars, score ' + result.score + '.');
    game.completeResult = result;
  }

  function showGameComplete() {
    game.screen = 'gamecomplete';
    S.sound.jingle();
    var totalTime = game.sessionTime;
    S.hud.showGameComplete(game.progress.totalScore, totalTime);
    S.hud.announce('Game complete! Total score ' + game.progress.totalScore + '.');
  }

  function toMenu() {
    game.screen = 'menu';
    game.run = null;
    S.hud.showMenu(game.progress);
  }

  // ---- play actions ------------------------------------------------

  function checkSpot(x, y) {
    if (game.screen !== 'playing' || !game.run || game.frozen) return null;
    S.sound.click();
    var res = S.state.checkSpot(game.run, x, y);
    if (res.result === 'found') {
      var spot = game.run.spots[res.index].spots[0];
      // Ring where the player actually clicked: nearest hit spot.
      var best = spot, bd = Infinity;
      game.run.spots[res.index].spots.forEach(function (s) {
        var d = (x - s.x) * (x - s.x) + (y - s.y) * (y - s.y);
        if (d < bd) { bd = d; best = s; }
      });
      game.foundSpots.push({ x: best.x, y: best.y, r: best.r, n: game.foundSpots.length + 1 });
      S.sound.chime();
      S.hud.announce('Found ' + game.run.found.length + ' of ' + game.run.scene.diffs.length + '!');
      if (game.run.done) completeScene();
    } else {
      game.effects.push({ kind: 'wrong', x: x, y: y, t0: performance.now() });
      S.sound.buzz();
      S.hud.announce('Not a difference. Mistake ' + game.run.mistakes + '.');
    }
    S.hud.updateHUD(game.run);
    return res;
  }

  function useHint() {
    if (game.screen !== 'playing' || !game.run || game.frozen) return;
    var idx = S.state.useHint(game.run);
    if (idx === -1) return;
    game.hintPulse = { index: idx, t0: performance.now() };
    S.sound.hint();
    S.hud.updateHUD(game.run);
    S.hud.announce('Hint: look at the pulsing circle.');
  }

  function togglePause() {
    if (game.screen === 'playing') {
      game.screen = 'paused';
      S.hud.showPause(true);
      S.hud.announce('Paused.');
    } else if (game.screen === 'paused') {
      game.screen = 'playing';
      S.hud.showPause(false);
      S.hud.announce('Resumed.');
    }
  }

  function toggleSound() {
    var m = S.sound.toggleMuted();
    S.hud.setSoundLabel(m);
  }

  // ---- rendering ----------------------------------------------------

  function drawPicture(ctx, elements, ox, oy, t) {
    ctx.save();
    ctx.translate(ox, oy);
    ctx.beginPath(); ctx.rect(0, 0, PW, PH); ctx.clip();
    S.painter.drawScene(ctx, elements, t);
    ctx.restore();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
    ctx.strokeRect(ox, oy, PW, PH);
  }

  function drawRing(ctx, ox, oy, s) {
    ctx.save();
    ctx.translate(ox, oy);
    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r - 7, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#ffd166';
    ctx.beginPath(); ctx.arc(s.x, s.y - s.r - 2, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a2e00'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(s.n), s.x, s.y - s.r - 1);
    ctx.restore();
  }

  function drawCrosshair(ctx, ox, oy, ch) {
    ctx.save();
    ctx.translate(ox, oy);
    ctx.strokeStyle = ch.keyboard ? '#ffd166' : 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(ch.x, ch.y, 14, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ch.x - 20, ch.y); ctx.lineTo(ch.x - 8, ch.y);
    ctx.moveTo(ch.x + 8, ch.y); ctx.lineTo(ch.x + 20, ch.y);
    ctx.moveTo(ch.x, ch.y - 20); ctx.lineTo(ch.x, ch.y - 8);
    ctx.moveTo(ch.x, ch.y + 8); ctx.lineTo(ch.x, ch.y + 20);
    ctx.stroke();
    ctx.restore();
  }

  function render(t) {
    var ctx = game.ctx;
    if (!ctx || !game.canvas) return;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#20242e';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    if (!game.run) return;
    var L = layout();
    drawPicture(ctx, game.run.scene.elements, L.leftX, L.y, t);
    drawPicture(ctx, game.run.right, L.rightX, L.y, t);
    ctx.fillStyle = '#f4f1de'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('ASLI', L.leftX + 4, 16);
    ctx.fillText('CARI 7 PERBEDAAN', L.rightX + 4, 16);
    // Found rings on both pictures.
    game.foundSpots.forEach(function (s) {
      drawRing(ctx, L.leftX, L.y, s);
      drawRing(ctx, L.rightX, L.y, s);
    });
    // Wrong-click flashes.
    var now = performance.now();
    game.effects = game.effects.filter(function (ef) { return now - ef.t0 < 700; });
    game.effects.forEach(function (ef) {
      var a = 1 - (now - ef.t0) / 700;
      [L.leftX, L.rightX].forEach(function (ox) {
        ctx.save(); ctx.translate(ox, L.y); ctx.globalAlpha = a;
        ctx.strokeStyle = '#ff4d4d'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ef.x - 12, ef.y - 12); ctx.lineTo(ef.x + 12, ef.y + 12);
        ctx.moveTo(ef.x + 12, ef.y - 12); ctx.lineTo(ef.x - 12, ef.y + 12);
        ctx.stroke(); ctx.restore();
      });
    });
    // Hint pulse.
    if (game.hintPulse) {
      var hp = game.hintPulse;
      var age = now - hp.t0;
      if (age > 1600) { game.hintPulse = null; }
      else {
        var spot = game.run.spots[hp.index].spots[0];
        var pulse = 0.5 + 0.5 * Math.sin(age / 160);
        [L.leftX, L.rightX].forEach(function (ox) {
          ctx.save(); ctx.translate(ox, L.y); ctx.globalAlpha = 0.45 + 0.45 * pulse;
          ctx.strokeStyle = '#7ee0c2'; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.arc(spot.x, spot.y, spot.r + 6 + pulse * 6, 0, Math.PI * 2); ctx.stroke();
          ctx.restore();
        });
      }
    }
    // Crosshair on both pictures.
    if (game.input && game.input.crosshair.visible && game.screen === 'playing') {
      drawCrosshair(ctx, L.leftX, L.y, game.input.crosshair);
      drawCrosshair(ctx, L.rightX, L.y, game.input.crosshair);
    }
  }

  // ---- main loop -----------------------------------------------------

  function loop(ts) {
    if (game.frozen) return;
    var dt = game.lastTs ? (ts - game.lastTs) / 1000 : 0;
    game.lastTs = ts;
    if (game.screen === 'playing' && game.run && dt > 0 && dt < 1) game.run.elapsed += dt;
    render(ts);
    if (game.screen === 'playing' || game.screen === 'paused') S.hud.updateHUD(game.run);
    global.requestAnimationFrame(loop);
  }

  // ---- shot staging ---------------------------------------------------

  // Deterministic frames for screenshots. Reuses the real rendering and
  // state; never changes normal play (only runs with ?shot=...).
  function stageShot(name) {
    game.frozen = true;
    var run;
    if (name === 'beach-mid') {
      run = S.state.newSceneRun(S.scenes[0]);
      run.elapsed = 47; run.score = 300;
      [0, 1, 2].forEach(function (idx) {
        run.found.push(idx);
        var s = run.spots[idx].spots[0];
        game.foundSpots.push({ x: s.x, y: s.y, r: s.r, n: game.foundSpots.length + 1 });
      });
      game.run = run; game.screen = 'playing';
      S.hud.showPlaying(); S.hud.updateHUD(run);
    } else if (name === 'market-fresh') {
      run = S.state.newSceneRun(S.scenes[1]);
      run.elapsed = 3;
      game.run = run; game.screen = 'playing';
      S.hud.showPlaying(); S.hud.updateHUD(run);
      if (game.input) { game.input.crosshair.x = 300; game.input.crosshair.y = 180; game.input.crosshair.visible = true; game.input.crosshair.keyboard = true; }
    } else if (name === 'park-one') {
      run = S.state.newSceneRun(S.scenes[2]);
      run.elapsed = 21; run.score = 100;
      run.found.push(0);
      var s0 = run.spots[0].spots[0];
      game.foundSpots.push({ x: s0.x, y: s0.y, r: s0.r, n: 1 });
      game.run = run; game.screen = 'playing';
      S.hud.showPlaying(); S.hud.updateHUD(run);
    } else if (name === 'complete') {
      run = S.state.newSceneRun(S.scenes[0]);
      run.elapsed = 98; run.score = 940; run.mistakes = 0; run.hintsUsed = 0;
      for (var i = 0; i < run.scene.diffs.length; i++) {
        run.found.push(i);
        var s = run.spots[i].spots[0];
        game.foundSpots.push({ x: s.x, y: s.y, r: s.r, n: i + 1 });
      }
      run.done = true;
      game.run = run; game.screen = 'complete';
      S.hud.showPlaying();
      S.hud.showComplete({ stars: 3, bonus: 104, score: 940, time: 98 }, run, true);
      S.hud.updateHUD(run);
    } else {
      return false;
    }
    render(1000); // fixed time so fireflies are deterministic
    return true;
  }

  // ---- boot -----------------------------------------------------------

  function boot() {
    game.progress = S.state.loadProgress();
    if (typeof global.document === 'undefined') return game;
    game.canvas = global.document.getElementById('game');
    game.ctx = game.canvas.getContext('2d');
    game.canvas.width = CANVAS_W;
    game.canvas.height = CANVAS_H;
    S.input.setLayout(layout());
    game.input = S.input.wire(game.canvas, {
      onCheck: checkSpot,
      onKey: function (action) {
        if (action === 'hint') useHint();
        else if (action === 'pause') togglePause();
        else if (action === 'mute') toggleSound();
        else if (action === 'restart' && game.screen === 'playing' && game.run) startScene(game.run.scene.id);
      },
      onCrosshairMove: function () {},
    });
    S.hud.init({
      onSelectScene: startScene,
      onHint: useHint,
      onPause: togglePause,
      onResume: togglePause,
      onRestart: function () { if (game.run) { S.hud.showPause(false); startScene(game.run.scene.id); } },
      onQuit: function () { S.hud.showPause(false); toMenu(); },
      onNext: function () {
        if (game.run && game.run.scene.id + 1 < S.scenes.length) startScene(game.run.scene.id + 1);
        else showGameComplete();
      },
      onReplay: function () { if (game.run) startScene(game.run.scene.id); },
      onPlayAgain: function () { toMenu(); },
      onToggleSound: toggleSound,
    });
    var params = new global.URLSearchParams(global.location.search || '');
    var shot = params.get('shot');
    if (shot) {
      stageShot(shot);
    } else {
      toMenu();
      game.lastTs = 0;
      global.requestAnimationFrame(loop);
    }
    return game;
  }

  S.main = { boot: boot, game: game, startScene: startScene, checkSpot: checkSpot, useHint: useHint, stageShot: stageShot, render: render, CANVAS_W: CANVAS_W, CANVAS_H: CANVAS_H };
})(typeof globalThis !== 'undefined' ? globalThis : this);
