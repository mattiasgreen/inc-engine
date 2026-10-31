# Declarative Progressive Disclosure in the Functional Core

To keep the interface uncluttered for new players and prevent spoiling future **Upgrades**, **Generators**, and prestige **Layers**, progressive disclosure (**Visibility State**) is computed purely inside the functional engine (`getDerivedStats`) from declarative `GameConfig` rules rather than through conditional logic in the UI.

1. **Engine-Projected Visibility States**: For every Layer, Generator, and Upgrade, the engine derives a canonical Visibility State (`'hidden' | 'locked' | 'visible'`). The UI shell renders elements strictly by binding DOM visibility to this derived state without game-specific conditionals.
2. **Convention Defaults with `revealWhen` Overrides**: When no explicit `revealWhen` predicate is declared in `GameConfig`, the engine applies convention-over-configuration defaults:
   - **Generator $i$**: `'hidden'` until Generator $i-1$ has `owned >= 1` (Generator 1 starts `'visible'`).
   - **Upgrade**: `'hidden'` until all DAG `prerequisites` are met and the Layer's currency reaches $50\%$ of `baseCost` (or `level > 0`).
   - **Prestige Layer**: `'hidden'` until the target Layer reaches $10\%$ of `prestige.thresholdCurrency` (or the prestige Layer has `totalLifetimeCurrency > 0`).
3. **Run vs Lifetime Reveal Scope**: Prestige Layers default to `'lifetime'` scope (once revealed via `totalLifetimeCurrency`, they remain permanently `'visible'` across prestige resets), while Layer-internal Generators and Upgrades default to `'run'` scope (configurable via `revealScope: 'run' | 'lifetime'`).
