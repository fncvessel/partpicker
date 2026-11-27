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

test('server lineups: SP6 build is clean, 1P-only parts refuse 2S boards', () => {
  const r = ev([{ id: 'epyc-8434p', qty: 1 }, { id: 'gigabyte-me33-ar0', qty: 1 }, { id: 'samsung-ddr5-4800-32-rdimm', qty: 6 },
    { id: 'noctua-d9-tr5-sp6', qty: 1 }, { id: 'micron-7450-pro-3.84', qty: 4 }, { id: 'phanteks-pro2-server', qty: 1 }, { id: 'seasonic-focus-gx-1000', qty: 1 }]);
  assert.deepStrictEqual(r.issues.filter((i) => i.level === 'error'), []);
  assert.ok(rules(ev([{ id: 'xeon-gold-5512u', qty: 2 }, { id: 'asus-z13pe-d16', qty: 1 }]), 'error').includes('cpu-maxsockets'));
  assert.ok(rules(ev([{ id: 'xeon-w9-3595x', qty: 1 }, { id: 'sm-x13sei-f', qty: 1 }]), 'error').includes('cpu-platform'));
  assert.strictEqual(parts.find((p) => p.id === 'epyc-9754s').threads, 128);
});

test('DDR4 Threadripper: TRX40 and WRX80 builds are clean, generations stay apart', () => {
  const trx = ev([{ id: 'tr-3970x', qty: 1 }, { id: 'asrock-trx40-creator', qty: 1 }, { id: 'kingston-ddr4-3200-32-ecc', qty: 4 }, { id: 'noctua-u14s-tr4-sp3', qty: 1 },
    { id: 'rtx-a4000', qty: 1 }, { id: 'samsung-990-pro-2tb', qty: 1 }, { id: 'seasonic-focus-gx-1000', qty: 1 }, { id: 'fractal-define-7-xl', qty: 1 }]);
  assert.deepStrictEqual(trx.issues.filter((i) => i.level === 'error'), []);
  const wrx = ev([{ id: 'tr-pro-5975wx', qty: 1 }, { id: 'asus-wrx80e-sage', qty: 1 }, { id: 'samsung-ddr4-3200-64-rdimm', qty: 8 }, { id: 'arctic-freezer-4u-sp3', qty: 1 }]);
  assert.deepStrictEqual(wrx.issues.filter((i) => i.level === 'error'), []);
  assert.ok(rules(ev([{ id: 'tr-3970x', qty: 1 }, { id: 'asus-zenith-extreme', qty: 1 }]), 'error').includes('cpu-socket'));
  assert.ok(rules(ev([{ id: 'tr-3970x', qty: 1 }, { id: 'asrock-trx40-creator', qty: 1 }, { id: 'samsung-ddr4-3200-32-rdimm', qty: 4 }]), 'error').includes('mem-module'));
});

test('Legacy Xeons: DDR3 and DDR4 server builds are clean, platforms and generations stay apart', () => {
  const x9 = ev([{ id: 'xeon-e5-2680-v2', qty: 2 }, { id: 'supermicro-x9dri-ln4f-plus', qty: 1 }, { id: 'samsung-ddr3-1600-16-rdimm', qty: 8 }, { id: 'noctua-nh-u9dx-i4', qty: 2 }]);
  assert.deepStrictEqual(x9.issues.filter((i) => i.level === 'error'), []);
  const x11 = ev([{ id: 'xeon-gold-6230', qty: 1 }, { id: 'supermicro-x11spi-tf', qty: 1 }, { id: 'samsung-ddr4-2933-64-rdimm', qty: 6 }, { id: 'noctua-nh-u12s-dx-3647', qty: 1 }]);
  assert.deepStrictEqual(x11.issues.filter((i) => i.level === 'error'), []);
  assert.ok(rules(ev([{ id: 'xeon-e5-2680-v2', qty: 1 }, { id: 'supermicro-x9srl-f', qty: 1 }, { id: 'samsung-ddr4-2400-32-rdimm', qty: 4 }]), 'error').includes('mem-type'));
  assert.ok(rules(ev([{ id: 'xeon-e-2288g', qty: 1 }, { id: 'supermicro-x11ssh-f', qty: 1 }]), 'error').includes('cpu-platform'));
  assert.ok(rules(ev([{ id: 'xeon-e3-1230-v2', qty: 1 }, { id: 'supermicro-x9scm-f', qty: 1 }, { id: 'samsung-ddr3-1600-16-rdimm', qty: 2 }]), 'error').includes('mem-module'));
  assert.ok(rules(ev([{ id: 'xeon-e5-2680-v2', qty: 1 }, { id: 'supermicro-x9dri-ln4f-plus', qty: 1 }, { id: 'samsung-ddr3-1600-16-rdimm', qty: 12 }])).includes('mem-3dpc'));
});
