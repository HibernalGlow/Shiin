/**
 * 截图覆层通知的唯一实现：桌面端主进程与 CLI 的 Electron 辅助进程都走这里。
 *
 * 两边共用同一份 `screenshot-notification.html` 与窗口参数，才能保证终端触发的通知
 * 在尺寸、位置、置顶层级和图片预览上与桌面端完全一致。
 */

import { BrowserWindow, screen } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeOverlayScale, toImageUrl } from './overlay-payload.js'

export interface OverlayNotifyConfig {
  overlayNotify?: 'show' | 'hide'
  overlayNotifyPosition?: 'left' | 'right'
  overlayNotifySize?: number | string
}

export interface ScreenshotNotificationOptions {
  img?: string
  title?: string
  desc?: string
  type?: 'video' | 'text'
  /** 毫秒；不传时沿用桌面端历史的 4500ms。 */
  duration?: number
  position?: 'left' | 'right'
  scale?: number
}

const DEFAULT_DURATION = 4500
const BASE_WIDTH = 480
const BASE_HEIGHT = 210

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let overlayWindow: BrowserWindow | null = null
let overlayTimeout: NodeJS.Timeout | null = null

/** 构建产物里 HTML 与 main/overlay 同级，源码目录里在上一级。 */
export function resolveOverlayHtmlPath(): string {
  const candidates = [
    path.join(__dirname, '../src/screenshot-notification.html'),
    path.join(__dirname, 'screenshot-notification.html'),
    path.join(process.cwd(), 'src/screenshot-notification.html'),
  ]
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0]
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
  if (overlayTimeout) {
    clearTimeout(overlayTimeout)
    overlayTimeout = null
  }

  const primaryDisplay = screen.getPrimaryDisplay()
  const scale = normalizeOverlayScale(options.scale ?? config.overlayNotifySize)
  const overlayWidth = Math.round(BASE_WIDTH * scale)
  const overlayHeight = Math.round(BASE_HEIGHT * scale)

  const pos = options.position ?? (config.overlayNotifyPosition === 'left' ? 'left' : 'right')
  const x = pos === 'right' ? Math.max(0, primaryDisplay.bounds.width - overlayWidth - 24) : 24
  const y = 32

  overlayWindow = new BrowserWindow({
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
    },
  })

  overlayWindow.setAlwaysOnTop(true, 'screen-saver')
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  overlayWindow.setIgnoreMouseEvents(true)

  void overlayWindow.loadFile(resolveOverlayHtmlPath(), {
    query: {
      img: toImageUrl(img),
      title,
      desc,
      type: type || (img ? '' : 'text'),
      pos,
      scale: String(scale),
    },
  })

  overlayWindow.once('ready-to-show', () => {
    overlayWindow?.showInactive()
  })

  overlayWindow.on('closed', () => {
    overlayWindow = null
    if (overlayTimeout) {
      clearTimeout(overlayTimeout)
      overlayTimeout = null
    }
  })

  overlayTimeout = setTimeout(() => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      try {
        overlayWindow.close()
      } catch {}
      overlayWindow = null
    }
  }, duration)

  return overlayWindow
}
