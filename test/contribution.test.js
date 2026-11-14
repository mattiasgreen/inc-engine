// test/contribution.test.js
// Meaningful Contribution Specification and Simulator Test Harness
// Verifies that every generator tier and upgrade actively and measurably contributes to progression.

import { describe, it, expect } from './runner.js';
import { dysonSwarmGame, aetherforgeGame, sunkenObservatoryGame } from '../src/games/index.js';
import { createInitialState, getDerivedStats } from '../src/engine/core.js';
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

      const stats = getDerivedStats(result.state, config);
      const l0 = result.state.layers.layer0;
      const g1 = l0.generators.gen1;
      const g2 = l0.generators.gen2;
      const g3 = l0.generators.gen3;

      const g1Bought = g1.bought.toNumber();
      const g1Owned = g1.owned.toNumber();
      const effG1 = stats.bayEffectiveOwned.layer0.gen1.toNumber();
      const g2Bought = g2.bought.toNumber();
      const g2Owned = g2.owned.toNumber();
      const effG2 = stats.bayEffectiveOwned.layer0.gen2.toNumber();
      const g3Bought = g3.bought.toNumber();
      const g3Owned = g3.owned.toNumber();

      // Tier 1 verification
      expect(g1Bought).toBeGreaterThanOrEqual(20);
      expect(g1Owned).toBeGreaterThanOrEqual(80);

      // Tier 2 Metagenerator Verification:
      // Gen 2 must be purchased, and must produce the vast majority of Gen 1 units (both raw and Bay-effective).
      expect(g2Bought).toBeGreaterThanOrEqual(5);
      const g1FromMeta = g1Owned - g1Bought;
      expect(g1FromMeta).toBeGreaterThanOrEqual(40);
      const g1MetaRatio = g1FromMeta / g1Owned;
      expect(g1MetaRatio).toBeGreaterThanOrEqual(0.50);
      const effG1MetaRatio = (effG1 - g1Bought) / effG1;
      expect(effG1MetaRatio).toBeGreaterThanOrEqual(0.45);

      // Tier 3 Metagenerator Verification:
      // Gen 3 must be purchased multiple times and generate meaningful Bay-effective Gen 2 units.
      expect(g3Bought).toBeGreaterThanOrEqual(2);
      expect(g3Owned).toBeGreaterThanOrEqual(g3Bought);
      const g2FromMeta = g2Owned - g2Bought;
      expect(g2FromMeta).toBeGreaterThanOrEqual(1.0);
      const g2MetaRatio = g2FromMeta / g2Owned;
      expect(g2MetaRatio).toBeGreaterThanOrEqual(0.15);
      const effG2MetaRatio = (effG2 - g2Bought) / effG2;
      expect(effG2MetaRatio).toBeGreaterThanOrEqual(0.20);
    }
  });

  it('enforces early and mid-run metagenerator micro-utility, purchase cadence, and 15-minute live contribution across all games', () => {
    for (const { config } of games) {
      const cycleSec = config.clock.baseCycleDurationMs / 1000;
      const g2Cfg = config.layers[0].generators.find(g => g.id === 'gen2');
      const g2SpawnSec = cycleSec / g2Cfg.baseOutputPerTick;
      expect(g2SpawnSec).toBeLessThanOrEqual(210);

      const fullSim = new Simulator(config);
      const target = new BigNum(1e6);
      const fullRes = fullSim.run(createInitialState(config), new OptimalRoiPolicy(), {
        stopCondition: st => st.layers.layer0.runTotalCurrency.gte(target),
        maxSimulatedMs: 3 * 60 * 60 * 1000
      });

      let elapsedMin = 0;
      const g2BuyTimesMin = [];
      for (const h of fullRes.history) {
        elapsedMin += (h.waitMs || 0) / 60000;
        if (h.action.type === 'buyGenerator' && h.action.id === 'gen2') {
          g2BuyTimesMin.push(elapsedMin);
        }
      }

      expect(g2BuyTimesMin.length).toBeGreaterThanOrEqual(3);
      expect(g2BuyTimesMin[0]).toBeLessThanOrEqual(7.0);
      expect(g2BuyTimesMin[1]).toBeLessThanOrEqual(9.0);
      expect(g2BuyTimesMin[1] - g2BuyTimesMin[0]).toBeLessThanOrEqual(4.0);

      const midSim = new Simulator(config);
      const midRes = midSim.run(createInitialState(config), new OptimalRoiPolicy(), {
        maxSimulatedMs: 15 * 60 * 1000
      });
      const stats15 = getDerivedStats(midRes.state, config);
      const l0_15 = midRes.state.layers.layer0;
      const g1b15 = l0_15.generators.gen1.bought.toNumber();
      const g1o15 = l0_15.generators.gen1.owned.toNumber();
      const g2b15 = l0_15.generators.gen2.bought.toNumber();
      const effG1_15 = stats15.bayEffectiveOwned.layer0.gen1.toNumber();

      expect(g2b15).toBeGreaterThanOrEqual(3);
      expect(g1o15 - g1b15).toBeGreaterThanOrEqual(8.0);
      expect((effG1_15 - g1b15) / effG1_15).toBeGreaterThanOrEqual(0.24);
    }
  });

  it('guarantees all 8 available Layer 0 upgrades are viable and purchased across both Doctrine branches to First Prestige', () => {
    const sharedUpgradeIds = [
      'upg_cycle_accel',
      'upg_gen1_overdrive',
      'upg_period_compress',
      'upg_cross_synergy',
      'upg_milestone_resonance',
      'upg_tick_amp',
      'upg_log_momentum'
    ];

    for (const { config } of games) {
      for (const doctrine of ['surge', 'cascade']) {
        const chosenDoctrineId = doctrine === 'surge' ? 'upg_doctrine_surge' : 'upg_doctrine_cascade';
        const excludedDoctrineId = doctrine === 'surge' ? 'upg_doctrine_cascade' : 'upg_doctrine_surge';
        const expectedIds = [...sharedUpgradeIds, chosenDoctrineId];

        const state = createInitialState(config);
        const simulator = new Simulator(config);
        const policy = new OptimalRoiPolicy({ preferredDoctrine: doctrine });
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

        for (const upgId of expectedIds) {
          expect(purchasedUpgradeCounts[upgId] || 0).toBeGreaterThanOrEqual(1);
        }
        expect(purchasedUpgradeCounts[excludedDoctrineId] || 0).toBe(0);

        const distinctCount = Object.keys(purchasedUpgradeCounts).filter(id => expectedIds.includes(id)).length;
        expect(distinctCount).toBe(8);
      }
    }
  });

  it('proves progression pacing stays bounded between 38m-65m optimal and 1.2h-3.5h hybrid desk', () => {
    for (const { config } of games) {
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
      expect(optElapsedSec).toBeGreaterThanOrEqual(2280); // >= 38 min
      expect(optElapsedSec).toBeLessThanOrEqual(3900);    // <= 65 min

      // 2. Hybrid Desk / Semi-optimal play run
      const semiState = createInitialState(config);
      const semiSim = new Simulator(config);
      const semiPolicy = new SemiOptimalPolicy();

      const semiRes = semiSim.run(semiState, semiPolicy, {
        stopCondition: st => st.layers.layer0.runTotalCurrency.gte(target),
        maxSimulatedMs: 5 * 60 * 60 * 1000
      });

      const semiElapsedHours = semiRes.simulatedMs / 3600000;
      expect(semiElapsedHours).toBeGreaterThanOrEqual(1.2);
      expect(semiElapsedHours).toBeLessThanOrEqual(3.5);
    }
  });
});
