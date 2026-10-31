# Universal DAG Upgrade Tree and Dynamic Scaling Effects

We model `upgrades` in every **Layer** of `GameConfig` as a Directed Acyclic Graph (**Upgrade Tree**) supporting prerequisite nodes, mutually exclusive branches, and state-scaled effects that keep pace with polynomial **Metagenerator** cascades.

1. **Unified DAG Schema**: Any `Upgrade` in any Layer may specify `prerequisites` (requiring minimum levels in parent Upgrades, with `requiresAny` or `requiresAll` semantics) and `exclusiveWith` (locking sibling branches when purchased). Flat upgrade lists are simply DAGs with zero prerequisites.
2. **Three Effect Categories**: To prevent upgrades from becoming obsolete against $O(t^k)$ polynomial cascades, the engine evaluates:
   - **Parametric Modifiers**: Multiplicative or additive changes to `cycleFrequency`, `tickYield`, `costScaling`, specific Generators, or a Layer's manual `bought` synergy multiplier.
   - **State-Scaled Dynamic Multipliers**: Declarative formulas scaling off live state (such as $\log_{10}(\text{totalTicks})$ or $\log_{10}(\text{currency})$).
   - **Structural Unlocks**: Gating Generators (`unlockGenerator`) behind Upgrade Tree nodes.
3. **Net-Positive Prestige Economy**: Simulator policies (`OptimalRoiPolicy`, `GreedyPolicy`) evaluate prerequisite availability and net post-purchase throughput delta (accounting for any unspent prestige currency opportunity cost) before purchasing tree nodes.
