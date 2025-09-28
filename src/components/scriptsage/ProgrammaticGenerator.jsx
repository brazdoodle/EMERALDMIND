import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  BookOpen,
  Brain,
  CheckCircle,
  Clock,
  Code,
  Settings,
  Target,
  TrendingUp,
  Wand2,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useQuickAssist } from "@/components/shared/LabAssistantService";
import {
  getScriptGenerator,
  QUALITY_LEVELS,
  SCRIPT_PRESETS,
} from "@/lib/scriptGenerator";

const ProgrammaticGenerator = ({
  onGenerate,
  onAnalyze,
  isGenerating,
  ollamaStatus,
  scriptAnalysis,
  quickQuery,
  templatesList,
  commandDocs,
  nextSectionNumber,
  onInsertScript,
}) => {
  const { quickQuery: labQuickQuery, ollamaStatus: labStatus } =
    useQuickAssist();
  const [generator] = useState(() => getScriptGenerator());

  // Generation settings
  const [selectedPreset, setSelectedPreset] = useState("basic_npc");
  const [qualityLevel, setQualityLevel] = useState("BALANCED");
  const [sectionNumber, setSectionNumber] = useState(nextSectionNumber || 1);
  const [customPrompt, setCustomPrompt] = useState("");
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [includeAnalysis, setIncludeAnalysis] = useState(true);
  const [userPrompt, setUserPrompt] = useState("");
  const [useAdvancedConfig, setUseAdvancedConfig] = useState(false);

  // Generation results
  const [lastResult, setLastResult] = useState(null);
  const [generationStats, setGenerationStats] = useState(null);
  const [previewMode, setPreviewMode] = useState("script"); // script, analysis, metadata
  const [model, setModel] = useState("");
  const [timeoutMs, setTimeoutMs] = useState(20000);
  const controllerRef = useRef(null);
  const [generating, setGenerating] = useState(false);

  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [complexityFilter, setComplexityFilter] = useState("all");

  // Lab assistant integration
  const [labAssistantPrompt, setLabAssistantPrompt] = useState("");
  const [labResponse, setLabResponse] = useState("");
  const [isQueryingLab, setIsQueryingLab] = useState(false);

  const effectiveQuickQuery = quickQuery || labQuickQuery;
  const effectiveStatus = ollamaStatus || labStatus || "checking";
  const isOffline = effectiveStatus === "offline";

  // Load stats on mount
  useEffect(() => {
    setGenerationStats(generator.getStats());
  }, [generator]);

  // Lab assistant query handler
  const handleLabQuery = async () => {
    if (!labAssistantPrompt.trim() || !effectiveQuickQuery || isQueryingLab)
      return;

    setIsQueryingLab(true);
    try {
      // Build comprehensive context from available resources
      const availableCommands = commandDocs?.metadata?.totalCommands || 0;
      const commandCategories =
        commandDocs?.metadata?.categories?.join(", ") || "Unknown";
      const templateCount = templatesList?.length || 0;

      const contextualPrompt = `
You are an expert in Hex Maniac Advance (HMA) ROM hacking and Pokemon Emerald script development.

AVAILABLE KNOWLEDGE:
- Command Database: ${availableCommands} HMA commands across categories: ${commandCategories}
- Script Templates: ${templateCount} proven script patterns and templates
- Current Script Context: Section ${sectionNumber} generation

HMA SCRIPTING FUNDAMENTALS:
- Scripts use section headers: section1: # XXXXXX (6-digit hex offset)
- Commands use <> brackets: <msgbox @text, MSGBOX_DEFAULT>
- Text references use @labels: <msgbox @greeting, MSGBOX_YESNO>
- Proper flow control: <if>, <goto>, <end>, <return>
- Pokemon battles: <setwildbattle>, <trainerbattle_start>
- Flag management: <setflag>, <clearflag>, <checkflag>
- Variable operations: <setvar>, <addvar>, <checkvar>

BEST PRACTICES:
- Always end with <end> or <return>
- Use meaningful @text labels
- Proper indentation and formatting
- Validate flag/variable ranges
- Test battle configurations
- Handle edge cases with <if> checks

User Question: ${labAssistantPrompt}

Provide specific, actionable guidance with:
1. Direct command examples
2. Complete script snippets
3. Common pitfalls to avoid
4. Integration with existing patterns
5. Testing recommendations
`;

      const response = await effectiveQuickQuery(contextualPrompt, {
        temperature: 0.1,
        max_tokens: 1000,
        model: model || undefined,
      });

      setLabResponse(response || "No response received from lab assistant.");
    } catch (_error) {
      console.error("Lab query error:", error);
      setLabResponse(
        `Error querying lab assistant: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsQueryingLab(false);
    }
  };

  // Filter presets by complexity
  const filteredPresets = Object.entries(SCRIPT_PRESETS).filter(
    ([key, preset]) => {
      if (complexityFilter === "all") return true;
      return preset.complexity === complexityFilter;
    }
  );

  // Handle generation
  const handleGenerate = async () => {
    if (!effectiveQuickQuery || isOffline) return;
    if (controllerRef.current) {
      try {
        controllerRef.current.abort();
      } catch (_) {}
    }
    controllerRef.current = new AbortController();
    setGenerating(true);

    const validation = generator.validateGenerationRequirements(
      selectedPreset,
      effectiveQuickQuery
    );
    if (!validation.valid) {
      console.error("Generation validation failed:", validation.issues);
      return;
    }

    try {
      const wrappedQuickQuery = async (prompt, options = {}) => {
        return await effectiveQuickQuery(prompt, {
          temperature: options?.temperature ?? 0.2,
          max_tokens:
            options?.maxTokens ??
            options?.max_tokens ??
            (QUALITY_LEVELS[qualityLevel]?.maxTokens || 500),
          model: model || undefined,
          timeoutMs: timeoutMs,
          signal: controllerRef.current.signal,
        });
      };

      const result = await generator.generateScript({
        preset: selectedPreset,
        quality: qualityLevel,
        templates: templatesList || [],
        sectionNumber,
        customPrompt: useCustomPrompt ? customPrompt : null,
        quickQuery: wrappedQuickQuery,
        includeAnalysis,
      });

      setLastResult(result);
      setGenerationStats(generator.getStats());

      if (result.success && result.script.sanitized) {
        // Send generated script to parent component
        if (onGenerate) {
          onGenerate(result.script.sanitized, {
            preset: selectedPreset,
            metadata: result.metadata,
            analysis: result.analysis,
            unknownCommands: result.unknownCommands,
          });
        }
      }
    } catch (_error) {
      console.error("Generation failed:", _error);
      setLastResult({
        success: false,
        error:
          _error?.name === "AbortError" ||
          /abort|cancell?ed/i.test(_error?.message || "")
            ? "Canceled"
            : _error.message,
        preset: selectedPreset,
      });
    } finally {
      setGenerating(false);
    }
  };

  // Handle batch generation
  const handleBatchGenerate = async () => {
    if (!effectiveQuickQuery || isOffline) return;
    if (controllerRef.current) {
      try {
        controllerRef.current.abort();
      } catch (_) {}
    }
    controllerRef.current = new AbortController();
    setGenerating(true);

    const configs = [
      { preset: "basic_npc", quality: qualityLevel },
      { preset: "branching_npc", quality: qualityLevel },
      { preset: "trainer_battle", quality: qualityLevel },
    ];

    try {
      const wrappedQuickQuery = async (prompt, options = {}) => {
        return await effectiveQuickQuery(prompt, {
          temperature: options?.temperature ?? 0.2,
          max_tokens:
            options?.maxTokens ??
            options?.max_tokens ??
            (QUALITY_LEVELS[qualityLevel]?.maxTokens || 500),
          model: model || undefined,
          timeoutMs: timeoutMs,
          signal: controllerRef.current.signal,
        });
      };
      const results = await generator.batchGenerate(configs, wrappedQuickQuery);

      // Use the first successful result
      const successfulResult = results.find((r) => r.success);
      if (successfulResult && onGenerate) {
        onGenerate(successfulResult.script.sanitized, {
          preset: successfulResult.preset,
          metadata: successfulResult.metadata,
          batchResults: results,
        });
      }
    } catch (_error) {
      console.error("Batch generation failed:", error);
    } finally {
      setGenerating(false);
    }
  };

  // Get preset info
  const presetInfo = SCRIPT_PRESETS[selectedPreset];
  const qualityInfo = QUALITY_LEVELS[qualityLevel];

  return (
    <Card className="bg-slate-900/80 border-slate-800 rounded-xl">
      <CardHeader className="p-3">
        <CardTitle className="text-sm text-white font-light flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-purple-400" />
          Programmatic Generator
          {generationStats && (
            <Badge variant="outline" className="ml-auto text-xs">
              {generationStats.totalGenerated} generated
            </Badge>
          )}
          <div className="ml-2 flex items-center gap-2">
            {model ? (
              <Badge
                variant="outline"
                className="text-xs text-blue-300 border-blue-400/30"
              >
                {model}
              </Badge>
            ) : null}
            <Badge
              variant="outline"
              className="text-xs text-slate-300 border-slate-400/20"
            >
              {timeoutMs}ms
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-4">
        <Tabs
          value={previewMode}
          onValueChange={setPreviewMode}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="script" className="text-xs">
              Configure
            </TabsTrigger>
            <TabsTrigger value="analysis" className="text-xs">
              Preview
            </TabsTrigger>
            <TabsTrigger value="lab" className="text-xs">
              Lab Assistant
            </TabsTrigger>
            <TabsTrigger value="metadata" className="text-xs">
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="script" className="space-y-3 mt-3">
            {/* Preset Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-300">
                  Script Type
                </label>
                <Select
                  value={complexityFilter}
                  onValueChange={setComplexityFilter}
                >
                  <SelectTrigger className="w-24 h-6 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="intermediate">Medium</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filteredPresets.map(([key, preset]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span>{preset.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {preset.complexity}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {presetInfo && (
                <p className="text-xs text-slate-400 mt-1">
                  {presetInfo.description}
                </p>
              )}
            </div>

            {/* Quality & Settings */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Quality
                </label>
                <Select value={qualityLevel} onValueChange={setQualityLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FAST">Fast</SelectItem>
                    <SelectItem value="BALANCED">Balanced</SelectItem>
                    <SelectItem value="DETAILED">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Section #
                </label>
                <Slider
                  value={[sectionNumber]}
                  onValueChange={([value]) => setSectionNumber(value)}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-2"
                />
                <span className="text-xs text-slate-400">
                  Section {sectionNumber}
                </span>
              </div>
            </div>

            {/* Advanced Options */}
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs p-1 h-6"
              >
                <Settings className="w-3 h-3 mr-1" />
                Advanced {showAdvanced ? "▼" : "▶"}
              </Button>

              {showAdvanced && (
                <div className="space-y-3 mt-2 p-2 bg-muted rounded border border-border">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={useCustomPrompt}
                      onChange={(e) => setUseCustomPrompt(e.target.checked)}
                      className="w-3 h-3"
                    />
                    <label className="text-xs text-slate-300">
                      Custom Prompt
                    </label>
                  </div>

                  {useCustomPrompt && (
                    <Textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Enter custom generation prompt..."
                      className="text-xs h-20 bg-slate-700/50"
                    />
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeAnalysis}
                      onChange={(e) => setIncludeAnalysis(e.target.checked)}
                      className="w-3 h-3"
                    />
                    <label className="text-xs text-slate-300">
                      Auto-analyze results
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Generation Controls */}
            <div className="space-y-2">
              <Button
                onClick={handleGenerate}
                disabled={
                  generating ||
                  isGenerating ||
                  isOffline ||
                  !effectiveQuickQuery
                }
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {generating || isGenerating ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-pulse" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Script
                  </>
                )}
              </Button>

              <Button
                onClick={() => {
                  try {
                    controllerRef.current?.abort();
                  } catch (_) {}
                }}
                disabled={!generating}
                variant="destructive"
                size="sm"
                className="w-full text-xs"
              >
                Cancel
              </Button>

              {qualityInfo && (
                <div className="text-xs text-slate-400 text-center">
                  ~{qualityInfo.maxTokens} tokens, {qualityInfo.examples}{" "}
                  examples, {qualityInfo.validation} validation
                </div>
              )}

              <Button
                onClick={handleBatchGenerate}
                disabled={
                  generating ||
                  isGenerating ||
                  isOffline ||
                  !effectiveQuickQuery
                }
                variant="outline"
                size="sm"
                className="w-full text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              >
                <Zap className="w-3 h-3 mr-1" />
                Batch Generate (3 scripts)
              </Button>
            </div>

            {showAdvanced && (
              <p className="text-xs text-red-400 text-center">
                AI offline - generation unavailable
              </p>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="mt-3">
            {lastResult ? (
              <div className="space-y-3">
                {lastResult.success ? (
                  <>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Generation Successful
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {lastResult.preset}
                      </Badge>
                    </div>

                    <div className="bg-muted rounded p-2 max-h-40 overflow-y-auto">
                      <pre className="text-xs text-slate-300 whitespace-pre-wrap">
                        {lastResult.script.sanitized.slice(0, 500)}
                        {lastResult.script.sanitized.length > 500 && "..."}
                      </pre>
                    </div>

                    {lastResult.unknownCommands &&
                      lastResult.unknownCommands.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-yellow-400">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-slate-300 block mb-1">
                                  Model (optional)
                                </label>
                                <input
                                  type="text"
                                  value={model}
                                  onChange={(e) => setModel(e.target.value)}
                                  placeholder="e.g. llama3.1:8b"
                                  className="w-full px-2 py-1 text-xs bg-slate-700/50 border border-slate-600 rounded"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-slate-300 block mb-1">
                                  Timeout (ms)
                                </label>
                                <input
                                  type="number"
                                  min={1000}
                                  step={1000}
                                  value={timeoutMs}
                                  onChange={(e) =>
                                    setTimeoutMs(
                                      parseInt(e.target.value || "0", 10) ||
                                        20000
                                    )
                                  }
                                  className="w-full px-2 py-1 text-xs bg-slate-700/50 border border-slate-600 rounded"
                                />
                              </div>
                            </div>
                            <AlertTriangle className="w-3 h-3" />
                            <span className="text-xs">
                              Unknown Commands (
                              {lastResult.unknownCommands.length})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {lastResult.unknownCommands.map((cmd, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs text-yellow-400 border-yellow-400/30"
                              >
                                {cmd.command}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                    {lastResult.analysis && (
                      <div className="text-xs text-slate-400">
                        Analysis:{" "}
                        {lastResult.analysis.validation?.isValid
                          ? "Valid"
                          : "Issues detected"}
                      </div>
                    )}

                    <Button
                      onClick={() =>
                        onInsertScript &&
                        onInsertScript(lastResult.script.sanitized)
                      }
                      disabled={!onInsertScript}
                      size="sm"
                      className="w-full mt-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                      <Target className="w-3 h-3 mr-2" />
                      View Script in Editor
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">
                      Generation Failed: {lastResult.error}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8">
                <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No generation results yet</p>
                <p className="text-xs">
                  Configure and generate a script to see preview
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="lab" className="mt-3">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-400 mb-3">
                <Brain className="w-4 h-4" />
                <span className="text-sm font-medium">
                  HMA Scripting Expert
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-2">
                    Ask the Lab Assistant about HMA scripting:
                  </label>
                  <Textarea
                    placeholder="e.g., How do I create a proper battle script? What's the syntax for msgbox commands? How do I handle trainer battles?"
                    value={labAssistantPrompt}
                    onChange={(e) => setLabAssistantPrompt(e.target.value)}
                    className="min-h-16 text-sm"
                    disabled={isQueryingLab || isOffline}
                  />
                </div>

                <Button
                  onClick={handleLabQuery}
                  disabled={
                    !labAssistantPrompt.trim() || isQueryingLab || isOffline
                  }
                  className="w-full"
                  size="sm"
                >
                  {isQueryingLab ? (
                    <Clock className="w-3 h-3 mr-2 animate-spin" />
                  ) : (
                    <Brain className="w-3 h-3 mr-2" />
                  )}
                  {isQueryingLab ? "Querying..." : "Ask Lab Assistant"}
                </Button>

                {labResponse && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        Lab Assistant Response:
                      </span>
                    </div>
                    <div className="bg-muted rounded p-3 max-h-64 overflow-y-auto">
                      <pre className="text-xs text-slate-300 whitespace-pre-wrap">
                        {labResponse}
                      </pre>
                    </div>
                  </div>
                )}

                {isOffline && (
                  <div className="text-center text-slate-400 py-4">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-xs">Lab Assistant offline</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metadata" className="mt-3">
            {generationStats ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted p-2 rounded">
                    <div className="text-xs text-muted-foreground">
                      Total Generated
                    </div>
                    <div className="text-lg font-medium text-foreground">
                      {generationStats.totalGenerated}
                    </div>
                  </div>

                  <div className="bg-muted p-2 rounded">
                    <div className="text-xs text-muted-foreground">
                      Success Rate
                    </div>
                    <div className="text-lg font-medium text-foreground">
                      {(generationStats.successRate * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="bg-muted p-2 rounded">
                    <div className="text-xs text-muted-foreground">
                      Avg Unknown
                    </div>
                    <div className="text-lg font-medium text-foreground">
                      {generationStats.averageUnknownCommands.toFixed(1)}
                    </div>
                  </div>

                  <div className="bg-muted p-2 rounded">
                    <div className="text-xs text-muted-foreground">
                      Registry Size
                    </div>
                    <div className="text-lg font-medium text-foreground">
                      {generationStats.registryStats?.total || 0}
                    </div>
                  </div>
                </div>

                {lastResult?.metadata && (
                  <div className="bg-muted p-2 rounded">
                    <div className="text-xs text-muted-foreground mb-1">
                      Last Generation
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>Time: {lastResult.metadata.generationTime}ms</div>
                      <div>
                        Output: {lastResult.metadata.outputLength} chars
                      </div>
                      <div>Commands: {lastResult.metadata.commandsUsed}</div>
                      <div>Templates: {lastResult.metadata.templatesUsed}</div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 text-xs">
                  <Badge
                    variant="outline"
                    className="text-emerald-400 border-emerald-400/30"
                  >
                    <Target className="w-3 h-3 mr-1" />
                    {Object.keys(SCRIPT_PRESETS).length} presets
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-blue-400 border-blue-400/30"
                  >
                    <BookOpen className="w-3 h-3 mr-1" />
                    {generationStats.registryStats?.total || 0} commands
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No statistics available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProgrammaticGenerator;
