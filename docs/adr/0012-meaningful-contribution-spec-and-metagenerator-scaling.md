# Meaningful Contribution Specification and Metagenerator Scaling

To ensure every purchased asset noticeably impacts player progression, the engine establishes a mathematical **Meaningful Contribution Specification**, backed by an automated simulator test harness (`test/contribution.test.js`), and recalibrates metagenerator output rates and upgrade synergies across all playable worlds.

## Context and Root Cause Analysis

During earlier tuning to stretch the first Prestige run to 2 hours, Tier 2 (`gen2`) and Tier 3 (`gen3`) metagenerator outputs were drastically curtailed (`0.00018` and `0.00008` per tick). This reduced metageneration to near zero:
1. At `0.00018` per tick (1 tick = 6 seconds), a single Tier 2 unit required 9.25 hours to produce a single Tier 1 generator. In practical gameplay, even after purchasing 7 units of Tier 2, fewer than 0.12 units of Tier 1 were generated across an entire multi-hour run.
2. In `OptimalRoiPolicy`, metagenerators were evaluated with linear discounting rather than integrating quadratic ($t^2/2$) and cubic ($t^3/6$) downstream yield over the strategic horizon. Consequently, the automated solver and rational players treated Tier 3 and period compression upgrades as economically unviable traps, purchasing zero units of Tier 3 and ignoring period compression upgrades.

## Architecture and Meaningful Contribution Standard

To eliminate decorative or non-viable purchases, any generator or upgrade offered to the player must satisfy the following strict criteria during the run to First Prestige ($10^6$ Layer 0 currency):

1. **Tier 2 Metagenerator Dominance ($\ge 50\%$ Volume)**:
   - Tier 2 units must generate at least 40 units of Tier 1 during the run.
   - By first Prestige, at least 50% of all Tier 1 units owned must have been created through Tier 2 metageneration:
     $$\frac{G_1.\text{owned} - G_1.\text{bought}}{G_1.\text{owned}} \ge 0.50$$
     (Calibrated runs achieve $\sim 75-80\%$).

2. **Tier 3 Metagenerator Cascades ($\ge 15\%$ Volume)**:
   - Tier 3 units must be affordable and purchased before first Prestige ($\ge 1$ bought).
   - Tier 3 must generate at least 1 full unit of Tier 2, contributing at least 15% of all Tier 2 units owned:
     $$\frac{G_2.\text{owned} - G_2.\text{bought}}{G_2.\text{owned}} \ge 0.15$$
     (Calibrated runs achieve $\sim 30-35\%$).

3. **100% Upgrade Viability ($7 / 7$)**:
   - All 7 Layer 0 upgrades (`upg_cycle_accel`, `upg_gen1_overdrive`, `upg_period_compress`, `upg_cross_synergy`, `upg_milestone_resonance`, `upg_tick_amp`, `upg_log_momentum`) must have a viable ROI window and be purchased at least once during the run.

4. **Strategic Horizon Valuation in OptimalRoiPolicy**:
   - `OptimalRoiPolicy` estimates metagenerator power by topologically propagating downstream value across a 220-tick strategic horizon ($H = 220$), integrating quadratic and cubic returns:
     $$\text{value}(G_k) = \text{rate}(G_k) \times \text{value}(G_{k-1}) \times \frac{H}{2}$$
   - First-time unlocks receive an exploratory weight bonus ($3.5\times$) to ensure newly unlocked tiers are promptly acquired.

5. **Harmonized Tuning Across Worlds**:
   - `gen1`: `baseCost: 10`, `costGrowth: 1.405`, `cyclePeriodTicks: 1`, `baseOutputPerTick: 6.0`
   - `gen2`: `baseCost: 1850`, `costGrowth: 1.44`, `cyclePeriodTicks: 4`, `baseOutputPerTick: 0.016`, `unlockThreshold: 650`
   - `gen3`: `baseCost: 20000`, `costGrowth: 1.48`, `cyclePeriodTicks: 8`, `baseOutputPerTick: 0.009`, `unlockThreshold: 8500`
   - Upgrades:
     - `upg_cycle_accel`: `baseCost: 250`, `costGrowth: 2.6`
     - `upg_gen1_overdrive`: `baseCost: 550`, `costGrowth: 2.75`
     - `upg_period_compress`: `baseCost: 4400`, `costGrowth: 5.4`, `unlockThreshold: 2200`
     - `upg_cross_synergy`: `baseCost: 17000`, `costGrowth: 3.9`, `unlockThreshold: 8500`
     - `upg_milestone_resonance`: `baseCost: 40000`, `costGrowth: 4.6`, `unlockThreshold: 20000`
     - `upg_tick_amp`: `baseCost: 92000`, `costGrowth: 8.0`
     - `upg_log_momentum`: `baseCost: 130000`, `costGrowth: 1`, `unlockThreshold: 70000`

6. **Pacing Guardrails**:
   - Optimal play reaches $10^6$ in $5400\text{s} - 8400\text{s}$ ($\sim 1.5 - 2.2$ hours; calibrated to $\sim 96$ minutes).
   - Semi-optimal play (human hesitation lag and 3 offline breaks) reaches $10^6$ in $10800\text{s} - 17280\text{s}$ ($\sim 3.0 - 4.8$ hours; calibrated to $\sim 3.2$ hours).
   - Milestone guardrail: `gen1` reaches Uncommon $m_1$ ($25$ bought) and stays strictly below $m_2$ ($< 50$ bought).
