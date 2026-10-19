import * as React from 'react'
import { AppIcon } from './AppIcon.js'
import { ALIAS, MD3E_ALIAS } from '../md3e.js'
import { LANGUAGES, getLanguage } from '../i18n.js'
import type { MacOSPermissionsStatus } from '../adapter/types.js'

export interface TitleBarProps {
  listening: boolean
  isDark: boolean
  onToggleTheme: () => void
  accent: string
  onSetAccent: (accent: string) => void
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

const ACCENT_COLORS = [
  { key: 'lime', color: '#B4F461', name: '青柠 (Lime)' },
  { key: 'violet', color: '#A996FF', name: '紫罗兰 (Violet)' },
  { key: 'cyan', color: '#6EE3F0', name: '青绿 (Cyan)' },
  { key: 'amber', color: '#FFC15E', name: '琥珀 (Amber)' },
  { key: 'rose', color: '#FF8CA0', name: '蔷薇 (Rose)' },
  { key: 'azure', color: '#7CB8FF', name: '蔚蓝 (Azure)' },
]

const UI_SCALES = [
  { value: 0.9, label: '90%' },
  { value: 1.0, label: '100%' },
  { value: 1.1, label: '110%' },
  { value: 1.25, label: '125%' },
]

interface TitleBarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

const TitleBarButton: React.FC<TitleBarButtonProps> = ({
  active,
  children,
  style,
  ...rest
}) => {
  const [hovered, setHovered] = React.useState(false)
  return (
    <button
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 30,
        height: 30,
        padding: 0,
        margin: 0,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        border: `1px solid ${active || hovered ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.08)'}`,
        background: active
          ? 'rgba(255, 255, 255, 0.14)'
          : hovered
          ? 'rgba(255, 255, 255, 0.09)'
          : 'rgba(255, 255, 255, 0.04)',
        color: active || hovered ? ALIAS.onSurface : ALIAS.onSurfaceVariant,
        outline: 'none',
        transition: 'all 160ms cubic-bezier(.22, 1.4, .36, 1)',
        transform: hovered ? 'translateY(-1px)' : 'none',
        userSelect: 'none',
        flexShrink: 0,
        boxSizing: 'border-box',
        ...style,
      }}
      {...rest}
    >
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
  isDark,
  onToggleTheme,
  accent,
  onSetAccent,
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
  const [accentOpen, setAccentOpen] = React.useState(false)
  const [scaleOpen, setScaleOpen] = React.useState(false)
  const [langOpen, setLangOpen] = React.useState(false)

  const accentWrapperRef = React.useRef<HTMLDivElement>(null)
  const scaleWrapperRef = React.useRef<HTMLDivElement>(null)
  const langWrapperRef = React.useRef<HTMLDivElement>(null)

  // 点击外部自动收起浮层
  React.useEffect(() => {
    if (!accentOpen && !scaleOpen && !langOpen) return

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (accentOpen && accentWrapperRef.current && !accentWrapperRef.current.contains(target)) {
        setAccentOpen(false)
      }
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
  }, [accentOpen, scaleOpen, langOpen])

  const currentColor = ACCENT_COLORS.find((c) => c.key === accent)?.color || '#b4f461'

  return (
    <header
      style={{
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 0 0 ${isMac ? '78px' : '14px'}`,
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        background: MD3E_ALIAS.surfaceLowest,
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
            title={hasUpdate ? (isZh ? '发现新版本，点击查看' : 'New version available') : (isZh ? '检查更新' : 'Check for updates')}
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '1.5px 6px',
              borderRadius: 999,
              background: hasUpdate ? 'rgba(59, 130, 246, 0.2)' : MD3E_ALIAS.surfaceHigh,
              color: hasUpdate ? '#60a5fa' : ALIAS.onSurfaceVariant,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              border: `1px solid ${hasUpdate ? 'rgba(96, 165, 250, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
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
                background: '#3b82f6',
                color: '#ffffff',
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
          border: `1px solid ${listening ? 'rgba(180, 244, 97, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
          color: listening ? MD3E_ALIAS.primary : ALIAS.onSurfaceVariant,
          background: listening ? 'rgba(180, 244, 97, 0.12)' : MD3E_ALIAS.surfaceHigh,
          backdropFilter: 'blur(12px)',
        }}>
          <i style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: listening ? MD3E_ALIAS.primary : 'rgba(255, 255, 255, 0.25)',
            boxShadow: listening ? '0 0 8px #b4f461' : 'none',
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
                  ? '⚠️ 存在未授权的核心权限（屏幕录制等），点击打开检查'
                  : '⚠️ Missing system permissions, click to inspect and grant'
                : isZh
                  ? '系统权限正常 (点击打开权限自检中心)'
                  : 'Permissions OK (click to view diagnostics)'
            }
            style={{
              position: 'relative',
              color:
                permissions?.isMac && !permissions?.allGranted
                  ? '#fb5f76'
                  : permissions?.isMac && permissions?.allGranted
                  ? '#4ade80'
                  : undefined,
              borderColor:
                permissions?.isMac && !permissions?.allGranted
                  ? 'rgba(251, 95, 118, 0.45)'
                  : undefined,
              background:
                permissions?.isMac && !permissions?.allGranted
                  ? 'rgba(251, 95, 118, 0.14)'
                  : undefined,
            }}
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
                  background: '#fb5f76',
                  boxShadow: '0 0 6px #fb5f76',
                }}
              />
            )}
          </TitleBarButton>
        )}

        {/* 深浅色切换 */}
        <TitleBarButton
          onClick={onToggleTheme}
          title={isZh ? '切换深浅色' : 'Toggle theme'}
        >
          <AppIcon name={isDark ? 'sun' : 'moon'} size={15} />
        </TitleBarButton>

        {/* 主色调选择 */}
        <div style={{ position: 'relative' }} ref={accentWrapperRef}>
          <TitleBarButton
            active={accentOpen}
            onClick={() => setAccentOpen((prev) => !prev)}
            title={isZh ? '切换主题色' : 'Accent color'}
          >
            <span style={{
              display: 'inline-block',
              width: 13,
              height: 13,
              borderRadius: '50%',
              background: currentColor,
              boxShadow: `0 0 6px ${currentColor}99`,
              flexShrink: 0,
            }} />
          </TitleBarButton>
          {accentOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 8,
              padding: 10,
              borderRadius: 16,
              background: MD3E_ALIAS.surfaceHigh,
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
              boxShadow: '0 16px 36px rgba(0, 0, 0, 0.65), 0 2px 8px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(20px)',
              zIndex: 100,
            }}>
              {ACCENT_COLORS.map((c) => {
                const isSelected = accent === c.key
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => {
                      onSetAccent(c.key)
                      setAccentOpen(false)
                    }}
                    title={c.name}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: c.color,
                      border: 'none',
                      outline: isSelected ? '2px solid #ffffff' : 'none',
                      outlineOffset: 2,
                      cursor: 'pointer',
                      boxShadow: isSelected ? `0 0 10px ${c.color}` : 'none',
                      transition: 'transform 150ms ease',
                      padding: 0,
                    }}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* 缩放选择 */}
        <div style={{ position: 'relative' }} ref={scaleWrapperRef}>
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
              background: MD3E_ALIAS.surfaceHigh,
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              boxShadow: '0 16px 36px rgba(0, 0, 0, 0.65), 0 2px 8px rgba(0, 0, 0, 0.4)',
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
        <div style={{ position: 'relative' }} ref={langWrapperRef}>
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
              background: MD3E_ALIAS.surfaceHigh,
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              boxShadow: '0 16px 36px rgba(0, 0, 0, 0.65), 0 2px 8px rgba(0, 0, 0, 0.4)',
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
