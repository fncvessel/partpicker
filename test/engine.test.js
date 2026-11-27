const test = require('node:test');
const assert = require('node:assert');
const { parts, presets } = require('../src/catalog.js');
const { evaluate, checkCandidate } = require('../src/engine.js');

const ev = (items) => evaluate({ items }, parts);
const rules = (r, level) => r.issues.filter((i) => !level || i.level === level).map((i) => i.rule);

test('catalog ids are unique and presets reference real parts', () => {
  const ids = parts.map((p) => p.id);
  assert.strictEqual(new Set(ids).size, ids.length);
  for (const p of presets) for (const it of p.items) assert.ok(ids.includes(it.id), it.id);
});

for (const p of presets.filter((p) => p.key !== 'broken')) {
  test(`preset "${p.name}" has no errors`, () => {
    const r = ev(p.items);
    assert.deepStrictEqual(r.issues.filter((i) => i.level === 'error'), []);
  });
}

test('broken preset trips the expected rules', () => {
  const r = ev(presets.find((p) => p.key === 'broken').items);
  const e = rules(r, 'error');
  for (const rule of ['cpu-socket', 'mem-type', 'mem-module', 'mem-slots', 'sas-needs-hba', 'psu-capacity', 'cooler-height', 'bays'])
    assert.ok(e.includes(rule), `missing ${rule}: ${e.join(',')}`);
});

test('same socket, wrong platform', () => {
  const r = ev([{ id: 'xeon-gold-6430', qty: 1 }, { id: 'asus-w790e-sage', qty: 1 }]);
  assert.ok(rules(r, 'error').includes('cpu-platform'));
  const r2 = ev([{ id: 'tr-7980x', qty: 1 }, { id: 'asus-wrx90e-sage', qty: 1 }]);
  assert.ok(rules(r2, 'error').includes('cpu-platform'));
});

test('P-series EPYC refuses dual socket; half-populated 2S board warns', () => {
  const r = ev([{ id: 'epyc-9354p', qty: 2 }, { id: 'gigabyte-mz73-lm0', qty: 1 }]);
  assert.ok(rules(r, 'error').includes('cpu-maxsockets'));
  const r2 = ev([{ id: 'epyc-9654', qty: 1 }, { id: 'gigabyte-mz73-lm0', qty: 1 }, { id: 'samsung-ddr5-4800-32-rdimm', qty: 24 }]);
  assert.ok(rules(r2).includes('socket-empty'));
  assert.ok(rules(r2, 'error').includes('mem-slots'), 'only 12 slots work with one CPU');
});

test('UDIMM ECC on a non-ECC board warns; RDIMM on consumer errors', () => {
  assert.ok(rules(ev([{ id: 'msi-b650-tomahawk', qty: 1 }, { id: 'kingston-ddr5-4800-32-ecc', qty: 2 }])).includes('mem-ecc'));
  assert.ok(rules(ev([{ id: 'msi-b650-tomahawk', qty: 1 }, { id: 'samsung-ddr5-4800-32-rdimm', qty: 2 }]), 'error').includes('mem-module'));
});

test('passive GPU in a tower warns, low-profile chassis rejects full-height cards', () => {
  assert.ok(rules(ev([{ id: 'nvidia-l40s', qty: 1 }, { id: 'fractal-north', qty: 1 }])).includes('gpu-passive'));
  assert.ok(rules(ev([{ id: 'nvidia-l40s', qty: 1 }, { id: 'sm-cse-826', qty: 1 }]), 'error').includes('case-lowprofile'));
});

test('redundant modules: N+1 capacity and lost redundancy', () => {
  const base = [{ id: 'epyc-9654', qty: 2 }, { id: 'gigabyte-mz73-lm0', qty: 1 }, { id: 'nvidia-h100-nvl', qty: 4 }];
  const r = ev(base.concat({ id: 'sm-pws-1k62a', qty: 2 }));
  assert.ok(rules(r).includes('psu-redundancy-lost'), rules(r).join(','));
  assert.strictEqual(r.stats.power.capacity, 1600);
});

test('lane splitting on x8/x8 boards', () => {
  const r = ev([{ id: 'asus-proart-x870e', qty: 1 }, { id: 'r9-9950x', qty: 1 }, { id: 'rtx-5090-fe', qty: 1 }, { id: 'cx6-dx-100g', qty: 1 }]);
  assert.ok(rules(r).includes('pcie-split'));
});

test('bifurcation adapter adds M.2 slots', () => {
  const items = [{ id: 'msi-b650-tomahawk', qty: 1 }, { id: 'r7-9800x3d', qty: 1 }, { id: 'samsung-990-pro-2tb', qty: 6 }];
  assert.ok(rules(ev(items), 'error').includes('m2-slots'));
  assert.ok(!rules(ev(items.concat({ id: 'asus-hyper-m2-gen5', qty: 1 })), 'error').includes('m2-slots'));
});

test('checkCandidate explains why a part does not fit', () => {
  const build = { items: presets.find((p) => p.key === 'gaming').items };
  const bad = checkCandidate(build, parts.find((p) => p.id === 'sm-h13ssl-n'), parts);
  assert.strictEqual(bad.ok, false);
  assert.ok(bad.reasons.some((m) => m.includes('SP5')));
  const good = checkCandidate(build, parts.find((p) => p.id === 'r9-9950x'), parts);
  assert.strictEqual(good.ok, true, good.reasons.join(' | '));
});
