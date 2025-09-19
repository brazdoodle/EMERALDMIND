import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, MapPin, Users, Zap, MessageSquare, 
  ArrowRight, ArrowDown, GitBranch, Eye,
  Gamepad2, Trophy, ShoppingCart, Home
} from 'lucide-react';

const scriptTypes = {
  event: {
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: Play,
    description: 'Triggered by player actions or map events'
  },
  npc: {
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: Users,
    description: 'NPC interactions and dialogue'
  },
  movement: {
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    icon: MapPin,
    description: 'Character and camera movement sequences'
  },
  battle: {
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: Zap,
    description: 'Battle initiation and victory/defeat handling'
  },
  text: {
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    icon: MessageSquare,
    description: 'Pure dialogue and text display'
  },
  cutscene: {
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    icon: Eye,
    description: 'Complex multi-step story sequences'
  }
};

const gameFlow = [
  {
    phase: 'Game Start',
    icon: Home,
    scripts: ['event'],
    description: 'Initial game state and intro sequences'
  },
  {
    phase: 'Map Entry',
    icon: MapPin,
    scripts: ['event', 'movement'],
    description: 'Player enters new area, triggers load events'
  },
  {
    phase: 'NPC Interaction',
    icon: Users,
    scripts: ['npc', 'text', 'movement'],
    description: 'Player talks to characters, gets items/info'
  },
  {
    phase: 'Story Events',
    icon: Play,
    scripts: ['event', 'cutscene', 'movement'],
    description: 'Major plot points and character development'
  },
  {
    phase: 'Battle Encounters',
    icon: Gamepad2,
    scripts: ['battle', 'event'],
    description: 'Wild Pokemon or trainer battles'
  },
  {
    phase: 'Victory/Progression',
    icon: Trophy,
    scripts: ['event', 'text'],
    description: 'Post-battle rewards and story advancement'
  }
];

const ScriptConnection = ({ from, to, label, isActive }) => (
  <div className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
    isActive ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-800/30'
  }`}>
    <ArrowRight className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
    <span className={`text-xs font-mono ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
      {label}
    </span>
  </div>
);

export default function ScriptFlowMap({ selectedScript = null }) {
  const [hoveredPhase, setHoveredPhase] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState(null);

  const getScriptTypeFromContent = (scriptContent) => {
    if (!scriptContent) return 'event';
    
    const content = scriptContent.toLowerCase();
    if (content.includes('trainerbattle') || content.includes('battle')) return 'battle';
    if (content.includes('applymovement') || content.includes('move.')) return 'movement';
    if (content.includes('msgbox') && !content.includes('special')) return 'text';
    if (content.includes('fadescreen') && content.includes('special')) return 'cutscene';
    if (content.includes('faceplayer') || content.includes('npc.item')) return 'npc';
    return 'event';
  };

  const activeScriptType = useMemo(() => {
    if (selectedScript?.content) {
      return getScriptTypeFromContent(selectedScript.content);
    }
    return null;
  }, [selectedScript]);

  const getRelevantPhases = (scriptType) => {
    return gameFlow.filter(phase => phase.scripts.includes(scriptType));
  };

  return (
    <Card className="bg-slate-900/80 border-slate-700 h-full">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-emerald-400" />
          Script Flow Visualization
        </CardTitle>
        <p className="text-slate-400 text-sm">
          Understanding where your scripts fit in the game's execution flow
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Script Type Legend */}
        <div>
          <h4 className="text-white font-medium mb-3">Script Types</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(scriptTypes).map(([type, config]) => {
              const Icon = config.icon;
              const isActive = activeScriptType === type;
              
              return (
                <div
                  key={type}
                  className={`p-3 rounded-lg border transition-all ${config.color} ${
                    isActive ? 'ring-2 ring-emerald-400/50 scale-105' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium capitalize text-sm">{type}</span>
                  </div>
                  <p className="text-xs opacity-80">{config.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Game Flow Visualization */}
        <div>
          <h4 className="text-white font-medium mb-3">Game Execution Flow</h4>
          <div className="space-y-3">
            {gameFlow.map((phase, index) => {
              const Icon = phase.icon;
              const isRelevant = activeScriptType ? phase.scripts.includes(activeScriptType) : false;
              const isHovered = hoveredPhase === index;
              
              return (
                <div key={index} className="space-y-2">
                  <div
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isRelevant
                        ? 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20'
                        : isHovered
                          ? 'bg-slate-800/50 border-slate-600'
                          : 'bg-slate-800/30 border-slate-700'
                    }`}
                    onMouseEnter={() => setHoveredPhase(index)}
                    onMouseLeave={() => setHoveredPhase(null)}
                    onClick={() => setSelectedPhase(selectedPhase === index ? null : index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isRelevant ? 'bg-emerald-500/20' : 'bg-slate-700/50'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            isRelevant ? 'text-emerald-400' : 'text-slate-400'
                          }`} />
                        </div>
                        <div>
                          <h5 className={`font-medium ${
                            isRelevant ? 'text-emerald-400' : 'text-white'
                          }`}>
                            {phase.phase}
                          </h5>
                          <p className="text-xs text-slate-400">{phase.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        {phase.scripts.map(scriptType => (
                          <Badge
                            key={scriptType}
                            className={`text-xs ${
                              scriptType === activeScriptType
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-slate-700/50 text-slate-400 border-slate-600'
                            }`}
                          >
                            {scriptType}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Connection Arrow */}
                  {index < gameFlow.length - 1 && (
                    <div className="flex justify-center">
                      <ArrowDown className={`w-4 h-4 ${
                        isRelevant ? 'text-emerald-400' : 'text-slate-500'
                      }`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Script Analysis */}
        {selectedScript && (
          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-600">
            <h4 className="text-white font-medium mb-2">Current Script Analysis</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">Type:</span>
                <Badge className={scriptTypes[activeScriptType]?.color || 'bg-gray-500/20 text-gray-400'}>
                  {activeScriptType}
                </Badge>
              </div>
              <div className="text-slate-400 text-sm">
                <span className="font-medium">Relevant Phases:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {getRelevantPhases(activeScriptType).map(phase => (
                    <span key={phase.phase} className="text-emerald-400 text-xs">
                      {phase.phase}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}