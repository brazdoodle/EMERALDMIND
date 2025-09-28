import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, Bot, BrainCircuit, HardDrive } from 'lucide-react';

export default function SystemStatus({ aiStatus, knowledgeReady }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Ready</Badge>;
      case 'offline':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Offline</Badge>;
      case 'checking':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Checking</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Unknown</Badge>;
    }
  };

  return (
    <Card className="bg-slate-900/80 dark:bg-slate-900/80 light:bg-white/90 backdrop-blur-sm border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl shadow-xl">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-white dark:text-white light:text-slate-900 text-xl font-semibold tracking-tight flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-emerald-400" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300 dark:text-slate-300 light:text-slate-700">AI Engine</span>
          </div>
          {getStatusBadge(aiStatus)}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300 dark:text-slate-300 light:text-slate-700">Connection</span>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Online</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300 dark:text-slate-300 light:text-slate-700">Knowledge Base</span>
          </div>
          <Badge className={knowledgeReady ? 
            "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : 
            "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
          }>
            {knowledgeReady ? 'Loaded' : 'Loading'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}