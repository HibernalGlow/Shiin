/**
 * 截图覆层通知的唯一实现：桌面端主进程与 CLI 的 Electron 辅助进程都走这里。
 *
 * 两边共用同一份 `screenshot-notification.html` 与窗口参数，才能保证终端触发的通知
 * 在尺寸、位置、置顶层级和图片预览上与桌面端完全一致。
 */

import { BrowserWindow, screen, shell } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeOverlayScale, toImageUrl } from './overlay-payload.js'

export type OverlayCornerPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
export type OverlayNotifyPosition = OverlayCornerPosition | 'left' | 'right'

export interface OverlayNotifyConfig {
  overlayNotify?: 'show' | 'hide'
  overlayNotifyPosition?: OverlayNotifyPosition
  overlayNotifySize?: number | string
}

export interface ScreenshotNotificationOptions {
  img?: string
  title?: string
  desc?: string
  type?: 'video' | 'text'
  /** 毫秒；不传时沿用桌面端历史的 4500ms。 */
  duration?: number
  position?: OverlayNotifyPosition
  scale?: number
  theme?: 'light' | 'dark' | 'auto'
}

export function normalizeOverlayPosition(pos?: string): OverlayCornerPosition {
  if (pos === 'top-left' || pos === 'left') return 'top-left'
  if (pos === 'bottom-left') return 'bottom-left'
  if (pos === 'bottom-right') return 'bottom-right'
  return 'top-right'
}

const DEFAULT_DURATION = 4500
const BASE_WIDTH = 480
const BASE_HEIGHT = 210

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let overlayWindow: BrowserWindow | null = null

/** 构建产物优先使用同目录资源，源码调试时回到 src。 */
function resolveOverlayResourcePath(filename: string): string {
  const candidates = [
    path.join(__dirname, filename),
    path.join(__dirname, '../src', filename),
    path.join(process.cwd(), 'src', filename),
  ]
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0]
}

export function resolveOverlayHtmlPath(): string {
  return resolveOverlayResourcePath('screenshot-notification.html')
}

export function showScreenshotNotification(
  options: ScreenshotNotificationOptions,
  config: OverlayNotifyConfig = {},
): BrowserWindow | null {
  if (config.overlayNotify === 'hide') {
    return null
  }

  const {
    img = '',
    title = '截图成功',
    desc = '已保存到本地',
    type,
    duration = DEFAULT_DURATION,
  } = options

  if (overlayWindow && !overlayWindow.isDestroyed()) {
    try {
      overlayWindow.close()
    } catch {}
    overlayWindow = null
  }
  const primaryDisplay = screen.getPrimaryDisplay()
  const scale = normalizeOverlayScale(options.scale ?? config.overlayNotifySize)
  const overlayWidth = Math.round(BASE_WIDTH * scale)
  const overlayHeight = Math.round(BASE_HEIGHT * scale)

  const corner = normalizeOverlayPosition(options.position ?? config.overlayNotifyPosition)
  const isRight = corner === 'top-right' || corner === 'bottom-right'
  const isBottom = corner === 'bottom-left' || corner === 'bottom-right'

  const x = primaryDisplay.bounds.x + (isRight ? Math.max(0, primaryDisplay.bounds.width - overlayWidth - 24) : 24)
  const y = primaryDisplay.bounds.y + (isBottom ? Math.max(0, primaryDisplay.bounds.height - overlayHeight - 32) : 32)

  const window = new BrowserWindow({
    width: overlayWidth,
    height: overlayHeight,
    x,
    y,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: false,
    hasShadow: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: resolveOverlayResourcePath('screenshot-notification-preload.cjs'),
    },
  })
  overlayWindow = window

  overlayWindow.setAlwaysOnTop(true, 'screen-saver')
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  // 透明边缘透传鼠标；移到卡片上时由 preload 切为可点击。
  window.setIgnoreMouseEvents(true, { forward: true })

  let closeTimer: NodeJS.Timeout | undefined
  let remaining = duration + 350
  let timerStartedAt = 0
  let hovered = false
  let ready = false
  let opening = false
  const scheduleClose = () => {
    if (!ready || hovered || window.isDestroyed()) return
    timerStartedAt = Date.now()
    closeTimer = setTimeout(() => {
      if (!window.isDestroyed()) window.close()
    }, remaining)
  }

  window.webContents.on('ipc-message', (_event, channel, value) => {
    if (window.isDestroyed()) return
    if (channel === 'shiin-overlay:hover') {
      const nextHovered = value === true
      window.setIgnoreMouseEvents(!nextHovered, { forward: true })
      if (hovered === nextHovered) return
      hovered = nextHovered
      if (hovered && closeTimer) {
        clearTimeout(closeTimer)
        closeTimer = undefined
        remaining = Math.max(0, remaining - (Date.now() - timerStartedAt))
      } else if (!hovered) {
        scheduleClose()
      }
    } else if (channel === 'shiin-overlay:close') {
      window.close()
    } else if (channel === 'shiin-overlay:activate') {
      const imageUrl = toImageUrl(img)
      if (type === 'text' || !imageUrl.startsWith('file:')) {
        window.close()
        return
      }
      if (opening) return
      opening = true
      void shell.openPath(fileURLToPath(imageUrl)).then((error) => {
        if (error) console.error('[overlay] could not open screenshot:', error)
        else if (!window.isDestroyed()) window.close()
      }).catch((error) => console.error('[overlay] could not open screenshot:', error))
        .finally(() => { opening = false })
    }
  })

  void window.loadFile(resolveOverlayHtmlPath(), {
    query: {
      img: toImageUrl(img),
      title,
      desc,
      type: type || (img ? '' : 'text'),
      pos: corner,
      scale: String(scale),
      duration: String(duration),
      theme: options.theme || '',
    },
  }).catch((error) => {
    console.error('[overlay] page failed to load:', error)
    if (!window.isDestroyed()) window.close()
  })

  window.once('ready-to-show', () => {
    if (window.isDestroyed()) return
    window.showInactive()
    ready = true
    scheduleClose()
  })

  window.on('closed', () => {
    if (closeTimer) clearTimeout(closeTimer)
    if (overlayWindow === window) overlayWindow = null
  })

  return window
}
