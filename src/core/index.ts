import { GamepadCore } from './gamepad.js'
import { OBSManager } from './obs.js'
import { KeyboardCore } from './keyboard.js'
import {
  performScreenshot,
  getScreenDisplays,
  getCaptureWindows,
  getActiveWindowInfo,
  resolveScreenshotSaveDir,
  testDirectoryAccess,
  captureMacScreenNative,
} from './screenshot.js'
import {
  type IConfigStorage,
  FileConfigStorage,
  MemoryConfigStorage,
  loadFullConfig,
  saveFullConfig,
  isDirectoryWritable,
  getDefaultConfigDir,
} from './config.js'
import {
  type ScreenshotConfig,
  type ScreenshotResult,
  ScreenShotWayEnum,
  DEFAULT_CONFIG,
} from './types.js'

export * from './types.js'
export * from './filename.js'
export * from './config.js'
export * from './gamepad.js'
export * from './screenshot.js'
export * from './obs.js'
export * from './keyboard.js'

export type ScreenshotManagerListener = (event: {
  type: 'screenshot' | 'replayBuffer' | 'deviceChanged' | 'statusChanged'
  data?: any
}) => void

export class ScreenshotManager {
  public config: ScreenshotConfig = { ...DEFAULT_CONFIG }
  public storage: IConfigStorage
  public gamepad: GamepadCore
  public obs: OBSManager
  public keyboard: KeyboardCore

  public defaultCaptureOptions?: {
    writeClipboard?: (buf: Buffer) => void
    confirmOverwrite?: (filePath: string) => Promise<boolean>
  }

  private listeners = new Set<ScreenshotManagerListener>()
  private isListening = false
  private currentDeviceName = ''

  constructor(customStorage?: IConfigStorage) {
    this.storage = customStorage || new FileConfigStorage()
    this.gamepad = new GamepadCore()
    this.obs = new OBSManager()
    this.keyboard = new KeyboardCore()

    this.initBindings()
  }

  private initBindings(): void {
    // 监听手柄触发
    this.gamepad.onTrigger(async (action) => {
      if (action === 'screenshot') {
        const res = await this.capture(this.defaultCaptureOptions)
        this.emit({ type: 'screenshot', data: res })
      } else if (action === 'replayBuffer') {
        const res = await this.saveOBSReplay()
        this.emit({ type: 'replayBuffer', data: res })
      }
    })

    // 监听手柄插拔
    this.gamepad.onDeviceChange((devices) => {
      this.emit({ type: 'deviceChanged', data: devices })
    })

    // 监听键盘全局触发
    this.keyboard.onKeyDown((keycode) => {
      if (
        this.isListening &&
        this.config.keyboardTrigger &&
        this.config.keyboardTriggerKeyCode === keycode
      ) {
        void this.capture(this.defaultCaptureOptions).then((res) => {
          this.emit({ type: 'screenshot', data: res })
        })
      }
    })
  }

  public subscribe(fn: ScreenshotManagerListener): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  private emit(event: { type: 'screenshot' | 'replayBuffer' | 'deviceChanged' | 'statusChanged'; data?: any }): void {
    for (const fn of this.listeners) {
      try {
        fn(event)
      } catch (err) {
        console.error('[ScreenshotManager] Listener error:', err)
      }
    }
  }

  public async init(deviceName?: string): Promise<void> {
    this.currentDeviceName = deviceName || ''
    this.config = await loadFullConfig(this.storage, deviceName)

    // 确保默认截图目录已初始化解析
    if (!this.config.path || !this.config.path.trim()) {
      this.config.path = resolveScreenshotSaveDir('')
    }

    // 如果首选屏幕没有配，自动选中第一块屏幕
    if (this.config.screenSourceId === '' || this.config.screenSourceId === undefined) {
      const screens = await getScreenDisplays()
      if (screens.length > 0) {
        this.config.screenSourceId = screens[0].id
      }
    }
  }

  public async saveConfig(): Promise<void> {
    await saveFullConfig(this.storage, this.config, this.currentDeviceName)
    this.emit({ type: 'statusChanged', data: { listening: this.isListening, config: this.config } })
  }

  /**
   * 开启全局监听（手柄组合键与全局键盘钩子）
   */
  public async startListening(deviceIndex?: number): Promise<{ ok: boolean; reason?: string }> {
    if (this.config.screenshotWay === ScreenShotWayEnum.OBS) {
      if (!this.obs.isConnected) {
        const connectRes = await this.obs.connect(
          this.config.obsIp,
          this.config.obsPort,
          this.config.obsPassword
        )
        if (!connectRes.ok) {
          return { ok: false, reason: `OBS connection failed: ${connectRes.error}` }
        }
      }
    }

    const devices = this.gamepad.getConnectedDevices()
    if (devices.length > 0) {
      const idx = deviceIndex !== undefined ? deviceIndex : devices[0]._index
      this.gamepad.openDevice(idx)
      this.currentDeviceName = devices.find((d) => d._index === idx)?.name || ''
    }

    // 启动组合键监听定时器（支持原生 SDL 或 Web Gamepad 注入模式）
    this.gamepad.startListening(this.config.comboKeys, this.config.obsReplayBufferOnLongPress)

    if (this.config.keyboardTrigger) {
      this.keyboard.start()
    }

    this.isListening = true
    this.emit({ type: 'statusChanged', data: { listening: true, config: this.config } })
    return { ok: true }
  }

  public stopListening(): void {
    this.gamepad.stopListening()
    this.keyboard.stop()
    this.isListening = false
    this.emit({ type: 'statusChanged', data: { listening: false, config: this.config } })
  }

  public get listening(): boolean {
    return this.isListening
  }

  /**
   * 执行单次截图
   */
  public async capture(options?: {
    writeClipboard?: (buf: Buffer) => void
    confirmOverwrite?: (filePath: string) => Promise<boolean>
  }): Promise<ScreenshotResult> {
    const opts = options || this.defaultCaptureOptions
    if (this.config.screenshotWay === ScreenShotWayEnum.OBS && this.obs.isConnected) {
      return await this.obs.takeSourceScreenshot(this.config)
    }
    return await performScreenshot(this.config, opts)
  }

  /**
   * 保存 OBS 回放缓存
   */
  public async saveOBSReplay(): Promise<{ ok: boolean; error?: string }> {
    return await this.obs.saveReplayBuffer()
  }

  /**
   * 彻底释放所有底层资源（进程退出或插件卸载）
   */
  public dispose(): void {
    this.stopListening()
    this.gamepad.closeDevice()
    void this.obs.disconnect()
    this.listeners.clear()
  }
}
