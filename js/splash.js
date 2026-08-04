// ============ ACT 1 — SPLASH ============
// Replaces the CRT tube and the two-job laser gantry.
//
// At load the page shows: a pixelated statistical band across the middle, the
// url, the entry button, and the power module. No signature, no cube, no fade
// in, no chroma split, no sheen.
//
// Pointer proximity to the entry button charges the page. That charge drives
// the band (local heat + wave layers under where the signature will land), the
// url glow, the button chrome and the whole power module.
//
// The press cuts the signature in pen order over CFG.splash.writeMs, then holds
// the finished mark for CFG.splash.holdMs before wiping to act 2. All of the
// electrical behaviour — arc discharge across the gaps in the hand, laser-cut
// spark bursts — is gated on what has actually been written, so nothing ever
// strikes ink that does not exist yet.
//
// Geometry comes from assets/data/signature.json via signature.js: real stroke
// order with arc-length tables, so the head moves at constant feed.

import { CFG } from './config.js';
import * as sig from './signature.js';
import * as audio from './audio.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

let cv = null, ctx = null, btn = null, nameEl = null, wipeEl = null;
let W = 0, H = 0, DPR = 1;
let onDone = null;

let power = 0, writeU = 0;
let firing = false, fireStart = 0, live = false;
let fuseStart = 0;

export const isLive = () => live;
/* 0 while idle, 1 for the whole length of the press cue — the phase-lock gauge
   uses it to overlay its chaotic red traces. */
export const isFiring = () => firing;
export const progress = () => writeU;

/* ================================================================= setup */
export function init(canvas, button, name, wipe) {
  cv = canvas; ctx = cv.getContext('2d');
  btn = button; nameEl = name; wipeEl = wipe;

  buildGeometry();
  size();

  addEventListener('pointermove', onMove);
  addEventListener('pointerdown', () => audio.loopRetry());
  addEventListener('pointerleave', () => { pointer.seen = false; });
  live = true;
}

export function onEnter(fn) { onDone = fn; }

export function size() {
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  cv.width = Math.max(1, W * DPR);
  cv.height = Math.max(1, H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  bandBuffer = null;
  layout();
}

/* return to the untouched splash */
export function reset() {
  power = 0; writeU = 0;
  firing = false; live = true;
  sparks.length = 0; arcs.length = 0; cuts.length = 0; bandFlares.length = 0; bolts.length = 0;
  loopOn = false; audio.loopStop();
  wipeEl.style.display = 'none';
  wipeEl.style.right = '100%';
  fuseStart = 0; fuseArcs.length = 0;
  btn.classList.remove('blown');
  btn.style.cssText = '';
  btn.disabled = false;
}

const bandY = () => Math.round(H * CFG.splash.bandCentre);

/* ---- where the signature sits, in screen px ---- */
let box = { cx: 0, cy: 0, w: 0, s: 0 };
function layout() {
  box.w  = Math.min(W * CFG.splash.sigW, CFG.splash.sigMax);
  box.s  = box.w / 2;                       // signature x runs -1..1
  box.cx = W / 2;
  box.cy = bandY();
}

/* ================================================== signature geometry
   Emitters and arc candidates are derived once from the vector data. Every
   emitter carries the fraction of total arc length at which the head passes
   it, which is what gates the electrical behaviour during the cut. */
const emit = { x: [], y: [], u: [] };      // signature units, plus reveal frac
let arcPairs = [];                          // [ax,ay,bx,by,u] * n
/* The rail placard draws the same signature with the same discharge, so it
   reuses this rather than rebuilding an identical pool. Signature units. */
export const inkGeometry = () => ({ emit, pairs: arcPairs });
let occ = null, occW = 0, occH = 0, occAspect = 0.34;

function buildGeometry() {
  const S = sig.get();
  if (!S) return;
  occAspect = S.aspect || 0.34;
  const total = S.total || S.strokes.reduce((a, b) => a + b.len, 0);

  // ---- emitters: resample every stroke at fixed arc length ----
  // The stored points are RDP-simplified, so their spacing follows curvature,
  // not distance — reusing them directly clusters emitters in the tight loops
  // and starves the long runs. Interpolate along each segment instead.
  const STEP = CFG.splash.emitStep;
  emit.x.length = emit.y.length = emit.u.length = 0;
  let run = 0;
  for (const st of S.strokes) {
    let target = 0, i = 1;
    while (target <= st.len && i < st.pts.length) {
      while (i < st.pts.length - 1 && st.cum[i] < target) i++;
      const c0 = st.cum[i - 1], c1 = st.cum[i];
      const f = c1 > c0 ? (target - c0) / (c1 - c0) : 0;
      const a = st.pts[i - 1], b = st.pts[i];
      emit.x.push(a[0] + (b[0] - a[0]) * f);
      emit.y.push(a[1] + (b[1] - a[1]) * f);
      emit.u.push((run + target) / total);
      target += STEP;
    }
    run += st.len;
  }

  // ---- occupancy grid, for "is this gap actually empty?" ----
  // x in [-1,1], y in [-aspect,aspect]. A vector hit-test against every
  // segment would be O(n) per probe; a grid makes it O(1) and the ink is
  // thin enough that a cell either has a stroke through it or does not.
  occW = 320; occH = Math.max(8, Math.round(occW * occAspect));
  occ = new Uint8Array(occW * occH);
  const mark = (x, y) => {
    const gx = Math.round((x + 1) / 2 * (occW - 1));
    const gy = Math.round((y + occAspect) / (2 * occAspect) * (occH - 1));
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const a = gx + dx, b = gy + dy;
        if (a >= 0 && a < occW && b >= 0 && b < occH) occ[b * occW + a] = 1;
      }
  };
  for (const st of S.strokes) {
    for (let i = 1; i < st.pts.length; i++) {
      const a = st.pts[i - 1], b = st.pts[i];
      const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.004));
      for (let k = 0; k <= n; k++) mark(a[0] + (b[0] - a[0]) * k / n,
                                        a[1] + (b[1] - a[1]) * k / n);
    }
  }
  const solid = (x, y) => {
    const gx = Math.round((x + 1) / 2 * (occW - 1));
    const gy = Math.round((y + occAspect) / (2 * occAspect) * (occH - 1));
    if (gx < 0 || gx >= occW || gy < 0 || gy >= occH) return 0;
    return occ[gy * occW + gx];
  };

  // ---- arc candidates ----
  // Pairs close enough for current to jump where the space between them is
  // NOT ink. That emptiness test is what keeps an arc jumping a gap instead
  // of just tracing along a stroke. Deliberately capped short: wider
  // letter-to-letter jumps were tried and saturated the frame.
  const A = CFG.splash.arc;
  const n = emit.x.length;
  arcPairs = [];
  let tries = 0;
  while (arcPairs.length < A.pool * 5 && tries < 60000) {
    tries++;
    const i = Math.random() * n | 0, j = Math.random() * n | 0;
    const ax = emit.x[i], ay = emit.y[i], bx = emit.x[j], by = emit.y[j];
    const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy);
    if (d < A.min || d > A.max) continue;
    let empty = 0;
    for (let k = 1; k <= 5; k++) {
      const u = k / 6;
      if (!solid(ax + dx * u, ay + dy * u)) empty++;
    }
    if (empty < 4) continue;
    arcPairs.push(ax, ay, bx, by, Math.max(emit.u[i], emit.u[j]));
  }
}

const sx = x => box.cx + x * box.s;
const sy = y => box.cy - y * box.s;

/* ================================================================== power */
const pointer = { x: -9999, y: -9999, seen: false };
function onMove(e) { pointer.x = e.clientX; pointer.y = e.clientY; pointer.seen = true; }

function proximity() {
  if (!pointer.seen || !btn) return 0;
  const r = btn.getBoundingClientRect();
  const dx = Math.max(r.left - pointer.x, 0, pointer.x - r.right);
  const dy = Math.max(r.top - pointer.y, 0, pointer.y - r.bottom);
  const d = Math.hypot(dx, dy);
  const p = 1 - Math.min(1, d / CFG.splash.proxRadius);
  return p * p;             // tight falloff — the last stretch counts most
}

let loopOn = false;

/* Compared in gauge percent, not in internal power, so the threshold means the
   same thing as the number on the readout. Two thresholds so a pointer resting
   on the boundary cannot chatter it, but the gap is deliberately narrow —
   0.5 of a percent — so it fires as soon as the charge is genuinely climbing. */
function updateLoop(p) {
  const C = CFG.splash;
  if (!C.loop) return;
  const charge = C.baseCharge + (100 - C.baseCharge) * p;
  if (!loopOn && charge >= C.loopOnPct) { loopOn = true; audio.loopStart(C.loop); }
  else if (loopOn && charge < C.loopOffPct) { loopOn = false; audio.loopStop(); }
}

function updatePower(now) {
  let target;
  if (firing) {
    const k = Math.min(1, (now - fireStart) / CFG.splash.writeMs);
    target = 1;
    power = Math.max(power, k);
    // Gentle ease-in so the head leans into the first stroke instead of
    // launching off the mark. Continuous, and still lands exactly on 1.
    writeU = k * (0.4 + 0.6 * k);
  } else {
    target = proximity();
  }
  power += (target - power) * (firing ? 0.25 : 0.09);
  power = power < 0 ? 0 : power > 1 ? 1 : power;
}

/* ---- fuse blow ----
   The press over-volts the button. It does not fade out and it does not simply
   disable: it goes pale, the brackets snap off, current arcs across the gap
   where the label was, and what is left is a dull filament cooling in the dark.

   All of it is painted per-frame rather than transitioned, for the same reason
   as the rest of this page — and because the profile has to be shaped, not
   eased. The spike is 60ms, the collapse 240ms, then a long ember. A symmetric
   ease would read as a dimmer being turned down. */
function paintFuse(now) {
  const F = CFG.splash;
  const t = (now - fuseStart) / 1000;
  const spike = F.fuseSpike, fall = F.fuseFall, ember = F.fuseEmber;

  let hot, edge, glow, label;
  if (t < spike) {
    // over-volt: brighter than the button is ever allowed to be otherwise
    const k = t / spike;
    hot = 1 + 0.9 * (1 - k);
    edge = 1; glow = 46; label = 1;
  } else if (t < spike + fall) {
    // collapse, steep at the start
    const k = (t - spike) / fall;
    const e = 1 - Math.pow(k, 0.45);
    hot = 0.55 * e; edge = e; glow = 40 * e; label = Math.max(0, 1 - k * 2.6);
  } else {
    // filament: a dull ember, decaying slowly, never quite black
    const k = Math.min(1, (t - spike - fall) / ember);
    const e = (1 - k) * (1 - k);
    hot = 0.10 * e; edge = 0.12 + 0.24 * e; glow = 7 * e; label = 0;
  }

  btn.style.borderColor = `rgba(${(200 + 55 * hot) | 0},${(32 + 150 * hot) | 0},${(42 + 130 * hot) | 0},${(0.22 + 0.78 * edge).toFixed(3)})`;
  btn.style.boxShadow = `0 0 ${glow.toFixed(1)}px rgba(255,${(74 + 120 * hot) | 0},${(61 + 110 * hot) | 0},${(0.25 + 0.6 * edge).toFixed(3)})`;
  btn.style.color = `rgba(255,${(215 + 40 * hot) | 0},${(205 + 45 * hot) | 0},${label.toFixed(3)})`;
  btn.style.background = `linear-gradient(180deg, rgba(200,32,42,${(0.16 * edge).toFixed(3)}), rgba(120,10,16,${(0.28 * edge).toFixed(3)}))`;
}

/* Arcs across the gap the label used to occupy. Same jitter and same crackle as
   the signature discharge — the button is failing the way the ink conducts. */
const fuseArcs = [];

function updateFuse(now) {
  const F = CFG.splash;
  const t = (now - fuseStart) / 1000;
  if (t > F.fuseSpike + F.fuseFall) return;
  const r = btn.getBoundingClientRect();
  const n = 1 + (Math.random() * 3 | 0);
  for (let i = 0; i < n; i++) {
    // strike between the two vertical edges, at a random height inside the plate
    const y0 = r.top + r.height * (0.22 + Math.random() * 0.56);
    const y1 = r.top + r.height * (0.22 + Math.random() * 0.56);
    fuseArcs.push({
      x0: r.left + 2, y0, x1: r.right - 2, y1,
      age: 0, life: 3 + Math.random() * 6, seed: Math.random() * 977
    });
  }
}

function drawFuse() {
  if (!fuseArcs.length) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(255,90,70,1)';
  for (let i = fuseArcs.length - 1; i >= 0; i--) {
    const a = fuseArcs[i];
    const t = a.age / a.life;
    const al = Math.sin((1 - t) * Math.PI * 0.5);
    const dx = a.x1 - a.x0, dy = a.y1 - a.y0;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const segs = 6 + (len / 14 | 0);

    ctx.shadowBlur = 8;
    ctx.strokeStyle = `rgba(255,${(200 + 40 * al) | 0},190,${(al * 0.9).toFixed(3)})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(a.x0, a.y0);
    for (let k = 1; k < segs; k++) {
      const u = k / segs;
      const rr = Math.sin(a.seed + k * 12.9898 + a.age * 3.7) * 43758.5453;
      const j = rr - Math.floor(rr);
      const off = (j * 2 - 1) * 14 * Math.sin(u * Math.PI);
      ctx.lineTo(a.x0 + dx * u + nx * off, a.y0 + dy * u + ny * off);
    }
    ctx.lineTo(a.x1, a.y1);
    ctx.stroke();
    if (++a.age >= a.life) fuseArcs.splice(i, 1);
  }
  ctx.restore();
  ctx.shadowBlur = 0;
}

/* chrome is painted per-frame; no CSS transitions on this page */
function paintChrome(p) {
  btn.style.borderColor = `rgba(255,74,61,${(0.45 + 0.55 * p).toFixed(3)})`;
  btn.style.boxShadow   = `0 0 ${(4 + 28 * p).toFixed(1)}px rgba(200,32,42,${(0.25 + 0.6 * p).toFixed(3)})`;
  btn.style.color       = `rgba(255,${(200 + 40 * p) | 0},${(190 + 50 * p) | 0},${(0.25 + 0.75 * p).toFixed(2)})`;
  /* The name is NOT driven by proximity. It used to take a growing text-shadow
     here, which on top of the canvas plate read as the name getting blurrier
     the closer the pointer came — an effect nobody asked for and one that
     fought the crisp plate. The url is a fixed object; the button and the band
     carry the charge. */
}

/* ============================================== pixelated statistical band */
const BAND_GAP = 3;
let bandBuffer = null, bandRows = 26;
const bandFlares = [];

function buildBand() {
  if (W <= 0 || H <= 0) return;
  const cell = CFG.splash.bandCell;
  bandRows = Math.max(16, Math.min(52, Math.round(H * 0.17 / cell)));

  if (!bandBuffer) bandBuffer = document.createElement('canvas');
  bandBuffer.width = Math.max(1, W * DPR);
  bandBuffer.height = Math.max(1, H * DPR);
  const b = bandBuffer.getContext('2d');
  b.setTransform(DPR, 0, 0, DPR, 0, 0);
  b.clearRect(0, 0, W, H);

  const cy = bandY(), cols = Math.ceil(W / cell) + 1;
  for (let row = 0; row < bandRows; row++) {
    const tN = row / bandRows;
    const baseA = (1 - tN) * (1 - tN) * 0.5;
    const yB = Math.round(cy + BAND_GAP + row * cell);
    const yA = Math.round(cy - BAND_GAP - (row + 1) * cell + 1);
    for (let col = 0; col < cols; col++) {
      // deterministic per-cell hash: the field is stable, so it can be baked
      // once and blitted. Two hashes so the halves share statistics without
      // being a literal mirror.
      const hB = ((col * 73856093) ^ (row * 19349663)) >>> 0;
      const hA = ((col * 19349663) ^ (row * 73856093)) >>> 0;
      const nB = (hB % 1000) / 1000, nA = (hA % 1000) / 1000;
      const x = col * cell;
      if (nB > tN * 0.85) {
        b.fillStyle = `rgba(0,230,255,${(baseA * (0.5 + (1 - nB) * 0.5)).toFixed(3)})`;
        b.fillRect(x, yB, cell - 1, cell - 1);
      }
      if (nA > tN * 0.85) {
        b.fillStyle = `rgba(0,230,255,${(baseA * (0.5 + (1 - nA) * 0.5)).toFixed(3)})`;
        b.fillRect(x, yA, cell - 1, cell - 1);
      }
    }
  }
}

/* Horizontal window centred on the signature. Zero outside, so anything it
   drives rejoins the flat centreline with no seam. */
function sigEnv(x) {
  const half = box.w / 2 * 1.22;
  const u = (x - box.cx) / half;
  if (Math.abs(u) >= 1) return 0;
  return 0.5 * (1 + Math.cos(Math.PI * u));
}

/* Heat: the same dither field re-blitted additively in vertical slices,
   weighted by the window. The cells behind the mark are the same cells —
   they just run hot. Cheaper and truer than a second field. */
function drawBandHeat(p) {
  if (!bandBuffer || p <= 0.02) return;
  const x0 = Math.max(0, box.cx - box.w * 0.64);
  const x1 = Math.min(W, box.cx + box.w * 0.64);
  if (x1 <= x0) return;
  const N = 30, sw = (x1 - x0) / N;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < N; i++) {
    const xa = x0 + i * sw;
    const a = sigEnv(xa + sw / 2) * p * 0.95;
    if (a <= 0.012) continue;
    ctx.globalAlpha = Math.min(1, a);
    ctx.drawImage(bandBuffer, xa * DPR, 0, sw * DPR, bandBuffer.height, xa, 0, sw, H);
  }
  ctx.restore();
}

const LAYERS = [
  { k: 0.0210, w: 0.055, amp: 34, a: 0.95, lw: 1.4, c: '0,235,255'   },
  { k: 0.0340, w: 0.081, amp: 22, a: 0.60, lw: 1.0, c: '120,245,255' },
  { k: 0.0132, w: 0.037, amp: 27, a: 0.42, lw: 0.9, c: '0,180,230'   }
];

/* Wave layers that exist only inside the window. At rest they collapse into
   the centreline; under load the band strains around the mark, which is what
   ties the two halves of the composition together. */
function drawBandWaves(p, t) {
  if (p <= 0.02) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.shadowColor = 'rgba(0,230,255,.9)';
  const cy = bandY();
  for (const l of LAYERS) {
    ctx.strokeStyle = `rgba(${l.c},${(l.a * p * 0.9).toFixed(3)})`;
    ctx.lineWidth = l.lw;
    ctx.shadowBlur = 9 * p;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 3) {
      const y = cy - Math.sin(x * l.k - t * l.w) * sigEnv(x) * p * l.amp;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
  ctx.shadowBlur = 0;
}

/* ---- bolts ----
   Discharge from the twinkling dither field down to the centreline, once the
   charge readout passes CFG.splash.boltOnPct. Two constraints shape this:

   1. Count is hard-capped. The letter-to-letter arc experiment already showed
      what happens when this kind of effect gets dense — every strike stops
      reading individually and the whole frame flattens. These stay rarer than
      the signature's own discharge.
   2. Spawn x is pulled toward the pointer, so the activity concentrates where
      the visitor is rather than spreading evenly and going to mush. */
const bolts = [];

function updateBolts(p) {
  if (reduced) return;
  const C = CFG.splash;
  const charge = C.baseCharge + (100 - C.baseCharge) * p;
  if (charge < C.boltOnPct) return;

  const over = Math.min(1, (charge - C.boltOnPct) / (100 - C.boltOnPct));
  if (bolts.length >= C.boltMax) return;
  if (Math.random() > over * C.boltRate) return;

  const cell = C.bandCell, cy = bandY();
  const cols = Math.ceil(W / cell) + 1;
  // pull the origin toward the pointer, but keep some spread
  const px = pointer.seen ? pointer.x : W / 2;
  const spread = W * (0.5 - 0.42 * C.boltBias * over);
  let x = px + (Math.random() * 2 - 1) * spread;
  x = Math.max(0, Math.min(W - 1, x));
  const col = Math.round(x / cell);

  // start somewhere out in the field, on the cell grid, and strike inward
  const row = 2 + Math.random() * (bandRows - 3) | 0;
  const up = Math.random() < 0.5;
  const y0 = up ? cy - BAND_GAP - (row + 1) * cell + 1
                : cy + BAND_GAP + row * cell;
  bolts.push({
    x: col * cell, y0, y1: cy,
    age: 0, life: 5 + Math.random() * 9,
    seed: Math.random() * 977,
    bright: 0.55 + 0.45 * over
  });
}

function drawBolts() {
  if (!bolts.length) return;
  const cell = CFG.splash.bandCell;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(0,220,255,1)';
  for (let i = bolts.length - 1; i >= 0; i--) {
    const b = bolts[i];
    const t = b.age / b.life;
    const a = Math.sin((1 - t) * Math.PI * 0.5) * b.bright;
    const dy = b.y1 - b.y0;
    const segs = 3 + (Math.abs(dy) / 9 | 0);

    ctx.shadowBlur = 6;
    ctx.strokeStyle = `rgba(190,248,255,${a.toFixed(3)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y0);
    for (let k = 1; k < segs; k++) {
      const u = k / segs;
      const r = Math.sin(b.seed + k * 12.9898 + b.age * 3.7) * 43758.5453;
      const j = r - Math.floor(r);
      ctx.lineTo(b.x + (j * 2 - 1) * 9 * Math.sin(u * Math.PI), b.y0 + dy * u);
    }
    ctx.lineTo(b.x, b.y1);
    ctx.stroke();

    // the origin cell lights, and the line it strikes flares where it lands
    ctx.shadowBlur = 4;
    ctx.fillStyle = `rgba(225,252,255,${(a * 0.9).toFixed(3)})`;
    ctx.fillRect(b.x, b.y0, cell - 1, cell - 1);
    ctx.fillStyle = `rgba(215,250,255,${(a * 0.7).toFixed(3)})`;
    ctx.fillRect(b.x - 3, b.y1 - 1.5, 7, 3);

    if (++b.age >= b.life) bolts.splice(i, 1);
  }
  ctx.restore();
  ctx.shadowBlur = 0;
}

function drawBand(p, wp, t) {
  if (!bandBuffer) buildBand();
  if (bandBuffer && bandBuffer.width > 0)
    ctx.drawImage(bandBuffer, 0, 0, bandBuffer.width, bandBuffer.height, 0, 0, W, H);
  drawBandHeat(p);

  const cy = bandY();
  ctx.strokeStyle = 'rgba(0,255,255,.92)';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = 'rgba(0,230,255,1)';
  ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.moveTo(0, cy + .5); ctx.lineTo(W, cy + .5); ctx.stroke();
  ctx.shadowBlur = 0;

  drawBandWaves(wp, t);
}

function spawnBandFlare(inWindow) {
  const cell = CFG.splash.bandCell, cy = bandY();
  const cols = Math.ceil(W / cell) + 1;
  const col = inWindow
    ? Math.max(0, Math.min(cols - 1, Math.round((box.cx - box.w / 2 + Math.random() * box.w) / cell)))
    : Math.floor(Math.random() * cols);
  const row = Math.floor(Math.random() * bandRows);
  const r = Math.random();
  let kind, life;
  if (r < .50)      { kind = 'spark';   life =  8 + (Math.random() * 12 | 0); }
  else if (r < .85) { kind = 'hold';    life = 50 + (Math.random() * 40 | 0); }
  else              { kind = 'flicker'; life = 20 + (Math.random() * 20 | 0); }
  const y = Math.random() < .5
    ? Math.round(cy + BAND_GAP + row * cell)
    : Math.round(cy - BAND_GAP - (row + 1) * cell + 1);
  bandFlares.push({ x: col * cell, y, age: 0, life, kind, maxA: .65 + Math.random() * .35 });
}

function drawBandFlares(p) {
  if (Math.random() < CFG.splash.bandFlare) spawnBandFlare(false);
  if (Math.random() < 0.55 * p) spawnBandFlare(true);
  const cell = CFG.splash.bandCell;
  ctx.shadowColor = 'rgba(0,230,255,1)';
  ctx.shadowBlur = 6;
  for (let i = bandFlares.length - 1; i >= 0; i--) {
    const f = bandFlares[i], t = f.age / f.life;
    let br;
    if (f.kind === 'spark') br = Math.sin(t * Math.PI);
    else if (f.kind === 'hold') {
      const aE = 3 / f.life, dS = 1 - 8 / f.life;
      br = t < aE ? t / aE : (t < dS ? 1 : (1 - t) / (1 - dS));
    } else br = (Math.random() < .65 ? 1 : 0) * Math.sin(t * Math.PI);
    const a = Math.max(0, Math.min(1, br)) * f.maxA;
    if (a > .02) {
      ctx.fillStyle = `rgba(220,250,255,${a.toFixed(3)})`;
      ctx.fillRect(f.x, f.y, cell - 1, cell - 1);
    }
    if (++f.age >= f.life) bandFlares.splice(i, 1);
  }
  ctx.shadowBlur = 0;
}

/* ============================================================= signature
   Drawn in three tiers rather than one pass: a wide halo (the field around
   the wire), the conductor itself, then — only once there is current in it —
   a thin unblurred core that reads as the metal going bright from inside.
   One blurred pass just reads as a dimmer being turned up. */
function inkColour(p) {
  const a = [0, 190, 235], b = [175, 248, 255];
  const k = Math.pow(p, 1.6);
  return `rgb(${(a[0]+(b[0]-a[0])*k)|0},${(a[1]+(b[1]-a[1])*k)|0},${(a[2]+(b[2]-a[2])*k)|0})`;
}

let head = null;
function drawSignature(p) {
  if (writeU <= 0) { head = null; return; }
  const w = box.w;
  const base = Math.max(1.3, w * 0.0052);

  ctx.save();
  ctx.globalAlpha = 0.22 + 0.34 * p;
  sig.drawTo(ctx, box.cx, box.cy, w, writeU, {
    color: inkColour(p), width: base * 1.7,
    glow: 'rgba(0,215,255,.95)', blur: 16 + 66 * Math.pow(p, 1.3)
  });

  ctx.globalAlpha = 0.6 + 0.4 * p;
  head = sig.drawTo(ctx, box.cx, box.cy, w, writeU, {
    color: inkColour(p), width: base,
    glow: 'rgba(0,215,255,.95)', blur: 3 + 16 * p
  });

  if (p > 0.32) {
    ctx.globalAlpha = ((p - 0.32) / 0.68) * 0.8;
    sig.drawTo(ctx, box.cx, box.cy, w, writeU, {
      color: 'rgb(190,250,255)', width: base * 0.55
    });
  }
  ctx.restore();

  if (writeU < 1 && head) drawHead(head[0], head[1]);
}

function drawHead(x, y) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, 22);
  g.addColorStop(0,    'rgba(225,253,255,.98)');
  g.addColorStop(0.16, 'rgba(120,240,255,.72)');
  g.addColorStop(0.45, 'rgba(0,190,245,.26)');
  g.addColorStop(1,    'rgba(0,120,210,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, 22, 0, 6.283); ctx.fill();
  ctx.fillStyle = 'rgba(240,255,255,.95)';
  ctx.beginPath(); ctx.arc(x, y, 1.8, 0, 6.283); ctx.fill();
  ctx.restore();
}

/* ================================================================== arcs */
const arcs = [];

function spawnArc() {
  if (!arcPairs.length) return;
  for (let t = 0; t < 14; t++) {
    const i = (Math.random() * (arcPairs.length / 5) | 0) * 5;
    if (arcPairs[i + 4] > writeU) continue;      // both ends must exist yet
    arcs.push({
      x0: sx(arcPairs[i]),     y0: sy(arcPairs[i + 1]),
      x1: sx(arcPairs[i + 2]), y1: sy(arcPairs[i + 3]),
      age: 0, life: 3 + Math.random() * 7, seed: Math.random() * 977
    });
    return;
  }
}

function updateArcs(p) {
  if (reduced || writeU <= 0) return;
  const over = Math.max(0, (p - CFG.splash.arc.threshold) / (1 - CFG.splash.arc.threshold));
  if (over <= 0) return;
  let n = over * over * CFG.splash.arc.rate;
  while (n > 0) { if (Math.random() < Math.min(1, n)) spawnArc(); n -= 1; }
}

function drawArcs() {
  if (!arcs.length) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(0,220,255,1)';
  for (let i = arcs.length - 1; i >= 0; i--) {
    const a = arcs[i];
    const t = a.age / a.life;
    const al = Math.sin((1 - t) * Math.PI * 0.5);
    const dx = a.x1 - a.x0, dy = a.y1 - a.y0;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const segs = 4 + (len / 8 | 0);

    ctx.shadowBlur = 7;
    ctx.strokeStyle = `rgba(195,250,255,${(al * 0.92).toFixed(3)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(a.x0, a.y0);
    for (let k = 1; k < segs; k++) {
      const u = k / segs;
      // re-randomised every frame it is alive, so an arc crackles
      const r = Math.sin(a.seed + k * 12.9898 + a.age * 3.7) * 43758.5453;
      const j = r - Math.floor(r);
      const off = (j * 2 - 1) * len * 0.18 * Math.sin(u * Math.PI);
      ctx.lineTo(a.x0 + dx * u + nx * off, a.y0 + dy * u + ny * off);
    }
    ctx.lineTo(a.x1, a.y1);
    ctx.stroke();

    ctx.shadowBlur = 4;
    ctx.fillStyle = `rgba(215,252,255,${(al * 0.6).toFixed(3)})`;
    ctx.fillRect(a.x0 - 1, a.y0 - 1, 2.4, 2.4);
    ctx.fillRect(a.x1 - 1, a.y1 - 1, 2.4, 2.4);
    if (++a.age >= a.life) arcs.splice(i, 1);
  }
  ctx.restore();
  ctx.shadowBlur = 0;
}

/* ================================================== laser-cut spark bursts
   Not a particle spray. A cut point heats in place, fires ONE burst, flashes
   out and relocates. While the head is cutting there is exactly one cut point
   and it rides the pen tip, which is where sparks should come from. */
const sparks = [], cuts = [];
const CAP = 900;

function inkPoint() {
  const n = emit.x.length;
  for (let t = 0; t < 14; t++) {
    const k = Math.random() * n | 0;
    if (emit.u[k] > writeU) continue;
    return { x: sx(emit.x[k]), y: sy(emit.y[k]) };
  }
  return head ? { x: head[0], y: head[1] } : { x: box.cx, y: box.cy };
}

function newCut() {
  const q = inkPoint();
  return {
    x: q.x, y: q.y, phase: 'charge', age: 0, warm: 0,
    chargeLen: 8 + Math.random() * 22,
    darkLen:   6 + Math.random() * 34,
    dir:  Math.PI * (0.10 + Math.random() * 0.80),   // ejecta falls away
    cone: 0.30 + Math.random() * 0.34
  };
}

function throwSpark(c, over) {
  const ang = c.dir + (Math.random() - 0.5) * c.cone * 2;
  const spd = 4.5 + Math.random() * Math.random() * 15 * (0.5 + over);
  sparks.push({
    x: c.x, y: c.y,
    vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
    age: 0, life: 9 + Math.random() * 19,
    w: 0.7 + Math.random() * 0.9,
    fork: Math.random() < 0.18, forked: false
  });
}

function forkSpark(s) {
  const n = 2 + (Math.random() * 2 | 0);
  for (let i = 0; i < n && sparks.length < CAP; i++) {
    const ang = Math.atan2(s.vy, s.vx) + (Math.random() - 0.5) * 2.4;
    const spd = 1.6 + Math.random() * 3.4;
    sparks.push({
      x: s.x, y: s.y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      age: 0, life: 5 + Math.random() * 10,
      w: 0.6 + Math.random() * 0.6, fork: false, forked: true
    });
  }
}

function updateCuts(p) {
  if (reduced || writeU <= 0) { cuts.length = 0; return; }

  if (writeU < 1 && head) {
    if (!cuts.length) cuts.push(newCut());
    cuts.length = 1;
    const c = cuts[0];
    c.x = head[0]; c.y = head[1]; c.warm = 1;
    c.dir = Math.PI * (0.10 + Math.random() * 0.80);
    if (sparks.length < CAP) {
      const n = 2 + (Math.random() * 4 | 0);
      for (let k = 0; k < n; k++) throwSpark(c, 1);
    }
    return;
  }

  const thr = CFG.splash.sparkThreshold;
  const over = (p - thr) / (1 - thr);
  const want = over <= 0 ? 0 : Math.round(1 + 4 * over);
  while (cuts.length < want) cuts.push(newCut());
  while (cuts.length > want) cuts.pop();

  for (const c of cuts) {
    c.age++;
    if (c.phase === 'charge') {
      c.warm = Math.min(1, c.age / c.chargeLen);
      if (c.age >= c.chargeLen) {
        const n = Math.round((10 + Math.random() * 22) * (0.45 + over));
        for (let k = 0; k < n && sparks.length < CAP; k++) throwSpark(c, over);
        c.phase = 'pop'; c.age = 0; c.warm = 1;
      }
    } else if (c.phase === 'pop') {
      c.warm = Math.max(0, 1 - c.age / 5);
      if (c.age >= 5) { c.phase = 'dark'; c.age = 0; }
    } else {
      c.warm = 0;
      if (c.age >= c.darkLen) Object.assign(c, newCut());
    }
  }
}

/* Held inside the signature's blue family: pale cyan at ejection, saturated
   cyan, then deep blue as it dies. Never white. */
function sparkColour(t) {
  if (t < 0.22) { const k = t / 0.22; return [180 - 150 * k, 248 - 30 * k, 255]; }
  const k = Math.min(1, (t - 0.22) / 0.78);
  return [30 - 25 * k, 218 - 130 * k, 255 - 90 * k];
}

function drawSparks() {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';

  for (const c of cuts) {
    if (c.warm <= 0.02) continue;
    const r = 2 + 5 * c.warm;
    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r * 2.6);
    g.addColorStop(0,   `rgba(200,250,255,${(0.95 * c.warm).toFixed(3)})`);
    g.addColorStop(0.3, `rgba(40,220,255,${(0.55 * c.warm).toFixed(3)})`);
    g.addColorStop(1,   'rgba(0,120,220,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(c.x, c.y, r * 2.6, 0, 6.283); ctx.fill();
  }

  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    const t = s.age / s.life;
    const a = (1 - t) * (1 - t * 0.4);
    const [r, g, b] = sparkColour(t);

    // streak from where it was to where it is: length follows speed, which
    // is what makes it read as ejection rather than a dot
    ctx.strokeStyle = `rgba(${r|0},${g|0},${b|0},${a.toFixed(3)})`;
    ctx.lineWidth = s.w;
    ctx.beginPath();
    ctx.moveTo(s.x - s.vx * 1.7, s.y - s.vy * 1.7);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();

    if (t < 0.5) {
      ctx.fillStyle = `rgba(200,250,255,${(a * (1 - t * 2) * 0.8).toFixed(3)})`;
      ctx.fillRect(s.x - s.w * 0.5, s.y - s.w * 0.5, s.w * 1.3, s.w * 1.3);
    }

    s.x += s.vx; s.y += s.vy;
    s.vy += 0.22;
    s.vx *= 0.945; s.vy *= 0.955;
    if (s.fork && !s.forked && t > 0.55) { s.forked = true; forkSpark(s); }
    if (++s.age >= s.life || s.y > H + 40) sparks.splice(i, 1);
  }
  ctx.restore();
}

/* ================================================================ the press */
export function fire() {
  if (firing || !live) return;
  firing = true; live = false;
  fireStart = performance.now();
  btn.disabled = true;
  fuseStart = performance.now();
  btn.classList.add('blown');          // snaps the corner brackets off
  loopOn = false; audio.loopStop();
  audio.cue(CFG.splash.sfx);
  // cut, then hold the finished mark with the arcs still crackling over it
  setTimeout(runWipe, CFG.splash.writeMs + CFG.splash.holdMs);
}

function runWipe() {
  wipeEl.style.display = 'block';
  const t0 = performance.now(), dur = CFG.splash.wipeMs;
  (function step() {
    const k = Math.min(1, (performance.now() - t0) / dur);
    const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    wipeEl.style.right = ((1 - e) * 100).toFixed(2) + '%';
    if (k < 1) requestAnimationFrame(step);
    else if (onDone) onDone();
  })();
}

/* ================================================================== frame */
export function frame(now) {
  updatePower(now);
  const p = power;
  if (!firing) updateLoop(p);

  /* Wave drive, not raw power. The horizontal layers are the visual half of
     the charged bed: if the loop is audible the waves must be visibly moving,
     or the sound reads as unrelated to anything on screen. Crossing the
     threshold therefore snaps the drive up to a floor instead of letting the
     amplitude creep up from nothing. */
  const wp = loopOn ? Math.max(p, CFG.splash.waveFloor) : p;

  ctx.fillStyle = '#04070b';
  ctx.fillRect(0, 0, W, H);

  drawBand(p, wp, now * 0.06);
  if (!reduced) drawBandFlares(p);
  updateBolts(p);
  drawBolts();
  drawSignature(p);
  updateArcs(p);
  drawArcs();
  updateCuts(p);
  drawSparks();

  if (fuseStart) { updateFuse(now); drawFuse(); paintFuse(now); }
  else paintChrome(p);
  return p;
}
