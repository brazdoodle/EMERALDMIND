import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Sword, ShieldAlert, ShieldCheck } from 'lucide-react';
import { typeChart, getPokemonDetails } from './PokemonData';
import { motion } from 'framer-motion';

const typeColors = {
  Normal: 'bg-gray-400', Fire: 'bg-red-500', Water: 'bg-blue-500', Electric: 'bg-yellow-400',
  Grass: 'bg-green-500', Ice: 'bg-cyan-300', Fighting: 'bg-orange-700', Poison: 'bg-purple-600',
  Ground: 'bg-yellow-600', Flying: 'bg-indigo-400', Psychic: 'bg-pink-500', Bug: 'bg-lime-500',
  Rock: 'bg-yellow-800', Ghost: 'bg-purple-800', Dragon: 'bg-indigo-700', Dark: 'bg-gray-800',
  Steel: 'bg-gray-500', Fairy: 'bg-pink-300',
};

const allTypes = Object.keys(typeChart);

export default function TeamSynergyAnalyzer({ party }) {
  if (!party || party.length === 0) {
    return null;
  }

  const defensiveAnalysis = allTypes.reduce((acc, attackingType) => {
    let teamWeaknesses = 0;
    let teamResistances = 0;
    
    party.forEach(member => {
      // Add safety check for member and species
      if (!member || !member.species) return;
      
      const details = getPokemonDetails(member.species);
      if (!details) return;

      // Calculate type effectiveness for this Pokemon
      let totalMultiplier = 1;
      details.types.forEach(defendingType => {
        const effectiveness = typeChart[attackingType]?.[defendingType] ?? 1;
        totalMultiplier *= effectiveness;
      });
      
      // Categorize the effectiveness
      if (totalMultiplier >= 2) teamWeaknesses++;       // Weak to this type
      else if (totalMultiplier >= 1.5) teamWeaknesses += 0.5; // Slightly weak
      else if (totalMultiplier <= 0.25) teamResistances++;    // Strong resistance
      else if (totalMultiplier <= 0.5) teamResistances += 0.5; // Some resistance
    });
    
    // Net score: negative = good (more resistances), positive = bad (more weaknesses)
    acc[attackingType] = teamWeaknesses - teamResistances;
    return acc;
  }, {});

  const weaknesses = Object.entries(defensiveAnalysis)
    .filter(([, score]) => score > 0.5) // Show significant weaknesses
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8); // Limit to top 8 weaknesses
    
  const resistances = Object.entries(defensiveAnalysis)
    .filter(([, score]) => score < -0.5) // Show significant resistances
    .sort((a, b) => a[1] - b[1])
    .slice(0, 8); // Limit to top 8 resistances

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-purple-300 font-light flex items-center gap-3">
            <Shield className="w-5 h-5" />
            Team Synergy Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-red-400 mb-3">
              <ShieldAlert className="w-4 h-4" />
              Major Weaknesses
            </h4>
            <div className="flex flex-wrap gap-2">
              {weaknesses.length > 0 ? weaknesses.map(([type]) => (
                <div key={type} className={`px-3 py-1 text-xs font-bold text-white rounded-full ${typeColors[type]}`}>{type}</div>
              )) : <p className="text-sm text-slate-400">No significant team-wide weaknesses found.</p>}
            </div>
          </div>
          
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-green-400 mb-3">
              <ShieldCheck className="w-4 h-4" />
              Key Resistances
            </h4>
            <div className="flex flex-wrap gap-2">
              {resistances.length > 0 ? resistances.map(([type]) => (
                <div key={type} className={`px-3 py-1 text-xs font-bold text-white rounded-full ${typeColors[type]}`}>{type}</div>
              )) : <p className="text-sm text-slate-400">No significant team-wide resistances found.</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}