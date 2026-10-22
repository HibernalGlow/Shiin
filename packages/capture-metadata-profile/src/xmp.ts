import {
  XMP_NS_DC,
  XMP_NS_RDF,
  XMP_NS_SHIIN,
  XMP_NS_XMP,
  XMP_HEADER_ID,
  SCMP_SCHEMA_VERSION,
} from './constants.js'
import {
  type SCMPMetadata,
  type SCMPPrivacySettings,
  DEFAULT_SCMP_PRIVACY_SETTINGS,
} from './types.js'

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Serializes SCMPMetadata into a standard ISO 16684-1 XMP XML packet.
 */
export function serializeSCMPToXmp(
  metadata: SCMPMetadata,
  privacy: SCMPPrivacySettings = DEFAULT_SCMP_PRIVACY_SETTINGS,
): string {
  if (!privacy.enabled) {
    // Privacy disabled: serialize only minimal timestamp and standard basic container
    return `<?xpacket begin="\uFEFF" id="${XMP_HEADER_ID}"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Shiin Capture Metadata Profile 1.0">
  <rdf:RDF xmlns:rdf="${XMP_NS_RDF}">
    <rdf:Description rdf:about="" xmlns:xmp="${XMP_NS_XMP}">
      <xmp:CreateDate>${escapeXml(metadata.createDate)}</xmp:CreateDate>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`
  }

  // Dublin Core (dc:*) & XMP Core (xmp:*)
  const standardFields: string[] = []
  standardFields.push(`      <xmp:CreateDate>${escapeXml(metadata.createDate)}</xmp:CreateDate>`)

  if (typeof metadata.rating === 'number' && Number.isFinite(metadata.rating)) {
    standardFields.push(`      <xmp:Rating>${Math.round(metadata.rating)}</xmp:Rating>`)
  }

  if (metadata.title) {
    standardFields.push(
      `      <dc:title><rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(metadata.title)}</rdf:li></rdf:Alt></dc:title>`,
    )
  }

  if (metadata.description) {
    standardFields.push(
      `      <dc:description><rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(metadata.description)}</rdf:li></rdf:Alt></dc:description>`,
    )
  }

  if (metadata.tags && metadata.tags.length > 0) {
    const tagItems = metadata.tags.map((t) => `          <rdf:li>${escapeXml(t)}</rdf:li>`).join('\n')
    standardFields.push(`      <dc:subject>\n        <rdf:Bag>\n${tagItems}\n        </rdf:Bag>\n      </dc:subject>`)
  }

  // Shiin Capture Extension (shiin:*)
  const shiinFields: string[] = [
    `      <shiin:schemaVersion>${SCMP_SCHEMA_VERSION}</shiin:schemaVersion>`,
    `      <shiin:captureTarget>${escapeXml(metadata.captureTarget || 'screen')}</shiin:captureTarget>`,
  ]

  if (privacy.recordTechnicalContext) {
    if (metadata.captureEngine) {
      shiinFields.push(`      <shiin:captureEngine>${escapeXml(metadata.captureEngine)}</shiin:captureEngine>`)
    }
    if (metadata.triggerWay) {
      shiinFields.push(`      <shiin:triggerWay>${escapeXml(metadata.triggerWay)}</shiin:triggerWay>`)
    }
    if (metadata.resolution) {
      shiinFields.push(`      <shiin:resolution>${escapeXml(metadata.resolution)}</shiin:resolution>`)
    }
    if (typeof metadata.width === 'number') {
      shiinFields.push(`      <shiin:width>${metadata.width}</shiin:width>`)
    }
    if (typeof metadata.height === 'number') {
      shiinFields.push(`      <shiin:height>${metadata.height}</shiin:height>`)
    }
    if (typeof metadata.displayScale === 'number') {
      shiinFields.push(`      <shiin:displayScale>${metadata.displayScale}</shiin:displayScale>`)
    }
    if (metadata.colorSpace) {
      shiinFields.push(`      <shiin:colorSpace>${escapeXml(metadata.colorSpace)}</shiin:colorSpace>`)
    }
    if (metadata.platform) {
      shiinFields.push(`      <shiin:platform>${escapeXml(metadata.platform)}</shiin:platform>`)
    }
  }

  if (privacy.recordTriggerDevice) {
    if (metadata.triggerDevice) {
      shiinFields.push(`      <shiin:triggerDevice>${escapeXml(metadata.triggerDevice)}</shiin:triggerDevice>`)
    }
    if (metadata.triggerCombo) {
      shiinFields.push(`      <shiin:triggerCombo>${escapeXml(metadata.triggerCombo)}</shiin:triggerCombo>`)
    }
  }

  if (privacy.recordAppName && metadata.appName) {
    shiinFields.push(`      <shiin:appName>${escapeXml(metadata.appName)}</shiin:appName>`)
  }

  if (privacy.recordAppId && metadata.appId) {
    shiinFields.push(`      <shiin:appId>${escapeXml(metadata.appId)}</shiin:appId>`)
  }

  if (privacy.recordWindowTitle && metadata.windowTitle) {
    shiinFields.push(`      <shiin:windowTitle>${escapeXml(metadata.windowTitle)}</shiin:windowTitle>`)
  }

  return `<?xpacket begin="\uFEFF" id="${XMP_HEADER_ID}"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Shiin Capture Metadata Profile 1.0">
  <rdf:RDF xmlns:rdf="${XMP_NS_RDF}">
    <rdf:Description rdf:about=""
        xmlns:dc="${XMP_NS_DC}"
        xmlns:xmp="${XMP_NS_XMP}">
${standardFields.join('\n')}
    </rdf:Description>
    <rdf:Description rdf:about=""
        xmlns:shiin="${XMP_NS_SHIIN}">
${shiinFields.join('\n')}
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`
}

function unescapeXml(safe: string): string {
  return safe
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

function extractTagValue(xml: string, tagName: string, expectedPrefix?: string): string | undefined {
  const prefixPattern = expectedPrefix ? `${expectedPrefix}:` : '(?:[a-zA-Z0-9_-]+:)?'
  const regex = new RegExp(`<${prefixPattern}${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${prefixPattern}${tagName}>`, 'i')
  const match = xml.match(regex)
  if (!match) return undefined

  let inner = match[1].trim()
  // If it's an Alt li (like in dc:title or dc:description)
  const liMatch = inner.match(/<rdf:li[^>]*>([\s\S]*?)<\/rdf:li>/i)
  if (liMatch) {
    inner = liMatch[1].trim()
  }
  return unescapeXml(inner)
}

function extractBagList(xml: string, containerName: string): string[] {
  const containerRegex = new RegExp(`<(?:[a-zA-Z0-9_-]+:)?${containerName}[^>]*>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_-]+:)?${containerName}>`, 'i')
  const containerMatch = xml.match(containerRegex)
  if (!containerMatch) return []

  const inner = containerMatch[1]
  const liRegex = /<rdf:li[^>]*>([\s\S]*?)<\/rdf:li>/gi
  const items: string[] = []
  let liMatch: RegExpExecArray | null

  while ((liMatch = liRegex.exec(inner)) !== null) {
    items.push(unescapeXml(liMatch[1].trim()))
  }
  return items
}

/**
 * Robust pure TypeScript parser that extracts SCMP metadata and standard IPTC/XMP fields from an XMP string.
 */
export function parseXmpToSCMP(xmpXml: string): Partial<SCMPMetadata> {
  const result: Partial<SCMPMetadata> = {}

  const createDate = extractTagValue(xmpXml, 'CreateDate')
  if (createDate) result.createDate = createDate

  const ratingStr = extractTagValue(xmpXml, 'Rating')
  if (ratingStr && !Number.isNaN(Number(ratingStr))) {
    result.rating = Number(ratingStr)
  }

  const title = extractTagValue(xmpXml, 'title', 'dc') || extractTagValue(xmpXml, 'title')
  if (title) result.title = title

  const description = extractTagValue(xmpXml, 'description', 'dc')
  if (description) result.description = description

  const tags = extractBagList(xmpXml, 'subject')
  if (tags.length > 0) result.tags = tags

  // Shiin specific tags
  const schemaVersion = extractTagValue(xmpXml, 'schemaVersion')
  if (schemaVersion === '1.0.0') result.schemaVersion = '1.0.0'

  const captureTarget = extractTagValue(xmpXml, 'captureTarget') as SCMPMetadata['captureTarget'] | undefined
  if (captureTarget) result.captureTarget = captureTarget

  const captureEngine = extractTagValue(xmpXml, 'captureEngine') as SCMPMetadata['captureEngine'] | undefined
  if (captureEngine) result.captureEngine = captureEngine

  const triggerWay = extractTagValue(xmpXml, 'triggerWay') as SCMPMetadata['triggerWay'] | undefined
  if (triggerWay) result.triggerWay = triggerWay

  const triggerDevice = extractTagValue(xmpXml, 'triggerDevice')
  if (triggerDevice) result.triggerDevice = triggerDevice

  const triggerCombo = extractTagValue(xmpXml, 'triggerCombo')
  if (triggerCombo) result.triggerCombo = triggerCombo

  const appName = extractTagValue(xmpXml, 'appName')
  if (appName) result.appName = appName

  const appId = extractTagValue(xmpXml, 'appId')
  if (appId) result.appId = appId

  const windowTitle = extractTagValue(xmpXml, 'windowTitle')
  if (windowTitle) result.windowTitle = windowTitle

  const resolution = extractTagValue(xmpXml, 'resolution')
  if (resolution) result.resolution = resolution

  const widthStr = extractTagValue(xmpXml, 'width')
  if (widthStr && !Number.isNaN(Number(widthStr))) result.width = Number(widthStr)

  const heightStr = extractTagValue(xmpXml, 'height')
  if (heightStr && !Number.isNaN(Number(heightStr))) result.height = Number(heightStr)

  const scaleStr = extractTagValue(xmpXml, 'displayScale')
  if (scaleStr && !Number.isNaN(Number(scaleStr))) result.displayScale = Number(scaleStr)

  const colorSpace = extractTagValue(xmpXml, 'colorSpace')
  if (colorSpace) result.colorSpace = colorSpace

  const platform = extractTagValue(xmpXml, 'platform')
  if (platform) result.platform = platform

  return result
}
