import * as React from 'react'
import { AppIcon } from './AppIcon.js'
import {
  type ScreenshotConfig,
  type CaptureDisplayInfo,
  type CaptureWindowInfo,
  ScreenShotWayEnum,
  CaptureTargetTypeEnum,
} from '../../core/types.js'

export interface SourceCardProps {
  config: ScreenshotConfig
  onChange: (patch: Partial<ScreenshotConfig>) => void
  screens: CaptureDisplayInfo[]
  windows: CaptureWindowInfo[]
  onRefreshWindows: () => void
  locale?: 'zh' | 'en'
}

export const SourceCard: React.FC<SourceCardProps> = ({
  config,
  onChange,
  screens,
  windows,
  onRefreshWindows,
  locale = 'zh',
}) => {
  const isZh = locale === 'zh'

  return (
    <div className="shiin-card" style={{ gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ padding: 4, borderRadius: 6, background: 'var(--surface-2)' }}>
            <AppIcon name="camera" size={14} />
          </div>
          <span style={{ fontWeight: 600, fontSize: 13 }}>{isZh ? '截图来源' : 'Capture Source'}</span>
        </div>
        <span style={{
          fontSize: 10,
          padding: '2px 8px',
          borderRadius: 99,
          background: 'var(--surface-2)',
          color: 'var(--ink-2)',
        }}>
          {config.screenshotWay}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}>
            <AppIcon name="sliders" size={13} />
            {isZh ? '捕获引擎' : 'Capture Engine'}
          </span>
          <select
            className="shiin-select"
            value={config.screenshotWay}
            onChange={(e) => onChange({ screenshotWay: e.target.value as ScreenShotWayEnum })}
          >
            <option value={ScreenShotWayEnum.DesktopCapturer}>{isZh ? '桌面/窗口捕获' : 'Desktop / Window'}</option>
            <option value={ScreenShotWayEnum.OBS}>OBS Studio</option>
          </select>
        </div>

        {config.screenshotWay === ScreenShotWayEnum.DesktopCapturer && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}>
                <AppIcon name="target" size={13} />
                {isZh ? '捕获目标' : 'Capture Target'}
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  className="shiin-btn"
                  data-variant={config.captureTargetType === CaptureTargetTypeEnum.Screen ? 'filled' : 'ghost'}
                  style={{ height: 26, padding: '0 10px', fontSize: 11 }}
                  onClick={() => onChange({ captureTargetType: CaptureTargetTypeEnum.Screen })}
                >
                  {isZh ? '全屏' : 'Screen'}
                </button>
                <button
                  className="shiin-btn"
                  data-variant={config.captureTargetType === CaptureTargetTypeEnum.Window ? 'filled' : 'ghost'}
                  style={{ height: 26, padding: '0 10px', fontSize: 11 }}
                  onClick={() => onChange({ captureTargetType: CaptureTargetTypeEnum.Window })}
                >
                  {isZh ? '独立窗口' : 'Window'}
                </button>
              </div>
            </div>

            {config.captureTargetType === CaptureTargetTypeEnum.Screen && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}>
                  <AppIcon name="monitor" size={13} />
                  {isZh ? '选择显示器' : 'Select Display'}
                </span>
                <select
                  className="shiin-select"
                  style={{ maxWidth: 200 }}
                  value={String(config.screenSourceId || '')}
                  onChange={(e) => onChange({ screenSourceId: e.target.value })}
                >
                  {screens.map((s, idx) => (
                    <option key={String(s.id)} value={String(s.id)}>
                      {s.name || `${isZh ? '屏幕' : 'Display'} #${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {config.captureTargetType === CaptureTargetTypeEnum.Window && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)', flexShrink: 0 }}>
                  <AppIcon name="appWindow" size={13} />
                  {isZh ? '目标窗口' : 'Target Window'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'flex-end' }}>
                  <select
                    className="shiin-select"
                    style={{ maxWidth: 200, textOverflow: 'ellipsis' }}
                    value={String(config.windowSourceId || '')}
                    onChange={(e) => onChange({ windowSourceId: e.target.value })}
                  >
                    {windows.map((w) => (
                      <option key={String(w.id)} value={String(w.id)}>
                        {w.ownerName ? `${w.ownerName} - ` : ''}{w.title}
                      </option>
                    ))}
                  </select>
                  <button
                    className="shiin-btn"
                    data-variant="ghost"
                    onClick={onRefreshWindows}
                    style={{ height: 30, padding: '0 8px' }}
                    title={isZh ? '刷新窗口列表' : 'Refresh windows'}
                  >
                    <AppIcon name="refresh" size={13} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {config.screenshotWay === ScreenShotWayEnum.OBS && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            padding: 8,
            border: '1px dashed var(--line-strong)',
            borderRadius: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--ink-2)' }}>OBS WebSocket IP:</span>
              <input
                className="shiin-input"
                style={{ width: 120 }}
                value={config.obsIp || '127.0.0.1'}
                onChange={(e) => onChange({ obsIp: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--ink-2)' }}>Port:</span>
              <input
                className="shiin-input"
                type="number"
                style={{ width: 80 }}
                value={config.obsPort || 4455}
                onChange={(e) => onChange({ obsPort: Number(e.target.value) || 4455 })}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--ink-2)' }}>{isZh ? '长按保存回放缓存' : 'Save Replay on Long-press'}:</span>
              <input
                type="checkbox"
                checked={config.obsReplayBufferOnLongPress}
                onChange={(e) => onChange({ obsReplayBufferOnLongPress: e.target.checked })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
