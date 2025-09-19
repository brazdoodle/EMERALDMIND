import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Zap, Play, Download } from 'lucide-react';

export default function RNGSimulator() {
  const [seed, setSeed] = useState(0x5A0);
  const [count, setCount] = useState(10);
  const [encounterTable, setEncounterTable] = useState(JSON.stringify([
    { species: 'Zigzagoon', rate: 20 },
    { species: 'Poochyena', rate: 20 },
    { species: 'Wurmple', rate: 15 },
    { species: 'Taillow', rate: 30 },
    { species: 'Shroomish', rate: 15 }
  ], null, 2));
  const [results, setResults] = useState([]);

  // GBA Linear Congruential Generator
  const simulateEncounters = (startSeed, table, encounterCount) => {
    let currentSeed = startSeed >>> 0;
    const results = [];
    
    for (let i = 0; i < encounterCount; i++) {
      // GBA RNG formula: (seed * 0x41C64E6D + 0x6073) & 0xFFFFFFFF
      currentSeed = (currentSeed * 0x41C64E6D + 0x6073) >>> 0;
      const rng = (currentSeed >>> 16) & 0xFFFF;
      
      // Determine encounter based on rates
      let cumulative = 0;
      let selectedSpecies = 'Unknown';
      
      for (const entry of table) {
        cumulative += entry.rate;
        if (rng % 100 < cumulative) {
          selectedSpecies = entry.species;
          break;
        }
      }
      
      // Generate level (20-25)
      const levelSeed = (currentSeed * 0x41C64E6D + 0x6073) >>> 0;
      const level = 20 + (levelSeed >>> 16) % 6;
      
      results.push({
        index: i + 1,
        rng: rng,
        species: selectedSpecies,
        level: level,
        seed: currentSeed
      });
      
      currentSeed = levelSeed;
    }
    
    return results;
  };

  const handleSimulate = () => {
    try {
      const table = JSON.parse(encounterTable);
      const simResults = simulateEncounters(seed, table, count);
      setResults(simResults);
    } catch (error) {
      console.error('Invalid encounter table JSON:', error);
    }
  };

  const exportResults = () => {
    const csv = [
      'Index,RNG,Species,Level,Seed',
      ...results.map(r => `${r.index},${r.rng},${r.species},${r.level},0x${r.seed.toString(16)}`)
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rng_simulation.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-yellow-400" />
        <span className="text-yellow-400 font-mono font-bold">RNG & Encounter Simulator</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-slate-400 text-xs">Starting Seed</label>
          <Input
            type="number"
            value={seed}
            onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
            className="bg-slate-800 border-slate-600 font-mono"
          />
        </div>
        <div>
          <label className="text-slate-400 text-xs">Count</label>
          <Input
            type="number"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            className="bg-slate-800 border-slate-600 font-mono"
            max={50}
          />
        </div>
      </div>
      
      <div>
        <label className="text-slate-400 text-xs">Encounter Table (JSON)</label>
        <Textarea
          value={encounterTable}
          onChange={(e) => setEncounterTable(e.target.value)}
          className="bg-slate-800 border-slate-600 font-mono text-xs h-20"
        />
      </div>
      
      <div className="flex gap-2">
        <Button onClick={handleSimulate} className="bg-yellow-600 hover:bg-yellow-700 flex-1">
          <Play className="w-4 h-4 mr-2" />
          Simulate Encounters
        </Button>
        {results.length > 0 && (
          <Button onClick={exportResults} variant="outline" className="border-yellow-400 text-yellow-400">
            <Download className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      {results.length > 0 && (
        <div className="max-h-32 overflow-y-auto space-y-1">
          {results.map((result) => (
            <div key={result.index} className="flex items-center justify-between p-2 bg-slate-800 rounded text-xs">
              <span className="text-slate-400">#{result.index}</span>
              <Badge variant="outline" className="border-yellow-400 text-yellow-400 text-xs">
                {result.species}
              </Badge>
              <span className="text-slate-300">Lv {result.level}</span>
              <span className="text-slate-500 font-mono">RNG: {result.rng}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}