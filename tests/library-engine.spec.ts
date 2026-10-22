import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import {
  LibraryEngine,
  type LibrarySource,
  type LibraryAsset,
} from '../src/core/index.js'
import {
  injectMetadataToFile,
  type SCMPMetadata,
} from '../packages/capture-metadata-profile/src/index.js'

describe('LibraryEngine — Multi-Source DAM & Smart Collections', () => {
  let tempRoot: string
  let sourceA: string
  let sourceB: string

  beforeEach(async () => {
    tempRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'shiin-dam-test-'))
    sourceA = path.join(tempRoot, 'GameCaptures')
    sourceB = path.join(tempRoot, 'ExternalSSD')
    await fs.promises.mkdir(sourceA, { recursive: true })
    await fs.promises.mkdir(sourceB, { recursive: true })
  })

  afterEach(async () => {
    await fs.promises.rm(tempRoot, { recursive: true, force: true })
  })

  it('registers multiple sources and discovers initial state', () => {
    const engine = new LibraryEngine()
    const src1 = engine.addSource(sourceA, '本地游戏截图')
    const src2 = engine.addSource(sourceB, '外置移动硬盘', true)

    expect(src1.name).toBe('本地游戏截图')
    expect(src1.status).toBe('active')
    expect(src2.isRemovable).toBe(true)
    expect(engine.getSources().length).toBe(2)
  })

  it('performs elastic offline detection without deleting indexed assets', async () => {
    const engine = new LibraryEngine()
    const removablePath = path.join(tempRoot, 'RemovableUSB')
    await fs.promises.mkdir(removablePath, { recursive: true })

    const src = engine.addSource(removablePath, 'Removable USB', true)

    // Create an asset in this source
    const imgPath = path.join(removablePath, 'shot1.png')
    // minimal PNG
    await fs.promises.writeFile(
      imgPath,
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]),
    )

    await engine.scanSource(src.id)
    const assetsBefore = engine.queryAssets({ sourceId: src.id })
    expect(assetsBefore.length).toBe(1)
    expect(assetsBefore[0].isOffline).toBe(false)

    // Simulate unplugging the USB drive
    await fs.promises.rm(removablePath, { recursive: true, force: true })

    engine.probeSourcesHealth()
    expect(engine.getSource(src.id)?.status).toBe('offline')

    // Assets must NOT be deleted, but flagged as offline!
    const assetsAfter = engine.queryAssets({ sourceId: src.id })
    expect(assetsAfter.length).toBe(1)
    expect(assetsAfter[0].isOffline).toBe(true)

    // Simulate plugging it back in
    await fs.promises.mkdir(removablePath, { recursive: true })
    engine.probeSourcesHealth()
    expect(engine.getSource(src.id)?.status).toBe('active')
    expect(engine.queryAssets({ sourceId: src.id })[0].isOffline).toBe(false)
  })

  it('scans and parses embedded SCMP XMP metadata into library assets', async () => {
    const engine = new LibraryEngine()
    const src = engine.addSource(sourceA, 'Game Captures')

    // Create a real PNG with embedded SCMP metadata
    const pngPath = path.join(sourceA, 'Endfield_001.png')
    // minimal 1x1 PNG
    const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
    const ihdr = Buffer.from([
      0, 0, 0, 13,
      0x49, 0x48, 0x44, 0x52,
      0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0,
      0x2c, 0xb5, 0x35, 0x73,
    ])
    const iend = Buffer.from([0, 0, 0, 0, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82])
    await fs.promises.writeFile(pngPath, Buffer.concat([sig, ihdr, iend]))

    const scmp: SCMPMetadata = {
      schemaVersion: '1.0.0',
      title: '终末地BOSS击破',
      createDate: '2026-10-22T20:13:30+08:00',
      captureTarget: 'window',
      appName: '明日方舟：终末地',
      appId: 'com.hypergryph.endfield',
      windowTitle: '明日方舟：终末地 - 核心演习',
      triggerWay: 'gamepad',
      triggerDevice: 'DualSense Wireless Controller',
      triggerCombo: 'Guide+RB',
      width: 3840,
      height: 2160,
      rating: 5,
      tags: ['游戏', '终末地', 'BOSS战'],
    }

    await injectMetadataToFile(pngPath, scmp, {
      storageMode: 'embedIfSupported',
      privacy: { recordWindowTitle: true },
    })

    const scanResult = await engine.scanSource(src.id)
    expect(scanResult.added).toBe(1)

    const assets = engine.queryAssets({ sourceId: src.id })
    expect(assets.length).toBe(1)
    const asset = assets[0]
    expect(asset.appName).toBe('明日方舟：终末地')
    expect(asset.windowTitle).toBe('明日方舟：终末地 - 核心演习')
    expect(asset.triggerCombo).toBe('Guide+RB')
    expect(asset.width).toBe(3840)
    expect(asset.rating).toBe(5)
    expect(asset.isFavorite).toBe(true)
    expect(asset.tags).toEqual(['游戏', '终末地', 'BOSS战'])
  })

  it('evaluates smart collections dynamically based on rules', () => {
    const engine = new LibraryEngine()
    const mockAssets: LibraryAsset[] = [
      {
        id: '1',
        sourceId: 'src_1',
        filePath: '/p/1.png',
        fileName: '1.png',
        fileSize: 100,
        mtime: 1,
        createdAt: 1,
        format: 'png',
        appName: '明日方舟：终末地',
        width: 3840,
        height: 2160,
        rating: 5,
        isFavorite: true,
        tags: ['游戏'],
        triggerWay: 'gamepad',
      },
      {
        id: '2',
        sourceId: 'src_1',
        filePath: '/p/2.png',
        fileName: '2.png',
        fileSize: 50,
        mtime: 2,
        createdAt: 2,
        format: 'png',
        appName: 'Firefox',
        width: 1920,
        height: 1080,
        rating: 2,
        isFavorite: false,
        tags: ['网页'],
        triggerWay: 'keyboard',
      },
    ]

    const eng = new LibraryEngine([], mockAssets)

    const favs = eng.evaluateSmartCollection('col_fav')
    expect(favs.length).toBe(1)
    expect(favs[0].id).toBe('1')

    const highRes = eng.evaluateSmartCollection('col_4k')
    expect(highRes.length).toBe(1)
    expect(highRes[0].appName).toBe('明日方舟：终末地')

    const gamepadShots = eng.evaluateSmartCollection('col_gamepad')
    expect(gamepadShots.length).toBe(1)
    expect(gamepadShots[0].id).toBe('1')
  })

  it('searches and filters assets by query, app name, and rating', () => {
    const mockAssets: LibraryAsset[] = [
      {
        id: '1',
        sourceId: 'src_1',
        filePath: '/p/1.png',
        fileName: 'capture_endfield.png',
        fileSize: 100,
        mtime: 1,
        createdAt: 1000,
        format: 'png',
        appName: '明日方舟：终末地',
        windowTitle: '终末地 - 主线任务',
        rating: 4,
        isFavorite: true,
        tags: ['游戏', '攻略'],
      },
      {
        id: '2',
        sourceId: 'src_1',
        filePath: '/p/2.png',
        fileName: 'capture_safari.png',
        fileSize: 200,
        mtime: 2,
        createdAt: 2000,
        format: 'png',
        appName: 'Safari',
        windowTitle: 'GitHub - Pull Requests',
        rating: 2,
        isFavorite: false,
        tags: ['开发'],
      },
    ]

    const eng = new LibraryEngine([], mockAssets)

    // Search query matches windowTitle
    const searchResult = eng.queryAssets({ searchQuery: '主线任务' })
    expect(searchResult.length).toBe(1)
    expect(searchResult[0].id).toBe('1')

    // App name filter
    const safariOnly = eng.queryAssets({ appName: 'Safari' })
    expect(safariOnly.length).toBe(1)
    expect(safariOnly[0].fileName).toBe('capture_safari.png')

    // Min rating filter
    const highRated = eng.queryAssets({ minRating: 3 })
    expect(highRated.length).toBe(1)
    expect(highRated[0].rating).toBe(4)

    // Extracted apps
    const apps = eng.getUniqueApps()
    expect(apps.length).toBe(2)
    expect(apps.map((a) => a.name)).toContain('明日方舟：终末地')
    expect(apps.map((a) => a.name)).toContain('Safari')
  })
})
