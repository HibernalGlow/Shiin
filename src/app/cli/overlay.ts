/**
 * 终端面的覆层通知：把桌面端同一个通知窗口交给一个短命的 Electron 辅助进程去画。
 *
 * 为什么不是终端内画 toast：桌面端的覆层是"跨工作区、压在全屏应用之上、不抢焦点"的
 * 系统窗口（`screen-saver` 层级），终端角色里没有对应能力。CLI/TUI 复用同一份
 * `screenshot-notification.html` 与窗口参数，才能做到和桌面端逐像素一致。
 *
 * Electron 在本包里是 optionalDependency：装了就直接用；没装时退到系统通知，
 * 并把原因写进 `doctor` / `notify --json`，不静默吞掉。
 */

import { spawn, type ChildProcess } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

import type { OverlayNotifyPosition, ScreenshotResult } from '../../core/types.js'
import type { Translator } from './i18n.js'

export type OverlayBackend = 'electron' | 'system' | 'none'

export interface OverlayRequest {
  img?: string
  title?: string
  desc?: string
  type?: 'video' | 'text'
  /** 毫秒，覆盖默认 4500ms。 */
  duration?: number
  position?: OverlayNotifyPosition
  /** 整体缩放，桌面端同款 0.6–2。 */
  scale?: number
}

export interface OverlayShowResult {
  shown: boolean
  backend: OverlayBackend
  reason?: string
}

export interface OverlayConfig {
  overlayNotify?: 'show' | 'hide'
  overlayNotifyPosition?: OverlayNotifyPosition
  overlayNotifySize?: number | string
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_DURATION = 4500

/** `SHIIN_OVERLAY_DEBUG=1` 时把启动路径写进临时文件；TUI 会接管终端输出，日志只能落盘。 */
function debug(message: string): void {
  if (!process.env.SHIIN_OVERLAY_DEBUG) return
  try {
    fs.appendFileSync(path.join(os.tmpdir(), 'shiin-overlay.log'), `${new Date().toISOString()} ${message}\n`)
  } catch {}
}

export function overlayDisabledByEnv(env: NodeJS.ProcessEnv = process.env): boolean {
  const value = (env.SHIIN_OVERLAY ?? '').trim().toLowerCase()
  return value === '0' || value === 'off' || value === 'false' || value === 'never'
}

/** 构建后 `overlay.mjs` 与 `cli.mjs` 同在 lib/；源码态只有 TS，不允许被 Electron 直接拉起。 */
export function resolveOverlayScriptPath(): string | null {
  const candidates = [
    path.join(__dirname, 'overlay.mjs'),
    path.join(__dirname, '..', '..', 'lib', 'overlay.mjs'),
  ]
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null
}

/**
 * Electron 的 npm 包导出的是可执行文件路径（不是 API 对象）。
 * `SHIIN_ELECTRON` 允许使用者显式指定——有些机器用桌面端自带运行时而不是开发依赖。
 */
export function resolveElectronBinary(env: NodeJS.ProcessEnv = process.env): string | null {
  const explicit = env.SHIIN_ELECTRON?.trim()
  if (explicit) return fs.existsSync(explicit) ? explicit : null

  try {
    const require = createRequire(import.meta.url)
    const resolved = require('electron')
    return typeof resolved === 'string' && resolved.length > 0 ? resolved : null
  } catch {
    return null
  }
}

export function buildOverlayPayload(
  request: OverlayRequest,
  config: OverlayConfig = {},
): Record<string, unknown> {
  return {
    img: request.img ?? '',
    title: request.title ?? '',
    desc: request.desc ?? '',
    type: request.type,
    duration: request.duration ?? DEFAULT_DURATION,
    position: request.position ?? (config.overlayNotifyPosition ?? 'right'),
    scale: request.scale ?? config.overlayNotifySize ?? 1,
  }
}

function spawnDetached(command: string, args: string[], env: NodeJS.ProcessEnv): ChildProcess {
  let stdio: 'ignore' | ['ignore', number, number] = 'ignore'
  if (process.env.SHIIN_OVERLAY_DEBUG) {
    try {
      const fd = fs.openSync(path.join(os.tmpdir(), 'shiin-overlay-child.log'), 'a')
      stdio = ['ignore', fd, fd]
    } catch {}
  }
  const child = spawn(command, args, {
    detached: true,
    stdio,
    windowsHide: true,
    env,
  })
  child.on('error', (error) => debug(`spawn error: ${error.message}`))
  child.on('exit', (code, signal) => debug(`child exit code=${code} signal=${signal}`))
  child.unref()
  return child
}

export function showSystemNotification(request: OverlayRequest): OverlayShowResult {
  const title = request.title || 'Shiin'
  const desc = request.desc || ''

  try {
    if (process.platform === 'darwin') {
      const script = `display notification ${JSON.stringify(desc)} with title ${JSON.stringify(title)}`
      spawnDetached('/usr/bin/osascript', ['-e', script], process.env)
      return { shown: true, backend: 'system' }
    }
    if (process.platform === 'win32') {
      const escapedTitle = title.replace(/'/g, "''")
      const escapedDesc = desc.replace(/'/g, "''")
      const script = [
        '[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null;',
        '$xml = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02);',
        `$xml.GetElementsByTagName('text')[0].AppendChild($xml.CreateTextNode('${escapedTitle}')) > $null;`,
        `$xml.GetElementsByTagName('text')[1].AppendChild($xml.CreateTextNode('${escapedDesc}')) > $null;`,
        '$toast = [Windows.UI.Notifications.ToastNotification]::new($xml);',
        '[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Shiin").Show($toast);',
      ].join(' ')
      spawnDetached('powershell', ['-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-Command', script], process.env)
      return { shown: true, backend: 'system' }
    }
    if (process.platform === 'linux') {
      const args: string[] = []
      if (request.img) args.push('--icon', path.resolve(request.img))
      args.push(title, desc)
      spawnDetached('notify-send', args, process.env)
      return { shown: true, backend: 'system' }
    }
  } catch {
    // fall through
  }
  return { shown: false, backend: 'none', reason: 'no overlay backend on this platform' }
}

export function showOverlayNotification(
  request: OverlayRequest,
  config: OverlayConfig = {},
): OverlayShowResult {
  if (config.overlayNotify === 'hide' || overlayDisabledByEnv()) {
    debug('suppressed by config or SHIIN_OVERLAY')
    return { shown: false, backend: 'none', reason: 'disabled' }
  }

  const electronBinary = resolveElectronBinary()
  const overlayScript = resolveOverlayScriptPath()
  debug(`request title=${request.title ?? ''} img=${request.img ? 'yes' : 'no'} electron=${electronBinary ?? 'null'} script=${overlayScript ?? 'null'}`)

  if (electronBinary && overlayScript) {
    const payload = buildOverlayPayload(request, config)
    const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64')
    const env: NodeJS.ProcessEnv = { ...process.env, SHIIN_OVERLAY_PAYLOAD: encoded }
    delete env.ELECTRON_RUN_AS_NODE
    try {
      const child = spawnDetached(electronBinary, [overlayScript], env)
      debug(`spawned pid=${child.pid ?? 'unknown'}`)
      return { shown: true, backend: 'electron' }
    } catch (error) {
      debug(`spawn threw: ${(error as Error).message}`)
      return showSystemNotification({ ...request, desc: request.desc || (error as Error).message })
    }
  }

  debug('electron unavailable, falling back to system notification')
  return showSystemNotification(request)
}

export function overlayBackendStatus(): { backend: OverlayBackend; detail: string } {
  const electronBinary = resolveElectronBinary()
  const overlayScript = resolveOverlayScriptPath()
  if (electronBinary && overlayScript) {
    return { backend: 'electron', detail: overlayScript }
  }
  if (process.platform === 'darwin' || process.platform === 'win32' || process.platform === 'linux') {
    return { backend: 'system', detail: process.platform }
  }
  return { backend: 'none', detail: 'unsupported platform' }
}

export function captureOverlayRequest(result: ScreenshotResult, t: Translator): OverlayRequest {
  if (result.ok) {
    const img = result.filePath || ''
    return {
      img,
      title: t('overlayScreenshotSuccess'),
      desc: img ? path.basename(img) : t('overlayScreenshotSaved'),
      type: img ? undefined : 'text',
    }
  }
  return {
    title: t('overlayCaptureFailed'),
    desc: result.error || t('overlayCaptureFailedDesc'),
    type: 'text',
  }
}

export function replayOverlayRequest(result: { ok?: boolean; error?: string }, t: Translator): OverlayRequest {
  return result.ok
    ? { title: t('overlayReplaySuccess'), desc: t('overlayReplayDesc'), type: 'video' }
    : { title: t('replayFailed'), desc: result.error || t('error'), type: 'text' }
}

export function notifyCaptureResult(
  manager: { config: OverlayConfig },
  result: ScreenshotResult,
  t: Translator,
  enabled = true,
): void {
  if (!enabled) return
  showOverlayNotification(captureOverlayRequest(result, t), manager.config)
}

export function notifyReplayResult(
  manager: { config: OverlayConfig },
  result: { ok?: boolean; error?: string },
  t: Translator,
  enabled = true,
): void {
  if (!enabled) return
  showOverlayNotification(replayOverlayRequest(result, t), manager.config)
}
