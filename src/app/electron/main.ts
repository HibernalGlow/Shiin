import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu,
  Tray,
  shell,
  clipboard,
  nativeImage,
  systemPreferences,
  screen,
  desktopCapturer,
  utilityProcess,
} from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import {
  ScreenshotManager,
  getScreenDisplays,
  getCaptureWindows,
  getActiveWindowInfo,
  resolveScreenshotSaveDir,
  testDirectoryAccess,
  captureMacScreenNative,
  ScreenShotSaveWayEnum,
  ScreenshotSoundEnum,
} from '../../core/index.js'
import { SOUND_DATA_URIS } from '../../ui/audio-data.js'

import zhLocale from '../../locales/zh.json' with { type: 'json' }
import zhTWLocale from '../../locales/zh-TW.json' with { type: 'json' }
import enLocale from '../../locales/en.json' with { type: 'json' }
import jaLocale from '../../locales/ja.json' with { type: 'json' }
import koLocale from '../../locales/ko.json' with { type: 'json' }
import deLocale from '../../locales/de.json' with { type: 'json' }
import frLocale from '../../locales/fr.json' with { type: 'json' }
import esLocale from '../../locales/es.json' with { type: 'json' }
import ruLocale from '../../locales/ru.json' with { type: 'json' }

const execFileAsync = promisify(execFile)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV !== 'production'
const nodeRequire = createRequire(import.meta.url)

// 全局未捕获异常记录
process.on('uncaughtException', (error) => {
  try {
    const logDir = path.join(os.homedir(), '.config', 'shiin')
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true })
    fs.appendFileSync(path.join(logDir, 'crash.log'), `[${new Date().toISOString()}] Uncaught Exception:\n${error?.stack || error}\n\n`)
  } catch {}
  console.error('[Main Uncaught Exception]', error)
})

let win: BrowserWindow | null = null
let tray: Tray | null = null
let manager!: ScreenshotManager
let updater: any = null

// 轻量模式状态（销毁主 BrowserWindow 释放渲染进程资源，保留后台引擎与托盘）
let isLightweightMode = false
let isDestroyingForLightweight = false

// 独立手柄输入采集 Utility Process Worker
let gamepadWorker: Electron.UtilityProcess | null = null
let gamepadWorkerRestartTimer: NodeJS.Timeout | null = null

// 载入多语言包，用于托盘菜单和原生提示（编译期静态内联入 bundle，消除运行时 nodeRequire 缺失）
function loadLocaleJson(name: string): Record<string, any> {
  const candidatePaths = [
    path.join(__dirname, `../../src/locales/${name}.json`),
    path.join(__dirname, `../src/locales/${name}.json`),
    path.join(__dirname, `../locales/${name}.json`),
    path.join(process.cwd(), `src/locales/${name}.json`),
  ]
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, 'utf8'))
      } catch {}
    }
  }
  return {}
}

const LOCALE_MESSAGES: Record<string, any> = {
  zh: loadLocaleJson('zh'),
  'zh-TW': loadLocaleJson('zh-TW'),
  en: loadLocaleJson('en'),
  ja: loadLocaleJson('ja'),
  ko: loadLocaleJson('ko'),
  de: loadLocaleJson('de'),
  fr: loadLocaleJson('fr'),
  es: loadLocaleJson('es'),
  ru: loadLocaleJson('ru'),
}

function getI18nText(key: string, defaultText: string, locale?: string): string {
  const curLocale = locale || manager?.config?.locale || 'zh'
  const dict = LOCALE_MESSAGES[curLocale] || LOCALE_MESSAGES.zh || {}
  const text = key.split('.').reduce((acc, p) => (acc ? acc[p] : undefined), dict)
  return typeof text === 'string' ? text : defaultText
}

/**
 * 后台快门音效播放（当主窗口已销毁处于轻量模式时，由主进程直接播放快门音频）
 */
const cachedSoundFilePaths = new Map<string, string>()

async function playBackgroundShutterSound(sound?: ScreenshotSoundEnum | string, power = 1): Promise<void> {
  if (!sound || sound === ScreenshotSoundEnum.None || sound === 'None') return
  const dataUri = SOUND_DATA_URIS[sound]
  if (!dataUri) return

  try {
    let wavPath = cachedSoundFilePaths.get(sound)
    if (!wavPath || !fs.existsSync(wavPath)) {
      const base64Data = dataUri.split(',')[1]
      if (!base64Data) return
      wavPath = path.join(os.tmpdir(), `shiin-shutter-${sound}.wav`)
      fs.writeFileSync(wavPath, Buffer.from(base64Data, 'base64'))
      cachedSoundFilePaths.set(sound, wavPath)
    }

    const volume = Math.max(0.05, Math.min(2, Number(power) || 1))
    if (process.platform === 'darwin') {
      await execFileAsync('/usr/bin/afplay', ['-v', String(volume), wavPath])
    } else if (process.platform === 'win32') {
      const escaped = wavPath.replace(/'/g, "''")
      await execFileAsync('powershell', [
        '-NoProfile',
        '-NonInteractive',
        '-WindowStyle',
        'Hidden',
        '-Command',
        `(New-Object Media.SoundPlayer '${escaped}').PlaySync()`,
      ])
    }
  } catch (err) {
    console.warn('[Main] playBackgroundShutterSound failed:', err)
  }
}

/**
 * 解析独立手柄采集 Worker 脚本入口路径
 */
function resolveGamepadWorkerPath(): string | null {
  const candidates = [
    path.join(__dirname, 'gamepad-worker.mjs'),
    path.join(__dirname, 'gamepad-worker.js'),
    path.resolve(process.cwd(), 'lib/gamepad-worker.mjs'),
  ]
  for (const p of candidates) {
    if (fs.existsSync(p)) return p
  }
  return null
}

/**
 * 启动独立的手柄采集 Utility Process，将原生 SDL 隔离在子进程中运行
 */
function startGamepadWorker(): void {
  if ((app as any).isQuiting || gamepadWorker) return

  const workerEntryPath = resolveGamepadWorkerPath()
  if (!workerEntryPath) {
    console.warn('[Main] Gamepad worker script not found, falling back to renderer gamepad polling.')
    return
  }

  try {
    const child = utilityProcess.fork(workerEntryPath, [], {
      serviceName: 'Shiin Gamepad Worker',
      env: {
        ...process.env,
        SHIIN_GAMEPAD_WORKER: '1',
      },
    })

    gamepadWorker = child

    child.on('message', (msg: any) => {
      if (!msg || typeof msg !== 'object') return
      if (msg.type === 'state') {
        manager?.gamepad.injectWorkerGamepadState(
          msg.devices || [],
          msg.buttons || [],
          msg.axes || [],
          msg.activeIndex
        )
      }
    })

    child.on('exit', (code) => {
      if (gamepadWorker === child) {
        gamepadWorker = null
      }
      if (!(app as any).isQuiting) {
        console.warn(`[Main] Gamepad utility worker exited (code=${code}), scheduling restart in 1.5s...`)
        if (gamepadWorkerRestartTimer) clearTimeout(gamepadWorkerRestartTimer)
        gamepadWorkerRestartTimer = setTimeout(() => {
          gamepadWorkerRestartTimer = null
          startGamepadWorker()
        }, 1500)
      }
    })
  } catch (err) {
    console.error('[Main] Failed to fork gamepad utilityProcess:', err)
  }
}

function stopGamepadWorker(): void {
  if (gamepadWorkerRestartTimer) {
    clearTimeout(gamepadWorkerRestartTimer)
    gamepadWorkerRestartTimer = null
  }
  if (gamepadWorker) {
    const child = gamepadWorker
    gamepadWorker = null
    try {
      child.postMessage({ type: 'dispose' })
    } catch {}
    try {
      child.kill()
    } catch {}
  }
}

// 单实例锁
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
  process.exit(0)
}

app.on('second-instance', () => {
  void showMainWindow()
})

const preloadPath = fs.existsSync(path.join(__dirname, 'preload.mjs'))
  ? path.join(__dirname, 'preload.mjs')
  : path.join(__dirname, 'preload.js')

/**
 * 跨平台安全打开本地目录（解决 macOS 下 process.cwd() 为只读 `/` 以及 shell.openPath 不置顶 Finder 的问题）
 */
async function openFolderInSystem(folderPath?: string): Promise<{ ok: boolean; path: string; error?: string }> {
  const rawTarget = typeof folderPath === 'string' && folderPath.trim() ? folderPath.trim() : ''
  const targetPath = resolveScreenshotSaveDir(rawTarget || manager?.config?.path)

  try {
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true })
    }

    const stat = fs.statSync(targetPath)
    if (stat.isFile()) {
      if (process.platform === 'darwin') {
        try {
          await execFileAsync('/usr/bin/open', ['-R', targetPath])
          return { ok: true, path: targetPath }
        } catch {
          // fallback
        }
      }
      shell.showItemInFolder(targetPath)
      return { ok: true, path: targetPath }
    }

    if (process.platform === 'darwin') {
      try {
        await execFileAsync('/usr/bin/open', [targetPath])
        return { ok: true, path: targetPath }
      } catch (openErr) {
        console.warn('[Main] /usr/bin/open fallback to shell.openPath:', openErr)
      }
    }

    const errMsg = await shell.openPath(targetPath)
    if (errMsg) {
      return { ok: false, path: targetPath, error: errMsg }
    }
    return { ok: true, path: targetPath }
  } catch (err: any) {
    console.error('[Main] openFolderInSystem failed:', err)
    return { ok: false, path: targetPath, error: err?.message || String(err) }
  }
}

/**
 * 打开 macOS 系统隐私与安全性指定面板
 */
async function openMacSystemPreferencePane(pane: 'screen' | 'accessibility' | 'input' | 'files') {
  if (process.platform !== 'darwin') return
  const urlMap: Record<string, string> = {
    screen: 'x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture',
    accessibility: 'x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility',
    input: 'x-apple.systempreferences:com.apple.preference.security?Privacy_ListenEvent',
    files: 'x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles',
  }
  const targetUrl = urlMap[pane] || urlMap.screen
  try {
    await shell.openExternal(targetUrl)
  } catch (err) {
    console.warn('[Main] Failed to open macOS preference pane:', err)
  }
}

/**
 * 获取全量 macOS 系统权限与硬件能力状态
 */
async function getMacOSPermissionsStatus(options?: { activeProbe?: boolean }) {
  const isMac = process.platform === 'darwin'
  const dirCheck = testDirectoryAccess(manager?.config?.path)
  const gamepads = manager ? manager.gamepad.getConnectedDevices() : []

  if (!isMac) {
    const wins = await getCaptureWindows()
    const activeWin = await getActiveWindowInfo()
    return {
      isMac: false,
      platform: process.platform,
      screenCapture: true,
      screenCaptureStatus: 'granted',
      accessibility: true,
      inputMonitoring: true,
      folderAccess: dirCheck.ok,
      resolvedSavePath: dirCheck.resolvedPath,
      folderError: dirCheck.error,
      windowRecognition: true,
      detectedWindowsCount: wins.length,
      activeWindowTitle: activeWin?.title || '',
      gamepadAccess: true,
      detectedGamepadsCount: gamepads.length,
      allGranted: dirCheck.ok,
      checkedAt: Date.now(),
    }
  }

  let screenCaptureStatus = systemPreferences.getMediaAccessStatus
    ? systemPreferences.getMediaAccessStatus('screen')
    : 'granted'
  let screenCapture = screenCaptureStatus === 'granted'

  if (options?.activeProbe && !screenCapture) {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 32, height: 32 },
      })
      if (sources && sources.length > 0 && !sources[0].thumbnail.isEmpty()) {
        screenCapture = true
        screenCaptureStatus = 'granted'
      }
    } catch {
      // ignore
    }
  }

  const accessibility = systemPreferences.isTrustedAccessibilityClient
    ? systemPreferences.isTrustedAccessibilityClient(false)
    : true

  let inputMonitoring = accessibility
  if (options?.activeProbe && manager?.keyboard) {
    const wasRunning = manager.keyboard.isRunning
    try {
      const started = manager.keyboard.start()
      if (!wasRunning && !manager.listening) {
        manager.keyboard.stop()
      }
      inputMonitoring = accessibility && started
    } catch {
      inputMonitoring = false
    }
  }

  let detectedWindowsCount = 0
  let activeWindowTitle = ''
  let windowError = ''
  try {
    const wins = await getCaptureWindows()
    detectedWindowsCount = wins.length
    if (detectedWindowsCount === 0) {
      const dcWins = await desktopCapturer.getSources({
        types: ['window'],
        thumbnailSize: { width: 1, height: 1 },
      })
      detectedWindowsCount = dcWins.length
    }
    const active = await getActiveWindowInfo()
    activeWindowTitle = active?.title || ''
  } catch (err: any) {
    windowError = err?.message || String(err)
  }

  const windowRecognition = accessibility && (detectedWindowsCount > 0 || Boolean(activeWindowTitle))
  const allGranted = Boolean(screenCapture && accessibility && inputMonitoring && dirCheck.ok)

  return {
    isMac: true,
    platform: process.platform,
    screenCapture,
    screenCaptureStatus,
    accessibility,
    inputMonitoring,
    folderAccess: dirCheck.ok,
    resolvedSavePath: dirCheck.resolvedPath,
    folderError: dirCheck.error,
    windowRecognition,
    detectedWindowsCount,
    activeWindowTitle,
    windowError: windowError || undefined,
    gamepadAccess: true,
    detectedGamepadsCount: gamepads.length,
    allGranted,
    checkedAt: Date.now(),
  }
}

/**
 * 主动向 macOS 请求系统权限（触发 TCC 原生授权弹窗，若已被拒绝则引导跳转系统设置）
 */
async function requestMacOSPermission(
  target: 'screen' | 'accessibility' | 'input' | 'folder' | 'all' = 'all',
  options?: { openSettingsIfDenied?: boolean }
) {
  const openIfDenied = options?.openSettingsIfDenied ?? true

  if (process.platform === 'darwin') {
    if (target === 'accessibility' || target === 'input' || target === 'all') {
      try {
        if (systemPreferences.isTrustedAccessibilityClient) {
          const trusted = systemPreferences.isTrustedAccessibilityClient(true)
          if (!trusted && openIfDenied && target === 'accessibility') {
            await openMacSystemPreferencePane('accessibility')
          }
        }
      } catch (err) {
        console.warn('[Main] request accessibility permission error:', err)
      }
    }

    if (target === 'input' || target === 'all') {
      try {
        if (manager?.keyboard) {
          const wasRunning = manager.keyboard.isRunning
          manager.keyboard.start()
          if (!wasRunning && !manager.listening) {
            manager.keyboard.stop()
          }
        }
        if (openIfDenied && target === 'input') {
          await openMacSystemPreferencePane('input')
        }
      } catch (err) {
        console.warn('[Main] request input monitoring permission error:', err)
      }
    }

    if (target === 'screen' || target === 'all') {
      try {
        await desktopCapturer.getSources({
          types: ['screen', 'window'],
          thumbnailSize: { width: 64, height: 64 },
        })
      } catch {}

      try {
        await captureMacScreenNative({ format: 'jpg' })
      } catch {}

      const statusAfter = systemPreferences.getMediaAccessStatus
        ? systemPreferences.getMediaAccessStatus('screen')
        : 'granted'
      if (statusAfter !== 'granted' && openIfDenied && target === 'screen') {
        await openMacSystemPreferencePane('screen')
      }
    }

    if (target === 'folder' || target === 'all') {
      const dirRes = testDirectoryAccess(manager?.config?.path)
      if (!dirRes.ok && openIfDenied && target === 'folder') {
        await openMacSystemPreferencePane('files')
      }
    }
  }

  return await getMacOSPermissionsStatus({ activeProbe: true })
}

async function createWindow(show = true) {
  if (win && !win.isDestroyed()) {
    if (show) {
      if (win.isMinimized()) win.restore()
      win.show()
      win.focus()
    }
    return win
  }

  const theme = manager.config.theme || 'dark'
  const iconPath = path.join(__dirname, '../gamepad.ico')
  const isMac = process.platform === 'darwin'

  win = new BrowserWindow({
    title: 'Gamepad Screenshot Tool (Shiin)',
    width: 1240,
    height: 880,
    minWidth: 980,
    minHeight: 700,
    frame: isMac ? true : false,
    titleBarStyle: isMac ? 'hiddenInset' : undefined,
    trafficLightPosition: isMac ? { x: 16, y: 14 } : undefined,
    autoHideMenuBar: true,
    backgroundColor: theme === 'light' ? '#F4F6F1' : '#08090C',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      backgroundThrottling: false,
    },
  })

  // 窗口关闭拦截（区分“直接退出”、“普通隐藏到托盘”与“进入轻量模式销毁窗口”）
  win.on('close', (event) => {
    if ((app as any).isQuiting || isDestroyingForLightweight) return

    if (manager.config.closeType === 'lightweight') {
      event.preventDefault()
      void enterLightweightMode()
      return
    }

    if (manager.config.closeType === 'tray') {
      event.preventDefault()
      win?.hide()
      updateTrayMenu(manager?.listening ?? false)
      return
    }

    ;(app as any).isQuiting = true
  })

  win.on('closed', () => {
    win = null
  })

  // 加载页面
  if (process.env.VITE_DEV_SERVER_URL || process.env.WEBPACK_DEV_SERVER_URL) {
    const devUrl = process.env.VITE_DEV_SERVER_URL || process.env.WEBPACK_DEV_SERVER_URL || 'http://localhost:3000'
    await win.loadURL(devUrl)
  } else {
    const indexPath = path.join(__dirname, '../dist/ui/index.html')
    if (fs.existsSync(indexPath)) {
      await win.loadFile(indexPath)
    } else {
      await win.loadURL(`data:text/html,<h2>Shiin Standalone Ready</h2>`)
    }
  }

  // 页面加载完成后向 Worker 请求一次最新手柄快照，确保重建窗口立即拿到实时设备状态
  gamepadWorker?.postMessage({ type: 'sync' })

  if (show && win && !win.isDestroyed()) {
    win.show()
    win.focus()
  }

  return win
}

/**
 * 进入 CC Switch 式轻量模式：
 * 销毁主 BrowserWindow 及其渲染进程 / WebContents，释放 UI 内存；
 * 保留后台 ScreenshotManager、手柄 Utility Process、OBS 与系统托盘；
 * macOS 下隐藏 Dock 图标。
 */
async function enterLightweightMode(): Promise<{ ok: boolean; lightweight: boolean }> {
  isLightweightMode = true

  if (win && !win.isDestroyed()) {
    isDestroyingForLightweight = true
    try {
      win.destroy()
    } catch (err) {
      console.warn('[Main] Destroy window for lightweight mode error:', err)
    } finally {
      win = null
      isDestroyingForLightweight = false
    }
  } else {
    win = null
  }

  if (process.platform === 'darwin') {
    try {
      app.dock?.hide()
    } catch {}
  }

  updateTrayMenu(manager?.listening ?? false)
  return { ok: true, lightweight: true }
}

/**
 * 退出轻量模式并打开/恢复主界面：
 * 按需重新创建 BrowserWindow 并恢复后台当前配置与监听状态，macOS 下恢复 Dock 图标。
 */
async function showMainWindow(): Promise<{ ok: boolean; lightweight: boolean }> {
  isLightweightMode = false

  if (process.platform === 'darwin') {
    try {
      await app.dock?.show()
    } catch {}
  }

  if (!win || win.isDestroyed()) {
    win = null
    await createWindow(true)
  } else {
    if (win.isMinimized()) win.restore()
    if (!win.isVisible()) win.show()
    win.focus()
  }

  updateTrayMenu(manager?.listening ?? false)
  if (win && !win.isDestroyed()) {
    win.webContents.send('lightweight-mode-changed', false)
  }
  return { ok: true, lightweight: false }
}

let overlayWindow: BrowserWindow | null = null
let overlayTimeout: NodeJS.Timeout | null = null

function showScreenshotNotification(options: {
  img?: string
  title?: string
  desc?: string
  type?: 'video' | 'text'
  duration?: number
}) {
  if (manager?.config?.overlayNotify === 'hide') {
    return
  }

  const {
    img = '',
    title = '截图成功',
    desc = '已保存到本地',
    type,
    duration = 4500,
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
  const rawSizePreset = manager.config.overlayNotifySize ?? 1
  let scale = typeof rawSizePreset === 'number' ? rawSizePreset : parseFloat(String(rawSizePreset))
  if (!Number.isFinite(scale) || scale <= 0) scale = 1
  scale = Math.min(2, Math.max(0.6, scale))

  const baseWidth = 480
  const baseHeight = 210
  const overlayWidth = Math.round(baseWidth * scale)
  const overlayHeight = Math.round(baseHeight * scale)

  const pos = manager.config.overlayNotifyPosition === 'left' ? 'left' : 'right'
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

  const candidatePaths = [
    path.join(__dirname, '../src/screenshot-notification.html'),
    path.join(__dirname, 'screenshot-notification.html'),
    path.join(process.cwd(), 'src/screenshot-notification.html'),
  ]
  const htmlPath = candidatePaths.find((p) => fs.existsSync(p)) || candidatePaths[0]

  let imgUrl = img
  if (img && !img.startsWith('file://') && !img.startsWith('data:')) {
    imgUrl = `file://${path.resolve(img)}`
  }

  void overlayWindow.loadFile(htmlPath, {
    query: {
      img: imgUrl,
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
}

function updateTrayMenu(isListening: boolean) {
  if (!tray || tray.isDestroyed()) return
  const contextMenu = Menu.buildFromTemplate([
    {
      label: getI18nText('TrayMenu.show', '打开主界面'),
      click: () => {
        void showMainWindow()
      },
    },
    {
      label: isListening
        ? getI18nText('TrayMenu.stopListen', '停止监听')
        : getI18nText('TrayMenu.startListen', '开始监听'),
      click: async () => {
        if (manager.listening) {
          manager.stopListening()
        } else {
          await manager.startListening()
        }
      },
    },
    {
      label: getI18nText('TrayMenu.openScreenshotFolder', '打开截图文件夹'),
      click: async () => {
        await openFolderInSystem(manager.config.path)
      },
    },
    { type: 'separator' },
    {
      label: getI18nText('TrayMenu.lightweightMode', '轻量模式'),
      type: 'checkbox',
      checked: isLightweightMode,
      click: (menuItem) => {
        if (menuItem.checked) {
          void enterLightweightMode()
        } else {
          void showMainWindow()
        }
      },
    },
    { type: 'separator' },
    {
      label: getI18nText('TrayMenu.exit', '退出'),
      click: () => {
        ;(app as any).isQuiting = true
        app.quit()
      },
    },
  ])
  tray.setContextMenu(contextMenu)
  const modeTag = isLightweightMode ? ' (Lightweight)' : ''
  tray.setToolTip(`Gamepad Screenshot Tool ver.2.0.0${modeTag}`)
}

function applyLanguageToShell(locale?: string) {
  if (win && !win.isDestroyed()) {
    win.setTitle(getI18nText('gamepadScreenShotTool', 'Gamepad Screenshot Tool', locale) + ' ver.2.0.0')
  }
  updateTrayMenu(manager?.listening ?? false)
}

function createTray() {
  const iconPath = process.platform === 'darwin'
    ? path.join(__dirname, '../src/assets/logo.png')
    : path.join(__dirname, '../gamepad.ico')
  if (!fs.existsSync(iconPath)) return

  const rawImage = nativeImage.createFromPath(iconPath)
  let trayIcon = rawImage
  if (process.platform === 'darwin') {
    trayIcon = rawImage.resize({ width: 18, height: 18 })
    trayIcon.setTemplateImage(true)
  }

  tray = new Tray(trayIcon)
  tray.setToolTip('Gamepad Screenshot Tool')
  updateTrayMenu(manager?.listening ?? false)

  tray.on('click', () => {
    if (process.platform !== 'darwin') {
      void showMainWindow()
    }
  })

  tray.on('double-click', () => {
    void showMainWindow()
  })
}

// 注册 IPC 处理函数
function registerIpcHandlers() {
  ipcMain.handle('get-screen-sources', async () => {
    try {
      const electronDisplays = screen.getAllDisplays()
      if (electronDisplays && electronDisplays.length > 0) {
        return electronDisplays.map((d, idx) => ({
          id: idx,
          name: `${d.label || (idx === 0 ? 'Primary Display' : `Display ${idx + 1}`)} (${d.bounds.width}×${d.bounds.height})`,
        }))
      }
    } catch {}
    return await getScreenDisplays()
  })

  ipcMain.handle('get-capture-windows', async () => {
    const wins = await getCaptureWindows()
    if (wins.length > 0) return wins

    try {
      const sources = await desktopCapturer.getSources({
        types: ['window'],
        thumbnailSize: { width: 1, height: 1 },
      })
      return sources
        .filter((s) => s.name && s.name.trim())
        .map((s) => {
          const match = s.id.match(/^window:(\d+):/)
          const numericId = match ? Number(match[1]) : s.id
          return {
            id: numericId,
            title: s.name,
            ownerName: '',
            processId: 0,
            path: '',
          }
        })
    } catch {
      return []
    }
  })

  ipcMain.handle('screen-shot', async (_, cfg) => {
    if (cfg) manager.syncConfig(cfg)
    if (process.platform === 'darwin' && systemPreferences.getMediaAccessStatus) {
      const st = systemPreferences.getMediaAccessStatus('screen')
      if (st !== 'granted') {
        try {
          await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 32, height: 32 } })
        } catch {}
        void openMacSystemPreferencePane('screen')
        if (win && !win.isDestroyed()) {
          win.webContents.send('open-permission-dialog', {
            reason: 'missing_screen_permission',
            message: '截取屏幕画面需要 macOS「屏幕录制」权限，已主动为您打开系统设置进行授权。',
          })
        }
        return {
          ok: false,
          filePath: null,
          error: '缺少 macOS 屏幕录制权限，已主动打开系统设置界面。请在列表中开启 Shiin 权限后重试。',
          timestamp: Date.now(),
          format: manager.config.imageFormat,
          sizeBytes: 0,
        }
      }
    }
    const res = await manager.capture()
    if (!res.ok && process.platform === 'darwin' && systemPreferences.getMediaAccessStatus) {
      const st = systemPreferences.getMediaAccessStatus('screen')
      if (st !== 'granted') {
        void openMacSystemPreferencePane('screen')
        if (win && !win.isDestroyed()) {
          win.webContents.send('open-permission-dialog', {
            reason: 'missing_screen_permission',
            message: '截图失败：检测到缺少 macOS「屏幕录制」权限，已主动为您打开系统设置进行授权。',
          })
        }
      }
    }
    return {
      ok: res.ok,
      filePath: res.filePath || null,
      error: res.error,
      timestamp: res.timestamp,
      format: res.format,
      sizeBytes: res.sizeBytes,
    }
  })

  ipcMain.handle('save-obs-replay', async () => {
    return await manager.saveOBSReplay()
  })

  ipcMain.handle('open-folder', async (_, folderPath) => {
    return await openFolderInSystem(folderPath)
  })

  ipcMain.handle('start-listening', async () => {
    if (
      process.platform === 'darwin' &&
      manager.config.keyboardTrigger &&
      systemPreferences.isTrustedAccessibilityClient
    ) {
      systemPreferences.isTrustedAccessibilityClient(true)
    }
    return await manager.startListening()
  })

  ipcMain.handle('stop-listening', () => {
    manager.stopListening()
    return { ok: true }
  })

  ipcMain.handle('get-listening-state', () => {
    return manager.listening
  })

  ipcMain.handle('get-runtime-state', () => {
    return {
      config: manager.config,
      listening: manager.listening,
      activeGamepadIndex: manager.gamepad.getActiveDeviceIndex(),
      devices: manager.gamepad.getConnectedDevices(),
      lightweightMode: isLightweightMode,
    }
  })

  ipcMain.handle('get-lightweight-mode', () => {
    return isLightweightMode
  })

  ipcMain.handle('enter-lightweight-mode', async () => {
    return await enterLightweightMode()
  })

  ipcMain.handle('exit-lightweight-mode', async () => {
    return await showMainWindow()
  })

  ipcMain.on('update-listening-state', (_, state: boolean) => {
    if (state) {
      void manager.startListening()
    } else {
      manager.stopListening()
    }
  })

  ipcMain.on('update-tray-icon', () => {
    // 兼容托盘图标刷新
  })

  ipcMain.handle('show-screenshot-notification', (_, data) => {
    showScreenshotNotification(data || {})
    return true
  })

  ipcMain.handle('select-folder', async () => {
    const defaultPath = resolveScreenshotSaveDir(manager?.config?.path)
    const dialogOpts: Electron.OpenDialogOptions = {
      defaultPath,
      properties: ['openDirectory', 'createDirectory'],
    }
    const res =
      win && !win.isDestroyed()
        ? await dialog.showOpenDialog(win, dialogOpts)
        : await dialog.showOpenDialog(dialogOpts)
    return res.canceled ? null : res.filePaths[0]
  })

  ipcMain.handle('get-all-gamepad', () => manager.gamepad.getConnectedDevices())
  ipcMain.handle('open-sdl2-device', (_, dev) => {
    const idx = dev?._index ?? 0
    const ok = manager.gamepad.openDevice(idx)
    gamepadWorker?.postMessage({ type: 'open-device', index: idx })
    return ok
  })
  ipcMain.handle('close-sdl2-instance-device', () => {
    manager.gamepad.closeDevice()
    gamepadWorker?.postMessage({ type: 'close-device' })
  })
  ipcMain.handle('get-current-buttons-value', () => manager.gamepad.getCurrentButtons())
  ipcMain.handle('get-current-axes-value', () => manager.gamepad.getCurrentAxes())
  ipcMain.handle('sync-web-gamepad', (_, devices, buttons, axes) => {
    manager.gamepad.injectWebGamepadState(devices, buttons, axes)
    return true
  })

  ipcMain.handle('get-store', (_, key, def) => manager.storage.get(key, def))
  ipcMain.handle('set-store', async (_, key, val) => {
    await manager.storage.set(key, val)
    if (key === 'globalConfig') {
      try {
        const parsed = typeof val === 'string' ? JSON.parse(val) : val
        manager.syncConfig(parsed)
        updateTrayMenu(manager.listening)
      } catch {}
    }
  })

  ipcMain.handle('window-minimize', () => {
    if (win && !win.isDestroyed()) win.minimize()
  })
  ipcMain.handle('window-toggle-maximize', () => {
    if (!win || win.isDestroyed()) return false
    if (win.isMaximized()) win.unmaximize()
    else win.maximize()
    return win.isMaximized()
  })
  ipcMain.handle('window-close', () => {
    if (win && !win.isDestroyed()) win.close()
  })
  ipcMain.handle('open-external', async (_, url) => {
    if (url && /^https?:\/\//i.test(url)) await shell.openExternal(url)
  })

  // macOS 权限查询、主动请求与截图权限实测
  ipcMain.handle('get-macos-permissions', async (_, options?: { activeProbe?: boolean }) => {
    return await getMacOSPermissionsStatus(options)
  })

  ipcMain.handle(
    'request-macos-permission',
    async (
      _,
      target: 'screen' | 'accessibility' | 'input' | 'folder' | 'all' = 'all',
      options?: { openSettingsIfDenied?: boolean }
    ) => {
      return await requestMacOSPermission(target, options)
    }
  )

  ipcMain.handle('test-screenshot-permission', async (_, customConfig?: any) => {
    const startTime = Date.now()
    try {
      if (process.platform === 'darwin') {
        try {
          await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: { width: 64, height: 64 },
          })
        } catch {}
      }

      const testCfg = {
        ...manager.config,
        ...(customConfig || {}),
        screenShotSaveWay: ScreenShotSaveWayEnum.FileAndCilpboard,
      }
      const res = await manager.capture()
      const latencyMs = Date.now() - startTime
      const perms = await getMacOSPermissionsStatus({ activeProbe: true })

      if (!res.ok) {
        return {
          ok: false,
          granted: false,
          latencyMs,
          error: res.error || 'Screenshot capture failed',
          permissions: perms,
        }
      }

      let previewDataUrl = ''
      let width = 0
      let height = 0
      let sizeBytes = res.sizeBytes || 0

      if (res.filePath && fs.existsSync(res.filePath)) {
        try {
          const buf = fs.readFileSync(res.filePath)
          sizeBytes = buf.length
          const img = nativeImage.createFromBuffer(buf)
          const sz = img.getSize()
          width = sz.width
          height = sz.height
          const resized = sz.width > 640 ? img.resize({ width: 640 }) : img
          previewDataUrl = resized.toDataURL()
        } catch {}
      }

      const granted = Boolean(res.ok && sizeBytes > 0)
      return {
        ok: true,
        granted,
        filePath: res.filePath || resolveScreenshotSaveDir(testCfg.path),
        previewDataUrl,
        width,
        height,
        sizeBytes,
        latencyMs,
        permissions: {
          ...perms,
          screenCapture: perms.screenCapture || granted,
          screenCaptureStatus: granted ? 'granted' : perms.screenCaptureStatus,
        },
      }
    } catch (err: any) {
      const perms = await getMacOSPermissionsStatus({ activeProbe: true })
      return {
        ok: false,
        granted: false,
        latencyMs: Date.now() - startTime,
        error: err?.message || String(err),
        permissions: perms,
      }
    }
  })

  ipcMain.handle('open-macos-preference', async (_, pane: 'screen' | 'accessibility' | 'input' | 'files') => {
    await openMacSystemPreferencePane(pane)
  })

  // 开机自启动
  ipcMain.handle('get-auto-start', () => {
    return app.getLoginItemSettings().openAtLogin
  })
  ipcMain.handle('set-auto-start', (_, enable: boolean) => {
    app.setLoginItemSettings({
      openAtLogin: enable,
      openAsHidden: true,
      args: enable ? ['--tray'] : [],
    })
    return app.getLoginItemSettings().openAtLogin
  })

  // 在 Finder 中显式定位截图
  ipcMain.handle('show-item-in-folder', async (_, fullPath: string) => {
    return await openFolderInSystem(fullPath)
  })

  // 语言热切换
  ipcMain.handle('apply-locale', (_, locale: string) => {
    if (typeof locale !== 'string' || !locale) return false
    if (manager?.config) {
      manager.config.locale = locale as any
    }
    applyLanguageToShell(locale)
    return true
  })

  // ===== 热更新（GitHub + 国内镜像） =====
  ipcMain.handle('updater:get-state', () => {
    return updater ? updater.getState() : { status: 'idle', currentVersion: '2.0.0' }
  })
  ipcMain.handle('updater:check', async (_, options) => {
    if (!updater) return { status: 'idle', currentVersion: '2.0.0' }
    return await updater.check({ quiet: !!(options && options.quiet) })
  })
  ipcMain.handle('updater:download', async () => {
    if (!updater) return { status: 'error', error: 'Updater not ready' }
    try {
      updater.assertSaneSize()
    } catch (error: any) {
      return { ...updater.getState(), status: 'error', error: error?.message || String(error) }
    }
    return await updater.download()
  })
  ipcMain.handle('updater:cancel', () => updater?.cancel())
  ipcMain.handle('updater:apply', () => updater?.apply())
  ipcMain.handle('updater:open-release', async (_, url) => {
    const target =
      url || (updater ? updater.getState().releaseUrl : 'https://github.com/AmagiSakuya/GamePad-ScreenShot-Windows/releases')
    if (target) await shell.openExternal(target)
  })
  ipcMain.handle('check-for-updates', async () => {
    if (!updater) {
      return { hasUpdate: false, latestVersion: '2.0.0', currentVersion: '2.0.0' }
    }
    const state = await updater.check().catch(() => updater.getState())
    const hasUpdate = state.status === 'available' || state.status === 'manual'
    return {
      hasUpdate,
      latestVersion: state.latestVersion,
      currentVersion: state.currentVersion,
      releaseUrl: state.releaseUrl,
      mode: state.mode,
      notes: state.notes,
      status: state.status,
      error: state.error,
    }
  })
}

app.on('ready', async () => {
  manager = new ScreenshotManager()
  await manager.init()

  // 初始化热更新器
  try {
    const updaterModulePath = path.resolve(__dirname, '../../lib/updater/index.js')
    const fallbackPath = path.resolve(process.cwd(), 'src/lib/updater/index.js')
    const targetPath = fs.existsSync(updaterModulePath) ? updaterModulePath : fallbackPath
    if (fs.existsSync(targetPath)) {
      const { createUpdater } = nodeRequire(targetPath)
      updater = createUpdater({
        app,
        configStore: {
          get: (k: string, def: any) => (manager?.config ? (manager.config as any)[k] ?? def : def),
          set: (k: string, val: any) => {
            if (manager?.config) (manager.config as any)[k] = val
          },
        },
        log: console,
        packageJson: { version: '2.0.0' },
        isDevelopment: isDev,
        getWindow: () => (win && !win.isDestroyed() ? win : null),
      })
      updater.init()
    }
  } catch (err) {
    console.warn('[Main] Updater initialize error:', err)
  }

  // 剪贴板自动写入支持
  manager.defaultCaptureOptions = {
    writeClipboard: (buf) => {
      try {
        const img = nativeImage.createFromBuffer(buf)
        clipboard.writeImage(img)
      } catch (err) {
        console.warn('[Main] writeClipboard failed:', err)
      }
    },
  }

  // 注册全局事件订阅（全屏浮层通知、快门音效、托盘菜单、渲染进程通知）
  manager.subscribe((event) => {
    const hasLiveWin = Boolean(win && !win.isDestroyed())

    if (event.type === 'statusChanged') {
      updateTrayMenu(event.data.listening)
      if (hasLiveWin) {
        win!.webContents.send('listen-status-changed', event.data.listening)
      }
    } else if (event.type === 'screenshot') {
      const res = event.data
      if (res && res.ok) {
        // 若主窗口已销毁（轻量模式），由主进程直接播放快门声；若主窗口存在，由渲染进程收到事件后用 WebAudio 播放
        if (!hasLiveWin && manager.config.sound && manager.config.sound !== ScreenshotSoundEnum.None) {
          void playBackgroundShutterSound(manager.config.sound, manager.config.soundPower)
        }
        showScreenshotNotification({
          img: res.filePath || '',
          title: getI18nText('overlayNotify.screenshotSuccess', '截图成功'),
          desc: res.filePath ? path.basename(res.filePath) : getI18nText('overlayNotify.screenshotSaved', '已成功写入系统剪贴板'),
        })
      } else {
        showScreenshotNotification({
          title: '截图失败',
          desc: res?.error || '无法截取当前画面',
          type: 'text',
        })
      }
      if (hasLiveWin) {
        win!.webContents.send('screenshot-completed', res)
      }
    } else if (event.type === 'replayBuffer') {
      const res = event.data
      if (res && res.ok) {
        showScreenshotNotification({
          title: getI18nText('overlayNotify.replayBufferSaved', 'OBS 精彩瞬间已保存'),
          desc: getI18nText('overlayNotify.replayBufferSavedDesc', '回放缓存已成功导出'),
          type: 'video',
        })
      }
      if (hasLiveWin) {
        win!.webContents.send('obs-replay-completed', res)
      }
    } else if (event.type === 'deviceChanged') {
      if (hasLiveWin) {
        win!.webContents.send('gamepad-devices-changed', event.data)
      }
      if (
        !manager.listening &&
        manager.config.autoListenResolution === 'whenDeviceAvailable' &&
        Array.isArray(event.data) &&
        event.data.length > 0
      ) {
        void manager.startListening()
      }
    }
  })

  registerIpcHandlers()
  startGamepadWorker()
  createTray()

  // 支持真正的 --tray / --lightweight 轻量启动：跳过主窗口与渲染进程创建，直接进入轻量托盘模式
  const launchLightweight =
    process.argv.includes('--tray') ||
    process.argv.includes('--lightweight') ||
    Boolean(manager.config.startInLightweightMode)

  if (launchLightweight) {
    await enterLightweightMode()
  } else {
    await createWindow(true)
  }

  if (manager.config.autoListenResolution === 'onAppStart') {
    void manager.startListening()
  }

  // macOS 下启动后自动检测并主动请求缺失的系统权限（仅非轻量启动时主动通知 UI）
  if (process.platform === 'darwin' && !launchLightweight) {
    setTimeout(async () => {
      try {
        const perms = await getMacOSPermissionsStatus({ activeProbe: false })
        if (!perms.screenCapture || !perms.accessibility) {
          await requestMacOSPermission('all', { openSettingsIfDenied: false })
          if (!perms.screenCapture && win && !win.isDestroyed()) {
            win.webContents.send('open-permission-dialog', {
              reason: 'startup_missing_permissions',
              message: '检测到屏幕录制权限尚未授权，截图功能将受限。已为您就绪权限自检中心。',
              perms,
            })
          }
        }
      } catch (err) {
        console.warn('[Main] Initial macOS permission auto-request failed:', err)
      }
    }, 800)
  }
})

app.on('will-quit', () => {
  ;(app as any).isQuiting = true
  stopGamepadWorker()
  manager?.dispose()
})

app.on('activate', () => {
  void showMainWindow()
})

app.on('window-all-closed', () => {
  // 轻量模式主动销毁主窗口时不能触发退出逻辑
  if (isLightweightMode || isDestroyingForLightweight) {
    return
  }
  if (process.platform !== 'darwin' && manager.config.closeType === 'exit') {
    app.quit()
  }
})
