import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import screenshot from 'screenshot-desktop'
import { Window as ScreenshotWindow, Monitor as ScreenshotMonitor } from 'node-screenshots'
import activeWin from 'active-win'
import {
  type ScreenshotConfig,
  type CaptureDisplayInfo,
  type CaptureWindowInfo,
  type ActiveWinResult,
  type ScreenshotResult,
  ScreenShotSaveWayEnum,
  CaptureTargetTypeEnum,
} from './types.js'
import { formatFileName, sanitizeToValidFolderName } from './filename.js'
import { isDirectoryWritable } from './config.js'

const execFileAsync = promisify(execFile)

// 确保 macOS 独立打包 (.app) 环境下 PATH 包含 /usr/sbin (screencapture, system_profiler 所在目录)
if (process.platform === 'darwin') {
  const extraPaths = ['/usr/sbin', '/sbin', '/opt/homebrew/bin', '/usr/local/bin']
  const currentPath = process.env.PATH || '/usr/bin:/bin'
  const merged = Array.from(new Set([...currentPath.split(':'), ...extraPaths])).filter(Boolean)
  process.env.PATH = merged.join(':')
}

/**
 * 解析并确保截图保存目录可用（解决 macOS `.app` 下 process.cwd() 为只读 `/` 导致无法创建或打开目录的问题）
 *
 * @param preferCwd - 未配置目录时是否允许落在 `<cwd>/screenshots`。默认 true；
 *   全局安装的 CLI 从任意目录调用时传 false，落到 `~/Pictures/Shiin`。
 */
export function resolveScreenshotSaveDir(configuredPath?: string, preferCwd = true): string {
  const home = os.homedir()
  const picturesFallback = path.join(home, 'Pictures', 'Shiin')
  const raw = typeof configuredPath === 'string' ? configuredPath.trim() : ''

  let candidate = ''
  if (raw) {
    if (raw === '~') {
      candidate = home
    } else if (raw.startsWith('~/') || raw.startsWith('~\\')) {
      candidate = path.join(home, raw.slice(2))
    } else if (path.isAbsolute(raw)) {
      candidate = path.normalize(raw)
    } else {
      // 相对路径（如 ./screenshots）：如果当前工作目录可写则基于 cwd，否则基于用户图片目录
      const cwd = process.cwd()
      if (preferCwd && isDirectoryWritable(cwd)) {
        candidate = path.resolve(cwd, raw)
      } else {
        candidate = raw === './screenshots' || raw === 'screenshots'
          ? picturesFallback
          : path.resolve(picturesFallback, raw)
      }
    }
  } else {
    const cwd = process.cwd()
    if (preferCwd && isDirectoryWritable(cwd) && cwd !== home) {
      candidate = path.resolve(cwd, 'screenshots')
    } else {
      candidate = picturesFallback
    }
  }

  // 防止落入 macOS 只读根目录 `/screenshots` 或 `.app/Contents`
  if (candidate === '/screenshots' || candidate === '/' || candidate.includes('.app/Contents')) {
    candidate = picturesFallback
  }

  const safeFallback = path.join(home, 'screenshots')
  const appData = process.env.APPDATA || path.join(home, 'AppData', 'Roaming')
  // Windows 上 `~/Pictures` 可能是指向已失效 OneDrive 的 junction（本机就是），
  // 递归 mkdir 会直接 ENOENT；这种情况下退到 AppData。
  const fallbacks = process.platform === 'win32'
    ? [path.join(appData, 'Shiin', 'Screenshots'), safeFallback]
    : [safeFallback]

  const ensureWritable = (dir: string): void => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    // 测试是否真正具备写入权限（防止 Windows 坏死 Junction 或只读目录）
    const testFile = path.join(dir, `.shiin_probe_${Date.now()}`)
    fs.writeFileSync(testFile, '')
    fs.unlinkSync(testFile)
  }

  try {
    ensureWritable(candidate)
    return candidate
  } catch {
    for (const dir of fallbacks) {
      try {
        ensureWritable(dir)
        return dir
      } catch {
        // 继续试下一个
      }
    }
    return safeFallback
  }
}

/**
 * 实测截图目录的创建与读写权限
 */
export function testDirectoryAccess(configuredPath?: string): {
  ok: boolean
  resolvedPath: string
  writable: boolean
  error?: string
} {
  const resolvedPath = resolveScreenshotSaveDir(configuredPath)
  const probeFile = path.join(resolvedPath, `.shiin_perm_probe_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`)
  try {
    if (!fs.existsSync(resolvedPath)) {
      fs.mkdirSync(resolvedPath, { recursive: true })
    }
    fs.writeFileSync(probeFile, 'ok', 'utf-8')
    const content = fs.readFileSync(probeFile, 'utf-8')
    fs.unlinkSync(probeFile)
    return {
      ok: content === 'ok',
      resolvedPath,
      writable: true,
    }
  } catch (err: any) {
    try {
      if (fs.existsSync(probeFile)) fs.unlinkSync(probeFile)
    } catch {}
    return {
      ok: false,
      resolvedPath,
      writable: false,
      error: err?.message || String(err),
    }
  }
}

/**
 * 屏幕黑帧抽样判定算法（防止截到 DirectX / Vulkan 全屏未渲染黑屏或无权限全黑画面）
 */
export function isLikelyBlackGameFrame(raw: Buffer | Uint8Array, width: number, height: number): boolean {
  if (!raw || raw.length < width * height * 4 || width <= 0 || height <= 0) {
    return true
  }

  const step = width * height > 1920 * 1080 ? 8 : 4
  let sampled = 0
  let dark = 0
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const offset = (y * width + x) * 4
      const r = raw[offset]
      const g = raw[offset + 1]
      const b = raw[offset + 2]
      sampled++
      if (r <= 8 && g <= 8 && b <= 8) dark++
    }
  }

  return sampled > 0 && dark / sampled >= 0.995
}

/**
 * 获取屏幕列表（保证在 macOS Apple Silicon 及各平台下始终有保底主显示器）
 */
export async function getScreenDisplays(): Promise<CaptureDisplayInfo[]> {
  // 1. 优先尝试通过 node-screenshots 获取带真实分辨率的物理显示器信息
  try {
    const monitors = ScreenshotMonitor.all()
    if (Array.isArray(monitors) && monitors.length > 0) {
      return monitors.map((m: any, idx: number) => {
        const id = typeof m.id === 'function' ? m.id() : m.id
        const name = typeof m.name === 'function' ? m.name() : m.name
        const width = typeof m.width === 'function' ? m.width() : m.width
        const height = typeof m.height === 'function' ? m.height() : m.height
        const resLabel = width && height ? ` (${width}×${height})` : ''
        return {
          id: id ?? idx,
          name: `${name || `Display ${idx + 1}`}${resLabel}`,
        }
      })
    }
  } catch {
    // ignore and fallback
  }

  // 2. 尝试通过 screenshot-desktop 枚举
  try {
    const displays = await screenshot.listDisplays()
    if (Array.isArray(displays) && displays.length > 0) {
      return displays.map((d: { id: string | number; name: string }, idx: number) => ({
        id: d.id ?? idx,
        name: d.name || `Display ${idx + 1}`,
      }))
    }
  } catch (err) {
    console.warn('[ScreenshotCore] screenshot.listDisplays fallback:', err)
  }

  // 3. 保底返回主显示器（避免 macOS Apple Silicon 下 SPDisplaysDataType 解析为空导致下拉框空白）
  return [
    {
      id: 0,
      name: process.platform === 'darwin' ? 'Built-in Retina Display (主显示器)' : 'Primary Display (主显示器)',
    },
  ]
}

/**
 * 获取可捕获窗口列表（过滤无标题或极小窗口，在 macOS 辅助功能未授权时自动回退到 CGWindowList）
 */
export async function getCaptureWindows(): Promise<CaptureWindowInfo[]> {
  try {
    if (typeof activeWin.getOpenWindows === 'function') {
      const windows = await activeWin.getOpenWindows()
      const filtered = windows
        .filter((item: any) => item && item.id && item.title && item.bounds)
        .filter((item: any) => item.bounds.width > 30 && item.bounds.height > 30)
        .filter((item: any) => item.bounds.x > -10000 && item.bounds.y > -10000)
        .map((item: any) => ({
          id: item.id,
          title: item.title,
          ownerName: item.owner?.name || '',
          processId: item.owner?.processId || 0,
          path: item.owner?.path || '',
          bounds: item.bounds,
        }))
      if (filtered.length > 0) {
        return filtered
      }
    }
  } catch (err: any) {
    console.warn('[ScreenshotCore] activeWin.getOpenWindows failed, trying ScreenshotWindow.all fallback:', err?.message || err)
  }

  // 回退方案：使用 node-screenshots 的原生窗口枚举（无需 Accessibility 权限即可列出窗口基本信息）
  try {
    const rawWins = ScreenshotWindow.all()
    if (Array.isArray(rawWins) && rawWins.length > 0) {
      return rawWins
        .map((w: any) => {
          const id = typeof w.id === 'function' ? w.id() : w.id
          const title = typeof w.title === 'function' ? w.title() : w.title
          const appName = typeof w.appName === 'function' ? w.appName() : w.appName
          const pid = typeof w.pid === 'function' ? w.pid() : (w.processId ?? 0)
          const x = typeof w.x === 'function' ? w.x() : (w.x ?? 0)
          const y = typeof w.y === 'function' ? w.y() : (w.y ?? 0)
          const width = typeof w.width === 'function' ? w.width() : (w.width ?? 0)
          const height = typeof w.height === 'function' ? w.height() : (w.height ?? 0)
          return {
            id,
            title: title || appName || `Window #${id}`,
            ownerName: appName || '',
            processId: pid,
            path: '',
            bounds: { x, y, width, height },
          }
        })
        .filter((item) => item.id && item.title && item.bounds.width > 30 && item.bounds.height > 30)
    }
  } catch (fallbackErr) {
    console.warn('[ScreenshotCore] ScreenshotWindow.all fallback failed:', fallbackErr)
  }

  return []
}

export interface ResolvedWindowTarget {
  id: string | number
  title?: string
  ownerName?: string
  /** 解析聚焦窗口时已经取过的前台信息，复用它给文件名模板，避免再调一次 active-win。 */
  active?: ActiveWinResult | null
}

function findWindowByHints(
  windows: CaptureWindowInfo[],
  hints: { title?: string; ownerName?: string },
): CaptureWindowInfo | undefined {
  const title = hints.title?.trim()
  if (title) {
    const exact = windows.filter((window) => window.title === title)
    if (exact.length === 1) return exact[0]
    if (exact.length > 1) {
      const ownerName = hints.ownerName?.trim()
      return ownerName ? exact.find((window) => window.ownerName === ownerName) : undefined
    }
  }

  const ownerName = hints.ownerName?.trim()
  if (ownerName) {
    const owned = windows.filter((window) => window.ownerName === ownerName)
    if (owned.length === 1) return owned[0]
  }
  return undefined
}

/**
 * active-win 在 macOS 权限不足时只回退到前台应用名（没有窗口 id）。
 * 这时按标题 / 唯一属主把前台窗口对回可捕获窗口列表；对不上就明确报错，不猜一个窗口。
 */
export function pickFocusedWindow(
  active: ActiveWinResult | null,
  windows: CaptureWindowInfo[],
): ResolvedWindowTarget {
  if (active?.id !== undefined && active.id !== null) {
    return { id: active.id, title: active.title, ownerName: active.owner?.name, active }
  }

  const matched = active ? findWindowByHints(windows, { title: active.title, ownerName: active.owner?.name }) : undefined
  if (matched) {
    return { id: matched.id, title: matched.title, ownerName: matched.ownerName, active }
  }

  throw new Error(
    active?.title
      ? `Focused window "${active.title}" is not a capturable window on this desktop.`
      : 'No focused window detected. Focus the target window and try again.',
  )
}

/**
 * 按配置解析这一次截图要用的窗口：
 * - specified：用保存的 windowSourceId（没选就报错，不静默换成别的窗口）
 * - focused：每次触发时重新读取当前聚焦的前台窗口
 */
export async function resolveWindowCaptureTarget(
  config: Pick<ScreenshotConfig, 'windowCaptureMode' | 'windowSourceId'>,
): Promise<ResolvedWindowTarget> {
  if (config.windowCaptureMode === 'focused') {
    const active = await getActiveWindowInfo()
    if (active?.id !== undefined && active.id !== null) {
      return { id: active.id, title: active.title, ownerName: active.owner?.name, active }
    }
    return pickFocusedWindow(active, await getCaptureWindows())
  }

  const id = config.windowSourceId
  if (id === undefined || id === null || id === '') {
    throw new Error(
      'No target window selected. Pick a window, or switch the window capture mode to "focused".',
    )
  }
  return { id }
}

/**
 * 获取当前聚焦的前台活动窗口信息
 */
export async function getActiveWindowInfo(): Promise<ActiveWinResult | null> {
  try {
    const win = await activeWin()
    if (win) {
      return {
        title: win.title,
        id: win.id,
        bounds: win.bounds,
        owner: win.owner,
      }
    }
  } catch {
    // ignore and fallback
  }

  // macOS 回退：通过 System Events 获取当前前台应用名
  if (process.platform === 'darwin') {
    try {
      const { stdout } = await execFileAsync('/usr/bin/osascript', [
        '-e',
        'tell application "System Events" to get name of first application process whose frontmost is true',
      ])
      const appName = stdout.trim()
      if (appName) {
        return {
          title: appName,
          owner: { name: appName, processId: 0, path: '' },
        }
      }
    } catch {
      // ignore
    }
  }

  return null
}

/**
 * 超时控制辅助函数
 */
function withTimeout<T>(promise: Promise<T>, ms: number, errMsg = 'Operation timed out'): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(errMsg))
    }, ms)
    promise
      .then((val) => {
        clearTimeout(timer)
        resolve(val)
      })
      .catch((err) => {
        clearTimeout(timer)
        reject(err)
      })
  })
}

/**
 * macOS 原生 `/usr/sbin/screencapture` 捕获辅助函数
 * 不仅绕过 screenshot-desktop 在 Apple Silicon (M1~M4) 上因 SPDisplaysDataType 解析失败报错的问题，
 * 还能在首次调用时主动触发 macOS 的「屏幕录制 (Screen Recording)」系统授权弹窗。
 */
export async function captureMacScreenNative(options: {
  format: 'jpg' | 'png'
  screenId?: string | number
  windowId?: string | number
}): Promise<Buffer> {
  const ext = options.format === 'png' ? 'png' : 'jpg'
  const tmpFile = path.join(os.tmpdir(), `shiin_mac_cap_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`)
  const args: string[] = ['-x', '-t', ext]

  if (options.windowId !== undefined && options.windowId !== '') {
    args.push('-l', String(options.windowId))
  } else if (options.screenId !== undefined && options.screenId !== '' && Number(options.screenId) > 0) {
    // screencapture 的 -D 参数从 1 开始表示主显示器
    args.push('-D', String(Number(options.screenId) + 1))
  }

  args.push(tmpFile)

  try {
    await execFileAsync('/usr/sbin/screencapture', args, { timeout: 5000 })
    if (fs.existsSync(tmpFile)) {
      const buf = fs.readFileSync(tmpFile)
      try {
        fs.unlinkSync(tmpFile)
      } catch {}
      if (buf && buf.length > 0) {
        return buf
      }
    }
    throw new Error('macOS screencapture did not produce output (Screen Recording permission may be denied)')
  } catch (err) {
    try {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile)
    } catch {}
    throw err
  }
}

/**
 * 捕获特定窗口画面 Buffer
 * 优先采用 Window 抓取，如果遇到 3D 游戏（DirectX/Vulkan 独占渲染）导致的卡死或黑帧，
 * 自动无缝降级回退为「DXGI DDA 显存屏幕捕获 + 窗口区域精准裁切」，macOS 下同时支持 screencapture -l。
 */
async function captureWindowBuffer(
  windowId: string | number,
  format: 'jpg' | 'png',
  hints?: { title?: string; ownerName?: string },
): Promise<Buffer> {
  if (process.platform === 'darwin' && windowId !== undefined && windowId !== '') {
    try {
      const macWinBuf = await captureMacScreenNative({ format, windowId })
      if (macWinBuf && macWinBuf.length > 0) {
        return macWinBuf
      }
    } catch {
      // 继续尝试 node-screenshots
    }
  }

  const windows = ScreenshotWindow.all()
  const byId = (item: any) => {
    const id = typeof item.id === 'function' ? item.id() : item.id
    return String(id) === String(windowId)
  }
  const toInfo = (item: any): CaptureWindowInfo => ({
    id: typeof item.id === 'function' ? item.id() : item.id,
    title: typeof item.title === 'function' ? item.title() : item.title,
    ownerName: typeof item.appName === 'function' ? item.appName() : item.appName,
  })
  // 聚焦窗口的 id 来自 active-win；如果两边编号对不上，按标题/属主再对一次。
  const hinted = hints ? findWindowByHints(windows.map(toInfo), hints) : undefined
  const target =
    windows.find(byId) ??
    (hinted
      ? windows.find((item: any) => String(typeof item.id === 'function' ? item.id() : item.id) === String(hinted.id))
      : undefined)

  if (!target) {
    throw new Error(`Target window id ${windowId} not found in desktop window manager`)
  }

  const tAny = target as any
  const isMin = typeof tAny.isMinimized === 'function' ? tAny.isMinimized() : tAny.isMinimized
  if (isMin) {
    throw new Error(`Target window is minimized (id=${windowId})`)
  }

  const tx = typeof tAny.x === 'function' ? tAny.x() : tAny.x
  const ty = typeof tAny.y === 'function' ? tAny.y() : tAny.y
  const tw = typeof tAny.width === 'function' ? tAny.width() : tAny.width
  const th = typeof tAny.height === 'function' ? tAny.height() : tAny.height

  if (!tw || !th || tw <= 0 || th <= 0) {
    throw new Error(`Target window has invalid dimensions: ${tw}x${th}`)
  }

  // 1. 尝试直接通过 Window.captureImage 截取（限制 1500ms 超时，防止被 3D 游戏渲染队列挂起）
  let directBuffer: Buffer | null = null
  let directError: any = null

  try {
    const image = await withTimeout(
      target.captureImage(),
      1500,
      'Window.captureImage timed out (likely 3D exclusive game rendering)'
    )
    const imgAny = image as any
    const width: number = typeof imgAny.width === 'function' ? imgAny.width() : imgAny.width
    const height: number = typeof imgAny.height === 'function' ? imgAny.height() : imgAny.height
    const raw = await image.toRaw(true)

    if (isLikelyBlackGameFrame(raw, width, height)) {
      console.warn('[ScreenshotCore] Window.captureImage produced a black frame. Triggering Monitor fallback...')
    } else {
      let finalImg = image
      if ((width > tw + 5 || height > th + 5) && typeof (imgAny as any).cropSync === 'function') {
        const cropX = Math.max(0, tx)
        const cropY = Math.max(0, ty)
        const cropW = Math.min(width - cropX, tw)
        const cropH = Math.min(height - cropY, th)
        if (cropW > 10 && cropH > 10) {
          finalImg = (imgAny as any).cropSync(cropX, cropY, cropW, cropH)
        }
      }
      const buffer = format === 'png' ? await finalImg.toPng(true) : await finalImg.toJpeg(true)
      if (buffer && buffer.length > 0) {
        directBuffer = buffer
      }
    }
  } catch (err: any) {
    directError = err
    console.warn('[ScreenshotCore] Window.captureImage failed, attempting Monitor fallback:', err?.message || err)
  }

  if (directBuffer) {
    return directBuffer
  }

  // 2. 回退方案：基于物理显示器帧缓冲并裁切
  try {
    const monitors = ScreenshotMonitor.all()
    if (!monitors || monitors.length === 0) {
      throw new Error('No physical monitors found for fallback')
    }

    const cx = tx + tw / 2
    const cy = ty + th / 2
    let matchedMonitor = monitors.find(
      (m: any) => cx >= m.x && cx < m.x + m.width && cy >= m.y && cy < m.y + m.height
    )
    if (!matchedMonitor) {
      matchedMonitor = monitors[0]
    }

    const screenImg = matchedMonitor.captureImageSync()
    const localX = tx - matchedMonitor.x
    const localY = ty - matchedMonitor.y
    const cropX = Math.max(0, localX)
    const cropY = Math.max(0, localY)
    const cropW = Math.min(screenImg.width - cropX, tw - (cropX - localX))
    const cropH = Math.min(screenImg.height - cropY, th - (cropY - localY))

    if (cropW > 10 && cropH > 10) {
      const croppedImg = screenImg.cropSync(cropX, cropY, cropW, cropH)
      const buffer = format === 'png' ? croppedImg.toPngSync() : croppedImg.toJpegSync()
      if (buffer && buffer.length > 0) {
        return buffer
      }
    }
  } catch (fallbackErr: any) {
    console.error('[ScreenshotCore] Monitor fallback failed:', fallbackErr?.message || fallbackErr)
  }

  throw directError || new Error('Window capture failed and fallback was unable to crop window')
}

/**
 * 执行一次核心截图动作
 */
export async function performScreenshot(
  config: ScreenshotConfig,
  options?: {
    writeClipboard?: (buf: Buffer) => void
    confirmOverwrite?: (filePath: string) => Promise<boolean>
  }
): Promise<ScreenshotResult> {
  const format = config.imageFormat === 'png' ? 'png' : 'jpg'
  let buffer: Buffer
  let resolvedActiveWindow: ActiveWinResult | null | undefined

  try {
    const isWindow =
      config.captureTargetType === CaptureTargetTypeEnum.Window ||
      (config.captureTargetType as any) === 'window' ||
      (config.captureTargetType as any) === 1
    if (isWindow) {
      const target = await resolveWindowCaptureTarget(config)
      resolvedActiveWindow = target.active
      buffer = await captureWindowBuffer(target.id, format, target)
    } else {
      const screenId = config.screenSourceId
      if (process.platform === 'darwin') {
        // macOS 优先使用原生 screencapture -x (兼容 Apple Silicon M1~M4 且能主动拉起系统录屏权限请求)
        try {
          buffer = await captureMacScreenNative({ format, screenId })
        } catch (macErr) {
          // 降级尝试 node-screenshots
          const monitors = ScreenshotMonitor.all()
          const mon =
            (screenId !== undefined && screenId !== ''
              ? monitors.find((m: any) => String(m.id) === String(screenId))
              : null) || monitors[0]
          if (mon) {
            const screenImg = mon.captureImageSync()
            buffer = format === 'png' ? screenImg.toPngSync() : screenImg.toJpegSync()
          } else {
            throw macErr
          }
        }
      } else {
        try {
          buffer = await screenshot({
            screen: screenId !== undefined && screenId !== '' ? Number(screenId) : undefined,
            format,
          })
        } catch {
          try {
            buffer = await screenshot({ format })
          } catch {
            const monitors = ScreenshotMonitor.all()
            const mon =
              (screenId !== undefined && screenId !== ''
                ? monitors.find((m: any) => String(m.id) === String(screenId))
                : null) || monitors[0]
            if (mon) {
              const screenImg = mon.captureImageSync()
              buffer = format === 'png' ? screenImg.toPngSync() : screenImg.toJpegSync()
            } else {
              throw new Error('No monitor available for screen capture')
            }
          }
        }
      }
    }
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message || String(err),
      timestamp: Date.now(),
      format,
    }
  }

  // 计算输出路径（使用 resolveScreenshotSaveDir 防止 macOS 下写入只读根目录 `/`）
  let finalPath: string | null = null
  const needSaveFile = config.screenShotSaveWay !== ScreenShotSaveWayEnum.CilpboardOnly
  const needClipboard = config.screenShotSaveWay !== ScreenShotSaveWayEnum.FileOnly
  // 聚焦模式已经在解析目标时取过前台窗口；指定模式在这里只补一次，供归档目录与文件名模板共用。
  let namingActive = resolvedActiveWindow
  const readNamingActive = async () => {
    if (namingActive === undefined) namingActive = await getActiveWindowInfo()
    return namingActive
  }

  if (needSaveFile) {
    let saveDir = resolveScreenshotSaveDir(config.path)

    if (config.saveByActiveWinTitle) {
      const active = await readNamingActive()
      const subFolder = sanitizeToValidFolderName(active?.title || 'UnknownWindow')
      saveDir = path.join(saveDir, subFolder)
    }

    try {
      if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true })
      }
    } catch {
      saveDir = path.join(os.homedir(), 'screenshots')
      if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true })
      }
    }

    const activeWinInfo = await readNamingActive()
    const fileName = formatFileName(config.fileNameTemplate, activeWinInfo)
    let candidatePath = path.join(saveDir, `${fileName}.${format}`)

    if (fs.existsSync(candidatePath)) {
      const resolution = config.filenameConflictResolution || 'overwrite'
      if (resolution === 'appendTimestamp') {
        candidatePath = path.join(saveDir, `${fileName}_${Date.now()}.${format}`)
      } else if (resolution === 'notSave') {
        candidatePath = ''
      } else if (resolution === 'askEveryTime' && options?.confirmOverwrite) {
        const allow = await options.confirmOverwrite(candidatePath)
        if (!allow) candidatePath = ''
      }
    }

    if (candidatePath) {
      try {
        fs.writeFileSync(candidatePath, buffer)
        finalPath = candidatePath
      } catch (err: any) {
        return {
          ok: false,
          error: `Save file error: ${err?.message || String(err)}`,
          timestamp: Date.now(),
          format,
        }
      }
    }
  }

  if (needClipboard && options?.writeClipboard) {
    try {
      options.writeClipboard(buffer)
    } catch (e) {
      console.warn('[ScreenshotCore] Failed to write clipboard:', e)
    }
  }

  return {
    ok: true,
    filePath: finalPath,
    timestamp: Date.now(),
    format,
    sizeBytes: buffer.length,
  }
}
