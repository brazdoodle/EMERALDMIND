import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const severityIcons = {
  info: Info,
  warning: AlertTriangle,
  error: AlertTriangle,
  suggestion: CheckCircle,
  success: CheckCircle
};

const severityColors = {
  info: 'green',
  warning: 'yellow', 
  error: 'red',
  suggestion: 'cyan',
  success: 'green'
};

export default function AssistantCommentary({ comments, isActive }) {
  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-green-400" />
          Lab Assistant Commentary
          {isActive && (
            <Badge variant="outline" className="border-green-400 text-green-400 text-xs">
              LIVE
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          <AnimatePresence>
            {comments.map((comment, index) => {
              const SeverityIcon = severityIcons[comment.severity] || Info;
              const color = severityColors[comment.severity] || 'gray';
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-3 bg-slate-800 rounded border-l-4 border-l-${color}-400`}
                >
                  <div className="flex items-start gap-3">
                    <SeverityIcon className={`w-4 h-4 text-${color}-400 mt-0.5 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {comment.commentary}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge 
                          variant="outline" 
                          className={`border-${color}-400 text-${color}-400 text-xs`}
                        >
                          {comment.severity.toUpperCase()}
                        </Badge>
                        <span className="text-slate-500 text-xs font-mono">
                          {comment.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {comments.length === 0 && (
            <div className="text-center py-6">
              <Bot className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">
                {isActive ? 'Monitoring your ROM...' : 'Start emulation to see commentary'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}