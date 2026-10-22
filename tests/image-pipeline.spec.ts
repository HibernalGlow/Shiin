import { describe, expect, it } from 'vitest'
import sharp from 'sharp'
import { encodeImageBuffer } from '../src/core/screenshot.js'
import { loadFullConfig, MemoryConfigStorage } from '../src/core/config.js'
import { DEFAULT_CONFIG, type ImageFormat } from '../src/core/types.js'

describe('Unified Image Encoding Pipeline (Sharp)', () => {
  // 生成一个 64x64 的测试用无损 PNG buffer
  const createTestPngBuffer = async (): Promise<Buffer> => {
    return await sharp({
      create: {
        width: 64,
        height: 64,
        channels: 4,
        background: { r: 64, g: 128, b: 255, alpha: 1 },
      },
    })
      .png()
      .toBuffer()
  }

  it('encodes PNG buffer into WebP with lossy quality', async () => {
    const rawPng = await createTestPngBuffer()
    const webpLow = await encodeImageBuffer(rawPng, { format: 'webp', quality: 30 })
    const webpHigh = await encodeImageBuffer(rawPng, { format: 'webp', quality: 95 })

    expect(webpLow.length).toBeGreaterThan(0)
    expect(webpHigh.length).toBeGreaterThan(0)

    const meta = await sharp(webpHigh).metadata()
    expect(meta.format).toBe('webp')
    expect(meta.width).toBe(64)
    expect(meta.height).toBe(64)
  })

  it('encodes PNG buffer into WebP with lossless mode', async () => {
    const rawPng = await createTestPngBuffer()
    const webpLossless = await encodeImageBuffer(rawPng, { format: 'webp', lossless: true })

    const meta = await sharp(webpLossless).metadata()
    expect(meta.format).toBe('webp')
    expect(meta.width).toBe(64)
    expect(meta.height).toBe(64)
  })

  it('encodes PNG buffer into AVIF', async () => {
    const rawPng = await createTestPngBuffer()
    const avif = await encodeImageBuffer(rawPng, { format: 'avif', quality: 80, effort: 2 })

    expect(avif.length).toBeGreaterThan(0)
    const meta = await sharp(avif).metadata()
    expect(meta.format).toBe('heif') // sharp / libvips maps avif container under heif family
  })

  it('encodes PNG buffer into JPEG with custom quality', async () => {
    const rawPng = await createTestPngBuffer()
    const jpg = await encodeImageBuffer(rawPng, { format: 'jpg', quality: 85 })

    expect(jpg.length).toBeGreaterThan(0)
    const meta = await sharp(jpg).metadata()
    expect(meta.format).toBe('jpeg')
  })

  it('compresses PNG with specified compression level derived from quality', async () => {
    const rawPng = await createTestPngBuffer()
    const pngCompressed = await encodeImageBuffer(rawPng, { format: 'png', quality: 90 })

    expect(pngCompressed.length).toBeGreaterThan(0)
    const meta = await sharp(pngCompressed).metadata()
    expect(meta.format).toBe('png')
  })
})

describe('Config loading & migration for modern image formats', () => {
  it('loads valid webp and avif formats correctly', async () => {
    const storage = new MemoryConfigStorage()
    storage.set('globalConfig', JSON.stringify({ imageFormat: 'webp', imageQuality: 80, imageLossless: true }))

    const config = await loadFullConfig(storage)
    expect(config.imageFormat).toBe('webp')
    expect(config.imageQuality).toBe(80)
    expect(config.imageLossless).toBe(true)
  })

  it('falls back to jpg if an unsupported format (like jxl or bmp) is loaded from obsolete config', async () => {
    const storage = new MemoryConfigStorage()
    storage.set('globalConfig', JSON.stringify({ imageFormat: 'jxl' }))

    const config = await loadFullConfig(storage)
    expect(config.imageFormat).toBe('jpg')
  })

  it('clamps invalid image quality values to 90', async () => {
    const storage = new MemoryConfigStorage()
    storage.set('globalConfig', JSON.stringify({ imageFormat: 'avif', imageQuality: 999 }))

    const config = await loadFullConfig(storage)
    expect(config.imageFormat).toBe('avif')
    expect(config.imageQuality).toBe(90)
  })

  it('provides default quality 90 and lossless false for pristine config', () => {
    expect(DEFAULT_CONFIG.imageFormat).toBe('jpg')
    expect(DEFAULT_CONFIG.imageQuality).toBe(90)
    expect(DEFAULT_CONFIG.imageLossless).toBe(false)
  })
})
