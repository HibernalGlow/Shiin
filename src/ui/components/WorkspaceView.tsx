import * as React from 'react'
import { AppIcon } from './AppIcon.js'
import { BentoSelect, Md3eMorphShape } from './bento-controls.js'
import { COMMON_COMBO_PRESETS, formatGamepadKey } from '../gamepad-utils.js'
import {
  CaptureTargetTypeEnum,
  ScreenShotSaveWayEnum,
  type CaptureDisplayInfo,
  type CaptureWindowInfo,
  type GamepadDeviceInfo,
  type ScreenshotConfig,
  type ScreenshotResult,
} from '../../core/types.js'
import type { MacOSPermissionsStatus } from '../adapter/types.js'
import { useMd3eShapes } from '../md3e-shape-context.js'
import { CaptureHeroTile, MetricStrip, SessionTile } from './EquipmentDeck.js'
import { WorkspaceTile } from './WorkspaceTile.js'
import { CaptureHubWidget } from './hub/CaptureHubWidget.js'
import {
  WorkspaceCell,
  WorkspaceGridProvider,
  WorkspaceLayoutToolbar,
  WorkspaceSortGrid,
} from './WorkspaceGrid.js'
import type { WorkspaceLayoutConfig, WorkspaceWidgetId } from '../workspace-layout.js'
import {
  ControllerTester,
  detectController,
  GamepadButtonIcon,
  type ControllerFamily,
} from '@hibernalglow/gamepad-expressive'
import {
  ExpressiveComboStage,
  getPlatformButtonLabel,
} from './ExpressiveComboStage.js'

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
  locale: string
  initialLayout?: WorkspaceLayoutConfig
  onSaveLayout?: (layout: WorkspaceLayoutConfig) => void
  /** Layout edit mode, toggled from the title bar's pencil. */
  layoutEditing?: boolean
  onLayoutEditingChange?: (next: boolean) => void
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
  locale,
  initialLayout,
  onSaveLayout,
  layoutEditing,
  onLayoutEditingChange,
}) => {
  const { session } = useMd3eShapes()
  const [presetMenuOpen, setPresetMenuOpen] = React.useState(false)
  const presetWrapRef = React.useRef<HTMLDivElement>(null)
  const presetTriggerRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (!presetMenuOpen) return
    presetWrapRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus()
    const onPointerDown = (event: PointerEvent) => {
      if (!presetWrapRef.current?.contains(event.target as Node)) setPresetMenuOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setPresetMenuOpen(false)
        presetTriggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [presetMenuOpen])

  const isZh = locale.startsWith('zh')
  const isWindowMode = config.captureTargetType === CaptureTargetTypeEnum.Window
  const isFocusedWindow = isWindowMode && config.windowCaptureMode === 'focused'
  const permissionMissing = Boolean(macPermissions?.isMac && !macPermissions.screenCapture)
  const activeDevice = gamepads.find((gamepad) => gamepad._index === selectedGamepadIndex) || gamepads[0]
  const detection = React.useMemo(() => detectController(activeDevice), [activeDevice])
  const effectiveFamily: ControllerFamily =
    detection.family === 'generic' ? 'xbox' : detection.family

  const keyName = (key: string) => {
    const platformLabel = getPlatformButtonLabel(key, effectiveFamily, isZh)
    const fallback = formatGamepadKey(key, isZh ? 'zh' : 'en')
    return {
      code: platformLabel.short !== key ? platformLabel.short : fallback.key,
      name: platformLabel.name !== key ? platformLabel.name : fallback.name,
    }
  }

  const handleToggleComboKey = (key: string) => {
    const exists = config.comboKeys.includes(key)
    const next = exists
      ? config.comboKeys.filter((item) => item !== key)
      : [...config.comboKeys, key]
    onChange({ comboKeys: next })
  }

  const targetLabel = isFocusedWindow
    ? isZh
      ? '当前聚焦窗口'
      : 'Focused window'
    : isWindowMode
      ? windows.find((window) => String(window.id) === String(config.windowSourceId))?.title ||
        (isZh ? '指定窗口' : 'Pinned window')
      : screens.find((screen) => String(screen.id) === String(config.screenSourceId))?.name ||
        (isZh ? '全屏捕获' : 'Full desktop')

  const targetModeLabel = isFocusedWindow
    ? isZh
      ? '跟随焦点'
      : 'Focused'
    : isWindowMode
      ? isZh
        ? '指定窗口'
        : 'Window'
      : isZh
        ? '全屏模式'
        : 'Desktop'

  const outputLabel = `${config.imageFormat.toUpperCase()} · ${
    config.screenShotSaveWay === ScreenShotSaveWayEnum.CilpboardOnly
      ? isZh
        ? '剪贴板'
        : 'Clipboard'
      : config.screenShotSaveWay === ScreenShotSaveWayEnum.FileAndCilpboard
        ? isZh
          ? '文件 + 剪贴板'
          : 'File + clipboard'
        : isZh
          ? '文件'
          : 'File'
  }`

  const comboSummary = config.comboKeys.length
    ? config.comboKeys.map((key) => keyName(key).code).join(' + ')
    : isZh
      ? '尚未设置组合键'
      : 'No combo configured'

  // Widgets the host currently allows; the capture hub is opt-in from settings.
  const widgetAvailability = React.useMemo<Partial<Record<WorkspaceWidgetId, boolean>>>(
    () => ({ ws_hub: Boolean(config.enableCaptureHub) }),
    [config.enableCaptureHub]
  )

  return (
    <div className="shiin-bento shiin-workspace">
      <div className="sb-page">
        <WorkspaceGridProvider
          locale={locale}
          initialLayout={initialLayout}
          onSaveLayout={onSaveLayout}
          isEditing={layoutEditing}
          onEditingChange={onLayoutEditingChange}
          availability={widgetAvailability}
        >
          <WorkspaceLayoutToolbar />

          <div className="sb-grid shiin-ws-grid" aria-label={isZh ? '工作台模块网格' : 'Workbench widget grid'}>
            <WorkspaceSortGrid>
              <WorkspaceCell id="ws_capture_hero">
                <CaptureHeroTile
                  locale={locale}
                  listening={listening}
                  pending={capturePending}
                  result={captureResult}
                  target={targetLabel}
                  output={outputLabel}
                  folder={config.path || ''}
                  permissionMissing={permissionMissing}
                  onCapture={onCapture}
                  onToggleListen={onToggleListen}
                  onSaveOBS={onSaveOBS}
                  onOpenFolder={onOpenFolder}
                  onOpenPermissions={onOpenPermissions}
                />
              </WorkspaceCell>

              <WorkspaceCell id="ws_session">
                <SessionTile
                  locale={locale}
                  listening={listening}
                  activeDevice={activeDevice}
                  target={targetLabel}
                  comboSummary={comboSummary}
                  folder={config.path || ''}
                  permissionMissing={permissionMissing}
                  onOpenPermissions={onOpenPermissions}
                  onRefreshGamepads={onRefreshGamepads}
                />
              </WorkspaceCell>

              <WorkspaceCell id="ws_metric_strip">
                <MetricStrip
                  locale={locale}
                  listening={listening}
                  target={targetLabel}
                  targetModeLabel={targetModeLabel}
                  output={outputLabel}
                  comboSummary={comboSummary}
                  comboCount={config.comboKeys.length}
                  autoArchive={Boolean(config.saveByActiveWinTitle)}
                  obsReplay={Boolean(config.obsReplayBufferOnLongPress)}
                />
              </WorkspaceCell>

              <WorkspaceCell id="ws_hub">
                {config.enableCaptureHub ? <CaptureHubWidget locale={locale} /> : null}
              </WorkspaceCell>

              <WorkspaceCell id="ws_capture">
                {/* Capture & output: span 7 by default, left pane on tablet, first on mobile */}
                <section
                  className="sb-tile sb-capture-tile"
                  aria-label={isZh ? '画面捕获与输出' : 'Capture and output'}
                >
            <div className="sb-tile-head">
              <div>
                <h3>{isZh ? '画面捕获与输出' : 'Capture & output'}</h3>
                <p>
                  {isZh
                    ? '选择捕获目标、图像格式与文件归档位置。'
                    : 'Choose capture source, image format, and destination folder.'}
                </p>
              </div>
              <span className="sb-chip">
                {macPermissions?.isMac ? 'macOS' : isZh ? '画面来源' : 'Capture source'}
              </span>
            </div>

            <div className="sb-field" style={{ marginTop: 12 }}>
              <span className="sb-field-label">{isZh ? '捕获目标' : 'Capture target'}</span>
              <div className="sb-target-group" role="group" aria-label={isZh ? '捕获目标' : 'Capture target'}>
                <button
                  type="button"
                  aria-pressed={!isWindowMode}
                  onClick={() => onChange({ captureTargetType: CaptureTargetTypeEnum.Screen })}
                >
                  <AppIcon name="monitor" size={15} />
                  {isZh ? '全屏' : 'Desktop'}
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
                  <AppIcon name="appWindow" size={15} />
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
                  <AppIcon name="target" size={15} />
                  {isZh ? '聚焦窗口' : 'Focused window'}
                </button>
              </div>
            </div>

            <div className="sb-source-row">
              <span className="sb-source-icon" aria-hidden="true">
                <Md3eMorphShape path={session.shapes.icon.svgPath} className="sb-source-shape" />
                <AppIcon name={isFocusedWindow ? 'target' : isWindowMode ? 'appWindow' : 'monitor'} size={18} />
              </span>
              <div className="sb-source-copy">
                <span className="sb-field-label">
                  {isFocusedWindow
                    ? isZh
                      ? '跟随焦点'
                      : 'Follow focus'
                    : isWindowMode
                      ? isZh
                        ? '目标窗口'
                        : 'Target window'
                      : isZh
                        ? '显示器'
                        : 'Display'}
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
                <button
                  type="button"
                  className="sb-icon-button"
                  onClick={onRefreshWindows}
                  aria-label={isZh ? '刷新窗口' : 'Refresh windows'}
                >
                  <AppIcon name="refresh" size={16} />
                </button>
              )}
            </div>

            {isFocusedWindow && (
              <p className="sb-note" style={{ marginTop: 10 }}>
                {isZh
                  ? '每次触发时，自动跟随当前前台窗口。'
                  : 'Each capture grabs whichever window is focused at that moment.'}
              </p>
            )}

            <div className="sb-divider" />

            <div className="sb-output-row">
              <div className="sb-chip-group" role="group" aria-label={isZh ? '图像格式' : 'Image format'}>
                <button
                  type="button"
                  aria-pressed={config.imageFormat === 'jpg'}
                  onClick={() => onChange({ imageFormat: 'jpg' })}
                >
                  JPG
                </button>
                <button
                  type="button"
                  aria-pressed={config.imageFormat === 'png'}
                  onClick={() => onChange({ imageFormat: 'png' })}
                >
                  PNG
                </button>
                <button
                  type="button"
                  aria-pressed={config.imageFormat === 'webp'}
                  onClick={() => onChange({ imageFormat: 'webp' })}
                >
                  WebP
                </button>
                <button
                  type="button"
                  aria-pressed={config.imageFormat === 'avif'}
                  onClick={() => onChange({ imageFormat: 'avif' })}
                >
                  AVIF
                </button>
              </div>
              <BentoSelect
                className="sb-save-way-select"
                variant="chip"
                value={config.screenShotSaveWay}
                options={[
                  { value: ScreenShotSaveWayEnum.FileOnly, label: isZh ? '仅文件' : 'File only' },
                  { value: ScreenShotSaveWayEnum.CilpboardOnly, label: isZh ? '仅剪贴板' : 'Clipboard only' },
                  {
                    value: ScreenShotSaveWayEnum.FileAndCilpboard,
                    label: isZh ? '文件 + 剪贴板' : 'File + clipboard',
                  },
                ]}
                onChange={(next) =>
                  onChange({ screenShotSaveWay: next as ScreenshotConfig['screenShotSaveWay'] })
                }
                ariaLabel={isZh ? '保存方式' : 'Save as'}
              />
            </div>

            {config.imageFormat !== 'png' && (
              <div className="sb-quality-block">
                <div className="sb-quality-header">
                  <span className="sb-field-label">{isZh ? '图片质量' : 'Quality'}</span>
                  <div className="sb-quality-actions">
                    {(config.imageFormat === 'webp' || config.imageFormat === 'avif') && (
                      <button
                        type="button"
                        className="sb-lossless-toggle"
                        aria-pressed={Boolean(config.imageLossless)}
                        onClick={() => onChange({ imageLossless: !config.imageLossless })}
                        title={isZh ? '切换有损 / 无损编码模式' : 'Toggle lossy / lossless compression'}
                      >
                        {isZh ? '无损模式' : 'Lossless'}
                      </button>
                    )}
                    <output className="sb-quality-output">
                      {config.imageLossless && (config.imageFormat === 'webp' || config.imageFormat === 'avif')
                        ? isZh
                          ? '无损'
                          : 'Lossless'
                        : `${config.imageQuality ?? 90}%`}
                    </output>
                  </div>
                </div>

                {!config.imageLossless || (config.imageFormat !== 'webp' && config.imageFormat !== 'avif') ? (
                  <div className="sb-quality-slider-wrap">
                    <input
                      className="sb-slider"
                      type="range"
                      min={20}
                      max={100}
                      step={1}
                      value={config.imageQuality ?? 90}
                      style={
                        {
                          '--sb-progress': `calc(9px + (100% - 18px) * ${((config.imageQuality ?? 90) - 20) / 80})`,
                        } as React.CSSProperties
                      }
                      onChange={(e) => onChange({ imageQuality: Number(e.target.value) })}
                      aria-label={isZh ? '图片质量' : 'Image quality'}
                    />
                  </div>
                ) : (
                  <p className="sb-note" style={{ margin: '2px 0 0', fontSize: 11.5 }}>
                    {isZh
                      ? '已开启无损压缩：保留 100% 原始像素细节，无需调节质量。'
                      : 'Lossless mode active: Preserves 100% pixel fidelity without compression loss.'}
                  </p>
                )}
              </div>
            )}

            <label className="sb-filename-field">
              <span className="sb-field-label">{isZh ? '文件名模板' : 'Filename template'}</span>
              <input
                className="sb-chip-input"
                value={config.fileNameTemplate}
                onChange={(event) => onChange({ fileNameTemplate: event.target.value })}
                placeholder={isZh ? '文件名模板' : 'Filename template'}
              />
            </label>

            <div className="sb-folder-row">
              <span className="sb-path-chip" title={config.path || ''}>
                <AppIcon name="folder" size={13} />
                <span>{config.path || (isZh ? '系统默认截图目录' : 'System default folder')}</span>
              </span>
              <button type="button" className="sb-folder-action" onClick={onSelectFolder}>
                <AppIcon name="folder" size={16} />
                {isZh ? '更换目录' : 'Change folder'}
              </button>
              <button type="button" className="sb-folder-action" onClick={onOpenFolder}>
                <AppIcon name="external" size={16} />
                {isZh ? '打开目录' : 'Open folder'}
              </button>
            </div>
                </section>
              </WorkspaceCell>

              <WorkspaceCell id="ws_combos">
                {/* Trigger combos: span 5 by default */}
                <WorkspaceTile
                  className="sb-combos-tile"
                  title={isZh ? '触发组合' : 'Trigger combos'}
                  description={
                    isZh
                      ? 'MD3 Expressive 输入状态：按住手柄组合键，松开后锁定组合。'
                      : 'MD3 Expressive input state: hold a gamepad chord, then release to lock it.'
                  }
                  summary={comboSummary}
                  badge={<span className="sb-chip">{config.comboKeys.length} {isZh ? '键' : 'keys'}</span>}
                >
            <Md3eMorphShape path={session.shapes.control.svgPath} className="sb-combo-ghost" />
            <label className="sb-field" style={{ marginTop: 10 }}>
              <span className="sb-field-label">{isZh ? '目标手柄' : 'Gamepad'}</span>
              <BentoSelect
                className="sb-gamepad-select"
                value={String(gamepads.length > 0 ? selectedGamepadIndex : -1)}
                options={
                  gamepads.length > 0
                    ? gamepads.map((gamepad) => ({ value: String(gamepad._index), label: gamepad.name }))
                    : [
                        {
                          value: '-1',
                          label: isZh ? '未检测到手柄，按任意键唤醒' : 'No gamepad — press any button',
                        },
                      ]
                }
                onChange={(next) => onSelectGamepad(Number(next))}
                ariaLabel={isZh ? '目标手柄' : 'Gamepad'}
              />
            </label>

            {/* MD 3 Expressive Abstract Gamepad Key Recognition Stage ("神似而不求形似") */}
            <ExpressiveComboStage
              activeDevice={activeDevice}
              comboKeys={config.comboKeys}
              liveRecordingKeys={liveRecordingKeys}
              recordingCombo={recordingCombo}
              buttons={buttons}
              axes={axes}
              locale={locale}
            />

            {recordingCombo ? (
              <div
                style={{
                  marginTop: 10,
                  padding: 12,
                  borderRadius: 18,
                  background: 'var(--sb-primary-container)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <strong style={{ fontSize: 12.5, color: 'var(--sb-on-primary-container)' }}>
                    {isZh ? '请按住想要的按键…' : 'Hold the buttons you want…'}
                  </strong>
                  <button
                    type="button"
                    className="sb-secondary-button"
                    style={{ minHeight: 28, padding: '0 9px', fontSize: 11 }}
                    onClick={onCancelComboRecording}
                  >
                    {isZh ? '取消' : 'Cancel'}
                  </button>
                </div>
                <div className="sb-combo-row" style={{ marginTop: 8 }}>
                  {liveRecordingKeys.length === 0 && (
                    <span className="sb-note" style={{ color: 'var(--sb-on-primary-container)' }}>
                      {isZh ? '等待按键输入…' : 'Waiting for buttons…'}
                    </span>
                  )}
                  {liveRecordingKeys.map((key) => {
                    const info = keyName(key)
                    return (
                      <span
                        key={key}
                        className="sb-combo-key"
                        style={{
                          background: 'var(--sb-surface-high)',
                          borderColor: 'transparent',
                          color: 'var(--sb-on-primary-container)',
                        }}
                      >
                        <GamepadButtonIcon button={key} family={effectiveFamily} size={20} active={true} />
                        <span style={{ fontSize: 11, fontWeight: 700 }}>{info.name}</span>
                      </span>
                    )
                  })}
                </div>
              </div>
            ) : config.comboKeys.length === 0 ? (
              <p className="sb-note" style={{ marginTop: 10 }}>
                {isZh
                  ? '还没有组合键。点击上方抽象键位、下方“识别组合键”或选择一个预设。'
                  : 'No combo yet. Click abstract keys above, detect a combo, or pick a preset.'}
              </p>
            ) : (
              <div className="sb-combo-row" style={{ marginTop: 10 }}>
                {config.comboKeys.map((key, index) => {
                  const info = keyName(key)
                  return (
                    <span key={`${key}-${index}`} className="sb-combo-key">
                      <GamepadButtonIcon button={key} family={effectiveFamily} size={20} active={true} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--sb-ink)' }}>{info.name}</span>
                      <button
                        type="button"
                        onClick={() => onRemoveKey(index)}
                        aria-label={isZh ? '移除此按键' : 'Remove key'}
                      >
                        <AppIcon name="close" size={10} />
                      </button>
                    </span>
                  )
                })}
              </div>
            )}

            <div className="sb-split-wrap" ref={presetWrapRef}>
              <div className="sb-split-button">
                <button
                  type="button"
                  className="sb-split-main"
                  onClick={recordingCombo ? onCancelComboRecording : onStartComboRecording}
                >
                  <span className="sb-control-seat" aria-hidden="true">
                    <Md3eMorphShape path={session.shapes.control.svgPath} />
                    <AppIcon name="target" size={16} />
                  </span>
                  {recordingCombo ? (isZh ? '取消识别' : 'Cancel') : isZh ? '识别组合键' : 'Detect combo'}
                </button>
                <button
                  type="button"
                  className="sb-split-trail"
                  ref={presetTriggerRef}
                  aria-haspopup="menu"
                  aria-controls={presetMenuOpen ? 'combo-presets-menu' : undefined}
                  aria-expanded={presetMenuOpen}
                  aria-label={isZh ? '组合预设' : 'Combo presets'}
                  onClick={() => setPresetMenuOpen((open) => !open)}
                >
                  <AppIcon name="chevronDown" size={16} />
                </button>
              </div>
              {presetMenuOpen && (
                <div
                  className="sb-menu"
                  role="menu"
                  id="combo-presets-menu"
                  onKeyDown={(event) => {
                    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
                    event.preventDefault()
                    const items = Array.from(
                      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')
                    )
                    const index = items.indexOf(document.activeElement as HTMLButtonElement)
                    const next =
                      event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? items.length - 1
                          : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
                    items[next]?.focus()
                  }}
                >
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
              <span className="sb-ribbon-label">{isZh ? '常用预设' : 'Quick presets'}</span>
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
                </WorkspaceTile>
              </WorkspaceCell>

              <WorkspaceCell id="ws_listener">
                {/* Listener & automation: span 7 by default */}
                <WorkspaceTile
                  className="sb-listener-tile"
                  title={isZh ? '监听与自动化' : 'Listener & automation'}
                  description={isZh ? '后台监听、长按回放与自动归档。' : 'Background listening, replay and auto filing.'}
                  summary={listening ? (isZh ? '后台监听已激活' : 'Listener active') : isZh ? '后台监听已暂停' : 'Listener paused'}
                >
            <div
              className="sb-toggle-group"
              role="group"
              aria-label={isZh ? '监听与自动化开关' : 'Listener and automation toggles'}
            >
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
              <span className="sb-toggle-icon">
                <AppIcon name="keyboard" size={18} />
              </span>
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
                </WorkspaceTile>
              </WorkspaceCell>

              <WorkspaceCell id="ws_tester">
                {/* Live tester: span 5 by default */}
                <WorkspaceTile
                  className="sb-tester-tile"
                  title={isZh ? '实时测试器' : 'Live tester'}
                  description={
                    isZh
                      ? 'MD3 Expressive 抽象手柄艺术舞台与实时信号监控。'
                      : 'MD3 Expressive abstract controller art & live signal telemetry.'
                  }
                  summary={
                    gamepads.length
                      ? isZh
                        ? '手柄已连接，支持御三家与通用抽象外观'
                        : 'Gamepad connected — Xbox, PlayStation & Switch expressive skins'
                      : isZh
                        ? '支持御三家抽象形态预览，连接手柄即时点亮信号'
                        : 'Preview Xbox, PlayStation & Switch expressive skins or connect a gamepad'
                  }
                  badge={
                    <span className="sb-chip">
                      {gamepads.length ? (isZh ? '已连接' : 'Connected') : isZh ? '预览待命' : 'Standby'}
                    </span>
                  }
                >
                  <div style={{ marginTop: 12 }}>
                    <ControllerTester
                      deviceInfo={activeDevice || null}
                      buttons={buttons}
                      axes={axes}
                      locale={isZh ? 'zh' : 'en'}
                      allowFamilySwitch={true}
                      showRawInspector={false}
                      onButtonPress={handleToggleComboKey}
                    />
                  </div>
                </WorkspaceTile>
              </WorkspaceCell>
            </WorkspaceSortGrid>
          </div>
        </WorkspaceGridProvider>
      </div>
    </div>
  )
}
