import * as React from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { AppIcon } from '../AppIcon.js'
import type { FeedbackNotice } from './FeedbackTypes.js'

export interface TaskBannerProps {
  notice: FeedbackNotice
  theme?: 'light' | 'dark'
  onDismiss: (id: string) => void
}

export const TaskBanner: React.FC<TaskBannerProps> = ({ notice, theme, onDismiss }) => {
  const reduced = useReducedMotion()

  return (
    <motion.div
      layout="position"
      className="shiin-task-banner"
      data-theme={theme}
      data-kind="task"
      role="alert"
      initial={{ opacity: 0, y: reduced ? 0 : 16, scale: reduced ? 1 : 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: reduced ? 0 : 8, scale: reduced ? 1 : 0.92 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
    >
      <div className="shiin-task-banner__icon">
        <AppIcon name="shield" size={20} strokeWidth={2.2} />
      </div>

      <div className="shiin-task-banner__body">
        <strong className="shiin-task-banner__title">{notice.title || '需要系统授权'}</strong>
        <p className="shiin-task-banner__message">{notice.message}</p>

        <div className="shiin-task-banner__actions">
          {notice.action && (
            <button
              type="button"
              className="shiin-task-banner__primary-btn"
              onClick={() => {
                notice.action?.onClick()
                onDismiss(notice.id)
              }}
            >
              {notice.action.icon && <AppIcon name={notice.action.icon} size={14} />}
              <span>{notice.action.label}</span>
            </button>
          )}

          {notice.actions?.map((act, index) => (
            <button
              key={index}
              type="button"
              className={`shiin-task-banner__action-btn ${act.primary ? 'primary' : ''}`}
              onClick={() => {
                act.onClick()
                onDismiss(notice.id)
              }}
            >
              {act.icon && <AppIcon name={act.icon} size={14} />}
              <span>{act.label}</span>
            </button>
          ))}

          <button
            type="button"
            className="shiin-task-banner__secondary-btn"
            onClick={() => onDismiss(notice.id)}
          >
            稍后提醒
          </button>
        </div>
      </div>

      <button
        type="button"
        className="shiin-task-banner__close"
        onClick={() => onDismiss(notice.id)}
        aria-label="关闭提示"
        title="关闭"
      >
        <AppIcon name="close" size={14} />
      </button>
    </motion.div>
  )
}
