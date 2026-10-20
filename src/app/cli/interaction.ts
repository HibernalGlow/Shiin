/**
 * 交互面的**渲染器中立**描述：字段表 + 取值 + 预览 + 危险判定。
 *
 * 这张表参考 Xaihi `packages/cli-runtime/src/interaction.ts`：`gd`（@clack）与
 * `ui`（OpenTUI）读的是同一份 schema，所以两条腿不会各自长出一套参数。
 * 这里刻意不含位置、宽度、组件与输入 API——那些是渲染器自己的事。
 */

export type InteractionValue = string | number | boolean
export type InteractionValues = Record<string, InteractionValue>
export type InteractionFieldKind = 'text' | 'number' | 'select' | 'boolean'
export type InteractionMode = 'ui' | 'gd'
export type CliInvocationMode = InteractionMode | 'pipe'

export interface InteractionOption<Value extends InteractionValue = InteractionValue> {
  value: Value
  label: string
  hint?: string
  disabled?: boolean
}

export interface InteractionField {
  id: string
  label: string
  description?: string
  kind: InteractionFieldKind
  /** 标记"这是主流程选择器"，渲染器可以给它更显眼的位置。 */
  role?: 'action'
  options?: readonly InteractionOption[]
  placeholder?: string
  min?: number
  max?: number
  step?: number
  visibleWhen?: (values: Readonly<InteractionValues>) => boolean
  validate?: (value: InteractionValue, values: Readonly<InteractionValues>) => string | null
}

export interface TerminalViewMetric {
  label: string
  value: string
}

export interface TerminalViewTable {
  columns: readonly { id: string; label: string; width?: number }[]
  rows: readonly Readonly<Record<string, string>>[]
  emptyMessage?: string
}

export interface TerminalViewDisplay {
  primary: string
  secondary?: string
  metrics?: readonly TerminalViewMetric[]
  table?: TerminalViewTable
}

/** 节点自己拥有的内容分组：只说"哪些字段是一组"，不说"画在哪"。 */
export interface TerminalInteractionView {
  sections: readonly { id: string; title: string; description?: string; fieldIds: readonly string[] }[]
  dashboard: {
    title: string
    description?: string
    display: (values: Readonly<InteractionValues>) => TerminalViewDisplay
  }
}

export interface TerminalInteractionSchema<Plan, Result> {
  id: string
  title: string
  description: string
  initialValues: InteractionValues
  fields: readonly InteractionField[]
  view?: TerminalInteractionView
  toPlan: (values: Readonly<InteractionValues>) => Plan
  validate?: (values: Readonly<InteractionValues>, plan: Plan) => string | null
  preview: (plan: Plan) => readonly string[]
  isDangerous: (plan: Plan) => boolean
  result: (result: Result) => {
    success: boolean
    message: string
    lines?: readonly string[]
    table?: TerminalViewTable
  }
}

export interface TerminalInteractionDefinition<Plan, Result> {
  schema: TerminalInteractionSchema<Plan, Result>
  run: (plan: Plan, onEvent: (event: { type: string; progress?: number; message: string }) => void) => Promise<Result>
  cancel?: () => void | Promise<void>
}

/**
 * 无参数 + TTY 才走默认交互面；带子命令一律走管道面——绝不把交互 UI 画进管道。
 * `tui`/`ui` 与 `gd`/`guided` 是本仓保留的两条显式入口。
 */
export function resolveInvocation(
  args: readonly string[],
  interactive: boolean,
  defaultMode: CliInvocationMode = 'ui',
): CliInvocationMode {
  const first = args[0]?.toLowerCase()
  if (first === 'ui' || first === 'tui') return 'ui'
  if (first === 'gd' || first === 'guided') return 'gd'
  if (args.length > 0) return 'pipe'
  return interactive ? defaultMode : 'pipe'
}

export function requireInteractiveMode(interactive: boolean, mode: InteractionMode): string | null {
  if (interactive) return null
  const engine = mode === 'ui' ? 'OpenTUI' : '@clack'
  return `\`${mode}\` (${engine}) mode requires an interactive terminal. Use a subcommand with --json for scripted use.`
}

export interface TerminalUiFlags {
  renderer: 'opentui'
  language?: string
  theme?: string
  args: string[]
  error?: string
}

/** 抽掉渲染器旗标，但不让它们漏进动作参数。 */
export function resolveTerminalUiFlags(args: readonly string[], defaults: { language?: string; theme?: string } = {}): TerminalUiFlags {
  let renderer = 'opentui'
  let language = defaults.language
  let theme = defaults.theme
  const remaining: string[] = []

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index] ?? ''
    const [name, inlineValue] = arg.split('=', 2)
    if (name !== '--renderer' && name !== '--lang' && name !== '--theme') {
      remaining.push(arg)
      continue
    }
    const value = inlineValue || args[index + 1]
    if (!value) return { renderer: 'opentui', language, theme, args: remaining, error: `${name} requires a value.` }
    if (!inlineValue) index += 1
    if (name === '--renderer') renderer = value.toLowerCase()
    if (name === '--lang') language = value.toLowerCase()
    if (name === '--theme') theme = value.toLowerCase()
  }

  if (renderer !== 'opentui') {
    return { renderer: 'opentui', language, theme, args: remaining, error: `Unknown terminal renderer: ${renderer}. Use opentui.` }
  }
  return { renderer: 'opentui', language, theme, args: remaining }
}

export function visibleFields(fields: readonly InteractionField[], values: Readonly<InteractionValues>): InteractionField[] {
  return fields.filter((field) => field.visibleWhen?.(values) ?? true)
}

export function nextOptionValue(field: InteractionField, current: InteractionValue | undefined, direction: number): InteractionValue | undefined {
  const options = field.options ?? []
  if (options.length === 0) return undefined
  const index = options.findIndex((option) => option.value === current)
  const next = (index < 0 ? 0 : index + direction + options.length) % options.length
  return options[next]?.value
}

export function stepNumber(field: InteractionField, current: InteractionValue | undefined, direction: number): number {
  const step = field.step ?? 1
  const base = typeof current === 'number' ? current : Number(current ?? field.min ?? 0)
  const raw = base + direction * step
  const min = field.min ?? Number.NEGATIVE_INFINITY
  const max = field.max ?? Number.POSITIVE_INFINITY
  const clamped = Math.min(max, Math.max(min, raw))
  return Math.round(clamped * 1000) / 1000
}
