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
      } catch (err) {
        lastErr = err;
      }
    }
  }
  throw lastErr || new Error('Could not list Ollama models');
}

async function callOllama({ prompt, model = DEFAULT_MODEL, stream = false, temperature = 0.2, max_tokens = 512, signal } = {}) {
  if (!prompt) throw new Error('No prompt provided to Ollama client');

  // Make sure model exists; if not try to discover available models and pick first
  let chosenModel = model;
  try {
    const models = await listModels();
    // Try to match permissively: normalize names and ignore common separators
    const requested = normalizeModelName(model);
    const found = models.find(m => {
      const candidates = [];
      if (m.name) candidates.push(m.name);
      if (m.id) candidates.push(m.id);
      if (m.model) candidates.push(m.model);
      candidates.push(m);
      return candidates.some(c => normalizeModelName(c) === requested);
    });
    if (found) {
      // prefer id/name/model fields as the canonical model name
      chosenModel = found.id || found.name || found.model || found;
    }
    if (!found) {
      // pick a fallback model if available
      const fallback = models[0];
      if (fallback) {
        chosenModel = fallback.name || fallback.id || fallback.model || fallback;
        console.warn(`Requested model '${model}' not found on Ollama. Falling back to '${chosenModel}'.`);
      } else {
        throw new Error(`Requested model '${model}' not found and no models available on Ollama.`);
      }
    }
  } catch (err) {
    // If listing models failed, continue and allow the request to fail with clearer error
    console.warn('Could not list Ollama models:', err.message);
  }

  // Try a series of known generate/completions endpoints for each base candidate (proxy -> direct)
  const generatePaths = [
    '/v1/generate',
    '/api/generate',
    `/v1/llms/${encodeURIComponent(chosenModel)}/completions`,
    `/v1/engines/${encodeURIComponent(chosenModel)}/completions`
  ];
  const generateCandidates = [];
  for (const base of BASE_CANDIDATES) {
    for (const p of generatePaths) {
      generateCandidates.push({ url: `${base}${p}`, body: { model: chosenModel, prompt, temperature, max_tokens } });
    }
  }
  let res;
  let lastErr;
  for (const candidate of generateCandidates) {
    try {
      // Node-only debug logging: write request body to tmp/ollama_client.log when available
      try {
        if (typeof process !== 'undefined' && process.stdout && process.env) {
          const fs = await import('fs');
          const path = await import('path');
          const logDir = path.resolve(process.cwd(), 'tmp');
          if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
          const logPath = path.join(logDir, 'ollama_client.log');
          const entry = `[REQUEST ${new Date().toISOString()}] ${candidate.url} ${JSON.stringify(candidate.body).slice(0,20000)}\n`;
          try { fs.appendFileSync(logPath, entry); } catch (e) { /* ignore logging errors */ }
        }
      } catch (e) {}

      res = await fetch(candidate.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidate.body),
        signal
      });
      // Log response text in Node environment
      try {
        if (typeof process !== 'undefined' && process.stdout && process.env) {
          const fs = await import('fs');
          const path = await import('path');
          const logDir = path.resolve(process.cwd(), 'tmp');
          if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
          const logPath = path.join(logDir, 'ollama_client.log');
          const txt = await res.clone().text().catch(()=>null);
          const entry = `[RESPONSE ${new Date().toISOString()}] ${candidate.url} status=${res.status} body=${(txt||'').slice(0,20000)}\n`;
          try { fs.appendFileSync(logPath, entry); } catch (e) { /* ignore logging errors */ }
        }
      } catch (e) {}
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        lastErr = new Error(`Ollama error: ${res.status} ${res.statusText} ${txt}`);
        continue;
      }
      break;
    } catch (err) {
      lastErr = err;
    }
  }
  if (!res) {
    throw lastErr || new Error('Ollama generate request failed');
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    const err = new Error(`Ollama error: ${res.status} ${res.statusText} ${txt}`);
    err.status = res.status;
    throw err;
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json();
    // Common response shapes: { choices: [{ message: { content } }] }, { choices:[{text}] }, { output: '...' }, { result: ... }
    if (data.choices && Array.isArray(data.choices) && data.choices.length) {
      const first = data.choices[0];
      if (first.message && first.message.content) return { content: first.message.content };
      if (first.text) return { content: first.text };
      if (first.output) return { content: first.output };
    }
    if (data.output && typeof data.output === 'string') return { content: data.output };
    if (typeof data.result === 'string') return { content: data.result };
    return data;
  }

  const text = await res.text();
  // Detect NDJSON streaming (many JSON objects separated by newlines) and assemble
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const parsed = [];
  for (const l of lines) {
    try {
      parsed.push(JSON.parse(l));
    } catch (e) {
      // not JSON line
    }
  }

  if (parsed.length) {
    // Try to assemble a coherent text from known fields used by different Ollama builds
    // By default, exclude streaming 'thinking' fragments (they're noisy and not part of final content).
    const assembleNdjsonText = (opts = { includeThinking: false }) => {
      let assembled = '';
      for (const p of parsed) {
        if (!p || typeof p !== 'object') continue;
        if (typeof p.response === 'string' && p.response.length) assembled += p.response;
        else if (opts.includeThinking && typeof p.thinking === 'string' && p.thinking.length) assembled += p.thinking;
        else if (typeof p.content === 'string' && p.content.length) assembled += p.content;
        else if (p.choices && Array.isArray(p.choices)) {
          for (const c of p.choices) {
            if (c.text) assembled += c.text;
            if (c.message && c.message.content) assembled += c.message.content;
          }
        }
      }
      return assembled;
    };

    const assembled = assembleNdjsonText({ includeThinking: false });
    if (assembled) return { content: assembled, ndjson: parsed };
    // If nothing useful found and caller explicitly wants raw stream, return full text and ndjson
    return { content: text, ndjson: parsed };
  }

  return { content: text };
}

export default {
  callOllama,
  listModels
};
