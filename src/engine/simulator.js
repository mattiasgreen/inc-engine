// src/engine/simulator.js
// Event-Skipping and Analytical Progression Simulator

import { BigNum } from './bignum.js';
import {
  advanceTime,
  buyGenerator,
  buyUpgrade,
  setStance,
  triggerPulse,
  dischargeCapacitor,
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
  if (action.type === 'setStance') {
    return setStance(state, config, action.layerId, action.stanceId);
  }
  if (action.type === 'triggerPulse') {
    return triggerPulse(state, config, action.layerId);
  }
  if (action.type === 'dischargeCapacitor') {
    return dischargeCapacitor(state, config, action.layerId);
  }
  if (action.type === 'resetLayer') {
    return resetLayer(state, config, action.layerId);
  }
  return state;
}

const AGENCY_ACTION_TYPES = new Set(['setStance', 'triggerPulse', 'dischargeCapacitor']);

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

    const maxJumpMs = options.maxJumpMs ?? policy?.maxWaitChunkMs ?? Infinity;

    let simulatedMs = 0;
    let lastActionMs = 0;
    let steps = 0;
    const history = [];

    while (simulatedMs < maxSimulatedMs && steps < maxSteps) {
      steps++;

      if (stopCondition && stopCondition(state)) {
        break;
      }

      const action = policy ? policy.decideAction(state, this.config, {
        simulatedMs,
        remainingMs: maxSimulatedMs - simulatedMs
      }) : null;
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

      if (action.type === 'offlineBreak') {
        if (action.prepareAction) {
          const prepNext = executeAction(state, this.config, action.prepareAction);
          if (prepNext !== state) {
            state = prepNext;
            history.push({ simulatedMs, waitMs: 0, action: action.prepareAction });
          }
        }
        const breakMs = Math.min(action.delayMs || 0, maxSimulatedMs - simulatedMs);
        if (breakMs > 0) {
          const { nextState } = advanceTime(state, this.config, breakMs);
          state = nextState;
          simulatedMs += breakMs;
          history.push({ simulatedMs, waitMs: breakMs, action });
        }
        continue;
      }

      if (action.type === 'resetLayer') {
        state = executeAction(state, this.config, action);
        history.push({ simulatedMs, waitMs: simulatedMs - lastActionMs, action });
        lastActionMs = simulatedMs;
        continue;
      }

      if (AGENCY_ACTION_TYPES.has(action.type)) {
        const next = executeAction(state, this.config, action);
        if (next === state) {
          // Guard against accidental no-op agency spin
          const stepMs = Math.min(1000, maxSimulatedMs - simulatedMs);
          if (stepMs <= 0) break;
          state = advanceTime(state, this.config, stepMs).nextState;
          simulatedMs += stepMs;
        } else {
          state = next;
          history.push({ simulatedMs, waitMs: 0, action });
        }
        continue;
      }

      const layerState = state.layers[action.layerId];

      if (action.delayMs > 0) {
        const stepDelay = Math.min(action.delayMs, maxSimulatedMs - simulatedMs);
        if (stepDelay > 0) {
          const { nextState } = advanceTime(state, this.config, stepDelay);
          state = nextState;
          simulatedMs += stepDelay;
        }
      }

      const currentAfterDelay = state.layers[action.layerId];
      if (currentAfterDelay && currentAfterDelay.currency.gte(action.cost)) {
        if (action.reactionLagMs > 0) {
          const lagMs = Math.min(action.reactionLagMs, maxSimulatedMs - simulatedMs);
          if (lagMs > 0) {
            const { nextState } = advanceTime(state, this.config, lagMs);
            state = nextState;
            simulatedMs += lagMs;
          }
          if (stopCondition && stopCondition(state)) break;
        }
        state = executeAction(state, this.config, action);
        history.push({ simulatedMs, waitMs: simulatedMs - lastActionMs, action });
        lastActionMs = simulatedMs;
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

      // Check if any metagenerators are owned (growing production rate over time)
      const layerConfig = this.config.layers.find(l => l.id === action.layerId);
      const hasActiveMetagenerator = (layerConfig?.generators || []).some(
        g => g.produces && g.produces.type === 'generator' && layerState.generators[g.id]?.owned.gt(0)
      );

      // Compute cycles needed using BigNum division and ceiling
      const deficit = action.cost.sub(state.layers[action.layerId].currency);
      const cyclesNeededBig = deficit.div(prodPerCycle).ceil();
      const cyclesNeededNum = cyclesNeededBig.toNumber();
      let safeCycles = Math.max(1, Math.min(cyclesNeededNum, 1e9));
      if (hasActiveMetagenerator && safeCycles > 20) {
        safeCycles = Math.max(10, Math.ceil(safeCycles * 0.35));
      }
      let jumpMs = safeCycles * cycleDuration;

      if (Number.isFinite(maxJumpMs) && maxJumpMs > 0) {
        jumpMs = Math.min(jumpMs, maxJumpMs);
      }

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
        if (action.reactionLagMs > 0) {
          const lagMs = Math.min(action.reactionLagMs, maxSimulatedMs - simulatedMs);
          if (lagMs > 0) {
            const { nextState: lagged } = advanceTime(state, this.config, lagMs);
            state = lagged;
            simulatedMs += lagMs;
          }
          if (stopCondition && stopCondition(state)) break;
        }
        state = executeAction(state, this.config, action);
        history.push({ simulatedMs, waitMs: simulatedMs - lastActionMs, action });
        lastActionMs = simulatedMs;
      }
    }

    return {
      state,
      simulatedMs,
      steps,
      history
    };
  }

  runSchedule(initialState, policy, schedule, options = {}) {
    let state = initialState;
    const stopCondition = options.stopCondition || null;
    let totalWallMs = 0;
    let activeMs = 0;
    let offlineMs = 0;
    let reachedTarget = false;
    const sessions = [];
    const history = [];

    for (const block of schedule) {
      if (stopCondition && stopCondition(state)) {
        reachedTarget = true;
        break;
      }

      if (block.type === 'online') {
        const res = this.run(state, policy, {
          maxSimulatedMs: block.durationMs,
          stopCondition,
          maxSteps: options.maxSteps ?? 50000,
          maxJumpMs: options.maxJumpMs
        });
        const blockStart = totalWallMs;
        for (const item of res.history) {
          history.push({
            ...item,
            simulatedMs: blockStart + item.simulatedMs
          });
        }
        const economicPurchases = res.history.filter(
          h => h.action.type === 'buyGenerator' || h.action.type === 'buyUpgrade' || h.action.type === 'resetLayer'
        ).length;

        state = res.state;
        totalWallMs += res.simulatedMs;
        activeMs += res.simulatedMs;
        sessions.push({
          label: block.label || 'online',
          type: 'online',
          durationMs: res.simulatedMs,
          purchases: economicPurchases,
          endRunTotal: state.layers.layer0.runTotalCurrency.toNumber()
        });

        if (stopCondition && stopCondition(state)) {
          reachedTarget = true;
          break;
        }
      } else if (block.type === 'offline') {
        if (policy && typeof policy.prepareForOffline === 'function') {
          const prepAction = policy.prepareForOffline(state, this.config);
          if (prepAction) {
            const prepNext = executeAction(state, this.config, prepAction);
            if (prepNext !== state) {
              state = prepNext;
              history.push({ simulatedMs: totalWallMs, waitMs: 0, action: prepAction });
            }
          }
        }

        const { nextState, report } = advanceTime(state, this.config, block.durationMs);
        state = nextState;
        totalWallMs += block.durationMs;
        offlineMs += block.durationMs;
        sessions.push({
          label: block.label || 'offline',
          type: 'offline',
          durationMs: block.durationMs,
          purchases: 0,
          currencyGained: report.currencyDeltas?.layer0?.toNumber() || 0,
          endRunTotal: state.layers.layer0.runTotalCurrency.toNumber()
        });

        if (stopCondition && stopCondition(state)) {
          reachedTarget = true;
          break;
        }
      }
    }

    return {
      state,
      totalWallMs,
      activeMs,
      offlineMs,
      reachedTarget,
      sessions,
      history
    };
  }
}
