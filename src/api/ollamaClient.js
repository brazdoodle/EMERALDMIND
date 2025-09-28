// Simple Ollama HTTP client for local model invocation
// Uses the Ollama API at VITE_OLLAMA_URL (default http://localhost:11434)
const DEFAULT_OLLAMA_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_OLLAMA_URL) || (typeof process !== 'undefined' && process.env && process.env.OLLAMA_URL) || 'http://localhost:11434';
const DEFAULT_MODEL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_OLLAMA_MODEL) || (typeof process !== 'undefined' && process.env && process.env.OLLAMA_MODEL) || 'gpt-oss:20b';

// Build base URL candidates: try configured URL first (may point at a local proxy), then direct Ollama
const BASE_CANDIDATES = (() => {
  const arr = [];
  if (DEFAULT_OLLAMA_URL) arr.push(DEFAULT_OLLAMA_URL.replace(/\/$/, ''));
  const direct = 'http://localhost:11434';
  if (!arr.includes(direct)) arr.push(direct);
  return arr;
})();

function normalizeModelName(name) {
  if (!name) return name;
  // common user input variants: gpt-oss20b, gpt-oss:20b, gpt_oss_20b, GPT-OSS20B
  return String(name).toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function listModels() {
  // Try each base candidate and try known model-list endpoints
  const endpoints = ['/v1/models', '/api/models'];
  let lastErr = null;
  for (const base of BASE_CANDIDATES) {
    for (const ep of endpoints) {
      const url = `${base}${ep}`;
      try {
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          const err = new Error(`Ollama list models error: ${res.status} ${res.statusText} ${txt}`);
          err.status = res.status;
          lastErr = err;
          continue;
        }
        const data = await res.json();
        // v1 returns { object: 'list', data: [...] }
        if (Array.isArray(data)) return data;
        if (data.models) return data.models;
        if (data.data) return data.data;
        return [];
      } catch (_err) {
        lastErr = _err;
      }
    }
  }
  throw lastErr || new Error('Could not list Ollama models');
}

async function callOllama({ prompt, model = DEFAULT_MODEL, stream = false, temperature = 0.2, max_tokens = 512, signal } = {}) {
  if (!prompt) throw new Error('No prompt provided to Ollama client');

  // Ensure model availability
  let chosenModel = model;
  try {
    const models = await listModels();
    const requested = normalizeModelName(model);
    const found = models.find(m => {
      const candidates = [];
      if (m?.name) candidates.push(m.name);
      if (m?.id) candidates.push(m.id);
      if (m?.model) candidates.push(m.model);
      candidates.push(m);
      return candidates.some(c => normalizeModelName(c) === requested);
    });
    if (found) chosenModel = found.id || found.name || found.model || found;
    else if (models[0]) {
      chosenModel = models[0].name || models[0].id || models[0].model || models[0];
      console.warn(`Requested model '${model}' not found. Falling back to '${chosenModel}'.`);
    } else {
      throw new Error(`Requested model '${model}' not found and no models available on Ollama.`);
    }
  } catch (_err) {
    console.warn('Could not list Ollama models:', _err.message);
  }

  // Endpoint candidates - prioritize standard Ollama API endpoints
  const generatePaths = [
    '/api/generate',        // Standard Ollama API endpoint
    '/v1/generate',         // OpenAI-compatible endpoint (if enabled)
    `/v1/llms/${encodeURIComponent(chosenModel)}/completions`,
    `/v1/engines/${encodeURIComponent(chosenModel)}/completions`
  ];
  const generateCandidates = [];
  for (const base of BASE_CANDIDATES) {
    for (const p of generatePaths) {
      // Use appropriate body format based on endpoint
      let body;
      if (p === '/api/generate') {
        // Standard Ollama API format
        body = { 
          model: chosenModel, 
          prompt, 
          options: { 
            temperature: temperature || 0.7,
            num_predict: max_tokens || 100
          },
          stream: false
        };
      } else {
        // OpenAI-compatible format for v1 endpoints
        body = { model: chosenModel, prompt, temperature, max_tokens };
      }
      generateCandidates.push({ url: `${base}${p}`, body });
    }
  }

  let res;
  let lastErr;
  for (const candidate of generateCandidates) {
    try {
      // Log request (node only)
      try {
        if (typeof process !== 'undefined' && process.stdout && process.env) {
          const fs = await import('fs');
          const path = await import('path');
          const logDir = path.resolve(process.cwd(), 'tmp');
          if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
          const logPath = path.join(logDir, 'ollama_client.log');
          const entry = `[REQUEST ${new Date().toISOString()}] ${candidate.url} ${JSON.stringify(candidate.body).slice(0,20000)}\n`;
          try { fs.appendFileSync(logPath, entry); } catch (_) {}
        }
      } catch (_) {}

      res = await fetch(candidate.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidate.body),
        signal
      });

      // Log response (node only)
      try {
        if (typeof process !== 'undefined' && process.stdout && process.env) {
          const fs = await import('fs');
          const path = await import('path');
          const logDir = path.resolve(process.cwd(), 'tmp');
          if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
          const logPath = path.join(logDir, 'ollama_client.log');
          const txt = await res.clone().text().catch(()=>null);
          const entry = `[RESPONSE ${new Date().toISOString()}] ${candidate.url} status=${res.status} body=${(txt||'').slice(0,20000)}\n`;
          try { fs.appendFileSync(logPath, entry); } catch (_) {}
        }
      } catch (_) {}

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        lastErr = new Error(`Ollama error: ${res.status} ${res.statusText} ${txt}`);
        continue;
      }
      break;
    } catch (_err) {
      lastErr = _err;
    }
  }

  if (!res) throw lastErr || new Error('Ollama generate request failed');
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    const err = new Error(`Ollama error: ${res.status} ${res.statusText} ${txt}`);
    err.status = res.status;
    throw err;
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json();
    
    // Handle standard Ollama API response format
    if (typeof data?.response === 'string') return { content: data.response };
    
    // Handle OpenAI-compatible format
    if (data?.choices?.length) {
      const first = data.choices[0];
      if (first?.message?.content) return { content: first.message.content };
      if (first?.text) return { content: first.text };
      if (first?.output) return { content: first.output };
    }
    
    // Handle other response formats
    if (typeof data?.output === 'string') return { content: data.output };
    if (typeof data?.result === 'string') return { content: data.result };
    return data;
  }

  const text = await res.text();
  try {
    const { parseNdjsonStream } = await import('@/lib/llmStream.js');
    const parsed = parseNdjsonStream(text, { includeThinking: false });
    if (parsed?.ndjson?.length) return parsed;
  } catch (_) {}
  return { content: text };
}

export default {
  callOllama,
  listModels
};
