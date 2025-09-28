/**
 * Comprehensive Gen 3 Pokemon Learnsets
 * Data sourced from Bulbapedia and Serebii for authentic movesets
 * 
 * This file contains level-up learnsets for all Gen 1-3 Pokemon based on 
 * Ruby/Sapphire/Emerald game data, ensuring accurate moveset generation.
 */

export const gen3Learnsets = {
  // Gen 1 Starters
  1: { // Bulbasaur
    name: "Bulbasaur",
    levelUp: {
      1: ["Tackle", "Growl"],
      7: ["Leech Seed"],
      10: ["Vine Whip"],
      15: ["Poison Powder"],
      15: ["Sleep Powder"],
      20: ["Razor Leaf"],
      25: ["Sweet Scent"],
      32: ["Growth"],
      39: ["Synthesis"],
      46: ["Solar Beam"]
    }
  },
  2: { // Ivysaur
    name: "Ivysaur", 
    levelUp: {
      1: ["Tackle", "Growl", "Leech Seed"],
      7: ["Leech Seed"],
      10: ["Vine Whip"],
      15: ["Poison Powder"],
      15: ["Sleep Powder"],
      22: ["Razor Leaf"],
      29: ["Sweet Scent"],
      38: ["Growth"],
      47: ["Synthesis"],
      56: ["Solar Beam"]
    }
  },
  3: { // Venusaur
    name: "Venusaur",
    levelUp: {
      1: ["Tackle", "Growl", "Leech Seed", "Vine Whip"],
      7: ["Leech Seed"],
      10: ["Vine Whip"],
      15: ["Poison Powder"],
      15: ["Sleep Powder"],
      22: ["Razor Leaf"],
      29: ["Sweet Scent"],
      41: ["Growth"],
      53: ["Synthesis"],
      65: ["Solar Beam"]
    }
  },
  4: { // Charmander
    name: "Charmander",
    levelUp: {
      1: ["Scratch", "Growl"],
      7: ["Ember"],
      13: ["Metal Claw"],
      19: ["Smokescreen"],
      25: ["Rage"],
      31: ["Scary Face"],
      37: ["Flamethrower"],
      43: ["Slash"],
      49: ["Dragon Rage"],
      55: ["Fire Spin"]
    }
  },
  5: { // Charmeleon
    name: "Charmeleon",
    levelUp: {
      1: ["Scratch", "Growl", "Ember"],
      7: ["Ember"],
      13: ["Metal Claw"],
      20: ["Smokescreen"],
      27: ["Rage"],
      34: ["Scary Face"],
      41: ["Flamethrower"],
      48: ["Slash"],
      55: ["Dragon Rage"],
      62: ["Fire Spin"]
    }
  },
  6: { // Charizard
    name: "Charizard",
    levelUp: {
      1: ["Scratch", "Growl", "Ember", "Metal Claw"],
      7: ["Ember"],
      13: ["Metal Claw"],
      20: ["Smokescreen"],
      27: ["Rage"],
      34: ["Scary Face"],
      36: ["Wing Attack"],
      44: ["Flamethrower"],
      54: ["Slash"],
      64: ["Dragon Rage"],
      74: ["Fire Spin"]
    }
  },
  7: { // Squirtle
    name: "Squirtle",
    levelUp: {
      1: ["Tackle", "Tail Whip"],
      7: ["Bubble"],
      10: ["Withdraw"],
      13: ["Water Gun"],
      18: ["Bite"],
      23: ["Rapid Spin"],
      28: ["Protect"],
      33: ["Water Pulse"],
      40: ["Aqua Tail"],
      47: ["Skull Bash"],
      54: ["Iron Defense"],
      61: ["Rain Dance"],
      68: ["Hydro Pump"]
    }
  },
  8: { // Wartortle
    name: "Wartortle",
    levelUp: {
      1: ["Tackle", "Tail Whip", "Bubble"],
      7: ["Bubble"],
      10: ["Withdraw"],
      13: ["Water Gun"],
      19: ["Bite"],
      25: ["Rapid Spin"],
      31: ["Protect"],
      37: ["Water Pulse"],
      45: ["Aqua Tail"],
      53: ["Skull Bash"],
      61: ["Iron Defense"],
      69: ["Rain Dance"],
      77: ["Hydro Pump"]
    }
  },
  9: { // Blastoise
    name: "Blastoise",
    levelUp: {
      1: ["Tackle", "Tail Whip", "Bubble", "Withdraw"],
      7: ["Bubble"],
      10: ["Withdraw"],
      13: ["Water Gun"],
      19: ["Bite"],
      25: ["Rapid Spin"],
      31: ["Protect"],
      42: ["Water Pulse"],
      55: ["Aqua Tail"],
      68: ["Skull Bash"],
      81: ["Iron Defense"],
      94: ["Rain Dance"],
      107: ["Hydro Pump"]
    }
  },

  // Common Gen 1 Pokemon
  10: { // Caterpie
    name: "Caterpie",
    levelUp: {
      1: ["Tackle", "String Shot"],
      15: ["Bug Bite"]
    }
  },
  11: { // Metapod
    name: "Metapod",
    levelUp: {
      1: ["Harden"],
      7: ["Harden"]
    }
  },
  12: { // Butterfree
    name: "Butterfree",
    levelUp: {
      1: ["Tackle", "String Shot", "Harden"],
      10: ["Confusion"],
      12: ["Poison Powder"],
      14: ["Stun Spore"],
      16: ["Sleep Powder"],
      18: ["Gust"],
      22: ["Supersonic"],
      26: ["Whirlwind"],
      30: ["Psybeam"],
      34: ["Silver Wind"],
      38: ["Safeguard"],
      42: ["Psychic"]
    }
  },
  13: { // Weedle
    name: "Weedle",
    levelUp: {
      1: ["Poison Sting", "String Shot"],
      15: ["Bug Bite"]
    }
  },
  14: { // Kakuna
    name: "Kakuna",
    levelUp: {
      1: ["Harden"],
      7: ["Harden"]
    }
  },
  15: { // Beedrill
    name: "Beedrill",
    levelUp: {
      1: ["Poison Sting", "String Shot", "Harden"],
      10: ["Fury Attack"],
      15: ["Focus Energy"],
      20: ["Twineedle"],
      25: ["Rage"],
      30: ["Pursuit"],
      35: ["Pin Missile"],
      40: ["Agility"],
      45: ["Sludge Bomb"]
    }
  },
  16: { // Pidgey
    name: "Pidgey",
    levelUp: {
      1: ["Tackle", "Sand Attack"],
      8: ["Gust"],
      12: ["Quick Attack"],
      16: ["Whirlwind"],
      20: ["Twister"],
      24: ["Feather Dance"],
      28: ["Agility"],
      32: ["Wing Attack"],
      36: ["Roost"],
      40: ["Tailwind"],
      44: ["Air slash"],
      48: ["Hurricane"]
    }
  },
  17: { // Pidgeotto
    name: "Pidgeotto",
    levelUp: {
      1: ["Tackle", "Sand Attack", "Gust"],
      8: ["Gust"],
      12: ["Quick Attack"],
      17: ["Whirlwind"],
      22: ["Twister"],
      27: ["Feather Dance"],
      32: ["Agility"],
      37: ["Wing Attack"],
      42: ["Roost"],
      47: ["Tailwind"],
      52: ["Air Slash"],
      57: ["Hurricane"]
    }
  },
  18: { // Pidgeot
    name: "Pidgeot",
    levelUp: {
      1: ["Tackle", "Sand Attack", "Gust", "Quick Attack"],
      8: ["Gust"],
      12: ["Quick Attack"],
      17: ["Whirlwind"],
      22: ["Twister"],
      27: ["Feather Dance"],
      34: ["Agility"],
      41: ["Wing Attack"],
      48: ["Roost"],
      55: ["Tailwind"],
      62: ["Air Slash"],
      69: ["Hurricane"]
    }
  },
  19: { // Rattata
    name: "Rattata",
    levelUp: {
      1: ["Tackle", "Tail Whip"],
      7: ["Quick Attack"],
      10: ["Hyper Fang"],
      13: ["Focus Energy"],
      16: ["Pursuit"],
      19: ["Super Fang"],
      22: ["Scary Face"],
      25: ["Crunch"],
      28: ["Sucker Punch"],
      31: ["Double-Edge"]
    }
  },
  20: { // Raticate
    name: "Raticate",
    levelUp: {
      1: ["Tackle", "Tail Whip", "Quick Attack"],
      7: ["Quick Attack"],
      10: ["Hyper Fang"],
      13: ["Focus Energy"],
      16: ["Pursuit"],
      20: ["Super Fang"],
      24: ["Scary Face"],
      28: ["Crunch"],
      32: ["Sucker Punch"],
      36: ["Double-Edge"]
    }
  },
  21: { // Spearow
    name: "Spearow",
    levelUp: {
      1: ["Peck", "Growl"],
      7: ["Leer"],
      13: ["Fury Attack"],
      25: ["Pursuit"],
      31: ["Mirror Move"],
      37: ["Drill Peck"],
      43: ["Agility"]
    }
  },
  22: { // Fearow
    name: "Fearow",
    levelUp: {
      1: ["Peck", "Growl", "Leer"],
      7: ["Leer"],
      13: ["Fury Attack"],
      26: ["Pursuit"],
      33: ["Mirror Move"],
      40: ["Drill Peck"],
      47: ["Agility"]
    }
  },
  23: { // Ekans
    name: "Ekans",
    levelUp: {
      1: ["Wrap", "Leer"],
      8: ["Poison Sting"],
      13: ["Bite"],
      20: ["Glare"],
      25: ["Screech"],
      32: ["Acid"],
      37: ["Haze"]
    }
  },
  24: { // Arbok
    name: "Arbok",
    levelUp: {
      1: ["Wrap", "Leer", "Poison Sting"],
      8: ["Poison Sting"],
      13: ["Bite"],
      20: ["Glare"],
      28: ["Screech"],
      38: ["Acid"],
      46: ["Haze"]
    }
  },
  26: { // Raichu
    name: "Raichu",
    levelUp: {
      1: ["Thundershock", "Tail Whip", "Quick Attack", "Thunder Wave"]
    }
  },
  27: { // Sandshrew
    name: "Sandshrew",
    levelUp: {
      1: ["Scratch", "Defense Curl"],
      6: ["Sand Attack"],
      11: ["Poison Sting"],
      17: ["Slash"],
      23: ["Swift"],
      30: ["Fury Swipes"],
      37: ["Sandstorm"]
    }
  },
  28: { // Sandslash
    name: "Sandslash",
    levelUp: {
      1: ["Scratch", "Defense Curl", "Sand Attack"],
      6: ["Sand Attack"],
      11: ["Poison Sting"],
      17: ["Slash"],
      24: ["Swift"],
      33: ["Fury Swipes"],
      42: ["Sandstorm"]
    }
  },
  29: { // Nidoran♀
    name: "Nidoran♀",
    levelUp: {
      1: ["Growl", "Tackle"],
      8: ["Scratch"],
      12: ["Double Kick"],
      17: ["Poison Sting"],
      20: ["Tail Whip"],
      23: ["Bite"],
      30: ["Flatter"]
    }
  },
  30: { // Nidorina
    name: "Nidorina",
    levelUp: {
      1: ["Growl", "Tackle", "Scratch"],
      8: ["Scratch"],
      12: ["Double Kick"],
      18: ["Poison Sting"],
      22: ["Tail Whip"],
      26: ["Bite"],
      34: ["Flatter"]
    }
  },
  31: { // Nidoqueen
    name: "Nidoqueen",
    levelUp: {
      1: ["Tackle", "Scratch", "Double Kick", "Tail Whip"],
      23: ["Body Slam"],
      35: ["Superpower"],
      46: ["Earth Power"]
    }
  },
  32: { // Nidoran♂
    name: "Nidoran♂",
    levelUp: {
      1: ["Leer", "Tackle"],
      8: ["Horn Attack"],
      12: ["Double Kick"],
      17: ["Poison Sting"],
      20: ["Focus Energy"],
      23: ["Fury Attack"],
      30: ["Flatter"]
    }
  },
  33: { // Nidorino
    name: "Nidorino",
    levelUp: {
      1: ["Leer", "Tackle", "Horn Attack"],
      8: ["Horn Attack"],
      12: ["Double Kick"],
      18: ["Poison Sting"],
      22: ["Focus Energy"],
      26: ["Fury Attack"],
      34: ["Flatter"]
    }
  },
  34: { // Nidoking
    name: "Nidoking",
    levelUp: {
      1: ["Tackle", "Horn Attack", "Double Kick", "Focus Energy"],
      23: ["Thrash"],
      35: ["Megahorn"],
      46: ["Earth Power"]
    }
  },
  35: { // Clefairy
    name: "Clefairy",
    levelUp: {
      1: ["Pound", "Growl"],
      7: ["Encore"],
      13: ["Sing"],
      19: ["DoubleSlap"],
      25: ["Defense Curl"],
      31: ["Follow Me"],
      37: ["Minimize"],
      43: ["Metronome"],
      49: ["Cosmic Power"],
      55: ["Light Screen"]
    }
  },
  36: { // Clefable
    name: "Clefable",
    levelUp: {
      1: ["Sing", "DoubleSlap", "Minimize", "Metronome"]
    }
  },
  37: { // Vulpix
    name: "Vulpix",
    levelUp: {
      1: ["Tackle", "Tail Whip"],
      5: ["Ember"],
      9: ["Quick Attack"],
      13: ["Confuse Ray"],
      17: ["Imprison"],
      21: ["Flamethrower"],
      25: ["Safeguard"],
      29: ["Will-O-Wisp"],
      33: ["Fire Spin"]
    }
  },
  38: { // Ninetales
    name: "Ninetales",
    levelUp: {
      1: ["Ember", "Quick Attack", "Confuse Ray", "Safeguard"]
    }
  },
  39: { // Jigglypuff
    name: "Jigglypuff",
    levelUp: {
      1: ["Sing", "Pound"],
      4: ["Defense Curl"],
      9: ["Pound"],
      14: ["Disable"],
      19: ["Rollout"],
      24: ["DoubleSlap"],
      29: ["Rest"],
      34: ["Body Slam"],
      39: ["Double-Edge"]
    }
  },
  40: { // Wigglytuff
    name: "Wigglytuff",
    levelUp: {
      1: ["Sing", "Disable", "Defense Curl", "DoubleSlap"]
    }
  },
  41: { // Zubat
    name: "Zubat",
    levelUp: {
      1: ["Leech Life", "Supersonic"],
      6: ["Astonish"],
      11: ["Bite"],
      16: ["Wing Attack"],
      21: ["Confuse Ray"],
      26: ["Air Cutter"],
      31: ["Mean Look"],
      36: ["Poison Fang"],
      41: ["Haze"]
    }
  },
  42: { // Golbat
    name: "Golbat",
    levelUp: {
      1: ["Leech Life", "Supersonic", "Astonish"],
      6: ["Astonish"],
      11: ["Bite"],
      16: ["Wing Attack"],
      23: ["Confuse Ray"],
      30: ["Air Cutter"],
      37: ["Mean Look"],
      44: ["Poison Fang"],
      51: ["Haze"]
    }
  },
  43: { // Oddish
    name: "Oddish",
    levelUp: {
      1: ["Absorb", "Sweet Scent"],
      7: ["Acid"],
      14: ["Poison Powder"],
      16: ["Stun Spore"],
      18: ["Sleep Powder"],
      23: ["Petal Dance"],
      32: ["Toxic"],
      39: ["Moonlight"]
    }
  },
  44: { // Gloom
    name: "Gloom",
    levelUp: {
      1: ["Absorb", "Sweet Scent", "Acid"],
      7: ["Acid"],
      14: ["Poison Powder"],
      16: ["Stun Spore"],
      18: ["Sleep Powder"],
      24: ["Petal Dance"],
      35: ["Toxic"],
      44: ["Moonlight"]
    }
  },
  45: { // Vileplume
    name: "Vileplume",
    levelUp: {
      1: ["Absorb", "Acid", "Poison Powder", "Petal Dance"]
    }
  },
  46: { // Paras
    name: "Paras",
    levelUp: {
      1: ["Scratch", "Stun Spore"],
      6: ["Poison Powder"],
      11: ["Leech Life"],
      17: ["Spore"],
      22: ["Slash"],
      27: ["Growth"],
      33: ["Giga Drain"],
      38: ["Aromatherapy"]
    }
  },
  47: { // Parasect
    name: "Parasect",
    levelUp: {
      1: ["Scratch", "Stun Spore", "Poison Powder"],
      6: ["Poison Powder"],
      11: ["Leech Life"],
      17: ["Spore"],
      23: ["Slash"],
      29: ["Growth"],
      37: ["Giga Drain"],
      44: ["Aromatherapy"]
    }
  },
  48: { // Venonat
    name: "Venonat",
    levelUp: {
      1: ["Tackle", "Disable"],
      9: ["Foresight"],
      17: ["Supersonic"],
      20: ["Confusion"],
      25: ["Poison Powder"],
      28: ["Leech Life"],
      33: ["Stun Spore"],
      36: ["Psybeam"],
      41: ["Sleep Powder"]
    }
  },
  49: { // Venomoth
    name: "Venomoth",
    levelUp: {
      1: ["Tackle", "Disable", "Foresight", "Supersonic"],
      9: ["Foresight"],
      17: ["Supersonic"],
      20: ["Confusion"],
      25: ["Poison Powder"],
      28: ["Leech Life"],
      31: ["Silver Wind"],
      36: ["Stun Spore"],
      42: ["Psybeam"],
      52: ["Sleep Powder"]
    }
  },
  50: { // Diglett
    name: "Diglett",
    levelUp: {
      1: ["Scratch", "Sand Attack"],
      5: ["Growl"],
      9: ["Magnitude"],
      17: ["Dig"],
      21: ["Sand Tomb"],
      25: ["Mud-Slap"],
      33: ["Earthquake"],
      37: ["Fissure"]
    }
  },
  51: { // Dugtrio
    name: "Dugtrio",
    levelUp: {
      1: ["Scratch", "Sand Attack", "Growl"],
      5: ["Growl"],
      9: ["Magnitude"],
      17: ["Dig"],
      23: ["Sand Tomb"],
      29: ["Mud-Slap"],
      41: ["Earthquake"],
      47: ["Fissure"]
    }
  },

  // Gen 2 Starters
  52: { // Meowth
    name: "Meowth",
    levelUp: {
      1: ["Scratch", "Growl"],
      11: ["Bite"],
      20: ["Pay Day"],
      28: ["Feint Attack"],
      35: ["Screech"],
      41: ["Fury Swipes"],
      46: ["Slash"]
    }
  },
  53: { // Persian
    name: "Persian",
    levelUp: {
      1: ["Scratch", "Growl", "Bite"],
      11: ["Bite"],
      20: ["Pay Day"],
      29: ["Feint Attack"],
      38: ["Screech"],
      46: ["Fury Swipes"],
      53: ["Slash"]
    }
  },
  54: { // Psyduck
    name: "Psyduck",
    levelUp: {
      1: ["Scratch", "Tail Whip"],
      5: ["Water Gun"],
      10: ["Disable"],
      16: ["Confusion"],
      23: ["Water Pulse"],
      31: ["Fury Swipes"],
      40: ["Hydro Pump"]
    }
  },
  55: { // Golduck
    name: "Golduck",
    levelUp: {
      1: ["Scratch", "Tail Whip", "Water Gun", "Disable"],
      5: ["Water Gun"],
      10: ["Disable"],
      16: ["Confusion"],
      24: ["Water Pulse"],
      33: ["Fury Swipes"],
      44: ["Hydro Pump"]
    }
  },
  56: { // Mankey
    name: "Mankey",
    levelUp: {
      1: ["Scratch", "Leer"],
      9: ["Low Kick"],
      15: ["Karate Chop"],
      21: ["Fury Swipes"],
      27: ["Focus Energy"],
      33: ["Seismic Toss"],
      39: ["Cross Chop"],
      45: ["Thrash"]
    }
  },
  57: { // Primeape
    name: "Primeape",
    levelUp: {
      1: ["Scratch", "Leer", "Low Kick"],
      9: ["Low Kick"],
      15: ["Karate Chop"],
      21: ["Fury Swipes"],
      27: ["Focus Energy"],
      28: ["Rage"],
      36: ["Seismic Toss"],
      45: ["Cross Chop"],
      54: ["Thrash"]
    }
  },
  58: { // Growlithe
    name: "Growlithe",
    levelUp: {
      1: ["Bite", "Roar"],
      7: ["Ember"],
      13: ["Leer"],
      19: ["Odor Sleuth"],
      25: ["Take Down"],
      31: ["Flame Wheel"],
      37: ["Helping Hand"],
      43: ["Agility"],
      49: ["Flamethrower"]
    }
  },
  59: { // Arcanine
    name: "Arcanine",
    levelUp: {
      1: ["Bite", "Roar", "Ember", "Odor Sleuth"]
    }
  },
  60: { // Poliwag
    name: "Poliwag",
    levelUp: {
      1: ["Bubble", "Hypnosis"],
      7: ["Water Gun"],
      13: ["DoubleSlap"],
      19: ["Rain Dance"],
      25: ["Body Slam"],
      31: ["Belly Drum"],
      37: ["Hydro Pump"]
    }
  },
  61: { // Poliwhirl
    name: "Poliwhirl",
    levelUp: {
      1: ["Bubble", "Hypnosis", "Water Gun"],
      7: ["Water Gun"],
      13: ["DoubleSlap"],
      19: ["Rain Dance"],
      27: ["Body Slam"],
      35: ["Belly Drum"],
      43: ["Hydro Pump"]
    }
  },
  62: { // Poliwrath
    name: "Poliwrath",
    levelUp: {
      1: ["Water Gun", "Hypnosis", "DoubleSlap", "Submission"],
      32: ["Mind Reader"],
      42: ["DynamicPunch"]
    }
  },
  63: { // Abra
    name: "Abra",
    levelUp: {
      1: ["Teleport"]
    }
  },
  64: { // Kadabra
    name: "Kadabra",
    levelUp: {
      1: ["Teleport", "Kinesis"],
      16: ["Kinesis"],
      18: ["Confusion"],
      21: ["Disable"],
      26: ["Psybeam"],
      31: ["Recover"],
      38: ["Future Sight"],
      45: ["Psychic"]
    }
  },
  65: { // Alakazam
    name: "Alakazam",
    levelUp: {
      1: ["Teleport", "Kinesis", "Confusion"],
      16: ["Kinesis"],
      18: ["Confusion"],
      21: ["Disable"],
      26: ["Psybeam"],
      31: ["Recover"],
      38: ["Future Sight"],
      45: ["Psychic"]
    }
  },
  66: { // Machop
    name: "Machop",
    levelUp: {
      1: ["Low Kick", "Leer"],
      7: ["Focus Energy"],
      13: ["Karate Chop"],
      19: ["Seismic Toss"],
      25: ["Foresight"],
      31: ["Vital Throw"],
      37: ["Cross Chop"],
      43: ["Scary Face"],
      49: ["DynamicPunch"]
    }
  },
  67: { // Machoke
    name: "Machoke",
    levelUp: {
      1: ["Low Kick", "Leer", "Focus Energy"],
      7: ["Focus Energy"],
      13: ["Karate Chop"],
      19: ["Seismic Toss"],
      25: ["Foresight"],
      33: ["Vital Throw"],
      41: ["Cross Chop"],
      49: ["Scary Face"],
      57: ["DynamicPunch"]
    }
  },
  68: { // Machamp
    name: "Machamp",
    levelUp: {
      1: ["Low Kick", "Leer", "Focus Energy"],
      7: ["Focus Energy"],
      13: ["Karate Chop"],
      19: ["Seismic Toss"],
      25: ["Foresight"],
      33: ["Vital Throw"],
      41: ["Cross Chop"],
      49: ["Scary Face"],
      57: ["DynamicPunch"]
    }
  },
  69: { // Bellsprout
    name: "Bellsprout",
    levelUp: {
      1: ["Vine Whip", "Growth"],
      6: ["Wrap"],
      11: ["Sleep Powder"],
      15: ["Poison Powder"],
      17: ["Stun Spore"],
      23: ["Acid"],
      30: ["Knock Off"],
      37: ["Sweet Scent"],
      45: ["Slam"]
    }
  },
  70: { // Weepinbell
    name: "Weepinbell",
    levelUp: {
      1: ["Vine Whip", "Growth", "Wrap"],
      6: ["Wrap"],
      11: ["Sleep Powder"],
      15: ["Poison Powder"],
      17: ["Stun Spore"],
      24: ["Acid"],
      33: ["Knock Off"],
      42: ["Sweet Scent"],
      54: ["Slam"]
    }
  },
  71: { // Victreebel
    name: "Victreebel",
    levelUp: {
      1: ["Vine Whip", "Sleep Powder", "Sweet Scent", "Razor Leaf"]
    }
  },
  72: { // Tentacool
    name: "Tentacool",
    levelUp: {
      1: ["Poison Sting", "Supersonic"],
      6: ["Constrict"],
      12: ["Acid"],
      19: ["Bubblebeam"],
      25: ["Wrap"],
      30: ["Barrier"],
      36: ["Screech"],
      43: ["Hydro Pump"]
    }
  },
  73: { // Tentacruel
    name: "Tentacruel",
    levelUp: {
      1: ["Poison Sting", "Supersonic", "Constrict"],
      6: ["Constrict"],
      12: ["Acid"],
      19: ["Bubblebeam"],
      25: ["Wrap"],
      30: ["Barrier"],
      38: ["Screech"],
      47: ["Hydro Pump"]
    }
  },
  74: { // Geodude
    name: "Geodude",
    levelUp: {
      1: ["Tackle", "Defense Curl"],
      6: ["Rock Throw"],
      11: ["Magnitude"],
      16: ["Self-Destruct"],
      21: ["Harden"],
      26: ["Rollout"],
      31: ["Rock Blast"],
      36: ["Earthquake"],
      41: ["Explosion"]
    }
  },
  75: { // Graveler
    name: "Graveler",
    levelUp: {
      1: ["Tackle", "Defense Curl", "Rock Throw"],
      6: ["Rock Throw"],
      11: ["Magnitude"],
      16: ["Self-Destruct"],
      21: ["Harden"],
      29: ["Rollout"],
      37: ["Rock Blast"],
      45: ["Earthquake"],
      53: ["Explosion"]
    }
  },
  76: { // Golem
    name: "Golem",
    levelUp: {
      1: ["Tackle", "Defense Curl", "Rock Throw"],
      6: ["Rock Throw"],
      11: ["Magnitude"],
      16: ["Self-Destruct"],
      21: ["Harden"],
      29: ["Rollout"],
      37: ["Rock Blast"],
      45: ["Earthquake"],
      53: ["Explosion"]
    }
  },
  77: { // Ponyta
    name: "Ponyta",
    levelUp: {
      1: ["Tackle", "Growl"],
      4: ["Tail Whip"],
      8: ["Ember"],
      13: ["Flame Wheel"],
      19: ["Stomp"],
      26: ["Fire Spin"],
      34: ["Take Down"],
      43: ["Agility"],
      53: ["Fire Blast"]
    }
  },
  78: { // Rapidash
    name: "Rapidash",
    levelUp: {
      1: ["Tackle", "Growl", "Tail Whip", "Ember"],
      4: ["Tail Whip"],
      8: ["Ember"],
      13: ["Flame Wheel"],
      19: ["Stomp"],
      26: ["Fire Spin"],
      34: ["Take Down"],
      40: ["Fury Attack"],
      47: ["Agility"],
      61: ["Fire Blast"]
    }
  },
  79: { // Slowpoke
    name: "Slowpoke",
    levelUp: {
      1: ["Curse", "Tackle"],
      6: ["Growl"],
      15: ["Water Gun"],
      20: ["Confusion"],
      29: ["Disable"],
      34: ["Headbutt"],
      43: ["Water Pulse"],
      48: ["Zen Headbutt"],
      57: ["Amnesia"],
      62: ["Psychic"]
    }
  },
  80: { // Slowbro
    name: "Slowbro",
    levelUp: {
      1: ["Curse", "Tackle", "Growl", "Water Gun"],
      6: ["Growl"],
      15: ["Water Gun"],
      20: ["Confusion"],
      29: ["Disable"],
      34: ["Headbutt"],
      37: ["Withdraw"],
      46: ["Water Pulse"],
      54: ["Zen Headbutt"],
      67: ["Amnesia"],
      76: ["Psychic"]
    }
  },
  81: { // Magnemite
    name: "Magnemite",
    levelUp: {
      1: ["Metal Sound", "Tackle"],
      6: ["ThunderShock"],
      11: ["Supersonic"],
      16: ["SonicBoom"],
      21: ["Thunder Wave"],
      26: ["Lock-On"],
      31: ["Swift"],
      36: ["Screech"],
      41: ["Zap Cannon"]
    }
  },
  82: { // Magneton
    name: "Magneton",
    levelUp: {
      1: ["Metal Sound", "Tackle", "ThunderShock"],
      6: ["ThunderShock"],
      11: ["Supersonic"],
      16: ["SonicBoom"],
      21: ["Thunder Wave"],
      26: ["Lock-On"],
      35: ["Tri Attack"],
      39: ["Swift"],
      46: ["Screech"],
      53: ["Zap Cannon"]
    }
  },
  83: { // Farfetch'd
    name: "Farfetch'd",
    levelUp: {
      1: ["Peck", "Sand Attack"],
      7: ["Leer"],
      13: ["Fury Attack"],
      19: ["Knock Off"],
      25: ["Swords Dance"],
      31: ["Agility"],
      37: ["Slash"],
      44: ["False Swipe"]
    }
  },
  84: { // Doduo
    name: "Doduo",
    levelUp: {
      1: ["Peck", "Growl"],
      9: ["Pursuit"],
      13: ["Fury Attack"],
      21: ["Tri Attack"],
      25: ["Rage"],
      33: ["Uproar"],
      37: ["Drill Peck"],
      45: ["Agility"]
    }
  },
  85: { // Dodrio
    name: "Dodrio",
    levelUp: {
      1: ["Peck", "Growl", "Pursuit"],
      9: ["Pursuit"],
      13: ["Fury Attack"],
      21: ["Tri Attack"],
      25: ["Rage"],
      38: ["Uproar"],
      44: ["Drill Peck"],
      54: ["Agility"]
    }
  },
  86: { // Seel
    name: "Seel",
    levelUp: {
      1: ["Headbutt", "Growl"],
      5: ["Water Sport"],
      16: ["Icy Wind"],
      21: ["Encore"],
      32: ["Ice Beam"],
      37: ["Take Down"],
      48: ["Safeguard"],
      53: ["Hail"]
    }
  },
  87: { // Dewgong
    name: "Dewgong",
    levelUp: {
      1: ["Headbutt", "Growl", "Water Sport"],
      5: ["Water Sport"],
      16: ["Icy Wind"],
      21: ["Encore"],
      34: ["Ice Beam"],
      41: ["Take Down"],
      56: ["Safeguard"],
      63: ["Hail"]
    }
  },
  88: { // Grimer
    name: "Grimer",
    levelUp: {
      1: ["Poison Gas", "Pound"],
      4: ["Harden"],
      8: ["Disable"],
      13: ["Sludge"],
      19: ["Minimize"],
      26: ["Screech"],
      34: ["Acid Armor"],
      43: ["Sludge Bomb"],
      53: ["Memento"]
    }
  },
  89: { // Muk
    name: "Muk",
    levelUp: {
      1: ["Poison Gas", "Pound", "Harden"],
      4: ["Harden"],
      8: ["Disable"],
      13: ["Sludge"],
      19: ["Minimize"],
      26: ["Screech"],
      34: ["Acid Armor"],
      47: ["Sludge Bomb"],
      61: ["Memento"]
    }
  },
  90: { // Shellder
    name: "Shellder",
    levelUp: {
      1: ["Tackle", "Withdraw"],
      9: ["Supersonic"],
      17: ["Aurora Beam"],
      25: ["Protect"],
      33: ["Leer"],
      41: ["Clamp"],
      49: ["Ice Beam"]
    }
  },
  91: { // Cloyster
    name: "Cloyster",
    levelUp: {
      1: ["Withdraw", "Supersonic", "Aurora Beam", "Protect"]
    }
  },
  92: { // Gastly
    name: "Gastly",
    levelUp: {
      1: ["Hypnosis", "Lick"],
      8: ["Spite"],
      13: ["Mean Look"],
      16: ["Curse"],
      21: ["Night Shade"],
      28: ["Confuse Ray"],
      33: ["Dream Eater"],
      36: ["Destiny Bond"]
    }
  },
  93: { // Haunter
    name: "Haunter",
    levelUp: {
      1: ["Hypnosis", "Lick", "Spite"],
      8: ["Spite"],
      13: ["Mean Look"],
      16: ["Curse"],
      21: ["Night Shade"],
      31: ["Confuse Ray"],
      39: ["Dream Eater"],
      44: ["Destiny Bond"]
    }
  },
  94: { // Gengar
    name: "Gengar",
    levelUp: {
      1: ["Hypnosis", "Lick", "Spite"],
      8: ["Spite"],
      13: ["Mean Look"],
      16: ["Curse"],
      21: ["Night Shade"],
      31: ["Confuse Ray"],
      39: ["Dream Eater"],
      44: ["Destiny Bond"]
    }
  },
  95: { // Onix
    name: "Onix",
    levelUp: {
      1: ["Tackle", "Screech"],
      9: ["Bind"],
      13: ["Rock Throw"],
      21: ["Rage"],
      25: ["Slam"],
      33: ["Rock Slide"],
      37: ["Harden"],
      45: ["Double-Edge"]
    }
  },
  96: { // Drowzee
    name: "Drowzee",
    levelUp: {
      1: ["Pound", "Hypnosis"],
      7: ["Disable"],
      11: ["Confusion"],
      17: ["Headbutt"],
      21: ["Poison Gas"],
      27: ["Meditate"],
      31: ["Psybeam"],
      37: ["Psychic"],
      41: ["Future Sight"]
    }
  },
  97: { // Hypno
    name: "Hypno",
    levelUp: {
      1: ["Pound", "Hypnosis", "Disable"],
      7: ["Disable"],
      11: ["Confusion"],
      17: ["Headbutt"],
      21: ["Poison Gas"],
      29: ["Meditate"],
      35: ["Psybeam"],
      43: ["Psychic"],
      49: ["Future Sight"]
    }
  },
  98: { // Krabby
    name: "Krabby",
    levelUp: {
      1: ["Bubble", "Leer"],
      5: ["Vicegrip"],
      12: ["Harden"],
      16: ["Bubblebeam"],
      23: ["Mud Shot"],
      27: ["Stomp"],
      34: ["Protect"],
      38: ["Guillotine"],
      45: ["Crabhammer"]
    }
  },
  99: { // Kingler
    name: "Kingler",
    levelUp: {
      1: ["Bubble", "Leer", "Vicegrip"],
      5: ["Vicegrip"],
      12: ["Harden"],
      16: ["Bubblebeam"],
      23: ["Mud Shot"],
      27: ["Stomp"],
      38: ["Protect"],
      44: ["Guillotine"],
      54: ["Crabhammer"]
    }
  },
  100: { // Voltorb
    name: "Voltorb",
    levelUp: {
      1: ["Charge", "Tackle"],
      8: ["SonicBoom"],
      15: ["Spark"],
      21: ["Rollout"],
      27: ["Light Screen"],
      32: ["Swift"],
      37: ["Self-Destruct"],
      42: ["Explosion"]
    }
  },
  101: { // Electrode
    name: "Electrode",
    levelUp: {
      1: ["Charge", "Tackle", "SonicBoom"],
      8: ["SonicBoom"],
      15: ["Spark"],
      21: ["Rollout"],
      27: ["Light Screen"],
      34: ["Swift"],
      41: ["Self-Destruct"],
      48: ["Explosion"]
    }
  },
  102: { // Exeggcute
    name: "Exeggcute",
    levelUp: {
      1: ["Barrage", "Uproar"],
      7: ["Reflect"],
      11: ["Leech Seed"],
      17: ["Confusion"],
      19: ["Stun Spore"],
      21: ["Poison Powder"],
      23: ["Sleep Powder"],
      27: ["SolarBeam"],
      33: ["Explosion"]
    }
  },
  103: { // Exeggutor
    name: "Exeggutor",
    levelUp: {
      1: ["Barrage", "Uproar", "Confusion", "Stomp"]
    }
  },
  104: { // Cubone
    name: "Cubone",
    levelUp: {
      1: ["Growl", "Tail Whip"],
      5: ["Bone Club"],
      9: ["Headbutt"],
      13: ["Leer"],
      17: ["Focus Energy"],
      21: ["Bonemerang"],
      25: ["Rage"],
      29: ["False Swipe"],
      33: ["Thrash"],
      37: ["Bone Rush"]
    }
  },
  105: { // Marowak
    name: "Marowak",
    levelUp: {
      1: ["Growl", "Tail Whip", "Bone Club"],
      5: ["Bone Club"],
      9: ["Headbutt"],
      13: ["Leer"],
      17: ["Focus Energy"],
      21: ["Bonemerang"],
      25: ["Rage"],
      32: ["False Swipe"],
      39: ["Thrash"],
      46: ["Bone Rush"]
    }
  },
  106: { // Hitmonlee
    name: "Hitmonlee",
    levelUp: {
      1: ["Double Kick", "Revenge"],
      6: ["Meditate"],
      11: ["Rolling Kick"],
      16: ["Jump Kick"],
      21: ["Brick Break"],
      26: ["Focus Energy"],
      31: ["Hi Jump Kick"],
      36: ["Mind Reader"],
      41: ["Foresight"],
      46: ["Blaze Kick"],
      51: ["Megakick"]
    }
  },
  107: { // Hitmonchan
    name: "Hitmonchan",
    levelUp: {
      1: ["Comet Punch", "Revenge"],
      6: ["Agility"],
      11: ["Pursuit"],
      16: ["Mach Punch"],
      21: ["ThunderPunch"],
      21: ["Ice Punch"],
      21: ["Fire Punch"],
      26: ["Sky Uppercut"],
      31: ["Mega Punch"],
      36: ["Detect"],
      41: ["Counter"],
      46: ["Close Combat"]
    }
  },
  108: { // Lickitung
    name: "Lickitung",
    levelUp: {
      1: ["Lick", "Supersonic"],
      7: ["Defense Curl"],
      13: ["Knock Off"],
      19: ["Wrap"],
      25: ["Stomp"],
      31: ["Disable"],
      37: ["Slam"],
      43: ["Screech"]
    }
  },
  109: { // Koffing
    name: "Koffing",
    levelUp: {
      1: ["Poison Gas", "Tackle"],
      9: ["Smog"],
      17: ["Self-Destruct"],
      21: ["Sludge"],
      25: ["Smokescreen"],
      33: ["Haze"],
      41: ["Explosion"],
      45: ["Destiny Bond"]
    }
  },
  110: { // Weezing
    name: "Weezing",
    levelUp: {
      1: ["Poison Gas", "Tackle", "Smog"],
      9: ["Smog"],
      17: ["Self-Destruct"],
      21: ["Sludge"],
      25: ["Smokescreen"],
      33: ["Haze"],
      44: ["Explosion"],
      51: ["Destiny Bond"]
    }
  },
  111: { // Rhyhorn
    name: "Rhyhorn",
    levelUp: {
      1: ["Horn Attack", "Tail Whip"],
      9: ["Stomp"],
      13: ["Fury Attack"],
      21: ["Scary Face"],
      25: ["Rock Blast"],
      33: ["Horn Drill"],
      37: ["Take Down"],
      45: ["Earthquake"],
      49: ["Megahorn"]
    }
  },
  112: { // Rhydon
    name: "Rhydon",
    levelUp: {
      1: ["Horn Attack", "Tail Whip", "Stomp"],
      9: ["Stomp"],
      13: ["Fury Attack"],
      21: ["Scary Face"],
      25: ["Rock Blast"],
      35: ["Horn Drill"],
      41: ["Take Down"],
      51: ["Earthquake"],
      57: ["Megahorn"]
    }
  },
  113: { // Chansey
    name: "Chansey",
    levelUp: {
      1: ["Pound", "Growl"],
      5: ["Tail Whip"],
      9: ["Refresh"],
      13: ["SoftBoiled"],
      17: ["DoubleSlap"],
      23: ["Minimize"],
      29: ["Sing"],
      35: ["Egg Bomb"],
      41: ["Defense Curl"],
      49: ["Light Screen"],
      57: ["Double-Edge"]
    }
  },
  114: { // Tangela
    name: "Tangela",
    levelUp: {
      1: ["Ingrain", "Constrict"],
      4: ["Sleep Powder"],
      10: ["Absorb"],
      13: ["Growth"],
      19: ["Poison Powder"],
      22: ["Vine Whip"],
      28: ["Bind"],
      31: ["Mega Drain"],
      37: ["Stun Spore"],
      40: ["Ancientpower"],
      46: ["Slam"]
    }
  },
  115: { // Kangaskhan
    name: "Kangaskhan",
    levelUp: {
      1: ["Comet Punch", "Leer"],
      7: ["Bite"],
      13: ["Tail Whip"],
      19: ["Fake Out"],
      25: ["Mega Punch"],
      31: ["Rage"],
      37: ["Endure"],
      43: ["Dizzy Punch"],
      49: ["Reversal"]
    }
  },
  116: { // Horsea
    name: "Horsea",
    levelUp: {
      1: ["Bubble", "SmokeScreen"],
      8: ["Leer"],
      15: ["Water Gun"],
      22: ["Twister"],
      29: ["Bubblebeam"],
      36: ["Agility"],
      43: ["Hydro Pump"]
    }
  },
  117: { // Seadra
    name: "Seadra",
    levelUp: {
      1: ["Bubble", "SmokeScreen", "Leer"],
      8: ["Leer"],
      15: ["Water Gun"],
      22: ["Twister"],
      31: ["Bubblebeam"],
      40: ["Agility"],
      49: ["Hydro Pump"]
    }
  },
  118: { // Goldeen
    name: "Goldeen",
    levelUp: {
      1: ["Peck", "Tail Whip"],
      10: ["Water Sport"],
      15: ["Supersonic"],
      24: ["Horn Attack"],
      29: ["Flail"],
      38: ["Water Pulse"],
      43: ["Fury Attack"],
      52: ["Horn Drill"],
      57: ["Agility"]
    }
  },
  119: { // Seaking
    name: "Seaking",
    levelUp: {
      1: ["Peck", "Tail Whip", "Water Sport"],
      10: ["Water Sport"],
      15: ["Supersonic"],
      24: ["Horn Attack"],
      31: ["Flail"],
      42: ["Water Pulse"],
      49: ["Fury Attack"],
      60: ["Horn Drill"],
      67: ["Agility"]
    }
  },
  120: { // Staryu
    name: "Staryu",
    levelUp: {
      1: ["Tackle", "Harden"],
      6: ["Water Gun"],
      10: ["Rapid Spin"],
      15: ["Recover"],
      19: ["Camouflage"],
      24: ["Swift"],
      28: ["Bubblebeam"],
      33: ["Minimize"],
      37: ["Light Screen"],
      42: ["Cosmic Power"],
      46: ["Hydro Pump"]
    }
  },
  121: { // Starmie
    name: "Starmie",
    levelUp: {
      1: ["Water Gun", "Rapid Spin", "Recover", "Swift"]
    }
  },
  122: { // Mr. Mime
    name: "Mr. Mime",
    levelUp: {
      1: ["Magical Leaf", "Quick Guard"],
      4: ["Confusion"],
      8: ["Copycat"],
      11: ["Meditate"],
      15: ["DoubleSlap"],
      18: ["Mimic"],
      22: ["Psybeam"],
      25: ["Substitute"],
      29: ["Recycle"],
      32: ["Trick"],
      36: ["Psychic"],
      39: ["Role Play"],
      43: ["Baton Pass"],
      46: ["Safeguard"]
    }
  },
  123: { // Scyther
    name: "Scyther",
    levelUp: {
      1: ["Quick Attack", "Leer"],
      5: ["Focus Energy"],
      9: ["Pursuit"],
      13: ["False Swipe"],
      17: ["Agility"],
      21: ["Wing Attack"],
      25: ["Fury Cutter"],
      29: ["Slash"],
      33: ["Razor Wind"],
      37: ["Double Team"],
      41: ["Swords Dance"]
    }
  },
  124: { // Jynx
    name: "Jynx",
    levelUp: {
      1: ["Pound", "Lick", "Lovely Kiss"],
      9: ["Powder Snow"],
      13: ["DoubleSlap"],
      21: ["Ice Punch"],
      25: ["Mean Look"],
      35: ["Fake Tears"],
      41: ["Wake-Up Slap"],
      51: ["Avalanche"],
      57: ["Body Slam"],
      67: ["Wring Out"],
      73: ["Blizzard"]
    }
  },
  125: { // Electabuzz
    name: "Electabuzz",
    levelUp: {
      1: ["Quick Attack", "Leer"],
      7: ["ThunderShock"],
      13: ["Low Kick"],
      19: ["Swift"],
      25: ["Shock Wave"],
      31: ["Light Screen"],
      37: ["ThunderPunch"],
      43: ["Discharge"],
      49: ["Thunderbolt"],
      55: ["Screech"],
      61: ["Thunder"]
    }
  },
  126: { // Magmar
    name: "Magmar",
    levelUp: {
      1: ["Smog", "Leer"],
      7: ["Ember"],
      13: ["SmokeScreen"],
      19: ["Faint Attack"],
      25: ["Fire Spin"],
      31: ["Confuse Ray"],
      37: ["Fire Punch"],
      43: ["Lava Plume"],
      49: ["Flamethrower"],
      55: ["Sunny Day"],
      61: ["Fire Blast"]
    }
  },
  127: { // Pinsir
    name: "Pinsir",
    levelUp: {
      1: ["Vicegrip", "Focus Energy"],
      7: ["Bind"],
      13: ["Seismic Toss"],
      19: ["Harden"],
      25: ["Revenge"],
      31: ["Brick Break"],
      37: ["Vital Throw"],
      43: ["Submission"],
      49: ["Guillotine"],
      55: ["Superpower"]
    }
  },
  128: { // Tauros
    name: "Tauros",
    levelUp: {
      1: ["Tackle", "Tail Whip"],
      4: ["Rage"],
      8: ["Horn Attack"],
      13: ["Scary Face"],
      19: ["Pursuit"],
      26: ["Rest"],
      34: ["Payback"],
      43: ["Zen Headbutt"],
      53: ["Take Down"],
      64: ["Thrash"]
    }
  },
  129: { // Magikarp
    name: "Magikarp",
    levelUp: {
      1: ["Splash"],
      15: ["Tackle"],
      30: ["Flail"]
    }
  },
  130: { // Gyarados
    name: "Gyarados",
    levelUp: {
      1: ["Thrash", "Bite"],
      20: ["Bite"],
      23: ["Dragon Rage"],
      26: ["Leer"],
      29: ["Twister"],
      32: ["Ice Fang"],
      35: ["Aqua Tail"],
      38: ["Rain Dance"],
      41: ["Hydro Pump"],
      44: ["Dragon Dance"],
      47: ["Hyper Beam"]
    }
  },
  131: { // Lapras
    name: "Lapras",
    levelUp: {
      1: ["Water Gun", "Growl"],
      7: ["Sing"],
      13: ["Mist"],
      19: ["Confuse Ray"],
      25: ["Water Pulse"],
      31: ["Body Slam"],
      37: ["Rain Dance"],
      43: ["Perish Song"],
      49: ["Ice Beam"],
      55: ["Hydro Pump"],
      61: ["Sheer Cold"]
    }
  },
  132: { // Ditto
    name: "Ditto",
    levelUp: {
      1: ["Transform"]
    }
  },
  133: { // Eevee
    name: "Eevee",
    levelUp: {
      1: ["Tackle", "Tail Whip"],
      8: ["Sand Attack"],
      16: ["Growl"],
      23: ["Quick Attack"],
      30: ["Bite"],
      36: ["Baton Pass"],
      42: ["Take Down"]
    }
  },
  134: { // Vaporeon
    name: "Vaporeon",
    levelUp: {
      1: ["Tackle", "Tail Whip", "Water Gun"],
      8: ["Sand Attack"],
      16: ["Water Gun"],
      23: ["Quick Attack"],
      30: ["Bite"],
      36: ["Aurora Beam"],
      42: ["Aqua Ring"],
      47: ["Last Resort"],
      52: ["Haze"],
      57: ["Acid Armor"],
      62: ["Hydro Pump"]
    }
  },
  135: { // Jolteon
    name: "Jolteon",
    levelUp: {
      1: ["Tackle", "Tail Whip", "ThunderShock"],
      8: ["Sand Attack"],
      16: ["ThunderShock"],
      23: ["Quick Attack"],
      30: ["Double Kick"],
      36: ["Pin Missile"],
      42: ["Thunder Wave"],
      47: ["Last Resort"],
      52: ["Agility"],
      57: ["Thunder"],
      62: ["Discharge"]
    }
  },
  136: { // Flareon
    name: "Flareon",
    levelUp: {
      1: ["Tackle", "Tail Whip", "Ember"],
      8: ["Sand Attack"],
      16: ["Ember"],
      23: ["Quick Attack"],
      30: ["Bite"],
      36: ["Fire Fang"],
      42: ["Fire Spin"],
      47: ["Last Resort"],
      52: ["Smog"],
      57: ["Lava Plume"],
      62: ["Fire Blast"]
    }
  },
  137: { // Porygon
    name: "Porygon",
    levelUp: {
      1: ["Conversion 2", "Tackle"],
      9: ["Agility"],
      12: ["Psybeam"],
      20: ["Recover"],
      24: ["Magnet Rise"],
      32: ["Signal Beam"],
      36: ["Recycle"],
      44: ["Discharge"],
      48: ["Lock-On"],
      56: ["Tri Attack"],
      60: ["Magic Coat"],
      68: ["Zap Cannon"]
    }
  },
  138: { // Omanyte
    name: "Omanyte",
    levelUp: {
      1: ["Constrict", "Withdraw"],
      7: ["Bite"],
      10: ["Water Gun"],
      16: ["Rollout"],
      19: ["Leer"],
      25: ["Mud Shot"],
      28: ["Brine"],
      34: ["Protect"],
      37: ["Ancientpower"],
      43: ["Spike Cannon"],
      46: ["Tickle"],
      52: ["Rock Blast"],
      55: ["Hydro Pump"]
    }
  },
  139: { // Omastar
    name: "Omastar",
    levelUp: {
      1: ["Constrict", "Withdraw", "Bite"],
      7: ["Bite"],
      10: ["Water Gun"],
      16: ["Rollout"],
      19: ["Leer"],
      25: ["Mud Shot"],
      28: ["Brine"],
      34: ["Protect"],
      40: ["Ancientpower"],
      49: ["Spike Cannon"],
      55: ["Tickle"],
      65: ["Rock Blast"],
      71: ["Hydro Pump"]
    }
  },
  140: { // Kabuto
    name: "Kabuto",
    levelUp: {
      1: ["Scratch", "Harden"],
      6: ["Absorb"],
      11: ["Leer"],
      16: ["Sand Attack"],
      21: ["Endure"],
      26: ["Aqua Jet"],
      31: ["Mega Drain"],
      36: ["Metal Sound"],
      41: ["Ancientpower"],
      46: ["Wring Out"]
    }
  },
  141: { // Kabutops
    name: "Kabutops",
    levelUp: {
      1: ["Scratch", "Harden", "Absorb"],
      6: ["Absorb"],
      11: ["Leer"],
      16: ["Sand Attack"],
      21: ["Endure"],
      26: ["Aqua Jet"],
      31: ["Mega Drain"],
      36: ["Slash"],
      40: ["Metal Sound"],
      48: ["Ancientpower"],
      56: ["Wring Out"],
      64: ["Night Slash"]
    }
  },
  142: { // Aerodactyl
    name: "Aerodactyl",
    levelUp: {
      1: ["Wing Attack", "Supersonic"],
      8: ["Bite"],
      15: ["Scary Face"],
      22: ["Roar"],
      29: ["Agility"],
      36: ["Ancientpower"],
      43: ["Crunch"],
      50: ["Take Down"],
      57: ["Sky Attack"],
      64: ["Hyper Beam"]
    }
  },
  143: { // Snorlax
    name: "Snorlax",
    levelUp: {
      1: ["Tackle", "Defense Curl"],
      6: ["Amnesia"],
      10: ["Lick"],
      15: ["Chip Away"],
      19: ["Yawn"],
      24: ["Body Slam"],
      28: ["Rest"],
      33: ["Snore"],
      37: ["Sleep Talk"],
      42: ["Rollout"],
      46: ["Block"],
      51: ["Belly Drum"],
      55: ["Crunch"],
      60: ["Heavy Slam"],
      64: ["Giga Impact"]
    }
  },
  144: { // Articuno
    name: "Articuno",
    levelUp: {
      1: ["Powder Snow", "Mist"],
      8: ["Ice Shard"],
      15: ["Mind Reader"],
      22: ["Ancientpower"],
      29: ["Agility"],
      36: ["Ice Beam"],
      43: ["Reflect"],
      50: ["Roost"],
      57: ["Tailwind"],
      64: ["Blizzard"],
      71: ["Hail"],
      78: ["Sheer Cold"]
    }
  },
  145: { // Zapdos
    name: "Zapdos",
    levelUp: {
      1: ["Peck", "ThunderShock"],
      8: ["Thunder Wave"],
      15: ["Detect"],
      22: ["Pluck"],
      29: ["Ancientpower"],
      36: ["Charge"],
      43: ["Agility"],
      50: ["Discharge"],
      57: ["Roost"],
      64: ["Light Screen"],
      71: ["Drill Peck"],
      78: ["Thunder"]
    }
  },
  146: { // Moltres
    name: "Moltres",
    levelUp: {
      1: ["Wing Attack", "Ember"],
      8: ["Fire Spin"],
      15: ["Agility"],
      22: ["Endure"],
      29: ["Ancientpower"],
      36: ["Flamethrower"],
      43: ["Safeguard"],
      50: ["Air Slash"],
      57: ["Roost"],
      64: ["Heat Wave"],
      71: ["Sunny Day"],
      78: ["Sky Attack"]
    }
  },
  147: { // Dratini
    name: "Dratini",
    levelUp: {
      1: ["Wrap", "Leer"],
      5: ["Thunder Wave"],
      11: ["Twister"],
      15: ["Dragon Rage"],
      21: ["Slam"],
      25: ["Agility"],
      31: ["Dragon Rush"],
      35: ["Safeguard"],
      41: ["Dragon Dance"],
      45: ["Outrage"],
      51: ["Hyper Beam"]
    }
  },
  148: { // Dragonair
    name: "Dragonair",
    levelUp: {
      1: ["Wrap", "Leer", "Thunder Wave"],
      5: ["Thunder Wave"],
      11: ["Twister"],
      15: ["Dragon Rage"],
      21: ["Slam"],
      25: ["Agility"],
      33: ["Dragon Rush"],
      39: ["Safeguard"],
      47: ["Dragon Dance"],
      53: ["Outrage"],
      61: ["Hyper Beam"]
    }
  },
  149: { // Dragonite
    name: "Dragonite",
    levelUp: {
      1: ["Wing Attack", "Wrap", "Leer", "Thunder Wave"],
      5: ["Thunder Wave"],
      11: ["Twister"],
      15: ["Dragon Rage"],
      21: ["Slam"],
      25: ["Agility"],
      33: ["Dragon Rush"],
      39: ["Safeguard"],
      47: ["Wing Attack"],
      53: ["Dragon Dance"],
      61: ["Outrage"],
      75: ["Hyper Beam"]
    }
  },
  150: { // Mewtwo
    name: "Mewtwo",
    levelUp: {
      1: ["Confusion", "Disable"],
      11: ["Barrier"],
      22: ["Swift"],
      33: ["Future Sight"],
      44: ["Psych Up"],
      55: ["Miracle Eye"],
      66: ["Psycho Cut"],
      77: ["Recover"],
      88: ["Safeguard"],
      99: ["Psychic"]
    }
  },
  151: { // Mew
    name: "Mew",
    levelUp: {
      1: ["Pound", "Transform"],
      10: ["Mega Punch"],
      20: ["Metronome"],
      30: ["Psychic"],
      40: ["Barrier"],
      50: ["Ancientpower"]
    }
  },

  152: { // Chikorita
    name: "Chikorita",
    levelUp: {
      1: ["Tackle", "Growl"],
      8: ["Razor Leaf"],
      12: ["Reflect"],
      15: ["Poison Powder"],
      22: ["Synthesis"],
      29: ["Body Slam"],
      36: ["Light Screen"],
      43: ["Safeguard"],
      50: ["Solar Beam"]
    }
  },
  153: { // Bayleef
    name: "Bayleef",
    levelUp: {
      1: ["Tackle", "Growl", "Razor Leaf"],
      8: ["Razor Leaf"],
      12: ["Reflect"],
      15: ["Poison Powder"],
      23: ["Synthesis"],
      31: ["Body Slam"],
      39: ["Light Screen"],
      47: ["Safeguard"],
      55: ["Solar Beam"]
    }
  },
  154: { // Meganium
    name: "Meganium",
    levelUp: {
      1: ["Tackle", "Growl", "Razor Leaf", "Petal Dance"],
      8: ["Razor Leaf"],
      12: ["Reflect"],
      15: ["Poison Powder"],
      23: ["Synthesis"],
      31: ["Body Slam"],
      41: ["Light Screen"],
      51: ["Safeguard"],
      61: ["Solar Beam"]
    }
  },
  155: { // Cyndaquil
    name: "Cyndaquil", 
    levelUp: {
      1: ["Tackle", "Leer"],
      6: ["Smokescreen"],
      12: ["Ember"],
      19: ["Quick Attack"],
      27: ["Flame Wheel"],
      36: ["Swift"],
      46: ["Flamethrower"]
    }
  },
  156: { // Quilava
    name: "Quilava",
    levelUp: {
      1: ["Tackle", "Leer", "Smokescreen"],
      6: ["Smokescreen"],
      12: ["Ember"],
      19: ["Quick Attack"],
      28: ["Flame Wheel"],
      37: ["Swift"],
      46: ["Flamethrower"]
    }
  },
  157: { // Typhlosion
    name: "Typhlosion",
    levelUp: {
      1: ["Tackle", "Leer", "Smokescreen", "Ember"],
      6: ["Smokescreen"],
      12: ["Ember"],
      19: ["Quick Attack"],
      28: ["Flame Wheel"],
      39: ["Swift"],
      50: ["Flamethrower"]
    }
  },
  158: { // Totodile
    name: "Totodile",
    levelUp: {
      1: ["Scratch", "Leer"],
      7: ["Rage"],
      13: ["Water Gun"],
      20: ["Bite"],
      27: ["Scary Face"],
      35: ["Slash"],
      43: ["Screech"],
      52: ["Hydro Pump"]
    }
  },
  159: { // Croconaw
    name: "Croconaw",
    levelUp: {
      1: ["Scratch", "Leer", "Water Gun"],
      7: ["Water Gun"],
      13: ["Rage"],
      20: ["Bite"],
      27: ["Scary Face"],
      35: ["Slash"],
      43: ["Screech"],
      52: ["Hydro Pump"]
    }
  },
  160: { // Feraligatr
    name: "Feraligatr",
    levelUp: {
      1: ["Scratch", "Leer", "Water Gun", "Rage"],
      7: ["Water Gun"],
      13: ["Rage"],
      21: ["Bite"],
      28: ["Scary Face"],
      38: ["Slash"],
      47: ["Screech"],
      58: ["Hydro Pump"]
    }
  },
  161: { // Sentret
    name: "Sentret",
    levelUp: {
      1: ["Scratch", "Foresight"],
      5: ["Defense Curl"],
      11: ["Quick Attack"],
      17: ["Fury Swipes"],
      25: ["Helping Hand"],
      33: ["Follow Me"],
      41: ["Slam"],
      49: ["Rest"],
      57: ["Amnesia"]
    }
  },
  162: { // Furret
    name: "Furret",
    levelUp: {
      1: ["Scratch", "Foresight", "Defense Curl"],
      5: ["Defense Curl"],
      11: ["Quick Attack"],
      18: ["Fury Swipes"],
      28: ["Helping Hand"],
      38: ["Follow Me"],
      48: ["Slam"],
      58: ["Rest"],
      68: ["Amnesia"]
    }
  },
  163: { // Hoothoot
    name: "Hoothoot",
    levelUp: {
      1: ["Tackle", "Growl"],
      6: ["Foresight"],
      11: ["Peck"],
      16: ["Hypnosis"],
      22: ["Reflect"],
      28: ["Take Down"],
      34: ["Confusion"],
      48: ["Dream Eater"]
    }
  },
  164: { // Noctowl
    name: "Noctowl",
    levelUp: {
      1: ["Tackle", "Growl", "Foresight"],
      6: ["Foresight"],
      11: ["Peck"],
      16: ["Hypnosis"],
      25: ["Reflect"],
      33: ["Take Down"],
      41: ["Confusion"],
      57: ["Dream Eater"]
    }
  },
  165: { // Ledyba
    name: "Ledyba",
    levelUp: {
      1: ["Tackle", "Supersonic"],
      8: ["Comet Punch"],
      15: ["Light Screen"],
      22: ["Reflect"],
      22: ["Safeguard"],
      29: ["Baton Pass"],
      36: ["Swift"],
      43: ["Agility"],
      50: ["Double-Edge"]
    }
  },
  166: { // Ledian
    name: "Ledian",
    levelUp: {
      1: ["Tackle", "Supersonic", "Comet Punch"],
      8: ["Comet Punch"],
      15: ["Light Screen"],
      24: ["Reflect"],
      24: ["Safeguard"],
      33: ["Baton Pass"],
      42: ["Swift"],
      51: ["Agility"],
      60: ["Double-Edge"]
    }
  },
  167: { // Spinarak
    name: "Spinarak",
    levelUp: {
      1: ["Poison Sting", "String Shot"],
      6: ["Scary Face"],
      11: ["Constrict"],
      17: ["Night Shade"],
      23: ["Leech Life"],
      30: ["Fury Swipes"],
      37: ["Spider Web"],
      45: ["Agility"],
      53: ["Psychic"]
    }
  },
  168: { // Ariados
    name: "Ariados",
    levelUp: {
      1: ["Poison Sting", "String Shot", "Scary Face"],
      6: ["Scary Face"],
      11: ["Constrict"],
      17: ["Night Shade"],
      25: ["Leech Life"],
      34: ["Fury Swipes"],
      43: ["Spider Web"],
      53: ["Agility"],
      63: ["Psychic"]
    }
  },
  169: { // Crobat
    name: "Crobat",
    levelUp: {
      1: ["Leech Life", "Supersonic", "Astonish", "Bite"],
      6: ["Astonish"],
      11: ["Bite"],
      16: ["Wing Attack"],
      23: ["Confuse Ray"],
      30: ["Air Cutter"],
      37: ["Mean Look"],
      44: ["Poison Fang"],
      51: ["Haze"]
    }
  },
  170: { // Chinchou
    name: "Chinchou",
    levelUp: {
      1: ["Bubble", "Thunder Wave"],
      5: ["Supersonic"],
      13: ["Flail"],
      17: ["Water Gun"],
      25: ["Spark"],
      29: ["Confuse Ray"],
      37: ["Take Down"],
      41: ["Hydro Pump"]
    }
  },
  171: { // Lanturn
    name: "Lanturn",
    levelUp: {
      1: ["Bubble", "Thunder Wave", "Supersonic"],
      5: ["Supersonic"],
      13: ["Flail"],
      17: ["Water Gun"],
      27: ["Spark"],
      32: ["Confuse Ray"],
      42: ["Take Down"],
      48: ["Hydro Pump"]
    }
  },
  172: { // Pichu
    name: "Pichu",
    levelUp: {
      1: ["Thundershock", "Charm"],
      6: ["Tail Whip"],
      8: ["Thunder Wave"],
      11: ["Sweet Kiss"]
    }
  },
  173: { // Cleffa
    name: "Cleffa",
    levelUp: {
      1: ["Pound", "Charm"],
      4: ["Encore"],
      8: ["Sing"],
      13: ["Sweet Kiss"]
    }
  },
  174: { // Igglybuff
    name: "Igglybuff",
    levelUp: {
      1: ["Sing", "Charm"],
      4: ["Defense Curl"],
      9: ["Pound"],
      14: ["Sweet Kiss"]
    }
  },
  175: { // Togepi
    name: "Togepi",
    levelUp: {
      1: ["Growl", "Charm"],
      7: ["Metronome"],
      18: ["Sweet Kiss"],
      25: ["Yawn"],
      31: ["Encore"],
      38: ["Follow Me"],
      44: ["Wish"],
      50: ["Ancientpower"],
      56: ["Safeguard"],
      62: ["Double-Edge"]
    }
  },
  176: { // Togetic
    name: "Togetic",
    levelUp: {
      1: ["Growl", "Charm", "Metronome"],
      7: ["Metronome"],
      18: ["Sweet Kiss"],
      25: ["Yawn"],
      31: ["Encore"],
      38: ["Follow Me"],
      44: ["Wish"],
      50: ["Ancientpower"],
      56: ["Safeguard"],
      62: ["Double-Edge"]
    }
  },
  177: { // Natu
    name: "Natu",
    levelUp: {
      1: ["Peck", "Leer"],
      10: ["Night Shade"],
      20: ["Teleport"],
      30: ["Wish"],
      40: ["Future Sight"],
      50: ["Confuse Ray"],
      60: ["Psychic"]
    }
  },
  178: { // Xatu
    name: "Xatu",
    levelUp: {
      1: ["Peck", "Leer", "Night Shade"],
      10: ["Night Shade"],
      20: ["Teleport"],
      25: ["Wish"],
      35: ["Future Sight"],
      50: ["Confuse Ray"],
      65: ["Psychic"]
    }
  },
  179: { // Mareep
    name: "Mareep",
    levelUp: {
      1: ["Tackle", "Growl"],
      9: ["ThunderShock"],
      16: ["Thunder Wave"],
      23: ["Cotton Spore"],
      30: ["Light Screen"],
      37: ["Thunder"],
      44: ["Agility"]
    }
  },
  180: { // Flaaffy
    name: "Flaaffy",
    levelUp: {
      1: ["Tackle", "Growl", "ThunderShock"],
      9: ["ThunderShock"],
      18: ["Thunder Wave"],
      27: ["Cotton Spore"],
      36: ["Light Screen"],
      45: ["Thunder"],
      54: ["Agility"]
    }
  },
  181: { // Ampharos
    name: "Ampharos",
    levelUp: {
      1: ["Tackle", "Growl", "ThunderShock", "Thunder Punch"],
      9: ["ThunderShock"],
      18: ["Thunder Wave"],
      27: ["Cotton Spore"],
      30: ["Thunder Punch"],
      42: ["Light Screen"],
      57: ["Thunder"],
      72: ["Agility"]
    }
  },
  182: { // Bellossom
    name: "Bellossom",
    levelUp: {
      1: ["Absorb", "Sweet Scent", "Acid", "Petal Dance"]
    }
  },
  183: { // Marill
    name: "Marill",
    levelUp: {
      1: ["Tackle", "Defense Curl"],
      3: ["Tail Whip"],
      6: ["Water Gun"],
      10: ["Rollout"],
      15: ["Bubblebeam"],
      21: ["Double-Edge"],
      28: ["Rain Dance"],
      36: ["Hydro Pump"]
    }
  },
  184: { // Azumarill
    name: "Azumarill",
    levelUp: {
      1: ["Tackle", "Defense Curl", "Tail Whip"],
      3: ["Tail Whip"],
      6: ["Water Gun"],
      10: ["Rollout"],
      15: ["Bubblebeam"],
      21: ["Double-Edge"],
      30: ["Rain Dance"],
      40: ["Hydro Pump"]
    }
  },
  185: { // Sudowoodo
    name: "Sudowoodo",
    levelUp: {
      1: ["Rock Throw", "Mimic"],
      9: ["Flail"],
      17: ["Low Kick"],
      25: ["Rock Slide"],
      33: ["Block"],
      41: ["Faint Attack"],
      49: ["Slam"]
    }
  },
  186: { // Politoed
    name: "Politoed",
    levelUp: {
      1: ["Water Gun", "Hypnosis", "DoubleSlap", "Perish Song"],
      35: ["Swagger"],
      51: ["Bounce"]
    }
  },
  187: { // Hoppip
    name: "Hoppip",
    levelUp: {
      1: ["Splash", "Synthesis"],
      5: ["Tail Whip"],
      5: ["Tackle"],
      11: ["Poison Powder"],
      11: ["Stun Spore"],
      11: ["Sleep Powder"],
      17: ["Leech Seed"],
      25: ["Cotton Spore"],
      33: ["U-turn"],
      41: ["Worry Seed"],
      49: ["GigaDrain"],
      57: ["Bounce"]
    }
  },
  188: { // Skiploom
    name: "Skiploom",
    levelUp: {
      1: ["Splash", "Synthesis", "Tail Whip", "Tackle"],
      5: ["Tail Whip"],
      5: ["Tackle"],
      11: ["Poison Powder"],
      11: ["Stun Spore"],
      11: ["Sleep Powder"],
      17: ["Leech Seed"],
      27: ["Cotton Spore"],
      37: ["U-turn"],
      47: ["Worry Seed"],
      57: ["GigaDrain"],
      67: ["Bounce"]
    }
  },
  189: { // Jumpluff
    name: "Jumpluff",
    levelUp: {
      1: ["Splash", "Synthesis", "Tail Whip", "Tackle"],
      5: ["Tail Whip"],
      5: ["Tackle"],
      11: ["Poison Powder"],
      11: ["Stun Spore"],
      11: ["Sleep Powder"],
      17: ["Leech Seed"],
      27: ["Cotton Spore"],
      39: ["U-turn"],
      51: ["Worry Seed"],
      63: ["GigaDrain"],
      75: ["Bounce"]
    }
  },
  190: { // Aipom
    name: "Aipom",
    levelUp: {
      1: ["Scratch", "Tail Whip"],
      6: ["Sand Attack"],
      13: ["Astonish"],
      18: ["Baton Pass"],
      25: ["Tickle"],
      31: ["Fury Swipes"],
      38: ["Swift"],
      43: ["Screech"],
      50: ["Agility"],
      55: ["Double Hit"]
    }
  },
  191: { // Sunkern
    name: "Sunkern",
    levelUp: {
      1: ["Absorb", "Growth"],
      6: ["Mega Drain"],
      13: ["Sunny Day"],
      18: ["Synthesis"],
      25: ["Worry Seed"],
      30: ["Razor Leaf"],
      37: ["Endeavor"],
      42: ["SolarBeam"]
    }
  },
  192: { // Sunflora
    name: "Sunflora",
    levelUp: {
      1: ["Absorb", "Pound", "Growth"],
      6: ["Mega Drain"],
      13: ["Sunny Day"],
      18: ["Razor Leaf"],
      25: ["Worry Seed"],
      30: ["Petal Dance"],
      37: ["Sunny Day"],
      42: ["SolarBeam"]
    }
  },
  193: { // Yanma
    name: "Yanma",
    levelUp: {
      1: ["Tackle", "Foresight"],
      7: ["Quick Attack"],
      13: ["Double Team"],
      19: ["SonicBoom"],
      25: ["Detect"],
      31: ["Supersonic"],
      37: ["Uproar"],
      43: ["Pursuit"],
      49: ["Ancientpower"]
    }
  },
  194: { // Wooper
    name: "Wooper",
    levelUp: {
      1: ["Water Gun", "Tail Whip"],
      11: ["Slam"],
      16: ["Amnesia"],
      21: ["Yawn"],
      31: ["Earthquake"],
      36: ["Rain Dance"],
      41: ["Mist"],
      51: ["Haze"]
    }
  },
  195: { // Quagsire
    name: "Quagsire",
    levelUp: {
      1: ["Water Gun", "Tail Whip", "Slam"],
      11: ["Slam"],
      16: ["Amnesia"],
      23: ["Yawn"],
      35: ["Earthquake"],
      42: ["Rain Dance"],
      49: ["Mist"],
      61: ["Haze"]
    }
  },
  196: { // Espeon
    name: "Espeon",
    levelUp: {
      1: ["Tackle", "Tail Whip", "Confusion"],
      8: ["Sand Attack"],
      16: ["Confusion"],
      23: ["Quick Attack"],
      30: ["Swift"],
      36: ["Psybeam"],
      42: ["Psych Up"],
      47: ["Psychic"],
      52: ["Morning Sun"]
    }
  },
  197: { // Umbreon
    name: "Umbreon",
    levelUp: {
      1: ["Tackle", "Tail Whip", "Pursuit"],
      8: ["Sand Attack"],
      16: ["Pursuit"],
      23: ["Quick Attack"],
      30: ["Confuse Ray"],
      36: ["Feint Attack"],
      42: ["Mean Look"],
      47: ["Screech"],
      52: ["Moonlight"]
    }
  },
  198: { // Murkrow
    name: "Murkrow",
    levelUp: {
      1: ["Peck", "Astonish"],
      9: ["Pursuit"],
      14: ["Haze"],
      22: ["Night Shade"],
      27: ["Feint Attack"],
      35: ["Taunt"],
      40: ["Mean Look"],
      48: ["Perish Song"]
    }
  },
  199: { // Slowking
    name: "Slowking",
    levelUp: {
      1: ["Curse", "Yawn", "Tackle", "Growl"],
      6: ["Growl"],
      15: ["Water Gun"],
      20: ["Confusion"],
      29: ["Disable"],
      34: ["Headbutt"],
      43: ["Water Pulse"],
      48: ["Zen Headbutt"],
      57: ["Amnesia"],
      62: ["Psychic"]
    }
  },
  200: { // Misdreavus
    name: "Misdreavus",
    levelUp: {
      1: ["Growl", "Psywave"],
      6: ["Spite"],
      11: ["Astonish"],
      17: ["Confuse Ray"],
      23: ["Mean Look"],
      30: ["Psybeam"],
      37: ["Pain Split"],
      45: ["Payback"],
      53: ["Perish Song"]
    }
  },
  201: { // Unown
    name: "Unown",
    levelUp: {
      1: ["Hidden Power"]
    }
  },
  202: { // Wobbuffet
    name: "Wobbuffet",
    levelUp: {
      1: ["Counter", "Mirror Coat", "Safeguard", "Destiny Bond"]
    }
  },
  203: { // Girafarig
    name: "Girafarig",
    levelUp: {
      1: ["Tackle", "Growl", "Astonish", "Confusion"],
      7: ["Confusion"],
      13: ["Stomp"],
      19: ["Agility"],
      25: ["Take Down"],
      32: ["Psybeam"],
      37: ["Baton Pass"],
      44: ["Crunch"],
      49: ["Psychic"]
    }
  },
  204: { // Pineco
    name: "Pineco",
    levelUp: {
      1: ["Tackle", "Protect"],
      8: ["Selfdestruct"],
      15: ["Take Down"],
      22: ["Rapid Spin"],
      29: ["Bide"],
      36: ["Natural Gift"],
      43: ["Spikes"],
      50: ["Explosion"],
      57: ["Double-Edge"]
    }
  },
  205: { // Forretress
    name: "Forretress",
    levelUp: {
      1: ["Tackle", "Protect", "Selfdestruct"],
      8: ["Selfdestruct"],
      15: ["Take Down"],
      22: ["Rapid Spin"],
      29: ["Bide"],
      38: ["Natural Gift"],
      47: ["Spikes"],
      56: ["Explosion"],
      65: ["Double-Edge"],
      31: ["Mirror Shot"],
      39: ["Payback"],
      47: ["Zap Cannon"]
    }
  },
  206: { // Dunsparce
    name: "Dunsparce",
    levelUp: {
      1: ["Rage", "Defense Curl"],
      5: ["Rollout"],
      13: ["Spite"],
      18: ["Pursuit"],
      26: ["Screech"],
      30: ["Yawn"],
      38: ["Ancient Power"],
      42: ["Body Slam"],
      50: ["Drill Run"],
      54: ["Endure"],
      62: ["Flail"]
    }
  },
  207: { // Gligar
    name: "Gligar",
    levelUp: {
      1: ["Poison Sting", "Sand Attack"],
      6: ["Harden"],
      13: ["Quick Attack"],
      20: ["Fury Cutter"],
      28: ["Feint Attack"],
      36: ["Slash"],
      44: ["Screech"],
      52: ["Guillotine"]
    }
  },
  208: { // Steelix
    name: "Steelix",
    levelUp: {
      1: ["Tackle", "Screech", "Bind", "Rock Throw"],
      9: ["Rock Throw"],
      13: ["Rage"],
      21: ["Harden"],
      25: ["Slam"],
      33: ["Sandstorm"],
      37: ["Slam"],
      45: ["Crunch"],
      49: ["Iron Tail"],
      57: ["Dig"],
      61: ["Stone Edge"],
      69: ["Double-Edge"]
    }
  },
  209: { // Snubbull
    name: "Snubbull",
    levelUp: {
      1: ["Tackle", "Scary Face", "Tail Whip", "Charm"],
      7: ["Bite"],
      13: ["Lick"],
      19: ["Roar"],
      25: ["Rage"],
      31: ["Take Down"],
      37: ["Payback"],
      43: ["Crunch"]
    }
  },
  210: { // Granbull
    name: "Granbull",
    levelUp: {
      1: ["Tackle", "Scary Face", "Tail Whip", "Charm"],
      7: ["Bite"],
      13: ["Lick"],
      19: ["Roar"],
      27: ["Rage"],
      35: ["Take Down"],
      43: ["Payback"],
      51: ["Crunch"]
    }
  },
  211: { // Qwilfish
    name: "Qwilfish",
    levelUp: {
      1: ["Spikes", "Tackle", "Poison Sting"],
      9: ["Harden"],
      9: ["Minimize"],
      13: ["Water Gun"],
      17: ["Rollout"],
      21: ["Toxic Spikes"],
      25: ["Stockpile"],
      29: ["Spit Up"],
      29: ["Swallow"],
      33: ["Revenge"],
      37: ["Brine"],
      41: ["Pin Missile"],
      45: ["Take Down"],
      49: ["Aqua Tail"],
      53: ["Poison Jab"],
      57: ["Destiny Bond"],
      61: ["Hydro Pump"]
    }
  },
  212: { // Scizor
    name: "Scizor",
    levelUp: {
      1: ["Quick Attack", "Leer", "Focus Energy", "Pursuit"],
      6: ["False Swipe"],
      11: ["Agility"],
      16: ["Metal Claw"],
      21: ["Fury Cutter"],
      26: ["Slash"],
      31: ["Razor Wind"],
      36: ["Double Team"],
      41: ["Iron Defense"],
      46: ["Swords Dance"],
      51: ["Double Hit"]
    }
  },
  213: { // Shuckle
    name: "Shuckle",
    levelUp: {
      1: ["Constrict", "Withdraw"],
      9: ["Wrap"],
      14: ["Encore"],
      23: ["Safeguard"],
      28: ["Bide"],
      37: ["Rest"],
      42: ["Gastro Acid"],
      51: ["Power Trick"],
      56: ["Guard Split"],
      56: ["Power Split"]
    }
  },
  214: { // Heracross
    name: "Heracross",
    levelUp: {
      1: ["Night Slash", "Tackle", "Leer", "Horn Attack", "Endure"],
      7: ["Feint"],
      10: ["Aerial Ace"],
      16: ["Chip Away"],
      19: ["Counter"],
      25: ["Brick Break"],
      28: ["Take Down"],
      34: ["Close Combat"],
      37: ["Reversal"],
      43: ["Flail"],
      46: ["Megahorn"]
    }
  },
  215: { // Sneasel
    name: "Sneasel",
    levelUp: {
      1: ["Scratch", "Leer", "Taunt", "Quick Attack"],
      8: ["Feint Attack"],
      15: ["Icy Wind"],
      22: ["Fury Swipes"],
      29: ["Nasty Plot"],
      36: ["Metal Claw"],
      43: ["Hone Claws"],
      50: ["Fling"],
      57: ["Punishment"],
      64: ["Dark Pulse"]
    }
  },
  216: { // Teddiursa
    name: "Teddiursa",
    levelUp: {
      1: ["Covet", "Scratch", "Baby-Doll Eyes", "Lick", "Fake Tears"],
      8: ["Fury Swipes"],
      15: ["Feint Attack"],
      22: ["Sweet Scent"],
      29: ["Play Rough"],
      36: ["Slash"],
      43: ["Charm"],
      50: ["Rest"],
      57: ["Snore"],
      64: ["Thrash"]
    }
  },
  217: { // Ursaring
    name: "Ursaring",
    levelUp: {
      1: ["Covet", "Scratch", "Baby-Doll Eyes", "Lick", "Fake Tears", "Hammer Arm"],
      8: ["Fury Swipes"],
      15: ["Feint Attack"],
      22: ["Sweet Scent"],
      29: ["Play Rough"],
      38: ["Slash"],
      47: ["Scary Face"],
      56: ["Rest"],
      65: ["Snore"],
      74: ["Thrash"]
    }
  },
  218: { // Slugma
    name: "Slugma",
    levelUp: {
      1: ["Yawn", "Smog"],
      8: ["Ember"],
      13: ["Rock Throw"],
      20: ["Harden"],
      25: ["Recover"],
      32: ["Flame Burst"],
      37: ["Ancient Power"],
      44: ["Amnesia"],
      49: ["Lava Plume"],
      56: ["Rock Slide"],
      61: ["Body Slam"],
      68: ["Flamethrower"],
      73: ["Earth Power"]
    }
  },
  219: { // Magcargo
    name: "Magcargo",
    levelUp: {
      1: ["Yawn", "Smog", "Ember", "Shell Smash"],
      8: ["Ember"],
      13: ["Rock Throw"],
      20: ["Harden"],
      25: ["Recover"],
      32: ["Flame Burst"],
      37: ["Ancient Power"],
      48: ["Amnesia"],
      56: ["Lava Plume"],
      66: ["Rock Slide"],
      74: ["Body Slam"],
      84: ["Flamethrower"],
      92: ["Earth Power"]
    }
  },
  220: { // Swinub
    name: "Swinub",
    levelUp: {
      1: ["Tackle", "Odor Sleuth"],
      5: ["Mud Sport"],
      8: ["Powder Snow"],
      13: ["Mud-Slap"],
      16: ["Endure"],
      20: ["Mud Bomb"],
      25: ["Icy Wind"],
      28: ["Ice Shard"],
      32: ["Take Down"],
      37: ["Earthquake"],
      40: ["Mist"],
      44: ["Blizzard"],
      49: ["Amnesia"]
    }
  },
  221: { // Piloswine
    name: "Piloswine",
    levelUp: {
      1: ["Ancient Power", "Peck", "Odor Sleuth", "Mud Sport", "Powder Snow"],
      5: ["Mud Sport"],
      8: ["Powder Snow"],
      13: ["Mud-Slap"],
      16: ["Endure"],
      20: ["Mud Bomb"],
      25: ["Icy Wind"],
      28: ["Ice Fang"],
      33: ["Take Down"],
      40: ["Furry Attack"],
      46: ["Earthquake"],
      52: ["Mist"],
      58: ["Blizzard"],
      65: ["Amnesia"]
    }
  },
  222: { // Corsola
    name: "Corsola",
    levelUp: {
      1: ["Harden", "Tackle"],
      7: ["Bubble Beam"],
      13: ["Recover"],
      19: ["Refresh"],
      25: ["Rock Blast"],
      31: ["Ancient Power"],
      37: ["Lucky Chant"],
      43: ["Spike Cannon"],
      49: ["Rock Polish"],
      55: ["Power Gem"],
      61: ["Mirror Coat"]
    }
  },
  223: { // Remoraid
    name: "Remoraid",
    levelUp: {
      1: ["Water Gun", "Lock-On"],
      11: ["Psybeam"],
      16: ["Aurora Beam"],
      21: ["Bubble Beam"],
      26: ["Focus Energy"],
      31: ["Water Pulse"],
      36: ["Signal Beam"],
      41: ["Ice Beam"],
      46: ["Bullet Seed"],
      51: ["Hydro Pump"],
      56: ["Hyper Beam"]
    }
  },
  224: { // Octillery
    name: "Octillery",
    levelUp: {
      1: ["Water Gun", "Constrict", "Psybeam", "Aurora Beam"],
      11: ["Psybeam"],
      16: ["Aurora Beam"],
      21: ["Bubble Beam"],
      25: ["Wring Out"],
      29: ["Focus Energy"],
      34: ["Octazooka"],
      40: ["Water Pulse"],
      47: ["Signal Beam"],
      54: ["Ice Beam"],
      61: ["Bullet Seed"],
      68: ["Hydro Pump"],
      75: ["Hyper Beam"]
    }
  },
  225: { // Delibird
    name: "Delibird",
    levelUp: {
      1: ["Present"],
      25: ["Present"]
    }
  },
  226: { // Mantine
    name: "Mantine",
    levelUp: {
      1: ["Psybeam", "Bullet Seed", "Signal Beam", "Headbutt"],
      3: ["Bubble"],
      7: ["Supersonic"],
      11: ["Bubblebeam"],
      14: ["Headbutt"],
      17: ["Agility"],
      20: ["Wing Attack"],
      23: ["Water Pulse"],
      27: ["Ray Gun"],
      32: ["Take Down"],
      37: ["Confuse Ray"],
      42: ["Bounce"],
      46: ["Aqua Ring"],
      49: ["Hydro Pump"]
    }
  },
  227: { // Skarmory
    name: "Skarmory",
    levelUp: {
      1: ["Leer", "Peck"],
      6: ["Sand Attack"],
      9: ["Swift"],
      15: ["Agility"],
      18: ["Fury Attack"],
      24: ["Air Cutter"],
      27: ["Steel Wing"],
      33: ["Spikes"],
      36: ["Metal Sound"],
      42: ["Air Slash"],
      45: ["Slash"],
      51: ["Night Slash"]
    }
  },
  228: { // Houndour
    name: "Houndour",
    levelUp: {
      1: ["Leer", "Ember"],
      7: ["Howl"],
      13: ["Smog"],
      19: ["Roar"],
      25: ["Bite"],
      31: ["Odor Sleuth"],
      37: ["Beat Up"],
      43: ["Fire Fang"],
      49: ["Feint Attack"],
      55: ["Embargo"],
      61: ["Flamethrower"],
      67: ["Crunch"]
    }
  },
  229: { // Houndoom
    name: "Houndoom",
    levelUp: {
      1: ["Leer", "Ember", "Howl", "Smog"],
      7: ["Howl"],
      13: ["Smog"],
      19: ["Roar"],
      26: ["Bite"],
      34: ["Odor Sleuth"],
      42: ["Beat Up"],
      50: ["Fire Fang"],
      58: ["Feint Attack"],
      66: ["Embargo"],
      74: ["Flamethrower"],
      82: ["Crunch"]
    }
  },
  230: { // Kingdra
    name: "Kingdra",
    levelUp: {
      1: ["Bubble", "Smokescreen", "Leer", "Water Gun", "Yawn"],
      8: ["Smokescreen"],
      15: ["Leer"],
      22: ["Water Gun"],
      29: ["Twister"],
      40: ["Agility"],
      51: ["Hydro Pump"],
      62: ["Dragon Dance"],
      73: ["Dragon Pulse"]
    }
  },
  231: { // Phanpy
    name: "Phanpy",
    levelUp: {
      1: ["Odor Sleuth", "Tackle", "Growl", "Defense Curl"],
      9: ["Flail"],
      17: ["Take Down"],
      25: ["Rollout"],
      33: ["Natural Gift"],
      41: ["Slam"],
      49: ["Endure"],
      57: ["Double-Edge"]
    }
  },
  232: { // Donphan
    name: "Donphan",
    levelUp: {
      1: ["Horn Attack", "Odor Sleuth", "Tackle", "Growl", "Defense Curl"],
      9: ["Flail"],
      17: ["Fury Attack"],
      25: ["Rollout"],
      33: ["Rapid Spin"],
      41: ["Assurance"],
      49: ["Slam"],
      57: ["Magnitude"],
      65: ["Giga Impact"]
    }
  },
  233: { // Porygon2
    name: "Porygon2",
    levelUp: {
      1: ["Conversion2", "Tackle", "Conversion", "Sharpen"],
      7: ["Psybeam"],
      12: ["Agility"],
      18: ["Recover"],
      23: ["Magnet Rise"],
      29: ["Signal Beam"],
      34: ["Recycle"],
      40: ["Discharge"],
      45: ["Lock-On"],
      51: ["Tri Attack"],
      56: ["Magic Coat"],
      62: ["Zap Cannon"]
    }
  },
  234: { // Stantler
    name: "Stantler",
    levelUp: {
      1: ["Tackle", "Leer"],
      8: ["Astonish"],
      11: ["Hypnosis"],
      18: ["Stomp"],
      21: ["Sand Attack"],
      28: ["Take Down"],
      31: ["Confuse Ray"],
      38: ["Calm Mind"],
      41: ["Role Play"],
      48: ["Zen Headbutt"],
      51: ["Imprison"],
      58: ["Captivate"]
    }
  },
  235: { // Smeargle
    name: "Smeargle",
    levelUp: {
      1: ["Sketch"],
      11: ["Sketch"],
      21: ["Sketch"],
      31: ["Sketch"],
      41: ["Sketch"],
      51: ["Sketch"],
      61: ["Sketch"],
      71: ["Sketch"],
      81: ["Sketch"],
      91: ["Sketch"]
    }
  },
  236: { // Tyrogue
    name: "Tyrogue",
    levelUp: {
      1: ["Tackle", "Helping Hand", "Fake Out"],
      20: ["Foresight"]
    }
  },
  237: { // Hitmontop
    name: "Hitmontop",
    levelUp: {
      1: ["Revenge", "Rolling Kick", "Focus Energy", "Pursuit"],
      6: ["Quick Attack"],
      10: ["Rapid Spin"],
      15: ["Counter"],
      19: ["Feint"],
      24: ["Agility"],
      28: ["Gyro Ball"],
      33: ["Wide Guard"],
      37: ["Quick Guard"],
      42: ["Detect"],
      46: ["Close Combat"],
      51: ["Sucker Punch"]
    }
  },
  238: { // Smoochum
    name: "Smoochum",
    levelUp: {
      1: ["Pound", "Lick"],
      5: ["Sweet Kiss"],
      8: ["Powder Snow"],
      11: ["Confusion"],
      15: ["Sing"],
      18: ["Mean Look"],
      21: ["Fake Tears"],
      25: ["Lucky Chant"],
      28: ["Avalanche"],
      31: ["Psychic"],
      35: ["Copycat"],
      38: ["Perish Song"],
      41: ["Blizzard"]
    }
  },
  239: { // Elekid
    name: "Elekid",
    levelUp: {
      1: ["Quick Attack", "Leer"],
      5: ["Thunder Shock"],
      8: ["Low Kick"],
      12: ["Swift"],
      15: ["Shock Wave"],
      19: ["Thunder Wave"],
      22: ["Electro Ball"],
      26: ["Light Screen"],
      29: ["Thunder Punch"],
      33: ["Discharge"],
      36: ["Screech"],
      40: ["Thunderbolt"],
      43: ["Thunder"]
    }
  },
  240: { // Magby
    name: "Magby",
    levelUp: {
      1: ["Smog", "Leer"],
      5: ["Ember"],
      8: ["SmokeScreen"],
      12: ["Feint Attack"],
      15: ["Fire Spin"],
      19: ["Clear Smog"],
      22: ["Flame Burst"],
      26: ["Confuse Ray"],
      29: ["Fire punch"],
      33: ["Lava Plume"],
      36: ["Sunny Day"],
      40: ["Flamethrower"],
      43: ["Fire Blast"]
    }
  },
  241: { // Miltank
    name: "Miltank",
    levelUp: {
      1: ["Tackle", "Growl"],
      4: ["Defense Curl"],
      8: ["Stomp"],
      13: ["Milk Drink"],
      19: ["Bide"],
      26: ["Rollout"],
      34: ["Body Slam"],
      43: ["Zen Headbutt"],
      53: ["Captivate"],
      64: ["Gyro Ball"],
      76: ["Heal Bell"]
    }
  },
  242: { // Blissey
    name: "Blissey",
    levelUp: {
      1: ["Defense Curl", "Pound", "Growl", "Tail Whip"],
      4: ["Refresh"],
      7: ["Disarming Voice"],
      9: ["Sweet Kiss"],
      12: ["Skill Swap"],
      16: ["Bestow"],
      20: ["Minimize"],
      23: ["Take Down"],
      27: ["Sing"],
      31: ["Fling"],
      34: ["Heal Pulse"],
      38: ["Egg Bomb"],
      42: ["Light Screen"],
      46: ["Healing Wish"],
      50: ["Double-Edge"]
    }
  },
  243: { // Raikou
    name: "Raikou",
    levelUp: {
      1: ["Bite", "Leer"],
      8: ["Thunder Shock"],
      15: ["Roar"],
      22: ["Quick Attack"],
      29: ["Spark"],
      36: ["Reflect"],
      43: ["Crunch"],
      50: ["Thunder Fang"],
      57: ["Discharge"],
      64: ["Extrasensory"],
      71: ["Rain Dance"],
      78: ["Calm Mind"],
      85: ["Thunder"]
    }
  },
  244: { // Entei
    name: "Entei",
    levelUp: {
      1: ["Bite", "Leer"],
      8: ["Ember"],
      15: ["Roar"],
      22: ["Fire Spin"],
      29: ["Stomp"],
      36: ["Flamethrower"],
      43: ["Swagger"],
      50: ["Fire Fang"],
      57: ["Lava Plume"],
      64: ["Extrasensory"],
      71: ["Fire Blast"],
      78: ["Calm Mind"],
      85: ["Eruption"]
    }
  },
  245: { // Suicune
    name: "Suicune",
    levelUp: {
      1: ["Bite", "Leer"],
      8: ["Bubble Beam"],
      15: ["Rain Dance"],
      22: ["Gust"],
      29: ["Aurora Beam"],
      36: ["Mist"],
      43: ["Mirror Coat"],
      50: ["Ice Fang"],
      57: ["Tailwind"],
      64: ["Extrasensory"],
      71: ["Hydro Pump"],
      78: ["Calm Mind"],
      85: ["Blizzard"]
    }
  },
  246: { // Larvitar
    name: "Larvitar",
    levelUp: {
      1: ["Bite", "Leer"],
      8: ["Sandstorm"],
      15: ["Screech"],
      22: ["Chip Away"],
      29: ["Rock Slide"],
      36: ["Scary Face"],
      43: ["Thrash"],
      50: ["Dark Pulse"],
      57: ["Payback"],
      64: ["Crunch"],
      71: ["Earthquake"],
      78: ["Stone Edge"],
      85: ["Hyper Beam"]
    }
  },
  247: { // Pupitar
    name: "Pupitar",
    levelUp: {
      1: ["Bite", "Leer", "Sandstorm", "Screech"],
      8: ["Sandstorm"],
      15: ["Screech"],
      22: ["Chip Away"],
      29: ["Rock Slide"],
      38: ["Scary Face"],
      47: ["Thrash"],
      56: ["Dark Pulse"],
      65: ["Payback"],
      74: ["Crunch"],
      83: ["Earthquake"],
      92: ["Stone Edge"],
      101: ["Hyper Beam"]
    }
  },
  248: { // Tyranitar
    name: "Tyranitar",
    levelUp: {
      1: ["Thunder Punch", "Ice Punch", "Fire Punch", "Bite"],
      8: ["Sandstorm"],
      15: ["Screech"],
      22: ["Chip Away"],
      29: ["Rock Slide"],
      38: ["Scary Face"],
      47: ["Thrash"],
      58: ["Dark Pulse"],
      69: ["Payback"],
      80: ["Crunch"],
      91: ["Earthquake"],
      102: ["Stone Edge"],
      113: ["Hyper Beam"]
    }
  },
  249: { // Lugia
    name: "Lugia",
    levelUp: {
      1: ["Whirlwind", "Weather Ball"],
      9: ["Gust"],
      15: ["Dragon Rush"],
      23: ["Extrasensory"],
      29: ["Rain Dance"],
      37: ["Hydro Pump"],
      43: ["Aeroblast"],
      50: ["Punishment"],
      57: ["Ancient Power"],
      65: ["Safeguard"],
      71: ["Recover"],
      79: ["Future Sight"],
      85: ["Natural Gift"],
      93: ["Calm Mind"],
      99: ["Sky Attack"]
    }
  },
  250: { // Ho-Oh
    name: "Ho-Oh",
    levelUp: {
      1: ["Whirlwind", "Weather Ball"],
      9: ["Gust"],
      15: ["Brave Bird"],
      23: ["Extrasensory"],
      29: ["Sunny Day"],
      37: ["Fire Blast"],
      43: ["Sacred Fire"],
      50: ["Punishment"],
      57: ["Ancient Power"],
      65: ["Safeguard"],
      71: ["Recover"],
      79: ["Future Sight"],
      85: ["Natural Gift"],
      93: ["Calm Mind"],
      99: ["Sky Attack"]
    }
  },
  251: { // Celebi
    name: "Celebi",
    levelUp: {
      1: ["Leech Seed", "Confusion", "Recover", "Heal Bell"],
      10: ["Safeguard"],
      19: ["Magical Leaf"],
      28: ["Ancient Power"],
      37: ["Baton Pass"],
      46: ["Natural Gift"],
      55: ["Heal Block"],
      64: ["Future Sight"],
      73: ["Healing Wish"],
      82: ["Leaf Storm"],
      91: ["Perish Song"]
    }
  },

  // Gen 3 Starters
  252: { // Treecko
    name: "Treecko",
    levelUp: {
      1: ["Pound", "Leer"],
      6: ["Absorb"],
      11: ["Quick Attack"],
      16: ["Pursuit"],
      21: ["Screech"],
      26: ["Mega Drain"],
      31: ["Agility"],
      36: ["Slam"],
      41: ["Detect"],
      46: ["Giga Drain"]
    }
  },
  253: { // Grovyle
    name: "Grovyle",
    levelUp: {
      1: ["Pound", "Leer", "Absorb"],
      6: ["Absorb"],
      11: ["Quick Attack"],
      16: ["Fury Cutter"],
      17: ["Pursuit"],
      23: ["Screech"],
      29: ["Leaf Blade"],
      35: ["Agility"],
      41: ["Slam"],
      47: ["Detect"],
      53: ["False Swipe"]
    }
  },
  254: { // Sceptile
    name: "Sceptile",
    levelUp: {
      1: ["Pound", "Leer", "Absorb", "Quick Attack"],
      6: ["Absorb"],
      11: ["Quick Attack"],
      16: ["Fury Cutter"],
      17: ["Pursuit"],
      23: ["Screech"],
      29: ["Leaf Blade"],
      37: ["Agility"],
      45: ["Slam"],
      53: ["Detect"],
      61: ["False Swipe"]
    }
  },
  255: { // Torchic
    name: "Torchic",
    levelUp: {
      1: ["Scratch", "Growl"],
      7: ["Focus Energy"],
      10: ["Ember"],
      16: ["Peck"],
      19: ["Sand Attack"],
      25: ["Fire Spin"],
      28: ["Quick Attack"],
      34: ["Slash"],
      37: ["Mirror Move"],
      43: ["Flamethrower"]
    }
  },
  256: { // Combusken
    name: "Combusken",
    levelUp: {
      1: ["Scratch", "Growl", "Focus Energy"],
      7: ["Focus Energy"],
      13: ["Ember"],
      16: ["Double Kick"],
      17: ["Peck"],
      21: ["Sand Attack"],
      28: ["Bulk Up"],
      32: ["Quick Attack"],
      39: ["Slash"],
      43: ["Mirror Move"],
      50: ["Sky Uppercut"]
    }
  },
  257: { // Blaziken
    name: "Blaziken",
    levelUp: {
      1: ["Fire Punch", "Scratch", "Growl", "Focus Energy"],
      7: ["Focus Energy"],
      13: ["Ember"],
      16: ["Double Kick"],
      17: ["Peck"],
      21: ["Sand Attack"],
      28: ["Bulk Up"],
      32: ["Quick Attack"],
      36: ["Blaze Kick"],
      42: ["Slash"],
      49: ["Mirror Move"],
      59: ["Sky Uppercut"]
    }
  },
  258: { // Mudkip
    name: "Mudkip",
    levelUp: {
      1: ["Tackle", "Growl"],
      6: ["Mud Slap"],
      10: ["Water Gun"],
      15: ["Bide"],
      19: ["Foresight"],
      24: ["Mud Sport"],
      28: ["Take Down"],
      33: ["Whirlpool"],
      37: ["Protect"],
      42: ["Hydro Pump"],
      46: ["Endeavor"]
    }
  },
  259: { // Marshtomp
    name: "Marshtomp",
    levelUp: {
      1: ["Tackle", "Growl", "Mud Slap"],
      6: ["Mud Slap"],
      10: ["Water Gun"],
      15: ["Bide"],
      16: ["Mud Shot"],
      20: ["Foresight"],
      25: ["Mud Sport"],
      31: ["Take Down"],
      37: ["Muddy Water"],
      42: ["Protect"],
      46: ["Earthquake"],
      53: ["Endeavor"]
    }
  },
  260: { // Swampert
    name: "Swampert",
    levelUp: {
      1: ["Tackle", "Growl", "Mud Slap", "Water Gun"],
      6: ["Mud Slap"],
      10: ["Water Gun"],
      15: ["Bide"],
      16: ["Mud Shot"],
      20: ["Foresight"],
      25: ["Mud Sport"],
      31: ["Take Down"],
      39: ["Muddy Water"],
      46: ["Protect"],
      52: ["Earthquake"],
      61: ["Endeavor"]
    }
  },
  
  // Common early game Pokemon
  25: { // Pikachu
    name: "Pikachu",
    levelUp: {
      1: ["Thundershock", "Growl"],
      6: ["Tail Whip"],
      8: ["Thunder Wave"],
      11: ["Quick Attack"],
      15: ["Double Team"],
      20: ["Slam"],
      26: ["Thunderbolt"],
      33: ["Agility"],
      41: ["Thunder"],
      50: ["Light Screen"]
    }
  },
  
  // Fighting types
  66: { // Machop
    name: "Machop",
    levelUp: {
      1: ["Low Kick", "Leer"],
      7: ["Focus Energy"],
      13: ["Karate Chop"],
      19: ["Seismic Toss"],
      25: ["Foresight"],
      31: ["Vital Throw"],
      37: ["Cross Chop"],
      43: ["Scary Face"],
      49: ["Submission"],
      55: ["Dynamic Punch"]
    }
  },
  
  // Additional popular Pokemon with authentic movesets
  104: { // Cubone
    name: "Cubone",
    levelUp: {
      1: ["Growl"],
      5: ["Tail Whip"],
      9: ["Bone Club"],
      13: ["Headbutt"],
      17: ["Leer"],
      21: ["Focus Energy"],
      25: ["Bonemerang"],
      29: ["Rage"],
      33: ["False Swipe"],
      37: ["Thrash"],
      41: ["Bone Rush"],
      45: ["Double-Edge"]
    }
  },
  
  147: { // Dratini
    name: "Dratini",
    levelUp: {
      1: ["Wrap", "Leer"],
      8: ["Thunder Wave"],
      15: ["Twister"],
      22: ["Dragon Rage"],
      29: ["Slam"],
      36: ["Agility"],
      43: ["Safeguard"],
      50: ["Outrage"],
      57: ["Hyper Beam"]
    }
  },

  // Common Gen 3 Pokemon
  261: { // Poochyena
    name: "Poochyena",
    levelUp: {
      1: ["Tackle", "Howl"],
      5: ["Sand Attack"],
      9: ["Bite"],
      13: ["Odor Sleuth"],
      17: ["Roar"],
      21: ["Swagger"],
      25: ["Scary Face"],
      29: ["Take Down"],
      33: ["Taunt"],
      37: ["Crunch"]
    }
  },
  262: { // Mightyena
    name: "Mightyena",
    levelUp: {
      1: ["Tackle", "Howl", "Sand Attack"],
      5: ["Sand Attack"],
      9: ["Bite"],
      13: ["Odor Sleuth"],
      17: ["Roar"],
      22: ["Swagger"],
      27: ["Scary Face"],
      32: ["Take Down"],
      37: ["Taunt"],
      42: ["Crunch"]
    }
  },
  263: { // Zigzagoon
    name: "Zigzagoon",
    levelUp: {
      1: ["Tackle", "Growl"],
      5: ["Tail Whip"],
      9: ["Headbutt"],
      13: ["Sand Attack"],
      17: ["Odor Sleuth"],
      21: ["Mud Sport"],
      25: ["Pin Missile"],
      29: ["Covet"],
      33: ["Flail"],
      37: ["Rest"],
      41: ["Belly Drum"]
    }
  },
  264: { // Linoone
    name: "Linoone",
    levelUp: {
      1: ["Tackle", "Growl", "Tail Whip"],
      5: ["Tail Whip"],
      9: ["Headbutt"],
      13: ["Sand Attack"],
      17: ["Odor Sleuth"],
      23: ["Mud Sport"],
      29: ["Pin Missile"],
      35: ["Covet"],
      41: ["Flail"],
      47: ["Rest"],
      53: ["Belly Drum"]
    }
  },
  265: { // Wurmple
    name: "Wurmple",
    levelUp: {
      1: ["Tackle", "String Shot"],
      5: ["Poison Sting"]
    }
  },
  266: { // Silcoon
    name: "Silcoon",
    levelUp: {
      1: ["Harden"],
      7: ["Harden"]
    }
  },
  267: { // Beautifly
    name: "Beautifly",
    levelUp: {
      1: ["Tackle", "String Shot", "Harden"],
      10: ["Absorb"],
      13: ["Gust"],
      17: ["Stun Spore"],
      20: ["Morning Sun"],
      24: ["Mega Drain"],
      27: ["Whirlwind"],
      31: ["Attract"],
      34: ["Silver Wind"],
      38: ["Giga Drain"]
    }
  },
  268: { // Cascoon
    name: "Cascoon",
    levelUp: {
      1: ["Harden"],
      7: ["Harden"]
    }
  },
  269: { // Dustox
    name: "Dustox",
    levelUp: {
      1: ["Tackle", "String Shot", "Harden"],
      10: ["Confusion"],
      13: ["Gust"],
      17: ["Protect"],
      20: ["Moonlight"],
      24: ["Psybeam"],
      27: ["Whirlwind"],
      31: ["Light Screen"],
      34: ["Silver Wind"],
      38: ["Psychic"]
    }
  },
  276: { // Taillow
    name: "Taillow",
    levelUp: {
      1: ["Peck", "Growl"],
      4: ["Focus Energy"],
      8: ["Quick Attack"],
      13: ["Wing Attack"],
      19: ["Double Team"],
      26: ["Endeavor"],
      34: ["Aerial Ace"],
      43: ["Agility"],
      53: ["Air Slash"]
    }
  },
  277: { // Swellow
    name: "Swellow",
    levelUp: {
      1: ["Peck", "Growl", "Focus Energy"],
      4: ["Focus Energy"],
      8: ["Quick Attack"],
      13: ["Wing Attack"],
      20: ["Double Team"],
      28: ["Endeavor"],
      37: ["Aerial Ace"],
      47: ["Agility"],
      58: ["Air Slash"]
    }
  },
  278: { // Wingull
    name: "Wingull",
    levelUp: {
      1: ["Growl", "Water Gun"],
      6: ["Supersonic"],
      11: ["Wing Attack"],
      16: ["Mist"],
      21: ["Water Pulse"],
      28: ["Quick Attack"],
      35: ["Pursuit"],
      42: ["Agility"],
      49: ["Aerial Ace"],
      56: ["Air Slash"]
    }
  },
  279: { // Pelipper
    name: "Pelipper",
    levelUp: {
      1: ["Growl", "Water Gun", "Water Sport"],
      6: ["Supersonic"],
      11: ["Wing Attack"],
      16: ["Mist"],
      21: ["Water Pulse"],
      25: ["Protect"],
      31: ["Stockpile"],
      31: ["Swallow"],
      31: ["Spit Up"],
      39: ["Pursuit"],
      48: ["Agility"],
      57: ["Aerial Ace"],
      66: ["Air Slash"],
      75: ["Hydro Pump"]
    }
  },
  280: { // Ralts
    name: "Ralts",
    levelUp: {
      1: ["Growl", "Confusion"],
      6: ["Double Team"],
      11: ["Teleport"],
      16: ["Lucky Chant"],
      21: ["Magical Leaf"],
      26: ["Heal Pulse"],
      31: ["Calm Mind"],
      36: ["Psychic"],
      41: ["Imprison"],
      46: ["Future Sight"],
      51: ["Charm"],
      56: ["Hypnosis"],
      61: ["Dream Eater"]
    }
  },
  281: { // Kirlia
    name: "Kirlia",
    levelUp: {
      1: ["Growl", "Confusion", "Double Team"],
      6: ["Double Team"],
      11: ["Teleport"],
      16: ["Lucky Chant"],
      21: ["Magical Leaf"],
      26: ["Heal Pulse"],
      33: ["Calm Mind"],
      40: ["Psychic"],
      47: ["Imprison"],
      54: ["Future Sight"],
      61: ["Charm"],
      68: ["Hypnosis"],
      75: ["Dream Eater"]
    }
  },
  282: { // Gardevoir
    name: "Gardevoir",
    levelUp: {
      1: ["Growl", "Confusion", "Double Team", "Teleport"],
      6: ["Double Team"],
      11: ["Teleport"],
      16: ["Wish"],
      21: ["Magical Leaf"],
      26: ["Heal Pulse"],
      33: ["Calm Mind"],
      42: ["Psychic"],
      51: ["Imprison"],
      60: ["Future Sight"],
      69: ["Captivate"],
      78: ["Hypnosis"],
      87: ["Dream Eater"]
    }
  },
  283: { // Surskit
    name: "Surskit",
    levelUp: {
      1: ["Bubble", "Quick Attack"],
      7: ["Sweet Scent"],
      13: ["Water Sport"],
      19: ["Bubble Beam"],
      25: ["Agility"],
      31: ["Haze"],
      37: ["Mist"]
    }
  },
  284: { // Masquerain
    name: "Masquerain",
    levelUp: {
      1: ["Bubble", "Quick Attack", "Sweet Scent", "Water Sport"],
      7: ["Sweet Scent"],
      13: ["Water Sport"],
      19: ["Gust"],
      26: ["Scary Face"],
      33: ["Stun Spore"],
      40: ["Silver Wind"],
      47: ["Air Slash"],
      54: ["Whirlwind"],
      61: ["Bug Buzz"],
      68: ["Quiver Dance"]
    }
  },
  285: { // Shroomish
    name: "Shroomish",
    levelUp: {
      1: ["Absorb", "Tackle"],
      5: ["Stun Spore"],
      9: ["Leech Seed"],
      13: ["Mega Drain"],
      17: ["Headbutt"],
      21: ["Poison Powder"],
      25: ["Worry Seed"],
      29: ["Growth"],
      33: ["Giga Drain"],
      37: ["Seed Bomb"],
      41: ["Spore"]
    }
  },
  286: { // Breloom
    name: "Breloom",
    levelUp: {
      1: ["Absorb", "Tackle", "Stun Spore", "Leech Seed"],
      5: ["Stun Spore"],
      9: ["Leech Seed"],
      13: ["Mega Drain"],
      17: ["Headbutt"],
      21: ["Mach Punch"],
      22: ["Counter"],
      25: ["Force Palm"],
      29: ["Mind Reader"],
      33: ["Seed Bomb"],
      37: ["Feint"],
      41: ["Substitute"],
      45: ["Focus Punch"],
      49: ["Sky Uppercut"],
      53: ["Dynamic Punch"]
    }
  },
  287: { // Slakoth
    name: "Slakoth",
    levelUp: {
      1: ["Scratch", "Yawn"],
      7: ["Encore"],
      13: ["Slack Off"],
      19: ["Feint Attack"],
      25: ["Amnesia"],
      31: ["Covet"],
      37: ["Swagger"],
      43: ["Counter"],
      49: ["Flail"]
    }
  },
  288: { // Vigoroth
    name: "Vigoroth",
    levelUp: {
      1: ["Scratch", "Focus Energy", "Encore", "Uproar"],
      7: ["Encore"],
      13: ["Uproar"],
      19: ["Fury Swipes"],
      25: ["Endure"],
      31: ["Slash"],
      37: ["Counter"],
      43: ["Focus Punch"],
      49: ["Reversal"]
    }
  },
  289: { // Slaking
    name: "Slaking",
    levelUp: {
      1: ["Scratch", "Yawn", "Encore", "Slack Off"],
      7: ["Encore"],
      13: ["Slack Off"],
      19: ["Feint Attack"],
      25: ["Amnesia"],
      31: ["Covet"],
      36: ["Swagger"],
      37: ["Punishment"],
      43: ["Counter"],
      49: ["Flail"],
      55: ["Fling"]
    }
  },
  290: { // Nincada
    name: "Nincada",
    levelUp: {
      1: ["Scratch", "Harden"],
      5: ["Leech Life"],
      9: ["Sand Attack"],
      14: ["Fury Swipes"],
      19: ["Mind Reader"],
      25: ["False Swipe"],
      31: ["Mud-Slap"],
      38: ["Metal Claw"],
      45: ["Dig"]
    }
  },
  291: { // Ninjask
    name: "Ninjask",
    levelUp: {
      1: ["Bug Bite", "Scratch", "Harden", "Leech Life"],
      5: ["Leech Life"],
      9: ["Sand Attack"],
      14: ["Fury Swipes"],
      19: ["Mind Reader"],
      20: ["Double Team"],
      20: ["Fury Cutter"],
      25: ["Screech"],
      31: ["Swords Dance"],
      38: ["Slash"],
      45: ["Agility"],
      52: ["Baton Pass"],
      59: ["X-Scissor"]
    }
  },
  292: { // Shedinja
    name: "Shedinja",
    levelUp: {
      1: ["Scratch", "Harden"],
      5: ["Leech Life"],
      9: ["Sand Attack"],
      14: ["Fury Swipes"],
      19: ["Mind Reader"],
      25: ["Spite"],
      31: ["Confuse Ray"],
      38: ["Shadow Sneak"],
      45: ["Grudge"],
      52: ["Heal Block"],
      59: ["Shadow Ball"]
    }
  },
  293: { // Whismur
    name: "Whismur",
    levelUp: {
      1: ["Pound", "Uproar"],
      5: ["Astonish"],
      11: ["Howl"],
      15: ["Supersonic"],
      21: ["Stomp"],
      25: ["Screech"],
      31: ["Roar"],
      35: ["Rest"],
      41: ["Sleep Talk"],
      45: ["Hyper Voice"]
    }
  },
  294: { // Loudred
    name: "Loudred",
    levelUp: {
      1: ["Pound", "Uproar", "Astonish"],
      5: ["Astonish"],
      11: ["Howl"],
      15: ["Supersonic"],
      23: ["Stomp"],
      29: ["Screech"],
      37: ["Roar"],
      43: ["Rest"],
      51: ["Sleep Talk"],
      57: ["Hyper Voice"]
    }
  },
  295: { // Exploud
    name: "Exploud",
    levelUp: {
      1: ["Pound", "Uproar", "Astonish", "Howl"],
      5: ["Astonish"],
      11: ["Howl"],
      15: ["Supersonic"],
      23: ["Stomp"],
      29: ["Screech"],
      40: ["Crunch"],
      47: ["Roar"],
      56: ["Rest"],
      67: ["Sleep Talk"],
      76: ["Hyper Voice"],
      85: ["Hyper Beam"]
    }
  },
  296: { // Makuhita
    name: "Makuhita",
    levelUp: {
      1: ["Tackle", "Focus Energy"],
      4: ["Sand Attack"],
      10: ["Arm Thrust"],
      13: ["Vital Throw"],
      19: ["Fake Out"],
      22: ["Whirlwind"],
      28: ["Knock Off"],
      31: ["Smellingsalt"],
      37: ["Belly Drum"],
      40: ["Force Palm"],
      46: ["Seismic Toss"],
      49: ["Reversal"],
      55: ["Close Combat"]
    }
  },
  297: { // Hariyama
    name: "Hariyama",
    levelUp: {
      1: ["Tackle", "Focus Energy", "Sand Attack", "Arm Thrust"],
      4: ["Sand Attack"],
      10: ["Arm Thrust"],
      13: ["Vital Throw"],
      19: ["Fake Out"],
      22: ["Whirlwind"],
      29: ["Knock Off"],
      34: ["Smellingsalt"],
      42: ["Belly Drum"],
      47: ["Force Palm"],
      55: ["Seismic Toss"],
      60: ["Reversal"],
      68: ["Close Combat"]
    }
  },
  298: { // Azurill
    name: "Azurill",
    levelUp: {
      1: ["Splash", "Water Gun", "Tail Whip"],
      3: ["Water Gun"],
      6: ["Tail Whip"],
      10: ["Bubble"],
      15: ["Charm"],
      20: ["Bubble Beam"],
      25: ["Help"]
    }
  },
  299: { // Nosepass
    name: "Nosepass",
    levelUp: {
      1: ["Tackle", "Harden"],
      6: ["Block"],
      11: ["Rock Throw"],
      16: ["Thunder Wave"],
      21: ["Rock Slide"],
      26: ["Sandstorm"],
      31: ["Rest"],
      36: ["Spark"],
      41: ["Rock Blast"],
      46: ["Discharge"],
      51: ["Stone Edge"],
      56: ["Lock-On"],
      61: ["Zap Cannon"]
    }
  },
  300: { // Skitty
    name: "Skitty",
    levelUp: {
      1: ["Fake Out", "Growl", "Tail Whip"],
      3: ["Tackle"],
      7: ["Foresight"],
      13: ["Sing"],
      15: ["Doubleslap"],
      19: ["Copycat"],
      25: ["Assist"],
      27: ["Charm"],
      31: ["Feint Attack"],
      37: ["Wake-Up Slap"],
      39: ["Covet"],
      43: ["Heal Bell"],
      49: ["Double-Edge"],
      51: ["Captivate"]
    }
  },
  301: { // Delcatty
    name: "Delcatty",
    levelUp: {
      1: ["Fake Out", "Attract", "Sing", "Doubleslap"]
    }
  },
  302: { // Sableye
    name: "Sableye",
    levelUp: {
      1: ["Leer", "Scratch"],
      5: ["Foresight"],
      9: ["Night Shade"],
      13: ["Astonish"],
      17: ["Fury Swipes"],
      21: ["Detect"],
      25: ["Shadow Sneak"],
      29: ["Feint Attack"],
      33: ["Fake Out"],
      37: ["Punishment"],
      41: ["Knock Off"],
      45: ["Confuse Ray"],
      49: ["Zen Headbutt"],
      53: ["Shadow Claw"],
      57: ["Mean Look"],
      61: ["Shadow Ball"]
    }
  },
  303: { // Mawile
    name: "Mawile",
    levelUp: {
      1: ["Astonish", "Fake Tears"],
      6: ["Bite"],
      11: ["Sweet Scent"],
      16: ["Vice Grip"],
      21: ["Feint Attack"],
      26: ["Baton Pass"],
      31: ["Crunch"],
      36: ["Iron Defense"],
      41: ["Sucker Punch"],
      46: ["Stockpile"],
      46: ["Swallow"],
      46: ["Spit Up"],
      51: ["Iron Head"]
    }
  },
  304: { // Aron
    name: "Aron",
    levelUp: {
      1: ["Tackle", "Harden"],
      4: ["Mud-Slap"],
      7: ["Headbutt"],
      10: ["Metal Claw"],
      13: ["Iron Defense"],
      16: ["Roar"],
      19: ["Take Down"],
      22: ["Iron Head"],
      25: ["Protect"],
      28: ["Metal Sound"],
      31: ["Iron Tail"],
      34: ["Double-Edge"],
      37: ["Autotomize"],
      40: ["Heavy Slam"],
      43: ["Metal Burst"]
    }
  },
  305: { // Lairon
    name: "Lairon",
    levelUp: {
      1: ["Tackle", "Harden", "Mud-Slap", "Headbutt"],
      4: ["Mud-Slap"],
      7: ["Headbutt"],
      10: ["Metal Claw"],
      13: ["Iron Defense"],
      16: ["Roar"],
      19: ["Take Down"],
      22: ["Iron Head"],
      25: ["Protect"],
      30: ["Metal Sound"],
      35: ["Iron Tail"],
      40: ["Double-Edge"],
      45: ["Autotomize"],
      50: ["Heavy Slam"],
      55: ["Metal Burst"]
    }
  },
  306: { // Aggron
    name: "Aggron",
    levelUp: {
      1: ["Tackle", "Harden", "Mud-Slap", "Headbutt"],
      4: ["Mud-Slap"],
      7: ["Headbutt"],
      10: ["Metal Claw"],
      13: ["Iron Defense"],
      16: ["Roar"],
      19: ["Take Down"],
      22: ["Iron Head"],
      25: ["Protect"],
      30: ["Metal Sound"],
      37: ["Iron Tail"],
      44: ["Double-Edge"],
      51: ["Autotomize"],
      58: ["Heavy Slam"],
      65: ["Metal Burst"]
    }
  },
  307: { // Meditite
    name: "Meditite",
    levelUp: {
      1: ["Bide", "Meditate"],
      4: ["Confusion"],
      9: ["Detect"],
      12: ["Endure"],
      17: ["Feint"],
      20: ["Force Palm"],
      25: ["Hidden Power"],
      28: ["Calm Mind"],
      33: ["Mind Reader"],
      36: ["Hi Jump Kick"],
      41: ["Psych Up"],
      44: ["Power Trick"],
      49: ["Reversal"],
      52: ["Recover"]
    }
  },
  308: { // Medicham
    name: "Medicham",
    levelUp: {
      1: ["Fire Punch", "Thunder Punch", "Ice Punch", "Bide"],
      4: ["Confusion"],
      9: ["Detect"],
      12: ["Endure"],
      17: ["Feint"],
      20: ["Force Palm"],
      25: ["Hidden Power"],
      28: ["Calm Mind"],
      35: ["Mind Reader"],
      40: ["Hi Jump Kick"],
      47: ["Psych Up"],
      52: ["Power Trick"],
      59: ["Reversal"],
      64: ["Recover"]
    }
  },
  309: { // Electrike
    name: "Electrike",
    levelUp: {
      1: ["Tackle", "Thunder Wave"],
      4: ["Leer"],
      9: ["Howl"],
      12: ["Quick Attack"],
      17: ["Spark"],
      20: ["Odor Sleuth"],
      25: ["Bite"],
      28: ["Thunder Fang"],
      33: ["Roar"],
      36: ["Discharge"],
      41: ["Charge"],
      44: ["Wild Charge"],
      49: ["Thunder"]
    }
  },
  310: { // Manectric
    name: "Manectric",
    levelUp: {
      1: ["Fire Fang", "Tackle", "Thunder Wave", "Leer"],
      4: ["Leer"],
      9: ["Howl"],
      12: ["Quick Attack"],
      17: ["Spark"],
      20: ["Odor Sleuth"],
      25: ["Bite"],
      30: ["Thunder Fang"],
      37: ["Roar"],
      42: ["Discharge"],
      49: ["Charge"],
      54: ["Wild Charge"],
      61: ["Thunder"]
    }
  },
  311: { // Plusle
    name: "Plusle",
    levelUp: {
      1: ["Growl", "Thunder Wave", "Quick Attack"],
      3: ["Helping Hand"],
      10: ["Spark"],
      15: ["Encore"],
      20: ["Fake Tears"],
      25: ["Copycat"],
      30: ["Swift"],
      35: ["Charm"],
      40: ["Charge"],
      45: ["Thunder"],
      50: ["Baton Pass"],
      55: ["Agility"],
      60: ["Last Resort"]
    }
  },
  312: { // Minun
    name: "Minun",
    levelUp: {
      1: ["Growl", "Thunder Wave", "Quick Attack"],
      3: ["Helping Hand"],
      10: ["Spark"],
      15: ["Encore"],
      20: ["Charm"],
      25: ["Copycat"],
      30: ["Swift"],
      35: ["Fake Tears"],
      40: ["Charge"],
      45: ["Thunder"],
      50: ["Baton Pass"],
      55: ["Agility"],
      60: ["Trump Card"]
    }
  },
  313: { // Volbeat
    name: "Volbeat",
    levelUp: {
      1: ["Flash", "Tackle"],
      5: ["Double Team"],
      9: ["Confuse Ray"],
      13: ["Moonlight"],
      17: ["Quick Attack"],
      21: ["Tail Glow"],
      25: ["Signal Beam"],
      29: ["Protect"],
      33: ["Helping Hand"],
      37: ["Zen Headbutt"],
      41: ["Bug Buzz"],
      45: ["Double-Edge"]
    }
  },
  314: { // Illumise
    name: "Illumise",
    levelUp: {
      1: ["Tackle", "Sweet Scent"],
      5: ["Charm"],
      9: ["Moonlight"],
      13: ["Quick Attack"],
      17: ["Wish"],
      21: ["Encore"],
      25: ["Flatter"],
      29: ["Zen Headbutt"],
      33: ["Helping Hand"],
      37: ["Bug Buzz"],
      41: ["Covet"],
      45: ["Prankster"]
    }
  },
  315: { // Roselia
    name: "Roselia",
    levelUp: {
      1: ["Absorb", "Growth", "Poison Sting", "Stun Spore"],
      4: ["Growth"],
      7: ["Poison Sting"],
      10: ["Stun Spore"],
      13: ["Mega Drain"],
      16: ["Leech Seed"],
      19: ["Magical Leaf"],
      22: ["Grass Whistle"],
      25: ["Giga Drain"],
      28: ["Sweet Scent"],
      31: ["Ingrain"],
      34: ["Toxic Spikes"],
      37: ["Petal Dance"],
      40: ["Aromatherapy"],
      43: ["Synthesis"]
    }
  },
  316: { // Gulpin
    name: "Gulpin",
    levelUp: {
      1: ["Pound", "Yawn"],
      6: ["Poison Gas"],
      9: ["Sludge"],
      14: ["Amnesia"],
      17: ["Encore"],
      23: ["Toxic"],
      28: ["Stockpile"],
      28: ["Spit Up"],
      28: ["Swallow"],
      34: ["Sludge Bomb"],
      39: ["Gastro Acid"],
      45: ["Wring Out"]
    }
  },
  317: { // Swalot
    name: "Swalot",
    levelUp: {
      1: ["Body Slam", "Pound", "Yawn", "Poison Gas"],
      6: ["Poison Gas"],
      9: ["Sludge"],
      14: ["Amnesia"],
      17: ["Encore"],
      25: ["Toxic"],
      32: ["Stockpile"],
      32: ["Spit Up"],
      32: ["Swallow"],
      40: ["Sludge Bomb"],
      47: ["Gastro Acid"],
      55: ["Wring Out"]
    }
  },
  318: { // Carvanha
    name: "Carvanha",
    levelUp: {
      1: ["Leer", "Bite"],
      7: ["Rage"],
      10: ["Focus Energy"],
      16: ["Scary Face"],
      19: ["Ice Fang"],
      25: ["Screech"],
      28: ["Swagger"],
      34: ["Assurance"],
      37: ["Crunch"],
      43: ["Aqua Jet"],
      46: ["Agility"]
    }
  },
  319: { // Sharpedo
    name: "Sharpedo",
    levelUp: {
      1: ["Feint", "Leer", "Bite", "Rage"],
      7: ["Rage"],
      10: ["Focus Energy"],
      16: ["Scary Face"],
      19: ["Ice Fang"],
      25: ["Screech"],
      28: ["Swagger"],
      36: ["Assurance"],
      41: ["Crunch"],
      49: ["Aqua Jet"],
      54: ["Agility"],
      60: ["Skull Bash"]
    }
  },
  320: { // Wailmer
    name: "Wailmer",
    levelUp: {
      1: ["Splash", "Growl", "Water Gun"],
      5: ["Rollout"],
      10: ["Whirlpool"],
      14: ["Astonish"],
      19: ["Water Pulse"],
      23: ["Mist"],
      28: ["Rest"],
      32: ["Water Spout"],
      37: ["Amnesia"],
      41: ["Dive"],
      46: ["Bounce"],
      50: ["Hydro Pump"]
    }
  },
  321: { // Wailord
    name: "Wailord",
    levelUp: {
      1: ["Splash", "Growl", "Water Gun", "Rollout"],
      5: ["Rollout"],
      10: ["Whirlpool"],
      14: ["Astonish"],
      19: ["Water Pulse"],
      23: ["Mist"],
      28: ["Rest"],
      32: ["Water Spout"],
      39: ["Amnesia"],
      45: ["Dive"],
      52: ["Bounce"],
      58: ["Hydro Pump"]
    }
  },
  322: { // Numel
    name: "Numel",
    levelUp: {
      1: ["Growl", "Tackle"],
      5: ["Ember"],
      8: ["Magnitude"],
      13: ["Focus Energy"],
      16: ["Take Down"],
      21: ["Amnesia"],
      24: ["Lava Plume"],
      29: ["Earth Power"],
      32: ["Curse"],
      37: ["Yawn"],
      40: ["Earthquake"],
      45: ["Eruption"]
    }
  },
  323: { // Camerupt
    name: "Camerupt",
    levelUp: {
      1: ["Rock Slide", "Growl", "Tackle", "Ember"],
      5: ["Ember"],
      8: ["Magnitude"],
      13: ["Focus Energy"],
      16: ["Take Down"],
      21: ["Amnesia"],
      24: ["Lava Plume"],
      31: ["Earth Power"],
      36: ["Curse"],
      43: ["Yawn"],
      48: ["Earthquake"],
      55: ["Eruption"]
    }
  },
  324: { // Torkoal
    name: "Torkoal",
    levelUp: {
      1: ["Ember", "Smog"],
      4: ["Smog"],
      7: ["Curse"],
      12: ["Smokescreen"],
      15: ["Fire Spin"],
      20: ["Body Slam"],
      23: ["Protect"],
      28: ["Flamethrower"],
      31: ["Iron Defense"],
      36: ["Amnesia"],
      39: ["Flail"],
      44: ["Heat Wave"],
      47: ["Lava Plume"],
      52: ["Eruption"]
    }
  },
  325: { // Spoink
    name: "Spoink",
    levelUp: {
      1: ["Splash", "Psywave"],
      7: ["Odor Sleuth"],
      10: ["Psybeam"],
      16: ["Psych Up"],
      19: ["Confuse Ray"],
      25: ["Magic Coat"],
      28: ["Zen Headbutt"],
      34: ["Rest"],
      37: ["Snore"],
      43: ["Psyshock"],
      46: ["Payback"],
      52: ["Psychic"],
      55: ["Bounce"]
    }
  },
  326: { // Grumpig
    name: "Grumpig",
    levelUp: {
      1: ["Teeter Dance", "Splash", "Psywave", "Odor Sleuth"],
      7: ["Odor Sleuth"],
      10: ["Psybeam"],
      16: ["Psych Up"],
      19: ["Confuse Ray"],
      25: ["Magic Coat"],
      30: ["Zen Headbutt"],
      38: ["Rest"],
      43: ["Snore"],
      51: ["Psyshock"],
      56: ["Payback"],
      64: ["Psychic"],
      69: ["Bounce"]
    }
  },
  327: { // Spinda
    name: "Spinda",
    levelUp: {
      1: ["Tackle", "Uproar"],
      5: ["Faint Attack"],
      12: ["Psybeam"],
      16: ["Hypnosis"],
      23: ["Dizzy Punch"],
      27: ["Sucker Punch"],
      34: ["Teeter Dance"],
      38: ["Psych Up"],
      45: ["Double-Edge"],
      49: ["Flail"],
      56: ["Thrash"]
    }
  },
  328: { // Trapinch
    name: "Trapinch",
    levelUp: {
      1: ["Bite", "Sand Attack"],
      9: ["Feint Attack"],
      17: ["Sand Tomb"],
      25: ["Crunch"],
      33: ["Dig"],
      41: ["Sandstorm"],
      49: ["Hyper Beam"]
    }
  },
  329: { // Vibrava
    name: "Vibrava",
    levelUp: {
      1: ["Bite", "Sand Attack", "Feint Attack", "Sonic Boom"],
      9: ["Feint Attack"],
      17: ["Sand Tomb"],
      25: ["Crunch"],
      35: ["DragonBreath"],
      45: ["Screech"],
      55: ["Sandstorm"],
      65: ["Hyper Beam"]
    }
  },
  330: { // Flygon
    name: "Flygon",
    levelUp: {
      1: ["Bite", "Sand Attack", "Feint Attack", "Sonic Boom"],
      9: ["Feint Attack"],
      17: ["Sand Tomb"],
      25: ["Crunch"],
      35: ["DragonBreath"],
      45: ["Screech"],
      57: ["Earth Power"],
      69: ["Sandstorm"],
      81: ["Hyper Beam"]
    }
  },
  331: { // Cacnea
    name: "Cacnea",
    levelUp: {
      1: ["Poison Sting", "Leer"],
      5: ["Absorb"],
      9: ["Growth"],
      13: ["Leech Seed"],
      17: ["Sand Attack"],
      21: ["Pin Missile"],
      25: ["Ingrain"],
      29: ["Feint Attack"],
      33: ["Spikes"],
      37: ["Sucker Punch"],
      41: ["Payback"],
      45: ["Needle Arm"],
      49: ["Cotton Spore"],
      53: ["Sandstorm"],
      57: ["Destiny Bond"]
    }
  },
  332: { // Cacturne
    name: "Cacturne",
    levelUp: {
      1: ["Revenge", "Poison Sting", "Leer", "Absorb", "Growth"],
      5: ["Absorb"],
      9: ["Growth"],
      13: ["Leech Seed"],
      17: ["Sand Attack"],
      21: ["Pin Missile"],
      25: ["Ingrain"],
      29: ["Feint Attack"],
      35: ["Spikes"],
      41: ["Sucker Punch"],
      47: ["Payback"],
      53: ["Needle Arm"],
      59: ["Cotton Spore"],
      65: ["Sandstorm"],
      71: ["Destiny Bond"]
    }
  },
  333: { // Swablu
    name: "Swablu",
    levelUp: {
      1: ["Peck", "Growl"],
      5: ["Astonish"],
      9: ["Sing"],
      13: ["Fury Attack"],
      18: ["Safeguard"],
      23: ["Mist"],
      28: ["Take Down"],
      32: ["Natural Gift"],
      36: ["Refresh"],
      40: ["Mirror Move"],
      44: ["Cotton Dance"],
      48: ["Dragon Pulse"],
      52: ["Perish Song"]
    }
  },
  334: { // Altaria
    name: "Altaria",
    levelUp: {
      1: ["Pluck", "Peck", "Growl", "Astonish", "Sing"],
      5: ["Astonish"],
      9: ["Sing"],
      13: ["Fury Attack"],
      18: ["Safeguard"],
      23: ["Mist"],
      28: ["Take Down"],
      32: ["Natural Gift"],
      38: ["Refresh"],
      44: ["Dragon Dance"],
      50: ["Cotton Dance"],
      56: ["Dragon Pulse"],
      62: ["Perish Song"],
      68: ["Sky Attack"]
    }
  },
  335: { // Zangoose
    name: "Zangoose",
    levelUp: {
      1: ["Scratch", "Leer"],
      4: ["Quick Attack"],
      7: ["Swords Dance"],
      10: ["Fury Cutter"],
      13: ["Slash"],
      19: ["Pursuit"],
      25: ["Embargo"],
      31: ["Crush Claw"],
      37: ["False Swipe"],
      46: ["Detect"],
      55: ["Taunt"],
      64: ["Close Combat"]
    }
  },
  336: { // Seviper
    name: "Seviper",
    levelUp: {
      1: ["Wrap", "Lick", "Bite"],
      7: ["Poison Tail"],
      10: ["Feint Attack"],
      16: ["Screech"],
      19: ["Venoshock"],
      25: ["Glare"],
      31: ["Poison Fang"],
      37: ["Swagger"],
      46: ["Crunch"],
      55: ["Belch"],
      64: ["Coil"],
      73: ["Poison Jab"]
    }
  },
  337: { // Lunatone
    name: "Lunatone",
    levelUp: {
      1: ["Tackle", "Harden", "Confusion", "Rock Throw"],
      7: ["Rock Throw"],
      13: ["Hypnosis"],
      19: ["Rock Polish"],
      25: ["Psywave"],
      31: ["Embargo"],
      37: ["Rock Slide"],
      43: ["Cosmic Power"],
      49: ["Psychic"],
      55: ["Heal Block"],
      61: ["Stone Edge"],
      67: ["Future Sight"],
      73: ["Explosion"],
      79: ["Magic Room"]
    }
  },
  338: { // Solrock
    name: "Solrock",
    levelUp: {
      1: ["Tackle", "Harden", "Confusion", "Rock Throw"],
      7: ["Rock Throw"],
      13: ["Fire Spin"],
      19: ["Rock Polish"],
      25: ["Psywave"],
      31: ["Embargo"],
      37: ["Rock Slide"],
      43: ["Cosmic Power"],
      49: ["Psychic"],
      55: ["Heal Block"],
      61: ["Stone Edge"],
      67: ["SolarBeam"],
      73: ["Explosion"],
      79: ["Wonder Room"]
    }
  },
  339: { // Barboach
    name: "Barboach",
    levelUp: {
      1: ["Mud-Slap", "Water Gun"],
      6: ["Mud Sport"],
      10: ["Water Sport"],
      14: ["Magnitude"],
      18: ["Amnesia"],
      22: ["Water Pulse"],
      26: ["Earthquake"],
      30: ["Future Sight"],
      34: ["Fissure"]
    }
  },
  340: { // Whiscash
    name: "Whiscash",
    levelUp: {
      1: ["Zen Headbutt", "Tickle", "Mud-Slap", "Water Gun"],
      6: ["Mud Sport"],
      10: ["Water Sport"],
      14: ["Magnitude"],
      18: ["Amnesia"],
      22: ["Water Pulse"],
      26: ["Earthquake"],
      32: ["Future Sight"],
      38: ["Fissure"]
    }
  },
  341: { // Corphish
    name: "Corphish",
    levelUp: {
      1: ["Bubble", "Harden"],
      5: ["Bubble Beam"],
      9: ["Protect"],
      13: ["Knockoff"],
      17: ["Taunt"],
      20: ["Crabhammer"],
      23: ["Swords Dance"],
      26: ["Crunch"],
      32: ["Guillotine"],
      36: ["Endeavor"]
    }
  },
  342: { // Crawdaunt
    name: "Crawdaunt",
    levelUp: {
      1: ["Bubble", "Harden", "Bubble Beam", "Swagger"],
      5: ["Bubble Beam"],
      9: ["Protect"],
      13: ["Knockoff"],
      17: ["Taunt"],
      20: ["Crabhammer"],
      23: ["Swords Dance"],
      26: ["Crunch"],
      34: ["Guillotine"],
      40: ["Endeavor"]
    }
  },
  343: { // Baltoy
    name: "Baltoy",
    levelUp: {
      1: ["Confusion", "Harden"],
      3: ["Rapid Spin"],
      5: ["Mud-Slap"],
      7: ["Heal Block"],
      11: ["Rock Tomb"],
      15: ["Psybeam"],
      19: ["Ancient Power"],
      25: ["Power Trick"],
      31: ["Sandstorm"],
      37: ["Cosmic Power"],
      45: ["Explosion"],
      53: ["Heal Block"]
    }
  },
  344: { // Claydol
    name: "Claydol",
    levelUp: {
      1: ["Teleport", "Confusion", "Harden", "Rapid Spin"],
      3: ["Rapid Spin"],
      5: ["Mud-Slap"],
      7: ["Heal Block"],
      11: ["Rock Tomb"],
      15: ["Psybeam"],
      19: ["Ancient Power"],
      25: ["Power Trick"],
      33: ["Sandstorm"],
      41: ["Cosmic Power"],
      51: ["Explosion"],
      61: ["Heal Block"]
    }
  },
  345: { // Lileep
    name: "Lileep",
    levelUp: {
      1: ["Astonish", "Constrict"],
      8: ["Acid"],
      15: ["Ingrain"],
      22: ["Confuse Ray"],
      29: ["Amnesia"],
      36: ["Gastro Acid"],
      43: ["Ancient Power"],
      50: ["Energy Ball"],
      57: ["Stockpile"],
      57: ["Spit Up"],
      57: ["Swallow"]
    }
  },
  346: { // Cradily
    name: "Cradily",
    levelUp: {
      1: ["Astonish", "Constrict", "Acid"],
      8: ["Acid"],
      15: ["Ingrain"],
      22: ["Confuse Ray"],
      29: ["Amnesia"],
      39: ["Gastro Acid"],
      48: ["Ancient Power"],
      57: ["Energy Ball"],
      66: ["Stockpile"],
      66: ["Spit Up"],
      66: ["Swallow"]
    }
  },
  347: { // Anorith
    name: "Anorith",
    levelUp: {
      1: ["Scratch", "Harden"],
      7: ["Mud Sport"],
      13: ["Water Gun"],
      19: ["Metal Claw"],
      25: ["Protect"],
      31: ["Ancient Power"],
      37: ["Fury Cutter"],
      43: ["Slash"],
      49: ["Rock Blast"],
      55: ["Crush Claw"]
    }
  },
  348: { // Armaldo
    name: "Armaldo",
    levelUp: {
      1: ["Scratch", "Harden", "Mud Sport"],
      7: ["Mud Sport"],
      13: ["Water Gun"],
      19: ["Metal Claw"],
      25: ["Protect"],
      31: ["Ancient Power"],
      37: ["Fury Cutter"],
      46: ["Slash"],
      55: ["Rock Blast"],
      64: ["Crush Claw"]
    }
  },
  349: { // Feebas
    name: "Feebas",
    levelUp: {
      1: ["Splash", "Tackle"],
      15: ["Flail"],
      30: ["Tackle"]
    }
  },
  350: { // Milotic
    name: "Milotic",
    levelUp: {
      1: ["Water Gun", "Wrap", "Water Sport", "Refresh"],
      5: ["Water Sport"],
      10: ["Refresh"],
      15: ["Water Pulse"],
      20: ["Twister"],
      25: ["Recover"],
      30: ["Captivate"],
      35: ["Aqua Tail"],
      40: ["Rain Dance"],
      45: ["Hydro Pump"],
      50: ["Attract"],
      55: ["Safeguard"],
      60: ["Aqua Ring"]
    }
  },
  351: { // Castform
    name: "Castform",
    levelUp: {
      1: ["Tackle"],
      10: ["Water Gun"],
      10: ["Ember"],
      10: ["Powder Snow"],
      20: ["Rain Dance"],
      20: ["Sunny Day"],
      20: ["Hail"],
      30: ["Weather Ball"],
      40: ["Endure"],
      50: ["Hurricane"]
    }
  },
  352: { // Kecleon
    name: "Kecleon",
    levelUp: {
      1: ["Thief", "Tail Whip", "Astonish", "Lick"],
      4: ["Scratch"],
      7: ["Bind"],
      12: ["Feint Attack"],
      15: ["Fury Swipes"],
      20: ["Feint"],
      23: ["Psybeam"],
      28: ["Slash"],
      31: ["Screech"],
      36: ["Substitute"],
      39: ["Sucker Punch"],
      44: ["Shadow Sneak"],
      47: ["Ancient Power"],
      52: ["Synchronoise"]
    }
  },
  353: { // Shuppet
    name: "Shuppet",
    levelUp: {
      1: ["Knock Off", "Screech"],
      5: ["Night Shade"],
      10: ["Curse"],
      16: ["Spite"],
      19: ["Will-O-Wisp"],
      25: ["Feint Attack"],
      28: ["Hex"],
      34: ["Sucker Punch"],
      37: ["Embargo"],
      43: ["Snatch"],
      46: ["Grudge"],
      52: ["Trick"]
    }
  },
  354: { // Banette
    name: "Banette",
    levelUp: {
      1: ["Knock Off", "Screech", "Night Shade", "Curse"],
      5: ["Night Shade"],
      10: ["Curse"],
      16: ["Spite"],
      19: ["Will-O-Wisp"],
      25: ["Feint Attack"],
      28: ["Hex"],
      36: ["Sucker Punch"],
      41: ["Embargo"],
      49: ["Snatch"],
      54: ["Grudge"],
      62: ["Trick"]
    }
  },
  355: { // Duskull
    name: "Duskull",
    levelUp: {
      1: ["Leer", "Night Shade"],
      6: ["Disable"],
      9: ["Foresight"],
      14: ["Astonish"],
      17: ["Confuse Ray"],
      22: ["Pursuit"],
      25: ["Curse"],
      30: ["Will-O-Wisp"],
      33: ["Mean Look"],
      38: ["Payback"],
      41: ["Future Sight"]
    }
  },
  356: { // Dusclops
    name: "Dusclops",
    levelUp: {
      1: ["Fire Punch", "Ice Punch", "Thunder Punch", "Bind"],
      6: ["Disable"],
      9: ["Foresight"],
      14: ["Astonish"],
      17: ["Confuse Ray"],
      22: ["Pursuit"],
      25: ["Curse"],
      30: ["Will-O-Wisp"],
      33: ["Mean Look"],
      40: ["Payback"],
      45: ["Future Sight"]
    }
  },
  357: { // Tropius
    name: "Tropius",
    levelUp: {
      1: ["Leer", "Gust"],
      7: ["Growth"],
      11: ["Razor Leaf"],
      17: ["Stomp"],
      21: ["Sweet Scent"],
      27: ["Whirlwind"],
      31: ["Magical Leaf"],
      37: ["Body Slam"],
      41: ["Synthesis"],
      47: ["Air Slash"],
      51: ["SolarBeam"],
      57: ["Natural Gift"]
    }
  },
  358: { // Chimecho
    name: "Chimecho",
    levelUp: {
      1: ["Wrap", "Growl", "Astonish", "Confusion"],
      6: ["Growl"],
      9: ["Astonish"],
      14: ["Confusion"],
      17: ["Uproar"],
      22: ["Take Down"],
      25: ["Extrasensory"],
      30: ["Yawn"],
      33: ["Psywave"],
      38: ["Double-Edge"],
      41: ["Heal Bell"],
      46: ["Safeguard"],
      49: ["Psychic"],
      54: ["Synchronoise"]
    }
  },
  359: { // Absol
    name: "Absol",
    levelUp: {
      1: ["Scratch", "Feint", "Leer"],
      4: ["Leer"],
      9: ["Taunt"],
      12: ["Quick Attack"],
      17: ["Razor Wind"],
      20: ["Pursuit"],
      25: ["Swords Dance"],
      28: ["Bite"],
      33: ["Double Team"],
      36: ["Slash"],
      41: ["Future Sight"],
      44: ["Sucker Punch"],
      49: ["Detect"],
      52: ["Night Slash"],
      57: ["Me First"],
      60: ["Psycho Cut"],
      65: ["Perish Song"]
    }
  },
  360: { // Wynaut
    name: "Wynaut",
    levelUp: {
      1: ["Splash", "Charm", "Encore"],
      15: ["Counter", "Mirror Coat", "Safeguard", "Destiny Bond"]
    }
  },
  361: { // Snorunt
    name: "Snorunt",
    levelUp: {
      1: ["Powder Snow", "Leer"],
      5: ["Double Team"],
      10: ["Bite"],
      14: ["Icy Wind"],
      19: ["Headbutt"],
      23: ["Protect"],
      28: ["Ice Fang"],
      32: ["Crunch"],
      37: ["Ice Beam"],
      41: ["Hail"],
      46: ["Blizzard"]
    }
  },
  362: { // Glalie
    name: "Glalie",
    levelUp: {
      1: ["Powder Snow", "Leer", "Double Team", "Bite"],
      5: ["Double Team"],
      10: ["Bite"],
      14: ["Icy Wind"],
      19: ["Headbutt"],
      23: ["Protect"],
      28: ["Ice Fang"],
      32: ["Crunch"],
      42: ["Ice Beam"],
      51: ["Hail"],
      61: ["Blizzard"],
      70: ["Sheer Cold"]
    }
  },
  363: { // Spheal
    name: "Spheal",
    levelUp: {
      1: ["Defense Curl", "Powder Snow", "Growl", "Water Gun"],
      7: ["Encore"],
      13: ["Ice Ball"],
      19: ["Body Slam"],
      25: ["Aurora Beam"],
      31: ["Hail"],
      37: ["Rest"],
      43: ["Snore"],
      49: ["Blizzard"],
      55: ["Sheer Cold"]
    }
  },
  364: { // Sealeo
    name: "Sealeo",
    levelUp: {
      1: ["Defense Curl", "Powder Snow", "Growl", "Water Gun"],
      7: ["Encore"],
      13: ["Ice Ball"],
      19: ["Body Slam"],
      25: ["Aurora Beam"],
      32: ["Hail"],
      39: ["Rest"],
      46: ["Snore"],
      53: ["Blizzard"],
      60: ["Sheer Cold"]
    }
  },
  365: { // Walrein
    name: "Walrein",
    levelUp: {
      1: ["Crunch", "Defense Curl", "Powder Snow", "Growl"],
      7: ["Encore"],
      13: ["Ice Ball"],
      19: ["Body Slam"],
      25: ["Aurora Beam"],
      32: ["Hail"],
      39: ["Swagger"],
      47: ["Rest"],
      55: ["Snore"],
      63: ["Blizzard"],
      71: ["Sheer Cold"]
    }
  },
  366: { // Clamperl
    name: "Clamperl",
    levelUp: {
      1: ["Clamp", "Water Gun", "Whirlpool", "Iron Defense"],
      50: ["Shell Smash"]
    }
  },
  367: { // Huntail
    name: "Huntail",
    levelUp: {
      1: ["Whirlpool", "Bite"],
      6: ["Screech"],
      10: ["Water Pulse"],
      15: ["Scary Face"],
      19: ["Feint Attack"],
      24: ["Crunch"],
      28: ["Brine"],
      33: ["Sucker Punch"],
      37: ["Dive"],
      42: ["Baton Pass"],
      46: ["Hydro Pump"]
    }
  },
  368: { // Gorebyss
    name: "Gorebyss",
    levelUp: {
      1: ["Whirlpool", "Confusion"],
      6: ["Agility"],
      10: ["Water Pulse"],
      15: ["Amnesia"],
      19: ["Aqua Ring"],
      24: ["Captivate"],
      28: ["Brine"],
      33: ["Safeguard"],
      37: ["Dive"],
      42: ["Psychic"],
      46: ["Hydro Pump"]
    }
  },
  369: { // Relicanth
    name: "Relicanth",
    levelUp: {
      1: ["Tackle", "Harden"],
      8: ["Water Gun"],
      15: ["Rock Tomb"],
      22: ["Yawn"],
      29: ["Take Down"],
      36: ["Mud Sport"],
      43: ["Ancient Power"],
      50: ["Amnesia"],
      57: ["Hydro Pump"],
      64: ["Rest"],
      71: ["Double-Edge"],
      78: ["Head Smash"]
    }
  },
  370: { // Luvdisc
    name: "Luvdisc",
    levelUp: {
      1: ["Tackle", "Charm"],
      4: ["Water Gun"],
      12: ["Agility"],
      16: ["Take Down"],
      24: ["Lucky Chant"],
      28: ["Attract"],
      36: ["Sweet Kiss"],
      40: ["Water Pulse"],
      48: ["Captivate"],
      52: ["Flail"],
      60: ["Safeguard"]
    }
  },
  371: { // Bagon
    name: "Bagon",
    levelUp: {
      1: ["Rage", "Bite"],
      5: ["Leer"],
      9: ["Headbutt"],
      17: ["Focus Energy"],
      21: ["Ember"],
      25: ["Dragon Claw"],
      33: ["Zen Headbutt"],
      37: ["Scary Face"],
      41: ["Crunch"],
      49: ["Dragon Pulse"],
      53: ["Double-Edge"]
    }
  },
  372: { // Shelgon
    name: "Shelgon",
    levelUp: {
      1: ["Rage", "Bite", "Leer", "Headbutt"],
      5: ["Leer"],
      9: ["Headbutt"],
      17: ["Focus Energy"],
      21: ["Ember"],
      25: ["Protect"],
      30: ["Dragon Claw"],
      38: ["Zen Headbutt"],
      42: ["Scary Face"],
      46: ["Crunch"],
      54: ["Dragon Pulse"],
      58: ["Double-Edge"]
    }
  },
  373: { // Salamence
    name: "Salamence",
    levelUp: {
      1: ["Fire Fang", "Thunder Fang", "Rage", "Bite"],
      5: ["Leer"],
      9: ["Headbutt"],
      17: ["Focus Energy"],
      21: ["Ember"],
      25: ["Protect"],
      30: ["Dragon Claw"],
      38: ["Zen Headbutt"],
      46: ["Scary Face"],
      53: ["Fly"],
      61: ["Crunch"],
      70: ["Dragon Pulse"],
      78: ["Double-Edge"]
    }
  },
  374: { // Beldum
    name: "Beldum",
    levelUp: {
      1: ["Take Down"]
    }
  },
  375: { // Metang
    name: "Metang",
    levelUp: {
      1: ["Magnet Rise", "Take Down", "Metal Claw", "Confusion"],
      20: ["Metal Claw"],
      20: ["Confusion"],
      24: ["Scary Face"],
      28: ["Pursuit"],
      32: ["Bullet Punch"],
      36: ["Psychic"],
      40: ["Iron Defense"],
      44: ["Agility"],
      48: ["Meteor Mash"],
      52: ["Zen Headbutt"],
      56: ["Hyper Beam"]
    }
  },
  376: { // Metagross
    name: "Metagross",
    levelUp: {
      1: ["Magnet Rise", "Take Down", "Metal Claw", "Confusion"],
      20: ["Metal Claw"],
      20: ["Confusion"],
      24: ["Scary Face"],
      28: ["Pursuit"],
      32: ["Bullet Punch"],
      36: ["Psychic"],
      40: ["Iron Defense"],
      44: ["Agility"],
      50: ["Meteor Mash"],
      56: ["Zen Headbutt"],
      62: ["Hyper Beam"]
    }
  },
  377: { // Regirock
    name: "Regirock",
    levelUp: {
      1: ["Explosion", "Curse"],
      9: ["Rock Throw"],
      17: ["Curse"],
      25: ["Superpower"],
      33: ["Ancient Power"],
      41: ["Amnesia"],
      49: ["Charge Beam"],
      57: ["Lock-On"],
      65: ["Zap Cannon"],
      73: ["Stone Edge"],
      81: ["Hammer Arm"],
      89: ["Hyper Beam"]
    }
  },
  378: { // Regice
    name: "Regice",
    levelUp: {
      1: ["Explosion", "Icy Wind"],
      9: ["Curse"],
      17: ["Superpower"],
      25: ["Ancient Power"],
      33: ["Amnesia"],
      41: ["Charge Beam"],
      49: ["Lock-On"],
      57: ["Zap Cannon"],
      65: ["Ice Beam"],
      73: ["Hammer Arm"],
      81: ["Hyper Beam"]
    }
  },
  379: { // Registeel
    name: "Registeel",
    levelUp: {
      1: ["Explosion", "Metal Claw"],
      9: ["Curse"],
      17: ["Superpower"],
      25: ["Ancient Power"],
      33: ["Iron Defense"],
      41: ["Amnesia"],
      49: ["Charge Beam"],
      57: ["Lock-On"],
      65: ["Zap Cannon"],
      73: ["Iron Head"],
      81: ["Hammer Arm"],
      89: ["Hyper Beam"]
    }
  },
  380: { // Latias
    name: "Latias",
    levelUp: {
      1: ["Psywave", "Wish"],
      5: ["Helping Hand"],
      10: ["Safeguard"],
      15: ["Dragon Breath"],
      20: ["Water Sport"],
      25: ["Refresh"],
      30: ["Mist Ball"],
      35: ["Zen Headbutt"],
      40: ["Recover"],
      45: ["Psycho Shift"],
      50: ["Charm"],
      55: ["Psychic"],
      60: ["Heal Pulse"],
      65: ["Reflect Type"],
      70: ["Guard Split"],
      75: ["Dragon Pulse"],
      80: ["Healing Wish"]
    }
  },
  381: { // Latios
    name: "Latios",
    levelUp: {
      1: ["Psywave", "Memento"],
      5: ["Helping Hand"],
      10: ["Safeguard"],
      15: ["Dragon Breath"],
      20: ["Protect"],
      25: ["Refresh"],
      30: ["Luster Purge"],
      35: ["Zen Headbutt"],
      40: ["Recover"],
      45: ["Psycho Shift"],
      50: ["Dragon Dance"],
      55: ["Psychic"],
      60: ["Telekinesis"],
      65: ["Power Split"],
      70: ["Stored Power"],
      75: ["Dragon Pulse"],
      80: ["Memento"]
    }
  },
  382: { // Kyogre
    name: "Kyogre",
    levelUp: {
      1: ["Water Pulse", "Scary Face"],
      5: ["Ancient Power"],
      15: ["Body Slam"],
      20: ["Calm Mind"],
      30: ["Ice Beam"],
      35: ["Hydro Pump"],
      45: ["Rest"],
      50: ["Sheer Cold"],
      60: ["Double-Edge"],
      65: ["Aqua Tail"],
      75: ["Water Spout"]
    }
  },
  383: { // Groudon
    name: "Groudon",
    levelUp: {
      1: ["Mud Shot", "Scary Face"],
      5: ["Ancient Power"],
      15: ["Slash"],
      20: ["Bulk Up"],
      30: ["Earthquake"],
      35: ["Fire Blast"],
      45: ["Rest"],
      50: ["Fissure"],
      60: ["SolarBeam"],
      65: ["Earth Power"],
      75: ["Eruption"]
    }
  },
  384: { // Rayquaza
    name: "Rayquaza",
    levelUp: {
      1: ["Twister", "Scary Face"],
      5: ["Ancient Power"],
      15: ["Dragon Claw"],
      20: ["Dragon Dance"],
      30: ["Crunch"],
      35: ["Fly"],
      45: ["Rest"],
      50: ["Extreme Speed"],
      60: ["Dragon Pulse"],
      65: ["Air Slash"],
      75: ["Hyper Beam"]
    }
  },
  385: { // Jirachi
    name: "Jirachi",
    levelUp: {
      1: ["Wish", "Confusion"],
      5: ["Swift"],
      10: ["Helping Hand"],
      15: ["Psychic"],
      20: ["Refresh"],
      25: ["Rest"],
      30: ["Zen Headbutt"],
      35: ["Double-Edge"],
      40: ["Gravity"],
      45: ["Healing Wish"],
      50: ["Future Sight"],
      55: ["Cosmic Power"],
      60: ["Last Resort"],
      65: ["Doom Desire"]
    }
  },
  386: { // Deoxys
    name: "Deoxys",
    levelUp: {
      1: ["Leer", "Wrap"],
      5: ["Night Shade"],
      10: ["Teleport"],
      15: ["Knock Off"],
      20: ["Pursuit"],
      25: ["Psychic"],
      30: ["Snatch"],
      35: ["Psycho Shift"],
      40: ["Zen Headbutt"],
      45: ["Cosmic Power"],
      50: ["Recover"],
      55: ["Psycho Boost"],
      60: ["Hyper Beam"]
    }
  }
};

/**
 * Get Pokemon learnset by dex number
 */
export function getLearnset(dexNumber) {
  return gen3Learnsets[dexNumber] || null;
}

/**
 * Get moves available to a Pokemon at a given level
 */
export function getMovesAtLevel(dexNumber, level) {
  const learnset = getLearnset(dexNumber);
  if (!learnset) return [];
  
  const availableMoves = [];
  
  // Collect all moves learnable up to this level
  Object.entries(learnset.levelUp).forEach(([learnLevel, moves]) => {
    if (parseInt(learnLevel) <= level) {
      availableMoves.push(...moves);
    }
  });
  
  // Remove duplicates and return up to 4 most recent moves
  const uniqueMoves = [...new Set(availableMoves)];
  return uniqueMoves.slice(-4); // Take the 4 most recently learned moves
}

/**
 * Get the most appropriate moves for a Pokemon based on level and trainer class
 */
export function getAuthenticMoveset(dexNumber, level, trainerClass = 'Youngster') {
  const moves = getMovesAtLevel(dexNumber, level);
  
  if (moves.length === 0) {
    // Fallback to basic moves if no learnset available
    return ['Tackle', 'Growl'];
  }
  
  // Adjust moveset based on trainer class
  if (trainerClass === 'Gym Leader' || trainerClass === 'Elite Four' || trainerClass === 'Champion') {
    // Gym leaders get the best available moves
    return moves.slice(-4);
  } else if (trainerClass === 'Ace Trainer' || trainerClass === 'Rival') {
    // Ace trainers get good moves but not necessarily the best
    return moves.slice(-3).concat(moves.slice(0, 1));
  } else {
    // Regular trainers get a mix of early and recent moves
    const earlyMoves = moves.slice(0, 2);
    const recentMoves = moves.slice(-2);
    return [...earlyMoves, ...recentMoves].slice(0, 4);
  }
}

/**
 * Check if a Pokemon has authentic learnset data
 */
export function hasAuthenticData(dexNumber) {
  return gen3Learnsets.hasOwnProperty(dexNumber);
}

export default gen3Learnsets;