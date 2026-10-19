/* @jsxImportSource @opentui/react */
import * as React from 'react'

// React 18 -> 19 reconciler compatibility shim for @opentui/react
const anyReact = React as any
if (!anyReact.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE) {
  anyReact.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = {
    ...anyReact.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
    S: null,
    A: null,
    T: null,
    H: null,
  }
}

import { createCliRenderer } from '@opentui/core'
import { createRoot, useKeyboard } from '@opentui/react'
import type { ReadStream, WriteStream } from 'node:tty'
import { ScreenshotManager } from '../../core/index.js'

export interface ShiinTuiProps {
  manager: ScreenshotManager
  onExit: () => void
}

export function ShiinTui({ manager, onExit }: ShiinTuiProps): React.ReactNode {
  const [listening, setListening] = React.useState<boolean>(manager.listening)
  const [logs, setLogs] = React.useState<string[]>([])
  const [buttons, setButtons] = React.useState<boolean[]>([])
  const [axes, setAxes] = React.useState<number[]>([])
  const [devices, setDevices] = React.useState(manager.gamepad.getConnectedDevices())

  React.useEffect(() => {
    const unsub = manager.subscribe((ev) => {
      if (ev.type === 'screenshot') {
        const msg = ev.data?.ok
          ? `[SCREENSHOT OK] ${ev.data.filePath || 'Clipboard'}`
          : `[SCREENSHOT FAILED] ${ev.data?.error}`
        setLogs((prev) => [msg, ...prev].slice(0, 8))
      } else if (ev.type === 'replayBuffer') {
        setLogs((prev) => ['[OBS REPLAY BUFFER SAVED]', ...prev].slice(0, 8))
      } else if (ev.type === 'deviceChanged') {
        setDevices(manager.gamepad.getConnectedDevices())
      }
    })

    const interval = setInterval(() => {
      setButtons(manager.gamepad.getCurrentButtons())
      setAxes(manager.gamepad.getCurrentAxes())
    }, 80)

    return () => {
      unsub()
      clearInterval(interval)
    }
  }, [manager])

  useKeyboard((key) => {
    if (key.name === 'q' || key.name === 'escape') {
      onExit()
    } else if (key.name === 'space') {
      if (listening) {
        manager.stopListening()
        setListening(false)
        setLogs((p) => ['[LISTENER STOPPED]', ...p].slice(0, 8))
      } else {
        void manager.startListening().then((res) => {
          setListening(res.ok)
          setLogs((p) => [res.ok ? '[LISTENER ACTIVE]' : `[FAILED] ${res.reason}`, ...p].slice(0, 8))
        })
      }
    } else if (key.name === 'c') {
      void manager.capture().then((res) => {
        setLogs((p) => [res.ok ? `[MANUAL CAPTURE] ${res.filePath}` : `[FAILED] ${res.error}`, ...p].slice(0, 8))
      })
    } else if (key.name === 'r') {
      void manager.saveOBSReplay().then((res) => {
        setLogs((p) => [res.ok ? `[OBS REPLAY SAVED]` : `[REPLAY FAILED] ${res.error}`, ...p].slice(0, 8))
      })
    }
  })

  const activeDeviceName = devices[0]?.name || 'No gamepad connected'

  return (
    <box width="100%" height="100%" flexDirection="column" paddingLeft={1} paddingRight={1}>
      {/* 顶栏 Header */}
      <box height={3} borderStyle="single" borderColor="cyan" paddingLeft={1} paddingRight={1} flexDirection="row" justifyContent="space-between">
        <box flexDirection="column">
          <text fg="cyan"><b>◆ SHIIN // GAMEPAD SCREENSHOT TERMINAL TUI</b></text>
          <text fg="gray">{activeDeviceName} · {listening ? '🟢 LISTENING' : '⚪ IDLE'}</text>
        </box>
        <box flexDirection="row">
          <text fg="gray">按 [Space] 开关监听 · [C] 截图 · [R] 回放 · [Q] 退出</text>
        </box>
      </box>

      {/* 中部主板 */}
      <box flexDirection="row" flexGrow={1} minHeight={0} gap={1} marginTop={1}>
        {/* 左侧：手柄按键与输入偏转 */}
        <box width="50%" borderStyle="rounded" borderColor="gray" flexDirection="column" paddingLeft={1} paddingRight={1}>
          <text fg="yellow"><b>【手柄实时输入检测】</b></text>
          <box flexDirection="row" flexWrap="wrap" gap={1} marginTop={1}>
            {buttons.slice(0, 16).map((pressed, i) => (
              <box
                key={i}
                width={7}
                height={2}
                borderStyle={pressed ? 'double' : 'single'}
                borderColor={pressed ? 'green' : 'gray'}
                justifyContent="center"
                alignItems="center"
              >
                <text fg={pressed ? 'green' : 'gray'}>B{i}:{pressed ? '1' : '0'}</text>
              </box>
            ))}
          </box>

          <box marginTop={1} flexDirection="column">
            <text fg="yellow"><b>【模拟轴 (Axes)】</b></text>
            {axes.slice(0, 4).map((val, idx) => (
              <text key={idx} fg="gray">
                Axis {idx}: {val.toFixed(2)} [{val > 0.8 ? 'MAX+' : val < -0.8 ? 'MAX-' : 'MID'}]
              </text>
            ))}
          </box>
        </box>

        {/* 右侧：配置信息与日志 */}
        <box width="50%" borderStyle="rounded" borderColor="gray" flexDirection="column" paddingLeft={1} paddingRight={1}>
          <text fg="cyan"><b>【截图与触发日志】</b></text>
          <box flexDirection="column" marginTop={1}>
            <text fg="gray">路径: {manager.config.path || '(当前目录/screenshots)'}</text>
            <text fg="gray">格式: {manager.config.imageFormat.toUpperCase()} · 模式: {manager.config.screenShotSaveWay}</text>
            <text fg="gray">组合键: {manager.config.comboKeys.join(' + ') || '(未设置)'}</text>
          </box>

          <box marginTop={1} flexDirection="column" flexGrow={1}>
            <text fg="yellow"><b>最近触发事件：</b></text>
            {logs.map((log, idx) => (
              <text key={idx} fg={log.includes('OK') ? 'green' : log.includes('FAILED') ? 'red' : 'white'}>
                {log}
              </text>
            ))}
            {logs.length === 0 && <text fg="gray">（等待手柄输入触发…）</text>}
          </box>
        </box>
      </box>

      {/* 底栏 */}
      <box height={2} flexDirection="row" justifyContent="space-between">
        <text fg="gray">Shiin v2.0.0 · Powered by OpenTUI</text>
        <text fg="gray">按 Q 退出终端</text>
      </box>
    </box>
  )
}

export async function runOpenTui(manager: ScreenshotManager): Promise<void> {
  await manager.init()

  const renderer = await createCliRenderer({
    stdin: process.stdin as ReadStream,
    stdout: process.stdout as WriteStream,
    exitOnCtrlC: true,
    clearOnShutdown: true,
    screenMode: 'alternate-screen',
  })

  return new Promise((resolve) => {
    const root = createRoot(renderer)
    const handleExit = () => {
      manager.dispose()
      root.unmount()
      renderer.destroy()
      resolve()
    }

    root.render(<ShiinTui manager={manager} onExit={handleExit} />)
  })
}
