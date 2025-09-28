// Optimized Pokemon Data Service
// Efficient storage, lazy loading, and smart caching for performance

// Generation mappings for efficient filtering
const GENERATION_RANGES = {
  1: { min: 1, max: 151 },
  2: { min: 152, max: 251 },  
  3: { min: 252, max: 386 }
};

// Biome to Pokemon mapping for fast lookups
const BIOME_INDEX = new Map();

// Type to Pokemon mapping for fast filtering
const TYPE_INDEX = new Map();

// Evolution family index for quick evolution queries
const EVOLUTION_INDEX = new Map();

// Compressed core data (only essential fields for performance)
const POKEMON_CORE_DATA = new Map();

// Full data cache (lazy loaded)
const POKEMON_FULL_CACHE = new Map();

// Initialize indexes from complete pokemon data
function initializeIndexes(completePokedex) {
  console.log('🔄 Initializing Pokemon data indexes...');
  
  Object.values(completePokedex).forEach(pokemon => {
    const dexNum = pokemon.dex_number;
    
    // Store compressed core data
    POKEMON_CORE_DATA.set(dexNum, {
      name: pokemon.name,
      types: pokemon.types,
      generation: getGeneration(dexNum),
      legendary: pokemon.legendary,
      evolutionStage: pokemon.evolutionLine?.stage || 1,
      evolveLevel: pokemon.evolutionLine?.evolveLevel,
      evolveTo: pokemon.evolutionLine?.evolveTo,
      biomes: pokemon.biomes
    });
    
    // Index by biomes
    pokemon.biomes?.forEach(biome => {
      if (!BIOME_INDEX.has(biome)) {
        BIOME_INDEX.set(biome, new Set());
      }
      BIOME_INDEX.get(biome).add(dexNum);
    });
    
    // Index by types
    pokemon.types?.forEach(type => {
      if (!TYPE_INDEX.has(type)) {
        TYPE_INDEX.set(type, new Set());
      }
      TYPE_INDEX.get(type).add(dexNum);
    });
    
    // Index evolution families
    if (pokemon.evolutionLine?.evolveTo) {
      const family = getEvolutionFamily(pokemon, completePokedex);
      family.forEach(familyMember => {
        EVOLUTION_INDEX.set(familyMember.dex_number, family);
      });
    }
  });
  
  console.log(`✅ Indexed ${POKEMON_CORE_DATA.size} Pokemon with ${BIOME_INDEX.size} biomes and ${TYPE_INDEX.size} types`);
}

function getGeneration(dexNumber) {
  for (const [gen, range] of Object.entries(GENERATION_RANGES)) {
    if (dexNumber >= range.min && dexNumber <= range.max) {
      return parseInt(gen);
    }
  }
  return 1;
}

function getEvolutionFamily(pokemon, pokedex) {
  const family = [];
  let current = pokemon;
  
  // Find the base form
  while (current.evolutionLine?.stage > 1) {
    const prevDex = current.dex_number - 1;
    if (pokedex[prevDex] && pokedex[prevDex].evolutionLine?.evolveTo === current.name) {
      current = pokedex[prevDex];
    } else {
      break;
    }
  }
  
  // Collect the whole family
  family.push(current);
  while (current.evolutionLine?.evolveTo) {
    const nextName = current.evolutionLine.evolveTo;
    const next = Object.values(pokedex).find(p => p.name === nextName);
    if (next) {
      family.push(next);
      current = next;
    } else {
      break;
    }
  }
  
  return family;
}

// Optimized query functions
class PokemonQueryService {
  constructor(completePokedex) {
    this.completePokedex = completePokedex;
    initializeIndexes(completePokedex);
  }
  
  // Get Pokemon by generation with optional evolution level filtering
  getPokemonByGeneration(generation, options = {}) {
    const { minLevel = 1, maxLevel = 100, excludeLegendaries = false, requireEvolved = false } = options;
    const range = GENERATION_RANGES[generation];
    if (!range) return [];
    
    const results = [];
    for (let dex = range.min; dex <= range.max; dex++) {
      const core = POKEMON_CORE_DATA.get(dex);
      if (!core) continue;
      
      // Filter legendaries
      if (excludeLegendaries && core.legendary) continue;
      
      // Filter by evolution requirements
      if (requireEvolved) {
        const shouldBeEvolved = this.shouldPokemonBeEvolved(dex, minLevel);
        if (!shouldBeEvolved) continue;
        
        // If it should be evolved but isn't, find its evolution
        if (core.evolveLevel && minLevel >= core.evolveLevel && core.evolveTo) {
          const evolved = this.getPokemonByName(core.evolveTo);
          if (evolved) {
            results.push(evolved.dex_number);
            continue;
          }
        }
      }
      
      results.push(dex);
    }
    
    return results;
  }
  
  // Get Pokemon by biome with intelligent filtering
  getPokemonByBiome(biome, options = {}) {
    const { generation, minLevel = 1, maxLevel = 100, excludeLegendaries = false } = options;
    const biomePokemon = BIOME_INDEX.get(biome) || new Set();
    
    return Array.from(biomePokemon).filter(dex => {
      const core = POKEMON_CORE_DATA.get(dex);
      if (!core) return false;
      
      // Generation filter
      if (generation && core.generation !== generation) return false;
      
      // Legendary filter
      if (excludeLegendaries && core.legendary) return false;
      
      // Evolution appropriateness for level
      if (minLevel > 25 && core.evolveLevel && minLevel >= core.evolveLevel) {
        // For higher level trainers, prefer evolved forms
        return core.evolutionStage > 1 || !core.evolveTo;
      }
      
      return true;
    });
  }
  
  // Get appropriate Pokemon for trainer level
  getAppropriateEvolutionForLevel(dexNumber, trainerLevel) {
    const core = POKEMON_CORE_DATA.get(dexNumber);
    if (!core) return dexNumber;
    
    // For low level trainers, keep base forms
    if (trainerLevel < 15) return dexNumber;
    
    // For mid-level trainers, evolve if appropriate
    if (trainerLevel >= 20 && core.evolveLevel && trainerLevel >= core.evolveLevel) {
      const evolved = this.getPokemonByName(core.evolveTo);
      if (evolved) {
        // Check if it should evolve further
        return this.getAppropriateEvolutionForLevel(evolved.dex_number, trainerLevel);
      }
    }
    
    return dexNumber;
  }
  
  shouldPokemonBeEvolved(dexNumber, trainerLevel) {
    const core = POKEMON_CORE_DATA.get(dexNumber);
    if (!core || !core.evolveLevel) return false;
    
    // Base forms should evolve if trainer level is high enough
    return trainerLevel >= (core.evolveLevel + 5);
  }
  
  // Get Pokemon by name (fast lookup)
  getPokemonByName(name) {
    for (const [dex, core] of POKEMON_CORE_DATA) {
      if (core.name === name) {
        return this.getPokemonData(dex);
      }
    }
    return null;
  }
  
  // Lazy loading of full Pokemon data
  getPokemonData(dexNumber) {
    if (POKEMON_FULL_CACHE.has(dexNumber)) {
      return POKEMON_FULL_CACHE.get(dexNumber);
    }
    
    const fullData = this.completePokedex[dexNumber];
    if (fullData) {
      POKEMON_FULL_CACHE.set(dexNumber, fullData);
    }
    return fullData;
  }
  
  // Smart query for Lab Assistant
  queryPokemon(query) {
    const results = {
      exact: [],
      partial: [],
      related: []
    };
    
    const queryLower = query.toLowerCase();
    
    // Search through core data for performance
    for (const [dex, core] of POKEMON_CORE_DATA) {
      const nameLower = core.name.toLowerCase();
      
      // Exact match
      if (nameLower === queryLower) {
        results.exact.push(this.getPokemonData(dex));
        continue;
      }
      
      // Partial match
      if (nameLower.includes(queryLower)) {
        results.partial.push(this.getPokemonData(dex));
        continue;
      }
      
      // Type match
      if (core.types.some(type => type.toLowerCase().includes(queryLower))) {
        results.related.push(this.getPokemonData(dex));
      }
    }
    
    return results;
  }
  
  // Get stats for performance monitoring
  getStats() {
    return {
      totalPokemon: POKEMON_CORE_DATA.size,
      cacheSize: POKEMON_FULL_CACHE.size,
      biomes: BIOME_INDEX.size,
      types: TYPE_INDEX.size,
      memoryUsage: `${Math.round(JSON.stringify(Array.from(POKEMON_CORE_DATA.values())).length / 1024)}KB core data`
    };
  }
}

export { PokemonQueryService, GENERATION_RANGES };