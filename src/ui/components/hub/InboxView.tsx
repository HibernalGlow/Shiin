import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { InboxStore, type InboxItem, type InboxItemStatus } from '../../../core/inbox.js'
import type { CaptureSession } from '../../../core/session.js'
import { AppIcon } from '../AppIcon.js'
import { ProfileBadge } from './ProfileBadge.js'
import { ProfileSelector } from './ProfileSelector.js'
import { SessionTimeline } from './SessionTimeline.js'
import { ItemDetailModal } from './ItemDetailModal.js'
import { INITIAL_DEMO_ITEMS, type HubFilterState, type InboxViewMode } from './types.js'

interface InboxViewProps {
  locale?: string
  initialStatus?: InboxItemStatus
  onClose?: () => void
}

export const InboxView: React.FC<InboxViewProps> = ({
  locale = 'zh',
  initialStatus = 'inbox',
  onClose,
}) => {
  const isZh = locale.startsWith('zh')

  const [store] = React.useState<InboxStore>(() => new InboxStore(INITIAL_DEMO_ITEMS))
  const [viewMode, setViewMode] = React.useState<InboxViewMode>('grid')
  const [filterState, setFilterState] = React.useState<HubFilterState>({
    status: initialStatus,
    searchQuery: '',
  })
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [inspectingItem, setInspectingItem] = React.useState<InboxItem | null>(null)
  const [itemsVersion, setItemsVersion] = React.useState(0)

  // Re-query items whenever version or filters change
  const displayedItems = React.useMemo(() => {
    return store.query({
      status: filterState.status,
      profileId: filterState.profileId,
      searchQuery: filterState.searchQuery,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterState, itemsVersion])

  const totalAll = store.getAll().length
  const inboxCount = store.getInboxCount()
  const starredCount = store.getAll().filter((it) => it.status === 'starred').length
  const archivedCount = store.getAll().filter((it) => it.status === 'archived').length

  const handleArchive = (id: string) => {
    store.archiveItem(id)
    setItemsVersion((v) => v + 1)
  }

  const handleStar = (id: string) => {
    const it = store.getItem(id)
    if (it) {
      store.starItem(id, it.status !== 'starred')
      setItemsVersion((v) => v + 1)
    }
  }

  const handleTrash = (id: string) => {
    store.trashItem(id)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setItemsVersion((v) => v + 1)
  }

  const handleBatchArchive = () => {
    store.batchArchive(Array.from(selectedIds))
    setSelectedIds(new Set())
    setItemsVersion((v) => v + 1)
  }

  const handleBatchTrash = () => {
    store.batchTrash(Array.from(selectedIds))
    setSelectedIds(new Set())
    setItemsVersion((v) => v + 1)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSessionArchive = (session: CaptureSession) => {
    store.batchArchive(session.items.map((it) => it.id))
    setItemsVersion((v) => v + 1)
  }

  const handleSessionStar = (session: CaptureSession) => {
    for (const it of session.items) {
      store.starItem(it.id, true)
    }
    setItemsVersion((v) => v + 1)
  }

  return (
    <div
      className="shiin-inbox-view"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '8px 0',
      }}
    >
      {/* 1. Metric Counter & View Mode Stage */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--shiin-ink)' }}>
              {isZh ? '捕获收件箱 (Capture Inbox)' : 'Capture Inbox'}
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--shiin-muted)' }}>
              {isZh
                ? '所有新捕获图片先进入收件箱，支持无感记录并稍后批量整理'
                : 'Zero-cognitive capture: images land in the inbox for triage later'}
            </p>
          </div>
        </div>

        {/* View Switcher: Grid vs Timeline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="shiin-dash-tabs" role="group">
            <button
              type="button"
              className={`shiin-dash-tab ${viewMode === 'grid' ? 'is-active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <AppIcon name="layout" size={13} />
                <span>{isZh ? 'Bento 网格' : 'Bento Grid'}</span>
              </span>
            </button>
            <button
              type="button"
              className={`shiin-dash-tab ${viewMode === 'timeline' ? 'is-active' : ''}`}
              onClick={() => setViewMode('timeline')}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <AppIcon name="clock" size={13} />
                <span>{isZh ? '会话时间线' : 'Timeline Sessions'}</span>
              </span>
            </button>
          </div>

          {onClose && (
            <button
              type="button"
              className="shiin-dash-tab"
              onClick={onClose}
              aria-label={isZh ? '关闭' : 'Close'}
            >
              <AppIcon name="close" size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Filter Status Tabs & Profile Row */}
      <div
        className="shiin-dash-card"
        style={{
          padding: '14px 18px',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {/* Status Tabs */}
          <div className="shiin-dash-tabs" role="group">
            {[
              { id: 'inbox', label: isZh ? '收件箱待整理' : 'Inbox', count: inboxCount },
              { id: 'starred', label: isZh ? '收藏标星' : 'Starred', count: starredCount },
              { id: 'archived', label: isZh ? '已归档' : 'Archived', count: archivedCount },
              { id: 'all', label: isZh ? '全部资产' : 'All', count: totalAll },
            ].map((tab) => {
              const active = filterState.status === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`shiin-dash-tab ${active ? 'is-active' : ''}`}
                  onClick={() => setFilterState((prev) => ({ ...prev, status: tab.id as any }))}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span>{tab.label}</span>
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '1px 5px',
                        borderRadius: '999px',
                        backgroundColor: active ? 'var(--md-sys-color-primary, #c8f000)' : 'var(--md-sys-color-surface-container-high)',
                        color: active ? 'var(--md-sys-color-on-primary, #273000)' : 'var(--shiin-muted)',
                        fontWeight: 700,
                      }}
                    >
                      {tab.count}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search Input (Searches OCR, titles, apps) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--md-sys-color-surface-container, #e4e2d6)',
              padding: '4px 12px',
              borderRadius: '999px',
              border: '1px solid var(--shiin-line-soft)',
              minWidth: '220px',
            }}
          >
            <AppIcon name="search" size={13} style={{ color: 'var(--shiin-muted)' }} />
            <input
              type="text"
              placeholder={isZh ? '搜索窗口、标题或 OCR 正文...' : 'Search titles, apps, OCR...'}
              value={filterState.searchQuery}
              onChange={(e) => setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--shiin-ink)',
                fontSize: '12px',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>
        </div>

        {/* Profile Filter Pills */}
        <ProfileSelector
          selectedProfileId={filterState.profileId}
          onSelectProfile={(pId) => setFilterState((prev) => ({ ...prev, profileId: pId }))}
          locale={locale}
        />
      </div>

      {/* 3. Batch Action Dock (visible when items selected) */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container-high)',
              border: '1px solid var(--md-sys-color-primary)',
              borderRadius: '16px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shiin-shadow-2)',
            }}
          >
            <span style={{ fontSize: '12.5px', fontWeight: 650, color: 'var(--shiin-ink)' }}>
              {isZh ? `已勾选 ${selectedIds.size} 项` : `${selectedIds.size} items selected`}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="shiin-dash-tab"
                onClick={handleBatchArchive}
                style={{
                  backgroundColor: 'var(--md-sys-color-primary-container)',
                  color: 'var(--md-sys-color-on-primary-container)',
                  fontWeight: 650,
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <AppIcon name="archive" size={12} />
                  <span>{isZh ? '批量归档' : 'Batch Archive'}</span>
                </span>
              </button>
              <button
                type="button"
                className="shiin-dash-tab"
                onClick={handleBatchTrash}
                style={{
                  backgroundColor: 'var(--md-sys-color-error-container)',
                  color: 'var(--md-sys-color-on-error-container)',
                  fontWeight: 650,
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <AppIcon name="trash" size={12} />
                  <span>{isZh ? '批量删除' : 'Batch Trash'}</span>
                </span>
              </button>
              <button
                type="button"
                className="shiin-dash-tab"
                onClick={() => setSelectedIds(new Set())}
              >
                {isZh ? '取消选择' : 'Clear'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Main Body: Bento Grid or Session Timeline */}
      {viewMode === 'timeline' ? (
        <SessionTimeline
          items={displayedItems}
          onItemClick={(item) => setInspectingItem(item)}
          onSessionArchive={handleSessionArchive}
          onSessionStar={handleSessionStar}
          locale={locale}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '14px',
          }}
        >
          {displayedItems.length === 0 ? (
            <div className="shiin-dash-empty" style={{ gridColumn: '1 / -1', padding: '48px 16px' }}>
              <AppIcon name="inbox" size={36} style={{ opacity: 0.5 }} />
              <p>{isZh ? '收件箱干净整洁，暂无待整理图片' : 'Inbox is empty. Ready for new captures!'}</p>
            </div>
          ) : (
            displayedItems.map((item) => {
              const isSelected = selectedIds.has(item.id)
              return (
                <motion.div
                  key={item.id}
                  layout
                  className="shiin-dash-card"
                  onClick={() => setInspectingItem(item)}
                  style={{
                    padding: '14px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--md-sys-color-primary)' : undefined,
                  }}
                >
                  {/* Card Thumbnail Area */}
                  <div
                    style={{
                      height: '130px',
                      backgroundColor: 'var(--md-sys-color-surface-container-low, #eae8de)',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      color: 'var(--shiin-muted)',
                      border: '1px solid var(--shiin-line-soft)',
                    }}
                  >
                    <AppIcon name="image" size={32} />

                    {/* Checkbox badge */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleSelect(item.id)
                      }}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        border: '1px solid var(--shiin-line-soft)',
                        backgroundColor: isSelected ? 'var(--md-sys-color-primary)' : 'var(--shiin-surface)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--md-sys-color-on-primary)',
                        cursor: 'pointer',
                      }}
                    >
                      {isSelected && <AppIcon name="check" size={13} strokeWidth={2.5} />}
                    </div>

                    {/* Quick Triage Buttons */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '6px',
                        right: '6px',
                        display: 'flex',
                        gap: '2px',
                        backgroundColor: 'var(--shiin-surface)',
                        boxShadow: 'var(--shiin-shadow-1)',
                        padding: '2px',
                        borderRadius: '8px',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className="shiin-dash-tab"
                        onClick={() => handleStar(item.id)}
                        title={isZh ? '标星 (S)' : 'Star (S)'}
                        style={{
                          padding: '3px 6px',
                          color: item.status === 'starred' ? 'var(--md-sys-color-primary)' : 'var(--shiin-muted)',
                        }}
                      >
                        <AppIcon name="star" size={13} />
                      </button>
                      <button
                        type="button"
                        className="shiin-dash-tab"
                        onClick={() => handleArchive(item.id)}
                        title={isZh ? '归档 (E)' : 'Archive (E)'}
                        style={{ padding: '3px 6px' }}
                      >
                        <AppIcon name="archive" size={13} />
                      </button>
                      <button
                        type="button"
                        className="shiin-dash-tab"
                        onClick={() => handleTrash(item.id)}
                        title={isZh ? '废纸篓 (Del)' : 'Trash (Del)'}
                        style={{ padding: '3px 6px' }}
                      >
                        <AppIcon name="trash" size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Card Info Area */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <ProfileBadge profileId={item.profileId} locale={locale} />
                      <span style={{ fontSize: '11px', color: 'var(--shiin-muted)' }}>
                        {new Date(item.timestamp).toLocaleTimeString(isZh ? 'zh-CN' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <strong style={{ fontSize: '13px', color: 'var(--shiin-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.windowTitle || item.appName || 'Captured Asset'}
                    </strong>

                    {/* OCR snippet badge */}
                    {item.ocrText && (
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--shiin-muted)',
                          backgroundColor: 'var(--md-sys-color-surface-container)',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <strong style={{ color: 'var(--md-sys-color-secondary)' }}>OCR: </strong>
                        {item.ocrText}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      )}

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={inspectingItem}
        onClose={() => setInspectingItem(null)}
        onArchive={handleArchive}
        onStar={handleStar}
        onTrash={handleTrash}
        locale={locale}
      />
    </div>
  )
}
