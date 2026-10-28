// ============ TOOL: WEEK PLANNER ============
// Weekly schedule over data/planner.json. Each term points at a course catalog
// (a gallery album's "groups" in data/gallery.json — see js/apps/courses.js),
// and lists "picks": which course, which of its sections, and which category
// (take / sit in / undecided — categories are data, add more freely).
//
// Week grid: one column per day, sections placed by time. Blocks that overlap
// are laid side by side in parallel lanes, never stacked. Click a block or a
// course chip to open the side panel — screenshots, section toggles, category,
// requirements — while the week stays on screen.
//
// Edits made in the panel are kept as a per-browser draft; EXPORT writes a new
// planner.json to commit. The repo file stays the source of truth.
//
// mount(root) builds everything inside root and returns destroy().

import { h, statusBar, loadJSON, jsonPicker, store } from './ui.js';
import { normalize as normCatalog, parseSlot, courseCard } from './courses.js';

const SOURCE = 'data/planner.json';
const DRAFT_KEY = 'nh-planner-draft-v1';
const UI_KEY = 'nh-planner-ui-v1';
const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const DAY_LABEL = { Mo: 'MON', Tu: 'TUE', We: 'WED', Th: 'THU', Fr: 'FRI', Sa: 'SAT', Su: 'SUN' };
const LANE_PX = 64;                 // narrowest a parallel block may get before the week scrolls sideways
const TYPE_ABBR = { Lecture: 'LEC', Laboratory: 'LAB', Discussion: 'DIS', Seminar: 'SEM', Studio: 'STU' };

const hm = s => { const m = /^(\d{1,2}):(\d{2})$/.exec(s || ''); return m ? +m[1] * 60 + +m[2] : null; };
function clock(min) {
  let hh = Math.floor(min / 60), mm = min % 60;
  const ap = hh >= 12 ? 'p' : 'a';
  hh = hh % 12 || 12;
  return mm ? hh + ':' + String(mm).padStart(2, '0') + ap : hh + ap;
}
const same = (a, b) => (a.same || []).includes(b.id) || (b.same || []).includes(a.id);

/* ---------- parallel lanes ----------
   Sort by start; sweep. A cluster is a run of blocks connected by overlap; each
   block takes the first lane free at its start, and every block in the cluster
   is drawn 1/lanes wide. Exported for testing. */
export function layoutDay(blocks) {
  blocks.sort((a, b) => a.start - b.start || b.end - a.end);
  let cluster = [], lanes = [], clusterEnd = -1;
  const close = () => { cluster.forEach(b => { b.lanes = lanes.length; }); cluster = []; lanes = []; };
  for (const b of blocks) {
    if (cluster.length && b.start >= clusterEnd) { close(); clusterEnd = -1; }
    let i = lanes.findIndex(end => end <= b.start);
    if (i < 0) { i = lanes.length; lanes.push(0); }
    lanes[i] = b.end; b.lane = i;
    cluster.push(b); clusterEnd = Math.max(clusterEnd, b.end);
  }
  close();
  return blocks;
}

/* ---------- validation: bad entries are reported, never fatal ---------- */
export function normalizePlan(data, catalogs) {
  const warn = [];
  const cats = (data && data.categories) || {};
  if (!Object.keys(cats).length) cats.undecided = { label: 'Undecided', color: '#7d93a3', dashed: true };
  const def = cats[data.defaultCategory] ? data.defaultCategory : Object.keys(cats)[0];
  const terms = [];
  (Array.isArray(data.terms) ? data.terms : []).forEach((t, i) => {
    if (!t || !t.id) { warn.push('terms[' + i + ']: missing "id" — skipped'); return; }
    const album = catalogs[(t.catalog && t.catalog.album) || t.id];
    if (!album) { warn.push(t.id + ': catalog album "' + ((t.catalog && t.catalog.album) || t.id) + '" not found in data/gallery.json'); }
    const groups = album ? album.groups : [];
    const picks = [];
    (Array.isArray(t.picks) ? t.picks : []).forEach((p, j) => {
      const g = groups.find(x => x.id === p.course);
      if (!g) { warn.push(t.id + '.picks[' + j + ']: unknown course "' + p.course + '" — skipped'); return; }
      const secs = (Array.isArray(p.sections) ? p.sections : []).filter(s => {
        const ok = (g.sections || []).some(x => x.section === s);
        if (!ok) warn.push(t.id + ': ' + g.code + ' has no section "' + s + '" — ignored');
        return ok;
      });
      let cat = p.category;
      if (!cats[cat]) { if (cat) warn.push(t.id + ': ' + g.code + ' category "' + cat + '" undefined — using "' + def + '"'); cat = def; }
      picks.push({ course: g.id, sections: secs, category: cat, note: p.note || '' });
    });
    const wk = t.week || {};
    terms.push({ id: t.id, title: t.title || t.id, dates: t.dates || '', catalog: t.catalog || {},
                 week: { days: (wk.days || ['Mo', 'Tu', 'We', 'Th', 'Fr']).filter(d => DAYS.includes(d)),
                         start: hm(wk.start) ?? 8 * 60, end: hm(wk.end) ?? 20 * 60 },
                 picks, groups, images: album ? album.images : [] });
  });
  return { raw: data, categories: cats, defaultCategory: def, terms, warnings: warn };
}

export function mount(root) {
  const ui = Object.assign({ hidden: [], term: '', wide: false }, store.get(UI_KEY, {}));
  const st = { plan: null, term: null, sel: null, img: 0, hidden: new Set(ui.hidden), wide: !!ui.wide, draft: false,
              mode: 'course', all: 0 };   // mode 'all' = step through every screenshot in the term

  const status = statusBar();
  const title = h('h3', { text: 'WEEK' });
  const termSel = h('select.pl-term', { hidden: true, 'aria-label': 'Term' });
  const draftTag = h('span.pl-draft', { hidden: true, text: 'unexported changes' });
  const resetBtn = h('button.app-btn', { type: 'button', hidden: true, text: 'RESET', title: 'Drop this browser’s draft and reload planner.json' });
  const imagesBtn = h('button.app-btn.pl-imgbtn', { type: 'button', text: 'IMAGES',
    title: 'Swap the week for a full-size viewer over every screenshot (i)', onclick: () => toggleAll() });
  const picker = jsonPicker('LOAD JSON', d => boot(d, 'local file'), m => status.set(m, 'err'));
  picker.hidden = true;
  const legend = h('div.pl-legend');
  const totals = h('div.pl-totals');
  const head = h('div.pl-head');
  const gutter = h('div.pl-gutter');
  const cols = h('div.pl-cols');
  const week = h('div.pl-week', null, head, h('div.pl-grid', null, gutter, cols));
  const chips = h('div.pl-chips');
  const panel = h('aside.pl-panel', { hidden: true, 'aria-label': 'Course details' });
  const main = h('section.pl-main', null, week, chips);
  const stage = h('section.pl-stage', { hidden: true, 'aria-label': 'All screenshots' });
  const body = h('div.pl-body', null, main, stage, panel);

  root.append(h('div.app.app-planner', null,
    h('div.app-bar', null, title,
      h('div.app-actions', null, termSel, draftTag, resetBtn, picker,
        imagesBtn,
        h('button.app-btn', { type: 'button', text: 'COPY JSON', title: 'Copy planner.json to the clipboard', onclick: copyJson }),
        h('button.app-btn', { type: 'button', text: 'EXPORT', title: 'Download planner.json — commit it as data/planner.json', onclick: download }))),
    h('div.app-statusrow', null, status.el),
    h('div.pl-legendrow', null, legend, totals),
    body));
  if (st.wide) body.classList.add('wide');

  const saveUI = () => store.set(UI_KEY, { hidden: [...st.hidden], term: st.term ? st.term.id : '', wide: st.wide });
  const group = id => st.term.groups.find(g => g.id === id);
  const pickOf = id => st.term.picks.find(p => p.course === id);
  const catOf = p => st.plan.categories[p.category] || { label: p.category, color: '#7d93a3' };

  /* ---------- blocks ---------- */
  function blocks() {
    const out = [], unplaced = [];
    for (const p of st.term.picks) {
      if (st.hidden.has(p.category)) continue;
      const g = group(p.course);
      for (const sid of p.sections) {
        const sec = g.sections.find(x => x.section === sid);
        const slot = parseSlot(sec);
        if (!slot) { unplaced.push({ g, sec, p }); continue; }
        for (const d of slot.days) out.push({ day: d, start: slot.start, end: slot.end, g, sec, p });
      }
    }
    // overlaps between different courses (dual-numbered pairs excepted)
    for (let i = 0; i < out.length; i++) for (let j = i + 1; j < out.length; j++) {
      const a = out[i], b = out[j];
      if (a.day !== b.day || a.g === b.g || same(a.g, b.g) || a.start >= b.end || b.start >= a.end) continue;
      a.clash = b.clash = true;
      if (a.p.category === 'take' && b.p.category === 'take') a.hard = b.hard = true;
    }
    return { out, unplaced };
  }

  /* ---------- week grid ---------- */
  function renderWeek() {
    const { out, unplaced } = blocks();
    const used = new Set(out.map(b => b.day));
    const days = DAYS.filter(d => st.term.week.days.includes(d) || used.has(d));
    let t0 = st.term.week.start, t1 = st.term.week.end;
    for (const b of out) { t0 = Math.min(t0, Math.floor(b.start / 60) * 60); t1 = Math.max(t1, Math.ceil(b.end / 60) * 60); }

    // fit the day to the visible height; never so small a 50-min class is unreadable
    const avail = Math.max(200, week.clientHeight - 30);
    const ppm = Math.max(0.72, Math.min(2.4, avail / (t1 - t0)));
    const H = Math.round((t1 - t0) * ppm);
    week.style.setProperty('--hour', (60 * ppm).toFixed(2) + 'px');
    week.style.setProperty('--off', ((60 - (t0 % 60)) % 60 * ppm).toFixed(2) + 'px');

    head.replaceChildren(h('div.pl-corner'), ...days.map(d => h('div.pl-day', { text: DAY_LABEL[d] })));

    /* Lanes first, so a crowded day can be given the width it needs: every lane
       gets at least LANE_PX, and spare width is shared in proportion to lanes.
       Past that the week scrolls sideways rather than squeezing text out. */
    const perDay = days.map(d => layoutDay(out.filter(b => b.day === d)));
    const tracks = perDay.map(list => {
      const n = Math.max(1, ...list.map(b => b.lanes || 1));
      return 'minmax(' + Math.max(96, n * LANE_PX) + 'px,' + n + 'fr)';
    }).join(' ');
    head.style.gridTemplateColumns = 'var(--gw) ' + tracks;
    cols.style.gridTemplateColumns = tracks;

    const labels = [];
    for (let m = Math.ceil(t0 / 60) * 60; m <= t1; m += 60) labels.push(h('span', { text: clock(m), style: { top: ((m - t0) * ppm) + 'px' } }));
    gutter.replaceChildren(...labels);
    gutter.style.height = H + 'px';

    cols.replaceChildren(...days.map((d, di) => {
      const list = perDay[di];
      return h('div.pl-col', { style: { height: H + 'px' } }, list.map(b => {
        const c = catOf(b.p);
        const w = 100 / b.lanes;
        const el = h('button.pl-blk' + (c.dashed ? '.dashed' : '') + (b.clash ? '.clash' : '') + (b.hard ? '.hard' : '')
                     + (st.sel === b.g.id ? '.sel' : ''), {
          type: 'button', '--c': c.color,
          title: [b.g.code + ' ' + (b.g.name || ''), (b.sec.type || '') + ' ' + b.sec.section, (b.sec.days || '') + ' ' + (b.sec.time || ''),
                  b.sec.room, b.sec.instructor, c.label + (b.hard ? ' · overlaps another TAKE course' : b.clash ? ' · overlaps' : '')].filter(Boolean).join('\n'),
          style: { top: ((b.start - t0) * ppm) + 'px', height: Math.max(14, (b.end - b.start) * ppm - 2) + 'px',
                   left: 'calc(' + (b.lane * w) + '% + 2px)', width: 'calc(' + w + '% - 4px)' },
          onclick: () => select(b.g.id),
        },
          h('b', { text: b.g.code }),
          h('span.s', { text: (TYPE_ABBR[b.sec.type] || b.sec.type || '') + ' ' + b.sec.section }),
          h('span.t', { text: clock(b.start) + '–' + clock(b.end) }),
          h('span.r', { text: b.sec.room || '' }));
        return el;
      }));
    }));

    /* every course as a chip — the way back to one with nothing on the grid
       (online, all sections unticked, or its category hidden) */
    chips.replaceChildren(h('span.pl-chips-lbl', { text: 'COURSES' }), ...st.term.picks.map(p => {
      const g = group(p.course), c = catOf(p);
      const off = !out.some(b => b.g === g);
      const why = unplaced.some(u => u.g === g) ? 'no meeting time' : st.hidden.has(p.category) ? 'category hidden'
                : !p.sections.length ? 'no sections ticked' : '';
      return h('button.pl-chip' + (c.dashed ? '.dashed' : '') + (st.sel === g.id ? '.sel' : '') + (off ? '.off' : ''), {
        type: 'button', '--c': c.color, title: (g.name || '') + (why ? ' — ' + why : ''), onclick: () => select(g.id),
      }, g.code, why ? h('i', { text: why }) : null);
    }));
  }

  /* ---------- legend + totals ---------- */
  function renderLegend() {
    legend.replaceChildren(...Object.entries(st.plan.categories).map(([k, c]) => h('button.cal-chip' + (st.hidden.has(k) ? '.off' : ''), {
      type: 'button', '--c': c.color, title: 'Show / hide', text: c.label || k,
      onclick: () => { st.hidden.has(k) ? st.hidden.delete(k) : st.hidden.add(k); saveUI(); renderAll(); },
    })));
    const rows = [];
    for (const [k, c] of Object.entries(st.plan.categories)) {
      const ps = st.term.picks.filter(p => p.category === k);
      if (!ps.length) continue;
      let units = 0, unknown = 0, mins = 0, alt = false;
      for (const p of ps) {
        const g = group(p.course);
        const u = parseFloat(g.units); if (isNaN(u)) unknown++; else units += u;
        const byType = {};
        for (const sid of p.sections) {
          const sec = g.sections.find(x => x.section === sid), slot = parseSlot(sec);
          byType[sec.type] = (byType[sec.type] || 0) + 1;
          if (slot) mins += (slot.end - slot.start) * slot.days.size;
        }
        if (Object.values(byType).some(n => n > 1)) alt = true;
      }
      rows.push(h('span.pl-total', { '--c': c.color },
        h('b', { text: c.label }), ' ' + ps.length + ' course' + (ps.length === 1 ? '' : 's')
        + ' · ' + (units ? units + (unknown ? '+?' : '') : '?') + ' units · ' + (mins / 60).toFixed(1) + (alt ? '*' : '') + ' h/wk'));
    }
    const hard = blocks().out.filter(b => b.hard).length;
    if (hard) rows.push(h('span.pl-total.warn', { text: 'TAKE overlaps on the grid' }));
    if (rows.some(r => r.textContent.includes('*'))) rows.push(h('span.pl-foot', { text: '* includes alternative sections not yet narrowed to one' }));
    totals.replaceChildren(...rows);
  }

  /* ---------- side panel ---------- */
  function select(id) { st.mode = 'course'; st.sel = id; st.img = 0; renderAll(); }
  function closePanel() { st.sel = null; renderAll(); }

  /* ---------- all-images mode ----------
     IMAGES swaps the week out of the main area for a full-size viewer over
     every screenshot in the term, in course order (catalog group order), then
     anything not tied to a course. WEEK (or Esc) swaps the calendar back. */
  function allImages() {
    const order = new Map(st.term.groups.map((g, i) => [g.id, i]));
    return st.term.images.map((im, i) => ({ im, i }))
      .sort((a, b) => (order.get(a.im.group) ?? 1e9) - (order.get(b.im.group) ?? 1e9) || a.i - b.i)
      .map(x => x.im);
  }
  function toggleAll() {
    if (st.mode === 'all') { st.mode = 'course'; renderAll(); return; }
    const list = allImages();
    if (!list.length) { status.set('no screenshots in this term', 'warn', 100); return; }
    // start on the open course's current image, if a course panel is open
    const at = st.sel ? list.findIndex(im => im.group === st.sel) : -1;
    st.mode = 'all'; st.all = at >= 0 ? at + st.img : 0; st.actual = false;
    stepAll(0);
  }
  function stepAll(d) {
    const n = allImages().length;
    st.all = (st.all + d + n) % n;
    st.actual = false;
    renderAll();
  }
  function viewerBlock(imgs, idx, onStep, label) {
    const im = imgs[idx];
    return h('div.pl-viewer', null,
      h('div.pl-imgwrap', null, h('img.pl-img', { src: im.file, alt: im.title,
        title: st.wide ? 'Click to narrow the panel' : 'Click to widen the panel', onclick: () => toggleWide() })),
      h('div.pl-vbar', null,
        h('button.app-btn', { type: 'button', text: '‹', title: 'Previous image (←)', onclick: () => onStep(-1) }),
        h('span.pl-vcount', { text: (idx + 1) + ' / ' + imgs.length }),
        h('button.app-btn', { type: 'button', text: '›', title: 'Next image (→)', onclick: () => onStep(1) }),
        h('span.pl-vcap', { text: label || im.title }),
        h('button.app-btn', { type: 'button', text: st.wide ? 'NARROW' : 'WIDE', onclick: () => toggleWide() }),
        h('a.app-btn', { href: im.file, target: '_blank', rel: 'noopener', text: '↗', title: 'Open the original in a new tab' })));
  }

  function renderStage() {
    const list = allImages();
    const im = list[st.all];
    const g = im.group ? group(im.group) : null;
    const p = g ? pickOf(g.id) : null;
    const c = p ? catOf(p) : null;
    const img = h('img.pl-simg', { src: im.file, alt: im.title,
      title: st.actual ? 'Click to fit' : 'Click for actual size',
      onclick: () => { st.actual = !st.actual; renderStage(); } });
    const strip = h('div.pl-strip.all', null, list.map((x, i) => h('button' + (i === st.all ? '.on' : ''), {
      type: 'button', title: x.title, onclick: () => { st.all = i; stepAll(0); },
    }, h('img', { src: x.thumb || x.file, alt: '' }))));
    stage.replaceChildren(
      h('div.pl-shead', null,
        h('span.pl-vcount', { text: (st.all + 1) + ' / ' + list.length }),
        h('span.gal-code', { text: g ? g.code : '—' }),
        h('span.gal-name', { text: g ? (g.name || '') : 'not tied to a course' }),
        c ? h('span.pl-acat', { '--c': c.color, text: c.label }) : null,
        h('span.pl-sgrow'),
        g ? h('button.app-btn', { type: 'button', text: 'COURSE DETAILS',
              title: 'Back to the week with this course’s panel open',
              onclick: () => { const own = st.term.images.filter(x => x.group === g.id);
                               st.mode = 'course'; st.sel = g.id; st.img = Math.max(0, own.indexOf(im)); renderAll(); } }) : null,
        h('a.app-btn', { href: im.file, target: '_blank', rel: 'noopener', text: '↗', title: 'Open the original in a new tab' })),
      h('div.pl-sframe' + (st.actual ? '.actual' : ''), null,
        h('button.pl-snav.prev', { type: 'button', 'aria-label': 'Previous image', text: '‹', onclick: () => stepAll(-1) }),
        h('div.pl-sscroll', null, img),
        h('button.pl-snav.next', { type: 'button', 'aria-label': 'Next image', text: '›', onclick: () => stepAll(1) })),
      h('div.pl-sfoot', null,
        h('span.pl-vcap', { text: im.title }),
        im.caption ? h('span.pl-acap', { text: im.caption }) : null),
      strip);
    const on = strip.querySelector('.on');
    if (on) requestAnimationFrame(() => on.scrollIntoView({ block: 'nearest', inline: 'center' }));
  }

  function renderPanel() {
    const open = !!st.sel && st.mode !== 'all';
    panel.hidden = !open;
    body.classList.toggle('open', open);
    if (!open) { panel.replaceChildren(); return; }
    const g = group(st.sel), p = pickOf(st.sel);
    const imgs = st.term.images.filter(im => im.group === g.id);
    st.img = imgs.length ? (st.img + imgs.length) % imgs.length : 0;

    const segs = h('div.pl-seg', { role: 'radiogroup', 'aria-label': 'Category' },
      Object.entries(st.plan.categories).map(([k, c]) => h('button' + (p.category === k ? '.on' : ''), {
        type: 'button', role: 'radio', 'aria-checked': p.category === k ? 'true' : 'false', '--c': c.color, text: c.label,
        onclick: () => { p.category = k; changed(); },
      })));

    const viewer = imgs.length ? h('div', null,
      viewerBlock(imgs, st.img, d => { st.img += d; renderPanel(); }),
      imgs.length > 1 ? h('div.pl-strip', null, imgs.map((x, i) => h('button' + (i === st.img ? '.on' : ''), {
        type: 'button', title: x.title, onclick: () => { st.img = i; renderPanel(); },
      }, h('img', { src: x.thumb || x.file, alt: '' })))) : null) : null;

    // one real row per section; tick to place it on the week
    const types = [...new Set(g.sections.map(s => s.type || ''))];
    const secTables = types.map(ty => {
      const list = g.sections.filter(s => (s.type || '') === ty);
      const ticked = list.filter(s => p.sections.includes(s.section)).length;
      return h('div.pl-sectype', null,
        h('div.pl-sechead', null, h('b', { text: (ty || 'Section') + (list.length > 1 ? 's' : '') }),
          list.length > 1 && ticked > 1 ? h('span.pl-hint', { text: ticked + ' shown — keep the one you want' }) : null),
        h('table.pl-secs', null, h('tbody', null, list.map(s => {
          const on = p.sections.includes(s.section);
          const cb = h('input', { type: 'checkbox', 'aria-label': 'Show section ' + s.section });
          cb.checked = on;
          cb.addEventListener('change', () => {
            p.sections = cb.checked ? [...p.sections, s.section] : p.sections.filter(x => x !== s.section);
            p.sections.sort((a, b) => g.sections.findIndex(x => x.section === a) - g.sections.findIndex(x => x.section === b));
            changed();
          });
          return h('tr' + (on ? '' : '.dim'), { title: [s.instructor, s.classNo && 'class # ' + s.classNo, s.status].filter(Boolean).join(' · ') },
            h('td', null, cb), h('td.sec', { text: s.section }),
            h('td', { text: ((s.days || '') + ' ' + (s.time || '')).trim() || 'online / no set time' }),
            h('td.room', { text: s.room || '' }));
        }))));
    });

    const note = h('textarea.pl-note', { rows: 2, placeholder: 'note for this course (exported with planner.json)', spellcheck: 'true' });
    note.value = p.note || '';
    note.addEventListener('change', () => { p.note = note.value.trim(); changed(false); });

    panel.replaceChildren(...[
      h('div.pl-phead', null,
        h('div', null, h('span.gal-code', { text: g.code }), h('div.gal-name', { text: g.name || '' })),
        h('button.app-btn', { type: 'button', text: '✕', title: 'Close panel (Esc)', onclick: closePanel })),
      segs, viewer, ...secTables, note,
      h('div.pl-card', null, courseCard(g)),
    ].filter(Boolean));
  }

  function toggleWide() { st.wide = !st.wide; body.classList.toggle('wide', st.wide); saveUI(); renderAll(); }

  /* ---------- edits, draft, export ---------- */
  function snapshot() {
    const out = JSON.parse(JSON.stringify(st.plan.raw));
    out.updated = new Date().toISOString().slice(0, 10);
    for (const t of out.terms || []) {
      const live = st.plan.terms.find(x => x.id === t.id);
      if (live) t.picks = live.picks.map(p => ({ course: p.course, sections: p.sections.slice(), category: p.category, note: p.note || '' }));
    }
    return out;
  }
  const picksOf = obj => JSON.stringify((obj.terms || []).map(t => [t.id, (t.picks || []).map(p => [p.course, p.sections, p.category, p.note || ''])]));
  function changed(rerender = true) {
    const snap = snapshot();
    st.draft = picksOf(snap) !== picksOf(st.plan.raw);
    if (st.draft) store.set(DRAFT_KEY, { terms: snap.terms.map(t => ({ id: t.id, picks: t.picks })) });
    else store.del(DRAFT_KEY);
    draftTag.hidden = resetBtn.hidden = !st.draft;
    if (rerender) renderAll();
  }
  function download() {
    const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(snapshot(), null, 2) + '\n'], { type: 'application/json' })), download: 'planner.json' });
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    status.set('exported planner.json — replace data/planner.json with it and commit', 'ok', 100);
  }
  async function copyJson() {
    try { await navigator.clipboard.writeText(JSON.stringify(snapshot(), null, 2) + '\n'); status.set('planner.json copied to clipboard', 'ok', 100); }
    catch (e) { status.set('clipboard blocked — use EXPORT', 'err'); }
  }
  resetBtn.addEventListener('click', () => {
    if (!confirm('Drop the unexported changes in this browser?')) return;
    store.del(DRAFT_KEY); load();
  });

  function renderAll() {
    if (!st.term) return;
    const imgs = st.mode === 'all';
    main.hidden = imgs; stage.hidden = !imgs;
    body.classList.toggle('images', imgs);
    imagesBtn.textContent = imgs ? 'WEEK' : 'IMAGES';
    imagesBtn.title = imgs ? 'Back to the week (Esc / i)' : 'Swap the week for a full-size viewer over every screenshot (i)';
    imagesBtn.classList.toggle('on', imgs);
    renderLegend();
    if (imgs) renderStage(); else renderWeek();
    renderPanel();
  }

  /* ---------- keys + resize ---------- */
  const onKey = e => {
    if (e.target.closest && e.target.closest('input, textarea, select')) return;
    if ((e.key === 'i' || e.key === 'I') && st.term && !e.ctrlKey && !e.metaKey && !e.altKey) { toggleAll(); e.preventDefault(); return; }
    if (!st.sel && st.mode !== 'all') return;
    if (e.key === 'Escape') { if (st.mode === 'all') toggleAll(); else closePanel(); }
    else if (e.key === 'ArrowLeft') { if (st.mode === 'all') stepAll(-1); else { st.img--; renderPanel(); } }
    else if (e.key === 'ArrowRight') { if (st.mode === 'all') stepAll(1); else { st.img++; renderPanel(); } }
    else return;
    e.preventDefault(); e.stopPropagation();       // capture phase: Esc closes the panel, not the tool
  };
  addEventListener('keydown', onKey, true);
  let lastH = 0;
  const ro = window.ResizeObserver ? new ResizeObserver(() => {
    if (st.term && Math.abs(week.clientHeight - lastH) > 4) { lastH = week.clientHeight; renderWeek(); }
  }) : null;
  if (ro) ro.observe(week);

  /* ---------- load ---------- */
  async function boot(planData, origin) {
    status.set('fetching course catalog…', 'info', 35);
    const terms = (planData.terms || []);
    const sources = [...new Set(terms.map(t => (t.catalog && t.catalog.source) || 'data/gallery.json'))];
    const catalogs = {};
    for (const src of sources) {
      const r = await loadJSON(src);
      if (!r.data) { status.set('catalog ' + src + ': ' + (r.error || (r.offline ? 'not readable from disk' : 'missing')), 'err', 100); return; }
      for (const a of normCatalog(r.data).albums) catalogs[a.id] = a;
    }
    status.set('validating planner…', 'info', 65);
    // a draft from this browser overrides the repo picks until exported
    const draft = store.get(DRAFT_KEY, null);
    const raw = JSON.parse(JSON.stringify(planData));
    const plan = normalizePlan(planData, catalogs);
    if (draft && Array.isArray(draft.terms)) {
      const merged = JSON.parse(JSON.stringify(planData));
      for (const t of merged.terms || []) { const d = draft.terms.find(x => x.id === t.id); if (d) t.picks = d.picks; }
      const p2 = normalizePlan(merged, catalogs);
      plan.terms = p2.terms; plan.warnings = plan.warnings.concat(p2.warnings.filter(w => !plan.warnings.includes(w)));
    }
    plan.raw = raw;
    st.plan = plan;
    plan.warnings.forEach(w => console.warn('[nh planner]', w));
    if (!plan.terms.length) { status.set('planner.json has no terms', 'err', 100); return; }
    termSel.replaceChildren(...plan.terms.map(t => h('option', { value: t.id, text: t.title })));
    termSel.hidden = plan.terms.length < 2;
    st.term = plan.terms.find(t => t.id === ui.term) || plan.terms[0];
    termSel.value = st.term.id;
    title.textContent = 'WEEK · ' + st.term.title.toUpperCase();
    changed(false);
    status.set('rendering…', 'info', 90);
    renderAll();
    status.set(st.term.title + (st.term.dates ? ' · ' + st.term.dates : '') + ' · ' + st.term.picks.length + ' courses'
      + (origin ? ' · ' + origin : '') + (plan.warnings.length ? ' · ' + plan.warnings.length + ' warning(s), see console' : '')
      + (st.draft ? ' · local draft applied' : ''), plan.warnings.length ? 'warn' : 'ok', 100);
  }
  termSel.addEventListener('change', () => {
    st.term = st.plan.terms.find(t => t.id === termSel.value); st.sel = null;
    title.textContent = 'WEEK · ' + st.term.title.toUpperCase(); saveUI(); renderAll();
  });

  async function load() {
    status.set('fetching ' + SOURCE + '…', 'info', 15);
    const r = await loadJSON(SOURCE);
    if (r.data) { boot(r.data); return; }
    picker.hidden = false;
    if (r.offline) status.set('Opened from disk: browsers block reading data/ here. Serve the folder (python -m http.server).', 'warn', 100);
    else status.set(r.missing ? SOURCE + ' not found' : r.error, 'err', 100);
  }
  load();

  return function destroy() {
    removeEventListener('keydown', onKey, true);
    if (ro) ro.disconnect();
  };
}
