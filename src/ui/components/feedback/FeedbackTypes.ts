import type { ScreenshotResult } from '../../../core/types.js'

export type FeedbackKind = 'operation' | 'screenshot' | 'persistent' | 'task'

export type FeedbackSeverity = 'info' | 'success' | 'warning' | 'error'

export type EffectiveTheme = 'light' | 'dark'

export interface FeedbackAction {
  label: string
  onClick: () => void
  icon?: string
  primary?: boolean
}

export interface FeedbackNotice {
  id: string
  kind: FeedbackKind
  severity: FeedbackSeverity
  title?: string
  message: string
  timestamp: number
  duration?: number // ms, 0 means persistent until user action/dismiss
  action?: FeedbackAction
  actions?: FeedbackAction[]
  result?: ScreenshotResult
  captureCount?: number
  filePath?: string | null
  format?: string
  appName?: string
  windowTitle?: string
}
