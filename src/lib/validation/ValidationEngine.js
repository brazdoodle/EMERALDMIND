/**
 * Comprehensive Validation Engine for EmeraldMind
 * Provides real-time validation for all data types with user-friendly error messages
 */

// Validation severity levels
export const VALIDATION_LEVELS = {
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
  CRITICAL: "critical",
};

// Validation categories
export const VALIDATION_CATEGORIES = {
  POKEMON: "pokemon",
  TRAINER: "trainer",
  TEAM: "team",
  SCRIPT: "script",
  FLAG: "flag",
  MOVE: "move",
  LEVEL: "level",
  STATS: "stats",
};

/**
 * Main Validation Engine Class
 */
export class ValidationEngine {
  constructor() {
    this.validators = new Map();
    this.validationHistory = [];
    this.setupDefaultValidators();
  }

  /**
   * Register a custom validator
   */
  registerValidator(category, name, validatorFn) {
    if (!this.validators.has(category)) {
      this.validators.set(category, new Map());
    }
    this.validators.get(category).set(name, validatorFn);
  }

  /**
   * Validate data with comprehensive error reporting
   */
  async validate(data, category, options = {}) {
    const results = {
      valid: true,
      issues: [],
      warnings: [],
      suggestions: [],
      timestamp: new Date().toISOString(),
      category,
      data: options.includeData ? data : null,
    };

    try {
      const categoryValidators = this.validators.get(category);
      if (!categoryValidators) {
        throw new Error(`No validators found for category: ${category}`);
      }

      // Run all validators for this category
      for (const [name, validator] of categoryValidators) {
        try {
          const result = await validator(data, options);
          if (result && Array.isArray(result.issues)) {
            results.issues.push(...result.issues);
          }
          if (result && Array.isArray(result.warnings)) {
            results.warnings.push(...result.warnings);
          }
          if (result && Array.isArray(result.suggestions)) {
            results.suggestions.push(...result.suggestions);
          }
        } catch (error) {
          results.issues.push({
            level: VALIDATION_LEVELS.ERROR,
            category,
            validator: name,
            message: `Validator error: ${error.message}`,
            code: "VALIDATOR_ERROR",
          });
        }
      }

      // Determine overall validity
      results.valid = !results.issues.some(
        (issue) =>
          issue.level === VALIDATION_LEVELS.ERROR ||
          issue.level === VALIDATION_LEVELS.CRITICAL
      );

      // Store in history
      this.validationHistory.push({
        ...results,
        data: null, // Don't store data in history for memory efficiency
      });

      return results;
    } catch (error) {
      results.valid = false;
      results.issues.push({
        level: VALIDATION_LEVELS.CRITICAL,
        category,
        message: `Validation engine error: ${error.message}`,
        code: "ENGINE_ERROR",
      });
      return results;
    }
  }

  /**
   * Set up default validators for all categories
   */
  setupDefaultValidators() {
    // Pokemon Validators
    this.registerValidator(
      VALIDATION_CATEGORIES.POKEMON,
      "species",
      this.validatePokemonSpecies
    );
    this.registerValidator(
      VALIDATION_CATEGORIES.POKEMON,
      "stats",
      this.validatePokemonStats
    );
    this.registerValidator(
      VALIDATION_CATEGORIES.POKEMON,
      "types",
      this.validatePokemonTypes
    );
    this.registerValidator(
      VALIDATION_CATEGORIES.POKEMON,
      "moves",
      this.validatePokemonMoves
    );

    // Trainer Validators
    this.registerValidator(
      VALIDATION_CATEGORIES.TRAINER,
      "basic",
      this.validateTrainerBasic
    );
    this.registerValidator(
      VALIDATION_CATEGORIES.TRAINER,
      "levels",
      this.validateTrainerLevels
    );
    this.registerValidator(
      VALIDATION_CATEGORIES.TRAINER,
      "biome",
      this.validateTrainerBiome
    );

    // Team Validators
    this.registerValidator(
      VALIDATION_CATEGORIES.TEAM,
      "composition",
      this.validateTeamComposition
    );
    this.registerValidator(
      VALIDATION_CATEGORIES.TEAM,
      "balance",
      this.validateTeamBalance
    );
    this.registerValidator(
      VALIDATION_CATEGORIES.TEAM,
      "evolution",
      this.validateTeamEvolution
    );

    // Level Validators
    this.registerValidator(
      VALIDATION_CATEGORIES.LEVEL,
      "range",
      this.validateLevelRange
    );
    this.registerValidator(
      VALIDATION_CATEGORIES.LEVEL,
      "evolution",
      this.validateLevelEvolution
    );
  }

  /**
   * Pokemon Species Validator
   */
  validatePokemonSpecies = (pokemon, _options = {}) => {
    const issues = [];
    const warnings = [];
    const suggestions = [];

    if (!pokemon?.species) {
      issues.push({
        level: VALIDATION_LEVELS.ERROR,
        category: VALIDATION_CATEGORIES.POKEMON,
        message: "Pokemon species is missing",
        code: "MISSING_SPECIES",
        field: "species",
      });
      return { issues, warnings, suggestions };
    }

    // Check if species exists in our database
    // const pokemonDetails = getPokemonDetails(pokemon.species);
    // if (!pokemonDetails) {
    //   issues.push({
    //     level: VALIDATION_LEVELS.ERROR,
    //     category: VALIDATION_CATEGORIES.POKEMON,
    //     message: `Unknown Pokemon species: ${pokemon.species}`,
    //     code: 'UNKNOWN_SPECIES',
    //     field: 'species',
    //     suggestion: 'Check spelling or use a valid Gen 3 Pokemon name'
    //   });
    // } else {
    //   // Check if it's a Gen 3 Pokemon
    //   if (pokemonDetails.dex_number > 386) {
    //     warnings.push({
    //       level: VALIDATION_LEVELS.WARNING,
    //       category: VALIDATION_CATEGORIES.POKEMON,
    //       message: `${pokemon.species} is not from Generation 3 (Dex #${pokemonDetails.dex_number})`,
    //       code: 'NON_GEN3_POKEMON',
    //       field: 'species',
    //       suggestion: 'Consider using a Gen 1-3 Pokemon for better compatibility'
    //     });
    //   }
    // }

    return { issues, warnings, suggestions };
  };

  /**
   * Pokemon Stats Validator
   */
  validatePokemonStats = (pokemon, _options = {}) => {
    const issues = [];
    const warnings = [];
    const suggestions = [];

    if (!pokemon?.base_stats) {
      warnings.push({
        level: VALIDATION_LEVELS.WARNING,
        category: VALIDATION_CATEGORIES.STATS,
        message: "Pokemon base stats are missing",
        code: "MISSING_STATS",
        field: "base_stats",
      });
      return { issues, warnings, suggestions };
    }

    const stats = pokemon.base_stats;
    const requiredStats = [
      "hp",
      "attack",
      "defense",
      "sp_attack",
      "sp_defense",
      "speed",
    ];

    for (const statName of requiredStats) {
      const statValue = stats[statName];

      if (statValue === undefined || statValue === null) {
        issues.push({
          level: VALIDATION_LEVELS.ERROR,
          category: VALIDATION_CATEGORIES.STATS,
          message: `Missing ${statName} stat`,
          code: "MISSING_STAT",
          field: `base_stats.${statName}`,
        });
        continue;
      }

      if (typeof statValue !== "number" || statValue < 1 || statValue > 255) {
        issues.push({
          level: VALIDATION_LEVELS.ERROR,
          category: VALIDATION_CATEGORIES.STATS,
          message: `Invalid ${statName} stat: ${statValue} (must be 1-255)`,
          code: "INVALID_STAT_VALUE",
          field: `base_stats.${statName}`,
        });
      }

      // Warn about unusually low/high stats
      if (statValue < 20) {
        warnings.push({
          level: VALIDATION_LEVELS.WARNING,
          category: VALIDATION_CATEGORIES.STATS,
          message: `Very low ${statName} stat: ${statValue}`,
          code: "LOW_STAT",
          field: `base_stats.${statName}`,
        });
      } else if (statValue > 150) {
        warnings.push({
          level: VALIDATION_LEVELS.WARNING,
          category: VALIDATION_CATEGORIES.STATS,
          message: `Very high ${statName} stat: ${statValue}`,
          code: "HIGH_STAT",
          field: `base_stats.${statName}`,
        });
      }
    }

    // Calculate and validate BST
    const bst = requiredStats.reduce(
      (total, stat) => total + (stats[stat] || 0),
      0
    );
    if (bst < 200) {
      warnings.push({
        level: VALIDATION_LEVELS.WARNING,
        category: VALIDATION_CATEGORIES.STATS,
        message: `Very low Base Stat Total: ${bst}`,
        code: "LOW_BST",
        suggestion: "Consider if this Pokemon is suitable for competitive play",
      });
    } else if (bst > 600) {
      warnings.push({
        level: VALIDATION_LEVELS.WARNING,
        category: VALIDATION_CATEGORIES.STATS,
        message: `Very high Base Stat Total: ${bst} (Legendary-tier)`,
        code: "HIGH_BST",
        suggestion: "This may be overpowered for regular trainers",
      });
    }

    return { issues, warnings, suggestions };
  };

  /**
   * Pokemon Types Validator
   */
  validatePokemonTypes = (pokemon, _options = {}) => {
    const issues = [];
    const warnings = [];
    const suggestions = [];

    const validTypes = [
      "Normal",
      "Fire",
      "Water",
      "Electric",
      "Grass",
      "Ice",
      "Fighting",
      "Poison",
      "Ground",
      "Flying",
      "Psychic",
      "Bug",
      "Rock",
      "Ghost",
      "Dragon",
      "Dark",
      "Steel",
      "Fairy",
    ];

    if (!pokemon?.types || !Array.isArray(pokemon.types)) {
      issues.push({
        level: VALIDATION_LEVELS.ERROR,
        category: VALIDATION_CATEGORIES.POKEMON,
        message: "Pokemon types are missing or invalid",
        code: "MISSING_TYPES",
        field: "types",
      });
      return { issues, warnings, suggestions };
    }

    if (pokemon.types.length === 0) {
      issues.push({
        level: VALIDATION_LEVELS.ERROR,
        category: VALIDATION_CATEGORIES.POKEMON,
        message: "Pokemon must have at least one type",
        code: "NO_TYPES",
        field: "types",
      });
    } else if (pokemon.types.length > 2) {
      issues.push({
        level: VALIDATION_LEVELS.ERROR,
        category: VALIDATION_CATEGORIES.POKEMON,
        message: `Pokemon cannot have more than 2 types (has ${pokemon.types.length})`,
        code: "TOO_MANY_TYPES",
        field: "types",
      });
    }

    // Validate each type
    pokemon.types.forEach((type, index) => {
      if (!validTypes.includes(type)) {
        issues.push({
          level: VALIDATION_LEVELS.ERROR,
          category: VALIDATION_CATEGORIES.POKEMON,
          message: `Invalid Pokemon type: ${type}`,
          code: "INVALID_TYPE",
          field: `types[${index}]`,
          suggestion: `Valid types: ${validTypes.join(", ")}`,
        });
      }
    });

    // Check for duplicate types
    if (pokemon.types.length === 2 && pokemon.types[0] === pokemon.types[1]) {
      warnings.push({
        level: VALIDATION_LEVELS.WARNING,
        category: VALIDATION_CATEGORIES.POKEMON,
        message: `Duplicate type: ${pokemon.types[0]}`,
        code: "DUPLICATE_TYPE",
        field: "types",
        suggestion: "Pokemon should have distinct primary and secondary types",
      });
    }

    return { issues, warnings, suggestions };
  };

  /**
   * Pokemon Moves Validator
   */
  validatePokemonMoves = (pokemon, _options = {}) => {
    const issues = [];
    const warnings = [];
    const suggestions = [];

    if (!pokemon?.moves) {
      warnings.push({
        level: VALIDATION_LEVELS.WARNING,
        category: VALIDATION_CATEGORIES.MOVE,
        message: "Pokemon has no moves assigned",
        code: "NO_MOVES",
        field: "moves",
        suggestion: "Assign 1-4 moves for competitive viability",
      });
      return { issues, warnings, suggestions };
    }

    if (!Array.isArray(pokemon.moves)) {
      issues.push({
        level: VALIDATION_LEVELS.ERROR,
        category: VALIDATION_CATEGORIES.MOVE,
        message: "Pokemon moves must be an array",
        code: "INVALID_MOVES_FORMAT",
        field: "moves",
      });
      return { issues, warnings, suggestions };
    }

    if (pokemon.moves.length > 4) {
      issues.push({
        level: VALIDATION_LEVELS.ERROR,
        category: VALIDATION_CATEGORIES.MOVE,
        message: `Pokemon cannot have more than 4 moves (has ${pokemon.moves.length})`,
        code: "TOO_MANY_MOVES",
        field: "moves",
      });
    }

    // Check for duplicate moves
    const uniqueMoves = new Set(pokemon.moves);
    if (uniqueMoves.size < pokemon.moves.length) {
      warnings.push({
        level: VALIDATION_LEVELS.WARNING,
        category: VALIDATION_CATEGORIES.MOVE,
        message: "Pokemon has duplicate moves",
        code: "DUPLICATE_MOVES",
        field: "moves",
        suggestion: "Each move slot should have a unique move",
      });
    }

    // Validate individual moves (basic validation - could be expanded with move database)
    pokemon.moves.forEach((move, index) => {
      if (!move || typeof move !== "string") {
        issues.push({
          level: VALIDATION_LEVELS.ERROR,
          category: VALIDATION_CATEGORIES.MOVE,
          message: `Invalid move at position ${index + 1}`,
          code: "INVALID_MOVE",
          field: `moves[${index}]`,
        });
      } else if (move.length > 50) {
        warnings.push({
          level: VALIDATION_LEVELS.WARNING,
          category: VALIDATION_CATEGORIES.MOVE,
          message: `Very long move name: ${move}`,
          code: "LONG_MOVE_NAME",
          field: `moves[${index}]`,
        });
      }
    });

    return { issues, warnings, suggestions };
  };

  /**
   * Trainer Basic Validator
   */
  validateTrainerBasic = (trainer, _options = {}) => {
    const issues = [];
    const warnings = [];
    const suggestions = [];

    // Required fields
    const requiredFields = ["name", "class", "sprite"];
    for (const field of requiredFields) {
      if (!trainer?.[field]) {
        issues.push({
          level: VALIDATION_LEVELS.ERROR,
          category: VALIDATION_CATEGORIES.TRAINER,
          message: `Trainer ${field} is required`,
          code: "MISSING_REQUIRED_FIELD",
          field,
        });
      }
    }

    // Name validation
    if (trainer?.name) {
      if (trainer.name.length > 50) {
        warnings.push({
          level: VALIDATION_LEVELS.WARNING,
          category: VALIDATION_CATEGORIES.TRAINER,
          message: `Trainer name is very long: ${trainer.name.length} characters`,
          code: "LONG_NAME",
          field: "name",
        });
      }
      if (trainer.name.length < 2) {
        warnings.push({
          level: VALIDATION_LEVELS.WARNING,
          category: VALIDATION_CATEGORIES.TRAINER,
          message: "Trainer name is very short",
          code: "SHORT_NAME",
          field: "name",
        });
      }
    }

    return { issues, warnings, suggestions };
  };

  /**
   * Trainer Levels Validator
   */
  validateTrainerLevels = (trainer, _options = {}) => {
    const issues = [];
    const warnings = [];
    const suggestions = [];

    if (trainer?.level_min !== undefined && trainer?.level_max !== undefined) {
      if (trainer.level_min > trainer.level_max) {
        issues.push({
          level: VALIDATION_LEVELS.ERROR,
          category: VALIDATION_CATEGORIES.LEVEL,
          message: `Min level (${trainer.level_min}) cannot be greater than max level (${trainer.level_max})`,
          code: "INVALID_LEVEL_RANGE",
          fields: ["level_min", "level_max"],
        });
      }

      if (trainer.level_min < 1 || trainer.level_max > 100) {
        issues.push({
          level: VALIDATION_LEVELS.ERROR,
          category: VALIDATION_CATEGORIES.LEVEL,
          message: "Trainer levels must be between 1 and 100",
          code: "LEVEL_OUT_OF_RANGE",
          fields: ["level_min", "level_max"],
        });
      }

      // Check for reasonable level ranges
      const levelRange = trainer.level_max - trainer.level_min;
      if (levelRange > 20) {
        warnings.push({
          level: VALIDATION_LEVELS.WARNING,
          category: VALIDATION_CATEGORIES.LEVEL,
          message: `Very wide level range: ${levelRange} levels`,
          code: "WIDE_LEVEL_RANGE",
          fields: ["level_min", "level_max"],
          suggestion:
            "Consider narrowing the level range for more balanced teams",
        });
      }
    }

    return { issues, warnings, suggestions };
  };

  /**
   * Team Composition Validator
   */
  validateTeamComposition = (team, _options = {}) => {
    const issues = [];
    const warnings = [];
    const suggestions = [];

    if (!Array.isArray(team)) {
      issues.push({
        level: VALIDATION_LEVELS.ERROR,
        category: VALIDATION_CATEGORIES.TEAM,
        message: "Team must be an array",
        code: "INVALID_TEAM_FORMAT",
      });
      return { issues, warnings, suggestions };
    }

    if (team.length === 0) {
      warnings.push({
        level: VALIDATION_LEVELS.WARNING,
        category: VALIDATION_CATEGORIES.TEAM,
        message: "Team is empty",
        code: "EMPTY_TEAM",
        suggestion: "Add 1-6 Pokemon to create a team",
      });
    } else if (team.length > 6) {
      issues.push({
        level: VALIDATION_LEVELS.ERROR,
        category: VALIDATION_CATEGORIES.TEAM,
        message: `Team cannot have more than 6 Pokemon (has ${team.length})`,
        code: "TEAM_TOO_LARGE",
      });
    }

    // Check for duplicate Pokemon
    const speciesCount = {};
    team.forEach((pokemon, index) => {
      if (pokemon?.species) {
        speciesCount[pokemon.species] =
          (speciesCount[pokemon.species] || 0) + 1;
        if (speciesCount[pokemon.species] > 1) {
          warnings.push({
            level: VALIDATION_LEVELS.WARNING,
            category: VALIDATION_CATEGORIES.TEAM,
            message: `Duplicate Pokemon: ${pokemon.species}`,
            code: "DUPLICATE_POKEMON",
            field: `team[${index}].species`,
            suggestion: "Consider using different Pokemon for variety",
          });
        }
      }
    });

    return { issues, warnings, suggestions };
  };

  /**
   * Team Balance Validator
   */
  validateTeamBalance = (team, _options = {}) => {
    const issues = [];
    const warnings = [];
    const suggestions = [];

    if (!Array.isArray(team) || team.length === 0) {
      return { issues, warnings, suggestions };
    }

    // Type distribution analysis
    const typeCount = {};
    const validPokemon = team.filter((p) => p?.types);

    validPokemon.forEach((pokemon) => {
      pokemon.types.forEach((type) => {
        typeCount[type] = (typeCount[type] || 0) + 1;
      });
    });

    // Check for type diversity
    const uniqueTypes = Object.keys(typeCount).length;
    if (uniqueTypes < 3 && validPokemon.length >= 3) {
      warnings.push({
        level: VALIDATION_LEVELS.WARNING,
        category: VALIDATION_CATEGORIES.TEAM,
        message: `Low type diversity: only ${uniqueTypes} different types`,
        code: "LOW_TYPE_DIVERSITY",
        suggestion:
          "Consider adding Pokemon with different types for better coverage",
      });
    }

    // Check for over-representation of single type
    Object.entries(typeCount).forEach(([type, count]) => {
      if (count >= 4) {
        warnings.push({
          level: VALIDATION_LEVELS.WARNING,
          category: VALIDATION_CATEGORIES.TEAM,
          message: `Too many ${type}-type Pokemon (${count})`,
          code: "TYPE_OVERREPRESENTATION",
          suggestion: `Consider replacing some ${type}-types with other types`,
        });
      }
    });

    return { issues, warnings, suggestions };
  };

  /**
   * Level Range Validator
   */
  validateLevelRange = (data, _options = {}) => {
    const issues = [];
    const warnings = [];
    const suggestions = [];

    const { level, min_level = 1, max_level = 100 } = data;

    if (level !== undefined) {
      if (typeof level !== "number" || level < 1 || level > 100) {
        issues.push({
          level: VALIDATION_LEVELS.ERROR,
          category: VALIDATION_CATEGORIES.LEVEL,
          message: `Invalid level: ${level} (must be 1-100)`,
          code: "INVALID_LEVEL",
        });
      } else if (level < min_level || level > max_level) {
        warnings.push({
          level: VALIDATION_LEVELS.WARNING,
          category: VALIDATION_CATEGORIES.LEVEL,
          message: `Level ${level} is outside expected range (${min_level}-${max_level})`,
          code: "LEVEL_OUT_OF_EXPECTED_RANGE",
        });
      }
    }

    return { issues, warnings, suggestions };
  };

  /**
   * Get validation history
   */
  getValidationHistory(limit = 50) {
    return this.validationHistory.slice(-limit);
  }

  /**
   * Clear validation history
   */
  clearHistory() {
    this.validationHistory = [];
  }

  /**
   * Get validator statistics
   */
  getStats() {
    const stats = {
      totalValidations: this.validationHistory.length,
      categories: {},
      levels: {},
    };

    this.validationHistory.forEach((result) => {
      // Category stats
      if (!stats.categories[result.category]) {
        stats.categories[result.category] = { total: 0, valid: 0, invalid: 0 };
      }
      stats.categories[result.category].total++;
      if (result.valid) {
        stats.categories[result.category].valid++;
      } else {
        stats.categories[result.category].invalid++;
      }

      // Level stats
      result.issues.forEach((issue) => {
        if (!stats.levels[issue.level]) {
          stats.levels[issue.level] = 0;
        }
        stats.levels[issue.level]++;
      });
    });

    return stats;
  }
}

// Global validation engine instance
export const validationEngine = new ValidationEngine();

// Convenience functions for common validations
export const validatePokemon = (pokemon, options = {}) =>
  validationEngine.validate(pokemon, VALIDATION_CATEGORIES.POKEMON, options);

export const validateTrainer = (trainer, options = {}) =>
  validationEngine.validate(trainer, VALIDATION_CATEGORIES.TRAINER, options);

export const validateTeam = (team, options = {}) =>
  validationEngine.validate(team, VALIDATION_CATEGORIES.TEAM, options);

export default ValidationEngine;
