import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/api/ollamaClient.js', () => {
  return {
    default: {
      callOllama: vi.fn()
    }
  };
});

import client from '@/api/ollamaClient.js';
import { generateText } from '@/lib/llmService.js';

describe('llmService.generateText', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns text on success', async () => {
    client.callOllama.mockResolvedValueOnce({ content: 'hello world' });
    const text = await generateText('hi');
    expect(text).toBe('hello world');
  });

  it('retries on error and eventually succeeds', async () => {
    client.callOllama
      .mockRejectedValueOnce(new Error('flaky'))
      .mockResolvedValueOnce({ content: 'ok' });
    const p = generateText('go', { retries: 1, backoffMs: 100 });
    // advance backoff
    await vi.advanceTimersByTimeAsync(100);
    const text = await p;
    expect(text).toBe('ok');
    expect(client.callOllama).toHaveBeenCalledTimes(2);
  });

  it('aborts on timeout', async () => {
    client.callOllama.mockImplementation(() => new Promise(() => {}));
    const p = generateText('slow', { timeoutMs: 50, retries: 0 });
    // Attach a catch immediately to avoid unhandled rejection warnings
    p.catch(() => {});
    await vi.advanceTimersByTimeAsync(60);
    await expect(p).rejects.toThrow(/timeout/i);
  }, 10000);

  it('retries on trivial outputs if guard returns true', async () => {
    client.callOllama
      .mockResolvedValueOnce({ content: 'return\nend' })
      .mockResolvedValueOnce({ content: 'faceplayer\nmsgbox @x MSG_NORMAL\nend' });
    const p = generateText('prompt', {
      retries: 1,
      backoffMs: 10,
      trivialGuard: (_p, t) => /^return\s*\nend\s*$/i.test(t)
    });
    // advance backoff for retry
    await vi.advanceTimersByTimeAsync(10);
    const text = await p;
    expect(text).toMatch(/faceplayer/);
    expect(client.callOllama).toHaveBeenCalledTimes(2);
  }, 10000);
});
