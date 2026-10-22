import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import {
  type SCMPMetadata,
  type SCMPPrivacySettings,
  serializeSCMPToXmp,
  parseXmpToSCMP,
  createPngXmpChunk,
  injectXmpIntoPng,
  extractXmpFromPng,
  isPngBuffer,
  injectXmpIntoJpeg,
  extractXmpFromJpeg,
  isJpegBuffer,
  injectXmpIntoWebp,
  extractXmpFromWebp,
  isWebpBuffer,
  injectMetadataToFile,
  readMetadataFromFile,
  getSidecarPath,
  writeSidecar,
  readSidecar,
} from '../packages/capture-metadata-profile/src/index.js'

describe('Capture Metadata Profile (SCMP v1.0)', () => {
  const sampleMetadata: SCMPMetadata = {
    title: '终末地首杀',
    description: '击败战术核心 BOSS',
    tags: ['游戏', '明日方舟：终末地', 'BOSS战'],
    createDate: '2026-10-22T20:13:30+08:00',
    rating: 5,
    schemaVersion: '1.0.0',
    captureTarget: 'window',
    captureEngine: 'node-screenshots',
    triggerWay: 'gamepad',
    triggerDevice: 'DualSense Wireless Controller',
    triggerCombo: 'Share+R1',
    appName: '明日方舟：终末地',
    appId: 'com.hypergryph.endfield',
    windowTitle: '明日方舟：终末地 - 绝密作战窗口',
    resolution: '3840x2160',
    width: 3840,
    height: 2160,
    displayScale: 1.5,
    colorSpace: 'Display P3',
    platform: 'darwin-arm64',
  }

  describe('XMP Serialization and Parsing', () => {
    it('serializes full SCMP metadata and parses back accurately', () => {
      const xml = serializeSCMPToXmp(sampleMetadata, {
        enabled: true,
        recordAppName: true,
        recordAppId: true,
        recordWindowTitle: true,
        recordTriggerDevice: true,
        recordTechnicalContext: true,
      })

      expect(xml).toContain('xmlns:shiin="https://shiin.app/schema/capture/1.0/"')
      expect(xml).toContain('xmlns:dc="http://purl.org/dc/elements/1.1/"')
      expect(xml).toContain('终末地首杀')
      expect(xml).toContain('<shiin:appName>明日方舟：终末地</shiin:appName>')
      expect(xml).toContain('<shiin:triggerCombo>Share+R1</shiin:triggerCombo>')

      const parsed = parseXmpToSCMP(xml)
      expect(parsed.title).toBe('终末地首杀')
      expect(parsed.description).toBe('击败战术核心 BOSS')
      expect(parsed.tags).toEqual(['游戏', '明日方舟：终末地', 'BOSS战'])
      expect(parsed.rating).toBe(5)
      expect(parsed.createDate).toBe('2026-10-22T20:13:30+08:00')
      expect(parsed.schemaVersion).toBe('1.0.0')
      expect(parsed.appName).toBe('明日方舟：终末地')
      expect(parsed.appId).toBe('com.hypergryph.endfield')
      expect(parsed.windowTitle).toBe('明日方舟：终末地 - 绝密作战窗口')
      expect(parsed.triggerDevice).toBe('DualSense Wireless Controller')
      expect(parsed.triggerCombo).toBe('Share+R1')
      expect(parsed.width).toBe(3840)
      expect(parsed.height).toBe(2160)
      expect(parsed.colorSpace).toBe('Display P3')
    })

    it('honors privacy switches and excludes sensitive fields', () => {
      const privacy: SCMPPrivacySettings = {
        enabled: true,
        recordAppName: true,
        recordAppId: false,
        recordWindowTitle: false, // Window title masked
        recordTriggerDevice: false, // Controller info masked
        recordTechnicalContext: true,
      }

      const xml = serializeSCMPToXmp(sampleMetadata, privacy)
      expect(xml).not.toContain('windowTitle')
      expect(xml).not.toContain('绝密作战窗口')
      expect(xml).not.toContain('triggerDevice')
      expect(xml).not.toContain('DualSense')
      expect(xml).not.toContain('appId')
      expect(xml).toContain('<shiin:appName>明日方舟：终末地</shiin:appName>')

      const parsed = parseXmpToSCMP(xml)
      expect(parsed.windowTitle).toBeUndefined()
      expect(parsed.triggerDevice).toBeUndefined()
      expect(parsed.appId).toBeUndefined()
      expect(parsed.appName).toBe('明日方舟：终末地')
    })

    it('produces minimal packet when metadata recording is disabled', () => {
      const xml = serializeSCMPToXmp(sampleMetadata, {
        enabled: false,
        recordAppName: false,
        recordAppId: false,
        recordWindowTitle: false,
        recordTriggerDevice: false,
        recordTechnicalContext: false,
      })

      expect(xml).not.toContain('xmlns:shiin')
      expect(xml).not.toContain('明日方舟')
      expect(xml).toContain('<xmp:CreateDate>2026-10-22T20:13:30+08:00</xmp:CreateDate>')
    })
  })

  describe('PNG Lossless Chunk Injection & Extraction', () => {
    // Construct a minimal valid 1x1 PNG buffer
    function createMinimalPng(): Buffer {
      // 8-byte signature
      const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
      // IHDR: 13 bytes data: width 1, height 1, depth 8, colortype 2 (RGB), comp 0, filt 0, interlace 0
      const ihdrData = Buffer.from([
        0, 0, 0, 1, // width
        0, 0, 0, 1, // height
        8, 2, 0, 0, 0, // 8-bit RGB
      ])
      const ihdrType = Buffer.from('IHDR', 'ascii')
      const ihdrCrc = Buffer.from([0x2c, 0xb5, 0x35, 0x73]) // known or dummy CRC
      const ihdrChunk = Buffer.concat([
        Buffer.from([0, 0, 0, 13]),
        ihdrType,
        ihdrData,
        ihdrCrc,
      ])

      // IEND
      const iend = Buffer.from([
        0, 0, 0, 0,
        0x49, 0x45, 0x4e, 0x44, // IEND
        0xae, 0x42, 0x60, 0x82,
      ])

      return Buffer.concat([sig, ihdrChunk, iend])
    }

    it('identifies and validates PNG buffer', () => {
      const png = createMinimalPng()
      expect(isPngBuffer(png)).toBe(true)
      expect(isPngBuffer(Buffer.from('not a png'))).toBe(false)
    })

    it('injects XMP packet into PNG and extracts it back accurately without pixel damage', () => {
      const rawPng = createMinimalPng()
      const xml = serializeSCMPToXmp(sampleMetadata)

      const injected = injectXmpIntoPng(rawPng, xml)
      expect(isPngBuffer(injected)).toBe(true)
      expect(injected.length).toBeGreaterThan(rawPng.length)

      const extracted = extractXmpFromPng(injected)
      expect(extracted).not.toBeNull()
      expect(extracted).toBe(xml)

      const scmp = parseXmpToSCMP(extracted!)
      expect(scmp.appName).toBe('明日方舟：终末地')
      expect(scmp.rating).toBe(5)
    })

    it('replaces existing XMP chunk upon re-injection rather than accumulating duplicates', () => {
      const rawPng = createMinimalPng()
      const xml1 = serializeSCMPToXmp({ ...sampleMetadata, title: 'Shot 1' })
      const xml2 = serializeSCMPToXmp({ ...sampleMetadata, title: 'Shot 2 Updated' })

      const firstInjection = injectXmpIntoPng(rawPng, xml1)
      const secondInjection = injectXmpIntoPng(firstInjection, xml2)

      const extracted = extractXmpFromPng(secondInjection)
      expect(extracted).toContain('Shot 2 Updated')
      expect(extracted).not.toContain('Shot 1')
    })
  })

  describe('JPEG Segment Injection & Extraction', () => {
    function createMinimalJpeg(): Buffer {
      // SOI + APP0 (JFIF) + DQT + SOF0 + SOS + entropy + EOI
      const soi = Buffer.from([0xff, 0xd8])
      const app0 = Buffer.from([
        0xff, 0xe0,
        0x00, 0x10, // len = 16
        0x4a, 0x46, 0x49, 0x46, 0x00, // JFIF\0
        0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
      ])
      const eoi = Buffer.from([0xff, 0xd9])
      return Buffer.concat([soi, app0, eoi])
    }

    it('identifies JPEG and injects/extracts XMP correctly', () => {
      const rawJpeg = createMinimalJpeg()
      expect(isJpegBuffer(rawJpeg)).toBe(true)

      const xml = serializeSCMPToXmp(sampleMetadata)
      const injected = injectXmpIntoJpeg(rawJpeg, xml)
      expect(isJpegBuffer(injected)).toBe(true)
      expect(injected.length).toBeGreaterThan(rawJpeg.length)

      const extracted = extractXmpFromJpeg(injected)
      expect(extracted).not.toBeNull()
      expect(extracted).toBe(xml)

      const parsed = parseXmpToSCMP(extracted!)
      expect(parsed.triggerCombo).toBe('Share+R1')
      expect(parsed.appName).toBe('明日方舟：终末地')
    })
  })

  describe('WebP RIFF Chunk Injection & Extraction', () => {
    function createMinimalWebp(): Buffer {
      // RIFF header (12 bytes) + dummy VP8 chunk
      const vp8Payload = Buffer.from([0x00, 0x00, 0x00, 0x00])
      const vp8Chunk = Buffer.concat([
        Buffer.from('VP8 ', 'ascii'),
        Buffer.from([0x04, 0x00, 0x00, 0x00]),
        vp8Payload,
      ])
      const riffHeader = Buffer.alloc(12)
      riffHeader.write('RIFF', 0, 4, 'ascii')
      riffHeader.writeUInt32LE(4 + vp8Chunk.length, 4)
      riffHeader.write('WEBP', 8, 4, 'ascii')
      return Buffer.concat([riffHeader, vp8Chunk])
    }

    it('identifies WebP and injects/extracts XMP correctly', () => {
      const rawWebp = createMinimalWebp()
      expect(isWebpBuffer(rawWebp)).toBe(true)

      const xml = serializeSCMPToXmp(sampleMetadata)
      const injected = injectXmpIntoWebp(rawWebp, xml)
      expect(isWebpBuffer(injected)).toBe(true)

      const extracted = extractXmpFromWebp(injected)
      expect(extracted).not.toBeNull()
      expect(extracted).toBe(xml)
    })
  })

  describe('File-level Injection, Sidecars and Fallback', () => {
    let tempDir: string

    beforeEach(async () => {
      tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'shiin-scmp-test-'))
    })

    afterEach(async () => {
      await fs.promises.rm(tempDir, { recursive: true, force: true })
    })

    it('handles sidecar naming conventions (digiKam vs darktable)', () => {
      const file = '/photos/shot.png'
      expect(getSidecarPath(file, 'basename.ext.xmp')).toBe('/photos/shot.png.xmp')
      expect(getSidecarPath(file, 'basename.xmp')).toBe('/photos/shot.xmp')
    })

    it('writes and reads sidecar files directly', async () => {
      const imgPath = path.join(tempDir, 'test_capture.png')
      await fs.promises.writeFile(imgPath, Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))

      const xml = serializeSCMPToXmp(sampleMetadata)
      const sidecar = await writeSidecar(imgPath, xml, 'basename.ext.xmp')
      expect(fs.existsSync(sidecar)).toBe(true)

      const readBack = await readSidecar(imgPath)
      expect(readBack).toBe(xml)
    })

    it('injects metadata to file and reads it back via unified API', async () => {
      // Create a test PNG file
      const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
      const ihdrChunk = Buffer.from([
        0, 0, 0, 13,
        0x49, 0x48, 0x44, 0x52, // IHDR
        0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0,
        0x2c, 0xb5, 0x35, 0x73,
      ])
      const iend = Buffer.from([0, 0, 0, 0, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82])
      const pngFile = path.join(tempDir, 'capture_1.png')
      await fs.promises.writeFile(pngFile, Buffer.concat([sig, ihdrChunk, iend]))

      const res = await injectMetadataToFile(pngFile, sampleMetadata, {
        storageMode: 'embedIfSupported',
      })
      expect(res.ok).toBe(true)
      expect(res.embedded).toBe(true)

      const metadata = await readMetadataFromFile(pngFile)
      expect(metadata).not.toBeNull()
      expect(metadata?.appName).toBe('明日方舟：终末地')
      expect(metadata?.title).toBe('终末地首杀')
      expect(metadata?.rating).toBe(5)
    })
  })
})
