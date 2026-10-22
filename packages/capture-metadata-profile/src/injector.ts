/**
 * Unified Lossless Metadata Injector & Reader API
 */

import fs from 'node:fs'
import path from 'node:path'
import {
  type SCMPMetadata,
  type MetadataInjectionOptions,
  type MetadataInjectionResult,
  type SCMPPrivacySettings,
  DEFAULT_SCMP_PRIVACY_SETTINGS,
} from './types.js'
import { serializeSCMPToXmp, parseXmpToSCMP } from './xmp.js'
import { injectXmpIntoPng, extractXmpFromPng, isPngBuffer } from './chunk-png.js'
import { injectXmpIntoJpeg, extractXmpFromJpeg, isJpegBuffer } from './chunk-jpeg.js'
import { injectXmpIntoWebp, extractXmpFromWebp, isWebpBuffer } from './chunk-webp.js'
import { writeSidecar, readSidecar } from './sidecar.js'

export function injectMetadataToBuffer(
  buffer: Buffer,
  format: 'png' | 'jpg' | 'jpeg' | 'webp',
  metadata: SCMPMetadata,
  privacy: SCMPPrivacySettings = DEFAULT_SCMP_PRIVACY_SETTINGS,
): Buffer {
  const xmpXml = serializeSCMPToXmp(metadata, privacy)
  const normFormat = format.toLowerCase()

  if (normFormat === 'png' || isPngBuffer(buffer)) {
    return injectXmpIntoPng(buffer, xmpXml)
  }
  if (normFormat === 'jpg' || normFormat === 'jpeg' || isJpegBuffer(buffer)) {
    return injectXmpIntoJpeg(buffer, xmpXml)
  }
  if (normFormat === 'webp' || isWebpBuffer(buffer)) {
    return injectXmpIntoWebp(buffer, xmpXml)
  }

  throw new Error(`Unsupported format for embedded XMP injection: ${format}`)
}

export function readMetadataFromBuffer(
  buffer: Buffer,
  format?: 'png' | 'jpg' | 'jpeg' | 'webp',
): Partial<SCMPMetadata> | null {
  let xmpXml: string | null = null

  if (isPngBuffer(buffer) || format === 'png') {
    xmpXml = extractXmpFromPng(buffer)
  } else if (isJpegBuffer(buffer) || format === 'jpg' || format === 'jpeg') {
    xmpXml = extractXmpFromJpeg(buffer)
  } else if (isWebpBuffer(buffer) || format === 'webp') {
    xmpXml = extractXmpFromWebp(buffer)
  }

  if (!xmpXml) return null
  return parseXmpToSCMP(xmpXml)
}

/**
 * Injects SCMP metadata into a file on disk according to storage mode preferences.
 */
export async function injectMetadataToFile(
  filePath: string,
  metadata: SCMPMetadata,
  options: MetadataInjectionOptions = {},
): Promise<MetadataInjectionResult> {
  const storageMode = options.storageMode || 'embedIfSupported'
  const privacy: SCMPPrivacySettings = {
    ...DEFAULT_SCMP_PRIVACY_SETTINGS,
    ...(options.privacy || {}),
  }
  const xmpXml = serializeSCMPToXmp(metadata, privacy)
  const ext = path.extname(filePath).toLowerCase().replace('.', '')

  if (storageMode === 'databaseOnly') {
    return { ok: true, method: 'skipped', embedded: false }
  }

  if (storageMode === 'sidecarOnly') {
    const sidecarPath = await writeSidecar(filePath, xmpXml, options.sidecarNaming)
    return { ok: true, method: 'sidecar', embedded: false, sidecarPath }
  }

  let embedded = false
  let sidecarPath: string | undefined

  try {
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
      const buffer = await fs.promises.readFile(filePath)
      const updatedBuffer = injectMetadataToBuffer(
        buffer,
        ext as 'png' | 'jpg' | 'jpeg' | 'webp',
        metadata,
        privacy,
      )
      await fs.promises.writeFile(filePath, updatedBuffer)
      embedded = true
    } else {
      // Format not supported for embedding; fall back to sidecar
      sidecarPath = await writeSidecar(filePath, xmpXml, options.sidecarNaming)
    }
  } catch (err) {
    // If embedding failed, fall back to sidecar file
    try {
      sidecarPath = await writeSidecar(filePath, xmpXml, options.sidecarNaming)
    } catch (sidecarErr) {
      return {
        ok: false,
        method: 'skipped',
        embedded: false,
        error: `Failed to embed or write sidecar: ${(err as Error)?.message || err}`,
      }
    }
  }

  if (storageMode === 'both') {
    sidecarPath = await writeSidecar(filePath, xmpXml, options.sidecarNaming)
    return { ok: true, method: 'both', embedded, sidecarPath }
  }

  return {
    ok: true,
    method: embedded ? 'embedded' : 'sidecar',
    embedded,
    sidecarPath,
  }
}

/**
 * Reads SCMP metadata from a file on disk, checking both embedded metadata and sidecar files.
 */
export async function readMetadataFromFile(filePath: string): Promise<Partial<SCMPMetadata> | null> {
  // 1. Try reading sidecar first if present (often has more recent edits if updated by darktable/digiKam)
  const sidecarXml = await readSidecar(filePath)
  if (sidecarXml) {
    const sidecarData = parseXmpToSCMP(sidecarXml)
    if (Object.keys(sidecarData).length > 0) {
      return sidecarData
    }
  }

  // 2. Try reading embedded metadata
  try {
    const buffer = await fs.promises.readFile(filePath)
    const embeddedData = readMetadataFromBuffer(buffer)
    if (embeddedData && Object.keys(embeddedData).length > 0) {
      return embeddedData
    }
  } catch {
    // ignore read error
  }

  return null
}
