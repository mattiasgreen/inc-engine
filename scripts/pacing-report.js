// scripts/pacing-report.js
// Multi-world, multi-profile progression verification and telemetry diagnostic report

import { dysonSwarmGame, aetherforgeGame, sunkenObservatoryGame } from '../src/games/index.js';
import { createInitialState, getDerivedStats, advanceTime } from '../src/engine/core.js';
import { Simulator } from '../src/engine/simulator.js';
import {
  OptimalRoiPolicy,
  HybridDeskPolicy,
  SessionedPlayPolicy,
  DEFAULT_SESSION_SCHEDULE
} from '../src/engine/policies.js';
import { BigNum } from '../src/engine/bignum.js';

const TARGET = new BigNum(1e6);
const GAMES = [dysonSwarmGame, aetherforgeGame, sunkenObservatoryGame];

function summarizeOptimal(config, doctrine) {
  const sim = new Simulator(config);
  const policy = new OptimalRoiPolicy({ preferredDoctrine: doctrine });
  const res = sim.run(createInitialState(config), policy, {
    stopCondition: st => st.layers.layer0.runTotalCurrency.gte(TARGET),
    maxSimulatedMs: 3 * 3600 * 1000
  });

  const stats = getDerivedStats(res.state, config);
  const l0 = res.state.layers.layer0;
  const g1b = l0.generators.gen1.bought.toNumber();
  const g1o = l0.generators.gen1.owned.toNumber();
  const g1eff = stats.bayEffectiveOwned.layer0.gen1.toNumber();
  const g2b = l0.generators.gen2.bought.toNumber();
  const g2o = l0.generators.gen2.owned.toNumber();
  const g2eff = stats.bayEffectiveOwned.layer0.gen2.toNumber();
  const g3b = l0.generators.gen3.bought.toNumber();
  const upgSet = new Set(res.history.filter(h => h.action.type === 'buyUpgrade').map(h => h.action.id));
  const waits = res.history
    .filter(h => h.action.type === 'buyGenerator' || h.action.type === 'buyUpgrade')
    .map(h => (h.waitMs || 0) / 1000);
  const maxWaitSec = waits.length ? Math.max(...waits) : 0;

  let elapsedMin = 0;
  const g2BuyTimesMin = [];
  for (const h of res.history) {
    elapsedMin += (h.waitMs || 0) / 60000;
    if (h.action.type === 'buyGenerator' && h.action.id === 'gen2') {
      g2BuyTimesMin.push(Number(elapsedMin.toFixed(1)));
    }
  }

  return {
    reached: l0.runTotalCurrency.gte(TARGET),
    minutes: res.simulatedMs / 60000,
    maxWaitSec,
    upgrades: upgSet.size,
    g1b,
    g1o,
    g1eff,
    g2b,
    g2o,
    g2eff,
    g3b,
    g2BuyTimesMin: g2BuyTimesMin.slice(0, 4)
  };
}

function summarizeMidpoint15m(config) {
  const sim = new Simulator(config);
  const res = sim.run(createInitialState(config), new OptimalRoiPolicy(), {
    maxSimulatedMs: 15 * 60 * 1000
  });
  const stats = getDerivedStats(res.state, config);
  const l0 = res.state.layers.layer0;
  const g1b = Math.round(l0.generators.gen1.bought.toNumber());
  const g1o = l0.generators.gen1.owned.toNumber();
  const g1eff = stats.bayEffectiveOwned.layer0.gen1.toNumber();
  const g2b = Math.round(l0.generators.gen2.bought.toNumber());
  return {
    g2b,
    g1Free: g1o - g1b,
    effMetaPct: Math.round(((g1eff - g1b) / Math.max(1, g1eff)) * 100)
  };
}

function summarizeHybrid(config) {
  const sim = new Simulator(config);
  const policy = new HybridDeskPolicy();
  const res = sim.run(createInitialState(config), policy, {
    stopCondition: st => st.layers.layer0.runTotalCurrency.gte(TARGET),
    maxSimulatedMs: 6 * 3600 * 1000
  });
  return {
    reached: res.state.layers.layer0.runTotalCurrency.gte(TARGET),
    hours: res.simulatedMs / 3600000,
    breaks: policy.offlineBreaksTaken
  };
}

function summarizeSessioned(config) {
  const sim = new Simulator(config);
  const policy = new SessionedPlayPolicy();
  const res = sim.runSchedule(createInitialState(config), policy, DEFAULT_SESSION_SCHEDULE, {
    stopCondition: st => st.layers.layer0.runTotalCurrency.gte(TARGET)
  });
  const onlineSessions = res.sessions.filter(s => s.type === 'online');
  const minPurchases = onlineSessions.length ? Math.min(...onlineSessions.map(s => s.purchases)) : 0;
  return {
    reached: res.reachedTarget,
    wallHours: res.totalWallMs / 3600000,
    activeMin: res.activeMs / 60000,
    onlinePurchases: onlineSessions.map(s => s.purchases),
    minPurchases,
    endRunTotal: res.state.layers.layer0.runTotalCurrency.toNumber()
  };
}

function summarizeOfflineCapGuard(config) {
  const sim = new Simulator(config);
  const policy = new OptimalRoiPolicy();
  const res10m = sim.run(createInitialState(config), policy, {
    maxSimulatedMs: 10 * 60 * 1000
  });
  let state = res10m.state;
  const prep = policy.prepareForOffline(state, config);
  if (prep) {
    state = sim.run(state, { decideAction: () => prep }, { maxSimulatedMs: 1000, maxSteps: 1 }).state;
  }
  const { nextState } = advanceTime(state, config, 8 * 3600 * 1000);
  return {
    runTotalAfter10m: res10m.state.layers.layer0.runTotalCurrency.toNumber(),
    runTotalAfter8hOff: nextState.layers.layer0.runTotalCurrency.toNumber()
  };
}

console.log('=== inc-engine Multi-Profile Pacing Report ===\n');

for (const cfg of GAMES) {
  const cycleSec = cfg.clock.baseCycleDurationMs / 1000;
  const g2Cfg = cfg.layers[0].generators.find(g => g.id === 'gen2');
  const g2SpawnSec = cycleSec / g2Cfg.baseOutputPerTick;
  const optSurge = summarizeOptimal(cfg, 'surge');
  const optCascade = summarizeOptimal(cfg, 'cascade');
  const mid15 = summarizeMidpoint15m(cfg);
  const hybrid = summarizeHybrid(cfg);
  const sessioned = summarizeSessioned(cfg);
  const off8h = summarizeOfflineCapGuard(cfg);

  console.log(`World: ${cfg.id} (clock=${cfg.clock.baseCycleDurationMs}ms, g2Spawn=${g2SpawnSec.toFixed(0)}s, boughtSyn=${cfg.layers[0].boughtSynergyMultiplier}, od=${cfg.layers[0].overdriveMultiplier})`);
  console.log(
    `  Optimal (Surge)   : ${optSurge.minutes.toFixed(1)}m | maxWait=${optSurge.maxWaitSec.toFixed(0)}s | upg=${optSurge.upgrades}/8 | ` +
    `g1=${optSurge.g1b}/${optSurge.g1o.toFixed(1)}(eff ${optSurge.g1eff.toFixed(1)}) g2=${optSurge.g2b}/${optSurge.g2o.toFixed(1)}(eff ${optSurge.g2eff.toFixed(1)}) g3=${optSurge.g3b} | g2Buys=[${optSurge.g2BuyTimesMin.join(', ')}]m`
  );
  console.log(
    `  Optimal (Cascade) : ${optCascade.minutes.toFixed(1)}m | maxWait=${optCascade.maxWaitSec.toFixed(0)}s | upg=${optCascade.upgrades}/8 | ` +
    `g1=${optCascade.g1b}/${optCascade.g1o.toFixed(1)}(eff ${optCascade.g1eff.toFixed(1)}) g2=${optCascade.g2b}/${optCascade.g2o.toFixed(1)}(eff ${optCascade.g2eff.toFixed(1)}) g3=${optCascade.g3b}`
  );
  console.log(`  15m Checkpoint    : g2Bought=${mid15.g2b} | g1Free=${mid15.g1Free.toFixed(1)} | effMetaShare=${mid15.effMetaPct}%`);
  console.log(`  Hybrid Desk       : ${hybrid.hours.toFixed(2)}h | breaks=${hybrid.breaks} | reached=${hybrid.reached}`);
  console.log(
    `  Sessioned Sched   : ${sessioned.wallHours.toFixed(2)}h wall (${sessioned.activeMin.toFixed(1)}m active) | ` +
    `purchases=[${sessioned.onlinePurchases.join(', ')}] | reached=${sessioned.reached} (end=${Math.round(sessioned.endRunTotal)})`
  );
  console.log(
    `  10m -> 8h Offline : ${Math.round(off8h.runTotalAfter10m)} -> ${Math.round(off8h.runTotalAfter8hOff)} (<1e6: ${off8h.runTotalAfter8hOff < 1e6})\n`
  );
}
