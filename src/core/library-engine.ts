/**
 * Shiin Multi-Source Indexed Library Engine
 *
 * Implements:
 * 1. Multi-source folder registration (local folders, NAS mounts, external removable SSDs).
 * 2. Elastic offline detection: marks disconnected sources as 'offline' without deleting indexed assets.
 * 3. Non-destructive scanning: extracts dimensions, timestamps, and SCMP / IPTC XMP metadata.
 * 4. Fast in-memory / SQLite-compatible search and filtering.
 * 5. Tagging, rating, favorites, and bi-directional file synchronization.
 */

import fs from 'node:fs'
import path from 'node:path'
import {
  type SCMPMetadata,
  readMetadataFromFile,
  injectMetadataToFile,
} from '@hibernalglow/capture-metadata-profile'
import type { ImageFormat } from './types.js'

export type SourceStatus = 'active' | 'offline' | 'scanning' | 'paused'

export interface LibrarySource {
  id: string
  name: string
  rootPath: string
  isRemovable: boolean
  status: SourceStatus
  lastScannedAt?: number
  itemCount?: number
}

export interface LibraryAsset {
  id: string
  sourceId: string
  filePath: string
  fileName: string
  fileSize: number
  mtime: number
  createdAt: number
  format: ImageFormat
  width?: number
  height?: number
  aspectRatio?: number
  appName?: string
  appId?: string
  windowTitle?: string
  triggerWay?: string
  triggerDevice?: string
  triggerCombo?: string
  colorSpace?: string
  rating: number
  isFavorite: boolean
  tags: string[]
  notes?: string
  scmp?: Partial<SCMPMetadata>
  isOffline?: boolean
}

export interface AssetFilterOptions {
  sourceId?: string
  appName?: string
  isFavorite?: boolean
  tag?: string
  minRating?: number
  minWidth?: number
  searchQuery?: string
  timeRange?: {
    start: number
    end: number
  }
  sortBy?: 'createdAt' | 'fileSize' | 'rating' | 'fileName'
  sortDirection?: 'asc' | 'desc'
}

export interface SmartCollectionRule {
  field: 'appName' | 'width' | 'height' | 'rating' | 'isFavorite' | 'tag' | 'triggerWay'
  operator: 'equals' | 'contains' | 'gte' | 'lte' | 'in'
  value: any
}

export interface SmartCollection {
  id: string
  name: string
  icon?: string
  rules: SmartCollectionRule[]
}

const SUPPORTED_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif'])

export class LibraryEngine {
  private sources = new Map<string, LibrarySource>()
  private assets = new Map<string, LibraryAsset>()
  private smartCollections = new Map<string, SmartCollection>()

  constructor(initialSources?: LibrarySource[], initialAssets?: LibraryAsset[]) {
    if (initialSources) {
      for (const src of initialSources) {
        this.sources.set(src.id, { ...src })
      }
    }
    if (initialAssets) {
      for (const a of initialAssets) {
        this.assets.set(a.id, { ...a })
      }
    }

    this.initDefaultSmartCollections()
  }

  private initDefaultSmartCollections() {
    this.smartCollections.set('col_fav', {
      id: 'col_fav',
      name: '星标精选',
      icon: 'star',
      rules: [{ field: 'isFavorite', operator: 'equals', value: true }],
    })
    this.smartCollections.set('col_4k', {
      id: 'col_4k',
      name: '超清捕获 (≥ 2560)',
      icon: 'sparkles',
      rules: [{ field: 'width', operator: 'gte', value: 2560 }],
    })
    this.smartCollections.set('col_gamepad', {
      id: 'col_gamepad',
      name: '手柄捕获',
      icon: 'gamepad',
      rules: [{ field: 'triggerWay', operator: 'equals', value: 'gamepad' }],
    })
  }

  // --- Source Management ---

  public addSource(rootPath: string, name?: string, isRemovable = false): LibrarySource {
    const normPath = path.normalize(rootPath)
    // Check if already registered
    for (const src of this.sources.values()) {
      if (src.rootPath === normPath) return src
    }

    const id = `src_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const source: LibrarySource = {
      id,
      name: name || path.basename(normPath) || normPath,
      rootPath: normPath,
      isRemovable,
      status: fs.existsSync(normPath) ? 'active' : 'offline',
      itemCount: 0,
    }

    this.sources.set(id, source)
    return source
  }

  public removeSource(sourceId: string, removeAssets = false): boolean {
    const exists = this.sources.delete(sourceId)
    if (exists && removeAssets) {
      for (const [assetId, asset] of this.assets.entries()) {
        if (asset.sourceId === sourceId) {
          this.assets.delete(assetId)
        }
      }
    }
    return exists
  }

  public getSources(): LibrarySource[] {
    return Array.from(this.sources.values())
  }

  public getSource(sourceId: string): LibrarySource | undefined {
    return this.sources.get(sourceId)
  }

  /**
   * Probes all registered source folders.
   * If a source path is unreachable (e.g. disconnected USB drive or NAS unmount),
   * sets status to 'offline' and flags associated assets as offline.
   */
  public probeSourcesHealth(): void {
    for (const source of this.sources.values()) {
      const isOnline = fs.existsSync(source.rootPath)
      const nextStatus: SourceStatus = isOnline ? 'active' : 'offline'
      if (source.status !== nextStatus) {
        source.status = nextStatus
        // Mark all assets from this source
        for (const asset of this.assets.values()) {
          if (asset.sourceId === source.id) {
            asset.isOffline = !isOnline
          }
        }
      }
    }
  }

  // --- Scanning & Indexing ---

  public async scanSource(sourceId: string): Promise<{ added: number; updated: number; total: number }> {
    const source = this.sources.get(sourceId)
    if (!source) throw new Error(`Source not found: ${sourceId}`)

    if (!fs.existsSync(source.rootPath)) {
      source.status = 'offline'
      return { added: 0, updated: 0, total: 0 }
    }

    source.status = 'scanning'
    let addedCount = 0
    let updatedCount = 0

    try {
      const filePaths = await this.discoverImages(source.rootPath)

      for (const filePath of filePaths) {
        try {
          const stats = await fs.promises.stat(filePath)
          const ext = path.extname(filePath).toLowerCase()
          const format = ext.replace('.', '') as ImageFormat
          const fileName = path.basename(filePath)

          // Find existing asset by filePath
          let existingAsset: LibraryAsset | undefined
          for (const a of this.assets.values()) {
            if (a.filePath === filePath) {
              existingAsset = a
              break
            }
          }

          if (existingAsset) {
            // Check if mtime has changed
            if (stats.mtimeMs > existingAsset.mtime) {
              const meta = await readMetadataFromFile(filePath)
              existingAsset.mtime = stats.mtimeMs
              existingAsset.fileSize = stats.size
              if (meta) {
                this.mergeMetadataIntoAsset(existingAsset, meta)
              }
              updatedCount++
            }
          } else {
            // New asset
            const meta = await readMetadataFromFile(filePath)
            const id = `ast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
            const newAsset: LibraryAsset = {
              id,
              sourceId: source.id,
              filePath,
              fileName,
              fileSize: stats.size,
              mtime: stats.mtimeMs,
              createdAt: stats.birthtimeMs || stats.mtimeMs,
              format,
              rating: meta?.rating ?? 0,
              isFavorite: (meta?.rating ?? 0) >= 4,
              tags: meta?.tags || [],
              appName: meta?.appName,
              appId: meta?.appId,
              windowTitle: meta?.windowTitle,
              triggerWay: meta?.triggerWay,
              triggerDevice: meta?.triggerDevice,
              triggerCombo: meta?.triggerCombo,
              width: meta?.width,
              height: meta?.height,
              aspectRatio: meta?.width && meta?.height ? meta.width / meta.height : undefined,
              colorSpace: meta?.colorSpace,
              scmp: meta || undefined,
              isOffline: false,
            }

            this.assets.set(id, newAsset)
            addedCount++
          }
        } catch {
          // ignore individual file error
        }
      }

      source.lastScannedAt = Date.now()
      source.status = 'active'
      source.itemCount = Array.from(this.assets.values()).filter((a) => a.sourceId === source.id).length
    } catch {
      source.status = 'active'
    }

    return {
      added: addedCount,
      updated: updatedCount,
      total: source.itemCount || 0,
    }
  }

  private async discoverImages(dir: string, depth = 0, maxDepth = 3): Promise<string[]> {
    if (depth > maxDepth) return []
    const results: string[] = []

    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue // skip hidden files

        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          const sub = await this.discoverImages(fullPath, depth + 1, maxDepth)
          results.push(...sub)
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase()
          if (SUPPORTED_EXTS.has(ext)) {
            results.push(fullPath)
          }
        }
      }
    } catch {
      // ignore directory access error
    }

    return results
  }

  private mergeMetadataIntoAsset(asset: LibraryAsset, meta: Partial<SCMPMetadata>) {
    if (meta.title) asset.fileName = meta.title
    if (meta.appName) asset.appName = meta.appName
    if (meta.appId) asset.appId = meta.appId
    if (meta.windowTitle) asset.windowTitle = meta.windowTitle
    if (meta.tags) asset.tags = Array.from(new Set([...asset.tags, ...meta.tags]))
    if (typeof meta.rating === 'number') asset.rating = meta.rating
    if (meta.width) asset.width = meta.width
    if (meta.height) asset.height = meta.height
    if (meta.triggerWay) asset.triggerWay = meta.triggerWay
    if (meta.triggerDevice) asset.triggerDevice = meta.triggerDevice
    if (meta.triggerCombo) asset.triggerCombo = meta.triggerCombo
    if (meta.colorSpace) asset.colorSpace = meta.colorSpace
    asset.scmp = { ...(asset.scmp || {}), ...meta }
  }

  // --- Asset Querying & Search ---

  public queryAssets(options: AssetFilterOptions = {}): LibraryAsset[] {
    let result = Array.from(this.assets.values())

    if (options.sourceId) {
      result = result.filter((a) => a.sourceId === options.sourceId)
    }

    if (options.appName) {
      result = result.filter((a) => a.appName === options.appName)
    }

    if (options.isFavorite !== undefined) {
      result = result.filter((a) => a.isFavorite === options.isFavorite)
    }

    if (options.tag) {
      result = result.filter((a) => a.tags.includes(options.tag!))
    }

    if (typeof options.minRating === 'number') {
      result = result.filter((a) => a.rating >= options.minRating!)
    }

    if (typeof options.minWidth === 'number') {
      result = result.filter((a) => (a.width || 0) >= options.minWidth!)
    }

    if (options.timeRange) {
      result = result.filter(
        (a) => a.createdAt >= options.timeRange!.start && a.createdAt <= options.timeRange!.end,
      )
    }

    if (options.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.trim().toLowerCase()
      result = result.filter(
        (a) =>
          a.fileName.toLowerCase().includes(q) ||
          (a.appName && a.appName.toLowerCase().includes(q)) ||
          (a.windowTitle && a.windowTitle.toLowerCase().includes(q)) ||
          a.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }

    // Sort
    const sortBy = options.sortBy || 'createdAt'
    const dir = options.sortDirection === 'asc' ? 1 : -1

    result.sort((a, b) => {
      let valA: any = a[sortBy]
      let valB: any = b[sortBy]
      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()

      if (valA < valB) return -1 * dir
      if (valA > valB) return 1 * dir
      return 0
    })

    return result
  }

  public getAsset(id: string): LibraryAsset | undefined {
    return this.assets.get(id)
  }

  public async updateAssetMetadata(
    id: string,
    patch: {
      rating?: number
      isFavorite?: boolean
      tags?: string[]
      notes?: string
    },
    syncToFile = true,
  ): Promise<LibraryAsset | null> {
    const asset = this.assets.get(id)
    if (!asset) return null

    if (typeof patch.rating === 'number') asset.rating = patch.rating
    if (typeof patch.isFavorite === 'boolean') asset.isFavorite = patch.isFavorite
    if (patch.tags) asset.tags = patch.tags
    if (patch.notes !== undefined) asset.notes = patch.notes

    if (syncToFile && fs.existsSync(asset.filePath)) {
      try {
        const scmpMeta: SCMPMetadata = {
          schemaVersion: '1.0.0',
          title: asset.fileName,
          description: asset.notes,
          tags: asset.tags,
          rating: asset.rating,
          createDate: new Date(asset.createdAt).toISOString(),
          captureTarget: (asset.scmp?.captureTarget as any) || 'screen',
          appName: asset.appName,
          appId: asset.appId,
          windowTitle: asset.windowTitle,
          triggerWay: asset.triggerWay as any,
          triggerDevice: asset.triggerDevice,
          triggerCombo: asset.triggerCombo,
          width: asset.width,
          height: asset.height,
          colorSpace: asset.colorSpace,
        }

        await injectMetadataToFile(asset.filePath, scmpMeta, {
          storageMode: 'embedIfSupported',
        })
      } catch (err) {
        console.warn('[LibraryEngine] Syncing metadata back to file failed:', err)
      }
    }

    return asset
  }

  // --- Smart Collections ---

  public getSmartCollections(): SmartCollection[] {
    return Array.from(this.smartCollections.values())
  }

  public addSmartCollection(collection: SmartCollection): void {
    this.smartCollections.set(collection.id, collection)
  }

  public evaluateSmartCollection(collectionId: string): LibraryAsset[] {
    const col = this.smartCollections.get(collectionId)
    if (!col) return []

    return Array.from(this.assets.values()).filter((asset) => {
      return col.rules.every((rule) => {
        const actualValue = (asset as any)[rule.field]
        switch (rule.operator) {
          case 'equals':
            return actualValue === rule.value
          case 'gte':
            return typeof actualValue === 'number' && actualValue >= rule.value
          case 'lte':
            return typeof actualValue === 'number' && actualValue <= rule.value
          case 'contains':
            if (Array.isArray(actualValue)) return actualValue.includes(rule.value)
            if (typeof actualValue === 'string') return actualValue.includes(String(rule.value))
            return false
          case 'in':
            return Array.isArray(rule.value) && rule.value.includes(actualValue)
          default:
            return true
        }
      })
    })
  }

  // --- Unique Apps & Tags Extraction for Filter HUD ---

  public getUniqueApps(): { name: string; count: number }[] {
    const counts = new Map<string, number>()
    for (const a of this.assets.values()) {
      const name = a.appName || '未分类'
      counts.set(name, (counts.get(name) || 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }

  public getUniqueTags(): { name: string; count: number }[] {
    const counts = new Map<string, number>()
    for (const a of this.assets.values()) {
      for (const t of a.tags) {
        counts.set(t, (counts.get(t) || 0) + 1)
      }
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }
}
