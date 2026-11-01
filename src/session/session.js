// src/session/session.js
// Imperative Shell: Session Coordinator for inc-engine

import { BigNum } from '../engine/bignum.js';
import {
  createInitialState,
  getDerivedStats,
  advanceTime,
  buyGenerator,
  buyUpgrade,
  resetLayer,
  enforceProgressionInvariant
} from '../engine/core.js';
import { SystemClock, BrowserStorage } from './ports.js';

export const MAX_OFFLINE_PROGRESS_MS = 24 * 60 * 60 * 1000; // 24-hour progression cap

export class GameSession {
  constructor(options = {}) {
    this.config = options.config;
    this.clock = options.clock || new SystemClock();
    this.storage = options.storage || new BrowserStorage();
    this.storageKey = options.storageKey || (this.config?.id ? `inc_engine_save_${this.config.id}` : 'inc_engine_save');
    this.activeTimestampKey = `${this.storageKey}_active_time`;

    this.state = createInitialState(this.config);
    this.lastSavedAtMs = this.clock.nowMs();
    this.lastTickAtMs = this.clock.nowMs();
    this.lastActiveAtMs = this.clock.nowMs();
  }

  getState() {
    return this.state;
  }

  getDerivedStats() {
    return getDerivedStats(this.state, this.config);
  }

  tickToNow() {
    const now = this.clock.nowMs();
    const elapsedMs = Math.max(0, now - this.lastTickAtMs);
    this.lastTickAtMs = now;
    this.lastActiveAtMs = now;
    if (elapsedMs <= 0) return null;

    const { nextState, report } = advanceTime(this.state, this.config, elapsedMs);
    this.state = nextState;
    return report;
  }

  _advanceOffline(elapsedMs, options = {}) {
    const now = this.clock.nowMs();
    const maxCap = options.maxOfflineMs || MAX_OFFLINE_PROGRESS_MS;
    const clampedMs = Math.min(Math.max(0, elapsedMs), maxCap);

    this.lastTickAtMs = now;
    this.lastActiveAtMs = now;

    if (clampedMs <= 0) return null;

    const { nextState, report } = advanceTime(this.state, this.config, clampedMs, options);
    this.state = nextState;
    this.save();
    return report;
  }

  resumeOfflineProgress(options = {}) {
    const now = this.clock.nowMs();
    let lastActive = options.referenceTimeMs || this.lastActiveAtMs || this.lastTickAtMs;

    const storedActive = this.storage.getItem(this.activeTimestampKey);
    if (storedActive) {
      const parsed = parseInt(storedActive, 10);
      if (!isNaN(parsed) && parsed < lastActive) {
        lastActive = parsed;
      }
    }

    const elapsedMs = Math.max(0, now - lastActive);
    return this._advanceOffline(elapsedMs, options);
  }

  jumpTime(elapsedMs, options = {}) {
    const { nextState, report } = advanceTime(this.state, this.config, elapsedMs, options);
    this.state = nextState;
    this.lastTickAtMs = this.clock.nowMs();
    return report;
  }

  syncFromSimulation(newState) {
    this.state = newState;
    this.lastTickAtMs = this.clock.nowMs();
  }

  buyGenerator(layerId, genId, countOrMax = 1) {
    let totalOwnedBefore = 0;
    for (const layer of this.config.layers) {
      for (const gen of layer.generators || []) {
        totalOwnedBefore += this.state.layers[layer.id]?.generators[gen.id]?.owned.toNumber() || 0;
      }
    }
    this.state = buyGenerator(this.state, this.config, layerId, genId, countOrMax);
    if (totalOwnedBefore === 0) {
      this.lastTickAtMs = this.clock.nowMs();
      this.state.cycleRemainderMs = 0;
    }
  }

  buyUpgrade(layerId, upgId) {
    this.state = buyUpgrade(this.state, this.config, layerId, upgId);
  }

  resetLayer(layerId) {
    this.state = resetLayer(this.state, this.config, layerId);
    this.save();
  }

  serializeState() {
    const serialized = {
      version: 1,
      savedAtMs: this.clock.nowMs(),
      cycleRemainderMs: this.state.cycleRemainderMs,
      totalCycles: this.state.totalCycles.toJSON(),
      totalTicks: this.state.totalTicks.toJSON(),
      layers: {}
    };

    for (const [layerId, layerState] of Object.entries(this.state.layers)) {
      const serializedLayer = {
        currency: layerState.currency.toJSON(),
        runTotalCurrency: layerState.runTotalCurrency.toJSON(),
        totalLifetimeCurrency: layerState.totalLifetimeCurrency.toJSON(),
        ticksInLayer: (layerState.ticksInLayer || new BigNum(0)).toJSON(),
        generators: {},
        upgrades: {}
      };

      for (const [genId, gen] of Object.entries(layerState.generators)) {
        serializedLayer.generators[genId] = {
          bought: (gen.bought || gen.owned).toJSON(),
          owned: gen.owned.toJSON(),
          startTick: gen.startTick || 0
        };
      }

      for (const [upgId, upg] of Object.entries(layerState.upgrades)) {
        serializedLayer.upgrades[upgId] = {
          level: upg.level
        };
      }

      serialized.layers[layerId] = serializedLayer;
    }

    return serialized;
  }

  deserializeState(data) {
    const state = {
      cycleRemainderMs: data.cycleRemainderMs || 0,
      totalCycles: BigNum.fromJSON(data.totalCycles),
      totalTicks: BigNum.fromJSON(data.totalTicks),
      layers: {}
    };

    for (const layer of this.config.layers) {
      const savedLayer = data.layers?.[layer.id];
      const layerState = {
        currency: savedLayer ? BigNum.fromJSON(savedLayer.currency) : new BigNum(layer.currency.initialAmount || 0),
        runTotalCurrency: savedLayer ? BigNum.fromJSON(savedLayer.runTotalCurrency) : new BigNum(layer.currency.initialAmount || 0),
        totalLifetimeCurrency: savedLayer ? BigNum.fromJSON(savedLayer.totalLifetimeCurrency) : new BigNum(layer.currency.initialAmount || 0),
        ticksInLayer: savedLayer?.ticksInLayer ? BigNum.fromJSON(savedLayer.ticksInLayer) : new BigNum(0),
        generators: {},
        upgrades: {}
      };

      for (const gen of layer.generators || []) {
        const savedGen = savedLayer?.generators?.[gen.id];
        const owned = savedGen ? BigNum.fromJSON(savedGen.owned) : new BigNum(0);
        const bought = savedGen?.bought ? BigNum.fromJSON(savedGen.bought) : new BigNum(owned);
        layerState.generators[gen.id] = {
          bought,
          owned,
          startTick: savedGen?.startTick || 0
        };
      }

      for (const upg of layer.upgrades || []) {
        const savedUpg = savedLayer?.upgrades?.[upg.id];
        layerState.upgrades[upg.id] = {
          level: savedUpg?.level || 0
        };
      }

      state.layers[layer.id] = layerState;
    }

    return enforceProgressionInvariant(state, this.config);
  }

  save() {
    const now = this.clock.nowMs();
    this.lastActiveAtMs = now;
    const serialized = this.serializeState();
    this.storage.setItem(this.storageKey, JSON.stringify(serialized));
    this.storage.setItem(this.activeTimestampKey, String(now));
    this.lastSavedAtMs = now;
  }

  load(options = {}) {
    const raw = this.storage.getItem(this.storageKey);
    if (!raw) return null;

    try {
      const data = JSON.parse(raw);
      this.state = this.deserializeState(data);
      const savedAtMs = data.savedAtMs || this.clock.nowMs();
      const now = this.clock.nowMs();
      const elapsedOfflineMs = Math.max(0, now - savedAtMs);
      return this._advanceOffline(elapsedOfflineMs, options);
    } catch {
      return null;
    }
  }

  exportSave() {
    const json = JSON.stringify(this.serializeState());
    if (typeof btoa === 'function') {
      return btoa(json);
    }
    return Buffer.from(json).toString('base64');
  }

  importSave(encoded) {
    let json = encoded;
    try {
      if (typeof atob === 'function') {
        json = atob(encoded);
      } else {
        json = Buffer.from(encoded, 'base64').toString('utf8');
      }
    } catch {
      // Fallback if raw JSON pasted
    }

    const data = JSON.parse(json);
    this.state = this.deserializeState(data);
    this.lastTickAtMs = this.clock.nowMs();
    this.lastActiveAtMs = this.clock.nowMs();
    this.save();
  }

  hardReset() {
    this.storage.removeItem(this.storageKey);
    this.storage.removeItem(this.activeTimestampKey);
    this.state = createInitialState(this.config);
    this.lastTickAtMs = this.clock.nowMs();
    this.lastActiveAtMs = this.clock.nowMs();
    this.lastSavedAtMs = this.clock.nowMs();
  }
}
