import type {
  ScreenshotConfig,
  GamepadDeviceInfo,
  CaptureDisplayInfo,
  CaptureWindowInfo,
  ScreenshotResult,
} from '../../core/types.js'

export type MacPermissionPane = 'screen' | 'accessibility' | 'input' | 'files'

export interface MacOSPermissionsStatus {
  isMac: boolean
  platform: string
  screenCapture: boolean
  screenCaptureStatus?: string
  accessibility: boolean
  inputMonitoring?: boolean
  folderAccess?: boolean
  resolvedSavePath?: string
  folderError?: string
  windowRecognition?: boolean
  detectedWindowsCount?: number
  activeWindowTitle?: string
  windowError?: string
  gamepadAccess?: boolean
  detectedGamepadsCount?: number
  allGranted?: boolean
  checkedAt?: number
}

export interface ScreenshotPermissionTestResult {
  ok: boolean
  granted: boolean
  filePath?: string | null
  previewDataUrl?: string
  width?: number
  height?: number
  sizeBytes?: number
  latencyMs?: number
  isBlackFrame?: boolean
  error?: string
  permissions?: MacOSPermissionsStatus
}

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
  openFolder(path: string): Promise<{ ok: boolean; path?: string; error?: string } | void>

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

  // 平台特性与系统权限（macOS 专用适配与全平台自检）
  readonly isMac?: boolean
  getMacOSPermissions?(options?: { activeProbe?: boolean }): Promise<MacOSPermissionsStatus>
  requestMacOSPermission?(
    target: 'screen' | 'accessibility' | 'input' | 'folder' | 'all',
    options?: { openSettingsIfDenied?: boolean }
  ): Promise<MacOSPermissionsStatus>
  testScreenshotPermission?(config?: ScreenshotConfig): Promise<ScreenshotPermissionTestResult>
  openMacOSPreference?(pane: MacPermissionPane): Promise<void>
  getAutoStart?(): Promise<boolean>
  setAutoStart?(enable: boolean): Promise<boolean>
  showItemInFolder?(path: string): Promise<void>
}
