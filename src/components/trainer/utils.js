/**
 * Trainer Architect Utilities
 * Shared functions for trainer generation and validation
 */

import { TRADE_EVOLUTION_CONSTRAINTS, BST_RANGES, TRAINER_NAMES } from './constants.js';

/**
 * Get a random trainer name
 */
export function getRandomTrainerName() {
  return TRAINER_NAMES[Math.floor(Math.random() * TRAINER_NAMES.length)];
}

/**
 * Validate if a Pokemon species can appear at a given level
 * Based on evolution constraints and competitive balance
 */
export function validatePokemonLevel(species, level) {
  const issues = [];
  
  // Check trade evolution constraints
  if (TRADE_EVOLUTION_CONSTRAINTS[species]) {
    const constraint = TRADE_EVOLUTION_CONSTRAINTS[species];
    if (level < constraint.minLevel) {
      issues.push({
        type: 'trade_evolution',
        message: `${species} requires level ${constraint.minLevel}+ (trade evolution)`,
        suggestion: `Use ${constraint.preEvolution} instead`
      });
    }
  }
  
  // Check for other problematic early appearances
  const lateGameLegendaries = ['Mewtwo', 'Mew', 'Celebi', 'Kyogre', 'Groudon', 'Rayquaza'];
  if (lateGameLegendaries.includes(species) && level < 70) {
    issues.push({
      type: 'legendary_early',
      message: `${species} too powerful for level ${level}`,
      suggestion: 'Use legendary only in post-game or level 70+'
    });
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Calculate BST range for difficulty
 */
export function getBSTRange(difficulty) {
  return BST_RANGES[difficulty] || BST_RANGES['Medium'];
}

/**
 * Format team for display
 */
export function formatTeamDisplay(team) {
  return team.map((pokemon, index) => ({
    position: index + 1,
    species: pokemon.species,
    level: pokemon.level,
    moves: pokemon.moves || [],
    displayName: `${pokemon.species} (Lv.${pokemon.level})`
  }));
}

/**
 * Generate trainer summary statistics
 */
export function generateTrainerStats(trainer) {
  const stats = {
    totalPokemon: trainer.party.length,
    averageLevel: 0,
    levelRange: { min: 100, max: 1 },
    uniqueTypes: new Set(),
    hasLegendaries: false
  };
  
  if (trainer.party.length === 0) {
    return stats;
  }
  
  let totalLevels = 0;
  
  trainer.party.forEach(pokemon => {
    totalLevels += pokemon.level;
    stats.levelRange.min = Math.min(stats.levelRange.min, pokemon.level);
    stats.levelRange.max = Math.max(stats.levelRange.max, pokemon.level);
    
    // This would need Pokemon data to determine types and legendary status
    // For now, simplified checks
    const legendaries = ['Mewtwo', 'Mew', 'Celebi', 'Kyogre', 'Groudon', 'Rayquaza'];
    if (legendaries.includes(pokemon.species)) {
      stats.hasLegendaries = true;
    }
  });
  
  stats.averageLevel = Math.round(totalLevels / trainer.party.length);
  
  return stats;
}

/**
 * Validate complete trainer data
 */
export function validateTrainer(trainer) {
  const errors = [];
  const warnings = [];
  
  // Basic validation
  if (!trainer.name || trainer.name.trim().length === 0) {
    errors.push('Trainer name is required');
  }
  
  if (trainer.level_min > trainer.level_max) {
    errors.push('Minimum level cannot be higher than maximum level');
  }
  
  if (trainer.party.length === 0) {
    warnings.push('Trainer has no Pokémon in party');
  }
  
  if (trainer.party.length > 6) {
    errors.push('Trainer cannot have more than 6 Pokémon');
  }
  
  // Validate each Pokemon
  trainer.party.forEach((pokemon, index) => {
    const validation = validatePokemonLevel(pokemon.species, pokemon.level);
    if (!validation.valid) {
      validation.issues.forEach(issue => {
        warnings.push(`Pokémon ${index + 1}: ${issue.message}`);
      });
    }
    
    if (pokemon.level < trainer.level_min || pokemon.level > trainer.level_max) {
      warnings.push(`Pokémon ${index + 1} level ${pokemon.level} outside trainer range ${trainer.level_min}-${trainer.level_max}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Export team to various formats
 */
export function exportTeam(trainer, format = 'json') {
  switch (format) {
    case 'showdown':
      return trainer.party.map(pokemon => {
        const moves = pokemon.moves && pokemon.moves.length > 0 
          ? pokemon.moves.map(move => `- ${move}`).join('\n')
          : '- Tackle\n- Growl';
        
        return `${pokemon.species} @ Leftovers\nLevel: ${pokemon.level}\n${moves}\n`;
      }).join('\n');
      
    case 'csv':
      const header = 'Species,Level,Move1,Move2,Move3,Move4\n';
      const rows = trainer.party.map(pokemon => {
        const moves = pokemon.moves || [];
        return `${pokemon.species},${pokemon.level},${moves[0] || ''},${moves[1] || ''},${moves[2] || ''},${moves[3] || ''}`;
      }).join('\n');
      return header + rows;
      
    case 'json':
    default:
      return JSON.stringify(trainer, null, 2);
  }
}

/**
 * Generate changelog entry
 */
export function createChangelogEntry(action, trainer, details = '') {
  return {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    action,
    trainerName: trainer.name,
    trainerId: trainer.id,
    details,
    data: {
      level_range: `${trainer.level_min}-${trainer.level_max}`,
      biome: trainer.biome,
      theme: trainer.theme,
      difficulty: trainer.difficulty,
      party_size: trainer.party.length
    }
  };
}