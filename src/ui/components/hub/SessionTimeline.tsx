import * as React from 'react'
import { motion } from 'motion/react'
import type { InboxItem } from '../../../core/inbox.js'
import { clusterIntoSessions, type CaptureSession } from '../../../core/session.js'
import { AppIcon } from '../AppIcon.js'
import { ProfileBadge } from './ProfileBadge.js'

interface SessionTimelineProps {
  items: InboxItem[]
  onItemClick: (item: InboxItem) => void
  onSessionArchive: (session: CaptureSession) => void
  onSessionStar: (session: CaptureSession) => void
  locale?: string
}

export const SessionTimeline: React.FC<SessionTimelineProps> = ({
  items,
  onItemClick,
  onSessionArchive,
  onSessionStar,
  locale = 'zh',
}) => {
  const isZh = locale.startsWith('zh')
  const sessions = React.useMemo(() => clusterIntoSessions(items), [items])

  if (sessions.length === 0) {
    return (
      <div className="shiin-dash-empty">
        <AppIcon name="clock" size={32} style={{ opacity: 0.5 }} />
        <p>{isZh ? '暂无捕获会话记录' : 'No capture sessions recorded yet'}</p>
      </div>
    )
  }

  return (
    <div className="shiin-session-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {sessions.map((session, index) => {
        const timeAgoStr = new Date(session.startTime).toLocaleTimeString(isZh ? 'zh-CN' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })

        return (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="shiin-dash-card"
            style={{
              padding: '16px 18px',
              borderRadius: '20px',
            }}
          >
            {/* Session Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="shiin-dash-chip">
                  <AppIcon name="clock" size={12} />
                  <span>{timeAgoStr}</span>
                </span>

                <ProfileBadge profileId={session.profileId} locale={locale} />

                <strong style={{ fontSize: '13px', color: 'var(--shiin-ink)' }}>
                  {isZh ? session.summaryZh : session.summaryEn}
                </strong>
              </div>

              {/* Batch Actions for this Session */}
              <div className="shiin-dash-tabs" role="group">
                <button
                  type="button"
                  className="shiin-dash-tab"
                  onClick={() => onSessionStar(session)}
                  style={{ color: 'var(--md-sys-color-primary, #c8f000)' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <AppIcon name="star" size={12} />
                    <span>{isZh ? '标星' : 'Star'}</span>
                  </span>
                </button>
                <button
                  type="button"
                  className="shiin-dash-tab"
                  onClick={() => onSessionArchive(session)}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <AppIcon name="archive" size={12} />
                    <span>{isZh ? '归档' : 'Archive'}</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Session Items Reel / Filmstrip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '8px',
              }}
            >
              {session.items.map((it) => (
                <div
                  key={it.id}
                  onClick={() => onItemClick(it)}
                  style={{
                    backgroundColor: 'var(--md-sys-color-surface-container-low, #eae8de)',
                    borderRadius: '12px',
                    border: '1px solid var(--shiin-line-soft, rgba(0,0,0,0.08))',
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--md-sys-color-primary, #c8f000)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--shiin-line-soft, rgba(0,0,0,0.08))'
                    e.currentTarget.style.transform = 'none'
                  }}
                >
                  <div
                    style={{
                      height: '72px',
                      backgroundColor: 'var(--md-sys-color-surface-container, #e4e2d6)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--shiin-muted)',
                    }}
                  >
                    <AppIcon name="image" size={22} />
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--shiin-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {it.windowTitle || it.appName || 'Shot'}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
