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

export class GameSession {
  constructor(options = {}) {
    this.config = options.config;
    this.clock = options.clock || new SystemClock();
    this.storage = options.storage || new BrowserStorage();
    this.storageKey = options.storageKey || 'inc_engine_save';

    this.state = createInitialState(this.config);
    this.lastSavedAtMs = this.clock.nowMs();
    this.lastTickAtMs = this.clock.nowMs();

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.save();
        }
      });
    }
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
    if (elapsedMs <= 0) return null;

    const { nextState, report } = advanceTime(this.state, this.config, elapsedMs);
    this.state = nextState;
    return report;
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
    this.state = buyGenerator(this.state, this.config, layerId, genId, countOrMax);
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
          owned: gen.owned.toJSON()
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
          owned
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
    const serialized = this.serializeState();
    this.storage.setItem(this.storageKey, JSON.stringify(serialized));
    this.lastSavedAtMs = this.clock.nowMs();
  }

  load() {
    const raw = this.storage.getItem(this.storageKey);
    if (!raw) return null;

    try {
      const data = JSON.parse(raw);
      this.state = this.deserializeState(data);
      const savedAtMs = data.savedAtMs || this.clock.nowMs();
      const now = this.clock.nowMs();
      const elapsedOfflineMs = Math.max(0, now - savedAtMs);
      this.lastTickAtMs = now;
      this.lastSavedAtMs = now;

      if (elapsedOfflineMs > 0) {
        const { nextState, report } = advanceTime(this.state, this.config, elapsedOfflineMs);
        this.state = nextState;
        this.save();
        return report;
      }
      return null;
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
    this.save();
  }

  hardReset() {
    this.storage.removeItem(this.storageKey);
    this.state = createInitialState(this.config);
    this.lastTickAtMs = this.clock.nowMs();
    this.lastSavedAtMs = this.clock.nowMs();
  }
}
