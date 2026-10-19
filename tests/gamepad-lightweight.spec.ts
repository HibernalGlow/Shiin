import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { canLoadNativeSdl, GamepadCore } from '../src/core/gamepad.js'
import { ScreenshotManager, MemoryConfigStorage } from '../src/core/index.js'

describe('GamepadCore SDL role isolation & lightweight background combo engine', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('enforces explicit process role checks in canLoadNativeSdl', () => {
    // 1. Electron main process (browser) -> blocked
    expect(
      canLoadNativeSdl({}, { versions: { electron: '28.3.3' }, type: 'browser' })
    ).toBe(false)

    // 2. Electron renderer process -> blocked
    expect(
      canLoadNativeSdl({}, { versions: { electron: '28.3.3' }, type: 'renderer' })
    ).toBe(false)

    // 3. Electron Utility Process (utilityProcess.fork) -> allowed
    expect(
      canLoadNativeSdl({}, { versions: { electron: '28.3.3' }, type: 'utility' })
    ).toBe(true)

    // 4. Dedicated Gamepad Worker env flag -> allowed even inside Electron runtime
    expect(
      canLoadNativeSdl({ SHIIN_GAMEPAD_WORKER: '1' }, { versions: { electron: '28.3.3' }, type: 'browser' })
    ).toBe(true)

    // 5. Pure Node / CLI -> allowed
    expect(
      canLoadNativeSdl({}, { versions: { node: '22.0.0' } })
    ).toBe(true)

    // 6. Explicit disable override -> blocked everywhere
    expect(
      canLoadNativeSdl({ SHIIN_DISABLE_NATIVE_SDL: '1', SHIIN_GAMEPAD_WORKER: '1' }, { versions: { electron: '28.3.3' }, type: 'utility' })
    ).toBe(false)
  })

  it('triggers screenshot from worker-injected gamepad state without UI and ignores web fallback when worker is active', () => {
    const core = new GamepadCore()
    const triggers: string[] = []
    core.onTrigger((action) => triggers.push(action))

    core.startListening(['Button4', 'Button5'], false)

    const workerDevices = [{ _index: 0, id: 'sdl-0', name: 'Xbox Wireless Controller' }]
    const idleButtons = new Array(20).fill(false)
    const pressedButtons = new Array(20).fill(false)
    pressedButtons[4] = true
    pressedButtons[5] = true

    // Worker injects combo pressed
    core.injectWorkerGamepadState(workerDevices, pressedButtons, [0, 0])
    expect(core.getConnectedDevices()).toEqual(workerDevices)

    // Web fallback tries to overwrite with empty buttons while worker is active -> must be ignored
    core.injectWebGamepadState([{ _index: 0, id: 'web-0', name: 'Web Gamepad' }], idleButtons, [0, 0])
    expect(core.getCurrentButtons()[4]).toBe(true)
    expect(core.getCurrentButtons()[5]).toBe(true)

    // Release combo -> triggers screenshot once
    vi.advanceTimersByTime(100)
    core.injectWorkerGamepadState(workerDevices, idleButtons, [0, 0])
    expect(triggers).toEqual(['screenshot'])

    // Rapid bounce within 300ms cooldown -> does not double-trigger
    vi.advanceTimersByTime(50)
    core.injectWorkerGamepadState(workerDevices, pressedButtons, [0, 0])
    vi.advanceTimersByTime(50)
    core.injectWorkerGamepadState(workerDevices, idleButtons, [0, 0])
    expect(triggers).toEqual(['screenshot'])

    // After 300ms cooldown -> triggers normally again
    vi.advanceTimersByTime(350)
    core.injectWorkerGamepadState(workerDevices, pressedButtons, [0, 0])
    vi.advanceTimersByTime(80)
    core.injectWorkerGamepadState(workerDevices, idleButtons, [0, 0])
    expect(triggers).toEqual(['screenshot', 'screenshot'])

    core.closeDevice()
  })

  it('triggers replayBuffer on long press (>=1000ms) and does not trigger screenshot on release', () => {
    const core = new GamepadCore()
    const triggers: string[] = []
    core.onTrigger((action) => triggers.push(action))

    core.startListening(['Button0'], true)

    const workerDevices = [{ _index: 0, id: 'sdl-0', name: 'DualSense' }]
    const pressed = new Array(20).fill(false)
    pressed[0] = true
    const released = new Array(20).fill(false)

    core.injectWorkerGamepadState(workerDevices, pressed, [])
    vi.advanceTimersByTime(1050)
    core.tickCheckCombo()
    expect(triggers).toEqual(['replayBuffer'])

    // Release after long press -> should NOT trigger screenshot
    core.injectWorkerGamepadState(workerDevices, released, [])
    expect(triggers).toEqual(['replayBuffer'])

    core.closeDevice()
  })

  it('preserves active listening state when openDevice or syncConfig is called during window recreation', async () => {
    const manager = new ScreenshotManager(new MemoryConfigStorage())
    await manager.init()
    manager.syncConfig({ comboKeys: ['Button1'] })

    const startRes = await manager.startListening(0)
    expect(startRes.ok).toBe(true)
    expect(manager.listening).toBe(true)

    // Simulate UI reopening after Lightweight Mode and calling openDevice(0) or syncConfig
    manager.gamepad.openDevice(0)
    expect(manager.listening).toBe(true)
    expect(manager.gamepad.listening).toBe(true)

    manager.syncConfig({ comboKeys: ['Button2', 'Button3'] })
    expect(manager.listening).toBe(true)
    expect(manager.gamepad.listening).toBe(true)

    manager.dispose()
  })
})
