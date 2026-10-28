// ============ COURSE CATALOG (shared) ============
// The course data transcribed from screenshots lives as "groups" on a gallery
// album in data/gallery.json. The Gallery shows it beside the screenshots; the
// weekly Planner places its sections on a week grid. This module is the one
// place that reads, validates, times and renders it.

import { h } from './ui.js';

export function normalize(data) {
  const warn = [];
  const albums = [];
  (Array.isArray(data && data.albums) ? data.albums : []).forEach((a, i) => {
    if (!a || !a.id) { warn.push('albums[' + i + ']: missing "id" — skipped'); return; }
    const images = [];
    (Array.isArray(a.images) ? a.images : []).forEach((im, j) => {
      if (!im || !im.file) { warn.push(a.id + '.images[' + j + ']: missing "file" — skipped'); return; }
      images.push({ file: im.file, thumb: im.thumb || '', title: im.title || im.file.split('/').pop(),
                    caption: im.caption || '', w: im.w | 0, h: im.h | 0, group: im.group || '' });
    });
    const groups = (Array.isArray(a.groups) ? a.groups : []).filter(g => g && g.id);
    images.forEach(im => {
      if (im.group && !groups.find(g => g.id === im.group)) warn.push(a.id + ': image ' + im.file + ' names unknown group "' + im.group + '"');
    });
    albums.push({ id: a.id, title: a.title || a.id, notes: a.notes || '', images, groups });
  });
  return { updated: (data && data.updated) || '', albums, warnings: warn };
}

/* ---------- section time clashes ----------
   "TuTh" + "9:30AM - 10:45AM" -> day set + minute range. Sections of the SAME
   course are alternatives, so only sections of different courses can clash.
   Courses listed in each other's "same" (dual-numbered, e.g. ECE 455 / 555)
   are one class under two numbers, so they never clash with each other. */
export const DAY_RE = /Mo|Tu|We|Th|Fr|Sa|Su/g;
export function toMin(t) {
  const m = /^\s*(\d{1,2}):(\d{2})\s*([AP])M\s*$/i.exec(t || '');
  if (!m) return null;
  let hh = +m[1] % 12;
  if (m[3].toUpperCase() === 'P') hh += 12;
  return hh * 60 + +m[2];
}
export function parseSlot(sec) {
  const days = new Set(String(sec.days || '').match(DAY_RE) || []);
  const [a, b] = String(sec.time || '').split('-');
  const start = toMin(a), end = toMin(b);
  return days.size && start != null && end != null ? { days, start, end } : null;
}
export function clashes(groups) {
  const all = [];
  groups.forEach(g => (g.sections || []).forEach(sec => {
    const slot = parseSlot(sec);
    if (slot) all.push({ g, sec, slot, label: (g.code || g.id) + '-' + (sec.section || '?') });
  }));
  const out = new Map();                       // sec object -> [labels it clashes with]
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    const x = all[i], y = all[j];
    if (x.g === y.g) continue;
    if ((x.g.same || []).includes(y.g.id) || (y.g.same || []).includes(x.g.id)) continue;
    const shareDay = [...x.slot.days].some(d => y.slot.days.has(d));
    if (!shareDay || x.slot.start >= y.slot.end || y.slot.start >= x.slot.end) continue;
    if (!out.has(x.sec)) out.set(x.sec, []);
    if (!out.has(y.sec)) out.set(y.sec, []);
    out.get(x.sec).push(y.label); out.get(y.sec).push(x.label);
  }
  return out;
}

export const groupText = g => [g.code, g.name, g.career, g.mode, g.attributes, g.classNotes, g.description, g.requirements, g.notes,
  ...(g.sections || []).map(x => [x.section, x.classNo, x.days, x.time, x.room, x.instructor].join(' '))].join(' ').toLowerCase();

export function courseCard(g, clash = new Map()) {
  const meta = [g.units && g.units + ' units', g.career, g.mode, g.grading, g.components, g.attributes].filter(Boolean).join(' · ');
  const COLS = [['section', 'Sec'], ['type', 'Type'], ['classNo', 'Class #'], ['status', 'Status'],
                ['days', 'Days'], ['time', 'Time'], ['room', 'Room'], ['instructor', 'Instructor'], ['dates', 'Dates']];
  const secs = g.sections || [];
  const table = secs.length ? h('table.gal-secs', null,
    h('thead', null, h('tr', null, COLS.map(([, l]) => h('th', { text: l })), h('th', { text: 'Clash' }))),
    h('tbody', null, secs.map(x => {
      const c = clash.get(x) || [];
      // one section = one real table row
      return h('tr' + (c.length ? '.clash' : ''), null,
        COLS.map(([k]) => h('td', { text: x[k] || '—' })),
        h('td.c', { text: c.length ? c.join(', ') : '—' }));
    }))) : null;
  return h('div.gal-course', null,
    h('div.gal-course-head', null,
      h('span.gal-code', { text: g.code || g.id }),
      h('span.gal-name', { text: g.name || '' })),
    meta ? h('div.gal-meta', { text: meta }) : null,
    g.description ? h('p.gal-desc', { text: g.description }) : null,
    g.requirements ? h('div.gal-req', null, h('b', { text: 'Enrollment requirements' }), h('span', { text: g.requirements })) : null,
    g.classNotes ? h('div.gal-req.soft', null, h('b', { text: 'Class notes' }), h('span', { text: g.classNotes })) : null,
    table ? h('div.gal-secs-wrap', null, table) : null,
    g.notes ? h('p.gal-gnotes', { text: g.notes }) : null);
}

