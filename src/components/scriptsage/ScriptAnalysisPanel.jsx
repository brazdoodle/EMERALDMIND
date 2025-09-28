import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { describeUnknownCommand } from "@/lib/llmUtils";
import { useAppState } from "@/lib/state";
import {
  AlertCircle,
  Bot,
  CheckCircle,
  Download,
  FileText,
  FlaskConical,
  Plus,
  Zap,
} from "lucide-react";
import { useState } from "react";
import AddCommandModal from "./AddCommandModal";

export default function ScriptAnalysisPanel({
  analysis,
  onAnalyze,
  onGenerate,
  isAnalyzing,
  ollamaStatus,
  onExport,
  onShowAssistant,
  scriptAnalysis,
}) {
  const safeOllamaStatus = ollamaStatus || "checking";
  const [addCommandModalOpen, setAddCommandModalOpen] = useState(false);
  const [commandsToAdd, setCommandsToAdd] = useState([]);
  const [prefillDetailsLocal, setPrefillDetailsLocal] = useState(null);

  const { state, actions } = useAppState();
  const quickQuery = state?.services?.quickQuery || actions?.quickQuery || null;

  const getStatusInfo = () => {
    switch (safeOllamaStatus) {
      case "ready":
        return {
          color: "text-emerald-400",
          text: "AI Ready",
          bgColor: "bg-emerald-400",
        };
      case "slow":
        return {
          color: "text-yellow-400",
          text: "AI Slow",
          bgColor: "bg-yellow-400",
        };
      case "offline":
        return {
          color: "text-red-400",
          text: "AI Offline",
          bgColor: "bg-red-400",
        };
      default:
        return {
          color: "text-slate-400",
          text: "AI Status Unknown",
          bgColor: "bg-slate-400",
        };
    }
  };

  const statusInfo = getStatusInfo();
  const isOffline = safeOllamaStatus === "offline";

  return (
    <div className="flex flex-col space-y-3 h-full">
      {/* Header with Status and Actions */}
      <div className="flex items-center justify-between p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusInfo.bgColor}`} />
          <span className={`text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
        </div>
        <div className="flex gap-1">
          <Button
            onClick={onShowAssistant}
            variant="outline"
            size="sm"
            className="h-7 px-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
            disabled={isOffline}
          >
            <FlaskConical className="w-3 h-3" />
          </Button>
          <Button
            onClick={onExport}
            variant="outline"
            size="sm"
            className="h-7 px-2 border-blue-400/50 text-blue-400 hover:bg-blue-500/10"
          >
            <Download className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Primary Analysis Section */}
      <Card className="bg-slate-900/80 border-slate-800 rounded-xl flex-1">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-white font-light flex items-center gap-2">
              {isAnalyzing ? (
                <Bot className="w-5 h-5 text-purple-400 animate-pulse" />
              ) : scriptAnalysis ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <FileText className="w-5 h-5 text-slate-400" />
              )}
              Script Analysis
            </CardTitle>
            {scriptAnalysis?.qualityScore !== undefined && (
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-400">
                  {scriptAnalysis?.qualityScore}
                  <span className="text-sm text-slate-400">/100</span>
                </div>
                <div className="text-xs text-slate-500">Quality Score</div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 space-y-4">
          {/* Analyze Button */}
          <Button
            onClick={onAnalyze}
            disabled={isAnalyzing || isOffline}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-medium shadow-lg py-3"
          >
            {isAnalyzing ? (
              <>
                <Bot className="w-5 h-5 mr-2 animate-pulse" />
                Analyzing Script...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                {isOffline ? "Analyze Script (Basic Mode)" : "Analyze Script"}
              </>
            )}
          </Button>

          {/* Analysis Results */}
          <div className="space-y-3">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <Bot className="w-12 h-12 text-purple-400 animate-pulse" />
                <p className="text-sm text-purple-400">
                  Analyzing your script...
                </p>
              </div>
            ) : scriptAnalysis ? (
              <>
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-emerald-400">
                      {scriptAnalysis?.analysis?.totalLines || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Lines</div>
                  </div>
                  <div className="bg-muted p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-blue-400">
                      {scriptAnalysis?.analysis?.totalCommands || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Commands
                    </div>
                  </div>
                  <div className="bg-muted p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-purple-400">
                      {scriptAnalysis?.analysis?.complexity || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Complexity
                    </div>
                  </div>
                </div>

                {/* Validation Status */}
                <div
                  className={`p-3 rounded-lg border ${
                    scriptAnalysis.validation.isValid
                      ? "bg-emerald-900/20 border-emerald-700/50"
                      : "bg-red-900/20 border-red-700/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {scriptAnalysis?.validation?.isValid ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-sm font-medium text-white">
                      {scriptAnalysis?.validation?.isValid
                        ? "Script Valid"
                        : "Issues Found"}
                    </span>
                  </div>
                  {scriptAnalysis?.validation?.errors?.length > 0 && (
                    <div className="space-y-1">
                      {scriptAnalysis?.validation?.errors?.map((error, i) => (
                        <div
                          key={i}
                          className="text-xs text-red-300 flex items-start gap-1"
                        >
                          <span className="mt-0.5">•</span>
                          <span>{error}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Command Usage - Collapsible */}
                {scriptAnalysis?.commandDocs?.length > 0 && (
                  <details className="bg-muted rounded-lg">
                    <summary className="p-3 cursor-pointer text-sm font-medium text-slate-300 hover:text-white">
                      Command Usage ({scriptAnalysis?.commandDocs?.length || 0})
                    </summary>
                    <div className="px-3 pb-3 space-y-2 max-h-40 overflow-y-auto">
                      {scriptAnalysis?.commandDocs
                        .sort((a, b) => b.count - a.count)
                        .map(({ command, count, documentation }) => (
                          <div
                            key={command}
                            className="flex justify-between items-center text-xs"
                          >
                            <span className="text-emerald-400 font-mono">
                              {command}
                            </span>
                            <span className="text-slate-400">{count}x</span>
                          </div>
                        ))}
                    </div>
                  </details>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">
                  Click "Analyze Script" to get detailed feedback on your code
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Script Analysis Results Card */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardContent className="p-4">
          {scriptAnalysis ? (
            <div className="space-y-4">
              {/* Analysis Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-700/30">
                <h3 className="text-sm font-medium text-slate-200">
                  Analysis Results
                </h3>
                <div
                  className={`text-xs px-2 py-1 rounded-full ${
                    scriptAnalysis?.validation?.isValid
                      ? "bg-emerald-800/50 text-emerald-400"
                      : "bg-red-800/50 text-red-400"
                  }`}
                >
                  {scriptAnalysis?.validation?.isValid
                    ? "Valid Script"
                    : "Invalid Script"}
                </div>
              </div>

              {/* Validation Errors */}
              {scriptAnalysis?.validation?.errors?.length > 0 && (
                <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-red-300 mb-2">
                    Validation Issues
                  </h4>
                  <ul className="space-y-1">
                    {scriptAnalysis?.validation?.errors?.map((error, i) => (
                      <li
                        key={i}
                        className="text-xs text-red-300 flex items-start gap-1"
                      >
                        <span className="mt-0.5">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                  {scriptAnalysis?.analysis?.invalidCommands?.length > 0 && (
                    <Button
                      onClick={async () => {
                        const unknowns =
                          scriptAnalysis?.analysis?.invalidCommands || [];
                        const prefilled = await Promise.all(
                          unknowns.map(async (cmd) => {
                            const desc = await describeUnknownCommand(
                              cmd,
                              quickQuery
                            );
                            return {
                              name: cmd,
                              syntax: cmd,
                              description: desc || "",
                              category: "Custom",
                              notes: "",
                            };
                          })
                        );
                        setCommandsToAdd(prefilled.map((p) => p.name));
                        setPrefillDetailsLocal(prefilled);
                        setAddCommandModalOpen(true);
                      }}
                      size="sm"
                      variant="outline"
                      className="w-full mt-2 bg-muted border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add{" "}
                      {scriptAnalysis?.analysis?.invalidCommands?.length ||
                        0}{" "}
                      Missing Command
                      {scriptAnalysis?.analysis?.invalidCommands?.length !== 1
                        ? "s"
                        : ""}
                    </Button>
                  )}
                </div>
              )}

              {/* Script Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">
                    Quality Score
                  </div>
                  <div className="text-lg font-medium text-foreground">
                    {scriptAnalysis.qualityScore || 0}
                    <span className="text-xs text-muted-foreground ml-1">
                      /100
                    </span>
                  </div>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">
                    Complexity
                  </div>
                  <div className="text-lg font-medium text-foreground">
                    {scriptAnalysis?.analysis?.complexity}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted/50 p-2 rounded text-center">
                  <div className="text-xs text-muted-foreground">Lines</div>
                  <div className="text-sm font-medium text-foreground">
                    {scriptAnalysis?.analysis?.totalLines || 0}
                  </div>
                </div>
                <div className="bg-muted/50 p-2 rounded text-center">
                  <div className="text-xs text-muted-foreground">Commands</div>
                  <div className="text-sm font-medium text-foreground">
                    {scriptAnalysis?.analysis?.totalCommands || 0}
                  </div>
                </div>
                <div className="bg-muted/50 p-2 rounded text-center">
                  <div className="text-xs text-muted-foreground">
                    Categories
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {scriptAnalysis.analysis.categories?.length || 0}
                  </div>
                </div>
              </div>

              {/* Command Usage */}
              {scriptAnalysis?.commandDocs?.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-slate-300 mb-2">
                    Command Usage
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    {scriptAnalysis?.commandDocs
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 6) // Show top 6 commands
                      .map(({ command, count, documentation }) => (
                        <div
                          key={command}
                          className="bg-muted/50 p-2 rounded-lg"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <div className="text-xs font-medium text-emerald-400 truncate">
                              {command}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {count}x
                            </div>
                          </div>
                          {documentation?.description && (
                            <div className="text-xs text-slate-400 truncate">
                              {documentation.description}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">
              <p className="text-sm mb-2">No Analysis Yet</p>
              <p className="text-xs">
                Click "Analyze Script" to get detailed feedback
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Add Command Modal (prefills descriptions from AI) */}
      <AddCommandModal
        open={addCommandModalOpen}
        onClose={() => {
          setAddCommandModalOpen(false);
          setPrefillDetailsLocal(null);
        }}
        commands={commandsToAdd}
        prefillDetails={prefillDetailsLocal}
        onAdd={(items) => {
          if (actions?.addCommands) {
            actions.addCommands(items);
          }
          setAddCommandModalOpen(false);
          setPrefillDetailsLocal(null);
        }}
      />
    </div>
  );
}
