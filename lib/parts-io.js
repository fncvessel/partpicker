// Reads and writes the part files in parts/<category>/<id>.json (Node only).
'use strict';
const fs = require('fs');
const path = require('path');

const PARTS_DIR = path.join(__dirname, '..', 'parts');
const CATEGORY_ORDER = ['cpu', 'cooler', 'motherboard', 'memory', 'gpu', 'storage', 'controller', 'nic', 'psu', 'case'];

function loadPartFiles(dir = PARTS_DIR) {
  const files = [];
  for (const cat of fs.readdirSync(dir).sort()) {
    const catDir = path.join(dir, cat);
    if (!fs.statSync(catDir).isDirectory()) continue;
    for (const f of fs.readdirSync(catDir).sort()) {
      if (!f.endsWith('.json')) continue;
      const file = path.join(catDir, f);
      let data, error;
      try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { error = e.message; }
      files.push({ cat, file: path.relative(path.join(dir, '..'), file), base: f.replace(/\.json$/, ''), data, error });
    }
  }
  return files;
}

function loadCatalog(dir = PARTS_DIR) {
  const parts = loadPartFiles(dir).filter((f) => f.data).map((f) => Object.assign({ cat: f.cat }, f.data));
  parts.sort((a, b) => CATEGORY_ORDER.indexOf(a.cat) - CATEGORY_ORDER.indexOf(b.cat));
  const presets = JSON.parse(fs.readFileSync(path.join(dir, '_presets.json'), 'utf8'));
  const meta = JSON.parse(fs.readFileSync(path.join(dir, '_meta.json'), 'utf8'));
  return { parts, presets, pricesAsOf: meta.pricesAsOf };
}

// Pretty JSON: top-level keys one per line; any nested value that fits on one line stays inline.
function formatPart(obj) {
  const inline = (v) => JSON.stringify(v).replace(/,(?=["{\[\d\-tfn])/g, ', ').replace(/":/g, '": ').replace(/{"/g, '{ "').replace(/}/g, ' }').replace(/{ \s*}/g, '{}');
  const fmt = (v, ind) => {
    if (v === null || typeof v !== 'object') return JSON.stringify(v);
    const one = inline(v);
    if (ind > 0 && one.length + ind <= 110) return one;
    const pad = ' '.repeat(ind + 2);
    if (Array.isArray(v)) return '[\n' + v.map((x) => pad + fmt(x, ind + 2)).join(',\n') + '\n' + ' '.repeat(ind) + ']';
    return '{\n' + Object.entries(v).map(([k, x]) => pad + JSON.stringify(k) + ': ' + fmt(x, ind + 2)).join(',\n') + '\n' + ' '.repeat(ind) + '}';
  };
  return fmt(obj, 0) + '\n';
}

module.exports = { PARTS_DIR, CATEGORY_ORDER, loadPartFiles, loadCatalog, formatPart };
