import * as React from 'react'
import { AppIcon } from './AppIcon.js'
import {
  type ScreenshotConfig,
  ScreenShotSaveWayEnum,
} from '../../core/types.js'

export interface SaveCardProps {
  config: ScreenshotConfig
  onChange: (patch: Partial<ScreenshotConfig>) => void
  onSelectFolder: () => void
  locale?: 'zh' | 'en'
}

const AVAILABLE_FIELDS = [
  'activeWinTitle',
  'activeWinOwner',
  'timestamp',
  'datetime',
  'YYYY',
  'MM',
  'DD',
  'hh',
  'mm',
  'ss',
  'cs',
  'ms',
]

export const SaveCard: React.FC<SaveCardProps> = ({
  config,
  onChange,
  onSelectFolder,
  locale = 'zh',
}) => {
  const isZh = locale === 'zh'
  const inputRef = React.useRef<HTMLInputElement>(null)

  const insertField = (field: string) => {
    const token = `%${field}%`
    const current = config.fileNameTemplate || ''
    const input = inputRef.current
    if (!input) {
      onChange({ fileNameTemplate: current + token })
      return
    }
    const start = input.selectionStart ?? current.length
    const end = input.selectionEnd ?? current.length
    const next = current.slice(0, start) + token + current.slice(end)
    onChange({ fileNameTemplate: next })
    setTimeout(() => {
      input.focus()
      input.setSelectionRange(start + token.length, start + token.length)
    }, 0)
  }

  return (
    <div className="shiin-card" style={{ gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ padding: 4, borderRadius: 6, background: 'var(--surface-2)' }}>
            <AppIcon name="save" size={14} />
          </div>
          <span style={{ fontWeight: 600, fontSize: 13 }}>{isZh ? '保存设置' : 'Save Settings'}</span>
        </div>
        <span style={{
          fontSize: 10,
          padding: '2px 8px',
          borderRadius: 99,
          background: 'var(--surface-2)',
          color: 'var(--ink-2)',
        }}>
          {config.imageFormat.toUpperCase()}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
        {/* 保存模式 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}>
            <AppIcon name="list" size={13} />
            {isZh ? '保存目标' : 'Destination'}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              className="shiin-btn"
              data-variant={config.screenShotSaveWay === ScreenShotSaveWayEnum.FileOnly ? 'filled' : 'ghost'}
              style={{ height: 26, padding: '0 8px', fontSize: 11 }}
              onClick={() => onChange({ screenShotSaveWay: ScreenShotSaveWayEnum.FileOnly })}
            >
              {isZh ? '仅文件' : 'File'}
            </button>
            <button
              className="shiin-btn"
              data-variant={config.screenShotSaveWay === ScreenShotSaveWayEnum.CilpboardOnly ? 'filled' : 'ghost'}
              style={{ height: 26, padding: '0 8px', fontSize: 11 }}
              onClick={() => onChange({ screenShotSaveWay: ScreenShotSaveWayEnum.CilpboardOnly })}
            >
              {isZh ? '仅剪贴板' : 'Clipboard'}
            </button>
            <button
              className="shiin-btn"
              data-variant={config.screenShotSaveWay === ScreenShotSaveWayEnum.FileAndCilpboard ? 'filled' : 'ghost'}
              style={{ height: 26, padding: '0 8px', fontSize: 11 }}
              onClick={() => onChange({ screenShotSaveWay: ScreenShotSaveWayEnum.FileAndCilpboard })}
            >
              {isZh ? '两者都要' : 'Both'}
            </button>
          </div>
        </div>

        {config.screenShotSaveWay !== ScreenShotSaveWayEnum.CilpboardOnly && (
          <>
            {/* 保存目录 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)', flexShrink: 0 }}>
                <AppIcon name="folder" size={13} />
                {isZh ? '保存目录' : 'Directory'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'flex-end' }}>
                <input
                  className="shiin-input"
                  style={{ flex: 1, maxWidth: 220 }}
                  placeholder={isZh ? '选择文件夹…' : 'Select folder…'}
                  value={config.path || ''}
                  onChange={(e) => onChange({ path: e.target.value })}
                />
                <button
                  className="shiin-btn"
                  data-variant="tonal"
                  onClick={onSelectFolder}
                  style={{ height: 30, padding: '0 10px' }}
                >
                  {isZh ? '浏览' : 'Browse'}
                </button>
              </div>
            </div>

            {/* 文件名模板与格式 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)', flexShrink: 0 }}>
                <AppIcon name="fileText" size={13} />
                {isZh ? '文件名模板' : 'Filename'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' }}>
                <input
                  ref={inputRef}
                  className="shiin-input"
                  style={{ fontFamily: 'var(--font-mono)', flex: 1, maxWidth: 200 }}
                  value={config.fileNameTemplate || ''}
                  onChange={(e) => onChange({ fileNameTemplate: e.target.value })}
                />
                <div style={{ display: 'flex', gap: 2 }}>
                  <button
                    className="shiin-btn"
                    data-variant={config.imageFormat === 'jpg' ? 'filled' : 'ghost'}
                    style={{ height: 26, padding: '0 6px', fontSize: 10 }}
                    onClick={() => onChange({ imageFormat: 'jpg' })}
                  >
                    JPG
                  </button>
                  <button
                    className="shiin-btn"
                    data-variant={config.imageFormat === 'png' ? 'filled' : 'ghost'}
                    style={{ height: 26, padding: '0 6px', fontSize: 10 }}
                    onClick={() => onChange({ imageFormat: 'png' })}
                  >
                    PNG
                  </button>
                </div>
              </div>
            </div>

            {/* 快速插入宏字段芯片 */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              paddingTop: 4,
              borderTop: '1px dashed var(--line, rgba(255, 255, 255, 0.08))',
            }}>
              {AVAILABLE_FIELDS.map((f) => (
                <button
                  key={f}
                  className="shiin-btn"
                  data-variant="ghost"
                  style={{ height: 22, padding: '0 6px', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                  onClick={() => insertField(f)}
                  title={isZh ? `点击插入 %${f}%` : `Insert %${f}%`}
                >
                  %{f}%
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
