// src/games/index.js
// Registry of all playable game configs with presentation metadata

import { dysonSwarmGame } from './dyson-swarm.js';
import { aetherforgeGame } from './aetherforge.js';
import { sunkenObservatoryGame } from './sunken-observatory.js';

export const gamesList = [
  {
    id: dysonSwarmGame.id,
    name: dysonSwarmGame.name,
    genre: 'Engineering / Hard Sci-Fi',
    config: dysonSwarmGame
  },
  {
    id: aetherforgeGame.id,
    name: aetherforgeGame.name,
    genre: 'Fantasy / Arcane',
    config: aetherforgeGame
  },
  {
    id: sunkenObservatoryGame.id,
    name: sunkenObservatoryGame.name,
    genre: 'Cosmic Horror / Eldritch',
    config: sunkenObservatoryGame
  }
];

export function getGameConfig(gameId) {
  const entry = gamesList.find(g => g.id === gameId);
  return entry ? entry.config : dysonSwarmGame;
}

export { dysonSwarmGame, aetherforgeGame, sunkenObservatoryGame };
