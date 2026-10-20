/**
 * Shiin Expressive 主控制台
 *
 * 两页结构：
 * - 工作台：手柄状态、捕获、触发组合、监听与实时测试
 * - 设置：形状、权限、启动、通知、数据
 *
 * 权限诊断不再占用顶级页签，由设置页进入独立诊断面。
 */
import * as React from 'react'
import {
  registerKitStyles,
  ALIAS,
  MD3E_ALIAS,
  XMd3eNodeFrame,
  XMd3eShapeBadge,
  XButton,
  XMd3eNavigationDock,
  XMd3eNavigationRail,
  XMd3eSidebar,
  XMd3eSidebarItem,
} from './md3e.js'
import { Md3eShapeProvider } from './md3e-shape-context.js'
import {
  DEFAULT_SHAPE_PREFERENCES,
  createShapeSeed,
  createShapeSession,
  normalizeShapePreferences,
  type Md3eShapePreferences,
} from './md3e-shapes.js'
import { TitleBar } from './components/TitleBar.js'
import { AppIcon } from './components/AppIcon.js'
import { ElectronHostBridge } from './adapter/electron.js'
import { formatGamepadKey } from './gamepad-utils.js'
import {
  type ScreenshotConfig,
  type GamepadDeviceInfo,
  type CaptureDisplayInfo,
  type CaptureWindowInfo,
  DEFAULT_CONFIG,
} from '../core/types.js'
import { playCaptureSound } from './audio.js'
import { UpdateDialog } from './components/UpdateDialog.js'
import { PermissionsView } from './components/PermissionsView.js'
import { SettingsView } from './components/SettingsView.js'
import { WorkspaceView } from './components/WorkspaceView.js'
import { SETTINGS_BENTO_CSS } from './components/settings-bento-css.js'
import type { MacOSPermissionsStatus } from './adapter/types.js'

type Lens = 'workspace' | 'permissions' | 'settings'

function NavShapeIcon({ path, name }: { path: string; name: string }) {
  return (
    <span className="xaihi-nav-shape-icon" aria-hidden="true">
      <svg className="xaihi-nav-shape-mask" viewBox="0 0 100 100" focusable="false">
        <path d={path} />
      </svg>
      <AppIcon name={name} size={13} />
    </span>
  )
}

export const App: React.FC = () => {
  const bridge = React.useMemo(() => new ElectronHostBridge(), [])

  const [lens, setLens] = React.useState<Lens>('workspace')

  const [config, setConfig] = React.useState<ScreenshotConfig>({ ...DEFAULT_CONFIG })
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
  const [lastNotice, setLastNotice] = React.useState<string>('')
  const localeRef = React.useRef(locale)
  localeRef.current = locale

  const openPermissions = React.useCallback(() => {
    setLens('permissions')
  }, [])

  React.useEffect(() => {
    const unregisterStyles = registerKitStyles()

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

      if (bridge.getAutoStart) {
        const auto = await bridge.getAutoStart()
        setConfig((prev) => ({ ...prev, autoStart: auto }))
      }

      if (bridge.isMac && bridge.getMacOSPermissions) {
        const perms = await bridge.getMacOSPermissions({ activeProbe: false })
        setMacPermissions(perms)
        if (!perms.screenCapture) {
          setLens('permissions')
          setLastNotice(
            savedLocale.startsWith('zh')
              ? '屏幕录制权限尚未授予，已打开权限自检'
              : 'Screen recording permission not granted'
          )
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
      if (devs.length > 0) setGamepads(devs)

      setScreens(await bridge.getScreenSources())
      setWindows(await bridge.getCaptureWindows())
    })()

    const unbindListen = bridge.onListeningStateChanged((state) => setListening(state))
    const unbindDevices = bridge.onGamepadDevicesChanged?.((devs) => {
      if (Array.isArray(devs)) setGamepads(devs)
    })
    const unbindScreenshot = bridge.onScreenshotCompleted?.((res) => {
      if (res?.ok) {
        const current = configRef.current
        if (current.sound && current.sound !== 'None') {
          void playCaptureSound(current.sound, current.soundPower)
        }
        setLastNotice(
          localeRef.current.startsWith('zh')
            ? `截图成功: ${res.filePath || '已写入系统剪贴板'}`
            : `Captured: ${res.filePath || 'Clipboard'}`
        )
      }
    })
    const unbindObsReplay = bridge.onObsReplayCompleted?.((res) => {
      if (res?.ok) {
        setLastNotice(localeRef.current.startsWith('zh') ? 'OBS 回放缓冲已保存' : 'OBS replay buffer saved')
      }
    })
    const unbindPermDialog = bridge.onOpenPermissionDialog?.((data) => {
      openPermissions()
      if (data?.message) setLastNotice(data.message)
      if (bridge.getMacOSPermissions) {
        void bridge.getMacOSPermissions({ activeProbe: true }).then((perms) => setMacPermissions(perms))
      }
    })

    const handleWindowFocus = () => {
      if (bridge.isMac && bridge.getMacOSPermissions) {
        void bridge.getMacOSPermissions({ activeProbe: true }).then((perms) => {
          setMacPermissions(perms)
          if (perms?.screenCapture) {
            setLastNotice(localeRef.current.startsWith('zh') ? '屏幕录制权限已就绪' : 'Screen recording permission granted')
          }
        })
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

      const hasAnyInput =
        (currentButtons && currentButtons.some(Boolean)) ||
        (currentAxes && currentAxes.some((value) => Math.abs(value) > 0.15))
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
          }, 260)
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

  const patchConfig = (patch: Partial<ScreenshotConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch }
      void bridge.setStore('globalConfig', JSON.stringify(next))
      return next
    })
  }

  const handleCapture = async () => {
    const now = Date.now()
    if (now - lastCaptureTimeRef.current < 350) return
    lastCaptureTimeRef.current = now

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
    if (result?.ok) {
      if (config.sound && config.sound !== 'None') {
        void playCaptureSound(config.sound, config.soundPower)
      }
      setLastNotice(
        locale.startsWith('zh')
          ? `截图成功: ${result.filePath || '已写入系统剪贴板'}`
          : `Captured: ${result.filePath || 'Clipboard'}`
      )
      bridge.showNotification?.(
        locale.startsWith('zh') ? '截图已保存' : 'Screenshot Saved',
        result.filePath || (locale.startsWith('zh') ? '已复制至系统剪贴板' : 'Copied to clipboard'),
        result.filePath || undefined
      )
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
      bridge.showNotification?.(
        locale.startsWith('zh') ? '截图失败' : 'Capture Failed',
        result?.error || (locale.startsWith('zh') ? '请检查权限与保存路径' : 'Check permissions and save path')
      )
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
    void bridge.setStore('shapePreferences', normalized)
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

  const activeDevice = gamepads.find((gamepad) => gamepad._index === selectedGamepadIndex) || gamepads[0]
  const isZh = locale.startsWith('zh')
  const macMissing = Boolean(macPermissions?.isMac && !macPermissions.allGranted)

  const handleSelectLocale = (next: string) => {
    setLocale(next)
    void bridge.setStore('locale', next)
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

  const navigationItems = React.useMemo(
    () => [
      {
        id: 'workspace',
        label: isZh ? '工作台' : 'Workspace',
        shortLabel: isZh ? '工作台' : 'Work',
        title: isZh ? '工作台' : 'Workspace',
        icon: <NavShapeIcon path={shapeSession.shapes.icon.svgPath} name="monitor" />,
      },
      {
        id: 'permissions',
        label: isZh ? '权限' : 'Permissions',
        shortLabel: isZh ? '权限' : 'Permissions',
        title: isZh ? '权限中心' : 'Permissions',
        icon: <NavShapeIcon path={shapeSession.shapes.icon.svgPath} name="shield" />,
        badge: macMissing ? '!' : undefined,
      },
      {
        id: 'settings',
        label: isZh ? '设置' : 'Settings',
        shortLabel: isZh ? '设置' : 'Settings',
        title: isZh ? '设置' : 'Settings',
        icon: <NavShapeIcon path={shapeSession.shapes.icon.svgPath} name="settings" />,
      },
    ],
    [isZh, macMissing, shapeSession.shapes.icon.svgPath]
  )

  const selectLens = (next: Lens) => setLens(next)

  return (
    <Md3eShapeProvider
      preferences={shapePreferences}
      session={shapeSession}
      onPreferencesChange={handleShapePreferencesChange}
    >
      <div
        className="shiin-app-shell shiin-expressive-surface"
        style={
          {
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            background: MD3E_ALIAS.surfaceLowest,
            color: ALIAS.onSurface,
            overflow: 'hidden',
          } as React.CSSProperties
        }
      >
        <TitleBar
          listening={listening}
          uiScale={uiScale}
          onSetUiScale={async (scale) => {
            setUiScale(scale)
            void bridge.setStore('uiScale', scale)
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
          permissions={macPermissions}
          onOpenPermissions={openPermissions}
        />

        <div className="xaihi-md3e-app-layout">
          <XMd3eSidebar aria-label={isZh ? '主导航' : 'Main navigation'}>
            <div className="xaihi-md3e-sidebar-brand">
              <XMd3eShapeBadge size="sm" active>
                <AppIcon name="gamepad" size={15} />
              </XMd3eShapeBadge>
              <div style={{ display: 'grid', gap: 1, minWidth: 0, flex: 1 }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: ALIAS.onSurface, whiteSpace: 'nowrap' }}>
                  Shiin Studio
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: listening ? '#7df2d2' : ALIAS.onSurfaceVariant,
                    fontWeight: 700,
                  }}
                >
                  {listening ? (isZh ? '● 正在监听' : '● Listening') : isZh ? '○ 空闲中' : '○ Idle'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, overflowY: 'auto' }}>
              {navigationItems.map((item) => (
                <XMd3eSidebarItem
                  key={item.id}
                  active={lens === item.id}
                  icon={item.icon}
                  label={item.label}
                  badge={item.badge}
                  onClick={() => selectLens(item.id as Lens)}
                />
              ))}
            </div>

            <div className="xaihi-md3e-sidebar-footer">
              <XButton
                variant="filled"
                size="sm"
                onClick={() => void handleCapture()}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <AppIcon name="camera" size={13} />
                <span>{isZh ? '快门截图' : 'Capture'}</span>
              </XButton>
              <XButton
                variant="tonal"
                size="sm"
                onClick={() => void handleToggleListen()}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <AppIcon name={listening ? 'stop' : 'play'} size={13} />
                <span>{listening ? (isZh ? '暂停监听' : 'Pause') : isZh ? '开启监听' : 'Listen'}</span>
              </XButton>
              <XButton
                variant="ghost"
                size="sm"
                onClick={() => void handleSaveOBS()}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <AppIcon name="wave" size={13} />
                <span>{isZh ? 'OBS 回放' : 'Replay'}</span>
              </XButton>
            </div>
          </XMd3eSidebar>

          <XMd3eNavigationRail
            aria-label={isZh ? '紧凑导航' : 'Compact navigation'}
            items={navigationItems}
            value={lens}
            onValueChange={(value) => selectLens(value as Lens)}
            header={
              <XMd3eShapeBadge size="sm" active>
                <AppIcon name="gamepad" size={14} />
              </XMd3eShapeBadge>
            }
            footer={
              <>
                <button
                  type="button"
                  className="xaihi-md3e-rail-item"
                  onClick={() => void handleCapture()}
                  title={isZh ? '立即截图' : 'Capture'}
                >
                  <span className="xaihi-md3e-rail-indicator">
                    <AppIcon name="camera" size={15} />
                  </span>
                  <span className="xaihi-md3e-rail-label">{isZh ? '快门' : 'Shot'}</span>
                </button>
                <button
                  type="button"
                  className="xaihi-md3e-rail-item"
                  onClick={() => void handleToggleListen()}
                  title={listening ? (isZh ? '暂停监听' : 'Pause') : isZh ? '开启监听' : 'Listen'}
                >
                  <span className="xaihi-md3e-rail-indicator">
                    <AppIcon name={listening ? 'stop' : 'play'} size={15} />
                  </span>
                  <span className="xaihi-md3e-rail-label">
                    {listening ? (isZh ? '暂停' : 'Pause') : isZh ? '监听' : 'Listen'}
                  </span>
                </button>
                <button
                  type="button"
                  className="xaihi-md3e-rail-item"
                  onClick={() => void handleSaveOBS()}
                  title={isZh ? '保存 OBS 回放' : 'OBS Replay'}
                >
                  <span className="xaihi-md3e-rail-indicator">
                    <AppIcon name="wave" size={15} />
                  </span>
                  <span className="xaihi-md3e-rail-label">{isZh ? '回放' : 'Replay'}</span>
                </button>
              </>
            }
          />

          <XMd3eNodeFrame
            data-testid="shiin-md3e"
            data-ui-variant="md3e"
            data-surface="bento"
          >
            {lens === 'permissions' ? (
              <PermissionsView
                config={config}
                locale={locale}
                isMac={bridge.isMac}
                permissions={macPermissions}
                gamepads={gamepads}
                onRefreshPermissions={async (activeProbe) => {
                  if (bridge.getMacOSPermissions) {
                    const next = await bridge.getMacOSPermissions({ activeProbe })
                    setMacPermissions(next)
                    return next
                  }
                  return null
                }}
                onRequestPermission={async (target, options) => {
                  if (bridge.requestMacOSPermission) {
                    const next = await bridge.requestMacOSPermission(target, options)
                    setMacPermissions(next)
                    return next
                  }
                  return null
                }}
                onTestScreenshot={async () => {
                  if (bridge.testScreenshotPermission) {
                    const result = await bridge.testScreenshotPermission(config)
                    if (result?.permissions) setMacPermissions(result.permissions)
                    return result
                  }
                  return null
                }}
                onOpenPreference={async (pane) => {
                  if (bridge.openMacOSPreference) await bridge.openMacOSPreference(pane)
                }}
                onOpenFolder={async (customPath) => {
                  const result = await bridge.openFolder(customPath || config.path || '')
                  return result && typeof result === 'object'
                    ? result
                    : { ok: true, path: customPath || config.path }
                }}
                onSelectFolder={handleSelectFolder}
                onShowItemInFolder={async (path) => {
                  if (bridge.showItemInFolder) await bridge.showItemInFolder(path)
                }}
                onRefreshGamepads={async () => {
                  setGamepads(await bridge.getConnectedGamepads())
                }}
                onNavigateWorkspace={() => setLens('workspace')}
              />
            ) : lens === 'workspace' ? (
              <WorkspaceView
                config={config}
                onChange={patchConfig}
                listening={listening}
                onToggleListen={() => void handleToggleListen()}
                onCapture={() => void handleCapture()}
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
                lastNotice={lastNotice}
                locale={locale}
                activeDevice={activeDevice}
              />
            ) : (
              <SettingsView
                config={config}
                onChange={patchConfig}
                locale={locale}
                onSelectLocale={handleSelectLocale}
                isMac={bridge.isMac}
                macPermissions={macPermissions}
                onOpenFolder={handleOpenFolder}
                onSelectFolder={handleSelectFolder}
                onOpenMacPreference={(pane) => bridge.openMacOSPreference?.(pane)}
                onOpenPermissionsView={openPermissions}
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
          </XMd3eNodeFrame>

          <div className="xaihi-md3e-dock-wrapper" aria-label={isZh ? '底部导航' : 'Bottom navigation'}>
            <XMd3eNavigationDock
              items={navigationItems}
              value={lens}
              onValueChange={(value) => selectLens(value as Lens)}
            />
          </div>
        </div>

        <UpdateDialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} />
      </div>
    </Md3eShapeProvider>
  )
}
