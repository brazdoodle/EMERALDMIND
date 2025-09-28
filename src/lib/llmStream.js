// Centralized NDJSON streaming parser for LLM responses
// Filters out 'thinking' and metadata lines by default
export function parseNdjsonStream(text, { includeThinking = false } = {}) {
  const content = typeof text === 'string' ? text : String(text ?? '');
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const parsed = [];
  for (const l of lines) {
    try {
      const obj = JSON.parse(l);
      parsed.push(obj);
    } catch (_) {
      // not JSON line
    }
  }
  if (!parsed.length) return { content: content, ndjson: [] };

  let assembled = '';
  for (const p of parsed) {
    if (!p || typeof p !== 'object') continue;
    if (typeof p.response === 'string' && p.response) { assembled += p.response; continue; }
    if (!includeThinking && typeof p.thinking === 'string') { continue; }
    if (typeof p.content === 'string' && p.content) { assembled += p.content; continue; }
    if (Array.isArray(p.choices)) {
      for (const c of p.choices) {
        if (c?.text) assembled += c.text;
        else if (c?.message?.content) assembled += c.message.content;
      }
    }
  }
  return { content: assembled || '', ndjson: parsed };
}
