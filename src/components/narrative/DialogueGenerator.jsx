import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Wand2, Copy, RefreshCw, Sparkles } from 'lucide-react';

export default function DialogueGenerator({
  npcs,
  events,
  romancerModeEnabled,
  onGenerate
}) {
  const copyToClipboard = () => {
    if (generatedDialogue) {
      navigator.clipboard.writeText(generatedDialogue);
    }
  };
  const [selectedNPC, setSelectedNPC] = useState(null);
  const [generatedDialogue, setGeneratedDialogue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedMood, setSelectedMood] = useState('');

  const handleGenerateDialogue = async () => {
    if (!selectedMood) return;
    setIsGenerating(true);
    setTimeout(async () => {
      let dialogue = await onGenerate('npc_dialogue', {
        npc: selectedNPC,
        type: selectedMood,
        romancerModeEnabled,
        customPrompt: customPrompt.trim()
      });

      // Remove any TLDR or summary sections from the output
      dialogue = dialogue.replace(/##\s*🧾 TL;DR[\s\S]*?(?=```|$)/g, "");
      dialogue = dialogue.replace("```json", "```json ");
      dialogue = dialogue.replace("}```", "} ```");

      let parsedDialogue = [];
      let schemaEnforced = false;
      try {
        // Extract JSON code block if present
        const codeBlockMatch = dialogue.match(/```json\s*([\s\S]*?)```/);
        let jsonString = codeBlockMatch ? codeBlockMatch[1].trim() : dialogue.trim();
        // Remove trailing commas and invalid fragments
        jsonString = jsonString.replace(/,\s*([}\]])/g, '$1').replace(/([}\]])[^}\]]*$/, '$1');
        // Try to parse JSON
        let parsed = {};
        try {
          parsed = JSON.parse(jsonString);
        } catch (_e) {
          // Fallback: try to extract dialogue array manually
          const arrMatch = jsonString.match(/"dialogue"\s*:\s*\[(.*?)]/s);
          if (arrMatch) {
            // Try to parse each text entry
            const texts = arrMatch[1].split(/},\s*{/).map(str => {
              const textMatch = str.match(/"text"\s*:\s*"([^"]+)"/);
              return textMatch ? textMatch[1] : null;
            }).filter(Boolean);
            parsed.dialogue = texts.map(t => ({ text: t }));
          }
        }
        if (parsed.dialogue && Array.isArray(parsed.dialogue)) {
          parsedDialogue = parsed.dialogue.map(d => d.text).filter(Boolean);
        }
      } catch (_error) {
        console.error('Error parsing generated dialogue:', error);
      }

      // Always enforce schema for non-battle types
      if (["intro", "casual", "mysterious"].includes(selectedMood)) {
        const scriptLocation = selectedNPC?.name ? selectedNPC.name.replace(/\s+/g, '_').toLowerCase() : 'npc_dialogue';
        const dialogueText = parsedDialogue.join('\n');
        dialogue = `section0: # <${scriptLocation}>\n  msgbox.npc <auto>\n{\n${dialogueText}\n}\n  end`;
        schemaEnforced = true;
      } else if (parsedDialogue.length) {
        // Battle type: keep default behavior
        dialogue = parsedDialogue.join('\n\n');
      }
      setGeneratedDialogue(dialogue);
      setIsGenerating(false);
    }, 1500);
  };
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Dialogue Generator</h2>
        <p className="text-slate-400">
          Generate contextual dialogue for your NPCs using AI assistance.
          {romancerModeEnabled && " [Enhanced] ROMancer Mode will add surreal and poetic elements."}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-yellow-400" />
              NPC Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {npcs.map((npc, index) => (
                <Button
                  key={index}
                  variant={selectedNPC?.id === npc.id ? "default" : "outline"}
                  onClick={() => setSelectedNPC(npc)}
                  className="justify-start"
                >
                  <div className="text-left">
                    <p className="font-bold">{npc.name}</p>
                    <p className="text-xs opacity-70">{npc.role.replace('_', ' ')}</p>
                  </div>
                </Button>
              ))}
            </div>

            {npcs.length === 0 && (
              <p className="text-slate-400 text-center py-4">
                No NPCs available. Create some in the NPC Vault first.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Generation Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => setSelectedMood('intro')}
                disabled={!selectedNPC || isGenerating}
                className={selectedMood === 'intro' ? "bg-blue-700" : "bg-blue-600 hover:bg-blue-700"}
              >
                Intro
              </Button>
              <Button
                onClick={() => setSelectedMood('battle')}
                disabled={!selectedNPC || isGenerating}
                className={selectedMood === 'battle' ? "bg-red-700" : "bg-red-600 hover:bg-red-700"}
              >
                Battle
              </Button>
              <Button
                onClick={() => setSelectedMood('casual')}
                disabled={!selectedNPC || isGenerating}
                className={selectedMood === 'casual' ? "bg-green-700" : "bg-green-600 hover:bg-green-700"}
              >
                Casual
              </Button>
              <Button
                onClick={() => setSelectedMood('mysterious')}
                disabled={!selectedNPC || isGenerating}
                className={selectedMood === 'mysterious' ? "bg-purple-700" : "bg-purple-600 hover:bg-purple-700"}
              >
                Mysterious
              </Button>
            </div>
            <div className="mt-4">
              <label className="block text-slate-300 font-semibold mb-2">Custom</label>
              <Textarea
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                className="bg-slate-800 border-slate-600 min-h-12 font-mono w-full"
                placeholder="Describe the situation, mood, or specific Gen 3 style you want..."
              />
              <Button
                onClick={handleGenerateDialogue}
                disabled={!selectedNPC || isGenerating || !selectedMood}
                className="w-full mt-2 bg-yellow-600 hover:bg-yellow-700"
              >
                Generate
              </Button>
            </div>

            {selectedNPC && (
              <div className="p-3 bg-slate-800 rounded-lg">
                <p className="text-yellow-400 font-bold mb-1">{selectedNPC.name}</p>
                <Badge className="bg-slate-700 text-slate-300 mb-2">
                  {selectedNPC.dialogue_style || 'casual'} style
                </Badge>
                <p className="text-slate-300 text-sm">
                  {selectedNPC.backstory || 'No backstory available'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {generatedDialogue && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Generated Dialogue</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyToClipboard}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleGenerateDialogue('refresh')}
                disabled={isGenerating}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedDialogue}
              onChange={(e) => setGeneratedDialogue(e.target.value)}
              className="bg-slate-800 border-slate-600 min-h-32 font-mono"
              placeholder="Generated dialogue will appear here..."
            />
          </CardContent>
        </Card>
      )}

      {isGenerating && (
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-yellow-400">Generating dialogue...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}