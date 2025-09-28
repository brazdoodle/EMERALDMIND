/**
 * useAdvancedUX Hook - Advanced user experience features
 * Keyboard shortcuts, undo/redo, layouts, and contextual help
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getUXManager } from '../lib/ux/UXManager';

export const useAdvancedUX = (options = {}) => {
  const {
    enableShortcuts = true,
    enableUndoRedo = true,
    autoSave = false
  } = options;

  const [layout, setLayout] = useState('DEFAULT');
  const [shortcuts, setShortcuts] = useState([]);
  const [history, setHistory] = useState({ canUndo: false, canRedo: false });
  const [contextualHelp, setContextualHelp] = useState(null);
  
  const uxManager = useRef(getUXManager());
  const shortcutHandlers = useRef(new Map());

  // Initialize UX features
  useEffect(() => {
    const manager = uxManager.current;
    
    // Load shortcuts
    setShortcuts(manager.getShortcuts());
    
    // Load initial layout
    setLayout(manager.getLayout().name || 'DEFAULT');
    
    // Load history state
    setHistory(manager.getHistory());
    
    // Set up keyboard event listener
    if (enableShortcuts) {
      const handleKeyDown = (event) => {
        manager.handleKeyboardEvent(event);
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enableShortcuts]);

  // Register keyboard shortcut
  const registerShortcut = useCallback((shortcutKey, handler) => {
    uxManager.current.registerShortcut(shortcutKey, handler);
    shortcutHandlers.current.set(shortcutKey, handler);
  }, []);

  // Unregister keyboard shortcut
  const unregisterShortcut = useCallback((shortcutKey) => {
    uxManager.current.registerShortcut(shortcutKey, null);
    shortcutHandlers.current.delete(shortcutKey);
  }, []);

  // Change layout
  const changeLayout = useCallback((layoutName) => {
    uxManager.current.setLayout(layoutName);
    setLayout(layoutName);
  }, []);

  // Undo/Redo operations
  const addUndoAction = useCallback((action) => {
    if (!enableUndoRedo) return;
    
    uxManager.current.addUndoAction(action);
    setHistory(uxManager.current.getHistory());
  }, [enableUndoRedo]);

  const undo = useCallback(() => {
    if (!enableUndoRedo) return null;
    
    const action = uxManager.current.undo();
    setHistory(uxManager.current.getHistory());
    return action;
  }, [enableUndoRedo]);

  const redo = useCallback(() => {
    if (!enableUndoRedo) return null;
    
    const action = uxManager.current.redo();
    setHistory(uxManager.current.getHistory());
    return action;
  }, [enableUndoRedo]);

  // Contextual help
  const showHelp = useCallback((context) => {
    const help = uxManager.current.getContextualHelp(context);
    setContextualHelp(help);
  }, []);

  const hideHelp = useCallback(() => {
    setContextualHelp(null);
  }, []);

  const searchHelp = useCallback((query) => {
    return uxManager.current.searchHelp(query);
  }, []);

  // Layout presets
  const getLayoutPresets = useCallback(() => {
    return uxManager.current.getLayoutPresets();
  }, []);

  // Format shortcut for display
  const formatShortcut = useCallback((keys) => {
    return uxManager.current.formatShortcut(keys);
  }, []);

  return {
    // Shortcuts
    shortcuts,
    registerShortcut,
    unregisterShortcut,
    formatShortcut,
    
    // Layout
    layout,
    changeLayout,
    getLayoutPresets,
    
    // Undo/Redo
    history,
    addUndoAction,
    undo,
    redo,
    
    // Help
    contextualHelp,
    showHelp,
    hideHelp,
    searchHelp,
    
    // Manager access
    uxManager: uxManager.current
  };
};

export default useAdvancedUX;