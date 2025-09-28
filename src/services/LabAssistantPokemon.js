// Lab Assistant integration with Pokémon Service
import pokemonService from '@/services/PokemonService';

export function enhanceLabAssistantWithPokemon() {
  // Usage patterns for Lab Assistant

  const pokemonQueries = {
    // Basic information queries
    getBasicInfo: (pokemonName) => {
      const pokemon = pokemonService.getByName(pokemonName);
      if (!pokemon) return `I don't have information about ${pokemonName}.`;
      
      return `${pokemon.name} (#${pokemon.dex_number}) is a ${pokemon.types.join('/')} type Pokémon with base stats totaling ${Object.values(pokemon.baseStats).reduce((a, b) => a + b, 0)}. It can be found in ${pokemon.biomes?.join(', ') || 'unknown'} biomes.`;
    },

    // Stats comparison
    compareStats: (pokemon1, pokemon2) => {
      const comparison = pokemonService.compareStats(pokemon1, pokemon2);
      if (!comparison) return `I couldn't compare ${pokemon1} and ${pokemon2}.`;
      
      const wins = Object.values(comparison).reduce((acc, stat) => {
        if (stat.winner === pokemon1) acc.pokemon1++;
        else if (stat.winner === pokemon2) acc.pokemon2++;
        else acc.ties++;
        return acc;
      }, { pokemon1: 0, pokemon2: 0, ties: 0 });

      return `In a stat comparison: ${pokemon1} wins in ${wins.pokemon1} stats, ${pokemon2} wins in ${wins.pokemon2} stats, with ${wins.ties} ties.`;
    },

    // Evolution information
    getEvolutionInfo: (pokemonName) => {
      const chain = pokemonService.getEvolutionChain(pokemonName);
      if (chain.length <= 1) return `${pokemonName} doesn't evolve.`;
      
      const evolutionText = chain.map((stage, index) => {
        if (index === chain.length - 1) return stage.name;
        const nextStage = chain[index + 1];
        const method = stage.evolutionMethod === 'level' 
          ? `at level ${stage.evolutionLevel}` 
          : `by ${stage.evolutionMethod}`;
        return `${stage.name} evolves ${method}`;
      }).join(' → ');

      return `Evolution chain: ${evolutionText}`;
    },

    // Type effectiveness
    getTypeMatchup: (attackingType, defendingPokemon) => {
      const pokemon = pokemonService.getByName(defendingPokemon);
      if (!pokemon) return `I don't know about ${defendingPokemon}.`;
      
      const effectiveness = pokemonService.getTypeEffectiveness(pokemon.types, attackingType);
      let result = '';
      
      if (effectiveness === 0) result = 'has no effect on';
      else if (effectiveness === 0.25) result = 'is not very effective against';
      else if (effectiveness === 0.5) result = 'is not very effective against';
      else if (effectiveness === 1) result = 'is normally effective against';
      else if (effectiveness === 2) result = 'is super effective against';
      else if (effectiveness === 4) result = 'is extremely effective against';

      return `${attackingType} type moves ${result} ${pokemon.name} (${pokemon.types.join('/')}).`;
    },

    // Natural language processing
    processNaturalQuery: (question) => {
      return pokemonService.answerQuestion(question);
    },

    // Trainer team suggestions
    suggestTeamForBiome: (biome, level = 25) => {
      const suitable = pokemonService.getSuitableForTrainer({
        biome,
        levelMin: level - 5,
        levelMax: level + 5,
        excludeLegendaries: true
      });

      if (suitable.length === 0) return `No suitable Pokémon found for ${biome} at level ${level}.`;

      const suggestions = suitable.slice(0, 6).map(entry => {
        const pokemon = entry.recommended;
        return `${pokemon.name} (${pokemon.types.join('/')})`;
      });

      return `Recommended Pokémon for ${biome} at level ${level}: ${suggestions.join(', ')}`;
    }
  };

  // Make these available globally for testing
  if (typeof window !== 'undefined') {
    window.pokemonQueries = pokemonQueries;
    
    // Test commands
    console.log('[Lab Assistant] Pokemon Integration Ready!');
    console.log('Try these commands:');
    console.log('pokemonQueries.getBasicInfo("Pikachu")');
    console.log('pokemonQueries.compareStats("Charizard", "Blastoise")');
    console.log('pokemonQueries.getEvolutionInfo("Charmander")');
    console.log('pokemonQueries.getTypeMatchup("Electric", "Gyarados")');
    console.log('pokemonQueries.suggestTeamForBiome("Forest", 20)');
  }

  return pokemonQueries;
}

// Initialize integration
if (typeof window !== 'undefined') {
  setTimeout(() => {
    enhanceLabAssistantWithPokemon();
  }, 4000);
}