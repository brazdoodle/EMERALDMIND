/**
 * Deployment Configuration for EmeraldMind
 * Handles environment-specific settings and deployment preparation
 */

// ===== ENVIRONMENT CONFIGURATION =====

export const ENVIRONMENTS = {
  DEVELOPMENT: "development",
  STAGING: "staging",
  PRODUCTION: "production",
};

export const getCurrentEnvironment = () => {
  return process.env.NODE_ENV || ENVIRONMENTS.DEVELOPMENT;
};

// ===== DEPLOYMENT CONFIGURATIONS =====

export const DEPLOYMENT_CONFIG = {
  [ENVIRONMENTS.DEVELOPMENT]: {
    apiUrl: "http://localhost:3000",
    ollamaUrl: "http://localhost:11434",
    enableDebugTools: true,
    enableHotReload: true,
    enableSourceMaps: true,
    logLevel: "debug",
    enableAnalytics: false,
    enableErrorReporting: false,
    cacheStrategy: "no-cache",
    compressionLevel: 0,
  },

  [ENVIRONMENTS.STAGING]: {
    apiUrl:
      process.env.VITE_STAGING_API_URL || "https://staging-api.emeraldmind.dev",
    ollamaUrl:
      process.env.VITE_STAGING_OLLAMA_URL ||
      "https://staging-ollama.emeraldmind.dev",
    enableDebugTools: true,
    enableHotReload: false,
    enableSourceMaps: true,
    logLevel: "info",
    enableAnalytics: true,
    enableErrorReporting: true,
    cacheStrategy: "cache-first",
    compressionLevel: 6,
  },

  [ENVIRONMENTS.PRODUCTION]: {
    apiUrl: process.env.VITE_PROD_API_URL || "https://api.emeraldmind.dev",
    ollamaUrl:
      process.env.VITE_PROD_OLLAMA_URL || "https://ollama.emeraldmind.dev",
    enableDebugTools: false,
    enableHotReload: false,
    enableSourceMaps: false,
    logLevel: "error",
    enableAnalytics: true,
    enableErrorReporting: true,
    cacheStrategy: "cache-first",
    compressionLevel: 9,
  },
};

export const getDeploymentConfig = (environment = getCurrentEnvironment()) => {
  return (
    DEPLOYMENT_CONFIG[environment] ||
    DEPLOYMENT_CONFIG[ENVIRONMENTS.DEVELOPMENT]
  );
};

// ===== HEALTH CHECK SYSTEM =====

export class HealthChecker {
  constructor(config = getDeploymentConfig()) {
    this.config = config;
    this.checks = new Map();
    this.lastHealthCheck = null;
  }

  async runHealthCheck() {
    const results = {
      timestamp: new Date().toISOString(),
      environment: getCurrentEnvironment(),
      status: "healthy",
      checks: {},
      version: import.meta.env.VITE_APP_VERSION || "0.0.6",
    };

    try {
      // Check API connectivity
      results.checks.api = await this.checkApiHealth();

      // Check Ollama connectivity
      results.checks.ollama = await this.checkOllamaHealth();

      // Check browser compatibility
      results.checks.browser = this.checkBrowserCompatibility();

      // Check local storage
      results.checks.localStorage = this.checkLocalStorage();

      // Check memory usage
      results.checks.memory = this.checkMemoryUsage();

      // Determine overall status
      const hasFailures = Object.values(results.checks).some(
        (check) => !check.healthy
      );
      results.status = hasFailures ? "degraded" : "healthy";
    } catch (error) {
      results.status = "unhealthy";
      results.error = error.message;
    }

    this.lastHealthCheck = results;
    return results;
  }

  async checkApiHealth() {
    try {
      const response = await fetch(`${this.config.apiUrl}/health`, {
        method: "GET",
        timeout: 5000,
      });

      return {
        healthy: response.ok,
        status: response.status,
        responseTime: performance.now(),
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        responseTime: null,
      };
    }
  }

  async checkOllamaHealth() {
    try {
      const response = await fetch(`${this.config.ollamaUrl}/api/tags`, {
        method: "GET",
        timeout: 5000,
      });

      return {
        healthy: response.ok,
        status: response.status,
        responseTime: performance.now(),
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        responseTime: null,
      };
    }
  }

  checkBrowserCompatibility() {
    const features = {
      es6: typeof Symbol !== "undefined",
      fetch: typeof fetch !== "undefined",
      localStorage: typeof Storage !== "undefined",
      webgl: Boolean(document.createElement("canvas").getContext("webgl")),
      indexedDB: typeof indexedDB !== "undefined",
    };

    const unsupportedFeatures = Object.entries(features)
      .filter(([_, supported]) => !supported)
      .map(([feature]) => feature);

    return {
      healthy: unsupportedFeatures.length === 0,
      supportedFeatures: features,
      unsupportedFeatures,
    };
  }

  checkLocalStorage() {
    try {
      const testKey = "emeraldmind-health-check";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);

      return {
        healthy: true,
        available: true,
      };
    } catch (error) {
      return {
        healthy: false,
        available: false,
        error: error.message,
      };
    }
  }

  checkMemoryUsage() {
    if (performance.memory) {
      const memory = performance.memory;
      const usagePercentage =
        (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

      return {
        healthy: usagePercentage < 80,
        usedMB: Math.round(memory.usedJSHeapSize / 1048576),
        totalMB: Math.round(memory.jsHeapSizeLimit / 1048576),
        usagePercentage: Math.round(usagePercentage),
      };
    }

    return {
      healthy: true,
      supported: false,
    };
  }

  getLastHealthCheck() {
    return this.lastHealthCheck;
  }
}

// ===== DEPLOYMENT CHECKLIST =====

export const DEPLOYMENT_CHECKLIST = {
  preDeployment: [
    {
      id: "build-success",
      name: "Build completes successfully",
      description: "Ensure npm run build completes without errors",
      automated: true,
    },
    {
      id: "tests-pass",
      name: "All tests pass",
      description: "Run npm test to verify all tests pass",
      automated: true,
    },
    {
      id: "lint-clean",
      name: "No linting errors",
      description: "Run ESLint and fix all issues",
      automated: true,
    },
    {
      id: "env-vars",
      name: "Environment variables configured",
      description: "Verify all required environment variables are set",
      automated: false,
    },
    {
      id: "security-scan",
      name: "Security vulnerabilities checked",
      description: "Run npm audit and fix high/critical issues",
      automated: true,
    },
  ],

  postDeployment: [
    {
      id: "health-check",
      name: "Health check passes",
      description: "Verify all systems are operational",
      automated: true,
    },
    {
      id: "smoke-tests",
      name: "Smoke tests pass",
      description: "Run basic functionality tests",
      automated: false,
    },
    {
      id: "error-monitoring",
      name: "Error monitoring active",
      description: "Confirm error tracking is working",
      automated: false,
    },
    {
      id: "performance-baseline",
      name: "Performance within baseline",
      description: "Check key performance metrics",
      automated: false,
    },
  ],
};

// ===== DEPLOYMENT UTILITIES =====

export const validateDeployment = async (environment) => {
  const config = getDeploymentConfig(environment);
  const healthChecker = new HealthChecker(config);

  console.log(`[INFO] Validating deployment for ${environment} environment...`);

  const healthCheck = await healthChecker.runHealthCheck();

  if (healthCheck.status === "healthy") {
    console.log("[INFO] Deployment validation passed");
    return true;
  } else {
    console.error("[ERROR] Deployment validation failed:", healthCheck);
    return false;
  }
};

export const generateDeploymentReport = async (environment) => {
  const config = getDeploymentConfig(environment);
  const healthChecker = new HealthChecker(config);
  const healthCheck = await healthChecker.runHealthCheck();

  const report = {
    deployment: {
      environment,
      timestamp: new Date().toISOString(),
      version: import.meta.env.VITE_APP_VERSION || "0.0.6",
      commitHash: import.meta.env.VITE_COMMIT_HASH || "unknown",
    },
    configuration: config,
    healthCheck,
    checklist: DEPLOYMENT_CHECKLIST,
  };

  return report;
};

// ===== ENVIRONMENT VALIDATION =====

export const validateEnvironmentConfig = () => {
  const issues = [];
  const config = getDeploymentConfig();

  // Check required URLs
  if (!config.apiUrl || config.apiUrl.includes("localhost")) {
    if (getCurrentEnvironment() === ENVIRONMENTS.PRODUCTION) {
      issues.push("API URL should not be localhost in production");
    }
  }

  if (!config.ollamaUrl || config.ollamaUrl.includes("localhost")) {
    if (getCurrentEnvironment() === ENVIRONMENTS.PRODUCTION) {
      issues.push("Ollama URL should not be localhost in production");
    }
  }

  // Check security settings
  if (getCurrentEnvironment() === ENVIRONMENTS.PRODUCTION) {
    if (config.enableDebugTools) {
      issues.push("Debug tools should be disabled in production");
    }

    if (config.enableSourceMaps) {
      issues.push("Source maps should be disabled in production");
    }

    if (config.logLevel !== "error") {
      issues.push('Log level should be "error" in production');
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
};

// ===== CACHE BUSTING =====

export const generateCacheBustingHash = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${timestamp}_${random}`;
};

// ===== EXPORTS =====

export default {
  ENVIRONMENTS,
  getCurrentEnvironment,
  getDeploymentConfig,
  HealthChecker,
  DEPLOYMENT_CHECKLIST,
  validateDeployment,
  generateDeploymentReport,
  validateEnvironmentConfig,
  generateCacheBustingHash,
};
