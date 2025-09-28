/**
 * Centralized Error Boundary System for EmeraldMind
 * Simple, self-contained error handling without external dependencies
 */

import { Component } from "react";
import { errorLogger } from "./errorConstants.js";

// Base Error Boundary Component
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = this.state.errorId;

    // Log the error with context
    errorLogger.error("Component error caught", {
      errorId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context: this.props.context || "Unknown",
    });

    this.setState({
      error,
      errorInfo,
    });

    // Report to external error tracking if configured
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorId);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });

    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleGoHome = () => {
    if (this.props.onNavigateHome) {
      this.props.onNavigateHome();
    } else {
      window.location.href = "/";
    }
  };

  render() {
    if (this.state.hasError) {
      const { level = "page", showDetails = false } = this.props;

      if (level === "app") {
        return (
          <AppLevelError
            error={this.state.error}
            errorId={this.state.errorId}
            onRetry={this.handleRetry}
            onGoHome={this.handleGoHome}
            showDetails={showDetails}
          />
        );
      }

      return (
        <ComponentLevelError
          error={this.state.error}
          errorId={this.state.errorId}
          onRetry={this.handleRetry}
          context={this.props.context}
          showDetails={showDetails}
        />
      );
    }

    return this.props.children;
  }
}

// App-level error component for critical failures
const AppLevelError = ({ error, errorId, onRetry, onGoHome }) => (
  <div
    style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      color: "white",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}
  >
    <div
      style={{
        maxWidth: "400px",
        width: "100%",
        backgroundColor: "rgba(30, 41, 59, 0.8)",
        border: "1px solid #374151",
        borderRadius: "0.5rem",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "4rem",
          height: "4rem",
          backgroundColor: "rgba(239, 68, 68, 0.2)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1rem",
          fontSize: "2rem",
        }}
      >
        ⚠️
      </div>
      <h1
        style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: "bold" }}
      >
        Application Error
      </h1>
      <p style={{ margin: "0 0 1.5rem", color: "#94a3b8" }}>
        Something went wrong with EmeraldMind
      </p>

      <div
        style={{
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          borderRadius: "0.25rem",
          padding: "0.75rem",
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span>🐛</span>
        <span style={{ color: "#fca5a5" }}>Error ID: {errorId}</span>
      </div>

      <div
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          padding: "0.75rem",
          borderRadius: "0.25rem",
          fontSize: "0.75rem",
          fontFamily: "monospace",
          color: "#cbd5e1",
          maxHeight: "12rem",
          overflowY: "auto",
          marginBottom: "1rem",
          textAlign: "left",
        }}
      >
        <div>
          <strong>Error:</strong> {error?.message || "Unknown error occurred"}
        </div>
        {error?.stack && (
          <div style={{ marginTop: "0.5rem" }}>
            <strong>Stack:</strong>
            <pre
              style={{
                fontSize: "0.7rem",
                marginTop: "0.25rem",
                whiteSpace: "pre-wrap",
              }}
            >
              {error.stack}
            </pre>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          onClick={onRetry}
          style={{
            flex: 1,
            padding: "0.5rem 1rem",
            border: "1px solid #6b7280",
            backgroundColor: "transparent",
            color: "white",
            borderRadius: "0.25rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          <span>🔄</span> Retry
        </button>
        <button
          onClick={onGoHome}
          style={{
            flex: 1,
            padding: "0.5rem 1rem",
            border: "none",
            backgroundColor: "#2563eb",
            color: "white",
            borderRadius: "0.25rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          <span>🏠</span> Go Home
        </button>
      </div>
    </div>
  </div>
);

// Component-level error for localized failures
const ComponentLevelError = ({
  error,
  errorId,
  onRetry,
  context,
  showDetails = false,
}) => (
  <div
    style={{
      padding: "1rem",
      border: "1px solid rgba(239, 68, 68, 0.2)",
      backgroundColor: "rgba(239, 68, 68, 0.05)",
      borderRadius: "0.5rem",
      margin: "1rem 0",
    }}
  >
    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
      <span style={{ fontSize: "1.25rem", marginTop: "0.125rem" }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <h3
          style={{
            fontWeight: "500",
            color: "#fca5a5",
            margin: "0 0 0.25rem",
            fontSize: "0.875rem",
          }}
        >
          {context ? `${context} Error` : "Component Error"}
        </h3>
        <p
          style={{
            fontSize: "0.875rem",
            color: "rgba(248, 113, 113, 0.8)",
            margin: "0 0 0.75rem",
          }}
        >
          This component encountered an error and cannot be displayed.
        </p>

        {showDetails && (
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.3)",
              padding: "0.5rem",
              borderRadius: "0.25rem",
              fontSize: "0.75rem",
              fontFamily: "monospace",
              color: "#94a3b8",
              marginBottom: "0.75rem",
              maxHeight: "6rem",
              overflowY: "auto",
            }}
          >
            {error?.message || "Unknown error occurred"}
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.75rem",
            color: "#64748b",
          }}
        >
          <span>Error ID: {errorId}</span>
          {onRetry && (
            <>
              <span>•</span>
              <button
                onClick={onRetry}
                style={{
                  color: "#60a5fa",
                  textDecoration: "underline",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                }}
                onMouseOver={(e) => (e.target.style.color = "#93c5fd")}
                onMouseOut={(e) => (e.target.style.color = "#60a5fa")}
              >
                Try again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Specialized error boundaries for different contexts
export const TrainerErrorBoundary = ({ children, onRetry }) => (
  <ErrorBoundary
    context="Trainer Generation"
    level="component"
    onRetry={onRetry}
  >
    {children}
  </ErrorBoundary>
);

export const ScriptErrorBoundary = ({ children, onRetry }) => (
  <ErrorBoundary
    context="Script Generation"
    level="component"
    onRetry={onRetry}
  >
    {children}
  </ErrorBoundary>
);

export const ApiErrorBoundary = ({ children, onRetry }) => (
  <ErrorBoundary context="API Operation" level="component" onRetry={onRetry}>
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;
