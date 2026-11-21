// SELISIH — game state.
// Holds the run state (screen, scene, finds, timer, score, mistakes,
// hints), the scoring rules and the localStorage progress record.
// Pure logic: no DOM access here except through the progress store.
(function (global) {
  'use strict';

  var S = (global.SELISIH = global.SELISIH || {});
  var STORE_KEY = 'selisih-progress-v1';

  function defaultProgress() {
    return { unlocked: [0], best: {}, totalScore: 0 };
  }

  function loadProgress() {
    try {
      var raw = global.localStorage && global.localStorage.getItem(STORE_KEY);
      if (!raw) return defaultProgress();
      var p = JSON.parse(raw);
      if (!p || !Array.isArray(p.unlocked)) return defaultProgress();
      p.best = p.best || {};
      p.totalScore = p.totalScore || 0;
      return p;
    } catch (e) { return defaultProgress(); }
  }

  function saveProgress(p) {
    try { if (global.localStorage) global.localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch (e) {}
  }

  function starsFor(mistakes, hintsUsed) {
    if (mistakes === 0 && hintsUsed === 0) return 3;
    if (mistakes <= 2 && hintsUsed <= 1) return 2;
    return 1;
  }

  // Fresh per-scene run state.
  function newSceneRun(scene) {
    return {
      scene: scene,
      right: S.differences.rightElements(scene),
      spots: S.differences.diffSpots(scene),
      found: [],          // difference indexes, in find order
      mistakes: 0,
      hintsLeft: 3,
      hintsUsed: 0,
      score: 0,
      elapsed: 0,         // seconds, accumulated while playing
      done: false,
    };
  }

  // Apply a check at scene-space (x, y). Returns
  // { result: 'found'|'wrong', index? } and mutates the run.
  function checkSpot(run, x, y) {
    var idx = S.differences.hitTest(run.scene, run.spots, run.found, x, y);
    if (idx === -1) {
      run.mistakes += 1;
      run.score = Math.max(0, run.score - 25);
      return { result: 'wrong' };
    }
    run.found.push(idx);
    run.score += 100;
    if (run.found.length >= run.scene.diffs.length) run.done = true;
    return { result: 'found', index: idx };
  }

  // A hint reveals one unfound difference. Returns its index or -1.
  function useHint(run) {
    if (run.hintsLeft <= 0) return -1;
    for (var i = 0; i < run.spots.length; i++) {
      if (run.found.indexOf(i) === -1) {
        run.hintsLeft -= 1;
        run.hintsUsed += 1;
        run.score = Math.max(0, run.score - 50);
        return i;
      }
    }
    return -1;
  }

  // Scene-complete bonus: faster finishes earn more, capped at 300.
  function completeBonus(run) {
    return Math.max(0, 300 - Math.floor(run.elapsed) * 2);
  }

  // Finish a scene: apply the time bonus, record best time / unlock.
  function finishScene(progress, run) {
    var bonus = completeBonus(run);
    run.score += bonus;
    var sid = String(run.scene.id);
    if (progress.best[sid] === undefined || run.elapsed < progress.best[sid]) progress.best[sid] = Math.floor(run.elapsed);
    var next = run.scene.id + 1;
    if (next < S.scenes.length && progress.unlocked.indexOf(next) === -1) progress.unlocked.push(next);
    progress.totalScore += run.score;
    saveProgress(progress);
    return {
      stars: starsFor(run.mistakes, run.hintsUsed),
      bonus: bonus,
      score: run.score,
      time: Math.floor(run.elapsed),
    };
  }

  function formatTime(sec) {
    sec = Math.max(0, Math.floor(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  S.state = {
    STORE_KEY: STORE_KEY,
    loadProgress: loadProgress,
    saveProgress: saveProgress,
    newSceneRun: newSceneRun,
    checkSpot: checkSpot,
    useHint: useHint,
    finishScene: finishScene,
    starsFor: starsFor,
    completeBonus: completeBonus,
    formatTime: formatTime,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
