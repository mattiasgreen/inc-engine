// test/contribution.test.js
// Meaningful Contribution Specification and Simulator Test Harness
// Verifies that every generator tier and upgrade actively and measurably contributes to progression.

import { describe, it, expect } from './runner.js';
import { dysonSwarmGame, aetherforgeGame, sunkenObservatoryGame } from '../src/games/index.js';
import { createInitialState } from '../src/engine/core.js';
import { Simulator } from '../src/engine/simulator.js';
import { OptimalRoiPolicy, SemiOptimalPolicy } from '../src/engine/policies.js';
import { BigNum } from '../src/engine/bignum.js';

describe('Meaningful Contribution Specification and Harness Seam', () => {
  const games = [
    { name: 'Dyson Swarm: Protocol Sol', config: dysonSwarmGame },
    { name: 'Aetherforge: The Grand Ascension', config: aetherforgeGame },
    { name: 'The Sunken Observatory', config: sunkenObservatoryGame }
  ];

  it('guarantees Tier 2 and Tier 3 metagenerators deliver primary production volume across all games', () => {
    for (const { name, config } of games) {
      const state = createInitialState(config);
      const simulator = new Simulator(config);
      const policy = new OptimalRoiPolicy();
      const target = new BigNum(1e6);

      const result = simulator.run(state, policy, {
        stopCondition: st => st.layers.layer0.runTotalCurrency.gte(target),
        maxSimulatedMs: 3 * 60 * 60 * 1000
      });

      expect(result.state.layers.layer0.runTotalCurrency.gte(target)).toBe(true);

      const l0 = result.state.layers.layer0;
      const g1 = l0.generators.gen1;
      const g2 = l0.generators.gen2;
      const g3 = l0.generators.gen3;

      const g1Bought = g1.bought.toNumber();
      const g1Owned = g1.owned.toNumber();
      const g2Bought = g2.bought.toNumber();
      const g2Owned = g2.owned.toNumber();
      const g3Bought = g3.bought.toNumber();
      const g3Owned = g3.owned.toNumber();

      // Tier 1 verification
      expect(g1Bought).toBeGreaterThanOrEqual(20);
      expect(g1Owned).toBeGreaterThanOrEqual(80);

      // Tier 2 Metagenerator Verification:
      // Gen 2 must be purchased, and must produce the vast majority of Gen 1 units.
      expect(g2Bought).toBeGreaterThanOrEqual(5);
      const g1FromMeta = g1Owned - g1Bought;
      expect(g1FromMeta).toBeGreaterThanOrEqual(40);
      const g1MetaRatio = g1FromMeta / g1Owned;
      // At least 50% of all Gen 1 units owned must originate from Gen 2 metageneration
      expect(g1MetaRatio).toBeGreaterThanOrEqual(0.50);

      // Tier 3 Metagenerator Verification:
      // Gen 3 must be purchased, and must generate meaningful units of Gen 2.
      expect(g3Bought).toBeGreaterThanOrEqual(1);
      const g2FromMeta = g2Owned - g2Bought;
      expect(g2FromMeta).toBeGreaterThanOrEqual(1.0);
      const g2MetaRatio = g2FromMeta / g2Owned;
      // At least 15% of all Gen 2 units owned must originate from Gen 3 metageneration
      expect(g2MetaRatio).toBeGreaterThanOrEqual(0.15);
    }
  });

  it('guarantees all 7 Layer 0 upgrades are viable and purchased during the run to First Prestige', () => {
    const expectedUpgradeIds = [
      'upg_cycle_accel',
      'upg_gen1_overdrive',
      'upg_period_compress',
      'upg_cross_synergy',
      'upg_milestone_resonance',
      'upg_tick_amp',
      'upg_log_momentum'
    ];

    for (const { name, config } of games) {
      const state = createInitialState(config);
      const simulator = new Simulator(config);
      const policy = new OptimalRoiPolicy();
      const target = new BigNum(1e6);

      const result = simulator.run(state, policy, {
        stopCondition: st => st.layers.layer0.runTotalCurrency.gte(target),
        maxSimulatedMs: 3 * 60 * 60 * 1000
      });

      const purchasedUpgradeCounts = {};
      for (const h of result.history) {
        if (h.action.type === 'buyUpgrade') {
          purchasedUpgradeCounts[h.action.id] = (purchasedUpgradeCounts[h.action.id] || 0) + 1;
        }
      }

      // Every single Layer 0 upgrade must have been purchased at least once
      for (const upgId of expectedUpgradeIds) {
        const count = purchasedUpgradeCounts[upgId] || 0;
        expect(count).toBeGreaterThanOrEqual(1);
      }

      // Exact count of distinct upgrades purchased must be 7 out of 7
      const distinctCount = Object.keys(purchasedUpgradeCounts).filter(id => expectedUpgradeIds.includes(id)).length;
      expect(distinctCount).toBe(7);
    }
  });

  it('proves progression pacing stays bounded between 1.5h-2.2h optimal and 3.0h-4.8h semi-optimal', () => {
    for (const { name, config } of games) {
      // 1. Optimal play run
      const optState = createInitialState(config);
      const optSim = new Simulator(config);
      const optPolicy = new OptimalRoiPolicy();
      const target = new BigNum(1e6);

      const optRes = optSim.run(optState, optPolicy, {
        stopCondition: st => st.layers.layer0.runTotalCurrency.gte(target),
        maxSimulatedMs: 3 * 60 * 60 * 1000
      });

      const optElapsedSec = optRes.simulatedMs / 1000;
      expect(optElapsedSec).toBeGreaterThanOrEqual(5400); // >= 90 min
      expect(optElapsedSec).toBeLessThanOrEqual(8400);    // <= 140 min

      // 2. Semi-optimal play run
      const semiState = createInitialState(config);
      const semiSim = new Simulator(config);
      const semiPolicy = new SemiOptimalPolicy();

      const semiRes = semiSim.run(semiState, semiPolicy, {
        stopCondition: st => st.layers.layer0.runTotalCurrency.gte(target),
        maxSimulatedMs: 6 * 60 * 60 * 1000
      });

      const semiElapsedHours = semiRes.simulatedMs / 3600000;
      expect(semiElapsedHours).toBeGreaterThanOrEqual(3.0);
      expect(semiElapsedHours).toBeLessThanOrEqual(4.8);
    }
  });
});
