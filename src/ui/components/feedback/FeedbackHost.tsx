import * as React from 'react'
import { AnimatePresence } from 'motion/react'
import type { FeedbackNotice } from './FeedbackTypes.js'
import { OperationalToast } from './OperationalToast.js'
import { ScreenshotToast } from './ScreenshotToast.js'
import { TaskBanner } from './TaskBanner.js'

export interface FeedbackHostProps {
  notices: FeedbackNotice[]
  locale?: string
  theme?: 'light' | 'dark'
  onDismiss: (id: string) => void
  onOpenFolder?: () => void
  onPauseTimer?: (id: string) => void
  onResumeTimer?: (id: string) => void
}

export const FeedbackHost: React.FC<FeedbackHostProps> = ({
  notices,
  locale = 'zh',
  theme,
  onDismiss,
  onOpenFolder,
  onPauseTimer,
  onResumeTimer,
}) => {
  return (
    <aside
      className="shiin-feedback-host"
      data-theme={theme}
      aria-label={locale.startsWith('zh') ? '系统反馈通知' : 'System notifications'}
      role="region"
    >
      <AnimatePresence initial={false} mode="sync">
        {notices.map((notice) => {
          if (notice.kind === 'screenshot') {
            return (
              <ScreenshotToast
                key={notice.id}
                notice={notice}
                locale={locale}
                theme={theme}
                onDismiss={onDismiss}
                onOpenFolder={onOpenFolder}
                onPointerEnter={() => onPauseTimer?.(notice.id)}
                onPointerLeave={() => onResumeTimer?.(notice.id)}
              />
            )
          }

          if (notice.kind === 'task') {
            return (
              <TaskBanner
                key={notice.id}
                notice={notice}
                theme={theme}
                onDismiss={onDismiss}
              />
            )
          }

          return (
            <OperationalToast
              key={notice.id}
              notice={notice}
              theme={theme}
              onDismiss={onDismiss}
              onPointerEnter={() => onPauseTimer?.(notice.id)}
              onPointerLeave={() => onResumeTimer?.(notice.id)}
            />
          )
        })}
      </AnimatePresence>
    </aside>
  )
}
