# nathanherling.com — STAGE A spec (lock-in reference)

stage: A [conceptual vetting] · rev 2 · supersedes the two-act spec

One page. Five acts. Acts 1 and 4/5 are untimed and wait for the user; acts 2
and 3 are a single uninterrupted timed run.

---

## 1. Cast

| name | what it is |
|---|---|
| TUBE | the CRT. Everything in act 1 happens inside it. |
| SIGNATURE | vector ink, traced from the scan. Lives on the phosphor. |
| PELAGIC | the rotating etch cube. **Inside the tube**, not beside it. |
| ETCH LAYER | the front glass. Laser-carved marks live here, not on the phosphor. |
| SHELL | `[shell]>_`, ported from init_home. |
| DECK | 4-face rotating placard carousel. |
| RAIL | the left column, four slots. |

---

## 2. Act 1 — SPLASH (untimed)

The tube loads **on the Helix_Splash metrics**. Those numbers are the contract;
`js/config.js → CFG.crt` is the only place they are written down.

    pixel 3 · chroma 5 · gran 28 · noise 18 · scroll 30 · scan 60
    flicker 30 · fade 4.0s · warm 0.5s · etch 1.0 · beam amber

Beats:

| beat | ms | what |
|---|---|---|
| WARM | 500 | black tube, static only |
| RESOLVE | 4000 | SIGNATURE resolves: block 46 → 3, chroma settles 27 → 5, shear decays. PELAGIC fades up inside the tube |
| ETCH · url | 1800 | laser carves `nathanherling.com` under the signature |
| ETCH · enter | 4800 | laser carves the `[PRESS TO ENTER]` button: border → scratch infill → text |
| READY | ∞ | button live, breathing; waits for the user |

Etch order is fixed: **url first, button second.** Both are separate jobs with
their own arm-in.

Cutting-head rules, carried forward and non-negotiable:

- the head starts centred in the tube and travels straight to its first cut,
  beams dark; that arrival **is** its first contact
- edge nodes fire only while a cut is in progress and go dark on the frame the
  cut completes — no trailing beams, no leftover mark at the last contact point
- completed cuts persist and glow; they do not re-animate

Tube composition, as fractions of the tube box (`CFG.frame`):

    signature   cy 0.33   w 0.60
    url         cy 0.505
    PELAGIC     cy 0.685  size 0.115
    button      cy 0.875

---

## 3. Act 2 — SEGUE (on press, 1.97 s)

| beat | ms | what |
|---|---|---|
| WIPE | 420 | bright horizontal band sweeps the tube |
| TYPE | 1300 | behind the wipe: SHELL, centred. `./init_home_nathan_herling` types itself with keystroke sfx |
| EXEC | 250 | enter thunk |

The press unlocks audio. Nothing autoplays with sound before it.

---

## 4. Act 3 — ESTABLISH (5.3 s, continuous with act 2)

| beat | ms | what |
|---|---|---|
| FRAME | 900 | rail and top-panel rules draw in; SHELL drifts to rail slot L2 |
| MOUNT | 700 | PELAGIC re-docks from the tube to rail slot L1 |
| PLACARD | 700 | rail slot L3 lights: a small screen carrying the signature and the url |
| DECK | 1100 | flat disc rakes up into the 3D DECK in the main area |
| PRINT | 1400 | centre printer lays 4 placards onto the deck faces |
| CARDS | 700 | the 4 top-panel cards deal in |
| LIVE | 500 | controls hand over to the user |

Everything drifts. Nothing snaps between positions.

---

## 5. Act 4 — MAIN UI (live)

    +----------+------------------------------------------+
    |   RAIL   |  TOP PANEL   [CV][02][03][04]            |
    |          +------------------------------------------+
    | L1 cube  |                                          |
    | L2 shell |          MAIN AREA                       |
    | L3 plaque|          rotating DECK                   |
    | L4 (open)|                                          |
    +----------+------------------------------------------+

Rail slots:

| slot | content |
|---|---|
| L1 | PELAGIC — design to be extended later |
| L2 | the shell terminal |
| L3 | small screen: signature over `nathanherling.com` |
| L4 | empty — reserved as the dock target for the minimised deck |

Deck controls, all three live at once:

1. **grab** — drag horizontally to spin, inertia, then snap to nearest face
2. **toggle** — prev/next buttons as an alternate route
3. **top-panel card click** — deck immediately swings that face flush to camera,
   shortest angular path

Top-panel cards mirror the deck faces one-to-one.

---

## 6. Act 5 — PANEL ACTION

Clicking a **deck face**:

1. the deck minimises out of the main area and docks into rail slot L4
2. the main area opens that panel's content
3. closing the panel returns the deck to the main area

Clicking a top-panel card only swings the deck (act 4 rule 3). The card is a
selector; the face is the door.

---

## 7. Panels — NEEDS INPUT

| slot | label | kind | target | status |
|---|---|---|---|---|
| 1 | CV | pdf | assets/cv/nherling_cv.pdf | live |
| 2 | TBD | stub | | stub |
| 3 | TBD | stub | | stub |
| 4 | TBD | stub | | stub |

Slots 2–4 are the open question for stage A. Nothing downstream is blocked by
them — they render as stubs.

---

## 8. Constraints carried forward

- no build step, no framework, no CDN at ship time
- the deck is CSS 3D, not three.js — nothing on this page needs a renderer
- `prefers-reduced-motion` jumps straight to the act 4 layout
- one run per session via `sessionStorage`
- self-host Orbitron + Share Tech Mono before ship
- add `assets/cv/nherling_cv.pdf` and a CNAME before ship

## 9. Out of scope

Backend, CMS, blog, analytics, multi-page routing. New ideas route back through
stage A.
