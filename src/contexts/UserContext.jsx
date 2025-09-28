import { createContext, useContext, useEffect, useReducer } from "react";

// Initial user state
const initialUserState = {
  currentUser: {
    id: "default-user",
    name: "User",
    tagline: "ROM Hacking Enthusiast",
    avatar: {
      type: "letter", // 'letter' or 'image'
      value: "U", // letter or image URL
      backgroundColor: "from-emerald-500 to-teal-500",
    },
    settings: {
      theme: "dark",
      expertMode: true,
      notifications: true,
    },
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  },
  users: [], // Array of all users for multi-user support
  isLoading: false,
  error: null,
};

// User action types
const USER_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  LOAD_USER_DATA: "LOAD_USER_DATA",
  UPDATE_USER_PROFILE: "UPDATE_USER_PROFILE",
  UPDATE_USER_SETTINGS: "UPDATE_USER_SETTINGS",
  SWITCH_USER: "SWITCH_USER",
  ADD_USER: "ADD_USER",
  DELETE_USER: "DELETE_USER",
  UPDATE_LAST_ACTIVE: "UPDATE_LAST_ACTIVE",
};

// User reducer
function userReducer(state, action) {
  switch (action.type) {
    case USER_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case USER_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };

    case USER_ACTIONS.LOAD_USER_DATA:
      return {
        ...state,
        currentUser: action.payload.currentUser,
        users: action.payload.users,
        isLoading: false,
        error: null,
      };

    case USER_ACTIONS.UPDATE_USER_PROFILE:
      const updatedUser = {
        ...state.currentUser,
        ...action.payload,
        avatar: {
          ...state.currentUser.avatar,
          value: action.payload.name
            ? action.payload.name.charAt(0).toUpperCase()
            : state.currentUser.avatar.value,
          ...action.payload.avatar,
        },
      };
      return {
        ...state,
        currentUser: updatedUser,
        users: state.users.map((user) =>
          user.id === state.currentUser.id ? updatedUser : user
        ),
      };

    case USER_ACTIONS.UPDATE_USER_SETTINGS:
      const userWithUpdatedSettings = {
        ...state.currentUser,
        settings: { ...state.currentUser.settings, ...action.payload },
      };
      return {
        ...state,
        currentUser: userWithUpdatedSettings,
        users: state.users.map((user) =>
          user.id === state.currentUser.id ? userWithUpdatedSettings : user
        ),
      };

    case USER_ACTIONS.SWITCH_USER:
      const targetUser = state.users.find((user) => user.id === action.payload);
      if (!targetUser) return state;
      return {
        ...state,
        currentUser: {
          ...targetUser,
          lastActive: new Date().toISOString(),
        },
      };

    case USER_ACTIONS.ADD_USER:
      // payload should be a fully-constructed user object
      if (!action.payload || !action.payload.id) return state;
      return {
        ...state,
        users: [...state.users, action.payload],
        currentUser: action.payload,
      };

    case USER_ACTIONS.DELETE_USER:
      if (state.users.length <= 1) return state; // Prevent deleting the last user
      const remainingUsers = state.users.filter(
        (user) => user.id !== action.payload
      );
      return {
        ...state,
        users: remainingUsers,
        currentUser:
          state.currentUser.id === action.payload
            ? remainingUsers[0]
            : state.currentUser,
      };

    case USER_ACTIONS.UPDATE_LAST_ACTIVE:
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          lastActive: new Date().toISOString(),
        },
      };

    default:
      return state;
  }
}

// Create context
const UserContext = createContext();

// UserProvider component
export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialUserState);

  // Load user data from localStorage on mount
  useEffect(() => {
    try {
      const storedUserData = localStorage.getItem("emeraldmind-user-data");
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        dispatch({
          type: USER_ACTIONS.LOAD_USER_DATA,
          payload: userData,
        });
      } else {
        // If no stored data, initialize with default user
        const defaultData = {
          currentUser: state.currentUser,
          users: [state.currentUser],
        };
        localStorage.setItem(
          "emeraldmind-user-data",
          JSON.stringify(defaultData)
        );
        dispatch({
          type: USER_ACTIONS.LOAD_USER_DATA,
          payload: defaultData,
        });
      }
    } catch (_error) {
      console.error("Error loading user data:", _error);
      dispatch({
        type: USER_ACTIONS.SET_ERROR,
        payload: "Failed to load user data",
      });
    }
  }, []);

  // Save user data to localStorage whenever state changes
  useEffect(() => {
    if (!state.isLoading && state.currentUser) {
      try {
        const dataToStore = {
          currentUser: state.currentUser,
          users: state.users.length > 0 ? state.users : [state.currentUser],
        };
        localStorage.setItem(
          "emeraldmind-user-data",
          JSON.stringify(dataToStore)
        );
        // Reflect expert mode on the document root for global styling/behavior
        try {
          if (typeof document !== "undefined" && document.documentElement) {
            const isExpert = Boolean(state.currentUser?.settings?.expertMode);
            document.documentElement.setAttribute(
              "data-expert-mode",
              isExpert ? "true" : "false"
            );
          }
        } catch (_e) {
          // ignore DOM errors in non-browser environments
        }
      } catch (_error) {
        console.error("Error saving user data:", _error);
      }
    }
  }, [state.currentUser, state.users, state.isLoading]);

  // Action creators
  const actions = {
    updateProfile: (profileData) => {
      dispatch({
        type: USER_ACTIONS.UPDATE_USER_PROFILE,
        payload: profileData,
      });
    },

    updateSettings: (settings) => {
      dispatch({
        type: USER_ACTIONS.UPDATE_USER_SETTINGS,
        payload: settings,
      });
    },

    switchUser: (userId) => {
      dispatch({ type: USER_ACTIONS.SWITCH_USER, payload: userId });

      // Clear project data to ensure proper user isolation
      try {
        if (typeof window !== "undefined" && window.dispatchEvent) {
          // First dispatch a clear event to reset all project data
          window.dispatchEvent(
            new CustomEvent("emeraldmind:clear-project-data", {
              detail: { reason: "user-switch" },
            })
          );
          // Then dispatch the user changed event
          window.dispatchEvent(
            new CustomEvent("emeraldmind:user-changed", {
              detail: { userId, action: "switched" },
            })
          );
        }
      } catch (_e) {}

      try {
        // Persist change immediately so other non-React consumers see the active user
        const stored = localStorage.getItem("emeraldmind-user-data");
        const parsed = stored
          ? JSON.parse(stored)
          : { currentUser: state.currentUser, users: state.users };
        const target =
          parsed.users?.find((u) => u.id === userId) || parsed.currentUser;
        if (target) {
          const dataToStore = {
            currentUser: target,
            users: parsed.users || [parsed.currentUser],
          };
          localStorage.setItem(
            "emeraldmind-user-data",
            JSON.stringify(dataToStore)
          );
        }
      } catch (_e) {
        console.warn("Failed to persist switched user:", _e);
      }
    },

    // Create a new user object and add it to state
    createUser: (userData) => {
      const id = userData.id || `user-${Date.now()}`;
      const name = userData.name || "New User";
      const newUser = {
        id,
        name,
        tagline: userData.tagline || "ROM Hacking Enthusiast",
        avatar: {
          type: "letter",
          value: (name || "N").charAt(0).toUpperCase(),
          backgroundColor:
            userData.backgroundColor || "from-blue-500 to-purple-500",
        },
        settings: {
          theme: userData.theme || "dark",
          expertMode: userData.expertMode || false,
          notifications:
            userData.notifications !== undefined
              ? userData.notifications
              : true,
          ...userData.settings,
        },
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };

      // Persist a lightweight user root so projectFileSystem can discover this user's projects
      try {
        const rootKey = `user_${id}_root`;
        const rootData = {
          id: newUser.id,
          name: newUser.name,
          createdAt: newUser.createdAt,
        };
        localStorage.setItem(rootKey, JSON.stringify(rootData));
      } catch (_e) {
        console.warn("Failed to persist user root:", e);
      }

      // Update persisted global user data immediately so UI/components and other utilities can read it
      try {
        const stored = localStorage.getItem("emeraldmind-user-data");
        const parsed = stored
          ? JSON.parse(stored)
          : { currentUser: state.currentUser, users: state.users };
        const updatedUsers = [
          ...(parsed.users || [parsed.currentUser]),
          newUser,
        ];
        const dataToStore = { currentUser: newUser, users: updatedUsers };
        localStorage.setItem(
          "emeraldmind-user-data",
          JSON.stringify(dataToStore)
        );
      } catch (_e) {
        console.warn("Failed to persist new user to emeraldmind-user-data:", e);
      }

      dispatch({ type: USER_ACTIONS.ADD_USER, payload: newUser });
      try {
        if (typeof window !== "undefined" && window.dispatchEvent) {
          window.dispatchEvent(
            new CustomEvent("emeraldmind:user-changed", {
              detail: { userId: newUser.id, action: "created" },
            })
          );
        }
      } catch (_e) {}
    },

    deleteUser: (userId) => {
      try {
        // Remove lightweight root key
        const rootKey = `user_${userId}_root`;
        localStorage.removeItem(rootKey);
      } catch (_e) {
        console.warn("Failed to remove user root for deleted user:", e);
      }
      dispatch({ type: USER_ACTIONS.DELETE_USER, payload: userId });
      try {
        if (typeof window !== "undefined" && window.dispatchEvent) {
          window.dispatchEvent(
            new CustomEvent("emeraldmind:user-changed", {
              detail: { userId, action: "deleted" },
            })
          );
        }
      } catch (_e) {}
    },

    updateLastActive: () => {
      dispatch({
        type: USER_ACTIONS.UPDATE_LAST_ACTIVE,
      });
    },

    setError: (error) => {
      dispatch({
        type: USER_ACTIONS.SET_ERROR,
        payload: error,
      });
    },

    setLoading: (loading) => {
      dispatch({
        type: USER_ACTIONS.SET_LOADING,
        payload: loading,
      });
    },
  };

  const value = {
    ...state,
    actions,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Custom hook to use user context
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

// Export action types for external use
export { USER_ACTIONS };
