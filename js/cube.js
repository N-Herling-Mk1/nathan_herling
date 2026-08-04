// ============ PELAGIC — CUBE SURFACE ETCH, MK5 ============
// Ported from etch_cube_mk5.html. Six faces, each a canvas carrying a
// procedural etch field — grid substrate, etched grooves, solder pads — with
// light packets travelling along the grooves. Edges glow from a layered
// box-shadow stack. Everything reactive is driven by one number: the analysed
// audio level that voice.js produces.
//
// Differences from the standalone mk5 page, all deliberate:
//   - no control panel; settings are fixed in CFG.cube, from the tuned rig
//   - palette locked to `cyber`, which is the site's edge cyan
//   - the rig builds its own DOM inside whatever host it is given

import { CFG } from './config.js';

const NFACE = 6;
const FACE_T = [
  'rotateY(0deg)', 'rotateY(180deg)', 'rotateY(90deg)', 'rotateY(-90deg)',
  'rotateX(90deg)', 'rotateX(-90deg)'
];
const RGB = '0,240,255';
const SCENE = 300;      // mk5's scene size; the rig is scaled, not rebuilt

let host = null, wrap = null, scene = null, cube = null;
let faceEls = [], faces = [], PX = 150, vo = 0, voLive = false, sized = false;

/* mk5 accumulates rotation from a delta, starting at 22 degrees of yaw. The
   first port derived the angle from the absolute page clock, which meant the
   cube's starting orientation depended on how long the page had been open and
   the rates did not match the rig at all. */
let rotY = 22, rotX = 0, lastT = 0;

/* `live` is voice.playing(). mk5 maps the glow slider two different ways
   depending on it, so the port needs to know which state it is in. */
export function drive(level, live) {
  vo = level > 0 ? (level < 1 ? level : 1) : 0;
  voLive = !!live;
}

/* deterministic per-face noise, so a face looks the same every session */
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

class EtchFace {
  constructor(canvas, seed) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.size = 300;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = this.size * dpr; canvas.height = this.size * dpr;
    this.ctx.scale(dpr, dpr);
    this.traces = this.build(seed);
  }

  /* Axis-aligned walks on a 20px lattice. The point is that they read as etched
     copper rather than scribble, so every segment is orthogonal and every turn
     lands on the grid. */
  build(seed) {
    const rnd = mulberry32(seed), G = 20, N = this.size / G, out = [];
    const count = 9 + Math.floor(rnd() * 5);
    for (let t = 0; t < count; t++) {
      const pts = [];
      let x = Math.floor(rnd() * N) * G, y = Math.floor(rnd() * N) * G;
      let horiz = rnd() < 0.5;
      pts.push([x, y]);
      const segs = 4 + Math.floor(rnd() * 5);
      for (let s = 0; s < segs; s++) {
        const step = (1 + Math.floor(rnd() * 4)) * G * (rnd() < 0.5 ? -1 : 1);
        if (horiz) x = Math.max(0, Math.min(this.size, x + step));
        else       y = Math.max(0, Math.min(this.size, y + step));
        pts.push([x, y]); horiz = !horiz;
      }
      const cum = [0];
      for (let i = 1; i < pts.length; i++)
        cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      const len = cum[cum.length - 1] || 1;
      out.push({ pts, cum, len, phase: rnd(), speed: 0.35 + rnd() * 0.75, pad: rnd() < 0.6 });
    }
    return out;
  }

  pointAt(tr, u) {
    const d = u * tr.len;
    for (let i = 1; i < tr.cum.length; i++) {
      if (d <= tr.cum[i]) {
        const seg = tr.cum[i] - tr.cum[i - 1] || 1;
        const f = (d - tr.cum[i - 1]) / seg;
        const a = tr.pts[i - 1], b = tr.pts[i];
        return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
      }
    }
    const l = tr.pts[tr.pts.length - 1];
    return [l[0], l[1]];
  }

  render(time, level) {
    const g = this.ctx, S = this.size;
    const flow = (CFG.cube.flow == null ? 50 : CFG.cube.flow) / 100;
    g.clearRect(0, 0, S, S);
    g.fillStyle = '#020406'; g.fillRect(0, 0, S, S);

    g.strokeStyle = 'rgba(' + RGB + ',.045)'; g.lineWidth = 1;
    g.beginPath();
    for (let i = 20; i < S; i += 20) { g.moveTo(i, 0); g.lineTo(i, S); g.moveTo(0, i); g.lineTo(S, i); }
    g.stroke();

    g.lineCap = 'square'; g.lineJoin = 'miter';
    g.strokeStyle = 'rgba(' + RGB + ',.20)'; g.lineWidth = 1.6;
    for (const tr of this.traces) {
      g.beginPath(); g.moveTo(tr.pts[0][0], tr.pts[0][1]);
      for (let i = 1; i < tr.pts.length; i++) g.lineTo(tr.pts[i][0], tr.pts[i][1]);
      g.stroke();
      if (tr.pad) {
        const e = tr.pts[tr.pts.length - 1];
        g.beginPath(); g.arc(e[0], e[1], 3, 0, 6.2832);
        g.strokeStyle = 'rgba(' + RGB + ',.30)'; g.stroke();
        g.strokeStyle = 'rgba(' + RGB + ',.20)';
      }
    }

    // travelling light packets: speed from Etch Flow, brightness from audio
    const bright = 0.55 + 0.45 * level;
    g.lineCap = 'round';
    for (const tr of this.traces) {
      const u = ((time * 0.00006 * tr.speed * (0.25 + flow * 1.9)) + tr.phase) % 1;
      const tail = 0.10, steps = 7;
      for (let s = 0; s < steps; s++) {
        const uu = u - (s / steps) * tail;
        if (uu < 0) continue;
        const p = this.pointAt(tr, uu);
        const q = this.pointAt(tr, Math.max(0, uu - tail / steps));
        g.strokeStyle = 'rgba(' + RGB + ',' + ((1 - s / steps) * bright * 0.9).toFixed(3) + ')';
        g.lineWidth = 2.4 - s * 0.22;
        g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(p[0], p[1]); g.stroke();
      }
      const head = this.pointAt(tr, u);
      g.fillStyle = 'rgba(255,255,255,' + (0.5 * bright).toFixed(3) + ')';
      g.beginPath(); g.arc(head[0], head[1], 1.6, 0, 6.2832); g.fill();
    }

    const vg = g.createRadialGradient(S / 2, S / 2, S * 0.25, S / 2, S / 2, S * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)');
    g.fillStyle = vg; g.fillRect(0, 0, S, S);
  }
}

export function init(hostEl) {
  host = hostEl;
  if (!host) return;
  host.innerHTML = '';
  /* mk5 geometry, verbatim: a 300px scene carrying perspective:900px, whose
     DIRECT child is the preserve-3d cube, faces 300px at translateZ(150px).
     The first port rebuilt this at the rail's pixel size with an extra
     preserve-3d wrapper in between — an intermediate 3D context changes how the
     child transform projects, which is why it did not match the standalone rig.
     Now the scene is built at mk5's exact size and the whole thing is scaled
     down by a plain 2D transform on a wrapper OUTSIDE the perspective, which
     cannot alter the projection. */
  wrap = document.createElement('div');
  wrap.className = 'cube-scale';
  scene = document.createElement('div');
  scene.className = 'cube-scene';
  cube = document.createElement('div');
  cube.className = 'cube3';
  scene.appendChild(cube);
  wrap.appendChild(scene);
  host.appendChild(wrap);

  faceEls = []; faces = [];
  for (let i = 0; i < NFACE; i++) {
    const f = document.createElement('div');
    f.className = 'cface3';
    f.style.transform = FACE_T[i] + ' translateZ(' + (SCENE / 2) + 'px)';
    const cv = document.createElement('canvas');
    f.appendChild(cv);
    cube.appendChild(f);
    faceEls.push(f);
    faces.push(new EtchFace(cv, 1337 + i * 977));
  }
  resize();
}

export function mount(newHost) {
  if (!newHost || newHost === host || !wrap) return;
  newHost.appendChild(wrap);
  host = newHost;
  resize();
}

export function setSize(px) { PX = Math.max(40, px | 0); resize(); }

export function resize() {
  if (!host || !cube) return;
  const v = parseInt(getComputedStyle(host).getPropertyValue('--cs'), 10);
  if (v) { PX = v; sized = true; }
  // uniform 2D scale of the whole rig — every internal ratio is preserved
  const k = PX / SCENE;
  wrap.style.transform = 'scale(' + k.toFixed(4) + ')';
  wrap.style.opacity = sized ? '1' : '0';
}

/* Layered edge glow — this is what carries the level at a glance. */
function applyGlow(v) {
  const a = 0.18 + 0.82 * v;
  const b1 = 4 + 12 * v, b2 = 12 + 30 * v, b3 = 22 + 62 * v;
  const sh =
    'inset 0 0 ' + b1.toFixed(1) + 'px 1px rgba(' + RGB + ',' + (0.45 * a).toFixed(3) + '),' +
    'inset 0 0 ' + b2.toFixed(1) + 'px 2px rgba(' + RGB + ',' + (0.25 * a).toFixed(3) + '),' +
    '0 0 ' + b1.toFixed(1) + 'px 1px rgba(' + RGB + ',' + (0.60 * a).toFixed(3) + '),' +
    '0 0 ' + b2.toFixed(1) + 'px 2px rgba(' + RGB + ',' + (0.38 * a).toFixed(3) + '),' +
    '0 0 ' + b3.toFixed(1) + 'px 4px rgba(' + RGB + ',' + (0.22 * a).toFixed(3) + ')';
  for (const el of faceEls) {
    el.style.boxShadow = sh;
    el.style.borderColor = 'rgba(' + RGB + ',' + (0.30 + 0.70 * a).toFixed(3) + ')';
  }
}

export function frame(now) {
  if (!cube) return;
  /* Until main.js has measured the rail slot and written --cs, the rig is still
     at its 300px default. Rendering through that stretch is what made the cube
     appear at the wrong size and then snap into place — it was not an entrance
     animation, it was the first correct frame arriving late. Hold until sized. */
  if (!sized) { resize(); if (!sized) return; }
  const C = CFG.cube;
  const dt = lastT ? Math.min(64, now - lastT) : 16;
  lastT = now;

  // rates straight from mk5: 34 deg/s at full Spin Y, 18 at full Spin X.
  // Spin X of 0 is deliberate — the cube turns about one axis and leans.
  rotY += (C.spinY / 100) * 34 * dt / 1000;
  rotX += (C.spinX / 100) * 18 * dt / 1000;
  cube.style.transform =
    'translateZ(' + (C.zoom || 0) + 'px) ' +
    'rotateX(' + (C.tilt + rotX).toFixed(2) + 'deg) ' +
    'rotateY(' + rotY.toFixed(2) + 'deg)';

  /* mk5, verbatim: the Edge Glow slider is a 0-2x MULTIPLIER on the analysed
     level while audio runs, and a direct control at 0.55x when it does not.
     The earlier port collapsed both into glow*(0.25+0.75*level), which floored
     the idle edges at 0.25 of the slider instead of 0.55 — less than half the
     rig's resting brightness — and compressed the live range into 0.25..1
     instead of 0..1, which is the wash. Faces idle at 0.25 in mk5, not 0. */
  const manual = C.glow / 100;
  applyGlow(voLive ? Math.min(1, vo * manual * 2) : manual * 0.55);
  for (const f of faces) f.render(now, voLive ? vo : 0.25);
}
