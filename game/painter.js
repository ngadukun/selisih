// SELISIH — vector painter.
// Draws every element kind from the scene data onto a 2D canvas context.
// No images, no external assets: every picture is painted at run time.
// drawScene(ctx, elements, t) paints one picture; t is milliseconds and
// only drives gentle animation (firefly glow, water shimmer).
(function (global) {
  'use strict';

  var S = (global.SELISIH = global.SELISIH || {});

  function circle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  function ellipse(ctx, x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }
  function rect(ctx, x, y, w, h) { ctx.fillRect(x, y, w, h); }
  function poly(ctx, pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath(); ctx.fill();
  }

  // Draw one element. Coordinates are relative to the picture; the element
  // is centred on (e.x, e.y) with bounding box e.w x e.h.
  function drawElement(ctx, e, t) {
    var x = e.x, y = e.y, w = e.w, h = e.h;
    var hw = w / 2, hh = h / 2;
    ctx.save();
    if (e.flip) { ctx.translate(x, y); ctx.scale(-1, 1); ctx.translate(-x, -y); }
    if (e.rot) { ctx.translate(x, y); ctx.rotate(e.rot); ctx.translate(-x, -y); }
    ctx.fillStyle = e.c || '#888';
    ctx.strokeStyle = e.c2 || e.c || '#888';
    switch (e.kind) {
      case 'sky': {
        var g = ctx.createLinearGradient(0, y - hh, 0, y + hh);
        g.addColorStop(0, e.c); g.addColorStop(1, e.c2 || e.c);
        ctx.fillStyle = g; rect(ctx, x - hw, y - hh, w, h);
        break;
      }
      case 'sun': {
        ctx.fillStyle = e.c2; circle(ctx, x, y, hw * 1.25);
        ctx.fillStyle = e.c; circle(ctx, x, y, hw);
        break;
      }
      case 'moon': {
        ctx.fillStyle = e.c; circle(ctx, x, y, hw);
        ctx.fillStyle = e.c2; circle(ctx, x - hw * 0.35, y - hh * 0.2, hw * 0.22); circle(ctx, x + hw * 0.3, y + hh * 0.25, hw * 0.16);
        break;
      }
      case 'cloud': {
        ctx.fillStyle = e.c;
        ellipse(ctx, x - hw * 0.45, y + hh * 0.15, hw * 0.42, hh * 0.62);
        ellipse(ctx, x, y - hh * 0.2, hw * 0.5, hh * 0.8);
        ellipse(ctx, x + hw * 0.45, y + hh * 0.15, hw * 0.4, hh * 0.58);
        rect(ctx, x - hw * 0.8, y, w * 0.8, hh * 0.7);
        break;
      }
      case 'star': {
        ctx.fillStyle = e.c;
        var r = hw, r2 = hw * 0.42;
        ctx.beginPath();
        for (var i = 0; i < 8; i++) {
          var a = (i * Math.PI) / 4 - Math.PI / 2, rr = i % 2 === 0 ? r : r2;
          var px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill();
        break;
      }
      case 'sea': case 'pond': case 'grass': case 'sand': case 'ground': {
        ctx.fillStyle = e.c; rect(ctx, x - hw, y - hh, w, h);
        if (e.c2) { ctx.fillStyle = e.c2; rect(ctx, x - hw, y - hh, w, hh * 0.25); }
        break;
      }
      case 'wave': {
        ctx.strokeStyle = e.c; ctx.lineWidth = 2.5; ctx.beginPath();
        ctx.moveTo(x - hw, y);
        ctx.quadraticCurveTo(x - hw * 0.5, y - 6, x, y);
        ctx.quadraticCurveTo(x + hw * 0.5, y + 6, x + hw, y);
        ctx.stroke();
        break;
      }
      case 'horizon': case 'shadow': case 'path': {
        ctx.fillStyle = e.c; rect(ctx, x - hw, y - hh, w, h);
        break;
      }
      case 'sailboat': {
        ctx.fillStyle = '#7a3f0e'; poly(ctx, [[x - hw, y + hh * 0.7], [x + hw, y + hh * 0.7], [x + hw * 0.7, y + hh], [x - hw * 0.7, y + hh]]);
        ctx.strokeStyle = '#5a2d08'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x, y + hh * 0.7); ctx.lineTo(x, y - hh); ctx.stroke();
        ctx.fillStyle = e.c2; poly(ctx, [[x + 2, y - hh * 0.95], [x + 2, y + hh * 0.55], [x + hw * 0.85, y + hh * 0.55]]);
        ctx.fillStyle = e.c; poly(ctx, [[x - 3, y - hh * 0.8], [x - 3, y + hh * 0.55], [x - hw * 0.8, y + hh * 0.55]]);
        break;
      }
      case 'rowboat': {
        ctx.fillStyle = e.c; poly(ctx, [[x - hw, y], [x + hw, y], [x + hw * 0.75, y + hh], [x - hw * 0.75, y + hh]]);
        ctx.fillStyle = e.c2; rect(ctx, x - hw * 0.6, y - hh * 0.3, w * 1.2, hh * 0.4);
        ctx.strokeStyle = '#5a2d08'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x - hw * 0.3, y - hh * 0.3); ctx.lineTo(x + hw * 0.2, y + hh * 0.5); ctx.stroke();
        break;
      }
      case 'palm': case 'cherry': case 'tree': {
        var trunk = e.kind === 'cherry' ? e.c2 : '#8a5a2b';
        ctx.fillStyle = trunk;
        ctx.beginPath(); ctx.moveTo(x - w * 0.06, y + hh); ctx.lineTo(x - w * 0.03, y - hh * 0.2); ctx.lineTo(x + w * 0.03, y - hh * 0.2); ctx.lineTo(x + w * 0.06, y + hh); ctx.closePath(); ctx.fill();
        ctx.fillStyle = e.c;
        if (e.kind === 'palm') {
          for (var f = 0; f < 5; f++) {
            var fa = -Math.PI * 0.9 + (f * Math.PI) / 4.4;
            ctx.beginPath(); ctx.ellipse(x + Math.cos(fa) * hw * 0.55, y - hh * 0.55 + Math.sin(fa) * hh * 0.4, hw * 0.5, hh * 0.18, fa, 0, Math.PI * 2); ctx.fill();
          }
          circle(ctx, x - hw * 0.12, y - hh * 0.28, hw * 0.1); circle(ctx, x + hw * 0.1, y - hh * 0.24, hw * 0.09);
        } else {
          circle(ctx, x, y - hh * 0.5, hw * 0.62);
          circle(ctx, x - hw * 0.5, y - hh * 0.25, hw * 0.5);
          circle(ctx, x + hw * 0.5, y - hh * 0.25, hw * 0.5);
          if (e.kind === 'cherry') { ctx.fillStyle = '#fff'; circle(ctx, x - hw * 0.3, y - hh * 0.6, 3); circle(ctx, x + hw * 0.35, y - hh * 0.35, 3); circle(ctx, x, y - hh * 0.3, 3); }
        }
        break;
      }
      case 'umbrella': {
        ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x, y - hh * 0.2); ctx.lineTo(x, y + hh); ctx.stroke();
        ctx.fillStyle = e.c; ctx.beginPath(); ctx.moveTo(x - hw, y - hh * 0.1); ctx.quadraticCurveTo(x, y - hh * 1.1, x + hw, y - hh * 0.1); ctx.quadraticCurveTo(x + hw * 0.5, y + hh * 0.15, x, y - hh * 0.1); ctx.quadraticCurveTo(x - hw * 0.5, y + hh * 0.15, x - hw, y - hh * 0.1); ctx.fill();
        ctx.fillStyle = e.c2; ctx.beginPath(); ctx.moveTo(x - hw * 0.33, y - hh * 0.12); ctx.quadraticCurveTo(x - hw * 0.15, y - hh * 0.9, x, y - hh * 0.12); ctx.quadraticCurveTo(x - hw * 0.15, y + hh * 0.05, x - hw * 0.33, y - hh * 0.12); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x + hw * 0.33, y - hh * 0.12); ctx.quadraticCurveTo(x + hw * 0.15, y - hh * 0.9, x, y - hh * 0.12); ctx.quadraticCurveTo(x + hw * 0.15, y + hh * 0.05, x + hw * 0.33, y - hh * 0.12); ctx.fill();
        break;
      }
      case 'lighthouse': {
        ctx.fillStyle = e.c; rect(ctx, x - hw * 0.55, y - hh, w * 0.55, h);
        ctx.fillStyle = e.c2; rect(ctx, x - hw * 0.55, y - hh * 0.55, w * 0.55, hh * 0.35); rect(ctx, x - hw * 0.55, y + hh * 0.1, w * 0.55, hh * 0.35);
        ctx.fillStyle = '#2b2b2b'; rect(ctx, x - hw * 0.7, y - hh * 1.15, w * 0.7, hh * 0.2);
        ctx.fillStyle = '#ffd166'; circle(ctx, x, y - hh * 0.95, hw * 0.28);
        break;
      }
      case 'rock': case 'stone': {
        ctx.fillStyle = e.c; ellipse(ctx, x, y, hw, hh);
        ctx.fillStyle = e.c2 || e.c; ellipse(ctx, x - hw * 0.25, y - hh * 0.25, hw * 0.4, hh * 0.4);
        break;
      }
      case 'crab': {
        ctx.fillStyle = e.c;
        ellipse(ctx, x, y, hw * 0.7, hh * 0.75);
        circle(ctx, x - hw * 0.35, y - hh * 0.7, hw * 0.16); circle(ctx, x + hw * 0.35, y - hh * 0.7, hw * 0.16);
        ctx.fillStyle = '#fff'; circle(ctx, x - hw * 0.35, y - hh * 0.7, hw * 0.07); circle(ctx, x + hw * 0.35, y - hh * 0.7, hw * 0.07);
        ctx.strokeStyle = e.c; ctx.lineWidth = 2.5;
        for (var leg = -1; leg <= 1; leg += 2) {
          ctx.beginPath(); ctx.moveTo(x + leg * hw * 0.6, y); ctx.lineTo(x + leg * hw * 1.15, y + hh * 0.5); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x + leg * hw * 0.6, y + hh * 0.3); ctx.lineTo(x + leg * hw * 1.1, y + hh * 0.9); ctx.stroke();
        }
        break;
      }
      case 'shell': {
        ctx.fillStyle = e.c;
        ctx.beginPath(); ctx.moveTo(x - hw, y + hh * 0.4); ctx.quadraticCurveTo(x, y - hh * 1.2, x + hw, y + hh * 0.4); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = e.c2 || '#fff'; ctx.lineWidth = 1.5;
        for (var s = -1; s <= 1; s++) { ctx.beginPath(); ctx.moveTo(x + s * hw * 0.4, y - hh * 0.6); ctx.lineTo(x + s * hw * 0.55, y + hh * 0.3); ctx.stroke(); }
        break;
      }
      case 'kite': {
        ctx.strokeStyle = '#5a2d08'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x, y + hh * 0.6); ctx.quadraticCurveTo(x + hw * 0.4, y + hh * 1.4, x - hw * 0.2, y + hh * 2.1); ctx.stroke();
        ctx.fillStyle = e.c; poly(ctx, [[x, y - hh], [x + hw, y], [x, y + hh], [x - hw, y]]);
        ctx.fillStyle = e.c2; poly(ctx, [[x, y - hh], [x + hw, y], [x, y]]);
        ctx.fillStyle = '#ff5d8f'; circle(ctx, x - hw * 0.2, y + hh * 1.5, 3); circle(ctx, x - hw * 0.1, y + hh * 1.9, 3);
        break;
      }
      case 'gull': {
        ctx.strokeStyle = e.c; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x - hw, y + hh * 0.4); ctx.quadraticCurveTo(x - hw * 0.4, y - hh, x, y); ctx.quadraticCurveTo(x + hw * 0.4, y - hh, x + hw, y + hh * 0.4); ctx.stroke();
        break;
      }
      case 'beachball': {
        ctx.fillStyle = e.c; circle(ctx, x, y, hw);
        ctx.fillStyle = e.c2; ctx.beginPath(); ctx.moveTo(x, y - hw); ctx.arc(x, y, hw, -Math.PI / 2, Math.PI / 6); ctx.lineTo(x, y); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x, y - hw); ctx.arc(x, y, hw, Math.PI * 0.7, Math.PI * 1.15); ctx.lineTo(x, y); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fff'; circle(ctx, x, y, hw * 0.22);
        break;
      }
      case 'towel': {
        ctx.fillStyle = e.c; rect(ctx, x - hw, y - hh, w, h);
        ctx.fillStyle = e.c2; rect(ctx, x - hw, y - hh, w, hh * 0.35); rect(ctx, x - hw, y + hh * 0.6, w, hh * 0.35);
        break;
      }
      case 'bucket': {
        ctx.fillStyle = e.c; poly(ctx, [[x - hw * 0.8, y - hh], [x + hw * 0.8, y - hh], [x + hw * 0.6, y + hh], [x - hw * 0.6, y + hh]]);
        ctx.fillStyle = e.c2; rect(ctx, x - hw * 0.8, y - hh, w * 0.8, hh * 0.3);
        ctx.strokeStyle = '#7a3f0e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y - hh, hw * 0.8, Math.PI, 0); ctx.stroke();
        break;
      }
      case 'starfish': {
        ctx.fillStyle = e.c;
        ctx.beginPath();
        for (var sf = 0; sf < 10; sf++) {
          var sa = (sf * Math.PI) / 5 - Math.PI / 2, sr = sf % 2 === 0 ? hw : hw * 0.45;
          var sx = x + Math.cos(sa) * sr, sy = y + Math.sin(sa) * sr;
          if (sf === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        }
        ctx.closePath(); ctx.fill();
        break;
      }
      case 'grass': case 'seaweed': case 'bush': {
        ctx.fillStyle = e.c;
        for (var b = 0; b < 5; b++) {
          var bx = x - hw + (b * w) / 4;
          ctx.beginPath(); ctx.moveTo(bx, y + hh); ctx.quadraticCurveTo(bx + 3, y - hh * 0.7, bx + (b % 2 ? 6 : -4), y - hh * (0.8 + (b % 3) * 0.15)); ctx.quadraticCurveTo(bx + 6, y - hh * 0.3, bx + 8, y + hh); ctx.closePath(); ctx.fill();
        }
        break;
      }
      case 'footprint': {
        ctx.fillStyle = e.c; ellipse(ctx, x, y, hw, hh); circle(ctx, x - hw * 0.4, y - hh, 2.5); circle(ctx, x + hw * 0.4, y - hh, 2.5);
        break;
      }
      case 'fish': {
        ctx.fillStyle = e.c; ellipse(ctx, x, y, hw * 0.8, hh * 0.7);
        poly(ctx, [[x + hw * 0.6, y], [x + hw, y - hh], [x + hw, y + hh]]);
        ctx.fillStyle = '#2b2b2b'; circle(ctx, x - hw * 0.4, y - hh * 0.2, 1.8);
        break;
      }
      case 'fence': {
        ctx.fillStyle = e.c;
        for (var fp = 0; fp < 5; fp++) { var fx = x - hw + (fp * w) / 4; rect(ctx, fx - 2, y - hh, 4, h); }
        rect(ctx, x - hw, y - hh * 0.3, w, 3); rect(ctx, x - hw, y + hh * 0.4, w, 3);
        break;
      }
      case 'building': {
        ctx.fillStyle = e.c; rect(ctx, x - hw, y - hh, w, h);
        ctx.fillStyle = e.c2; rect(ctx, x - hw, y - hh, w, hh * 0.22);
        ctx.fillStyle = '#fff8e1';
        for (var wy = 0; wy < 3; wy++) for (var wx = 0; wx < 3; wx++) rect(ctx, x - hw * 0.7 + wx * hw * 0.7, y - hh * 0.3 + wy * hh * 0.6, w * 0.16, h * 0.12);
        break;
      }
      case 'stall': {
        ctx.fillStyle = e.c; rect(ctx, x - hw, y - hh * 0.4, w, h * 0.7);
        ctx.fillStyle = e.c2; rect(ctx, x - hw, y - hh * 0.4, w, hh * 0.25);
        ctx.strokeStyle = '#5a2d08'; ctx.lineWidth = 2; ctx.strokeRect(x - hw, y - hh * 0.4, w, h * 0.7);
        break;
      }
      case 'awning': {
        ctx.fillStyle = e.c; ctx.beginPath(); ctx.moveTo(x - hw, y - hh); ctx.lineTo(x + hw, y - hh); ctx.lineTo(x + hw * 0.9, y + hh * 0.7); ctx.lineTo(x - hw * 0.9, y + hh * 0.7); ctx.closePath(); ctx.fill();
        ctx.fillStyle = e.c2;
        for (var aw = -2; aw <= 2; aw += 2) { ctx.beginPath(); ctx.moveTo(x + aw * hw * 0.2 - w * 0.09, y - hh); ctx.lineTo(x + aw * hw * 0.2 + w * 0.09, y - hh); ctx.lineTo(x + aw * hw * 0.18 + w * 0.08, y + hh * 0.7); ctx.lineTo(x + aw * hw * 0.18 - w * 0.08, y + hh * 0.7); ctx.closePath(); ctx.fill(); }
        break;
      }
      case 'crate': {
        ctx.fillStyle = e.c; rect(ctx, x - hw, y - hh, w, h);
        ctx.strokeStyle = '#7a3f0e'; ctx.lineWidth = 2; ctx.strokeRect(x - hw, y - hh, w, h);
        ctx.beginPath(); ctx.moveTo(x - hw, y - hh); ctx.lineTo(x + hw, y + hh); ctx.moveTo(x + hw, y - hh); ctx.lineTo(x - hw, y + hh); ctx.stroke();
        break;
      }
      case 'fruit': {
        ctx.fillStyle = e.c;
        for (var fr = 0; fr < 5; fr++) circle(ctx, x - hw * 0.7 + fr * hw * 0.35, y + (fr % 2 ? -2 : 2), hw * 0.28);
        break;
      }
      case 'lantern': {
        ctx.strokeStyle = '#5a2d08'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, y - hh * 1.6); ctx.lineTo(x, y - hh); ctx.stroke();
        ctx.fillStyle = e.c; ellipse(ctx, x, y, hw, hh);
        ctx.fillStyle = e.c2; rect(ctx, x - hw * 0.4, y - hh * 1.05, w * 0.4, hh * 0.25); rect(ctx, x - hw * 0.4, y + hh * 0.8, w * 0.4, hh * 0.25);
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x - hw * 0.7, y - hh * 0.4); ctx.lineTo(x + hw * 0.7, y - hh * 0.4); ctx.moveTo(x - hw * 0.7, y + hh * 0.4); ctx.lineTo(x + hw * 0.7, y + hh * 0.4); ctx.stroke();
        break;
      }
      case 'bicycle': {
        ctx.strokeStyle = e.c; ctx.lineWidth = 3;
        circle(ctx, x - hw * 0.65, y + hh * 0.4, hw * 0.42); circle(ctx, x + hw * 0.65, y + hh * 0.4, hw * 0.42);
        ctx.beginPath();
        ctx.moveTo(x - hw * 0.65, y + hh * 0.4); ctx.lineTo(x - hw * 0.1, y - hh * 0.4); ctx.lineTo(x + hw * 0.3, y - hh * 0.4);
        ctx.moveTo(x - hw * 0.1, y - hh * 0.4); ctx.lineTo(x + hw * 0.65, y + hh * 0.4);
        ctx.moveTo(x + hw * 0.3, y - hh * 0.4); ctx.lineTo(x + hw * 0.45, y - hh * 0.9);
        ctx.moveTo(x - hw * 0.1, y - hh * 0.4); ctx.lineTo(x - hw * 0.35, y - hh * 0.85);
        ctx.stroke();
        ctx.fillStyle = e.c2; rect(ctx, x + hw * 0.3, y - hh, w * 0.3, 4);
        break;
      }
      case 'sign': {
        ctx.fillStyle = e.c; rect(ctx, x - hw, y - hh, w, h);
        ctx.strokeStyle = '#5a2d08'; ctx.lineWidth = 2; ctx.strokeRect(x - hw, y - hh, w, h);
        ctx.fillStyle = e.c2; rect(ctx, x - hw * 0.6, y - hh * 0.3, w * 0.6, 3); rect(ctx, x - hw * 0.6, y + hh * 0.15, w * 0.45, 3);
        break;
      }
      case 'plant': {
        ctx.fillStyle = e.c; ellipse(ctx, x, y - hh * 0.4, hw * 0.8, hh * 0.6);
        circle(ctx, x - hw * 0.45, y - hh * 0.1, hw * 0.35); circle(ctx, x + hw * 0.45, y - hh * 0.1, hw * 0.35);
        ctx.fillStyle = e.c2; poly(ctx, [[x - hw * 0.7, y + hh * 0.1], [x + hw * 0.7, y + hh * 0.1], [x + hw * 0.5, y + hh], [x - hw * 0.5, y + hh]]);
        break;
      }
      case 'cat': {
        ctx.fillStyle = e.c; ellipse(ctx, x, y + hh * 0.2, hw * 0.8, hh * 0.55);
        circle(ctx, x + hw * 0.55, y - hh * 0.3, hw * 0.42);
        poly(ctx, [[x + hw * 0.3, y - hh * 0.6], [x + hw * 0.45, y - hh * 1.1], [x + hw * 0.65, y - hh * 0.55]]);
        poly(ctx, [[x + hw * 0.7, y - hh * 0.55], [x + hw * 0.85, y - hh * 1.05], [x + hw * 0.95, y - hh * 0.5]]);
        ctx.strokeStyle = e.c; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - hw * 0.8, y + hh * 0.2); ctx.quadraticCurveTo(x - hw * 1.3, y - hh * 0.6, x - hw * 0.9, y - hh * 0.9); ctx.stroke();
        ctx.fillStyle = '#2b2b2b'; circle(ctx, x + hw * 0.7, y - hh * 0.35, 1.8);
        break;
      }
      case 'basket': {
        ctx.fillStyle = e.c; poly(ctx, [[x - hw, y - hh * 0.5], [x + hw, y - hh * 0.5], [x + hw * 0.8, y + hh], [x - hw * 0.8, y + hh]]);
        ctx.strokeStyle = e.c2 || '#8a5a2b'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x - hw * 0.9, y); ctx.lineTo(x + hw * 0.9, y); ctx.moveTo(x - hw * 0.85, y + hh * 0.5); ctx.lineTo(x + hw * 0.85, y + hh * 0.5); ctx.stroke();
        ctx.strokeStyle = '#8a5a2b'; ctx.beginPath(); ctx.arc(x, y - hh * 0.5, hw * 0.6, Math.PI, 0); ctx.stroke();
        break;
      }
      case 'cart': {
        ctx.fillStyle = e.c; rect(ctx, x - hw, y - hh * 0.6, w, h * 0.55);
        ctx.fillStyle = e.c2; circle(ctx, x - hw * 0.55, y + hh * 0.6, hw * 0.28); circle(ctx, x + hw * 0.55, y + hh * 0.6, hw * 0.28);
        ctx.strokeStyle = '#5a2d08'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x - hw, y); ctx.lineTo(x - hw * 0.55, y + hh * 0.6); ctx.moveTo(x + hw, y); ctx.lineTo(x + hw * 0.55, y + hh * 0.6); ctx.stroke();
        ctx.fillStyle = '#8ac926'; circle(ctx, x - hw * 0.4, y - hh * 0.7, 5); circle(ctx, x, y - hh * 0.75, 5); circle(ctx, x + hw * 0.4, y - hh * 0.7, 5);
        break;
      }
      case 'bunting': {
        ctx.strokeStyle = '#5a2d08'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x - hw, y - hh); ctx.quadraticCurveTo(x, y + hh * 0.8, x + hw, y - hh); ctx.stroke();
        var cols = ['#e63946', '#ffd166', '#2ec4b6', '#3a7bd5', '#ff9f43'];
        for (var bn = 0; bn < 9; bn++) {
          var bfx = x - hw + (bn + 0.5) * (w / 9);
          var bfy = y - hh + Math.sin((bn / 8) * Math.PI) * hh * 0.7;
          ctx.fillStyle = cols[bn % cols.length];
          poly(ctx, [[bfx - 8, bfy], [bfx + 8, bfy], [bfx, bfy + 14]]);
        }
        break;
      }
      case 'sack': {
        ctx.fillStyle = e.c; ellipse(ctx, x, y + hh * 0.1, hw * 0.9, hh * 0.8);
        ctx.beginPath(); ctx.moveTo(x - hw * 0.4, y - hh * 0.6); ctx.quadraticCurveTo(x, y - hh * 1.3, x + hw * 0.4, y - hh * 0.6); ctx.lineTo(x + hw * 0.3, y - hh * 0.2); ctx.lineTo(x - hw * 0.3, y - hh * 0.2); ctx.closePath(); ctx.fill();
        break;
      }
      case 'jar': {
        ctx.fillStyle = e.c; ellipse(ctx, x, y, hw * 0.8, hh * 0.9);
        rect(ctx, x - hw * 0.4, y - hh, w * 0.4, hh * 0.3);
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; rect(ctx, x - hw * 0.5, y - hh * 0.5, w * 0.15, h * 0.5);
        break;
      }
      case 'bridge': {
        ctx.fillStyle = e.c; ctx.beginPath(); ctx.moveTo(x - hw, y + hh * 0.6); ctx.quadraticCurveTo(x, y - hh * 1.2, x + hw, y + hh * 0.6); ctx.lineTo(x + hw, y + hh); ctx.quadraticCurveTo(x, y - hh * 0.4, x - hw, y + hh); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = e.c2; ctx.lineWidth = 2;
        for (var br = -2; br <= 2; br++) { ctx.beginPath(); ctx.moveTo(x + br * hw * 0.4, y - hh * (0.5 - Math.abs(br) * 0.12)); ctx.lineTo(x + br * hw * 0.4, y + hh * 0.5); ctx.stroke(); }
        break;
      }
      case 'bench': {
        ctx.fillStyle = e.c; rect(ctx, x - hw, y - hh * 0.4, w, hh * 0.45);
        rect(ctx, x - hw, y - hh, w, hh * 0.4);
        ctx.fillStyle = e.c2; rect(ctx, x - hw * 0.8, y, w * 0.1, hh); rect(ctx, x + hw * 0.7, y, w * 0.1, hh);
        break;
      }
      case 'fountain': {
        ctx.fillStyle = '#8a8e94'; ellipse(ctx, x, y + hh * 0.7, hw, hh * 0.3);
        ctx.fillStyle = e.c; ellipse(ctx, x, y + hh * 0.6, hw * 0.85, hh * 0.2);
        ctx.fillStyle = '#8a8e94'; rect(ctx, x - hw * 0.12, y - hh * 0.2, w * 0.12, h * 0.6);
        ctx.fillStyle = e.c2;
        for (var ft = -2; ft <= 2; ft++) {
          ctx.beginPath(); ctx.moveTo(x, y - hh * 0.5); ctx.quadraticCurveTo(x + ft * hw * 0.3, y - hh * 0.2, x + ft * hw * 0.45, y + hh * 0.55); ctx.quadraticCurveTo(x + ft * hw * 0.3, y, x, y - hh * 0.5); ctx.fill();
        }
        circle(ctx, x, y - hh * 0.55, hw * 0.12);
        break;
      }
      case 'duck': {
        ctx.fillStyle = e.c; ellipse(ctx, x, y + hh * 0.15, hw * 0.75, hh * 0.6);
        circle(ctx, x + hw * 0.5, y - hh * 0.35, hw * 0.35);
        ctx.fillStyle = e.c2; poly(ctx, [[x + hw * 0.8, y - hh * 0.4], [x + hw * 1.15, y - hh * 0.25], [x + hw * 0.8, y - hh * 0.1]]);
        ctx.fillStyle = '#2b2b2b'; circle(ctx, x + hw * 0.55, y - hh * 0.45, 1.8);
        ctx.strokeStyle = e.c; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - hw * 0.7, y + hh * 0.5); ctx.quadraticCurveTo(x - hw * 0.9, y + hh * 0.9, x - hw * 0.5, y + hh * 0.8); ctx.stroke();
        break;
      }
      case 'gazebo': {
        ctx.fillStyle = e.c; poly(ctx, [[x - hw, y - hh * 0.4], [x, y - hh], [x + hw, y - hh * 0.4], [x + hw * 0.85, y - hh * 0.4], [x - hw * 0.85, y - hh * 0.4]]);
        ctx.fillStyle = e.c2; poly(ctx, [[x - hw * 0.15, y - hh], [x + hw * 0.15, y - hh], [x, y - hh * 0.75]]);
        ctx.fillStyle = e.c;
        rect(ctx, x - hw * 0.85, y - hh * 0.4, w * 0.08, h * 0.7); rect(ctx, x + hw * 0.77, y - hh * 0.4, w * 0.08, h * 0.7);
        rect(ctx, x - hw * 0.85, y + hh * 0.25, w * 1.7, hh * 0.12);
        ctx.fillStyle = '#ffd166'; circle(ctx, x, y - hh * 0.15, hw * 0.1);
        break;
      }
      case 'lamppost': {
        ctx.fillStyle = e.c; rect(ctx, x - w * 0.04, y - hh * 0.6, w * 0.08, h * 0.8);
        ctx.fillStyle = e.c2; circle(ctx, x, y - hh * 0.75, hw * 0.42);
        ctx.fillStyle = 'rgba(255,209,102,0.25)'; circle(ctx, x, y - hh * 0.75, hw * 0.9);
        break;
      }
      case 'firefly': {
        var a = 0.45 + 0.55 * Math.abs(Math.sin((t / 900) + (e.ph || 0)));
        ctx.fillStyle = e.c; ctx.globalAlpha = a; circle(ctx, x, y, hw * 0.55); ctx.globalAlpha = a * 0.35; circle(ctx, x, y, hw * 1.1); ctx.globalAlpha = 1;
        break;
      }
      case 'lilypad': {
        ctx.fillStyle = e.c; ctx.beginPath(); ctx.arc(x, y, hw, 0.3, Math.PI * 2 - 0.3); ctx.lineTo(x, y); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#1d4d2b'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + hw * 0.7, y - hh * 0.5); ctx.stroke();
        break;
      }
      default: {
        ctx.fillStyle = '#f0f'; rect(ctx, x - hw, y - hh, w, h);
      }
    }
    ctx.restore();
  }

  function drawScene(ctx, elements, t) {
    for (var i = 0; i < elements.length; i++) drawElement(ctx, elements[i], t || 0);
  }

  S.painter = { drawScene: drawScene, drawElement: drawElement };
})(typeof globalThis !== 'undefined' ? globalThis : this);
