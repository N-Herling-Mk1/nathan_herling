// [shell]>_ — ported from init_home.
// Types the init command with keystroke sfx during act 2, then drifts into rail
// slot L2 for act 3. Docked geometry comes from layout.js, not from CSS.

import { CFG, OFF, idx, TOTAL } from './config.js';
import * as audio from './audio.js';

let el = null, inner = null, typed = 0, enterDone = false, trackDone = false, docked = false;
let roarDone = false;
let settled = false;   // once true the DOM is left alone so the caret can blink

function clockLine() {
  const d = new Date();
  const D = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
  const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
  const q = n => String(n).padStart(2, '0');
  return D + ' ' + M + ' ' + String(d.getDate()).padStart(2, ' ') + ' ' + d.getFullYear()
       + '   ' + q(d.getHours()) + ':' + q(d.getMinutes()) + ':' + q(d.getSeconds());
}

export function init(node) { el = node; inner = node.querySelector('#term-inner'); reset(); }
export function reset() { typed = 0; enterDone = false; trackDone = false; settled = false; roarDone = false; }
export function show() { el.classList.add('live'); }
export const isDocked = () => docked;

/* park the terminal in a rail slot. rect comes from layout.js. */
export function dock(rect) {
  if (!rect) return;
  docked = true;
  el.classList.add('docked');
  place(rect);
}
/* back to the centred, untyped state */
export function undock() {
  docked = false; settled = false;
  el.classList.remove('docked', 'live');
  el.style.left = el.style.top = el.style.width = el.style.fontSize = '';
  inner.innerHTML = '';
  reset();
}

export function place(rect) {
  if (!docked || !rect) return;
  const pad = 10;
  el.style.left = (rect.left + pad) + 'px';
  el.style.top = (rect.top + pad + 12) + 'px';
  el.style.width = Math.max(80, rect.width - pad * 2) + 'px';
  el.style.fontSize = Math.max(8.5, Math.min(14, rect.width * 0.041)).toFixed(2) + 'px';
}

export function frame(e) {
  // Rewriting innerHTML every frame restarts the caret's CSS animation, which
  // is why it looked frozen once the boot finished. Render the final state once
  // and then stop touching the DOM.
  if (settled) return;
  if (e >= TOTAL) settled = true;
  const iT = idx('TYPE'), iE = idx('EXEC');
  const n = e < OFF[iT] ? 0
          : Math.min(CFG.cmd.length,
              Math.floor(((e - OFF[iT]) / CFG.beats[iT].ms) * CFG.cmd.length));
  if (n > typed) { for (let i = typed; i < n; i++) audio.key(); typed = n; }
  // the command is on the line — hit it before the EXEC keystroke, so the roar
  // reads as the machine answering rather than as part of the typing
  if (!roarDone && n >= CFG.cmd.length) { roarDone = true; audio.shot(CFG.bootSfx.roar); }
  if (e >= OFF[iE] && !enterDone) { enterDone = true; audio.enter(); }
  if (e >= OFF[iE] && !trackDone) { trackDone = true; audio.startTrack(CFG.track); }

  let h = '<div class="tline login">' + clockLine() + '</div>';
  h += '<div class="tline">' + CFG.prompt + 'Welcome to ' + CFG.domain + '</div>';
  h += '<div class="tline">' + CFG.prompt;
  if (e < OFF[iT]) h += '<span id="cursor"></span></div>';
  else h += CFG.cmd.slice(0, n) + (e < OFF[iE] ? '<span id="cursor"></span>' : '') + '</div>';

  for (const s of CFG.subs) {
    const i = idx(s.at);
    if (i >= 0 && e >= OFF[i])
      h += '<div class="tline sub">' + s.t.replace(/ok$/, '<span class="ok">ok</span>') + '</div>';
  }
  const iL = idx('LIVE');
  if (e >= OFF[iL] + CFG.beats[iL].ms - 1)
    h += '<div class="tline">' + CFG.prompt + '<span id="cursor"></span></div>';
  inner.innerHTML = h;
}
