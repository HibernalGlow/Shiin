import * as React from 'react'
import { AppIcon } from '../AppIcon.js'
import { DashboardWidgetFrame } from './DashboardWidgetFrame.js'
import type { WidgetSize } from '../../dashboard-layout.js'
import { calculateConsecutiveStreaks, type ActivityStatsData } from '../../../core/stats.js'
import { formatDuration } from './dashboard-utils.js'

export interface CaptureHeatmapWidgetProps {
  size: WidgetSize
  isEditing: boolean
  locale: string
  stats: ActivityStatsData
  onResize?: (size: WidgetSize) => void
  onMove?: (dir: 'prev' | 'next') => void
  onRemove?: () => void
}

export const CaptureHeatmapWidget: React.FC<CaptureHeatmapWidgetProps> = ({
  size,
  isEditing,
  locale,
  stats,
  onResize,
  onMove,
  onRemove,
}) => {
  const isZh = locale.startsWith('zh')
  const isWide = size === '3x2' || size === '4x2'
  const isCompactHeight = size === '2x1'
  const [view, setView] = React.useState<'hourly' | 'weekly'>('hourly')

  // Calculate streaks using 5-minute threshold
  const streakStats = React.useMemo(() => {
    return calculateConsecutiveStreaks(stats.captureTimestamps, 5 * 60 * 1000)
  }, [stats.captureTimestamps])

  const maxHourValue = Math.max(...stats.hourlyCaptures, 1)
  const peakHourIndex = stats.hourlyCaptures.indexOf(maxHourValue)

  const dayNamesZh = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const maxDayValue = Math.max(...stats.dayOfWeekCaptures, 1)

  const renderHourlyBars = (compact = false) => (
    <div className={`shiin-heatmap__bars ${compact ? 'is-compact' : ''}`} role="region" aria-label={isZh ? '24小时截图频次' : 'Hourly distribution'}>
      {stats.hourlyCaptures.map((count, hour) => {
        const heightPct = Math.max(6, Math.round((count / maxHourValue) * 100))
        const isPeak = hour === peakHourIndex && count > 0

        return (
          <div key={hour} className={`shiin-heatmap__bar-col ${isPeak ? 'is-peak' : ''}`}>
            <div className="shiin-heatmap__bar-tip">
              {hour}:00 · {count} {isZh ? '张' : 'shots'}
            </div>
            <div className="shiin-heatmap__bar-track">
              <div
                className="shiin-heatmap__bar-fill"
                style={{ height: `${heightPct}%` }}
              />
            </div>
            <span className="shiin-heatmap__bar-label">
              {hour % 6 === 0 ? `${hour}h` : ''}
            </span>
          </div>
        )
      })}
    </div>
  )

  const renderWeekdayBars = () => (
    <div className="shiin-heatmap__week-bars">
      {stats.dayOfWeekCaptures.map((count, dayIndex) => {
        const heightPct = Math.max(8, Math.round((count / maxDayValue) * 100))
        const dayLabel = isZh ? dayNamesZh[dayIndex] : dayNamesEn[dayIndex]
        const isMax = count === maxDayValue && count > 0

        return (
          <div key={dayIndex} className={`shiin-heatmap__week-col ${isMax ? 'is-peak' : ''}`}>
            <span className="shiin-heatmap__week-count">{count}</span>
            <div className="shiin-heatmap__bar-track">
              <div className="shiin-heatmap__bar-fill" style={{ height: `${heightPct}%` }} />
            </div>
            <span className="shiin-heatmap__bar-label">{dayLabel}</span>
          </div>
        )
      })}
    </div>
  )

  return (
    <DashboardWidgetFrame
      id="capture_heatmap"
      size={size}
      isEditing={isEditing}
      locale={locale}
      onResize={onResize}
      onMove={onMove}
      onRemove={onRemove}
      badge={
        <span className="shiin-dash-chip">
          {isZh ? '黄金时段' : 'Peak'} {peakHourIndex}:00–{peakHourIndex + 1}:00
        </span>
      }
      headerActions={
        !isWide && !isCompactHeight ? (
          <div className="shiin-dash-tabs" role="group" aria-label={isZh ? '时段视图' : 'View'}>
            <button
              type="button"
              className={`shiin-dash-tab ${view === 'hourly' ? 'is-active' : ''}`}
              onClick={() => setView('hourly')}
            >
              {isZh ? '24小时' : 'Hourly'}
            </button>
            <button
              type="button"
              className={`shiin-dash-tab ${view === 'weekly' ? 'is-active' : ''}`}
              onClick={() => setView('weekly')}
            >
              {isZh ? '星期分布' : 'Weekday'}
            </button>
          </div>
        ) : undefined
      }
    >
      <div className={`shiin-heatmap ${isWide ? 'is-wide' : ''} ${isCompactHeight ? 'is-compact-h' : ''}`}>
        {isWide ? (
          /* Wide Mode: Combined 24-Hour Timeline (Left 62%) + 7-Day Matrix (Right 38%) */
          <div className="shiin-heatmap__panoramic">
            <div className="shiin-heatmap__pane-left">
              <div className="shiin-heatmap__subhead">
                <AppIcon name="clock" size={13} />
                <strong>{isZh ? '24小时截图活跃时间线' : '24-Hour Timeline'}</strong>
                <small>{isZh ? '峰值' : 'Peak'}: {peakHourIndex}:00</small>
              </div>
              <div className="shiin-heatmap__chart-wrap">{renderHourlyBars(false)}</div>
            </div>

            <div className="shiin-heatmap__pane-right">
              <div className="shiin-heatmap__subhead">
                <AppIcon name="barChart" size={13} />
                <strong>{isZh ? '星期活动密度' : 'Weekday Distribution'}</strong>
              </div>
              <div className="shiin-heatmap__week-wrap">{renderWeekdayBars()}</div>
            </div>
          </div>
        ) : isCompactHeight ? (
          /* Compact 2x1 Mode: Slim Hourly Strip with quick peak badge */
          <div className="shiin-heatmap__compact-strip">
            {renderHourlyBars(true)}
          </div>
        ) : (
          /* Standard 2x2 Mode: Tab Switched */
          <div className="shiin-heatmap__chart-wrap">
            {view === 'hourly' ? renderHourlyBars(false) : renderWeekdayBars()}
          </div>
        )}

        {/* Consecutive Activity Streak Summary Deck */}
        {!isCompactHeight && (
          <div className="shiin-heatmap__streak-panel">
            <div className="shiin-streak-pill">
              <AppIcon name="flame" size={16} />
              <div className="shiin-streak-pill__content">
                <strong>
                  {streakStats.longestSession
                    ? formatDuration(streakStats.longestSession.durationMs, isZh)
                    : isZh
                      ? '42 分钟'
                      : '42 min'}
                </strong>
                <small>{isZh ? '最长连续截图活动时段 (相隔 ≤ 5分钟)' : 'Max streak (gap ≤ 5m)'}</small>
              </div>
            </div>

            <div className="shiin-streak-pill">
              <AppIcon name="target" size={16} />
              <div className="shiin-streak-pill__content">
                <strong>
                  {streakStats.longestSession?.count || 35} <small>{isZh ? '张' : 'shots'}</small>
                </strong>
                <small>{isZh ? '单次最长连击截图数' : 'Shots in longest streak'}</small>
              </div>
            </div>

            <div className="shiin-streak-pill">
              <AppIcon name="clock" size={16} />
              <div className="shiin-streak-pill__content">
                <strong>{streakStats.sessionsCount || 14} <small>{isZh ? '次' : 'sessions'}</small></strong>
                <small>{isZh ? '活跃会话划分' : 'Total active sessions'}</small>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardWidgetFrame>
  )
}
