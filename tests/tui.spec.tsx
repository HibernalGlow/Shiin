/* @jsxImportSource @opentui/react */
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { describe, expect, it, vi } from 'vitest'

// TUI 自带 1s 时钟与 80ms 手柄轮询，天生会在 act 之外更新状态；这条测试断言的是帧内容，不是 act 语义。
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = false

import type { ScreenshotManager } from '../src/core/index.js'
import { CaptureTargetTypeEnum, DEFAULT_CONFIG, type ScreenshotConfig } from '../src/core/types.js'

/**
 * 动作层被 mock：这条测试量的是"TUI 画得对不对、按键有没有接上"，
 * 不是"截图像不像"——后者要真实的屏幕权限与原生后端，属于手动验收。
 */
vi.mock('../src/app/cli/actions.js', () => ({
  collectContext: async () => ({
    config: { ...DEFAULT_CONFIG, comboKeys: ['Button0', 'Button7'], path: '/tmp/shots' },
    deviceCount: 1,
    screenCount: 2,
    windowCount: 2,
    windows: [
      { id: 21, title: 'Elden Ring', ownerName: 'Game' },
      { id: 22, title: 'Settings', ownerName: 'Shiin' },
    ],
    activeDeviceName: 'DualSense Wireless Controller',
    obsConnected: false,
    listening: false,
  }),
  executeCapture: async () => ({
    success: true,
    message: '截图已保存',
    lines: ['/tmp/shots/a.png', 'PNG · 1.2 MB'],
  }),
  executeReplay: async () => ({ success: false, message: 'OBS 回放保存失败', lines: ['OBS is not connected'] }),
  executeListen: async () => ({ success: true, message: '监听中', lines: ['监听中，按手柄组合键即可截图'] }),
  inspectDevices: async () => ({
    devices: [{ _index: 0, id: 'dualsense', name: 'DualSense Wireless Controller', buttonsCount: 18, axesCount: 8 }],
    screens: [{ id: 2, name: 'Monitor #1 (2560×1440)' }],
    windows: [],
  }),
}))

const { ShiinTui } = await import('../src/app/cli/tui/app.js')

interface PadState {
  buttons: boolean[]
  axes: number[]
}

function idlePad(): PadState {
  return {
    buttons: [true, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    axes: [0, 0.42, -0.91, 1, -1, 0.1],
  }
}

function stubManager(pad: PadState = idlePad(), overrides: Partial<ScreenshotConfig> = {}): ScreenshotManager {
  return {
    config: { ...DEFAULT_CONFIG, comboKeys: ['Button0', 'Button7'], path: '/tmp/shots', ...overrides },
    listening: false,
    gamepad: {
      getCurrentButtons: () => pad.buttons.slice(),
      getCurrentAxes: () => pad.axes.slice(),
      getConnectedDevices: () => [{ _index: 0, id: 'dualsense', name: 'DualSense Wireless Controller', buttonsCount: 18, axesCount: 8 }],
      openDevice: () => true,
    },
    obs: { isConnected: false },
    subscribe: () => () => undefined,
    capture: async () => ({ ok: true, filePath: '/tmp/shots/a.png', timestamp: Date.now(), format: 'png', sizeBytes: 1024 }),
    startListening: async () => ({ ok: true }),
    stopListening: () => undefined,
    saveConfig: async () => undefined,
    syncConfig: () => undefined,
    saveOBSReplay: async () => ({ ok: true }),
    dispose: () => undefined,
    init: async () => undefined,
  } as unknown as ScreenshotManager
}

/**
 * OpenTUI 的测试渲染器仍然要经 FFI 加载 Zig 原生库（`createTestRenderer` 内部会 new CliRenderer），
 * 所以这条测试只在 Node ≥ 26（有 `node:ffi`）或 bun 上跑；Node 22 上跳过而不是伪造一个假渲染器。
 */
const ffiAvailable = await (async () => {
  const versions = process.versions as Record<string, string | undefined>
  if (versions.bun) return true
  // 不能只看版本号：Windows 的 Node 26 就没有 node:ffi（ERR_UNKNOWN_BUILTIN_MODULE）。
  // Vite 会把动态 `import('node:ffi')` 当成可解析模块并剥掉 node: 前缀，所以这里用 createRequire 探真实的 Node 内建。
  try {
    const { createRequire } = await import('node:module')
    createRequire(import.meta.url)('node:ffi')
    return true
  } catch {
    return false
  }
})()

describe.skipIf(!ffiAvailable)('Shiin TUI', () => {
  it('shows the focused window mode without requiring a window pick', async () => {
    const setup = await testRender(
      <ShiinTui
        manager={stubManager(idlePad(), {
          captureTargetType: CaptureTargetTypeEnum.Window,
          windowCaptureMode: 'focused',
        })}
        language="zh"
        theme="nord"
        onExit={() => undefined}
      />,
      { width: 120, height: 42 },
    )

    try {
      await setup.flush()
      expect(setup.captureCharFrame()).toContain('聚焦窗口')

      await act(async () => {
        setup.mockInput.pressKey('s')
        await new Promise((resolve) => setTimeout(resolve, 100))
      })
      await setup.flush()
      const settings = setup.captureCharFrame()
      expect(settings).toContain('窗口来源')
      expect(settings).toContain('聚焦窗口')
      expect(settings).toContain('截图时捕获当前聚焦的前台窗口')
    } finally {
      await setup.dispose()
    }
  })

  it('lists capturable windows only when the target is pinned', async () => {
    const setup = await testRender(
      <ShiinTui
        manager={stubManager(idlePad(), {
          captureTargetType: CaptureTargetTypeEnum.Window,
          windowCaptureMode: 'specified',
          windowSourceId: 21,
        })}
        language="zh"
        theme="nord"
        onExit={() => undefined}
      />,
      { width: 120, height: 42 },
    )

    try {
      await setup.flush()
      await act(async () => {
        setup.mockInput.pressKey('s')
        await new Promise((resolve) => setTimeout(resolve, 100))
      })
      await setup.flush()
      const settings = setup.captureCharFrame()
      if (process.env.DEBUG_TUI) console.log(settings)
      expect(settings).toContain('指定窗口')
      expect(settings).toContain('Elden Ring')
    } finally {
      await setup.dispose()
    }
  })

  it('paints the workbench chrome and wires the C key to a capture', async () => {
    const pad: PadState = { buttons: new Array(18).fill(false), axes: new Array(6).fill(0) }
    const setup = await testRender(<ShiinTui manager={stubManager(pad)} language="zh" theme="nord" onExit={() => undefined} />, {
      width: 120,
      height: 42,
    })

    try {
      await setup.flush()
      const initial = setup.captureCharFrame()
      if (process.env.DEBUG_TUI) console.log(initial)
      expect(initial).toContain('SHIIN // GAMEPAD CAPTURE CONTROL PLANE')
      expect(initial).toContain('实时输入')
      expect(initial).toContain('截图与回放')
      expect(initial).toContain('DualSense Wireless Controller')
      expect(initial).toContain('B0')
      expect(initial).toContain('Space')
      expect(initial).toContain('截聚焦窗口')
      expect(initial).toContain('窗口子目录')
      expect(initial).toContain('日志')
      expect(initial).toContain('等待执行')

      await act(async () => {
        setup.mockInput.pressKey('w')
        await new Promise((resolve) => setTimeout(resolve, 200))
      })
      await setup.flush()

      const afterFocusedCapture = setup.captureCharFrame()
      expect(afterFocusedCapture).toContain('截图已保存')
      expect(afterFocusedCapture).toContain('/tmp/shots/a.png')

      await act(async () => {
        setup.mockInput.pressKey('c')
        // 状态更新在 promise 里落地，给事件循环一个真实的 tick；只 flush 帧不够。
        await new Promise((resolve) => setTimeout(resolve, 200))
      })
      await setup.flush()

      const afterCapture = setup.captureCharFrame()
      expect(afterCapture).toContain('截图已保存')
      expect(afterCapture).toContain('/tmp/shots/a.png')
      expect(afterCapture).toContain('最近一次结果')

      await act(async () => {
        setup.mockInput.pressKey('s')
        await new Promise((resolve) => setTimeout(resolve, 100))
      })
      await setup.flush()
      const settings = setup.captureCharFrame()
      if (process.env.DEBUG_TUI) console.log(settings)
      expect(settings).toContain('保存配置')
      expect(settings).toContain('保存目录')
      expect(settings).toContain('保存到窗口名文件夹')
      expect(settings).toContain('录制组合键')
      expect(settings).toContain('Button0 + Button7')
      expect(settings).toContain('清空')

      // 录制：按 R 进入，模拟按下手柄按键，静置 1.2 秒后自动保存。
      await act(async () => {
        setup.mockInput.pressKey('r')
        await new Promise((resolve) => setTimeout(resolve, 120))
      })
      pad.buttons[2] = true
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 250))
      })
      await setup.flush()
      expect(setup.captureCharFrame()).toContain('录制中')

      pad.buttons[2] = false
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1600))
      })
      await setup.flush()

      await act(async () => {
        setup.mockInput.pressEscape()
        await new Promise((resolve) => setTimeout(resolve, 150))
      })
      await setup.flush()
      const dashboard = setup.captureCharFrame()
      expect(dashboard).toContain('实时输入')
      expect(dashboard).toContain('组合键已保存')

      await act(async () => {
        setup.mockInput.pressKey('f')
        await new Promise((resolve) => setTimeout(resolve, 150))
      })
      await setup.flush()
      const afterToggleFolder = setup.captureCharFrame()
      expect(afterToggleFolder).toContain('保存到窗口名文件夹: 开启')
    } finally {
      await setup.dispose()
    }
  })
})
