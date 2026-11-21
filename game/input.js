// SELISIH — input.
// Pointer (mouse) clicks on the canvas and keyboard play share one
// interface: the game asks for a scene-space check position and this
// module translates raw events into it. Arrow keys move a crosshair,
// Enter/Space checks the spot under it, H hint, P pause, M mute,
// R restart. Mouse and keyboard mix freely.
(function (global) {
  'use strict';

  var S = (global.SELISIH = global.SELISIH || {});

  // Geometry of the two pictures inside the canvas. The main loop sets
  // these from the real canvas size; input only reads them.
  var layout = { leftX: 0, rightX: 660, y: 10, scale: 1 };

  function setLayout(l) { layout = l; }

  // Canvas pixel -> { side: 'left'|'right', x, y } in scene space, or null
  // when the point is outside both pictures.
  function toScene(px, py) {
    var pw = S.PICTURE_W, ph = S.PICTURE_H;
    var lx = (px - layout.leftX) / layout.scale;
    var rx = (px - layout.rightX) / layout.scale;
    var yy = (py - layout.y) / layout.scale;
    if (yy >= 0 && yy <= ph) {
      if (lx >= 0 && lx <= pw) return { side: 'left', x: lx, y: yy };
      if (rx >= 0 && rx <= pw) return { side: 'right', x: rx, y: yy };
    }
    return null;
  }

  // Wire a canvas + a handler object:
  //   onCheck(sceneX, sceneY)  — a spot was checked
  //   onKey(action)            — action in hint|pause|mute|restart
  //   onCrosshairMove(x, y)    — crosshair moved (keyboard)
  // Returns the crosshair state so the renderer can draw it.
  function wire(canvas, handlers) {
    var crosshair = { x: S.PICTURE_W / 2, y: S.PICTURE_H / 2, visible: false, keyboard: false };

    function canvasPos(ev) {
      var r = canvas.getBoundingClientRect();
      return { x: ev.clientX - r.left, y: ev.clientY - r.top };
    }

    canvas.addEventListener('pointerdown', function (ev) {
      var p = canvasPos(ev);
      var hit = toScene(p.x, p.y);
      if (!hit) return;
      crosshair.x = hit.x; crosshair.y = hit.y; crosshair.visible = true; crosshair.keyboard = false;
      handlers.onCheck(hit.x, hit.y);
    });

    canvas.addEventListener('pointermove', function (ev) {
      var p = canvasPos(ev);
      var hit = toScene(p.x, p.y);
      if (!hit) return;
      crosshair.x = hit.x; crosshair.y = hit.y; crosshair.visible = true; crosshair.keyboard = false;
    });

    // Keyboard: only handled when the game says it is listening (the
    // handler decides by screen); keys are translated here.
    function onKeyDown(ev) {
      var step = ev.shiftKey ? 24 : 8;
      var used = true;
      if (ev.key === 'ArrowLeft') { crosshair.x = Math.max(0, crosshair.x - step); }
      else if (ev.key === 'ArrowRight') { crosshair.x = Math.min(S.PICTURE_W, crosshair.x + step); }
      else if (ev.key === 'ArrowUp') { crosshair.y = Math.max(0, crosshair.y - step); }
      else if (ev.key === 'ArrowDown') { crosshair.y = Math.min(S.PICTURE_H, crosshair.y + step); }
      else if (ev.key === 'Enter' || ev.key === ' ') { handlers.onCheck(crosshair.x, crosshair.y); }
      else if (ev.key === 'h' || ev.key === 'H') { handlers.onKey('hint'); }
      else if (ev.key === 'p' || ev.key === 'P' || ev.key === 'Escape') { handlers.onKey('pause'); }
      else if (ev.key === 'm' || ev.key === 'M') { handlers.onKey('mute'); }
      else if (ev.key === 'r' || ev.key === 'R') { handlers.onKey('restart'); }
      else used = false;
      if (used) {
        if (ev.key.indexOf('Arrow') === 0 || ev.key === 'Enter' || ev.key === ' ') {
          crosshair.visible = true; crosshair.keyboard = true;
        }
        ev.preventDefault();
        if (handlers.onCrosshairMove) handlers.onCrosshairMove(crosshair.x, crosshair.y);
      }
    }

    if (global.document) global.document.addEventListener('keydown', onKeyDown);

    return {
      crosshair: crosshair,
      toScene: toScene,
      setLayout: setLayout,
      detach: function () { if (global.document) global.document.removeEventListener('keydown', onKeyDown); },
    };
  }

  S.input = { wire: wire, setLayout: setLayout, toScene: toScene, layout: layout };
})(typeof globalThis !== 'undefined' ? globalThis : this);
