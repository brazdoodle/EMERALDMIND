import { pokemonService } from './PokemonService.js';
import { TeamCoverageAnalyzer } from './TeamCoverageAnalyzer.js';
import { Gen3TeamGenerator } from './Gen3TeamGenerator.js';
import { downscaleSpeciesForLevel } from '../components/trainer/evolutionRules.js';

/**
 * Authentic Trainer Generator for Gen 3 ROM hacking
 * 
 * Generates realistic trainer teams that respect:
 * - Evolution constraints by level
 * - Trade evolution minimum levels  
 * - Biome-appropriate Pokémon distributions
 * - Difficulty-based BST scaling
 * - Competitive team synergy
 */
export class AuthenticTrainerGenerator {
  constructor() {
    this.coverageAnalyzer = new TeamCoverageAnalyzer();
    this.gen3Generator = new Gen3TeamGenerator();
  }

  /**
   * Generate an authentic trainer team
   */
  async generateTrainerTeam(options = {}) {
    const {
      difficulty = 'medium',
      theme = 'balanced',
      biome = 'mixed',
      teamSize = 6,
      minLevel = 20,
      maxLevel = 30,
      allowLegendaries = false,
      enforceTheme = true
    } = options;

    try {
      // Use Gen3 authentic generation as base
      const baseTeam = await this.gen3Generator.generateRealisticTeam({
        biome,
        theme,
        difficulty,
        teamSize,
        minLevel,
        maxLevel
      });

      // Apply evolution constraints to ensure realistic levels
      const constrainedTeam = baseTeam.map(pokemon => {
        const result = downscaleSpeciesForLevel(pokemon.species, pokemon.level);
        if (result.changed) {
          return {
            ...pokemon,
            species: result.species,
            notes: `${pokemon.notes || ''} (downscaled from evolution)`.trim()
          };
        }
        return pokemon;
      });

      // Filter by difficulty BST ranges
      const filteredTeam = await this.filterByDifficulty(constrainedTeam, difficulty);

      // Analyze team coverage
      const coverage = this.coverageAnalyzer.analyzeTeam(filteredTeam, difficulty);

      return {
        team: filteredTeam,
        coverage,
        metadata: {
          difficulty,
          theme,
          biome,
          generation: 'Gen 3',
          authentic: true,
          teamScore: coverage.overallGrade,
          evolutionConstraints: true
        }
      };
    } catch (_error) {
      console.error('Error generating authentic trainer team:', _error);
      throw _error;
    }
  }

  /**
   * Filter team by difficulty BST ranges
   */
  async filterByDifficulty(team, difficulty) {
    const bstRanges = pokemonService.getDifficultyBSTRanges();
    const range = bstRanges[difficulty] || bstRanges.medium;

    const filteredTeam = [];
    
    for (const pokemon of team) {
      try {
        const species = await pokemonService.getPokemon(pokemon.species);
        if (species) {
          const bst = pokemonService.calculateBST(species);
          
          // Check if BST fits difficulty range
          if (bst >= range.min && bst <= range.max) {
            filteredTeam.push({
              ...pokemon,
              bst,
              species: species.name
            });
          } else {
            // Try to find a suitable replacement from the same biome
            const replacement = await this.findBSTReplacement(pokemon, range, team.length - filteredTeam.length);
            if (replacement) {
              filteredTeam.push(replacement);
            }
          }
        }
      } catch (_error) {
        console.warn(`Error processing ${pokemon.species}:`, error);
      }
    }

    return filteredTeam;
  }

  /**
   * Find a replacement Pokémon within BST range
   */
  async findBSTReplacement(originalPokemon, bstRange, remainingSlots) {
    try {
      // Get suitable Pokémon for the difficulty
      const suitablePokemon = await pokemonService.getSuitableForTrainer({
        difficulty: this.getBSTDifficulty(bstRange),
        minLevel: originalPokemon.level,
        maxLevel: originalPokemon.level + 2
      });

      // Find one that fits the level constraints
      for (const candidate of suitablePokemon.slice(0, 10)) {
        const result = downscaleSpeciesForLevel(candidate.name, originalPokemon.level);
        const finalSpecies = result.species;
        
        const species = await pokemonService.getPokemon(finalSpecies);
        if (species) {
          const bst = pokemonService.calculateBST(species);
          if (bst >= bstRange.min && bst <= bstRange.max) {
            return {
              species: finalSpecies,
              level: originalPokemon.level,
              bst,
              notes: `BST replacement for ${originalPokemon.species}`
            };
          }
        }
      }
    } catch (_error) {
      console.warn('Error finding BST replacement:', error);
    }
    
    return null;
  }

  /**
   * Convert BST range back to difficulty name
   */
  getBSTDifficulty(bstRange) {
    const ranges = pokemonService.getDifficultyBSTRanges();
    
    for (const [difficulty, range] of Object.entries(ranges)) {
      if (range.min === bstRange.min && range.max === bstRange.max) {
        return difficulty;
      }
    }
    
    return 'medium';
  }

  /**
   * Generate multiple trainer teams for testing
   */
  async generateTestBatch(count = 5, options = {}) {
    const teams = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const team = await this.generateTrainerTeam(options);
        teams.push({
          id: i + 1,
          ...team
        });
      } catch (_error) {
        console.error(`Error generating team ${i + 1}:`, error);
      }
    }
    
    return teams;
  }

  /**
   * Validate team for common issues
   */
  validateTeam(team) {
    const issues = [];
    
    for (const pokemon of team) {
      // Check for over-evolved Pokémon
      if (pokemon.species === 'Alakazam' && pokemon.level < 35) {
        issues.push(`${pokemon.species} at level ${pokemon.level} (trade evolution too early)`);
      }
      
      if (pokemon.species === 'Gengar' && pokemon.level < 35) {
        issues.push(`${pokemon.species} at level ${pokemon.level} (trade evolution too early)`);
      }
      
      if (pokemon.species === 'Machamp' && pokemon.level < 40) {
        issues.push(`${pokemon.species} at level ${pokemon.level} (trade evolution too early)`);
      }
      
      // Check for very high BST at low levels
      if (pokemon.bst > 500 && pokemon.level < 25) {
        issues.push(`${pokemon.species} has BST ${pokemon.bst} at level ${pokemon.level} (too powerful)`);
      }
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }
}

export const authenticTrainerGenerator = new AuthenticTrainerGenerator();