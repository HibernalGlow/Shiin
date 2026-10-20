#!/usr/bin/env node
/**
 * 开发预览入口：不再自己实现一套 HTTP 桥，而是直接起正式 Web 宿主。
 * 这样 `pnpm preview` 与 `shiin serve` 用的是同一个 ScreenshotManager。
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const cli = path.resolve(here, '../../lib/cli.mjs')

if (!fs.existsSync(cli)) {
  console.error('lib/cli.mjs not found. Run "pnpm build:node" first.')
  process.exit(1)
}

const child = spawn(process.execPath, [cli, 'serve', ...process.argv.slice(2)], { stdio: 'inherit' })
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    if (!child.killed) child.kill(signal)
  })
}
child.on('error', (error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
child.on('exit', (code) => process.exit(code ?? 0))
