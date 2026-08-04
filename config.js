// Central configuration. Everything tunable lives here.
export const CFG = {
  domain: 'nathanherling.com',
  cmd: './init_home_nathan_herling',
  prompt: '[shell]&gt; ',
  promptText: '[shell]> ',
  etchPrompt: 'press to enter nathanherling.com',

  // drop the track in assets/audio/ and name it here; starts on EXEC
  track: '',

  crt: {
    pixel: 3,      // pixel block size
    chroma: 5,     // channel split amount
    gran: 28,      // horizontal granulation
    noise: 18,     // procedural noise
    scan: 60,      // scanline darkness
    sigFade: 2600  // ms for the signature to come up on the phosphor
  },

  // Act 2 beats, ms. See docs/sequence.csv
  beats: [
    { k: 'WIPE',    ms: 420  },
    { k: 'TYPE',    ms: 1300 },
    { k: 'EXEC',    ms: 250  },
    { k: 'MOVE',    ms: 1100 },
    { k: 'PLACARD', ms: 800  },
    { k: 'DESK',    ms: 1200 },
    { k: 'PRINT',   ms: 1600 },
    { k: 'LIVE',    ms: 600  }
  ],

  // desktop faces. slot 1 is live, 2-4 are stubs pending your input
  panels: [
    { label: 'CV',  kind: 'pdf',  target: 'assets/cv/nherling_cv.pdf', blurb: 'Curriculum vitae' },
    { label: 'TBD', kind: 'stub', target: '', blurb: 'panel 2 — not yet defined' },
    { label: 'TBD', kind: 'stub', target: '', blurb: 'panel 3 — not yet defined' },
    { label: 'TBD', kind: 'stub', target: '', blurb: 'panel 4 — not yet defined' }
  ]
};

export const TOTAL = CFG.beats.reduce((s, b) => s + b.ms, 0);
export const OFF = (() => { let a = 0; return CFG.beats.map(b => { const v = a; a += b.ms; return v; }); })();
export const idx = k => CFG.beats.findIndex(b => b.k === k);

export const ease   = t => 1 - Math.pow(1 - t, 3);
export const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const clamp01 = v => Math.max(0, Math.min(1, v));
