#!/usr/bin/env node
/**
 * Shiin 的终端入口。
 *
 * 三条腿，跟 Xaihi 的口径一致：
 * - `ui`（全屏 TUI / OpenTUI）：`shiin`、`shiin ui`、`shiin tui`、`shiin-tui`
 * - `gd`（引导式问答 / @clack）：`shiin gd`、`shiin guided`
 * - `pipe`（纯命令行）：其余子命令，永远不画交互 UI，也永远不读 raw mode
 *
 * 分辨率规则只有一条：**带子命令就走 pipe**。"交互 UI 被画进管道"是这条规则要防的事故。
 */

import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { ScreenshotManager, FileConfigStorage, loadFullConfig } from '../../core/index.js'
import { CaptureTargetTypeEnum, ScreenShotSaveWayEnum, type ScreenshotResult } from '../../core/types.js'
import {
  collectContext,
  deviceTable,
  executeCapture,
  executeListen,
  executeReplay,
  inspectDevices,
  isEditableKey,
  parseComboKeys,
  runDoctor as collectDoctorRows,
  saveComboKeys,
  writeConfig,
} from './actions.js'
import { collectComboEdges } from './tui/combo.js'
import { booleanFlag, parseArgs, stringFlag } from './args.js'
import { canRunInteractive, createCliHost, writeError, writeJson, writeLine, type CliHost } from './host.js'
import { createManager } from './manager.js'
import { startWebServer, type WebServerHandle } from '../server/index.js'
import { createTranslator, resolveLanguage, type Language } from './i18n.js'
import { resolveTerminalUiFlags } from './interaction.js'
import { renderPanel, renderTable, rich, writePanel } from './rich.js'
import { parseWindowSourceFlag, planFromConfig, type ShiinPlan } from './plan.js'
import {
  notifyCaptureResult,
  notifyReplayResult,
  showOverlayNotification,
  captureOverlayRequest,
  replayOverlayRequest,
  showSystemNotification,
  overlayDisabledByEnv,
} from './overlay.js'
import { resolveCliPaths } from './paths.js'
import { findBun, probeTerminalRuntime, terminalRuntimeHint } from './runtime.js'

function readVersion(): string {
  let dir = path.dirname(fileURLToPath(import.meta.url))
  for (let depth = 0; depth < 6; depth += 1) {
    const candidate = path.join(dir, 'package.json')
    try {
      const text = fs.readFileSync(candidate, 'utf8')
      const parsed = JSON.parse(text) as { name?: string; version?: string }
      if (parsed.name?.includes('shiin') && parsed.version) return parsed.version
    } catch {
      // 继续往上找
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return '0.0.0'
}

const VERSION = readVersion()

function printHelp(host: CliHost, language: Language): void {
  const t = createTranslator(language)
  const zh = language === 'zh'
  const lines = zh
    ? [
        `${rich(host, '◆ SHIIN', 'cyan', 'bold')} · ${t('tagline')}  ${rich(host, `v${VERSION}`, 'grey')}`,
        '',
        rich(host, '用法', 'blue', 'bold'),
        '  shiin                     在终端里打开全屏工作台（非 TTY 时打印本页）',
        '  shiin ui | tui            全屏 TUI（OpenTUI）',
        '  shiin gd | guided         引导式问答截图（@clack/prompts）',
        '  shiin capture [flags]     立即截图',
        '  shiin replay              保存 OBS 回放缓存',
        '  shiin notify [flags]      弹出桌面端同款覆层通知（可带截图预览）',
        '  shiin listen              前台监听手柄组合键与快捷键',
        '  shiin serve               启动本地 Web 控制台（浏览器只做显示）',
        '  shiin combo               录入手柄组合键（静置 1.2 秒自动保存）',
        '  shiin devices             列出手柄、显示器与窗口',
        '  shiin config [set k v]    查看或修改配置',
        '  shiin doctor              环境自检（运行时 / FFI / SDL / OBS）',
        '',
        rich(host, 'capture 旗标', 'blue', 'bold'),
        '  --target screen|window    --save file|clipboard|both',
        '  --format jpg|png          --path <dir>        --json',
        '  --screen <id>             --window <id|focused>  （focused = 当前聚焦窗口，见 devices）',
        '  --window-mode specified|focused                  （窗口来源口径）',
        '  --subfolder / --no-subfolder                     保存到活动窗口名子文件夹',
        '  --no-notify                                      本次不弹覆层通知',
        '  combo: --set "Button0,Button7"   --clear      --json',
        '',
        rich(host, 'notify 旗标', 'blue', 'bold'),
        '  --img <file>              --title <text>     --desc <text>',
        '  --type video|text         --position left|right',
        '  --size 0.6-2              --duration <ms>    --json',
        '',
        rich(host, '通用旗标', 'blue', 'bold'),
        '  --lang zh|en              --theme <name>      --renderer opentui',
        '  --version                 --help',
        '',
        rich(host, '示例', 'blue', 'bold'),
        '  shiin listen',
        '  shiin serve --port 3800',
        '  shiin gd --lang zh',
        '  shiin capture --target window --window focused',
        '  shiin capture --target window --format png --save file',
        '  shiin notify --img ./shot.png --title "截图成功"',
        '  shiin devices --json',
        '  shiin combo --set "Button0,Button7"',
        '  shiin config set imageFormat png',
      ]
    : [
        `${rich(host, '◆ SHIIN', 'cyan', 'bold')} · ${t('tagline')}  ${rich(host, `v${VERSION}`, 'grey')}`,
        '',
        rich(host, 'Usage', 'blue', 'bold'),
        '  shiin                     Open the full-screen workbench (help when not a TTY)',
        '  shiin ui | tui            Full-screen TUI (OpenTUI)',
        '  shiin gd | guided         Guided capture wizard (@clack/prompts)',
        '  shiin capture [flags]     Capture once',
        '  shiin replay              Save the OBS replay buffer',
        '  shiin notify [flags]      Show the desktop overlay (optionally with a preview)',
        '  shiin listen              Listen for gamepad combos and hotkeys',
        '  shiin serve               Start the local web console (browser is display-only)',
        '  shiin combo               Record a gamepad combo (auto-saves after 1.2s idle)',
        '  shiin devices             List gamepads, displays and windows',
        '  shiin config [set k v]    Read or write configuration',
        '  shiin doctor              Environment self check (runtime / FFI / SDL / OBS)',
        '',
        rich(host, 'capture flags', 'blue', 'bold'),
        '  --target screen|window    --save file|clipboard|both',
        '  --format jpg|png|webp|avif --quality 1-100   --lossless',
        '  --path <dir>              --json',
        '  --screen <id>             --window <id|focused>  (focused = current foreground window)',
        '  --window-mode specified|focused                  (how a window target is chosen)',
        '  --subfolder / --no-subfolder                     save into subdirectories named after window title',
        '  --no-notify                                      skip the overlay for this run',
        '  combo: --set "Button0,Button7"   --clear      --json',
        '',
        rich(host, 'notify flags', 'blue', 'bold'),
        '  --img <file>              --title <text>     --desc <text>',
        '  --type video|text         --position left|right',
        '  --size 0.6-2              --duration <ms>    --json',
        '',
        rich(host, 'Global flags', 'blue', 'bold'),
        '  --lang zh|en              --theme <name>      --renderer opentui',
        '  --version                 --help',
        '',
        rich(host, 'Examples', 'blue', 'bold'),
        '  shiin',
        '  shiin serve',
        '  shiin gd --lang en',
        '  shiin capture --target window --window focused',
        '  shiin capture --target window --format png --save file',
        '  shiin notify --img ./shot.png --title "Screenshot saved"',
        '  shiin devices --json',
        '  shiin combo --set "Button0,Button7"',
        '  shiin config set imageFormat png',
      ]
  writeLine(host, lines.join('\n'))
}

function planFromFlags(config: Parameters<typeof planFromConfig>[0], flags: Record<string, string | boolean>): ShiinPlan {
  const base = planFromConfig(config)
  const target = stringFlag(flags, 'target')
  const save = stringFlag(flags, 'save')
  const format = stringFlag(flags, 'format')
  const quality = stringFlag(flags, 'quality')
  const lossless = booleanFlag(flags, 'lossless')
  const windowMode = stringFlag(flags, 'window-mode')
  const subfolder = booleanFlag(flags, 'subfolder') ?? booleanFlag(flags, 'save-by-title')
  return {
    target: target === 'window' ? 'window' : target === 'screen' ? 'screen' : base.target,
    windowMode: windowMode === 'focused' || windowMode === 'specified' ? windowMode : base.windowMode,
    windowId: base.windowId,
    saveWay:
      save === 'clipboard'
        ? ScreenShotSaveWayEnum.CilpboardOnly
        : save === 'both'
          ? ScreenShotSaveWayEnum.FileAndCilpboard
          : save === 'file'
            ? ScreenShotSaveWayEnum.FileOnly
            : base.saveWay,
    format: ['jpg', 'png', 'webp', 'avif'].includes(format as string) ? (format as any) : base.format,
    quality: quality && !Number.isNaN(Number(quality)) ? Math.max(1, Math.min(100, Number(quality))) : base.quality,
    lossless: lossless ?? base.lossless,
    path: stringFlag(flags, 'path') ?? base.path,
    saveByActiveWinTitle: subfolder ?? base.saveByActiveWinTitle,
  }
}

async function runUi(host: CliHost, rest: string[], language: Language, theme?: string): Promise<number> {
  const t = createTranslator(language)
  if (!canRunInteractive(host)) {
    writeError(host, t('cliNoTty'))
    return 2
  }

  const capability = await probeTerminalRuntime()
  if (!capability.ok) {
    // 显式接力：先说清楚为什么，再把进程交给 bun；没有 bun 就点名缺什么并退化到 gd。
    const bun = findBun()
    if (bun) {
      writeLine(host, rich(host, `Node ${capability.version} 没有 node:ffi；改用 bun 重跑 OpenTUI（原生库需要 FFI）。`, 'yellow'))
      const entry = process.argv[1]
      if (entry) {
        const result = spawnSync(bun, [entry, 'tui', ...rest], { stdio: 'inherit' })
        return result.status ?? 1
      }
    }
    writeError(host, terminalRuntimeHint(capability))
    writeError(host, `${t('tuiDegraded')}\n${t('tuiFlagHint')}`)
    return 3
  }

  const manager = await createManager()
  try {
    const { runTui } = await import('./tui/runner.js')
    await runTui({ manager, language, theme })
    return 0
  } finally {
    manager.dispose()
  }
}

async function runGuided(host: CliHost, language: Language): Promise<number> {
  const t = createTranslator(language)
  if (!canRunInteractive(host)) {
    writeError(host, t('cliNoTty'))
    return 2
  }
  const manager = await createManager()
  try {
    const { runGuidedCapture } = await import('./guided.js')
    return await runGuidedCapture(manager, host, language)
  } finally {
    manager.dispose()
  }
}

async function runCapture(host: CliHost, rest: string[], language: Language): Promise<number> {
  const t = createTranslator(language)
  const parsed = parseArgs(rest, ['json', 'notify'])
  if (parsed.error) {
    writeError(host, parsed.error)
    return 2
  }
  if (parsed.positional.length > 0) {
    writeError(host, `Unexpected argument: ${parsed.positional[0]}`)
    return 2
  }

  const windowModeFlag = stringFlag(parsed.flags, 'window-mode')
  if (windowModeFlag && windowModeFlag !== 'focused' && windowModeFlag !== 'specified') {
    writeError(host, '--window-mode must be specified or focused.')
    return 2
  }

  const manager = await createManager()
  try {
    const plan = planFromFlags(manager.config, parsed.flags)
    // ADR-0004 的入口形状：`--screen <id>` / `--window <id|focused>` 直接指定源，顺带把目标类型定下来。
    const windowFlag = stringFlag(parsed.flags, 'window')
    const screenId = stringFlag(parsed.flags, 'screen')
    if (windowFlag) {
      plan.target = 'window'
      const source = parseWindowSourceFlag(windowFlag)
      plan.windowMode = source.mode
      plan.windowId = source.id
    } else if (screenId) {
      plan.target = 'screen'
      manager.syncConfig({ screenSourceId: screenId })
    }
    // `--no-notify` 由 parseArgs 统一落成 `notify: false`。
    const result = await executeCapture(manager, plan, t, () => {}, {
      notify: parsed.flags.notify !== false,
    })
    if (booleanFlag(parsed.flags, 'json')) {
      writeJson(host, { ok: result.success, plan, ...result })
    } else {
      writePanel(
        host,
        result.success ? `${result.message}` : t('captureFailed'),
        result.lines?.length ? result.lines : [result.message],
        { color: result.success ? 'green' : 'red', minWidth: 40 },
      )
    }
    return result.success ? 0 : 1
  } finally {
    manager.dispose()
  }
}

async function runReplay(host: CliHost, rest: string[], language: Language): Promise<number> {
  const t = createTranslator(language)
  const parsed = parseArgs(rest, ['json', 'notify'])
  if (parsed.error) {
    writeError(host, parsed.error)
    return 2
  }
  const manager = await createManager()
  try {
    const result = await executeReplay(manager, t, { notify: parsed.flags.notify !== false })
    if (booleanFlag(parsed.flags, 'json')) writeJson(host, result)
    else writePanel(host, result.message, result.lines ?? [], { color: result.success ? 'green' : 'red', minWidth: 40 })
    return result.success ? 0 : 1
  } finally {
    manager.dispose()
  }
}

async function runNotify(host: CliHost, rest: string[], language: Language): Promise<number> {
  const t = createTranslator(language)
  const parsed = parseArgs(rest, ['json'])
  if (parsed.error) {
    writeError(host, parsed.error)
    return 2
  }
  if (parsed.positional.length > 0) {
    writeError(host, `Unexpected argument: ${parsed.positional[0]}`)
    return 2
  }

  const imgFlag = stringFlag(parsed.flags, 'img')?.trim()
  if (imgFlag && !imgFlag.startsWith('data:') && !fs.existsSync(imgFlag)) {
    writeError(host, `--img not found: ${imgFlag}`)
    return 2
  }

  const typeFlag = stringFlag(parsed.flags, 'type')
  if (typeFlag && typeFlag !== 'video' && typeFlag !== 'text') {
    writeError(host, '--type must be video or text.')
    return 2
  }
  const positionFlag = stringFlag(parsed.flags, 'position')
  if (positionFlag && positionFlag !== 'left' && positionFlag !== 'right') {
    writeError(host, '--position must be left or right.')
    return 2
  }
  const durationRaw = stringFlag(parsed.flags, 'duration')
  const duration = durationRaw === undefined ? undefined : Number(durationRaw)
  if (duration !== undefined && (!Number.isFinite(duration) || duration <= 0)) {
    writeError(host, '--duration must be a positive number of milliseconds.')
    return 2
  }
  const sizeRaw = stringFlag(parsed.flags, 'size')
  const scale = sizeRaw === undefined ? undefined : Number(sizeRaw)
  if (scale !== undefined && (!Number.isFinite(scale) || scale <= 0)) {
    writeError(host, '--size must be a positive number (0.6–2).')
    return 2
  }

  // `notify` 是显式动作：即使配置里关掉了自动通知，也照弹（位置/尺寸仍读配置）。
  const paths = resolveCliPaths()
  const config = await loadFullConfig(new FileConfigStorage(path.join(paths.configDir, 'localStorage.json')))
  const img = imgFlag ? (imgFlag.startsWith('data:') ? imgFlag : path.resolve(imgFlag)) : ''
  const title = stringFlag(parsed.flags, 'title') ?? t('overlayScreenshotSuccess')
  const desc = stringFlag(parsed.flags, 'desc') ?? (img ? path.basename(img) : t('overlayScreenshotSaved'))
  const result = showOverlayNotification(
    {
      img,
      title,
      desc,
      type: typeFlag as 'video' | 'text' | undefined,
      duration,
      position: positionFlag as 'left' | 'right' | undefined,
      scale,
    },
    { ...config, overlayNotify: 'show' },
  )

  if (booleanFlag(parsed.flags, 'json')) {
    writeJson(host, { ...result, img, title, desc })
  } else if (result.shown) {
    writeLine(host, rich(host, `${t('overlayShown')} · ${result.backend}`, 'green'))
  } else {
    writeError(host, `${t('overlayUnavailable')}: ${result.reason ?? 'unknown'}`)
  }
  return result.shown ? 0 : 1
}

async function runDevices(host: CliHost, rest: string[], language: Language): Promise<number> {
  const t = createTranslator(language)
  const parsed = parseArgs(rest, ['json'])
  if (parsed.error) {
    writeError(host, parsed.error)
    return 2
  }
  const manager = await createManager()
  try {
    const inventory = await inspectDevices(manager)
    if (booleanFlag(parsed.flags, 'json')) {
      writeJson(host, inventory)
      return 0
    }
    const table = deviceTable(inventory, t)
    writePanel(host, t('devices'), renderTable(table.columns, table.rows, table.emptyMessage), { color: 'cyan' })
    return 0
  } finally {
    manager.dispose()
  }
}

async function runListen(host: CliHost, language: Language): Promise<number> {
  const t = createTranslator(language)
  const manager = await createManager()
  const result = await executeListen(manager, t)
  if (!result.success) {
    writeError(host, result.lines?.join('\n') ?? result.message)
    manager.dispose()
    return 1
  }

  writeLine(host, rich(host, result.message, 'green'))
  for (const line of result.lines ?? []) writeLine(host, rich(host, line, 'grey'))
  manager.subscribe((event) => {
    if (event.type === 'screenshot') {
      const data = event.data as { ok?: boolean; filePath?: string | null; error?: string } | undefined
      writeLine(
        host,
        data?.ok
          ? rich(host, `[${t('captureDone')}] ${data.filePath ?? t('saveClipboard')}`, 'green')
          : rich(host, `[${t('captureFailed')}] ${data?.error ?? ''}`, 'red'),
      )
      if (data) notifyCaptureResult(manager, data as ScreenshotResult, t)
    } else if (event.type === 'replayBuffer') {
      const data = event.data as { ok?: boolean; error?: string } | undefined
      writeLine(host, data?.ok ? rich(host, `[${t('replayDone')}]`, 'green') : rich(host, `[${t('replayFailed')}] ${data?.error ?? ''}`, 'red'))
      if (data) notifyReplayResult(manager, data, t)
    } else if (event.type === 'deviceChanged') {
      writeLine(host, rich(host, `[${t('deviceChanged')}]`, 'yellow'))
    }
  })

  return await new Promise<number>((resolve) => {
    const stop = () => {
      writeLine(host, rich(host, `[${t('listenStopped')}]`, 'yellow'))
      manager.dispose()
      resolve(0)
    }
    process.once('SIGINT', stop)
    process.once('SIGTERM', stop)
  })
}

/**
 * Web 入口：同一个 ScreenshotManager，外面套一层本地 HTTP。
 *
 * 浏览器只是显示器——手柄、全局热键、截图、配置和 OBS 都留在本进程，
 * 页面关闭后监听仍然继续。
 */
function resolveWebRoot(): string {
  const override = process.env.SHIIN_WEB_ROOT?.trim()
  if (override) return path.resolve(override)
  const here = path.dirname(fileURLToPath(import.meta.url))
  const candidates = [
    path.resolve(here, '../dist/ui'),
    path.resolve(here, '../../../dist/ui'),
    path.resolve(process.cwd(), 'dist/ui'),
  ]
  return candidates.find((candidate) => fs.existsSync(path.join(candidate, 'index.html'))) ?? candidates[0]
}

function openInBrowser(url: string): void {
  const [command, args] =
    process.platform === 'darwin'
      ? ['open', [url]]
      : process.platform === 'win32'
        ? ['cmd', ['/c', 'start', '', url]]
        : ['xdg-open', [url]]
  try {
    const child = spawn(command, args, { detached: true, stdio: 'ignore', windowsHide: true })
    child.on('error', () => undefined)
    child.unref()
  } catch {
    // 打不开浏览器不算启动失败：URL 已经打印在终端里
  }
}

async function runServe(host: CliHost, rest: string[], language: Language): Promise<number> {
  const parsed = parseArgs(rest, ['open'])
  if (parsed.error) {
    writeError(host, parsed.error)
    return 2
  }
  if (parsed.positional.length > 0) {
    writeError(host, `Unexpected argument: ${parsed.positional[0]}`)
    return 2
  }

  const portRaw = stringFlag(parsed.flags, 'port') ?? process.env.SHIIN_WEB_PORT?.trim()
  const port = portRaw !== undefined ? Number(portRaw) : 3800
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    writeError(host, '--port must be an integer between 0 and 65535.')
    return 2
  }

  const bindHost = stringFlag(parsed.flags, 'host')?.trim() || '127.0.0.1'
  const loopback = ['127.0.0.1', 'localhost', '::1', '[::1]'].includes(bindHost)
  const manager = await createManager()

  let handle: WebServerHandle
  try {
    // 音效数据是内嵌 WAV，只在 serve 这一条路径上加载，别让 TUI/capture 一起背上。
    const { playBackgroundShutterSound } = await import('../server/background-feedback.js')
    handle = await startWebServer({
      manager,
      root: resolveWebRoot(),
      host: bindHost,
      port,
      onBackgroundEvent: (event) => {
        // 页面开着时由前端播放声音/显示提示；这里只补“浏览器已关闭”的那一段。
        if (event.type === 'screenshot') {
          const result = event.data as ScreenshotResult | undefined
          if (!result || typeof result !== 'object') return
          if (result.ok) void playBackgroundShutterSound(manager.config.sound, manager.config.soundPower)
          if (!overlayDisabledByEnv() && manager.config.overlayNotify !== 'hide') {
            showOverlayNotification(
              captureOverlayRequest(result, createTranslator(resolveLanguage(manager.config.locale, process.env))),
              manager.config,
            )
          }
        } else if (event.type === 'replayBuffer') {
          const result = event.data as { ok?: boolean; error?: string } | undefined
          if (!result?.ok) return
          if (!overlayDisabledByEnv() && manager.config.overlayNotify !== 'hide') {
            showOverlayNotification(
              replayOverlayRequest(result, createTranslator(resolveLanguage(manager.config.locale, process.env))),
              manager.config,
            )
          }
        }
      },
    })
  } catch (error) {
    manager.dispose()
    const detail = error instanceof Error ? error.message : String(error)
    writeError(host, `Failed to start Shiin Web: ${detail}`)
    return 1
  }

  // 机器可读结构化握手消息（支持 Electron utilityProcess 与进程管道通信）
  const readyPayload = {
    type: 'ready',
    port: handle.port,
    url: handle.url,
    pid: process.pid,
  }
  if (typeof (process as any).parentPort?.postMessage === 'function') {
    (process as any).parentPort.postMessage(readyPayload)
  }
  writeLine(host, `__SHIIN_READY__ ${JSON.stringify(readyPayload)}`)

  const paths = resolveCliPaths()
  writeLine(host, rich(host, `SHIIN WEB · ${handle.url}`, 'cyan', 'bold'))
  writeLine(host, rich(host, `${language === 'zh' ? '配置目录' : 'Config'}: ${paths.configDir}`, 'grey'))
  writeLine(
    host,
    rich(
      host,
      language === 'zh'
        ? '浏览器只做显示；手柄、热键、截图与配置都在此进程。Ctrl+C 停止。'
        : 'Browser is display-only; gamepad, hotkeys, capture and config live in this process. Ctrl+C to stop.',
      'grey',
    ),
  )
  if (!loopback) {
    writeLine(
      host,
      rich(
        host,
        language === 'zh'
          ? `警告：正在监听 ${bindHost}，请自行确保网络可达性与鉴权。`
          : `Warning: listening on ${bindHost}; make sure the network boundary is intentional.`,
        'yellow',
      ),
    )
  }
  if (parsed.flags.open !== false) openInBrowser(handle.url)

  return await new Promise<number>((resolve) => {
    let stopping = false
    const stop = () => {
      if (stopping) return
      stopping = true
      void (async () => {
        await handle.close()
        manager.dispose()
        writeLine(host, rich(host, language === 'zh' ? 'Web 服务已停止' : 'Web host stopped', 'yellow'))
        resolve(0)
      })()
    }
    process.once('SIGINT', stop)
    process.once('SIGTERM', stop)
    if ((process as any).parentPort?.on) {
      (process as any).parentPort.on('message', (msg: any) => {
        if (msg && (msg.type === 'dispose' || msg.type === 'exit')) {
          stop()
        }
      })
    }
  })
}

/**
 * `shiin combo`：组合键的命令行入口。
 *
 * - 无参数：显示当前值；TTY 上直接进录制（按下手柄键，静置 1.2 秒自动保存，Ctrl+C 取消）
 * - `--set "Button0,Button7"` / `--clear`：不起录制，直接写配置（脚本用）
 * - `--json`：只输出 `{ "comboKeys": [...] }`，录制过程中的按键提示不落到 stdout
 */
async function runCombo(host: CliHost, rest: string[], language: Language): Promise<number> {
  const t = createTranslator(language)
  const parsed = parseArgs(rest, ['json', 'clear'])
  if (parsed.error) {
    writeError(host, parsed.error)
    return 2
  }
  const json = booleanFlag(parsed.flags, 'json')
  const manager = await createManager()
  try {
    const sub = parsed.positional[0]?.toLowerCase()
    // 组合键按设备存：没有手柄就没有能写的键，直说而不是假装保存成功。
    const device = manager.gamepad.getConnectedDevices()[0]

    if (booleanFlag(parsed.flags, 'clear') || sub === 'clear') {
      if (!device) {
        writeError(host, t('noDevices'))
        return 1
      }
      await saveComboKeys(manager, [])
      if (json) writeJson(host, { comboKeys: [] })
      else writeLine(host, rich(host, t('comboCleared'), 'green'))
      return 0
    }

    const explicit = stringFlag(parsed.flags, 'set') ?? (sub === 'set' ? parsed.positional.slice(1).join(' ') : undefined)
    if (explicit !== undefined) {
      const normalized = parseComboKeys(explicit)
      if (!normalized.ok) {
        writeError(host, `${t('comboInvalid')}: ${normalized.error}`)
        return 2
      }
      if (!device) {
        writeError(host, t('noDevices'))
        return 1
      }
      await saveComboKeys(manager, normalized.keys)
      if (json) writeJson(host, { comboKeys: normalized.keys })
      else writePanel(host, t('savedCombo'), [normalized.keys.join(' + ')], { color: 'green', minWidth: 40 })
      return 0
    }

    const current = manager.config.comboKeys ?? []
    // 只有"无子命令 + 没要 JSON + 真 TTY"才进录制；其余情况一律安静地报当前值。
    const showOnly = json || sub === 'show' || sub === 'list' || !canRunInteractive(host)
    if (showOnly) {
      if (json) writeJson(host, { comboKeys: current })
      else writeLine(host, `${t('comboCurrent')}: ${current.length > 0 ? current.join(' + ') : t('comboUnset')}`)
      return 0
    }

    return await recordCombo(manager, host, t)
  } finally {
    manager.dispose()
  }
}

async function recordCombo(manager: ScreenshotManager, host: CliHost, t: ReturnType<typeof createTranslator>): Promise<number> {
  const device = manager.gamepad.getConnectedDevices()[0]
  if (!device) {
    writeError(host, t('noDevices'))
    return 1
  }
  manager.gamepad.openDevice(device._index)

  const current = manager.config.comboKeys ?? []
  writePanel(
    host,
    t('recordCombo'),
    [
      `${t('devices')}: ${device.name}`,
      t('recordingCombo'),
      t('comboRecordHintCli'),
      `${t('comboCurrent')}: ${current.length > 0 ? current.join(' + ') : t('comboUnset')}`,
    ],
    { color: 'cyan', minWidth: 46 },
  )

  let prevButtons = manager.gamepad.getCurrentButtons().slice()
  let prevAxes = manager.gamepad.getCurrentAxes().slice()
  const collected: string[] = []
  const startedAt = Date.now()
  let lastKeyAt = 0
  let hinted = false

  return await new Promise<number>((resolve) => {
    let timer: ReturnType<typeof setInterval> | null = null
    let finished = false

    const cleanup = () => {
      if (timer) clearInterval(timer)
      timer = null
    }

    const finish = async (reason: 'saved' | 'timeout' | 'cancel') => {
      if (finished) return
      finished = true
      cleanup()
      if (reason === 'saved') {
        await saveComboKeys(manager, collected)
        writePanel(host, t('savedCombo'), [collected.join(' + ')], { color: 'green', minWidth: 40 })
        resolve(0)
        return
      }
      if (reason === 'timeout') {
        writeError(host, t('comboTimeout'))
        resolve(1)
        return
      }
      writeLine(host, rich(host, t('cancel'), 'yellow'))
      resolve(0)
    }

    function onSignal() {
      void finish('cancel')
    }

    process.once('SIGINT', onSignal)
    process.once('SIGTERM', onSignal)

    timer = setInterval(() => {
      const buttons = manager.gamepad.getCurrentButtons()
      const axes = manager.gamepad.getCurrentAxes()
      const added = collectComboEdges(prevButtons, prevAxes, buttons, axes)
      prevButtons = buttons.slice()
      prevAxes = axes.slice()

      for (const key of added) {
        if (collected.includes(key)) continue
        collected.push(key)
        lastKeyAt = Date.now()
        writeLine(host, rich(host, `+ ${key}`, 'green'))
      }

      const now = Date.now()
      if (collected.length === 0 && !hinted && now - startedAt >= 5000) {
        hinted = true
        writeLine(host, rich(host, t('comboWaiting'), 'grey'))
      }
      if (collected.length > 0 && now - lastKeyAt >= 1200) void finish('saved')
      else if (collected.length === 0 && now - startedAt >= 30_000) void finish('timeout')
    }, 60)
  })
}

async function runConfig(host: CliHost, rest: string[], language: Language): Promise<number> {
  const t = createTranslator(language)
  const parsed = parseArgs(rest, ['json'])
  if (parsed.error) {
    writeError(host, parsed.error)
    return 2
  }
  const manager = await createManager()
  const paths = resolveCliPaths()
  try {
    const sub = parsed.positional[0]?.toLowerCase()
    if (sub === 'set') {
      const key = parsed.positional[1]
      const raw = parsed.positional.slice(2).join(' ')
      if (!key || !isEditableKey(key) || !raw) {
        writeError(host, 'usage: shiin config set <key> <value>')
        return 2
      }
      const result = await writeConfig(manager, key, raw)
      if (!result.ok) {
        writeError(host, result.error ?? 'failed')
        return 2
      }
      writeLine(host, rich(host, `${t('savedConfig')}: ${key} = ${raw}`, 'green'))
      return 0
    }

    if (sub === 'get') {
      const key = parsed.positional[1]
      if (!key || !isEditableKey(key)) {
        writeError(host, 'usage: shiin config get <key>')
        return 2
      }
      const value = (manager.config as unknown as Record<string, unknown>)[key]
      writeLine(host, typeof value === 'string' ? value : JSON.stringify(value))
      return 0
    }

    if (booleanFlag(parsed.flags, 'json')) {
      writeJson(host, { path: paths.configDir, workspace: paths.workspace, config: manager.config })
      return 0
    }

    const context = await collectContext(manager)
    writePanel(
      host,
      'config',
      [
        `${t('configPath')}: ${paths.configDir}`,
        `${t('path')}: ${manager.config.path || '(default)'}`,
        `${t('format')}: ${manager.config.imageFormat.toUpperCase()}`,
        `${t('saveWay')}: ${manager.config.screenShotSaveWay}`,
        `${t('target')}: ${manager.config.captureTargetType}`,
        ...(manager.config.captureTargetType === CaptureTargetTypeEnum.Window
          ? [
              `${t('windowMode')}: ${manager.config.windowCaptureMode === 'specified' ? t('windowSpecified') : t('windowFocused')}`,
              `${t('windowSource')}: ${manager.config.windowCaptureMode === 'specified' ? manager.config.windowSourceId || t('windowNone') : t('windowFocusedHint')}`,
            ]
          : []),
        `${t('comboKeys')}: ${manager.config.comboKeys?.length ? manager.config.comboKeys.join(' + ') : t('comboUnset')}`,
        `${t('obsStatus')}: ${context.obsConnected ? t('connected') : t('disconnected')} (${manager.config.obsIp}:${manager.config.obsPort})`,
      ],
      { color: 'cyan', minWidth: 48 },
    )
    return 0
  } finally {
    manager.dispose()
  }
}

async function runDoctor(host: CliHost, rest: string[], language: Language): Promise<number> {
  const t = createTranslator(language)
  const parsed = parseArgs(rest, ['json'])
  if (parsed.error) {
    writeError(host, parsed.error)
    return 2
  }
  const manager = await createManager()
  try {
    const rows = await collectDoctorRows(manager, t, resolveCliPaths().configDir)
    if (booleanFlag(parsed.flags, 'json')) {
      writeJson(host, Object.fromEntries(rows.map((row) => [row.id, { label: row.label, value: row.value, ok: row.ok }])))
      return 0
    }
    writePanel(
      host,
      t('doctorTitle'),
      rows.map((row) => `${row.ok ? rich(host, '✓', 'green') : rich(host, '✗', 'red')} ${row.label}: ${row.value}`),
      { color: 'cyan', minWidth: 48 },
    )
    return 0
  } finally {
    manager.dispose()
  }
}

async function main(): Promise<number> {
  const host = createCliHost()
  const argv = process.argv.slice(2)
  const execName = process.argv[1] ? path.basename(process.argv[1]).toLowerCase() : ''

  const wantsVersion = argv.includes('--version') || argv.includes('-v') || argv[0] === 'version'
  const wantsHelp = argv.includes('--help') || argv.includes('-h') || argv[0] === 'help'
  const flags = resolveTerminalUiFlags(argv, { language: resolveLanguage(undefined, host.env), theme: 'nord' })
  const language = resolveLanguage(flags.language, host.env)

  if (wantsVersion) {
    writeLine(host, VERSION)
    return 0
  }
  if (wantsHelp) {
    printHelp(host, language)
    return 0
  }
  if (flags.error) {
    writeError(host, flags.error)
    return 2
  }

  const command = argv[0]?.toLowerCase()
  const rest = argv.slice(1)

  if (!command) {
    if (canRunInteractive(host)) return runUi(host, [], language, flags.theme)
    printHelp(host, language)
    return 0
  }

  switch (command) {
    case 'ui':
    case 'tui':
      return runUi(host, rest, language, flags.theme)
    case 'gd':
    case 'guided':
      return runGuided(host, language)
    case 'capture':
    case 'shot':
      return runCapture(host, rest, language)
    case 'replay':
      return runReplay(host, rest, language)
    case 'notify':
    case 'toast':
      return runNotify(host, rest, language)
    case 'devices':
    case 'list':
      return runDevices(host, rest, language)
    case 'listen':
      return runListen(host, language)
    case 'serve':
    case 'web':
      return runServe(host, rest, language)
    case 'combo':
      return runCombo(host, rest, language)
    case 'config':
      return runConfig(host, rest, language)
    case 'doctor':
    case 'check':
      return runDoctor(host, rest, language)
    default:
      // `shiin-tui` 这个 bin 进来时 argv[1] 就叫 tui-bin；它由 tui-bin.ts 预处理，不会落到这里。
      writeError(host, `Unknown command: ${command}${execName ? ` (${execName})` : ''}`)
      printHelp(host, language)
      return 2
  }
}

/**
 * 收尾：先把 stdout/stderr 的待写数据冲出去，再显式退出。
 *
 * 为什么要 exit：`node-screenshots` 的原生显示器枚举会在进程里留下 CFRunLoop 句柄，
 * `getScreenDisplays()` 之后事件循环不会自然清空——表现就是命令已经打印完却不返回。
 * 这不是本文件能修的底层问题，所以这里显式收口，并用 `write('', cb)` 保证管道里的输出不被截断。
 */
function flushAndExit(code: number): void {
  process.exitCode = code
  let exited = false
  const done = () => {
    if (exited) return
    exited = true
    process.exit(code)
  }
  const timer = setTimeout(done, 250)
  timer.unref?.()
  try {
    process.stdout.write('', () => {
      try {
        process.stderr.write('', done)
      } catch {
        done()
      }
    })
  } catch {
    done()
  }
}

main()
  .then(flushAndExit)
  .catch((error) => {
    const host = createCliHost()
    writeError(host, renderPanel(host, 'error', [error instanceof Error ? error.stack ?? error.message : String(error)], { color: 'red' }))
    flushAndExit(1)
  })
