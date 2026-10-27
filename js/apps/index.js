// ============ TOOL REGISTRY ============
// Tools are the tiles to the right of the four deck cards. Each one is a module
// with mount(root) -> destroy(). The tile list itself (label, blurb, order)
// lives in CFG.tools; this file only maps an id to its code.

import * as calendar from './calendar.js';
import * as linkdock from './linkdock.js';

const REGISTRY = { calendar, linkdock };

let teardown = null;

export const has = id => Object.prototype.hasOwnProperty.call(REGISTRY, id);

export function open(id, root) {
  close();
  if (!has(id)) { root.textContent = 'Unknown tool: ' + id; return; }
  try { teardown = REGISTRY[id].mount(root) || null; }
  catch (e) {
    console.error('[nh tools] ' + id + ' failed to mount:', e);
    root.textContent = 'This tool failed to start — see the console.';
  }
}

export function close() {
  if (teardown) { try { teardown(); } catch (e) { console.error('[nh tools] teardown:', e); } }
  teardown = null;
}
