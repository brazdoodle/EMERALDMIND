/**
 * Performance Optimization & Caching System for EmeraldMind
 * Intelligent caching, lazy loading, and memory management
 */

import { trainerLogger } from "../logger";

// Cache configuration
const CACHE_CONFIG = {
  MAX_MEMORY_MB: 50, // Maximum cache size in MB
  CACHE_DURATION_MS: 10 * 60 * 1000, // 10 minutes default
  CLEANUP_INTERVAL_MS: 2 * 60 * 1000, // Cleanup every 2 minutes
  MAX_ENTRIES: 1000, // Maximum number of cached entries
  PERFORMANCE_THRESHOLD_MS: 100, // Operations slower than this are logged
};

// Cache categories with different configurations
const CACHE_CATEGORIES = {
  POKEMON_DATA: {
    key: "pokemon-data",
    duration: 30 * 60 * 1000, // 30 minutes
    priority: "high",
    persistent: true,
  },
  SPRITES: {
    key: "sprites",
    duration: 60 * 60 * 1000, // 1 hour
    priority: "medium",
    persistent: true,
  },
  MOVESETS: {
    key: "movesets",
    duration: 20 * 60 * 1000, // 20 minutes
    priority: "high",
    persistent: false,
  },
  TEAM_ANALYSIS: {
    key: "team-analysis",
    duration: 5 * 60 * 1000, // 5 minutes
    priority: "low",
    persistent: false,
  },
  VALIDATION_RESULTS: {
    key: "validation",
    duration: 2 * 60 * 1000, // 2 minutes
    priority: "medium",
    persistent: false,
  },
};

export class PerformanceManager {
  constructor() {
    this.cache = new Map();
    this.cacheMetadata = new Map();
    this.memoryUsage = 0;
    this.performanceMetrics = new Map();
    this.cleanupInterval = null;
    this.startCleanupTimer();

    // Performance monitoring
    this.operationCounts = new Map();
    this.slowOperations = [];

    trainerLogger.info("Performance Manager initialized");
  }

  /**
   * Intelligent caching with LRU eviction and memory management
   */
  set(category, key, value, options = {}) {
    const cacheConfig =
      CACHE_CATEGORIES[category] || CACHE_CATEGORIES.POKEMON_DATA;
    const fullKey = `${cacheConfig.key}:${key}`;

    try {
      // Calculate approximate size
      const size = this.estimateSize(value);
      const expiresAt = Date.now() + (options.duration || cacheConfig.duration);

      // Check if we need to free memory
      if (this.memoryUsage + size > CACHE_CONFIG.MAX_MEMORY_MB * 1024 * 1024) {
        this.evictLRU(size);
      }

      // Store in cache
      this.cache.set(fullKey, value);
      this.cacheMetadata.set(fullKey, {
        category,
        size,
        expiresAt,
        accessedAt: Date.now(),
        accessCount: 0,
        priority: cacheConfig.priority,
        persistent: cacheConfig.persistent,
      });

      this.memoryUsage += size;

      trainerLogger.debug(`Cached ${fullKey}: ${this.formatSize(size)}`);
    } catch (error) {
      trainerLogger.error(`Cache set failed for ${fullKey}:`, error);
    }
  }

  /**
   * Retrieve from cache with access tracking
   */
  get(category, key) {
    const cacheConfig =
      CACHE_CATEGORIES[category] || CACHE_CATEGORIES.POKEMON_DATA;
    const fullKey = `${cacheConfig.key}:${key}`;

    const metadata = this.cacheMetadata.get(fullKey);
    if (!metadata) {
      return null;
    }

    // Check expiration
    if (Date.now() > metadata.expiresAt) {
      this.delete(fullKey);
      return null;
    }

    // Update access metadata
    metadata.accessedAt = Date.now();
    metadata.accessCount++;

    const value = this.cache.get(fullKey);
    if (value) {
      trainerLogger.debug(`Cache hit: ${fullKey}`);
    }

    return value;
  }

  /**
   * Check if item exists in cache
   */
  has(category, key) {
    const cacheConfig =
      CACHE_CATEGORIES[category] || CACHE_CATEGORIES.POKEMON_DATA;
    const fullKey = `${cacheConfig.key}:${key}`;

    const metadata = this.cacheMetadata.get(fullKey);
    if (!metadata || Date.now() > metadata.expiresAt) {
      return false;
    }

    return this.cache.has(fullKey);
  }

  /**
   * Remove item from cache
   */
  delete(fullKey) {
    const metadata = this.cacheMetadata.get(fullKey);
    if (metadata) {
      this.memoryUsage -= metadata.size;
      this.cacheMetadata.delete(fullKey);
    }
    this.cache.delete(fullKey);
  }

  /**
   * Clear cache by category
   */
  clearCategory(category) {
    const cacheConfig = CACHE_CATEGORIES[category];
    if (!cacheConfig) return;

    const keysToDelete = [];
    for (const [key, metadata] of this.cacheMetadata.entries()) {
      if (metadata.category === category) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.delete(key));
    trainerLogger.info(`Cleared cache category: ${category}`);
  }

  /**
   * LRU eviction strategy
   */
  evictLRU(requiredSize) {
    const entries = Array.from(this.cacheMetadata.entries())
      .filter(([_, metadata]) => !metadata.persistent)
      .sort((a, b) => {
        // Sort by priority first, then by access time
        const priorityOrder = { low: 0, medium: 1, high: 2 };
        const priorityDiff =
          priorityOrder[a[1].priority] - priorityOrder[b[1].priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a[1].accessedAt - b[1].accessedAt;
      });

    let freedSize = 0;
    for (const [key] of entries) {
      if (freedSize >= requiredSize) break;

      const metadata = this.cacheMetadata.get(key);
      if (metadata) {
        freedSize += metadata.size;
        this.delete(key);
        trainerLogger.debug(
          `Evicted: ${key} (${this.formatSize(metadata.size)})`
        );
      }
    }

    trainerLogger.info(`LRU eviction freed ${this.formatSize(freedSize)}`);
  }

  /**
   * Performance monitoring wrapper
   */
  async measurePerformance(operation, fn, ...args) {
    const startTime = performance.now();
    const operationKey =
      typeof operation === "string" ? operation : operation.name;

    try {
      const result = await fn(...args);
      const duration = performance.now() - startTime;

      this.recordPerformance(operationKey, duration, true);

      if (duration > CACHE_CONFIG.PERFORMANCE_THRESHOLD_MS) {
        this.slowOperations.push({
          operation: operationKey,
          duration,
          timestamp: Date.now(),
          args:
            args.length > 0 ? JSON.stringify(args).substring(0, 100) : "none",
        });

        // Keep only recent slow operations
        if (this.slowOperations.length > 50) {
          this.slowOperations = this.slowOperations.slice(-30);
        }

        trainerLogger.warn(
          `Slow operation detected: ${operationKey} took ${duration.toFixed(
            2
          )}ms`
        );
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordPerformance(operationKey, duration, false);
      throw error;
    }
  }

  /**
   * Record performance metrics
   */
  recordPerformance(operation, duration, success) {
    if (!this.performanceMetrics.has(operation)) {
      this.performanceMetrics.set(operation, {
        count: 0,
        totalDuration: 0,
        avgDuration: 0,
        maxDuration: 0,
        minDuration: Infinity,
        successCount: 0,
        errorCount: 0,
      });
    }

    const metrics = this.performanceMetrics.get(operation);
    metrics.count++;
    metrics.totalDuration += duration;
    metrics.avgDuration = metrics.totalDuration / metrics.count;
    metrics.maxDuration = Math.max(metrics.maxDuration, duration);
    metrics.minDuration = Math.min(metrics.minDuration, duration);

    if (success) {
      metrics.successCount++;
    } else {
      metrics.errorCount++;
    }

    // Update operation counts
    this.operationCounts.set(
      operation,
      (this.operationCounts.get(operation) || 0) + 1
    );
  }

  /**
   * Get performance insights and optimization suggestions
   */
  getPerformanceInsights() {
    const insights = {
      cacheStats: this.getCacheStats(),
      slowOperations: this.slowOperations.slice(-10),
      topOperations: this.getTopOperations(),
      memoryUsage: this.getMemoryUsage(),
      suggestions: this.generateOptimizationSuggestions(),
    };

    return insights;
  }

  /**
   * Generate optimization suggestions based on performance data
   */
  generateOptimizationSuggestions() {
    const suggestions = [];

    // Memory usage suggestions
    if (this.memoryUsage > CACHE_CONFIG.MAX_MEMORY_MB * 0.8 * 1024 * 1024) {
      suggestions.push({
        type: "memory",
        priority: "high",
        title: "High Memory Usage",
        description: "Cache is using over 80% of allocated memory",
        recommendation:
          "Consider clearing old cache entries or increasing cache size limit",
        action: () => this.evictLRU(this.memoryUsage * 0.3),
      });
    }

    // Slow operations suggestions
    const recentSlowOps = this.slowOperations.filter(
      (op) => Date.now() - op.timestamp < 5 * 60 * 1000
    );

    if (recentSlowOps.length > 5) {
      suggestions.push({
        type: "performance",
        priority: "medium",
        title: "Multiple Slow Operations Detected",
        description: `${recentSlowOps.length} operations took longer than ${CACHE_CONFIG.PERFORMANCE_THRESHOLD_MS}ms`,
        recommendation:
          "Consider implementing caching or optimizing these operations",
        operations: recentSlowOps.map((op) => op.operation),
      });
    }

    // Cache hit rate suggestions
    const cacheStats = this.getCacheStats();
    if (cacheStats.hitRate < 0.7) {
      suggestions.push({
        type: "cache",
        priority: "medium",
        title: "Low Cache Hit Rate",
        description: `Cache hit rate is ${(cacheStats.hitRate * 100).toFixed(
          1
        )}%`,
        recommendation:
          "Review caching strategy or increase cache duration for frequently accessed data",
      });
    }

    return suggestions;
  }

  /**
   * Get detailed cache statistics
   */
  getCacheStats() {
    const totalEntries = this.cache.size;
    const categoryStats = new Map();

    for (const [_, metadata] of this.cacheMetadata.entries()) {
      if (!categoryStats.has(metadata.category)) {
        categoryStats.set(metadata.category, {
          count: 0,
          size: 0,
          avgAccess: 0,
          totalAccess: 0,
        });
      }

      const stats = categoryStats.get(metadata.category);
      stats.count++;
      stats.size += metadata.size;
      stats.totalAccess += metadata.accessCount;
      stats.avgAccess = stats.totalAccess / stats.count;
    }

    return {
      totalEntries,
      memoryUsage: this.memoryUsage,
      memoryUsageFormatted: this.formatSize(this.memoryUsage),
      maxMemory: CACHE_CONFIG.MAX_MEMORY_MB * 1024 * 1024,
      maxMemoryFormatted: this.formatSize(
        CACHE_CONFIG.MAX_MEMORY_MB * 1024 * 1024
      ),
      utilization:
        this.memoryUsage / (CACHE_CONFIG.MAX_MEMORY_MB * 1024 * 1024),
      categoryStats: Object.fromEntries(categoryStats),
      hitRate: this.calculateHitRate(),
    };
  }

  /**
   * Get top performing operations
   */
  getTopOperations() {
    return Array.from(this.operationCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([operation, count]) => ({
        operation,
        count,
        metrics: this.performanceMetrics.get(operation),
      }));
  }

  /**
   * Get memory usage breakdown
   */
  getMemoryUsage() {
    const breakdown = new Map();

    for (const [_, metadata] of this.cacheMetadata.entries()) {
      const category = metadata.category;
      breakdown.set(category, (breakdown.get(category) || 0) + metadata.size);
    }

    return {
      total: this.memoryUsage,
      totalFormatted: this.formatSize(this.memoryUsage),
      breakdown: Object.fromEntries(
        Array.from(breakdown.entries()).map(([category, size]) => [
          category,
          {
            size,
            sizeFormatted: this.formatSize(size),
            percentage: ((size / this.memoryUsage) * 100).toFixed(1),
          },
        ])
      ),
    };
  }

  /**
   * Calculate cache hit rate
   */
  calculateHitRate() {
    // This is a simplified calculation
    // In a real implementation, you'd track hits and misses
    return 0.85; // Placeholder
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    const keysToDelete = [];

    for (const [key, metadata] of this.cacheMetadata.entries()) {
      if (now > metadata.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.delete(key));

    if (keysToDelete.length > 0) {
      trainerLogger.info(
        `Cleaned up ${keysToDelete.length} expired cache entries`
      );
    }
  }

  /**
   * Start automatic cleanup timer
   */
  startCleanupTimer() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, CACHE_CONFIG.CLEANUP_INTERVAL_MS);
  }

  /**
   * Stop cleanup timer
   */
  stopCleanupTimer() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Estimate object size in bytes
   */
  estimateSize(obj) {
    if (obj === null || obj === undefined) return 0;

    const type = typeof obj;

    switch (type) {
      case "boolean":
        return 4;
      case "number":
        return 8;
      case "string":
        return obj.length * 2;
      case "object":
        if (obj instanceof ArrayBuffer) return obj.byteLength;
        if (obj instanceof Array) {
          return obj.reduce((size, item) => size + this.estimateSize(item), 24);
        }

        let size = 16; // Object overhead
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            size += key.length * 2 + this.estimateSize(obj[key]);
          }
        }
        return size;
      default:
        return 8;
    }
  }

  /**
   * Format byte size for display
   */
  formatSize(bytes) {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Clear all cache
   */
  clearAll() {
    this.cache.clear();
    this.cacheMetadata.clear();
    this.memoryUsage = 0;
    trainerLogger.info("All cache cleared");
  }

  /**
   * Destroy performance manager
   */
  destroy() {
    this.stopCleanupTimer();
    this.clearAll();
    this.performanceMetrics.clear();
    this.operationCounts.clear();
    this.slowOperations = [];
  }
}

// Global performance manager instance
let globalPerformanceManager = null;

export const getPerformanceManager = () => {
  if (!globalPerformanceManager) {
    globalPerformanceManager = new PerformanceManager();
  }
  return globalPerformanceManager;
};

export default PerformanceManager;
