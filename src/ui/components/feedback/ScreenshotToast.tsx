import * as React from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { AppIcon } from '../AppIcon.js'
import type { FeedbackNotice } from './FeedbackTypes.js'

export interface ScreenshotToastProps {
  notice: FeedbackNotice
  locale?: string
  theme?: 'light' | 'dark'
  onDismiss: (id: string) => void
  onOpenFolder?: () => void
  onPointerEnter?: () => void
  onPointerLeave?: () => void
}

export const ScreenshotToast: React.FC<ScreenshotToastProps> = ({
  notice,
  locale = 'zh',
  theme,
  onDismiss,
  onOpenFolder,
  onPointerEnter,
  onPointerLeave,
}) => {
  const isZh = locale.startsWith('zh')
  const reduced = useReducedMotion()
  const [imgError, setImgError] = React.useState(false)
  const isVideo = notice.format?.toLowerCase() === 'mp4' || /obs|replay|回放/i.test(notice.title || notice.message)

  const fileName = React.useMemo(() => {
    if (!notice.filePath) return ''
    return notice.filePath.split(/[\\/]/).pop() || ''
  }, [notice.filePath])

  const formatTag = React.useMemo(() => {
    if (isVideo) return 'MP4'
    if (notice.format) return notice.format.toUpperCase()
    if (fileName.includes('.')) return fileName.split('.').pop()?.toUpperCase() || 'IMG'
    return 'PNG'
  }, [isVideo, notice.format, fileName])

  const timeStr = React.useMemo(() => {
    const d = new Date(notice.timestamp || Date.now())
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    const ss = String(d.getSeconds()).padStart(2, '0')
    return `${hh}:${mm}:${ss}`
  }, [notice.timestamp])

  const copyPath = () => {
    if (notice.filePath && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(notice.filePath).catch(() => {})
    }
  }

  // File protocol URL or direct path
  const imageSource = React.useMemo(() => {
    if (!notice.filePath) return ''
    if (notice.filePath.startsWith('file://') || notice.filePath.startsWith('data:')) {
      return notice.filePath
    }
    // Convert path to file:// format for web preview
    const cleanPath = notice.filePath.replace(/\\/g, '/')
    return cleanPath.startsWith('/') ? `file://${cleanPath}` : `file:///${cleanPath}`
  }, [notice.filePath])

  return (
    <motion.div
      layout="position"
      className="shiin-screenshot-toast"
      data-theme={theme}
      data-kind="screenshot"
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: reduced ? 0 : 16, scale: reduced ? 1 : 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: reduced ? 0 : 10, scale: reduced ? 1 : 0.92 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onFocus={onPointerEnter}
      onBlur={onPointerLeave}
    >
      <div className="shiin-screenshot-toast__preview">
        {!isVideo && imageSource && !imgError ? (
          <img
            src={imageSource}
            alt="截图缩略图"
            className="shiin-screenshot-toast__thumbnail"
            onError={() => setImgError(true)}
          />
        ) : isVideo ? (
          <div className="shiin-screenshot-toast__video-icon" aria-label="录像">
            <AppIcon name="play" size={20} />
          </div>
        ) : (
          <div className="shiin-screenshot-toast__fallback-icon">
            <AppIcon name="camera" size={22} />
          </div>
        )}
      </div>

      <div className="shiin-screenshot-toast__body">
        <div className="shiin-screenshot-toast__header">
          <strong className="shiin-screenshot-toast__title">
            {notice.title || (isZh ? '截图已保存' : 'Screenshot Saved')}
          </strong>
          {notice.captureCount && notice.captureCount > 1 && (
            <span className="shiin-screenshot-toast__count-badge">
              {isZh ? `第 ${notice.captureCount} 张` : `×${notice.captureCount}`}
            </span>
          )}
        </div>

        <div className="shiin-screenshot-toast__meta">
          <span className="shiin-toast-chip">{formatTag}</span>
          <span className="shiin-toast-time">{timeStr}</span>
          {fileName && <span className="shiin-toast-filename" title={fileName}>{fileName}</span>}
        </div>

        <div className="shiin-screenshot-toast__actions">
          {onOpenFolder && (
            <button
              type="button"
              className="shiin-toast-action-btn"
              onClick={onOpenFolder}
              title={isZh ? '打开截图目录' : 'Open folder'}
            >
              <AppIcon name="folder" size={13} />
              <span>{isZh ? '打开目录' : 'Open folder'}</span>
            </button>
          )}

          {notice.filePath && (
            <button
              type="button"
              className="shiin-toast-action-btn"
              onClick={copyPath}
              title={isZh ? '复制文件路径' : 'Copy path'}
            >
              <AppIcon name="copy" size={13} />
              <span>{isZh ? '复制路径' : 'Copy path'}</span>
            </button>
          )}

          {notice.action && (
            <button
              type="button"
              className="shiin-toast-action-btn primary"
              onClick={() => {
                notice.action?.onClick()
                onDismiss(notice.id)
              }}
            >
              {notice.action.icon && <AppIcon name={notice.action.icon} size={13} />}
              <span>{notice.action.label}</span>
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        className="shiin-screenshot-toast__close"
        onClick={() => onDismiss(notice.id)}
        aria-label="关闭提示"
        title="关闭"
      >
        <AppIcon name="close" size={14} />
      </button>
    </motion.div>
  )
}
