/**
 * Shiin Capture Metadata Profile (SCMP v1.0) Specification Types
 *
 * Implements ISO 16684-1 (XMP) + IPTC Photo Metadata compatibility with custom
 * open capture context extensions for screenshot digital asset management.
 */

export interface SCMPMetadata {
  // Dublin Core (dc:*) & XMP Core (xmp:*) standard properties
  title?: string
  description?: string
  tags?: string[]
  createDate: string
  rating?: number

  // Shiin Capture Extension (shiin:*)
  schemaVersion: '1.0.0'
  captureTarget: 'screen' | 'window' | 'region'
  captureEngine?: 'desktopCapturer' | 'node-screenshots' | 'obs' | 'screencapture' | 'generic'
  triggerWay?: 'gamepad' | 'keyboard' | 'tray' | 'ui' | 'cli' | 'obs' | 'api'
  triggerDevice?: string
  triggerCombo?: string
  appName?: string
  appId?: string
  windowTitle?: string
  resolution?: string
  width?: number
  height?: number
  displayScale?: number
  colorSpace?: string
  platform?: string
}

export interface SCMPPrivacySettings {
  enabled: boolean
  recordAppName: boolean
  recordAppId: boolean
  recordWindowTitle: boolean
  recordTriggerDevice: boolean
  recordTechnicalContext: boolean
}

export const DEFAULT_SCMP_PRIVACY_SETTINGS: SCMPPrivacySettings = {
  enabled: true,
  recordAppName: true,
  recordAppId: true,
  recordWindowTitle: false, // Default false for user privacy protection
  recordTriggerDevice: true,
  recordTechnicalContext: true,
}

export type MetadataStorageMode = 'embedIfSupported' | 'sidecarOnly' | 'both' | 'databaseOnly'
export type SidecarNamingStyle = 'basename.ext.xmp' | 'basename.xmp'

export interface MetadataInjectionOptions {
  storageMode?: MetadataStorageMode
  sidecarNaming?: SidecarNamingStyle
  privacy?: Partial<SCMPPrivacySettings>
}

export interface MetadataInjectionResult {
  ok: boolean
  method: 'embedded' | 'sidecar' | 'both' | 'skipped'
  embedded: boolean
  sidecarPath?: string
  error?: string
}
