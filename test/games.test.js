// test/games.test.js
import { describe, it, expect } from './runner.js';
import { gamesList, getGameConfig } from '../src/games/index.js';
import { validateGameConfig } from '../src/games/blueprint.js';
import { createInitialState, getDerivedStats } from '../src/engine/core.js';
import { Simulator } from '../src/engine/simulator.js';
import { OptimalRoiPolicy } from '../src/engine/policies.js';
import { BigNum } from '../src/engine/bignum.js';
import { BUILD_INFO } from '../src/version.js';

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
      expect(typeof config.palette['--btn-bg']).toBe('string');
      expect(config.palette['--btn-text']).toBe('#ffffff');
      expect(typeof config.palette['--upg-card-scrim']).toBe('string');
      expect(typeof config.palette['--viewport-vignette']).toBe('string');

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
    const expectedClocks = {
      'dyson-swarm': 6000,
      'aetherforge': 4000,
      'sunken-observatory': 7500
    };
    const expectedM1 = {
      'dyson-swarm': 25,
      'aetherforge': 22,
      'sunken-observatory': 25
    };

    for (const item of gamesList) {
      const config = getGameConfig(item.id);
      const l0 = config.layers[0];
      expect(config.clock.baseCycleDurationMs).toBe(expectedClocks[item.id]);
      expect(Boolean(l0.capacitor)).toBe(true);
      expect(Array.isArray(l0.stances) && l0.stances.length).toBe(3);
      expect(Boolean(l0.bayCapacity)).toBe(true);

      // 9 Layer 0 upgrades with mutually exclusive Doctrine fork
      expect(l0.upgrades.length).toBe(9);
      const surgeDoc = l0.upgrades.find(u => u.id === 'upg_doctrine_surge');
      const cascadeDoc = l0.upgrades.find(u => u.id === 'upg_doctrine_cascade');
      expect(Boolean(surgeDoc) && surgeDoc.exclusiveWith.includes('upg_doctrine_cascade')).toBe(true);
      expect(Boolean(cascadeDoc) && cascadeDoc.exclusiveWith.includes('upg_doctrine_surge')).toBe(true);

      // Distinct m1 milestone (22 on aetherforge vs 25 on dyson/sunken) & Sunken double Surge ticks
      const testState = createInitialState(config);
      testState.layers.layer0.generators.gen1.bought = new BigNum(22);
      const statsAt22 = getDerivedStats(testState, config);
      expect(statsAt22.generatorMilestones.layer0.gen1.tierId).toBe(expectedM1[item.id] === 22 ? 'm1' : 'm0');
      testState.layers.layer0.generators.gen1.bought = new BigNum(expectedM1[item.id]);
      const statsAtM1 = getDerivedStats(testState, config);
      expect(statsAtM1.generatorMilestones.layer0.gen1.tierId).toBe('m1');
      expect(statsAtM1.generatorMilestones.layer0.gen1.multiplier).toBe(2);
      if (item.id === 'sunken-observatory') {
        expect(l0.capacitor.surgeTickMult).toBe(2);
      }

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

  it('guarantees build metadata provides valid git commit hash and timestamp', () => {
    expect(typeof BUILD_INFO.commit).toBe('string');
    expect(BUILD_INFO.commit.length).toBeGreaterThanOrEqual(7);
    expect(typeof BUILD_INFO.date).toBe('string');
    expect(BUILD_INFO.date.length).toBeGreaterThanOrEqual(10);
  });

  it('rejects overly slow Tier-2 (>240s) and Tier-3 (>600s) metagenerators in validateGameConfig', () => {
    const slowTier2 = {
      clock: { baseCycleDurationMs: 4000 },
      layers: [
        {
          id: 'layer0',
          generators: [
            { id: 'gen1', baseCost: 10, costGrowth: 1.4, baseOutputPerTick: 2.5, produces: 'currency' },
            { id: 'gen2', baseCost: 700, costGrowth: 1.45, baseOutputPerTick: 0.0038, produces: { type: 'generator', layerId: 'layer0', targetId: 'gen1' } }
          ]
        }
      ]
    };
    expect(() => validateGameConfig(slowTier2)).toThrow('spawn rate too slow');

    const slowTier3 = {
      clock: { baseCycleDurationMs: 6000 },
      layers: [
        {
          id: 'layer0',
          generators: [
            { id: 'gen1', baseCost: 10, costGrowth: 1.4, baseOutputPerTick: 6.0, produces: 'currency' },
            { id: 'gen2', baseCost: 900, costGrowth: 1.45, baseOutputPerTick: 0.032, produces: { type: 'generator', layerId: 'layer0', targetId: 'gen1' } },
            { id: 'gen3', baseCost: 15000, costGrowth: 1.5, baseOutputPerTick: 0.005, produces: { type: 'generator', layerId: 'layer0', targetId: 'gen2' } }
          ]
        }
      ]
    };
    expect(() => validateGameConfig(slowTier3)).toThrow('spawn rate too slow');
  });
});
