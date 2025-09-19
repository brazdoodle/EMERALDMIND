
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Bot, Plus, Wand2, Save, Trash2, BookUser, Eye, Zap, Dices, FlaskConical, Sparkles, Cpu, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { InvokeLLM } from '@/api/integrations';
import Ajv from 'ajv';
import RawOutputModal from '@/components/shared/RawOutputModal';
import { Trainer } from '@/api/entities';
import { ChangelogEntry } from '@/api/entities';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuickAssist } from '@/components/shared/LabAssistantService';
import { getPokemonDetails, getValidMoveset, gen3References } from '@/components/trainer/PokemonData';
import TeamSynergyAnalyzer from '@/components/trainer/TeamSynergyAnalyzer';
import EntityErrorHandler from '@/components/shared/EntityErrorHandler';

const biomes = Object.keys(gen3References.biomes);
const themes = Object.keys(gen3References.themes); // Renamed from battleStyles to themes
const difficulties = ["Auto", "Medium", "Hard", "Expert"];
const trainerClasses = Object.keys(gen3References.trainerClasses);


const trainerNames = [
  "Aaron", "Abby", "Adam", "Aiden", "Alex", "Alice", "Amber", "Amy", "Andrea", "Andy", "Angel", "Anna", "Anthony", "Archie", "Arthur", "Ashley", "Austin", "Ava", "Barry", "Beatrice", "Ben", "Billy", "Blake", "Brandon", "Brendan", "Brian", "Brock", "Brooke", "Bruce", "Caitlin", "Calvin", "Cameron", "Candice", "Carl", "Casey", "Catherine", "Chad", "Charles", "Charlotte", "Cheryl", "Chloe", "Chris", "Christian", "Claire", "Clara", "Cody", "Colin", "Connor", "Courtney", "Crystal", "Cynthia", "Daisy", "Damian", "Daniel", "David", "Dawn", "Dean", "Dennis", "Derek", "Diana", "Donna", "Douglas", "Dustin", "Dylan", "Edward", "Eileen", "Elijah", "Elizabeth", "Ella", "Emily", "Emma", "Eric", "Erika", "Ethan", "Eva", "Evan", "Evelyn", "Fantina", "Fiona", "Flannery", "Forrest", "Frank", "Fred", "Gabby", "Gardenia", "Gary", "Gavin", "George", "Georgia", "Grace", "Grant", "Greg", "Hailey", "Hannah", "Harry", "Hayden", "Hazel", "Heather", "Henry", "Holly", "Howard", "Hugh", "Ian", "Isaac", "Isabella", "Ivan", "Jack", "Jacob", "James", "Jasmine", "Jason", "Jay", "Jeffrey", "Jenna", "Jennifer", "Jeremy", "Jerry", "Jesse", "Jessica", "Joan", "Jodi", "Joe", "John", "Jonathan", "Jordan", "Joseph", "Joshua", "Juan", "Julia", "Justin", "Karen", "Kate", "Katherine", "Katie", "Keith", "Kelly", "Ken", "Kevin", "Kim", "Kyle", "Laura", "Lauren", "Lawrence", "Leaf", "Leo", "Leon", "Liam", "Lila", "Lily", "Linda", "Lisa", "Logan", "Louis", "Lucas", "Lucy", "Luke", "Luna", "Lydia"
];

const defaultTrainerState = {
  id: null,
  name: '',
  trainer_class: 'youngster',
  level_min: 10,
  level_max: 15,
  biome: 'Grassland',
  theme: 'Balanced',
  difficulty: 'Auto',
  party: [],
  sprite_url: '',
  notes: '',
  ai_flags: ''
};

// Extracted utility function for type colors (solid background)
const getTypeColor = (type) => {
  const colors = {
    normal: 'bg-gray-400', fire: 'bg-red-500', water: 'bg-blue-500',
    electric: 'bg-yellow-400', grass: 'bg-green-500', ice: 'bg-blue-300',
    fighting: 'bg-red-700', poison: 'bg-purple-500', ground: 'bg-yellow-600',
    flying: 'bg-indigo-400', psychic: 'bg-pink-500', bug: 'bg-green-400',
    rock: 'bg-yellow-800', ghost: 'bg-purple-700', dragon: 'bg-indigo-700',
    dark: 'bg-gray-800', steel: 'bg-gray-500', fairy: 'bg-pink-300'
  };
  return colors[type?.toLowerCase()] || 'bg-gray-400';
};

// Extracted utility function for type gradients
const getTypeGradient = (type) => {
  const colors = {
    normal: 'from-gray-400 to-gray-600', fire: 'from-red-500 to-orange-600', water: 'from-blue-500 to-cyan-500',
    electric: 'from-yellow-400 to-yellow-600', grass: 'from-green-500 to-emerald-500', ice: 'from-blue-300 to-cyan-300',
    fighting: 'from-red-700 to-red-800', poison: 'from-purple-500 to-violet-600', ground: 'from-yellow-600 to-orange-700',
    flying: 'from-indigo-400 to-sky-500', psychic: 'from-pink-500 to-purple-500', bug: 'from-green-400 to-lime-500',
    rock: 'from-yellow-800 to-amber-800', ghost: 'from-purple-700 to-indigo-800', dragon: 'from-indigo-700 to-purple-700',
    dark: 'from-gray-800 to-slate-900', steel: 'from-gray-500 to-slate-600', fairy: 'from-pink-300 to-rose-400'
  };
  return colors[type?.toLowerCase()] || 'from-gray-400 to-gray-600';
};

// Enhanced Pokemon card with moveset preview
function PokemonCard({ pokemon, onClick }) {
  if (!pokemon) {
    return (
      <div className="aspect-square p-4 rounded-2xl border-2 border-dashed border-slate-400 dark:border-slate-600 hover:border-slate-500 dark:hover:border-slate-500 cursor-pointer transition-all duration-300">
        <div className="h-full flex flex-col items-center justify-center text-slate-700 dark:text-slate-500">
          <Plus className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-xs">Empty</span>
        </div>
      </div>
    );
  }

  const { sprite_url, species, types, level, role, ability, moves } = pokemon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-gradient-to-br from-white to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur border border-slate-300 dark:border-blue-400/30 rounded-2xl p-4 cursor-pointer group hover:border-slate-400 dark:hover:border-blue-400/60 hover:scale-105 transition-all duration-300 shadow-lg"
      onClick={() => onClick && onClick(pokemon)}
    >
      {/* Pokemon Sprite & Basic Info */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-900/50 rounded-xl flex items-center justify-center border border-slate-300 dark:border-blue-500/20">
          <img
            src={sprite_url}
            alt={species}
            className="w-12 h-12 drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
            style={{ imageRendering: 'pixelated' }}
            onError={(e) => {
              e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png`;
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">{species}</h3>
          <div className="flex items-center gap-1 mb-1">
            {types?.slice(0, 2).map((type, idx) => (
              <div key={idx} className={`w-2 h-2 rounded-full ${getTypeColor(type)}`} />
            ))}
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5">
            Lv. {level}
          </Badge>
        </div>
      </div>

      {/* Moveset Preview */}
      <div className="space-y-1">
        <h4 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Moves</h4>
        <div className="grid grid-cols-1 gap-1">
          {moves?.slice(0, 4).map((move, i) => (
            <div key={i} className="flex justify-between items-center text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-medium truncate pr-2">{move}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Role & Ability */}
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/50">
        <div className="flex justify-between items-center text-xs">
          <span className="text-indigo-400 font-medium truncate">{role}</span>
          <span className="text-blue-400 font-medium truncate">{ability}</span>
        </div>
      </div>
    </motion.div>
  );
}

function PokemonDetailModal({ pokemon, isOpen, onClose }) {
  if (!pokemon) return null;

  const { sprite_url, species, types, level, role, ability, moves, base_stats, item, reasoning } = pokemon;

  const statsOrder = ['hp', 'attack', 'defense', 'sp_attack', 'sp_defense', 'speed'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-black/95 border border-slate-300 dark:border-blue-500/30 max-w-4xl backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-light text-blue-400 flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            {species}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-white dark:from-slate-800/50 dark:to-black/50 rounded-2xl flex items-center justify-center border border-slate-300 dark:border-blue-500/20">
              <img
                src={sprite_url}
                alt={species}
                className="w-24 h-24 drop-shadow-lg"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png`;
                }}
              />
            </div>
            <div className="flex-1">
              <div className="flex gap-3 mb-4">
                {types?.map((type, i) => (
                  <div key={i} className={`px-4 py-2 rounded-full bg-gradient-to-r ${getTypeGradient(type)} text-white font-semibold text-sm shadow-lg`}>
                    {type.toUpperCase()}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-slate-600 dark:text-slate-400">Level</p>
                  <p className="text-blue-400 font-mono text-lg">{level}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-600 dark:text-slate-400">Role</p>
                  <p className="text-indigo-400 font-medium">{role}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-600 dark:text-slate-400">Ability</p>
                  <p className="text-purple-400 font-medium">{ability}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-600 dark:text-slate-400">Item</p>
                  <p className="text-yellow-400 font-medium">{item || 'None'}</p>
                </div>
              </div>
            </div>
          </div>

          <Card className="bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-400 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Base Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {statsOrder.map((statName) => (
                <div key={statName} className="flex justify-between items-center">
                  <span className="text-slate-700 dark:text-slate-300 text-sm capitalize">{statName.replace('_', ' ')}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-2 bg-slate-300 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000"
                        style={{ width: `${Math.min(100, (base_stats[statName] / 255) * 100)}%` }}
                      />
                    </div>
                    <span className="text-blue-400 font-mono text-sm w-8 text-right">{base_stats[statName]}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Complete Moveset
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {moves?.map((move, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-slate-200 dark:bg-slate-800/30 rounded-lg">
                  <span className="text-slate-800 dark:text-slate-200 font-medium text-sm">{move}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-indigo-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-indigo-400">Strategic Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                {reasoning || `This ${species} serves as a ${role} in the team composition, utilizing its ${ability} ability effectively at level ${level}.`}
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function for evolution integrity checks (Updated as per outline)
function checkEvolutionIntegrity(species, level) {
  let shouldEvolve = false;
  let suggestedForm = species;
  const speciesLower = species.toLowerCase();

  // Trade evolutions that should be fully evolved at certain levels
  const tradeEvolutions = {
    'kadabra': { suggestedEvo: 'Alakazam', minLevelForSuggestion: 25 },
    'machoke': { suggestedEvo: 'Machamp', minLevelForSuggestion: 35 },
    'graveler': { suggestedEvo: 'Golem', minLevelForSuggestion: 32 },
    'haunter': { suggestedEvo: 'Gengar', minLevelForSuggestion: 32 },
  };

  if (tradeEvolutions[speciesLower] && level >= tradeEvolutions[speciesLower].minLevelForSuggestion) {
    shouldEvolve = true;
    suggestedForm = tradeEvolutions[speciesLower].suggestedEvo;
  }

  // Level-based evolutions that are commonly missed
  if (speciesLower === 'dragonair' && level >= 60) {
    shouldEvolve = true;
    suggestedForm = 'Dragonite';
  } else if (speciesLower === 'dragonite' && level < 60) {
    shouldEvolve = true;
    suggestedForm = 'Dragonair';
  }

  // General rule for level 35+: prefer evolved forms
  if (level >= 35) {
    if (speciesLower === 'golbat') {
      shouldEvolve = true;
      suggestedForm = 'Crobat';
    } else if (speciesLower === 'pineco') {
      shouldEvolve = true;
      suggestedForm = 'Forretress';
    }
  }

  return { shouldEvolve, suggestedForm };
}


export default function TrainerArchitect() {
  const [currentTrainer, setCurrentTrainer] = useState(defaultTrainerState);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [savedTrainers, setSavedTrainers] = useState([]);
  const [changelogEntries, setChangelogEntries] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [activeTab, setActiveTab] = useState("architect");
  const [selectedRolodexTrainer, setSelectedRolodexTrainer] = useState(null);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [pokemonModalOpen, setPokemonModalOpen] = useState(false);
  const [rawOutputOpen, setRawOutputOpen] = useState(false);
  const [rawOutput, setRawOutput] = useState('');
  const [rawRetrying, setRawRetrying] = useState(false);

  const { showAssistant, quickQuery, retryWithStrictPrompt } = useQuickAssist();

  const handleRandomizeName = () => {
    const randomName = trainerNames[Math.floor(Math.random() * trainerNames.length)];
    handleInputChange('name', randomName);
  };

  const loadSavedTrainers = useCallback(async () => {
    try {
      const trainers = await Trainer.list('-created_date');
      setSavedTrainers(trainers);
      setLoadError(null);
    } catch (error) {
      console.error('Error loading trainers:', error);
      setLoadError(error);
      // Keep existing trainers in state if load fails
    }
  }, []);

  const loadChangelogEntries = useCallback(async () => {
    try {
      const entries = await ChangelogEntry.list('-created_date'); // Order by newest first
      setChangelogEntries(entries);
    } catch (error) {
      console.error('Error loading changelog:', error);
      // Non-critical, don't show error for changelog
    }
  }, []);

  useEffect(() => {
    loadSavedTrainers();
    loadChangelogEntries();
  }, [loadSavedTrainers, loadChangelogEntries]);

  const handleInputChange = (field, value) => {
    setCurrentTrainer(prev => ({ ...prev, [field]: value }));
    setSelectedRolodexTrainer(null);
  };

  const handleNewTrainer = () => {
    setCurrentTrainer(defaultTrainerState);
    setSelectedRolodexTrainer(null);
    setAiSuggestions([]);
    setActiveTab("architect");
  }

  const generateAITeam = async () => {
    // Only call AI when user explicitly clicks the generate button
    setIsGenerating(true);
    setAiSuggestions([]);

    if (!navigator.onLine) {
      setAiSuggestions([{
        type: 'error',
        title: 'Offline Mode',
        content: 'AI team generation requires an internet connection. You can still manually build teams.'
      }]);
      setIsGenerating(false);
      return;
    }

    // Enhanced prompt with expanded trainer dataset context
    const prompt = `You are an expert Pokemon trainer designer for Generation 3 games with access to comprehensive trainer datasets.

**Reference Dataset Context:**
You have access to 108+ official trainers from Ruby/Sapphire/Emerald covering all difficulty tiers, from Route 101 Youngsters to Elite Four members. Use these as blueprints for authentic team compositions that respect game balance.

**Trainer Configuration:**
- Name: ${currentTrainer.name || 'Trainer'}
- Class: ${currentTrainer.trainer_class.replace(/_/g, ' ')}
- Biome: ${currentTrainer.biome}
- Battle Style: ${currentTrainer.theme}
- Level Range: ${currentTrainer.level_min}-${currentTrainer.level_max}
- Difficulty: ${currentTrainer.difficulty}

**CRITICAL Evolution Rules:**
- Kadabra evolves at 16, use Alakazam if levels 25+
- Machoke evolves at 28, use Machamp if levels 35+
- Graveler evolves at 25, use Golem if levels 32+
- Haunter evolves at 25, use Gengar if levels 32+
- Dragonair evolves at 55, only use Dragonite if levels 60+
- For levels 35+: prefer evolved forms
- For levels 45+: strongly prefer final evolutions

**Team Size Guidelines (Based on Official Data):**
- Levels 5-15: 1-2 Pokemon (Early routes)
- Levels 16-25: 2-3 Pokemon (Mid routes) 
- Levels 26-35: 3-4 Pokemon (Gym leaders)
- Levels 36-45: 4-5 Pokemon (Elite trainers)
- Levels 46+: 5-6 Pokemon (Elite Four tier)

Generate a team following official game patterns:`;

    try {
      const response = await InvokeLLM({
        prompt,
        task: 'trainerArchitect',
        add_context_from_app: true,
        response_json_schema: {
          type: "object",
          properties: {
            party: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  species: { type: "string" },
                  level: { type: "number" },
                  role: { type: "string" }
                },
                required: ["species", "level", "role"]
              }
            }
          }
        }
      });

      // Validate using AJV to ensure the AI output strictly matches expected schema
      try {
        const ajv = new Ajv();
        const schema = {
          type: 'object',
          properties: {
            party: {
              type: 'array',
              items: { type: 'object', properties: { species: { type: 'string' }, level: { type: 'number' }, role: { type: 'string' } }, required: ['species', 'level', 'role'] }
            }
          },
          required: ['party']
        };
        const validate = ajv.compile(schema);
        const valid = validate(response);
        if (!valid) {
          // Show raw output to the user for debugging via modal
          setRawOutput(JSON.stringify(response, null, 2));
          setRawOutputOpen(true);
          throw new Error('AI output schema validation failed');
        }
      } catch (vErr) {
        console.error('Schema validation error:', vErr);
        throw vErr;
      }

      console.log('AI Response:', response); // Debug logging

      if (!response.party || !Array.isArray(response.party)) {
        throw new Error('Invalid response format from AI: "party" array missing or malformed.');
      }

      // Enhanced validation with evolution checking
      const validatedParty = [];
      const errors = [];

      for (const member of response.party) {
        try {
          // CRITICAL FIX: Validate member.species to prevent crash if AI returns non-string or empty species
          if (!member || typeof member.species !== 'string' || !member.species.trim()) {
            errors.push(`AI suggested an invalid or empty Pokemon species: '${member?.species}'. Skipping this entry.`);
            continue;
          }

          let validatedLevel = member.level;
          if (member.level < currentTrainer.level_min || member.level > currentTrainer.level_max) {
            validatedLevel = Math.max(currentTrainer.level_min, Math.min(currentTrainer.level_max, member.level));
            errors.push(`Adjusted ${member.species} level from ${member.level} to ${validatedLevel}`);
          }

          let currentSpecies = member.species;
          let details = getPokemonDetails(currentSpecies);

          if (!details) {
            errors.push(`Unknown Pokemon: ${currentSpecies}. Skipping.`);
            continue;
          }

          // Evolution integrity check
          const evolutionCheck = checkEvolutionIntegrity(currentSpecies, validatedLevel);
          if (evolutionCheck.shouldEvolve && evolutionCheck.suggestedForm !== currentSpecies) {
            errors.push(`${currentSpecies} at Lv.${validatedLevel} should be ${evolutionCheck.suggestedForm}. Correcting.`);
            const evolvedDetails = getPokemonDetails(evolutionCheck.suggestedForm);
            if (evolvedDetails) {
              details = evolvedDetails; // Replace details with the evolved form's details
              currentSpecies = evolvedDetails.name; // Update current species name
            } else {
              errors.push(`Could not find details for suggested evolution: ${evolutionCheck.suggestedForm}. Keeping original.`);
            }
          }

          // Get valid moveset for the level and updated species
          let moves = getValidMoveset(details.dex_number, validatedLevel);
          if (!moves || moves.length === 0) {
            moves = ["Tackle", "Growl", "Scratch", "Leer"]; // Fallback moves
            errors.push(`No valid moves for ${currentSpecies}, assigned basic moves.`);
          }

          // Create enriched Pokemon data
          const enrichedPokemon = {
            species: details.name,
            level: validatedLevel,
            role: member.role || 'Balanced', // Default role if not provided by AI
            types: details.types,
            base_stats: details.base_stats,
            abilities: details.abilities,
            ability: details.abilities[0], // Default to first ability
            moves: moves.slice(0, 4), // Limit to 4 moves
            dex_number: details.dex_number,
            sprite_url: details.sprite_url,
            item: null // Can be enhanced later
          };

          validatedParty.push(enrichedPokemon);
        } catch (err) {
          console.error('Error processing Pokemon:', member, err);
          errors.push(`Failed to process a Pokemon entry: ${err.message}. Original data: ${JSON.stringify(member)}`);
        }
      }

      if (validatedParty.length === 0) {
        throw new Error('No valid Pokemon generated after validation. Please try again.');
      }

      setCurrentTrainer(prev => ({ ...prev, party: validatedParty }));

      await ChangelogEntry.create({
        project_id: 'current_project',
        module: 'Trainer Architect',
        action: 'generated',
        item_name: `AI Team for ${currentTrainer.name || 'new trainer'}`,
        description: `Generated a ${validatedParty.length}-Pokemon team with style: ${currentTrainer.theme}`,
        data_after: { party: validatedParty, config: currentTrainer },
        tags: ['ai', currentTrainer.theme, currentTrainer.biome],
      });
      loadChangelogEntries();

      const suggestions = [];
      if (validatedParty.length > 0) {
        suggestions.push({
          type: 'success',
          title: 'Team Generated',
          content: `Successfully created a ${validatedParty.length}-Pokemon team.`
        });
      }

      if (errors.length > 0) {
        suggestions.push({
          type: 'warning',
          title: 'Evolution & Level Corrections',
          content: `The AI's output required ${errors.length} corrections for proper evolution stages, valid species, and levels. The team has been adjusted for game accuracy. Check details.`
        });
      }

      setAiSuggestions(suggestions);

    } catch (error) {
      console.error('Error generating AI team:', error);

      let errorMessage = 'Failed to generate team.';
      // This specifically checks for the rate limit error
      if (error?.response?.status === 429) {
          errorMessage = 'Too many requests sent to the AI service. Please wait a moment before trying again.';
      } else if (!navigator.onLine) {
        errorMessage = 'Lost internet connection during generation. Please check your connection and try again.';
      } else if (error.message.includes('Invalid response')) {
        errorMessage = 'AI returned invalid data format. Please try again.';
      } else {
        errorMessage += ' The service may be temporarily unavailable or returned unexpected data.';
      }

      setAiSuggestions([{
        type: 'error',
        title: 'Generation Error',
        content: errorMessage
      }]);
    }
    setIsGenerating(false);
  };

  const handleSaveTrainer = async () => {
    // Sanitize party data for saving, removing bulky data like stats
    const partyToSave = currentTrainer.party.map(p => ({
        species: p.species,
        level: p.level,
        item: p.item,
        ability: p.ability,
        role: p.role,
        moves: p.moves, // moves are simple strings now
        dex_number: p.dex_number
    }));

    const trainerToSave = { ...currentTrainer, party: partyToSave, project_id: 'default_project' };

    if (selectedRolodexTrainer && selectedRolodexTrainer.id) {
      await Trainer.update(selectedRolodexTrainer.id, trainerToSave);
      await ChangelogEntry.create({
        project_id: 'current_project',
        module: 'Trainer Architect',
        action: 'updated',
        item_name: trainerToSave.name,
        description: `Updated trainer '${trainerToSave.name}'`,
        data_before: selectedRolodexTrainer,
        data_after: trainerToSave,
      });
    } else {
      delete trainerToSave.id;
      const newTrainer = await Trainer.create(trainerToSave);
      await ChangelogEntry.create({
        project_id: 'current_project',
        module: 'Trainer Architect',
        action: 'created',
        item_name: newTrainer.name,
        description: `Created new trainer '${newTrainer.name}'`,
        data_after: newTrainer,
      });
    }
    loadSavedTrainers();
    loadChangelogEntries();
    handleNewTrainer();
    setActiveTab("rolodex");
  };

  const handleSelectRolodexTrainer = (trainer) => {
    // When loading from Rolodex, re-enrich the data
    const enrichedParty = (trainer.party || []).map(member => {
        // Ensure member.species is a string before calling getPokemonDetails
        if (!member || typeof member.species !== 'string' || !member.species.trim()) {
            console.warn('Skipping invalid Pokemon entry from saved trainer:', member);
            return null;
        }
        const details = getPokemonDetails(member.species);
        if (!details) {
          console.warn(`Could not find details for saved Pokemon species: ${member.species}. Skipping.`);
          return null;
        }
        return { ...details, ...member };
    }).filter(Boolean); // This filters out any nulls resulting from invalid entries

    setSelectedRolodexTrainer(trainer);
    setCurrentTrainer({
      ...trainer,
      party: enrichedParty
    });
    setAiSuggestions([]);
    setActiveTab("architect");
  };

  const handleDeleteTrainer = async (e, trainerId) => {
    e.stopPropagation();
    const trainerToDelete = savedTrainers.find(t => t.id === trainerId);
    await Trainer.delete(trainerId);
    await ChangelogEntry.create({
        project_id: 'current_project',
        module: 'Trainer Architect',
        action: 'deleted',
        item_name: trainerToDelete?.name || 'Unknown Trainer',
        description: `Deleted trainer '${trainerToDelete?.name || 'Unknown Trainer'}'`,
        data_before: trainerToDelete,
        tags: ['delete'],
    });
    loadSavedTrainers();
    loadChangelogEntries();
    if (selectedRolodexTrainer?.id === trainerId) {
       setSelectedRolodexTrainer(null);
       setCurrentTrainer(defaultTrainerState);
       setAiSuggestions([]);
    }
  };

  const handlePokemonClick = (pokemon) => {
    setSelectedPokemon(pokemon);
    setPokemonModalOpen(true);
  };

  const safeCurrentTrainer = {
    ...currentTrainer,
    party: currentTrainer.party || []
  };

  const retryLoad = () => {
    loadSavedTrainers();
    loadChangelogEntries();
  };

  const handleRetryStrict = async () => {
    if (!retryWithStrictPrompt) return;
    setRawRetrying(true);
    try {
      const strictResp = await retryWithStrictPrompt(rawOutput, { type: 'object', properties: { party: { type: 'array' } } });
      let parsed = strictResp;
      if (typeof strictResp === 'string') {
        try { parsed = JSON.parse(strictResp); } catch (e) { parsed = strictResp; }
      }
      if (parsed && parsed.party && Array.isArray(parsed.party) && parsed.party.length > 0) {
        setCurrentTrainer(prev => ({ ...prev, party: parsed.party }));
        setRawOutput(JSON.stringify(parsed, null, 2));
        setRawOutputOpen(false);
      } else {
        setRawOutput(typeof strictResp === 'string' ? strictResp : JSON.stringify(strictResp, null, 2));
      }
    } catch (err) {
      setRawOutput(`Retry failed: ${err.message}`);
    } finally {
      setRawRetrying(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-4">
              <div>
                <h1 className="text-3xl font-light text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-3">
                  <Users className="w-7 h-7 text-blue-400" />
                  Trainer Architect
                </h1>
                <p className="text-base text-slate-600 dark:text-slate-400 font-light ml-10">
                  Elite team composition for Generation III with AI analysis
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={showAssistant}
                  variant="outline"
                  className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 h-10 rounded-xl"
                >
                  <FlaskConical className="w-4 h-4 mr-2" />
                  Assistant
                </Button>
                <Button
                  onClick={handleNewTrainer}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-5 py-2.5 h-10 rounded-xl shadow-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Trainer
                </Button>
              </div>
            </div>
          </motion.div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-200 dark:bg-slate-800/50 rounded-xl p-1 mb-4">
            <TabsTrigger
              value="architect"
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-blue-400 data-[state=active]:shadow-sm text-slate-600 dark:text-slate-300"
            >
              <Cpu className="w-4 h-4" />
              Design Studio
            </TabsTrigger>
            <TabsTrigger
              value="rolodex"
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-blue-400 data-[state=active]:shadow-sm text-slate-600 dark:text-slate-300"
            >
              <BookUser className="w-4 h-4" />
              Rolodex
            </TabsTrigger>
            <TabsTrigger
              value="changelog"
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-blue-400 data-[state=active]:shadow-sm text-slate-600 dark:text-slate-300"
            >
              <History className="w-4 h-4" />
              Changelog
            </TabsTrigger>
          </TabsList>

          <TabsContent value="architect" className="space-y-8">
            <Card className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-300 dark:border-slate-800 rounded-2xl shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-blue-400 font-light flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Name</label>
                    <div className="relative">
                      <Input
                        placeholder="Trainer name"
                        value={safeCurrentTrainer.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="bg-slate-100 dark:bg-black/50 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRandomizeName}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-400 w-6 h-6"
                      >
                        <Dices className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Class</label>
                    <Select value={safeCurrentTrainer.trainer_class} onValueChange={(v) => handleInputChange('trainer_class', v)}>
                      <SelectTrigger className="bg-slate-100 dark:bg-black/50 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 rounded-xl">
                        {trainerClasses.map(c => (
                          <SelectItem key={c} value={c} className="text-slate-900 hover:bg-slate-200 dark:text-white dark:hover:bg-slate-800">
                            {gen3References.trainerClasses[c].name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Min Level</label>
                    <Input
                      type="number"
                      value={safeCurrentTrainer.level_min}
                      onChange={(e) => handleInputChange('level_min', parseInt(e.target.value) || 0)}
                      className="bg-slate-100 dark:bg-black/50 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Max Level</label>
                    <Input
                      type="number"
                      value={safeCurrentTrainer.level_max}
                      onChange={(e) => handleInputChange('level_max', parseInt(e.target.value) || 0)}
                      className="bg-slate-100 dark:bg-black/50 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Biome</label>
                    <Select value={safeCurrentTrainer.biome} onValueChange={(v) => handleInputChange('biome', v)}>
                      <SelectTrigger className="bg-slate-100 dark:bg-black/50 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 rounded-xl">
                        {biomes.map(b => (
                          <SelectItem key={b} value={b} className="text-slate-900 hover:bg-slate-200 dark:text-white dark:hover:bg-slate-800">{gen3References.biomes[b]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Difficulty</label>
                    <Select value={safeCurrentTrainer.difficulty} onValueChange={(v) => handleInputChange('difficulty', v)}>
                      <SelectTrigger className="bg-slate-100 dark:bg-black/50 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 rounded-xl">
                        {difficulties.map(d => (
                          <SelectItem key={d} value={d} className="text-slate-900 hover:bg-slate-200 dark:text-white dark:hover:bg-slate-800">{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Battle Style</label>
                    <Select value={safeCurrentTrainer.theme} onValueChange={(v) => handleInputChange('theme', v)}>
                      <SelectTrigger className="bg-slate-100 dark:bg-black/50 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 rounded-xl">
                        {themes.map(t => (
                          <SelectItem key={t} value={t} className="text-slate-900 hover:bg-slate-200 dark:text-white dark:hover:bg-slate-800">{gen3References.themes[t]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <AnimatePresence>
                  <div className="max-h-60 overflow-y-auto pr-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-4 rounded-lg flex items-center space-x-3 text-sm mb-2 ${
                          suggestion.type === 'error' ? 'bg-red-100 text-red-800 border-red-400 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500' :
                          suggestion.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border-yellow-400 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500' :
                          'bg-green-100 text-green-800 border-green-400 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500'
                        }`}
                      >
                        {suggestion.type === 'error' && <Trash2 className="w-5 h-5" />}
                        {suggestion.type === 'warning' && <Eye className="w-5 h-5" />}
                        {suggestion.type === 'success' && <Sparkles className="w-5 h-5" />}
                        <div>
                          <p className="font-semibold">{suggestion.title}</p>
                          <p>{suggestion.content}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>

                <Button
                  onClick={generateAITeam}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-50 shadow-xl"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating & Validating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Bot className="w-5 h-5" />
                      Generate Validated Team
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="bg-white/90 dark:bg-slate-900/30 backdrop-blur-xl border border-slate-300 dark:border-blue-500/20 rounded-2xl shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-2xl text-blue-400 font-light flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6" />
                        Team Roster
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-4 py-2 rounded-full text-lg">
                        {safeCurrentTrainer.party.length}/6
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AnimatePresence>
                        {Array.from({ length: 6 }).map((_, i) => {
                          const pokemon = safeCurrentTrainer.party[i];
                          return (
                            <PokemonCard
                              key={`party-slot-${i}`}
                              pokemon={pokemon}
                              onClick={handlePokemonClick}
                            />
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <TeamSynergyAnalyzer party={safeCurrentTrainer.party} />

                <Card className="bg-white/90 dark:bg-slate-900/30 backdrop-blur-xl border border-slate-300 dark:border-cyan-500/20 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg text-cyan-400 font-light flex items-center gap-2">
                      <Wand2 className="w-5 h-5" />
                      Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Notes</label>
                      <Textarea
                        placeholder="Trainer notes..."
                        value={safeCurrentTrainer.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        className="bg-slate-100 dark:bg-black/50 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none h-24"
                      />
                    </div>
                    <Button
                      onClick={handleSaveTrainer}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-xl shadow-xl"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save to Rolodex
                    </Button>
                    {selectedRolodexTrainer && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                        Editing: {selectedRolodexTrainer.name}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rolodex">
            {loadError ? (
              <EntityErrorHandler
                error={loadError}
                entityName="Trainer"
                onRetry={retryLoad}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedTrainers.length === 0 && (
                  <div className="lg:col-span-3 text-center py-16">
                    <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                      <BookUser className="w-12 h-12 text-slate-700 dark:text-slate-500" />
                    </div>
                    <h3 className="text-2xl text-slate-900 dark:text-white font-light mb-2">No trainers created yet</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">Start designing in the Studio to build your roster</p>
                    <Button onClick={() => setActiveTab("architect")} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold px-6 py-3 rounded-xl">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Trainer
                    </Button>
                  </div>
                )}

                {savedTrainers.map(trainer => (
                  <Card
                    key={trainer.id}
                    className={`bg-white/90 dark:bg-slate-900/30 backdrop-blur-xl border border-slate-300 dark:border-blue-500/20 rounded-2xl shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300 hover:border-slate-400 dark:hover:border-blue-400/50 hover:scale-105 ${
                      selectedRolodexTrainer?.id === trainer.id ? 'ring-2 ring-blue-400 border-blue-400' : ''
                    }`}
                    onClick={() => handleSelectRolodexTrainer(trainer)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl text-slate-900 dark:text-white font-medium">{trainer.name || 'Untitled Trainer'}</CardTitle>
                          <p className="text-slate-600 dark:text-slate-400 font-light capitalize">
                            {gen3References.trainerClasses[trainer.trainer_class]?.name || 'Trainer'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteTrainer(e, trainer.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4"/>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                          Lvl {trainer.level_min}-{trainer.level_max}
                        </Badge>
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                          {gen3References.biomes[trainer.biome]}
                        </Badge>
                        <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-xs">
                          {gen3References.themes[trainer.theme]}
                        </Badge>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm text-slate-600 dark:text-slate-400 mb-2">Team ({(trainer.party || []).length}/6):</h4>
                        <div className="flex gap-1 flex-wrap">
                          {(trainer.party || []).length > 0 ? (
                            (trainer.party || []).slice(0, 6).map((p, i) => {
                              // Ensure p.species is a string before calling getPokemonDetails
                              const speciesName = typeof p.species === 'string' ? p.species : 'Unknown';
                              const details = getPokemonDetails(speciesName);
                              const spriteUrl = details?.sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png`;

                              return (
                                <div
                                  key={i}
                                  className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800/50 border border-slate-300 dark:border-blue-500/20 flex items-center justify-center overflow-hidden"
                                  title={speciesName}
                                >
                                  <img
                                    src={spriteUrl}
                                    alt={speciesName}
                                    className="w-6 h-6"
                                    style={{ imageRendering: 'pixelated' }}
                                  />
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-xs text-slate-700 dark:text-slate-500">No Pokémon in party</p>
                          )}
                        </div>
                      </div>

                      {trainer.notes && (
                        <p className="text-xs italic line-clamp-2 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-black/20 p-2 rounded-lg">{trainer.notes}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="changelog" className="space-y-6">
            <h2 className="text-3xl font-light text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <History className="w-7 h-7" /> Project Changelog
            </h2>
            {changelogEntries.length === 0 ? (
                <div className="text-center py-16 text-slate-600 dark:text-slate-400">
                    No history yet. Start generating and saving trainers!
                </div>
            ) : (
                <div className="space-y-4">
                    {changelogEntries.map(entry => (
                        <Card key={entry.id} className="bg-white/90 dark:bg-slate-900/30 border border-slate-300 dark:border-slate-700 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                        entry.action === 'created' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' :
                                        entry.action === 'updated' ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400' :
                                        entry.action === 'deleted' ? 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400' :
                                        entry.action === 'generated' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-400' :
                                        'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400'
                                    }`}>
                                        {entry.action.toUpperCase()}
                                    </span>
                                    <span className="text-slate-800 dark:text-slate-300 font-medium">{entry.item_name}</span>
                                </div>
                                <span className="text-xs text-slate-700 dark:text-slate-500">
                                    {new Date(entry.created_date).toLocaleString()}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{entry.description}</p>
                            {entry.tags && entry.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {entry.tags.map((tag, i) => (
                                        <Badge key={i} variant="outline" className="text-slate-700 border-slate-400 dark:text-slate-500 dark:border-slate-600">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <PokemonDetailModal
        pokemon={selectedPokemon}
        isOpen={pokemonModalOpen}
        onClose={() => setPokemonModalOpen(false)}
      />
      <RawOutputModal open={rawOutputOpen} onClose={() => setRawOutputOpen(false)} output={rawOutput} onRetry={handleRetryStrict} />
    </div>
  );
}
