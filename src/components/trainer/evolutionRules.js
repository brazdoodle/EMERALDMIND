import { evolutionData, evolutionMethods } from '../../data/completePokedex';

const normalize = (s) => (s || '').toLowerCase();

const legendarySet = new Set([
  'Mew','Mewtwo','Celebi','Jirachi','Deoxys',
  'Articuno','Zapdos','Moltres','Raikou','Entei','Suicune',
  'Lugia','Ho-Oh','Regirock','Regice','Registeel','Latias','Latios','Kyogre','Groudon','Rayquaza'
]);

const pseudoSet = new Set(['Dragonite','Tyranitar','Salamence','Metagross']);

const hoennStarterFinals = new Set(['Sceptile','Blaziken','Swampert']);

const earlyCommon = new Set(['Poochyena','Mightyena','Zigzagoon','Linoone','Wurmple','Silcoon','Cascoon','Beautifly','Dustox','Taillow','Swellow','Wingull','Pelipper','Lotad','Lombre','Seedot','Nuzleaf','Shroomish','Makuhita','Ralts','Kirlia']);

export function getStage(species) {
  // Calculate stage by counting evolution chain backwards
  let current = species;
  let stage = 1;
  
  // Count forward through evolution chain
  while (evolutionData[current]) {
    const evo = evolutionData[current];
    if (evo.evolveTo) {
      stage++;
      current = evo.evolveTo;
    } else {
      break;
    }
  }
  
  return stage;
}

export function getPrevEvolution(species) {
  // Find what evolves into this species
  for (const [pokemon, evoInfo] of Object.entries(evolutionData)) {
    if (evoInfo.evolveTo === species) {
      return pokemon;
    }
  }
  return null;
}

export function evolveLevelFor(species) {
  const evo = evolutionData[species];
  if (!evo) return null;
  
  if (evo.method === evolutionMethods.LEVEL) {
    return evo.requirement;
  }
  
  // For non-level evolutions, return a reasonable minimum level
  return 20;
}

export function downscaleSpeciesForLevel(species, level) {
  let current = species;
  let changed = false;
  
  // Special handling for trade evolutions - these should not appear at low levels
  const tradeEvolutions = {
    'Alakazam': { prevForm: 'Kadabra', minLevel: 35 },
    'Machamp': { prevForm: 'Machoke', minLevel: 40 },
    'Golem': { prevForm: 'Graveler', minLevel: 35 },
    'Gengar': { prevForm: 'Haunter', minLevel: 35 },
    'Steelix': { prevForm: 'Onix', minLevel: 45 },
    'Forretress': { prevForm: 'Pineco', minLevel: 30 },
    'Crobat': { prevForm: 'Golbat', minLevel: 25 }
  };
  
  // Check if this is a trade evolution that's too low level
  if (tradeEvolutions[current] && level < tradeEvolutions[current].minLevel) {
    current = tradeEvolutions[current].prevForm;
    changed = true;
    
    // Continue checking the pre-evolution
    const result = downscaleSpeciesForLevel(current, level);
    if (result.changed) {
      current = result.species;
      changed = true;
    }
    
    return { species: current, changed };
  }
  
  // Walk backwards through evolution chain if current level is too low
  while (true) {
    const prev = getPrevEvolution(current);
    if (!prev) break;
    
    const evoData = evolutionData[prev];
    if (!evoData) break;
    
    // If this evolution requires a level higher than current, downscale
    if (evoData.method === evolutionMethods.LEVEL && level < evoData.requirement) {
      current = prev;
      changed = true;
      continue;
    }
    
    // For non-level evolutions (stones, trade, etc.), use minimum level thresholds
    if (evoData.method === evolutionMethods.STONE && level < 25) {
      current = prev;
      changed = true;
      continue;
    }
    
    if (evoData.method === evolutionMethods.TRADE && level < 30) {
      current = prev;
      changed = true;
      continue;
    }
    
    break;
  }
  
  return { species: current, changed };
}

export function isLegendary(species) { return legendarySet.has(species); }
export function isPseudoLegendary(species) { return pseudoSet.has(species); }
export function isStarterFinal(species) { return hoennStarterFinals.has(species); }
export function earlyCommonBonus(species) { return earlyCommon.has(species) ? 2 : 0; }

export function levelBandFromRange(min, max) {
  const avg = ((Number(min) || 0) + (Number(max) || 0)) / 2;
  if (avg <= 15) return 'early';
  if (avg <= 30) return 'mid';
  return 'late';
}
