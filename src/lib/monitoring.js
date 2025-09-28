/**
 * Production Monitoring and Analytics System for EmeraldMind
 * Provides error tracking, performance monitoring, and usage analytics
 */

import { DEV_CONFIG, isDevelopment, isProduction } from './devConfig';
import { createLogger } from './logger';

const monitoringLogger = createLogger('Monitoring');

// ===== ERROR TRACKING =====

class ErrorTracker {
  constructor() {
    this.errorQueue = [];
    this.maxQueueSize = 50;
    this.flushInterval = 30000; // 30 seconds
    this.isEnabled = isProduction || DEV_CONFIG.debugging.enableErrorOverlay;
    
    if (this.isEnabled) {
      this.startPeriodicFlush();
      this.setupGlobalErrorHandlers();
    }
  }

  track(error, context = {}, severity = 'error') {
    if (!this.isEnabled) return;

    const errorEvent = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      message: error.message || String(error),
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      severity,
      context,
      sessionId: this.getSessionId()
    };

    this.errorQueue.push(errorEvent);
    
    // Log immediately in development
    if (isDevelopment) {
      monitoringLogger.error('Error tracked', errorEvent);
    }

    // Flush immediately for critical errors
    if (severity === 'critical') {
      this.flush();
    }

    // Prevent queue overflow
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  trackComponentError(error, errorInfo, componentName) {
    this.track(error, {
      type: 'component_error',
      component: componentName,
      componentStack: errorInfo.componentStack
    }, 'error');
  }

  trackAsyncError(error, operation, metadata = {}) {
    this.track(error, {
      type: 'async_error',
      operation,
      ...metadata
    }, 'warning');
  }

  trackUserError(error, userAction, metadata = {}) {
    this.track(error, {
      type: 'user_error',
      userAction,
      ...metadata
    }, 'info');
  }

  setupGlobalErrorHandlers() {
    // Unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.track(event.error || new Error(event.message), {
        type: 'unhandled_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }, 'critical');
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.track(new Error(event.reason), {
        type: 'unhandled_rejection',
        promise: 'Promise rejection not handled'
      }, 'critical');
    });

    // React error boundary integration
    if (window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__) {
      const originalCaptureException = window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__.captureException;
      window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__.captureException = (error) => {
        this.track(error, { type: 'react_error' }, 'error');
        return originalCaptureException?.(error);
      };
    }
  }

  flush() {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    // In production, send to monitoring service
    if (isProduction) {
      this.sendToMonitoringService(errors);
    }

    monitoringLogger.debug(`Flushed ${errors.length} error(s) to monitoring service`);
  }

  async sendToMonitoringService(errors) {
    try {
      // This would integrate with services like Sentry, LogRocket, etc.
      // For now, we'll use localStorage as a fallback
      const existingErrors = JSON.parse(localStorage.getItem('emeraldmind-errors') || '[]');
      const allErrors = [...existingErrors, ...errors].slice(-100); // Keep last 100 errors
      localStorage.setItem('emeraldmind-errors', JSON.stringify(allErrors));
    } catch (error) {
      monitoringLogger.error('Failed to send errors to monitoring service', { error: error.message });
    }
  }

  startPeriodicFlush() {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('emeraldmind-session-id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('emeraldmind-session-id', sessionId);
    }
    return sessionId;
  }

  getErrorSummary() {
    const errors = JSON.parse(localStorage.getItem('emeraldmind-errors') || '[]');
    const summary = {
      total: errors.length,
      last24Hours: errors.filter(e => new Date() - new Date(e.timestamp) < 24 * 60 * 60 * 1000).length,
      bySeverity: {},
      byType: {}
    };

    errors.forEach(error => {
      summary.bySeverity[error.severity] = (summary.bySeverity[error.severity] || 0) + 1;
      summary.byType[error.context.type] = (summary.byType[error.context.type] || 0) + 1;
    });

    return summary;
  }
}

// ===== PERFORMANCE MONITORING =====

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.isEnabled = DEV_CONFIG.performance.enableMetrics;
    
    if (this.isEnabled) {
      this.setupPerformanceObserver();
      this.trackInitialLoad();
    }
  }

  trackMetric(name, value, tags = {}) {
    if (!this.isEnabled) return;

    const metric = {
      name,
      value,
      timestamp: performance.now(),
      tags,
      sessionId: errorTracker.getSessionId()
    };

    this.metrics.set(`${name}_${Date.now()}`, metric);
    
    if (isDevelopment) {
      monitoringLogger.debug(`Performance metric: ${name}`, { value, tags });
    }

    // Keep only recent metrics
    if (this.metrics.size > 1000) {
      const oldestKey = this.metrics.keys().next().value;
      this.metrics.delete(oldestKey);
    }
  }

  trackComponentRender(componentName, renderTime) {
    this.trackMetric('component_render_time', renderTime, {
      component: componentName,
      slow: renderTime > DEV_CONFIG.performance.slowComponentThreshold
    });
  }

  trackApiCall(endpoint, method, duration, success) {
    this.trackMetric('api_call_duration', duration, {
      endpoint,
      method,
      success: success.toString()
    });
  }

  trackUserAction(action, duration = null) {
    this.trackMetric('user_action', duration || performance.now(), {
      action,
      type: 'interaction'
    });
  }

  trackPageLoad(route) {
    const loadTime = performance.now();
    this.trackMetric('page_load_time', loadTime, {
      route,
      type: 'navigation'
    });
  }

  trackInitialLoad() {
    if (typeof window !== 'undefined' && window.performance) {
      const perfData = window.performance.timing;
      const pageLoad = perfData.loadEventEnd - perfData.navigationStart;
      const domReady = perfData.domContentLoadedEventEnd - perfData.navigationStart;
      
      this.trackMetric('initial_page_load', pageLoad, { type: 'initial_load' });
      this.trackMetric('dom_ready', domReady, { type: 'initial_load' });
    }
  }

  setupPerformanceObserver() {
    if (typeof PerformanceObserver !== 'undefined') {
      // Track long tasks
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) {
              this.trackMetric('long_task', entry.duration, {
                name: entry.name,
                type: 'performance_issue'
              });
            }
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long task observer not supported
      }

      // Track largest contentful paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.trackMetric('largest_contentful_paint', lastEntry.renderTime || lastEntry.loadTime, {
            type: 'core_web_vital'
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP observer not supported
      }
    }
  }

  getPerformanceSummary() {
    const metrics = Array.from(this.metrics.values());
    const summary = {
      totalMetrics: metrics.length,
      averageRenderTime: 0,
      slowComponents: 0,
      totalApiCalls: 0,
      averageApiTime: 0
    };

    const renderTimes = metrics.filter(m => m.name === 'component_render_time');
    if (renderTimes.length > 0) {
      summary.averageRenderTime = renderTimes.reduce((sum, m) => sum + m.value, 0) / renderTimes.length;
      summary.slowComponents = renderTimes.filter(m => m.tags.slow === true).length;
    }

    const apiCalls = metrics.filter(m => m.name === 'api_call_duration');
    if (apiCalls.length > 0) {
      summary.totalApiCalls = apiCalls.length;
      summary.averageApiTime = apiCalls.reduce((sum, m) => sum + m.value, 0) / apiCalls.length;
    }

    return summary;
  }
}

// ===== USAGE ANALYTICS =====

class UsageAnalytics {
  constructor() {
    this.events = [];
    this.isEnabled = isProduction || DEV_CONFIG.features.experimentalFeatures;
    this.flushInterval = 60000; // 1 minute
    
    if (this.isEnabled) {
      this.startPeriodicFlush();
      this.trackSession();
    }
  }

  track(event, properties = {}) {
    if (!this.isEnabled) return;

    const analyticsEvent = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        sessionId: errorTracker.getSessionId(),
        userId: this.getUserId()
      }
    };

    this.events.push(analyticsEvent);

    if (isDevelopment) {
      monitoringLogger.debug(`Analytics event: ${event}`, properties);
    }
  }

  trackPageView(route) {
    this.track('page_view', {
      route,
      referrer: document.referrer
    });
  }

  trackFeatureUsage(feature, action, metadata = {}) {
    this.track('feature_usage', {
      feature,
      action,
      ...metadata
    });
  }

  trackTrainerGeneration(method, success, metadata = {}) {
    this.track('trainer_generation', {
      method,
      success,
      ...metadata
    });
  }

  trackScriptGeneration(type, success, metadata = {}) {
    this.track('script_generation', {
      type,
      success,
      ...metadata
    });
  }

  trackSession() {
    this.track('session_start', {
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    // Track session end on page unload
    window.addEventListener('beforeunload', () => {
      this.track('session_end', {
        duration: performance.now()
      });
      this.flush();
    });
  }

  flush() {
    if (this.events.length === 0) return;

    const events = [...this.events];
    this.events = [];

    // In production, send to analytics service
    if (isProduction) {
      this.sendToAnalyticsService(events);
    }

    monitoringLogger.debug(`Flushed ${events.length} analytics event(s)`);
  }

  async sendToAnalyticsService(events) {
    try {
      // This would integrate with services like Google Analytics, Mixpanel, etc.
      // For now, we'll use localStorage as a fallback
      const existingEvents = JSON.parse(localStorage.getItem('emeraldmind-analytics') || '[]');
      const allEvents = [...existingEvents, ...events].slice(-500); // Keep last 500 events
      localStorage.setItem('emeraldmind-analytics', JSON.stringify(allEvents));
    } catch (error) {
      monitoringLogger.error('Failed to send events to analytics service', { error: error.message });
    }
  }

  startPeriodicFlush() {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  getUserId() {
    // Get user ID from your user context/state
    try {
      const userData = JSON.parse(localStorage.getItem('emeraldmind-user-data') || '{}');
      return userData.currentUser?.id || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  getUsageSummary() {
    const events = JSON.parse(localStorage.getItem('emeraldmind-analytics') || '[]');
    const summary = {
      totalEvents: events.length,
      uniqueFeatures: new Set(events.filter(e => e.event === 'feature_usage').map(e => e.properties.feature)).size,
      trainerGenerations: events.filter(e => e.event === 'trainer_generation').length,
      scriptGenerations: events.filter(e => e.event === 'script_generation').length,
      pageViews: events.filter(e => e.event === 'page_view').length
    };

    return summary;
  }
}

// ===== INITIALIZATION =====

export const errorTracker = new ErrorTracker();
export const performanceMonitor = new PerformanceMonitor();
export const usageAnalytics = new UsageAnalytics();

// ===== REACT HOOKS =====

import { useCallback } from 'react';

export const useErrorTracking = (componentName) => {
  const trackError = useCallback((error, context = {}) => {
    errorTracker.track(error, { ...context, component: componentName });
  }, [componentName]);

  return { trackError };
};

export const usePerformanceTracking = (componentName) => {
  const trackRender = useCallback((renderTime) => {
    performanceMonitor.trackComponentRender(componentName, renderTime);
  }, [componentName]);

  const trackAction = useCallback((action, duration) => {
    performanceMonitor.trackUserAction(`${componentName}:${action}`, duration);
  }, [componentName]);

  return { trackRender, trackAction };
};

export const useAnalytics = () => {
  const trackEvent = useCallback((event, properties) => {
    usageAnalytics.track(event, properties);
  }, []);

  const trackFeature = useCallback((feature, action, metadata) => {
    usageAnalytics.trackFeatureUsage(feature, action, metadata);
  }, []);

  return { trackEvent, trackFeature };
};

// ===== MONITORING DASHBOARD COMPONENT =====

export const MonitoringDashboard = () => {
  if (!isDevelopment && !DEV_CONFIG.features.debugUI) return null;

  const errorSummary = errorTracker.getErrorSummary();
  const perfSummary = performanceMonitor.getPerformanceSummary();
  const usageSummary = usageAnalytics.getUsageSummary();

  return (
    <div className="fixed top-4 left-4 z-50 bg-black/90 text-white p-4 rounded text-xs font-mono max-w-sm">
      <h3 className="font-bold mb-2">Monitoring Dashboard</h3>
      
      <div className="mb-2">
        <div className="text-red-400">Errors: {errorSummary.total} (24h: {errorSummary.last24Hours})</div>
        <div className="text-blue-400">Avg Render: {perfSummary.averageRenderTime?.toFixed(2)}ms</div>
        <div className="text-green-400">Features Used: {usageSummary.uniqueFeatures}</div>
      </div>
      
      <div className="text-xs opacity-75">
        Session: {errorTracker.getSessionId().slice(-8)}
      </div>
    </div>
  );
};

export default {
  errorTracker,
  performanceMonitor,
  usageAnalytics,
  useErrorTracking,
  usePerformanceTracking,
  useAnalytics,
  MonitoringDashboard
};