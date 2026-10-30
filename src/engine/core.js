// src/engine/core.js
// Pure Functional Core for inc-engine

import { BigNum } from './bignum.js';

export function createInitialState(config) {
  const state = {
    cycleRemainderMs: 0,
    totalCycles: new BigNum(0),
    totalTicks: new BigNum(0),
    layers: {}
  };

  for (const layer of config.layers) {
    const layerState = {
      currency: new BigNum(layer.currency.initialAmount || 0),
      runTotalCurrency: new BigNum(layer.currency.initialAmount || 0),
      totalLifetimeCurrency: new BigNum(layer.currency.initialAmount || 0),
      ticksInLayer: new BigNum(0),
      generators: {},
      upgrades: {}
    };

    for (const gen of layer.generators || []) {
      layerState.generators[gen.id] = {
        owned: new BigNum(0)
      };
    }

    for (const upg of layer.upgrades || []) {
      layerState.upgrades[upg.id] = {
        level: 0
      };
    }

    state.layers[layer.id] = layerState;
  }

  return enforceProgressionInvariant(state, config);
}

export function enforceProgressionInvariant(state, config) {
  const layer0Config = config.layers[0];
  const layer0State = state.layers[layer0Config.id];
  if (!layer0State) return state;

  let totalOwned = 0;
  for (const gen of layer0Config.generators || []) {
    totalOwned += layer0State.generators[gen.id]?.owned.toNumber() || 0;
  }

  const minCost = layer0Config.generators[0]?.baseCost || 10;
  if (totalOwned === 0 && layer0State.currency.lt(minCost)) {
    return {
      ...state,
      layers: {
        ...state.layers,
        [layer0Config.id]: {
          ...layer0State,
          currency: new BigNum(minCost)
        }
      }
    };
  }
  return state;
}

export function getDerivedStats(state, config) {
  let cycleFreqMult = 1.0;
  let baseTickYield = new BigNum(config.clock.baseTicksPerCycle || 1);
  let tickYieldAdd = new BigNum(0);
  let tickYieldMult = new BigNum(1);

  const layerMultipliers = {};
  const costScalingReductions = {};

  for (const layer of config.layers) {
    layerMultipliers[layer.id] = new BigNum(1.0);
    costScalingReductions[layer.id] = 0;
  }

  // Calculate passive prestige multipliers
  for (const layer of config.layers) {
    if (layer.prestige) {
      const targetId = layer.prestige.targetLayerId;
      const unspent = state.layers[layer.id]?.currency || new BigNum(0);
      const mult = BigNum.from(layer.prestige.passiveMultiplierFormula(unspent));
      layerMultipliers[targetId] = layerMultipliers[targetId].mul(mult);
    }
  }

  // Tally upgrade effects
  for (const layer of config.layers) {
    const layerState = state.layers[layer.id];
    for (const upg of layer.upgrades || []) {
      const level = layerState?.upgrades[upg.id]?.level || 0;
      if (level <= 0) continue;

      const eff = upg.effect;
      if (eff.target === 'cycleFrequency') {
        if (eff.operation === 'multiply') {
          cycleFreqMult *= Math.pow(eff.value, level);
        }
      } else if (eff.target === 'tickYield') {
        if (eff.operation === 'multiply') {
          tickYieldMult = tickYieldMult.mul(Math.pow(eff.value, level));
        } else if (eff.operation === 'add') {
          tickYieldAdd = tickYieldAdd.add(eff.value * level);
        }
      } else if (eff.target === 'layerGenerators') {
        if (eff.operation === 'multiply') {
          const targetLayer = eff.targetId;
          layerMultipliers[targetLayer] = layerMultipliers[targetLayer].mul(Math.pow(eff.value, level));
        }
      } else if (eff.target === 'costScaling') {
        const targetLayer = eff.targetId || layer.id;
        if (eff.operation === 'subtract' || eff.operation === 'add') {
          costScalingReductions[targetLayer] += eff.value * level;
        }
      }
    }
  }

  const effectiveCycleDurationMs = config.clock.baseCycleDurationMs / cycleFreqMult;
  const tickYieldPerCycle = baseTickYield.add(tickYieldAdd).mul(tickYieldMult);
  const effectiveTicksPerSec = (1000 / effectiveCycleDurationMs) * tickYieldPerCycle.toNumber();

  const generatorOutputs = {};
  const generatorCosts = {};
  const maxAffordable = {};
  const layerProductionPerTick = {};

  for (const layer of config.layers) {
    generatorOutputs[layer.id] = {};
    generatorCosts[layer.id] = {};
    maxAffordable[layer.id] = {};
    layerProductionPerTick[layer.id] = new BigNum(0);

    const layerState = state.layers[layer.id];
    const layerMult = layerMultipliers[layer.id];
    const costReduction = costScalingReductions[layer.id] || 0;

    for (const gen of layer.generators || []) {
      const owned = layerState.generators[gen.id].owned;
      let genMult = layerMult;

      // Check generator specific upgrades
      for (const upg of layer.upgrades || []) {
        const level = layerState?.upgrades[upg.id]?.level || 0;
        if (level > 0 && upg.effect.target === 'generator' && upg.effect.targetId === gen.id) {
          if (upg.effect.operation === 'multiply') {
            genMult = genMult.mul(Math.pow(upg.effect.value, level));
          }
        }
      }

      const unitOutput = BigNum.from(gen.baseOutputPerTick).mul(genMult);
      generatorOutputs[layer.id][gen.id] = unitOutput;

      if (owned.gt(0)) {
        layerProductionPerTick[layer.id] = layerProductionPerTick[layer.id].add(owned.mul(unitOutput));
      }

      // Effective cost growth
      const r = Math.max(1.01, gen.costGrowth - costReduction);
      // Cost: baseCost * (r ^ owned)
      const rBig = new BigNum(r);
      const cost1 = BigNum.from(gen.baseCost).mul(rBig.pow(owned));
      generatorCosts[layer.id][gen.id] = cost1;

      // Max affordable calculation
      const budget = layerState.currency;
      if (budget.lt(cost1)) {
        maxAffordable[layer.id][gen.id] = { count: 0, totalCost: new BigNum(0) };
      } else if (r === 1) {
        const count = budget.div(cost1).floor().toNumber();
        maxAffordable[layer.id][gen.id] = { count, totalCost: cost1.mul(count) };
      } else {
        const num = budget.mul(r - 1).div(cost1).toNumber();
        const k = Math.floor(Math.log(1 + num) / Math.log(r));
        if (k <= 0) {
          maxAffordable[layer.id][gen.id] = { count: 0, totalCost: new BigNum(0) };
        } else {
          const totalCost = cost1.mul(Math.pow(r, k) - 1).div(r - 1);
          maxAffordable[layer.id][gen.id] = { count: k, totalCost };
        }
      }
    }
  }

  const upgradeCosts = {};
  for (const layer of config.layers) {
    upgradeCosts[layer.id] = {};
    const layerState = state.layers[layer.id];
    for (const upg of layer.upgrades || []) {
      const isLocked = upg.unlockThreshold && layerState.runTotalCurrency.lt(upg.unlockThreshold);
      const level = layerState.upgrades[upg.id]?.level || 0;
      if (isLocked) {
        upgradeCosts[layer.id][upg.id] = null; // Locked
      } else if (level >= (upg.maxLevel || Infinity)) {
        upgradeCosts[layer.id][upg.id] = null; // Maxed
      } else {
        const growth = upg.costGrowth || 1;
        upgradeCosts[layer.id][upg.id] = BigNum.from(upg.baseCost).mul(Math.pow(growth, level));
      }
    }
  }

  const prestigeRewards = {};
  for (const layer of config.layers) {
    if (layer.prestige) {
      const targetState = state.layers[layer.prestige.targetLayerId];
      const runTotal = targetState?.runTotalCurrency || new BigNum(0);
      prestigeRewards[layer.id] = BigNum.from(layer.prestige.rewardFormula(runTotal));
    }
  }

  return {
    cycleFrequencyMultiplier: cycleFreqMult,
    effectiveCycleDurationMs,
    tickYieldPerCycle,
    effectiveTicksPerSec,
    layerMultipliers,
    generatorOutputs,
    generatorCosts,
    maxAffordable,
    upgradeCosts,
    prestigeRewards,
    layerProductionPerTick
  };
}

export function advanceTicks(state, config, ticks) {
  const tickCount = BigNum.from(ticks);
  if (tickCount.lte(0)) return state;

  const stats = getDerivedStats(state, config);
  const nextLayers = {};

  for (const layer of config.layers) {
    const prevLayer = state.layers[layer.id];
    const ratePerTick = stats.layerProductionPerTick[layer.id] || new BigNum(0);
    const netProduced = ratePerTick.mul(tickCount);

    nextLayers[layer.id] = {
      ...prevLayer,
      currency: prevLayer.currency.add(netProduced),
      runTotalCurrency: prevLayer.runTotalCurrency.add(netProduced),
      totalLifetimeCurrency: prevLayer.totalLifetimeCurrency.add(netProduced),
      ticksInLayer: prevLayer.ticksInLayer.add(tickCount)
    };
  }

  return {
    ...state,
    totalTicks: state.totalTicks.add(tickCount),
    layers: nextLayers
  };
}

export function advanceTime(state, config, elapsedMs, options = {}) {
  if (elapsedMs <= 0) {
    return {
      nextState: state,
      report: {
        elapsedMs: 0,
        cyclesFired: new BigNum(0),
        ticksEmitted: new BigNum(0),
        currencyDeltas: {}
      }
    };
  }

  const stats = getDerivedStats(state, config);
  const cycleDuration = stats.effectiveCycleDurationMs;
  const totalMs = state.cycleRemainderMs + elapsedMs;

  const cyclesFiredCount = Math.floor(totalMs / cycleDuration);
  const nextRemainderMs = totalMs % cycleDuration;
  const cyclesFired = new BigNum(cyclesFiredCount);

  let nextState = {
    ...state,
    cycleRemainderMs: nextRemainderMs,
    totalCycles: state.totalCycles.add(cyclesFired)
  };

  let ticksEmitted = new BigNum(0);
  const currencyDeltas = {};

  if (cyclesFiredCount > 0) {
    const isChunked = options.mode === 'chunked' || Boolean(config.irreducible);
    const beforeState = nextState;

    if (isChunked && cyclesFiredCount > 1) {
      const maxSlices = options.maxSlices || 1000;
      const sliceCount = Math.min(cyclesFiredCount, maxSlices);
      const cyclesPerSlice = Math.floor(cyclesFiredCount / sliceCount);
      let remaining = cyclesFiredCount;

      for (let s = 0; s < sliceCount; s++) {
        const sliceCycles = (s === sliceCount - 1) ? remaining : cyclesPerSlice;
        remaining -= sliceCycles;
        const sliceTicks = stats.tickYieldPerCycle.mul(sliceCycles);
        nextState = advanceTicks(nextState, config, sliceTicks);
        ticksEmitted = ticksEmitted.add(sliceTicks);
      }
    } else {
      ticksEmitted = stats.tickYieldPerCycle.mul(cyclesFired);
      nextState = advanceTicks(nextState, config, ticksEmitted);
    }

    for (const layer of config.layers) {
      const delta = nextState.layers[layer.id].currency.sub(beforeState.layers[layer.id].currency);
      currencyDeltas[layer.id] = delta;
    }
  } else {
    for (const layer of config.layers) {
      currencyDeltas[layer.id] = new BigNum(0);
    }
  }

  return {
    nextState,
    report: {
      elapsedMs,
      cyclesFired,
      ticksEmitted,
      currencyDeltas
    }
  };
}

export function buyGenerator(state, config, layerId, genId, countOrMax = 1) {
  const stats = getDerivedStats(state, config);
  const layerState = state.layers[layerId];
  const genConfig = config.layers.find(l => l.id === layerId)?.generators.find(g => g.id === genId);
  if (!genConfig) throw new Error(`Generator ${genId} not found in ${layerId}`);

  let countToBuy = 0;
  let totalCost = new BigNum(0);

  if (countOrMax === 'max') {
    const maxInfo = stats.maxAffordable[layerId][genId];
    countToBuy = maxInfo.count;
    totalCost = maxInfo.totalCost;
  } else {
    countToBuy = Number(countOrMax);
    const r = genConfig.costGrowth;
    const cost1 = stats.generatorCosts[layerId][genId];
    if (countToBuy === 1) {
      totalCost = cost1;
    } else {
      totalCost = cost1.mul(Math.pow(r, countToBuy) - 1).div(r - 1);
    }
  }

  if (countToBuy <= 0 || layerState.currency.lt(totalCost)) {
    return state;
  }

  const nextGenerators = {
    ...layerState.generators,
    [genId]: {
      owned: layerState.generators[genId].owned.add(countToBuy)
    }
  };

  const nextLayers = {
    ...state.layers,
    [layerId]: {
      ...layerState,
      currency: layerState.currency.sub(totalCost),
      generators: nextGenerators
    }
  };

  return {
    ...state,
    layers: nextLayers
  };
}

export function buyUpgrade(state, config, layerId, upgId) {
  const stats = getDerivedStats(state, config);
  const layerState = state.layers[layerId];
  const upgConfig = config.layers.find(l => l.id === layerId)?.upgrades.find(u => u.id === upgId);
  if (!upgConfig) throw new Error(`Upgrade ${upgId} not found in ${layerId}`);

  if (upgConfig.unlockThreshold && layerState.runTotalCurrency.lt(upgConfig.unlockThreshold)) {
    return state;
  }

  const currentLevel = layerState.upgrades[upgId]?.level || 0;
  if (currentLevel >= (upgConfig.maxLevel || Infinity)) {
    return state;
  }

  const cost = stats.upgradeCosts[layerId][upgId];
  if (!cost || layerState.currency.lt(cost)) {
    return state;
  }

  const nextUpgrades = {
    ...layerState.upgrades,
    [upgId]: {
      level: currentLevel + 1
    }
  };

  const nextLayers = {
    ...state.layers,
    [layerId]: {
      ...layerState,
      currency: layerState.currency.sub(cost),
      upgrades: nextUpgrades
    }
  };

  return {
    ...state,
    layers: nextLayers
  };
}

export function resetLayer(state, config, layerId) {
  const layerConfig = config.layers.find(l => l.id === layerId);
  if (!layerConfig?.prestige) {
    throw new Error(`Layer ${layerId} does not support prestige reset`);
  }

  const targetLayerId = layerConfig.prestige.targetLayerId;
  const targetState = state.layers[targetLayerId];
  const threshold = BigNum.from(layerConfig.prestige.thresholdCurrency);

  if (targetState.runTotalCurrency.lt(threshold)) {
    throw new Error(`Threshold not reached to prestige ${layerId}`);
  }

  const reward = BigNum.from(layerConfig.prestige.rewardFormula(targetState.runTotalCurrency));
  if (reward.lt(1)) {
    throw new Error(`Insufficient reward to prestige ${layerId}`);
  }

  // Reset target layer
  const targetConfig = config.layers.find(l => l.id === targetLayerId);
  const resetGenerators = {};
  for (const gen of targetConfig.generators || []) {
    resetGenerators[gen.id] = { owned: new BigNum(0) };
  }

  const resetUpgrades = {};
  for (const upg of targetConfig.upgrades || []) {
    resetUpgrades[upg.id] = { level: 0 };
  }

  const nextTargetLayer = {
    ...targetState,
    currency: new BigNum(targetConfig.currency.initialAmount || 0),
    runTotalCurrency: new BigNum(targetConfig.currency.initialAmount || 0),
    ticksInLayer: new BigNum(0),
    generators: resetGenerators,
    upgrades: resetUpgrades
  };

  // Award prestige currency to current layer
  const currentLayerState = state.layers[layerId];
  const nextCurrentLayer = {
    ...currentLayerState,
    currency: currentLayerState.currency.add(reward),
    runTotalCurrency: currentLayerState.runTotalCurrency.add(reward),
    totalLifetimeCurrency: currentLayerState.totalLifetimeCurrency.add(reward)
  };

  return {
    ...state,
    cycleRemainderMs: 0,
    layers: {
      ...state.layers,
      [targetLayerId]: nextTargetLayer,
      [layerId]: nextCurrentLayer
    }
  };
}
