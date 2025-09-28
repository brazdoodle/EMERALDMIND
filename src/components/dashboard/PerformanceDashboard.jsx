// Performance Monitoring Dashboard
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppState } from '@/lib/appState.jsx';

const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    bundleSize: 0,
    cacheHitRate: 0,
    llmResponseTime: 0,
    errorRate: 0,
  });

  const [recommendations, setRecommendations] = useState([]);

  const { selectors } = useAppState();

  // Collect performance metrics
  useEffect(() => {
    const collectMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const memory = performance.memory;
      
      setMetrics({
        loadTime: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
        renderTime: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
        memoryUsage: memory ? (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100 : 0,
        bundleSize: 953.65, // Current bundle size in KB
        cacheHitRate: selectors.getCacheStats?.()?.hitRate || 0,
        llmResponseTime: selectors.getAverageResponseTime?.() || 0,
        errorRate: selectors.getErrorRate?.() || 0,
      });
    };

    collectMetrics();
    const interval = setInterval(collectMetrics, 5000);
    return () => clearInterval(interval);
  }, [selectors]);

  // Generate performance recommendations
  const performanceRecommendations = useMemo(() => {
    const recs = [];

    if (metrics.bundleSize > 500) {
      recs.push({
        type: 'warning',
        title: 'Large Bundle Size',
        description: `Bundle size is ${metrics.bundleSize}KB. Consider code splitting and lazy loading.`,
        action: 'Implement lazy loading for heavy components'
      });
    }

    if (metrics.memoryUsage > 70) {
      recs.push({
        type: 'error',
        title: 'High Memory Usage',
        description: `Memory usage is ${metrics.memoryUsage.toFixed(1)}%. Check for memory leaks.`,
        action: 'Review component cleanup and memoization'
      });
    }

    if (metrics.cacheHitRate < 60) {
      recs.push({
        type: 'warning',
        title: 'Low Cache Hit Rate',
        description: `Cache hit rate is ${metrics.cacheHitRate}%. Optimize caching strategy.`,
        action: 'Review cache keys and expiration times'
      });
    }

    if (metrics.llmResponseTime > 3000) {
      recs.push({
        type: 'warning',
        title: 'Slow LLM Responses',
        description: `Average LLM response time is ${metrics.llmResponseTime}ms.`,
        action: 'Implement response caching and context compression'
      });
    }

    if (metrics.errorRate > 5) {
      recs.push({
        type: 'error',
        title: 'High Error Rate',
        description: `Error rate is ${metrics.errorRate}%. Check error handling.`,
        action: 'Review error boundaries and fallback strategies'
      });
    }

    return recs;
  }, [metrics]);

  const getMetricColor = (value, thresholds) => {
    if (value >= thresholds.danger) return 'destructive';
    if (value >= thresholds.warning) return 'secondary';
    return 'default';
  };

  const MetricCard = ({ title, value, unit, thresholds, description }) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            {typeof value === 'number' ? value.toFixed(1) : value}
            <span className="text-sm font-normal text-muted-foreground ml-1">
              {unit}
            </span>
          </div>
          <Badge variant={getMetricColor(value, thresholds)}>
            {value >= thresholds.danger ? 'Poor' : 
             value >= thresholds.warning ? 'Fair' : 'Good'}
          </Badge>
        </div>
        {thresholds && (
          <Progress 
            value={Math.min((value / thresholds.danger) * 100, 100)} 
            className="mt-2"
          />
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  const clearCaches = () => {
    if ('caches' in window) {
      caches.keys().then(_names => {
        names.forEach(name => caches.delete(name));
      });
    }
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor application performance and optimization opportunities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearCaches}>
            Clear Caches
          </Button>
          <Button onClick={() => window.location.reload()}>
            Refresh Metrics
          </Button>
        </div>
      </div>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="optimization">Optimization Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Page Load Time"
              value={metrics.loadTime}
              unit="ms"
              thresholds={{ warning: 1000, danger: 3000 }}
              description="Time to load initial page content"
            />
            
            <MetricCard
              title="Memory Usage"
              value={metrics.memoryUsage}
              unit="%"
              thresholds={{ warning: 60, danger: 80 }}
              description="JavaScript heap memory utilization"
            />
            
            <MetricCard
              title="Bundle Size"
              value={metrics.bundleSize}
              unit="KB"
              thresholds={{ warning: 500, danger: 1000 }}
              description="Total JavaScript bundle size"
            />
            
            <MetricCard
              title="Cache Hit Rate"
              value={metrics.cacheHitRate}
              unit="%"
              thresholds={{ warning: 40, danger: 20 }}
              description="Percentage of requests served from cache"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="LLM Response Time"
              value={metrics.llmResponseTime}
              unit="ms"
              thresholds={{ warning: 2000, danger: 5000 }}
              description="Average AI model response time"
            />
            
            <MetricCard
              title="Error Rate"
              value={metrics.errorRate}
              unit="%"
              thresholds={{ warning: 2, danger: 5 }}
              description="Percentage of failed operations"
            />
            
            <MetricCard
              title="Render Time"
              value={metrics.renderTime}
              unit="ms"
              thresholds={{ warning: 500, danger: 1000 }}
              description="DOM content ready time"
            />
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {performanceRecommendations.length > 0 ? (
            performanceRecommendations.map((rec, index) => (
              <Alert key={index} variant={rec.type === 'error' ? 'destructive' : 'default'}>
                <AlertDescription>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-sm mt-1">{rec.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        <strong>Recommended Action:</strong> {rec.action}
                      </p>
                    </div>
                    <Badge variant={rec.type === 'error' ? 'destructive' : 'secondary'}>
                      {rec.type}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-green-600">
                    Great Performance!
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    All performance metrics are within acceptable ranges.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bundle Optimization</CardTitle>
                <CardDescription>
                  Tools to analyze and optimize bundle size
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Current Bundle Size</span>
                  <Badge variant={metrics.bundleSize > 500 ? 'destructive' : 'default'}>
                    {metrics.bundleSize}KB
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    Analyze Bundle Composition
                  </Button>
                  <Button variant="outline" className="w-full">
                    Generate Bundle Report
                  </Button>
                  <Button variant="outline" className="w-full">
                    Identify Unused Dependencies
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache Management</CardTitle>
                <CardDescription>
                  Optimize caching strategies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Cache Hit Rate</span>
                  <Badge variant={metrics.cacheHitRate < 60 ? 'destructive' : 'default'}>
                    {metrics.cacheHitRate}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    View Cache Statistics
                  </Button>
                  <Button variant="outline" className="w-full">
                    Optimize Cache Keys
                  </Button>
                  <Button variant="outline" className="w-full" onClick={clearCaches}>
                    Clear All Caches
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>LLM Performance</CardTitle>
              <CardDescription>
                Optimize AI model interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics.llmResponseTime.toFixed(0)}ms</div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{selectors.getTotalLLMCalls?.() || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Calls</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{selectors.getCachedResponses?.() || 0}</div>
                  <div className="text-sm text-muted-foreground">Cached Responses</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;