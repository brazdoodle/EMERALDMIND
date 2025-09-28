/**
 * Enhanced Team Generator with Authentic Gen 3 Logic
 * Refactored for better organization and trusted source data
 */

import { generateTeamProgrammatically } from './TeamGenerator.js';
import { downscaleSpeciesForLevel } from './evolutionRules.js';
import { AUTHENTIC_ENCOUNTERS, TRADE_EVOLUTION_CONSTRAINTS, BST_RANGES } from './constants.js';
import { validatePokemonLevel, getBSTRange } from './utils.js';

export class AuthenticTeamGenerator {
  
  /**
   * Generate an authentic Gen 3 trainer team
   */
  async generateAuthenticTeam(options = {}) {
    const {
      biome = 'Grassland',
      theme = 'Balanced',
      difficulty = 'Medium',
      teamSize = 6,
      minLevel = 20,
      maxLevel = 30,
      enforceAuthenticity = true
    } = options;

    try {
      // Generate base team using existing system
      const baseTeam = await generateTeamProgrammatically({
        biome,
        theme,
        difficulty,
        teamSize,
        minLevel,
        maxLevel
      });

      // Apply evolution constraints
      const constrainedTeam = this.applyEvolutionConstraints(baseTeam);

      // Validate authenticity if enabled
      if (enforceAuthenticity) {
        const validation = this.validateAuthenticity(constrainedTeam, biome, { minLevel, maxLevel });
        
        return {
          team: constrainedTeam,
          validation,
          metadata: {
            biome,
            theme,
            difficulty,
            authentic: validation.valid,
            constraints_applied: constrainedTeam.filter(p => p.downscaled).length
          }
        };
      }

      return {
        team: constrainedTeam,
        metadata: { biome, theme, difficulty, authentic: false }
      };

    } catch (_error) {
      console.error('Error generating authentic team:', error);
      throw new Error(`Team generation failed: ${error.message}`);
    }
  }

  /**
   * Apply evolution constraints to prevent unrealistic Pokemon
   */
  applyEvolutionConstraints(team) {
    return team.map(pokemon => {
      const result = downscaleSpeciesForLevel(pokemon.species, pokemon.level);
      
      if (result.changed) {
        return {
          ...pokemon,
          species: result.species,
          originalSpecies: pokemon.species,
          downscaled: true,
          constraint_reason: 'Evolution level requirement'
        };
      }
      
      return pokemon;
    });
  }

  /**
   * Validate team against authentic Gen 3 standards
   */
  validateAuthenticity(team, biome, levelRange) {
    const issues = [];
    const warnings = [];
    
    const expectedEncounters = AUTHENTIC_ENCOUNTERS[biome] || AUTHENTIC_ENCOUNTERS['Grassland'];

    team.forEach((pokemon, index) => {
      // Check individual Pokemon validation
      const pokemonValidation = validatePokemonLevel(pokemon.species, pokemon.level);
      
      if (!pokemonValidation.valid) {
        pokemonValidation.issues.forEach(issue => {
          if (issue.type === 'trade_evolution') {
            issues.push(`${pokemon.species} at level ${pokemon.level} (${issue.message})`);
          } else {
            warnings.push(`${pokemon.species}: ${issue.message}`);
          }
        });
      }

      // Check biome appropriateness (simplified)
      const allExpectedPokemon = [
        ...expectedEncounters.common,
        ...expectedEncounters.uncommon,
        ...expectedEncounters.rare
      ];

      // This is a basic check - in full implementation would check evolution lines
      const isInBiome = allExpectedPokemon.includes(pokemon.species) || 
                        allExpectedPokemon.some(expected => 
                          this.isEvolutionOfBiomePokemon(pokemon.species, expected)
                        );
      
      if (!isInBiome && biome !== 'Grassland') { // Grassland is our generic fallback
        warnings.push(`${pokemon.species} unusual for ${biome} biome`);
      }
    });

    return {
      valid: issues.length === 0,
      issues,
      warnings,
      biomeInfo: expectedEncounters.description,
      expectedPokemon: expectedEncounters.common.slice(0, 3).join(', ') + '...'
    };
  }

  /**
   * Check if a Pokemon is an evolution of a biome-appropriate Pokemon
   * Simplified version - full implementation would need complete evolution data
   */
  isEvolutionOfBiomePokemon(species, biomeSpecies) {
    const commonEvolutions = {
      'Pidgey': ['Pidgeotto', 'Pidgeot'],
      'Poochyena': ['Mightyena'],
      'Wurmple': ['Silcoon', 'Cascoon', 'Beautifly', 'Dustox'],
      'Zigzagoon': ['Linoone'],
      'Zubat': ['Golbat', 'Crobat'],
      'Geodude': ['Graveler', 'Golem'],
      'Makuhita': ['Hariyama'],
      'Aron': ['Lairon', 'Aggron']
    };

    return commonEvolutions[biomeSpecies]?.includes(species) || false;
  }

  /**
   * Get encounter recommendations for a biome
   */
  getBiomeRecommendations(biome) {
    const encounters = AUTHENTIC_ENCOUNTERS[biome] || AUTHENTIC_ENCOUNTERS['Grassland'];
    
    return {
      biome,
      description: encounters.description,
      recommendations: {
        early_game: encounters.common,
        mid_game: encounters.uncommon,
        late_game: encounters.rare
      },
      source: 'Serebii.net encounter tables'
    };
  }

  /**
   * Generate multiple test teams for comparison
   */
  async generateTestBatch(options = {}, count = 3) {
    const teams = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const result = await this.generateAuthenticTeam(options);
        teams.push({
          id: i + 1,
          ...result
        });
      } catch (_error) {
        teams.push({
          id: i + 1,
          error: error.message
        });
      }
    }
    
    return teams;
  }
}

export const authenticTeamGenerator = new AuthenticTeamGenerator();