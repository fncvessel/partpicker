#!/usr/bin/env node
/* Bulk-imports consumer parts from the open PC Part Dataset
 * (https://github.com/docyx/pc-part-dataset, MIT, scraped July 2025) into
 * src/catalog.imported.json (one record per line).
 *
 * The dataset has names, prices and basic specs but not the wiring details the
 * compatibility engine needs (PCIe layout, power connectors, case clearances).
 * Those come from per-platform defaults below and are marked `estimated` so the
 * UI and engine can say so. Hand-curated parts in src/catalog.js always win.
 *
 *   node scripts/import-dataset.js            # downloads into data/raw/ if missing
 *   node scripts/import-dataset.js --offline  # only use data/raw/
 */
'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const RAW = path.join(ROOT, 'data', 'raw');
const OUT = path.join(ROOT, 'src', 'catalog.imported.json');
const BASE = 'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/';
const FILES = ['cpu', 'motherboard', 'memory', 'video-card', 'internal-hard-drive', 'power-supply', 'case'];
const DATASET_DATE = '2025-07-23';

// Current-market multipliers applied to July 2025 dataset prices, derived from parts
// whose prices were checked in Nov 2026 (see `street` in catalog.js). Rough, and flagged in the UI.
const PRICE_FACTOR = { cpu: 1.0, motherboard: 1.0, ddr5: 4.9, ddr4: 3.5, gpu: null /* computed per tier below */, nvme: 2.7, sataSsd: 2.2, hdd: 1.3, psu: 1.0, case: 1.0 };

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`${url}: HTTP ${res.statusCode}`));
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    }).on('error', reject);
  });
}

async function load(name, offline) {
  const file = path.join(RAW, name + '.json');
  if (!fs.existsSync(file)) {
    if (offline) throw new Error(`missing ${file}`);
    fs.mkdirSync(RAW, { recursive: true });
    fs.writeFileSync(file, await get(BASE + name + '.json'));
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const money = (n) => Math.round(n);

// ---------------------------------------------------------------- CPUs
const CPU_ARCH = {
  'Zen 5': 'am5', 'Zen 4': 'am5', 'Zen 3': 'am4', 'Zen 2': 'am4',
  'Arrow Lake': 'arrow-lake', 'Raptor Lake Refresh': 'core-12-14', 'Raptor Lake': 'core-12-14', 'Alder Lake': 'core-12-14',
  'Rocket Lake': 'comet-rocket', 'Comet Lake': 'comet-rocket',
};
const PLATFORM = {
  'am5': { socket: 'AM5', memTypes: ['DDR5'], maxMemGB: 256, lanes: 24, pcieGen: 5 },
  'am4': { socket: 'AM4', memTypes: ['DDR4'], maxMemGB: 128, lanes: 24, pcieGen: 4 },
  'arrow-lake': { socket: 'LGA1851', memTypes: ['DDR5'], maxMemGB: 256, lanes: 24, pcieGen: 5 },
  'core-12-14': { socket: 'LGA1700', memTypes: ['DDR4', 'DDR5'], maxMemGB: 192, lanes: 20, pcieGen: 5 },
  'comet-rocket': { socket: 'LGA1200', memTypes: ['DDR4'], maxMemGB: 128, lanes: 20, pcieGen: 4 },
};
function cpuPower(name, tdp, vendor) {
  if (vendor === 'AMD') return Math.round(tdp * 1.35); // PPT
  const big = /\b(i9|i7|Ultra 9|Ultra 7)\b/.test(name);
  if (tdp >= 125) return big ? 253 : 181;
  if (tdp >= 65) return big ? 219 : 154;
  return 106;
}
function importCpus(rows) {
  const out = [];
  for (const r of rows) {
    const platform = CPU_ARCH[r.microarchitecture];
    if (!platform || !r.price || !r.core_count || /Threadripper|Athlon/.test(r.name)) continue;
    const vendor = r.name.startsWith('AMD') ? 'AMD' : 'Intel';
    const pf = PLATFORM[platform];
    const isEpyc = /EPYC/.test(r.name);
    const apu = vendor === 'AMD' && /\d{4}G/.test(r.name);
    let memSpeed = 3200, lanes = pf.lanes, gen = pf.pcieGen;
    if (platform === 'am5') memSpeed = r.microarchitecture === 'Zen 5' ? 5600 : 5200;
    if (platform === 'arrow-lake') memSpeed = 6400;
    if (platform === 'core-12-14') memSpeed = /Alder/.test(r.microarchitecture) ? 4800 : 5600;
    if (platform === 'comet-rocket' && r.microarchitecture === 'Comet Lake') { memSpeed = 2933; lanes = 16; gen = 3; }
    if (apu) { lanes = 20; gen = platform === 'am5' ? 4 : 3; }
    const ecc = vendor === 'AMD' ? (platform === 'am5' || isEpyc) && !apu : platform === 'core-12-14' && !/\bi3\b/.test(r.name);
    out.push({
      rank: r.__rank, cat: 'cpu', id: 'ds-' + slug(r.name), name: r.name, brand: vendor, price: money(r.price * PRICE_FACTOR.cpu),
      tags: isEpyc ? ['server'] : ['consumer'], socket: pf.socket, platform,
      cores: r.core_count, threads: r.smt === false ? r.core_count : vendor === 'AMD' ? r.core_count * 2 : null,
      powerW: cpuPower(r.name, r.tdp || 65, vendor), memTypes: pf.memTypes, memModules: ['UDIMM'], memChannels: 2, memSpeed,
      maxMemGB: pf.maxMemGB, lanes, pcieGen: gen, maxSockets: 1, igpu: !!r.graphics, ecc,
      estimated: ['power', 'lanes', 'ecc'],
    });
  }
  return out;
}

// ---------------------------------------------------------------- Motherboards
const BOARD_SOCKETS = { AM5: 'am5', AM4: 'am4', LGA1851: 'arrow-lake', LGA1700: 'core-12-14', LGA1200: 'comet-rocket' };
const BOARD_FORM = { 'ATX': 'ATX', 'Micro ATX': 'mATX', 'Mini ITX': 'ITX', 'EATX': 'E-ATX' };
function boardGen(socket, chipset) {
  if (socket === 'AM5') return { gpu: /E$|X870|X670/.test(chipset) ? 5 : 4, m2: /A620/.test(chipset) ? 4 : 5 };
  if (socket === 'LGA1851') return { gpu: 5, m2: 5 };
  if (socket === 'LGA1700') return { gpu: /Z[67]90|W680/.test(chipset) ? 5 : 4, m2: 4 };
  if (socket === 'AM4') return { gpu: /X570|B550/.test(chipset) ? 4 : 3, m2: /X570|B550/.test(chipset) ? 4 : 3 };
  return { gpu: /[ZBH]5[69]0|W580/.test(chipset) ? 4 : 3, m2: /[ZBH]5[69]0/.test(chipset) ? 4 : 3 };
}
function importBoards(rows) {
  const out = [];
  for (const r of rows) {
    const platform = BOARD_SOCKETS[r.socket];
    const formFactor = BOARD_FORM[r.form_factor];
    if (!platform || !formFactor || !r.price || !r.memory_slots) continue;
    const m = r.name.match(/(?:^|[\s-])([ABXZHQW]\d{3}E?)(?:M|I)?(?=[\s-]|$)/i);
    const chipset = m ? m[1].toUpperCase() : 'Unknown';
    const memType = ['AM4', 'LGA1200'].includes(r.socket) ? 'DDR4' : r.socket === 'LGA1700' && /DDR4|\bD4\b/i.test(r.name) ? 'DDR4' : 'DDR5';
    const g = boardGen(r.socket, chipset);
    const s = (n, size, lanes, gen, cpu) => ({ n, size, lanes, gen, cpu });
    let pcie, m2, sata, slotPositions;
    if (formFactor === 'ITX') { pcie = [s(1, 16, 16, g.gpu, 1)]; m2 = [{ n: 1, gen: g.m2, cpu: 1, sizes: ['2280'] }, { n: 1, gen: Math.min(4, g.m2), cpu: 'pch', sizes: ['2280'] }]; sata = 2; slotPositions = 2; }
    else if (formFactor === 'mATX') { pcie = [s(1, 16, 16, g.gpu, 1), s(1, 16, 4, Math.min(4, g.gpu), 'pch')]; m2 = [{ n: 1, gen: g.m2, cpu: 1, sizes: ['2280'] }, { n: 1, gen: Math.min(4, g.m2), cpu: 'pch', sizes: ['2280'] }]; sata = 4; slotPositions = 4; }
    else { pcie = [s(1, 16, 16, g.gpu, 1), s(1, 16, 4, Math.min(4, g.gpu), 'pch'), s(1, 1, 1, 3, 'pch')]; m2 = [{ n: 1, gen: g.m2, cpu: 1, sizes: ['2280'] }, { n: 2, gen: Math.min(4, g.m2), cpu: 'pch', sizes: ['2280'] }]; sata = 4; slotPositions = 7; }
    out.push({
      rank: r.__rank, cat: 'motherboard', id: 'ds-' + slug(r.name), name: r.name, brand: r.name.split(' ')[0], price: money(r.price * PRICE_FACTOR.motherboard),
      tags: ['consumer'], socket: r.socket, platforms: [platform], chipset, formFactor, sockets: 1, memType, memModules: ['UDIMM'],
      ecc: chipset === 'W680', dimmSlots: r.memory_slots, memChannels: 2, maxMemGB: r.max_memory || PLATFORM[platform].maxMemGB,
      pcie, m2, sata, nvmePorts: 0, ocp: 0, slotPositions, eps8: formFactor === 'ITX' ? 1 : 2, bmc: false, bifurcation: false, chipsetLanes: 12, watts: 40,
      estimated: ['layout'],
    });
  }
  return out;
}

// ---------------------------------------------------------------- Memory
function importMemory(rows) {
  const out = [];
  for (const r of rows) {
    if (!r.price || !Array.isArray(r.speed) || !Array.isArray(r.modules)) continue;
    const [gen, speed] = r.speed;
    if (gen !== 4 && gen !== 5) continue;
    const [sticks, gb] = r.modules;
    if (r.price / (sticks * gb) > 8) continue; // marketplace outliers (July 2025 retail was ~$2-4/GB)
    const type = 'DDR' + gen;
    const base = r.name.replace(/\s+\d+\s*GB$/i, '');
    const name = `${base} ${type}-${speed} ${sticks * gb} GB (${sticks}×${gb})${r.cas_latency ? ` CL${r.cas_latency}` : ''}`;
    out.push({
      rank: r.__rank, cat: 'memory', id: 'ds-' + slug(name), name, brand: r.name.split(' ')[0], price: money(r.price * (gen === 5 ? PRICE_FACTOR.ddr5 : PRICE_FACTOR.ddr4)),
      tags: ['consumer'], type, module: 'UDIMM', ecc: false, gb, sticks, speed,
    });
  }
  return out;
}

// ---------------------------------------------------------------- GPUs
// chipset -> [board power W, PCIe lanes, PCIe gen, connectors]
const H = { h12v: 1 };
const P = (n) => (n ? { pcie8: n } : {});
const GPU = {
  'GeForce RTX 5090': [575, 16, 5, H], 'GeForce RTX 5080': [360, 16, 5, H], 'GeForce RTX 5070 Ti': [300, 16, 5, H], 'GeForce RTX 5070': [250, 16, 5, H],
  'GeForce RTX 5060 Ti': [180, 8, 5, P(1)], 'GeForce RTX 5060': [145, 8, 5, P(1)], 'GeForce RTX 5050': [130, 8, 5, P(1)],
  'GeForce RTX 4090': [450, 16, 4, H], 'GeForce RTX 4080 SUPER': [320, 16, 4, H], 'GeForce RTX 4080': [320, 16, 4, H],
  'GeForce RTX 4070 Ti SUPER': [285, 16, 4, H], 'GeForce RTX 4070 Ti': [285, 16, 4, H], 'GeForce RTX 4070 SUPER': [220, 16, 4, P(1)], 'GeForce RTX 4070': [200, 16, 4, P(1)],
  'GeForce RTX 4060 Ti': [160, 8, 4, P(1)], 'GeForce RTX 4060': [115, 8, 4, P(1)],
  'GeForce RTX 3090 Ti': [450, 16, 4, H], 'GeForce RTX 3090': [350, 16, 4, P(2)], 'GeForce RTX 3080 Ti': [350, 16, 4, P(2)], 'GeForce RTX 3080': [320, 16, 4, P(2)],
  'GeForce RTX 3070 Ti': [290, 16, 4, P(2)], 'GeForce RTX 3070': [220, 16, 4, P(2)], 'GeForce RTX 3060 Ti': [200, 16, 4, P(1)], 'GeForce RTX 3060': [170, 16, 4, P(1)], 'GeForce RTX 3050': [130, 8, 4, P(1)],
  'GeForce RTX 2080 Ti': [250, 16, 3, P(2)], 'GeForce RTX 2080 SUPER': [250, 16, 3, P(2)], 'GeForce RTX 2080': [215, 16, 3, P(2)], 'GeForce RTX 2070 SUPER': [215, 16, 3, P(2)],
  'GeForce RTX 2070': [175, 16, 3, P(1)], 'GeForce RTX 2060 SUPER': [175, 16, 3, P(1)], 'GeForce RTX 2060': [160, 16, 3, P(1)],
  'GeForce GTX 1660 SUPER': [125, 16, 3, P(1)], 'GeForce GTX 1660 Ti': [120, 16, 3, P(1)], 'GeForce GTX 1660': [120, 16, 3, P(1)], 'GeForce GTX 1650': [75, 16, 3, P(0)],
  'Radeon RX 9070 XT': [304, 16, 5, P(2)], 'Radeon RX 9070': [220, 16, 5, P(2)], 'Radeon RX 9060 XT': [160, 16, 5, P(1)],
  'Radeon RX 7900 XTX': [355, 16, 4, P(2)], 'Radeon RX 7900 XT': [315, 16, 4, P(2)], 'Radeon RX 7900 GRE': [260, 16, 4, P(2)], 'Radeon RX 7800 XT': [263, 16, 4, P(2)],
  'Radeon RX 7700 XT': [245, 16, 4, P(2)], 'Radeon RX 7600 XT': [190, 8, 4, P(1)], 'Radeon RX 7600': [165, 8, 4, P(1)],
  'Radeon RX 6950 XT': [335, 16, 4, P(2)], 'Radeon RX 6900 XT': [300, 16, 4, P(2)], 'Radeon RX 6800 XT': [300, 16, 4, P(2)], 'Radeon RX 6800': [250, 16, 4, P(2)],
  'Radeon RX 6750 XT': [250, 16, 4, P(2)], 'Radeon RX 6700 XT': [230, 16, 4, P(2)], 'Radeon RX 6650 XT': [180, 8, 4, P(1)], 'Radeon RX 6600 XT': [160, 8, 4, P(1)],
  'Radeon RX 6600': [132, 8, 4, P(1)], 'Radeon RX 6500 XT': [107, 4, 4, P(1)], 'Radeon RX 6400': [53, 4, 4, P(0)],
  'Arc B580': [190, 8, 4, P(1)], 'Arc B570': [150, 8, 4, P(1)], 'Arc A770': [225, 16, 4, P(2)], 'Arc A750': [225, 16, 4, P(2)], 'Arc A580': [185, 16, 4, P(2)], 'Arc A380': [75, 8, 4, P(0)],
};
// current price of a tier's typical card / July 2025 dataset median, from the Nov 2026 checks
const GPU_FACTOR_BY_GEN = (chip) => /RTX 50|RX 90|Arc B/.test(chip) ? 1.7 : /RTX 40|RX 7/.test(chip) ? 1.5 : 1.3;
function gpuSpec(chipset) {
  const key = Object.keys(GPU).filter((k) => chipset.startsWith(k)).sort((a, b) => b.length - a.length)[0];
  return key ? { key, spec: GPU[key] } : null;
}
function importGpus(rows) {
  const out = [];
  for (const r of rows) {
    if (!r.price || !r.chipset) continue;
    const g = gpuSpec(r.chipset);
    if (!g) continue;
    const [powerW, lanes, gen, conn] = g.spec;
    const name = r.name.includes(g.key.replace(/^(GeForce|Radeon) /, '')) ? r.name : `${r.name} (${g.key})`;
    out.push({
      rank: r.__rank, cat: 'gpu', id: 'ds-' + slug(name + '-' + r.memory), name, brand: r.name.split(' ')[0], price: money(r.price * GPU_FACTOR_BY_GEN(g.key)),
      tags: ['consumer'], vramGB: r.memory, gen, lanes, size: 16, widthSlots: powerW >= 300 ? 3 : powerW >= 200 ? 2.5 : 2,
      lengthMm: r.length || 280, powerW, conn, cooling: 'open-air', lowProfile: false, estimated: ['width', 'connectors'],
    });
  }
  return out;
}

// ---------------------------------------------------------------- Storage
function importStorage(rows) {
  const out = [];
  for (const r of rows) {
    if (!r.price || !r.capacity) continue;
    const ff = String(r.form_factor), itf = String(r.interface || '');
    let iface, form, gen = 0, watts, factor;
    const nvme = itf.match(/^M\.2 PCIe (\d)\.0 X4$/);
    if (nvme && (ff === 'M.2-2280' || ff === 'M.2-22110')) { iface = 'm2'; form = ff.replace('-', ' '); gen = +nvme[1]; watts = gen >= 5 ? 10 : 8; factor = PRICE_FACTOR.nvme; }
    else if (/^SATA/.test(itf) && (ff === '2.5' || ff === '3.5')) { iface = 'sata'; form = ff + '"'; }
    else if (/^SAS/.test(itf) && (ff === '2.5' || ff === '3.5')) { iface = 'sas'; form = ff + '"'; }
    else if (itf === 'U.2') { iface = 'u2'; form = '2.5"'; gen = 4; watts = 20; factor = PRICE_FACTOR.nvme; }
    else continue;
    const ssd = r.type === 'SSD';
    if (!watts) watts = ssd ? (iface === 'sas' ? 9 : 3) : form === '3.5"' ? 8 : 3;
    if (!factor) factor = ssd ? PRICE_FACTOR.sataSsd : PRICE_FACTOR.hdd;
    const tb = Math.round(r.capacity / 10) / 100;
    const cap = r.capacity >= 1000 ? `${tb} TB` : `${r.capacity} GB`;
    const name = `${r.name} ${cap}`;
    out.push({
      rank: r.__rank, cat: 'storage', id: 'ds-' + slug(name + '-' + iface), name, brand: r.name.split(' ')[0], price: money(r.price * factor),
      tags: iface === 'sas' || iface === 'u2' ? ['server'] : ['consumer'], iface, form, gen, tb, watts, media: ssd ? 'SSD' : 'HDD',
    });
  }
  return out;
}

// ---------------------------------------------------------------- PSUs
function importPsus(rows) {
  const out = [];
  for (const r of rows) {
    if (!r.price || !r.wattage || !['ATX', 'SFX'].includes(r.type)) continue;
    const w = r.wattage;
    const atx3 = /PCIE ?5|ATX ?3|12V-?2x6|12VHPWR/i.test(r.name);
    out.push({
      rank: r.__rank, cat: 'psu', id: 'ds-' + slug(r.name + '-' + w), name: `${r.name} ${w} W`, brand: r.name.split(' ')[0], price: money(r.price * PRICE_FACTOR.psu),
      tags: ['consumer'], form: r.type, watts: w, efficiency: r.efficiency ? r.efficiency[0].toUpperCase() + r.efficiency.slice(1) : 'Unrated',
      redundant: false, conn: { eps8: w >= 650 ? 2 : 1, pcie8: w < 650 ? 2 : w < 850 ? 3 : w < 1000 ? 4 : 6, h12v: atx3 ? 1 : 0 },
      estimated: ['connectors'],
    });
  }
  return out;
}

// ---------------------------------------------------------------- Cases
const CASE_TYPES = {
  'ATX Mid Tower': { boards: ['ITX', 'mATX', 'ATX'], slots: 7 },
  'ATX Full Tower': { boards: ['ITX', 'mATX', 'ATX', 'E-ATX'], slots: 8 },
  'MicroATX Mid Tower': { boards: ['ITX', 'mATX'], slots: 4 },
  'MicroATX Mini Tower': { boards: ['ITX', 'mATX'], slots: 4 },
  'Mini ITX Tower': { boards: ['ITX'], slots: 2, psuForms: ['SFX', 'ATX'] },
  'Mini ITX Desktop': { boards: ['ITX'], slots: 2, psuForms: ['SFX'] },
};
function importCases(rows) {
  const out = [];
  for (const r of rows) {
    const t = CASE_TYPES[r.type];
    if (!t || !r.price) continue;
    out.push({
      rank: r.__rank, cat: 'case', id: 'ds-' + slug(r.name + '-' + r.type), name: r.name, brand: r.name.split(' ')[0], price: money(r.price * PRICE_FACTOR.case),
      tags: ['consumer'], kind: 'tower', boards: t.boards, psuForms: t.psuForms || ['ATX', 'SFX'], gpuMaxMm: null, coolerMaxMm: null, radMm: null,
      slots: t.slots, airflow: 'standard', bays: { '3.5': r.internal_35_bays || 0, '2.5': 2 }, estimated: ['clearance'],
    });
  }
  return out;
}

function dedupe(list) {
  const seen = new Map();
  for (const p of list) {
    const prev = seen.get(p.id);
    if (!prev || p.price < prev.price) seen.set(p.id, p);
  }
  return Array.from(seen.values());
}

(async () => {
  const offline = process.argv.includes('--offline');
  const raw = {};
  for (const f of FILES) raw[f] = await load(f, offline);
  const groups = {
    cpu: importCpus(raw.cpu), motherboard: importBoards(raw.motherboard), memory: importMemory(raw.memory),
    gpu: importGpus(raw['video-card']), storage: importStorage(raw['internal-hard-drive']), psu: importPsus(raw['power-supply']), case: importCases(raw.case),
  };
  for (const f of FILES) raw[f].forEach((r, i) => { r.__rank = i + 1; });
  const parts = [];
  for (const [cat, list] of Object.entries(groups)) {
    const d = dedupe(list);
    for (const p of d) { p.source = 'dataset'; p.sourceDate = DATASET_DATE; }
    parts.push(...d);
    console.log(cat.padEnd(12), String(d.length).padStart(5));
  }
  const body = '[\n' + parts.map((p) => JSON.stringify(p)).join(',\n') + '\n]\n';
  fs.writeFileSync(OUT, body);
  console.log('total'.padEnd(12), String(parts.length).padStart(5), '->', path.relative(ROOT, OUT), (body.length / 1024).toFixed(0) + ' KB');
})().catch((e) => { console.error(e); process.exit(1); });
