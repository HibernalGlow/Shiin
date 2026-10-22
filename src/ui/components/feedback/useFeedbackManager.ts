import * as React from 'react'
import type { ScreenshotResult } from '../../../core/types.js'
import type { FeedbackNotice, FeedbackSeverity } from './FeedbackTypes.js'

const DEFAULT_OPERATION_DURATION = 4000
const DEFAULT_SCREENSHOT_DURATION = 4500

interface TimerRecord {
  timeoutId: ReturnType<typeof setTimeout> | null
  startTime: number
  remaining: number
  paused: boolean
}

export function useFeedbackManager(locale: string = 'zh') {
  const [notices, setNotices] = React.useState<FeedbackNotice[]>([])
  const timersRef = React.useRef<Map<string, TimerRecord>>(new Map())
  const isZh = locale.startsWith('zh')

  const dismiss = React.useCallback((id: string) => {
    const record = timersRef.current.get(id)
    if (record?.timeoutId) {
      clearTimeout(record.timeoutId)
    }
    timersRef.current.delete(id)
    setNotices((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const startTimer = React.useCallback(
    (id: string, duration: number) => {
      if (duration <= 0) return

      const existing = timersRef.current.get(id)
      if (existing?.timeoutId) {
        clearTimeout(existing.timeoutId)
      }

      const timeoutId = setTimeout(() => {
        dismiss(id)
      }, duration)

      timersRef.current.set(id, {
        timeoutId,
        startTime: Date.now(),
        remaining: duration,
        paused: false,
      })
    },
    [dismiss]
  )

  const pauseTimer = React.useCallback((id: string) => {
    const record = timersRef.current.get(id)
    if (!record || record.paused || !record.timeoutId) return

    clearTimeout(record.timeoutId)
    const elapsed = Date.now() - record.startTime
    const remaining = Math.max(500, record.remaining - elapsed)

    timersRef.current.set(id, {
      timeoutId: null,
      startTime: 0,
      remaining,
      paused: true,
    })
  }, [])

  const resumeTimer = React.useCallback(
    (id: string) => {
      const record = timersRef.current.get(id)
      if (!record || !record.paused) return

      const timeoutId = setTimeout(() => {
        dismiss(id)
      }, record.remaining)

      timersRef.current.set(id, {
        timeoutId,
        startTime: Date.now(),
        remaining: record.remaining,
        paused: false,
      })
    },
    [dismiss]
  )

  const showNotice = React.useCallback(
    (messageOrNotice: string | Partial<FeedbackNotice>, options?: Partial<FeedbackNotice>) => {
      const message = typeof messageOrNotice === 'string' ? messageOrNotice : messageOrNotice.message || ''
      if (!message.trim()) return

      const overrides = typeof messageOrNotice === 'object' ? messageOrNotice : (options || {})
      const id = overrides.id || `notice-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

      let severity: FeedbackSeverity = overrides.severity || 'info'
      if (!overrides.severity) {
        if (/失败|错误|error|failed|fault/i.test(message)) severity = 'error'
        else if (/缺少|待授权|未检测|warn|missing|required/i.test(message)) severity = 'warning'
        else if (/已激活|成功|完成|已保存|saved|active|success/i.test(message)) severity = 'success'
      }

      const duration = overrides.duration !== undefined ? overrides.duration : DEFAULT_OPERATION_DURATION

      const item: FeedbackNotice = {
        id,
        kind: overrides.kind || 'operation',
        severity,
        title: overrides.title,
        message,
        timestamp: Date.now(),
        duration,
        action: overrides.action,
        actions: overrides.actions,
      }

      // Keep at most 1 operational toast and 1 task/screenshot at a time to prevent stacking clutter
      setNotices((prev) => {
        const filtered = prev.filter((n) => n.kind !== 'operation')
        return [...filtered, item]
      })

      if (duration > 0) {
        startTimer(id, duration)
      }

      return id
    },
    [startTimer]
  )

  const showScreenshot = React.useCallback(
    (result: ScreenshotResult) => {
      if (!result) return

      if (!result.ok) {
        showNotice({
          kind: 'operation',
          severity: 'error',
          title: isZh ? '截图未完成' : 'Capture failed',
          message: result.error || (isZh ? '无法捕获屏幕内容' : 'Screen capture failed'),
          duration: 5000,
        })
        return
      }

      // Check for existing active screenshot notice to deduplicate
      setNotices((prev) => {
        const existingIndex = prev.findIndex((n) => n.kind === 'screenshot')
        if (existingIndex >= 0) {
          const existing = prev[existingIndex]
          const newCount = (existing.captureCount || 1) + 1
          const updated: FeedbackNotice = {
            ...existing,
            id: existing.id,
            timestamp: Date.now(),
            filePath: result.filePath,
            format: result.format || 'png',
            captureCount: newCount,
            title: isZh ? '截图已保存' : 'Screenshot Saved',
            message: result.filePath || '',
          }
          startTimer(existing.id, DEFAULT_SCREENSHOT_DURATION)
          const next = [...prev]
          next[existingIndex] = updated
          return next
        }

        const id = `shot-${Date.now()}`
        const item: FeedbackNotice = {
          id,
          kind: 'screenshot',
          severity: 'success',
          title: isZh ? '截图已保存' : 'Screenshot Saved',
          message: result.filePath || '',
          filePath: result.filePath,
          format: result.format || 'png',
          timestamp: Date.now(),
          duration: DEFAULT_SCREENSHOT_DURATION,
          captureCount: 1,
        }
        startTimer(id, DEFAULT_SCREENSHOT_DURATION)
        // Keep screenshot and any operational toast
        return [...prev.filter((n) => n.kind !== 'screenshot'), item]
      })
    },
    [isZh, showNotice, startTimer]
  )

  const showTask = React.useCallback((task: Partial<FeedbackNotice>) => {
    const id = task.id || `task-${Date.now()}`
    const item: FeedbackNotice = {
      id,
      kind: 'task',
      severity: task.severity || 'warning',
      title: task.title,
      message: task.message || '',
      timestamp: Date.now(),
      duration: 0,
      action: task.action,
      actions: task.actions,
    }
    setNotices((prev) => [...prev.filter((n) => n.kind !== 'task'), item])
  }, [])

  return {
    notices,
    showNotice,
    showScreenshot,
    showTask,
    dismiss,
    pauseTimer,
    resumeTimer,
  }
}
