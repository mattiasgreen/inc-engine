// src/engine/core.js
// Pure Functional Core for inc-engine

import { BigNum } from './bignum.js';

export const DEFAULT_MILESTONE_TIERS = [
  { id: 'm0', rank: 0, name: 'Common', minBought: 0, multiplier: 1 },
  { id: 'm1', rank: 1, name: 'Uncommon', minBought: 25, multiplier: 2 },
  { id: 'm2', rank: 2, name: 'Rare', minBought: 50, multiplier: 4 },
  { id: 'm3', rank: 3, name: 'Epic', minBought: 100, multiplier: 12 },
  { id: 'm4', rank: 4, name: 'Legendary', minBought: 250, multiplier: 50 }
];

export function formatMilestoneAssetPath(baseImage, tierId = 'm0', milestoneAssets = null) {
  if (milestoneAssets && milestoneAssets[tierId]) {
    return milestoneAssets[tierId];
  }
  if (!baseImage || typeof baseImage !== 'string') {
    return `./assets/placeholder-${tierId}.jpg`;
  }
  const dotIdx = baseImage.lastIndexOf('.');
  if (dotIdx === -1) return `${baseImage}-${tierId}.jpg`;
  return `${baseImage.slice(0, dotIdx)}-${tierId}${baseImage.slice(dotIdx)}`;
}

export function getGeneratorMilestoneInfo(boughtBig, genConfig, milestoneMultBonus = 1) {
  const boughtNum = boughtBig ? boughtBig.toNumber() : 0;
  const tiers = genConfig?.milestones || DEFAULT_MILESTONE_TIERS;
  let currentTier = tiers[0];
  let nextTier = null;

  for (let i = 0; i < tiers.length; i++) {
    if (boughtNum >= tiers[i].minBought) {
      currentTier = tiers[i];
      nextTier = tiers[i + 1] || null;
    } else {
      nextTier = tiers[i];
      break;
    }
  }

  const effectiveMultiplier = currentTier.rank > 0
    ? currentTier.multiplier * milestoneMultBonus
    : currentTier.multiplier;

  const prevMin = currentTier.minBought;
  const nextMin = nextTier ? nextTier.minBought : currentTier.minBought;
  const span = Math.max(1, nextMin - prevMin);
  const progressToNext = nextTier
    ? Math.min(1, Math.max(0, (boughtNum - prevMin) / span))
    : 1;

  return {
    tierId: currentTier.id,
    rank: currentTier.rank,
    tierName: currentTier.name,
    multiplier: effectiveMultiplier,
    boughtCount: boughtNum,
    nextTierId: nextTier ? nextTier.id : null,
    nextTierName: nextTier ? nextTier.name : null,
    nextThreshold: nextTier ? nextTier.minBought : null,
    nextMultiplier: nextTier ? (nextTier.rank > 0 ? nextTier.multiplier * milestoneMultBonus : nextTier.multiplier) : null,
    progressToNext,
    assetPath: formatMilestoneAssetPath(genConfig?.image, currentTier.id, genConfig?.milestoneAssets),
    fallbackImage: genConfig?.image || null
  };
}

export function getUpgradeMilestoneInfo(level, upgConfig) {
  const maxLvl = upgConfig?.maxLevel || 1;
  let tierIdx = 0;
  if (level <= 0) {
    tierIdx = 0;
  } else if (maxLvl === 1) {
    const targetRank = upgConfig?.milestoneRank ?? 2;
    tierIdx = Math.min(4, Math.max(1, targetRank));
  } else {
    const ratio = level / maxLvl;
    if (ratio >= 1) tierIdx = 4;
    else if (ratio >= 0.7) tierIdx = 3;
    else if (ratio >= 0.4) tierIdx = 2;
    else tierIdx = 1;
  }
  const tier = DEFAULT_MILESTONE_TIERS[tierIdx] || DEFAULT_MILESTONE_TIERS[0];
  return {
    tierId: tier.id,
    rank: tier.rank,
    tierName: tier.name,
    assetPath: formatMilestoneAssetPath(upgConfig?.image, tier.id, upgConfig?.milestoneAssets),
    fallbackImage: upgConfig?.image || null
  };
}

export function getCharacterMilestoneInfo(state, config) {
  let tierIdx = 0;
  const l0 = state.layers?.layer0;
  const l1Config = config.layers?.[1];
  const l1 = l1Config ? state.layers?.[l1Config.id] : null;

  if (l1 && (l1.upgrades?.upg_l1_apex?.level || 0) >= 1) {
    tierIdx = 4;
  } else if (l1 && l1.totalLifetimeCurrency?.gt(0)) {
    tierIdx = 3;
  } else if (l1Config?.prestige && l0?.runTotalCurrency?.gte(l1Config.prestige.thresholdCurrency * 0.1)) {
    tierIdx = 2;
  } else if (l0) {
    const anyM1 = Object.values(l0.generators || {}).some(g => (g.bought || g.owned)?.gte(25));
    if (anyM1) tierIdx = 1;
  }

  const tier = DEFAULT_MILESTONE_TIERS[tierIdx];
  return {
    tierId: tier.id,
    rank: tier.rank,
    tierName: tier.name,
    assetPath: formatMilestoneAssetPath(config.character?.image, tier.id, config.character?.milestoneAssets),
    fallbackImage: config.character?.image || null
  };
}

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
        bought: new BigNum(0),
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
  const boughtSynergyBonuses = {};
  const milestoneMultipliers = {};
  const crossGeneratorSynergies = {};
  const logMomentumExponents = {};
  const periodDivisors = {};

  for (const layer of config.layers) {
    layerMultipliers[layer.id] = new BigNum(1.0);
    costScalingReductions[layer.id] = 0;
    boughtSynergyBonuses[layer.id] = 0;
    milestoneMultipliers[layer.id] = 1.0;
    crossGeneratorSynergies[layer.id] = 0;
    logMomentumExponents[layer.id] = 0;
    periodDivisors[layer.id] = {};
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
      if (!eff) continue;

      if (typeof eff.formula === 'function') {
        const dynamicVal = eff.formula(state);
        if (eff.target === 'layerGenerators') {
          const targetLayer = eff.targetId || layer.id;
          layerMultipliers[targetLayer] = layerMultipliers[targetLayer].mul(dynamicVal);
        }
      } else if (eff.target === 'cycleFrequency') {
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
          const targetLayer = eff.targetId || layer.id;
          layerMultipliers[targetLayer] = layerMultipliers[targetLayer].mul(Math.pow(eff.value, level));
        }
      } else if (eff.target === 'costScaling') {
        const targetLayer = eff.targetId || layer.id;
        if (eff.operation === 'subtract' || eff.operation === 'add') {
          costScalingReductions[targetLayer] += eff.value * level;
        }
      } else if (eff.target === 'boughtSynergy') {
        const targetLayer = eff.targetId || layer.id;
        if (eff.operation === 'add') {
          boughtSynergyBonuses[targetLayer] += eff.value * level;
        }
      } else if (eff.target === 'milestoneMultiplier') {
        const targetLayer = eff.targetId || layer.id;
        if (eff.operation === 'multiply') {
          milestoneMultipliers[targetLayer] *= Math.pow(eff.value, level);
        } else if (eff.operation === 'add') {
          milestoneMultipliers[targetLayer] += eff.value * level;
        }
      } else if (eff.target === 'crossGeneratorSynergy') {
        const targetLayer = eff.targetId || layer.id;
        crossGeneratorSynergies[targetLayer] += eff.value * level;
      } else if (eff.target === 'logMomentum') {
        const targetLayer = eff.targetId || layer.id;
        logMomentumExponents[targetLayer] += eff.value * level;
      } else if (eff.target === 'generatorPeriod') {
        const targetLayer = eff.layerId || layer.id;
        const targetGen = eff.targetId || 'all';
        const factor = Math.pow(eff.value || 2, level);
        periodDivisors[targetLayer][targetGen] = (periodDivisors[targetLayer][targetGen] || 1) * factor;
      }
    }
  }

  // Calculate Cross-Generator Synergy and Logarithmic Momentum currency multipliers
  const currencyMultipliers = {};
  for (const layer of config.layers) {
    currencyMultipliers[layer.id] = new BigNum(1.0);
    const layerState = state.layers[layer.id];
    if (!layerState) continue;

    if (crossGeneratorSynergies[layer.id] > 0) {
      let totalBought = 0;
      for (const gen of layer.generators || []) {
        const b = layerState.generators[gen.id]?.bought || layerState.generators[gen.id]?.owned || new BigNum(0);
        totalBought += b.toNumber();
      }
      const crossMult = 1 + crossGeneratorSynergies[layer.id] * totalBought;
      currencyMultipliers[layer.id] = currencyMultipliers[layer.id].mul(crossMult);
    }

    if (logMomentumExponents[layer.id] > 0) {
      const runCur = Math.max(1, layerState.runTotalCurrency?.toNumber() || 1);
      const logBase = Math.max(1, Math.log10(runCur + 10));
      const logMult = Math.pow(logBase, logMomentumExponents[layer.id]);
      currencyMultipliers[layer.id] = currencyMultipliers[layer.id].mul(logMult);
    }
  }

  const effectiveCycleDurationMs = config.clock.baseCycleDurationMs / cycleFreqMult;
  const tickYieldPerCycle = baseTickYield.add(tickYieldAdd).mul(tickYieldMult);
  const effectiveTicksPerSec = (1000 / effectiveCycleDurationMs) * tickYieldPerCycle.toNumber();
  const baseCyclePhase = Math.min(1, Math.max(0, (state.cycleRemainderMs || 0) / effectiveCycleDurationMs));

  const generatorOutputs = {};
  const generatorBatchOutputs = {};
  const generatorPeriods = {};
  const generatorEffectivePeriodMs = {};
  const generatorOverdrive = {};
  const generatorCyclePhase = {};
  const generatorMilestones = {};
  const generatorCosts = {};
  const maxAffordable = {};
  const layerProductionPerTick = {};

  for (const layer of config.layers) {
    generatorOutputs[layer.id] = {};
    generatorBatchOutputs[layer.id] = {};
    generatorPeriods[layer.id] = {};
    generatorEffectivePeriodMs[layer.id] = {};
    generatorOverdrive[layer.id] = {};
    generatorCyclePhase[layer.id] = {};
    generatorMilestones[layer.id] = {};
    generatorCosts[layer.id] = {};
    maxAffordable[layer.id] = {};
    layerProductionPerTick[layer.id] = new BigNum(0);

    const layerState = state.layers[layer.id];
    const layerMult = layerMultipliers[layer.id];
    const costReduction = costScalingReductions[layer.id] || 0;
    const synergyBonus = boughtSynergyBonuses[layer.id] || 0;
    const milestoneBonus = milestoneMultipliers[layer.id] || 1.0;

    for (const gen of layer.generators || []) {
      const genState = layerState.generators[gen.id];
      const bought = genState?.bought || genState?.owned || new BigNum(0);
      const owned = genState?.owned || new BigNum(0);
      let genMult = layerMult;

      // Check generator specific upgrades
      for (const upg of layer.upgrades || []) {
        const level = layerState?.upgrades[upg.id]?.level || 0;
        if (level > 0 && upg.effect && upg.effect.target === 'generator' && upg.effect.targetId === gen.id) {
          if (upg.effect.operation === 'multiply') {
            genMult = genMult.mul(Math.pow(upg.effect.value, level));
          }
        }
      }

      // Bought synergy multiplier: 1st purchase produces base output, additional purchases multiply output
      const baseSynergy = gen.boughtSynergyMultiplier || layer.boughtSynergyMultiplier || 1.0;
      const effectiveSynergy = baseSynergy + synergyBonus;
      const synergyExponent = bought.gt(1) ? bought.sub(1) : new BigNum(0);
      const synergyMult = new BigNum(effectiveSynergy).pow(synergyExponent);
      genMult = genMult.mul(synergyMult);

      // Milestone Tier multiplier (m0..m4)
      const milestoneInfo = getGeneratorMilestoneInfo(bought, gen, milestoneBonus);
      generatorMilestones[layer.id][gen.id] = milestoneInfo;
      if (milestoneInfo.multiplier !== 1) {
        genMult = genMult.mul(milestoneInfo.multiplier);
      }

      // Integer Tick Period & Cycle Phase
      const basePeriod = Math.max(1, Math.round(gen.cyclePeriodTicks || 1));
      const allDivisor = periodDivisors[layer.id].all || 1;
      const specificDivisor = periodDivisors[layer.id][gen.id] || 1;
      const effectivePeriodTicks = Math.max(1, Math.round(basePeriod / (allDivisor * specificDivisor)));
      const effectivePeriodMs = (effectivePeriodTicks / effectiveTicksPerSec) * 1000;
      const isOverdrive = effectivePeriodMs < 999.9 || (basePeriod > 1 && effectivePeriodMs <= 1000);

      const totalTicksNum = state.totalTicks ? state.totalTicks.toNumber() : 0;
      const startTick = genState?.startTick || 0;
      const ticksSinceStart = Math.max(0, Math.round(totalTicksNum) - Math.round(startTick));
      const tickOffsetInPeriod = Math.floor(ticksSinceStart) % effectivePeriodTicks;
      const fractionalTicksInCycle = baseCyclePhase * tickYieldPerCycle.toNumber();
      const rawPhase = (tickOffsetInPeriod + Math.min(1, fractionalTicksInCycle)) / effectivePeriodTicks;
      const cyclePhase = isOverdrive ? 1.0 : Math.min(0.9999, Math.max(0, rawPhase));

      generatorPeriods[layer.id][gen.id] = effectivePeriodTicks;
      generatorEffectivePeriodMs[layer.id][gen.id] = effectivePeriodMs;
      generatorOverdrive[layer.id][gen.id] = isOverdrive;
      generatorCyclePhase[layer.id][gen.id] = cyclePhase;

      const producesCurrency = !gen.produces || gen.produces === 'currency' || gen.produces.type === 'currency';
      if (producesCurrency && currencyMultipliers[layer.id]) {
        genMult = genMult.mul(currencyMultipliers[layer.id]);
      }

      const unitOutput = BigNum.from(gen.baseOutputPerTick).mul(genMult);
      generatorOutputs[layer.id][gen.id] = unitOutput;
      generatorBatchOutputs[layer.id][gen.id] = unitOutput.mul(effectivePeriodTicks);

      // Only generators producing layer currency directly contribute to layerProductionPerTick
      if (owned.gt(0) && producesCurrency) {
        layerProductionPerTick[layer.id] = layerProductionPerTick[layer.id].add(owned.mul(unitOutput));
      }

      // Effective cost growth based on BOUGHT count
      const r = Math.max(1.01, gen.costGrowth - costReduction);
      const rBig = new BigNum(r);
      const cost1 = BigNum.from(gen.baseCost).mul(rBig.pow(bought));
      generatorCosts[layer.id][gen.id] = cost1;

      // Max affordable calculation from current bought
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

  // Upgrade Tree DAG Evaluation
  const upgradeCosts = {};
  const upgradeMilestones = {};
  for (const layer of config.layers) {
    upgradeCosts[layer.id] = {};
    upgradeMilestones[layer.id] = {};
    const layerState = state.layers[layer.id];
    for (const upg of layer.upgrades || []) {
      const isLockedThreshold = Boolean(upg.unlockThreshold && layerState.runTotalCurrency.lt(upg.unlockThreshold));

      // Prerequisites
      let prereqsMet = true;
      if (upg.prerequisites && upg.prerequisites.length > 0) {
        if (upg.requireMode === 'any') {
          prereqsMet = upg.prerequisites.some(p => (layerState.upgrades[p.id]?.level || 0) >= (p.minLevel || 1));
        } else {
          prereqsMet = upg.prerequisites.every(p => (layerState.upgrades[p.id]?.level || 0) >= (p.minLevel || 1));
        }
      }

      // Mutual Exclusivity
      let isExclusiveLocked = false;
      if (upg.exclusiveWith && upg.exclusiveWith.length > 0) {
        isExclusiveLocked = upg.exclusiveWith.some(siblingId => (layerState.upgrades[siblingId]?.level || 0) > 0);
      }

      const level = layerState.upgrades[upg.id]?.level || 0;
      upgradeMilestones[layer.id][upg.id] = getUpgradeMilestoneInfo(level, upg);
      if (isLockedThreshold || !prereqsMet || isExclusiveLocked) {
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

  const visibility = getVisibilityStates(state, config);
  const characterMilestone = getCharacterMilestoneInfo(state, config);

  return {
    cycleFrequencyMultiplier: cycleFreqMult,
    effectiveCycleDurationMs,
    tickYieldPerCycle,
    effectiveTicksPerSec,
    baseCyclePhase,
    layerMultipliers,
    costScalingReductions,
    milestoneMultipliers,
    generatorOutputs,
    generatorBatchOutputs,
    generatorPeriods,
    generatorEffectivePeriodMs,
    generatorOverdrive,
    generatorCyclePhase,
    generatorMilestones,
    generatorCosts,
    maxAffordable,
    upgradeCosts,
    upgradeMilestones,
    characterMilestone,
    prestigeRewards,
    layerProductionPerTick,
    visibility
  };
}

export function getVisibilityStates(state, config) {
  const visibility = {
    layers: {},
    generators: {},
    upgrades: {}
  };

  // 1. Layers visibility
  for (let i = 0; i < config.layers.length; i++) {
    const layer = config.layers[i];
    const layerState = state.layers[layer.id];

    if (i === 0) {
      visibility.layers[layer.id] = 'visible';
      continue;
    }

    if (layer.revealWhen) {
      visibility.layers[layer.id] = evaluatePredicate(layer.revealWhen, state) ? 'visible' : 'hidden';
      continue;
    }

    // Default convention:
    const scope = layer.revealScope || 'lifetime';
    if (scope === 'lifetime' && layerState?.totalLifetimeCurrency.gt(0)) {
      visibility.layers[layer.id] = 'visible';
      continue;
    }

    if (layer.prestige) {
      const targetState = state.layers[layer.prestige.targetLayerId];
      const threshold = BigNum.from(layer.prestige.thresholdCurrency);
      const revealFraction = layer.revealThresholdFraction ?? 0.10;
      const revealTarget = threshold.mul(revealFraction);
      const runCur = targetState?.runTotalCurrency || new BigNum(0);
      const lifeCur = targetState?.totalLifetimeCurrency || new BigNum(0);
      const bestCur = runCur.gt(lifeCur) ? runCur : lifeCur;
      visibility.layers[layer.id] = bestCur.gte(revealTarget) ? 'visible' : 'hidden';
    } else {
      visibility.layers[layer.id] = 'visible';
    }
  }

  // 2. Generators visibility
  for (const layer of config.layers) {
    visibility.generators[layer.id] = {};
    const layerState = state.layers[layer.id];

    for (let i = 0; i < (layer.generators || []).length; i++) {
      const gen = layer.generators[i];
      const genState = layerState?.generators[gen.id];

      if (gen.revealWhen) {
        visibility.generators[layer.id][gen.id] = evaluatePredicate(gen.revealWhen, state) ? 'visible' : 'hidden';
        continue;
      }

      // Generator 0 is always visible
      if (i === 0) {
        visibility.generators[layer.id][gen.id] = 'visible';
        continue;
      }

      if (genState?.owned.gt(0) || genState?.bought.gt(0)) {
        visibility.generators[layer.id][gen.id] = 'visible';
        continue;
      }

      const prevGen = layer.generators[i - 1];
      const prevOwned = layerState?.generators[prevGen.id]?.owned || new BigNum(0);
      if (prevOwned.gte(1)) {
        visibility.generators[layer.id][gen.id] = 'visible';
      } else {
        visibility.generators[layer.id][gen.id] = 'hidden';
      }
    }
  }

  // 3. Upgrades visibility
  for (const layer of config.layers) {
    visibility.upgrades[layer.id] = {};
    const layerState = state.layers[layer.id];

    for (const upg of layer.upgrades || []) {
      const level = layerState?.upgrades[upg.id]?.level || 0;

      if (upg.revealWhen) {
        visibility.upgrades[layer.id][upg.id] = evaluatePredicate(upg.revealWhen, state) ? 'visible' : 'hidden';
        continue;
      }

      if (level > 0) {
        visibility.upgrades[layer.id][upg.id] = 'visible';
        continue;
      }

      let prereqsMet = true;
      if (upg.prerequisites && upg.prerequisites.length > 0) {
        if (upg.requireMode === 'any') {
          prereqsMet = upg.prerequisites.some(p => (layerState?.upgrades[p.id]?.level || 0) >= (p.minLevel || 1));
        } else {
          prereqsMet = upg.prerequisites.every(p => (layerState?.upgrades[p.id]?.level || 0) >= (p.minLevel || 1));
        }
      }

      let isExclusiveLocked = false;
      if (upg.exclusiveWith && upg.exclusiveWith.length > 0) {
        isExclusiveLocked = upg.exclusiveWith.some(siblingId => (layerState?.upgrades[siblingId]?.level || 0) > 0);
      }

      const costFraction = upg.revealCostFraction ?? 0.50;
      const revealCostThreshold = BigNum.from(upg.baseCost).mul(costFraction);
      const currentCurrency = layerState?.runTotalCurrency || new BigNum(0);
      const currencyMet = currentCurrency.gte(revealCostThreshold);

      if (prereqsMet && !isExclusiveLocked && currencyMet) {
        visibility.upgrades[layer.id][upg.id] = 'visible';
      } else {
        visibility.upgrades[layer.id][upg.id] = 'hidden';
      }
    }
  }

  return visibility;
}

function evaluatePredicate(pred, state) {
  if (!pred) return true;
  if (pred.type === 'currency') {
    const layer = state.layers[pred.layerId || 'layer0'];
    const metric = pred.metric || 'runTotal';
    const val = metric === 'lifetime' ? layer?.totalLifetimeCurrency : (metric === 'current' ? layer?.currency : layer?.runTotalCurrency);
    return val ? val.gte(pred.gte || 0) : false;
  }
  if (pred.type === 'generator') {
    const layer = state.layers[pred.layerId || 'layer0'];
    const gen = layer?.generators[pred.generatorId || pred.id];
    const metric = pred.metric || 'owned';
    const val = metric === 'bought' ? gen?.bought : gen?.owned;
    return val ? val.gte(pred.gte || 1) : false;
  }
  if (pred.type === 'upgrade') {
    const layer = state.layers[pred.layerId || 'layer0'];
    const upg = layer?.upgrades[pred.upgradeId || pred.id];
    return (upg?.level || 0) >= (pred.gte || 1);
  }
  return true;
}

export function advanceTicks(state, config, ticks) {
  const tickCount = BigNum.from(ticks);
  if (tickCount.lte(0)) return state;

  const stats = getDerivedStats(state, config);

  // Map of all generators across layers
  const genMap = new Map();
  const outgoing = new Map();
  const inDegree = new Map();

  for (const layer of config.layers) {
    for (const gen of layer.generators || []) {
      const key = `${layer.id}:${gen.id}`;
      genMap.set(key, { layer, gen });
      inDegree.set(key, 0);
    }
  }

  // Determine production targets and graph edges
  for (const [key, { layer, gen }] of genMap) {
    let targetKey = null;
    if (!gen.produces || gen.produces === 'currency' || gen.produces.type === 'currency') {
      targetKey = `currency:${layer.id}`;
    } else if (gen.produces.type === 'generator') {
      const targetLayerId = gen.produces.layerId || layer.id;
      const targetGenId = gen.produces.targetId || gen.produces.id;
      targetKey = `${targetLayerId}:${targetGenId}`;
    } else if (typeof gen.produces === 'string') {
      targetKey = `${layer.id}:${gen.produces}`;
    }
    outgoing.set(key, targetKey);
    if (targetKey && genMap.has(targetKey)) {
      inDegree.set(targetKey, (inDegree.get(targetKey) || 0) + 1);
    }
  }

  // Kahn's algorithm for topological sort of generators
  const queue = [];
  for (const [key, deg] of inDegree) {
    if (deg === 0) queue.push(key);
  }

  const topoOrder = [];
  while (queue.length > 0) {
    const u = queue.shift();
    topoOrder.push(u);
    const v = outgoing.get(u);
    if (v && genMap.has(v)) {
      const newDeg = inDegree.get(v) - 1;
      inDegree.set(v, newDeg);
      if (newDeg === 0) queue.push(v);
    }
  }

  // If there's a cycle or remaining nodes, append them
  if (topoOrder.length < genMap.size) {
    for (const key of genMap.keys()) {
      if (!topoOrder.includes(key)) topoOrder.push(key);
    }
  }

  // Polynomial representation: poly[key] = Array of BigNum [a_0, a_1, a_2, ...]
  const poly = new Map();
  for (const [key, { layer, gen }] of genMap) {
    const owned = state.layers[layer.id].generators[gen.id]?.owned || new BigNum(0);
    poly.set(key, [new BigNum(owned)]);
  }

  for (const layer of config.layers) {
    poly.set(`currency:${layer.id}`, [new BigNum(0)]);
  }

  // Propagate polynomials along directed edges in topological order
  const startTickNum = state.totalTicks ? Math.round(state.totalTicks.toNumber()) : 0;
  const tickCountNum = Math.round(tickCount.toNumber());
  const endTickNum = startTickNum + tickCountNum;

  for (const u of topoOrder) {
    const { layer, gen } = genMap.get(u);
    let rate = stats.generatorOutputs[layer.id][gen.id] || new BigNum(0);
    const periodTicks = stats.generatorPeriods?.[layer.id]?.[gen.id] || 1;
    const isOverdrive = stats.generatorOverdrive?.[layer.id]?.[gen.id] || false;

    if (gen.batchPayout && periodTicks > 1 && !isOverdrive && tickCountNum > 0 && tickCountNum <= periodTicks) {
      const periodsCompleted = Math.floor(endTickNum / periodTicks) - Math.floor(startTickNum / periodTicks);
      rate = rate.mul((periodsCompleted * periodTicks) / tickCountNum);
    }

    const targetKey = outgoing.get(u);
    if (!targetKey) continue;

    const uTerms = poly.get(u) || [];
    if (!poly.has(targetKey)) {
      poly.set(targetKey, [new BigNum(0)]);
    }
    const targetTerms = poly.get(targetKey);

    for (let p = 0; p < uTerms.length; p++) {
      const term = uTerms[p];
      if (!term || term.isZero()) continue;
      const integratedTerm = term.mul(rate);
      const nextP = p + 1;
      while (targetTerms.length <= nextP) {
        targetTerms.push(new BigNum(0));
      }
      targetTerms[nextP] = targetTerms[nextP].add(integratedTerm);
    }
  }

  const factorials = [1, 1, 2, 6, 24, 120, 720, 5040, 40320];
  function evalPoly(terms, dtBig) {
    let sum = new BigNum(0);
    let dtPow = new BigNum(1);
    for (let p = 0; p < terms.length; p++) {
      const a = terms[p];
      if (a && !a.isZero()) {
        const fact = factorials[p] || 1;
        const val = a.mul(dtPow).div(fact);
        sum = sum.add(val);
      }
      if (p + 1 < terms.length) {
        dtPow = dtPow.mul(dtBig);
      }
    }
    return sum;
  }

  // Build next layers state
  const nextLayers = {};
  for (const layer of config.layers) {
    const prevLayer = state.layers[layer.id];
    const nextGens = {};

    for (const gen of layer.generators || []) {
      const key = `${layer.id}:${gen.id}`;
      const prevGen = prevLayer.generators[gen.id];
      const prevOwned = prevGen?.owned || new BigNum(0);
      const terms = poly.get(key) || [prevOwned];
      const nextOwned = evalPoly(terms, tickCount);
      const startTick = (prevOwned.isZero() && nextOwned.gt(0))
        ? endTickNum
        : (prevGen?.startTick || 0);

      nextGens[gen.id] = {
        bought: prevGen?.bought || prevOwned,
        owned: nextOwned,
        startTick
      };
    }

    const currencyDelta = evalPoly(poly.get(`currency:${layer.id}`) || [], tickCount);

    nextLayers[layer.id] = {
      ...prevLayer,
      currency: prevLayer.currency.add(currencyDelta),
      runTotalCurrency: prevLayer.runTotalCurrency.add(currencyDelta),
      totalLifetimeCurrency: prevLayer.totalLifetimeCurrency.add(currencyDelta),
      ticksInLayer: prevLayer.ticksInLayer.add(tickCount),
      generators: nextGens
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

  // If no generators are owned yet, idle elapsed time does not advance cycles
  let totalOwned = 0;
  for (const layer of config.layers) {
    for (const gen of layer.generators || []) {
      totalOwned += state.layers[layer.id]?.generators[gen.id]?.owned.toNumber() || 0;
    }
  }
  if (totalOwned === 0) {
    return {
      nextState: { ...state, cycleRemainderMs: 0 },
      report: {
        elapsedMs,
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
    const costReduction = stats.costScalingReductions?.[layerId] || 0;
    const r = Math.max(1.01, genConfig.costGrowth - costReduction);
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

  const currentGen = layerState.generators[genId];
  const currentBought = currentGen.bought || currentGen.owned || new BigNum(0);
  const currentOwned = currentGen.owned || new BigNum(0);

  let totalOwnedBefore = 0;
  for (const layer of config.layers) {
    for (const gen of layer.generators || []) {
      totalOwnedBefore += state.layers[layer.id]?.generators[gen.id]?.owned.toNumber() || 0;
    }
  }

  const isFirstPurchaseOfGen = currentOwned.isZero();
  const nextGenState = {
    bought: currentBought.add(countToBuy),
    owned: currentOwned.add(countToBuy),
    startTick: isFirstPurchaseOfGen
      ? (state.totalTicks ? Math.round(state.totalTicks.toNumber()) : 0)
      : (currentGen.startTick || 0)
  };

  const nextGenerators = {
    ...layerState.generators,
    [genId]: nextGenState
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
    cycleRemainderMs: totalOwnedBefore === 0 ? 0 : state.cycleRemainderMs,
    layers: nextLayers
  };
}

export function buyUpgrade(state, config, layerId, upgId) {
  const stats = getDerivedStats(state, config);
  const layerState = state.layers[layerId];
  const upgConfig = config.layers.find(l => l.id === layerId)?.upgrades.find(u => u.id === upgId);
  if (!upgConfig) throw new Error(`Upgrade ${upgId} not found in ${layerId}`);

  const cost = stats.upgradeCosts[layerId][upgId];
  if (!cost || layerState.currency.lt(cost)) {
    return state;
  }

  const currentLevel = layerState.upgrades[upgId]?.level || 0;
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
    resetGenerators[gen.id] = {
      bought: new BigNum(0),
      owned: new BigNum(0),
      startTick: 0
    };
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
