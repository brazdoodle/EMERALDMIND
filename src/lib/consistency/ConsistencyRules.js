/**
 * Consistency Rules - Task-specific validation rules and constraints
 * Provides structured validation for TrainerArchitect, ScriptSage, and other LLM tasks
 */

import { OutputValidator } from './OutputValidators.js';

/**
 * Base consistency rule class
 */
class BaseConsistencyRule {
  constructor(taskType, options = {}) {
    this.taskType = taskType;
    this.strictMode = options.strictMode || false;
    this.autoRepair = options.autoRepair !== false; // Default true
    this.customValidators = options.customValidators || [];
  }

  /**
   * Validate output against task-specific rules
   * @param {*} output - Parsed output to validate
   * @param {Object} context - Additional context for validation
   * @returns {Object} { valid: boolean, errors: string[], warnings: string[], repaired: any }
   */
  validate(output, context = {}) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      repaired: null
    };

    // Run base validation
    this.validateBase(output, result, context);

    // Run task-specific validation
    this.validateTaskSpecific(output, result, context);

    // Run custom validators
    for (const validator of this.customValidators) {
      try {
        const customResult = validator(output, context);
        if (customResult.errors) result.errors.push(...customResult.errors);
        if (customResult.warnings) result.warnings.push(...customResult.warnings);
        if (!customResult.valid) result.valid = false;
      } catch (error) {
        result.errors.push(`Custom validator error: ${error.message}`);
        result.valid = false;
      }
    }

    // Attempt repair if needed and enabled
    if (!result.valid && this.autoRepair) {
      const repaired = this.attemptRepair(output, result.errors, context);
      if (repaired && repaired !== output) {
        result.repaired = repaired;
        // Re-validate repaired output
        const repairedResult = this.validate(repaired, context);
        if (repairedResult.valid) {
          result.valid = true;
          result.errors = [];
          result.warnings.push('Output was automatically repaired');
        }
      }
    }

    return result;
  }

  /**
   * Base validation common to all tasks
   */
  validateBase(output, result, context) {
    if (output === null || output === undefined) {
      result.valid = false;
      result.errors.push('Output is null or undefined');
      return;
    }

    if (typeof output === 'string' && output.trim().length === 0) {
      result.valid = false;
      result.errors.push('Output is empty');
      return;
    }
  }

  /**
   * Task-specific validation (to be overridden)
   */
  validateTaskSpecific(output, result, context) {
    // Override in subclasses
  }

  /**
   * Attempt to repair invalid output (to be overridden)
   */
  attemptRepair(output, errors, context) {
    return null; // Override in subclasses
  }
}

/**
 * Trainer generation consistency rules
 */
export class TrainerConsistencyRule extends BaseConsistencyRule {
  constructor(options = {}) {
    super('trainer', options);
    this.requiredFields = ['name', 'trainerClass', 'pokemon'];
    this.optionalFields = ['intro', 'loss', 'items', 'ai'];
  }

  validateTaskSpecific(output, result, context) {
    // Must be an object
    if (typeof output !== 'object' || Array.isArray(output)) {
      result.valid = false;
      result.errors.push('Trainer must be an object, not ' + (Array.isArray(output) ? 'array' : typeof output));
      return;
    }

    // Check required fields
    for (const field of this.requiredFields) {
      if (!(field in output) || output[field] === null || output[field] === undefined) {
        result.valid = false;
        result.errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate name
    if (output.name) {
      if (typeof output.name !== 'string' || output.name.trim().length === 0) {
        result.valid = false;
        result.errors.push('Trainer name must be a non-empty string');
      } else if (output.name.length > 50) {
        result.warnings.push('Trainer name is very long (>50 chars)');
      }
    }

    // Validate trainer class
    if (output.trainerClass) {
      const validClasses = [
        'YOUNGSTER', 'LASS', 'SCHOOL_KID', 'RICH_BOY', 'LADY',
        'BEAUTY', 'COOLTRAINER', 'EXPERT', 'ELITE_FOUR', 'CHAMPION',
        'TEAM_AQUA', 'TEAM_MAGMA', 'GYM_LEADER', 'ROCKET_GRUNT'
      ];
      if (!validClasses.includes(output.trainerClass)) {
        result.warnings.push(`Unusual trainer class: ${output.trainerClass}`);
      }
    }

    // Validate pokemon array
    if (output.pokemon) {
      if (!Array.isArray(output.pokemon)) {
        result.valid = false;
        result.errors.push('Pokemon must be an array');
      } else {
        if (output.pokemon.length === 0) {
          result.valid = false;
          result.errors.push('Trainer must have at least one Pokemon');
        } else if (output.pokemon.length > 6) {
          result.valid = false;
          result.errors.push('Trainer cannot have more than 6 Pokemon');
        }

        // Validate each Pokemon
        output.pokemon.forEach((pokemon, index) => {
          this.validatePokemon(pokemon, index, result);
        });
      }
    }

    // Validate AI flags
    if (output.ai) {
      const validAiFlags = [
        'AI_FLAG_CHECK_BAD_MOVE', 'AI_FLAG_TRY_TO_FAINT', 'AI_FLAG_CHECK_VIABILITY',
        'AI_FLAG_SETUP_FIRST_TURN', 'AI_FLAG_RISKY', 'AI_FLAG_PREFER_STRONGEST_MOVE',
        'AI_FLAG_PREFER_BATON_PASS', 'AI_FLAG_DOUBLE_BATTLE'
      ];
      if (Array.isArray(output.ai)) {
        for (const flag of output.ai) {
          if (!validAiFlags.includes(flag)) {
            result.warnings.push(`Unknown AI flag: ${flag}`);
          }
        }
      }
    }
  }

  validatePokemon(pokemon, index, result) {
    if (typeof pokemon !== 'object' || Array.isArray(pokemon)) {
      result.valid = false;
      result.errors.push(`Pokemon ${index + 1} must be an object`);
      return;
    }

    // Required Pokemon fields
    const requiredPokemonFields = ['species', 'level'];
    for (const field of requiredPokemonFields) {
      if (!(field in pokemon)) {
        result.valid = false;
        result.errors.push(`Pokemon ${index + 1} missing required field: ${field}`);
      }
    }

    // Validate level
    if (pokemon.level !== undefined) {
      if (!Number.isInteger(pokemon.level) || pokemon.level < 1 || pokemon.level > 100) {
        result.valid = false;
        result.errors.push(`Pokemon ${index + 1} level must be integer 1-100, got: ${pokemon.level}`);
      }
    }

    // Validate moves array
    if (pokemon.moves) {
      if (!Array.isArray(pokemon.moves)) {
        result.valid = false;
        result.errors.push(`Pokemon ${index + 1} moves must be an array`);
      } else if (pokemon.moves.length > 4) {
        result.valid = false;
        result.errors.push(`Pokemon ${index + 1} cannot have more than 4 moves`);
      }
    }

    // Validate held item
    if (pokemon.heldItem && typeof pokemon.heldItem !== 'string') {
      result.warnings.push(`Pokemon ${index + 1} held item should be a string`);
    }
  }

  attemptRepair(output, errors, context) {
    if (!output || typeof output !== 'object') return null;

    const repaired = { ...output };

    // Repair missing required fields with defaults
    if (!repaired.name || typeof repaired.name !== 'string') {
      repaired.name = 'Trainer';
    }
    if (!repaired.trainerClass) {
      repaired.trainerClass = 'COOLTRAINER';
    }
    if (!repaired.pokemon || !Array.isArray(repaired.pokemon)) {
      repaired.pokemon = [];
    }

    // Repair Pokemon array
    if (repaired.pokemon.length === 0) {
      repaired.pokemon.push({
        species: 'PIKACHU',
        level: 25,
        moves: ['THUNDERBOLT']
      });
    }

    // Fix Pokemon levels
    repaired.pokemon.forEach(pokemon => {
      if (!Number.isInteger(pokemon.level) || pokemon.level < 1 || pokemon.level > 100) {
        pokemon.level = Math.max(1, Math.min(100, parseInt(pokemon.level) || 25));
      }
      if (pokemon.moves && pokemon.moves.length > 4) {
        pokemon.moves = pokemon.moves.slice(0, 4);
      }
    });

    return repaired;
  }
}

/**
 * Script generation consistency rules
 */
export class ScriptConsistencyRule extends BaseConsistencyRule {
  constructor(options = {}) {
    super('script', options);
    this.flagMap = options.flagMap || {};
  }

  validateTaskSpecific(output, result, context) {
    if (typeof output !== 'string') {
      result.valid = false;
      result.errors.push('Script must be a string');
      return;
    }

    // Use HMA script validator
    const hmaValidation = OutputValidator.validate(output, 'hma_script', {
      flagMap: this.flagMap
    });

    if (!hmaValidation.valid) {
      result.valid = false;
      result.errors.push(...hmaValidation.errors);
    }

    // Additional script-specific checks
    const lines = output.split('\n').filter(line => line.trim());
    
    // Must have 'end' command
    if (!lines.some(line => line.trim().toLowerCase() === 'end')) {
      result.warnings.push('Script should end with "end" command');
    }

    // Check for common issues
    if (output.includes('setflag') && !output.includes('0x')) {
      result.warnings.push('setflag commands should use hex flag IDs (0x...)');
    }
  }

  attemptRepair(output, errors, context) {
    if (typeof output !== 'string') return null;

    let repaired = output;

    // Use HMA validator's repair
    const hmaValidation = OutputValidator.validate(output, 'hma_script', {
      flagMap: this.flagMap
    });

    if (hmaValidation.repaired) {
      repaired = hmaValidation.repaired;
    }

    // Add 'end' if missing
    const lines = repaired.split('\n');
    if (!lines.some(line => line.trim().toLowerCase() === 'end')) {
      repaired += '\nend';
    }

    return repaired;
  }
}

/**
 * Pokemon data consistency rules
 */
export class PokemonConsistencyRule extends BaseConsistencyRule {
  constructor(options = {}) {
    super('pokemon', options);
  }

  validateTaskSpecific(output, result, context) {
    if (typeof output !== 'object' || Array.isArray(output)) {
      result.valid = false;
      result.errors.push('Pokemon data must be an object');
      return;
    }

    const requiredFields = ['species', 'level'];
    for (const field of requiredFields) {
      if (!(field in output)) {
        result.valid = false;
        result.errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate level
    if (output.level !== undefined) {
      if (!Number.isInteger(output.level) || output.level < 1 || output.level > 100) {
        result.valid = false;
        result.errors.push(`Level must be integer 1-100, got: ${output.level}`);
      }
    }

    // Validate moves
    if (output.moves) {
      if (!Array.isArray(output.moves)) {
        result.valid = false;
        result.errors.push('Moves must be an array');
      } else if (output.moves.length > 4) {
        result.valid = false;
        result.errors.push('Pokemon cannot have more than 4 moves');
      }
    }

    // Validate stats if present
    if (output.stats) {
      const validStats = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'];
      for (const [stat, value] of Object.entries(output.stats)) {
        if (!validStats.includes(stat)) {
          result.warnings.push(`Unknown stat: ${stat}`);
        }
        if (typeof value !== 'number' || value < 0 || value > 255) {
          result.errors.push(`Stat ${stat} must be number 0-255, got: ${value}`);
          result.valid = false;
        }
      }
    }
  }

  attemptRepair(output, errors, context) {
    if (!output || typeof output !== 'object') return null;

    const repaired = { ...output };

    // Fix level
    if (!Number.isInteger(repaired.level) || repaired.level < 1 || repaired.level > 100) {
      repaired.level = Math.max(1, Math.min(100, parseInt(repaired.level) || 25));
    }

    // Fix moves array
    if (repaired.moves && Array.isArray(repaired.moves) && repaired.moves.length > 4) {
      repaired.moves = repaired.moves.slice(0, 4);
    }

    // Fix stats
    if (repaired.stats) {
      for (const [stat, value] of Object.entries(repaired.stats)) {
        if (typeof value !== 'number' || value < 0 || value > 255) {
          repaired.stats[stat] = Math.max(0, Math.min(255, parseInt(value) || 0));
        }
      }
    }

    return repaired;
  }
}

/**
 * Generic text consistency rules
 */
export class TextConsistencyRule extends BaseConsistencyRule {
  constructor(options = {}) {
    super('text', options);
    this.maxLength = options.maxLength || 1000;
    this.minLength = options.minLength || 1;
    this.allowedPatterns = options.allowedPatterns || [];
    this.bannedPatterns = options.bannedPatterns || [];
  }

  validateTaskSpecific(output, result, context) {
    if (typeof output !== 'string') {
      result.valid = false;
      result.errors.push('Text output must be a string');
      return;
    }

    // Length checks
    if (output.length < this.minLength) {
      result.valid = false;
      result.errors.push(`Text too short (${output.length} < ${this.minLength})`);
    }
    if (output.length > this.maxLength) {
      if (this.strictMode) {
        result.valid = false;
        result.errors.push(`Text too long (${output.length} > ${this.maxLength})`);
      } else {
        result.warnings.push(`Text very long (${output.length} > ${this.maxLength})`);
      }
    }

    // Pattern checks
    for (const pattern of this.bannedPatterns) {
      if (pattern.test(output)) {
        result.valid = false;
        result.errors.push(`Text contains banned pattern: ${pattern}`);
      }
    }

    if (this.allowedPatterns.length > 0) {
      const matches = this.allowedPatterns.some(pattern => pattern.test(output));
      if (!matches) {
        result.warnings.push('Text does not match any allowed patterns');
      }
    }
  }

  attemptRepair(output, errors, context) {
    if (typeof output !== 'string') return null;

    let repaired = output;

    // Truncate if too long
    if (repaired.length > this.maxLength) {
      repaired = repaired.substring(0, this.maxLength).trim();
    }

    // Remove banned patterns (simple replacement)
    for (const pattern of this.bannedPatterns) {
      repaired = repaired.replace(pattern, '');
    }

    return repaired.trim();
  }
}

/**
 * Consistency rule factory
 */
export class ConsistencyRuleFactory {
  static createRule(taskType, options = {}) {
    switch (taskType.toLowerCase()) {
      case 'trainer':
        return new TrainerConsistencyRule(options);
      case 'script':
      case 'hma_script':
        return new ScriptConsistencyRule(options);
      case 'pokemon':
        return new PokemonConsistencyRule(options);
      case 'text':
      default:
        return new TextConsistencyRule(options);
    }
  }

  static validateOutput(output, taskType, options = {}) {
    const rule = this.createRule(taskType, options);
    return rule.validate(output, options.context || {});
  }
}

export default {
  BaseConsistencyRule,
  TrainerConsistencyRule,
  ScriptConsistencyRule,
  PokemonConsistencyRule,
  TextConsistencyRule,
  ConsistencyRuleFactory
};