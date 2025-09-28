import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Clock } from 'lucide-react';

export default function EntityErrorHandler({ 
  error, 
  entityName, 
  onRetry, 
  showRetryButton = true,
  className = "" 
}) {
  const isRateLimit = error?.message?.includes('Rate limit') || 
                     error?.message?.includes('429') ||
                     error?.response?.status === 429;

  const getErrorMessage = () => {
    if (isRateLimit) {
      return {
        title: "Service Temporarily Busy",
        message: `Too many requests to the ${entityName} service. This is temporary and will resolve shortly.`,
        suggestion: "Please wait a moment before trying again, or continue using other features."
      };
    }
    
    return {
      title: "Loading Error",
      message: `Failed to load ${entityName} data.`,
      suggestion: "Please try refreshing or check your connection."
    };
  };

  const errorInfo = getErrorMessage();

  return (
    <Card className={`bg-white/90 dark:bg-slate-900/80 border-slate-300 dark:border-slate-800 ${className}`}>
      <CardContent className="p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          {isRateLimit ? (
            <Clock className="w-12 h-12 text-yellow-500" />
          ) : (
            <AlertTriangle className="w-12 h-12 text-red-500" />
          )}
          
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {errorInfo.title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              {errorInfo.message}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              {errorInfo.suggestion}
            </p>
          </div>

          {showRetryButton && (
            <Button 
              onClick={onRetry} 
              variant="outline"
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}

          {isRateLimit && (
            <div className="text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg max-w-md">
              <strong>Note:</strong> All other app features remain fully functional. 
              This only affects loading new data for this specific section.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}