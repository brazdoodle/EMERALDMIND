/**
 * Development Configuration and Debugging System for EmeraldMind
 * Provides enhanced development tools and standardized configurations
 */

import { createLogger } from "./logger";

const devLogger = createLogger("DevTools");

// ===== DEVELOPMENT ENVIRONMENT DETECTION =====

export const isDevelopment = process.env.NODE_ENV === "development";
export const isProduction = process.env.NODE_ENV === "production";
export const isTest = process.env.NODE_ENV === "test";

// ===== DEVELOPMENT CONFIGURATION =====

export const DEV_CONFIG = {
  // API Configuration
  api: {
    baseUrl: process.env.VITE_API_BASE_URL || "http://localhost:3000",
    timeout: parseInt(process.env.VITE_API_TIMEOUT) || 10000,
    retryAttempts: parseInt(process.env.VITE_API_RETRY_ATTEMPTS) || 3,
    mockApi: process.env.VITE_MOCK_API === "true",
  },

  // Ollama Configuration
  ollama: {
    baseUrl: process.env.VITE_OLLAMA_BASE_URL || "http://localhost:11434",
    defaultModel: process.env.VITE_OLLAMA_DEFAULT_MODEL || "llama3.2:3b",
    timeout: parseInt(process.env.VITE_OLLAMA_TIMEOUT) || 30000,
    enableStreaming: process.env.VITE_OLLAMA_STREAMING !== "false",
  },

  // Performance Configuration
  performance: {
    enableMetrics: isDevelopment || process.env.VITE_ENABLE_METRICS === "true",
    logSlowComponents: isDevelopment,
    slowComponentThreshold: parseInt(process.env.VITE_SLOW_COMPONENT_MS) || 16,
    enableBundleAnalysis: process.env.VITE_ANALYZE_BUNDLE === "true",
  },

  // Debugging Configuration
  debugging: {
    enableConsoleLoggers: isDevelopment,
    enableReactDevTools: isDevelopment,
    logLevel: process.env.VITE_LOG_LEVEL || "info",
    enableErrorOverlay: isDevelopment,
    enableHotReload: isDevelopment,
  },

  // Feature Flags
  features: {
    experimentalFeatures: process.env.VITE_EXPERIMENTAL_FEATURES === "true",
    betaFeatures: process.env.VITE_BETA_FEATURES === "true",
    debugUI: isDevelopment || process.env.VITE_DEBUG_UI === "true",
  },
};

// ===== DEVELOPMENT UTILITIES =====

// Enhanced console wrapper with better formatting
export const devConsole = {
  group: (label, ...args) => {
    if (isDevelopment) {
      console.group(`[DEBUG] ${label}`, ...args);
    }
  },

  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },

  table: (data, columns) => {
    if (isDevelopment) {
      console.table(data, columns);
    }
  },

  time: (label) => {
    if (isDevelopment) {
      console.time(`⏱️ ${label}`);
    }
  },

  timeEnd: (label) => {
    if (isDevelopment) {
      console.timeEnd(`⏱️ ${label}`);
    }
  },

  trace: (label, ...args) => {
    if (isDevelopment) {
      console.trace(`[TRACE] ${label}`, ...args);
    }
  },
};

// Component performance tracker
export const trackComponentPerformance = (componentName) => {
  if (!DEV_CONFIG.performance.logSlowComponents) return;

  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    if (renderTime > DEV_CONFIG.performance.slowComponentThreshold) {
      devLogger.warn(`Slow component render: ${componentName}`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        threshold: `${DEV_CONFIG.performance.slowComponentThreshold}ms`,
      });
    }
  };
};

// API call debugger
export const debugApiCall = (
  method,
  url,
  data = null,
  response = null,
  error = null
) => {
  if (!isDevelopment) return;

  devConsole.group(`API ${method.toUpperCase()} ${url}`);

  if (data) {
    console.log("📤 Request Data:", data);
  }

  if (response) {
    console.log("📥 Response:", response);
  }

  if (error) {
    console.error("[ERROR] Error:", error);
  }

  devConsole.timeEnd(`API ${method} ${url}`);
  devConsole.groupEnd();
};

// State change debugger
export const debugStateChange = (
  componentName,
  prevState,
  nextState,
  action = null
) => {
  if (!isDevelopment) return;

  devConsole.group(`State Change: ${componentName}`);

  if (action) {
    console.log("[DEBUG] Action:", action);
  }

  console.log("⬅️ Previous State:", prevState);
  console.log("➡️ Next State:", nextState);

  // Show diff for complex objects
  if (typeof prevState === "object" && typeof nextState === "object") {
    const changedKeys = Object.keys(nextState).filter(
      (key) => JSON.stringify(prevState[key]) !== JSON.stringify(nextState[key])
    );

    if (changedKeys.length > 0) {
      console.log("🔄 Changed Keys:", changedKeys);
      changedKeys.forEach((key) => {
        console.log(`  ${key}:`, prevState[key], "→", nextState[key]);
      });
    }
  }

  devConsole.groupEnd();
};

// ===== DEVELOPMENT HOOKS =====

import { useEffect, useRef, useState } from "react";

// Hook for debugging component lifecycle
export const useComponentLifecycle = (componentName) => {
  const mountTime = useRef(Date.now());
  const renderCount = useRef(0);

  useEffect(() => {
    devLogger.debug(`${componentName} mounted`, {
      mountTime: new Date(mountTime.current).toISOString(),
    });

    return () => {
      const lifespan = Date.now() - mountTime.current;
      devLogger.debug(`${componentName} unmounted`, {
        lifespan: `${lifespan}ms`,
        renderCount: renderCount.current,
      });
    };
  }, [componentName]);

  useEffect(() => {
    renderCount.current++;
    if (isDevelopment && renderCount.current > 10) {
      devLogger.warn(
        `${componentName} has rendered ${renderCount.current} times`,
        {
          possibleIssue: "Consider memoization or dependency optimization",
        }
      );
    }
  });

  return {
    renderCount: renderCount.current,
    lifespan: Date.now() - mountTime.current,
  };
};

// Hook for debugging prop changes
export const useDebugProps = (componentName, props) => {
  const prevProps = useRef(props);

  useEffect(() => {
    if (isDevelopment) {
      const changedProps = Object.keys(props).filter(
        (key) => prevProps.current[key] !== props[key]
      );

      if (changedProps.length > 0) {
        devConsole.group(`Props Changed: ${componentName}`);
        changedProps.forEach((key) => {
          console.log(`${key}:`, prevProps.current[key], "→", props[key]);
        });
        devConsole.groupEnd();
      }
    }

    prevProps.current = props;
  });
};

// Hook for debugging async operations
export const useDebugAsync = (operationName) => {
  const [operations, setOperations] = useState(new Map());

  const startOperation = (id, metadata = {}) => {
    if (!isDevelopment) return;

    const operation = {
      id,
      startTime: Date.now(),
      metadata,
    };

    setOperations((prev) => new Map(prev).set(id, operation));
    devLogger.debug(`Async operation started: ${operationName}`, {
      id,
      ...metadata,
    });
  };

  const endOperation = (id, result = null, error = null) => {
    if (!isDevelopment) return;

    const operation = operations.get(id);
    if (operation) {
      const duration = Date.now() - operation.startTime;

      devLogger.debug(`Async operation completed: ${operationName}`, {
        id,
        duration: `${duration}ms`,
        success: !error,
        result: result ? "Success" : "No result",
        error: error?.message,
      });

      setOperations((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return { startOperation, endOperation, activeOperations: operations.size };
};

// ===== DEVELOPMENT UI COMPONENTS =====

export const DevTools = () => {
  if (!isDevelopment || !DEV_CONFIG.features.debugUI) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-2 rounded text-xs font-mono">
      <div>ENV: {process.env.NODE_ENV}</div>
      <div>Build: {import.meta.env.MODE}</div>
      {DEV_CONFIG.performance.enableMetrics && <div>Metrics: ON</div>}
    </div>
  );
};

// ===== CONFIGURATION VALIDATION =====

export const validateConfiguration = () => {
  const issues = [];

  // Check required environment variables
  if (!process.env.NODE_ENV) {
    issues.push("NODE_ENV is not set");
  }

  // Check API configuration
  if (DEV_CONFIG.api.baseUrl.includes("localhost") && isProduction) {
    issues.push("API base URL points to localhost in production");
  }

  // Check Ollama configuration
  if (DEV_CONFIG.ollama.baseUrl.includes("localhost") && isProduction) {
    issues.push("Ollama base URL points to localhost in production");
  }

  if (issues.length > 0) {
    devLogger.warn("Configuration issues detected", { issues });
  }

  return issues;
};

// ===== EXPORTS =====

export default {
  DEV_CONFIG,
  devConsole,
  trackComponentPerformance,
  debugApiCall,
  debugStateChange,
  useComponentLifecycle,
  useDebugProps,
  useDebugAsync,
  DevTools,
  validateConfiguration,
  isDevelopment,
  isProduction,
  isTest,
};
