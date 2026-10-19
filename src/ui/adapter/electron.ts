import type { IHostBridge } from './types.js'
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

    // Web Gamepad API Fallback (适用于无原生 SDL 的 Electron 桌面窗口)
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

  public async getCurrentButtons(): Promise<boolean[]> {
    // 优先读取 Web Gamepad API
    if (typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function') {
      const raw = Array.from(navigator.getGamepads() || []).filter(Boolean) as Gamepad[]
      if (raw.length > 0) {
        const active = raw[0]
        const buttons = active.buttons.map((b) => b.pressed)
        const axes = active.axes.map((a) => a)
        if (this.api.syncWebGamepad) {
          void this.api.syncWebGamepad(
            raw.map((gp, idx) => ({ _index: idx, id: gp.id, name: gp.id, type: 'gamecontroller' })),
            buttons,
            axes
          )
        }
        return buttons
      }
    }

    if (this.api.getCurrentButtonsValue) {
      return await this.api.getCurrentButtonsValue()
    }
    return []
  }

  public async getCurrentAxes(): Promise<number[]> {
    if (typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function') {
      const raw = Array.from(navigator.getGamepads() || []).filter(Boolean) as Gamepad[]
      if (raw.length > 0) {
        return raw[0].axes.map((a) => a)
      }
    }

    if (this.api.getCurrentAxesValue) {
      return await this.api.getCurrentAxesValue()
    }
    return []
  }

  public async getScreenSources(): Promise<CaptureDisplayInfo[]> {
    if (this.api.getScreenSources) {
      return await this.api.getScreenSources()
    }
    return [{ id: '', name: 'Primary Display' }]
  }

  public async getCaptureWindows(): Promise<CaptureWindowInfo[]> {
    if (this.api.getCaptureWindows) {
      return await this.api.getCaptureWindows()
    }
    return []
  }

  public async capture(config: ScreenshotConfig): Promise<ScreenshotResult | null> {
    if (this.api.screenShot) {
      const filePath = await this.api.screenShot(config)
      return {
        ok: filePath !== null,
        filePath,
        timestamp: Date.now(),
        format: config.imageFormat,
      }
    }
    return null
  }

  public async selectFolder(): Promise<string | null> {
    if (this.api.selectFolder) {
      return await this.api.selectFolder()
    }
    return null
  }

  public async openFolder(path: string): Promise<void> {
    if (this.api.openFolder) {
      await this.api.openFolder(path)
    }
  }

  public async startListening(config: ScreenshotConfig): Promise<boolean> {
    // 桌面端通过主窗口的监听状态维护
    if (this.api.updateTrayListeningState) {
      this.api.updateTrayListeningState(true)
      this.api.updateTrayIcon(true)
    }
    return true
  }

  public async stopListening(): Promise<void> {
    if (this.api.updateTrayListeningState) {
      this.api.updateTrayListeningState(false)
      this.api.updateTrayIcon(false)
    }
  }

  public onListeningStateChanged(cb: (isListening: boolean) => void): () => void {
    const startHandler = () => cb(true)
    const stopHandler = () => cb(false)
    if (this.api.onStartListenFromTray) this.api.onStartListenFromTray(startHandler)
    if (this.api.onStopListenFromTray) this.api.onStopListenFromTray(stopHandler)

    return () => {
      // unbind
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

  public async setUiScale(scale: number): Promise<number> {
    if (this.api.setUiScale) {
      return await this.api.setUiScale(scale)
    }
    return scale
  }

  public showNotification(title: string, body: string): void {
    if (this.api.showScreenshotNotification) {
      this.api.showScreenshotNotification({ title, desc: body })
    } else if (typeof Notification !== 'undefined') {
      new Notification(title, { body })
    }
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

  public async getMacOSPermissions(): Promise<{ isMac: boolean; screenCapture: boolean; accessibility: boolean }> {
    if (this.api.getMacOSPermissions) {
      return await this.api.getMacOSPermissions()
    }
    return { isMac: this.isMac, screenCapture: true, accessibility: true }
  }

  public async openMacOSPreference(pane: 'screen' | 'accessibility'): Promise<void> {
    if (this.api.openMacOSPreference) {
      await this.api.openMacOSPreference(pane)
    }
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

  public async showItemInFolder(path: string): Promise<void> {
    if (this.api.showItemInFolder) {
      await this.api.showItemInFolder(path)
    } else if (this.api.openFolder) {
      await this.api.openFolder(path)
    }
  }
}
