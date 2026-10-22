import { createHash } from 'node:crypto'
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'

/** 常驻宿主的本机通道：后续通知无需再启动一个 Electron 进程。 */
export function overlayEndpoint(): string {
  if (process.env.SHIIN_OVERLAY_SOCKET) return process.env.SHIIN_OVERLAY_SOCKET
  const user = createHash('sha256').update(os.homedir()).digest('hex').slice(0, 12)
  return process.platform === 'win32'
    ? `\\\\.\\pipe\\shiin-overlay-${user}`
    : path.join(os.tmpdir(), `shiin-overlay-${user}.sock`)
}

export function forwardOverlayRequest(request: Record<string, unknown>, endpoint = overlayEndpoint()): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.createConnection(endpoint)
    let sent = false
    let settled = false
    const finish = (accepted: boolean) => {
      if (settled) return
      settled = true
      socket.destroy()
      resolve(accepted)
    }
    // 连接失败时尽快回退到冷启动；正常的本机 Unix socket 连接通常低于 10ms。
    socket.setTimeout(120, () => finish(sent))
    socket.once('error', () => finish(sent))
    socket.once('connect', () => {
      socket.end(`${JSON.stringify(request)}\n`, () => {
        sent = true
        finish(true)
      })
    })
  })
}

export function listenForOverlayRequests(
  receive: (request: Record<string, unknown>) => void,
  endpoint = overlayEndpoint(),
): net.Server {
  // 仅取得 Electron 单实例锁的宿主调用这里，可安全移除崩溃留下的 socket。
  if (process.platform !== 'win32') fs.rmSync(endpoint, { force: true })
  const server = net.createServer((socket) => {
    socket.setEncoding('utf8')
    socket.setTimeout(1000, () => socket.destroy())
    socket.on('error', () => {})
    let input = ''
    socket.on('data', (chunk: string) => {
      input += chunk
      if (input.length > 2 * 1024 * 1024) {
        socket.destroy()
        return
      }
      const end = input.indexOf('\n')
      if (end < 0) return
      try {
        const request: unknown = JSON.parse(input.slice(0, end))
        if (request && typeof request === 'object' && !Array.isArray(request)) {
          receive(request as Record<string, unknown>)
        }
      } catch {}
      socket.end()
    })
  })
  server.on('error', (error) => console.warn('[overlay] local transport unavailable:', error.message))
  server.listen(endpoint, () => {
    if (process.platform !== 'win32') fs.chmodSync(endpoint, 0o600)
  })
  return server
}
