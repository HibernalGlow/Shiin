import * as React from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { AppIcon } from '../AppIcon.js'
import type { FeedbackNotice } from './FeedbackTypes.js'

export interface OperationalToastProps {
  notice: FeedbackNotice
  theme?: 'light' | 'dark'
  onDismiss: (id: string) => void
  onPointerEnter?: () => void
  onPointerLeave?: () => void
}

export const OperationalToast: React.FC<OperationalToastProps> = ({
  notice,
  theme,
  onDismiss,
  onPointerEnter,
  onPointerLeave,
}) => {
  const reduced = useReducedMotion()

  const iconName = React.useMemo(() => {
    if (notice.severity === 'success') return 'check'
    if (notice.severity === 'error' || notice.severity === 'warning') return 'alert'
    if (/停止|pause|stop/i.test(notice.message)) return 'stop'
    if (/激活|开启|start|active/i.test(notice.message)) return 'play'
    if (/目录|folder/i.test(notice.message)) return 'folder'
    if (/形状|shape/i.test(notice.message)) return 'dice'
    return 'info'
  }, [notice.severity, notice.message])

  return (
    <motion.div
      layout="position"
      className="shiin-toast-pill"
      data-theme={theme}
      data-severity={notice.severity}
      data-kind={notice.kind}
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: reduced ? 0 : 12, scale: reduced ? 1 : 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: reduced ? 0 : 8, scale: reduced ? 1 : 0.94 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onFocus={onPointerEnter}
      onBlur={onPointerLeave}
    >
      <span className="shiin-toast-pill__icon" aria-hidden="true">
        <AppIcon name={iconName} size={16} strokeWidth={2.2} />
      </span>

      <span className="shiin-toast-pill__content">
        {notice.title && <strong className="shiin-toast-pill__title">{notice.title}</strong>}
        <span className="shiin-toast-pill__message">{notice.message}</span>
      </span>

      {notice.action && (
        <button
          type="button"
          className="shiin-toast-pill__action"
          onClick={() => {
            notice.action?.onClick()
            onDismiss(notice.id)
          }}
        >
          {notice.action.icon && <AppIcon name={notice.action.icon} size={13} />}
          <span>{notice.action.label}</span>
        </button>
      )}

      <button
        type="button"
        className="shiin-toast-pill__close"
        onClick={() => onDismiss(notice.id)}
        aria-label="关闭提示"
        title="关闭"
      >
        <AppIcon name="close" size={14} />
      </button>
    </motion.div>
  )
}
