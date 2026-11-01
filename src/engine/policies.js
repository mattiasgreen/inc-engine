// src/engine/policies.js
// Pluggable decision-making policies for the Simulator

import { BigNum } from './bignum.js';
import { getDerivedStats } from './core.js';

export class PassivePolicy {
  decideAction() {
    return null; // Pure idle, no actions
  }
}

export class GreedyPolicy {
  decideAction(state, config) {
    const stats = getDerivedStats(state, config);
    let bestAction = null;
    let lowestCost = null;

    // Check generators across layers
    for (const layer of config.layers) {
      const layerState = state.layers[layer.id];
      if (!layerState) continue;

      let hasProdOrCurrency = layerState.currency.gt(0);
      if (!hasProdOrCurrency) {
        for (const gen of layer.generators || []) {
          if (layerState.generators[gen.id]?.owned.gt(0)) {
            hasProdOrCurrency = true;
            break;
          }
        }
      }
      if (!hasProdOrCurrency) continue;

      for (const gen of layer.generators || []) {
        if (gen.unlockThreshold && layerState.runTotalCurrency.lt(gen.unlockThreshold)) {
          continue;
        }
        const cost = stats.generatorCosts[layer.id][gen.id];
        if (cost && (!lowestCost || cost.lt(lowestCost))) {
          lowestCost = cost;
          bestAction = { type: 'buyGenerator', layerId: layer.id, id: gen.id, cost };
        }
      }

      // Check upgrades
      for (const upg of layer.upgrades || []) {
        if (upg.unlockThreshold && layerState.runTotalCurrency.lt(upg.unlockThreshold)) {
          continue;
        }
        const cost = stats.upgradeCosts[layer.id][upg.id];
        if (cost && (!lowestCost || cost.lt(lowestCost))) {
          lowestCost = cost;
          bestAction = { type: 'buyUpgrade', layerId: layer.id, id: upg.id, cost };
        }
      }
    }

    return bestAction;
  }
}

export class OptimalRoiPolicy {
  _estimateTotalCurrencyPowerPerSec(state, config, stats) {
    const layer0 = state.layers.layer0;
    const l0Config = config.layers[0];
    const ticksPerSec = stats.effectiveTicksPerSec;

    // Map each generator's effective currency value per unit per tick over a 220-tick strategic horizon
    const horizonTicks = 220;
    const unitCurrencyPerTick = {};

    // Pass 1: direct currency generators
    for (const gen of l0Config.generators || []) {
      const producesCurrency = !gen.produces || gen.produces === 'currency' || gen.produces.type === 'currency';
      if (producesCurrency) {
        unitCurrencyPerTick[gen.id] = stats.generatorOutputs.layer0[gen.id].toNumber();
      }
    }

    // Pass 2 & 3: metagenerators with quadratic and cubic cascade integration
    for (let pass = 0; pass < 3; pass++) {
      for (const gen of l0Config.generators || []) {
        if (gen.produces && gen.produces.type === 'generator') {
          const targetId = gen.produces.targetId;
          const targetVal = unitCurrencyPerTick[targetId] || 0;
          const rate = stats.generatorOutputs.layer0[gen.id].toNumber();
          unitCurrencyPerTick[gen.id] = rate * targetVal * (horizonTicks * 0.5);
        }
      }
    }

    let totalPowerPerSec = 0;
    for (const gen of l0Config.generators || []) {
      const owned = layer0.generators[gen.id]?.owned?.toNumber() || 0;
      const bought = layer0.generators[gen.id]?.bought?.toNumber() || 0;
      const effectiveUnits = Math.max(owned, bought);
      totalPowerPerSec += effectiveUnits * (unitCurrencyPerTick[gen.id] || 0) * ticksPerSec;
    }

    return { totalPowerPerSec, unitCurrencyPerTick };
  }

  decideAction(state, config) {
    const stats = getDerivedStats(state, config);
    const layer0 = state.layers.layer0;
    const l0Config = config.layers[0];
    let bestAction = null;
    let bestScore = -1;

    const currentProdPerTick = stats.layerProductionPerTick.layer0 || new BigNum(0);
    const currentProdPerSec = Math.max(0.1, currentProdPerTick.mul(stats.effectiveTicksPerSec).toNumber());
    const currentCurrency = layer0.currency.toNumber();
    const { totalPowerPerSec, unitCurrencyPerTick } = this._estimateTotalCurrencyPowerPerSec(state, config, stats);

    const evaluateCandidate = (action, costBig, deltaPowerPerSec) => {
      const costNum = costBig.toNumber();
      if (costNum <= 0 || deltaPowerPerSec <= 0) return;

      const deficit = Math.max(0, costNum - currentCurrency);
      const waitSec = deficit / currentProdPerSec;
      const paybackSec = costNum / deltaPowerPerSec;

      // Avoid saving for >10 minutes if faster stepping stones exist
      const waitPenalty = waitSec > 600 ? waitSec * 2.8 : waitSec * 1.25;
      const effectiveTimeCost = Math.max(0.01, waitPenalty + paybackSec);
      const score = 1 / effectiveTimeCost;

      if (score > bestScore) {
        bestScore = score;
        bestAction = action;
      }
    };

    // Check generators in Layer 0
    for (const gen of l0Config.generators || []) {
      if (gen.unlockThreshold && layer0.runTotalCurrency.lt(gen.unlockThreshold)) {
        continue;
      }

      const cost = stats.generatorCosts.layer0[gen.id];
      if (!cost) continue;

      const genState = layer0.generators[gen.id];
      const ownedNum = genState?.owned?.toNumber() || 0;
      const boughtNum = genState?.bought?.toNumber() || 0;
      const unitValPerSec = (unitCurrencyPerTick[gen.id] || stats.generatorOutputs.layer0[gen.id].toNumber()) * stats.effectiveTicksPerSec;

      // 1. Direct new unit + bought synergy boost on existing owned units
      const baseSynergy = gen.boughtSynergyMultiplier || l0Config.boughtSynergyMultiplier || 1.0;
      const synergyGain = Math.max(0, baseSynergy - 1) * ownedNum * unitValPerSec;
      let deltaPower = unitValPerSec + synergyGain;

      // 2. Milestone proximity look-ahead (e.g. approaching 25 bought for m1 Uncommon)
      const msInfo = stats.generatorMilestones?.layer0?.[gen.id];
      if (msInfo && msInfo.nextThreshold) {
        const remainingToMilestone = msInfo.nextThreshold - boughtNum;
        if (remainingToMilestone > 0 && remainingToMilestone <= 8) {
          const multRatio = Math.max(1, (msInfo.nextMultiplier || 3) / (msInfo.multiplier || 1));
          const futureUnits = Math.max(ownedNum + remainingToMilestone, msInfo.nextThreshold);
          const milestonePayoff = futureUnits * unitValPerSec * (multRatio - 1);
          deltaPower += milestonePayoff / remainingToMilestone;
        }
      }

      // First purchase of a newly unlocked generator gets an exploration priority boost
      if (boughtNum === 0) {
        deltaPower *= 3.5;
      }

      evaluateCandidate(
        { type: 'buyGenerator', layerId: 'layer0', id: gen.id, cost },
        cost,
        deltaPower
      );
    }

    // Check upgrades in Layer 0 by simulating level + 1 on state
    for (const upg of l0Config.upgrades || []) {
      if (upg.unlockThreshold && layer0.runTotalCurrency.lt(upg.unlockThreshold)) {
        continue;
      }
      const cost = stats.upgradeCosts.layer0[upg.id];
      if (!cost) continue;

      const currentLevel = layer0.upgrades[upg.id]?.level || 0;
      const hypoState = {
        ...state,
        layers: {
          ...state.layers,
          layer0: {
            ...layer0,
            upgrades: {
              ...layer0.upgrades,
              [upg.id]: { level: currentLevel + 1 }
            }
          }
        }
      };

      const hypoStats = getDerivedStats(hypoState, config);
      const { totalPowerPerSec: nextPowerPerSec } = this._estimateTotalCurrencyPowerPerSec(hypoState, config, hypoStats);
      let deltaPower = Math.max(0.01, nextPowerPerSec - totalPowerPerSec);

      if (upg.effect?.target === 'generatorPeriod') {
        deltaPower = Math.max(deltaPower, totalPowerPerSec * 0.40);
      } else if (upg.effect?.target === 'costScaling') {
        deltaPower = Math.max(deltaPower, totalPowerPerSec * 0.45);
      }

      evaluateCandidate(
        { type: 'buyUpgrade', layerId: 'layer0', id: upg.id, cost },
        cost,
        deltaPower
      );
    }

    return bestAction;
  }
}

export class AutoPrestigePolicy extends OptimalRoiPolicy {
  constructor(options = {}) {
    super();
    this.prestigeLayerId = options.prestigeLayerId || 'layer1';
    this.minReward = options.minReward ? BigNum.from(options.minReward) : new BigNum(1);
  }

  decideAction(state, config) {
    const stats = getDerivedStats(state, config);
    const reward = stats.prestigeRewards[this.prestigeLayerId];
    if (reward && reward.gte(this.minReward)) {
      return { type: 'resetLayer', layerId: this.prestigeLayerId, cost: new BigNum(0) };
    }
    return super.decideAction(state, config);
  }
}

export class SemiOptimalPolicy extends OptimalRoiPolicy {
  constructor(options = {}) {
    super();
    this.reactionLagMs = options.reactionLagMs ?? 45000;
    this.offlineBreaksTaken = 0;
    this.maxOfflineBreaks = options.maxOfflineBreaks ?? 3;
    this.offlineBreakDurationMs = options.offlineBreakDurationMs ?? 50 * 60 * 1000;
    this.actionCount = 0;
  }

  decideAction(state, config) {
    this.actionCount++;
    const stats = getDerivedStats(state, config);
    const l0 = state.layers.layer0;

    // Simulate human player occasionally preferring visible generator purchases over math-optimal upgrades
    if (this.actionCount % 3 === 0) {
      for (const gen of config.layers[0].generators) {
        const cost = stats.generatorCosts.layer0[gen.id];
        if (cost && l0.currency.gte(cost) && (!gen.unlockThreshold || l0.runTotalCurrency.gte(gen.unlockThreshold))) {
          return { type: 'buyGenerator', layerId: 'layer0', id: gen.id, cost, delayMs: this.reactionLagMs };
        }
      }
    }

    const action = super.decideAction(state, config);
    if (!action) return null;

    let delayMs = this.reactionLagMs;
    const runTotal = l0?.runTotalCurrency?.toNumber() || 0;
    if (this.offlineBreaksTaken === 0 && runTotal >= 20000 && this.maxOfflineBreaks >= 1) {
      this.offlineBreaksTaken++;
      delayMs += this.offlineBreakDurationMs;
    } else if (this.offlineBreaksTaken === 1 && runTotal >= 100000 && this.maxOfflineBreaks >= 2) {
      this.offlineBreaksTaken++;
      delayMs += this.offlineBreakDurationMs;
    } else if (this.offlineBreaksTaken === 2 && runTotal >= 350000 && this.maxOfflineBreaks >= 3) {
      this.offlineBreaksTaken++;
      delayMs += this.offlineBreakDurationMs;
    }

    return {
      ...action,
      delayMs
    };
  }
}
