#!/usr/bin/env node
/* Checks every file in parts/ against the part schema and prints readable problems.
 *   node scripts/validate-parts.js         # exit 1 on errors
 *   node scripts/validate-parts.js --fix   # also rewrites files in the standard format
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { loadPartFiles, formatPart, PARTS_DIR, CATEGORY_ORDER } = require('../lib/parts-io.js');

const FORM_FACTORS = ['ITX', 'mATX', 'ATX', 'CEB', 'E-ATX', 'EEB'];
const TAGS = ['consumer', 'workstation', 'server'];
const enumOf = (...vals) => ({ enum: vals });

// Field spec: type letter + optional "?" (may be missing) or "~" (may be null).
// s string, n number, b boolean, S string[], a array, o object
const COMMON = { id: 's', name: 's', brand: 's', price: 'n', tags: 'S', priceChecked: 'b?', estimated: 'S?', notes: 's?', url: 's?' };
const SCHEMA = {
  cpu: { socket: 's', platform: 's', cores: 'n', threads: 'n~', powerW: 'n', memTypes: 'S', memModules: 'S', memChannels: 'n', memSpeed: 'n',
    maxMemGB: 'n', lanes: 'n', lanes2P: 'n?', pcieGen: 'n', maxSockets: 'n', igpu: 'b', ecc: 'b' },
  motherboard: { socket: 's', platforms: 'S', chipset: 's', formFactor: 's', sockets: 'n', memType: 's', memModules: 'S', ecc: 'b', dimmSlots: 'n',
    memChannels: 'n', maxMemGB: 'n', pcie: 'a', laneGroups: 'o?', m2: 'a', sata: 'n', nvmePorts: 'n', ocp: 'n', slotPositions: 'n', eps8: 'n',
    bmc: 'b', bifurcation: 'b', chipsetLanes: 'n', watts: 'n' },
  memory: { type: 's', module: 's', ecc: 'b', gb: 'n', sticks: 'n', speed: 'n' },
  gpu: { vramGB: 'n', gen: 'n', lanes: 'n', size: 'n', widthSlots: 'n', lengthMm: 'n', powerW: 'n', conn: 'o', cooling: 's', lowProfile: 'b' },
  storage: { iface: 's', form: 's', gen: 'n', tb: 'n', watts: 'n', media: 's' },
  controller: { kind: 's', gen: 'n', lanes: 'n', size: 'n', watts: 'n', widthSlots: 'n', lowProfile: 'b', sasPorts: 'n?', nvmePorts: 'n?',
    sataOnlyPorts: 'n?', m2Slots: 'n?', needsBifurcation: 'b?' },
  nic: { form: 's', speedG: 'n', ports: 'n', gen: 'n', lanes: 'n', size: 'n', watts: 'n', widthSlots: 'n', lowProfile: 'b' },
  psu: { form: 's', watts: 'n', efficiency: 's', redundant: 'b', builtInRedundant: 'b?', conn: 'o~' },
  case: { kind: 's', ru: 'n?', boards: 'S', psuForms: 'S', gpuMaxMm: 'n~', coolerMaxMm: 'n~', radMm: 'n~', slots: 'n', lowProfileOnly: 'b?', airflow: 's', bays: 'o' },
  cooler: { type: 's', sockets: 'S', heightMm: 'n', ratedW: 'n', radMm: 'n?' },
};
const ENUMS = {
  'cpu.memTypes': enumOf('DDR3', 'DDR4', 'DDR5'), 'cpu.memModules': enumOf('UDIMM', 'RDIMM', 'LRDIMM'),
  'motherboard.formFactor': enumOf(...FORM_FACTORS), 'motherboard.memType': enumOf('DDR3', 'DDR4', 'DDR5'), 'motherboard.memModules': enumOf('UDIMM', 'RDIMM', 'LRDIMM'),
  'memory.type': enumOf('DDR3', 'DDR4', 'DDR5'), 'memory.module': enumOf('UDIMM', 'RDIMM', 'LRDIMM'),
  'gpu.cooling': enumOf('open-air', 'blower', 'passive'),
  'storage.iface': enumOf('m2', 'sata', 'sas', 'u2', 'u3', 'e1s', 'e3s'), 'storage.form': enumOf('M.2 2280', 'M.2 22110', '2.5"', '3.5"', 'E1.S', 'E3.S'),
  'storage.media': enumOf('SSD', 'HDD'), 'nic.form': enumOf('pcie', 'ocp3'), 'psu.form': enumOf('ATX', 'SFX', 'Server module'),
  'case.kind': enumOf('tower', 'rack'), 'case.boards': enumOf(...FORM_FACTORS), 'case.psuForms': enumOf('ATX', 'SFX', 'Server module'),
  'case.airflow': enumOf('standard', 'server'), 'cooler.type': enumOf('air', 'aio', 'passive'),
};

function typeOk(v, t) {
  switch (t) {
    case 's': return typeof v === 'string' && v.length > 0;
    case 'n': return typeof v === 'number' && Number.isFinite(v) && v >= 0;
    case 'b': return typeof v === 'boolean';
    case 'S': return Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === 'string');
    case 'a': return Array.isArray(v);
    case 'o': return v !== null && typeof v === 'object' && !Array.isArray(v);
  }
  return false;
}
const TYPE_NAMES = { s: 'text', n: 'a number (0 or more)', b: 'true or false', S: 'a list of text values', a: 'a list', o: 'an object' };

function closest(word, options) {
  let best = null, bestD = 3;
  for (const o of options) {
    const d = lev(word.toLowerCase(), o.toLowerCase());
    if (d < bestD) { best = o; bestD = d; }
  }
  return best;
}
function lev(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

function validate(files) {
  const errors = [], warnings = [];
  const err = (f, msg) => errors.push(`${f}: ${msg}`);
  const warn = (f, msg) => warnings.push(`${f}: ${msg}`);
  const ids = new Map(), names = new Map();

  for (const f of files) {
    if (f.error) { err(f.file, `is not valid JSON (${f.error})`); continue; }
    const p = f.data;
    const schema = SCHEMA[f.cat];
    if (!schema) { err(f.file, `"${f.cat}" is not a category. Use one of: ${CATEGORY_ORDER.join(', ')}`); continue; }
    const spec = Object.assign({}, COMMON, schema);
    for (const [key, t] of Object.entries(spec)) {
      const optional = t.endsWith('?'), nullable = t.endsWith('~');
      const v = p[key];
      if (v === undefined) { if (!optional) err(f.file, `missing "${key}" (${TYPE_NAMES[t[0]]})`); continue; }
      if (v === null && nullable) continue;
      if (!typeOk(v, t[0])) { err(f.file, `"${key}" should be ${TYPE_NAMES[t[0]]}, got ${JSON.stringify(v)}`); continue; }
      const e = ENUMS[f.cat + '.' + key];
      if (e) for (const x of [].concat(v)) if (!e.enum.includes(x)) err(f.file, `"${key}" has "${x}"; allowed: ${e.enum.join(', ')}`);
    }
    for (const key of Object.keys(p)) {
      if (!(key in spec)) {
        const guess = closest(key, Object.keys(spec));
        warn(f.file, `unknown field "${key}"${guess ? ` (did you mean "${guess}"?)` : ''}`);
      }
    }
    if (typeof p.id === 'string') {
      if (!/^[a-z0-9][a-z0-9.-]*$/.test(p.id)) err(f.file, `id "${p.id}" should be lowercase letters, numbers, dots and dashes`);
      if (p.id !== f.base) err(f.file, `id "${p.id}" must match the file name (${f.base}.json)`);
      if (ids.has(p.id)) err(f.file, `id "${p.id}" is already used by ${ids.get(p.id)}`);
      ids.set(p.id, f.file);
    }
    if (typeof p.name === 'string') {
      const n = p.name.toLowerCase();
      if (names.has(n)) err(f.file, `name "${p.name}" is already used by ${names.get(n)}`);
      names.set(n, f.file);
    }
    if (Array.isArray(p.tags)) for (const t of p.tags) if (!TAGS.includes(t)) err(f.file, `tag "${t}" should be one of: ${TAGS.join(', ')}`);
    if (f.cat === 'motherboard' && Array.isArray(p.pcie)) {
      p.pcie.forEach((s, i) => {
        if (!s || !['n', 'size', 'lanes', 'gen'].every((k) => typeOk(s[k], 'n')) || !(s.cpu === 'pch' || s.cpu === 1 || s.cpu === 2))
          err(f.file, `pcie[${i}] needs n, size, lanes, gen (numbers) and cpu (1, 2 or "pch")`);
        else if (s.lanes > s.size) err(f.file, `pcie[${i}] has more lanes (x${s.lanes}) than its physical size (x${s.size})`);
      });
      (p.m2 || []).forEach((s, i) => {
        if (!s || !typeOk(s.n, 'n') || !typeOk(s.gen, 'n') || !typeOk(s.sizes, 'S') || !(s.cpu === 'pch' || s.cpu === 1 || s.cpu === 2))
          err(f.file, `m2[${i}] needs n, gen (numbers), cpu (1, 2 or "pch") and sizes (e.g. ["2280"])`);
      });
    }
  }

  // Cross-part checks
  const parts = files.filter((f) => f.data && !f.error).map((f) => Object.assign({ cat: f.cat, __file: f.file }, f.data));
  const boards = parts.filter((p) => p.cat === 'motherboard');
  const coolers = parts.filter((p) => p.cat === 'cooler');
  for (const c of parts.filter((p) => p.cat === 'cpu')) {
    if (!boards.some((b) => b.socket === c.socket && (b.platforms || []).includes(c.platform)))
      warn(c.__file, `no motherboard lists socket ${c.socket} with platform "${c.platform}" yet, so this CPU can't be built with`);
    if (!coolers.some((k) => (k.sockets || []).includes(c.socket))) warn(c.__file, `no cooler lists socket ${c.socket} yet`);
  }
  try {
    const presets = JSON.parse(fs.readFileSync(path.join(PARTS_DIR, '_presets.json'), 'utf8'));
    for (const pr of presets) for (const it of pr.items) if (!ids.has(it.id)) err('parts/_presets.json', `preset "${pr.name}" uses unknown part "${it.id}"`);
  } catch (e) { err('parts/_presets.json', e.message); }

  return { errors, warnings, count: parts.length };
}

if (require.main === module) {
  const files = loadPartFiles();
  const { errors, warnings, count } = validate(files);
  if (process.argv.includes('--fix')) for (const f of files) if (f.data) fs.writeFileSync(path.join(PARTS_DIR, '..', f.file), formatPart(f.data));
  for (const w of warnings) console.log('warning  ' + w);
  for (const e of errors) console.log('ERROR    ' + e);
  console.log(`${count} parts checked: ${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exit(errors.length ? 1 : 0);
}

module.exports = { validate, SCHEMA };
