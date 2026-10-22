import { createRequire } from 'node:module'
import type { GamepadDeviceInfo } from './types.js'
import { getAllSdlMappingLines, detectController } from '@hibernalglow/gamepad-expressive'

const require = createRequire(import.meta.url)

let sdl: any = null
let sdlLoaded = false

/**
 * 判断当前进程角色是否允许加载原生 @kmamal/sdl 扩展：
 * - 显式禁用 (SHIIN_DISABLE_NATIVE_SDL=1) 时返回 false
 * - 独立的手柄采集 Worker (SHIIN_GAMEPAD_WORKER=1) 或 Electron Utility Process (process.type === 'utility') 允许加载
 * - 纯 Node / CLI 环境 (!process.versions.electron) 允许加载
 * - Electron 主进程 (browser) 与渲染进程 (renderer) 禁止直接加载，防止 macOS Cocoa RunLoop 冲突或主进程崩溃
 */
export function canLoadNativeSdl(
  env: NodeJS.ProcessEnv = typeof process !== 'undefined' ? process.env : {},
  proc: any = typeof process !== 'undefined' ? process : undefined
): boolean {
  if (!proc) return false
  if (env?.SHIIN_DISABLE_NATIVE_SDL === '1') return false
  if (env?.SHIIN_GAMEPAD_WORKER === '1') return true

  const isElectron = Boolean(proc.versions && proc.versions.electron)
  if (!isElectron) return true

  if (proc.type === 'utility') return true
  return false
}

export function resetSdlCacheForTest(): void {
  sdl = null
  sdlLoaded = false
}

function getSdl(): any {
  if (sdlLoaded) return sdl
  sdlLoaded = true

  if (!canLoadNativeSdl()) {
    return null
  }

  try {
    sdl = require('@kmamal/sdl')
    if (sdl && sdl.controller && typeof sdl.controller.addMappings === 'function') {
      try {
        const lines = getAllSdlMappingLines()
        sdl.controller.addMappings(lines)
      } catch (e) {
        console.warn('[GamepadCore] Failed to register SDL GameController mappings:', e)
      }
    }
    return sdl
  } catch (e) {
    console.warn('[GamepadCore] Failed to load @kmamal/sdl:', e)
    return null
  }
}

export type GamepadTriggerCallback = (action: 'screenshot' | 'replayBuffer') => void
export type DeviceChangeCallback = (devices: GamepadDeviceInfo[]) => void

const HAT_DIRECTION_KEYS = ['up', 'right', 'down', 'left']
const TRIGGER_COOLDOWN_MS = 300

const CONTROLLER_BUTTON_INDEX_MAP: Record<string, number> = {
  a: 0,             // A / ✕
  b: 1,             // B / ○
  x: 2,             // X / □
  y: 3,             // Y / △
  leftShoulder: 4,  // LB / L1
  rightShoulder: 5, // RB / R1
  back: 8,          // Back / Share
  start: 9,         // Start / Options
  leftStick: 10,    // L3
  rightStick: 11,   // R3
  dpadUp: 12,       // 十字键 ↑
  dpadDown: 13,     // 十字键 ↓
  dpadLeft: 14,     // 十字键 ←
  dpadRight: 15,    // 十字键 →
  guide: 16,        // Home / PS 键
}

export class GamepadCore {
  private deviceInstance: any = null
  private isControllerDevice = false
  private activeDeviceIndex = 0
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
  private lastTriggerAt = 0

  private onTriggerCallback: GamepadTriggerCallback | null = null
  private onDeviceChangeCallback: DeviceChangeCallback | null = null
  private hasBoundSdlEvents = false

  // 用于在 Electron 主进程中接收来自 Utility Process Worker 或 Web 降级注入的手柄数据
  private virtualDevices: GamepadDeviceInfo[] = []
  private hasWorkerState = false

  constructor() {
    // 延迟到需要时再安全绑定 SDL 全局事件
  }

  public ensureSdlEventsBound(): void {
    if (this.hasBoundSdlEvents) return
    const sdlInstance = getSdl()
    try {
      if (sdlInstance && sdlInstance.controller && typeof sdlInstance.controller.on === 'function') {
        sdlInstance.controller.on('deviceAdd', () => this.notifyDeviceChanged())
        sdlInstance.controller.on('deviceRemove', () => this.notifyDeviceChanged())
      }
      if (sdlInstance && sdlInstance.joystick && typeof sdlInstance.joystick.on === 'function') {
        sdlInstance.joystick.on('deviceAdd', () => this.notifyDeviceChanged())
        sdlInstance.joystick.on('deviceRemove', () => this.notifyDeviceChanged())
      }
      this.hasBoundSdlEvents = true
    } catch (e) {
      console.warn('[GamepadCore] Failed to bind global SDL controller/joystick events:', e)
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

  public getActiveDeviceIndex(): number {
    return this.activeDeviceIndex
  }

  /**
   * 列出所有连接的手柄设备
   */
  public getConnectedDevices(): GamepadDeviceInfo[] {
    if (this.hasWorkerState && this.virtualDevices.length > 0) {
      return this.virtualDevices
    }
    const sdlInstance = getSdl()
    if (!sdlInstance || (!sdlInstance.controller && !sdlInstance.joystick)) {
      return this.virtualDevices
    }
    this.ensureSdlEventsBound()
    try {
      const cDevices = sdlInstance.controller?.devices || []
      const jDevices = sdlInstance.joystick?.devices || []
      const devices = cDevices.length > 0 ? cDevices : jDevices
      return devices.map((d: any, index: number) => {
        const detection = detectController({
          guid: d.guid,
          name: d.name,
          vendorId: d.vendor,
          productId: d.product,
          type: d.type || (cDevices.includes(d) ? 'gamecontroller' : undefined),
          mapping: d.mapping,
        })
        return {
          _index: index,
          id: String(d.id ?? index),
          name: d.name || `Gamepad #${index + 1}`,
          type: d.type || (cDevices.includes(d) ? 'gamecontroller' : undefined),
          guid: d.guid,
          vendorId: d.vendor,
          productId: d.product,
          version: d.version,
          mapping: d.mapping,
          controllerFamily: detection.family,
        }
      })
    } catch {
      return this.virtualDevices
    }
  }

  /**
   * 仅释放物理/虚拟设备句柄，不中断当前的组合键监听状态机
   */
  private releaseDeviceHandle(): void {
    if (this.deviceInstance) {
      try {
        if (typeof this.deviceInstance.removeAllListeners === 'function') {
          this.deviceInstance.removeAllListeners()
        }
        if (typeof this.deviceInstance.close === 'function') {
          this.deviceInstance.close()
        }
      } catch {
        // ignore
      }
      this.deviceInstance = null
    }
    this.isControllerDevice = false
    this.hatStates = []
    this.hatCount = 0
  }

  /**
   * 打开指定序号的手柄设备（若已在监听中则保持监听不中断）
   */
  public openDevice(deviceIndex: number): boolean {
    const targetIndex = Number.isInteger(deviceIndex) && deviceIndex >= 0 ? deviceIndex : 0
    if (this.deviceInstance && this.activeDeviceIndex === targetIndex) {
      return true
    }

    this.releaseDeviceHandle()
    this.activeDeviceIndex = targetIndex

    if (this.hasWorkerState) {
      this.deviceInstance = { index: targetIndex, virtual: true }
      return true
    }

    const sdlInstance = getSdl()
    if (!sdlInstance || (!sdlInstance.controller && !sdlInstance.joystick)) {
      // 在无直接原生 SDL 的宿主进程（例如 Electron 主进程）下，以虚拟设备模式接管，保留已有 Worker 注入的状态
      this.deviceInstance = { index: targetIndex, virtual: true }
      if (!this.hasWorkerState) {
        this.resetDeviceState()
      }
      return true
    }

    try {
      // 1. 优先作为具有 SDL_GameControllerDB 标准映射的 GameController 打开（自动归一化 PS5/PS4/Xbox/Switch 键位）
      const controllerDevices = sdlInstance.controller?.devices || []
      const controllerDevice = controllerDevices[targetIndex] || controllerDevices.find((d: any) => d._index === targetIndex || d.id === targetIndex)
      if (sdlInstance.controller && controllerDevice) {
        this.deviceInstance = sdlInstance.controller.openDevice(controllerDevice)
        this.isControllerDevice = true
        this.resetDeviceState()

        this.deviceInstance.on('buttonDown', (data: { button: string }) => {
          const idx = CONTROLLER_BUTTON_INDEX_MAP[data.button]
          if (idx !== undefined && idx < this.buttons.length) {
            this.buttons[idx] = true
          }
        })

        this.deviceInstance.on('buttonUp', (data: { button: string }) => {
          const idx = CONTROLLER_BUTTON_INDEX_MAP[data.button]
          if (idx !== undefined && idx < this.buttons.length) {
            this.buttons[idx] = false
          }
        })

        this.deviceInstance.on('axisMotion', (data: { axis: string; value: number }) => {
          if (data.axis === 'leftStickX') this.axes[0] = data.value
          else if (data.axis === 'leftStickY') this.axes[1] = data.value
          else if (data.axis === 'rightStickX') this.axes[2] = data.value
          else if (data.axis === 'rightStickY') this.axes[3] = data.value
          else if (data.axis === 'leftTrigger') {
            this.axes[4] = data.value
            this.buttons[6] = data.value >= 0.5
          } else if (data.axis === 'rightTrigger') {
            this.axes[5] = data.value
            this.buttons[7] = data.value >= 0.5
          }
        })

        return true
      }

      // 2. 否则降级为原始 joystick 设备打开
      const sdlDevice = sdlInstance.joystick?.devices?.[targetIndex]
      if (!sdlDevice) {
        this.deviceInstance = { index: targetIndex, virtual: true }
        if (!this.hasWorkerState) {
          this.resetDeviceState()
        }
        return true
      }

      this.deviceInstance = sdlInstance.joystick.openDevice(sdlDevice)
      this.isControllerDevice = false
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
      this.deviceInstance = { index: targetIndex, virtual: true }
      if (!this.hasWorkerState) {
        this.resetDeviceState()
      }
      return true
    }
  }

  /**
   * 关闭当前手柄设备，释放物理句柄并停止监听
   */
  public closeDevice(): void {
    this.stopListening()
    this.releaseDeviceHandle()
  }

  private resetDeviceState(): void {
    if (this.isControllerDevice) {
      this.physicalButtonCount = 17
      this.buttons = new Array(17).fill(false)
      this.axes = new Array(6).fill(0)
      this.hatCount = 0
      this.hatStates = []
      return
    }

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

    if (this.isControllerDevice && this.deviceInstance?.buttons) {
      const b = this.deviceInstance.buttons
      const a = this.deviceInstance.axes || {}
      return [
        Boolean(b.a),
        Boolean(b.b),
        Boolean(b.x),
        Boolean(b.y),
        Boolean(b.leftShoulder),
        Boolean(b.rightShoulder),
        (Number(a.leftTrigger) || 0) >= 0.5,
        (Number(a.rightTrigger) || 0) >= 0.5,
        Boolean(b.back),
        Boolean(b.start),
        Boolean(b.leftStick),
        Boolean(b.rightStick),
        Boolean(b.dpadUp),
        Boolean(b.dpadDown),
        Boolean(b.dpadLeft),
        Boolean(b.dpadRight),
        Boolean(b.guide),
      ]
    }

    let physical = this.buttons.slice()
    try {
      if (Array.isArray(this.deviceInstance.buttons)) {
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
    if (this.isControllerDevice && this.deviceInstance?.axes) {
      const a = this.deviceInstance.axes
      return [
        Number(a.leftStickX) || 0,
        Number(a.leftStickY) || 0,
        Number(a.rightStickX) || 0,
        Number(a.rightStickY) || 0,
        Number(a.leftTrigger) || 0,
        Number(a.rightTrigger) || 0,
      ]
    }
    if (this.deviceInstance?.axes && Array.isArray(this.deviceInstance.axes)) {
      return Array.from(this.deviceInstance.axes)
    }
    return this.axes
  }

  /**
   * 动态更新监听配置（无需中断正在运行的监听定时器）
   */
  public updateComboConfig(comboKeys: string[], obsReplayOnLongPress = false): void {
    this.comboKeys = Array.isArray(comboKeys) ? [...comboKeys] : []
    this.obsReplayOnLongPress = Boolean(obsReplayOnLongPress)
  }

  /**
   * 开始监听组合键
   */
  public startListening(comboKeys: string[], obsReplayOnLongPress = false): void {
    this.updateComboConfig(comboKeys, obsReplayOnLongPress)
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
   * 周期轮询或事件驱动检查按键与轴组合
   */
  public tickCheckCombo(): void {
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

    // 如果未被长按拦截，则在释放时执行截屏（含防抖冷却保护，避免快速按键连发重复截图）
    const shouldScreenshot = !this.comboLongPressHandled
    this.comboPressedAt = 0
    this.comboLongPressHandled = false

    if (shouldScreenshot && this.onTriggerCallback) {
      const now = Date.now()
      if (now - this.lastTriggerAt >= TRIGGER_COOLDOWN_MS) {
        this.lastTriggerAt = now
        this.onTriggerCallback('screenshot')
      }
    }
  }

  private hasDeviceListChanged(nextDevices: GamepadDeviceInfo[]): boolean {
    if (nextDevices.length !== this.virtualDevices.length) return true
    for (let i = 0; i < nextDevices.length; i++) {
      if (
        nextDevices[i]._index !== this.virtualDevices[i]._index ||
        nextDevices[i].id !== this.virtualDevices[i].id ||
        nextDevices[i].name !== this.virtualDevices[i].name
      ) {
        return true
      }
    }
    return false
  }

  /**
   * 注入来自独立 Utility Process 手柄 Worker 的原生手柄状态
   */
  public injectWorkerGamepadState(
    devices: GamepadDeviceInfo[],
    buttons: boolean[],
    axes: number[],
    activeIndex?: number
  ): void {
    this.hasWorkerState = Array.isArray(devices) && devices.length > 0
    if (typeof activeIndex === 'number' && activeIndex >= 0) {
      this.activeDeviceIndex = activeIndex
    }

    const normalizedDevices = Array.isArray(devices) ? devices : []
    const devicesChanged = this.hasDeviceListChanged(normalizedDevices)
    this.virtualDevices = normalizedDevices

    if (Array.isArray(buttons)) {
      this.buttons = buttons
    }
    if (Array.isArray(axes)) {
      this.axes = axes
    }

    if (devicesChanged) {
      this.notifyDeviceChanged()
    }

    if (this.isListening) {
      this.tickCheckCombo()
    }
  }

  /**
   * 注入来自渲染进程（Web Gamepad API）的手柄状态（仅当后台原生 Worker 无可用设备时作为降级来源）
   */
  public injectWebGamepadState(devices: GamepadDeviceInfo[], buttons: boolean[], axes: number[]): void {
    if (this.hasWorkerState && this.virtualDevices.length > 0) {
      return
    }
    if (devices && devices.length > 0) {
      const changed = this.hasDeviceListChanged(devices)
      this.virtualDevices = devices
      if (changed) {
        this.notifyDeviceChanged()
      }
    }
    if (buttons && buttons.length > 0) {
      this.buttons = buttons
    }
    if (axes && axes.length > 0) {
      this.axes = axes
    }
    if (this.isListening) {
      this.tickCheckCombo()
    }
  }
}
