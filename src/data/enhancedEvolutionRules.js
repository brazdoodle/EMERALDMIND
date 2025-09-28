/**
 * Enhanced Evolution Rules for Authentic Gen 3 Team Generation
 * 
 * This module implements proper evolution logic that evolves Pokemon
 * when they reach appropriate levels, instead of downscaling them.
 */

import { evolutionData, evolutionMethods } from './completePokedex.js';
import { POKEMON_ENCOUNTER_DATA } from './gen3EncounterData.js';

// Comprehensive legendary and pseudo-legendary sets
const LEGENDARIES = new Set([
  // Gen 1 Legendaries
  'Articuno', 'Zapdos', 'Moltres', 'Mew', 'Mewtwo',
  
  // Gen 2 Legendaries  
  'Raikou', 'Entei', 'Suicune', 'Lugia', 'Ho-Oh', 'Celebi',
  
  // Gen 3 Legendaries
  'Regirock', 'Regice', 'Registeel', 'Latias', 'Latios', 
  'Kyogre', 'Groudon', 'Rayquaza', 'Jirachi', 'Deoxys'
]);

const PSEUDO_LEGENDARIES = new Set([
  'Dragonite', 'Tyranitar', 'Salamence', 'Metagross'
]);

const STARTERS = new Set([
  // Gen 1 Starters
  'Bulbasaur', 'Ivysaur', 'Venusaur',
  'Charmander', 'Charmeleon', 'Charizard', 
  'Squirtle', 'Wartortle', 'Blastoise',
  
  // Gen 2 Starters
  'Chikorita', 'Bayleef', 'Meganium',
  'Cyndaquil', 'Quilava', 'Typhlosion',
  'Totodile', 'Croconaw', 'Feraligatr',
  
  // Gen 3 Starters
  'Treecko', 'Grovyle', 'Sceptile',
  'Torchic', 'Combusken', 'Blaziken',
  'Mudkip', 'Marshtomp', 'Swampert'
]);

/**
 * Check if a Pokemon should be excluded from trainer teams
 */
export function isExcludedSpecies(pokemonName) {
  return LEGENDARIES.has(pokemonName) || STARTERS.has(pokemonName);
}

/**
 * Check if a Pokemon is a legendary
 */
export function isLegendary(pokemonName) {
  return LEGENDARIES.has(pokemonName);
}

/**
 * Check if a Pokemon is a pseudo-legendary
 */
export function isPseudoLegendary(pokemonName) {
  return PSEUDO_LEGENDARIES.has(pokemonName);
}

/**
 * Check if a Pokemon is a starter
 */
export function isStarter(pokemonName) {
  return STARTERS.has(pokemonName);
}

/**
 * Get the evolution chain for a Pokemon (starting from base form)
 */
export function getEvolutionChain(pokemonName) {
  // First, find the base form
  const baseForm = getBaseForm(pokemonName);
  
  // Build chain forward from base form
  const chain = [baseForm];
  let current = baseForm;
  
  while (evolutionData[current] && evolutionData[current].evolveTo) {
    const nextForm = evolutionData[current].evolveTo;
    chain.push(nextForm);
    current = nextForm;
  }
  
  return chain;
}

/**
 * Get the base (first) form of an evolution chain
 */
export function getBaseForm(pokemonName) {
  // Keep looking for what this Pokemon evolves from
  let current = pokemonName;
  
  // Find the ultimate base form
  while (true) {
    let foundPreEvolution = false;
    
    for (const [baseName, evoData] of Object.entries(evolutionData)) {
      if (evoData.evolveTo === current) {
        current = baseName;
        foundPreEvolution = true;
        break;
      }
    }
    
    if (!foundPreEvolution) {
      break; // We found the base form
    }
  }
  
  return current;
}

/**
 * Get evolution stage (1 = base form, 2 = first evolution, 3 = second evolution)
 */
export function getEvolutionStage(pokemonName) {
  const chain = getEvolutionChain(pokemonName);
  return chain.indexOf(pokemonName) + 1;
}

/**
 * Get the evolution requirements for a Pokemon
 */
export function getEvolutionRequirement(pokemonName) {
  const evoData = evolutionData[pokemonName];
  if (!evoData || !evoData.evolveTo) {
    return null;
  }
  
  return {
    method: evoData.method,
    requirement: evoData.requirement,
    evolvesTo: evoData.evolveTo
  };
}

/**
 * Determine the appropriate form of a Pokemon for a given level
 * This is the CORE evolution logic - evolves Pokemon when level allows
 */
export function getAppropriateForm(basePokemonName, level, trainerClass = 'youngster') {
  const chain = getEvolutionChain(basePokemonName);
  
  // Start from base form and see how far we can evolve
  let appropriateForm = chain[0]; // Base form
  let evolutionPath = [appropriateForm];
  
  // Trainer class evolution preferences
  const evolutionPreferences = {
    'youngster': { maxStage: 1, minLevelForEvolution: 999 }, // Never evolve
    'lass': { maxStage: 1, minLevelForEvolution: 999 },
    'bug_catcher': { maxStage: 2, minLevelForEvolution: 10 }, // Allow first evolution
    'camper': { maxStage: 2, minLevelForEvolution: 15 },
    'picnicker': { maxStage: 2, minLevelForEvolution: 15 },
    'hiker': { maxStage: 3, minLevelForEvolution: 20 },
    'swimmer': { maxStage: 3, minLevelForEvolution: 25 },
    'fisherman': { maxStage: 2, minLevelForEvolution: 20 },
    'ace_trainer': { maxStage: 3, minLevelForEvolution: 30 },
    'cooltrainer': { maxStage: 3, minLevelForEvolution: 30 },
    'gym_leader': { maxStage: 3, minLevelForEvolution: 20 },
    'elite_four': { maxStage: 3, minLevelForEvolution: 45 },
    'champion': { maxStage: 3, minLevelForEvolution: 50 }
  };
  
  const prefs = evolutionPreferences[trainerClass] || evolutionPreferences['youngster'];
  
  // Check each evolution in the chain
  for (let i = 0; i < chain.length - 1; i++) {
    const currentForm = chain[i];
    const nextForm = chain[i + 1];
    const evoReq = getEvolutionRequirement(currentForm);
    
    if (!evoReq) break;
    
    // Check if trainer class allows this evolution stage
    if (i + 2 > prefs.maxStage) {
      break; // Trainer class doesn't allow this evolution stage
    }
    
    // Check level requirements
    let canEvolve = false;
    
    if (evoReq.method === evolutionMethods.LEVEL) {
      // Level-based evolution
      canEvolve = level >= evoReq.requirement && level >= prefs.minLevelForEvolution;
    } else if (evoReq.method === evolutionMethods.STONE) {
      // Stone evolution - available at level 20+ for most trainers
      canEvolve = level >= Math.max(20, prefs.minLevelForEvolution);
    } else if (evoReq.method === evolutionMethods.TRADE) {
      // Trade evolution - available at level 25+ for experienced trainers
      canEvolve = level >= Math.max(25, prefs.minLevelForEvolution);
    } else if (evoReq.method === evolutionMethods.FRIENDSHIP) {
      // Friendship evolution - available at level 20+ for bonded trainers
      canEvolve = level >= Math.max(20, prefs.minLevelForEvolution);
    } else {
      // Other methods - available at level 25+
      canEvolve = level >= Math.max(25, prefs.minLevelForEvolution);
    }
    
    if (canEvolve) {
      appropriateForm = nextForm;
      evolutionPath.push(nextForm);
    } else {
      break; // Can't evolve further
    }
  }
  
  return {
    pokemon: appropriateForm,
    evolutionPath: evolutionPath,
    evolved: appropriateForm !== chain[0]
  };
}

/**
 * Check if a Pokemon is appropriate for a trainer class and level
 */
export function isPokemonAppropriateForTrainer(pokemonName, level, trainerClass) {
  // Exclude legendaries and starters for most trainer classes
  if (isExcludedSpecies(pokemonName)) {
    if (!['gym_leader', 'elite_four', 'champion'].includes(trainerClass)) {
      return false;
    }
    
    // Even for high-level trainers, exclude starters completely
    if (isStarter(pokemonName)) {
      return false;
    }
  }
  
  // Exclude pseudo-legendaries for basic trainer classes
  if (isPseudoLegendary(pokemonName)) {
    if (['youngster', 'lass', 'bug_catcher', 'camper', 'picnicker'].includes(trainerClass)) {
      return false;
    }
  }
  
  // Check if this Pokemon's evolution requirement is appropriate
  const baseForm = getBaseForm(pokemonName);
  const appropriateForm = getAppropriateForm(baseForm, level, trainerClass);
  
  // If the appropriate form for this level/trainer is different, this Pokemon is inappropriate
  return appropriateForm.pokemon === pokemonName;
}

/**
 * Get Base Stat Total tier for a Pokemon
 */
export function getBSTTier(pokemonName) {
  const encounterData = POKEMON_ENCOUNTER_DATA[getPokemonDexNumber(pokemonName)];
  if (encounterData && encounterData.bst) {
    const bst = encounterData.bst;
    
    if (bst <= 300) return 'common';
    if (bst <= 450) return 'uncommon';
    if (bst <= 600) return 'rare';
    return 'legendary';
  }
  
  // Fallback based on evolution stage
  const stage = getEvolutionStage(pokemonName);
  if (stage === 1) return 'common';
  if (stage === 2) return 'uncommon';
  return 'rare';
}

/**
 * Helper function to get Pokemon dex number (you may need to implement this based on your data structure)
 */
function getPokemonDexNumber(pokemonName) {
  // This would need to be implemented based on your completePokedex structure
  // For now, returning a placeholder
  for (const [dexNum, data] of Object.entries(POKEMON_ENCOUNTER_DATA)) {
    if (data.name === pokemonName) {
      return parseInt(dexNum);
    }
  }
  return null;
}

/**
 * Validate evolution chain consistency
 */
export function validateEvolutionChain(pokemonName) {
  try {
    const chain = getEvolutionChain(pokemonName);
    const stage = getEvolutionStage(pokemonName);
    const baseForm = getBaseForm(pokemonName);
    
    return {
      valid: true,
      chain: chain,
      stage: stage,
      baseForm: baseForm
    };
  } catch (_error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

/**
 * Get all Pokemon that are valid base forms (can be used as team candidates)
 */
export function getValidBaseForms(pokedexScope = 'gen1-3') {
  const ranges = {
    'gen1': { min: 1, max: 151 },
    'gen2': { min: 152, max: 251 },
    'gen3': { min: 252, max: 386 },
    'gen1-2': { min: 1, max: 251 },
    'gen1-3': { min: 1, max: 386 }
  };
  
  const range = ranges[pokedexScope] || ranges['gen1-3'];
  const validBaseForms = [];
  
  // Iterate through encounter data to find base forms
  for (const [dexNum, data] of Object.entries(POKEMON_ENCOUNTER_DATA)) {
    const dexNumber = parseInt(dexNum);
    
    // Check if in scope
    if (dexNumber < range.min || dexNumber > range.max) continue;
    
    // Skip excluded species
    if (data.exclude) continue;
    
    // This is a valid base form candidate
    validBaseForms.push({
      dexNumber: dexNumber,
      name: data.name || `Pokemon${dexNumber}`,
      biomes: data.biomes || [],
      tier: data.tier || 'common',
      bst: data.bst || 300
    });
  }
  
  return validBaseForms;
}