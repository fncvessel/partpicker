const test = require('node:test');
const assert = require('node:assert');
const { validate } = require('../scripts/validate-parts.js');
const { loadPartFiles } = require('../lib/parts-io.js');

test('the shipped catalog validates cleanly', () => {
  const r = validate(loadPartFiles());
  assert.deepStrictEqual(r.errors, []);
});

test('validator explains common mistakes', () => {
  const file = (cat, base, data) => ({ cat, file: `parts/${cat}/${base}.json`, base, data });
  const r = validate([
    file('cpu', 'my-cpu', { id: 'my-cpuu', name: 'Test CPU', brand: 'X', price: 1, tags: ['gaming'], socket: 'AM5', platform: 'am5', coers: 8, threads: 16,
      powerW: 100, memTypes: ['DDR6'], memModules: ['UDIMM'], memChannels: 2, memSpeed: 5600, maxMemGB: 128, lanes: 24, pcieGen: 5, maxSockets: 1, igpu: true, ecc: false }),
    file('gizmo', 'thing', { id: 'thing' }),
  ]);
  const all = r.errors.join('\n') + '\n' + r.warnings.join('\n');
  for (const s of ['missing "cores"', 'did you mean "cores"', 'DDR6', 'must match the file name', 'tag "gaming"', '"gizmo" is not a category'])
    assert.ok(all.includes(s), `expected message containing ${s}\n${all}`);
});
