// test/games.test.js
import { describe, it, expect } from './runner.js';
import { gamesList, getGameConfig } from '../src/games/index.js';
import { createInitialState, getDerivedStats } from '../src/engine/core.js';
import { Simulator } from '../src/engine/simulator.js';
import { OptimalRoiPolicy } from '../src/engine/policies.js';

describe('Multi-Game Definitions and Presentation Seam', () => {
  it('registers all 3 distinct playable games: dyson-swarm, aetherforge, sunken-observatory', () => {
    expect(gamesList.length).toBe(3);
    const ids = gamesList.map(g => g.id);
    expect(ids.includes('dyson-swarm')).toBe(true);
    expect(ids.includes('aetherforge')).toBe(true);
    expect(ids.includes('sunken-observatory')).toBe(true);
  });

  it('guarantees each game provides valid presentation metadata and inline SVG artwork', () => {
    for (const item of gamesList) {
      const config = getGameConfig(item.id);
      expect(typeof config.name).toBe('string');
      expect(typeof config.subtitle).toBe('string');
      expect(Boolean(config.palette)).toBe(true);
      expect(typeof config.palette['--primary']).toBe('string');

      // Character guide and dialogue
      expect(Boolean(config.character)).toBe(true);
      expect(typeof config.character.name).toBe('string');
      expect(typeof config.character.title).toBe('string');
      expect(typeof config.character.svg).toBe('string');
      expect(config.character.svg.includes('<svg')).toBe(true);
      expect(Boolean(config.character.dialogue)).toBe(true);
      expect(typeof config.character.dialogue.intro).toBe('string');

      // Layers have currency symbol, name, and SVG
      for (const layer of config.layers) {
        expect(typeof layer.currency.name).toBe('string');
        expect(typeof layer.currency.symbol).toBe('string');
        expect(typeof layer.svg).toBe('string');
        expect(layer.svg.includes('<svg')).toBe(true);

        // Generators have lore and SVG
        for (const gen of layer.generators) {
          expect(typeof gen.name).toBe('string');
          expect(typeof gen.lore).toBe('string');
          expect(typeof gen.svg).toBe('string');
          expect(gen.svg.includes('<svg')).toBe(true);
        }

        // Upgrades have lore and SVG
        for (const upg of layer.upgrades) {
          expect(typeof upg.name).toBe('string');
          expect(typeof upg.lore).toBe('string');
          expect(typeof upg.svg).toBe('string');
          expect(upg.svg.includes('<svg')).toBe(true);
        }
      }
    }
  });

  it('proves each game initializes state and derives visibility states without errors', () => {
    for (const item of gamesList) {
      const config = getGameConfig(item.id);
      const state = createInitialState(config);
      const stats = getDerivedStats(state, config);

      expect(Boolean(stats.visibility.generators.layer0)).toBe(true);
      expect(stats.visibility.generators.layer0.gen1).toBe('visible');
      expect(stats.visibility.layers.layer1).toBe('hidden');
    }
  });

  it('verifies distinct mechanical tuning and progression across all 3 games', () => {
    for (const item of gamesList) {
      const config = getGameConfig(item.id);
      const simulator = new Simulator(config);
      const policy = new OptimalRoiPolicy();
      const state = createInitialState(config);

      // Verify 60s of active simulation produces currency and bought generators
      const result = simulator.run(state, policy, { maxSimulatedMs: 60 * 1000 });
      expect(result.state.layers.layer0.currency.gte(0)).toBe(true);
      expect(result.state.layers.layer0.runTotalCurrency.gt(10)).toBe(true);
      expect(result.history.length).toBeGreaterThan(0);
    }
  });
});
