import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Share2, Bot, Wand2, MessageSquare, Send, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useQuickAssist } from '@/components/shared/LabAssistantService';
import RawOutputModal from '@/components/shared/RawOutputModal';
import { motion } from "framer-motion";

import ScriptEditorTabs from '@/components/scriptsage/ScriptEditorTabs';
import VisualScriptFlow from '@/components/scriptsage/VisualScriptFlow';

const scriptAIPrompts = [
  "Debug this script for syntax errors and logic issues",
  "Generate a gym leader battle script with pre/post dialogue",
  "Create an NPC that gives an item once with flag checking",
  "Write a script for a complex multi-character cutscene",
  "Convert this script to use better HMA practices",
  "Add movement commands to make this more dynamic",
  "Generate dialogue for a mysterious character encounter",
  "Create a shop script with custom items"
];

export default function ScriptSage() {
  const [script, setScript] = useState(`main_script:\n  lock\n  faceplayer\n  msgbox.default <hello_text>\n  release\n  end\n\nhello_text:\n{\n  Hello, ROM Hacker!\n  This is Script Sage, your ultimate\n  HMA/XSE scripting companion.\n}`);
  const [activeTab, setActiveTab] = useState("editor");
  const [showVisualFlow, setShowVisualFlow] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { quickQuery, ollamaStatus, retryWithStrictPrompt } = useQuickAssist();
  
  const [debouncedScript, setDebouncedScript] = useState({ content: script, name: 'Current Script' });
  const [rawOutputOpen, setRawOutputOpen] = useState(false);
  const [rawOutput, setRawOutput] = useState('');
  const [rawRetrying, setRawRetrying] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedScript({ content: script, name: 'Current Script' });
    }, 500);
    return () => clearTimeout(handler);
  }, [script]);

  const insertSnippet = (snippetCode) => {
    setScript(prev => `${prev}\n\n${snippetCode}`);
    setActiveTab("editor");
  };

  const handleAIQuery = async (query) => {
    if (!query.trim()) return;

    setIsAiLoading(true);
    const userMessage = { role: 'user', content: query, timestamp: Date.now() };
    setAiMessages(prev => [...prev, userMessage]);

    try {
      const contextualPrompt = `You are a world-class expert in HMA (Hex Maniac Advance) and XSE scripting, specifically for Pokémon Emerald (Generation 3). Your output must be 100% syntactically correct and ready to be compiled. You ONLY generate the script code itself.

**HMA/XSE SYNTAX CHEAT SHEET:**

1.  **Labels:** End with a colon. Example: \`my_script_label:\`
2.  **Pointers:** Reference labels or text using angle brackets. Example: \`goto <my_script_label>\`
3.  **Control Flow:**
    *   \`lock\`: Freezes the player.
    *   \`release\`: Unfreezes the player.
    *   \`end\`: Terminates the script.
4.  **Dialogue & Text:**
    *   **Command:** \`msgbox.TYPE <text_label>\` (Common Types: default, sign, yesno)
    *   **Text Block Definition (CRITICAL):** Text blocks MUST be defined with a label and curly braces on separate lines.
        \`\`\`
        text_label:
        {
          This is the only correct way to define
          text for a message box.
        }
        \`\`\`
5.  **Movement:**
    *   \`applymovement.PERSON_ID.<movement_data>\` (PERSON_ID can be a number or PLAYER)
    *   \`waitmovement.PERSON_ID\`
6.  **Flags & Logic:**
    *   \`setflag.FLAG_ID\`
    *   \`clearflag.FLAG_ID\`
    *   \`checkflag.FLAG_ID\` (result goes to lastresult)
    *   \`if.VALUE.goto <label>\` (e.g., if.1.goto <is_set>)

**ABSOLUTE "DO NOT" RULES:**
- DO NOT use \`callasm\`. Use \`call <script_label>\`.
- DO NOT use \`#org\` for text blocks. Use the label/curly brace format.
- DO NOT use \`@\` to reference labels (e.g., \`@my_label\`). Use \`<my_label>\`.
- DO NOT use \`unlock\`. Use \`release\`.
- DO NOT use \`fanfare\` or \`waitfanfare\`. Use \`playbgm.SONG_ID\` or \`playsound.SE_ID\`.

**EXAMPLE OF A PERFECT SCRIPT:**
\`\`\`
complex_cutscene_script:
  lock
  faceplayer
  msgbox.default <scene_intro_text>
  setflag.0x828
  
  applymovement.0x1.<npc1_walks_in>
  waitmovement.0
  msgbox.default <npc1_dialogue_text>
  
  applymovement.0x2.<npc2_walks_in>
  waitmovement.0
  msgbox.default <npc2_entry_text>

  msgbox.default <player_reaction_text>
  clearflag.0x828
  release
  end

npc1_walks_in:
  walk_left
  walk_left
  face_down
  end_movement

npc2_walks_in:
  walk_right
  walk_right
  face_down
  end_movement

scene_intro_text:
{
  Hello, everyone!
  We're gathered here today...
}

npc1_dialogue_text:
{
  I'm really excited about this!
}

npc2_entry_text:
{
  Well, I hope everyone is ready!
}

player_reaction_text:
{
  I can't wait to hear what is said!
}
\`\`\`

**Your Task:**
Based on the rules above and the current script context below, fulfill the user's request.

Current Script Context:
\`\`\`
${script}
\`\`\`

User Request: ${query}

Provide ONLY the raw HMA/XSE script code as your response.`;

  const response = await quickQuery(contextualPrompt, { task: 'scriptSage', add_context_from_app: true });

      // Validate that response contains either a code block or valid script text
      const codeBlockMatch = response && response.match(/```(?:hma|xse|plaintext)?\n([\s\S]*?)\n```/);
      const scriptText = codeBlockMatch ? codeBlockMatch[1].trim() : response;

      // Basic heuristic: script must contain at least one label ending with ':' and at least one HMA keyword
      const hasLabel = /\w+:\s*$/.test(scriptText.split('\n').find(l => l.trim()));
      const hasKeyword = /\b(lock|release|end|msgbox|setflag|checkflag|clearflag)\b/i.test(scriptText);
      if (!scriptText || !hasLabel || !hasKeyword) {
        setRawOutput(response);
        setRawOutputOpen(true);
        const aiMessage = { role: 'assistant', content: response, timestamp: Date.now() };
        setAiMessages(prev => [...prev, aiMessage]);
        setIsAiLoading(false);
        return;
      }

      const aiMessage = { role: 'assistant', content: response, timestamp: Date.now() };
      setAiMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error("Error querying AI:", error);
      let errorMessage = "An error occurred while communicating with the AI.";
      // This specifically checks for the rate limit error
      if (error?.response?.status === 429) {
        errorMessage = "AI is experiencing high traffic. Please wait a moment and try your request again.";
      }
      const aiErrorMessage = { role: 'assistant', content: errorMessage, timestamp: Date.now() };
      setAiMessages(prev => [...prev, aiErrorMessage]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    setAiInput(prompt);
    handleAIQuery(prompt);
  };

  const handleRetryStrict = async () => {
    if (!retryWithStrictPrompt) return;
    setRawRetrying(true);
    setIsAiLoading(true);
    try {
      const strictResp = await retryWithStrictPrompt(rawOutput, null, { temperature: 0.05 });
      const respStr = typeof strictResp === 'string' ? strictResp : JSON.stringify(strictResp, null, 2);
      // Try to extract code block first
      const codeBlockMatch = respStr.match(/```(?:hma|xse|plaintext)?\n([\s\S]*?)\n```/);
      const scriptText = codeBlockMatch ? codeBlockMatch[1].trim() : respStr.trim();

      // Basic heuristic: must contain at least one label ending with ':' and at least one HMA keyword
      const hasLabel = /\w+:\s*$/.test(scriptText.split('\n').find(l => l.trim()));
      const hasKeyword = /\b(lock|release|end|msgbox|setflag|checkflag|clearflag)\b/i.test(scriptText);

      if (scriptText && hasLabel && hasKeyword) {
        applyAISuggestion(scriptText);
        setRawOutputOpen(false);
      } else {
        setRawOutput(respStr);
      }
    } catch (err) {
      setRawOutput(`Retry failed: ${err.message}`);
    } finally {
      setRawRetrying(false);
      setIsAiLoading(false);
    }
  };

  const applyAISuggestion = (suggestedScript) => {
    setScript(suggestedScript);
    setActiveTab("editor");
  };

  const exportScript = () => {
    const blob = new Blob([script], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'script.hma';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAIStatusColor = () => {
    switch (ollamaStatus) {
      case 'ready': return 'text-emerald-400';
      case 'slow': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <>
    <div className="p-4 md:p-6 h-full flex flex-col">
      <div className="max-w-7xl mx-auto h-full flex flex-col w-full">
        <header className="mb-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-light text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-3">
                  <Code className="w-7 h-7 text-blue-400" />
                  Script Sage
                </h1>
                <p className="text-base text-slate-600 dark:text-slate-400 font-light ml-10">
                  Master-level HMA/XSE scripting IDE with AI assistance
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800/50 border ${
                  ollamaStatus === 'ready' ? 'border-emerald-500/30' : 'border-slate-400/30 dark:border-slate-600/30'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    ollamaStatus === 'ready' ? 'bg-emerald-400' : 
                    ollamaStatus === 'slow' ? 'bg-yellow-400' : 'bg-red-400'
                  } ${ollamaStatus === 'ready' ? 'animate-pulse' : ''}`} />
                  <span className={`text-sm font-mono ${getAIStatusColor()}`}>
                    AI {ollamaStatus.toUpperCase()}
                  </span>
                </div>
                <Button 
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  className={`${showAIPanel ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700'} text-slate-900 dark:text-white`}
                >
                  <Bot className="w-4 h-4 mr-2" />
                  AI Assistant
                </Button>
              </div>
            </div>
          </motion.div>
        </header>

        <div className="flex-1 flex flex-col">
          <ScriptEditorTabs activeTab={activeTab} setActiveTab={setActiveTab} onInsertSnippet={insertSnippet} />

          {activeTab === 'editor' && (
            <div className={`grid gap-4 flex-1 mt-4 ${showAIPanel ? 'grid-cols-1 lg:grid-cols-3' : showVisualFlow ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
              <div className={`${showAIPanel ? 'lg:col-span-2' : 'lg:col-span-1'} flex flex-col`}>
                <Card className="bg-white/90 dark:bg-slate-900/80 border-slate-300 dark:border-slate-800 rounded-xl flex-1 flex flex-col">
                  <CardHeader className="p-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg text-slate-900 dark:text-white font-light">HMA Script Editor</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowVisualFlow(!showVisualFlow)} className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
                          <Share2 className="w-4 h-4 mr-1" />{showVisualFlow ? 'Hide Flow' : 'Show Flow'}
                        </Button>
                      <Button variant="outline" size="sm" onClick={exportScript} className="border-blue-400/50 text-blue-400 hover:bg-blue-500/10">
                        Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-1">
                    <Textarea 
                      value={script} 
                      onChange={(e) => setScript(e.target.value)} 
                      className="w-full h-full min-h-[60vh] bg-slate-100 dark:bg-slate-950/50 border-slate-300 dark:border-slate-700/50 rounded-lg font-mono text-sm text-green-600 dark:text-green-400 resize-none" 
                    />
                  </CardContent>
                </Card>
              </div>

              <div className={`flex flex-col ${showAIPanel || showVisualFlow ? '' : 'hidden'}`}>
                {showAIPanel ? (
                  <Card className="bg-white/90 dark:bg-slate-900/80 border-slate-300 dark:border-slate-800 rounded-xl flex-1 flex flex-col h-[70vh]">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg text-purple-400 font-light">
                        <Bot className="w-5 h-5 mr-2 inline-block" />
                        Script Assistant
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 flex-1 flex flex-col min-h-0 max-h-full">
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {scriptAIPrompts.slice(0, 4).map((prompt, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickPrompt(prompt)}
                            className="text-xs p-2 h-auto text-left border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                          >
                            <Wand2 className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{prompt.split(' ').slice(0, 3).join(' ')}...</span>
                          </Button>
                        ))}
                      </div>

                      <div className="flex-1 overflow-y-auto mb-3 space-y-3 bg-slate-100/50 dark:bg-slate-950/30 rounded-lg p-3 min-h-0">
                        {aiMessages.length === 0 && (
                          <div className="text-center text-slate-600 dark:text-slate-500 py-4">
                            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Ask me anything about your script!</p>
                          </div>
                        )}
                        {aiMessages.map((message, i) => (
                          <div key={i} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : ''}`}>
                            <div className={`max-w-[85%] p-3 rounded-lg text-sm break-words ${
                              message.role === 'user' 
                                ? 'bg-blue-600/20 dark:bg-blue-800/30 text-blue-100 dark:text-blue-200 ml-auto' 
                                : 'bg-slate-200 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200'
                            }`}>
                              <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed">{message.content}</div>
                              {message.role === 'assistant' && message.content.includes('```') && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const codeMatch = message.content.match(/```(?:hma|xse|plaintext)?\n([\s\S]*?)\n```/);
                                    if (codeMatch && codeMatch[1]) {
                                      applyAISuggestion(codeMatch[1].trim());
                                    }
                                  }}
                                  className="mt-2 text-emerald-400 hover:bg-emerald-500/10"
                                >
                                  <Code className="w-3 h-3 mr-1" />
                                  Apply Code
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                        {isAiLoading && (
                          <div className="flex gap-2">
                            <div className="bg-slate-200 dark:bg-slate-800/50 p-3 rounded-lg text-sm text-slate-800 dark:text-slate-200 max-w-[85%]">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                <span className="text-purple-400 text-xs">Analyzing script...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-auto">
                        <Input
                          value={aiInput}
                          onChange={(e) => setAiInput(e.target.value)}
                          placeholder="Ask about your script..."
                          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAIQuery(aiInput), setAiInput(''))}
                          className="bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm"
                          disabled={isAiLoading}
                        />
                        <Button 
                          onClick={() => {handleAIQuery(aiInput); setAiInput('');}}
                          disabled={isAiLoading || !aiInput.trim()}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : showVisualFlow ? (
                  <Card className="bg-white/90 dark:bg-slate-900/80 border-slate-300 dark:border-slate-800 rounded-xl flex-1">
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg text-emerald-400 font-light">Live Script Flow</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 h-[55vh] overflow-auto">
                      <VisualScriptFlow selectedScript={debouncedScript} />
                    </CardContent>
                  </Card>
                ) : null}
              </div>
            </div>
          )}
        </div>
          </div>
        </div>
        <RawOutputModal open={rawOutputOpen} onClose={() => setRawOutputOpen(false)} output={rawOutput} onRetry={handleRetryStrict} />
    </>
  );
}