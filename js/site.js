/* GENERATED — do not edit. Built from the js/ modules by tools/build.sh. */
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target3, all) => {
    for (var name in all)
      __defProp(target3, name, { get: all[name], enumerable: true });
  };

  // js/config.js
  var CFG = {
    domain: "nathanherling.com",
    cmd: "./init_home_nathan_herling",
    prompt: '<span class="p">[shell]&gt;</span> ',
    // drop the file in assets/audio/ and name it here; starts on EXEC
    track: "",
    /* Two one-shots on the boot timeline. Both are plain assets loaded by path —
       unlike the splash cue there is no compiled-in fallback, so if a file is
       missing the beat is simply silent rather than playing the wrong sound.
         roar  fires the instant the init command finishes typing, under EXEC
         ready fires once the whole boot timeline has run out and the desk is live */
    bootSfx: {
      roar: "assets/audio/bass_roar_3s.wav",
      ready: "assets/audio/tone_up_3.wav"
    },
    /* Narration. Files are assets/audio/voice/vo_<key>.wav. Playing a line drives
       PELAGIC's hue, edge glow and scratch-run density off its RMS — see
       js/voice.js and cube.drive(). */
    /* PELAGIC — mk5 etch cube. Values are the tuned rig, read straight off the
       control panel: rotation, camera, edges. There is no panel in the site, so
       these are the settings. */
    cube: {
      spinY: 5,
      // one-axis turn
      spinX: 0,
      // no tumble
      tilt: -52,
      // the lean
      zoom: 19,
      glow: 100,
      // edge glow ceiling
      flow: 50
      // etch light travel speed
    },
    voice: {
      dir: "assets/audio/voice/",
      envHz: 50,
      // envelope sample rate, must match tools/build.sh
      /* One line per deck face, indexed the same as CFG.panels. */
      panel: ["cv", "research", "projects", "mathematics"],
      cube: "pelagic",
      // clicking PELAGIC itself
      boot: "online",
      // after the ready tone finishes
      /* How hard the level pushes the cube. hue slides the edge colour toward
         white, glow lifts the box-shadow stack, runs multiplies scratch-run
         spawn rate. All additive on top of the idle animation. */
      hue: 1,
      glow: 1,
      runs: 1,
      pulse: 1,
      // physical size pulse on transients
      /* Response, from the mk5 rig's AUDIO panel. ΔRMS measures rise above a
         running baseline, so transients pop and sustained loudness fades out —
         which is exactly why plain RMS read as a wash. */
      mode: "delta",
      // 'abs' | 'delta' | 'dbfs'
      sens: 50,
      smooth: 50,
      bands: { bass: 94, vocal: 80, high: 60 },
      adaptive: true,
      gainFloor: 8,
      gainCeil: 40,
      /* How much of the cube's idle breath is suppressed while a line plays, so
         the voice is what you see rather than the ambient animation. */
      duck: 0.75
    },
    /* ---- ACT 1 — splash. See js/splash.js. ---- */
    splash: {
      /* the cut, then a hold on the finished mark before the wipe. The hold is
         not dead air: cut points revert to their burst cycle and the arcs run
         over the whole signature. */
      writeMs: 3e3,
      holdMs: 2e3,
      wipeMs: 620,
      /* Fuse blow on the press. Deliberately asymmetric: a hard 60ms over-volt,
         a 240ms collapse, then a long ember that never quite reaches black. A
         symmetric curve here reads as a dimmer being turned down rather than
         something failing. Seconds. */
      fuseSpike: 0.06,
      fuseFall: 0.24,
      fuseEmber: 1.6,
      /* on-press cue. Lives in assets/audio/, not inlined. */
      sfx: "assets/audio/spark_5s.mp3",
      /* Charged bed. Starts the moment proximity pushes the page past loopOn and
         plays at full volume; stops below loopOff. Two thresholds, not one, so a
         pointer sitting near the boundary cannot chatter it on and off — but the
         gap is small, so the trigger still feels immediate. Built from
         'B_Electricity spark sound effects HQ 2.wav' with a half-second
         crossfade wrapped around the loop point so it does not click. */
      loop: "assets/audio/hover_loop.mp3",
      /* THESE ARE GAUGE PERCENT — the number on the charge readout, which sits
         at baseCharge (50) at rest and climbs to 100 at the button. Not the
         internal 0..1 power level: 0.50 of that is 75% on the gauge, which is
         nearly on top of the button and is why the trigger felt erratic. */
      loopOnPct: 52,
      loopOffPct: 50.5,
      /* Bolts: discharge from the twinkling band cells down to the centreline.
         Threshold and ramp are in GAUGE PERCENT, like loopOnPct. Deliberately
         capped: more bolts than the signature's own discharge and the whole thing
         flattens into noise, which is the failure mode the letter-to-letter arcs
         already demonstrated. Spawn x is pulled toward the pointer, so the
         heaviest activity sits under where the visitor actually is. */
      boltOnPct: 65,
      boltMax: 7,
      // hard ceiling on live bolts
      boltRate: 0.42,
      // max spawn chance per frame, at 100% charge
      boltBias: 0.62,
      // how strongly spawn x is pulled to the pointer
      /* Minimum drive for the horizontal wave layers while the bed is audible.
         The waves are the visual half of that sound — at the trigger point raw
         power is only ~0.04, which is invisible, so the drive snaps to this
         floor the moment the loop starts and rises with power from there. */
      waveFloor: 0.45,
      baseCharge: 50,
      // where the power module sits at load
      proxRadius: 460,
      // px from the button at which charge starts rising
      bandCentre: 0.455,
      // band centreline, fraction of viewport height
      bandCell: 5,
      bandFlare: 0.11,
      // ambient chance per frame of a cell firing
      sigW: 0.52,
      // signature width as a fraction of viewport
      sigMax: 720,
      emitStep: 0.01,
      // arc-length spacing of spark/arc emitters
      sparkThreshold: 0.58,
      // power level at which idle cut bursts begin
      /* Arc gaps are capped short on purpose. Wider letter-to-letter jumps were
         tried: there are far more candidate pairs at that range, they read as
         bright as the short hops, and the frame saturates — the effect only
         works while each strike is sparse enough to register on its own. */
      arc: { min: 0.02, max: 0.12, pool: 1200, threshold: 0.3, rate: 2.6 },
      /* red dwarf, levels locked off the wave HMI solar controls.
         breathe 0 = no pulse on the object. */
      orb: { corona: 0.15, flare: 0.35, current: 1.3, streamer: 1.85, breathe: 0 }
    },
    /* Beam palette for the rail placard and url embers — a key of LASER below. */
    beam: "ares",
    /* The deck rides above the centre of the main area rather than dead centre —
       it leaves room for the toggles underneath and stops the composition sitting
       low in the frame. Fraction of the stage height. */
    deck: {
      lift: 0.2,
      // fraction of stage height the deck rides above centre
      scale: 0.85,
      // trim on the solved card size — the solver fills the box,
      // this backs it off so the deck does not crowd the frame
      maxCard: 560,
      // absolute ceiling; the geometry solver usually binds first
      perspective: 1400,
      // must match #deck-stage perspective in css/deck.css
      radius: 0.82,
      // carousel radius as a multiple of card width
      aspect: 0.63,
      // card height / card width
      togScale: 0.0165,
      // toggle text size as a fraction of stage width
      togMin: 13,
      togMax: 21,
      margin: 14
      // px of breathing room at every edge
    },
    /* The etched url stays hot after the cut: a slow aperiodic pulse plus sparks
       popping off random points of the glyph run. */
    urlEtch: {
      pulseMin: 0.26,
      pulseMax: 0.8,
      popMin: 340,
      // ms, floor between new hot spots
      popSpread: 1900,
      // ms, extra gap; squared random so long gaps dominate
      sparkMin: 9,
      sparkMax: 20,
      driftMin: 5,
      // slow secondary embers that linger after the burst
      driftMax: 12,
      smokePuffs: 2,
      bloom: 0.95,
      // strength of the wide halo around the etched url
      /* the carve itself, not the aftermath: how hard the head throws while the
         url is being cut */
      /* Measured peak sparks in flight during the 1.8 s carve, by cutSparks:
         7 -> 117 (the old behaviour) · 17 -> 238 · 34 -> 340 · 52 -> 625 */
      cutSparks: 34,
      // per frame at the burn front
      cutPower: 1.55,
      // ejection speed multiplier
      cutBurst: 70,
      // extra shower on a flare
      cutFlare: 0.14,
      // chance per frame of a flare
      cutSmoke: 0.65,
      /* a spot does not just emit — it heats first, then lets go */
      heatMin: 420,
      // ms of glow ramp before the pop
      heatSpread: 520,
      maxHot: 3,
      // spots allowed to be heating at once
      coreR: 0.13,
      // hot core radius, as a fraction of the url font size
      bloomR: 0.7,
      // extra bloom radius at full heat
      /* Sparks thrown by the url pop are amber, not beam-red — hot metal leaving
         a red cut. Mixed across the ladder so a burst is never one flat colour. */
      ember: [
        [255, 244, 214],
        // near-white, freshly detached
        [255, 220, 150],
        // pale gold
        [255, 190, 92],
        // amber
        [255, 162, 48],
        // deep amber
        [255, 132, 26],
        // scorched
        [214, 96, 18]
        // cooling
      ],
      emberFlash: [255, 206, 138]
    },
    /* acts 2 + 3 run as one uninterrupted timeline once the user presses enter */
    beats: [
      { k: "WIPE", ms: 420 },
      // act 2
      { k: "TYPE", ms: 1300 },
      { k: "EXEC", ms: 250 },
      { k: "FRAME", ms: 900 },
      // act 3
      { k: "MOUNT", ms: 700 },
      { k: "PLACARD", ms: 700 },
      { k: "DECK", ms: 1100 },
      { k: "PRINT", ms: 1400 },
      { k: "CARDS", ms: 700 },
      { k: "LIVE", ms: 500 }
    ],
    /* shell sub-lines, keyed to the beat that reveals them */
    subs: [
      { at: "FRAME", t: "  mounting /home/nherling ......... ok" },
      { at: "MOUNT", t: "  pelagic docked, rail live ....... ok" },
      { at: "PLACARD", t: "  identity block mounted .......... ok" },
      { at: "DECK", t: "  desk surface raked .............. ok" },
      { at: "PRINT", t: "  4 placards printed .............. ok" },
      { at: "LIVE", t: "  init_home complete .............. ok" }
    ],
    /* The four deck faces. Order is deliberate: credential, then the work, then
       the hands, then the independent thinking. */
    panels: [
      {
        label: "CV",
        kind: "pdf",
        target: "assets/cv/NHerling_CV_2026.pdf",
        download: "NHerling_CV_2026.pdf",
        /* Rendered page images, built from the pdf by tools/build.sh. An <img> is
           an ordinary subresource, so it paints from disk; a framed pdf document
           does not. Read the note in js/deck.js before changing this. */
        pages: ["assets/cv/page-1.png", "assets/cv/page-2.png"],
        blurb: "Curriculum vitae",
        body: ""
      },
      {
        label: "Research",
        kind: "page",
        target: "",
        blurb: "ATLAS Run-3 long-lived particle search",
        body: '<p>Graduate Research Assistant, UA ATLAS group.</p><p>Displaced-vertex search for long-lived particles in Run-3 \u2014 double-DisCo decorrelation, Bayesian k-fold vetting of trained weights, and a MaxEnt background estimate cross-checking ABCD.</p><h4>Planned publications</h4><p class="wt">Working titles; both in preparation with K. Johns and co-authors.</p><ol class="pubs"><li><b>Closure-aware decorrelation for ABCD background estimation: a comparison of penalty families.</b> Controlled ablation across three closure-penalty loss families \u2014 one from the literature and two of my own construction \u2014 and two constrained-optimization trainers, judged against a preregistered criterion on closure pull.</li><li><b>Maximum-entropy background estimation as an independent validator of the ABCD method in an ATLAS Run-3 long-lived-particle search.</b> Reconstructs ABCD quadrant yields from maximum-entropy background densities sampled through the frozen classifiers, giving a closure cross-check that does not assume regional factorization.</li></ol>'
      },
      /* Ordering principle: instrumentation and hardware FIRST, software tooling
         under it. Without that this panel turns into a tile wall and stops
         carrying the experimental-physics argument. */
      {
        label: "Projects",
        kind: "page",
        target: "",
        blurb: "Detector instrumentation, hardware, and tooling",
        body: '<ol class="projs"><li><b>FORGE</b> \u2014 a web-hosted Bayesian posterior observatory. Reads a trained model through four gauges: how much of its uncertainty is epistemic, what the data actually determined, how closely the fast Laplace path agrees with an HMC gold standard, and how concentrated the posterior is. Three reproductions drive it \u2014 music-genre classification, phonon density-of-states regression, and ATLAS long-lived-particle detection.<a class="plink" href="https://forge-observatory.com" target="_blank" rel="noopener">forge-observatory.com</a></li><li><b>HELIX</b> \u2014 research hub and the Evt2Vec / CutFormer framework. The question behind it: do detector events have a detectable grammar \u2014 signatures known by the company they keep \u2014 and can that structure improve a network? Grounded in Jaynes maximum entropy, where InfoNCE is the Boltzmann distribution and the partition function is the Bayesian normalisation constant.<a class="plink" href="https://n-herling-mk1.github.io/_HELIX_/" target="_blank" rel="noopener">n-herling-mk1.github.io/_HELIX_/</a></li><li><b>PELAGIC mk2</b> \u2014 voice recognition program. <span class="wip">In development.</span></li></ol><h4>Instrumentation and hardware</h4><p><b>Instrumentation.</b> ATLAS detector control and SCADA on WinCC OA \u2014 a simulated board fleet and a composite 16-board operator UI.</p><p><b>Hardware.</b> RF and embedded builds, HMI work, and a self-hosted GPU server.</p><p><b>Tooling.</b> Analysis and conversion utilities built for the group, plus personal software.</p>'
      },
      {
        label: "Mathematics",
        kind: "page",
        target: "",
        blurb: "Root geometry and the folded plane",
        body: `<p>Independent work, intended for publication.</p><p>A bound relating a quadratic's focus to its roots, and a real (a,b) chart that puts the real and complex root classes on one flat page \u2014 the folded plane \u2014 using real parameters only, with no imaginary coordinate.</p><h4>Planned publications</h4><p class="wt">Submitting Fall 2026. Working titles.</p><ol class="pubs"><li><b>Vieta Conditions and a Real (a,b) Parameterization: Bounding Real and Complex Quadratic Roots</b></li><li><b>Extending the Real (a,b) Parameterization to the Cubic: Vieta Conditions and the Classical Solution</b></li></ol>`
      }
    ],
    /* Tool tiles, right of the four deck cards. Not deck faces: a click docks
       the deck and mounts the app (js/apps/<id>.js) in the main area. Data lives
       in data/ and is edited in the repo — see docs/apps.md. The id doubles as
       the URL hash, so nathanherling.com/#calendar opens straight to it. */
    tools: [
      { id: "calendar", label: "Calendar", glyph: "calendar", blurb: "Schedule from data/schedule.json" },
      { id: "linkdock", label: "Link Dock", glyph: "link", blurb: "Drop a URL, pull its icon" }
    ]
  };
  var LASER = {
    ares: { beam: "rgb(224,0,16)", glow: "rgba(112,0,0,0.85)", hot: "#fd4543", hot2: "#fe8061", flare: [253, 157, 126] },
    amber: { beam: "rgb(255,130,40)", glow: "rgba(255,140,50,0.85)", hot: "#ffb040", hot2: "#ffd888", flare: [255, 150, 60] },
    red: { beam: "rgb(255,60,60)", glow: "rgba(255,70,60,0.85)", hot: "#ff5050", hot2: "#ff9090", flare: [255, 80, 70] },
    green: { beam: "rgb(70,255,130)", glow: "rgba(80,255,140,0.85)", hot: "#40ff80", hot2: "#b0ffc8", flare: [90, 255, 150] },
    cyan: { beam: "rgb(50,200,255)", glow: "rgba(70,210,255,0.85)", hot: "#40c8ff", hot2: "#a0e0ff", flare: [80, 210, 255] },
    violet: { beam: "rgb(200,90,255)", glow: "rgba(200,100,255,.85)", hot: "#c870ff", hot2: "#e0b0ff", flare: [210, 110, 255] }
  };
  var pal = () => LASER[CFG.beam] || LASER.ares;
  var TOTAL = CFG.beats.reduce((s, b) => s + b.ms, 0);
  var OFF = (() => {
    let a = 0;
    return CFG.beats.map((b) => {
      const v = a;
      a += b.ms;
      return v;
    });
  })();
  var idx = (k) => CFG.beats.findIndex((b) => b.k === k);
  var clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
  var easeIO = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function p(name, e) {
    const i = idx(name);
    return i < 0 ? 0 : clamp01((e - OFF[i]) / CFG.beats[i].ms);
  }

  // js/sigdata.js
  var SIG_DATA = { "aspect": 0.3398, "total": 6.7448, "strokes": [{ "pts": [[-1, -0.0898], [-1, -0.1117], [-0.9969, -0.1258], [-0.9766, -0.1461], [-0.9516, -0.1539], [-0.9328, -0.1539], [-0.9125, -0.1492], [-0.8969, -0.1414], [-0.8656, -0.1195], [-0.8344, -0.0883], [-0.7984, -0.0445], [-0.7812, -0.0164], [-0.7734, 55e-4], [-0.7672, 0.0133], [-0.7609, 0.0164], [-0.7516, 0.0102], [-0.7469, -55e-4], [-0.7359, -0.0148], [-0.7328, -0.0586], [-0.7297, -0.0711], [-0.7297, -0.1539]], "cum": [0, 0.0219, 0.0363, 0.065, 0.0912, 0.11, 0.1309, 0.1483, 0.1865, 0.2306, 0.2873, 0.3203, 0.3435, 0.3535, 0.3605, 0.3717, 0.3881, 0.4025, 0.4464, 0.4593, 0.5421], "len": 0.5421 }, { "pts": [[-0.7719, 0.207], [-0.7781, 0.1992], [-0.7797, 0.1836], [-0.7766, 0.1445], [-0.7719, 0.1133], [-0.7609, 0.1039], [-0.7594, 0.018]], "cum": [0, 0.01, 0.0256, 0.0649, 0.0964, 0.1109, 0.1968], "len": 0.1968 }, { "pts": [[-0.7719, 0.2383], [-0.7703, 0.2086], [-0.7578, 0.1977], [-0.7484, 0.1617], [-0.7484, 0.132], [-0.7516, 0.1133], [-0.7609, 0.1039]], "cum": [0, 0.0297, 0.0463, 0.0835, 0.1132, 0.1322, 0.1454], "len": 0.1454 }, { "pts": [[-0.7359, -0.0148], [-0.7266, -23e-4], [-0.7234, 0.0258], [-0.6969, 0.1086], [-0.6656, 0.1695], [-0.6359, 0.2148], [-0.5797, 0.2758], [-0.5406, 0.3055], [-0.5094, 0.3055], [-0.4953, 0.3008], [-0.4875, 0.2945]], "cum": [0, 0.0156, 0.0439, 0.1308, 0.1993, 0.2534, 0.3364, 0.3855, 0.4167, 0.4315, 0.4416], "len": 0.4416 }, { "pts": [[-0.5906, -0.0836], [-0.6, -0.0898], [-0.6156, -0.118], [-0.6313, -0.1305], [-0.6516, -0.1305], [-0.6578, -0.1227], [-0.6594, -0.107], [-0.6547, -0.0914], [-0.6391, -0.0648], [-0.5984, -0.0195], [-0.5859, -0.0164], [-0.5812, -0.0211], [-0.5875, -0.0414], [-0.5859, -0.0664], [-0.5891, -0.082], [-0.5828, -0.0867], [-0.5734, -0.107], [-0.5641, -0.1148], [-0.5531, -0.1148], [-0.5375, -0.1023]], "cum": [0, 0.0113, 0.0435, 0.0636, 0.0839, 0.0938, 0.1096, 0.1259, 0.1567, 0.2176, 0.2305, 0.2372, 0.2584, 0.2835, 0.2994, 0.3072, 0.3296, 0.3418, 0.3528, 0.3727], "len": 0.3727 }, { "pts": [[-0.5344, 0.0492], [-0.5406, 0.0477], [-0.5484, 0.0398], [-0.55, 0.0211], [-0.5422, 39e-4], [-0.5328, -55e-4], [-0.5125, -0.0148], [-0.4969, -0.018], [-0.4609, -0.018], [-0.4328, -55e-4], [-0.4062, 0.0195], [-0.3953, 0.0336], [-0.3844, 0.0383], [-0.3719, 0.0773], [-0.3703, 0.093], [-0.3656, 0.1023], [-0.3562, 0.1695]], "cum": [0, 64e-4, 0.0175, 0.0362, 0.0551, 0.0684, 0.0908, 0.1067, 0.1427, 0.1734, 0.2099, 0.2278, 0.2396, 0.2806, 0.2964, 0.3068, 0.3746], "len": 0.3746 }, { "pts": [[-0.4594, -0.0195], [-0.4641, -0.0648], [-0.4641, -0.0914], [-0.4594, -0.1133], [-0.4562, -0.1164]], "cum": [0, 0.0455, 0.0721, 0.0945, 0.099], "len": 0.099 }, { "pts": [[-0.4531, -86e-4], [-0.4547, 23e-4], [-0.4516, 0.0305], [-0.4453, 0.0586], [-0.4375, 0.1258], [-0.4375, 0.1695], [-0.4406, 0.1789], [-0.4406, 0.1914]], "cum": [0, 0.011, 0.0394, 0.0682, 0.1358, 0.1795, 0.1894, 0.2019], "len": 0.2019 }, { "pts": [[-0.4062, -0.1008], [-0.4078, -0.0914], [-0.4016, -0.0602], [-0.3797, 0.0102], [-0.3797, 0.0352], [-0.3828, 0.0383]], "cum": [0, 95e-4, 0.0413, 0.1151, 0.1401, 0.1445], "len": 0.1445 }, { "pts": [[-0.3781, 0.0117], [-0.3562, 0.0133], [-0.3422, 39e-4], [-0.325, -0.0336], [-0.325, -0.0445], [-0.3188, -0.0711], [-0.3156, -0.0789], [-0.3062, -0.0898], [-0.2891, -0.0898], [-0.2828, -0.0836], [-0.2797, -0.0758], [-0.2656, -0.0727], [-0.2469, -0.0523], [-0.2359, -0.0477], [-0.2328, -0.032], [-0.2359, -0.0258], [-0.2359, -86e-4], [-0.2328, 39e-4], [-0.2359, 86e-4], [-0.2469, 7e-3], [-0.2672, -0.0133], [-0.2844, -0.0414], [-0.2875, -0.0648], [-0.2797, -0.0742]], "cum": [0, 0.022, 0.0388, 0.0801, 0.091, 0.1183, 0.1267, 0.1411, 0.1582, 0.1671, 0.1754, 0.1899, 0.2176, 0.2295, 0.2455, 0.2524, 0.2696, 0.2825, 0.2881, 0.2992, 0.3279, 0.3609, 0.3845, 0.3967], "len": 0.3967 }, { "pts": [[-0.2344, -0.0477], [-0.2281, -0.0555], [-0.2281, -0.0648], [-0.2203, -0.0805], [-0.2172, -0.0836], [-0.2094, -0.0836], [-0.2016, -0.0773], [-0.1922, -0.0617], [-0.1766, -0.0195], [-0.1609, -0.0117], [-0.1516, -0.0133], [-0.1406, -0.0242], [-0.1219, -0.057], [-0.1031, -0.0805]], "cum": [0, 0.01, 0.0193, 0.0369, 0.0412, 0.049, 0.0591, 0.0773, 0.1223, 0.1398, 0.1492, 0.1647, 0.2025, 0.2326], "len": 0.2326 }, { "pts": [[0.0234, 0.2148], [0.0172, 0.2148], [0.0125, 0.2102], [0.0109, 0.1992], [0.0156, 0.182], [0.0219, 0.1695], [0.0422, 0.1492], [0.0484, 0.1461], [0.0609, 0.1414], [0.0906, 0.1414], [0.1078, 0.1461], [0.1375, 0.1648], [0.1484, 0.168], [0.1594, 0.1867], [0.1656, 0.2117], [0.1703, 0.2523]], "cum": [0, 62e-4, 0.0128, 0.0239, 0.0417, 0.0557, 0.0844, 0.0914, 0.1047, 0.1344, 0.1522, 0.1873, 0.1987, 0.2204, 0.2462, 0.287], "len": 0.287 }, { "pts": [[0.1484, -0.0648], [0.1359, -0.0898], [0.1297, -0.0945], [0.1219, -0.0945], [0.1156, -0.0836], [0.1141, -0.057], [0.1188, -7e-3], [0.1484, 0.1258], [0.1531, 0.1602], [0.1531, 0.1648], [0.15, 0.168]], "cum": [0, 0.028, 0.0357, 0.0435, 0.0561, 0.0828, 0.133, 0.269, 0.3038, 0.3084, 0.3128], "len": 0.3128 }, { "pts": [[0.1562, 0.0258], [0.1609, 0.0273], [0.1703, 0.0242], [0.1828, 0.0133], [0.1969, -86e-4], [0.2062, -0.043], [0.2156, -0.0492], [0.2188, -0.2164]], "cum": [0, 49e-4, 0.0148, 0.0314, 0.0575, 0.0931, 0.1044, 0.2716], "len": 0.2716 }, { "pts": [[0.2188, -0.0492], [0.225, -0.0414], [0.2266, -0.0164], [0.2297, -7e-3], [0.2484, 0.1711], [0.2594, 0.243], [0.2625, 0.2883], [0.2719, 0.3289], [0.2766, 0.3367], [0.2828, 0.3398]], "cum": [0, 0.01, 0.035, 0.0449, 0.224, 0.2967, 0.3421, 0.3838, 0.3929, 0.3998], "len": 0.3998 }, { "pts": [[0.2844, -86e-4], [0.2953, -0.0102], [0.3109, 55e-4], [0.3172, 0.0117], [0.3219, 0.0227], [0.3219, 0.0398], [0.3188, 0.043], [0.3125, 0.0461], [0.3047, 0.0414], [0.2984, 0.0195], [0.2984, 39e-4], [0.3031, -0.0336], [0.3156, -0.0461], [0.3234, -0.0492], [0.3406, -0.0492], [0.35, -0.0461], [0.3625, -0.0352], [0.3641, -0.0164], [0.375, 0.0273], [0.3844, 0.0461], [0.4, 0.0617], [0.4109, 0.0602], [0.4281, 0.0445], [0.4422, 0.0398]], "cum": [0, 0.011, 0.0331, 0.042, 0.054, 0.0711, 0.0755, 0.0825, 0.0916, 0.1144, 0.13, 0.1678, 0.1855, 0.1939, 0.2111, 0.221, 0.2376, 0.2564, 0.3015, 0.3225, 0.3446, 0.3556, 0.3788, 0.3937], "len": 0.3937 }, { "pts": [[0.4859, -0.0461], [0.4812, -0.0398], [0.4781, -0.0242], [0.475, 55e-4], [0.475, 0.0508], [0.4781, 0.0602], [0.4797, 0.0852], [0.4812, 0.182], [0.4859, 0.2039], [0.4922, 0.2133]], "cum": [0, 79e-4, 0.0238, 0.0536, 0.0989, 0.1088, 0.1339, 0.2307, 0.2531, 0.2644], "len": 0.2644 }, { "pts": [[0.4797, -0.1227], [0.5188, -0.1227], [0.5297, -0.1148], [0.5469, -0.1102], [0.5859, -0.093], [0.6734, -0.0664], [0.6859, -0.0602], [0.6922, -0.0602], [0.7203, -0.0477], [0.7344, -0.0461], [0.8031, -0.0289], [0.8734, -0.0102], [0.9141, -55e-4], [0.9453, 23e-4], [0.9781, 7e-3], [1, 55e-4]], "cum": [0, 0.0391, 0.0526, 0.0704, 0.113, 0.2044, 0.2184, 0.2247, 0.2555, 0.2696, 0.3405, 0.4132, 0.4542, 0.4863, 0.5195, 0.5414], "len": 0.5414 }, { "pts": [[0.5203, -0.1242], [0.5266, -0.1336], [0.5547, -0.1492], [0.5844, -0.1727], [0.7125, -0.2977], [0.7234, -0.3023], [0.7313, -0.3398]], "cum": [0, 0.0113, 0.0435, 0.0813, 0.2603, 0.2721, 0.3105], "len": 0.3105 }, { "pts": [[0.5344, 0.043], [0.5328, -0.0148], [0.5375, -0.0414]], "cum": [0, 0.0578, 0.0848], "len": 0.0848 }, { "pts": [[0.5349, 0.121], [0.5353, 0.1213], [0.5351, 0.1219], [0.5342, 0.1222], [0.5332, 0.1217], [0.5327, 0.1203], [0.5334, 0.1187], [0.5353, 0.1178], [0.5376, 0.1185], [0.539, 0.1207], [0.5386, 0.1237], [0.5362, 0.1259], [0.5325, 0.126], [0.5295, 0.1235], [0.5287, 0.1194], [0.5308, 0.1154], [0.5354, 0.1137], [0.5403, 0.1153], [0.5431, 0.12], [0.5423, 0.1257], [0.5377, 0.1297]], "cum": [0, 5e-4, 11e-4, 21e-4, 32e-4, 47e-4, 64e-4, 85e-4, 0.0109, 0.0135, 0.0166, 0.0198, 0.0235, 0.0274, 0.0316, 0.0361, 0.041, 0.0462, 0.0517, 0.0574, 0.0635], "len": 0.0635 }, { "pts": [[0.5766, -0.0117], [0.5891, 0.0398], [0.5922, 0.0445], [0.5984, 0.0461], [0.6063, 0.0398], [0.6188, 0.0133], [0.6266, 39e-4], [0.6313, 8e-4], [0.65, 8e-4], [0.6562, 39e-4], [0.6594, 23e-4]], "cum": [0, 0.053, 0.0586, 0.065, 0.0751, 0.1044, 0.1166, 0.1223, 0.141, 0.1479, 0.1515], "len": 0.1515 }, { "pts": [[0.7328, 0.0273], [0.7234, 0.0242], [0.7078, 0.0133], [0.6922, 0.0133], [0.6875, 0.0195], [0.6875, 0.0352], [0.6953, 0.0523], [0.7156, 0.0727], [0.7234, 0.0773], [0.7328, 0.0773], [0.7359, 0.0742], [0.7391, 0.0539], [0.7391, 0.043], [0.7344, 0.0289], [0.7391, 0.0195], [0.7391, -0.0367], [0.725, -0.3008]], "cum": [0, 99e-4, 0.0289, 0.0445, 0.0523, 0.068, 0.0868, 0.1156, 0.1246, 0.134, 0.1384, 0.159, 0.1699, 0.1847, 0.1952, 0.2514, 0.5159], "len": 0.5159 }] };

  // js/signature.js
  var SIG = null;
  async function load(url2 = "assets/data/signature.json") {
    if (SIG_DATA) {
      SIG = SIG_DATA;
      return SIG;
    }
    const r = await fetch(url2);
    SIG = await r.json();
    return SIG;
  }
  var get = () => SIG;
  function draw(ctx3, cx, cy, w, opts = {}) {
    if (!SIG) return;
    const s = w / 2;
    ctx3.save();
    ctx3.lineCap = "round";
    ctx3.lineJoin = "round";
    ctx3.strokeStyle = opts.color || "#9fdcf4";
    ctx3.lineWidth = opts.width || Math.max(1.2, w * 55e-4);
    if (opts.glow) {
      ctx3.shadowColor = opts.glow;
      ctx3.shadowBlur = opts.blur || 14;
    }
    for (const st of SIG.strokes) {
      ctx3.beginPath();
      st.pts.forEach((p2, i) => {
        const x = cx + p2[0] * s, y = cy - p2[1] * s;
        i ? ctx3.lineTo(x, y) : ctx3.moveTo(x, y);
      });
      ctx3.stroke();
    }
    ctx3.restore();
  }
  function drawTo(ctx3, cx, cy, w, u, opts = {}) {
    if (!SIG) return null;
    const s = w / 2, total = SIG.total || SIG.strokes.reduce((a, b) => a + b.len, 0);
    let budget = u * total, head2 = null;
    ctx3.save();
    ctx3.lineCap = "round";
    ctx3.lineJoin = "round";
    ctx3.strokeStyle = opts.color || "#9fdcf4";
    ctx3.lineWidth = opts.width || Math.max(1.2, w * 55e-4);
    if (opts.glow) {
      ctx3.shadowColor = opts.glow;
      ctx3.shadowBlur = opts.blur || 14;
    }
    for (const st of SIG.strokes) {
      if (budget <= 0) break;
      const take = Math.min(budget, st.len);
      budget -= take;
      ctx3.beginPath();
      let placed = false;
      for (let i = 1; i < st.pts.length; i++) {
        const c0 = st.cum[i - 1], c1 = st.cum[i];
        const a = st.pts[i - 1], b = st.pts[i];
        if (!placed) {
          ctx3.moveTo(cx + a[0] * s, cy - a[1] * s);
          placed = true;
        }
        if (c1 <= take) {
          ctx3.lineTo(cx + b[0] * s, cy - b[1] * s);
          head2 = [b[0], b[1]];
        } else {
          const f = (take - c0) / (c1 - c0 || 1);
          const px = a[0] + (b[0] - a[0]) * f, py = a[1] + (b[1] - a[1]) * f;
          ctx3.lineTo(cx + px * s, cy - py * s);
          head2 = [px, py];
          break;
        }
      }
      ctx3.stroke();
    }
    ctx3.restore();
    return head2 ? [cx + head2[0] * s, cy - head2[1] * s] : null;
  }

  // js/sfxdata.js
  var SPARK_DATA = "data:audio/mpeg;base64,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";
  var LOOP_DATA = "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjYwLjE2LjEwMAAAAAAAAAAAAAAA//towAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAACBAAC20AAFBwkNDxEVFxkbHyEjJykrLTEzNTk7PT9CREZKTE5QVFZYXF5gZGZoam5wcnZ4enyAgYOHiYuNkZOVmZudn6Olp6utr7O1t7m9v8DExsjKztDS1tja3ODi5Ojq7O7y9Pb6/P4AAAAATGF2YzYwLjMxAAAAAAAAAAAAAAAAJANAAAAAAAAAttCjZGeTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//toxAAAEEnrORQSgArjvGy3GLADBBpmAAAWYxtAAAGQDnO7/6EI3/OQhCEI2d/9CEIRshG57k6nOc5G+hA+Hw+c+QgfD4uc+hDnOc/k6nO/nOc5///5KnPQhDnOc56nIQjVOJh8AAAAAOBwOEUTAAAAIHA4QlSEI1TnfoQhGOHA4QnQhzn9CB8XPAAADD+ABgAYAGYAAjW+Tudzt5OEolAoAgEA9AiPgJkcmnZHJA5OMIRUNCfGrHSCMYkQgyYGgJTDo6QDyg0NQH4g0yBHYbGp9E3L1XzRoepc4bomxM2ZxGLmXza1IKqEo1J470HuimGqyvLovP9xnT7GJwusfs3hC6NaPH2Xzw+rfG18PRJ6Dmw5Y+18RFVT7u6q+Y739VO3moOU9iCt2zmJOn4W4fdupams+9l1zba93w/4n+9ltPneqg53Wf3DG58AgRD9Kqqpq8qnZnZUVpVQAQBrOSsJww2aoJeB//toxAuAFeIHb9j1gAqiIe4/HsABbztZm5VBqzjTrCVFw6B2KEo1TJpMBPNyUSR2qNh9tHeTwESUCUAk57ZbBoaHDc3e35RNdz3S1rWTbDQ4bm8HjZrW/G6XTTac84ytjHvvhzpa3ud0umpp26YYzf099sZXwemUY4QuJmm06HS6abTt0+99sqr/e9ntrjdcN5/3cTTd26YnndxP/G99sZ8Vff/+2t0+k1C24b3uvdnembibd4W5qgoFAIFFOIQyDrOVOF+UBjHEtH8b6sG4VjScp8egYQ0oin6dMO4JryEtJUDp+YMNHji86bPWqr15xQ8bfO5ozE1Rc316W296NOcifXndrb1etNtr/defpfs7KXvfO229XrTba27r5/XnJ7Ozmw+0SAVQosow4WQn/SSl4HcfdilekM1aGcywi55JQtIuRFgF/wM+3XLRvd8WmWXkQ36a29y83MebmIhoWqjKJJABRTBX//toxAkAE2Sxb/jGAArINS1/HrABQ9sOaEOCaq7zAWXZCj21/LQhD8/LErWjISC4c/GsPFzK1aTxLFCm9/pTsvSx0ZOn7B86f/M7e7lKrVtvt9rwdE+seik/p4AiBSQV4WWUDBgf6NIID/mBhv9BYciMSLLAHgCv9f5/DudYhf+KQZsxGQF1e+Aje7Xj//Kn6yQV/gv4pAlelUhO0O1sVcz0VsPjPKpomgwCAgEAaZWZjVVB4LCpbbv4i0yrp+thsBOamBw4Ng6wqPJGzEDQfRADglGJtJ2kzc+tLR3kd6J0qNSUeZ8IMfTEFmHOHKuk601fN1NsYmi02Xcs9h2GxudLntY/972Mqqdvl/UrIRtiaiovtrr6e+2V9U+HsM3pvc+GIMk53MdQ1zodPNS3ff2xjLvl72MZa7D7mUADoPLyuJHSjZ5otv/1A9b8Ef5tVcrKrMvHq5ilibsnCmEwEU1zTJFAG0OK//toxAuAFJ3lb/iUAArQQOx7EoABiUTCZ7INEJwcgoSgIA0B8FQqKgrCcHA7ATF15JUoVEYgQgaB6xQtK4Ng9E7nAKB45YvQpOsM1aHikIWSUxlGSeL36rF3w0r5xp/SVEKnbwkqv+0f6C8XuWRK3sySZNvjISk57b/lf+GW7/tIm3/hORtxfpb19pE0v/Df8//4xbarVjK+Bxf/gWRp2BGvLTLM0NEszKjIjDggAAABUCFi+mUZEbpJtsUnpiomEEFsi7qA40BJyw/Dmw5BuAsIYBR+QKBCQwdEmlYsXZCRutfYqLFmkmh1QsOl6tD2KOtvVXKLNJEUpBYuj/IHaJNVtsVzIsWaSKiEos4dFmzJf6YoYyVMqKxekFf2KlKLW1kqKkLFlDySz6d4RD7XlzKnWGal1n+7jYbBKC0HLY0cSjMLPHomfaX9V3NO9/zK8qzHYVFcCru5uat6l3hohb4migCAAEHA//toxAiAFIlTZ/jEAAqxp20/GMAB/hWl1DZXEVQPpy6WmLrXVBsDQFkEjg9CyCgoDUoWAgYIIfhwH4sJiyg6D48TB+eRQAMP3BeHYWhg6JJGU5iPFmJNkJSChJq8klWLuj9ojpT8Hv98wzcNrxu6SsUjpCcolaRd7ytRas3w0zykzFVMMXKjf+H/L/3Oi9Nll/lUVqmgHqr/cirAhBuPfWHiv6N/hJ83crZvMvKm4ilabcnEWAgCCSaAJxkSgUbPyTcd6jm/CpCZkwJGHRFODxCJBKZdBNaTebXvznMh+8D5Wc19xhY0uXbV2xmcNnxEX3m/yws1atyzXTDBtzxtcpc+Z1e+5M22tbW3LZaBmBxfK2OH8peZp00pMzWszM2tMzLLF4+xqrGfzt2z8BIhOGbBf/KLf8oUWG2vhsxK7N/4EPzHu18UkFcK4+b8QeLpseDE7LWISDVzVjNzNiGkoAgEAgECgjgi//toxAmAFVHbZfjEAAqMpex/GMABTJ0jh+819EI8eZm4eeKy4fhyEYgByRcu54cBUeUPDntEBYOFxKD72SQSMOutJc+EFDGHXDEsSYK1U279wx7VEZkudAsWyjhU0qoTrdRd3arRKm5PH+U4tZLkiQVRitkdF6cyXpERK3kXnioQdVktKE0VTXqTrD4vcaaJy7ze9s/pGk7zJ9/yrFesEjhRg3fm4K2ZHXPE+Id5l4u7iXZ4VXlqaAIAAAAs7yeqhrEVjQwTXOYxgV+dXGawwW/UwcVHi+nM611Uh2wB8D5b2caeeOWG7JS9dedg0PHZmusuzK7WKvOrWppRfebr8mbTO5O7PXtW2XpemSsWRbvzObXpn7Z/z/axu97Vcsvb/p1ZSWQNNU2dts3h4sFGDEzlRLx4h0gfnf4Pwk34m/YJbmHsUkO1X8ABFD37IX/a/vrN68q9iaZ427lJYKBZTToj9RFFKPUs//toxAwAFgmfa/j0AAqmt62/EoABMJ4rtPL4mo3YR0TPAVBEEYcApD0HQ6Fg8BwRAeDwRilIBtYeFh+LFHC5IciKKgpBqofsH5yCOoqLiomgWco4okdZBhBmYNrGIcLQ7LJLSuxV0++lpU3RN1zRXDSq6yzTEV1N77wl18XLczXOyrHzH+36JFPT3v3FdaxDNFy6q9dMV03eTxU3Dt4R0bayQgJRv/nIo7qL+N9qqqpqmeqmGeX2jkbKYSDZspuwUUJReZNRMFW6lIaQLn1YA4uBBzLhRU8WB0JBcGgeGUpogh0E4cIHwi5CXIxmeGKDkWGkoeIxsltXY5CaalVpOFpFBQ8wVKL5qjx4+7tYa+L1xpAv1DDSBl0sVMIh99vPzXzF/xJQ0Vh7HMLVFXRrTMIi8b3b3x6r6/fDT+uhgvjrgsgh9YLifUQzenKGUfMHn/CK/FJYy3dneHaIiGiDVXKEgUAQAAJk//toxAiAFPoNYfiUAAqatyv/HoAAdoedWdqQ4tInrSpwRBc5hYS26KWIoLA5ADIPikk1BwclDYpzBp6M0HOWEARh8HohfvCX3UytLjCyEHqHIhaU9TvppdxfKqNJQ8PhUWFpFHhITMl98//4i/mZNOVYF3MPOGkDGS0kztZ36tNa4hGvmdVnh0UYpMTasUsIPpKeu3urSoTTv/aPnVev7//VpdD2WGkygkEPVqYmGqDiImHdlscRRKAQDJZSETpvBuFJAWcRdRfZ9rniUmhU8CYgCIDwqKuLnCEDQFAiA6LOHNZg4t8G4fiMxQdTi1S6l2MrBoKGC75IrzMB1cJddOgu7mJY4xCu0Uk3a7r7irpx7QPFxdPQUIPZmVYVVa5avv7+P33exwpoQhZ9u+zTxOS19Q3/z/HVf/5g6jaU94moFASSXHiFpERHiQlcRqMPn/NKZYlmmYWXV4VU0TYbBAICIc1SCRGG//toxAqAFXINXfiUAAqquK2/HoABsE2k+KRGRQbq5EwLwBAFCfBYIgbDyg4hWFhENFhqAvBu8HVDZKB2448XF3DwyZlhq7QykDHRB4oKI+gfn8zSqsM9KMGliguPHHXUuHhmhBkXP1EfYxYlO0r/eRe8XexSnBoKU9TKr8fXrF9XfESlXUxMo6ULvu9ilaIgvfEX88fxK1z/9XukWlRKw91be72ZLmJV+e9yTs/b66vJiWlkap0FgoBAwLJYKn+l2Mpk7ARhpGYnUNYULhSiwZCoC51gKh0DY8XODkkGpzB0DyHkGGrQwmskOQawlmSfs0NNOKiwNhZg6l99LTlf6zlFRxJoqQc9JV07zaNUXFr8wc3wSabKrA9DIqzJer39vaL/8WHtBXKqq3DwVelppT1O99pVfDQ3Gv/EauHINRy40ooftCjhy6ANB8/0QLz786xqkS3y1azMqMyMWqpnddmmgiCAASE5//toxAiAFHjrafjGAAqOMe0/HrABDPEI/M6RlBAiqXwcJ7hyYioR6UOozwsi44HeNloyiMUyehPM3104dPuRnRycO3fMDBRVb06zl6VtWuTSi+83vZ75s0zXZ77bmfS7lOpSi+8ztVtvm1lwNWBvoqhjxGhAfmKpBeZBU6GmpMShoSp/4CD8w8z4IL9RS8FQEHgxUQsaPVK4CH5jxGAg/P16oV6QU7LKaaamqqJdkZWSUpAoAAEAjC4iuT1TJTVDwRY5ViFtsEcAzmjyolgnAIvp712C4MgR/YaNbBIHQHkEIQ4Z73mT7XpVWlzYxQl/s4YfijnFSw8iigbnjX55v+rPsbXRybSSecNTZV51L+ff1s+/+uf/NnoNcqixdJFjJv6//77+KZX93//2eRRY9zVNKCRqsB3vV/r3/uwnxeuP/P5QWGE0JSQ+qVX+bvx6rVVmwNhkIhEIhPLmYuTI2rUxD7ucVVHj//toxA4AFgGhcbj2ABqjJG17EvAB4T+OSyWlibjKJIMDpac0VrLF4eCKzZp2mdcG5bMRzIYMlxWLyV2Dt/fospBRY6dvsrVq617LvpTKX6916/1lKHixRbendra03v9Pp1Ou//y3dynUpR/LW2vbWuWmevN8p9J7b9fZnaUpM0fv/b+Z2zM1zPmc2tfz6TM71/vNPzmAA+OHkMBA9d+6il8Sf8l/973J+meIhnh3aGeDRuggAAEZSkdJIzIiQpEEJhUjFAYQZVsV82FscWVlbWtkQgQ8l8LFo0eNBkfq8v6F2jPdNsWltVxd5E7x5Ezq3x8btXGN6rZXv9v4cdkiVrX51C+N5zrds0rGz6U1e/vfePB9fn4+P869s49s197PKYYB704DWxznSzsiUqGGElBxKIq8Pia9GfCFihUi/3mtZiGAlZgqISndVEEPzPAKdD13hnhVhDRVciNIAAABAQgFpLZCWTpM//toxAsAE6GjadiUAArJuq0zGLABCyoCw8iAOgbVKOJxCAGPGnlsHoKiRVEHilWegxRUGpR0pLzaS1GTBQsLKbCitppLzFbNy9CpRzwUHRJujJI57eDKrZOedVFYa4YpVXZHp7P0inq4iL1lp29WZpqJVWb2KfdESnW0tKSb1mft75v4vUmMChQSxFNO+lIk0P8gyj3bueXoYzvx/+s3+/m8kqVAEAIJoTW2WDkJf35GgJ77ZcO8IJyidIcPQJKZohTyaLg/B7BxTGIGqTrJo7iSSSQN598S+Yc5raXLS4lGJIYXMZx0ffLWw73HSSknKy5sihf3UVw50tb8udbDM6aqJydtz2a712M2MWfMX8Na2HS5zm3TYTs6ko2qPNk4fm2MllU97vtjGt+Wud8JNbUbbakk9h10tp7qiLprpfe8/Yjlg8ueQYhG04y/lMrenOrcyruat4i7OQJhMFFNDSBneoe3pBlc//toxAyAEuifa/j2AAozIO5/ErACZIsIv55MZ+xWIniYypy46CcgFbD6jtieek+C8EJjWtLqzhxYyf1ous0zauZtGX6RrOchma1oua/fadNpAiYfeaoo21E3jDLEEaPMAM5xMlinJU0TfYaUukSYTjyCN/95s2//zBXv65UD5yAJdIETDz3Y42hvZy2b+66UvFla3dWZXhYY4ZIY9XoozEGg0CUsuRyKGEiWTlhxcUBViI0Cgo6pEAP465UNnvuANjeTjaWkplszjDxMNKRRNYsxZL5fmb2DrNyeaJwk69JprcVFPp+xCrth8++vlzo93fX/f080NDj+D6b1pGxYGor/KAgXLhdxQMOtEWEyLf8Plw+AIIA/B8EIiQsqWg0Sibuqqbunmah2+0abSAQKJyuUaI0lzSEfI1lkjqNGkbOiRiCfQk4JAq4kFFo1FixwnEmE6N/axheJKRFSEkFcPRIgZyMtr/Wm//toxCQAEyzZa/iUgApdka1/HpABVlpoGUU5zr+EMzy/nvtVVRt6FZZdBgeOcAM8dzq1gaKjCaAxV/P4HvsB3RFvx/KukJheDejkcjDwD/eft5vBP9//bILAxdUrQsSwdfZ4Aq/a3b2VuVs1dK8K/bYSBIAAITQLIuTPKlwLErbNBfkQwtzGlkKO+YhIx4UgFACRAkw0gc6CKjgWxBEnaaRKpkIIrNIozptJj+ORldLRirRyNGneFSiq7QQWFgkwjzmFjm+8axNG+VSII4PuBTzfPmtjCS8BYx3dDjyxBzKfD/rY+3+yKEjNbJUAv+k1POic6tbmkw2tA5N3qm7////f3f7K0lAAAAAAji5b6opURK48SaKiEQZDFliKYDcXdhYoSB+Il3I9lWhUossKg2DgUN4X1ZmaaVp1d7TxQU9lVWtmuladWp73ezESWFhaVhaJh6WHuoi6njF3uvRKdmaspVWLloe1//toxDUAEvHRabhkAApewqv/HlABiLVYdpimV93dP/d7ryjp4lVZm9pVVS2mNpmmafif0Sj39SCH+PEIu5FQX4yaabqsqqx5iJtXdSl0FgoFpxmMxQTwDkKVOEKQwsTGcKXRDyscVFxYsRMDiQdE2FA4BhwgwuJILGKrHY86EqVSoZUZ1RrK69zSqVWcxyMZpLK605v1VjIdioroiXvdG5qfbcqI5Socypuy3RrWX/X/Xuqs4kpCmGxUwx2kVldXI+yv+1Eqe25k/h0YcwdGILFERQXDykFRKcXV+2+/29+ey0OZjEQSDQMo58rDKTM435NlKf0OBlnUy4hBWAfEUYQCwwYaQU9FmC4u9xJ1vCDhykWIEqrM3WkuDcF4fgKGCg//mVhpuriklDz7MI3vaZ+Ztm6ffqPeZIRDx8p2k1/8QtL1Nv1+k89O+ldXu9om19x0T3c1zXf//33/7792YiPeZSEA+OBo//toxEaAEnm7abj0ABJcuuy/EoABXOhXBWeuou5upuZp4Z3Zk0jIIBAABAAcwRgHcUFKEERSJICM0UBttQUJBsDrLY+AMHAuZpFRw1g5B0IAT/mzBYeHwig2CUODQbCDNfOZM2Y0tI44WGmGi3//0ky9dRA2VYp0JGF///8cunXEcvZrRY4VhziSK//j//qu/v66/2VUPYailDZpmcz/////+6qb40/5n/1Z7UqFiSapFfaIiIl2eEaEVzPlUGAsFAsmcrkUAyDsEyMUgwi4tAxjcgPT/y8OEEBAjUKoQHRihAgVRGpQoQpo020F+4hIYQNhRLYeFz/lLqwTvUSUEN+G58nd5/tbe7VKU6KfaYz32az8Y0Jzk7QQ0pPcxzuS+S/jsrf/OdF7ks9ZJ8/6GnfByXYCuqRcgsVLT5YgjRymEW//+W/zaP/7v//v7dHGEQAAAAAIEJk5BEjV2FScfvIu4ehAKSSU//toxFqAEqDFbfj0gBpcNyw3DIABIQNzCJFbhBUOhLi4NzylQpxzFFmUlQQlZJR000zVtNvZlf65K1wlMqpbLG9+lJ7Vf5PxTKsOyjIuld7r7+7zMlp5KZuVmHtSoulZ7Vmuq/7e0Sn/9eGYmttWa5N1GDbpmdFYa6ILAbGIz/wkLrO/f5HRZTQaL415l2mZl5lYhXdOgoEAAAACKa6tjdM/RQoXPzIRMeFyg9NB0QDBhgxBYG4fA1FzQ/s8WQPRIIQjhR4Qij6orbFRIWwqUrxaUk8rPEND0TDwryPS0zJPl1WoZrLiNZh4mHYxjHHPuMMTpF25maj+ZS2lFiZp1PgelJJ82jJ3xrPEfP+1XE0rPrDXSxJj2+jU9PZ8IEbsOrcG+T4774lFhU5JETE9lnhnmIpmZUZEzcSaDQZDQ443bFImCA7Z1oDAMMJJ46AD8FfMiSNEZfJMvGJddblMRgehcRrMUHQj//toxG4AFGG7Z/iUAAo5tG//GNAC3Hubk8kx5qSMkUUUFvdAuFxBNObmeipJJaPb3LhogmnTT9akklot/5cQQN06dzRBA31qSSWij//9N63NEGNzN0NBBD/+v///M0wccMAYfBDP5UJB3XWqmXeoemhWVDTuEAAABj1IPNJ0xEbHk/hcTCIBs/Ox1SHoMR0EhM3YBQkBsy4WOy41JJMJ7D75dFm7GGxSUHCcSWMiHMW0opNOkTh82RQYeTe9lRGyruOX7EUTQ+kUoUbKw+3sZ/1N3tmWHLt6NOJSZodJRiqsbG1vtlV/L9lc7me9tNmN2bnDU2N7OuUXOmsPPNZs7n5Yzt/PzUVud/xUy75+DzWsXSRY1ysrOhgNIABj9a0PwUqqiJmod4ZYdVsaKAIBAAJpUUCN6xZUnZi0S4AMDSYpLJBeBQqDUlhYPBIGg6IASFjVEgNwqAuH5wtYNakkopgbiAEAgBQG//toxH6AFtHnZdjFgAqbuy1/EoAB6rEFX7arDGi9njDBg6MVpWsq/+VhmccL55BiUfcayrW3/6wza+p+eQYinraD91mm4WJn+GjWf/jlUpJPm0Yzp3eEqO15+I+ev/+VXj/9f2Mcc+eQAA4uUxzY21bG+dvbqpvLuszZjKq4irAwCQAAEC7GGrS6NZ5ikF0GYpEpCDeLiaZuMiEheRHGzFh8CjgtwDZL50lD50zEcSAeguLuasdN0onpIEuJcNIwlaOr9iSHadKJeJIz//80MTIvny6Tkjc9/1f+YoG5kYmDGx1ZqkZf///6ZoXTJNzUyOHzUxMHMjpp//9H9Vm+kikdWikcdkTBNIxMGCpI9MMbinEp1agqL4NIR2eIh4d2eGeF/jrSRQAAIkUZlhQlKCZAGkIlRqQGicIQblVYqUC8SByIZgxDxQQhMDcSEi1qKlFiKDeA/GB4QSWLjiLFShh5kU9PvG0I//toxHkAFIG/Yfj2gAKtQCu/EoAB41zCRhdipQx0inp94qOOJl6gwkYXZpRR46N6ftKTep05l6jtUWH1aHpWe/tNJebS06m5347/+ONVaHpYe1hnpYd4SKen7hEl5vuOlu40lZVnjj/u1aLomGlssSLEqodnhod2hHc3ctjaZBIJBIFo3+hkFvPOpNkjZhXUVStqHtxmCqzyDBcOx4TmokiOYRQkEFQnebR2RxtlAuH0SbddPZhlO7vY0mqKDpXeEinV9Erfj5a5iYVftOp56+nvStK5doGN6rXCxV99/U3LunT9e5n3fLPFRfRvrF5XX3V9p1P9XHEf/zf3/7JQyU9UUgmtV/+9+qvMu8uLqYV1aG4kySAQAAbsOyfqgwFTGKxSC0FzUZfUEqGOMCKJBtJQ2DoG5Afn22jc+rJrUJWcTUeT2w5JcpbEzVmhw4Tzc/LUnOnbE1Tp6NDQ49/7ZpzrR0VIdNU6//toxHqAEsHTdfj0ABrGwmx/HrABZbGxjD595xlcXy1u5zp3dVE9Oi6o3Nz//NG5vaFO/va2HRau2InqHPpvLmxF0yn9wymQx77Yxm7jmadFt6d/+2NzY7rh/sZcz599s/+eThzTHqV4iIl2Z1VTNSKlMFAoAgEFrSyKC0IYQqOcQ9ZyPBa6Lo50fKnUIEkZNaEhWImGiSs4qIQqBnGE25VsSIVGo2avYbDPeRxZdkhWRIoksLn5/aqX/jeKyk/+vS8KyeT86hXlu+NxpZZFcY1JEmMCTgGB0EEf6g0dHcPvBJw0eUAk7/hUAg0wS+UE9LL38RNbftNptdNZLFGkQUCAQEgcDwVCmyYjMtDccDk6KqwAg6A2Jw4IgFwXgIipIOh4H4AAABGHIXDoJQcCAFYLzxUooOqFiSRQTu54LA4DwVD0OSgbCzLEWqoLi54oKGC7qsTq0OyxF0sO6S5kIH4dnjFVYZpW//toxIAAEdT/cfj0gBLMvS23GIADbWI6WJ1iESj3tEq7uGb9uSWZlelibqGfXnXrqKd9Ep3tK1Vm/X/2/ZzDWm1tpRWl6tvPLvvM8XdxRKPDwB2UU0p1vbq8mtiqWJVndxbKQRAARORWKw9kSyoqNDMIWTxfG8JAA5gdiEeAsCnHkEloEghAyOQkR2Qeoig6GAbzZAxC7VrGKLA1EgkC4Q7paUk8qqtbEwL2SVB9z1G6ui1/29VRIx2JGQPNZHr7ionmmb5mkS+FR2WIH0SBnEFbiSLMsm///G/4TQlJJiW8RJF8gS84Zq/8izMLzdta7gmzcyapFWrT9N9/vZ67VYWw0GgyGghDypNqgMH4CZNANkaSgbVsASjTyJsOBUQg6pJMBuH4uHQqaPebQIA8geWHUqSULB1ddP27mGI7qSrQpTfX33PLmIgue7Kqw0fHcdTbxSIsVR4uPFEp1VWtpWJVeN++06m+//toxIiAFD0zZ/jEAApStS43EoAC45sUIQsXdKqkRm5r/41Xv6j++46m56LfFEDKAuBAQB/wVER4rqWoqomqmZp3l5RyIkkggAEkgRFKaC5poVYPLIBKTDIkcHJpYegrFw6KFoKE8AHB8kcHNB6HIiCPYoKDpRmsVaUVpDs+xcXPU0raefjv6MRD37nnZrJ1jj1jiYcUFDA/d+b2+VnaLWdvq45ntkRHe69EQ9Y2459u56ia/+P5q46LtK6ind0T9Kb5X2i5+K/9Yu56idY2ma/zzwwA/MPII55ZpRnVmRVNFNIkymCgUAwHQWCsSM9inljyvb7TrnAb3ofAqHiglQFRIeoKKLQcapIOi6nouSosDYGw0PRw9OpPmmS5iSSihZSZurSaeVSYYYxsQNFmD5RUnfqN6+XVP/VmfYYqkw0dp/c2l/U7fMrVTF4ylJhrpW1XZnv6inq+067/////5G1EwTAwWike//toxJaAE9n3Y/iUAApbti6/HoAD2K43AnM/9i6yzMmcvNqceJaIg6EIYLAQTPwDlkqaWyalNGBgfEReVzgmDyAsCWbNQNiYHkP1v3NyWXB5D9J1jLarKh4kkksJ3/70oqZJSZoapG5sa///9REdKUeNUVjxKTZ///1/9y2mw9x1SnIydcl9f//v4viJa2HXT2Nh7pY1JWTroe3/////+KbXbv/4hzWW6WNdNtdFtmrj/umMu+vr7u6+a/VhzkWncV2+/3/+u1tkrbJZKBRSfIhscj8VCLcD7gEyZTrZEoeJcl8UYDohqgVrI4nAb5flMqnNXMJ5l/Q4XA/Yb1dQNPoKKSpc0NPNDKPr4gxXsSOroLY5IZKsJ9zUa4g0YsbYYM2t/63jMSlY+dxLRL29s/P+Pqtr1ru2aTR/HgaiSx72iY8FRbux2n+TOHoxYkxHuQi1+rlMZjm2LOhpSixJtIMDSyTU9XN4//toxKUAFHIJZfjFgALRIK33HvAD2tT3JeslzIltlUrZvW7+fv+fP1aGQxFEIhEtJoufFDCYTYHkE4iASHy6OAAMA4hB8eQeCgAALSKolGBwCgPA5EIWa6fPLPBYHhiiqqKh68JFOLi59S5iRlEquyv3FJWe9olPe3/yzRffaV9/olO9mJvyt/z8rzfcdTc37v/UU72iU9+yrXF//xbJ09+kV0/aV+iU7uKGUnf7vijfNxNyFfYQGpH63xX89zMm6mXi2eVV3KUCEAQCQS3CBKc9VawHufDg8cUqbpCY0CNQQREUoIA4BUUERbGmi4jjxYaC2yni0rJNFsOnpi7pvp3dpFSRwhQ0XCxf///iw0lSjhYWEsd8x+3X3P/cqpQtF6rC/zF8x3z/P1X/Klcz9e8SsrcXzHczW3rz3Fdv//VzLMWwOi6g7gqRWApVJUUaGsIdAw3V2+2m2292trkSZTBQCBdLS4aB//toxKKAE0m3ebiUABpftOz/HoAAQEZcWllIrMK1PX01hhwLQ/EAUsWCKBHEA0VHA8KhyDUwgaC8YxAqUcdasNtGR8mVi5WWKKlae7IRJ/ru+vm4iVW5tIq6f1rn41hv7qVYoObYwzUmWxfBokEgaawy4akgx5TUup+JREFQCyWEoSovfD9XhU6Wi6rXmImYmWmZiJg9U20wQAAAIIGiORk1oNuNq6iFEXtNYPgvPbJDg8GgcB1hy5SiYwOwb0sFCxIyTiSH3DwPByqrM20usRYfi9ihiO8w2SKsV6s3Q2r47RDDzx7KqwzT7TSw7LHfpVHvaJU+/8XCqrM06fN1EWs0zWs6VTzaJTvfWq7NrzSxDcqtbPUo7aK3zH//NoiO/Fd/+zFSK/5ZqgqKqpqXmomZeHR2cwTBYBAAAPQvTkRcBc6L56flh1ccL6GRBD4FBh7gRcRA7EYR4DooT56IaSaHQqSYeknu//toxLKAETEBb7jEABJ9v2y/EoABxkMszAsNFCSi4p1tGTv/rtY7mamn7Sql7jmaj54lFibWHhIV1tGHOvx3P//6zVxNTHB6Wk0+8UknvCa/Eczx3PUT8T8QyzVt1CvLJaPR4ZOANLEt1YouVhUaIwKw8VUyozKqO6pCIiFGWi0EQiIjEVKx2SBBY9XVgX2zCeHYYCBRV4B8FYBSWKMIXFxc8WUVV5tAaCiC4u/rDFWnU3HkIguLqqwzLzaNT09h4KGO+7vyqwxUqvcV9/olO9olf33/6rDN9dTz11deiU73FddPdzP/xKzxf7/Gnf/9eKCgiC590lUhgdluKGJrReHRYR3Om+WYzn2Y79Wpq4iruYmGiJmXuMpggAEFEKpUG4qifqqIgo6DhJxlOlqH4xg3NYsAcXEIeeauH4eAoEGg5DkthowKALh+PWioOJ+p5PmwWBwHkrGzR3xtyguLnh4KGC56zTQ3//toxMeAE2W1Z/jEAAJiN+5/GIADz3c/E9RZiV0gu7zxFrKtx/evfMVcyiI7uibv+s00WuvxHzxHr20/czV+nu7mIjLgAGwi+uajv/9LO6RBXVC1XboMPHpBB+Hv/++t1ulrcSRKJJBIK4DRcTDJGJiS8tpVB3i4n+5ymkPZD35+HwSIWHRYcuDguCYfA8HowOgXHi4dBQRRUQeRUOYFiop6fZLthNK10SMKuKrebqbuOpZaUYzSqxcdTf1/dxVTGyfEqsMVPV99ppLz/9V3f6kwDQ0JB2cK96kE2jd5hNssFQVLHgD+ZSxz0fwotfttr9/95Y7ZGWk0UREWMR9tUj1RJWKhEdgvjJO3OLVXLkfAsErKuoh1HgS8ucGR89bYjlv5vCgxYLE1qxQn8vlwQxkIWQtbZn0LVn14r5unmYWp481e/jw/WtrWzW9nsmo1YNN3iUo/f7iU1XFt29qvXsKWBWSDea0K//toxNcAFD2RZfj0AApGp+23HoAC80X7973iPIj9/PExa1a13v/2zi+64pvOfu2cV+aa3/v+lNXvulP8+1v////85jxYVtzPYF4VYAECq2Zf6QAD0hg//lKgo3+fUv2b2XWXVXEUzzJkmUiUCgmX4biYQo3ENE3OBzZGJxVaMUDgzPS0OkTQpJhmaiPi7S2TirRGYMswsJjiItHKhf69I5n13mmYo1zaxiF++OMVz61602rbZrme/D7kETdY3NrXJtvzPVy9q51q2cvV+kazev7/r43o7WqFoaUtAhGnkIh8Ai+hLMUS/Y5KSTVMXBrMhEjaQYGtLa/G3f/36/8YZWxXSaYk7tvcnO6J1WV1zrRQLBIDIbFe9FhcTvVbI34eSvIjmdqMVQY3C2ZkRZjMvDnivmR0u3U5cLhoTqiJFFmpkXL5uhTUkZGJiXV1GyCRcLhoT5fcuIGSS1JGxiXft0EGL5mmXDRj//toxOaAGG23d7j3gBqaIK3/HsABFSSWpFFGvf7oMbu5cLiBfTppJPo1opJGX612t6CDJpv0EKaboo0l6SK0UnV9//8uIMnp5oaIx7sPBSQV98ePixEQ7xERERDKqRNkgEAAAgWZmT4IDGBmJ623qGifucNxPGw0RJJ0hAHoZHCeO9RCDcrJw7R6eaGhw+xi0m0HkUTh43PrmhoxdjZmI0kzhqofPFL32xlPu39V3caFHkZpyVrfFV9zdcR7/ruzWD7pQabKvOpOZ732xjHzs21Nuj//f1bUWWlJxqSbkVKPNYx73nGb3vYxh9919xXxxfdf/y1yT6RhlRBXG3gGY8R3+Zd6iLeIVoRXJMnCmVCWCylKFc+PyA5GEj0PUCWWgQIKlR6YEJEIFR4gEmg2FQAphBJTCxAgHBl5tJiVSAVEg1BTaUkvKNDEwzSaKlNOkU9PKx/GyqSzFKq9xSU82i9N88qUcUoq//toxNsAFF21cfj4AAq4Ouw/ErABKwFRSSTU5YgjN59+f433d+zPjd+5vX6P1/97/N11hRUFhBJPIr0s6efbmd//Tfv/LfNN1E3U3FU81E1dnW5GwgUwgiKg3RKii095CsdTbvuaHANLuGag/Ld2UaRZ4iChgdEioKWlFh3e+uDhYk0V1juZquj3cUMhmlVhm+pRo6o8XcUIQXPu+Y9eBaf5j51jRKd7666f5hm1XZpvn/5+P+fTp5tEp3tEpVhvX+f5qeYpp+O/q//xceAIz6NMB6R2RVDCKgsI4FW+yrvcy5t4uJi3OxNpIkJKLBM0XkYt6GRGBnSkRZEDQ6q0W0PInpMEkdDFzSXsGQDoEuiYSy8lQXmo+B5IgezdQ4o03prrdROJJIOjuIFtstk09ir3sYg+zVJI8alJzfFMl82yX1EXO2zxs84SUD5sicinttls6fdzfE3cQx73tSTs1Ug8jKxskymS//toxNwAEuT5efj0ABpVuW1/EoAB+euntv62cX3X3//Ftay3PpsPdLGumnxcfNzsir77+OXwxj5tlVL39V7jVSjycnUoXajTkrBRPk2vt9vt1lqkURRCIRAKjUWpKBAkKL2kjBBlDSYjFjBYcLkguBgWJFXFxgcA4RQqzFGEKeIcnBwKGKKmwc3aWmLu4oYguf1UNMNT28JFOhlM+5rRysM2qv3Fp1N/T+ibvKd3///8VHf110lO7okXd1V9//+sbTrDNPcVXfCRXV99pFPLmICYPhgBvF2jv6Tg14gIDwIaQru6h7u5qZmZqfvXEkggAShAH8SB0NwDjLCcujeCQwD4kj6RoF0ScLPl6o2RFHcm3N4yNSgZ2Mfo3SsFip4VHOI4uEZXH8q1ScrIqmeHHQxWOEakWLLCjwmJ/M9gTvn79/t5E1//n+m8X1EewI76Wj2R/73u8iajx751j7vbXrjEC2aVxe2a//toxO8AGC4Va/j1gApZNq23EoACVtezymt7977iQKP/nPxjcuf8YvbNc0rbPrj2zetMWzfdKazv/+mMXvvOt4tXMW28QcZ1jFsbrusmrZ38W3Bzr/df/R5SPdYA0jHgAGPu8m91du5iKh416jTZBARCioS9KM00C5w0UnxUq9znxy5rR4gBILhcplNdzjQ0HYNSg6BsYw4+B5h6ipLNNPFpRY8wGhIX9pVYZHeYqKPgcYNs8hlWv/Z6vvqp0MLsenJ/qsM0qsR/////FW8Uk3cIn+sM00sN///////NnggA0nHKdaKCUJA0Jf/8LAAThYECYWRV3Km6zMqru4iK28ucBQTDgeBmYlSp8eskSWoxaSjNhk9GMOc4ibF4OECahsGRatJaI5wuwsRLE2QUXUi8bEqOId5sMKNSaa2QVRRpOgSxNOlEkh+LXTWghTfX6zUuoHx7GZcLpOL9C1NJVH/zYxMGSOua//toxOyAGmn9YfjHgApOsGy/HoAAnFGyK91fV//542MkzxdQPmRmaF04ZmxiYe1/11f//ol4zcunFF4xWal4ydExZMOX1561q9Te///fb3auQkkgEEBASQQaok6gmUBonRk6WISw8oPzBjmChZCHmhyKHi5QeFupRwdB2KJJ8sZ2urEjAbiwOg5FPNp1tSTbwpQ3FRkCzraXXT9JMvEU+TI5inolB910/cdd3ae/191QsWYSQe0oKlFjIpJuYSO/qPm7ikm3iqm3jFSqFhsmjDxGJGklCzE/9PVpdSrxddek9x1////5JljBccSQey41Dx6gMNWGdmeGZ0VlZVW1xptNBEJFY4NHSyGleOFUEaiL+QW1aFwy7PLgcBAzQkgvBuLDVPNEc8OBQ2LKOQ4xwbg3FwaBwKMgsqg1p+0ksX6iR1QzSqw39xpNH7pyeL7TSxfC93FVLz0goguW5FJf/z8euzf////X//toxOKAFNXBa/jGgAqqwqu3EoAB9/MVUzKeq+0qvx///////8vKIh7g4AAfNCh9Ya9oii199FCNLbLLY7ZnI22GikCQiTnImyvZVIlFGeDpoVlom2FsOiFWyiPzONUwWhCJZuDQBiVaqJTi2Bs8A+I77E3O2Ei5axUyLqSI/AYIBMYu2241RGyiOi8vRFVIvbusWUXr2dcXS8tcdXPrmVi1M361p9Ysp/8f3fjtWKG35XtyzipatUKi8rUHLB+uWUovXvnixx+96TMz1P+890/89CxVpuWWqPM6601G7TtvN7+4scX3usWdF9/rO/bN1vMpu3zGaRroaMwa8zBrUM1Yz9M176xY4vv/dLlHD+/rBCrKqHvHnYqUhVaKtIAoIAgFOgrgkOTur3MBUSCU1p/7ZILCxGAXIDoOQ5RqQCBYqULA2dT6sTkDhoqDUo4WuOnsRJOHkGqtLZLCzpSS/FTdxVO0qsMV//toxOMAEtGvcfmEABNmwyx3HsADKisRVzp1PadP3GUxRNQuS0HL3UV0/adU/aXTy9XSkg0DIKkT2TSwaByAqH0Pseh49BsUaEgaEp0Rdh80QehDe/ehoiIiIdohVckVykoAAAAEjsPI4uI2zT0SoZB6LasSAXCgeDyhBGhDTvCbFDxW0TbUVEERA+DoTh7PbywwWOkOTSTDg6PNDkiop3uk2+WWh5TjhUg8WGmT//xzFtKzEMKkHiw0wVGHiw0wVeekh7vr5/54ZVWIcWkxRjlEoKwew1P7tIq3tEp32aVra/652YkYeLDUFRh5Q1DRjlOAyqG/6xAfgAF+oSlIqFWZl5mJiIl2hXZOIoEgEABEkG5Qo62XJSNAyTAhiAmGQsJGFmgyCYlBPW7KOA0oaDESUlwNB+xKROR62oxusxii6IrZKWQJo11iRRnZRyMtlTStsrVJu9hJzcW4fL/r1d3cZVJOcZNM//toxNQAEtk9a/jEAAKmuCz/EoABTjOnqXk/Odev7hVe7hK7ilCSs4resYmnEEU8hF9Dd6O3o8rjYrjYq3DkIpwikut5f5qCt5bV7/+lQkBh0gNqew6xCwyOqupup5KlQlEEhIKLaTaoeBsKj3SNgQiAbJwp2Vrr7kQ5LVxlP0LAT4fmSUxEmaX9TMn7yXLW2tfzsm8FavT3Qz9pms2n6W7evvrObXn7jCwqCwrY7sznJvAAjpBDRSs3k1/////wMD0jk6QRl/8v//+vf///h4YAB6QADwz/6K3ihTFQXhzK26ubmaqKl4dncrKIBAACBEwC+UBuI8essSGHk5EuQ5SSIadi5Zh+XqRCAQDQinpoU/EFQI5LJxsZA1KjgjDSrBoYHkVbXs75JKThOKbd7ffab92sYr7sHLofW0pRe/dYsvDRpidh7GOah9axVpvr3/pmZlq193KNRzelbMsVabszRbBdde/0//toxN0AFN1BbfiUgAovGG8/EsADpz9/pSb0/rs37M+t+zPmFxlh9dDRliNq/M9H/zMzk3v7lOve7bkET0L/ORa+9aJyq6/6uvzPWa+rMVrPM1dtltcpz4fAz+tIYH3lxVTVxVVMs8u6SpJBAEgqThSHJ2Oh8yx5gZrTEuKDgmLIiZgwhJv4kZuxOYlGKFhHbYRBg6dqUoxim3W222wZYRr+Ur9fso9rG3TaSZYbaRJXUpRirUpbUPD+oZ/spVV9YFNX8ZiM9I70jOm6DK0BArNQdf/5ppzz/Hz6r0A5upFv0iTTVNV33+h/6vzDdGvGl2rL2lXordu4yJmYp3pT2WaRKQJSig2JAMEJCKHGFEKIVCGEBUTWShsVqoREcEzYYFGS0KgKDAFMI0c7qSyJtkhQPggzKhGMalIiRuIUBsVLznqCEEYaCwrYEg6IDDwBGeAMfGaxBqgaMSBowe/1NjyAV0G5jyrK//toxO0AGhX7Yfj2AApdnW0/GJAB9WVyW4mY8ARvQbe12jzrfQNJZXJIrsffwAi/8PHxBBdsFoKocglTcVTVERLxCM5Kr4IAAAGJMjYOJYRlhf7ZP1sSQWTNjc4SAdHEDVAmHw+lIOT8ww3NzQkD0gCcPMS98MWPqm5xiJ02JROG1k2+GHJZcviELRWNklzVE7a7Kp7j7Jm6dVNtjjyh9qKySS7Tj9xoqdexdkti5vhk0/nRWNkj51FZyj2qn2Op77Y5p+bYz+bZbJtd2yof9KQu1FZzrbNJRc2ymTdsmn/9XF/UuPur7uK//r0Wuc5GadB5sU4rNf59fntN1qYzEGgiEQkWhG0SsJh0faQk4jmBZCrqAwOPXNKFANxHjSE+9blsKBIMFTrJJz6S+/dhzsldtVvXn6dWefbuoplrdWuW7fvnTvPv+sWML33wkV9WRdaQNSAAGPQfp+rHAuRUYGlltPeEaLhh//toxOKAEyydc/iUgArpQWz7GLABgekEAtBxP///0ek0f+vD0ggPSCO//8+5KFFJQgUlCLOvxj3untru6y8usl2VVlaTIAAICRaWTc8JggmY6HjJQBFg+HElD4rEKX0CEfBVuUKV8xP7qxWRXuGKI9gP2RRqNzhXYZYrczMLBBVze8eUfx943mWslN+smN1l1TWdU0/zLemKRt517Y3qtN2zTdKUf3vEpT/4zXOsaz81xm1ce2fW2I990pS990pq+raz86hYvX4t953WurW3rON2z62vf/6+f///8+tfa1ce28arX7t9f2gwNWlw9kyrRSgqoBmPAEYeAI90KrvsvXmXZ3eHZ0oSQCAQCQWFW+AynmGaPqJeCPhXK7Kvit6rMXt0hkNIETBIJEydImANbifmx84OXFWUkWw7p6xbzdOiqhSRIoxnXhezrL3azLjKUox/3wq9vwq56+CyvJ9uylcSqSQNWSTA//toxOIAErjDdbiWABsJu21/GPABORlPeARUFyKgsIrFLJJj0mj2u/ymPQRbdCKobPBbf/6u/V+a2//Mj89txkeJmIlnlnZnZESpUAAAAGoXPmfHoEwHPtHxiOIodsYjipAlNWjoLTMAtV7RKZMR6Lg7CDaZotaXHSGWSsmLRV2f6crVlppclUnUCCcnKmc+d75rVnFy6rrR1GthcXNLltZv9emdmtrLtqzZpczFZp92sTzXss0pl7/Sk3/6bVm1l21rlrbE1BHWtbNWh11qXmaddv3Kde96Oddv61ta0zXMts7MzrMGPQxrc5qH6sdbbVyjjl7+5SjdYBt6n2/zoroVzd3/////bXa2QRxttttxs8K/098/HN1DU1LwDD06lkPgFXHtobkGO5GfiwcAUBBAbNnGyfzCZgTDQpL5al2Sf/yWkTDQxH9Mq/i2zXdf1Zxip8+gcYmulu/dG3//nz6FUb3ZpnHs//toxN8AEuDbbfj0gAsKu6y7GMABPNbEXP8TDf+rv7rzknXsXp61sc19Qcr+fr/c7/+d383/8KUfTcchM+bxRMm7ZK2RPCWv2SNuozDLDtDLDLDJCFoszSWQUCgdIslY22wsLjM+qwKpKQoV35fHdk5bXMB4KCS0dOQOlACY5kdqrLN9+izmi2rbtZqq05t16/SkrDtphRa1rVqtsunr98/1I8+jdKOxWmvTltmv99P7e+m/POTC37FOhsEpYKhP9LRgDSEAGTDBk8CpYKgqePLd+kuHwwZPhA5dj6SQwOiUJWk1u4uamZh2mIhou8jSRAABAYDyiIRZjKY3EurkswbX1ydjhGrq0rfqRCLwhg2FK/lCdaV8PBBLxbYfXq7MVcT+ExXNQlEgXHhIgJYlr30LlkNzOArKyylLIlJh2pSi9f6xylIb3zGOlb5imofJ2jlij7c0YcXv32ezq9Pxz0TLV2mawuRt//toxNuAE23HgbjFgBJcoK5/HsACfVnp681pnfM037z3T//3dM7LrWPM3dgp7f1otx/5o5N7/TOvecp35NL/elKbN8ynTMy9vMuWgjZ1lrrb8NK574/gmUxWdXUMzs8s0KzmjEmLpDIRCARExkuCL8RmVMdFmSiyYguWIyJWIUg2IAmlBcH4kh9Pqrve0gSUSg/MdT6Y54fR9HknEoMptjqfyynWiiiTigw0G2x1Pa///64rdb2nWOY9r2OOP+TBsFREFQVKgQGAdeBAL+oVWRPCWRa9CAIaqv/9QlcDQaO4aAgcC4EQfDkLqruqvZrbmpmoeaO3k2CwUUVwDzEQGx2CAdRYlPBGMhNVrCsNR5CGxd5emdghVMdlhMRutZkm96676r17I7etrKxf//4fPoL17CngwZnzE7//x97w+fVq9kfVbYkaFuKwxI26U1vO6UxbPg4tb1rCvWtLWvqtLQv/rHvn0pq9//toxOuAGV31Y/j2AAo5Gu6/HrACt2+q4//zi+q63bOoP3a9a63fdMe+90xrd86x////n2+a6xa0a80HE8LcWDi0K7ImnM3X+6RQPat00KBTeArspddtrtNpbZG0kiiSQSLNjxyUCsjtyCYCbKJ8n1ZqVsMC6DRqhqTkCYoOw3NkXte65N8PAEIhDO2QcfbzSjhufNj50krG3FVL5i42Pe/hyKJ1Jh6Pv/q6OTb9kRztUpz3Sybq+fi2XP/HU9xTGxbn0iAg6E7CtU+iB0MbUhoSLNCQSHEmmo7Kb7RwANn0fUPJMCr2Cp5dmHqGqFmVlzdi1VhrDYaDZOIQuEZMyREODCfK27aK6TI/Td28DKEGQATSIvAUAAOlpzevrDsSyeyuXNUt1zAwPCeZlvt28916fTVixw/XvuUz/3a5brz9J6+P79frRZEchhBILv3b8PDAAPDBAcFf/cs3b93+jHO54eQRh5Py//toxOgAF4m7Y/jHgApVpaz3HrACoLwr3+/b///8AA7gHfz5gPy3SSKApMKiX9HuzO/du7upi6qpmoiYf6NhIEAgIF2qFeoi8DkVKfOBW1a3qkYj1Leq6o4TSgkE8tnq46V6PYA6g1Ph+Hkex8Bk+DQDih5ksnq4nFZGenJgbvmZ+JANB8yF1nHrauhWMwPnTK9fdYsiXr3WZtb2dxpirV7Msc1DdYscP1754scz67zWTWGcz6062/XJtvr73cpR+/9M/MLNcz2d62ft5armW3ezP3a2t9aTt/pTr39ZSj95g1n6Zl9v2Uvt+zN3etb9r1s+tetn7WfcEB7ZfBUPAEY926epZYVnQlM1TCQAAABErrgQcjMTpocFTB8Stfxk0AnnTgBFALGdmoGNIgqdlIGvh1EiUmkWfbbG2Zmmo6Zntj7cRF73+VVb//naqZOPFtsd/675//M7Vc01jiXVcJRvuKy5bf////toxOiAE5DDefj2ABs5Pqz/HsAB//+bNUSeZ///8vcVl2yom7aIP3///1vf4za/qvJfpnmfrY//6zM7sijlAxZiOa3XZmZ3iHd2dVZZZIyGUikUlImlcW+yNOJmUTkopeewjpYiekpVpMkkyqtRMaubWJHw2KGp3jCvOcTc8R+5QoD67gwxHJ/X+BmJmfdJm5zewYr6Eqr7+sa/pnd9TUvn1x7Z3mn////88POaXjR9IZTkKKUnbPaBHcAXHMefolleoGjTGpM3sKngCo9/qa5abZRuagrjaGch8hn8mZ/s//ZtyRZXxbBMypeLqbu7unaWdtZJE0kSQkKNd9fd2OIr3kVTDgcE4fynDoNnmiUIJPE8o7VkSAlGgSDIsgfWQJjleVk5YHEXiISiyB+iHr7TK2kZ1GenJuTC8gCWYqqMzGulyFlSdNHSVs9PEyI/ZePEyJe9e0zzXP/By5tpmi2B+F4wXRL2//toxNyAErHPadjDAAqXnS0/HvAD3jy1V7d3aRfrcVKbe66/M0s1HDtYOs5kL8NqU1/c6m36mZDu5bGc3/tNttWlc+29XrZ9dpyzfux1NyNju2n0ntt73dTJvMIEIz+LIVpAdja2N6XWaP1+LNRFEEgkEAkLiBNomBQMoEJrTg+eSW6M4Bjg1UeCgIAuKiwdI1A0EIBASCEoqHLqehYfnigLDGYpSSbR6eHdzEoXPiGnX7Tp+0tEp3tEpv//+n3TMe3d0RD3lK7mUi2pVZipSIJ2kEc/+cRjwBGHgspxOi030IJyyAeWQTgAGHgAGeYr/662myZBoQLGoqQTlgCcsgn5h4hYiHeGh3eIj6FAQCAJKIQNtSIQS4B9iJmgcUYEeGYbi+plETTbBNXuhWVzBsCiE7IGxIJmrglLO1caWAbJY7pXDI6OxBmZ2ZMHPvTpaMkzxyVVMzMzMze77lObbaTRnLLp01GS//toxOgAGd3jbfj2AApsI+33EoADZmZmdts/M9Mze/+6maVEmGJ4yXHLM5s7M5vznUp15vTuvM1lcuPkPeOkx9CcmJep6W25Obj+bA7nzDT5ykvv3cYlfd9ZShVJp1iZDWqYGOKsnqEmXEnuszlpbUbN1SdRs6ZJ4vm787WvtOOrzu54YcT23zxyJXlHZaqYaTdyPl4GgQAgAGKGJGFzORMTd8sCUYJg2ZiDYvHAdJFCgLCxZRUVebR30YoOlJFYp5tBSS3lLZqmeo3mEiUqZ0hF7aVWOHmESbeKmbiIdXj75VmZVWEm3ike3SqHpQ57HpRk2ftMr//8wzP2nT9/T9pMDkmz2qpt+k7lVhm1X///9XpkerSK5uv/3hDN+kDz/mV4dnZmdVZEU0VuJMlAIBENSmkWEKiCXIvuVCoYWSUlBCw0J1ECTtmjov2EGu+udWoTpkX/7OPVy46eMSoYjkX93KZmsrVy//toxNyAG3IdWfj2AAJcP6w/EoAB5545YWrl5kYzv0mdma1tb9rjLTbTKxbj893TMz89OTO1z7NbzIZBsFQEe/QLFiQSAxMNAsImhIs0W/yp0GhKEgaEoSLFmhIFgeEgSAxJv/xKGhFOg0SOq3Nqsm6upmYeGkrRRJIBCRKwCCQNzgDpm4W3CVVBLCHGhPh0IrDR0+I5dMmUSGtOURMLhiO65UdLWmlyVtpYxCf9W0+zLLC2B9uBxyF99JPZn7vW3t602icb99jom7Zk7s2+a79crn2mr9JivkdNdfAnL60dfrHJ7m8A1QJHOQRzkML/ziv8WxtTn3m6gcsARyyl0mj4X5cmVf7v/6uH6oK9h3iGhmZWVVRFciTZDIZCQVQk+C41SZDj2N+ErNGohj5XTOwDg+SKyUeCwFAqUDbQ8wG4Nw/HyqZxhYoKGC4uPx6tRU2jZ6JQu7ihHrwyrMVU90YLi54oKULi//toxMyAE7jzb/j2ABKFICz/GMAB588NKrDN///kCiFu6Rq73KrDNKrDNP////6e9umh72YAAsIqhyKguR3////+fgAB6QQHpBB/QUKOFbOFZbba3a7bTa1sgEAAAAgTMUPxSMSLSMPSxqZGTpLEkCg97EIQgiQXFzREc8HRBCEFR4QCgoegoIjuUcSSOFhcOzw8FBz1CXL1FqtMU7u5iUe+k9x1OpNWU6koPcUSndxRKuOu7+vsp6FTB5TjiSLKPdxQUR3sUFKPr37+vuPfccSg8WccSQPKkcTFvYoYYe9mGI72iVaVUxaaTd/V9xixdCtDynHCucc9EoPKnFy3SKPPv8XLfmY9mIl3l3hmZVZEzkQhEIhESNkZyeFscWLBmohOK5mN1PoaWN82igdBOLOodEiKHgkFYhhwwWBsLjThSdYDIemowNmo9R4ptOqStRDSa1Oto1f/+bU6qv2/dRTrdf//5ar2//toxNaAEt1Xc/j0ABrXwit3EoABt0ozG3FPVo1P2l////9KMYtlpjv5Znp1tIp5tOn+v/////4uGaWKqDtHARtCOcgDzkBdTG+fy6t6qruaubmKm/PJNEkAFBhIfgfPQYqozocDI5OUSgQDkcWpDvHWVFybikngSACGyrVGEorIwE4E4nVdRMtqlOVHYOw4O8nm8XctO22N07R2EhY+95YziNrYiN022Gw/v5e80NKc1rYc5tNviY3dfw9+xlPfbGd/f/Xuc2ef/n/rqP7/p79jGPfbW7ne345/qLb06Ln43TdRxsiv+/ZT00iA/g2KSCsSSphphph5lomHZ7c1CAAQAAGQ7XlCBWJGD4uUHJVCPzFYfAXD0Zj4bLj4agjmQ6CBG0xH0eAmCAsqUncqzxiVlwIg7iYbtNUk4dZ1RY2TeUEwkGrkh2TSW69zphsXEvLH6B0ntXp0X7p////2Jve7k+xdkput//toxNmAEtG3efj0ABqfvKy/GLABv+1vXMXU8dzzGocUrXNFjnCix9Z9Nj+dLiGOvdxx03uLnqN0sk/PtP0v77OX6Rgr38ca3O7zGDKcyx96oh3h5ZYZZdHY+1mcjEGg4YKIayTPmRYqumdC6nnGrBtQFBrCwyQWBGBYKglAFdxh4NBQRAEQ6AWBVSPYJqLh4KB5qsM1x0+H4/DxjBOZMisM0rf9/WWLwxkmZdbNqsXczx1c3WlO+ibvZk0sW0yvcT////pTvaJTvaQjvcrHHrffzfH/////om72ibvaJX/8WSBDxIuTeLnfeir2//qz/fx1bYAAABWJfDqdPoXRCoRXn44t1sqjSz3hBA+dlMuqAcLIAw7hQDQvJlyGnOkpwoM20dfaalla02uhcYp19+sZkjdPTV9axGdNunLlKU2ZpOx9PWu/MDzUa2rqaA+SzOzk5Myx8LfNQWZrebXWoXHSf1rC1ptd//toxOOAFgm/X/jFgApoOe8/HoACTp++903+eytbx/zDl270gcvdmI5o8mfdZdaaeW6tTT8zPTOZ0/NKUh7Kay31rfXbf85MzRdDZaw61ezKxmB9q/V773u5Tr3u4IHjmiYeGmmeGZ2RvLnI3G0w4Hp9PUPUZWhpJRY2jH8VhIKrx5okgEE0A9oDuUQo4mog9FcuJPbJmYgFARyaXk0NatjqfH1ykfYVkkrRRnqJu4umRzNfTphzZjqe2Pq2R8//2pNb3OPXK3FPmKqe2TXf//P8O+XOdy2I+ZfHT52RNviqn//////4qPVYcVBeFQUYGtWLyEd1WIV4iaaIR4VoURRBAAABI7aEKJhplUyqs0ekHVyYBih4UEAQxUmVHB2DcVaxilSPFBQxpgWaUWGd7r+Vhma6lWhr+XdElVhip56imlpind0Sr+v+GlVWLaan4uZ54Snd0RD4YqVWI/aVjadYmLiVmoe6//toxOeAGOoHV5j2AApUti9/HrID/SndzEp3tV2bVe2/6WIn44mJ///0j0py3MRGHgDvhBILQd/aikWJm4nKeXqaV4f+duQpkoFF8WxkTbxQGsQhLSFiYBSyTMCyrpRqD4cOJC1MtH9z00DUqQNjhucXNMd47jEhDU8cdRucTsnlBYa0bJFxJRiom5hk2+KZonUmEoxzVvP/sq+/Z09zGue56yLLie2dbPuXxRybP3TKvdbWtUakmlAVrHyU7sjz3IRGiNLvlGoWMrkgadysqPZBHchPflz8N8N/eUQk0lFaK9W23TaWvVWqsxBsMggIBWBM9JrkI7AomOTzg2EBadpYxrBDUhNQZAADoaoXMpUmDvHeXjuJJNHTn0KHwkEIP6vDjaWnafFs+XIMpMlw50tbDqex1Pm7NDRh83PmiDD0nWsmO3MinzFc2Xm9nKh77s3eae2HO6bDnS+Nj+2TVw5lPfbGU+f+//toxOKAEwHfXfiUAAqeJiu/HrABGf//fTeHfNPq2Oa97qibtm83s0NDhu97GHHmQ+CBz1MEvAcImVZzJ3crrqqnIq3iyotBEEAoEuZJMLRPQqAPjACpM1UpU1xghyidNTgQfCEhDqziOBAEaQMyhHW08Ji/lmTsfRfCClUWPqx5EfPIri/scynWDlUjlncZkiUnpqJeePRijxWGZ9Cctax93eUiRNx49IDysODmLCw+a9vWDH+9XvEi0l+Lazqtt680VuhvpWR7Anter35+vamvm+9fcfFKfOcfGM5t5n0KNBzFhd9LaDJWS/vTXznes/H+b7n/1u0+PS970pT5z/aXUHFn26wdWxuUNsVdz46T/7Wqhot4uYd7iJVnrpUCgLAQKZCqxg4gicIaCaEY4IZJGZCilGVRMLEAComx4HUUECGooULDDcqlSfIWYppbCcdh73wy1Y4skt1IK+zUcim1AvpFuUtz//toxOwAFXm3ZbjFgBNdvOx/HvABu3QCiu0ui9/T3++RVXZBnfIsE3EqKBf/////5FV/MTvs2iBQE34JuretrXl+d8z88BHrFv1rCqqYeqOnamelX0ajERBoNCnEg8hEV6aGZy1jQTh/a1sAoAoorzRgC4C4NSobhQ/AUAUCBoY6a4QcAHADiOAoAgImqwzUiVcuNAPYNw9BuI4OABFUlmKmmWy2GxTOguWeKChgueeTG08/MLUpxrPbB4lCO/T2iUXDNKrDFSq81PbNM1dQ/MO4oZR5+Zt1J/PxHKrDN68Xs7Kis7dLD3P+iUW5rFT4IBl/SwXqvMqZqaeJaaZpbwbBYJBJSQitsGNBpUjPWSqoBy0RKcMLHvRVjxQPVMDILgdc0RxS4nDwGocCM1Hywpx8sUPUVNEKJu46e9a2u4adYptqebSJv/57tXKmiUsqwezOwMWQdbX/yljK8SNcWWUPSTJKXism//toxNOAEVCFXfjEgAqnOm2/GIAAv/rsdCijeNrU5mI5UYshHLaPNG4+/3d5+OxpNjL71cllZ2moh2l1d0tUZbLQRCJQdLMXYeypKWlwi0jwUygEMUFyLqlh9HouU61PwtISMR9Qq5TXjyIWMAYA1F1hzl1NDozv7qxWPLbzAcmbes13R/e+s0bIFa1ta1a/V/9YzTN7TRNXvDzjGPXNsZ3vH1f719el5d1vdxiTMf9t1ri1vWuP//////DnpTV77p6XxS97/H//rjeM5r94////////9IlH97xMI914IA///4WJqb//q5iMCR+QnpqXVqqqiJloc9C2EAQAAAHirgMjBZzpPj3ixpTsJmm2GlRoFAwKZsAbAEMoADgDLKIysAFIH6QAgYtSkBdpabJVyIVk7YoFDG1FiMm5LarFktBEKxWTkhASBsVxzJed3Cr2NRSmteGxQgYJ0bZiEMn9rMuU5RyObKcb//toxOKAEjDpbfiUAArlNe3/MPADjLtXrf8L8FIEZG2Sff8///2sz6rUZTlGEYbJ8YxkggjbmgQKI57CEG9+7mf///5f2v/4NR9qepyvFYSl7v1c9hDtzmxCDYewj29vNdad6VoRFl0lBQJBJSYQbtY6ZTRfV0eFS+EjfJ7XiPBIBTbSIKcSy7xzzjSIK2+5+SccSciRP34TXFutiKXLKSc2f01PyCKFp6kUZXaqeSLHV4bx+0fezdv/romwgkFhFeGOfms3R3NwD33/L10KKbm+O3H/V7+bW0K9N4VFN5vn5dFODPM4IAGDPw3C+iULhOT1u6qquoupiZeC9raJAIAAA5OZCi5MJAqZQoWhojN4sRAUQsECoZQCkpiMNgicApsis82IAQMS8YhVgmBYTAijRtihASLVLbyLlqRJ7FGjmgQQRr/+pS8ayVyuCsoYIL680KikgoazlLckikD0jg9/TYQL2XIt//toxOaAGFoNYfj0gApSni1/HmABEqTJZqCsj9CD//Bh/ShUFhHE0sGkqhVluS3mHyAY8hmPd/wju9dlFJBUXvzKrci7qrlpfautIBAEFCD00GSCS4hCXPaxA8og+VMne+3Ad3AXAIPT8aRQVygFZ0fuD+ORPSLnD9Y6WyWenKklIa4mHB2rX4wk1PRclaOUkbGrY1jTrO2/Oo+zBdq8TPP7BzjfxrLx+WreUK4wZRZAHLaLPoExyAis5lFlckKDQhlcwWQB/1xsdg7fMg0UcVxgyhiAssXCCI0iLEoCIf6li5/+NJsZRhRrSVXLaZeYp4eHh2PtUhEIAAEAywJ9KmL4Z9l8YnUWU4GCjDBSgLw/hIFQbgCAKewueQKAvBuI8KpKRNgKB4KAB7bZlVbjqcUSn6sXhmpVaOOn7TREFzzxQwxlVdo/lbqKftD3uqo/97TqtmVSYZqinlqiXeK6p3tE7ezEp/Vf//toxOQAE/C/afiUgAqvGGz/MMABj/WeGlVfuJq+0urRqdXdCEubMQDXd/ynO+3AWrK9aSluQDGmKyq3c1M7dzEy1Q67W2NEEkEgnOIhOeatFcGYh46TRQlcleZyoL+OY2Td4lF05bWpxLUnLg/hQAAfKitKMlPnsRmZq4teN2nUsRWLxaLokGDhPM1cXLno3epc9SRHRXXHJ4so9nNnf83N86Jm1Gcja91mJr6OOL191iyn5PdafrPZ2WZ9lirV2r8yvvenT+Te92L7elKT98ynTs7S1rV2uTZu1aVz6UXtvrKUvM9M5Sf6lPbb5iCa1m353T7X1rVqbQ2rRnPa+u9j48ARl0G1moxntXhXdodXtySRQBASShkuUQjioS6cY1HEQuInUNcojHHFg6KnYOiRUXPIcQTwWlDIU10GCOKCjWcSHIQjCXPMoPFLD9CNhaSRViqdI3uE+b7QpZV49r6eun4qEnPh//toxOeAFE21Zfj0AAswvqv/HsABBuKDBWJIoo+z6XS7/3L6d83CoLKVi/7v//7+/1rN6D+WbbcFYmjfVR3AB6QNSU7d//bP/3cvcy1Q8s0QjM5AiAAAACgoAyUKG+1IEm7YM9eT5dMSikJ9JPkR1GKEDLBCoqFwuITgiks2hJwwGDC0JLKsrdEuK0bbEMnFVYiFXjCNbLd9TnqBBcVZSlfjHJVK/GoTnsIZP/Nu/UrihJB0wqhvXgAGPAEcI4naE1FghZyFFLfm3cdHSCA9KSCopLn+C5ZTX4///8PgMh4Aj///I4n9vZWciXnMyLqqZ5XZyJMJgkJqKr1GVmXJofuF1TBQBfWBeVqcNBuEbhyUCwAEDApiR2JBuIYdCISIpYWUlRYUDuAsDQOx5Ro6nZltYFR4oIBJ9ij5SKavxLShMSaPQoc7kKzrUM80lx/+0jj0OHHzaChcHR5szjlKHvPMTFx1rEI6//toxNmAEozjYfj0AAp8nWw/HpAB2hE2PSagyJePyu50j2iKb19rj/vaXjljIHHi8Saeg+j5Mx/Khuf3Av2Fcfo3lOMo7s9MtU7OyolCJCAAAAAAhAS5SgeTWs1oFHk1UuNYGzodkRPuJBgu2hwZGqwnmceVZWr4Wjwwicuwsm1trVxv3jxft7sLIl6/LW2u7tfcyGP1j6ylI8o2vfrlmtrXHrbFGsaq/djqUo/e9KTNJvMzPVtZrau5E+w1Evhgq43jz93KUfvekzNJve+WmZ6tbWe2tbfMS9mzjEOWcvWzk79KUfv9Jmade/0p15mbZta5a21rkzM509Zy7say2+/TavkBfO68uuqrvLiWVZKimAAAAgCQAvyeA6EOIWHOgEchqeXi+i3HcdcFgH5AhBdh5DHIATgyGsZyMYKZNE6VJE0iDvUtqSjE1QN3SJpIkof6CkU6lJIl1kTIzesxQ9u5sfLiCZKl//toxOkAFb3Fb/j0AAsIwe0/EsAB0ukk6zhnZaKD/+7syltSSSRRnDN2WYoO6jP//UnpJJGOktd5iznTQ3qOpoqWgfSp///PGruXVJ2RNaTrSSejTNQqCYcD5lAPTX2vVxkZSZVXFMsbatRJEoBAUevT/Ocjt8sCTSkjLtYc6cRRDB0AOHghi5IcCAJw8D8BcUO1JmWMQIA9D6IadRANPsULcfnkR8yzVQ54ZTxpyTva9fbT1XabwPFJWzNHkuoim/r/v64U+UkcfDU5fd2kJPNz///xf/wxiTFo62iDT5Sa6mfjr7m////nm2jmv1PRld4qnRhwOkATVWLq7xTMjcus2qpplGhuloFAgAAi46k6VEN2XiKaq+rF+C2FzjsrADUgFgwa5xRwo4hiwShCTakSrsHtEAJLFlPX7vaq09zUU0tOiP07wzfLNrTdzymiVf/xDXySxxIKS42lCAB+vAEf/FtBFeyx//toxNqAFY3NZ/j2gAJ6vKy/HoAAyqYVQ3OZzw9I56E3IFd/CoL3FiWe9//8x4Ar4eGAA//aeFeSG8+uZqJqqqquJl4jb26QOBwSXNTB3GPhqruufPNPnVyxIcAVPBaa0WiIKgb2OMvHSZEJA/goEc4ZYQsYrRE7lkWYP5uTKQzS1VjRGbIoUiZE7pJoqLxM6MyLxTLxoVRzyKESKqCKklmtlJV+bl8sFQ0MzAvFQvorRS6L//ROGhompI8bopMgy0knzJSqRz/+Zu7G51JCmo+ya1GiZjna0FrNUVOmyX//zBaBeKhfLqkCcM3Pol8xdBk6mvVWZJHHBVACQoKuy1YFoP4AAA0IgfAOB0SU02d/n/+c/eWqv/rzMxVVtVX/b/58r/tLzOTHdJ/P369TlHJXM1ZGKeXRp+2xX/bXnJ/NRmZec7nVvk1Hvn/+ejcS/3vk59mWOBkWqjqp57sbNbG80FCZ9USm//toxN6AEhjnafj0AAsUu/A/MwACc+NRxKTq3TUfU5klLxkuc8+c1sBkv+2y1W6vLEpz/1Xc46jZRmcmSOOXVgAAwBGarqqscNVX+VZxqe3G2PKMzf+pSrhT/uonZ/VGo8Fry1fZ8trz6eaecrZI5nfJmWpquf62Xyqo3K5qLWidskTUa/7Ja1Pjycl3lv9nK/pyKM5oMTCWeN/51ozOUS/yqqqeyIEFS26buPJwGGARoGGCi4JBVio01phoZoFhGJHM15KNKoCoBYRpgpxVDtb/aaFi8KFVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUABWDA//toxN0AUkIRJzxzAApcw2CgMyNp0MmVrUPzVgoME6H2X/+aLLi82akoq83Kk4t43/ZONLMtBaJIFFAR6C83uzOzs7OzP//UUkrhuf//7kmURCNHCNAbc1Gr+VPGkJEVKlEbD8lGqnmxldXeb//4xq5RWVSOnVJ5vySqcHxlFZU4kjc0ysqkncN/2KyqqjbpRr+tyUZKrHTqi7G5L/JXW5KKyyajbjQpCwKjIgRsPc1GVbGtZREJYsXUXgpMQU1FMy4xMDCqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//toxKuD1U4muEGZNQAAADSAAAAEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqJl+/swIYqG8nBcFQ1l/FvE3LGiEx2TvAqRpkFqBq7eAtmgvCmAJCIqKaOJi/kOY0/ZRDEOVX8hyxXhty3LfvKG5flyJtbWHZfJFTuvAC7IEdNIdIuFu3A8ohySrnRXTrjSgbT5Iwxrk6+7lu+/EfYexOGkEhgEEAYWZkBBG6l30f3iLgF2HRLKIaQCsO67MC7iCj+l3E6JS5cjaQkImBBzKF2M4fihZWoGwdu//toxFYDwAABpAAAACAAADSAAAAEBbde60EAjNEjzGUHHUUN7wFdrRcAuw/KCdDdZBnSDjukXcQUgVOdFOHkh2DzT+SlW8u+j/DSK7J24Kkg5SssuWjaGwNMdU7jvQXUAAEKEJ5wgBqMhAIwMdi6lCViyzMYHEdlE9FNv2kMseMuQpZBq73XboiYg4+TWIOduB1VAAY1MAUGQmZAOQ3Eu+le2ItQWgZowBYjuTkra2u+Fq2Fk0N4CUAXQ+KJ6l6ehpSEHbsXAQUdkv+XbdIsule9Cgj2JpgEYKG4QBCgPfBIRgkCAYCiMRisVCkQCAMADxbA2fwNGFAzJPwaDgM0C6YGOABnffAYDgDNwMAS9NBbgHHANIAAwZUBgv+6FkzcERMGwgwAWKABAyJf5gaTM3QdYjYPUIuL0RuLIDoA+n/v3boEHEBxkhHgYoFahy4XBiRBjD/+pug6aab4NtBcoj8A4GIoGCAb//toxP+DwAABpAAAACXnxNGCn4AAHBLw6cBgOGQAxgAoI///1Mheg274e2HThZWIQCAADQQNnDpwveICDQEGCzyTDawyIPH//////4jQQnJMWIMUDsEaEHLg5wpQi5OkkQQVoNAi5NkTPdmdtPFtNKjGrPkgAAAIYQ1VIt8yH8cI62R+3WleTJ5IyaLnh0HbFD8UQVyVWrRxc9SRUHmmli68XvJpmFhaJRYdptKhNJ5JZuRWFabWNptPd7iKrylptrtYRplYi1U99ErmU/ZuJW+FX1ZmWaZrqe2en/+Kv0St7YWXkoWuJJlxNqymJZRKr1fg4PSCL4Ot/1HSwqjum8iqqpqomrmqd4d3uEokDgbDkNEMc6zVa0PM8JaZK7VMWUbiROZRJEiBuDkDnOkS49RzukYvj0GUJgdNUUC91ni+o3LjGSZdRYvfmhm5uYIGh1TmKLGSkv83M1GhgibnUi4tbKUktaKv//toxOwAGz4dQblKABJeMm47HoAB/Uimt0EmTRTQSV6qS9v/9k0XQc8DoWAhILfb/8CFD4EMEwsYJjpYiLgIOgqq1VUzMzFTEzES8O3s8lbccYjCNLZDPJmJgbSaSpzN8AlwxD+T0eKCGBOajpNlj4DwB4QpEJSp03HwCcB+XvuCVC7GjYOwsHeOs/LUXONqnuKQOMefaXpy1rnOa2puYZEvObDc3eOw0Y2N3Le/+v/3vtjKe+2Mp88dz8Na2P6vuun9vexlPe+mf9/xtbDnbWxbmtb/////7GZ+bOMpN7zgAHpBEI4Vz5rMuoqZqquri7feyqxokkRA0BrLAahHCToI5EFGKdiVESieLBDjJy0cXNPsFmuKfrpXoQhhypFWEqczqX1A4Ieh6jtHYYMViriPZ7AUCscEPUbna1a1hbt30uYsKSM8eRGd/HeRHuoMK8LOpdVgxI0K8z2SPR/HvR5TN/8b+a11//toxNyAEp1Hh/j2gBKTtzB/HrADbeYurZpW191xq2f9fX1e+3kSJH9t+uvbeK1za2PW2J611a26wabtma+6Uo/veJSke94lKRa4tbMubW993mmpbdtPZI76WJBhXjQYGoUu4sntWPe8Smo970pSPdIIH5e5VXExTzWS129pgIAABASFhel3J+PxbWWRSox0zPtNTG5wYL9kfzvYTEzRWlEDcVkZ6w0xPA0h6EkvJ18ZxaFND3Hko5MjieC7f5pBtt9WDTO74pis8Kjys8eCFFQWEF79WdQRdaARBYRUVyDJpIMHH6jtKbfoFyOFecpbCYukwnLIJ0U7uAc9pYor3UbBjv8oegnqIR4xmc7OFidXL35V3+rJvKm4qnmG+zjRZIKDZOcS4pIAQbx5FxbS+lowyFhMIwDgTxzRTmN9D3qtKs5iYqMlhOHr5XFsFdLIm7wuZ1oe+gvWEvyHoST1KFyNBDGRDznV//toxOkAG54PYfj3gAqBFaz/HvABb59O3suIUZ7Kyt2nysePFGr3NDFZi29Zxm0O0GA9kfvpZqP4cd5SJHfx9WrCp5a1xBpGhRoNYsKj6XcR5p+/niUo/fx3n/x7fNdWtmDArCvCh6g6taeuayMDI/Z47IyRGd/d48ozx4+4Pxbda/Fq+tt2ozNcZ7AeyXYpZoOo0Keua4ZHkRXv47zFGe+6QKXh3iU1nUtvCrrHtv7lG0irvKqcuKnHiHdZooykCAAAGYLQ8Sx+KhCScHkXxaRR3jjgGG1rg71qaUBZEWZITjiycUZKj/Z2VVxKqBXv3FSqhHTvPND25sEBWSt6ec2GChqY3jVM3vp/aA81mu4qeX3ylYFa3a+t53Ter43SsTN4+NR1M/cWF0xQmZtrvG9fWcbprUTN721j517R8vZKvocKWI9xO+z/SuM5+KYze/pT0+9419fW87pq9axYXtLaDEg0nhbr//toxNOAHlIRa/j3gAtlwez/HvABit82pbV87pbV631vH1fe/Snv8/4/z8/wYsLEaW0GBBhXhdCihHdnZnZZZXc2Y9lIYgmGQ0IWDSqapAy1RNLJXTLmwtnZ6sVOJgKmL3LsLLDKXeWMrEig0FA9+kjlyl3Y2/LX8mGNYcV/cGRPVMSJ2KVkbM2vLUWERgci5DUciERgR94vD8ARR+43asUVSIRamjkam4y7r3utDFWX16aKVp2cp7M9MPtKIficryvY1blTKx+dPV7YyvV523hYvcl9vdi9qnr17FHc7h3OvZmZfhKpTalm5BK8qOUWMLt+nsUlun7Uxs3quXe8pJZLM8dZZY41f1l+NnWWUxOfXl8rtYaxl9fK9UnKeft09ipOU8vtUlJejcrn4xSYU9PncjNm/KsrNW3Ww+7Y1rd7WWVjeF+xnjbwn/zxp3yI/9tvv77NZK20iSQAAQWXqEPsgHpYYcRY//toxJcAIsoPZ/mMABxTQyz3MZADdOhgraqwMtDCI9FVIiAJISxnZGhJNdk4Y2/Y/B7PJxYYOLNQgBGJIr8nFLmMxdQFLSELHWPB6sSpoomYukwxJMu5R2nWFWxUqX4pSRiFRaHZM/sWcOJTjtPHPOS+Etdp+4fl7XGuQ4/b/40mOd+muVMbs3af2SWZVE7URiFuMSykl8j/C93ONWpr5nGvU1hVoeVq9aZqY3Kemq1KX/+3n2xhynzv0lLhrlXlXndY83layrXKemq2KWpbpt8q67Wz5UsU9P3DDmf/+v//na8Sq65hXr39csd33Vy53OrharX7ON61q1jvHL8t7x13edJY1bp7cspMM6e3Yw5XD/m+msidiZaGRm4wgCQAAgJU3083B1XuCQmFV10IszAvs3Z93b7AahBOHOpj/enwWiEqBcN5yIw6y4oo6hHn7epmRdp94iG1OnKpkKQ5sgs7+RkeN79j//toxCsAHWn5ZfmHgAqUNzF/HrACeRFKysrFCa85xncsKJSC4Xhv6QHkOFer183MT169jv4FXkPceBqG/ph5G+5IS6US6mexW6NGm/g0zmd5qa+HN5mJE39xMRIeYeKQM52+fVe1hWYsvYL61r0niXrPExNfWNQosf5h0pSXx8UcLwp8fbLWNJP5t71mto2ay7tCizvJKx84pbN7wtUvuenxucOUnDwEWdFqrqamYiZiJd4293tEgoFuL6TBnJWjClEPJcebxDjROUZCo9YJoDo3eobCsRQDU6YO5E1D8UAnC2v2uceMSFG4ejMbev+abFuRLUki5FEs//mJlsRE0bGxeTSk6XHlzv/7f///9FZyVnUTh5K2o//H//////nDxKXNTVpOJReakk4bFS5r///////////orG0HyaUrJKLmrQEIhKos9v14BUwqpglqy2q2x6qUqWhn1scZSAQKJQ0ONDza79CH//toxAwAFYG/Y/j1gAKqOOy3HrAC5eGNxei0lzj7gPwOgjn5c8MAJgDESaeWbA6xKBONm6TrnLtIYdBLDgeyhtGzrNZOu7ozHZJYO+B/Gxu522nS2Ji4k6WG8F5IWHwlviHT/234//z5QcNFT5uocNFT7/iLb+65///n/ULEGn03HEGm8uplP44n9zv4////+f/e5iTTdVxxBp9tnHAMNhg6IosqW7ejFd5tbbrbrJYpCEQgCAgFCTgywW1lISUvqcQqO1H3NZujPwTQSCk6eNg8AhgjgClQ/Ugbnx2DoJhU1I2s+ocHeO9cdBIJktbDnMm3sYCe83JiZ5AdktbDnS3//2Hz580NDhubn27nf8t///zQ5R9/zZw0ol7nS1sOdLW////++zhox73sYzinvv/+Ww50tbF//////jsHYcHebk80OQXqwyTxxixufP8GhKdBqvt9t/9t39LZIm02WxGTAjMHh8rG//toxAoAFS3ZcbjFgBqlL6y/HrABXiMwUo1jhaSlsma0Elo67efDAE0brYxYvJkE8lE8mnB3m58495+IKS0dxUZlJMOLH2GjN79jKs1UaSiWki99sYw3f89xTPpFlqPWR4exjH3vTu+mV/39UeVs1Up1nn0ixjD77Z1f/39Td//zsu7Vs6ox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";

  // js/media.js
  var SERVED = location.protocol !== "file:";
  var blobs = /* @__PURE__ */ new Map();
  var els = /* @__PURE__ */ new Map();
  var stat = /* @__PURE__ */ new Map();
  var warmed = false;
  var warming = null;
  function manifest() {
    const out2 = [];
    const add = (u) => {
      if (u && out2.indexOf(u) < 0) out2.push(u);
    };
    add((CFG.splash || {}).sfx);
    add((CFG.splash || {}).loop);
    add((CFG.bootSfx || {}).roar);
    add((CFG.bootSfx || {}).ready);
    add(CFG.track);
    const V = CFG.voice || {};
    const dir = V.dir || "assets/audio/voice/";
    [].concat(V.panel || [], V.cube || [], V.boot || []).forEach((k) => {
      if (k) add(dir + "vo_" + k + ".wav");
    });
    return out2;
  }
  var src = (url2) => blobs.get(url2) || url2;
  function element(url2) {
    let el3 = els.get(url2);
    if (!el3) {
      el3 = new Audio(src(url2));
      el3.preload = "auto";
      els.set(url2, el3);
    }
    return el3;
  }
  function adopt(url2) {
    const el3 = els.get(url2), b = blobs.get(url2);
    if (!el3 || !b || el3.src === b) return;
    if (!el3.paused || el3.currentTime > 0) return;
    try {
      el3.src = b;
      el3.load();
    } catch (e) {
    }
  }
  function rewind(el3) {
    try {
      if (el3 && el3.readyState > 0 && el3.currentTime > 0) el3.currentTime = 0;
    } catch (e) {
    }
  }
  async function fetchOne(url2, onBytes) {
    const res = await fetch(url2);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const len = Number(res.headers.get("content-length")) || 0;
    if (!res.body || !res.body.getReader) {
      const b = await res.blob();
      onBytes(b.size, b.size);
      return b;
    }
    const reader = res.body.getReader(), chunks = [];
    let got = 0;
    for (; ; ) {
      const r = await reader.read();
      if (r.done) break;
      chunks.push(r.value);
      got += r.value.length;
      onBytes(got, len);
    }
    onBytes(got, got);
    return new Blob(chunks, { type: res.headers.get("content-type") || "" });
  }
  var EL_TIMEOUT = 12e3;
  function warmElement(url2, onBytes) {
    return new Promise((resolve) => {
      let el3;
      try {
        el3 = element(url2);
      } catch (e) {
        return resolve(false);
      }
      if (el3.readyState >= 3) {
        onBytes(1, 1);
        return resolve(true);
      }
      let settled2 = false;
      const finish = (ok) => {
        if (settled2) return;
        settled2 = true;
        clearTimeout(timer);
        el3.removeEventListener("canplaythrough", ok2);
        el3.removeEventListener("loadeddata", ok2);
        el3.removeEventListener("error", bad);
        el3.removeEventListener("progress", tick2);
        onBytes(1, 1);
        resolve(ok);
      };
      const ok2 = () => {
        if (el3.readyState >= 2) finish(true);
      };
      const bad = () => finish(false);
      const tick2 = () => {
        try {
          const d = el3.duration;
          if (d && el3.buffered.length) onBytes(el3.buffered.end(0) / d, 1);
        } catch (e) {
        }
      };
      el3.addEventListener("canplaythrough", ok2);
      el3.addEventListener("loadeddata", ok2);
      el3.addEventListener("error", bad);
      el3.addEventListener("progress", tick2);
      const timer = setTimeout(() => finish(el3.readyState >= 2), EL_TIMEOUT);
      try {
        el3.load();
      } catch (e) {
        finish(false);
      }
    });
  }
  function warm(onProgress) {
    if (warming) return warming;
    const urls = manifest();
    const total = urls.length;
    const frac = new Array(total).fill(0);
    const t03 = performance && performance.now ? performance.now() : Date.now();
    let done = 0, bytes = 0, failed = [];
    const report = (extra) => {
      let s = 0;
      for (let i = 0; i < total; i++) s += frac[i];
      const pct = total ? Math.max(0, Math.min(100, s / total * 100)) : 100;
      if (onProgress) {
        try {
          onProgress(Object.assign({ pct, done, total, bytes }, extra || {}));
        } catch (e) {
        }
      }
    };
    async function one(url2, i) {
      const onBytes = (got, len) => {
        frac[i] = len ? Math.min(1, got / len) : 0;
        report();
      };
      let ok = false;
      if (SERVED) {
        try {
          const blob = await fetchOne(url2, onBytes);
          blobs.set(url2, URL.createObjectURL(blob));
          bytes += blob.size;
          adopt(url2);
          element(url2);
          ok = true;
        } catch (e) {
          ok = await warmElement(url2, onBytes);
        }
      } else {
        ok = await warmElement(url2, onBytes);
      }
      frac[i] = 1;
      stat.set(url2, ok ? "ready" : "failed");
      if (!ok) failed.push(url2);
      done++;
      report({ url: url2, ok });
    }
    async function pool(n) {
      let next = 0;
      const worker = async () => {
        for (; ; ) {
          const i = next++;
          if (i >= total) return;
          await one(urls[i], i);
        }
      };
      await Promise.all(Array.from({ length: Math.min(n, total) }, worker));
    }
    report();
    warming = pool(3).then(() => {
      warmed = true;
      const ms = Math.round((performance && performance.now ? performance.now() : Date.now()) - t03);
      const mb = (bytes / 1048576).toFixed(2);
      console.info(
        "[nh] audio preload: %d/%d ready%s in %dms%s",
        total - failed.length,
        total,
        SERVED ? " (" + mb + " MB)" : " (element warm, file:// origin)",
        ms,
        failed.length ? " \u2014 " + failed.length + " failed" : ""
      );
      if (failed.length) console.warn("[nh] audio preload failed:", failed);
      report({ finished: true });
      return { total, failed, bytes, ms };
    });
    return warming;
  }

  // js/audio.js
  var actx = null;
  var on = false;
  var noiseBuf = null;
  var master = null;
  var trackEl = null;
  function unlock() {
    if (actx) {
      if (actx.state === "suspended") actx.resume();
      on = true;
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    actx = new AC();
    on = true;
    const n = actx.sampleRate * 0.5;
    noiseBuf = actx.createBuffer(1, n, actx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    master = actx.createGain();
    master.gain.value = 1.55;
    const comp = actx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 22;
    comp.ratio.value = 5;
    comp.attack.value = 2e-3;
    comp.release.value = 0.14;
    master.connect(comp);
    comp.connect(actx.destination);
  }
  function burst(o) {
    if (!on || !actx) return;
    const t = actx.currentTime;
    const s = actx.createBufferSource();
    s.buffer = noiseBuf;
    s.loop = true;
    const f = actx.createBiquadFilter();
    f.type = o.type || "bandpass";
    f.frequency.value = o.freq;
    f.Q.value = o.q || 5;
    const g = actx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(o.gain, t + 1e-3);
    g.gain.exponentialRampToValueAtTime(1e-4, t + o.dur);
    s.connect(f);
    f.connect(g);
    g.connect(master || actx.destination);
    s.start(t);
    s.stop(t + o.dur + 0.02);
  }
  function tone(o) {
    if (!on || !actx) return;
    const t = actx.currentTime;
    const osc = actx.createOscillator();
    osc.type = o.type || "triangle";
    osc.frequency.setValueAtTime(o.f0, t);
    if (o.f1) osc.frequency.exponentialRampToValueAtTime(o.f1, t + o.dur);
    const g = actx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(o.gain, t + 2e-3);
    g.gain.exponentialRampToValueAtTime(1e-4, t + o.dur);
    osc.connect(g);
    g.connect(master || actx.destination);
    osc.start(t);
    osc.stop(t + o.dur + 0.02);
  }
  function key() {
    const v = 0.86 + Math.random() * 0.28;
    burst({ type: "highpass", freq: 3e3 + Math.random() * 1800, q: 0.6, gain: 0.26 * v, dur: 0.011 });
    burst({ type: "lowpass", freq: 680 + Math.random() * 320, q: 0.7, gain: 0.62 * v, dur: 0.046 });
    tone({ f0: 118 + Math.random() * 46, f1: 56, gain: 0.26 * v, dur: 0.042 });
  }
  function enter() {
    burst({ type: "highpass", freq: 2400, q: 0.6, gain: 0.34, dur: 0.014 });
    burst({ type: "lowpass", freq: 430, q: 0.7, gain: 1.15, dur: 0.105 });
    tone({ f0: 86, f1: 44, gain: 0.52, dur: 0.115 });
  }
  function dock() {
    burst({ type: "lowpass", freq: 900, q: 0.6, gain: 0.3, dur: 0.2 });
    tone({ f0: 150, f1: 62, gain: 0.16, dur: 0.24 });
  }
  function deal() {
    burst({ type: "highpass", freq: 2600, q: 0.5, gain: 0.32, dur: 0.022 });
    tone({ f0: 420, f1: 260, gain: 0.24, dur: 0.05 });
  }
  function snap() {
    burst({ type: "lowpass", freq: 620, q: 0.7, gain: 0.58, dur: 0.062 });
    burst({ type: "highpass", freq: 2800, q: 0.6, gain: 0.16, dur: 0.012 });
    tone({ f0: 190, f1: 96, gain: 0.32, dur: 0.07 });
  }
  var cueEl = null;
  var cueUrl = "";
  function makeCue(url2) {
    const el3 = element(url2);
    if (!el3.__nhFallback) {
      el3.__nhFallback = true;
      el3.addEventListener("error", () => {
        if (el3.src !== SPARK_DATA) {
          el3.src = SPARK_DATA;
          el3.load();
        }
      });
    }
    return el3;
  }
  function cue(url2) {
    const src2 = url2 || SPARK_DATA;
    try {
      if (!cueEl || cueUrl !== src2) {
        cueEl = makeCue(src2);
        cueUrl = src2;
      }
      rewind(cueEl);
      const p2 = cueEl.play();
      if (p2 && p2.catch) p2.catch(() => {
      });
    } catch (e) {
    }
  }
  function startTrack(url2) {
    if (!url2 || !on) return;
    try {
      if (!trackEl) {
        trackEl = element(url2);
        trackEl.volume = 0.8;
      }
      rewind(trackEl);
      const p2 = trackEl.play();
      if (p2 && p2.catch) p2.catch(() => {
      });
    } catch (e) {
    }
  }
  function shot(url2, onEnd) {
    if (!url2) {
      if (onEnd) onEnd();
      return;
    }
    try {
      const el3 = element(url2);
      rewind(el3);
      el3.onended = null;
      if (onEnd) el3.onended = () => {
        el3.onended = null;
        onEnd();
      };
      const p2 = el3.play();
      if (p2 && p2.catch) p2.catch(() => {
        if (onEnd) {
          el3.onended = null;
          onEnd();
        }
      });
    } catch (e) {
      if (onEnd) onEnd();
    }
  }
  var loopEl = null;
  var loopUrl = "";
  var loopPending = false;
  var loopWanted = false;
  var activated = false;
  var bedAllowed = false;
  function setBedAllowed(v) {
    bedAllowed = !!v;
    if (!loopEl) return;
    try {
      if (!bedAllowed) loopEl.muted = true;
      else if (loopWanted && activated) {
        loopEl.muted = false;
        if (loopEl.paused) tryPlay();
      }
    } catch (e) {
    }
  }
  function markActivated() {
    if (activated) return;
    activated = true;
    if (loopWanted && loopEl && bedAllowed) {
      try {
        loopEl.muted = false;
        if (loopEl.paused) loopEl.play().catch(() => {
        });
      } catch (e) {
      }
    }
  }
  function tryPlay() {
    if (!loopEl) return;
    try {
      const p2 = loopEl.play();
      if (p2 && p2.catch) p2.catch(() => {
        loopPending = true;
      });
    } catch (e) {
      loopPending = true;
    }
  }
  function loopArm(url2) {
    const src2 = url2 || LOOP_DATA;
    try {
      if (!loopEl || loopUrl !== src2) {
        loopEl = element(src2);
        loopEl.loop = true;
        loopEl.volume = 1;
        loopUrl = src2;
        loopEl.addEventListener("error", () => {
          if (loopEl.src !== LOOP_DATA) {
            loopEl.src = LOOP_DATA;
            loopEl.load();
            loopEl.muted = !loopWanted;
            tryPlay();
          }
        });
        loopEl.addEventListener("canplay", () => {
          if (loopEl.paused) tryPlay();
        });
        loopEl.addEventListener("pause", () => {
          if (!loopWanted) return;
          if (activated) {
            tryPlay();
          } else {
            try {
              loopEl.muted = true;
              tryPlay();
            } catch (e) {
            }
          }
        });
      }
      loopEl.muted = true;
      tryPlay();
    } catch (e) {
    }
  }
  function loopStart(url2) {
    loopWanted = true;
    if (!loopEl) loopArm(url2);
    try {
      loopEl.volume = 1;
      loopEl.muted = !(activated && bedAllowed);
      if (loopEl.paused) tryPlay();
    } catch (e) {
    }
  }
  function loopStop() {
    loopWanted = false;
    try {
      if (loopEl) loopEl.muted = true;
    } catch (e) {
    }
  }
  function loopRetry() {
    markActivated();
    if (!loopEl) return;
    loopPending = false;
    try {
      if (loopWanted && bedAllowed) loopEl.muted = false;
      if (loopEl.paused) tryPlay();
    } catch (e) {
    }
  }

  // js/splash.js
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cv = null;
  var ctx = null;
  var btn = null;
  var nameEl = null;
  var wipeEl = null;
  var W = 0;
  var H = 0;
  var DPR = 1;
  var onDone = null;
  var power = 0;
  var writeU = 0;
  var firing = false;
  var fireStart = 0;
  var live = false;
  var fuseStart = 0;
  var isLive = () => live;
  var isFiring = () => firing;
  function init(canvas, button, name, wipe) {
    cv = canvas;
    ctx = cv.getContext("2d");
    btn = button;
    nameEl = name;
    wipeEl = wipe;
    buildGeometry();
    size();
    addEventListener("pointermove", onMove);
    addEventListener("pointerdown", () => loopRetry());
    addEventListener("pointerleave", () => {
      pointer.seen = false;
    });
    live = true;
  }
  function onEnter(fn) {
    onDone = fn;
  }
  function size() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth;
    H = innerHeight;
    cv.width = Math.max(1, W * DPR);
    cv.height = Math.max(1, H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    bandBuffer = null;
    layout();
  }
  function reset() {
    power = 0;
    writeU = 0;
    firing = false;
    live = true;
    sparks.length = 0;
    arcs.length = 0;
    cuts.length = 0;
    bandFlares.length = 0;
    bolts.length = 0;
    loopOn = false;
    loopStop();
    wipeEl.style.display = "none";
    wipeEl.style.right = "100%";
    fuseStart = 0;
    fuseArcs.length = 0;
    btn.classList.remove("blown");
    btn.style.cssText = "";
    btn.disabled = false;
  }
  var bandY = () => Math.round(H * CFG.splash.bandCentre);
  var box = { cx: 0, cy: 0, w: 0, s: 0 };
  function layout() {
    box.w = Math.min(W * CFG.splash.sigW, CFG.splash.sigMax);
    box.s = box.w / 2;
    box.cx = W / 2;
    box.cy = bandY();
  }
  var emit = { x: [], y: [], u: [] };
  var arcPairs = [];
  var inkGeometry = () => ({ emit, pairs: arcPairs });
  var occ = null;
  var occW = 0;
  var occH = 0;
  var occAspect = 0.34;
  function buildGeometry() {
    const S = get();
    if (!S) return;
    occAspect = S.aspect || 0.34;
    const total = S.total || S.strokes.reduce((a, b) => a + b.len, 0);
    const STEP = CFG.splash.emitStep;
    emit.x.length = emit.y.length = emit.u.length = 0;
    let run = 0;
    for (const st of S.strokes) {
      let target3 = 0, i = 1;
      while (target3 <= st.len && i < st.pts.length) {
        while (i < st.pts.length - 1 && st.cum[i] < target3) i++;
        const c0 = st.cum[i - 1], c1 = st.cum[i];
        const f = c1 > c0 ? (target3 - c0) / (c1 - c0) : 0;
        const a = st.pts[i - 1], b = st.pts[i];
        emit.x.push(a[0] + (b[0] - a[0]) * f);
        emit.y.push(a[1] + (b[1] - a[1]) * f);
        emit.u.push((run + target3) / total);
        target3 += STEP;
      }
      run += st.len;
    }
    occW = 320;
    occH = Math.max(8, Math.round(occW * occAspect));
    occ = new Uint8Array(occW * occH);
    const mark2 = (x, y) => {
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
        const n2 = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 4e-3));
        for (let k = 0; k <= n2; k++) mark2(
          a[0] + (b[0] - a[0]) * k / n2,
          a[1] + (b[1] - a[1]) * k / n2
        );
      }
    }
    const solid = (x, y) => {
      const gx = Math.round((x + 1) / 2 * (occW - 1));
      const gy = Math.round((y + occAspect) / (2 * occAspect) * (occH - 1));
      if (gx < 0 || gx >= occW || gy < 0 || gy >= occH) return 0;
      return occ[gy * occW + gx];
    };
    const A = CFG.splash.arc;
    const n = emit.x.length;
    arcPairs = [];
    let tries = 0;
    while (arcPairs.length < A.pool * 5 && tries < 6e4) {
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
  var sx = (x) => box.cx + x * box.s;
  var sy = (y) => box.cy - y * box.s;
  var pointer = { x: -9999, y: -9999, seen: false };
  function onMove(e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.seen = true;
  }
  function proximity() {
    if (!pointer.seen || !btn) return 0;
    const r = btn.getBoundingClientRect();
    const dx = Math.max(r.left - pointer.x, 0, pointer.x - r.right);
    const dy = Math.max(r.top - pointer.y, 0, pointer.y - r.bottom);
    const d = Math.hypot(dx, dy);
    const p2 = 1 - Math.min(1, d / CFG.splash.proxRadius);
    return p2 * p2;
  }
  var loopOn = false;
  function updateLoop(p2) {
    const C = CFG.splash;
    if (!C.loop) return;
    const charge = C.baseCharge + (100 - C.baseCharge) * p2;
    if (!loopOn && charge >= C.loopOnPct) {
      loopOn = true;
      loopStart(C.loop);
    } else if (loopOn && charge < C.loopOffPct) {
      loopOn = false;
      loopStop();
    }
  }
  function updatePower(now) {
    let target3;
    if (firing) {
      const k = Math.min(1, (now - fireStart) / CFG.splash.writeMs);
      target3 = 1;
      power = Math.max(power, k);
      writeU = k * (0.4 + 0.6 * k);
    } else {
      target3 = proximity();
    }
    power += (target3 - power) * (firing ? 0.25 : 0.09);
    power = power < 0 ? 0 : power > 1 ? 1 : power;
  }
  function paintFuse(now) {
    const F = CFG.splash;
    const t = (now - fuseStart) / 1e3;
    const spike = F.fuseSpike, fall = F.fuseFall, ember = F.fuseEmber;
    let hot, edge, glow, label;
    if (t < spike) {
      const k = t / spike;
      hot = 1 + 0.9 * (1 - k);
      edge = 1;
      glow = 46;
      label = 1;
    } else if (t < spike + fall) {
      const k = (t - spike) / fall;
      const e = 1 - Math.pow(k, 0.45);
      hot = 0.55 * e;
      edge = e;
      glow = 40 * e;
      label = Math.max(0, 1 - k * 2.6);
    } else {
      const k = Math.min(1, (t - spike - fall) / ember);
      const e = (1 - k) * (1 - k);
      hot = 0.1 * e;
      edge = 0.12 + 0.24 * e;
      glow = 7 * e;
      label = 0;
    }
    btn.style.borderColor = `rgba(${200 + 55 * hot | 0},${32 + 150 * hot | 0},${42 + 130 * hot | 0},${(0.22 + 0.78 * edge).toFixed(3)})`;
    btn.style.boxShadow = `0 0 ${glow.toFixed(1)}px rgba(255,${74 + 120 * hot | 0},${61 + 110 * hot | 0},${(0.25 + 0.6 * edge).toFixed(3)})`;
    btn.style.color = `rgba(255,${215 + 40 * hot | 0},${205 + 45 * hot | 0},${label.toFixed(3)})`;
    btn.style.background = `linear-gradient(180deg, rgba(200,32,42,${(0.16 * edge).toFixed(3)}), rgba(120,10,16,${(0.28 * edge).toFixed(3)}))`;
  }
  var fuseArcs = [];
  function updateFuse(now) {
    const F = CFG.splash;
    const t = (now - fuseStart) / 1e3;
    if (t > F.fuseSpike + F.fuseFall) return;
    const r = btn.getBoundingClientRect();
    const n = 1 + (Math.random() * 3 | 0);
    for (let i = 0; i < n; i++) {
      const y0 = r.top + r.height * (0.22 + Math.random() * 0.56);
      const y1 = r.top + r.height * (0.22 + Math.random() * 0.56);
      fuseArcs.push({
        x0: r.left + 2,
        y0,
        x1: r.right - 2,
        y1,
        age: 0,
        life: 3 + Math.random() * 6,
        seed: Math.random() * 977
      });
    }
  }
  function drawFuse() {
    if (!fuseArcs.length) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    ctx.shadowColor = "rgba(255,90,70,1)";
    for (let i = fuseArcs.length - 1; i >= 0; i--) {
      const a = fuseArcs[i];
      const t = a.age / a.life;
      const al = Math.sin((1 - t) * Math.PI * 0.5);
      const dx = a.x1 - a.x0, dy = a.y1 - a.y0;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len;
      const segs = 6 + (len / 14 | 0);
      ctx.shadowBlur = 8;
      ctx.strokeStyle = `rgba(255,${200 + 40 * al | 0},190,${(al * 0.9).toFixed(3)})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(a.x0, a.y0);
      for (let k = 1; k < segs; k++) {
        const u = k / segs;
        const rr = Math.sin(a.seed + k * 12.9898 + a.age * 3.7) * 43758.5453;
        const j = rr - Math.floor(rr);
        const off2 = (j * 2 - 1) * 14 * Math.sin(u * Math.PI);
        ctx.lineTo(a.x0 + dx * u + nx * off2, a.y0 + dy * u + ny * off2);
      }
      ctx.lineTo(a.x1, a.y1);
      ctx.stroke();
      if (++a.age >= a.life) fuseArcs.splice(i, 1);
    }
    ctx.restore();
    ctx.shadowBlur = 0;
  }
  function paintChrome(p2) {
    btn.style.borderColor = `rgba(255,74,61,${(0.45 + 0.55 * p2).toFixed(3)})`;
    btn.style.boxShadow = `0 0 ${(4 + 28 * p2).toFixed(1)}px rgba(200,32,42,${(0.25 + 0.6 * p2).toFixed(3)})`;
    btn.style.color = `rgba(255,${200 + 40 * p2 | 0},${190 + 50 * p2 | 0},${(0.25 + 0.75 * p2).toFixed(2)})`;
  }
  var BAND_GAP = 3;
  var bandBuffer = null;
  var bandRows = 26;
  var bandFlares = [];
  function buildBand() {
    if (W <= 0 || H <= 0) return;
    const cell = CFG.splash.bandCell;
    bandRows = Math.max(16, Math.min(52, Math.round(H * 0.17 / cell)));
    if (!bandBuffer) bandBuffer = document.createElement("canvas");
    bandBuffer.width = Math.max(1, W * DPR);
    bandBuffer.height = Math.max(1, H * DPR);
    const b = bandBuffer.getContext("2d");
    b.setTransform(DPR, 0, 0, DPR, 0, 0);
    b.clearRect(0, 0, W, H);
    const cy = bandY(), cols = Math.ceil(W / cell) + 1;
    for (let row = 0; row < bandRows; row++) {
      const tN = row / bandRows;
      const baseA = (1 - tN) * (1 - tN) * 0.5;
      const yB = Math.round(cy + BAND_GAP + row * cell);
      const yA = Math.round(cy - BAND_GAP - (row + 1) * cell + 1);
      for (let col = 0; col < cols; col++) {
        const hB = (col * 73856093 ^ row * 19349663) >>> 0;
        const hA = (col * 19349663 ^ row * 73856093) >>> 0;
        const nB = hB % 1e3 / 1e3, nA = hA % 1e3 / 1e3;
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
  function sigEnv(x) {
    const half = box.w / 2 * 1.22;
    const u = (x - box.cx) / half;
    if (Math.abs(u) >= 1) return 0;
    return 0.5 * (1 + Math.cos(Math.PI * u));
  }
  function drawBandHeat(p2) {
    if (!bandBuffer || p2 <= 0.02) return;
    const x0 = Math.max(0, box.cx - box.w * 0.64);
    const x1 = Math.min(W, box.cx + box.w * 0.64);
    if (x1 <= x0) return;
    const N2 = 30, sw = (x1 - x0) / N2;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < N2; i++) {
      const xa = x0 + i * sw;
      const a = sigEnv(xa + sw / 2) * p2 * 0.95;
      if (a <= 0.012) continue;
      ctx.globalAlpha = Math.min(1, a);
      ctx.drawImage(bandBuffer, xa * DPR, 0, sw * DPR, bandBuffer.height, xa, 0, sw, H);
    }
    ctx.restore();
  }
  var LAYERS = [
    { k: 0.021, w: 0.055, amp: 34, a: 0.95, lw: 1.4, c: "0,235,255" },
    { k: 0.034, w: 0.081, amp: 22, a: 0.6, lw: 1, c: "120,245,255" },
    { k: 0.0132, w: 0.037, amp: 27, a: 0.42, lw: 0.9, c: "0,180,230" }
  ];
  function drawBandWaves(p2, t) {
    if (p2 <= 0.02) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowColor = "rgba(0,230,255,.9)";
    const cy = bandY();
    for (const l of LAYERS) {
      ctx.strokeStyle = `rgba(${l.c},${(l.a * p2 * 0.9).toFixed(3)})`;
      ctx.lineWidth = l.lw;
      ctx.shadowBlur = 9 * p2;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 3) {
        const y = cy - Math.sin(x * l.k - t * l.w) * sigEnv(x) * p2 * l.amp;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
    ctx.shadowBlur = 0;
  }
  var bolts = [];
  function updateBolts(p2) {
    if (reduced) return;
    const C = CFG.splash;
    const charge = C.baseCharge + (100 - C.baseCharge) * p2;
    if (charge < C.boltOnPct) return;
    const over = Math.min(1, (charge - C.boltOnPct) / (100 - C.boltOnPct));
    if (bolts.length >= C.boltMax) return;
    if (Math.random() > over * C.boltRate) return;
    const cell = C.bandCell, cy = bandY();
    const cols = Math.ceil(W / cell) + 1;
    const px = pointer.seen ? pointer.x : W / 2;
    const spread = W * (0.5 - 0.42 * C.boltBias * over);
    let x = px + (Math.random() * 2 - 1) * spread;
    x = Math.max(0, Math.min(W - 1, x));
    const col = Math.round(x / cell);
    const row = 2 + Math.random() * (bandRows - 3) | 0;
    const up = Math.random() < 0.5;
    const y0 = up ? cy - BAND_GAP - (row + 1) * cell + 1 : cy + BAND_GAP + row * cell;
    bolts.push({
      x: col * cell,
      y0,
      y1: cy,
      age: 0,
      life: 5 + Math.random() * 9,
      seed: Math.random() * 977,
      bright: 0.55 + 0.45 * over
    });
  }
  function drawBolts() {
    if (!bolts.length) return;
    const cell = CFG.splash.bandCell;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    ctx.shadowColor = "rgba(0,220,255,1)";
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
  function drawBand(p2, wp, t) {
    if (!bandBuffer) buildBand();
    if (bandBuffer && bandBuffer.width > 0)
      ctx.drawImage(bandBuffer, 0, 0, bandBuffer.width, bandBuffer.height, 0, 0, W, H);
    drawBandHeat(p2);
    const cy = bandY();
    ctx.strokeStyle = "rgba(0,255,255,.92)";
    ctx.lineWidth = 1.5;
    ctx.shadowColor = "rgba(0,230,255,1)";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(0, cy + 0.5);
    ctx.lineTo(W, cy + 0.5);
    ctx.stroke();
    ctx.shadowBlur = 0;
    drawBandWaves(wp, t);
  }
  function spawnBandFlare(inWindow) {
    const cell = CFG.splash.bandCell, cy = bandY();
    const cols = Math.ceil(W / cell) + 1;
    const col = inWindow ? Math.max(0, Math.min(cols - 1, Math.round((box.cx - box.w / 2 + Math.random() * box.w) / cell))) : Math.floor(Math.random() * cols);
    const row = Math.floor(Math.random() * bandRows);
    const r = Math.random();
    let kind, life;
    if (r < 0.5) {
      kind = "spark";
      life = 8 + (Math.random() * 12 | 0);
    } else if (r < 0.85) {
      kind = "hold";
      life = 50 + (Math.random() * 40 | 0);
    } else {
      kind = "flicker";
      life = 20 + (Math.random() * 20 | 0);
    }
    const y = Math.random() < 0.5 ? Math.round(cy + BAND_GAP + row * cell) : Math.round(cy - BAND_GAP - (row + 1) * cell + 1);
    bandFlares.push({ x: col * cell, y, age: 0, life, kind, maxA: 0.65 + Math.random() * 0.35 });
  }
  function drawBandFlares(p2) {
    if (Math.random() < CFG.splash.bandFlare) spawnBandFlare(false);
    if (Math.random() < 0.55 * p2) spawnBandFlare(true);
    const cell = CFG.splash.bandCell;
    ctx.shadowColor = "rgba(0,230,255,1)";
    ctx.shadowBlur = 6;
    for (let i = bandFlares.length - 1; i >= 0; i--) {
      const f = bandFlares[i], t = f.age / f.life;
      let br;
      if (f.kind === "spark") br = Math.sin(t * Math.PI);
      else if (f.kind === "hold") {
        const aE = 3 / f.life, dS = 1 - 8 / f.life;
        br = t < aE ? t / aE : t < dS ? 1 : (1 - t) / (1 - dS);
      } else br = (Math.random() < 0.65 ? 1 : 0) * Math.sin(t * Math.PI);
      const a = Math.max(0, Math.min(1, br)) * f.maxA;
      if (a > 0.02) {
        ctx.fillStyle = `rgba(220,250,255,${a.toFixed(3)})`;
        ctx.fillRect(f.x, f.y, cell - 1, cell - 1);
      }
      if (++f.age >= f.life) bandFlares.splice(i, 1);
    }
    ctx.shadowBlur = 0;
  }
  function inkColour(p2) {
    const a = [0, 190, 235], b = [175, 248, 255];
    const k = Math.pow(p2, 1.6);
    return `rgb(${a[0] + (b[0] - a[0]) * k | 0},${a[1] + (b[1] - a[1]) * k | 0},${a[2] + (b[2] - a[2]) * k | 0})`;
  }
  var head = null;
  function drawSignature(p2) {
    if (writeU <= 0) {
      head = null;
      return;
    }
    const w = box.w;
    const base = Math.max(1.3, w * 52e-4);
    ctx.save();
    ctx.globalAlpha = 0.22 + 0.34 * p2;
    drawTo(ctx, box.cx, box.cy, w, writeU, {
      color: inkColour(p2),
      width: base * 1.7,
      glow: "rgba(0,215,255,.95)",
      blur: 16 + 66 * Math.pow(p2, 1.3)
    });
    ctx.globalAlpha = 0.6 + 0.4 * p2;
    head = drawTo(ctx, box.cx, box.cy, w, writeU, {
      color: inkColour(p2),
      width: base,
      glow: "rgba(0,215,255,.95)",
      blur: 3 + 16 * p2
    });
    if (p2 > 0.32) {
      ctx.globalAlpha = (p2 - 0.32) / 0.68 * 0.8;
      drawTo(ctx, box.cx, box.cy, w, writeU, {
        color: "rgb(190,250,255)",
        width: base * 0.55
      });
    }
    ctx.restore();
    if (writeU < 1 && head) drawHead(head[0], head[1]);
  }
  function drawHead(x, y) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createRadialGradient(x, y, 0, x, y, 22);
    g.addColorStop(0, "rgba(225,253,255,.98)");
    g.addColorStop(0.16, "rgba(120,240,255,.72)");
    g.addColorStop(0.45, "rgba(0,190,245,.26)");
    g.addColorStop(1, "rgba(0,120,210,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = "rgba(240,255,255,.95)";
    ctx.beginPath();
    ctx.arc(x, y, 1.8, 0, 6.283);
    ctx.fill();
    ctx.restore();
  }
  var arcs = [];
  function spawnArc() {
    if (!arcPairs.length) return;
    for (let t = 0; t < 14; t++) {
      const i = (Math.random() * (arcPairs.length / 5) | 0) * 5;
      if (arcPairs[i + 4] > writeU) continue;
      arcs.push({
        x0: sx(arcPairs[i]),
        y0: sy(arcPairs[i + 1]),
        x1: sx(arcPairs[i + 2]),
        y1: sy(arcPairs[i + 3]),
        age: 0,
        life: 3 + Math.random() * 7,
        seed: Math.random() * 977
      });
      return;
    }
  }
  function updateArcs(p2) {
    if (reduced || writeU <= 0) return;
    const over = Math.max(0, (p2 - CFG.splash.arc.threshold) / (1 - CFG.splash.arc.threshold));
    if (over <= 0) return;
    let n = over * over * CFG.splash.arc.rate;
    while (n > 0) {
      if (Math.random() < Math.min(1, n)) spawnArc();
      n -= 1;
    }
  }
  function drawArcs() {
    if (!arcs.length) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    ctx.shadowColor = "rgba(0,220,255,1)";
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
        const r = Math.sin(a.seed + k * 12.9898 + a.age * 3.7) * 43758.5453;
        const j = r - Math.floor(r);
        const off2 = (j * 2 - 1) * len * 0.18 * Math.sin(u * Math.PI);
        ctx.lineTo(a.x0 + dx * u + nx * off2, a.y0 + dy * u + ny * off2);
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
  var sparks = [];
  var cuts = [];
  var CAP = 900;
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
      x: q.x,
      y: q.y,
      phase: "charge",
      age: 0,
      warm: 0,
      chargeLen: 8 + Math.random() * 22,
      darkLen: 6 + Math.random() * 34,
      dir: Math.PI * (0.1 + Math.random() * 0.8),
      // ejecta falls away
      cone: 0.3 + Math.random() * 0.34
    };
  }
  function throwSpark(c, over) {
    const ang2 = c.dir + (Math.random() - 0.5) * c.cone * 2;
    const spd = 4.5 + Math.random() * Math.random() * 15 * (0.5 + over);
    sparks.push({
      x: c.x,
      y: c.y,
      vx: Math.cos(ang2) * spd,
      vy: Math.sin(ang2) * spd,
      age: 0,
      life: 9 + Math.random() * 19,
      w: 0.7 + Math.random() * 0.9,
      fork: Math.random() < 0.18,
      forked: false
    });
  }
  function forkSpark(s) {
    const n = 2 + (Math.random() * 2 | 0);
    for (let i = 0; i < n && sparks.length < CAP; i++) {
      const ang2 = Math.atan2(s.vy, s.vx) + (Math.random() - 0.5) * 2.4;
      const spd = 1.6 + Math.random() * 3.4;
      sparks.push({
        x: s.x,
        y: s.y,
        vx: Math.cos(ang2) * spd,
        vy: Math.sin(ang2) * spd,
        age: 0,
        life: 5 + Math.random() * 10,
        w: 0.6 + Math.random() * 0.6,
        fork: false,
        forked: true
      });
    }
  }
  function updateCuts(p2) {
    if (reduced || writeU <= 0) {
      cuts.length = 0;
      return;
    }
    if (writeU < 1 && head) {
      if (!cuts.length) cuts.push(newCut());
      cuts.length = 1;
      const c = cuts[0];
      c.x = head[0];
      c.y = head[1];
      c.warm = 1;
      c.dir = Math.PI * (0.1 + Math.random() * 0.8);
      if (sparks.length < CAP) {
        const n = 2 + (Math.random() * 4 | 0);
        for (let k = 0; k < n; k++) throwSpark(c, 1);
      }
      return;
    }
    const thr = CFG.splash.sparkThreshold;
    const over = (p2 - thr) / (1 - thr);
    const want = over <= 0 ? 0 : Math.round(1 + 4 * over);
    while (cuts.length < want) cuts.push(newCut());
    while (cuts.length > want) cuts.pop();
    for (const c of cuts) {
      c.age++;
      if (c.phase === "charge") {
        c.warm = Math.min(1, c.age / c.chargeLen);
        if (c.age >= c.chargeLen) {
          const n = Math.round((10 + Math.random() * 22) * (0.45 + over));
          for (let k = 0; k < n && sparks.length < CAP; k++) throwSpark(c, over);
          c.phase = "pop";
          c.age = 0;
          c.warm = 1;
        }
      } else if (c.phase === "pop") {
        c.warm = Math.max(0, 1 - c.age / 5);
        if (c.age >= 5) {
          c.phase = "dark";
          c.age = 0;
        }
      } else {
        c.warm = 0;
        if (c.age >= c.darkLen) Object.assign(c, newCut());
      }
    }
  }
  function sparkColour(t) {
    if (t < 0.22) {
      const k2 = t / 0.22;
      return [180 - 150 * k2, 248 - 30 * k2, 255];
    }
    const k = Math.min(1, (t - 0.22) / 0.78);
    return [30 - 25 * k, 218 - 130 * k, 255 - 90 * k];
  }
  function drawSparks() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    for (const c of cuts) {
      if (c.warm <= 0.02) continue;
      const r = 2 + 5 * c.warm;
      const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r * 2.6);
      g.addColorStop(0, `rgba(200,250,255,${(0.95 * c.warm).toFixed(3)})`);
      g.addColorStop(0.3, `rgba(40,220,255,${(0.55 * c.warm).toFixed(3)})`);
      g.addColorStop(1, "rgba(0,120,220,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(c.x, c.y, r * 2.6, 0, 6.283);
      ctx.fill();
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      const t = s.age / s.life;
      const a = (1 - t) * (1 - t * 0.4);
      const [r, g, b] = sparkColour(t);
      ctx.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${a.toFixed(3)})`;
      ctx.lineWidth = s.w;
      ctx.beginPath();
      ctx.moveTo(s.x - s.vx * 1.7, s.y - s.vy * 1.7);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
      if (t < 0.5) {
        ctx.fillStyle = `rgba(200,250,255,${(a * (1 - t * 2) * 0.8).toFixed(3)})`;
        ctx.fillRect(s.x - s.w * 0.5, s.y - s.w * 0.5, s.w * 1.3, s.w * 1.3);
      }
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.22;
      s.vx *= 0.945;
      s.vy *= 0.955;
      if (s.fork && !s.forked && t > 0.55) {
        s.forked = true;
        forkSpark(s);
      }
      if (++s.age >= s.life || s.y > H + 40) sparks.splice(i, 1);
    }
    ctx.restore();
  }
  function fire() {
    if (firing || !live) return;
    firing = true;
    live = false;
    fireStart = performance.now();
    btn.disabled = true;
    fuseStart = performance.now();
    btn.classList.add("blown");
    loopOn = false;
    loopStop();
    cue(CFG.splash.sfx);
    setTimeout(runWipe, CFG.splash.writeMs + CFG.splash.holdMs);
  }
  function runWipe() {
    wipeEl.style.display = "block";
    const t03 = performance.now(), dur = CFG.splash.wipeMs;
    (function step2() {
      const k = Math.min(1, (performance.now() - t03) / dur);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      wipeEl.style.right = ((1 - e) * 100).toFixed(2) + "%";
      if (k < 1) requestAnimationFrame(step2);
      else if (onDone) onDone();
    })();
  }
  function frame(now) {
    updatePower(now);
    const p2 = power;
    if (!firing) updateLoop(p2);
    const wp = loopOn ? Math.max(p2, CFG.splash.waveFloor) : p2;
    ctx.fillStyle = "#04070b";
    ctx.fillRect(0, 0, W, H);
    drawBand(p2, wp, now * 0.06);
    if (!reduced) drawBandFlares(p2);
    updateBolts(p2);
    drawBolts();
    drawSignature(p2);
    updateArcs(p2);
    drawArcs();
    updateCuts(p2);
    drawSparks();
    if (fuseStart) {
      updateFuse(now);
      drawFuse();
      paintFuse(now);
    } else paintChrome(p2);
    return p2;
  }

  // js/power.js
  var cells = [];
  var chargeEl = null;
  var lockEl = null;
  var orb = null;
  var octx = null;
  var fq = null;
  var fctx = null;
  var chargeShown = 0;
  var frame2 = 0;
  function init2(root) {
    cells = [...root.querySelectorAll("#battery .cell")];
    chargeEl = root.querySelector("#chargeval");
    lockEl = root.querySelector("#lockval");
    orb = root.querySelector("#orb");
    octx = orb.getContext("2d");
    fq = root.querySelector("#freq");
    fctx = fq.getContext("2d");
    chargeShown = CFG.splash.baseCharge;
    reset2();
  }
  function reset2() {
    chargeShown = CFG.splash.baseCharge;
    fqCoherence = 0;
    chaosMix = 0;
    for (const o of OSC) {
      o.phase = Math.random() * 6.283;
      o.freq = o.base;
    }
  }
  function frameAll(p2, firing2) {
    readout(p2);
    drawFreq(p2, firing2);
    drawOrb(frame2++);
  }
  function readout(p2) {
    const base = CFG.splash.baseCharge;
    const target3 = base + (100 - base) * p2;
    chargeShown += (target3 - chargeShown) * 0.12;
    chargeEl.textContent = Math.round(chargeShown);
    const filled = chargeShown / 100 * cells.length;
    cells.forEach((el3, i) => {
      el3.className = "cell";
      el3.style.removeProperty("--f");
      if (i + 1 <= filled) el3.classList.add("on");
      else if (i < filled) {
        el3.classList.add("part");
        el3.style.setProperty("--f", ((filled - i) * 100).toFixed(0) + "%");
      }
    });
    lockEl.textContent = Math.round(fqCoherence * 100);
  }
  var OSC = [
    { base: 0.052, amp: 1, tint: "0,230,255" },
    { base: 0.081, amp: 0.78, tint: "80,240,255" },
    { base: 0.119, amp: 0.6, tint: "0,190,235" },
    { base: 0.167, amp: 0.44, tint: "150,250,255" },
    { base: 0.231, amp: 0.32, tint: "0,160,220" }
  ].map((o) => ({ ...o, phase: Math.random() * 6.283, freq: o.base }));
  var REF_FREQ = 0.094;
  var refPhase = 0;
  var fqCoherence = 0;
  var CHAOS = [
    { f: 0.213, mf: 0.031, amp: 0.62, tint: "255,58,48", lw: 1.3 },
    { f: 0.347, mf: 0.019, amp: 0.44, tint: "200,32,42", lw: 1 },
    { f: 0.131, mf: 0.047, amp: 0.78, tint: "255,110,80", lw: 0.9 }
  ].map((o) => ({ ...o, ph: Math.random() * 6.283, mph: Math.random() * 6.283 }));
  var chaosMix = 0;
  function drawChaos(w, h2, cy) {
    fctx.save();
    fctx.globalCompositeOperation = "lighter";
    fctx.shadowColor = "rgba(255,60,50,.9)";
    fctx.shadowBlur = 5 * chaosMix;
    for (const o of CHAOS) {
      o.ph += o.f;
      o.mph += o.mf;
      const env = 0.45 + 0.55 * Math.sin(o.mph);
      const amp = h2 * 0.4 * o.amp * env * chaosMix;
      fctx.strokeStyle = `rgba(${o.tint},${(0.85 * chaosMix).toFixed(3)})`;
      fctx.lineWidth = o.lw;
      fctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const y = cy - Math.sin(x * o.f * 1.7 + o.ph) * amp * Math.sin(x * o.mf * 0.9 + o.mph);
        x === 0 ? fctx.moveTo(x, y) : fctx.lineTo(x, y);
      }
      fctx.stroke();
    }
    fctx.restore();
    fctx.shadowBlur = 0;
  }
  function drawFreq(p2, firing2) {
    const w = fq.width, h2 = fq.height, cy = Math.round(h2 * 0.5);
    fctx.clearRect(0, 0, w, h2);
    const lock = Math.pow(Math.max(0, (p2 - 0.12) / 0.88), 1.4);
    refPhase += REF_FREQ;
    fctx.save();
    fctx.globalCompositeOperation = "lighter";
    let spread = 0;
    for (const o of OSC) {
      o.freq = o.base + (REF_FREQ - o.base) * lock;
      o.phase += o.freq;
      let err = ((refPhase - o.phase + Math.PI) % 6.283 + 6.283) % 6.283 - Math.PI;
      o.phase += err * 0.09 * lock;
      spread += Math.abs(err);
      const amp = h2 * 0.3 * o.amp * (0.45 + 0.55 * p2);
      fctx.strokeStyle = `rgba(${o.tint},${(0.3 + 0.55 * lock).toFixed(3)})`;
      fctx.lineWidth = 1;
      fctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const y = cy - Math.sin(x * 0.11 * (o.freq / REF_FREQ) + o.phase) * amp;
        x === 0 ? fctx.moveTo(x, y) : fctx.lineTo(x, y);
      }
      fctx.stroke();
    }
    fctx.restore();
    const coh = Math.max(0, 1 - spread / OSC.length / Math.PI);
    fqCoherence += (coh - fqCoherence) * 0.12;
    fctx.fillStyle = "rgba(0,120,150,.35)";
    fctx.fillRect(4, h2 - 6, w - 8, 2);
    fctx.fillStyle = `rgba(0,230,255,${(0.5 + 0.5 * fqCoherence).toFixed(2)})`;
    fctx.fillRect(4, h2 - 6, (w - 8) * fqCoherence, 2);
    fctx.strokeStyle = "rgba(0,255,255,.5)";
    fctx.lineWidth = 1;
    fctx.beginPath();
    fctx.moveTo(0, cy + 0.5);
    fctx.lineTo(w, cy + 0.5);
    fctx.stroke();
    chaosMix += ((firing2 ? 1 : 0) - chaosMix) * (firing2 ? 0.14 : 0.08);
    if (chaosMix > 0.01) drawChaos(w, h2, cy);
  }
  var P = {
    diskStops: [
      [0, "rgba(255,220,180,1)"],
      [0.3, "rgba(255,130,70,1)"],
      [0.65, "rgba(220,50,30,1)"],
      [1, "rgba(120,20,10,1)"]
    ],
    diskShadow: "rgba(255,80,30,1)",
    haloStops: [
      [0, "rgba(255,130,80,.35)"],
      [0.2, "rgba(230,60,30,.18)"],
      [0.55, "rgba(170,30,20,.08)"],
      [1, "rgba(90,15,10,0)"]
    ],
    coronaInner: [255, 150, 90],
    coronaMid: [255, 90, 50],
    coronaOuter: [200, 50, 30],
    coronaEdge: [140, 20, 10],
    blobBase: [255, 180, 120],
    blobMid: [255, 100, 60],
    blobHot: [200, 40, 20],
    blobFade: [180, 40, 20],
    granuleCore: [255, 200, 150],
    granuleMid: [255, 100, 60],
    granuleFade: [180, 40, 20],
    flareColor: [255, 180, 120],
    flareShadow: [255, 90, 50],
    limbStroke: "rgba(255,170,110,.55)",
    limbShadow: "rgba(255,90,50,1)"
  };
  var rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;
  var blobs2 = [];
  var granules = [];
  var streamers = [];
  var flares = [];
  var filaments = [];
  for (let i = 0; i < 18; i++) blobs2.push({
    a0: Math.random() * 6.283,
    rate: 3e-3 + Math.random() * 0.012,
    dir: Math.random() < 0.5 ? -1 : 1,
    orbitR: 0.1 + Math.random() * 0.65,
    wob: 0.05 + Math.random() * 0.12,
    wobRate: 8e-3 + Math.random() * 0.025,
    r: 0.16 + Math.random() * 0.3,
    inten: 0.35 + Math.random() * 0.55,
    hue: Math.random(),
    pRate: 0.015 + Math.random() * 0.03,
    pSeed: Math.random() * 6.283
  });
  function newGranule(init8) {
    const a = Math.random() * 6.283, rad = Math.sqrt(Math.random()) * 0.95;
    return {
      ux: Math.cos(a) * rad,
      uy: Math.sin(a) * rad,
      drift: 15e-5 + Math.random() * 5e-4,
      dAng: a,
      size: 0.035 + Math.random() * 0.065,
      bright: 0.3 + Math.random() * 0.5,
      age: init8 ? Math.random() * 80 : 0,
      life: 55 + (Math.random() * 80 | 0)
    };
  }
  for (let i = 0; i < 110; i++) granules.push(newGranule(true));
  function newStreamer(init8) {
    const act2 = CFG.splash.orb.streamer;
    const eW = 0.05 + 0.25 * Math.min(act2, 3) / 3;
    const r = Math.random();
    let kind;
    if (r < eW) kind = "eruption";
    else if (r < eW + 0.3) kind = "tangent";
    else if (r < eW + 0.48) kind = "sweep";
    else if (r < eW + 0.63) kind = "swirl";
    else if (r < eW + 0.79) kind = "radial";
    else kind = "hairpin";
    const a0 = Math.random() * 6.283, dir = Math.random() < 0.5 ? 1 : -1;
    let r0, r1, a1, cx, cy, cx2, cy2, cubic = false;
    if (kind === "tangent") {
      r0 = 0.2 + Math.random() * 0.7;
      const L = 0.18 + Math.random() * 0.3;
      a1 = a0 + dir * L;
      r1 = r0 + (Math.random() - 0.5) * 0.18;
      cx = Math.cos((a0 + a1) / 2) * (r0 + r1) * 0.45;
      cy = Math.sin((a0 + a1) / 2) * (r0 + r1) * 0.45;
    } else if (kind === "sweep") {
      r0 = 0.3 + Math.random() * 0.55;
      const L = 0.55 + Math.random() * 0.85;
      a1 = a0 + dir * L;
      r1 = r0 + (Math.random() - 0.5) * 0.3;
      const m = (a0 + a1) / 2, bow = (r0 + r1) * 0.65;
      cx = Math.cos(m) * bow;
      cy = Math.sin(m) * bow;
    } else if (kind === "swirl") {
      r0 = 0.25 + Math.random() * 0.55;
      const L = 0.45 + Math.random() * 0.55;
      a1 = a0 + dir * L;
      r1 = r0 + (Math.random() - 0.5) * 0.25;
      const p1 = a0 + dir * L * 0.33, p2 = a0 + dir * L * 0.67;
      const q1 = r0 + (r1 - r0) * 0.33 + (Math.random() - 0.5) * 0.25, q2 = r0 + (r1 - r0) * 0.67 - (Math.random() - 0.5) * 0.25;
      cx = Math.cos(p1) * q1;
      cy = Math.sin(p1) * q1;
      cx2 = Math.cos(p2) * q2;
      cy2 = Math.sin(p2) * q2;
      cubic = true;
    } else if (kind === "radial") {
      r0 = 0.15 + Math.random() * 0.3;
      r1 = r0 + 0.3 + Math.random() * 0.45;
      a1 = a0 + (Math.random() - 0.5) * 0.18;
      const m = (a0 + a1) / 2, sR = (r0 + r1) * 0.5, bow = (Math.random() - 0.5) * 0.15;
      cx = Math.cos(m) * sR + Math.cos(m + Math.PI / 2) * bow;
      cy = Math.sin(m) * sR + Math.sin(m + Math.PI / 2) * bow;
    } else if (kind === "hairpin") {
      r0 = 0.25 + Math.random() * 0.4;
      r1 = r0 + (Math.random() - 0.5) * 0.1;
      a1 = a0 + dir * (0.1 + Math.random() * 0.2);
      const m = (a0 + a1) / 2, pk = r0 + 0.3 + Math.random() * 0.35;
      cx = Math.cos(m) * pk;
      cy = Math.sin(m) * pk;
    } else {
      r0 = 0.85 + Math.random() * 0.18;
      r1 = 0.85 + Math.random() * 0.18;
      a1 = a0 + dir * (0.08 + Math.random() * 0.3);
      const m = (a0 + a1) / 2, pk = 1.25 + Math.random() * 0.85;
      cx = Math.cos(m) * pk;
      cy = Math.sin(m) * pk;
    }
    return {
      kind,
      x0: Math.cos(a0) * r0,
      y0: Math.sin(a0) * r0,
      x1: Math.cos(a1) * r1,
      y1: Math.sin(a1) * r1,
      cx,
      cy,
      cx2,
      cy2,
      cubic,
      width: kind === "eruption" ? 0.014 + Math.random() * 0.02 : 0.01 + Math.random() * 0.025,
      bright: kind === "eruption" ? 0.65 + Math.random() * 0.35 : 0.4 + Math.random() * 0.5,
      age: init8 ? Math.random() * 80 : 0,
      life: Math.max(20, (60 + Math.random() * 80) / Math.max(0.4, act2) | 0)
    };
  }
  for (let i = 0; i < 48; i++) streamers.push(newStreamer(true));
  for (let i = 0; i < 26; i++) filaments.push({
    ang: i / 26 * 6.283 + Math.random() * 0.05,
    reach: 1.6 + Math.random() * 1.2,
    inten: 0.18 + Math.random() * 0.42,
    bRate: 5e-3 + Math.random() * 0.015,
    bSeed: Math.random() * 6.283
  });
  function drawOrb(t) {
    const O = CFG.splash.orb;
    const w = orb.width, h2 = orb.height;
    const o = { x: w / 2, y: h2 / 2 };
    const r = Math.min(w, h2) * 0.21 * (1 + Math.sin(t * 0.04) * O.breathe);
    const g = octx;
    g.clearRect(0, 0, w, h2);
    const haloR = r * 4.2;
    const halo = g.createRadialGradient(o.x, o.y, r * 0.95, o.x, o.y, haloR);
    for (const [s, c] of P.haloStops) halo.addColorStop(s, c);
    g.fillStyle = halo;
    g.beginPath();
    g.arc(o.x, o.y, haloR, 0, 6.283);
    g.fill();
    g.save();
    g.globalCompositeOperation = "lighter";
    for (const f of filaments) {
      const br = 0.7 + 0.3 * Math.sin(t * f.bRate + f.bSeed);
      const a = f.inten * br * 0.55 * O.corona;
      const cx = o.x + Math.cos(f.ang) * r * 1.05;
      const cy = o.y + Math.sin(f.ang) * r * 1.05;
      const pr = r * f.reach * 0.85 * br * (0.7 + 0.3 * O.corona);
      const gr = g.createRadialGradient(cx, cy, 0, cx, cy, pr);
      gr.addColorStop(0, rgba(P.coronaInner, a * 0.85));
      gr.addColorStop(0.25, rgba(P.coronaMid, a * 0.55));
      gr.addColorStop(0.6, rgba(P.coronaOuter, a * 0.2));
      gr.addColorStop(1, rgba(P.coronaEdge, 0));
      g.fillStyle = gr;
      g.beginPath();
      g.arc(cx, cy, pr, 0, 6.283);
      g.fill();
    }
    g.restore();
    const disk = g.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
    for (const [s, c] of P.diskStops) disk.addColorStop(s, c);
    g.fillStyle = disk;
    g.shadowColor = P.diskShadow;
    g.shadowBlur = 26;
    g.beginPath();
    g.arc(o.x, o.y, r, 0, 6.283);
    g.fill();
    g.shadowBlur = 0;
    g.save();
    g.beginPath();
    g.arc(o.x, o.y, r * 0.97, 0, 6.283);
    g.clip();
    g.globalCompositeOperation = "lighter";
    const nb = Math.min(blobs2.length, Math.round(blobs2.length * O.current));
    for (let i = 0; i < nb; i++) {
      const b = blobs2[i];
      const ang2 = b.a0 + t * b.rate * b.dir;
      const orbit = (b.orbitR + Math.sin(t * b.wobRate) * b.wob) * r;
      const px = o.x + Math.cos(ang2) * orbit, py = o.y + Math.sin(ang2) * orbit;
      const br = b.r * r;
      const a = b.inten * (0.7 + 0.3 * Math.sin(t * b.pRate + b.pSeed));
      let col = P.blobBase;
      if (b.hue > 0.5) col = P.blobMid;
      if (b.hue > 0.8) col = P.blobHot;
      const gr = g.createRadialGradient(px, py, 0, px, py, br);
      gr.addColorStop(0, rgba(col, a));
      gr.addColorStop(1, rgba(P.blobFade, 0));
      g.fillStyle = gr;
      g.beginPath();
      g.arc(px, py, br, 0, 6.283);
      g.fill();
    }
    const ns = Math.min(streamers.length, Math.round(streamers.length * O.streamer));
    for (let i = 0; i < ns; i++) {
      const s = streamers[i];
      if (s.kind === "eruption") continue;
      const a = s.bright * Math.sin(s.age / s.life * Math.PI);
      if (a > 0.02) {
        g.strokeStyle = rgba(P.granuleCore, a * 0.85);
        g.lineWidth = s.width * r;
        g.lineCap = "round";
        g.shadowColor = rgba(P.granuleMid, 1);
        g.shadowBlur = 5;
        g.beginPath();
        g.moveTo(o.x + s.x0 * r, o.y + s.y0 * r);
        if (s.cubic) g.bezierCurveTo(o.x + s.cx * r, o.y + s.cy * r, o.x + s.cx2 * r, o.y + s.cy2 * r, o.x + s.x1 * r, o.y + s.y1 * r);
        else g.quadraticCurveTo(o.x + s.cx * r, o.y + s.cy * r, o.x + s.x1 * r, o.y + s.y1 * r);
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
      const ux = gr0.ux + Math.cos(gr0.dAng) * d, uy = gr0.uy + Math.sin(gr0.dAng) * d;
      const dist = Math.hypot(ux, uy);
      const a = gr0.bright * env * Math.max(0, 1 - dist * 1.05);
      if (a > 0.02 && dist < 0.99) {
        const px = o.x + ux * r, py = o.y + uy * r, rr = gr0.size * r;
        const gg = g.createRadialGradient(px, py, 0, px, py, rr);
        gg.addColorStop(0, rgba(P.granuleCore, a));
        gg.addColorStop(0.5, rgba(P.granuleMid, a * 0.6));
        gg.addColorStop(1, rgba(P.granuleFade, 0));
        g.fillStyle = gg;
        g.beginPath();
        g.arc(px, py, rr, 0, 6.283);
        g.fill();
      }
      if (++gr0.age >= gr0.life) granules[i] = newGranule(false);
    }
    g.globalCompositeOperation = "source-over";
    g.restore();
    g.strokeStyle = P.limbStroke;
    g.lineWidth = 1.2;
    g.shadowColor = P.limbShadow;
    g.shadowBlur = 8;
    g.beginPath();
    g.arc(o.x, o.y, r, 0, 6.283);
    g.stroke();
    g.shadowBlur = 0;
    g.save();
    g.globalCompositeOperation = "lighter";
    for (let i = 0; i < streamers.length; i++) {
      const s = streamers[i];
      if (s.kind !== "eruption") continue;
      const a = s.bright * Math.sin(s.age / s.life * Math.PI);
      if (a > 0.02) {
        g.strokeStyle = rgba(P.flareColor, a);
        g.lineWidth = s.width * r;
        g.lineCap = "round";
        g.shadowColor = rgba(P.flareShadow, 1);
        g.shadowBlur = 12;
        g.beginPath();
        g.moveTo(o.x + s.x0 * r, o.y + s.y0 * r);
        g.quadraticCurveTo(o.x + s.cx * r, o.y + s.cy * r, o.x + s.x1 * r, o.y + s.y1 * r);
        g.stroke();
      }
      if (++s.age >= s.life) streamers[i] = newStreamer(false);
    }
    g.globalCompositeOperation = "source-over";
    g.restore();
    g.shadowBlur = 0;
    if (Math.random() < 0.012 * O.flare) {
      const a1 = Math.random() * 6.283;
      flares.push({
        a1,
        a2: a1 + (Math.random() - 0.5) * 2.2,
        reach: 1.3 + Math.random() * 0.55,
        age: 0,
        life: 50 + (Math.random() * 40 | 0)
      });
    }
    g.shadowColor = rgba(P.flareShadow, 1);
    g.shadowBlur = 14;
    for (let i = flares.length - 1; i >= 0; i--) {
      const f = flares[i];
      const inten = Math.sin(f.age / f.life * Math.PI);
      const m = (f.a1 + f.a2) / 2;
      g.strokeStyle = rgba(P.flareColor, inten);
      g.lineWidth = 1.6;
      g.lineCap = "round";
      g.beginPath();
      g.moveTo(o.x + Math.cos(f.a1) * r, o.y + Math.sin(f.a1) * r);
      g.quadraticCurveTo(
        o.x + Math.cos(m) * r * f.reach,
        o.y + Math.sin(m) * r * f.reach,
        o.x + Math.cos(f.a2) * r,
        o.y + Math.sin(f.a2) * r
      );
      g.stroke();
      if (++f.age >= f.life) flares.splice(i, 1);
    }
    g.shadowBlur = 0;
  }

  // js/cube.js
  var NFACE = 6;
  var FACE_T = [
    "rotateY(0deg)",
    "rotateY(180deg)",
    "rotateY(90deg)",
    "rotateY(-90deg)",
    "rotateX(90deg)",
    "rotateX(-90deg)"
  ];
  var RGB = "0,240,255";
  var SCENE = 300;
  var host = null;
  var wrap = null;
  var scene = null;
  var cube = null;
  var faceEls = [];
  var faces = [];
  var PX = 150;
  var vo = 0;
  var voLive = false;
  var sized = false;
  var rotY = 22;
  var rotX = 0;
  var lastT = 0;
  function drive(level2, live3) {
    vo = level2 > 0 ? level2 < 1 ? level2 : 1 : 0;
    voLive = !!live3;
  }
  function mulberry32(a) {
    return function() {
      a |= 0;
      a = a + 1831565813 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var EtchFace = class {
    constructor(canvas, seed) {
      this.c = canvas;
      this.ctx = canvas.getContext("2d");
      this.size = 300;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = this.size * dpr;
      canvas.height = this.size * dpr;
      this.ctx.scale(dpr, dpr);
      this.traces = this.build(seed);
    }
    /* Axis-aligned walks on a 20px lattice. The point is that they read as etched
       copper rather than scribble, so every segment is orthogonal and every turn
       lands on the grid. */
    build(seed) {
      const rnd = mulberry32(seed), G = 20, N2 = this.size / G, out2 = [];
      const count = 9 + Math.floor(rnd() * 5);
      for (let t = 0; t < count; t++) {
        const pts = [];
        let x = Math.floor(rnd() * N2) * G, y = Math.floor(rnd() * N2) * G;
        let horiz = rnd() < 0.5;
        pts.push([x, y]);
        const segs = 4 + Math.floor(rnd() * 5);
        for (let s = 0; s < segs; s++) {
          const step2 = (1 + Math.floor(rnd() * 4)) * G * (rnd() < 0.5 ? -1 : 1);
          if (horiz) x = Math.max(0, Math.min(this.size, x + step2));
          else y = Math.max(0, Math.min(this.size, y + step2));
          pts.push([x, y]);
          horiz = !horiz;
        }
        const cum = [0];
        for (let i = 1; i < pts.length; i++)
          cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
        const len = cum[cum.length - 1] || 1;
        out2.push({ pts, cum, len, phase: rnd(), speed: 0.35 + rnd() * 0.75, pad: rnd() < 0.6 });
      }
      return out2;
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
    render(time, level2) {
      const g = this.ctx, S = this.size;
      const flow = (CFG.cube.flow == null ? 50 : CFG.cube.flow) / 100;
      g.clearRect(0, 0, S, S);
      g.fillStyle = "#020406";
      g.fillRect(0, 0, S, S);
      g.strokeStyle = "rgba(" + RGB + ",.045)";
      g.lineWidth = 1;
      g.beginPath();
      for (let i = 20; i < S; i += 20) {
        g.moveTo(i, 0);
        g.lineTo(i, S);
        g.moveTo(0, i);
        g.lineTo(S, i);
      }
      g.stroke();
      g.lineCap = "square";
      g.lineJoin = "miter";
      g.strokeStyle = "rgba(" + RGB + ",.20)";
      g.lineWidth = 1.6;
      for (const tr of this.traces) {
        g.beginPath();
        g.moveTo(tr.pts[0][0], tr.pts[0][1]);
        for (let i = 1; i < tr.pts.length; i++) g.lineTo(tr.pts[i][0], tr.pts[i][1]);
        g.stroke();
        if (tr.pad) {
          const e = tr.pts[tr.pts.length - 1];
          g.beginPath();
          g.arc(e[0], e[1], 3, 0, 6.2832);
          g.strokeStyle = "rgba(" + RGB + ",.30)";
          g.stroke();
          g.strokeStyle = "rgba(" + RGB + ",.20)";
        }
      }
      const bright = 0.55 + 0.45 * level2;
      g.lineCap = "round";
      for (const tr of this.traces) {
        const u = (time * 6e-5 * tr.speed * (0.25 + flow * 1.9) + tr.phase) % 1;
        const tail = 0.1, steps = 7;
        for (let s = 0; s < steps; s++) {
          const uu = u - s / steps * tail;
          if (uu < 0) continue;
          const p2 = this.pointAt(tr, uu);
          const q = this.pointAt(tr, Math.max(0, uu - tail / steps));
          g.strokeStyle = "rgba(" + RGB + "," + ((1 - s / steps) * bright * 0.9).toFixed(3) + ")";
          g.lineWidth = 2.4 - s * 0.22;
          g.beginPath();
          g.moveTo(q[0], q[1]);
          g.lineTo(p2[0], p2[1]);
          g.stroke();
        }
        const head2 = this.pointAt(tr, u);
        g.fillStyle = "rgba(255,255,255," + (0.5 * bright).toFixed(3) + ")";
        g.beginPath();
        g.arc(head2[0], head2[1], 1.6, 0, 6.2832);
        g.fill();
      }
      const vg = g.createRadialGradient(S / 2, S / 2, S * 0.25, S / 2, S / 2, S * 0.75);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,.55)");
      g.fillStyle = vg;
      g.fillRect(0, 0, S, S);
    }
  };
  function init3(hostEl) {
    host = hostEl;
    if (!host) return;
    host.innerHTML = "";
    wrap = document.createElement("div");
    wrap.className = "cube-scale";
    scene = document.createElement("div");
    scene.className = "cube-scene";
    cube = document.createElement("div");
    cube.className = "cube3";
    scene.appendChild(cube);
    wrap.appendChild(scene);
    host.appendChild(wrap);
    faceEls = [];
    faces = [];
    for (let i = 0; i < NFACE; i++) {
      const f = document.createElement("div");
      f.className = "cface3";
      f.style.transform = FACE_T[i] + " translateZ(" + SCENE / 2 + "px)";
      const cv3 = document.createElement("canvas");
      f.appendChild(cv3);
      cube.appendChild(f);
      faceEls.push(f);
      faces.push(new EtchFace(cv3, 1337 + i * 977));
    }
    resize();
  }
  function resize() {
    if (!host || !cube) return;
    const v = parseInt(getComputedStyle(host).getPropertyValue("--cs"), 10);
    if (v) {
      PX = v;
      sized = true;
    }
    const k = PX / SCENE;
    wrap.style.transform = "scale(" + k.toFixed(4) + ")";
    wrap.style.opacity = sized ? "1" : "0";
  }
  function applyGlow(v) {
    const a = 0.18 + 0.82 * v;
    const b1 = 4 + 12 * v, b2 = 12 + 30 * v, b3 = 22 + 62 * v;
    const sh = "inset 0 0 " + b1.toFixed(1) + "px 1px rgba(" + RGB + "," + (0.45 * a).toFixed(3) + "),inset 0 0 " + b2.toFixed(1) + "px 2px rgba(" + RGB + "," + (0.25 * a).toFixed(3) + "),0 0 " + b1.toFixed(1) + "px 1px rgba(" + RGB + "," + (0.6 * a).toFixed(3) + "),0 0 " + b2.toFixed(1) + "px 2px rgba(" + RGB + "," + (0.38 * a).toFixed(3) + "),0 0 " + b3.toFixed(1) + "px 4px rgba(" + RGB + "," + (0.22 * a).toFixed(3) + ")";
    for (const el3 of faceEls) {
      el3.style.boxShadow = sh;
      el3.style.borderColor = "rgba(" + RGB + "," + (0.3 + 0.7 * a).toFixed(3) + ")";
    }
  }
  function frame3(now) {
    if (!cube) return;
    if (!sized) {
      resize();
      if (!sized) return;
    }
    const C = CFG.cube;
    const dt = lastT ? Math.min(64, now - lastT) : 16;
    lastT = now;
    rotY += C.spinY / 100 * 34 * dt / 1e3;
    rotX += C.spinX / 100 * 18 * dt / 1e3;
    cube.style.transform = "translateZ(" + (C.zoom || 0) + "px) rotateX(" + (C.tilt + rotX).toFixed(2) + "deg) rotateY(" + rotY.toFixed(2) + "deg)";
    const manual = C.glow / 100;
    applyGlow(voLive ? Math.min(1, vo * manual * 2) : manual * 0.55);
    for (const f of faces) f.render(now, voLive ? vo : 0.25);
  }

  // js/vodata.js
  var VO_ENV = { "cv": { "rms": [0, 0, 0, 0, 1, 31, 107, 137, 135, 193, 177, 181, 183, 181, 218, 255, 194, 149, 83, 27, 24, 81, 200, 216, 211, 204, 159, 135, 138, 130, 98, 60, 21, 14, 14, 14, 15, 18, 21, 21, 155, 229, 226, 216, 197, 173, 198, 212, 211, 124, 49, 28, 27, 120, 137, 129, 125, 125, 114, 100, 76, 55, 29, 6, 3, 1, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "b": [0, 0, 0, 0, 1, 20, 67, 90, 91, 110, 103, 90, 77, 69, 76, 97, 83, 64, 46, 21, 7, 40, 101, 112, 107, 100, 88, 69, 73, 68, 53, 35, 11, 2, 2, 1, 1, 1, 1, 9, 78, 127, 133, 132, 116, 108, 120, 133, 130, 109, 43, 25, 12, 74, 84, 84, 85, 87, 82, 79, 64, 49, 26, 6, 3, 1, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "v": [0, 0, 0, 0, 1, 23, 82, 104, 100, 138, 160, 156, 169, 168, 194, 243, 175, 136, 70, 20, 9, 62, 167, 189, 179, 169, 144, 116, 117, 112, 84, 48, 13, 4, 3, 3, 3, 5, 6, 14, 126, 184, 188, 173, 159, 136, 143, 166, 164, 92, 25, 14, 14, 96, 104, 93, 99, 87, 79, 63, 42, 27, 14, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "h": [0, 0, 0, 0, 0, 1, 2, 2, 3, 5, 11, 12, 14, 11, 8, 7, 7, 4, 2, 0, 21, 24, 10, 13, 17, 18, 5, 3, 3, 2, 2, 5, 14, 14, 14, 13, 14, 18, 20, 12, 7, 13, 15, 15, 11, 9, 11, 13, 6, 2, 3, 4, 5, 10, 19, 15, 12, 11, 7, 6, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, "mathematics": { "rms": [0, 0, 0, 1, 2, 32, 108, 137, 135, 193, 177, 181, 183, 182, 218, 255, 194, 149, 84, 28, 29, 61, 157, 145, 154, 121, 128, 117, 112, 116, 109, 110, 117, 140, 180, 154, 130, 111, 96, 54, 18, 6, 5, 5, 5, 8, 10, 61, 101, 128, 182, 171, 148, 147, 122, 102, 113, 62, 10, 4, 51, 45, 10, 36, 120, 119, 100, 73, 63, 37, 19, 8, 3, 2, 3, 21, 20, 15, 13, 11, 13, 18, 17, 17, 11, 4, 4, 3, 2, 2, 2, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "b": [0, 0, 0, 1, 1, 20, 67, 90, 91, 110, 103, 90, 77, 69, 76, 97, 83, 64, 47, 22, 9, 31, 77, 82, 77, 65, 70, 64, 64, 63, 69, 71, 77, 99, 116, 77, 68, 49, 55, 45, 13, 5, 2, 2, 1, 3, 5, 40, 61, 92, 123, 89, 81, 57, 51, 65, 82, 46, 11, 4, 4, 5, 3, 23, 77, 79, 71, 67, 51, 27, 15, 6, 3, 1, 3, 4, 5, 2, 2, 2, 1, 0, 1, 1, 1, 2, 3, 3, 2, 2, 2, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "v": [0, 0, 0, 0, 1, 23, 82, 104, 100, 138, 160, 156, 169, 168, 194, 243, 175, 136, 70, 20, 10, 46, 127, 128, 129, 105, 107, 96, 94, 93, 89, 82, 81, 104, 137, 130, 113, 98, 73, 43, 12, 3, 2, 2, 2, 6, 7, 43, 70, 98, 134, 138, 130, 133, 108, 76, 78, 43, 5, 2, 16, 15, 7, 25, 91, 88, 59, 52, 39, 25, 13, 5, 1, 0, 0, 18, 15, 4, 3, 3, 3, 4, 3, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "h": [0, 0, 0, 0, 0, 1, 2, 2, 3, 5, 11, 12, 14, 11, 8, 7, 7, 4, 3, 0, 26, 21, 8, 10, 16, 13, 3, 3, 2, 2, 2, 2, 2, 2, 5, 17, 19, 16, 9, 4, 3, 2, 4, 4, 4, 4, 3, 1, 2, 4, 5, 13, 24, 30, 21, 10, 8, 6, 1, 2, 48, 42, 7, 4, 6, 8, 6, 5, 5, 5, 3, 0, 0, 0, 0, 9, 12, 15, 12, 11, 13, 17, 16, 17, 10, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, "online": { "rms": [0, 0, 0, 0, 1, 3, 3, 4, 7, 12, 14, 22, 41, 107, 129, 153, 193, 190, 180, 193, 158, 120, 132, 124, 111, 105, 98, 59, 20, 10, 4, 1, 1, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 43, 129, 154, 163, 183, 166, 176, 174, 247, 203, 119, 45, 18, 3, 2, 2, 7, 65, 209, 243, 172, 110, 107, 99, 91, 88, 53, 31, 19, 20, 21, 63, 113, 140, 159, 173, 187, 148, 135, 174, 195, 190, 214, 187, 201, 168, 185, 155, 131, 115, 97, 43, 10, 6, 62, 185, 192, 173, 147, 128, 91, 20, 9, 3, 17, 22, 7, 2, 2, 18, 36, 35, 30, 61, 125, 143, 155, 131, 120, 117, 119, 132, 128, 111, 128, 110, 69, 32, 20, 8, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 4, 81, 136, 120, 136, 157, 213, 255, 220, 175, 141, 164, 161, 167, 157, 137, 139, 132, 132, 133, 140, 131, 132, 136, 135, 143, 150, 153, 146, 113, 69, 38, 24, 17, 10, 3, 2, 1, 2, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "b": [0, 0, 0, 0, 1, 2, 2, 3, 3, 2, 2, 3, 23, 67, 68, 97, 118, 111, 109, 116, 83, 73, 76, 90, 81, 84, 82, 53, 18, 9, 4, 1, 1, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 24, 90, 101, 105, 109, 102, 94, 94, 101, 94, 65, 28, 14, 2, 1, 1, 2, 30, 87, 89, 88, 65, 62, 55, 64, 62, 37, 22, 5, 4, 7, 35, 71, 74, 77, 79, 83, 79, 82, 113, 116, 104, 113, 99, 107, 97, 94, 95, 68, 70, 67, 36, 9, 3, 35, 77, 78, 69, 57, 44, 27, 9, 4, 2, 2, 5, 5, 2, 2, 2, 11, 6, 7, 32, 76, 67, 68, 65, 71, 74, 80, 96, 108, 104, 109, 101, 60, 28, 17, 7, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 26, 41, 62, 74, 95, 159, 189, 181, 125, 113, 122, 128, 125, 121, 96, 90, 83, 83, 84, 90, 89, 99, 109, 112, 120, 125, 127, 139, 98, 60, 33, 23, 17, 9, 3, 2, 1, 2, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "v": [0, 0, 0, 0, 0, 1, 1, 2, 6, 11, 13, 20, 31, 83, 110, 115, 154, 154, 141, 155, 132, 99, 97, 96, 74, 64, 54, 31, 11, 5, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 26, 92, 117, 125, 147, 132, 137, 156, 220, 183, 101, 36, 12, 2, 1, 1, 6, 55, 186, 227, 152, 89, 88, 76, 70, 64, 37, 27, 17, 18, 17, 41, 90, 120, 139, 151, 158, 135, 107, 131, 157, 154, 187, 158, 168, 139, 148, 137, 109, 90, 72, 31, 6, 4, 45, 168, 170, 165, 137, 120, 86, 18, 8, 2, 9, 15, 4, 1, 0, 17, 33, 33, 28, 43, 102, 125, 138, 115, 96, 90, 89, 80, 68, 60, 62, 53, 34, 17, 9, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 75, 119, 115, 113, 116, 146, 164, 136, 111, 97, 105, 100, 110, 105, 90, 113, 103, 103, 102, 107, 95, 85, 80, 74, 79, 78, 70, 69, 55, 37, 20, 11, 7, 5, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "h": [0, 0, 0, 0, 0, 0, 0, 1, 2, 4, 4, 7, 6, 5, 8, 7, 5, 5, 5, 8, 10, 9, 9, 7, 5, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 8, 13, 16, 17, 21, 13, 7, 3, 2, 1, 1, 2, 4, 4, 7, 10, 4, 3, 3, 2, 3, 4, 4, 4, 6, 7, 6, 4, 7, 11, 14, 17, 16, 10, 6, 4, 4, 6, 12, 14, 15, 8, 3, 3, 2, 2, 1, 1, 0, 3, 18, 9, 11, 12, 12, 10, 6, 1, 0, 0, 14, 16, 2, 0, 0, 4, 8, 9, 7, 5, 7, 10, 10, 9, 7, 6, 5, 3, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 7, 9, 7, 7, 6, 6, 5, 3, 3, 2, 2, 2, 3, 4, 4, 9, 11, 12, 14, 17, 14, 12, 10, 6, 6, 6, 4, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, "pelagic": { "rms": [0, 0, 0, 0, 1, 2, 2, 3, 5, 9, 11, 17, 32, 83, 100, 119, 150, 147, 140, 150, 123, 93, 102, 97, 86, 81, 76, 45, 16, 8, 3, 1, 1, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 6, 56, 100, 119, 123, 143, 156, 187, 182, 138, 38, 12, 4, 17, 18, 24, 63, 106, 118, 135, 147, 143, 178, 119, 102, 106, 113, 110, 86, 94, 58, 27, 10, 15, 42, 44, 29, 62, 102, 79, 64, 69, 46, 26, 11, 6, 2, 1, 1, 3, 12, 14, 9, 4, 3, 1, 2, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 1, 1, 2, 19, 18, 12, 54, 146, 173, 246, 255, 183, 163, 138, 112, 108, 112, 112, 81, 35, 10, 15, 7, 1, 2, 1, 1, 1, 6, 30, 24, 9, 50, 120, 122, 87, 95, 105, 116, 146, 238, 218, 205, 156, 112, 94, 68, 9, 2, 10, 32, 24, 13, 10, 8, 51, 104, 104, 106, 101, 89, 81, 74, 67, 56, 49, 24, 11, 5, 2, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "b": [0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 3, 18, 52, 53, 76, 91, 86, 85, 90, 64, 56, 59, 70, 63, 65, 63, 41, 14, 7, 3, 1, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 8, 40, 60, 71, 84, 104, 123, 116, 96, 34, 10, 4, 13, 8, 10, 33, 49, 53, 65, 67, 81, 88, 69, 49, 46, 46, 44, 43, 51, 49, 23, 9, 1, 1, 1, 4, 35, 51, 46, 52, 54, 36, 20, 8, 5, 2, 2, 1, 1, 2, 3, 2, 2, 2, 1, 2, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 3, 2, 2, 1, 1, 2, 7, 7, 5, 32, 83, 91, 88, 92, 85, 93, 76, 57, 52, 53, 54, 42, 18, 2, 1, 1, 1, 2, 1, 1, 1, 1, 3, 2, 2, 24, 61, 73, 57, 60, 72, 74, 87, 102, 116, 114, 95, 68, 65, 45, 6, 2, 1, 3, 1, 1, 2, 3, 36, 71, 81, 78, 75, 66, 61, 56, 55, 53, 42, 22, 10, 4, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "v": [0, 0, 0, 0, 0, 1, 1, 2, 5, 9, 10, 15, 24, 65, 85, 90, 120, 120, 110, 120, 103, 77, 75, 74, 58, 49, 42, 24, 8, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 54, 90, 101, 99, 114, 107, 134, 141, 112, 35, 9, 3, 11, 15, 21, 52, 92, 101, 117, 129, 124, 144, 111, 88, 93, 106, 98, 75, 74, 41, 15, 6, 7, 19, 21, 15, 49, 89, 56, 49, 44, 27, 18, 8, 4, 1, 0, 0, 2, 11, 12, 8, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 17, 16, 9, 40, 121, 143, 231, 236, 163, 131, 118, 95, 96, 98, 96, 74, 31, 5, 4, 2, 0, 0, 0, 0, 0, 3, 12, 12, 7, 40, 94, 106, 66, 71, 81, 86, 119, 201, 199, 170, 127, 82, 78, 52, 6, 1, 4, 12, 11, 7, 6, 4, 32, 64, 75, 69, 67, 62, 55, 43, 36, 31, 24, 12, 5, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "h": [0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 6, 5, 4, 7, 6, 4, 4, 4, 6, 8, 7, 7, 5, 4, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 13, 15, 14, 8, 8, 3, 2, 2, 2, 1, 0, 0, 3, 5, 8, 8, 8, 9, 8, 7, 4, 5, 9, 14, 18, 21, 17, 10, 9, 3, 0, 0, 13, 38, 39, 23, 7, 7, 6, 5, 4, 4, 3, 2, 1, 0, 0, 0, 1, 6, 6, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 6, 6, 3, 3, 8, 16, 18, 13, 13, 14, 13, 11, 10, 7, 5, 7, 9, 15, 6, 1, 0, 0, 0, 0, 5, 27, 20, 5, 2, 3, 3, 2, 2, 3, 2, 4, 9, 8, 8, 8, 6, 4, 2, 0, 0, 9, 29, 21, 11, 8, 6, 4, 7, 8, 8, 8, 6, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, "projects": { "rms": [0, 0, 0, 0, 2, 31, 107, 137, 135, 193, 177, 181, 183, 181, 218, 255, 194, 149, 83, 27, 24, 81, 202, 220, 213, 214, 169, 135, 135, 121, 77, 32, 10, 3, 15, 26, 29, 34, 148, 188, 168, 172, 162, 114, 34, 4, 15, 55, 48, 27, 114, 163, 99, 83, 80, 71, 60, 26, 8, 4, 2, 9, 16, 16, 10, 2, 2, 3, 6, 10, 10, 13, 12, 16, 21, 17, 15, 11, 5, 2, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "b": [0, 0, 0, 0, 1, 20, 67, 90, 91, 110, 103, 90, 77, 69, 76, 97, 83, 64, 46, 21, 7, 40, 102, 113, 107, 103, 92, 69, 71, 64, 43, 16, 6, 3, 6, 4, 2, 18, 84, 85, 77, 65, 64, 85, 29, 4, 2, 2, 1, 11, 49, 77, 71, 61, 58, 50, 41, 18, 7, 3, 2, 2, 4, 12, 10, 2, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 3, 2, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "v": [0, 0, 0, 0, 1, 22, 82, 104, 100, 138, 160, 156, 169, 167, 194, 243, 175, 135, 69, 20, 9, 62, 169, 192, 181, 178, 153, 116, 115, 104, 65, 27, 9, 2, 13, 25, 28, 27, 122, 164, 153, 158, 144, 81, 24, 3, 8, 25, 24, 19, 94, 139, 82, 63, 55, 48, 45, 19, 5, 2, 0, 8, 14, 8, 2, 1, 0, 1, 2, 2, 3, 3, 3, 4, 5, 4, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "h": [0, 0, 0, 0, 0, 1, 2, 2, 3, 5, 11, 12, 14, 11, 8, 7, 7, 4, 2, 0, 21, 24, 10, 13, 18, 19, 5, 3, 3, 2, 1, 1, 0, 0, 4, 6, 6, 4, 6, 10, 11, 13, 13, 4, 0, 1, 12, 49, 42, 17, 9, 11, 11, 9, 9, 7, 6, 4, 1, 0, 0, 4, 8, 5, 1, 0, 0, 1, 5, 10, 10, 12, 12, 16, 20, 17, 14, 10, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, "research": { "rms": [0, 0, 0, 0, 2, 31, 107, 137, 135, 193, 177, 181, 183, 182, 218, 255, 194, 148, 83, 27, 24, 79, 202, 215, 224, 195, 170, 155, 144, 136, 141, 119, 104, 178, 183, 160, 107, 30, 23, 25, 21, 23, 23, 18, 17, 136, 184, 147, 145, 118, 117, 96, 84, 74, 57, 23, 6, 2, 2, 13, 38, 40, 39, 39, 33, 27, 7, 2, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "b": [0, 0, 0, 0, 1, 20, 67, 90, 91, 110, 103, 90, 77, 69, 76, 97, 83, 64, 46, 21, 7, 40, 107, 112, 108, 94, 92, 84, 81, 85, 87, 76, 67, 89, 88, 88, 73, 16, 3, 1, 1, 1, 1, 1, 3, 60, 84, 64, 66, 63, 67, 69, 64, 57, 46, 18, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "v": [0, 0, 0, 0, 1, 22, 82, 104, 100, 138, 160, 156, 169, 168, 194, 243, 175, 135, 69, 20, 9, 61, 169, 183, 195, 170, 143, 127, 117, 112, 111, 87, 83, 154, 161, 133, 76, 13, 6, 5, 5, 5, 5, 5, 8, 114, 169, 131, 127, 100, 94, 67, 55, 46, 36, 15, 3, 1, 1, 7, 18, 20, 20, 22, 20, 18, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "h": [0, 0, 0, 0, 0, 1, 2, 2, 3, 5, 11, 12, 14, 10, 8, 7, 7, 4, 2, 0, 21, 24, 11, 16, 19, 15, 4, 3, 3, 2, 2, 2, 2, 6, 10, 7, 14, 25, 22, 24, 21, 23, 22, 18, 14, 7, 11, 14, 18, 14, 13, 9, 6, 5, 3, 1, 0, 0, 1, 11, 33, 35, 33, 32, 27, 20, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] } };

  // js/voice.js
  var SERVED2 = location.protocol !== "file:";
  var actx2 = null;
  var analyser = null;
  var buf = null;
  var freqBuf = null;
  var el = null;
  var curKey = "";
  var wired = /* @__PURE__ */ new WeakSet();
  var level = 0;
  var synthPhase = 0;
  var onEndCb = null;
  var playing = () => !!el && !el.paused && !el.ended;
  var current = () => playing() ? curKey : "";
  function url(key2) {
    const base = CFG.voice && CFG.voice.dir || "assets/audio/voice/";
    return base + "vo_" + key2 + ".wav";
  }
  function element2(key2) {
    return element(url(key2));
  }
  function attach(a) {
    if (!SERVED2 || wired.has(a)) return;
    try {
      if (!actx2) actx2 = new (window.AudioContext || window.webkitAudioContext)();
      const src2 = actx2.createMediaElementSource(a);
      if (!analyser) {
        analyser = actx2.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.6;
        buf = new Float32Array(analyser.fftSize);
        freqBuf = new Uint8Array(analyser.frequencyBinCount);
        analyser.connect(actx2.destination);
      }
      src2.connect(analyser);
      wired.add(a);
    } catch (e) {
      analyser = null;
    }
  }
  function play(key2, onEnd) {
    if (!key2) return;
    stop();
    try {
      const a = element2(key2);
      attach(a);
      if (actx2 && actx2.state === "suspended") actx2.resume();
      rewind(a);
      onEndCb = onEnd || null;
      a.onended = () => {
        if (onEndCb) {
          const f = onEndCb;
          onEndCb = null;
          f();
        }
      };
      const p2 = a.play();
      if (p2 && p2.catch) p2.catch(() => {
        if (onEndCb) {
          const f = onEndCb;
          onEndCb = null;
          f();
        }
      });
      el = a;
      curKey = key2;
      synthPhase = 0;
    } catch (e) {
      if (onEnd) onEnd();
    }
  }
  function stop() {
    onEndCb = null;
    baseline = 0;
    deltaPeak = 0;
    smoothed = 0;
    out = 0;
    if (el) {
      try {
        el.onended = null;
        el.pause();
      } catch (e) {
      }
    }
    el = null;
    curKey = "";
    target = 0;
  }
  function envAt(key2, t) {
    const e = VO_ENV[key2];
    if (!e || !e.rms || !e.rms.length) return null;
    const hz = CFG.voice && CFG.voice.envHz || 50;
    let i = Math.floor(t * hz);
    if (i < 0) i = 0;
    if (i >= e.rms.length) return { rms: 0, b: 0, v: 0, h: 0 };
    return { rms: e.rms[i] / 255, b: e.b[i] / 255, v: e.v[i] / 255, h: e.h[i] / 255 };
  }
  function analyserBands() {
    if (!analyser) return null;
    analyser.getFloatTimeDomainData(buf);
    let acc = 0;
    for (let i = 0; i < buf.length; i++) acc += buf[i] * buf[i];
    const r = Math.sqrt(acc / buf.length);
    analyser.getByteFrequencyData(freqBuf);
    const nyq = actx2.sampleRate / 2, n = freqBuf.length;
    const band = (lo, hi) => {
      const a = Math.max(0, Math.floor(lo / nyq * n));
      const b = Math.min(n - 1, Math.ceil(hi / nyq * n));
      if (b < a) return 0;
      let sum = 0;
      for (let i = a; i <= b; i++) sum += freqBuf[i];
      return sum / (b - a + 1) / 255;
    };
    return { rms: r, b: band(20, 200), v: band(200, 3e3), h: band(3e3, 12e3) };
  }
  function synthetic(t) {
    synthPhase += 0.13;
    const syllable = 0.5 + 0.5 * Math.sin(synthPhase * 2.1);
    const phrase = Math.max(0, Math.sin(t * 1.15) * 1.4);
    const jitter = 0.75 + 0.25 * Math.sin(synthPhase * 5.7 + 1.3);
    const r = Math.min(1, syllable * phrase * jitter * 0.8);
    return { rms: r, b: r * 0.8, v: r, h: r * 0.6 };
  }
  var baseline = 0;
  var deltaPeak = 0;
  var smoothed = 0;
  var scaleMax = 0.1;
  var out = 0;
  var pegFrames = 0;
  var quietFrames = 0;
  function frame4() {
    const V = CFG.voice || {};
    const sm = (V.smooth == null ? 50 : V.smooth) / 100;
    if (!playing()) {
      out += (0 - out) * 0.06;
      level = out;
      return level;
    }
    const t = Number(el.currentTime) || 0;
    const a = envAt(curKey, t) || analyserBands() || synthetic(t);
    const W3 = V.bands || { bass: 80, vocal: 35, high: 60 };
    const wB = W3.bass / 100, wV = W3.vocal / 100, wH = W3.high / 100;
    const wsum = wB + wV + wH || 1;
    const band = (a.b * wB + a.v * wV + a.h * wH) / wsum;
    const sig = (a.rms * 0.5 + band * 0.5) * ((V.sens == null ? 50 : V.sens) / 50);
    const SCALE_MIN = (V.gainFloor == null ? 8 : V.gainFloor) / 100;
    const SCALE_MAX = (V.gainCeil == null ? 40 : V.gainCeil) / 100;
    const adaptive = V.adaptive !== false;
    const mode = V.mode || "delta";
    let norm = 0;
    if (mode === "abs") {
      smoothed += (sig - smoothed) * (1 - sm * 0.95);
      if (adaptive) {
        if (smoothed >= scaleMax * 0.98) {
          pegFrames++;
          quietFrames = 0;
          if (pegFrames > 8) scaleMax = Math.min(SCALE_MAX, scaleMax * 1.03);
        } else if (smoothed < scaleMax * 0.25) {
          quietFrames++;
          pegFrames = 0;
          if (quietFrames > 30) scaleMax = Math.max(SCALE_MIN, scaleMax * 0.97);
        } else {
          pegFrames = 0;
          quietFrames = Math.max(0, quietFrames - 1);
          scaleMax += (smoothed * 1.4 - scaleMax) * 5e-3;
          scaleMax = Math.max(SCALE_MIN, Math.min(SCALE_MAX, scaleMax));
        }
      } else scaleMax = SCALE_MAX;
      norm = Math.min(smoothed / scaleMax, 1);
    } else if (mode === "delta") {
      const tau = 4e-3 + (1 - sm) * 0.06;
      baseline += (sig - baseline) * tau;
      const delta = Math.max(0, sig - baseline);
      deltaPeak = Math.max(delta, deltaPeak * 0.995);
      if (adaptive) deltaPeak = Math.max(SCALE_MIN * 0.35, Math.min(SCALE_MAX, deltaPeak));
      else deltaPeak = SCALE_MAX * 0.5;
      norm = Math.min(delta / (deltaPeak || 1e-6), 1);
      scaleMax = deltaPeak;
    } else {
      const db = 20 * Math.log10(Math.max(sig, 1e-5));
      norm = Math.min(1, Math.max(0, (db + 60) / 60));
      smoothed += (norm - smoothed) * (1 - sm * 0.95);
      if (adaptive) {
        scaleMax += (smoothed * 1.25 - scaleMax) * 4e-3;
        scaleMax = Math.max(SCALE_MIN, Math.min(SCALE_MAX, scaleMax));
        norm = Math.min(smoothed / Math.max(scaleMax, 1e-3), 1);
      } else {
        scaleMax = SCALE_MAX;
        norm = smoothed;
      }
    }
    out += (norm - out) * (0.1 + (1 - sm) * 0.55);
    level = Math.max(0, Math.min(1, out));
    return level;
  }

  // js/nameglitch.js
  var host2 = null;
  var cv2 = null;
  var ctx2 = null;
  var off = null;
  var octx2 = null;
  var W2 = 0;
  var H2 = 0;
  var DPR2 = 1;
  var ready = false;
  var t0 = 0;
  var TEXT = () => CFG.domain;
  var INK = "#ff4a3d";
  function hash(n) {
    const s = Math.sin(n * 12.9898) * 43758.5453;
    return (s - Math.floor(s)) * 2 - 1;
  }
  function vnoise(x) {
    const i = Math.floor(x), f = x - i;
    const u = f * f * (3 - 2 * f);
    return hash(i) * (1 - u) + hash(i + 1) * u;
  }
  function init4(el3) {
    host2 = el3;
    if (!host2) return;
    cv2 = document.createElement("canvas");
    cv2.className = "name-plate";
    cv2.setAttribute("aria-hidden", "true");
    host2.appendChild(cv2);
    ctx2 = cv2.getContext("2d");
    off = document.createElement("canvas");
    octx2 = off.getContext("2d");
    t0 = performance.now();
    measure();
  }
  function measure() {
    if (!host2 || !cv2) return;
    const r = host2.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) {
      ready = false;
      return;
    }
    DPR2 = Math.min(window.devicePixelRatio || 1, 2);
    const padX = Math.round(r.height * 0.5);
    W2 = Math.round(r.width) + padX * 2;
    H2 = Math.round(r.height * 1.5);
    cv2.width = W2 * DPR2;
    cv2.height = H2 * DPR2;
    cv2.style.width = W2 + "px";
    cv2.style.height = H2 + "px";
    cv2.style.left = -padX + "px";
    cv2.style.top = Math.round((r.height - H2) / 2) + "px";
    off.width = cv2.width;
    off.height = cv2.height;
    const cs = getComputedStyle(host2);
    const g = octx2;
    g.setTransform(DPR2, 0, 0, DPR2, 0, 0);
    g.clearRect(0, 0, W2, H2);
    g.font = cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.letterSpacing = cs.letterSpacing;
    g.shadowBlur = 0;
    g.fillStyle = INK;
    g.fillText(TEXT(), W2 / 2, H2 / 2);
    ready = true;
  }
  var burstUntil = 0;
  var nextBurst = 0;
  var burstAmp = 0;
  var burstSeed = 0;
  function gate(t) {
    if (t > burstUntil) {
      if (t > nextBurst) {
        burstUntil = t + 0.06 + Math.random() * 0.22;
        nextBurst = burstUntil + 0.14 + Math.random() * 1.5;
        burstAmp = 0.55 + Math.random() * 0.85;
        burstSeed = Math.random() * 1e3;
      }
      return 0;
    }
    return burstAmp;
  }
  function frame5(now) {
    if (!ready) return;
    const t = (now - t0) / 1e3;
    ctx2.setTransform(1, 0, 0, 1, 0, 0);
    ctx2.clearRect(0, 0, cv2.width, cv2.height);
    const band = Math.max(1, Math.round(DPR2));
    const rows = Math.ceil(cv2.height / band);
    const px = DPR2;
    const amp = gate(t);
    const slabTop = amp > 0 ? (vnoise(burstSeed) * 0.5 + 0.5) * cv2.height : 0;
    const slabH = amp > 0 ? cv2.height * (0.16 + 0.62 * Math.abs(vnoise(burstSeed + 7))) : 0;
    for (let i = 0; i < rows; i++) {
      const y = i * band;
      let dx = 0;
      if (amp > 0 && y >= slabTop && y < slabTop + slabH) {
        dx = hash(y * 0.37 + burstSeed + Math.floor(t * 110)) * amp * 5.4 * px;
        if (hash(y + burstSeed * 3) > 0.9) dx += hash(y - burstSeed) * amp * 22 * px;
      }
      if (dx === 0 && hash(y * 0.91 + Math.floor(t * 10)) > 0.995) dx = px * 2 * (hash(y + t) > 0 ? 1 : -1);
      if (dx === 0) ctx2.drawImage(off, 0, y, cv2.width, band, 0, y, cv2.width, band);
      else ctx2.drawImage(off, 0, y, cv2.width, band, dx, y, cv2.width, band);
    }
    ctx2.globalCompositeOperation = "destination-out";
    ctx2.fillStyle = "rgba(0,0,0,.62)";
    const step2 = Math.max(2, Math.round(3 * DPR2));
    for (let y = 0; y < cv2.height; y += step2) ctx2.fillRect(0, y, cv2.width, 1);
    ctx2.globalCompositeOperation = "source-over";
  }

  // js/shell.js
  var el2 = null;
  var inner = null;
  var typed = 0;
  var enterDone = false;
  var trackDone = false;
  var docked = false;
  var roarDone = false;
  var settled = false;
  function clockLine() {
    const d = /* @__PURE__ */ new Date();
    const D = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
    const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];
    const q = (n) => String(n).padStart(2, "0");
    return D + " " + M + " " + String(d.getDate()).padStart(2, " ") + " " + d.getFullYear() + "   " + q(d.getHours()) + ":" + q(d.getMinutes()) + ":" + q(d.getSeconds());
  }
  function init5(node) {
    el2 = node;
    inner = node.querySelector("#term-inner");
    reset3();
  }
  function reset3() {
    typed = 0;
    enterDone = false;
    trackDone = false;
    settled = false;
    roarDone = false;
  }
  function show() {
    el2.classList.add("live");
  }
  function dock2(rect2) {
    if (!rect2) return;
    docked = true;
    el2.classList.add("docked");
    place(rect2);
  }
  function undock() {
    docked = false;
    settled = false;
    el2.classList.remove("docked", "live");
    el2.style.left = el2.style.top = el2.style.width = el2.style.fontSize = "";
    inner.innerHTML = "";
    reset3();
  }
  function place(rect2) {
    if (!docked || !rect2) return;
    const pad3 = 10;
    el2.style.left = rect2.left + pad3 + "px";
    el2.style.top = rect2.top + pad3 + 12 + "px";
    el2.style.width = Math.max(80, rect2.width - pad3 * 2) + "px";
    el2.style.fontSize = Math.max(8.5, Math.min(14, rect2.width * 0.041)).toFixed(2) + "px";
  }
  function frame6(e) {
    if (settled) return;
    if (e >= TOTAL) settled = true;
    const iT = idx("TYPE"), iE = idx("EXEC");
    const n = e < OFF[iT] ? 0 : Math.min(
      CFG.cmd.length,
      Math.floor((e - OFF[iT]) / CFG.beats[iT].ms * CFG.cmd.length)
    );
    if (n > typed) {
      for (let i = typed; i < n; i++) key();
      typed = n;
    }
    if (!roarDone && n >= CFG.cmd.length) {
      roarDone = true;
      shot(CFG.bootSfx.roar);
    }
    if (e >= OFF[iE] && !enterDone) {
      enterDone = true;
      enter();
    }
    if (e >= OFF[iE] && !trackDone) {
      trackDone = true;
      startTrack(CFG.track);
    }
    let h2 = '<div class="tline login">' + clockLine() + "</div>";
    h2 += '<div class="tline">' + CFG.prompt + "Welcome to " + CFG.domain + "</div>";
    h2 += '<div class="tline">' + CFG.prompt;
    if (e < OFF[iT]) h2 += '<span id="cursor"></span></div>';
    else h2 += CFG.cmd.slice(0, n) + (e < OFF[iE] ? '<span id="cursor"></span>' : "") + "</div>";
    for (const s of CFG.subs) {
      const i = idx(s.at);
      if (i >= 0 && e >= OFF[i])
        h2 += '<div class="tline sub">' + s.t.replace(/ok$/, '<span class="ok">ok</span>') + "</div>";
    }
    const iL = idx("LIVE");
    if (e >= OFF[iL] + CFG.beats[iL].ms - 1)
      h2 += '<div class="tline">' + CFG.prompt + '<span id="cursor"></span></div>';
    inner.innerHTML = h2;
  }

  // js/layout.js
  var $ = (s) => document.querySelector(s);
  var deskEl = null;
  var overlayEl = null;
  var subs = [];
  var SLOTS = {};
  function init6() {
    deskEl = $("#desk");
    SLOTS.L1 = $("#slot-cube");
    SLOTS.L2 = $("#slot-term");
    SLOTS.L3 = $("#slot-sig");
    SLOTS.L4 = $("#slot-dock");
    SLOTS.top = $("#top");
    SLOTS.main = $("#main");
    overlayEl = $("#overlay");
    placeOverlay();
    drawPlacard();
  }
  function placeOverlay() {
    const r = rect("main");
    if (!r || !overlayEl) return;
    overlayEl.style.left = r.left + "px";
    overlayEl.style.top = r.top + "px";
    overlayEl.style.width = r.width + "px";
    overlayEl.style.height = r.height + "px";
  }
  function rect(name) {
    const el3 = SLOTS[name];
    if (!el3) return null;
    let x = 0, y = 0, n = el3;
    while (n) {
      x += n.offsetLeft;
      y += n.offsetTop;
      n = n.offsetParent;
    }
    return {
      left: x,
      top: y,
      width: el3.offsetWidth,
      height: el3.offsetHeight,
      right: x + el3.offsetWidth,
      bottom: y + el3.offsetHeight
    };
  }
  var slot = (name) => SLOTS[name];
  function show2() {
    deskEl.classList.add("on");
    placeOverlay();
  }
  function frameIn() {
    deskEl.classList.add("framed");
  }
  function dealIn() {
    deskEl.classList.add("dealt");
    overlayEl.classList.add("on");
  }
  function teardown() {
    deskEl.classList.remove("on", "framed", "dealt");
    overlayEl.classList.remove("on");
    SLOTS.L4.classList.remove("filled");
  }
  function onResize(fn) {
    subs.push(fn);
  }
  function resize2() {
    placeOverlay();
    drawPlacard();
    for (const f of subs) {
      try {
        f();
      } catch (e) {
      }
    }
  }
  var pcv = null;
  var pctx = null;
  var pbase = null;
  var PW = 0;
  var PH = 0;
  var pFont = 12;
  var pArcs = [];
  var pBandCells = [];
  var pBox = { cx: 0, cy: 0, s: 1 };
  var P_BAND_CELL = 3;
  var P_BAND_ROWS = 9;
  var P_BAND_GAP = 2;
  function drawPlacard() {
    pcv = $("#sig-canvas");
    if (!pcv) return;
    const r = pcv.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    pcv.width = PW = Math.round(r.width * dpr);
    pcv.height = PH = Math.round(r.height * dpr);
    pctx = pcv.getContext("2d");
    pFont = Math.round(PH * 0.19);
    const sigW = PW * 0.86;
    pBox = { cx: PW * 0.5, cy: PH * 0.42, s: sigW / 2 };
    pbase = document.createElement("canvas");
    pbase.width = PW;
    pbase.height = PH;
    const x = pbase.getContext("2d");
    x.fillStyle = "rgba(2,6,10,.82)";
    x.fillRect(0, 0, PW, PH);
    drawPlacardBand(x);
    if (get()) {
      draw(x, pBox.cx, pBox.cy, sigW, {
        color: "rgb(0,205,245)",
        width: Math.max(1.4, PW * 8e-3),
        glow: "rgba(0,215,255,.95)",
        blur: Math.max(8, PW * 0.03)
      });
      draw(x, pBox.cx, pBox.cy, sigW, {
        color: "rgb(150,242,255)",
        width: Math.max(1, PW * 38e-4)
      });
    }
    pArcs.length = 0;
    pBandCells.length = 0;
    drawPlacardFrame(performance.now());
  }
  function drawPlacardBand(x) {
    const cy = Math.round(pBox.cy);
    const cols = Math.ceil(PW / P_BAND_CELL) + 1;
    for (let row = 0; row < P_BAND_ROWS; row++) {
      const tN = row / P_BAND_ROWS;
      const baseA = (1 - tN) * (1 - tN) * 0.45;
      const yB = Math.round(cy + P_BAND_GAP + row * P_BAND_CELL);
      const yA = Math.round(cy - P_BAND_GAP - (row + 1) * P_BAND_CELL + 1);
      for (let col = 0; col < cols; col++) {
        const hB = (col * 73856093 ^ row * 19349663) >>> 0;
        const hA = (col * 19349663 ^ row * 73856093) >>> 0;
        const nB = hB % 1e3 / 1e3, nA = hA % 1e3 / 1e3;
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
    x.strokeStyle = "rgba(0,255,255,.75)";
    x.lineWidth = 1;
    x.shadowColor = "rgba(0,230,255,1)";
    x.shadowBlur = 7;
    x.beginPath();
    x.moveTo(0, cy + 0.5);
    x.lineTo(PW, cy + 0.5);
    x.stroke();
    x.shadowBlur = 0;
  }
  function urlText(x, alpha, blur) {
    x.font = "500 " + pFont + "px 'Share Tech Mono', monospace";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.shadowColor = pal().glow;
    x.shadowBlur = blur;
    x.globalAlpha = alpha;
    x.fillStyle = pal().hot;
    x.fillText(CFG.domain, PW * 0.5, PH * 0.84);
    x.shadowBlur = 0;
    x.globalAlpha = 1;
  }
  function spawnPlacardArc() {
    const g = inkGeometry();
    const c = g && g.pairs;
    if (!c || !c.length) return;
    const i = (Math.random() * (c.length / 5) | 0) * 5;
    pArcs.push({
      x0: pBox.cx + c[i] * pBox.s,
      y0: pBox.cy - c[i + 1] * pBox.s,
      x1: pBox.cx + c[i + 2] * pBox.s,
      y1: pBox.cy - c[i + 3] * pBox.s,
      age: 0,
      life: 3 + Math.random() * 6,
      seed: Math.random() * 977
    });
  }
  function drawPlacardFrame(now) {
    if (!pctx || !pbase) return;
    const U = CFG.urlEtch;
    pctx.globalCompositeOperation = "source-over";
    pctx.clearRect(0, 0, PW, PH);
    pctx.drawImage(pbase, 0, 0);
    if (Math.random() < 0.16) {
      const cy = Math.round(pBox.cy);
      const row = Math.random() * P_BAND_ROWS | 0;
      pBandCells.push({
        x: (Math.random() * (PW / P_BAND_CELL) | 0) * P_BAND_CELL,
        y: Math.random() < 0.5 ? cy + P_BAND_GAP + row * P_BAND_CELL : cy - P_BAND_GAP - (row + 1) * P_BAND_CELL + 1,
        age: 0,
        life: 10 + Math.random() * 30
      });
    }
    pctx.globalCompositeOperation = "lighter";
    for (let i = pBandCells.length - 1; i >= 0; i--) {
      const f = pBandCells[i];
      const a2 = Math.sin(f.age / f.life * Math.PI) * 0.8;
      pctx.fillStyle = `rgba(220,250,255,${a2.toFixed(3)})`;
      pctx.fillRect(f.x, f.y, P_BAND_CELL - 1, P_BAND_CELL - 1);
      if (++f.age >= f.life) pBandCells.splice(i, 1);
    }
    pctx.globalCompositeOperation = "source-over";
    const b = 0.5 + 0.28 * Math.sin(now * 26e-4) + 0.14 * Math.sin(now * 71e-4 + 1.3) + 0.08 * Math.sin(now * 0.0163 + 2.7);
    const a = U.pulseMin + (U.pulseMax - U.pulseMin) * Math.max(0, Math.min(1, b));
    urlText(pctx, 1, pFont * 0.55);
    pctx.globalCompositeOperation = "lighter";
    urlText(pctx, 0.55 * a, pFont * 1.6);
    urlText(pctx, 0.3 * a, pFont * 0.35);
    pctx.globalCompositeOperation = "source-over";
    if (Math.random() < 0.3) spawnPlacardArc();
    pctx.save();
    pctx.globalCompositeOperation = "lighter";
    pctx.lineCap = "round";
    pctx.shadowColor = "rgba(0,220,255,1)";
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
      pctx.beginPath();
      pctx.moveTo(q.x0, q.y0);
      for (let k = 1; k < segs; k++) {
        const u = k / segs;
        const r = Math.sin(q.seed + k * 12.9898 + q.age * 3.7) * 43758.5453;
        const j = r - Math.floor(r);
        const off2 = (j * 2 - 1) * len * 0.2 * Math.sin(u * Math.PI);
        pctx.lineTo(q.x0 + dx * u + nx * off2, q.y0 + dy * u + ny * off2);
      }
      pctx.lineTo(q.x1, q.y1);
      pctx.stroke();
      if (++q.age >= q.life) pArcs.splice(i, 1);
    }
    pctx.restore();
    pctx.shadowBlur = 0;
    pctx.globalAlpha = 0.24;
    pctx.fillStyle = "#000";
    for (let y = 0; y < PH; y += 3) pctx.fillRect(0, y, PW, 1);
    pctx.globalAlpha = 1;
  }

  // js/apps/calendar.js
  var calendar_exports = {};
  __export(calendar_exports, {
    mount: () => mount,
    normalize: () => normalize,
    occurrences: () => occurrences
  });

  // js/apps/ui.js
  function h(spec, attrs, ...kids) {
    const m = /^([a-z0-9]+)?((?:[.#][\w-]+)*)$/i.exec(spec) || [];
    const el3 = document.createElement(m[1] || "div");
    for (const part of (m[2] || "").match(/[.#][\w-]+/g) || []) {
      if (part[0] === ".") el3.classList.add(part.slice(1));
      else el3.id = part.slice(1);
    }
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "text") el3.textContent = v;
      else if (k === "style" && typeof v === "object") Object.assign(el3.style, v);
      else if (k.startsWith("on") && typeof v === "function") el3.addEventListener(k.slice(2), v);
      else if (k.startsWith("--")) el3.style.setProperty(k, v);
      else el3.setAttribute(k, v === true ? "" : v);
    }
    for (const k of kids.flat()) if (k != null && k !== false) el3.append(k.nodeType ? k : String(k));
    return el3;
  }
  function statusBar() {
    const fill = h("i");
    const text = h("span.app-status-text", { text: "booting\u2026" });
    const el3 = h("div.app-status", { role: "status", "aria-live": "polite" }, h("span.app-status-bar", null, fill), text);
    return {
      el: el3,
      set(msg, kind = "info", pct = null) {
        el3.dataset.kind = kind;
        text.textContent = msg;
        if (pct !== null) fill.style.width = Math.max(0, Math.min(100, pct)) + "%";
        if (kind === "err") console.error("[nh app]", msg);
      }
    };
  }
  async function loadJSON(url2) {
    if (location.protocol === "file:") return { offline: true };
    let res;
    try {
      res = await fetch(url2, { cache: "no-store" });
    } catch (e) {
      return { error: "fetch failed: " + e.message };
    }
    if (res.status === 404) return { missing: true };
    if (!res.ok) return { error: url2 + ": HTTP " + res.status };
    try {
      return { data: JSON.parse(await res.text()) };
    } catch (e) {
      return { error: url2 + " is not valid JSON: " + e.message };
    }
  }
  function jsonPicker(label, onData, onError) {
    const input = h("input", { type: "file", accept: ".json,application/json", hidden: true });
    input.addEventListener("change", async () => {
      const f = input.files && input.files[0];
      input.value = "";
      if (!f) return;
      try {
        onData(JSON.parse(await f.text()), f.name);
      } catch (e) {
        onError(f.name + ": " + e.message);
      }
    });
    return h("label.app-btn", { title: "Load a local " + label }, label, input);
  }
  var store = {
    get(k, fallback) {
      try {
        const v = localStorage.getItem(k);
        return v == null ? fallback : JSON.parse(v);
      } catch (e) {
        return fallback;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch (e) {
      }
    },
    del(k) {
      try {
        localStorage.removeItem(k);
      } catch (e) {
      }
    }
  };

  // js/apps/calendar.js
  var SOURCE = "data/schedule.json";
  var DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  var DOW_LABEL = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  var MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  var WEEK_START = 0;
  var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  var TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
  function parseDate(s) {
    const [y, m, d] = s.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d ? dt : null;
  }
  var pad = (n) => String(n).padStart(2, "0");
  var keyOf = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  var addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  function fmtTime(t) {
    if (!t) return "";
    let [hh, mm] = t.split(":").map(Number);
    const ap = hh >= 12 ? "p" : "a";
    hh = hh % 12 || 12;
    return mm ? hh + ":" + pad(mm) + ap : hh + ap;
  }
  function rangeOf(e, sep = "\u2013") {
    if (!e.start) return "all day";
    if (!e.end || e.end === e.start) return fmtTime(e.start);
    return fmtTime(e.start) + sep + fmtTime(e.end);
  }
  function normalize(data) {
    const warn = [];
    const cats = data && typeof data.categories === "object" && data.categories || {};
    const common = (e, where) => {
      if (!e.title) warn.push(where + ': missing "title"');
      for (const f of ["start", "end"]) {
        if (e[f] && !TIME_RE.test(e[f])) warn.push(where + ": " + f + ' "' + e[f] + '" is not HH:MM (24h)');
      }
      if (e.start && e.end && e.end < e.start) warn.push(where + ": end is before start");
      if (e.category && !cats[e.category]) warn.push(where + ': unknown category "' + e.category + '"');
    };
    const recurring = [];
    (Array.isArray(data.recurring) ? data.recurring : []).forEach((r, i) => {
      const where = "recurring[" + i + '] "' + (r.title || "?") + '"';
      common(r, where);
      const from = DATE_RE.test(r.from || "") ? parseDate(r.from) : null;
      const until = DATE_RE.test(r.until || "") ? parseDate(r.until) : null;
      if (!from || !until) {
        warn.push(where + ': needs valid "from" and "until" (YYYY-MM-DD) \u2014 skipped');
        return;
      }
      if (until < from) {
        warn.push(where + ': "until" is before "from" \u2014 skipped');
        return;
      }
      const days = (r.days || []).map((d) => DOW.indexOf(d));
      if (!days.length || days.includes(-1)) {
        warn.push(where + ': "days" must use ' + DOW.join(", ") + " \u2014 skipped");
        return;
      }
      const except = /* @__PURE__ */ new Set();
      (r.except || []).forEach((x) => {
        if (DATE_RE.test(x) && parseDate(x)) except.add(x);
        else warn.push(where + ': bad except date "' + x + '"');
      });
      recurring.push(Object.assign({}, r, { _from: from, _until: until, _days: new Set(days), _except: except }));
    });
    const events = [];
    (Array.isArray(data.events) ? data.events : []).forEach((e, i) => {
      const where = "events[" + i + '] "' + (e.title || "?") + '"';
      common(e, where);
      const d = DATE_RE.test(e.date || "") ? parseDate(e.date) : null;
      if (!d) {
        warn.push(where + ': needs valid "date" (YYYY-MM-DD) \u2014 skipped');
        return;
      }
      let end = d;
      if (e.endDate) {
        const ed = DATE_RE.test(e.endDate) ? parseDate(e.endDate) : null;
        if (!ed || ed < d) warn.push(where + ': bad "endDate" \u2014 treated as single day');
        else end = ed;
      }
      events.push(Object.assign({}, e, { _date: d, _end: end }));
    });
    return { meta: data.meta || {}, categories: cats, recurring, events, warnings: warn };
  }
  function occurrences(sched, hidden, start2, end) {
    const map = /* @__PURE__ */ new Map();
    const push = (d, ev) => {
      const k = keyOf(d);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(ev);
    };
    for (const r of sched.recurring) {
      if (hidden.has(r.category)) continue;
      const stop2 = r._until < end ? r._until : end;
      for (let d = r._from > start2 ? r._from : start2; d <= stop2; d = addDays(d, 1)) {
        if (r._days.has(d.getDay()) && !r._except.has(keyOf(d))) push(d, r);
      }
    }
    for (const e of sched.events) {
      if (hidden.has(e.category)) continue;
      const stop2 = e._end < end ? e._end : end;
      for (let d = e._date > start2 ? e._date : start2; d <= stop2; d = addDays(d, 1)) push(d, e);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.start || "").localeCompare(b.start || "") || (a.title || "").localeCompare(b.title || ""));
    }
    return map;
  }
  function mount(root) {
    const today = /* @__PURE__ */ new Date();
    const st = {
      year: today.getFullYear(),
      month: today.getMonth(),
      selected: keyOf(today),
      sched: { categories: {}, recurring: [], events: [], meta: {} },
      hidden: new Set(store.get("nh-cal-hidden", []))
    };
    const status = statusBar();
    const title = h("h3.cal-month", { text: "\u2014" });
    const warnBtn = h("button.app-btn.warn", { type: "button", hidden: true });
    const warnList = h("pre.app-warnings", { hidden: true });
    const dow = h("div.cal-dow");
    const grid = h("div.cal-grid");
    const legend = h("div.cal-legend");
    const detailDate = h("h4.cal-detail-date", { text: "Select a day" });
    const detailList = h("ol.cal-detail-list");
    const picker = jsonPicker("LOAD JSON", (data, name) => apply(data, name), (msg) => status.set(msg, "err"));
    picker.hidden = true;
    const nav = (label, tip, fn) => h("button.app-btn", { type: "button", title: tip, onclick: fn, text: label });
    const bar = h(
      "div.app-bar",
      null,
      title,
      h(
        "div.app-actions",
        null,
        picker,
        nav("\u25C0", "Previous month (\u2190)", () => go(-1)),
        nav("TODAY", "Jump to today (T)", goToday),
        nav("\u25B6", "Next month (\u2192)", () => go(1))
      )
    );
    for (let i = 0; i < 7; i++) dow.append(h("div", { text: DOW_LABEL[(i + WEEK_START) % 7] }));
    root.append(h(
      "div.app.app-calendar",
      null,
      bar,
      h("div.app-statusrow", null, status.el, warnBtn),
      warnList,
      h(
        "div.cal-layout",
        null,
        h("section.cal-month-wrap", null, dow, grid, legend),
        h("aside.cal-detail", null, detailDate, detailList)
      )
    ));
    warnBtn.addEventListener("click", () => {
      warnList.hidden = !warnList.hidden;
    });
    const colorOf = (e) => (st.sched.categories[e.category] || {}).color || "var(--cyan)";
    function renderLegend() {
      legend.replaceChildren();
      for (const [key2, c] of Object.entries(st.sched.categories)) {
        legend.append(h("button.cal-chip" + (st.hidden.has(key2) ? ".off" : ""), {
          type: "button",
          title: "Show / hide",
          "--c": c.color,
          text: c.label || key2,
          onclick: () => {
            st.hidden.has(key2) ? st.hidden.delete(key2) : st.hidden.add(key2);
            store.set("nh-cal-hidden", [...st.hidden]);
            renderLegend();
            render();
          }
        }));
      }
    }
    function render() {
      title.textContent = MONTHS[st.month].toUpperCase() + " " + st.year;
      const first = new Date(st.year, st.month, 1);
      const gridStart = addDays(first, -((first.getDay() - WEEK_START + 7) % 7));
      const gridEnd = addDays(gridStart, 41);
      const occ2 = occurrences(st.sched, st.hidden, gridStart, gridEnd);
      const todayKey = keyOf(/* @__PURE__ */ new Date());
      const cells2 = [];
      for (let i = 0; i < 42; i++) {
        const d = addDays(gridStart, i), k = keyOf(d);
        const list = occ2.get(k) || [];
        const cls = "div.cal-cell" + (d.getMonth() !== st.month ? ".out" : "") + (k === todayKey ? ".today" : "") + (k === st.selected ? ".sel" : "");
        const rows = list.length ? h("ul.cal-evs", null, list.map((e) => h(
          "li.cal-ev" + (e.start ? "" : ".allday"),
          { "--c": colorOf(e), title: [rangeOf(e), e.title, e.location].filter(Boolean).join(" \xB7 ") },
          e.start ? h("span.ev-t", { text: fmtTime(e.start) }) : null,
          h("span.ev-n", { text: e.title || "(untitled)" })
        ))) : null;
        cells2.push(h(cls, { "data-key": k, onclick: () => select(k, list) }, h("div.num", { text: d.getDate() }), rows));
      }
      grid.replaceChildren(...cells2);
      if (st.selected) {
        const sel = parseDate(st.selected);
        if (sel >= gridStart && sel <= gridEnd) detail(st.selected, occ2.get(st.selected) || []);
      }
    }
    function select(k, list) {
      st.selected = k;
      grid.querySelectorAll(".cal-cell.sel").forEach((c2) => c2.classList.remove("sel"));
      const c = grid.querySelector('.cal-cell[data-key="' + k + '"]');
      if (c) c.classList.add("sel");
      detail(k, list);
    }
    function detail(k, list) {
      const d = parseDate(k);
      detailDate.textContent = DOW_LABEL[d.getDay()] + " " + MONTHS[d.getMonth()].slice(0, 3).toUpperCase() + " " + d.getDate() + ", " + d.getFullYear();
      if (!list.length) {
        detailList.replaceChildren(h("li.empty", { text: "Nothing scheduled." }));
        return;
      }
      detailList.replaceChildren(...list.map((e) => h(
        "li",
        { "--c": colorOf(e) },
        h("div.time", { text: rangeOf(e, " \u2013 ") }),
        h("div.name", { text: e.title || "(untitled)" }),
        [e.location, (st.sched.categories[e.category] || {}).label].filter(Boolean).length ? h("div.meta", { text: [e.location, (st.sched.categories[e.category] || {}).label].filter(Boolean).join(" \xB7 ") }) : null,
        e.notes ? h("div.meta", { text: e.notes }) : null,
        e.url ? h("a.meta", { href: e.url, target: "_blank", rel: "noopener", text: "link \u2197" }) : null
      )));
    }
    function go(delta) {
      const d = new Date(st.year, st.month + delta, 1);
      st.year = d.getFullYear();
      st.month = d.getMonth();
      render();
    }
    function goToday() {
      const t = /* @__PURE__ */ new Date();
      st.year = t.getFullYear();
      st.month = t.getMonth();
      st.selected = keyOf(t);
      render();
    }
    const onKey = (e) => {
      if (e.target.closest && e.target.closest("input, textarea")) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "t" || e.key === "T") goToday();
    };
    addEventListener("keydown", onKey);
    function apply(data, origin) {
      status.set("validating entries\u2026", "info", 70);
      const n = normalize(data);
      st.sched = n;
      warnBtn.hidden = !n.warnings.length;
      warnBtn.textContent = n.warnings.length + " warning" + (n.warnings.length === 1 ? "" : "s");
      warnList.textContent = n.warnings.join("\n");
      n.warnings.forEach((w) => console.warn("[nh calendar]", w));
      status.set("rendering\u2026", "info", 90);
      renderLegend();
      render();
      const m = n.meta;
      status.set(
        (m.title ? m.title + " \xB7 " : "") + n.recurring.length + " recurring + " + n.events.length + " one-off" + (m.updated ? " \xB7 updated " + m.updated : "") + (origin ? " \xB7 " + origin : ""),
        n.warnings.length ? "warn" : "ok",
        100
      );
    }
    (async () => {
      render();
      status.set("fetching " + SOURCE + "\u2026", "info", 20);
      const r = await loadJSON(SOURCE);
      if (r.data) {
        status.set("parsing\u2026", "info", 45);
        apply(r.data);
        return;
      }
      picker.hidden = false;
      if (r.offline) status.set("Opened from disk: browsers block reading " + SOURCE + " here. Use LOAD JSON, or serve the folder.", "warn", 100);
      else if (r.missing) status.set(SOURCE + " not found in the repo", "err", 100);
      else status.set(r.error, "err", 100);
    })();
    return function destroy() {
      removeEventListener("keydown", onKey);
    };
  }

  // js/apps/linkdock.js
  var linkdock_exports = {};
  __export(linkdock_exports, {
    candidatesFor: () => candidatesFor,
    mount: () => mount2,
    normUrl: () => normUrl,
    rank: () => rank
  });
  var SOURCE2 = "data/links.json";
  var DRAFT_KEY = "nh-linkdock-draft-v1";
  var PROBE_TIMEOUT_MS = 8e3;
  function normUrl(raw) {
    let s = (raw || "").trim();
    if (!s || s[0] === "#") return null;
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = "https://" + s;
    try {
      const u = new URL(s);
      if (u.protocol !== "http:" && u.protocol !== "https:") return null;
      if (!u.hostname.includes(".") && u.hostname !== "localhost") return null;
      u.hash = "";
      return u;
    } catch (e) {
      return null;
    }
  }
  var bareHost = (u) => u.hostname.replace(/^www\./, "");
  function candidatesFor(u) {
    return [
      { src: u.origin + "/apple-touch-icon.png", label: "site apple-touch-icon" },
      { src: u.origin + "/favicon.ico", label: "site favicon.ico" },
      { src: "https://icons.duckduckgo.com/ip3/" + u.hostname + ".ico", label: "DuckDuckGo" },
      // Google returns a generic 16px globe for unknown domains — ranked last.
      { src: "https://www.google.com/s2/favicons?domain=" + encodeURIComponent(u.hostname) + "&sz=128", label: "Google s2", weakAt: 16 }
    ];
  }
  function probe(c) {
    return new Promise((resolve) => {
      const img = new Image();
      const timer = setTimeout(() => {
        img.src = "";
        resolve(Object.assign({}, c, { ok: false }));
      }, PROBE_TIMEOUT_MS);
      img.onload = () => {
        clearTimeout(timer);
        const w = img.naturalWidth || 0;
        resolve(Object.assign({}, c, { ok: w > 0, w, h: img.naturalHeight || 0, weak: !!(c.weakAt && w <= c.weakAt) }));
      };
      img.onerror = () => {
        clearTimeout(timer);
        resolve(Object.assign({}, c, { ok: false }));
      };
      img.referrerPolicy = "no-referrer";
      img.src = c.src;
    });
  }
  function rank(results) {
    return results.filter((r) => r.ok).sort((a, b) => a.weak === b.weak ? Math.min(b.w, 256) - Math.min(a.w, 256) : a.weak ? 1 : -1);
  }
  function urlsFromDrop(dt) {
    const out2 = [];
    let title = "";
    const list = dt.getData("text/uri-list");
    if (list) out2.push(...list.split(/\r?\n/).filter((s) => s && s[0] !== "#"));
    const moz = dt.getData("text/x-moz-url");
    if (moz) {
      const [u, t] = moz.split(/\r?\n/);
      if (u && !out2.length) out2.push(u);
      if (t) title = t;
    }
    const html = dt.getData("text/html");
    if (html && !title) {
      const a = new DOMParser().parseFromString(html, "text/html").querySelector("a[href]");
      if (a) {
        if (!out2.length) out2.push(a.href);
        title = a.textContent.trim();
      }
    }
    if (!out2.length) out2.push(...(dt.getData("text/plain") || "").split(/\s+/));
    return { urls: out2, title: title.slice(0, 80) };
  }
  function mount2(root) {
    let links = [];
    let removed = /* @__PURE__ */ new Set();
    let nextId = 1, qTotal = 0, qDone = 0;
    const status = statusBar();
    const tiles = h("ul.ld-tiles");
    const urlIn = h("input.ld-input", { type: "text", placeholder: "https://example.com", autocomplete: "off", spellcheck: "false" });
    const zone = h(
      "section.ld-drop",
      { tabindex: "0" },
      h("p.ld-drop-main", { text: "Drag a link, a tab\u2019s address-bar icon, or a bookmark here" }),
      h("p.ld-drop-sub", { text: "or paste (Ctrl+V) / type below \u2014 several URLs at once is fine" }),
      h(
        "form.ld-form",
        { onsubmit: (e) => {
          e.preventDefault();
          add(urlIn.value.split(/\s+/));
          urlIn.value = "";
        } },
        urlIn,
        h("button.app-btn", { type: "submit", text: "ADD" })
      )
    );
    const btn2 = (label, tip, fn) => h("button.app-btn", { type: "button", title: tip, onclick: fn, text: label });
    root.append(h(
      "div.app.app-linkdock",
      null,
      h(
        "div.app-bar",
        null,
        h("h3", { text: "DROP A URL" }),
        h(
          "div.app-actions",
          null,
          jsonPicker(
            "LOAD",
            (data, name) => {
              const n = ingest(data);
              save();
              status.set("loaded " + n + " new from " + name, "ok", 100);
            },
            (msg) => status.set(msg, "err")
          ),
          btn2("COPY JSON", "Copy links.json to the clipboard", copyJson),
          btn2("EXPORT", "Download links.json \u2014 commit it as data/links.json", download),
          btn2("CLEAR", "Remove every tile from this browser\u2019s draft", clearAll)
        )
      ),
      h("div.app-statusrow", null, status.el),
      zone,
      tiles
    ));
    function tick2(label) {
      const pct = qTotal ? Math.round(qDone / qTotal * 100) : 100;
      status.set(qDone < qTotal ? "probing icons " + qDone + "/" + qTotal + " \u2014 " + label : links.length + " link" + (links.length === 1 ? "" : "s") + " \xB7 icons resolved", "info", pct);
    }
    function enqueue(list) {
      if (!list.length) return;
      qTotal += list.length;
      tick2(list[0].host);
      list.forEach((l) => resolve(l).finally(() => {
        qDone++;
        tick2(l.host);
      }));
    }
    async function resolve(link) {
      link.state = "probing";
      draw2(link);
      const ranked = rank(await Promise.all(candidatesFor(new URL(link.url)).map(probe)));
      link.candidates = ranked;
      if (!link.icon || link.auto) {
        link.icon = ranked.length ? ranked[0].src : "";
        link.iconSource = ranked.length ? ranked[0].label : "none found";
        link.auto = true;
      }
      link.state = ranked.length ? "done" : "failed";
      draw2(link);
      save();
    }
    function make(u, title, icon, iconSource) {
      return {
        id: nextId++,
        url: u.href,
        host: bareHost(u),
        title: title || bareHost(u),
        icon: icon || "",
        iconSource: iconSource || "",
        candidates: [],
        state: "done",
        auto: !icon
      };
    }
    function add(raw, titleHint) {
      const fresh = [];
      for (const r of raw) {
        const u = normUrl(r);
        if (!u) continue;
        if (links.some((l2) => l2.url === u.href)) {
          status.set("already docked: " + bareHost(u));
          continue;
        }
        removed.delete(u.href);
        const l = make(u, raw.length === 1 ? titleHint : "");
        links.push(l);
        fresh.push(l);
      }
      save();
      enqueue(fresh);
    }
    function ingest(data) {
      const arr = Array.isArray(data) ? data : data && Array.isArray(data.links) ? data.links : null;
      if (!arr) throw new Error('expected {"links":[...]}');
      const fresh = [];
      for (const e of arr) {
        const u = normUrl(e.url);
        if (!u || links.some((l2) => l2.url === u.href) || removed.has(u.href)) continue;
        const l = make(u, e.title, e.icon, e.iconSource);
        links.push(l);
        draw2(l);
        if (!l.icon) fresh.push(l);
      }
      enqueue(fresh);
      return arr.length;
    }
    function remove(id) {
      const i = links.findIndex((l) => l.id === id);
      if (i < 0) return;
      removed.add(links[i].url);
      links.splice(i, 1);
      const el3 = tiles.querySelector('[data-id="' + id + '"]');
      if (el3) el3.remove();
      save();
      tick2("");
    }
    function clearAll() {
      if (!links.length || !confirm("Remove all " + links.length + " tiles from this browser\u2019s draft?")) return;
      links.forEach((l) => removed.add(l.url));
      links = [];
      tiles.replaceChildren();
      save();
      status.set("cleared \u2014 data/links.json in the repo is untouched until you export and commit", "info", 100);
    }
    function iconBox(link) {
      const ph = () => h("span.ph", { text: link.state === "probing" ? "\u2026" : (link.host[0] || "?").toUpperCase() });
      const box2 = h("div.ld-icon");
      if (link.icon) {
        const img = h("img", { alt: "", referrerpolicy: "no-referrer", src: link.icon });
        img.onerror = () => box2.replaceChildren(ph());
        box2.append(img);
      } else box2.append(ph());
      return box2;
    }
    function draw2(link) {
      let li = tiles.querySelector('[data-id="' + link.id + '"]');
      if (!li) {
        li = h("li.ld-tile", { "data-id": link.id });
        tiles.append(li);
      }
      li.dataset.state = link.state;
      const title = h("input.ld-title", { value: link.title, spellcheck: "false" });
      title.addEventListener("change", () => {
        link.title = title.value.trim() || link.host;
        save();
      });
      const best = link.candidates.find((c) => c.src === link.icon);
      const src2 = link.state === "probing" ? h("div.ld-src", { text: "probing\u2026" }) : h("div.ld-src", null, "icon: ", h("b", { text: link.iconSource || "\u2014" }), best && best.w ? " \xB7 " + best.w + "\xD7" + best.h + "px" : "");
      const alts = link.candidates.length > 1 ? h("div.ld-alts", null, link.candidates.map((c) => h("button.ld-alt" + (c.src === link.icon ? ".on" : ""), {
        type: "button",
        title: c.label + " \xB7 " + c.w + "\xD7" + c.h,
        onclick: () => {
          link.icon = c.src;
          link.iconSource = c.label;
          link.auto = false;
          draw2(link);
          save();
        }
      }, h("img", { src: c.src, alt: "", referrerpolicy: "no-referrer" })))) : null;
      li.replaceChildren(...[
        h(
          "div.ld-head",
          null,
          iconBox(link),
          h("div.ld-text", null, title, h("a.ld-url", { href: link.url, target: "_blank", rel: "noopener", text: link.url }))
        ),
        src2,
        alts,
        h(
          "div.ld-actions",
          null,
          link.icon ? h("button.app-btn", { type: "button", text: "SAVE ICON", title: "Download the selected icon", onclick: () => saveIcon(link) }) : null,
          h("button.app-btn", { type: "button", text: "RE-PROBE", onclick: () => {
            link.auto = true;
            enqueue([link]);
          } }),
          h("button.app-btn.danger", { type: "button", text: "REMOVE", onclick: () => remove(link.id) })
        )
      ].filter(Boolean));
    }
    const EXT = {
      "image/png": "png",
      "image/x-icon": "ico",
      "image/vnd.microsoft.icon": "ico",
      "image/svg+xml": "svg",
      "image/jpeg": "jpg",
      "image/gif": "gif",
      "image/webp": "webp"
    };
    async function saveIcon(link) {
      status.set("fetching icon for " + link.host + "\u2026", "info", 40);
      try {
        const res = await fetch(link.icon, { mode: "cors", referrerPolicy: "no-referrer" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const blob = await res.blob();
        const type = (blob.type || "").split(";")[0];
        if (!type.startsWith("image/")) throw new Error("not an image (" + (type || "no type") + ")");
        const fromUrl = (new URL(link.icon).pathname.match(/\.(png|ico|svg|jpe?g|gif|webp)$/i) || [])[1];
        const ext = EXT[type] || (fromUrl || "png").toLowerCase();
        const a = h("a", { href: URL.createObjectURL(blob), download: link.host.replace(/[^a-z0-9.-]/gi, "_") + "." + ext });
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1e3);
        status.set("saved " + link.host + "." + ext + " (" + (blob.size / 1024).toFixed(1) + " KB)", "ok", 100);
      } catch (e) {
        window.open(link.icon, "_blank", "noopener");
        status.set(link.host + "\u2019s server blocks direct download \u2014 opened the icon in a new tab: right-click \u2192 Save image as", "warn", 100);
      }
    }
    const exportObj = () => ({
      updated: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      links: links.map((l) => ({ title: l.title, url: l.url, icon: l.icon, iconSource: l.iconSource }))
    });
    const exportText = () => JSON.stringify(exportObj(), null, 2) + "\n";
    function save() {
      store.set(DRAFT_KEY, { links: exportObj().links, removed: [...removed] });
    }
    function download() {
      const a = h("a", { href: URL.createObjectURL(new Blob([exportText()], { type: "application/json" })), download: "links.json" });
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1e3);
      status.set("exported " + links.length + " links \u2192 links.json (commit as data/links.json)", "ok", 100);
    }
    async function copyJson() {
      try {
        await navigator.clipboard.writeText(exportText());
        status.set("links.json copied to clipboard", "ok", 100);
      } catch (e) {
        status.set("clipboard blocked \u2014 use EXPORT instead", "err");
      }
    }
    let depth = 0;
    const on2 = (ev) => {
      ev.preventDefault();
      depth++;
      zone.classList.add("over");
    };
    const leave = () => {
      if (--depth <= 0) {
        depth = 0;
        zone.classList.remove("over");
      }
    };
    const over = (ev) => {
      ev.preventDefault();
      ev.dataTransfer.dropEffect = "copy";
    };
    const drop = (ev) => {
      ev.preventDefault();
      depth = 0;
      zone.classList.remove("over");
      const f = ev.dataTransfer.files && ev.dataTransfer.files[0];
      if (f && /json$/i.test(f.name)) {
        f.text().then((t) => {
          const n = ingest(JSON.parse(t));
          save();
          status.set("loaded " + n + " from " + f.name, "ok", 100);
        }).catch((e) => status.set(f.name + ": " + e.message, "err"));
        return;
      }
      const { urls, title } = urlsFromDrop(ev.dataTransfer);
      if (!urls.some(normUrl)) {
        status.set("nothing URL-shaped in that drop", "err");
        return;
      }
      add(urls, title);
    };
    const paste = (ev) => {
      if (ev.target.closest && ev.target.closest("input, textarea")) return;
      const t = ev.clipboardData.getData("text/plain");
      if (t) add(t.split(/\s+/));
    };
    addEventListener("dragenter", on2);
    addEventListener("dragleave", leave);
    addEventListener("dragover", over);
    addEventListener("drop", drop);
    document.addEventListener("paste", paste);
    (async () => {
      const draft = store.get(DRAFT_KEY, null);
      if (draft && Array.isArray(draft.removed)) removed = new Set(draft.removed);
      status.set("fetching " + SOURCE2 + "\u2026", "info", 20);
      const r = await loadJSON(SOURCE2);
      try {
        if (r.data) ingest(r.data);
      } catch (e) {
        status.set(SOURCE2 + ": " + e.message, "err");
      }
      if (r.error) status.set(r.error, "err");
      const repo = links.length;
      if (draft && Array.isArray(draft.links)) ingest({ links: draft.links });
      const local = links.length - repo;
      if (!qTotal) {
        const parts = [r.offline ? "opened from disk (repo list not readable here \u2014 use LOAD)" : repo + " from " + SOURCE2];
        if (local > 0) parts.push(local + " from unexported local draft");
        status.set("ready \xB7 " + parts.join(" \xB7 ") + " \xB7 drop a URL", "ok", 100);
      }
    })();
    return function destroy() {
      removeEventListener("dragenter", on2);
      removeEventListener("dragleave", leave);
      removeEventListener("dragover", over);
      removeEventListener("drop", drop);
      document.removeEventListener("paste", paste);
    };
  }

  // js/apps/index.js
  var REGISTRY = { calendar: calendar_exports, linkdock: linkdock_exports };
  var teardown2 = null;
  var has = (id) => Object.prototype.hasOwnProperty.call(REGISTRY, id);
  function open(id, root) {
    close();
    if (!has(id)) {
      root.textContent = "Unknown tool: " + id;
      return;
    }
    try {
      teardown2 = REGISTRY[id].mount(root) || null;
    } catch (e) {
      console.error("[nh tools] " + id + " failed to mount:", e);
      root.textContent = "This tool failed to start \u2014 see the console.";
    }
  }
  function close() {
    if (teardown2) {
      try {
        teardown2();
      } catch (e) {
        console.error("[nh tools] teardown:", e);
      }
    }
    teardown2 = null;
  }

  // js/deck.js
  var $2 = (s) => document.querySelector(s);
  var N = () => CFG.panels.length;
  var pad2 = (n) => String(n + 1).padStart(2, "0");
  var stage = null;
  var deck = null;
  var printer = null;
  var top = null;
  var view = null;
  var toggles = null;
  var cards = [];
  var placards = [];
  var toolCards = [];
  var ang = 0;
  var vel = 0;
  var target2 = null;
  var snapping = false;
  var dragging = false;
  var moved = 0;
  var lastX = 0;
  var lastT2 = 0;
  var expanded = 0;
  var live2 = false;
  var mini = false;
  var openIdx = -1;
  var openTool = null;
  var pw = 200;
  var R = 160;
  var lastFace = -1;
  function speak(i) {
    const keys = CFG.voice && CFG.voice.panel || [];
    const k = keys[i];
    if (k && current() !== k) play(k);
  }
  var GLYPH = {
    calendar: '<svg class="g" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="1.5" y="2.5" width="13" height="12"/><path d="M1.5 6h13M5 1v3M11 1v3M4 9h2M7 9h2M10 9h2M4 12h2M7 12h2"/></svg>',
    link: '<svg class="g" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M6.5 9.5l3-3M7 4.5l1.6-1.6a2.6 2.6 0 0 1 3.7 3.7L10.7 8.2M9 11.5l-1.6 1.6a2.6 2.6 0 0 1-3.7-3.7L5.3 7.8"/></svg>'
  };
  function init7() {
    stage = $2("#deck-stage");
    deck = $2("#deck");
    printer = $2("#printer");
    top = $2("#top");
    view = $2("#view");
    toggles = $2("#toggles");
    CFG.panels.forEach((p2, i) => {
      const c = document.createElement("div");
      c.className = "placard";
      c.setAttribute("role", "button");
      c.tabIndex = -1;
      c.innerHTML = '<span class="n">' + pad2(i) + '</span><span class="l">' + p2.label + '</span><span class="b">' + p2.blurb + "</span>";
      c.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (live2 && !mini && moved < 6) {
          speak(i);
          open2(i);
        }
      });
      deck.appendChild(c);
      placards.push(c);
      const b = document.createElement("button");
      b.className = "card";
      b.type = "button";
      b.innerHTML = '<span class="n">' + pad2(i) + '</span><span class="l">' + p2.label + '</span><span class="b">' + p2.blurb + "</span>";
      b.addEventListener("click", () => {
        if (live2) {
          if (mini) close2();
          swingTo(i);
        }
      });
      b.addEventListener("dblclick", (ev) => {
        ev.preventDefault();
        if (live2) {
          speak(i);
          open2(i);
        }
      });
      b.addEventListener("mouseenter", () => {
        if (live2 && !mini) swingTo(i);
      });
      b.addEventListener("focus", () => {
        if (live2 && !mini) swingTo(i);
      });
      top.appendChild(b);
      cards.push(b);
    });
    const T = CFG.tools || [];
    top.style.setProperty("--tools", T.length);
    if (T.length) {
      const sep = document.createElement("span");
      sep.className = "top-sep";
      sep.setAttribute("aria-hidden", "true");
      top.appendChild(sep);
    }
    T.forEach((t, i) => {
      const b = document.createElement("button");
      b.className = "card tool";
      b.type = "button";
      b.dataset.tool = t.id;
      b.title = t.blurb;
      b.innerHTML = '<span class="n">T' + (i + 1) + '</span><span class="l">' + (GLYPH[t.glyph] || "") + "<span>" + t.label + '</span></span><span class="b">' + t.blurb + "</span>";
      b.addEventListener("click", () => {
        if (live2) openToolById(t.id);
      });
      top.appendChild(b);
      toolCards.push(b);
    });
    stage.addEventListener("pointerdown", (e) => {
      if (!live2 || mini) return;
      dragging = true;
      snapping = false;
      moved = 0;
      lastX = e.clientX;
      lastT2 = performance.now();
      stage.classList.add("grabbing");
    });
    addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const now = performance.now(), dx = e.clientX - lastX, dt = Math.max(1, now - lastT2);
      moved += Math.abs(dx);
      ang += dx * 0.35;
      vel = dx * 0.35 / dt * 16;
      lastX = e.clientX;
      lastT2 = now;
    });
    const release = () => {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove("grabbing");
      snapNearest();
      setTimeout(() => {
        moved = 0;
      }, 0);
    };
    addEventListener("pointerup", release);
    addEventListener("pointercancel", release);
    $2("#prev").addEventListener("click", () => step(-1));
    $2("#next").addEventListener("click", () => step(1));
    $2("#view-close").addEventListener("click", close2);
    addEventListener("keydown", (e) => {
      if (!live2) return;
      if (e.key === "Escape" && mini) {
        close2();
        return;
      }
      if (mini) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      }
    });
    onResize(place2);
    place2();
  }
  var placeRetry = 0;
  function place2() {
    if (!stage) return;
    const r = rect(mini ? "L4" : "main");
    if (!r || r.width < 40 || r.height < 40) {
      if (placeRetry < 90) {
        placeRetry++;
        requestAnimationFrame(place2);
      }
      return;
    }
    placeRetry = 0;
    const inset = mini ? 6 : 10;
    stage.style.left = r.left + inset + "px";
    stage.style.top = r.top + inset + "px";
    stage.style.width = Math.max(60, r.width - inset * 2) + "px";
    stage.style.height = Math.max(60, r.height - inset * 2) + "px";
    const W3 = r.width - inset * 2, H3 = r.height - inset * 2;
    const lift = mini ? 0 : Math.round(H3 * (CFG.deck && CFG.deck.lift || 0));
    sizeCards(W3, H3, lift);
    deck.style.top = "calc(50% - " + lift + "px)";
    printer.style.top = "calc(50% - " + lift + "px)";
    if (toggles) toggles.style.transform = "translateY(" + -lift + "px)";
  }
  function sizeCards(w, h2, lift) {
    const D = CFG.deck || {};
    const P2 = D.perspective || 1400, RK = D.radius || 0.82, AR = D.aspect || 0.63;
    const M = D.margin || 14;
    const ts = mini ? 12 : Math.max(
      D.togMin || 13,
      Math.min(D.togMax || 21, w * (D.togScale || 0.0165))
    );
    if (toggles) toggles.style.setProperty("--ts", ts.toFixed(1) + "px");
    const TOG = ts * 4.6;
    if (mini) {
      pw = Math.max(64, Math.min(w * 0.44, h2 * 0.72, 96));
    } else {
      const fits = (c) => {
        const rad = c * RK;
        if (rad >= P2 * 0.85) return false;
        const sc = P2 / (P2 - rad);
        const halfW = c / 2 * sc, halfH = c * AR / 2 * sc;
        if (halfH > h2 / 2 - lift - M) return false;
        if (halfH > h2 / 2 - TOG - M) return false;
        if (Math.max(rad + c * 0.25, halfW) > w / 2 - M) return false;
        return true;
      };
      let lo = 48, hi = Math.max(64, Math.min(w, h2) * 1.4);
      for (let i = 0; i < 30; i++) {
        const mid = (lo + hi) / 2;
        if (fits(mid)) lo = mid;
        else hi = mid;
      }
      pw = Math.max(64, Math.min(lo, D.maxCard || 560) * (D.scale || 1));
    }
    const ph = pw * AR;
    R = pw * RK;
    stage.style.setProperty("--pw", pw.toFixed(1) + "px");
    stage.style.setProperty("--ph", ph.toFixed(1) + "px");
  }
  var stepAng = () => 360 / N();
  var facing = () => (Math.round(-ang / stepAng()) % N() + N()) % N();
  function swingTo(i) {
    target2 = -i * stepAng();
    snapping = true;
    vel = 0;
    mark(i);
  }
  function step(d) {
    swingTo(((facing() + d) % N() + N()) % N());
    snap();
  }
  function snapNearest() {
    swingTo(facing());
  }
  function mark(i) {
    cards.forEach((b, k) => b.setAttribute("aria-current", k === i ? "true" : "false"));
    placards.forEach((c, k) => {
      c.classList.toggle("face", k === i);
      c.tabIndex = k === i && live2 && !mini ? 0 : -1;
    });
  }
  function dockHint(on2) {
    const slot2 = slot("L4");
    if (!slot2) return;
    slot2.classList.toggle("hint", !!on2 && !mini);
  }
  function dock3() {
    mini = true;
    stage.classList.add("mini");
    slot("L4").classList.add("filled");
    place2();
    dock();
  }
  function showView(num, title, cls) {
    view.querySelector(".n").textContent = num;
    view.querySelector("h2").textContent = title;
    view.classList.remove("pdf", "app-host");
    if (cls) view.classList.add(cls);
    view.classList.add("on");
    view.setAttribute("aria-hidden", "false");
    toggles.classList.remove("on");
    $2("#view-close").focus();
    return view.querySelector(".body");
  }
  function clearView() {
    close();
    const body = view.querySelector(".body");
    body.replaceChildren();
    view.classList.remove("on", "pdf", "app-host");
    view.setAttribute("aria-hidden", "true");
  }
  function setHash(id) {
    const url2 = location.pathname + location.search + (id ? "#" + id : "");
    try {
      history.replaceState(null, "", url2);
    } catch (e) {
    }
  }
  var RENDER = {
    pdf(p2) {
      const dl = p2.download || p2.target.split("/").pop();
      const pages = Array.isArray(p2.pages) ? p2.pages : [];
      return (p2.body || "") + '<div class="pdf-bar"><a class="pdf-btn" href="' + p2.target + '" download="' + dl + '">Download PDF</a><a class="pdf-btn" href="' + p2.target + '" target="_blank" rel="noopener">Open in new tab</a></div><div class="pdf-frame">' + (pages.length ? '<div class="pdf-pages">' + pages.map((src2, n) => '<img src="' + src2 + '" alt="' + p2.label + ", page " + (n + 1) + '"' + (n ? ' loading="lazy"' : "") + ">").join("") + "</div>" : location.protocol === "file:" ? '<p class="pdf-note">No rendered pages are built yet, and from disk the browser will not draw a pdf inside the page. Use <b>Open in new tab</b> above, or run <code>tools/build.sh</code>.</p>' : '<iframe src="' + p2.target + '#view=FitH" title="' + p2.label + '" loading="lazy"></iframe>') + "</div>";
    },
    stub(p2) {
      return (p2.body || "") + '<p style="color:var(--ink-dim)">Nothing wired to this slot yet. Define it in <code>docs/panels.csv</code> and <code>js/config.js</code>.</p>';
    },
    page(p2) {
      return p2.body || "<p>" + p2.blurb + "</p>";
    }
  };
  function open2(i) {
    const p2 = CFG.panels[i];
    clearView();
    openIdx = i;
    openTool = null;
    swingTo(i);
    dock3();
    const isPdf = p2.kind === "pdf" && p2.target;
    const body = showView(pad2(i), p2.label, isPdf ? "pdf" : "");
    body.innerHTML = (RENDER[isPdf ? "pdf" : p2.kind] || RENDER.page)(p2);
    markTools();
    setHash("");
  }
  function openToolById(id) {
    const t = (CFG.tools || []).find((x) => x.id === id);
    if (!t || !has(id)) return false;
    if (mini && openTool === id) return true;
    clearView();
    openIdx = -1;
    openTool = id;
    if (!mini) dock3();
    const n = "T" + ((CFG.tools || []).indexOf(t) + 1);
    open(id, showView(n, t.label, "app-host"));
    markTools();
    setHash(id);
    return true;
  }
  function openToolFromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    return id ? openToolById(id) : false;
  }
  var hasTool = (id) => !!(CFG.tools || []).find((x) => x.id === id) && has(id);
  function markTools() {
    toolCards.forEach((b) => b.setAttribute("aria-current", b.dataset.tool === openTool ? "true" : "false"));
  }
  function close2() {
    if (!mini) return;
    mini = false;
    openIdx = -1;
    openTool = null;
    stage.classList.remove("mini");
    slot("L4").classList.remove("filled");
    clearView();
    toggles.classList.add("on");
    place2();
    mark(facing());
    markTools();
    setHash("");
    if (cards[0]) cards[Math.max(0, facing())].focus();
  }
  function boot(pDeck, pPrint, pCards, pLive) {
    expanded = easeIO(clamp01(pDeck));
    if (pDeck > 0 && !stage.classList.contains("on")) {
      stage.classList.add("on");
      place2();
    }
    printer.classList.toggle("on", pDeck > 0.35 && pPrint < 1);
    const pr = clamp01(pPrint);
    placards.forEach((c, i) => {
      const wasOn = c.classList.contains("printed");
      const nowOn = pr > i / N();
      if (nowOn && !wasOn) deal();
      c.classList.toggle("printed", nowOn);
    });
    if (pCards > 0) dealIn();
    if (pLive >= 1 && !live2) {
      live2 = true;
      toggles.classList.add("on");
      mark(facing());
    }
  }
  var hintShown = null;
  function syncHint() {
    const on2 = live2 && !mini;
    if (on2 !== hintShown) {
      hintShown = on2;
      dockHint(on2);
    }
  }
  function frame7(now) {
    if (!deck) return;
    syncHint();
    if (!dragging && !snapping) {
      if (mini) ang += 0.16;
      else {
        ang += vel;
        vel *= 0.94;
        if (Math.abs(vel) < 0.02) vel = 0;
      }
    }
    if (snapping && target2 !== null) {
      let d = target2 - ang;
      while (d > 180) d -= 360;
      while (d < -180) d += 360;
      ang += d * 0.16;
      if (Math.abs(d) < 0.15) {
        ang = target2;
        snapping = false;
      }
    }
    const tilt = -58 + 46 * expanded;
    const r = R * (0.25 + 0.75 * expanded);
    deck.style.transform = "rotateX(" + tilt.toFixed(2) + "deg) rotateY(" + ang.toFixed(2) + "deg)";
    placards.forEach((c, i) => {
      c.style.transform = "rotateY(" + i * stepAng() + "deg) translateZ(" + r.toFixed(1) + "px) rotateX(" + (-tilt).toFixed(2) + "deg)";
    });
    if (live2 && !mini) {
      const f = facing();
      if (f !== lastFace) {
        lastFace = f;
        mark(f);
      }
    }
  }
  function reset4() {
    close();
    live2 = false;
    mini = false;
    openIdx = -1;
    openTool = null;
    ang = 0;
    vel = 0;
    target2 = null;
    snapping = false;
    expanded = 0;
    lastFace = -1;
    stage.classList.remove("on", "mini", "grabbing");
    stage.style.left = stage.style.top = stage.style.width = stage.style.height = "";
    placeRetry = 0;
    const dockSlot = slot("L4");
    if (dockSlot) dockSlot.classList.remove("filled");
    clearView();
    markTools();
    setHash("");
    toggles.classList.remove("on");
    printer.classList.remove("on");
    placards.forEach((c) => {
      c.classList.remove("printed", "face");
      c.tabIndex = -1;
    });
    cards.forEach((b) => b.setAttribute("aria-current", "false"));
  }
  function ensureMain() {
    if (!stage) return;
    mini = false;
    openIdx = -1;
    openTool = null;
    stage.classList.remove("mini");
    const slot2 = slot("L4");
    if (slot2) slot2.classList.remove("filled");
    if (view) clearView();
    markTools();
    place2();
  }
  function jumpToLive() {
    expanded = 1;
    stage.classList.add("on");
    placards.forEach((c) => c.classList.add("printed"));
    dealIn();
    live2 = true;
    toggles.classList.add("on");
    mark(0);
    swingTo(0);
    place2();
  }

  // js/main.js
  var $3 = (s) => document.querySelector(s);
  var reduced2 = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var act = 1;
  var t02 = 0;
  var entered = false;
  var didFrame = false;
  var didMount = false;
  var didPlacard = false;
  var didReady = false;
  var soundOn = () => {
  };
  var stageEl = $3("#stage");
  function fire2() {
    if (entered || !isLive()) return;
    unlock();
    fire();
  }
  function enter2() {
    if (entered) return;
    entered = true;
    act = 2;
    t02 = performance.now();
    stageEl.classList.add("gone");
    show();
    show2();
    try {
      sessionStorage.setItem("nh_seen", "1");
    } catch (e) {
    }
  }
  function skipToDesk() {
    act = 2;
    entered = true;
    t02 = performance.now() - TOTAL - 1;
    stageEl.classList.add("gone");
    show2();
    frameIn();
    show();
    dock2(rect("L2"));
    sizeCubeInRail();
    jumpToLive();
    ensureMain();
    requestAnimationFrame(() => place2());
    setTimeout(() => place2(), 260);
    didFrame = didMount = didPlacard = didReady = true;
  }
  function sizeCubeInRail(tries) {
    const d = $3("#pelagic-dock");
    if (!d) return;
    let r = rect("L1");
    if (!r || !r.width || !r.height) r = d.getBoundingClientRect();
    const s = Math.round(Math.min(r.width, r.height) * 0.6);
    if (s > 0) {
      d.style.setProperty("--cs", s + "px");
      resize();
      return;
    }
    if ((tries || 0) < 30) requestAnimationFrame(() => sizeCubeInRail((tries || 0) + 1));
  }
  function backToSplash() {
    if (act === 1) return;
    act = 1;
    entered = false;
    didFrame = didMount = didPlacard = didReady = false;
    stop();
    loopStop();
    soundOn(false);
    reset4();
    teardown();
    undock();
    stageEl.classList.remove("gone");
    reset();
    reset2();
    try {
      sessionStorage.removeItem("nh_seen");
    } catch (e) {
    }
    $3("#enterBtn").focus();
  }
  var loopFailed = false;
  function loop(now) {
    try {
      tick(now);
    } catch (e) {
      if (!loopFailed) {
        loopFailed = true;
        console.error("[nh] frame failed:", e);
      }
    }
    requestAnimationFrame(loop);
  }
  function tick(now) {
    drive(frame4(), playing());
    if (act === 1) {
      frameAll(frame(now), isFiring());
      frame5(now);
    } else {
      const e = Math.min(TOTAL, now - t02);
      frame6(e);
      if (!didFrame && p("FRAME", e) > 0) {
        didFrame = true;
        frameIn();
        dock2(rect("L2"));
        dock();
      }
      if (!didMount && p("MOUNT", e) > 0.15) {
        didMount = true;
        sizeCubeInRail();
      }
      if (!didPlacard && p("PLACARD", e) > 0.2) {
        didPlacard = true;
        drawPlacard();
      }
      if (!didReady && e >= TOTAL) {
        didReady = true;
        shot(CFG.bootSfx.ready, () => play(CFG.voice.boot));
      }
      boot(p("DECK", e), p("PRINT", e), p("CARDS", e), p("LIVE", e));
      frame7(now);
      if (didPlacard) drawPlacardFrame(now);
      frame3(now);
    }
  }
  var preEl = $3("#preload");
  var preBar = $3("#preload .bar i");
  var prePct = $3("#preload .pct");
  var preHide = 0;
  function onPreload(p2) {
    if (!preEl) return;
    const pct = Math.round(p2.pct);
    if (preBar) preBar.style.width = pct + "%";
    if (prePct) prePct.textContent = p2.finished ? "READY" : pct + "%";
    preEl.setAttribute("data-count", p2.done + "/" + p2.total);
    if (p2.url && !p2.ok) {
      console.warn("[nh] audio unavailable, that cue will be silent:", p2.url);
      preEl.classList.add("warn");
    }
    if (p2.finished) {
      preEl.classList.add("done");
      clearTimeout(preHide);
      preHide = setTimeout(() => preEl.classList.add("gone"), 1400);
    }
  }
  async function start() {
    window.__nh_booted = true;
    try {
      await load();
    } catch (e) {
    }
    init($3("#splash-canvas"), $3("#enterBtn"), $3("#sitename"), $3("#splash-wipe"));
    onEnter(enter2);
    init4($3("#sitename"));
    init2($3("#power"));
    init3($3("#pelagic-dock"));
    init5($3("#term"));
    init6();
    init7();
    onResize(() => {
      place(rect("L2"));
      place2();
    });
    const mainEl = $3("#main");
    if (mainEl && window.ResizeObserver) {
      let seen2 = 0;
      new ResizeObserver(() => {
        const w = mainEl.offsetWidth;
        if (w > 40 && w !== seen2) {
          seen2 = w;
          place2();
          place(rect("L2"));
        }
      }).observe(mainEl);
    }
    addEventListener("load", () => {
      place2();
      place(rect("L2"));
    });
    requestAnimationFrame(() => warm(onPreload));
    const snd = $3("#sndToggle");
    soundOn = (on2) => {
      const label = on2 ? "Sound on" : "Sound off";
      snd.setAttribute("aria-pressed", on2 ? "true" : "false");
      snd.setAttribute("aria-label", label);
      snd.title = label;
      setBedAllowed(on2);
      if (on2) {
        unlock();
        loopArm(CFG.splash.loop);
      }
    };
    soundOn(false);
    snd.addEventListener("click", (e) => {
      e.stopPropagation();
      soundOn(snd.getAttribute("aria-pressed") !== "true");
    });
    $3("#enterBtn").addEventListener("click", () => soundOn(true));
    $3("#enterBtn").addEventListener("click", fire2);
    const dock4 = $3("#pelagic-dock");
    dock4.style.cursor = "pointer";
    dock4.setAttribute("aria-hidden", "false");
    dock4.addEventListener("click", () => {
      if (act !== 1 && current() !== CFG.voice.cube) play(CFG.voice.cube);
    });
    $3("#back").addEventListener("click", backToSplash);
    addEventListener("keydown", (e) => {
      if (act === 1 && isLive() && e.key === "F11") fire2();
    });
    let rz;
    addEventListener("resize", () => {
      clearTimeout(rz);
      rz = setTimeout(() => {
        size();
        measure();
        if (act !== 1) sizeCubeInRail();
        resize2();
      }, 120);
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        drawPlacard();
        place2();
        measure();
      });
    }
    let seen = false;
    try {
      seen = sessionStorage.getItem("nh_seen") === "1";
    } catch (e) {
    }
    const deep = location.hash.length > 1 && hasTool(decodeURIComponent(location.hash.slice(1)));
    requestAnimationFrame(loop);
    if (reduced2 || seen || deep) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        skipToDesk();
        if (deep) setTimeout(() => openToolFromHash(), 120);
      }));
    }
    addEventListener("hashchange", () => {
      if (act !== 1) openToolFromHash();
    });
  }
  start();
  addEventListener("error", (e) => {
    const t = e.target;
    if (!t || t === window || !t.tagName) return;
    console.warn(
      "[nh] resource failed:",
      t.tagName,
      t.currentSrc || t.src || t.href || "(empty src \u2014 resolves to the page URL)",
      t
    );
  }, true);
  var MO = window.MutationObserver;
  if (MO) new MO((muts) => {
    for (const m of muts) for (const n of m.addedNodes) {
      if (!n.tagName) continue;
      const frames = n.tagName === "IFRAME" ? [n] : n.querySelectorAll ? n.querySelectorAll("iframe") : [];
      for (const f of frames) {
        console.warn(
          "[nh] frame created \u2014 raw src:",
          f.getAttribute("src"),
          "| resolved:",
          f.src,
          f
        );
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
