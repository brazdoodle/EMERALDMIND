/**
 * Pokémon Service Module
 * 
 * Central service for accessing Pokémon data across the application.
 * Provides a clean API that can be easily consumed by any module,
 * including the Lab Assistant for answering Pokémon-related questions.
 * 
 * This approach gives us the benefits of a database-like interface
 * while maintaining the performance and simplicity of file-based data.
 */

import { completePokedex, evolutionData, evolutionMethods, typeChart, ensureCompletePokedex } from '@/data/completePokedex';
import { downscaleSpeciesForLevel, isLegendary, isPseudoLegendary } from '@/components/trainer/evolutionRules';

class PokemonService {
  constructor() {
    this.initialized = false;
    this.init();
  }

  async init() {
    if (!this.initialized) {
      ensureCompletePokedex();
      this.initialized = true;
    }
  }

  // ===== BASIC QUERIES =====

  /**
   * Get a Pokémon by Dex number
   */
  getByDexNumber(dexNumber) {
    return completePokedex[dexNumber] || null;
  }

  /**
   * Get a Pokémon by name (case-insensitive)
   */
  getByName(name) {
    const normalizedName = name.toLowerCase();
    return Object.values(completePokedex).find(
      pokemon => pokemon.name.toLowerCase() === normalizedName
    ) || null;
  }

  /**
   * Search Pokémon by partial name
   */
  searchByName(searchTerm) {
    const normalized = searchTerm.toLowerCase();
    return Object.values(completePokedex).filter(
      pokemon => pokemon.name.toLowerCase().includes(normalized)
    );
  }

  /**
   * Get all Pokémon (with optional filtering)
   */
  getAll(filters = {}) {
    let results = Object.values(completePokedex);

    if (filters.type) {
      results = results.filter(p => p.types.includes(filters.type));
    }

    if (filters.biome) {
      results = results.filter(p => p.biomes && p.biomes.includes(filters.biome));
    }

    if (filters.generation) {
      const ranges = { 1: [1, 151], 2: [152, 251], 3: [252, 386] };
      const [min, max] = ranges[filters.generation] || [1, 386];
      results = results.filter(p => p.dex_number >= min && p.dex_number <= max);
    }

    if (filters.legendary !== undefined) {
      results = results.filter(p => p.legendary === filters.legendary);
    }

    return results;
  }

  // ===== TYPE AND STAT QUERIES =====

  /**
   * Get Pokémon by type(s)
   */
  getByType(type) {
    return Object.values(completePokedex).filter(
      pokemon => pokemon.types.includes(type)
    );
  }

  /**
   * Get type effectiveness against a Pokémon
   */
  getTypeEffectiveness(pokemonTypes, attackingType) {
    let effectiveness = 1.0;

    pokemonTypes.forEach(defenseType => {
      const typeData = typeChart[defenseType];
      if (typeData) {
        if (typeData.weakTo.includes(attackingType)) {
          effectiveness *= 2.0;
        } else if (typeData.resistantTo.includes(attackingType)) {
          effectiveness *= 0.5;
        } else if (typeData.immuneTo.includes(attackingType)) {
          effectiveness *= 0.0;
        }
      }
    });

    return effectiveness;
  }

  /**
   * Get Pokémon stats comparison
   */
  compareStats(pokemon1Name, pokemon2Name) {
    const p1 = this.getByName(pokemon1Name);
    const p2 = this.getByName(pokemon2Name);

    if (!p1 || !p2) return null;

    const comparison = {};
    const statNames = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'];

    statNames.forEach(stat => {
      const p1Stat = p1.baseStats[stat] || 0;
      const p2Stat = p2.baseStats[stat] || 0;
      comparison[stat] = {
        pokemon1: p1Stat,
        pokemon2: p2Stat,
        difference: p1Stat - p2Stat,
        winner: p1Stat > p2Stat ? p1.name : p2Stat > p1Stat ? p2.name : 'tie'
      };
    });

    return comparison;
  }

  // ===== EVOLUTION QUERIES =====

  /**
   * Get evolution chain for a Pokémon
   */
  getEvolutionChain(pokemonName) {
    const chain = [];
    let current = pokemonName;

    // Find the base form
    let baseForm = current;
    while (true) {
      const prevForm = this.getPreviousEvolution(baseForm);
      if (!prevForm) break;
      baseForm = prevForm;
    }

    // Build chain from base form
    current = baseForm;
    while (current) {
      const pokemon = this.getByName(current);
      if (pokemon) {
        const evoData = evolutionData[current];
        chain.push({
          name: current,
          dexNumber: pokemon.dex_number,
          types: pokemon.types,
          evolutionMethod: evoData?.method || null,
          evolutionLevel: evoData?.requirement || null,
          evolvesTo: evoData?.evolveTo || null
        });
        current = evoData?.evolveTo || null;
      } else {
        break;
      }
    }

    return chain;
  }

  /**
   * Get what a Pokémon evolves from
   */
  getPreviousEvolution(pokemonName) {
    for (const [pokemon, evoInfo] of Object.entries(evolutionData)) {
      if (evoInfo.evolveTo === pokemonName) {
        return pokemon;
      }
    }
    return null;
  }

  /**
   * Check if a Pokémon can evolve at a given level
   */
  canEvolveAtLevel(pokemonName, level) {
    const result = downscaleSpeciesForLevel(pokemonName, level);
    return !result.changed; // If it doesn't need downscaling, it can exist at this level
  }

  /**
   * Get appropriate form for level (handles downscaling)
   */
  getAppropriateFormForLevel(pokemonName, level) {
    return downscaleSpeciesForLevel(pokemonName, level);
  }

  // ===== BIOME AND ENCOUNTER QUERIES =====

  /**
   * Get Pokémon that can be found in a specific biome
   */
  getByBiome(biome) {
    return Object.values(completePokedex).filter(
      pokemon => pokemon.biomes && pokemon.biomes.includes(biome)
    );
  }

  /**
   * Calculate Base Stat Total (BST) for a Pokémon
   */
  calculateBST(pokemon) {
    if (!pokemon || !pokemon.baseStats) return 0;
    return Object.values(pokemon.baseStats).reduce((total, stat) => total + stat, 0);
  }

  /**
   * Get Pokémon filtered by Base Stat Total range
   */
  getByBSTRange(minBST, maxBST) {
    return Object.values(completePokedex).filter(pokemon => {
      const bst = this.calculateBST(pokemon);
      return bst >= minBST && bst <= maxBST;
    });
  }

  /**
   * Get BST ranges for different difficulty levels
   */
  getDifficultyBSTRanges() {
    return {
      Easy: { min: 150, max: 400, description: "Weak early-game Pokémon" },
      Medium: { min: 300, max: 520, description: "Balanced mid-game Pokémon" }, 
      Hard: { min: 380, max: 580, description: "Strong late-game Pokémon" },
      Expert: { min: 480, max: 720, description: "Elite competitive Pokémon" }
    };
  }

  /**
   * Get suitable Pokémon for trainer generation
   */
  getSuitableForTrainer(options = {}) {
    const {
      biome,
      levelMin = 1,
      levelMax = 100,
      types = [],
      excludeLegendaries = true,
      excludePseudoLegendaries = false,
      difficulty = 'Medium'
    } = options;

    let candidates = Object.values(completePokedex);

    // Filter by biome
    if (biome) {
      candidates = candidates.filter(p => p.biomes && p.biomes.includes(biome));
    }

    // Filter by type preference
    if (types.length > 0) {
      candidates = candidates.filter(p => 
        types.some(type => p.types.includes(type))
      );
    }

    // Apply difficulty-based BST filtering
    const bstRanges = this.getDifficultyBSTRanges();
    const difficultyRange = bstRanges[difficulty];
    if (difficultyRange) {
      candidates = candidates.filter(p => {
        const bst = this.calculateBST(p);
        return bst >= difficultyRange.min && bst <= difficultyRange.max;
      });
    }

    // Filter out legendaries if requested
    if (excludeLegendaries) {
      candidates = candidates.filter(p => !isLegendary(p.name));
    }

    if (excludePseudoLegendaries) {
      candidates = candidates.filter(p => !isPseudoLegendary(p.name));
    }

    // Apply evolution constraints for each level in range
    const suitablePokemon = candidates.map(pokemon => {
      const appropriateLevel = Math.floor((levelMin + levelMax) / 2);
      const evolved = this.getAppropriateFormForLevel(pokemon.name, appropriateLevel);
      
      return {
        original: pokemon,
        recommended: evolved.species !== pokemon.name ? this.getByName(evolved.species) : pokemon,
        levelAdjusted: evolved.changed,
        bst: this.calculateBST(evolved.species !== pokemon.name ? this.getByName(evolved.species) : pokemon)
      };
    }).filter(entry => entry.recommended);

    // Sort by BST for better selection (higher difficulty = prefer higher BST)
    const difficultyMultiplier = difficulty === 'Expert' ? 1 : difficulty === 'Hard' ? 0.8 : difficulty === 'Medium' ? 0.5 : 0.2;
    return suitablePokemon.sort((a, b) => {
      if (Math.random() < difficultyMultiplier) {
        return b.bst - a.bst; // Prefer higher BST
      }
      return a.bst - b.bst; // Prefer lower BST
    });
  }

  // ===== LAB ASSISTANT INTEGRATION =====

  /**
   * Answer natural language questions about Pokémon
   * This method provides structured data that the Lab Assistant can use
   */
  answerQuestion(question) {
    const lowerQuestion = question.toLowerCase();

    // Extract Pokémon name from question
    const mentionedPokemon = Object.values(completePokedex).find(pokemon => 
      lowerQuestion.includes(pokemon.name.toLowerCase())
    );

    if (!mentionedPokemon) {
      return { error: 'No Pokémon mentioned in question' };
    }

    const pokemon = mentionedPokemon;
    const response = {
      pokemon: pokemon.name,
      dexNumber: pokemon.dex_number,
      types: pokemon.types,
      questionType: null,
      answer: null
    };

    // Determine question type and provide answer
    if (lowerQuestion.includes('type') || lowerQuestion.includes('what type')) {
      response.questionType = 'types';
      response.answer = `${pokemon.name} is a ${pokemon.types.join('/')} type Pokémon.`;
    } else if (lowerQuestion.includes('stats') || lowerQuestion.includes('stat')) {
      response.questionType = 'stats';
      response.answer = {
        hp: pokemon.baseStats.hp,
        attack: pokemon.baseStats.attack,
        defense: pokemon.baseStats.defense,
        spAttack: pokemon.baseStats.spAttack,
        spDefense: pokemon.baseStats.spDefense,
        speed: pokemon.baseStats.speed,
        total: Object.values(pokemon.baseStats).reduce((a, b) => a + b, 0)
      };
    } else if (lowerQuestion.includes('evolve') || lowerQuestion.includes('evolution')) {
      response.questionType = 'evolution';
      response.answer = this.getEvolutionChain(pokemon.name);
    } else if (lowerQuestion.includes('abilities') || lowerQuestion.includes('ability')) {
      response.questionType = 'abilities';
      response.answer = pokemon.abilities || [];
    } else if (lowerQuestion.includes('biome') || lowerQuestion.includes('where') || lowerQuestion.includes('found')) {
      response.questionType = 'biomes';
      response.answer = pokemon.biomes || [];
    } else {
      response.questionType = 'general';
      response.answer = {
        name: pokemon.name,
        types: pokemon.types,
        stats: pokemon.baseStats,
        abilities: pokemon.abilities,
        biomes: pokemon.biomes,
        legendary: pokemon.legendary
      };
    }

    return response;
  }

  // ===== UTILITY METHODS =====

  /**
   * Get total number of Pokémon in database
   */
  getTotalCount() {
    return Object.keys(completePokedex).length;
  }

  /**
   * Get available types
   */
  getAvailableTypes() {
    const types = new Set();
    Object.values(completePokedex).forEach(pokemon => {
      pokemon.types.forEach(type => types.add(type));
    });
    return Array.from(types);
  }

  /**
   * Get available biomes
   */
  getAvailableBiomes() {
    const biomes = new Set();
    Object.values(completePokedex).forEach(pokemon => {
      if (pokemon.biomes) {
        pokemon.biomes.forEach(biome => biomes.add(biome));
      }
    });
    return Array.from(biomes);
  }

  /**
   * Get generation info
   */
  getGenerationInfo() {
    return {
      1: { name: 'Kanto', range: [1, 151] },
      2: { name: 'Johto', range: [152, 251] },
      3: { name: 'Hoenn', range: [252, 386] }
    };
  }
}

// Create singleton instance
const pokemonService = new PokemonService();

// Export both the class and instance
export default pokemonService;
export { PokemonService };

// Make service available globally for Lab Assistant and console testing
if (typeof window !== 'undefined') {
  window.pokemonService = pokemonService;
}