/**
 * 管道面的排版：boxen 画框、chalk 上色、string-width 量宽。
 *
 * 与 Xaihi `packages/cli-runtime/src/index.ts` 的 `rich` / `renderRichPanel` /
 * `renderProgressBar` 同一口径，原因很实际：`gd`（引导式）与 `pipe`（纯命令行）
 * 是同一个使用者在同一个终端里读的两条腿，边框与进度条不该长得像两个工具。
 */

import boxen from 'boxen'
import { Chalk } from 'chalk'
import stringWidth from 'string-width'

import { terminalColumns, type CliHost } from './host.js'

export type RichColor = 'blue' | 'cyan' | 'green' | 'grey' | 'magenta' | 'red' | 'white' | 'yellow'
export type RichStyle = RichColor | 'bold' | 'dim' | 'inverse'

function shouldColor(host: CliHost): boolean {
  if (host.env.NO_COLOR !== undefined) return false
  if (host.env.FORCE_COLOR && host.env.FORCE_COLOR !== '0') return true
  return Boolean(host.stdout.isTTY)
}

function applyStyle(host: CliHost, text: string, style: RichStyle): string {
  const chalk = new Chalk({ level: shouldColor(host) ? 3 : 0 })
  switch (style) {
    case 'blue': return chalk.blueBright(text)
    case 'cyan': return chalk.cyanBright(text)
    case 'green': return chalk.greenBright(text)
    case 'grey': return chalk.gray(text)
    case 'magenta': return chalk.magentaBright(text)
    case 'red': return chalk.redBright(text)
    case 'white': return chalk.whiteBright(text)
    case 'yellow': return chalk.yellowBright(text)
    case 'bold': return chalk.bold(text)
    case 'dim': return chalk.dim(text)
    case 'inverse': return chalk.inverse(text)
  }
}

export function rich(host: CliHost, text: string, ...styles: RichStyle[]): string {
  if (styles.length === 0) return text
  return styles.reduce((value, style) => applyStyle(host, value, style), text)
}

export function stripAnsi(text: string): string {
  return text.replace(/\u001b\[[0-9;]*m/g, '')
}

export function visibleWidth(text: string): number {
  return stringWidth(stripAnsi(text))
}

export function truncateVisible(text: string, maxWidth: number): string {
  if (maxWidth <= 0) return ''
  if (maxWidth === 1) return visibleWidth(text) > 1 ? '…' : text
  if (visibleWidth(text) <= maxWidth) return text
  let width = 0
  let result = ''
  for (const char of Array.from(text)) {
    const nextWidth = stringWidth(char)
    if (width + nextWidth > maxWidth - 1) break
    result += char
    width += nextWidth
  }
  return `${result}…`
}

export function padVisibleEnd(text: string, targetWidth: number): string {
  return `${text}${' '.repeat(Math.max(0, targetWidth - visibleWidth(text)))}`
}

function boxenColor(color: RichColor): 'blue' | 'cyan' | 'gray' | 'green' | 'magenta' | 'red' | 'white' | 'yellow' {
  return color === 'grey' ? 'gray' : color
}

export interface PanelOptions {
  color?: RichColor
  maxWidth?: number
  minWidth?: number
}

/** 圆角框，宽度按终端列数收口；内容超宽按可见宽度截断而不是按字符数。 */
export function renderPanel(host: CliHost, title: string, lines: string[] | string, options: PanelOptions = {}): string {
  const color = options.color ?? 'blue'
  const content = Array.isArray(lines) ? lines : lines.split(/\r?\n/)
  const minWidth = options.minWidth ?? 0
  const maxWidth = Math.max(24, options.maxWidth ?? terminalColumns(host) - 2)
  const requestedContentWidth = Math.max(minWidth, ...content.map((line) => visibleWidth(line)))
  const width = Math.min(maxWidth, requestedContentWidth + 4)
  const innerWidth = Math.max(1, width - 4)
  const displayLines = content.map((line) => truncateVisible(line, innerWidth))
  return boxen(displayLines.join('\n'), {
    borderColor: boxenColor(color),
    borderStyle: 'round',
    padding: { left: 1, right: 1, top: 0, bottom: 0 },
    title,
    width,
  })
}

export function writePanel(host: CliHost, title: string, lines: string[] | string, options: PanelOptions = {}): void {
  host.stdout.write(`${renderPanel(host, title, lines, options)}\n`)
}

export function renderProgressBar(
  host: CliHost,
  progress: number,
  message: string,
  options: { width?: number; label?: string } = {},
): string {
  const value = Math.max(0, Math.min(100, Math.round(progress)))
  const columns = terminalColumns(host)
  const label = options.label ? `${rich(host, options.label, 'blue', 'bold')} ` : ''
  const percent = rich(host, `${value.toString().padStart(3)}%`, 'yellow')
  let width = options.width ?? 32
  if (!options.width) {
    const fixedWidth = visibleWidth(label) + width + 1 + visibleWidth(percent) + 1
    const messageBudget = columns - fixedWidth
    if (messageBudget < 18) width = Math.max(8, width - (18 - messageBudget))
  }
  const filled = Math.round((value / 100) * width)
  const empty = Math.max(0, width - filled)
  const bar = `${rich(host, '━'.repeat(filled), 'cyan')}${rich(host, '─'.repeat(empty), 'grey')}`
  const prefix = `${label}${bar} ${percent} `
  return `${prefix}${truncateVisible(message, Math.max(0, columns - visibleWidth(prefix)))}`
}

/**
 * 轻量表格：列宽按内容与表头取最大值，逐列补齐可见宽度。
 * 这里刻意不上色——表格要先进 `renderPanel` 做截断，而按字符截断 ANSI 串会把颜色切坏。
 */
export function renderTable(
  columns: readonly { id: string; label: string }[],
  rows: readonly Record<string, string>[],
  emptyMessage = '（空）',
): string[] {
  if (rows.length === 0) return [emptyMessage]
  const widths = columns.map((column) =>
    Math.max(visibleWidth(column.label), ...rows.map((row) => visibleWidth(row[column.id] ?? ''))),
  )
  const header = columns.map((column, index) => padVisibleEnd(column.label, widths[index] ?? 0)).join('  ')
  const separator = widths.map((width) => '─'.repeat(width)).join('──')
  const body = rows.map((row) =>
    columns.map((column, index) => padVisibleEnd(row[column.id] ?? '', widths[index] ?? 0)).join('  '),
  )
  return [header, separator, ...body]
}
