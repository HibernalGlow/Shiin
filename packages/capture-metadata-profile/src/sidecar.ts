/**
 * XMP Sidecar (.xmp) File Writer, Reader, and Locator
 */

import fs from 'node:fs'
import path from 'node:path'
import type { SidecarNamingStyle } from './types.js'

export function getSidecarPath(
  imagePath: string,
  style: SidecarNamingStyle = 'basename.ext.xmp',
): string {
  if (style === 'basename.ext.xmp') {
    // digiKam / Lightroom convention: image.png -> image.png.xmp
    return `${imagePath}.xmp`
  }
  // darktable convention: image.png -> image.xmp
  const dir = path.dirname(imagePath)
  const ext = path.extname(imagePath)
  const baseWithoutExt = path.basename(imagePath, ext)
  return path.join(dir, `${baseWithoutExt}.xmp`)
}

export function findExistingSidecar(imagePath: string): string | null {
  const extXmp = `${imagePath}.xmp`
  if (fs.existsSync(extXmp)) return extXmp

  const dir = path.dirname(imagePath)
  const ext = path.extname(imagePath)
  const baseWithoutExt = path.basename(imagePath, ext)
  const baseOnlyXmp = path.join(dir, `${baseWithoutExt}.xmp`)
  if (fs.existsSync(baseOnlyXmp)) return baseOnlyXmp

  return null
}

export async function writeSidecar(
  imagePath: string,
  xmpXml: string,
  style: SidecarNamingStyle = 'basename.ext.xmp',
): Promise<string> {
  const targetPath = getSidecarPath(imagePath, style)
  await fs.promises.writeFile(targetPath, xmpXml, 'utf8')
  return targetPath
}

export async function readSidecar(imagePath: string): Promise<string | null> {
  const found = findExistingSidecar(imagePath)
  if (!found) return null
  try {
    return await fs.promises.readFile(found, 'utf8')
  } catch {
    return null
  }
}
