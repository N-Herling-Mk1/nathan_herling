// ============ THE DECK ============
// 4 placards on a carousel, 90 deg apart. Three ways to drive it, all live at
// once: drag to spin, prev/next to step, or click a top-panel card to swing
// that face flush to camera. Clicking a face minimises the rig into rail slot
// L4 and opens the panel in the main area.

import { CFG, easeIO, clamp01 } from './config.js';
import * as audio from './audio.js';
import * as voice from './voice.js';
import * as layout from './layout.js';

const $ = s => document.querySelector(s);
const N = () => CFG.panels.length;
const pad = n => String(n + 1).padStart(2, '0');

let stage = null, deck = null, printer = null, top = null, view = null, toggles = null;
let cards = [], placards = [];
let ang = 0, vel = 0, target = null, snapping = false;
let dragging = false, moved = 0, lastX = 0, lastT = 0;
let expanded = 0, live = false, mini = false, openIdx = -1;
let pw = 200, R = 160, lastFace = -1;

/* One line per face, fired on a DELIBERATE selection: a click on the top card,
   a click on the placard, or the double-click shortcut. Hover-swing is excluded
   on purpose — the deck swings on mouseenter, and narrating every pass of the
   cursor across the card row would be unbearable. Re-selecting the face that is
   already talking does not restart it. */
function speak(i) {
  const keys = (CFG.voice && CFG.voice.panel) || [];
  const k = keys[i];
  if (k && voice.current() !== k) voice.play(k);
}

export function init() {
  stage = $('#deck-stage'); deck = $('#deck'); printer = $('#printer');
  top = $('#top'); view = $('#view'); toggles = $('#toggles');

  CFG.panels.forEach((p, i) => {
    const c = document.createElement('div');
    c.className = 'placard';
    c.setAttribute('role', 'button'); c.tabIndex = -1;
    c.innerHTML = '<span class="n">' + pad(i) + '</span>'
                + '<span class="l">' + p.label + '</span>'
                + '<span class="b">' + p.blurb + '</span>';
    c.addEventListener('click', ev => { ev.stopPropagation(); if (live && !mini && moved < 6) { speak(i); open(i); } });
    deck.appendChild(c); placards.push(c);

    const b = document.createElement('button');
    b.className = 'card'; b.type = 'button';
    b.innerHTML = '<span class="n">' + pad(i) + '</span>'
                + '<span class="l">' + p.label + '</span>'
                + '<span class="b">' + p.blurb + '</span>';
    // A card is a selector first: single click swings the deck to that face.
    // Double click is the shortcut — it opens the panel without making you go
    // down to the placard. dblclick fires after the second click's click, so
    // the single-click handler has already swung to the right face by then.
    // Single click on a top card only selects — narration is on the double
    // click here, and on the single click down on the deck placard itself.
    b.addEventListener('click', () => { if (live) { if (mini) close(); swingTo(i); } });
    b.addEventListener('dblclick', ev => { ev.preventDefault(); if (live) { speak(i); open(i); } });
    b.addEventListener('mouseenter', () => { if (live && !mini) swingTo(i); });
    b.addEventListener('focus', () => { if (live && !mini) swingTo(i); });
    top.appendChild(b); cards.push(b);
  });

  /* ---- grab ---- */
  // window-level move/up rather than setPointerCapture: capture retargets the
  // click away from the placard, which would kill act 5.
  stage.addEventListener('pointerdown', e => {
    if (!live || mini) return;
    dragging = true; snapping = false; moved = 0;
    lastX = e.clientX; lastT = performance.now();
    stage.classList.add('grabbing');
  });
  addEventListener('pointermove', e => {
    if (!dragging) return;
    const now = performance.now(), dx = e.clientX - lastX, dt = Math.max(1, now - lastT);
    moved += Math.abs(dx);
    ang += dx * 0.35; vel = (dx * 0.35) / dt * 16;
    lastX = e.clientX; lastT = now;
  });
  const release = () => {
    if (!dragging) return;
    dragging = false; stage.classList.remove('grabbing');
    snapNearest();
    setTimeout(() => { moved = 0; }, 0);   // click fires first, so a drag never opens
  };
  addEventListener('pointerup', release);
  addEventListener('pointercancel', release);

  /* ---- toggles ---- */
  $('#prev').addEventListener('click', () => step(-1));
  $('#next').addEventListener('click', () => step(1));
  $('#view-close').addEventListener('click', close);

  addEventListener('keydown', e => {
    if (!live) return;
    if (e.key === 'Escape' && mini) { close(); return; }
    if (mini) return;
    if (e.key === 'ArrowLeft')  { e.preventDefault(); step(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  });

  layout.onResize(place);
  place();
}

/* ---- geometry ---- */
let placeRetry = 0;

export function place() {
  if (!stage) return;
  const r = layout.rect(mini ? 'L4' : 'main');

  /* layout.rect() measures with offsetWidth/offsetTop, which are ZERO until the
     browser has actually laid the desk out. Placing against a degenerate rect
     put the stage somewhere arbitrary and then nothing ever moved it, which is
     how the deck ended up parked over the dock on a reload straight to the
     desk. Refuse to place against geometry that cannot be real, and keep
     retrying until it is. */
  if (!r || r.width < 40 || r.height < 40) {
    if (placeRetry < 90) { placeRetry++; requestAnimationFrame(place); }
    return;
  }
  placeRetry = 0;
  const inset = mini ? 6 : 10;
  stage.style.left = (r.left + inset) + 'px';
  stage.style.top = (r.top + inset) + 'px';
  stage.style.width = Math.max(60, r.width - inset * 2) + 'px';
  stage.style.height = Math.max(60, r.height - inset * 2) + 'px';

  const W = r.width - inset * 2, H = r.height - inset * 2;

  // Lift the deck WITHIN the stage rather than moving the stage box. The box is
  // the drag surface and has to stay inside #main — shifting it up would put it
  // over the top-panel cards and swallow their clicks.
  const lift = mini ? 0 : Math.round(H * ((CFG.deck && CFG.deck.lift) || 0));
  sizeCards(W, H, lift);
  deck.style.top = 'calc(50% - ' + lift + 'px)';
  printer.style.top = 'calc(50% - ' + lift + 'px)';
  if (toggles) toggles.style.transform = 'translateY(' + (-lift) + 'px)';
}
/* Size the cards from the geometry rather than a flat fraction.
   The facing card sits at translateZ(R), i.e. R closer to the camera, so
   perspective magnifies it by P/(P-R) — at R = 0.82*pw that is well over 1.3x.
   A naive cap therefore either wastes space or lets the magnified card punch up
   into the top-panel row. Binary-search the largest card that still fits, with
   the lift, the toggle row and the side cards all accounted for. */
function sizeCards(w, h, lift) {
  const D = CFG.deck || {};
  const P = D.perspective || 1400, RK = D.radius || 0.82, AR = D.aspect || 0.63;
  const M = D.margin || 14;

  // Toggle size is derived from the STAGE width, not from the card width. Doing
  // it the other way round is circular: the cards are sized around the room the
  // toggles need. The row's height then sets that reserve.
  const ts = mini ? 12 : Math.max(D.togMin || 13,
                     Math.min(D.togMax || 21, w * (D.togScale || 0.0165)));
  if (toggles) toggles.style.setProperty('--ts', ts.toFixed(1) + 'px');
  const TOG = ts * 4.6;

  if (mini) {
    pw = Math.max(64, Math.min(w * 0.44, h * 0.72, 96));
  } else {
    const fits = c => {
      const rad = c * RK;
      if (rad >= P * 0.85) return false;
      const sc = P / (P - rad);
      const halfW = (c / 2) * sc, halfH = (c * AR / 2) * sc;
      // vertical: clear of the top edge above the lifted centre, and clear of
      // the toggle row below it
      if (halfH > h / 2 - lift - M) return false;
      if (halfH > h / 2 - TOG - M) return false;
      // horizontal: the side cards swing out to +/-rad; allow for their width
      // as they rotate through the diagonal
      if (Math.max(rad + c * 0.25, halfW) > w / 2 - M) return false;
      return true;
    };
    let lo = 48, hi = Math.max(64, Math.min(w, h) * 1.4);
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (fits(mid)) lo = mid; else hi = mid;
    }
    // The solver returns the largest card that fits; CFG.deck.scale trims it
    // back so the deck sits inside the frame with room around it.
    pw = Math.max(64, Math.min(lo, D.maxCard || 560) * (D.scale || 1));
  }
  const ph = pw * AR;
  R = pw * RK;
  stage.style.setProperty('--pw', pw.toFixed(1) + 'px');
  stage.style.setProperty('--ph', ph.toFixed(1) + 'px');
}

/* ---- rotation ---- */
const stepAng = () => 360 / N();
const facing = () => ((Math.round(-ang / stepAng()) % N()) + N()) % N();
function swingTo(i) { target = -i * stepAng(); snapping = true; vel = 0; mark(i); }
function step(d) { swingTo(((facing() + d) % N() + N()) % N()); audio.snap(); }
function snapNearest() { swingTo(facing()); }
function mark(i) {
  cards.forEach((b, k) => b.setAttribute('aria-current', k === i ? 'true' : 'false'));
  placards.forEach((c, k) => {
    c.classList.toggle('face', k === i);
    c.tabIndex = k === i && live && !mini ? 0 : -1;
  });
}

/* ---- dock hint ----
   The dock slot reads "empty" until something is in it, which says nothing
   about how to put something there. Once a face is settled and openable, it
   carries the instruction instead. */
export function dockHint(on) {
  const slot = layout.slot('L4');
  if (!slot) return;
  slot.classList.toggle('hint', !!on && !mini);
}

/* ---- act 5 ---- */
function open(i) {
  const p = CFG.panels[i];
  openIdx = i; mini = true;
  swingTo(i);
  stage.classList.add('mini');
  layout.slot('L4').classList.add('filled');
  place();
  audio.dock();

  view.querySelector('.n').textContent = pad(i);
  view.querySelector('h2').textContent = p.label;
  const body = view.querySelector('.body');
  const isPdf = p.kind === 'pdf' && p.target;
  view.classList.toggle('pdf', !!isPdf);

  let html = p.body || '';
  if (isPdf) {
    // The browser's own PDF viewer does the rendering. iOS Safari only paints
    // the first page in an iframe, hence the always-visible download button
    // rather than a link buried under the viewer.
    const dl = p.download || p.target.split('/').pop();
    const pages = Array.isArray(p.pages) ? p.pages : [];
    html += '<div class="pdf-bar">'
          + '<a class="pdf-btn" href="' + p.target + '" download="' + dl + '">Download PDF</a>'
          + '<a class="pdf-btn" href="' + p.target + '" target="_blank" rel="noopener">Open in new tab</a>'
          + '</div>'
          + '<div class="pdf-frame">'
          /* Why page images and not a framed pdf.

             The frame reporter settled the iframe question: Chromium refuses to
             DISPLAY a file:// subresource for an opaque origin, and logs
             "Unsafe attempt to load URL". That is the frame itself, not the
             path or the fragment, so the viewer cannot paint from disk however
             it is written. An earlier round removed the guard on the assumption
             that it used to work; it did not.

             An <img> is not a framed document. It is an ordinary subresource
             and it loads from disk without complaint. So the panel shows
             rendered pages — built by tools/build.sh with pdftoppm — and does
             it on both origins, because one code path that always behaves the
             same beats two that diverge exactly where they cannot be tested.

             Download and Open in new tab stay above for the real file: a new
             tab is a top-level navigation, which works locally. */
          + (pages.length
              ? '<div class="pdf-pages">'
                + pages.map((src, n) =>
                    '<img src="' + src + '" alt="' + p.label + ', page ' + (n + 1) + '"'
                    + (n ? ' loading="lazy"' : '') + '>').join('')
                + '</div>'
              : location.protocol === 'file:'
                ? '<p class="pdf-note">No rendered pages are built yet, and from '
                  + 'disk the browser will not draw a pdf inside the page. Use '
                  + '<b>Open in new tab</b> above, or run <code>tools/build.sh</code>.</p>'
                : '<iframe src="' + p.target + '#view=FitH" title="' + p.label + '" loading="lazy"></iframe>')
          + '</div>';
  } else if (p.kind === 'stub') {
    html += '<p style="color:var(--ink-dim)">Nothing wired to this slot yet. '
          + 'Define it in <code>docs/panels.csv</code> and <code>js/config.js</code>.</p>';
  } else if (!html) {
    html = '<p>' + p.blurb + '</p>';
  }
  body.innerHTML = html;
  view.classList.add('on'); view.setAttribute('aria-hidden', 'false');
  toggles.classList.remove('on');
  $('#view-close').focus();
}
function close() {
  if (!mini) return;
  mini = false; openIdx = -1;
  stage.classList.remove('mini');
  layout.slot('L4').classList.remove('filled');
  view.classList.remove('on'); view.setAttribute('aria-hidden', 'true');
  view.querySelector('.body').innerHTML = '';   // unload the pdf viewer
  view.classList.remove('pdf');
  toggles.classList.add('on');
  place(); mark(facing());
  if (cards[0]) cards[Math.max(0, facing())].focus();
}
export const isOpen = () => mini;

/* ---- boot beats ---- */
export function boot(pDeck, pPrint, pCards, pLive) {
  expanded = easeIO(clamp01(pDeck));
  if (pDeck > 0 && !stage.classList.contains('on')) {
    // first frame of the deck's arrival: position it before it is visible
    stage.classList.add('on');
    place();
  }
  printer.classList.toggle('on', pDeck > 0.35 && pPrint < 1);
  const pr = clamp01(pPrint);
  placards.forEach((c, i) => {
    const wasOn = c.classList.contains('printed');
    const nowOn = pr > i / N();
    if (nowOn && !wasOn) audio.deal();
    c.classList.toggle('printed', nowOn);
  });
  if (pCards > 0) layout.dealIn();
  if (pLive >= 1 && !live) {
    live = true; toggles.classList.add('on'); mark(facing());
  }
}

let hintShown = null;
function syncHint() {
  // Deliberately not gated on the deck being settled: the instruction is true
  // whether or not a face has stopped moving, and gating it made the hint
  // flicker every time the carousel drifted.
  const on = live && !mini;
  if (on !== hintShown) { hintShown = on; dockHint(on); }
}

export function frame(now) {
  if (!deck) return;
  syncHint();
  if (!dragging && !snapping) {
    if (mini) ang += 0.16;                 // slow ambient drift while docked
    else { ang += vel; vel *= 0.94; if (Math.abs(vel) < 0.02) vel = 0; }
  }
  if (snapping && target !== null) {
    let d = target - ang;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    ang += d * 0.16;
    if (Math.abs(d) < 0.15) { ang = target; snapping = false; }
  }
  const tilt = -58 + 46 * expanded;        // flat disc -> raked deck
  const r = R * (0.25 + 0.75 * expanded);
  deck.style.transform = 'rotateX(' + tilt.toFixed(2) + 'deg) rotateY(' + ang.toFixed(2) + 'deg)';
  placards.forEach((c, i) => {
    c.style.transform = 'rotateY(' + (i * stepAng()) + 'deg) translateZ(' + r.toFixed(1) + 'px)'
                      + ' rotateX(' + (-tilt).toFixed(2) + 'deg)';
  });
  if (live && !mini) {
    const f = facing();
    if (f !== lastFace) { lastFace = f; mark(f); }
  }
}

/* back to act 1: unwind everything the boot beats set up */
export function reset() {
  live = false; mini = false; openIdx = -1;
  ang = 0; vel = 0; target = null; snapping = false; expanded = 0; lastFace = -1;
  stage.classList.remove('on', 'mini', 'grabbing');

  /* Clearing the `mini` FLAG is not enough. While a panel is open the stage
     carries inline left/top/width/height measured against the dock slot, and
     those survive a return to the splash untouched. Nothing re-placed the stage
     during the reboot, so the deck came back up sitting in the dock — with
     mini already false, which is why the tucked state was not the culprit and
     the dock hint showed correctly. Wipe the geometry so the next place() has
     nothing stale to inherit. */
  stage.style.left = stage.style.top = stage.style.width = stage.style.height = '';
  placeRetry = 0;
  const dockSlot = layout.slot('L4');
  if (dockSlot) dockSlot.classList.remove('filled');
  view.classList.remove('on'); view.setAttribute('aria-hidden', 'true');
  toggles.classList.remove('on');
  printer.classList.remove('on');
  placards.forEach(c => { c.classList.remove('printed', 'face'); c.tabIndex = -1; });
  cards.forEach(b => b.setAttribute('aria-current', 'false'));
}

/* prefers-reduced-motion: skip the choreography, land on the finished state */
/* The deck must come up in the main panel, never in the dock. mini is module
   state and a reload clears it, but the CLASSES that express it live on
   elements the skip path does not otherwise touch, so a reload landing straight
   on the desk could inherit the tucked layout. Assert it instead of assuming. */
export function ensureMain() {
  if (!stage) return;
  mini = false; openIdx = -1;
  stage.classList.remove('mini');
  const slot = layout.slot('L4');
  if (slot) slot.classList.remove('filled');
  if (view) { view.classList.remove('on'); view.setAttribute('aria-hidden', 'true'); }
  place();
}

export function jumpToLive() {
  expanded = 1;
  stage.classList.add('on');
  placards.forEach(c => c.classList.add('printed'));
  layout.dealIn();
  live = true; toggles.classList.add('on'); mark(0); swingTo(0);
  place();
}
