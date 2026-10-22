import * as React from 'react'
import { AppIcon } from './AppIcon.js'
import { BentoSelect, BentoWavyProgress, Md3eMorphShape } from './bento-controls.js'
import { BUTTON_NAME_MAP, COMMON_COMBO_PRESETS, formatGamepadKey } from '../gamepad-utils.js'
import {
  CaptureTargetTypeEnum,
  ScreenShotSaveWayEnum,
  type CaptureDisplayInfo,
  type CaptureWindowInfo,
  type GamepadDeviceInfo,
  type ScreenshotConfig,
} from '../../core/types.js'
import type { MacOSPermissionsStatus } from '../adapter/types.js'
import { useMd3eShapes } from '../md3e-shape-context.js'
import { EquipmentDeck } from './EquipmentDeck.js'
import type { ScreenshotResult } from '../../core/types.js'

export interface WorkspaceViewProps {
  capturePending?: boolean
  captureResult?: ScreenshotResult | null
  config: ScreenshotConfig
  onChange: (patch: Partial<ScreenshotConfig>) => void
  listening: boolean
  onToggleListen: () => void
  onCapture: () => void
  onSaveOBS: () => void
  onOpenFolder: () => void
  onSelectFolder: () => void
  gamepads: GamepadDeviceInfo[]
  selectedGamepadIndex: number
  onSelectGamepad: (index: number) => void
  screens: CaptureDisplayInfo[]
  windows: CaptureWindowInfo[]
  onRefreshWindows: () => void
  buttons: boolean[]
  axes: number[]
  recordingCombo: boolean
  liveRecordingKeys: string[]
  onStartComboRecording: () => void
  onCancelComboRecording: () => void
  onAddKey: () => void
  onClearKeys: () => void
  onRemoveKey: (index: number) => void
  detectingKeyboard: boolean
  onDetectKeyboard: () => void
  macPermissions?: MacOSPermissionsStatus | null
  onOpenPermissions: () => void
  onRefreshGamepads?: () => void
  lastNotice?: string
  locale: string
  activeDevice?: GamepadDeviceInfo
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  capturePending = false,
  captureResult = null,
  config,
  onChange,
  listening,
  onToggleListen,
  onCapture,
  onSaveOBS,
  onOpenFolder,
  onSelectFolder,
  gamepads,
  selectedGamepadIndex,
  onSelectGamepad,
  screens,
  windows,
  onRefreshWindows,
  buttons,
  axes,
  recordingCombo,
  liveRecordingKeys,
  onStartComboRecording,
  onCancelComboRecording,
  onAddKey,
  onClearKeys,
  onRemoveKey,
  detectingKeyboard,
  onDetectKeyboard,
  macPermissions,
  onOpenPermissions,
  onRefreshGamepads,
  lastNotice,
  locale,
  activeDevice,
}) => {
  const { session } = useMd3eShapes()
  const [presetMenuOpen, setPresetMenuOpen] = React.useState(false)
  const isZh = locale.startsWith('zh')
  const isWindowMode = config.captureTargetType === CaptureTargetTypeEnum.Window
  const isFocusedWindow = isWindowMode && config.windowCaptureMode === 'focused'
  const permissionMissing = Boolean(macPermissions?.isMac && !macPermissions.allGranted)
  const keyName = (key: string) => {
    const info = formatGamepadKey(key, isZh ? 'zh' : 'en')
    return { code: info.key, name: info.name }
  }

  return (
    <div className="shiin-bento oil-workspace">
      <div className="sb-page">
        <div className="sb-grid">
          <EquipmentDeck locale={locale} listening={listening} pending={capturePending} result={captureResult}
            device={activeDevice?.name}
            target={isFocusedWindow ? (isZh ? '当前聚焦窗口' : 'Focused window') : isWindowMode
              ? (windows.find(window => String(window.id) === String(config.windowSourceId))?.title || (isZh ? '指定窗口' : 'Pinned window'))
              : (screens.find(screen => String(screen.id) === String(config.screenSourceId))?.name || (isZh ? '全屏捕获' : 'Full desktop'))}
            output={`${config.imageFormat.toUpperCase()} · ${config.screenShotSaveWay === ScreenShotSaveWayEnum.CilpboardOnly
              ? (isZh ? '剪贴板' : 'Clipboard') : config.screenShotSaveWay === ScreenShotSaveWayEnum.FileAndCilpboard
                ? (isZh ? '文件 + 剪贴板' : 'File + clipboard') : (isZh ? '文件' : 'File')}`}
            folder={config.path || ''} permissionMissing={permissionMissing}
            onCapture={onCapture} onToggleListen={onToggleListen} onSaveOBS={onSaveOBS}
            onOpenFolder={onOpenFolder} onOpenPermissions={onOpenPermissions} notice={lastNotice} />

          <section className="sb-tile sb-capture-tile" aria-label={isZh ? '画面捕获与输出' : 'Capture and output'}>
            <div className="sb-tile-head">
              <div>
                <h3>{isZh ? '画面捕获与输出' : 'Capture & output'}</h3>
                <p>
                  {isZh
                    ? '全屏、指定某一扇窗口，或每次触发时自动跟随当前聚焦窗口。'
                    : 'Full desktop, one pinned window, or follow whichever window is focused when the trigger fires.'}
                </p>
              </div>
              <span className="sb-chip">{macPermissions?.isMac ? 'macOS' : (isZh ? '画面来源' : 'Capture source')}</span>
            </div>
            <div className="sb-field" style={{ marginTop: 12 }}>
              <span className="sb-field-label">{isZh ? '捕获目标' : 'CAPTURE TARGET'}</span>
              <div className="sb-target-group" role="group" aria-label={isZh ? '捕获目标' : 'Capture target'}>
                <button
                  type="button"
                  aria-pressed={!isWindowMode}
                  onClick={() => onChange({ captureTargetType: CaptureTargetTypeEnum.Screen })}
                >
                  <AppIcon name="monitor" size={14} />
                  {isZh ? '全屏 / 无边框' : 'Full desktop'}
                </button>
                <button
                  type="button"
                  aria-pressed={isWindowMode && !isFocusedWindow}
                  onClick={() =>
                    onChange({
                      captureTargetType: CaptureTargetTypeEnum.Window,
                      windowCaptureMode: 'specified',
                    })
                  }
                >
                  <AppIcon name="appWindow" size={14} />
                  {isZh ? '指定窗口' : 'Pinned window'}
                </button>
                <button
                  type="button"
                  aria-pressed={isFocusedWindow}
                  onClick={() =>
                    onChange({
                      captureTargetType: CaptureTargetTypeEnum.Window,
                      windowCaptureMode: 'focused',
                    })
                  }
                >
                  <AppIcon name="target" size={14} />
                  {isZh ? '聚焦窗口' : 'Focused window'}
                </button>
              </div>
            </div>
            <div className="sb-source-row">
              <span className="sb-source-icon" aria-hidden="true">
                <AppIcon name={isFocusedWindow ? 'target' : isWindowMode ? 'appWindow' : 'monitor'} size={18} />
              </span>
              <div className="sb-source-copy">
                <span className="sb-field-label">
                  {isFocusedWindow ? (isZh ? '跟随焦点' : 'FOLLOW FOCUS') : isWindowMode ? (isZh ? '目标窗口' : 'TARGET WINDOW') : isZh ? '显示器' : 'DISPLAY'}
                </span>
                {isFocusedWindow ? (
                  <span className="sb-source-value">{isZh ? '当前聚焦窗口' : 'Focused window'}</span>
                ) : isWindowMode ? (
                  <BentoSelect
                    className="sb-source-select-control"
                    variant="inline"
                    value={String(config.windowSourceId)}
                    options={[
                      { value: '', label: isZh ? '选择游戏窗口' : 'Select a window' },
                      ...windows.map((window) => ({
                        value: String(window.id),
                        label: window.title,
                        description: window.ownerName || `PID ${window.processId}`,
                      })),
                    ]}
                    onChange={(next) => onChange({ windowSourceId: next })}
                    ariaLabel={isZh ? '目标窗口' : 'Target window'}
                  />
                ) : (
                  <BentoSelect
                    className="sb-source-select-control"
                    variant="inline"
                    value={String(config.screenSourceId)}
                    options={screens.map((screen) => ({ value: String(screen.id), label: screen.name }))}
                    onChange={(next) => onChange({ screenSourceId: next })}
                    ariaLabel={isZh ? '显示器' : 'Display'}
                  />
                )}
              </div>
              {isWindowMode && !isFocusedWindow && (
                <button type="button" className="sb-icon-button" onClick={onRefreshWindows} aria-label={isZh ? '刷新窗口' : 'Refresh windows'}>
                  <AppIcon name="refresh" size={16} />
                </button>
              )}
            </div>
            {isFocusedWindow && (
              <p className="sb-note" style={{ marginTop: 10 }}>
                {isZh
                  ? '每次截图 / 手柄触发都会捕获当时聚焦的前台窗口，切换焦点即可换窗口。'
                  : 'Each capture grabs whichever window is focused at that moment.'}
              </p>
            )}
            <div className="sb-divider" />
            <div className="sb-output-row">
              <div className="sb-chip-group" role="group" aria-label={isZh ? '图像格式' : 'Image format'}>
                <button type="button" aria-pressed={config.imageFormat === 'jpg'} onClick={() => onChange({ imageFormat: 'jpg' })}>
                  JPG
                </button>
                <button type="button" aria-pressed={config.imageFormat === 'png'} onClick={() => onChange({ imageFormat: 'png' })}>
                  PNG
                </button>
              </div>
              <BentoSelect
                className="sb-save-way-select"
                variant="chip"
                value={config.screenShotSaveWay}
                options={[
                  { value: ScreenShotSaveWayEnum.FileOnly, label: isZh ? '仅文件' : 'File only' },
                  { value: ScreenShotSaveWayEnum.CilpboardOnly, label: isZh ? '仅剪贴板' : 'Clipboard only' },
                  { value: ScreenShotSaveWayEnum.FileAndCilpboard, label: isZh ? '文件 + 剪贴板' : 'File + clipboard' },
                ]}
                onChange={(next) => onChange({ screenShotSaveWay: next as ScreenshotConfig['screenShotSaveWay'] })}
                ariaLabel={isZh ? '保存方式' : 'Save as'}
              />
              <input
                className="sb-chip-input"
                value={config.fileNameTemplate}
                onChange={(event) => onChange({ fileNameTemplate: event.target.value })}
                aria-label={isZh ? '文件名模板' : 'Filename template'}
                placeholder={isZh ? '文件名模板' : 'Filename template'}
              />
            </div>
            <div className="sb-folder-row">
              <span className="sb-path-chip" title={config.path || ''}>
                <AppIcon name="folder" size={13} />
                <span>{config.path || (isZh ? '系统默认截图目录' : 'System default folder')}</span>
              </span>
              <button type="button" className="sb-icon-button" onClick={onSelectFolder} aria-label={isZh ? '更换目录' : 'Change folder'}>
                <AppIcon name="save" size={15} />
              </button>
              <button type="button" className="sb-icon-button" onClick={onOpenFolder} aria-label={isZh ? '打开目录' : 'Open folder'}>
                <AppIcon name="external" size={15} />
              </button>
            </div>
          </section>

          <section className="sb-tile sb-combos-tile" aria-label={isZh ? '触发组合' : 'Trigger combos'}>
            <Md3eMorphShape path={session.shapes.control.svgPath} className="sb-combo-ghost" />
            <div className="sb-tile-head">
              <div>
                <h3>{isZh ? '触发组合' : 'Trigger combos'}</h3>
                <p>{isZh ? '同时按下多个按键即可触发截图。' : 'Press several buttons together to capture.'}</p>
              </div>
              <span className="sb-chip">{config.comboKeys.length > 0 ? `${config.comboKeys.length} 键` : '—'}</span>
            </div>
            <label className="sb-field" style={{ marginTop: 10 }}>
              <span className="sb-field-label">{isZh ? '目标手柄' : 'GAMEPAD'}</span>
              <BentoSelect
                className="sb-gamepad-select"
                value={String(gamepads.length > 0 ? selectedGamepadIndex : -1)}
                options={gamepads.length > 0
                  ? gamepads.map((gamepad) => ({ value: String(gamepad._index), label: gamepad.name }))
                  : [{ value: '-1', label: isZh ? '未检测到手柄，按任意键唤醒' : 'No gamepad — press any button' }]}
                onChange={(next) => onSelectGamepad(Number(next))}
                ariaLabel={isZh ? '目标手柄' : 'Gamepad'}
              />
            </label>
            {recordingCombo ? (
              <div style={{ marginTop: 10, padding: 12, borderRadius: 18, background: 'var(--sb-primary-container)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <strong style={{ fontSize: 12.5, color: 'var(--sb-on-primary-container)' }}>
                    {isZh ? '请按住想要的按键…' : 'Hold the buttons you want…'}
                  </strong>
                  <button type="button" className="sb-secondary-button" style={{ minHeight: 28, padding: '0 9px', fontSize: 11 }} onClick={onCancelComboRecording}>
                    {isZh ? '取消' : 'Cancel'}
                  </button>
                </div>
                <div className="sb-combo-row" style={{ marginTop: 8 }}>
                  {liveRecordingKeys.length === 0 && (
                    <span className="sb-note" style={{ color: 'var(--sb-on-primary-container)' }}>
                      {isZh ? '等待按键…' : 'Waiting for buttons…'}
                    </span>
                  )}
                  {liveRecordingKeys.map((key) => {
                    const info = keyName(key)
                    return (
                      <span key={key} className="sb-combo-key" style={{ background: 'var(--sb-surface-high)', borderColor: 'transparent', color: 'var(--sb-on-primary-container)' }}>
                        <span className="sb-key-code">{info.code}</span>
                        <span style={{ fontSize: 10.5, opacity: .8 }}>{info.name}</span>
                      </span>
                    )
                  })}
                </div>
              </div>
            ) : config.comboKeys.length === 0 ? (
              <p className="sb-note" style={{ marginTop: 10 }}>
                {isZh ? '还没有组合键。点击下方“识别组合键”或选择一个预设。' : 'No combo yet. Detect a combo or pick a preset.'}
              </p>
            ) : (
              <div className="sb-combo-row" style={{ marginTop: 10 }}>
                {config.comboKeys.map((key, index) => {
                  const info = keyName(key)
                  return (
                    <span key={`${key}-${index}`} className="sb-combo-key">
                      <span className="sb-key-code">{info.code}</span>
                      <span style={{ fontSize: 10.5, color: 'var(--sb-muted)' }}>{info.name}</span>
                      <button type="button" onClick={() => onRemoveKey(index)} aria-label={isZh ? '移除此按键' : 'Remove key'}>
                        <AppIcon name="close" size={10} />
                      </button>
                    </span>
                  )
                })}
              </div>
            )}
            <div className="sb-split-wrap">
              <div className="sb-split-button">
                <button
                  type="button"
                  className="sb-split-main"
                  onClick={recordingCombo ? onCancelComboRecording : onStartComboRecording}
                >
                  <AppIcon name="target" size={16} />
                  {recordingCombo ? (isZh ? '取消识别' : 'Cancel') : isZh ? '识别组合键' : 'Detect combo'}
                </button>
                <button
                  type="button"
                  className="sb-split-trail"
                  aria-expanded={presetMenuOpen}
                  aria-label={isZh ? '组合预设' : 'Combo presets'}
                  onClick={() => setPresetMenuOpen((open) => !open)}
                >
                  <AppIcon name="chevronDown" size={16} />
                </button>
              </div>
              {presetMenuOpen && (
                <div className="sb-menu" role="menu">
                  {COMMON_COMBO_PRESETS.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onChange({ comboKeys: [...preset.keys] })
                        setPresetMenuOpen(false)
                      }}
                    >
                      {isZh ? preset.labelZh : preset.labelEn}
                    </button>
                  ))}
                  <div className="sb-menu-divider" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onAddKey()
                      setPresetMenuOpen(false)
                    }}
                  >
                    {isZh ? '手动加一个按键' : 'Add a key'}
                  </button>
                  {config.comboKeys.length > 0 && (
                    <button
                      type="button"
                      role="menuitem"
                      className="is-danger"
                      onClick={() => {
                        onClearKeys()
                        setPresetMenuOpen(false)
                      }}
                    >
                      {isZh ? '清空组合' : 'Clear combo'}
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="sb-preset-strip">
              <span className="sb-ribbon-label">{isZh ? '常用预设' : 'QUICK PRESETS'}</span>
              <div className="sb-preset-chips">
                {COMMON_COMBO_PRESETS.slice(0, 4).map((preset, index) => {
                  const active =
                    config.comboKeys.length === preset.keys.length &&
                    config.comboKeys.every((key, keyIndex) => key === preset.keys[keyIndex])
                  return (
                    <button
                      key={index}
                      type="button"
                      className="sb-preset-chip"
                      aria-pressed={active}
                      onClick={() => onChange({ comboKeys: [...preset.keys] })}
                    >
                      {isZh ? preset.labelZh : preset.labelEn}
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          <section className="sb-tile sb-listener-tile" aria-label={isZh ? '监听与自动化' : 'Listener and automation'}>
            <div className="sb-tile-head">
              <div>
                <h3>{isZh ? '监听与自动化' : 'Listener & automation'}</h3>
                <p>{isZh ? '后台监听、长按回放与自动归档。' : 'Background listening, long-press replay and auto filing.'}</p>
              </div>
            </div>
            <div className="sb-toggle-group" role="group" aria-label={isZh ? '监听与自动化开关' : 'Listener and automation toggles'}>
              <button
                type="button"
                className="sb-toggle"
                aria-pressed={listening}
                onClick={onToggleListen}
              >
                <span className="sb-toggle-icon">
                  <AppIcon name={listening ? 'stop' : 'play'} size={18} />
                </span>
                <span className="sb-toggle-copy">
                  <strong>{isZh ? '监听' : 'Listen'}</strong>
                  <small>{listening ? (isZh ? '后台已激活' : 'Active') : isZh ? '已暂停' : 'Paused'}</small>
                </span>
              </button>
              <button
                type="button"
                className="sb-toggle"
                aria-pressed={config.obsReplayBufferOnLongPress}
                onClick={() => onChange({ obsReplayBufferOnLongPress: !config.obsReplayBufferOnLongPress })}
              >
                <span className="sb-toggle-icon">
                  <AppIcon name="wave" size={18} />
                </span>
                <span className="sb-toggle-copy">
                  <strong>{isZh ? '长按回放' : 'Hold replay'}</strong>
                  <small>{isZh ? '按住 1 秒保存' : 'Hold 1s to save'}</small>
                </span>
              </button>
              <button
                type="button"
                className="sb-toggle"
                aria-pressed={config.saveByActiveWinTitle}
                onClick={() => onChange({ saveByActiveWinTitle: !config.saveByActiveWinTitle })}
              >
                <span className="sb-toggle-icon">
                  <AppIcon name="folder" size={18} />
                </span>
                <span className="sb-toggle-copy">
                  <strong>{isZh ? '按游戏归档' : 'File by game'}</strong>
                  <small>{isZh ? '自动建子目录' : 'Auto subfolder'}</small>
                </span>
              </button>
            </div>
            <div className="sb-keyboard-row">
              <span className="sb-toggle-icon"><AppIcon name="keyboard" size={18} /></span>
              <div className="sb-row-copy">
                <strong>{isZh ? '键盘辅助快捷键' : 'Keyboard shortcut'}</strong>
                <small>
                  {config.keyboardTriggerKeyCode
                    ? `${isZh ? '当前键码' : 'KeyCode'}: ${config.keyboardTriggerKeyCode}`
                    : isZh
                      ? '未设置按键'
                      : 'No key configured'}
                </small>
              </div>
              <button
                type="button"
                className="sb-secondary-button"
                style={{ minHeight: 32, padding: '0 10px', fontSize: 11 }}
                onClick={onDetectKeyboard}
              >
                {detectingKeyboard ? (isZh ? '请按键盘…' : 'Press…') : isZh ? '识别按键' : 'Detect'}
              </button>
              <button
                type="button"
                role="switch"
                aria-checked={Boolean(config.keyboardTrigger)}
                aria-label={isZh ? '键盘辅助快捷键' : 'Keyboard shortcut'}
                className="sb-switch"
                onClick={() => onChange({ keyboardTrigger: !config.keyboardTrigger })}
              >
                <span className="sb-switch-thumb">
                  <AppIcon name="check" size={13} />
                </span>
              </button>
            </div>
          </section>

          <section className="sb-tile sb-tester-tile" aria-label={isZh ? '实时测试器' : 'Live tester'}>
            <div className="sb-tile-head">
              <div>
                <h3>{isZh ? '实时测试器' : 'Live tester'}</h3>
                <p>{isZh ? '按下按键或转动摇杆，实时查看信号。' : 'Press buttons or tilt sticks to inspect live input.'}</p>
              </div>
              <span className="sb-chip">{isZh ? '实时' : 'LIVE'}</span>
            </div>
            <div className="sb-test-grid" style={{ marginTop: 12 }}>
              {buttons.map((pressed, index) => {
                const alias = BUTTON_NAME_MAP[`Button${index}`]
                const shortName = alias ? alias.name.split('/')[0].split('(')[0].trim() : pressed ? 'ON' : 'OFF'
                return (
                  <div key={index} className={`sb-test-key ${pressed ? 'pressed' : ''}`}>
                    <strong>B{index}</strong>
                    <span>{shortName}</span>
                  </div>
                )
              })}
              {buttons.length === 0 && (
                <div className="sb-tester-empty">
                  <span className="sb-tester-orb" aria-hidden="true">
                    <Md3eMorphShape path={session.shapes.metric.svgPath} />
                    <AppIcon name="gamepad" size={20} />
                  </span>
                  <span className="sb-note">
                    {isZh ? '暂无手柄信号，连接手柄并按键唤醒。' : 'No gamepad signal. Connect and press a button.'}
                  </span>
                </div>
              )}
            </div>
            {axes.length > 0 && (
              <>
                <div className="sb-divider" />
                <div style={{ display: 'grid', gap: 7 }}>
                  {axes.map((value, index) => (
                    <div key={index} className="sb-axis-row">
                      <span>Axis {index}</span>
                      <span className="sb-wavy-axis">
                        <BentoWavyProgress value={(value + 1) * 50} />
                      </span>
                      <span className="sb-readout-pill sb-axis-readout">{value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
