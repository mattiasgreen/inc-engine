// src/engine/policies.js
// Pluggable decision-making policies for the Simulator

import { BigNum } from './bignum.js';
import { getDerivedStats, computeBayEffectiveOwned } from './core.js';

export const DEFAULT_SESSION_SCHEDULE = [
  { type: 'online', durationMs: 10 * 60 * 1000, label: 'Session 1 (10m)' },
  { type: 'offline', durationMs: 60 * 60 * 1000, label: 'Away 1 (60m)' },
  { type: 'online', durationMs: 5 * 60 * 1000, label: 'Session 2 (5m)' },
  { type: 'offline', durationMs: 90 * 60 * 1000, label: 'Away 2 (90m)' },
  { type: 'online', durationMs: 10 * 60 * 1000, label: 'Session 3 (10m)' }
];

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
  constructor(options = {}) {
    this.preferredDoctrine = options.preferredDoctrine || null;
    this.useActiveAgency = options.useActiveAgency ?? true;
    this.maxWaitChunkMs = options.maxWaitChunkMs ?? 20000;
    this.reactionLagMs = options.reactionLagMs ?? 0;
  }

  prepareForOffline(state, config) {
    const l0Config = config.layers[0];
    const layer0 = state.layers.layer0;
    if (!l0Config?.stances?.some(s => s.id === 'cascade') || !layer0) return null;
    const gen2Owned = layer0.generators.gen2?.owned?.toNumber() || 0;
    const desired = gen2Owned >= 1 ? 'cascade' : (l0Config.defaultStanceId || 'balanced');
    if (layer0.stanceId !== desired) {
      return { type: 'setStance', layerId: 'layer0', stanceId: desired, cost: new BigNum(0) };
    }
    return null;
  }

  _decideActiveAgency(state, config, stats) {
    if (!this.useActiveAgency) return null;
    const l0Config = config.layers[0];
    const layer0 = state.layers.layer0;
    if (!l0Config || !layer0) return null;

    const totalOwned = Object.values(layer0.generators || {}).reduce(
      (sum, g) => sum + (g.owned?.toNumber() || 0),
      0
    );
    if (totalOwned <= 0) return null;

    const capStats = stats.capacitorStats?.layer0;
    const runTotal = layer0.runTotalCurrency?.toNumber() || 0;

    if (capStats) {
      if (capStats.canPulse) {
        return { type: 'triggerPulse', layerId: 'layer0', cost: new BigNum(0) };
      }
      if (capStats.canDischarge) {
        const thresholdToPop = runTotal >= 600000 ? capStats.minDischargeCharge : 0.90;
        if (capStats.charge >= thresholdToPop) {
          return { type: 'dischargeCapacitor', layerId: 'layer0', cost: new BigNum(0) };
        }
      }
    }

    if (l0Config.stances && l0Config.stances.length > 0) {
      const hasExtraction = l0Config.stances.some(s => s.id === 'extraction');
      const hasCascade = l0Config.stances.some(s => s.id === 'cascade');
      const gen1Owned = layer0.generators.gen1?.owned?.toNumber() || 0;
      const gen2Owned = layer0.generators.gen2?.owned?.toNumber() || 0;
      const g1Overflow = stats.bayOverflowRatios?.layer0?.gen1 || 0;
      const isSurge = Boolean(capStats?.isSurgeActive);

      let desiredStance = l0Config.defaultStanceId || 'balanced';
      if ((isSurge || runTotal >= 720000) && hasExtraction && gen1Owned >= 4) {
        desiredStance = 'extraction';
      } else if (hasCascade && gen2Owned >= 1 && !isSurge && runTotal < 720000 && g1Overflow < 0.85) {
        desiredStance = 'cascade';
      }

      if (layer0.stanceId !== desiredStance && l0Config.stances.some(s => s.id === desiredStance)) {
        return { type: 'setStance', layerId: 'layer0', stanceId: desiredStance, cost: new BigNum(0) };
      }
    }

    return null;
  }

  _estimateTotalCurrencyPowerPerSec(state, config, stats) {
    const layer0 = state.layers.layer0;
    const l0Config = config.layers[0];
    const ticksPerSec = stats.effectiveTicksPerSec;

    const horizonSec = 480;
    const horizonTicks = Math.max(16, horizonSec * ticksPerSec);
    const halfHorizonTicks = horizonTicks * 0.5;
    const thirdHorizonTicks = horizonTicks / 3;
    const unitCurrencyPerTick = {};

    // Pass 1: direct currency generators
    for (const gen of l0Config.generators || []) {
      const producesCurrency = !gen.produces || gen.produces === 'currency' || gen.produces.type === 'currency';
      if (producesCurrency) {
        unitCurrencyPerTick[gen.id] = stats.generatorOutputs.layer0[gen.id].toNumber();
      }
    }

    // Pass 2 & 3: metagenerator equivalent rate metadata for reference
    for (let pass = 0; pass < 3; pass++) {
      for (const gen of l0Config.generators || []) {
        if (gen.produces && gen.produces.type === 'generator') {
          const targetId = gen.produces.targetId;
          const targetVal = unitCurrencyPerTick[targetId] || 0;
          const rate = stats.generatorOutputs.layer0[gen.id].toNumber();
          unitCurrencyPerTick[gen.id] = rate * targetVal * halfHorizonTicks;
        }
      }
    }

    // Top-down cascade projection through Bay Capacity without double-counting metagenerator value
    const effMidByGen = {};
    const inflowFromHigher = {};
    const gensRev = [...(l0Config.generators || [])].reverse();
    for (const gen of gensRev) {
      const owned = layer0.generators[gen.id]?.owned?.toNumber() || 0;
      const bought = layer0.generators[gen.id]?.bought?.toNumber() || 0;
      const projectedOwned = owned + (inflowFromHigher[gen.id] || 0);
      const bayCap = stats.bayCapacities?.layer0?.[gen.id] ?? Infinity;
      const effMid = Number.isFinite(bayCap)
        ? computeBayEffectiveOwned(new BigNum(bought), new BigNum(projectedOwned), bayCap).toNumber()
        : Math.max(projectedOwned, bought);
      effMidByGen[gen.id] = effMid;

      if (gen.produces && gen.produces.type === 'generator') {
        const rate = stats.generatorOutputs.layer0[gen.id].toNumber();
        const tid = gen.produces.targetId;
        const targetGen = l0Config.generators.find(g => g.id === tid);
        const targetIsMeta = targetGen?.produces && targetGen.produces.type === 'generator';
        const spanTicks = targetIsMeta ? thirdHorizonTicks : halfHorizonTicks;
        inflowFromHigher[tid] = (inflowFromHigher[tid] || 0) + effMid * rate * spanTicks;
      }
    }

    let totalPowerPerSec = 0;
    for (const gen of l0Config.generators || []) {
      const producesCurrency = !gen.produces || gen.produces === 'currency' || gen.produces.type === 'currency';
      if (producesCurrency) {
        totalPowerPerSec += (effMidByGen[gen.id] || 0) * (unitCurrencyPerTick[gen.id] || 0) * ticksPerSec;
      }
    }

    // Factor in amortized Surge duty-cycle value so surgeMultiplier upgrades score organically
    const cap = l0Config.capacitor;
    if (cap) {
      const surgeBonusMult = stats.surgeBonusMultipliers?.layer0 || 1.0;
      const effSurgeMult = (cap.surgeMultiplier || 1.0) * surgeBonusMult;
      const effSurgeTickMult = cap.surgeTickMult || 1;
      const effSurgeFreqMult = cap.surgeCycleFreqMult || 1.0;
      const ovBonus = stats.capacitorStats?.layer0?.overflowBonus || 0;
      const chargeRate = (cap.passiveChargePerTick || 0) * (1 + ovBonus);
      const maxTicks = cap.maxSurgeTicks || 16;
      const dutyCycle = Math.min(0.45, chargeRate * maxTicks);
      const surgeBoost = Math.max(0, effSurgeMult * effSurgeTickMult * effSurgeFreqMult - 1);
      totalPowerPerSec *= (1 + dutyCycle * surgeBoost);
    }

    return { totalPowerPerSec, unitCurrencyPerTick };
  }

  _buildNeutralRefState(state, config) {
    const l0Config = config.layers[0];
    const layer0 = state.layers.layer0;
    const defaultStance = l0Config?.defaultStanceId || 'balanced';
    if (layer0.stanceId === defaultStance && (layer0.surgeTicksRemaining || 0) === 0) {
      return state;
    }
    return {
      ...state,
      layers: {
        ...state.layers,
        layer0: {
          ...layer0,
          stanceId: defaultStance,
          surgeTicksRemaining: 0
        }
      }
    };
  }

  _selectEconomicAction(state, config) {
    const refState = this._buildNeutralRefState(state, config);
    const refStats = getDerivedStats(refState, config);
    const liveStats = refState === state ? refStats : getDerivedStats(state, config);
    const layer0 = state.layers.layer0;
    const l0Config = config.layers[0];
    let bestAction = null;
    let bestScore = -1;

    const liveProdPerTick = liveStats.layerProductionPerTick.layer0 || new BigNum(0);
    const currentProdPerSec = Math.max(0.1, liveProdPerTick.mul(liveStats.effectiveTicksPerSec).toNumber());
    const currentCurrency = layer0.currency.toNumber();
    const { totalPowerPerSec } = this._estimateTotalCurrencyPowerPerSec(refState, config, refStats);

    const evaluateCandidate = (action, costBig, deltaPowerPerSec) => {
      const costNum = costBig.toNumber();
      if (costNum <= 0 || deltaPowerPerSec <= 0) return;

      const deficit = Math.max(0, costNum - currentCurrency);
      const waitSec = deficit / currentProdPerSec;
      const paybackSec = costNum / deltaPowerPerSec;

      const waitPenalty = waitSec > 300 ? waitSec * 2.8 : waitSec * 1.25;
      const effectiveTimeCost = Math.max(0.01, waitPenalty + paybackSec);
      const score = 1 / effectiveTimeCost;

      if (score > bestScore) {
        bestScore = score;
        bestAction = {
          ...action,
          estimatedWaitSec: waitSec
        };
      }
    };

    // Check generators in Layer 0
    for (const gen of l0Config.generators || []) {
      if (gen.unlockThreshold && layer0.runTotalCurrency.lt(gen.unlockThreshold)) {
        continue;
      }

      const cost = liveStats.generatorCosts.layer0[gen.id];
      if (!cost) continue;

      const genState = layer0.generators[gen.id];
      const boughtNum = genState?.bought?.toNumber() || 0;
      const hypoGenState = {
        ...refState,
        layers: {
          ...refState.layers,
          layer0: {
            ...refState.layers.layer0,
            generators: {
              ...refState.layers.layer0.generators,
              [gen.id]: {
                ...genState,
                bought: new BigNum(boughtNum + 1),
                owned: (genState?.owned || new BigNum(0)).add(1)
              }
            }
          }
        }
      };

      const hypoStats = getDerivedStats(hypoGenState, config);
      const { totalPowerPerSec: nextPowerPerSec } = this._estimateTotalCurrencyPowerPerSec(hypoGenState, config, hypoStats);
      let deltaPower = Math.max(0.01, nextPowerPerSec - totalPowerPerSec);

      // Milestone proximity look-ahead
      const msInfo = refStats.generatorMilestones?.layer0?.[gen.id];
      if (msInfo && msInfo.nextThreshold) {
        const remainingToMilestone = msInfo.nextThreshold - boughtNum;
        if (remainingToMilestone > 0 && remainingToMilestone <= 5) {
          const multRatio = Math.max(1, (msInfo.nextMultiplier || 2) / (msInfo.multiplier || 1));
          const ownedNum = refStats.bayEffectiveOwned?.layer0?.[gen.id]?.toNumber() || genState?.owned?.toNumber() || 0;
          const futureUnits = Math.max(ownedNum + remainingToMilestone, msInfo.nextThreshold);
          deltaPower += (futureUnits * deltaPower * (multRatio - 1)) / remainingToMilestone;
        }
      }

      if (boughtNum === 0) {
        deltaPower *= 1.25;
      }

      evaluateCandidate(
        { type: 'buyGenerator', layerId: 'layer0', id: gen.id, cost },
        cost,
        deltaPower
      );
    }

    // Check upgrades in Layer 0 by simulating level + 1 cleanly from getDerivedStats
    for (const upg of l0Config.upgrades || []) {
      if (this.preferredDoctrine === 'surge' && upg.id === 'upg_doctrine_cascade') continue;
      if (this.preferredDoctrine === 'cascade' && upg.id === 'upg_doctrine_surge') continue;
      if (upg.unlockThreshold && layer0.runTotalCurrency.lt(upg.unlockThreshold)) {
        continue;
      }
      const cost = liveStats.upgradeCosts.layer0[upg.id];
      if (!cost) continue;

      const currentLevel = layer0.upgrades[upg.id]?.level || 0;
      const hypoState = {
        ...refState,
        layers: {
          ...refState.layers,
          layer0: {
            ...refState.layers.layer0,
            upgrades: {
              ...refState.layers.layer0.upgrades,
              [upg.id]: { level: currentLevel + 1 }
            }
          }
        }
      };

      const hypoStats = getDerivedStats(hypoState, config);
      const { totalPowerPerSec: nextPowerPerSec } = this._estimateTotalCurrencyPowerPerSec(hypoState, config, hypoStats);
      const deltaPower = Math.max(0.01, nextPowerPerSec - totalPowerPerSec);

      evaluateCandidate(
        { type: 'buyUpgrade', layerId: 'layer0', id: upg.id, cost },
        cost,
        deltaPower
      );
    }

    if (bestAction && this.reactionLagMs > 0) {
      bestAction.reactionLagMs = this.reactionLagMs;
    }
    return bestAction;
  }

  decideAction(state, config) {
    const liveStats = getDerivedStats(state, config);
    const agencyAction = this._decideActiveAgency(state, config, liveStats);
    if (agencyAction) return agencyAction;
    return this._selectEconomicAction(state, config);
  }
}

export class AutoPrestigePolicy extends OptimalRoiPolicy {
  constructor(options = {}) {
    super(options);
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

export class HybridDeskPolicy extends OptimalRoiPolicy {
  constructor(options = {}) {
    super({
      maxWaitChunkMs: options.maxWaitChunkMs ?? 20000,
      reactionLagMs: options.reactionLagMs ?? 12000,
      ...options
    });
    this.patienceThresholdSec = options.patienceThresholdSec ?? 105;
    this.offlineBreaksTaken = 0;
    this.maxOfflineBreaks = options.maxOfflineBreaks ?? 3;
    this.offlineBreakDurationMs = options.offlineBreakDurationMs ?? 28 * 60 * 1000;
    this.minBreakIntervalMs = options.minBreakIntervalMs ?? 8 * 60 * 1000;
    this.lastBreakSimulatedMs = -Infinity;
    this.actionCount = 0;
  }

  decideAction(state, config, context = {}) {
    const stats = getDerivedStats(state, config);
    const agency = this._decideActiveAgency(state, config, stats);
    if (agency) return agency;

    const action = this._selectEconomicAction(state, config);
    if (!action) return null;

    this.actionCount++;
    const simulatedMs = context.simulatedMs || 0;
    const waitSec = action.estimatedWaitSec || 0;

    if (
      waitSec > this.patienceThresholdSec &&
      this.offlineBreaksTaken < this.maxOfflineBreaks &&
      simulatedMs - this.lastBreakSimulatedMs >= this.minBreakIntervalMs
    ) {
      this.offlineBreaksTaken++;
      this.lastBreakSimulatedMs = simulatedMs;
      return {
        type: 'offlineBreak',
        layerId: 'layer0',
        cost: new BigNum(0),
        delayMs: this.offlineBreakDurationMs,
        prepareAction: this.prepareForOffline(state, config)
      };
    }

    return action;
  }
}

export class SemiOptimalPolicy extends HybridDeskPolicy {}

export class SessionedPlayPolicy extends OptimalRoiPolicy {
  constructor(options = {}) {
    super({
      reactionLagMs: options.reactionLagMs ?? 4000,
      maxWaitChunkMs: options.maxWaitChunkMs ?? 20000,
      ...options
    });
  }
}
