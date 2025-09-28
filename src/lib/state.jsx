// Global State Management with Context + Reducer Pattern
import { saveProjectData } from "@/utils/projectFileSystem";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";

// Helper to get the current user id from persisted user data
function getActiveUserId() {
  try {
    const stored = localStorage.getItem("emeraldmind-user-data");
    if (!stored) return "default-user";
    const parsed = JSON.parse(stored);
    return parsed?.currentUser?.id || "default-user";
  } catch (_e) {
    return "default-user";
  }
}

// Action types
const APP_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  UPDATE_USER_PREFERENCES: "UPDATE_USER_PREFERENCES",
  ADD_TO_CACHE: "ADD_TO_CACHE",
  CLEAR_CACHE: "CLEAR_CACHE",
  SET_OLLAMA_STATUS: "SET_OLLAMA_STATUS",
  UPDATE_PROJECT_DATA: "UPDATE_PROJECT_DATA",
  ADD_SCRIPT: "ADD_SCRIPT",
  UPDATE_SCRIPT: "UPDATE_SCRIPT",
  DELETE_SCRIPT: "DELETE_SCRIPT",
  SET_ACTIVE_SCRIPT: "SET_ACTIVE_SCRIPT",
  SET_ACTIVE_PROJECT: "SET_ACTIVE_PROJECT",
  SET_DASHBOARD_PROJECTS: "SET_DASHBOARD_PROJECTS",
  SET_CURRENT_PROJECT: "SET_CURRENT_PROJECT",
  SYNC_PROJECT_FROM_DASHBOARD: "SYNC_PROJECT_FROM_DASHBOARD",
  LOAD_PROJECT_DATA: "LOAD_PROJECT_DATA",
  CLEAR_PROJECT_DATA: "CLEAR_PROJECT_DATA",
};

// Initial state
const initialState = {
  loading: {},
  errors: {},
  userPreferences: {
    theme: "dark",
    aiTimeout: 30000,
    cacheEnabled: true,
    autoSave: true,
  },
  cache: new Map(),
  ollamaStatus: "checking",
  projectData: {
    flags: [],
    trainers: [],
    scripts: [],
    knowledge: [],
  },
  activeProjectId: null,
  activeScript: null,
  projects: [],
  // Dashboard project integration
  dashboardProjects: [],
  currentProject: null,
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case APP_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, [action.key]: action.value },
      };

    case APP_ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: { ...state.errors, [action.key]: action.error },
      };

    case APP_ACTIONS.CLEAR_ERROR:
      const { [action.key]: removed, ...remainingErrors } = state.errors;
      return { ...state, errors: remainingErrors };

    case APP_ACTIONS.UPDATE_USER_PREFERENCES:
      return {
        ...state,
        userPreferences: { ...state.userPreferences, ...action.preferences },
      };

    case APP_ACTIONS.ADD_TO_CACHE:
      const newCache = new Map(state.cache);
      newCache.set(action.key, { data: action.data, timestamp: Date.now() });
      return { ...state, cache: newCache };

    case APP_ACTIONS.CLEAR_CACHE:
      return { ...state, cache: new Map() };

    case APP_ACTIONS.SET_OLLAMA_STATUS:
      return { ...state, ollamaStatus: action.status };

    case APP_ACTIONS.UPDATE_PROJECT_DATA:
      return {
        ...state,
        projectData: { ...state.projectData, ...action.data },
      };

    case APP_ACTIONS.ADD_SCRIPT:
      // Save script to project file system (use active user id)
      if (action.projectId && action.script) {
        const userId = getActiveUserId();
        saveProjectData(
          userId,
          action.projectId,
          "scripts",
          action.script.name || action.script.id,
          action.script
        );
      }

      const updatedProjects = state.projects.map((project) => {
        if (project.id === action.projectId) {
          return {
            ...project,
            scripts: [...(project.scripts || []), action.script],
          };
        }
        return project;
      });

      // If project doesn't exist, create it
      if (!updatedProjects.find((p) => p.id === action.projectId)) {
        updatedProjects.push({
          id: action.projectId,
          name: `Project ${action.projectId}`,
          scripts: [action.script],
          createdAt: new Date().toISOString(),
        });
      }

      return { ...state, projects: updatedProjects };

    case APP_ACTIONS.UPDATE_SCRIPT:
      // Save updated script to project file system
      {
        const targetProjectId = action.projectId || state.activeProjectId;
        if (targetProjectId && action.updates) {
          const currentProject = state.projects.find(
            (p) => p.id === targetProjectId
          );
          const script = currentProject?.scripts?.find(
            (s) => s.id === action.scriptId
          );
          if (script) {
            const updatedScript = { ...script, ...action.updates };
            const userId = getActiveUserId();
            saveProjectData(
              userId,
              targetProjectId,
              "scripts",
              updatedScript.name || updatedScript.id,
              updatedScript
            );
          }
        }
      }

      return {
        ...state,
        projects: state.projects.map((project) => ({
          ...project,
          scripts:
            project.scripts?.map((script) =>
              script.id === action.scriptId
                ? { ...script, ...action.updates }
                : script
            ) || [],
        })),
      };

    case APP_ACTIONS.DELETE_SCRIPT:
      return {
        ...state,
        projects: state.projects.map((project) => ({
          ...project,
          scripts:
            project.scripts?.filter(
              (script) => script.id !== action.scriptId
            ) || [],
        })),
      };

    case APP_ACTIONS.SET_ACTIVE_SCRIPT:
      return { ...state, activeScript: action.scriptId };

    case APP_ACTIONS.SET_ACTIVE_PROJECT:
      return { ...state, activeProjectId: action.projectId };

    case APP_ACTIONS.SET_DASHBOARD_PROJECTS:
      return { ...state, dashboardProjects: action.projects };

    case APP_ACTIONS.SET_CURRENT_PROJECT:
      return {
        ...state,
        currentProject: action.project,
        activeProjectId: action.project?.id || null,
      };

    case APP_ACTIONS.SYNC_PROJECT_FROM_DASHBOARD:
      // Sync the current dashboard project to be the active project for all pages
      return {
        ...state,
        activeProjectId: state.currentProject?.id || null,
      };

    case APP_ACTIONS.LOAD_PROJECT_DATA:
      // Load project data from file system when switching projects
      if (action.projectId) {
        // This would typically load all saved data for the project
        // For now, we'll just mark that the project is loaded
        return {
          ...state,
          projectLoaded: action.projectId,
          loadedAt: new Date().toISOString(),
        };
      }
      return state;

    case APP_ACTIONS.CLEAR_PROJECT_DATA:
      // Clear all project data when switching users for proper isolation
      return {
        ...state,
        currentProject: null,
        activeProjectId: null,
        activeScript: null,
        dashboardProjects: [],
        projects: [],
        projectData: {
          flags: [],
          trainers: [],
          scripts: [],
          knowledge: [],
        },
      };

    default:
      return state;
  }
}

// Context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Memoized action creators
  const actions = useMemo(
    () => ({
      setLoading: (key, value) =>
        dispatch({ type: APP_ACTIONS.SET_LOADING, key, value }),
      setError: (key, error) =>
        dispatch({ type: APP_ACTIONS.SET_ERROR, key, error }),
      clearError: (key) => dispatch({ type: APP_ACTIONS.CLEAR_ERROR, key }),
      updatePreferences: (preferences) =>
        dispatch({ type: APP_ACTIONS.UPDATE_USER_PREFERENCES, preferences }),
      addToCache: (key, data) =>
        dispatch({ type: APP_ACTIONS.ADD_TO_CACHE, key, data }),
      clearCache: () => dispatch({ type: APP_ACTIONS.CLEAR_CACHE }),
      setOllamaStatus: (status) =>
        dispatch({ type: APP_ACTIONS.SET_OLLAMA_STATUS, status }),
      updateProjectData: (data) =>
        dispatch({ type: APP_ACTIONS.UPDATE_PROJECT_DATA, data }),
      addScript: (projectId, script) =>
        dispatch({ type: APP_ACTIONS.ADD_SCRIPT, projectId, script }),
      // Accept optional projectId for explicit saves; fallback to state.activeProjectId
      updateScript: (projectIdOrScriptId, scriptIdOrUpdates, maybeUpdates) => {
        // Two call signatures supported:
        // 1) updateScript(scriptId, updates)
        // 2) updateScript(projectId, scriptId, updates)
        if (maybeUpdates !== undefined) {
          // Called with (projectId, scriptId, updates)
          return dispatch({
            type: APP_ACTIONS.UPDATE_SCRIPT,
            projectId: projectIdOrScriptId,
            scriptId: scriptIdOrUpdates,
            updates: maybeUpdates,
          });
        }

        // Called with (scriptId, updates)
        return dispatch({
          type: APP_ACTIONS.UPDATE_SCRIPT,
          scriptId: projectIdOrScriptId,
          updates: scriptIdOrUpdates,
        });
      },
      deleteScript: (scriptId) =>
        dispatch({ type: APP_ACTIONS.DELETE_SCRIPT, scriptId }),
      setActiveScript: (scriptId) =>
        dispatch({ type: APP_ACTIONS.SET_ACTIVE_SCRIPT, scriptId }),
      setActiveProject: (projectId) =>
        dispatch({ type: APP_ACTIONS.SET_ACTIVE_PROJECT, projectId }),
      setDashboardProjects: (projects) =>
        dispatch({ type: APP_ACTIONS.SET_DASHBOARD_PROJECTS, projects }),
      setCurrentProject: (project) =>
        dispatch({ type: APP_ACTIONS.SET_CURRENT_PROJECT, project }),
      syncProjectFromDashboard: () =>
        dispatch({ type: APP_ACTIONS.SYNC_PROJECT_FROM_DASHBOARD }),
      loadProjectData: (projectId) =>
        dispatch({ type: APP_ACTIONS.LOAD_PROJECT_DATA, projectId }),
      clearProjectData: () =>
        dispatch({ type: APP_ACTIONS.CLEAR_PROJECT_DATA }),
    }),
    []
  );

  // Memoized selectors
  const selectors = useMemo(
    () => ({
      isLoading: (key) => state.loading[key] || false,
      getError: (key) => state.errors[key],
      hasError: (key) => Boolean(state.errors[key]),
      getCachedData: (key, maxAge = 900000) => {
        // 15 minutes default
        const cached = state.cache.get(key);
        if (!cached) return null;
        if (Date.now() - cached.timestamp > maxAge) return null;
        return cached.data;
      },
      getPreference: (key) => state.userPreferences[key],
      getProjectData: (key) => state.projectData[key] || [],
    }),
    [state]
  );

  // Performance monitoring in development
  const performanceMetrics = useMemo(() => {
    if (process.env.NODE_ENV !== "development") return {};

    return {
      cacheSize: state.cache.size,
      errorCount: Object.keys(state.errors).length,
      loadingCount: Object.keys(state.loading).filter(
        (key) => state.loading[key]
      ).length,
    };
  }, [state]);

  const value = useMemo(
    () => ({
      state,
      actions,
      selectors,
      performanceMetrics,
    }),
    [state, actions, selectors, performanceMetrics]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook to use the app context
export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppState must be used within AppProvider");
  }
  return context;
};

// Specialized hooks for common patterns
export const useAsyncOperation = (operationKey) => {
  const { actions, selectors } = useAppState();

  return useCallback(
    async (asyncFn) => {
      actions.setLoading(operationKey, true);
      actions.clearError(operationKey);

      try {
        const result = await asyncFn();
        return result;
      } catch (_error) {
        actions.setError(operationKey, _error.message || "An error occurred");
        throw _error;
      } finally {
        actions.setLoading(operationKey, false);
      }
    },
    [actions, operationKey]
  );
};

export const useCachedData = (
  key,
  fetchFn,
  dependencies = [],
  maxAge = 900000
) => {
  const { actions, selectors } = useAppState();

  return useCallback(async () => {
    // Check cache first
    const cached = selectors.getCachedData(key, maxAge);
    if (cached) return cached;

    // Fetch fresh data
    const data = await fetchFn();
    actions.addToCache(key, data);
    return data;
  }, [key, fetchFn, maxAge, actions, selectors, ...dependencies]);
};
