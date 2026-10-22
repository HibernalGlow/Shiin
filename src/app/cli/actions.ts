/**
 * 管道面与引导面共用的执行层：把"要做什么"落成对 ScreenshotManager 的调用。
 *
 * 这里不画任何字符——文案与排版交给调用方（clack / boxen / OpenTUI），
 * 这样同一个动作在管道、问答、全屏三条腿上不会出现三套错误处理。
 */

import {
  ScreenshotManager,
  getCaptureWindows,
  getScreenDisplays,
  getDefaultConfigDir,
  testDirectoryAccess,
  type CaptureWindowInfo,
  type GamepadDeviceInfo,
  type ScreenshotConfig,
  ScreenShotSaveWayEnum,
} from '../../core/index.js'
import { clipboardImageSupported, createClipboardWriter } from './clipboard.js'
import type { Translator } from './i18n.js'
import type { TerminalViewTable } from './interaction.js'
import type { ShiinActionResult, ShiinContext, ShiinPlan } from './plan.js'
import { planToPatch } from './plan.js'
import { notifyCaptureResult, notifyReplayResult, overlayBackendStatus } from './overlay.js'
import { probeTerminalRuntime } from './runtime.js'

async function safeWindows(): Promise<CaptureWindowInfo[]> {
  try {
    return await getCaptureWindows()
  } catch {
    return []
  }
}

export async function collectContext(manager: ScreenshotManager): Promise<ShiinContext> {
  const devices = manager.gamepad.getConnectedDevices()
  const screens = await getScreenDisplays()
  const windows = await safeWindows()
  return {
    config: manager.config,
    deviceCount: devices.length,
    screenCount: screens.length,
    windowCount: windows.length,
    windows,
    activeDeviceName: devices[0]?.name,
    obsConnected: manager.obs.isConnected,
    listening: manager.listening,
  }
}

export function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`
}

export interface ActionOptions {
  /** `false` 时连覆层通知也不弹，供脚本 / `--no-notify` 使用。 */
  notify?: boolean
}

/** 一次截图：计划只改内存里的配置，进程退出后不落盘。 */
export async function executeCapture(
  manager: ScreenshotManager,
  plan: ShiinPlan,
  t: Translator,
  onEvent: (event: { type: string; progress?: number; message: string }) => void = () => {},
  options: ActionOptions = {},
): Promise<ShiinActionResult> {
  const writesClipboard = plan.saveWay !== ScreenShotSaveWayEnum.FileOnly
  const clipboardReady = !writesClipboard || clipboardImageSupported()

  if (writesClipboard && !clipboardReady && plan.saveWay === ScreenShotSaveWayEnum.CilpboardOnly) {
    return {
      success: false,
      message: t('captureFailed'),
      lines: [t('clipboardUnsupported')],
    }
  }

  manager.syncConfig(planToPatch(plan))
  onEvent({ type: 'progress', progress: 15, message: t('running') })

  const result = await manager.capture({
    writeClipboard: writesClipboard && clipboardReady ? createClipboardWriter(plan.format) : undefined,
  })

  onEvent({ type: 'progress', progress: 100, message: t('done') })
  notifyCaptureResult(manager, result, t, options.notify !== false)

  if (!result.ok) {
    return { success: false, message: t('captureFailed'), lines: [result.error ?? t('error')] }
  }

  const lines: string[] = []
  lines.push(result.filePath || t('saveClipboard'))
  if (result.sizeBytes) lines.push(`${result.format.toUpperCase()} · ${formatBytes(result.sizeBytes)}`)
  if (writesClipboard && !clipboardReady) lines.push(t('clipboardUnavailable'))

  return { success: true, message: t('captureDone'), lines }
}

export async function executeReplay(
  manager: ScreenshotManager,
  t: Translator,
  options: ActionOptions = {},
): Promise<ShiinActionResult> {
  const result = await manager.saveOBSReplay()
  notifyReplayResult(manager, result, t, options.notify !== false)
  return result.ok
    ? { success: true, message: t('replayDone') }
    : { success: false, message: t('replayFailed'), lines: [result.error ?? t('error')] }
}

export async function executeListen(manager: ScreenshotManager, t: Translator): Promise<ShiinActionResult> {
  const result = await manager.startListening()
  return result.ok
    ? { success: true, message: t('listenStarted'), lines: [t('listenHint')] }
    : { success: false, message: t('listenStarted'), lines: [result.reason ?? t('error')] }
}

export interface DeviceInventory {
  devices: GamepadDeviceInfo[]
  screens: { id: string | number; name: string }[]
  windows: CaptureWindowInfo[]
}

export async function inspectDevices(manager: ScreenshotManager): Promise<DeviceInventory> {
  return {
    devices: manager.gamepad.getConnectedDevices(),
    screens: await getScreenDisplays(),
    windows: await safeWindows(),
  }
}

export function deviceTable(inventory: DeviceInventory, t: Translator): TerminalViewTable {
  const rows: Record<string, string>[] = []
  for (const device of inventory.devices) {
    rows.push({
      kind: 'gamepad',
      index: String(device._index),
      name: device.name,
      detail: `${device.buttonsCount ?? '?'} btn · ${device.axesCount ?? '?'} axes`,
    })
  }
  for (const screen of inventory.screens) {
    rows.push({ kind: 'display', index: String(screen.id), name: screen.name, detail: '' })
  }
  for (const window of inventory.windows.slice(0, 12)) {
    rows.push({
      kind: 'window',
      index: String(window.id),
      name: window.title,
      detail: window.ownerName ?? '',
    })
  }
  return {
    columns: [
      { id: 'kind', label: 'kind' },
      { id: 'index', label: 'id' },
      { id: 'name', label: 'name' },
      { id: 'detail', label: 'detail' },
    ],
    rows,
    emptyMessage: t('noDevices'),
  }
}

export interface DoctorRow {
  /** 稳定标识：`--json` 的键用它，不随语言变化。 */
  id: 'runtime' | 'ffi' | 'sdl' | 'obs' | 'overlay' | 'saveDir' | 'configDir'
  label: string
  value: string
  ok: boolean
}

export async function runDoctor(manager: ScreenshotManager, t: Translator, configDir = getDefaultConfigDir()): Promise<DoctorRow[]> {
  const runtime = await probeTerminalRuntime(true)
  const access = testDirectoryAccess(manager.config.path)
  let sdl = 'unavailable'
  try {
    const mod = await import('@kmamal/sdl')
    sdl = mod ? 'loaded' : 'unavailable'
  } catch {
    sdl = 'unavailable'
  }
  const obsConnected = manager.obs.isConnected
  const overlay = overlayBackendStatus()
  const overlayEnabled = manager.config.overlayNotify !== 'hide'
  return [
    { id: 'runtime', label: t('runtimeLine'), value: `${runtime.runtime} ${runtime.version}`, ok: true },
    {
      id: 'ffi',
      label: t('ffiLine'),
      value: runtime.ok ? `ok (${runtime.exports ?? 0} exports)` : runtime.detail,
      ok: runtime.ok,
    },
    { id: 'sdl', label: t('sdlLine'), value: sdl, ok: sdl === 'loaded' },
    {
      id: 'obs',
      label: t('obsLine'),
      value: obsConnected ? t('connected') : t('disconnected'),
      ok: obsConnected,
    },
    {
      id: 'overlay',
      label: t('overlayLine'),
      value: overlayEnabled ? `${overlay.backend} · ${overlay.detail}` : `${overlay.backend} · ${t('overlayDisabled')}`,
      ok: !overlayEnabled || overlay.backend !== 'none',
    },
    {
      id: 'saveDir',
      label: t('path'),
      value: access.ok ? manager.config.path || '(default)' : access.error ?? 'unwritable',
      ok: access.ok,
    },
    { id: 'configDir', label: t('configPath'), value: configDir, ok: true },
  ]
}

const EDITABLE_KEYS = [
  'path',
  'imageFormat',
  'imageQuality',
  'imageLossless',
  'imageEffort',
  'screenShotSaveWay',
  'captureTargetType',
  'windowCaptureMode',
  'windowSourceId',
  'screenshotWay',
  'fileNameTemplate',
  'obsIp',
  'obsPort',
  'obsPassword',
  'comboKeys',
] as const

export type EditableKey = (typeof EDITABLE_KEYS)[number]

export function isEditableKey(key: string): key is EditableKey {
  return (EDITABLE_KEYS as readonly string[]).includes(key)
}

/** `shiin config set` 的取值收敛：只收本仓认识的键，值按字段类型转换。 */
export function coerceConfigValue(key: EditableKey, raw: string): { value: unknown } | { error: string } {
  if (key === 'imageFormat') {
    if (!['jpg', 'png', 'webp', 'avif'].includes(raw)) {
      return { error: 'imageFormat must be jpg, png, webp, or avif' }
    }
    return { value: raw }
  }
  if (key === 'imageQuality') {
    const num = Number(raw)
    if (!Number.isInteger(num) || num < 1 || num > 100) {
      return { error: 'imageQuality must be an integer between 1 and 100' }
    }
    return { value: num }
  }
  if (key === 'imageLossless') {
    return { value: raw === 'true' || raw === '1' }
  }
  if (key === 'imageEffort') {
    const num = Number(raw)
    if (!Number.isInteger(num) || num < 0 || num > 9) {
      return { error: 'imageEffort must be an integer between 0 and 9' }
    }
    return { value: num }
  }
  if (key === 'screenShotSaveWay') {
    const allowed = Object.values(ScreenShotSaveWayEnum) as string[]
    return allowed.includes(raw) ? { value: raw } : { error: `screenShotSaveWay must be one of ${allowed.join(', ')}` }
  }
  if (key === 'captureTargetType') {
    return raw === 'screen' || raw === 'window' ? { value: raw } : { error: 'captureTargetType must be screen or window' }
  }
  if (key === 'windowCaptureMode') {
    return raw === 'specified' || raw === 'focused'
      ? { value: raw }
      : { error: 'windowCaptureMode must be specified or focused' }
  }
  if (key === 'obsPort') {
    const port = Number(raw)
    return Number.isFinite(port) && port > 0 ? { value: port } : { error: 'obsPort must be a positive number' }
  }
  if (key === 'comboKeys') {
    return {
      value: raw
        .split(/[,;]/)
        .map((part) => part.trim())
        .filter(Boolean),
    }
  }
  if (key === 'screenshotWay') {
    return raw === 'OBS' || raw === 'Default' ? { value: raw } : { error: 'screenshotWay must be OBS or Default' }
  }
  return { value: raw }
}

export async function writeConfig(manager: ScreenshotManager, key: EditableKey, raw: string): Promise<{ ok: boolean; error?: string }> {
  const coerced = coerceConfigValue(key, raw)
  if ('error' in coerced) return { ok: false, error: coerced.error }
  manager.syncConfig({ [key]: coerced.value } as Partial<ScreenshotConfig>)
  await manager.saveConfig()
  return { ok: true }
}

/**
 * 组合键的文本入口（`shiin combo --set "Button0,Button7"`）：
 * 只收核心层真能匹配的三种形状，别让一个拼错的键名静默变成"永远不触发"。
 */
export function parseComboKeys(raw: string): { ok: true; keys: string[] } | { ok: false; error: string } {
  const tokens = raw
    .split(/[,;\s]+/)
    .map((token) => token.trim())
    .filter(Boolean)
  if (tokens.length === 0) return { ok: false, error: 'combo is empty' }

  const keys: string[] = []
  for (const token of tokens) {
    const button = /^button(\d+)$/i.exec(token)
    const axis = /^axis(\d+)([+-])$/i.exec(token)
    if (button) {
      keys.push(`Button${Number(button[1])}`)
    } else if (axis) {
      keys.push(`Axis${Number(axis[1])}${axis[2]}`)
    } else {
      return { ok: false, error: `Invalid combo key: ${token} (expected ButtonN, AxisN+ or AxisN-)` }
    }
  }
  return { ok: true, keys: [...new Set(keys)] }
}

export async function saveComboKeys(manager: ScreenshotManager, comboKeys: string[]): Promise<void> {
  manager.syncConfig({ comboKeys })
  await manager.saveConfig()
}
