import React, { useState, useEffect, useCallback } from "react";
import { ROMProject } from "@/api/entities";
import { Flag } from "@/api/entities";
import { Trainer } from "@/api/entities";
import { Script } from "@/api/entities";
import { Sprite } from "@/api/entities";
import { ChangelogEntry } from "@/api/entities";
import { Home } from "lucide-react";
import { motion } from "framer-motion";
import { useLabAssistant } from "@/components/shared/LabAssistantService";

import ProjectSelector from "@/components/dashboard/ProjectSelector";
import QuickActions from "@/components/dashboard/QuickActions";
import SystemStatus from "@/components/dashboard/SystemStatus";
import DashboardChangelog from "@/components/dashboard/DashboardChangelog";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ThemeToggle from "@/components/shared/ThemeToggle";

/**
 * Dashboard component for EmeraldMind.
 * Displays an overview of ROM hacking projects, stats, quick actions,
 * system status, and a changelog. It also handles project creation
 * and selection, serving as the main entry point after login.
 */
export default function Dashboard() {
  // State to store the list of available ROM projects.
  const [projects, setProjects] = useState([]);
  // State to hold the currently selected project, or null if none is selected/created.
  const [currentProject, setCurrentProject] = useState(null);
  // State to store statistics for the current project (flags, trainers, scripts, sprites counts).
  const [stats, setStats] = useState({ flags: 0, trainers: 0, scripts: 0, sprites: 0 });
  // State to store recent changelog entries for the application.
  const [changelogEntries, setChangelogEntries] = useState([]);
  // State to manage the loading status of the dashboard data.
  const [isLoading, setIsLoading] = useState(true);
  // Custom hook to interact with Lab Assistant (Ollama) service status and knowledge initialization.
  const { ollamaStatus, knowledgeInitialized } = useLabAssistant();

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
        Sprite.filter({ project_id: projectId })
      ]);
      setStats({
        flags: flags.length,
        trainers: trainers.length,
        scripts: scripts.length,
        sprites: sprites.length
      });
    } catch (error) {
      console.error("Error loading project stats:", error);
    }
  }, []);
  
  /**
   * Loads the latest changelog entries from the database.
   * Fetches a limited number of the most recent changelog entries to display.
   */
  const loadChangelog = useCallback(async () => {
    try {
      // Fetches the 5 most recent changelog entries, ordered by creation date descending.
      const entries = await ChangelogEntry.list('-created_date', 5);
      setChangelogEntries(entries);
    } catch (error) {
      console.error("Error loading changelog:", error);
    }
  }, []);

  /**
   * Initializes the dashboard by loading all projects, setting the current project
   * (usually the most recent one), and fetching its associated stats and the global changelog.
   * Handles the initial loading state of the dashboard.
   */
  const loadDashboard = useCallback(async () => {
    setIsLoading(true); // Start loading state
    try {
      const projectList = await ROMProject.list("-created_date");
      setProjects(projectList);
      
      if (projectList.length > 0) {
        // Set the most recently created project as the active project.
        const activeProject = projectList[0];
        setCurrentProject(activeProject);
        // Load project-specific stats and global changelog concurrently for efficiency.
        await Promise.all([
          loadProjectStats(activeProject.id),
          loadChangelog()
        ]);
      } else {
        // If no projects exist, reset stats and changelog to their initial empty states.
        setCurrentProject(null);
        setStats({ flags: 0, trainers: 0, scripts: 0, sprites: 0 });
        setChangelogEntries([]);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setIsLoading(false); // End loading state regardless of success or failure.
    }
  }, [loadProjectStats, loadChangelog]); // Dependencies for useCallback to prevent unnecessary re-creation.

  // Effect hook to load the dashboard data on component mount.
  // `loadDashboard` is in the dependency array to ensure the effect re-runs if `loadDashboard`
  // somehow changes (though with useCallback, it's stable unless its dependencies change).
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /**
   * Creates a new ROM project with default settings and initializes it with a starter template.
   * After creation, the new project is added to the list and set as the current project.
   * @param {object} projectData - Data for the new project, e.g., name, description.
   */
  const createNewProject = async (projectData) => {
    try {
      // Create the new project in the database with predefined default settings and empty statistics.
      const newProject = await ROMProject.create({
        ...projectData,
        settings: { auto_backup: true, debug_mode: false, sprite_validation: true },
        statistics: { flags_used: 0, trainers_created: 0, scripts_written: 0, sprites_validated: 0 }
      });
      
      // Update the projects list and set the newly created project as active.
      setProjects(prev => [newProject, ...prev]);
      setCurrentProject(newProject);
      
      // Populate the new project with some initial starter data (e.g., flags and trainers).
      await initializeStarterTemplate(newProject.id);
      // Reload statistics to reflect the newly added starter data.
      await loadProjectStats(newProject.id);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  /**
   * Initializes a new project with a set of predefined starter flags and trainers.
   * This provides a basic setup for a new ROM hacking project.
   * @param {string} projectId - The ID of the project to initialize.
   */
  const initializeStarterTemplate = async (projectId) => {
    // Define a list of starter flags to be created for a new project.
    const starterFlags = [
      { flag_id: "0x200", name: "STORY_INTRO_COMPLETE", category: "Story", description: "Player completed intro sequence" },
      { flag_id: "0x201", name: "FIRST_GYM_BEATEN", category: "Story", description: "First gym leader defeated" },
      { flag_id: "0x202", name: "RIVAL_BATTLE_1", category: "Trainer", description: "First rival battle triggered" },
      { flag_id: "0x203", name: "ITEM_PICKUP_POKEBALL", category: "Items", description: "Player picked up the first Poké Ball" },
      { flag_id: "0x204", name: "NPC_QUEST_STARTED_OLDMAN", category: "NPC", description: "Started quest for Old Man in Viridian City" }
    ];

    // Define a list of starter trainers to be created for a new project.
    const starterTrainers = [
      { name: "Youngster Joey", type: "Youngster", sprite: "YOUNGSTER", pokemon: [{ name: "Rattata", level: 5 }], location: "Route 1", project_id: projectId },
      { name: "Lass Natalie", type: "Lass", sprite: "LASS", pokemon: [{ name: "Pidgey", level: 4 }, { name: "Oddish", level: 4 }], location: "Viridian Forest", project_id: projectId },
      { name: "Bug Catcher Rick", type: "Bug Catcher", sprite: "BUG_CATCHER", pokemon: [{ name: "Weedle", level: 6 }], location: "Viridian Forest", project_id: projectId },
      { name: "Fisherman Ben", type: "Fisherman", sprite: "FISHERMAN", pokemon: [{ name: "Magikarp", level: 10 }], location: "Vermilion City Docks", project_id: projectId },
      { name: "Camper Todd", type: "Camper", sprite: "CAMPER", pokemon: [{ name: "Sandshrew", level: 8 }], location: "Route 3", project_id: projectId }
    ];

    // Create all starter flags and trainers concurrently.
    const flagPromises = starterFlags.map(flag => Flag.create({ project_id: projectId, ...flag }));
    const trainerPromises = starterTrainers.map(trainer => Trainer.create(trainer));
    await Promise.all([...flagPromises, ...trainerPromises]);
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
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Loading EmeraldMind...</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Initializing your ROM hacking workspace</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-light text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-3">
                  <Home className="w-7 h-7 text-emerald-400" />
                  Dashboard
                </h1>
                <p className="text-base text-slate-600 dark:text-slate-400 font-light ml-10">
                  Welcome to your ROM hacking command center
                </p>
              </div>
              <ThemeToggle />
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <ProjectSelector 
              projects={projects} 
              currentProject={currentProject} 
              onCreateProject={createNewProject}
              onSelectProject={setCurrentProject}
            />
            <QuickActions />
            <DashboardChangelog entries={changelogEntries} />
          </div>
          
          <div className="space-y-8">
            <SystemStatus 
              aiStatus={ollamaStatus}
              knowledgeReady={knowledgeInitialized}
            />
            <DashboardStats stats={stats} />
          </div>
        </div>
      </div>
    </div>
  );
}