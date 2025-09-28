/**
 * UXControlPanel - Advanced user experience control panel
 * Keyboard shortcuts, layout management, undo/redo, and help system
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useAdvancedUX from '@/hooks/useAdvancedUX';
import { motion } from 'framer-motion';
import {
    ChevronRight,
    Eye,
    HelpCircle,
    History,
    Info,
    Keyboard,
    Layout,
    Monitor,
    RotateCcw,
    RotateCw,
    Settings,
    Smartphone,
    Tablet,
    X,
    Zap
} from 'lucide-react';
import React, { useState } from 'react';

const UXControlPanel = ({ open, onOpenChange }) => {
  const [activeTab, setActiveTab] = useState('shortcuts');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHelpContext, setSelectedHelpContext] = useState(null);
  
  const {
    shortcuts,
    layout,
    changeLayout,
    getLayoutPresets,
    history,
    undo,
    redo,
    contextualHelp,
    showHelp,
    hideHelp,
    searchHelp,
    formatShortcut,
    uxManager
  } = useAdvancedUX({
    enableShortcuts: true,
    enableUndoRedo: true
  });

  const [helpSearchResults, setHelpSearchResults] = useState([]);

  const handleHelpSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = searchHelp(query);
      setHelpSearchResults(results);
    } else {
      setHelpSearchResults([]);
    }
  };

  const getShortcutCategoryIcon = (shortcutKey) => {
    if (shortcutKey.includes('GENERATE') || shortcutKey.includes('TEAM')) return Zap;
    if (shortcutKey.includes('SAVE') || shortcutKey.includes('EXPORT')) return Settings;
    if (shortcutKey.includes('TAB') || shortcutKey.includes('FOCUS')) return Layout;
    if (shortcutKey.includes('UNDO') || shortcutKey.includes('REDO')) return History;
    return Keyboard;
  };

  const getLayoutIcon = (layoutKey) => {
    switch (layoutKey) {
      case 'COMPACT': return Smartphone;
      case 'WIDE': return Monitor;
      case 'FOCUS': return Eye;
      default: return Tablet;
    }
  };

  const formatActionType = (type) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-500" />
            Advanced User Experience
            <Badge variant="outline" className="ml-2">
              Power User Features
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="shortcuts" className="flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Shortcuts
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Help
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 max-h-[calc(90vh-200px)] overflow-y-auto">
            <TabsContent value="shortcuts" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Keyboard Shortcuts</h3>
                <Badge variant="outline">
                  {shortcuts.filter(s => s.active).length} active
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shortcuts.map((shortcut, index) => {
                  const Icon = getShortcutCategoryIcon(shortcut.action);
                  
                  return (
                    <motion.div
                      key={shortcut.action}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`${shortcut.active ? 'border-blue-200' : 'border-slate-200 opacity-60'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon className={`w-5 h-5 ${shortcut.active ? 'text-blue-500' : 'text-slate-400'}`} />
                              <div>
                                <h4 className="font-medium text-sm">{shortcut.description}</h4>
                                <div className="flex items-center gap-1 mt-1">
                                  {shortcut.keys.map((key, i) => (
                                    <React.Fragment key={i}>
                                      <Badge variant="outline" className="text-xs px-2 py-0.5">
                                        {key.toUpperCase()}
                                      </Badge>
                                      {i < shortcut.keys.length - 1 && (
                                        <span className="text-slate-400 text-xs">+</span>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <Switch
                              checked={shortcut.active}
                              onCheckedChange={(checked) => {
                                uxManager.toggleShortcut(shortcut.action, checked);
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="layout" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Workspace Layout</h3>
                <Badge variant="outline">
                  Current: {getLayoutPresets().find(p => p.key === layout)?.name || 'Default'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getLayoutPresets().map((preset) => {
                  const Icon = getLayoutIcon(preset.key);
                  const isActive = layout === preset.key;
                  
                  return (
                    <motion.div
                      key={preset.key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all ${isActive 
                          ? 'ring-2 ring-blue-500 border-blue-300 bg-blue-50' 
                          : 'hover:border-slate-300'
                        }`}
                        onClick={() => changeLayout(preset.key)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Icon className={`w-8 h-8 ${isActive ? 'text-blue-500' : 'text-slate-400'}`} />
                            <div>
                              <h4 className="font-medium">{preset.name}</h4>
                              <p className="text-sm text-slate-600 mt-1">
                                {preset.description}
                              </p>
                              {isActive && (
                                <Badge className="mt-2" variant="default">
                                  Active
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Layout Configuration</h4>
                <div className="text-sm text-slate-600">
                  <p>Layouts automatically adapt to your screen size and preferences.</p>
                  <p className="mt-2">
                    <strong>Tip:</strong> Use Ctrl+Tab to quickly switch between layout modes.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Action History</h3>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={undo}
                    disabled={!history.canUndo}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Undo
                  </Button>
                  <Button
                    onClick={redo}
                    disabled={!history.canRedo}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    Redo
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Undo Stack</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {history.undoStack && history.undoStack.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {history.undoStack.slice(0, 10).map((action, index) => (
                          <div key={action.id} className="flex items-center justify-between text-sm border-b pb-2">
                            <span className="font-medium">
                              {formatActionType(action.type)}
                            </span>
                            <span className="text-slate-500 text-xs">
                              {new Date(action.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm text-center py-4">
                        No actions to undo
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Redo Stack</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {history.redoStack && history.redoStack.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {history.redoStack.slice(0, 10).map((action, index) => (
                          <div key={action.id} className="flex items-center justify-between text-sm border-b pb-2">
                            <span className="font-medium">
                              {formatActionType(action.type)}
                            </span>
                            <span className="text-slate-500 text-xs">
                              {new Date(action.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm text-center py-4">
                        No actions to redo
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Undo/Redo System
                    </p>
                    <p className="text-blue-700 dark:text-blue-300 mt-1">
                      Track and revert changes to trainers and teams. Use Ctrl+Z to undo and Ctrl+Y to redo actions.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="help" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search help topics..."
                    value={searchQuery}
                    onChange={(e) => handleHelpSearch(e.target.value)}
                    className="w-full"
                  />
                </div>
                {contextualHelp && (
                  <Button
                    onClick={hideHelp}
                    variant="outline"
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close Help
                  </Button>
                )}
              </div>

              {searchQuery && helpSearchResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Search Results</h4>
                  {helpSearchResults.map((result, index) => (
                    <Card 
                      key={index}
                      className="cursor-pointer hover:border-blue-300"
                      onClick={() => {
                        setSelectedHelpContext(result.context);
                        showHelp(result.context);
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">{result.help.title}</h5>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          {result.help.content[0].substring(0, 100)}...
                        </p>
                        <Badge variant="outline" className="mt-2">
                          Relevance: {result.relevance}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {contextualHelp && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-blue-500" />
                        {contextualHelp.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {contextualHelp.content.map((paragraph, index) => (
                        <p key={index} className="text-sm text-slate-700 dark:text-slate-300">
                          {paragraph}
                        </p>
                      ))}
                      
                      {contextualHelp.shortcuts && contextualHelp.shortcuts.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-medium text-sm mb-2">Related Shortcuts:</h5>
                          <div className="flex flex-wrap gap-2">
                            {contextualHelp.shortcuts.map((shortcutKey) => {
                              const shortcut = shortcuts.find(s => s.action === shortcutKey);
                              return shortcut && (
                                <div key={shortcutKey} className="flex items-center gap-1 text-xs">
                                  <span className="text-slate-600">{shortcut.description}:</span>
                                  {shortcut.keys.map((key, i) => (
                                    <React.Fragment key={i}>
                                      <Badge variant="outline" className="text-xs px-1 py-0">
                                        {key.toUpperCase()}
                                      </Badge>
                                      {i < shortcut.keys.length - 1 && (
                                        <span className="text-slate-400">+</span>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {!contextualHelp && !searchQuery && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uxManager.getAllHelpContexts().map((context) => (
                    <Card 
                      key={context.key}
                      className="cursor-pointer hover:border-blue-300"
                      onClick={() => {
                        setSelectedHelpContext(context.key);
                        showHelp(context.key);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{context.title}</h4>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UXControlPanel;