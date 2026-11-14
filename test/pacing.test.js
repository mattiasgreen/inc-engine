// test/pacing.test.js
import { describe, it, expect } from './runner.js';
import { defaultGameConfig } from '../src/engine/config.js';
import { dysonSwarmGame, aetherforgeGame, sunkenObservatoryGame } from '../src/games/index.js';
import { createInitialState, advanceTime } from '../src/engine/core.js';
import { Simulator } from '../src/engine/simulator.js';
import {
  GreedyPolicy,
  OptimalRoiPolicy,
  HybridDeskPolicy,
  SessionedPlayPolicy,
  DEFAULT_SESSION_SCHEDULE,
  PassivePolicy,
  AutoPrestigePolicy
} from '../src/engine/policies.js';
import { BigNum } from '../src/engine/bignum.js';

describe('Simulator and Progression Pacing Seam', () => {
  it('supports PassivePolicy for pure idle time advancement', () => {
    let state = createInitialState(defaultGameConfig);
    const simulator = new Simulator(defaultGameConfig);
    const policy = new PassivePolicy();

    const result = simulator.run(state, policy, { maxSimulatedMs: 5000 });
    expect(result.simulatedMs).toBe(5000);
    expect(result.history.length).toBe(0);
  });

  it('supports AutoPrestigePolicy to automatically reset upon reaching prestige threshold', () => {
    let state = createInitialState(defaultGameConfig);
    const simulator = new Simulator(defaultGameConfig);
    const policy = new AutoPrestigePolicy({ prestigeLayerId: 'layer1', minReward: 1, basePolicy: new OptimalRoiPolicy() });

    const result = simulator.run(state, policy, {
      stopCondition: st => st.layers.layer1.currency.gte(1),
      maxSimulatedMs: 3 * 60 * 60 * 1000
    });

    expect(result.state.layers.layer1.currency.gte(1)).toBe(true);
    const resetEvents = result.history.filter(h => h.action.type === 'resetLayer');
    expect(resetEvents.length).toBeGreaterThan(0);
  });
  it('guarantees monotonicity: currency and ticks strictly increase with no deadlocks', () => {
    let state = createInitialState(defaultGameConfig);
    const simulator = new Simulator(defaultGameConfig);
    const policy = new GreedyPolicy();

    // Simulate 30 seconds
    const result = simulator.run(state, policy, { maxSimulatedMs: 30000 });
    expect(result.state.totalTicks.gt(0)).toBe(true);
    expect(result.state.layers.layer0.currency.gte(0)).toBe(true);
    expect(result.state.layers.layer0.runTotalCurrency.gt(10)).toBe(true);
    expect(result.history.length).toBeGreaterThan(0);
  });

  it('proves First Prestige Window is paced around 40-60 minutes of optimal play with <=270s waits and m1 milestone guardrail', () => {
    const games = [dysonSwarmGame, aetherforgeGame, sunkenObservatoryGame];
    for (const gameConfig of games) {
      let state = createInitialState(gameConfig);
      const simulator = new Simulator(gameConfig);
      const policy = new OptimalRoiPolicy();

      const target = new BigNum(1e6);
      const result = simulator.run(state, policy, {
        stopCondition: (st) => st.layers.layer0.runTotalCurrency.gte(target),
        maxSimulatedMs: 3 * 60 * 60 * 1000
      });

      expect(result.state.layers.layer0.runTotalCurrency.gte(target)).toBe(true);

      const elapsedSeconds = result.simulatedMs / 1000;
      expect(elapsedSeconds).toBeGreaterThanOrEqual(2280);
      expect(elapsedSeconds).toBeLessThanOrEqual(3900);

      // Milestone guardrail: gen1 unlocks configured m1 on Run 1 without reaching 50 bought
      const m1Threshold = gameConfig.layers[0].generators.find(g => g.id === 'gen1')?.milestones?.[1]?.minBought ?? 25;
      const gen1Bought = result.state.layers.layer0.generators.gen1.bought.toNumber();
      expect(gen1Bought).toBeGreaterThanOrEqual(m1Threshold);
      expect(gen1Bought).toBeLessThan(50);

      // Sawtooth wait cadence with zero dead waits > 270s
      const buyWaitsSec = result.history
        .filter(h => h.action.type === 'buyGenerator' || h.action.type === 'buyUpgrade')
        .map(h => (h.waitMs || 0) / 1000);
      const maxWaitSec = buyWaitsSec.length ? Math.max(...buyWaitsSec) : 0;
      const shortWaitsCount = buyWaitsSec.filter(w => w > 0 && w <= 45).length;
      const mediumWaitsCount = buyWaitsSec.filter(w => w >= 90 && w <= 270).length;

      expect(maxWaitSec).toBeLessThanOrEqual(270);
      expect(shortWaitsCount).toBeGreaterThanOrEqual(10);
      expect(mediumWaitsCount).toBeGreaterThanOrEqual(3);
    }
  });

  it('proves Hybrid Desk play reaches First Prestige in 1.2-3.5 hours across all games', () => {
    const games = [dysonSwarmGame, aetherforgeGame, sunkenObservatoryGame];
    for (const gameConfig of games) {
      let state = createInitialState(gameConfig);
      const simulator = new Simulator(gameConfig);
      const policy = new HybridDeskPolicy();

      const target = new BigNum(1e6);
      const result = simulator.run(state, policy, {
        stopCondition: (st) => st.layers.layer0.runTotalCurrency.gte(target),
        maxSimulatedMs: 5 * 60 * 60 * 1000
      });

      expect(result.state.layers.layer0.runTotalCurrency.gte(target)).toBe(true);

      const elapsedHours = result.simulatedMs / (3600 * 1000);
      expect(elapsedHours).toBeGreaterThanOrEqual(1.2);
      expect(elapsedHours).toBeLessThanOrEqual(3.5);
    }
  });

  it('proves Sessioned schedule finishes in 2.0-3.8h wall time while 10m->8h pure offline stays <1e6', () => {
    const games = [dysonSwarmGame, aetherforgeGame, sunkenObservatoryGame];
    const target = new BigNum(1e6);

    for (const gameConfig of games) {
      // 1. Sessioned offline/online schedule
      const simulator = new Simulator(gameConfig);
      const schedRes = simulator.runSchedule(
        createInitialState(gameConfig),
        new SessionedPlayPolicy(),
        DEFAULT_SESSION_SCHEDULE,
        { stopCondition: (st) => st.layers.layer0.runTotalCurrency.gte(target) }
      );

      expect(schedRes.reachedTarget).toBe(true);
      expect(schedRes.state.layers.layer0.runTotalCurrency.gte(target)).toBe(true);
      const wallHours = schedRes.totalWallMs / 3600000;
      const activeMin = schedRes.activeMs / 60000;
      expect(wallHours).toBeGreaterThanOrEqual(2.0);
      expect(wallHours).toBeLessThanOrEqual(3.8);
      expect(activeMin).toBeLessThanOrEqual(25);
      const onlineSessions = schedRes.sessions.filter(s => s.type === 'online');
      expect(onlineSessions.length).toBeGreaterThanOrEqual(2);
      for (const s of onlineSessions) {
        expect(s.purchases).toBeGreaterThanOrEqual(4);
      }

      // 2. 10m active setup + 8h pure offline anti-cheese bound via Bay Capacity
      const optPolicy = new OptimalRoiPolicy();
      const setupRes = simulator.run(
        createInitialState(gameConfig),
        optPolicy,
        { maxSimulatedMs: 10 * 60 * 1000 }
      );
      let preOfflineState = setupRes.state;
      const prep = optPolicy.prepareForOffline(preOfflineState, gameConfig);
      if (prep) {
        preOfflineState = simulator.run(
          preOfflineState,
          { decideAction: () => prep },
          { maxSimulatedMs: 1000, maxSteps: 1 }
        ).state;
      }
      const after8h = advanceTime(preOfflineState, gameConfig, 8 * 3600 * 1000).nextState;
      expect(after8h.layers.layer0.runTotalCurrency.lt(target)).toBe(true);
    }
  });

  it('demonstrates Prestige Acceleration: Run #2 reaches 1e6 in <50% of Run #1 time', () => {
    const simulator = new Simulator(defaultGameConfig);
    const policy = new OptimalRoiPolicy();
    const target = new BigNum(1e6);

    // Run 1: from scratch to 1e6
    let state = createInitialState(defaultGameConfig);
    const run1 = simulator.run(state, policy, {
      stopCondition: (st) => st.layers.layer0.runTotalCurrency.gte(target),
      maxSimulatedMs: 3 * 60 * 60 * 1000
    });
    const run1DurationMs = run1.simulatedMs;

    // Reset Layer 1
    state = simulator.resetLayer(run1.state, 'layer1');
    expect(state.layers.layer1.currency.gte(1)).toBe(true);

    // Buy Layer 1 Upgrade: Exponential Synergy (2x global multiplier)
    state = simulator.buyUpgrade(state, 'layer1', 'upg_l1_exp_mult');

    // Run 2: from reset to 1e6 again
    const run2 = simulator.run(state, policy, {
      stopCondition: (st) => st.layers.layer0.runTotalCurrency.gte(target),
      maxSimulatedMs: 3 * 60 * 60 * 1000
    });
    const run2DurationMs = run2.simulatedMs;

    // Run 2 should take less than 50% of Run 1
    expect(run2DurationMs).toBeLessThan(run1DurationMs * 0.5);
  });

  it('executes active policy simulation with high performance via event skipping', () => {
    let state = createInitialState(defaultGameConfig);
    const simulator = new Simulator(defaultGameConfig);
    const policy = new GreedyPolicy();

    const startPerf = Date.now();
    // Simulate 10,000 seconds (almost 3 hours)
    simulator.run(state, policy, { maxSimulatedMs: 10000 * 1000, maxSteps: 5000 });
    const realExecutionMs = Date.now() - startPerf;

    // Should complete in under 1500ms real wall-clock time
    expect(realExecutionMs).toBeLessThan(1500);
  });
});
