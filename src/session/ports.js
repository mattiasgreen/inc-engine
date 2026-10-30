// src/session/ports.js
// ClockPort and StoragePort boundary interfaces

export class SystemClock {
  nowMs() {
    return Date.now();
  }
}

export class ManualClock {
  constructor(initialMs = 0) {
    this._now = initialMs;
  }

  nowMs() {
    return this._now;
  }

  advanceMs(ms) {
    this._now += ms;
    return this._now;
  }

  setMs(ms) {
    this._now = ms;
  }
}

export class BrowserStorage {
  getItem(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignored if storage full/disabled
    }
  }

  removeItem(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignored
    }
  }
}

export class MemoryStorage {
  constructor() {
    this._store = new Map();
  }

  getItem(key) {
    return this._store.has(key) ? this._store.get(key) : null;
  }

  setItem(key, value) {
    this._store.set(key, String(value));
  }

  removeItem(key) {
    this._store.delete(key);
  }

  clear() {
    this._store.clear();
  }
}
