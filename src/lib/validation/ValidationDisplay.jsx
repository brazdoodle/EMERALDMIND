/**
 * ValidationDisplay Component - User-friendly validation results display
 * Shows errors, warnings, and suggestions with proper styling and actions
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Info,
    Lightbulb,
    RotateCcw,
    X
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { VALIDATION_LEVELS } from './ValidationEngine';

const ValidationDisplay = ({ 
  validationResult, 
  onDismiss, 
  onFix, 
  showSuggestions = true,
  compact = false,
  className = ""
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [filterLevel, setFilterLevel] = useState('all');
  const [dismissedIssues, setDismissedIssues] = useState(new Set());

  // Memoized filtering and sorting of issues
  const filteredIssues = useMemo(() => {
    if (!validationResult) return [];

    let allIssues = [
      ...validationResult.issues.map(issue => ({ ...issue, type: 'issue' })),
      ...validationResult.warnings.map(warning => ({ ...warning, type: 'warning' }))
    ];

    if (showSuggestions) {
      allIssues.push(...validationResult.suggestions.map(suggestion => ({ 
        ...suggestion, 
        type: 'suggestion',
        level: VALIDATION_LEVELS.INFO 
      })));
    }

    // Filter by level
    if (filterLevel !== 'all') {
      allIssues = allIssues.filter(issue => issue.level === filterLevel);
    }

    // Filter out dismissed issues
    allIssues = allIssues.filter(issue => !dismissedIssues.has(issue.code));

    // Sort by severity
    const severityOrder = {
      [VALIDATION_LEVELS.CRITICAL]: 0,
      [VALIDATION_LEVELS.ERROR]: 1,
      [VALIDATION_LEVELS.WARNING]: 2,
      [VALIDATION_LEVELS.INFO]: 3
    };

    return allIssues.sort((a, b) => severityOrder[a.level] - severityOrder[b.level]);
  }, [validationResult, filterLevel, dismissedIssues, showSuggestions]);

  // Count issues by level
  const issueCounts = useMemo(() => {
    if (!validationResult) return {};
    
    const counts = {
      [VALIDATION_LEVELS.CRITICAL]: 0,
      [VALIDATION_LEVELS.ERROR]: 0,
      [VALIDATION_LEVELS.WARNING]: 0,
      [VALIDATION_LEVELS.INFO]: 0
    };

    filteredIssues.forEach(issue => {
      counts[issue.level] = (counts[issue.level] || 0) + 1;
    });

    return counts;
  }, [filteredIssues]);

  const getIconForLevel = (level) => {
    switch (level) {
      case VALIDATION_LEVELS.CRITICAL:
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case VALIDATION_LEVELS.ERROR:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case VALIDATION_LEVELS.WARNING:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case VALIDATION_LEVELS.INFO:
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getColorForLevel = (level) => {
    switch (level) {
      case VALIDATION_LEVELS.CRITICAL:
        return 'border-red-600 bg-red-50 dark:bg-red-900/20';
      case VALIDATION_LEVELS.ERROR:
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case VALIDATION_LEVELS.WARNING:
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case VALIDATION_LEVELS.INFO:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const dismissIssue = (issueCode) => {
    setDismissedIssues(prev => new Set([...prev, issueCode]));
  };

  const handleFix = (issue) => {
    if (onFix) {
      onFix(issue);
    }
  };

  if (!validationResult) {
    return null;
  }

  const totalIssues = filteredIssues.length;
  const hasErrors = issueCounts[VALIDATION_LEVELS.ERROR] > 0 || issueCounts[VALIDATION_LEVELS.CRITICAL] > 0;

  if (totalIssues === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">Validation Passed</span>
        </div>
        <p className="text-sm text-green-600 dark:text-green-300 mt-1">
          No issues found. Everything looks good!
        </p>
      </motion.div>
    );
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${hasErrors ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'} border rounded-lg p-3 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasErrors ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            )}
            <span className="text-sm font-medium">
              {totalIssues} validation {totalIssues === 1 ? 'issue' : 'issues'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {Object.entries(issueCounts).map(([level, count]) => 
              count > 0 && (
                <Badge 
                  key={level} 
                  variant="outline" 
                  className={`text-xs ${getColorForLevel(level)}`}
                >
                  {count}
                </Badge>
              )
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {hasErrors ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            )}
            Validation Results
            <Badge variant={hasErrors ? "destructive" : "secondary"} className="ml-2">
              {totalIssues} {totalIssues === 1 ? 'issue' : 'issues'}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Filter Controls */}
            <select 
              value={filterLevel} 
              onChange={(e) => setFilterLevel(e.target.value)}
              className="text-xs border rounded px-2 py-1 bg-white dark:bg-slate-800"
            >
              <option value="all">All Issues</option>
              <option value={VALIDATION_LEVELS.CRITICAL}>Critical</option>
              <option value={VALIDATION_LEVELS.ERROR}>Errors</option>
              <option value={VALIDATION_LEVELS.WARNING}>Warnings</option>
              <option value={VALIDATION_LEVELS.INFO}>Info</option>
            </select>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
            
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Issue Summary */}
        <div className="flex items-center gap-4 text-sm">
          {Object.entries(issueCounts).map(([level, count]) => 
            count > 0 && (
              <div key={level} className="flex items-center gap-1">
                {getIconForLevel(level)}
                <span className="capitalize">{level}: {count}</span>
              </div>
            )
          )}
        </div>
      </CardHeader>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredIssues.map((issue, index) => (
                  <motion.div
                    key={`${issue.code}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border rounded-lg p-3 ${getColorForLevel(issue.level)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIconForLevel(issue.level)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">
                            {issue.message}
                          </h4>
                          {issue.field && (
                            <Badge variant="outline" className="text-xs">
                              {issue.field}
                            </Badge>
                          )}
                        </div>
                        
                        {issue.suggestion && (
                          <div className="flex items-start gap-2 mt-2 p-2 bg-white/50 dark:bg-slate-800/50 rounded">
                            <Lightbulb className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {issue.suggestion}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {onFix && issue.type !== 'suggestion' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFix(issue)}
                            className="text-xs"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Fix
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissIssue(issue.code)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {issue.code && (
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Code: {issue.code}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {dismissedIssues.size > 0 && (
                <div className="mt-4 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDismissedIssues(new Set())}
                    className="text-xs"
                  >
                    Show {dismissedIssues.size} dismissed issue{dismissedIssues.size !== 1 ? 's' : ''}
                  </Button>
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default ValidationDisplay;