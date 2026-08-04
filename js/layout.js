// The desk layout. Owns the geometry of the rail slots, the top panel and the
// main area, and renders the identity placard in rail slot L3.
//
// Anything that has to travel between regions (the shell, the deck) is
// position:fixed and asks this module for a target rect, so the rail can be
// re-proportioned in CSS without touching the animation code.

import { CFG, pal } from './config.js';
import * as sig from './signature.js';
import * as splash from './splash.js';

const $ = s => document.querySelector(s);

let deskEl = null, overlayEl = null, subs = [];
const SLOTS = {};

export function init() {
  deskEl = $('#desk');
  SLOTS.L1 = $('#slot-cube');
  SLOTS.L2 = $('#slot-term');
  SLOTS.L3 = $('#slot-sig');
  SLOTS.L4 = $('#slot-dock');
  SLOTS.top = $('#top');
  SLOTS.main = $('#main');
  overlayEl = $('#overlay');
  placeOverlay();
  drawPlacard();
}

/* the control overlay tracks #main but lives outside #desk, so it renders
   above the fixed deck stage instead of underneath it */
export function placeOverlay() {
  const r = rect('main');
  if (!r || !overlayEl) return;
  overlayEl.style.left = r.left + 'px';
  overlayEl.style.top = r.top + 'px';
  overlayEl.style.width = r.width + 'px';
  overlayEl.style.height = r.height + 'px';
}

// Layout boxes, measured through the offset chain rather than
// getBoundingClientRect. The slots enter with a translateX, and a rect taken
// mid-transition reports the animated position, which parks anything that docks
// to it 14px off. offsetLeft/offsetTop ignore transforms, so this is stable
// whether or not the entry animation has finished.
export function rect(name) {
  const el = SLOTS[name];
  if (!el) return null;
  let x = 0, y = 0, n = el;
  while (n) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
  return { left: x, top: y, width: el.offsetWidth, height: el.offsetHeight,
           right: x + el.offsetWidth, bottom: y + el.offsetHeight };
}
export const slot = name => SLOTS[name];

/* the desk has to be laid out (not display:none) before rects mean anything.
   #desk is always in flow at opacity 0, so this is safe from frame one. */
export function show()   { deskEl.classList.add('on'); placeOverlay(); }
export function frameIn(){ deskEl.classList.add('framed'); }
export function dealIn() { deskEl.classList.add('dealt'); overlayEl.classList.add('on'); }

/* back to act 1 */
export function teardown() {
  deskEl.classList.remove('on', 'framed', 'dealt');
  overlayEl.classList.remove('on');
  SLOTS.L4.classList.remove('filled');
}

export function onResize(fn) { subs.push(fn); }
export function resize() {
  placeOverlay();
  drawPlacard();
  for (const f of subs) { try { f(); } catch (e) {} }
}

/* ---- rail slot L3: the identity placard ----
   This is the splash composition shrunk into the rail: the same pixelated
   statistical band, the same cyan signature over its centreline, the same red
   url underneath — and the same electrical discharge crackling across the gaps
   in the hand. It used to be a miniature of the CRT tube, which no longer
   exists anywhere else on the site.

   The static half (band + signature) is baked once into an offscreen and
   blitted, so per frame only the url breath, the arcs and the live band cells
   cost anything. */

let pcv = null, pctx = null, pbase = null, PW = 0, PH = 0;
let pFont = 12, pArcs = [], pBandCells = [];
let pBox = { cx: 0, cy: 0, s: 1 };

const P_BAND_CELL = 3, P_BAND_ROWS = 9, P_BAND_GAP = 2;

export function drawPlacard() {
  pcv = $('#sig-canvas');
  if (!pcv) return;
  const r = pcv.getBoundingClientRect();
  if (r.width < 4 || r.height < 4) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  pcv.width = PW = Math.round(r.width * dpr);
  pcv.height = PH = Math.round(r.height * dpr);
  pctx = pcv.getContext('2d');
  pFont = Math.round(PH * 0.19);

  // signature box: centred on the band line, which sits above the url
  const sigW = PW * 0.86;
  pBox = { cx: PW * 0.5, cy: PH * 0.42, s: sigW / 2 };

  pbase = document.createElement('canvas');
  pbase.width = PW; pbase.height = PH;
  const x = pbase.getContext('2d');
  x.fillStyle = 'rgba(2,6,10,.82)';
  x.fillRect(0, 0, PW, PH);
  drawPlacardBand(x);

  if (sig.get()) {
    // two tiers rather than the splash's three — at this size a separate core
    // pass just fattens the stroke instead of reading as heat
    sig.draw(x, pBox.cx, pBox.cy, sigW, {
      color: 'rgb(0,205,245)', width: Math.max(1.4, PW * 0.008),
      glow: 'rgba(0,215,255,.95)', blur: Math.max(8, PW * 0.03)
    });
    sig.draw(x, pBox.cx, pBox.cy, sigW, {
      color: 'rgb(150,242,255)', width: Math.max(1, PW * 0.0038)
    });
  }

  pArcs.length = 0; pBandCells.length = 0;
  drawPlacardFrame(performance.now());
}

/* the band, on the same deterministic per-cell hash the splash uses, so the
   two fields are visibly the same instrument at two scales */
function drawPlacardBand(x) {
  const cy = Math.round(pBox.cy);
  const cols = Math.ceil(PW / P_BAND_CELL) + 1;
  for (let row = 0; row < P_BAND_ROWS; row++) {
    const tN = row / P_BAND_ROWS;
    const baseA = (1 - tN) * (1 - tN) * 0.45;
    const yB = Math.round(cy + P_BAND_GAP + row * P_BAND_CELL);
    const yA = Math.round(cy - P_BAND_GAP - (row + 1) * P_BAND_CELL + 1);
    for (let col = 0; col < cols; col++) {
      const hB = ((col * 73856093) ^ (row * 19349663)) >>> 0;
      const hA = ((col * 19349663) ^ (row * 73856093)) >>> 0;
      const nB = (hB % 1000) / 1000, nA = (hA % 1000) / 1000;
      const px = col * P_BAND_CELL;
      if (nB > tN * 0.85) {
        x.fillStyle = `rgba(0,230,255,${(baseA * (0.5 + (1 - nB) * 0.5)).toFixed(3)})`;
        x.fillRect(px, yB, P_BAND_CELL - 1, P_BAND_CELL - 1);
      }
      if (nA > tN * 0.85) {
        x.fillStyle = `rgba(0,230,255,${(baseA * (0.5 + (1 - nA) * 0.5)).toFixed(3)})`;
        x.fillRect(px, yA, P_BAND_CELL - 1, P_BAND_CELL - 1);
      }
    }
  }
  x.strokeStyle = 'rgba(0,255,255,.75)';
  x.lineWidth = 1;
  x.shadowColor = 'rgba(0,230,255,1)'; x.shadowBlur = 7;
  x.beginPath(); x.moveTo(0, cy + .5); x.lineTo(PW, cy + .5); x.stroke();
  x.shadowBlur = 0;
}

// the website name keeps the beam palette
function urlText(x, alpha, blur) {
  x.font = '500 ' + pFont + "px 'Share Tech Mono', monospace";
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.shadowColor = pal().glow; x.shadowBlur = blur;
  x.globalAlpha = alpha;
  x.fillStyle = pal().hot;
  x.fillText(CFG.domain, PW * 0.5, PH * 0.84);
  x.shadowBlur = 0; x.globalAlpha = 1;
}

/* discharge across the same gaps the splash uses — the pool is built there and
   reused here, just mapped into this box */
function spawnPlacardArc() {
  const g = splash.inkGeometry();
  const c = g && g.pairs;
  if (!c || !c.length) return;
  const i = (Math.random() * (c.length / 5) | 0) * 5;
  pArcs.push({
    x0: pBox.cx + c[i]     * pBox.s, y0: pBox.cy - c[i + 1] * pBox.s,
    x1: pBox.cx + c[i + 2] * pBox.s, y1: pBox.cy - c[i + 3] * pBox.s,
    age: 0, life: 3 + Math.random() * 6, seed: Math.random() * 977
  });
}

export function drawPlacardFrame(now) {
  if (!pctx || !pbase) return;
  const U = CFG.urlEtch;

  pctx.globalCompositeOperation = 'source-over';
  pctx.clearRect(0, 0, PW, PH);
  pctx.drawImage(pbase, 0, 0);

  // live band cells, same spark / hold / flicker mix as the splash
  if (Math.random() < 0.16) {
    const cy = Math.round(pBox.cy);
    const row = Math.random() * P_BAND_ROWS | 0;
    pBandCells.push({
      x: (Math.random() * (PW / P_BAND_CELL) | 0) * P_BAND_CELL,
      y: Math.random() < .5 ? cy + P_BAND_GAP + row * P_BAND_CELL
                            : cy - P_BAND_GAP - (row + 1) * P_BAND_CELL + 1,
      age: 0, life: 10 + Math.random() * 30
    });
  }
  pctx.globalCompositeOperation = 'lighter';
  for (let i = pBandCells.length - 1; i >= 0; i--) {
    const f = pBandCells[i];
    const a = Math.sin(f.age / f.life * Math.PI) * 0.8;
    pctx.fillStyle = `rgba(220,250,255,${a.toFixed(3)})`;
    pctx.fillRect(f.x, f.y, P_BAND_CELL - 1, P_BAND_CELL - 1);
    if (++f.age >= f.life) pBandCells.splice(i, 1);
  }
  pctx.globalCompositeOperation = 'source-over';

  // url breath — the same three-sine curve the splash chrome uses
  const b = 0.5 + 0.28 * Math.sin(now * 0.0026)
                + 0.14 * Math.sin(now * 0.0071 + 1.3)
                + 0.08 * Math.sin(now * 0.0163 + 2.7);
  const a = U.pulseMin + (U.pulseMax - U.pulseMin) * Math.max(0, Math.min(1, b));

  urlText(pctx, 1, pFont * 0.55);
  pctx.globalCompositeOperation = 'lighter';
  urlText(pctx, 0.55 * a, pFont * 1.6);
  urlText(pctx, 0.30 * a, pFont * 0.35);
  pctx.globalCompositeOperation = 'source-over';

  // arcs
  if (Math.random() < 0.30) spawnPlacardArc();
  pctx.save();
  pctx.globalCompositeOperation = 'lighter';
  pctx.lineCap = 'round';
  pctx.shadowColor = 'rgba(0,220,255,1)';
  for (let i = pArcs.length - 1; i >= 0; i--) {
    const q = pArcs[i];
    const t = q.age / q.life;
    const al = Math.sin((1 - t) * Math.PI * 0.5);
    const dx = q.x1 - q.x0, dy = q.y1 - q.y0;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const segs = 3 + (len / 6 | 0);
    pctx.shadowBlur = 5;
    pctx.strokeStyle = `rgba(195,250,255,${(al * 0.9).toFixed(3)})`;
    pctx.lineWidth = 1;
    pctx.beginPath(); pctx.moveTo(q.x0, q.y0);
    for (let k = 1; k < segs; k++) {
      const u = k / segs;
      const r = Math.sin(q.seed + k * 12.9898 + q.age * 3.7) * 43758.5453;
      const j = r - Math.floor(r);
      const off = (j * 2 - 1) * len * 0.20 * Math.sin(u * Math.PI);
      pctx.lineTo(q.x0 + dx * u + nx * off, q.y0 + dy * u + ny * off);
    }
    pctx.lineTo(q.x1, q.y1); pctx.stroke();
    if (++q.age >= q.life) pArcs.splice(i, 1);
  }
  pctx.restore();
  pctx.shadowBlur = 0;

  // scanlines last, over everything
  pctx.globalAlpha = 0.24; pctx.fillStyle = '#000';
  for (let y = 0; y < PH; y += 3) pctx.fillRect(0, y, PW, 1);
  pctx.globalAlpha = 1;
}

export const placardStats = () => ({ arcs: pArcs.length, ready: !!pbase });
