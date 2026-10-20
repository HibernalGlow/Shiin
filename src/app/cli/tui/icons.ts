/**
 * 语义图标：只用 Unicode 基本区与常见符号，不引 nerd font（Windows Terminal 默认字体缺字形会变豆腐块）。
 */

export type IconName =
  | 'action'
  | 'camera'
  | 'device'
  | 'exit'
  | 'help'
  | 'listen'
  | 'logs'
  | 'replay'
  | 'result'
  | 'section'
  | 'settings'
  | 'status'
  | 'warning'

const glyphs: Record<IconName, string> = {
  action: '▶',
  camera: '◈',
  device: '▣',
  exit: '×',
  help: '?',
  listen: '◐',
  logs: '≡',
  replay: '↻',
  result: '✓',
  section: '▤',
  settings: '☷',
  status: '●',
  warning: '⚠',
}

export function icon(name: IconName): string {
  return glyphs[name]
}
