/**
 * Advanced User Experience Features for EmeraldMind
 * Keyboard shortcuts, customizable layouts, undo/redo system, and contextual help
 */

import { trainerLogger } from "../logger";

// Keyboard shortcuts configuration
export const KEYBOARD_SHORTCUTS = {
  // Generation shortcuts
  GENERATE_TEAM: { keys: ["ctrl", "g"], description: "Generate new team" },
  RANDOMIZE_NAME: {
    keys: ["ctrl", "r"],
    description: "Randomize trainer name",
  },
  NEW_TRAINER: { keys: ["ctrl", "n"], description: "Create new trainer" },

  // Navigation shortcuts
  NEXT_TAB: { keys: ["ctrl", "tab"], description: "Next tab" },
  PREV_TAB: { keys: ["ctrl", "shift", "tab"], description: "Previous tab" },
  FOCUS_SEARCH: { keys: ["ctrl", "k"], description: "Focus search" },

  // Action shortcuts
  SAVE_TRAINER: { keys: ["ctrl", "s"], description: "Save current trainer" },
  UNDO: { keys: ["ctrl", "z"], description: "Undo last action" },
  REDO: { keys: ["ctrl", "y"], description: "Redo last action" },

  // Panel shortcuts
  TOGGLE_ASSISTANT: { keys: ["ctrl", "h"], description: "Toggle assistant" },
  TOGGLE_PERFORMANCE: {
    keys: ["ctrl", "p"],
    description: "Toggle performance dashboard",
  },
  TOGGLE_EXPORT: { keys: ["ctrl", "e"], description: "Toggle export/import" },

  // Team shortcuts
  ADD_POKEMON: {
    keys: ["ctrl", "shift", "a"],
    description: "Add Pokemon to team",
  },
  CLEAR_TEAM: {
    keys: ["ctrl", "shift", "c"],
    description: "Clear current team",
  },
};

// Layout configurations
export const LAYOUT_PRESETS = {
  DEFAULT: {
    name: "Default",
    description: "Standard layout with side-by-side panels",
    config: {
      sidebar: { width: 300, position: "left" },
      mainPanel: { flex: 1 },
      teamPanel: { width: 400, position: "right" },
    },
  },
  COMPACT: {
    name: "Compact",
    description: "Minimized layout for smaller screens",
    config: {
      sidebar: { width: 250, position: "left" },
      mainPanel: { flex: 1 },
      teamPanel: { width: 300, position: "bottom" },
    },
  },
  WIDE: {
    name: "Wide",
    description: "Wide layout for large screens",
    config: {
      sidebar: { width: 350, position: "left" },
      mainPanel: { flex: 2 },
      teamPanel: { width: 500, position: "right" },
    },
  },
  FOCUS: {
    name: "Focus",
    description: "Team-focused layout",
    config: {
      sidebar: { width: 200, position: "left", collapsed: true },
      mainPanel: { flex: 1 },
      teamPanel: { width: 600, position: "right" },
    },
  },
};

// Action types for undo/redo system
export const ACTION_TYPES = {
  TRAINER_UPDATE: "trainer_update",
  POKEMON_ADD: "pokemon_add",
  POKEMON_REMOVE: "pokemon_remove",
  POKEMON_UPDATE: "pokemon_update",
  TEAM_GENERATE: "team_generate",
  TEAM_CLEAR: "team_clear",
};

export class UXManager {
  constructor() {
    this.shortcuts = new Map();
    this.layoutConfig = LAYOUT_PRESETS.DEFAULT;
    this.undoStack = [];
    this.redoStack = [];
    this.maxUndoSize = 50;
    this.contextualHelp = new Map();

    this.initializeShortcuts();
    this.initializeContextualHelp();

    trainerLogger.info("UX Manager initialized");
  }

  /**
   * Initialize keyboard shortcuts
   */
  initializeShortcuts() {
    // Register all shortcuts
    Object.entries(KEYBOARD_SHORTCUTS).forEach(([action, config]) => {
      this.shortcuts.set(action, {
        ...config,
        handler: null,
        active: true,
      });
    });
  }

  /**
   * Register a keyboard shortcut handler
   */
  registerShortcut(shortcutKey, handler) {
    if (this.shortcuts.has(shortcutKey)) {
      const shortcut = this.shortcuts.get(shortcutKey);
      shortcut.handler = handler;
      this.shortcuts.set(shortcutKey, shortcut);
      trainerLogger.debug(`Registered shortcut handler: ${shortcutKey}`);
    }
  }

  /**
   * Handle keyboard events
   */
  handleKeyboardEvent(event) {
    const pressedKeys = [];

    if (event.ctrlKey) pressedKeys.push("ctrl");
    if (event.shiftKey) pressedKeys.push("shift");
    if (event.altKey) pressedKeys.push("alt");
    if (event.metaKey) pressedKeys.push("meta");

    // Add the main key
    if (event.key && !["Control", "Shift", "Alt", "Meta"].includes(event.key)) {
      pressedKeys.push(event.key.toLowerCase());
    }

    // Find matching shortcut
    for (const [action, config] of this.shortcuts.entries()) {
      if (
        this.keysMatch(pressedKeys, config.keys) &&
        config.handler &&
        config.active
      ) {
        event.preventDefault();
        event.stopPropagation();

        try {
          config.handler();
          trainerLogger.debug(`Executed shortcut: ${action}`);
        } catch (error) {
          trainerLogger.error(`Shortcut execution failed: ${action}`, error);
        }

        break;
      }
    }
  }

  /**
   * Check if pressed keys match shortcut configuration
   */
  keysMatch(pressedKeys, configKeys) {
    if (pressedKeys.length !== configKeys.length) return false;

    return configKeys.every((key) => pressedKeys.includes(key.toLowerCase()));
  }

  /**
   * Get all registered shortcuts for display
   */
  getShortcuts() {
    return Array.from(this.shortcuts.entries()).map(([action, config]) => ({
      action,
      keys: config.keys,
      description: config.description,
      active: config.active,
    }));
  }

  /**
   * Toggle shortcut active state
   */
  toggleShortcut(shortcutKey, active = null) {
    if (this.shortcuts.has(shortcutKey)) {
      const shortcut = this.shortcuts.get(shortcutKey);
      shortcut.active = active !== null ? active : !shortcut.active;
      this.shortcuts.set(shortcutKey, shortcut);
    }
  }

  /**
   * Set layout configuration
   */
  setLayout(presetName) {
    if (LAYOUT_PRESETS[presetName]) {
      this.layoutConfig = LAYOUT_PRESETS[presetName];
      trainerLogger.info(`Layout changed to: ${presetName}`);

      // Trigger layout change event
      window.dispatchEvent(
        new CustomEvent("layoutChange", {
          detail: { layout: this.layoutConfig },
        })
      );
    }
  }

  /**
   * Get current layout configuration
   */
  getLayout() {
    return this.layoutConfig;
  }

  /**
   * Get available layout presets
   */
  getLayoutPresets() {
    return Object.entries(LAYOUT_PRESETS).map(([key, preset]) => ({
      key,
      ...preset,
    }));
  }

  /**
   * Add action to undo stack
   */
  addUndoAction(action) {
    // Clear redo stack when new action is added
    this.redoStack = [];

    // Add to undo stack
    this.undoStack.push({
      ...action,
      timestamp: Date.now(),
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });

    // Limit undo stack size
    if (this.undoStack.length > this.maxUndoSize) {
      this.undoStack = this.undoStack.slice(-this.maxUndoSize);
    }

    trainerLogger.debug(`Added undo action: ${action.type}`);
  }

  /**
   * Undo last action
   */
  undo() {
    if (this.undoStack.length === 0) return null;

    const action = this.undoStack.pop();
    this.redoStack.push(action);

    trainerLogger.debug(`Undoing action: ${action.type}`);
    return action;
  }

  /**
   * Redo last undone action
   */
  redo() {
    if (this.redoStack.length === 0) return null;

    const action = this.redoStack.pop();
    this.undoStack.push(action);

    trainerLogger.debug(`Redoing action: ${action.type}`);
    return action;
  }

  /**
   * Get undo/redo history
   */
  getHistory() {
    return {
      undoStack: [...this.undoStack].reverse(),
      redoStack: [...this.redoStack].reverse(),
      canUndo: this.undoStack.length > 0,
      canRedo: this.redoStack.length > 0,
    };
  }

  /**
   * Clear undo/redo history
   */
  clearHistory() {
    this.undoStack = [];
    this.redoStack = [];
    trainerLogger.info("Undo/redo history cleared");
  }

  /**
   * Initialize contextual help system
   */
  initializeContextualHelp() {
    // Define help content for different contexts
    this.contextualHelp.set("trainer-form", {
      title: "Trainer Configuration",
      content: [
        "Configure your trainer's basic information and battle style.",
        "Name: Set a unique trainer name or use the dice icon to randomize.",
        "Class: Choose from authentic Pokemon trainer classes.",
        "Levels: Set the level range for generated Pokemon.",
        "Biomes: Select habitat types to influence Pokemon selection.",
        "Difficulty: Affects AI strategy and Pokemon movesets.",
        "Battle Style: Determines team composition and strategy.",
      ],
      shortcuts: ["RANDOMIZE_NAME", "NEW_TRAINER"],
    });

    this.contextualHelp.set("team-builder", {
      title: "Team Building",
      content: [
        "Build and customize your Pokemon team.",
        "Generation: Use AI to create balanced teams automatically.",
        "Manual: Add individual Pokemon with custom movesets.",
        "Validation: Real-time feedback on team composition.",
        "Synergy: View type coverage and team statistics.",
        "Evolution: Automatic level-appropriate evolution handling.",
      ],
      shortcuts: ["GENERATE_TEAM", "ADD_POKEMON", "CLEAR_TEAM"],
    });

    this.contextualHelp.set("validation", {
      title: "Validation System",
      content: [
        "Ensure your trainers meet professional standards.",
        "Real-time validation as you build.",
        "Error detection and automatic fixes.",
        "Suggestions for optimal team composition.",
        "Gen 3 compatibility checking.",
        "Moveset validation and recommendations.",
      ],
      shortcuts: [],
    });

    this.contextualHelp.set("export-import", {
      title: "Export & Import",
      content: [
        "Share and backup your trainers professionally.",
        "Multiple formats: ROM hack, JSON, CSV, Pokeemerald.",
        "Batch operations for multiple trainers.",
        "Import validation and conflict resolution.",
        "Version control and backup management.",
        "Professional ROM integration ready.",
      ],
      shortcuts: ["TOGGLE_EXPORT", "SAVE_TRAINER"],
    });

    this.contextualHelp.set("performance", {
      title: "Performance Monitoring",
      content: [
        "Monitor and optimize application performance.",
        "Intelligent caching for faster operations.",
        "Memory usage tracking and optimization.",
        "Performance metrics and slow operation detection.",
        "Auto-optimization suggestions.",
        "Cache management and cleanup.",
      ],
      shortcuts: ["TOGGLE_PERFORMANCE"],
    });
  }

  /**
   * Get contextual help for a specific area
   */
  getContextualHelp(context) {
    return this.contextualHelp.get(context) || null;
  }

  /**
   * Get all available help contexts
   */
  getAllHelpContexts() {
    return Array.from(this.contextualHelp.entries()).map(([key, help]) => ({
      key,
      title: help.title,
    }));
  }

  /**
   * Search help content
   */
  searchHelp(query) {
    const results = [];
    const searchTerm = query.toLowerCase();

    for (const [context, help] of this.contextualHelp.entries()) {
      const relevance = this.calculateHelpRelevance(help, searchTerm);
      if (relevance > 0) {
        results.push({
          context,
          help,
          relevance,
        });
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Calculate help content relevance for search
   */
  calculateHelpRelevance(help, searchTerm) {
    let relevance = 0;

    // Title match (highest weight)
    if (help.title.toLowerCase().includes(searchTerm)) {
      relevance += 10;
    }

    // Content match
    help.content.forEach((paragraph) => {
      if (paragraph.toLowerCase().includes(searchTerm)) {
        relevance += 5;
      }
    });

    // Keyword matches
    const keywords = searchTerm.split(" ");
    keywords.forEach((keyword) => {
      if (keyword.length > 2) {
        const titleWords = help.title.toLowerCase().split(" ");
        const contentText = help.content.join(" ").toLowerCase();

        if (titleWords.some((word) => word.includes(keyword))) {
          relevance += 3;
        }

        if (contentText.includes(keyword)) {
          relevance += 1;
        }
      }
    });

    return relevance;
  }

  /**
   * Format keyboard shortcut for display
   */
  formatShortcut(keys) {
    const keyMap = {
      ctrl: "⌃",
      shift: "⇧",
      alt: "⌥",
      meta: "⌘",
      tab: "⇥",
      enter: "↵",
      space: "␣",
    };

    return keys
      .map((key) => keyMap[key.toLowerCase()] || key.toUpperCase())
      .join(" + ");
  }

  /**
   * Get system information for debugging
   */
  getSystemInfo() {
    return {
      shortcuts: this.getShortcuts().length,
      layout: this.layoutConfig.name,
      undoStack: this.undoStack.length,
      redoStack: this.redoStack.length,
      helpContexts: this.contextualHelp.size,
      userAgent: navigator.userAgent,
      screen: {
        width: screen.width,
        height: screen.height,
        devicePixelRatio: window.devicePixelRatio,
      },
    };
  }
}

// Global UX manager instance
let globalUXManager = null;

export const getUXManager = () => {
  if (!globalUXManager) {
    globalUXManager = new UXManager();
  }
  return globalUXManager;
};

export default UXManager;
