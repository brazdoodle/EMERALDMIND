// === MOCK BASE44 INTEGRATIONS FOR LOCAL DEVELOPMENT ===
// Copy these to individual files in your local src/ directory

// src/integrations/Core.js
export const InvokeLLM = async ({
  prompt,
  add_context_from_internet = false,
  response_json_schema = null,
}) => {
  console.warn(
    "🔄 InvokeLLM called locally - this will be handled by Ollama integration"
  );
  // This will be overridden by the Ollama integration in LabAssistantService
  return "Mock response - Ollama should handle this";
};

export const UploadFile = async ({ file }) => {
  console.warn("📁 UploadFile called locally - using mock");
  // Create a mock file URL for local development
  const mockUrl = URL.createObjectURL(file);
  return { file_url: mockUrl };
};

export const ExtractDataFromUploadedFile = async ({
  file_url,
  json_schema,
}) => {
  console.warn("📄 ExtractDataFromUploadedFile called locally - using mock");
  return {
    status: "success",
    output: {
      story_elements: [],
      characters: [],
      plot_points: [],
      world_building: {},
    },
  };
};

export const GenerateImage = async ({ prompt }) => {
  console.warn("🖼️ GenerateImage called locally - using placeholder");
  return {
    url: `https://via.placeholder.com/512x512/6366f1/ffffff?text=${encodeURIComponent(
      prompt.substring(0, 20)
    )}`,
  };
};

// src/utils/index.js
export const createPageUrl = (pageName, params = "") => {
  const cleanPageName = pageName.toLowerCase().replace(/\s+/g, "");
  return `/${cleanPageName}${params ? `?${params}` : ""}`;
};

// Mock Entity Classes - create separate files for each:
// src/entities/Trainer.js, src/entities/Flag.js, etc.

const createMockEntity = (entityName) => {
  const mockData = new Map();

  return {
    list: async (sort = "-created_date", limit = 100) => {
      console.warn(
        `[WARN] ${entityName}.list called locally - returning mock data`
      );
      return Array.from(mockData.values())
        .sort((a, b) =>
          sort.startsWith("-")
            ? b.created_date - a.created_date
            : a.created_date - b.created_date
        )
        .slice(0, limit);
    },

    filter: async (criteria, sort = "-created_date", limit = 100) => {
      console.warn(
        `[WARN] ${entityName}.filter called locally - returning mock data`
      );
      let results = Array.from(mockData.values());

      // Simple mock filtering
      if (criteria) {
        results = results.filter((item) => {
          return Object.entries(criteria).every(
            ([key, value]) => item[key] === value
          );
        });
      }

      return results
        .sort((a, b) =>
          sort.startsWith("-")
            ? b.created_date - a.created_date
            : a.created_date - b.created_date
        )
        .slice(0, limit);
    },

    create: async (data) => {
      console.warn(`➕ ${entityName}.create called locally`);
      const newItem = {
        ...data,
        id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_date: new Date(),
        updated_date: new Date(),
        created_by: "local_user@example.com",
      };
      mockData.set(newItem.id, newItem);
      return newItem;
    },

    update: async (id, data) => {
      console.warn(`[LocalMock] ${entityName}.update called locally`);
      const existing = mockData.get(id);
      if (existing) {
        const updated = {
          ...existing,
          ...data,
          updated_date: new Date(),
        };
        mockData.set(id, updated);
        return updated;
      }
      return null;
    },

    delete: async (id) => {
      console.warn(`🗑️ ${entityName}.delete called locally`);
      return mockData.delete(id);
    },

    bulkCreate: async (dataArray) => {
      console.warn(`📦 ${entityName}.bulkCreate called locally`);
      const results = [];
      for (const data of dataArray) {
        results.push(await this.create(data));
      }
      return results;
    },
  };
};

// Export mock entities
export const Trainer = createMockEntity("Trainer");
export const StoryEvent = createMockEntity("StoryEvent");
export const NPCProfile = createMockEntity("NPCProfile");
export const Flag = createMockEntity("Flag");
export const Script = createMockEntity("Script");
export const Sprite = createMockEntity("Sprite");
export const ROMProject = createMockEntity("ROMProject");
export const EmulatorSession = createMockEntity("EmulatorSession");

// Mock User entity with special methods
export const User = {
  ...createMockEntity("User"),
  me: async () => {
    console.warn("👤 User.me called locally - returning mock user");
    return {
      id: "mock_user_123",
      email: "local_user@example.com",
      full_name: "Local Developer",
      role: "admin",
      created_date: new Date(),
      updated_date: new Date(),
    };
  },
  updateMyUserData: async (data) => {
    console.warn("👤 User.updateMyUserData called locally");
    return { ...(await User.me()), ...data };
  },
  logout: async () => {
    console.warn("👤 User.logout called locally");
    // In a real app, you'd handle logout logic here
  },
  login: async () => {
    console.warn("👤 User.login called locally - mock login");
    // Mock login - in real app this would redirect
  },
  loginWithRedirect: async (callbackUrl) => {
    console.warn("👤 User.loginWithRedirect called locally");
    // Mock redirect
  },
};
