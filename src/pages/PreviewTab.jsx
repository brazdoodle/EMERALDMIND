import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Monitor, Play, Pause, RefreshCw,
  FlaskConical, Terminal, Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';
import AssistantCommentary from '@/components/emulator/AssistantCommentary';
import MemoryViewer from '@/components/emulator/MemoryViewer';

const mockSessionData = {
  assistant_commentary: [
    { severity: 'info', commentary: 'Session started. ROM base: Emerald (U).', timestamp: '00:01' },
    { severity: 'warning', commentary: 'Flag 0x201 (RIVAL_BATTLE_1) checked, but associated script not found on map.', timestamp: '02:34' },
    { severity: 'suggestion', commentary: 'Player spent 5 minutes in Rustboro City without triggering any new story events.', timestamp: '08:12' },
    { severity: 'error', commentary: 'Script `0x8A01B4` entered an infinite loop after talking to PokéMart NPC.', timestamp: '15:45' },
  ],
  memory_events: [
    { address: '0x0202402C', value: '0x01', description: 'Player X Position' },
    { address: '0x0202402E', value: '0x0A', description: 'Player Y Position' },
    { address: '0x02026A58', value: '0b10010011', description: 'Flag Block 0x200-0x207' },
    { address: '0x03005008', value: '0x00C8', description: 'Money' },
  ],
  script_activity: [
    { type: 'system', message: 'Emulator initialized successfully', timestamp: '00:00:01' },
    { type: 'info', message: 'ROM loaded: Pokemon Emerald (USA)', timestamp: '00:00:02' },
    { type: 'debug', message: 'Flag 0x200 set to TRUE', timestamp: '00:02:15' },
    { type: 'warning', message: 'Script timeout detected at 0x8A01B4', timestamp: '00:05:30' },
    { type: 'error', message: 'Memory access violation at 0x02000000', timestamp: '00:07:45' }
  ]
};

function ConsoleTab({ consoleData }) {
  const getMessageColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-cyan-400';
      case 'debug': return 'text-green-400';
      case 'system': return 'text-purple-400';
      default: return 'text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <Card className="bg-slate-100 dark:bg-slate-900 backdrop-blur-sm h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base font-mono text-slate-900 dark:text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-green-400" />
          Console Output
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-300 dark:text-slate-300">
        {consoleData.map((line, index) => (
          <div key={index} className="flex gap-2">
            <span className="text-slate-500">{line.timestamp}</span>
            <span className={getMessageColor(line.type)}>{line.message}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function PreviewTab() {
  const [sessionData] = useState(mockSessionData);
  const [activeTab, setActiveTab] = useState('console');
  const [isEmulating, setIsEmulating] = useState(false);

  const toggleEmulation = () => setIsEmulating(!isEmulating);
  const restartEmulation = () => {
    setIsEmulating(false);
    setTimeout(() => setIsEmulating(true), 200);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-light text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-3">
                  <Monitor className="w-7 h-7 text-orange-400" />
                  Preview Tab
                </h1>
                <p className="text-base text-slate-600 dark:text-slate-400 font-light ml-10">
                  Live emulation, debugging, and AI-assisted session analysis
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  BETA
                </Badge>
                <Button variant="outline" onClick={restartEmulation}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Restart
                </Button>
                <Button onClick={toggleEmulation} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold w-28">
                  {isEmulating ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" /> Start
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="aspect-video bg-black flex items-center justify-center border border-orange-400/30 shadow-2xl shadow-orange-500/10">
              {isEmulating ? (
                <div className="text-center text-green-400">
                  <p className="font-mono text-lg">[EMULATION ACTIVE]</p>
                  <p className="font-mono text-sm">GBA BIOS OK</p>
                  <p className="font-mono text-sm">Loading ROM: pokeemerald.gba</p>
                </div>
              ) : (
                <div className="text-center text-slate-600 dark:text-slate-400">
                  <Monitor className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Emulation Paused</h3>
                  <p>Click 'Start' to begin the preview session.</p>
                </div>
              )}
            </Card>
          </div>

          <div className="row-start-3 lg:row-start-auto">
            <AssistantCommentary comments={sessionData.assistant_commentary} isActive={isEmulating} />
          </div>

          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-200 dark:bg-slate-900/50 rounded-xl p-1 mb-4">
                <TabsTrigger value="console" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white text-slate-900 dark:text-white">
                  <Terminal className="w-4 h-4 mr-2" />
                  Console
                </TabsTrigger>
                <TabsTrigger value="memory" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white text-slate-900 dark:text-white">
                  <Cpu className="w-4 h-4 mr-2" />
                  Memory Viewer
                </TabsTrigger>
                <TabsTrigger value="timeline" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white text-slate-900 dark:text-white">
                  <FlaskConical className="w-4 h-4 mr-2" />
                  AI Timeline
                </TabsTrigger>
              </TabsList>
              <TabsContent value="console">
                <ConsoleTab consoleData={sessionData.script_activity} />
              </TabsContent>
              <TabsContent value="memory">
                <MemoryViewer memoryEvents={sessionData.memory_events} />
              </TabsContent>
              <TabsContent value="timeline">
                <Card className="bg-slate-100 dark:bg-slate-900 h-full">
                  <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">AI Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 dark:text-slate-300">AI timeline component coming soon.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}