import { pokemonData, movesData, typeChartData } from './TrainerDataset';

export const typeChart = typeChartData;

export const gen3References = {
  biomes: {
    Grassland: "Grassland",
    Forest: "Forest",
    Cave: "Cave",
    Mountain: "Mountain",
    Ocean: "Ocean",
    Desert: "Desert",
    Urban: "Urban",
    Volcano: "Volcano",
    Swamp: "Swamp"
  },
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
  const speciesLower = species.toLowerCase();
  const pkmn = pokemonData[speciesLower];
  if (!pkmn) {
    console.warn(`Pokemon details not found for: ${species}`);
    return null;
  }
  return { ...pkmn, name: species };
};

export const getValidMoveset = (dexNumber, level) => {
  const pkmnMoves = movesData.find(p => p.dex_number === dexNumber);
  if (!pkmnMoves) {
    return ["Tackle", "Growl"]; 
  }
  
  const availableMoves = pkmnMoves.moves.filter(move => move.level <= level);
  
  if (availableMoves.length === 0) {
    return ["Tackle", "Growl"];
  }

  // Shuffle and pick up to 4 moves
  const shuffled = availableMoves.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4).map(m => m.name);
};