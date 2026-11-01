// src/engine/view-model.js
// Pure functional View-Model generator for inc-engine
// Decouples all string formatting, float sanitization, and presentation state from DOM manipulators.

import { BigNum } from './bignum.js';

export function formatInteger(val) {
  if (val === null || val === undefined) return '0';
  const num = typeof val === 'number' ? val : (val.toNumber ? val.toNumber() : Number(val));
  if (!Number.isFinite(num)) return '0';
  return Math.round(num).toLocaleString();
}

export function formatDuration(sec) {
  if (!Number.isFinite(sec) || sec <= 0) return '';
  if (sec < 60) return `ETA: ~${Math.max(1, Math.ceil(sec))}s`;
  const totalMins = Math.floor(sec / 60);
  const remSec = Math.round(sec % 60);
  if (totalMins < 60) {
    return remSec > 0 ? `ETA: ~${totalMins}m ${remSec}s` : `ETA: ~${totalMins}m`;
  }
  const hrs = Math.floor(totalMins / 60);
  const remMins = totalMins % 60;
  return `ETA: ~${hrs}h ${remMins}m`;
}

export function createViewModel(state, config, stats, fidelitySettings = {}) {
  const layer0 = state.layers.layer0;
  const l0Config = config.layers[0];
  const l1Config = config.layers[1];
  const layer1 = state.layers[layer1ConfigId(config)];

  const l0Currency = layer0 ? layer0.currency : new BigNum(0);
  const l0RunTotal = layer0 ? layer0.runTotalCurrency : new BigNum(0);

  const netOutputPerTick = stats.layerProductionPerTick?.layer0 || new BigNum(0);
  const effTicksPerSec = stats.effectiveTicksPerSec || 1.0;
  const netOutputPerSec = netOutputPerTick.mul(effTicksPerSec);
  const netOutputPerSecNum = netOutputPerSec.toNumber();

  // Header State
  const header = {
    currencyFormatted: l0Currency.format(),
    currencySymbol: l0Config?.currency?.symbol || '',
    currencyName: l0Config?.currency?.name || '',
    rateFormatted: netOutputPerSec.format(),
    rateUnit: `${l0Config?.currency?.symbol || ''}/s`,
    runTotalFormatted: l0RunTotal.format(),
    character: {
      name: config.character?.name || '',
      title: config.character?.title || '',
      image: config.character?.image || '',
      portraitAsset: stats.characterMilestone?.assetPath || config.character?.image || ''
    }
  };

  // Generators View State
  const generators = {};
  for (const layer of config.layers) {
    generators[layer.id] = {};
    const layerState = state.layers[layer.id];

    for (const gen of layer.generators || []) {
      const genState = layerState?.generators?.[gen.id];
      const owned = genState?.owned || new BigNum(0);
      const bought = genState?.bought || new BigNum(0);
      const cost1 = stats.generatorCosts?.[layer.id]?.[gen.id] || BigNum.from(gen.baseCost);
      const maxInfo = stats.maxAffordable?.[layer.id]?.[gen.id] || { count: 0, totalCost: new BigNum(0) };
      const canAfford1 = cost1 && layerState ? layerState.currency.gte(cost1) : false;

      // Milestone metadata (strictly integer-rounded display)
      const msInfo = stats.generatorMilestones?.[layer.id]?.[gen.id];
      const tierId = msInfo?.tierId || 'm0';
      const boughtCountInt = Math.round(msInfo?.boughtCount || bought.toNumber());
      const nextThresholdInt = msInfo?.nextThreshold ? Math.round(msInfo.nextThreshold) : null;
      const multStr = msInfo && msInfo.multiplier > 1 ? ` · ${msInfo.multiplier.toFixed(1).replace(/\.0$/, '')}x` : '';
      const nextStr = nextThresholdInt
        ? ` · ${boughtCountInt}/${nextThresholdInt} to ${msInfo.nextTierName} (${msInfo.nextMultiplier.toFixed(1).replace(/\.0$/, '')}x)`
        : ' · MAX TIER';
      const milestoneBadgeText = msInfo
        ? `${msInfo.tierName} (${tierId}${multStr})${nextStr}`
        : `Common (m0) · 0/25 to Uncommon (2x)`;

      // Cycle State & Animation Parameters
      const periodTicks = stats.generatorPeriods?.[layer.id]?.[gen.id] || 1;
      const effPeriodMs = Math.round(stats.generatorEffectivePeriodMs?.[layer.id]?.[gen.id] || 1000);
      const isOverdrive = stats.generatorOverdrive?.[layer.id]?.[gen.id] || false;
      const hasUnits = owned.gt(0);

      let cycleState = 'standby';
      if (!hasUnits) {
        cycleState = 'standby';
      } else if (fidelitySettings.progressBarMode === 'off') {
        cycleState = 'static';
      } else if (isOverdrive) {
        cycleState = 'overdrive';
      } else {
        cycleState = 'cycling';
      }

      let periodText = '';
      let phaseText = '';
      if (!hasUnits) {
        periodText = `${periodTicks} ${periodTicks === 1 ? 'Tick' : 'Ticks'} (${(effPeriodMs / 1000).toFixed(1)}s)`;
        phaseText = 'Standby (Buy to start)';
      } else if (isOverdrive) {
        const hz = (1000 / effPeriodMs).toFixed(2);
        periodText = `OVERDRIVE · ${hz} Hz`;
        phaseText = 'FLOWING';
      } else {
        periodText = `${periodTicks} ${periodTicks === 1 ? 'Tick' : 'Ticks'} (${(effPeriodMs / 1000).toFixed(1)}s/cycle)`;
        if (fidelitySettings.progressBarMode === 'off') {
          phaseText = 'Active';
        } else if (effPeriodMs < 15000) {
          phaseText = '';
        } else {
          const phase = stats.generatorCyclePhase?.[layer.id]?.[gen.id] || 0;
          const pct = Math.min(99, Math.floor(phase * 100));
          phaseText = `${pct}%`;
        }
      }

      // Output text
      const rate = stats.generatorOutputs?.[layer.id]?.[gen.id] || new BigNum(0);
      const ratePerSec = rate.mul(effTicksPerSec);
      let outputHtml = '';
      if (gen.produces && typeof gen.produces === 'object' && gen.produces.type === 'generator') {
        const targetGen = layer.generators.find(g => g.id === gen.produces.targetId);
        const targetName = targetGen?.name || gen.produces.targetId;
        outputHtml = `Produces: <strong>${targetName}</strong> (+<strong>${rate.format()}</strong>/tick | +<strong>${ratePerSec.format()}</strong>/s)`;
      } else {
        outputHtml = `Output: <strong>${rate.format()}</strong> ${layer.currency.symbol}/tick | <strong>${ratePerSec.format()}</strong> ${layer.currency.symbol}/s`;
      }

      // ETA Hint
      let etaText = '';
      if (!canAfford1 && netOutputPerSecNum > 0 && layerState) {
        const deficit = cost1.sub(layerState.currency).toNumber();
        if (deficit > 0) {
          etaText = formatDuration(deficit / netOutputPerSecNum);
        }
      }

      generators[layer.id][gen.id] = {
        id: gen.id,
        name: gen.name,
        ownedText: `Owned: ${owned.format()}`,
        boughtText: `${formatInteger(bought)} bought`,
        milestoneBadgeText,
        milestoneTier: tierId,
        milestoneAsset: msInfo?.assetPath || gen.image || '',
        cycleState,
        periodMs: effPeriodMs,
        periodText,
        phaseText,
        outputHtml,
        etaText,
        canAfford1,
        cost1Formatted: cost1.format(),
        buy1Text: `Buy 1 (${cost1.format()} ${layer.currency.symbol})`,
        canAffordMax: maxInfo.count > 0,
        buyMaxCount: maxInfo.count,
        buyMaxText: `Buy Max (${maxInfo.count})`
      };
    }
  }

  // Upgrades View State
  const upgrades = {};
  for (const layer of config.layers) {
    upgrades[layer.id] = {};
    const layerState = state.layers[layer.id];

    for (const upg of layer.upgrades || []) {
      const level = layerState?.upgrades?.[upg.id]?.level || 0;
      const isMax = level >= upg.maxLevel;
      const cost = stats.upgradeCosts?.[layer.id]?.[upg.id];
      const canAfford = !isMax && cost && layerState ? layerState.currency.gte(cost) : false;

      const upgMs = stats.upgradeMilestones?.[layer.id]?.[upg.id];
      const tierId = upgMs?.tierId || 'm0';
      const tierBadgeText = upgMs ? `${upgMs.tierName} (${tierId})` : 'Common (m0)';

      let etaText = '';
      if (!isMax && cost && !canAfford && netOutputPerSecNum > 0 && layerState) {
        const deficit = cost.sub(layerState.currency).toNumber();
        if (deficit > 0) {
          etaText = formatDuration(deficit / netOutputPerSecNum);
        }
      }

      const costText = isMax
        ? 'Maxed'
        : cost
        ? `Buy (${cost.format()} ${layer.currency.symbol})`
        : 'Unavailable';

      upgrades[layer.id][upg.id] = {
        id: upg.id,
        name: upg.name,
        level,
        maxLevel: upg.maxLevel,
        isMax,
        tierId,
        tierBadgeText,
        assetPath: upgMs?.assetPath || upg.image || '',
        levelText: isMax ? 'MAX' : `Lvl ${level}/${upg.maxLevel}`,
        costText,
        canAfford,
        etaText
      };
    }
  }

  // Prestige View State
  const l1Id = layer1ConfigId(config);
  const prestigeReward = stats.prestigeRewards?.[l1Id] || new BigNum(0);
  const threshold = BigNum.from(l1Config?.prestige?.thresholdCurrency || 1e6);
  const canPrestige = l0RunTotal.gte(threshold) && prestigeReward.gt(0);

  const prestige = {
    canPrestige,
    rewardText: `+${prestigeReward.format()} ${l1Config?.currency?.name || 'Prestige Units'}`,
    thresholdText: `Requires ${threshold.format()} ${l0Config?.currency?.name || 'Currency'}`
  };

  return {
    header,
    generators,
    upgrades,
    prestige
  };
}

function layer1ConfigId(config) {
  return config.layers[1]?.id || 'layer1';
}
