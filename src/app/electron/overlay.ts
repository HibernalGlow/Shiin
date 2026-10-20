/**
 * CLI/TUI 的覆层通知宿主：一个只负责弹通知的 Electron 进程。
 *
 * 由 `src/app/cli/overlay.ts` 以 detached 方式拉起，payload 走环境变量；
 * 已有实例在跑时由 Electron 的单实例锁把新 payload 送到第一个进程，
 * 从而像桌面端一样"后一条替换前一条"，不会叠出一排通知。
 */

import { app, type BrowserWindow } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { parseOverlayPayload } from './overlay-payload.js'
import { showScreenshotNotification, type ScreenshotNotificationOptions } from './overlay-window.js'

const DEFAULT_IDLE_KEEPALIVE_MS = 10 * 60_000
const configuredIdle = Number(process.env.SHIIN_OVERLAY_IDLE_MS)
const IDLE_KEEPALIVE_MS =
  Number.isFinite(configuredIdle) && configuredIdle >= 0 ? configuredIdle : DEFAULT_IDLE_KEEPALIVE_MS
const bootAt = Date.now()

/** 只在 SHIIN_OVERLAY_DEBUG=1 时输出；stdio 由 CLI 的 spawnDetached 落到 child log。 */
function debug(message: string): void {
  if (!process.env.SHIIN_OVERLAY_DEBUG) return
  console.log(`[overlay ${new Date().toISOString()} +${Date.now() - bootAt}ms] ${message}`)
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
app.setName('Shiin Overlay')
try {
  app.setActivationPolicy?.('accessory')
} catch {}
try {
  app.dock?.hide()
} catch {}

// 第二个实例只负责把 payload 送进已有实例，自己立刻退出。
const gotTheLock = app.requestSingleInstanceLock(initialPayload)
if (!gotTheLock) {
  app.quit()
  process.exit(0)
}

let idleTimer: NodeJS.Timeout | null = null
let snapshotTimer: NodeJS.Timeout | null = null

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

function present(payload: ScreenshotNotificationOptions): void {
  debug(`present title=${payload.title ?? ''}`)
  clearIdleQuit()
  if (snapshotTimer) {
    clearTimeout(snapshotTimer)
    snapshotTimer = null
  }

  const window = showScreenshotNotification(payload, { overlayNotify: 'show' })
  if (!window) {
    scheduleIdleQuit()
    return
  }

  debug('window created')
  window.once('ready-to-show', () => debug('ready-to-show'))

  const snapshotPath = process.env.SHIIN_OVERLAY_SNAPSHOT
  if (snapshotPath) takeSnapshot(window, snapshotPath)
}

// 第一个实例启动时没有 second-instance 事件，自己把环境变量里的 payload 画出来。
app.on('second-instance', (_event, _argv, _workingDirectory, additionalData) => {
  debug('second-instance received')
  present(parseOverlayPayload(additionalData))
})

app.on('window-all-closed', () => {
  // 窗口按 duration 关掉后先把进程留在内存里，下一次通知直接复用。
  scheduleIdleQuit()
})

app.whenReady().then(() => {
  debug('app ready')
  present(initialPayload)
})

// 没有 payload（例如手动直接运行）时不要留一个空进程。
if (!initialPayload.title && !initialPayload.img && !process.env.SHIIN_OVERLAY_SNAPSHOT) {
  setTimeout(() => app.quit(), 1200)
}
