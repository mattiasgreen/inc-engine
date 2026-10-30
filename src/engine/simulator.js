// src/engine/simulator.js
// Event-Skipping and Analytical Progression Simulator

import { BigNum } from './bignum.js';
import {
  advanceTime,
  advanceTicks,
  buyGenerator,
  buyUpgrade,
  resetLayer,
  getDerivedStats
} from './core.js';

export class Simulator {
  constructor(config) {
    this.config = config;
  }

  buyGenerator(state, layerId, genId, countOrMax = 1) {
    return buyGenerator(state, this.config, layerId, genId, countOrMax);
  }

  buyUpgrade(state, layerId, upgId) {
    return buyUpgrade(state, this.config, layerId, upgId);
  }

  resetLayer(state, layerId) {
    return resetLayer(state, this.config, layerId);
  }

  run(initialState, policy, options = {}) {
    let state = initialState;
    const maxSimulatedMs = options.maxSimulatedMs ?? 3600000;
    const maxSteps = options.maxSteps ?? 50000;
    const stopCondition = options.stopCondition || null;

    let simulatedMs = 0;
    let steps = 0;
    const history = [];

    while (simulatedMs < maxSimulatedMs && steps < maxSteps) {
      steps++;

      if (stopCondition && stopCondition(state)) {
        break;
      }

      const action = policy ? policy.decideAction(state, this.config) : null;
      if (!action) {
        // No further actions to take; jump remaining time in one analytical step
        const remainingMs = maxSimulatedMs - simulatedMs;
        if (remainingMs > 0) {
          const { nextState } = advanceTime(state, this.config, remainingMs);
          state = nextState;
          simulatedMs += remainingMs;
        }
        break;
      }

      const layerState = state.layers[action.layerId];
      if (layerState && layerState.currency.gte(action.cost)) {
        // Affordable immediately
        if (action.type === 'buyGenerator') {
          state = buyGenerator(state, this.config, action.layerId, action.id, 1);
        } else if (action.type === 'buyUpgrade') {
          state = buyUpgrade(state, this.config, action.layerId, action.id);
        }
        history.push({ simulatedMs, action });
        continue;
      }

      // Action is not yet affordable: calculate time to next event
      const stats = getDerivedStats(state, this.config);
      let prodPerTick = new BigNum(0);
      for (const gen of this.config.layers.find(l => l.id === action.layerId)?.generators || []) {
        const owned = layerState.generators[gen.id].owned;
        if (owned.gt(0)) {
          prodPerTick = prodPerTick.add(owned.mul(stats.generatorOutputs[action.layerId][gen.id]));
        }
      }

      const cycleDuration = stats.effectiveCycleDurationMs;
      const ticksPerCycle = stats.tickYieldPerCycle;
      const prodPerCycle = prodPerTick.mul(ticksPerCycle).toNumber();

      if (prodPerCycle <= 0) {
        // No production: advance remaining time and stop
        const remainingMs = maxSimulatedMs - simulatedMs;
        const { nextState } = advanceTime(state, this.config, remainingMs);
        state = nextState;
        simulatedMs += remainingMs;
        break;
      }

      const deficit = action.cost.sub(layerState.currency).toNumber();
      const cyclesNeeded = Math.max(1, Math.ceil(deficit / prodPerCycle));
      let jumpMs = cyclesNeeded * cycleDuration;

      const remainingMs = maxSimulatedMs - simulatedMs;
      if (jumpMs > remainingMs) {
        jumpMs = remainingMs;
      }

      const { nextState } = advanceTime(state, this.config, jumpMs);
      state = nextState;
      simulatedMs += jumpMs;

      if (stopCondition && stopCondition(state)) {
        break;
      }

      // If affordable after jump, buy it
      const currentLayer = state.layers[action.layerId];
      if (currentLayer.currency.gte(action.cost)) {
        if (action.type === 'buyGenerator') {
          state = buyGenerator(state, this.config, action.layerId, action.id, 1);
        } else if (action.type === 'buyUpgrade') {
          state = buyUpgrade(state, this.config, action.layerId, action.id);
        }
        history.push({ simulatedMs, action });
      }
    }

    return {
      state,
      simulatedMs,
      steps,
      history
    };
  }
}
