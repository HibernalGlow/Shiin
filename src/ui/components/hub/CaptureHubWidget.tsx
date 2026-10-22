import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { InboxStore, type InboxItem } from '../../../core/inbox.js'
import { AppIcon } from '../AppIcon.js'
import { Md3eMorphShape } from '../bento-controls.js'
import { useMd3eShapes } from '../../md3e-shape-context.js'
import { ProfileBadge } from './ProfileBadge.js'
import { ProfileSelector } from './ProfileSelector.js'
import { ItemDetailModal } from './ItemDetailModal.js'
import { InboxView } from './InboxView.js'
import { WorkflowsView } from './WorkflowsView.js'
import { INITIAL_DEMO_ITEMS } from './types.js'

interface CaptureHubWidgetProps {
  locale: string
}

export const CaptureHubWidget: React.FC<CaptureHubWidgetProps> = ({ locale }) => {
  const isZh = locale.startsWith('zh')
  const { session } = useMd3eShapes()

  const [store] = React.useState<InboxStore>(() => new InboxStore(INITIAL_DEMO_ITEMS))
  const [selectedProfileId, setSelectedProfileId] = React.useState<string | undefined>()
  const [inspectingItem, setInspectingItem] = React.useState<InboxItem | null>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('hub') === 'detail'
        ? INITIAL_DEMO_ITEMS[0] || null
        : null
    }
    return null
  })
  const [showInboxModal, setShowInboxModal] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('hub') === 'inbox'
    }
    return false
  })
  const [showWorkflowsModal, setShowWorkflowsModal] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('hub') === 'workflows'
    }
    return false
  })
  const [version, setVersion] = React.useState(0)

  const items = React.useMemo(() => {
    return store.query({
      status: 'inbox',
      profileId: selectedProfileId,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProfileId, version])

  const inboxCount = store.getInboxCount()
  const starredCount = store.getAll().filter((i) => i.status === 'starred').length

  const handleArchive = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    store.archiveItem(id)
    setVersion((v) => v + 1)
  }

  const handleStar = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const it = store.getItem(id)
    if (it) {
      store.starItem(id, it.status !== 'starred')
      setVersion((v) => v + 1)
    }
  }

  const handleTrash = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    store.trashItem(id)
    setVersion((v) => v + 1)
  }

  return (
    <section
      className="sb-tile shiin-workspace-tile sb-capture-hub-tile"
      aria-label={isZh ? '捕获中枢与收件箱' : 'Capture Hub & Inbox'}
      style={{ gridColumn: 'span 12' }}
    >
      {/* Tile Header */}
      <div className="sb-tile-head">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              className="sb-control-seat"
              style={{
                position: 'relative',
                width: '32px',
                height: '32px',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--md-sys-color-primary, #c8f000)',
              }}
              aria-hidden="true"
            >
              <Md3eMorphShape path={session.shapes.icon.svgPath} />
              <AppIcon name="inbox" size={16} />
            </span>
            <h3 style={{ margin: 0 }}>
              {isZh ? '捕获中枢 · 待整理收件箱' : 'Capture Hub & Inbox'}
            </h3>
          </div>
          <p className="shiin-tile-description">
            {isZh
              ? '跨应用捕获内容统一进驻收件箱，自动沉淀标准 XMP 元数据，支持随时批量整理。'
              : 'Cross-app captures land in the inbox with standard XMP metadata for triage later.'}
          </p>
          <p className="shiin-tile-summary">
            {isZh
              ? `当前有 ${inboxCount} 张待整理图片 · ${starredCount} 张已标星`
              : `${inboxCount} pending in inbox · ${starredCount} starred`}
          </p>
        </div>

        {/* Badges and Launch Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="shiin-dash-chip is-live">
            <span className="shiin-live-dot" />
            <span>{inboxCount} {isZh ? '待整理' : 'Pending'}</span>
          </span>

          <span className="shiin-dash-chip">
            <AppIcon name="star" size={11} style={{ color: 'var(--md-sys-color-primary, #c8f000)' }} />
            <span>{starredCount} {isZh ? '收藏' : 'Starred'}</span>
          </span>

          <button
            type="button"
            className="shiin-dash-tab is-active"
            onClick={() => setShowInboxModal(true)}
            style={{
              padding: '6px 14px',
              backgroundColor: 'var(--md-sys-color-primary, #c8f000)',
              color: 'var(--md-sys-color-on-primary, #273000)',
              fontWeight: 700,
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <AppIcon name="inbox" size={13} />
              <span>{isZh ? '打开收件箱' : 'Open Inbox'}</span>
            </span>
          </button>

          <button
            type="button"
            className="shiin-dash-tab"
            onClick={() => setShowWorkflowsModal(true)}
            style={{
              padding: '6px 14px',
              backgroundColor: 'var(--md-sys-color-surface-container-high)',
              color: 'var(--shiin-ink)',
              fontWeight: 650,
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <AppIcon name="workflow" size={13} />
              <span>{isZh ? '工作流与规则' : 'Workflows'}</span>
            </span>
          </button>
        </div>
      </div>

      {/* Tile Body: Quick Profile Switcher + Recent Reel */}
      <div className="shiin-workspace-tile__body" style={{ marginTop: '12px' }}>
        <div style={{ marginBottom: '12px' }}>
          <ProfileSelector
            selectedProfileId={selectedProfileId}
            onSelectProfile={setSelectedProfileId}
            locale={locale}
          />
        </div>

        {/* Recent Items Reel */}
        {items.length === 0 ? (
          <div className="shiin-dash-empty" style={{ padding: '24px 0' }}>
            <AppIcon name="inbox" size={28} style={{ opacity: 0.4 }} />
            <p style={{ fontSize: '13px' }}>
              {isZh ? '此场景下暂无待整理图片。按下快门即可开始捕获。' : 'No pending captures in this profile.'}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '12px',
            }}
          >
            {items.slice(0, 4).map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -2 }}
                onClick={() => setInspectingItem(item)}
                className="shiin-dash-card"
                style={{
                  padding: '10px 12px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    height: '96px',
                    backgroundColor: 'var(--shiin-surface-low)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    color: 'var(--shiin-muted)',
                    border: '1px solid var(--shiin-line-soft)',
                  }}
                >
                  <AppIcon name="image" size={26} />

                  {/* Quick Triage Buttons */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '4px',
                      right: '4px',
                      display: 'flex',
                      gap: '2px',
                      backgroundColor: 'var(--shiin-surface)',
                      boxShadow: 'var(--shiin-shadow-1)',
                      padding: '2px',
                      borderRadius: '6px',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="shiin-dash-tab"
                      onClick={(e) => handleStar(item.id, e)}
                      title={isZh ? '标星 (S)' : 'Star (S)'}
                      style={{
                        padding: '2px 5px',
                        color: item.status === 'starred' ? 'var(--md-sys-color-primary)' : 'var(--shiin-muted)',
                      }}
                    >
                      <AppIcon name="star" size={12} />
                    </button>
                    <button
                      type="button"
                      className="shiin-dash-tab"
                      onClick={(e) => handleArchive(item.id, e)}
                      title={isZh ? '归档 (E)' : 'Archive (E)'}
                      style={{ padding: '2px 5px' }}
                    >
                      <AppIcon name="archive" size={12} />
                    </button>
                    <button
                      type="button"
                      className="shiin-dash-tab"
                      onClick={(e) => handleTrash(item.id, e)}
                      title={isZh ? '删除 (Del)' : 'Trash (Del)'}
                      style={{ padding: '2px 5px' }}
                    >
                      <AppIcon name="trash" size={12} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <ProfileBadge profileId={item.profileId} locale={locale} />
                    <span style={{ fontSize: '10.5px', color: 'var(--shiin-muted)' }}>
                      {new Date(item.timestamp).toLocaleTimeString(isZh ? 'zh-CN' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <strong style={{ fontSize: '12px', color: 'var(--shiin-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.windowTitle || item.appName || 'Asset'}
                  </strong>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Item Detail Inspector Modal */}
      <ItemDetailModal
        item={inspectingItem}
        onClose={() => setInspectingItem(null)}
        onArchive={handleArchive}
        onStar={handleStar}
        onTrash={handleTrash}
        locale={locale}
      />

      {/* Full Inbox Modal Drawer */}
      <AnimatePresence>
        {showInboxModal && (
          <div
            className="shiin-modal-backdrop"
            onClick={() => setShowInboxModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(8px)',
              zIndex: 9990,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
          >
            <motion.div
              className="shiin-modal-dialog"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              style={{
                width: '100%',
                maxWidth: '1100px',
                maxHeight: '88vh',
                backgroundColor: 'var(--shiin-surface)',
                color: 'var(--shiin-ink)',
                borderRadius: '28px',
                border: '1px solid var(--shiin-line-soft)',
                boxShadow: 'var(--shiin-shadow-2)',
                padding: '24px',
                overflowY: 'auto',
              }}
            >
              <InboxView
                locale={locale}
                onClose={() => setShowInboxModal(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Workflows Modal Drawer */}
      <AnimatePresence>
        {showWorkflowsModal && (
          <div
            className="shiin-modal-backdrop"
            onClick={() => setShowWorkflowsModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(8px)',
              zIndex: 9990,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
          >
            <motion.div
              className="shiin-modal-dialog"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              style={{
                width: '100%',
                maxWidth: '960px',
                maxHeight: '88vh',
                backgroundColor: 'var(--shiin-surface)',
                color: 'var(--shiin-ink)',
                borderRadius: '28px',
                border: '1px solid var(--shiin-line-soft)',
                boxShadow: 'var(--shiin-shadow-2)',
                padding: '24px',
                overflowY: 'auto',
              }}
            >
              <WorkflowsView
                items={INITIAL_DEMO_ITEMS}
                locale={locale}
                onClose={() => setShowWorkflowsModal(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
