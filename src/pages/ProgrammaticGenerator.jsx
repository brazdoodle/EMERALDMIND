import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { getScriptGenerator } from '@/lib/scriptGenerator';
import { getCommandRegistry } from '@/lib/commandRegistry';
import { sanitizeGeneratedScript, buildScriptGenPrompt, describeUnknownCommand } from '@/lib/llmUtils.js';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { buildLocalScriptFromPreset } from '@/lib/localScaffolds.js';
import { isTrivialScript } from '@/lib/scriptQuality.js';
import { generateText } from '@/lib/llmService.js';

export default function ProgrammaticGenerator(props) {
  const { quickQuery: appQuickQuery, ollamaStatus, templatesList = [], commandDocs = [], nextSectionNumber = 1, onInsertScript } = props || {};

  const generator = getScriptGenerator();
  const registry = getCommandRegistry();

  const presets = useMemo(() => generator.getPresetsByComplexity(), [generator]);
  const [preset, setPreset] = useState(() => (presets && presets.length ? presets[0].key : 'basic_npc'));
  const [quality, setQuality] = useState('BALANCED');
  const [sections, setSections] = useState(1);
  const [batchMode, setBatchMode] = useState(false);
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [insertMode, setInsertMode] = useState('replace'); // 'replace' | 'append'
  const controllerRef = useRef(null);

  const handleInsert = useCallback((script) => {
    if (!onInsertScript || typeof onInsertScript !== 'function') return;
    try {
      if (insertMode === 'append') {
        // Append by inserting a separator
        onInsertScript(`\n\n${script}`);
      } else {
        onInsertScript(script);
      }
    } catch (_e) {
      console.warn('Insert failed', e);
    }
  }, [onInsertScript, insertMode]);
  // Local deterministic fallback synthesis moved to src/lib/localScaffolds.js

  useEffect(() => {
    if (presets && presets.length && !presets.find(p => p.key === preset)) {
      setPreset(presets[0].key);
    }
  }, [presets]);

  const combineCommandDocs = (relevantCommands, appDocs) => {
    const map = new Map();
    (appDocs || []).forEach(doc => {
      const key = (doc.command || doc.name || doc.id || '').toLowerCase();
      if (!key) return;
      map.set(key, { command: doc.command || doc.name || doc.id, description: doc.description || '' });
    });
    (relevantCommands || []).forEach(cmd => {
      const key = (cmd.command || cmd.id || '').toLowerCase();
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, { command: cmd.command || cmd.id, description: cmd.description || '' });
      } else {
        const prev = map.get(key);
        map.set(key, { command: prev.command, description: prev.description || cmd.description || '' });
      }
    });
    return Array.from(map.values());
  };

  const handleGenerate = async () => {
  setIsLoading(true);
    setError(null);
  if (controllerRef.current) { try { controllerRef.current.abort(); } catch (_) {} }
  controllerRef.current = new AbortController();

    const quickQuery = async (prompt, opts) => {
      if (ollamaStatus === 'ready' && typeof appQuickQuery === 'function') {
        try {
          return await appQuickQuery(prompt, opts);
        } catch (_) {
          // fall through to service
        }
      }
      try {
        const text = await generateText(prompt, {
          temperature: opts?.temperature ?? 0.2,
          max_tokens: opts?.max_tokens ?? 512,
          retries: 1,
          signal: controllerRef.current.signal,
          trivialGuard: (p, t) => isTrivialScript((sanitizeGeneratedScript(t, nextSectionNumber) || {}).text || t)
        });
        return text;
      } catch (_) {
        const presetInfo = (generator.getPresetsByComplexity().find(p => p.key === preset) || {});
        const content = (presetInfo.template) ? presetInfo.template : `; ${preset}\nfaceplayer\nmsgbox @message MSG_NORMAL\nrelease\nend`;
        return content;
      }
    };

    try {
      const qualityMap = { FAST: 300, BALANCED: 500, DETAILED: 1000 };
      const genOne = async () => {
        const t0 = performance.now ? performance.now() : Date.now();
        const relevantTemplates = generator.getRelevantTemplates(preset, templatesList || []);
        const relevantCommands = generator.getRelevantCommands(preset, 18);
        const combinedDocs = combineCommandDocs(relevantCommands, commandDocs);
        const basePrompt = buildScriptGenPrompt(preset, relevantTemplates, combinedDocs);
        const contextualPrompt = generator.enhancePromptWithContext(preset, basePrompt, relevantCommands, relevantTemplates);
        const nSections = Math.max(1, Math.min(10, sections));
        const boilerplate = [
          'Content Requirements:',
          `- Create ${nSections} section(s) labeled sequentially: section1, section2, ... with 'sectionN: # 000000'.`,
          '- Include meaningful content: not just section headers or return/end.',
          '- Include at least: one dialog line (msgbox), simple flow control (goto/call/if.*), and one additional action (e.g., applymovement, setflag, special).',
          '- Use Gen 3 flavor placeholders like @greeting, @choice_yes, @choice_no, @shop_greeting, @epic_dialogue as appropriate to the preset.',
          '- Keep commands syntactically correct for HMA/XSE; prefer lowercase command tokens.',
          '- Do not output commentary outside the fenced block.'
        ].join('\n');
    const prompt = [contextualPrompt, boilerplate].join('\n\n');
  const raw = await quickQuery(prompt, { temperature: 0.2, max_tokens: qualityMap[quality], signal: controllerRef.current.signal });
        const rawText = typeof raw === 'string' ? raw : (raw?.text || raw?.output || raw?.response || '');
        let { text: sanitizedScript, unknownCommands } = sanitizeGeneratedScript(rawText, nextSectionNumber);

        if (isTrivialScript(sanitizedScript) && typeof appQuickQuery === 'function') {
          // Second attempt with stricter constraints and a light skeleton hint
          const skeleton = [
            'Skeleton Hint (do not copy verbatim, adapt it):',
            'section1: # 000000',
            'faceplayer',
            'msgbox.npc  @MSG_NORMAL',
            'if.yes.goto @branch_yes, @branch_no',
            'call @do_action',
            'return',
            '',
            'section2: # 000000',
            'applymovement npc @movement_data',
            'waitmovement npc',
            'msgbox @after_action MSG_NORMAL',
            'return',
            '',
            'section3: # 000000',
            'setflag SOME_FLAG',
            'msgbox @farewell MSG_NORMAL',
            'end'
          ].join('\n');
          const strictReqs = [
            'Stricter Requirements (second attempt):',
            '- Produce at least 10 non-empty lines excluding section headers.',
            '- Use at least 4 different commands besides return/end.',
            '- Provide distinct text placeholders for each msgbox.'
          ].join('\n');
          const retryPrompt = [prompt, strictReqs, skeleton].join('\n\n');
          const retry = await appQuickQuery(retryPrompt, { temperature: 0.15, max_tokens: Math.min(qualityMap[quality] + 200, 1400), signal: controllerRef.current.signal });
          const retryText = typeof retry === 'string' ? retry : (retry?.text || retry?.output || retry?.response || '');
          const retrySan = sanitizeGeneratedScript(retryText, nextSectionNumber);
          if (retrySan?.text) {
            sanitizedScript = retrySan.text;
            unknownCommands = retrySan.unknownCommands || unknownCommands;
          }
        }

        // Final local fallback if still trivial or empty
  if (!sanitizedScript || isTrivialScript(sanitizedScript)) {
          const local = buildLocalScriptFromPreset(preset, nSections);
          const localSan = sanitizeGeneratedScript(local, nextSectionNumber);
          sanitizedScript = localSan.text || local;
          unknownCommands = localSan.unknownCommands || [];
        }
        let localAnalysis = null;
        try {
          const { analyzeHMAScript } = await import('@/lib/scriptAnalyzer.js');
          localAnalysis = await analyzeHMAScript(sanitizedScript, { knowledgeEntries: [], templates: relevantTemplates, commandDocs: combinedDocs });
        } catch (_e) {
          localAnalysis = { error: e.message };
        }
        let unknownDetails = [];
        if (unknownCommands && unknownCommands.length) {
          try {
            unknownDetails = await Promise.all(unknownCommands.map(async (cmd) => {
              const contextSnippet = (sanitizedScript || '').slice(0, 4000);
              if (ollamaStatus === 'ready' && typeof appQuickQuery === 'function') {
                const desc = await describeUnknownCommand(cmd, async () => {
                  const p = `You are an expert in HMA/XSE scripting. Given the following script context, provide a one-line description of what the command '${cmd}' likely does. If uncertain, respond with 'Unclear - requires human review'.\n\nContext:\n${contextSnippet}`;
                  return appQuickQuery(p, { temperature: 0.0, max_tokens: 120, signal: controllerRef.current.signal });
                });
                return { command: cmd, description: desc || 'Unknown - requires review' };
              }
              return { command: cmd, description: 'Unknown - requires review' };
            }));
          } catch (_e) {
            unknownDetails = unknownCommands.map(c => ({ command: c, description: 'Unknown - failed to describe' }));
          }
        }
        const duration = (performance.now ? performance.now() : Date.now()) - t0;
        return {
          success: true,
          script: { sanitized: sanitizedScript, raw: rawText },
          analysis: localAnalysis,
          unknownCommands: unknownDetails,
          metadata: { generationTime: Math.max(1, Math.round(duration)), timestamp: new Date().toISOString() }
        };
      };

      let result;
      if (batchMode) {
        const items = [];
        for (let i = 0; i < 3; i++) items.push(await genOne());
        result = { success: true, batch: true, items };
      } else {
        result = await genOne();
      }

      setOutput(result);
      setAnalysis(batchMode ? null : result.analysis);
      if (!batchMode && result && result.success && onInsertScript && typeof onInsertScript === 'function') {
        try { onInsertScript(result.script.sanitized || result.script.raw || ''); } catch (_e) { console.warn('Failed to insert script into editor:', e.message); }
      }
    } catch (_err) {
      console.error('Generation error', err);
      const msg = (err?.name === 'AbortError' || /abort|cancell?ed/i.test(err?.message || '')) ? 'Canceled' : (err.message || 'Generation failed');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!output || (output.batch && !output.items?.length)) return;
    try {
      const targetScript = output.batch ? output.items[0]?.script?.sanitized || '' : output.script?.sanitized || '';
      const relevantTemplates = generator.getRelevantTemplates(preset, templatesList || []);
      const relevantCommands = generator.getRelevantCommands(preset, 12);
      const { analyzeHMAScript } = await import('@/lib/scriptAnalyzer.js');
      const res = await analyzeHMAScript(targetScript, { knowledgeEntries: [], templates: relevantTemplates, commandDocs: relevantCommands });
      setAnalysis(res);
    } catch (_e) {
      setAnalysis({ error: e.message || 'Analysis failed' });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white font-light">Programmatic Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 text-slate-300">Script Type</label>
              <select value={preset} onChange={e => setPreset(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:border-blue-500 focus:outline-none">
                {presets.map(p => (
                  <option key={p.key} value={p.key}>
                    {p.title || p.key} {p.complexity ? `- ${p.complexity}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-slate-300">Quality</label>
              <select value={quality} onChange={e => setQuality(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:border-blue-500 focus:outline-none">
                <option value="FAST">Fast (300 tokens)</option>
                <option value="BALANCED">Balanced (500 tokens)</option>
                <option value="DETAILED">Advanced (1000 tokens)</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-slate-300">Sections</label>
              <div className="flex items-center gap-3">
                <input type="range" min="1" max="10" value={sections} onChange={(e) => setSections(parseInt(e.target.value, 10))} className="w-full" />
                <span className="w-8 text-right text-slate-300">{sections}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? 'Generating…' : 'Generate'}
            </Button>
            <Button variant="destructive" onClick={() => { try { controllerRef.current?.abort(); } catch (_) {} }} disabled={!isLoading}>Cancel</Button>
            <label className="inline-flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={batchMode} onChange={e => setBatchMode(e.target.checked)} /> Batch generate (3 options)
            </label>
            <Button variant="outline" onClick={handleAnalyze}>Analyze</Button>
            <label className="inline-flex items-center gap-2 text-sm text-slate-300 ml-auto">
              <span>Insert Mode</span>
              <select value={insertMode} onChange={e => setInsertMode(e.target.value)} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-md text-white">
                <option value="replace">Replace</option>
                <option value="append">Append</option>
              </select>
            </label>
          </div>

          {ollamaStatus !== 'ready' && (
            <div className="text-xs text-slate-400">AI offline — using local/script template fallback for generation</div>
          )}

          {error && (
            <div className="text-red-400 text-sm">Error: {error}</div>
          )}
        </CardContent>
      </Card>

      {!output?.batch && output && (
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white font-light">Generated Script</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-2">
              <Button size="sm" onClick={() => handleInsert(output.script?.sanitized || output.script?.raw || '')}>Insert</Button>
              <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(output.script?.sanitized || output.script?.raw || '')}>Copy</Button>
            </div>
            <pre className="bg-slate-800 border border-slate-700 text-white p-4 rounded whitespace-pre-wrap">{output.script?.sanitized || output.script?.raw}</pre>
            {analysis && (
              <div className="mt-4">
                <div className="text-slate-300 mb-1">Analysis</div>
                <pre className="bg-slate-800 border border-slate-700 text-white p-3 rounded">{JSON.stringify(analysis, null, 2)}</pre>
              </div>
            )}
            <div className="mt-4 text-slate-300">Unknown Commands</div>
            <pre className="bg-slate-800 border border-slate-700 text-white p-4 rounded">{JSON.stringify(output.unknownCommands || [], null, 2)}</pre>
          </CardContent>
        </Card>
      )}

      {output?.batch && (
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white font-light">Batch Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {output.items.map((it, idx) => (
                <div key={idx} className="border border-slate-700 bg-slate-900/80 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-slate-200">Option {idx + 1}</div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleInsert(it.script?.sanitized || it.script?.raw || '')}>Insert</Button>
                      <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(it.script?.sanitized || it.script?.raw || '')}>Copy</Button>
                    </div>
                  </div>
                  <pre className="bg-slate-800 border border-slate-700 text-white p-3 rounded whitespace-pre-wrap">{it.script?.sanitized || it.script?.raw}</pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
