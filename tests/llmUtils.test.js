import { describe, it, expect } from 'vitest'
import { sanitizeGeneratedScript } from '../src/lib/llmUtils.js'

describe('sanitizeGeneratedScript', () => {
  it('drops NDJSON-like lines and ensures end + section header', () => {
    const input = [
      '{"model":"gpt-oss:20b","created_at":"..."}',
      '{"response":""}',
      'section1: # 000000',
      'faceplayer',
      'msgbox @hello MSG_NORMAL',
      'return',
    ].join('\n')
    const { text } = sanitizeGeneratedScript(input, 1)
    expect(text).toContain('section1: # 000000')
    expect(text.trim().endsWith('end')).toBe(true)
    expect(text).toContain('faceplayer')
    expect(text).not.toContain('created_at')
  })
})
