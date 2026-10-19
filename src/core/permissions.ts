import { testDirectoryAccess, getActiveWindowInfo, getCaptureWindows } from './screenshot.js'
import type { ScreenshotConfig } from './types.js'

export type MacPermissionPane = 'screen' | 'accessibility' | 'input' | 'files'
export type PermissionTargetType = 'screen' | 'accessibility' | 'input' | 'folder' | 'files' | 'all'
export type PermissionStatusLevel = 'granted' | 'denied' | 'not-determined' | 'restricted' | 'unknown'

export interface MissingPermissionInfo {
  id: 'screen' | 'accessibility' | 'input' | 'folder'
  title: string
  titleZh: string
  description: string
  descriptionZh: string
  critical: boolean
  settingsPane: MacPermissionPane
}

export interface MacOSPermissionsStatus {
  isMac: boolean
  platform: string
  screenCapture: boolean
  screenCaptureStatus?: PermissionStatusLevel
  accessibility: boolean
  accessibilityStatus?: PermissionStatusLevel
  inputMonitoring?: boolean
  folderAccess?: boolean
  resolvedSavePath?: string
  folderError?: string
  windowRecognition?: boolean
  detectedWindowsCount?: number
  activeWindowTitle?: string
  windowError?: string
  gamepadAccess?: boolean
  detectedGamepadsCount?: number
  allGranted?: boolean
  hasCriticalMissing?: boolean
  missingPermissions?: MissingPermissionInfo[]
  checkedAt?: number
}

export interface ScreenshotPermissionTestResult {
  ok: boolean
  granted: boolean
  filePath?: string | null
  previewDataUrl?: string
  width?: number
  height?: number
  sizeBytes?: number
  latencyMs?: number
  isBlackFrame?: boolean
  error?: string
  permissions?: MacOSPermissionsStatus
}

/**
 * 汇总计算当前缺失的权限列表并判断是否有阻断性缺失
 */
export function evaluateMissingPermissions(status: {
  isMac: boolean
  screenCapture: boolean
  accessibility: boolean
  folderAccess?: boolean
}): {
  missing: MissingPermissionInfo[]
  hasCriticalMissing: boolean
  allGranted: boolean
} {
  const missing: MissingPermissionInfo[] = []

  if (status.isMac && !status.screenCapture) {
    missing.push({
      id: 'screen',
      title: 'Screen Recording Permission',
      titleZh: '屏幕录制权限',
      description: 'Required to capture desktop screens and game windows. Screenshots will be black or fail without this.',
      descriptionZh: '截取屏幕与游戏窗口画面的核心系统权限。未授权时截图将全黑或报错。',
      critical: true,
      settingsPane: 'screen',
    })
  }

  if (status.folderAccess === false) {
    missing.push({
      id: 'folder',
      title: 'Storage Folder Access',
      titleZh: '截图保存目录写入权限',
      description: 'Save directory is read-only or not writable. Cannot save screenshot image files.',
      descriptionZh: '截图存储目录不可写或无权限创建文件，将无法保存截图图片。',
      critical: true,
      settingsPane: 'files',
    })
  }

  if (status.isMac && !status.accessibility) {
    missing.push({
      id: 'accessibility',
      title: 'Accessibility / Global Hotkeys',
      titleZh: '辅助功能 / 全局键盘监听',
      description: 'Required for global keyboard triggers (gamepad combo listener works without this).',
      descriptionZh: '全局键盘快捷键截图所必需的权限（手柄组合键监听走 SDL 直连，无需此权限）。',
      critical: false,
      settingsPane: 'accessibility',
    })
  }

  const hasCriticalMissing = missing.some((m) => m.critical)
  const allGranted = missing.length === 0

  return { missing, hasCriticalMissing, allGranted }
}
