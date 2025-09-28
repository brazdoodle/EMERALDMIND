/**
 * Consistency Tracker - Monitor and track LLM consistency metrics
 * Provides insights into success rates, validation patterns, and model performance
 */

/**
 * Consistency metrics tracking system
 */
export class ConsistencyTracker {
  constructor() {
    this.metrics = {
      attempts: [],          // All generation attempts
      successes: [],         // Successful generations
      failures: [],          // Failed generations  
      repairs: [],           // Auto-repair events
      modelStats: {},        // Per-model statistics
      taskStats: {},         // Per-task statistics
      validationStats: {},   // Validation pattern statistics
    };
    
    this.sessionStart = Date.now();
    this.enabled = true;
  }

  /**
   * Record a generation attempt
   * @param {Object} attempt - Attempt details
   */
  recordAttempt(attempt) {
    if (!this.enabled) return;

    const timestamp = Date.now();
    const record = {
      id: `${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
      sessionTime: timestamp - this.sessionStart,
      ...attempt
    };

    this.metrics.attempts.push(record);

    // Update model stats
    if (attempt.model) {
      if (!this.metrics.modelStats[attempt.model]) {
        this.metrics.modelStats[attempt.model] = {
          attempts: 0,
          successes: 0,
          failures: 0,
          repairs: 0,
          avgAttempts: 0,
          avgDuration: 0,
          totalDuration: 0,
          validationErrors: [],
          lastUsed: timestamp
        };
      }
      this.metrics.modelStats[attempt.model].attempts++;
      this.metrics.modelStats[attempt.model].lastUsed = timestamp;
      
      if (attempt.duration) {
        this.metrics.modelStats[attempt.model].totalDuration += attempt.duration;
        this.metrics.modelStats[attempt.model].avgDuration = 
          this.metrics.modelStats[attempt.model].totalDuration / 
          this.metrics.modelStats[attempt.model].attempts;
      }
    }

    // Update task stats
    if (attempt.taskType) {
      if (!this.metrics.taskStats[attempt.taskType]) {
        this.metrics.taskStats[attempt.taskType] = {
          attempts: 0,
          successes: 0,
          failures: 0,
          repairs: 0,
          avgAttempts: 0,
          commonErrors: {},
          lastUsed: timestamp
        };
      }
      this.metrics.taskStats[attempt.taskType].attempts++;
      this.metrics.taskStats[attempt.taskType].lastUsed = timestamp;
    }

    // Keep only last 1000 attempts to prevent memory growth
    if (this.metrics.attempts.length > 1000) {
      this.metrics.attempts = this.metrics.attempts.slice(-1000);
    }
  }

  /**
   * Record a successful generation
   * @param {Object} success - Success details
   */
  recordSuccess(success) {
    if (!this.enabled) return;

    const record = {
      id: success.attemptId,
      timestamp: Date.now(),
      ...success
    };

    this.metrics.successes.push(record);

    // Update stats
    if (success.model && this.metrics.modelStats[success.model]) {
      this.metrics.modelStats[success.model].successes++;
    }

    if (success.taskType && this.metrics.taskStats[success.taskType]) {
      this.metrics.taskStats[success.taskType].successes++;
    }

    // Keep only last 500 successes
    if (this.metrics.successes.length > 500) {
      this.metrics.successes = this.metrics.successes.slice(-500);
    }
  }

  /**
   * Record a failed generation
   * @param {Object} failure - Failure details
   */
  recordFailure(failure) {
    if (!this.enabled) return;

    const record = {
      id: failure.attemptId,
      timestamp: Date.now(),
      ...failure
    };

    this.metrics.failures.push(record);

    // Update stats
    if (failure.model && this.metrics.modelStats[failure.model]) {
      this.metrics.modelStats[failure.model].failures++;
    }

    if (failure.taskType && this.metrics.taskStats[failure.taskType]) {
      this.metrics.taskStats[failure.taskType].failures++;
      
      // Track common errors
      if (failure.error) {
        const errorKey = failure.error.substring(0, 100); // Truncate long errors
        if (!this.metrics.taskStats[failure.taskType].commonErrors[errorKey]) {
          this.metrics.taskStats[failure.taskType].commonErrors[errorKey] = 0;
        }
        this.metrics.taskStats[failure.taskType].commonErrors[errorKey]++;
      }
    }

    // Track validation errors
    if (failure.validationErrors && failure.model) {
      if (this.metrics.modelStats[failure.model]) {
        this.metrics.modelStats[failure.model].validationErrors.push(...failure.validationErrors);
        // Keep only last 50 validation errors per model
        if (this.metrics.modelStats[failure.model].validationErrors.length > 50) {
          this.metrics.modelStats[failure.model].validationErrors = 
            this.metrics.modelStats[failure.model].validationErrors.slice(-50);
        }
      }
    }

    // Keep only last 500 failures
    if (this.metrics.failures.length > 500) {
      this.metrics.failures = this.metrics.failures.slice(-500);
    }
  }

  /**
   * Record an auto-repair event
   * @param {Object} repair - Repair details
   */
  recordRepair(repair) {
    if (!this.enabled) return;

    const record = {
      id: repair.attemptId,
      timestamp: Date.now(),
      ...repair
    };

    this.metrics.repairs.push(record);

    // Update stats
    if (repair.model && this.metrics.modelStats[repair.model]) {
      this.metrics.modelStats[repair.model].repairs++;
    }

    if (repair.taskType && this.metrics.taskStats[repair.taskType]) {
      this.metrics.taskStats[repair.taskType].repairs++;
    }

    // Keep only last 200 repairs
    if (this.metrics.repairs.length > 200) {
      this.metrics.repairs = this.metrics.repairs.slice(-200);
    }
  }

  /**
   * Get comprehensive statistics
   * @returns {Object} Statistics summary
   */
  getStats() {
    const now = Date.now();
    const sessionDuration = now - this.sessionStart;
    
    // Calculate success rates
    const totalAttempts = this.metrics.attempts.length;
    const totalSuccesses = this.metrics.successes.length;
    const totalFailures = this.metrics.failures.length;
    const totalRepairs = this.metrics.repairs.length;

    const overallSuccessRate = totalAttempts > 0 ? (totalSuccesses / totalAttempts) * 100 : 0;
    const repairRate = totalFailures > 0 ? (totalRepairs / totalFailures) * 100 : 0;

    // Calculate model performance
    const modelPerformance = {};
    for (const [model, stats] of Object.entries(this.metrics.modelStats)) {
      const successRate = stats.attempts > 0 ? (stats.successes / stats.attempts) * 100 : 0;
      const repairEffectiveness = stats.failures > 0 ? (stats.repairs / stats.failures) * 100 : 0;
      
      modelPerformance[model] = {
        attempts: stats.attempts,
        successRate: Math.round(successRate * 100) / 100,
        repairEffectiveness: Math.round(repairEffectiveness * 100) / 100,
        avgDuration: Math.round(stats.avgDuration),
        lastUsed: new Date(stats.lastUsed).toISOString(),
        topValidationErrors: this.getTopErrors(stats.validationErrors, 3)
      };
    }

    // Calculate task performance
    const taskPerformance = {};
    for (const [task, stats] of Object.entries(this.metrics.taskStats)) {
      const successRate = stats.attempts > 0 ? (stats.successes / stats.attempts) * 100 : 0;
      const repairEffectiveness = stats.failures > 0 ? (stats.repairs / stats.failures) * 100 : 0;
      
      taskPerformance[task] = {
        attempts: stats.attempts,
        successRate: Math.round(successRate * 100) / 100,
        repairEffectiveness: Math.round(repairEffectiveness * 100) / 100,
        lastUsed: new Date(stats.lastUsed).toISOString(),
        commonErrors: this.getTopErrors(Object.entries(stats.commonErrors).map(([err, count]) => err), 3)
      };
    }

    // Recent activity (last hour)
    const oneHourAgo = now - (60 * 60 * 1000);
    const recentAttempts = this.metrics.attempts.filter(a => a.timestamp > oneHourAgo);
    const recentSuccesses = this.metrics.successes.filter(s => s.timestamp > oneHourAgo);

    return {
      overview: {
        sessionDuration: Math.round(sessionDuration / 1000), // seconds
        totalAttempts,
        totalSuccesses,
        totalFailures,
        totalRepairs,
        overallSuccessRate: Math.round(overallSuccessRate * 100) / 100,
        repairRate: Math.round(repairRate * 100) / 100,
        enabled: this.enabled
      },
      recentActivity: {
        lastHourAttempts: recentAttempts.length,
        lastHourSuccesses: recentSuccesses.length,
        lastHourSuccessRate: recentAttempts.length > 0 ? 
          Math.round((recentSuccesses.length / recentAttempts.length) * 10000) / 100 : 0
      },
      modelPerformance,
      taskPerformance,
      trends: this.calculateTrends()
    };
  }

  /**
   * Get top errors by frequency
   * @param {Array} errors - Error array
   * @param {number} limit - Max number to return
   * @returns {Array} Top errors
   */
  getTopErrors(errors, limit = 5) {
    if (!errors || !Array.isArray(errors)) return [];
    
    const errorCounts = {};
    errors.forEach(error => {
      const key = typeof error === 'string' ? error.substring(0, 50) : JSON.stringify(error).substring(0, 50);
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });

    return Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([error, count]) => ({ error, count }));
  }

  /**
   * Calculate performance trends
   * @returns {Object} Trend data
   */
  calculateTrends() {
    const now = Date.now();
    const intervals = [
      { name: 'last15min', duration: 15 * 60 * 1000 },
      { name: 'lastHour', duration: 60 * 60 * 1000 },
      { name: 'last6Hours', duration: 6 * 60 * 60 * 1000 }
    ];

    const trends = {};

    for (const interval of intervals) {
      const since = now - interval.duration;
      const attempts = this.metrics.attempts.filter(a => a.timestamp > since);
      const successes = this.metrics.successes.filter(s => s.timestamp > since);
      
      trends[interval.name] = {
        attempts: attempts.length,
        successes: successes.length,
        successRate: attempts.length > 0 ? 
          Math.round((successes.length / attempts.length) * 10000) / 100 : 0
      };
    }

    return trends;
  }

  /**
   * Get debug information for troubleshooting
   * @returns {Object} Debug info
   */
  getDebugInfo() {
    const recentFailures = this.metrics.failures.slice(-10);
    const recentRepairs = this.metrics.repairs.slice(-10);
    const recentAttempts = this.metrics.attempts.slice(-10);

    return {
      recentFailures: recentFailures.map(f => ({
        timestamp: new Date(f.timestamp).toISOString(),
        model: f.model,
        taskType: f.taskType,
        error: f.error,
        validationErrors: f.validationErrors
      })),
      recentRepairs: recentRepairs.map(r => ({
        timestamp: new Date(r.timestamp).toISOString(),
        model: r.model,
        taskType: r.taskType,
        repairType: r.repairType,
        successful: r.successful
      })),
      recentAttempts: recentAttempts.map(a => ({
        timestamp: new Date(a.timestamp).toISOString(),
        model: a.model,
        taskType: a.taskType,
        consistencyLevel: a.consistencyLevel,
        attempt: a.attempt,
        duration: a.duration
      })),
      memoryUsage: {
        attempts: this.metrics.attempts.length,
        successes: this.metrics.successes.length,
        failures: this.metrics.failures.length,
        repairs: this.metrics.repairs.length,
        models: Object.keys(this.metrics.modelStats).length,
        tasks: Object.keys(this.metrics.taskStats).length
      }
    };
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics = {
      attempts: [],
      successes: [],
      failures: [],
      repairs: [],
      modelStats: {},
      taskStats: {},
      validationStats: {},
    };
    this.sessionStart = Date.now();
  }

  /**
   * Enable/disable tracking
   * @param {boolean} enabled - Whether to enable tracking
   */
  setEnabled(enabled) {
    this.enabled = !!enabled;
  }

  /**
   * Export metrics for analysis
   * @returns {Object} Full metrics export
   */
  exportMetrics() {
    return {
      metadata: {
        exportTime: new Date().toISOString(),
        sessionStart: new Date(this.sessionStart).toISOString(),
        sessionDuration: Date.now() - this.sessionStart,
        version: '1.0.0'
      },
      metrics: this.metrics,
      stats: this.getStats()
    };
  }

  /**
   * Import metrics from export
   * @param {Object} exportedData - Previously exported data
   */
  importMetrics(exportedData) {
    if (!exportedData || !exportedData.metrics) {
      throw new Error('Invalid metrics export data');
    }

    this.metrics = exportedData.metrics;
    if (exportedData.metadata && exportedData.metadata.sessionStart) {
      this.sessionStart = new Date(exportedData.metadata.sessionStart).getTime();
    }
  }
}

// Global instance
let globalTracker = null;

/**
 * Get the global consistency tracker instance (singleton)
 * @returns {ConsistencyTracker} Global tracker instance
 */
export function getGlobalTracker() {
  if (!globalTracker) {
    globalTracker = new ConsistencyTracker();
  }
  return globalTracker;
}

/**
 * Create a new tracker instance
 * @returns {ConsistencyTracker} New tracker instance
 */
export function createTracker() {
  return new ConsistencyTracker();
}

/**
 * Helper function to track a generation attempt
 * @param {Object} attempt - Attempt details
 */
export function trackAttempt(attempt) {
  getGlobalTracker().recordAttempt(attempt);
}

/**
 * Helper function to track a success
 * @param {Object} success - Success details
 */
export function trackSuccess(success) {
  getGlobalTracker().recordSuccess(success);
}

/**
 * Helper function to track a failure
 * @param {Object} failure - Failure details
 */
export function trackFailure(failure) {
  getGlobalTracker().recordFailure(failure);
}

/**
 * Helper function to track a repair
 * @param {Object} repair - Repair details
 */
export function trackRepair(repair) {
  getGlobalTracker().recordRepair(repair);
}

/**
 * Get global statistics
 * @returns {Object} Global statistics
 */
export function getGlobalStats() {
  return getGlobalTracker().getStats();
}

export default {
  ConsistencyTracker,
  getGlobalTracker,
  createTracker,
  trackAttempt,
  trackSuccess,
  trackFailure,
  trackRepair,
  getGlobalStats
};