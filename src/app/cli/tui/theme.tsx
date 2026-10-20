import * as React from 'react'

export interface TerminalTheme {
  name: string
  colors: {
    primary: string
    foreground: string
    mutedForeground: string
    border: string
    focusRing: string
    surface: string
    success: string
    warning: string
    error: string
  }
}

type Palette = Omit<TerminalTheme['colors'], 'focusRing' | 'surface'> & { focusRing?: string; surface?: string }

/**
 * 主题表：与 Xaihi 的 `tui/theme.tsx` 同一形状（renderer-neutral，只有颜色，不含组件）。
 * 默认 nord——不是为了好看，是因为它在深色与浅色终端里对比度都不会塌。
 */
const palettes: readonly [string, Palette][] = [
  ['nord', { primary: '#88C0D0', foreground: '#ECEFF4', mutedForeground: '#7B88A1', border: '#4C566A', focusRing: '#8FBCBB', success: '#A3BE8C', warning: '#EBCB8B', error: '#BF616A' }],
  ['dracula', { primary: '#BD93F9', foreground: '#F8F8F2', mutedForeground: '#6272A4', border: '#6272A4', focusRing: '#FF79C6', success: '#50FA7B', warning: '#F1FA8C', error: '#FF5555' }],
  ['tokyo-night', { primary: '#7AA2F7', foreground: '#C0CAF5', mutedForeground: '#565F89', border: '#3B4261', focusRing: '#BB9AF7', success: '#9ECE6A', warning: '#E0AF68', error: '#F7768E' }],
  ['catppuccin', { primary: '#CBA6F7', foreground: '#CDD6F4', mutedForeground: '#6C7086', border: '#45475A', focusRing: '#89B4FA', success: '#A6E3A1', warning: '#F9E2AF', error: '#F38BA8' }],
  ['gruvbox', { primary: '#83A598', foreground: '#EBDBB2', mutedForeground: '#928374', border: '#504945', focusRing: '#FABD2F', success: '#B8BB26', warning: '#FABD2F', error: '#FB4934' }],
  ['matrix', { primary: '#2EFF6A', foreground: '#62FF94', mutedForeground: '#8CA391', border: '#1F3A2A', focusRing: '#C770FF', success: '#62FF94', warning: '#E6FF57', error: '#FF4B4B' }],
  ['high-contrast-light', { primary: '#000000', foreground: '#000000', mutedForeground: '#444444', border: '#000000', focusRing: '#0000CC', success: '#006600', warning: '#884400', error: '#CC0000' }],
]

function asTheme([name, colors]: readonly [string, Palette]): TerminalTheme {
  return {
    name,
    colors: {
      ...colors,
      focusRing: colors.focusRing ?? colors.primary,
      surface: colors.surface ?? 'transparent',
    },
  }
}

const themes = palettes.map(asTheme)
export const defaultTheme = themes[0]!

const registry = new Map(themes.map((theme) => [theme.name, theme]))

export function listThemes(): readonly string[] {
  return [...registry.keys()]
}

export function resolveTheme(name?: string): TerminalTheme {
  return registry.get(name?.toLowerCase() ?? defaultTheme.name) ?? defaultTheme
}

export function registerTheme(theme: TerminalTheme): void {
  registry.set(theme.name.toLowerCase(), theme)
}

const ThemeContext = React.createContext<TerminalTheme>(defaultTheme)

export function TerminalThemeProvider({ children, theme }: { children: React.ReactNode; theme: TerminalTheme }): React.ReactNode {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export function useTerminalTheme(): TerminalTheme {
  return React.useContext(ThemeContext)
}
