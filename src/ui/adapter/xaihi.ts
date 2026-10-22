import type { IHostBridge } from './types.js'
import type {
  ScreenshotConfig,
  GamepadDeviceInfo,
  CaptureDisplayInfo,
  CaptureWindowInfo,
  ScreenshotResult,
} from '../../core/types.js'

export interface XaihiHostApi {
  runCommand(line: string): Promise<{ ok: boolean; text?: string; reason?: string }>
}

export class XaihiHostBridge implements IHostBridge {
  public readonly hostType = 'xaihi'
  public readonly isWeb = true
  public readonly isDesktop = false
  public readonly isMac = typeof navigator !== 'undefined' && /Macintosh|Mac OS X/i.test(navigator.userAgent)
  public readonly platform = 'web'
  private host: XaihiHostApi
  private isListening = false
  private listenerCallbacks = new Set<(state: boolean) => void>()

  constructor(host: XaihiHostApi) {
    this.host = host
  }

  public async getStore<T>(key: string, defaultValue: T): Promise<T> {
    const val = localStorage.getItem(`xaihi_shiin_${key}`)
    if (val === null) return defaultValue
    try {
      return JSON.parse(val)
    } catch {
      return val as unknown as T
    }
  }

  public async setStore<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(`xaihi_shiin_${key}`, typeof value === 'string' ? value : JSON.stringify(value))
  }

  public async getConnectedGamepads(): Promise<GamepadDeviceInfo[]> {
    const res = await this.host.runCommand('/shiin list')
    if (!res.ok || !res.text) return []
    // 解析返回的手柄列表
    const lines = res.text.split('\n')
    const list: GamepadDeviceInfo[] = []
    for (const line of lines) {
      const match = line.match(/•\s*\[Index\s*(\d+)\]\s*(.+)/)
      if (match) {
        list.push({
          _index: Number(match[1]),
          id: match[1],
          name: match[2],
        })
      }
    }
    return list
  }

  public async openGamepad(): Promise<boolean> {
    return true
  }

  public async closeGamepad(): Promise<void> {}

  public async getCurrentButtons(): Promise<boolean[]> {
    return []
  }

  public async getCurrentAxes(): Promise<number[]> {
    return []
  }

  public async getScreenSources(): Promise<CaptureDisplayInfo[]> {
    return [{ id: '', name: '主屏幕 (Host Primary Screen)' }]
  }

  public async getCaptureWindows(): Promise<CaptureWindowInfo[]> {
    return []
  }

  public async capture(config: ScreenshotConfig): Promise<ScreenshotResult | null> {
    const res = await this.host.runCommand('/shiin capture')
    return {
      ok: res.ok,
      filePath: res.text || null,
      error: res.reason,
      timestamp: Date.now(),
      format: config.imageFormat,
    }
  }

  public async selectFolder(): Promise<string | null> {
    return null
  }

  public async openFolder(): Promise<void> {}

  public async startListening(): Promise<boolean> {
    const res = await this.host.runCommand('/shiin start')
    this.isListening = res.ok
    this.notifyListening(this.isListening)
    return res.ok
  }

  public async stopListening(): Promise<void> {
    await this.host.runCommand('/shiin stop')
    this.isListening = false
    this.notifyListening(false)
  }

  private notifyListening(state: boolean): void {
    for (const cb of this.listenerCallbacks) {
      try {
        cb(state)
      } catch {
        // ignore
      }
    }
  }

  public onListeningStateChanged(cb: (isListening: boolean) => void): () => void {
    this.listenerCallbacks.add(cb)
    return () => this.listenerCallbacks.delete(cb)
  }

  public async saveOBSReplay(): Promise<{ ok: boolean; error?: string }> {
    const res = await this.host.runCommand('/shiin replay')
    return { ok: res.ok, error: res.reason }
  }

  public showNotification(): void {}
}
