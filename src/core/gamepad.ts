import { createRequire } from 'node:module'
import type { GamepadDeviceInfo } from './types.js'

const require = createRequire(import.meta.url)

let sdl: any = null
let sdlLoaded = false
const isElectron = Boolean(typeof process !== 'undefined' && process.versions && process.versions.electron)

function getSdl(): any {
  if (sdlLoaded) return sdl
  sdlLoaded = true

  // 在 Electron 环境下，@kmamal/sdl 原生 Addon 若未针对 Electron 特殊重编译，直接载入可能触发底层 RunLoop 崩溃
  // 故在 Electron 主进程中做安全环境检测
  if (isElectron) {
    return null
  }

  try {
    sdl = require('@kmamal/sdl')
    return sdl
  } catch (e) {
    console.warn('[GamepadCore] Failed to load @kmamal/sdl:', e)
    return null
  }
}

export type GamepadTriggerCallback = (action: 'screenshot' | 'replayBuffer') => void
export type DeviceChangeCallback = (devices: GamepadDeviceInfo[]) => void

const HAT_DIRECTION_KEYS = ['up', 'right', 'down', 'left']

export class GamepadCore {
  private deviceInstance: any = null
  private buttons: boolean[] = new Array(20).fill(false)
  private axes: number[] = new Array(10).fill(0)
  private hatStates: string[] = []
  private hatCount = 0
  private physicalButtonCount = 20

  private comboKeys: string[] = []
  private isListening = false
  private pollInterval: NodeJS.Timeout | null = null

  private comboPressedAt = 0
  private comboLongPressHandled = false
  private obsReplayOnLongPress = false

  private onTriggerCallback: GamepadTriggerCallback | null = null
  private onDeviceChangeCallback: DeviceChangeCallback | null = null
  private hasBoundSdlEvents = false

  // 用于在 Electron 等无原生 SDL 环境下由外部或渲染进程注入手柄数据
  private virtualDevices: GamepadDeviceInfo[] = []

  constructor() {
    // 延迟到需要时再安全绑定 SDL 全局事件
  }

  public ensureSdlEventsBound(): void {
    if (this.hasBoundSdlEvents) return
    const sdlInstance = getSdl()
    try {
      if (sdlInstance && sdlInstance.joystick && typeof sdlInstance.joystick.on === 'function') {
        sdlInstance.joystick.on('deviceAdd', () => {
          this.notifyDeviceChanged()
        })
        sdlInstance.joystick.on('deviceRemove', () => {
          this.notifyDeviceChanged()
        })
        this.hasBoundSdlEvents = true
      }
    } catch (e) {
      console.warn('[GamepadCore] Failed to bind global SDL joystick events:', e)
    }
  }

  private notifyDeviceChanged(): void {
    if (this.onDeviceChangeCallback) {
      this.onDeviceChangeCallback(this.getConnectedDevices())
    }
  }

  public onTrigger(cb: GamepadTriggerCallback): void {
    this.onTriggerCallback = cb
  }

  public onDeviceChange(cb: DeviceChangeCallback): void {
    this.onDeviceChangeCallback = cb
  }

  /**
   * 列出所有连接的手柄设备
   */
  public getConnectedDevices(): GamepadDeviceInfo[] {
    const sdlInstance = getSdl()
    if (!sdlInstance || !sdlInstance.joystick) {
      return this.virtualDevices
    }
    this.ensureSdlEventsBound()
    try {
      const devices = sdlInstance.joystick.devices || []
      return devices.map((d: any, index: number) => ({
        _index: index,
        id: String(d.id || index),
        name: d.name || `Gamepad #${index + 1}`,
        type: d.type,
      }))
    } catch {
      return this.virtualDevices
    }
  }

  /**
   * 打开指定序号的手柄设备
   */
  public openDevice(deviceIndex: number): boolean {
    this.closeDevice()

    const sdlInstance = getSdl()
    if (!sdlInstance || !sdlInstance.joystick) {
      return false
    }

    try {
      const sdlDevice = sdlInstance.joystick.devices[deviceIndex]
      if (!sdlDevice) return false

      this.deviceInstance = sdlInstance.joystick.openDevice(sdlDevice)
      this.resetDeviceState()

      this.deviceInstance.on('buttonDown', (data: { button: number }) => {
        if (data.button < this.buttons.length) {
          this.buttons[data.button] = true
        }
      })

      this.deviceInstance.on('buttonUp', (data: { button: number }) => {
        if (data.button < this.buttons.length) {
          this.buttons[data.button] = false
        }
      })

      this.deviceInstance.on('hatMotion', (data: { hat: number; value: string }) => {
        const idx = Number.isInteger(data.hat) ? data.hat : 0
        if (idx >= 0 && idx < this.hatCount) {
          this.hatStates[idx] = data.value
        }
      })

      this.deviceInstance.on('axisMotion', (data: { axis: number; value: number }) => {
        if (data.axis < this.axes.length) {
          this.axes[data.axis] = data.value
        }
      })

      return true
    } catch (err) {
      console.error('[GamepadCore] Open SDL2 device failed:', err)
      return false
    }
  }

  /**
   * 关闭当前手柄设备，释放物理句柄
   */
  public closeDevice(): void {
    this.stopListening()
    if (this.deviceInstance) {
      try {
        this.deviceInstance.removeAllListeners()
        this.deviceInstance.close()
      } catch {
        // ignore
      }
      this.deviceInstance = null
    }
    this.hatStates = []
    this.hatCount = 0
  }

  private resetDeviceState(): void {
    const bCount = this.deviceInstance?.buttons?.length || 20
    this.physicalButtonCount = bCount
    this.buttons = new Array(bCount).fill(false)

    const aCount = this.deviceInstance?.axes?.length || 10
    this.axes = new Array(aCount).fill(0)

    const hCount = this.deviceInstance?.hats?.length || 0
    this.hatCount = hCount
    this.hatStates = new Array(hCount).fill('centered')
  }

  /**
   * 将 hat 位置展开为 [上, 右, 下, 左]
   */
  private hatValueToDirections(val: string): boolean[] {
    const directions = [false, false, false, false]
    const v = String(val || 'centered').toLowerCase()
    if (v === 'centered') return directions
    for (let i = 0; i < HAT_DIRECTION_KEYS.length; i++) {
      if (v.includes(HAT_DIRECTION_KEYS[i])) {
        directions[i] = true
      }
    }
    return directions
  }

  private flattenHatStates(): boolean[] {
    const result: boolean[] = []
    for (let i = 0; i < this.hatCount; i++) {
      result.push(...this.hatValueToDirections(this.hatStates[i]))
    }
    return result
  }

  /**
   * 获取当前全部按键状态（物理按键 + 十字键虚拟按键）
   */
  public getCurrentButtons(): boolean[] {
    if (!this.deviceInstance) return this.buttons

    let physical = this.buttons.slice()
    try {
      if (this.deviceInstance.buttons) {
        physical = Array.from(this.deviceInstance.buttons)
      }
    } catch {
      // ignore
    }

    if (this.hatCount > 0) {
      return physical.concat(this.flattenHatStates())
    }
    return physical
  }

  public getCurrentAxes(): number[] {
    if (this.deviceInstance?.axes) {
      return Array.from(this.deviceInstance.axes)
    }
    return this.axes
  }

  /**
   * 开始监听组合键
   */
  public startListening(comboKeys: string[], obsReplayOnLongPress = false): void {
    this.comboKeys = comboKeys
    this.obsReplayOnLongPress = obsReplayOnLongPress
    this.isListening = true

    if (this.pollInterval) clearInterval(this.pollInterval)
    this.pollInterval = setInterval(() => this.tickCheckCombo(), 50)
  }

  public stopListening(): void {
    this.isListening = false
    this.comboPressedAt = 0
    this.comboLongPressHandled = false
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
  }

  public get listening(): boolean {
    return this.isListening
  }

  /**
   * 周期轮询按键与轴组合
   */
  private tickCheckCombo(): void {
    if (!this.isListening || this.comboKeys.length === 0) return

    const currentButtons = this.getCurrentButtons()
    const currentAxes = this.getCurrentAxes()

    let matched = true
    for (const key of this.comboKeys) {
      if (key.startsWith('Button')) {
        const idx = Number(key.replace('Button', ''))
        if (!currentButtons[idx]) {
          matched = false
          break
        }
      } else if (key.startsWith('Axis')) {
        const match = key.match(/^Axis\s*(\d+)\s*([+-])$/i)
        if (match) {
          const axisIdx = Number(match[1])
          const dir = match[2]
          const val = currentAxes[axisIdx] ?? 0
          if (dir === '+' && val < 0.85) matched = false
          else if (dir === '-' && val > -0.85) matched = false
        } else {
          matched = false
        }
        if (!matched) break
      }
    }

    if (matched) {
      this.onComboPressed()
    } else {
      this.onComboReleased()
    }
  }

  private onComboPressed(): void {
    if (!this.comboPressedAt) {
      this.comboPressedAt = Date.now()
      this.comboLongPressHandled = false
      return
    }

    // 长按检测（>=1000ms 触发 OBS 录屏回放缓存）
    if (
      this.obsReplayOnLongPress &&
      !this.comboLongPressHandled &&
      Date.now() - this.comboPressedAt >= 1000
    ) {
      this.comboLongPressHandled = true
      if (this.onTriggerCallback) {
        this.onTriggerCallback('replayBuffer')
      }
    }
  }

  private onComboReleased(): void {
    if (!this.comboPressedAt) return

    // 如果未被长按拦截，则在释放时执行截屏
    const shouldScreenshot = !this.comboLongPressHandled
    this.comboPressedAt = 0
    this.comboLongPressHandled = false

    if (shouldScreenshot && this.onTriggerCallback) {
      this.onTriggerCallback('screenshot')
    }
  }

  /**
   * 注入来自渲染进程（Web Gamepad API）的手柄状态
   */
  public injectWebGamepadState(devices: GamepadDeviceInfo[], buttons: boolean[], axes: number[]): void {
    if (devices && devices.length > 0) {
      this.virtualDevices = devices
    }
    if (buttons && buttons.length > 0) {
      this.buttons = buttons
    }
    if (axes && axes.length > 0) {
      this.axes = axes
    }
  }
}

