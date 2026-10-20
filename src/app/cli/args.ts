/**
 * 极简旗标解析：支持 `--key value`、`--key=value`、布尔旗标与 `--no-xxx`。
 *
 * 不引 citty/commander 是有意的：CLI 的命令表是本仓自己的六个动作，
 * 多一层框架只会让 `--help` 与错误码各自长出一套口径。
 */

export interface ParsedArgs {
  flags: Record<string, string | boolean>
  positional: string[]
  error?: string
}

export function parseArgs(tokens: readonly string[], booleanFlags: readonly string[] = []): ParsedArgs {
  const flags: Record<string, string | boolean> = {}
  const positional: string[] = []
  const booleans = new Set(booleanFlags)

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index] ?? ''
    if (!token.startsWith('--')) {
      positional.push(token)
      continue
    }
    const body = token.slice(2)
    if (!body) {
      positional.push(token)
      continue
    }
    const [name, inline] = body.split('=', 2)
    if (!name) continue

    if (name.startsWith('no-')) {
      flags[name.slice(3)] = false
      continue
    }
    if (inline !== undefined) {
      flags[name] = inline
      continue
    }
    if (booleans.has(name)) {
      flags[name] = true
      continue
    }
    const next = tokens[index + 1]
    if (next === undefined || next.startsWith('--')) {
      // 取值旗标缺值：这是用法错误，不静默当成 true。
      return { flags, positional, error: `--${name} requires a value.` }
    }
    flags[name] = next
    index += 1
  }

  return { flags, positional }
}

export function stringFlag(flags: Record<string, string | boolean>, name: string): string | undefined {
  const value = flags[name]
  return typeof value === 'string' ? value : undefined
}

export function booleanFlag(flags: Record<string, string | boolean>, name: string): boolean {
  return flags[name] === true
}
