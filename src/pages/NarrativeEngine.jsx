import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Sparkles, Users, Wand2, FileText } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { StoryEvent } from '@/api/entities';
import { NPCProfile } from '@/api/entities';
import { Flag as FlagEntity } from '@/api/entities';
import { Script } from '@/api/entities';

import StoryEventTracker from "@/components/narrative/StoryEventTracker";
import NPCLoreVault from "@/components/narrative/NPCLoreVault";
import DialogueGenerator from "@/components/narrative/DialogueGenerator";
import EntityErrorHandler from '@/components/shared/EntityErrorHandler';
import { useQuickAssist } from '@/components/shared/LabAssistantService';

export default function NarrativeEngine() {
  const [activeTab, setActiveTab] = useState('events');
  const [storyEvents, setStoryEvents] = useState([]);
  const [npcProfiles, setNpcProfiles] = useState([]);
  const [romancerMode, setRomancerMode] = useState(false);
  const [projectFlags, setProjectFlags] = useState([]);
  const [projectScripts, setProjectScripts] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { quickQuery } = useQuickAssist();

  useEffect(() => {
    loadNarrativeData();
  }, []);

  const loadNarrativeData = async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      const [events, npcs, flags, scripts] = await Promise.all([
        StoryEvent.list('-created_date'),
        NPCProfile.list('-created_date'),
        FlagEntity.list('-created_date'),
        Script.list('-created_date')
      ]);
      setStoryEvents(events);
      setNpcProfiles(npcs);
      setProjectFlags(flags);
      setProjectScripts(scripts);
    } catch (error) {
      console.error('Error loading narrative data:', error);
      setLoadError(error);
      
      // Provide empty arrays as fallback to prevent crashes
      setStoryEvents([]);
      setNpcProfiles([]);
      setProjectFlags([]);
      setProjectScripts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewStoryEvent = async (eventData) => {
    try {
      const newEvent = await StoryEvent.create({ project_id: 'current_project', ...eventData });
      setStoryEvents(prev => [newEvent, ...prev]);
    } catch (error) {
      console.error('Error creating story event:', error);
      // Could show a toast notification here
    }
  };

  const createNewNPC = async (npcData) => {
    try {
      const newNPC = await NPCProfile.create({ project_id: 'current_project', ...npcData });
      setNpcProfiles(prev => [newNPC, ...prev]);
    } catch (error) {
      console.error('Error creating NPC:', error);
      // Could show a toast notification here
    }
  };

  const generateAIContent = async (type, context) => {
    const prompt = `Generate ${type} for a Gen 3 ROM hack. Context: ${JSON.stringify(context)}. ROMancer Mode: ${romancerMode ? 'ENABLED - add surreal, poetic elements' : 'DISABLED'}. Keep it authentic to Gen 3.`;
    return await quickQuery(prompt, { add_context_from_app: true });
  };

  const retryLoad = () => {
    loadNarrativeData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading narrative data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex justify-between items-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-light text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-purple-400" />
              Narrative Engine
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-400 font-light ml-10">
              Craft compelling stories and manage character relationships
            </p>
          </motion.div>
          <div className="flex items-center gap-3 p-3 bg-slate-200 dark:bg-slate-900/50 rounded-xl border border-purple-400/30">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <Label className="text-purple-400 font-medium">ROMancer Mode</Label>
            <Switch checked={romancerMode} onCheckedChange={setRomancerMode} />
          </div>
        </header>

        {loadError ? (
          <EntityErrorHandler 
            error={loadError}
            entityName="Narrative Data"
            onRetry={retryLoad}
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-200 dark:bg-slate-800/50 rounded-xl p-1 mb-4">
              <TabsTrigger 
                value="events" 
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-purple-400 data-[state=active]:shadow-sm text-slate-600 dark:text-slate-300"
              >
                <FileText className="w-4 h-4" /> 
                Story Events
              </TabsTrigger>
              <TabsTrigger 
                value="npcs" 
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-purple-400 data-[state=active]:shadow-sm text-slate-600 dark:text-slate-300"
              >
                <Users className="w-4 h-4" /> 
                NPC Vault
              </TabsTrigger>
            <TabsTrigger 
              value="dialogue" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-purple-400 data-[state=active]:shadow-sm text-slate-600 dark:text-slate-300"
            >
              <Wand2 className="w-4 h-4" /> 
              Dialogue AI
            </TabsTrigger>
          </TabsList>

            <TabsContent value="events">
              <StoryEventTracker events={storyEvents} flags={projectFlags} scripts={projectScripts} onCreateEvent={createNewStoryEvent} />
            </TabsContent>
            <TabsContent value="npcs">
              <NPCLoreVault npcs={npcProfiles} events={storyEvents} onCreateNPC={createNewNPC} />
            </TabsContent>
            <TabsContent value="dialogue">
              <DialogueGenerator npcs={npcProfiles} events={storyEvents} onGenerate={generateAIContent} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}