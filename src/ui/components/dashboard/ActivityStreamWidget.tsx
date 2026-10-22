import * as React from 'react'
import { AppIcon } from '../AppIcon.js'
import { DashboardWidgetFrame } from './DashboardWidgetFrame.js'
import type { WidgetSize } from '../../dashboard-layout.js'
import type { ActivityEvent, ActivityEventType, ActivityStatsData } from '../../../core/stats.js'
import { formatExactTime, formatTimeAgo } from './dashboard-utils.js'

export interface ActivityStreamWidgetProps {
  size: WidgetSize
  isEditing: boolean
  locale: string
  stats: ActivityStatsData
  onClearEvents?: () => void
  onResize?: (size: WidgetSize) => void
  onMove?: (dir: 'prev' | 'next') => void
  onRemove?: () => void
}

export const ActivityStreamWidget: React.FC<ActivityStreamWidgetProps> = ({
  size,
  isEditing,
  locale,
  stats,
  onClearEvents,
  onResize,
  onMove,
  onRemove,
}) => {
  const isZh = locale.startsWith('zh')
  const isWide = size === '3x2' || size === '4x2'
  const [filter, setFilter] = React.useState<ActivityEventType | 'all'>('all')
  const [isPaused, setIsPaused] = React.useState(false)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null)

  const filteredEvents = React.useMemo(() => {
    if (filter === 'all') return stats.events
    return stats.events.filter((ev) => ev.type === filter)
  }, [filter, stats.events])

  const selectedEvent = React.useMemo(() => {
    if (selectedEventId) {
      const found = stats.events.find((ev) => ev.id === selectedEventId)
      if (found) return found
    }
    return filteredEvents[0] || null
  }, [selectedEventId, stats.events, filteredEvents])

  const copyEventInfo = (ev: ActivityEvent, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const text = ev.meta?.filePath || `${ev.titleZh} (${new Date(ev.timestamp).toLocaleString()})`
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(text)
      setCopiedId(ev.id)
      setTimeout(() => setCopiedId(null), 1500)
    }
  }

  const getEventIcon = (type: ActivityEventType): string => {
    switch (type) {
      case 'screenshot':
        return 'camera'
      case 'listen_start':
        return 'play'
      case 'listen_stop':
        return 'stop'
      case 'button_press':
        return 'gamepad'
      case 'obs_replay':
        return 'wave'
      default:
        return 'activity'
    }
  }

  return (
    <DashboardWidgetFrame
      id="activity_stream"
      size={size}
      isEditing={isEditing}
      locale={locale}
      onResize={onResize}
      onMove={onMove}
      onRemove={onRemove}
      badge={
        <span className="shiin-dash-chip">
          {filteredEvents.length} {isZh ? '条记录' : 'events'}
        </span>
      }
      headerActions={
        <div className="shiin-stream-controls">
          <div className="shiin-dash-tabs" role="group" aria-label={isZh ? '事件筛选' : 'Filter'}>
            <button
              type="button"
              className={`shiin-dash-tab ${filter === 'all' ? 'is-active' : ''}`}
              onClick={() => setFilter('all')}
            >
              {isZh ? '全部' : 'All'}
            </button>
            <button
              type="button"
              className={`shiin-dash-tab ${filter === 'screenshot' ? 'is-active' : ''}`}
              onClick={() => setFilter('screenshot')}
            >
              {isZh ? '截图' : 'Captures'}
            </button>
            <button
              type="button"
              className={`shiin-dash-tab ${filter === 'button_press' ? 'is-active' : ''}`}
              onClick={() => setFilter('button_press')}
            >
              {isZh ? '手柄' : 'Gamepad'}
            </button>
            <button
              type="button"
              className={`shiin-dash-tab ${filter === 'listen_start' || filter === 'listen_stop' ? 'is-active' : ''}`}
              onClick={() => setFilter('listen_start')}
            >
              {isZh ? '监听' : 'Listener'}
            </button>
            <button
              type="button"
              className={`shiin-dash-tab ${filter === 'obs_replay' ? 'is-active' : ''}`}
              onClick={() => setFilter('obs_replay')}
            >
              OBS
            </button>
          </div>

          <button
            type="button"
            className={`shiin-icon-chip-btn ${isPaused ? 'is-paused' : ''}`}
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? (isZh ? '已暂停刷新' : 'Paused') : isZh ? '暂停滚动' : 'Pause'}
          >
            <AppIcon name={isPaused ? 'play' : 'pause'} size={13} />
            <span>{isPaused ? (isZh ? '已暂停' : 'Paused') : isZh ? '实时' : 'Live'}</span>
          </button>
        </div>
      }
    >
      <div className={`shiin-activity-stream ${isWide ? 'is-wide' : ''}`}>
        {filteredEvents.length === 0 ? (
          <div className="shiin-dash-empty">
            <AppIcon name="list" size={26} />
            <p>{isZh ? '当前筛选下暂无活动事件' : 'No activity records match this filter.'}</p>
          </div>
        ) : isWide ? (
          /* Wide Mode: Split Feed (Left 58% List + Right 42% Event Inspector) */
          <div className="shiin-stream-split">
            {/* Left Stream List */}
            <div className="shiin-stream-list is-scrollable">
              {filteredEvents.map((ev) => {
                const iconName = getEventIcon(ev.type)
                const title = isZh ? ev.titleZh : ev.titleEn
                const isSelected = selectedEvent?.id === ev.id

                return (
                  <div
                    key={ev.id}
                    className={`shiin-stream-item is-${ev.type} ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSelectedEventId(ev.id)}
                  >
                    <span className={`shiin-stream-icon is-${ev.type}`}>
                      <AppIcon name={iconName} size={15} />
                    </span>

                    <div className="shiin-stream-content">
                      <div className="shiin-stream-main">
                        <strong className="shiin-stream-title">{title}</strong>
                        {ev.description && (
                          <span className="shiin-stream-desc" title={ev.description}>
                            {ev.description}
                          </span>
                        )}
                      </div>

                      <div className="shiin-stream-meta">
                        <span className="shiin-stream-exact">{formatExactTime(ev.timestamp)}</span>
                        <span className="shiin-stream-rel">{formatTimeAgo(ev.timestamp, isZh)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right Event Inspector */}
            <div className="shiin-stream-inspector">
              {selectedEvent ? (
                <div className="shiin-event-inspector">
                  <div className="shiin-event-inspector__head">
                    <span className={`shiin-stream-icon is-${selectedEvent.type}`}>
                      <AppIcon name={getEventIcon(selectedEvent.type)} size={16} />
                    </span>
                    <div className="shiin-event-inspector__titles">
                      <strong>{isZh ? selectedEvent.titleZh : selectedEvent.titleEn}</strong>
                      <small>{new Date(selectedEvent.timestamp).toLocaleString()}</small>
                    </div>
                  </div>

                  <div className="shiin-event-inspector__body">
                    {selectedEvent.meta?.appName && (
                      <div className="shiin-inspector-row">
                        <span>{isZh ? '活动应用' : 'Application'}</span>
                        <strong>{selectedEvent.meta.appName}</strong>
                      </div>
                    )}
                    {selectedEvent.meta?.windowTitle && (
                      <div className="shiin-inspector-row">
                        <span>{isZh ? '窗口标题' : 'Window Title'}</span>
                        <strong title={selectedEvent.meta.windowTitle}>{selectedEvent.meta.windowTitle}</strong>
                      </div>
                    )}
                    {selectedEvent.meta?.filePath && (
                      <div className="shiin-inspector-row">
                        <span>{isZh ? '文件路径' : 'Saved File'}</span>
                        <code title={selectedEvent.meta.filePath}>{selectedEvent.meta.filePath}</code>
                      </div>
                    )}
                    {selectedEvent.meta?.buttonKey && (
                      <div className="shiin-inspector-row">
                        <span>{isZh ? '按键映射' : 'Button Key'}</span>
                        <strong>{selectedEvent.meta.buttonName || selectedEvent.meta.buttonKey}</strong>
                      </div>
                    )}
                    {selectedEvent.meta?.durationMs && (
                      <div className="shiin-inspector-row">
                        <span>{isZh ? '持续时间' : 'Duration'}</span>
                        <strong>{Math.round(selectedEvent.meta.durationMs / 1000)} {isZh ? '秒' : 's'}</strong>
                      </div>
                    )}
                  </div>

                  <div className="shiin-event-inspector__actions">
                    <button
                      type="button"
                      className="shiin-dash-btn is-tonal"
                      style={{ minHeight: 32, padding: '0 12px', fontSize: 11.5 }}
                      onClick={(e) => copyEventInfo(selectedEvent, e)}
                    >
                      <AppIcon name={copiedId === selectedEvent.id ? 'check' : 'copy'} size={13} />
                      <span>{copiedId === selectedEvent.id ? (isZh ? '已复制' : 'Copied') : isZh ? '复制路径/信息' : 'Copy Path'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="shiin-dash-empty">
                  <p>{isZh ? '点击左侧记录查看详情' : 'Click an event to inspect details.'}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Compact Mode: Single List */
          <div className="shiin-stream-list">
            {filteredEvents.map((ev) => {
              const iconName = getEventIcon(ev.type)
              const title = isZh ? ev.titleZh : ev.titleEn
              const isCopied = copiedId === ev.id

              return (
                <div key={ev.id} className={`shiin-stream-item is-${ev.type}`}>
                  <span className={`shiin-stream-icon is-${ev.type}`}>
                    <AppIcon name={iconName} size={15} />
                  </span>

                  <div className="shiin-stream-content">
                    <div className="shiin-stream-main">
                      <strong className="shiin-stream-title">{title}</strong>
                      {ev.description && (
                        <span className="shiin-stream-desc" title={ev.description}>
                          {ev.description}
                        </span>
                      )}
                    </div>

                    <div className="shiin-stream-meta">
                      <span className="shiin-stream-exact">{formatExactTime(ev.timestamp)}</span>
                      <span className="shiin-stream-rel">{formatTimeAgo(ev.timestamp, isZh)}</span>
                      <button
                        type="button"
                        className="shiin-stream-copy-btn"
                        onClick={(e) => copyEventInfo(ev, e)}
                        title={isZh ? '复制事件详情或文件路径' : 'Copy path / details'}
                      >
                        <AppIcon name={isCopied ? 'check' : 'copy'} size={12} />
                        <span>{isCopied ? (isZh ? '已复制' : 'Copied') : isZh ? '复制' : 'Copy'}</span>
                      </button>
                    </div>
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
