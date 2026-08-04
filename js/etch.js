// ============ THE ETCH LAYER ============
// The front glass of the tube. A 4-node gantry rides the screen edges and fires
// converging beams onto the advancing burn front.
//
// Two jobs run in order (CFG.etchJobs):
//   1. 'url'   — carve nathanherling.com under the signature
//   2. 'enter' — carve the [PRESS TO ENTER] button: border -> scratch -> text
//
// Tool rules, enforced here and not negotiable:
//   * the head parks centred, and travels straight to its first cut with the
//     beams dark; that arrival IS its first contact
//   * beams and sparks stop on the frame a cut completes — no trailing marks
//   * completed cuts persist and glow; they never re-animate

import { CFG, pal, clamp01 } from './config.js';

let cv = null, ectx = null, enterBtn = null;
let EW = 0, EH = 0, eDPR = 1;

let jobs = [], ji = -1;
let mode = 'idle';            // idle | arm | cut | rest | live
let tMark = 0, head = null, beamsOn = false, liveAt = 0;
let nodes = [], sparks = [], smoke = [], cracks = [], flashes = [];
let crackMark = 0, doneCb = null, statusCb = null, lastStatus = '', popCount = 0;
let hots = [];   // spots on the url currently heating toward a pop
let crackSplit = [0, 0];   // [thrown during the cut, thrown at completion]

const MAXS = 2200, MAXSM = 320;
const REST_MS = 460;
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const centre = () => ({ x: EW / 2, y: EH / 2 });

/* ===================== setup ===================== */

export function init(canvas, btn) {
  cv = canvas; ectx = cv.getContext('2d'); enterBtn = btn;
  size();
}
export function onDone(fn) { doneCb = fn; }
export function onStatus(fn) { statusCb = fn; }
function say(t, m) { if (t !== lastStatus && statusCb) { statusCb(t, m); lastStatus = t; } }

export function size() {
  const r = cv.getBoundingClientRect();
  eDPR = Math.min(window.devicePixelRatio || 1, 2);
  EW = Math.max(2, Math.round(r.width * eDPR));
  EH = Math.max(2, Math.round(r.height * eDPR));
  cv.width = EW; cv.height = EH;
  build();
}

function poly(pts) {
  const cum = [0]; let t = 0;
  for (let i = 1; i < pts.length; i++) {
    t += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); cum.push(t);
  }
  return { pts, cum, total: t || 1 };
}

function build() {
  if (!EW) return;
  const P = pal(), F = CFG.frame;
  const keep = jobs.map(j => j.done);
  jobs = CFG.etchJobs.map((spec, i) => {
    const j = Object.assign({}, spec, { done: !!keep[i] });
    if (spec.kind === 'text') buildTextJob(j, CFG.domain, EH * F.urlCy, EH * 0.048, P, 0.14);
    else buildButtonJob(j, CFG.enterText, EH * F.btnCy, EH * 0.055, P);
    return j;
  });
  buildNodes();
}

function sprites(text, cx, cy, fontPx, ls, P) {
  const font = `700 ${fontPx}px 'Share Tech Mono', monospace`;
  const blur = fontPx;
  const base = draw => {
    const c = mk(EW, EH), g = c.getContext('2d');
    g.font = font; try { g.letterSpacing = ls + 'px'; } catch (e) {}
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineJoin = 'round'; g.lineCap = 'round';
    draw(g); return c;
  };
  // readable burn: white core lifted off the glow by a dark engraved contour,
  // with a thin beam-coloured rim so it still reads as laser work
  const cool = base(g => {
    g.shadowColor = 'rgba(2,6,10,0.7)'; g.shadowBlur = blur * 0.4;
    g.lineWidth = fontPx * 0.30; g.strokeStyle = 'rgba(3,7,11,0.96)'; g.strokeText(text, cx, cy);
    g.shadowBlur = 0;
    g.lineWidth = fontPx * 0.16; g.strokeStyle = 'rgba(3,7,11,0.98)'; g.strokeText(text, cx, cy);
    g.lineWidth = fontPx * 0.06; g.strokeStyle = P.hot2; g.strokeText(text, cx, cy);
    g.fillStyle = '#ffffff'; g.fillText(text, cx, cy);
  });
  const hot = base(g => {
    g.shadowColor = P.glow; g.shadowBlur = blur * 0.5; g.fillStyle = P.hot; g.fillText(text, cx, cy);
    g.shadowBlur = 0; g.fillStyle = P.hot2; g.fillText(text, cx, cy);
  });
  const edge = base(g => {
    g.shadowColor = P.hot;  g.shadowBlur = blur * 1.4; g.lineWidth = fontPx * 0.13; g.strokeStyle = P.hot;  g.strokeText(text, cx, cy);
    g.shadowColor = P.glow; g.shadowBlur = blur * 0.7; g.lineWidth = fontPx * 0.08; g.strokeStyle = P.hot;  g.strokeText(text, cx, cy);
    g.shadowBlur = blur * 0.28; g.lineWidth = fontPx * 0.05; g.strokeStyle = P.hot2; g.strokeText(text, cx, cy);
    g.shadowColor = 'rgba(255,255,255,0.95)'; g.shadowBlur = 4; g.lineWidth = fontPx * 0.03; g.strokeStyle = '#fff'; g.strokeText(text, cx, cy);
    g.shadowBlur = 0; g.lineWidth = 1; g.strokeText(text, cx, cy);
  });
  // wide soft halo, three passes of increasing blur so it accumulates a real
  // falloff instead of one flat ring
  const bloom = base(g => {
    g.shadowColor = P.glow;
    for (let k = 0; k < 3; k++) {
      g.shadowBlur = blur * (1.7 + k * 1.5);
      g.lineWidth = fontPx * (0.20 + k * 0.07);
      g.strokeStyle = k === 0 ? P.hot : P.beam;
      g.strokeText(text, cx, cy);
    }
  });
  return { cool, hot, edge, bloom };
}

function measure(text, fontPx, ls) {
  const m = mk(8, 8).getContext('2d');
  m.font = `700 ${fontPx}px 'Share Tech Mono', monospace`;
  try { m.letterSpacing = ls + 'px'; } catch (e) {}
  let w = m.measureText(text).width;
  if (!w || w < 10) w = fontPx * text.length * 0.6;
  return w;
}

function buildTextJob(j, text, cy, fontPx, P, lsMul) {
  const ls = Math.round(fontPx * lsMul);
  const tw = measure(text, fontPx, ls), cx = EW / 2;
  j.box = { x: cx - tw / 2, w: tw, cx, cy, fontPx };
  j.spr = sprites(text, cx, cy, fontPx, ls, P);
  j.first = { x: j.box.x, y: cy };
  j.label = 'Cutting ' + text + '\u2026';
  j.emit = glyphPoints(j.spr.hot, j.box);
  j.nextPop = 0;
}

/* Sample the lit pixels of a text sprite so sparks can pop off the glyphs
   themselves rather than off a bounding box. Only the text band is read, not
   the whole canvas — these are our own sprites, so nothing is tainted. */
function glyphPoints(cv, box) {
  const fp = box.fontPx;
  const x0 = Math.max(0, Math.floor(box.x - fp * 0.3));
  const y0 = Math.max(0, Math.floor(box.cy - fp * 0.85));
  const w = Math.min(cv.width - x0, Math.ceil(box.w + fp * 0.6));
  const h = Math.min(cv.height - y0, Math.ceil(fp * 1.7));
  if (w < 2 || h < 2) return [];
  let d;
  try { d = cv.getContext('2d').getImageData(x0, y0, w, h).data; }
  catch (e) { return []; }
  const pts = [], step = Math.max(2, Math.round(fp * 0.11));
  for (let y = 0; y < h; y += step)
    for (let x = 0; x < w; x += step)
      if (d[(y * w + x) * 4 + 3] > 140) pts.push([x0 + x, y0 + y]);
  return pts;
}

function buildButtonJob(j, text, cy, fontPx, P) {
  const ls = Math.round(fontPx * 0.16);
  const tw = measure(text, fontPx, ls), cx = EW / 2;
  j.box = { x: cx - tw / 2, w: tw, cx, cy, fontPx };
  j.spr = sprites(text, cx, cy, fontPx, ls, P);

  const padX = fontPx * 1.0, padY = fontPx * 0.62;
  const bw = tw + padX * 2, bh = fontPx + padY * 2;
  const bx = cx - bw / 2, by = cy - bh / 2;
  j.box.btn = { x: bx, y: by, w: bw, h: bh };
  j.border = poly([{ x: bx, y: by }, { x: bx + bw, y: by },
                   { x: bx + bw, y: by + bh }, { x: bx, y: by + bh }, { x: bx, y: by }]);

  // inner fill: randomised slanted scratch strokes, carved diagonally
  const inx = bx + fontPx * 0.5, iny = by + fontPx * 0.34;
  const inw = bw - fontPx * 1.0, inh = bh - fontPx * 0.68;
  const slant = -0.5, sp = fontPx * 0.42, scr = [];
  for (let yy = iny; yy <= iny + inh; yy += sp) {
    for (let xx = inx; xx <= inx + inw; xx += sp) {
      const len = fontPx * (0.45 + Math.random() * 0.7);
      const a = slant + (Math.random() - 0.5) * 0.55;
      const ox = xx + (Math.random() - 0.5) * sp * 0.7, oy = yy + (Math.random() - 0.5) * sp * 0.7;
      const cl = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
      scr.push({
        x1: cl(ox - Math.cos(a) * len / 2, bx + 2, bx + bw - 2),
        y1: cl(oy - Math.sin(a) * len / 2, by + 2, by + bh - 2),
        x2: cl(ox + Math.cos(a) * len / 2, bx + 2, bx + bw - 2),
        y2: cl(oy + Math.sin(a) * len / 2, by + 2, by + bh - 2)
      });
    }
  }
  scr.sort((a, b) => (a.x1 + a.y1) - (b.x1 + b.y1));
  j.scratch = scr;
  j.first = { x: j.border.pts[0].x, y: j.border.pts[0].y };
  j.label = 'Carving entry button\u2026';
}

/* 4 nodes riding the screen edges; parked at the mid of each edge */
function buildNodes() {
  const mx = EW / 2, my = EH / 2;
  nodes = [
    { edge: 'top',    pos: mx, park: mx, follow: 0.18 },
    { edge: 'bottom', pos: mx, park: mx, follow: 0.18 },
    { edge: 'left',   pos: my, park: my, follow: 0.26 },
    { edge: 'right',  pos: my, park: my, follow: 0.26 }
  ];
}
function nodePoint(n) {
  const m = 6 * eDPR;
  if (n.edge === 'top')    return { x: n.pos, y: m };
  if (n.edge === 'bottom') return { x: n.pos, y: EH - m };
  if (n.edge === 'left')   return { x: m, y: n.pos };
  return { x: EW - m, y: n.pos };
}

/* ===================== run control ===================== */

export function start() {
  if (mode !== 'idle') return;
  jobs.forEach(j => { j.done = false; j.nextPop = 0; j.crackAt = null; j.crackNext = 0; });
  sparks.length = smoke.length = cracks.length = flashes.length = 0;
  crackMark = 0; lastStatus = ''; popCount = 0; hots.length = 0; crackSplit = [0, 0];
  buildNodes();
  enterBtn.classList.remove('live');
  nextJob();
}
function nextJob() {
  ji++;
  if (ji >= jobs.length) {
    mode = 'live'; liveAt = performance.now();
    head = null; beamsOn = false;
    enterBtn.classList.add('live');
    say('Ready &mdash; <b>press to enter</b>', 'live');
    if (doneCb) doneCb();
    return;
  }
  mode = 'arm'; tMark = performance.now();
  head = centre(); beamsOn = false;
  scheduleCracks(jobs[ji]);
  say('Positioning head\u2026', 'go');
}
export const isLive = () => mode === 'live';

/* live counters — handy in the console, and what the test harness reads */
export const stats = () => ({
  mode,
  cracks: cracks.length,
  sparks: sparks.length,
  smoke: smoke.length,
  pops: popCount,
  heating: hots.length,
  crackSplit: crackSplit.slice(),
  tinted: sparks.reduce((n, s) => n + (s.col ? 1 : 0), 0),
  tints: sparks.filter(s => s.col).slice(0, 24).map(s => s.col),
  palette: pal(),
  origins: cracks.map(c => c.origin),
  btn: jobs.length && jobs[jobs.length - 1].box ? jobs[jobs.length - 1].box.btn : null
});

/* wipe the glass and put the tool back in the rack */
export function reset() {
  mode = 'idle'; ji = -1; head = null; beamsOn = false;
  jobs.forEach(j => { j.done = false; j.nextPop = 0; j.crackAt = null; j.crackNext = 0; });
  sparks.length = smoke.length = cracks.length = flashes.length = 0;
  crackMark = 0; lastStatus = ''; popCount = 0; hots.length = 0; crackSplit = [0, 0];
  buildNodes();
  enterBtn.classList.remove('live');
  clear();
}
export function clear() { if (ectx) ectx.clearRect(0, 0, EW, EH); }

/* Lay out WHEN the during-cut fractures fire, rather than gating on a minimum
   interval. That makes the during/after split exact: CFG.cracks.during of the
   total is spread across the carve, the remainder lands at completion. */
function scheduleCracks(job) {
  if (!job || job.kind !== 'button') return;
  const K = CFG.cracks;
  const nDuring = Math.round(K.total * K.during);
  job.crackAt = [];
  const lo = K.startAt, hi = 0.97, span = hi - lo;
  for (let i = 0; i < nDuring; i++) {
    const even = lo + span * ((i + 0.5) / nDuring);
    const wob = (Math.random() - 0.5) * (span / nDuring) * K.jitter * 2;
    job.crackAt.push(Math.min(hi, Math.max(lo, even + wob)));
  }
  job.crackAt.sort((a, b) => a - b);
  job.crackNext = 0;
}
const afterCount = () => {
  const K = CFG.cracks;
  return Math.max(0, K.total - Math.round(K.total * K.during));
};

/* ===================== particles ===================== */

/* mix: optional array of [r,g,b] to draw each spark's colour from. Without it
   sparks follow the beam palette, as the carve sparks do. */
function spawnSparks(x, y, n, power, mix) {
  power = power || 1;
  for (let i = 0; i < n; i++) {
    if (sparks.length >= MAXS) sparks.shift();
    const a = Math.random() * Math.PI * 2, s = (0.4 + Math.random() * 5.0) * power * eDPR;
    sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1.0 * eDPR, life: 1,
      decay: 0.018 + Math.random() * 0.04, sz: (0.5 + Math.random() * 1.4) * eDPR,
      blue: !mix && Math.random() < 0.4,
      col: mix ? mix[(Math.random() * mix.length) | 0] : null });
  }
}
function spawnSmoke(x, y, n) {
  for (let i = 0; i < n; i++) {
    if (smoke.length >= MAXSM) break;
    smoke.push({ x: x + (Math.random() - 0.5) * 10 * eDPR, y,
      vx: (Math.random() - 0.5) * 0.35 * eDPR, vy: -(0.3 + Math.random() * 0.7) * eDPR,
      r: (5 + Math.random() * 11) * eDPR, life: 1,
      decay: 0.005 + Math.random() * 0.006, warm: Math.random() < 0.55 });
  }
}
function spawnFlash(x, y, r, col) { flashes.push({ x, y, r: r * eDPR, life: 1, col: col || null }); }

const inRect = (x, y, r) => r && x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h;

/* a random point on the button's outer edge, plus the outward normal there */
function edgePoint(job) {
  const b = job.box.btn, per = 2 * (b.w + b.h);
  let t = Math.random() * per, x, y;
  if (t < b.w) { x = b.x + t; y = b.y; }
  else if ((t -= b.w) < b.h) { x = b.x + b.w; y = b.y + t; }
  else if ((t -= b.h) < b.w) { x = b.x + b.w - t; y = b.y + b.h; }
  else { t -= b.w; x = b.x; y = b.y + b.h - t; }
  return { x, y, dir: Math.atan2(y - (b.y + b.h / 2), x - (b.x + b.w / 2)) };
}

function makeCrack(ox, oy, scale, dir, avoid) {
  const K = CFG.cracks;
  const segs = []; let total = 0;
  const branches = K.branches + (Math.random() < 0.4 ? 1 : 0);
  for (let b = 0; b < branches; b++) {
    let ang = dir != null ? dir + (Math.random() - 0.5) * 1.5 : Math.random() * Math.PI * 2;
    let x = ox, y = oy;
    const steps = K.steps + (Math.random() * 4 | 0);
    for (let s = 0; s < steps; s++) {
      ang += (Math.random() - 0.5) * 0.9;
      const len = EW * scale * (0.018 + Math.random() * 0.05);
      let nx = x + Math.cos(ang) * len, ny = y + Math.sin(ang) * len;
      // the button is carved-out material; a fracture running back across it
      // reads as a scratch on the label rather than glass failing around a cut
      if (K.keepOut && inRect(nx, ny, avoid)) {
        ang += Math.PI * 0.55 * (Math.random() < 0.5 ? 1 : -1);
        nx = x + Math.cos(ang) * len; ny = y + Math.sin(ang) * len;
      }
      nx = Math.max(2, Math.min(EW - 2, nx));
      ny = Math.max(2, Math.min(EH - 2, ny));
      const d = Math.hypot(nx - x, ny - y);
      segs.push({ ax: x, ay: y, bx: nx, by: ny, len: d }); total += d;
      x = nx; y = ny;
    }
  }
  return { segs, total, grow: 0, growMs: 380 + Math.random() * 260,
           born: performance.now(), origin: [ox, oy] };
}
function spawnCrack(x, y, scale, dir, avoid) {
  if (cracks.length >= CFG.cracks.max) cracks.shift();
  cracks.push(makeCrack(x, y, scale, dir, avoid));
  spawnFlash(x, y, EW * 0.05);
}

/* ===================== carve drawing ===================== */

function ptAtLen(path, L) {
  let acc = 0;
  for (let i = 0; i < path.pts.length - 1; i++) {
    const seg = path.cum[i + 1] - path.cum[i];
    if (acc + seg >= L) {
      const t = seg ? (L - acc) / seg : 0, a = path.pts[i], b = path.pts[i + 1];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    acc += seg;
  }
  const last = path.pts[path.pts.length - 1];
  return { x: last.x, y: last.y };
}
function strokeUpTo(path, L, w, style, alpha) {
  ectx.lineWidth = w; ectx.strokeStyle = style; ectx.globalAlpha = alpha;
  ectx.beginPath(); ectx.moveTo(path.pts[0].x, path.pts[0].y);
  let acc = 0;
  for (let i = 0; i < path.pts.length - 1; i++) {
    const a = path.pts[i], b = path.pts[i + 1], seg = path.cum[i + 1] - path.cum[i];
    if (acc + seg <= L) ectx.lineTo(b.x, b.y);
    else {
      const t = seg ? (L - acc) / seg : 0;
      ectx.lineTo(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
      ectx.stroke(); return;
    }
    acc += seg;
  }
  ectx.stroke();
}
function drawCarved(job, path, frac, amul) {
  amul = amul == null ? 1 : amul;
  const P = pal(), L = clamp01(frac) * path.total;
  ectx.globalCompositeOperation = 'lighter'; ectx.lineCap = 'round'; ectx.lineJoin = 'round';
  const w = Math.max(3 * eDPR, job.box.fontPx * 0.16);
  strokeUpTo(path, L, w * 3.0, P.glow, 0.55 * amul);
  strokeUpTo(path, L, w * 1.7, P.beam, 0.50 * amul);
  strokeUpTo(path, L, w,       P.hot2, 0.95 * amul);
  strokeUpTo(path, L, Math.max(1, w * 0.36), '#ffffff', 0.95 * amul);
  ectx.globalAlpha = 1; ectx.globalCompositeOperation = 'source-over';
  return ptAtLen(path, L);
}
function drawScratches(job, frac, amul) {
  amul = amul == null ? 1 : amul;
  const P = pal(), arr = job.scratch || [], n = arr.length;
  const upto = clamp01(frac) * n, full = Math.floor(upto);
  const w = Math.max(1.3 * eDPR, job.box.fontPx * 0.05);
  ectx.globalCompositeOperation = 'lighter'; ectx.lineCap = 'round';
  let h = null;
  for (let i = 0; i < n && i <= full; i++) {
    const s = arr[i]; let ex = s.x2, ey = s.y2;
    if (i === full && full < n) {
      const t = upto - full;
      ex = s.x1 + (s.x2 - s.x1) * t; ey = s.y1 + (s.y2 - s.y1) * t; h = { x: ex, y: ey };
    }
    ectx.strokeStyle = P.glow; ectx.globalAlpha = 0.28 * amul; ectx.lineWidth = w * 2.4;
    ectx.beginPath(); ectx.moveTo(s.x1, s.y1); ectx.lineTo(ex, ey); ectx.stroke();
    ectx.strokeStyle = P.hot2; ectx.globalAlpha = 0.85 * amul; ectx.lineWidth = w;
    ectx.beginPath(); ectx.moveTo(s.x1, s.y1); ectx.lineTo(ex, ey); ectx.stroke();
    ectx.strokeStyle = '#ffffff'; ectx.globalAlpha = 0.5 * amul; ectx.lineWidth = Math.max(1, w * 0.4);
    ectx.beginPath(); ectx.moveTo(s.x1, s.y1); ectx.lineTo(ex, ey); ectx.stroke();
  }
  ectx.globalAlpha = 1; ectx.globalCompositeOperation = 'source-over';
  if (!h && full >= n && n) { const s = arr[n - 1]; h = { x: s.x2, y: s.y2 }; }
  return h;
}
// left-to-right burn of a text sprite, with a hot window at the cut front
function drawTextCut(job, sf, now) {
  const U = CFG.urlEtch;
  const fx = job.box.x + sf * job.box.w;
  const jx = (Math.random() - 0.5) * job.box.fontPx * 0.16;
  const jy = (Math.random() - 0.5) * job.box.fontPx * 0.30;
  const fp = job.box.fontPx;

  ectx.save(); ectx.beginPath(); ectx.rect(0, 0, fx + 2, EH); ectx.clip();
  ectx.globalCompositeOperation = 'source-over'; ectx.drawImage(job.spr.cool, 0, 0);

  // Material that has already been cut is still incandescent — it does not go
  // cool and then light up when the job ends. Drawn in three bands so there is
  // a cooling gradient behind the head rather than a flat wash.
  const breathe = 0.86 + 0.14 * Math.sin(now * 0.011);
  ectx.globalCompositeOperation = 'lighter';
  const bands = [[fx, 3.5 * fp, 1.00], [fx - 3.5 * fp, 9 * fp, 0.62], [fx - 12.5 * fp, EW, 0.42]];
  for (const [right, width, k] of bands) {
    const left = Math.max(0, right - width);
    if (right <= 0) continue;
    ectx.save(); ectx.beginPath(); ectx.rect(left, 0, right - left, EH); ectx.clip();
    ectx.globalAlpha = (U.bloom != null ? U.bloom : 0.9) * 0.85 * k * breathe;
    ectx.drawImage(job.spr.bloom, 0, 0);
    ectx.globalAlpha = 0.90 * k * breathe; ectx.drawImage(job.spr.edge, 0, 0);
    ectx.globalAlpha = 0.45 * k * breathe; ectx.drawImage(job.spr.hot, 0, 0);
    ectx.restore();
  }
  ectx.globalAlpha = 1;
  ectx.restore();

  const win = job.box.fontPx * 1.2;
  ectx.save(); ectx.beginPath(); ectx.rect(fx - win + jx, 0, win + 6, EH); ectx.clip();
  ectx.globalCompositeOperation = 'lighter'; ectx.globalAlpha = 0.95;
  ectx.drawImage(job.spr.hot, jx, jy * 0.5);
  ectx.globalAlpha = 1; ectx.drawImage(job.spr.edge, jx, jy * 0.5); ectx.restore();
  ectx.globalCompositeOperation = 'source-over';
  return { x: fx + jx, y: job.box.cy + jy };
}

function drawNode(p, a, P) {
  ectx.globalCompositeOperation = 'lighter'; ectx.globalAlpha = a;
  ectx.fillStyle = P.glow; ectx.beginPath(); ectx.arc(p.x, p.y, 8 * eDPR, 0, 7); ectx.fill();
  ectx.fillStyle = 'rgba(255,235,200,0.95)'; ectx.beginPath(); ectx.arc(p.x, p.y, 3.6 * eDPR, 0, 7); ectx.fill();
  ectx.fillStyle = 'rgba(255,255,245,1)'; ectx.beginPath(); ectx.arc(p.x, p.y, 1.7 * eDPR, 0, 7); ectx.fill();
  ectx.globalAlpha = 1; ectx.globalCompositeOperation = 'source-over';
}
function drawBeam(sx, sy, tx, ty, strobe, P) {
  ectx.globalCompositeOperation = 'lighter'; ectx.lineCap = 'round';
  ectx.strokeStyle = P.beam; ectx.lineWidth = 7 * eDPR; ectx.globalAlpha = 0.14 * strobe;
  ectx.beginPath(); ectx.moveTo(sx, sy); ectx.lineTo(tx, ty); ectx.stroke();
  ectx.strokeStyle = 'rgb(120,200,255)'; ectx.lineWidth = 2.4 * eDPR; ectx.globalAlpha = 0.7 * strobe;
  ectx.beginPath(); ectx.moveTo(sx, sy); ectx.lineTo(tx, ty); ectx.stroke();
  ectx.strokeStyle = 'rgb(255,255,245)'; ectx.lineWidth = 1.0 * eDPR; ectx.globalAlpha = strobe;
  ectx.beginPath(); ectx.moveTo(sx, sy); ectx.lineTo(tx, ty); ectx.stroke();
  ectx.globalAlpha = 1; ectx.globalCompositeOperation = 'source-over';
}
function drawCracks(now, dt) {
  if (!cracks.length) return;
  const P = pal();
  for (const c of cracks) {
    c.grow = Math.min(1, c.grow + dt / c.growMs);
    const drawn = c.grow * c.total, heat = Math.max(0, 1 - (now - c.born) / 900);
    let acc = 0;
    ectx.globalCompositeOperation = 'lighter'; ectx.lineCap = 'round'; ectx.lineJoin = 'round';
    for (const s of c.segs) {
      if (acc > drawn) break;
      const p = Math.min(1, (drawn - acc) / s.len);
      const bx = s.ax + (s.bx - s.ax) * p, by = s.ay + (s.by - s.ay) * p;
      ectx.strokeStyle = 'rgba(120,200,255,0.10)'; ectx.lineWidth = 3.2 * eDPR; ectx.globalAlpha = 0.9;
      ectx.beginPath(); ectx.moveTo(s.ax, s.ay); ectx.lineTo(bx, by); ectx.stroke();
      ectx.strokeStyle = 'rgba(225,248,255,0.95)'; ectx.lineWidth = 1.0 * eDPR; ectx.globalAlpha = 0.95;
      ectx.beginPath(); ectx.moveTo(s.ax, s.ay); ectx.lineTo(bx, by); ectx.stroke();
      acc += s.len;
    }
    if (heat > 0.02 && c.grow < 1) {
      ectx.globalAlpha = heat;
      ectx.strokeStyle = `rgba(${P.flare[0]},${P.flare[1]},${P.flare[2]},0.6)`;
      ectx.lineWidth = 2.0 * eDPR;
      acc = 0;
      for (const s of c.segs) {
        if (acc > drawn) break;
        if (drawn - acc < s.len) {
          const p = Math.min(1, (drawn - acc) / s.len);
          ectx.beginPath(); ectx.moveTo(s.ax, s.ay);
          ectx.lineTo(s.ax + (s.bx - s.ax) * p, s.ay + (s.by - s.ay) * p); ectx.stroke();
        }
        acc += s.len;
      }
    }
  }
  ectx.globalAlpha = 1; ectx.globalCompositeOperation = 'source-over';
}

/* persistent glow for a finished job */
function drawDone(job, amul, now) {
  if (job.kind === 'button') {
    drawCarved(job, job.border, 1, amul);
    drawScratches(job, 1, 0.9 * amul);
  }
  ectx.globalCompositeOperation = 'source-over';
  ectx.drawImage(job.spr.cool, 0, 0);

  // the url does not cool off — three incommensurate sines so the breath never
  // repeats on a countable beat
  if (job.kind === 'text') {
    const U = CFG.urlEtch;
    const b = 0.5 + 0.28 * Math.sin(now * 0.0026)
                  + 0.14 * Math.sin(now * 0.0071 + 1.3)
                  + 0.08 * Math.sin(now * 0.0163 + 2.7);
    const a = U.pulseMin + (U.pulseMax - U.pulseMin) * clamp01(b);
    ectx.globalCompositeOperation = 'lighter';
    ectx.globalAlpha = (U.bloom != null ? U.bloom : 0.9) * (0.45 + 0.55 * a) * amul;
    ectx.drawImage(job.spr.bloom, 0, 0);
    ectx.globalAlpha = a * amul;
    ectx.drawImage(job.spr.edge, 0, 0);
    ectx.globalAlpha = 0.35 * a * amul;
    ectx.drawImage(job.spr.hot, 0, 0);
    ectx.globalAlpha = 1;
    ectx.globalCompositeOperation = 'source-over';
  }
}

/* Schedule a new hot spot on the url. The spot does not emit on arrival — it
   heats over heatMin..heatMin+heatSpread ms, brightening and blooming, and only
   then lets go into a spark burst. */
function popUrl(job, now) {
  if (!job.emit || !job.emit.length) return;
  if (now < job.nextPop) return;
  const U = CFG.urlEtch, r = Math.random();
  job.nextPop = now + U.popMin + r * r * U.popSpread;   // squared: long gaps dominate
  if (hots.length >= U.maxHot) return;
  const p0 = job.emit[(Math.random() * job.emit.length) | 0];
  hots.push({ x: p0[0], y: p0[1], t0: now,
              dur: U.heatMin + Math.random() * U.heatSpread,
              fp: job.box.fontPx, seed: Math.random() * 100 });
}

/* Draw the heating spots and fire the ones that reach full heat. */
function drawHots(now, P) {
  const U = CFG.urlEtch;
  for (let i = hots.length - 1; i >= 0; i--) {
    const h = hots[i];
    const u = (now - h.t0) / h.dur;

    if (u >= 1) {                     // let go
      const rng = (lo, hi) => lo + ((Math.random() * (hi - lo + 1)) | 0);
      // fast burst, then a slower shower that hangs in the air behind it
      spawnSparks(h.x, h.y, rng(U.sparkMin, U.sparkMax), 1.05, U.ember);
      spawnSparks(h.x, h.y, rng(U.driftMin || 0, U.driftMax || 0), 0.30, U.ember);
      spawnFlash(h.x, h.y, EW * 0.026, U.emberFlash);
      spawnSmoke(h.x, h.y, U.smokePuffs || 1);
      popCount++;
      hots.splice(i, 1);
      continue;
    }

    // u^2 ramp: a long dim smoulder, then a sharp run up to white just before
    // it goes. Flicker keeps it from reading as a clean fade.
    const e = u * u;
    const flick = 0.80 + 0.20 * Math.sin(now * 0.045 + h.seed)
                       * Math.sin(now * 0.017 + h.seed * 2);
    const R = (U.coreR + U.bloomR * e) * h.fp * (0.85 + 0.3 * e);
    const a = e * flick;

    ectx.globalCompositeOperation = 'lighter';
    const g = ectx.createRadialGradient(h.x, h.y, 0, h.x, h.y, Math.max(2, R));
    // colour climbs the ember ladder as it heats: beam red -> amber -> white
    const warm = U.ember[Math.min(U.ember.length - 1,
                  Math.floor((1 - e) * (U.ember.length - 1)))];
    g.addColorStop(0,    `rgba(255,246,232,${(0.35 + 0.65 * e * e).toFixed(3)})`);
    g.addColorStop(0.28, `rgba(${warm[0]},${warm[1]},${warm[2]},${(0.62 * a).toFixed(3)})`);
    g.addColorStop(0.62, P.glow);
    g.addColorStop(1,    'rgba(0,0,0,0)');
    ectx.globalAlpha = Math.min(1, 0.25 + 0.75 * a);
    ectx.fillStyle = g;
    ectx.beginPath(); ectx.arc(h.x, h.y, Math.max(2, R), 0, 7); ectx.fill();

    // white-hot pinpoint at the centre once it is really cooking
    if (e > 0.45) {
      ectx.globalAlpha = (e - 0.45) / 0.55;
      ectx.fillStyle = 'rgba(255,252,246,1)';
      ectx.beginPath(); ectx.arc(h.x, h.y, Math.max(0.8, h.fp * 0.035 * e), 0, 7); ectx.fill();
    }
    ectx.globalAlpha = 1; ectx.globalCompositeOperation = 'source-over';
  }
}

/* ===================== frame ===================== */

export function frame(now, dt) {
  if (!EW || !ectx) return;
  dt = dt || 16;
  const P = pal();
  ectx.clearRect(0, 0, EW, EH);
  drawCracks(now, dt);
  if (mode === 'idle') return;

  const pulse = 0.82 + 0.18 * Math.sin(now * 0.004);
  const strobe = 0.6 + 0.4 * Math.sin(now * 0.05);

  // everything already cut stays on the glass
  for (const j of jobs) if (j.done) {
    drawDone(j, mode === 'live' ? pulse : 1, now);
    if (j.kind === 'text') popUrl(j, now);
  }
  drawHots(now, P);

  const job = jobs[ji];

  /* ---- run-in: straight line from centre, beams dark, no burn ---- */
  if (mode === 'arm' && job) {
    const u = clamp01((now - tMark) / job.arm);
    const c = centre();
    head = { x: c.x + (job.first.x - c.x) * u, y: c.y + (job.first.y - c.y) * u };
    for (const n of nodes) {
      const tgt = (n.edge === 'top' || n.edge === 'bottom') ? head.x : head.y;
      n.pos += (tgt - n.pos) * n.follow;
    }
    // the head itself is visible on the run-in, but cold
    ectx.globalCompositeOperation = 'lighter';
    ectx.globalAlpha = 0.55 * u;
    ectx.fillStyle = 'rgba(160,215,245,1)';
    ectx.beginPath(); ectx.arc(head.x, head.y, 2.4 * eDPR, 0, 7); ectx.fill();
    ectx.globalAlpha = 1; ectx.globalCompositeOperation = 'source-over';
    if (u >= 1) { mode = 'cut'; tMark = now; beamsOn = true; crackMark = 0; say(job.label, 'go'); }
    drawParticles(now, P);
    return;
  }

  /* ---- the cut ---- */
  if (mode === 'cut' && job) {
    const D = job.ms / CFG.crt.etch;
    const f = clamp01((now - tMark) / D);
    let stage = 'text';

    if (job.kind === 'button') {
      const B = 0.22, H = 0.60;
      if (f >= B) drawCarved(job, job.border, 1);
      if (f >= H) drawScratches(job, 1, 0.9);
      if (f < B)      { stage = 'border';  head = drawCarved(job, job.border, f / B); }
      else if (f < H) { stage = 'scratch'; head = drawScratches(job, (f - B) / (H - B), 0.9) || head; }
      else            { stage = 'text';    head = drawTextCut(job, (f - H) / (1 - H), now); }
    } else {
      head = drawTextCut(job, f, now);
    }

    if (head) {
      const hk = job.kind === 'text' ? 1.5 : 1.0;
      const g = ectx.createRadialGradient(head.x, head.y, 0, head.x, head.y, job.box.fontPx * 0.9 * hk);
      g.addColorStop(0, 'rgba(255,255,245,0.95)');
      g.addColorStop(0.3, `rgba(${P.flare[0]},${P.flare[1]},${P.flare[2]},0.5)`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ectx.globalCompositeOperation = 'lighter'; ectx.fillStyle = g;
      ectx.fillRect(head.x - job.box.fontPx * 1.2 * hk, head.y - job.box.fontPx * 1.2 * hk,
                    job.box.fontPx * 2.4 * hk, job.box.fontPx * 2.4 * hk);
      ectx.globalCompositeOperation = 'source-over';

      for (const n of nodes) {
        const tgt = (n.edge === 'top' || n.edge === 'bottom') ? head.x : head.y;
        n.pos += (tgt - n.pos) * n.follow;
        const p = nodePoint(n);
        drawBeam(p.x, p.y, head.x, head.y, strobe, P);
        drawNode(p, 1, P);
      }
      if (job.kind === 'text') {
        // the url carve throws hard, in the same amber the finished cut spits
        const U = CFG.urlEtch;
        spawnSparks(head.x, head.y, U.cutSparks, U.cutPower, U.ember);
        if (Math.random() < U.cutFlare) {
          spawnSparks(head.x, head.y, U.cutBurst, U.cutPower * 1.45, U.ember);
          spawnFlash(head.x, head.y, EW * 0.022, U.emberFlash);
        }
        if (Math.random() < U.cutSmoke) spawnSmoke(head.x, head.y, 1);
      } else {
        spawnSparks(head.x, head.y, stage === 'scratch' ? 6 : 11,
                    stage === 'border' ? 1.3 : 1.0);
        if (Math.random() < 0.55) spawnSmoke(head.x, head.y, 1);
      }
      // glass fractures are a button-job flourish only; the url is a fine cut
      if (job.kind === 'button' && job.crackAt) {
        while (job.crackNext < job.crackAt.length && f >= job.crackAt[job.crackNext]) {
          job.crackNext++;
          const e = edgePoint(job);
          spawnCrack(e.x, e.y, CFG.cracks.scale * (0.85 + Math.random() * 0.5),
                     e.dir, job.box.btn);
          spawnSparks(e.x, e.y, 14, 1.2);
          crackSplit[0]++;
        }
      }
    }

    if (f >= 1) {
      // beams and burn stop on this frame. No trailing marks.
      job.done = true; beamsOn = false; head = null;
      mode = 'rest'; tMark = now;
      if (job.kind === 'button') {
        // corner fractures on completion, budgeted by CFG.cracks.corners
        const b = job.box.btn;
        const corners = [
          [b.x,       b.y,       Math.PI * 0.75],
          [b.x + b.w, b.y + b.h, -Math.PI * 0.25],
          [b.x + b.w, b.y,       Math.PI * 0.25],
          [b.x,       b.y + b.h, -Math.PI * 0.75]
        ];
        for (let i = 0; i < afterCount(); i++) {
          const [cx0, cy0, a] = corners[i % corners.length];
          spawnCrack(cx0, cy0, CFG.cracks.scale * 1.4, a, b);
          crackSplit[1]++;
        }
        spawnFlash(job.box.cx, job.box.cy, EW * 0.18);
      } else {
        spawnFlash(job.box.cx, job.box.cy, EW * 0.07);
      }
    }
    drawParticles(now, P);
    return;
  }

  /* ---- retract to centre between jobs ---- */
  if (mode === 'rest') {
    const u = clamp01((now - tMark) / REST_MS);
    const a = 1 - u;
    for (const n of nodes) { n.pos += (n.park - n.pos) * 0.14; if (a > 0.02) drawNode(nodePoint(n), a * 0.7, P); }
    drawParticles(now, P);
    if (u >= 1) nextJob();
    return;
  }

  /* ---- live: breathing button, blinking caret ---- */
  if (mode === 'live') {
    const na = Math.max(0, 1 - (now - liveAt) / 900);
    if (na > 0) for (const n of nodes) { n.pos += (n.park - n.pos) * 0.12; drawNode(nodePoint(n), na * 0.7, P); }
    const btnJob = jobs[jobs.length - 1];
    const hover = enterBtn.matches(':hover') || enterBtn.matches(':focus-visible');
    ectx.globalCompositeOperation = 'lighter';
    ectx.globalAlpha = (hover ? 0.5 : 0.28) * pulse;
    ectx.drawImage(btnJob.spr.edge, 0, 0);
    if (Math.sin(now * 0.006) > -0.2) {
      ectx.globalAlpha = hover ? 0.95 : 0.6; ectx.fillStyle = P.hot2;
      const cx0 = btnJob.box.x + btnJob.box.w + btnJob.box.fontPx * 0.3;
      ectx.fillRect(cx0, btnJob.box.cy - btnJob.box.fontPx * 0.46,
                    btnJob.box.fontPx * 0.1, btnJob.box.fontPx * 0.92);
    }
    ectx.globalAlpha = 1; ectx.globalCompositeOperation = 'source-over';
    drawParticles(now, P);
  }
}

function drawParticles(now, P) {
  for (let i = flashes.length - 1; i >= 0; i--) {
    const f = flashes[i]; f.life -= 0.06;
    if (f.life <= 0) { flashes.splice(i, 1); continue; }
    const r = f.r * (1.2 - f.life);
    const g = ectx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
    const fc = f.col || [220, 240, 255];
    g.addColorStop(0, `rgba(${fc[0]},${fc[1]},${fc[2]},${0.5 * f.life})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ectx.globalCompositeOperation = 'lighter'; ectx.fillStyle = g;
    ectx.beginPath(); ectx.arc(f.x, f.y, r, 0, 7); ectx.fill();
  }
  ectx.globalCompositeOperation = 'lighter';
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.x += s.vx; s.y += s.vy; s.vx *= 0.985; s.vy += 0.18 * eDPR; s.life -= s.decay;
    if (s.life <= 0) { sparks.splice(i, 1); continue; }
    ectx.globalAlpha = s.life;
    ectx.fillStyle = s.col ? `rgba(${s.col[0]},${s.col[1]},${s.col[2]},1)`
                   : s.blue ? 'rgba(150,210,255,1)'
                            : `rgba(${P.flare[0]},${P.flare[1]},${P.flare[2]},1)`;
    ectx.fillRect(s.x, s.y, s.sz, s.sz);
  }
  ectx.globalAlpha = 1;
  for (let i = smoke.length - 1; i >= 0; i--) {
    const m = smoke[i];
    m.x += m.vx; m.y += m.vy; m.vy *= 0.992; m.r *= 1.012; m.life -= m.decay;
    if (m.life <= 0) { smoke.splice(i, 1); continue; }
    const col = m.warm ? '255,180,110' : '190,200,215';
    const g = ectx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
    g.addColorStop(0, `rgba(${col},${0.16 * m.life})`);
    g.addColorStop(1, `rgba(${col},0)`);
    ectx.globalCompositeOperation = 'source-over'; ectx.fillStyle = g;
    ectx.beginPath(); ectx.arc(m.x, m.y, m.r, 0, 7); ectx.fill();
  }
  ectx.globalAlpha = 1; ectx.globalCompositeOperation = 'source-over';
}
