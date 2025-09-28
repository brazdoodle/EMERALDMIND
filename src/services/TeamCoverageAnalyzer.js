/**
 * Team Coverage Analysis System
 * 
 * Analyzes team weakness coverage and suggests improvements for competitive teams.
 * Higher difficulty trainers should have better coverage against common threats.
 */

import { typeChart } from '@/data/completePokedex';
import pokemonService from './PokemonService';

// All 17 Pokémon types
const ALL_TYPES = [
  'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice',
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
  'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
];

class TeamCoverageAnalyzer {
  
  /**
   * Analyze team's offensive type coverage
   */
  analyzeOffensiveCoverage(team) {
    const typesCovered = new Set();
    const moveTypes = new Set();
    
    team.forEach(pokemon => {
      // Add STAB types
      pokemon.types.forEach(type => typesCovered.add(type));
      
      // Add move types if available
      if (pokemon.moves) {
        pokemon.moves.forEach(move => {
          // This would need move data, for now we'll estimate based on types
          pokemon.types.forEach(type => moveTypes.add(type));
        });
      }
    });
    
    return {
      typesCovered: Array.from(typesCovered),
      moveTypes: Array.from(moveTypes),
      coveragePercentage: (typesCovered.size / ALL_TYPES.length) * 100
    };
  }
  
  /**
   * Analyze team's defensive weaknesses
   */
  analyzeDefensiveWeaknesses(team) {
    const teamWeaknesses = {};
    const teamResistances = {};
    
    // Count how many team members are weak to each type
    ALL_TYPES.forEach(attackingType => {
      teamWeaknesses[attackingType] = 0;
      teamResistances[attackingType] = 0;
      
      team.forEach(pokemon => {
        const effectiveness = pokemonService.getTypeEffectiveness(pokemon.types, attackingType);
        if (effectiveness > 1) {
          teamWeaknesses[attackingType]++;
        } else if (effectiveness < 1) {
          teamResistances[attackingType]++;
        }
      });
    });
    
    // Find critical weaknesses (affect majority of team)
    const criticalWeaknesses = Object.entries(teamWeaknesses)
      .filter(([type, count]) => count >= Math.ceil(team.length / 2))
      .map(([type, count]) => ({ type, count, percentage: (count / team.length) * 100 }));
    
    return {
      weaknesses: teamWeaknesses,
      resistances: teamResistances,
      criticalWeaknesses,
      overallDefenseScore: this.calculateDefenseScore(teamWeaknesses, team.length)
    };
  }
  
  /**
   * Calculate overall defense score (lower is better)
   */
  calculateDefenseScore(weaknesses, teamSize) {
    const totalWeaknesses = Object.values(weaknesses).reduce((sum, count) => sum + count, 0);
    return totalWeaknesses / teamSize; // Average weaknesses per Pokémon
  }
  
  /**
   * Suggest improvements for team coverage
   */
  suggestImprovements(team, difficulty = 'Medium') {
    const offensive = this.analyzeOffensiveCoverage(team);
    const defensive = this.analyzeDefensiveWeaknesses(team);
    
    const suggestions = [];
    
    // Difficulty-based standards
    const standards = {
      Easy: { minCoverage: 30, maxCriticalWeaknesses: 4 },
      Medium: { minCoverage: 40, maxCriticalWeaknesses: 3 },
      Hard: { minCoverage: 55, maxCriticalWeaknesses: 2 },
      Expert: { minCoverage: 70, maxCriticalWeaknesses: 1 }
    };
    
    const standard = standards[difficulty] || standards.Medium;
    
    // Check offensive coverage
    if (offensive.coveragePercentage < standard.minCoverage) {
      const missingTypes = ALL_TYPES.filter(type => !offensive.typesCovered.includes(type));
      suggestions.push({
        type: 'offensive',
        priority: 'medium',
        issue: `Low type coverage (${offensive.coveragePercentage.toFixed(1)}%)`,
        recommendation: `Add Pokémon with these types: ${missingTypes.slice(0, 3).join(', ')}`,
        missingTypes: missingTypes.slice(0, 5)
      });
    }
    
    // Check defensive weaknesses
    if (defensive.criticalWeaknesses.length > standard.maxCriticalWeaknesses) {
      suggestions.push({
        type: 'defensive',
        priority: 'high',
        issue: `${defensive.criticalWeaknesses.length} critical weaknesses`,
        recommendation: `Add Pokémon that resist: ${defensive.criticalWeaknesses.map(w => w.type).join(', ')}`,
        criticalWeaknesses: defensive.criticalWeaknesses
      });
    }
    
    return {
      offensive,
      defensive,
      suggestions,
      overallGrade: this.calculateOverallGrade(offensive, defensive, difficulty),
      meetsDifficultyStandard: suggestions.length === 0
    };
  }
  
  /**
   * Calculate overall team grade
   */
  calculateOverallGrade(offensive, defensive, difficulty) {
    const offensiveScore = Math.min(offensive.coveragePercentage / 70, 1) * 50; // Max 50 points
    const defensiveScore = Math.max(0, 50 - (defensive.overallDefenseScore * 10)); // Max 50 points
    const totalScore = offensiveScore + defensiveScore;
    
    if (totalScore >= 85) return 'S';
    if (totalScore >= 75) return 'A';
    if (totalScore >= 65) return 'B';
    if (totalScore >= 55) return 'C';
    if (totalScore >= 45) return 'D';
    return 'F';
  }
  
  /**
   * Get Pokémon that would improve team coverage
   */
  getImprovementSuggestions(currentTeam, biome, difficulty = 'Medium') {
    const analysis = this.suggestImprovements(currentTeam, difficulty);
    
    if (analysis.meetsDifficultyStandard) {
      return { message: 'Team coverage meets difficulty standards', suggestions: [] };
    }
    
    const improvementPokemon = [];
    
    // Find Pokémon that address weaknesses
    analysis.suggestions.forEach(suggestion => {
      if (suggestion.type === 'offensive' && suggestion.missingTypes) {
        suggestion.missingTypes.forEach(type => {
          const candidates = pokemonService.getByType(type).filter(p => 
            p.biomes && p.biomes.includes(biome)
          ).slice(0, 3);
          improvementPokemon.push(...candidates.map(p => ({
            pokemon: p,
            reason: `Adds ${type} type coverage`,
            priority: suggestion.priority
          })));
        });
      }
      
      if (suggestion.type === 'defensive' && suggestion.criticalWeaknesses) {
        suggestion.criticalWeaknesses.forEach(weakness => {
          // Find Pokémon that resist this type
          const resistantPokemon = Object.values(pokemonService.getAll()).filter(p => {
            const effectiveness = pokemonService.getTypeEffectiveness(p.types, weakness.type);
            return effectiveness < 1 && p.biomes && p.biomes.includes(biome);
          }).slice(0, 2);
          
          improvementPokemon.push(...resistantPokemon.map(p => ({
            pokemon: p,
            reason: `Resists ${weakness.type} attacks`,
            priority: suggestion.priority
          })));
        });
      }
    });
    
    return {
      currentGrade: analysis.overallGrade,
      suggestions: improvementPokemon.slice(0, 8), // Limit suggestions
      analysis
    };
  }
}

const teamCoverageAnalyzer = new TeamCoverageAnalyzer();

export default teamCoverageAnalyzer;
export { TeamCoverageAnalyzer };