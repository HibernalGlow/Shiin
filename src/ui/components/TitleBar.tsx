import * as React from 'react'
import { AppIcon } from './AppIcon.js'
import { ALIAS, MD3E_ALIAS } from '../md3e.js'
import { useMd3eShapes } from '../md3e-shape-context.js'
import { LANGUAGES, getLanguage } from '../i18n.js'
import type { MacOSPermissionsStatus } from '../adapter/types.js'

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
  onOpenUpdate?: () => void
  hasUpdate?: boolean
  permissions?: MacOSPermissionsStatus | null
  onOpenPermissions?: () => void
}


const UI_SCALES = [
  { value: 0.9, label: '90%' },
  { value: 1.0, label: '100%' },
  { value: 1.1, label: '110%' },
  { value: 1.25, label: '125%' },
]

interface TitleBarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  tone?: 'default' | 'danger' | 'success'
}

const TitleBarButton: React.FC<TitleBarButtonProps> = ({
  active,
  tone = 'default',
  children,
  style,
  ...rest
}) => {
  const { session } = useMd3eShapes()
  return (
    <button
      type="button"
      className="xaihi-titlebar-icon-button"
      data-active={active ? 'true' : 'false'}
      data-tone={tone}
      style={style}
      {...rest}
    >
      <svg className="xaihi-titlebar-shape" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <path d={session.shapes.icon.svgPath} />
      </svg>
      {children}
    </button>
  )
}

const WinControlButton: React.FC<{
  onClick: () => void
  title: string
  isClose?: boolean
  children: React.ReactNode
}> = ({ onClick, title, isClose, children }) => {
  const [hovered, setHovered] = React.useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: isClose ? 44 : 38,
        height: 44,
        padding: 0,
        margin: 0,
        border: 'none',
        outline: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        background: hovered
          ? isClose
            ? '#e81123'
            : 'rgba(255, 255, 255, 0.08)'
          : 'transparent',
        color: hovered && isClose ? '#ffffff' : ALIAS.onSurfaceVariant,
        transition: 'background-color 140ms ease, color 140ms ease',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </button>
  )
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
  onOpenUpdate,
  hasUpdate = false,
  permissions,
  onOpenPermissions,
}) => {
  const isZh = locale.startsWith('zh')
  const currentLang = getLanguage(locale)
  const [scaleOpen, setScaleOpen] = React.useState(false)
  const [langOpen, setLangOpen] = React.useState(false)

  const scaleWrapperRef = React.useRef<HTMLDivElement>(null)
  const langWrapperRef = React.useRef<HTMLDivElement>(null)

  // 点击外部自动收起浮层
  React.useEffect(() => {
    if (!scaleOpen && !langOpen) return

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (scaleOpen && scaleWrapperRef.current && !scaleWrapperRef.current.contains(target)) {
        setScaleOpen(false)
      }
      if (langOpen && langWrapperRef.current && !langWrapperRef.current.contains(target)) {
        setLangOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [scaleOpen, langOpen])

  return (
    <header
      style={{
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 0 0 ${isMac ? '78px' : '16px'}`,
        borderBottom: '1px solid var(--shiin-outline-soft, rgba(36, 23, 19, 0.09))',
        background: MD3E_ALIAS.surface,
        userSelect: 'none',
        WebkitAppRegion: 'drag' as any,
        position: 'relative',
        zIndex: 50,
      } as React.CSSProperties}
    >
      {/* 品牌与版本 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontWeight: 800, fontSize: 13.5, letterSpacing: '-0.02em', color: ALIAS.onSurface }}>
            Shiin
          </span>
          <button
            type="button"
            onClick={onOpenUpdate}
            className="xaihi-titlebar-version"
            title={hasUpdate ? (isZh ? '发现新版本，点击查看' : 'New version available') : (isZh ? '检查更新' : 'Check for updates')}
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '1.5px 6px',
              borderRadius: 999,
              background: hasUpdate
                ? 'color-mix(in srgb, var(--xaihi-md3e-tertiary, #7df2d2) 14%, transparent)'
                : MD3E_ALIAS.surfaceHigh,
              color: hasUpdate ? 'var(--xaihi-md3e-tertiary, #7df2d2)' : ALIAS.onSurfaceVariant,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              border: `1px solid ${hasUpdate ? 'color-mix(in srgb, var(--xaihi-md3e-tertiary, #7df2d2) 30%, transparent)' : 'var(--shiin-outline-soft, rgba(238, 241, 229, 0.1))'}`,
              cursor: onOpenUpdate ? 'pointer' : 'default',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              WebkitAppRegion: 'no-drag' as any,
            } as React.CSSProperties}
          >
            <span>v{version}</span>
            {hasUpdate && (
              <span style={{
                fontSize: 8.5,
                background: 'var(--xaihi-md3e-primary, #c9f56d)',
                color: 'var(--xaihi-md3e-on-primary, #1c2a05)',
                padding: '0.5px 4px',
                borderRadius: 4,
                fontWeight: 800,
              }}>
                NEW
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 居中状态药丸 */}
      <div
        className="xaihi-titlebar-status-pill"
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }}
      >
        <span style={{
          height: 24,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '0 12px',
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 700,
          border: `1px solid ${listening ? 'color-mix(in srgb, var(--xaihi-md3e-tertiary, #7df2d2) 30%, transparent)' : 'var(--shiin-outline-soft, rgba(238, 241, 229, 0.1))'}`,
          color: listening ? 'var(--xaihi-md3e-on-tertiary-container, #c9ffee)' : ALIAS.onSurfaceVariant,
          background: listening ? MD3E_ALIAS.tertiaryContainer : MD3E_ALIAS.surfaceHigh,
          backdropFilter: 'blur(12px)',
        }}>
          <i style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: listening ? 'var(--xaihi-md3e-tertiary, #7df2d2)' : 'rgba(238, 241, 229, 0.28)',
            boxShadow: listening ? '0 0 8px color-mix(in srgb, var(--xaihi-md3e-tertiary, #7df2d2) 50%, transparent)' : 'none',
          }} />
          {listening ? (isZh ? '正在监听' : 'Listening') : (isZh ? '闲置' : 'Idle')}
        </span>
      </div>

      {/* 右侧控制 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, WebkitAppRegion: 'no-drag' as any } as React.CSSProperties}>
        {/* 系统权限自检与状态入口 */}
        {onOpenPermissions && (
          <TitleBarButton
            onClick={onOpenPermissions}
            title={
              permissions?.isMac && !permissions?.allGranted
                ? isZh
                  ? '存在未授权的核心权限（屏幕录制等），点击打开检查'
                  : 'Missing system permissions, click to inspect and grant'
                : isZh
                  ? '系统权限正常 (点击打开权限自检中心)'
                  : 'Permissions OK (click to view diagnostics)'
            }
            tone={
              permissions?.isMac && !permissions?.allGranted
                ? 'danger'
                : permissions?.isMac && permissions?.allGranted
                ? 'success'
                : 'default'
            }
            style={{ position: 'relative' }}
          >
            <AppIcon name="shield" size={15} />
            {permissions?.isMac && !permissions?.allGranted && (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#ffb4ab',
                  boxShadow: '0 0 6px rgba(255, 180, 171, 0.5)',
                }}
              />
            )}
          </TitleBarButton>
        )}

        {/* 缩放选择 */}
        <div className="xaihi-titlebar-compact-hide" style={{ position: 'relative' }} ref={scaleWrapperRef}>
          <TitleBarButton
            active={scaleOpen}
            onClick={() => setScaleOpen((prev) => !prev)}
            title={isZh ? '界面缩放' : 'Scale'}
          >
            <AppIcon name="textSize" size={15} />
          </TitleBarButton>
          {scaleOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 8,
              padding: 6,
              borderRadius: 14,
              background: MD3E_ALIAS.surface,
              border: '1px solid var(--shiin-outline-soft, rgba(255, 255, 255, 0.1))',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              boxShadow: '0 18px 40px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(20px)',
              zIndex: 100,
              minWidth: 84,
            }}>
              {UI_SCALES.map((s) => {
                const isSelected = uiScale === s.value
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => {
                      onSetUiScale(s.value)
                      setScaleOpen(false)
                    }}
                    style={{
                      height: 26,
                      padding: '0 12px',
                      borderRadius: 8,
                      border: 'none',
                      background: isSelected ? MD3E_ALIAS.primary : 'transparent',
                      color: isSelected ? MD3E_ALIAS.onPrimary : ALIAS.onSurfaceVariant,
                      fontWeight: 750,
                      fontSize: 11,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 120ms ease',
                    }}
                  >
                    {s.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* 语言选择下拉 */}
        <div className="xaihi-titlebar-compact-hide" style={{ position: 'relative' }} ref={langWrapperRef}>
          <TitleBarButton
            active={langOpen}
            onClick={() => setLangOpen((prev) => !prev)}
            title={currentLang.native}
          >
            <span style={{ fontSize: 11.5, fontWeight: 800, fontFamily: 'inherit', letterSpacing: '0.02em' }}>
              {currentLang.short}
            </span>
          </TitleBarButton>
          {langOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 8,
              padding: 6,
              borderRadius: 14,
              background: MD3E_ALIAS.surface,
              border: '1px solid var(--shiin-outline-soft, rgba(255, 255, 255, 0.1))',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              boxShadow: '0 18px 40px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(20px)',
              zIndex: 100,
              minWidth: 110,
            }}>
              {LANGUAGES.map((lang) => {
                const isSelected = locale === lang.code
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      if (onSelectLocale) onSelectLocale(lang.code)
                      else if (onToggleLocale) onToggleLocale()
                      setLangOpen(false)
                    }}
                    style={{
                      height: 28,
                      padding: '0 10px',
                      borderRadius: 8,
                      border: 'none',
                      background: isSelected ? MD3E_ALIAS.primary : 'transparent',
                      color: isSelected ? MD3E_ALIAS.onPrimary : ALIAS.onSurfaceVariant,
                      fontWeight: 700,
                      fontSize: 11.5,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 120ms ease',
                    }}
                  >
                    <span>{lang.native}</span>
                    <span style={{ fontSize: 10, opacity: 0.7 }}>{lang.short}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* 窗口操作按钮（Windows / Linux 显示，macOS 由原生红绿灯接管） */}
        {!isMac ? (
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 6 }}>
            <WinControlButton onClick={onMinimize} title={isZh ? '最小化' : 'Minimize'}>
              <AppIcon name="minus" size={13} />
            </WinControlButton>
            <WinControlButton
              onClick={onToggleMaximize}
              title={maximized ? (isZh ? '还原' : 'Restore') : (isZh ? '最大化' : 'Maximize')}
            >
              <AppIcon name={maximized ? 'restore' : 'square'} size={12} />
            </WinControlButton>
            <WinControlButton onClick={onClose} title={isZh ? '关闭' : 'Close'} isClose>
              <AppIcon name="close" size={13} />
            </WinControlButton>
          </div>
        ) : (
          <div style={{ width: 8 }} />
        )}
      </div>
    </header>
  )
}
