import { contextBridge, ipcRenderer, clipboard } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getScreenSources: () => ipcRenderer.invoke('get-screen-sources'),
  getCaptureWindows: () => ipcRenderer.invoke('get-capture-windows'),
  screenShot: (config: any) => ipcRenderer.invoke('screen-shot', config),
  openFolder: (folderPath: string) => ipcRenderer.invoke('open-folder', folderPath),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  getAllGamePad: () => ipcRenderer.invoke('get-all-gamepad'),
  openSdl2Device: (device: any) => ipcRenderer.invoke('open-sdl2-device', device),
  closeSdl2DeviceInstance: () => ipcRenderer.invoke('close-sdl2-instance-device'),
  getCurrentButtonsValue: () => ipcRenderer.invoke('get-current-buttons-value'),
  getCurrentAxesValue: () => ipcRenderer.invoke('get-current-axes-value'),
  setStore: (key: string, value: any) => ipcRenderer.invoke('set-store', key, value),
  getStore: (key: string, defaultValue: any) => ipcRenderer.invoke('get-store', key, defaultValue),
  updateTrayIcon: (isListening: boolean) => ipcRenderer.send('update-tray-icon', isListening),
  updateTrayListeningState: (state: boolean) => ipcRenderer.send('update-listening-state', state),
  startListening: () => ipcRenderer.invoke('start-listening'),
  stopListening: () => ipcRenderer.invoke('stop-listening'),
  getListeningState: () => ipcRenderer.invoke('get-listening-state'),
  showScreenshotNotification: (data: any) => ipcRenderer.invoke('show-screenshot-notification', data),
  onListenStatusChanged: (callback: (listening: boolean) => void) => {
    const handler = (_: any, st: boolean) => callback(st)
    ipcRenderer.on('listen-status-changed', handler)
    return () => ipcRenderer.removeListener('listen-status-changed', handler)
  },
  onScreenshotCompleted: (callback: (result: any) => void) => {
    const handler = (_: any, res: any) => callback(res)
    ipcRenderer.on('screenshot-completed', handler)
    return () => ipcRenderer.removeListener('screenshot-completed', handler)
  },
  onObsReplayCompleted: (callback: (result: any) => void) => {
    const handler = (_: any, res: any) => callback(res)
    ipcRenderer.on('obs-replay-completed', handler)
    return () => ipcRenderer.removeListener('obs-replay-completed', handler)
  },
  onStartListenFromTray: (callback: () => void) => ipcRenderer.on('start-listen-from-tray', callback),
  onStopListenFromTray: (callback: () => void) => ipcRenderer.on('stop-listen-from-tray', callback),
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  toggleMaximizeWindow: () => ipcRenderer.invoke('window-toggle-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  setUiScale: (scale: number) => ipcRenderer.invoke('set-ui-scale', scale),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  clearLogFiles: () => ipcRenderer.invoke('clear-log-files'),
  copyText: (text: string) => clipboard.writeText(text),
  platform: process.platform,
  getMacOSPermissions: (options?: { activeProbe?: boolean }) =>
    ipcRenderer.invoke('get-macos-permissions', options),
  requestMacOSPermission: (
    target: 'screen' | 'accessibility' | 'input' | 'folder' | 'files' | 'all',
    options?: { openSettingsIfDenied?: boolean }
  ) => ipcRenderer.invoke('request-macos-permission', target, options),
  testScreenshotPermission: (config?: any) =>
    ipcRenderer.invoke('test-screenshot-permission', config),
  openMacOSPreference: (pane: 'screen' | 'accessibility' | 'input' | 'files') =>
    ipcRenderer.invoke('open-macos-preference', pane),
  onOpenPermissionDialog: (callback: (data?: any) => void) => {
    const handler = (_: any, data: any) => callback(data)
    ipcRenderer.on('open-permission-dialog', handler)
    return () => ipcRenderer.removeListener('open-permission-dialog', handler)
  },
  getAutoStart: () => ipcRenderer.invoke('get-auto-start'),
  setAutoStart: (enable: boolean) => ipcRenderer.invoke('set-auto-start', enable),
  showItemInFolder: (fullPath: string) => ipcRenderer.invoke('show-item-in-folder', fullPath),
  syncWebGamepad: (devices: any[], buttons: boolean[], axes: number[]) =>
    ipcRenderer.invoke('sync-web-gamepad', devices, buttons, axes),
  // 2.0 语言热切换
  applyLocale: (locale: string) => ipcRenderer.invoke('apply-locale', locale),
  // 2.0 热更新
  getUpdateState: () => ipcRenderer.invoke('updater:get-state'),
  checkUpdate: (options?: any) => ipcRenderer.invoke('updater:check', options),
  downloadUpdate: () => ipcRenderer.invoke('updater:download'),
  cancelUpdate: () => ipcRenderer.invoke('updater:cancel'),
  applyUpdate: () => ipcRenderer.invoke('updater:apply'),
  openUpdateReleasePage: (url?: string) => ipcRenderer.invoke('updater:open-release', url),
  onUpdaterState: (callback: (state: any) => void) => {
    const listener = (_: any, state: any) => callback(state)
    ipcRenderer.on('updater:state', listener)
    return () => ipcRenderer.removeListener('updater:state', listener)
  },
  offUpdaterState: () => {
    ipcRenderer.removeAllListeners('updater:state')
  },
})
