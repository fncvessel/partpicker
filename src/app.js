(function () {
  'use strict';
  const { parts, presets, pricesAsOf, mergeImported } = window.SLOTWISE_CATALOG;
  const { evaluate, checkCandidate, errorKeys, CATEGORIES, IFACE_NAMES } = window.SLOTWISE_ENGINE;
  const byId = new Map(parts.map((p) => [p.id, p]));
  const STORE_KEY = 'slotwise.build.v2';

  const $ = (sel, el) => (el || document).querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const asOf = new Date(pricesAsOf + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const priceTag = (p, n) => p.priceChecked
    ? `<span class="price" title="Lowest US street price seen ${asOf}">${money(n)}</span>`
    : `<span class="price est" title="${p.source === 'dataset' ? 'Estimate: July 2025 listing adjusted for current market prices' : 'Estimate. No current listing found.'}">~${money(n)}</span>`;
  const PICK_LIMIT = 120;

  // ---------- state ----------
  let build = load() || { name: 'My build', items: [] };
  let pick = { cat: null, q: '', seg: 'all', onlyOk: true, sort: 'popular' };

  function clone(p) { return { name: p.name, items: p.items.map((i) => ({ id: i.id, qty: i.qty })) }; }
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      const b = JSON.parse(raw);
      if (!b || !Array.isArray(b.items)) return null;
      return { name: String(b.name || 'My build'), items: b.items.filter((i) => byId.has(i.id)).map((i) => ({ id: i.id, qty: Math.max(1, i.qty | 0) })) };
    } catch (e) { return null; }
  }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(build)); } catch (e) { /* storage unavailable */ } }
  function commit() { save(); render(); }

  // ---------- spec lines ----------
  const join = (a) => a.filter(Boolean).join(' · ');
  function specLine(p) {
    switch (p.cat) {
      case 'cpu': return join([p.socket, p.threads ? `${p.cores}C/${p.threads}T` : `${p.cores} cores`, `${p.powerW} W`, `${p.memChannels}-ch ${p.memTypes.join('/')} ${p.memModules.join('/')}`, `${p.lanes} lanes PCIe ${p.pcieGen}.0`, p.maxSockets > 1 ? `up to ${p.maxSockets}P` : '1P only', p.igpu ? 'iGPU' : '']);
      case 'motherboard': {
        const slots = p.pcie.reduce((s, g) => s + g.n, 0), m2n = p.m2.reduce((s, g) => s + g.n, 0);
        return join([p.sockets > 1 ? `${p.sockets}× ${p.socket}` : p.socket, p.chipset, p.formFactor, `${p.dimmSlots}× ${p.memType} ${p.memModules.join('/')}${p.ecc ? ' ECC' : ''}`, `${slots} PCIe`, `${m2n} M.2`, p.sata ? `${p.sata} SATA` : '', p.nvmePorts ? `${p.nvmePorts} NVMe ports` : '', p.ocp ? 'OCP 3.0' : '', p.bmc ? 'BMC' : '']);
      }
      case 'memory': return join([`${p.type} ${p.module}${p.ecc ? ' ECC' : ''}`, `${p.sticks}× ${p.gb} GB`, `${p.speed} MT/s`]);
      case 'gpu': return join([`${p.vramGB} GB`, `PCIe ${p.gen}.0 x${p.lanes}`, `${p.widthSlots}-slot`, `${p.lengthMm} mm`, `${p.powerW} W`, p.cooling, p.lowProfile ? 'low profile' : '']);
      case 'storage': return join([IFACE_NAMES[p.iface], p.form, `${p.tb} TB`, p.media, p.gen ? `PCIe ${p.gen}.0` : '']);
      case 'controller': return join([p.kind, `PCIe ${p.gen}.0 x${p.lanes}`, p.sasPorts ? `${p.sasPorts} SAS/SATA` : '', p.sataOnlyPorts ? `${p.sataOnlyPorts} SATA` : '', p.nvmePorts ? `${p.nvmePorts} NVMe` : '', p.m2Slots ? `${p.m2Slots}× M.2, needs bifurcation` : '']);
      case 'nic': return join([`${p.ports}× ${p.speedG} GbE`, p.form === 'ocp3' ? 'OCP 3.0' : `PCIe ${p.gen}.0 x${p.lanes}`, `${p.watts} W`]);
      case 'psu': return join([p.form, `${p.watts} W`, `80+ ${p.efficiency}`, p.redundant ? (p.builtInRedundant ? '1+1 redundant' : 'hot-swap module') : '']);
      case 'case': {
        const bays = Object.entries(p.bays).filter(([, n]) => n).map(([k, n]) => `${n}× ${({ '3.5': '3.5"', '2.5': '2.5"', nvme: '2.5" NVMe', e1s: 'E1.S', e3s: 'E3.S' })[k]}`).join(', ');
        return join([p.kind === 'rack' ? `${p.ru}U rack` : 'Tower', `up to ${p.boards[p.boards.length - 1]}`, p.lowProfileOnly ? 'low-profile cards' : `GPU ${p.gpuMaxMm} mm`, `cooler ${p.coolerMaxMm} mm`, bays]);
      }
      case 'cooler': return join([p.type === 'aio' ? `${p.radMm} mm AIO` : p.type, p.sockets.join('/'), p.type === 'aio' ? '' : `${p.heightMm} mm`, `~${p.ratedW} W`]);
      default: return '';
    }
  }

  // ---------- render ----------
  function render() {
    const result = evaluate(build, parts);
    const flagged = {};
    for (const i of result.issues) {
      if (i.level === 'info') continue;
      for (const id of i.parts) if (flagged[id] !== 'error') flagged[id] = i.level;
    }
    $('#build-name').value = build.name;
    $('#rows').innerHTML = CATEGORIES.map((c) => renderCat(c, flagged)).join('');
    $('#report').innerHTML = renderReport(result);
  }

  function renderCat(cat, flagged) {
    const rows = build.items.map((it, idx) => ({ it, idx, p: byId.get(it.id) })).filter((r) => r.p && r.p.cat === cat.key);
    const body = rows.map(({ it, idx, p }) => `
      <div class="part ${flagged[p.id] ? 'is-' + flagged[p.id] : ''}">
        <div class="part-main">
          <div class="part-name">${flagged[p.id] ? `<span class="dot" title="${flagged[p.id] === 'error' ? 'Has a problem' : 'Has a warning'}"></span>` : ''}${esc(p.name)}</div>
          <div class="spec">${esc(specLine(p))}</div>
        </div>
        <div class="part-side">
          ${cat.singleQty ? '<span class="qty-fixed"></span>' : `
          <div class="qty" role="group" aria-label="Quantity">
            <button type="button" data-act="dec" data-idx="${idx}" aria-label="One fewer">−</button>
            <span>${it.qty}</span>
            <button type="button" data-act="inc" data-idx="${idx}" aria-label="One more">+</button>
          </div>`}
          ${priceTag(p, p.price * it.qty)}
          <button type="button" class="icon-btn" data-act="remove" data-idx="${idx}" aria-label="Remove ${esc(p.name)}">×</button>
        </div>
      </div>`).join('');
    const canAdd = cat.multi || rows.length === 0;
    return `
      <section class="cat">
        <h2>${cat.label}</h2>
        <div class="cat-body">
          ${body}
          <button type="button" class="add-btn" data-act="pick" data-cat="${cat.key}">${canAdd ? (rows.length ? 'Add another' : 'Choose') : 'Swap'}</button>
        </div>
      </section>`;
  }

  function meter(label, value, max, text, opts) {
    const pct = max ? Math.min(100, (value / max) * 100) : 0;
    const over = max != null && value > max;
    const tone = over ? 'bad' : opts && opts.warnAt && max && value > max * opts.warnAt ? 'warn' : 'ok';
    return `
      <div class="meter">
        <div class="meter-head"><span>${label}</span><span class="num">${text}</span></div>
        ${max ? `<div class="bar"><span class="fill tone-${tone}" style="width:${pct}%"></span></div>` : ''}
      </div>`;
  }

  function renderReport(r) {
    const { counts, stats } = r;
    let verdict, tone;
    if (!build.items.length) { verdict = 'Empty build'; tone = 'muted'; }
    else if (counts.error) { verdict = `${counts.error} problem${counts.error > 1 ? 's' : ''}`; tone = 'bad'; }
    else if (counts.warn) { verdict = `Works, ${counts.warn} thing${counts.warn > 1 ? 's' : ''} to check`; tone = 'warn'; }
    else { verdict = 'Compatible'; tone = 'ok'; }

    const p = stats.power, m = stats.memory;
    const anyEst = build.items.some((i) => byId.get(i.id) && !byId.get(i.id).priceChecked);
    if (!build.items.length) {
      return `<div class="verdict tone-muted">Empty build</div>
        <p class="hint">Pick parts on the left, or load a starting build from the menu. Compatibility updates as you go.</p>
        <p class="fine">Prices are lowest US street prices seen ${asOf}. ~ marks an estimate.</p>`;
    }
    const meters = [];
    meters.push(meter('Power', p.draw, p.capacity, p.capacity ? `${p.draw} / ${p.capacity} W${p.redundancy && p.redundancy !== 'none' ? ` (${p.redundancy})` : ''}` : `${p.draw} W est.`, { warnAt: 0.8 }));
    if (stats.pcie.total != null) meters.push(meter('PCIe slots', stats.pcie.used, stats.pcie.total, `${stats.pcie.used} / ${stats.pcie.total}`));
    if (stats.lanes) meters.push(meter('PCIe lanes', stats.lanes.demand, stats.lanes.available, `${stats.lanes.demand} / ~${stats.lanes.available}`));
    if (m.sticks || m.slots) {
      meters.push(meter('Memory', m.gb, m.maxGB, `${m.gb.toLocaleString()} GB${m.maxGB ? ` / ${m.maxGB.toLocaleString()}` : ''}`));
      const parts = [];
      if (m.slots != null) parts.push(`${m.sticks} of ${m.slots} slots`);
      if (m.channels) parts.push(`${Math.min(m.sticks, m.channels)} of ${m.channels} channels`);
      if (parts.length) meters.push(`<div class="meter sub"><span>${parts.join(', ')}</span></div>`);
    }
    if (stats.storage.drives) meters.push(meter('Storage', 0, null, `${stats.storage.drives} drive${stats.storage.drives > 1 ? 's' : ''}, ${+stats.storage.tb.toFixed(2)} TB raw`));
    if (stats.cores) meters.push(meter('Compute', 0, null, stats.threads ? `${stats.cores} cores / ${stats.threads} threads` : `${stats.cores} cores`));

    const label = { error: 'Problem', warn: 'Check', info: 'Note' };
    const list = r.issues.map((i) => `<li class="issue lvl-${i.level}"><span class="tag">${label[i.level]}</span><span>${esc(i.msg)}</span></li>`).join('');

    return `
      <div class="verdict tone-${tone}">${verdict}</div>
      <div class="total"><span>Total</span><span class="num">${anyEst ? '~' : ''}${money(stats.price)}</span></div>
      <div class="meters">${meters.join('')}</div>
      ${list ? `<ul class="issues">${list}</ul>` : ''}
      <p class="fine">Prices are lowest US street prices seen ${asOf}. ~ marks an estimate. Specs are simplified; check vendor QVLs before buying.</p>`;
  }

  // ---------- picker ----------
  function openPicker(cat) {
    pick.cat = cat; pick.q = '';
    $('#pick-q').value = '';
    $('#pick-title').textContent = CATEGORIES.find((c) => c.key === cat).label;
    renderPicker();
    const d = $('#picker');
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    setTimeout(() => $('#pick-q').focus(), 0);
  }
  function renderPicker() {
    const q = pick.q.trim().toLowerCase();
    const baseline = errorKeys(build, byId);
    const rows = parts
      .filter((p) => p.cat === pick.cat)
      .filter((p) => pick.seg === 'all' || p.tags.includes(pick.seg))
      .filter((p) => !q || (p.name + ' ' + p.brand + ' ' + specLine(p)).toLowerCase().includes(q))
      .map((p) => ({ p, c: checkCandidate(build, p, byId, baseline), inBuild: build.items.some((i) => i.id === p.id) }));
    const shown = rows.filter((r) => !pick.onlyOk || r.c.ok).sort((a, b) => (b.c.ok - a.c.ok) || (pick.sort === 'price-asc' ? a.p.price - b.p.price : pick.sort === 'price-desc' ? b.p.price - a.p.price : (a.p.rank || 0) - (b.p.rank || 0)));
    const hidden = rows.length - shown.length;
    const multi = CATEGORIES.find((c) => c.key === pick.cat).multi;
    const total = shown.length;
    shown.length = Math.min(shown.length, PICK_LIMIT);
    const more = total > PICK_LIMIT ? `<li class="empty">Showing ${PICK_LIMIT} of ${total.toLocaleString()}. Search to narrow it down.</li>` : '';
    $('#pick-list').innerHTML = shown.length ? shown.map(({ p, c, inBuild }) => `
      <li class="pick-row ${c.ok ? '' : 'is-bad'}">
        <div class="part-main">
          <div class="part-name">${esc(p.name)}</div>
          <div class="spec">${esc(specLine(p))}</div>
          ${c.ok ? '' : `<div class="why">${esc(c.reasons[0])}${c.reasons.length > 1 ? ` (+${c.reasons.length - 1} more)` : ''}</div>`}
        </div>
        <div class="part-side">
          ${priceTag(p, p.price)}
          ${inBuild && !multi ? '<span class="muted">In build</span>' : `<button type="button" class="${c.ok ? 'primary' : 'ghost'}" data-act="choose" data-id="${p.id}">${inBuild ? 'Add one more' : 'Add'}</button>`}
        </div>
      </li>`).join('') + more : `<li class="empty">Nothing here fits the current build${pick.onlyOk ? '. Turn off "Only compatible" to see everything.' : '.'}</li>`;
    $('#pick-hidden').textContent = pick.onlyOk && hidden ? `${hidden} hidden` : '';
    document.querySelectorAll('[data-seg]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.seg === pick.seg)));
  }
  function choose(id) {
    const p = byId.get(id);
    build.items = checkCandidate(build, p, byId).items;
    $('#picker').close();
    commit();
  }

  // ---------- events ----------
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const idx = Number(b.dataset.idx);
    switch (b.dataset.act) {
      case 'inc': build.items[idx].qty++; commit(); break;
      case 'dec': if (build.items[idx].qty > 1) { build.items[idx].qty--; commit(); } break;
      case 'remove': build.items.splice(idx, 1); commit(); break;
      case 'pick': openPicker(b.dataset.cat); break;
      case 'choose': choose(b.dataset.id); break;
      case 'close': b.closest('dialog').close(); break;
    }
  });
  let qTimer = 0;
  $('#pick-q').addEventListener('input', (e) => { pick.q = e.target.value; clearTimeout(qTimer); qTimer = setTimeout(renderPicker, 120); });
  $('#pick-sort').addEventListener('change', (e) => { pick.sort = e.target.value; renderPicker(); });
  $('#pick-ok').addEventListener('change', (e) => { pick.onlyOk = e.target.checked; renderPicker(); });
  document.querySelectorAll('[data-seg]').forEach((b) => b.addEventListener('click', () => { pick.seg = b.dataset.seg; renderPicker(); }));
  $('#build-name').addEventListener('change', (e) => { build.name = e.target.value.trim() || 'My build'; save(); });

  const presetSel = $('#preset');
  presetSel.innerHTML = '<option value="">Start from…</option>' + presets.map((p) => `<option value="${p.key}">${esc(p.name)}</option>`).join('') + '<option value="blank">Blank build</option>';
  presetSel.addEventListener('change', () => {
    const v = presetSel.value;
    if (v === 'blank') build = { name: 'My build', items: [] };
    else if (v) build = clone(presets.find((p) => p.key === v));
    presetSel.value = '';
    commit();
  });

  $('#btn-io').addEventListener('click', () => {
    $('#io-text').value = JSON.stringify(build, null, 1);
    $('#io-msg').textContent = '';
    $('#io').showModal();
  });
  $('#io-copy').addEventListener('click', () => {
    const t = $('#io-text');
    const done = () => { $('#io-msg').textContent = 'Copied'; };
    const fallback = () => { t.select(); $('#io-msg').textContent = 'Selected. Press Ctrl+C to copy.'; };
    try { navigator.clipboard.writeText(t.value).then(done, fallback); } catch (e) { fallback(); }
  });
  $('#io-load').addEventListener('click', () => {
    try {
      const b = JSON.parse($('#io-text').value);
      if (!b || !Array.isArray(b.items)) throw new Error('no items');
      const items = b.items.filter((i) => byId.has(i.id)).map((i) => ({ id: i.id, qty: Math.max(1, i.qty | 0) }));
      const dropped = b.items.length - items.length;
      build = { name: String(b.name || 'Imported build'), items };
      commit();
      $('#io-msg').textContent = dropped ? `Loaded. ${dropped} unknown part${dropped > 1 ? 's' : ''} skipped.` : 'Loaded';
    } catch (e) {
      $('#io-msg').textContent = "That isn't a Slotwise build. Paste the JSON from Export.";
    }
  });

  render();

  // Bulk-imported parts live beside the page in parts.json; the curated catalog works without them.
  fetch('parts.json').then((r) => (r.ok ? r.json() : [])).then((list) => {
    if (!mergeImported(list)) return;
    for (const p of parts) byId.set(p.id, p);
    const saved = load();
    if (saved && saved.items.length > build.items.length) build = saved;
    render();
    if ($('#picker').open) renderPicker();
  }).catch(() => { /* offline or missing: keep the curated catalog */ });
})();
