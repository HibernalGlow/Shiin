import * as React from 'react'
import type { EffectiveTheme } from './components/feedback/FeedbackTypes.js'

export type ThemePreference = 'light' | 'dark' | 'auto'

/**
 * 纯函数：根据配置的主题项与系统 prefers-color-scheme 裁决当前生效的深浅主题。
 */
export function resolveEffectiveTheme(themeSetting?: string | null): EffectiveTheme {
  if (themeSetting === 'dark') return 'dark'
  if (themeSetting === 'light') return 'light'

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    try {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return isDark ? 'dark' : 'light'
    } catch {
      return 'light'
    }
  }

  return 'light'
}

/**
 * React 钩子：实时监听系统深浅色切换及配置变更，同步 document 属性并返回生效主题。
 */
export function useTheme(themeSetting?: ThemePreference): EffectiveTheme {
  const [systemIsDark, setSystemIsDark] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      try {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
      } catch {
        return false
      }
    }
    return false
  })

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return

    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const onChange = (e: MediaQueryListEvent) => {
        setSystemIsDark(e.matches)
      }

      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', onChange)
        return () => mediaQuery.removeEventListener('change', onChange)
      } else if (typeof (mediaQuery as any).addListener === 'function') {
        ;(mediaQuery as any).addListener(onChange)
        return () => (mediaQuery as any).removeListener(onChange)
      }
    } catch {
      // 容错处理（某些测试或极简环境可能无完整 MediaQueryList 支持）
    }
  }, [])

  const effectiveTheme: EffectiveTheme = React.useMemo(() => {
    if (themeSetting === 'dark') return 'dark'
    if (themeSetting === 'light') return 'light'
    return systemIsDark ? 'dark' : 'light'
  }, [themeSetting, systemIsDark])

  React.useEffect(() => {
    if (typeof document === 'undefined') return
    try {
      document.documentElement.setAttribute('data-theme', effectiveTheme)
      document.documentElement.style.colorScheme = effectiveTheme
    } catch {
      // ignore
    }
  }, [effectiveTheme])

  return effectiveTheme
}
