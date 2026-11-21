// SELISIH — scene data.
// Three original scenes, each a flat list of vector elements drawn by the
// painter. Coordinates live in a 640 x 400 picture space; the left picture
// renders this list as-is, the right picture renders it with the scene's
// fixed differences applied. Every element has a stable id so the
// difference engine can target it.
(function (global) {
  'use strict';

  // E(id, kind, x, y, w, h, c, c2, opts) — x/y is the element centre,
  // w/h its bounding box, c the main colour, c2 the secondary colour.
  function E(id, kind, x, y, w, h, c, c2, o) {
    var e = { id: id, kind: kind, x: x, y: y, w: w, h: h, c: c, c2: c2 || null };
    if (o) for (var k in o) e[k] = o[k];
    return e;
  }

  var SCENES = [
    // ---------------------------------------------------------------
    // 1 — Pantai Senja (beach at sunset)
    // ---------------------------------------------------------------
    {
      id: 0,
      name: 'Pantai Senja',
      sub: 'Pantai saat matahari terbenam',
      elements: [
        E('sky', 'sky', 320, 130, 640, 260, '#ff9a5c', '#ffd194'),
        E('sun', 'sun', 468, 96, 84, 84, '#ffdf6b', '#ff9d00'),
        E('cloud1', 'cloud', 110, 62, 120, 34, '#ffe3c2', null),
        E('cloud2', 'cloud', 300, 44, 96, 28, '#ffd9b0', null),
        E('cloud3', 'cloud', 540, 150, 110, 30, '#ffc79b', null),
        E('sea', 'sea', 320, 232, 640, 96, '#2e7f9e', '#7fc4d8'),
        E('wave1', 'wave', 120, 218, 150, 12, '#bfe6ef', null),
        E('wave2', 'wave', 380, 246, 170, 12, '#bfe6ef', null),
        E('wave3', 'wave', 540, 212, 120, 10, '#d8f0f5', null),
        E('sand', 'sand', 320, 345, 640, 110, '#f2d8a0', '#e8c37e'),
        E('sailboat', 'sailboat', 158, 196, 92, 66, '#ffffff', '#e2574c'),
        E('rowboat', 'rowboat', 428, 336, 96, 30, '#b5651d', '#7a3f0e'),
        E('palm1', 'palm', 74, 252, 96, 130, '#2f7d4f', '#8a5a2b'),
        E('palm2', 'palm', 566, 258, 84, 112, '#35945c', '#8a5a2b'),
        E('umb1', 'umbrella', 196, 312, 92, 62, '#e2574c', '#ffffff'),
        E('umb2', 'umbrella', 330, 322, 80, 54, '#3a7bd5', '#ffd166'),
        E('towel', 'towel', 262, 356, 64, 22, '#3a7bd5', '#ffffff'),
        E('bucket', 'bucket', 300, 366, 26, 24, '#e2574c', '#ffd166'),
        E('ball', 'beachball', 352, 362, 30, 30, '#ff5d8f', '#ffffff'),
        E('lighthouse', 'lighthouse', 592, 176, 44, 108, '#ffffff', '#e2574c'),
        E('rock1', 'rock', 584, 238, 90, 34, '#6b6f76', '#4a4d52'),
        E('rock2', 'rock', 520, 248, 54, 22, '#7d8187', null),
        E('rock3', 'rock', 36, 288, 60, 24, '#8a8e94', null),
        E('crab1', 'crab', 150, 372, 34, 22, '#ff6b4a', null),
        E('crab2', 'crab', 470, 382, 30, 20, '#ff8c69', null),
        E('shell1', 'shell', 96, 384, 22, 16, '#ffb6c1', '#fff0f3'),
        E('shell2', 'shell', 232, 388, 20, 14, '#ffe08a', '#fff7d6'),
        E('shell3', 'shell', 402, 392, 24, 16, '#c9a7eb', '#efe6fa'),
        E('shell4', 'shell', 528, 366, 18, 13, '#ffb6c1', null),
        E('starfish', 'starfish', 520, 392, 24, 22, '#ff9f43', null),
        E('kite', 'kite', 316, 84, 52, 58, '#7b61ff', '#ffd166'),
        E('gull1', 'gull', 210, 66, 30, 12, '#3a3a3a', null),
        E('gull2', 'gull', 262, 48, 26, 10, '#3a3a3a', null),
        E('gull3', 'gull', 396, 56, 28, 11, '#3a3a3a', null),
        E('gull4', 'gull', 96, 110, 24, 10, '#3a3a3a', null),
        E('fence1', 'fence', 60, 306, 70, 26, '#a9805a', null),
        E('grass1', 'grass', 40, 296, 90, 18, '#4e9b57', null),
        E('grass2', 'grass', 610, 300, 60, 16, '#4e9b57', null),
        E('foot1', 'footprint', 180, 344, 16, 8, '#d9b877', null),
        E('foot2', 'footprint', 214, 352, 16, 8, '#d9b877', null),
        E('foot3', 'footprint', 248, 342, 16, 8, '#d9b877', null),
        E('seaweed', 'seaweed', 596, 300, 30, 20, '#2f7d4f', null),
        E('fish', 'fish', 500, 232, 26, 12, '#ffd166', null),
        E('fish2', 'fish', 90, 244, 22, 10, '#ff9f43', null),
        E('horizon', 'horizon', 320, 200, 640, 4, '#ff7b54', null),
      ],
      // Fixed, seeded differences: 7, one of each kind where possible.
      diffs: [
        { kind: 'remove', id: 'gull2' },                                   // gull gone
        { kind: 'add', el: E('add-shell', 'shell', 452, 352, 22, 16, '#7ee0c2', '#e6fff6') },
        { kind: 'color', id: 'umb1', c: '#2ec4b6', c2: '#ffffff' },         // umbrella turns teal
        { kind: 'move', id: 'crab1', dx: 96, dy: -8 },                     // crab scuttles right
        { kind: 'resize', id: 'kite', s: 1.45 },                          // kite much bigger
        { kind: 'flip', id: 'sailboat' },                                  // sailboat faces other way
        { kind: 'swap', a: 'shell1', b: 'shell3' },                        // two shells swap places
      ],
    },
    // ---------------------------------------------------------------
    // 2 — Pasar Pagi (morning market street)
    // ---------------------------------------------------------------
    {
      id: 1,
      name: 'Pasar Pagi',
      sub: 'Pasar pagi di jalan kota',
      elements: [
        E('sky', 'sky', 320, 110, 640, 220, '#aee3f5', '#fff3c4'),
        E('sun', 'sun', 92, 66, 62, 62, '#ffdf6b', '#ffb703'),
        E('cloud1', 'cloud', 300, 52, 110, 30, '#ffffff', null),
        E('cloud2', 'cloud', 500, 84, 90, 26, '#ffffff', null),
        E('bld1', 'building', 74, 150, 120, 180, '#f4a261', '#e76f51'),
        E('bld2', 'building', 320, 140, 130, 200, '#8ab17d', '#588157'),
        E('bld3', 'building', 566, 150, 120, 180, '#e9c46a', '#d4a017'),
        E('street', 'ground', 320, 330, 640, 140, '#cbb9a0', '#b39b7d'),
        E('stall1', 'stall', 150, 268, 150, 96, '#8a5a2b', '#e9c46a'),
        E('awn1', 'awning', 150, 224, 150, 30, '#e2574c', '#ffffff'),
        E('stall2', 'stall', 330, 272, 140, 88, '#8a5a2b', '#3a7bd5'),
        E('awn2', 'awning', 330, 232, 140, 28, '#3a7bd5', '#ffffff'),
        E('stall3', 'stall', 500, 268, 140, 96, '#8a5a2b', '#2ec4b6'),
        E('awn3', 'awning', 500, 224, 140, 30, '#2ec4b6', '#ffffff'),
        E('crate1', 'crate', 120, 330, 52, 34, '#b5651d', '#ff9f43'),
        E('crate2', 'crate', 176, 334, 48, 30, '#b5651d', '#e63946'),
        E('crate3', 'crate', 306, 334, 52, 32, '#b5651d', '#8ac926'),
        E('crate4', 'crate', 470, 332, 50, 32, '#b5651d', '#ffd166'),
        E('fruit1', 'fruit', 120, 312, 44, 16, '#ff9f43', null),
        E('fruit2', 'fruit', 176, 318, 40, 14, '#e63946', null),
        E('fruit3', 'fruit', 306, 318, 44, 14, '#8ac926', null),
        E('fruit4', 'fruit', 470, 316, 42, 14, '#ffd166', null),
        E('lantern1', 'lantern', 232, 196, 22, 30, '#e63946', '#ffd166'),
        E('lantern2', 'lantern', 414, 200, 22, 30, '#ffd166', '#e63946'),
        E('lantern3', 'lantern', 586, 196, 22, 30, '#e63946', '#ffd166'),
        E('lantern4', 'lantern', 56, 210, 20, 28, '#ffd166', '#e63946'),
        E('bicycle', 'bicycle', 556, 348, 78, 40, '#3a3a3a', '#e2574c'),
        E('sign1', 'sign', 74, 96, 74, 26, '#e76f51', '#ffffff'),
        E('sign2', 'sign', 320, 86, 84, 26, '#588157', '#ffffff'),
        E('sign3', 'sign', 566, 96, 74, 26, '#d4a017', '#ffffff'),
        E('plant1', 'plant', 238, 344, 34, 40, '#2f7d4f', '#c96f4a'),
        E('plant2', 'plant', 420, 346, 32, 38, '#35945c', '#b5651d'),
        E('plant3', 'plant', 606, 348, 30, 36, '#2f7d4f', '#c96f4a'),
        E('cat1', 'cat', 262, 372, 36, 22, '#f4a261', null),
        E('cat2', 'cat', 44, 376, 32, 20, '#6c757d', null),
        E('basket1', 'basket', 360, 360, 40, 24, '#c89b6d', '#8a5a2b'),
        E('basket2', 'basket', 534, 376, 36, 22, '#c89b6d', null),
        E('cart', 'cart', 428, 300, 66, 44, '#7a3f0e', '#e9c46a'),
        E('bunting', 'bunting', 320, 150, 640, 22, '#e63946', '#ffd166'),
        E('sack1', 'sack', 206, 366, 34, 26, '#d9c7a7', null),
        E('sack2', 'sack', 386, 368, 32, 24, '#d9c7a7', null),
        E('jar1', 'jar', 290, 300, 18, 24, '#7fc4d8', null),
        E('jar2', 'jar', 348, 302, 18, 24, '#ffb6c1', null),
        E('bird1', 'gull', 220, 60, 26, 10, '#3a3a3a', null),
        E('bird2', 'gull', 440, 48, 24, 10, '#3a3a3a', null),
        E('shadow', 'shadow', 320, 392, 640, 8, '#a68b6d', null),
      ],
      diffs: [
        { kind: 'remove', id: 'cat1' },                                     // orange cat gone
        { kind: 'add', el: E('add-lantern', 'lantern', 268, 196, 22, 30, '#7b61ff', '#ffd166') },
        { kind: 'color', id: 'awn2', c: '#ff9f43', c2: '#ffffff' },         // middle awning turns orange
        { kind: 'move', id: 'bicycle', dx: -120, dy: 0 },                  // bicycle rolls left
        { kind: 'resize', id: 'crate3', s: 1.5 },                          // green fruit crate bigger
        { kind: 'flip', id: 'sign2' },                                     // shop sign flips
        { kind: 'swap', a: 'plant1', b: 'plant3' },                        // two potted plants swap
      ],
    },
    // ---------------------------------------------------------------
    // 3 — Taman Malam (park at night)
    // ---------------------------------------------------------------
    {
      id: 2,
      name: 'Taman Malam',
      sub: 'Taman di bawah bulan',
      elements: [
        E('sky', 'sky', 320, 150, 640, 300, '#101736', '#2b3a67'),
        E('moon', 'moon', 520, 70, 64, 64, '#f4f1de', '#e0d9b8'),
        E('star1', 'star', 60, 50, 14, 14, '#fff3b0', null),
        E('star2', 'star', 150, 34, 11, 11, '#ffffff', null),
        E('star3', 'star', 250, 64, 12, 12, '#fff3b0', null),
        E('star4', 'star', 330, 40, 10, 10, '#ffffff', null),
        E('star5', 'star', 420, 88, 12, 12, '#fff3b0', null),
        E('star6', 'star', 600, 130, 11, 11, '#ffffff', null),
        E('star7', 'star', 90, 120, 10, 10, '#ffffff', null),
        E('star8', 'star', 200, 110, 11, 11, '#fff3b0', null),
        E('grass', 'grass', 320, 320, 640, 160, '#1d4d2b', '#163d22'),
        E('pond', 'pond', 200, 320, 260, 84, '#1f6f8b', '#7fc4d8'),
        E('lily1', 'lilypad', 140, 322, 26, 12, '#2f7d4f', null),
        E('lily2', 'lilypad', 240, 336, 24, 11, '#35945c', null),
        E('lily3', 'lilypad', 196, 306, 22, 10, '#2f7d4f', null),
        E('bridge', 'bridge', 200, 296, 120, 40, '#8a5a2b', '#e9c46a'),
        E('duck1', 'duck', 170, 326, 34, 20, '#ffffff', '#ff9f43'),
        E('duck2', 'duck', 258, 318, 30, 18, '#f4f1de', '#ff9f43'),
        E('duck3', 'duck', 216, 344, 28, 17, '#e8e8e8', '#ff9f43'),
        E('bench1', 'bench', 420, 330, 84, 36, '#7a3f0e', '#5a2d08'),
        E('bench2', 'bench', 540, 356, 78, 34, '#7a3f0e', '#5a2d08'),
        E('fountain', 'fountain', 320, 240, 90, 74, '#7fc4d8', '#e8f6fa'),
        E('cherry1', 'cherry', 92, 220, 120, 150, '#ff8fab', '#5a2d08'),
        E('cherry2', 'cherry', 560, 210, 110, 140, '#ffb3c6', '#5a2d08'),
        E('cherry3', 'cherry', 380, 170, 84, 100, '#ff8fab', '#5a2d08'),
        E('gazebo', 'gazebo', 472, 180, 130, 120, '#6b4f2a', '#e63946'),
        E('lamp1', 'lamppost', 330, 300, 26, 74, '#2b2b2b', '#ffd166'),
        E('lamp2', 'lamppost', 470, 320, 26, 74, '#2b2b2b', '#ffd166'),
        E('lamp3', 'lamppost', 96, 340, 24, 68, '#2b2b2b', '#ffd166'),
        E('firefly1', 'firefly', 120, 200, 10, 10, '#d8f26e', null, { ph: 0 }),
        E('firefly2', 'firefly', 260, 180, 10, 10, '#d8f26e', null, { ph: 1.7 }),
        E('firefly3', 'firefly', 360, 260, 10, 10, '#d8f26e', null, { ph: 3.1 }),
        E('firefly4', 'firefly', 500, 250, 10, 10, '#d8f26e', null, { ph: 4.4 }),
        E('firefly5', 'firefly', 590, 300, 10, 10, '#d8f26e', null, { ph: 5.6 }),
        E('firefly6', 'firefly', 40, 260, 10, 10, '#d8f26e', null, { ph: 2.3 }),
        E('bush1', 'bush', 60, 372, 70, 26, '#163d22', null),
        E('bush2', 'bush', 620, 330, 60, 24, '#163d22', null),
        E('bush3', 'bush', 300, 386, 80, 22, '#1d4d2b', null),
        E('path', 'path', 420, 384, 200, 24, '#8d7d6b', null),
        E('stone1', 'stone', 150, 384, 22, 12, '#8a8e94', null),
        E('stone2', 'stone', 330, 372, 20, 11, '#8a8e94', null),
        E('tree1', 'tree', 30, 180, 70, 120, '#163d22', '#0f2d18'),
        E('tree2', 'tree', 620, 170, 64, 110, '#163d22', '#0f2d18'),
        E('fence1', 'fence', 560, 384, 120, 20, '#3a2e1e', null),
      ],
      diffs: [
        { kind: 'remove', id: 'duck2' },                                    // middle duck gone
        { kind: 'add', el: E('add-firefly', 'firefly', 440, 140, 10, 10, '#d8f26e', null, { ph: 0.9 }) },
        { kind: 'color', id: 'lamp2', c2: '#ff5d8f' },                      // lamp glow turns pink
        { kind: 'move', id: 'bench1', dx: 0, dy: 26 },                     // bench slides down
        { kind: 'resize', id: 'cherry3', s: 1.4 },                         // small cherry tree bigger
        { kind: 'flip', id: 'duck1' },                                     // duck faces other way
        { kind: 'swap', a: 'lamp1', b: 'lamp3' },                          // two lamp posts swap
      ],
    },
  ];

  global.SELISIH = global.SELISIH || {};
  global.SELISIH.scenes = SCENES;
  global.SELISIH.PICTURE_W = 640;
  global.SELISIH.PICTURE_H = 400;
})(typeof globalThis !== 'undefined' ? globalThis : this);
