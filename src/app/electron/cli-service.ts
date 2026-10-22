/**
 * Shiin CLI Runtime 生命周期管理器
 *
 * 桌面应用不直接持有 ScreenshotManager，而是通过 utilityProcess.fork() 托管
 * 运行统一的 `lib/cli.mjs serve --host 127.0.0.1 --port 0 --no-open` 运行时服务。
 *
 * 核心保障：
 * 1. 结构化启动握手：监听子进程 message 及 stdout 中的 __SHIIN_READY__，获取系统动态分配的端口
 * 2. 健康检查：向 /api/state 发起 HTTP 请求，确保服务完全启动
 * 3. macOS 权限归属：设置 disclaim: false，继承桌面应用父进程的 TCC 授权责任主体
 * 4. 异常重启：子进程非主动退出时自动重新拉起并恢复
 */

import { app, utilityProcess } from 'electron'
import type { UtilityProcess } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import http from 'node:http'
import { EventEmitter } from 'node:events'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export interface CliServiceReadyInfo {
  port: number
  url: string
  pid?: number
}

export class CliServiceManager extends EventEmitter {
  private child: UtilityProcess | null = null
  private restartTimer: NodeJS.Timeout | null = null
  private isDisposing = false
  private readyInfo: CliServiceReadyInfo | null = null
  private cliScriptPathOverride?: string

  constructor(cliScriptPathOverride?: string) {
    super()
    this.cliScriptPathOverride = cliScriptPathOverride
  }

  public get currentReadyInfo(): CliServiceReadyInfo | null {
    return this.readyInfo
  }

  public get isRunning(): boolean {
    return Boolean(this.child)
  }

  public resolveCliPath(): string {
    if (this.cliScriptPathOverride) return this.cliScriptPathOverride
    const candidates = [
      path.join(__dirname, 'cli.mjs'),
      path.join(__dirname, 'cli.js'),
      path.join(app.getAppPath(), 'lib/cli.mjs'),
      path.join(app.getAppPath(), 'lib/cli.js'),
      path.resolve(process.cwd(), 'lib/cli.mjs'),
      path.resolve(process.cwd(), 'lib/cli.js'),
    ]
    for (const p of candidates) {
      if (fs.existsSync(p)) return p
    }
    return path.resolve(process.cwd(), 'lib/cli.mjs')
  }

  /**
   * 启动后台 CLI 服务子进程并等待健康检查就绪
   */
  public async start(): Promise<CliServiceReadyInfo> {
    if (this.readyInfo && this.child) return this.readyInfo
    if (this.restartTimer) {
      clearTimeout(this.restartTimer)
      this.restartTimer = null
    }

    const cliPath = this.resolveCliPath()
    if (!fs.existsSync(cliPath)) {
      throw new Error(`Shiin CLI runtime script not found at ${cliPath}`)
    }

    return new Promise<CliServiceReadyInfo>((resolve, reject) => {
      let resolved = false
      const timeoutTimer = setTimeout(() => {
        if (!resolved) {
          resolved = true
          reject(new Error('CLI service failed to start within 15 seconds timeout'))
        }
      }, 15_000)

      try {
        const child = utilityProcess.fork(
          cliPath,
          ['serve', '--host', '127.0.0.1', '--port', '0', '--no-open'],
          {
            serviceName: 'Shiin CLI Runtime',
            // 关键设置：disclaim: false 确保 macOS TCC 权限归属到 Shiin.app 主进程
            disclaim: false,
            stdio: 'pipe',
            env: {
              ...process.env,
              SHIIN_MANAGED_BY_DESKTOP: '1',
            },
          } as any
        )

        this.child = child

        const handleReady = async (info: { port: number; url: string; pid?: number }) => {
          if (resolved) return
          try {
            await this.checkHealth(info.url, 4000)
            resolved = true
            clearTimeout(timeoutTimer)
            this.readyInfo = info
            this.emit('ready', info)
            resolve(info)
          } catch (err) {
            console.warn('[CliService] Initial health check failed, retrying in 250ms...', err)
            setTimeout(async () => {
              if (resolved) return
              try {
                await this.checkHealth(info.url, 4000)
                resolved = true
                clearTimeout(timeoutTimer)
                this.readyInfo = info
                this.emit('ready', info)
                resolve(info)
              } catch (finalErr) {
                if (!resolved) {
                  resolved = true
                  clearTimeout(timeoutTimer)
                  reject(finalErr)
                }
              }
            }, 250)
          }
        }

        // 1. 结构化 IPC 消息握手
        child.on('message', (msg: any) => {
          if (!msg || typeof msg !== 'object') return
          if (msg.type === 'ready' && typeof msg.port === 'number') {
            void handleReady({ port: msg.port, url: msg.url, pid: child.pid })
          }
        })

        // 2. stdout 结构化就绪标记握手兜底
        child.stdout?.on('data', (data: Buffer) => {
          const str = data.toString('utf8')
          const marker = '__SHIIN_READY__'
          const idx = str.indexOf(marker)
          if (idx !== -1) {
            try {
              const jsonStr = str.slice(idx + marker.length).trim().split('\n')[0]
              const parsed = JSON.parse(jsonStr)
              if (parsed && parsed.type === 'ready' && typeof parsed.port === 'number') {
                void handleReady({ port: parsed.port, url: parsed.url, pid: child.pid })
              }
            } catch {}
          }
          process.stdout.write(`[Shiin Service] ${str}`)
        })

        child.stderr?.on('data', (data: Buffer) => {
          process.stderr.write(`[Shiin Service Error] ${data.toString('utf8')}`)
        })

        // 3. 监控异常崩溃并执行自动恢复
        child.on('exit', (code) => {
          console.warn(`[CliService] CLI runtime exited (code=${code})`)
          if (this.child === child) {
            this.child = null
            this.readyInfo = null
          }
          this.emit('exit', code)

          if (!this.isDisposing && !(app as any).isQuiting) {
            console.log('[CliService] Runtime exited unexpectedly, recovering in 1.5s...')
            this.restartTimer = setTimeout(() => {
              this.restartTimer = null
              void this.start()
                .then((info) => {
                  console.log(`[CliService] Successfully recovered on ${info.url}`)
                  this.emit('restarted', info)
                })
                .catch((err) => {
                  console.error('[CliService] Recovery restart failed:', err)
                })
            }, 1500)
          }
        })
      } catch (err) {
        clearTimeout(timeoutTimer)
        if (!resolved) {
          resolved = true
          reject(err)
        }
      }
    })
  }

  /**
   * 通过 GET /api/state 确认服务健康状况
   */
  public async checkHealth(url: string, timeoutMs: number): Promise<void> {
    const startTime = Date.now()
    const targetUrl = new URL('/api/state', url).toString()

    while (Date.now() - startTime < timeoutMs) {
      try {
        const ok = await new Promise<boolean>((resolve) => {
          const req = http.get(targetUrl, { timeout: 800 }, (res) => {
            if (res.statusCode === 200) {
              res.resume()
              resolve(true)
            } else {
              res.resume()
              resolve(false)
            }
          })
          req.on('error', () => resolve(false))
          req.on('timeout', () => {
            req.destroy()
            resolve(false)
          })
        })
        if (ok) return
      } catch {}
      await new Promise((r) => setTimeout(r, 120))
    }
    throw new Error(`Health check timed out after ${timeoutMs}ms on ${targetUrl}`)
  }

  /**
   * 停止子进程并清理资源
   */
  public dispose(): void {
    this.isDisposing = true
    if (this.restartTimer) {
      clearTimeout(this.restartTimer)
      this.restartTimer = null
    }
    if (this.child) {
      const child = this.child
      this.child = null
      try {
        child.postMessage({ type: 'dispose' })
      } catch {}
      try {
        child.kill()
      } catch {}
    }
    this.readyInfo = null
  }
}
