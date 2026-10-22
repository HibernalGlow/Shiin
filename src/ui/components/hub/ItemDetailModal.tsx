import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { InboxItem } from '../../../core/inbox.js'
import { AppIcon } from '../AppIcon.js'
import { ProfileBadge } from './ProfileBadge.js'

interface ItemDetailModalProps {
  item: InboxItem | null
  onClose: () => void
  onArchive: (id: string) => void
  onStar: (id: string) => void
  onTrash: (id: string) => void
  locale?: string
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onArchive,
  onStar,
  onTrash,
  locale = 'zh',
}) => {
  const isZh = locale.startsWith('zh')
  const [copiedOcr, setCopiedOcr] = React.useState(false)

  if (!item) return null

  const handleCopyOcr = () => {
    if (item.ocrText) {
      void navigator.clipboard.writeText(item.ocrText)
      setCopiedOcr(true)
      setTimeout(() => setCopiedOcr(false), 2000)
    }
  }

  const formatSize = (bytes?: number) => {
    if (!bytes) return '--'
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    return `${Math.round(bytes / 1024)} KB`
  }

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString(isZh ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <AnimatePresence>
      <div
        className="shiin-modal-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
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
          transition={{ duration: 0.2 }}
          style={{
            width: '100%',
            maxWidth: '880px',
            maxHeight: '90vh',
            backgroundColor: 'var(--shiin-surface)',
            color: 'var(--shiin-ink)',
            border: '1px solid var(--shiin-line-soft)',
            borderRadius: '28px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shiin-shadow-2)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--shiin-line-soft)',
              backgroundColor: 'var(--shiin-surface-container)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ProfileBadge profileId={item.profileId} locale={locale} />
              <strong style={{ fontSize: '15px', color: 'var(--shiin-ink)' }}>
                {item.appName || (isZh ? '图片详情' : 'Capture Details')}
              </strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="shiin-dash-tab"
                onClick={() => onStar(item.id)}
                title={isZh ? '标星/收藏' : 'Star/Favorite'}
                style={{
                  color: item.status === 'starred' ? 'var(--shiin-accent, #c8f000)' : 'var(--shiin-muted)',
                }}
              >
                <AppIcon name="star" size={16} />
              </button>
              <button
                type="button"
                className="shiin-dash-tab"
                onClick={() => onArchive(item.id)}
                title={isZh ? '归档' : 'Archive'}
                style={{
                  color: item.status === 'archived' ? 'var(--shiin-olive, #85864a)' : 'var(--shiin-muted)',
                }}
              >
                <AppIcon name="archive" size={16} />
              </button>
              <button
                type="button"
                className="shiin-dash-tab"
                onClick={() => onTrash(item.id)}
                title={isZh ? '移至废纸篓' : 'Move to Trash'}
                style={{
                  color: item.status === 'trashed' ? 'var(--shiin-red, #a72d3b)' : 'var(--shiin-muted)',
                }}
              >
                <AppIcon name="trash" size={16} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="shiin-dash-tab"
                style={{ marginLeft: '4px' }}
                aria-label={isZh ? '关闭' : 'Close'}
              >
                <AppIcon name="close" size={18} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)',
              gap: '20px',
              padding: '22px',
              overflowY: 'auto',
            }}
          >
            {/* Left Image Stage */}
            <div
              style={{
                borderRadius: '18px',
                backgroundColor: 'var(--shiin-surface-low)',
                border: '1px solid var(--shiin-line-soft)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '260px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '12px',
                  color: 'var(--shiin-muted)',
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <AppIcon name="image" size={44} strokeWidth={1.2} />
                <span style={{ fontSize: '12px', wordBreak: 'break-all', maxWidth: '85%' }}>
                  {item.filePath}
                </span>
                {item.width && item.height && (
                  <span
                    className="shiin-dash-chip"
                    style={{ fontSize: '11px', marginTop: '4px' }}
                  >
                    {item.width} × {item.height} · {item.format.toUpperCase()} · {formatSize(item.sizeBytes)}
                  </span>
                )}
              </div>
            </div>

            {/* Right Standard Metadata HUD */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Context Panel */}
              <div
                style={{
                  backgroundColor: 'var(--shiin-surface-container)',
                  padding: '16px',
                  borderRadius: '16px',
                  border: '1px solid var(--shiin-line-soft)',
                }}
              >
                <h4 style={{ margin: '0 0 10px 0', fontSize: '11px', textTransform: 'uppercase', color: 'var(--shiin-muted)', letterSpacing: '0.06em' }}>
                  {isZh ? '标准捕获上下文 (XMP / IPTC)' : 'Metadata Context (XMP / IPTC)'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--shiin-muted)' }}>{isZh ? '来源应用' : 'Source App'}</span>
                    <strong style={{ color: 'var(--shiin-ink)' }}>{item.appName || 'Unknown'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--shiin-muted)' }}>{isZh ? '窗口标题' : 'Window Title'}</span>
                    <span style={{ maxWidth: '180px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--shiin-ink)' }}>
                      {item.windowTitle || '--'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--shiin-muted)' }}>{isZh ? '捕获时间' : 'Created Date'}</span>
                    <span style={{ color: 'var(--shiin-ink)' }}>{formatDate(item.timestamp)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--shiin-muted)' }}>{isZh ? '状态' : 'Status'}</span>
                    <span style={{ textTransform: 'capitalize', fontWeight: 650, color: item.status === 'starred' ? 'var(--shiin-accent, #c8f000)' : 'var(--shiin-ink)' }}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags Section */}
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '11px', textTransform: 'uppercase', color: 'var(--shiin-muted)', letterSpacing: '0.06em' }}>
                  {isZh ? '资产标签 (dc:subject)' : 'Tags (dc:subject)'}
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {item.tags.length > 0 ? (
                    item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="shiin-dash-chip"
                        style={{
                          backgroundColor: 'var(--shiin-surface-high)',
                          color: 'var(--shiin-ink)',
                          fontWeight: 600,
                        }}
                      >
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--shiin-muted)' }}>
                      {isZh ? '暂无标签' : 'No tags assigned'}
                    </span>
                  )}
                </div>
              </div>

              {/* Local OCR Text Inspector */}
              {item.ocrText && (
                <div
                  style={{
                    backgroundColor: 'var(--shiin-surface-container)',
                    padding: '14px',
                    borderRadius: '16px',
                    border: '1px solid var(--shiin-line-soft)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', color: 'var(--shiin-muted)', letterSpacing: '0.06em' }}>
                      {isZh ? '本地 OCR 正文 (全文检索索引)' : 'Local OCR Text (FTS Index)'}
                    </h4>
                    <button
                      type="button"
                      onClick={handleCopyOcr}
                      className="shiin-dash-tab"
                      style={{ fontSize: '11px', padding: '2px 8px' }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <AppIcon name={copiedOcr ? 'check' : 'copy'} size={12} />
                        <span>{copiedOcr ? (isZh ? '已复制' : 'Copied') : (isZh ? '复制' : 'Copy')}</span>
                      </span>
                    </button>
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      maxHeight: '110px',
                      overflowY: 'auto',
                      fontSize: '11.5px',
                      lineHeight: '1.5',
                      color: 'var(--shiin-ink)',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      fontFamily: 'var(--shiin-mono, monospace)',
                    }}
                  >
                    {item.ocrText}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
