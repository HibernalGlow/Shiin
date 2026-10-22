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
import { forwardOverlayRequest } from '../electron/overlay-transport.js'

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
  theme?: 'light' | 'dark' | 'auto'
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
  overlayNotifyDuration?: number
  theme?: 'light' | 'dark' | 'auto'
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
    path.join(__dirname, '..', '..', '..', 'lib', 'overlay.mjs'),
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

  const require = createRequire(import.meta.url)
  try {
    const resolved = require('electron')
    if (typeof resolved === 'string' && resolved.length > 0 && fs.existsSync(resolved)) {
      return resolved
    }
  } catch {}

  const platformSubpath =
    process.platform === 'darwin'
      ? 'dist/Electron.app/Contents/MacOS/Electron'
      : process.platform === 'win32'
        ? 'dist/electron.exe'
        : 'dist/electron'

  const fallbackCandidates: string[] = []
  try {
    fallbackCandidates.push(path.join(path.dirname(require.resolve('electron/package.json')), platformSubpath))
  } catch {}
  fallbackCandidates.push(
    path.join(process.cwd(), 'node_modules', 'electron', platformSubpath),
    path.join(__dirname, '..', '..', 'node_modules', 'electron', platformSubpath),
    path.join(process.cwd(), 'node_modules', '.bin', process.platform === 'win32' ? 'electron.cmd' : 'electron'),
  )
  return fallbackCandidates.find((candidate) => fs.existsSync(candidate)) ?? null
}

export function electronRuntimeProblem(binary: string): string | null {
  try {
    fs.accessSync(binary, process.platform === 'win32' ? fs.constants.F_OK : fs.constants.X_OK)
  } catch {
    return `Electron executable is unavailable: ${binary}`
  }
  if (process.platform === 'darwin' && binary.includes('.app/Contents/MacOS/')) {
    const framework = path.resolve(path.dirname(binary), '../Frameworks/Electron Framework.framework/Electron Framework')
    if (!fs.existsSync(framework)) return `Incomplete Electron runtime: missing ${framework}`
  }
  return null
}

/** 每次请求有独立回执；单实例转发后仍由真正显示窗口的宿主确认。 */
export async function launchElectronOverlay(
  binary: string,
  script: string,
  payload: Record<string, unknown>,
  timeoutMs = 15_000,
): Promise<OverlayShowResult> {
  const receiptDir = fs.mkdtempSync(path.join(os.tmpdir(), 'shiin-overlay-'))
  const receiptPath = path.join(receiptDir, 'shown.json')
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    SHIIN_OVERLAY_PAYLOAD: Buffer.from(JSON.stringify(payload), 'utf8').toString('base64'),
    SHIIN_OVERLAY_RECEIPT: receiptPath,
  }
  delete env.ELECTRON_RUN_AS_NODE

  return new Promise((resolve) => {
    let child: ChildProcess | undefined
    let stderr = ''
    let settled = false
    let watcher: fs.FSWatcher | undefined
    let timer: NodeJS.Timeout | undefined
    const finish = (result: OverlayShowResult) => {
      if (settled) return
      settled = true
      if (timer) clearTimeout(timer)
      watcher?.close()
      child?.stdout?.destroy()
      child?.stderr?.destroy()
      fs.rmSync(receiptDir, { recursive: true, force: true })
      debug(`result ${JSON.stringify(result)}`)
      resolve(result)
    }
    const fail = (reason: string) => finish({ shown: false, backend: 'electron', reason })
    const readReceipt = () => {
      if (settled || !fs.existsSync(receiptPath)) return
      try {
        const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8')) as OverlayShowResult
        if (typeof receipt.shown !== 'boolean') return
        finish({ shown: receipt.shown, backend: 'electron', ...(receipt.reason ? { reason: receipt.reason } : {}) })
      } catch {}
    }
    try {
      watcher = fs.watch(receiptDir, readReceipt)
      watcher.on('error', (error) => fail(`Overlay receipt failed: ${error.message}`))
      timer = setTimeout(() => fail(`Electron did not confirm a visible overlay within ${timeoutMs}ms${stderr ? `: ${stderr.trim()}` : ''}`), timeoutMs)
      const request = { ...payload, receiptPath }
      const dispatch = async () => {
        if (await forwardOverlayRequest(request)) {
          debug(`forwarded to resident host receipt=${receiptPath}`)
          return
        }
        if (settled) return
        const forwarded = Buffer.from(JSON.stringify(request), 'utf8').toString('base64')
        child = spawn(binary, [script, `--shiin-overlay-request=${forwarded}`], {
          detached: true,
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true,
          env,
        })
        child.stdout?.on('data', (chunk: Buffer) => debug(`host ${chunk.toString().trim()}`))
        child.stderr?.on('data', (chunk: Buffer) => {
          stderr = (stderr + chunk.toString()).slice(-4000)
          debug(`host stderr ${chunk.toString().trim()}`)
        })
        child.once('error', (error) => fail(`Electron launch failed: ${error.message}`))
        child.once('close', (code, signal) => {
          readReceipt()
          // 正常退出也可能是第二实例把请求转发给常驻宿主，继续等待该请求的回执。
          if (code !== 0 || signal) fail(`Electron exited before showing the overlay (${signal || code})${stderr ? `: ${stderr.trim()}` : ''}`)
        })
        child.unref()
        debug(`spawned pid=${child.pid ?? 'unknown'} receipt=${receiptPath}`)
      }
      void dispatch().catch((error) => fail(`Electron launch failed: ${String(error)}`))
    } catch (error) {
      fail(`Electron launch failed: ${(error as Error).message}`)
    }
  })
}

/** 服务启动时静默准备 Electron，避免第一张截图再等待整个运行时启动。 */
export async function warmOverlayHost(config: OverlayConfig = {}): Promise<void> {
  if (config.overlayNotify === 'hide' || overlayDisabledByEnv()) return
  if (await forwardOverlayRequest({ warmup: true })) return
  const binary = resolveElectronBinary()
  const script = resolveOverlayScriptPath()
  if (!binary || !script || electronRuntimeProblem(binary)) return
  const env: NodeJS.ProcessEnv = { ...process.env, SHIIN_OVERLAY_PREWARM: '1' }
  delete env.ELECTRON_RUN_AS_NODE
  // 不继承上一条通知的 payload，预热过程不显示任何窗口。
  delete env.SHIIN_OVERLAY_PAYLOAD
  delete env.SHIIN_OVERLAY_RECEIPT
  spawnDetached(binary, [script, '--shiin-overlay-warmup'], env)
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
    duration: request.duration ?? (config.overlayNotifyDuration ? config.overlayNotifyDuration * 1000 : DEFAULT_DURATION),
    position: request.position ?? (config.overlayNotifyPosition ?? 'right'),
    scale: request.scale ?? config.overlayNotifySize ?? 1,
    theme: request.theme ?? config.theme,
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

export async function showOverlayNotification(
  request: OverlayRequest,
  config: OverlayConfig = {},
): Promise<OverlayShowResult> {
  if (config.overlayNotify === 'hide' || overlayDisabledByEnv()) {
    debug('suppressed by config or SHIIN_OVERLAY')
    return { shown: false, backend: 'none', reason: 'disabled' }
  }

  const electronBinary = resolveElectronBinary()
  const overlayScript = resolveOverlayScriptPath()
  debug(`request title=${request.title ?? ''} img=${request.img ? 'yes' : 'no'} electron=${electronBinary ?? 'null'} script=${overlayScript ?? 'null'}`)

  if (electronBinary && overlayScript) {
    const problem = electronRuntimeProblem(electronBinary)
    if (problem) return { shown: false, backend: 'electron', reason: problem }
    try {
      return await launchElectronOverlay(electronBinary, overlayScript, buildOverlayPayload(request, config))
    } catch (error) {
      return { shown: false, backend: 'electron', reason: (error as Error).message }
    }
  }

  debug('electron unavailable, falling back to system notification')
  return showSystemNotification(request)
}

export function overlayBackendStatus(): { backend: OverlayBackend; detail: string } {
  const electronBinary = resolveElectronBinary()
  const overlayScript = resolveOverlayScriptPath()
  if (electronBinary && overlayScript) {
    const problem = electronRuntimeProblem(electronBinary)
    return { backend: problem ? 'none' : 'electron', detail: problem ?? overlayScript }
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

export async function notifyCaptureResult(
  manager: { config: OverlayConfig },
  result: ScreenshotResult,
  t: Translator,
  enabled = true,
): Promise<void> {
  if (!enabled) return
  await showOverlayNotification(captureOverlayRequest(result, t), manager.config)
}

export async function notifyReplayResult(
  manager: { config: OverlayConfig },
  result: { ok?: boolean; error?: string },
  t: Translator,
  enabled = true,
): Promise<void> {
  if (!enabled) return
  await showOverlayNotification(replayOverlayRequest(result, t), manager.config)
}
