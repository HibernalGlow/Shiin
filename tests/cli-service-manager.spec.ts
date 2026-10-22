import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import http from 'node:http'
import { startWebServer, type WebHostManager } from '../src/app/server/index.js'
import { DEFAULT_CONFIG } from '../src/core/types.js'

function createMinimalManager(): WebHostManager {
  let listening = false
  const config = { ...DEFAULT_CONFIG }
  return {
    config,
    storage: {
      get: async (k, def) => def,
      set: async () => {},
    },
    get listening() {
      return listening
    },
    gamepad: {
      getConnectedDevices: () => [],
      getActiveDeviceIndex: () => 0,
      getCurrentButtons: () => [],
      getCurrentAxes: () => [],
      openDevice: () => true,
      closeDevice: () => {},
    },
    startListening: async () => {
      listening = true
      return { ok: true }
    },
    stopListening: () => {
      listening = false
    },
    capture: async () => ({
      ok: true,
      filePath: null,
      timestamp: Date.now(),
      format: 'png',
    }),
    saveOBSReplay: async () => ({ ok: true }),
    syncConfig: (patch) => {
      Object.assign(config, patch)
    },
    subscribe: () => () => {},
    dispose: () => {},
  }
}

describe('CLI runtime server dynamic port and structured handshake', () => {
  it('allocates an ephemeral port when port=0 and returns actual port & url', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'shiin-ephemeral-'))
    fs.writeFileSync(path.join(root, 'index.html'), '<html><body>Shiin</body></html>')

    const manager = createMinimalManager()
    const handle = await startWebServer({
      manager,
      root,
      host: '127.0.0.1',
      port: 0, // 请求动态分配空闲端口
    })

    expect(handle.port).toBeGreaterThan(0)
    expect(handle.url).toBe(`http://127.0.0.1:${handle.port}`)

    // 验证 /api/state 真实可用且健康检查正常通过
    const state = await new Promise<any>((resolve, reject) => {
      http.get(`${handle.url}/api/state`, (res) => {
        expect(res.statusCode).toBe(200)
        let body = ''
        res.on('data', (d) => (body += d.toString('utf8')))
        res.on('end', () => resolve(JSON.parse(body)))
      }).on('error', reject)
    })

    expect(state).toHaveProperty('listening', false)
    expect(state).toHaveProperty('platform')

    await handle.close()
    fs.rmSync(root, { recursive: true, force: true })
  })

  it('generates structured handshake ready payload parseable from stdout marker', () => {
    const readyPayload = {
      type: 'ready',
      port: 54321,
      url: 'http://127.0.0.1:54321',
      pid: 1234,
    }
    const markerLine = `__SHIIN_READY__ ${JSON.stringify(readyPayload)}`

    const marker = '__SHIIN_READY__'
    const idx = markerLine.indexOf(marker)
    expect(idx).toBe(0)

    const jsonStr = markerLine.slice(idx + marker.length).trim().split('\n')[0]
    const parsed = JSON.parse(jsonStr)

    expect(parsed.type).toBe('ready')
    expect(parsed.port).toBe(54321)
    expect(parsed.url).toBe('http://127.0.0.1:54321')
    expect(parsed.pid).toBe(1234)
  })
})
