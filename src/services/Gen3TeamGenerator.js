/**
 * Enhanced Gen 3 Team Generator
 *
 * Comprehensive Pokémon team generation with:
 * - Proper evolution level checking and evolution progression
 * - Biome-based Pokémon selection
 * - Trainer class and difficulty-based team composition
 * - Accurate moveset generation based on level
 * - Pokédex scope filtering
 */

import {
  completePokedex,
  evolutionData,
  evolutionMethods,
} from "../data/completePokedex.js";
import {
  getEnhancedPokemonData,
  getPokemonForBiome,
} from "../data/enhancedBiomeIntegration.js";
import {
  getAppropriateForm,
  isPokemonAppropriateForTrainer,
  isPseudoLegendary,
} from "../data/enhancedEvolutionRules.js";
import { getAuthenticMoveset } from "../data/gen3AuthoritativeLearnsets.js";
import { GEN3_TRAINER_PATTERNS } from "../data/gen3EncounterData.js";
import { integratedPokedex } from "../data/integratedPokedex.js";

class Gen3TeamGenerator {
  constructor() {
    // Trainer class preferences based on actual Gen 3 NPC teams
    this.trainerClassPreferences = GEN3_TRAINER_PATTERNS;

    // Difficulty modifiers
    this.difficultySettings = {
      "Very Easy": { levelMod: -5, teamSizeMod: -1, evolutionMod: -1 },
      Easy: { levelMod: -2, teamSizeMod: 0, evolutionMod: 0 },
      Medium: { levelMod: 0, teamSizeMod: 0, evolutionMod: 0 },
      Hard: { levelMod: 3, teamSizeMod: 1, evolutionMod: 1 },
      Expert: { levelMod: 5, teamSizeMod: 2, evolutionMod: 2 },
    };

    // Battle style preferences
    this.battleStylePreferences = {
      Balanced: {
        typeSpread: "diverse",
        evolutionBonus: 0,
        movePreferences: {
          aggressive: 0.4,
          defensive: 0.3,
          status: 0.3,
        },
      },
      Aggressive: {
        preferredTypes: ["Fire", "Fighting", "Dragon", "Dark"],
        typeSpread: "focused",
        evolutionBonus: 1,
        movePreferences: {
          aggressive: 0.7,
          defensive: 0.1,
          status: 0.2,
        },
      },
      Defensive: {
        preferredTypes: ["Steel", "Rock", "Water", "Normal"],
        typeSpread: "focused",
        evolutionBonus: 0,
        movePreferences: {
          aggressive: 0.2,
          defensive: 0.5,
          status: 0.3,
        },
      },
      Speedy: {
        preferredTypes: ["Electric", "Flying", "Psychic"],
        typeSpread: "focused",
        evolutionBonus: 1,
        movePreferences: {
          aggressive: 0.5,
          defensive: 0.2,
          status: 0.3,
        },
      },
      Tricky: {
        preferredTypes: ["Ghost", "Psychic", "Dark", "Poison"],
        typeSpread: "focused",
        evolutionBonus: 0,
        movePreferences: {
          aggressive: 0.3,
          defensive: 0.2,
          status: 0.5,
        },
      },
    };

    // Move categories for battle style weighting
    this.moveCategories = {
      aggressive: [
        "Tackle",
        "Scratch",
        "Pound",
        "Quick Attack",
        "Bite",
        "Body Slam",
        "Ember",
        "Flame Wheel",
        "Flamethrower",
        "Fire Blast",
        "Water Gun",
        "Bubble Beam",
        "Hydro Pump",
        "Surf",
        "Absorb",
        "Razor Leaf",
        "Solar Beam",
        "Petal Dance",
        "Thunder Shock",
        "Thunderbolt",
        "Thunder",
        "Spark",
        "Confusion",
        "Psybeam",
        "Psychic",
        "Psywave",
        "Karate Chop",
        "Low Kick",
        "Seismic Toss",
        "Submission",
        "Peck",
        "Wing Attack",
        "Drill Peck",
        "Aerial Ace",
        "Rock Throw",
        "Rock Slide",
        "Stone Edge",
        "Rock Blast",
        "Earthquake",
        "Dig",
        "Mud Shot",
        "Earth Power",
        "Metal Claw",
        "Iron Tail",
        "Steel Wing",
        "Iron Head",
        "Lick",
        "Shadow Ball",
        "Night Shade",
        "Shadow Punch",
        "Crunch",
        "Faint Attack",
        "Pursuit",
        "Sucker Punch",
        "Dragon Rage",
        "Dragon Claw",
        "Dragon Pulse",
        "Outrage",
        "Powder Snow",
        "Ice Beam",
        "Blizzard",
        "Ice Punch",
        "Poison Sting",
        "Sludge Bomb",
        "Poison Jab",
        "Gunk Shot",
      ],
      defensive: [
        "Harden",
        "Withdraw",
        "Defense Curl",
        "Barrier",
        "Acid Armor",
        "Iron Defense",
        "Amnesia",
        "Calm Mind",
        "Cosmic Power",
        "Protect",
        "Detect",
        "Endure",
        "Substitute",
        "Recover",
        "Rest",
        "Sleep Talk",
        "Roost",
        "Wish",
        "Heal Bell",
        "Aromatherapy",
        "Reflect",
        "Light Screen",
        "Safeguard",
        "Mist",
        "Stockpile",
        "Swallow",
        "Ingrain",
      ],
      status: [
        "Growl",
        "Leer",
        "String Shot",
        "Sand Attack",
        "Smokescreen",
        "Flash",
        "Kinesis",
        "Double Team",
        "Minimize",
        "Confuse Ray",
        "Sweet Scent",
        "Scary Face",
        "Charm",
        "Attract",
        "Captivate",
        "Sleep Powder",
        "Stun Spore",
        "Poison Powder",
        "Toxic",
        "Thunder Wave",
        "Glare",
        "Lovely Kiss",
        "Sing",
        "Hypnosis",
        "Will-O-Wisp",
        "Curse",
        "Mean Look",
        "Spider Web",
        "Block",
        "Roar",
        "Whirlwind",
        "Taunt",
        "Torment",
        "Disable",
        "Encore",
        "Flatter",
        "Swagger",
        "Tickle",
      ],
    };
  }

  /**
   * Main team generation function implementing all requirements
   */
  generateEnhancedTeam(options = {}) {
    const {
      biome = "Grassland",
      levelMin = 10,
      levelMax = 15,
      trainerClass = "youngster",
      difficulty = "Medium",
      battleStyle = "Balanced",
      pokedexScope = "gen1-3", // 'gen1', 'gen2', 'gen3', 'gen1-2', 'gen1-3'
      gymType = null, // For gym leaders
      teamSize = null, // Override automatic sizing
    } = options;

    console.log(
      `[DEBUG] Generating team: ${trainerClass} in ${biome} (${levelMin}-${levelMax}) - ${difficulty} difficulty`
    );

    // Step 1: Apply Pokédex scope filtering
    const scopedPokedex = this.filterByPokedexScope(pokedexScope);

    // Step 2: Get trainer class preferences and apply difficulty modifiers
    const trainerPrefs =
      this.trainerClassPreferences[trainerClass] ||
      this.trainerClassPreferences["youngster"];
    const difficultyMods = this.difficultySettings[difficulty];

    // Step 3: Determine effective level range and team size
    const effectiveLevelMin = Math.max(1, levelMin + difficultyMods.levelMod);
    const effectiveLevelMax = Math.max(
      effectiveLevelMin,
      levelMax + difficultyMods.levelMod
    );
    const effectiveTeamSize =
      teamSize ||
      this.calculateTeamSize(
        trainerPrefs,
        difficultyMods,
        effectiveLevelMin,
        effectiveLevelMax
      );

    // Step 4: Get candidate Pokémon based on biome and trainer preferences
    const candidates = this.getCandidatePokemon(
      scopedPokedex,
      biome,
      trainerPrefs,
      trainerClass,
      battleStyle,
      gymType,
      effectiveLevelMin,
      effectiveLevelMax
    );

    if (candidates.length === 0) {
      throw new Error(
        `No suitable Pokémon found for ${trainerClass} in ${biome}`
      );
    }

    // Step 5: Generate team members
    const team = [];
    const usedSpecies = new Set();

    for (let i = 0; i < effectiveTeamSize; i++) {
      const member = this.generateTeamMember(
        candidates,
        usedSpecies,
        effectiveLevelMin,
        effectiveLevelMax,
        trainerPrefs,
        difficultyMods,
        battleStyle,
        trainerClass
      );

      if (member) {
        team.push(member);
        usedSpecies.add(member.originalSpecies); // Track original species to avoid duplicates
      }
    }

    console.log(`[DEBUG] Generated ${team.length} team members`);
    return { party: team };
  }

  /**
   * Filter Pokédex by scope (generation range) using integrated data
   */
  filterByPokedexScope(scope) {
    const ranges = {
      gen1: { min: 1, max: 151 },
      gen2: { min: 152, max: 251 },
      gen3: { min: 252, max: 386 },
      "gen1-2": { min: 1, max: 251 },
      "gen1-3": { min: 1, max: 386 },
    };

    const range = ranges[scope] || ranges["gen1-3"];

    // Use integrated Pokedex instead of incomplete completePokedex
    return Object.values(integratedPokedex).filter(
      (pokemon) =>
        pokemon.dex_number >= range.min &&
        pokemon.dex_number <= range.max &&
        !pokemon.name.includes("Pokemon #") // Filter out remaining placeholders
    );
  }

  /**
   * Calculate team size based on trainer class, difficulty, and level
   */
  calculateTeamSize(trainerPrefs, difficultyMods, levelMin, levelMax) {
    const avgLevel = (levelMin + levelMax) / 2;
    let baseSize;

    // Base size from trainer class
    const [minSize, maxSize] = trainerPrefs.teamSizeRange;

    // More generous team size scaling to ensure interesting teams
    if (avgLevel <= 10) {
      baseSize = minSize; // Very early game: use minimum
    } else if (avgLevel <= 20) {
      baseSize = Math.max(minSize + 1, Math.ceil((minSize + maxSize) / 2)); // Early-mid: at least min+1
    } else if (avgLevel <= 35) {
      baseSize = Math.ceil((minSize + maxSize) / 2); // Mid game: use average
    } else {
      baseSize = maxSize; // Late game: use maximum
    }

    // Apply difficulty modifier
    const finalSize = Math.max(
      1,
      Math.min(6, baseSize + difficultyMods.teamSizeMod)
    );

    console.log(
      `[DEBUG] Team size: ${finalSize} (base: ${baseSize}, difficulty mod: ${difficultyMods.teamSizeMod})`
    );
    return finalSize;
  }

  /**
   * Get candidate Pokémon using enhanced biome integration
   */
  getCandidatePokemon(
    scopedPokedex,
    biome,
    trainerPrefs,
    trainerClass,
    battleStyle,
    gymType,
    levelMin,
    levelMax
  ) {
    console.log(
      `[DEBUG] Getting candidates for ${trainerClass} in ${biome} (${levelMin}-${levelMax})`
    );

    const avgLevel = (levelMin + levelMax) / 2;
    const maxBST = trainerPrefs.maxBST || 500;

    // Dynamic BST scaling based on level
    let levelAdjustedMaxBST = maxBST;
    if (avgLevel <= 15) {
      levelAdjustedMaxBST = Math.min(maxBST, 350); // Early game
    } else if (avgLevel <= 30) {
      levelAdjustedMaxBST = Math.min(maxBST, 450); // Mid game
    } else if (avgLevel <= 50) {
      levelAdjustedMaxBST = Math.min(maxBST, 550); // Late game
    }

    // Use enhanced biome integration for Pokemon selection
    const candidates = getPokemonForBiome(scopedPokedex, biome, {
      excludeStarters: true,
      excludeLegendaries: !["gym_leader", "elite_four", "champion"].includes(
        trainerClass
      ),
      maxBST: levelAdjustedMaxBST,
      preferredTiers: trainerPrefs.preferredTiers,
    });

    console.log(
      `🌍 Found ${candidates.length} Pokemon for biome ${biome} with BST <= ${levelAdjustedMaxBST}`
    );

    // Apply additional trainer class filtering
    let filteredCandidates = candidates.filter((pokemon) =>
      isPokemonAppropriateForTrainer(pokemon.name, levelMax, trainerClass)
    );

    // Apply type preferences if specified
    if (trainerPrefs.preferredTypes && trainerPrefs.preferredTypes.length > 0) {
      const typeFiltered = filteredCandidates.filter((pokemon) =>
        pokemon.types.some((type) => trainerPrefs.preferredTypes.includes(type))
      );
      if (typeFiltered.length > 0) {
        filteredCandidates = typeFiltered;
        console.log(`[Type Filter] ${filteredCandidates.length} candidates`);
      }
    }

    // Apply required types (for specialized trainers like Bug Catchers)
    if (trainerPrefs.requiredTypes && trainerPrefs.requiredTypes.length > 0) {
      filteredCandidates = filteredCandidates.filter((pokemon) =>
        pokemon.types.some((type) => trainerPrefs.requiredTypes.includes(type))
      );
      console.log(
        `⚡ Required type filtering: ${filteredCandidates.length} candidates`
      );
    }

    // Apply gym type if specified
    if (gymType) {
      filteredCandidates = filteredCandidates.filter((pokemon) =>
        pokemon.types.includes(gymType)
      );
      console.log(
        `🏛️ Gym type filtering: ${filteredCandidates.length} candidates`
      );
    }

    console.log(`[DEBUG] Final candidate count: ${filteredCandidates.length}`);

    // Emergency fallback if we have no candidates
    if (filteredCandidates.length === 0) {
      console.warn(`[Warning] No candidates found, using emergency fallback`);

      // Get safe basic Pokemon from any biome
      const emergencyPokemon = ["Rattata", "Pidgey", "Zigzagoon", "Poochyena"];
      for (const pokemon of scopedPokedex) {
        if (emergencyPokemon.includes(pokemon.name)) {
          filteredCandidates.push(getEnhancedPokemonData(pokemon));
        }
      }
    }

    return filteredCandidates;
  }

  /**
   * Filter candidates to only include Pokemon appropriate for the trainer class
   */
  filterForAppropriateEvolutionStages(candidates, trainerPrefs) {
    return candidates.filter((pokemon) => {
      // For trainers that prefer basic forms, only allow first stage Pokemon
      if (trainerPrefs.evolutionPreference === "basic") {
        return this.isFirstStageEvolution(pokemon.name);
      }

      // For trainers that prefer evolved forms, allow all stages but weight towards evolved
      if (trainerPrefs.evolutionPreference === "fully_evolved") {
        return true; // They can have any Pokemon, evolution will be handled later
      }

      // For "evolved" preference, allow first and second stages
      if (trainerPrefs.evolutionPreference === "evolved") {
        return !this.isThirdStageEvolution(pokemon.name);
      }

      return true;
    });
  }

  /**
   * Check if a Pokemon is in its first evolution stage
   */
  isFirstStageEvolution(pokemonName) {
    // Check if this Pokemon evolves FROM something (making it not first stage)
    for (const [baseName, evoData] of Object.entries(evolutionData)) {
      if (evoData.evolveTo === pokemonName) {
        return false; // This Pokemon evolves from something, so it's not first stage
      }
    }
    return true; // This Pokemon doesn't evolve from anything, so it's first stage
  }

  /**
   * Check if a Pokemon is in its third evolution stage
   */
  isThirdStageEvolution(pokemonName) {
    // Check if this Pokemon has a pre-evolution that also has a pre-evolution
    let preEvolutionCount = 0;
    let currentName = pokemonName;

    // Work backwards through evolution chain
    for (const [baseName, evoData] of Object.entries(evolutionData)) {
      if (evoData.evolveTo === currentName) {
        preEvolutionCount++;
        currentName = baseName;

        // Check if this Pokemon also has a pre-evolution
        for (const [checkBase, checkEvoData] of Object.entries(evolutionData)) {
          if (checkEvoData.evolveTo === currentName) {
            preEvolutionCount++;
            break;
          }
        }
        break;
      }
    }

    return preEvolutionCount >= 2; // Third stage if it has 2+ pre-evolutions
  }

  /**
   * CRITICAL: Check if a Pokemon is appropriate for the given level range
   */
  isPokemonAppropriateForLevel(pokemonName, levelMin, levelMax, trainerPrefs) {
    // First check: is this an evolved Pokemon?
    let evolveLevel = null;
    for (const [baseName, evoData] of Object.entries(evolutionData)) {
      if (evoData.evolveTo === pokemonName) {
        evolveLevel = evoData.requirement || 16;
        break;
      }
    }

    // If it's an evolved Pokemon, check level requirements
    if (evolveLevel !== null) {
      const avgLevel = (levelMin + levelMax) / 2;

      // For basic trainers, evolved Pokemon should only appear if they can naturally evolve at that level
      if (
        trainerPrefs.evolutionPreference === "basic" &&
        evolveLevel > levelMax
      ) {
        console.log(
          `🚫 Rejecting ${pokemonName} (evolves at ${evolveLevel}) for basic trainer max level ${levelMax}`
        );
        return false;
      }

      // For all trainers, heavily penalize Pokemon that evolve much later than their level range
      if (evolveLevel > avgLevel + 5) {
        console.log(
          `🚫 Rejecting ${pokemonName} (evolves at ${evolveLevel}) for trainer avg level ${avgLevel}`
        );
        return false;
      }
    }

    return true;
  }

  /**
   * Additional constraint: Filter out Pokemon that are inappropriate for trainer level
   */
  filterCandidatesByTrainerLevel(candidates, trainerPrefs, levelMin, levelMax) {
    const avgLevel = (levelMin + levelMax) / 2;

    return candidates.filter((pokemon) => {
      // Check if this Pokemon is an evolution that happens too late for this trainer
      for (const [baseName, evoData] of Object.entries(evolutionData)) {
        if (evoData.evolveTo === pokemon.name) {
          const evolutionLevel = evoData.requirement || 16;

          // Very strict filtering for basic trainer classes
          if (trainerPrefs.evolutionPreference === "basic") {
            if (evolutionLevel > levelMax) {
              console.log(
                `🚫 Excluding ${pokemon.name} (evolves at ${evolutionLevel}) for basic trainer level ${levelMax}`
              );
              return false;
            }
          }
          // More lenient for evolved trainers
          else if (trainerPrefs.evolutionPreference === "evolved") {
            if (evolutionLevel > avgLevel + 10) {
              console.log(
                `🚫 Excluding ${pokemon.name} (evolves at ${evolutionLevel}) for evolved trainer level ${avgLevel}`
              );
              return false;
            }
          }
        }
      }

      // Special check for pseudo-legendaries like Metagross that evolve very late
      if (isPseudoLegendary(pokemon.name) && avgLevel < 50) {
        console.log(
          `🚫 Excluding pseudo-legendary ${pokemon.name} for low-level trainer (${avgLevel})`
        );
        return false;
      }

      return true;
    });
  }

  /**
   * Generate a single team member with proper evolution and moveset handling
   */
  generateTeamMember(
    candidates,
    usedSpecies,
    levelMin,
    levelMax,
    trainerPrefs,
    difficultyMods,
    battleStyle,
    trainerClass
  ) {
    // Filter out used species for variety
    const availableCandidates = candidates.filter(
      (pokemon) => !usedSpecies.has(pokemon.name)
    );
    const finalCandidates =
      availableCandidates.length > 0 ? availableCandidates : candidates;

    if (finalCandidates.length === 0) return null;

    // Enhanced selection with BST and tier weighting
    const selectedPokemon = this.selectWeightedCandidate(
      finalCandidates,
      levelMin,
      levelMax,
      trainerPrefs
    );

    // Generate level within range (with strict adherence)
    let level =
      Math.floor(Math.random() * (levelMax - levelMin + 1)) + levelMin;

    // For low-level trainers, ensure we don't accidentally create overleveled Pokemon
    if (levelMax <= 20 && level > levelMax) {
      level = levelMax;
    }

    // Ensure level is never below minimum or above maximum
    level = Math.max(levelMin, Math.min(levelMax, level));

    // Step 1: Determine the appropriate evolution form for this level and trainer class
    const evolutionResult = getAppropriateForm(
      selectedPokemon.name,
      level,
      trainerClass
    );
    const finalPokemon =
      Object.values(integratedPokedex).find(
        (p) => p.name === evolutionResult.pokemon
      ) || selectedPokemon;

    // Step 2: Generate appropriate moveset
    const moves = this.generateAccurateMoveset(
      finalPokemon,
      level,
      battleStyle
    );

    console.log(
      `🎲 Generated: ${finalPokemon.name} (Lv.${level})${
        evolutionResult.evolved ? ` [EVOLVED from ${selectedPokemon.name}]` : ""
      } with moves: ${moves.join(", ")}`
    );

    return {
      species: finalPokemon.name,
      originalSpecies: selectedPokemon.name, // Track for avoiding duplicates
      level: level,
      types: finalPokemon.types,
      dex_number: finalPokemon.dex_number,
      base_stats: finalPokemon.baseStats,
      abilities: finalPokemon.abilities || ["Unknown"],
      ability: (finalPokemon.abilities || ["Unknown"])[0],
      moves: moves,
      item: null,
      evolutionAdjusted: evolutionResult.evolved,
      evolutionPath: evolutionResult.evolutionPath,
    };
  }

  /**
   * Determine the appropriate evolution stage for a Pokémon at a given level
   */
  determineAppropriateEvolution(
    pokemonName,
    level,
    trainerPrefs,
    difficultyMods
  ) {
    let currentPokemon = Object.values(completePokedex).find(
      (p) => p.name === pokemonName
    );
    if (!currentPokemon) {
      return { pokemon: currentPokemon, evolved: false, path: [] };
    }

    const evolutionPath = [pokemonName];
    let evolved = false;

    // Check evolution preference
    const evolutionBonus = difficultyMods.evolutionMod;
    const effectiveLevel = level + evolutionBonus;

    // Follow evolution chain forward if level allows
    let current = pokemonName;
    while (evolutionData[current] && evolutionData[current].evolveTo) {
      const evoData = evolutionData[current];
      const nextForm = evoData.evolveTo;

      // Check if we can evolve based on level and method
      let canEvolve = false;

      if (evoData.method === evolutionMethods.LEVEL) {
        canEvolve = effectiveLevel >= evoData.requirement;
      } else if (evoData.method === evolutionMethods.STONE) {
        // Stone evolutions available at level 20+ for most trainers
        canEvolve = effectiveLevel >= 20;
      } else if (evoData.method === evolutionMethods.TRADE) {
        // Trade evolutions for higher level trainers
        canEvolve = effectiveLevel >= 30;
      } else {
        // Other methods (friendship, etc.) available at level 25+
        canEvolve = effectiveLevel >= 25;
      }

      // Apply trainer evolution preference
      if (trainerPrefs.evolutionPreference === "basic") {
        canEvolve = false; // Stay basic form
      } else if (trainerPrefs.evolutionPreference === "evolved" && !canEvolve) {
        break; // Don't force evolution if not naturally possible
      }

      // Additional constraint: Don't evolve if trainer is too low level for the evolution
      if (canEvolve && trainerPrefs.maxLevel) {
        const requiredLevel = evoData.requirement || 16;
        if (requiredLevel > trainerPrefs.maxLevel) {
          canEvolve = false; // Trainer class can't handle this evolution level
        }
      }

      if (canEvolve) {
        const nextPokemon = Object.values(completePokedex).find(
          (p) => p.name === nextForm
        );
        if (nextPokemon) {
          current = nextForm;
          currentPokemon = nextPokemon;
          evolutionPath.push(nextForm);
          evolved = true;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return {
      pokemon: currentPokemon,
      evolved: evolved,
      path: evolutionPath,
    };
  }

  /**
   * Generate accurate moveset based on authentic Gen 3 learnsets
   */
  generateAccurateMoveset(pokemon, level, battleStyle = "Balanced") {
    // First, try to get authentic moveset from our Gen 3 learnsets
    if (pokemon.dex_number && getAuthenticMoveset) {
      try {
        const authenticMoves = getAuthenticMoveset(
          pokemon.dex_number,
          level,
          "trainer"
        );
        if (authenticMoves && authenticMoves.length > 0) {
          console.log(
            `[DEBUG] Using authentic moveset for ${
              pokemon.name
            }: ${authenticMoves.join(", ")}`
          );
          return authenticMoves.slice(0, 4); // Limit to 4 moves
        }
      } catch (error) {
        console.warn(
          `Failed to get authentic moveset for ${pokemon.name}:`,
          error
        );
      }
    }

    // Fallback to legacy moveset system if available
    if (pokemon.movesets && pokemon.movesets.levelUp) {
      const availableMoves = [];

      // Collect all moves learned up to this level
      for (const moveLevel of pokemon.movesets.levelUp) {
        if (moveLevel.level <= level) {
          availableMoves.push(...moveLevel.moves);
        }
      }

      // Remove duplicates
      const uniqueMoves = [...new Set(availableMoves)];

      // Apply battle style weighting if we have enough moves
      if (uniqueMoves.length >= 4) {
        const weightedMoves = this.applyBattleStyleWeighting(
          uniqueMoves,
          battleStyle
        );
        return weightedMoves.slice(0, 4);
      }

      // If not enough moves, take what we have and fill with appropriate moves
      const finalMoves = uniqueMoves.slice(-4);

      if (finalMoves.length > 0) {
        // Fill remaining slots with battle style appropriate moves
        while (finalMoves.length < 4) {
          const fillMoves = this.generateFallbackMoves(pokemon, battleStyle);
          for (const move of fillMoves) {
            if (!finalMoves.includes(move) && finalMoves.length < 4) {
              finalMoves.push(move);
            }
          }
          break; // Prevent infinite loop
        }
        return finalMoves;
      }
    }

    // Final fallback to basic moves
    console.log(
      `[Warning] Using fallback moves for ${pokemon.name} level ${level}`
    );
    return this.generateFallbackMoves(pokemon, battleStyle);
  }

  /**
   * Apply battle style weighting to move selection
   */
  applyBattleStyleWeighting(availableMoves, battleStyle) {
    const stylePrefs =
      this.battleStylePreferences[battleStyle] ||
      this.battleStylePreferences["Balanced"];
    const { movePreferences } = stylePrefs;

    const categorizedMoves = {
      aggressive: [],
      defensive: [],
      status: [],
      other: [],
    };

    // Categorize available moves
    availableMoves.forEach((move) => {
      if (this.moveCategories.aggressive.includes(move)) {
        categorizedMoves.aggressive.push(move);
      } else if (this.moveCategories.defensive.includes(move)) {
        categorizedMoves.defensive.push(move);
      } else if (this.moveCategories.status.includes(move)) {
        categorizedMoves.status.push(move);
      } else {
        categorizedMoves.other.push(move);
      }
    });

    const selectedMoves = [];

    // Select moves based on battle style preferences
    const aggressiveCount = Math.floor(4 * movePreferences.aggressive);
    const defensiveCount = Math.floor(4 * movePreferences.defensive);
    const statusCount = Math.floor(4 * movePreferences.status);
    const otherCount = 4 - aggressiveCount - defensiveCount - statusCount;

    // Add aggressive moves
    this.addRandomMovesFromCategory(
      selectedMoves,
      categorizedMoves.aggressive,
      aggressiveCount
    );

    // Add defensive moves
    this.addRandomMovesFromCategory(
      selectedMoves,
      categorizedMoves.defensive,
      defensiveCount
    );

    // Add status moves
    this.addRandomMovesFromCategory(
      selectedMoves,
      categorizedMoves.status,
      statusCount
    );

    // Fill remaining slots with other moves or any available moves
    this.addRandomMovesFromCategory(
      selectedMoves,
      categorizedMoves.other,
      otherCount
    );

    // If we still need moves, add from any category
    const allRemaining = [
      ...categorizedMoves.aggressive,
      ...categorizedMoves.defensive,
      ...categorizedMoves.status,
      ...categorizedMoves.other,
    ].filter((move) => !selectedMoves.includes(move));

    while (selectedMoves.length < 4 && allRemaining.length > 0) {
      const randomMove =
        allRemaining[Math.floor(Math.random() * allRemaining.length)];
      selectedMoves.push(randomMove);
      allRemaining.splice(allRemaining.indexOf(randomMove), 1);
    }

    return selectedMoves;
  }

  /**
   * Helper method to add random moves from a category
   */
  addRandomMovesFromCategory(selectedMoves, categoryMoves, count) {
    const availableMoves = categoryMoves.filter(
      (move) => !selectedMoves.includes(move)
    );
    for (let i = 0; i < count && availableMoves.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableMoves.length);
      selectedMoves.push(availableMoves[randomIndex]);
      availableMoves.splice(randomIndex, 1);
    }
  }

  /**
   * Generate fallback moves when moveset data is unavailable
   */
  generateFallbackMoves(pokemon, battleStyle = "Balanced") {
    const stylePrefs =
      this.battleStylePreferences[battleStyle] ||
      this.battleStylePreferences["Balanced"];
    const { movePreferences } = stylePrefs;

    const moves = [];

    // Add type-based STAB moves (these are generally aggressive)
    const stabMoves = [];
    if (pokemon.types.includes("Normal")) stabMoves.push("Tackle");
    if (pokemon.types.includes("Fire")) stabMoves.push("Ember");
    if (pokemon.types.includes("Water")) stabMoves.push("Water Gun");
    if (pokemon.types.includes("Electric")) stabMoves.push("Thunder Shock");
    if (pokemon.types.includes("Grass")) stabMoves.push("Absorb");
    if (pokemon.types.includes("Psychic")) stabMoves.push("Confusion");
    if (pokemon.types.includes("Fighting")) stabMoves.push("Low Kick");
    if (pokemon.types.includes("Flying")) stabMoves.push("Peck");
    if (pokemon.types.includes("Bug")) stabMoves.push("Tackle");
    if (pokemon.types.includes("Rock")) stabMoves.push("Rock Throw");
    if (pokemon.types.includes("Ground")) stabMoves.push("Mud Shot");
    if (pokemon.types.includes("Steel")) stabMoves.push("Metal Claw");
    if (pokemon.types.includes("Ghost")) stabMoves.push("Lick");
    if (pokemon.types.includes("Dark")) stabMoves.push("Bite");
    if (pokemon.types.includes("Dragon")) stabMoves.push("Dragon Rage");
    if (pokemon.types.includes("Ice")) stabMoves.push("Powder Snow");
    if (pokemon.types.includes("Poison")) stabMoves.push("Poison Sting");

    // Determine move distribution based on battle style
    const aggressiveSlots = Math.max(
      1,
      Math.floor(4 * movePreferences.aggressive)
    );
    const defensiveSlots = Math.floor(4 * movePreferences.defensive);
    const statusSlots = Math.floor(4 * movePreferences.status);

    // Add STAB moves (aggressive)
    moves.push(...stabMoves.slice(0, aggressiveSlots));

    // Add defensive moves if style prefers them
    if (defensiveSlots > 0) {
      const defensiveMoves = ["Defense Curl", "Protect", "Harden"];
      moves.push(...defensiveMoves.slice(0, defensiveSlots));
    }

    // Add status moves if style prefers them
    if (statusSlots > 0) {
      const statusMoves = ["Growl", "Leer", "Sand Attack"];
      moves.push(...statusMoves.slice(0, statusSlots));
    }

    // Fill remaining slots with basic moves
    const basicMoves = ["Tackle", "Quick Attack"];
    while (moves.length < 4) {
      for (const move of basicMoves) {
        if (!moves.includes(move) && moves.length < 4) {
          moves.push(move);
        }
      }
      if (moves.length < 4) {
        moves.push("Tackle"); // Ultimate fallback
      }
    }

    return moves.slice(0, 4);
  }

  /**
   * Select a Pokemon candidate using weighted selection based on BST and tier
   */
  selectWeightedCandidate(candidates, levelMin, levelMax, trainerPrefs) {
    const avgLevel = (levelMin + levelMax) / 2;

    // Create weighted candidates array
    const weightedCandidates = candidates.map((pokemon) => {
      let weight = 1.0;
      const encounterData = pokemon.encounterData;

      // Tier-based weighting
      if (encounterData.tier === "common") {
        weight *= avgLevel <= 15 ? 3.0 : 2.0; // Favor common for early game
      } else if (encounterData.tier === "uncommon") {
        weight *= avgLevel <= 30 ? 2.0 : 2.5; // Good for mid game
      } else if (encounterData.tier === "rare") {
        weight *= avgLevel >= 25 ? 2.0 : 0.5; // Rare for late game
      }

      // BST appropriateness weighting
      const bst = encounterData.bst || 300;
      const expectedBST = Math.min(300 + avgLevel * 5, 600); // Scale expected BST with level

      const bstDiff = Math.abs(bst - expectedBST);
      if (bstDiff <= 50) {
        weight *= 1.5; // Perfect BST range
      } else if (bstDiff <= 100) {
        weight *= 1.0; // Acceptable range
      } else {
        weight *= 0.3; // Outside ideal range
      }

      // Trainer class preference weighting
      if (
        trainerPrefs.preferredTiers &&
        trainerPrefs.preferredTiers.includes(encounterData.tier)
      ) {
        weight *= 1.5;
      }

      return { pokemon, weight };
    });

    // Weighted random selection
    const totalWeight = weightedCandidates.reduce(
      (sum, item) => sum + item.weight,
      0
    );
    let random = Math.random() * totalWeight;

    for (const item of weightedCandidates) {
      random -= item.weight;
      if (random <= 0) {
        return item.pokemon;
      }
    }

    // Fallback to first candidate
    return weightedCandidates[0].pokemon;
  }

  // Legacy method for backwards compatibility
  generateRealisticTeam(options = {}) {
    console.log(
      "🔄 Legacy generateRealisticTeam called, forwarding to generateEnhancedTeam"
    );
    return this.generateEnhancedTeam(options);
  }
}

const gen3TeamGenerator = new Gen3TeamGenerator();

export default gen3TeamGenerator;
export { Gen3TeamGenerator };
