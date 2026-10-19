export enum ScreenshotSoundEnum {
  None = 'None',
  NS2 = 'NS2',
  PS = 'PS',
}

export enum CommonButtonEnum {
  Home = 'Home',
  L1 = 'L1',
  R1 = 'R1',
  Start = 'Start',
  Select = 'Select',
}

export enum ScreenShotWayEnum {
  DesktopCapturer = 'Default',
  OBS = 'OBS',
}

export enum CaptureTargetTypeEnum {
  Screen = 'screen',
  Window = 'window',
}

export enum ScreenShotSaveWayEnum {
  FileOnly = 'file',
  CilpboardOnly = 'clipboard',
  FileAndCilpboard = 'fileAndClipboard',
}

export type FilenameConflictResolution = 'overwrite' | 'appendTimestamp' | 'notSave' | 'askEveryTime'
export type ListenNotifyPolicy = 'all' | 'start' | 'stop' | 'none'
export type AutoListenResolution = 'never' | 'onAppStart' | 'whenDeviceAvailable'

export interface GamepadDeviceInfo {
  _index: number
  id: string
  name: string
  type?: string
  buttonsCount?: number
  axesCount?: number
  hatsCount?: number
}

export interface CaptureDisplayInfo {
  id: string | number
  name: string
}

export interface CaptureWindowInfo {
  id: string | number
  title: string
  ownerName?: string
  processId?: number
  path?: string
  bounds?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface ActiveWinResult {
  title: string
  id?: number
  bounds?: {
    x: number
    y: number
    width: number
    height: number
  }
  owner?: {
    name: string
    processId: number
    path: string
  }
}

export interface ScreenshotConfig {
  path: string
  comboKeys: string[]
  sound: ScreenshotSoundEnum
  soundPower: number
  screenshotWay: ScreenShotWayEnum
  captureTargetType: CaptureTargetTypeEnum
  screenSourceId: string | number
  windowSourceId: string | number
  screenShotSaveWay: ScreenShotSaveWayEnum
  imageFormat: 'jpg' | 'png'
  fileNameTemplate: string
  saveByActiveWinTitle: boolean
  keyboardTrigger: boolean
  keyboardTriggerKeyCode: number | null
  obsReplayBufferOnLongPress: boolean

  // 系统与扩展配置
  filenameConflictResolution?: FilenameConflictResolution
  listenNotifyPolicy?: ListenNotifyPolicy
  autoListenResolution?: AutoListenResolution
  overlayNotify?: 'show' | 'hide'
  overlayNotifyDuration?: number
  overlayNotifyPosition?: 'left' | 'right'
  overlayNotifySize?: number | string
  autoStart?: boolean
  closeType?: 'exit' | 'tray'
  theme?: 'dark' | 'light'
  accentColor?: string
  uiScale?: number
  locale?: 'zh' | 'en'

  // OBS 凭据
  obsIp?: string
  obsPort?: number
  obsPassword?: string
}

export const DEFAULT_CONFIG: ScreenshotConfig = {
  path: '',
  comboKeys: [],
  sound: ScreenshotSoundEnum.NS2,
  soundPower: 1,
  screenshotWay: ScreenShotWayEnum.DesktopCapturer,
  captureTargetType: CaptureTargetTypeEnum.Screen,
  screenSourceId: '',
  windowSourceId: '',
  screenShotSaveWay: ScreenShotSaveWayEnum.FileOnly,
  imageFormat: 'jpg',
  fileNameTemplate: 'Screenshot_%timestamp%',
  saveByActiveWinTitle: false,
  keyboardTrigger: false,
  keyboardTriggerKeyCode: null,
  obsReplayBufferOnLongPress: false,
  filenameConflictResolution: 'overwrite',
  listenNotifyPolicy: 'all',
  autoListenResolution: 'never',
  overlayNotify: 'show',
  overlayNotifyDuration: 2,
  overlayNotifyPosition: 'left',
  overlayNotifySize: 1,
  autoStart: false,
  closeType: 'exit',
  theme: 'dark',
  accentColor: 'lime',
  uiScale: 1,
  locale: 'zh',
  obsIp: '127.0.0.1',
  obsPort: 4455,
  obsPassword: '',
}

export interface ScreenshotResult {
  ok: boolean
  filePath?: string | null
  error?: string
  timestamp: number
  format: 'jpg' | 'png'
  sizeBytes?: number
}
