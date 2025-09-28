import { describe, it, expect } from 'vitest'
import { parseNdjsonStream } from '../src/lib/llmStream.js'

describe('parseNdjsonStream', () => {
  it('assembles content from response fields and skips thinking', () => {
    const blob = [
      JSON.stringify({ model: 'gpt-oss:20b', created_at: '...', response: '', thinking: 'We' }),
      JSON.stringify({ response: '', thinking: ' need' }),
      JSON.stringify({ response: '', thinking: ' to' }),
      JSON.stringify({ response: 'faceplayer' }),
      JSON.stringify({ response: '\nmsgbox @hello MSG_NORMAL' }),
      JSON.stringify({ done: true }),
    ].join('\n')
    const { content } = parseNdjsonStream(blob)
    expect(content).toContain('faceplayer')
    expect(content).toContain('msgbox')
    expect(content).not.toContain('We need to')
  })
})
