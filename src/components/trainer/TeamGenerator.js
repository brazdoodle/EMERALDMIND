import { getPokemonDetails, getValidMoveset } from '@/components/trainer/PokemonData';
import { pokemonData } from '@/components/trainer/TrainerDataset';
import { downscaleSpeciesForLevel, isLegendary, isPseudoLegendary, isStarterFinal, earlyCommonBonus, levelBandFromRange } from '@/components/trainer/evolutionRules';
import pokemonService from '@/services/PokemonService';
import teamCoverageAnalyzer from '@/services/TeamCoverageAnalyzer';
import { getPokemonSprite } from '@/data/completePokedex';

const teamSizeFromLevels = (minLevel, maxLevel) => {
  const avg = (Number(minLevel) + Number(maxLevel)) / 2 || 5;
  if (avg <= 15) return 2;
  if (avg <= 25) return 3;
  if (avg <= 35) return 4;
  if (avg <= 45) return 5;
  return 6;
};

const preferredTypeBuckets = (theme) => {
  const t = (theme || 'Balanced').toLowerCase();
  if (t.includes('balanced')) return [];
  if (t.includes('offense') || t.includes('aggressive')) return ['fire','fighting','electric','dragon'];
  if (t.includes('defense') || t.includes('stall')) return ['rock','steel','water','grass'];
  if (t.includes('trick') || t.includes('control')) return ['psychic','ghost','dark','poison'];
  return [];
};

const roleFromStats = (base) => {
  const a = base.attack || 0;
  const sa = base.sp_attack || 0;
  const d = base.defense || 0;
  const sd = base.sp_defense || 0;
  const spd = base.speed || 0;
  const bulk = d + sd;
  const offense = Math.max(a, sa);
  if (spd >= 90 && offense >= 95) return a >= sa ? 'Physical Sweeper' : 'Special Sweeper';
  if (bulk >= 180 && offense < 100) return 'Tank';
  if (bulk >= 160 && spd < 70) return 'Wall';
  if (offense >= 110) return a >= sa ? 'Breaker' : 'Special Breaker';
  return 'Balanced';
};

export function generateTeamProgrammatically({ pokedexScope = 'Gen3', minDex = 252, maxDex = 386, biome = 'Grassland', level_min = 10, level_max = 15, trainer_class = 'youngster', difficulty = 'Auto', theme = 'Balanced' }) {
  const teamSize = teamSizeFromLevels(level_min, level_max);
  const prefTypes = preferredTypeBuckets(theme);
  const presentTypes = new Set();
  const classBias = classBiasForTrainer(trainer_class);
  const band = levelBandFromRange(level_min, level_max);

  // Coverage groups: ensure team can hit these effectively by type presence
  const coverageGroups = [
    { vs: 'Water', needs: ['Electric','Grass'] },
    { vs: 'Electric', needs: ['Ground'] },
    { vs: 'Grass', needs: ['Fire','Ice','Bug','Flying','Poison'] },
    { vs: 'Rock', needs: ['Water','Grass','Fighting','Ground','Steel'] },
    { vs: 'Ground', needs: ['Water','Grass','Ice'] },
    { vs: 'Fighting', needs: ['Flying','Psychic'] },
  ];
  const unmet = new Set(coverageGroups.map(g => g.vs));
  const updateUnmet = () => {
    const allTypes = Array.from(presentTypes);
    for (const g of coverageGroups) {
      if (g.needs.some(t => allTypes.includes(t))) unmet.delete(g.vs);
    }
  };

  const candidates = [];
  for (const [key, p] of Object.entries(pokemonData)) {
    if (!p || typeof p.dex_number !== 'number') continue;
    if (p.dex_number < minDex || p.dex_number > maxDex) continue;
  const details = getPokemonDetails(key);
    if (!details) continue;
    const types = details.types || [];
    const likely = details.likely_biomes || [];
    let score = 0;
    if (likely.includes(biome)) score += 5;
    if (prefTypes.some(t => types.map(tt => String(tt).toLowerCase()).includes(t))) score += 3;
    const bst = Object.values(details.base_stats || {}).reduce((s, v) => s + (v || 0), 0);
    
    // Enhanced difficulty-based BST scoring
    if (difficulty === 'Easy') {
      // Easy: Prefer low BST (200-450), penalize high BST
      if (bst <= 350) score += 8;
      else if (bst <= 450) score += 4;
      else if (bst <= 520) score -= 5;
      else score -= 15;
    } else if (difficulty === 'Medium') {
      // Medium: Balanced BST (400-520)
      if (bst >= 400 && bst <= 520) score += 5;
      else if (bst < 350 || bst > 580) score -= 8;
    } else if (difficulty === 'Hard') {
      // Hard: Higher BST (480-580), avoid weak Pokémon
      if (bst >= 480 && bst <= 580) score += 8;
      else if (bst >= 520) score += 5;
      else if (bst < 400) score -= 10;
    } else if (difficulty === 'Expert') {
      // Expert: Elite BST (520+), strongly favor powerhouses
      if (bst >= 600) score += 15;
      else if (bst >= 520) score += 10;
      else if (bst >= 480) score += 2;
      else score -= 20;
    } else {
      // Auto: Original logic
      score += Math.min(10, Math.floor((bst - 400) / 20));
    }
    // Class bias
    if (classBias.types.some(t => (types || []).includes(t))) score += 4;
    if (classBias.preferRoles.length > 0) {
      const r = roleFromStats(details.base_stats || {});
      if (classBias.preferRoles.some(pr => matchRole(r, pr))) score += 3;
    }
    // Early-game weighting: penalize legendaries, pseudo, and starter finals; boost common early-route mons
    if (band === 'early') {
      if (isLegendary(details.name)) score -= 100;
      if (isPseudoLegendary(details.name)) score -= 25;
      if (isStarterFinal(details.name)) score -= 20;
      score += earlyCommonBonus(details.name);
      // Penalize stage-3 or high-stage at low levels implicitly via BST
    } else if (band === 'mid') {
      if (isLegendary(details.name)) score -= 80;
      if (isPseudoLegendary(details.name)) score -= 10;
      if (isStarterFinal(details.name)) score -= 8;
    } else {
      // late: still avoid overuse of legendaries by non-bosses
      if (isLegendary(details.name)) score -= 40;
    }
    // Coverage need bias: bonus if candidate types satisfy unmet coverage
    const helpsCoverage = coverageGroups.some(g => unmet.has(g.vs) && (types || []).some(tp => g.needs.includes(tp)));
    if (helpsCoverage) score += 3;
    const role = roleFromStats(details.base_stats || {});
    const primaryType = (details.types || [])[0];
    candidates.push({ details, score, role, primaryType });
  }

  console.log(`TeamGenerator: Found ${candidates.length} candidates for biome=${biome}, levels=${level_min}-${level_max}, difficulty=${difficulty}`);
  if (candidates.length === 0) {
    console.warn('No candidates found! Checking data:', { 
      pokemonDataKeys: Object.keys(pokemonData).length,
      minDex, maxDex, biome,
      sampleBiomes: candidates.slice(0, 3).map(c => c.details.likely_biomes)
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  const chosen = [];
  const usedSpecies = new Set();
  const usedTypes = new Set();

  // Build desired role plan based on theme and difficulty
  const want = [];
  const addRole = (r) => { if (want.length < teamSize) want.push(r); };
  const themeL = (theme || '').toLowerCase();
  if (themeL.includes('offense') || themeL.includes('aggress')) {
    addRole('Sweeper'); addRole('Sweeper'); addRole('Breaker'); addRole('Balanced'); addRole('Tank'); addRole('Breaker');
  } else if (themeL.includes('defense') || themeL.includes('stall')) {
    addRole('Wall'); addRole('Tank'); addRole('Balanced'); addRole('Breaker'); addRole('Balanced'); addRole('Sweeper');
  } else if (themeL.includes('trick') || themeL.includes('control')) {
    addRole('Wall'); addRole('Balanced'); addRole('Breaker'); addRole('Sweeper'); addRole('Balanced'); addRole('Tank');
  } else {
    addRole('Sweeper'); addRole('Breaker'); addRole('Wall'); addRole('Balanced'); addRole('Balanced'); addRole('Tank');
  }
  while (want.length > teamSize) want.pop();

  const matchesRole = (cand, target) => {
    if (!target) return true;
    if (target === 'Sweeper') return (cand.role === 'Physical Sweeper' || cand.role === 'Special Sweeper');
    if (target === 'Breaker') return (cand.role === 'Breaker' || cand.role === 'Special Breaker');
    return cand.role === target;
  };

  const pickCandidate = (targetRole) => {
    let best = null;
    let bestScore = -Infinity;
    for (const c of candidates) {
      if (usedSpecies.has(c.details.name)) continue;
      if (!matchesRole(c, targetRole)) continue;
      let s = c.score;
      if (c.primaryType && usedTypes.has(c.primaryType)) s -= 2; // type diversity bias
      // additional coverage bias at selection time
      const tps = c.details.types || [];
      const helps = coverageGroups.some(g => unmet.has(g.vs) && tps.some(tp => g.needs.includes(tp)));
      if (helps) s += 2;
      if (s > bestScore) { bestScore = s; best = c; }
    }
    if (!best) {
      for (const c of candidates) {
        if (usedSpecies.has(c.details.name)) continue;
        let s = c.score;
        if (c.primaryType && usedTypes.has(c.primaryType)) s -= 1;
        if (s > bestScore) { bestScore = s; best = c; }
      }
    }
    if (best) {
      usedSpecies.add(best.details.name);
      if (best.primaryType) usedTypes.add(best.primaryType);
      chosen.push(best.details);
      (best.details.types || []).forEach(t => presentTypes.add(t));
      updateUnmet();
    }
  };

  for (const r of want) {
    if (chosen.length >= teamSize) break;
    pickCandidate(r);
  }
  while (chosen.length < teamSize) {
    pickCandidate(null);
    if (chosen.length >= teamSize) break;
  }

  const party = [];
  const levelSpan = Math.max(0, level_max - level_min);
  const ensureStabAndStatus = (det, moves, needStatus) => {
    const typeToStab = {
      Fire: ['Flamethrower','Ember'], Water: ['Surf','Water Gun'], Grass: ['Razor Leaf','Leaf Blade'], Electric: ['Thunderbolt','Spark'], Ice: ['Ice Beam','Icy Wind'], Fighting: ['Brick Break','Double Kick'], Poison: ['Sludge Bomb','Poison Sting'], Ground: ['Earthquake','Magnitude'], Flying: ['Aerial Ace','Wing Attack'], Psychic: ['Psychic','Psybeam'], Bug: ['Silver Wind','Fury Cutter'], Rock: ['Rock Slide','Rock Throw'], Ghost: ['Shadow Ball','Night Shade'], Dragon: ['Dragon Claw','Dragon Breath'], Dark: ['Crunch','Bite'], Steel: ['Steel Wing','Metal Claw'], Normal: ['Return','Headbutt']
    };
    const statusByType = { Electric: 'Thunder Wave', Ghost: 'Will-O-Wisp', Fire: 'Will-O-Wisp', Grass: 'Stun Spore', Poison: 'Toxic', Water: 'Toxic', Rock: 'Sandstorm', Ice: 'Hail' };
    const hasStab = (det.types || []).some(t => moves.some(m => typeToStab[t]?.includes(m)));
    if (!hasStab) {
      for (const t of det.types || []) {
        const cands = typeToStab[t];
        if (cands && cands.length) { moves.unshift(cands[0]); break; }
      }
    }
    if (needStatus) {
      for (const t of det.types || []) {
        const status = statusByType[t];
        if (status && !moves.includes(status)) { moves.push(status); break; }
      }
    }
    return moves.slice(0, 4);
  };

  const needsStatus = ['Hard','Expert','Master'].includes(difficulty) || /defen|stall/i.test(theme || '');
  const defenseTheme = /defen|stall/i.test(theme || '');

  for (const det0 of chosen) {
    let det = det0;
    const base = det.base_stats || {};
    let level = level_min + Math.floor((levelSpan * Math.random()));
    level = Math.max(level_min, Math.min(level_max, level));
    const role = roleFromStats(base);
    let moves = getValidMoveset(det.dex_number, level) || [];
    
    // Evolution integrity: ONLY downscale if level is below evolution threshold
    // This prevents over-evolved Pokémon like level 12 Wailords
    const down = downscaleSpeciesForLevel(det.name, level);
    if (down.changed && down.species !== det.name) {
      const ds = getPokemonDetails(down.species);
      if (ds) {
        det = ds;
        console.log(`Downscaled ${det0.name} to ${det.name} for level ${level}`);
      }
    }
    
    // REMOVED: evolutionIntegrity call that was causing over-evolution
    // The downscaling above is sufficient for proper level constraints
    // STAB and status
    moves = ensureStabAndStatus(det, moves, needsStatus);
    const entry = {
      species: det.name,
      level,
      role,
      types: det.types,
      base_stats: det.base_stats,
      abilities: det.abilities,
      ability: (det.abilities || [])[0] || null,
      moves: moves.slice(0, 4),
      dex_number: det.dex_number,
      item: null
    };
    party.push(entry);
  }

  console.log(`TeamGenerator: Returning party with ${party.length} members`);
  return { party };
}

function classBiasForTrainer(trainerClass) {
  const c = (trainerClass || '').toLowerCase();
  if (c.includes('black_belt') || c.includes('black belt') || c.includes('expert')) return { types: ['Fighting','Rock','Ground'], preferRoles: ['Breaker','Physical Sweeper','Tank'] };
  if (c.includes('ace') || c.includes('cooltrainer')) return { types: ['Electric','Dragon','Psychic','Water','Fire','Grass'], preferRoles: ['Balanced','Special Sweeper','Physical Sweeper'] };
  if (c.includes('hiker')) return { types: ['Rock','Ground','Steel'], preferRoles: ['Wall','Tank'] };
  if (c.includes('fisher')) return { types: ['Water'], preferRoles: ['Balanced','Wall'] };
  if (c.includes('hex') || c.includes('psychic')) return { types: ['Ghost','Psychic','Dark'], preferRoles: ['Special Sweeper','Control','Wall'] };
  if (c.includes('bug') || c.includes('catcher')) return { types: ['Bug','Grass','Poison'], preferRoles: ['Balanced','Sweeper'] };
  return { types: [], preferRoles: [] };
}

function matchRole(actual, desired) {
  if (!desired) return true;
  if (desired === 'Sweeper') return /Sweeper/.test(actual);
  return actual === desired;
}

function evolutionIntegrity(species, level) {
  let shouldEvolve = false;
  let suggestedForm = species;
  const s = (species || '').toLowerCase();
  const tradeEvos = {
    'kadabra': { evo: 'Alakazam', min: 25 },
    'machoke': { evo: 'Machamp', min: 35 },
    'graveler': { evo: 'Golem', min: 32 },
    'haunter': { evo: 'Gengar', min: 32 }
  };
  if (tradeEvos[s] && level >= tradeEvos[s].min) { shouldEvolve = true; suggestedForm = tradeEvos[s].evo; }
  if (s === 'dragonair' && level >= 60) { shouldEvolve = true; suggestedForm = 'Dragonite'; }
  if (s === 'dragonite' && level < 60) { shouldEvolve = true; suggestedForm = 'Dragonair'; }
  if (level >= 35) {
    if (s === 'golbat') { shouldEvolve = true; suggestedForm = 'Crobat'; }
    if (s === 'pineco') { shouldEvolve = true; suggestedForm = 'Forretress'; }
  }
  return { shouldEvolve, suggestedForm };
}
