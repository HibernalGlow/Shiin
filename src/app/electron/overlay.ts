/**
 * CLI/TUI 的覆层通知宿主：一个只负责弹通知的 Electron 进程。
 *
 * 由 `src/app/cli/overlay.ts` 以 detached 方式拉起，payload 走环境变量；
 * 已有实例在跑时由 Electron 的单实例锁把新 payload 送到第一个进程，
 * 从而像桌面端一样"后一条替换前一条"，不会叠出一排通知。
 */

import { app, type BrowserWindow } from 'electron'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { parseOverlayPayload } from './overlay-payload.js'
import { showScreenshotNotification, type ScreenshotNotificationOptions } from './overlay-window.js'
import { listenForOverlayRequests } from './overlay-transport.js'

const DEFAULT_IDLE_KEEPALIVE_MS = 10 * 60_000
const configuredIdle = Number(process.env.SHIIN_OVERLAY_IDLE_MS)
const IDLE_KEEPALIVE_MS =
  Number.isFinite(configuredIdle) && configuredIdle >= 0 ? configuredIdle : DEFAULT_IDLE_KEEPALIVE_MS
const bootAt = Date.now()

/** 调试日志独立落盘，CLI 收到回执退出后常驻宿主仍能继续记录。 */
function debug(message: string): void {
  if (!process.env.SHIIN_OVERLAY_DEBUG) return
  try {
    fs.appendFileSync(path.join(os.tmpdir(), 'shiin-overlay-child.log'), `[overlay ${new Date().toISOString()} +${Date.now() - bootAt}ms] ${message}\n`)
  } catch {}
}

function report(receiptPath: string | undefined, shown: boolean, reason?: string): void {
  if (!receiptPath) return
  try {
    const temporary = `${receiptPath}.tmp`
    fs.writeFileSync(temporary, JSON.stringify({ shown, backend: 'electron', ...(reason ? { reason } : {}) }))
    fs.renameSync(temporary, receiptPath)
  } catch (error) {
    debug(`receipt failed: ${String(error)}`)
  }
}

function readInitialPayload(): ScreenshotNotificationOptions {
  const encoded = process.env.SHIIN_OVERLAY_PAYLOAD
  if (!encoded) return {}
  try {
    return parseOverlayPayload(JSON.parse(Buffer.from(encoded, 'base64').toString('utf8')))
  } catch {
    return {}
  }
}

const initialPayload = readInitialPayload()
const initialReceipt = process.env.SHIIN_OVERLAY_RECEIPT
const initialWarmup = process.env.SHIIN_OVERLAY_PREWARM === '1'
app.setName('Shiin Overlay')
app.setPath('userData', path.join(app.getPath('appData'), 'Shiin Overlay'))
try {
  app.setActivationPolicy?.('accessory')
} catch {}
try {
  app.dock?.hide()
} catch {}

// 第二个实例只负责把 payload 送进已有实例，自己立刻退出。
// Electron 原生单实例通道只传 JSON 值；去掉解析器补入的 undefined 可选字段。
const lockPayload = JSON.parse(JSON.stringify({ ...initialPayload, receiptPath: initialReceipt, warmup: initialWarmup }))
const gotTheLock = app.requestSingleInstanceLock(lockPayload)
if (!gotTheLock) {
  app.quit()
  process.exit(0)
}

let idleTimer: NodeJS.Timeout | null = null
let snapshotTimer: NodeJS.Timeout | null = null
let activeOverlay: BrowserWindow | null = null

function receiveRequest(data: Record<string, unknown>): void {
  void app.whenReady().then(() => {
    if (data.warmup === true) {
      if (!activeOverlay || activeOverlay.isDestroyed()) scheduleIdleQuit()
      return
    }
    const receiptPath = typeof data.receiptPath === 'string' ? data.receiptPath : undefined
    present(parseOverlayPayload(data), receiptPath)
  })
}

const transport = listenForOverlayRequests(receiveRequest)
app.once('before-quit', () => transport.close())

/**
 * 第一次弹出之后保留进程：下一次通知不用再付 Electron 冷启动。
 * 窗口本身仍按 duration 关闭；进程在最后一次通知后空闲 IDLE_KEEPALIVE_MS 再退出。
 */
function scheduleIdleQuit(): void {
  if (idleTimer) clearTimeout(idleTimer)
  if (IDLE_KEEPALIVE_MS <= 0) {
    debug('idle keepalive disabled, quitting')
    app.quit()
    return
  }
  debug(`idle keepalive ${Math.round(IDLE_KEEPALIVE_MS / 1000)}s`)
  idleTimer = setTimeout(() => {
    debug('idle keepalive expired')
    app.quit()
  }, IDLE_KEEPALIVE_MS)
}

function clearIdleQuit(): void {
  if (!idleTimer) return
  clearTimeout(idleTimer)
  idleTimer = null
}

/** `SHIIN_OVERLAY_SNAPSHOT` 是自动化验收钩子：让窗口自己 capturePage 后退出。 */
function takeSnapshot(window: BrowserWindow, outputPath: string): void {
  snapshotTimer = setTimeout(async () => {
    try {
      const image = await window.webContents.capturePage()
      fs.mkdirSync(path.dirname(outputPath), { recursive: true })
      fs.writeFileSync(outputPath, image.toPNG())
      console.log(`[overlay] snapshot ${outputPath} ${JSON.stringify(image.getSize())}`)
    } catch (error) {
      console.error('[overlay] snapshot failed:', error)
    } finally {
      app.quit()
    }
  }, 800)
  snapshotTimer.unref?.()
}

function present(payload: ScreenshotNotificationOptions, receiptPath?: string): void {
  debug(`present title=${payload.title ?? ''}`)
  clearIdleQuit()
  if (snapshotTimer) {
    clearTimeout(snapshotTimer)
    snapshotTimer = null
  }

  let window: BrowserWindow | null
  try {
    window = showScreenshotNotification(payload, { overlayNotify: 'show' })
  } catch (error) {
    report(receiptPath, false, String(error))
    scheduleIdleQuit()
    return
  }
  if (!window) {
    report(receiptPath, false, 'Overlay window was not created')
    scheduleIdleQuit()
    return
  }

  debug('window created')
  activeOverlay = window
  window.once('closed', () => { if (activeOverlay === window) activeOverlay = null })
  // 替换旧窗口时 window-all-closed 可能短暂触发；新窗口创建后清掉旧的空闲计时。
  clearIdleQuit()
  let reported = false
  const complete = (shown: boolean, reason?: string) => {
    if (reported) return
    reported = true
    report(receiptPath, shown, reason)
  }
  const overlay = window
  overlay.once('show', () => {
    const shown = overlay.isVisible() && !overlay.webContents.isLoadingMainFrame()
    debug(`window shown=${shown} bounds=${JSON.stringify(overlay.getBounds())}`)
    complete(shown, shown ? undefined : 'Overlay window is not visible or is still loading')
    const snapshotPath = process.env.SHIIN_OVERLAY_SNAPSHOT
    if (snapshotPath) takeSnapshot(overlay, snapshotPath)
  })
  overlay.webContents.on('did-fail-load', (_event, code, description, _url, isMainFrame) => {
    if (isMainFrame) complete(false, `Overlay page failed to load (${code}): ${description}`)
  })
  overlay.webContents.once('render-process-gone', (_event, details) => complete(false, `Overlay renderer exited: ${details.reason}`))
  overlay.once('closed', () => complete(false, 'Overlay window closed before it became visible'))
}

// 第一个实例启动时没有 second-instance 事件，自己把环境变量里的 payload 画出来。
app.on('second-instance', (_event, _argv, _workingDirectory, additionalData) => {
  debug('second-instance received')
  // 命令行保留同一份请求；使用单个 --key=value，避免 Chromium 重排参数和值。
  let data = additionalData as { receiptPath?: unknown } | undefined
  const prefix = '--shiin-overlay-request='
  const request = _argv.find((argument) => argument.startsWith(prefix))
  if (_argv.includes('--shiin-overlay-warmup')) {
    receiveRequest({ warmup: true })
    return
  }
  if (request) {
    try {
      data = JSON.parse(Buffer.from(request.slice(prefix.length), 'base64').toString('utf8'))
    } catch {}
  }
  receiveRequest(data as Record<string, unknown> ?? {})
})

app.on('window-all-closed', () => {
  // 窗口按 duration 关掉后先把进程留在内存里，下一次通知直接复用。
  scheduleIdleQuit()
})

app.whenReady().then(() => {
  debug('app ready')
  if (initialWarmup) scheduleIdleQuit()
  else present(initialPayload, initialReceipt)
}).catch((error) => {
  report(initialReceipt, false, String(error))
  app.quit()
})

// 没有 payload（例如手动直接运行）时不要留一个空进程。
if (!initialWarmup && !initialPayload.title && !initialPayload.img && !process.env.SHIIN_OVERLAY_SNAPSHOT) {
  setTimeout(() => app.quit(), 1200)
}
