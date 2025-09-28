import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAppState } from "@/lib/appState.jsx";
import {
  AlertCircle,
  BrainCircuit,
  CheckCircle,
  Code,
  Copy,
  Eye,
  EyeOff,
  FileText,
  Play,
  Save,
  Trash2,
  Zap,
} from "lucide-react";
import React, {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const ScriptAnalysisPanel = lazy(() =>
  import("@/components/scriptsage/ScriptAnalysisPanel")
);

const ScriptEditor = ({
  projectId,
  onScriptChange,
  initialContent = "",
  initialName = "",
  analysisState = null,
  onAnalyze = null,
  onGenerate = null,
  isAnalyzing = false,
  ollamaStatus = "checking",
  onExport = null,
  onShowAssistant = null,
  scriptAnalysis = null,
}) => {
  const { state, actions } = useAppState();
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [scriptContent, setScriptContent] = useState("");
  const [scriptName, setScriptName] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [lineCount, setLineCount] = useState(1);
  const [autosaveStatus, setAutosaveStatus] = useState("idle"); // idle | saving | saved | error
  const autosaveTimer = useRef(null);
  const [isDirty, setIsDirty] = useState(false);
  const lastSavedContent = useRef("");

  // Get active project and scripts
  const activeProject = useMemo(
    () => state.projects?.find((p) => p.id === projectId),
    [state.projects, projectId]
  );

  const activeScript = useMemo(
    () => activeProject?.scripts?.find((s) => s.id === state.activeScript),
    [activeProject?.scripts, state.activeScript]
  );

  // Handle script content changes
  const handleContentChange = useCallback(
    (value) => {
      setScriptContent(value);
      setLineCount(value.split("\n").length);

      // Basic validation
      const hasValidHeader =
        value.includes("#dynamic") || value.includes("#org");
      setIsValid(hasValidHeader || value.trim() === "");

      // Notify parent component
      if (onScriptChange) {
        onScriptChange(value);
      }
    },
    [onScriptChange]
  );

  // Autosave: debounced save when editing existing active script
  useEffect(() => {
    // Clear existing timer
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
      autosaveTimer.current = null;
    }

    const autoSaveEnabled = state.userPreferences?.autoSave;
    // Only autosave when enabled and we have an active script
    if (!autoSaveEnabled || !state.activeScript) {
      setAutosaveStatus("idle");
      return;
    }

    // Schedule autosave after 1.5s of idle
    // If there's nothing to save, just clear status
    if (!scriptContent || scriptContent.trim() === "") {
      setAutosaveStatus("idle");
      return;
    }

    setAutosaveStatus("saving");
    autosaveTimer.current = setTimeout(() => {
      saveNow()
        .then(() => {
          setAutosaveStatus("saved");
          setTimeout(() => setAutosaveStatus("idle"), 1200);
        })
        .catch((_err) => {
          console.error("Autosave failed", err);
          setAutosaveStatus("error");
        });
    }, 1500);

    return () => {
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
        autosaveTimer.current = null;
      }
    };
  }, [
    scriptContent,
    state.activeScript,
    projectId,
    actions,
    state.userPreferences,
  ]);

  // mark dirty when content differs from lastSavedContent
  useEffect(() => {
    const saved = lastSavedContent.current || "";
    setIsDirty(scriptContent !== saved && scriptContent.trim() !== "");
  }, [scriptContent]);

  // Save immediately (used by blur and project switch)
  const saveNow = useCallback(async () => {
    if (!state.activeScript) return;
    const updates = {
      content: scriptContent,
      lastModified: new Date().toISOString(),
    };
    const targetProjectId = projectId;
    // try to update and reflect last saved content
    actions.updateScript(targetProjectId, state.activeScript, updates);
    lastSavedContent.current = scriptContent;
    setIsDirty(false);
  }, [actions, projectId, scriptContent, state.activeScript]);

  // Save on window blur/unload
  useEffect(() => {
    const handleBlur = () => {
      try {
        if (isDirty) {
          saveNow();
        }
      } catch (_e) {
        // ignore
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("beforeunload", handleBlur);
    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("beforeunload", handleBlur);
    };
  }, [isDirty, saveNow]);

  // Save when projectId changes (project switch) — persist current edits
  const prevProjectId = useRef(projectId);
  useEffect(() => {
    if (prevProjectId.current && prevProjectId.current !== projectId) {
      // project changed
      if (isDirty) {
        saveNow();
      }
    }
    prevProjectId.current = projectId;
  }, [projectId, isDirty, saveNow]);

  // Sync incoming initial content (e.g., generated or loaded externally)
  React.useEffect(() => {
    if (
      initialContent !== undefined &&
      initialContent !== null &&
      initialContent !== scriptContent
    ) {
      setScriptContent(initialContent);
      setLineCount(initialContent.split("\n").length);
      // trigger validation and notify parent
      const hasValidHeader =
        initialContent.includes("#dynamic") || initialContent.includes("#org");
      setIsValid(hasValidHeader || initialContent.trim() === "");
      if (onScriptChange) onScriptChange(initialContent);
    }
  }, [initialContent]);

  // Sync incoming initial name
  React.useEffect(() => {
    if (initialName && initialName !== scriptName) setScriptName(initialName);
  }, [initialName]);

  // Save script
  const handleSave = useCallback(() => {
    if (!scriptName.trim()) {
      alert("Please enter a script name");
      return;
    }

    const newScript = {
      id: Date.now().toString(),
      name: scriptName.trim(),
      content: scriptContent,
      type: "hma",
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    actions.addScript(projectId, newScript);
    setScriptName("");
    setScriptContent("");
    // After manual save, mark autosave status as saved briefly
    setAutosaveStatus("saved");
    setTimeout(() => setAutosaveStatus("idle"), 1200);
  }, [scriptName, scriptContent, projectId, actions]);

  // Load existing script
  const loadScript = useCallback(
    (script) => {
      setScriptContent(script.content || "");
      setScriptName(script.name || "");
      actions.setActiveScript(script.id);
    },
    [actions]
  );

  // Copy script to clipboard
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(scriptContent);
      // Could add a toast notification here
    } catch (_err) {
      console.error("Failed to copy script:", err);
    }
  }, [scriptContent]);

  // Script templates for quick start
  const insertTemplate = useCallback(
    (template) => {
      // Do not force a specific auto-allocation header here; use the template content as-is.
      const templateContent = `${template}\n\nend`;
      setScriptContent(templateContent);
      handleContentChange(templateContent);
    },
    [handleContentChange]
  );

  return (
    <div className="space-y-4">
      {/* Script Management Header */}
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white font-light">
            <Code className="w-5 h-5" />
            Script Editor
            <Badge
              variant={isValid ? "default" : "destructive"}
              className="ml-auto"
            >
              {isValid ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Valid
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Invalid
                </>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Script name..."
              value={scriptName}
              onChange={(e) => setScriptName(e.target.value)}
              className="flex-1 px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none"
            />
            <Button
              onClick={handleSave}
              disabled={!scriptName.trim() || !scriptContent.trim()}
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>

          {/* Autosave indicator */}
          <div className="text-xs text-slate-400 mt-2">
            {autosaveStatus === "saving" && <span>Autosaving…</span>}
            {autosaveStatus === "saved" && (
              <span className="text-emerald-400">Autosaved</span>
            )}
            {autosaveStatus === "error" && (
              <span className="text-red-400">Autosave failed</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={copyToClipboard}
              disabled={!scriptContent.trim()}
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAnalysis((v) => !v)}
            >
              {showAnalysis ? (
                <>
                  <EyeOff className="w-4 h-4 mr-1" /> Hide Analysis
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-1" /> Show Analysis
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                insertTemplate("faceplayer\nmsgbox.npc <message>\nrelease")
              }
            >
              <FileText className="w-4 h-4 mr-1" />
              Basic NPC
            </Button>
            <Button
              variant="outline"
              onClick={() => setScriptContent("")}
              disabled={!scriptContent.trim()}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Scripts */}
      {activeProject?.scripts && activeProject.scripts.length > 0 && (
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white font-light">
              Project Scripts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {activeProject.scripts.map((script) => (
                <div
                  key={script.id}
                  className="flex items-center justify-between p-2 bg-muted rounded-md hover:bg-muted/80 cursor-pointer"
                  onClick={() => loadScript(script)}
                >
                  <span className="text-white">{script.name}</span>
                  <span className="text-slate-400 text-sm">
                    {script.content?.split("\n").length || 0} lines
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editor + Analysis Split */}
      <div
        className={`grid grid-cols-1 ${
          showAnalysis ? "lg:grid-cols-3" : "lg:grid-cols-1"
        } gap-4`}
      >
        <div className={showAnalysis ? "lg:col-span-2" : "lg:col-span-1"}>
          <Card className="bg-slate-900/80 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white font-light">
                <span>Script Content</span>
                <span className="text-sm text-slate-400">
                  Lines: {lineCount} | Characters: {scriptContent.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick AI Scripts Section - Now at Top */}
              <Card className="bg-card border-border">
                <CardHeader className="p-3">
                  <CardTitle className="text-sm text-white font-light flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-purple-400" />
                    Quick AI Scripts
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Button
                      onClick={() =>
                        onGenerate &&
                        onGenerate("Advanced NPC with dialogue branches")
                      }
                      size="sm"
                      className="justify-start bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xs font-medium"
                      disabled={ollamaStatus === "offline" || !onGenerate}
                    >
                      <Play className="w-3 h-3 mr-2" />
                      Advanced NPC
                    </Button>
                    <Button
                      onClick={() =>
                        onGenerate &&
                        onGenerate("Multi-character cutscene with movement")
                      }
                      size="sm"
                      className="justify-start bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-xs font-medium"
                      disabled={ollamaStatus === "offline" || !onGenerate}
                    >
                      <Play className="w-3 h-3 mr-2" />
                      Epic Cutscene
                    </Button>
                    <Button
                      onClick={() =>
                        onGenerate &&
                        onGenerate("Gym leader battle with ceremony")
                      }
                      size="sm"
                      className="justify-start bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-xs font-medium"
                      disabled={ollamaStatus === "offline" || !onGenerate}
                    >
                      <Zap className="w-3 h-3 mr-2" />
                      Gym Battle
                    </Button>
                  </div>
                  {ollamaStatus === "offline" && (
                    <p className="text-xs text-red-400 text-center mt-2 opacity-75">
                      AI features unavailable - Ollama offline
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Script Editor Textarea */}
              <Textarea
                value={scriptContent}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Enter your HMA/XSE script here..."
                className="min-h-[400px] font-mono text-sm bg-muted border-border text-foreground placeholder-muted-foreground resize-none"
                style={{
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  lineHeight: "1.5",
                }}
              />
            </CardContent>
          </Card>
        </div>

        {showAnalysis && (
          <div className="lg:col-span-1">
            {/* Analysis Panel */}
            <Suspense
              fallback={
                <div className="bg-muted rounded-lg p-4 text-center text-muted-foreground">
                  Loading analysis…
                </div>
              }
            >
              <ScriptAnalysisPanel
                analysis={
                  analysisState ||
                  (scriptAnalysis ? { status: "analyzed" } : { status: "idle" })
                }
                onAnalyze={onAnalyze}
                onGenerate={onGenerate}
                isAnalyzing={isAnalyzing}
                ollamaStatus={ollamaStatus}
                onExport={onExport}
                onShowAssistant={onShowAssistant}
                scriptAnalysis={scriptAnalysis}
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptEditor;
