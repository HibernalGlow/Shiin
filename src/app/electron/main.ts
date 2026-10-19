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
} from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  ScreenshotManager,
  getScreenDisplays,
  getCaptureWindows,
  getActiveWindowInfo,
} from '../../core/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV !== 'production'

let win: BrowserWindow | null = null
let tray: Tray | null = null
let manager!: ScreenshotManager

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

  const updateMenu = (isListening: boolean) => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '打开截图目录',
        click: () => {
          void shell.openPath(manager.config.path || path.join(process.cwd(), 'screenshots'))
        },
      },
      {
        label: isListening ? '停止监听' : '开始监听',
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
        label: '显示主窗口',
        click: () => {
          if (win) {
            win.isVisible() ? win.focus() : win.show()
          }
        },
      },
      {
        label: '退出',
        click: () => {
          ;(app as any).isQuiting = true
          app.quit()
        },
      },
    ])
    tray?.setContextMenu(contextMenu)
  }

  updateMenu(false)

  tray.on('click', () => {
    if (win) {
      win.isVisible() ? win.focus() : win.show()
    }
  })

  manager.subscribe((event) => {
    if (event.type === 'statusChanged') {
      updateMenu(event.data.listening)
    }
  })
}

// 注册 IPC 处理函数
function registerIpcHandlers() {
  ipcMain.handle('get-screen-sources', async () => await getScreenDisplays())
  ipcMain.handle('get-capture-windows', async () => await getCaptureWindows())

  ipcMain.handle('screen-shot', async (_, cfg) => {
    if (cfg) manager.config = { ...manager.config, ...cfg }
    const res = await manager.capture()
    return res.filePath || null
  })

  ipcMain.handle('open-folder', async (_, folderPath) => {
    if (folderPath) await shell.openPath(folderPath)
  })

  ipcMain.handle('select-folder', async () => {
    if (!win) return null
    const res = await dialog.showOpenDialog(win, { properties: ['openDirectory'] })
    return res.canceled ? null : res.filePaths[0]
  })

  ipcMain.handle('get-all-gamepad', () => manager.gamepad.getConnectedDevices())
  ipcMain.handle('open-sdl2-device', (_, dev) => manager.gamepad.openDevice(dev._index))
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

  // macOS 权限查询
  ipcMain.handle('get-macos-permissions', () => {
    if (process.platform !== 'darwin') {
      return { isMac: false, screenCapture: true, accessibility: true }
    }
    const screenCapture = systemPreferences.getMediaAccessStatus
      ? systemPreferences.getMediaAccessStatus('screen') === 'granted'
      : true
    const accessibility = systemPreferences.isTrustedAccessibilityClient
      ? systemPreferences.isTrustedAccessibilityClient(false)
      : true
    return { isMac: true, screenCapture, accessibility }
  })

  ipcMain.handle('open-macos-preference', (_, pane: 'screen' | 'accessibility') => {
    if (process.platform === 'darwin') {
      if (pane === 'screen') {
        void shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture')
      } else {
        void shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility')
      }
    }
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
  ipcMain.handle('show-item-in-folder', (_, fullPath: string) => {
    if (fullPath && fs.existsSync(fullPath)) {
      shell.showItemInFolder(fullPath)
    } else if (fullPath) {
      void shell.openPath(path.dirname(fullPath))
    }
  })
}

app.on('ready', async () => {
  manager = new ScreenshotManager()
  await manager.init()
  registerIpcHandlers()

  const launchTrayOnly = process.argv.includes('--tray')
  await createWindow(!launchTrayOnly)
  createTray()
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
