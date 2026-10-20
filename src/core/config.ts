import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { DEFAULT_CONFIG, type ScreenshotConfig } from './types.js'

export interface IConfigStorage {
  get<T>(key: string, defaultValue: T): Promise<T> | T
  set<T>(key: string, value: T): Promise<void> | void
}

/**
 * 判断指定目录是否可写（排除 macOS 打包后只读根目录 `/` 或 `.app` 包内路径）
 */
export function isDirectoryWritable(dirPath: string): boolean {
  try {
    const resolved = path.resolve(dirPath)
    if (resolved === '/' || resolved.includes('.app/Contents')) {
      return false
    }
    if (fs.existsSync(resolved)) {
      fs.accessSync(resolved, fs.constants.W_OK)
      return true
    }
    const parent = path.dirname(resolved)
    if (parent && parent !== resolved && fs.existsSync(parent)) {
      fs.accessSync(parent, fs.constants.W_OK)
      return true
    }
    return false
  } catch {
    return false
  }
}

/**
 * 获取安全的默认配置目录（兼容开发模式与 macOS `.app` 独立打包模式）
 *
 * @param preferCwd - 允许落在 `<cwd>/config`。默认 true（桌面端/开发模式的历史行为）；
 *   全局安装的 CLI 从任意目录调用时传 false，避免把配置写进使用者的当前目录。
 */
export function getDefaultConfigDir(preferCwd = true): string {
  const cwd = process.cwd()
  if (preferCwd && isDirectoryWritable(cwd)) {
    const candidate = path.join(cwd, 'config')
    try {
      if (!fs.existsSync(candidate)) {
        fs.mkdirSync(candidate, { recursive: true })
      }
      fs.accessSync(candidate, fs.constants.W_OK)
      return candidate
    } catch {
      // 降级到用户目录
    }
  }

  const home = os.homedir()
  const fallback =
    process.platform === 'darwin'
      ? path.join(home, 'Library', 'Application Support', 'Shiin')
      : process.platform === 'win32'
        ? path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'Shiin')
        : path.join(home, '.config', 'shiin')

  try {
    if (!fs.existsSync(fallback)) {
      fs.mkdirSync(fallback, { recursive: true })
    }
  } catch {
    // ignore
  }
  return fallback
}

/**
 * 本地 JSON 文件配置存储实现
 */
export class FileConfigStorage implements IConfigStorage {
  private filePath: string
  private data: Record<string, unknown> = {}

  constructor(customPath?: string) {
    if (customPath) {
      this.filePath = customPath
    } else {
      const dir = getDefaultConfigDir()
      this.filePath = path.join(dir, 'localStorage.json')
    }
    this.reload()
  }

  public reload(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8')
        this.data = JSON.parse(raw)
      } else {
        this.data = {}
      }
    } catch {
      this.data = {}
    }
  }

  public get<T>(key: string, defaultValue: T): T {
    return (this.data[key] !== undefined ? this.data[key] : defaultValue) as T
  }

  public set<T>(key: string, val: T): void {
    this.data[key] = val
    try {
      const dir = path.dirname(this.filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2))
    } catch (e) {
      console.error('[Config] Failed to persist config to disk:', e)
    }
  }
}

/**
 * 内存临时配置存储实现（供测试或无头模式）
 */
export class MemoryConfigStorage implements IConfigStorage {
  private data = new Map<string, unknown>()

  public get<T>(key: string, defaultValue: T): T {
    return this.data.has(key) ? (this.data.get(key) as T) : defaultValue
  }

  public set<T>(key: string, value: T): void {
    this.data.set(key, value)
  }
}

/**
 * 从存储器加载完整的 ScreenshotConfig，具备平滑升级与缺省回退
 */
export async function loadFullConfig(storage: IConfigStorage, deviceName?: string): Promise<ScreenshotConfig> {
  const savedGlobal = await storage.get('globalConfig', '')
  let parsedGlobal: Partial<ScreenshotConfig> = {}
  if (savedGlobal) {
    try {
      parsedGlobal = typeof savedGlobal === 'string' ? JSON.parse(savedGlobal) : savedGlobal
    } catch {
      // ignore
    }
  }

  const result: ScreenshotConfig = { ...DEFAULT_CONFIG, ...parsedGlobal }

  // 读取单设备的组合键配置
  if (deviceName) {
    const savedPad = await storage.get(deviceName, '')
    if (savedPad) {
      try {
        const padData = typeof savedPad === 'string' ? JSON.parse(savedPad) : savedPad
        if (Array.isArray(padData.comboKeys)) {
          result.comboKeys = padData.comboKeys
        }
      } catch {
        // ignore
      }
    }
  }

  // 保证组合键兼容老格式
  if (Array.isArray(result.comboKeys)) {
    result.comboKeys = result.comboKeys.map((k) => (typeof k === 'number' ? `Button${k}` : String(k)))
  }

  // 老存档没有 windowCaptureMode：选过窗口的继续按“指定窗口”，没选过的用新的“聚焦窗口”。
  if (parsedGlobal.windowCaptureMode !== 'focused' && parsedGlobal.windowCaptureMode !== 'specified') {
    const hasPinnedWindow =
      result.windowSourceId !== undefined && result.windowSourceId !== null && result.windowSourceId !== ''
    result.windowCaptureMode = hasPinnedWindow ? 'specified' : 'focused'
  }

  // 补齐缺省值
  if (!result.fileNameTemplate?.trim()) result.fileNameTemplate = 'Screenshot_%timestamp%'
  if (!result.imageFormat) result.imageFormat = 'jpg'

  return result
}

/**
 * 保存完整的 ScreenshotConfig 到存储器
 */
export async function saveFullConfig(storage: IConfigStorage, config: ScreenshotConfig, deviceName?: string): Promise<void> {
  const globalCopy = { ...config }
  const comboKeys = [...globalCopy.comboKeys]
  delete (globalCopy as Record<string, unknown>).comboKeys

  await storage.set('globalConfig', JSON.stringify(globalCopy))

  if (deviceName) {
    await storage.set(deviceName, JSON.stringify({ comboKeys }))
  }
}
