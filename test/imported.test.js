const test = require('node:test');
const assert = require('node:assert');
const { parts } = require('../src/catalog.js');
const { evaluate } = require('../src/engine.js');

const imported = parts.filter((p) => p.source === 'dataset');
const of = (cat) => imported.filter((p) => p.cat === cat);

test('import added parts in every category', () => {
  for (const cat of ['cpu', 'motherboard', 'memory', 'gpu', 'storage', 'psu', 'case']) assert.ok(of(cat).length > 50 || (cat === 'cpu' && of(cat).length > 20), cat);
  const ids = parts.map((p) => p.id);
  assert.strictEqual(new Set(ids).size, ids.length, 'ids unique after merge');
});

test('every imported CPU has a board with its socket and platform', () => {
  const boards = parts.filter((p) => p.cat === 'motherboard');
  for (const c of of('cpu')) assert.ok(boards.some((b) => b.socket === c.socket && b.platforms.includes(c.platform)), c.name);
});

test('a plain imported AM4 build is error-free', () => {
  const cpu = of('cpu').find((p) => p.socket === 'AM4' && !p.igpu);
  const board = of('motherboard').find((p) => p.socket === 'AM4' && p.formFactor === 'ATX' && /B550/.test(p.chipset));
  const mem = of('memory').find((p) => p.type === 'DDR4' && p.sticks === 2);
  const gpu = of('gpu').find((p) => p.powerW < 250);
  const ssd = of('storage').find((p) => p.iface === 'm2');
  const psu = of('psu').find((p) => p.form === 'ATX' && p.watts >= 750);
  const chassis = of('case').find((p) => p.boards.includes('ATX'));
  const items = [cpu, board, mem, gpu, ssd, psu, chassis, parts.find((p) => p.id === 'thermalright-pa120se')].map((p) => ({ id: p.id, qty: 1 }));
  const r = evaluate({ items }, parts);
  assert.deepStrictEqual(r.issues.filter((i) => i.level === 'error'), []);
  assert.ok(r.issues.some((i) => i.rule === 'est-layout'));
});

test('random builds never crash the engine', () => {
  let seed = 7;
  const rnd = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
  for (let i = 0; i < 300; i++) {
    const items = Array.from({ length: 1 + rnd(9) }, () => ({ id: parts[rnd(parts.length)].id, qty: 1 + rnd(3) }));
    const r = evaluate({ items }, parts);
    assert.ok(Array.isArray(r.issues));
    assert.ok(Number.isFinite(r.stats.power.draw));
  }
});
