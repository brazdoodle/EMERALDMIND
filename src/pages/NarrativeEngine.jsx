import {
  Flag as FlagEntity,
  NPCProfile,
  Script,
  StoryEvent,
} from "@/api/entities";
import { PageShell } from "@/components/shared/PageShell";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileText, Sparkles, Users, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";

import DialogueGenerator from "@/components/narrative/DialogueGenerator";
import DocumentUploader from "@/components/narrative/DocumentUploader";
import NPCLoreVault from "@/components/narrative/NPCLoreVault";
import StoryEventTracker from "@/components/narrative/StoryEventTracker";
import EntityErrorHandler from "@/components/shared/EntityErrorHandler";
import { useQuickAssist } from "@/components/shared/LabAssistantService";

export default function NarrativeEngine() {
  const [activeTab, setActiveTab] = useState("events");
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
        StoryEvent.list("-created_date"),
        NPCProfile.list("-created_date"),
        FlagEntity.list("-created_date"),
        Script.list("-created_date"),
      ]);
      setStoryEvents(events);
      setNpcProfiles(npcs);
      setProjectFlags(flags);
      setProjectScripts(scripts);
    } catch (_error) {
      console.error("Error loading narrative data:", error);
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
      const newEvent = await StoryEvent.create({
        project_id: "current_project",
        ...eventData,
      });
      setStoryEvents((prev) => [newEvent, ...prev]);
    } catch (_error) {
      console.error("Error creating story event:", error);
      // Could show a toast notification here
    }
  };

  const createNewNPC = async (npcData) => {
    try {
      const newNPC = await NPCProfile.create({
        project_id: "current_project",
        ...npcData,
      });
      setNpcProfiles((prev) => [newNPC, ...prev]);
    } catch (_error) {
      console.error("Error creating NPC:", error);
      // Could show a toast notification here
    }
  };

  const generateAIContent = async (type, context) => {
    const prompt = `
      Generate ${type} dialogue for a Gen 3 ROM hack. 
      Context: ${JSON.stringify(context)}. 
      ROMancer Mode: ${
        romancerMode ? "ENABLED - add surreal, poetic elements" : "DISABLED"
      }. 
      Keep it authentic to Gen 3. 
      RETURN ONLY A VALID JSON OBJECT WRAPPED IN TRIPLE BACKTICKS WITH JSON SYNTAX HIGHLIGHTING 
      and a dialogue array with objects with text values: 
      \`\`\`json 
        { dialogue: [{ text: "..." }, { text: "..." }] } 
      \`\`\`
      VALIDATE IT IS PROPER JSON BEFORE RETURNING.
    `;
    const response = await quickQuery(prompt, { add_context_from_app: true });
    const { enforceGen3Schema } = await import("@/lib/enforceGen3Schema");
    return enforceGen3Schema(response);
  };

  const handleDocumentUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload document");
      }

      await response.json();

      // Process the extracted context as needed
    } catch (_error) {
      console.error("Error uploading document:", error);
    }
  };

  const retryLoad = () => {
    loadNarrativeData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Loading narrative data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <PageShell
      icon={BookOpen}
      iconColor="purple"
      title="Narrative Engine"
      description="Craft compelling stories and manage character relationships"
      actions={
        <div className="flex items-center gap-3 p-3 bg-slate-200 dark:bg-slate-900/50 rounded-xl border border-purple-400/30">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <Label className="text-purple-400 font-medium">ROMancer Mode</Label>
          <Switch checked={romancerMode} onCheckedChange={setRomancerMode} />
        </div>
      }
    >
      {loadError ? (
        <EntityErrorHandler
          error={loadError}
          entityName="Narrative Data"
          onRetry={retryLoad}
        />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="events" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Story Events
            </TabsTrigger>
            <TabsTrigger value="npcs" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              NPC Vault
            </TabsTrigger>
            <TabsTrigger value="dialogue" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Dialogue AI
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Document Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <StoryEventTracker
              events={storyEvents}
              flags={projectFlags}
              scripts={projectScripts}
              onCreateEvent={createNewStoryEvent}
            />
          </TabsContent>
          <TabsContent value="npcs">
            <NPCLoreVault
              npcs={npcProfiles}
              events={storyEvents}
              onCreateNPC={createNewNPC}
            />
          </TabsContent>
          <TabsContent value="dialogue">
            <DialogueGenerator
              npcs={npcProfiles}
              events={storyEvents}
              onGenerate={generateAIContent}
              romancerModeEnabled={romancerMode}
            />
          </TabsContent>
          <TabsContent value="upload">
            <DocumentUploader onUpload={handleDocumentUpload} />
          </TabsContent>
        </Tabs>
      )}
    </PageShell>
  );
}
