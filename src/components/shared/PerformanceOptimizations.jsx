/**
 * Performance optimization utilities for local/desktop usage
 * Implements 15 ways to make the application run more efficiently
 */
import { memo, useMemo, useCallback, useState, useEffect, useRef } from 'react';

// Import our comprehensive optimization utilities
import {
  UI_CONSTANTS,
  PERFORMANCE_CONSTANTS,
  useDebounce as useOptimizedDebounce,
  useOptimizedSearch,
  OptimizedImage,
  useOptimizedFetch,
  useIntersectionObserver
} from '../../lib/performanceOptimizations';

// Memoized component wrapper for heavy components
export const withPerformance = (Component) => {
  return memo(Component, (prevProps, nextProps) => {
    // Custom comparison logic for better performance
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  });
};

// Enhanced debounced search hook with optimizations
export const useDebounce = (value, delay = PERFORMANCE_CONSTANTS.DEBOUNCE_SEARCH) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Re-export optimized search from our main optimization module
export { useOptimizedSearch } from '../../lib/performanceOptimizations';

// Optimized list virtualization for large datasets
export const useVirtualizedList = (items, containerHeight = 400, itemHeight = 60) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return {
      items: items.slice(startIndex, endIndex),
      startIndex,
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, scrollTop, containerHeight, itemHeight]);
  
  const onScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);
  
  return { visibleItems, onScroll };
};

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    frameRate: 60
  });
  
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measurePerformance = () => {
      const currentTime = performance.now();
      frameCount++;
      
      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({
          ...prev,
          frameRate: frameCount,
          memoryUsage: performance.memory ? performance.memory.usedJSHeapSize / 1048576 : 0
        }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measurePerformance);
    };
    
    measurePerformance();
  }, []);
  
  return metrics;
};

// Lazy loading utility
export const useLazyLoading = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const targetRef = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold }
    );
    
    const current = targetRef.current;
    if (current) observer.observe(current);
    
    return () => {
      if (current) observer.unobserve(current);
    };
  }, [threshold]);
  
  return { targetRef, isVisible };
};

// Additional optimized components for specific use cases

// Optimized Pokemon team display with memoization
export const OptimizedPokemonTeam = memo(({ team, onEdit, onRemove }) => {
  const teamStats = useMemo(() => {
    return {
      totalLevel: team.reduce((sum, p) => sum + p.level, 0),
      averageLevel: Math.round(team.reduce((sum, p) => sum + p.level, 0) / team.length),
      typesCovered: [...new Set(team.flatMap(p => p.types))].length
    };
  }, [team]);

  const handleEdit = useCallback((pokemonId) => {
    onEdit(pokemonId);
  }, [onEdit]);

  const handleRemove = useCallback((pokemonId) => {
    onRemove(pokemonId);
  }, [onRemove]);

  return (
    <div className="optimized-pokemon-team">
      <div className="team-stats">
        <span>Avg Level: {teamStats.averageLevel}</span>
        <span>Types: {teamStats.typesCovered}</span>
      </div>
      <div className="team-members">
        {team.map((pokemon) => (
          <OptimizedImage
            key={pokemon.id}
            src={`/sprites/${pokemon.name}.png`}
            alt={pokemon.name}
            width={64}
            height={64}
            className="pokemon-sprite"
          />
        ))}
      </div>
    </div>
  );
});

// Optimized script list with virtualization
export const OptimizedScriptList = memo(({ scripts, onSelect, onEdit, onDelete }) => {
  const { visibleItems, onScroll } = useVirtualizedList(scripts);
  
  const handleAction = useCallback((action, scriptId) => {
    switch (action) {
      case 'select': onSelect(scriptId); break;
      case 'edit': onEdit(scriptId); break;
      case 'delete': onDelete(scriptId); break;
      default: break;
    }
  }, [onSelect, onEdit, onDelete]);

  return (
    <div 
      className="optimized-script-list"
      style={{ height: '400px', overflow: 'auto' }}
      onScroll={onScroll}
    >
      <div style={{ height: visibleItems.totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${visibleItems.offsetY}px)` }}>
          {visibleItems.items.map((script, index) => (
            <div 
              key={script.id} 
              className="script-item"
              style={{ height: '60px' }}
            >
              <span>{script.name}</span>
              <div className="script-actions">
                <button onClick={() => handleAction('select', script.id)}>
                  {UI_CONSTANTS.SELECT_TEXT || 'Select'}
                </button>
                <button onClick={() => handleAction('edit', script.id)}>
                  {UI_CONSTANTS.EDIT_TEXT}
                </button>
                <button onClick={() => handleAction('delete', script.id)}>
                  {UI_CONSTANTS.DELETE_TEXT}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// Optimized search component with debouncing
export const OptimizedSearch = memo(({ onSearch, placeholder, searchFields, data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedTerm = useDebounce(searchTerm);
  
  const results = useOptimizedSearch(debouncedTerm, data, searchFields);
  
  useEffect(() => {
    onSearch(results);
  }, [results, onSearch]);

  const handleChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div className="optimized-search">
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder={placeholder || 'Search...'}
        className="search-input"
      />
      <div className="search-stats">
        {results.length} results
      </div>
    </div>
  );
});

// Performance metrics display component
export const PerformanceMetricsDisplay = memo(() => {
  const metrics = usePerformanceMonitor();
  
  return (
    <div className="performance-metrics">
      <div>FPS: {metrics.frameRate}</div>
      <div>Memory: {metrics.memoryUsage.toFixed(2)}MB</div>
      <div>Render Time: {metrics.renderTime.toFixed(2)}ms</div>
    </div>
  );
});

export default {
  // Core optimization hooks
  withPerformance,
  useDebounce,
  useVirtualizedList,
  usePerformanceMonitor,
  useLazyLoading,
  useOptimizedSearch,
  
  // Optimized components
  OptimizedPokemonTeam,
  OptimizedScriptList,
  OptimizedSearch,
  PerformanceMetricsDisplay,
  
  // Re-export from main optimization module
  OptimizedImage,
  useOptimizedFetch,
  
  // Constants
  UI_CONSTANTS,
  PERFORMANCE_CONSTANTS
};