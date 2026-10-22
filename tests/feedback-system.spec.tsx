import { describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { OperationalToast } from '../src/ui/components/feedback/OperationalToast.js'
import { ScreenshotToast } from '../src/ui/components/feedback/ScreenshotToast.js'
import { TaskBanner } from '../src/ui/components/feedback/TaskBanner.js'
import { FeedbackHost } from '../src/ui/components/feedback/FeedbackHost.js'
import { ScreenCornerPicker } from '../src/ui/components/ScreenCornerPicker.js'
import type { FeedbackNotice } from '../src/ui/components/feedback/FeedbackTypes.js'
import { resolveEffectiveTheme } from '../src/ui/useTheme.js'

describe('MD3 Expressive Feedback Components', () => {
  it('renders OperationalToast with semantic severity and accessibility attributes', () => {
    const notice: FeedbackNotice = {
      id: 'test-1',
      kind: 'operation',
      severity: 'info',
      message: '后台监听已停止',
      timestamp: Date.now(),
      duration: 4000,
    }

    const html = renderToString(
      React.createElement(OperationalToast, {
        notice,
        onDismiss: vi.fn(),
      })
    )

    expect(html).toContain('shiin-toast-pill')
    expect(html).toContain('后台监听已停止')
    expect(html).toContain('role="status"')
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('data-severity="info"')
  })

  it('renders OperationalToast with action button when action is provided', () => {
    const notice: FeedbackNotice = {
      id: 'test-2',
      kind: 'operation',
      severity: 'success',
      message: '配置已保存',
      timestamp: Date.now(),
      action: {
        label: '查看',
        onClick: vi.fn(),
      },
    }

    const html = renderToString(
      React.createElement(OperationalToast, {
        notice,
        onDismiss: vi.fn(),
      })
    )

    expect(html).toContain('配置已保存')
    expect(html).toContain('shiin-toast-pill__action')
    expect(html).toContain('查看')
  })

  it('renders ScreenshotToast with format tag, timestamp, and action buttons', () => {
    const notice: FeedbackNotice = {
      id: 'shot-1',
      kind: 'screenshot',
      severity: 'success',
      title: '截图已保存',
      message: '/tmp/shots/Screenshot_20261022.png',
      filePath: '/tmp/shots/Screenshot_20261022.png',
      format: 'png',
      timestamp: 1729600000000,
      captureCount: 3,
    }

    const html = renderToString(
      React.createElement(ScreenshotToast, {
        notice,
        locale: 'zh',
        onDismiss: vi.fn(),
        onOpenFolder: vi.fn(),
      })
    )

    expect(html).toContain('shiin-screenshot-toast')
    expect(html).toContain('截图已保存')
    expect(html).toContain('第 3 张')
    expect(html).toContain('PNG')
    expect(html).toContain('Screenshot_20261022.png')
    expect(html).toContain('打开目录')
    expect(html).toContain('复制路径')
  })

  it('renders TaskBanner for system authorization and permission needs', () => {
    const notice: FeedbackNotice = {
      id: 'task-1',
      kind: 'task',
      severity: 'warning',
      title: '需要屏幕录制权限',
      message: '授权后才能捕获屏幕画面。请在系统设置中允许 Shiin。',
      timestamp: Date.now(),
      action: {
        label: '打开系统设置',
        onClick: vi.fn(),
      },
    }

    const html = renderToString(
      React.createElement(TaskBanner, {
        notice,
        onDismiss: vi.fn(),
      })
    )

    expect(html).toContain('shiin-task-banner')
    expect(html).toContain('需要屏幕录制权限')
    expect(html).toContain('打开系统设置')
    expect(html).toContain('稍后提醒')
    expect(html).toContain('role="alert"')
  })

  it('renders ScreenCornerPicker with 4 interactive corners and active chip', () => {
    const html = renderToString(
      React.createElement(ScreenCornerPicker, {
        value: 'top-right',
        onChange: vi.fn(),
        locale: 'zh',
      })
    )

    expect(html).toContain('sb-screen-corner-picker')
    expect(html).toContain('sb-screen-mockup')
    expect(html).toContain('sb-screen-corner-hotspot--top-right')
    expect(html).toContain('sb-screen-corner-hotspot--top-left')
    expect(html).toContain('sb-screen-corner-hotspot--bottom-right')
    expect(html).toContain('sb-screen-corner-hotspot--bottom-left')
    expect(html).toContain('右上角')
    expect(html).toContain('左上角')
    expect(html).toContain('推荐')
  })

  it('supports light and dark theme recognition across OperationalToast', () => {
    const notice: FeedbackNotice = {
      id: 'theme-test-1',
      kind: 'operation',
      severity: 'success',
      message: '后台监听已激活',
      timestamp: Date.now(),
    }

    const lightHtml = renderToString(
      React.createElement(OperationalToast, {
        notice,
        theme: 'light',
        onDismiss: vi.fn(),
      })
    )
    expect(lightHtml).toContain('data-theme="light"')

    const darkHtml = renderToString(
      React.createElement(OperationalToast, {
        notice,
        theme: 'dark',
        onDismiss: vi.fn(),
      })
    )
    expect(darkHtml).toContain('data-theme="dark"')
  })

  it('supports light and dark theme recognition across ScreenshotToast', () => {
    const notice: FeedbackNotice = {
      id: 'shot-theme-1',
      kind: 'screenshot',
      severity: 'success',
      title: '截图已保存',
      message: 'shot.png',
      timestamp: Date.now(),
    }

    const lightHtml = renderToString(
      React.createElement(ScreenshotToast, {
        notice,
        theme: 'light',
        onDismiss: vi.fn(),
      })
    )
    expect(lightHtml).toContain('data-theme="light"')

    const darkHtml = renderToString(
      React.createElement(ScreenshotToast, {
        notice,
        theme: 'dark',
        onDismiss: vi.fn(),
      })
    )
    expect(darkHtml).toContain('data-theme="dark"')
  })

  it('supports light and dark theme recognition across TaskBanner and FeedbackHost', () => {
    const taskNotice: FeedbackNotice = {
      id: 'task-theme-1',
      kind: 'task',
      severity: 'warning',
      title: '需要屏幕录制权限',
      message: '请前往系统设置允许',
      timestamp: Date.now(),
    }

    const hostHtmlLight = renderToString(
      React.createElement(FeedbackHost, {
        notices: [taskNotice],
        theme: 'light',
        onDismiss: vi.fn(),
      })
    )
    expect(hostHtmlLight).toContain('shiin-feedback-host')
    expect(hostHtmlLight).toContain('data-theme="light"')

    const hostHtmlDark = renderToString(
      React.createElement(FeedbackHost, {
        notices: [taskNotice],
        theme: 'dark',
        onDismiss: vi.fn(),
      })
    )
    expect(hostHtmlDark).toContain('data-theme="dark"')
  })

  it('correctly resolves theme preference with resolveEffectiveTheme', () => {
    expect(resolveEffectiveTheme('light')).toBe('light')
    expect(resolveEffectiveTheme('dark')).toBe('dark')

    // In Node test environment without window.matchMedia: defaults to light
    expect(resolveEffectiveTheme('auto')).toBe('light')
    expect(resolveEffectiveTheme(null)).toBe('light')
    expect(resolveEffectiveTheme(undefined)).toBe('light')
  })
})
