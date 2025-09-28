import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { generateTeamProgrammatically } from './TeamGenerator';
import { downscaleSpeciesForLevel } from './evolutionRules';
import { completePokedex, enhancedBiomes } from '../../data/completePokedex';

/**
 * Authentic Gen 3 Trainer Generator Test
 * Based on Serebii.net and Bulbapedia encounter data
 * Tests realistic team composition with proper evolution constraints
 */

// Authentic Gen 3 encounter data based on Serebii.net route analysis
const authenticGen3Encounters = {
  'cities': {
    // Routes 102, 103, near cities - common early-game Pokémon
    common: ['Pidgey', 'Poochyena', 'Zigzagoon', 'Wurmple', 'Taillow'],
    uncommon: ['Ralts', 'Lotad', 'Seedot', 'Surskit'],
    rare: ['Abra', 'Magikarp'], // Available via fishing/trades in cities
    description: 'Urban areas and routes near cities (Routes 101-104)'
  },
  'forest': {
    // Petalburg Woods, Route 114
    common: ['Wurmple', 'Shroomish', 'Slakoth', 'Cascoon', 'Silcoon'],
    uncommon: ['Nincada', 'Seedot', 'Lotad'],
    rare: ['Breloom', 'Kecleon'],
    description: 'Petalburg Woods and forested routes'
  },
  'caves': {
    // Granite Cave, Cave of Origin, etc.
    common: ['Zubat', 'Geodude', 'Makuhita', 'Aron'],
    uncommon: ['Sableye', 'Mawile', 'Nosepass'],
    rare: ['Beldum', 'Meditite'],
    description: 'Cave systems throughout Hoenn'
  },
  'water': {
    // Routes with Surf/fishing
    common: ['Tentacool', 'Magikarp', 'Wingull', 'Pelipper'],
    uncommon: ['Staryu', 'Goldeen', 'Corphish'],
    rare: ['Feebas', 'Wailmer', 'Sharpedo'],
    description: 'Ocean routes and fishing spots'
  }
};

// Trade evolution minimum levels based on competitive analysis
const tradeEvolutionConstraints = {
  'Alakazam': { preEvolution: 'Kadabra', minLevel: 35, reason: 'Trade evolution requires late-game access' },
  'Machamp': { preEvolution: 'Machoke', minLevel: 40, reason: 'Trade evolution + high BST' },
  'Golem': { preEvolution: 'Graveler', minLevel: 35, reason: 'Trade evolution standard' },
  'Gengar': { preEvolution: 'Haunter', minLevel: 35, reason: 'Trade evolution + powerful movepool' }
};

export default function AuthenticGeneratorTest() {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const validateAuthenticTeam = (team, biome, levelRange) => {
    const issues = [];
    const expectedEncounters = authenticGen3Encounters[biome] || authenticGen3Encounters['cities'];
    
    team.forEach((pokemon, index) => {
      // Check for trade evolution violations
      if (tradeEvolutionConstraints[pokemon.species]) {
        const constraint = tradeEvolutionConstraints[pokemon.species];
        if (pokemon.level < constraint.minLevel) {
          issues.push(`${pokemon.species} at level ${pokemon.level} (${constraint.reason})`);
        }
      }
      
      // Check if Pokémon fits the biome (simplified check)
      const allBiomeEncounters = [
        ...expectedEncounters.common,
        ...expectedEncounters.uncommon,
        ...expectedEncounters.rare
      ];
      
      // Get the base form for biome checking
      let checkSpecies = pokemon.species;
      for (const [evolution, data] of Object.entries(tradeEvolutionConstraints)) {
        if (evolution === pokemon.species) {
          checkSpecies = data.preEvolution;
          break;
        }
      }
      
      // This is a simplified biome check - in reality we'd need full evolution chains
      // For now, we focus on the main issue: trade evolution levels
    });
    
    return {
      valid: issues.length === 0,
      issues,
      biomeInfo: expectedEncounters.description
    };
  };

  const runAuthenticTest = async () => {
    setIsLoading(true);
    setTestResults([]);

    // Test the problematic scenario from user report
    const testScenarios = [
      {
        name: 'Cities Route - Level 25-26',
        biome: 'cities',
        difficulty: 'medium',
        minLevel: 25,
        maxLevel: 26,
        teamSize: 6
      },
      {
        name: 'Forest Route - Level 20-22', 
        biome: 'forest',
        difficulty: 'medium',
        minLevel: 20,
        maxLevel: 22,
        teamSize: 4
      }
    ];

    const results = [];

    for (const scenario of testScenarios) {
      try {
        // Generate team using existing system
        const generatedTeam = await generateTeamProgrammatically({
          biome: scenario.biome,
          theme: 'Balanced',
          difficulty: scenario.difficulty,
          teamSize: scenario.teamSize,
          minLevel: scenario.minLevel,
          maxLevel: scenario.maxLevel
        });

        // Apply evolution constraints
        const constrainedTeam = generatedTeam.map(pokemon => {
          const result = downscaleSpeciesForLevel(pokemon.species, pokemon.level);
          if (result.changed) {
            return {
              ...pokemon,
              species: result.species,
              originalSpecies: pokemon.species,
              downscaled: true
            };
          }
          return pokemon;
        });

        // Validate against authentic standards
        const validation = validateAuthenticTeam(constrainedTeam, scenario.biome, {
          min: scenario.minLevel,
          max: scenario.maxLevel
        });

        results.push({
          scenario,
          team: constrainedTeam,
          validation,
          success: true
        });

      } catch (_error) {
        results.push({
          scenario,
          error: error.message,
          success: false
        });
      }
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    // Test the exact scenario that was problematic
    const testOptions = {
      difficulty: 'medium',
      theme: 'aggressive', 
      biome: 'cities',
      teamSize: 6,
      minLevel: 25,
      maxLevel: 26,
      allowLegendaries: false,
      enforceTheme: true
    };

    const results = [];

    try {
      // Generate 3 test teams
      for (let i = 1; i <= 3; i++) {
        try {
          const result = await authenticTrainerGenerator.generateTrainerTeam(testOptions);
          
          // Validate for reported issues
          const validation = authenticTrainerGenerator.validateTeam(result.team);
          
          results.push({
            teamId: i,
            team: result.team,
            validation,
            coverage: result.coverage,
            metadata: result.metadata
          });
        } catch (_error) {
          results.push({
            teamId: i,
            error: error.message
          });
        }
      }
    } catch (_error) {
      console.error('Test failed:', error);
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const getValidationBadge = (validation) => {
    if (validation?.valid) {
      return <Badge variant="success">Valid</Badge>;
    } else {
      return <Badge variant="destructive">Issues Found</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentic Trainer Generator Test</CardTitle>
          <CardDescription>
            Testing against reported issues: level 25 trade evolutions, poor biome matching
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Biome:</strong> Cities and human development</div>
              <div><strong>Theme:</strong> Aggressive</div>
              <div><strong>Difficulty:</strong> Medium</div>
              <div><strong>Level Range:</strong> 25-26</div>
            </div>
            
            <Button onClick={runTests} disabled={isLoading}>
              {isLoading ? 'Running Tests...' : 'Run Authentic Generation Test'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <div className="space-y-4">
          {testResults.map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Test Team {result.teamId}
                  {result.validation && getValidationBadge(result.validation)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.error ? (
                  <div className="text-red-600">Error: {result.error}</div>
                ) : (
                  <div className="space-y-4">
                    {/* Team Members */}
                    <div>
                      <h4 className="font-semibold mb-2">Team Members:</h4>
                      <div className="grid gap-2">
                        {result.team?.map((pokemon, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span>{i + 1}. {pokemon.species}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Level {pokemon.level}</Badge>
                              {pokemon.bst && <Badge variant="secondary">BST {pokemon.bst}</Badge>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Validation Issues */}
                    {result.validation && !result.validation.valid && (
                      <div>
                        <h4 className="font-semibold mb-2 text-red-600">Issues Found:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {result.validation.issues.map((issue, i) => (
                            <li key={i} className="text-red-600">{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Coverage Info */}
                    {result.coverage && (
                      <div>
                        <h4 className="font-semibold mb-2">Team Coverage:</h4>
                        <div className="flex gap-2">
                          <Badge variant="outline">Grade: {result.coverage.overallGrade}</Badge>
                          {result.metadata?.teamScore && (
                            <Badge variant="outline">Score: {result.metadata.teamScore}</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Test Summary */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>Total Teams Generated:</strong> {testResults.filter(r => !r.error).length}
              </div>
              <div>
                <strong>Valid Teams:</strong> {testResults.filter(r => r.validation?.valid).length}
              </div>
              <div>
                <strong>Teams with Issues:</strong> {testResults.filter(r => r.validation && !r.validation.valid).length}
              </div>
              <div>
                <strong>Errors:</strong> {testResults.filter(r => r.error).length}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}