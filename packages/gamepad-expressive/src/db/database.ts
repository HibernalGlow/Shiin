import type { SdlMappingEntry } from '../types.js'
import { parseSdlMappingLine, extractVidPidFromGuid } from './parser.js'
import { SDL_DB_LINES } from './raw-db.js'

class SdlDatabaseRegistry {
  private guidIndex = new Map<string, SdlMappingEntry>()
  private vidPidIndex = new Map<string, SdlMappingEntry>()
  private nameIndex = new Map<string, SdlMappingEntry>()
  private customEntries: SdlMappingEntry[] = []
  private initialized = false

  public ensureInitialized(): void {
    if (this.initialized) return
    this.initialized = true

    for (const line of SDL_DB_LINES) {
      const entry = parseSdlMappingLine(line)
      if (entry) {
        this.indexEntry(entry)
      }
    }
  }

  private indexEntry(entry: SdlMappingEntry): void {
    const cleanGuid = entry.guid.toLowerCase()
    if (!this.guidIndex.has(cleanGuid)) {
      this.guidIndex.set(cleanGuid, entry)
    }

    const { vendorId, productId } = extractVidPidFromGuid(entry.guid)
    if (vendorId !== undefined && productId !== undefined) {
      const key = `${vendorId}:${productId}`
      if (!this.vidPidIndex.has(key)) {
        this.vidPidIndex.set(key, entry)
      }
    }

    const cleanName = entry.name.toLowerCase().trim()
    if (cleanName && !this.nameIndex.has(cleanName)) {
      this.nameIndex.set(cleanName, entry)
    }
  }

  public registerCustomMapping(line: string): SdlMappingEntry | null {
    this.ensureInitialized()
    const entry = parseSdlMappingLine(line)
    if (entry) {
      this.customEntries.unshift(entry)
      // Custom overrides existing mappings
      this.guidIndex.set(entry.guid.toLowerCase(), entry)
      const { vendorId, productId } = extractVidPidFromGuid(entry.guid)
      if (vendorId !== undefined && productId !== undefined) {
        this.vidPidIndex.set(`${vendorId}:${productId}`, entry)
      }
      return entry
    }
    return null
  }

  public find(query: {
    guid?: string
    vendorId?: number
    productId?: number
    name?: string
  }): SdlMappingEntry | null {
    this.ensureInitialized()

    // 1. Exact GUID match
    if (query.guid) {
      const match = this.guidIndex.get(query.guid.toLowerCase())
      if (match) return match
    }

    // 2. VID:PID match
    if (query.vendorId !== undefined && query.productId !== undefined) {
      const key = `${query.vendorId}:${query.productId}`
      const match = this.vidPidIndex.get(key)
      if (match) return match
    }

    // 3. Fallback extraction of VID:PID from GUID
    if (query.guid) {
      const { vendorId, productId } = extractVidPidFromGuid(query.guid)
      if (vendorId !== undefined && productId !== undefined) {
        const key = `${vendorId}:${productId}`
        const match = this.vidPidIndex.get(key)
        if (match) return match
      }
    }

    // 4. Name fuzzy/exact match with platform aliases
    if (query.name) {
      const cleanName = query.name.toLowerCase().trim()
      const exact = this.nameIndex.get(cleanName)
      if (exact) return exact

      // Check common aliases
      let aliasKey: string | null = null
      if (cleanName.includes('dualsense')) aliasKey = 'ps5 controller'
      else if (cleanName.includes('dualshock 4') || cleanName.includes('dualshock4')) aliasKey = 'ps4 controller'
      else if (cleanName.includes('switch pro')) aliasKey = 'nintendo switch pro controller'

      if (aliasKey) {
        const aliasMatch = this.nameIndex.get(aliasKey)
        if (aliasMatch) return aliasMatch
      }

      // Partial name match if exact not found
      for (const [key, entry] of this.nameIndex.entries()) {
        if (cleanName.includes(key) || key.includes(cleanName)) {
          return entry
        }
      }
    }

    return null
  }

  public getAllMappingLines(): string[] {
    return SDL_DB_LINES.slice()
  }
}

export const sdlDatabase = new SdlDatabaseRegistry()

export function findSdlMapping(query: {
  guid?: string
  vendorId?: number
  productId?: number
  name?: string
}): SdlMappingEntry | null {
  return sdlDatabase.find(query)
}

export function registerCustomSdlMapping(line: string): SdlMappingEntry | null {
  return sdlDatabase.registerCustomMapping(line)
}

export function getAllSdlMappingLines(): string[] {
  return sdlDatabase.getAllMappingLines()
}
