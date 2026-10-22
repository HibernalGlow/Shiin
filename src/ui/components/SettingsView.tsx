import * as React from 'react'
import { AppIcon } from './AppIcon.js'
import { LANGUAGES } from '../i18n.js'
import {
  MD3E_ICON_SHAPES,
  MD3E_SHAPE_PRESETS,
  MD3E_SHAPE_ROLES,
  MD3E_SHAPE_ROLE_META,
  MD3E_TEXT_SHAPES,
  getIconShape,
  getPressedShape,
  sessionRoleShapeIds,
  type Md3eShapePreferences,
  type Md3eShapeRole,
  type Md3eShapeSession,
} from '../md3e-shapes.js'
import { BentoSelect, Md3eMorphShape } from './bento-controls.js'
import { ScreenshotSoundEnum, type ScreenshotConfig } from '../../core/types.js'
import type { MacOSPermissionsStatus, PermissionTargetType, ScreenshotPermissionTestResult } from '../adapter/types.js'
import { PermissionSettings } from './PermissionSettings.js'

export interface SettingsViewProps {
  config: ScreenshotConfig
  onChange: (patch: Partial<ScreenshotConfig>) => void
  onClearLogs?: () => void
  onCheckUpdate?: () => void
  onOpenGithub?: () => void
  onOpenFolder?: () => void
  onSelectFolder?: () => void
  onSelectLocale?: (locale: string) => void
  appVersion?: string
  locale?: string
  isMac?: boolean
  macPermissions?: MacOSPermissionsStatus | null
  initialSection?: 'general' | 'permissions'
  permissionRequest?: number
  saveState?: 'saved' | 'saving' | 'error'
  onRetrySave?: () => void
  onRefreshPermissions: () => Promise<void>
  onRequestPermission: (target: PermissionTargetType) => Promise<void>
  onTestScreenshot: () => Promise<ScreenshotPermissionTestResult | null>
  onToggleAutoStart?: (enable: boolean) => void
  onEnterLightweightMode?: () => void
  shapePreferences: Md3eShapePreferences
  shapeSession: Md3eShapeSession
  onShapePreferencesChange: (next: Md3eShapePreferences) => void
  onRerollShapeSession: () => void
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  onChange,
  onClearLogs,
  onCheckUpdate,
  onOpenGithub,
  onOpenFolder,
  onSelectFolder,
  onSelectLocale,
  appVersion = '2.0.0',
  locale = 'zh',
  isMac = false,
  macPermissions,
  initialSection = 'general',
  permissionRequest,
  saveState = 'saved',
  onRetrySave,
  onRefreshPermissions,
  onRequestPermission,
  onTestScreenshot,
  onToggleAutoStart,
  onEnterLightweightMode,
  shapePreferences,
  shapeSession,
  onShapePreferencesChange,
  onRerollShapeSession,
}) => {
  const isZh = locale.startsWith('zh')
  const isRandom = shapePreferences.mode === 'random'
  const [selectedRole, setSelectedRole] = React.useState<Md3eShapeRole>('hero')
  const selectedRoleMeta = MD3E_SHAPE_ROLE_META[selectedRole]
  const roleShape = shapeSession.shapes[selectedRole]
  const deviceShape = shapeSession.shapes.device
  const textShape = shapeSession.text
  const volumePercent = Math.round((config.soundPower ?? 1) * 100)
  const notifyOn = (config.overlayNotify || 'show') === 'show'

  const updateMode = (mode: Md3eShapePreferences['mode']) => {
    onShapePreferencesChange({ ...shapePreferences, mode, preset: mode === 'random' ? 'custom' : shapePreferences.preset })
  }

  const selectRoleShape = (icon: Md3eShapePreferences['shapes'][Md3eShapeRole]) => {
    onShapePreferencesChange({
      ...shapePreferences,
      mode: 'fixed',
      preset: 'custom',
      shapes: { ...sessionRoleShapeIds(shapeSession), [selectedRole]: icon },
      text: textShape.id,
    })
  }

  const selectTextShape = (text: Md3eShapePreferences['text']) => {
    onShapePreferencesChange({
      ...shapePreferences,
      mode: 'fixed',
      preset: 'custom',
      shapes: sessionRoleShapeIds(shapeSession),
      text,
    })
  }

  const applyPreset = (presetId: string) => {
    const preset = MD3E_SHAPE_PRESETS.find((item) => item.id === presetId)
    if (!preset) return
    onShapePreferencesChange({
      ...shapePreferences,
      mode: 'fixed',
      preset: preset.id,
      shapes: { ...preset.shapes },
      text: preset.text,
    })
  }

  const lockCurrent = () => {
    onShapePreferencesChange({
      mode: 'fixed',
      preset: 'custom',
      shapes: sessionRoleShapeIds(shapeSession),
      text: textShape.id,
    })
  }

  const randomizeAll = () => {
    onShapePreferencesChange({ ...shapePreferences, mode: 'random', preset: 'custom' })
    onRerollShapeSession()
  }

  const [pressedShape, setPressedShape] = React.useState<string | null>(null)
  const shapeRailRef = React.useRef<HTMLDivElement | null>(null)
  const scrollShapeRail = (direction: number) => {
    const node = shapeRailRef.current
    if (!node) return
    node.scrollBy({ left: direction * Math.max(node.clientWidth * 0.72, 160), behavior: 'smooth' })
  }
  React.useEffect(() => {
    const rail = shapeRailRef.current
    if (!rail) return
    const centerSelected = () => {
      const selected = rail.querySelector<HTMLButtonElement>('.sb-shape-option[aria-pressed="true"]')
      if (!selected) return
      const railRect = rail.getBoundingClientRect()
      const tileRect = selected.getBoundingClientRect()
      const centered =
        rail.scrollLeft + tileRect.left - railRect.left - (rail.clientWidth - tileRect.width) / 2
      rail.scrollTo({ left: Math.max(0, centered), behavior: 'auto' })
    }
    centerSelected()
    const timer = window.setTimeout(centerSelected, 80)
    return () => window.clearTimeout(timer)
  }, [roleShape.id, selectedRole])

  const handleAutoStart = (value: boolean) => {
    if (onToggleAutoStart) onToggleAutoStart(value)
    else onChange({ autoStart: value })
  }

  const handleLocaleChange = (next: string) => {
    onSelectLocale?.(next)
    onChange({ locale: next } as Partial<ScreenshotConfig>)
  }

  const testNotification = async () => {
    const { playCaptureSound } = await import('../audio.js')
    void playCaptureSound(config.sound, config.soundPower)
    if ((window as any).electronAPI?.showScreenshotNotification) {
      void (window as any).electronAPI.showScreenshotNotification({
        title: isZh ? '截图测试通知' : 'Screenshot toast test',
        desc: isZh ? '通知浮层与音效工作正常' : 'Toast and sound are working properly',
        duration: 3500,
      })
    }
  }

  return (
    <div className="shiin-bento">
      <div className="sb-page">
        <header className="sb-masthead">
          <div>
            <h2>{isZh ? '设置' : 'Settings'}</h2>
            <p className="sb-lede">
              {isZh
                ? '调整外观、系统访问与后台行为。'
                : 'Appearance, system access and background behavior.'}
            </p>
          </div>
          <span className="sb-save-state" data-state={saveState} role="status" aria-live="polite">
            <i />
            {saveState === 'error' ? (isZh ? '尚未保存' : 'Not saved') : saveState === 'saving' ? (isZh ? '正在保存…' : 'Saving…') : (isZh ? '自动保存到本机' : 'Saved on this device')}
            {saveState === 'error' && <button type="button" onClick={onRetrySave}>{isZh ? '重试保存' : 'Retry save'}</button>}
          </span>
        </header>

        <PermissionSettings locale={locale} isMac={isMac} permissions={macPermissions} initialSection={initialSection} revealRequest={permissionRequest}
          folder={config.path} onRefresh={onRefreshPermissions} onRequest={onRequestPermission}
          onTest={onTestScreenshot} onSelectFolder={onSelectFolder} onOpenFolder={onOpenFolder} />
        <div className="sb-grid">
          <section className="sb-tile sb-shape-tile" id="settings-shape" aria-label={isZh ? '形状实验室' : 'Shape lab'}>
            <div className="sb-tile-head">
              <div>
                <h3>{isZh ? '形状实验室' : 'Shape lab'}</h3>
                <p>
                  {isZh
                    ? '选择界面中的对象，调整它的轮廓。'
                    : 'Choose an interface object and adjust its silhouette.'}
                </p>
              </div>
              <span className="sb-chip tertiary">{isZh ? '35 种轮廓' : '35 shapes'}</span>
            </div>
            <div className="sb-shape-lab">
              <div className="sb-stage" aria-hidden="true">
                <Md3eMorphShape className="sb-stage-ghost" path={roleShape.svgPath} />
                <div className="sb-hero-shape">
                  <Md3eMorphShape path={roleShape.svgPath} />
                  <AppIcon name={selectedRole === 'metric' ? 'sliders' : selectedRole === 'icon' ? 'shield' : 'gamepad'} size={46} />
                </div>
                <span className="sb-stage-label">
                  {isZh ? selectedRoleMeta.name : selectedRoleMeta.nameEn} · {isZh ? roleShape.name : roleShape.nameEn}
                </span>
              </div>
              <div className="sb-shape-controls">
                <div className="sb-role-picker">
                  <div className="sb-picker-head">
                    <span className="sb-ribbon-label">{isZh ? '调整对象' : 'Interface object'}</span>
                  </div>
                  <div className="sb-role-list" role="group" aria-label={isZh ? '调整对象' : 'Interface object'}>
                    {MD3E_SHAPE_ROLES.map((role) => {
                      const meta = MD3E_SHAPE_ROLE_META[role]
                      return (
                        <button
                          key={role}
                          type="button"
                          className="sb-role-row"
                          aria-pressed={selectedRole === role}
                          onClick={() => setSelectedRole(role)}
                        >
                          <span className="sb-role-row-shape" aria-hidden="true">
                            <Md3eMorphShape path={shapeSession.shapes[role].svgPath} />
                          </span>
                          <span className="sb-role-row-copy">
                            <strong>{meta.name}</strong>
                            <small>{meta.description}</small>
                          </span>
                          <span className="sb-readout-pill">{shapeSession.shapes[role].name}</span>
                          <AppIcon name="chevronRight" size={14} />
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <div className="sb-picker-head">
                    <span className="sb-ribbon-label">
                      {isZh ? '选择轮廓' : 'Choose a silhouette'}
                    </span>
                  </div>
                  <div className="sb-shape-picker">
                    <button
                      type="button"
                      className="sb-picker-scroll"
                      data-dir="prev"
                      onClick={() => scrollShapeRail(-1)}
                      aria-label={isZh ? '上一组形状' : 'Previous shapes'}
                    >
                      <AppIcon name="chevronRight" size={16} />
                    </button>
                    <div
                      className="sb-shape-ribbon"
                      ref={shapeRailRef}
                      role="group"
                      aria-label={isZh ? `${selectedRoleMeta.name}形状` : `${selectedRoleMeta.nameEn} shape`}
                    >
                      {MD3E_ICON_SHAPES.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className="sb-shape-option"
                          aria-pressed={roleShape.id === option.id}
                          onPointerDown={() => setPressedShape(option.id)}
                          onPointerUp={() => setPressedShape(null)}
                          onPointerLeave={() => setPressedShape(null)}
                          onPointerCancel={() => setPressedShape(null)}
                          onClick={() => selectRoleShape(option.id)}
                        >
                          <Md3eMorphShape
                            path={option.svgPath}
                            pressed={pressedShape === option.id}
                            pressedPath={getPressedShape(option.id).svgPath}
                            className="sb-choice-shape"
                          />
                          <span>{isZh ? option.name : option.nameEn}</span>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="sb-picker-scroll"
                      onClick={() => scrollShapeRail(1)}
                      aria-label={isZh ? '下一组形状' : 'Next shapes'}
                    >
                      <AppIcon name="chevronRight" size={16} />
                    </button>
                  </div>
                </div>
                <div className="sb-text-shape-row">
                  <span className="sb-text-label">{isZh ? '文字按钮' : 'TEXT BUTTON'}</span>
                  <div className="sb-text-options" role="group" aria-label={isZh ? '文字按钮形态' : 'Text button shape'}>
                    {MD3E_TEXT_SHAPES.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className="sb-text-option"
                        data-text={option.id}
                        aria-pressed={textShape.id === option.id}
                        onClick={() => selectTextShape(option.id)}
                      >
                        {isZh ? option.name : option.nameEn}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="sb-tile sb-session-tile" aria-label={isZh ? '形状策略' : 'Shape strategy'}>
            <Md3eMorphShape className="sb-session-tile-ghost" path={deviceShape.svgPath} />
            <div className="sb-tile-head">
              <div>
                <h3>{isZh ? '形状策略' : 'Shape strategy'}</h3>
              </div>
              <span className={`sb-chip ${isRandom ? 'tertiary' : ''}`}>
                {isRandom ? (isZh ? '每次启动' : 'At launch') : isZh ? '固定组合' : 'Fixed set'}
              </span>
            </div>
            <div className="sb-strategy">
              <div className="sb-connected sb-strategy-group" role="group" aria-label={isZh ? '形状策略' : 'Shape strategy'}>
                <button type="button" aria-pressed={!isRandom} onClick={() => updateMode('fixed')}>
                  <AppIcon name="lock" size={17} />
                  {isZh ? '固定组合' : 'Fixed'}
                </button>
                <button type="button" aria-pressed={isRandom} onClick={() => updateMode('random')}>
                  <AppIcon name="dice" size={17} />
                  {isZh ? '启动随机' : 'Random'}
                </button>
              </div>
              <span className="sb-strategy-note">
                {isRandom
                  ? isZh
                    ? '每次启动更换轮廓，使用时保持稳定。'
                    : 'New silhouettes at launch, stable while in use.'
                  : isZh
                    ? '保持当前各类轮廓，下次启动不变。'
                    : 'Keeps every class silhouette across launches.'}
              </span>
            </div>
            <div className="sb-preset-section">
              <div className="sb-picker-head">
                <span className="sb-ribbon-label">{isZh ? '快速预设' : 'QUICK PRESETS'}</span>
              </div>
              <div className="sb-preset-cards">
                {MD3E_SHAPE_PRESETS.slice(0, 4).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className="sb-preset-card"
                    aria-pressed={!isRandom && shapePreferences.preset === preset.id}
                    onClick={() => applyPreset(preset.id)}
                  >
                    <span className="sb-preset-art" aria-hidden="true">
                      {(['hero', 'icon', 'metric'] as const).map((role) => (
                        <svg key={role} viewBox="0 0 100 100" focusable="false">
                          <path d={getIconShape(preset.shapes[role]).svgPath} />
                        </svg>
                      ))}
                    </span>
                    <span>{isZh ? preset.name : preset.nameEn}</span>
                  </button>
                ))}
              </div>
            </div>
            <button type="button" className="sb-randomize-all" onClick={randomizeAll}>
              <AppIcon name="dice" size={18} />
              {isZh ? '随机全部形状' : 'Randomize all shapes'}
            </button>
            <div className="sb-session-combo">
              <span className="sb-session-combo-art" aria-hidden="true">
                <Md3eMorphShape path={deviceShape.svgPath} />
                <AppIcon name="gamepad" size={18} />
              </span>
              <div>
                <strong>
                  {isZh ? deviceShape.name : deviceShape.nameEn} · {isZh ? textShape.name : textShape.nameEn}
                </strong>
                <small>{isZh ? '设置徽记 · 文字按钮' : 'Settings emblem · Text buttons'}</small>
              </div>
            </div>
            <div className="sb-session-actions">
              <button type="button" className="sb-lock" disabled={!isRandom} onClick={lockCurrent}>
                <AppIcon name="lock" size={15} />
                {isZh ? '固定当前组合' : 'Lock current'}
              </button>
              <button type="button" className="sb-next" disabled={!isRandom} onClick={onRerollShapeSession}>
                <AppIcon name="dice" size={15} />
                {isZh ? '模拟下次启动' : 'Next launch'}
              </button>
            </div>
          </section>

          <section
            className="sb-tile sb-startup-tile"
            id="settings-startup"
            aria-label={isZh ? '启动与托盘' : 'Startup & tray'}
          >
            <div className="sb-tile-head">
              <div>
                <h3>{isZh ? '启动与托盘' : 'Startup & tray'}</h3>
                <p>{isZh ? '登录后保持监听，不打断游戏。' : 'Keep listening after login without interrupting play.'}</p>
              </div>
            </div>
            <div className="sb-toggle-group sb-toggle-group--two" role="group" aria-label={isZh ? '启动与托盘开关' : 'Startup and tray toggles'}>
              <button
                type="button"
                className="sb-toggle"
                aria-pressed={Boolean(config.autoStart)}
                onClick={() => handleAutoStart(!config.autoStart)}
              >
                <span className="sb-toggle-icon"><AppIcon name="power" size={18} /></span>
                <span className="sb-toggle-copy">
                  <strong>{isZh ? '开机自启动' : 'Launch at login'}</strong>
                  <small>{isZh ? '登录后驻留托盘' : 'Stay in tray'}</small>
                </span>
              </button>
              <button
                type="button"
                className="sb-toggle"
                aria-pressed={Boolean(config.startInLightweightMode)}
                onClick={() => onChange({ startInLightweightMode: !config.startInLightweightMode })}
              >
                <span className="sb-toggle-icon"><AppIcon name="minus" size={18} /></span>
                <span className="sb-toggle-copy">
                  <strong>{isZh ? '轻量模式启动' : 'Lightweight start'}</strong>
                  <small>{isZh ? '不创建主窗口' : 'No main window'}</small>
                </span>
              </button>
            </div>
            <div className="sb-settings-grid">
              <div className="sb-field">
                <span className="sb-field-label">{isZh ? '关闭主窗口' : 'CLOSE BEHAVIOR'}</span>
                <BentoSelect
                  value={config.closeType || 'exit'}
                  options={[
                    { value: 'exit', label: isZh ? '直接退出' : 'Exit' },
                    { value: 'tray', label: isZh ? '隐藏到托盘' : 'Hide to tray' },
                    { value: 'lightweight', label: isZh ? '轻量模式' : 'Lightweight' },
                  ]}
                  onChange={(next) => onChange({ closeType: next as ScreenshotConfig['closeType'] })}
                  ariaLabel={isZh ? '关闭主窗口' : 'Close behavior'}
                />
              </div>
              <div className="sb-field">
                <span className="sb-field-label">{isZh ? '同名文件冲突' : 'FILENAME CONFLICT'}</span>
                <BentoSelect
                  value={config.filenameConflictResolution || 'overwrite'}
                  options={[
                    { value: 'overwrite', label: isZh ? '直接覆盖' : 'Overwrite' },
                    { value: 'appendTimestamp', label: isZh ? '追加时间戳' : 'Append timestamp' },
                    { value: 'notSave', label: isZh ? '放弃保存' : 'Do not save' },
                  ]}
                  onChange={(next) => onChange({ filenameConflictResolution: next as ScreenshotConfig['filenameConflictResolution'] })}
                  ariaLabel={isZh ? '同名文件冲突' : 'Filename conflict'}
                />
              </div>
            </div>
            {onEnterLightweightMode && (
              <div className="sb-setting-action">
                <div className="sb-row-copy">
                  <strong>{isZh ? '立即释放界面内存' : 'Free UI memory now'}</strong>
                  <small>{isZh ? '销毁主窗口，保留后台监听' : 'Destroy the window and keep listening'}</small>
                </div>
                <button type="button" className="sb-secondary-button" onClick={onEnterLightweightMode}>
                  <AppIcon name="minus" size={14} />
                  {isZh ? '进入' : 'Enter'}
                </button>
              </div>
            )}
          </section>

          <section
            className="sb-tile sb-notify-tile"
            id="settings-notify"
            aria-label={isZh ? '通知与声音' : 'Notifications & sound'}
          >
            <div className="sb-tile-head">
              <div>
                <h3>{isZh ? '快门声音' : 'Shutter sound'}</h3>
                <p>{isZh ? '与悬浮通知共用一次反馈。' : 'One feedback with the overlay toast.'}</p>
              </div>
            </div>
            <div className="sb-sound-row">
              <div className="sb-sound-label">
                <strong>{isZh ? '反馈音量' : 'Volume'}</strong>
                <output>{volumePercent}%</output>
              </div>
              <div className="sb-volume-control">
                <button
                  type="button"
                  className="sb-volume-step"
                  onClick={() => onChange({ soundPower: Math.max(0, volumePercent - 5) / 100 })}
                  disabled={volumePercent <= 0}
                  aria-label={isZh ? '降低音量' : 'Lower volume'}
                >
                  <AppIcon name="minus" size={16} />
                </button>
                <input
                  className="sb-slider"
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={volumePercent}
                  style={{ '--sb-progress': `${volumePercent}%` } as React.CSSProperties}
                  onChange={(event) => onChange({ soundPower: Number(event.target.value) / 100 })}
                  aria-label={isZh ? '反馈音量' : 'Feedback volume'}
                />
                <button
                  type="button"
                  className="sb-volume-step"
                  onClick={() => onChange({ soundPower: Math.min(100, volumePercent + 5) / 100 })}
                  disabled={volumePercent >= 100}
                  aria-label={isZh ? '提高音量' : 'Raise volume'}
                >
                  <AppIcon name="plus" size={16} />
                </button>
              </div>
            </div>
            <BentoSelect
              className="sb-notify-select-control"
              variant="notify"
              value={config.sound}
              options={[
                { value: ScreenshotSoundEnum.Sound1, label: isZh ? '徕卡 M10 · 96ms' : 'Leica M10 · 96ms' },
                { value: ScreenshotSoundEnum.Sound2, label: isZh ? '柔和铃声 · 373ms' : 'Soft chime · 373ms' },
                { value: ScreenshotSoundEnum.Sound3, label: isZh ? '单反快门 · 100ms' : 'Shutter · 100ms' },
                { value: ScreenshotSoundEnum.Sound4, label: isZh ? '机械反光板 · 143ms' : 'SLR clack · 143ms' },
                { value: ScreenshotSoundEnum.Sound5, label: isZh ? '佳能 5D · 164ms' : 'Canon 5D · 164ms' },
                { value: ScreenshotSoundEnum.None, label: isZh ? '静音' : 'Mute' },
              ]}
              onChange={(next) => onChange({ sound: next as ScreenshotConfig['sound'] })}
              ariaLabel={isZh ? '快门音效' : 'Shutter sound'}
            />
            <button
              type="button"
              className="sb-notify-toggle"
              aria-pressed={notifyOn}
              onClick={() => onChange({ overlayNotify: notifyOn ? 'hide' : 'show' })}
            >
              <span className="sb-toggle-icon"><AppIcon name="bell" size={18} /></span>
              <span className="sb-toggle-copy">
                <strong>{isZh ? '悬浮通知' : 'Overlay toast'}</strong>
                <small>{isZh ? '截图完成后显示缩略图' : 'Show a preview after capture'}</small>
              </span>
              <span className="sb-notify-track" data-on={notifyOn}>
                <span className="sb-notify-thumb">
                  <AppIcon name="check" size={13} />
                </span>
              </span>
            </button>
            <div className="sb-notify-position-field">
              <span className="sb-field-label">{isZh ? '通知位置' : 'TOAST POSITION'}</span>
              <BentoSelect
                className="sb-notify-select-control"
                variant="notify"
                value={config.overlayNotifyPosition || 'right'}
                options={[
                  { value: 'right', label: isZh ? '右上角' : 'Top right' },
                  { value: 'left', label: isZh ? '左上角' : 'Top left' },
                ]}
                onChange={(next) => onChange({ overlayNotifyPosition: next as ScreenshotConfig['overlayNotifyPosition'] })}
                ariaLabel={isZh ? '通知位置' : 'Toast position'}
              />
            </div>
            <div className="sb-notify-actions">
              <button type="button" onClick={() => void testNotification()}>
                {isZh ? '测试通知' : 'Test toast'}
              </button>
              <button
                type="button"
                onClick={() =>
                  void import('../audio.js').then(({ playCaptureSound }) =>
                    playCaptureSound(config.sound, config.soundPower)
                  )
                }
              >
                {isZh ? '试听' : 'Preview'}
              </button>
            </div>
          </section>

          <section className="sb-tile sb-data-tile" id="settings-data" aria-label={isZh ? '数据与更新' : 'Data & updates'}>
            <div className="sb-version">{appVersion}</div>
            <div className="sb-data-meta">SHIIN · {isZh ? '游戏手柄截图与即时回放' : 'GAMEPAD CAPTURE'}</div>
            <div className="sb-data-lang">
              <span>{isZh ? '界面语言' : 'Language'}</span>
              <BentoSelect
                className="sb-language-select"
                value={locale}
                options={LANGUAGES.map((language) => ({ value: language.code, label: language.native }))}
                onChange={handleLocaleChange}
                ariaLabel={isZh ? '界面语言' : 'Language'}
              />
            </div>
            <div className="sb-data-actions">
              {onOpenFolder && (
                <button type="button" className="sb-secondary-button" onClick={onOpenFolder}>
                  <AppIcon name="folder" size={14} />
                  {isZh ? '打开目录' : 'Open folder'}
                </button>
              )}
              {onSelectFolder && (
                <button type="button" className="sb-secondary-button" onClick={onSelectFolder}>
                  <AppIcon name="save" size={14} />
                  {isZh ? '更换目录' : 'Change folder'}
                </button>
              )}
              {onClearLogs && (
                <button type="button" className="sb-secondary-button" onClick={onClearLogs}>
                  <AppIcon name="trash" size={14} />
                  {isZh ? '清理日志' : 'Clear logs'}
                </button>
              )}
              {onCheckUpdate && (
                <button type="button" className="sb-secondary-button" onClick={onCheckUpdate}>
                  <AppIcon name="refresh" size={14} />
                  {isZh ? '检查更新' : 'Check updates'}
                </button>
              )}
              {onOpenGithub && (
                <button type="button" className="sb-secondary-button" onClick={onOpenGithub}>
                  <AppIcon name="github" size={14} />
                  GitHub
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
