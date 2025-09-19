/**
 * Performance optimization utilities for local/desktop usage
 */

import React, { memo, useMemo, useCallback } from 'react';

// Memoized component wrapper for heavy components
export const withPerformance = (Component) => {
  return memo(Component, (prevProps, nextProps) => {
    // Custom comparison logic for better performance
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  });
};

// Debounced search hook
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

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
  const [metrics, setMetrics] = React.useState({
    renderTime: 0,
    memoryUsage: 0,
    frameRate: 60
  });
  
  React.useEffect(() => {
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
  const [isVisible, setIsVisible] = React.useState(false);
  const targetRef = React.useRef();
  
  React.useEffect(() => {
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

export default {
  withPerformance,
  useDebounce,
  useVirtualizedList,
  usePerformanceMonitor,
  useLazyLoading
};