/**
 * Complete Pokemon Data Integration System
 *
 * This file integrates all Pokemon data from multiple sources and creates
 * a complete 386-Pokemon database with sprite mappings.
 */

import { completePokedex as manualEntries } from "./completePokedex.js";
import { bulkPokemonData } from "./pokemonBulkData.js";

// Special sprite name mappings for problematic cases
const SPRITE_NAME_MAPPING = {
  "Nidoran♀": "NIDORANfE",
  "Nidoran♂": "NIDORANmA",
  "Farfetch'd": "FARFETCHD",
  "Mr. Mime": "MRMIME",
  "Ho-Oh": "HOOH",
};

/**
 * Convert bulk data entry to full Pokemon object
 */
function convertBulkToFullEntry(dexNum, bulkData) {
  const spriteName = getSpriteFileName(bulkData.name);

  // Create proper evolutionData format for evolution system
  const evolutionData = createEvolutionData(dexNum, bulkData);

  // Convert movesets using helper function
  const movesets = convertMovesets(bulkData.movesets);

  return {
    dex_number: parseInt(dexNum),
    name: bulkData.name,
    generation: getGenerationFromDex(dexNum),
    types: bulkData.types || [],
    baseStats: bulkData.baseStats || {
      hp: 50,
      attack: 50,
      defense: 50,
      spAttack: 50,
      spDefense: 50,
      speed: 50,
    },
    abilities: bulkData.abilities || ["Unknown"],
    biomes: bulkData.biomes || ["Grassland"],
    legendary: bulkData.legendary || false,
    movesets: movesets,
    evolutionData,
    spriteUrl: `/sprites/${spriteName}.png`,
  };
}

/**
 * Create proper evolutionData from bulk Pokemon data
 */
function createEvolutionData(dexNum, bulkData) {
  const pokemonNum = parseInt(dexNum);

  // Evolution chains mapping - covers major evolution lines
  const evolutionChains = {
    // Kanto starters
    1: {
      evolves_to: "Ivysaur",
      evolution_level: 16,
      evolution_method: "level",
    },
    2: {
      evolves_to: "Venusaur",
      evolution_level: 32,
      evolution_method: "level",
    },
    3: null, // Venusaur - final form, no evolution
    4: {
      evolves_to: "Charmeleon",
      evolution_level: 16,
      evolution_method: "level",
    },
    5: {
      evolves_to: "Charizard",
      evolution_level: 36,
      evolution_method: "level",
    },
    6: null, // Charizard - final form, no evolution
    7: {
      evolves_to: "Wartortle",
      evolution_level: 16,
      evolution_method: "level",
    },
    8: {
      evolves_to: "Blastoise",
      evolution_level: 36,
      evolution_method: "level",
    },
    9: null, // Blastoise - final form, no evolution

    // Hoenn starters
    252: {
      evolves_to: "Grovyle",
      evolution_level: 16,
      evolution_method: "level",
    },
    253: {
      evolves_to: "Sceptile",
      evolution_level: 36,
      evolution_method: "level",
    },
    254: null, // Sceptile - final form, no evolution
    255: {
      evolves_to: "Combusken",
      evolution_level: 16,
      evolution_method: "level",
    },
    256: {
      evolves_to: "Blaziken",
      evolution_level: 36,
      evolution_method: "level",
    },
    257: null, // Blaziken - final form, no evolution
    258: {
      evolves_to: "Marshtomp",
      evolution_level: 16,
      evolution_method: "level",
    },
    259: {
      evolves_to: "Swampert",
      evolution_level: 36,
      evolution_method: "level",
    },
    260: null, // Swampert - final form, no evolution

    // Common evolution chains
    280: {
      evolves_to: "Kirlia",
      evolution_level: 20,
      evolution_method: "level",
    },
    281: {
      evolves_to: "Gardevoir",
      evolution_level: 30,
      evolution_method: "level",
    },
    282: null, // Gardevoir - final form, no evolution

    // Slakoth line (critical for level 13 Slaking issue)
    287: {
      evolves_to: "Vigoroth",
      evolution_level: 18,
      evolution_method: "level",
    },
    288: {
      evolves_to: "Slaking",
      evolution_level: 36,
      evolution_method: "level",
    },
    289: null, // Slaking - final form, no evolution
  };

  // Return predefined evolution data if available (including explicit nulls)
  if (evolutionChains.hasOwnProperty(pokemonNum)) {
    return evolutionChains[pokemonNum];
  }

  // Fallback: use bulkData evolveLevel if present
  if (bulkData.evolveLevel) {
    // Try to infer evolution target from next Pokemon in sequence
    const nextNum = pokemonNum + 1;
    const nextPokemon = bulkPokemonData[nextNum];

    if (nextPokemon && nextPokemon.name) {
      return {
        evolves_to: nextPokemon.name,
        evolution_level: bulkData.evolveLevel,
        evolution_method: "level",
      };
    } else {
      // If we can't find the next Pokemon, still return basic evolution data
      return {
        evolves_to: `Pokemon #${nextNum}`,
        evolution_level: bulkData.evolveLevel,
        evolution_method: "level",
      };
    }
  }

  return null;
}

/**
 * Get the correct sprite filename for a Pokemon
 */
function getSpriteFileName(pokemonName) {
  // Check if there's a special mapping
  if (SPRITE_NAME_MAPPING[pokemonName]) {
    return SPRITE_NAME_MAPPING[pokemonName];
  }

  // Default: convert to uppercase
  return pokemonName.toUpperCase();
}

/**
 * Get generation number based on dex number
 */
function getGenerationFromDex(dexNumber) {
  const dex = parseInt(dexNumber);
  if (dex >= 1 && dex <= 151) return 1;
  if (dex >= 152 && dex <= 251) return 2;
  if (dex >= 252 && dex <= 386) return 3;
  return 1; // Default fallback
}

/**
 * Convert movesets from level-keyed format to levelUp array format
 */
function convertMovesets(movesets) {
  if (!movesets || typeof movesets !== "object") {
    return {
      levelUp: [
        { level: 1, moves: ["Tackle"] },
        { level: 5, moves: ["Growl"] },
      ],
    };
  }

  // If already in correct format, return as-is
  if (movesets.levelUp && Array.isArray(movesets.levelUp)) {
    return movesets;
  }

  // Convert from level-keyed format
  const levelUpMoves = [];
  Object.entries(movesets).forEach(([level, moves]) => {
    if (Array.isArray(moves) && moves.length > 0) {
      levelUpMoves.push({
        level: parseInt(level),
        moves: moves,
      });
    }
  });

  if (levelUpMoves.length > 0) {
    return { levelUp: levelUpMoves };
  }

  // Fallback
  return {
    levelUp: [
      { level: 1, moves: ["Tackle"] },
      { level: 5, moves: ["Growl"] },
    ],
  };
}

/**
 * Create complete integrated Pokedex
 */
function createCompletePokedex() {
  const integrated = {};

  // Start with manual entries (these have priority)
  Object.entries(manualEntries).forEach(([dexNum, pokemon]) => {
    if (pokemon && !pokemon.name.includes("Placeholder")) {
      // Update sprite URL to use local sprites
      const spriteName = getSpriteFileName(pokemon.name);
      integrated[dexNum] = {
        ...pokemon,
        generation: getGenerationFromDex(dexNum),
        movesets: convertMovesets(pokemon.movesets),
        spriteUrl: `/sprites/${spriteName}.png`,
      };
    }
  });

  // Fill gaps with bulk data
  Object.entries(bulkPokemonData).forEach(([dexNum, bulkData]) => {
    if (!integrated[dexNum]) {
      integrated[dexNum] = convertBulkToFullEntry(dexNum, bulkData);
    }
  });

  // Fill remaining gaps with better placeholders
  for (let i = 1; i <= 386; i++) {
    if (!integrated[i]) {
      integrated[i] = createPlaceholderEntry(i);
    }
  }

  return integrated;
}

/**
 * Create a better placeholder entry with sprite
 */
function createPlaceholderEntry(dexNum) {
  return {
    dex_number: dexNum,
    name: `Pokemon #${dexNum}`,
    generation: getGenerationFromDex(dexNum),
    types: ["Normal"],
    baseStats: {
      hp: 50,
      attack: 50,
      defense: 50,
      spAttack: 50,
      spDefense: 50,
      speed: 50,
    },
    abilities: ["Unknown"],
    biomes: ["Grassland"],
    legendary: false,
    movesets: {
      levelUp: [
        { level: 1, moves: ["Tackle"] },
        { level: 5, moves: ["Growl"] },
      ],
    },
    spriteUrl: "/sprites/000.png", // Default sprite
  };
}

/**
 * Create sprite mapping for all Pokemon
 */
function createSpriteMapping() {
  const mapping = {};
  const integratedPokedex = createCompletePokedex();

  Object.entries(integratedPokedex).forEach(([dexNum, pokemon]) => {
    if (pokemon.spriteUrl) {
      mapping[dexNum] = pokemon.spriteUrl;
    }
  });

  return mapping;
}

/**
 * Get Pokemon sprite path by dex number
 */
export function getPokemonSprite(dexNumber) {
  const spriteMapping = createSpriteMapping();
  return spriteMapping[dexNumber] || "/sprites/000.png";
}

/**
 * Get complete Pokemon data by dex number
 */
export function getPokemonData(dexNumber) {
  const completePokedex = createCompletePokedex();
  return completePokedex[dexNumber];
}

/**
 * Get all Pokemon as array
 */
export function getAllPokemon() {
  const completePokedex = createCompletePokedex();
  return Object.values(completePokedex).sort(
    (a, b) => a.dex_number - b.dex_number
  );
}

/**
 * Get Pokemon by name
 */
export function getPokemonByName(name) {
  const allPokemon = getAllPokemon();
  return allPokemon.find((p) => p.name.toLowerCase() === name.toLowerCase());
}

// Create and export the complete integrated Pokedex
export const integratedPokedex = createCompletePokedex();
export const pokemonSpriteMapping = createSpriteMapping();

// Log integration statistics
const stats = {
  total: Object.keys(integratedPokedex).length,
  manual: Object.values(integratedPokedex).filter(
    (p) => !p.name.includes("Pokemon #")
  ).length,
  bulk: Object.values(integratedPokedex).filter((p) =>
    p.name.includes("Pokemon #")
  ).length,
};

console.log(`[INFO] Pokemon Integration Complete:
  [INFO] Total entries: ${stats.total}
  ✍️  Manual entries: ${stats.manual}
  📦 Bulk/placeholder entries: ${stats.bulk}
  🖼️  Sprites mapped: ${Object.keys(pokemonSpriteMapping).length}`);

// Helper function to get a specific pokemon by ID
export function getIntegratedPokemon(id) {
  return integratedPokedex[id];
}

// Export getSpriteFileName for testing
export { getSpriteFileName };

export default integratedPokedex;
