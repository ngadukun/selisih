// SELISIH — difference engine.
// Takes a scene's fixed difference list and produces the right-hand
// picture's element list, plus the hit-test spots for every difference.
// Same scene + same list = same differences on every load.
(function (global) {
  'use strict';

  var S = (global.SELISIH = global.SELISIH || {});

  function cloneEl(e) {
    var c = {};
    for (var k in e) c[k] = e[k];
    return c;
  }

  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  // Build the right picture's element list from the scene definition.
  function rightElements(scene) {
    var list = scene.elements.map(cloneEl);
    scene.diffs.forEach(function (d) {
      var el, a, b, tmp;
      if (d.kind === 'remove') {
        for (var i = 0; i < list.length; i++) {
          if (list[i].id === d.id) { list.splice(i, 1); break; }
        }
      } else if (d.kind === 'add') {
        list.push(cloneEl(d.el));
      } else if (d.kind === 'color') {
        el = byId(list, d.id);
        if (el) { if (d.c !== undefined) el.c = d.c; if (d.c2 !== undefined) el.c2 = d.c2; }
      } else if (d.kind === 'move') {
        el = byId(list, d.id);
        if (el) { el.x += d.dx || 0; el.y += d.dy || 0; }
      } else if (d.kind === 'resize') {
        el = byId(list, d.id);
        if (el) { el.w *= d.s; el.h *= d.s; }
      } else if (d.kind === 'flip') {
        el = byId(list, d.id);
        if (el) el.flip = !el.flip;
      } else if (d.kind === 'swap') {
        a = byId(list, d.a); b = byId(list, d.b);
        if (a && b) { tmp = a.x; a.x = b.x; b.x = tmp; tmp = a.y; a.y = b.y; b.y = tmp; }
      }
    });
    return list;
  }

  // Radius for hit-testing an element: half its largest side, with a
  // friendly minimum so small elements stay clickable.
  function spotRadius(el) {
    return Math.max(Math.max(el.w, el.h) / 2, 16) + 4;
  }

  // For each difference, the list of scene-space spots that count as a hit.
  // A moved/swapped difference can be found at either of its two places.
  function diffSpots(scene) {
    var left = scene.elements;
    return scene.diffs.map(function (d) {
      var spots = [];
      var el, a, b;
      if (d.kind === 'remove' || d.kind === 'color' || d.kind === 'resize' || d.kind === 'flip') {
        el = byId(left, d.id);
        if (el) spots.push({ x: el.x, y: el.y, r: spotRadius(el) });
      } else if (d.kind === 'add') {
        spots.push({ x: d.el.x, y: d.el.y, r: spotRadius(d.el) });
      } else if (d.kind === 'move') {
        el = byId(left, d.id);
        if (el) {
          spots.push({ x: el.x, y: el.y, r: spotRadius(el) });
          spots.push({ x: el.x + (d.dx || 0), y: el.y + (d.dy || 0), r: spotRadius(el) });
        }
      } else if (d.kind === 'swap') {
        a = byId(left, d.a); b = byId(left, d.b);
        if (a) spots.push({ x: a.x, y: a.y, r: spotRadius(a) });
        if (b) spots.push({ x: b.x, y: b.y, r: spotRadius(b) });
      }
      return { kind: d.kind, spots: spots };
    });
  }

  // Hit-test a scene-space point against the still-unfound differences.
  // Returns the difference index, or -1.
  function hitTest(scene, spots, found, x, y) {
    for (var i = 0; i < spots.length; i++) {
      if (found.indexOf(i) !== -1) continue;
      var list = spots[i].spots;
      for (var j = 0; j < list.length; j++) {
        var dx = x - list[j].x, dy = y - list[j].y;
        if (dx * dx + dy * dy <= list[j].r * list[j].r) return i;
      }
    }
    return -1;
  }

  S.differences = {
    rightElements: rightElements,
    diffSpots: diffSpots,
    hitTest: hitTest,
    spotRadius: spotRadius,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
