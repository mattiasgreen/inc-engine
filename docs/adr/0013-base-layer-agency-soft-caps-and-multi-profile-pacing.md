# 13. Base-Layer Agency, Bay Capacity Soft-Caps, World Differentiation, and Multi-Profile Pacing

Date: 2026-11-14

## Status

Accepted (refines ADR 0011 and ADR 0012)

## Context

After shipping the 6-second base clock (ADR 0011) and 3-tier Metagenerator cascade standard (ADR 0012), critical review of Layer 0 (Run 1, before first Prestige at `1e6`) revealed four structural gaps:

1. **Flat pre-prestige interactivity and mid-run wait deserts**: Optimal Run 1 took `~96` minutes (`5756s`), with a 40-minute dead zone between `t = 24m` and `t = 64m` where purchase waits reached `533s` and `boughtSynergyMultiplier: 1.00` made manual Tier 1 purchases feel nearly worthless. Meanwhile, `gen3` and four upgrades clustered into the final 15 minutes.
2. **Broken Period Compression mechanics**: `upg_period_compress` divided `effectivePeriodTicks` in `getDerivedStats`, which shortened the progress bar animation without scaling per-tick throughput (`0.00%` actual currency/s gain). `OptimalRoiPolicy` compensated with a hardcoded `0.40 * totalPowerPerSec` heuristic override.
3. **Clone worlds**: `src/games/blueprint.js` overwrote per-world timing and economic parameters with a single shared `CANONICAL_PROGRESSION` table, making `dyson-swarm`, `aetherforge`, and `sunken-observatory` play identically beneath their visual skins.
4. **Hardcoded single-profile offline modeling**: `SemiOptimalPolicy` triggered offline breaks at hardcoded currency counts (`20K`, `100K`, `350K`), rather than modeling attention-driven breaks or multi-session schedules alongside Bay Capacity bounds for offline cascades.

## Decision

1. **Tighter, Punchier Run-1 Pacing Windows**:
   - **Optimal active online play** reaches First Prestige (`1e6`) in **`40 to 60 minutes`** (enforced in tests with a `38m to 65m` band and max single purchase wait `<= 270s`).
   - **Hybrid desk play** (`HybridDeskPolicy`, alias `SemiOptimalPolicy`, taking attention-driven 30-minute breaks when wait exceeds `105s`) reaches `1e6` in **`1.2 to 3.5 hours`** wall-clock.
   - **Sessioned mixed online/offline play** (`Simulator.runSchedule` with `DEFAULT_SESSION_SCHEDULE`: `10m on / 60m off / 5m on / 90m off / 6m on`) reaches `1e6` in **`2.0 to 3.8 hours`** wall-clock (`< 25m` active play) with at least `5` purchases per check-in session.

2. **Real Period Compression & Overdrive Bonus**:
   - `getDerivedStats` scales each Generator's `unitOutput` by `periodSpeedMult = basePeriod / effectivePeriodTicks` so compressing `cyclePeriodTicks` from `4 -> 2 -> 1` delivers genuine `2x -> 4x` production speedup.
   - Reaching Overdrive State (`effectivePeriodMs <= 1000ms`) applies each world's configured `overdriveMultiplier`.
   - `OptimalRoiPolicy` scores `generatorPeriod` upgrades naturally from simulated `getDerivedStats` deltas with zero hardcoded bypasses.

3. **Declarative Layer 0 Active Agency**:
   - **Pulse + Capacitor + Surge Window**: Layer configs may declare a `capacitor` block. Manual `triggerPulse` awards immediate scaled currency plus Capacitor Charge on a cooldown; `dischargeCapacitor` converts accumulated Charge (`>= minDischargeCharge`) into a temporary `surgeTicksRemaining` Surge Window multiplying output, Cycle frequency, or Tick Yield. `advanceTime` splits elapsed time analytically at Surge expiry into two O(1) segments so offline and online transitions remain exact.
   - **Operational Stances**: Layer configs may declare `stances` (`balanced`, `extraction`, `cascade`) trading off direct currency, Metagenerator cascade speed, Cycle frequency, and Capacitor charge rate, revealed once `gen1.owned >= 1` and reset on Prestige.
   - **Layer 0 Doctrine Branches**: Layer 0 expands to a 9-node Upgrade Tree DAG with prerequisite chains and one mutually exclusive Run-1 Doctrine fork (`upg_doctrine_surge` vs `upg_doctrine_cascade`), yielding `8/8` purchasable upgrades along either path per run.

4. **Soft-Capped Bay Capacity & Manual Purchase Relevance**:
   - Metagenerator-spawned free units (`owned - bought`) operate at `100%` efficiency up to `bayCapacity = (bayBase + bayPerBought * bought) * bayMult`.
   - Excess free units above `bayCapacity` compress smoothly via `(1 + excess / bayCapacity)^0.42 - 1` while channeling overflow ratio into faster Capacitor charging (`up to +300%` rate).
   - Manual purchases remain valuable throughout Run 1 via restored `boughtSynergyMultiplier > 1.0`, Bay Capacity expansion per bought unit, and tier-appropriate Milestones on `gen2` (`6, 14, 30, 70`) and `gen3` (`2, 6, 15, 35`).
   - Synthetic test configs omitting `bayCapacity`, `capacitor`, or `stances` bypass these optional features cleanly, preserving exact polynomial semigroup equivalence (`< 1e-6`).

5. **Mechanical World Differentiation**:
   - `blueprint.js` acts as a schema validator and default merger rather than a rigid constant cloner.
   - `dyson-swarm`: Precision Orbital Grid (`6.0s` clock, `1.22x` Overdrive bonus, strong Swarm Replication cascade stance).
   - `aetherforge`: Fast Rhythmic Weave (`4.0s` clock, high `1.016x` manual summon synergy, `1.70x` long-duration Astral Leyflare Surge, `22`-unit `gen1` first milestone).
   - `sunken-observatory`: Deep-Trench Batch Tide (`7.5s` clock, `2x` Surge Tick Yield during Rift Tide, sharp Stance polarity between `+38%` Lucid Exegesis and `+80%` Drowned Calling).

## Consequences

- Layer 0 has tactile moment-to-moment decisions (Pulse timing, Stance shifts, Capacitor Surge timing, Doctrine choice) before unlocking Prestige.
- Idle cascades stay productive for active check-ins and offline sessions without trivializing 8-hour absences.
- `test/pacing.test.js`, `test/contribution.test.js`, and `scripts/pacing-report.js` continuously enforce balance across all 3 worlds and multiple play profiles.
