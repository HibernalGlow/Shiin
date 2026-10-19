import * as React from 'react'
import { registerKitStyles } from './tokens.js'
import { TitleBar } from './components/TitleBar.js'
import { HeroSection } from './components/HeroSection.js'
import { SourceCard } from './components/SourceCard.js'
import { SaveCard } from './components/SaveCard.js'
import { TriggerCard } from './components/TriggerCard.js'
import { AudioCard } from './components/AudioCard.js'
import { TesterView } from './components/TesterView.js'
import { SettingsView } from './components/SettingsView.js'
import { AppIcon } from './components/AppIcon.js'
import { ElectronHostBridge } from './adapter/electron.js'
import {
  type ScreenshotConfig,
  type GamepadDeviceInfo,
  type CaptureDisplayInfo,
  type CaptureWindowInfo,
  DEFAULT_CONFIG,
} from '../core/types.js'

export const App: React.FC = () => {
  const bridge = React.useMemo(() => new ElectronHostBridge(), [])

  const [view, setView] = React.useState<'screenshot' | 'tester' | 'settings'>('screenshot')
  const [config, setConfig] = React.useState<ScreenshotConfig>({ ...DEFAULT_CONFIG })
  const [listening, setListening] = React.useState<boolean>(false)
  const [gamepads, setGamepads] = React.useState<GamepadDeviceInfo[]>([])
  const [selectedGamepadIndex, setSelectedGamepadIndex] = React.useState<number>(0)
  const [screens, setScreens] = React.useState<CaptureDisplayInfo[]>([])
  const [windows, setWindows] = React.useState<CaptureWindowInfo[]>([])
  const [buttons, setButtons] = React.useState<boolean[]>([])
  const [axes, setAxes] = React.useState<number[]>([])

  const [isDark, setIsDark] = React.useState<boolean>(true)
  const [accent, setAccent] = React.useState<string>('lime')
  const [uiScale, setUiScale] = React.useState<number>(1.0)
  const [locale, setLocale] = React.useState<'zh' | 'en'>('zh')
  const [maximized, setMaximized] = React.useState<boolean>(false)
  const [macPermissions, setMacPermissions] = React.useState<{ screenCapture: boolean; accessibility: boolean } | null>(null)

  // 注入基础样式与加载初始配置
  React.useEffect(() => {
    registerKitStyles()

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

      // 同步系统开机自启状态
      if (bridge.getAutoStart) {
        const auto = await bridge.getAutoStart()
        setConfig((p) => ({ ...p, autoStart: auto }))
      }

      // 同步 macOS 权限状态
      if (bridge.isMac && bridge.getMacOSPermissions) {
        const perms = await bridge.getMacOSPermissions()
        setMacPermissions(perms)
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

      // 获取设备和屏幕列表
      const devs = await bridge.getConnectedGamepads()
      setGamepads(devs)

      const scrs = await bridge.getScreenSources()
      setScreens(scrs)

      const wins = await bridge.getCaptureWindows()
      setWindows(wins)
    })()

    return bridge.onListeningStateChanged((st) => setListening(st))
  }, [bridge])

  // 轮询按键与轴（供测试器与指示灯渲染）
  React.useEffect(() => {
    const timer = setInterval(async () => {
      const b = await bridge.getCurrentButtons()
      setButtons(b)
      const a = await bridge.getCurrentAxes()
      setAxes(a)
    }, 60)
    return () => clearInterval(timer)
  }, [bridge])

  const patchConfig = (patch: Partial<ScreenshotConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch }
      void bridge.setStore('globalConfig', JSON.stringify(next))
      return next
    })
  }

  const playSynthesizedSound = (type: string, volume = 1) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      if (type === 'PS') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(587.33, now)
        osc.frequency.setValueAtTime(880, now + 0.08)
        gain.gain.setValueAtTime(Math.min(volume * 0.25, 1), now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.26)
      } else {
        // 默认 NS2 相机快门双声
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(800, now)
        osc.frequency.exponentialRampToValueAtTime(240, now + 0.08)
        gain.gain.setValueAtTime(Math.min(volume * 0.3, 1), now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.09)
      }
    } catch {
      // 忽略音频限制
    }
  }

  const handleCapture = async () => {
    const res = await bridge.capture(config)
    if (res?.ok) {
      if (config.sound && config.sound !== 'None') {
        playSynthesizedSound(config.sound, config.soundPower)
      }
      bridge.showNotification?.(
        isZh ? '截图已成功保存' : 'Screenshot Saved',
        res.filePath || (isZh ? '已复制至剪贴板' : 'Copied to clipboard')
      )
    }
  }

  const handlePlayTestSound = () => {
    if (config.sound && config.sound !== 'None') {
      playSynthesizedSound(config.sound, config.soundPower)
    }
  }

  const handleStartListen = async () => {
    const ok = await bridge.startListening(config)
    if (ok) setListening(true)
  }

  const handleStopListen = async () => {
    await bridge.stopListening()
    setListening(false)
  }

  const handleOpenFolder = () => {
    void bridge.openFolder(config.path || process.cwd())
  }

  const handleSelectFolder = async () => {
    const folder = await bridge.selectFolder()
    if (folder) patchConfig({ path: folder })
  }

  const handleToggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    void bridge.setStore('theme', next ? 'dark' : 'light')
  }

  const handleSetAccent = (acc: string) => {
    setAccent(acc)
    void bridge.setStore('accentColor', acc)
  }

  const handleSetUiScale = async (scale: number) => {
    setUiScale(scale)
    void bridge.setStore('uiScale', scale)
    if (bridge.setUiScale) await bridge.setUiScale(scale)
  }

  const handleToggleLocale = () => {
    const next = locale === 'zh' ? 'en' : 'zh'
    setLocale(next)
    void bridge.setStore('locale', next)
  }

  const activeDevice = gamepads.find((g) => g._index === selectedGamepadIndex) || gamepads[0]
  const isZh = locale === 'zh'

  return (
    <div
      className={`app-shell ${isDark ? 'theme-dark' : 'theme-light'}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--bg, #08090c)',
        color: 'var(--ink, #f2f4f8)',
        overflow: 'hidden',
        fontSize: 13,
      }}
    >
      <TitleBar
        listening={listening}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        accent={accent}
        onSetAccent={handleSetAccent}
        uiScale={uiScale}
        onSetUiScale={handleSetUiScale}
        locale={locale}
        onToggleLocale={handleToggleLocale}
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
      />

      {/* macOS 屏幕录制权限提示条 */}
      {macPermissions && !macPermissions.screenCapture && (
        <div style={{
          background: 'rgba(255, 179, 0, 0.12)',
          borderBottom: '1px solid rgba(255, 179, 0, 0.3)',
          color: '#ffc107',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          zIndex: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AppIcon name="alert" size={15} />
            <span>
              {isZh
                ? 'macOS 提醒：尚未获取「屏幕录制」权限，无法正常截取屏幕。请在系统设置中允许。'
                : 'macOS notice: Screen Recording permission is required to capture screens.'}
            </span>
          </div>
          <button
            className="shiin-btn"
            data-variant="tonal"
            style={{ height: 26, fontSize: 11, padding: '0 10px' }}
            onClick={() => bridge.openMacOSPreference?.('screen')}
          >
            {isZh ? '打开系统设置' : 'Open System Settings'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 左侧导航 Rail */}
        <nav style={{
          width: 72,
          borderRight: '1px solid var(--line, rgba(255, 255, 255, 0.08))',
          background: 'var(--surface, rgba(255, 255, 255, 0.02))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 0',
          gap: 10,
        }}>
          {[
            { id: 'screenshot', icon: 'camera', label: isZh ? '截图' : 'Capture' },
            { id: 'tester', icon: 'gamepad', label: isZh ? '测试' : 'Tester' },
            { id: 'settings', icon: 'settings', label: isZh ? '设置' : 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              className="shiin-btn"
              data-variant={view === item.id ? 'filled' : 'ghost'}
              onClick={() => setView(item.id as any)}
              style={{
                width: 54,
                height: 52,
                flexDirection: 'column',
                gap: 4,
                padding: '6px 0',
                borderRadius: 10,
                fontSize: 10,
              }}
            >
              <AppIcon name={item.icon} size={18} />
              <span>{item.label}</span>
            </button>
          ))}

          <div style={{ marginTop: 'auto' }}>
            <button
              className="shiin-btn"
              data-variant="ghost"
              onClick={() => bridge.openExternal?.('https://github.com/AmagiSakuya/GamePad-ScreenShot-Windows')}
              style={{ width: 54, height: 44, flexDirection: 'column', gap: 2, padding: '4px 0', fontSize: 9 }}
              title="GitHub"
            >
              <AppIcon name="github" size={16} />
              <span>GitHub</span>
            </button>
          </div>
        </nav>

        {/* 右侧主视口 */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {view === 'screenshot' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <HeroSection
                listening={listening}
                config={config}
                deviceLabel={activeDevice ? activeDevice.name : (isZh ? '未连接手柄' : 'No Gamepad')}
                onStart={handleStartListen}
                onStop={handleStopListen}
                onOpenFolder={handleOpenFolder}
                onCapture={handleCapture}
                locale={locale}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 12 }}>
                <SourceCard
                  config={config}
                  onChange={patchConfig}
                  screens={screens}
                  windows={windows}
                  onRefreshWindows={async () => {
                    const wins = await bridge.getCaptureWindows()
                    setWindows(wins)
                  }}
                  locale={locale}
                />

                <SaveCard
                  config={config}
                  onChange={patchConfig}
                  onSelectFolder={handleSelectFolder}
                  locale={locale}
                />

                <TriggerCard
                  config={config}
                  onChange={patchConfig}
                  gamepads={gamepads}
                  selectedGamepadIndex={selectedGamepadIndex}
                  onSelectGamepad={(idx) => {
                    setSelectedGamepadIndex(idx)
                    const dev = gamepads.find((g) => g._index === idx)
                    if (dev) void bridge.openGamepad(dev)
                  }}
                  locale={locale}
                />

                <AudioCard
                  config={config}
                  onChange={patchConfig}
                  onPlayTestSound={handlePlayTestSound}
                  locale={locale}
                />
              </div>
            </div>
          )}

          {view === 'tester' && (
            <TesterView
              gamepads={gamepads}
              selectedGamepadIndex={selectedGamepadIndex}
              onSelectGamepad={(idx) => {
                setSelectedGamepadIndex(idx)
                const dev = gamepads.find((g) => g._index === idx)
                if (dev) void bridge.openGamepad(dev)
              }}
              buttons={buttons}
              axes={axes}
              locale={locale}
            />
          )}

          {view === 'settings' && (
            <SettingsView
              config={config}
              onChange={patchConfig}
              onClearLogs={() => void bridge.clearLogFiles?.()}
              onCheckUpdate={() => void bridge.checkForUpdates?.()}
              onOpenGithub={() => bridge.openExternal?.('https://github.com/AmagiSakuya/GamePad-ScreenShot-Windows')}
              locale={locale}
              isMac={bridge.isMac}
              macPermissions={macPermissions}
              onOpenMacPreference={(p) => bridge.openMacOSPreference?.(p)}
              onToggleAutoStart={async (en) => { await bridge.setAutoStart?.(en) }}
            />
          )}
        </main>
      </div>
    </div>
  )
}
