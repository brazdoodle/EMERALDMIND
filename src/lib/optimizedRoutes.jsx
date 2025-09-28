/**
 * Optimized Route System for EmeraldMind
 * Implements lazy loading, preloading, and performance monitoring for routes
 */

import { ApiErrorBoundary, ScriptErrorBoundary, TrainerErrorBoundary } from './errorBoundary.jsx';
import { createLazyComponent, OptimizedSuspense, preloadRoute } from './modernPerformance.js';
import { LoadingSpinner } from './standardizedState.jsx';

// ===== LAZY ROUTE COMPONENTS =====

// Create lazy components with enhanced error handling
export const LazyDashboard = createLazyComponent(
  () => import('../pages/Dashboard'),
  'Dashboard'
);

export const LazyTrainerArchitect = createLazyComponent(
  () => import('../pages/TrainerArchitect'),
  'TrainerArchitect'
);

export const LazyScriptSage = createLazyComponent(
  () => import('../pages/ScriptSage'),
  'ScriptSage'
);

export const LazyKnowledgeHub = createLazyComponent(
  () => import('../pages/KnowledgeHub'),
  'KnowledgeHub'
);

export const LazyNarrativeEngine = createLazyComponent(
  () => import('../pages/NarrativeEngine'),
  'NarrativeEngine'
);

export const LazyFlagForge = createLazyComponent(
  () => import('../pages/FlagForge'),
  'FlagForge'
);

export const LazyProgrammaticGenerator = createLazyComponent(
  () => import('../pages/ProgrammaticGenerator'),
  'ProgrammaticGenerator'
);

export const LazyBugCatcher = createLazyComponent(
  () => import('../pages/BugCatcher'),
  'BugCatcher'
);

// ===== PRELOADING UTILITIES =====

// Create preload functions for each route
export const routePreloaders = {
  dashboard: preloadRoute(() => import('../pages/Dashboard')),
  trainer: preloadRoute(() => import('../pages/TrainerArchitect')),
  script: preloadRoute(() => import('../pages/ScriptSage')),
  knowledge: preloadRoute(() => import('../pages/KnowledgeHub')),
  narrative: preloadRoute(() => import('../pages/NarrativeEngine')),
  flags: preloadRoute(() => import('../pages/FlagForge')),
  generator: preloadRoute(() => import('../pages/ProgrammaticGenerator')),
  bugcatcher: preloadRoute(() => import('../pages/BugCatcher'))
};

// ===== ROUTE CONFIGURATION =====

export const routes = [
  {
    path: '/',
    component: LazyDashboard,
    preloader: routePreloaders.dashboard,
    errorBoundary: null, // Uses default app-level boundary
    loadingComponent: () => <LoadingSpinner text="Loading Dashboard..." />
  },
  {
    path: '/trainer',
    component: LazyTrainerArchitect,
    preloader: routePreloaders.trainer,
    errorBoundary: TrainerErrorBoundary,
    loadingComponent: () => <LoadingSpinner text="Loading Trainer Architect..." variant="emerald" />
  },
  {
    path: '/script',
    component: LazyScriptSage,
    preloader: routePreloaders.script,
    errorBoundary: ScriptErrorBoundary,
    loadingComponent: () => <LoadingSpinner text="Loading Script Sage..." variant="orange" />
  },
  {
    path: '/knowledge',
    component: LazyKnowledgeHub,
    preloader: routePreloaders.knowledge,
    errorBoundary: ApiErrorBoundary,
    loadingComponent: () => <LoadingSpinner text="Loading Knowledge Hub..." />
  },
  {
    path: '/narrative',
    component: LazyNarrativeEngine,
    preloader: routePreloaders.narrative,
    errorBoundary: ApiErrorBoundary,
    loadingComponent: () => <LoadingSpinner text="Loading Narrative Engine..." />
  },
  {
    path: '/flags',
    component: LazyFlagForge,
    preloader: routePreloaders.flags,
    errorBoundary: ApiErrorBoundary,
    loadingComponent: () => <LoadingSpinner text="Loading Flag Forge..." />
  },
  {
    path: '/generator',
    component: LazyProgrammaticGenerator,
    preloader: routePreloaders.generator,
    errorBoundary: ApiErrorBoundary,
    loadingComponent: () => <LoadingSpinner text="Loading Generator..." />
  },
  {
    path: '/bugcatcher',
    component: LazyBugCatcher,
    preloader: routePreloaders.bugcatcher,
    errorBoundary: ApiErrorBoundary,
    loadingComponent: () => <LoadingSpinner text="Loading Bug Catcher..." />
  }
];

// ===== OPTIMIZED ROUTE WRAPPER =====

export const OptimizedRoute = ({ route, ...props }) => {
  const { 
    component: Component, 
    errorBoundary: ErrorBoundary, 
    loadingComponent: LoadingComponent 
  } = route;

  const routeContent = (
    <OptimizedSuspense 
      fallback={LoadingComponent ? <LoadingComponent /> : <LoadingSpinner />}
      minLoadingTime={150} // Prevent flash for very fast loads
    >
      <Component {...props} />
    </OptimizedSuspense>
  );

  // Wrap with error boundary if specified
  if (ErrorBoundary) {
    return (
      <ErrorBoundary>
        {routeContent}
      </ErrorBoundary>
    );
  }

  return routeContent;
};

// ===== NAVIGATION HELPERS =====

// Preload routes on hover/focus for better UX
export const useRoutePreloading = () => {
  const preloadRoute = (routeName) => {
    const preloader = routePreloaders[routeName];
    if (preloader) {
      preloader.preload();
    }
  };

  const getPreloadProps = (routeName) => ({
    onMouseEnter: () => preloadRoute(routeName),
    onFocus: () => preloadRoute(routeName),
    onTouchStart: () => preloadRoute(routeName)
  });

  return { preloadRoute, getPreloadProps };
};

// Critical route preloader - preload essential routes on app start
export const preloadCriticalRoutes = () => {
  // Preload dashboard and trainer architect as they're most commonly used
  routePreloaders.dashboard.preload();
  routePreloaders.trainer.preload();
};

export default {
  routes,
  OptimizedRoute,
  useRoutePreloading,
  preloadCriticalRoutes,
  routePreloaders
};