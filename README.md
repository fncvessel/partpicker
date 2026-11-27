# Slotwise

A PC build planner that covers consumer, workstation and server hardware, with a rules-based compatibility checker.

- `src/catalog.js` – seed parts catalog and starter builds (specs simplified, prices rough USD)
- `src/engine.js` – compatibility engine: `evaluate(build, parts)` returns issues (error / warn / info) and stats (power, PCIe slots and lanes, memory, storage)
- `src/app.js`, `src/page.html`, `src/styles.css` – the UI (no framework, no dependencies)
- `node build.js` bundles everything into `dist/index.html`
- `node --test test/engine.test.js` runs the engine tests

## What the engine checks
Socket and chipset/platform support (e.g. Xeon Scalable on a W790 board), CPU count vs sockets and 1P-only parts,
memory generation, UDIMM/RDIMM/LRDIMM, ECC, slots, capacity, channel population, PCIe slot assignment with
lane sharing (x8/x8), chipset slots, bifurcation adapters, OCP 3.0, M.2 / SATA / SAS / U.2 / U.3 / E1.S / E3.S
connectivity through board ports and HBAs, drive bays, power budget with N+1 redundant modules, PSU cables
(EPS, 8-pin, 12V-2x6), PSU form factor, case fit (board, GPU length, cooler height, radiators, low-profile only),
passive cards and heatsinks needing server airflow, and display output (iGPU or BMC).
