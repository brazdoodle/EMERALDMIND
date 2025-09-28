/**
 * Enhanced Biome Data Integration
 * 
 * This module provides functions to integrate research-based encounter data
 * with the existing completePokedex system without requiring manual updates.
 */

import { POKEMON_ENCOUNTER_DATA, GEN3_BIOMES } from './gen3EncounterData.js';

// Map research biomes to existing completePokedex biome names
const BIOME_MAPPING = {
  'ROUTE_GRASS': ['Grassland', 'Plains'],
  'FOREST': ['Forest'],
  'CAVE': ['Cave', 'Underground'],
  'WATER_SURF': ['Ocean', 'Lake'], 
  'WATER_FISH': ['Ocean', 'River', 'Lake'],
  'MOUNTAIN': ['Mountain'],
  'DESERT': ['Desert'],
  'POWER_PLANT': ['Urban', 'Industrial'],
  'SAFARI_ZONE': ['Grassland', 'Safari'],
  'RARE_SPECIAL': ['Urban', 'Special']
};

/**
 * Get research-based biomes for a Pokemon by dex number
 */
export function getResearchBiomes(dexNumber) {
  const encounterData = POKEMON_ENCOUNTER_DATA[dexNumber];
  if (!encounterData || !encounterData.biomes) {
    return null;
  }
  
  // Convert research biomes to legacy format
  const legacyBiomes = [];
  for (const researchBiome of encounterData.biomes) {
    const mappedBiomes = BIOME_MAPPING[researchBiome] || [researchBiome];
    legacyBiomes.push(...mappedBiomes);
  }
  
  // Remove duplicates
  return [...new Set(legacyBiomes)];
}

/**
 * Get encounter tier for a Pokemon
 */
export function getEncounterTier(dexNumber) {
  const encounterData = POKEMON_ENCOUNTER_DATA[dexNumber];
  return encounterData?.tier || 'common';
}

/**
 * Get Base Stat Total from encounter data
 */
export function getResearchBST(dexNumber) {
  const encounterData = POKEMON_ENCOUNTER_DATA[dexNumber];
  return encounterData?.bst || null;
}

/**
 * Check if Pokemon should be excluded (starters/legendaries)
 */
export function isExcludedPokemon(dexNumber) {
  const encounterData = POKEMON_ENCOUNTER_DATA[dexNumber];
  return encounterData?.exclude || false;
}

/**
 * Enhanced Pokemon data with research-based information
 */
export function getEnhancedPokemonData(pokemon) {
  const researchBiomes = getResearchBiomes(pokemon.dex_number);
  const encounterTier = getEncounterTier(pokemon.dex_number);
  const researchBST = getResearchBST(pokemon.dex_number);
  const isExcluded = isExcludedPokemon(pokemon.dex_number);
  
  return {
    ...pokemon,
    // Use research biomes if available, fallback to original
    biomes: researchBiomes || pokemon.biomes || [],
    // Add research-based metadata
    encounterData: {
      tier: encounterTier,
      bst: researchBST,
      exclude: isExcluded,
      biomes: researchBiomes
    }
  };
}

/**
 * Filter Pokemon by biome compatibility using research data
 */
export function filterByResearchBiome(pokemonList, targetBiome) {
  return pokemonList.filter(pokemon => {
    const researchBiomes = getResearchBiomes(pokemon.dex_number);
    
    if (researchBiomes) {
      // Check if any research biome maps to the target biome
      return researchBiomes.some(biome => 
        biome.toLowerCase() === targetBiome.toLowerCase()
      );
    }
    
    // Fallback to original biome system
    return pokemon.biomes && pokemon.biomes.some(biome =>
      biome.toLowerCase() === targetBiome.toLowerCase()
    );
  });
}

/**
 * Get all Pokemon that can appear in a specific biome
 */
export function getPokemonForBiome(pokemonList, targetBiome, options = {}) {
  const {
    excludeStarters = true,
    excludeLegendaries = true,
    maxBST = null,
    preferredTiers = null
  } = options;
  
  let filtered = filterByResearchBiome(pokemonList, targetBiome);
  
  // Apply exclusion filters
  if (excludeStarters || excludeLegendaries) {
    filtered = filtered.filter(pokemon => !isExcludedPokemon(pokemon.dex_number));
  }
  
  // Apply BST filter
  if (maxBST) {
    filtered = filtered.filter(pokemon => {
      const bst = getResearchBST(pokemon.dex_number);
      return !bst || bst <= maxBST;
    });
  }
  
  // Apply tier filter
  if (preferredTiers) {
    filtered = filtered.filter(pokemon => {
      const tier = getEncounterTier(pokemon.dex_number);
      return preferredTiers.includes(tier);
    });
  }
  
  return filtered.map(pokemon => getEnhancedPokemonData(pokemon));
}

/**
 * Validate biome coverage across all Pokemon
 */
export function validateBiomeCoverage(pokemonList) {
  const biomeCoverage = {};
  const missingBiomes = [];
  
  for (const pokemon of pokemonList) {
    const researchBiomes = getResearchBiomes(pokemon.dex_number);
    
    if (researchBiomes && researchBiomes.length > 0) {
      for (const biome of researchBiomes) {
        if (!biomeCoverage[biome]) {
          biomeCoverage[biome] = [];
        }
        biomeCoverage[biome].push(pokemon.name);
      }
    } else {
      missingBiomes.push({
        dexNumber: pokemon.dex_number,
        name: pokemon.name
      });
    }
  }
  
  return {
    biomeCoverage,
    missingBiomes: missingBiomes.length,
    totalPokemon: pokemonList.length,
    coveredPokemon: pokemonList.length - missingBiomes.length
  };
}

export { BIOME_MAPPING };