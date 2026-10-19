import OBSWebSocket from 'obs-websocket-js'
import type { ScreenshotConfig, ScreenshotResult } from './types.js'
import { formatFileName } from './filename.js'
import fs from 'node:fs'
import path from 'node:path'

export class OBSManager {
  private obs: OBSWebSocket
  private connected = false

  constructor() {
    this.obs = new OBSWebSocket()
    this.obs.on('ConnectionClosed', () => {
      this.connected = false
    })
  }

  public get isConnected(): boolean {
    return this.connected
  }

  public async connect(ip = '127.0.0.1', port = 4455, password = ''): Promise<{ ok: boolean; error?: string }> {
    try {
      if (this.connected) {
        await this.obs.disconnect()
      }
      const url = `ws://${ip}:${port}`
      await this.obs.connect(url, password || undefined)
      this.connected = true
      return { ok: true }
    } catch (err: any) {
      this.connected = false
      return { ok: false, error: err?.message || String(err) }
    }
  }

  public async disconnect(): Promise<void> {
    if (this.connected) {
      try {
        await this.obs.disconnect()
      } catch {
        // ignore
      }
      this.connected = false
    }
  }

  /**
   * 触发 OBS 保存即时回放缓存 (SaveReplayBuffer)
   */
  public async saveReplayBuffer(): Promise<{ ok: boolean; error?: string }> {
    if (!this.connected) {
      return { ok: false, error: 'OBS is not connected' }
    }
    try {
      await this.obs.call('SaveReplayBuffer')
      return { ok: true }
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err) }
    }
  }

  /**
   * 获取 OBS 画面截图并落盘
   */
  public async takeSourceScreenshot(config: ScreenshotConfig): Promise<ScreenshotResult> {
    if (!this.connected) {
      return {
        ok: false,
        error: 'OBS not connected',
        timestamp: Date.now(),
        format: config.imageFormat,
      }
    }

    try {
      // 获取当前活跃场景名称
      const currentProgram = await this.obs.call('GetCurrentProgramScene')
      const sceneName = currentProgram.currentProgramSceneName

      const imgFormat = config.imageFormat === 'png' ? 'png' : 'jpg'
      const response = await this.obs.call('GetSourceScreenshot', {
        sourceName: sceneName,
        imageFormat: imgFormat,
      })

      const base64Data = response.imageData.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')

      let saveDir = config.path?.trim() || path.join(process.cwd(), 'screenshots')
      if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true })
      }

      const fileName = formatFileName(config.fileNameTemplate)
      const filePath = path.join(saveDir, `${fileName}.${imgFormat}`)
      fs.writeFileSync(filePath, buffer)

      return {
        ok: true,
        filePath,
        timestamp: Date.now(),
        format: imgFormat,
        sizeBytes: buffer.length,
      }
    } catch (err: any) {
      return {
        ok: false,
        error: err?.message || String(err),
        timestamp: Date.now(),
        format: config.imageFormat,
      }
    }
  }
}
