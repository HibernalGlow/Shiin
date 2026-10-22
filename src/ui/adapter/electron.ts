/**
 * Shiin 统一宿主适配器 (Unified HTTP + SSE Host Bridge)
 *
 * 核心架构原则：
 * 1. Node.js CLI (shiin serve) 是唯一的截图、手柄、热键与 OBS 业务后端；
 * 2. 所有业务请求（截图、手柄、配置存储、设备列表、监听启停、状态同步）统一走本地 HTTP API + SSE；
 * 3. 极薄的桌面外壳桥接（窗口最小化、轻量模式、原生目录对话框、开机自启、热更新）在 Electron 存在时通过 window.electronAPI 委派；
 * 4. 在独立浏览器或第三方 Web 容器中访问时无缝平稳降级。
 */

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

let serviceBaseUrl = ''

if (typeof window !== 'undefined' && window.electronAPI?.getServiceUrl) {
  try {
    void window.electronAPI.getServiceUrl().then((url: string) => {
      if (typeof url === 'string' && url.trim()) {
        serviceBaseUrl = url.trim().replace(/\/+$/, '')
      }
    })
  } catch {}
}

async function fetchLocalApi<T>(endpoint: string, body?: unknown): Promise<T | null> {
  if (typeof fetch === 'undefined') return null
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 3000)
  try {
    const fullUrl = serviceBaseUrl && !endpoint.startsWith('http') ? `${serviceBaseUrl}${endpoint}` : endpoint
    const res = await fetch(fullUrl, {
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
    return typeof window !== 'undefined' ? window.electronAPI || {} : {}
  }

  public get hasElectronApi(): boolean {
    return typeof window !== 'undefined' && Boolean(window.electronAPI)
  }

  private addListener<T>(listeners: Set<T>, callback: T): () => void {
    listeners.add(callback)
    return () => {
      listeners.delete(callback)
    }
  }

  /**
   * 统一事件通道（SSE）：
   * 无论是在桌面外壳窗口中还是在独立浏览器中，统一由本地服务的 /api/events 推送事件。
   */
  private ensureEventSource(): void {
    if (this.eventSource || typeof EventSource === 'undefined') return
    const eventUrl = serviceBaseUrl ? `${serviceBaseUrl}/api/events` : '/api/events'
    const source = new EventSource(eventUrl)
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
    if (this.gamepadStateCache && now - this.gamepadStateCache.at < 20) {
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
    const res = await fetchLocalApi<{ value: T }>('/api/store/get', { key, defaultValue })
    if (res && 'value' in res) return res.value

    if (typeof localStorage !== 'undefined') {
      const val = localStorage.getItem(key)
      if (val === null) return defaultValue
      try {
        return JSON.parse(val)
      } catch {
        return val as unknown as T
      }
    }
    return defaultValue
  }

  public async setStore<T>(key: string, value: T): Promise<void> {
    const res = await fetchLocalApi<{ ok: boolean }>('/api/store/set', { key, value })
    if (!res?.ok) throw new Error('Local service did not save the setting')
    if (key === 'globalConfig') {
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : (value as any)
        if (parsed?.closeType && this.api.syncCloseType) {
          void this.api.syncCloseType(parsed.closeType)
        }
        if (parsed?.locale && this.api.applyLocale) {
          void this.api.applyLocale(parsed.locale)
        }
      } catch {}
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    }
  }

  private browserGamepads(): Gamepad[] {
    if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') return []
    return Array.from(navigator.getGamepads() || []).filter((gp): gp is Gamepad => Boolean(gp))
  }

  public async getConnectedGamepads(): Promise<GamepadDeviceInfo[]> {
    const apiDevs = await fetchLocalApi<GamepadDeviceInfo[]>('/api/gamepads')
    if (apiDevs && apiDevs.length > 0) return apiDevs

    const raw = this.browserGamepads()
    if (raw.length > 0) {
      return raw.map((gp, idx) => ({
        _index: idx,
        id: gp.id,
        name: gp.id || `Gamepad #${idx + 1}`,
        type: 'gamecontroller',
        inputLayout: 'standard',
      }))
    }

    return apiDevs || []
  }

  public async openGamepad(device: GamepadDeviceInfo): Promise<boolean> {
    const res = await fetchLocalApi<{ ok: boolean }>('/api/gamepads/open', { device })
    return Boolean(res?.ok)
  }

  public async closeGamepad(): Promise<void> {
    await fetchLocalApi('/api/gamepads/close', {})
  }

  public onGamepadDevicesChanged(cb: (devices: GamepadDeviceInfo[]) => void): () => void {
    const unbind = this.addListener(this.deviceListeners, cb)
    this.ensureEventSource()
    return unbind
  }

  public async getCurrentButtons(): Promise<boolean[]> {
    const state = await this.fetchGamepadState()
    if (state && state.buttons.some(Boolean)) return state.buttons

    const raw = this.browserGamepads()
    if (raw.length > 0) {
      return raw[0].buttons.map((b) => b.pressed)
    }
    return state ? state.buttons : []
  }

  public async getCurrentAxes(): Promise<number[]> {
    const state = await this.fetchGamepadState()
    if (state && state.axes.some((val) => Math.abs(val) > 0.15)) return state.axes

    const raw = this.browserGamepads()
    return raw.length > 0 ? raw[0].axes.slice() : (state ? state.axes : [])
  }

  public async syncWebGamepad(devices: GamepadDeviceInfo[], buttons: boolean[], axes: number[]): Promise<void> {
    if (this.api.syncWebGamepad) {
      try {
        await this.api.syncWebGamepad(devices, buttons, axes)
        return
      } catch {}
    }
    await fetchLocalApi('/api/gamepad/sync', { devices, buttons, axes })
  }

  public async getScreenSources(): Promise<CaptureDisplayInfo[]> {
    const apiScreens = await fetchLocalApi<CaptureDisplayInfo[]>('/api/screens')
    if (apiScreens && apiScreens.length > 0) return apiScreens
    return [{ id: 0, name: 'Primary Display (主显示器)' }]
  }

  public async getCaptureWindows(): Promise<CaptureWindowInfo[]> {
    const apiWins = await fetchLocalApi<CaptureWindowInfo[]>('/api/windows')
    return apiWins || []
  }

  public async capture(config: ScreenshotConfig): Promise<ScreenshotResult | null> {
    const apiRes = await fetchLocalApi<ScreenshotResult>('/api/capture', { config })
    return apiRes
  }

  public async selectFolder(): Promise<string | null> {
    if (this.api.selectFolder) {
      try {
        const folder = await this.api.selectFolder()
        if (folder) return folder
      } catch {}
    }
    const apiRes = await fetchLocalApi<{ path: string | null }>('/api/select-folder', {})
    return apiRes?.path ?? null
  }

  public async openFolder(folderPath: string): Promise<{ ok: boolean; path?: string; error?: string }> {
    if (this.api.openFolder) {
      try {
        const res = await this.api.openFolder(folderPath || '')
        if (res && typeof res === 'object') return res
      } catch {}
    }
    const apiRes = await fetchLocalApi<{ ok: boolean; path?: string; error?: string }>('/api/open-folder', {
      path: folderPath || '',
    })
    return apiRes || { ok: false, error: 'Host bridge unavailable' }
  }

  public async startListening(config: ScreenshotConfig): Promise<boolean> {
    const res = await fetchLocalApi<{ ok: boolean; reason?: string }>('/api/listen/start', { config })
    return Boolean(res?.ok)
  }

  public async stopListening(): Promise<void> {
    await fetchLocalApi('/api/listen/stop', {})
  }

  public async getListeningState(): Promise<boolean> {
    const res = await fetchLocalApi<{ listening: boolean }>('/api/listen/state')
    return Boolean(res?.listening)
  }

  public async getRuntimeState(): Promise<HostRuntimeState | null> {
    return await fetchLocalApi<HostRuntimeState>('/api/state')
  }

  public onListeningStateChanged(cb: (isListening: boolean) => void): () => void {
    const unbind = this.addListener(this.listeningListeners, cb)
    this.ensureEventSource()
    return unbind
  }

  public onScreenshotCompleted(cb: (result: ScreenshotResult) => void): () => void {
    const unbind = this.addListener(this.screenshotListeners, cb)
    this.ensureEventSource()
    return unbind
  }

  public onObsReplayCompleted(cb: (result: { ok: boolean; error?: string }) => void): () => void {
    const unbind = this.addListener(this.replayListeners, cb)
    this.ensureEventSource()
    return unbind
  }

  // ===== 桌面外壳专用轻量桥接能力 =====
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
    return scale
  }

  public showNotification(
    title: string,
    body: string,
    img?: string,
    options?: { force?: boolean; duration?: number; type?: 'video' | 'text' }
  ): void {
    if (this.api.showScreenshotNotification) {
      this.api.showScreenshotNotification({
        title,
        desc: body,
        img,
        type: options?.type || (img ? undefined : 'text'),
        duration: options?.duration,
      })
      return
    }
    void fetchLocalApi<{ ok: boolean }>('/api/notify', {
      title,
      desc: body,
      img: img || undefined,
      type: options?.type || (img ? undefined : 'text'),
      duration: options?.duration,
      force: options?.force,
    }).catch(() => {
      if (typeof Notification !== 'undefined') {
        try {
          new Notification(title, { body })
        } catch {}
      }
    })
  }

  public async saveOBSReplay(): Promise<{ ok: boolean; error?: string }> {
    const res = await fetchLocalApi<{ ok: boolean; error?: string }>('/api/obs/save-replay', {})
    return res || { ok: false, error: 'Host bridge unavailable' }
  }

  public async openExternal(url: string): Promise<void> {
    if (this.api.openExternal) {
      await this.api.openExternal(url)
    } else if (typeof window !== 'undefined') {
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
    return { ok: true, removed: 0 }
  }

  public get isWeb(): boolean {
    return !this.hasElectronApi
  }

  public get isDesktop(): boolean {
    return this.hasElectronApi
  }

  public get platform(): string {
    if (this.hasElectronApi && this.api.platform) {
      return this.api.platform
    }
    if (typeof navigator !== 'undefined') {
      if (/Macintosh|Mac OS X/i.test(navigator.userAgent)) return 'darwin'
      if (/Windows/i.test(navigator.userAgent)) return 'win32'
      if (/Linux/i.test(navigator.userAgent)) return 'linux'
    }
    return 'unknown'
  }

  public get isMac(): boolean {
    if (this.hasElectronApi && this.api.platform) {
      return this.api.platform === 'darwin'
    }
    return typeof navigator !== 'undefined' && /Macintosh|Mac OS X/i.test(navigator.userAgent)
  }

  public async getMacOSPermissions(options?: { activeProbe?: boolean }): Promise<MacOSPermissionsStatus> {
    const endpoint = options?.activeProbe ? '/api/permissions?activeProbe=1' : '/api/permissions'
    const apiRes = await fetchLocalApi<MacOSPermissionsStatus>(endpoint)
    if (apiRes) return apiRes
    throw new Error('Permission service unavailable')
  }

  public async requestMacOSPermission(
    target: PermissionTargetType = 'all',
    options?: { openSettingsIfDenied?: boolean }
  ): Promise<MacOSPermissionsStatus> {
    const apiRes = await fetchLocalApi<MacOSPermissionsStatus>('/api/request-permission', {
      target,
      options,
    })
    if (apiRes) return apiRes
    return await this.getMacOSPermissions({ activeProbe: true })
  }

  public async testScreenshotPermission(config?: ScreenshotConfig): Promise<ScreenshotPermissionTestResult> {
    const apiRes = await fetchLocalApi<ScreenshotPermissionTestResult>('/api/test-screenshot', { config })
    if (apiRes) return apiRes
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
    const res = await fetchLocalApi<{ ok: boolean }>('/api/show-in-folder', { path: fullPath })
    if (res?.ok) return
    await this.openFolder(fullPath)
  }

  public onOpenPermissionDialog(cb: (data?: any) => void): () => void {
    return () => {}
  }
}
