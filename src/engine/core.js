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

export const BAY_SOFT_CAP_EXPONENT = 0.42;

function computeBayEffectiveNum(boughtNum, ownedNum, bayCapNum) {
  if (!Number.isFinite(bayCapNum) || bayCapNum <= 0) {
    return ownedNum;
  }
  const free = Math.max(0, ownedNum - boughtNum);
  if (free <= bayCapNum) {
    return ownedNum;
  }
  const excess = free - bayCapNum;
  return boughtNum + bayCapNum * Math.pow(1 + excess / bayCapNum, BAY_SOFT_CAP_EXPONENT);
}

export function computeBayEffectiveOwned(boughtBig, ownedBig, bayCapNum) {
  const bought = boughtBig ? boughtBig.toNumber() : 0;
  const owned = ownedBig ? ownedBig.toNumber() : 0;
  if (!Number.isFinite(bayCapNum) || bayCapNum <= 0) {
    return ownedBig ? BigNum.from(ownedBig) : new BigNum(0);
  }
  const eff = computeBayEffectiveNum(bought, owned, bayCapNum);
  return eff === owned && ownedBig ? BigNum.from(ownedBig) : new BigNum(eff);
}

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
    const l0Gens = config.layers?.[0]?.generators || [];
    const anyM1 = l0Gens.some(genCfg => {
      const g = l0.generators?.[genCfg.id];
      const m1Threshold = (genCfg.milestones || DEFAULT_MILESTONE_TIERS)[1]?.minBought ?? 25;
      return (g?.bought || g?.owned)?.gte(m1Threshold);
    });
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
      stanceId: layer.defaultStanceId || 'balanced',
      capacitorCharge: 0,
      surgeTicksRemaining: 0,
      pulseCooldownMs: 0,
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
  const cascadeMetaMultipliers = {};
  const costScalingReductions = {};
  const boughtSynergyBonuses = {};
  const milestoneMultipliers = {};
  const bayMultipliers = {};
  const surgeBonusMultipliers = {};
  const crossGeneratorSynergies = {};
  const logMomentumExponents = {};
  const periodDivisors = {};

  for (const layer of config.layers) {
    layerMultipliers[layer.id] = new BigNum(1.0);
    cascadeMetaMultipliers[layer.id] = new BigNum(1.0);
    costScalingReductions[layer.id] = 0;
    boughtSynergyBonuses[layer.id] = 0;
    milestoneMultipliers[layer.id] = 1.0;
    bayMultipliers[layer.id] = 1.0;
    surgeBonusMultipliers[layer.id] = 1.0;
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

  function applyUpgradeEffect(eff, level, layerId) {
    if (!eff) return;
    if (typeof eff.formula === 'function') {
      const dynamicVal = eff.formula(state);
      if (eff.target === 'layerGenerators') {
        const targetLayer = eff.targetId || layerId;
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
        const targetLayer = eff.targetId || layerId;
        layerMultipliers[targetLayer] = layerMultipliers[targetLayer].mul(Math.pow(eff.value, level));
      }
    } else if (eff.target === 'cascadeMeta') {
      if (eff.operation === 'multiply') {
        const targetLayer = eff.targetId || layerId;
        cascadeMetaMultipliers[targetLayer] = cascadeMetaMultipliers[targetLayer].mul(Math.pow(eff.value, level));
      }
    } else if (eff.target === 'costScaling') {
      const targetLayer = eff.targetId || layerId;
      if (eff.operation === 'subtract' || eff.operation === 'add') {
        costScalingReductions[targetLayer] += eff.value * level;
      }
    } else if (eff.target === 'boughtSynergy') {
      const targetLayer = eff.targetId || layerId;
      if (eff.operation === 'add') {
        boughtSynergyBonuses[targetLayer] += eff.value * level;
      }
    } else if (eff.target === 'milestoneMultiplier') {
      const targetLayer = eff.targetId || layerId;
      if (eff.operation === 'multiply') {
        milestoneMultipliers[targetLayer] *= Math.pow(eff.value, level);
      } else if (eff.operation === 'add') {
        milestoneMultipliers[targetLayer] += eff.value * level;
      }
    } else if (eff.target === 'bayCapacity') {
      const targetLayer = eff.targetId || layerId;
      if (eff.operation === 'multiply') {
        bayMultipliers[targetLayer] *= Math.pow(eff.value, level);
      }
    } else if (eff.target === 'surgeMultiplier') {
      const targetLayer = eff.targetId || layerId;
      if (eff.operation === 'multiply') {
        surgeBonusMultipliers[targetLayer] *= Math.pow(eff.value, level);
      }
    } else if (eff.target === 'crossGeneratorSynergy') {
      const targetLayer = eff.targetId || layerId;
      crossGeneratorSynergies[targetLayer] += eff.value * level;
    } else if (eff.target === 'logMomentum') {
      const targetLayer = eff.targetId || layerId;
      logMomentumExponents[targetLayer] += eff.value * level;
    } else if (eff.target === 'generatorPeriod') {
      const targetLayer = eff.layerId || layerId;
      const targetGen = eff.targetId || 'all';
      const factor = Math.pow(eff.value || 2, level);
      periodDivisors[targetLayer][targetGen] = (periodDivisors[targetLayer][targetGen] || 1) * factor;
    }
  }

  // Tally upgrade effects
  for (const layer of config.layers) {
    const layerState = state.layers[layer.id];
    for (const upg of layer.upgrades || []) {
      const level = layerState?.upgrades[upg.id]?.level || 0;
      if (level <= 0) continue;

      if (upg.effect) applyUpgradeEffect(upg.effect, level, layer.id);
      if (Array.isArray(upg.effects)) {
        for (const subEff of upg.effects) {
          applyUpgradeEffect(subEff, level, layer.id);
        }
      }
    }
  }

  // Evaluate active Stances and active Surge Windows affecting global clock
  const activeStances = {};
  const layerSurgeActive = {};
  const layerSurgeOutputMult = {};
  for (const layer of config.layers) {
    const layerState = state.layers[layer.id];
    const stanceId = layerState?.stanceId || layer.defaultStanceId || 'balanced';
    const stanceObj = (layer.stances || []).find(s => s.id === stanceId) || {
      id: stanceId,
      name: 'Balanced',
      description: '',
      currencyMult: 1.0,
      metaMult: 1.0,
      chargeMult: 1.0,
      cycleFreqMult: 1.0
    };
    activeStances[layer.id] = stanceObj;
    if (stanceObj.cycleFreqMult && stanceObj.cycleFreqMult !== 1) {
      cycleFreqMult *= stanceObj.cycleFreqMult;
    }

    const surgeTicks = Math.max(0, layerState?.surgeTicksRemaining || 0);
    const isSurge = Boolean(layer.capacitor && surgeTicks > 0);
    layerSurgeActive[layer.id] = isSurge;
    if (isSurge) {
      if (layer.capacitor.surgeCycleFreqMult && layer.capacitor.surgeCycleFreqMult !== 1) {
        cycleFreqMult *= layer.capacitor.surgeCycleFreqMult;
      }
      if (layer.capacitor.surgeTickMult && layer.capacitor.surgeTickMult !== 1) {
        tickYieldMult = tickYieldMult.mul(layer.capacitor.surgeTickMult);
      }
      layerSurgeOutputMult[layer.id] = (layer.capacitor.surgeMultiplier || 1.0) * (surgeBonusMultipliers[layer.id] || 1.0);
    } else {
      layerSurgeOutputMult[layer.id] = 1.0;
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
  const generatorOverdriveMultipliers = {};
  const generatorCyclePhase = {};
  const generatorMilestones = {};
  const generatorCosts = {};
  const maxAffordable = {};
  const bayCapacities = {};
  const bayEffectiveOwned = {};
  const bayOverflowRatios = {};
  const layerProductionPerTick = {};
  const layerProductionPerSec = {};
  const capacitorStats = {};

  for (const layer of config.layers) {
    generatorOutputs[layer.id] = {};
    generatorBatchOutputs[layer.id] = {};
    generatorPeriods[layer.id] = {};
    generatorEffectivePeriodMs[layer.id] = {};
    generatorOverdrive[layer.id] = {};
    generatorOverdriveMultipliers[layer.id] = {};
    generatorCyclePhase[layer.id] = {};
    generatorMilestones[layer.id] = {};
    generatorCosts[layer.id] = {};
    maxAffordable[layer.id] = {};
    bayCapacities[layer.id] = {};
    bayEffectiveOwned[layer.id] = {};
    bayOverflowRatios[layer.id] = {};
    layerProductionPerTick[layer.id] = new BigNum(0);

    const layerState = state.layers[layer.id];
    const layerMult = layerMultipliers[layer.id];
    const costReduction = costScalingReductions[layer.id] || 0;
    const synergyBonus = boughtSynergyBonuses[layer.id] || 0;
    const milestoneBonus = milestoneMultipliers[layer.id] || 1.0;
    const bayMult = bayMultipliers[layer.id] || 1.0;
    const stanceObj = activeStances[layer.id];
    const isSurge = layerSurgeActive[layer.id];
    const surgeOutMult = layerSurgeOutputMult[layer.id];
    let layerOverflowSum = 0;

    for (const gen of layer.generators || []) {
      const genState = layerState.generators[gen.id];
      const bought = genState?.bought || genState?.owned || new BigNum(0);
      const owned = genState?.owned || new BigNum(0);
      let genMult = layerMult;

      // Check generator specific upgrades
      for (const upg of layer.upgrades || []) {
        const level = layerState?.upgrades[upg.id]?.level || 0;
        if (level <= 0) continue;
        const effList = [];
        if (upg.effect) effList.push(upg.effect);
        if (Array.isArray(upg.effects)) effList.push(...upg.effects);
        for (const eff of effList) {
          if (eff && eff.target === 'generator' && eff.targetId === gen.id && eff.operation === 'multiply') {
            genMult = genMult.mul(Math.pow(eff.value, level));
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

      // Integer Tick Period, Real Period Speedup, & Mechanical Overdrive
      const basePeriod = Math.max(1, Math.round(gen.cyclePeriodTicks || 1));
      const allDivisor = periodDivisors[layer.id].all || 1;
      const specificDivisor = periodDivisors[layer.id][gen.id] || 1;
      const effectivePeriodTicks = Math.max(1, Math.round(basePeriod / (allDivisor * specificDivisor)));
      const effectivePeriodMs = (effectivePeriodTicks / effectiveTicksPerSec) * 1000;
      const isOverdrive = effectivePeriodMs < 999.9 || (basePeriod > 1 && effectivePeriodMs <= 1000);
      const periodSpeedMult = basePeriod / effectivePeriodTicks;
      const odConfigMult = gen.overdriveMultiplier ?? layer.overdriveMultiplier ?? 1.0;
      const overdriveMult = isOverdrive ? odConfigMult : 1.0;
      genMult = genMult.mul(periodSpeedMult).mul(overdriveMult);

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
      generatorOverdriveMultipliers[layer.id][gen.id] = overdriveMult;
      generatorCyclePhase[layer.id][gen.id] = cyclePhase;

      // Bay Capacity soft cap on free spawned units
      const bayCfg = layer.bayCapacity?.[gen.id] || gen.bayCapacity || null;
      const bayCap = bayCfg
        ? ((bayCfg.base || 0) + (bayCfg.perBought || 0) * bought.toNumber()) * bayMult
        : Infinity;
      const effOwned = Number.isFinite(bayCap)
        ? computeBayEffectiveOwned(bought, owned, bayCap)
        : owned;
      const freeNum = Math.max(0, owned.toNumber() - bought.toNumber());
      const overflowRatio = Number.isFinite(bayCap) && bayCap > 0 && freeNum > bayCap
        ? (freeNum - bayCap) / bayCap
        : 0;
      bayCapacities[layer.id][gen.id] = bayCap;
      bayEffectiveOwned[layer.id][gen.id] = effOwned;
      bayOverflowRatios[layer.id][gen.id] = overflowRatio;
      layerOverflowSum += overflowRatio;

      const producesCurrency = !gen.produces || gen.produces === 'currency' || gen.produces.type === 'currency';
      if (producesCurrency) {
        if (currencyMultipliers[layer.id]) {
          genMult = genMult.mul(currencyMultipliers[layer.id]);
        }
        if (stanceObj.currencyMult !== undefined && stanceObj.currencyMult !== 1) {
          genMult = genMult.mul(stanceObj.currencyMult);
        }
        if (surgeOutMult !== 1) {
          genMult = genMult.mul(surgeOutMult);
        }
      } else {
        if (stanceObj.metaMult !== undefined && stanceObj.metaMult !== 1) {
          genMult = genMult.mul(stanceObj.metaMult);
        }
        if (cascadeMetaMultipliers[layer.id]) {
          genMult = genMult.mul(cascadeMetaMultipliers[layer.id]);
        }
      }

      const unitOutput = BigNum.from(gen.baseOutputPerTick).mul(genMult);
      generatorOutputs[layer.id][gen.id] = unitOutput;
      generatorBatchOutputs[layer.id][gen.id] = unitOutput.mul(effectivePeriodTicks);

      // Only generators producing layer currency directly contribute to layerProductionPerTick
      if (effOwned.gt(0) && producesCurrency) {
        layerProductionPerTick[layer.id] = layerProductionPerTick[layer.id].add(effOwned.mul(unitOutput));
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

    layerProductionPerSec[layer.id] = layerProductionPerTick[layer.id].mul(effectiveTicksPerSec);

    if (layer.capacitor) {
      const cap = layer.capacitor;
      const overflowBonus = Math.min(3.0, Math.max(0, layerOverflowSum));
      const chargeMult = stanceObj.chargeMult ?? 1.0;
      const passiveRate = cap.passiveChargePerTick || 0;
      const effectiveChargePerTick = isSurge ? 0 : passiveRate * (1 + overflowBonus) * chargeMult;
      const curCharge = Math.min(1, Math.max(0, layerState?.capacitorCharge || 0));
      const minDischarge = cap.minDischargeCharge ?? 0.40;
      const pulseCooldownMs = Math.max(0, layerState?.pulseCooldownMs || 0);
      const prodPerSecNum = layerProductionPerSec[layer.id].toNumber();
      const estPulseCurrency = new BigNum((cap.pulseBaseCurrency || 0) + prodPerSecNum * (cap.pulseRateSec || 0));
      capacitorStats[layer.id] = {
        name: cap.name || 'Capacitor',
        pulseLabel: cap.pulseLabel || 'Pulse',
        dischargeLabel: cap.dischargeLabel || 'Ignite Surge',
        surgeName: cap.surgeName || 'Surge Window',
        charge: curCharge,
        minDischargeCharge: minDischarge,
        canDischarge: !isSurge && curCharge >= minDischarge,
        isSurgeActive: isSurge,
        surgeTicksRemaining: Math.max(0, layerState?.surgeTicksRemaining || 0),
        maxSurgeTicks: cap.maxSurgeTicks || 16,
        surgeMultiplier: (cap.surgeMultiplier || 1.0) * (surgeBonusMultipliers[layer.id] || 1.0),
        surgeCycleFreqMult: cap.surgeCycleFreqMult || 1.0,
        surgeTickMult: cap.surgeTickMult || 1,
        pulseCooldownMs,
        pulseCooldownDurationMs: cap.pulseCooldownMs || 15000,
        canPulse: pulseCooldownMs <= 0,
        pulseChargeGain: isSurge ? 0 : (cap.pulseCharge || 0) * chargeMult,
        estimatedPulseCurrency: estPulseCurrency,
        passiveChargePerTick: passiveRate,
        effectiveChargePerTick,
        overflowBonus
      };
    } else {
      capacitorStats[layer.id] = null;
    }
  }

  // Upgrade Tree DAG Evaluation
  const upgradeCosts = {};
  const upgradeMilestones = {};
  const upgradeStatuses = {};
  for (const layer of config.layers) {
    upgradeCosts[layer.id] = {};
    upgradeMilestones[layer.id] = {};
    upgradeStatuses[layer.id] = {};
    const layerState = state.layers[layer.id];
    const upgNameById = Object.fromEntries((layer.upgrades || []).map(u => [u.id, u.name || u.id]));

    for (const upg of layer.upgrades || []) {
      const isLockedThreshold = Boolean(upg.unlockThreshold && layerState.runTotalCurrency.lt(upg.unlockThreshold));

      // Prerequisites
      let prereqsMet = true;
      const missingPrereqs = [];
      if (upg.prerequisites && upg.prerequisites.length > 0) {
        if (upg.requireMode === 'any') {
          prereqsMet = upg.prerequisites.some(p => (layerState.upgrades[p.id]?.level || 0) >= (p.minLevel || 1));
        } else {
          prereqsMet = upg.prerequisites.every(p => (layerState.upgrades[p.id]?.level || 0) >= (p.minLevel || 1));
        }
        if (!prereqsMet) {
          for (const p of upg.prerequisites) {
            if ((layerState.upgrades[p.id]?.level || 0) < (p.minLevel || 1)) {
              missingPrereqs.push(upgNameById[p.id] || p.id);
            }
          }
        }
      }

      // Mutual Exclusivity
      let isExclusiveLocked = false;
      const lockedBy = [];
      if (upg.exclusiveWith && upg.exclusiveWith.length > 0) {
        for (const siblingId of upg.exclusiveWith) {
          if ((layerState.upgrades[siblingId]?.level || 0) > 0) {
            isExclusiveLocked = true;
            lockedBy.push(upgNameById[siblingId] || siblingId);
          }
        }
      }

      const level = layerState.upgrades[upg.id]?.level || 0;
      const maxLevel = upg.maxLevel || Infinity;
      const isMaxed = level >= maxLevel;
      upgradeMilestones[layer.id][upg.id] = getUpgradeMilestoneInfo(level, upg);
      upgradeStatuses[layer.id][upg.id] = {
        level,
        maxLevel,
        isMaxed,
        isLockedThreshold,
        unlockThreshold: upg.unlockThreshold || null,
        prereqsMet,
        requireMode: upg.requireMode || 'all',
        missingPrereqs,
        isExclusiveLocked,
        lockedBy
      };

      if (isLockedThreshold || !prereqsMet || isExclusiveLocked) {
        upgradeCosts[layer.id][upg.id] = null; // Locked
      } else if (isMaxed) {
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
    cascadeMetaMultipliers,
    costScalingReductions,
    milestoneMultipliers,
    bayMultipliers,
    surgeBonusMultipliers,
    activeStances,
    capacitorStats,
    generatorOutputs,
    generatorBatchOutputs,
    generatorPeriods,
    generatorEffectivePeriodMs,
    generatorOverdrive,
    generatorOverdriveMultipliers,
    generatorCyclePhase,
    generatorMilestones,
    generatorCosts,
    maxAffordable,
    bayCapacities,
    bayEffectiveOwned,
    bayOverflowRatios,
    upgradeCosts,
    upgradeMilestones,
    upgradeStatuses,
    characterMilestone,
    prestigeRewards,
    layerProductionPerTick,
    layerProductionPerSec,
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

  // Split analytically if any Layer crosses a Surge Window expiry boundary within this step
  const tickCountNum = tickCount.toNumber();
  let minPositiveSurge = Infinity;
  for (const layer of config.layers) {
    if (!layer.capacitor) continue;
    const rem = state.layers[layer.id]?.surgeTicksRemaining || 0;
    if (rem > 0 && rem < minPositiveSurge) {
      minPositiveSurge = rem;
    }
  }
  if (Number.isFinite(minPositiveSurge) && tickCountNum > minPositiveSurge) {
    const firstPhase = advanceTicks(state, config, new BigNum(minPositiveSurge));
    return advanceTicks(firstPhase, config, tickCount.sub(minPositiveSurge));
  }

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

  if (topoOrder.length < genMap.size) {
    for (const key of genMap.keys()) {
      if (!topoOrder.includes(key)) topoOrder.push(key);
    }
  }

  const startTickNum = state.totalTicks ? Math.round(state.totalTicks.toNumber()) : 0;
  const roundTickCount = Math.round(tickCountNum);
  const endTickNum = startTickNum + roundTickCount;

  const effectiveRates = new Map();
  for (const u of topoOrder) {
    const { layer, gen } = genMap.get(u);
    let rate = stats.generatorOutputs[layer.id][gen.id] || new BigNum(0);
    const periodTicks = stats.generatorPeriods?.[layer.id]?.[gen.id] || 1;
    const isOverdrive = stats.generatorOverdrive?.[layer.id]?.[gen.id] || false;

    if (gen.batchPayout && periodTicks > 1 && !isOverdrive && roundTickCount > 0 && roundTickCount <= periodTicks) {
      const periodsCompleted = Math.floor(endTickNum / periodTicks) - Math.floor(startTickNum / periodTicks);
      rate = rate.mul((periodsCompleted * periodTicks) / roundTickCount);
    }
    effectiveRates.set(u, rate);
  }

  const usesAdvancedMechanics = config.layers.some(l => Boolean(l.bayCapacity || l.capacitor || l.stances));
  let canUseNumericRk4 = usesAdvancedMechanics && Number.isFinite(tickCountNum) && tickCountNum > 0 && tickCountNum < 1e150;
  if (canUseNumericRk4) {
    for (const layer of config.layers) {
      const ls = state.layers[layer.id];
      if (!Number.isFinite(ls?.currency?.toNumber()) || Math.abs(ls.currency.toNumber()) >= 1e150) {
        canUseNumericRk4 = false;
        break;
      }
      for (const gen of layer.generators || []) {
        const ownedNum = ls?.generators[gen.id]?.owned?.toNumber() || 0;
        const rateNum = effectiveRates.get(`${layer.id}:${gen.id}`)?.toNumber() || 0;
        if (!Number.isFinite(ownedNum) || !Number.isFinite(rateNum) || ownedNum >= 1e150 || rateNum >= 1e150) {
          canUseNumericRk4 = false;
          break;
        }
      }
      if (!canUseNumericRk4) break;
    }
  }

  if (canUseNumericRk4) {
    const curOwned = {};
    const boughtMap = {};
    const bayCapMap = {};
    const rateNumMap = {};
    const targetKeyMap = {};
    const currDelta = {};
    const chargeVec = {};

    for (const u of topoOrder) {
      const { layer, gen } = genMap.get(u);
      const gState = state.layers[layer.id].generators[gen.id];
      curOwned[u] = gState?.owned?.toNumber() || 0;
      boughtMap[u] = (gState?.bought || gState?.owned)?.toNumber() || 0;
      bayCapMap[u] = stats.bayCapacities[layer.id][gen.id];
      rateNumMap[u] = effectiveRates.get(u)?.toNumber() || 0;
      targetKeyMap[u] = outgoing.get(u);
    }

    const capLayers = [];
    for (const layer of config.layers) {
      currDelta[layer.id] = 0;
      const ls = state.layers[layer.id];
      chargeVec[layer.id] = Math.min(1, Math.max(0, ls?.capacitorCharge || 0));
      if (layer.capacitor && (ls?.surgeTicksRemaining || 0) <= 0 && (layer.capacitor.passiveChargePerTick || 0) > 0) {
        capLayers.push({
          id: layer.id,
          passiveRate: layer.capacitor.passiveChargePerTick || 0,
          chargeMult: stats.activeStances?.[layer.id]?.chargeMult ?? 1.0,
          genKeys: (layer.generators || [])
            .filter(g => Number.isFinite(stats.bayCapacities[layer.id][g.id]))
            .map(g => `${layer.id}:${g.id}`)
        });
      }
    }

    function evalDerivatives(ownedObj) {
      const dO = {};
      const dC = {};
      const dCh = {};
      for (const u of topoOrder) dO[u] = 0;
      for (const layer of config.layers) {
        dC[layer.id] = 0;
        dCh[layer.id] = 0;
      }
      for (const u of topoOrder) {
        const effOwned = computeBayEffectiveNum(boughtMap[u], ownedObj[u], bayCapMap[u]);
        const flux = effOwned * rateNumMap[u];
        const target = targetKeyMap[u];
        if (!target) continue;
        if (target.startsWith('currency:')) {
          dC[target.slice(9)] += flux;
        } else if (dO[target] !== undefined) {
          dO[target] += flux;
        }
      }
      for (const cl of capLayers) {
        let ovSum = 0;
        for (const gk of cl.genKeys) {
          const cap = bayCapMap[gk];
          if (Number.isFinite(cap) && cap > 0) {
            const free = Math.max(0, ownedObj[gk] - boughtMap[gk]);
            if (free > cap) ovSum += (free - cap) / cap;
          }
        }
        const ovBonus = Math.min(3.0, Math.max(0, ovSum));
        dCh[cl.id] = cl.passiveRate * (1 + ovBonus) * cl.chargeMult;
      }
      return { dO, dC, dCh };
    }

    const subSteps = tickCountNum <= 1 ? 1 : (tickCountNum <= 64 ? Math.max(1, Math.ceil(tickCountNum)) : 64);
    const h = tickCountNum / subSteps;

    for (let s = 0; s < subSteps; s++) {
      const k1 = evalDerivatives(curOwned);
      const y2 = {};
      for (const u of topoOrder) y2[u] = curOwned[u] + k1.dO[u] * (0.5 * h);
      const k2 = evalDerivatives(y2);
      const y3 = {};
      for (const u of topoOrder) y3[u] = curOwned[u] + k2.dO[u] * (0.5 * h);
      const k3 = evalDerivatives(y3);
      const y4 = {};
      for (const u of topoOrder) y4[u] = curOwned[u] + k3.dO[u] * h;
      const k4 = evalDerivatives(y4);

      const h6 = h / 6;
      for (const u of topoOrder) {
        curOwned[u] += (k1.dO[u] + 2 * k2.dO[u] + 2 * k3.dO[u] + k4.dO[u]) * h6;
      }
      for (const layer of config.layers) {
        const lid = layer.id;
        currDelta[lid] += (k1.dC[lid] + 2 * k2.dC[lid] + 2 * k3.dC[lid] + k4.dC[lid]) * h6;
      }
      for (const cl of capLayers) {
        const lid = cl.id;
        chargeVec[lid] = Math.min(1, chargeVec[lid] + (k1.dCh[lid] + 2 * k2.dCh[lid] + 2 * k3.dCh[lid] + k4.dCh[lid]) * h6);
      }
    }

    const nextLayers = {};
    for (const layer of config.layers) {
      const prevLayer = state.layers[layer.id];
      const nextGens = {};

      for (const gen of layer.generators || []) {
        const key = `${layer.id}:${gen.id}`;
        const prevGen = prevLayer.generators[gen.id];
        const prevOwned = prevGen?.owned || new BigNum(0);
        const nextOwned = new BigNum(curOwned[key]);
        const startTick = (prevOwned.isZero() && nextOwned.gt(0))
          ? endTickNum
          : (prevGen?.startTick || 0);

        nextGens[gen.id] = {
          bought: prevGen?.bought || prevOwned,
          owned: nextOwned,
          startTick
        };
      }

      const deltaBig = new BigNum(currDelta[layer.id]);
      const prevSurge = Math.max(0, prevLayer.surgeTicksRemaining || 0);
      const nextSurge = prevSurge > 0 ? Math.max(0, prevSurge - roundTickCount) : 0;
      const nextCharge = layer.capacitor
        ? (prevSurge > 0 ? (prevLayer.capacitorCharge || 0) : Math.min(1, Math.max(0, chargeVec[layer.id])))
        : (prevLayer.capacitorCharge || 0);

      nextLayers[layer.id] = {
        ...prevLayer,
        currency: prevLayer.currency.add(deltaBig),
        runTotalCurrency: prevLayer.runTotalCurrency.add(deltaBig),
        totalLifetimeCurrency: prevLayer.totalLifetimeCurrency.add(deltaBig),
        ticksInLayer: prevLayer.ticksInLayer.add(tickCount),
        capacitorCharge: nextCharge,
        surgeTicksRemaining: nextSurge,
        generators: nextGens
      };
    }

    return {
      ...state,
      totalTicks: state.totalTicks.add(tickCount),
      layers: nextLayers
    };
  }

  // Exact closed-form polynomial propagation (when bayCapacity/capacitor absent or extreme BigNum scale)
  const poly = new Map();
  for (const [key, { layer, gen }] of genMap) {
    const owned = state.layers[layer.id].generators[gen.id]?.owned || new BigNum(0);
    poly.set(key, [new BigNum(owned)]);
  }

  for (const layer of config.layers) {
    poly.set(`currency:${layer.id}`, [new BigNum(0)]);
  }

  for (const u of topoOrder) {
    const { layer, gen } = genMap.get(u);
    let rate = effectiveRates.get(u) || new BigNum(0);
    if (Number.isFinite(stats.bayCapacities?.[layer.id]?.[gen.id])) {
      const owned = state.layers[layer.id].generators[gen.id]?.owned || new BigNum(0);
      const effOwned = stats.bayEffectiveOwned?.[layer.id]?.[gen.id] || owned;
      if (owned.gt(0) && effOwned.lt(owned)) {
        rate = rate.mul(effOwned.div(owned));
      }
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
    const prevSurge = Math.max(0, prevLayer.surgeTicksRemaining || 0);
    const nextSurge = prevSurge > 0 ? Math.max(0, prevSurge - roundTickCount) : 0;

    nextLayers[layer.id] = {
      ...prevLayer,
      currency: prevLayer.currency.add(currencyDelta),
      runTotalCurrency: prevLayer.runTotalCurrency.add(currencyDelta),
      totalLifetimeCurrency: prevLayer.totalLifetimeCurrency.add(currencyDelta),
      ticksInLayer: prevLayer.ticksInLayer.add(tickCount),
      surgeTicksRemaining: nextSurge,
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
        currencyDeltas: {},
        capacitorChargeDeltas: {}
      }
    };
  }

  // Decrement Pulse cooldowns by elapsed wall time across all layers
  let totalOwned = 0;
  const cooldownUpdatedLayers = {};
  let hasCooldownChange = false;
  for (const layer of config.layers) {
    const ls = state.layers[layer.id];
    for (const gen of layer.generators || []) {
      totalOwned += ls?.generators[gen.id]?.owned.toNumber() || 0;
    }
    const prevCd = ls?.pulseCooldownMs || 0;
    const nextCd = Math.max(0, prevCd - elapsedMs);
    if (nextCd !== prevCd) {
      hasCooldownChange = true;
      cooldownUpdatedLayers[layer.id] = { ...ls, pulseCooldownMs: nextCd };
    } else {
      cooldownUpdatedLayers[layer.id] = ls;
    }
  }

  const stateWithCooldown = hasCooldownChange ? { ...state, layers: cooldownUpdatedLayers } : state;

  if (totalOwned === 0) {
    return {
      nextState: { ...stateWithCooldown, cycleRemainderMs: 0 },
      report: {
        elapsedMs,
        cyclesFired: new BigNum(0),
        ticksEmitted: new BigNum(0),
        currencyDeltas: {},
        capacitorChargeDeltas: {}
      }
    };
  }

  let workState = stateWithCooldown;
  let remainingMs = elapsedMs;
  let cyclesFired = new BigNum(0);
  let ticksEmitted = new BigNum(0);
  const maxSegments = config.layers.length + 2;

  for (let seg = 0; seg < maxSegments && remainingMs > 1e-6; seg++) {
    const segStats = getDerivedStats(workState, config);
    const cycleDuration = segStats.effectiveCycleDurationMs;
    const totalMs = (workState.cycleRemainderMs || 0) + remainingMs;
    const availCycles = Math.floor(totalMs / cycleDuration);

    // Check if an active Surge Window expires strictly within availCycles
    const tickYieldNum = Math.max(1e-9, segStats.tickYieldPerCycle.toNumber());
    let minSurgeCycles = Infinity;
    for (const layer of config.layers) {
      if (!layer.capacitor) continue;
      const remTicks = workState.layers[layer.id]?.surgeTicksRemaining || 0;
      if (remTicks > 0) {
        const c = Math.max(1, Math.ceil(remTicks / tickYieldNum));
        if (c < minSurgeCycles) minSurgeCycles = c;
      }
    }

    const splittingAtSurge = Number.isFinite(minSurgeCycles) && availCycles > minSurgeCycles;
    const cyclesThisSeg = splittingAtSurge ? minSurgeCycles : availCycles;
    const nextRemainderMs = splittingAtSurge ? 0 : (totalMs % cycleDuration);

    if (splittingAtSurge) {
      const msConsumed = cyclesThisSeg * cycleDuration - (workState.cycleRemainderMs || 0);
      remainingMs = Math.max(0, remainingMs - msConsumed);
    } else {
      remainingMs = 0;
    }

    workState = {
      ...workState,
      cycleRemainderMs: nextRemainderMs,
      totalCycles: workState.totalCycles.add(cyclesThisSeg)
    };
    cyclesFired = cyclesFired.add(cyclesThisSeg);

    if (cyclesThisSeg > 0) {
      const isChunked = options.mode === 'chunked' || Boolean(config.irreducible);
      if (isChunked && cyclesThisSeg > 1) {
        const maxSlices = options.maxSlices || 1000;
        const sliceCount = Math.min(cyclesThisSeg, maxSlices);
        const cyclesPerSlice = Math.floor(cyclesThisSeg / sliceCount);
        let remainingCycles = cyclesThisSeg;

        for (let s = 0; s < sliceCount; s++) {
          const sliceCycles = (s === sliceCount - 1) ? remainingCycles : cyclesPerSlice;
          remainingCycles -= sliceCycles;
          const sliceTicks = segStats.tickYieldPerCycle.mul(sliceCycles);
          workState = advanceTicks(workState, config, sliceTicks);
          ticksEmitted = ticksEmitted.add(sliceTicks);
        }
      } else {
        const segTicks = segStats.tickYieldPerCycle.mul(cyclesThisSeg);
        workState = advanceTicks(workState, config, segTicks);
        ticksEmitted = ticksEmitted.add(segTicks);
      }
    }

    if (!splittingAtSurge) break;
  }

  const currencyDeltas = {};
  const capacitorChargeDeltas = {};
  for (const layer of config.layers) {
    currencyDeltas[layer.id] = workState.layers[layer.id].currency.sub(state.layers[layer.id].currency);
    capacitorChargeDeltas[layer.id] =
      (workState.layers[layer.id].capacitorCharge || 0) - (state.layers[layer.id].capacitorCharge || 0);
  }

  return {
    nextState: workState,
    report: {
      elapsedMs,
      cyclesFired,
      ticksEmitted,
      currencyDeltas,
      capacitorChargeDeltas
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

export function setStance(state, config, layerId, stanceId) {
  const layerConfig = config.layers.find(l => l.id === layerId);
  const layerState = state.layers[layerId];
  if (!layerConfig || !layerState) return state;
  if (!layerConfig.stances || !layerConfig.stances.some(s => s.id === stanceId)) {
    return state;
  }
  if (layerState.stanceId === stanceId) return state;

  return {
    ...state,
    layers: {
      ...state.layers,
      [layerId]: {
        ...layerState,
        stanceId
      }
    }
  };
}

export function triggerPulse(state, config, layerId = 'layer0') {
  const layerConfig = config.layers.find(l => l.id === layerId);
  const layerState = state.layers[layerId];
  const cap = layerConfig?.capacitor;
  if (!cap || !layerState) return state;
  if ((layerState.pulseCooldownMs || 0) > 0) return state;

  const stats = getDerivedStats(state, config);
  const capStats = stats.capacitorStats?.[layerId];
  if (!capStats || !capStats.canPulse) return state;

  const pulseGain = capStats.estimatedPulseCurrency || new BigNum(0);
  const chargeGain = capStats.pulseChargeGain || 0;
  const nextCharge = capStats.isSurgeActive
    ? (layerState.capacitorCharge || 0)
    : Math.min(1, (layerState.capacitorCharge || 0) + chargeGain);

  return {
    ...state,
    layers: {
      ...state.layers,
      [layerId]: {
        ...layerState,
        currency: layerState.currency.add(pulseGain),
        runTotalCurrency: layerState.runTotalCurrency.add(pulseGain),
        totalLifetimeCurrency: layerState.totalLifetimeCurrency.add(pulseGain),
        capacitorCharge: nextCharge,
        pulseCooldownMs: cap.pulseCooldownMs || 15000
      }
    }
  };
}

export function dischargeCapacitor(state, config, layerId = 'layer0') {
  const layerConfig = config.layers.find(l => l.id === layerId);
  const layerState = state.layers[layerId];
  const cap = layerConfig?.capacitor;
  if (!cap || !layerState) return state;

  const minCharge = cap.minDischargeCharge ?? 0.40;
  const curCharge = Math.min(1, Math.max(0, layerState.capacitorCharge || 0));
  if (curCharge < minCharge || (layerState.surgeTicksRemaining || 0) > 0) {
    return state;
  }

  const surgeTicks = Math.max(1, Math.round((cap.maxSurgeTicks || 16) * curCharge));
  return {
    ...state,
    layers: {
      ...state.layers,
      [layerId]: {
        ...layerState,
        capacitorCharge: 0,
        surgeTicksRemaining: surgeTicks
      }
    }
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
    stanceId: targetConfig.defaultStanceId || 'balanced',
    capacitorCharge: 0,
    surgeTicksRemaining: 0,
    pulseCooldownMs: 0,
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
