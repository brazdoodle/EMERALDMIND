/**
 * Desktop App Configuration Guide
 * 
 * To compile this React app as a desktop application, you have several options:
 * 
 * OPTION 1: TAURI (Recommended - Small bundle, fast performance)
 * 1. Install Rust: https://rustup.rs/
 * 2. Install Tauri CLI: npm install -g @tauri-apps/cli
 * 3. Add tauri.conf.json to root directory
 * 4. Run: tauri build
 * 
 * OPTION 2: ELECTRON (Most compatible)
 * 1. Install: npm install electron electron-builder --save-dev
 * 2. Add main.js file for Electron
 * 3. Update package.json scripts
 * 4. Run: npm run electron-pack
 * 
 * OPTION 3: PWA (Lightweight, browser-based but installable)
 * 1. Add service worker
 * 2. Add web app manifest
 * 3. Enable PWA features
 */

export const DESKTOP_CONFIG = {
  // App metadata
  APP_NAME: "EmeraldMind",
  APP_DESCRIPTION: "Professional ROM Hacking Development Environment", 
  APP_VERSION: "1.0.0",
  
  // Default settings for desktop app
  DEFAULT_SETTINGS: {
    ollama_url: "http://localhost:11434",
    offline_mode: false,
    auto_backup: true,
    theme: "dark",
    performance_mode: "balanced" // "battery", "balanced", "performance"
  },
  
  // Window configuration
  WINDOW_CONFIG: {
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webSecurity: false, // Allows local file access
    contextIsolation: true
  }
};

// Settings management for desktop app
export class DesktopSettings {
  static getSettings() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('emeraldmind-settings');
      return stored ? JSON.parse(stored) : DESKTOP_CONFIG.DEFAULT_SETTINGS;
    }
    return DESKTOP_CONFIG.DEFAULT_SETTINGS;
  }
  
  static saveSetting(key, value) {
    if (typeof window !== 'undefined' && window.localStorage) {
      const current = this.getSettings();
      current[key] = value;
      localStorage.setItem('emeraldmind-settings', JSON.stringify(current));
    }
  }
  
  static isDesktopApp() {
    // Detect if running in Electron or Tauri
    return typeof window !== 'undefined' && (
      window.electronAPI || 
      window.__TAURI__ ||
      navigator.userAgent.includes('Electron')
    );
  }
}

export default DESKTOP_CONFIG;