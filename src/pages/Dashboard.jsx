import {
  ChangelogEntry,
  Flag,
  ROMProject,
  Script,
  Sprite,
  Trainer,
} from "@/api/entities";
import { useLabAssistant } from "@/components/shared/LabAssistantService";
import { PageShell, StatusIndicator } from "@/components/shared/PageShell.jsx";
import { useUser } from "@/contexts/UserContext";
import { useAppState } from "@/lib/appState.jsx";
import {
  createProjectDirectories,
  getUserProjects,
  initializeProjectData,
  loadCompleteProject,
} from "@/utils/projectFileSystem";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import DashboardChangelog from "@/components/dashboard/DashboardChangelog";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ProjectSelector from "@/components/dashboard/ProjectSelector";
import QuickActions from "@/components/dashboard/QuickActions";
import SystemStatus from "@/components/dashboard/SystemStatus";

/**
 * Dashboard component for EmeraldMind.
 * Displays an overview of ROM hacking projects, stats, quick actions,
 * system status, and a changelog. It also handles project creation
 * and selection, serving as the main entry point after login.
 */
export default function Dashboard() {
  // Use global state for project management
  const { state, actions } = useAppState();
  const { currentUser } = useUser();

  // State to store statistics for the current project (flags, trainers, scripts, sprites counts).
  const [stats, setStats] = useState({
    flags: 0,
    trainers: 0,
    scripts: 0,
    sprites: 0,
  });
  // State to store recent changelog entries for the application.
  const [changelogEntries, setChangelogEntries] = useState([]);
  // State to manage the loading status of the dashboard data.
  const [isLoading, setIsLoading] = useState(true);
  // Custom hook to interact with Lab Assistant (Ollama) service status and knowledge initialization.
  const { ollamaStatus, knowledgeInitialized } = useLabAssistant();

  // Get current project from global state
  const currentProject = state.currentProject;

  /**
   * Loads and updates the statistics for a given project ID.
   * This function fetches counts for Flags, Trainers, Scripts, and Sprites
   * associated with the specified project.
   * @param {string} projectId - The ID of the project to load stats for.
   */
  const loadProjectStats = useCallback(async (projectId) => {
    if (!projectId) return; // Do not attempt to load stats without a project ID.
    try {
      const [flags, trainers, scripts, sprites] = await Promise.all([
        Flag.filter({ project_id: projectId }),
        Trainer.filter({ project_id: projectId }),
        Script.filter({ project_id: projectId }),
        Sprite.filter({ project_id: projectId }),
      ]);
      setStats({
        flags: flags.length,
        trainers: trainers.length,
        scripts: scripts.length,
        sprites: sprites.length,
      });
    } catch (_error) {
      console.error("Error loading project stats:", error);
    }
  }, []);

  /**
   * Loads the latest changelog entries from the database.
   * Fetches a limited number of the most recent changelog entries to display.
   */
  const loadChangelog = useCallback(async () => {
    try {
      // If a project is active, load project-scoped changelog. Otherwise load recent global entries.
      let entries = [];
      if (currentProject?.id) {
        entries = await ChangelogEntry.filter({
          project_id: currentProject.id,
        });
      } else {
        entries = await ChangelogEntry.list("-created_date", 5);
      }
      setChangelogEntries(entries.slice(0, 5));
    } catch (_error) {
      console.error("Error loading changelog:", error);
    }
  }, []);

  /**
   * Loads a specific project and its data from the user's file system
   * @param {object} project - The project to load
   */
  const loadProjectWithData = useCallback(
    async (project) => {
      if (!project || !currentUser) return;

      console.log(
        "Loading project with data:",
        project.id,
        "for user:",
        currentUser.id
      );

      try {
        // Set as current project in global state
        actions.setCurrentProject(project);

        // Load complete project data from user's file system
        const projectData = loadCompleteProject(currentUser.id, project.id);
        console.log("Loaded project data from file system:", projectData);

        // Count actual files in each data type
        const stats = {
          flags:
            projectData.structure.flags
              ?.filter((f) => f.data && f.data.items)
              ?.reduce((sum, f) => sum + (f.data.items?.length || 0), 0) || 0,
          trainers:
            projectData.structure.trainers
              ?.filter((f) => f.data && f.data.items)
              ?.reduce((sum, f) => sum + (f.data.items?.length || 0), 0) || 0,
          scripts:
            projectData.structure.scripts
              ?.filter((f) => f.data && f.data.items)
              ?.reduce((sum, f) => sum + (f.data.items?.length || 0), 0) || 0,
          sprites:
            projectData.structure.sprites
              ?.filter((f) => f.data && f.data.items)
              ?.reduce((sum, f) => sum + (f.data.items?.length || 0), 0) || 0,
        };

        console.log("Calculated stats from file system:", stats);
        setStats(stats);
      } catch (_error) {
        console.error("Error loading project data:", error);
        // Fallback to loading stats from entities
        await loadProjectStats(project.id);
      }
    },
    [currentUser, actions, loadProjectStats]
  );

  /**
   * Initializes the dashboard by loading all projects, setting the current project
   * (usually the most recent one), and fetching its associated stats and the global changelog.
   * Handles the initial loading state of the dashboard.
   */
  const loadDashboard = useCallback(async () => {
    setIsLoading(true); // Start loading state
    try {
      if (!currentUser) {
        // No user logged in, clear everything
        actions.setDashboardProjects([]);
        actions.setCurrentProject(null);
        setStats({ flags: 0, trainers: 0, scripts: 0, sprites: 0 });
        setChangelogEntries([]);
        return;
      }

      // Load projects from both ROMProject entity and user file system, filtered by current user
      const [allEntityProjects, userProjectIds] = await Promise.all([
        ROMProject.list("-created_date"),
        getUserProjects(currentUser.id),
      ]);

      // Filter entity projects to only show those belonging to current user
      // For now, we'll assume projects without a user_id field are legacy and belong to default-user
      const userEntityProjects = allEntityProjects.filter(
        (project) =>
          !project.user_id ||
          project.user_id === currentUser.id ||
          (currentUser.id === "default-user" && !project.user_id)
      );

      // Merge entity projects with user file system projects
      let allProjects = [...userEntityProjects];

      // Add any user file system projects that don't exist as entities
      if (userProjectIds.length > 0) {
        const existingProjectIds = new Set(userEntityProjects.map((p) => p.id));
        const missingProjects = userProjectIds.filter(
          (id) => !existingProjectIds.has(id)
        );

        // Create minimal project objects for file system projects
        const fileSystemProjects = missingProjects.map((id) => ({
          id,
          name: `Project ${id}`,
          description: `Project loaded from user files`,
          base_rom: "emerald",
          user_id: currentUser.id, // Explicitly associate with current user
          created_date: new Date().toISOString(),
          settings: {
            auto_backup: true,
            debug_mode: false,
            sprite_validation: true,
          },
          statistics: {
            flags_used: 0,
            trainers_created: 0,
            scripts_written: 0,
            sprites_validated: 0,
          },
        }));

        allProjects = [...allProjects, ...fileSystemProjects];
      }

      actions.setDashboardProjects(allProjects);

      if (allProjects.length > 0) {
        // Check if there's a previously active project for this user
        const lastActiveProjectId = localStorage.getItem(
          `lastProject_${currentUser.id}`
        );
        let activeProject = allProjects.find(
          (p) => p.id === lastActiveProjectId
        );

        // If no previously active project or it doesn't exist, use the most recent
        if (!activeProject) {
          activeProject = allProjects[0];
        }

        // Store the active project for this user
        localStorage.setItem(`lastProject_${currentUser.id}`, activeProject.id);

        await loadProjectWithData(activeProject);
        // Load global changelog
        await loadChangelog();
      } else {
        // If no projects exist, reset stats and changelog to their initial empty states.
        actions.setCurrentProject(null);
        setStats({ flags: 0, trainers: 0, scripts: 0, sprites: 0 });
        setChangelogEntries([]);
        // Clear any stored last project for this user
        localStorage.removeItem(`lastProject_${currentUser.id}`);
      }
    } catch (_error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setIsLoading(false); // End loading state regardless of success or failure.
    }
  }, [
    loadProjectStats,
    loadChangelog,
    loadProjectWithData,
    actions,
    currentUser,
  ]); // Dependencies for useCallback to prevent unnecessary re-creation.

  // Effect hook to load the dashboard data on component mount.
  // `loadDashboard` is in the dependency array to ensure the effect re-runs if `loadDashboard`
  // somehow changes (though with useCallback, it's stable unless its dependencies change).
  useEffect(() => {
    loadDashboard();

    // Listen for global user changes and reload dashboard accordingly
    const userChangeHandler = (e) => {
      console.log("User changed event received:", e?.detail);
      loadDashboard();
    };

    // Listen for project data clear events to ensure proper user isolation
    const clearProjectHandler = () => {
      // Clear local state
      setStats({ flags: 0, trainers: 0, scripts: 0, sprites: 0 });
      setChangelogEntries([]);
      // Clear global state
      actions.clearProjectData();
    };

    if (typeof window !== "undefined" && window.addEventListener) {
      window.addEventListener("emeraldmind:user-changed", userChangeHandler);
      window.addEventListener(
        "emeraldmind:clear-project-data",
        clearProjectHandler
      );
    }

    return () => {
      if (typeof window !== "undefined" && window.removeEventListener) {
        window.removeEventListener(
          "emeraldmind:user-changed",
          userChangeHandler
        );
        window.removeEventListener(
          "emeraldmind:clear-project-data",
          clearProjectHandler
        );
      }
    };
  }, [loadDashboard, actions]);

  /**
   * Creates a new ROM project with default settings and user integration.
   * After creation, the new project is added to the list and set as the current project.
   * @param {string} projectName - Name for the new project.
   */
  const createNewProject = async (projectName) => {
    try {
      // Create project entity with proper user association
      const newProject = await ROMProject.create({
        name: projectName,
        description: `Generated ROM hack project: ${projectName}`,
        base_rom: "emerald",
        user_id: currentUser?.id || "default-user", // Associate with current user
        settings: {
          auto_backup: true,
          debug_mode: false,
          sprite_validation: true,
        },
        statistics: {
          flags_used: 0,
          trainers_created: 0,
          scripts_written: 0,
          sprites_validated: 0,
        },
      });

      // Store as last active project for this user
      if (currentUser?.id) {
        localStorage.setItem(`lastProject_${currentUser.id}`, newProject.id);
      }

      // Create project directory structure
      const projectStructure = createProjectDirectories(
        currentUser?.id || "default-user",
        newProject.id
      );

      // Initialize project data
      const projectInitialization = initializeProjectData(
        currentUser?.id || "default-user",
        newProject.id,
        projectName
      );

      // Reload dashboard to show new project
      await loadDashboard();

      return newProject;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  };

  // Display a loading animation while the dashboard data is being fetched.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Loading EmeraldMind...
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Initializing your ROM hacking workspace
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <PageShell
      icon={Home}
      iconColor="emerald"
      title="Dashboard"
      description="Welcome to your ROM hacking command center"
      statusIndicator={
        <StatusIndicator status={ollamaStatus} label="AI Status" />
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <ProjectSelector
            projects={state.dashboardProjects}
            currentProject={state.currentProject}
            onCreateProject={createNewProject}
            onSelectProject={loadProjectWithData}
            onDeleteProject={(projectId) => {
              // Remove from global state
              const updatedProjects = state.dashboardProjects.filter(
                (p) => p.id !== projectId
              );
              actions.setDashboardProjects(updatedProjects);
              if (state.currentProject?.id === projectId) {
                actions.setCurrentProject(null);
              }
            }}
            onRefreshProjects={loadDashboard}
          />
          <QuickActions />
          <DashboardChangelog entries={changelogEntries} />
        </div>

        <div className="space-y-8">
          <SystemStatus
            aiStatus={String(ollamaStatus || "checking")}
            knowledgeReady={knowledgeInitialized}
          />
          <DashboardStats stats={stats} />
        </div>
      </div>
    </PageShell>
  );
}
