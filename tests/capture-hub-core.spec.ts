import { describe, it, expect, beforeEach } from 'vitest'
import {
  BUILTIN_PROFILES,
  matchProfileForCapture,
  generateXmpSidecarContent,
  parseXmpSidecarContent,
  getSidecarPath,
  InboxStore,
  type InboxItem,
  clusterIntoSessions,
  evaluateCondition,
  matchesRule,
  simulateRules,
  applyRules,
  rollbackUndoLog,
  type AutomationRule,
  hammingDistance,
  calculateSimilarityScore,
  findSimilarGroups,
  checkVaultHealth,
  type StorageVault,
} from '../src/core/index.js'

describe('Capture Profiles (场景配置)', () => {
  it('provides 4 standard builtin profiles (Gaming, Dev, Research, Design)', () => {
    expect(BUILTIN_PROFILES.length).toBe(4)
    const ids = BUILTIN_PROFILES.map((p) => p.id)
    expect(ids).toContain('gaming')
    expect(ids).toContain('development')
    expect(ids).toContain('research')
    expect(ids).toContain('design')
  })

  it('matches development profile when active app is VS Code or Terminal', () => {
    const matched = matchProfileForCapture(BUILTIN_PROFILES, {
      appName: 'Visual Studio Code',
      windowTitle: 'App.tsx - Shiin',
    })
    expect(matched.id).toBe('development')
    expect(matched.metadataPolicy.defaultTags).toContain('Dev')
    expect(matched.pipeline.enableOCR).toBe(true)
  })

  it('matches research profile when active app is Safari or Zotero', () => {
    const matched = matchProfileForCapture(BUILTIN_PROFILES, {
      appName: 'Safari',
      windowTitle: 'Nature Article: Quantum Mechanics',
    })
    expect(matched.id).toBe('research')
    expect(matched.capturePolicy.stripWindowTitle).toBe(true)
    expect(matched.pipeline.enableOCR).toBe(true)
  })

  it('falls back to default profile when no app or keywords match', () => {
    const matched = matchProfileForCapture(BUILTIN_PROFILES, {
      appName: 'SomeRandomApp',
      windowTitle: 'Random Window',
    })
    expect(matched.isDefault).toBe(true)
    expect(matched.id).toBe('gaming')
  })
})

describe('Standard XMP / IPTC Sidecar Metadata', () => {
  it('generates standard ISO-16684-1 compliant XMP XML with Dublin Core and Shiin namespace', () => {
    const xml = generateXmpSidecarContent({
      id: 'cap_1001',
      title: 'Dev Server Crash',
      tags: ['Bug', 'Terminal', 'Node22'],
      createdDate: '2026-10-22T20:00:00Z',
      appName: 'iTerm2',
      windowTitle: 'zsh - error output',
      profileId: 'development',
      profileCategory: 'development',
      triggerWay: 'gamepad',
      rating: 4,
    })

    expect(xml).toContain('xmlns:dc="http://purl.org/dc/elements/1.1/"')
    expect(xml).toContain('xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/"')
    expect(xml).toContain('xmlns:shiin="https://shiin.app/schema/capture/1.0/"')
    expect(xml).toContain('<rdf:li>Bug</rdf:li>')
    expect(xml).toContain('<rdf:li>Terminal</rdf:li>')
    expect(xml).toContain('<shiin:appName>iTerm2</shiin:appName>')
    expect(xml).toContain('<shiin:profileId>development</shiin:profileId>')
    expect(xml).toContain('<xmp:Rating>4</xmp:Rating>')
  })

  it('parses XMP XML back into metadata properties cleanly', () => {
    const xml = generateXmpSidecarContent({
      id: 'cap_2002',
      tags: ['Figma', 'UI', 'Component'],
      createdDate: '2026-10-22T20:10:00Z',
      appName: 'Figma',
      windowTitle: 'Shiin 2.0 Design System',
      profileId: 'design',
      profileCategory: 'design',
      rating: 5,
    })

    const parsed = parseXmpSidecarContent(xml)
    expect(parsed.id).toBe('cap_2002')
    expect(parsed.appName).toBe('Figma')
    expect(parsed.windowTitle).toBe('Shiin 2.0 Design System')
    expect(parsed.tags).toEqual(['Figma', 'UI', 'Component'])
    expect(parsed.rating).toBe(5)
    expect(parsed.profileId).toBe('design')
  })

  it('computes exact sidecar path companion for image files', () => {
    expect(getSidecarPath('/home/user/Pictures/shot_01.png')).toBe('/home/user/Pictures/shot_01.xmp')
    expect(getSidecarPath('/var/data/image.jpg')).toBe('/var/data/image.xmp')
  })
})

describe('Unified Capture Inbox & Store Engine', () => {
  let store: InboxStore

  beforeEach(() => {
    store = new InboxStore()
  })

  it('adds new captures to inbox pool with default inbox status', () => {
    const item = store.addItem({
      filePath: '/path/shot1.png',
      timestamp: 1000,
      profileId: 'gaming',
      appName: 'Steam',
      format: 'png',
      tags: ['highlight'],
      rating: 0,
    })

    expect(item.id).toBeDefined()
    expect(item.status).toBe('inbox')
    expect(store.getInboxCount()).toBe(1)
  })

  it('triages item states: archive, star, trash, restore, delete', () => {
    const item = store.addItem({
      filePath: '/path/shot2.png',
      timestamp: 2000,
      profileId: 'dev',
      format: 'png',
      tags: [],
      rating: 0,
    })

    expect(store.archiveItem(item.id)).toBe(true)
    expect(store.getItem(item.id)?.status).toBe('archived')
    expect(store.getInboxCount()).toBe(0)

    store.starItem(item.id)
    expect(store.getItem(item.id)?.status).toBe('starred')

    store.trashItem(item.id)
    expect(store.getItem(item.id)?.status).toBe('trashed')

    store.restoreItem(item.id)
    expect(store.getItem(item.id)?.status).toBe('inbox')
    expect(store.getInboxCount()).toBe(1)

    store.deletePermanently(item.id)
    expect(store.getItem(item.id)).toBeUndefined()
  })

  it('supports tag mutations and batch actions', () => {
    const i1 = store.addItem({ filePath: '/1.png', timestamp: 1, profileId: 'g', format: 'png', tags: [], rating: 0 })
    const i2 = store.addItem({ filePath: '/2.png', timestamp: 2, profileId: 'g', format: 'png', tags: [], rating: 0 })

    store.batchAddTags([i1.id, i2.id], ['BatchTag', 'V2'])
    expect(store.getItem(i1.id)?.tags).toEqual(['BatchTag', 'V2'])
    expect(store.getItem(i2.id)?.tags).toEqual(['BatchTag', 'V2'])

    store.removeTag(i1.id, 'BatchTag')
    expect(store.getItem(i1.id)?.tags).toEqual(['V2'])

    const archivedCount = store.batchArchive([i1.id, i2.id])
    expect(archivedCount).toBe(2)
    expect(store.getInboxCount()).toBe(0)
  })

  it('performs multidimensional queries and full-text search', () => {
    store.addItem({
      filePath: '/a.png',
      timestamp: 100,
      profileId: 'development',
      appName: 'Terminal',
      windowTitle: 'zsh build',
      tags: ['build'],
      ocrText: 'Fatal error: segmentation fault on line 42',
      format: 'png',
      rating: 0,
    })
    store.addItem({
      filePath: '/b.png',
      timestamp: 200,
      profileId: 'research',
      appName: 'Safari',
      windowTitle: 'Quantum paper',
      tags: ['science'],
      ocrText: 'Equation 4: Schrödinger wave distribution',
      format: 'png',
      rating: 0,
    })

    // Search OCR text
    const ocrMatches = store.query({ searchQuery: 'segmentation fault' })
    expect(ocrMatches.length).toBe(1)
    expect(ocrMatches[0].appName).toBe('Terminal')

    // Filter by profile
    const devMatches = store.query({ profileId: 'development' })
    expect(devMatches.length).toBe(1)

    // Filter by tag
    const tagMatches = store.query({ tag: 'science' })
    expect(tagMatches.length).toBe(1)
    expect(tagMatches[0].appName).toBe('Safari')
  })
})

describe('Capture Sessions & Timeline Clustering', () => {
  it('clusters consecutive captures within gap into a single session', () => {
    const t0 = 1700000000000
    const items: InboxItem[] = [
      { id: '1', filePath: '/1.png', timestamp: t0, status: 'inbox', profileId: 'dev', appName: 'Code', tags: [], rating: 0, format: 'png' },
      { id: '2', filePath: '/2.png', timestamp: t0 + 30000, status: 'inbox', profileId: 'dev', appName: 'Code', tags: [], rating: 0, format: 'png' },
      { id: '3', filePath: '/3.png', timestamp: t0 + 60000, status: 'inbox', profileId: 'dev', appName: 'Chrome', tags: [], rating: 0, format: 'png' },
      // 大于 3 分钟的间隔 -> 分裂为新会话
      { id: '4', filePath: '/4.png', timestamp: t0 + 500000, status: 'inbox', profileId: 'gaming', appName: 'Steam', tags: [], rating: 0, format: 'png' },
    ]

    const sessions = clusterIntoSessions(items, 180000)
    expect(sessions.length).toBe(2)

    // 最新的会话排在前面
    const steamSession = sessions[0]
    expect(steamSession.primaryAppName).toBe('Steam')
    expect(steamSession.count).toBe(1)

    const devSession = sessions[1]
    expect(devSession.primaryAppName).toBe('Code')
    expect(devSession.count).toBe(3)
    expect(devSession.uniqueApps).toContain('Code')
    expect(devSession.uniqueApps).toContain('Chrome')
    expect(devSession.summaryZh).toContain('3 张')
  })
})

describe('Automation Rule Engine & Dry Run', () => {
  const sampleItems: InboxItem[] = [
    {
      id: 'it1',
      filePath: '/shot1.png',
      timestamp: 1000,
      status: 'inbox',
      profileId: 'dev',
      appName: 'Terminal',
      ocrText: 'Database connection failed: ECONNREFUSED',
      tags: [],
      rating: 0,
      format: 'png',
    },
    {
      id: 'it2',
      filePath: '/shot2.png',
      timestamp: 2000,
      status: 'inbox',
      profileId: 'gaming',
      appName: 'Steam',
      tags: [],
      rating: 0,
      format: 'png',
    },
  ]

  const rule: AutomationRule = {
    id: 'r_econnrefused',
    name: 'Auto-tag Connection Errors',
    enabled: true,
    conditions: {
      all: [
        { field: 'appName', operator: 'equals', value: 'Terminal' },
        { field: 'ocrText', operator: 'contains', value: 'ECONNREFUSED' },
      ],
    },
    actions: [
      { type: 'addTags', value: ['DatabaseError', 'HighPriority'] },
      { type: 'star', value: true },
    ],
  }

  it('evaluates conditions correctly', () => {
    expect(evaluateCondition(sampleItems[0], { field: 'appName', operator: 'equals', value: 'Terminal' })).toBe(true)
    expect(evaluateCondition(sampleItems[0], { field: 'appName', operator: 'equals', value: 'Steam' })).toBe(false)
    expect(matchesRule(sampleItems[0], rule)).toBe(true)
    expect(matchesRule(sampleItems[1], rule)).toBe(false)
  })

  it('simulates dry run without modifying items', () => {
    const preview = simulateRules(sampleItems, [rule])
    expect(preview.length).toBe(1)
    expect(preview[0].matchedItemIds).toEqual(['it1'])
    expect(sampleItems[0].tags).toEqual([]) // 依然保持原样
    expect(sampleItems[0].status).toBe('inbox')
  })

  it('applies rules and supports undo rollback', () => {
    const clone = JSON.parse(JSON.stringify(sampleItems)) as InboxItem[]
    const { affectedItemIds, undoLog } = applyRules(clone, [rule])

    expect(affectedItemIds).toEqual(['it1'])
    expect(clone[0].tags).toContain('DatabaseError')
    expect(clone[0].tags).toContain('HighPriority')
    expect(clone[0].status).toBe('starred')

    // Rollback using undo log
    const reverted = rollbackUndoLog(clone, undoLog)
    expect(reverted).toBeGreaterThan(0)
    expect(clone[0].tags).toEqual([])
    expect(clone[0].status).toBe('inbox')
  })
})

describe('Perceptual Similarity & Hash Detection', () => {
  it('calculates hamming distance and similarity score accurately', () => {
    const hashA = 'ffff0000ffff0000'
    const hashB = 'ffff0000ffff0001' // 1 bit 差异
    const dist = hammingDistance(hashA, hashB)
    expect(dist).toBe(1)

    const score = calculateSimilarityScore(hashA, hashB)
    expect(score).toBeGreaterThan(0.98)
  })

  it('clusters similar shots and recommends the highest resolution representative', () => {
    const items: InboxItem[] = [
      {
        id: 'shot_low',
        filePath: '/low.png',
        timestamp: 100,
        status: 'inbox',
        profileId: 'g',
        pHash: 'ffff0000ffff0000',
        width: 1280,
        height: 720,
        tags: [],
        rating: 0,
        format: 'png',
      },
      {
        id: 'shot_high',
        filePath: '/high.png',
        timestamp: 105,
        status: 'inbox',
        profileId: 'g',
        pHash: 'ffff0000ffff0001', // 极小差异
        width: 3840,
        height: 2160,
        tags: [],
        rating: 0,
        format: 'png',
      },
      {
        id: 'shot_different',
        filePath: '/diff.png',
        timestamp: 200,
        status: 'inbox',
        profileId: 'g',
        pHash: '0000ffff0000ffff', // 完全不同
        width: 1920,
        height: 1080,
        tags: [],
        rating: 0,
        format: 'png',
      },
    ]

    const groups = findSimilarGroups(items, 5)
    expect(groups.length).toBe(1)
    expect(groups[0].items.length).toBe(2)
    // 推荐保留高分辨率版本
    expect(groups[0].representativeId).toBe('shot_high')
    expect(groups[0].similarityScore).toBeGreaterThan(0.95)
  })
})

describe('Multi-Vault Storage Health Engine', () => {
  it('correctly marks non-existent paths as offline rather than error, protecting cache', async () => {
    const vault: StorageVault = {
      id: 'usb_vault',
      name: 'External SSD',
      path: '/Volumes/NonExistentDisk/Screenshots',
      status: 'online',
      lastCheckedAt: Date.now(),
    }

    const report = await checkVaultHealth(vault)
    expect(report.status).toBe('offline')
    expect(report.isOffline).toBe(true)
    expect(report.accessible).toBe(false)
    expect(report.messageZh).toContain('离线或未挂载')
  })

  it('detects healthy writable directory', async () => {
    const vault: StorageVault = {
      id: 'local_tmp',
      name: 'Temp Vault',
      path: process.cwd(),
      status: 'offline',
      lastCheckedAt: Date.now(),
    }

    const report = await checkVaultHealth(vault)
    expect(report.status).toBe('online')
    expect(report.accessible).toBe(true)
    expect(report.writable).toBe(true)
  })
})
