# Inc-Engine

A theme-agnostic, pure ES6 incremental and idle game engine driven by cycles, ticks, multi-layer prestige, and deterministic simulation.

## Language

### Time and Progression

**Cycle**:
A single firing of the engine's clock driven by elapsed wall-clock time. The Cycle frequency (how many Cycles occur per wall-clock second) can be modified by Upgrades.
_Avoid_: Frame, Heartbeat, Step, Real-time tick

**Tick**:
The fundamental unit of in-game progression emitted each time a Cycle fires. Each Cycle yields a configurable number of Ticks (Tick Yield, which can also be modified by Upgrades), and all Generator production is calculated per Tick.
_Avoid_: Game frame, Update, Point

### Domain Model

**GameConfig**:
A declarative, theme-agnostic definition of a game's Layers, Currencies, Generators, Upgrades, clock parameters, and prestige formulas passed into the engine.
_Avoid_: Theme, Skin, Ruleset, Manifest

**Layer**:
A discrete stage in the prestige hierarchy (Layer 0 is the core game, Layer 1 is the first prestige stage, and so on). Resetting a Layer clears its state in exchange for currency in the next higher Layer.
_Avoid_: Level, Stage, World, Realm

**Generator**:
A repeatable purchase within a Layer that produces a currency (or another Generator) per Tick.
_Avoid_: Building, Producer, Unit, Facility

**Metagenerator**:
A Generator whose output per Tick is another Generator rather than a currency, forming a cascading polynomial chain (or, if cyclic, an exponential feedback loop).
_Avoid_: Spawner, Factory, Sub-generator, Producer tier

**Upgrade**:
A node within a Layer's Upgrade Tree that modifies production multipliers, cost scaling, Cycle frequency, Tick yield, purchase synergy, or unlocks Generators and Layer mechanics.
_Avoid_: Perk, Talent, Boost, Research

**Upgrade Tree**:
A directed acyclic graph (DAG) of Upgrades within a Layer where nodes can declare prerequisite Upgrade levels and mutually exclusive branches.
_Avoid_: Skill tree, Talent tree, Tech tree, Perk grid

**Visibility State**:
The progressive-disclosure status of a Layer, Generator, or Upgrade (`hidden`, `locked`, or `visible`) derived by the engine from declarative conditions in the GameConfig.
_Avoid_: UI toggle, Show flag, Spoiler flag

### Simulation and Persistence

**Reducible Transition**:
A span of Ticks across which production rates are invariant (or follow a closed-form polynomial chain), allowing the engine to compute the resulting state analytically in $O(1)$ without stepping Tick by Tick.
_Avoid_: Fast jump, Instant calc

**Irreducible Transition**:
A span of Ticks where state feedback or dynamic rules prevent closed-form integration, requiring the engine to advance in bounded discrete chunks.
_Avoid_: Slow mode, Step loop

**Policy**:
A pluggable decision-making strategy used by the Simulator to decide when to buy Generators, purchase Upgrades, or trigger a Layer reset during a simulated run.
_Avoid_: Bot, AI, Script, Auto-buyer

**Simulator**:
The subsystem that advances the engine forward, either passively over elapsed time or actively using a Policy, to jump to future states and verify progression pacing.
_Avoid_: Emulator, Fast-forwarder

**OfflineReport**:
A summary produced when advancing the engine across elapsed offline wall-clock time, recording elapsed duration, Cycles fired, Ticks generated, and currency gains.
_Avoid_: Catchup summary, Welcome back data

**ClockPort**:
The boundary interface supplying current wall-clock time (`nowMs()`) to the imperative session shell, implemented by `SystemClock` in the browser and `ManualClock` in tests.
_Avoid_: Timer, TimeProvider

**StoragePort**:
The boundary interface for reading and writing serialized game state in the imperative session shell, implemented by `BrowserStorage` (`localStorage`) and `MemoryStorage` in tests.
_Avoid_: SaveManager, Database
