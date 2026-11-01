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

**Cycle Phase**:
The normalized progress fraction within a Generator's integer-Tick production period. It drives progress animations deterministically from engine time without coupling to browser frame rates.
_Avoid_: Animation timer, Frame counter, Bar percent

### Domain Model

**GameConfig**:
A declarative definition of a game's Layers, Currencies, Generators, Upgrades, clock parameters, prestige formulas, and optional presentation metadata (lore, character guide, inline SVG artwork, and palette variables). The functional core evaluates the mechanical fields while the UI shell binds to the presentation fields.
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

**Milestone Tier**:
A discrete rarity and efficiency rank (`m0` Common, `m1` Uncommon, `m2` Rare, `m3` Epic, `m4` Legendary) unlocked when an entity reaches specific threshold counts or levels, multiplying output and advancing its visual tier.
_Avoid_: Rank, Star level, Mastery, Evolution

**Overdrive State**:
The continuous-flow presentation mode a Generator enters when its effective production cycle runs at or faster than 1 Hz, replacing discrete progress bar filling with a continuous energy shimmer animation and FLOWING status.
_Avoid_: Fast mode, Flicker guard, Max speed bar, Frozen bar

**Fidelity Mode**:
The user-configurable rendering profile (`Full`, `Eco`, `Minimal`, plus individual animation toggles) that governs visual effects and frame rate independently of engine simulation speed.
_Avoid_: Graphics quality, Performance hack, Low-res mode

**Smoked-Glass Scrim**:
A dark translucent surface (`rgba(0, 0, 0, 0.60)` with crisp white `#ffffff` text and subtle blur) that guarantees contrast-independent legibility for interactive controls and typography placed over arbitrary full-bleed artwork or dark card surfaces.
_Avoid_: Solid button fill, Neon block button, Transparent overlay

**Atmospheric Profile**:
The set of declarative presentation tokens in a `GameConfig.palette` (surface luminance ratios, accent saturation bounds, edge vignettes, ambient filters, and typographic texture) that evoke a genre's mood through generic CSS custom properties without game-specific UI code.
_Avoid_: Hardcoded theme CSS, Game-specific stylesheet, High-contrast neon skin

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

**Semi-Optimal Policy**:
A decision strategy modeling realistic human behavior, combining value-based upgrade selection with decision hesitation, occasional bulk generator purchases, and offline breaks.
_Avoid_: Dumb bot, Random agent, Sloppy policy

**Simulator**:
The subsystem that advances the engine forward, either passively over elapsed time or actively using a Policy, to jump to future states and verify progression pacing.
_Avoid_: Emulator, Fast-forwarder

**OfflineReport**:
A summary produced when advancing the engine across elapsed offline wall-clock time, recording elapsed duration, Cycles fired, Ticks generated, and currency gains.
_Avoid_: Catchup summary, Welcome back data

**Offline Progress**:
The discrete advancement of Cycles, Ticks, and Generator production across elapsed wall-clock time between the last active session timestamp and current resumption, capped at a bounded maximum duration.
_Avoid_: Offline income, Background AFK earning, Idle gains

**Active Timestamp**:
A lightweight persistent timestamp written to the StoragePort recording the engine's most recent live activity, used to measure elapsed time upon cold start or lifecycle resumption.
_Avoid_: Heartbeat, Latest timestamp hack, Ping timer, Watchdog tick

**ClockPort**:
The boundary interface supplying current wall-clock time (`nowMs()`) to the imperative session shell, implemented by `SystemClock` in the browser and `ManualClock` in tests.
_Avoid_: Timer, TimeProvider

**StoragePort**:
The boundary interface for reading and writing serialized game state in the imperative session shell, implemented by `BrowserStorage` (`localStorage`) and `MemoryStorage` in tests.
_Avoid_: SaveManager, Database
