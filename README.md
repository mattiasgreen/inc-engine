# inc-engine

A theme-agnostic, zero-dependency, pure ES6 incremental and idle game engine.

## Overview

`inc-engine` is built around a Functional Core and Imperative Shell architecture with:
- **Zero NPM / Pure ES6 Modules**: Runs directly in modern browsers without compilation, bundlers, or `package.json`.
- **Dual-Level Clock**: Elapsed wall-clock time fires **Cycles** (at an upgradable frequency), emitting **Ticks** (at an upgradable yield per Cycle) that drive all **Generator** production.
- **Data-Driven `GameConfig`**: 100% declarative definitions for Layers, Currencies, Generators, Upgrades, clock settings, and Prestige formulas.
- **Custom `BigNum`**: Immutable `{ m, e }` mantissa-exponent math supporting numbers up to $10^{9 \times 10^{15}}$.
- **Three-Mode Simulation**:
  - Analytical $O(1)$ integration for Reducible Transitions.
  - Piecewise event-skipping jumps for active Policy simulation.
  - Chunked stepping for Irreducible Transitions.
- **Persistence & Offline Progression**: Abstract `ClockPort` and `StoragePort` with automated offline catch-up reports.
- **In-Browser Test Runner**: Full unit and pacing test suite at `/test.html` runnable in any browser and headless automation.

## Project Structure

```text
inc-engine/
├── index.html                 # Minimalist engine UI and Simulation Sandbox
├── test.html                  # In-browser test runner
├── GLOSSARY.md                # Domain language glossary
├── CLAUDE.md                  # Project instructions and standards
├── docs/
│   ├── adr/                   # Architecture Decision Records
│   └── agents/                # Issue tracker and domain docs config
├── src/
│   ├── engine/
│   │   ├── bignum.js          # Immutable BigNum value object
│   │   ├── config.js          # GameConfig schema & default config
│   │   ├── core.js            # Pure functional engine state transitions
│   │   ├── simulator.js       # Analytical, event-skipping, and chunked simulator
│   │   └── policies.js        # Pluggable simulation policies
│   ├── session/
│   │   ├── ports.js           # ClockPort & StoragePort abstractions
│   │   └── session.js         # GameSession coordinator (imperative shell)
│   └── ui/
│       └── app.js             # Minimalist UI controller & dev sandbox
└── test/
    ├── runner.js              # Pure ES6 test harness (works in browser & node)
    ├── bignum.test.js         # BigNum unit tests
    ├── engine.test.js         # Engine & core progression tests
    ├── session.test.js        # Persistence, ports & offline report tests
    └── pacing.test.js         # Progression pacing & simulation tests
```

## Running the Project

Serve the repository with any static web server:
```bash
python -m http.server 8000
```
- Open `http://localhost:8000/` for the game and dev sandbox.
- Open `http://localhost:8000/test.html` for the test suite.
