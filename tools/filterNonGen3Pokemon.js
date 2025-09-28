import { completePokedex } from '../src/data/completePokedex.js';

// Define the valid dex range for Generations 1-3
const validDexRange = { min: 1, max: 386 };

// Identify Pokémon outside the valid range
const outsideRangePokemon = Object.entries(completePokedex)
  .filter(([dex, data]) => data.dex_number < validDexRange.min || data.dex_number > validDexRange.max)
  .map(([dex, data]) => ({ dex, name: data.name }));

console.log('Pokémon outside the range #1-386:', outsideRangePokemon);