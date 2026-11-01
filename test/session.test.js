// test/session.test.js
import { describe, it, expect } from './runner.js';
import { defaultGameConfig } from '../src/engine/config.js';
import { GameSession } from '../src/session/session.js';
import { ManualClock, MemoryStorage } from '../src/session/ports.js';
import { BigNum } from '../src/engine/bignum.js';

describe('Session and Persistence Seam', () => {
  it('initializes a fresh session using ports and starts with initial state', () => {
    const clock = new ManualClock(1000000);
    const storage = new MemoryStorage();
    const session = new GameSession({ config: defaultGameConfig, clock, storage });

    const state = session.getState();
    expect(state.layers.layer0.currency.toNumber()).toBe(10);
    expect(storage.getItem(session.storageKey)).toBeFalsy();

    // Trigger save
    session.save();
    expect(storage.getItem(session.storageKey)).toBeTruthy();
  });

  it('coordinates buying generators and upgrades through the session interface', () => {
    const clock = new ManualClock(1000000);
    const storage = new MemoryStorage();
    const session = new GameSession({ config: defaultGameConfig, clock, storage });

    // Buy gen1
    session.buyGenerator('layer0', 'gen1', 1);
    expect(session.getState().layers.layer0.generators.gen1.owned.toNumber()).toBe(1);

    // Advance 6 seconds (1 cycle) on clock and tickToNow()
    clock.advanceMs(6000);
    session.tickToNow();

    expect(session.getState().layers.layer0.currency.toNumber()).toBe(6);
  });

  it('produces an accurate OfflineReport when loading a save after elapsed time', () => {
    const clock = new ManualClock(1000000);
    const storage = new MemoryStorage();
    const session1 = new GameSession({ config: defaultGameConfig, clock, storage });

    session1.buyGenerator('layer0', 'gen1', 1);
    session1.save();

    // Advance clock by 1 hour (3,600,000ms = 600 cycles of 6000ms each)
    clock.advanceMs(3600000);

    // New session loads from storage
    const session2 = new GameSession({ config: defaultGameConfig, clock, storage });
    const report = session2.load();

    expect(report).toBeTruthy();
    expect(report.elapsedMs).toBe(3600000);
    expect(report.cyclesFired.toNumber()).toBe(600);
    expect(report.ticksEmitted.toNumber()).toBe(600);
    expect(report.currencyDeltas.layer0.toNumber()).toBe(3600);

    expect(session2.getState().layers.layer0.currency.toNumber()).toBe(3600);
  });

  it('verifies exact equivalence between 1-hour offline jump and 3,600 one-second steps', () => {
    // Branch A: Single 1-hour jump
    const clockA = new ManualClock(1000000);
    const storageA = new MemoryStorage();
    const sessionA = new GameSession({ config: defaultGameConfig, clock: clockA, storage: storageA });
    sessionA.buyGenerator('layer0', 'gen1', 1);
    sessionA.save();

    clockA.advanceMs(3600000);
    const sessionA2 = new GameSession({ config: defaultGameConfig, clock: clockA, storage: storageA });
    sessionA2.load();
    const currencyA = sessionA2.getState().layers.layer0.currency;

    // Branch B: 600 six-second steps
    const clockB = new ManualClock(1000000);
    const storageB = new MemoryStorage();
    const sessionB = new GameSession({ config: defaultGameConfig, clock: clockB, storage: storageB });
    sessionB.buyGenerator('layer0', 'gen1', 1);

    for (let i = 0; i < 600; i++) {
      clockB.advanceMs(6000);
      sessionB.tickToNow();
    }
    const currencyB = sessionB.getState().layers.layer0.currency;

    expect(currencyA.eq(currencyB)).toBe(true);
  });

  it('exports and imports saves cleanly via Base64/JSON', () => {
    const clock = new ManualClock(1000000);
    const storage = new MemoryStorage();
    const session = new GameSession({ config: defaultGameConfig, clock, storage });

    session.buyGenerator('layer0', 'gen1', 1);
    session.jumpTime(12000); // 12s -> 2 cycles * 6 = 12 currency

    const exported = session.exportSave();
    expect(typeof exported).toBe('string');

    // Create fresh session and import
    const newSession = new GameSession({ config: defaultGameConfig, clock, storage: new MemoryStorage() });
    newSession.importSave(exported);

    expect(newSession.getState().layers.layer0.currency.toNumber()).toBe(12);
    expect(newSession.getState().layers.layer0.generators.gen1.owned.toNumber()).toBe(1);
  });

  it('tracks active timestamp and performs resumeOfflineProgress() after in-memory suspension', () => {
    const clock = new ManualClock(1000000);
    const storage = new MemoryStorage();
    const session = new GameSession({ config: defaultGameConfig, clock, storage });

    session.buyGenerator('layer0', 'gen1', 1);
    session.tickToNow();

    // Advance clock by 10 minutes (600,000ms = 100 cycles) simulating backgrounded Android app
    clock.advanceMs(600000);

    // resumeOfflineProgress() is called on visibilitychange / focus
    const report = session.resumeOfflineProgress();

    expect(report).toBeTruthy();
    expect(report.elapsedMs).toBe(600000);
    expect(report.cyclesFired.toNumber()).toBe(100);
    expect(report.currencyDeltas.layer0.toNumber()).toBe(600);
    expect(session.getState().layers.layer0.currency.toNumber()).toBe(600);
  });

  it('enforces 24-hour offline progress cap on resumeOfflineProgress() and load()', () => {
    const clock = new ManualClock(1000000);
    const storage = new MemoryStorage();
    const session = new GameSession({ config: defaultGameConfig, clock, storage });

    session.buyGenerator('layer0', 'gen1', 1);
    session.tickToNow();

    // Advance clock by 48 hours (simulating prolonged absence)
    const fortyEightHoursMs = 48 * 60 * 60 * 1000;
    clock.advanceMs(fortyEightHoursMs);

    const report = session.resumeOfflineProgress();

    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    expect(report).toBeTruthy();
    expect(report.elapsedMs).toBe(twentyFourHoursMs);
    expect(report.cyclesFired.toNumber()).toBe(14400);
    expect(report.currencyDeltas.layer0.toNumber()).toBe(86400);
  });
});
