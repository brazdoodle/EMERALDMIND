import { useLabAssistant } from "@/components/shared/LabAssistantService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Bot,
  Brain,
  FlaskConical,
  Send,
  Sparkles,
  Trash2,
  WifiOff,
} from "lucide-react";
import { useState } from "react";

export default function LabAssistant() {
  const [inputValue, setInputValue] = useState("");
  const {
    messages,
    isLoading,
    processQuery,
    handleDocumentUpload,
    uploadedDocument,
    ollamaStatus,
    isOffline,
    cancelCurrent,
  } = useLabAssistant();

  const [model, setModel] = useState("");
  const [quality, setQuality] = useState("BALANCED");
  const [timeoutMs, setTimeoutMs] = useState(20000);

  const quickPrompts = [
    "How do I create a script that gives an item to the player?",
    "What's the difference between setflag and checkflag?",
    "Help me debug this trainer battle script",
    "Show me how to create a custom movement pattern",
    "What are the best practices for sprite creation?",
    "How do I implement a day/night system?",
  ];

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const qualityMap = {
      FAST: { temp: 0.7, max: 512 },
      BALANCED: { temp: 0.4, max: 768 },
      DETAILED: { temp: 0.2, max: 1200 },
    };
    const q = qualityMap[quality] || qualityMap.BALANCED;
    await processQuery(
      inputValue,
      {},
      { temperature: q.temp, max_tokens: q.max, timeoutMs, model }
    );
    setInputValue("");
  };

  const clearMessages = () => {
    // Implementation would depend on context provider
  };

  const getStatusColor = () => {
    if (isOffline) return "text-red-400";
    switch (ollamaStatus) {
      case "ready":
        return "text-emerald-400";
      case "slow":
        return "text-yellow-400";
      case "offline":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  const getStatusIcon = () => {
    if (isOffline) return <WifiOff className="w-4 h-4" />;
    switch (ollamaStatus) {
      case "ready":
        return <Bot className="w-4 h-4" />;
      case "slow":
        return <AlertCircle className="w-4 h-4" />;
      case "offline":
        return <WifiOff className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-light text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-3">
                  <FlaskConical className="w-7 h-7 text-emerald-400" />
                  Lab Assistant
                </h1>
                <p className="text-base text-slate-600 dark:text-slate-400 font-light ml-10">
                  Your AI companion for ROM hacking expertise
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  className={`${getStatusColor()} bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-600 px-3 py-1 flex items-center gap-2`}
                >
                  {getStatusIcon()}
                  <span className="text-xs font-medium uppercase">
                    {isOffline ? "Offline" : ollamaStatus}
                  </span>
                </Badge>
                <div className="hidden md:flex items-center gap-2">
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-xs"
                  >
                    <option value="">Auto Model</option>
                    <option value="gpt-oss:20b">gpt-oss:20b</option>
                    <option value="llama3.1:8b">llama3.1:8b</option>
                  </select>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-xs"
                  >
                    <option value="FAST">Fast</option>
                    <option value="BALANCED">Balanced</option>
                    <option value="DETAILED">Detailed</option>
                  </select>
                  <input
                    type="number"
                    min="2000"
                    max="60000"
                    step="1000"
                    value={timeoutMs}
                    onChange={(e) =>
                      setTimeoutMs(parseInt(e.target.value, 10) || 20000)
                    }
                    className="w-24 px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-xs"
                  />
                </div>
                {messages.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearMessages}
                    className="border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => cancelCurrent()}
                  disabled={!isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-muted/50 border rounded-2xl shadow-xl h-[70vh] flex flex-col">
              <CardHeader className="p-4 border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Chat with EmeraldMind AI
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-4 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {messages.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-500">
                      <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Ask me anything about ROM hacking!</p>
                      <p className="text-sm mt-2">
                        Try the quick prompts to get started
                      </p>
                    </div>
                  )}

                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex gap-3 ${
                          message.role === "user" ? "justify-end" : ""
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.role === "user"
                              ? "bg-blue-600 text-white ml-auto"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {message.content}
                          </div>
                          <div className="text-xs opacity-70 mt-2">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <div className="bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white p-3 rounded-lg max-w-[80%]">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                          <span className="text-purple-400">
                            Analyzing your question...
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask about scripting, flags, trainers, sprites..."
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        (e.preventDefault(), handleSend())
                      }
                      className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white flex-1"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={isLoading || !inputValue.trim()}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white/90 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-2xl">
              <CardHeader className="p-4">
                <CardTitle className="text-slate-900 dark:text-white text-lg">
                  Quick Prompts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {quickPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setInputValue(prompt);
                      handleSend();
                    }}
                    className="w-full text-left justify-start text-xs p-2 h-auto border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    disabled={isLoading}
                  >
                    <Sparkles className="w-3 h-3 mr-2 flex-shrink-0 text-purple-400" />
                    <span className="truncate">{prompt}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {uploadedDocument && (
              <Card className="bg-muted/50 border rounded-2xl">
                <CardHeader className="p-4">
                  <CardTitle className="text-slate-900 dark:text-white text-lg">
                    Uploaded Document
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <p className="font-medium">{uploadedDocument.name}</p>
                    <p className="text-xs mt-1">
                      {(uploadedDocument.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
