/**
 * Modern Performance Optimization System for EmeraldMind
 * Consolidates and modernizes existing performance utilities
 */

import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createLogger } from "./logger";

const perfLogger = createLogger("Performance");

// ===== LAZY LOADING WITH ERROR BOUNDARIES =====

// Enhanced lazy loading with retry mechanism
export const createLazyComponent = (importFn, displayName = "Component") => {
  const LazyComponent = lazy(() =>
    importFn().catch((error) => {
      perfLogger.error(`Failed to load ${displayName}`, {
        error: error.message,
      });
      // Return a fallback component instead of crashing
      return {
        default: () => (
          <div className="p-4 text-center text-red-500">
            Failed to load {displayName}. Please refresh and try again.
          </div>
        ),
      };
    })
  );

  LazyComponent.displayName = `Lazy(${displayName})`;
  return LazyComponent;
};

// Optimized suspense wrapper with different loading states
export const OptimizedSuspense = memo(
  ({ children, fallback, minLoadingTime = 200, className = "" }) => {
    const [showFallback, setShowFallback] = useState(false);
    const timeoutRef = useRef(null);

    useEffect(() => {
      // Prevent flash of loading for very fast loads
      timeoutRef.current = setTimeout(() => {
        setShowFallback(true);
      }, minLoadingTime);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [minLoadingTime]);

    const defaultFallback = (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce"></div>
          <div
            className="w-4 h-4 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-4 h-4 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    );

    return (
      <Suspense fallback={showFallback ? fallback || defaultFallback : null}>
        {children}
      </Suspense>
    );
  }
);

OptimizedSuspense.displayName = "OptimizedSuspense";

// ===== COMPONENT OPTIMIZATION PATTERNS =====

// Higher-order component for performance monitoring
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
  const EnhancedComponent = memo((props) => {
    const renderStartTime = useRef(performance.now());

    useEffect(() => {
      const renderTime = performance.now() - renderStartTime.current;
      if (renderTime > 16) {
        // Flag renders slower than 60fps
        perfLogger.warn(`Slow render detected in ${componentName}`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
        });
      }
    });

    return <WrappedComponent {...props} />;
  });

  EnhancedComponent.displayName = `withPerformanceMonitoring(${componentName})`;
  return EnhancedComponent;
};

// ===== ADVANCED MEMOIZATION UTILITIES =====

// Deep comparison hook for complex objects
export const useDeepMemo = (factory, deps) => {
  const ref = useRef();
  const signalRef = useRef(0);

  const depString = JSON.stringify(deps);

  if (!ref.current || ref.current.depString !== depString) {
    ref.current = {
      depString,
      value: factory(),
    };
    signalRef.current += 1;
  }

  return useMemo(() => ref.current.value, [signalRef.current]);
};

// Optimized callback with dependency tracking
export const useOptimizedCallback = (callback, deps) => {
  const depsRef = useRef(deps);
  const callbackRef = useRef(callback);

  // Check if dependencies have actually changed
  const depsChanged = useMemo(() => {
    if (!depsRef.current || depsRef.current.length !== deps.length) {
      return true;
    }
    return deps.some((dep, index) => dep !== depsRef.current[index]);
  }, deps);

  if (depsChanged) {
    depsRef.current = deps;
    callbackRef.current = callback;
  }

  return useCallback(callbackRef.current, [depsChanged]);
};

// ===== BUNDLE OPTIMIZATION =====

// Dynamic import helper with preloading
export const preloadRoute = (importFn) => {
  // Preload on mouse enter or touch start
  const preload = () => {
    importFn().catch((error) => {
      perfLogger.debug("Route preload failed", { error: error.message });
    });
  };

  return { preload };
};

// Code splitting utility for large utilities
export const createAsyncUtility = (importFn, utilityName) => {
  let utilityPromise = null;

  return async (...args) => {
    if (!utilityPromise) {
      perfLogger.debug(`Loading utility: ${utilityName}`);
      utilityPromise = importFn();
    }

    try {
      const utility = await utilityPromise;
      return utility.default ? utility.default(...args) : utility(...args);
    } catch (error) {
      perfLogger.error(`Utility ${utilityName} failed to load`, {
        error: error.message,
      });
      throw error;
    }
  };
};

// ===== RENDERING OPTIMIZATIONS =====

// Virtual scrolling hook for large lists
export const useVirtualList = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const onScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return { visibleItems, onScroll };
};

// Debounced state hook
export const useDebouncedState = (initialValue, delay = 300) => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timeoutRef = useRef(null);

  const setValueDebounced = useCallback(
    (newValue) => {
      setValue(newValue);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(newValue);
      }, delay);
    },
    [delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [value, debouncedValue, setValueDebounced];
};

// ===== CACHE OPTIMIZATIONS =====

// Modern cache implementation with TTL and size limits
class AdvancedCache {
  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) {
    // 5 minutes default
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.cache = new Map();
    this.timers = new Map();
  }

  set(key, value, ttl = this.defaultTTL) {
    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      this.delete(firstKey);
    }

    // Set value
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);

    this.timers.set(key, timer);

    perfLogger.trace(`Cache set: ${key}`, { size: this.cache.size });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      return null;
    }

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, item);

    perfLogger.trace(`Cache hit: ${key}`);
    return item.value;
  }

  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    return this.cache.delete(key);
  }

  clear() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.cache.clear();
    perfLogger.debug("Cache cleared");
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Global caches for different data types
export const imageCache = new AdvancedCache(50, 10 * 60 * 1000); // 10 minutes for images
export const apiCache = new AdvancedCache(100, 5 * 60 * 1000); // 5 minutes for API calls
export const computationCache = new AdvancedCache(30, 15 * 60 * 1000); // 15 minutes for heavy computations

// ===== PERFORMANCE MONITORING =====

// Performance metrics hook
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    averageRenderTime: 0,
    slowRenders: 0,
  });

  const startRender = useRef(null);
  const renderTimes = useRef([]);

  const markRenderStart = useCallback(() => {
    startRender.current = performance.now();
  }, []);

  const markRenderEnd = useCallback(() => {
    if (startRender.current) {
      const renderTime = performance.now() - startRender.current;
      renderTimes.current.push(renderTime);

      // Keep only last 10 render times
      if (renderTimes.current.length > 10) {
        renderTimes.current.shift();
      }

      const average =
        renderTimes.current.reduce((a, b) => a + b, 0) /
        renderTimes.current.length;

      setMetrics((prev) => ({
        renderCount: prev.renderCount + 1,
        averageRenderTime: average,
        slowRenders: prev.slowRenders + (renderTime > 16 ? 1 : 0),
      }));
    }
  }, []);

  return { metrics, markRenderStart, markRenderEnd };
};

// Bundle analyzer helper for development
export const analyzeBundleUsage = () => {
  if (process.env.NODE_ENV !== "development") return;

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === "navigation") {
        perfLogger.info("Navigation timing", {
          domContentLoaded:
            entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
          loadComplete: entry.loadEventEnd - entry.loadEventStart,
        });
      }
    });
  });

  observer.observe({ entryTypes: ["navigation"] });
};

// ===== UTILITY EXPORTS =====

export const PerformanceUtils = {
  createLazyComponent,
  OptimizedSuspense,
  withPerformanceMonitoring,
  useDeepMemo,
  useOptimizedCallback,
  preloadRoute,
  createAsyncUtility,
  useVirtualList,
  useDebouncedState,
  AdvancedCache,
  usePerformanceMetrics,
  analyzeBundleUsage,
};

export default PerformanceUtils;
