import fs from 'node:fs'
import path from 'node:path'
import { DEFAULT_CONFIG, type ScreenshotConfig } from './types.js'

export interface IConfigStorage {
  get<T>(key: string, defaultValue: T): Promise<T> | T
  set<T>(key: string, value: T): Promise<void> | void
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
      // 默认存储在当前进程下的 temp 或 config 目录
      const dir = path.join(process.cwd(), 'config')
      if (!fs.existsSync(dir)) {
        try {
          fs.mkdirSync(dir, { recursive: true })
        } catch {
          // 降级使用当前目录
        }
      }
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
