/* @jsxImportSource @opentui/react */
import { useKeyboard } from '@opentui/react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

import type { ScreenshotManager } from '../../../core/index.js'
import { createTranslator, type Language } from '../i18n.js'
import { KeyHint } from './components.js'
import { icon } from './icons.js'
import { Dashboard, DevicesScreen, HelpScreen, SettingsScreen, type OverlayName } from './screens.js'
import { useShiinSession } from './session.js'
import { listThemes, resolveTheme, TerminalThemeProvider, useTerminalTheme } from './theme.js'

export interface ShiinTuiProps {
  manager: ScreenshotManager
  language: Language
  theme?: string
  onExit: () => void
}

const VERSION = '2.0.0'

export function ShiinTui(props: ShiinTuiProps): ReactNode {
  const initialTheme = props.theme && listThemes().includes(props.theme) ? props.theme : 'nord'
  const [themeName, setThemeName] = useState(initialTheme)
  const [language, setLanguage] = useState<Language>(props.language)

  return (
    <TerminalThemeProvider theme={resolveTheme(themeName)}>
      <ShiinApp
        {...props}
        language={language}
        themeName={themeName}
        onToggleTheme={() => {
          const names = listThemes()
          const index = names.indexOf(themeName)
          setThemeName(names[(index + 1) % names.length] ?? 'nord')
        }}
        onToggleLanguage={() => setLanguage((previous) => (previous === 'zh' ? 'en' : 'zh'))}
      />
    </TerminalThemeProvider>
  )
}

function ShiinApp({
  manager,
  language,
  themeName,
  onExit,
  onToggleTheme,
  onToggleLanguage,
}: ShiinTuiProps & {
  themeName: string
  onToggleTheme: () => void
  onToggleLanguage: () => void
}): ReactNode {
  const theme = useTerminalTheme()
  const t = useMemo(() => createTranslator(language), [language])
  const session = useShiinSession(manager, t)
  const [overlay, setOverlay] = useState<OverlayName>('none')
  const [editing, setEditing] = useState(false)
  const [blurToken, setBlurToken] = useState(0)
  const [clock, setClock] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useKeyboard((key) => {
    // 路径输入框聚焦时，字母属于使用者：Esc 只让它失焦，不关掉整页。
    if (editing) {
      if (key.name === 'escape') {
        setEditing(false)
        setBlurToken((value) => value + 1)
      }
      return
    }

    const name = key.name
    if (name === 'escape') {
      if (overlay !== 'none') setOverlay('none')
      else onExit()
      return
    }
    if (name === 'q') {
      onExit()
      return
    }
    // 浮层（设置/设备/帮助）打开时，键属于那一页：别让 C/R/Space 在设置页里顺手截一张。
    if (overlay !== 'none') return
    if (name === '?' || name === 'h') {
      setOverlay((current) => (current === 'help' ? 'none' : 'help'))
      return
    }
    if (name === 'space') {
      void session.toggleListen()
      return
    }
    if (name === 'c') {
      void session.capture()
      return
    }
    if (name === 'r') {
      void session.replay()
      return
    }
    if (name === 'n') {
      session.testNotification()
      return
    }
    if (name === 's') {
      setOverlay((current) => (current === 'settings' ? 'none' : 'settings'))
      return
    }
    if (name === 'd') {
      setOverlay((current) => (current === 'devices' ? 'none' : 'devices'))
      return
    }
    if (name === 't') {
      onToggleTheme()
      return
    }
    if (name === 'l') {
      onToggleLanguage()
    }
  })

  const time = `${String(clock.getHours()).padStart(2, '0')}:${String(clock.getMinutes()).padStart(2, '0')}:${String(clock.getSeconds()).padStart(2, '0')}`

  return (
    <box width="100%" height="100%" flexDirection="column" paddingLeft={1} paddingRight={1} overflow="hidden">
      <box
        flexDirection="row"
        justifyContent="space-between"
        height={4}
        borderStyle="single"
        borderColor={theme.colors.border}
        paddingLeft={1}
        paddingRight={1}
        flexShrink={0}
      >
        <box flexDirection="column">
          <text fg={theme.colors.primary}>
            <b>{`${icon('camera')} SHIIN // GAMEPAD CAPTURE CONTROL PLANE`}</b>
          </text>
          <text fg={theme.colors.mutedForeground}>{`${t('tagline')} · v${VERSION} · OpenTUI`}</text>
        </box>
        <box flexDirection="column" alignItems="flex-end">
          <text fg={theme.colors.foreground}>
            <b>{time}</b>
          </text>
          <box flexDirection="row" gap={2}>
            <text fg={session.devices.length > 0 ? theme.colors.success : theme.colors.warning}>
              {session.devices.length > 0 ? `${icon('device')} ${session.devices.length}` : t('noDevices')}
            </text>
            <text fg={session.listening ? theme.colors.success : theme.colors.mutedForeground}>
              {session.listening ? `${icon('listen')} ${t('listeningStatus')}` : `${icon('status')} ${t('ready')}`}
            </text>
          </box>
        </box>
      </box>

      <box flexDirection="column" flexGrow={1} minHeight={0} marginTop={1}>
        {overlay === 'settings' ? (
          <SettingsScreen
            session={session}
            t={t}
            blurToken={blurToken}
            onEditingChange={setEditing}
            onBack={() => setOverlay('none')}
          />
        ) : overlay === 'devices' ? (
          <DevicesScreen manager={manager} t={t} onBack={() => setOverlay('none')} />
        ) : overlay === 'help' ? (
          <HelpScreen t={t} onBack={() => setOverlay('none')} />
        ) : (
          <Dashboard session={session} t={t} onOpen={setOverlay} />
        )}
      </box>

      <box height={2} flexDirection="row" justifyContent="space-between" flexShrink={0} paddingLeft={1} paddingRight={1}>
        <box flexDirection="row" gap={2}>
          <KeyHint keys="Space" label={t('listeningStatus')} />
          <KeyHint keys="C" label={t('actionCapture')} />
          <KeyHint keys="R" label={t('actionReplay')} />
          <KeyHint keys="N" label={t('overlayTestKey')} />
          <KeyHint keys="S/D/?" label={t('settings')} />
          <KeyHint keys="Q" label={t('exit')} />
        </box>
        <box flexDirection="row" gap={2}>
          <text fg={theme.colors.mutedForeground}>{`${t('themeLabel')}: ${themeName}`}</text>
          <text fg={theme.colors.mutedForeground}>{language === 'zh' ? '中文' : 'English'}</text>
        </box>
      </box>
    </box>
  )
}
