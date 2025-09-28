/**
 * Trainer Architect Constants
 * Centralized data for trainer generation based on trusted sources
 */

// Gen 3 Biomes from Serebii.net encounter tables
export const BIOMES = [
  'Grassland',
  'Forest', 
  'Cave',
  'Water',
  'Mountain',
  'Desert',
  'Urban',
  'Ruins'
];

// Battle themes from competitive analysis
export const THEMES = [
  'Balanced',
  'Aggressive', 
  'Defensive',
  'Weather',
  'Status',
  'TrickRoom',
  'BatonPass',
  'Momentum'
];

// Difficulty scaling based on BST analysis
export const DIFFICULTIES = [
  'Auto',
  'Easy',
  'Medium', 
  'Hard',
  'Expert'
];

// Gen 3 trainer classes from official sources
export const TRAINER_CLASSES = [
  'youngster',
  'lass',
  'camper',
  'picnicker',
  'bug_catcher',
  'battle_girl',
  'beauty',
  'bird_keeper',
  'collector',
  'ace_trainer',
  'expert',
  'gym_leader',
  'elite_four',
  'rich_boy',
  'ruin_maniac',
  'sailor',
  'fisherman'
];

// Common trainer names for randomization
export const TRAINER_NAMES = [
  "Aaron", "Abby", "Adam", "Aiden", "Alex", "Alice", "Amber", "Amy", 
  "Andrea", "Andy", "Angel", "Anna", "Anthony", "Archie", "Arthur", 
  "Ashley", "Austin", "Ava", "Barry", "Beatrice", "Ben", "Billy", 
  "Blake", "Brandon", "Brendan", "Brian", "Brock", "Brooke", "Bruce", 
  "Caitlin", "Calvin", "Cameron", "Candice", "Carl", "Casey", "Catherine", 
  "Chad", "Charles", "Charlotte", "Cheryl", "Chloe", "Chris", "Christian", 
  "Claire", "Clara", "Cody", "Colin", "Connor", "Courtney", "Crystal", 
  "Cynthia", "Daisy", "Damian", "Daniel", "David", "Dawn", "Dean", 
  "Dennis", "Derek", "Diana", "Donna", "Douglas", "Dustin", "Dylan"
];

// Default trainer template
export const DEFAULT_TRAINER = {
  id: null,
  name: '',
  trainer_class: 'youngster',
  level_min: 10,
  level_max: 15,
  biome: 'Grassland',
  theme: 'Balanced', 
  difficulty: 'Auto',
  party: [],
  sprite_url: '',
  notes: '',
  ai_flags: ''
};

// Trade evolution constraints from Bulbapedia
export const TRADE_EVOLUTION_CONSTRAINTS = {
  'Alakazam': { preEvolution: 'Kadabra', minLevel: 35 },
  'Machamp': { preEvolution: 'Machoke', minLevel: 40 },
  'Golem': { preEvolution: 'Graveler', minLevel: 35 },
  'Gengar': { preEvolution: 'Haunter', minLevel: 35 },
  'Steelix': { preEvolution: 'Onix', minLevel: 45 },
  'Forretress': { preEvolution: 'Pineco', minLevel: 30 },
  'Crobat': { preEvolution: 'Golbat', minLevel: 25 }
};

// BST ranges for difficulty scaling
export const BST_RANGES = {
  'Easy': { min: 150, max: 400 },
  'Medium': { min: 300, max: 520 }, 
  'Hard': { min: 380, max: 580 },
  'Expert': { min: 480, max: 720 }
};

// Authentic Gen 3 encounter data from Serebii.net
export const AUTHENTIC_ENCOUNTERS = {
  'Grassland': {
    common: ['Pidgey', 'Poochyena', 'Zigzagoon', 'Wurmple', 'Taillow'],
    uncommon: ['Ralts', 'Lotad', 'Seedot', 'Surskit'],
    rare: ['Abra', 'Magikarp'],
    description: 'Routes near cities (101-104)'
  },
  'Forest': {
    common: ['Wurmple', 'Shroomish', 'Slakoth', 'Cascoon', 'Silcoon'],
    uncommon: ['Nincada', 'Seedot', 'Lotad'],
    rare: ['Breloom', 'Kecleon'],
    description: 'Petalburg Woods and forested routes'
  },
  'Cave': {
    common: ['Zubat', 'Geodude', 'Makuhita', 'Aron'],
    uncommon: ['Sableye', 'Mawile', 'Nosepass'],
    rare: ['Beldum', 'Meditite'], 
    description: 'Cave systems throughout Hoenn'
  },
  'Water': {
    common: ['Tentacool', 'Magikarp', 'Wingull', 'Pelipper'],
    uncommon: ['Staryu', 'Goldeen', 'Corphish'],
    rare: ['Feebas', 'Wailmer', 'Sharpedo'],
    description: 'Ocean routes and fishing spots'
  }
};

// JSON schema for validation
export const TRAINER_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    trainer_class: { type: "string", enum: TRAINER_CLASSES },
    level_min: { type: "number", minimum: 1, maximum: 100 },
    level_max: { type: "number", minimum: 1, maximum: 100 },
    biome: { type: "string", enum: BIOMES },
    theme: { type: "string", enum: THEMES },
    difficulty: { type: "string", enum: DIFFICULTIES },
    party: {
      type: "array",
      maxItems: 6,
      items: {
        type: "object",
        properties: {
          species: { type: "string", minLength: 1 },
          level: { type: "number", minimum: 1, maximum: 100 },
          moves: {
            type: "array",
            maxItems: 4,
            items: { type: "string" }
          }
        },
        required: ["species", "level"]
      }
    }
  },
  required: ["name", "trainer_class", "level_min", "level_max", "biome", "theme", "difficulty"]
};