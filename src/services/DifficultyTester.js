/**
 * Comprehensive Difficulty Testing System
 *
 * Tests all difficulty levels to ensure proper BST scaling,
 * team coverage, and ROM hacker requirements.
 */

import { generateTeamProgrammatically } from "@/components/trainer/TeamGenerator";
import pokemonService from "@/services/PokemonService";
import spriteManager from "@/services/SpriteManager";
import teamCoverageAnalyzer from "@/services/TeamCoverageAnalyzer";

class DifficultyTester {
  /**
   * Test all difficulty levels across different scenarios
   */
  async runComprehensiveDifficultyTest() {
    console.log("Running Comprehensive Difficulty Testing...");

    const testScenarios = [
      { biome: "Forest", levelRange: [10, 15], trainerClass: "youngster" },
      { biome: "Ocean", levelRange: [20, 25], trainerClass: "swimmer" },
      { biome: "Mountain", levelRange: [30, 35], trainerClass: "hiker" },
      { biome: "Volcano", levelRange: [40, 45], trainerClass: "expert" },
      { biome: "Cave", levelRange: [50, 55], trainerClass: "ace_trainer" },
    ];

    const difficulties = ["Easy", "Medium", "Hard", "Expert"];
    const results = {};

    for (const difficulty of difficulties) {
      results[difficulty] = {};

      for (const scenario of testScenarios) {
        const scenarioKey = `${scenario.biome}_${scenario.levelRange[0]}-${scenario.levelRange[1]}`;

        try {
          const team = generateTeamProgrammatically({
            biome: scenario.biome,
            level_min: scenario.levelRange[0],
            level_max: scenario.levelRange[1],
            trainer_class: scenario.trainerClass,
            difficulty: difficulty,
            theme: "Balanced",
          });

          const analysis = this.analyzeTeamForDifficulty(team, difficulty);

          results[difficulty][scenarioKey] = {
            team: team.party || team, // Handle both team object and array formats
            analysis,
            meetsCriteria: this.validateDifficultyCriteria(
              analysis,
              difficulty
            ),
          };
        } catch (_error) {
          results[difficulty][scenarioKey] = {
            error: error.message,
          };
        }
      }
    }

    this.displayDifficultyResults(results);
    return results;
  }

  /**
   * Analyze team for difficulty appropriateness
   */
  analyzeTeamForDifficulty(team, difficulty) {
    // Handle both team object format {party: [...]} and direct array format
    const teamArray = Array.isArray(team) ? team : team.party || [];

    const bstAnalysis = this.analyzeBSTDistribution({ party: teamArray });
    const coverageAnalysis = teamCoverageAnalyzer.suggestImprovements(
      teamArray,
      difficulty
    );

    return {
      averageBST: bstAnalysis.average,
      bstRange: bstAnalysis.range,
      bstDistribution: bstAnalysis.distribution,
      teamSize: teamArray.length,
      coverage: coverageAnalysis,
      typeDistribution: this.analyzeTypeDistribution({ party: teamArray }),
      evolutionAppropriateness: this.checkEvolutionAppropriateness({
        party: teamArray,
      }),
    };
  }

  /**
   * Analyze BST distribution in team
   */
  analyzeBSTDistribution(team) {
    const bsts = team.party.map(
      (pokemon) =>
        pokemonService.calculateBST(pokemon) ||
        Object.values(pokemon.base_stats || {}).reduce(
          (sum, stat) => sum + stat,
          0
        )
    );

    const average = bsts.reduce((sum, bst) => sum + bst, 0) / bsts.length;
    const min = Math.min(...bsts);
    const max = Math.max(...bsts);

    // Categorize BST ranges
    const distribution = {
      weak: bsts.filter((bst) => bst < 400).length, // < 400
      average: bsts.filter((bst) => bst >= 400 && bst < 500).length, // 400-499
      strong: bsts.filter((bst) => bst >= 500 && bst < 600).length, // 500-599
      elite: bsts.filter((bst) => bst >= 600).length, // 600+
    };

    return {
      average: Math.round(average),
      range: { min, max },
      distribution,
      individual: bsts,
    };
  }

  /**
   * Analyze type distribution
   */
  analyzeTypeDistribution(team) {
    const typeCount = {};
    const typesCovered = new Set();

    team.party.forEach((pokemon) => {
      pokemon.types.forEach((type) => {
        typeCount[type] = (typeCount[type] || 0) + 1;
        typesCovered.add(type);
      });
    });

    return {
      typesUsed: Object.keys(typeCount),
      typeCount,
      uniqueTypes: typesCovered.size,
      diversity: (typesCovered.size / team.party.length) * 100,
    };
  }

  /**
   * Check if evolutions are appropriate for levels
   */
  checkEvolutionAppropriateness(team) {
    const issues = [];

    team.party.forEach((pokemon, index) => {
      const appropriateForm = pokemonService.getAppropriateFormForLevel(
        pokemon.species,
        pokemon.level
      );

      if (appropriateForm.changed) {
        issues.push({
          slot: index + 1,
          pokemon: pokemon.species,
          level: pokemon.level,
          shouldBe: appropriateForm.species,
          issue: "Over-evolved for level",
        });
      }
    });

    return {
      appropriate: issues.length === 0,
      issues,
      score: ((team.party.length - issues.length) / team.party.length) * 100,
    };
  }

  /**
   * Validate if team meets difficulty criteria
   */
  validateDifficultyCriteria(analysis, difficulty) {
    const criteria = {
      Easy: {
        maxAverageBST: 450,
        minEvolutionScore: 80,
        maxCriticalWeaknesses: 4,
        description: "Low BST, simple teams",
      },
      Medium: {
        minAverageBST: 400,
        maxAverageBST: 520,
        minEvolutionScore: 85,
        maxCriticalWeaknesses: 3,
        description: "Balanced teams",
      },
      Hard: {
        minAverageBST: 480,
        maxAverageBST: 580,
        minEvolutionScore: 90,
        maxCriticalWeaknesses: 2,
        minCoverageGrade: "C",
        description: "Strong, well-balanced teams",
      },
      Expert: {
        minAverageBST: 520,
        minEvolutionScore: 95,
        maxCriticalWeaknesses: 1,
        minCoverageGrade: "B",
        description: "Elite competitive teams",
      },
    };

    const standard = criteria[difficulty];
    if (!standard) return { valid: false, reason: "Unknown difficulty" };

    const validations = [];

    // BST validation
    if (
      standard.minAverageBST &&
      analysis.averageBST < standard.minAverageBST
    ) {
      validations.push(
        `BST too low: ${analysis.averageBST} < ${standard.minAverageBST}`
      );
    }
    if (
      standard.maxAverageBST &&
      analysis.averageBST > standard.maxAverageBST
    ) {
      validations.push(
        `BST too high: ${analysis.averageBST} > ${standard.maxAverageBST}`
      );
    }

    // Evolution validation
    if (analysis.evolutionAppropriateness.score < standard.minEvolutionScore) {
      validations.push(
        `Evolution issues: ${analysis.evolutionAppropriateness.score}% < ${standard.minEvolutionScore}%`
      );
    }

    // Coverage validation
    if (
      standard.maxCriticalWeaknesses &&
      analysis.coverage.defensive.criticalWeaknesses.length >
        standard.maxCriticalWeaknesses
    ) {
      validations.push(
        `Too many critical weaknesses: ${analysis.coverage.defensive.criticalWeaknesses.length} > ${standard.maxCriticalWeaknesses}`
      );
    }

    return {
      valid: validations.length === 0,
      validations,
      standard: standard.description,
    };
  }

  /**
   * Display comprehensive results
   */
  displayDifficultyResults(results) {
    console.log("\n📊 DIFFICULTY SCALING ANALYSIS");
    console.log("=====================================");

    Object.entries(results).forEach(([difficulty, scenarios]) => {
      console.log(`\n${difficulty.toUpperCase()} DIFFICULTY:`);

      const scenarioResults = Object.values(scenarios).filter((s) => !s.error);
      if (scenarioResults.length === 0) {
        console.log("  No successful scenarios");
        return;
      }

      const avgBST =
        scenarioResults.reduce((sum, s) => sum + s.analysis.averageBST, 0) /
        scenarioResults.length;
      const passRate =
        (scenarioResults.filter((s) => s.meetsCriteria.valid).length /
          scenarioResults.length) *
        100;

      console.log(`  Average BST: ${Math.round(avgBST)}`);
      console.log(`  Pass Rate: ${passRate.toFixed(1)}%`);

      const criticalWeaknesses =
        scenarioResults.reduce(
          (sum, s) =>
            sum + s.analysis.coverage.defensive.criticalWeaknesses.length,
          0
        ) / scenarioResults.length;
      console.log(
        `  Avg Critical Weaknesses: ${criticalWeaknesses.toFixed(1)}`
      );

      // Show failing scenarios
      const failures = scenarioResults.filter((s) => !s.meetsCriteria.valid);
      if (failures.length > 0) {
        console.log(`  ${failures.length} scenarios failed criteria`);
      }
    });

    console.log("\nDifficulty testing complete!");
  }

  /**
   * Test sprite system
   */
  async testSpriteSystem() {
    console.log("Testing Sprite System...");

    const testPokemon = [
      1, 4, 7, 25, 150, 152, 155, 158, 249, 252, 255, 258, 386,
    ];
    const results = {
      local: 0,
      fallback: 0,
      failed: 0,
      total: testPokemon.length,
    };

    for (const dexNum of testPokemon) {
      try {
        const spriteUrl = await spriteManager.getSprite(dexNum);

        if (spriteUrl.includes("/sprites/gen3/")) {
          results.local++;
        } else if (spriteUrl.includes("github.com")) {
          results.fallback++;
        } else {
          results.failed++;
        }
      } catch (_error) {
        results.failed++;
      }
    }

    console.log("Sprite Test Results:", results);
    return results;
  }
}

const difficultyTester = new DifficultyTester();

export default difficultyTester;
export { DifficultyTester };

// Make available globally
if (typeof window !== "undefined") {
  window.difficultyTester = difficultyTester;

  // Auto-run comprehensive test
  setTimeout(() => {
    console.log("[INFO] Running difficulty testing system...");
    difficultyTester.runComprehensiveDifficultyTest();
    difficultyTester.testSpriteSystem();
  }, 5000);
}
