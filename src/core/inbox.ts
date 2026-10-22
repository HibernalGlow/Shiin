/**
 * Shiin Capture Inbox & Universal Assets Store Engine
 *
 * Implements the Unified Capture Inbox, status triage machine
 * ('inbox' | 'archived' | 'starred' | 'trashed'), batch operations,
 * and high-performance in-memory index queries.
 */

export type InboxItemStatus = 'inbox' | 'archived' | 'starred' | 'trashed'

export interface InboxItem {
  id: string
  filePath: string
  sidecarPath?: string
  timestamp: number
  status: InboxItemStatus
  profileId: string
  appName?: string
  windowTitle?: string
  tags: string[]
  rating: number // 0 to 5
  format: 'png' | 'jpg' | 'webp'
  width?: number
  height?: number
  sizeBytes?: number
  ocrText?: string
  pHash?: string
  derivedFrom?: string

  // SCMP v1.0 上下文扩展
  triggerWay?: string
  triggerDevice?: string
  triggerCombo?: string
  colorSpace?: string
  sourceId?: string
  isOffline?: boolean
  notes?: string
  scmp?: any
}

export interface InboxQueryFilter {
  status?: 'all' | InboxItemStatus
  profileId?: string
  appName?: string
  tag?: string
  searchQuery?: string // Matches appName, windowTitle, tags, or ocrText
  timeRange?: {
    start: number
    end: number
  }
}

export class InboxStore {
  private items = new Map<string, InboxItem>()

  constructor(initialItems?: InboxItem[]) {
    if (initialItems) {
      for (const item of initialItems) {
        this.items.set(item.id, { ...item })
      }
    }
  }

  /**
   * 将新截图或新导入的图片添加进收件箱
   */
  public addItem(
    payload: Omit<InboxItem, 'id' | 'status'> & Partial<Pick<InboxItem, 'id' | 'status'>>
  ): InboxItem {
    const id = payload.id || `cap_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const item: InboxItem = {
      ...payload,
      id,
      status: payload.status || 'inbox',
      tags: payload.tags ? [...payload.tags] : [],
      rating: payload.rating ?? 0,
    }
    this.items.set(id, item)
    return item
  }

  public getItem(id: string): InboxItem | undefined {
    return this.items.get(id)
  }

  public getAll(): InboxItem[] {
    return Array.from(this.items.values()).sort((a, b) => b.timestamp - a.timestamp)
  }

  public updateItem(id: string, patch: Partial<InboxItem>): InboxItem | undefined {
    const existing = this.items.get(id)
    if (!existing) return undefined
    const updated: InboxItem = {
      ...existing,
      ...patch,
      tags: patch.tags ? Array.from(new Set(patch.tags)) : existing.tags,
    }
    this.items.set(id, updated)
    return updated
  }

  /**
   * 单项整理动作：归档 (Archive)
   */
  public archiveItem(id: string): boolean {
    const item = this.items.get(id)
    if (!item) return false
    item.status = 'archived'
    return true
  }

  /**
   * 单项整理动作：标星/收藏 (Star)
   */
  public starItem(id: string, starred = true): boolean {
    const item = this.items.get(id)
    if (!item) return false
    item.status = starred ? 'starred' : 'inbox'
    return true
  }

  /**
   * 单项整理动作：移至废纸篓 (Trash)
   */
  public trashItem(id: string): boolean {
    const item = this.items.get(id)
    if (!item) return false
    item.status = 'trashed'
    return true
  }

  /**
   * 恢复单项至收件箱 (Restore)
   */
  public restoreItem(id: string): boolean {
    const item = this.items.get(id)
    if (!item) return false
    item.status = 'inbox'
    return true
  }

  /**
   * 彻底删除单项记录 (Permanent Delete)
   */
  public deletePermanently(id: string): boolean {
    return this.items.delete(id)
  }

  /**
   * 追加标签
   */
  public addTags(id: string, newTags: string[]): boolean {
    const item = this.items.get(id)
    if (!item) return false
    item.tags = Array.from(new Set([...item.tags, ...newTags]))
    return true
  }

  /**
   * 移除标签
   */
  public removeTag(id: string, tagToRemove: string): boolean {
    const item = this.items.get(id)
    if (!item) return false
    item.tags = item.tags.filter((t) => t !== tagToRemove)
    return true
  }

  /**
   * 批量归档
   */
  public batchArchive(ids: string[]): number {
    let count = 0
    for (const id of ids) {
      if (this.archiveItem(id)) count++
    }
    return count
  }

  /**
   * 批量移入废纸篓
   */
  public batchTrash(ids: string[]): number {
    let count = 0
    for (const id of ids) {
      if (this.trashItem(id)) count++
    }
    return count
  }

  /**
   * 批量追加标签
   */
  public batchAddTags(ids: string[], tags: string[]): number {
    let count = 0
    for (const id of ids) {
      if (this.addTags(id, tags)) count++
    }
    return count
  }

  /**
   * 获取收件箱待处理图片数量
   */
  public getInboxCount(): number {
    let count = 0
    for (const item of this.items.values()) {
      if (item.status === 'inbox') count++
    }
    return count
  }

  /**
   * 多维组合查询过滤
   */
  public query(filter?: InboxQueryFilter): InboxItem[] {
    const result: InboxItem[] = []
    const search = (filter?.searchQuery || '').trim().toLowerCase()

    for (const item of this.items.values()) {
      // 1. 状态匹配
      if (filter?.status && filter.status !== 'all') {
        if (item.status !== filter.status) continue
      }

      // 2. Profile 匹配
      if (filter?.profileId && item.profileId !== filter.profileId) {
        continue
      }

      // 3. 应用名匹配
      if (filter?.appName && item.appName?.toLowerCase() !== filter.appName.toLowerCase()) {
        continue
      }

      // 4. 标签匹配
      if (filter?.tag && !item.tags.includes(filter.tag)) {
        continue
      }

      // 5. 时间区间过滤
      if (filter?.timeRange) {
        if (item.timestamp < filter.timeRange.start || item.timestamp > filter.timeRange.end) {
          continue
        }
      }

      // 6. 搜索过滤 (匹配窗口标题、应用名、标签或 OCR 提取的正文)
      if (search) {
        const titleMatch = item.windowTitle?.toLowerCase().includes(search)
        const appMatch = item.appName?.toLowerCase().includes(search)
        const tagMatch = item.tags.some((t) => t.toLowerCase().includes(search))
        const ocrMatch = item.ocrText?.toLowerCase().includes(search)
        if (!titleMatch && !appMatch && !tagMatch && !ocrMatch) {
          continue
        }
      }

      result.push(item)
    }

    return result.sort((a, b) => b.timestamp - a.timestamp)
  }

  public toJSON(): InboxItem[] {
    return Array.from(this.items.values())
  }

  public fromJSON(data: InboxItem[]): void {
    this.items.clear()
    if (Array.isArray(data)) {
      for (const item of data) {
        this.items.set(item.id, { ...item })
      }
    }
  }
}
