// ============ TOOL: CALENDAR ============
// Monthly calendar driven by data/schedule.json. Edit that file, commit, and
// the site serves the new schedule — no build step. Schema: docs/apps.md.
//
// mount(root) builds everything inside root and returns destroy().

import { h, statusBar, loadJSON, jsonPicker, store } from './ui.js';

const SOURCE = 'data/schedule.json';
const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DOW_LABEL = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
const WEEK_START = 0;            // 0 = Sunday, 1 = Monday
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/* ---------- date helpers: local dates only, never new Date('YYYY-MM-DD') ---------- */
function parseDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return (dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d) ? dt : null;
}
const pad = n => String(n).padStart(2, '0');
const keyOf = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
function fmtTime(t) {
  if (!t) return '';
  let [hh, mm] = t.split(':').map(Number);
  const ap = hh >= 12 ? 'p' : 'a';
  hh = hh % 12 || 12;
  return mm ? hh + ':' + pad(mm) + ap : hh + ap;
}
function rangeOf(e, sep = '–') {
  if (!e.start) return 'all day';
  if (!e.end || e.end === e.start) return fmtTime(e.start);
  return fmtTime(e.start) + sep + fmtTime(e.end);
}

/* ---------- validation: bad entries are skipped and reported, never fatal ---------- */
export function normalize(data) {
  const warn = [];
  const cats = (data && typeof data.categories === 'object' && data.categories) || {};
  const common = (e, where) => {
    if (!e.title) warn.push(where + ': missing "title"');
    for (const f of ['start', 'end']) {
      if (e[f] && !TIME_RE.test(e[f])) warn.push(where + ': ' + f + ' "' + e[f] + '" is not HH:MM (24h)');
    }
    if (e.start && e.end && e.end < e.start) warn.push(where + ': end is before start');
    if (e.category && !cats[e.category]) warn.push(where + ': unknown category "' + e.category + '"');
  };

  const recurring = [];
  (Array.isArray(data.recurring) ? data.recurring : []).forEach((r, i) => {
    const where = 'recurring[' + i + '] "' + (r.title || '?') + '"';
    common(r, where);
    const from = DATE_RE.test(r.from || '') ? parseDate(r.from) : null;
    const until = DATE_RE.test(r.until || '') ? parseDate(r.until) : null;
    if (!from || !until) { warn.push(where + ': needs valid "from" and "until" (YYYY-MM-DD) — skipped'); return; }
    if (until < from) { warn.push(where + ': "until" is before "from" — skipped'); return; }
    const days = (r.days || []).map(d => DOW.indexOf(d));
    if (!days.length || days.includes(-1)) { warn.push(where + ': "days" must use ' + DOW.join(', ') + ' — skipped'); return; }
    const except = new Set();
    (r.except || []).forEach(x => {
      if (DATE_RE.test(x) && parseDate(x)) except.add(x); else warn.push(where + ': bad except date "' + x + '"');
    });
    recurring.push(Object.assign({}, r, { _from: from, _until: until, _days: new Set(days), _except: except }));
  });

  const events = [];
  (Array.isArray(data.events) ? data.events : []).forEach((e, i) => {
    const where = 'events[' + i + '] "' + (e.title || '?') + '"';
    common(e, where);
    const d = DATE_RE.test(e.date || '') ? parseDate(e.date) : null;
    if (!d) { warn.push(where + ': needs valid "date" (YYYY-MM-DD) — skipped'); return; }
    let end = d;
    if (e.endDate) {
      const ed = DATE_RE.test(e.endDate) ? parseDate(e.endDate) : null;
      if (!ed || ed < d) warn.push(where + ': bad "endDate" — treated as single day'); else end = ed;
    }
    events.push(Object.assign({}, e, { _date: d, _end: end }));
  });
  return { meta: data.meta || {}, categories: cats, recurring, events, warnings: warn };
}

/* Expand only the visible window, so long from/until ranges cost nothing. */
export function occurrences(sched, hidden, start, end) {
  const map = new Map();
  const push = (d, ev) => { const k = keyOf(d); if (!map.has(k)) map.set(k, []); map.get(k).push(ev); };
  for (const r of sched.recurring) {
    if (hidden.has(r.category)) continue;
    const stop = r._until < end ? r._until : end;
    for (let d = r._from > start ? r._from : start; d <= stop; d = addDays(d, 1)) {
      if (r._days.has(d.getDay()) && !r._except.has(keyOf(d))) push(d, r);
    }
  }
  for (const e of sched.events) {
    if (hidden.has(e.category)) continue;
    const stop = e._end < end ? e._end : end;
    for (let d = e._date > start ? e._date : start; d <= stop; d = addDays(d, 1)) push(d, e);
  }
  for (const list of map.values()) {
    list.sort((a, b) => (a.start || '').localeCompare(b.start || '') || (a.title || '').localeCompare(b.title || ''));
  }
  return map;
}

export function mount(root) {
  const today = new Date();
  const st = {
    year: today.getFullYear(), month: today.getMonth(), selected: keyOf(today),
    sched: { categories: {}, recurring: [], events: [], meta: {} },
    hidden: new Set(store.get('nh-cal-hidden', [])),
  };
  const status = statusBar();
  const title = h('h3.cal-month', { text: '—' });
  const warnBtn = h('button.app-btn.warn', { type: 'button', hidden: true });
  const warnList = h('pre.app-warnings', { hidden: true });
  const dow = h('div.cal-dow');
  const grid = h('div.cal-grid');
  const legend = h('div.cal-legend');
  const detailDate = h('h4.cal-detail-date', { text: 'Select a day' });
  const detailList = h('ol.cal-detail-list');
  const picker = jsonPicker('LOAD JSON', (data, name) => apply(data, name), msg => status.set(msg, 'err'));
  picker.hidden = true;

  const nav = (label, tip, fn) => h('button.app-btn', { type: 'button', title: tip, onclick: fn, text: label });
  const bar = h('div.app-bar', null,
    title,
    h('div.app-actions', null,
      picker,
      nav('◀', 'Previous month (←)', () => go(-1)),
      nav('TODAY', 'Jump to today (T)', goToday),
      nav('▶', 'Next month (→)', () => go(1))));

  for (let i = 0; i < 7; i++) dow.append(h('div', { text: DOW_LABEL[(i + WEEK_START) % 7] }));

  root.append(h('div.app.app-calendar', null,
    bar,
    h('div.app-statusrow', null, status.el, warnBtn),
    warnList,
    h('div.cal-layout', null,
      h('section.cal-month-wrap', null, dow, grid, legend),
      h('aside.cal-detail', null, detailDate, detailList))));

  warnBtn.addEventListener('click', () => { warnList.hidden = !warnList.hidden; });

  /* ---------- render ---------- */
  const colorOf = e => (st.sched.categories[e.category] || {}).color || 'var(--cyan)';

  function renderLegend() {
    legend.replaceChildren();
    for (const [key, c] of Object.entries(st.sched.categories)) {
      legend.append(h('button.cal-chip' + (st.hidden.has(key) ? '.off' : ''), {
        type: 'button', title: 'Show / hide', '--c': c.color, text: c.label || key,
        onclick: () => {
          st.hidden.has(key) ? st.hidden.delete(key) : st.hidden.add(key);
          store.set('nh-cal-hidden', [...st.hidden]);
          renderLegend(); render();
        },
      }));
    }
  }

  function render() {
    title.textContent = MONTHS[st.month].toUpperCase() + ' ' + st.year;
    const first = new Date(st.year, st.month, 1);
    const gridStart = addDays(first, -((first.getDay() - WEEK_START + 7) % 7));
    const gridEnd = addDays(gridStart, 41);
    const occ = occurrences(st.sched, st.hidden, gridStart, gridEnd);
    const todayKey = keyOf(new Date());

    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = addDays(gridStart, i), k = keyOf(d);
      const list = occ.get(k) || [];
      const cls = 'div.cal-cell' + (d.getMonth() !== st.month ? '.out' : '')
                + (k === todayKey ? '.today' : '') + (k === st.selected ? '.sel' : '');
      // One entry = one row. The cell has a fixed height and scrolls; it never grows.
      const rows = list.length ? h('ul.cal-evs', null, list.map(e =>
        h('li.cal-ev' + (e.start ? '' : '.allday'), { '--c': colorOf(e), title: [rangeOf(e), e.title, e.location].filter(Boolean).join(' · ') },
          e.start ? h('span.ev-t', { text: fmtTime(e.start) }) : null,
          h('span.ev-n', { text: e.title || '(untitled)' })))) : null;
      cells.push(h(cls, { 'data-key': k, onclick: () => select(k, list) }, h('div.num', { text: d.getDate() }), rows));
    }
    grid.replaceChildren(...cells);
    if (st.selected) {
      const sel = parseDate(st.selected);
      if (sel >= gridStart && sel <= gridEnd) detail(st.selected, occ.get(st.selected) || []);
    }
  }

  function select(k, list) {
    st.selected = k;
    grid.querySelectorAll('.cal-cell.sel').forEach(c => c.classList.remove('sel'));
    const c = grid.querySelector('.cal-cell[data-key="' + k + '"]');
    if (c) c.classList.add('sel');
    detail(k, list);
  }

  function detail(k, list) {
    const d = parseDate(k);
    detailDate.textContent = DOW_LABEL[d.getDay()] + ' ' + MONTHS[d.getMonth()].slice(0, 3).toUpperCase() + ' ' + d.getDate() + ', ' + d.getFullYear();
    if (!list.length) { detailList.replaceChildren(h('li.empty', { text: 'Nothing scheduled.' })); return; }
    detailList.replaceChildren(...list.map(e => h('li', { '--c': colorOf(e) },
      h('div.time', { text: rangeOf(e, ' – ') }),
      h('div.name', { text: e.title || '(untitled)' }),
      [e.location, (st.sched.categories[e.category] || {}).label].filter(Boolean).length
        ? h('div.meta', { text: [e.location, (st.sched.categories[e.category] || {}).label].filter(Boolean).join(' · ') }) : null,
      e.notes ? h('div.meta', { text: e.notes }) : null,
      e.url ? h('a.meta', { href: e.url, target: '_blank', rel: 'noopener', text: 'link ↗' }) : null)));
  }

  function go(delta) {
    const d = new Date(st.year, st.month + delta, 1);
    st.year = d.getFullYear(); st.month = d.getMonth();
    render();
  }
  function goToday() {
    const t = new Date();
    st.year = t.getFullYear(); st.month = t.getMonth(); st.selected = keyOf(t);
    render();
  }
  const onKey = e => {
    if (e.target.closest && e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === 't' || e.key === 'T') goToday();
  };
  addEventListener('keydown', onKey);

  /* ---------- load ---------- */
  function apply(data, origin) {
    status.set('validating entries…', 'info', 70);
    const n = normalize(data);
    st.sched = n;
    warnBtn.hidden = !n.warnings.length;
    warnBtn.textContent = n.warnings.length + ' warning' + (n.warnings.length === 1 ? '' : 's');
    warnList.textContent = n.warnings.join('\n');
    n.warnings.forEach(w => console.warn('[nh calendar]', w));
    status.set('rendering…', 'info', 90);
    renderLegend(); render();
    const m = n.meta;
    status.set((m.title ? m.title + ' · ' : '') + n.recurring.length + ' recurring + ' + n.events.length + ' one-off'
      + (m.updated ? ' · updated ' + m.updated : '') + (origin ? ' · ' + origin : ''),
      n.warnings.length ? 'warn' : 'ok', 100);
  }

  (async () => {
    render();
    status.set('fetching ' + SOURCE + '…', 'info', 20);
    const r = await loadJSON(SOURCE);
    if (r.data) { status.set('parsing…', 'info', 45); apply(r.data); return; }
    picker.hidden = false;
    if (r.offline) status.set('Opened from disk: browsers block reading ' + SOURCE + ' here. Use LOAD JSON, or serve the folder.', 'warn', 100);
    else if (r.missing) status.set(SOURCE + ' not found in the repo', 'err', 100);
    else status.set(r.error, 'err', 100);
  })();

  return function destroy() { removeEventListener('keydown', onKey); };
}
