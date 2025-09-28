/**
 * Improved Pokemon Team Generator
 * Fixes generation scope, evolution logic, and biome filtering issues
 */

import { evolutionData, getCompleteMoveset } from "../data/completePokedex.js";
import {
  getAuthenticMoveset,
  hasAuthenticData,
} from "../data/gen3AuthoritativeLearnsets.js";
import {
  getPokemonSprite,
  integratedPokedex,
} from "../data/integratedPokedex.js";
import { PokemonQueryService } from "../data/pokemonQueryService.js";

class ImprovedTeamGenerator {
  constructor() {
    this.queryService = new PokemonQueryService(integratedPokedex);

    // Debug: Check if evolutionData is available
    // Debug logging disabled for performance
    // console.log('ImprovedTeamGenerator: evolutionData available:', !!evolutionData);
    // console.log('ImprovedTeamGenerator: Sample evolution entries:', Object.keys(evolutionData).slice(0, 5));

    // Trainer class definitions with proper biome and generation constraints
    this.trainerClasses = {
      Youngster: {
        preferredTypes: ["Normal", "Fighting"],
        teamSizeRange: [2, 3],
        levelRange: [10, 15],
        excludeLegendaries: true,
        excludeEvolved: true, // Youngsters should have basic Pokemon
        preferredBiomes: ["Grassland", "Plains", "Route"],
        baseStatRange: [250, 300], // Only placeholder Pokemon (most have 300 BST in our data)
        avoidSpecialEvolutions: true, // No trade/stone/happiness evos at low levels
      },
      "Bug Catcher": {
        requiredTypes: ["Bug"],
        teamSizeRange: [2, 4],
        levelRange: [8, 20],
        excludeLegendaries: true,
        allowEvolved: true, // Bug catchers can have evolved bugs at higher levels
        preferredBiomes: ["Forest", "Plains", "Grassland"],
        baseStatRange: [250, 310], // Placeholder Pokemon plus some with real stats
        avoidSpecialEvolutions: true,
      },
      Lass: {
        preferredTypes: ["Normal", "Fairy", "Psychic"],
        teamSizeRange: [2, 3],
        levelRange: [10, 18],
        excludeLegendaries: true,
        allowEvolved: true,
        preferredBiomes: ["Grassland", "Plains", "Urban"],
        baseStatRange: [250, 310], // Placeholder Pokemon plus some with real stats
        avoidSpecialEvolutions: true,
      },
      Hiker: {
        preferredTypes: ["Rock", "Ground", "Fighting"],
        teamSizeRange: [2, 4],
        levelRange: [15, 30],
        excludeLegendaries: true,
        allowEvolved: true,
        preferredBiomes: ["Mountain", "Cave", "Desert"],
        baseStatRange: [300, 430], // Placeholder to starter final evolution level
        avoidSpecialEvolutions: false, // Hikers can have some special evos
      },
      Fisherman: {
        requiredTypes: ["Water"],
        teamSizeRange: [2, 5],
        levelRange: [12, 25],
        excludeLegendaries: true,
        allowEvolved: true,
        preferredBiomes: ["Water", "Beach", "Freshwater"], // Water-based locations only
        baseStatRange: [290, 320], // Mostly placeholder Pokemon
        avoidSpecialEvolutions: true,
      },
      Sailor: {
        preferredTypes: ["Water", "Fighting"],
        teamSizeRange: [2, 4],
        levelRange: [15, 30],
        excludeLegendaries: true,
        allowEvolved: true,
        preferredBiomes: ["Water", "Beach", "Freshwater", "Grassland"], // Near water access
        baseStatRange: [300, 430], // Placeholder to starter final evolution level
        avoidSpecialEvolutions: false,
      },
      Psychic: {
        requiredTypes: ["Psychic"],
        teamSizeRange: [2, 4],
        levelRange: [20, 40],
        excludeLegendaries: true,
        allowEvolved: true,
        preferredBiomes: ["Urban", "Mystical", "Grassland", "Forest"],
        baseStatRange: [300, 450], // Placeholder to strong real stats
        avoidSpecialEvolutions: false,
      },
      "Ace Trainer": {
        preferredTypes: null, // No type restrictions - diverse teams
        teamSizeRange: [4, 6],
        levelRange: [25, 45],
        excludeLegendaries: true,
        allowEvolved: true,
        preferredBiomes: ["Urban", "Plains", "Mountain", "Forest"],
        baseStatRange: [310, 500], // Real stats and above - skilled trainers
        avoidSpecialEvolutions: false,
      },
      "Gym Leader": {
        requiredTypes: null, // Will be set per gym
        teamSizeRange: [3, 6],
        levelRange: [20, 60],
        excludeLegendaries: false, // Gym leaders can have pseudo-legendaries
        allowEvolved: true,
        preferredBiomes: ["Urban", "Gym"],
        baseStatRange: [350, 700], // Strong real stats and above - elite trainers
        avoidSpecialEvolutions: false,
        allowPseudoLegendaries: true,
      },
      "Elite Four": {
        requiredTypes: null, // Will be set per E4 member
        teamSizeRange: [4, 6],
        levelRange: [45, 70],
        excludeLegendaries: false,
        allowEvolved: true,
        preferredBiomes: ["Elite", "Championship"],
        baseStatRange: [400, 750], // Championship level - only the strongest
        avoidSpecialEvolutions: false,
        allowPseudoLegendaries: true,
        allowLegendaries: false, // Still no true legendaries
      },
    };
  }

  /**
   * Generate a team with proper generation scope and evolution handling
   */
  generateTeam({
    trainerClass = "Youngster",
    levelMin = 10,
    levelMax = 15,
    biome = "Grassland",
    biomes = null, // Support multiple biomes
    difficulty = "Medium",
    battleStyle = "Balanced",
    pokedexScope = "gen3", // Fixed: respect the scope properly
  } = {}) {
    // Use biomes array if provided, otherwise use single biome
    let targetBiomes =
      biomes && Array.isArray(biomes) && biomes.length > 0 ? biomes : [biome];

    // Validate biome compatibility with trainer class
    const trainerPrefs =
      this.trainerClasses[trainerClass] || this.trainerClasses["Youngster"];
    targetBiomes = this.validateBiomeCompatibility(
      trainerClass,
      targetBiomes,
      trainerPrefs
    );

    if (process.env.NODE_ENV === "development") {
      console.log(
        `Generating ${trainerClass} team in ${targetBiomes.join(
          ", "
        )} (${levelMin}-${levelMax}) - Scope: ${pokedexScope}`
      );
    }

    // Calculate team size
    const teamSize = this.calculateTeamSize(trainerPrefs, levelMin, levelMax);

    // Get appropriate Pokemon based on scope and biomes
    const candidates = this.getCandidatePokemon(
      pokedexScope,
      targetBiomes,
      { ...trainerPrefs, trainerClass },
      levelMin,
      levelMax
    );

    if (candidates.length === 0) {
      console.warn(
        `No candidates found for ${trainerClass} in ${targetBiomes.join(
          ", "
        )} with scope ${pokedexScope}`
      );
      // Fall back to broader search with expanded biomes
      return this.generateFallbackTeam(
        trainerClass,
        levelMin,
        levelMax,
        teamSize,
        targetBiomes,
        pokedexScope
      );
    }

    console.log(`Found ${candidates.length} candidate Pokemon`);

    // Generate team members with type diversity and 10% "spice" chance
    const team = [];
    const usedPokemon = new Set();
    const usedTypes = new Set(); // Track types for diversity

    // Pre-calculate off-biome candidates for "spice" system
    const spiceCandidates = this.getSpiceCandidates(
      pokedexScope,
      targetBiomes,
      { ...trainerPrefs, trainerClass },
      levelMin,
      levelMax
    );

    for (let i = 0; i < teamSize; i++) {
      // 10% chance to use an off-biome "spice" Pokemon for unpredictability
      const useSpice = Math.random() < 0.1 && spiceCandidates.length > 0;
      const candidatePool = useSpice ? spiceCandidates : candidates;

      if (useSpice) {
        console.log(
          `[Spice] Adding spice Pokemon from off-biome pool (${spiceCandidates.length} options)`
        );
      }

      const member = this.generateTeamMember(
        candidatePool,
        usedPokemon,
        levelMin,
        levelMax,
        trainerPrefs,
        usedTypes,
        useSpice
      );
      if (member) {
        team.push(member);
        usedPokemon.add(member.species); // Fixed: use species property
        // Track primary type for diversity
        if (member.types && member.types.length > 0) {
          usedTypes.add(member.types[0]);
        }
      }
    }

    console.log(`Generated team with ${team.length} Pokemon`);

    const result = {
      trainerClass,
      biome,
      team,
      metadata: {
        scope: pokedexScope,
        difficulty,
        battleStyle,
        biomes: targetBiomes,
        originalBiomes: biomes || [biome],
        generatedAt: new Date().toISOString(),
      },
    };

    console.log("ImprovedTeamGenerator returning:", {
      teamLength: result.team.length,
      teamStructure: result.team.map((member) => ({
        species: member.species,
        level: member.level,
        types: member.types,
        hasRequiredProps: {
          species: Boolean(member.species),
          level: Boolean(member.level),
          types: Boolean(member.types),
          moves: Boolean(member.moves),
        },
      })),
    });

    return result;
  }

  /**
   * Get candidate Pokemon with proper filtering
   */
  getCandidatePokemon(
    pokedexScope,
    targetBiomes,
    trainerPrefs,
    levelMin,
    levelMax
  ) {
    // Parse generation scope
    const allowedGenerations = this.parsePokedexScope(pokedexScope);
    console.log(`Allowed generations: ${allowedGenerations.join(", ")}`);

    const candidates = [];

    // Get Pokemon from allowed generations
    allowedGenerations.forEach((gen) => {
      const genPokemon = this.queryService.getPokemonByGeneration(gen, {
        excludeLegendaries: trainerPrefs.excludeLegendaries,
      });
      console.log(
        `Generation ${gen}: ${genPokemon.length} Pokemon (${genPokemon
          .slice(0, 5)
          .join(", ")}...)`
      );
      candidates.push(...genPokemon);
    });

    console.log(`Found ${candidates.length} Pokemon in scope ${pokedexScope}`);

    // Filter by biomes (support multiple biomes)
    const biomeCandidates = candidates.filter((dexNum) => {
      const pokemon = this.queryService.getPokemonData(dexNum);
      if (!pokemon || !pokemon.biomes) return false;

      // Check if Pokemon exists in any of the target biomes
      return targetBiomes.some((biome) => pokemon.biomes.includes(biome));
    });

    console.log(
      `Found ${biomeCandidates.length} Pokemon in biomes: ${targetBiomes.join(
        ", "
      )}`
    );

    // Apply trainer type preferences
    let filteredCandidates = biomeCandidates.filter((dexNum) => {
      const pokemon = this.queryService.getPokemonData(dexNum);
      if (!pokemon) return false;

      // Required types (must have at least one)
      if (trainerPrefs.requiredTypes) {
        const hasRequiredType = pokemon.types.some((type) =>
          trainerPrefs.requiredTypes.includes(type)
        );
        if (!hasRequiredType) return false;
      }

      // Preferred types (bonus but not required)
      if (trainerPrefs.preferredTypes && !trainerPrefs.requiredTypes) {
        const hasPreferredType = pokemon.types.some((type) =>
          trainerPrefs.preferredTypes.includes(type)
        );
        if (!hasPreferredType) return false;
      }

      return true;
    });

    console.log(`After type filtering: ${filteredCandidates.length} Pokemon`);

    // Apply base stat total filtering
    if (trainerPrefs.baseStatRange) {
      const originalCount = filteredCandidates.length;
      filteredCandidates = filteredCandidates.filter((dexNum) => {
        const pokemon = this.queryService.getPokemonData(dexNum);
        return pokemon && this.isPokemonWithinBSTRange(pokemon, trainerPrefs);
      });
      console.log(
        `After BST filtering (${trainerPrefs.baseStatRange[0]}-${
          trainerPrefs.baseStatRange[1]
        }): ${filteredCandidates.length} Pokemon (filtered out ${
          originalCount - filteredCandidates.length
        })`
      );
    }

    // Apply evolution method realism filtering
    if (trainerPrefs.avoidSpecialEvolutions) {
      const averageLevel = (levelMin + levelMax) / 2;
      const originalCount = filteredCandidates.length;
      filteredCandidates = filteredCandidates.filter((dexNum) => {
        const pokemon = this.queryService.getPokemonData(dexNum);
        if (!pokemon) return false;

        // Check if this evolution method is realistic for this trainer/level
        const hasUnrealistic = this.hasUnrealisticEvolutionMethod(
          pokemon,
          averageLevel,
          trainerPrefs.trainerClass
        );
        return !hasUnrealistic;
      });
      console.log(
        `After evolution realism filtering: ${
          filteredCandidates.length
        } Pokemon (filtered out ${
          originalCount - filteredCandidates.length
        } unrealistic evolutions)`
      );
    }

    // Apply evolution restrictions
    if (trainerPrefs.excludeEvolved) {
      filteredCandidates = filteredCandidates.filter((dexNum) => {
        const pokemon = this.queryService.getPokemonData(dexNum);
        return (
          pokemon &&
          (!pokemon.evolutionLine || pokemon.evolutionLine.stage === 1)
        );
      });
      console.log(
        `After evolution filtering: ${filteredCandidates.length} Pokemon`
      );
    }

    return filteredCandidates
      .map((dexNum) => this.queryService.getPokemonData(dexNum))
      .filter((p) => p);
  }

  /**
   * Parse pokedex scope into generation numbers
   */
  parsePokedexScope(scope) {
    const scopeMap = {
      gen1: [1],
      Gen1: [1],
      gen2: [2],
      Gen2: [2],
      gen3: [3],
      Gen3: [3],
      "gen1-2": [1, 2],
      "gen1-3": [1, 2, 3],
      all: [1, 2, 3],
      All: [1, 2, 3],
    };

    return scopeMap[scope] || [1, 2, 3];
  }

  /**
   * Get "spice" candidates - Pokemon from the generation that don't match biome but match trainer type preferences
   */
  getSpiceCandidates(
    pokedexScope,
    targetBiomes,
    trainerPrefs,
    levelMin,
    levelMax
  ) {
    // Parse generation scope
    const allowedGenerations = this.parsePokedexScope(pokedexScope);

    const candidates = [];

    // Get Pokemon from allowed generations
    allowedGenerations.forEach((gen) => {
      const genPokemon = this.queryService.getPokemonByGeneration(gen, {
        excludeLegendaries: trainerPrefs.excludeLegendaries,
      });
      candidates.push(...genPokemon);
    });

    // Filter to Pokemon that DON'T match the target biomes (off-biome spice)
    const offBiomeCandidates = candidates.filter((dexNum) => {
      const pokemon = this.queryService.getPokemonData(dexNum);
      if (!pokemon || !pokemon.biomes) return false;

      // Only include Pokemon that don't exist in any of the target biomes
      const hasTargetBiome = targetBiomes.some((biome) =>
        pokemon.biomes.includes(biome)
      );
      return !hasTargetBiome;
    });

    // Apply trainer type preferences to spice candidates
    let filteredSpice = offBiomeCandidates.filter((dexNum) => {
      const pokemon = this.queryService.getPokemonData(dexNum);
      if (!pokemon) return false;

      // Required types (must have at least one)
      if (trainerPrefs.requiredTypes) {
        const hasRequiredType = pokemon.types.some((type) =>
          trainerPrefs.requiredTypes.includes(type)
        );
        if (!hasRequiredType) return false;
      }

      // Preferred types (bonus but not required for spice - adds more variety)
      if (trainerPrefs.preferredTypes && !trainerPrefs.requiredTypes) {
        const hasPreferredType = pokemon.types.some((type) =>
          trainerPrefs.preferredTypes.includes(type)
        );
        // For spice, allow 50% chance to ignore preferred types for more variety
        if (!hasPreferredType && Math.random() < 0.5) return false;
      }

      return true;
    });

    // Apply base stat total filtering (same as regular candidates)
    if (trainerPrefs.baseStatRange) {
      filteredSpice = filteredSpice.filter((dexNum) => {
        const pokemon = this.queryService.getPokemonData(dexNum);
        return pokemon && this.isPokemonWithinBSTRange(pokemon, trainerPrefs);
      });
    }

    // Apply evolution method realism filtering (same as regular candidates)
    if (trainerPrefs.avoidSpecialEvolutions) {
      const averageLevel = (levelMin + levelMax) / 2;
      filteredSpice = filteredSpice.filter((dexNum) => {
        const pokemon = this.queryService.getPokemonData(dexNum);
        if (!pokemon) return false;

        const hasUnrealistic = this.hasUnrealisticEvolutionMethod(
          pokemon,
          averageLevel,
          trainerPrefs.trainerClass
        );
        return !hasUnrealistic;
      });
    }

    // Apply evolution restrictions
    if (trainerPrefs.excludeEvolved) {
      filteredSpice = filteredSpice.filter((dexNum) => {
        const pokemon = this.queryService.getPokemonData(dexNum);
        return (
          pokemon &&
          (!pokemon.evolutionLine || pokemon.evolutionLine.stage === 1)
        );
      });
    }

    console.log(
      `[Spice] Found ${
        filteredSpice.length
      } spice candidates (off-biome: ${targetBiomes.join(", ")})`
    );

    return filteredSpice
      .map((dexNum) => this.queryService.getPokemonData(dexNum))
      .filter((p) => p);
  }

  /**
   * Generate a single team member with appropriate evolution and type diversity
   */
  generateTeamMember(
    candidates,
    usedPokemon,
    levelMin,
    levelMax,
    trainerPrefs,
    usedTypes = new Set(),
    isSpice = false
  ) {
    // Filter out already used Pokemon
    let availableCandidates = candidates.filter(
      (pokemon) => !usedPokemon.has(pokemon.name)
    );

    // If we have used types, prefer Pokemon with different primary types for diversity
    if (usedTypes.size > 0 && availableCandidates.length > 3) {
      const diversePool = availableCandidates.filter(
        (pokemon) =>
          pokemon.types &&
          pokemon.types.length > 0 &&
          !usedTypes.has(pokemon.types[0])
      );
      if (diversePool.length > 0) {
        availableCandidates = diversePool;
      }
    }

    if (availableCandidates.length === 0) {
      console.warn("No available candidates remaining");
      return null;
    }

    // Select random Pokemon
    const selectedPokemon =
      availableCandidates[
        Math.floor(Math.random() * availableCandidates.length)
      ];

    // Calculate level
    const level =
      Math.floor(Math.random() * (levelMax - levelMin + 1)) + levelMin;

    // Determine appropriate evolution for the level
    const appropriatePokemon = this.getAppropriateEvolution(
      selectedPokemon,
      level,
      trainerPrefs
    );

    // Generate moveset
    const moves = this.generateMoveset(appropriatePokemon, level, trainerClass);

    const spiceIndicator = isSpice ? " [SPICE]" : "";
    console.log(
      `Generated ${appropriatePokemon.name} (dex ${appropriatePokemon.dex_number}) at level ${level} from original ${selectedPokemon.name}${spiceIndicator}`
    );

    // Determine role based on primary type and stats
    const role = this.determineRole(appropriatePokemon);

    // Select primary ability
    const primaryAbility =
      appropriatePokemon.abilities && appropriatePokemon.abilities.length > 0
        ? appropriatePokemon.abilities[0]
        : "Unknown";

    // Generate reasoning
    const reasoning = this.generateReasoning(
      appropriatePokemon,
      level,
      role,
      primaryAbility
    );

    return {
      species: appropriatePokemon.name, // Changed from 'name' to 'species'
      level: level,
      types: appropriatePokemon.types,
      sprite: getPokemonSprite(appropriatePokemon.dex_number),
      moves: moves,
      abilities: appropriatePokemon.abilities || [], // Keep array for compatibility
      ability: primaryAbility, // Single ability for modal display
      baseStats: appropriatePokemon.baseStats || {}, // Fixed: use camelCase for UI compatibility
      dex_number: appropriatePokemon.dex_number,
      role: role, // Added role
      item: null, // Added item (can be enhanced later)
      reasoning: reasoning, // Added reasoning
    };
  }

  /**
   * Get appropriate evolution based on level and trainer preferences
   */
  getAppropriateEvolution(pokemon, level, trainerPrefs) {
    console.log(
      `Getting appropriate evolution for ${pokemon.name} at level ${level}`
    );

    // First, ALWAYS check if this Pokemon is too evolved for the given level
    // This happens regardless of trainer preferences because it's about game logic
    const demotedPokemon = this.demoteToAppropriateLevel(pokemon, level);
    console.log(`After demotion check: ${demotedPokemon.name}`);

    // Then, check if the demoted Pokemon should evolve UP to match the level
    // This ensures proper evolution regardless of trainer preferences for game accuracy
    const promotedPokemon = this.promoteToAppropriateLevel(
      demotedPokemon,
      level
    );
    console.log(`After promotion check: ${promotedPokemon.name}`);

    // If trainer excludes evolved forms but the Pokemon naturally evolves at this level,
    // we still return the evolved form because it's game-accurate
    console.log(`Final evolution result: ${promotedPokemon.name}`);

    return promotedPokemon;
  }

  /**
   * Recursively promote a Pokemon to its appropriate evolution for the given level
   */
  promoteToAppropriateLevel(pokemon, level) {
    console.log(`Checking promotion for ${pokemon.name} at level ${level}`);

    // Check if evolutionData is available
    if (!evolutionData) {
      console.warn("evolutionData not available for promotion logic");
      return pokemon;
    }

    // Check if this Pokemon can evolve at the current level
    // Use the Pokemon's own evolutionData from integrated system
    const evolutionInfo = pokemon.evolutionData || evolutionData[pokemon.name];
    if (evolutionInfo) {
      console.log(`${pokemon.name} evolution info:`, evolutionInfo);

      // Only promote for level-based evolutions and if level is high enough
      // Fixed: Use correct property names from completePokedex.js
      if (
        evolutionInfo.evolves_to &&
        evolutionInfo.evolution_method === "level" &&
        level >= evolutionInfo.evolution_level
      ) {
        console.log(
          `Promoting ${pokemon.name} to ${evolutionInfo.evolves_to} (evolves at ${evolutionInfo.evolution_level}, current level ${level})`
        );

        // Get the evolution Pokemon data
        const evolvedPokemonData = this.queryService.getPokemonByName(
          evolutionInfo.evolves_to
        );
        if (evolvedPokemonData) {
          // Recursively check if it should evolve further
          return this.promoteToAppropriateLevel(evolvedPokemonData, level);
        } else {
          console.warn(
            `Could not find evolution data for ${evolutionInfo.evolves_to}`
          );
        }
      } else if (evolutionInfo.evolution_method !== "level") {
        console.log(
          `${pokemon.name} evolves by ${evolutionInfo.evolution_method}, not level - no promotion`
        );
      } else if (level < evolutionInfo.evolution_level) {
        console.log(
          `${pokemon.name} evolves at ${evolutionInfo.evolution_level}, current level ${level} - no promotion yet`
        );
      }
    } else {
      console.log(`No evolution info found for ${pokemon.name}`);
    }

    console.log(`No promotion needed for ${pokemon.name} at level ${level}`);
    return pokemon;
  }

  /**
   * Recursively demote a Pokemon to its appropriate pre-evolution for the given level
   */
  demoteToAppropriateLevel(pokemon, level) {
    console.log(`Checking demotion for ${pokemon.name} at level ${level}`);

    // Check if evolutionData is available
    if (!evolutionData) {
      console.warn("evolutionData not available for demotion logic");
      return pokemon;
    }

    let foundDemotion = false;

    // Look through evolution data to find Pokemon that evolves into this one
    // First check completePokedex evolutionData
    for (const [pokemonName, evolutionInfo] of Object.entries(evolutionData)) {
      if (evolutionInfo.evolves_to === pokemon.name) {
        console.log(
          `Found ${pokemonName} evolves to ${pokemon.name} at level ${evolutionInfo.evolution_level} (method: ${evolutionInfo.evolution_method})`
        );

        // Only demote for level-based evolutions and if level is too low
        if (
          evolutionInfo.evolution_method === "level" &&
          level < evolutionInfo.evolution_level
        ) {
          console.log(
            `Demoting ${pokemon.name} to ${pokemonName} (evolves at ${evolutionInfo.evolution_level}, current level ${level})`
          );
          foundDemotion = true;

          // Get the pre-evolution Pokemon data
          const preEvolutionData =
            this.queryService.getPokemonByName(pokemonName);
          if (preEvolutionData) {
            // Recursively check if we need to demote further
            return this.demoteToAppropriateLevel(preEvolutionData, level);
          } else {
            console.warn(
              `Could not find pre-evolution data for ${pokemonName}`
            );
          }
        }
      }
    }

    // Also check integrated Pokemon evolution data
    if (!foundDemotion) {
      for (let id = 1; id <= 386; id++) {
        const candidatePokemon = this.queryService.getPokemonData(id);
        if (candidatePokemon && candidatePokemon.evolutionData) {
          const evolutionInfo = candidatePokemon.evolutionData;
          if (evolutionInfo.evolves_to === pokemon.name) {
            console.log(
              `Found ${candidatePokemon.name} evolves to ${pokemon.name} at level ${evolutionInfo.evolution_level} (method: ${evolutionInfo.evolution_method})`
            );

            // Only demote for level-based evolutions and if level is too low
            if (
              evolutionInfo.evolution_method === "level" &&
              level < evolutionInfo.evolution_level
            ) {
              console.log(
                `Demoting ${pokemon.name} to ${candidatePokemon.name} (evolves at ${evolutionInfo.evolution_level}, current level ${level})`
              );
              foundDemotion = true;

              // Recursively check if we need to demote further
              return this.demoteToAppropriateLevel(candidatePokemon, level);
            }
          }
        }
      }
    }

    if (!foundDemotion) {
      console.log(`No demotion needed for ${pokemon.name} at level ${level}`);
    }
    return pokemon;
  }

  /**
   * Find the pre-evolution of a Pokemon by looking through evolution data
   */
  findPreEvolution(dexNumber) {
    const targetPokemon = this.queryService.getPokemonData(dexNumber);
    if (!targetPokemon) return null;

    // Look through evolution data to find Pokemon that evolves into this one
    for (const [pokemonName, evolutionInfo] of Object.entries(evolutionData)) {
      if (evolutionInfo.evolveTo === targetPokemon.name) {
        const preEvolutionData =
          this.queryService.getPokemonByName(pokemonName);
        if (preEvolutionData) {
          return {
            dex_number: preEvolutionData.dex_number,
            evolveLevel: evolutionInfo.requirement,
          };
        }
      }
    }
    return null;
  }

  /**
   * Generate appropriate moveset for level with Gen 3 standards
   */
  generateMoveset(pokemon, level, trainerClass = "Youngster") {
    let availableMoves = [];

    // PRIORITY 1: Try authoritative Gen 3 learnsets first
    if (pokemon.dex_number && hasAuthenticData(pokemon.dex_number)) {
      availableMoves = getAuthenticMoveset(
        pokemon.dex_number,
        level,
        trainerClass
      );
      console.log(
        `[DEBUG] Using authentic Gen 3 learnset for ${
          pokemon.name
        }: ${availableMoves.join(", ")}`
      );

      // Return authentic moves directly - these are already properly curated
      return availableMoves.map((move) => ({
        name: move,
        type: this.getMoveType(move),
      }));
    }

    // PRIORITY 2: Try the integrated Pokedex format
    if (pokemon.movesets?.levelUp) {
      availableMoves = pokemon.movesets.levelUp
        .filter((moveEntry) => moveEntry.level <= level)
        .flatMap((moveEntry) => moveEntry.moves);
    }

    // PRIORITY 3: Try the complete Pokedex format
    if (availableMoves.length === 0) {
      try {
        availableMoves = getCompleteMoveset(pokemon, level);
      } catch (error) {
        console.warn(
          `Failed to get complete moveset for ${pokemon.name}:`,
          error
        );
      }
    }

    // Check if we only have basic moves - if so, enhance with type-appropriate moves
    const basicMoves = [
      "Tackle",
      "Growl",
      "Scratch",
      "Leer",
      "Tail Whip",
      "String Shot",
    ];
    const hasOnlyBasicMoves =
      availableMoves.length > 0 &&
      availableMoves.every((move) => basicMoves.includes(move));

    // If we have no moves OR only basic moves, generate type-appropriate moves
    if (availableMoves.length === 0 || hasOnlyBasicMoves) {
      console.log(
        `[Warning] ${pokemon.name} has no/basic moves, generating type-appropriate moveset`
      );
      const typeAppropriateMoves = this.generateTypeAppropriateMoveset(
        pokemon,
        level
      );
      // Combine type-appropriate moves with some basic moves
      availableMoves = [...typeAppropriateMoves, ...availableMoves.slice(0, 1)]; // Keep one basic move
    }

    // Remove duplicates and sort by preference
    const uniqueMoves = [...new Set(availableMoves)];

    // For Gen 3, prioritize:
    // 1. Signature moves and powerful moves learned recently
    // 2. STAB (Same Type Attack Bonus) moves
    // 3. Coverage moves
    // 4. Status moves for balance

    const sortedMoves = uniqueMoves.sort((a, b) => {
      // Ensure moves exist before processing
      if (!a || !b) return 0;

      // Prefer moves that match Pokemon's types (STAB)
      const aIsSTAB =
        pokemon.types &&
        a &&
        pokemon.types.some(
          (type) =>
            (type && a.toLowerCase().includes(type.toLowerCase())) ||
            this.isSTABMove(a, pokemon.types)
        );
      const bIsSTAB =
        pokemon.types &&
        b &&
        pokemon.types.some(
          (type) =>
            (type && b.toLowerCase().includes(type.toLowerCase())) ||
            this.isSTABMove(b, pokemon.types)
        );

      if (aIsSTAB && !bIsSTAB) return -1;
      if (!aIsSTAB && bIsSTAB) return 1;

      // Prefer non-basic moves
      if (this.isBasicMove(a) && !this.isBasicMove(b)) return 1;
      if (!this.isBasicMove(a) && this.isBasicMove(b)) return -1;

      return 0;
    });

    // Select up to 4 moves, ensuring variety
    const selectedMoves = sortedMoves.slice(0, 4);

    // Ensure we have at least 2 moves
    if (selectedMoves.length < 2) {
      selectedMoves.push(
        ...["Tackle", "Growl"].filter((move) => !selectedMoves.includes(move))
      );
    }

    return selectedMoves.slice(0, 4);
  }

  /**
   * Generate type-appropriate moves when no movesets are available
   */
  generateTypeAppropriateMoveset(pokemon, level) {
    const moves = [];
    const types = pokemon.types || [];

    // Type-specific moves based on Pokemon's types
    const typeMovesMap = {
      Normal: ["Tackle", "Scratch", "Quick Attack", "Body Slam"],
      Fire: ["Ember", "Flame Wheel", "Fire Punch", "Flamethrower"],
      Water: ["Water Gun", "Bubble Beam", "Surf", "Hydro Pump"],
      Electric: ["Thunder Shock", "Spark", "Thunderbolt", "Thunder"],
      Grass: ["Vine Whip", "Razor Leaf", "Petal Dance", "Solar Beam"],
      Ice: ["Ice Beam", "Blizzard", "Ice Punch", "Aurora Beam"],
      Fighting: ["Karate Chop", "Low Kick", "Seismic Toss", "Submission"],
      Poison: ["Poison Sting", "Sludge", "Toxic", "Sludge Bomb"],
      Ground: ["Dig", "Earthquake", "Fissure", "Bone Club"],
      Flying: ["Wing Attack", "Fly", "Drill Peck", "Sky Attack"],
      Psychic: ["Confusion", "Psybeam", "Psychic", "Dream Eater"],
      Bug: ["String Shot", "Leech Life", "Pin Missile", "Megahorn"],
      Rock: ["Rock Throw", "Rock Slide", "Stone Edge", "Rock Blast"],
      Ghost: ["Lick", "Night Shade", "Shadow Ball", "Destiny Bond"],
      Dragon: ["Dragon Rage", "Dragon Breath", "Dragon Claw", "Outrage"],
      Dark: ["Bite", "Faint Attack", "Crunch", "Dark Pulse"],
      Steel: ["Metal Claw", "Iron Tail", "Steel Wing", "Iron Head"],
      Fairy: ["Fairy Wind", "Charm", "Moonblast", "Dazzling Gleam"],
    };

    // Add STAB moves based on Pokemon's types
    types.forEach((type) => {
      const typeMoves = typeMovesMap[type] || [];
      if (typeMoves.length > 0) {
        // Choose moves based on level
        if (level >= 30 && typeMoves[3])
          moves.push(typeMoves[3]); // Powerful move
        else if (level >= 20 && typeMoves[2])
          moves.push(typeMoves[2]); // Mid-level move
        else if (level >= 10 && typeMoves[1])
          moves.push(typeMoves[1]); // Early move
        else moves.push(typeMoves[0]); // Basic move
      }
    });

    // Add basic moves if we don't have enough
    const basicMoves = ["Tackle", "Growl", "Leer", "Tail Whip"];
    while (moves.length < 2 && basicMoves.length > 0) {
      const move = basicMoves.shift();
      if (!moves.includes(move)) moves.push(move);
    }

    return moves.slice(0, 4);
  }

  /**
   * Check if a move is a basic/weak move
   */
  isBasicMove(moveName) {
    if (!moveName || typeof moveName !== "string") return false;
    const basicMoves = [
      "tackle",
      "scratch",
      "growl",
      "leer",
      "tail whip",
      "string shot",
    ];
    return basicMoves.includes(moveName.toLowerCase());
  }

  /**
   * Check if a move provides STAB for given types
   */
  isSTABMove(moveName, types) {
    if (!moveName || typeof moveName !== "string" || !types) return false;

    // This is a simplified check - in a full implementation,
    // you'd have a database of move types
    const moveTypeMappings = {
      flamethrower: "Fire",
      ember: "Fire",
      "fire punch": "Fire",
      "water gun": "Water",
      surf: "Water",
      "bubble beam": "Water",
      thunder: "Electric",
      thunderbolt: "Electric",
      "thunder wave": "Electric",
      "razor leaf": "Grass",
      "vine whip": "Grass",
      "solar beam": "Grass",
      "rock throw": "Rock",
      "rock slide": "Rock",
      "stone edge": "Rock",
      earthquake: "Ground",
      dig: "Ground",
      "mud shot": "Ground",
    };

    const moveType = moveTypeMappings[moveName.toLowerCase()];
    return moveType && types.includes(moveType);
  }

  /**
   * Validate and adjust biome compatibility with trainer class
   */
  validateBiomeCompatibility(trainerClass, targetBiomes, trainerPrefs) {
    // Special trainer class biome requirements
    const incompatibleCombinations = {
      "Bug Catcher": ["Water", "Beach", "Ice"], // Bugs don't live in water/ice
      Fisherman: ["Desert", "Volcanic", "Mountain"], // No water in these biomes
      Sailor: ["Underground", "Mountain"], // Sailors need water access
      Hiker: ["Water", "Beach"], // Hikers are land-based
    };

    const incompatible = incompatibleCombinations[trainerClass];
    if (!incompatible) return targetBiomes; // No restrictions

    // Filter out incompatible biomes
    const compatibleBiomes = targetBiomes.filter(
      (biome) => !incompatible.includes(biome)
    );

    // If no compatible biomes, expand to trainer's preferred biomes
    if (compatibleBiomes.length === 0 && trainerPrefs.preferredBiomes) {
      console.warn(
        `Expanding ${trainerClass} biomes from ${targetBiomes.join(
          ", "
        )} to preferred biomes`
      );
      return trainerPrefs.preferredBiomes;
    }

    // If still no biomes, use defaults
    if (compatibleBiomes.length === 0) {
      console.warn(`Using default biomes for ${trainerClass}`);
      return ["Grassland", "Forest"];
    }

    return compatibleBiomes.length > 0 ? compatibleBiomes : targetBiomes;
  }

  /**
   * Calculate team size based on trainer and level with better scaling
   */
  calculateTeamSize(trainerPrefs, levelMin, levelMax) {
    const avgLevel = (levelMin + levelMax) / 2;
    const [minSize, maxSize] = trainerPrefs.teamSizeRange;

    // Improved scaling with level - more granular scaling
    if (avgLevel <= 10) return minSize;
    if (avgLevel <= 15) return Math.ceil((minSize + maxSize) / 2);
    if (avgLevel <= 25) return Math.max(Math.ceil((minSize + maxSize) / 2), 3);
    if (avgLevel <= 40) return Math.max(3, maxSize);
    if (avgLevel <= 55) return Math.max(4, maxSize);
    return Math.max(5, maxSize); // High level trainers get max teams
  }

  /**
   * Fallback team generation when normal filtering fails
   */
  generateFallbackTeam(
    trainerClass,
    levelMin,
    levelMax,
    teamSize,
    originalBiomes = [],
    pokedexScope = "gen3"
  ) {
    console.log(`Generating fallback team for ${trainerClass}`);

    // Try to find Pokemon in expanded biome search first
    if (originalBiomes.length > 0) {
      const expandedBiomes = [
        ...originalBiomes,
        "Grassland",
        "Forest",
        "Plains",
      ];
      const expandedCandidates = this.getCandidatePokemon(
        pokedexScope,
        expandedBiomes,
        { excludeLegendaries: true },
        levelMin,
        levelMax
      );

      if (expandedCandidates.length > 0) {
        console.log(
          `Found ${expandedCandidates.length} Pokemon in expanded biome search`
        );
        const team = [];
        const usedTypes = new Set();
        const usedPokemon = new Set();

        for (
          let i = 0;
          i < Math.min(teamSize, expandedCandidates.length);
          i++
        ) {
          const member = this.generateTeamMember(
            expandedCandidates,
            usedPokemon,
            levelMin,
            levelMax,
            { excludeEvolved: false },
            usedTypes
          );
          if (member) {
            team.push(member);
            usedPokemon.add(member.name);
            if (member.types && member.types.length > 0) {
              usedTypes.add(member.types[0]);
            }
          }
        }

        if (team.length > 0) {
          return {
            success: true,
            team: team,
            metadata: {
              source: "fallback_expanded_biomes",
              biomes: expandedBiomes,
              originalBiomes: originalBiomes,
              scope: pokedexScope,
            },
          };
        }
      }
    }

    // Last resort: use basic Pokemon that should always be available based on scope
    let fallbackPokemon = [];

    if (pokedexScope === "gen1" || pokedexScope === "all") {
      fallbackPokemon = [
        { name: "Rattata", dex_number: 19 },
        { name: "Pidgey", dex_number: 16 },
        { name: "Caterpie", dex_number: 10 },
        { name: "Weedle", dex_number: 13 },
      ];
    } else if (pokedexScope === "gen2") {
      fallbackPokemon = [
        { name: "Rattata", dex_number: 19 }, // Gen1 Pokemon available in gen2
        { name: "Pidgey", dex_number: 16 },
        { name: "Sentret", dex_number: 161 }, // Gen2 Pokemon
        { name: "Hoothoot", dex_number: 163 },
      ];
    } else if (pokedexScope === "gen3") {
      fallbackPokemon = [
        { name: "Poochyena", dex_number: 261 },
        { name: "Zigzagoon", dex_number: 263 },
        { name: "Wurmple", dex_number: 265 },
        { name: "Taillow", dex_number: 276 },
      ];
    }

    const team = [];
    const usedTypes = new Set();
    for (let i = 0; i < Math.min(teamSize, fallbackPokemon.length); i++) {
      const pokemon = this.queryService.getPokemonData(
        fallbackPokemon[i].dex_number
      );
      if (pokemon) {
        team.push(
          this.generateTeamMember(
            [pokemon],
            new Set(),
            levelMin,
            levelMax,
            { excludeEvolved: true },
            usedTypes
          )
        );
      }
    }

    return {
      trainerClass,
      team,
      metadata: {
        source: "last_resort_fallback",
        scope: pokedexScope,
      },
      fallback: true,
    };
  }

  /**
   * Get service statistics
   */
  getStats() {
    return this.queryService.getStats();
  }

  /**
   * Determine Pokemon role based on type and stats
   */
  determineRole(pokemon) {
    if (!pokemon.types || pokemon.types.length === 0) return "Versatile";

    const primaryType = pokemon.types[0];
    const stats = pokemon.baseStats || {};

    // Role determination based on type and stats
    if (primaryType === "Steel" || primaryType === "Rock") return "Tank";
    if (
      primaryType === "Fire" ||
      primaryType === "Electric" ||
      primaryType === "Dragon"
    )
      return "Sweeper";
    if (primaryType === "Grass" || primaryType === "Poison") return "Support";
    if (primaryType === "Water" || primaryType === "Normal") return "Balanced";
    if (primaryType === "Fighting" || primaryType === "Ground")
      return "Physical Attacker";
    if (primaryType === "Psychic" || primaryType === "Ghost")
      return "Special Attacker";
    if (primaryType === "Flying" || primaryType === "Bug")
      return "Speed Control";
    if (primaryType === "Ice" || primaryType === "Dark") return "Glass Cannon";

    return "Versatile";
  }

  /**
   * Generate strategic reasoning for Pokemon selection
   */
  generateReasoning(pokemon, level, role, ability) {
    const species = pokemon.name;
    const types = pokemon.types || [];
    const typeText =
      types.length > 1 ? `${types[0]}/${types[1]}` : types[0] || "Normal";

    const reasoningTemplates = [
      `This ${species} serves as a reliable ${role.toLowerCase()} with its ${typeText} typing, providing excellent battlefield presence at level ${level}.`,
      `${species}'s ${ability} ability makes it an ideal ${role.toLowerCase()}, offering strategic advantages in ${typeText}-type matchups.`,
      `At level ${level}, this ${species} brings strong ${typeText} coverage as a ${role.toLowerCase()}, complementing the team's overall strategy.`,
      `The ${species} fills the ${role.toLowerCase()} role effectively, leveraging its ${typeText} typing and ${ability} ability for tactical superiority.`,
      `This ${species} provides essential ${typeText} type coverage as a ${role.toLowerCase()}, with ${ability} enhancing its battlefield effectiveness.`,
    ];

    return reasoningTemplates[
      Math.floor(Math.random() * reasoningTemplates.length)
    ];
  }

  /**
   * Calculate base stat total for a Pokemon
   */
  calculateBaseStatTotal(pokemon) {
    if (!pokemon.baseStats && !pokemon.base_stats) return 0;

    const stats = pokemon.baseStats || pokemon.base_stats;

    // Handle all the different property naming conventions
    const hp = stats.hp || 0;
    const attack = stats.attack || 0;
    const defense = stats.defense || 0;
    const specialAttack =
      stats.specialAttack ||
      stats.special_attack ||
      stats.sp_attack ||
      stats.spatk ||
      stats.spAttack ||
      0;
    const specialDefense =
      stats.specialDefense ||
      stats.special_defense ||
      stats.sp_defense ||
      stats.spdef ||
      stats.spDefense ||
      0;
    const speed = stats.speed || 0;

    return hp + attack + defense + specialAttack + specialDefense + speed;
  }

  /**
   * Check if a Pokemon fits within the trainer's base stat range
   */
  isPokemonWithinBSTRange(pokemon, trainerPrefs) {
    if (!trainerPrefs.baseStatRange) return true; // No BST constraints

    const bst = this.calculateBaseStatTotal(pokemon);
    const [minBST, maxBST] = trainerPrefs.baseStatRange;

    return bst >= minBST && bst <= maxBST;
  }

  /**
   * Check if a Pokemon has a special evolution method that might be unrealistic at low levels
   */
  hasUnrealisticEvolutionMethod(pokemon, level, trainerClass) {
    const trainerPrefs = this.trainerClasses[trainerClass] || {};

    // Skip check if trainer allows special evolutions
    if (!trainerPrefs.avoidSpecialEvolutions) return false;

    // Get evolution info for this Pokemon's pre-evolution
    const evolutionEntries = Object.entries(evolutionData);

    // Check if this Pokemon is an evolution of something
    for (const [preEvoName, evoInfo] of evolutionEntries) {
      if (evoInfo.evolves_to === pokemon.name) {
        const method = evoInfo.evolution_method;

        // Special evolution methods that are unlikely at low levels/weak trainers
        if (method === "trade" && level < 25) return true;
        if (method === "stone" && level < 20) return true;
        if (method === "happiness" && level < 30) return true;
        if (method === "trade with item" && level < 30) return true;

        // Some specific cases
        if (pokemon.name === "Blissey" && level < 40) return true; // Happiness evo, very unlikely at low levels
        if (
          ["Jolteon", "Vaporeon", "Flareon"].includes(pokemon.name) &&
          level < 25
        )
          return true; // Stone evos
      }
    }

    return false;
  }

  /**
   * Get BST-appropriate difficulty modifier based on trainer class and level
   */
  getBSTDifficultyModifier(trainerClass, averageLevel) {
    const trainerPrefs =
      this.trainerClasses[trainerClass] || this.trainerClasses["Youngster"];

    // Base difficulty categories
    const weakTrainers = ["Youngster", "Bug Catcher", "Lass", "Fisherman"];
    const normalTrainers = ["Hiker", "Sailor", "Psychic"];
    const strongTrainers = ["Ace Trainer", "Gym Leader", "Elite Four"];

    let baseModifier = 0;

    if (weakTrainers.includes(trainerClass)) {
      baseModifier = -50; // Prefer weaker Pokemon
    } else if (normalTrainers.includes(trainerClass)) {
      baseModifier = 0; // Balanced selection
    } else if (strongTrainers.includes(trainerClass)) {
      baseModifier = +75; // Prefer stronger Pokemon
    }

    // Level scaling - higher level trainers get stronger Pokemon
    const levelModifier = Math.floor((averageLevel - 15) * 2); // +2 BST per level above 15

    return baseModifier + levelModifier;
  }

  /**
   * Get the type of a move based on its name (simplified mapping)
   */
  getMoveType(moveName) {
    const moveTypes = {
      // Fire moves
      Ember: "Fire",
      Flamethrower: "Fire",
      "Fire Spin": "Fire",
      "Fire Punch": "Fire",
      "Flame Wheel": "Fire",
      "Blaze Kick": "Fire",
      "Heat Wave": "Fire",
      "Solar Beam": "Fire",

      // Water moves
      "Water Gun": "Water",
      Bubble: "Water",
      "Hydro Pump": "Water",
      Surf: "Water",
      "Water Pulse": "Water",
      "Muddy Water": "Water",
      "Aqua Tail": "Water",
      Whirlpool: "Water",

      // Grass moves
      "Vine Whip": "Grass",
      "Razor Leaf": "Grass",
      "Mega Drain": "Grass",
      "Giga Drain": "Grass",
      "Solar Beam": "Grass",
      "Leaf Blade": "Grass",
      Absorb: "Grass",
      Synthesis: "Grass",

      // Electric moves
      Thundershock: "Electric",
      Thunderbolt: "Electric",
      Thunder: "Electric",
      Spark: "Electric",
      "Thunder Wave": "Electric",
      "Thunder Punch": "Electric",

      // Fighting moves
      "Low Kick": "Fighting",
      "Karate Chop": "Fighting",
      "Double Kick": "Fighting",
      "Bulk Up": "Fighting",
      "Sky Uppercut": "Fighting",
      "Cross Chop": "Fighting",
      "Dynamic Punch": "Fighting",

      // Normal moves
      Tackle: "Normal",
      Scratch: "Normal",
      "Quick Attack": "Normal",
      Slam: "Normal",
      "Take Down": "Normal",
      "Double-Edge": "Normal",
      "Hyper Beam": "Normal",

      // Status moves (mostly Normal type)
      Growl: "Normal",
      Leer: "Normal",
      "Tail Whip": "Normal",
      "Sand Attack": "Normal",
    };

    return moveTypes[moveName] || "Normal";
  }
}

export { ImprovedTeamGenerator };
