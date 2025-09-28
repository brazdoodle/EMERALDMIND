/**
 * PerformanceDashboard - Real-time performance monitoring and optimization
 * Displays cache stats, performance metrics, and optimization suggestions
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import usePerformance from '@/hooks/usePerformance';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock,
    Cpu,
    Database,
    HardDrive,
    RefreshCw,
    TrendingUp,
    Zap
} from 'lucide-react';
import { useState } from 'react';

const PerformanceDashboard = ({ open, onOpenChange }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSuggestions, setExpandedSuggestions] = useState(new Set());
  
  const {
    performanceData,
    optimizationSuggestions,
    isOptimizing,
    runAutoOptimization,
    applySuggestion,
    cache
  } = usePerformance({
    enableAutoOptimization: false, // Manual control in dashboard
    monitorMemory: true
  });

  const toggleSuggestionExpansion = (index) => {
    const newExpanded = new Set(expandedSuggestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSuggestions(newExpanded);
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'memory': return HardDrive;
      case 'performance': return Cpu;
      case 'cache': return Database;
      default: return AlertTriangle;
    }
  };

  const getSuggestionColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-500 bg-blue-50 border-blue-200';
      default: return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };

  if (!performanceData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-3 text-lg">Loading performance data...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const { cacheStats, slowOperations, topOperations, memoryUsage } = performanceData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Performance Dashboard
            <Badge variant={isOptimizing ? "default" : "outline"} className="ml-2">
              {isOptimizing ? 'Optimizing...' : 'Ready'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cache">Cache</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <div className="mt-4 max-h-[calc(90vh-200px)] overflow-y-auto">
            <TabsContent value="overview" className="space-y-4">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Database className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-slate-600">Cache Entries</p>
                        <p className="text-2xl font-bold">{cacheStats.totalEntries}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <HardDrive className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="text-sm text-slate-600">Memory Usage</p>
                        <p className="text-2xl font-bold">{cacheStats.memoryUsageFormatted}</p>
                        <Progress 
                          value={cacheStats.utilization * 100} 
                          className="mt-1 h-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-purple-500" />
                      <div>
                        <p className="text-sm text-slate-600">Hit Rate</p>
                        <p className="text-2xl font-bold">
                          {(cacheStats.hitRate * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-8 h-8 text-orange-500" />
                      <div>
                        <p className="text-sm text-slate-600">Suggestions</p>
                        <p className="text-2xl font-bold">{optimizationSuggestions.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={runAutoOptimization}
                  disabled={isOptimizing || optimizationSuggestions.length === 0}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  {isOptimizing ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  Auto Optimize
                </Button>
                
                <Button
                  onClick={() => cache.clearAll()}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Clear All Cache
                </Button>
              </div>

              {/* Memory Usage Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Memory Usage Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(memoryUsage.breakdown).map(([category, data]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-400 rounded"></div>
                          <span className="text-sm font-medium capitalize">
                            {category.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">{data.sizeFormatted}</span>
                          <Badge variant="outline">{data.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cache" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Cache Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cache Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-600">Total Entries</p>
                        <p className="text-2xl font-bold">{cacheStats.totalEntries}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Hit Rate</p>
                        <p className="text-2xl font-bold">{(cacheStats.hitRate * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Usage</span>
                        <span>{(cacheStats.utilization * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={cacheStats.utilization * 100} />
                      <p className="text-xs text-slate-500 mt-1">
                        {cacheStats.memoryUsageFormatted} / {cacheStats.maxMemoryFormatted}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Category Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cache Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(cacheStats.categoryStats).map(([category, stats]) => (
                        <div key={category} className="border rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium capitalize">
                              {category.replace(/_/g, ' ')}
                            </h4>
                            <Badge variant="outline">{stats.count} entries</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                            <div>Size: {((stats.size || 0) / 1024).toFixed(1)} KB</div>
                            <div>Avg Access: {(stats.avgAccess || 0).toFixed(1)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top Operations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Top Operations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {topOperations.slice(0, 8).map((op, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{op.operation}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{op.count} calls</Badge>
                            {op.metrics && (
                              <span className="text-slate-500">
                                {op.metrics.avgDuration.toFixed(1)}ms avg
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Slow Operations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-500" />
                      Recent Slow Operations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {slowOperations.length === 0 ? (
                        <div className="text-center py-4 text-slate-500">
                          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                          No slow operations detected
                        </div>
                      ) : (
                        slowOperations.slice(0, 6).map((op, index) => (
                          <div key={index} className="border rounded p-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{op.operation}</span>
                              <Badge variant="destructive">
                                {op.duration.toFixed(1)}ms
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(op.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="optimization" className="space-y-4">
              {optimizationSuggestions.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-medium mb-2">All Systems Optimal</h3>
                    <p className="text-slate-600">
                      No optimization suggestions at this time. Your application is running efficiently!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      Optimization Suggestions ({optimizationSuggestions.length})
                    </h3>
                    <Button
                      onClick={runAutoOptimization}
                      disabled={isOptimizing}
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-cyan-500"
                    >
                      {isOptimizing ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 mr-2" />
                      )}
                      Apply All High Priority
                    </Button>
                  </div>

                  {optimizationSuggestions.map((suggestion, index) => {
                    const Icon = getSuggestionIcon(suggestion.type);
                    const isExpanded = expandedSuggestions.has(index);
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className={`border-l-4 ${getSuggestionColor(suggestion.priority)}`}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Icon className="w-5 h-5" />
                                <div>
                                  <h4 className="font-medium">{suggestion.title}</h4>
                                  <Badge 
                                    variant={suggestion.priority === 'high' ? 'destructive' : 'outline'}
                                    className="mt-1"
                                  >
                                    {suggestion.priority} priority
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {suggestion.action && (
                                  <Button
                                    onClick={() => applySuggestion(suggestion)}
                                    disabled={isOptimizing}
                                    size="sm"
                                    variant="outline"
                                  >
                                    Apply Fix
                                  </Button>
                                )}
                                <Button
                                  onClick={() => toggleSuggestionExpansion(index)}
                                  variant="ghost"
                                  size="sm"
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <CardContent className="pt-0">
                                  <p className="text-sm text-slate-600 mb-2">
                                    {suggestion.description}
                                  </p>
                                  <p className="text-sm font-medium text-slate-800">
                                    Recommendation: {suggestion.recommendation}
                                  </p>
                                  {suggestion.operations && (
                                    <div className="mt-2">
                                      <p className="text-xs text-slate-500 mb-1">Affected operations:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {suggestion.operations.map((op, i) => (
                                          <Badge key={i} variant="outline" className="text-xs">
                                            {op}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PerformanceDashboard;