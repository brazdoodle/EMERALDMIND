// Lab Assistant Service with Performance Improvements
import { KnowledgeEntry } from '@/api/entities';
import { useAppState, useAsyncOperation, useCachedData } from '@/lib/appState.jsx';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const LabAssistantContext = createContext();

export const LabAssistantProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const currentControllerRef = useRef(null);
  
  const { state, actions, selectors } = useAppState();

  // Use global state for common data
  const isLoading = selectors?.isLoading ? selectors.isLoading('labAssistant') : false;
  const ollamaStatus = state?.ollamaStatus ?? 'checking';
  const isOffline = !navigator.onLine;
  
  // Async operation handler
  const executeOperation = useAsyncOperation('labAssistant');
  
  // Cached knowledge entries
  const getCachedKnowledge = useCachedData(
    'knowledgeEntries',
    () => KnowledgeEntry.list(),
    [],
    1800000 // 30 minutes cache
  );
  
  // Memoized message sanitization
  const sanitizeText = useCallback((text) => {
    if (!text || typeof text !== 'string') return text;
    
    // Remove common AI artifacts and thinking tokens
    return text
      .split(/\r?\n/)
      .filter(line => {
        const trimmed = line.trim();
        const isNdjsonMeta = /\"?(model|created_at|done|response|thinking)\"?\s*:/.test(trimmed) || /^\{.*\}$/.test(trimmed);
        return trimmed && 
               !trimmed.startsWith('<thinking>') && 
               !trimmed.startsWith('```thinking') &&
               !trimmed.includes('I think') &&
               !isNdjsonMeta &&
               trimmed.length > 3;
      })
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }, []);
  
  // Optimized query processing with caching and context compression
  const processQuery = useCallback(async (query, context = {}, options = {}) => {
    if (isOffline) {
      const offlineMessage = {
        role: 'assistant',
        content: `I'm currently offline. You can still use local features like Flag Forge, Script templates, and the Knowledge Hub.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, { role: 'user', content: query }, offlineMessage]);
      return;
    }

    const userMessage = { role: 'user', content: query, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);

    try {
      const result = await executeOperation(async () => {
        if (currentControllerRef.current) {
          try { currentControllerRef.current.abort(); } catch (_) {}
        }
        const controller = new AbortController();
        currentControllerRef.current = controller;
        // Get cached knowledge entries
        const knowledgeEntries = await getCachedKnowledge();
        
        // Build smart context with enhanced AI understanding
        const { buildEnhancedContext } = await import('@/lib/smartContextInjector.js');
        const enhancedContext = buildEnhancedContext(query, {
          knowledgeEntries,
          flags: context?.flags,
          scripts: context?.scripts,
          ...context
        });
        
        // Build optimized context
        const optimizedContext = {
          query,
          knowledgeCount: knowledgeEntries.length,
          relevantKnowledge: knowledgeEntries.slice(0, 5).map(entry => ({
            title: entry.title,
            summary: entry.content?.slice(0, 150) + '...'
          })),
          enhancedContext,
          flags: context?.flags,
          templates: context?.templates,
          commands: context?.commands
        };

        // Build expert ROM hacking prompt with script analysis
        const { buildExpertPrompt } = await import('@/lib/romHackingExpert.js');
        
        // Analyze script content and provide generation context
        let scriptAnalysis = null;
        let generationContext = null;
        
        if (query.toLowerCase().includes('script') || query.includes('#org') || query.includes('msgbox')) {
          try {
            const { analyzeHMAScript } = await import('@/lib/scriptAnalyzer.js');
            scriptAnalysis = analyzeHMAScript(query);
          } catch (error) {
            console.warn('Script analysis not available:', error);
          }
        }
        
        // Add script generation capabilities if user is asking for script creation
        if (query.toLowerCase().includes('create') || query.toLowerCase().includes('generate') || query.toLowerCase().includes('make')) {
          try {
            const { getScriptGenerator } = await import('@/lib/hmaScriptGenerator.js');
            const generator = getScriptGenerator();
            generationContext = {
              patterns: generator.getAvailablePatterns(),
              templates: generator.getAvailableTemplates()
            };
          } catch (error) {
            console.warn('Script generator not available:', error);
          }
        }
        
        const expertContext = {
          knowledgeEntries,
          flags: optimizedContext.flags,
          templates: optimizedContext.templates,
          commands: optimizedContext.commands,
          scriptAnalysis,
          generationContext
        };
        
        const prompt = buildExpertPrompt(query, expertContext);

        const { generateText } = await import('@/lib/llmService.js');
        const text = await generateText(prompt, {
          temperature: options?.temperature ?? 0.2,
          max_tokens: options?.max_tokens ?? 512,
          retries: options?.retries ?? 1,
          timeoutMs: options?.timeout ?? options?.timeoutMs ?? 20000,
          model: options?.model,
          signal: controller.signal
        });

        // Post-process with ROM hacking expertise
        const { postProcessExpertResponse } = await import('@/lib/romHackingExpert.js');
        const processedText = postProcessExpertResponse(text);
        
        return sanitizeText(processedText);
      });

      const assistantMessage = {
        role: 'assistant',
        content: result,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (_error) {
      console.error('Query processing failed:', _error);
      
      const errorMessage = {
        role: 'assistant',
        content: `**Error**: ${_error.message}\n\nTry rephrasing your question or check if the AI service is available.`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [isOffline, executeOperation, getCachedKnowledge, sanitizeText]);

  // Optimized quick query with retry logic
  const quickQuery = useCallback(async (query, options = {}) => {
    if (isOffline) {
      throw new Error("AI services are unavailable offline.");
    }

    try {
      if (currentControllerRef.current) {
        try { currentControllerRef.current.abort(); } catch (_) {}
      }
      const controller = new AbortController();
      currentControllerRef.current = controller;
      const knowledgeEntries = await getCachedKnowledge();
      
      const compressedContext = {
        knowledgeCount: knowledgeEntries.length,
        relevantEntries: knowledgeEntries.slice(0, 3).map(e => e.title).join(', ')
      };

      // Compose minimal prompt with tiny context
      const ctx = [`Knowledge count: ${compressedContext.knowledgeCount}`];
      if (compressedContext.relevantEntries) ctx.push(`Relevant: ${compressedContext.relevantEntries}`);
      const prompt = [
        'You are a concise assistant. Answer directly.',
        ctx.join('\n'),
        `User:\n${query}`,
        'Answer:'
      ].join('\n\n');

      const { generateText } = await import('@/lib/llmService.js');
      const text = await generateText(prompt, {
        temperature: options?.temperature ?? 0.2,
        max_tokens: options?.max_tokens ?? 512,
        retries: options?.retries ?? 2,
        backoffMs: options?.backoffMs ?? 250,
        timeoutMs: options?.timeout ?? options?.timeoutMs ?? 15000,
        model: options?.model,
        signal: options?.signal || controller.signal
      });

      return sanitizeText(text);
      
    } catch (_error) {
      if (_error.message.includes('timeout')) {
        actions.setOllamaStatus('slow');
        throw new Error("AI is experiencing high load. Please try again in a moment.");
      }
      
      actions.setOllamaStatus('error');
      throw _error;
    }
  }, [isOffline, getCachedKnowledge, sanitizeText, actions]);

  // Retry with strict prompting
  const retryWithStrictPrompt = useCallback(async (previousOutput, schema = null, options = {}) => {
    const strictInstruction = schema 
      ? `Return ONLY valid JSON matching this schema: ${JSON.stringify(schema)}`
      : `Return ONLY the requested content with no commentary.`;
    
    const prompt = `${strictInstruction}\n\nPrevious output:\n${previousOutput}`;
    
    return await quickQuery(prompt, { temperature: 0.05, max_tokens: 512, ...options });
  }, [quickQuery]);

  // Document upload handler
  const handleDocumentUpload = useCallback(async (file) => {
    setUploadedDocument({
      name: file.name,
      size: file.size,
      type: file.type,
      timestamp: Date.now()
    });
  }, []);

  // Refresh knowledge cache
  const refreshKnowledge = useCallback(async () => {
    actions.clearCache();
    await getCachedKnowledge();
  }, [actions, getCachedKnowledge]);

  // AI status monitoring
  useEffect(() => {
    const checkStatus = async () => {
      if (isOffline) {
        actions.setOllamaStatus('offline');
        return;
      }

      try {
        await quickQuery("test", { timeout: 5000, retries: 0 });
        actions.setOllamaStatus('ready');
      } catch (_error) {
        if (_error.message.includes('timeout')) {
          actions.setOllamaStatus('slow');
        } else {
          actions.setOllamaStatus('error');
        }
      }
    };

    // Only check status when coming online or on mount
    if (!isOffline && ollamaStatus === 'checking') {
      checkStatus();
    }
  }, [isOffline, ollamaStatus, actions, quickQuery]);

  // Memoized context value
  const contextValue = useMemo(() => ({
    messages,
    isLoading,
    processQuery,
    quickQuery,
    cancelCurrent: () => {
      try { currentControllerRef.current?.abort(); } catch (_) {}
    },
    retryWithStrictPrompt,
    handleDocumentUpload,
    uploadedDocument,
    ollamaStatus,
    isOffline,
    refreshKnowledge,
    showAssistant: () => window.location.hash = '#/lab-assistant',
    clearMessages: () => setMessages([])
  }), [
    messages,
    isLoading,
    processQuery,
    quickQuery,
    retryWithStrictPrompt,
    handleDocumentUpload,
    uploadedDocument,
    ollamaStatus,
    isOffline,
    refreshKnowledge
  ]);

  return (
    <LabAssistantContext.Provider value={contextValue}>
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
  const { quickQuery, showAssistant, isOffline, ollamaStatus, retryWithStrictPrompt } = useLabAssistant();
  return { quickQuery, showAssistant, isOffline, ollamaStatus, retryWithStrictPrompt };
};
