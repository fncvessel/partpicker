/* Slotwise compatibility engine.
 * evaluate(build, parts) -> { issues, stats }
 * build = { items: [{ id, qty }] }; parts = catalog array (or Map id -> part).
 * Issue levels: 'error' (won't work), 'warn' (works with a catch), 'info' (worth knowing).
 */
(function (root) {
  'use strict';

  const CATEGORIES = [
    { key: 'cpu', label: 'CPU', multi: false },
    { key: 'cooler', label: 'CPU cooler', multi: false },
    { key: 'motherboard', label: 'Motherboard', multi: false, singleQty: true },
    { key: 'memory', label: 'Memory', multi: true },
    { key: 'gpu', label: 'GPU / accelerator', multi: true },
    { key: 'storage', label: 'Storage', multi: true },
    { key: 'controller', label: 'Storage controller', multi: true },
    { key: 'nic', label: 'Network', multi: true },
    { key: 'psu', label: 'Power supply', multi: false },
    { key: 'case', label: 'Case / chassis', multi: false, singleQty: true },
  ];

  const PLATFORM_NAMES = {
    'am5': 'Ryzen / EPYC 4004 (AM5)', 'am4': 'Ryzen (AM4)', 'comet-rocket': 'Core 10th/11th gen', 'arrow-lake': 'Core Ultra 200S', 'core-12-14': 'Core 12th–14th gen', 'xeon-e-2400': 'Xeon E-2400',
    'tr-7000': 'Threadripper 7000', 'tr-9000': 'Threadripper 9000', 'tr-pro-7000': 'Threadripper PRO 7000WX', 'tr-pro-9000': 'Threadripper PRO 9000WX',
    'xeon-w-2400': 'Xeon W-2400', 'xeon-w-3400': 'Xeon W-3400', 'xeon-sp-4': '4th gen Xeon Scalable', 'xeon-sp-5': '5th gen Xeon Scalable',
    'epyc-9004': 'EPYC 9004', 'epyc-9005': 'EPYC 9005', 'epyc-7003': 'EPYC 7003',
  };

  const IFACE_NAMES = { m2: 'M.2 NVMe', sata: 'SATA', sas: 'SAS', u2: 'U.2 NVMe', u3: 'U.3 NVMe', e1s: 'E1.S NVMe', e3s: 'E3.S NVMe' };

  function indexParts(parts) {
    if (parts instanceof Map) return parts;
    const m = new Map();
    for (const p of parts) m.set(p.id, p);
    return m;
  }

  const sum = (arr, f) => arr.reduce((s, x) => s + (f ? f(x) : x), 0);
  const uniq = (arr) => Array.from(new Set(arr));

  function stickWatts(m) {
    if (m.module === 'RDIMM') return m.type === 'DDR5' ? 10 : 6;
    if (m.module === 'LRDIMM') return 8;
    return 4;
  }

  function evaluate(build, parts) {
    const index = indexParts(parts);
    const items = [];
    for (const it of (build && build.items) || []) {
      const part = index.get(it.id);
      if (!part) continue;
      items.push({ part, qty: Math.max(1, Math.floor(Number(it.qty) || 1)) });
    }

    const issues = [];
    const seen = new Set();
    const add = (level, rule, msg, ids) => {
      const key = rule + '|' + msg;
      if (seen.has(key)) return;
      seen.add(key);
      issues.push({ level, rule, msg, parts: ids || [] });
    };
    const of = (cat) => items.filter((x) => x.part.cat === cat);
    const qtyOf = (arr) => sum(arr, (x) => x.qty);
    const expand = (arr) => arr.flatMap((x) => Array.from({ length: x.qty }, () => x.part));

    const cpuItems = of('cpu'), boardItems = of('motherboard'), memItems = of('memory'), gpuItems = of('gpu');
    const storItems = of('storage'), ctrlItems = of('controller'), nicItems = of('nic'), psuItems = of('psu');
    const caseItems = of('case'), coolerItems = of('cooler');

    const cpu = cpuItems[0] && cpuItems[0].part;
    const cpuQty = qtyOf(cpuItems);
    const board = boardItems[0] && boardItems[0].part;
    const chassis = caseItems[0] && caseItems[0].part;
    const psu = psuItems[0] && psuItems[0].part;
    const psuQty = qtyOf(psuItems);
    const cooler = coolerItems[0] && coolerItems[0].part;
    const coolerQty = qtyOf(coolerItems);

    const stats = { price: sum(items, (x) => (x.part.price || 0) * x.qty), cores: cpu ? cpu.cores * cpuQty : 0, threads: cpu && cpu.threads ? cpu.threads * cpuQty : null };

    // ---------- one-of-a-kind parts ----------
    if (boardItems.length > 1 || qtyOf(boardItems) > 1) add('error', 'one-board', 'A build has one motherboard. Remove the extra.', boardItems.map((x) => x.part.id));
    if (caseItems.length > 1 || qtyOf(caseItems) > 1) add('error', 'one-case', 'A build has one case. Remove the extra.', caseItems.map((x) => x.part.id));
    if (cpuItems.length > 1) add('error', 'cpu-mixed', 'Multi-socket systems need identical CPUs. Pick one CPU model and raise its quantity.', cpuItems.map((x) => x.part.id));
    if (psuItems.length > 1) add('error', 'psu-mixed', "Don't mix power supply models. Pick one and set the quantity.", psuItems.map((x) => x.part.id));
    if (coolerItems.length > 1) add('warn', 'cooler-mixed', 'Use the same cooler model on every socket.', coolerItems.map((x) => x.part.id));

    // ---------- CPU and board ----------
    const sockets = board ? board.sockets || 1 : Math.max(1, cpuQty);
    if (cpu && board) {
      if (cpu.socket !== board.socket) {
        add('error', 'cpu-socket', `${cpu.name} uses ${cpu.socket}, but ${board.name} has an ${board.socket} socket.`, [cpu.id, board.id]);
      } else if (board.platforms && !board.platforms.includes(cpu.platform)) {
        add('error', 'cpu-platform', `${cpu.name} fits the ${cpu.socket} socket, but ${board.chipset} boards don't support ${PLATFORM_NAMES[cpu.platform] || cpu.platform} CPUs.`, [cpu.id, board.id]);
      }
      if (cpuQty > sockets) add('error', 'cpu-count', `${board.name} has ${sockets} socket${sockets > 1 ? 's' : ''}; you picked ${cpuQty} CPUs.`, [cpu.id, board.id]);
      else if (cpuQty < sockets) add('warn', 'socket-empty', `${cpuQty} of ${sockets} sockets filled. Memory and PCIe slots wired to the empty socket won't work.`, [cpu.id, board.id]);
    }
    if (cpu && cpuQty > (cpu.maxSockets || 1)) {
      add('error', 'cpu-maxsockets', (cpu.maxSockets || 1) === 1
        ? `${cpu.name} is a single-socket part. Use a 2P-capable model for a dual-socket board.`
        : `${cpu.name} supports up to ${cpu.maxSockets} sockets.`, [cpu.id]);
    }
    const activeSockets = board ? (cpu ? Math.max(1, Math.min(cpuQty, sockets)) : sockets) : Math.max(1, cpuQty);
    const socketShare = board ? activeSockets / sockets : 1;

    // ---------- Memory ----------
    const memStats = { sticks: 0, gb: 0, slots: board ? Math.round(board.dimmSlots * socketShare) : null, channels: null, maxGB: null };
    const perSocketChannels = Math.min(cpu ? cpu.memChannels : Infinity, board ? board.memChannels : Infinity);
    if (Number.isFinite(perSocketChannels)) memStats.channels = perSocketChannels * activeSockets;
    {
      const caps = [];
      if (board) caps.push(board.maxMemGB * socketShare);
      if (cpu) caps.push(cpu.maxMemGB * Math.max(1, cpuQty));
      if (caps.length) memStats.maxGB = Math.min(...caps);
    }
    if (memItems.length) {
      memStats.sticks = sum(memItems, (x) => x.qty * x.part.sticks);
      memStats.gb = sum(memItems, (x) => x.qty * x.part.sticks * x.part.gb);
      const types = uniq(memItems.map((x) => x.part.type));
      const modules = uniq(memItems.map((x) => x.part.module));
      const ids = memItems.map((x) => x.part.id);
      if (types.length > 1) add('error', 'mem-mixed-gen', `You can't mix ${types.join(' and ')} in one system.`, ids);
      if (modules.length > 1) add('error', 'mem-mixed-module', `Don't mix ${modules.join(' and ')} modules. Boards run one kind at a time.`, ids);
      if (memItems.length > 1 && types.length === 1 && modules.length === 1) add('warn', 'mem-mixed-kits', 'Mixing memory kits can fail to train or drop to the slowest kit. Use one kit model where you can.', ids);

      for (const { part: m } of memItems) {
        if (board && m.type !== board.memType) add('error', 'mem-type', `${board.name} takes ${board.memType}; ${m.name} is ${m.type}.`, [m.id, board.id]);
        else if (!board && cpu && !cpu.memTypes.includes(m.type)) add('error', 'mem-type', `${cpu.name} supports ${cpu.memTypes.join('/')}; ${m.name} is ${m.type}.`, [m.id, cpu.id]);
        if (board && !board.memModules.includes(m.module)) {
          const why = m.module === 'UDIMM' ? 'Server and workstation boards need registered (RDIMM) memory.' : 'Registered memory will not boot on boards built for unbuffered DIMMs.';
          add('error', 'mem-module', `${board.name} takes ${board.memModules.join('/')}, and ${m.name} is ${m.module}. ${why}`, [m.id, board.id]);
        } else if (cpu && !cpu.memModules.includes(m.module)) {
          add('error', 'mem-module', `${cpu.name} supports ${cpu.memModules.join('/')}; ${m.name} is ${m.module}.`, [m.id, cpu.id]);
        }
        if (board && m.ecc && m.module === 'UDIMM' && !board.ecc) add('warn', 'mem-ecc', `${board.name} doesn't enable ECC, so ${m.name} will run without error correction.`, [m.id, board.id]);
        if (cpu && m.ecc && m.module === 'UDIMM' && !cpu.ecc) add('warn', 'mem-ecc-cpu', `${cpu.name} doesn't support ECC, so ${m.name} will run without error correction.`, [m.id, cpu.id]);
        if (cpu && m.speed > cpu.memSpeed) {
          add('info', 'mem-speed', m.module === 'UDIMM'
            ? `${m.name} is rated ${m.speed} MT/s; ${cpu.name} officially runs ${cpu.memSpeed}. You'll need EXPO/XMP for the rated speed.`
            : `${m.name} will run at ${cpu.memSpeed} MT/s, the most ${cpu.name} supports.`, [m.id, cpu.id]);
        }
      }
      if (memStats.slots != null && memStats.sticks > memStats.slots) {
        add('error', 'mem-slots', `${memStats.sticks} memory sticks but only ${memStats.slots} usable DIMM slots${socketShare < 1 ? ' with one CPU installed' : ''}.`, ids.concat(board ? [board.id] : []));
      }
      if (memStats.maxGB != null && memStats.gb > memStats.maxGB) add('error', 'mem-capacity', `${memStats.gb} GB is more than this platform supports (${memStats.maxGB} GB).`, ids);
      if (memStats.channels) {
        const ch = memStats.channels;
        if (memStats.sticks < ch) add('info', 'mem-channels', `${memStats.sticks} of ${ch} memory channels filled. Use ${ch} sticks for full bandwidth.`, ids);
        else if (memStats.sticks % ch !== 0) add('info', 'mem-balance', `${memStats.sticks} sticks across ${ch} channels is uneven. Use a multiple of ${ch} for balanced bandwidth.`, ids);
        if (types[0] === 'DDR5' && memStats.sticks > ch && memStats.sticks <= (memStats.slots || Infinity)) add('info', 'mem-2dpc', 'Two DDR5 sticks per channel usually lowers the top memory speed.', ids);
      }
      if (activeSockets === 2 && memStats.sticks % 2 === 1) add('warn', 'mem-numa', 'Odd stick count on a dual-socket board leaves the CPUs unbalanced. Split memory evenly between sockets.', ids);
    }
    if (cpu && board && cpu.memChannels > board.memChannels && cpu.socket === board.socket) {
      add('info', 'mem-board-channels', `${cpu.name} has ${cpu.memChannels} memory channels, but ${board.name} wires ${board.memChannels}.`, [cpu.id, board.id]);
    }
    if (cpu && board && board.memChannels > cpu.memChannels && cpu.socket === board.socket) {
      add('info', 'mem-cpu-channels', `${board.name} has ${board.memChannels} channels; ${cpu.name} drives ${cpu.memChannels} of them.`, [cpu.id, board.id]);
    }
    stats.memory = memStats;

    // ---------- PCIe cards ----------
    const pcieNics = nicItems.filter((x) => x.part.form !== 'ocp3');
    const ocpNics = nicItems.filter((x) => x.part.form === 'ocp3');
    const cards = expand([...gpuItems, ...ctrlItems, ...pcieNics]).map((part) => ({ part, slot: null, eff: 0 }));
    const slots = [];
    let disabledSlots = 0;
    if (board) {
      for (const g of board.pcie) {
        for (let i = 0; i < g.n; i++) {
          if (g.cpu === 'pch' || g.cpu <= activeSockets) slots.push({ size: g.size, lanes: g.lanes, gen: g.gen, cpu: g.cpu, group: g.group, card: null });
          else disabledSlots++;
        }
      }
      if (disabledSlots) add('info', 'slots-cpu2', `${disabledSlots} PCIe slot${disabledSlots > 1 ? 's' : ''} need the second CPU.`, [board.id]);
      const ocpNeed = qtyOf(ocpNics);
      if (ocpNeed > (board.ocp || 0)) add('error', 'ocp-slot', `${board.name} has ${board.ocp || 0} OCP 3.0 slot${board.ocp === 1 ? '' : 's'}; you picked ${ocpNeed} OCP NIC${ocpNeed > 1 ? 's' : ''}.`, ocpNics.map((x) => x.part.id).concat(board.id));

      const order = cards.slice().sort((a, b) => b.part.lanes - a.part.lanes || b.part.size - a.part.size);
      const noSlot = [];
      for (const c of order) {
        const free = slots.filter((s) => !s.card && s.size >= c.part.size);
        if (!free.length) { noSlot.push(c); continue; }
        const full = free.filter((s) => s.lanes >= c.part.lanes).sort((a, b) => a.lanes - b.lanes || (a.cpu === 'pch') - (b.cpu === 'pch') || a.gen - b.gen);
        const pick = full[0] || free.sort((a, b) => b.lanes - a.lanes)[0];
        pick.card = c; c.slot = pick;
      }
      if (noSlot.length) {
        const names = uniq(noSlot.map((c) => c.part.name));
        add('error', 'pcie-slots', `Out of PCIe slots: no free slot for ${names.join(', ')}.`, uniq(noSlot.map((c) => c.part.id)).concat(board.id));
      }
      // shared lane groups (x16 that splits x8/x8)
      const groups = {};
      for (const s of slots) if (s.card && s.group) (groups[s.group] = groups[s.group] || []).push(s);
      for (const [g, list] of Object.entries(groups)) {
        const total = (board.laneGroups && board.laneGroups[g]) || 16;
        if (list.length > 1) {
          const each = Math.floor(total / list.length);
          for (const s of list) s.effLanes = Math.min(s.lanes, each);
          add('info', 'pcie-split', `Using ${list.length} slots that share the CPU's ${total} lanes splits them x${each}/x${each}.`, [board.id]);
        }
      }
      for (const c of cards) {
        if (!c.slot) continue;
        const s = c.slot;
        c.eff = s.effLanes != null ? s.effLanes : s.lanes;
        if (c.eff < c.part.lanes) {
          const isGpu = c.part.cat === 'gpu';
          add(isGpu && c.eff >= 8 ? 'info' : 'warn', 'pcie-lanes-reduced',
            `${c.part.name} will run at x${c.eff} instead of x${c.part.lanes}${s.cpu === 'pch' ? ' through the chipset' : ''}.`, [c.part.id, board.id]);
        }
        if (c.part.gen > s.gen) add('info', 'pcie-gen', `${c.part.name} is PCIe ${c.part.gen}.0 but its slot is ${s.gen}.0, so it runs at ${s.gen}.0 speed.`, [c.part.id, board.id]);
        if (c.part.needsBifurcation) {
          if (!board.bifurcation) add('warn', 'bifurcation', `${board.name} can't split a slot x4/x4/x4/x4, so only one drive on ${c.part.name} will show up.`, [c.part.id, board.id]);
          else if (c.eff < 16) add('info', 'bifurcation-lanes', `${c.part.name} sits in an x${c.eff} slot, so only ${Math.max(1, c.eff / 4)} of its 4 M.2 slots work.`, [c.part.id, board.id]);
        }
      }
      if (board.slotPositions) {
        const width = sum(cards.filter((c) => c.slot), (c) => Math.ceil(c.part.widthSlots || 1));
        if (width > board.slotPositions) add('warn', 'board-spacing', `Your cards are ${width} slots thick together; ${board.name} has ${board.slotPositions} slot positions. Thick cards will cover neighbouring slots or need risers.`, [board.id]);
      }
    }
    stats.pcie = { used: cards.filter((c) => c.slot).length, total: board ? slots.length : null, cards: cards.map((c) => ({ id: c.part.id, name: c.part.name, lanes: c.part.lanes, eff: c.eff, slot: c.slot ? { size: c.slot.size, lanes: c.slot.lanes, gen: c.slot.gen, cpu: c.slot.cpu } : null })) };

    if (chassis && cards.length) {
      const width = sum(cards, (c) => Math.ceil(c.part.widthSlots || 1));
      if (width > chassis.slots) add('error', 'case-slots', `Cards need ${width} expansion slot openings; ${chassis.name} has ${chassis.slots}.`, [chassis.id]);
      for (const c of uniq(cards.map((c) => c.part))) {
        if (chassis.lowProfileOnly && !c.lowProfile) add('error', 'case-lowprofile', `${chassis.name} only takes low-profile cards; ${c.name} is full height.`, [c.id, chassis.id]);
        else if (c.lengthMm && chassis.gpuMaxMm && c.lengthMm > chassis.gpuMaxMm) add('error', 'case-card-length', `${c.name} is ${c.lengthMm} mm long; ${chassis.name} fits ${chassis.gpuMaxMm} mm.`, [c.id, chassis.id]);
      }
    }
    for (const g of uniq(gpuItems.map((x) => x.part))) {
      if (g.cooling === 'passive' && (!chassis || chassis.airflow !== 'server')) {
        add('warn', 'gpu-passive', `${g.name} has no fans. It needs a server chassis pushing air through it${chassis ? `, which ${chassis.name} doesn't do` : ''}.`, [g.id].concat(chassis ? [chassis.id] : []));
      }
    }
    const gpuCount = qtyOf(gpuItems);
    if (gpuCount >= 2 && gpuItems.some((x) => x.part.cooling === 'open-air')) {
      add('warn', 'gpu-stacking', 'Stacked open-air GPUs choke the card on top. Blower-style or Max-Q cards are made for multi-GPU.', gpuItems.filter((x) => x.part.cooling === 'open-air').map((x) => x.part.id));
    }

    // ---------- Storage ----------
    const drives = expand(storItems);
    const storStats = { drives: drives.length, tb: sum(drives, (d) => d.tb) };
    if (drives.length) {
      const errs = [];
      // M.2 slots: board + adapters
      const m2Slots = [];
      if (board) for (const g of board.m2) for (let i = 0; i < g.n; i++) if (g.cpu === 'pch' || g.cpu <= activeSockets) m2Slots.push({ gen: g.gen, sizes: g.sizes, used: false, src: 'board' });
      for (const c of cards) {
        if (c.part.m2Slots && c.slot) {
          const usable = board && !board.bifurcation ? 1 : Math.max(1, Math.min(c.part.m2Slots, Math.floor(c.eff / 4)));
          for (let i = 0; i < usable; i++) m2Slots.push({ gen: Math.min(c.part.gen, c.slot.gen), sizes: ['2280', '22110'], used: false, src: 'adapter' });
        }
      }
      const m2Drives = drives.filter((d) => d.iface === 'm2').sort((a, b) => (b.form.includes('22110') ? 1 : 0) - (a.form.includes('22110') ? 1 : 0));
      let boardNvmeUsed = 0;
      if (board || m2Slots.length) {
        for (const d of m2Drives) {
          const len = d.form.replace('M.2 ', '');
          const s = m2Slots.find((x) => !x.used && x.sizes.includes(len));
          if (!s) {
            const anySlot = m2Slots.some((x) => !x.used);
            errs.push(['error', 'm2-slots', anySlot ? `No free M.2 slot fits the ${len} length of ${d.name}.` : `Out of M.2 slots for ${d.name}. Add an M.2 adapter card or pick U.2 drives.`, [d.id]]);
            continue;
          }
          s.used = true;
          if (s.src === 'board') boardNvmeUsed++;
          if (d.gen > s.gen) errs.push(['info', 'm2-gen', `${d.name} is PCIe ${d.gen}.0 but lands in a ${s.gen}.0 M.2 slot.`, [d.id]]);
        }
      }
      if (board) {
        let sata = board.sata || 0;
        let nvme = board.nvmePorts || 0;
        let hbaSas = sum(ctrlItems, (x) => (x.part.sasPorts || 0) * x.qty);
        let hbaSata = sum(ctrlItems, (x) => (x.part.sataOnlyPorts || 0) * x.qty);
        let hbaNvme = sum(ctrlItems, (x) => (x.part.nvmePorts || 0) * x.qty);
        const sas = drives.filter((d) => d.iface === 'sas');
        const sataD = drives.filter((d) => d.iface === 'sata');
        const nvmeD = drives.filter((d) => ['u2', 'u3', 'e1s', 'e3s'].includes(d.iface));
        if (sas.length) {
          if (hbaSas === 0) errs.push(['error', 'sas-needs-hba', 'SAS drives need a SAS HBA or RAID card. Motherboard SATA ports can\'t run them.', uniq(sas.map((d) => d.id))]);
          else if (sas.length > hbaSas) errs.push(['error', 'sas-ports', `${sas.length} SAS drives but your controllers have ${hbaSas} direct ports. Add a controller or a SAS expander backplane.`, uniq(sas.map((d) => d.id))]);
          hbaSas = Math.max(0, hbaSas - sas.length);
        }
        if (sataD.length) {
          const fromBoard = Math.min(sata, sataD.length);
          let left = sataD.length - fromBoard;
          const fromSata = Math.min(hbaSata, left); left -= fromSata;
          const fromHba = Math.min(hbaSas, left); left -= fromHba; hbaSas -= fromHba;
          if (left > 0) errs.push(['error', 'sata-ports', `${sataD.length} SATA drives but only ${sataD.length - left} ports available. Add an HBA or SATA card.`, uniq(sataD.map((d) => d.id))]);
        }
        if (nvmeD.length) {
          const fromBoard = Math.min(nvme, nvmeD.length);
          boardNvmeUsed += fromBoard;
          let left = nvmeD.length - fromBoard;
          const fromHba = Math.min(hbaNvme, left); left -= fromHba;
          if (fromHba && nvmeD.slice(fromBoard).some((d) => d.iface === 'u2')) errs.push(['info', 'u2-trimode', 'Tri-mode HBAs are built around U.3. U.2 drives on them need the right cables.', ctrlItems.map((x) => x.part.id)]);
          if (left > 0) errs.push(['error', 'nvme-ports', `${nvmeD.length} NVMe drives but only ${nvmeD.length - left} NVMe connections (board MCIO/SlimSAS plus tri-mode HBAs). Add a tri-mode HBA or NVMe switch card.`, uniq(nvmeD.map((d) => d.id)).concat(board.id)]);
        }
      }
      if (chassis) {
        const bays = Object.assign({ '3.5': 0, '2.5': 0, nvme: 0, e1s: 0, e3s: 0 }, chassis.bays);
        const take = (k) => (bays[k] > 0 ? (bays[k]--, true) : false);
        const noBay = [];
        let adapters = 0, internalU2 = 0;
        for (const d of drives) {
          if (d.iface === 'm2') continue;
          let ok = false;
          if (d.form === '3.5"') ok = take('3.5');
          else if (d.form === '2.5"' && (d.iface === 'sata' || d.iface === 'sas')) { ok = take('2.5') || take('nvme') || (take('3.5') && ++adapters > 0); }
          else if (d.form === '2.5"') { ok = take('nvme') || (take('2.5') && ++internalU2 > 0); }
          else if (d.form === 'E1.S') ok = take('e1s');
          else if (d.form === 'E3.S') ok = take('e3s');
          if (!ok) noBay.push(d);
        }
        if (noBay.length) {
          const forms = uniq(noBay.map((d) => d.form));
          errs.push(['error', 'bays', `${chassis.name} is out of bays for ${noBay.length} drive${noBay.length > 1 ? 's' : ''} (${forms.join(', ')}).`, uniq(noBay.map((d) => d.id)).concat(chassis.id)]);
        }
        if (adapters) errs.push(['info', 'bay-adapter', `${adapters} 2.5" drive${adapters > 1 ? 's go' : ' goes'} in a 3.5" bay with an adapter.`, [chassis.id]]);
        if (internalU2) errs.push(['info', 'u2-internal', `${internalU2} U.2/U.3 drive${internalU2 > 1 ? 's' : ''} in plain 2.5" bays need direct cables and won't be hot-swap.`, [chassis.id]]);
      }
      for (const e of errs) add(e[0], e[1], e[2], e[3]);
      storStats.boardNvme = boardNvmeUsed;
    }
    stats.storage = storStats;

    // ---------- Lane budget ----------
    if (cpu) {
      const perSocket = activeSockets > 1 && cpu.lanes2P ? cpu.lanes2P : cpu.lanes;
      const available = perSocket * activeSockets + (board ? board.chipsetLanes || 0 : 0);
      const demand = sum(cards.filter((c) => !board || c.slot), (c) => (board ? c.eff : c.part.lanes)) + (storStats.boardNvme || 0) * 4;
      stats.lanes = { demand, available };
      if (demand > available) add('warn', 'lanes-budget', `Devices want ${demand} PCIe lanes; this platform has about ${available}. Some will share bandwidth or be disabled.`, [cpu.id]);
    } else {
      stats.lanes = null;
    }

    // ---------- Power ----------
    const breakdown = [];
    const push = (label, w) => { if (w > 0) breakdown.push({ label, w: Math.round(w) }); };
    if (cpu) push(cpuQty > 1 ? `CPUs (${cpuQty})` : 'CPU', cpu.powerW * cpuQty);
    push('GPUs', sum(gpuItems, (x) => x.part.powerW * x.qty));
    push('Memory', sum(memItems, (x) => stickWatts(x.part) * x.part.sticks * x.qty));
    push('Storage', sum(drives, (d) => d.watts));
    push('Cards & NICs', sum([...ctrlItems, ...nicItems], (x) => x.part.watts * x.qty));
    if (board) push('Motherboard', board.watts);
    if (items.length) push('Fans & misc', chassis && chassis.kind === 'rack' ? 30 + 15 * (chassis.ru || 1) : cooler && cooler.type === 'aio' ? 35 : 20);
    const draw = sum(breakdown, (b) => b.w);
    const power = { draw, breakdown, capacity: null, raw: null };
    if (psu) {
      let capacity = psu.watts;
      if (psu.redundant && !psu.builtInRedundant) {
        capacity = psuQty > 1 ? psu.watts * (psuQty - 1) : psu.watts;
        power.raw = psu.watts * psuQty;
        if (psuQty === 1) add('info', 'psu-no-redundancy', `One ${psu.name} gives no redundancy. Add a second for 1+1.`, [psu.id]);
      } else if (psuQty > 1) {
        add('warn', 'psu-multi', 'Two ATX power supplies don\'t combine or back each other up without special adapters. Only one is counted.', [psu.id]);
      }
      power.capacity = capacity;
      power.redundancy = psu.redundant ? (psu.builtInRedundant ? '1+1 built in' : psuQty > 1 ? `${psuQty - 1}+1` : 'none') : null;
      if (draw > capacity) {
        if (power.raw && draw <= power.raw) add('warn', 'psu-redundancy-lost', `Estimated ${draw} W is more than one module can carry (${capacity} W), so losing a module would shut the system down. Add a module or pick bigger ones.`, [psu.id]);
        else add('error', 'psu-capacity', `Estimated load is ${draw} W but ${psu.name} supplies ${capacity} W.`, [psu.id]);
      } else if (draw > capacity * 0.8) {
        add('warn', 'psu-headroom', `Estimated ${draw} W is ${Math.round((draw / capacity) * 100)}% of ${capacity} W. Aim for 20–30% headroom.`, [psu.id]);
      }
      if (gpuItems.some((x) => x.part.powerW >= 450) && draw > capacity * 0.7 && draw <= capacity * 0.8) {
        add('info', 'gpu-transients', 'High-end GPUs spike well above their rating for milliseconds. An ATX 3.1 unit with extra headroom handles it best.', [psu.id]);
      }
      if (chassis && !chassis.psuForms.includes(psu.form)) {
        add('error', 'psu-form', `${chassis.name} takes ${chassis.psuForms.join('/')} power supplies; ${psu.name} is ${psu.form}.`, [psu.id, chassis.id]);
      }
      if (psu.conn) {
        const needEps = board ? board.eps8 : cpu ? 1 : 0;
        if (needEps && psu.conn.eps8 < needEps) add(psu.conn.eps8 >= 1 ? 'warn' : 'error', 'psu-eps', `${board ? board.name : 'The board'} has ${needEps} CPU power (EPS 8-pin) connectors; ${psu.name} has ${psu.conn.eps8}.`, [psu.id]);
        const needP = sum(gpuItems, (x) => ((x.part.conn && x.part.conn.pcie8) || 0) * x.qty);
        const needH = sum(gpuItems, (x) => ((x.part.conn && x.part.conn.h12v) || 0) * x.qty);
        const haveP = psu.conn.pcie8 || 0, haveH = psu.conn.h12v || 0;
        const gids = gpuItems.map((x) => x.part.id);
        if (needP > haveP) add('error', 'psu-pcie8', `GPUs need ${needP} PCIe 8-pin cables; ${psu.name} has ${haveP}.`, gids.concat(psu.id));
        const missingH = Math.max(0, needH - haveH);
        if (missingH) {
          const spare = Math.max(0, haveP - needP);
          if (spare >= 3 * missingH) add('warn', 'psu-adapter', `${psu.name} lacks enough native 12V-2x6 cables, so ${missingH > 1 ? 'GPUs need' : 'the GPU needs'} the 8-pin adapter. A native cable is safer.`, gids.concat(psu.id));
          else add('error', 'psu-12v2x6', `GPUs need ${needH} 12V-2x6 connector${needH > 1 ? 's' : ''}; ${psu.name} has ${haveH} and too few 8-pin cables to adapt.`, gids.concat(psu.id));
        }
      } else if (psu.form === 'Server module') {
        add('info', 'psu-pdb', 'Server power modules feed the chassis power board. Check that the chassis has the GPU and CPU power leads you need.', [psu.id]);
      }
    } else if (items.length) {
      add('info', 'psu-missing', `No power supply yet. Estimated load is ${draw} W.`, []);
    }
    stats.power = power;

    // ---------- Fit and cooling ----------
    if (board && chassis && !chassis.boards.includes(board.formFactor)) {
      add('error', 'case-board', `${board.name} is ${board.formFactor}; ${chassis.name} takes ${chassis.boards.join(', ')}.`, [board.id, chassis.id]);
    }
    if (cooler) {
      if (cpu && !cooler.sockets.includes(cpu.socket)) add('error', 'cooler-socket', `${cooler.name} mounts on ${cooler.sockets.join('/')}, not ${cpu.socket}.`, [cooler.id, cpu.id]);
      if (cpu && coolerQty < cpuQty) add('error', 'cooler-count', `${cpuQty} CPUs need ${cpuQty} coolers. Raise the cooler quantity.`, [cooler.id]);
      if (chassis) {
        if (cooler.type === 'aio') {
          if (chassis.radMm != null && chassis.radMm < cooler.radMm) add('error', 'cooler-radiator', `${chassis.name} ${chassis.radMm ? `fits up to a ${chassis.radMm} mm radiator` : "has no radiator mount"}; ${cooler.name} is ${cooler.radMm} mm.`, [cooler.id, chassis.id]);
        } else if (chassis.coolerMaxMm != null && cooler.heightMm > chassis.coolerMaxMm) {
          add('error', 'cooler-height', `${cooler.name} is ${cooler.heightMm} mm tall; ${chassis.name} fits ${chassis.coolerMaxMm} mm.`, [cooler.id, chassis.id]);
        }
      }
      if (cooler.type === 'passive' && (!chassis || chassis.airflow !== 'server')) add('warn', 'cooler-passive', `${cooler.name} relies on server fans forcing air through it. It will overheat in a normal case.`, [cooler.id]);
      if (cpu && cooler.ratedW < cpu.powerW) add('warn', 'cooler-capacity', `${cooler.name} handles about ${cooler.ratedW} W; ${cpu.name} can pull ${cpu.powerW} W. Expect throttling under load.`, [cooler.id, cpu.id]);
    } else if (cpu) {
      add('warn', 'cooler-missing', `No CPU cooler picked. ${cpu.tags.includes('consumer') ? 'Check whether one comes in the box.' : 'Workstation and server CPUs ship without one.'}`, [cpu.id]);
    }
    if (cpu && gpuCount === 0 && !cpu.igpu && !(board && board.bmc)) {
      add('warn', 'no-display', `${cpu.name} has no integrated graphics${board ? ` and ${board.name} has no BMC video` : ''}. Add a GPU to get a display.`, [cpu.id]);
    }

    // ---------- Specs we only estimated ----------
    const est = (p, what) => p && p.estimated && p.estimated.includes(what);
    if (est(board, 'layout')) add('info', 'est-layout', `${board.name}'s slot layout is estimated from its size and chipset. Check the manual for exact PCIe and M.2 wiring.`, [board.id]);
    if (est(chassis, 'clearance') && (gpuCount || cooler)) add('info', 'est-clearance', `We don't have GPU length, cooler height or radiator limits for ${chassis.name} yet. Check its spec sheet.`, [chassis.id]);
    if (est(psu, 'connectors') && (gpuCount || board)) add('info', 'est-connectors', `${psu.name}'s cable counts are estimated from its wattage.`, [psu.id]);

    // ---------- What's missing ----------
    if (items.length) {
      const missing = [];
      if (!cpu) missing.push('CPU');
      if (!board) missing.push('motherboard');
      if (!memItems.length) missing.push('memory');
      if (!drives.length) missing.push('storage');
      if (!chassis) missing.push('case');
      if (missing.length) add('info', 'missing', `Still to pick: ${missing.join(', ')}.`, []);
    }

    const order = { error: 0, warn: 1, info: 2 };
    issues.sort((a, b) => order[a.level] - order[b.level]);
    const counts = { error: 0, warn: 0, info: 0 };
    for (const i of issues) counts[i.level]++;
    return { issues, stats, counts };
  }

  // Would adding (or swapping in) this part introduce new errors?
  function checkCandidate(build, part, parts, baseline) {
    const cat = CATEGORIES.find((c) => c.key === part.cat);
    const items = (build.items || []).slice();
    const index = indexParts(parts);
    let next;
    if (cat && !cat.multi) {
      const existing = items.find((it) => { const p = index.get(it.id); return p && p.cat === part.cat; });
      next = items.filter((it) => { const p = index.get(it.id); return !p || p.cat !== part.cat; });
      next.push({ id: part.id, qty: existing && !cat.singleQty ? existing.qty : 1 });
    } else {
      const existing = items.find((it) => it.id === part.id);
      next = existing ? items.map((it) => (it.id === part.id ? { id: it.id, qty: it.qty + 1 } : it)) : items.concat({ id: part.id, qty: 1 });
    }
    const before = baseline || errorKeys(build, index);
    const after = evaluate({ items: next }, index);
    const fresh = after.issues.filter((i) => i.level === 'error' && !before.has(i.rule + '|' + i.msg));
    return { ok: fresh.length === 0, reasons: fresh.map((i) => i.msg), items: next };
  }

  function errorKeys(build, parts) {
    return new Set(evaluate(build, parts).issues.filter((i) => i.level === 'error').map((i) => i.rule + '|' + i.msg));
  }

  const api = { evaluate, checkCandidate, errorKeys, CATEGORIES, PLATFORM_NAMES, IFACE_NAMES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SLOTWISE_ENGINE = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
