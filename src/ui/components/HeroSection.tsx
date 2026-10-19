import * as React from 'react'
import { AppIcon } from './AppIcon.js'
import type { ScreenshotConfig } from '../../core/types.js'

export interface HeroSectionProps {
  listening: boolean
  config: ScreenshotConfig
  deviceLabel: string
  onStart: () => void
  onStop: () => void
  onOpenFolder: () => void
  onCapture?: () => void
  locale?: 'zh' | 'en'
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  listening,
  config,
  deviceLabel,
  onStart,
  onStop,
  onOpenFolder,
  onCapture,
  locale = 'zh',
}) => {
  const isZh = locale === 'zh'

  const comboKeyLabel = (key: string) => {
    if (key.startsWith('Button')) {
      const idx = key.replace('Button', '')
      return `B${idx}`
    }
    if (key.startsWith('Axis')) {
      return key.replace('Axis', isZh ? '轴' : 'Axis ').replace('+', '＋').replace('-', '－')
    }
    return key
  }

  return (
    <section className={`hero ${listening ? 'live' : ''}`} style={{
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 16,
      border: `1px solid var(--line-strong, rgba(255, 255, 255, 0.14))`,
      background: 'var(--surface, rgba(255, 255, 255, 0.03))',
      padding: '14px 18px 10px',
      marginBottom: 12,
      transition: 'all 0.25s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: listening ? 'var(--accent, #b4f461)' : 'var(--ink-3, #6a7280)',
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: listening ? 'var(--accent, #b4f461)' : 'var(--ink-3, #6a7280)',
              boxShadow: listening ? '0 0 0 4px var(--accent-soft, rgba(180, 244, 97, 0.2))' : 'none',
            }} />
            {listening ? (isZh ? '正在监听手柄' : 'LISTENING') : (isZh ? '就绪' : 'READY')}
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, margin: '6px 0 0', lineHeight: 1.25 }}>
            {listening ? (isZh ? '监听中' : 'Listening Active') : (isZh ? '准备就绪' : 'Ready to Capture')}
          </h2>
          <p style={{ fontSize: 11.5, color: 'var(--ink-2, #98a1b0)', margin: '4px 0 0' }}>
            {deviceLabel} · {isZh ? '按下手柄组合键即可即时截图' : 'Press gamepad combo to trigger capture'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 10, flexWrap: 'wrap' }}>
            {config.comboKeys.map((key, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ color: 'var(--ink-3)', fontSize: 11 }}>+</span>}
                <span style={{
                  height: 28,
                  minWidth: 36,
                  padding: '0 8px',
                  borderRadius: 6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: listening ? 'var(--accent)' : 'var(--ink)',
                  background: listening ? 'var(--accent-soft)' : 'var(--surface-2)',
                  border: `1px solid ${listening ? 'var(--accent-line)' : 'var(--line-strong)'}`,
                }}>
                  {comboKeyLabel(key)}
                </span>
              </React.Fragment>
            ))}
            {config.comboKeys.length === 0 && (
              <span style={{
                fontSize: 11,
                color: 'var(--ink-3)',
                padding: '4px 8px',
                border: '1px dashed var(--line-strong)',
                borderRadius: 6,
              }}>
                {isZh ? '未配置组合键' : 'No combo keys'}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <button
            className="shiin-btn"
            data-variant="ghost"
            onClick={onOpenFolder}
            style={{ height: 38 }}
            title={isZh ? '打开截图保存目录' : 'Open screenshot folder'}
          >
            <AppIcon name="folder" size={15} />
            {isZh ? '截图目录' : 'Folder'}
          </button>

          {onCapture && (
            <button
              className="shiin-btn"
              data-variant="tonal"
              onClick={onCapture}
              style={{ height: 38 }}
              title={isZh ? '立即截取当前画面' : 'Capture current screen'}
            >
              <AppIcon name="camera" size={15} />
              {isZh ? '立即截屏' : 'Capture'}
            </button>
          )}

          {!listening ? (
            <button
              className="shiin-btn"
              data-variant="filled"
              onClick={onStart}
              style={{ height: 38, padding: '0 20px', fontWeight: 650 }}
            >
              <AppIcon name="play" size={15} />
              {isZh ? '开始监听' : 'Start'}
            </button>
          ) : (
            <button
              className="shiin-btn"
              data-variant="danger"
              onClick={onStop}
              style={{ height: 38, padding: '0 20px', fontWeight: 650 }}
            >
              <AppIcon name="stop" size={15} />
              {isZh ? '停止监听' : 'Stop'}
            </button>
          )}
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        marginTop: 10,
        paddingTop: 8,
        borderTop: '1px solid var(--line, rgba(255, 255, 255, 0.08))',
        fontSize: 10.5,
        color: 'var(--ink-3)',
      }}>
        <span>{isZh ? '截图来源: ' : 'Source: '}<b>{config.screenshotWay}</b></span>
        <span style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {isZh ? '路径: ' : 'Path: '}<b>{config.path || (isZh ? '默认目录' : 'Default')}</b>
        </span>
        <span>{isZh ? '保存模式: ' : 'Mode: '}<b>{config.screenShotSaveWay}</b></span>
        <span>{isZh ? '格式: ' : 'Format: '}<b>{config.imageFormat.toUpperCase()}</b></span>
      </div>
    </section>
  )
}
