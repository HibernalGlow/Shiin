import type {
  ScreenshotConfig,
  GamepadDeviceInfo,
  CaptureDisplayInfo,
  CaptureWindowInfo,
  ScreenshotResult,
} from '../../core/types.js'

export interface IHostBridge {
  readonly hostType: 'electron' | 'xaihi' | 'mock'

  // 配置存取
  getStore<T>(key: string, defaultValue: T): Promise<T>
  setStore<T>(key: string, value: T): Promise<void>

  // 设备与输入
  getConnectedGamepads(): Promise<GamepadDeviceInfo[]>
  openGamepad(device: GamepadDeviceInfo): Promise<boolean>
  closeGamepad(): Promise<void>
  getCurrentButtons(): Promise<boolean[]>
  getCurrentAxes(): Promise<number[]>

  // 截屏动作与环境查询
  getScreenSources(): Promise<CaptureDisplayInfo[]>
  getCaptureWindows(): Promise<CaptureWindowInfo[]>
  capture(config: ScreenshotConfig): Promise<ScreenshotResult | null>
  selectFolder(): Promise<string | null>
  openFolder(path: string): Promise<void>

  // 监听管理
  startListening(config: ScreenshotConfig): Promise<boolean>
  stopListening(): Promise<void>
  onListeningStateChanged(cb: (isListening: boolean) => void): () => void

  // 托盘与窗口控制（仅独立桌面端可用，Xaihi 面板下静默安全降级）
  minimizeWindow?(): void
  toggleMaximizeWindow?(): Promise<boolean>
  closeWindow?(): void
  setUiScale?(scale: number): Promise<number>
  showNotification?(title: string, body: string, img?: string): void

  // OBS 联动
  connectOBS?(ip: string, port: number, password?: string): Promise<{ ok: boolean; error?: string }>
  saveOBSReplay?(): Promise<{ ok: boolean; error?: string }>

  // 外部链接与更新检测
  openExternal?(url: string): Promise<void>
  checkForUpdates?(): Promise<{ hasUpdate: boolean; latestVersion: string; releaseUrl?: string } | null>
  clearLogFiles?(): Promise<{ ok: boolean; removed: number }>

  // 平台特性与系统权限（macOS 专用适配）
  readonly isMac?: boolean
  getMacOSPermissions?(): Promise<{ isMac: boolean; screenCapture: boolean; accessibility: boolean }>
  openMacOSPreference?(pane: 'screen' | 'accessibility'): Promise<void>
  getAutoStart?(): Promise<boolean>
  setAutoStart?(enable: boolean): Promise<boolean>
  showItemInFolder?(path: string): Promise<void>
}
