/* @jsxImportSource @opentui/react */
import { useKeyboard } from '@opentui/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import type { ScreenshotManager } from '../../../core/index.js'
import { ScreenShotSaveWayEnum, type CaptureWindowInfo } from '../../../core/types.js'
import { inspectDevices, type DeviceInventory } from '../actions.js'
import type { Translator } from '../i18n.js'
import type { ShiinPlan } from '../plan.js'
import { appendComboKeys, collectComboEdges } from './combo.js'
import { AxisGauge, Button, Chip, InlineMetric, KeyCap, KeyHint, Panel } from './components.js'
import { icon } from './icons.js'
import type { ShiinSession } from './session.js'
import { useTerminalTheme } from './theme.js'

export type OverlayName = 'none' | 'settings' | 'devices' | 'help'

/** opentui 的根节点必须是 box；满屏页面统一套这层壳，免得各屏各写一遍。 */
function ScreenShell({ children }: { children: ReactNode }): ReactNode {
  return (
    <box width="100%" height="100%" flexDirection="column" paddingLeft={2} paddingRight={2} paddingTop={1} paddingBottom={1}>
      {children}
    </box>
  )
}

export function Dashboard({
  session,
  t,
  onOpen,
}: {
  session: ShiinSession
  t: Translator
  onOpen: (overlay: OverlayName) => void
}): ReactNode {
  const theme = useTerminalTheme()
  const deviceName = session.devices[0]?.name ?? t('noDevices')
  const combo = session.context.config.comboKeys?.length
    ? session.context.config.comboKeys.join(' + ')
    : t('comboUnset')

  return (
    <box flexDirection="column" flexGrow={1} minHeight={0} gap={1}>
      <box flexDirection="row" flexGrow={1} minHeight={0} gap={1}>
        <Panel
          title={t('input')}
          width="42%"
          headerActions={<text fg={theme.colors.mutedForeground}>{deviceName}</text>}
        >
          <box flexDirection="column" gap={1} flexGrow={1} minHeight={0}>
            <box flexDirection="row" flexWrap="wrap" gap={1} flexShrink={0}>
              {session.buttons.slice(0, 18).map((pressed, index) => (
                <KeyCap key={index} label={`B${index}`} pressed={pressed} />
              ))}
            </box>
            <box flexDirection="column" flexShrink={0} marginTop={1}>
              <text fg={theme.colors.primary}>
                <b>{`${icon('action')} ${t('axes')}`}</b>
              </text>
              {session.axes.slice(0, 6).map((value, index) => (
                <AxisGauge key={index} label={`A${index}`} value={value} />
              ))}
              {session.axes.length === 0 ? <text fg={theme.colors.mutedForeground}>{t('noDevices')}</text> : null}
            </box>
          </box>
        </Panel>

        <Panel title={t('capturePanel')} flexGrow={1}>
          <box flexDirection="column" flexGrow={1} minHeight={0}>
            <box flexDirection="column" flexShrink={0}>
              <box flexDirection="row" gap={3}>
                <InlineMetric label={t('target')} value={targetModeText(session.plan, t)} />
                <InlineMetric label={t('saveWay')} value={saveWayText(session.plan.saveWay, t)} />
                <InlineMetric label={t('format')} value={session.plan.format.toUpperCase()} />
                <InlineMetric
                  label={t('obsStatus')}
                  value={session.context.obsConnected ? t('connected') : t('disconnected')}
                  tone={session.context.obsConnected ? 'success' : 'warning'}
                />
              </box>
              <text fg={theme.colors.mutedForeground}>{`${t('path')}: ${session.plan.path || t('fieldPathHint')}`}</text>
              {session.plan.target === 'window' ? (
                <text fg={theme.colors.mutedForeground}>
                  {session.plan.windowMode === 'specified'
                    ? `${t('windowMode')}: ${t('windowSpecified')} · ${windowLabel(session.context.windows, session.plan.windowId, t)}`
                    : `${t('windowMode')}: ${t('windowFocused')} · ${t('windowFocusedHint')}`}
                </text>
              ) : null}
              <text fg={theme.colors.mutedForeground}>{`${t('comboKeys')}: ${combo}`}</text>
            </box>

            <box flexDirection="row" gap={1} marginTop={1} flexShrink={0}>
              <Button id="listen" onPress={() => void session.toggleListen()} focused={session.listening} width={16}>
                {session.listening ? '■ 停止监听' : '▶ 开始监听'}
              </Button>
              <Button id="capture" onPress={() => void session.capture()} disabled={session.busy} width={16}>
                {`${icon('camera')} 截图 (C)`}
              </Button>
              <Button id="replay" onPress={() => void session.replay()} disabled={session.busy} width={16}>
                {`${icon('replay')} 回放 (R)`}
              </Button>
            </box>

            <box flexDirection="column" marginTop={1} flexGrow={1} minHeight={0}>
              <text fg={theme.colors.primary}>
                <b>{`${icon('result')} ${t('lastResult')}`}</b>
              </text>
              {session.last ? (
                <box flexDirection="column">
                  <text fg={session.last.success ? theme.colors.success : theme.colors.error}>
                    <b>{session.last.message}</b>
                  </text>
                  {session.last.lines?.map((line, index) => (
                    <text key={index} fg={theme.colors.mutedForeground}>
                      {line}
                    </text>
                  ))}
                </box>
              ) : (
                <text fg={theme.colors.mutedForeground}>{t('waitingForRun')}</text>
              )}
            </box>

            <box flexDirection="row" gap={1} flexShrink={0} marginTop={1}>
              <Chip onPress={() => onOpen('settings')}>{`${icon('settings')} ${t('settings')}`}</Chip>
              <Chip onPress={() => onOpen('devices')}>{`${icon('device')} ${t('devices')}`}</Chip>
              <Chip onPress={() => onOpen('help')}>{`${icon('help')} ${t('help')}`}</Chip>
            </box>
          </box>
        </Panel>
      </box>

    <Panel
      title={t('logs')}
      height={9}
      headerActions={
        <text fg={session.listening ? theme.colors.success : theme.colors.mutedForeground}>
          {session.listening ? `${icon('listen')} ${t('listeningStatus')}` : `${icon('status')} ${t('ready')}`}
          {`  ·  ${session.logs.length}`}
        </text>
      }
    >
        <scrollbox
          flexGrow={1}
          minHeight={0}
          scrollbarOptions={{ trackOptions: { foregroundColor: theme.colors.primary, backgroundColor: theme.colors.border } }}
        >
          {session.logs.length === 0 ? (
            <text fg={theme.colors.mutedForeground}>{t('noEvents')}</text>
          ) : (
            session.logs.map((entry) => (
              <text key={entry.id} fg={levelColor(entry.level, theme)}>
                {`${entry.time}  ${entry.text}`}
              </text>
            ))
          )}
        </scrollbox>
      </Panel>
    </box>
  )
}

function levelColor(level: string, theme: ReturnType<typeof useTerminalTheme>): string {
  if (level === 'success') return theme.colors.success
  if (level === 'error') return theme.colors.error
  if (level === 'warn') return theme.colors.warning
  return theme.colors.mutedForeground
}

function saveWayText(value: string, t: Translator): string {
  if (value === 'clipboard') return t('saveClipboard')
  if (value === 'fileAndClipboard') return t('saveBoth')
  return t('saveFile')
}

function targetModeText(plan: ShiinPlan, t: Translator): string {
  if (plan.target === 'screen') return t('targetScreen')
  return plan.windowMode === 'specified' ? t('windowSpecified') : t('windowFocused')
}

function windowLabel(windows: CaptureWindowInfo[], id: string, t: Translator): string {
  if (!id) return t('windowNone')
  const window = windows.find((entry) => String(entry.id) === id)
  if (!window) return `#${id}`
  return window.ownerName ? `${window.ownerName} - ${window.title}` : window.title
}

export function SettingsScreen({
  session,
  t,
  onBack,
  onEditingChange,
  blurToken = 0,
}: {
  session: ShiinSession
  t: Translator
  onBack: () => void
  onEditingChange: (editing: boolean) => void
  /** 外部递增这个值表示"让路径输入框失焦"（Esc），由本屏自己收掉焦点而不是关掉整页。 */
  blurToken?: number
}): ReactNode {
  const theme = useTerminalTheme()
  const [message, setMessage] = useState('')
  const [pathFocused, setPathFocused] = useState(false)

  // 组合键录制：按下手柄键就进 draft，静置 1.2 秒自动落盘（不需要再用键盘确认）。
  const [recording, setRecording] = useState(false)
  const [draft, setDraft] = useState<string[]>([])
  const draftRef = useRef<string[]>([])
  const recordingRef = useRef(false)
  const prevButtons = useRef<boolean[]>([])
  const prevAxes = useRef<number[]>([])
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const finishRef = useRef<(save: boolean) => void>(() => undefined)
  const seenBlur = useRef(blurToken)

  draftRef.current = draft
  recordingRef.current = recording

  const finishRecording = (save: boolean) => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current)
      idleTimer.current = null
    }
    const keys = draftRef.current
    draftRef.current = []
    setDraft([])
    setRecording(false)
    onEditingChange(false)
    if (save && keys.length > 0) void session.saveCombo(keys)
  }
  finishRef.current = finishRecording

  const startRecording = () => {
    if (!session.ensureDevice()) {
      setMessage(t('noDevices'))
      return
    }
    setMessage('')
    session.log('info', t('recordingCombo'))
    draftRef.current = []
    setDraft([])
    setRecording(true)
    onEditingChange(true)
    prevButtons.current = session.buttons.slice()
    prevAxes.current = session.axes.slice()
  }

  const combo = session.context.config.comboKeys ?? []

  // 鼠标能点，键盘也要能开：'R' 与主界面的"回放"同键不同页，浮层打开时主界面不抢键。
  useKeyboard((key) => {
    if (pathFocused) return
    if (key.name !== 'r') return
    if (recording) finishRecording(true)
    else startRecording()
  })

  useEffect(() => {
    if (!recording) return
    const added = collectComboEdges(prevButtons.current, prevAxes.current, session.buttons, session.axes)
    prevButtons.current = session.buttons.slice()
    prevAxes.current = session.axes.slice()
    if (added.length === 0) return

    const merged = appendComboKeys(draftRef.current, added)
    draftRef.current = merged
    setDraft(merged)
    if (idleTimer.current) clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => finishRef.current(true), 1200)
  }, [recording, session.buttons, session.axes])

  useEffect(() => () => {
    if (idleTimer.current) clearTimeout(idleTimer.current)
  }, [])

  const focusPath = (focused: boolean) => {
    setPathFocused(focused)
    onEditingChange(focused)
  }

  useEffect(() => () => onEditingChange(false), [onEditingChange])
  useEffect(() => {
    if (blurToken === seenBlur.current) return
    seenBlur.current = blurToken
    setPathFocused(false)
    if (recordingRef.current) finishRef.current(false)
    else onEditingChange(false)
  }, [blurToken, onEditingChange])

  return (
    <ScreenShell>
      <Panel title={`${icon('settings')} ${t('settings')}`} description={t('fieldActionHint')} flexGrow={1}>
        <box flexDirection="column" gap={1} flexGrow={1} minHeight={0}>
          <box flexDirection="column" flexShrink={0}>
            <text fg={theme.colors.mutedForeground}>{t('target')}</text>
            <box flexDirection="row" gap={1}>
              <Chip marker selected={session.plan.target === 'screen'} onPress={() => session.patchPlan({ target: 'screen' })}>
                {t('targetScreen')}
              </Chip>
              <Chip
                marker
                selected={session.plan.target === 'window'}
                onPress={() =>
                  session.patchPlan({
                    target: 'window',
                    ...(session.plan.windowMode === 'specified' && !session.plan.windowId && session.context.windows[0]
                      ? { windowId: String(session.context.windows[0].id) }
                      : {}),
                  })
                }
              >
                {t('targetWindow')}
              </Chip>
            </box>
          </box>

          {session.plan.target === 'window' ? (
            <box flexDirection="column" flexShrink={0}>
              <text fg={theme.colors.mutedForeground}>{t('windowMode')}</text>
              <box flexDirection="row" gap={1} flexWrap="wrap" alignItems="center">
                <Chip
                  marker
                  selected={session.plan.windowMode === 'focused'}
                  onPress={() => session.patchPlan({ windowMode: 'focused' })}
                >
                  {t('windowFocused')}
                </Chip>
                <Chip
                  marker
                  selected={session.plan.windowMode === 'specified'}
                  onPress={() =>
                    session.patchPlan({
                      windowMode: 'specified',
                      ...(session.plan.windowId || !session.context.windows[0]
                        ? {}
                        : { windowId: String(session.context.windows[0].id) }),
                    })
                  }
                >
                  {t('windowSpecified')}
                </Chip>
                <text fg={theme.colors.mutedForeground}>
                  {session.plan.windowMode === 'focused' ? t('windowFocusedHint') : t('windowSpecifiedHint')}
                </text>
              </box>
              {session.plan.windowMode === 'specified' ? (
                <box flexDirection="column">
                  <text fg={theme.colors.mutedForeground}>
                    {`${t('windowSource')}: ${windowLabel(session.context.windows, session.plan.windowId, t)}`}
                  </text>
                  <scrollbox
                    height={3}
                    scrollbarOptions={{ trackOptions: { foregroundColor: theme.colors.primary, backgroundColor: theme.colors.border } }}
                  >
                    {session.context.windows.length === 0 ? (
                      <text fg={theme.colors.mutedForeground}>{t('noWindows')}</text>
                    ) : (
                      session.context.windows.slice(0, 20).map((window) => (
                        <Chip
                          key={String(window.id)}
                          marker
                          selected={String(window.id) === session.plan.windowId}
                          onPress={() => session.patchPlan({ windowId: String(window.id) })}
                        >
                          {window.ownerName ? `${window.ownerName} - ${window.title}` : window.title}
                        </Chip>
                      ))
                    )}
                  </scrollbox>
                </box>
              ) : null}
            </box>
          ) : null}

          <box flexDirection="column" flexShrink={0}>
            <box flexDirection="row" gap={2} alignItems="center" flexWrap="wrap" height={3}>
              <text fg={theme.colors.mutedForeground}>{t('comboKeys')}</text>
              <text fg={recording ? theme.colors.warning : theme.colors.foreground}>
                {recording
                  ? draft.length > 0
                    ? draft.join(' + ')
                    : t('comboWaiting')
                  : combo.length > 0
                    ? combo.join(' + ')
                    : t('comboUnset')}
              </text>
              <Button
                id="record-combo"
                width={22}
                danger={recording}
                onPress={() => (recording ? finishRecording(true) : startRecording())}
              >
                {recording ? `■ ${t('stopRecord')}` : `● ${t('recordCombo')} (R)`}
              </Button>
              <Chip
                onPress={() => {
                  finishRecording(false)
                  void session.saveCombo([])
                }}
              >
                {t('clearCombo')}
              </Chip>
            </box>
            {recording ? (
              <text fg={theme.colors.warning}>{`${t('recordingCombo')} · ${t('comboRecordHint')}`}</text>
            ) : null}
          </box>

          <box flexDirection="column" flexShrink={0}>
            <text fg={theme.colors.mutedForeground}>{t('saveWay')}</text>
            <box flexDirection="row" gap={1} flexWrap="wrap">
              <Chip marker selected={session.plan.saveWay === ScreenShotSaveWayEnum.FileOnly} onPress={() => session.patchPlan({ saveWay: ScreenShotSaveWayEnum.FileOnly })}>
                {t('saveFile')}
              </Chip>
              <Chip marker selected={session.plan.saveWay === ScreenShotSaveWayEnum.CilpboardOnly} onPress={() => session.patchPlan({ saveWay: ScreenShotSaveWayEnum.CilpboardOnly })}>
                {t('saveClipboard')}
              </Chip>
              <Chip marker selected={session.plan.saveWay === ScreenShotSaveWayEnum.FileAndCilpboard} onPress={() => session.patchPlan({ saveWay: ScreenShotSaveWayEnum.FileAndCilpboard })}>
                {t('saveBoth')}
              </Chip>
            </box>
          </box>

          <box flexDirection="column" flexShrink={0}>
            <text fg={theme.colors.mutedForeground}>{t('format')}</text>
            <box flexDirection="row" gap={1}>
              <Chip marker selected={session.plan.format === 'jpg'} onPress={() => session.patchPlan({ format: 'jpg' })}>
                {t('formatJpg')}
              </Chip>
              <Chip marker selected={session.plan.format === 'png'} onPress={() => session.patchPlan({ format: 'png' })}>
                {t('formatPng')}
              </Chip>
            </box>
          </box>

          <box flexDirection="column" flexShrink={0} onMouseDown={() => focusPath(true)}>
            <text fg={pathFocused ? theme.colors.focusRing : theme.colors.mutedForeground}>
              {`${t('path')}${pathFocused ? '  (Enter 结束编辑)' : '  (点击编辑)'}`}
            </text>
            <box
              borderStyle="rounded"
              borderColor={pathFocused ? theme.colors.focusRing : theme.colors.border}
              height={3}
              paddingLeft={1}
              paddingRight={1}
            >
              <input
                value={session.plan.path}
                placeholder={t('fieldPathHint')}
                focused={pathFocused}
                onInput={(value: string) => session.patchPlan({ path: value })}
              />
            </box>
            <text fg={theme.colors.mutedForeground}>{t('fieldPathHint')}</text>
          </box>

          <box flexDirection="row" gap={1} flexShrink={0} marginTop={1}>
            <Button
              id="save-config"
              onPress={() => {
                focusPath(false)
                void session.saveSettings().then(() => setMessage(t('savedConfig')))
              }}
              width={18}
            >
              {`${icon('result')} ${t('saveConfig')}`}
            </Button>
            <Button
              id="back-settings"
              onPress={() => {
                focusPath(false)
                onBack()
              }}
              width={16}
            >
              {`← ${t('back')}`}
            </Button>
          </box>
          <text fg={message ? theme.colors.success : theme.colors.mutedForeground}>
            {message || `${t('path')}: ${session.plan.path || '(default)'}`}
          </text>
        </box>
      </Panel>
    </ScreenShell>
  )
}

export function DevicesScreen({
  manager,
  t,
  onBack,
}: {
  manager: ScreenshotManager
  t: Translator
  onBack: () => void
}): ReactNode {
  const theme = useTerminalTheme()
  const [inventory, setInventory] = useState<DeviceInventory | null>(null)

  useEffect(() => {
    let alive = true
    void inspectDevices(manager).then((next) => {
      if (alive) setInventory(next)
    })
    return () => {
      alive = false
    }
  }, [manager])

  const devices = inventory?.devices ?? []
  const screens = inventory?.screens ?? []
  const windows = inventory?.windows ?? []

  return (
    <ScreenShell>
      <Panel title={`${icon('device')} ${t('devices')}`} flexGrow={1}>
        <scrollbox
          flexGrow={1}
          minHeight={0}
          scrollbarOptions={{ trackOptions: { foregroundColor: theme.colors.primary, backgroundColor: theme.colors.border } }}
        >
          <text fg={theme.colors.primary}>
            <b>{`${t('buttons')} · ${devices.length}`}</b>
          </text>
          {devices.length === 0 ? <text fg={theme.colors.mutedForeground}>{t('noDevices')}</text> : null}
          {devices.map((device) => (
            <text key={`${device._index}-${device.id}`} fg={theme.colors.foreground}>
              {`#${device._index}  ${device.name}  ·  ${device.buttonsCount ?? '?'} btn / ${device.axesCount ?? '?'} axes`}
            </text>
          ))}
          <box height={1} />
          <text fg={theme.colors.primary}>
            <b>{`${t('screenSource')} · ${screens.length}`}</b>
          </text>
          {screens.length === 0 ? <text fg={theme.colors.mutedForeground}>{t('noScreens')}</text> : null}
          {screens.map((screen) => (
            <text key={String(screen.id)} fg={theme.colors.foreground}>{`#${screen.id}  ${screen.name}`}</text>
          ))}
          <box height={1} />
          <text fg={theme.colors.primary}>
            <b>{`${t('windowSource')} · ${windows.length}`}</b>
          </text>
          {windows.slice(0, 20).map((window) => (
            <text key={String(window.id)} fg={theme.colors.mutedForeground}>{`${window.title}  ·  ${window.ownerName ?? ''}`}</text>
          ))}
        </scrollbox>
        <box flexShrink={0} marginTop={1}>
          <Button id="back-devices" onPress={onBack} width={16}>
            {`← ${t('back')}`}
          </Button>
        </box>
      </Panel>
    </ScreenShell>
  )
}

export function HelpScreen({ t, onBack }: { t: Translator; onBack: () => void }): ReactNode {
  const theme = useTerminalTheme()
  const rows: [string, string][] = [
    ['Space', t('actionListen')],
    ['C', t('actionCapture')],
    ['R', t('actionReplay')],
    ['N', t('overlayTestKey')],
    ['S', t('settings')],
    ['D', t('devices')],
    ['?', t('help')],
    ['Q / Esc', t('exit')],
  ]
  return (
    <ScreenShell>
      <Panel title={`${icon('help')} ${t('help')}`} flexGrow={1}>
        <box flexDirection="column" gap={1} flexShrink={0}>
          {rows.map(([keys, label]) => (
            <KeyHint key={keys} keys={keys} label={label} />
          ))}
        </box>
        <text fg={theme.colors.mutedForeground}>{t('tabsHint')}</text>
        <box flexShrink={0} marginTop={1}>
          <Button id="back-help" onPress={onBack} width={16}>
            {`← ${t('back')}`}
          </Button>
        </box>
      </Panel>
    </ScreenShell>
  )
}
