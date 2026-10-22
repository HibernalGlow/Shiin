import { contextBridge, ipcRenderer, clipboard } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // 桌面外壳窗口管理
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  toggleMaximizeWindow: () => ipcRenderer.invoke('window-toggle-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),

  // 轻量模式控制
  getLightweightMode: () => ipcRenderer.invoke('get-lightweight-mode'),
  enterLightweightMode: () => ipcRenderer.invoke('enter-lightweight-mode'),
  exitLightweightMode: () => ipcRenderer.invoke('exit-lightweight-mode'),
  onLightweightModeChanged: (callback: (lightweight: boolean) => void) => {
    const handler = (_: any, st: boolean) => callback(st)
    ipcRenderer.on('lightweight-mode-changed', handler)
    return () => ipcRenderer.removeListener('lightweight-mode-changed', handler)
  },

  // 本地系统文件夹与对话框交互
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  openFolder: (folderPath: string) => ipcRenderer.invoke('open-folder', folderPath),
  showItemInFolder: (fullPath: string) => ipcRenderer.invoke('show-item-in-folder', fullPath),

  // 原生覆层通知与剪贴板
  showScreenshotNotification: (data: any) => ipcRenderer.invoke('show-screenshot-notification', data),
  copyText: (text: string) => clipboard.writeText(text),

  // 系统偏好设置与外部浏览器
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  openMacOSPreference: (pane: 'screen' | 'accessibility' | 'input' | 'files') =>
    ipcRenderer.invoke('open-macos-preference', pane),

  // 开机自启动
  getAutoStart: () => ipcRenderer.invoke('get-auto-start'),
  setAutoStart: (enable: boolean) => ipcRenderer.invoke('set-auto-start', enable),

  // 语言热切换与关闭行为同步
  applyLocale: (locale: string) => ipcRenderer.invoke('apply-locale', locale),
  syncCloseType: (closeType: string) => ipcRenderer.invoke('sync-close-type', closeType),

  // 统一后端服务地址
  getServiceUrl: () => ipcRenderer.invoke('get-service-url'),

  // 平台标识
  platform: process.platform,

  // 热更新控制
  getUpdateState: () => ipcRenderer.invoke('updater:get-state'),
  checkUpdate: (options?: any) => ipcRenderer.invoke('updater:check', options),
  downloadUpdate: () => ipcRenderer.invoke('updater:download'),
  cancelUpdate: () => ipcRenderer.invoke('updater:cancel'),
  applyUpdate: () => ipcRenderer.invoke('updater:apply'),
  openUpdateReleasePage: (url?: string) => ipcRenderer.invoke('updater:open-release', url),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  onUpdaterState: (callback: (state: any) => void) => {
    const listener = (_: any, state: any) => callback(state)
    ipcRenderer.on('updater:state', listener)
    return () => ipcRenderer.removeListener('updater:state', listener)
  },
  offUpdaterState: () => {
    ipcRenderer.removeAllListeners('updater:state')
  },
})
