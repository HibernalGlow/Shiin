/**
 * 独立手柄输入采集 Worker (运行于 Electron utilityProcess.fork 隔离进程)
 * 职责：
 * 1. 在独立进程中加载 @kmamal/sdl，避免与 Electron 主进程 Cocoa RunLoop 冲突或拖垮主进程
 * 2. 持续采集物理手柄连接列表、按钮（含十字键展开）与摇杆轴状态
 * 3. 通过 parentPort 向 Electron 主进程推送去重后的状态快照，即使主窗口销毁（轻量模式）也持续工作
 */
process.env.SHIIN_GAMEPAD_WORKER = '1'

import { GamepadCore } from '../../core/gamepad.js'
import type { GamepadDeviceInfo } from '../../core/types.js'

const gamepad = new GamepadCore()

let activeDeviceIndex = 0
let hasOpenedDevice = false
let openedDeviceId = ''
let lastDevicesSig = ''
let lastButtonsSig = ''
let lastAxes: number[] = []
let pollTimer: NodeJS.Timeout | null = null

const parentPort: any = (process as any).parentPort

function postToMain(payload: Record<string, unknown>): void {
  try {
    if (parentPort && typeof parentPort.postMessage === 'function') {
      parentPort.postMessage(payload)
    } else if (typeof process.send === 'function') {
      process.send(payload)
    }
  } catch {
    // ignore channel closed during shutdown
  }
}

function getDevicesSignature(devices: GamepadDeviceInfo[]): string {
  return devices.map((d) => `${d._index}:${d.id}:${d.name}`).join('|')
}

function haveAxesChanged(prev: number[], next: number[]): boolean {
  if (prev.length !== next.length) return true
  for (let i = 0; i < next.length; i++) {
    if (Math.abs((prev[i] ?? 0) - (next[i] ?? 0)) > 0.008) {
      return true
    }
  }
  return false
}

function ensureDeviceOpened(devices: GamepadDeviceInfo[]): void {
  if (devices.length === 0) {
    if (hasOpenedDevice) {
      gamepad.closeDevice()
      hasOpenedDevice = false
      openedDeviceId = ''
    }
    return
  }

  const target = devices.find((d) => d._index === activeDeviceIndex) || devices[0]
  const targetKey = `${target._index}:${target.id}`
  if (!hasOpenedDevice || openedDeviceId !== targetKey) {
    activeDeviceIndex = target._index
    gamepad.openDevice(activeDeviceIndex)
    hasOpenedDevice = true
    openedDeviceId = targetKey
  }
}

function pollGamepadState(forceEmit = false): void {
  const devices = gamepad.getConnectedDevices()
  ensureDeviceOpened(devices)

  const buttons = devices.length > 0 ? gamepad.getCurrentButtons() : []
  const axes = devices.length > 0 ? gamepad.getCurrentAxes() : []

  const devicesSig = getDevicesSignature(devices)
  const buttonsSig = buttons.map((b) => (b ? '1' : '0')).join('')
  const axesChanged = haveAxesChanged(lastAxes, axes)

  if (
    forceEmit ||
    devicesSig !== lastDevicesSig ||
    buttonsSig !== lastButtonsSig ||
    axesChanged
  ) {
    lastDevicesSig = devicesSig
    lastButtonsSig = buttonsSig
    lastAxes = axes.slice()

    postToMain({
      type: 'state',
      devices,
      activeIndex: activeDeviceIndex,
      buttons,
      axes,
    })
  }
}

function handleCommand(msg: any): void {
  if (!msg || typeof msg !== 'object') return

  switch (msg.type) {
    case 'open-device': {
      const nextIdx = typeof msg.index === 'number' && msg.index >= 0 ? msg.index : 0
      activeDeviceIndex = nextIdx
      hasOpenedDevice = false
      openedDeviceId = ''
      pollGamepadState(true)
      break
    }
    case 'close-device': {
      gamepad.closeDevice()
      hasOpenedDevice = false
      openedDeviceId = ''
      pollGamepadState(true)
      break
    }
    case 'sync': {
      pollGamepadState(true)
      break
    }
    case 'dispose': {
      if (pollTimer) {
        clearInterval(pollTimer)
        pollTimer = null
      }
      gamepad.closeDevice()
      process.exit(0)
      break
    }
  }
}

// 绑定 SDL 设备热插拔通知
gamepad.onDeviceChange(() => {
  hasOpenedDevice = false
  openedDeviceId = ''
  pollGamepadState(true)
})

if (parentPort && typeof parentPort.on === 'function') {
  parentPort.on('message', (event: any) => {
    handleCommand(event?.data ?? event)
  })
} else {
  process.on('message', (msg) => {
    handleCommand(msg)
  })
}

// 启动初期立即推送一次状态，随后以 ~60Hz 采样物理手柄输入
pollGamepadState(true)
pollTimer = setInterval(() => {
  pollGamepadState(false)
}, 16)
