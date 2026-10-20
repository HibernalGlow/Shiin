/**
 * CLI 的宿主抽象：把 stdin/stdout/stderr、cwd、env 收成一个可替换的 `CliHost`。
 *
 * 参考 Xaihi `packages/cli-runtime/src/index.ts` 的 `CliHost` 形状：所有终端面只依赖这个接口，
 * 测试可以塞假宿主，管道面与交互面也就不会各自去摸 `process.*`。
 */

export interface CliHost {
  cwd: string
  env: Record<string, string | undefined>
  stdin: NodeJS.ReadableStream & { isTTY?: boolean; setRawMode?: (mode: boolean) => void }
  stdout: { columns?: number; isTTY?: boolean; write: (chunk: string) => unknown }
  stderr: { columns?: number; isTTY?: boolean; write: (chunk: string) => unknown }
}

export function createCliHost(): CliHost {
  return {
    cwd: process.cwd(),
    env: process.env,
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
  }
}

export function writeLine(host: CliHost, message = ''): void {
  host.stdout.write(`${message}\n`)
}

export function writeError(host: CliHost, message: string): void {
  host.stderr.write(`${message}\n`)
}

export function writeJson(host: CliHost, value: unknown): void {
  host.stdout.write(`${JSON.stringify(value, null, 2)}\n`)
}

export function canRunInteractive(host: CliHost): boolean {
  return Boolean(host.stdin.isTTY && host.stdout.isTTY)
}

export function terminalColumns(host: CliHost, fallback = 80): number {
  const fromStdout = Number(host.stdout.columns)
  if (Number.isFinite(fromStdout) && fromStdout > 0) return Math.floor(fromStdout)
  const fromEnv = Number(host.env.COLUMNS)
  if (Number.isFinite(fromEnv) && fromEnv > 0) return Math.floor(fromEnv)
  return fallback
}

