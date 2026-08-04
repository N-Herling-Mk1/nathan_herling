// ============ ORCHESTRATION ============
// Act 1 is untimed and waits for the user. Acts 2 and 3 run as one continuous
// timeline off a single t0. Acts 4 and 5 are interaction, owned by deck.js.
//
// Act 1 used to be the CRT tube + laser gantry (crt.js, etch.js). It is now
// splash.js: statistical band, power module, and a signature cut in pen order
// on the press. Act 2 onward is untouched — the shell still types init_home
// with keystroke sfx, and it is still the last thing before the desk.

import { CFG, TOTAL, p } from './config.js';
import * as sig    from './signature.js';
import * as audio  from './audio.js';
import * as splash from './splash.js';
import * as power  from './power.js';
import * as cube   from './cube.js';
import * as voice  from './voice.js';
import * as nameplate from './nameglitch.js';
import * as shell  from './shell.js';
import * as layout from './layout.js';
import * as deck   from './deck.js';

const $ = s => document.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

let act = 1, t0 = 0, entered = false;
let didFrame = false, didMount = false, didPlacard = false, didReady = false;
let soundOn = () => {};   // assigned in start(), used by backToSplash

const stageEl = $('#stage');

/* ---- the press: splash owns the cut + hold, then calls back ---- */
function fire() {
  if (entered || !splash.isLive()) return;
  audio.unlock();
  splash.fire();
}

/* ---- splash finished wiping: hand over to the shell ---- */
function enter() {
  if (entered) return;
  entered = true;
  act = 2; t0 = performance.now();
  stageEl.classList.add('gone');
  shell.show();
  layout.show();
  try { sessionStorage.setItem('nh_seen', '1'); } catch (e) {}
}

/* ---- acts 3-5: land on the finished layout without the choreography ---- */
function skipToDesk() {
  act = 2; entered = true;
  t0 = performance.now() - TOTAL - 1;
  stageEl.classList.add('gone');
  layout.show(); layout.frameIn();
  shell.show(); shell.dock(layout.rect('L2'));
  sizeCubeInRail();
  deck.jumpToLive();
  deck.ensureMain();
  // Re-place once more after layout has real geometry: on this path nothing has
  // been measured yet, and a stage placed against a zero rect lands wrong.
  requestAnimationFrame(() => deck.place());
  setTimeout(() => deck.place(), 260);
  // No cue here: this path exists for repeat visits and reduced-motion, where
  // the desk simply is loaded rather than becoming loaded. A tone announcing
  // the end of a sequence that never ran would be noise.
  didFrame = didMount = didPlacard = didReady = true;
}

/* Writing --cs is what un-gates the rig: until this runs PELAGIC is not
   rendered at all, which is how it docks at MOUNT rather than appearing at a
   default size the moment the rail fades in. So it must not silently no-op —
   if the slot has not settled yet, measure the dock itself, and failing that
   retry on the next frame rather than leaving the cube dark forever. */
function sizeCubeInRail(tries) {
  const d = $('#pelagic-dock');
  if (!d) return;
  let r = layout.rect('L1');
  if (!r || !r.width || !r.height) r = d.getBoundingClientRect();
  const s = Math.round(Math.min(r.width, r.height) * 0.60);
  if (s > 0) {
    d.style.setProperty('--cs', s + 'px');
    cube.resize();
    return;
  }
  if ((tries || 0) < 30) requestAnimationFrame(() => sizeCubeInRail((tries || 0) + 1));
}

/* ---- back to act 1 ---- */
function backToSplash() {
  if (act === 1) return;
  act = 1;
  entered = false;
  didFrame = didMount = didPlacard = didReady = false;

  voice.stop();
  // Back at the splash the speaker resets to off, as on a first load.
  audio.loopStop();
  soundOn(false);
  deck.reset();
  layout.teardown();
  shell.undock();

  stageEl.classList.remove('gone');
  splash.reset();
  power.reset();

  try { sessionStorage.removeItem('nh_seen'); } catch (e) {}
  $('#enterBtn').focus();
}

/* ---- the loop ---- */
// One thrown frame used to kill the page outright: the reschedule sits at the
// end, so an exception anywhere in a frame meant no further frames and a dead
// canvas with no message. Catch, report once, keep the loop alive.
let loopFailed = false;

function loop(now) {
  try { tick(now); }
  catch (e) {
    if (!loopFailed) { loopFailed = true; console.error('[nh] frame failed:', e); }
  }
  requestAnimationFrame(loop);
}

function tick(now) {
  cube.drive(voice.frame(), voice.playing());

  if (act === 1) {
    // splash.frame returns the live power level; the module reads off it, and
    // the firing flag drives the phase-lock gauge's chaotic overlay
    power.frameAll(splash.frame(now), splash.isFiring());
    nameplate.frame(now);
  } else {
    const e = Math.min(TOTAL, now - t0);
    shell.frame(e);

    if (!didFrame && p('FRAME', e) > 0) {
      didFrame = true;
      layout.frameIn();
      shell.dock(layout.rect('L2'));
      audio.dock();
    }
    if (!didMount && p('MOUNT', e) > 0.15) {
      didMount = true;
      sizeCubeInRail();
    }
    if (!didPlacard && p('PLACARD', e) > 0.2) {
      didPlacard = true;
      layout.drawPlacard();
    }
    // Everything on the desk has landed: the LIVE beat has run out, which is
    // the last entry in CFG.beats. Fires once per boot.
    // The narration follows the ready tone rather than overlapping it: hooked
    // to that element's own 'ended', so it stays in step whatever length the
    // tone file turns out to be.
    if (!didReady && e >= TOTAL) {
      didReady = true;
      audio.shot(CFG.bootSfx.ready, () => voice.play(CFG.voice.boot));
    }

    deck.boot(p('DECK', e), p('PRINT', e), p('CARDS', e), p('LIVE', e));
    deck.frame(now);
    if (didPlacard) layout.drawPlacardFrame(now);
    cube.frame(now);
  }
}

/* ---- boot ---- */
async function start() {
  window.__nh_booted = true;   // read by the boot guard in index.html

  // The splash cannot run without the vector signature — it is the thing being
  // cut — so unlike the old tube there is no text-plate fallback. If the fetch
  // fails the page still shows band, url and button, just nothing to cut.
  try { await sig.load(); } catch (e) { /* degrade to band + url + button */ }

  splash.init($('#splash-canvas'), $('#enterBtn'), $('#sitename'), $('#splash-wipe'));
  splash.onEnter(enter);
  nameplate.init($('#sitename'));
  power.init($('#power'));
  cube.init($('#pelagic-dock'));
  shell.init($('#term'));
  layout.init();
  deck.init();
  layout.onResize(() => { shell.place(layout.rect('L2')); deck.place(); });

  /* The desk is a CSS grid whose cells settle after fonts, images and the first
     real layout pass. Anything that measured it earlier measured nothing, so
     watch the panel itself rather than trying to guess when it is ready. */
  const mainEl = $('#main');
  if (mainEl && window.ResizeObserver) {
    let seen = 0;
    new ResizeObserver(() => {
      const w = mainEl.offsetWidth;
      if (w > 40 && w !== seen) { seen = w; deck.place(); shell.place(layout.rect('L2')); }
    }).observe(mainEl);
  }
  addEventListener('load', () => { deck.place(); shell.place(layout.rect('L2')); });

  /* No audio is loaded, armed or played at boot. Every earlier attempt to get
     ahead of the autoplay policy — preloading files, arming the bed muted —
     bought nothing and cost a stack of "AudioContext was not allowed to start"
     warnings, because the context was being built before any gesture existed.
     The speaker is the mechanism now: a file loads the first time it is
     actually wanted, and the context is only ever created inside a click. */

  /* Sound toggle. Starts off, so it reads as an invitation rather than a
     control that is already doing its job. Clicking it is itself the gesture
     that unlocks audio, which is the whole point of it existing. Pressing the
     entry button switches it on too — by then the visitor has interacted, so
     leaving it dark would be a lie about the state. */
  const snd = $('#sndToggle');
  soundOn = on => {
    const label = on ? 'Sound on' : 'Sound off';
    snd.setAttribute('aria-pressed', on ? 'true' : 'false');
    snd.setAttribute('aria-label', label);
    snd.title = label;
    audio.setBedAllowed(on);
    // Unlock and arm ONLY once switched on, and only ever from inside a click
    // handler, so the context is created with activation already granted.
    if (on) { audio.unlock(); audio.loopArm(CFG.splash.loop); }
  };
  soundOn(false);
  snd.addEventListener('click', e => {
    e.stopPropagation();
    soundOn(snd.getAttribute('aria-pressed') !== 'true');
  });

  // Pressing enter switches it on regardless: the visitor has interacted, the
  // boot cues are about to play, and leaving it dark would misreport the state.
  $('#enterBtn').addEventListener('click', () => soundOn(true));
  $('#enterBtn').addEventListener('click', fire);
  // PELAGIC introduces itself when clicked
  const dock = $('#pelagic-dock');
  dock.style.cursor = 'pointer';
  dock.setAttribute('aria-hidden', 'false');
  dock.addEventListener('click', () => {
    if (act !== 1 && voice.current() !== CFG.voice.cube) voice.play(CFG.voice.cube);
  });
  $('#back').addEventListener('click', backToSplash);
  // F11 is the ONLY key that enters. Any-key-enters meant a stray keystroke —
  // or a screen reader moving focus — dropped you into the site. The button is
  // otherwise the only way in, and it still responds to Enter/Space natively
  // when focused, which is standard button behaviour and worth keeping.
  // Note: F11 is not preventDefault-ed, so the browser still toggles
  // fullscreen. Add e.preventDefault() below if you would rather it did not.
  addEventListener('keydown', e => {
    if (act === 1 && splash.isLive() && e.key === 'F11') fire();
  });

  let rz;
  addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => {
      splash.size();
      nameplate.measure();
      if (act !== 1) sizeCubeInRail();
      layout.resize();
    }, 120);
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { layout.drawPlacard(); deck.place(); nameplate.measure(); });
  }

  let seen = false;
  try { seen = sessionStorage.getItem('nh_seen') === '1'; } catch (e) {}

  requestAnimationFrame(loop);

  if (reduced || seen) {
    // wait one frame so the desk has real geometry before we measure it
    requestAnimationFrame(() => requestAnimationFrame(skipToDesk));
  }
}

start();

/* ---- resource error reporter ----
   A file:// page reports a failed subresource as "Unsafe attempt to load URL X
   from frame with URL Y", and Chromium attributes it to index.html:1 rather
   than to whatever asked for it — which makes it untraceable from the console
   alone. This listener catches the error at the element that raised it and
   prints the tag and the URL, so the culprit names itself. */
addEventListener('error', e => {
  const t = e.target;
  if (!t || t === window || !t.tagName) return;
  console.warn('[nh] resource failed:', t.tagName,
               t.currentSrc || t.src || t.href || '(empty src — resolves to the page URL)', t);
}, true);

/* The "Unsafe attempt to load URL" message is Chromium refusing a FRAME
   navigation on a file:// origin, not a failed subresource — the listener above
   never sees it. Nothing in index.html, config.js or any stylesheet references
   the page itself, and the only frame this site creates is the CV pdf viewer.
   So watch for frames appearing and report what each one is actually pointed
   at, resolved. If the message fires with no frame logged here, it is coming
   from the browser's own pdf plugin and not from this code. */
const MO = window.MutationObserver;
if (MO) new MO(muts => {
  for (const m of muts) for (const n of m.addedNodes) {
    if (!n.tagName) continue;
    const frames = n.tagName === 'IFRAME' ? [n] : (n.querySelectorAll ? n.querySelectorAll('iframe') : []);
    for (const f of frames) {
      console.warn('[nh] frame created — raw src:', f.getAttribute('src'),
                   '| resolved:', f.src, f);
    }
  }
}).observe(document.documentElement, { childList: true, subtree: true });
