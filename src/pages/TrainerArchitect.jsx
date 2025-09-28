import { ChangelogEntry, Trainer } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import EntityErrorHandler from "@/components/shared/EntityErrorHandler";
import ExportImportDialog from "@/components/shared/ExportImportDialog";
import { useQuickAssist } from "@/components/shared/LabAssistantService";
import { PageShell } from "@/components/shared/PageShell";
import RawOutputModal from "@/components/shared/RawOutputModal";
import { useUser } from "@/contexts/UserContext";
// TODO: Re-enable when components are ready for production
// import PerformanceDashboard from "@/components/shared/PerformanceDashboard";
// import UXControlPanel from "@/components/shared/UXControlPanel";
import {
  DEFAULT_TRAINER,
  DIFFICULTIES,
  THEMES,
  TRAINER_CLASSES,
} from "@/components/trainer/constants";
import { downscaleSpeciesForLevel } from "@/components/trainer/evolutionRules";
import {
  findReplacement,
  gen3References,
  getPokemonDetails,
  getValidMoveset,
} from "@/components/trainer/PokemonData";
import TeamSynergyAnalyzer from "@/components/trainer/TeamSynergyAnalyzer";
import { pokemonData } from "@/components/trainer/TrainerDataset";
import { getRandomTrainerName } from "@/components/trainer/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
// Popover components removed - not used in current implementation
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  integratedPokedex as completePokedex,
  getPokemonSprite,
} from "@/data/integratedPokedex";
// TODO: Re-enable when hooks are ready for production
// import useAdvancedUX from "@/hooks/useAdvancedUX";
// import usePerformance from "@/hooks/usePerformance";
// import { useTeamValidation, useTrainerValidation } from '@/hooks/useValidation';
import { useAppState } from "@/lib/appState.jsx";
import { trainerLogger } from "@/lib/logger";
import { Gen3TeamGenerator } from "@/services/Gen3TeamGenerator";
import { ImprovedTeamGenerator } from "@/services/ImprovedTeamGenerator";
import Ajv from "ajv";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookUser,
  Bot,
  ChevronDown,
  Cpu,
  Dices,
  Eye,
  FlaskConical,
  History,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Users,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

/**
 * TrainerArchitect: Pokemon Trainer Generation System
 *
 * Core functionality:
 * - Multi-biome trainer generation
 * - Trainer validation and evolution checking
 * - Team analysis and movesets
 * - Changelog tracking
 */

// Available biomes for trainer generation, sourced from comprehensive Pokemon habitat data
const AVAILABLE_BIOMES = [
  "Beach",
  "Desert",
  "Forest",
  "Freshwater",
  "Grassland",
  "Ice",
  "Mountain",
  "Mystical",
  "Sky",
  "Swamp",
  "Underground",
  "Urban",
  "Volcanic",
  "Water",
];

// Import trainer configuration constants
const themes = THEMES;
const difficulties = DIFFICULTIES;
const trainerClasses = TRAINER_CLASSES;

// Default trainer state with multi-biome support
const defaultTrainerState = {
  ...DEFAULT_TRAINER,
  biomes: ["Grassland"], // Support multiple biomes for diverse team composition
};

// Initialize specialized generators with comprehensive error handling
let gen3Generator = null;
let improvedGenerator = null;

const initializeGenerators = () => {
  try {
    if (!gen3Generator) {
      gen3Generator = new Gen3TeamGenerator();
      trainerLogger.info("Gen3TeamGenerator initialized successfully");
    }
  } catch (error) {
    trainerLogger.warn("Gen3TeamGenerator initialization failed", {
      error: error.message,
    });
  }

  try {
    if (!improvedGenerator) {
      improvedGenerator = new ImprovedTeamGenerator();
      trainerLogger.info("ImprovedTeamGenerator initialized successfully");
    }
  } catch (error) {
    trainerLogger.warn("ImprovedTeamGenerator initialization failed", {
      error: error.message,
    });
  }
};

// Initialize on module load
initializeGenerators();

/**
 * Programmatic team generation using the ImprovedTeamGenerator
 *
 * Primary interface for generating Pokemon teams
 * with biome compatibility, evolution validation, and moveset optimization.
 *
 * @param {Object} params - Generation parameters
 * @param {string} params.pokedexScope - Generation scope ('gen1', 'gen2', 'gen3', 'all')
 * @param {number} params.minDex - Minimum Pokedex number (legacy compatibility)
 * @param {number} params.maxDex - Maximum Pokedex number (legacy compatibility)
 * @param {Array<string>} params.biomes - Array of biomes for diverse habitat selection
 * @param {number} params.level_min - Minimum Pokemon level
 * @param {number} params.level_max - Maximum Pokemon level
 * @param {string} params.trainer_class - Trainer class affecting type preferences
 * @param {string} params.difficulty - Difficulty level affecting team size and quality
 * @param {string} params.theme - Battle theme affecting move selection strategy
 * @returns {Object} Generated team with metadata and success status
 */
function generateTeamProgrammatically({
  pokedexScope = "gen3",
  minDex: _minDex,
  maxDex: _maxDex,
  biomes = ["Grassland"],
  level_min = 10,
  level_max = 15,
  trainer_class = "youngster",
  difficulty = "Medium",
  theme = "Balanced",
}) {
  // Select biome for fallback compatibility while preserving multi-biome support
  const selectedBiome = Array.isArray(biomes)
    ? biomes[Math.floor(Math.random() * biomes.length)]
    : biomes;

  try {
    // Ensure generators are initialized
    if (!improvedGenerator) {
      initializeGenerators();
    }

    // Primary generation using the advanced ImprovedTeamGenerator
    if (improvedGenerator) {
      const result = improvedGenerator.generateTeam({
        trainerClass:
          trainer_class.charAt(0).toUpperCase() + trainer_class.slice(1),
        levelMin: level_min,
        levelMax: level_max,
        biomes: biomes,
        difficulty,
        battleStyle: theme,
        pokedexScope,
      });

      trainerLogger.debug("ImprovedTeamGenerator result", {
        teamSize: result.team.length,
        biomes,
        difficulty,
      });

      // Return standardized format for UI consumption
      return {
        success: true,
        party: result.team.map((pokemon) => ({
          ...pokemon,
          species: pokemon.species || pokemon.name, // Use species if available, fallback to name
        })),
        metadata: result.metadata,
      };
    } else {
      throw new Error("ImprovedTeamGenerator not available");
    }
  } catch (_error) {
    trainerLogger.warn(
      "Improved generator failed, falling back to Gen3 generator",
      { error: _error.message }
    );

    // Fallback to legacy generator with parameter conversion
    const normalizedScope = (pokedexScope || "gen3").toLowerCase();

    const options = {
      biome: selectedBiome,
      levelMin: level_min,
      levelMax: level_max,
      trainerClass: trainer_class,
      difficulty: difficulty === "Auto" ? "Medium" : difficulty,
      battleStyle:
        theme === "Balanced"
          ? "Balanced"
          : theme === "Aggressive"
          ? "Aggressive"
          : theme === "Defensive"
          ? "Defensive"
          : "Balanced",
      pokedexScope: normalizedScope,
      teamSize: null,
    };

    try {
      // Ensure generators are initialized
      if (!gen3Generator) {
        initializeGenerators();
      }

      if (gen3Generator) {
        return gen3Generator.generateEnhancedTeam(options);
      } else {
        throw new Error("Gen3TeamGenerator not available");
      }
    } catch (_error) {
      trainerLogger.error("Gen3TeamGenerator failed", {
        error: _error.message,
      });

      // Create a robust fallback team using completePokedex
      const getBasicPokemon = (dexNum, name, types, defaultLevel) => {
        const pokemon = completePokedex[dexNum.toString()];
        return {
          species: pokemon?.name || name,
          level: defaultLevel,
          role: "Basic",
          types: pokemon?.types || types,
          dex_number: dexNum,
        };
      };

      // Generate a basic but valid team
      const fallbackTeam = [
        getBasicPokemon(19, "Rattata", ["Normal"], level_min),
        getBasicPokemon(16, "Pidgey", ["Normal", "Flying"], level_min + 1),
      ];

      // Add more Pokemon based on level range
      if (level_max >= 20) {
        fallbackTeam.push(
          getBasicPokemon(25, "Pikachu", ["Electric"], level_min + 2)
        );
      }
      if (level_max >= 30) {
        fallbackTeam.push(
          getBasicPokemon(104, "Cubone", ["Ground"], level_min + 3)
        );
      }

      return {
        success: true,
        party: fallbackTeam,
        metadata: {
          source: "fallback",
          message: "Used emergency fallback generation",
        },
      };
    }
  }
}

/**
 * Pokemon type color mapping for UI visual consistency
 * Returns Tailwind CSS background color classes based on Pokemon type
 *
 * @param {string} type - Pokemon type (e.g., 'Fire', 'Water', 'Grass')
 * @returns {string} Tailwind CSS background color class
 */
const getTypeColor = (type) => {
  const typeColorMap = {
    normal: "bg-gray-400",
    fire: "bg-red-500",
    water: "bg-blue-500",
    electric: "bg-yellow-400",
    grass: "bg-green-500",
    ice: "bg-blue-300",
    fighting: "bg-red-700",
    poison: "bg-purple-500",
    ground: "bg-yellow-600",
    flying: "bg-indigo-400",
    psychic: "bg-pink-500",
    bug: "bg-green-400",
    rock: "bg-yellow-800",
    ghost: "bg-purple-700",
    dragon: "bg-indigo-700",
    dark: "bg-gray-800",
    steel: "bg-gray-500",
    fairy: "bg-pink-300",
  };
  return typeColorMap[type?.toLowerCase()] || "bg-gray-400";
};

/**
 * Pokemon type gradient mapping for visual effects
 * Returns Tailwind CSS gradient classes for type indicators
 *
 * @param {string} type - Pokemon type (e.g., 'Fire', 'Water', 'Grass')
 * @returns {string} Tailwind CSS gradient class
 */
const getTypeGradient = (type) => {
  const typeGradientMap = {
    normal: "from-gray-400 to-gray-600",
    fire: "from-red-500 to-orange-600",
    water: "from-blue-500 to-cyan-500",
    electric: "from-yellow-400 to-yellow-600",
    grass: "from-green-500 to-emerald-500",
    ice: "from-blue-300 to-cyan-300",
    fighting: "from-red-700 to-red-800",
    poison: "from-purple-500 to-violet-600",
    ground: "from-yellow-600 to-orange-700",
    flying: "from-indigo-400 to-sky-500",
    psychic: "from-pink-500 to-purple-500",
    bug: "from-green-400 to-lime-500",
    rock: "from-yellow-800 to-amber-800",
    ghost: "from-purple-700 to-indigo-800",
    dragon: "from-indigo-700 to-purple-700",
    dark: "from-gray-800 to-slate-900",
    steel: "from-gray-500 to-slate-600",
    fairy: "from-pink-300 to-rose-400",
  };
  return typeGradientMap[type?.toLowerCase()] || "from-gray-400 to-gray-600";
};

/**
 * Pokemon card component
 *
 * Features:
 * - Sprite display with fallback handling
 * - Type indicator badges
 * - Level and role information
 * - Moveset preview
 * - Hover effects and click handling
 * - Compact mode option
 *
 * @param {Object} pokemon - Pokemon data object
 * @param {string} pokemon.species - Pokemon species name
 * @param {Array<string>} pokemon.types - Pokemon types
 * @param {number} pokemon.level - Pokemon level
 * @param {string} pokemon.role - Battle role (e.g., 'Physical Attacker')
 * @param {string} pokemon.ability - Pokemon ability
 * @param {Array<string>} pokemon.moves - Pokemon movesets
 * @param {Function} onClick - Click event handler
 * @param {boolean} compact - Whether to use compact display mode
 * @returns {JSX.Element} Pokemon card component
 */
function PokemonCard({ pokemon, onClick, compact = false }) {
  if (!pokemon || !pokemon.species) {
    return (
      <div
        className={`${
          compact ? "h-[200px] p-3 rounded-lg" : "aspect-square p-4 rounded-2xl"
        } border-2 border-dashed border-slate-400 dark:border-slate-600 hover:border-slate-500 dark:hover:border-slate-500 cursor-pointer transition-all duration-300`}
      >
        <div className="h-full flex flex-col items-center justify-center text-slate-700 dark:text-slate-500">
          <Plus
            className={
              compact ? "w-6 h-6 opacity-50 mb-2" : "w-8 h-8 mb-2 opacity-50"
            }
          />
          <span className="text-xs">Empty</span>
        </div>
      </div>
    );
  }

  const {
    species,
    types,
    level,
    role,
    ability,
    moves,
    base_stats,
    sprite: providedSprite,
  } = pokemon;

  // Get Pokemon details to ensure we have complete data
  const pokemonDetails = getPokemonDetails(species);

  // Use the sprite provided by the backend, fallback to local sprite system if not available
  let sprite = providedSprite;
  if (!sprite) {
    sprite = pokemonDetails
      ? getPokemonSprite(pokemonDetails.dex_number)
      : "/sprites/000.png";
  }

  // Get base stats with proper mapping - prioritize completePokedex data
  let stats = null;

  // First try to get from completePokedex (most reliable source)
  // Try both string and number keys since data structure may vary
  const dexNumber = pokemonDetails?.dex_number;
  const integratedData =
    completePokedex[dexNumber] || completePokedex[String(dexNumber)];

  if (integratedData?.baseStats) {
    const iStats = integratedData.baseStats;
    // Only use if all stats are valid positive numbers
    if (
      iStats.hp > 0 &&
      iStats.attack > 0 &&
      iStats.defense > 0 &&
      iStats.spAttack > 0 &&
      iStats.spDefense > 0 &&
      iStats.speed > 0
    ) {
      stats = {
        hp: iStats.hp,
        attack: iStats.attack,
        defense: iStats.defense,
        sp_attack: iStats.spAttack,
        sp_defense: iStats.spDefense,
        speed: iStats.speed,
      };
    }
  }

  // Fallback to provided base_stats if completePokedx doesn't have it
  if (!stats && base_stats) {
    // Handle different base_stats formats
    if (typeof base_stats === "object") {
      const hp = base_stats.hp || base_stats.HP;
      const attack = base_stats.attack || base_stats.Attack || base_stats.ATK;
      const defense =
        base_stats.defense || base_stats.Defense || base_stats.DEF;
      const sp_attack =
        base_stats.sp_attack ||
        base_stats["special-attack"] ||
        base_stats.spAttack ||
        base_stats.specialAttack ||
        base_stats.SPA;
      const sp_defense =
        base_stats.sp_defense ||
        base_stats["special-defense"] ||
        base_stats.spDefense ||
        base_stats.specialDefense ||
        base_stats.SPD;
      const speed = base_stats.speed || base_stats.Speed || base_stats.SPE;

      // Only use if we have valid stats (must be positive numbers)
      if (
        hp > 0 &&
        attack > 0 &&
        defense > 0 &&
        sp_attack > 0 &&
        sp_defense > 0 &&
        speed > 0
      ) {
        stats = { hp, attack, defense, sp_attack, sp_defense, speed };
      }
    }
  }

  // Try pokemonDetails as another fallback
  if (!stats && pokemonDetails?.baseStats) {
    const pokemonBaseStats = pokemonDetails.baseStats;
    const hp = pokemonBaseStats.hp;
    const attack = pokemonBaseStats.attack;
    const defense = pokemonBaseStats.defense;
    const sp_attack =
      pokemonBaseStats.specialAttack || pokemonBaseStats.spAttack;
    const sp_defense =
      pokemonBaseStats.specialDefense || pokemonBaseStats.spDefense;
    const speed = pokemonBaseStats.speed;

    // Only use if all stats are valid positive numbers
    if (
      hp > 0 &&
      attack > 0 &&
      defense > 0 &&
      sp_attack > 0 &&
      sp_defense > 0 &&
      speed > 0
    ) {
      stats = { hp, attack, defense, sp_attack, sp_defense, speed };
    }
  }

  // Try to get known stats for common Pokemon as hardcoded fallback
  if (!stats) {
    const knownStats = {
      Gulpin: {
        hp: 70,
        attack: 43,
        defense: 53,
        sp_attack: 43,
        sp_defense: 53,
        speed: 40,
      },
      Swalot: {
        hp: 100,
        attack: 73,
        defense: 83,
        sp_attack: 73,
        sp_defense: 83,
        speed: 55,
      },
      Ekans: {
        hp: 35,
        attack: 60,
        defense: 44,
        sp_attack: 40,
        sp_defense: 54,
        speed: 55,
      },
      Arbok: {
        hp: 60,
        attack: 95,
        defense: 69,
        sp_attack: 65,
        sp_defense: 79,
        speed: 80,
      },
      Bulbasaur: {
        hp: 45,
        attack: 49,
        defense: 49,
        sp_attack: 65,
        sp_defense: 65,
        speed: 45,
      },
      Ivysaur: {
        hp: 60,
        attack: 62,
        defense: 63,
        sp_attack: 80,
        sp_defense: 80,
        speed: 60,
      },
      Venusaur: {
        hp: 80,
        attack: 82,
        defense: 83,
        sp_attack: 100,
        sp_defense: 100,
        speed: 80,
      },
      Charmander: {
        hp: 39,
        attack: 52,
        defense: 43,
        sp_attack: 60,
        sp_defense: 50,
        speed: 65,
      },
      Charmeleon: {
        hp: 58,
        attack: 64,
        defense: 58,
        sp_attack: 80,
        sp_defense: 65,
        speed: 80,
      },
      Charizard: {
        hp: 78,
        attack: 84,
        defense: 78,
        sp_attack: 109,
        sp_defense: 85,
        speed: 100,
      },
      Squirtle: {
        hp: 44,
        attack: 48,
        defense: 65,
        sp_attack: 50,
        sp_defense: 64,
        speed: 43,
      },
      Wartortle: {
        hp: 59,
        attack: 63,
        defense: 80,
        sp_attack: 65,
        sp_defense: 80,
        speed: 58,
      },
      Blastoise: {
        hp: 79,
        attack: 83,
        defense: 100,
        sp_attack: 85,
        sp_defense: 105,
        speed: 78,
      },
      Treecko: {
        hp: 40,
        attack: 45,
        defense: 35,
        sp_attack: 65,
        sp_defense: 55,
        speed: 70,
      },
      Grovyle: {
        hp: 50,
        attack: 65,
        defense: 45,
        sp_attack: 85,
        sp_defense: 65,
        speed: 95,
      },
      Sceptile: {
        hp: 70,
        attack: 85,
        defense: 65,
        sp_attack: 105,
        sp_defense: 85,
        speed: 120,
      },
      Torchic: {
        hp: 45,
        attack: 60,
        defense: 40,
        sp_attack: 70,
        sp_defense: 50,
        speed: 45,
      },
      Combusken: {
        hp: 60,
        attack: 85,
        defense: 60,
        sp_attack: 85,
        sp_defense: 60,
        speed: 55,
      },
      Blaziken: {
        hp: 80,
        attack: 120,
        defense: 70,
        sp_attack: 110,
        sp_defense: 70,
        speed: 80,
      },
      Mudkip: {
        hp: 50,
        attack: 70,
        defense: 50,
        sp_attack: 50,
        sp_defense: 50,
        speed: 40,
      },
      Marshtomp: {
        hp: 70,
        attack: 85,
        defense: 70,
        sp_attack: 60,
        sp_defense: 70,
        speed: 50,
      },
      Swampert: {
        hp: 100,
        attack: 110,
        defense: 90,
        sp_attack: 85,
        sp_defense: 90,
        speed: 60,
      },
    };

    if (knownStats[species]) {
      stats = knownStats[species];
    }
  }

  // Final fallback with sensible defaults
  if (!stats) {
    stats = {
      hp: 50,
      attack: 50,
      defense: 50,
      sp_attack: 50,
      sp_defense: 50,
      speed: 50,
    };
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-slate-900/80 backdrop-blur-sm border cursor-pointer group transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden ${
        compact
          ? "rounded-xl p-3 text-xs h-[280px] flex flex-col border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/40 hover:shadow-blue-500/10"
          : "rounded-2xl p-4 border-slate-300 dark:border-blue-400/30 hover:border-slate-400 dark:hover:border-blue-400/60"
      }`}
      onClick={() => onClick && onClick(pokemon)}
    >
      {compact ? (
        // Compact layout
        <>
          {/* Header: Sprite, Name, Types, Level with BST */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-xl flex items-center justify-center border-2 border-slate-300 dark:border-blue-500/30 flex-shrink-0 group-hover:border-blue-400/50 transition-colors duration-300 relative">
              <img
                src={sprite}
                alt={species}
                className="w-11 h-11 drop-shadow-lg group-hover:scale-110 transition-transform duration-300 z-10"
                style={{ imageRendering: "pixelated" }}
                onError={(e) => {
                  e.target.src = "/sprites/000.png";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-300/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {species}
              </h3>
              <div className="flex items-center gap-1 mt-1 mb-1">
                {types?.slice(0, 2).map((type, idx) => (
                  <div
                    key={idx}
                    className={`px-2 py-0.5 text-[9px] font-bold text-white rounded-full ${getTypeColor(
                      type
                    )} shadow-sm`}
                    title={type}
                  >
                    {type.slice(0, 3).toUpperCase()}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] px-2 py-0.5 font-medium">
                  Lv. {level || "?"}
                </Badge>
                <Badge
                  className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[9px] px-2 py-0.5 font-medium"
                  title="Base Stat Total"
                >
                  BST:{" "}
                  {stats
                    ? stats.hp +
                      stats.attack +
                      stats.defense +
                      stats.sp_attack +
                      stats.sp_defense +
                      stats.speed
                    : "?"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mb-2 pb-2 border-b border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[9px] text-slate-600 dark:text-slate-400 font-semibold">
                Base Stats
              </div>
              <div
                className="text-[8px] text-slate-500 dark:text-slate-400"
                title="Highest stat"
              >
                Max:{" "}
                {Math.max(
                  stats.hp,
                  stats.attack,
                  stats.defense,
                  stats.sp_attack,
                  stats.sp_defense,
                  stats.speed
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[8px]">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-700 dark:text-slate-400 w-4 font-medium">
                  HP
                </span>
                <div className="flex-1 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${Math.min(100, (stats.hp / 180) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-red-500 w-6 text-right font-medium">
                  {stats.hp}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-700 dark:text-slate-400 w-4 font-medium">
                  ATK
                </span>
                <div className="flex-1 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${Math.min(100, (stats.attack / 180) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-orange-500 w-6 text-right font-medium">
                  {stats.attack}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-700 dark:text-slate-400 w-4 font-medium">
                  DEF
                </span>
                <div className="flex-1 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${Math.min(100, (stats.defense / 180) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-blue-500 w-6 text-right font-medium">
                  {stats.defense}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-700 dark:text-slate-400 w-4 font-medium">
                  SPA
                </span>
                <div className="flex-1 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${Math.min(100, (stats.sp_attack / 180) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-purple-500 w-6 text-right font-medium">
                  {stats.sp_attack}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-700 dark:text-slate-400 w-4 font-medium">
                  SPD
                </span>
                <div className="flex-1 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${Math.min(
                        100,
                        (stats.sp_defense / 180) * 100
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-green-500 w-6 text-right font-medium">
                  {stats.sp_defense}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-700 dark:text-slate-400 w-4 font-medium">
                  SPE
                </span>
                <div className="flex-1 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${Math.min(100, (stats.speed / 180) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-yellow-500 w-6 text-right font-medium">
                  {stats.speed}
                </span>
              </div>
            </div>
          </div>

          {/* Moves Section */}
          <div className="mb-2 flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[9px] text-slate-600 dark:text-slate-400 font-semibold">
                Moveset
              </div>
              <div className="text-[8px] text-slate-500 dark:text-slate-400">
                {moves?.length || 0}/4
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {moves && moves.length > 0 ? (
                moves.slice(0, 4).map((move, i) => (
                  <div
                    key={i}
                    className="text-[8px] text-slate-700 dark:text-slate-300 truncate bg-gradient-to-r from-slate-200/80 to-slate-100/80 dark:from-slate-700/50 dark:to-slate-600/30 px-1.5 py-1 rounded-md border border-slate-300/50 dark:border-slate-600/30 shadow-sm hover:shadow-md transition-shadow"
                    title={move}
                  >
                    {move}
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-[8px] text-slate-500 dark:text-slate-400 italic text-center py-2 bg-slate-100/50 dark:bg-slate-800/30 rounded-md border border-dashed border-slate-300 dark:border-slate-600">
                  No moves assigned
                </div>
              )}
            </div>
          </div>

          {/* Footer: Role & Ability */}
          <div className="mt-auto pt-2 border-t border-slate-200 dark:border-slate-700/50">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[8px] text-slate-600 dark:text-slate-400 font-medium">
                  Role:
                </span>
                <span className="text-[8px] text-indigo-500 dark:text-indigo-400 font-semibold bg-indigo-100/50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
                  {role || "Unassigned"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[8px] text-slate-600 dark:text-slate-400 font-medium">
                  Ability:
                </span>
                <span
                  className="text-[8px] text-blue-500 dark:text-blue-400 font-semibold bg-blue-100/50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full truncate max-w-[80px]"
                  title={ability}
                >
                  {ability || "None"}
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        // REGULAR LAYOUT
        <>
          {/* Pokemon Sprite & Basic Info */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-900/50 rounded-lg flex items-center justify-center border border-slate-300 dark:border-blue-500/20">
              <img
                src={sprite}
                alt={species}
                className="w-12 h-12 drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                style={{ imageRendering: "pixelated" }}
                onError={(e) => {
                  e.target.src = "/sprites/000.png";
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                {species}
              </h3>
              <div className="flex items-center gap-1 mb-1">
                {types?.slice(0, 2).map((type, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full ${getTypeColor(type)}`}
                  />
                ))}
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5">
                Lv. {level || "?"}
              </Badge>
            </div>
          </div>

          {/* Moveset Preview */}
          <div className="space-y-1 min-h-0">
            <h4 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              Moves
            </h4>
            <div className="grid grid-cols-1 gap-1 overflow-hidden">
              {moves?.slice(0, 4).map((move, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-xs overflow-hidden"
                >
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-full">
                    {move}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Role & Ability */}
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/50">
            <div className="flex justify-between items-center text-xs">
              <span className="text-indigo-400 font-medium truncate">
                {role}
              </span>
              <span className="text-blue-400 font-medium truncate">
                {ability}
              </span>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

export default React.memo(TrainerArchitect);

function PokemonDetailModal({ pokemon, isOpen, onClose }) {
  if (!pokemon) return null;

  const {
    species,
    types,
    level,
    role,
    ability,
    moves,
    base_stats,
    item,
    reasoning,
    sprite: providedSprite,
  } = pokemon;

  // Get Pokemon details to ensure we have complete data
  const pokemonDetails = getPokemonDetails(species);

  // Use the sprite provided by the backend, fallback to local sprite system if not available
  let sprite = providedSprite;
  if (!sprite) {
    sprite = pokemonDetails
      ? getPokemonSprite(pokemonDetails.dex_number)
      : "/sprites/000.png";
  }

  // Get base stats with proper mapping - prioritize completePokedex data
  let stats = null;

  // First try to get from completePokedex (most reliable source)
  const integratedData = completePokedex[pokemonDetails?.dex_number];
  if (integratedData?.baseStats) {
    const iStats = integratedData.baseStats;
    stats = {
      hp: iStats.hp,
      attack: iStats.attack,
      defense: iStats.defense,
      sp_attack: iStats.spAttack,
      sp_defense: iStats.spDefense,
      speed: iStats.speed,
    };
  }

  // Fallback to provided base_stats if completePokedex doesn't have it
  if (!stats && base_stats) {
    stats = base_stats;
  }

  // Try pokemonDetails as another fallback
  if (!stats && pokemonDetails?.baseStats) {
    const pokemonBaseStats = pokemonDetails.baseStats;
    const hp = pokemonBaseStats.hp;
    const attack = pokemonBaseStats.attack;
    const defense = pokemonBaseStats.defense;
    const sp_attack =
      pokemonBaseStats.specialAttack || pokemonBaseStats.spAttack;
    const sp_defense =
      pokemonBaseStats.specialDefense || pokemonBaseStats.spDefense;
    const speed = pokemonBaseStats.speed;

    // Only use if all stats are valid positive numbers
    if (
      hp > 0 &&
      attack > 0 &&
      defense > 0 &&
      sp_attack > 0 &&
      sp_defense > 0 &&
      speed > 0
    ) {
      stats = { hp, attack, defense, sp_attack, sp_defense, speed };
    }
  }

  // Final fallback with sensible defaults
  if (!stats) {
    stats = {
      hp: 50,
      attack: 50,
      defense: 50,
      sp_attack: 50,
      sp_defense: 50,
      speed: 50,
    };
  }

  const statsOrder = [
    "hp",
    "attack",
    "defense",
    "sp_attack",
    "sp_defense",
    "speed",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background/95 border border-primary/30 max-w-2xl backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-light text-blue-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {species}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-white dark:from-slate-800/50 dark:to-black/50 rounded-lg flex items-center justify-center border border-slate-300 dark:border-blue-500/20">
              <img
                src={sprite}
                alt={species}
                className="w-16 h-16 drop-shadow-lg"
                style={{ imageRendering: "pixelated" }}
                onError={(e) => {
                  e.target.src = "/sprites/000.png";
                }}
              />
            </div>
            <div className="flex-1">
              <div className="flex gap-2 mb-3">
                {types?.map((type, i) => (
                  <div
                    key={i}
                    className={`px-3 py-1 rounded-full bg-gradient-to-r ${getTypeGradient(
                      type
                    )} text-white font-medium text-xs shadow-lg`}
                  >
                    {String(type || "").toUpperCase()}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
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
                  <p className="text-yellow-400 font-medium">
                    {item || "None"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Card className="bg-muted/50 border border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-400 flex items-center gap-2">
                <Cpu className="w-3 h-3" />
                Base Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {statsOrder.map((statName) => (
                <div
                  key={statName}
                  className="flex justify-between items-center"
                >
                  <span className="text-slate-700 dark:text-slate-300 text-xs capitalize">
                    {statName.replace("_", " ")}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-300 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000"
                        style={{
                          width: `${Math.min(
                            100,
                            (stats[statName] / 255) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-blue-400 font-mono text-xs w-6 text-right">
                      {stats[statName]}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-blue-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-400 flex items-center gap-2">
                <Zap className="w-3 h-3" />
                Moveset
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {moves?.map((move, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-1.5 bg-slate-200 dark:bg-slate-800/30 rounded"
                >
                  <span className="text-slate-800 dark:text-slate-200 font-medium text-xs">
                    {move}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-muted/50 border border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-indigo-400">
                Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                {reasoning ||
                  `This ${species} serves as a ${role} in the team composition, utilizing its ${ability} ability effectively at level ${level}.`}
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Validates Pokemon evolution integrity for individual species
 *
 * This function analyzes whether a Pokemon should have evolved based on its level
 * and evolution requirements. It handles both level-based and trade evolutions,
 * providing suggestions for appropriate evolutionary forms.
 *
 * Key features:
 * - Trade evolution checking (Kadabra, Machoke, Graveler, Haunter)
 * - Level-based evolution validation
 * - Form suggestions for under-evolved Pokemon
 * - Null safety for species parameter
 *
 * @param {string} species - Pokemon species name
 * @param {number} level - Pokemon level
 * @returns {Object} Evolution check result
 * @returns {boolean} returns.shouldEvolve - Whether Pokemon should have evolved
 * @returns {string} returns.suggestedForm - Recommended evolutionary form
 */
function checkEvolutionIntegrity(species, level) {
  let shouldEvolve = false;
  let suggestedForm = species;
  const speciesLower = (species || "").toLowerCase();

  // Trade evolutions that should be fully evolved at certain levels
  const tradeEvolutions = {
    kadabra: { suggestedEvo: "Alakazam", minLevelForSuggestion: 25 },
    machoke: { suggestedEvo: "Machamp", minLevelForSuggestion: 35 },
    graveler: { suggestedEvo: "Golem", minLevelForSuggestion: 32 },
    haunter: { suggestedEvo: "Gengar", minLevelForSuggestion: 32 },
  };

  if (
    tradeEvolutions[speciesLower] &&
    level >= tradeEvolutions[speciesLower].minLevelForSuggestion
  ) {
    shouldEvolve = true;
    suggestedForm = tradeEvolutions[speciesLower].suggestedEvo;
  }

  // Level-based evolutions that are commonly missed
  if (speciesLower === "dragonair" && level >= 60) {
    shouldEvolve = true;
    suggestedForm = "Dragonite";
  } else if (speciesLower === "dragonite" && level < 60) {
    shouldEvolve = true;
    suggestedForm = "Dragonair";
  }

  // General rule for level 35+: prefer evolved forms
  if (level >= 35) {
    if (speciesLower === "golbat") {
      shouldEvolve = true;
      suggestedForm = "Crobat";
    } else if (speciesLower === "pineco") {
      shouldEvolve = true;
      suggestedForm = "Forretress";
    }
  }

  return { shouldEvolve, suggestedForm };
}

// Multi-select biome component
// Compact biome selector with checkboxes
function CompactBiomeSelector({ selectedBiomes, onBiomesChange }) {
  const toggleBiome = (biome) => {
    const newBiomes = selectedBiomes.includes(biome)
      ? selectedBiomes.filter((b) => b !== biome)
      : [...selectedBiomes, biome];
    onBiomesChange(newBiomes);
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
        Training Biomes
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {AVAILABLE_BIOMES.map((biome) => (
          <label
            key={biome}
            className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-2 transition-colors"
          >
            <Checkbox
              checked={selectedBiomes.includes(biome)}
              onCheckedChange={() => toggleBiome(biome)}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-4 w-4"
            />
            <span className="text-slate-700 dark:text-slate-300 select-none">
              {biome}
            </span>
          </label>
        ))}
      </div>
      {selectedBiomes.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedBiomes.map((biome) => (
            <Badge key={biome} variant="secondary" className="text-xs">
              {biome}
              <X
                className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500"
                onClick={() =>
                  onBiomesChange(selectedBiomes.filter((b) => b !== biome))
                }
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// BiomeMultiSelector function removed - not used in current implementation

function TrainerArchitect() {
  // Use global state for project management
  const { state } = useAppState();
  const currentProject = state.currentProject;
  const { currentUser } = useUser();

  // New state for generated battle text
  const [battleText, setBattleText] = useState(null);
  const [isBattleTextLoading, setIsBattleTextLoading] = useState(false);

  const handleGenerateBattleText = async () => {
    setIsBattleTextLoading(true);
    try {
      const { name, trainer_class, biome, difficulty, theme } = currentTrainer;
      const prompt = `Generate Gen 3 styled trainer battle text for a Pokemon battle. Use the following context:
Trainer Name: ${name}
Trainer Class: ${trainer_class}
Biome: ${biome}
Difficulty: ${difficulty}
Battle Style: ${theme}

Format output as:
section0: # <intro>
  single.battle ${name} <battle_intro> <defeated>
{
*BATTLE INTRO TEXT*
}
{
*WAS DEFEATED TEXT*
}
  msgbox.autoclose <auto>
{
*OVERWORLD TEXT POST DEFEAT*
}
  end

Guidelines:
- Easier trainers should use basic, friendly language.
- Difficult trainers should use mature, competitive language.
- All text should match authentic Gen 3 NPC style.
Return only valid JSON with a 'section0' key containing the text blocks as above.`;

      const response = await quickQuery(prompt, { add_context_from_app: true });
      const { enforceGen3Schema } = await import("@/lib/enforceGen3Schema");
      setBattleText(enforceGen3Schema(response));
    } catch {
      setBattleText({ error: "Failed to generate battle text." });
    } finally {
      setIsBattleTextLoading(false);
    }
  };
  const [currentTrainer, setCurrentTrainer] = useState(defaultTrainerState);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pokedexScope, setPokedexScope] = useState("All");
  const [generationLogs, setGenerationLogs] = useState([]);
  const [showGenerationLogs, setShowGenerationLogs] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [savedTrainers, setSavedTrainers] = useState([]);
  const [changelogEntries, setChangelogEntries] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [activeTab, setActiveTab] = useState("architect");

  // Custom tab change handler to manage trainer selection state
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
  };
  const [selectedRolodexTrainer, setSelectedRolodexTrainer] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [pokemonModalOpen, setPokemonModalOpen] = useState(false);
  const [rawOutputOpen, setRawOutputOpen] = useState(false);
  const [rawOutput, setRawOutput] = useState("");
  const [_rawRetrying, setRawRetrying] = useState(false);
  const [preferProgrammatic] = useState(true); // Always use programmatic generation
  const [exportImportOpen, setExportImportOpen] = useState(false);
  // TODO: Re-enable when components are ready for production
  // const [performanceDashboardOpen, setPerformanceDashboardOpen] = useState(false);
  // const [uxControlPanelOpen, setUxControlPanelOpen] = useState(false);
  // Remove the automatic retry functionality to require explicit user interaction

  const { showAssistant, quickQuery, retryWithStrictPrompt } = useQuickAssist();

  // TODO: Re-enable performance monitoring when hooks are ready for production
  // const {
  //   cache: _cache,
  //   measurePerformance,
  //   performanceData: _performanceData,
  // } = usePerformance({
  //   enableAutoOptimization: true,
  //   performanceThreshold: 150,
  //   monitorMemory: true,
  // });

  // Temporary stub for measurePerformance
  const measurePerformance = (name, fn) => fn();

  // TODO: Re-enable advanced UX features when hooks are ready for production
  // const {
  //   registerShortcut,
  //   addUndoAction: _addUndoAction,
  //   undo,
  //   redo,
  //   showHelp: _showHelp,
  //   formatShortcut: _formatShortcut,
  // } = useAdvancedUX({
  //   enableShortcuts: true,
  //   enableUndoRedo: true,
  //   autoSave: true,
  // });

  // Temporary stubs for UX functions
  const registerShortcut = () => {
    /* No-op until UX system is enabled */
  };
  const undo = () => {
    /* No-op until UX system is enabled */
  };
  const redo = () => {
    /* No-op until UX system is enabled */
  };

  // Validation hooks for real-time feedback (temporarily disabled for build)
  // const trainerValidation = useTrainerValidation(currentTrainer, {
  //   debounceMs: 500,
  //   enableSuggestions: true,
  //   onValidationChange: (result) => {
  //     if (result && !result.valid) {
  //       trainerLogger.warn('Trainer validation issues detected:', result.issues);
  //     }
  //   }
  // });

  // const teamValidation = useTeamValidation(currentTrainer.party, {
  //   debounceMs: 700,
  //   enableSuggestions: true,
  //   onValidationChange: (result) => {
  //     if (result && result.suggestions?.length > 0) {
  //       trainerLogger.info('Team suggestions available:', result.suggestions.length);
  //     }
  //   }
  // });

  const addGenerationLog = (msg) => {
    const entry = `${new Date().toLocaleTimeString()} - ${msg}`;
    setGenerationLogs((prev) => [entry, ...prev].slice(0, 200));
    console.warn("Generation Log:", entry);
  };

  // Register keyboard shortcuts
  useEffect(() => {
    registerShortcut("GENERATE_TEAM", () => {
      if (!isGenerating) {
        generateAITeam();
      }
    });

    registerShortcut("NEW_TRAINER", () => {
      handleNewTrainer();
    });

    registerShortcut("RANDOMIZE_NAME", () => {
      handleRandomizeName();
    });

    registerShortcut("SAVE_TRAINER", () => {
      handleSaveTrainer();
    });

    registerShortcut("TOGGLE_ASSISTANT", () => {
      showAssistant();
    });

    // TODO: Re-enable when performance dashboard is ready
    // registerShortcut("TOGGLE_PERFORMANCE", () => {
    //   setPerformanceDashboardOpen((prev) => !prev);
    // });

    registerShortcut("TOGGLE_EXPORT", () => {
      setExportImportOpen((prev) => !prev);
    });

    registerShortcut("UNDO", () => {
      const action = undo();
      if (action) {
        addGenerationLog(`Undid: ${action.type}`);
      }
    });

    registerShortcut("REDO", () => {
      const action = redo();
      if (action) {
        addGenerationLog(`Redid: ${action.type}`);
      }
    });
  }, [registerShortcut, isGenerating]);

  // Robust parser to extract JSON-like content from noisy LLM responses
  const parseTrainerResponse = (raw) => {
    if (!raw) return null;
    if (typeof raw === "object") return raw;
    if (typeof raw !== "string") return null;

    // Quick JSON parse
    try {
      return JSON.parse(raw);
    } catch {
      // JSON parsing failed, trying other methods
    }

    // Try to extract JSON code fences
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch) {
      try {
        return JSON.parse(fenceMatch[1]);
      } catch {
        // Code fence JSON parsing failed
      }
    }

    // Try NDJSON: find first line that parses as JSON and has 'party'
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    for (const line of lines) {
      if (!line.startsWith("{") && !line.startsWith("[")) continue;
      try {
        const obj = JSON.parse(line);
        if (obj && (obj.party || obj.section0 || obj.scripts)) return obj;
      } catch {
        // ignore
      }
    }

    // Try to locate a JSON object around the 'party' token using brace matching
    const idx = raw.indexOf('"party"');
    if (idx !== -1) {
      // find opening brace before idx
      const start = raw.lastIndexOf("{", idx);
      if (start !== -1) {
        let depth = 0;
        for (let i = start; i < raw.length; i++) {
          if (raw[i] === "{") depth++;
          else if (raw[i] === "}") depth--;
          if (depth === 0) {
            const candidate = raw.slice(start, i + 1);
            try {
              const o = JSON.parse(candidate);
              if (o && o.party) return o;
            } catch {
              // Fallback parsing failed
            }
            break;
          }
        }
      }
    }

    // Fallback: try to parse any first JSON block in the text
    const genericMatch = raw.match(/(\{[\s\S]*?\})/);
    if (genericMatch) {
      try {
        return JSON.parse(genericMatch[1]);
      } catch {
        // Fallback parsing failed
      }
    }

    return null;
  };

  // Normalize external service response to expected trainer data format
  const normalizeAIResponse = (response) => {
    if (!response || !response.party || !Array.isArray(response.party)) {
      return null;
    }

    const normalizedParty = response.party.map((member) => {
      // Handle different property names that external services might use
      const species = member.species || member.name || member.pokemon || "";
      const level = member.level || 10;
      const role = member.role || member.type || "Balanced";

      return { species, level, role };
    });

    return { party: normalizedParty };
  };

  const handleRandomizeName = () => {
    const randomName = getRandomTrainerName();
    handleInputChange("name", randomName);
  };

  const loadSavedTrainers = useCallback(async () => {
    try {
      const projectId = currentProject?.id || "default_project";
      trainerLogger.debug("Loading trainers for project", { projectId });

      // Load trainers scoped to the current project (using project_id)
      const trainers = await Trainer.filter({ project_id: projectId });
      trainerLogger.debug("Loaded trainers for project", {
        projectId,
        count: trainers.length,
      });
      setSavedTrainers(trainers);
      setLoadError(null);
    } catch (_error) {
      trainerLogger.error("Error loading trainers", { error: _error.message });
      setLoadError(_error);
      // Keep existing trainers in state if load fails
    }
  }, [currentProject]);

  const loadChangelogEntries = useCallback(async () => {
    try {
      if (!currentProject?.id) {
        setChangelogEntries([]);
        return;
      }
      const entries = await ChangelogEntry.filter({
        project_id: currentProject.id,
      }); // project-scoped changelog
      trainerLogger.debug("Loaded changelog entries for project", {
        projectId: currentProject.id,
        count: entries.length,
      });
      setChangelogEntries(entries);
    } catch (_error) {
      trainerLogger.error("Error loading changelog", { error: _error.message });
      // Non-critical, don't show error for changelog
    }
  }, []);

  useEffect(() => {
    loadSavedTrainers();
    loadChangelogEntries();
  }, [loadSavedTrainers, loadChangelogEntries]);

  const handleInputChange = (field, value) => {
    setCurrentTrainer((prev) => ({ ...prev, [field]: value }));
    setSelectedRolodexTrainer(null);
  };

  const handleNewTrainer = () => {
    setCurrentTrainer(defaultTrainerState);
    setSelectedRolodexTrainer(null);
    setIsEditMode(false);
    setAiSuggestions([]);
    setActiveTab("architect");
  };

  const generateAITeam = async () => {
    // Only invoke external generation when user explicitly clicks the generate button
    setIsGenerating(true);
    setAiSuggestions([]);

    return measurePerformance("ai-team-generation", async () => {
      if (!navigator.onLine) {
        setAiSuggestions([
          {
            type: "error",
            title: "Offline Mode",
            content:
              "AI team generation requires an internet connection. You can still manually build teams.",
          },
        ]);
        setIsGenerating(false);
        return;
      }

      // Build scope ranges and prompt, then call LLM
      const scopeRanges = {
        Gen1: [1, 151],
        Gen2: [152, 251],
        Gen3: [252, 386],
        All: [1, 386],
      };
      const [minDex, maxDex] = scopeRanges[pokedexScope] || scopeRanges["Gen3"];

      addGenerationLog(
        `Starting AI generation (scope=${pokedexScope}, dex ${minDex}-${maxDex})`
      );

      if (preferProgrammatic || currentTrainer.level_max <= 30) {
        // Use programmatic for low-level trainers
        addGenerationLog(
          "Using programmatic generation for optimal speed and accuracy."
        );
        try {
          trainerLogger.group("Team Generation");
          trainerLogger.debug("Starting programmatic team generation", {
            pokedexScope,
            dexRange: `${minDex}-${maxDex}`,
            biomes: currentTrainer.biomes,
            levelRange: `${currentTrainer.level_min}-${currentTrainer.level_max}`,
            trainerClass: currentTrainer.trainer_class,
            difficulty: currentTrainer.difficulty,
            theme: currentTrainer.theme,
          });

          const fallback = generateTeamProgrammatically({
            pokedexScope,
            minDex,
            maxDex,
            biomes: currentTrainer.biomes,
            level_min: currentTrainer.level_min,
            level_max: currentTrainer.level_max,
            trainer_class: currentTrainer.trainer_class,
            difficulty: currentTrainer.difficulty,
            theme: currentTrainer.theme,
          });

          trainerLogger.debug("Generation result structure", {
            hasParty: Boolean(fallback?.party),
            partyIsArray: Array.isArray(fallback?.party),
            partyLength: fallback?.party?.length || 0,
          });

          if (
            fallback &&
            Array.isArray(fallback.party) &&
            fallback.party.length > 0
          ) {
            trainerLogger.info("Programmatic generation successful", {
              pokemonCount: fallback.party.length,
              teamPreview: fallback.party.map((p) => ({
                species: p.species,
                level: p.level,
                types: p.types,
              })),
            });
            trainerLogger.debug("State update preparation", {
              currentPartySize: currentTrainer.party?.length || 0,
            });

            // Ensure each Pokemon has the required structure for UI display
            const formattedParty = fallback.party.map((pokemon) => ({
              species: pokemon.species || pokemon.name,
              level: pokemon.level || 15,
              role: pokemon.role || "Balanced",
              types: pokemon.types || ["Normal"],
              dex_number: pokemon.dex_number || 1,
              moves: pokemon.moves || [],
            }));

            setCurrentTrainer((prev) => {
              const updated = { ...prev, party: formattedParty };
              trainerLogger.debug("State update completed", {
                previousPartySize: prev.party?.length || 0,
                newPartySize: updated.party.length,
                firstPokemon: updated.party[0]?.species,
              });
              trainerLogger.groupEnd();
              return updated;
            });
            await ChangelogEntry.create({
              project_id: currentProject?.id || "current_project",
              module: "Trainer Architect",
              action: "generated",
              item_name: `Programmatic Team for ${safeTrainerName}`,
              description: `Generated a ${fallback.party.length}-Pokemon team (programmatic).`,
              data_after: { party: fallback.party, config: currentTrainer },
              user_id: currentUser?.id || "default-user",
              user_name: currentUser?.name || "User",
              tags: [
                "programmatic",
                currentTrainer.theme,
                currentTrainer.biome,
              ],
            });
            loadChangelogEntries();
            setAiSuggestions([
              {
                type: "success",
                title: "Team Generated (Programmatic)",
                content: `Created a ${fallback.party.length}-Pokemon team without AI.`,
              },
            ]);
          } else {
            // Last resort: create a very basic team manually
            const basicTeam = {
              party: [
                {
                  species: "Rattata",
                  level: Math.max(5, currentTrainer.level_min || 5),
                  role: "Normal Type",
                  types: ["Normal"],
                  dex_number: 19,
                },
                {
                  species: "Pidgey",
                  level: Math.max(6, (currentTrainer.level_min || 5) + 1),
                  role: "Flying Type",
                  types: ["Normal", "Flying"],
                  dex_number: 16,
                },
              ],
            };

            setCurrentTrainer((updated) => ({
              ...updated,
              party: basicTeam.party,
            }));

            setAiSuggestions([
              {
                type: "warning",
                title: "Basic Team Generated",
                content:
                  "Generated a minimal fallback team. Generators may need reinitialization.",
              },
            ]);
          }
        } finally {
          setIsGenerating(false);
        }
        return;
      }

      const prompt = `You are an expert Pokemon trainer designer for Generation 3 (Gen III) games. ONLY USE Pokemon from the specified Pokedex scope: ${pokedexScope} (dex ${minDex}-${maxDex}). Do NOT invent or reference Pokemon outside of the specified scope. If a Pokemon name is used, it must be a canonical name within that range.

Reference Dataset Context:
You have access to the full Gen 3 Pokedex (386 entries) and comprehensive trainer archetypes from Ruby/Sapphire/Emerald. Use these as blueprints for authentic team compositions that respect game balance.

Trainer Configuration:
- Name: ${currentTrainer.name || "Trainer"}
- Class: ${currentTrainer.trainer_class.replace(/_/g, " ")}
- Biome: ${currentTrainer.biome}
- Battle Style: ${currentTrainer.theme}
- Level Range: ${currentTrainer.level_min}-${currentTrainer.level_max}
- Difficulty: ${currentTrainer.difficulty}

CRITICAL Evolution Rules:
- Kadabra evolves at 16, use Alakazam if levels 25+
- Machoke evolves at 28, use Machamp if levels 35+
- Graveler evolves at 25, use Golem if levels 32+
- Haunter evolves at 25, use Gengar if levels 32+
- Dragonair evolves at 55, only use Dragonite if levels 60+
- For levels 35+: prefer evolved forms
- For levels 45+: strongly prefer final evolutions

Team Size Guidelines (Based on Official Data):
- Levels 5-15: 1-2 Pokemon (Early routes)
- Levels 16-25: 2-3 Pokemon (Mid routes)
- Levels 26-35: 3-4 Pokemon (Gym leaders)
- Levels 36-45: 4-5 Pokemon (Elite trainers)
- Levels 46+: 5-6 Pokemon (Elite Four tier)

Return strict JSON with a top-level 'party' array. Each member must be an object with 'species' (exact canonical name), 'level' (number), and 'role' (brief string). Example: { "party": [{ "species": "Blaziken", "level": 36, "role": "Lead Sweeper" }] }. Do NOT include explanation text.`;

      try {
        addGenerationLog("Prompt constructed, calling InvokeLLM");
        const rawResponse = await InvokeLLM({
          prompt,
          task: "trainerArchitect",
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
                    role: { type: "string" },
                  },
                  required: ["species", "level", "role"],
                },
              },
            },
            required: ["party"],
          },
        });
        // Parse raw response (it may be noisy text, NDJSON, or JSON)
        const parsedResponse = parseTrainerResponse(rawResponse) || rawResponse;

        // Normalize the response format
        const normalizedResponse = normalizeAIResponse(parsedResponse);

        // Enforce Gen 3 schema on trainerArchitect output only
        const { enforceGen3Schema } = await import("@/lib/enforceGen3Schema");
        const cleanResponseCandidate = normalizedResponse
          ? enforceGen3Schema(normalizedResponse)
          : enforceGen3Schema(parsedResponse);

        // If enforceGen3Schema returned unhelpful object, attempt retry
        if (
          cleanResponseCandidate &&
          typeof cleanResponseCandidate === "object" &&
          !cleanResponseCandidate.party &&
          (cleanResponseCandidate.scripts || cleanResponseCandidate.convention)
        ) {
          addGenerationLog(
            "LLM returned a scripts/convention object (unexpected). Attempting one strict retry."
          );
          // Try one strict retry with a hardened instruction and optional allowlist for the All scope
          try {
            let allowlistSnippet = "";
            try {
              const inScope = Object.entries(pokemonData)
                .filter(
                  ([_name, p]) =>
                    p &&
                    typeof p.dex_number === "number" &&
                    p.dex_number >= minDex &&
                    p.dex_number <= maxDex
                )
                .map(([name]) => name);
              // biome-prioritized list first, then the rest; keep it compact
              const biomeFirst = [];
              const others = [];
              for (const name of inScope) {
                const det = getPokemonDetails(name);
                const likely = det?.likely_biomes || [];
                if (likely.includes(currentTrainer.biome))
                  biomeFirst.push(name);
                else others.push(name);
              }
              const compact = [...biomeFirst, ...others].slice(0, 380);
              if (compact.length > 0) {
                allowlistSnippet = `\nCanonicalNames (${pokedexScope} ${minDex}-${maxDex}, biome-prioritized ${
                  currentTrainer.biome
                }): ${compact.join(", ")}\n`;
              }
            } catch {
              // ignore allowlist build errors
            }

            const strictPrompt = `STRICT INSTRUCTION: Return ONLY valid JSON. The top-level object MUST contain a 'party' array. Each party member must be an object with 'species' (string), 'level' (number), and 'role' (string). Do NOT return scripts, conventions, or any other metadata. Use the previously provided context and respect Pokedex scope: ${pokedexScope} (dex ${minDex}-${maxDex}). ${allowlistSnippet} Example: { "party": [{ "species":"Blaziken","level":36,"role":"Lead Sweeper" }] }`;
            addGenerationLog("Calling InvokeLLM with strict retry prompt");
            const strictResp = await InvokeLLM({
              prompt: strictPrompt,
              task: "trainerArchitect.strict",
              add_context_from_app: true,
              response_json_schema: {
                type: "object",
                properties: { party: { type: "array" } },
                required: ["party"],
              },
            });
            const strictParsed = parseTrainerResponse(strictResp) || strictResp;
            const strictClean = enforceGen3Schema(strictParsed);
            if (
              strictClean &&
              strictClean.party &&
              Array.isArray(strictClean.party)
            ) {
              addGenerationLog("Strict retry succeeded and returned a party.");
              // proceed with strictClean as the cleanResponse
              // use strictClean as cleanResponse (assigned below)
              cleanResponse = strictClean;
            } else {
              addGenerationLog(
                "Strict retry did not return a valid party. Falling back to programmatic generator."
              );
              const fallback = generateTeamProgrammatically({
                pokedexScope,
                minDex,
                maxDex,
                biomes: currentTrainer.biomes,
                level_min: currentTrainer.level_min,
                level_max: currentTrainer.level_max,
                trainer_class: currentTrainer.trainer_class,
                difficulty: currentTrainer.difficulty,
                theme: currentTrainer.theme,
              });
              if (
                fallback &&
                Array.isArray(fallback.party) &&
                fallback.party.length > 0
              ) {
                cleanResponse = {
                  party: fallback.party.map((p) => ({
                    species: p.species,
                    level: p.level,
                    role: p.role,
                  })),
                };
              } else {
                setRawOutput(
                  typeof rawResponse === "string"
                    ? rawResponse
                    : JSON.stringify(rawResponse, null, 2)
                );
                setRawOutputOpen(true);
                throw new Error(
                  "AI returned non-party response and programmatic fallback also failed"
                );
              }
            }
          } catch (_retryErr) {
            console.error("Strict retry failed:", _retryErr);
            addGenerationLog(
              `Strict retry failed: ${(
                _retryErr?.message || String(_retryErr)
              ).slice(0, 200)}`
            );
            // Final fallback on retry error
            const fallback = generateTeamProgrammatically({
              pokedexScope,
              minDex,
              maxDex,
              biomes: currentTrainer.biomes,
              level_min: currentTrainer.level_min,
              level_max: currentTrainer.level_max,
              trainer_class: currentTrainer.trainer_class,
              difficulty: currentTrainer.difficulty,
              theme: currentTrainer.theme,
            });
            if (
              fallback &&
              Array.isArray(fallback.party) &&
              fallback.party.length > 0
            ) {
              cleanResponse = {
                party: fallback.party.map((p) => ({
                  species: p.species,
                  level: p.level,
                  role: p.role,
                })),
              };
            } else {
              setRawOutput(
                typeof rawResponse === "string"
                  ? rawResponse
                  : JSON.stringify(rawResponse, null, 2)
              );
              setRawOutputOpen(true);
              throw _retryErr;
            }
          }
        }

        let cleanResponse = cleanResponseCandidate;

        // Validate using AJV to ensure the external service output strictly matches expected schema
        try {
          const ajv = new Ajv({ coerceTypes: true, removeAdditional: true });
          const schema = {
            type: "object",
            properties: {
              party: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    species: { type: "string" },
                    level: { type: "number" },
                    role: { type: "string" },
                  },
                  required: ["species", "level", "role"],
                },
              },
            },
            required: ["party"],
          };
          const validate = ajv.compile(schema);
          const valid = validate(cleanResponse);
          if (!valid) {
            // Show raw output to the user for debugging via modal
            setRawOutput(
              typeof parsedResponse === "string"
                ? parsedResponse
                : JSON.stringify(parsedResponse, null, 2)
            );
            setRawOutputOpen(true);
            throw new Error("AI output schema validation failed");
          }
        } catch (_vErr) {
          console.error("Schema validation error:", _vErr);
          throw _vErr;
        }

        addGenerationLog("Received AI response, parsed and cleaned");

        if (!cleanResponse.party || !Array.isArray(cleanResponse.party)) {
          addGenerationLog(
            "AI response missing party array or party is not an array."
          );
          throw new Error(
            'Invalid response format from AI: "party" array missing or malformed.'
          );
        }

        // Enhanced validation with evolution checking
        const validatedParty = [];
        const errors = [];

        for (const member of cleanResponse.party) {
          try {
            // CRITICAL FIX: Validate member.species to prevent crash if external service returns non-string or empty species
            if (
              !member ||
              typeof member.species !== "string" ||
              !member.species.trim()
            ) {
              errors.push(
                `AI suggested an invalid or empty Pokemon species: '${member?.species}'. Skipping this entry.`
              );
              continue;
            }

            let validatedLevel = member.level;
            if (
              member.level < currentTrainer.level_min ||
              member.level > currentTrainer.level_max
            ) {
              validatedLevel = Math.max(
                currentTrainer.level_min,
                Math.min(currentTrainer.level_max, member.level)
              );
              errors.push(
                `Adjusted ${member.species} level from ${member.level} to ${validatedLevel}`
              );
            }

            let currentSpecies = member.species;
            let details = getPokemonDetails(currentSpecies);

            if (!details) {
              addGenerationLog(`Unknown Pokemon from AI: ${currentSpecies}`);
              // Try to substitute with an in-scope candidate
              const substitute = findReplacement(
                currentSpecies,
                minDex,
                maxDex,
                member.level,
                currentTrainer.biome
              );
              if (substitute) {
                addGenerationLog(
                  `Substituted ${currentSpecies} -> ${substitute.name}`
                );
                details = substitute;
                currentSpecies = substitute.name;
              } else {
                errors.push(`Unknown Pokemon: ${currentSpecies}. Skipping.`);
                continue;
              }
            }

            // Biome alignment warning
            // Biome alignment warning
            const likelyBiomes = details.likely_biomes || [];
            if (
              currentTrainer.biome &&
              !likelyBiomes.includes(currentTrainer.biome)
            ) {
              errors.push(
                `${details.name} is not commonly found in ${currentTrainer.biome}. Generated team may feel out-of-place.`
              );
            }

            // Enforce pokedex scope (substitute if out of range)
            if (details.dex_number < minDex || details.dex_number > maxDex) {
              addGenerationLog(
                `${details.name} (dex ${details.dex_number}) out of scope ${minDex}-${maxDex}. Attempting substitute.`
              );
              const substitute = findReplacement(
                details.name,
                minDex,
                maxDex,
                validatedLevel,
                currentTrainer.biome
              );
              if (substitute) {
                addGenerationLog(
                  `Substituted out-of-scope ${details.name} -> ${substitute.name}`
                );
                details = substitute;
                currentSpecies = substitute.name;
              } else {
                errors.push(
                  `Could not find in-scope substitute for ${details.name}.`
                );
              }
            }

            // Evolution integrity check
            const evolutionCheck = checkEvolutionIntegrity(
              currentSpecies,
              validatedLevel
            );
            if (
              evolutionCheck.shouldEvolve &&
              evolutionCheck.suggestedForm !== currentSpecies
            ) {
              errors.push(
                `${currentSpecies} at Lv.${validatedLevel} should be ${evolutionCheck.suggestedForm}. Correcting.`
              );
              const evolvedDetails = getPokemonDetails(
                evolutionCheck.suggestedForm
              );
              if (evolvedDetails) {
                details = evolvedDetails; // Replace details with the evolved form's details
                currentSpecies = evolvedDetails.name; // Update current species name
              } else {
                errors.push(
                  `Could not find details for suggested evolution: ${evolutionCheck.suggestedForm}. Keeping original.`
                );
              }
            }

            // Downscale if external service picked a form above natural evolve level for the range
            const down = downscaleSpeciesForLevel(
              currentSpecies,
              validatedLevel
            );
            if (down.changed && down.species !== currentSpecies) {
              const ds = getPokemonDetails(down.species);
              if (ds) {
                errors.push(
                  `Adjusted over-evolved ${currentSpecies} to ${ds.name} for level ${validatedLevel}.`
                );
                details = ds;
                currentSpecies = ds.name;
              }
            }

            // Get valid moveset for the level and updated species
            let moves = getValidMoveset(details.dex_number, validatedLevel);
            if (!moves || moves.length === 0) {
              moves = ["Tackle", "Growl", "Scratch", "Leer"]; // Fallback moves
              errors.push(
                `No valid moves for ${currentSpecies}, assigned basic moves.`
              );
            }

            // Create enriched Pokemon data
            const enrichedPokemon = {
              species: details.name,
              level: validatedLevel,
              role: member.role || "Balanced", // Default role if not provided by external service
              types: details.types,
              base_stats: details.base_stats,
              abilities: details.abilities,
              ability: details.abilities[0], // Default to first ability
              moves: moves.slice(0, 4), // Limit to 4 moves
              dex_number: details.dex_number,
              item: null, // Can be enhanced later
            };

            validatedParty.push(enrichedPokemon);
          } catch (_err) {
            console.error("Error processing Pokemon:", member, _err);
            errors.push(
              `Failed to process a Pokemon entry: ${
                _err.message
              }. Original data: ${JSON.stringify(member)}`
            );
          }
        }

        if (validatedParty.length === 0) {
          addGenerationLog(
            `No valid Pokemon after validation. Errors: ${JSON.stringify(
              errors.slice(0, 5)
            )}`
          );
          throw new Error(
            "No valid Pokemon generated after validation. Please try again."
          );
        }

        setCurrentTrainer((prev) => ({ ...prev, party: validatedParty }));

        await ChangelogEntry.create({
          project_id: currentProject?.id || "current_project",
          module: "Trainer Architect",
          action: "generated",
          item_name: `AI Team for ${safeTrainerName}`,
          description: `Generated a ${validatedParty.length}-Pokemon team with style: ${currentTrainer.theme}`,
          data_after: { party: validatedParty, config: currentTrainer },
          tags: ["ai", currentTrainer.theme, currentTrainer.biome],
        });
        loadChangelogEntries();

        const suggestions = [];
        if (validatedParty.length > 0) {
          suggestions.push({
            type: "success",
            title: "Team Generated",
            content: `Successfully created a ${validatedParty.length}-Pokemon team.`,
          });
        }

        if (errors.length > 0) {
          suggestions.push({
            type: "warning",
            title: "Evolution & Level Corrections",
            content: `The AI's output required ${errors.length} corrections for proper evolution stages, valid species, and levels. The team has been adjusted for game accuracy. Check details.`,
          });
        }

        setAiSuggestions(suggestions);
      } catch (_error) {
        console.error("Error generating AI team:", _error);
        addGenerationLog(
          `Generation failed: ${(_error?.message || String(_error)).slice(
            0,
            200
          )}`
        );

        let errorMessage = "Failed to generate team.";
        // This specifically checks for the rate limit error
        if (_error?.response?.status === 429) {
          errorMessage =
            "Too many requests sent to the AI service. Please wait a moment before trying again.";
        } else if (!navigator.onLine) {
          errorMessage =
            "Lost internet connection during generation. Please check your connection and try again.";
        } else if (_error.message.includes("Invalid response")) {
          errorMessage = "AI returned invalid data format. Please try again.";
        } else {
          errorMessage +=
            " The service may be temporarily unavailable or returned unexpected data.";
        }

        // Attempt programmatic fallback on any external service error
        try {
          addGenerationLog("Attempting programmatic fallback after AI error.");
          const fallback = generateTeamProgrammatically({
            pokedexScope,
            minDex,
            maxDex,
            biomes: currentTrainer.biomes,
            level_min: currentTrainer.level_min,
            level_max: currentTrainer.level_max,
            trainer_class: currentTrainer.trainer_class,
            difficulty: currentTrainer.difficulty,
            theme: currentTrainer.theme,
          });
          if (
            fallback &&
            Array.isArray(fallback.party) &&
            fallback.party.length > 0
          ) {
            // Ensure each Pokemon has the required structure for UI display
            const formattedParty = fallback.party.map((pokemon) => ({
              species: pokemon.species || pokemon.name,
              level: pokemon.level || 15,
              role: pokemon.role || "Balanced",
              types: pokemon.types || ["Normal"],
              dex_number: pokemon.dex_number || 1,
              moves: pokemon.moves || [],
            }));

            setCurrentTrainer((prev) => ({ ...prev, party: formattedParty }));
            await ChangelogEntry.create({
              project_id: currentProject?.id || "current_project",
              module: "Trainer Architect",
              action: "generated",
              item_name: `Programmatic Team for ${safeTrainerName}`,
              description: `Generated a ${fallback.party.length}-Pokemon team (programmatic) after AI error.`,
              data_after: { party: fallback.party, config: currentTrainer },
              tags: [
                "programmatic",
                currentTrainer.theme,
                currentTrainer.biome,
              ],
            });
            loadChangelogEntries();
            setAiSuggestions([
              {
                type: "success",
                title: "Team Generated (Programmatic)",
                content: `Created a ${fallback.party.length}-Pokemon team after AI error.`,
              },
            ]);
          } else {
            setAiSuggestions([
              {
                type: "error",
                title: "Generation Error",
                content: errorMessage,
              },
            ]);
          }
        } catch {
          setAiSuggestions([
            { type: "error", title: "Generation Error", content: errorMessage },
          ]);
        }
      }
      setIsGenerating(false);
    }); // Close measurePerformance wrapper
  };

  const handleSaveTrainer = async () => {
    try {
      trainerLogger.debug("Starting trainer save operation", {
        currentProject: currentProject?.id,
        trainerName: currentTrainer.name,
        isUpdate: Boolean(selectedRolodexTrainer && selectedRolodexTrainer.id),
      });

      // Sanitize party data for saving, removing bulky data like stats
      const partyToSave = currentTrainer.party.map((p) => ({
        species: p.species,
        level: p.level,
        item: p.item,
        ability: p.ability,
        role: p.role,
        moves: p.moves, // moves are simple strings now
        dex_number: p.dex_number,
      }));

      const trainerToSave = { ...currentTrainer, party: partyToSave };

      // Ensure we have a valid project ID - use fallback if needed
      let projectId = currentProject?.id;
      if (!projectId) {
        trainerLogger.warn(
          "No current project found, using default project ID"
        );
        projectId = "default_project";
      }

      trainerToSave.project_id = projectId;

      trainerLogger.debug("Trainer data prepared for save", {
        project_id: trainerToSave.project_id,
        partySize: partyToSave.length,
      });

      // Only update if explicitly in edit mode, otherwise always create new
      if (isEditMode && selectedRolodexTrainer && selectedRolodexTrainer.id) {
        // Ensure updates maintain the correct project_id
        await Trainer.update(selectedRolodexTrainer.id, {
          ...trainerToSave,
          project_id: trainerToSave.project_id,
        });
        trainerLogger.debug("Updated existing trainer", {
          id: selectedRolodexTrainer.id,
          name: trainerToSave.name,
        });
        await ChangelogEntry.create({
          project_id: projectId || "current_project",
          module: "Trainer Architect",
          action: "updated",
          item_name: trainerToSave.name,
          description: `Updated trainer '${trainerToSave.name}'`,
          data_before: selectedRolodexTrainer,
          data_after: trainerToSave,
        });
      } else {
        delete trainerToSave.id;
        const newTrainer = await Trainer.create(trainerToSave);
        trainerLogger.debug("New trainer created", {
          id: newTrainer.id,
          name: newTrainer.name,
          project_id: newTrainer.project_id,
        });
        await ChangelogEntry.create({
          project_id: currentProject?.id || "current_project",
          module: "Trainer Architect",
          action: "created",
          item_name: newTrainer.name,
          description: `Created new trainer '${newTrainer.name}'`,
          data_after: newTrainer,
        });
      }

      trainerLogger.debug("Reloading trainer data after save");
      loadSavedTrainers();
      loadChangelogEntries();
      handleNewTrainer();
      setActiveTab("rolodex");
    } catch (error) {
      trainerLogger.error("Failed to save trainer", { error: error.message });
      // You could add a user-facing error notification here
    }
  };

  const handleSelectRolodexTrainer = (trainer) => {
    // When loading from Rolodex, re-enrich the data
    const enrichedParty = (trainer.party || [])
      .map((member) => {
        // Ensure member.species is a string before calling getPokemonDetails
        if (
          !member ||
          typeof member.species !== "string" ||
          !member.species.trim()
        ) {
          console.warn(
            "Skipping invalid Pokemon entry from saved trainer:",
            member
          );
          return null;
        }
        const details = getPokemonDetails(member.species);
        if (!details) {
          console.warn(
            `Could not find details for saved Pokemon species: ${member.species}. Skipping.`
          );
          return null;
        }
        return { ...details, ...member };
      })
      .filter(Boolean); // This filters out any nulls resulting from invalid entries

    setSelectedRolodexTrainer(trainer);
    setIsEditMode(true);
    setCurrentTrainer({
      ...trainer,
      party: enrichedParty,
    });
    setAiSuggestions([]);
    setActiveTab("architect");
  };

  const handleDeleteTrainer = async (e, trainerId) => {
    e.stopPropagation();
    const trainerToDelete = savedTrainers.find((t) => t.id === trainerId);
    await Trainer.delete(trainerId);
    await ChangelogEntry.create({
      project_id: currentProject?.id || "current_project",
      module: "Trainer Architect",
      action: "deleted",
      item_name: trainerToDelete?.name || "Unknown Trainer",
      description: `Deleted trainer '${
        trainerToDelete?.name || "Unknown Trainer"
      }'`,
      data_before: trainerToDelete,
      tags: ["delete"],
    });
    loadSavedTrainers();
    loadChangelogEntries();
    if (selectedRolodexTrainer?.id === trainerId) {
      setSelectedRolodexTrainer(null);
      setCurrentTrainer(defaultTrainerState);
      setAiSuggestions([]);
    }
  };

  // Undo functionality for changelog entries
  const handleUndoChangelogEntry = async (entry) => {
    try {
      trainerLogger.debug("Attempting to undo changelog entry", {
        entryId: entry.id,
        action: entry.action,
        itemName: entry.item_name,
      });

      const projectId = currentProject?.id || "default_project";

      switch (entry.action) {
        case "created":
          // Undo create = delete the trainer
          if (entry.data_after?.id) {
            await Trainer.delete(entry.data_after.id);
            await ChangelogEntry.create({
              project_id: projectId,
              module: "Trainer Architect",
              action: "deleted",
              item_name: entry.item_name,
              description: `Undid creation of trainer '${entry.item_name}'`,
              data_before: entry.data_after,
              tags: ["undo", "auto-generated"],
            });
          }
          break;

        case "updated":
          // Undo update = restore to previous state
          if (entry.data_before?.id) {
            await Trainer.update(entry.data_before.id, entry.data_before);
            await ChangelogEntry.create({
              project_id: projectId,
              module: "Trainer Architect",
              action: "updated",
              item_name: entry.item_name,
              description: `Undid update to trainer '${entry.item_name}'`,
              data_before: entry.data_after,
              data_after: entry.data_before,
              tags: ["undo", "auto-generated"],
            });
          }
          break;

        case "deleted":
          // Undo delete = recreate the trainer
          if (entry.data_before) {
            const restoredData = { ...entry.data_before };
            delete restoredData.id; // Let the create method assign new ID
            const restoredTrainer = await Trainer.create(restoredData);
            await ChangelogEntry.create({
              project_id: projectId,
              module: "Trainer Architect",
              action: "created",
              item_name: entry.item_name,
              description: `Undid deletion of trainer '${entry.item_name}'`,
              data_after: restoredTrainer,
              tags: ["undo", "auto-generated"],
            });
          }
          break;

        default:
          trainerLogger.warn("Cannot undo action", { action: entry.action });
          return;
      }

      trainerLogger.debug("Successfully undid changelog entry");
      loadSavedTrainers();
      loadChangelogEntries();
    } catch (error) {
      trainerLogger.error("Failed to undo changelog entry", {
        error: error.message,
        entryId: entry.id,
      });
      // Could add user notification here
    }
  };

  const handlePokemonClick = (pokemon) => {
    setSelectedPokemon(pokemon);
    setPokemonModalOpen(true);
  };

  const safeCurrentTrainer = {
    ...currentTrainer,
    party: currentTrainer.party || [],
  };

  // Safeguard for currentTrainer.name
  const safeTrainerName = currentTrainer?.name || "new trainer";

  const retryLoad = () => {
    loadSavedTrainers();
    loadChangelogEntries();
  };

  const handleRetryStrict = async () => {
    if (!retryWithStrictPrompt) return;
    setRawRetrying(true);
    try {
      const strictResp = await retryWithStrictPrompt(rawOutput, {
        type: "object",
        properties: { party: { type: "array" } },
      });
      let parsed = strictResp;
      if (typeof strictResp === "string") {
        try {
          parsed = JSON.parse(strictResp);
        } catch (_e) {
          parsed = strictResp;
        }
      }
      if (
        parsed &&
        parsed.party &&
        Array.isArray(parsed.party) &&
        parsed.party.length > 0
      ) {
        setCurrentTrainer((prev) => ({ ...prev, party: parsed.party }));
        setRawOutput(JSON.stringify(parsed, null, 2));
        setRawOutputOpen(false);
      } else {
        setRawOutput(
          typeof strictResp === "string"
            ? strictResp
            : JSON.stringify(strictResp, null, 2)
        );
      }
    } catch (_err) {
      setRawOutput(`Retry failed: ${_err.message}`);
    } finally {
      setRawRetrying(false);
    }
  };

  return (
    <PageShell
      icon={Users}
      iconColor="blue"
      title="Trainer Architect"
      description="Elite team composition for Generation III with AI analysis"
      actions={
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
            onClick={() => setExportImportOpen(true)}
            variant="outline"
            className="border-green-500/50 text-green-400 hover:bg-green-500/10 h-10 rounded-xl"
          >
            <Save className="w-4 h-4 mr-2" />
            Export/Import
          </Button>
          {/* TODO: Re-enable Performance and UX controls when they're ready for production
          <Button
            onClick={() => setPerformanceDashboardOpen(true)}
            variant="outline"
            className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 h-10 rounded-xl"
          >
            <Zap className="w-4 h-4 mr-2" />
            Performance
          </Button>
          <Button
            onClick={() => setUxControlPanelOpen(true)}
            variant="outline"
            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 h-10 rounded-xl"
          >
            <Settings className="w-4 h-4 mr-2" />
            UX
          </Button>
          */}
          <Button
            onClick={handleNewTrainer}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-5 py-2.5 h-10 rounded-xl shadow-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Trainer
          </Button>
          <Button
            onClick={handleGenerateBattleText}
            disabled={isBattleTextLoading}
            className="bg-blue-400 text-white px-4 py-2 rounded-lg"
            title="Generate contextual battle dialogue and victory/defeat text using AI"
          >
            {isBattleTextLoading ? "Generating..." : "Generate Text"}
          </Button>
        </div>
      }
    >
      {battleText && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Generated Battle Text</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200">
              {JSON.stringify(battleText, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full h-auto"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="architect" className="flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            <span className="hidden sm:inline">Design Studio</span>
            <span className="sm:hidden">Design</span>
          </TabsTrigger>
          <TabsTrigger value="rolodex" className="flex items-center gap-2">
            <BookUser className="w-4 h-4" />
            <span className="hidden sm:inline">Rolodex</span>
            <span className="sm:hidden">Teams</span>
          </TabsTrigger>
          <TabsTrigger value="changelog" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Changelog</span>
            <span className="sm:hidden">History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="architect" className="space-y-8">
          <Card className="bg-muted/50 backdrop-blur-xl border rounded-2xl shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-blue-400 font-light flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Name
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Trainer name"
                      value={safeCurrentTrainer.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="bg-input border-border rounded-xl text-foreground placeholder:text-muted-foreground pr-10"
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
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Class
                  </label>
                  <Select
                    value={safeCurrentTrainer.trainer_class}
                    onValueChange={(v) => handleInputChange("trainer_class", v)}
                  >
                    <SelectTrigger className="bg-slate-100 dark:bg-black/50 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 rounded-xl">
                      {trainerClasses.map((c) => (
                        <SelectItem
                          key={c}
                          value={c}
                          className="text-slate-900 hover:bg-slate-200 dark:text-white dark:hover:bg-slate-800"
                        >
                          {gen3References.trainerClasses[c]?.name || "Unknown"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Min Level
                  </label>
                  <Input
                    type="number"
                    value={safeCurrentTrainer.level_min}
                    onChange={(e) =>
                      handleInputChange(
                        "level_min",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="bg-input border-border rounded-xl text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Max Level
                  </label>
                  <Input
                    type="number"
                    value={safeCurrentTrainer.level_max}
                    onChange={(e) =>
                      handleInputChange(
                        "level_max",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="bg-input border-border rounded-xl text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <CompactBiomeSelector
                    selectedBiomes={safeCurrentTrainer.biomes || []}
                    onBiomesChange={(biomes) =>
                      handleInputChange("biomes", biomes)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Difficulty
                  </label>
                  <Select
                    value={safeCurrentTrainer.difficulty}
                    onValueChange={(v) => handleInputChange("difficulty", v)}
                  >
                    <SelectTrigger className="bg-slate-100 dark:bg-black/50 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 rounded-xl">
                      {difficulties.map((d) => (
                        <SelectItem
                          key={d}
                          value={d}
                          className="text-slate-900 hover:bg-slate-200 dark:text-white dark:hover:bg-slate-800"
                        >
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Battle Style
                  </label>
                  <Select
                    value={safeCurrentTrainer.theme}
                    onValueChange={(v) => handleInputChange("theme", v)}
                  >
                    <SelectTrigger className="bg-slate-100 dark:bg-black/50 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 rounded-xl">
                      {themes.map((t) => (
                        <SelectItem
                          key={t}
                          value={t}
                          className="text-slate-900 hover:bg-slate-200 dark:text-white dark:hover:bg-slate-800"
                        >
                          {gen3References.themes[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Pokedex Scope
                  </label>
                  <Select
                    value={pokedexScope}
                    onValueChange={(v) => setPokedexScope(v)}
                  >
                    <SelectTrigger className="bg-slate-100 dark:bg-black/50 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 rounded-xl">
                      <SelectItem value="Gen1">Gen 1 (1-151)</SelectItem>
                      <SelectItem value="Gen2">Gen 2 (152-251)</SelectItem>
                      <SelectItem value="Gen3">Gen 3 (252-386)</SelectItem>
                      <SelectItem value="All">All (1-386)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Removed programmatic and AI checkboxes - defaulting to programmatic generation */}

              {/* Validation display temporarily disabled */}

              <AnimatePresence>
                <div className="max-h-60 overflow-y-auto pr-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`p-4 rounded-lg flex items-center space-x-3 text-sm mb-2 ${
                        suggestion.type === "error"
                          ? "bg-red-100 text-red-800 border-red-400 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500"
                          : suggestion.type === "warning"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-400 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500"
                          : "bg-green-100 text-green-800 border-green-400 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500"
                      }`}
                    >
                      {suggestion.type === "error" && (
                        <Trash2 className="w-5 h-5" />
                      )}
                      {suggestion.type === "warning" && (
                        <Eye className="w-5 h-5" />
                      )}
                      {suggestion.type === "success" && (
                        <Sparkles className="w-5 h-5" />
                      )}
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
                title="Generate a balanced team using AI with Gen 3 validation, stat optimization, and movepool analysis"
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
              <Card className="bg-muted/50 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl">
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
                  <div className="grid grid-cols-3 gap-4">
                    <AnimatePresence>
                      {Array.from({ length: 6 }).map((_, i) => {
                        const pokemon = safeCurrentTrainer.party[i];
                        return (
                          <PokemonCard
                            key={`party-slot-${i}`}
                            pokemon={pokemon}
                            compact={true}
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

              <Card className="bg-muted/50 backdrop-blur-xl border border-primary/20 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg text-cyan-400 font-light flex items-center gap-2">
                    <Wand2 className="w-5 h-5" />
                    Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Notes
                    </label>
                    <Textarea
                      placeholder="Trainer notes..."
                      value={safeCurrentTrainer.notes}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                      className="bg-input border-border rounded-xl text-foreground placeholder:text-muted-foreground resize-none h-24"
                    />
                  </div>
                  <Button
                    onClick={handleSaveTrainer}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-xl shadow-xl"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save to Rolodex
                  </Button>
                  {isEditMode && selectedRolodexTrainer && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 text-center font-medium">
                      ✏️ Editing: {selectedRolodexTrainer.name}
                    </p>
                  )}
                  {!isEditMode && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center font-medium">
                      ✨ Creating New Trainer
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-muted/50 backdrop-blur-xl border rounded-2xl">
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setShowGenerationLogs(!showGenerationLogs)}
                  title="Click to expand/collapse detailed generation activity logs"
                >
                  <CardTitle className="text-lg text-slate-600 dark:text-slate-300 font-light flex items-center justify-between hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Generation Logs
                      <span
                        className="text-sm text-slate-500 dark:text-slate-400"
                        title="Number of logged generation events"
                      >
                        ({generationLogs.length})
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          showGenerationLogs ? "rotate-180" : ""
                        }`}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setGenerationLogs([]);
                        }}
                        className="opacity-70 hover:opacity-100"
                      >
                        Clear
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                {showGenerationLogs && (
                  <CardContent>
                    <div className="max-h-48 overflow-y-auto text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/20 p-3 rounded-md">
                      {generationLogs.length === 0 ? (
                        <div className="text-slate-500">
                          No generation activity yet.
                        </div>
                      ) : (
                        <ul className="space-y-1">
                          {generationLogs.map((g, i) => (
                            <li key={i} className="break-words">
                              {g}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </CardContent>
                )}
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
                  <h3 className="text-2xl text-slate-900 dark:text-white font-light mb-2">
                    No trainers created yet
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Start designing in the Studio to build your roster
                  </p>
                  <Button
                    onClick={() => setActiveTab("architect")}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold px-6 py-3 rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Trainer
                  </Button>
                </div>
              )}

              {savedTrainers.map((trainer) => (
                <Card
                  key={trainer.id}
                  className={`bg-muted/50 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300 hover:border-primary/50 hover:scale-105 ${
                    selectedRolodexTrainer?.id === trainer.id
                      ? "ring-2 ring-blue-400 border-blue-400"
                      : ""
                  }`}
                  onClick={() => handleSelectRolodexTrainer(trainer)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-slate-900 dark:text-white font-medium">
                          {trainer.name || "Untitled Trainer"}
                        </CardTitle>
                        <p className="text-slate-600 dark:text-slate-400 font-light capitalize">
                          {gen3References.trainerClasses[trainer.trainer_class]
                            ?.name || "Trainer"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteTrainer(e, trainer.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
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
                      <h4 className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Team ({(trainer.party || []).length}/6):
                      </h4>
                      <div className="flex gap-1 flex-wrap">
                        {(trainer.party || []).length > 0 ? (
                          (trainer.party || []).slice(0, 6).map((p, i) => {
                            // Ensure p.species is a string before calling getPokemonDetails
                            const speciesName =
                              typeof p.species === "string"
                                ? p.species
                                : "Unknown";
                            const details = getPokemonDetails(speciesName);
                            const spriteUrl = details
                              ? getPokemonSprite(details.dex_number)
                              : "/sprites/000.png";

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
                                  style={{ imageRendering: "pixelated" }}
                                />
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-xs text-slate-700 dark:text-slate-500">
                            No Pokémon in party
                          </p>
                        )}
                      </div>
                    </div>

                    {trainer.notes && (
                      <p className="text-xs italic line-clamp-2 text-muted-foreground bg-muted/30 p-2 rounded-lg">
                        {trainer.notes}
                      </p>
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
              {changelogEntries.map((entry) => (
                <Card
                  key={entry.id}
                  className="bg-muted/50 border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    // Handle clickable navigation based on entry type
                    if (entry.item_type === "trainer" && entry.item_id) {
                      // Load the trainer for editing
                      const foundTrainer = savedTrainers.find(
                        (t) => t.id === entry.item_id
                      );
                      if (foundTrainer) {
                        setCurrentTrainer(foundTrainer);
                        setSelectedRolodexTrainer(foundTrainer);
                        setIsEditMode(true);
                        setActiveTab("architect"); // Switch to architect tab
                      }
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-start gap-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-medium ${
                              entry.action === "created"
                                ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400"
                                : entry.action === "updated"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400"
                                : entry.action === "deleted"
                                ? "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400"
                                : entry.action === "generated"
                                ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-400"
                                : "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400"
                            }`}
                          >
                            {String(entry.action || "").toUpperCase()}
                          </span>
                          <span className="text-slate-800 dark:text-slate-300 font-medium">
                            {entry.item_name}
                          </span>
                        </div>
                        {/* Module/Tool Attribution */}
                        {entry.module && (
                          <div className="flex items-center gap-2 text-xs">
                            <Badge 
                              variant="outline" 
                              className="cursor-pointer hover:bg-accent" 
                              onClick={(e) => {
                                e.stopPropagation();
                                // Navigate to the source tool
                                const toolRoutes = {
                                  'Trainer Architect': '/TrainerArchitect',
                                  'Flag Forge': '/FlagForge', 
                                  'Knowledge Hub': '/KnowledgeHub',
                                  'Narrative Engine': '/NarrativeEngine',
                                  'Script Sage': '/ScriptSage'
                                };
                                const route = toolRoutes[entry.module];
                                if (route && route !== '/TrainerArchitect') {
                                  // For other tools, navigate there
                                  window.location.href = route;
                                } else if (route === '/TrainerArchitect') {
                                  // Already in Trainer Architect, just show a tooltip
                                  console.log('Already in', entry.module);
                                }
                              }}
                              title={`Jump to ${entry.module}`}
                            >
                              📍 {entry.module}
                            </Badge>
                            {entry.project_id && entry.project_id !== 'current_project' && entry.project_id !== 'default_project' && (
                              <Badge variant="secondary" className="text-xs">
                                Project: {entry.project_id.slice(0, 8)}...
                              </Badge>
                            )}
                            {entry.user_name && entry.user_name !== 'User' && (
                              <Badge variant="outline" className="text-xs bg-emerald-50 dark:bg-emerald-500/10">
                                👤 {entry.user_name}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Tool-specific action buttons */}
                      <div className="flex items-center gap-1">
                        {/* Edit/View button for trainers */}
                        {entry.item_type === 'trainer' && entry.item_id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-1 h-6 w-6 text-slate-500 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              const foundTrainer = savedTrainers.find(t => t.id === entry.item_id);
                              if (foundTrainer) {
                                setCurrentTrainer(foundTrainer);
                                setSelectedRolodexTrainer(foundTrainer);
                                setIsEditMode(true);
                                setActiveTab('architect');
                              }
                            }}
                            title="Edit this trainer"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {/* Undo button - only show for undoable actions */}
                        {(entry.action === "created" ||
                          entry.action === "updated" ||
                          entry.action === "deleted") &&
                          entry.data_before !== undefined && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="p-1 h-6 w-6 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUndoChangelogEntry(entry);
                              }}
                              title="Undo this change"
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          )}
                          
                        {/* External navigation for non-Trainer Architect entries */}
                        {entry.module && entry.module !== 'Trainer Architect' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-1 h-6 w-6 text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              const toolRoutes = {
                                'Flag Forge': '/FlagForge',
                                'Knowledge Hub': '/KnowledgeHub', 
                                'Narrative Engine': '/NarrativeEngine',
                                'Script Sage': '/ScriptSage'
                              };
                              const route = toolRoutes[entry.module];
                              if (route) {
                                window.location.href = route;
                              }
                            }}
                            title={`Go to ${entry.module}`}
                          >
                            <Zap className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      
                      <span className="text-xs text-slate-700 dark:text-slate-500">
                        {new Date(entry.created_date).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {entry.description}
                  </p>
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map((tag, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-slate-700 border-slate-400 dark:text-slate-500 dark:border-slate-600"
                        >
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

      <PokemonDetailModal
        pokemon={selectedPokemon}
        isOpen={pokemonModalOpen}
        onClose={() => setPokemonModalOpen(false)}
      />
      <RawOutputModal
        open={rawOutputOpen}
        onClose={() => setRawOutputOpen(false)}
        output={rawOutput}
        onRetry={handleRetryStrict}
      />
      <ExportImportDialog
        open={exportImportOpen}
        onOpenChange={setExportImportOpen}
        trainers={savedTrainers}
        currentProject={currentProject}
        onImportComplete={(result) => {
          if (result.trainers && result.trainers.length > 0) {
            setSavedTrainers((prev) => [...prev, ...result.trainers]);
            addGenerationLog(
              `Imported ${result.trainers.length} trainers successfully`
            );
          }
        }}
      />
      {/* TODO: Re-enable when components are ready for production
      <PerformanceDashboard
        open={performanceDashboardOpen}
        onOpenChange={setPerformanceDashboardOpen}
      />
      <UXControlPanel
        open={uxControlPanelOpen}
        onOpenChange={setUxControlPanelOpen}
      />
      */}
    </PageShell>
  );
}
