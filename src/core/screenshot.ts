import fs from 'node:fs'
import path from 'node:path'
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

/**
 * 屏幕黑帧抽样判定算法（防止截到 DirectX / Vulkan 全屏未渲染黑屏）
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
 * 获取屏幕列表
 */
export async function getScreenDisplays(): Promise<CaptureDisplayInfo[]> {
  try {
    const displays = await screenshot.listDisplays()
    return displays.map((d: { id: string | number; name: string }) => ({
      id: d.id,
      name: d.name || `Display ${d.id}`,
    }))
  } catch (err) {
    console.error('[ScreenshotCore] Failed to list displays:', err)
    return [{ id: '', name: 'Primary Display' }]
  }
}

/**
 * 获取可捕获窗口列表（过滤无标题或极小窗口）
 */
export async function getCaptureWindows(): Promise<CaptureWindowInfo[]> {
  try {
    if (typeof activeWin.getOpenWindows !== 'function') {
      return []
    }
    const windows = await activeWin.getOpenWindows()
    return windows
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
  } catch (err) {
    console.error('[ScreenshotCore] Failed to get capture windows:', err)
    return []
  }
}

/**
 * 获取当前聚焦的前台活动窗口信息
 */
export async function getActiveWindowInfo(): Promise<ActiveWinResult | null> {
  try {
    const win = await activeWin()
    if (!win) return null
    return {
      title: win.title,
      id: win.id,
      bounds: win.bounds,
      owner: win.owner,
    }
  } catch {
    return null
  }
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
 * 捕获特定窗口画面 Buffer
 * 优先采用 Window 抓取，如果遇到 3D 游戏（DirectX/Vulkan 独占渲染）导致的卡死或黑帧，
 * 自动无缝降级回退为「DXGI DDA 显存屏幕捕获 + 窗口区域精准裁切」，永不黑屏永不假死。
 */
async function captureWindowBuffer(windowId: string | number, format: 'jpg' | 'png'): Promise<Buffer> {
  const windows = ScreenshotWindow.all()
  const target = windows.find((item: any) => {
    const id = typeof item.id === 'function' ? item.id() : item.id
    return String(id) === String(windowId)
  })

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

    console.log('[ScreenshotCore] direct captureImage dimensions:', { width, height, tw, th, tx, ty })

    if (isLikelyBlackGameFrame(raw, width, height)) {
      console.warn('[ScreenshotCore] Window.captureImage produced a black frame. Triggering DXGI Monitor fallback...')
    } else {
      let finalImg = image
      // 如果获取的画面尺寸明显大于窗口尺寸（例如 Windows 下返回了整屏画布），按窗口相对坐标进行精确裁切
      if ((width > tw + 5 || height > th + 5) && typeof (imgAny as any).cropSync === 'function') {
        const cropX = Math.max(0, tx)
        const cropY = Math.max(0, ty)
        const cropW = Math.min(width - cropX, tw)
        const cropH = Math.min(height - cropY, th)
        console.log('[ScreenshotCore] attempting crop:', { cropX, cropY, cropW, cropH })
        if (cropW > 10 && cropH > 10) {
          finalImg = (imgAny as any).cropSync(cropX, cropY, cropW, cropH)
          const fw = typeof (finalImg as any).width === 'function' ? (finalImg as any).width() : (finalImg as any).width
          const fh = typeof (finalImg as any).height === 'function' ? (finalImg as any).height() : (finalImg as any).height
          console.log('[ScreenshotCore] finalImg cropped size:', fw, fh)
        }
      }
      const buffer = format === 'png' ? await finalImg.toPng(true) : await finalImg.toJpeg(true)
      if (buffer && buffer.length > 0) {
        directBuffer = buffer
      }
    }
  } catch (err: any) {
    directError = err
    console.warn('[ScreenshotCore] Window.captureImage failed, attempting DXGI Monitor fallback:', err?.message || err)
  }

  if (directBuffer) {
    return directBuffer
  }

  // 2. 回退方案：基于 DXGI Desktop Duplication API (DDA) 捕获物理显示器帧缓冲并裁切
  try {
    const monitors = ScreenshotMonitor.all()
    if (!monitors || monitors.length === 0) {
      throw new Error('No physical monitors found for fallback')
    }


    // 寻找包含窗口中心点的 Monitor
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
    console.error('[ScreenshotCore] DXGI fallback failed:', fallbackErr?.message || fallbackErr)
  }

  throw directError || new Error('Window capture failed and DXGI fallback was unable to crop window')
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

  try {
    const isWindow =
      config.captureTargetType === CaptureTargetTypeEnum.Window ||
      (config.captureTargetType as any) === 'window' ||
      (config.captureTargetType as any) === 1
    if (isWindow) {
      buffer = await captureWindowBuffer(config.windowSourceId, format)
    } else {
      let screenId = config.screenSourceId
      try {
        buffer = await screenshot({
          screen: screenId !== undefined && screenId !== '' ? Number(screenId) : undefined,
          format,
        })
      } catch {
        try {
          // 尝试回退主屏幕 (screenshot-desktop)
          buffer = await screenshot({ format })
        } catch {
          // 终极保底：通过 node-screenshots DXGI / DDA 抓取
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
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message || String(err),
      timestamp: Date.now(),
      format,
    }
  }

  // 计算输出路径
  let finalPath: string | null = null
  const needSaveFile = config.screenShotSaveWay !== ScreenShotSaveWayEnum.CilpboardOnly
  const needClipboard = config.screenShotSaveWay !== ScreenShotSaveWayEnum.FileOnly

  if (needSaveFile) {
    let saveDir = config.path?.trim()
    if (!saveDir) {
      saveDir = path.join(process.cwd(), 'screenshots')
    }

    if (config.saveByActiveWinTitle) {
      const active = await getActiveWindowInfo()
      const subFolder = sanitizeToValidFolderName(active?.title || 'UnknownWindow')
      saveDir = path.join(saveDir, subFolder)
    }

    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true })
    }

    const activeWinInfo = await getActiveWindowInfo()
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
