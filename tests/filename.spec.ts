import { describe, it, expect } from 'vitest'
import { formatFileName, sanitizeToValidFolderName } from '../src/core/filename.js'

describe('formatFileName', () => {
  it('replaces datetime macros properly', () => {
    const fixedDate = new Date(2026, 9, 19, 14, 30, 45, 123) // 2026-10-19 14:30:45.123
    const template = 'Shot_%YYYY%-%MM%-%DD%_%hh%-%mm%-%ss%'
    const formatted = formatFileName(template, null, fixedDate)
    expect(formatted).toBe('Shot_2026-10-19_14-30-45')
  })

  it('replaces active window macros', () => {
    const active = { title: 'Monster Hunter: Wilds', owner: { name: 'MonsterHunter.exe', processId: 1234, path: '' } }
    const template = '%activeWinOwner%_%activeWinTitle%'
    const formatted = formatFileName(template, active)
    expect(formatted).toBe('MonsterHunter.exe_Monster Hunter_ Wilds')
  })

  it('falls back to default when empty', () => {
    const formatted = formatFileName('')
    expect(formatted).toMatch(/^Screenshot_\d+$/)
  })
})

describe('sanitizeToValidFolderName', () => {
  it('removes illegal characters in path', () => {
    expect(sanitizeToValidFolderName('My:Game*Title?')).toBe('My_Game_Title')
  })

  it('handles reserved windows names', () => {
    expect(sanitizeToValidFolderName('CON')).toBe('_CON')
  })
})
