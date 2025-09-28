import { describe, it, expect } from 'vitest'
import { isTrivialScript } from '../src/lib/scriptQuality.js'

describe('isTrivialScript', () => {
  it('flags empty or minimal scripts as trivial', () => {
    expect(isTrivialScript('')).toBe(true)
    expect(isTrivialScript('return\nend')).toBe(true)
  })
  it('accepts multi-command scripts as non-trivial', () => {
    const s = 'section1: # 000000\nfaceplayer\nmsgbox @text MSG_NORMAL\ncall @do\nreturn\nend'
    expect(isTrivialScript(s)).toBe(false)
  })
})
