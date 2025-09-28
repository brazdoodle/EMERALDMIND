/**
 * EmeraldMind Performance Optimization Implementation
 * "15 ways to make the application run more efficiently"
 * 
 * This file implements comprehensive performance improvements as requested:
 * lazy loading, reused variables that can become constants, React patterns, etc.
 */

// ===== 1. LAZY LOADING COMPONENTS =====
import { lazy, Suspense } from 'react';

// Convert heavy components to lazy-loaded versions
export const LazyTrainerArchitect = lazy(() => import('../pages/TrainerArchitect'));
export const LazyScriptSage = lazy(() => import('../pages/ScriptSage'));
export const LazyKnowledgeHub = lazy(() => import('../pages/KnowledgeHub'));
export const LazyNarrativeEngine = lazy(() => import('../pages/NarrativeEngine'));
export const LazyFlagForge = lazy(() => import('../pages/FlagForge'));
export const LazyProgrammaticGenerator = lazy(() => import('../pages/ProgrammaticGenerator'));

// Lazy loading wrapper with optimized loading state
export const LazyWrapper = ({ children, fallback }) => (
  <Suspense fallback={fallback || <div className="animate-pulse">Loading...</div>}>
    {children}
  </Suspense>
);

// ===== 2. CONSTANTS FROM REUSED VARIABLES =====

// Convert repeated string literals to constants
export const UI_CONSTANTS = {
  LOADING_TEXT: 'Loading...',
  ERROR_TEXT: 'An error occurred',
  SAVE_TEXT: 'Save',
  CANCEL_TEXT: 'Cancel',
  DELETE_TEXT: 'Delete',
  EDIT_TEXT: 'Edit',
  ADD_TEXT: 'Add',
  BACK_TEXT: 'Back',
  NEXT_TEXT: 'Next',
  PREVIOUS_TEXT: 'Previous',
  SUBMIT_TEXT: 'Submit',
  CLOSE_TEXT: 'Close'
};

export const API_CONSTANTS = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  DEBOUNCE_DELAY: 300
};

export const POKEMON_CONSTANTS = {
  MAX_LEVEL: 100,
  MIN_LEVEL: 1,
  TEAM_SIZE: 6,
  MAX_MOVES: 4,
  GEN3_DEX_LIMIT: 386,
  DEFAULT_BIOME: 'Route1'
};

export const PERFORMANCE_CONSTANTS = {
  VIRTUAL_LIST_ITEM_HEIGHT: 50,
  PAGINATION_SIZE: 20,
  DEBOUNCE_SEARCH: 250,
  THROTTLE_SCROLL: 100,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_SIZE: 100
};

// ===== 3. MEMOIZED SELECTORS =====
import { createSelector } from 'reselect';

// Memoized selectors to prevent unnecessary recalculations
export const selectPokemonByType = createSelector(
  [state => state.pokemon, (_, type) => type],
  (pokemon, type) => pokemon.filter(p => p.types.includes(type))
);

export const selectTrainersByDifficulty = createSelector(
  [state => state.trainers, (_, difficulty) => difficulty],
  (trainers, difficulty) => trainers.filter(t => t.difficulty === difficulty)
);

export const selectSortedScripts = createSelector(
  [state => state.scripts],
  scripts => [...scripts].sort((a, b) => a.name.localeCompare(b.name))
);

// ===== 4. OPTIMIZED REACT COMPONENTS =====
import React, { memo, useMemo, useCallback } from 'react';

// Memoized Pokemon card component
export const PokemonCard = memo(({ pokemon, onSelect, isSelected }) => {
  const cardClass = useMemo(() => 
    `pokemon-card ${isSelected ? 'selected' : ''} type-${pokemon.types[0].toLowerCase()}`,
    [isSelected, pokemon.types]
  );

  const handleClick = useCallback(() => {
    onSelect(pokemon.id);
  }, [onSelect, pokemon.id]);

  return (
    <div className={cardClass} onClick={handleClick}>
      <img 
        src={`/sprites/${pokemon.name}.png`} 
        alt={pokemon.name}
        loading="lazy"
        width={64}
        height={64}
      />
      <span>{pokemon.name}</span>
    </div>
  );
});

// Memoized trainer component with optimized rendering
export const TrainerCard = memo(({ trainer, onEdit, onDelete }) => {
  const handleEdit = useCallback(() => onEdit(trainer.id), [onEdit, trainer.id]);
  const handleDelete = useCallback(() => onDelete(trainer.id), [onDelete, trainer.id]);

  const teamSummary = useMemo(() => 
    trainer.team.map(p => p.name).join(', '),
    [trainer.team]
  );

  return (
    <div className="trainer-card">
      <h3>{trainer.name}</h3>
      <p>Team: {teamSummary}</p>
      <button onClick={handleEdit}>Edit</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
});

// ===== 5. VIRTUALIZED LISTS =====
import { VariableSizeList as List } from 'react-window';

export const VirtualizedPokemonList = memo(({ pokemon, onSelect }) => {
  const getItemSize = useCallback((index) => {
    // Dynamic sizing based on content
    const item = pokemon[index];
    return item.description ? 80 : 50;
  }, [pokemon]);

  const renderItem = useCallback(({ index, style }) => {
    const pokemonData = pokemon[index];
    return (
      <div style={style}>
        <PokemonCard 
          pokemon={pokemonData}
          onSelect={onSelect}
        />
      </div>
    );
  }, [pokemon, onSelect]);

  return (
    <List
      height={400}
      itemCount={pokemon.length}
      itemSize={getItemSize}
      width="100%"
    >
      {renderItem}
    </List>
  );
});

// ===== 6. DEBOUNCED SEARCH HOOK =====
import { useState, useEffect } from 'react';

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export const useOptimizedSearch = (searchTerm, items, searchFields) => {
  const debouncedTerm = useDebounce(searchTerm, PERFORMANCE_CONSTANTS.DEBOUNCE_SEARCH);
  
  return useMemo(() => {
    if (!debouncedTerm) return items;
    
    const term = debouncedTerm.toLowerCase();
    return items.filter(item => 
      searchFields.some(field => 
        item[field]?.toLowerCase().includes(term)
      )
    );
  }, [debouncedTerm, items, searchFields]);
};

// ===== 7. MEMOIZED CALCULATIONS =====

// Expensive calculation wrapper with memoization
export const useMemoizedCalculation = (data, calculationFn) => {
  return useMemo(() => {
    if (!data || data.length === 0) return null;
    return calculationFn(data);
  }, [data, calculationFn]);
};

// Type effectiveness calculations
export const useTypeEffectiveness = (attackType, defendTypes) => {
  return useMemo(() => {
    // Expensive type chart calculations
    return calculateTypeEffectiveness(attackType, defendTypes);
  }, [attackType, defendTypes]);
};

// Team coverage analysis
export const useTeamCoverage = (team) => {
  return useMemo(() => {
    return analyzeTeamCoverage(team);
  }, [team]);
};

// ===== 8. OPTIMIZED EVENT HANDLERS =====

// Throttled scroll handler
export const useThrottledScroll = (callback, delay = PERFORMANCE_CONSTANTS.THROTTLE_SCROLL) => {
  const [isThrottled, setIsThrottled] = useState(false);

  return useCallback((event) => {
    if (isThrottled) return;
    
    callback(event);
    setIsThrottled(true);
    
    setTimeout(() => setIsThrottled(false), delay);
  }, [callback, delay, isThrottled]);
};

// ===== 9. EFFICIENT STATE MANAGEMENT =====

// Optimized reducer for large datasets
export const optimizedReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_POKEMON':
      // Use Map for O(1) lookups instead of O(n) array operations
      const pokemonMap = new Map(state.pokemon.map(p => [p.id, p]));
      pokemonMap.set(action.payload.id, action.payload);
      return {
        ...state,
        pokemon: Array.from(pokemonMap.values())
      };
    
    case 'BATCH_UPDATE':
      // Batch updates for better performance
      const updates = new Map(action.payload.map(p => [p.id, p]));
      return {
        ...state,
        pokemon: state.pokemon.map(p => updates.get(p.id) || p)
      };
    
    default:
      return state;
  }
};

// ===== 10. IMAGE OPTIMIZATION =====

// Lazy loaded image component with optimization
export const OptimizedImage = memo(({ src, alt, width, height, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => setIsLoaded(true), []);
  const handleError = useCallback(() => setHasError(true), []);

  return (
    <div className={`image-container ${className || ''}`}>
      {!isLoaded && !hasError && (
        <div className="image-skeleton animate-pulse bg-gray-200" />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        style={{ 
          display: hasError ? 'none' : isLoaded ? 'block' : 'none' 
        }}
      />
      {hasError && (
        <div className="image-error">Failed to load image</div>
      )}
    </div>
  );
});

// ===== 11. CACHE IMPLEMENTATION =====

class LRUCache {
  constructor(maxSize = PERFORMANCE_CONSTANTS.MAX_CACHE_SIZE) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (this.cache.has(key)) {
      const value = this.cache.get(key);
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}

export const apiCache = new LRUCache();

// ===== 12. OPTIMIZED API CALLS =====

export const useOptimizedFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    // Check cache first
    const cached = apiCache.get(url);
    if (cached && Date.now() - cached.timestamp < PERFORMANCE_CONSTANTS.CACHE_TTL) {
      setData(cached.data);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        timeout: API_CONSTANTS.TIMEOUT
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      
      // Cache the result
      apiCache.set(url, {
        data: result,
        timestamp: Date.now()
      });
      
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// ===== 13. BUNDLE SPLITTING =====

// Dynamic imports for code splitting
export const loadComponent = (componentPath) => {
  return lazy(() => 
    import(componentPath).catch(err => {
      console.error(`Failed to load component: ${componentPath}`, err);
      // Return fallback component
      return { default: () => <div>Component failed to load</div> };
    })
  );
};

// ===== 14. PERFORMANCE MONITORING =====

export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState({});

  const measurePerformance = useCallback((name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    setMetrics(prev => ({
      ...prev,
      [name]: end - start
    }));
    
    return result;
  }, []);

  return { metrics, measurePerformance };
};

// ===== 15. OPTIMIZED RENDERING PATTERNS =====

// Batch DOM updates
export const useBatchedUpdates = () => {
  const [updates, setUpdates] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addUpdate = useCallback((update) => {
    setUpdates(prev => [...prev, update]);
  }, []);

  useEffect(() => {
    if (updates.length > 0 && !isProcessing) {
      setIsProcessing(true);
      
      // Use requestAnimationFrame for smooth updates
      requestAnimationFrame(() => {
        // Process all batched updates
        updates.forEach(update => update());
        setUpdates([]);
        setIsProcessing(false);
      });
    }
  }, [updates, isProcessing]);

  return { addUpdate };
};

// Intersection Observer for efficient visibility detection
export const useIntersectionObserver = (callback, options = {}) => {
  const targetRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => observer.disconnect();
  }, [callback, options]);

  return targetRef;
};

// Helper functions (implement these based on your app logic)
const calculateTypeEffectiveness = (attackType, defendTypes) => {
  // Implementation for type effectiveness calculation
  return 1; // placeholder
};

const analyzeTeamCoverage = (team) => {
  // Implementation for team coverage analysis
  return {}; // placeholder
};

export default {
  // Export all optimization utilities
  LazyWrapper,
  UI_CONSTANTS,
  API_CONSTANTS,
  POKEMON_CONSTANTS,
  PERFORMANCE_CONSTANTS,
  PokemonCard,
  TrainerCard,
  VirtualizedPokemonList,
  useDebounce,
  useOptimizedSearch,
  useMemoizedCalculation,
  useTypeEffectiveness,
  useTeamCoverage,
  useThrottledScroll,
  OptimizedImage,
  apiCache,
  useOptimizedFetch,
  loadComponent,
  usePerformanceMetrics,
  useBatchedUpdates,
  useIntersectionObserver
};