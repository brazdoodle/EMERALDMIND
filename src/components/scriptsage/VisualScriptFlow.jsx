import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  ChevronsRight,
  CornerDownRight,
  Eye,
  Gamepad2,
  GitBranch,
  Home,
  MapPin,
  MessageSquare,
  Play,
  Share2,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import React, { useMemo, useState } from "react";

// Script type definitions from ScriptFlowMap
const scriptTypes = {
  event: {
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: Play,
    description: "Triggered by player actions or map events",
  },
  npc: {
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: Users,
    description: "NPC interactions and dialogue",
  },
  movement: {
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    icon: MapPin,
    description: "Character and camera movement sequences",
  },
  battle: {
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: Zap,
    description: "Battle initiation and victory/defeat handling",
  },
  text: {
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    icon: MessageSquare,
    description: "Pure dialogue and text display",
  },
  cutscene: {
    color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    icon: Eye,
    description: "Complex multi-step story sequences",
  },
};

// Game flow phases from ScriptFlowMap
const gameFlow = [
  {
    phase: "Game Start",
    icon: Home,
    scripts: ["event"],
    description: "Initial game state and intro sequences",
  },
  {
    phase: "Map Entry",
    icon: MapPin,
    scripts: ["event", "movement"],
    description: "Player enters new area, triggers load events",
  },
  {
    phase: "NPC Interaction",
    icon: Users,
    scripts: ["npc", "text", "movement"],
    description: "Player talks to characters, gets items/info",
  },
  {
    phase: "Story Events",
    icon: Play,
    scripts: ["event", "cutscene", "movement"],
    description: "Major plot points and character development",
  },
  {
    phase: "Battle Encounters",
    icon: Gamepad2,
    scripts: ["battle", "event"],
    description: "Wild Pokemon or trainer battles",
  },
  {
    phase: "Victory/Progression",
    icon: Trophy,
    scripts: ["event", "text"],
    description: "Post-battle rewards and story advancement",
  },
];

// Function to determine script type
const getScriptTypeFromContent = (scriptContent) => {
  if (!scriptContent) return "event";

  const content = scriptContent.toLowerCase();
  if (content.includes("trainerbattle") || content.includes("battle"))
    return "battle";
  if (content.includes("applymovement") || content.includes("move."))
    return "movement";
  if (content.includes("msgbox") && !content.includes("special")) return "text";
  if (content.includes("fadescreen") && content.includes("special"))
    return "cutscene";
  if (content.includes("faceplayer") || content.includes("npc.item"))
    return "npc";
  return "event";
};

// --- Script Parser ---
const parseScriptToFlow = (scriptContent) => {
  if (!scriptContent) return { nodes: [], edges: [] };

  const lines = scriptContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  const labels = {};
  const currentLabel = "entry";
  labels[currentLabel] = { id: currentLabel, commands: [], line: 0 };

  // First pass: identify all labels and their starting lines
  lines.forEach((line, index) => {
    if (line.endsWith(":")) {
      const labelName = line.slice(0, -1);
      if (!labels[labelName]) {
        labels[labelName] = { id: labelName, commands: [], line: index };
      }
    }
  });

  // Second pass: associate commands with labels
  let activeLabel = "entry";
  lines.forEach((line, index) => {
    if (line.endsWith(":")) {
      activeLabel = line.slice(0, -1);
    } else {
      labels[activeLabel].commands.push(line);
    }
  });

  const nodes = [];
  const edges = [];
  const processedLabels = new Set();
  let yPos = 0;

  const labelNames = Object.keys(labels);

  for (let i = 0; i < labelNames.length; i++) {
    const labelName = labelNames[i];
    const block = labels[labelName];
    if (processedLabels.has(labelName)) continue;

    processedLabels.add(labelName);

    const node = {
      id: labelName,
      type: "block",
      position: { x: 0, y: yPos },
      data: { label: labelName, commands: block.commands },
    };
    nodes.push(node);
    yPos += block.commands.length * 25 + 80;

    let hasExplicitJump = false;
    block.commands.forEach((command) => {
      const parts = command.split(/\s+/);
      const cmd = parts[0].toLowerCase();

      if (
        cmd.startsWith("if.") &&
        (cmd.includes(".goto") || cmd.includes(".call"))
      ) {
        const target = parts[parts.length - 1]
          .replace("<", "")
          .replace(">", "");
        if (labels[target]) {
          edges.push({
            id: `${labelName}-${target}-true`,
            source: labelName,
            target,
            label: "true",
          });
          hasExplicitJump = true;
        }
      } else if (cmd === "goto" || cmd === "call") {
        const target = parts[1].replace("<", "").replace(">", "");
        if (labels[target]) {
          edges.push({
            id: `${labelName}-${target}`,
            source: labelName,
            target,
            label: cmd,
          });
          hasExplicitJump = true;
        }
      }
    });

    if (!hasExplicitJump && i + 1 < labelNames.length) {
      const nextLabelName = labelNames.find(
        (ln, idx) => idx > i && labels[ln].line > block.line
      );
      if (nextLabelName) {
        const lastCommand = block.commands[block.commands.length - 1] || "";
        if (
          !lastCommand.startsWith("end") &&
          !lastCommand.startsWith("return")
        ) {
          edges.push({
            id: `${labelName}-${nextLabelName}-fallthrough`,
            source: labelName,
            target: nextLabelName,
            label: "fallthrough",
          });
        }
      }
    }
  }

  return { nodes, edges };
};

// --- Renderer Components ---
const Node = ({ data }) => (
  <Card className="bg-card border-border w-full shadow-lg">
    <CardContent className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <GitBranch className="w-4 h-4 text-emerald-400" />
        <p className="font-mono text-emerald-400 font-bold text-sm">
          {data.label}:
        </p>
      </div>
      <div className="font-mono text-xs text-foreground space-y-1 pl-4">
        {data.commands.map((cmd, i) => {
          const isBranch =
            cmd.toLowerCase().includes("goto") ||
            cmd.toLowerCase().includes("call");
          return (
            <div
              key={i}
              className={`flex items-center gap-2 ${
                isBranch ? "text-yellow-400" : ""
              }`}
            >
              {isBranch && <Share2 className="w-3 h-3 flex-shrink-0" />}
              <span>{cmd}</span>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
);

const Edge = ({ label }) => {
  const isConditional = label === "true" || label === "false";
  const isFallthrough = label === "fallthrough";

  return (
    <div className="flex items-center justify-center my-2">
      <div
        className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-mono ${
          isFallthrough
            ? "bg-slate-700/50 text-slate-400"
            : "bg-cyan-500/20 text-cyan-400"
        }`}
      >
        {isFallthrough ? (
          <CornerDownRight className="w-3 h-3" />
        ) : (
          <ChevronsRight className="w-3 h-3" />
        )}
        <span>{label}</span>
      </div>
    </div>
  );
};

export default function VisualScriptFlow({ selectedScript }) {
  const [showGameContext, setShowGameContext] = useState(false);

  // Parse script flow
  const { nodes, edges } = useMemo(() => {
    return parseScriptToFlow(selectedScript?.content);
  }, [selectedScript]);

  const nodeMap = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes]
  );

  const edgesBySource = useMemo(() => {
    return edges.reduce((acc, edge) => {
      if (!acc[edge.source]) {
        acc[edge.source] = [];
      }
      acc[edge.source].push(edge);
      return acc;
    }, {});
  }, [edges]);

  // Determine script type and relevant game phases
  const scriptType = useMemo(() => {
    return getScriptTypeFromContent(selectedScript?.content);
  }, [selectedScript]);

  const relevantPhases = useMemo(() => {
    return gameFlow.filter((phase) => phase.scripts.includes(scriptType));
  }, [scriptType]);

  const scriptTypeConfig = scriptTypes[scriptType];

  const renderNodeAndConnections = (nodeId, renderedNodes) => {
    if (renderedNodes.has(nodeId)) return null;
    renderedNodes.add(nodeId);

    const node = nodeMap.get(nodeId);
    if (!node) {
      return (
        <div
          key={`error-${nodeId}`}
          className="flex items-center gap-2 text-red-400"
        >
          <AlertTriangle className="w-4 h-4" />
          <p>Error: Missing node '{nodeId}'</p>
        </div>
      );
    }

    const outgoingEdges = edgesBySource[nodeId] || [];

    return (
      <div key={nodeId}>
        <Node data={node.data} />
        {outgoingEdges.length > 0 && (
          <div className="pl-4 border-l-2 border-dashed border-slate-600 ml-4 my-2">
            {outgoingEdges.map((edge) => (
              <div key={edge.id}>
                <Edge label={edge.label} />
                {renderNodeAndConnections(edge.target, renderedNodes)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const entryPoint = nodes.length > 0 ? nodes[0].id : null;

  return (
    <div className="space-y-4">
      {/* Enhanced Header with Script Type and Context */}
      <Card className="bg-slate-900/80 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-emerald-400" />
              <span className="text-white">Script Flow Visualization</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGameContext(!showGameContext)}
              className="text-slate-400 hover:text-white"
            >
              {showGameContext ? "Hide" : "Show"} Game Context
            </Button>
          </CardTitle>
        </CardHeader>

        {selectedScript && (
          <CardContent className="pt-0">
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                  scriptTypeConfig?.color || "bg-slate-700 text-slate-400"
                }`}
              >
                {scriptTypeConfig &&
                  React.createElement(scriptTypeConfig.icon, {
                    className: "w-4 h-4",
                  })}
                <span className="text-sm font-medium capitalize">
                  {scriptType}
                </span>
              </div>
              <p className="text-sm text-slate-400">
                {scriptTypeConfig?.description || "Unknown script type"}
              </p>
            </div>

            {showGameContext && relevantPhases.length > 0 && (
              <div className="bg-muted rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Game Flow Context
                </h4>
                <div className="grid gap-3">
                  {relevantPhases.map((phase, index) => {
                    const PhaseIcon = phase.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-md"
                      >
                        <PhaseIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <div>
                          <p className="text-white text-sm font-medium">
                            {phase.phase}
                          </p>
                          <p className="text-slate-400 text-xs">
                            {phase.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Script Flow Visualization */}
      <Card className="bg-slate-900/80 border-slate-700">
        <CardContent className="p-6">
          <div className="overflow-auto">
            {entryPoint ? (
              renderNodeAndConnections(entryPoint, new Set())
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <AlertTriangle className="w-12 h-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-slate-300">
                  No Script Content
                </h3>
                <p className="text-sm text-center">
                  Write or generate a script in the Editor tab to see its visual
                  flow.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
