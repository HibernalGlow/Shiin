/* @jsxImportSource @opentui/react */
import { useState, type ReactNode } from 'react'

import { icon } from './icons.js'
import { useTerminalTheme } from './theme.js'

export function Panel({
  title,
  description,
  children,
  width,
  height,
  flexGrow,
  headerActions,
}: {
  title: string
  description?: string
  children: ReactNode
  width?: number | `${number}%`
  height?: number
  flexGrow?: number
  headerActions?: ReactNode
}): ReactNode {
  const theme = useTerminalTheme()
  return (
    <box
      flexDirection="column"
      borderStyle="rounded"
      borderColor={theme.colors.border}
      paddingLeft={1}
      paddingRight={1}
      width={width}
      height={height}
      flexGrow={flexGrow}
      flexShrink={width || height ? 0 : undefined}
      minWidth={0}
      minHeight={0}
      overflow="hidden"
    >
      {title ? (
        <box flexShrink={0} flexDirection="row" justifyContent="space-between">
          <text fg={theme.colors.primary}>
            <b>{`${icon('section')} ${title}`}</b>
          </text>
          {headerActions}
        </box>
      ) : null}
      {description ? (
        <box flexShrink={0}>
          <text fg={theme.colors.mutedForeground}>{description}</text>
        </box>
      ) : null}
      <box flexDirection="column" marginTop={title || description ? 1 : 0} flexGrow={1} minHeight={0} overflow="hidden">
        {children}
      </box>
    </box>
  )
}

export function Button({
  id,
  children,
  onPress,
  focused,
  danger,
  disabled,
  width,
}: {
  id?: string
  children: string
  onPress: () => void
  focused?: boolean
  danger?: boolean
  disabled?: boolean
  width?: number
}): ReactNode {
  const theme = useTerminalTheme()
  const [hovered, setHovered] = useState(false)
  const color = disabled
    ? theme.colors.mutedForeground
    : danger
      ? theme.colors.error
      : focused || hovered
        ? theme.colors.focusRing
        : theme.colors.foreground
  return (
    <box
      id={id}
      width={width}
      height={3}
      flexShrink={0}
      borderStyle="rounded"
      borderColor={color}
      paddingLeft={1}
      paddingRight={1}
      justifyContent="center"
      alignItems="center"
      onMouseDown={disabled ? undefined : onPress}
      onMouseOver={disabled ? undefined : () => setHovered(true)}
      onMouseOut={disabled ? undefined : () => setHovered(false)}
    >
      <text fg={color}>{focused || hovered ? <b>{children}</b> : children}</text>
    </box>
  )
}

export function Chip({
  children,
  onPress,
  selected,
  focused,
  disabled,
  marker,
}: {
  children: string
  onPress: () => void
  selected?: boolean
  focused?: boolean
  disabled?: boolean
  /** 可选列表用 ●/○ 标记；动作入口不加标记，避免看起来像单选项。 */
  marker?: boolean
}): ReactNode {
  const theme = useTerminalTheme()
  const [hovered, setHovered] = useState(false)
  const active = selected || focused || hovered
  const color = disabled ? theme.colors.mutedForeground : active ? theme.colors.focusRing : theme.colors.mutedForeground
  const label = marker ? `${selected ? '●' : '○'} ${children}` : children
  return (
    <box
      height={1}
      paddingLeft={1}
      paddingRight={1}
      onMouseDown={disabled ? undefined : onPress}
      onMouseOver={disabled ? undefined : () => setHovered(true)}
      onMouseOut={disabled ? undefined : () => setHovered(false)}
    >
      <text fg={color}>{active ? <b>{label}</b> : label}</text>
    </box>
  )
}

/** 单键提示：`[Space]` 这种，让快捷键在界面里读得回来。 */
export function KeyHint({ keys, label }: { keys: string; label: string }): ReactNode {
  const theme = useTerminalTheme()
  return (
    <box flexDirection="row" gap={1} flexShrink={0}>
      <text fg={theme.colors.focusRing}>
        <b>{`[${keys}]`}</b>
      </text>
      <text fg={theme.colors.mutedForeground}>{label}</text>
    </box>
  )
}

const GAUGE_CELLS = 14

export function AxisGauge({ label, value }: { label: string; value: number }): ReactNode {
  const theme = useTerminalTheme()
  const clamped = Math.max(-1, Math.min(1, Number.isFinite(value) ? value : 0))
  const magnitude = Math.abs(clamped)
  const filled = Math.round(magnitude * GAUGE_CELLS)
  const color = magnitude > 0.8 ? theme.colors.warning : magnitude > 0.15 ? theme.colors.primary : theme.colors.mutedForeground
  const bar = `${'█'.repeat(filled)}${'░'.repeat(GAUGE_CELLS - filled)}`
  const sign = clamped >= 0 ? '+' : '-'
  return (
    <box flexDirection="row" justifyContent="space-between" flexShrink={0}>
      <box flexDirection="row" gap={1}>
        <text fg={theme.colors.mutedForeground}>{label.padEnd(6, ' ')}</text>
        <text fg={color}>{bar}</text>
      </box>
      <text fg={color}>{`${sign}${magnitude.toFixed(2)}`}</text>
    </box>
  )
}

export function KeyCap({ label, pressed }: { label: string; pressed: boolean }): ReactNode {
  const theme = useTerminalTheme()
  return (
    <box
      width={6}
      height={3}
      borderStyle={pressed ? 'double' : 'single'}
      borderColor={pressed ? theme.colors.success : theme.colors.border}
      justifyContent="center"
      alignItems="center"
      flexShrink={0}
    >
      <text fg={pressed ? theme.colors.success : theme.colors.mutedForeground}>
        {pressed ? <b>{label}</b> : label}
      </text>
    </box>
  )
}

/** 一行内的 `标签 值`：比 space-between 的宽表格更省横向空间，也更像终端里的读法。 */
export function InlineMetric({ label, value, tone }: { label: string; value: string; tone?: 'success' | 'warning' | 'error' | 'muted' }): ReactNode {
  const theme = useTerminalTheme()
  const color =
    tone === 'success'
      ? theme.colors.success
      : tone === 'warning'
        ? theme.colors.warning
        : tone === 'error'
          ? theme.colors.error
          : theme.colors.foreground
  return (
    <box flexDirection="row" gap={1} flexShrink={0}>
      <text fg={theme.colors.mutedForeground}>{label}</text>
      <text fg={color}>
        <b>{value}</b>
      </text>
    </box>
  )
}

