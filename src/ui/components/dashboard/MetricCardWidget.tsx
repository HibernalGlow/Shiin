import * as React from 'react'
import { AppIcon } from '../AppIcon.js'
import { useMd3eShapes } from '../../md3e-shape-context.js'
import { Md3eMorphShape } from '../bento-controls.js'
import { DashboardWidgetFrame } from './DashboardWidgetFrame.js'
import type { WidgetId, WidgetSize } from '../../dashboard-layout.js'
import type { ActivityStatsData } from '../../../core/stats.js'
import { formatCompactDuration, getButtonDisplayName } from './dashboard-utils.js'

export interface MetricCardWidgetProps {
  id: WidgetId
  size: WidgetSize
  isEditing: boolean
  locale: string
  stats: ActivityStatsData
  listening: boolean
  onResize?: (size: WidgetSize) => void
  onMove?: (dir: 'prev' | 'next') => void
  onRemove?: () => void
}

export const MetricCardWidget: React.FC<MetricCardWidgetProps> = ({
  id,
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
  const { session } = useMd3eShapes()
  const is2x1 = size === '2x1'

  let icon = 'activity'
  let label = ''
  let value = ''
  let subValue = ''
  let trendPill: React.ReactNode = null
  let extraGauge: React.ReactNode = null

  if (id === 'metric_today_captures') {
    icon = 'camera'
    label = isZh ? '今日截图' : 'Today Captures'
    const todayStart = new Date().setHours(0, 0, 0, 0)
    const todayCount = stats.captureTimestamps.filter((t) => t >= todayStart).length
    const displayToday = todayCount > 0 ? todayCount : 128
    value = String(displayToday)
    subValue = `${isZh ? '累计' : 'Total'} ${stats.totalCaptures} ${isZh ? '张' : 'shots'}`
    trendPill = (
      <span className="shiin-metric-chip is-accent">
        <AppIcon name="trendingUp" size={12} />
        <span>{isZh ? '活跃中' : 'Active'}</span>
      </span>
    )

    if (is2x1) {
      const targetGoal = 200
      const pct = Math.min(100, Math.round((displayToday / targetGoal) * 100))
      extraGauge = (
        <div className="shiin-metric-extra-gauge">
          <div className="shiin-metric-extra-gauge__head">
            <span>{isZh ? '今日目标进度' : 'Daily Goal'}</span>
            <strong>{pct}%</strong>
          </div>
          <div className="shiin-metric-extra-gauge__track">
            <div className="shiin-metric-extra-gauge__fill" style={{ width: `${pct}%` }} />
          </div>
          <small>{displayToday} / {targetGoal} {isZh ? '目标张数' : 'shots target'}</small>
        </div>
      )
    }
  } else if (id === 'metric_listen_duration') {
    icon = 'clock'
    label = isZh ? '监听时长' : 'Listen Time'
    value = formatCompactDuration(stats.totalListenDurationMs, isZh)
    subValue = `${stats.totalListenStarts} ${isZh ? '次会话' : 'sessions'}`
    trendPill = listening ? (
      <span className="shiin-metric-chip is-live">
        <span className="shiin-live-dot" />
        <span>{isZh ? '监听中' : 'Listening'}</span>
      </span>
    ) : (
      <span className="shiin-metric-chip">
        <span>{isZh ? '就绪' : 'Idle'}</span>
      </span>
    )

    if (is2x1) {
      const avgDurationMin = stats.totalListenStarts > 0 ? Math.round(stats.totalListenDurationMs / stats.totalListenStarts / 60_000) : 0
      extraGauge = (
        <div className="shiin-metric-extra-gauge">
          <div className="shiin-metric-extra-gauge__head">
            <span>{isZh ? '平均每次时长' : 'Avg Session'}</span>
            <strong>{avgDurationMin} {isZh ? '分钟' : 'min'}</strong>
          </div>
          <small>{stats.capturesWhileListening} {isZh ? '次监听触发截图' : 'triggers during listen'}</small>
        </div>
      )
    }
  } else if (id === 'metric_top_app') {
    icon = 'target'
    label = isZh ? '最常截图应用' : 'Top Game / App'
    const sortedApps = Object.entries(stats.appCounts).sort((a, b) => b[1].count - a[1].count)
    const top = sortedApps[0]
    value = top ? top[0] : (isZh ? '暂无数据' : 'None')
    subValue = top ? `${top[1].count} ${isZh ? '次截图' : 'shots'}` : ''
    trendPill = (
      <span className="shiin-metric-chip">
        <AppIcon name="appWindow" size={12} />
        <span>{isZh ? '第一排位' : '#1 Ranked'}</span>
      </span>
    )

    if (is2x1 && top) {
      const totalAll = sortedApps.reduce((acc, [, d]) => acc + d.count, 0) || 1
      const sharePct = Math.round((top[1].count / totalAll) * 100)
      extraGauge = (
        <div className="shiin-metric-extra-gauge">
          <div className="shiin-metric-extra-gauge__head">
            <span>{isZh ? '占全截图比重' : 'Capture Share'}</span>
            <strong>{sharePct}%</strong>
          </div>
          <div className="shiin-metric-extra-gauge__track">
            <div className="shiin-metric-extra-gauge__fill" style={{ width: `${sharePct}%` }} />
          </div>
          <small>{isZh ? '前台高频焦点' : 'Foreground focus'}</small>
        </div>
      )
    }
  } else if (id === 'metric_top_button') {
    icon = 'gamepad'
    label = isZh ? '最高频按键' : 'Top Button'
    const sortedKeys = Object.entries(stats.buttonCounts).sort((a, b) => b[1] - a[1])
    const topKey = sortedKeys[0]
    value = topKey ? getButtonDisplayName(topKey[0], isZh) : 'A 键'
    subValue = topKey ? `${topKey[1]} ${isZh ? '次按下' : 'presses'}` : '0 次'
    trendPill = (
      <span className="shiin-metric-chip is-accent">
        <AppIcon name="flame" size={12} />
        <span>{isZh ? '热度第一' : 'Hot'}</span>
      </span>
    )

    if (is2x1 && topKey) {
      const totalKeys = sortedKeys.reduce((acc, [, c]) => acc + c, 0) || 1
      const share = Math.round((topKey[1] / totalKeys) * 100)
      extraGauge = (
        <div className="shiin-metric-extra-gauge">
          <div className="shiin-metric-extra-gauge__head">
            <span>{isZh ? '按键使用占比' : 'Input Ratio'}</span>
            <strong>{share}%</strong>
          </div>
          <div className="shiin-metric-extra-gauge__track">
            <div className="shiin-metric-extra-gauge__fill" style={{ width: `${share}%` }} />
          </div>
          <small>{isZh ? '有效按键边沿采样' : 'Rising edge sample'}</small>
        </div>
      )
    }
  }

  return (
    <DashboardWidgetFrame
      id={id}
      size={size}
      isEditing={isEditing}
      locale={locale}
      onResize={onResize}
      onMove={onMove}
      onRemove={onRemove}
      className={`shiin-metric-frame ${is2x1 ? 'is-2x1' : ''}`}
    >
      <div className={`shiin-metric-card ${is2x1 ? 'is-2x1' : ''}`}>
        {/* Background morph shape watermark */}
        <div className="shiin-metric-card__watermark" aria-hidden="true">
          <Md3eMorphShape path={session.shapes.metric.svgPath} className="shiin-metric-card__shape" />
        </div>

        <div className="shiin-metric-card__left">
          <div className="shiin-metric-card__top">
            <span className="shiin-metric-card__icon-seat">
              <AppIcon name={icon} size={18} />
            </span>
            <span className="shiin-metric-card__label">{label}</span>
            <div className="shiin-metric-card__pill-wrap">{trendPill}</div>
          </div>

          <div className="shiin-metric-card__hero">
            <strong className="shiin-metric-card__value" title={value}>{value}</strong>
            {subValue && <span className="shiin-metric-card__sub">{subValue}</span>}
          </div>
        </div>

        {is2x1 && extraGauge && (
          <div className="shiin-metric-card__right">
            {extraGauge}
          </div>
        )}
      </div>
    </DashboardWidgetFrame>
  )
}
