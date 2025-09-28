/**
 * Error handling utilities for EmeraldMind
 */

import { ERROR_TYPES, errorLogger } from "./errorConstants.js";

/**
 * Handle async errors with context
 */
export const handleAsyncError = (
  error,
  context = "Unknown",
  errorType = ERROR_TYPES.UNKNOWN
) => {
  const errorId = `async_error_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  errorLogger.error("Async operation failed", {
    errorId,
    context,
    errorType,
    message: error?.message || "Unknown error",
    stack: error?.stack,
  });

  return {
    success: false,
    error: error?.message || "Operation failed",
    errorId,
    errorType,
  };
};

/**
 * Wrap async functions with error handling
 */
export const withErrorHandling = (asyncFn, context = "Operation") => {
  return async (...args) => {
    try {
      const result = await asyncFn(...args);
      return { success: true, data: result };
    } catch (error) {
      return handleAsyncError(error, context);
    }
  };
};

/**
 * Hook for error handling in components
 */
export const useErrorHandler = (context = "Component") => {
  return (error) => handleAsyncError(error, context);
};
