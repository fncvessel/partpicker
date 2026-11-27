/* Slotwise seed catalog.
 * Specs are simplified from public datasheets and prices are rough USD street/MSRP
 * estimates. Items with brand "Generic" stand in for a class of part.
 */
(function (root) {
  'use strict';
  const parts = [];
  const add = (cat, list) => list.forEach((p) => parts.push(Object.assign({ cat }, p)));
  // PCIe slot group: n slots, physical size, electrical lanes, gen, wired to cpu 1/2 or 'pch'
  const slot = (n, size, lanes, gen, cpu, group) => ({ n, size, lanes, gen, cpu, group });
  const m2 = (n, gen, cpu, sizes) => ({ n, gen, cpu, sizes: sizes || ['2280'] });

  // ---------- CPUs ----------
  const ddr5u = { memTypes: ['DDR5'], memModules: ['UDIMM'] };
  const ddr5r = { memTypes: ['DDR5'], memModules: ['RDIMM'] };
  add('cpu', [
    { id: 'r5-9600x', name: 'AMD Ryzen 5 9600X', brand: 'AMD', price: 229, tags: ['consumer'], socket: 'AM5', platform: 'am5', cores: 6, threads: 12, powerW: 88, ...ddr5u, memChannels: 2, memSpeed: 5600, maxMemGB: 256, lanes: 24, pcieGen: 5, maxSockets: 1, igpu: true, ecc: true },
    { id: 'r7-9800x3d', name: 'AMD Ryzen 7 9800X3D', brand: 'AMD', price: 479, tags: ['consumer'], socket: 'AM5', platform: 'am5', cores: 8, threads: 16, powerW: 162, ...ddr5u, memChannels: 2, memSpeed: 5600, maxMemGB: 256, lanes: 24, pcieGen: 5, maxSockets: 1, igpu: true, ecc: true },
    { id: 'r9-9950x', name: 'AMD Ryzen 9 9950X', brand: 'AMD', price: 649, tags: ['consumer', 'workstation'], socket: 'AM5', platform: 'am5', cores: 16, threads: 32, powerW: 230, ...ddr5u, memChannels: 2, memSpeed: 5600, maxMemGB: 256, lanes: 24, pcieGen: 5, maxSockets: 1, igpu: true, ecc: true },
    { id: 'epyc-4564p', name: 'AMD EPYC 4564P', brand: 'AMD', price: 699, tags: ['server'], socket: 'AM5', platform: 'am5', cores: 16, threads: 32, powerW: 230, ...ddr5u, memChannels: 2, memSpeed: 5200, maxMemGB: 192, lanes: 28, pcieGen: 5, maxSockets: 1, igpu: true, ecc: true },
    { id: 'cu9-285k', name: 'Intel Core Ultra 9 285K', brand: 'Intel', price: 589, tags: ['consumer', 'workstation'], socket: 'LGA1851', platform: 'arrow-lake', cores: 24, threads: 24, powerW: 250, ...ddr5u, memChannels: 2, memSpeed: 6400, maxMemGB: 256, lanes: 24, pcieGen: 5, maxSockets: 1, igpu: true, ecc: true },
    { id: 'i5-14600k', name: 'Intel Core i5-14600K', brand: 'Intel', price: 249, tags: ['consumer'], socket: 'LGA1700', platform: 'core-12-14', cores: 14, threads: 20, powerW: 181, memTypes: ['DDR4', 'DDR5'], memModules: ['UDIMM'], memChannels: 2, memSpeed: 5600, maxMemGB: 192, lanes: 20, pcieGen: 5, maxSockets: 1, igpu: true, ecc: true },
    { id: 'xeon-e-2488', name: 'Intel Xeon E-2488', brand: 'Intel', price: 606, tags: ['server'], socket: 'LGA1700', platform: 'xeon-e-2400', cores: 8, threads: 16, powerW: 95, ...ddr5u, memChannels: 2, memSpeed: 4800, maxMemGB: 128, lanes: 16, pcieGen: 5, maxSockets: 1, igpu: false, ecc: true },
    { id: 'tr-7980x', name: 'AMD Threadripper 7980X', brand: 'AMD', price: 4999, tags: ['workstation'], socket: 'sTR5', platform: 'tr-7000', cores: 64, threads: 128, powerW: 350, ...ddr5r, memChannels: 4, memSpeed: 5200, maxMemGB: 1024, lanes: 88, pcieGen: 5, maxSockets: 1, igpu: false, ecc: true },
    { id: 'tr-9970x', name: 'AMD Threadripper 9970X', brand: 'AMD', price: 2499, tags: ['workstation'], socket: 'sTR5', platform: 'tr-9000', cores: 32, threads: 64, powerW: 350, ...ddr5r, memChannels: 4, memSpeed: 6400, maxMemGB: 1024, lanes: 88, pcieGen: 5, maxSockets: 1, igpu: false, ecc: true },
    { id: 'tr-pro-7975wx', name: 'AMD Threadripper PRO 7975WX', brand: 'AMD', price: 3899, tags: ['workstation'], socket: 'sTR5', platform: 'tr-pro-7000', cores: 32, threads: 64, powerW: 350, ...ddr5r, memChannels: 8, memSpeed: 5200, maxMemGB: 2048, lanes: 128, pcieGen: 5, maxSockets: 1, igpu: false, ecc: true },
    { id: 'tr-pro-9995wx', name: 'AMD Threadripper PRO 9995WX', brand: 'AMD', price: 11699, tags: ['workstation'], socket: 'sTR5', platform: 'tr-pro-9000', cores: 96, threads: 192, powerW: 350, ...ddr5r, memChannels: 8, memSpeed: 6400, maxMemGB: 2048, lanes: 128, pcieGen: 5, maxSockets: 1, igpu: false, ecc: true },
    { id: 'xeon-w5-2465x', name: 'Intel Xeon w5-2465X', brand: 'Intel', price: 1389, tags: ['workstation'], socket: 'LGA4677', platform: 'xeon-w-2400', cores: 16, threads: 32, powerW: 200, ...ddr5r, memChannels: 4, memSpeed: 4800, maxMemGB: 2048, lanes: 64, pcieGen: 5, maxSockets: 1, igpu: false, ecc: true },
    { id: 'xeon-w7-3465x', name: 'Intel Xeon w7-3465X', brand: 'Intel', price: 3889, tags: ['workstation'], socket: 'LGA4677', platform: 'xeon-w-3400', cores: 28, threads: 56, powerW: 300, ...ddr5r, memChannels: 8, memSpeed: 4800, maxMemGB: 4096, lanes: 112, pcieGen: 5, maxSockets: 1, igpu: false, ecc: true },
    { id: 'xeon-gold-6430', name: 'Intel Xeon Gold 6430', brand: 'Intel', price: 2128, tags: ['server'], socket: 'LGA4677', platform: 'xeon-sp-4', cores: 32, threads: 64, powerW: 270, ...ddr5r, memChannels: 8, memSpeed: 4400, maxMemGB: 4096, lanes: 80, pcieGen: 5, maxSockets: 2, igpu: false, ecc: true },
    { id: 'xeon-gold-6530', name: 'Intel Xeon Gold 6530', brand: 'Intel', price: 2130, tags: ['server'], socket: 'LGA4677', platform: 'xeon-sp-5', cores: 32, threads: 64, powerW: 270, ...ddr5r, memChannels: 8, memSpeed: 4800, maxMemGB: 4096, lanes: 80, pcieGen: 5, maxSockets: 2, igpu: false, ecc: true },
    { id: 'xeon-plat-8480p', name: 'Intel Xeon Platinum 8480+', brand: 'Intel', price: 10710, tags: ['server'], socket: 'LGA4677', platform: 'xeon-sp-4', cores: 56, threads: 112, powerW: 350, ...ddr5r, memChannels: 8, memSpeed: 4800, maxMemGB: 4096, lanes: 80, pcieGen: 5, maxSockets: 8, igpu: false, ecc: true },
    { id: 'epyc-9124', name: 'AMD EPYC 9124', brand: 'AMD', price: 1083, tags: ['server'], socket: 'SP5', platform: 'epyc-9004', cores: 16, threads: 32, powerW: 200, ...ddr5r, memChannels: 12, memSpeed: 4800, maxMemGB: 6144, lanes: 128, lanes2P: 80, pcieGen: 5, maxSockets: 2, igpu: false, ecc: true },
    { id: 'epyc-9354p', name: 'AMD EPYC 9354P', brand: 'AMD', price: 2730, tags: ['server'], socket: 'SP5', platform: 'epyc-9004', cores: 32, threads: 64, powerW: 280, ...ddr5r, memChannels: 12, memSpeed: 4800, maxMemGB: 6144, lanes: 128, pcieGen: 5, maxSockets: 1, igpu: false, ecc: true },
    { id: 'epyc-9654', name: 'AMD EPYC 9654', brand: 'AMD', price: 11805, tags: ['server'], socket: 'SP5', platform: 'epyc-9004', cores: 96, threads: 192, powerW: 360, ...ddr5r, memChannels: 12, memSpeed: 4800, maxMemGB: 6144, lanes: 128, lanes2P: 80, pcieGen: 5, maxSockets: 2, igpu: false, ecc: true },
    { id: 'epyc-9555', name: 'AMD EPYC 9555', brand: 'AMD', price: 9826, tags: ['server'], socket: 'SP5', platform: 'epyc-9005', cores: 64, threads: 128, powerW: 360, ...ddr5r, memChannels: 12, memSpeed: 6000, maxMemGB: 6144, lanes: 128, lanes2P: 80, pcieGen: 5, maxSockets: 2, igpu: false, ecc: true },
    { id: 'epyc-7543', name: 'AMD EPYC 7543', brand: 'AMD', price: 3761, tags: ['server'], socket: 'SP3', platform: 'epyc-7003', cores: 32, threads: 64, powerW: 225, memTypes: ['DDR4'], memModules: ['RDIMM', 'LRDIMM'], memChannels: 8, memSpeed: 3200, maxMemGB: 4096, lanes: 128, lanes2P: 64, pcieGen: 4, maxSockets: 2, igpu: false, ecc: true },
  ]);

  // ---------- Motherboards ----------
  add('motherboard', [
    { id: 'msi-b650-tomahawk', name: 'MSI MAG B650 Tomahawk WiFi', brand: 'MSI', price: 219, tags: ['consumer'], socket: 'AM5', platforms: ['am5'], chipset: 'B650', formFactor: 'ATX', sockets: 1, memType: 'DDR5', memModules: ['UDIMM'], ecc: false, dimmSlots: 4, memChannels: 2, maxMemGB: 256,
      pcie: [slot(1, 16, 16, 4, 1), slot(1, 16, 4, 4, 'pch'), slot(1, 16, 2, 4, 'pch')], m2: [m2(1, 5, 1), m2(1, 4, 1), m2(1, 4, 'pch')], sata: 6, nvmePorts: 0, ocp: 0, slotPositions: 7, eps8: 2, bmc: false, bifurcation: true, chipsetLanes: 12, watts: 40 },
    { id: 'asus-proart-x870e', name: 'ASUS ProArt X870E-Creator WiFi', brand: 'ASUS', price: 479, tags: ['consumer', 'workstation'], socket: 'AM5', platforms: ['am5'], chipset: 'X870E', formFactor: 'ATX', sockets: 1, memType: 'DDR5', memModules: ['UDIMM'], ecc: true, dimmSlots: 4, memChannels: 2, maxMemGB: 256,
      pcie: [slot(1, 16, 16, 5, 1, 'cpu-x16'), slot(1, 16, 8, 5, 1, 'cpu-x16'), slot(1, 16, 4, 4, 'pch')], laneGroups: { 'cpu-x16': 16 }, m2: [m2(2, 5, 1), m2(2, 4, 'pch')], sata: 2, nvmePorts: 0, ocp: 0, slotPositions: 7, eps8: 2, bmc: false, bifurcation: true, chipsetLanes: 16, watts: 45 },
    { id: 'asus-strix-b650e-i', name: 'ASUS ROG Strix B650E-I Gaming WiFi', brand: 'ASUS', price: 279, tags: ['consumer'], socket: 'AM5', platforms: ['am5'], chipset: 'B650E', formFactor: 'ITX', sockets: 1, memType: 'DDR5', memModules: ['UDIMM'], ecc: false, dimmSlots: 2, memChannels: 2, maxMemGB: 128,
      pcie: [slot(1, 16, 16, 5, 1)], m2: [m2(1, 5, 1), m2(1, 4, 'pch')], sata: 2, nvmePorts: 0, ocp: 0, slotPositions: 2, eps8: 1, bmc: false, bifurcation: true, chipsetLanes: 8, watts: 30 },
    { id: 'asrock-rack-b650d4u', name: 'ASRock Rack B650D4U', brand: 'ASRock Rack', price: 299, tags: ['server'], socket: 'AM5', platforms: ['am5'], chipset: 'B650', formFactor: 'mATX', sockets: 1, memType: 'DDR5', memModules: ['UDIMM'], ecc: true, dimmSlots: 4, memChannels: 2, maxMemGB: 192,
      pcie: [slot(1, 16, 16, 5, 1), slot(1, 16, 4, 4, 1), slot(1, 4, 4, 4, 'pch')], m2: [m2(1, 5, 1), m2(1, 4, 'pch')], sata: 4, nvmePorts: 0, ocp: 0, slotPositions: 4, eps8: 1, bmc: true, bifurcation: true, chipsetLanes: 8, watts: 40 },
    { id: 'asus-maximus-z890-hero', name: 'ASUS ROG Maximus Z890 Hero', brand: 'ASUS', price: 699, tags: ['consumer'], socket: 'LGA1851', platforms: ['arrow-lake'], chipset: 'Z890', formFactor: 'ATX', sockets: 1, memType: 'DDR5', memModules: ['UDIMM'], ecc: false, dimmSlots: 4, memChannels: 2, maxMemGB: 256,
      pcie: [slot(1, 16, 16, 5, 1, 'cpu-x16'), slot(1, 16, 8, 5, 1, 'cpu-x16'), slot(1, 16, 4, 4, 'pch')], laneGroups: { 'cpu-x16': 16 }, m2: [m2(2, 5, 1), m2(4, 4, 'pch')], sata: 4, nvmePorts: 0, ocp: 0, slotPositions: 7, eps8: 2, bmc: false, bifurcation: true, chipsetLanes: 24, watts: 50 },
    { id: 'msi-z790-a-ddr4', name: 'MSI PRO Z790-A WiFi DDR4', brand: 'MSI', price: 199, tags: ['consumer'], socket: 'LGA1700', platforms: ['core-12-14'], chipset: 'Z790', formFactor: 'ATX', sockets: 1, memType: 'DDR4', memModules: ['UDIMM'], ecc: false, dimmSlots: 4, memChannels: 2, maxMemGB: 128,
      pcie: [slot(1, 16, 16, 5, 1), slot(2, 16, 4, 4, 'pch'), slot(1, 1, 1, 3, 'pch')], m2: [m2(1, 4, 1), m2(3, 4, 'pch')], sata: 6, nvmePorts: 0, ocp: 0, slotPositions: 7, eps8: 2, bmc: false, bifurcation: false, chipsetLanes: 20, watts: 40 },
    { id: 'asus-w680-ace', name: 'ASUS Pro WS W680-ACE', brand: 'ASUS', price: 389, tags: ['workstation', 'server'], socket: 'LGA1700', platforms: ['core-12-14'], chipset: 'W680', formFactor: 'ATX', sockets: 1, memType: 'DDR5', memModules: ['UDIMM'], ecc: true, dimmSlots: 4, memChannels: 2, maxMemGB: 192,
      pcie: [slot(1, 16, 16, 5, 1, 'cpu-x16'), slot(1, 16, 8, 5, 1, 'cpu-x16'), slot(1, 16, 4, 3, 'pch')], laneGroups: { 'cpu-x16': 16 }, m2: [m2(1, 4, 1), m2(2, 4, 'pch')], sata: 4, nvmePorts: 0, ocp: 0, slotPositions: 7, eps8: 2, bmc: false, bifurcation: true, chipsetLanes: 16, watts: 40 },
    { id: 'sm-x13scl-f', name: 'Supermicro X13SCL-F', brand: 'Supermicro', price: 329, tags: ['server'], socket: 'LGA1700', platforms: ['xeon-e-2400'], chipset: 'C262', formFactor: 'mATX', sockets: 1, memType: 'DDR5', memModules: ['UDIMM'], ecc: true, dimmSlots: 4, memChannels: 2, maxMemGB: 128,
      pcie: [slot(1, 16, 16, 5, 1), slot(1, 8, 4, 4, 'pch')], m2: [m2(2, 4, 'pch', ['2280', '22110'])], sata: 4, nvmePorts: 0, ocp: 0, slotPositions: 4, eps8: 1, bmc: true, bifurcation: true, chipsetLanes: 12, watts: 35 },
    { id: 'asus-trx50-sage', name: 'ASUS Pro WS TRX50-SAGE WiFi', brand: 'ASUS', price: 899, tags: ['workstation'], socket: 'sTR5', platforms: ['tr-7000', 'tr-9000', 'tr-pro-7000', 'tr-pro-9000'], chipset: 'TRX50', formFactor: 'CEB', sockets: 1, memType: 'DDR5', memModules: ['RDIMM'], ecc: true, dimmSlots: 4, memChannels: 4, maxMemGB: 1024,
      pcie: [slot(3, 16, 16, 5, 1), slot(1, 16, 8, 5, 1), slot(1, 16, 4, 4, 'pch')], m2: [m2(2, 5, 1), m2(1, 4, 'pch')], sata: 4, nvmePorts: 0, ocp: 0, slotPositions: 7, eps8: 2, bmc: false, bifurcation: true, chipsetLanes: 8, watts: 60 },
    { id: 'asus-wrx90e-sage', name: 'ASUS Pro WS WRX90E-SAGE SE', brand: 'ASUS', price: 1299, tags: ['workstation'], socket: 'sTR5', platforms: ['tr-pro-7000', 'tr-pro-9000'], chipset: 'WRX90', formFactor: 'EEB', sockets: 1, memType: 'DDR5', memModules: ['RDIMM'], ecc: true, dimmSlots: 8, memChannels: 8, maxMemGB: 2048,
      pcie: [slot(6, 16, 16, 5, 1), slot(1, 16, 8, 5, 1)], m2: [m2(4, 5, 1)], sata: 4, nvmePorts: 2, ocp: 0, slotPositions: 7, eps8: 2, bmc: true, bifurcation: true, chipsetLanes: 8, watts: 70 },
    { id: 'asus-w790e-sage', name: 'ASUS Pro WS W790E-SAGE SE', brand: 'ASUS', price: 1249, tags: ['workstation'], socket: 'LGA4677', platforms: ['xeon-w-2400', 'xeon-w-3400'], chipset: 'W790', formFactor: 'EEB', sockets: 1, memType: 'DDR5', memModules: ['RDIMM'], ecc: true, dimmSlots: 8, memChannels: 8, maxMemGB: 2048,
      pcie: [slot(5, 16, 16, 5, 1), slot(2, 16, 8, 5, 1)], m2: [m2(2, 5, 1), m2(2, 4, 'pch')], sata: 4, nvmePorts: 2, ocp: 0, slotPositions: 7, eps8: 2, bmc: true, bifurcation: true, chipsetLanes: 8, watts: 70 },
    { id: 'sm-h13ssl-n', name: 'Supermicro H13SSL-N', brand: 'Supermicro', price: 699, tags: ['server'], socket: 'SP5', platforms: ['epyc-9004', 'epyc-9005'], chipset: 'SoC', formFactor: 'ATX', sockets: 1, memType: 'DDR5', memModules: ['RDIMM'], ecc: true, dimmSlots: 12, memChannels: 12, maxMemGB: 3072,
      pcie: [slot(3, 16, 16, 5, 1), slot(2, 8, 8, 5, 1)], m2: [m2(2, 4, 1, ['2280', '22110'])], sata: 8, nvmePorts: 4, ocp: 0, slotPositions: 7, eps8: 2, bmc: true, bifurcation: true, chipsetLanes: 0, watts: 70 },
    { id: 'gigabyte-mz73-lm0', name: 'Gigabyte MZ73-LM0 (dual SP5)', brand: 'Gigabyte', price: 1599, tags: ['server'], socket: 'SP5', platforms: ['epyc-9004', 'epyc-9005'], chipset: 'SoC', formFactor: 'EEB', sockets: 2, memType: 'DDR5', memModules: ['RDIMM'], ecc: true, dimmSlots: 24, memChannels: 12, maxMemGB: 6144,
      pcie: [slot(2, 16, 16, 5, 1), slot(2, 16, 16, 5, 2)], m2: [m2(1, 5, 1, ['2280', '22110'])], sata: 0, nvmePorts: 8, ocp: 1, slotPositions: 4, eps8: 4, bmc: true, bifurcation: true, chipsetLanes: 0, watts: 90 },
    { id: 'sm-x13dei', name: 'Supermicro X13DEI', brand: 'Supermicro', price: 949, tags: ['server'], socket: 'LGA4677', platforms: ['xeon-sp-4', 'xeon-sp-5'], chipset: 'C741', formFactor: 'EEB', sockets: 2, memType: 'DDR5', memModules: ['RDIMM'], ecc: true, dimmSlots: 16, memChannels: 8, maxMemGB: 4096,
      pcie: [slot(3, 16, 16, 5, 1), slot(2, 16, 16, 5, 2), slot(1, 8, 8, 5, 2)], m2: [m2(2, 3, 'pch', ['2280', '22110'])], sata: 10, nvmePorts: 4, ocp: 0, slotPositions: 7, eps8: 3, bmc: true, bifurcation: true, chipsetLanes: 8, watts: 90 },
    { id: 'asrock-rack-romed8-2t', name: 'ASRock Rack ROMED8-2T', brand: 'ASRock Rack', price: 679, tags: ['server'], socket: 'SP3', platforms: ['epyc-7003'], chipset: 'SoC', formFactor: 'ATX', sockets: 1, memType: 'DDR4', memModules: ['RDIMM', 'LRDIMM'], ecc: true, dimmSlots: 8, memChannels: 8, maxMemGB: 2048,
      pcie: [slot(7, 16, 16, 4, 1)], m2: [m2(2, 4, 1, ['2280', '22110'])], sata: 8, nvmePorts: 2, ocp: 0, slotPositions: 7, eps8: 1, bmc: true, bifurcation: true, chipsetLanes: 0, watts: 60 },
  ]);

  // ---------- Memory (price per kit) ----------
  add('memory', [
    { id: 'corsair-ddr5-6000-2x16', name: 'Corsair Vengeance DDR5-6000 32 GB (2×16)', brand: 'Corsair', price: 99, tags: ['consumer'], type: 'DDR5', module: 'UDIMM', ecc: false, gb: 16, sticks: 2, speed: 6000 },
    { id: 'gskill-ddr5-6400-2x32', name: 'G.Skill Trident Z5 DDR5-6400 64 GB (2×32)', brand: 'G.Skill', price: 199, tags: ['consumer', 'workstation'], type: 'DDR5', module: 'UDIMM', ecc: false, gb: 32, sticks: 2, speed: 6400 },
    { id: 'crucial-ddr5-5600-2x48', name: 'Crucial DDR5-5600 96 GB (2×48)', brand: 'Crucial', price: 229, tags: ['consumer', 'workstation'], type: 'DDR5', module: 'UDIMM', ecc: false, gb: 48, sticks: 2, speed: 5600 },
    { id: 'kingston-ddr4-3200-2x16', name: 'Kingston Fury Beast DDR4-3200 32 GB (2×16)', brand: 'Kingston', price: 55, tags: ['consumer'], type: 'DDR4', module: 'UDIMM', ecc: false, gb: 16, sticks: 2, speed: 3200 },
    { id: 'kingston-ddr5-4800-32-ecc', name: 'Kingston Server Premier DDR5-4800 32 GB ECC UDIMM', brand: 'Kingston', price: 135, tags: ['server', 'workstation'], type: 'DDR5', module: 'UDIMM', ecc: true, gb: 32, sticks: 1, speed: 4800 },
    { id: 'samsung-ddr5-4800-32-rdimm', name: 'Samsung DDR5-4800 32 GB RDIMM', brand: 'Samsung', price: 160, tags: ['server', 'workstation'], type: 'DDR5', module: 'RDIMM', ecc: true, gb: 32, sticks: 1, speed: 4800 },
    { id: 'samsung-ddr5-5600-64-rdimm', name: 'Samsung DDR5-5600 64 GB RDIMM', brand: 'Samsung', price: 330, tags: ['server', 'workstation'], type: 'DDR5', module: 'RDIMM', ecc: true, gb: 64, sticks: 1, speed: 5600 },
    { id: 'micron-ddr5-6400-96-rdimm', name: 'Micron DDR5-6400 96 GB RDIMM', brand: 'Micron', price: 520, tags: ['server', 'workstation'], type: 'DDR5', module: 'RDIMM', ecc: true, gb: 96, sticks: 1, speed: 6400 },
    { id: 'vcolor-ddr5-6000-4x32-rdimm', name: 'V-Color DDR5-6000 128 GB (4×32) OC RDIMM', brand: 'V-Color', price: 799, tags: ['workstation'], type: 'DDR5', module: 'RDIMM', ecc: true, gb: 32, sticks: 4, speed: 6000 },
    { id: 'samsung-ddr4-3200-32-rdimm', name: 'Samsung DDR4-3200 32 GB RDIMM', brand: 'Samsung', price: 95, tags: ['server'], type: 'DDR4', module: 'RDIMM', ecc: true, gb: 32, sticks: 1, speed: 3200 },
    { id: 'samsung-ddr4-3200-64-lrdimm', name: 'Samsung DDR4-3200 64 GB LRDIMM', brand: 'Samsung', price: 180, tags: ['server'], type: 'DDR4', module: 'LRDIMM', ecc: true, gb: 64, sticks: 1, speed: 3200 },
  ]);

  // ---------- GPUs and accelerators ----------
  add('gpu', [
    { id: 'rtx-5090-fe', name: 'NVIDIA GeForce RTX 5090 Founders Edition', brand: 'NVIDIA', price: 1999, tags: ['consumer', 'workstation'], vramGB: 32, gen: 5, lanes: 16, size: 16, widthSlots: 2, lengthMm: 304, powerW: 575, conn: { h12v: 1 }, cooling: 'open-air', lowProfile: false },
    { id: 'rtx-5080-fe', name: 'NVIDIA GeForce RTX 5080 Founders Edition', brand: 'NVIDIA', price: 999, tags: ['consumer'], vramGB: 16, gen: 5, lanes: 16, size: 16, widthSlots: 2, lengthMm: 304, powerW: 360, conn: { h12v: 1 }, cooling: 'open-air', lowProfile: false },
    { id: 'asus-prime-rtx-5070', name: 'ASUS Prime GeForce RTX 5070', brand: 'ASUS', price: 549, tags: ['consumer'], vramGB: 12, gen: 5, lanes: 16, size: 16, widthSlots: 2.5, lengthMm: 304, powerW: 250, conn: { pcie8: 1 }, cooling: 'open-air', lowProfile: false },
    { id: 'rtx-4060', name: 'GeForce RTX 4060 (dual-fan)', brand: 'Generic', price: 299, tags: ['consumer'], vramGB: 8, gen: 4, lanes: 8, size: 16, widthSlots: 2, lengthMm: 240, powerW: 115, conn: { pcie8: 1 }, cooling: 'open-air', lowProfile: false },
    { id: 'sapphire-9070xt-pulse', name: 'Sapphire Pulse Radeon RX 9070 XT', brand: 'Sapphire', price: 599, tags: ['consumer'], vramGB: 16, gen: 5, lanes: 16, size: 16, widthSlots: 3, lengthMm: 314, powerW: 304, conn: { pcie8: 2 }, cooling: 'open-air', lowProfile: false },
    { id: 'intel-arc-b580', name: 'Intel Arc B580 Limited Edition', brand: 'Intel', price: 249, tags: ['consumer'], vramGB: 12, gen: 4, lanes: 8, size: 16, widthSlots: 2, lengthMm: 272, powerW: 190, conn: { pcie8: 1 }, cooling: 'open-air', lowProfile: false },
    { id: 'rtx-pro-6000-ws', name: 'NVIDIA RTX PRO 6000 Blackwell Workstation', brand: 'NVIDIA', price: 8565, tags: ['workstation'], vramGB: 96, gen: 5, lanes: 16, size: 16, widthSlots: 2, lengthMm: 304, powerW: 600, conn: { h12v: 1 }, cooling: 'open-air', lowProfile: false },
    { id: 'rtx-pro-6000-maxq', name: 'NVIDIA RTX PRO 6000 Blackwell Max-Q', brand: 'NVIDIA', price: 8565, tags: ['workstation'], vramGB: 96, gen: 5, lanes: 16, size: 16, widthSlots: 2, lengthMm: 267, powerW: 300, conn: { h12v: 1 }, cooling: 'blower', lowProfile: false },
    { id: 'rtx-6000-ada', name: 'NVIDIA RTX 6000 Ada', brand: 'NVIDIA', price: 6800, tags: ['workstation'], vramGB: 48, gen: 4, lanes: 16, size: 16, widthSlots: 2, lengthMm: 267, powerW: 300, conn: { h12v: 1 }, cooling: 'blower', lowProfile: false },
    { id: 'rtx-a4000', name: 'NVIDIA RTX A4000', brand: 'NVIDIA', price: 1000, tags: ['workstation'], vramGB: 16, gen: 4, lanes: 16, size: 16, widthSlots: 1, lengthMm: 241, powerW: 140, conn: { pcie8: 1 }, cooling: 'blower', lowProfile: false },
    { id: 'rtx-4000-sff-ada', name: 'NVIDIA RTX 4000 SFF Ada', brand: 'NVIDIA', price: 1250, tags: ['workstation', 'server'], vramGB: 20, gen: 4, lanes: 16, size: 16, widthSlots: 2, lengthMm: 168, powerW: 70, conn: {}, cooling: 'blower', lowProfile: true },
    { id: 'nvidia-l4', name: 'NVIDIA L4', brand: 'NVIDIA', price: 2500, tags: ['server'], vramGB: 24, gen: 4, lanes: 16, size: 16, widthSlots: 1, lengthMm: 169, powerW: 72, conn: {}, cooling: 'passive', lowProfile: true },
    { id: 'nvidia-l40s', name: 'NVIDIA L40S', brand: 'NVIDIA', price: 8000, tags: ['server'], vramGB: 48, gen: 4, lanes: 16, size: 16, widthSlots: 2, lengthMm: 267, powerW: 350, conn: { h12v: 1 }, cooling: 'passive', lowProfile: false },
    { id: 'nvidia-h100-nvl', name: 'NVIDIA H100 NVL', brand: 'NVIDIA', price: 29000, tags: ['server'], vramGB: 94, gen: 5, lanes: 16, size: 16, widthSlots: 2, lengthMm: 267, powerW: 400, conn: { h12v: 1 }, cooling: 'passive', lowProfile: false },
    { id: 'amd-mi210', name: 'AMD Instinct MI210', brand: 'AMD', price: 9000, tags: ['server'], vramGB: 64, gen: 4, lanes: 16, size: 16, widthSlots: 2, lengthMm: 267, powerW: 300, conn: { pcie8: 1 }, cooling: 'passive', lowProfile: false },
  ]);

  // ---------- Storage ----------
  add('storage', [
    { id: 'samsung-990-pro-2tb', name: 'Samsung 990 Pro 2 TB', brand: 'Samsung', price: 169, tags: ['consumer', 'workstation'], iface: 'm2', form: 'M.2 2280', gen: 4, tb: 2, watts: 8, media: 'SSD' },
    { id: 'wd-sn850x-4tb', name: 'WD Black SN850X 4 TB', brand: 'WD', price: 279, tags: ['consumer', 'workstation'], iface: 'm2', form: 'M.2 2280', gen: 4, tb: 4, watts: 8, media: 'SSD' },
    { id: 'crucial-t705-2tb', name: 'Crucial T705 2 TB', brand: 'Crucial', price: 249, tags: ['consumer', 'workstation'], iface: 'm2', form: 'M.2 2280', gen: 5, tb: 2, watts: 10, media: 'SSD' },
    { id: 'samsung-pm9a3-1.92-m2', name: 'Samsung PM9A3 1.92 TB (M.2 22110)', brand: 'Samsung', price: 250, tags: ['server'], iface: 'm2', form: 'M.2 22110', gen: 4, tb: 1.92, watts: 8, media: 'SSD' },
    { id: 'samsung-870-evo-2tb', name: 'Samsung 870 EVO 2 TB', brand: 'Samsung', price: 169, tags: ['consumer'], iface: 'sata', form: '2.5"', gen: 0, tb: 2, watts: 3, media: 'SSD' },
    { id: 'wd-red-plus-8tb', name: 'WD Red Plus 8 TB', brand: 'WD', price: 189, tags: ['consumer', 'server'], iface: 'sata', form: '3.5"', gen: 0, tb: 8, watts: 6, media: 'HDD' },
    { id: 'seagate-exos-x20-20tb', name: 'Seagate Exos X20 20 TB SATA', brand: 'Seagate', price: 349, tags: ['server'], iface: 'sata', form: '3.5"', gen: 0, tb: 20, watts: 9, media: 'HDD' },
    { id: 'seagate-exos-x24-24tb-sas', name: 'Seagate Exos X24 24 TB SAS', brand: 'Seagate', price: 449, tags: ['server'], iface: 'sas', form: '3.5"', gen: 0, tb: 24, watts: 10, media: 'HDD' },
    { id: 'samsung-pm1643a-3.84', name: 'Samsung PM1643a 3.84 TB SAS SSD', brand: 'Samsung', price: 900, tags: ['server'], iface: 'sas', form: '2.5"', gen: 0, tb: 3.84, watts: 9, media: 'SSD' },
    { id: 'micron-7450-pro-3.84', name: 'Micron 7450 PRO 3.84 TB U.3', brand: 'Micron', price: 420, tags: ['server', 'workstation'], iface: 'u3', form: '2.5"', gen: 4, tb: 3.84, watts: 14, media: 'SSD' },
    { id: 'solidigm-p5520-7.68', name: 'Solidigm D7-P5520 7.68 TB U.2', brand: 'Solidigm', price: 800, tags: ['server'], iface: 'u2', form: '2.5"', gen: 4, tb: 7.68, watts: 20, media: 'SSD' },
    { id: 'kioxia-xd7p-3.84', name: 'Kioxia XD7P 3.84 TB E1.S', brand: 'Kioxia', price: 600, tags: ['server'], iface: 'e1s', form: 'E1.S', gen: 4, tb: 3.84, watts: 12, media: 'SSD' },
    { id: 'kioxia-cm7r-7.68', name: 'Kioxia CM7-R 7.68 TB E3.S', brand: 'Kioxia', price: 1500, tags: ['server'], iface: 'e3s', form: 'E3.S', gen: 5, tb: 7.68, watts: 24, media: 'SSD' },
  ]);

  // ---------- Storage controllers and adapters ----------
  add('controller', [
    { id: 'broadcom-9500-8i', name: 'Broadcom HBA 9500-8i (tri-mode)', brand: 'Broadcom', price: 380, tags: ['server', 'workstation'], kind: 'HBA', gen: 4, lanes: 8, size: 8, sasPorts: 8, nvmePorts: 2, watts: 10, widthSlots: 1, lowProfile: true },
    { id: 'broadcom-9500-16i', name: 'Broadcom HBA 9500-16i (tri-mode)', brand: 'Broadcom', price: 650, tags: ['server', 'workstation'], kind: 'HBA', gen: 4, lanes: 8, size: 8, sasPorts: 16, nvmePorts: 4, watts: 12, widthSlots: 1, lowProfile: true },
    { id: 'broadcom-9560-16i', name: 'Broadcom MegaRAID 9560-16i', brand: 'Broadcom', price: 1100, tags: ['server'], kind: 'RAID', gen: 4, lanes: 8, size: 8, sasPorts: 16, nvmePorts: 4, watts: 16, widthSlots: 1, lowProfile: true },
    { id: 'lsi-9300-8i', name: 'LSI SAS 9300-8i (IT mode)', brand: 'LSI', price: 90, tags: ['server'], kind: 'HBA', gen: 3, lanes: 8, size: 8, sasPorts: 8, nvmePorts: 0, watts: 13, widthSlots: 1, lowProfile: true },
    { id: 'asm1166-sata-6', name: '6-port SATA card (ASM1166)', brand: 'Generic', price: 35, tags: ['consumer'], kind: 'SATA', gen: 3, lanes: 2, size: 4, sataOnlyPorts: 6, nvmePorts: 0, watts: 3, widthSlots: 1, lowProfile: true },
    { id: 'asus-hyper-m2-gen5', name: 'ASUS Hyper M.2 x16 Gen5 (4× M.2)', brand: 'ASUS', price: 80, tags: ['consumer', 'workstation'], kind: 'M.2 adapter', gen: 5, lanes: 16, size: 16, m2Slots: 4, needsBifurcation: true, watts: 6, widthSlots: 1, lowProfile: false },
  ]);

  // ---------- Network ----------
  add('nic', [
    { id: 'tplink-tx201', name: 'TP-Link TX201 2.5GbE', brand: 'TP-Link', price: 30, tags: ['consumer'], form: 'pcie', speedG: 2.5, ports: 1, gen: 2, lanes: 1, size: 1, watts: 4, widthSlots: 1, lowProfile: true },
    { id: 'intel-x550-t2', name: 'Intel X550-T2 10GBASE-T', brand: 'Intel', price: 199, tags: ['workstation', 'server'], form: 'pcie', speedG: 10, ports: 2, gen: 3, lanes: 4, size: 4, watts: 13, widthSlots: 1, lowProfile: true },
    { id: 'intel-x710-da2', name: 'Intel X710-DA2 10G SFP+', brand: 'Intel', price: 260, tags: ['server', 'workstation'], form: 'pcie', speedG: 10, ports: 2, gen: 3, lanes: 8, size: 8, watts: 7, widthSlots: 1, lowProfile: true },
    { id: 'intel-e810-xxvda2', name: 'Intel E810-XXVDA2 25G SFP28', brand: 'Intel', price: 350, tags: ['server'], form: 'pcie', speedG: 25, ports: 2, gen: 4, lanes: 8, size: 8, watts: 16, widthSlots: 1, lowProfile: true },
    { id: 'cx6-dx-100g', name: 'NVIDIA ConnectX-6 Dx 2×100G', brand: 'NVIDIA', price: 1200, tags: ['server', 'workstation'], form: 'pcie', speedG: 100, ports: 2, gen: 4, lanes: 16, size: 16, watts: 20, widthSlots: 1, lowProfile: true },
    { id: 'cx7-400g', name: 'NVIDIA ConnectX-7 1×400G', brand: 'NVIDIA', price: 2200, tags: ['server'], form: 'pcie', speedG: 400, ports: 1, gen: 5, lanes: 16, size: 16, watts: 25, widthSlots: 1, lowProfile: true },
    { id: 'cx6-lx-ocp3', name: 'NVIDIA ConnectX-6 Lx 2×25G (OCP 3.0)', brand: 'NVIDIA', price: 400, tags: ['server'], form: 'ocp3', speedG: 25, ports: 2, gen: 4, lanes: 8, size: 8, watts: 12, widthSlots: 0, lowProfile: true },
    { id: 'intel-x710-t2l-ocp3', name: 'Intel X710-T2L 10GBASE-T (OCP 3.0)', brand: 'Intel', price: 300, tags: ['server'], form: 'ocp3', speedG: 10, ports: 2, gen: 3, lanes: 8, size: 8, watts: 9, widthSlots: 0, lowProfile: true },
  ]);

  // ---------- Power ----------
  add('psu', [
    { id: 'corsair-sf750', name: 'Corsair SF750', brand: 'Corsair', price: 179, tags: ['consumer'], form: 'SFX', watts: 750, efficiency: 'Platinum', redundant: false, conn: { eps8: 2, pcie8: 4, h12v: 0 } },
    { id: 'corsair-rm850x', name: 'Corsair RM850x (ATX 3.1)', brand: 'Corsair', price: 139, tags: ['consumer'], form: 'ATX', watts: 850, efficiency: 'Gold', redundant: false, conn: { eps8: 2, pcie8: 4, h12v: 1 } },
    { id: 'seasonic-focus-gx-1000', name: 'Seasonic Focus GX-1000 (ATX 3.1)', brand: 'Seasonic', price: 199, tags: ['consumer', 'workstation'], form: 'ATX', watts: 1000, efficiency: 'Gold', redundant: false, conn: { eps8: 2, pcie8: 4, h12v: 1 } },
    { id: 'corsair-hx1500i', name: 'Corsair HX1500i (ATX 3.1)', brand: 'Corsair', price: 329, tags: ['workstation'], form: 'ATX', watts: 1500, efficiency: 'Platinum', redundant: false, conn: { eps8: 3, pcie8: 6, h12v: 1 } },
    { id: 'seasonic-prime-tx-1600', name: 'Seasonic Prime TX-1600 (ATX 3.1)', brand: 'Seasonic', price: 529, tags: ['workstation'], form: 'ATX', watts: 1600, efficiency: 'Titanium', redundant: false, conn: { eps8: 2, pcie8: 4, h12v: 2 } },
    { id: 'fsp-twins-pro-900', name: 'FSP Twins Pro 900 W (redundant ATX)', brand: 'FSP', price: 499, tags: ['server'], form: 'ATX', watts: 900, efficiency: 'Platinum', redundant: true, builtInRedundant: true, conn: { eps8: 2, pcie8: 2, h12v: 0 } },
    { id: 'sm-pws-1k62a', name: 'Supermicro PWS-1K62A-1R 1600 W module', brand: 'Supermicro', price: 350, tags: ['server'], form: 'Server module', watts: 1600, efficiency: 'Titanium', redundant: true, conn: null },
    { id: 'sm-pws-2k08a', name: 'Supermicro PWS-2K08A-1R 2000 W module', brand: 'Supermicro', price: 450, tags: ['server'], form: 'Server module', watts: 2000, efficiency: 'Titanium', redundant: true, conn: null },
  ]);

  // ---------- Cases and chassis ----------
  const towerBays = (b35, b25) => ({ '3.5': b35, '2.5': b25 });
  add('case', [
    { id: 'cm-nr200p', name: 'Cooler Master NR200P', brand: 'Cooler Master', price: 109, tags: ['consumer'], kind: 'tower', boards: ['ITX'], psuForms: ['SFX'], gpuMaxMm: 330, coolerMaxMm: 155, radMm: 280, slots: 3, airflow: 'standard', bays: towerBays(1, 3) },
    { id: 'fractal-north', name: 'Fractal Design North', brand: 'Fractal', price: 139, tags: ['consumer'], kind: 'tower', boards: ['ITX', 'mATX', 'ATX'], psuForms: ['ATX'], gpuMaxMm: 355, coolerMaxMm: 170, radMm: 360, slots: 7, airflow: 'standard', bays: towerBays(2, 2) },
    { id: 'lianli-o11d-evo', name: 'Lian Li O11 Dynamic EVO', brand: 'Lian Li', price: 169, tags: ['consumer', 'workstation'], kind: 'tower', boards: ['ITX', 'mATX', 'ATX', 'CEB', 'E-ATX'], psuForms: ['ATX'], gpuMaxMm: 422, coolerMaxMm: 167, radMm: 360, slots: 7, airflow: 'standard', bays: towerBays(2, 4) },
    { id: 'fractal-define-7-xl', name: 'Fractal Design Define 7 XL', brand: 'Fractal', price: 239, tags: ['workstation', 'server'], kind: 'tower', boards: ['ITX', 'mATX', 'ATX', 'CEB', 'E-ATX', 'EEB'], psuForms: ['ATX'], gpuMaxMm: 440, coolerMaxMm: 185, radMm: 420, slots: 9, airflow: 'standard', bays: towerBays(18, 5) },
    { id: 'phanteks-pro2-server', name: 'Phanteks Enthoo Pro 2 Server Edition', brand: 'Phanteks', price: 179, tags: ['workstation', 'server'], kind: 'tower', boards: ['ITX', 'mATX', 'ATX', 'CEB', 'E-ATX', 'EEB'], psuForms: ['ATX'], gpuMaxMm: 503, coolerMaxMm: 195, radMm: 420, slots: 8, airflow: 'standard', bays: towerBays(12, 11) },
    { id: 'silverstone-rm44', name: 'SilverStone RM44 (4U)', brand: 'SilverStone', price: 319, tags: ['server', 'workstation'], kind: 'rack', ru: 4, boards: ['mATX', 'ATX', 'CEB', 'E-ATX', 'EEB'], psuForms: ['ATX'], gpuMaxMm: 312, coolerMaxMm: 148, radMm: 0, slots: 8, airflow: 'server', bays: towerBays(2, 4) },
    { id: 'sm-cse-846', name: 'Supermicro CSE-846 (4U, 24× 3.5" hot-swap)', brand: 'Supermicro', price: 1600, tags: ['server'], kind: 'rack', ru: 4, boards: ['ATX', 'E-ATX', 'EEB'], psuForms: ['Server module'], gpuMaxMm: 280, coolerMaxMm: 126, radMm: 0, slots: 7, airflow: 'server', bays: { '3.5': 24 } },
    { id: 'sm-cse-826', name: 'Supermicro CSE-826 (2U, 12× 3.5" hot-swap)', brand: 'Supermicro', price: 1100, tags: ['server'], kind: 'rack', ru: 2, boards: ['ATX', 'E-ATX', 'EEB'], psuForms: ['Server module'], gpuMaxMm: 170, coolerMaxMm: 64, radMm: 0, slots: 7, lowProfileOnly: true, airflow: 'server', bays: { '3.5': 12, '2.5': 2 } },
    { id: 'sm-cse-216-nvme', name: 'Supermicro CSE-216 (2U, 24× 2.5" NVMe/SAS)', brand: 'Supermicro', price: 1500, tags: ['server'], kind: 'rack', ru: 2, boards: ['ATX', 'E-ATX', 'EEB'], psuForms: ['Server module'], gpuMaxMm: 170, coolerMaxMm: 64, radMm: 0, slots: 7, lowProfileOnly: true, airflow: 'server', bays: { nvme: 24 } },
    { id: 'sm-cse-819', name: 'Supermicro CSE-819 (1U, 4× 3.5")', brand: 'Supermicro', price: 700, tags: ['server'], kind: 'rack', ru: 1, boards: ['mATX', 'ATX', 'E-ATX'], psuForms: ['Server module'], gpuMaxMm: 170, coolerMaxMm: 27, radMm: 0, slots: 2, lowProfileOnly: true, airflow: 'server', bays: { '3.5': 4 } },
    { id: 'generic-1u-e1s', name: '1U EDSFF chassis (16× E1.S)', brand: 'Generic', price: 1800, tags: ['server'], kind: 'rack', ru: 1, boards: ['ATX', 'E-ATX', 'EEB'], psuForms: ['Server module'], gpuMaxMm: 170, coolerMaxMm: 27, radMm: 0, slots: 2, lowProfileOnly: true, airflow: 'server', bays: { e1s: 16 } },
    { id: 'generic-2u-e3s', name: '2U EDSFF chassis (24× E3.S)', brand: 'Generic', price: 2200, tags: ['server'], kind: 'rack', ru: 2, boards: ['ATX', 'E-ATX', 'EEB'], psuForms: ['Server module'], gpuMaxMm: 170, coolerMaxMm: 64, radMm: 0, slots: 4, lowProfileOnly: true, airflow: 'server', bays: { e3s: 24 } },
  ]);

  // ---------- CPU coolers ----------
  const desk = ['AM5', 'AM4', 'LGA1700', 'LGA1851', 'LGA1200'];
  const deskAio = ['AM5', 'AM4', 'LGA1700', 'LGA1851'];
  add('cooler', [
    { id: 'thermalright-pa120se', name: 'Thermalright Peerless Assassin 120 SE', brand: 'Thermalright', price: 35, tags: ['consumer'], type: 'air', sockets: desk, heightMm: 155, ratedW: 245 },
    { id: 'noctua-nh-d15-g2', name: 'Noctua NH-D15 G2', brand: 'Noctua', price: 149, tags: ['consumer', 'workstation'], type: 'air', sockets: desk, heightMm: 168, ratedW: 250 },
    { id: 'noctua-nh-d12l', name: 'Noctua NH-D12L', brand: 'Noctua', price: 99, tags: ['consumer', 'server'], type: 'air', sockets: desk, heightMm: 145, ratedW: 200 },
    { id: 'noctua-nh-l9a-am5', name: 'Noctua NH-L9a-AM5', brand: 'Noctua', price: 55, tags: ['consumer'], type: 'air', sockets: ['AM5', 'AM4'], heightMm: 37, ratedW: 95 },
    { id: 'arctic-lf3-360', name: 'Arctic Liquid Freezer III 360', brand: 'Arctic', price: 119, tags: ['consumer', 'workstation'], type: 'aio', sockets: deskAio, heightMm: 55, radMm: 360, ratedW: 300 },
    { id: 'noctua-u14s-tr5-sp6', name: 'Noctua NH-U14S TR5-SP6', brand: 'Noctua', price: 159, tags: ['workstation'], type: 'air', sockets: ['sTR5', 'SP6'], heightMm: 165, ratedW: 350 },
    { id: 'noctua-u14s-dx-4677', name: 'Noctua NH-U14S DX-4677', brand: 'Noctua', price: 139, tags: ['workstation', 'server'], type: 'air', sockets: ['LGA4677'], heightMm: 165, ratedW: 300 },
    { id: 'arctic-freezer-4u-sp5', name: 'Arctic Freezer 4U-SP5', brand: 'Arctic', price: 70, tags: ['server', 'workstation'], type: 'air', sockets: ['SP5'], heightMm: 126, ratedW: 400 },
    { id: 'noctua-u9-tr4-sp3', name: 'Noctua NH-U9 TR4-SP3', brand: 'Noctua', price: 89, tags: ['server'], type: 'air', sockets: ['SP3', 'TR4'], heightMm: 125, ratedW: 225 },
    { id: 'passive-2u-sp5', name: '2U passive heatsink (SP5)', brand: 'Generic', price: 90, tags: ['server'], type: 'passive', sockets: ['SP5'], heightMm: 64, ratedW: 400 },
    { id: 'passive-2u-4677', name: '2U passive heatsink (LGA4677)', brand: 'Generic', price: 80, tags: ['server'], type: 'passive', sockets: ['LGA4677'], heightMm: 64, ratedW: 350 },
    { id: 'passive-1u-4677', name: '1U passive heatsink (LGA4677)', brand: 'Generic', price: 60, tags: ['server'], type: 'passive', sockets: ['LGA4677'], heightMm: 27, ratedW: 205 },
    { id: 'passive-1u-sp5', name: '1U passive heatsink (SP5)', brand: 'Generic', price: 70, tags: ['server'], type: 'passive', sockets: ['SP5'], heightMm: 27, ratedW: 240 },
  ]);


  // =====================================================================
  // Server and workstation lineups. Family specs are shared; each SKU row is
  // [model, cores, threads (0 = 2x cores), watts, approx list price USD, flags].
  // Prices are list/street estimates and show with ~ in the UI.
  // =====================================================================
  const have = new Set(parts.flatMap((p) => [p.id, p.name.toLowerCase()]));
  const addNew = (cat, list) => add(cat, list.filter((p) => !have.has(p.id) && !have.has(p.name.toLowerCase()) && have.add(p.id).add(p.name.toLowerCase())));
  function family(f, rows) {
    return rows.map(([model, cores, threads, powerW, price, flags]) => {
      flags = flags || '';
      const oneP = /1P/.test(flags) || /P$/.test(model) && f.prefix.startsWith('epyc-');
      return Object.assign({}, f.spec, {
        id: f.prefix + model.toLowerCase().replace(/\+/g, 'p').replace(/[^a-z0-9]+/g, '-'),
        name: f.name + ' ' + model, brand: f.brand, price, tags: f.tags, cores, threads: threads || cores * 2, powerW,
        maxSockets: oneP ? 1 : /4S/.test(flags) ? 4 : /8S/.test(flags) ? 8 : f.spec.maxSockets,
        memSpeed: /m(\d+)/.test(flags) ? +flags.match(/m(\d+)/)[1] : f.spec.memSpeed,
      });
    });
  }
  const rd5 = { memTypes: ['DDR5'], memModules: ['RDIMM'], ecc: true, igpu: false };
  addNew('cpu', [
    ...family({ prefix: 'epyc-', name: 'AMD EPYC', brand: 'AMD', tags: ['server'], spec: { ...rd5, socket: 'SP5', platform: 'epyc-9004', memChannels: 12, memSpeed: 4800, maxMemGB: 6144, lanes: 128, lanes2P: 80, pcieGen: 5, maxSockets: 2 } }, [
      ['9124', 16, 0, 200, 1083], ['9174F', 16, 0, 320, 3850], ['9224', 24, 0, 200, 1825], ['9254', 24, 0, 200, 2299], ['9274F', 24, 0, 320, 3060],
      ['9334', 32, 0, 210, 2990], ['9354', 32, 0, 280, 3420], ['9354P', 32, 0, 280, 2730], ['9374F', 32, 0, 320, 4860], ['9454', 48, 0, 290, 5225],
      ['9454P', 48, 0, 290, 4598], ['9474F', 48, 0, 360, 6780], ['9534', 64, 0, 280, 8803], ['9554', 64, 0, 360, 9087], ['9554P', 64, 0, 360, 7104],
      ['9634', 84, 0, 290, 10304], ['9654', 96, 0, 360, 11805], ['9654P', 96, 0, 360, 10625], ['9684X', 96, 0, 400, 14756],
      ['9734', 112, 0, 340, 9600], ['9754', 128, 0, 360, 11900], ['9754S', 128, 128, 360, 10200],
    ]),
    ...family({ prefix: 'epyc-', name: 'AMD EPYC', brand: 'AMD', tags: ['server'], spec: { ...rd5, socket: 'SP5', platform: 'epyc-9005', memChannels: 12, memSpeed: 6000, maxMemGB: 6144, lanes: 128, lanes2P: 80, pcieGen: 5, maxSockets: 2 } }, [
      ['9015', 8, 0, 125, 527], ['9115', 16, 0, 125, 726], ['9135', 16, 0, 200, 1214], ['9175F', 16, 0, 320, 4256], ['9255', 24, 0, 200, 2495],
      ['9275F', 24, 0, 320, 3439], ['9335', 32, 0, 210, 3178], ['9355', 32, 0, 280, 3694], ['9355P', 32, 0, 280, 2998], ['9365', 36, 0, 300, 4341],
      ['9375F', 32, 0, 320, 5306], ['9455', 48, 0, 300, 5412], ['9455P', 48, 0, 300, 4819], ['9475F', 48, 0, 400, 7592], ['9535', 64, 0, 300, 8992],
      ['9555', 64, 0, 360, 9826], ['9555P', 64, 0, 360, 7983], ['9565', 72, 0, 400, 10486], ['9575F', 64, 0, 400, 11791], ['9645', 96, 0, 320, 11048],
      ['9655', 96, 0, 400, 11852], ['9655P', 96, 0, 400, 10811], ['9745', 128, 0, 400, 12141], ['9755', 128, 0, 500, 12984], ['9825', 144, 0, 390, 13006],
      ['9845', 160, 0, 390, 13564], ['9965', 192, 0, 500, 14813],
    ]),
    ...family({ prefix: 'epyc-', name: 'AMD EPYC', brand: 'AMD', tags: ['server'], spec: { ...rd5, socket: 'SP6', platform: 'epyc-8004', memChannels: 6, memSpeed: 4800, maxMemGB: 1152, lanes: 96, pcieGen: 5, maxSockets: 1 } }, [
      ['8024P', 8, 0, 90, 409], ['8124P', 16, 0, 125, 639], ['8224P', 24, 0, 160, 855], ['8324P', 32, 0, 180, 1895], ['8434P', 48, 0, 200, 2700], ['8534P', 64, 0, 200, 4950],
    ]),
    ...family({ prefix: 'epyc-', name: 'AMD EPYC', brand: 'AMD', tags: ['server'], spec: { memTypes: ['DDR4'], memModules: ['RDIMM', 'LRDIMM'], ecc: true, igpu: false, socket: 'SP3', platform: 'epyc-7003', memChannels: 8, memSpeed: 3200, maxMemGB: 4096, lanes: 128, lanes2P: 64, pcieGen: 4, maxSockets: 2 } }, [
      ['7313', 16, 0, 155, 1083], ['7313P', 16, 0, 155, 913], ['7343', 16, 0, 190, 1565], ['7413', 24, 0, 180, 1825], ['7443', 24, 0, 200, 2010],
      ['7443P', 24, 0, 200, 1337], ['7453', 28, 0, 225, 1570], ['7513', 32, 0, 200, 2840], ['7543', 32, 0, 225, 3761], ['7543P', 32, 0, 225, 2730],
      ['7643', 48, 0, 225, 4995], ['7713', 64, 0, 225, 7060], ['7713P', 64, 0, 225, 5010], ['7763', 64, 0, 280, 7890], ['7773X', 64, 0, 280, 8800],
    ]),
    ...family({ prefix: 'epyc-', name: 'AMD EPYC', brand: 'AMD', tags: ['server'], spec: { memTypes: ['DDR5'], memModules: ['UDIMM'], ecc: true, igpu: true, socket: 'AM5', platform: 'am5', memChannels: 2, memSpeed: 5200, maxMemGB: 192, lanes: 28, pcieGen: 5, maxSockets: 1 } }, [
      ['4124P', 4, 0, 88, 149], ['4244P', 6, 0, 88, 229], ['4344P', 8, 0, 88, 329], ['4364P', 8, 0, 142, 399], ['4464P', 12, 0, 88, 429], ['4564P', 16, 0, 230, 699], ['4584PX', 16, 0, 162, 699],
    ]),
    ...family({ prefix: 'xeon-', name: 'Intel Xeon', brand: 'Intel', tags: ['server'], spec: { ...rd5, socket: 'LGA4677', platform: 'xeon-sp-4', memChannels: 8, memSpeed: 4800, maxMemGB: 4096, lanes: 80, pcieGen: 5, maxSockets: 2 } }, [
      ['Silver 4410Y', 12, 0, 150, 563, 'm4000'], ['Silver 4416+', 20, 0, 165, 1176, 'm4000'], ['Gold 5415+', 8, 0, 150, 1066, 'm4400'], ['Gold 5418Y', 24, 0, 185, 1483, 'm4400'],
      ['Gold 5420+', 28, 0, 205, 1848, 'm4400'], ['Gold 6426Y', 16, 0, 185, 1517, '4S'], ['Gold 6430', 32, 0, 270, 2128, 'm4400'], ['Gold 6438Y+', 32, 0, 205, 3141, '4S'],
      ['Gold 6442Y', 24, 0, 225, 2878, '4S'], ['Gold 6448Y', 32, 0, 225, 3583, '4S'], ['Gold 6454S', 32, 0, 270, 3157, '4S'], ['Platinum 8452Y', 36, 0, 300, 5350, '8S'],
      ['Platinum 8462Y+', 32, 0, 300, 5945, '8S'], ['Platinum 8468', 48, 0, 350, 7214, '8S'], ['Platinum 8470', 52, 0, 350, 9359, '8S'], ['Platinum 8480+', 56, 0, 350, 10710, '8S'],
      ['Platinum 8490H', 60, 0, 350, 17000, '8S'],
    ]),
    ...family({ prefix: 'xeon-', name: 'Intel Xeon', brand: 'Intel', tags: ['server'], spec: { ...rd5, socket: 'LGA4677', platform: 'xeon-sp-5', memChannels: 8, memSpeed: 5200, maxMemGB: 4096, lanes: 80, pcieGen: 5, maxSockets: 2 } }, [
      ['Silver 4510', 12, 0, 150, 563, 'm4400'], ['Gold 5512U', 28, 0, 185, 1230, '1P m4800'], ['Gold 5515+', 8, 0, 165, 1099, 'm4800'], ['Gold 6526Y', 16, 0, 195, 1517],
      ['Gold 6530', 32, 0, 270, 2130, 'm4800'], ['Gold 6538Y+', 32, 0, 225, 3141], ['Gold 6548Y+', 32, 0, 250, 3726], ['Platinum 8558', 48, 0, 330, 4650, 'm5200'],
      ['Platinum 8568Y+', 48, 0, 350, 6497, 'm5600'], ['Platinum 8580', 60, 0, 350, 10710, 'm5600'], ['Platinum 8592+', 64, 0, 350, 11600, 'm5600'],
    ]),
    ...family({ prefix: 'xeon-', name: 'Intel Xeon', brand: 'Intel', tags: ['workstation'], spec: { ...rd5, socket: 'LGA4677', platform: 'xeon-w-2400', memChannels: 4, memSpeed: 4800, maxMemGB: 2048, lanes: 64, pcieGen: 5, maxSockets: 1 } }, [
      ['w3-2423', 6, 0, 120, 359, 'm4400'], ['w3-2425', 6, 0, 130, 529, 'm4400'], ['w3-2435', 8, 0, 165, 669, 'm4400'], ['w5-2445', 10, 0, 175, 889],
      ['w5-2455X', 12, 0, 200, 1039], ['w5-2465X', 16, 0, 200, 1389], ['w7-2475X', 20, 0, 225, 1789], ['w7-2495X', 24, 0, 225, 2189],
    ]),
    ...family({ prefix: 'xeon-', name: 'Intel Xeon', brand: 'Intel', tags: ['workstation'], spec: { ...rd5, socket: 'LGA4677', platform: 'xeon-w-3400', memChannels: 8, memSpeed: 4800, maxMemGB: 4096, lanes: 112, pcieGen: 5, maxSockets: 1 } }, [
      ['w5-3425', 12, 0, 270, 1189], ['w5-3435X', 16, 0, 270, 1589], ['w7-3445', 20, 0, 270, 2189], ['w7-3455', 24, 0, 270, 2789],
      ['w7-3465X', 28, 0, 300, 3889], ['w9-3475X', 36, 0, 300, 4889], ['w9-3495X', 56, 0, 350, 5889],
    ]),
    ...family({ prefix: 'xeon-', name: 'Intel Xeon', brand: 'Intel', tags: ['workstation'], spec: { ...rd5, socket: 'LGA4677', platform: 'xeon-w-3500', memChannels: 8, memSpeed: 5600, maxMemGB: 4096, lanes: 112, pcieGen: 5, maxSockets: 1 } }, [
      ['w5-3525', 16, 0, 300, 1239], ['w5-3535X', 20, 0, 300, 1789], ['w7-3545', 24, 0, 300, 2389], ['w7-3565X', 32, 0, 335, 3789], ['w9-3575X', 44, 0, 340, 4989], ['w9-3595X', 60, 0, 385, 5889],
    ]),
    ...family({ prefix: 'xeon-', name: 'Intel Xeon', brand: 'Intel', tags: ['server'], spec: { memTypes: ['DDR5'], memModules: ['UDIMM'], ecc: true, igpu: false, socket: 'LGA1700', platform: 'xeon-e-2400', memChannels: 2, memSpeed: 4800, maxMemGB: 128, lanes: 16, pcieGen: 5, maxSockets: 1 } }, [
      ['E-2414', 4, 4, 55, 182], ['E-2434', 4, 0, 55, 226], ['E-2436', 6, 0, 65, 284], ['E-2456', 6, 0, 80, 364], ['E-2468', 8, 0, 65, 485], ['E-2478', 8, 0, 80, 519], ['E-2488', 8, 0, 95, 606],
    ]),
    ...family({ prefix: 'tr-', name: 'AMD Threadripper', brand: 'AMD', tags: ['workstation'], spec: { ...rd5, socket: 'sTR5', platform: 'tr-7000', memChannels: 4, memSpeed: 5200, maxMemGB: 1024, lanes: 88, pcieGen: 5, maxSockets: 1 } }, [
      ['7960X', 24, 0, 350, 1499], ['7970X', 32, 0, 350, 2499], ['7980X', 64, 0, 350, 4999],
    ]),
    ...family({ prefix: 'tr-', name: 'AMD Threadripper', brand: 'AMD', tags: ['workstation'], spec: { ...rd5, socket: 'sTR5', platform: 'tr-9000', memChannels: 4, memSpeed: 6400, maxMemGB: 1024, lanes: 88, pcieGen: 5, maxSockets: 1 } }, [
      ['9960X', 24, 0, 350, 1499], ['9970X', 32, 0, 350, 2499], ['9980X', 64, 0, 350, 4999],
    ]),
    ...family({ prefix: 'tr-pro-', name: 'AMD Threadripper PRO', brand: 'AMD', tags: ['workstation'], spec: { ...rd5, socket: 'sTR5', platform: 'tr-pro-7000', memChannels: 8, memSpeed: 5200, maxMemGB: 2048, lanes: 128, pcieGen: 5, maxSockets: 1 } }, [
      ['7945WX', 12, 0, 350, 1399], ['7955WX', 16, 0, 350, 1899], ['7965WX', 24, 0, 350, 2649], ['7975WX', 32, 0, 350, 3899], ['7985WX', 64, 0, 350, 7349], ['7995WX', 96, 0, 350, 9999],
    ]),
    ...family({ prefix: 'tr-pro-', name: 'AMD Threadripper PRO', brand: 'AMD', tags: ['workstation'], spec: { ...rd5, socket: 'sTR5', platform: 'tr-pro-9000', memChannels: 8, memSpeed: 6400, maxMemGB: 2048, lanes: 128, pcieGen: 5, maxSockets: 1 } }, [
      ['9955WX', 16, 0, 350, 1649], ['9965WX', 24, 0, 350, 2899], ['9975WX', 32, 0, 350, 4099], ['9985WX', 64, 0, 350, 7999], ['9995WX', 96, 0, 350, 11699],
    ]),
  ]);

  // More server and workstation boards
  const srv = (o) => Object.assign({ sockets: 1, memType: 'DDR5', memModules: ['RDIMM'], ecc: true, ocp: 0, bmc: true, bifurcation: true, chipsetLanes: 0, watts: 70, tags: ['server'] }, o);
  for (const b of parts) if (b.id === 'asus-w790e-sage') b.platforms = ['xeon-w-2400', 'xeon-w-3400', 'xeon-w-3500'];
  addNew('motherboard', [
    srv({ id: 'asrock-rack-genoad8x', name: 'ASRock Rack GENOAD8X-2T/BCM', brand: 'ASRock Rack', price: 899, socket: 'SP5', platforms: ['epyc-9004', 'epyc-9005'], chipset: 'SoC', formFactor: 'ATX', dimmSlots: 8, memChannels: 12, maxMemGB: 768,
      pcie: [slot(4, 16, 16, 5, 1), slot(1, 8, 8, 5, 1)], m2: [m2(2, 5, 1, ['2280', '22110'])], sata: 4, nvmePorts: 4, slotPositions: 7, eps8: 2 }),
    srv({ id: 'gigabyte-mz33-ar0', name: 'Gigabyte MZ33-AR0', brand: 'Gigabyte', price: 1299, socket: 'SP5', platforms: ['epyc-9004', 'epyc-9005'], chipset: 'SoC', formFactor: 'E-ATX', dimmSlots: 24, memChannels: 12, maxMemGB: 6144,
      pcie: [slot(4, 16, 16, 5, 1)], m2: [m2(1, 5, 1, ['2280', '22110'])], sata: 0, nvmePorts: 10, ocp: 1, slotPositions: 4, eps8: 2 }),
    srv({ id: 'asrock-rack-siena8d', name: 'ASRock Rack SIENAD8-2L2T', brand: 'ASRock Rack', price: 799, socket: 'SP6', platforms: ['epyc-8004'], chipset: 'SoC', formFactor: 'ATX', dimmSlots: 6, memChannels: 6, maxMemGB: 576,
      pcie: [slot(4, 16, 16, 5, 1), slot(1, 8, 8, 5, 1)], m2: [m2(2, 5, 1, ['2280', '22110'])], sata: 4, nvmePorts: 4, slotPositions: 7, eps8: 1, watts: 50 }),
    srv({ id: 'gigabyte-me33-ar0', name: 'Gigabyte ME33-AR0', brand: 'Gigabyte', price: 1049, socket: 'SP6', platforms: ['epyc-8004'], chipset: 'SoC', formFactor: 'E-ATX', dimmSlots: 12, memChannels: 6, maxMemGB: 1152,
      pcie: [slot(4, 16, 16, 5, 1), slot(1, 16, 8, 5, 1)], m2: [m2(2, 5, 1, ['2280', '22110'])], sata: 4, nvmePorts: 6, ocp: 1, slotPositions: 7, eps8: 1, watts: 55 }),
    srv({ id: 'sm-h12ssl-i', name: 'Supermicro H12SSL-i', brand: 'Supermicro', price: 649, socket: 'SP3', platforms: ['epyc-7003'], chipset: 'SoC', formFactor: 'ATX', memType: 'DDR4', memModules: ['RDIMM', 'LRDIMM'], dimmSlots: 8, memChannels: 8, maxMemGB: 2048,
      pcie: [slot(5, 16, 16, 4, 1), slot(2, 8, 8, 4, 1)], m2: [m2(2, 4, 1, ['2280', '22110'])], sata: 8, nvmePorts: 2, slotPositions: 7, eps8: 2, watts: 55 }),
    srv({ id: 'gigabyte-mz32-ar0', name: 'Gigabyte MZ32-AR0', brand: 'Gigabyte', price: 799, socket: 'SP3', platforms: ['epyc-7003'], chipset: 'SoC', formFactor: 'E-ATX', memType: 'DDR4', memModules: ['RDIMM', 'LRDIMM'], dimmSlots: 16, memChannels: 8, maxMemGB: 4096,
      pcie: [slot(4, 16, 16, 4, 1), slot(3, 8, 8, 4, 1)], m2: [m2(1, 4, 1, ['2280', '22110'])], sata: 4, nvmePorts: 4, slotPositions: 7, eps8: 2, watts: 60 }),
    srv({ id: 'sm-x13sei-f', name: 'Supermicro X13SEI-F', brand: 'Supermicro', price: 699, socket: 'LGA4677', platforms: ['xeon-sp-4', 'xeon-sp-5'], chipset: 'C741', formFactor: 'ATX', dimmSlots: 8, memChannels: 8, maxMemGB: 2048,
      pcie: [slot(4, 16, 16, 5, 1), slot(1, 8, 8, 5, 1)], m2: [m2(2, 3, 'pch', ['2280', '22110'])], sata: 10, nvmePorts: 2, slotPositions: 7, eps8: 2, chipsetLanes: 8 }),
    srv({ id: 'asus-z13pe-d16', name: 'ASUS Z13PE-D16', brand: 'ASUS', price: 1099, socket: 'LGA4677', platforms: ['xeon-sp-4', 'xeon-sp-5'], chipset: 'C741', formFactor: 'EEB', sockets: 2, dimmSlots: 16, memChannels: 8, maxMemGB: 4096,
      pcie: [slot(3, 16, 16, 5, 1), slot(3, 16, 16, 5, 2)], m2: [m2(2, 4, 'pch', ['2280', '22110'])], sata: 8, nvmePorts: 4, ocp: 1, slotPositions: 7, eps8: 4, chipsetLanes: 8, watts: 90 }),
    srv({ id: 'asus-w790-ace', name: 'ASUS Pro WS W790-ACE', brand: 'ASUS', price: 899, tags: ['workstation'], socket: 'LGA4677', platforms: ['xeon-w-2400', 'xeon-w-3400', 'xeon-w-3500'], chipset: 'W790', formFactor: 'CEB', dimmSlots: 8, memChannels: 8, maxMemGB: 2048,
      pcie: [slot(3, 16, 16, 5, 1), slot(2, 16, 8, 5, 1)], m2: [m2(1, 5, 1), m2(2, 4, 'pch')], sata: 4, nvmePorts: 0, slotPositions: 7, eps8: 2, chipsetLanes: 8 }),
    srv({ id: 'gigabyte-w790-ai-top', name: 'Gigabyte W790 AI TOP', brand: 'Gigabyte', price: 1099, tags: ['workstation'], socket: 'LGA4677', platforms: ['xeon-w-2400', 'xeon-w-3400', 'xeon-w-3500'], chipset: 'W790', formFactor: 'E-ATX', dimmSlots: 8, memChannels: 8, maxMemGB: 2048,
      pcie: [slot(4, 16, 16, 5, 1), slot(1, 16, 8, 5, 1)], m2: [m2(2, 5, 1), m2(2, 4, 'pch')], sata: 4, nvmePorts: 0, slotPositions: 7, eps8: 2, chipsetLanes: 8, bmc: false }),
    srv({ id: 'asrock-trx50-ws', name: 'ASRock TRX50 WS', brand: 'ASRock', price: 799, tags: ['workstation'], socket: 'sTR5', platforms: ['tr-7000', 'tr-9000', 'tr-pro-7000', 'tr-pro-9000'], chipset: 'TRX50', formFactor: 'E-ATX', dimmSlots: 4, memChannels: 4, maxMemGB: 1024,
      pcie: [slot(3, 16, 16, 5, 1), slot(1, 16, 16, 4, 1)], m2: [m2(2, 5, 1), m2(1, 4, 'pch')], sata: 4, nvmePorts: 0, slotPositions: 7, eps8: 2, chipsetLanes: 8, bmc: true }),
    srv({ id: 'asrock-wrx90-ws-evo', name: 'ASRock WRX90 WS EVO', brand: 'ASRock', price: 1199, tags: ['workstation'], socket: 'sTR5', platforms: ['tr-pro-7000', 'tr-pro-9000'], chipset: 'WRX90', formFactor: 'EEB', dimmSlots: 8, memChannels: 8, maxMemGB: 2048,
      pcie: [slot(7, 16, 16, 5, 1)], m2: [m2(4, 5, 1)], sata: 8, nvmePorts: 2, slotPositions: 7, eps8: 2, chipsetLanes: 8 }),
    srv({ id: 'sm-x13sae-f', name: 'Supermicro X13SAE-F', brand: 'Supermicro', price: 449, tags: ['server', 'workstation'], socket: 'LGA1700', platforms: ['core-12-14'], chipset: 'W680', formFactor: 'ATX', memModules: ['UDIMM'], dimmSlots: 4, memChannels: 2, maxMemGB: 128,
      pcie: [slot(1, 16, 16, 5, 1, 'cpu-x16'), slot(1, 16, 8, 5, 1, 'cpu-x16'), slot(1, 4, 4, 4, 'pch')], laneGroups: { 'cpu-x16': 16 }, m2: [m2(3, 4, 'pch')], sata: 8, nvmePorts: 0, slotPositions: 7, eps8: 1, chipsetLanes: 16, watts: 40 }),
    srv({ id: 'sm-h13sae-mf', name: 'Supermicro H13SAE-MF', brand: 'Supermicro', price: 399, socket: 'AM5', platforms: ['am5'], chipset: 'B650', formFactor: 'ATX', memModules: ['UDIMM'], dimmSlots: 4, memChannels: 2, maxMemGB: 192,
      pcie: [slot(1, 16, 16, 5, 1, 'cpu-x16'), slot(1, 16, 8, 5, 1, 'cpu-x16'), slot(1, 4, 4, 4, 'pch')], laneGroups: { 'cpu-x16': 16 }, m2: [m2(1, 5, 1, ['2280', '22110']), m2(1, 4, 'pch')], sata: 4, nvmePorts: 0, slotPositions: 7, eps8: 1, chipsetLanes: 8, watts: 40 }),
  ]);

  // Server memory (prices scale from ~$40/GB DDR5 RDIMM, Nov 2026)
  const mem = (id, name, brand, price, type, module, gb, speed, tags) => ({ id, name, brand, price, tags: tags || ['server', 'workstation'], type, module, ecc: true, gb, sticks: 1, speed });
  addNew('memory', [
    mem('samsung-ddr5-4800-16-rdimm', 'Samsung DDR5-4800 16 GB RDIMM', 'Samsung', 620, 'DDR5', 'RDIMM', 16, 4800),
    mem('micron-ddr5-5600-48-rdimm', 'Micron DDR5-5600 48 GB RDIMM', 'Micron', 1950, 'DDR5', 'RDIMM', 48, 5600),
    mem('kingston-ddr5-6400-64-rdimm', 'Kingston Server Premier DDR5-6400 64 GB RDIMM', 'Kingston', 2700, 'DDR5', 'RDIMM', 64, 6400),
    mem('samsung-ddr5-5600-128-rdimm', 'Samsung DDR5-5600 128 GB RDIMM (3DS)', 'Samsung', 5600, 'DDR5', 'RDIMM', 128, 5600),
    mem('kingston-ddr5-5600-16-ecc', 'Kingston Server Premier DDR5-5600 16 GB ECC UDIMM', 'Kingston', 340, 'DDR5', 'UDIMM', 16, 5600),
    mem('kingston-ddr5-5600-48-ecc', 'Kingston Server Premier DDR5-5600 48 GB ECC UDIMM', 'Kingston', 1000, 'DDR5', 'UDIMM', 48, 5600),
    mem('samsung-ddr4-3200-16-rdimm', 'Samsung DDR4-3200 16 GB RDIMM', 'Samsung', 160, 'DDR4', 'RDIMM', 16, 3200, ['server']),
    mem('samsung-ddr4-3200-64-rdimm', 'Samsung DDR4-3200 64 GB RDIMM', 'Samsung', 640, 'DDR4', 'RDIMM', 64, 3200, ['server']),
    mem('samsung-ddr4-3200-128-lrdimm', 'Samsung DDR4-3200 128 GB LRDIMM', 'Samsung', 1300, 'DDR4', 'LRDIMM', 128, 3200, ['server']),
  ]);

  // Workstation and datacenter GPUs
  const pro = (id, name, price, vramGB, gen, widthSlots, lengthMm, powerW, conn, cooling, lowProfile, tags) =>
    ({ id, name, brand: name.split(' ')[0], price, tags: tags || ['workstation'], vramGB, gen, lanes: 16, size: 16, widthSlots, lengthMm, powerW, conn, cooling, lowProfile });
  addNew('gpu', [
    pro('rtx-a2000-12gb', 'NVIDIA RTX A2000 12GB', 650, 12, 4, 2, 168, 70, {}, 'blower', true, ['workstation', 'server']),
    pro('rtx-2000-ada', 'NVIDIA RTX 2000 Ada', 800, 16, 4, 2, 168, 70, {}, 'blower', true, ['workstation', 'server']),
    pro('rtx-4000-ada', 'NVIDIA RTX 4000 Ada', 1500, 20, 4, 1, 241, 130, { pcie8: 1 }, 'blower', false),
    pro('rtx-4500-ada', 'NVIDIA RTX 4500 Ada', 2600, 24, 4, 2, 267, 210, { pcie8: 1 }, 'blower', false),
    pro('rtx-5000-ada', 'NVIDIA RTX 5000 Ada', 4600, 32, 4, 2, 267, 250, { h12v: 1 }, 'blower', false),
    pro('rtx-pro-4000', 'NVIDIA RTX PRO 4000 Blackwell', 1800, 24, 5, 1, 241, 140, { h12v: 1 }, 'blower', false),
    pro('rtx-pro-4500', 'NVIDIA RTX PRO 4500 Blackwell', 3000, 32, 5, 2, 267, 200, { h12v: 1 }, 'blower', false),
    pro('rtx-pro-5000', 'NVIDIA RTX PRO 5000 Blackwell', 5500, 48, 5, 2, 267, 300, { h12v: 1 }, 'blower', false),
    pro('rtx-pro-6000-server', 'NVIDIA RTX PRO 6000 Blackwell Server Edition', 16500, 96, 5, 2, 267, 600, { h12v: 1 }, 'passive', false, ['server']),
    pro('nvidia-a100-80g', 'NVIDIA A100 80GB PCIe', 15000, 80, 4, 2, 267, 300, { pcie8: 1 }, 'passive', false, ['server']),
    pro('nvidia-h200-nvl', 'NVIDIA H200 NVL', 32000, 141, 5, 2, 267, 600, { h12v: 1 }, 'passive', false, ['server']),
  ]);

  // Controllers, NICs, enterprise drives
  addNew('controller', [
    { id: 'broadcom-9600-16i', name: 'Broadcom HBA 9600-16i (tri-mode, Gen5)', brand: 'Broadcom', price: 900, tags: ['server'], kind: 'HBA', gen: 5, lanes: 8, size: 8, sasPorts: 16, nvmePorts: 4, watts: 12, widthSlots: 1, lowProfile: true },
    { id: 'broadcom-9600-24i', name: 'Broadcom HBA 9600-24i (tri-mode, Gen5)', brand: 'Broadcom', price: 1300, tags: ['server'], kind: 'HBA', gen: 5, lanes: 8, size: 8, sasPorts: 24, nvmePorts: 6, watts: 15, widthSlots: 1, lowProfile: false },
    { id: 'broadcom-9670w-16i', name: 'Broadcom MegaRAID 9670W-16i', brand: 'Broadcom', price: 1700, tags: ['server'], kind: 'RAID', gen: 5, lanes: 16, size: 16, sasPorts: 16, nvmePorts: 4, watts: 25, widthSlots: 1, lowProfile: false },
  ]);
  addNew('nic', [
    { id: 'cx5-25g', name: 'NVIDIA ConnectX-5 2×25G', brand: 'NVIDIA', price: 450, tags: ['server', 'workstation'], form: 'pcie', speedG: 25, ports: 2, gen: 3, lanes: 8, size: 8, watts: 12, widthSlots: 1, lowProfile: true },
    { id: 'intel-e810-cqda2', name: 'Intel E810-CQDA2 2×100G', brand: 'Intel', price: 900, tags: ['server'], form: 'pcie', speedG: 100, ports: 2, gen: 4, lanes: 16, size: 16, watts: 20, widthSlots: 1, lowProfile: true },
    { id: 'broadcom-57414-ocp3', name: 'Broadcom BCM57414 2×25G (OCP 3.0)', brand: 'Broadcom', price: 350, tags: ['server'], form: 'ocp3', speedG: 25, ports: 2, gen: 3, lanes: 8, size: 8, watts: 10, widthSlots: 0, lowProfile: true },
    { id: 'cx7-ocp3-200g', name: 'NVIDIA ConnectX-7 2×200G (OCP 3.0)', brand: 'NVIDIA', price: 2400, tags: ['server'], form: 'ocp3', speedG: 200, ports: 2, gen: 5, lanes: 16, size: 16, watts: 25, widthSlots: 0, lowProfile: true },
  ]);
  const drv = (id, name, brand, price, iface, form, gen, tb, watts, media) => ({ id, name, brand, price, tags: ['server'], iface, form, gen, tb, watts, media });
  addNew('storage', [
    drv('micron-9550-7.68', 'Micron 9550 PRO 7.68 TB U.2 (Gen5)', 'Micron', 2100, 'u2', '2.5"', 5, 7.68, 25, 'SSD'),
    drv('kioxia-cd8p-7.68', 'Kioxia CD8P-R 7.68 TB U.2 (Gen5)', 'Kioxia', 1700, 'u2', '2.5"', 5, 7.68, 24, 'SSD'),
    drv('solidigm-p5336-30.72', 'Solidigm D5-P5336 30.72 TB U.2 (QLC)', 'Solidigm', 5500, 'u2', '2.5"', 4, 30.72, 25, 'SSD'),
    drv('samsung-pm1743-7.68-e3s', 'Samsung PM1743 7.68 TB E3.S (Gen5)', 'Samsung', 2000, 'e3s', 'E3.S', 5, 7.68, 25, 'SSD'),
    drv('micron-7500-3.84-u3', 'Micron 7500 PRO 3.84 TB U.3', 'Micron', 700, 'u3', '2.5"', 4, 3.84, 15, 'SSD'),
    drv('wd-hc560-20tb', 'WD Ultrastar DC HC560 20 TB SATA', 'WD', 400, 'sata', '3.5"', 0, 20, 9, 'HDD'),
    drv('wd-hc580-24tb-sas', 'WD Ultrastar DC HC580 24 TB SAS', 'WD', 480, 'sas', '3.5"', 0, 24, 10, 'HDD'),
    drv('seagate-exos-x24-24tb-sata', 'Seagate Exos X24 24 TB SATA', 'Seagate', 440, 'sata', '3.5"', 0, 24, 10, 'HDD'),
  ]);

  // Chassis, PSUs, coolers
  addNew('case', [
    { id: 'sm-cse-847', name: 'Supermicro CSE-847 (4U, 36× 3.5" hot-swap)', brand: 'Supermicro', price: 2400, tags: ['server'], kind: 'rack', ru: 4, boards: ['ATX', 'E-ATX', 'EEB'], psuForms: ['Server module'], gpuMaxMm: 170, coolerMaxMm: 64, radMm: 0, slots: 7, lowProfileOnly: true, airflow: 'server', bays: { '3.5': 36 } },
    { id: 'sm-cse-836', name: 'Supermicro CSE-836 (3U, 16× 3.5" hot-swap)', brand: 'Supermicro', price: 1300, tags: ['server'], kind: 'rack', ru: 3, boards: ['ATX', 'E-ATX', 'EEB'], psuForms: ['Server module'], gpuMaxMm: 280, coolerMaxMm: 100, radMm: 0, slots: 7, airflow: 'server', bays: { '3.5': 16 } },
    { id: 'silverstone-rm43-320', name: 'SilverStone RM43-320-RS (4U, 20× 3.5" hot-swap)', brand: 'SilverStone', price: 649, tags: ['server'], kind: 'rack', ru: 4, boards: ['mATX', 'ATX', 'CEB', 'E-ATX', 'EEB'], psuForms: ['ATX'], gpuMaxMm: 280, coolerMaxMm: 145, radMm: 0, slots: 7, airflow: 'server', bays: { '3.5': 20 } },
    { id: 'rosewill-rsv-l4500u', name: 'Rosewill RSV-L4500U (4U, 15× 3.5")', brand: 'Rosewill', price: 199, tags: ['server'], kind: 'rack', ru: 4, boards: ['mATX', 'ATX', 'E-ATX'], psuForms: ['ATX'], gpuMaxMm: 300, coolerMaxMm: 160, radMm: 0, slots: 7, airflow: 'server', bays: { '3.5': 15 } },
    { id: 'sliger-cx4170a', name: 'Sliger CX4170a (4U, long GPU)', brand: 'Sliger', price: 299, tags: ['server', 'workstation'], kind: 'rack', ru: 4, boards: ['mATX', 'ATX', 'CEB', 'E-ATX'], psuForms: ['ATX'], gpuMaxMm: 360, coolerMaxMm: 160, radMm: 360, slots: 8, airflow: 'server', bays: { '3.5': 2, '2.5': 4 } },
  ]);
  addNew('psu', [
    { id: 'corsair-ax1600i', name: 'Corsair AX1600i', brand: 'Corsair', price: 599, tags: ['workstation'], form: 'ATX', watts: 1600, efficiency: 'Titanium', redundant: false, conn: { eps8: 2, pcie8: 10, h12v: 0 } },
    { id: 'bequiet-dpp13-1600', name: 'be quiet! Dark Power Pro 13 1600 W', brand: 'be quiet!', price: 549, tags: ['workstation'], form: 'ATX', watts: 1600, efficiency: 'Titanium', redundant: false, conn: { eps8: 3, pcie8: 6, h12v: 2 } },
    { id: 'sm-pws-1k30d', name: 'Supermicro PWS-1K30D-1R 1300 W module', brand: 'Supermicro', price: 300, tags: ['server'], form: 'Server module', watts: 1300, efficiency: 'Titanium', redundant: true, conn: null },
  ]);
  addNew('cooler', [
    { id: 'noctua-u14s-tr4-sp3', name: 'Noctua NH-U14S TR4-SP3', brand: 'Noctua', price: 89, tags: ['server', 'workstation'], type: 'air', sockets: ['SP3', 'TR4'], heightMm: 165, ratedW: 280 },
    { id: 'noctua-d9-tr5-sp6', name: 'Noctua NH-D9 TR5-SP6 4U', brand: 'Noctua', price: 119, tags: ['server', 'workstation'], type: 'air', sockets: ['sTR5', 'SP6'], heightMm: 126, ratedW: 300 },
    { id: 'noctua-d9-dx-4677', name: 'Noctua NH-D9 DX-4677 4U', brand: 'Noctua', price: 119, tags: ['server', 'workstation'], type: 'air', sockets: ['LGA4677'], heightMm: 126, ratedW: 270 },
    { id: 'noctua-u12s-dx-4677', name: 'Noctua NH-U12S DX-4677', brand: 'Noctua', price: 109, tags: ['server', 'workstation'], type: 'air', sockets: ['LGA4677'], heightMm: 158, ratedW: 250 },
    { id: 'passive-2u-sp6', name: '2U passive heatsink (SP6)', brand: 'Generic', price: 70, tags: ['server'], type: 'passive', sockets: ['SP6', 'sTR5'], heightMm: 64, ratedW: 225 },
    { id: 'passive-2u-sp3', name: '2U passive heatsink (SP3)', brand: 'Generic', price: 60, tags: ['server'], type: 'passive', sockets: ['SP3'], heightMm: 64, ratedW: 280 },
    { id: 'passive-1u-sp3', name: '1U passive heatsink (SP3)', brand: 'Generic', price: 50, tags: ['server'], type: 'passive', sockets: ['SP3'], heightMm: 27, ratedW: 200 },
    { id: 'active-4u-lga1700', name: '4U active heatsink (LGA1700/AM5)', brand: 'Generic', price: 45, tags: ['server'], type: 'air', sockets: ['LGA1700', 'AM5', 'AM4'], heightMm: 120, ratedW: 150 },
  ]);

  // ---------- Street prices ----------
  // Lowest US street prices seen in trackers (Tom's Hardware, PC Gamer, Capital & Compute,
  // BasketPrice, Newegg/Amazon listings) in late November 2026. Parts not listed here keep
  // an estimate and are flagged in the UI.
  const PRICES_AS_OF = '2026-11-26';
  const street = {
    'rtx-5090-fe': 6919, 'rtx-5080-fe': 1999, 'asus-prime-rtx-5070': 899, 'sapphire-9070xt-pulse': 919, 'intel-arc-b580': 329,
    'rtx-pro-6000-ws': 16399,
    'r5-9600x': 169, 'r7-9800x3d': 399, 'r9-9950x': 489, 'cu9-285k': 399, 'i5-14600k': 249,
    'corsair-ddr5-6000-2x16': 470, 'samsung-ddr5-4800-32-rdimm': 1012, 'samsung-ddr5-5600-64-rdimm': 2561, 'micron-ddr5-6400-96-rdimm': 3900,
    'samsung-990-pro-2tb': 409, 'wd-sn850x-4tb': 789, 'crucial-t705-2tb': 399,
  };
  // Estimates for parts no tracker listed, scaled from the memory and GPU shortage pricing above.
  const estimate = {
    'rtx-pro-6000-maxq': 16000, 'gskill-ddr5-6400-2x32': 1190, 'crucial-ddr5-5600-2x48': 1860, 'kingston-ddr4-3200-2x16': 220,
    'kingston-ddr5-4800-32-ecc': 680, 'vcolor-ddr5-6000-4x32-rdimm': 4300, 'samsung-ddr4-3200-32-rdimm': 320, 'samsung-ddr4-3200-64-lrdimm': 640,
    'samsung-870-evo-2tb': 349, 'rtx-4060': 399,
  };
  for (const p of parts) {
    if (street[p.id] != null) { p.price = street[p.id]; p.priceChecked = true; }
    else if (estimate[p.id] != null) p.price = estimate[p.id];
  }

  const presets = [
    { key: 'gaming', name: 'Gaming tower', items: [
      { id: 'r7-9800x3d', qty: 1 }, { id: 'msi-b650-tomahawk', qty: 1 }, { id: 'corsair-ddr5-6000-2x16', qty: 1 }, { id: 'rtx-5080-fe', qty: 1 },
      { id: 'samsung-990-pro-2tb', qty: 1 }, { id: 'corsair-rm850x', qty: 1 }, { id: 'fractal-north', qty: 1 }, { id: 'thermalright-pa120se', qty: 1 } ] },
    { key: 'ai-workstation', name: 'Threadripper PRO AI workstation', items: [
      { id: 'tr-pro-7975wx', qty: 1 }, { id: 'asus-wrx90e-sage', qty: 1 }, { id: 'samsung-ddr5-5600-64-rdimm', qty: 8 }, { id: 'rtx-pro-6000-maxq', qty: 2 },
      { id: 'crucial-t705-2tb', qty: 2 }, { id: 'cx6-dx-100g', qty: 1 }, { id: 'seasonic-prime-tx-1600', qty: 1 }, { id: 'fractal-define-7-xl', qty: 1 }, { id: 'noctua-u14s-tr5-sp6', qty: 1 } ] },
    { key: 'nvme-server', name: '2U EPYC NVMe server', items: [
      { id: 'epyc-9354p', qty: 1 }, { id: 'sm-h13ssl-n', qty: 1 }, { id: 'samsung-ddr5-4800-32-rdimm', qty: 12 }, { id: 'micron-7450-pro-3.84', qty: 8 },
      { id: 'broadcom-9500-16i', qty: 1 }, { id: 'cx6-dx-100g', qty: 1 }, { id: 'sm-pws-2k08a', qty: 2 }, { id: 'sm-cse-216-nvme', qty: 1 }, { id: 'passive-2u-sp5', qty: 1 } ] },
    { key: 'xeon-nas', name: 'Dual Xeon 4U storage box', items: [
      { id: 'xeon-gold-6430', qty: 2 }, { id: 'sm-x13dei', qty: 1 }, { id: 'samsung-ddr5-4800-32-rdimm', qty: 16 }, { id: 'seagate-exos-x24-24tb-sas', qty: 12 },
      { id: 'samsung-pm9a3-1.92-m2', qty: 2 }, { id: 'broadcom-9500-16i', qty: 1 }, { id: 'intel-x710-da2', qty: 1 }, { id: 'sm-pws-1k62a', qty: 2 }, { id: 'sm-cse-846', qty: 1 }, { id: 'passive-2u-4677', qty: 2 } ] },
    { key: 'broken', name: 'Broken on purpose', items: [
      { id: 'cu9-285k', qty: 1 }, { id: 'asus-strix-b650e-i', qty: 1 }, { id: 'samsung-ddr4-3200-32-rdimm', qty: 4 }, { id: 'rtx-5090-fe', qty: 1 },
      { id: 'seagate-exos-x24-24tb-sas', qty: 2 }, { id: 'corsair-sf750', qty: 1 }, { id: 'cm-nr200p', qty: 1 }, { id: 'noctua-nh-d15-g2', qty: 1 } ] },
  ];

  // Merge bulk-imported parts (src/catalog.imported.json). Hand-curated parts win on name clashes.
  const norm = (n) => n.toLowerCase().replace(/[^a-z0-9]/g, '');
  function mergeImported(list) {
    const names = new Set(parts.map((p) => norm(p.name)));
    const ids = new Set(parts.map((p) => p.id));
    let added = 0;
    for (const p of list || []) {
      if (ids.has(p.id) || names.has(norm(p.name))) continue;
      ids.add(p.id); names.add(norm(p.name)); parts.push(p); added++;
    }
    return added;
  }
  if (typeof module !== 'undefined' && module.exports) {
    try { mergeImported(require('./catalog.imported.json')); } catch (e) { /* no import yet */ }
  }

  const api = { parts, presets, pricesAsOf: PRICES_AS_OF, mergeImported };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SLOTWISE_CATALOG = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
