# Reducible and Irreducible Simulation Modes

We model time advancement in `inc-engine` around the distinction between **Reducible Transitions** (analytically integrable in $O(1)$) and **Irreducible Transitions** (requiring discrete stepping), wrapped in a Functional Core / Imperative Shell architecture.

1. **Analytical Integration ($O(1)$)**: When passive state advancement has constant or closed-form polynomial production rates per Tick, the engine integrates currency and Generator gains directly across $\Delta \text{Ticks}$ in a single calculation.
2. **Piecewise Event-Skipping**: When the Simulator runs an active **Policy**, progression is reducible between discrete events (such as the next affordable purchase or Layer reset threshold). The Simulator computes the Ticks until the next event, jumps analytically to that boundary, applies the purchase, and repeats.
3. **Chunked Stepping**: When a mechanic is marked irreducible (for example, production rates that depend non-linearly on current unspent currency every Tick), the engine subdivides $\Delta \text{Ticks}$ into bounded slices to balance simulation speed and accuracy.

We start by prototyping and verifying the reducible and piecewise event-skipping modes first, while keeping the engine interface ready for irreducible mechanics.
