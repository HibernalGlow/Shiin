import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import {
  type ScreenshotConfig,
  DEFAULT_CONFIG,
  performScreenshot,
} from '../src/core/index.js'
import { readMetadataFromFile } from '../packages/capture-metadata-profile/src/index.js'

describe('Screenshot Pipeline + SCMP v1.0 Metadata Integration', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'shiin-cap-integ-'))
  })

  afterEach(async () => {
    await fs.promises.rm(tempDir, { recursive: true, force: true })
  })

  it('embeds lossless SCMP XMP metadata into output capture when enabled', async () => {
    const config: ScreenshotConfig = {
      ...DEFAULT_CONFIG,
      path: tempDir,
      imageFormat: 'png',
      metadataRecordingEnabled: true,
      recordAppName: true,
      recordWindowTitle: false, // Window title masked
      recordTriggerDevice: true,
      metadataStorageMode: 'embedIfSupported',
    }

    const result = await performScreenshot(config, {
      triggerWay: 'gamepad',
      triggerDevice: 'DualSense Wireless Controller',
      triggerCombo: 'Guide+RB',
    })

    expect(result.ok).toBe(true)
    expect(result.filePath).toBeTruthy()
    expect(fs.existsSync(result.filePath!)).toBe(true)
    expect(result.scmp).toBeDefined()
    expect(result.scmp?.schemaVersion).toBe('1.0.0')
    expect(result.scmp?.triggerWay).toBe('gamepad')
    expect(result.scmp?.triggerDevice).toBe('DualSense Wireless Controller')
    expect(result.scmp?.triggerCombo).toBe('Guide+RB')

    // Read the actual written PNG file from disk to verify the lossless iTXt chunk
    const fileMeta = await readMetadataFromFile(result.filePath!)
    expect(fileMeta).not.toBeNull()
    expect(fileMeta?.schemaVersion).toBe('1.0.0')
    expect(fileMeta?.triggerWay).toBe('gamepad')
    expect(fileMeta?.triggerDevice).toBe('DualSense Wireless Controller')
    expect(fileMeta?.triggerCombo).toBe('Guide+RB')
    // Window title was disabled by privacy switch, so must not exist in file
    expect(fileMeta?.windowTitle).toBeUndefined()
  })

  it('writes standard sidecar .xmp when storage mode is both or sidecarOnly', async () => {
    const config: ScreenshotConfig = {
      ...DEFAULT_CONFIG,
      path: tempDir,
      imageFormat: 'png',
      metadataRecordingEnabled: true,
      recordAppName: true,
      recordWindowTitle: true,
      metadataStorageMode: 'both',
      sidecarNaming: 'basename.ext.xmp',
    }

    const result = await performScreenshot(config, {
      triggerWay: 'keyboard',
      triggerDevice: 'Keychron Q1',
      triggerCombo: 'F12',
    })

    expect(result.ok).toBe(true)
    expect(result.filePath).toBeTruthy()

    // Sidecar file should exist alongside the image
    const sidecarPath = `${result.filePath!}.xmp`
    expect(fs.existsSync(sidecarPath)).toBe(true)

    const sidecarContent = await fs.promises.readFile(sidecarPath, 'utf8')
    expect(sidecarContent).toContain('xmlns:shiin="https://shiin.app/schema/capture/1.0/"')
    expect(sidecarContent).toContain('<shiin:triggerDevice>Keychron Q1</shiin:triggerDevice>')
    expect(sidecarContent).toContain('<shiin:triggerCombo>F12</shiin:triggerCombo>')
  })
})
