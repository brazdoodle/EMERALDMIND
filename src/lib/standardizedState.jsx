/**
 * Standardized Loading and State Management System for EmeraldMind
 * Consolidates duplicate loading/error state patterns across components
 */

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { LOADING_STATES } from "./stateConstants.js";
import {
  useAsyncState,
  useListState,
  usePaginatedState,
} from "./stateHooks.js";

// Standardized loading component
export const LoadingSpinner = ({
  size = "default",
  text = "Loading...",
  className = "",
  variant = "default",
}) => {
  const sizeClasses = {
    small: "w-4 h-4",
    default: "w-6 h-6",
    large: "w-8 h-8",
  };

  const variants = {
    default: "text-blue-400 border-blue-400/30 border-t-blue-400",
    emerald: "text-emerald-400 border-emerald-400/30 border-t-emerald-400",
    orange: "text-orange-400 border-orange-400/30 border-t-orange-400",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div
          className={`${sizeClasses[size]} border-2 ${variants[variant]} rounded-full animate-spin mx-auto mb-2`}
        ></div>
        {text && (
          <p className="text-slate-600 dark:text-slate-400 text-sm">{text}</p>
        )}
      </div>
    </div>
  );
};

// Standardized error display component
export const ErrorDisplay = ({
  error,
  onRetry,
  title = "Something went wrong",
  className = "",
}) => {
  const errorMessage =
    typeof error === "string"
      ? error
      : error?.message || "An unexpected error occurred";

  return (
    <Alert
      className={`border-red-500/20 bg-red-500/10 ${className}`}
      variant="destructive"
    >
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <div className="font-medium mb-1">{title}</div>
          <div className="text-sm opacity-90">{errorMessage}</div>
        </div>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="ml-4 border-red-500/30 hover:bg-red-500/20"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

// Standardized async operation wrapper component
export const AsyncWrapper = ({
  state,
  onRetry,
  loadingText = "Loading...",
  errorTitle = "Something went wrong",
  emptyText = "No data available",
  children,
  className = "",
}) => {
  if (state.isLoading) {
    return (
      <div className={`py-8 ${className}`}>
        <LoadingSpinner text={loadingText} />
      </div>
    );
  }

  if (state.isError) {
    return (
      <div className={className}>
        <ErrorDisplay
          error={state.error}
          onRetry={onRetry}
          title={errorTitle}
        />
      </div>
    );
  }

  if (state.isSuccess && !state.hasData) {
    return (
      <div className={`text-center py-8 text-slate-500 ${className}`}>
        {emptyText}
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};

// Entity-specific loading components for consistent UI
export const EntityLoadingSpinner = ({ entityName, className = "" }) => (
  <LoadingSpinner
    text={`Loading ${entityName.toLowerCase()}...`}
    className={`py-12 ${className}`}
  />
);

export const EntityErrorHandler = ({
  error,
  entityName,
  onRetry,
  className = "",
}) => (
  <ErrorDisplay
    error={error}
    title={`Failed to load ${entityName.toLowerCase()}`}
    onRetry={onRetry}
    className={className}
  />
);

export default {
  useAsyncState,
  useListState,
  usePaginatedState,
  LoadingSpinner,
  ErrorDisplay,
  AsyncWrapper,
  EntityLoadingSpinner,
  EntityErrorHandler,
  LOADING_STATES,
};
