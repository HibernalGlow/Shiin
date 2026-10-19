/**
 * Shiin Material 3 Expressive (MD3E) 主控制台
 * 严格按照 Xaihi 最新规范重写，参考 shellect / bitv 架构
 * 采用 Rossi 非对称几何、零边框色阶编排与动态响应式双翼布局
 */
import * as React from 'react'
import {
  registerKitStyles,
  ALIAS,
  MD3E_ALIAS,
  XMd3eNodeFrame,
  XMd3eHeroBanner,
  XMd3eShapeBadge,
  XMd3eActionGroup,
  XMd3eStatTile,
  XMd3eSection,
  XMd3eSegmentedTrack,
  XMd3eSwitch,
  XMd3eSliderCard,
  XMd3eFactRow,
  XButton,
  XMd3eNavigationDock,
  XMd3eSidebar,
  XMd3eSidebarItem,
} from './md3e.js'
import { TitleBar } from './components/TitleBar.js'
import { AppIcon } from './components/AppIcon.js'
import { ElectronHostBridge } from './adapter/electron.js'
import {
  BUTTON_NAME_MAP,
  formatGamepadKey,
  COMMON_COMBO_PRESETS,
} from './gamepad-utils.js'
import {
  type ScreenshotConfig,
  type GamepadDeviceInfo,
  type CaptureDisplayInfo,
  type CaptureWindowInfo,
  DEFAULT_CONFIG,
  CaptureTargetTypeEnum,
  ScreenShotSaveWayEnum,
  ScreenshotSoundEnum,
} from '../core/types.js'
import { playCaptureSound } from './audio.js'
import { UpdateDialog } from './components/UpdateDialog.js'
import { PermissionTestView } from './components/PermissionTestView.js'
import { SettingsView } from './components/SettingsView.js'
import type { MacOSPermissionsStatus } from './adapter/types.js'

export const App: React.FC = () => {
  const bridge = React.useMemo(() => new ElectronHostBridge(), [])

  // 镜头视图 (仿照 shellect Lens 切换设计)
  const [lens, setLens] = React.useState<'studio' | 'combos' | 'capture' | 'tester' | 'permissions' | 'settings'>('studio')

  const [config, setConfig] = React.useState<ScreenshotConfig>({ ...DEFAULT_CONFIG })
  const [listening, setListening] = React.useState<boolean>(false)
  const [gamepads, setGamepads] = React.useState<GamepadDeviceInfo[]>([])
  const [selectedGamepadIndex, setSelectedGamepadIndex] = React.useState<number>(0)
  const [screens, setScreens] = React.useState<CaptureDisplayInfo[]>([])
  const [windows, setWindows] = React.useState<CaptureWindowInfo[]>([])
  const [buttons, setButtons] = React.useState<boolean[]>([])
  const [axes, setAxes] = React.useState<number[]>([])

  // 手柄与组合键多键协同识别状态机
  const [recordingCombo, setRecordingCombo] = React.useState<boolean>(false)
  const [detectingComboIndex, setDetectingComboIndex] = React.useState<number>(-1)
  const [liveRecordingKeys, setLiveRecordingKeys] = React.useState<string[]>([])
  const recordingKeysSetRef = React.useRef<Set<string>>(new Set())
  const releaseDebounceRef = React.useRef<NodeJS.Timeout | null>(null)
  const comboTriggerPressedAtRef = React.useRef<number>(0)
  const comboTriggerHandledRef = React.useRef<boolean>(false)
  const lastCaptureTimeRef = React.useRef<number>(0)
  const [detectingKeyboard, setDetectingKeyboard] = React.useState<boolean>(false)

  // 外观与系统
  const [isDark, setIsDark] = React.useState<boolean>(true)
  const [accent, setAccent] = React.useState<string>('lime')
  const [uiScale, setUiScale] = React.useState<number>(1.0)
  const [locale, setLocale] = React.useState<string>('zh')
  const [updateDialogOpen, setUpdateDialogOpen] = React.useState<boolean>(false)
  const [hasUpdate, setHasUpdate] = React.useState<boolean>(false)
  const [maximized, setMaximized] = React.useState<boolean>(false)
  const [macPermissions, setMacPermissions] = React.useState<MacOSPermissionsStatus | null>(null)
  const [lastNotice, setLastNotice] = React.useState<string>('')

  // 注册全局 MD3E 样式并初始化配置
  React.useEffect(() => {
    const unregisterStyles = registerKitStyles()

    void (async () => {
      const savedTheme = await bridge.getStore('theme', 'dark')
      setIsDark(savedTheme !== 'light')

      const savedAccent = await bridge.getStore('accentColor', 'lime')
      setAccent(savedAccent)

      const savedScale = await bridge.getStore('uiScale', 1.0)
      setUiScale(savedScale)

      const savedLocale = await bridge.getStore('locale', 'zh')
      if (savedLocale === 'zh' || savedLocale === 'en') {
        setLocale(savedLocale)
      }

      if (bridge.getAutoStart) {
        const auto = await bridge.getAutoStart()
        setConfig((p) => ({ ...p, autoStart: auto }))
      }

      if (bridge.isMac && bridge.getMacOSPermissions) {
        const perms = await bridge.getMacOSPermissions({ activeProbe: false })
        setMacPermissions(perms)
        // 关键主动行为：在 macOS 下若缺失屏幕录制核心权限，主动打开权限检查界面引导用户授权
        if (!perms.screenCapture) {
          setLens('permissions')
          setLastNotice(
            (savedLocale || 'zh').startsWith('zh')
              ? '⚠️ 检测到屏幕录制权限尚未授予，已为您主动打开权限检查界面'
              : '⚠️ Screen recording permission not granted'
          )
        }
      }

      const savedGlobal = await bridge.getStore('globalConfig', '')
      if (savedGlobal) {
        try {
          const parsed = typeof savedGlobal === 'string' ? JSON.parse(savedGlobal) : savedGlobal
          setConfig((prev) => ({ ...prev, ...parsed }))
        } catch {
          // ignore
        }
      }

      const devs = await bridge.getConnectedGamepads()
      setGamepads(devs)

      const scrs = await bridge.getScreenSources()
      setScreens(scrs)

      const wins = await bridge.getCaptureWindows()
      setWindows(wins)
    })()

    const unbindListen = bridge.onListeningStateChanged((st) => setListening(st))
    const unbindScreenshot = (window as any).electronAPI?.onScreenshotCompleted?.((res: any) => {
      if (res?.ok) {
        setLastNotice(locale === 'zh' ? `截图成功: ${res.filePath || '已写入系统剪贴板'}` : `Captured: ${res.filePath || 'Clipboard'}`)
      }
    })

    // 监听主进程主动触发的权限弹窗 / 引导请求
    const unbindPermDialog = bridge.onOpenPermissionDialog?.((data) => {
      setLens('permissions')
      if (data?.message) {
        setLastNotice(data.message)
      }
      if (bridge.getMacOSPermissions) {
        void bridge.getMacOSPermissions({ activeProbe: true }).then((p) => setMacPermissions(p))
      }
    })

    // 当用户从 macOS 系统设置切换回本应用窗口时，自动重新自检权限状态
    const handleWindowFocus = () => {
      if (bridge.isMac && bridge.getMacOSPermissions) {
        void bridge.getMacOSPermissions({ activeProbe: true }).then((p) => {
          setMacPermissions(p)
          if (p?.screenCapture) {
            setLastNotice(locale === 'zh' ? '✅ 系统权限检测通过，屏幕录制已就绪' : '✅ Screen recording permission granted')
          }
        })
      }
    }
    window.addEventListener('focus', handleWindowFocus)

    return () => {
      unbindListen()
      if (typeof unbindScreenshot === 'function') unbindScreenshot()
      if (typeof unbindPermDialog === 'function') unbindPermDialog()
      window.removeEventListener('focus', handleWindowFocus)
      unregisterStyles()
    }
  }, [bridge])

  // 轮询手柄按键与物理轴 + 自动唤醒检测 + 多键协同识别状态机
  React.useEffect(() => {
    let tick = 0

    const refreshGamepads = async () => {
      const devs = await bridge.getConnectedGamepads()
      if (devs.length > 0) {
        setGamepads(devs)
        setSelectedGamepadIndex((prev) => {
          if (prev < 0 || !devs.find((d) => d._index === prev)) {
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
      const b = await bridge.getCurrentButtons()
      setButtons(b)
      const a = await bridge.getCurrentAxes()
      setAxes(a)

      // 若手柄列表为空，但在检测到按钮或轴输入时，自动刷新手柄列表（解决 Web Gamepad API 延迟唤醒）
      const hasAnyInput = (b && b.some(Boolean)) || (a && a.some((v) => Math.abs(v) > 0.15))
      if ((gamepads.length === 0 && hasAnyInput) || tick % 30 === 0) {
        void refreshGamepads()
      }

      // 多键协同识别状态机：支持同时按住任意多键（如 LB + RB）
      if (recordingCombo || detectingComboIndex >= 0) {
        const pressedNow: string[] = []
        if (b && b.length > 0) {
          for (let i = 0; i < b.length; i++) {
            if (b[i]) pressedNow.push(`Button${i}`)
          }
        }
        if (a && a.length > 0) {
          for (let j = 0; j < a.length; j++) {
            if (a[j] > 0.85) pressedNow.push(`Axis${j}+`)
            else if (a[j] < -0.85) pressedNow.push(`Axis${j}-`)
          }
        }

        if (pressedNow.length > 0) {
          if (releaseDebounceRef.current) {
            clearTimeout(releaseDebounceRef.current)
            releaseDebounceRef.current = null
          }
          pressedNow.forEach((k) => recordingKeysSetRef.current.add(k))
          setLiveRecordingKeys(Array.from(recordingKeysSetRef.current))
        } else if (recordingKeysSetRef.current.size > 0 && !releaseDebounceRef.current) {
          // 所有按键均已释放，260ms 后防抖结算完整组合
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
                locale === 'zh'
                  ? `已成功绑定组合键: ${captured.map((k) => formatGamepadKey(k, 'zh').name).join(' + ')}`
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
      } else if (listening && config.comboKeys && config.comboKeys.length > 0) {
        // 处于监听状态：实时匹配手柄组合键并执行快门/OBS回放
        let matched = true
        for (const key of config.comboKeys) {
          if (key.startsWith('Button')) {
            const idx = Number(key.replace('Button', ''))
            if (!b || !b[idx]) {
              matched = false
              break
            }
          } else if (key.startsWith('Axis')) {
            const match = key.match(/^Axis\s*(\d+)\s*([+-])$/i)
            if (match) {
              const axisIdx = Number(match[1])
              const dir = match[2]
              const val = a ? (a[axisIdx] ?? 0) : 0
              if (dir === '+' && val < 0.85) matched = false
              else if (dir === '-' && val > -0.85) matched = false
            } else {
              matched = false
            }
            if (!matched) break
          }
        }

        if (matched) {
          if (!comboTriggerPressedAtRef.current) {
            comboTriggerPressedAtRef.current = Date.now()
            comboTriggerHandledRef.current = false
          } else if (
            config.obsReplayBufferOnLongPress &&
            !comboTriggerHandledRef.current &&
            Date.now() - comboTriggerPressedAtRef.current >= 1000
          ) {
            comboTriggerHandledRef.current = true
            void handleSaveOBS()
          }
        } else if (comboTriggerPressedAtRef.current) {
          const duration = Date.now() - comboTriggerPressedAtRef.current
          const wasHandled = comboTriggerHandledRef.current
          comboTriggerPressedAtRef.current = 0
          comboTriggerHandledRef.current = false

          if (duration >= 60 && !wasHandled) {
            void handleCapture()
          }
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

  // 键盘按键识别监听
  React.useEffect(() => {
    if (!detectingKeyboard) return
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault()
      patchConfig({ keyboardTriggerKeyCode: e.keyCode, keyboardTrigger: true })
      setDetectingKeyboard(false)
      setLastNotice(locale === 'zh' ? `已绑定键盘: ${e.code} (${e.keyCode})` : `Bound key: ${e.code}`)
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

    // 预检 macOS 屏幕录制核心权限：缺失时主动打开系统设置界面并切换至权限自检中心
    if (bridge.isMac) {
      let curPerms = macPermissions
      if (!curPerms && bridge.getMacOSPermissions) {
        curPerms = await bridge.getMacOSPermissions({ activeProbe: true })
        setMacPermissions(curPerms)
      }
      if (curPerms && !curPerms.screenCapture) {
        setLens('permissions')
        if (bridge.openMacOSPreference) {
          void bridge.openMacOSPreference('screen')
        }
        setLastNotice(
          locale.startsWith('zh')
            ? '⚠️ 缺失 macOS 屏幕录制权限，已主动为您打开系统设置与权限检查界面！'
            : '⚠️ Missing Screen Recording permission. Opening System Settings...'
        )
        bridge.showNotification?.(
          locale.startsWith('zh') ? '缺少屏幕录制权限' : 'Screen Recording Required',
          locale.startsWith('zh')
            ? '已主动为您打开 macOS 系统设置界面，请在列表中勾选开启 Shiin 权限'
            : 'Opening macOS System Settings...'
        )
        return
      }
    }

    const res = await bridge.capture(config)
    if (res?.ok) {
      if (config.sound && config.sound !== 'None') {
        void playCaptureSound(config.sound, config.soundPower)
      }
      setLastNotice(locale.startsWith('zh') ? `截图成功: ${res.filePath || '已写入系统剪贴板'}` : `Captured: ${res.filePath || 'Clipboard'}`)
      bridge.showNotification?.(
        locale.startsWith('zh') ? '截图已保存' : 'Screenshot Saved',
        res.filePath || (locale.startsWith('zh') ? '已复制至系统剪贴板' : 'Copied to clipboard'),
        res.filePath || undefined
      )
    } else {
      if (bridge.isMac) {
        setLens('permissions')
        if (bridge.openMacOSPreference) {
          void bridge.openMacOSPreference('screen')
        }
      }
      setLastNotice(locale.startsWith('zh') ? `截图失败: ${res?.error || '无法截取屏幕'}` : `Failed: ${res?.error}`)
      bridge.showNotification?.(
        locale.startsWith('zh') ? '截图失败' : 'Capture Failed',
        res?.error || (locale.startsWith('zh') ? '请检查屏幕录制权限与保存路径' : 'Check screen recording permissions')
      )
    }
  }

  const handleToggleListen = async () => {
    if (listening) {
      await bridge.stopListening()
      setListening(false)
      setLastNotice(locale === 'zh' ? '后台手柄监听已停止' : 'Listener stopped')
    } else {
      if (bridge.isMac && config.keyboardTrigger && macPermissions && !macPermissions.accessibility) {
        if (bridge.requestMacOSPermission) {
          void bridge.requestMacOSPermission('accessibility', { openSettingsIfDenied: true })
        }
        setLens('permissions')
        setLastNotice(
          locale === 'zh'
            ? '⚠️ 全局键盘监听需要辅助功能权限，已主动打开权限检查界面'
            : '⚠️ Global keyboard hotkeys require Accessibility permission'
        )
      }
      const ok = await bridge.startListening(config)
      if (ok) {
        setListening(true)
        setLastNotice(locale === 'zh' ? '后台手柄监听已激活' : 'Listener active')
      }
    }
  }

  const handleSaveOBS = async () => {
    const res = await bridge.saveOBSReplay()
    if (res?.ok) {
      setLastNotice(locale === 'zh' ? 'OBS 精彩回放缓冲已保存' : 'OBS replay buffer saved')
    } else {
      setLastNotice(locale === 'zh' ? `OBS 回放保存失败: ${res?.error}` : `OBS replay failed: ${res?.error}`)
    }
  }

  const handleOpenFolder = () => {
    void bridge.openFolder(config.path || '')
    setLastNotice(locale === 'zh' ? '已呼出截图保存目录' : 'Opening screenshots folder')
  }

  const handleSelectFolder = async () => {
    const folder = await bridge.selectFolder()
    if (folder) patchConfig({ path: folder })
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
    setLastNotice(locale === 'zh' ? '请按住想要绑定的手柄按键（支持多键同时按压）...' : 'Press combo keys on controller...')
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

  const activeDevice = gamepads.find((g) => g._index === selectedGamepadIndex) || gamepads[0]
  const isZh = locale === 'zh'
  const isWindowMode = config.captureTargetType === CaptureTargetTypeEnum.Window

  const lensList = React.useMemo(() => [
    {
      id: 'studio' as const,
      label: isZh ? '双翼全景' : 'Studio',
      shortLabel: isZh ? '全景' : 'Studio',
      icon: 'monitor',
    },
    {
      id: 'combos' as const,
      label: isZh ? '按键矩阵' : 'Combos',
      shortLabel: isZh ? '矩阵' : 'Combos',
      icon: 'gamepad',
      badge: config.comboKeys.length > 0 ? String(config.comboKeys.length) : undefined,
    },
    {
      id: 'capture' as const,
      label: isZh ? '捕获与输出' : 'Capture & Save',
      shortLabel: isZh ? '捕获' : 'Capture',
      icon: 'camera',
    },
    {
      id: 'tester' as const,
      label: isZh ? '物理测试器' : 'Tester',
      shortLabel: isZh ? '测试' : 'Tester',
      icon: 'target',
    },
    {
      id: 'permissions' as const,
      label: isZh ? '权限自检中心' : 'Permissions',
      shortLabel: isZh ? '权限' : 'Permissions',
      icon: 'shield',
      badge: macPermissions && !macPermissions.allGranted ? '!' : undefined,
    },
    {
      id: 'settings' as const,
      label: isZh ? '系统设置' : 'Settings',
      shortLabel: isZh ? '设置' : 'Settings',
      icon: 'settings',
    },
  ], [isZh, config.comboKeys.length, macPermissions])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: MD3E_ALIAS.surfaceLowest,
        color: ALIAS.onSurface,
        overflow: 'hidden',
      }}
    >
      <TitleBar
        listening={listening}
        isDark={isDark}
        onToggleTheme={() => {
          const next = !isDark
          setIsDark(next)
          void bridge.setStore('theme', next ? 'dark' : 'light')
        }}
        accent={accent}
        onSetAccent={(acc) => {
          setAccent(acc)
          void bridge.setStore('accentColor', acc)
        }}
        uiScale={uiScale}
        onSetUiScale={async (sc) => {
          setUiScale(sc)
          void bridge.setStore('uiScale', sc)
          if (bridge.setUiScale) await bridge.setUiScale(sc)
        }}
        locale={locale}
        onSelectLocale={(next) => {
          setLocale(next)
          void bridge.setStore('locale', next)
          if ((window as any).electronAPI?.applyLocale) {
            void (window as any).electronAPI.applyLocale(next)
          }
        }}
        onToggleLocale={() => {
          const next = locale === 'zh' ? 'en' : 'zh'
          setLocale(next)
          void bridge.setStore('locale', next)
          if ((window as any).electronAPI?.applyLocale) {
            void (window as any).electronAPI.applyLocale(next)
          }
        }}
        onOpenUpdate={() => setUpdateDialogOpen(true)}
        hasUpdate={hasUpdate}
        maximized={maximized}
        onMinimize={() => bridge.minimizeWindow?.()}
        onToggleMaximize={async () => {
          if (bridge.toggleMaximizeWindow) {
            const st = await bridge.toggleMaximizeWindow()
            setMaximized(st)
          }
        }}
        onClose={() => bridge.closeWindow?.()}
        isMac={bridge.isMac}
        permissions={macPermissions}
        onOpenPermissions={() => setLens('permissions')}
      />

      {/* 主响应式工作区架构：宽屏 Rossi 侧栏 + 节点视口 + 窄屏浮动 Dock */}
      <div className="xaihi-md3e-app-layout">
        {/* 宽屏 Rossi 侧栏导航 (Navigation Rail) */}
        <XMd3eSidebar aria-label="Shiin 宽屏侧栏导航">
          <div className="xaihi-md3e-sidebar-brand">
            <XMd3eShapeBadge shape="clover" size="sm" active>
              <AppIcon name="gamepad" size={15} />
            </XMd3eShapeBadge>
            <div style={{ display: 'grid', gap: 1, minWidth: 0, flex: 1 }}>
              <span style={{ fontWeight: 800, fontSize: 13, color: ALIAS.onSurface, whiteSpace: 'nowrap' }}>Shiin Studio</span>
              <span style={{ fontSize: 10, color: listening ? MD3E_ALIAS.primary : ALIAS.onSurfaceVariant, fontWeight: 700 }}>
                {listening ? (isZh ? '● 正在监听' : '● Listening') : (isZh ? '○ 空闲中' : '○ Idle')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, overflowY: 'auto' }}>
            {lensList.map((item) => (
              <XMd3eSidebarItem
                key={item.id}
                active={lens === item.id}
                icon={<AppIcon name={item.icon} size={15} />}
                label={item.label}
                badge={item.badge}
                onClick={() => setLens(item.id)}
              />
            ))}
          </div>

          <div className="xaihi-md3e-sidebar-footer">
            <XButton variant="filled" size="sm" onClick={handleCapture} style={{ width: '100%', justifyContent: 'flex-start' }}>
              <AppIcon name="camera" size={13} />
              <span>{isZh ? '快门截图' : 'Capture'}</span>
            </XButton>
            <XButton variant="tonal" size="sm" onClick={handleToggleListen} style={{ width: '100%', justifyContent: 'flex-start' }}>
              <AppIcon name={listening ? 'stop' : 'play'} size={13} />
              <span>{listening ? (isZh ? '暂停监听' : 'Pause') : (isZh ? '开启监听' : 'Listen')}</span>
            </XButton>
            <XButton variant="ghost" size="sm" onClick={handleSaveOBS} style={{ width: '100%', justifyContent: 'flex-start' }}>
              <AppIcon name="wave" size={13} />
              <span>{isZh ? 'OBS 回放' : 'Replay'}</span>
            </XButton>
          </div>
        </XMd3eSidebar>

        {/* 主 MD3E 节点框架 */}
        <XMd3eNodeFrame data-testid="shiin-md3e" data-ui-variant="md3e">
          {/* 顶部 HeroBanner */}
          <XMd3eHeroBanner
            title={isZh ? 'Shiin · 游戏手柄截图与即时回放' : 'Shiin · Gamepad Screen Capture & Replay'}
            description={
              isZh
                ? 'DXGI DDA 显存硬件直通 · 3D 游戏精准裁切 · 手柄物理组合键实时监听'
                : 'DXGI DDA hardware direct capture · 3D game precise cropping · Gamepad physical combos'
            }
            tone="primary"
            badge={
              <XMd3eShapeBadge shape="clover" size="md" active>
                <AppIcon name="gamepad" size={20} />
              </XMd3eShapeBadge>
            }
            meta={
              <>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  borderRadius: 999,
                  padding: '3px 8px',
                  background: listening ? 'color-mix(in srgb, #b4f461 18%, transparent)' : 'rgba(255, 255, 255, 0.08)',
                  color: listening ? MD3E_ALIAS.primary : ALIAS.onSurfaceVariant,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                  {listening ? (isZh ? '监听中' : 'Listening') : (isZh ? '空闲' : 'Idle')}
                </span>
                <span style={{
                  borderRadius: 999,
                  padding: '3px 8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: ALIAS.onSurfaceVariant,
                }}>
                  {activeDevice ? activeDevice.name : (isZh ? '未检测到手柄' : 'No Gamepad')}
                </span>
                <span style={{
                  borderRadius: 999,
                  padding: '3px 8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: ALIAS.onSurfaceVariant,
                }}>
                  {isWindowMode ? (isZh ? '模式: 窗口裁切' : 'Mode: Window') : (isZh ? '模式: 全屏 DXGI' : 'Mode: Screen')}
                </span>
                {lastNotice && (
                  <span style={{
                    borderRadius: 999,
                    padding: '3px 8px',
                    background: 'color-mix(in srgb, #61d5f4 15%, transparent)',
                    color: '#61d5f4',
                  }}>
                    {lastNotice}
                  </span>
                )}
              </>
            }
          >
            <XMd3eActionGroup>
              <XButton variant="filled" onClick={handleCapture}>
                <AppIcon name="camera" size={13} />
                {isZh ? '立即快门截图' : 'Capture'}
              </XButton>
              <XButton variant="tonal" onClick={handleToggleListen}>
                <AppIcon name={listening ? 'stop' : 'play'} size={13} />
                {listening ? (isZh ? '暂停监听' : 'Pause Listen') : (isZh ? '开启监听' : 'Start Listen')}
              </XButton>
              <XButton variant="tonal" onClick={handleSaveOBS}>
                <AppIcon name="wave" size={13} />
                {isZh ? 'OBS 回放' : 'OBS Replay'}
              </XButton>
              <XButton variant="ghost" onClick={handleOpenFolder}>
                <AppIcon name="folder" size={13} />
                {isZh ? '打开目录' : 'Folder'}
              </XButton>
              {bridge.isMac && (
                <XButton
                  variant={macPermissions && !macPermissions.allGranted ? 'danger' : 'ghost'}
                  onClick={() => setLens('permissions')}
                  style={{
                    color: macPermissions && !macPermissions.allGranted ? '#fb5f76' : undefined,
                    borderColor: macPermissions && !macPermissions.allGranted ? 'rgba(251, 95, 118, 0.45)' : undefined,
                  }}
                >
                  <AppIcon name="shield" size={13} />
                  {isZh
                    ? macPermissions && !macPermissions.allGranted
                      ? '⚠️ 权限缺失'
                      : '权限自检'
                    : macPermissions && !macPermissions.allGranted
                    ? '⚠️ Permissions'
                    : 'Permissions'}
                </XButton>
              )}
            </XMd3eActionGroup>
          </XMd3eHeroBanner>

        {/* 4 格状态指示阵列 */}
        <div className="xaihi-md3e-stats-grid">
          <XMd3eStatTile
            value={activeDevice ? activeDevice.name.split(' ')[0] : 'None'}
            label={isZh ? '当前活动手柄' : 'Active Gamepad'}
          />
          <XMd3eStatTile
            value={listening ? (isZh ? '🟢 正在监听' : '🟢 Listening') : (isZh ? '⚪ 已暂停' : '⚪ Idle')}
            label={isZh ? '全局热键监听' : 'Global Listener'}
          />
          <XMd3eStatTile
            value={isWindowMode ? (isZh ? '窗口物理裁切' : 'Window Crop') : (isZh ? '全屏 DXGI DDA' : 'Screen DXGI')}
            label={isZh ? '画面捕获内核' : 'Capture Pipeline'}
          />
          <XMd3eStatTile
            value={`${config.imageFormat.toUpperCase()} · ${config.screenShotSaveWay}`}
            label={isZh ? '输出策略' : 'Output Strategy'}
          />
        </div>

        {/* 主内容双翼排版 */}
        <div className="xaihi-md3e-main-grid" data-single-column={lens !== 'studio' ? 'true' : 'false'}>
          {/* 左翼：平台与捕获引擎控制 */}
          {(lens === 'studio' || lens === 'capture') && (
            <div style={{ display: 'grid', gap: 12 }}>
              {/* 渲染管线与捕获目标 */}
              <XMd3eSection
                title={isZh ? '画面捕获引擎与源' : 'Capture Pipeline & Source'}
                description={
                  isZh
                    ? '针对 DirectX 11/12 独占 3D 游戏（如《终末地》），DXGI 硬件直接抓取仅需 50ms，自动回退防卡死防黑屏。'
                    : 'DirectX 11/12 game capture uses DXGI DDA hardware extraction.'
                }
              >
                <XMd3eSegmentedTrack
                  options={[
                    { value: CaptureTargetTypeEnum.Screen, label: isZh ? '全屏 DXGI (全屏/无边框)' : 'Full Desktop' },
                    { value: CaptureTargetTypeEnum.Window, label: isZh ? '窗口精准裁切 (避免背景)' : 'Target Window' },
                  ]}
                  value={config.captureTargetType}
                  onChange={(val) => patchConfig({ captureTargetType: val as CaptureTargetTypeEnum })}
                />

                {isWindowMode ? (
                  <div style={{ display: 'grid', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: ALIAS.onSurfaceVariant }}>{isZh ? '目标游戏窗口' : 'Target Window'}</span>
                      <XButton
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          const wins = await bridge.getCaptureWindows()
                          setWindows(wins)
                        }}
                      >
                        <AppIcon name="refresh" size={11} />
                        {isZh ? '刷新窗口列表' : 'Refresh'}
                      </XButton>
                    </div>
                    <select
                      style={{
                        padding: '10px 14px',
                        borderRadius: 14,
                        border: 0,
                        background: MD3E_ALIAS.surfaceHigh,
                        color: ALIAS.onSurface,
                        fontSize: 12,
                        fontFamily: 'inherit',
                      }}
                      value={config.windowSourceId}
                      onChange={(e) => patchConfig({ windowSourceId: e.target.value })}
                    >
                      <option value="">{isZh ? '-- 请选择目标游戏/窗口 --' : '-- Select Window --'}</option>
                      {windows.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.title} ({w.ownerName || 'PID: ' + w.processId})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 6 }}>
                    <span style={{ fontSize: 12, color: ALIAS.onSurfaceVariant }}>{isZh ? '显示器选择' : 'Display'}</span>
                    <select
                      style={{
                        padding: '10px 14px',
                        borderRadius: 14,
                        border: 0,
                        background: MD3E_ALIAS.surfaceHigh,
                        color: ALIAS.onSurface,
                        fontSize: 12,
                        fontFamily: 'inherit',
                      }}
                      value={config.screenSourceId}
                      onChange={(e) => patchConfig({ screenSourceId: e.target.value })}
                    >
                      {screens.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </XMd3eSection>

              {/* 全局监听与 OBS 联动 */}
              <XMd3eSection
                title={isZh ? '全局监听与自动化联动' : 'Listener & Automation'}
                description={isZh ? '配置物理手柄后台监听与长按录屏回放缓冲。' : 'Gamepad global background triggers and OBS replay.'}
              >
                <XMd3eSwitch
                  checked={listening}
                  onCheckedChange={handleToggleListen}
                  label={isZh ? '手柄物理全局监听' : 'Gamepad Global Listener'}
                  description={
                    listening
                      ? (isZh ? '后台热键已激活，按下组合键静默截图' : 'Active in background')
                      : (isZh ? '已暂停监听，手柄按键不触发动作' : 'Paused')
                  }
                  value={listening ? (isZh ? '已激活' : 'Active') : (isZh ? '已暂停' : 'Idle')}
                  leading={
                    <XMd3eShapeBadge shape="sunny" size="sm" active={listening}>
                      ⚡
                    </XMd3eShapeBadge>
                  }
                />

                <XMd3eSwitch
                  checked={config.obsReplayBufferOnLongPress}
                  onCheckedChange={(c) => patchConfig({ obsReplayBufferOnLongPress: c })}
                  label={isZh ? '长按 (≥1秒) 保存 OBS 回放' : 'Long Press (≥1s) Save OBS Replay'}
                  description={isZh ? '按住组合键 1 秒保存精彩回放片段，松开时不重复截屏' : 'Trigger OBS replay buffer on 1s hold'}
                  value={config.obsReplayBufferOnLongPress ? (isZh ? '开启' : 'ON') : (isZh ? '关闭' : 'OFF')}
                />

                <XMd3eSwitch
                  checked={config.saveByActiveWinTitle}
                  onCheckedChange={(c) => patchConfig({ saveByActiveWinTitle: c })}
                  label={isZh ? '按游戏标题分目录归档' : 'Folder by Game Title'}
                  description={isZh ? '自动在保存目录下创建游戏专属文件夹（如 ./screenshots/Endfield/）' : 'Auto-create subfolder'}
                  value={config.saveByActiveWinTitle ? (isZh ? '开启' : 'ON') : (isZh ? '关闭' : 'OFF')}
                />

                <XMd3eSwitch
                  checked={config.keyboardTrigger}
                  onCheckedChange={(c) => patchConfig({ keyboardTrigger: c })}
                  label={isZh ? '启用键盘辅助快捷键' : 'Keyboard Trigger Hotkey'}
                  description={
                    config.keyboardTriggerKeyCode
                      ? `${isZh ? '当前键码' : 'KeyCode'}: ${config.keyboardTriggerKeyCode}`
                      : (isZh ? '未设置按键，点击右侧设置' : 'Not configured')
                  }
                  value={
                    detectingKeyboard ? (
                      <span style={{ color: MD3E_ALIAS.primary }}>{isZh ? '请按键盘…' : 'Press...'}</span>
                    ) : (
                      <XButton
                        variant="tonal"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDetectingKeyboard(true)
                        }}
                      >
                        {isZh ? '识别按键' : 'Detect'}
                      </XButton>
                    )
                  }
                />
              </XMd3eSection>

              {/* 快门音效与声音 */}
              <XMd3eSection
                title={isZh ? '快门反馈音效' : 'Shutter Sound'}
                description={isZh ? '支持 5 款专业单反与微单快门声（徕卡 M10、单反快门、佳能 5D 等）。' : '5 studio-grade DSLR & mirrorless shutter sounds.'}
              >
                <select
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 12,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: MD3E_ALIAS.surfaceHigh,
                    color: ALIAS.onSurface,
                    fontSize: 12,
                    fontWeight: 650,
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                  value={config.sound}
                  onChange={(e) => {
                    const nextVal = e.target.value as ScreenshotSoundEnum
                    patchConfig({ sound: nextVal })
                    if (nextVal !== ScreenshotSoundEnum.None) {
                      void playCaptureSound(nextVal, config.soundPower)
                    }
                  }}
                >
                  <option value={ScreenshotSoundEnum.Sound1}>{isZh ? '音效 1 · 徕卡 M10 快门 (96ms)' : 'Sound 1 · Leica M10 (96ms)'}</option>
                  <option value={ScreenshotSoundEnum.Sound2}>{isZh ? '音效 2 · 柔和铃声 (373ms)' : 'Sound 2 · Soft Chime (373ms)'}</option>
                  <option value={ScreenshotSoundEnum.Sound3}>{isZh ? '音效 3 · 单反快门 (100ms)' : 'Sound 3 · Shutter (100ms)'}</option>
                  <option value={ScreenshotSoundEnum.Sound4}>{isZh ? '音效 4 · 机械反光板咔哒 (143ms)' : 'Sound 4 · SLR Clack (143ms)'}</option>
                  <option value={ScreenshotSoundEnum.Sound5}>{isZh ? '音效 5 · 佳能 5D 快门 (164ms)' : 'Sound 5 · Canon 5D (164ms)'}</option>
                  <option value={ScreenshotSoundEnum.None}>{isZh ? '静音 (关闭)' : 'Mute (None)'}</option>
                </select>

                {config.sound !== ScreenshotSoundEnum.None && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                    <div style={{ flex: 1 }}>
                      <XMd3eSliderCard
                        label={isZh ? '快门反馈音量' : 'Sound Volume'}
                        value={Math.round((config.soundPower || 1) * 100)}
                        onChange={(val) => {
                          patchConfig({ soundPower: val / 100 })
                        }}
                      />
                    </div>
                    <XButton
                      variant="tonal"
                      size="sm"
                      onClick={() => void playCaptureSound(config.sound, config.soundPower)}
                      title={isZh ? '播放试听当前音效' : 'Play test sound'}
                    >
                      <AppIcon name="volume" size={13} />
                      {isZh ? '试听' : 'Test'}
                    </XButton>
                  </div>
                )}
              </XMd3eSection>

              {/* 核心接线信息 */}
              <XMd3eSection title={isZh ? '硬件与文件接线 (Facts)' : 'Hardware & Path Facts'}>
                <XMd3eFactRow label={isZh ? '活动物理手柄' : 'Active Gamepad'} value={activeDevice ? activeDevice.name : '—'} />
                <XMd3eFactRow label={isZh ? '截屏存储路径' : 'Save Directory'} value={config.path || './screenshots'} />
                <XMd3eFactRow label={isZh ? '文件名模板' : 'Filename Template'} value={config.fileNameTemplate} />
                <XMd3eFactRow label={isZh ? '图像格式' : 'Image Format'} value={config.imageFormat.toUpperCase()} />
              </XMd3eSection>
            </div>
          )}

          {/* 右翼：手柄按键组合与实时感应矩阵 */}
          {(lens === 'studio' || lens === 'combos' || lens === 'tester') && (
            <div style={{ display: 'grid', gap: 12 }}>
              {/* 组合键编排卡片 */}
              <XMd3eSection
                title={isZh ? '手柄触发按键组合' : 'Gamepad Trigger Combos'}
                description={
                  isZh
                    ? '支持多按键同时按下、肩键组合（如 LB+RB）、摇杆推到底。点击「识别组合键」直接在手柄上按压绑定。'
                    : 'Supports multi-button combos (e.g. LB+RB), triggers, and full-tilt sticks. Click Detect to map live.'
                }
                actions={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <XButton
                      variant={recordingCombo ? 'filled' : 'tonal'}
                      size="sm"
                      onClick={() => (recordingCombo ? cancelComboRecording() : startComboRecording())}
                    >
                      <AppIcon name="target" size={12} />
                      {recordingCombo ? (isZh ? '取消识别' : 'Cancel') : (isZh ? '识别组合键' : 'Detect Combo')}
                    </XButton>
                    <XButton
                      variant="ghost"
                      size="sm"
                      onClick={() => patchConfig({ comboKeys: [...config.comboKeys, `Button${config.comboKeys.length}`] })}
                      title={isZh ? '手动追加单个按键' : 'Append single key'}
                    >
                      <AppIcon name="plus" size={11} />
                      {isZh ? '加按键' : 'Add Key'}
                    </XButton>
                    {config.comboKeys.length > 0 && (
                      <XButton
                        variant="danger"
                        size="sm"
                        style={{ color: '#ff6b81', fontWeight: 750 }}
                        onClick={() => patchConfig({ comboKeys: [] })}
                        title={isZh ? '清空全部按键' : 'Clear all'}
                      >
                        <AppIcon name="trash" size={11} />
                        {isZh ? '清空' : 'Clear'}
                      </XButton>
                    )}
                  </div>
                }
              >
                {/* 目标手柄选择器 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: ALIAS.onSurfaceVariant, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AppIcon name="gamepad" size={13} />
                    {isZh ? '目标手柄设备' : 'Selected Gamepad'}
                  </span>
                  <select
                    style={{
                      padding: '6px 12px',
                      borderRadius: 12,
                      border: 0,
                      background: MD3E_ALIAS.surfaceHigh,
                      color: ALIAS.onSurface,
                      fontSize: 11,
                      fontWeight: 650,
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                    value={selectedGamepadIndex}
                    onChange={(e) => {
                      const idx = Number(e.target.value)
                      setSelectedGamepadIndex(idx)
                      const dev = gamepads.find((g) => g._index === idx)
                      if (dev) void bridge.openGamepad(dev)
                    }}
                  >
                    {gamepads.map((g) => (
                      <option key={g._index} value={g._index}>
                        🎮 {g.name} (已连接)
                      </option>
                    ))}
                    {gamepads.length === 0 && (
                      <option value={-1}>
                        {isZh ? '未检测到手柄 (按手柄任意键唤醒)' : 'No gamepad (press any button)'}
                      </option>
                    )}
                  </select>
                </div>

                {/* 正在多键协同录制状态横幅 */}
                {recordingCombo && (
                  <div
                    style={{
                      padding: '14px 16px',
                      borderRadius: '20px 14px 18px 10px',
                      background: MD3E_ALIAS.primaryContainer,
                      color: MD3E_ALIAS.onPrimaryContainer,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      border: `1px solid ${MD3E_ALIAS.primary}`,
                      boxShadow: '0 4px 20px rgba(180, 244, 97, 0.25)',
                      animation: 'xaihi-entry-fade-up 180ms ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 13 }}>
                        <i
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: MD3E_ALIAS.onPrimaryContainer,
                            boxShadow: '0 0 8px currentColor',
                          }}
                        />
                        <span>{isZh ? '正在识别组合键：请同时按住多个按键…' : 'Recording Combo: Press buttons simultaneously...'}</span>
                      </div>
                      <XButton
                        variant="tonal"
                        size="sm"
                        style={{
                          background: 'rgba(0, 0, 0, 0.25)',
                          color: MD3E_ALIAS.onPrimaryContainer,
                          fontWeight: 800,
                        }}
                        onClick={cancelComboRecording}
                      >
                        {isZh ? '取消' : 'Cancel'}
                      </XButton>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', minHeight: 28 }}>
                      {liveRecordingKeys.length > 0 ? (
                        liveRecordingKeys.map((k, i) => {
                          const info = formatGamepadKey(k, isZh ? 'zh' : 'en')
                          return (
                            <React.Fragment key={i}>
                              {i > 0 && <span style={{ fontWeight: 900, fontSize: 16 }}>+</span>}
                              <span
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: 8,
                                  background: MD3E_ALIAS.onPrimaryContainer,
                                  color: MD3E_ALIAS.primaryContainer,
                                  fontWeight: 850,
                                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                  fontSize: 12,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                {info.key}
                                <span style={{ fontSize: 10.5, opacity: 0.85 }}>({info.name})</span>
                              </span>
                            </React.Fragment>
                          )
                        })
                      ) : (
                        <span style={{ fontSize: 12, fontStyle: 'italic', opacity: 0.8 }}>
                          {isZh ? '等待手柄按键按下（如同时按住 LB + RB）…' : 'Waiting for controller keys (e.g. hold LB + RB)...'}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: 11, opacity: 0.85 }}>
                      {isZh ? '💡 提示：按住需要的全部按键，完全松开后系统将自动保存此组合。' : '💡 Tip: Hold down all keys you need, then release to auto-save.'}
                    </div>
                  </div>
                )}

                {/* 当前组合键展示区（公式连结流） */}
                {!recordingCombo && (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {config.comboKeys.length > 0 ? (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                          padding: '12px 14px',
                          borderRadius: '20px 14px 18px 10px',
                          background: MD3E_ALIAS.surfaceHigh,
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                          {config.comboKeys.map((key, idx) => {
                            const info = formatGamepadKey(key, isZh ? 'zh' : 'en')
                            return (
                              <React.Fragment key={idx}>
                                {idx > 0 && (
                                  <span style={{ fontWeight: 900, color: MD3E_ALIAS.primary, fontSize: 16 }}>+</span>
                                )}
                                <div
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '6px 12px',
                                    borderRadius: 12,
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                  }}
                                >
                                  <XMd3eShapeBadge shape="rounded" size="sm">
                                    {idx + 1}
                                  </XMd3eShapeBadge>
                                  <span
                                    style={{
                                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                      fontWeight: 800,
                                      fontSize: 12.5,
                                      color: ALIAS.onSurface,
                                    }}
                                  >
                                    {info.key}
                                  </span>
                                  <span style={{ fontSize: 11, color: MD3E_ALIAS.primary, fontWeight: 700 }}>
                                    ({info.name})
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = [...config.comboKeys]
                                      next.splice(idx, 1)
                                      patchConfig({ comboKeys: next })
                                    }}
                                    style={{
                                      width: 18,
                                      height: 18,
                                      borderRadius: '50%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      border: 'none',
                                      background: 'rgba(255, 255, 255, 0.1)',
                                      color: ALIAS.onSurfaceVariant,
                                      padding: 0,
                                      marginLeft: 4,
                                      transition: 'all 120ms ease',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = '#e81123'
                                      e.currentTarget.style.color = '#ffffff'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                                      e.currentTarget.style.color = ALIAS.onSurfaceVariant
                                    }}
                                    title={isZh ? '移除此按键' : 'Remove key'}
                                  >
                                    <AppIcon name="close" size={10} />
                                  </button>
                                </div>
                              </React.Fragment>
                            )
                          })}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: ALIAS.onSurfaceVariant }}>
                          <AppIcon name="check" size={12} style={{ color: MD3E_ALIAS.primary }} />
                          <span>
                            {isZh
                              ? `当前组合共 ${config.comboKeys.length} 个键，游戏内同时按下时触发截图。`
                              : `Requires ${config.comboKeys.length} keys pressed simultaneously to trigger.`}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: '16px',
                          border: '1px dashed rgba(255, 255, 255, 0.1)',
                          borderRadius: 18,
                          textAlign: 'center',
                          color: ALIAS.onSurfaceVariant,
                          fontSize: 12,
                        }}
                      >
                        {isZh
                          ? '暂无手柄按键组合。点击右上角「识别组合键」按动手柄，或选择下方快捷预设。'
                          : 'No combo keys yet. Click Detect Combo or pick a preset below.'}
                      </div>
                    )}
                  </div>
                )}

                {/* 常用预设推荐条 */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: ALIAS.onSurfaceVariant, fontWeight: 700 }}>
                    {isZh ? '常用预设：' : 'Presets:'}
                  </span>
                  {COMMON_COMBO_PRESETS.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        patchConfig({ comboKeys: [...p.keys] })
                        setLastNotice(isZh ? `已应用预设: ${p.labelZh}` : `Applied preset: ${p.labelEn}`)
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 999,
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        background: 'rgba(255, 255, 255, 0.04)',
                        color: ALIAS.onSurfaceVariant,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 120ms ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                        e.currentTarget.style.color = ALIAS.onSurface
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
                        e.currentTarget.style.color = ALIAS.onSurfaceVariant
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      {isZh ? p.labelZh : p.labelEn}
                    </button>
                  ))}
                </div>
              </XMd3eSection>

              {/* 实时硬件响应测试器 */}
              <XMd3eSection
                title={isZh ? '手柄硬件实时测试器' : 'Live Hardware Tester'}
                description={
                  isZh
                    ? '按下物理手柄按键或转动摇杆，实时测试连接与信号偏转。'
                    : 'Live button triggers and analog stick axes.'
                }
              >
                {/* 20 键矩阵 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(46px, 1fr))', gap: 8 }}>
                  {buttons.map((pressed, i) => {
                    const aliasInfo = BUTTON_NAME_MAP[`Button${i}`]
                    const shortName = aliasInfo ? aliasInfo.name.split('/')[0].split('(')[0].trim() : (pressed ? 'ON' : 'OFF')
                    return (
                      <div
                        key={i}
                        style={{
                          height: 44,
                          borderRadius: 10,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                          fontSize: 10,
                          fontWeight: 800,
                          background: pressed ? MD3E_ALIAS.primary : MD3E_ALIAS.surfaceHigh,
                          color: pressed ? MD3E_ALIAS.onPrimary : ALIAS.onSurfaceVariant,
                          boxShadow: pressed ? '0 0 14px rgba(180, 244, 97, 0.4)' : 'none',
                          transform: pressed ? 'scale(1.08)' : 'scale(1)',
                          transition: 'all 80ms ease',
                          gap: 1,
                        }}
                      >
                        <span>B{i}</span>
                        <span style={{ fontSize: 8, opacity: pressed ? 1 : 0.65 }}>{shortName}</span>
                      </div>
                    )
                  })}
                  {buttons.length === 0 && (
                    <div style={{ color: ALIAS.onSurfaceVariant, fontSize: 11, gridColumn: '1 / -1' }}>
                      {isZh ? '暂无手柄信号，请连接手柄' : 'No signal, connect gamepad'}
                    </div>
                  )}
                </div>

                {/* 摇杆与模拟轴 */}
                {axes.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8, marginTop: 4 }}>
                    {axes.map((val, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                          padding: '6px 12px',
                          borderRadius: 12,
                          background: MD3E_ALIAS.surfaceHigh,
                          fontSize: 11,
                        }}
                      >
                        <span style={{ color: ALIAS.onSurfaceVariant }}>Axis {idx}</span>
                        <div style={{
                          flex: 1,
                          height: 6,
                          borderRadius: 999,
                          background: MD3E_ALIAS.surfaceLowest,
                          position: 'relative',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            position: 'absolute',
                            left: '50%',
                            width: `${Math.abs(val) * 50}%`,
                            height: '100%',
                            background: MD3E_ALIAS.primary,
                            transform: val < 0 ? 'translateX(-100%)' : 'none',
                          }} />
                        </div>
                        <span style={{
                          fontFamily: 'ui-monospace, monospace',
                          fontSize: 10,
                          width: 32,
                          textAlign: 'right',
                        }}>
                          {val.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </XMd3eSection>
            </div>
          )}

          {/* 权限自检中心主视图 */}
          {lens === 'permissions' && (
            <div style={{ gridColumn: '1 / -1' }}>
              <PermissionTestView
                config={config}
                locale={isZh ? 'zh' : 'en'}
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
                    const res = await bridge.testScreenshotPermission(config)
                    if (res?.permissions) setMacPermissions(res.permissions)
                    return res
                  }
                  return null
                }}
                onOpenPreference={async (pane) => {
                  if (bridge.openMacOSPreference) {
                    await bridge.openMacOSPreference(pane)
                  }
                }}
                onOpenFolder={async (customPath) => {
                  const res = await bridge.openFolder(customPath || config.path || '')
                  return res && typeof res === 'object' ? res : { ok: true, path: customPath || config.path }
                }}
                onSelectFolder={handleSelectFolder}
                onShowItemInFolder={async (p) => {
                  if (bridge.showItemInFolder) await bridge.showItemInFolder(p)
                }}
                onRefreshGamepads={async () => {
                  const devs = await bridge.getConnectedGamepads()
                  setGamepads(devs)
                }}
                onNavigateLens={(target) => setLens(target as any)}
              />
            </div>
          )}

          {/* 系统设置完整视图 */}
          {lens === 'settings' && (
            <div style={{ gridColumn: '1 / -1' }}>
              <SettingsView
                config={config}
                onChange={patchConfig}
                locale={isZh ? 'zh' : 'en'}
                isMac={bridge.isMac}
                macPermissions={macPermissions}
                onOpenMacPreference={(pane) => bridge.openMacOSPreference?.(pane)}
                onOpenPermissionsView={() => setLens('permissions')}
                onToggleAutoStart={(enable) => {
                  patchConfig({ autoStart: enable })
                  if (bridge.setAutoStart) void bridge.setAutoStart(enable)
                }}
                onCheckUpdate={() => setUpdateDialogOpen(true)}
                onOpenGithub={() => bridge.openExternal?.('https://github.com/AmagiSakuya/GamePad-ScreenShot-Windows')}
              />
            </div>
          )}
        </div>
      </XMd3eNodeFrame>

      {/* 窄屏浮动底部 Dock (代替 Tab) */}
      <div className="xaihi-md3e-dock-wrapper" aria-label="Shiin 窄屏底部 Dock 导航">
        <XMd3eNavigationDock
          items={lensList.map((item) => ({
            id: item.id,
            label: item.shortLabel,
            icon: <AppIcon name={item.icon} size={15} />,
            badge: item.badge ? (
              <span style={{
                position: 'absolute',
                top: 2,
                right: 6,
                fontSize: 9,
                background: MD3E_ALIAS.primary,
                color: MD3E_ALIAS.onPrimary,
                borderRadius: 999,
                padding: '1px 5px',
                fontWeight: 800,
              }}>
                {item.badge}
              </span>
            ) : undefined,
          }))}
          value={lens}
          onValueChange={(val) => setLens(val as any)}
        />
      </div>

      {/* 2.0 热更新弹窗 */}
      <UpdateDialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} />
    </div>
  </div>
  )
}
