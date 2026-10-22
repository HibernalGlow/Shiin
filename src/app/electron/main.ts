import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu,
  Tray,
  shell,
  nativeImage,
} from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import http from 'node:http'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { CliServiceManager, type CliServiceReadyInfo } from './cli-service.js'
import { showScreenshotNotification } from './overlay-window.js'

const execFileAsync = promisify(execFile)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV !== 'production'
const nodeRequire = createRequire(import.meta.url)

// 全局未捕获异常日志
process.on('uncaughtException', (error) => {
  try {
    const logDir = path.join(os.homedir(), '.config', 'shiin')
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true })
    fs.appendFileSync(
      path.join(logDir, 'crash.log'),
      `[${new Date().toISOString()}] Uncaught Exception:\n${error?.stack || error}\n\n`
    )
  } catch {}
  console.error('[Main Uncaught Exception]', error)
})

let win: BrowserWindow | null = null
let tray: Tray | null = null
let updater: any = null
let sseReq: http.ClientRequest | null = null

// 统一 CLI 服务管理器（持有唯一业务后端的子进程）
const cliService = new CliServiceManager()
let currentServerUrl = ''
let currentListeningState = false
let currentCloseType: 'tray' | 'exit' | 'lightweight' = 'tray'
let currentLocale = 'zh'

// 轻量模式状态（销毁主 BrowserWindow 释放渲染进程资源，保留后台 CLI 服务与托盘）
let isLightweightMode = false
let isDestroyingForLightweight = false

// 载入多语言包，用于托盘菜单和原生提示
function loadLocaleJson(name: string): Record<string, any> {
  const candidatePaths = [
    path.join(__dirname, `../../src/locales/${name}.json`),
    path.join(__dirname, `../src/locales/${name}.json`),
    path.join(__dirname, `../locales/${name}.json`),
    path.resolve(process.cwd(), `src/locales/${name}.json`),
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
  const loc = locale || currentLocale || 'zh'
  const dict = LOCALE_MESSAGES[loc] || LOCALE_MESSAGES.zh || {}
  const text = key.split('.').reduce((acc, p) => (acc ? acc[p] : undefined), dict)
  return typeof text === 'string' ? text : defaultText
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
 * 跨平台安全打开本地目录
 */
async function openFolderInSystem(folderPath?: string): Promise<{ ok: boolean; path: string; error?: string }> {
  let targetPath = (folderPath || '').trim()
  if (!targetPath) {
    targetPath = path.join(os.homedir(), 'Pictures', 'Screenshots')
  }

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
        } catch {}
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
 * 托盘菜单与状态管理
 */
function updateTrayMenu(isListening: boolean) {
  currentListeningState = isListening
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
        if (!currentServerUrl) return
        const endpoint = isListening ? '/api/listen/stop' : '/api/listen/start'
        try {
          await fetch(`${currentServerUrl}${endpoint}`, { method: 'POST' })
        } catch (err) {
          console.warn('[Main] Tray toggle listening failed:', err)
        }
      },
    },
    {
      label: getI18nText('TrayMenu.openScreenshotFolder', '打开截图文件夹'),
      click: async () => {
        if (currentServerUrl) {
          try {
            await fetch(`${currentServerUrl}/api/open-folder`, { method: 'POST' })
            return
          } catch {}
        }
        await openFolderInSystem()
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
  if (locale) currentLocale = locale
  if (win && !win.isDestroyed()) {
    win.setTitle(getI18nText('gamepadScreenShotTool', 'Gamepad Screenshot Tool', locale) + ' ver.2.0.0')
  }
  updateTrayMenu(currentListeningState)
}

function createTray() {
  const iconPath =
    process.platform === 'darwin'
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
  updateTrayMenu(currentListeningState)

  tray.on('click', () => {
    if (process.platform !== 'darwin') {
      void showMainWindow()
    }
  })

  tray.on('double-click', () => {
    void showMainWindow()
  })
}

/**
 * 订阅后台服务的 SSE 事件流，保持托盘状态与配置同步
 */
function syncWithServiceEvents(serverUrl: string): void {
  if (sseReq) {
    try {
      sseReq.destroy()
    } catch {}
    sseReq = null
  }

  try {
    const url = new URL('/api/events', serverUrl)
    const req = http.request(url, { headers: { Accept: 'text/event-stream' } }, (res) => {
      let buffer = ''
      res.on('data', (chunk) => {
        buffer += chunk.toString('utf8')
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6))
              if (
                (event.type === 'statusChanged' || event.type === 'ready') &&
                typeof event.data?.listening === 'boolean'
              ) {
                updateTrayMenu(event.data.listening)
              }
            } catch {}
          }
        }
      })
      res.on('error', () => {})
    })
    req.on('error', () => {})
    req.end()
    sseReq = req
  } catch (err) {
    console.warn('[Main] syncWithServiceEvents failed:', err)
  }

  // 初始拉取一次状态配置
  void (async () => {
    try {
      const res = await fetch(`${serverUrl}/api/state`)
      if (res.ok) {
        const state: any = await res.json()
        if (state) {
          if (typeof state.listening === 'boolean') updateTrayMenu(state.listening)
          if (state.config?.locale) applyLanguageToShell(state.config.locale)
          if (state.config?.closeType) currentCloseType = state.config.closeType
        }
      }
    } catch {}
  })()
}

/**
 * 创建主界面 BrowserWindow，直接加载本地 HTTP 服务 URL
 */
async function createWindow(targetUrl: string, show = true) {
  if (win && !win.isDestroyed()) {
    if (show) {
      if (win.isMinimized()) win.restore()
      win.show()
      win.focus()
    }
    return win
  }

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
    backgroundColor: '#0C0E09',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      backgroundThrottling: false,
    },
  })

  // 窗口关闭拦截（根据配置区分：进入轻量模式 / 最小化到托盘 / 直接退出）
  win.on('close', (event) => {
    if ((app as any).isQuiting || isDestroyingForLightweight) return

    if (currentCloseType === 'lightweight') {
      event.preventDefault()
      void enterLightweightMode()
      return
    }

    if (currentCloseType === 'tray') {
      event.preventDefault()
      win?.hide()
      updateTrayMenu(currentListeningState)
      return
    }

    ;(app as any).isQuiting = true
  })

  win.on('closed', () => {
    win = null
  })

  // 加载页面：生产环境直接加载统一的本地 HTTP API+WebUI 服务
  const devUrl = process.env.VITE_DEV_SERVER_URL || process.env.WEBPACK_DEV_SERVER_URL
  const finalUrl = devUrl || targetUrl

  await win.loadURL(finalUrl)

  if (show && win && !win.isDestroyed()) {
    win.show()
    win.focus()
  }

  return win
}

/**
 * 进入轻量模式：销毁 BrowserWindow 释放前端内存，保留唯一的后台 CLI 服务与托盘
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

  updateTrayMenu(currentListeningState)
  return { ok: true, lightweight: true }
}

/**
 * 退出轻量模式并打开主界面
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
    if (currentServerUrl) {
      await createWindow(currentServerUrl, true)
    }
  } else {
    if (win.isMinimized()) win.restore()
    if (!win.isVisible()) win.show()
    win.focus()
  }

  updateTrayMenu(currentListeningState)
  if (win && !win.isDestroyed()) {
    win.webContents.send('lightweight-mode-changed', false)
  }
  return { ok: true, lightweight: false }
}

/**
 * 注册极薄的桌面外壳 IPC 处理函数
 */
function registerShellIpcHandlers() {
  ipcMain.handle('get-service-url', () => currentServerUrl)

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

  ipcMain.handle('open-folder', async (_, folderPath) => {
    return await openFolderInSystem(folderPath)
  })

  ipcMain.handle('show-item-in-folder', async (_, fullPath: string) => {
    return await openFolderInSystem(fullPath)
  })

  ipcMain.handle('select-folder', async () => {
    const dialogOpts: Electron.OpenDialogOptions = {
      properties: ['openDirectory', 'createDirectory'],
    }
    const res =
      win && !win.isDestroyed()
        ? await dialog.showOpenDialog(win, dialogOpts)
        : await dialog.showOpenDialog(dialogOpts)
    return res.canceled ? null : res.filePaths[0]
  })

  ipcMain.handle('show-screenshot-notification', (_, data) => {
    showScreenshotNotification(data || {})
    return true
  })

  ipcMain.handle('get-lightweight-mode', () => isLightweightMode)
  ipcMain.handle('enter-lightweight-mode', async () => await enterLightweightMode())
  ipcMain.handle('exit-lightweight-mode', async () => await showMainWindow())

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

  // 语言热切换同步外壳标题与托盘
  ipcMain.handle('apply-locale', (_, locale: string) => {
    if (typeof locale !== 'string' || !locale) return false
    applyLanguageToShell(locale)
    return true
  })

  // 更新关闭行为配置记录
  ipcMain.handle('sync-close-type', (_, closeType: 'tray' | 'exit' | 'lightweight') => {
    if (closeType) currentCloseType = closeType
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
  registerShellIpcHandlers()
  createTray()

  // 1. 启动托管的 Node CLI 统一运行时服务并完成握手
  console.log('[Main] Starting managed Shiin CLI runtime service...')
  let readyInfo: CliServiceReadyInfo
  try {
    readyInfo = await cliService.start()
    currentServerUrl = readyInfo.url
    console.log(`[Main] Managed Shiin CLI service ready on ${currentServerUrl} (pid=${readyInfo.pid})`)
  } catch (err) {
    console.error('[Main] Failed to start Shiin CLI service:', err)
    dialog.showErrorBox(
      'Shiin 运行时启动失败',
      `无法启动后台截图引擎服务：${(err as any)?.message || String(err)}\n请确认应用完整性。`
    )
    app.quit()
    return
  }

  // 2. 建立托盘与后端服务的状态事件同步
  syncWithServiceEvents(currentServerUrl)

  // 3. 监听子进程重启恢复（崩溃自愈）
  cliService.on('restarted', (newInfo: CliServiceReadyInfo) => {
    currentServerUrl = newInfo.url
    syncWithServiceEvents(currentServerUrl)
    if (win && !win.isDestroyed()) {
      void win.loadURL(currentServerUrl)
    }
  })

  // 4. 初始化热更新器
  try {
    const updaterModulePath = path.resolve(__dirname, '../../lib/updater/index.js')
    const fallbackPath = path.resolve(process.cwd(), 'src/lib/updater/index.js')
    const targetPath = fs.existsSync(updaterModulePath) ? updaterModulePath : fallbackPath
    if (fs.existsSync(targetPath)) {
      const { createUpdater } = nodeRequire(targetPath)
      updater = createUpdater({
        app,
        configStore: {
          get: (k: string, def: any) => def,
          set: () => {},
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

  // 5. 启动主窗口或进入轻量模式
  const launchLightweight =
    process.argv.includes('--tray') ||
    process.argv.includes('--lightweight')

  if (launchLightweight) {
    await enterLightweightMode()
  } else {
    await createWindow(currentServerUrl, true)
  }
})

app.on('will-quit', () => {
  ;(app as any).isQuiting = true
  if (sseReq) {
    try {
      sseReq.destroy()
    } catch {}
    sseReq = null
  }
  cliService.dispose()
})

app.on('activate', () => {
  void showMainWindow()
})

app.on('window-all-closed', () => {
  if (isLightweightMode || isDestroyingForLightweight) {
    return
  }
  if (process.platform !== 'darwin' && currentCloseType === 'exit') {
    app.quit()
  }
})
