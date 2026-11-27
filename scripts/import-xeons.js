#!/usr/bin/env node
/* Imports socketed Intel Xeons (Nehalem through Ice Lake) from Wikipedia's "List of Intel Xeon
 * processors (...)" pages into parts/cpu/*.json. The pages use one {{cpulist}} template per model,
 * so we read the raw wikitext (one request per page, cached in data/raw/wiki/) and parse those.
 *
 * Wikipedia gives cores, threads, clocks, TDP, memory channels/speed and launch price. Platform
 * details (lanes, max memory, DIMM types, socket count) come from the per-family table below.
 * Prices are rough used-market estimates derived from launch price, shown with "~".
 *
 *   node scripts/import-xeons.js            # download missing pages, write new files only
 *   node scripts/import-xeons.js --offline  # only use data/raw/wiki/
 *   node scripts/import-xeons.js --force    # also overwrite files this script made before
 *   node scripts/import-xeons.js --dry      # print a summary, write nothing
 */
'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const { formatPart, PARTS_DIR } = require('../lib/parts-io.js');

const RAW = path.join(__dirname, '..', 'data', 'raw', 'wiki');
const OUT = path.join(PARTS_DIR, 'cpu');
const PAGES = {
  nehalem: 'Nehalem-based', sandy_bridge: 'Sandy Bridge–based', ivy_bridge: 'Ivy Bridge–based', haswell: 'Haswell-based',
  broadwell: 'Broadwell-based', skylake: 'Skylake-based', kaby_lake: 'Kaby Lake-based', coffee_lake: 'Coffee Lake-based',
  cascade_lake: 'Cascade Lake–based', ice_lake: 'Ice Lake-based',
};
const args = new Set(process.argv.slice(2));

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'slotwise-catalog-import/0.1' } }, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`${url}: HTTP ${res.statusCode}`));
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    }).on('error', reject);
  });
}
async function page(key) {
  const file = path.join(RAW, key + '.txt');
  if (!fs.existsSync(file)) {
    if (args.has('--offline')) throw new Error(`missing ${file}`);
    fs.mkdirSync(RAW, { recursive: true });
    const title = encodeURIComponent(`List of Intel Xeon processors (${PAGES[key]})`);
    fs.writeFileSync(file, await get(`https://en.wikipedia.org/w/index.php?title=${title}&action=raw`));
  }
  return fs.readFileSync(file, 'utf8');
}

// Pull every {{cpulist ...}} template out, matching nested braces, and split it into params.
function templates(text) {
  const out = [];
  let i = 0;
  while ((i = text.indexOf('{{cpulist', i)) !== -1) {
    let depth = 0, j = i;
    for (; j < text.length; j++) {
      if (text.startsWith('{{', j)) { depth++; j++; }
      else if (text.startsWith('}}', j)) { depth--; j++; if (depth === 0) break; }
    }
    out.push(text.slice(i + 2, j - 1));
    i = j;
  }
  return out.map((body) => {
    const clean = body.replace(/<ref[^>]*\/>/g, '').replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, '').replace(/\{\{[^{}]*\}\}/g, '').replace(/<!--[\s\S]*?-->/g, '');
    const params = { _pos: [] };
    for (const part of clean.split('|').slice(1)) {
      const eq = part.indexOf('=');
      if (eq === -1) params._pos.push(part.trim());
      else params[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
    }
    return params;
  });
}

// ---------------------------------------------------------------- families
// p: platform id, s: socket, ch/speed: fallback memory, mods: DIMM types, gb: max per socket,
// lanes/gen: CPU (or IOH) PCIe lanes, sockets: default max sockets, used: price factor vs launch.
const FAM = {
  'xeon-3400':       { s: 'LGA1156',   types: ['DDR3'], ch: 2, speed: 1333, mods: ['UDIMM', 'RDIMM'], gb: 32,   lanes: 16, gen: 2, sockets: 1, used: 0.012, min: 8,  tags: ['server', 'workstation'] },
  'lga1366':         { s: 'LGA1366',   types: ['DDR3'], ch: 3, speed: 1333, mods: ['UDIMM', 'RDIMM'], gb: 144,  lanes: 36, gen: 2, sockets: 2, used: 0.012, min: 6,  tags: ['server', 'workstation'], ioh: true },
  'xeon-7500-e7':    { s: 'LGA1567',   types: ['DDR3'], ch: 4, speed: 1066, mods: ['RDIMM'],          gb: 512,  lanes: 36, gen: 2, sockets: 4, used: 0.006, min: 8,  tags: ['server'], ioh: true },
  'xeon-e3-v1v2':    { s: 'LGA1155',   types: ['DDR3'], ch: 2, speed: 1600, mods: ['UDIMM'],          gb: 32,   lanes: 16, gen: 3, sockets: 1, used: 0.06,  min: 10, tags: ['server', 'workstation'] },
  'xeon-e3-v3v4':    { s: 'LGA1150',   types: ['DDR3'], ch: 2, speed: 1600, mods: ['UDIMM'],          gb: 32,   lanes: 16, gen: 3, sockets: 1, used: 0.08,  min: 12, tags: ['server', 'workstation'] },
  'xeon-e3-v5v6':    { s: 'LGA1151',   types: ['DDR4'], ch: 2, speed: 2400, mods: ['UDIMM'],          gb: 64,   lanes: 16, gen: 3, sockets: 1, used: 0.12,  min: 15, tags: ['server', 'workstation'] },
  'xeon-e-2100-2200':{ s: 'LGA1151',   types: ['DDR4'], ch: 2, speed: 2666, mods: ['UDIMM'],          gb: 128,  lanes: 16, gen: 3, sockets: 1, used: 0.25,  min: 30, tags: ['server', 'workstation'] },
  'xeon-e5-2400':    { s: 'LGA1356',   types: ['DDR3'], ch: 3, speed: 1600, mods: ['UDIMM', 'RDIMM', 'LRDIMM'], gb: 384, lanes: 24, gen: 3, sockets: 2, used: 0.01, min: 5, tags: ['server'] },
  'xeon-e5-v1v2':    { s: 'LGA2011',   types: ['DDR3'], ch: 4, speed: 1600, mods: ['UDIMM', 'RDIMM', 'LRDIMM'], gb: 768, lanes: 40, gen: 3, sockets: 2, used: 0.012, min: 5, tags: ['server'] },
  'xeon-e5-v3v4':    { s: 'LGA2011-3', types: ['DDR4'], ch: 4, speed: 2133, mods: ['RDIMM', 'LRDIMM'], gb: 768,  lanes: 40, gen: 3, sockets: 2, used: 0.03,  min: 8,  tags: ['server'] },
  'xeon-e7-v2':      { s: 'LGA2011-1', types: ['DDR3'], ch: 4, speed: 1600, mods: ['RDIMM', 'LRDIMM'], gb: 1536, lanes: 32, gen: 3, sockets: 4, used: 0.008, min: 10, tags: ['server'] },
  'xeon-e7-v3v4':    { s: 'LGA2011-1', types: ['DDR4', 'DDR3'], ch: 4, speed: 1866, mods: ['RDIMM', 'LRDIMM'], gb: 3072, lanes: 32, gen: 3, sockets: 4, used: 0.01, min: 15, tags: ['server'] },
  'xeon-w-2100-2200':{ s: 'LGA2066',   types: ['DDR4'], ch: 4, speed: 2666, mods: ['RDIMM', 'LRDIMM'], gb: 512,  lanes: 48, gen: 3, sockets: 1, used: 0.12,  min: 40, tags: ['workstation'] },
  'xeon-w-3200':     { s: 'LGA3647',   types: ['DDR4'], ch: 6, speed: 2933, mods: ['RDIMM', 'LRDIMM'], gb: 1024, lanes: 64, gen: 3, sockets: 1, used: 0.12,  min: 150, tags: ['workstation'] },
  'xeon-sp-1-2':     { s: 'LGA3647',   types: ['DDR4'], ch: 6, speed: 2666, mods: ['RDIMM', 'LRDIMM'], gb: 768,  lanes: 48, gen: 3, sockets: 2, used: 0.03,  min: 10, tags: ['server'] },
  'xeon-sp-3':       { s: 'LGA4189',   types: ['DDR4'], ch: 8, speed: 3200, mods: ['RDIMM', 'LRDIMM'], gb: 6144, lanes: 64, gen: 4, sockets: 2, used: 0.12,  min: 60, tags: ['server'] },
};

// Model number (without "Xeon ") -> family id and tweaks, or null to skip (BGA, oddballs).
function classify(m) {
  let r;
  if ((r = /^E3-12\d\d\w* ?(v[2-6])?$/.exec(m))) {
    const v = r[1] || 'v1';
    return { fam: { v1: 'xeon-e3-v1v2', v2: 'xeon-e3-v1v2', v3: 'xeon-e3-v3v4', v4: 'xeon-e3-v3v4', v5: 'xeon-e3-v5v6', v6: 'xeon-e3-v5v6' }[v] };
  }
  if (/^E-2[12]\d\d\w*$/.test(m)) return /M|ME$/.test(m) ? null : { fam: 'xeon-e-2100-2200' };
  if ((r = /^E5-([124])(\d)\d\d\w* ?(v[1-4])?$/.exec(m))) {
    const v = r[3] || 'v1', first = r[1], second = r[2];
    if (second === '4') return v === 'v1' || v === 'v2' ? { fam: 'xeon-e5-2400', sockets: first === '1' ? 1 : 2 } : null;
    if (second !== '6') return null;
    return { fam: v === 'v1' || v === 'v2' ? 'xeon-e5-v1v2' : 'xeon-e5-v3v4', sockets: { 1: 1, 2: 2, 4: 4 }[first], gen: v };
  }
  if ((r = /^E7-([248])8\d\d\w* ?(v[2-4])?$/.exec(m))) {
    const v = r[2] || 'v1';
    return { fam: v === 'v1' ? 'xeon-7500-e7' : v === 'v2' ? 'xeon-e7-v2' : 'xeon-e7-v3v4', sockets: +r[1], gen: v };
  }
  if ((r = /^[XEL]7\d\d\d$/.exec(m))) return { fam: 'xeon-7500-e7', sockets: /^X/.test(m) ? 8 : 4 };
  if (/^[XEL]65\d\d$/.test(m)) return { fam: 'xeon-7500-e7', sockets: 2 };
  if (/^[XLW]3[56]\d\d$/.test(m)) return { fam: 'lga1366', sockets: 1 };
  if (/^[XEWL]5[56]\d\d$/.test(m)) return { fam: 'lga1366', sockets: 2 };
  if (/^[XL]34\d\d$/.test(m)) return { fam: 'xeon-3400', sockets: 1 };
  if (/^W-2[12]\d\d\w?$/.test(m)) return { fam: 'xeon-w-2100-2200', gen: m[3] === '2' ? 'w2200' : 'w2100' };
  if (/^W-32\d\d\w?$/.test(m)) return { fam: 'xeon-w-3200' };
  if ((r = /^(Bronze|Silver|Gold|Platinum) (P-)?([3-8])(\d)(\d\d)(\w*)$/.exec(m))) {
    const tier = r[1], gen = +r[4], suffix = r[6];
    if (gen === 3) return { fam: 'xeon-sp-3', sockets: /U/.test(suffix) ? 1 : 2, suffix };
    if (gen !== 1 && gen !== 2) return null;
    const sockets = /U/.test(suffix) ? 1 : tier === 'Platinum' ? 8 : tier === 'Gold' ? 4 : 2;
    return { fam: 'xeon-sp-1-2', sockets, suffix, gen: gen === 1 ? 'sp1' : 'sp2' };
  }
  return null;
}

const num = (s) => { const r = /[\d.]+/.exec(String(s || '').replace(/,/g, '')); return r ? parseFloat(r[0]) : null; };

// CPUs without Hyper-Threading, where Wikipedia leaves the threads field out.
function noHT(m, c) {
  if (/^E3-12[23][05]\w* ?(v[2-6])?$/.test(m) && /^E3-122/.test(m)) return true;     // E3-1220/1225
  if (/^E5-[124]6\d[39]/.test(m) || /^E5-24\d[37]/.test(m)) return true;               // E5-x603/x609, E5-2403/2407
  if (/^[EL]55\d\d$/.test(m) && +m.slice(-2) < 20) return true;                         // E5502–E5507
  if (/^[EL]56\d\d$/.test(m) && +m.slice(-2) < 20 && m !== 'L5618') return true;        // E5603–E5607, L5609
  if (/^X34[0-3]\d$/.test(m)) return true;
  if (c.gfx === undefined && /^Bronze/.test(m)) return true;
  return false;
}

function maxMem(fam, cls, model) {
  const f = FAM[fam];
  if (fam === 'lga1366') return cls.sockets === 1 ? 24 : 144;
  if (fam === 'xeon-e5-v1v2') return cls.gen === 'v2' ? 768 : 384;
  if (fam === 'xeon-e5-v3v4') return cls.gen === 'v4' ? 1536 : 768;
  if (fam === 'xeon-e7-v3v4') return cls.gen === 'v4' ? 3072 : 1536;
  if (fam === 'xeon-w-2100-2200') return cls.gen === 'w2200' ? 1024 : 512;
  if (fam === 'xeon-w-3200') return /M$/.test(model) ? 2048 : 1024;
  if (fam === 'xeon-sp-1-2') {
    const s = cls.suffix || '';
    if (cls.gen === 'sp1') return /M/.test(s) ? 1536 : 768;
    return /L/.test(s) ? 4608 : /M/.test(s) ? 2048 : 1024;
  }
  return f.gb;
}

function usedPrice(fam, launch, cores) {
  const f = FAM[fam];
  const base = launch || cores * 120; // OEM-only parts: guess a launch price from core count
  const est = Math.max(f.min, base * f.used);
  return est < 50 ? Math.round(est) : est < 200 ? Math.round(est / 5) * 5 : Math.round(est / 10) * 10;
}

function build(t, file) {
  const raw = (t.model || '').replace(/'''/g, '').replace(/\[\[([^|\]]*\|)?([^\]]*)\]\]/g, '$2').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  if (!/^Xeon /.test(raw)) return null;
  const model = raw.slice(5);
  if (t.sock1 || /BGA/i.test(t.sock || '')) return null; // soldered
  const cls = classify(model);
  if (!cls) return null;
  const f = FAM[cls.fam];
  const cores = num(t.cores);
  if (!cores) return null;
  const gfx = !!(t.gfxmodel && t.gfxmodel.trim());
  const threads = num(t.threads) || (noHT(model, { gfx: gfx || undefined }) ? cores : cores * 2);

  // Memory: "4× DDR3-1600<br />4× DDR4-1866" -> channels 4, types, top speed of the first type
  const mem = (t.mem || '').replace(/<br\s*\/?>/g, ' ');
  const types = [];
  let speed = null, ch = null;
  for (const r of mem.matchAll(/(?:(\d+)\s*×\s*)?DDR([34])L?(?:-(\d{3,4}))?/g)) {
    const ty = 'DDR' + r[2];
    if (!types.includes(ty)) types.push(ty);
    if (ty === types[0]) { if (r[1]) ch = Math.max(ch || 0, +r[1]); if (r[3]) speed = Math.max(speed || 0, +r[3]); }
  }
  if (!speed && num(t.memspeed)) speed = num(t.memspeed);
  if (!speed && /^W35/.test(model)) speed = 1066; // Bloomfield runs DDR3-800/1066
  // Prefer the platform's main memory type first (E3 v5 lists DDR4 and DDR3L).
  const memTypes = types.length ? types.filter((x) => f.types.includes(x) || types.length === 1) : f.types.slice();
  if (!memTypes.length) memTypes.push(...f.types);
  if (cls.fam === 'xeon-e7-v3v4' && !memTypes.includes('DDR3')) memTypes.push('DDR3');

  const tdp = num(t.tdp);
  const bclk = cls.fam === 'lga1366' || cls.fam === 'xeon-3400' || cls.fam === 'xeon-7500-e7' ? 0.1333 : 0.1; // Nehalem used a 133 MHz base clock
  const base = num(t.mult) ? num(t.mult) * bclk : null;
  const launch = /\$/.test(t.price || '') ? num(t.price) : null;
  const name = 'Intel Xeon ' + model;
  const id = name.toLowerCase().replace(/^intel /, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const sockets = cls.sockets || f.sockets;
  const tags = sockets > 1 ? ['server'] : f.tags.slice();
  const notesBits = [];
  if (base) notesBits.push(`${base.toFixed(1)} GHz base`);
  if (num(t.l3)) notesBits.push(`${num(t.l3)} MB L3`);
  if (f.ioh) notesBits.push('PCIe lanes come from the board chipset (IOH)');
  if (!launch) notesBits.push('OEM part');
  return {
    id, name, brand: 'Intel', price: usedPrice(cls.fam, launch, cores), tags,
    memTypes, memModules: f.mods.slice(), ecc: true, igpu: gfx, socket: f.s, platform: cls.fam,
    memChannels: ch || f.ch, memSpeed: speed || f.speed, maxMemGB: maxMem(cls.fam, cls, model),
    lanes: f.lanes, pcieGen: f.gen, maxSockets: sockets, cores, threads,
    powerW: tdp || 95,
    estimated: tdp ? ['lanes'] : ['power', 'lanes'],
    notes: `${notesBits.join(', ')}. Used-market price estimate.`,
    url: t.ark && /^\d+$/.test(t.ark) ? `https://www.intel.com/content/www/us/en/products/sku/${t.ark}.html` : undefined,
    __src: file,
  };
}

async function main() {
  const rows = [];
  for (const key of Object.keys(PAGES)) for (const t of templates(await page(key))) rows.push({ t, key });
  const seen = new Set();
  const parts = [];
  const skipped = {};
  const WORDS = { single: 1, dual: 2, four: 4, quad: 4, six: 6, eight: 8, ten: 10, twelve: 12, fourteen: 14, fifteen: 15, sixteen: 16, eighteen: 18, twenty: 20, 'twenty-two': 22 };
  let sectionCores = null, lastKey = null;
  for (const { t, key } of rows) {
    if (key !== lastKey) { sectionCores = null; lastKey = key; }
    if (t.section) { sectionCores = WORDS[t.section.toLowerCase().split(/[ ,]/)[0]] || null; continue; }
    if (!t.model) continue;
    if (!t.cores && sectionCores) t.cores = String(sectionCores);
    const p = build(t, key);
    if (!p) { skipped[key] = (skipped[key] || 0) + 1; if (args.has("--why")) console.log("skip", key, (t.model || "").slice(0, 30), t.sock || t.sock1 || ""); continue; }
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    parts.push(p);
  }
  const byPlat = {};
  for (const p of parts) byPlat[p.platform] = (byPlat[p.platform] || 0) + 1;
  console.log(`${rows.length} rows, ${parts.length} socketed Xeons`, byPlat, 'skipped', skipped);

  if (args.has('--dry')) {
    for (const p of parts.filter((_, i) => i % 60 === 0)) console.log(JSON.stringify(p));
    return;
  }
  let wrote = 0, kept = 0;
  for (const p of parts) {
    delete p.__src;
    if (!p.url) delete p.url;
    const file = path.join(OUT, p.id + '.json');
    if (fs.existsSync(file)) {
      const old = JSON.parse(fs.readFileSync(file, 'utf8'));
      // Only overwrite with --force, and never a file a person has edited (no "Used-market" note).
      if (!args.has('--force') || !/Used-market price estimate/.test(old.notes || '')) { kept++; continue; }
    }
    fs.writeFileSync(file, formatPart(p));
    wrote++;
  }
  console.log(`wrote ${wrote} files, kept ${kept} existing`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
