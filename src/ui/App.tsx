/**
 * Shiin Expressive 主控制台
 *
 * 两页结构：
 * - 工作台：手柄状态、捕获、触发组合、监听与实时测试
 * - 设置：形状、权限、启动、通知、数据
 *
 * 权限在设置中按需处理，不占用顶级目的地。
 */
import * as React from 'react'
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useReducedMotion } from 'motion/react'
import { Md3eShapeProvider } from './md3e-shape-context.js'
import {
  DEFAULT_SHAPE_PREFERENCES,
  createShapeSeed,
  createShapeSession,
  normalizeShapePreferences,
  type Md3eShapePreferences,
} from './md3e-shapes.js'
import { TitleBar } from './components/TitleBar.js'
import { CaptureDock, type WorkspaceDestination } from './components/CaptureDock.js'
import { ElectronHostBridge } from './adapter/electron.js'
import { formatGamepadKey } from './gamepad-utils.js'
import {
  type ScreenshotConfig,
  type ScreenshotResult,
  type GamepadDeviceInfo,
  type CaptureDisplayInfo,
  type CaptureWindowInfo,
  DEFAULT_CONFIG,
} from '../core/types.js'
import { playCaptureSound } from './audio.js'
import { UpdateDialog } from './components/UpdateDialog.js'
import { SettingsView } from './components/SettingsView.js'
import { WorkspaceView } from './components/WorkspaceView.js'
import { SETTINGS_BENTO_CSS } from './components/settings-bento-css.js'
import type { MacOSPermissionsStatus } from './adapter/types.js'
import { registerExpressiveStyles } from './expressive-theme.js'
import { AnalyticsDashboardView } from './components/dashboard/AnalyticsDashboardView.js'
import {
  FeedbackHost,
  useFeedbackManager,
  type FeedbackNotice,
} from './components/feedback/index.js'
import { useTheme } from './useTheme.js'
import {
  type ActivityStatsData,
  GamepadEdgeDetector,
  createSeedStatsData,
  createEmptyStatsData,
  recordScreenshot,
  recordButtonPress,
  recordListenToggle,
  recordObsReplay,
} from '../core/stats.js'
import {
  type DashboardLayoutConfig,
  getDefaultDashboardLayout,
  normalizeDashboardLayout,
} from './dashboard-layout.js'
import {
  type WorkspaceLayoutConfig,
  getDefaultWorkspaceLayout,
  normalizeWorkspaceLayout,
} from './workspace-layout.js'
import { getButtonDisplayName } from './components/dashboard/dashboard-utils.js'

type Lens = WorkspaceDestination

export const App: React.FC = () => {
  const reduceMotion = useReducedMotion()
  const navigationId = React.useId()
  const [capturePending, setCapturePending] = React.useState(false)
  const captureBusyRef = React.useRef(false)
  const [captureResult, setCaptureResult] = React.useState<ScreenshotResult | null>(null)
  const bridge = React.useMemo(() => new ElectronHostBridge(), [])

  const [lens, setLens] = React.useState<Lens>(() => {
    if (typeof window !== 'undefined') {
      const qLens = new URLSearchParams(window.location.search).get('lens')
      if (qLens === 'workspace' || qLens === 'analytics' || qLens === 'settings') {
        return qLens as Lens
      }
    }
    return 'workspace'
  })
  const [permissionRequest, setPermissionRequest] = React.useState(0)
  const [settingsSection, setSettingsSection] = React.useState<'general' | 'permissions'>('general')
  const [saveState, setSaveState] = React.useState<'saved' | 'saving' | 'error'>('saved')
  const saveVersion = React.useRef(0)
  const pendingSettings = React.useRef(new Map<string, { value: unknown; version: number }>())
  const saveQueue = React.useRef(Promise.resolve())
  const queuedSaves = React.useRef(0)

  const [config, setConfig] = React.useState<ScreenshotConfig>(() => {
    const base = { ...DEFAULT_CONFIG }
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search)
      const qTheme = q.get('theme')
      if (qTheme === 'light' || qTheme === 'dark' || qTheme === 'auto') {
        base.theme = qTheme as any
      }
      if (
        q.get('enableHub') === 'true' ||
        q.get('enableHub') === '1' ||
        q.get('hub') === 'inbox' ||
        q.get('hub') === 'workflows' ||
        q.get('hub') === 'detail'
      ) {
        base.enableCaptureHub = true
      }
    }
    return base
  })
  const effectiveTheme = useTheme(config.theme)
  const [listening, setListening] = React.useState<boolean>(false)
  const [gamepads, setGamepads] = React.useState<GamepadDeviceInfo[]>([])
  const [selectedGamepadIndex, setSelectedGamepadIndex] = React.useState<number>(0)
  const [screens, setScreens] = React.useState<CaptureDisplayInfo[]>([])
  const [windows, setWindows] = React.useState<CaptureWindowInfo[]>([])
  const [buttons, setButtons] = React.useState<boolean[]>([])
  const [axes, setAxes] = React.useState<number[]>([])

  const [recordingCombo, setRecordingCombo] = React.useState<boolean>(false)
  const [detectingComboIndex, setDetectingComboIndex] = React.useState<number>(-1)
  const [liveRecordingKeys, setLiveRecordingKeys] = React.useState<string[]>([])
  const recordingKeysSetRef = React.useRef<Set<string>>(new Set())
  const releaseDebounceRef = React.useRef<NodeJS.Timeout | null>(null)
  const lastCaptureTimeRef = React.useRef<number>(0)
  const configRef = React.useRef<ScreenshotConfig>(config)
  configRef.current = config
  const [detectingKeyboard, setDetectingKeyboard] = React.useState<boolean>(false)

  const [uiScale, setUiScale] = React.useState<number>(1.0)
  const [locale, setLocale] = React.useState<string>('zh')
  const [shapePreferences, setShapePreferences] = React.useState<Md3eShapePreferences>(
    DEFAULT_SHAPE_PREFERENCES
  )
  const [shapeSeed, setShapeSeed] = React.useState<number>(() => createShapeSeed())
  const shapeSession = React.useMemo(
    () => createShapeSession(shapePreferences, shapeSeed),
    [shapePreferences, shapeSeed]
  )
  const [updateDialogOpen, setUpdateDialogOpen] = React.useState<boolean>(false)
  const [hasUpdate, setHasUpdate] = React.useState<boolean>(false)
  const [maximized, setMaximized] = React.useState<boolean>(false)
  const [macPermissions, setMacPermissions] = React.useState<MacOSPermissionsStatus | null>(null)

  const {
    notices: feedbackNotices,
    showNotice,
    showScreenshot,
    showTask,
    dismiss: dismissNotice,
    pauseTimer,
    resumeTimer,
  } = useFeedbackManager(locale)

  const [lastNotice, updateLastNotice] = React.useState({ text: '', revision: 0 })
  const setLastNotice = React.useCallback(
    (text: string, options?: Partial<FeedbackNotice>) => {
      updateLastNotice((current) => ({ text, revision: current.revision + 1 }))
      if (text) {
        showNotice(text, options)
      }
    },
    [showNotice]
  )
  const [stats, setStats] = React.useState<ActivityStatsData>(createSeedStatsData)
  const [dashboardLayout, setDashboardLayout] = React.useState<DashboardLayoutConfig>(getDefaultDashboardLayout)
  const [workspaceLayout, setWorkspaceLayout] = React.useState<WorkspaceLayoutConfig>(getDefaultWorkspaceLayout)
  const [workspaceEditing, setWorkspaceEditing] = React.useState(false)
  const statsRef = React.useRef<ActivityStatsData>(stats)
  statsRef.current = stats
  const edgeDetectorRef = React.useRef<GamepadEdgeDetector>(new GamepadEdgeDetector())
  const listeningStartTimeRef = React.useRef<number>(0)
  const localeRef = React.useRef(locale)
  localeRef.current = locale

  const openPermissions = React.useCallback(() => {
    setPermissionRequest((request) => request + 1)
    setSettingsSection('permissions')
    setLens('settings')
  }, [])

  React.useEffect(() => {
    const unregisterStyles = registerExpressiveStyles()

    if (typeof document !== 'undefined' && !document.getElementById('shiin-settings-bento-styles')) {
      const style = document.createElement('style')
      style.id = 'shiin-settings-bento-styles'
      style.textContent = SETTINGS_BENTO_CSS
      document.head.append(style)
    }

    void (async () => {
      const savedScale = await bridge.getStore('uiScale', 1.0)
      setUiScale(savedScale)

      const savedLocale = await bridge.getStore('locale', 'zh')
      if (savedLocale) setLocale(savedLocale)

      const savedShapes = await bridge.getStore('shapePreferences', DEFAULT_SHAPE_PREFERENCES)
      setShapePreferences(normalizeShapePreferences(savedShapes))

      const savedStats = await bridge.getStore('shiin_activity_stats', null)
      if (savedStats && typeof savedStats === 'object' && 'version' in (savedStats as any)) {
        setStats(savedStats as ActivityStatsData)
      }
      const savedLayout = await bridge.getStore('shiin_dashboard_layout', null)
      if (savedLayout) {
        setDashboardLayout(normalizeDashboardLayout(savedLayout))
      }
      const savedWorkspaceLayout = await bridge.getStore('shiin_workspace_layout', null)
      if (savedWorkspaceLayout) {
        setWorkspaceLayout(normalizeWorkspaceLayout(savedWorkspaceLayout))
      }

      if (bridge.getAutoStart) {
        const auto = await bridge.getAutoStart()
        setConfig((prev) => ({ ...prev, autoStart: auto }))
      }

      if (bridge.getMacOSPermissions) {
        try {
          const perms = await bridge.getMacOSPermissions({ activeProbe: false })
          setMacPermissions(perms)
          if (perms.isMac && !perms.screenCapture) {
            showTask({
              id: 'perm-screen',
              title: savedLocale.startsWith('zh') ? '需要屏幕录制权限' : 'Screen Recording Required',
              message: savedLocale.startsWith('zh')
                ? '授权后才能捕获屏幕画面。请在系统设置中允许 Shiin。'
                : 'Grant Screen Recording access in macOS Settings to capture game screens.',
              action: {
                label: savedLocale.startsWith('zh') ? '打开系统设置' : 'Open Settings',
                onClick: () => {
                  openPermissions()
                  if (bridge.openMacOSPreference) void bridge.openMacOSPreference('screen')
                },
              },
            })
          }
        } catch {
          setLastNotice(savedLocale.startsWith('zh') ? '暂时无法检测系统权限，请检查本地服务。' : 'System access could not be checked. Check the local service.')
        }
      }

      const savedGlobal = await bridge.getStore('globalConfig', '')
      if (savedGlobal) {
        try {
          const parsed = typeof savedGlobal === 'string' ? JSON.parse(savedGlobal) : savedGlobal
          setConfig((prev) => ({ ...prev, ...parsed }))
        } catch {
          // ignore malformed persisted config
        }
      }

      if (bridge.getRuntimeState) {
        const runtime = await bridge.getRuntimeState()
        if (runtime) {
          if (runtime.config) setConfig((prev) => ({ ...prev, ...runtime.config }))
          setListening(Boolean(runtime.listening))
          if (typeof runtime.activeGamepadIndex === 'number' && runtime.activeGamepadIndex >= 0) {
            setSelectedGamepadIndex(runtime.activeGamepadIndex)
          }
          if (Array.isArray(runtime.devices) && runtime.devices.length > 0) {
            setGamepads(runtime.devices)
          }
        }
      } else if (bridge.getListeningState) {
        setListening(Boolean(await bridge.getListeningState()))
      }

      const devs = await bridge.getConnectedGamepads()
      if (devs.length > 0) {
        setGamepads(devs)
        void bridge.openGamepad(devs[0])
      }

      setScreens(await bridge.getScreenSources())
      setWindows(await bridge.getCaptureWindows())
    })()

    const unbindListen = bridge.onListeningStateChanged((state) => {
      setListening(state)
      const duration = state ? 0 : (listeningStartTimeRef.current > 0 ? Date.now() - listeningStartTimeRef.current : 0)
      if (state) listeningStartTimeRef.current = Date.now()
      else listeningStartTimeRef.current = 0
      const updated = recordListenToggle(statsRef.current, state, duration)
      statsRef.current = updated
      setStats(updated)
      persistSetting('shiin_activity_stats', updated)
    })
    const unbindDevices = bridge.onGamepadDevicesChanged?.((devs) => {
      if (Array.isArray(devs)) setGamepads(devs)
    })
    const unbindScreenshot = bridge.onScreenshotCompleted?.((res) => {
      setCaptureResult(res)
      if (res?.ok) {
        const updated = recordScreenshot(statsRef.current, {
          filePath: res.filePath,
          appName: res.appName,
          windowTitle: res.windowTitle,
          format: res.format,
          isListening: listeningStartTimeRef.current > 0,
        })
        statsRef.current = updated
        setStats(updated)
        persistSetting('shiin_activity_stats', updated)

        const current = configRef.current
        if (current.sound && current.sound !== 'None') {
          void playCaptureSound(current.sound, current.soundPower)
        }
        showScreenshot(res)
      }
    })
    const unbindObsReplay = bridge.onObsReplayCompleted?.((res) => {
      const updated = recordObsReplay(statsRef.current, Boolean(res?.ok), res?.error, listeningStartTimeRef.current > 0)
      statsRef.current = updated
      setStats(updated)
      persistSetting('shiin_activity_stats', updated)
      if (res?.ok) {
        setLastNotice(localeRef.current.startsWith('zh') ? 'OBS 回放缓冲已保存' : 'OBS replay buffer saved')
      }
    })
    const unbindPermDialog = bridge.onOpenPermissionDialog?.((data) => {
      openPermissions()
      if (data?.message) setLastNotice(data.message)
      if (bridge.getMacOSPermissions) {
        void bridge.getMacOSPermissions({ activeProbe: true }).then((perms) => setMacPermissions(perms)).catch(() => undefined)
      }
    })

    const handleWindowFocus = () => {
      if (bridge.getMacOSPermissions) {
        void bridge.getMacOSPermissions({ activeProbe: true }).then((perms) => {
          setMacPermissions(perms)
          if (perms?.screenCapture) {
            setLastNotice(localeRef.current.startsWith('zh') ? '屏幕录制权限已就绪' : 'Screen recording permission granted')
          }
        }).catch(() => undefined)
      }
    }
    window.addEventListener('focus', handleWindowFocus)

    return () => {
      unbindListen()
      if (typeof unbindDevices === 'function') unbindDevices()
      if (typeof unbindScreenshot === 'function') unbindScreenshot()
      if (typeof unbindObsReplay === 'function') unbindObsReplay()
      if (typeof unbindPermDialog === 'function') unbindPermDialog()
      window.removeEventListener('focus', handleWindowFocus)
      unregisterStyles()
    }
  }, [bridge, openPermissions])

  React.useEffect(() => {
    let tick = 0

    const refreshGamepads = async () => {
      const devs = await bridge.getConnectedGamepads()
      if (devs.length > 0) {
        setGamepads(devs)
        setSelectedGamepadIndex((prev) => {
          if (prev < 0 || !devs.find((device) => device._index === prev)) {
            void bridge.openGamepad(devs[0])
            return devs[0]._index
          }
          return prev
        })
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('gamepadconnected', refreshGamepads)
      window.addEventListener('gamepaddisconnected', refreshGamepads)
    }

    const timer = setInterval(async () => {
      tick++
      const currentButtons = await bridge.getCurrentButtons()
      setButtons(currentButtons)
      const currentAxes = await bridge.getCurrentAxes()
      setAxes(currentAxes)

      if (currentButtons && currentButtons.length > 0) {
        edgeDetectorRef.current.processButtons(currentButtons, (_btnIdx, btnKey) => {
          const activeDev = gamepads.find((g) => g._index === selectedGamepadIndex) || gamepads[0]
          const prettyName = getButtonDisplayName(btnKey, localeRef.current.startsWith('zh'))
          const updated = recordButtonPress(statsRef.current, btnKey, prettyName, activeDev?.name)
          statsRef.current = updated
          setStats(updated)
          persistSetting('shiin_activity_stats', updated)
        })
      }

      const hasAnyInput =
        (currentButtons && currentButtons.some(Boolean)) ||
        (currentAxes && currentAxes.some((value) => Math.abs(value) > 0.15))
      if (hasAnyInput && bridge.syncWebGamepad) {
        void bridge.syncWebGamepad(gamepads, currentButtons, currentAxes)
      }
      if ((gamepads.length === 0 && hasAnyInput) || tick % 30 === 0) {
        void refreshGamepads()
      }

      if (recordingCombo || detectingComboIndex >= 0) {
        const pressedNow: string[] = []
        if (currentButtons && currentButtons.length > 0) {
          for (let index = 0; index < currentButtons.length; index += 1) {
            if (currentButtons[index]) pressedNow.push(`Button${index}`)
          }
        }
        if (currentAxes && currentAxes.length > 0) {
          for (let index = 0; index < currentAxes.length; index += 1) {
            if (currentAxes[index] > 0.85) pressedNow.push(`Axis${index}+`)
            else if (currentAxes[index] < -0.85) pressedNow.push(`Axis${index}-`)
          }
        }

        if (pressedNow.length > 0) {
          if (releaseDebounceRef.current) {
            clearTimeout(releaseDebounceRef.current)
            releaseDebounceRef.current = null
          }
          pressedNow.forEach((key) => recordingKeysSetRef.current.add(key))
          setLiveRecordingKeys(Array.from(recordingKeysSetRef.current))
        } else if (recordingKeysSetRef.current.size > 0 && !releaseDebounceRef.current) {
          releaseDebounceRef.current = setTimeout(() => {
            const captured = Array.from(recordingKeysSetRef.current)
            if (captured.length > 0) {
              if (detectingComboIndex >= 0 && captured.length === 1) {
                const next = [...config.comboKeys]
                next[detectingComboIndex] = captured[0]
                patchConfig({ comboKeys: next })
              } else {
                patchConfig({ comboKeys: captured })
              }
              setLastNotice(
                locale.startsWith('zh')
                  ? `已绑定组合键: ${captured.map((key) => formatGamepadKey(key, 'zh').name).join(' + ')}`
                  : `Bound combo: ${captured.join(' + ')}`
              )
            }
            setRecordingCombo(false)
            setDetectingComboIndex(-1)
            setLiveRecordingKeys([])
            recordingKeysSetRef.current.clear()
            releaseDebounceRef.current = null
          }, 1000)
        }
      }
    }, 60)

    return () => {
      clearInterval(timer)
      if (typeof window !== 'undefined') {
        window.removeEventListener('gamepadconnected', refreshGamepads)
        window.removeEventListener('gamepaddisconnected', refreshGamepads)
      }
      if (releaseDebounceRef.current) clearTimeout(releaseDebounceRef.current)
    }
  }, [bridge, listening, recordingCombo, detectingComboIndex, gamepads.length, config.comboKeys, config.obsReplayBufferOnLongPress, locale])

  React.useEffect(() => {
    if (!detectingKeyboard) return
    const onKey = (event: KeyboardEvent) => {
      event.preventDefault()
      patchConfig({ keyboardTriggerKeyCode: event.keyCode, keyboardTrigger: true })
      setDetectingKeyboard(false)
      setLastNotice(locale.startsWith('zh') ? `已绑定键盘: ${event.code} (${event.keyCode})` : `Bound key: ${event.code}`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [detectingKeyboard, locale])

  const persistSetting = (key: string, value: unknown) => {
    const version = ++saveVersion.current
    pendingSettings.current.set(key, { value, version })
    queuedSaves.current += 1
    setSaveState('saving')
    // Keep writes ordered so quick changes cannot overwrite the latest value.
    saveQueue.current = saveQueue.current.then(async () => {
      try {
        await bridge.setStore(key, value)
        if (pendingSettings.current.get(key)?.version === version) pendingSettings.current.delete(key)
      } catch (error) {
        setLastNotice(localeRef.current.startsWith('zh')
          ? `设置未保存：${error instanceof Error ? error.message : String(error)}`
          : `Settings were not saved: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        queuedSaves.current -= 1
        setSaveState(queuedSaves.current > 0 ? 'saving' : pendingSettings.current.size > 0 ? 'error' : 'saved')
      }
    })
  }

  const retrySave = () => {
    for (const [key, { value }] of pendingSettings.current) persistSetting(key, value)
  }

  const patchConfig = (patch: Partial<ScreenshotConfig>) => {
    const next = { ...configRef.current, ...patch }
    configRef.current = next
    setConfig(next)
    persistSetting('globalConfig', JSON.stringify(next))
  }

  const handleCapture = async () => {
    const now = Date.now()
    if (captureBusyRef.current || now - lastCaptureTimeRef.current < 350) return
    lastCaptureTimeRef.current = now
    captureBusyRef.current = true
    setCapturePending(true)
    try {
    if (bridge.isMac) {
      let currentPermissions = macPermissions
      if (!currentPermissions && bridge.getMacOSPermissions) {
        currentPermissions = await bridge.getMacOSPermissions({ activeProbe: true })
        setMacPermissions(currentPermissions)
      }
      if (currentPermissions && !currentPermissions.screenCapture) {
        openPermissions()
        if (bridge.openMacOSPreference) void bridge.openMacOSPreference('screen')
        setLastNotice(
          locale.startsWith('zh')
            ? '缺少屏幕录制权限，已打开权限自检'
            : 'Missing Screen Recording permission'
        )
        bridge.showNotification?.(
          locale.startsWith('zh') ? '缺少屏幕录制权限' : 'Screen Recording Required',
          locale.startsWith('zh') ? '请在系统设置中勾选 Shiin' : 'Enable Shiin in macOS Settings'
        )
        return
      }
    }

    const result = await bridge.capture(config)
    setCaptureResult(result ?? { ok: false, error: locale.startsWith('zh') ? '捕获服务未返回结果' : 'Capture service returned no result', timestamp: Date.now(), format: config.imageFormat })
    if (result?.ok) {
      const updated = recordScreenshot(statsRef.current, {
        filePath: result.filePath,
        appName: result.appName,
        windowTitle: result.windowTitle,
        format: result.format,
        isListening: listening,
      })
      statsRef.current = updated
      setStats(updated)
      persistSetting('shiin_activity_stats', updated)

      if (config.sound && config.sound !== 'None') {
        void playCaptureSound(config.sound, config.soundPower)
      }
      showScreenshot(result)
    } else {
      if (bridge.isMac) {
        openPermissions()
        if (bridge.openMacOSPreference) void bridge.openMacOSPreference('screen')
      }
      setLastNotice(
        locale.startsWith('zh')
          ? `截图失败: ${result?.error || '无法截取屏幕'}`
          : `Failed: ${result?.error}`
      )
    }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setCaptureResult({ ok: false, error: message, timestamp: Date.now(), format: config.imageFormat })
      setLastNotice(locale.startsWith('zh') ? `截图失败: ${message}` : `Capture failed: ${message}`)
    } finally {
      captureBusyRef.current = false
      setCapturePending(false)
    }
  }

  const handleToggleListen = async () => {
    if (listening) {
      await bridge.stopListening()
      setListening(false)
      setLastNotice(locale.startsWith('zh') ? '后台监听已停止' : 'Listener stopped')
      return
    }

    if (bridge.isMac && config.keyboardTrigger && macPermissions && !macPermissions.accessibility) {
      if (bridge.requestMacOSPermission) {
        void bridge.requestMacOSPermission('accessibility', { openSettingsIfDenied: true })
      }
      openPermissions()
      setLastNotice(
        locale.startsWith('zh')
          ? '全局键盘监听需要辅助功能权限，已打开权限自检'
          : 'Global keyboard hotkeys require Accessibility permission'
      )
    }

    const ok = await bridge.startListening(config)
    if (ok) {
      setListening(true)
      setLastNotice(locale.startsWith('zh') ? '后台监听已激活' : 'Listener active')
    }
  }

  const handleSaveOBS = async () => {
    const result = await bridge.saveOBSReplay()
    const updated = recordObsReplay(statsRef.current, Boolean(result?.ok), result?.error, listening)
    statsRef.current = updated
    setStats(updated)
    persistSetting('shiin_activity_stats', updated)
    setLastNotice(
      result?.ok
        ? locale.startsWith('zh')
          ? 'OBS 回放缓冲已保存'
          : 'OBS replay buffer saved'
        : locale.startsWith('zh')
          ? `OBS 回放保存失败: ${result?.error}`
          : `OBS replay failed: ${result?.error}`
    )
  }

  const handleClearStats = () => {
    const empty = createEmptyStatsData()
    statsRef.current = empty
    setStats(empty)
    persistSetting('shiin_activity_stats', empty)
    setLastNotice(locale.startsWith('zh') ? '已清空统计数据与事件流' : 'Cleared statistics & activity stream')
  }

  const handleSeedStats = () => {
    const seed = createSeedStatsData()
    statsRef.current = seed
    setStats(seed)
    persistSetting('shiin_activity_stats', seed)
    setLastNotice(locale.startsWith('zh') ? '已载入演示数据（包含《终末地》等）' : 'Loaded demo statistics')
  }

  const handleSaveDashboardLayout = (nextLayout: DashboardLayoutConfig) => {
    setDashboardLayout(nextLayout)
    persistSetting('shiin_dashboard_layout', nextLayout)
  }

  const handleSaveWorkspaceLayout = (nextLayout: WorkspaceLayoutConfig) => {
    setWorkspaceLayout(nextLayout)
    persistSetting('shiin_workspace_layout', nextLayout)
  }

  const handleOpenFolder = () => {
    void bridge.openFolder(config.path || '')
    setLastNotice(locale.startsWith('zh') ? '已呼出截图保存目录' : 'Opening screenshots folder')
  }

  const handleSelectFolder = async () => {
    const folder = await bridge.selectFolder()
    if (folder) patchConfig({ path: folder })
  }

  const handleShapePreferencesChange = (next: Md3eShapePreferences) => {
    const normalized = normalizeShapePreferences(next)
    setShapePreferences(normalized)
    persistSetting('shapePreferences', normalized)
  }

  const handleRerollShapeSession = () => {
    setShapeSeed(createShapeSeed())
    setLastNotice(locale.startsWith('zh') ? '已重新抽取各类形状' : 'Shapes reshuffled by role')
  }

  const startComboRecording = () => {
    if (releaseDebounceRef.current) {
      clearTimeout(releaseDebounceRef.current)
      releaseDebounceRef.current = null
    }
    recordingKeysSetRef.current.clear()
    setLiveRecordingKeys([])
    setDetectingComboIndex(-1)
    setRecordingCombo(true)
    setLastNotice(locale.startsWith('zh') ? '请按住想要绑定的手柄按键…' : 'Press combo keys on controller…')
  }

  const cancelComboRecording = () => {
    if (releaseDebounceRef.current) {
      clearTimeout(releaseDebounceRef.current)
      releaseDebounceRef.current = null
    }
    recordingKeysSetRef.current.clear()
    setLiveRecordingKeys([])
    setDetectingComboIndex(-1)
    setRecordingCombo(false)
  }

  const isZh = locale.startsWith('zh')

  const handleSelectLocale = (next: string) => {
    setLocale(next)
    persistSetting('locale', next)
    if ((window as any).electronAPI?.applyLocale) {
      void (window as any).electronAPI.applyLocale(next)
    }
  }

  const handleSelectGamepad = (index: number) => {
    setSelectedGamepadIndex(index)
    const device = gamepads.find((gamepad) => gamepad._index === index)
    if (device) void bridge.openGamepad(device)
  }

  const handleAddKey = () => {
    patchConfig({ comboKeys: [...config.comboKeys, `Button${config.comboKeys.length}`] })
  }

  const handleRemoveKey = (index: number) => {
    const next = [...config.comboKeys]
    next.splice(index, 1)
    patchConfig({ comboKeys: next })
  }

  const handleRefreshWindows = async () => {
    setWindows(await bridge.getCaptureWindows())
  }

  const selectLens = (next: Lens) => {
    setSettingsSection('general')
    setLens(next)
    if (next !== 'workspace') setWorkspaceEditing(false)
  }

  /** Title-bar pencil: jump to the workbench and open its layout editor. */
  const toggleWorkspaceEditing = () => {
    const next = !workspaceEditing
    if (next && lens !== 'workspace') selectLens('workspace')
    setWorkspaceEditing(next)
  }

  return (
    <MotionConfig reducedMotion="user">
    <LayoutGroup id={navigationId}>
    <Md3eShapeProvider
      preferences={shapePreferences}
      session={shapeSession}
      onPreferencesChange={handleShapePreferencesChange}
    >
      <div className="shiin-shell" data-theme={effectiveTheme}>
        <TitleBar
          listening={listening}
          uiScale={uiScale}
          onSetUiScale={async (scale) => {
            setUiScale(scale)
            persistSetting('uiScale', scale)
            if (bridge.setUiScale) await bridge.setUiScale(scale)
          }}
          locale={locale}
          onSelectLocale={handleSelectLocale}
          onToggleLocale={() => handleSelectLocale(locale.startsWith('zh') ? 'en' : 'zh')}
          onOpenUpdate={() => setUpdateDialogOpen(true)}
          hasUpdate={hasUpdate}
          maximized={maximized}
          onMinimize={() => bridge.minimizeWindow?.()}
          onToggleMaximize={async () => {
            if (bridge.toggleMaximizeWindow) {
              setMaximized(await bridge.toggleMaximizeWindow())
            }
          }}
          onClose={() => bridge.closeWindow?.()}
          isMac={bridge.isMac}
          isWeb={bridge.isWeb}
          destination={lens}
          onNavigate={selectLens}
          layoutEditing={workspaceEditing}
          onToggleLayoutEdit={toggleWorkspaceEditing}
          onCapture={() => void handleCapture()}
          capturePending={capturePending}
        />

        <div className="shiin-app-layout">
          <CaptureDock
            destination={lens}
            onNavigate={selectLens}
            locale={locale}
            listening={listening}
            pending={capturePending}
            result={captureResult}
            notice={lastNotice.text}
            noticeRevision={lastNotice.revision}
            onCapture={() => void handleCapture()}
            onToggleListen={() => void handleToggleListen()}
            onSaveOBS={() => void handleSaveOBS()}
            onOpenFolder={handleOpenFolder}
          />
          <main id="shiin-main-panel" role="tabpanel" aria-label={lens === 'workspace' ? (isZh ? '工作台' : 'Workspace') : lens === 'analytics' ? (isZh ? '统计' : 'Analytics') : (isZh ? '设置' : 'Settings')} className="shiin-node" data-testid="shiin-app" data-ui-variant="expressive" data-surface="bento" data-lens={lens}>
            <AnimatePresence mode="wait" initial={false}>
            <motion.div className="shiin-view-transition" key={lens}
              onAnimationStart={() => { if (settingsSection !== 'permissions') document.getElementById('shiin-main-panel')?.scrollTo({ top: 0 }) }}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }} transition={{ duration: reduceMotion ? 0 : 0.18 }}>
              {lens === 'workspace' ? (
                <WorkspaceView
                  config={config}
                  onChange={patchConfig}
                  listening={listening}
                  capturePending={capturePending}
                  captureResult={captureResult}
                  onCapture={() => void handleCapture()}
                  onToggleListen={() => void handleToggleListen()}
                  onSaveOBS={() => void handleSaveOBS()}
                  onOpenFolder={handleOpenFolder}
                  onSelectFolder={() => void handleSelectFolder()}
                  gamepads={gamepads}
                  selectedGamepadIndex={selectedGamepadIndex}
                  onSelectGamepad={handleSelectGamepad}
                  screens={screens}
                  windows={windows}
                  onRefreshWindows={() => void handleRefreshWindows()}
                  buttons={buttons}
                  axes={axes}
                  recordingCombo={recordingCombo}
                  liveRecordingKeys={liveRecordingKeys}
                  onStartComboRecording={startComboRecording}
                  onCancelComboRecording={cancelComboRecording}
                  onAddKey={handleAddKey}
                  onClearKeys={() => patchConfig({ comboKeys: [] })}
                  onRemoveKey={handleRemoveKey}
                  detectingKeyboard={detectingKeyboard}
                  onDetectKeyboard={() => setDetectingKeyboard(true)}
                  macPermissions={macPermissions}
                  onOpenPermissions={openPermissions}
                  onRefreshGamepads={() => {
                    void bridge.getConnectedGamepads().then((devices) => setGamepads(devices))
                  }}
                  locale={locale}
                  initialLayout={workspaceLayout}
                  onSaveLayout={handleSaveWorkspaceLayout}
                  layoutEditing={workspaceEditing}
                  onLayoutEditingChange={setWorkspaceEditing}
                />
              ) : lens === 'analytics' ? (
                <AnalyticsDashboardView
                  stats={stats}
                  listening={listening}
                  activeDeviceName={gamepads.find((g) => g._index === selectedGamepadIndex)?.name || gamepads[0]?.name}
                  locale={locale}
                  initialLayout={dashboardLayout}
                  onSaveLayout={handleSaveDashboardLayout}
                  onClearData={handleClearStats}
                  onSeedDemoData={handleSeedStats}
                />
              ) : (
                <SettingsView
                  config={config}
                  onChange={patchConfig}
                  locale={locale}
                  onSelectLocale={handleSelectLocale}
                  isMac={macPermissions?.isMac ?? bridge.isMac}
                  macPermissions={macPermissions}
                  onOpenFolder={handleOpenFolder}
                  onSelectFolder={handleSelectFolder}
                  initialSection={settingsSection}
                  permissionRequest={permissionRequest}
                  saveState={saveState}
                  onRetrySave={retrySave}
                  onRefreshPermissions={async () => {
                    const next = await bridge.getMacOSPermissions?.({ activeProbe: true })
                    if (next) setMacPermissions(next)
                  }}
                  onRequestPermission={async (target) => {
                    const next = await bridge.requestMacOSPermission?.(target, { openSettingsIfDenied: true })
                    if (next) setMacPermissions(next)
                  }}
                  onTestScreenshot={async () => {
                    const result = await bridge.testScreenshotPermission?.(config)
                    if (result?.permissions) setMacPermissions(result.permissions)
                    return result ?? null
                  }}
                  onToggleAutoStart={(enable) => {
                    patchConfig({ autoStart: enable })
                    if (bridge.setAutoStart) void bridge.setAutoStart(enable)
                  }}
                  onEnterLightweightMode={
                    bridge.enterLightweightMode
                      ? () => {
                          void bridge.enterLightweightMode?.()
                        }
                      : undefined
                  }
                  onCheckUpdate={() => setUpdateDialogOpen(true)}
                  onOpenGithub={() => bridge.openExternal?.('https://github.com/AmagiSakuya/GamePad-ScreenShot-Windows')}
                  shapePreferences={shapePreferences}
                  shapeSession={shapeSession}
                  onShapePreferencesChange={handleShapePreferencesChange}
                  onRerollShapeSession={handleRerollShapeSession}
                />
              )}
            </motion.div>
            </AnimatePresence>
          </main>

        </div>

        <FeedbackHost
          notices={feedbackNotices}
          locale={locale}
          theme={effectiveTheme}
          onDismiss={dismissNotice}
          onOpenFolder={handleOpenFolder}
          onPauseTimer={pauseTimer}
          onResumeTimer={resumeTimer}
        />

        <UpdateDialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} />
      </div>
    </Md3eShapeProvider>
    </LayoutGroup>
    </MotionConfig>
  )
}
