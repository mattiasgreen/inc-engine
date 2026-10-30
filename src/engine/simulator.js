// src/engine/simulator.js
// Event-Skipping and Analytical Progression Simulator

import { BigNum } from './bignum.js';
import {
  advanceTime,
  buyGenerator,
  buyUpgrade,
  resetLayer,
  getDerivedStats
} from './core.js';

function executeAction(state, config, action) {
  if (action.type === 'buyGenerator') {
    return buyGenerator(state, config, action.layerId, action.id, 1);
  }
  if (action.type === 'buyUpgrade') {
    return buyUpgrade(state, config, action.layerId, action.id);
  }
  if (action.type === 'resetLayer') {
    return resetLayer(state, config, action.layerId);
  }
  return state;
}

export class Simulator {
  constructor(config) {
    this.config = config;
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
        // No further actions; jump remaining time analytically in one step
        const remainingMs = maxSimulatedMs - simulatedMs;
        if (remainingMs > 0) {
          const { nextState } = advanceTime(state, this.config, remainingMs);
          state = nextState;
          simulatedMs += remainingMs;
        }
        break;
      }

      const layerState = state.layers[action.layerId];

      if (action.type === 'resetLayer') {
        state = executeAction(state, this.config, action);
        history.push({ simulatedMs, action });
        continue;
      }

      if (layerState && layerState.currency.gte(action.cost)) {
        state = executeAction(state, this.config, action);
        history.push({ simulatedMs, action });
        continue;
      }

      // Action is not yet affordable: calculate time to next event
      const stats = getDerivedStats(state, this.config);
      const prodPerTick = stats.layerProductionPerTick[action.layerId] || new BigNum(0);
      const cycleDuration = stats.effectiveCycleDurationMs;
      const ticksPerCycle = stats.tickYieldPerCycle;
      const prodPerCycle = prodPerTick.mul(ticksPerCycle);

      if (prodPerCycle.lte(0)) {
        // No production in this layer: advance remaining time and stop
        const remainingMs = maxSimulatedMs - simulatedMs;
        const { nextState } = advanceTime(state, this.config, remainingMs);
        state = nextState;
        simulatedMs += remainingMs;
        break;
      }

      // Compute cycles needed using BigNum division and ceiling
      const deficit = action.cost.sub(layerState.currency);
      const cyclesNeededBig = deficit.div(prodPerCycle).ceil();
      const cyclesNeededNum = cyclesNeededBig.toNumber();
      const safeCycles = Math.max(1, Math.min(cyclesNeededNum, 1e9));
      let jumpMs = safeCycles * cycleDuration;

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

      // If affordable after jump, execute action
      const currentLayer = state.layers[action.layerId];
      if (currentLayer && currentLayer.currency.gte(action.cost)) {
        state = executeAction(state, this.config, action);
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
