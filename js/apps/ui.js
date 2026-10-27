// ============ APP UI KIT ============
// Small helpers shared by the tool apps (calendar, linkdock). Apps build their
// own DOM inside the #view body and tear it down on close; nothing here touches
// the rest of the page.

/* h('div.cls#id', {attrs}, ...children) — tiny element builder */
export function h(spec, attrs, ...kids) {
  const m = /^([a-z0-9]+)?((?:[.#][\w-]+)*)$/i.exec(spec) || [];
  const el = document.createElement(m[1] || 'div');
  for (const part of (m[2] || '').match(/[.#][\w-]+/g) || []) {
    if (part[0] === '.') el.classList.add(part.slice(1)); else el.id = part.slice(1);
  }
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'text') el.textContent = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k.startsWith('--')) el.style.setProperty(k, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat()) if (k != null && k !== false) el.append(k.nodeType ? k : String(k));
  return el;
}

/* Status line with a progress bar. Every app reports load/parse/validate steps
   through one of these so a stall is visible rather than silent. */
export function statusBar() {
  const fill = h('i');
  const text = h('span.app-status-text', { text: 'booting…' });
  const el = h('div.app-status', { role: 'status', 'aria-live': 'polite' }, h('span.app-status-bar', null, fill), text);
  return {
    el,
    set(msg, kind = 'info', pct = null) {
      el.dataset.kind = kind;
      text.textContent = msg;
      if (pct !== null) fill.style.width = Math.max(0, Math.min(100, pct)) + '%';
      if (kind === 'err') console.error('[nh app]', msg);
    },
  };
}

/* Load a repo JSON file. Over http(s) it is fetched fresh, so editing the file
   in the repo and pushing is the whole update path. From file:// the browser
   refuses the fetch; the caller gets {offline:true} and offers a file picker. */
export async function loadJSON(url) {
  if (location.protocol === 'file:') return { offline: true };
  let res;
  try { res = await fetch(url, { cache: 'no-store' }); }
  catch (e) { return { error: 'fetch failed: ' + e.message }; }
  if (res.status === 404) return { missing: true };
  if (!res.ok) return { error: url + ': HTTP ' + res.status };
  try { return { data: JSON.parse(await res.text()) }; }
  catch (e) { return { error: url + ' is not valid JSON: ' + e.message }; }
}

/* A button that opens a file picker for a .json and hands back the parsed data. */
export function jsonPicker(label, onData, onError) {
  const input = h('input', { type: 'file', accept: '.json,application/json', hidden: true });
  input.addEventListener('change', async () => {
    const f = input.files && input.files[0];
    input.value = '';
    if (!f) return;
    try { onData(JSON.parse(await f.text()), f.name); }
    catch (e) { onError(f.name + ': ' + e.message); }
  });
  return h('label.app-btn', { title: 'Load a local ' + label }, label, input);
}

export const store = {
  get(k, fallback) { try { const v = localStorage.getItem(k); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked: app still works */ } },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} },
};
