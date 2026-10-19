import { describe, it, expect } from 'vitest'
import {
  evaluateMissingPermissions,
  testDirectoryAccess,
  resolveScreenshotSaveDir,
} from '../src/core/index.js'

describe('Permissions Core Module', () => {
  it('correctly detects missing screen recording permission on macOS as critical', () => {
    const result = evaluateMissingPermissions({
      isMac: true,
      screenCapture: false,
      accessibility: true,
      folderAccess: true,
    })

    expect(result.allGranted).toBe(false)
    expect(result.hasCriticalMissing).toBe(true)
    expect(result.missing).toHaveLength(1)
    expect(result.missing[0].id).toBe('screen')
    expect(result.missing[0].critical).toBe(true)
    expect(result.missing[0].settingsPane).toBe('screen')
  })

  it('correctly passes when all permissions are granted on macOS', () => {
    const result = evaluateMissingPermissions({
      isMac: true,
      screenCapture: true,
      accessibility: true,
      folderAccess: true,
    })

    expect(result.allGranted).toBe(true)
    expect(result.hasCriticalMissing).toBe(false)
    expect(result.missing).toHaveLength(0)
  })

  it('detects missing accessibility as non-critical (controller capture still works)', () => {
    const result = evaluateMissingPermissions({
      isMac: true,
      screenCapture: true,
      accessibility: false,
      folderAccess: true,
    })

    expect(result.allGranted).toBe(false)
    expect(result.hasCriticalMissing).toBe(false)
    expect(result.missing).toHaveLength(1)
    expect(result.missing[0].id).toBe('accessibility')
    expect(result.missing[0].critical).toBe(false)
    expect(result.missing[0].settingsPane).toBe('accessibility')
  })

  it('detects missing folder write access as critical', () => {
    const result = evaluateMissingPermissions({
      isMac: true,
      screenCapture: true,
      accessibility: true,
      folderAccess: false,
    })

    expect(result.allGranted).toBe(false)
    expect(result.hasCriticalMissing).toBe(true)
    expect(result.missing.some((m) => m.id === 'folder')).toBe(true)
  })

  it('verifies testDirectoryAccess successfully probes and tests screenshot save directory', () => {
    const dirResult = testDirectoryAccess()
    expect(dirResult.resolvedPath).toBeDefined()
    expect(typeof dirResult.resolvedPath).toBe('string')
    expect(dirResult.ok).toBe(true)
    expect(dirResult.writable).toBe(true)
  })
})
