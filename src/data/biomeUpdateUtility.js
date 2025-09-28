/**
 * Biome Update Utility
 * 
 * This script updates Pokemon biome assignments in completePokedex.js
 * based on the research-based encounter data from gen3EncounterData.js
 */

import { POKEMON_ENCOUNTER_DATA, GEN3_BIOMES } from './gen3EncounterData.js';

// Map research biomes to legacy biome names for compatibility
const BIOME_MAPPING = {
  'ROUTE_GRASS': 'Grassland',
  'FOREST': 'Forest', 
  'CAVE': 'Cave',
  'WATER_SURF': 'Ocean',
  'WATER_FISH': 'Ocean',
  'MOUNTAIN': 'Mountain',
  'DESERT': 'Desert',
  'POWER_PLANT': 'Urban', // Map to closest existing biome
  'SAFARI_ZONE': 'Grassland', // Safari is mostly grassland-like
  'RARE_SPECIAL': 'Urban' // Special locations mapped to urban
};

/**
 * Generate updated biome assignments for Pokemon
 */
export function generateUpdatedBiomes() {
  const updatedBiomes = {};
  
  for (const [dexNum, encounterData] of Object.entries(POKEMON_ENCOUNTER_DATA)) {
    const dexNumber = parseInt(dexNum);
    
    if (encounterData.biomes && encounterData.biomes.length > 0) {
      // Map research biomes to legacy biome names
      const legacyBiomes = encounterData.biomes.map(biome => 
        BIOME_MAPPING[biome] || biome
      ).filter((biome, index, self) => self.indexOf(biome) === index); // Remove duplicates
      
      updatedBiomes[dexNumber] = legacyBiomes;
    }
  }
  
  return updatedBiomes;
}

/**
 * Generate code to update a Pokemon entry's biomes
 */
export function generatePokemonBiomeUpdate(dexNumber, newBiomes) {
  return `  ${dexNumber}: {
    ...completePokedex[${dexNumber}],
    biomes: ${JSON.stringify(newBiomes)}
  },`;
}

/**
 * Generate complete biome update assignments
 */
export function generateBiomeUpdateScript() {
  const updates = generateUpdatedBiomes();
  
  let script = `// Updated biome assignments based on Gen 3 encounter research\n\n`;
  script += `// Apply these updates to completePokedex.js:\n\n`;
  
  for (const [dexNum, biomes] of Object.entries(updates)) {
    script += generatePokemonBiomeUpdate(dexNum, biomes) + '\n';
  }
  
  return script;
}

/**
 * Log biome update statistics
 */
export function logBiomeUpdateStats() {
  const updates = generateUpdatedBiomes();
  const biomeCount = {};
  
  for (const biomes of Object.values(updates)) {
    for (const biome of biomes) {
      biomeCount[biome] = (biomeCount[biome] || 0) + 1;
    }
  }
  
  console.log('Biome Update Statistics:');
  console.log(`Total Pokemon with biome data: ${Object.keys(updates).length}`);
  console.log('Pokemon per biome:');
  
  for (const [biome, count] of Object.entries(biomeCount)) {
    console.log(`  ${biome}: ${count} Pokemon`);
  }
  
  return {
    totalUpdated: Object.keys(updates).length,
    biomeDistribution: biomeCount
  };
}

// Export the utility functions
export { BIOME_MAPPING };