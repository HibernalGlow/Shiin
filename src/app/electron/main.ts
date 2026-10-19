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
} from 'electron'
import path from 'node:path'
import fs from 'node:fs'
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
} from '../../core/index.js'

const execFileAsync = promisify(execFile)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV !== 'production'
const nodeRequire = createRequire(import.meta.url)

let win: BrowserWindow | null = null
let tray: Tray | null = null
let manager!: ScreenshotManager
let updater: any = null

// 载入多语言包，用于托盘菜单和原生提示
const LOCALE_MESSAGES: Record<string, any> = {
  zh: nodeRequire('../../locales/zh.json'),
  'zh-TW': nodeRequire('../../locales/zh-TW.json'),
  en: nodeRequire('../../locales/en.json'),
  ja: nodeRequire('../../locales/ja.json'),
  ko: nodeRequire('../../locales/ko.json'),
  de: nodeRequire('../../locales/de.json'),
  fr: nodeRequire('../../locales/fr.json'),
  es: nodeRequire('../../locales/es.json'),
  ru: nodeRequire('../../locales/ru.json'),
}

function getI18nText(key: string, defaultText: string, locale?: string): string {
  const curLocale = locale || manager?.config?.locale || 'zh'
  const dict = LOCALE_MESSAGES[curLocale] || LOCALE_MESSAGES.zh || {}
  const text = key.split('.').reduce((acc, p) => (acc ? acc[p] : undefined), dict)
  return typeof text === 'string' ? text : defaultText
}

// 单实例锁
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
}

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore()
    win.show()
    win.focus()
  }
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

  // 当要求主动探测或状态不明确时，尝试通过 desktopCapturer 探测缩略图是否可用
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

  // 检测全局键盘钩子 (Input Monitoring / Accessibility)
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

  // 检测窗口枚举与前台窗口识别
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
    // 1. 主动请求辅助功能权限 (Accessibility) —— 传入 true 会立即弹出 macOS 原生授权提示框
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

    // 2. 主动请求输入监控权限 (Input Monitoring)
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

    // 3. 主动请求屏幕录制权限 (Screen Recording)
    // 调用 desktopCapturer.getSources + 原生 screencapture 触发 macOS 将应用注册到「屏幕录制」列表并弹出系统授权框
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

    // 4. 主动探测并验证截图目录读写权限
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

  // 窗口关闭拦截（支持最小化到托盘）
  win.on('close', (event) => {
    if ((app as any).isQuiting) return
    if (manager.config.closeType === 'tray') {
      event.preventDefault()
      win?.hide()
    }
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

  if (show) {
    win.show()
  }
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
      label: getI18nText('TrayMenu.openScreenshotFolder', '打开截图文件夹'),
      click: async () => {
        await openFolderInSystem(manager.config.path)
      },
    },
    {
      label: isListening
        ? getI18nText('TrayMenu.stopListen', '停止监听')
        : getI18nText('TrayMenu.startListen', '开始监听'),
      click: async () => {
        if (isListening) {
          manager.stopListening()
        } else {
          await manager.startListening()
        }
      },
    },
    { type: 'separator' },
    {
      label: getI18nText('TrayMenu.show', '显示主窗口'),
      click: () => {
        if (win) {
          win.isVisible() ? win.focus() : win.show()
        }
      },
    },
    {
      label: getI18nText('TrayMenu.exit', '退出'),
      click: () => {
        ;(app as any).isQuiting = true
        app.quit()
      },
    },
  ])
  tray.setContextMenu(contextMenu)
  tray.setToolTip(`Gamepad Screenshot Tool ver.2.0.0`)
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
  updateTrayMenu(false)

  tray.on('click', () => {
    if (win) {
      win.isVisible() ? win.focus() : win.show()
    }
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

    // Electron desktopCapturer 保底枚举窗口（在未授予辅助功能权限时依然可列出部分窗口）
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
    if (cfg) manager.config = { ...manager.config, ...cfg }
    // 如果在 macOS 下尚未获得录屏权限，尝试主动触发一次权限请求
    if (process.platform === 'darwin' && systemPreferences.getMediaAccessStatus) {
      const st = systemPreferences.getMediaAccessStatus('screen')
      if (st !== 'granted') {
        try {
          await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 32, height: 32 } })
        } catch {}
      }
    }
    const res = await manager.capture()
    return {
      ok: res.ok,
      filePath: res.filePath || null,
      error: res.error,
      timestamp: res.timestamp,
      format: res.format,
      sizeBytes: res.sizeBytes,
    }
  })

  ipcMain.handle('open-folder', async (_, folderPath) => {
    return await openFolderInSystem(folderPath)
  })

  ipcMain.handle('start-listening', async () => {
    // macOS 下如果开启了键盘触发但未授权辅助功能，主动拉起授权提示
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
    const res = win ? await dialog.showOpenDialog(win, dialogOpts) : await dialog.showOpenDialog(dialogOpts)
    return res.canceled ? null : res.filePaths[0]
  })

  ipcMain.handle('get-all-gamepad', () => manager.gamepad.getConnectedDevices())
  ipcMain.handle('open-sdl2-device', (_, dev) => manager.gamepad.openDevice(dev?._index ?? 0))
  ipcMain.handle('close-sdl2-instance-device', () => manager.gamepad.closeDevice())
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
        manager.config = { ...manager.config, ...JSON.parse(val) }
      } catch {}
    }
  })

  ipcMain.handle('window-minimize', () => win?.minimize())
  ipcMain.handle('window-toggle-maximize', () => {
    if (!win) return false
    if (win.isMaximized()) win.unmaximize()
    else win.maximize()
    return win.isMaximized()
  })
  ipcMain.handle('window-close', () => win?.close())
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
      // 主动请求一次屏幕权限以确保 TCC 注册
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
        getWindow: () => win,
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

  // 注册全局事件订阅（全屏浮层通知、托盘菜单、渲染进程通知）
  manager.subscribe((event) => {
    if (event.type === 'statusChanged') {
      updateTrayMenu(event.data.listening)
      win?.webContents.send('listen-status-changed', event.data.listening)
    } else if (event.type === 'screenshot') {
      const res = event.data
      if (res && res.ok) {
        showScreenshotNotification({
          img: res.filePath || '',
          title: '截图成功',
          desc: res.filePath ? path.basename(res.filePath) : '已成功写入系统剪贴板',
        })
      } else {
        showScreenshotNotification({
          title: '截图失败',
          desc: res?.error || '无法截取当前画面',
          type: 'text',
        })
      }
      win?.webContents.send('screenshot-completed', res)
    } else if (event.type === 'replayBuffer') {
      const res = event.data
      if (res && res.ok) {
        showScreenshotNotification({
          title: 'OBS 精彩瞬间已保存',
          desc: '回放缓存已成功导出',
          type: 'video',
        })
      }
      win?.webContents.send('obs-replay-completed', res)
    } else if (event.type === 'deviceChanged') {
      win?.webContents.send('gamepad-devices-changed', event.data)
    }
  })

  registerIpcHandlers()

  const launchTrayOnly = process.argv.includes('--tray')
  await createWindow(!launchTrayOnly)
  createTray()

  // macOS 下启动后自动检测并主动请求缺失的系统权限（屏幕录制 + 辅助功能）
  if (process.platform === 'darwin') {
    setTimeout(async () => {
      try {
        const perms = await getMacOSPermissionsStatus({ activeProbe: false })
        if (!perms.screenCapture || !perms.accessibility) {
          await requestMacOSPermission('all', { openSettingsIfDenied: false })
        }
      } catch (err) {
        console.warn('[Main] Initial macOS permission auto-request failed:', err)
      }
    }, 800)
  }
})

app.on('will-quit', () => {
  manager.dispose()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    void createWindow()
  } else if (win) {
    win.show()
    win.focus()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && manager.config.closeType === 'exit') {
    app.quit()
  }
})
