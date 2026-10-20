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
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 1500)
  try {
    const res = await fetch(endpoint, {
      method: body !== undefined ? 'POST' : 'GET',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export class ElectronHostBridge implements IHostBridge {
  public readonly hostType = 'electron'

  private eventSource: EventSource | null = null
  private screenshotListeners = new Set<(result: ScreenshotResult) => void>()
  private replayListeners = new Set<(result: { ok: boolean; error?: string }) => void>()
  private listeningListeners = new Set<(isListening: boolean) => void>()
  private deviceListeners = new Set<(devices: GamepadDeviceInfo[]) => void>()
  private gamepadStateCache: { at: number; value: { buttons: boolean[]; axes: number[] } | null } | null = null

  private get api() {
    return window.electronAPI || {}
  }

  /** 有 preload 就走 IPC；否则把同一个 URL 当作 Node Web 宿主。 */
  private get hasElectronApi(): boolean {
    return typeof window !== 'undefined' && Boolean(window.electronAPI)
  }

  private addListener<T>(listeners: Set<T>, callback: T): () => void {
    listeners.add(callback)
    return () => {
      listeners.delete(callback)
    }
  }

  /**
   * Web 宿主的事件通道。页面关闭不影响后台监听；重新打开时从 `/api/state` 恢复，
   * 之后由 SSE 推送截图、回放、设备插拔与监听状态。
   */
  private ensureEventSource(): void {
    if (this.hasElectronApi || this.eventSource || typeof EventSource === 'undefined') return
    const source = new EventSource('/api/events')
    const payloadOf = (event: Event): any => {
      try {
        return JSON.parse((event as MessageEvent).data)
      } catch {
        return null
      }
    }

    source.addEventListener('ready', (event) => {
      const data = payloadOf(event)?.data
      if (typeof data?.listening === 'boolean') {
        for (const callback of this.listeningListeners) callback(data.listening)
      }
      if (Array.isArray(data?.devices)) {
        for (const callback of this.deviceListeners) callback(data.devices)
      }
    })
    source.addEventListener('screenshot', (event) => {
      const data = payloadOf(event)?.data
      if (data) for (const callback of this.screenshotListeners) callback(data)
    })
    source.addEventListener('replayBuffer', (event) => {
      const data = payloadOf(event)?.data
      if (data) for (const callback of this.replayListeners) callback(data)
    })
    source.addEventListener('statusChanged', (event) => {
      const data = payloadOf(event)?.data
      const listening = typeof data?.listening === 'boolean' ? data.listening : Boolean(data)
      for (const callback of this.listeningListeners) callback(listening)
    })
    source.addEventListener('deviceChanged', (event) => {
      const data = payloadOf(event)?.data
      if (Array.isArray(data)) {
        for (const callback of this.deviceListeners) callback(data)
      }
    })
    this.eventSource = source
  }

  private async fetchGamepadState(): Promise<{ buttons: boolean[]; axes: number[] } | null> {
    const now = Date.now()
    if (this.gamepadStateCache && now - this.gamepadStateCache.at < 25) {
      return this.gamepadStateCache.value
    }
    const res = await fetchLocalApi<{ buttons?: unknown; axes?: unknown }>('/api/gamepad/state')
    const value =
      res && Array.isArray(res.buttons) && Array.isArray(res.axes)
        ? {
            buttons: res.buttons.map(Boolean),
            axes: res.axes.map((axis) => Number(axis) || 0),
          }
        : null
    this.gamepadStateCache = { at: now, value }
    return value
  }

  public async getStore<T>(key: string, defaultValue: T): Promise<T> {
    if (this.api.getStore) {
      return await this.api.getStore(key, defaultValue)
    }
    if (!this.hasElectronApi) {
      const res = await fetchLocalApi<{ value: T }>('/api/store/get', { key, defaultValue })
      if (res && 'value' in res) return res.value
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
      return
    }
    if (!this.hasElectronApi) {
      const res = await fetchLocalApi<{ ok: boolean }>('/api/store/set', { key, value })
      if (res?.ok) return
    }
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
  }

  private browserGamepads(): Gamepad[] {
    if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') return []
    return Array.from(navigator.getGamepads() || []).filter((gp): gp is Gamepad => Boolean(gp))
  }

  public async getConnectedGamepads(): Promise<GamepadDeviceInfo[]> {
    if (this.api.getAllGamePad) {
      try {
        const mainDevices = await this.api.getAllGamePad()
        if (Array.isArray(mainDevices) && mainDevices.length > 0) return mainDevices
      } catch {}
    }

    // Node 宿主优先：它的 ButtonN 与全局监听用的是同一套 SDL 索引。
    if (!this.hasElectronApi) {
      const apiDevs = await fetchLocalApi<GamepadDeviceInfo[]>('/api/gamepads')
      if (apiDevs) return apiDevs
    }

    // 仅当没有 Node 宿主时用 Web Gamepad API 兜底（索引口径与 SDL 不保证一致）。
    const raw = this.browserGamepads()
    if (raw.length > 0) {
      return raw.map((gp, idx) => ({
        _index: idx,
        id: gp.id,
        name: gp.id || `Gamepad #${idx + 1}`,
        type: 'gamecontroller',
      }))
    }

    return []
  }

  public async openGamepad(device: GamepadDeviceInfo): Promise<boolean> {
    if (this.api.openSdl2Device) {
      return await this.api.openSdl2Device(device)
    }
    if (!this.hasElectronApi) {
      const res = await fetchLocalApi<{ ok: boolean }>('/api/gamepads/open', { device })
      if (res) return Boolean(res.ok)
    }
    return false
  }

  public async closeGamepad(): Promise<void> {
    if (this.api.closeSdl2DeviceInstance) {
      await this.api.closeSdl2DeviceInstance()
      return
    }
    if (!this.hasElectronApi) {
      await fetchLocalApi('/api/gamepads/close', {})
    }
  }

  public onGamepadDevicesChanged(cb: (devices: GamepadDeviceInfo[]) => void): () => void {
    if (this.api.onGamepadDevicesChanged) {
      return this.api.onGamepadDevicesChanged(cb)
    }
    if (!this.hasElectronApi) {
      const unbind = this.addListener(this.deviceListeners, cb)
      this.ensureEventSource()
      return unbind
    }
    return () => {}
  }

  public async getCurrentButtons(): Promise<boolean[]> {
    if (this.api.getCurrentButtonsValue) {
      const mainButtons = await this.api.getCurrentButtonsValue()
      if (Array.isArray(mainButtons) && mainButtons.length > 0) {
        return mainButtons
      }
    }

    if (!this.hasElectronApi) {
      const state = await this.fetchGamepadState()
      if (state) return state.buttons
    }

    // Electron 主进程没有 SDL Worker 时的降级：把页面里的 Web Gamepad 状态注入主进程。
    const raw = this.browserGamepads()
    if (raw.length > 0) {
      const active = raw[0]
      const webButtons = active.buttons.map((button) => button.pressed)
      if (this.api.syncWebGamepad) {
        void this.api.syncWebGamepad(
          raw.map((gp, idx) => ({ _index: idx, id: gp.id, name: gp.id, type: 'gamecontroller' })),
          webButtons,
          active.axes.slice(),
        )
      }
      return webButtons
    }

    return []
  }

  public async getCurrentAxes(): Promise<number[]> {
    if (this.api.getCurrentAxesValue) {
      const mainAxes = await this.api.getCurrentAxesValue()
      if (Array.isArray(mainAxes) && mainAxes.length > 0) {
        return mainAxes
      }
    }

    if (!this.hasElectronApi) {
      const state = await this.fetchGamepadState()
      if (state) return state.axes
    }

    const raw = this.browserGamepads()
    return raw.length > 0 ? raw[0].axes.slice() : []
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
    if (!this.hasElectronApi) {
      const res = await fetchLocalApi<{ ok: boolean; reason?: string }>('/api/listen/start', { config })
      if (res) return Boolean(res.ok)
    }
    return false
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
    if (!this.hasElectronApi) {
      await fetchLocalApi('/api/listen/stop', {})
    }
  }

  public async getListeningState(): Promise<boolean> {
    if (this.api.getListeningState) {
      return Boolean(await this.api.getListeningState())
    }
    if (!this.hasElectronApi) {
      const res = await fetchLocalApi<{ listening: boolean }>('/api/listen/state')
      if (res) return Boolean(res.listening)
    }
    return false
  }

  public async getRuntimeState(): Promise<HostRuntimeState | null> {
    if (this.api.getRuntimeState) {
      return await this.api.getRuntimeState()
    }
    if (!this.hasElectronApi) {
      return await fetchLocalApi<HostRuntimeState>('/api/state')
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
    if (!this.hasElectronApi) {
      unbinds.push(this.addListener(this.listeningListeners, cb))
      this.ensureEventSource()
    }

    return () => {
      unbinds.forEach((u) => u())
    }
  }

  public onScreenshotCompleted(cb: (result: ScreenshotResult) => void): () => void {
    if (this.api.onScreenshotCompleted) {
      return this.api.onScreenshotCompleted(cb)
    }
    if (!this.hasElectronApi) {
      const unbind = this.addListener(this.screenshotListeners, cb)
      this.ensureEventSource()
      return unbind
    }
    return () => {}
  }

  public onObsReplayCompleted(cb: (result: { ok: boolean; error?: string }) => void): () => void {
    if (this.api.onObsReplayCompleted) {
      return this.api.onObsReplayCompleted(cb)
    }
    if (!this.hasElectronApi) {
      const unbind = this.addListener(this.replayListeners, cb)
      this.ensureEventSource()
      return unbind
    }
    return () => {}
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
    if (!this.hasElectronApi) {
      const res = await fetchLocalApi<{ ok: boolean; error?: string }>('/api/obs/save-replay', {})
      if (res) return res
    }
    return { ok: false, error: 'Host bridge unavailable' }
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
    const endpoint = options?.activeProbe ? '/api/permissions?activeProbe=1' : '/api/permissions'
    const apiRes = await fetchLocalApi<MacOSPermissionsStatus>(endpoint)
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
      return
    }
    if (!this.hasElectronApi) {
      const res = await fetchLocalApi<{ ok: boolean }>('/api/show-in-folder', { path: fullPath })
      if (res?.ok) return
    }
    await this.openFolder(fullPath)
  }

  public onOpenPermissionDialog(cb: (data?: any) => void): () => void {
    if (this.api.onOpenPermissionDialog) {
      return this.api.onOpenPermissionDialog(cb)
    }
    return () => {}
  }
}
