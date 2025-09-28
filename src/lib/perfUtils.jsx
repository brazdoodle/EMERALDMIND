// Performance Monitoring and Bundle Analysis Utils
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Bundle splitting and lazy loading helpers
export const lazyLoad = (importFunc, fallback = null) => {
  const LazyComponent = React.lazy(importFunc);
  return (props) => (
    <React.Suspense fallback={fallback || <div>Loading...</div>}>
      <LazyComponent {...props} />
    </React.Suspense>
  );
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  
  useEffect(() => {
    renderCount.current++;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PERF] ${componentName}: Render #${renderCount.current}, ${timeSinceLastRender}ms since last`);
    }
    
    lastRenderTime.current = now;
  });
  
  return renderCount.current;
};

// Enhanced state management hook for complex forms
export const useEnhancedState = (arg1, arg2 = 300) => {
  // API overloads:
  // useEnhancedState(initialValue, debounceMs?) -> [value, debouncedValue, setValue]
  // useEnhancedState(key, defaultValue) -> keyed localStorage-backed state
  let keyMode = false;
  let debounceMs = 300;
  let initialValue;

  if (typeof arg1 === 'string') {
    keyMode = true;
    // signature: (key, defaultValue)
    const key = arg1;
    initialValue = arg2;
    try {
      const raw = localStorage.getItem(key);
      initialValue = raw !== null ? JSON.parse(raw) : initialValue;
    } catch (_e) {
      // ignore parse errors
    }
    // store key onto the closure
    arg1 = key;
    debounceMs = 300;
  } else {
    // signature: (initialValue, debounceMs?)
    initialValue = arg1;
    debounceMs = typeof arg2 === 'number' ? arg2 : 300;
  }

  const [state, setState] = useState(initialValue);
  const [debouncedState, setDebouncedState] = useState(initialValue);
  const timeoutRef = useRef();

  const scheduleDebounced = useCallback((next) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setDebouncedState(next);
    }, debounceMs);
  }, [debounceMs]);

  const updateState = useCallback((updates) => {
    if (typeof updates === 'function') {
      setState(prev => {
        const next = updates(prev);
        scheduleDebounced(next);
        if (keyMode) try { localStorage.setItem(arg1, JSON.stringify(next)); } catch (_e) {}
        return next;
      });
      return;
    }

    setState(prev => {
      let next;
      const isPrevObj = prev && typeof prev === 'object' && !Array.isArray(prev);
      const isUpdObj = updates && typeof updates === 'object' && !Array.isArray(updates);
      if (isPrevObj && isUpdObj) next = { ...prev, ...updates };
      else next = updates;

      scheduleDebounced(next);
      if (keyMode) try { localStorage.setItem(arg1, JSON.stringify(next)); } catch (_e) {}
      return next;
    });
  }, [arg1, keyMode, scheduleDebounced]);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return [state, debouncedState, updateState];
};

// Memory-efficient list virtualization
export const useVirtualList = (items, containerHeight, itemHeight) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 2,
      items.length
    );
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, itemHeight, items.length]);
  
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex).map((item, index) => ({
      ...item,
      index: visibleRange.startIndex + index
    }));
  }, [items, visibleRange]);
  
  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    offsetY: visibleRange.startIndex * itemHeight,
    onScroll: (e) => setScrollTop(e.target.scrollTop)
  };
};

// Component render optimization
export const withMemoization = (Component, areEqual) => {
  return React.memo(Component, areEqual);
};