// SELISIH — Spot the Difference: the hand-in program for this entry.
// It takes the finished game (game/, plain static files a desktop
// browser loads offline, no libraries and no network calls) together
// with the screenshots of it being played, copies both into the
// output folder, and writes dossier.json there — the summary the
// judge reads. Run it with:
//   MAKEFUN_OUTPUT_DIR=out node main.ts
// Inside the grader the output folder is /output instead of out.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The hand-in is only worth sending if it shows the game: require at
// least one screenshot, and stop with a plain message when the folder
// is empty or holds no image at all.
var shotNames = [];
if (existsSync(join(here, 'screenshots'))) {
  shotNames = readdirSync(join(here, 'screenshots')).filter(function (n) {
    return /\.(png|jpe?g)$/i.test(n) && !n.startsWith('.');
  });
}
if (shotNames.length === 0) {
  throw new Error('SELISIH hand-in refused: screenshots/ holds no PNG or JPEG image');
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of game
// files, in all, or a path under game/ over 1000 bytes: game/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

// A one-line receipt on the console, so a thin or empty hand-in is
// obvious without opening the output folder.
var dossierBytes = statSync(join(out, 'dossier.json')).size;
console.log('SELISIH handed in: ' + shotNames.length + ' screenshot(s), dossier ' + dossierBytes + ' bytes');
