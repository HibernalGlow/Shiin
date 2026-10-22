import * as React from 'react'
import { AppIcon } from '../AppIcon.js'
import { DashboardWidgetFrame } from './DashboardWidgetFrame.js'
import type { WidgetSize } from '../../dashboard-layout.js'
import type { ActivityStatsData } from '../../../core/stats.js'
import { formatTimeAgo } from './dashboard-utils.js'

export interface TopAppsWidgetProps {
  size: WidgetSize
  isEditing: boolean
  locale: string
  stats: ActivityStatsData
  onResize?: (size: WidgetSize) => void
  onMove?: (dir: 'prev' | 'next') => void
  onRemove?: () => void
}

export const TopAppsWidget: React.FC<TopAppsWidgetProps> = ({
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
  const [mode, setMode] = React.useState<'app' | 'window'>('app')

  // Sorted apps
  const sortedApps = React.useMemo(() => {
    return Object.entries(stats.appCounts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        lastSeen: data.lastSeen,
      }))
      .sort((a, b) => b.count - a.count)
  }, [stats.appCounts])

  // Sorted windows
  const sortedWindows = React.useMemo(() => {
    return Object.entries(stats.windowCounts)
      .map(([title, data]) => ({
        name: title,
        count: data.count,
        lastSeen: data.lastSeen,
        appName: data.appName || '',
      }))
      .sort((a, b) => b.count - a.count)
  }, [stats.windowCounts])

  const totalAppCount = React.useMemo(() => {
    return sortedApps.reduce((acc, item) => acc + item.count, 0) || 1
  }, [sortedApps])

  const totalWindowCount = React.useMemo(() => {
    return sortedWindows.reduce((acc, item) => acc + item.count, 0) || 1
  }, [sortedWindows])

  const maxAppCount = sortedApps[0]?.count || 1
  const maxWindowCount = sortedWindows[0]?.count || 1

  const activeEntries = mode === 'app' ? sortedApps : sortedWindows
  const activeTotal = mode === 'app' ? totalAppCount : totalWindowCount
  const activeMax = mode === 'app' ? maxAppCount : maxWindowCount

  return (
    <DashboardWidgetFrame
      id="top_apps"
      size={size}
      isEditing={isEditing}
      locale={locale}
      onResize={onResize}
      onMove={onMove}
      onRemove={onRemove}
      badge={
        <span className="shiin-dash-chip">
          {sortedApps.length} {isZh ? '个前台应用' : 'apps recorded'}
        </span>
      }
      headerActions={
        !isWide ? (
          <div className="shiin-dash-tabs" role="group" aria-label={isZh ? '统计模式' : 'Mode'}>
            <button
              type="button"
              className={`shiin-dash-tab ${mode === 'app' ? 'is-active' : ''}`}
              onClick={() => setMode('app')}
            >
              {isZh ? '按应用' : 'By App'}
            </button>
            <button
              type="button"
              className={`shiin-dash-tab ${mode === 'window' ? 'is-active' : ''}`}
              onClick={() => setMode('window')}
            >
              {isZh ? '按窗口' : 'By Window'}
            </button>
          </div>
        ) : undefined
      }
    >
      <div className={`shiin-top-apps ${isWide ? 'is-wide' : ''}`}>
        {sortedApps.length === 0 ? (
          <div className="shiin-dash-empty">
            <AppIcon name="appWindow" size={28} />
            <p>{isZh ? '暂无前台应用截图记录，触发一次截图后将自动采集' : 'No capture records yet. Take a screenshot to record foreground app.'}</p>
          </div>
        ) : isWide ? (
          /* Wide Mode: Comparative Dual-Pane (Left: Apps with Champion card, Right: Windows breakdown) */
          <div className="shiin-top-apps__dual-pane">
            {/* Left Column: Top Apps */}
            <div className="shiin-top-apps__col">
              <div className="shiin-top-apps__col-head">
                <span className="shiin-top-apps__col-title">
                  <AppIcon name="target" size={14} />
                  <strong>{isZh ? '按应用统计' : 'Top Applications'}</strong>
                </span>
                <small>{sortedApps.length} {isZh ? '个' : 'apps'}</small>
              </div>

              {/* Champion Card */}
              {sortedApps[0] && (
                <div className="shiin-app-champion-card">
                  <div className="shiin-app-champion-card__icon">
                    <AppIcon name="trophy" size={20} />
                  </div>
                  <div className="shiin-app-champion-card__body">
                    <span className="shiin-app-champion-card__badge">{isZh ? '#1 截图最高频' : '#1 Most Captured'}</span>
                    <strong className="shiin-app-champion-card__name" title={sortedApps[0].name}>
                      {sortedApps[0].name}
                    </strong>
                    <div className="shiin-app-champion-card__stats">
                      <span>{sortedApps[0].count} {isZh ? '次截图' : 'shots'}</span>
                      <span className="shiin-dot" />
                      <span>{Math.round((sortedApps[0].count / totalAppCount) * 100)}% {isZh ? '占比' : 'share'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Apps in List */}
              <div className="shiin-top-apps__sublist">
                {sortedApps.slice(1, 6).map((app, index) => {
                  const pct = Math.round((app.count / totalAppCount) * 100)
                  const barPct = Math.round((app.count / maxAppCount) * 100)
                  return (
                    <div key={app.name} className="shiin-top-app-row">
                      <div className="shiin-top-app-row__info">
                        <span className="shiin-top-app-row__rank">#{index + 2}</span>
                        <div className="shiin-top-app-row__name-block">
                          <strong className="shiin-top-app-row__name" title={app.name}>{app.name}</strong>
                        </div>
                        <div className="shiin-top-app-row__stats">
                          <strong className="shiin-top-app-row__count">{app.count}</strong>
                          <span className="shiin-top-app-row__pct">{pct}%</span>
                        </div>
                      </div>
                      <div className="shiin-top-app-row__bar-track">
                        <div className="shiin-top-app-row__bar-fill" style={{ width: `${barPct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right Column: Top Windows */}
            <div className="shiin-top-apps__col">
              <div className="shiin-top-apps__col-head">
                <span className="shiin-top-apps__col-title">
                  <AppIcon name="appWindow" size={14} />
                  <strong>{isZh ? '具体窗口明细' : 'Window Breakdown'}</strong>
                </span>
                <small>{sortedWindows.length} {isZh ? '扇' : 'windows'}</small>
              </div>

              <div className="shiin-top-apps__sublist">
                {sortedWindows.slice(0, 6).map((win, index) => {
                  const pct = Math.round((win.count / totalWindowCount) * 100)
                  const barPct = Math.round((win.count / maxWindowCount) * 100)
                  return (
                    <div key={win.name} className="shiin-top-app-row">
                      <div className="shiin-top-app-row__info">
                        <span className="shiin-top-app-row__rank">#{index + 1}</span>
                        <div className="shiin-top-app-row__name-block">
                          <strong className="shiin-top-app-row__name" title={win.name}>{win.name}</strong>
                          {win.appName && (
                            <span className="shiin-top-app-row__sub" title={win.appName}>{win.appName}</span>
                          )}
                        </div>
                        <div className="shiin-top-app-row__stats">
                          <strong className="shiin-top-app-row__count">{win.count}</strong>
                          <span className="shiin-top-app-row__pct">{pct}%</span>
                        </div>
                      </div>
                      <div className="shiin-top-app-row__bar-track">
                        <div className="shiin-top-app-row__bar-fill" style={{ width: `${barPct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Compact Mode (2x2): Single Tab-Switched List */
          <div className="shiin-top-apps__list">
            {activeEntries.slice(0, 6).map((item, index) => {
              const percent = Math.round((item.count / activeTotal) * 100)
              const barPercent = Math.min(100, Math.round((item.count / activeMax) * 100))
              const isTop = index === 0

              return (
                <div key={item.name} className={`shiin-top-app-row ${isTop ? 'is-champion' : ''}`}>
                  <div className="shiin-top-app-row__info">
                    <span className="shiin-top-app-row__rank">#{index + 1}</span>
                    <div className="shiin-top-app-row__name-block">
                      <strong className="shiin-top-app-row__name" title={item.name}>
                        {item.name}
                      </strong>
                      {'appName' in item && typeof (item as any).appName === 'string' && (
                        <span className="shiin-top-app-row__sub" title={(item as any).appName}>
                          {(item as any).appName}
                        </span>
                      )}
                    </div>
                    <div className="shiin-top-app-row__stats">
                      <span className="shiin-top-app-row__time">{formatTimeAgo(item.lastSeen, isZh)}</span>
                      <strong className="shiin-top-app-row__count">
                        {item.count} <small>{isZh ? '次' : 'shots'}</small>
                      </strong>
                      <span className="shiin-top-app-row__pct">{percent}%</span>
                    </div>
                  </div>

                  <div className="shiin-top-app-row__bar-track">
                    <div
                      className="shiin-top-app-row__bar-fill"
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardWidgetFrame>
  )
}
