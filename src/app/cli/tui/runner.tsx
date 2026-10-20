/* @jsxImportSource @opentui/react */
import { createCliRenderer } from '@opentui/core'
import { createRoot } from '@opentui/react'
import type { ReadStream, WriteStream } from 'node:tty'

import type { ScreenshotManager } from '../../../core/index.js'
import type { Language } from '../i18n.js'
import { ShiinTui } from './app.js'

export interface RunTuiOptions {
  manager: ScreenshotManager
  language: Language
  theme?: string
}

/**
 * 起一个 alternate-screen 的 OpenTUI 渲染器，把工作台画上去，然后等它被销毁。
 * 退出路径只有一条：`onDestroy` → resolve。Ctrl+C 走 `exitOnCtrlC`，Q/Esc 走 `onExit`，
 * 两条最后都落到 `renderer.destroy()`，不会留下半张帧。
 */
export async function runTui({ manager, language, theme }: RunTuiOptions): Promise<void> {
  let resolveDestroyed: (() => void) | undefined
  const destroyed = new Promise<void>((resolve) => {
    resolveDestroyed = resolve
  })

  const renderer = await createCliRenderer({
    stdin: process.stdin as ReadStream,
    stdout: process.stdout as WriteStream,
    exitOnCtrlC: true,
    clearOnShutdown: true,
    useMouse: true,
    enableMouseMovement: true,
    screenMode: 'alternate-screen',
    onDestroy: () => resolveDestroyed?.(),
  })

  const root = createRoot(renderer)
  let exiting = false
  const exit = () => {
    if (exiting) return
    exiting = true
    try {
      root.unmount()
    } catch {
      // 已经卸载过就不重复报错
    }
    try {
      renderer.destroy()
    } catch {
      // 同上
    }
  }

  try {
    root.render(<ShiinTui manager={manager} language={language} theme={theme} onExit={exit} />)
  } catch (error) {
    exit()
    throw error
  }

  await destroyed
}
