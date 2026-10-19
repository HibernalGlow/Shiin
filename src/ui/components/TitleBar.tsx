import * as React from 'react'
import { AppIcon } from './AppIcon.js'

export interface TitleBarProps {
  listening: boolean
  isDark: boolean
  onToggleTheme: () => void
  accent: string
  onSetAccent: (accent: string) => void
  uiScale: number
  onSetUiScale: (scale: number) => void
  locale: 'zh' | 'en'
  onToggleLocale: () => void
  maximized: boolean
  onMinimize: () => void
  onToggleMaximize: () => void
  onClose: () => void
  version?: string
  isMac?: boolean
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

export const TitleBar: React.FC<TitleBarProps> = ({
  listening,
  isDark,
  onToggleTheme,
  accent,
  onSetAccent,
  uiScale,
  onSetUiScale,
  locale,
  onToggleLocale,
  maximized,
  onMinimize,
  onToggleMaximize,
  onClose,
  version = '2.0.0',
  isMac = false,
}) => {
  const isZh = locale === 'zh'
  const [accentOpen, setAccentOpen] = React.useState(false)
  const [scaleOpen, setScaleOpen] = React.useState(false)

  return (
    <header
      style={{
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 0 0 ${isMac ? '78px' : '14px'}`,
        borderBottom: '1px solid var(--line, rgba(255, 255, 255, 0.1))',
        background: 'var(--bar, rgba(10, 11, 15, 0.8))',
        userSelect: 'none',
        WebkitAppRegion: 'drag' as any,
        position: 'relative',
        zIndex: 50,
      } as React.CSSProperties}
    >
      {/* 品牌 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.02em' }}>
            Shiin
          </span>
          <span style={{
            fontSize: 9.5,
            padding: '1px 5px',
            borderRadius: 4,
            background: 'var(--surface-2)',
            color: 'var(--ink-2)',
            fontFamily: 'var(--font-mono)',
          }}>
            v{version}
          </span>
        </div>
      </div>

      {/* 居中状态药丸 */}
      <div style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
      }}>
        <span style={{
          height: 24,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '0 10px',
          borderRadius: 99,
          fontSize: 11,
          border: `1px solid ${listening ? 'var(--accent-line, #b4f461)' : 'var(--line-strong)'}`,
          color: listening ? 'var(--accent, #b4f461)' : 'var(--ink-2)',
          background: listening ? 'var(--accent-soft, rgba(180, 244, 97, 0.15))' : 'var(--surface-2)',
        }}>
          <i style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: listening ? 'var(--accent, #b4f461)' : 'var(--ink-3)',
          }} />
          {listening ? (isZh ? '正在监听' : 'Listening') : (isZh ? '闲置' : 'Idle')}
        </span>
      </div>

      {/* 右侧控制 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, WebkitAppRegion: 'no-drag' as any } as React.CSSProperties}>
        {/* 深浅色切换 */}
        <button
          className="shiin-btn"
          data-variant="ghost"
          style={{ width: 28, height: 28, padding: 0 }}
          onClick={onToggleTheme}
          title={isZh ? '切换深浅色' : 'Toggle theme'}
        >
          <AppIcon name={isDark ? 'sun' : 'moon'} size={14} />
        </button>

        {/* 主色调选择 */}
        <div style={{ position: 'relative' }}>
          <button
            className="shiin-btn"
            data-variant="ghost"
            style={{ width: 28, height: 28, padding: 0 }}
            onClick={() => setAccentOpen(!accentOpen)}
            title={isZh ? '切换主题色' : 'Accent color'}
          >
            <span style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: ACCENT_COLORS.find((c) => c.key === accent)?.color || '#b4f461',
            }} />
          </button>
          {accentOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 6,
              padding: 8,
              borderRadius: 8,
              background: 'var(--surface-flat, #16181f)',
              border: '1px solid var(--line-strong)',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 6,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              zIndex: 100,
            }}>
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.key}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: c.color,
                    border: accent === c.key ? '2px solid #fff' : '1px solid rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    onSetAccent(c.key)
                    setAccentOpen(false)
                  }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* 缩放选择 */}
        <div style={{ position: 'relative' }}>
          <button
            className="shiin-btn"
            data-variant="ghost"
            style={{ width: 28, height: 28, padding: 0 }}
            onClick={() => setScaleOpen(!scaleOpen)}
            title={isZh ? '界面缩放' : 'Scale'}
          >
            <AppIcon name="textSize" size={14} />
          </button>
          {scaleOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 6,
              padding: 4,
              borderRadius: 8,
              background: 'var(--surface-flat, #16181f)',
              border: '1px solid var(--line-strong)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              zIndex: 100,
            }}>
              {UI_SCALES.map((s) => (
                <button
                  key={s.value}
                  className="shiin-btn"
                  data-variant={uiScale === s.value ? 'filled' : 'ghost'}
                  style={{ height: 24, padding: '0 10px', fontSize: 11 }}
                  onClick={() => {
                    onSetUiScale(s.value)
                    setScaleOpen(false)
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 语言切换 */}
        <button
          className="shiin-btn"
          data-variant="ghost"
          style={{ width: 28, height: 28, padding: 0, fontSize: 11, fontWeight: 700 }}
          onClick={onToggleLocale}
          title={isZh ? 'Switch to English' : '切换为简体中文'}
        >
          {isZh ? '中' : 'EN'}
        </button>

        {/* 窗口操作按钮（Windows / Linux 显示，macOS 由原生红绿灯接管） */}
        {!isMac ? (
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 4 }}>
            <button
              className="shiin-btn"
              data-variant="ghost"
              style={{ width: 36, height: 44, borderRadius: 0, border: 'none' }}
              onClick={onMinimize}
              title={isZh ? '最小化' : 'Minimize'}
            >
              <AppIcon name="minus" size={13} />
            </button>
            <button
              className="shiin-btn"
              data-variant="ghost"
              style={{ width: 36, height: 44, borderRadius: 0, border: 'none' }}
              onClick={onToggleMaximize}
              title={maximized ? (isZh ? '还原' : 'Restore') : (isZh ? '最大化' : 'Maximize')}
            >
              <AppIcon name={maximized ? 'restore' : 'square'} size={12} />
            </button>
            <button
              className="shiin-btn"
              data-variant="ghost"
              style={{ width: 40, height: 44, borderRadius: 0, border: 'none', color: '#ff6b6b' }}
              onClick={onClose}
              title={isZh ? '关闭' : 'Close'}
            >
              <AppIcon name="close" size={13} />
            </button>
          </div>
        ) : (
          <div style={{ width: 8 }} />
        )}
      </div>
    </header>
  )
}
