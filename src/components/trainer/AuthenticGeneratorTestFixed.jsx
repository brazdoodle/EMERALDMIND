import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { authenticTeamGenerator } from './AuthenticTeamGenerator';
import { TRADE_EVOLUTION_CONSTRAINTS } from './constants';

/**
 * Authentic Gen 3 Trainer Generator Test
 * Based on Serebii.net and Bulbapedia encounter data
 * Tests realistic team composition with proper evolution constraints
 */

export default function AuthenticGeneratorTest() {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const runAuthenticTest = async () => {
    setIsLoading(true);
    setTestResults([]);

    const testScenarios = [
      {
        name: 'Cities Route - Level 25-26 (User Problem)',
        biome: 'Grassland',
        difficulty: 'Medium',
        minLevel: 25,
        maxLevel: 26,
        teamSize: 6
      },
      {
        name: 'Forest Route - Level 20-22', 
        biome: 'Forest',
        difficulty: 'Medium',
        minLevel: 20,
        maxLevel: 22,
        teamSize: 4
      },
      {
        name: 'Cave System - Level 30-32',
        biome: 'Cave',
        difficulty: 'Hard', 
        minLevel: 30,
        maxLevel: 32,
        teamSize: 5
      }
    ];

    const results = [];

    for (const scenario of testScenarios) {
      try {
        const result = await authenticTeamGenerator.generateAuthenticTeam({
          biome: scenario.biome,
          difficulty: scenario.difficulty,
          minLevel: scenario.minLevel,
          maxLevel: scenario.maxLevel,
          teamSize: scenario.teamSize,
          enforceAuthenticity: true
        });

        results.push({
          scenario,
          ...result,
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

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentic Gen 3 Trainer Test</CardTitle>
          <CardDescription>
            Testing realistic team generation with proper evolution constraints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm space-y-2">
              <div><strong>Focus:</strong> Fixing level 25 trade evolution issues</div>
              <div><strong>Standards:</strong> Serebii.net encounter data + Bulbapedia evolution requirements</div>
              <div><strong>Constraints:</strong> {Object.keys(TRADE_EVOLUTION_CONSTRAINTS).length} trade evolution thresholds</div>
            </div>
            
            <Button onClick={runAuthenticTest} disabled={isLoading}>
              {isLoading ? 'Testing Generation...' : 'Run Authentic Test'}
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
                  {result.scenario.name}
                  {result.validation && (
                    result.validation.valid ? 
                      <Badge className="bg-green-500">Authentic</Badge> :
                      <Badge variant="destructive">Issues Found</Badge>
                  )}
                </CardTitle>
                {result.validation?.biomeInfo && (
                  <CardDescription>{result.validation.biomeInfo}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {result.error ? (
                  <div className="text-red-600">Error: {result.error}</div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Generated Team:</h4>
                      <div className="grid gap-2">
                        {result.team?.map((pokemon, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <span>{i + 1}. {pokemon.species}</span>
                              {pokemon.downscaled && (
                                <Badge variant="outline" className="text-xs">
                                  Fixed from {pokemon.originalSpecies}
                                </Badge>
                              )}
                            </div>
                            <Badge variant="outline">Level {pokemon.level}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Biome Expectations */}
                    {result.validation?.expectedPokemon && (
                      <div>
                        <h4 className="font-semibold mb-2">Biome Analysis:</h4>
                        <div className="text-sm">
                          <div><strong>Expected:</strong> {result.validation.expectedPokemon}</div>
                          {result.metadata?.constraints_applied > 0 && (
                            <div><strong>Constraints Applied:</strong> {result.metadata.constraints_applied} Pokémon downscaled</div>
                          )}
                        </div>
                      </div>
                    )}

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
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Scenarios Tested:</strong> {testResults.length}</div>
              <div><strong>Authentic Teams:</strong> {testResults.filter(r => r.validation?.valid).length}</div>
              <div><strong>Issues Found:</strong> {testResults.filter(r => r.validation && !r.validation.valid).length}</div>
              <div><strong>Constraints Applied:</strong> {testResults.reduce((sum, r) => sum + (r.metadata?.constraints_applied || 0), 0)} total</div>
              <div className="text-gray-600 mt-4">
                <strong>Reference:</strong> Evolution data from Bulbapedia, encounter data from Serebii.net
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}