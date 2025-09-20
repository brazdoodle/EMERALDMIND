import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { InvokeLLM } from '@/api/integrations';
import { KnowledgeEntry } from '@/api/entities';

const LabAssistantContext = createContext();

export const LabAssistantProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [knowledgeEntries, setKnowledgeEntries] = useState([]);
  const [knowledgeInitialized, setKnowledgeInitialized] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [ollamaStatus, setOllamaStatus] = useState('checking');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // CRITICAL: Only initialize on mount, not on every render
  const initializeKnowledge = useCallback(async () => {
    if (knowledgeInitialized) return; // Prevent multiple calls

    try {
      const entries = await KnowledgeEntry.list();
      setKnowledgeEntries(entries);
      setKnowledgeInitialized(true);
    } catch (error) {
      console.error('Failed to load knowledge entries:', error);
      setKnowledgeInitialized(true); // Still set to true to prevent retries
    }
  }, [knowledgeInitialized]);

  // Helper: sanitize AI text responses to remove 'thinking' fragments and noise
  const sanitizeText = (s) => {
    if (!s || typeof s !== 'string') return s;
    // Preserve fenced code blocks and markdown structures while removing 'thinking' tokens
    const lines = s.split(/\r?\n/);
    const cleaned = [];
    let inFence = false;

    for (let rawLine of lines) {
      const line = rawLine.replace(/\r?\n$/, '');
      const t = line.trim();

      // Toggle fence state when encountering ``` fences
      if (/^```/.test(t)) {
        inFence = !inFence;
        cleaned.push(line);
        continue;
      }

      // Inside a code fence: preserve everything as-is
      if (inFence) {
        cleaned.push(line);
        continue;
      }

      // Drop empty lines (but allow single blank between sections)
      if (!t) {
        cleaned.push('');
        continue;
      }

      // Drop explicit 'thinking' fragments
      if (/^\[?thinking\]?[:\s-]*$/i.test(t)) continue;
      if (/^\.\.\.+$/.test(t)) continue;

      // Drop lines that are only punctuation (but keep markdown bullets, blockquotes, headings and fences)
      if (/^[^\w\s`>\-#*]+$/.test(t) && t.length <= 3) continue;

      cleaned.push(line);
    }

    // Collapse multiple blank lines to at most one and trim
    return cleaned.join('\n').replace(/\n{2,}/g, '\n\n').trim();
  };

  // Helper: assemble NDJSON/line-delimited JSON fragments returned by Ollama
  const assembleNdjson = (raw) => {
    if (!raw || typeof raw !== 'string') return raw;
    const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    // If lines look like JSON objects, parse and collect text fragments
    const fragments = [];
    let anyJson = false;

    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        anyJson = true;
        // prefer `response`, then `thinking`, then `text` keys
        if (obj.response && typeof obj.response === 'string' && obj.response.trim()) fragments.push(obj.response);
        if (obj.thinking && typeof obj.thinking === 'string' && obj.thinking.trim()) fragments.push(obj.thinking);
        if (obj.text && typeof obj.text === 'string' && obj.text.trim()) fragments.push(obj.text);
      } catch (e) {
        // not JSON — keep raw line if we didn't detect JSON overall
        fragments.push(line);
      }
    }

    if (anyJson) {
      // Join fragments with no extra separators (they are tokens from stream)
      return fragments.join('');
    }

    return lines.join('\n');
  };

  // Helper: format content for Studio (markdown + code editor) per user's formatting goals
  const formatForStudio = (text) => {
    if (!text || typeof text !== 'string') return text;

    let out = text;

    // Normalize line endings and trim
    out = out.replace(/\r\n/g, '\n').trim();

    // Ensure fenced codeblocks declare language for .asm/.s snippets
    out = out.replace(/```\s*(asm|s)?/gi, '```$1');
    // If code blocks are unlabeled but contain asm-like commands, label them as asm
    out = out.replace(/```\n(?=(?:\s*(?:add_item|check_flag|set_flag|section|label|call_script)\b))/g, '```asm\n');

    // Convert lines starting with '>' plus emoji or keywords into callouts
    out = out.replace(/^>\s*⚠️?\s*Important:\s*/gmi, '> ⚠️ **Important:** ');
    out = out.replace(/^>\s*Note:\s*/gmi, '> 💡 **Note:** ');

    // Add emoji headers where user used plain headers like '##' without emoji
    out = out.replace(/^##\s+(?![\p{Emoji}])/gmu, '## 🧠 ');

    // Ensure numbered steps are spaced properly (1. Step)
    out = out.replace(/^(\d+)\.\s+/gmu, (m) => m);

    // Ensure tables have a blank line before them for Markdown renderers
    out = out.replace(/([^\n])\n(\|[-:])/g, '$1\n\n$2');

    // Add a TL;DR header at the end if not present
    if (!/##\s+TL;DR/i.test(out)) {
      out = out + '\n\n## 🧾 TL;DR\n- Quick summary: follow the code blocks and use the canonical flag IDs from APPLICATION_FLAG_MAP.';
    }

    return out;
  };

  const sanitizeResult = (result, opts = {}) => {
    // If result is an object from InvokeLLM (parsed JSON), pretty-print it
    if (result && typeof result === 'object') {
      // If it's a response object with a textual payload, prefer that
      if (typeof result.content === 'string') {
        return sanitizeText(assembleNdjson(result.content));
      }
      if (typeof result.generated_text === 'string') {
        return sanitizeText(assembleNdjson(result.generated_text));
      }
      // If it's a plain JS object (parsed JSON), return pretty JSON so UI can render it
      try {
        return JSON.stringify(result, null, 2);
      } catch (e) {
        return String(result);
      }
    }
    // Otherwise treat as string
    const raw = String(result);
    // If the string looks like NDJSON (many lines that are JSON objects), assemble it
    const maybe = assembleNdjson(raw);
    const cleaned = sanitizeText(maybe);
    // Apply Studio formatting rules for readability (markdown/code editor)
    return formatForStudio(cleaned);
  };

  // CRITICAL: Only call initializeKnowledge ONCE on mount - fix the dependency issue
  useEffect(() => {
    initializeKnowledge();
  }, [initializeKnowledge]); // initializeKnowledge is a useCallback, so it's stable unless its own deps change

  const callAIWithRetry = async (prompt, options = {}) => {
    const maxRetries = 2;
    const timeout = 30000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let timeoutId;

      try {
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), timeout);

        const result = await InvokeLLM({
          prompt,
          add_context_from_internet: options.useInternet || false,
          add_context_from_app: true,
          ...options
        });

        clearTimeout(timeoutId);
        setOllamaStatus('ready');
        return result;

      } catch (error) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        console.warn(`AI call attempt ${attempt} failed:`, error.message);

        if (attempt === maxRetries) {
          if (error.name === 'AbortError' || error.message.includes('aborted')) {
            setOllamaStatus('timeout');
            throw new Error('AI request timed out. The AI service may be busy or unavailable.');
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            setOllamaStatus('offline');
            throw new Error('Network connection issue. Please check your internet connection.');
          } else {
            setOllamaStatus('error');
            throw new Error(`AI service error: ${error.message}`);
          }
        }

        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
      }
    }
  };

  // CRITICAL: Only check AI status ONCE, not on every component mount
  const checkAIStatus = useCallback(async () => {
    if (isOffline) {
      setOllamaStatus('offline');
      return;
    }

    try {
      await callAIWithRetry("test", { timeout: 5000 });
      setOllamaStatus('ready');
    } catch (error) {
      console.warn('AI status check failed:', error.message);
      if (error.message.includes('timeout') || error.message.includes('aborted')) {
        setOllamaStatus('slow');
      } else {
        setOllamaStatus('disabled');
      }
    }
  }, [isOffline]);

  // CRITICAL: Only check status on network change, not every render - fix dependencies
  useEffect(() => {
    if (!isOffline && ollamaStatus === 'checking') {
      checkAIStatus();
    }
  }, [isOffline, ollamaStatus, checkAIStatus]);

  // CRITICAL: processQuery should only be called by user action, NOT on mount
  const processQuery = async (query, context = {}, options = {}) => {
    if (isOffline) {
      const offlineMessage = {
        role: 'assistant',
        content: `I'm currently offline and can't process AI requests. However, I can still help you with:

• **Flag Forge** - Create and manage ROM flags
• **Trainer Architect** - Build trainer teams manually
• **Script Sage** - Access HMA command database and templates
• **Sprite Studio** - Validate and manage sprites
• **Knowledge Hub** - Browse and edit your knowledge base
• **Narrative Engine** - Manage story events and NPCs

All your work will be saved locally and sync when you're back online.`,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, { role: 'user', content: query }, offlineMessage]);
      return;
    }

    const userMessage = { role: 'user', content: query, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let enhancedPrompt = `You are EmeraldMind, an expert ROM hacking assistant specializing in Generation 3 Pokemon games.

User Query: ${query}

Context: ${JSON.stringify(context)}

Knowledge Base: You have access to ${knowledgeEntries.length} knowledge entries covering scripting, game mechanics, tooling, and best practices.

Provide detailed, technical assistance. Include specific examples, code snippets, and actionable advice. Format your response with markdown for readability.`;

      // Add a short summary of available knowledge entries (titles) to help the model reference app internals
      if (knowledgeEntries && knowledgeEntries.length) {
        const summary = knowledgeEntries.slice(0, 12).map(e => e.title || e.name || e.id).filter(Boolean).join(', ');
        enhancedPrompt += `\n\nAvailable knowledge entries (examples): ${summary}`;
      }

      // If the context provides an APPLICATION_FLAG_MAP, include it explicitly for canonical flag lookups
      if (context && context.APPLICATION_FLAG_MAP) {
        try {
          enhancedPrompt += `\n\nAPPLICATION_FLAG_MAP (canonical IDs):\n${JSON.stringify(context.APPLICATION_FLAG_MAP, null, 2)}`;
        } catch (e) {
          // ignore JSON errors
        }
      }

      const response = await callAIWithRetry(enhancedPrompt, { add_context_from_app: true });

      const assistantMessage = {
        role: 'assistant',
        content: sanitizeResult(response, { task: context.task || options.task }),
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI processing failed:', error);

      const errorMessage = {
        role: 'assistant',
        content: `**AI Service Unavailable**

${error.message}

**What you can still do:**
- Browse the Knowledge Hub for answers to common questions
- Use the HMA command database in Script Sage
- Work with all the core tools (flags, trainers, sprites)
- All your progress is automatically saved locally

**Your original question:** "${query}"

*Try again in a few moments, or explore the offline resources available in each module.*`,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // CRITICAL: quickQuery should only be called explicitly, not on component mount
  const quickQuery = async (query, options = {}) => {
    if (isOffline) {
      throw new Error("AI services are unavailable offline. Please check your connection and try again.");
    }

    try {
      const mergedOptions = { add_context_from_app: true, ...options };
      const response = await callAIWithRetry(query, mergedOptions);
      return sanitizeResult(response, mergedOptions);
    } catch (error) {
      console.error('Quick query failed:', error.message);

      if (error.message.includes('timeout')) {
        throw new Error("Request timed out. The AI service is currently slow or overloaded. Please try again in a moment.");
      } else if (error.message.includes('network')) {
        throw new Error("Network connection issue. Please check your internet connection and try again.");
      } else {
        throw new Error(`AI service temporarily unavailable: ${error.message}. Try again in a few moments.`);
      }
    }
  };

  // Attempts a strict retry: instruct the model to return only valid JSON or a single code block.
  const retryWithStrictPrompt = async (previousOutput, schema = null, options = {}) => {
    if (isOffline) throw new Error('Offline');
    const strictInstruction = schema ?
      `The previous output failed validation. You MUST now return ONLY valid JSON matching this schema: ${JSON.stringify(schema)}. Return no commentary, only JSON.` :
      `The previous output was malformed. Please return ONLY the requested content with no commentary.`;

    const prompt = strictInstruction + '\n\nPrevious output:\n' + (typeof previousOutput === 'string' ? previousOutput : JSON.stringify(previousOutput));
    const merged = { add_context_from_app: true, temperature: 0.05, max_tokens: 512, ...options };
    try {
      const result = await callAIWithRetry(prompt, merged);
      return sanitizeResult(result, options);
    } catch (err) {
      throw new Error(`Strict retry failed: ${err.message}`);
    }
  };

  const handleDocumentUpload = async (file) => {
    setUploadedDocument({
      name: file.name,
      size: file.size,
      type: file.type
    });
  };

  const refreshKnowledge = useCallback(async () => {
    // Reset knowledgeInitialized to false to force re-initialization
    setKnowledgeInitialized(false);
    // Then call initializeKnowledge, which will now run because knowledgeInitialized is false
    await initializeKnowledge();
  }, [initializeKnowledge]);

  const showAssistant = () => {
    window.location.hash = '#/lab-assistant';
  };

  const value = {
    messages,
    isLoading,
    processQuery,
    quickQuery,
    retryWithStrictPrompt,
    handleDocumentUpload,
    uploadedDocument,
    knowledgeEntries,
    knowledgeInitialized,
    ollamaStatus,
    isOffline,
    refreshKnowledge,
    showAssistant
  };

  return (
    <LabAssistantContext.Provider value={value}>
      {children}
    </LabAssistantContext.Provider>
  );
};

export const useLabAssistant = () => {
  const context = useContext(LabAssistantContext);
  if (!context) {
    throw new Error('useLabAssistant must be used within LabAssistantProvider');
  }
  return context;
};

export const useQuickAssist = () => {
  const { quickQuery, showAssistant, isOffline, ollamaStatus } = useLabAssistant();
  return { quickQuery, showAssistant, isOffline, ollamaStatus };
};
