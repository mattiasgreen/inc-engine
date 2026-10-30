# Inc-Engine

Pure ES6 incremental and idle game engine. Zero `npm`, zero `package.json`, zero bundlers or compilation steps.

## Standards

- Never introduce `package.json`, `node_modules`, or `npm` commands. See [ADR 0001](./docs/adr/0001-zero-npm-pure-es6.md).
- Keep the engine and simulator in a pure Functional Core (`src/engine/`), decoupled from browser globals (`window`, `localStorage`, `Date.now()`) via `ClockPort` and `StoragePort`. See [ADR 0002](./docs/adr/0002-reducible-and-irreducible-simulation.md).
- Use the canonical domain vocabulary defined in [`GLOSSARY.md`](./GLOSSARY.md).
- No em-dashes anywhere in this repo's prose or comments. Rewrite with a comma, colon, period, parentheses, or conjunction.

## Agent skills

### Issue tracker

GitHub Issues on `mattiasgreen/inc-engine`. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical names, unchanged (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context (`GLOSSARY.md` and `docs/adr/` at the repo root). See `docs/agents/domain.md`.
