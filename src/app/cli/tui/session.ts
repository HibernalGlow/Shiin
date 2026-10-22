/**
 * TUI 的会话状态：手柄轮询、管理器事件、动作执行与日志，都收在这一个 hook 里。
 *
 * 屏幕组件只读这里的状态、只调这里的动作——这样"按 C 截图"与"鼠标点截图"走的是
 * 同一条路径，不会出现快捷键能截、按钮不能截这种分叉。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { GamepadDeviceInfo, ScreenshotManager, ScreenshotResult } from '../../../core/index.js'
import { collectContext, executeCapture, executeListen, executeReplay } from '../actions.js'
import type { Translator } from '../i18n.js'
import { notifyCaptureResult, notifyReplayResult, showOverlayNotification } from '../overlay.js'
import type { ShiinActionResult, ShiinContext, ShiinPlan } from '../plan.js'
import { planFromConfig, planToPatch } from '../plan.js'

export type LogLevel = 'info' | 'success' | 'warn' | 'error'

export interface LogEntry {
  id: number
  time: string
  level: LogLevel
  text: string
}

export interface ShiinSession {
  plan: ShiinPlan
  patchPlan: (patch: Partial<ShiinPlan>) => void
  devices: GamepadDeviceInfo[]
  buttons: boolean[]
  axes: number[]
  listening: boolean
  busy: boolean
  progress: number
  logs: LogEntry[]
  last: ShiinActionResult | null
  context: ShiinContext
  capture: () => Promise<void>
  /** 快捷截取当前聚焦的前台活动窗口。 */
  captureFocused: () => Promise<void>
  /** 快捷切换按窗口名保存到子文件夹。 */
  toggleSaveByActiveWinTitle: () => void
  replay: () => Promise<void>
  /** 弹一条测试覆层，验证 CLI/TUI 与桌面端共用同一条通知通路。 */
  testNotification: () => void
  toggleListen: () => Promise<void>
  saveSettings: () => Promise<void>
  /** 写入手柄组合键（`ButtonN` / `AxisN+` / `AxisN-`），并热更新正在运行的监听。 */
  saveCombo: (comboKeys: string[]) => Promise<void>
  /** 打开第一只手柄的设备句柄（不启动监听也会更新按键/轴状态）。 */
  ensureDevice: () => boolean
  /** 往工作台日志里写一条（设置页之类没有日志面板的页面用来回报动作已生效）。 */
  log: (level: LogLevel, text: string) => void
  refresh: () => Promise<void>
  clearLogs: () => void
}

function timestamp(): string {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

export function useShiinSession(manager: ScreenshotManager, t: Translator): ShiinSession {
  const [plan, setPlan] = useState<ShiinPlan>(() => planFromConfig(manager.config))
  const [devices, setDevices] = useState<GamepadDeviceInfo[]>(() => manager.gamepad.getConnectedDevices())
  const [buttons, setButtons] = useState<boolean[]>(() => manager.gamepad.getCurrentButtons())
  const [axes, setAxes] = useState<number[]>(() => manager.gamepad.getCurrentAxes())
  const [listening, setListening] = useState<boolean>(manager.listening)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [last, setLast] = useState<ShiinActionResult | null>(null)
  const [context, setContext] = useState<ShiinContext>(() => ({
    config: manager.config,
    deviceCount: 0,
    screenCount: 0,
    windowCount: 0,
    windows: [],
    obsConnected: manager.obs.isConnected,
    listening: manager.listening,
  }))

  const planRef = useRef(plan)
  const translatorRef = useRef(t)
  const acting = useRef(false)
  const logId = useRef(0)

  planRef.current = plan
  translatorRef.current = t

  const pushLog = useCallback((level: LogLevel, text: string) => {
    logId.current += 1
    const entry: LogEntry = { id: logId.current, time: timestamp(), level, text }
    setLogs((previous) => [entry, ...previous].slice(0, 60))
  }, [])

  const refreshContext = useCallback(async () => {
    const next = await collectContext(manager)
    setContext(next)
    setListening(manager.listening)
    setDevices(manager.gamepad.getConnectedDevices())
  }, [manager])

  const refresh = useCallback(async () => {
    await refreshContext()
    pushLog('info', translatorRef.current('deviceChanged'))
  }, [pushLog, refreshContext])

  /**
   * 保证有设备句柄在手。
   *
   * `getCurrentButtons()` 读的是 `GamepadCore` 里由 SDL 事件更新的数组，
   * 而设备句柄只有在 `openDevice()` / `startListening()` 之后才建立——
   * 之前"实时输入"面板和组合键录制都会永远读到全 0。这里在挂载时先打开第一只手柄，
   * 与"是否正在监听"解耦。
   */
  const ensureDevice = useCallback(() => {
    const device = manager.gamepad.getConnectedDevices()[0]
    if (!device) return false
    manager.gamepad.openDevice(device._index)
    return true
  }, [manager])

  useEffect(() => {
    ensureDevice()
    void refreshContext().catch(() => undefined)
  }, [ensureDevice, refreshContext])

  useEffect(() => {
    const unsubscribe = manager.subscribe((event) => {
      if (event.type === 'screenshot') {
        const data = event.data as { ok?: boolean; filePath?: string | null; error?: string; sizeBytes?: number } | undefined
        if (data?.ok) {
          pushLog('success', `${translatorRef.current('captureDone')} · ${data.filePath ?? translatorRef.current('saveClipboard')}`)
        } else {
          pushLog('error', `${translatorRef.current('captureFailed')} · ${data?.error ?? ''}`)
        }
        if (data) notifyCaptureResult(manager, data as ScreenshotResult, translatorRef.current)
        setListening(manager.listening)
      } else if (event.type === 'replayBuffer') {
        const data = event.data as { ok?: boolean; error?: string } | undefined
        pushLog(data?.ok ? 'success' : 'error', data?.ok ? translatorRef.current('replayDone') : `${translatorRef.current('replayFailed')} · ${data?.error ?? ''}`)
        if (data) notifyReplayResult(manager, data, translatorRef.current)
      } else if (event.type === 'deviceChanged') {
        const next = manager.gamepad.getConnectedDevices()
        setDevices(next)
        if (next[0]) manager.gamepad.openDevice(next[0]._index)
        void refreshContext().catch(() => undefined)
      } else if (event.type === 'statusChanged') {
        setListening(manager.listening)
      }
    })
    return unsubscribe
  }, [manager, pushLog, refreshContext])

  useEffect(() => {
    const timer = setInterval(() => {
      const nextButtons = manager.gamepad.getCurrentButtons()
      const nextAxes = manager.gamepad.getCurrentAxes()
      setButtons((previous) => (previous.length === nextButtons.length && previous.every((value, index) => value === nextButtons[index]) ? previous : nextButtons))
      setAxes((previous) => (previous.length === nextAxes.length && previous.every((value, index) => value === nextAxes[index]) ? previous : nextAxes))
    }, 80)
    return () => clearInterval(timer)
  }, [manager])

  const runGuarded = useCallback(
    async (action: () => Promise<ShiinActionResult>) => {
      if (acting.current) return
      acting.current = true
      setBusy(true)
      setProgress(0)
      try {
        const result = await action()
        setLast(result)
        pushLog(result.success ? 'success' : 'error', `${result.message}${result.lines?.length ? ` · ${result.lines[0]}` : ''}`)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        setLast({ success: false, message: translatorRef.current('error'), lines: [message] })
        pushLog('error', `${translatorRef.current('error')} · ${message}`)
      } finally {
        acting.current = false
        setBusy(false)
        setProgress(100)
        setListening(manager.listening)
      }
    },
    [pushLog],
  )

  const capture = useCallback(async () => {
    await runGuarded(() => executeCapture(manager, planRef.current, translatorRef.current, (event) => {
      if (event.progress !== undefined) setProgress(event.progress)
    }))
  }, [manager, runGuarded])

  const captureFocused = useCallback(async () => {
    const focusedPlan: ShiinPlan = {
      ...planRef.current,
      target: 'window',
      windowMode: 'focused',
    }
    await runGuarded(() => executeCapture(manager, focusedPlan, translatorRef.current, (event) => {
      if (event.progress !== undefined) setProgress(event.progress)
    }))
  }, [manager, runGuarded])

  const patchPlan = useCallback(
    (patch: Partial<ShiinPlan>) => {
      // 设置页的改动先进 manager 的内存配置：这样手柄触发（不走 executeCapture）
      // 也会立刻按新的窗口口径截图；“保存配置”只决定是否落盘。
      const next = { ...planRef.current, ...patch }
      planRef.current = next
      setPlan(next)
      manager.syncConfig(planToPatch(next))
    },
    [manager],
  )

  const toggleSaveByActiveWinTitle = useCallback(() => {
    const nextVal = !planRef.current.saveByActiveWinTitle
    patchPlan({ saveByActiveWinTitle: nextVal })
    const t = translatorRef.current
    pushLog('info', `${t('saveByActiveWinTitle')}: ${nextVal ? t('subfolderOn') : t('subfolderOff')}`)
  }, [patchPlan, pushLog])

  const replay = useCallback(async () => {
    await runGuarded(() => executeReplay(manager, translatorRef.current))
  }, [manager, runGuarded])

  const testNotification = useCallback(async () => {
    const t = translatorRef.current
    const result = await showOverlayNotification(
      { title: t('overlayTestTitle'), desc: t('overlayTestDesc'), type: 'text' },
      manager.config,
    )
    pushLog(
      result.shown ? 'success' : 'warn',
      result.shown ? `${t('overlayShown')} · ${result.backend}` : `${t('overlayUnavailable')} · ${result.reason ?? ''}`,
    )
  }, [manager, pushLog])

  const toggleListen = useCallback(async () => {
    if (manager.listening) {
      manager.stopListening()
      setListening(false)
      pushLog('warn', translatorRef.current('listenStopped'))
      return
    }
    await runGuarded(() => executeListen(manager, translatorRef.current))
    setListening(manager.listening)
  }, [manager, pushLog, runGuarded])

  const saveSettings = useCallback(async () => {
    manager.syncConfig(planToPatch(planRef.current))
    await manager.saveConfig()
    await refreshContext()
    pushLog('success', translatorRef.current('savedConfig'))
  }, [manager, pushLog, refreshContext])

  const saveCombo = useCallback(
    async (comboKeys: string[]) => {
      manager.syncConfig({ comboKeys })
      await manager.saveConfig()
      await refreshContext()
      pushLog('success', `${translatorRef.current('savedCombo')} · ${comboKeys.join(' + ') || translatorRef.current('comboUnset')}`)
    },
    [manager, pushLog, refreshContext],
  )

  const clearLogs = useCallback(() => setLogs([]), [])

  return useMemo(
    () => ({
      plan,
      patchPlan,
      devices,
      buttons,
      axes,
      listening,
      busy,
      progress,
      logs,
      last,
      context,
      capture,
      captureFocused,
      toggleSaveByActiveWinTitle,
      replay,
      testNotification,
      toggleListen,
      saveSettings,
      saveCombo,
      ensureDevice,
      log: pushLog,
      refresh,
      clearLogs,
    }),
    [plan, patchPlan, devices, buttons, axes, listening, busy, progress, logs, last, context, capture, captureFocused, toggleSaveByActiveWinTitle, replay, testNotification, toggleListen, saveSettings, saveCombo, ensureDevice, pushLog, refresh, clearLogs],
  )
}

