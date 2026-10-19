import { describe, it, expect } from 'vitest'
import { matchCondition } from '../src/xaihi/sdk/conditions.js'

describe('Xaihi condition evaluator', () => {
  it('handles always true predicate', () => {
    expect(matchCondition({ type: 'single', predicate: { test: { type: 'always' } } }, {})).toBe(true)
  })

  it('matches actionIs predicate', () => {
    const condition = {
      type: 'single' as const,
      predicate: {
        test: {
          type: 'actionIs',
          allowed: ['capture', 'list_devices'],
        },
      },
    }
    expect(matchCondition(condition, {}, 'capture')).toBe(true)
    expect(matchCondition(condition, {}, 'status')).toBe(false)
  })

  it('handles negated condition', () => {
    const condition = {
      type: 'single' as const,
      predicate: {
        test: {
          type: 'actionIs',
          allowed: ['status'],
        },
        negated: true,
      },
    }
    expect(matchCondition(condition, {}, 'capture')).toBe(true)
    expect(matchCondition(condition, {}, 'status')).toBe(false)
  })
})
