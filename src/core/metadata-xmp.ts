/**
 * Shiin Universal Capture Metadata (XMP / IPTC Sidecar) Engine
 *
 * Implements ISO 16684-1 (XMP), Dublin Core (dc), IPTC Photo Metadata,
 * and Shiin Capture Metadata Profile (SCMP v1.0).
 *
 * Provides non-destructive .xmp sidecar generation and parsing.
 */

import fs from 'node:fs'
import path from 'node:path'

export interface CaptureMetadata {
  id: string
  title?: string
  description?: string
  tags: string[]
  creator?: string
  createdDate: string // ISO 8601 string: 2026-10-22T20:15:36Z
  rating?: number // 0-5

  // Shiin 命名空间扩展字段 (SCMP v1.0)
  appName?: string
  appId?: string
  windowTitle?: string
  profileId?: string
  profileCategory?: string
  triggerWay?: 'gamepad' | 'keyboard' | 'dock' | 'tray' | 'cli' | 'clipboard' | 'drag'
  triggerDevice?: string
  derivedFrom?: string // 衍生血缘关系
}

/**
 * 转义 XML 实体，防止注入破坏 XMP 结构
 */
function escapeXml(unsafe?: string): string {
  if (!unsafe) return ''
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * 生成符合国际标准的 XMP Sidecar 文本内容
 */
export function generateXmpSidecarContent(meta: CaptureMetadata): string {
  const dcSubjects = meta.tags
    .map((tag) => `          <rdf:li>${escapeXml(tag)}</rdf:li>`)
    .join('\n')

  return `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Shiin Universal Capture Hub v2.0">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
        xmlns:dc="http://purl.org/dc/elements/1.1/"
        xmlns:xmp="http://ns.adobe.com/xap/1.0/"
        xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/"
        xmlns:xmpMM="http://ns.adobe.com/xap/1.0/mm/"
        xmlns:shiin="https://shiin.app/schema/capture/1.0/">
      <dc:title>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">${escapeXml(meta.title || meta.windowTitle || '')}</rdf:li>
        </rdf:Alt>
      </dc:title>
      <dc:description>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">${escapeXml(meta.description || '')}</rdf:li>
        </rdf:Alt>
      </dc:description>
      <dc:subject>
        <rdf:Bag>
${dcSubjects}
        </rdf:Bag>
      </dc:subject>
      <xmp:CreateDate>${escapeXml(meta.createdDate)}</xmp:CreateDate>
      <xmp:Rating>${meta.rating ?? 0}</xmp:Rating>
      <photoshop:Source>${escapeXml(meta.appName || '')}</photoshop:Source>
      ${meta.derivedFrom ? `<xmpMM:DerivedFrom rdf:parseType="Resource"><xmpMM:documentID>${escapeXml(meta.derivedFrom)}</xmpMM:documentID></xmpMM:DerivedFrom>` : ''}
      <shiin:id>${escapeXml(meta.id)}</shiin:id>
      <shiin:appName>${escapeXml(meta.appName || '')}</shiin:appName>
      <shiin:windowTitle>${escapeXml(meta.windowTitle || '')}</shiin:windowTitle>
      <shiin:profileId>${escapeXml(meta.profileId || '')}</shiin:profileId>
      <shiin:profileCategory>${escapeXml(meta.profileCategory || '')}</shiin:profileCategory>
      <shiin:triggerWay>${escapeXml(meta.triggerWay || 'dock')}</shiin:triggerWay>
      <shiin:triggerDevice>${escapeXml(meta.triggerDevice || '')}</shiin:triggerDevice>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`
}

/**
 * 极速解析 XMP XML 内容，提取关键元数据（无重量级 XML 库依赖）
 */
export function parseXmpSidecarContent(xml: string): Partial<CaptureMetadata> {
  const result: Partial<CaptureMetadata> = {
    tags: [],
  }

  const matchSingle = (tag: string) => {
    const regex = new RegExp(`<${tag}>(.*?)<\\/${tag}>`, 's')
    const match = xml.match(regex)
    return match ? match[1].trim() : undefined
  }

  // 提取 tags (dc:subject -> rdf:li)
  const bagMatch = xml.match(/<dc:subject>[\s\S]*?<rdf:Bag>([\s\S]*?)<\/rdf:Bag>[\s\S]*?<\/dc:subject>/)
  if (bagMatch && bagMatch[1]) {
    const liMatches = bagMatch[1].matchAll(/<rdf:li>(.*?)<\/rdf:li>/g)
    for (const m of liMatches) {
      if (m[1]) result.tags!.push(m[1].trim())
    }
  }

  result.id = matchSingle('shiin:id')
  result.appName = matchSingle('shiin:appName') || matchSingle('photoshop:Source')
  result.windowTitle = matchSingle('shiin:windowTitle')
  result.profileId = matchSingle('shiin:profileId')
  result.profileCategory = matchSingle('shiin:profileCategory')
  result.createdDate = matchSingle('xmp:CreateDate')
  const ratingStr = matchSingle('xmp:Rating')
  if (ratingStr) result.rating = Number(ratingStr)

  return result
}

/**
 * 计算同名 .xmp 伴随文件路径
 */
export function getSidecarPath(imageFilePath: string): string {
  const dir = path.dirname(imageFilePath)
  const ext = path.extname(imageFilePath)
  const base = path.basename(imageFilePath, ext)
  return path.join(dir, `${base}.xmp`)
}

/**
 * 将元数据作为标准 .xmp 伴随文件持久化写入磁盘
 */
export async function writeXmpSidecarFile(
  imageFilePath: string,
  meta: CaptureMetadata
): Promise<string> {
  const sidecarPath = getSidecarPath(imageFilePath)
  const content = generateXmpSidecarContent(meta)
  await fs.promises.writeFile(sidecarPath, content, 'utf-8')
  return sidecarPath
}
