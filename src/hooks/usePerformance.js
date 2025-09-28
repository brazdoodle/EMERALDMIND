/**
 * usePerformance Hook - Performance monitoring and optimization
 * Provides caching, performance tracking, and optimization suggestions
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getPerformanceManager } from '../lib/performance/PerformanceManager';

export const usePerformance = (options = {}) => {
  const {
    enableAutoOptimization = true,
    performanceThreshold = 100,
    monitorMemory = true
  } = options;

  const [performanceData, setPerformanceData] = useState(null);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const performanceManager = useRef(getPerformanceManager());
  const updateInterval = useRef(null);

  // Update performance data periodically
  useEffect(() => {
    const updatePerformanceData = () => {
      const insights = performanceManager.current.getPerformanceInsights();
      setPerformanceData(insights);
      setOptimizationSuggestions(insights.suggestions);
    };

    // Initial update
    updatePerformanceData();

    // Set up periodic updates
    updateInterval.current = setInterval(updatePerformanceData, 5000);

    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    };
  }, []);

  // Cache operations
  const cache = useCallback({
    set: (category, key, value, options) => 
      performanceManager.current.set(category, key, value, options),
    get: (category, key) => 
      performanceManager.current.get(category, key),
    has: (category, key) => 
      performanceManager.current.has(category, key),
    clear: (category) => 
      performanceManager.current.clearCategory(category),
    clearAll: () => 
      performanceManager.current.clearAll()
  }, []);

  // Performance measurement
  const measurePerformance = useCallback(async (operation, fn, ...args) => {
    return performanceManager.current.measurePerformance(operation, fn, ...args);
  }, []);

  // Auto-optimization
  const runAutoOptimization = useCallback(async () => {
    if (isOptimizing) return;
    
    setIsOptimizing(true);
    try {
      const suggestions = optimizationSuggestions.filter(s => s.priority === 'high');
      
      for (const suggestion of suggestions) {
        if (suggestion.action && typeof suggestion.action === 'function') {
          await suggestion.action();
        }
      }
      
      // Refresh performance data
      const insights = performanceManager.current.getPerformanceInsights();
      setPerformanceData(insights);
      setOptimizationSuggestions(insights.suggestions);
      
    } finally {
      setIsOptimizing(false);
    }
  }, [optimizationSuggestions, isOptimizing]);

  // Manual optimization
  const applySuggestion = useCallback(async (suggestion) => {
    if (suggestion.action && typeof suggestion.action === 'function') {
      setIsOptimizing(true);
      try {
        await suggestion.action();
        
        // Refresh data
        const insights = performanceManager.current.getPerformanceInsights();
        setPerformanceData(insights);
        setOptimizationSuggestions(insights.suggestions);
      } finally {
        setIsOptimizing(false);
      }
    }
  }, []);

  // Auto-optimization effect
  useEffect(() => {
    if (!enableAutoOptimization) return;
    
    const highPrioritySuggestions = optimizationSuggestions.filter(
      s => s.priority === 'high'
    );
    
    if (highPrioritySuggestions.length > 0) {
      runAutoOptimization();
    }
  }, [optimizationSuggestions, enableAutoOptimization, runAutoOptimization]);

  return {
    // Performance data
    performanceData,
    optimizationSuggestions,
    isOptimizing,
    
    // Cache operations
    cache,
    
    // Performance measurement
    measurePerformance,
    
    // Optimization
    runAutoOptimization,
    applySuggestion,
    
    // Manager access
    performanceManager: performanceManager.current
  };
};

export default usePerformance;