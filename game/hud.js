// SELISIH — HUD and screens.
// All DOM work lives here: the top HUD, the start screen with scene
// cards, the pause overlay, the scene-complete and game-complete
// screens. The game logic never touches the DOM directly.
(function (global) {
  'use strict';

  var S = (global.SELISIH = global.SELISIH || {});
  var $ = function (id) { return global.document.getElementById(id); };
  var cb = {};

  function hearts(n) {
    var out = '';
    for (var i = 0; i < 3; i++) out += i < 3 - Math.min(3, n) ? '♥' : '♡';
    return out;
  }

  function show(id, on) {
    var el = $(id);
    if (el) el.classList.toggle('hidden', !on);
  }

  function updateHUD(run) {
    if (!global.document || !run) return;
    var total = run.scene.diffs.length;
    $('hud-scene').textContent = run.scene.name;
    $('hud-found').textContent = 'FOUND ' + run.found.length + ' OF ' + total;
    $('hud-left').textContent = (total - run.found.length) + ' LEFT';
    $('hud-time').textContent = S.state.formatTime(run.elapsed);
    $('hud-score').textContent = 'SCORE ' + run.score;
    $('hud-hearts').textContent = hearts(run.mistakes);
    $('hud-hearts').title = run.mistakes + ' mistake(s)';
    var hintBtn = $('btn-hint');
    hintBtn.textContent = '💡 Hint (' + run.hintsLeft + ')';
    hintBtn.disabled = run.hintsLeft <= 0;
  }

  function buildSceneCards(progress) {
    var wrap = $('scene-cards');
    if (!wrap) return;
    wrap.innerHTML = '';
    S.scenes.forEach(function (scene) {
      var unlocked = progress.unlocked.indexOf(scene.id) !== -1;
      var best = progress.best[String(scene.id)];
      var card = global.document.createElement('button');
      card.className = 'scene-card' + (unlocked ? '' : ' locked');
      card.disabled = !unlocked;
      var bestText = best !== undefined ? 'Best: ' + S.state.formatTime(best) : 'Not played yet';
      card.innerHTML =
        '<span class="card-num">' + (scene.id + 1) + '</span>' +
        '<span class="card-name">' + scene.name + '</span>' +
        '<span class="card-sub">' + scene.sub + '</span>' +
        '<span class="card-best">' + (unlocked ? bestText : '🔒 Complete the previous scene to unlock') + '</span>';
      card.addEventListener('click', function () { if (cb.onSelectScene) cb.onSelectScene(scene.id); });
      wrap.appendChild(card);
    });
  }

  function showMenu(progress) {
    buildSceneCards(progress);
    $('menu-total').textContent = progress.totalScore > 0 ? 'Total score so far: ' + progress.totalScore : '';
    show('screen-menu', true);
    show('screen-pause', false);
    show('screen-complete', false);
    show('screen-gamecomplete', false);
    show('hud', false);
  }

  function showPlaying() {
    show('screen-menu', false);
    show('screen-pause', false);
    show('screen-complete', false);
    show('screen-gamecomplete', false);
    show('hud', true);
  }

  function showPause(on) { show('screen-pause', on); }

  function showComplete(result, run, hasNext) {
    $('complete-title').textContent = run.scene.name + ' complete!';
    $('complete-stars').textContent = '★'.repeat(result.stars) + '☆'.repeat(3 - result.stars);
    $('complete-time').textContent = 'Time: ' + S.state.formatTime(result.time);
    $('complete-score').textContent = 'Score: ' + result.score + ' (time bonus +' + result.bonus + ')';
    $('complete-mistakes').textContent = 'Mistakes: ' + run.mistakes + ' · Hints used: ' + run.hintsUsed;
    $('btn-next').classList.toggle('hidden', !hasNext);
    show('screen-complete', true);
  }

  function showGameComplete(totalScore, totalTime) {
    $('final-score').textContent = 'Total score: ' + totalScore;
    $('final-time').textContent = 'Total time: ' + S.state.formatTime(totalTime);
    show('screen-gamecomplete', true);
  }

  function setSoundLabel(muted) {
    var label = muted ? '🔇 Sound off' : '🔊 Sound on';
    var b = $('btn-sound'); if (b) b.textContent = label;
    var m = $('btn-sound-menu'); if (m) m.textContent = label;
  }

  function announce(text) {
    var el = $('status');
    if (el) el.textContent = text;
  }

  function init(callbacks) {
    cb = callbacks || {};
    if (!global.document) return;
    $('btn-hint').addEventListener('click', function () { if (cb.onHint) cb.onHint(); });
    $('btn-pause').addEventListener('click', function () { if (cb.onPause) cb.onPause(); });
    $('btn-sound').addEventListener('click', function () { if (cb.onToggleSound) cb.onToggleSound(); });
    $('btn-sound-menu').addEventListener('click', function () { if (cb.onToggleSound) cb.onToggleSound(); });
    $('btn-resume').addEventListener('click', function () { if (cb.onResume) cb.onResume(); });
    $('btn-restart').addEventListener('click', function () { if (cb.onRestart) cb.onRestart(); });
    $('btn-quit').addEventListener('click', function () { if (cb.onQuit) cb.onQuit(); });
    $('btn-next').addEventListener('click', function () { if (cb.onNext) cb.onNext(); });
    $('btn-replay').addEventListener('click', function () { if (cb.onReplay) cb.onReplay(); });
    $('btn-menu-complete').addEventListener('click', function () { if (cb.onQuit) cb.onQuit(); });
    $('btn-again').addEventListener('click', function () { if (cb.onPlayAgain) cb.onPlayAgain(); });
    $('btn-menu-final').addEventListener('click', function () { if (cb.onQuit) cb.onQuit(); });
    setSoundLabel(S.sound.isMuted());
  }

  S.hud = {
    init: init,
    updateHUD: updateHUD,
    showMenu: showMenu,
    showPlaying: showPlaying,
    showPause: showPause,
    showComplete: showComplete,
    showGameComplete: showGameComplete,
    setSoundLabel: setSoundLabel,
    announce: announce,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
