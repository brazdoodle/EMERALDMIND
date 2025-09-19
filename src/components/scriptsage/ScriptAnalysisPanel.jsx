import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Play, Zap, FileText, CheckCircle, AlertCircle, Bot, Download, FlaskConical } from "lucide-react";

export default function ScriptAnalysisPanel({ analysis, onAnalyze, onGenerate, isAnalyzing, ollamaStatus, onExport, onShowAssistant }) {

  const getStatusInfo = () => {
    switch (ollamaStatus) {
      case 'ready': return { color: 'text-emerald-400', text: 'AI Ready' };
      case 'slow': return { color: 'text-yellow-400', text: 'AI Slow' };
      case 'offline': return { color: 'text-red-400', text: 'AI Offline' };
      default: return { color: 'text-slate-400', text: 'AI Status Unknown' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="flex flex-col space-y-4 h-full">
      {/* AI Status & Actions */}
      <Card className="bg-slate-900/80 border-slate-800 rounded-xl">
        <CardHeader className="p-3 flex flex-row items-center justify-between">
           <CardTitle className="text-sm text-white font-light flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${statusInfo.color.replace('text-', 'bg-')}`} />
             <span className={statusInfo.color}>{statusInfo.text}</span>
           </CardTitle>
           <div>
             <Button onClick={onShowAssistant} variant="outline" size="sm" className="h-7 px-2 mr-1 border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
               <FlaskConical className="w-3 h-3"/>
             </Button>
             <Button onClick={onExport} variant="outline" size="sm" className="h-7 px-2 border-blue-400/50 text-blue-400 hover:bg-blue-500/10">
               <Download className="w-3 h-3"/>
             </Button>
           </div>
        </CardHeader>
      </Card>
      
      {/* AI Generator */}
      <Card className="bg-slate-900/80 border-slate-800 rounded-xl">
        <CardHeader className="p-3">
          <CardTitle className="text-sm text-white font-light flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-purple-400" /> AI Script Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
          <Button onClick={() => onGenerate('Advanced NPC with dialogue branches')} size="sm" className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-xs"><Play className="w-3 h-3 mr-2" />Advanced NPC</Button>
          <Button onClick={() => onGenerate('Multi-character cutscene with movement')} size="sm" className="w-full justify-start bg-cyan-600 hover:bg-cyan-700 text-xs"><Play className="w-3 h-3 mr-2" />Epic Cutscene</Button>
          <Button onClick={() => onGenerate('Gym leader battle with ceremony')} size="sm" className="w-full justify-start bg-red-600 hover:bg-red-700 text-xs"><Zap className="w-3 h-3 mr-2" />Gym Battle</Button>
        </CardContent>
      </Card>

      {/* Analysis Panel */}
      <Card className="bg-slate-900/80 border-slate-800 rounded-xl flex-1">
        <CardHeader className="p-3">
          <CardTitle className="text-sm text-white font-light flex items-center gap-2">
            {isAnalyzing ? <Bot className="w-4 h-4 text-purple-400 animate-pulse" /> : analysis?.status === 'analyzed' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <FileText className="w-4 h-4 text-slate-400" />}
            Script Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 h-full flex flex-col">
          <Button onClick={onAnalyze} disabled={isAnalyzing} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black mb-3">
            {isAnalyzing ? <Bot className="w-4 h-4 mr-2 animate-pulse" /> : <Zap className="w-4 h-4 mr-2" />}
            {isAnalyzing ? 'Analyzing...' : 'Analyze Script'}
          </Button>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-2 flex-1 max-h-48 overflow-y-auto">
            {analysis ? (
              <div className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-tight">
                {analysis.content}
              </div>
            ) : (
              <p className="text-slate-400 text-center text-xs pt-4">Click "Analyze Script" for AI feedback.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}