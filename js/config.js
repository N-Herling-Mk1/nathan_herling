// Single source of truth. Nothing else hardcodes a number you might want to tune.
// See docs/STAGE_A_spec.md — this file is the machine-readable half of that doc.

export const CFG = {
  domain: 'nathanherling.com',
  cmd: './init_home_nathan_herling',
  prompt: '<span class="p">[shell]&gt;</span> ',

  // drop the file in assets/audio/ and name it here; starts on EXEC
  track: '',

  /* Two one-shots on the boot timeline. Both are plain assets loaded by path —
     unlike the splash cue there is no compiled-in fallback, so if a file is
     missing the beat is simply silent rather than playing the wrong sound.
       roar  fires the instant the init command finishes typing, under EXEC
       ready fires once the whole boot timeline has run out and the desk is live */
  bootSfx: {
    roar:  'assets/audio/bass_roar_3s.wav',
    ready: 'assets/audio/tone_up_3.wav'
  },

  /* Narration. Files are assets/audio/voice/vo_<key>.wav. Playing a line drives
     PELAGIC's hue, edge glow and scratch-run density off its RMS — see
     js/voice.js and cube.drive(). */
  /* PELAGIC — mk5 etch cube. Values are the tuned rig, read straight off the
     control panel: rotation, camera, edges. There is no panel in the site, so
     these are the settings. */
  cube: {
    spinY: 5,      // one-axis turn
    spinX: 0,      // no tumble
    tilt: -52,     // the lean
    zoom: 19,
    glow: 100,     // edge glow ceiling
    flow: 50       // etch light travel speed
  },

  voice: {
    dir:   'assets/audio/voice/',
    envHz: 50,          // envelope sample rate, must match tools/build.sh

    /* One line per deck face, indexed the same as CFG.panels. */
    panel: ['cv', 'research', 'projects', 'mathematics'],
    cube:  'pelagic',   // clicking PELAGIC itself
    boot:  'online',    // after the ready tone finishes

    /* How hard the level pushes the cube. hue slides the edge colour toward
       white, glow lifts the box-shadow stack, runs multiplies scratch-run
       spawn rate. All additive on top of the idle animation. */
    hue:  1.0,
    glow: 1.0,
    runs: 1.0,
    pulse: 1.0,     // physical size pulse on transients

    /* Response, from the mk5 rig's AUDIO panel. ΔRMS measures rise above a
       running baseline, so transients pop and sustained loudness fades out —
       which is exactly why plain RMS read as a wash. */
    mode:      'delta',   // 'abs' | 'delta' | 'dbfs'
    sens:      50,
    smooth:    50,
    bands:     { bass: 94, vocal: 80, high: 60 },
    adaptive:  true,
    gainFloor: 8,
    gainCeil:  40,

    /* How much of the cube's idle breath is suppressed while a line plays, so
       the voice is what you see rather than the ambient animation. */
    duck: 0.75
  },

  /* ---- ACT 1 — splash. See js/splash.js. ---- */
  splash: {
    /* the cut, then a hold on the finished mark before the wipe. The hold is
       not dead air: cut points revert to their burst cycle and the arcs run
       over the whole signature. */
    writeMs: 3000,
    holdMs:  2000,
    wipeMs:   620,

    /* Fuse blow on the press. Deliberately asymmetric: a hard 60ms over-volt,
       a 240ms collapse, then a long ember that never quite reaches black. A
       symmetric curve here reads as a dimmer being turned down rather than
       something failing. Seconds. */
    fuseSpike: 0.06,
    fuseFall:  0.24,
    fuseEmber: 1.60,

    /* on-press cue. Lives in assets/audio/, not inlined. */
    sfx: 'assets/audio/spark_5s.mp3',

    /* Charged bed. Starts the moment proximity pushes the page past loopOn and
       plays at full volume; stops below loopOff. Two thresholds, not one, so a
       pointer sitting near the boundary cannot chatter it on and off — but the
       gap is small, so the trigger still feels immediate. Built from
       'B_Electricity spark sound effects HQ 2.wav' with a half-second
       crossfade wrapped around the loop point so it does not click. */
    loop:     'assets/audio/hover_loop.mp3',

    /* THESE ARE GAUGE PERCENT — the number on the charge readout, which sits
       at baseCharge (50) at rest and climbs to 100 at the button. Not the
       internal 0..1 power level: 0.50 of that is 75% on the gauge, which is
       nearly on top of the button and is why the trigger felt erratic. */
    loopOnPct:  52,
    loopOffPct: 50.5,

    /* Bolts: discharge from the twinkling band cells down to the centreline.
       Threshold and ramp are in GAUGE PERCENT, like loopOnPct. Deliberately
       capped: more bolts than the signature's own discharge and the whole thing
       flattens into noise, which is the failure mode the letter-to-letter arcs
       already demonstrated. Spawn x is pulled toward the pointer, so the
       heaviest activity sits under where the visitor actually is. */
    boltOnPct:  65,
    boltMax:    7,      // hard ceiling on live bolts
    boltRate:   0.42,   // max spawn chance per frame, at 100% charge
    boltBias:   0.62,   // how strongly spawn x is pulled to the pointer

    /* Minimum drive for the horizontal wave layers while the bed is audible.
       The waves are the visual half of that sound — at the trigger point raw
       power is only ~0.04, which is invisible, so the drive snaps to this
       floor the moment the loop starts and rises with power from there. */
    waveFloor: 0.45,

    baseCharge: 50,     // where the power module sits at load
    proxRadius: 460,    // px from the button at which charge starts rising

    bandCentre: 0.455,  // band centreline, fraction of viewport height
    bandCell:   5,
    bandFlare:  0.11,   // ambient chance per frame of a cell firing

    sigW:   0.52,       // signature width as a fraction of viewport
    sigMax: 720,
    emitStep: 0.010,    // arc-length spacing of spark/arc emitters

    sparkThreshold: 0.58,   // power level at which idle cut bursts begin

    /* Arc gaps are capped short on purpose. Wider letter-to-letter jumps were
       tried: there are far more candidate pairs at that range, they read as
       bright as the short hops, and the frame saturates — the effect only
       works while each strike is sparse enough to register on its own. */
    arc: { min: 0.020, max: 0.120, pool: 1200, threshold: 0.30, rate: 2.6 },

    /* red dwarf, levels locked off the wave HMI solar controls.
       breathe 0 = no pulse on the object. */
    orb: { corona: 0.15, flare: 0.35, current: 1.30, streamer: 1.85, breathe: 0 }
  },

  /* Beam palette for the rail placard and url embers — a key of LASER below. */
  beam: 'ares',


  /* The deck rides above the centre of the main area rather than dead centre —
     it leaves room for the toggles underneath and stops the composition sitting
     low in the frame. Fraction of the stage height. */
  deck: {
    lift: 0.20,       // fraction of stage height the deck rides above centre
    scale: 0.85,      // trim on the solved card size — the solver fills the box,
                      // this backs it off so the deck does not crowd the frame
    maxCard: 560,     // absolute ceiling; the geometry solver usually binds first
    perspective: 1400,// must match #deck-stage perspective in css/deck.css
    radius: 0.82,     // carousel radius as a multiple of card width
    aspect: 0.63,     // card height / card width
    togScale: 0.0165, // toggle text size as a fraction of stage width
    togMin: 13, togMax: 21,
    margin: 14        // px of breathing room at every edge
  },

  /* The etched url stays hot after the cut: a slow aperiodic pulse plus sparks
     popping off random points of the glyph run. */
  urlEtch: {
    pulseMin:  0.26,
    pulseMax:  0.80,
    popMin:    340,   // ms, floor between new hot spots
    popSpread: 1900,  // ms, extra gap; squared random so long gaps dominate
    sparkMin:  9,
    sparkMax:  20,
    driftMin:  5,     // slow secondary embers that linger after the burst
    driftMax:  12,
    smokePuffs: 2,
    bloom:     0.95,  // strength of the wide halo around the etched url

    /* the carve itself, not the aftermath: how hard the head throws while the
       url is being cut */
    /* Measured peak sparks in flight during the 1.8 s carve, by cutSparks:
       7 -> 117 (the old behaviour) · 17 -> 238 · 34 -> 340 · 52 -> 625 */
    cutSparks: 34,    // per frame at the burn front
    cutPower:  1.55,  // ejection speed multiplier
    cutBurst:  70,    // extra shower on a flare
    cutFlare:  0.14,  // chance per frame of a flare
    cutSmoke:  0.65,

    /* a spot does not just emit — it heats first, then lets go */
    heatMin:    420,  // ms of glow ramp before the pop
    heatSpread: 520,
    maxHot:     3,    // spots allowed to be heating at once
    coreR:      0.13, // hot core radius, as a fraction of the url font size
    bloomR:     0.70, // extra bloom radius at full heat

    /* Sparks thrown by the url pop are amber, not beam-red — hot metal leaving
       a red cut. Mixed across the ladder so a burst is never one flat colour. */
    ember: [
      [255, 244, 214],   // near-white, freshly detached
      [255, 220, 150],   // pale gold
      [255, 190,  92],   // amber
      [255, 162,  48],   // deep amber
      [255, 132,  26],   // scorched
      [214,  96,  18]    // cooling
    ],
    emberFlash: [255, 206, 138]
  },

  /* acts 2 + 3 run as one uninterrupted timeline once the user presses enter */
  beats: [
    { k: 'WIPE',    ms: 420  },   // act 2
    { k: 'TYPE',    ms: 1300 },
    { k: 'EXEC',    ms: 250  },
    { k: 'FRAME',   ms: 900  },   // act 3
    { k: 'MOUNT',   ms: 700  },
    { k: 'PLACARD', ms: 700  },
    { k: 'DECK',    ms: 1100 },
    { k: 'PRINT',   ms: 1400 },
    { k: 'CARDS',   ms: 700  },
    { k: 'LIVE',    ms: 500  }
  ],

  /* shell sub-lines, keyed to the beat that reveals them */
  subs: [
    { at: 'FRAME',   t: '  mounting /home/nherling ......... ok' },
    { at: 'MOUNT',   t: '  pelagic docked, rail live ....... ok' },
    { at: 'PLACARD', t: '  identity block mounted .......... ok' },
    { at: 'DECK',    t: '  desk surface raked .............. ok' },
    { at: 'PRINT',   t: '  4 placards printed .............. ok' },
    { at: 'LIVE',    t: '  init_home complete .............. ok' }
  ],

  /* The four deck faces. Order is deliberate: credential, then the work, then
     the hands, then the independent thinking. */
  panels: [
    { label: 'CV', kind: 'pdf', target: 'assets/cv/NHerling_CV_2026.pdf',
      download: 'NHerling_CV_2026.pdf',
      /* Rendered page images, built from the pdf by tools/build.sh. An <img> is
         an ordinary subresource, so it paints from disk; a framed pdf document
         does not. Read the note in js/deck.js before changing this. */
      pages: ['assets/cv/page-1.png', 'assets/cv/page-2.png'],
      blurb: 'Curriculum vitae',
      body: '' },

    { label: 'Research', kind: 'page', target: '',
      blurb: 'ATLAS Run-3 long-lived particle search',
      body: '<p>Graduate Research Assistant, UA ATLAS group.</p>'
          + '<p>Displaced-vertex search for long-lived particles in Run-3 — '
          + 'double-DisCo decorrelation, Bayesian k-fold vetting of trained '
          + 'weights, and a MaxEnt background estimate cross-checking ABCD.</p>'
          + '<h4>Planned publications</h4>'
          + '<p class="wt">Working titles; both in preparation with K. Johns '
          + 'and co-authors.</p>'
          + '<ol class="pubs">'
          + '<li><b>Closure-aware decorrelation for ABCD background '
          + 'estimation: a comparison of penalty families.</b> '
          + 'Controlled ablation across three closure-penalty loss families — '
          + 'one from the literature and two of my own construction — and two '
          + 'constrained-optimization trainers, judged against a preregistered '
          + 'criterion on closure pull.</li>'
          + '<li><b>Maximum-entropy background estimation as an independent '
          + 'validator of the ABCD method in an ATLAS Run-3 '
          + 'long-lived-particle search.</b> Reconstructs ABCD quadrant yields '
          + 'from maximum-entropy background densities sampled through the '
          + 'frozen classifiers, giving a closure cross-check that does not '
          + 'assume regional factorization.</li>'
          + '</ol>' },

    /* Ordering principle: instrumentation and hardware FIRST, software tooling
       under it. Without that this panel turns into a tile wall and stops
       carrying the experimental-physics argument. */
    { label: 'Projects', kind: 'page', target: '',
      blurb: 'Detector instrumentation, hardware, and tooling',
      body: '<ol class="projs">'
          + '<li><b>FORGE</b> — a web-hosted Bayesian posterior observatory. '
          + 'Reads a trained model through four gauges: how much of its '
          + 'uncertainty is epistemic, what the data actually determined, how '
          + 'closely the fast Laplace path agrees with an HMC gold standard, '
          + 'and how concentrated the posterior is. Three reproductions drive '
          + 'it — music-genre classification, phonon density-of-states '
          + 'regression, and ATLAS long-lived-particle detection.'
          + '<a class="plink" href="https://forge-observatory.com" '
          + 'target="_blank" rel="noopener">forge-observatory.com</a></li>'
          + '<li><b>HELIX</b> — research hub and the Evt2Vec / CutFormer '
          + 'framework. The question behind it: do detector events have a '
          + 'detectable grammar — signatures known by the company they keep — '
          + 'and can that structure improve a network? Grounded in Jaynes '
          + 'maximum entropy, where InfoNCE is the Boltzmann distribution and '
          + 'the partition function is the Bayesian normalisation constant.'
          + '<a class="plink" href="https://n-herling-mk1.github.io/_HELIX_/" '
          + 'target="_blank" rel="noopener">n-herling-mk1.github.io/_HELIX_/</a></li>'
          + '<li><b>PELAGIC mk2</b> — voice recognition program. '
          + '<span class="wip">In development.</span></li>'
          + '</ol>'
          + '<h4>Instrumentation and hardware</h4>'
          + '<p><b>Instrumentation.</b> ATLAS detector control and SCADA on '
          + 'WinCC OA — a simulated board fleet and a composite 16-board '
          + 'operator UI.</p>'
          + '<p><b>Hardware.</b> RF and embedded builds, HMI work, and a '
          + 'self-hosted GPU server.</p>'
          + '<p><b>Tooling.</b> Analysis and conversion utilities built for '
          + 'the group, plus personal software.</p>' },

    { label: 'Mathematics', kind: 'page', target: '',
      blurb: 'Root geometry and the folded plane',
      body: '<p>Independent work, intended for publication.</p>'
          + '<p>A bound relating a quadratic\'s focus to its roots, and a real '
          + '(a,b) chart that puts the real and complex root classes on one '
          + 'flat page — the folded plane — using real parameters only, with '
          + 'no imaginary coordinate.</p>'
          + '<h4>Planned publications</h4>'
          + '<p class="wt">Submitting Fall 2026. Working titles.</p>'
          + '<ol class="pubs">'
          + '<li><b>Vieta Conditions and a Real (a,b) Parameterization: '
          + 'Bounding Real and Complex Quadratic Roots</b></li>'
          + '<li><b>Extending the Real (a,b) Parameterization to the Cubic: '
          + 'Vieta Conditions and the Classical Solution</b></li>'
          + '</ol>' }
  ],

  /* Tool tiles, right of the four deck cards. Not deck faces: a click docks
     the deck and mounts the app (js/apps/<id>.js) in the main area. Data lives
     in data/ and is edited in the repo — see docs/apps.md. The id doubles as
     the URL hash, so nathanherling.com/#calendar opens straight to it. */
  tools: [
    { id: 'calendar', label: 'Calendar', glyph: 'calendar', blurb: 'Schedule from data/schedule.json' },
    { id: 'linkdock', label: 'Link Dock', glyph: 'link', blurb: 'Drop a URL, pull its icon' },
    { id: 'gallery',  label: 'Gallery',   glyph: 'image', blurb: 'Screenshots from data/gallery.json' },
    { id: 'planner',  label: 'Week',      glyph: 'week',  blurb: 'Weekly class planner' }
  ]
};

/* 'ares' is sampled directly out of the reference frame, not eyeballed. Each
   role takes a measured value off the red luminance ladder, widest/dimmest to
   narrowest/brightest, so the beam sits at the dark end:

     glow  rgba(112,0,0)   deep body cluster  #700000
     beam  rgb(224,0,16)   saturated cluster  #e00010
     hot   #fd4543         lit edge     p75
     hot2  #fe8061         hot edge     p92
     flare 253,157,126     core         p99

   Note the reference red leans blue (b > g), which is what separates it from
   the amber it replaces. */
export const LASER = {
  ares:   { beam:'rgb(224,0,16)',   glow:'rgba(112,0,0,0.85)',    hot:'#fd4543', hot2:'#fe8061', flare:[253,157,126] },
  amber:  { beam:'rgb(255,130,40)', glow:'rgba(255,140,50,0.85)', hot:'#ffb040', hot2:'#ffd888', flare:[255,150,60] },
  red:    { beam:'rgb(255,60,60)',  glow:'rgba(255,70,60,0.85)',  hot:'#ff5050', hot2:'#ff9090', flare:[255,80,70]  },
  green:  { beam:'rgb(70,255,130)', glow:'rgba(80,255,140,0.85)', hot:'#40ff80', hot2:'#b0ffc8', flare:[90,255,150] },
  cyan:   { beam:'rgb(50,200,255)', glow:'rgba(70,210,255,0.85)', hot:'#40c8ff', hot2:'#a0e0ff', flare:[80,210,255] },
  violet: { beam:'rgb(200,90,255)', glow:'rgba(200,100,255,.85)', hot:'#c870ff', hot2:'#e0b0ff', flare:[210,110,255] }
};
export const pal = () => LASER[CFG.beam] || LASER.ares;

export const TOTAL = CFG.beats.reduce((s, b) => s + b.ms, 0);
export const OFF = (() => { let a = 0; return CFG.beats.map(b => { const v = a; a += b.ms; return v; }); })();
export const idx = k => CFG.beats.findIndex(b => b.k === k);

export const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;

/* raised cosine sweep over [min,max] on its own period and phase */
export function drift(now, d, fallback) {
  if (!d || !d.enabled) return fallback;
  const u = 0.5 - 0.5 * Math.cos(2 * Math.PI * (now / d.periodMs + d.phase));
  return d.min + (d.max - d.min) * u;
}
export const ease    = t => 1 - Math.pow(1 - t, 3);
export const easeIO  = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const smooth  = t => (t = clamp01(t), t * t * (3 - 2 * t));

// progress 0..1 through a named beat, given elapsed ms since the press
export function p(name, e) {
  const i = idx(name);
  return i < 0 ? 0 : clamp01((e - OFF[i]) / CFG.beats[i].ms);
}
