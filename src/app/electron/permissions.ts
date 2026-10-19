import { systemPreferences, shell } from 'electron'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import {
  testDirectoryAccess,
  getActiveWindowInfo,
  getCaptureWindows,
  captureMacScreenNative,
  evaluateMissingPermissions,
  type MacPermissionPane,
  type PermissionTargetType,
  type MacOSPermissionsStatus,
  type ScreenshotPermissionTestResult,
  type ScreenshotConfig,
  type ScreenshotManager,
} from '../../core/index.js'

const execFileAsync = promisify(execFile)

/**
 * 获取当前系统的完整权限状态（支持深度探测）
 */
export async function getMacOSPermissionsStatus(options?: {
  activeProbe?: boolean
  configuredPath?: string
}): Promise<MacOSPermissionsStatus> {
  const isMac = process.platform === 'darwin'
  const now = Date.now()

  if (!isMac) {
    return {
      isMac: false,
      platform: process.platform,
      screenCapture: true,
      screenCaptureStatus: 'granted',
      accessibility: true,
      accessibilityStatus: 'granted',
      inputMonitoring: true,
      folderAccess: true,
      resolvedSavePath: options?.configuredPath || './screenshots',
      windowRecognition: true,
      detectedWindowsCount: 0,
      gamepadAccess: true,
      detectedGamepadsCount: 0,
      allGranted: true,
      hasCriticalMissing: false,
      missingPermissions: [],
      checkedAt: now,
    }
  }

  // 1. 屏幕录制权限 (Screen Recording)
  let screenCaptureStatus: 'granted' | 'denied' | 'not-determined' | 'restricted' | 'unknown' = 'unknown'
  if (typeof systemPreferences.getMediaAccessStatus === 'function') {
    try {
      screenCaptureStatus = systemPreferences.getMediaAccessStatus('screen') as any
    } catch (e) {
      console.warn('[Permissions] getMediaAccessStatus(screen) error:', e)
    }
  }

  let screenCapture = screenCaptureStatus === 'granted'

  // 如果状态未决或者显式请求主动探测，尝试轻量截屏探测
  if (options?.activeProbe && screenCaptureStatus !== 'granted') {
    try {
      const probeBuf = await captureMacScreenNative({ format: 'png' })
      if (probeBuf && probeBuf.length > 0) {
        screenCapture = true
        screenCaptureStatus = 'granted'
      }
    } catch {
      screenCapture = false
      if (screenCaptureStatus !== 'denied') {
        screenCaptureStatus = 'denied'
      }
    }
  }

  // 2. 辅助功能 / 全局键盘监听权限 (Accessibility)
  let accessibility = true
  if (typeof systemPreferences.isTrustedAccessibilityClient === 'function') {
    try {
      accessibility = systemPreferences.isTrustedAccessibilityClient(false)
    } catch {
      accessibility = true
    }
  }
  const accessibilityStatus = accessibility ? 'granted' : 'denied'

  // 3. 存储目录写入权限
  const dirTest = testDirectoryAccess(options?.configuredPath)
  const folderAccess = dirTest.ok
  const resolvedSavePath = dirTest.resolvedPath
  const folderError = dirTest.error

  // 4. 活动窗口识别与窗口枚举
  let windowRecognition = true
  let detectedWindowsCount = 0
  let activeWindowTitle: string | undefined
  let windowError: string | undefined

  try {
    const active = await getActiveWindowInfo()
    activeWindowTitle = active?.title
    const wins = await getCaptureWindows()
    detectedWindowsCount = wins.length
  } catch (err: any) {
    windowRecognition = false
    windowError = err?.message || String(err)
  }

  // 5. 权限缺失综合评估
  const { missing, hasCriticalMissing, allGranted } = evaluateMissingPermissions({
    isMac: true,
    screenCapture,
    accessibility,
    folderAccess,
  })

  return {
    isMac: true,
    platform: 'darwin',
    screenCapture,
    screenCaptureStatus,
    accessibility,
    accessibilityStatus,
    inputMonitoring: accessibility,
    folderAccess,
    resolvedSavePath,
    folderError,
    windowRecognition,
    detectedWindowsCount,
    activeWindowTitle,
    windowError,
    gamepadAccess: true,
    allGranted,
    hasCriticalMissing,
    missingPermissions: missing,
    checkedAt: now,
  }
}

/**
 * 主动打开 macOS 对应的系统设置 / 安全与隐私权限界面
 */
export async function openMacPermissionPane(pane: MacPermissionPane): Promise<boolean> {
  if (process.platform !== 'darwin') return false

  const paneMap: Record<MacPermissionPane, string> = {
    screen: 'Privacy_ScreenCapture',
    accessibility: 'Privacy_Accessibility',
    input: 'Privacy_ListenEvent',
    files: 'Privacy_AllFiles',
  }

  const anchor = paneMap[pane] || 'Privacy_ScreenCapture'
  const url = `x-apple.systempreferences:com.apple.preference.security?${anchor}`

  try {
    await shell.openExternal(url)
    return true
  } catch (err) {
    console.warn(`[Permissions] shell.openExternal(${url}) failed, fallback to /usr/bin/open:`, err)
    try {
      await execFileAsync('/usr/bin/open', [url])
      return true
    } catch {
      // 兼容老版本 macOS 打开系统偏好设置
      try {
        await execFileAsync('/usr/bin/open', ['/System/Applications/System Settings.app'])
        return true
      } catch {
        return false
      }
    }
  }
}

/**
 * 请求特定权限或引导打开对应系统设置
 */
export async function requestMacPermission(
  target: PermissionTargetType = 'all',
  options?: { openSettingsIfDenied?: boolean; configuredPath?: string }
): Promise<MacOSPermissionsStatus> {
  const isMac = process.platform === 'darwin'
  if (!isMac) {
    return await getMacOSPermissionsStatus(options)
  }

  const openIfDenied = options?.openSettingsIfDenied ?? true

  if (target === 'screen') {
    // 检查当前状态
    const cur = await getMacOSPermissionsStatus({ activeProbe: true, configuredPath: options?.configuredPath })
    if (!cur.screenCapture && openIfDenied) {
      await openMacPermissionPane('screen')
    }
  } else if (target === 'accessibility') {
    // 调用 isTrustedAccessibilityClient(true) 会由系统主动弹出授权询问弹窗
    if (typeof systemPreferences.isTrustedAccessibilityClient === 'function') {
      const trusted = systemPreferences.isTrustedAccessibilityClient(true)
      if (!trusted && openIfDenied) {
        await openMacPermissionPane('accessibility')
      }
    }
  } else if (target === 'input') {
    await openMacPermissionPane('input')
  } else if (target === 'folder' || target === 'files') {
    const dirTest = testDirectoryAccess(options?.configuredPath)
    if (!dirTest.ok && openIfDenied) {
      await openMacPermissionPane('files')
    }
  } else if (target === 'all') {
    const cur = await getMacOSPermissionsStatus({ activeProbe: true, configuredPath: options?.configuredPath })
    if (!cur.screenCapture) {
      await openMacPermissionPane('screen')
    } else if (!cur.accessibility && typeof systemPreferences.isTrustedAccessibilityClient === 'function') {
      systemPreferences.isTrustedAccessibilityClient(true)
    }
  }

  return await getMacOSPermissionsStatus({ activeProbe: true, configuredPath: options?.configuredPath })
}

/**
 * 实时快速测试截屏权限
 */
export async function testScreenshotPermissionProbe(
  manager: ScreenshotManager,
  overrideConfig?: ScreenshotConfig
): Promise<ScreenshotPermissionTestResult> {
  const start = Date.now()
  const activeCfg = overrideConfig || manager.config

  try {
    const result = await manager.capture()
    const latencyMs = Date.now() - start
    const perms = await getMacOSPermissionsStatus({ activeProbe: true, configuredPath: activeCfg.path })

    if (result.ok) {
      return {
        ok: true,
        granted: true,
        filePath: result.filePath,
        sizeBytes: result.sizeBytes,
        latencyMs,
        permissions: perms,
      }
    }

    return {
      ok: false,
      granted: perms.screenCapture,
      error: result.error || 'Capture failed',
      latencyMs,
      permissions: perms,
    }
  } catch (err: any) {
    const perms = await getMacOSPermissionsStatus({ activeProbe: true, configuredPath: activeCfg.path })
    return {
      ok: false,
      granted: false,
      error: err?.message || String(err),
      latencyMs: Date.now() - start,
      permissions: perms,
    }
  }
}
