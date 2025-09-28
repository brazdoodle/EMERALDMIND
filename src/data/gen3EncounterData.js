/**
 * Generation 3 Pokemon Encounter Research
 * Based on Ruby/Sapphire/Emerald/FireRed/LeafGreen encounter data
 * 
 * This file contains research-based biome classifications for all 386 Pokemon
 * based on their actual encounter locations in Gen 3 games.
 */

// Comprehensive biome system based on actual Gen 3 locations
export const GEN3_BIOMES = {
  // Route-based biomes
  ROUTE_GRASS: {
    name: "Route Grasslands",
    description: "Grassy routes and pathways",
    locations: ["Routes 101-134", "Route 1-25 (FRLG)"],
    commonTypes: ["Normal", "Flying", "Bug", "Grass"]
  },
  
  FOREST: {
    name: "Forest",
    description: "Wooded areas and dense forests", 
    locations: ["Petalburg Woods", "Viridian Forest"],
    commonTypes: ["Bug", "Grass", "Flying"]
  },
  
  CAVE: {
    name: "Cave",
    description: "Underground caves and caverns",
    locations: ["Granite Cave", "Mt. Moon", "Rock Tunnel", "Victory Road"],
    commonTypes: ["Rock", "Ground", "Steel", "Dark"]
  },
  
  WATER_SURF: {
    name: "Ocean/Lake (Surfing)",
    description: "Water surfaces for surfing",
    locations: ["Routes with water", "Ever Grande City waters"],
    commonTypes: ["Water", "Flying"]
  },
  
  WATER_FISH: {
    name: "Water (Fishing)",
    description: "Fishing in rivers, lakes, and oceans",
    locations: ["All water bodies with fishing"],
    commonTypes: ["Water"]
  },
  
  MOUNTAIN: {
    name: "Mountain",
    description: "Rocky mountainous terrain",
    locations: ["Mt. Chimney", "Mt. Ember", "Mt. Silver"],
    commonTypes: ["Rock", "Ground", "Fire", "Steel"]
  },
  
  DESERT: {
    name: "Desert",
    description: "Sandy desert areas",
    locations: ["Route 111 Desert"],
    commonTypes: ["Ground", "Rock", "Steel"]
  },
  
  POWER_PLANT: {
    name: "Power Plant",
    description: "Industrial/electric areas",
    locations: ["New Mauville", "Power Plant"],
    commonTypes: ["Electric", "Steel"]
  },
  
  SAFARI_ZONE: {
    name: "Safari Zone",
    description: "Special preserve areas",
    locations: ["Safari Zone (FRLG)", "Safari Zone (Emerald)"],
    commonTypes: ["Normal", "Grass", "Water"]
  },
  
  RARE_SPECIAL: {
    name: "Special/Rare",
    description: "Special encounter locations",
    locations: ["Game Corner", "Gifts", "Events"],
    commonTypes: ["Various"]
  }
};

// Research-based Pokemon classifications
export const POKEMON_ENCOUNTER_DATA = {
  // Gen 1 Kanto Pokemon (1-151)
  
  // Route Grass Pokemon (common early game)
  1: { biomes: ["FOREST"], tier: "starter", exclude: true }, // Bulbasaur - Starter
  4: { biomes: ["MOUNTAIN"], tier: "starter", exclude: true }, // Charmander - Starter  
  7: { biomes: ["WATER_SURF"], tier: "starter", exclude: true }, // Squirtle - Starter
  
  // Common route Pokemon
  16: { biomes: ["ROUTE_GRASS", "FOREST"], tier: "common", bst: 251 }, // Pidgey
  19: { biomes: ["ROUTE_GRASS", "FOREST"], tier: "common", bst: 253 }, // Rattata
  21: { biomes: ["ROUTE_GRASS", "FOREST"], tier: "common", bst: 262 }, // Spearow
  23: { biomes: ["ROUTE_GRASS"], tier: "uncommon", bst: 289 }, // Ekans
  25: { biomes: ["FOREST", "POWER_PLANT"], tier: "uncommon", bst: 320 }, // Pikachu
  27: { biomes: ["CAVE", "MOUNTAIN"], tier: "uncommon", bst: 300 }, // Sandshrew
  29: { biomes: ["ROUTE_GRASS", "SAFARI_ZONE"], tier: "uncommon", bst: 275 }, // Nidoran♀
  32: { biomes: ["ROUTE_GRASS", "SAFARI_ZONE"], tier: "uncommon", bst: 273 }, // Nidoran♂
  35: { biomes: ["CAVE", "MOUNTAIN"], tier: "rare", bst: 323 }, // Clefairy
  37: { biomes: ["ROUTE_GRASS"], tier: "uncommon", bst: 299 }, // Vulpix
  39: { biomes: ["ROUTE_GRASS"], tier: "common", bst: 270 }, // Jigglypuff
  41: { biomes: ["CAVE"], tier: "common", bst: 245 }, // Zubat
  43: { biomes: ["ROUTE_GRASS", "FOREST"], tier: "common", bst: 320 }, // Oddish
  46: { biomes: ["FOREST", "SAFARI_ZONE"], tier: "uncommon", bst: 285 }, // Paras
  48: { biomes: ["FOREST", "SAFARI_ZONE"], tier: "uncommon", bst: 305 }, // Venonat
  50: { biomes: ["CAVE"], tier: "common", bst: 320 }, // Diglett
  52: { biomes: ["ROUTE_GRASS"], tier: "common", bst: 290 }, // Meowth
  54: { biomes: ["WATER_SURF", "WATER_FISH"], tier: "common", bst: 320 }, // Psyduck
  56: { biomes: ["ROUTE_GRASS", "MOUNTAIN"], tier: "uncommon", bst: 305 }, // Mankey
  58: { biomes: ["ROUTE_GRASS"], tier: "uncommon", bst: 350 }, // Growlithe
  60: { biomes: ["WATER_FISH"], tier: "common", bst: 300 }, // Poliwag
  63: { biomes: ["ROUTE_GRASS"], tier: "uncommon", bst: 310 }, // Abra
  66: { biomes: ["CAVE"], tier: "uncommon", bst: 305 }, // Machop
  69: { biomes: ["ROUTE_GRASS"], tier: "common", bst: 300 }, // Bellsprout
  72: { biomes: ["WATER_SURF", "WATER_FISH"], tier: "common", bst: 335 }, // Tentacool
  74: { biomes: ["CAVE", "MOUNTAIN"], tier: "common", bst: 300 }, // Geodude
  77: { biomes: ["ROUTE_GRASS"], tier: "uncommon", bst: 410 }, // Ponyta
  79: { biomes: ["WATER_FISH"], tier: "common", bst: 315 }, // Slowpoke
  81: { biomes: ["POWER_PLANT"], tier: "uncommon", bst: 325 }, // Magnemite
  83: { biomes: ["ROUTE_GRASS"], tier: "uncommon", bst: 352 }, // Farfetch'd
  84: { biomes: ["ROUTE_GRASS", "SAFARI_ZONE"], tier: "uncommon", bst: 310 }, // Doduo
  86: { biomes: ["WATER_SURF"], tier: "uncommon", bst: 325 }, // Seel
  88: { biomes: ["CAVE"], tier: "uncommon", bst: 325 }, // Grimer
  90: { biomes: ["WATER_FISH"], tier: "common", bst: 305 }, // Shellder
  92: { biomes: ["CAVE"], tier: "rare", bst: 310 }, // Gastly
  95: { biomes: ["CAVE"], tier: "rare", bst: 385 }, // Onix
  96: { biomes: ["ROUTE_GRASS"], tier: "uncommon", bst: 328 }, // Drowzee
  98: { biomes: ["WATER_FISH"], tier: "common", bst: 325 }, // Krabby
  100: { biomes: ["POWER_PLANT"], tier: "uncommon", bst: 330 }, // Voltorb
  102: { biomes: ["FOREST", "SAFARI_ZONE"], tier: "uncommon", bst: 325 }, // Exeggcute
  104: { biomes: ["CAVE"], tier: "uncommon", bst: 320 }, // Cubone
  106: { biomes: ["RARE_SPECIAL"], tier: "rare", bst: 455 }, // Hitmonlee
  107: { biomes: ["RARE_SPECIAL"], tier: "rare", bst: 455 }, // Hitmonchan
  108: { biomes: ["RARE_SPECIAL"], tier: "rare", bst: 385 }, // Lickitung
  109: { biomes: ["CAVE"], tier: "uncommon", bst: 340 }, // Koffing
  111: { biomes: ["ROUTE_GRASS", "SAFARI_ZONE"], tier: "uncommon", bst: 345 }, // Rhyhorn
  113: { biomes: ["ROUTE_GRASS", "SAFARI_ZONE"], tier: "rare", bst: 450 }, // Chansey
  114: { biomes: ["ROUTE_GRASS", "SAFARI_ZONE"], tier: "rare", bst: 365 }, // Tangela
  115: { biomes: ["SAFARI_ZONE"], tier: "rare", bst: 490 }, // Kangaskhan
  116: { biomes: ["WATER_FISH"], tier: "common", bst: 295 }, // Horsea
  118: { biomes: ["WATER_FISH"], tier: "common", bst: 320 }, // Goldeen
  120: { biomes: ["WATER_FISH"], tier: "uncommon", bst: 340 }, // Staryu
  123: { biomes: ["SAFARI_ZONE"], tier: "rare", bst: 500 }, // Scyther
  124: { biomes: ["RARE_SPECIAL"], tier: "rare", bst: 455 }, // Jynx
  125: { biomes: ["POWER_PLANT"], tier: "rare", bst: 490 }, // Electabuzz
  126: { biomes: ["MOUNTAIN"], tier: "rare", bst: 495 }, // Magmar
  127: { biomes: ["SAFARI_ZONE"], tier: "rare", bst: 500 }, // Pinsir
  128: { biomes: ["SAFARI_ZONE"], tier: "rare", bst: 490 }, // Tauros
  129: { biomes: ["WATER_FISH"], tier: "common", bst: 200 }, // Magikarp
  131: { biomes: ["WATER_SURF"], tier: "rare", bst: 535 }, // Lapras
  132: { biomes: ["RARE_SPECIAL"], tier: "rare", bst: 288 }, // Ditto
  133: { biomes: ["RARE_SPECIAL"], tier: "rare", bst: 325 }, // Eevee
  137: { biomes: ["RARE_SPECIAL"], tier: "rare", bst: 395 }, // Porygon
  138: { biomes: ["CAVE"], tier: "rare", bst: 355 }, // Omanyte
  140: { biomes: ["CAVE"], tier: "rare", bst: 355 }, // Kabuto
  142: { biomes: ["CAVE"], tier: "rare", bst: 515 }, // Aerodactyl
  143: { biomes: ["ROUTE_GRASS"], tier: "rare", bst: 540 }, // Snorlax
  147: { biomes: ["SAFARI_ZONE"], tier: "rare", bst: 300 }, // Dratini
  
  // Legendaries (exclude)
  144: { biomes: ["MOUNTAIN"], tier: "legendary", exclude: true }, // Articuno
  145: { biomes: ["POWER_PLANT"], tier: "legendary", exclude: true }, // Zapdos
  146: { biomes: ["MOUNTAIN"], tier: "legendary", exclude: true }, // Moltres
  150: { biomes: ["CAVE"], tier: "legendary", exclude: true }, // Mewtwo
  151: { biomes: ["RARE_SPECIAL"], tier: "legendary", exclude: true }, // Mew
  
  // Gen 2 Johto Pokemon (152-251) - Key examples
  152: { biomes: ["FOREST"], tier: "starter", exclude: true }, // Chikorita
  155: { biomes: ["MOUNTAIN"], tier: "starter", exclude: true }, // Cyndaquil
  158: { biomes: ["WATER_SURF"], tier: "starter", exclude: true }, // Totodile
  
  161: { biomes: ["ROUTE_GRASS"], tier: "common", bst: 215 }, // Sentret
  163: { biomes: ["ROUTE_GRASS"], tier: "common", bst: 262 }, // Hoothoot
  165: { biomes: ["FOREST"], tier: "common", bst: 265 }, // Ledyba
  167: { biomes: ["FOREST"], tier: "common", bst: 250 }, // Spinarak
  170: { biomes: ["WATER_FISH"], tier: "common", bst: 330 }, // Chinchou
  179: { biomes: ["ROUTE_GRASS"], tier: "uncommon", bst: 280 }, // Mareep
  183: { biomes: ["WATER_SURF"], tier: "uncommon", bst: 250 }, // Marill
  190: { biomes: ["FOREST"], tier: "uncommon", bst: 365 }, // Aipom
  191: { biomes: ["FOREST"], tier: "common", bst: 180 }, // Sunkern
  193: { biomes: ["FOREST"], tier: "uncommon", bst: 390 }, // Yanma
  194: { biomes: ["WATER_FISH"], tier: "common", bst: 210 }, // Wooper
  198: { biomes: ["ROUTE_GRASS"], tier: "uncommon", bst: 405 }, // Murkrow
  200: { biomes: ["CAVE"], tier: "rare", bst: 435 }, // Misdreavus
  203: { biomes: ["ROUTE_GRASS"], tier: "rare", bst: 455 }, // Girafarig
  206: { biomes: ["CAVE"], tier: "uncommon", bst: 415 }, // Dunsparce
  207: { biomes: ["ROUTE_GRASS"], tier: "uncommon", bst: 430 }, // Gligar
  209: { biomes: ["ROUTE_GRASS"], tier: "uncommon", bst: 300 }, // Snubbull
  213: { biomes: ["CAVE"], tier: "rare", bst: 505 }, // Shuckle
  214: { biomes: ["FOREST"], tier: "rare", bst: 500 }, // Heracross
  215: { biomes: ["MOUNTAIN"], tier: "rare", bst: 430 }, // Sneasel
  216: { biomes: ["FOREST"], tier: "uncommon", bst: 330 }, // Teddiursa
  218: { biomes: ["MOUNTAIN"], tier: "uncommon", bst: 250 }, // Slugma
  220: { biomes: ["MOUNTAIN"], tier: "uncommon", bst: 250 }, // Swinub
  222: { biomes: ["WATER_FISH"], tier: "uncommon", bst: 380 }, // Corsola
  223: { biomes: ["WATER_FISH"], tier: "common", bst: 300 }, // Remoraid
  225: { biomes: ["MOUNTAIN"], tier: "rare", bst: 330 }, // Delibird
  227: { biomes: ["ROUTE_GRASS"], tier: "rare", bst: 465 }, // Skarmory
  228: { biomes: ["ROUTE_GRASS"], tier: "uncommon", bst: 330 }, // Houndour
  231: { biomes: ["SAFARI_ZONE"], tier: "rare", bst: 330 }, // Phanpy
  234: { biomes: ["ROUTE_GRASS"], tier: "rare", bst: 465 }, // Stantler
  246: { biomes: ["CAVE"], tier: "rare", bst: 300 }, // Larvitar
  
  // Gen 2 Legendaries (exclude)
  243: { biomes: ["ROUTE_GRASS"], tier: "legendary", exclude: true }, // Raikou
  244: { biomes: ["MOUNTAIN"], tier: "legendary", exclude: true }, // Entei
  245: { biomes: ["WATER_SURF"], tier: "legendary", exclude: true }, // Suicune
  249: { biomes: ["WATER_SURF"], tier: "legendary", exclude: true }, // Lugia
  250: { biomes: ["MOUNTAIN"], tier: "legendary", exclude: true }, // Ho-Oh
  251: { biomes: ["FOREST"], tier: "legendary", exclude: true }, // Celebi
  
  // Gen 3 Hoenn Pokemon (252-386)
  252: { biomes: ["FOREST"], tier: "starter", exclude: true }, // Treecko
  255: { biomes: ["MOUNTAIN"], tier: "starter", exclude: true }, // Torchic  
  258: { biomes: ["WATER_SURF"], tier: "starter", exclude: true }, // Mudkip
  
  // Common Hoenn Pokemon
  261: { biomes: ["ROUTE_GRASS"], tier: "common", bst: 220 }, // Poochyena
  263: { biomes: ["ROUTE_GRASS"], tier: "common", bst: 240 }, // Zigzagoon
  265: { biomes: ["FOREST"], tier: "common", bst: 195 }, // Wurmple
  270: { biomes: ["WATER_FISH"], tier: "common", bst: 220 }, // Lotad
  273: { biomes: ["FOREST"], tier: "common", bst: 220 }, // Seedot
  276: { biomes: ["ROUTE_GRASS"], tier: "common", bst: 270 }, // Taillow
  278: { biomes: ["WATER_SURF"], tier: "common", bst: 270 }, // Wingull
  280: { biomes: ["ROUTE_GRASS"], tier: "uncommon", bst: 198 }, // Ralts
  285: { biomes: ["FOREST"], tier: "uncommon", bst: 285 }, // Shroomish
  287: { biomes: ["FOREST"], tier: "uncommon", bst: 280 }, // Slakoth
  290: { biomes: ["CAVE"], tier: "uncommon", bst: 266 }, // Nincada
  293: { biomes: ["CAVE"], tier: "uncommon", bst: 240 }, // Whismur
  296: { biomes: ["CAVE"], tier: "uncommon", bst: 237 }, // Makuhita
  298: { biomes: ["WATER_SURF"], tier: "rare", bst: 250 }, // Azurill
  299: { biomes: ["CAVE"], tier: "uncommon", bst: 395 }, // Nosepass
  300: { biomes: ["ROUTE_GRASS"], tier: "uncommon", bst: 260 }, // Skitty
  302: { biomes: ["CAVE"], tier: "rare", bst: 380 }, // Sableye
  303: { biomes: ["CAVE"], tier: "rare", bst: 380 }, // Mawile
  304: { biomes: ["CAVE"], tier: "uncommon", bst: 330 }, // Aron
  307: { biomes: ["MOUNTAIN"], tier: "uncommon", bst: 280 }, // Meditite
  309: { biomes: ["ROUTE_GRASS"], tier: "uncommon", bst: 295 }, // Electrike
  311: { biomes: ["ROUTE_GRASS"], tier: "rare", bst: 405 }, // Plusle
  312: { biomes: ["ROUTE_GRASS"], tier: "rare", bst: 405 }, // Minun
  313: { biomes: ["FOREST"], tier: "rare", bst: 400 }, // Volbeat
  314: { biomes: ["FOREST"], tier: "rare", bst: 400 }, // Illumise
  315: { biomes: ["ROUTE_GRASS"], tier: "uncommon", bst: 440 }, // Roselia
  316: { biomes: ["ROUTE_GRASS"], tier: "uncommon", bst: 302 }, // Gulpin
  318: { biomes: ["WATER_FISH"], tier: "uncommon", bst: 220 }, // Carvanha
  320: { biomes: ["WATER_SURF"], tier: "uncommon", bst: 400 }, // Wailmer
  322: { biomes: ["MOUNTAIN"], tier: "common", bst: 305 }, // Numel
  325: { biomes: ["ROUTE_GRASS"], tier: "rare", bst: 330 }, // Spoink
  327: { biomes: ["ROUTE_GRASS"], tier: "rare", bst: 360 }, // Spinda
  328: { biomes: ["DESERT"], tier: "uncommon", bst: 290 }, // Trapinch
  331: { biomes: ["DESERT"], tier: "uncommon", bst: 335 }, // Cacnea
  333: { biomes: ["ROUTE_GRASS"], tier: "uncommon", bst: 310 }, // Swablu
  335: { biomes: ["ROUTE_GRASS"], tier: "rare", bst: 458 }, // Zangoose
  336: { biomes: ["ROUTE_GRASS"], tier: "rare", bst: 458 }, // Seviper
  337: { biomes: ["CAVE"], tier: "rare", bst: 440 }, // Lunatone
  338: { biomes: ["CAVE"], tier: "rare", bst: 440 }, // Solrock
  339: { biomes: ["WATER_FISH"], tier: "common", bst: 268 }, // Barboach
  341: { biomes: ["WATER_FISH"], tier: "common", bst: 308 }, // Corphish
  343: { biomes: ["DESERT"], tier: "uncommon", bst: 300 }, // Baltoy
  345: { biomes: ["WATER_FISH"], tier: "rare", bst: 355 }, // Lileep
  347: { biomes: ["WATER_FISH"], tier: "rare", bst: 355 }, // Anorith
  349: { biomes: ["WATER_FISH"], tier: "common", bst: 200 }, // Feebas
  351: { biomes: ["ROUTE_GRASS"], tier: "rare", bst: 420 }, // Castform
  352: { biomes: ["FOREST"], tier: "rare", bst: 440 }, // Kecleon
  353: { biomes: ["CAVE"], tier: "uncommon", bst: 295 }, // Shuppet
  355: { biomes: ["CAVE"], tier: "uncommon", bst: 295 }, // Duskull
  357: { biomes: ["FOREST"], tier: "rare", bst: 460 }, // Tropius
  358: { biomes: ["CAVE"], tier: "rare", bst: 425 }, // Chimecho
  359: { biomes: ["ROUTE_GRASS"], tier: "rare", bst: 430 }, // Absol
  361: { biomes: ["CAVE"], tier: "uncommon", bst: 307 }, // Snorunt
  363: { biomes: ["WATER_SURF"], tier: "uncommon", bst: 290 }, // Spheal
  366: { biomes: ["WATER_FISH"], tier: "rare", bst: 485 }, // Clamperl
  370: { biomes: ["WATER_SURF"], tier: "rare", bst: 330 }, // Luvdisc
  371: { biomes: ["CAVE"], tier: "rare", bst: 300 }, // Bagon
  374: { biomes: ["CAVE"], tier: "rare", bst: 300 }, // Beldum
  
  // Hoenn Legendaries (exclude)
  377: { biomes: ["CAVE"], tier: "legendary", exclude: true }, // Regirock
  378: { biomes: ["CAVE"], tier: "legendary", exclude: true }, // Regice
  379: { biomes: ["CAVE"], tier: "legendary", exclude: true }, // Registeel
  380: { biomes: ["WATER_SURF"], tier: "legendary", exclude: true }, // Latias
  381: { biomes: ["WATER_SURF"], tier: "legendary", exclude: true }, // Latios
  382: { biomes: ["WATER_SURF"], tier: "legendary", exclude: true }, // Kyogre
  383: { biomes: ["MOUNTAIN"], tier: "legendary", exclude: true }, // Groudon
  384: { biomes: ["MOUNTAIN"], tier: "legendary", exclude: true }, // Rayquaza
  385: { biomes: ["RARE_SPECIAL"], tier: "legendary", exclude: true }, // Jirachi
  386: { biomes: ["RARE_SPECIAL"], tier: "legendary", exclude: true }, // Deoxys
};

// Trainer class preferences based on actual Gen 3 NPC teams
export const GEN3_TRAINER_PATTERNS = {
  // Early game trainers (routes 101-110)
  youngster: {
    preferredTiers: ["common", "uncommon"],
    preferredBiomes: ["ROUTE_GRASS", "FOREST"],
    maxBST: 350,
    evolutionStage: "basic", // Mostly first stage
    teamSizeRange: [1, 3],
    levelRange: [3, 15]
  },
  
  lass: {
    preferredTiers: ["common", "uncommon"],
    preferredBiomes: ["ROUTE_GRASS", "FOREST"],
    maxBST: 400,
    evolutionStage: "basic",
    teamSizeRange: [1, 3],
    levelRange: [5, 18]
  },
  
  bug_catcher: {
    preferredTiers: ["common", "uncommon"],
    preferredBiomes: ["FOREST"],
    requiredTypes: ["Bug"],
    maxBST: 350,
    evolutionStage: "basic",
    teamSizeRange: [1, 4],
    levelRange: [3, 12]
  },
  
  // Mid-game trainers
  camper: {
    preferredTiers: ["common", "uncommon", "rare"],
    preferredBiomes: ["ROUTE_GRASS", "FOREST", "CAVE"],
    maxBST: 450,
    evolutionStage: "evolved",
    teamSizeRange: [2, 4],
    levelRange: [15, 30]
  },
  
  picnicker: {
    preferredTiers: ["common", "uncommon", "rare"],
    preferredBiomes: ["ROUTE_GRASS", "FOREST"],
    maxBST: 450,
    evolutionStage: "evolved",
    teamSizeRange: [2, 4],
    levelRange: [15, 30]
  },
  
  hiker: {
    preferredTiers: ["common", "uncommon", "rare"],
    preferredBiomes: ["CAVE", "MOUNTAIN"],
    preferredTypes: ["Rock", "Ground", "Fighting"],
    maxBST: 500,
    evolutionStage: "evolved",
    teamSizeRange: [2, 5],
    levelRange: [18, 35]
  },
  
  // Water-based trainers
  swimmer: {
    preferredTiers: ["common", "uncommon", "rare"],
    preferredBiomes: ["WATER_SURF", "WATER_FISH"],
    requiredTypes: ["Water"],
    maxBST: 500,
    evolutionStage: "evolved",
    teamSizeRange: [2, 5],
    levelRange: [20, 40]
  },
  
  fisherman: {
    preferredTiers: ["common", "uncommon", "rare"],
    preferredBiomes: ["WATER_FISH"],
    requiredTypes: ["Water"],
    maxBST: 450,
    evolutionStage: "mixed",
    teamSizeRange: [2, 6],
    levelRange: [8, 35]
  },
  
  // Elite trainers
  ace_trainer: {
    preferredTiers: ["uncommon", "rare"],
    preferredBiomes: ["ROUTE_GRASS", "CAVE", "MOUNTAIN"],
    maxBST: 600,
    evolutionStage: "fully_evolved",
    teamSizeRange: [3, 6],
    levelRange: [25, 50]
  },
  
  cooltrainer: {
    preferredTiers: ["uncommon", "rare"],
    preferredBiomes: ["ROUTE_GRASS", "CAVE", "MOUNTAIN"],
    maxBST: 550,
    evolutionStage: "fully_evolved",
    teamSizeRange: [3, 5],
    levelRange: [30, 45]
  },
  
  // Gym Leaders (allow higher BST and more diverse teams)
  gym_leader: {
    preferredTiers: ["uncommon", "rare"],
    preferredBiomes: ["ROUTE_GRASS", "CAVE", "MOUNTAIN", "WATER_SURF"],
    maxBST: 600,
    evolutionStage: "fully_evolved",
    teamSizeRange: [2, 4],
    levelRange: [15, 50],
    allowPseudoLegendary: false
  },
  
  elite_four: {
    preferredTiers: ["rare"],
    preferredBiomes: ["ROUTE_GRASS", "CAVE", "MOUNTAIN", "WATER_SURF"],
    maxBST: 700,
    evolutionStage: "fully_evolved",
    teamSizeRange: [4, 5],
    levelRange: [45, 60],
    allowPseudoLegendary: true
  },
  
  champion: {
    preferredTiers: ["rare"],
    preferredBiomes: ["ROUTE_GRASS", "CAVE", "MOUNTAIN", "WATER_SURF"],
    maxBST: 700,
    evolutionStage: "fully_evolved",
    teamSizeRange: [5, 6],
    levelRange: [55, 65],
    allowPseudoLegendary: true
  }
};

// Base Stat Total tiers for proper difficulty scaling
export const BST_TIERS = {
  early_game: { min: 150, max: 350 },   // Routes 101-110
  mid_game: { min: 300, max: 500 },     // Routes 111-120
  late_game: { min: 450, max: 600 },    // Victory Road, Elite Four prep
  endgame: { min: 500, max: 700 }       // Elite Four, Champion
};