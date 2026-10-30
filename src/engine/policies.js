// src/engine/policies.js
// Pluggable decision-making policies for the Simulator

import { BigNum } from './bignum.js';
import { getDerivedStats } from './core.js';

export class GreedyPolicy {
  decideAction(state, config) {
    const stats = getDerivedStats(state, config);
    let bestAction = null;
    let lowestCost = null;

    // Check generators across layers
    for (const layer of config.layers) {
      const layerState = state.layers[layer.id];
      if (!layerState) continue;

      // Skip layers with 0 currency and 0 generators (e.g. unreached prestige layers)
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
    let bestScore = -Infinity; // Higher output gain per cost unit

    // Baseline current production per sec in layer 0
    let currentProdPerTick = new BigNum(0);
    for (const gen of config.layers[0].generators || []) {
      const owned = layer0.generators[gen.id].owned;
      if (owned.gt(0)) {
        currentProdPerTick = currentProdPerTick.add(owned.mul(stats.generatorOutputs.layer0[gen.id]));
      }
    }
    const currentProdPerSec = currentProdPerTick.mul(stats.effectiveTicksPerSec).toNumber();

    // Check generators in Layer 0
    for (const gen of config.layers[0].generators || []) {
      // If locked, skip
      if (gen.unlockThreshold && layer0.runTotalCurrency.lt(gen.unlockThreshold)) {
        continue;
      }

      const cost = stats.generatorCosts.layer0[gen.id];
      const rate = stats.generatorOutputs.layer0[gen.id];
      const deltaProdPerSec = rate.mul(stats.effectiveTicksPerSec).toNumber();
      const costNum = cost.toNumber();
      const roi = costNum > 0 ? (deltaProdPerSec / costNum) : 1e9;

      if (roi > bestScore) {
        bestScore = roi;
        bestAction = { type: 'buyGenerator', layerId: 'layer0', id: gen.id, cost };
      }
    }

    // Check upgrades in Layer 0
    for (const upg of config.layers[0].upgrades || []) {
      const cost = stats.upgradeCosts.layer0[upg.id];
      if (!cost) continue; // maxed

      let estimatedDeltaSec = 0;
      if (upg.effect.target === 'cycleFrequency') {
        const newFreq = stats.cycleFrequencyMultiplier * upg.effect.value;
        const newEffectiveDuration = config.clock.baseCycleDurationMs / newFreq;
        const newTicksPerSec = (1000 / newEffectiveDuration) * stats.tickYieldPerCycle.toNumber();
        estimatedDeltaSec = currentProdPerTick.mul(newTicksPerSec).toNumber() - currentProdPerSec;
      } else if (upg.effect.target === 'tickYield') {
        let newTickYield = stats.tickYieldPerCycle;
        if (upg.effect.operation === 'multiply') {
          newTickYield = newTickYield.mul(upg.effect.value);
        } else if (upg.effect.operation === 'add') {
          newTickYield = newTickYield.add(upg.effect.value);
        }
        const newTicksPerSec = (1000 / stats.effectiveCycleDurationMs) * newTickYield.toNumber();
        estimatedDeltaSec = currentProdPerTick.mul(newTicksPerSec).toNumber() - currentProdPerSec;
      } else if (upg.effect.target === 'generator') {
        const genId = upg.effect.targetId;
        const owned = layer0.generators[genId].owned;
        if (owned.gt(0)) {
          const currentGenOut = stats.generatorOutputs.layer0[genId];
          const newGenOut = currentGenOut.mul(upg.effect.value);
          const deltaOut = newGenOut.sub(currentGenOut);
          estimatedDeltaSec = owned.mul(deltaOut).mul(stats.effectiveTicksPerSec).toNumber();
        }
      }

      const costNum = cost.toNumber();
      const roi = costNum > 0 ? (Math.max(0.01, estimatedDeltaSec) / costNum) : 0;
      if (roi > bestScore) {
        bestScore = roi;
        bestAction = { type: 'buyUpgrade', layerId: 'layer0', id: upg.id, cost };
      }
    }

    return bestAction;
  }
}
