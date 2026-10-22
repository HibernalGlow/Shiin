import * as React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AppIcon } from './AppIcon.js'
import { LANGUAGES, getLanguage } from '../i18n.js'
import type { WorkspaceDestination } from './CaptureDock.js'

export interface TitleBarProps {
  listening: boolean
  uiScale: number
  onSetUiScale: (scale: number) => void
  locale?: string
  onSelectLocale?: (locale: string) => void
  onToggleLocale?: () => void
  maximized: boolean
  onMinimize: () => void
  onToggleMaximize: () => void
  onClose: () => void
  version?: string
  isMac?: boolean
  isWeb?: boolean
  platform?: 'mac' | 'windows' | 'linux' | 'web'
  windowControlsPosition?: 'left' | 'right' | 'none'
  hasNativeTrafficLights?: boolean
  customControls?: boolean
  onOpenUpdate?: () => void
  hasUpdate?: boolean
  destination?: WorkspaceDestination
  onNavigate?: (next: WorkspaceDestination) => void
  /** Workbench layout editing, toggled from the pencil in the action cluster. */
  layoutEditing?: boolean
  onToggleLayoutEdit?: () => void
  onCapture?: () => void
  capturePending?: boolean
}

const UI_SCALES = [0.9, 1, 1.1, 1.25]
const popoverMotion = {
  initial: { opacity: 0, y: -8, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -5, scale: 0.98 },
  transition: { duration: 0.18 },
}

export const TitleBar: React.FC<TitleBarProps> = ({
  listening,
  uiScale,
  onSetUiScale,
  locale = 'zh',
  onSelectLocale,
  onToggleLocale,
  maximized,
  onMinimize,
  onToggleMaximize,
  onClose,
  version = '2.0.0',
  isMac = false,
  isWeb,
  platform,
  windowControlsPosition,
  hasNativeTrafficLights,
  customControls = false,
  onOpenUpdate,
  hasUpdate = false,
  destination = 'workspace',
  onNavigate,
  layoutEditing = false,
  onToggleLayoutEdit,
  onCapture,
  capturePending = false,
}) => {
  // 自动识别网页模式：未注入 ElectronAPI 或显式传入 isWeb 时判定为网页模式
  const detectedIsWeb = isWeb ?? (
    typeof window !== 'undefined'
      ? !Boolean((window as any).electronAPI)
      : true
  )

  const effectivePlatform: 'mac' | 'windows' | 'linux' | 'web' = platform ?? (
    detectedIsWeb
      ? 'web'
      : isMac
        ? 'mac'
        : 'windows'
  )

  const effectivePosition: 'left' | 'right' | 'none' = windowControlsPosition ?? (
    detectedIsWeb
      ? 'none'
      : effectivePlatform === 'mac'
        ? 'left'
        : 'right'
  )

  // macOS 桌面端在 hiddenInset 下由系统在左侧原生绘制交通灯（红黄绿），
  // 此时仅需为原生交通灯预留左侧空间，无需渲染 HTML 按钮；若 customControls 为 true 则渲染 HTML 控制器。
  const useNativeTrafficLights = hasNativeTrafficLights ?? (
    !detectedIsWeb && effectivePlatform === 'mac' && !customControls
  )

  const renderLeftControls = effectivePosition === 'left' && !useNativeTrafficLights
  const renderRightControls = effectivePosition === 'right'

  const isZh = locale.startsWith('zh')
  const currentLang = getLanguage(locale)
  const [menu, setMenu] = React.useState<'scale' | 'language' | null>(null)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)

  React.useEffect(() => {
    if (!menu) return
    const closeOutside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenu(null)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenu(null)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [menu])

  const navItems = React.useMemo<{ id: WorkspaceDestination; label: string; icon: string }[]>(() => [
    { id: 'workspace', label: isZh ? '工作台' : 'Workspace', icon: 'monitor' },
    { id: 'analytics', label: isZh ? '统计' : 'Analytics', icon: 'barChart' },
    { id: 'settings', label: isZh ? '设置' : 'Settings', icon: 'settings' },
  ], [isZh])

  return (
    <header
      className="shiin-titlebar"
      data-mac={!detectedIsWeb && effectivePlatform === 'mac'}
      data-platform={effectivePlatform}
      data-controls={effectivePosition}
      data-web={detectedIsWeb}
      data-custom-controls={customControls}
    >
      {renderLeftControls && (
        <div className="shiin-window-controls shiin-window-controls--left" data-position="left">
          <button
            type="button"
            className="shiin-window-button shiin-window-button--close"
            data-close="true"
            onClick={onClose}
            aria-label={isZh ? '关闭' : 'Close'}
          >
            <AppIcon name="close" size={12} />
          </button>
          <button
            type="button"
            className="shiin-window-button shiin-window-button--min"
            onClick={onMinimize}
            aria-label={isZh ? '最小化' : 'Minimize'}
          >
            <AppIcon name="minus" size={12} />
          </button>
          <button
            type="button"
            className="shiin-window-button shiin-window-button--max"
            onClick={onToggleMaximize}
            aria-label={maximized ? (isZh ? '还原' : 'Restore') : isZh ? '最大化' : 'Maximize'}
          >
            <AppIcon name={maximized ? 'restore' : 'square'} size={11} />
          </button>
        </div>
      )}
      <div className="shiin-titlebar__brand">
        <span className="shiin-titlebar__mark"><AppIcon name="camera" size={16} /></span>
        <strong className="shiin-titlebar__name">Shiin</strong>
        <button
          type="button"
          className="shiin-titlebar__version"
          onClick={onOpenUpdate}
          title={isZh ? '检查更新' : 'Check for updates'}
        >
          v{version}
          {hasUpdate && <span className="shiin-titlebar__update">{isZh ? '有更新' : 'NEW'}</span>}
        </button>
      </div>

      {onNavigate && (
        <nav
          className="shiin-desktop-nav"
          role="tablist"
          aria-label={isZh ? '桌面主导航' : 'Desktop navigation'}
        >
          {navItems.map((item, index) => {
            const active = destination === item.id
            return (
              <button
                key={item.id}
                id={`desktop-tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="shiin-main-panel"
                tabIndex={active ? 0 : -1}
                title={item.label}
                aria-label={item.label}
                onClick={() => onNavigate(item.id)}
                onKeyDown={(event) => {
                  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
                  event.preventDefault()
                  const next =
                    event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? navItems.length - 1
                        : (index + (event.key === 'ArrowRight' ? 1 : -1) + navItems.length) % navItems.length
                  onNavigate(navItems[next].id)
                  document.getElementById(`desktop-tab-${navItems[next].id}`)?.focus()
                }}
              >
                <span className="shiin-desktop-nav__icon">
                  <AppIcon name={item.icon} size={15} />
                </span>
                <span className="shiin-desktop-nav__label" aria-hidden="true">
                  <span className="shiin-desktop-nav__label-inner">{item.label}</span>
                </span>
              </button>
            )
          })}
        </nav>
      )}

      <div className="shiin-titlebar__center">
        <div className="shiin-titlebar__status" data-listening={listening} role="status">
          <i aria-hidden="true" />
          {listening
            ? isZh
              ? '监听已接通'
              : 'Listener connected'
            : isZh
              ? '待命 · 随时捕获'
              : 'Standby · ready to capture'}
        </div>
        {onCapture && (
          <button
            type="button"
            className="shiin-titlebar__capture"
            onClick={onCapture}
            disabled={capturePending}
            aria-busy={capturePending}
            title={isZh ? '立即截图' : 'Capture now'}
          >
            <AppIcon name={capturePending ? 'clock' : 'camera'} size={14} />
            <span>{capturePending ? (isZh ? '捕获中…' : 'Capturing…') : isZh ? '快门' : 'Capture'}</span>
          </button>
        )}
      </div>

      <div className="shiin-titlebar__actions" ref={menuRef}>
        {onToggleLayoutEdit && destination === 'workspace' && (
          <button
            type="button"
            className="shiin-titlebar-button"
            data-tone={layoutEditing ? 'accent' : undefined}
            aria-pressed={layoutEditing}
            aria-label={
              layoutEditing
                ? isZh
                  ? '完成布局调整'
                  : 'Done adjusting the layout'
                : isZh
                  ? '调整工作台布局'
                  : 'Adjust the workbench layout'
            }
            title={
              layoutEditing
                ? isZh
                  ? '完成布局调整'
                  : 'Done adjusting the layout'
                : isZh
                  ? '调整工作台布局'
                  : 'Adjust the workbench layout'
            }
            onClick={onToggleLayoutEdit}
          >
            <AppIcon name={layoutEditing ? 'check' : 'edit'} size={16} />
          </button>
        )}
        <div className="shiin-titlebar-menu">
          <button
            type="button"
            className="shiin-titlebar-button"
            data-active={menu === 'scale'}
            aria-label={isZh ? '界面缩放' : 'Interface scale'}
            aria-expanded={menu === 'scale'}
            aria-haspopup="true"
            onClick={(event) => {
              triggerRef.current = event.currentTarget
              setMenu(menu === 'scale' ? null : 'scale')
            }}
          >
            <AppIcon name="textSize" size={16} />
          </button>
          <AnimatePresence>
            {menu === 'scale' && (
              <motion.div className="shiin-titlebar-popover" {...popoverMotion}>
                {UI_SCALES.map((scale) => (
                  <button
                    type="button"
                    key={scale}
                    aria-pressed={uiScale === scale}
                    onClick={() => {
                      onSetUiScale(scale)
                      setMenu(null)
                      triggerRef.current?.focus()
                    }}
                  >
                    {Math.round(scale * 100)}%
                    {uiScale === scale && <AppIcon name="check" size={13} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="shiin-titlebar-menu">
          <button
            type="button"
            className="shiin-titlebar-button"
            data-active={menu === 'language'}
            aria-label={isZh ? '界面语言' : 'Interface language'}
            title={currentLang.native}
            aria-expanded={menu === 'language'}
            aria-haspopup="true"
            onClick={(event) => {
              triggerRef.current = event.currentTarget
              setMenu(menu === 'language' ? null : 'language')
            }}
          >
            {currentLang.short}
          </button>
          <AnimatePresence>
            {menu === 'language' && (
              <motion.div className="shiin-titlebar-popover" {...popoverMotion}>
                {LANGUAGES.map((lang) => (
                  <button
                    type="button"
                    key={lang.code}
                    aria-pressed={locale === lang.code}
                    onClick={() => {
                      if (onSelectLocale) onSelectLocale(lang.code)
                      else onToggleLocale?.()
                      setMenu(null)
                      triggerRef.current?.focus()
                    }}
                  >
                    {lang.native}
                    <small>{lang.short}</small>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {renderRightControls && (
          <div className="shiin-window-controls shiin-window-controls--right" data-position="right">
            <button
              type="button"
              className="shiin-window-button"
              onClick={onMinimize}
              aria-label={isZh ? '最小化' : 'Minimize'}
            >
              <AppIcon name="minus" size={14} />
            </button>
            <button
              type="button"
              className="shiin-window-button"
              onClick={onToggleMaximize}
              aria-label={maximized ? (isZh ? '还原' : 'Restore') : isZh ? '最大化' : 'Maximize'}
            >
              <AppIcon name={maximized ? 'restore' : 'square'} size={13} />
            </button>
            <button
              type="button"
              className="shiin-window-button"
              data-close="true"
              onClick={onClose}
              aria-label={isZh ? '关闭' : 'Close'}
            >
              <AppIcon name="close" size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
