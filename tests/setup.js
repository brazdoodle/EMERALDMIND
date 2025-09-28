/**
 * Test Setup Configuration for EmeraldMind
 * Sets up the testing environment with mocks, utilities, and global configurations
 */

import { cleanup, render } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

// ===== CLEANUP =====

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ===== GLOBAL MOCKS =====

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
});

// Mock fetch
global.fetch = vi.fn();

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.performance
Object.defineProperty(window, "performance", {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    getEntriesByType: vi.fn(() => []),
  },
});

// Mock console methods in tests to reduce noise
if (process.env.NODE_ENV === "test") {
  global.console = {
    ...console,
    // Uncomment the next lines to suppress console output in tests
    // log: vi.fn(),
    // debug: vi.fn(),
    // info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

// ===== ENVIRONMENT VARIABLES =====

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.VITE_API_BASE_URL = "http://localhost:3000";
process.env.VITE_OLLAMA_BASE_URL = "http://localhost:11434";

// ===== TEST UTILITIES =====

// Custom render function for React components with providers
import { UserProvider } from "@/contexts/UserContext";
import { AppProvider } from "@/lib/appState";
import { ErrorBoundary } from "@/lib/errorBoundary";

export const renderWithProviders = (ui, options = {}) => {
  const AllTheProviders = ({ children }) => {
    return (
      <ErrorBoundary>
        <UserProvider>
          <AppProvider>{children}</AppProvider>
        </UserProvider>
      </ErrorBoundary>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Mock implementations for commonly used modules
vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    trace: vi.fn(),
    group: vi.fn(),
    groupEnd: vi.fn(),
    time: vi.fn(),
    timeEnd: vi.fn(),
  })),
  appLogger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  trainerLogger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock monitoring and analytics in tests
vi.mock("@/lib/monitoring", () => ({
  errorTracker: {
    track: vi.fn(),
    trackComponentError: vi.fn(),
    trackAsyncError: vi.fn(),
    getSessionId: vi.fn(() => "test-session-id"),
  },
  performanceMonitor: {
    trackMetric: vi.fn(),
    trackComponentRender: vi.fn(),
    trackApiCall: vi.fn(),
  },
  usageAnalytics: {
    track: vi.fn(),
    trackPageView: vi.fn(),
    trackFeatureUsage: vi.fn(),
  },
  useErrorTracking: vi.fn(() => ({ trackError: vi.fn() })),
  usePerformanceTracking: vi.fn(() => ({
    trackRender: vi.fn(),
    trackAction: vi.fn(),
  })),
  useAnalytics: vi.fn(() => ({ trackEvent: vi.fn(), trackFeature: vi.fn() })),
}));

// ===== TEST DATA FACTORIES =====

export const createMockUser = (overrides = {}) => ({
  id: "test-user-id",
  name: "Test User",
  tagline: "Test ROM Hacking Enthusiast",
  avatar: {
    type: "letter",
    value: "T",
    backgroundColor: "from-emerald-500 to-teal-500",
  },
  settings: {
    theme: "dark",
    expertMode: true,
    notifications: true,
  },
  createdAt: new Date().toISOString(),
  lastActive: new Date().toISOString(),
  ...overrides,
});

export const createMockTrainer = (overrides = {}) => ({
  id: "test-trainer-id",
  trainer_name: "Test Trainer",
  trainer_class: "YOUNGSTER",
  party: [
    {
      species: "Rattata",
      level: 15,
      types: ["Normal"],
      dex_number: 19,
      role: "Physical Attacker",
      moves: ["Tackle", "Tail Whip"],
    },
  ],
  level_min: 10,
  level_max: 20,
  biomes: ["Grassland"],
  theme: "Normal",
  difficulty: "Easy",
  notes: "Test trainer for unit tests",
  created_date: new Date().toISOString(),
  ...overrides,
});

export const createMockProject = (overrides = {}) => ({
  id: "test-project-id",
  name: "Test Project",
  description: "A test ROM hacking project",
  created_date: new Date().toISOString(),
  last_modified: new Date().toISOString(),
  ...overrides,
});

// ===== ASYNC UTILITIES =====

export const waitForAsync = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

export const mockApiResponse = (data, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  });
};

export const mockApiError = (message = "API Error", _status = 500) => {
  return Promise.reject(new Error(message));
};

// ===== GLOBAL TEST SETUP/TEARDOWN =====

beforeAll(() => {
  // Global setup before all tests
});

afterAll(() => {
  // Global cleanup after all tests
});

// ===== EXPORTS =====

// Re-export testing utilities
export * from "@testing-library/react";
export * from "@testing-library/user-event";
export { vi } from "vitest";
