// ============ THE TUBE ============
// Pipeline ported from helix_splash, metric for metric:
//   source -> R/G/B channel split -> pixel block -> flicker -> granulated blit
//   -> scrolling static -> cathode roll band
//
// getImageData is only ever called on our own procedural noise buffer, never on
// the source, so this stays taint-free over file://, Flask and Pages alike.

import { CFG, smooth, drift } from './config.js';
import * as sig from './signature.js';

let disp = null, sctx = null, crtEl = null;
let WORKW = 0, WORKH = 0;
let work = null, work2 = null, wctx = null, w2ctx = null;
let srcCv = null, tiny = null, tctx = null, chR = null, chG = null, chB = null;
let bootStart = 0, phase = 'warm', resolved = false;
let scrollPhase = 0, noiseFrame = 0, dpr = 1;

const NW = 240, NH = 180;
let noiseCv = null, nctx = null, noiseImg = null;

const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

export function init(canvas, crt) {
  disp = canvas; sctx = disp.getContext('2d'); crtEl = crt;
  crtEl.style.aspectRatio = String(CFG.tube.ar);

  WORKH = CFG.tube.workH;
  WORKW = Math.round(WORKH * CFG.tube.ar);
  work = mk(WORKW, WORKH); wctx = work.getContext('2d');
  work2 = mk(WORKW, WORKH); w2ctx = work2.getContext('2d');
  // the downscale needs its own buffer; see the pixel-block step below
  tiny = mk(WORKW, WORKH); tctx = tiny.getContext('2d');

  noiseCv = mk(NW, NH); nctx = noiseCv.getContext('2d');
  noiseImg = nctx.createImageData(NW, NH); regenNoise();

  buildSource();
  syncScan();
  resize();
  bootStart = performance.now();
}

function regenNoise() {
  const d = noiseImg.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255;
  }
  nctx.putImageData(noiseImg, 0, 0);
}

/* ---- source: the signature, laid on the phosphor at CFG.frame.sigCy ---- */
function buildSource() {
  srcCv = mk(WORKW, WORKH);
  const g = srcCv.getContext('2d');
  g.clearRect(0, 0, WORKW, WORKH);
  const F = CFG.frame;
  if (sig.get()) {
    sig.draw(g, WORKW * 0.5, WORKH * F.sigCy, WORKW * F.sigW, {
      color: CFG.ink.sig, width: Math.max(1.6, WORKW * 0.0042),
      glow: CFG.ink.sigGlow, blur: CFG.ink.sigBlur
    });
  } else {
    // signature.json missing — still give the tube something to resolve
    g.font = '700 ' + Math.round(WORKH * 0.09) + "px 'Orbitron', sans-serif";
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = CFG.ink.sig;
    g.fillText('NATHAN HERLING', WORKW * 0.5, WORKH * F.sigCy);
  }
  buildChannels();
}

/* R/G/B channel canvases via multiply isolation, then destination-in to clip
   back to the source alpha so empty area stays transparent instead of white. */
function buildChannels() {
  const make = mul => {
    const c = mk(WORKW, WORKH), g = c.getContext('2d');
    g.drawImage(srcCv, 0, 0);
    g.globalCompositeOperation = 'multiply';
    g.fillStyle = mul; g.fillRect(0, 0, WORKW, WORKH);
    g.globalCompositeOperation = 'destination-in';
    g.drawImage(srcCv, 0, 0);
    g.globalCompositeOperation = 'source-over';
    return c;
  };
  chR = make('#ff0000'); chG = make('#00ff00'); chB = make('#0000ff');
}

export function rebuildSource() { if (WORKW) buildSource(); }

export function resize() {
  if (!disp) return;
  const r = crtEl.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  disp.width = Math.max(2, Math.round(r.width * dpr));
  disp.height = Math.max(2, Math.round(r.height * dpr));
  sctx.imageSmoothingEnabled = true;
}

export function syncScan() {
  crtEl.style.setProperty('--scan', (CFG.crt.scan / 100 * 0.6).toFixed(3));
}

export const isResolved = () => resolved;
export const getPhase = () => phase;
export const progress = () => {
  const el = (performance.now() - bootStart) / 1000;
  return resolved ? 1 : smooth(Math.min(1, (el - CFG.crt.warm) / CFG.crt.fade));
};

export function frame(now, dt) {
  if (!disp) return;
  const C = CFG.crt;
  const elapsed = (now - bootStart) / 1000;
  // live tube characteristics — each on its own clock, see CFG.drift
  const GRAN = drift(now, CFG.drift && CFG.drift.gran, C.gran);
  const CHROMA = drift(now, CFG.drift && CFG.drift.chroma, C.chroma);

  let p = phase === 'warm' ? 0 : smooth(Math.min(1, (elapsed - C.warm) / C.fade));
  if (resolved) p = 1;
  if (phase === 'warm' && elapsed >= C.warm) phase = 'resolve';
  if (phase === 'resolve' && p >= 1) { resolved = true; phase = 'etch'; }

  /* ---- 1. chromatic composite ---- */
  wctx.globalCompositeOperation = 'source-over';
  wctx.clearRect(0, 0, WORKW, WORKH);
  if (chR) {
    const settle = 1 - p;
    const dx = (CHROMA + settle * 22) * (0.6 + 0.4 * Math.sin(now * 0.004));
    const dy = settle * 3 * Math.sin(now * 0.003);
    wctx.globalCompositeOperation = 'lighter';
    wctx.drawImage(chR, dx, -dy);
    wctx.drawImage(chG, 0, 0);
    wctx.drawImage(chB, -dx, dy);
    wctx.globalCompositeOperation = 'source-over';
  }

  /* ---- 2. pixel block, large -> steady across the resolve ---- */
  const block = Math.max(1, Math.round((1 - p) * 46 + p * C.pixel));
  let src = work;
  if (block > 1) {
    const lw = Math.max(1, Math.round(WORKW / block));
    const lh = Math.max(1, Math.round(WORKH / block));
    // The downscale MUST land in its own buffer. Drawing work2 onto itself
    // composites source-over, so with a transparent-background source the
    // small intermediate in the top-left corner survives wherever the upscaled
    // frame is transparent — a second signature floating in the corner.
    tctx.clearRect(0, 0, WORKW, WORKH);
    tctx.imageSmoothingEnabled = true;
    tctx.drawImage(work, 0, 0, WORKW, WORKH, 0, 0, lw, lh);    // down = average
    w2ctx.clearRect(0, 0, WORKW, WORKH);
    w2ctx.imageSmoothingEnabled = false;
    w2ctx.drawImage(tiny, 0, 0, lw, lh, 0, 0, WORKW, WORKH);   // up = blocky
    src = work2;
  }

  /* ---- 3. flicker ---- */
  const fA = C.flicker / 100;
  const dim = 1 - fA * (0.05 + 0.05 * Math.random() + 0.03 * Math.sin(now * 0.05))
                - (Math.random() < 0.012 * fA ? 0.25 : 0);

  /* ---- 4. blit with horizontal granulation bands ---- */
  const SW = disp.width, SH = disp.height;
  sctx.globalCompositeOperation = 'source-over';
  sctx.clearRect(0, 0, SW, SH);
  sctx.fillStyle = '#000'; sctx.fillRect(0, 0, SW, SH);
  sctx.globalAlpha = Math.max(0, Math.min(1, p * dim));

  const gA = GRAN / 100, sy = SH / WORKH, bandPx = 3, tear = 0.06 * gA;
  for (let wy = 0; wy < WORKH; wy += bandPx) {
    const bh = Math.min(bandPx, WORKH - wy);
    let off = (Math.sin(wy * 0.21 + now * 0.006) * 1.4 + (Math.random() - 0.5) * 1.2) * gA * 6;
    if (Math.random() < tear) off += (Math.random() - 0.5) * 60 * gA;
    off += (1 - p) * Math.sin(wy * 0.5 + now * 0.02) * 14;   // extra shear while resolving
    sctx.drawImage(src, 0, wy, WORKW, bh, off * (SW / WORKW), wy * sy, SW, bh * sy);
  }
  sctx.globalAlpha = 1;

  /* ---- 5. scrolling static + cathode roll band ---- */
  scrollPhase += (C.scroll / 100) * (dt || 16) * 0.012;
  noiseFrame++;
  if (C.noise > 0) {
    if (noiseFrame % 2 === 0) regenNoise();
    sctx.globalCompositeOperation = 'screen';
    sctx.globalAlpha = (C.noise / 100) * 0.18;
    const oy = (scrollPhase * 16) % SH;
    sctx.drawImage(noiseCv, 0, oy - SH, SW, SH);
    sctx.drawImage(noiseCv, 0, oy, SW, SH);
    sctx.globalAlpha = 1;
  }
  {
    const rollY = ((scrollPhase * 18) % (SH + SH * 0.18)) - SH * 0.18;
    const bandH = SH * 0.16;
    const g = sctx.createLinearGradient(0, rollY, 0, rollY + bandH);
    g.addColorStop(0, 'rgba(180,225,255,0)');
    g.addColorStop(0.5, 'rgba(180,225,255,0.10)');
    g.addColorStop(1, 'rgba(180,225,255,0)');
    sctx.globalCompositeOperation = 'screen';
    sctx.fillStyle = g; sctx.fillRect(0, rollY, SW, bandH);
    sctx.globalCompositeOperation = 'source-over';
  }
}

/* back to a cold tube; the resolve runs again from block 46 */
export function reboot() {
  bootStart = performance.now();
  phase = 'warm'; resolved = false;
  scrollPhase = 0; noiseFrame = 0;
}

/* current drifted tube characteristics — read by the harness, handy in console */
export const levels = () => ({
  gran: drift(performance.now(), CFG.drift && CFG.drift.gran, CFG.crt.gran),
  chroma: drift(performance.now(), CFG.drift && CFG.drift.chroma, CFG.crt.chroma)
});

export function surge(ms = 140) {
  crtEl.classList.add('surge-on');
  setTimeout(() => crtEl.classList.remove('surge-on'), ms);
}
