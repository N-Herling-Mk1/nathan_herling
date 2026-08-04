// ============ ACT 1 — POWER MODULE ============
// The readout block in the top-left of the splash. Four instruments, all
// driven by one number: `p`, the page's power level, which splash.js derives
// from pointer proximity to the entry button.
//
//   battery + charge gauge   sit at CFG.splash.baseCharge and climb to 100
//   source orb               a red dwarf, static settings, no pulse
//   frequency gauge          five free-running oscillators that phase-lock
//                            as power rises
//
// The frequency gauge deliberately does NOT reuse the background's dither
// field. Two pixelated bands on one screen read as the same instrument
// twice; a locking oscillator bank says something the band does not.

import { CFG } from './config.js';

let cells = [], chargeEl = null, lockEl = null;
let orb = null, octx = null, fq = null, fctx = null;
let chargeShown = 0, frame = 0;

/* ---------------------------------------------------------------- setup */
export function init(root) {
  cells    = [...root.querySelectorAll('#battery .cell')];
  chargeEl = root.querySelector('#chargeval');
  lockEl   = root.querySelector('#lockval');
  orb  = root.querySelector('#orb');   octx = orb.getContext('2d');
  fq   = root.querySelector('#freq');  fctx = fq.getContext('2d');
  chargeShown = CFG.splash.baseCharge;
  reset();
}

export function reset() {
  chargeShown = CFG.splash.baseCharge;
  fqCoherence = 0;
  chaosMix = 0;
  for (const o of OSC) { o.phase = Math.random() * 6.283; o.freq = o.base; }
}

export function frameAll(p, firing) {
  readout(p);
  drawFreq(p, firing);
  drawOrb(frame++);
}

/* ------------------------------------------------- battery + charge gauge */
function readout(p) {
  const base = CFG.splash.baseCharge;
  const target = base + (100 - base) * p;
  chargeShown += (target - chargeShown) * 0.12;
  chargeEl.textContent = Math.round(chargeShown);

  const filled = chargeShown / 100 * cells.length;
  cells.forEach((el, i) => {
    el.className = 'cell';
    el.style.removeProperty('--f');
    if (i + 1 <= filled) el.classList.add('on');
    else if (i < filled) {
      el.classList.add('part');
      el.style.setProperty('--f', ((filled - i) * 100).toFixed(0) + '%');
    }
  });
  lockEl.textContent = Math.round(fqCoherence * 100);
}

/* ------------------------------------------------------ frequency gauge */
// Frequencies are deliberately incommensurate, so at rest the traces smear
// into noise. Rising power pulls each oscillator's frequency toward the
// reference AND applies a phase-correction term, which is what makes the
// bank pull in and collapse onto one waveform at the button.
const OSC = [
  { base: 0.052, amp: 1.00, tint: '0,230,255'   },
  { base: 0.081, amp: 0.78, tint: '80,240,255'  },
  { base: 0.119, amp: 0.60, tint: '0,190,235'   },
  { base: 0.167, amp: 0.44, tint: '150,250,255' },
  { base: 0.231, amp: 0.32, tint: '0,160,220'   }
].map(o => ({ ...o, phase: Math.random() * 6.283, freq: o.base }));

const REF_FREQ = 0.094;
let refPhase = 0, fqCoherence = 0;

/* Chaotic overlay, drawn only while the press cue runs. Where the cyan bank is
   locking — converging on one frequency and one phase — these do the opposite:
   incommensurate frequencies, phases that walk at their own rate, and an
   amplitude driven by a second detuned oscillator so no two cycles match. They
   are the disturbance the lock is fighting, and they stop when the clip does. */
const CHAOS = [
  { f: 0.213, mf: 0.031, amp: 0.62, tint: '255,58,48', lw: 1.3 },
  { f: 0.347, mf: 0.019, amp: 0.44, tint: '200,32,42', lw: 1.0 },
  { f: 0.131, mf: 0.047, amp: 0.78, tint: '255,110,80', lw: 0.9 }
].map(o => ({ ...o, ph: Math.random() * 6.283, mph: Math.random() * 6.283 }));

let chaosMix = 0;

function drawChaos(w, h, cy) {
  fctx.save();
  fctx.globalCompositeOperation = 'lighter';
  fctx.shadowColor = 'rgba(255,60,50,.9)';
  fctx.shadowBlur = 5 * chaosMix;
  for (const o of CHAOS) {
    o.ph  += o.f;
    o.mph += o.mf;
    const env = 0.45 + 0.55 * Math.sin(o.mph);
    const amp = (h * 0.40) * o.amp * env * chaosMix;
    fctx.strokeStyle = `rgba(${o.tint},${(0.85 * chaosMix).toFixed(3)})`;
    fctx.lineWidth = o.lw;
    fctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      // the x-term and the phase term run at unrelated rates, so the trace
      // never repeats across the width
      const y = cy - Math.sin(x * o.f * 1.7 + o.ph) * amp
                   * Math.sin(x * o.mf * 0.9 + o.mph);
      x === 0 ? fctx.moveTo(x, y) : fctx.lineTo(x, y);
    }
    fctx.stroke();
  }
  fctx.restore();
  fctx.shadowBlur = 0;
}

function drawFreq(p, firing) {
  const w = fq.width, h = fq.height, cy = Math.round(h * 0.5);
  fctx.clearRect(0, 0, w, h);

  // dead zone below the pull-in threshold, then it bites
  const lock = Math.pow(Math.max(0, (p - 0.12) / 0.88), 1.4);
  refPhase += REF_FREQ;

  fctx.save();
  fctx.globalCompositeOperation = 'lighter';
  let spread = 0;
  for (const o of OSC) {
    o.freq = o.base + (REF_FREQ - o.base) * lock;
    o.phase += o.freq;
    let err = ((refPhase - o.phase + Math.PI) % 6.283 + 6.283) % 6.283 - Math.PI;
    o.phase += err * 0.09 * lock;
    spread += Math.abs(err);

    const amp = (h * 0.30) * o.amp * (0.45 + 0.55 * p);
    fctx.strokeStyle = `rgba(${o.tint},${(0.30 + 0.55 * lock).toFixed(3)})`;
    fctx.lineWidth = 1;
    fctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const y = cy - Math.sin(x * 0.11 * (o.freq / REF_FREQ) + o.phase) * amp;
      x === 0 ? fctx.moveTo(x, y) : fctx.lineTo(x, y);
    }
    fctx.stroke();
  }
  fctx.restore();

  const coh = Math.max(0, 1 - (spread / OSC.length) / Math.PI);
  fqCoherence += (coh - fqCoherence) * 0.12;

  fctx.fillStyle = 'rgba(0,120,150,.35)';
  fctx.fillRect(4, h - 6, w - 8, 2);
  fctx.fillStyle = `rgba(0,230,255,${(0.5 + 0.5 * fqCoherence).toFixed(2)})`;
  fctx.fillRect(4, h - 6, (w - 8) * fqCoherence, 2);

  fctx.strokeStyle = 'rgba(0,255,255,.5)';
  fctx.lineWidth = 1;
  fctx.beginPath(); fctx.moveTo(0, cy + .5); fctx.lineTo(w, cy + .5); fctx.stroke();

  // ramped rather than switched, so it arrives with the cue instead of popping
  chaosMix += ((firing ? 1 : 0) - chaosMix) * (firing ? 0.14 : 0.08);
  if (chaosMix > 0.01) drawChaos(w, h, cy);
}

/* ------------------------------------------------------------ source orb */
// Red dwarf, ported from the wave HMI at the settings locked in CFG.splash.orb.
// breathe = 0 is deliberate: no pulse on the object.
const P = {
  diskStops: [[0,'rgba(255,220,180,1)'],[.3,'rgba(255,130,70,1)'],
              [.65,'rgba(220,50,30,1)'],[1,'rgba(120,20,10,1)']],
  diskShadow:'rgba(255,80,30,1)',
  haloStops: [[0,'rgba(255,130,80,.35)'],[.2,'rgba(230,60,30,.18)'],
              [.55,'rgba(170,30,20,.08)'],[1,'rgba(90,15,10,0)']],
  coronaInner:[255,150,90], coronaMid:[255,90,50],
  coronaOuter:[200,50,30],  coronaEdge:[140,20,10],
  blobBase:[255,180,120], blobMid:[255,100,60], blobHot:[200,40,20], blobFade:[180,40,20],
  granuleCore:[255,200,150], granuleMid:[255,100,60], granuleFade:[180,40,20],
  flareColor:[255,180,120], flareShadow:[255,90,50],
  limbStroke:'rgba(255,170,110,.55)', limbShadow:'rgba(255,90,50,1)'
};
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;

const blobs = [], granules = [], streamers = [], flares = [], filaments = [];

for (let i = 0; i < 18; i++) blobs.push({
  a0: Math.random()*6.283, rate:.003+Math.random()*.012, dir:Math.random()<.5?-1:1,
  orbitR:.10+Math.random()*.65, wob:.05+Math.random()*.12, wobRate:.008+Math.random()*.025,
  r:.16+Math.random()*.30, inten:.35+Math.random()*.55, hue:Math.random(),
  pRate:.015+Math.random()*.03, pSeed:Math.random()*6.283
});

function newGranule(init) {
  const a = Math.random()*6.283, rad = Math.sqrt(Math.random())*.95;
  return { ux:Math.cos(a)*rad, uy:Math.sin(a)*rad, drift:.00015+Math.random()*.0005,
           dAng:a, size:.035+Math.random()*.065, bright:.30+Math.random()*.50,
           age: init ? Math.random()*80 : 0, life:55+(Math.random()*80|0) };
}
for (let i = 0; i < 110; i++) granules.push(newGranule(true));

function newStreamer(init) {
  const act = CFG.splash.orb.streamer;
  const eW = .05 + .25 * Math.min(act,3)/3;
  const r = Math.random();
  let kind;
  if      (r < eW)        kind='eruption';
  else if (r < eW + .30)  kind='tangent';
  else if (r < eW + .48)  kind='sweep';
  else if (r < eW + .63)  kind='swirl';
  else if (r < eW + .79)  kind='radial';
  else                    kind='hairpin';

  const a0 = Math.random()*6.283, dir = Math.random()<.5?1:-1;
  let r0, r1, a1, cx, cy, cx2, cy2, cubic = false;

  if (kind === 'tangent') {
    r0=.20+Math.random()*.70; const L=.18+Math.random()*.30;
    a1=a0+dir*L; r1=r0+(Math.random()-.5)*.18;
    cx=Math.cos((a0+a1)/2)*(r0+r1)*.45; cy=Math.sin((a0+a1)/2)*(r0+r1)*.45;
  } else if (kind === 'sweep') {
    r0=.30+Math.random()*.55; const L=.55+Math.random()*.85;
    a1=a0+dir*L; r1=r0+(Math.random()-.5)*.30;
    const m=(a0+a1)/2, bow=(r0+r1)*.65; cx=Math.cos(m)*bow; cy=Math.sin(m)*bow;
  } else if (kind === 'swirl') {
    r0=.25+Math.random()*.55; const L=.45+Math.random()*.55;
    a1=a0+dir*L; r1=r0+(Math.random()-.5)*.25;
    const p1=a0+dir*L*.33, p2=a0+dir*L*.67;
    const q1=r0+(r1-r0)*.33+(Math.random()-.5)*.25, q2=r0+(r1-r0)*.67-(Math.random()-.5)*.25;
    cx=Math.cos(p1)*q1; cy=Math.sin(p1)*q1; cx2=Math.cos(p2)*q2; cy2=Math.sin(p2)*q2; cubic=true;
  } else if (kind === 'radial') {
    r0=.15+Math.random()*.30; r1=r0+.30+Math.random()*.45; a1=a0+(Math.random()-.5)*.18;
    const m=(a0+a1)/2, sR=(r0+r1)*.5, bow=(Math.random()-.5)*.15;
    cx=Math.cos(m)*sR+Math.cos(m+Math.PI/2)*bow; cy=Math.sin(m)*sR+Math.sin(m+Math.PI/2)*bow;
  } else if (kind === 'hairpin') {
    r0=.25+Math.random()*.40; r1=r0+(Math.random()-.5)*.10;
    a1=a0+dir*(.10+Math.random()*.20);
    const m=(a0+a1)/2, pk=r0+.30+Math.random()*.35; cx=Math.cos(m)*pk; cy=Math.sin(m)*pk;
  } else {
    r0=.85+Math.random()*.18; r1=.85+Math.random()*.18;
    a1=a0+dir*(.08+Math.random()*.30);
    const m=(a0+a1)/2, pk=1.25+Math.random()*.85; cx=Math.cos(m)*pk; cy=Math.sin(m)*pk;
  }
  return {
    kind, x0:Math.cos(a0)*r0, y0:Math.sin(a0)*r0, x1:Math.cos(a1)*r1, y1:Math.sin(a1)*r1,
    cx, cy, cx2, cy2, cubic,
    width: kind==='eruption' ? .014+Math.random()*.020 : .010+Math.random()*.025,
    bright: kind==='eruption' ? .65+Math.random()*.35 : .40+Math.random()*.50,
    age: init ? Math.random()*80 : 0,
    life: Math.max(20, (60 + Math.random()*80) / Math.max(.4, act) | 0)
  };
}
for (let i = 0; i < 48; i++) streamers.push(newStreamer(true));

for (let i = 0; i < 26; i++) filaments.push({
  ang:(i/26)*6.283+Math.random()*.05, reach:1.6+Math.random()*1.2,
  inten:.18+Math.random()*.42, bRate:.005+Math.random()*.015, bSeed:Math.random()*6.283
});

function drawOrb(t) {
  const O = CFG.splash.orb;
  const w = orb.width, h = orb.height;
  const o = { x: w/2, y: h/2 };
  const r = Math.min(w,h) * 0.21 * (1 + Math.sin(t * .04) * O.breathe);
  const g = octx;
  g.clearRect(0, 0, w, h);

  const haloR = r * 4.2;
  const halo = g.createRadialGradient(o.x,o.y,r*.95,o.x,o.y,haloR);
  for (const [s, c] of P.haloStops) halo.addColorStop(s, c);
  g.fillStyle = halo; g.beginPath(); g.arc(o.x,o.y,haloR,0,6.283); g.fill();

  g.save(); g.globalCompositeOperation = 'lighter';
  for (const f of filaments) {
    const br = .7 + .3 * Math.sin(t * f.bRate + f.bSeed);
    const a = f.inten * br * .55 * O.corona;
    const cx = o.x + Math.cos(f.ang) * r * 1.05;
    const cy = o.y + Math.sin(f.ang) * r * 1.05;
    const pr = r * f.reach * .85 * br * (.7 + .3 * O.corona);
    const gr = g.createRadialGradient(cx,cy,0,cx,cy,pr);
    gr.addColorStop(0,   rgba(P.coronaInner, a * .85));
    gr.addColorStop(.25, rgba(P.coronaMid,   a * .55));
    gr.addColorStop(.60, rgba(P.coronaOuter, a * .20));
    gr.addColorStop(1,   rgba(P.coronaEdge,  0));
    g.fillStyle = gr; g.beginPath(); g.arc(cx,cy,pr,0,6.283); g.fill();
  }
  g.restore();

  const disk = g.createRadialGradient(o.x,o.y,0,o.x,o.y,r);
  for (const [s, c] of P.diskStops) disk.addColorStop(s, c);
  g.fillStyle = disk; g.shadowColor = P.diskShadow; g.shadowBlur = 26;
  g.beginPath(); g.arc(o.x,o.y,r,0,6.283); g.fill(); g.shadowBlur = 0;

  g.save();
  g.beginPath(); g.arc(o.x,o.y,r*.97,0,6.283); g.clip();
  g.globalCompositeOperation = 'lighter';

  const nb = Math.min(blobs.length, Math.round(blobs.length * O.current));
  for (let i = 0; i < nb; i++) {
    const b = blobs[i];
    const ang = b.a0 + t * b.rate * b.dir;
    const orbit = (b.orbitR + Math.sin(t*b.wobRate)*b.wob) * r;
    const px = o.x + Math.cos(ang)*orbit, py = o.y + Math.sin(ang)*orbit;
    const br = b.r * r;
    const a = b.inten * (.7 + .3 * Math.sin(t*b.pRate + b.pSeed));
    let col = P.blobBase;
    if (b.hue > .5) col = P.blobMid;
    if (b.hue > .8) col = P.blobHot;
    const gr = g.createRadialGradient(px,py,0,px,py,br);
    gr.addColorStop(0, rgba(col, a)); gr.addColorStop(1, rgba(P.blobFade, 0));
    g.fillStyle = gr; g.beginPath(); g.arc(px,py,br,0,6.283); g.fill();
  }

  const ns = Math.min(streamers.length, Math.round(streamers.length * O.streamer));
  for (let i = 0; i < ns; i++) {
    const s = streamers[i];
    if (s.kind === 'eruption') continue;
    const a = s.bright * Math.sin(s.age / s.life * Math.PI);
    if (a > .02) {
      g.strokeStyle = rgba(P.granuleCore, a * .85);
      g.lineWidth = s.width * r; g.lineCap = 'round';
      g.shadowColor = rgba(P.granuleMid, 1); g.shadowBlur = 5;
      g.beginPath(); g.moveTo(o.x + s.x0*r, o.y + s.y0*r);
      if (s.cubic) g.bezierCurveTo(o.x+s.cx*r,o.y+s.cy*r,o.x+s.cx2*r,o.y+s.cy2*r,o.x+s.x1*r,o.y+s.y1*r);
      else         g.quadraticCurveTo(o.x+s.cx*r,o.y+s.cy*r,o.x+s.x1*r,o.y+s.y1*r);
      g.stroke();
    }
    if (++s.age >= s.life) streamers[i] = newStreamer(false);
  }
  g.shadowBlur = 0;

  const ng = Math.min(granules.length, Math.round(granules.length * O.current));
  for (let i = 0; i < ng; i++) {
    const gr0 = granules[i];
    const env = Math.sin(gr0.age / gr0.life * Math.PI);
    const d = gr0.age * gr0.drift;
    const ux = gr0.ux + Math.cos(gr0.dAng)*d, uy = gr0.uy + Math.sin(gr0.dAng)*d;
    const dist = Math.hypot(ux, uy);
    const a = gr0.bright * env * Math.max(0, 1 - dist * 1.05);
    if (a > .02 && dist < .99) {
      const px = o.x + ux*r, py = o.y + uy*r, rr = gr0.size*r;
      const gg = g.createRadialGradient(px,py,0,px,py,rr);
      gg.addColorStop(0,  rgba(P.granuleCore, a));
      gg.addColorStop(.5, rgba(P.granuleMid,  a*.6));
      gg.addColorStop(1,  rgba(P.granuleFade, 0));
      g.fillStyle = gg; g.beginPath(); g.arc(px,py,rr,0,6.283); g.fill();
    }
    if (++gr0.age >= gr0.life) granules[i] = newGranule(false);
  }
  g.globalCompositeOperation = 'source-over';
  g.restore();

  g.strokeStyle = P.limbStroke; g.lineWidth = 1.2;
  g.shadowColor = P.limbShadow; g.shadowBlur = 8;
  g.beginPath(); g.arc(o.x,o.y,r,0,6.283); g.stroke(); g.shadowBlur = 0;

  // eruptions leave the disk, so they are drawn outside the clip
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < streamers.length; i++) {
    const s = streamers[i];
    if (s.kind !== 'eruption') continue;
    const a = s.bright * Math.sin(s.age / s.life * Math.PI);
    if (a > .02) {
      g.strokeStyle = rgba(P.flareColor, a);
      g.lineWidth = s.width * r; g.lineCap = 'round';
      g.shadowColor = rgba(P.flareShadow, 1); g.shadowBlur = 12;
      g.beginPath(); g.moveTo(o.x+s.x0*r, o.y+s.y0*r);
      g.quadraticCurveTo(o.x+s.cx*r, o.y+s.cy*r, o.x+s.x1*r, o.y+s.y1*r);
      g.stroke();
    }
    if (++s.age >= s.life) streamers[i] = newStreamer(false);
  }
  g.globalCompositeOperation = 'source-over'; g.restore(); g.shadowBlur = 0;

  if (Math.random() < .012 * O.flare) {
    const a1 = Math.random()*6.283;
    flares.push({ a1, a2: a1 + (Math.random()-.5)*2.2, reach:1.3+Math.random()*.55,
                  age:0, life:50+(Math.random()*40|0) });
  }
  g.shadowColor = rgba(P.flareShadow, 1); g.shadowBlur = 14;
  for (let i = flares.length - 1; i >= 0; i--) {
    const f = flares[i];
    const inten = Math.sin(f.age / f.life * Math.PI);
    const m = (f.a1 + f.a2) / 2;
    g.strokeStyle = rgba(P.flareColor, inten); g.lineWidth = 1.6; g.lineCap = 'round';
    g.beginPath();
    g.moveTo(o.x + Math.cos(f.a1)*r, o.y + Math.sin(f.a1)*r);
    g.quadraticCurveTo(o.x + Math.cos(m)*r*f.reach, o.y + Math.sin(m)*r*f.reach,
                       o.x + Math.cos(f.a2)*r, o.y + Math.sin(f.a2)*r);
    g.stroke();
    if (++f.age >= f.life) flares.splice(i, 1);
  }
  g.shadowBlur = 0;
}
