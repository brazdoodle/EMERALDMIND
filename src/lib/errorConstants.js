/**
 * Error constants and types for EmeraldMind
 */

// Error types for better categorization
export const ERROR_TYPES = {
  NETWORK: "network",
  VALIDATION: "validation",
  GENERATION: "generation",
  STORAGE: "storage",
  PARSING: "parsing",
  UNKNOWN: "unknown",
};

// Simple logger fallback (only warn and error allowed by eslint)
export const errorLogger = {
  error: (...args) => console.error("[ErrorBoundary]", ...args),
  warn: (...args) => console.warn("[ErrorBoundary]", ...args),
};
