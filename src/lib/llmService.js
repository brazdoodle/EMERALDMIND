// Unified LLM service: timeouts, retries, abort support, trivial-guard
import client from '@/api/ollamaClient.js';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createTimeoutSignal(timeoutMs, externalSignal) {
  if (!timeoutMs && !externalSignal) return { signal: undefined, cancel: () => {} };
  const controller = new AbortController();
  let timer;
  if (timeoutMs) {
    timer = setTimeout(() => {
      try { controller.abort(new Error('timeout')); } catch (_) {}
    }, Math.max(1, timeoutMs));
  }
  const onAbort = () => controller.abort(externalSignal?.reason || new Error('aborted'));
  if (externalSignal) {
    if (externalSignal.aborted) onAbort();
    else externalSignal.addEventListener('abort', onAbort, { once: true });
  }
  const cancel = () => {
    if (timer) clearTimeout(timer);
    if (externalSignal) externalSignal.removeEventListener('abort', onAbort);
  };
  return { signal: controller.signal, cancel };
}

function withTimeout(promise, ms) {
  if (!ms || ms <= 0) return promise.then(_value => ({ ok: true, value: _value })).catch(_error => ({ ok: false, error: _error }));
  const wrap = promise
    .then(_value => ({ ok: true, value: _value }))
    .catch(_error => ({ ok: false, error: _error }));
  const timer = new Promise(resolve => setTimeout(() => resolve({ timeout: true }), Math.max(1, ms)));
  return Promise.race([wrap, timer]);
}

// options: { model, temperature, max_tokens, retries, timeoutMs, backoffMs, signal, trivialGuard(prompt, text):boolean, onRetry(attempt, reason) }
export async function generateText(prompt, options = {}) {
  const {
    model,
    temperature = 0.2,
    max_tokens = 512,
    retries = 1,
    timeoutMs = 20000,
    backoffMs = 300,
    signal,
    trivialGuard,
    onRetry
  } = options;

  if (!prompt || typeof prompt !== 'string') throw new Error('Prompt is required');

  let attempt = 0;
  let lastErr = null;
  while (attempt <= Math.max(0, retries)) {
    const { signal: timeoutSignal, cancel } = createTimeoutSignal(timeoutMs, signal);
    try {
      const raced = await withTimeout(client.callOllama({ prompt, model, temperature, max_tokens, signal: timeoutSignal }), timeoutMs);
      cancel();
      if (raced && raced.timeout) throw new Error('timeout');
      if (raced && raced.ok === false) throw raced.error || new Error('unknown-error');
      const resp = raced && raced.ok ? raced.value : raced; // when no timeout handling
      const text = typeof resp === 'string' ? resp : (resp?.content || resp?.text || resp?.output || resp?.response || '');
      if (trivialGuard && typeof trivialGuard === 'function') {
        try {
          if (trivialGuard(prompt, text)) {
            if (attempt < retries) {
              if (typeof onRetry === 'function') onRetry(attempt + 1, 'trivial-output');
              attempt++;
              if (backoffMs) await sleep(backoffMs);
              continue;
            }
          }
        } catch (_) {}
      }
      return text;
    } catch (_err) {
      cancel();
      lastErr = _err;
      if (signal && signal.aborted) throw _err;
      if (attempt < retries) {
        if (typeof onRetry === 'function') onRetry(attempt + 1, _err?.message || 'error');
        attempt++;
        if (backoffMs) await sleep(backoffMs);
        continue;
      }
      throw _err;
    }
  }
  throw lastErr || new Error('Generation failed');
}

export default { generateText };
