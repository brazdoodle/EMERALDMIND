import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, GitBranch, Share2, CornerDownRight, ChevronsRight, AlertTriangle } from 'lucide-react';

// --- Script Parser ---
const parseScriptToFlow = (scriptContent) => {
  if (!scriptContent) return { nodes: [], edges: [] };

  const lines = scriptContent.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
  const labels = {};
  let currentLabel = 'entry';
  labels[currentLabel] = { id: currentLabel, commands: [], line: 0 };

  // First pass: identify all labels and their starting lines
  lines.forEach((line, index) => {
    if (line.endsWith(':')) {
      const labelName = line.slice(0, -1);
      if (!labels[labelName]) {
        labels[labelName] = { id: labelName, commands: [], line: index };
      }
    }
  });

  // Second pass: associate commands with labels
  let activeLabel = 'entry';
  lines.forEach((line, index) => {
    if (line.endsWith(':')) {
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
      type: 'block',
      position: { x: 0, y: yPos },
      data: { label: labelName, commands: block.commands },
    };
    nodes.push(node);
    yPos += (block.commands.length * 25) + 80;

    let hasExplicitJump = false;
    block.commands.forEach(command => {
      const parts = command.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      
      if (cmd.startsWith('if.') && (cmd.includes('.goto') || cmd.includes('.call'))) {
        const target = parts[parts.length - 1].replace('<', '').replace('>', '');
        if (labels[target]) {
          edges.push({ id: `${labelName}-${target}-true`, source: labelName, target, label: 'true' });
          hasExplicitJump = true;
        }
      } else if (cmd === 'goto' || cmd === 'call') {
        const target = parts[1].replace('<', '').replace('>', '');
        if (labels[target]) {
          edges.push({ id: `${labelName}-${target}`, source: labelName, target, label: cmd });
          hasExplicitJump = true;
        }
      }
    });

    if (!hasExplicitJump && i + 1 < labelNames.length) {
      const nextLabelName = labelNames.find((ln, idx) => idx > i && labels[ln].line > block.line);
       if (nextLabelName) {
         const lastCommand = block.commands[block.commands.length - 1] || '';
         if (!lastCommand.startsWith('end') && !lastCommand.startsWith('return')) {
           edges.push({ id: `${labelName}-${nextLabelName}-fallthrough`, source: labelName, target: nextLabelName, label: 'fallthrough' });
         }
       }
    }
  }

  return { nodes, edges };
};

// --- Renderer Components ---
const Node = ({ data }) => (
  <Card className="bg-slate-800/70 border-slate-700 w-full shadow-lg">
    <CardContent className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <GitBranch className="w-4 h-4 text-emerald-400" />
        <p className="font-mono text-emerald-400 font-bold text-sm">{data.label}:</p>
      </div>
      <div className="font-mono text-xs text-slate-300 space-y-1 pl-4">
        {data.commands.map((cmd, i) => {
          const isBranch = cmd.toLowerCase().includes('goto') || cmd.toLowerCase().includes('call');
          return (
            <div key={i} className={`flex items-center gap-2 ${isBranch ? 'text-yellow-400' : ''}`}>
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
  const isConditional = label === 'true' || label === 'false';
  const isFallthrough = label === 'fallthrough';
  
  return (
    <div className="flex items-center justify-center my-2">
      <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-mono ${
        isFallthrough ? 'bg-slate-700/50 text-slate-400' : 'bg-cyan-500/20 text-cyan-400'
      }`}>
        {isFallthrough ? 
          <CornerDownRight className="w-3 h-3" /> : 
          <ChevronsRight className="w-3 h-3" />
        }
        <span>{label}</span>
      </div>
    </div>
  );
};

export default function VisualScriptFlow({ selectedScript }) {
  // All hooks must be called at the top level, before any conditional returns
  const { nodes, edges } = useMemo(() => {
    return parseScriptToFlow(selectedScript?.content);
  }, [selectedScript]);

  const nodeMap = useMemo(() => new Map(nodes.map(node => [node.id, node])), [nodes]);
  
  const edgesBySource = useMemo(() => {
    return edges.reduce((acc, edge) => {
      if (!acc[edge.source]) {
        acc[edge.source] = [];
      }
      acc[edge.source].push(edge);
      return acc;
    }, {});
  }, [edges]);

  // Now we can do conditional returns after all hooks are called
  if (!selectedScript?.content || nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-4">
        <Share2 className="w-12 h-12 mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-slate-300">No Script to Visualize</h3>
        <p className="text-sm text-center">Write or generate a script in the Editor tab to see its visual flow.</p>
      </div>
    );
  }

  const renderNodeAndConnections = (nodeId, renderedNodes) => {
    if (renderedNodes.has(nodeId)) return null;
    renderedNodes.add(nodeId);

    const node = nodeMap.get(nodeId);
    if (!node) {
        return (
            <div key={`error-${nodeId}`} className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-4 h-4"/>
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
            {outgoingEdges.map(edge => (
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
    <div className="p-4 overflow-auto h-full">
        {entryPoint ? renderNodeAndConnections(entryPoint, new Set()) : (
             <div className="flex flex-col items-center justify-center h-full text-slate-500 p-4">
                <AlertTriangle className="w-12 h-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-slate-300">Could Not Parse Script</h3>
                <p className="text-sm text-center">Please ensure your script has valid HMA/XSE syntax.</p>
            </div>
        )}
    </div>
  );
}