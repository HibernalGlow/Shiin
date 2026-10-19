import type {
  IHostBridge,
  HostRuntimeState,
  MacOSPermissionsStatus,
  ScreenshotPermissionTestResult,
  MacPermissionPane,
  PermissionTargetType,
} from './types.js'
import type {
  ScreenshotConfig,
  GamepadDeviceInfo,
  CaptureDisplayInfo,
  CaptureWindowInfo,
  ScreenshotResult,
} from '../../core/types.js'

declare global {
  interface Window {
    electronAPI?: any
  }
}

async function fetchLocalApi<T>(endpoint: string, body?: unknown): Promise<T | null> {
  if (typeof fetch === 'undefined') return null
  try {
    const res = await fetch(endpoint, {
      method: body !== undefined ? 'POST' : 'GET',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

export class ElectronHostBridge implements IHostBridge {
  public readonly hostType = 'electron'

  private get api() {
    return window.electronAPI || {}
  }

  public async getStore<T>(key: string, defaultValue: T): Promise<T> {
    if (this.api.getStore) {
      return await this.api.getStore(key, defaultValue)
    }
    const val = localStorage.getItem(key)
    if (val === null) return defaultValue
    try {
      return JSON.parse(val)
    } catch {
      return val as unknown as T
    }
  }

  public async setStore<T>(key: string, value: T): Promise<void> {
    if (this.api.setStore) {
      await this.api.setStore(key, value)
    } else {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    }
  }

  public async getConnectedGamepads(): Promise<GamepadDeviceInfo[]> {
    let mainDevices: GamepadDeviceInfo[] = []
    if (this.api.getAllGamePad) {
      try {
        mainDevices = await this.api.getAllGamePad()
      } catch {}
    }
    if (mainDevices.length > 0) return mainDevices

    // Web Gamepad API Fallback (仅当独立 SDL Worker 未检出设备时作为降级来源)
    if (typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function') {
      const raw = Array.from(navigator.getGamepads() || []).filter(Boolean) as Gamepad[]
      if (raw.length > 0) {
        return raw.map((gp, idx) => ({
          _index: idx,
          id: gp.id,
          name: gp.id || `Gamepad #${idx + 1}`,
          type: 'gamecontroller',
        }))
      }
    }

    const apiDevs = await fetchLocalApi<GamepadDeviceInfo[]>('/api/gamepads')
    if (apiDevs && apiDevs.length > 0) return apiDevs

    return []
  }

  public async openGamepad(device: GamepadDeviceInfo): Promise<boolean> {
    if (this.api.openSdl2Device) {
      return await this.api.openSdl2Device(device)
    }
    return true
  }

  public async closeGamepad(): Promise<void> {
    if (this.api.closeSdl2DeviceInstance) {
      await this.api.closeSdl2DeviceInstance()
    }
  }

  public onGamepadDevicesChanged(cb: (devices: GamepadDeviceInfo[]) => void): () => void {
    if (this.api.onGamepadDevicesChanged) {
      return this.api.onGamepadDevicesChanged(cb)
    }
    return () => {}
  }

  public async getCurrentButtons(): Promise<boolean[]> {
    // 若浏览器环境存在 Web Gamepad 输入，仅作为后台无原生 Worker 时的降级补充上报（主进程在已有 Worker 状态时会自动忽略）
    let webButtons: boolean[] = []
    if (typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function') {
      const raw = Array.from(navigator.getGamepads() || []).filter(Boolean) as Gamepad[]
      if (raw.length > 0) {
        const active = raw[0]
        webButtons = active.buttons.map((b) => b.pressed)
        const webAxes = active.axes.map((a) => a)
        if (this.api.syncWebGamepad) {
          void this.api.syncWebGamepad(
            raw.map((gp, idx) => ({ _index: idx, id: gp.id, name: gp.id, type: 'gamecontroller' })),
            webButtons,
            webAxes
          )
        }
      }
    }

    if (this.api.getCurrentButtonsValue) {
      const mainButtons = await this.api.getCurrentButtonsValue()
      if (Array.isArray(mainButtons) && mainButtons.length > 0) {
        return mainButtons
      }
    }
    return webButtons
  }

  public async getCurrentAxes(): Promise<number[]> {
    if (this.api.getCurrentAxesValue) {
      const mainAxes = await this.api.getCurrentAxesValue()
      if (Array.isArray(mainAxes) && mainAxes.length > 0) {
        return mainAxes
      }
    }

    if (typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function') {
      const raw = Array.from(navigator.getGamepads() || []).filter(Boolean) as Gamepad[]
      if (raw.length > 0) {
        return raw[0].axes.map((a) => a)
      }
    }

    return []
  }

  public async getScreenSources(): Promise<CaptureDisplayInfo[]> {
    if (this.api.getScreenSources) {
      const list = await this.api.getScreenSources()
      if (Array.isArray(list) && list.length > 0) return list
    }
    const apiScreens = await fetchLocalApi<CaptureDisplayInfo[]>('/api/screens')
    if (apiScreens && apiScreens.length > 0) return apiScreens
    return [{ id: 0, name: 'Primary Display (主显示器)' }]
  }

  public async getCaptureWindows(): Promise<CaptureWindowInfo[]> {
    if (this.api.getCaptureWindows) {
      return await this.api.getCaptureWindows()
    }
    const apiWins = await fetchLocalApi<CaptureWindowInfo[]>('/api/windows')
    if (apiWins) return apiWins
    return []
  }

  public async capture(config: ScreenshotConfig): Promise<ScreenshotResult | null> {
    if (this.api.screenShot) {
      const res = await this.api.screenShot(config)
      if (res && typeof res === 'object') {
        return res
      }
      return {
        ok: res !== null,
        filePath: typeof res === 'string' ? res : null,
        timestamp: Date.now(),
        format: config.imageFormat,
      }
    }
    const apiRes = await fetchLocalApi<ScreenshotResult>('/api/capture', { config })
    return apiRes
  }

  public async selectFolder(): Promise<string | null> {
    if (this.api.selectFolder) {
      return await this.api.selectFolder()
    }
    const apiRes = await fetchLocalApi<{ path: string | null }>('/api/select-folder', {})
    return apiRes?.path ?? null
  }

  public async openFolder(folderPath: string): Promise<{ ok: boolean; path?: string; error?: string }> {
    if (this.api.openFolder) {
      const res = await this.api.openFolder(folderPath || '')
      if (res && typeof res === 'object') {
        return res
      }
      return { ok: true, path: folderPath }
    }
    const apiRes = await fetchLocalApi<{ ok: boolean; path?: string; error?: string }>('/api/open-folder', {
      path: folderPath || '',
    })
    if (apiRes) return apiRes
    return { ok: false, error: 'Host bridge unavailable' }
  }

  public async startListening(config: ScreenshotConfig): Promise<boolean> {
    if (this.api.startListening) {
      const res = await this.api.startListening()
      return res?.ok ?? true
    }
    if (this.api.updateTrayListeningState) {
      this.api.updateTrayListeningState(true)
      this.api.updateTrayIcon(true)
    }
    return true
  }

  public async stopListening(): Promise<void> {
    if (this.api.stopListening) {
      await this.api.stopListening()
      return
    }
    if (this.api.updateTrayListeningState) {
      this.api.updateTrayListeningState(false)
      this.api.updateTrayIcon(false)
    }
  }

  public async getListeningState(): Promise<boolean> {
    if (this.api.getListeningState) {
      return Boolean(await this.api.getListeningState())
    }
    return false
  }

  public async getRuntimeState(): Promise<HostRuntimeState | null> {
    if (this.api.getRuntimeState) {
      return await this.api.getRuntimeState()
    }
    return null
  }

  public onListeningStateChanged(cb: (isListening: boolean) => void): () => void {
    const unbinds: (() => void)[] = []
    if (this.api.onListenStatusChanged) {
      const un = this.api.onListenStatusChanged(cb)
      if (typeof un === 'function') unbinds.push(un)
    }
    const startHandler = () => cb(true)
    const stopHandler = () => cb(false)
    if (this.api.onStartListenFromTray) this.api.onStartListenFromTray(startHandler)
    if (this.api.onStopListenFromTray) this.api.onStopListenFromTray(stopHandler)

    return () => {
      unbinds.forEach((u) => u())
    }
  }

  public minimizeWindow(): void {
    if (this.api.minimizeWindow) this.api.minimizeWindow()
  }

  public async toggleMaximizeWindow(): Promise<boolean> {
    if (this.api.toggleMaximizeWindow) {
      return await this.api.toggleMaximizeWindow()
    }
    return false
  }

  public closeWindow(): void {
    if (this.api.closeWindow) this.api.closeWindow()
  }

  public async enterLightweightMode(): Promise<{ ok: boolean; lightweight: boolean }> {
    if (this.api.enterLightweightMode) {
      return await this.api.enterLightweightMode()
    }
    return { ok: false, lightweight: false }
  }

  public async exitLightweightMode(): Promise<{ ok: boolean; lightweight: boolean }> {
    if (this.api.exitLightweightMode) {
      return await this.api.exitLightweightMode()
    }
    return { ok: false, lightweight: false }
  }

  public onLightweightModeChanged(cb: (lightweight: boolean) => void): () => void {
    if (this.api.onLightweightModeChanged) {
      return this.api.onLightweightModeChanged(cb)
    }
    return () => {}
  }

  public async setUiScale(scale: number): Promise<number> {
    if (this.api.setUiScale) {
      return await this.api.setUiScale(scale)
    }
    return scale
  }

  public showNotification(title: string, body: string, img?: string): void {
    if (this.api.showScreenshotNotification) {
      this.api.showScreenshotNotification({ title, desc: body, img })
    } else if (typeof Notification !== 'undefined') {
      new Notification(title, { body })
    }
  }

  public async saveOBSReplay(): Promise<{ ok: boolean; error?: string }> {
    if (this.api.saveOBSReplay) {
      return await this.api.saveOBSReplay()
    }
    return { ok: true }
  }

  public async openExternal(url: string): Promise<void> {
    if (this.api.openExternal) {
      await this.api.openExternal(url)
    } else {
      window.open(url, '_blank')
    }
  }

  public async checkForUpdates(): Promise<{ hasUpdate: boolean; latestVersion: string; releaseUrl?: string } | null> {
    if (this.api.checkForUpdates) {
      return await this.api.checkForUpdates()
    }
    return null
  }

  public async clearLogFiles(): Promise<{ ok: boolean; removed: number }> {
    if (this.api.clearLogFiles) {
      return await this.api.clearLogFiles()
    }
    return { ok: true, removed: 0 }
  }

  public get isMac(): boolean {
    return this.api.platform === 'darwin' || /Macintosh|Mac OS X/i.test(navigator.userAgent)
  }

  public async getMacOSPermissions(options?: { activeProbe?: boolean }): Promise<MacOSPermissionsStatus> {
    if (this.api.getMacOSPermissions) {
      return await this.api.getMacOSPermissions(options)
    }
    const apiRes = await fetchLocalApi<MacOSPermissionsStatus>('/api/permissions', options || {})
    if (apiRes) return apiRes
    return {
      isMac: this.isMac,
      platform: this.isMac ? 'darwin' : 'unknown',
      screenCapture: true,
      screenCaptureStatus: 'granted',
      accessibility: true,
      inputMonitoring: true,
      folderAccess: true,
      resolvedSavePath: './screenshots',
      windowRecognition: true,
      detectedWindowsCount: 0,
      gamepadAccess: true,
      detectedGamepadsCount: 0,
      allGranted: true,
      checkedAt: Date.now(),
    }
  }

  public async requestMacOSPermission(
    target: PermissionTargetType = 'all',
    options?: { openSettingsIfDenied?: boolean }
  ): Promise<MacOSPermissionsStatus> {
    if (this.api.requestMacOSPermission) {
      return await this.api.requestMacOSPermission(target, options)
    }
    const apiRes = await fetchLocalApi<MacOSPermissionsStatus>('/api/request-permission', {
      target,
      options,
    })
    if (apiRes) return apiRes
    if (target === 'screen' || target === 'accessibility' || target === 'input' || target === 'files' || target === 'folder') {
      await this.openMacOSPreference(
        target === 'input'
          ? 'input'
          : target === 'accessibility'
          ? 'accessibility'
          : target === 'files' || target === 'folder'
          ? 'files'
          : 'screen'
      )
    }
    return await this.getMacOSPermissions({ activeProbe: true })
  }

  public async testScreenshotPermission(config?: ScreenshotConfig): Promise<ScreenshotPermissionTestResult> {
    if (this.api.testScreenshotPermission) {
      return await this.api.testScreenshotPermission(config)
    }
    const apiRes = await fetchLocalApi<ScreenshotPermissionTestResult>('/api/test-screenshot', { config })
    if (apiRes) return apiRes

    if (config) {
      const start = Date.now()
      const cap = await this.capture(config)
      const perms = await this.getMacOSPermissions({ activeProbe: true })
      return {
        ok: Boolean(cap?.ok),
        granted: Boolean(cap?.ok),
        filePath: cap?.filePath,
        sizeBytes: cap?.sizeBytes,
        latencyMs: Date.now() - start,
        error: cap?.error,
        permissions: perms,
      }
    }
    return { ok: false, granted: false, error: 'Host bridge unavailable' }
  }

  public async openMacOSPreference(pane: MacPermissionPane): Promise<void> {
    if (this.api.openMacOSPreference) {
      await this.api.openMacOSPreference(pane)
      return
    }
    await fetchLocalApi('/api/open-preference', { pane })
  }

  public async getAutoStart(): Promise<boolean> {
    if (this.api.getAutoStart) {
      return await this.api.getAutoStart()
    }
    return false
  }

  public async setAutoStart(enable: boolean): Promise<boolean> {
    if (this.api.setAutoStart) {
      return await this.api.setAutoStart(enable)
    }
    return enable
  }

  public async showItemInFolder(fullPath: string): Promise<void> {
    if (this.api.showItemInFolder) {
      await this.api.showItemInFolder(fullPath)
    } else {
      await this.openFolder(fullPath)
    }
  }

  public onOpenPermissionDialog(cb: (data?: any) => void): () => void {
    if (this.api.onOpenPermissionDialog) {
      return this.api.onOpenPermissionDialog(cb)
    }
    return () => {}
  }
}
