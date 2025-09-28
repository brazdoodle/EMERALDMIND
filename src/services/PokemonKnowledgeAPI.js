/**
 * Pokemon Knowledge API for Lab Assistant
 * Optimized for natural language queries and intelligent responses
 */

import { PokemonQueryService } from '../data/pokemonQueryService.js';
import { completePokedex } from '../data/completePokedex.js';

class PokemonKnowledgeAPI {
  constructor() {
    this.queryService = new PokemonQueryService(completePokedex);
    this.responseCache = new Map();
    this.maxCacheSize = 100;
  }

  /**
   * Main query interface for Lab Assistant
   * Handles natural language questions about Pokemon
   */
  async answerQuestion(question) {
    const questionKey = question.toLowerCase().trim();
    
    // Check cache first
    if (this.responseCache.has(questionKey)) {
      return this.responseCache.get(questionKey);
    }

    const response = this.processQuestion(question);
    
    // Cache the response
    this.cacheResponse(questionKey, response);
    
    return response;
  }

  /**
   * Process different types of Pokemon questions
   */
  processQuestion(question) {
    const lowerQuestion = question.toLowerCase();
    
    try {
      // Pokemon lookup by name
      if (this.isNameQuery(lowerQuestion)) {
        return this.handleNameQuery(question);
      }
      
      // Type-based queries
      if (this.isTypeQuery(lowerQuestion)) {
        return this.handleTypeQuery(question);
      }
      
      // Generation queries
      if (this.isGenerationQuery(lowerQuestion)) {
        return this.handleGenerationQuery(question);
      }
      
      // Evolution queries
      if (this.isEvolutionQuery(lowerQuestion)) {
        return this.handleEvolutionQuery(question);
      }
      
      // Stats and comparison queries
      if (this.isStatsQuery(lowerQuestion)) {
        return this.handleStatsQuery(question);
      }
      
      // Biome/habitat queries
      if (this.isBiomeQuery(lowerQuestion)) {
        return this.handleBiomeQuery(question);
      }
      
      // Legendary queries
      if (this.isLegendaryQuery(lowerQuestion)) {
        return this.handleLegendaryQuery(question);
      }
      
      // General search fallback
      return this.handleGeneralSearch(question);
      
    } catch (_error) {
      return {
        success: false,
        error: 'Unable to process Pokemon query',
        details: error.message
      };
    }
  }

  /**
   * Query type detection methods
   */
  isNameQuery(question) {
    return /what is|tell me about|info.*about|describe|stats.*for/i.test(question) &&
           !/type|evolution|generation|biome|legendary/i.test(question);
  }

  isTypeQuery(question) {
    return /type|fire|water|grass|electric|psychic|fighting|poison|ground|flying|bug|rock|ghost|dragon|dark|steel|fairy|normal|ice/i.test(question);
  }

  isGenerationQuery(question) {
    return /generation|gen\s*[123]|gen\s*1-[23]|kanto|johto|hoenn/i.test(question);
  }

  isEvolutionQuery(question) {
    return /evolve|evolution|evolves into|evolves from|evolution line|evolution chain/i.test(question);
  }

  isStatsQuery(question) {
    return /stats|attack|defense|speed|hp|health|base stat|strongest|weakest|compare/i.test(question);
  }

  isBiomeQuery(question) {
    return /where.*find|habitat|biome|location|found in|lives in|forest|desert|ocean|mountain|cave|grassland|urban/i.test(question);
  }

  isLegendaryQuery(question) {
    return /legendary|mythical|rare|special|unique/i.test(question);
  }

  /**
   * Query handlers
   */
  handleNameQuery(question) {
    const pokemonNames = this.extractPokemonNames(question);
    
    if (pokemonNames.length === 0) {
      return {
        success: false,
        message: "I couldn't identify a specific Pokemon name in your question."
      };
    }

    const results = pokemonNames.map(name => {
      const pokemon = this.queryService.getPokemonByName(name);
      if (pokemon) {
        return this.formatPokemonInfo(pokemon);
      }
      return null;
    }).filter(result => result !== null);

    if (results.length === 0) {
      return {
        success: false,
        message: `I couldn't find information about ${pokemonNames.join(', ')} in my Pokemon database.`
      };
    }

    return {
      success: true,
      type: 'pokemon_info',
      results: results
    };
  }

  handleTypeQuery(question) {
    const types = this.extractTypes(question);
    
    if (types.length === 0) {
      return {
        success: false,
        message: "I couldn't identify a specific Pokemon type in your question."
      };
    }

    const results = types.map(type => {
      // Get all Pokemon of this type from the query service
      const pokemonOfType = [];
      Object.values(completePokedex).forEach(pokemon => {
        if (pokemon.types && pokemon.types.includes(type)) {
          pokemonOfType.push(pokemon);
        }
      });

      return {
        type: type,
        count: pokemonOfType.length,
        examples: pokemonOfType.slice(0, 5).map(p => ({
          name: p.name,
          dex_number: p.dex_number,
          types: p.types
        }))
      };
    });

    return {
      success: true,
      type: 'type_query',
      results: results
    };
  }

  handleGenerationQuery(question) {
    const generation = this.extractGeneration(question);
    
    if (!generation) {
      return {
        success: false,
        message: "I couldn't identify a specific generation in your question."
      };
    }

    const genPokemon = this.queryService.getPokemonByGeneration(generation);
    const randomSample = this.getRandomSample(genPokemon, 8);

    return {
      success: true,
      type: 'generation_info',
      generation: generation,
      total_count: genPokemon.length,
      examples: randomSample.map(dexNum => {
        const p = this.queryService.getPokemonData(dexNum);
        return {
          name: p.name,
          dex_number: p.dex_number,
          types: p.types
        };
      })
    };
  }

  handleEvolutionQuery(question) {
    const pokemonNames = this.extractPokemonNames(question);
    
    if (pokemonNames.length === 0) {
      return {
        success: false,
        message: "Please specify a Pokemon name for evolution information."
      };
    }

    const results = pokemonNames.map(name => {
      const pokemon = this.queryService.getPokemonByName(name);
      if (pokemon) {
        return this.getEvolutionInfo(pokemon);
      }
      return null;
    }).filter(result => result !== null);

    return {
      success: true,
      type: 'evolution_info',
      results: results
    };
  }

  handleBiomeQuery(question) {
    const biomes = this.extractBiomes(question);
    
    if (biomes.length === 0) {
      return {
        success: false,
        message: "I couldn't identify a specific biome or location in your question."
      };
    }

    const results = biomes.map(biome => {
      const biomePokemon = Array.from(this.queryService.BIOME_INDEX.get(biome) || [])
        .slice(0, 10)
        .map(dexNum => this.queryService.getPokemonData(dexNum))
        .filter(p => p);

      return {
        biome: biome,
        count: this.queryService.BIOME_INDEX.get(biome)?.size || 0,
        examples: biomePokemon.slice(0, 6).map(p => ({
          name: p.name,
          dex_number: p.dex_number,
          types: p.types
        }))
      };
    });

    return {
      success: true,
      type: 'biome_info',
      results: results
    };
  }

  handleLegendaryQuery(question) {
    const legendaryPokemon = Object.values(completePokedex)
      .filter(p => p.legendary)
      .sort((a, b) => a.dex_number - b.dex_number);

    return {
      success: true,
      type: 'legendary_info',
      total_count: legendaryPokemon.length,
      legendaries: legendaryPokemon.map(p => ({
        name: p.name,
        dex_number: p.dex_number,
        types: p.types,
        generation: p.dex_number <= 151 ? 1 : p.dex_number <= 251 ? 2 : 3
      }))
    };
  }

  handleGeneralSearch(question) {
    // Extract potential Pokemon names and perform fuzzy search
    const searchResults = this.queryService.queryPokemon(question);
    
    const allResults = [
      ...searchResults.exact,
      ...searchResults.partial.slice(0, 5),
      ...searchResults.related.slice(0, 3)
    ];

    if (allResults.length === 0) {
      return {
        success: false,
        message: "I couldn't find any Pokemon matching your query. Try asking about specific Pokemon names, types, or generations."
      };
    }

    return {
      success: true,
      type: 'general_search',
      results: allResults.map(p => this.formatPokemonInfo(p))
    };
  }

  /**
   * Helper methods
   */
  formatPokemonInfo(pokemon) {
    return {
      name: pokemon.name,
      dex_number: pokemon.dex_number,
      types: pokemon.types,
      generation: pokemon.dex_number <= 151 ? 1 : pokemon.dex_number <= 251 ? 2 : 3,
      legendary: pokemon.legendary,
      biomes: pokemon.biomes,
      base_stats: pokemon.baseStats,
      abilities: pokemon.abilities,
      evolution_info: this.getEvolutionInfo(pokemon)
    };
  }

  getEvolutionInfo(pokemon) {
    if (!pokemon) return { stage: 1, can_evolve: false };
    
    const evo = pokemon.evolutionLine;
    if (!evo) return { stage: 1, can_evolve: false };

    return {
      stage: evo.stage || 1,
      can_evolve: !!evo.evolveTo,
      evolves_to: evo.evolveTo || null,
      evolution_level: evo.evolveLevel || null
    };
  }

  extractPokemonNames(question) {
    const words = question.split(/\s+/);
    const pokemonNames = [];
    
    // Simple name extraction - could be enhanced with NLP
    for (const pokemon of Object.values(completePokedex)) {
      if (question.toLowerCase().includes(pokemon.name.toLowerCase())) {
        pokemonNames.push(pokemon.name);
      }
    }
    
    return [...new Set(pokemonNames)]; // Remove duplicates
  }

  extractTypes(question) {
    const typePattern = /(fire|water|grass|electric|psychic|fighting|poison|ground|flying|bug|rock|ghost|dragon|dark|steel|fairy|normal|ice)/gi;
    const matches = question.match(typePattern) || [];
    return [...new Set(matches.map(type => 
      type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
    ))];
  }

  extractGeneration(question) {
    if (/gen\s*1|generation\s*1|kanto/i.test(question)) return 1;
    if (/gen\s*2|generation\s*2|johto/i.test(question)) return 2;
    if (/gen\s*3|generation\s*3|hoenn/i.test(question)) return 3;
    return null;
  }

  extractBiomes(question) {
    const biomePattern = /(forest|desert|ocean|mountain|cave|grassland|urban|swamp|volcanic|mystical|ice|sky)/gi;
    const matches = question.match(biomePattern) || [];
    return [...new Set(matches.map(biome => 
      biome.charAt(0).toUpperCase() + biome.slice(1).toLowerCase()
    ))];
  }

  getRandomSample(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  cacheResponse(key, response) {
    // Implement LRU cache
    if (this.responseCache.size >= this.maxCacheSize) {
      const firstKey = this.responseCache.keys().next().value;
      this.responseCache.delete(firstKey);
    }
    this.responseCache.set(key, response);
  }

  /**
   * Get API statistics
   */
  getAPIStats() {
    return {
      cache_size: this.responseCache.size,
      query_service_stats: this.queryService.getStats(),
      supported_queries: [
        'Pokemon information lookup',
        'Type-based searches',
        'Generation filtering',
        'Evolution information',
        'Biome/habitat queries',
        'Legendary Pokemon lists',
        'General fuzzy search'
      ]
    };
  }

  /**
   * Clear cache (for memory management)
   */
  clearCache() {
    this.responseCache.clear();
  }
}

export { PokemonKnowledgeAPI };