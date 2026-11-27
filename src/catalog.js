/* Slotwise catalog loader.
 * Curated parts live in parts/<category>/<id>.json (one file per part). In Node they are read
 * from disk; in the browser build.js inlines them as SLOTWISE_DATA. Bulk-imported parts
 * (src/catalog.imported.json) are merged in afterwards and never override curated ones.
 */
(function (root) {
  'use strict';
  const isNode = typeof module !== 'undefined' && module.exports;
  const data = isNode ? require('../lib/parts-io.js').loadCatalog() : root.SLOTWISE_DATA;
  const parts = data.parts.slice();
  const presets = data.presets;

  const norm = (n) => n.toLowerCase().replace(/[^a-z0-9]/g, '');
  function mergeImported(list) {
    const names = new Set(parts.map((p) => norm(p.name)));
    const ids = new Set(parts.map((p) => p.id));
    let added = 0;
    for (const p of list || []) {
      if (ids.has(p.id) || names.has(norm(p.name))) continue;
      ids.add(p.id); names.add(norm(p.name)); parts.push(p); added++;
    }
    return added;
  }
  if (isNode) {
    try { mergeImported(require('./catalog.imported.json')); } catch (e) { /* no import yet */ }
  }

  const api = { parts, presets, pricesAsOf: data.pricesAsOf, mergeImported };
  if (isNode) module.exports = api;
  else root.SLOTWISE_CATALOG = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
