import { pokemonData, movesData, typeChartData } from './TrainerDataset';
import { 
  completePokedex, 
  typeChart as enhancedTypeChart, 
  enhancedBiomes,
  evolutionData,
  evolutionMethods,
  getCompleteMoveset,
  getTypeWeaknesses,
  getBiomeCompatibility,
  canEvolveAtLevel,
  getNextEvolution
} from '../../data/completePokedex';
import { getPokemonByName } from '../../data/integratedPokedex';

export const typeChart = enhancedTypeChart;

// Create a simple biome mapping for the UI
const biomeDisplayNames = Object.keys(enhancedBiomes).reduce((acc, biomeName) => {
  acc[biomeName] = enhancedBiomes[biomeName].description || biomeName;
  return acc;
}, {});

export const gen3References = {
  biomes: biomeDisplayNames,
  themes: {
    Balanced: "Balanced",
    Aggressive: "Aggressive Offense",
    Defensive: "Stall & Defend",
    Weather: "Weather Control",
    Status: "Status Effects",
    TrickRoom: "Trick Room",
    BatonPass: "Baton Pass Chain",
    Momentum: "Momentum (VoltTurn)",
  },
  trainerClasses: {
    youngster: { name: 'Youngster', poses: ['casual', 'ready for battle'] },
    lass: { name: 'Lass', poses: ['casual', 'girly pose'] },
    camper: { name: 'Camper', poses: ['outdoorsy', 'ready for battle'] },
    aroma_lady: { name: 'Aroma Lady', poses: ['graceful', 'holding flower'] },
    battle_girl: { name: 'Battle Girl', poses: ['fighting stance', 'focused'] },
    beauty: { name: 'Beauty', poses: ['elegant pose', 'confident'] },
    bird_keeper: { name: 'Bird Keeper', poses: ['with bird', 'looking at sky'] },
    bug_catcher: { name: 'Bug Catcher', poses: ['holding net', 'crouching'] },
    collector: { name: 'Collector', poses: ['inspecting pokeball', 'showcasing collection'] },
    ace_trainer: { name: 'Ace Trainer', poses: ['confident', 'ready for battle', 'smug'] },
    expert: { name: 'Expert', poses: ['meditating', 'martial arts pose'] },
    gym_leader: { name: 'Gym Leader', poses: ['official pose', 'powerful stance'] },
    elite_four: { name: 'Elite Four', poses: ['imposing', 'masterful stance'] },
    rich_boy: { name: 'Rich Boy', poses: ['showing off money', 'smug'] },
    ruin_maniac: { name: 'Ruin Maniac', poses: ['excavating', 'holding artifact'] },
    sailor: { name: 'Sailor', poses: ['at attention', 'looking out to sea'] },
    swimmer_m: { name: 'Swimmer (M)', poses: ['diving pose', 'ready to swim'] },
    swimmer_f: { name: 'Swimmer (F)', poses: ['diving pose', 'ready to swim'] },
    tuber: { name: 'Tuber', poses: ['playing in sand', 'with inner tube'] },
  }
};


export const getPokemonDetails = (species) => {
  // Add null safety check for species parameter
  if (!species || typeof species !== 'string') {
    console.warn('getPokemonDetails called with invalid species:', species);
    return null;
  }
  
  const speciesLower = species.toLowerCase();
  
  // First try the enhanced complete Pokédex
  const completePkmn = Object.values(completePokedex).find(p => p.name.toLowerCase() === speciesLower);
  if (completePkmn) {
    return {
      ...completePkmn,
      name: completePkmn.name,
      likely_biomes: getEnhancedBiomesForPokemon(completePkmn),
      weaknesses: getTypeWeaknesses(completePkmn.types),
      evolution: evolutionData[completePkmn.name] || null
    };
  }
  
  // Try the integrated Pokédex
  const integratedPkmn = getPokemonByName(species);
  if (integratedPkmn) {
    return {
      ...integratedPkmn,
      name: integratedPkmn.name,
      dex_number: integratedPkmn.dex_number,
      types: integratedPkmn.types,
      baseStats: integratedPkmn.baseStats,
      abilities: integratedPkmn.abilities,
      biomes: integratedPkmn.biomes,
      likely_biomes: integratedPkmn.biomes || [],
      weaknesses: getTypeWeaknesses(integratedPkmn.types || []),
      evolution: evolutionData[integratedPkmn.name] || null
    };
  }
  
  // Fallback to existing pokemonData
  const pkmn = pokemonData[speciesLower];
  if (!pkmn) {
    console.warn(`Pokemon details not found for: ${species}`);
    return null;
  }
  
  return { 
    ...pkmn, 
    name: species, 
    likely_biomes: inferBiomesForPokemon(pkmn),
    weaknesses: getTypeWeaknesses(pkmn.types || []),
    evolution: evolutionData[species] || null
  };
};

// Enhanced biome inference using the new biome system
export const getEnhancedBiomesForPokemon = (pkmn) => {
  const biomes = [];
  const types = pkmn.types || [];
  
  // Check each biome for type compatibility
  for (const [biomeName, biomeData] of Object.entries(enhancedBiomes)) {
    const compatibility = getBiomeCompatibility(types, biomeName);
    if (compatibility > 0) {
      biomes.push(biomeName);
    }
  }
  
  // Ensure there's at least one biome
  if (biomes.length === 0) biomes.push('Grassland');
  
  return biomes;
};

// Heuristic to infer which biomes a Pokemon is typically found in based on type and dex lore
export const inferBiomesForPokemon = (pkmn) => {
  const biomes = new Set();
  const types = pkmn.types || [];
  const name = (pkmn.name || '').toLowerCase();

  // Type-based heuristics
  types.forEach(t => {
    if (!t || typeof t !== 'string') return; // Skip invalid types
    const tt = t.toLowerCase();
    if (['grass', 'bug', 'poison'].includes(tt)) biomes.add('Grassland');
    if (['water'].includes(tt)) biomes.add('Ocean');
    if (['rock', 'ground'].includes(tt)) biomes.add('Mountain');
    if (['fire'].includes(tt)) biomes.add('Volcano');
    if (['electric'].includes(tt)) biomes.add('Grassland');
    if (['rock', 'ground', 'flying'].includes(tt)) biomes.add('Mountain');
    if (['ghost', 'dark', 'rock', 'ground'].includes(tt)) biomes.add('Cave');
    if (['steel'].includes(tt)) biomes.add('Mountain');
  });

  // Name / lore heuristics
  if (name.includes('shellder') || name.includes('clam') || name.includes('tentac')) biomes.add('Ocean');
  if (name.includes('dratini') || name.includes('dragonair') || name.includes('dragonite')) biomes.add('Ocean');
  if (name.includes('sand') || name.includes('geodude') || name.includes('onix')) biomes.add('Desert');

  // Ensure there's at least one biome
  if (biomes.size === 0) biomes.add('Grassland');

  return Array.from(biomes);
};

export function getValidMoveset(pokemonName, level = 50, generation = 'hoenn') {
  try {
    // Get comprehensive data first
    const completeData = getCompletePokemonData(pokemonName);
    if (completeData?.movesets?.levelUp) {
      // Filter moves by level - only include moves learnable at or below current level
      const availableMoves = completeData.movesets.levelUp
        .filter(moveEntry => moveEntry.level <= level)
        .flatMap(moveEntry => moveEntry.moves)
        .filter((move, index, array) => array.indexOf(move) === index); // Remove duplicates
      
      if (availableMoves.length >= 4) {
        // Prioritize higher level moves, but ensure variety
        const sortedMoves = completeData.movesets.levelUp
          .filter(moveEntry => moveEntry.level <= level)
          .sort((a, b) => b.level - a.level);
        
        const selectedMoves = new Set();
        
        // Try to get one move from each quarter of the level range
        const levelQuarters = [
          sortedMoves.filter(m => m.level <= level * 0.25),
          sortedMoves.filter(m => m.level > level * 0.25 && m.level <= level * 0.5),
          sortedMoves.filter(m => m.level > level * 0.5 && m.level <= level * 0.75),
          sortedMoves.filter(m => m.level > level * 0.75)
        ];
        
        levelQuarters.forEach(quarter => {
          if (quarter.length > 0 && selectedMoves.size < 4) {
            const randomEntry = quarter[Math.floor(Math.random() * quarter.length)];
            randomEntry.moves.forEach(move => {
              if (selectedMoves.size < 4) selectedMoves.add(move);
            });
          }
        });
        
        // Fill remaining slots with random available moves
        while (selectedMoves.size < 4 && availableMoves.length > 0) {
          const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
          selectedMoves.add(randomMove);
        }
        
        return Array.from(selectedMoves);
      }
    }
    
    // Fallback to existing system if no level-up data
    const pokemon = pokemonData[generation]?.[pokemonName] || pokemonData['all']?.[pokemonName];
    if (pokemon?.movesets?.length > 0) {
      const moveset = pokemon.movesets[Math.floor(Math.random() * pokemon.movesets.length)];
      return moveset.moves || [];
    }
    
    // Final fallback - basic moves
    return ['Tackle', 'Growl', 'Quick Attack', 'Rest'];
  } catch (_error) {
    console.warn(`Error generating moveset for ${pokemonName}:`, error);
    return ['Tackle', 'Growl', 'Quick Attack', 'Rest'];
  }
}// Find a replacement Pokemon within a dex range and optional biome preference
export const findReplacement = (excludedName, minDex = 1, maxDex = 386, targetLevel = 10, preferredBiome = null) => {
  const excluded = (excludedName || '').toLowerCase();
  const candidates = Object.entries(pokemonData)
    .map(([key, val]) => ({ key, ...val }))
    .filter(p => p.dex_number >= minDex && p.dex_number <= maxDex && p.key !== excluded)
    .map(p => ({ ...p, name: p.key }));

  if (candidates.length === 0) return null;

  // Prefer biome matches
  let scored = candidates.map(p => {
    const details = { ...p, likely_biomes: inferBiomesForPokemon(p) };
    let score = 0;
    if (preferredBiome && details.likely_biomes.includes(preferredBiome)) score += 3;
    // Prefer similar base stat total for rough parity at target level
    const bst = Object.values(details.base_stats || {}).reduce((s, v) => s + (v || 0), 0);
    score += Math.max(0, 1000 - Math.abs(bst - 500));
    return { details, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.details || null;
};

// Fallback function for getCompletePokemonData - returns basic moveset structure
function getCompletePokemonData(pokemonName) {
  // Return empty structure since detailed moveset data is not available
  // The calling function will fall back to basic moves
  return {
    movesets: {
      levelUp: [],
    },
  };
}