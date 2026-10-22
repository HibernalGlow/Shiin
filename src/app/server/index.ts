/**
 * 本地 Web 宿主：浏览器只做显示，所有动作仍然落到同一个 ScreenshotManager。
 *
 * TUI 在进程内直接调用 manager；这里只是把同样的调用包成 HTTP + SSE。
 * 默认只监听回环地址，并校验 Host/Origin，防止任意网页通过 localhost 触发截图或监听。
 */

import fs from 'node:fs'
import http, { type IncomingMessage, type ServerResponse } from 'node:http'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import {
  captureMacScreenNative,
  evaluateMissingPermissions,
  getActiveWindowInfo,
  getCaptureWindows,
  getScreenDisplays,
  resolveScreenshotSaveDir,
  testDirectoryAccess,
  type CaptureDisplayInfo,
  type CaptureWindowInfo,
  type GamepadDeviceInfo,
  type IConfigStorage,
  type MacOSPermissionsStatus,
  type MacPermissionPane,
  type PermissionTargetType,
  type ScreenshotConfig,
  type ScreenshotPermissionTestResult,
  type ScreenshotResult,
  ScreenShotSaveWayEnum,
  type ScreenshotManager,
} from '../../core/index.js'
import { clipboardImageSupported, createClipboardWriter } from '../cli/clipboard.js'
import { showOverlayNotification, type OverlayRequest } from '../cli/overlay.js'

const execFileAsync = promisify(execFile)

const MAX_BODY_BYTES = 2 * 1024 * 1024
const HEARTBEAT_MS = 15_000

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

export interface WebHostManager {
  config: ScreenshotConfig
  storage: IConfigStorage
  readonly listening: boolean
  gamepad: {
    getConnectedDevices(): GamepadDeviceInfo[]
    getActiveDeviceIndex(): number
    getCurrentButtons(): boolean[]
    getCurrentAxes(): number[]
    openDevice(index: number): boolean
    closeDevice(): void
    injectWebGamepadState?(devices: GamepadDeviceInfo[], buttons: boolean[], axes: number[]): void
  }
  startListening(deviceIndex?: number): Promise<{ ok: boolean; reason?: string }>
  stopListening(): void
  capture(options?: Parameters<ScreenshotManager['capture']>[0]): Promise<ScreenshotResult>
  saveOBSReplay(): Promise<{ ok: boolean; error?: string }>
  syncConfig(patch: Partial<ScreenshotConfig>): void
  subscribe(listener: (event: { type: string; data?: unknown }) => void): () => void
  dispose(): void
}

export interface WebServerOptions {
  manager: WebHostManager
  /** `dist/ui` 目录，必须包含 index.html。 */
  root: string
  host?: string
  port?: number
  /** 只在没有页面通过 SSE 连接时触发，用于后台快门声/系统通知。 */
  onBackgroundEvent?: (event: { type: string; data?: unknown }) => void
}

export interface WebServerHandle {
  server: http.Server
  url: string
  port: number
  close(): Promise<void>
}

class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  if (res.writableEnded) return
  const text = JSON.stringify(payload)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(text),
  })
  res.end(text)
}

function sendText(res: ServerResponse, status: number, text: string): void {
  if (res.writableEnded) return
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(text),
  })
  res.end(text)
}

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > MAX_BODY_BYTES) throw new HttpError(413, 'request body too large')
    chunks.push(buffer)
  }
  if (size === 0) return {}
  let parsed: unknown
  try {
    parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new HttpError(400, 'invalid JSON body')
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new HttpError(400, 'JSON body must be an object')
  }
  return parsed as Record<string, unknown>
}

function hostnameOf(authority: string | undefined): string | null {
  if (!authority) return null
  try {
    return new URL(`http://${authority}`).hostname.replace(/^\[|\]$/g, '').toLowerCase()
  } catch {
    return null
  }
}

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '0:0:0:0:0:0:0:1'])

function isLoopbackHostname(hostname: string): boolean {
  return LOOPBACK_HOSTS.has(hostname)
}

/**
 * 本地工具的安全底线：
 * - `Host` 必须是回环地址（防 DNS rebinding）；
 * - 带 `Origin` 的请求必须同源或来自回环页面（防任意网页 POST localhost）。
 * 监听非回环地址时放宽为"Origin 必须与 Host 相同"，并应由使用者自行加反代鉴权。
 */
function requestAllowed(req: IncomingMessage, loopbackOnly: boolean): boolean {
  const host = hostnameOf(req.headers.host)
  if (!host) return false
  if (loopbackOnly && !isLoopbackHostname(host)) return false

  const origin = req.headers.origin
  if (!origin) return true
  if (origin === 'null') return false
  try {
    const originHost = new URL(origin).hostname.replace(/^\[|\]$/g, '').toLowerCase()
    if (loopbackOnly) return isLoopbackHostname(originHost)
    return originHost === host
  } catch {
    return false
  }
}

function parseIndex(value: unknown): number | null {
  const numeric = typeof value === 'number' ? value : Number(value)
  return Number.isInteger(numeric) && numeric >= 0 ? numeric : null
}

async function openPath(target: string): Promise<void> {
  if (process.platform === 'darwin') {
    await execFileAsync('/usr/bin/open', [target])
    return
  }
  if (process.platform === 'win32') {
    await execFileAsync('explorer.exe', [target])
    return
  }
  await execFileAsync('xdg-open', [target])
}

async function revealPath(target: string): Promise<void> {
  if (process.platform === 'darwin') {
    await execFileAsync('/usr/bin/open', ['-R', target])
    return
  }
  if (process.platform === 'win32') {
    await execFileAsync('explorer.exe', [`/select,${target}`])
    return
  }
  await openPath(path.dirname(target))
}

async function selectFolderMac(): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync('/usr/bin/osascript', [
      '-e',
      'POSIX path of (choose folder with prompt "请选择截图保存目录 / Select Screenshot Folder")',
    ])
    return stdout.trim() || null
  } catch {
    return null
  }
}

async function selectFolderWindows(): Promise<string | null> {
  const script = [
    'Add-Type -AssemblyName System.Windows.Forms;',
    '$dialog = New-Object System.Windows.Forms.FolderBrowserDialog;',
    "if ($dialog.ShowDialog() -eq 'OK') { Write-Output $dialog.SelectedPath }",
  ].join(' ')
  try {
    const { stdout } = await execFileAsync('powershell', ['-NoProfile', '-STA', '-Command', script])
    return stdout.trim() || null
  } catch {
    return null
  }
}

async function selectFolderLinux(): Promise<string | null> {
  for (const [command, args] of [
    ['zenity', ['--file-selection', '--directory']],
    ['kdialog', ['--getexistingdirectory']],
  ] as const) {
    try {
      const { stdout } = await execFileAsync(command, [...args])
      return stdout.trim() || null
    } catch {
      // 换下一个可用的对话框工具
    }
  }
  return null
}

async function selectFolder(): Promise<string | null> {
  if (process.platform === 'darwin') return await selectFolderMac()
  if (process.platform === 'win32') return await selectFolderWindows()
  return await selectFolderLinux()
}

const MAC_PREFERENCE_URLS: Record<MacPermissionPane, string> = {
  screen: 'x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture',
  accessibility: 'x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility',
  input: 'x-apple.systempreferences:com.apple.preference.security?Privacy_ListenEvent',
  files: 'x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles',
}

function preferencePaneForTarget(target: PermissionTargetType): MacPermissionPane {
  if (target === 'accessibility') return 'accessibility'
  if (target === 'input') return 'input'
  if (target === 'files' || target === 'folder') return 'files'
  return 'screen'
}

async function openPreferencePane(pane: MacPermissionPane): Promise<boolean> {
  if (process.platform !== 'darwin') return false
  try {
    await execFileAsync('/usr/bin/open', [MAC_PREFERENCE_URLS[pane] ?? MAC_PREFERENCE_URLS.screen])
    return true
  } catch {
    return false
  }
}

async function probePermissions(
  manager: WebHostManager,
  options: { activeProbe?: boolean; screenCaptureHint?: boolean } = {},
): Promise<MacOSPermissionsStatus> {
  const dirTest = testDirectoryAccess(manager.config.path)
  const isMac = process.platform === 'darwin'

  if (!isMac) {
    const { missing, hasCriticalMissing, allGranted } = evaluateMissingPermissions({
      isMac: false,
      screenCapture: true,
      accessibility: true,
      folderAccess: dirTest.ok,
    })
    return {
      isMac: false,
      platform: process.platform,
      screenCapture: true,
      screenCaptureStatus: 'granted',
      accessibility: true,
      accessibilityStatus: 'granted',
      inputMonitoring: true,
      folderAccess: dirTest.ok,
      resolvedSavePath: dirTest.resolvedPath,
      folderError: dirTest.error,
      windowRecognition: true,
      detectedWindowsCount: 0,
      gamepadAccess: true,
      detectedGamepadsCount: manager.gamepad.getConnectedDevices().length,
      allGranted,
      hasCriticalMissing,
      missingPermissions: missing,
      checkedAt: Date.now(),
    }
  }

  let screenCapture = options.screenCaptureHint ?? false
  let screenCaptureStatus: MacOSPermissionsStatus['screenCaptureStatus'] = screenCapture ? 'granted' : 'unknown'
  if (!screenCapture && options.activeProbe) {
    try {
      const buffer = await captureMacScreenNative({ format: 'png' })
      screenCapture = Boolean(buffer && buffer.length > 0)
      screenCaptureStatus = screenCapture ? 'granted' : 'denied'
    } catch {
      screenCapture = false
      screenCaptureStatus = 'denied'
    }
  }

  let detectedWindowsCount = 0
  let activeWindowTitle = ''
  let windowRecognition = true
  let windowError: string | undefined
  try {
    const windows = await getCaptureWindows()
    detectedWindowsCount = windows.length
    const active = await getActiveWindowInfo()
    activeWindowTitle = active?.title ?? ''
  } catch (error) {
    windowRecognition = false
    windowError = error instanceof Error ? error.message : String(error)
  }

  const accessibility = detectedWindowsCount > 0 || Boolean(activeWindowTitle)
  const { missing, hasCriticalMissing, allGranted } = evaluateMissingPermissions({
    isMac,
    screenCapture,
    accessibility,
    folderAccess: dirTest.ok,
  })

  return {
    isMac,
    platform: process.platform,
    screenCapture,
    screenCaptureStatus,
    accessibility,
    accessibilityStatus: accessibility ? 'granted' : 'denied',
    inputMonitoring: accessibility,
    folderAccess: dirTest.ok,
    resolvedSavePath: dirTest.resolvedPath,
    folderError: dirTest.error,
    windowRecognition,
    detectedWindowsCount,
    activeWindowTitle,
    windowError,
    gamepadAccess: true,
    detectedGamepadsCount: manager.gamepad.getConnectedDevices().length,
    allGranted,
    hasCriticalMissing,
    missingPermissions: missing,
    checkedAt: Date.now(),
  }
}

function resultPreview(result: ScreenshotResult): { previewDataUrl?: string; latencyMs?: number } {
  if (!result.ok || !result.filePath || !fs.existsSync(result.filePath)) return {}
  try {
    const buffer = fs.readFileSync(result.filePath)
    const mimeMap: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      avif: 'image/avif',
    }
    const mime = mimeMap[result.format] || 'image/jpeg'
    return { previewDataUrl: `data:${mime};base64,${buffer.toString('base64')}` }
  } catch {
    return {}
  }
}

function captureWithClipboard(manager: WebHostManager): Promise<ScreenshotResult> {
  const writesClipboard = manager.config.screenShotSaveWay !== ScreenShotSaveWayEnum.FileOnly
  const clipboardReady = !writesClipboard || clipboardImageSupported()
  return manager.capture({
    writeClipboard:
      writesClipboard && clipboardReady ? createClipboardWriter(manager.config.imageFormat) : undefined,
  })
}

export async function startWebServer(options: WebServerOptions): Promise<WebServerHandle> {
  const root = path.resolve(options.root)
  if (!fs.existsSync(path.join(root, 'index.html'))) {
    throw new Error(`UI build not found at ${root}. Run "pnpm build:app-ui" first.`)
  }

  const host = options.host?.trim() || '127.0.0.1'
  const loopbackOnly = isLoopbackHostname(host.replace(/^\[|\]$/g, '').toLowerCase()) || host === 'localhost'
  const manager = options.manager
  const sseClients = new Set<ServerResponse>()

  const initialDevice = manager.gamepad.getConnectedDevices()[0]
  if (initialDevice) manager.gamepad.openDevice(initialDevice._index)

  const unsubscribe = manager.subscribe((event) => {
    if (event.type === 'deviceChanged') {
      const devices = Array.isArray(event.data) ? (event.data as GamepadDeviceInfo[]) : []
      if (devices.length > 0) manager.gamepad.openDevice(devices[0]._index)
    }
    const payload = `event: ${event.type}\ndata: ${JSON.stringify({ type: event.type, data: event.data ?? null })}\n\n`
    for (const client of sseClients) {
      try {
        client.write(payload)
      } catch {
        sseClients.delete(client)
      }
    }
    if (sseClients.size === 0) {
      try {
        options.onBackgroundEvent?.({ type: event.type, data: event.data })
      } catch (error) {
        console.warn('[WebHost] background event handler failed:', error)
      }
    }
  })

  const heartbeat = setInterval(() => {
    for (const client of sseClients) {
      try {
        client.write(': ping\n\n')
      } catch {
        sseClients.delete(client)
      }
    }
  }, HEARTBEAT_MS)
  heartbeat.unref?.()

  async function serveStatic(req: IncomingMessage, res: ServerResponse, pathname: string): Promise<void> {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      sendText(res, 405, 'Method Not Allowed')
      return
    }

    let decoded: string
    try {
      decoded = decodeURIComponent(pathname)
    } catch {
      sendText(res, 400, 'Bad Request')
      return
    }
    if (decoded.includes('\0')) {
      sendText(res, 400, 'Bad Request')
      return
    }

    const relative = decoded.replace(/^\/+/, '')
    let filePath = path.resolve(root, relative)
    if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
      sendText(res, 403, 'Forbidden')
      return
    }

    try {
      const stat = await fs.promises.stat(filePath)
      if (stat.isDirectory()) filePath = path.join(filePath, 'index.html')
    } catch {
      if (path.extname(relative)) {
        sendText(res, 404, 'Not Found')
        return
      }
      filePath = path.join(root, 'index.html')
    }

    try {
      const stat = await fs.promises.stat(filePath)
      if (!stat.isFile()) throw new Error('not a file')
      const ext = path.extname(filePath).toLowerCase()
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] ?? 'application/octet-stream',
        'Content-Length': stat.size,
        'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=3600',
      })
      if (req.method === 'HEAD') {
        res.end()
        return
      }
      fs.createReadStream(filePath).pipe(res)
    } catch {
      sendText(res, 404, 'Not Found')
    }
  }

  async function handleApi(req: IncomingMessage, res: ServerResponse, pathname: string, url: URL): Promise<void> {
    const route = `${req.method ?? 'GET'} ${pathname}`

    switch (route) {
      case 'GET /api/state': {
        sendJson(res, 200, {
          config: manager.config,
          listening: manager.listening,
          activeGamepadIndex: manager.gamepad.getActiveDeviceIndex(),
          devices: manager.gamepad.getConnectedDevices(),
          lightweightMode: false,
          platform: process.platform,
          isMac: process.platform === 'darwin',
        })
        return
      }

      case 'GET /api/gamepads': {
        sendJson(res, 200, manager.gamepad.getConnectedDevices())
        return
      }

      case 'GET /api/gamepad/state': {
        sendJson(res, 200, {
          buttons: manager.gamepad.getCurrentButtons(),
          axes: manager.gamepad.getCurrentAxes(),
          activeIndex: manager.gamepad.getActiveDeviceIndex(),
        })
        return
      }

      case 'POST /api/gamepads/open': {
        const body = await readJsonBody(req)
        const device = body.device && typeof body.device === 'object' ? (body.device as Record<string, unknown>) : {}
        const index = parseIndex(device._index ?? body.index)
        if (index === null) throw new HttpError(400, 'device index required')
        const ok = manager.gamepad.openDevice(index)
        sendJson(res, 200, { ok, activeIndex: manager.gamepad.getActiveDeviceIndex() })
        return
      }

      case 'POST /api/gamepads/close': {
        manager.gamepad.closeDevice()
        sendJson(res, 200, { ok: true })
        return
      }

      case 'POST /api/gamepad/sync': {
        const body = await readJsonBody(req)
        const devices = Array.isArray(body.devices) ? (body.devices as GamepadDeviceInfo[]) : []
        const buttons = Array.isArray(body.buttons) ? (body.buttons as boolean[]).map(Boolean) : []
        const axes = Array.isArray(body.axes) ? (body.axes as number[]).map((a) => Number(a) || 0) : []
        if (typeof (manager.gamepad as any).injectWebGamepadState === 'function') {
          (manager.gamepad as any).injectWebGamepadState(devices, buttons, axes)
        }
        sendJson(res, 200, { ok: true })
        return
      }

      case 'POST /api/listen/start': {
        const body = await readJsonBody(req)
        if (body.config && typeof body.config === 'object') {
          manager.syncConfig(body.config as Partial<ScreenshotConfig>)
        }
        const result = await manager.startListening()
        sendJson(res, 200, result)
        return
      }

      case 'POST /api/listen/stop': {
        manager.stopListening()
        sendJson(res, 200, { ok: true })
        return
      }

      case 'GET /api/listen/state': {
        sendJson(res, 200, { listening: manager.listening })
        return
      }

      case 'POST /api/store/get': {
        const body = await readJsonBody(req)
        const key = typeof body.key === 'string' ? body.key.trim() : ''
        if (!key) throw new HttpError(400, 'key required')
        const value = await manager.storage.get(key, body.defaultValue)
        sendJson(res, 200, { value })
        return
      }

      case 'POST /api/store/set': {
        const body = await readJsonBody(req)
        const key = typeof body.key === 'string' ? body.key.trim() : ''
        if (!key) throw new HttpError(400, 'key required')
        await manager.storage.set(key, body.value)
        if (key === 'globalConfig') {
          try {
            const parsed = typeof body.value === 'string' ? JSON.parse(body.value) : body.value
            if (parsed && typeof parsed === 'object') manager.syncConfig(parsed as Partial<ScreenshotConfig>)
          } catch {
            // 坏配置不阻断存储：下一次读取会回退到默认值
          }
        }
        sendJson(res, 200, { ok: true })
        return
      }

      case 'POST /api/capture':
      case 'POST /api/test-screenshot': {
        const body = await readJsonBody(req)
        if (body.config && typeof body.config === 'object') {
          manager.syncConfig(body.config as Partial<ScreenshotConfig>)
        }
        const startedAt = Date.now()
        let result: ScreenshotResult
        if (route === 'POST /api/test-screenshot') {
          result = await captureWithClipboard(manager)
          const permissions = await probePermissions(manager, {
            screenCaptureHint: result.ok ? true : undefined,
          })
          const payload: ScreenshotPermissionTestResult = {
            ok: result.ok,
            granted: result.ok,
            filePath: result.filePath,
            sizeBytes: result.sizeBytes,
            latencyMs: Date.now() - startedAt,
            error: result.error,
            permissions,
            ...resultPreview(result),
          }
          sendJson(res, 200, payload)
          return
        }
        result = await captureWithClipboard(manager)
        sendJson(res, 200, { ...result, latencyMs: Date.now() - startedAt })
        return
      }

      case 'GET /api/screens': {
        sendJson(res, 200, await getScreenDisplays())
        return
      }

      case 'GET /api/windows': {
        sendJson(res, 200, await getCaptureWindows())
        return
      }

      case 'GET /api/permissions': {
        // Web 宿主没有 systemPreferences；回环默认做一次轻量探测，
        // 否则页面启动时会把"未知"误判成"未授权"。
        const activeProbe = url.searchParams.get('activeProbe') !== '0'
        sendJson(res, 200, await probePermissions(manager, { activeProbe }))
        return
      }

      case 'POST /api/request-permission': {
        const body = await readJsonBody(req)
        const target = (typeof body.target === 'string' ? body.target : 'all') as PermissionTargetType
        if (process.platform === 'darwin') {
          await openPreferencePane(preferencePaneForTarget(target))
        }
        sendJson(res, 200, await probePermissions(manager, { activeProbe: true }))
        return
      }

      case 'POST /api/open-preference': {
        const body = await readJsonBody(req)
        const pane = (typeof body.pane === 'string' ? body.pane : 'screen') as MacPermissionPane
        sendJson(res, 200, { ok: await openPreferencePane(pane) })
        return
      }

      case 'POST /api/open-folder': {
        const body = await readJsonBody(req)
        const requested = typeof body.path === 'string' && body.path.trim() ? body.path : manager.config.path
        const targetPath = resolveScreenshotSaveDir(requested)
        try {
          await openPath(targetPath)
          sendJson(res, 200, { ok: true, path: targetPath })
        } catch (error) {
          sendJson(res, 200, {
            ok: false,
            path: targetPath,
            error: error instanceof Error ? error.message : String(error),
          })
        }
        return
      }

      case 'POST /api/show-in-folder': {
        const body = await readJsonBody(req)
        const target = typeof body.path === 'string' ? body.path : ''
        if (!target) throw new HttpError(400, 'path required')
        try {
          await revealPath(path.resolve(target))
          sendJson(res, 200, { ok: true })
        } catch (error) {
          sendJson(res, 200, { ok: false, error: error instanceof Error ? error.message : String(error) })
        }
        return
      }

      case 'POST /api/select-folder': {
        sendJson(res, 200, { path: await selectFolder() })
        return
      }

      case 'POST /api/obs/save-replay': {
        sendJson(res, 200, await manager.saveOBSReplay())
        return
      }

      case 'POST /api/notify': {
        const body = ((await readJsonBody(req)) || {}) as Record<string, unknown>
        const request: OverlayRequest = {
          title: typeof body.title === 'string' ? body.title : undefined,
          desc: typeof body.desc === 'string' ? body.desc : undefined,
          img: typeof body.img === 'string' ? body.img : undefined,
          type: body.type === 'video' || body.type === 'text' ? body.type : undefined,
          duration: typeof body.duration === 'number' ? body.duration : undefined,
          position: body.position === 'left' || body.position === 'right' ? body.position : undefined,
          scale: typeof body.scale === 'number' ? body.scale : undefined,
        }
        const force = Boolean(body.force)
        const notifyConfig = force ? { ...manager.config, overlayNotify: 'show' as const } : manager.config
        const result = showOverlayNotification(request, notifyConfig)
        sendJson(res, 200, { ok: true, ...result })
        return
      }

      case 'GET /api/events': {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-store, no-transform',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no',
        })
        res.write(': connected\n\n')
        res.write(
          `event: ready\ndata: ${JSON.stringify({
            type: 'ready',
            data: {
              listening: manager.listening,
              devices: manager.gamepad.getConnectedDevices(),
              activeGamepadIndex: manager.gamepad.getActiveDeviceIndex(),
            },
          })}\n\n`,
        )
        sseClients.add(res)
        res.on('close', () => {
          sseClients.delete(res)
        })
        return
      }

      default: {
        sendJson(res, 404, { ok: false, error: 'Not Found' })
      }
    }
  }

  const server = http.createServer((req, res) => {
    void (async () => {
      try {
        if (!requestAllowed(req, loopbackOnly)) {
          sendText(res, 403, 'Forbidden')
          return
        }
        const url = new URL(req.url ?? '/', 'http://localhost')
        const pathname = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname
        if (pathname.startsWith('/api/')) {
          await handleApi(req, res, pathname, url)
          return
        }
        await serveStatic(req, res, pathname)
      } catch (error) {
        if (error instanceof HttpError) {
          sendJson(res, error.status, { ok: false, error: error.message })
          return
        }
        console.error('[WebHost] request failed:', error)
        sendJson(res, 500, { ok: false, error: 'Internal Server Error' })
      }
    })()
  })

  await new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => {
      server.off('listening', onListening)
      reject(error)
    }
    const onListening = () => {
      server.off('error', onError)
      resolve()
    }
    server.once('error', onError)
    server.once('listening', onListening)
    server.listen(options.port ?? 3800, host)
  })

  const address = server.address()
  const actualPort = typeof address === 'object' && address ? address.port : (options.port ?? 3800)
  const urlHost = host === '0.0.0.0' || host === '::' ? '127.0.0.1' : host
  const displayHost = urlHost.includes(':') && !urlHost.startsWith('[') ? `[${urlHost}]` : urlHost

  let closed = false
  const close = async (): Promise<void> => {
    if (closed) return
    closed = true
    clearInterval(heartbeat)
    unsubscribe()
    for (const client of sseClients) {
      try {
        client.end()
      } catch {
        // ignore
      }
    }
    sseClients.clear()
    await new Promise<void>((resolve) => {
      server.close(() => resolve())
      server.closeIdleConnections?.()
      server.closeAllConnections?.()
    })
  }

  return {
    server,
    url: `http://${displayHost}:${actualPort}`,
    port: actualPort,
    close,
  }
}
