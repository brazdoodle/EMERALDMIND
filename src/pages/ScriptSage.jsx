// ScriptSage with Performance Improvements
import { useLabAssistant } from "@/components/shared/LabAssistantService.jsx";
import { PageShell, StatusIndicator } from "@/components/shared/PageShell.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppState } from "@/lib/appState.jsx";
import {
  buildScriptGenPrompt,
  sanitizeGeneratedScript,
} from "@/lib/llmUtils.js";
import { analyzeHMAScript } from "@/lib/scriptAnalyzer.js";
import {
  AlertCircle,
  BookOpen,
  Code,
  Cpu,
  FileText,
  FlaskConical,
} from "lucide-react";
import React, { Suspense, lazy, useMemo, useState } from "react";

// Lazy load heavy components
const ScriptEditor = lazy(() => import("@/components/scriptsage/ScriptEditor"));
const ScriptAnalysisPanel = lazy(() =>
  import("@/components/scriptsage/ScriptAnalysisPanel")
);
const VisualScriptFlow = lazy(() =>
  import("@/components/scriptsage/VisualScriptFlow")
);
const CommandReference = lazy(() =>
  import("@/components/scriptsage/CommandReference")
);
const ScriptTemplatesComponent = lazy(() =>
  import("@/components/scriptsage/ScriptTemplatesComponent")
);
const ProgrammaticGeneratorComponent = lazy(() =>
  import("@/components/scriptsage/ProgrammaticGenerator")
);

// Import ScriptTemplates directly since it only has named exports
import { scriptTemplates } from "@/components/scriptsage/ScriptTemplates";

const LoadingFallback = ({ height = "400px" }) => (
  <div
    className="flex items-center justify-center bg-muted rounded-lg"
    style={{ height }}
  >
    <div className="animate-pulse text-muted-foreground">Loading...</div>
  </div>
);

const ScriptSage = () => {
  const { state, actions, selectors } = useAppState();
  const { ollamaStatus, quickQuery, showAssistant } = useLabAssistant();

  // Local UI state
  const [activeTab, setActiveTab] = useState("editor");
  const [editorContent, setEditorContent] = useState("");
  const [initialName, setInitialName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scriptAnalysis, setScriptAnalysis] = useState(null);

  const currentProject = state?.currentProject;
  const activeProject = state?.activeProject || currentProject;
  const totalScripts = activeProject?.scripts?.length || 0;

  // Context passed into analysis/generation
  const templatesList = useMemo(
    () => Object.values(scriptTemplates || {}),
    [scriptTemplates]
  );
  const commandDocs = useMemo(() => {
    try {
      // Get commands from registry and format for analysis
      const { getCommandRegistry } = require("@/lib/commandRegistry.js");
      const registry = getCommandRegistry();
      const allCommands = registry.getAllCommands();
      return allCommands.map((cmd) => ({
        command: cmd.command,
        description: cmd.description,
        syntax: cmd.syntax,
        category: cmd.category,
        confidence: cmd.confidence,
        examples: cmd.examples,
      }));
    } catch (_e) {
      return selectors?.getCommandDocs ? selectors.getCommandDocs() : [];
    }
  }, [selectors]);
  const nextSectionNumber = useMemo(() => {
    try {
      return (activeProject?.scripts?.length || 0) + 1;
    } catch (_e) {
      return 1;
    }
  }, [activeProject?.scripts]);

  // Define reusable editor props for shared functionality
  const editorProps = useMemo(
    () => ({
      projectId: currentProject?.id,
      onScriptChange: (content) => setEditorContent(content),
      initialContent: editorContent,
      initialName,
      analysisState: scriptAnalysis,
      onAnalyze: async () => {
        try {
          setIsAnalyzing(true);
          const result = await analyzeHMAScript(editorContent || "", {
            knowledgeEntries: [],
            templates: templatesList,
            commandDocs,
          });
          setScriptAnalysis(result);
        } catch (_err) {
          console.error("Script analysis failed", err);
          setScriptAnalysis({
            validation: {
              isValid: false,
              errors: [err.message || "Analysis failed"],
            },
            analysis: {},
            suggestions: [],
            commandDocs: [],
          });
        } finally {
          setIsAnalyzing(false);
        }
      },
      onGenerate: async (preset) => {
        try {
          if (ollamaStatus === "ready") {
            const prompt = buildScriptGenPrompt(
              preset,
              templatesList,
              commandDocs
            );
            const generated = await quickQuery(prompt, {
              temperature: 0.2,
              max_tokens: 2048,
            });
            if (generated && typeof generated === "string") {
              const result = sanitizeGeneratedScript(
                generated,
                nextSectionNumber
              );
              if (result && result.text) {
                setEditorContent(result.text);
                // If there are unknown commands, surface them in scriptAnalysis so the Analysis panel can offer to add them
                if (result.unknownCommands && result.unknownCommands.length) {
                  const cmds = result.unknownCommands;
                  if (ollamaStatus === "ready") {
                    try {
                      const contextSnippet = (editorContent || "").slice(
                        0,
                        4000
                      );
                      const descriptions = await Promise.all(
                        cmds.map(async (cmd) => {
                          const prompt = `You are an expert in HMA/XSE scripting. Given the following script context, provide a one-line description of what the command '${cmd}' likely does. If uncertain, respond with 'Unclear - requires human review'.\n\nContext:\n${contextSnippet}`;
                          const descRaw = await quickQuery(prompt, {
                            temperature: 0.0,
                            max_tokens: 120,
                          });
                          const desc =
                            typeof descRaw === "string" && descRaw.trim()
                              ? descRaw.trim().split("\n")[0]
                              : "Unclear - requires human review";
                          return { command: cmd, description: desc };
                        })
                      );
                      setScriptAnalysis((prev) => ({
                        ...(prev || {}),
                        commandDocs: [
                          ...(prev?.commandDocs || []),
                          ...descriptions,
                        ],
                      }));
                    } catch (_e) {
                      setScriptAnalysis((prev) => ({
                        ...(prev || {}),
                        commandDocs: [
                          ...(prev?.commandDocs || []),
                          ...cmds.map((c) => ({
                            command: c,
                            description: "Unknown - suggested by generator",
                          })),
                        ],
                      }));
                    }
                  } else {
                    setScriptAnalysis((prev) => ({
                      ...(prev || {}),
                      commandDocs: [
                        ...(prev?.commandDocs || []),
                        ...cmds.map((c) => ({
                          command: c,
                          description: "Unknown - suggested by generator",
                        })),
                      ],
                    }));
                  }
                }
                return;
              }
            }
          }
          const fallbackRaw = `; ${preset}\nfaceplayer\nmsgbox.npc <message>\nrelease`;
          const fb = sanitizeGeneratedScript(fallbackRaw, nextSectionNumber);
          setEditorContent(fb.text || fb);
        } catch (_err) {
          console.error("Generation failed", err);
          const fallbackRaw = `; ${preset}\nfaceplayer\nmsgbox.npc <message>\nrelease`;
          const fb = sanitizeGeneratedScript(fallbackRaw, nextSectionNumber);
          setEditorContent(fb.text || fb);
        }
      },
      ollamaStatus,
      isAnalyzing,
      onExport: () => {
        try {
          const blob = new Blob([editorContent || ""], {
            type: "text/plain;charset=utf-8",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${initialName || "script"}.asm`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        } catch (_err) {
          console.error("Export failed", err);
        }
      },
      onShowAssistant: showAssistant,
      scriptAnalysis,
    }),
    [
      currentProject?.id,
      editorContent,
      initialName,
      scriptAnalysis,
      isAnalyzing,
      ollamaStatus,
      quickQuery,
      showAssistant,
      templatesList,
      commandDocs,
      nextSectionNumber,
      activeProject?.scripts,
    ]
  );

  // Memoized tab configuration (analysis tab removed; analysis is inline)
  const tabConfig = useMemo(
    () => [
      {
        id: "editor",
        label: "Script Editor",
        icon: Code,
        description: "Create and edit HMA/XSE scripts",
        component: ScriptEditor,
        props: editorProps,
      },
      {
        id: "generator",
        label: "AI Generator",
        icon: FlaskConical,
        description: "AI-powered script generation",
        component: ProgrammaticGeneratorComponent,
        props: {
          onGenerate: editorProps.onGenerate,
          onAnalyze: editorProps.onAnalyze,
          isGenerating: editorProps.isGenerating,
          quickQuery,
          ollamaStatus,
          templatesList,
          commandDocs,
          nextSectionNumber,
          scriptAnalysis,
          onInsertScript: (script) => {
            setEditorContent(script);
            setActiveTab("editor"); // Switch to editor tab after inserting script
          },
        },
      },
      {
        id: "templates",
        label: "Templates",
        icon: FileText,
        description: "Quick-start script templates",
        component: ScriptTemplatesComponent,
        props: { onTemplateSelect: actions.loadScriptTemplate },
      },
      {
        id: "visual-flow",
        label: "Visual Flow",
        icon: Cpu,
        description: "Visual script flow diagram",
        component: VisualScriptFlow,
        props: { activeScript: state.activeScript },
      },
      {
        id: "reference",
        label: "Commands",
        icon: BookOpen,
        description: "HMA command reference",
        component: CommandReference,
        props: {},
      },
    ],
    [
      currentProject?.id,
      activeProject?.scripts,
      state.activeScript,
      actions,
      editorContent,
      isAnalyzing,
      scriptAnalysis,
      ollamaStatus,
      initialName,
      quickQuery,
      showAssistant,
      templatesList,
      commandDocs,
      nextSectionNumber,
    ]
  );

  // Memoized active tab data
  const activeTabData = useMemo(
    () => tabConfig.find((tab) => tab.id === activeTab),
    [tabConfig, activeTab]
  );

  // Auto-center tabs when invalid tab is selected
  React.useEffect(() => {
    if (!activeTabData && tabConfig.length > 0) {
      const centerIndex = Math.floor(tabConfig.length / 2);
      setActiveTab(tabConfig[centerIndex].id);
    }
  }, [activeTabData, tabConfig, setActiveTab]);

  // Tab click handler with performance optimization
  const handleTabChange = React.useCallback(
    (newTab) => {
      // Use requestIdleCallback for non-critical state updates
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
          setActiveTab(newTab);
        });
      } else {
        setActiveTab(newTab);
      }
    },
    [setActiveTab]
  );

  // Render active component with error boundary
  const renderActiveComponent = useMemo(() => {
    if (!activeTabData) return null;

    const Component = activeTabData.component;

    return (
      <Suspense fallback={<LoadingFallback />}>
        <Component {...activeTabData.props} />
      </Suspense>
    );
  }, [activeTabData]);

  return (
    <PageShell
      title="ScriptSage"
      description="Advanced HMA/XSE script development environment"
      icon={Code}
      iconColor="blue"
      stats={[
        { label: "Scripts", value: totalScripts, variant: "secondary" },
        ...(activeProject
          ? [
              {
                label: "Project",
                value: activeProject.name,
                variant: "outline",
              },
            ]
          : []),
      ]}
      statusIndicator={
        <StatusIndicator
          status={ollamaStatus === "checking" ? "loading" : ollamaStatus}
          labels={{
            ready: "AI Ready",
            slow: "AI Slow",
            offline: "AI Offline",
            loading: "AI Checking",
          }}
        />
      }
    >
      <div className="space-y-6">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-5">
            {tabConfig.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab Content */}
          <TabsContent value={activeTab} className="mt-0">
            <Card className="bg-muted/50 backdrop-blur-xl border rounded-2xl shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-blue-400 font-light flex items-center gap-2">
                  {activeTabData?.icon && (
                    <activeTabData.icon className="w-5 h-5" />
                  )}
                  {activeTabData?.label}
                </CardTitle>
                <p className="text-slate-600 dark:text-slate-400">
                  {activeTabData?.description}
                </p>
              </CardHeader>
              <CardContent>{renderActiveComponent}</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Offline Notice */}
      {ollamaStatus === "offline" && (
        <div className="border border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4 mt-6">
          <div className="flex items-center gap-3 text-yellow-800 dark:text-yellow-200">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-light">Ollama API is not available</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                AI-powered features like script analysis and generation are
                temporarily unavailable. Make sure Ollama is running on
                localhost:11435 or check your connection.
              </p>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default React.memo(ScriptSage);
