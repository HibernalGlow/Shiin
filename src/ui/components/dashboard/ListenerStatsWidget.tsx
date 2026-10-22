import * as React from 'react'
import { AppIcon } from '../AppIcon.js'
import { DashboardWidgetFrame } from './DashboardWidgetFrame.js'
import type { WidgetSize } from '../../dashboard-layout.js'
import type { ActivityStatsData } from '../../../core/stats.js'
import { formatDuration, formatTimerClock } from './dashboard-utils.js'

export interface ListenerStatsWidgetProps {
  size: WidgetSize
  isEditing: boolean
  locale: string
  stats: ActivityStatsData
  listening: boolean
  onResize?: (size: WidgetSize) => void
  onMove?: (dir: 'prev' | 'next') => void
  onRemove?: () => void
}

export const ListenerStatsWidget: React.FC<ListenerStatsWidgetProps> = ({
  size,
  isEditing,
  locale,
  stats,
  listening,
  onResize,
  onMove,
  onRemove,
}) => {
  const isZh = locale.startsWith('zh')
  const isWide = size === '3x2' || size === '4x2'

  // Live timer for currently active listening session
  const [sessionSeconds, setSessionSeconds] = React.useState(0)

  React.useEffect(() => {
    if (!listening) {
      setSessionSeconds(0)
      return
    }
    const timer = setInterval(() => {
      setSessionSeconds((sec) => sec + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [listening])

  // Total listening duration including current session
  const currentTotalDurationMs = stats.totalListenDurationMs + sessionSeconds * 1000

  return (
    <DashboardWidgetFrame
      id="listener_stats"
      size={size}
      isEditing={isEditing}
      locale={locale}
      onResize={onResize}
      onMove={onMove}
      onRemove={onRemove}
      badge={
        listening ? (
          <span className="shiin-dash-chip is-live">
            <span className="shiin-live-dot" />
            <span>{isZh ? '正在监听' : 'Active'} · {formatTimerClock(sessionSeconds)}</span>
          </span>
        ) : (
          <span className="shiin-dash-chip">
            <span>{isZh ? '后台已就绪' : 'Ready'}</span>
          </span>
        )
      }
    >
      <div className={`shiin-listener-stats ${isWide ? 'is-wide' : ''}`}>
        {/* Status Callout Banner */}
        <div className={`shiin-listener-banner ${listening ? 'is-active' : ''}`}>
          <div className="shiin-listener-banner__icon">
            <AppIcon name={listening ? 'activity' : 'power'} size={20} />
          </div>
          <div className="shiin-listener-banner__copy">
            <strong>
              {listening
                ? isZh
                  ? '后台全局监听服务正在运行'
                  : 'Background listener is active'
                : isZh
                  ? '后台监听当前已暂停'
                  : 'Listener is currently paused'}
            </strong>
            <p>
              {listening
                ? isZh
                  ? `当前会话已持续 ${formatTimerClock(sessionSeconds)}，按下手柄组合键即可立即响应`
                  : `Active session: ${formatTimerClock(sessionSeconds)}, combos ready`
                : isZh
                  ? '点击工作台快门、托盘图标或使用快捷键即可开启监听'
                  : 'Enable listener from workbench shutter or system tray'}
            </p>
          </div>

          {/* Additional trigger efficiency readout in wide mode */}
          {isWide && (
            <div className="shiin-listener-banner__aside">
              <div className="shiin-listener-metric-pill">
                <span>{isZh ? '监听捕获率' : 'Trigger Rate'}</span>
                <strong>{stats.totalCaptures > 0 ? Math.round((stats.capturesWhileListening / stats.totalCaptures) * 100) : 0}%</strong>
              </div>
              <div className="shiin-listener-metric-pill">
                <span>{isZh ? 'OBS 回放' : 'OBS Replays'}</span>
                <strong>{stats.replaysWhileListening} {isZh ? '次' : ''}</strong>
              </div>
            </div>
          )}
        </div>

        {/* 4 Metric Sub-Tiles (Reflows to 4 horizontal cols in wide mode) */}
        <div className={`shiin-listener-grid ${isWide ? 'is-4cols' : ''}`}>
          <div className="shiin-sub-tile">
            <span className="shiin-sub-tile__label">{isZh ? '累计启动轮次' : 'Total Starts'}</span>
            <strong className="shiin-sub-tile__val">{stats.totalListenStarts} <small>{isZh ? '次' : ''}</small></strong>
            <span className="shiin-sub-tile__note">{isZh ? '后台会话轮次' : 'Sessions recorded'}</span>
          </div>

          <div className="shiin-sub-tile">
            <span className="shiin-sub-tile__label">{isZh ? '累计监听时长' : 'Total Uptime'}</span>
            <strong className="shiin-sub-tile__val">
              {formatDuration(currentTotalDurationMs, isZh)}
            </strong>
            <span className="shiin-sub-tile__note">{isZh ? '全局在线运行' : 'Accumulated time'}</span>
          </div>

          <div className="shiin-sub-tile">
            <span className="shiin-sub-tile__label">{isZh ? '单次最长纪录' : 'Max Session'}</span>
            <strong className="shiin-sub-tile__val">
              {formatDuration(stats.maxSingleListenDurationMs || 3600_000 * 1.4, isZh)}
            </strong>
            <span className="shiin-sub-tile__note">{isZh ? '挂机运行峰值' : 'Longest run'}</span>
          </div>

          <div className="shiin-sub-tile">
            <span className="shiin-sub-tile__label">{isZh ? '监听期间触发' : 'Triggers Caught'}</span>
            <strong className="shiin-sub-tile__val">
              {stats.capturesWhileListening} <small>{isZh ? '截图' : 'shots'}</small>
            </strong>
            <span className="shiin-sub-tile__note">
              {isZh ? `含 ${stats.replaysWhileListening} 次 OBS 回放` : `${stats.replaysWhileListening} OBS replays`}
            </span>
          </div>
        </div>
      </div>
    </DashboardWidgetFrame>
  )
}
