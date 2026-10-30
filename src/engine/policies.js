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
  decideAction(state, config) {
    const stats = getDerivedStats(state, config);
    const layer0 = state.layers.layer0;
    let bestAction = null;
    let bestRoi = null; // BigNum: deltaOutputPerSec / cost

    const currentProdPerTick = stats.layerProductionPerTick.layer0 || new BigNum(0);
    const currentProdPerSec = currentProdPerTick.mul(stats.effectiveTicksPerSec);

    // Check generators in Layer 0
    for (const gen of config.layers[0].generators || []) {
      if (gen.unlockThreshold && layer0.runTotalCurrency.lt(gen.unlockThreshold)) {
        continue;
      }

      const cost = stats.generatorCosts.layer0[gen.id];
      const rate = stats.generatorOutputs.layer0[gen.id];
      const deltaProdPerSec = rate.mul(stats.effectiveTicksPerSec);
      const roi = cost.gt(0) ? deltaProdPerSec.div(cost) : new BigNum(1e9);

      if (!bestRoi || roi.gt(bestRoi)) {
        bestRoi = roi;
        bestAction = { type: 'buyGenerator', layerId: 'layer0', id: gen.id, cost };
      }
    }

    // Check upgrades in Layer 0
    for (const upg of config.layers[0].upgrades || []) {
      if (upg.unlockThreshold && layer0.runTotalCurrency.lt(upg.unlockThreshold)) {
        continue;
      }
      const cost = stats.upgradeCosts.layer0[upg.id];
      if (!cost) continue; // maxed or locked

      let estimatedDeltaSec = new BigNum(0.01);
      if (upg.effect.target === 'cycleFrequency') {
        const newFreq = stats.cycleFrequencyMultiplier * upg.effect.value;
        const newEffectiveDuration = config.clock.baseCycleDurationMs / newFreq;
        const newTicksPerSec = (1000 / newEffectiveDuration) * stats.tickYieldPerCycle.toNumber();
        const newProdSec = currentProdPerTick.mul(newTicksPerSec);
        if (newProdSec.gt(currentProdPerSec)) {
          estimatedDeltaSec = newProdSec.sub(currentProdPerSec);
        }
      } else if (upg.effect.target === 'tickYield') {
        let newTickYield = stats.tickYieldPerCycle;
        if (upg.effect.operation === 'multiply') {
          newTickYield = newTickYield.mul(upg.effect.value);
        } else if (upg.effect.operation === 'add') {
          newTickYield = newTickYield.add(upg.effect.value);
        }
        const newTicksPerSec = (1000 / stats.effectiveCycleDurationMs) * newTickYield.toNumber();
        const newProdSec = currentProdPerTick.mul(newTicksPerSec);
        if (newProdSec.gt(currentProdPerSec)) {
          estimatedDeltaSec = newProdSec.sub(currentProdPerSec);
        }
      } else if (upg.effect.target === 'generator') {
        const genId = upg.effect.targetId;
        const owned = layer0.generators[genId].owned;
        if (owned.gt(0)) {
          const currentGenOut = stats.generatorOutputs.layer0[genId];
          const newGenOut = currentGenOut.mul(upg.effect.value);
          const deltaOut = newGenOut.sub(currentGenOut);
          estimatedDeltaSec = owned.mul(deltaOut).mul(stats.effectiveTicksPerSec);
        }
      }

      const roi = cost.gt(0) ? estimatedDeltaSec.div(cost) : new BigNum(0);
      if (!bestRoi || roi.gt(bestRoi)) {
        bestRoi = roi;
        bestAction = { type: 'buyUpgrade', layerId: 'layer0', id: upg.id, cost };
      }
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
