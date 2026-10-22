import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { showOverlayNotification } from '../src/app/cli/overlay.js'
vi.mock('../src/app/cli/overlay.js', async (importOriginal) => ({
  ...await importOriginal<typeof import('../src/app/cli/overlay.js')>(),
  showOverlayNotification: vi.fn(),
  warmOverlayHost: vi.fn().mockResolvedValue(undefined),
}))

import { startWebServer, type WebHostManager, type WebServerHandle } from '../src/app/server/index.js'
import { DEFAULT_CONFIG, type ScreenshotConfig } from '../src/core/types.js'

function createStubManager(): {
  manager: WebHostManager
  storage: Map<string, unknown>
  calls: string[]
  emit: (event: { type: string; data?: unknown }) => void
} {
  const storage = new Map<string, unknown>()
  const listeners = new Set<(event: { type: string; data?: unknown }) => void>()
  const calls: string[] = []
  const config: ScreenshotConfig = { ...DEFAULT_CONFIG, path: os.tmpdir(), comboKeys: [] }
  let listening = false
  let activeIndex = 0

  const manager: WebHostManager = {
    config,
    storage: {
      get<T>(key: string, defaultValue: T): T {
        return storage.has(key) ? (storage.get(key) as T) : defaultValue
      },
      set<T>(key: string, value: T): void {
        storage.set(key, value)
      },
    },
    get listening() {
      return listening
    },
    gamepad: {
      getConnectedDevices: () => [{ _index: 0, id: 'pad-0', name: 'Test Pad' }],
      getActiveDeviceIndex: () => activeIndex,
      getCurrentButtons: () => [true, false],
      getCurrentAxes: () => [0.5, 0],
      openDevice: (index) => {
        activeIndex = index
        calls.push(`open:${index}`)
        return true
      },
      closeDevice: () => {
        calls.push('close')
      },
    },
    startListening: async () => {
      listening = true
      calls.push('listen:start')
      return { ok: true }
    },
    stopListening: () => {
      listening = false
      calls.push('listen:stop')
    },
    capture: async () => {
      calls.push('capture')
      return { ok: true, filePath: null, timestamp: Date.now(), format: config.imageFormat }
    },
    saveOBSReplay: async () => {
      calls.push('replay')
      return { ok: true }
    },
    syncConfig: (patch) => {
      Object.assign(config, patch)
      calls.push('sync')
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    dispose: () => {},
  }

  return {
    manager,
    storage,
    calls,
    emit: (event) => {
      for (const listener of listeners) listener(event)
    },
  }
}

describe('Shiin web host', () => {
  let root = ''
  let handle: WebServerHandle
  let stub: ReturnType<typeof createStubManager>
  let backgroundEvents: Array<{ type: string; data?: unknown }>

  beforeEach(async () => {
    vi.mocked(showOverlayNotification).mockReset().mockResolvedValue({ shown: true, backend: 'electron' })
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'shiin-web-'))
    fs.writeFileSync(path.join(root, 'index.html'), '<!doctype html><meta charset="utf-8"><div id="app"></div>')
    stub = createStubManager()
    backgroundEvents = []
    handle = await startWebServer({
      manager: stub.manager,
      root,
      port: 0,
      onBackgroundEvent: (event) => backgroundEvents.push(event),
    })
  })

  afterEach(async () => {
    await handle.close()
    fs.rmSync(root, { recursive: true, force: true })
  })

  it('serves the built UI and the shared manager state', async () => {
    const page = await fetch(`${handle.url}/`)
    expect(await page.text()).toContain('id="app"')

    const state = await (await fetch(`${handle.url}/api/state`)).json()
    expect(state.listening).toBe(false)
    expect(state.devices).toHaveLength(1)
    expect(state.config.path).toBe(os.tmpdir())

    const pads = await (await fetch(`${handle.url}/api/gamepads`)).json()
    expect(pads[0].name).toBe('Test Pad')
    expect(stub.calls).toContain('open:0')
  })

  it('routes store, listen and gamepad actions into the same manager', async () => {
    const nextConfig = { ...DEFAULT_CONFIG, comboKeys: ['Button1'], imageFormat: 'png' as const }
    const saved = await fetch(`${handle.url}/api/store/set`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'globalConfig', value: JSON.stringify(nextConfig) }),
    })
    expect(saved.status).toBe(200)
    expect(stub.manager.config.comboKeys).toEqual(['Button1'])
    expect(stub.manager.config.imageFormat).toBe('png')

    const readBack = await (
      await fetch(`${handle.url}/api/store/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'missing', defaultValue: 'fallback' }),
      })
    ).json()
    expect(readBack.value).toBe('fallback')

    const opened = await (
      await fetch(`${handle.url}/api/gamepads/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: 3 }),
      })
    ).json()
    expect(opened).toEqual({ ok: true, activeIndex: 3 })
    expect(stub.calls).toContain('open:3')

    const live = await (await fetch(`${handle.url}/api/gamepad/state`)).json()
    expect(live.buttons).toEqual([true, false])
    expect(live.axes).toEqual([0.5, 0])

    const started = await (
      await fetch(`${handle.url}/api/listen/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: { ...DEFAULT_CONFIG, comboKeys: ['Button7'] } }),
      })
    ).json()
    expect(started.ok).toBe(true)
    expect(stub.calls).toContain('listen:start')
    expect(stub.manager.config.comboKeys).toEqual(['Button7'])
    expect((await (await fetch(`${handle.url}/api/listen/state`)).json()).listening).toBe(true)

    await fetch(`${handle.url}/api/listen/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
    expect(stub.manager.listening).toBe(false)
  })

  it('captures and saves OBS replay through the manager', async () => {
    const capture = await (
      await fetch(`${handle.url}/api/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: { ...DEFAULT_CONFIG, imageFormat: 'png' } }),
      })
    ).json()
    expect(capture.ok).toBe(true)
    expect(stub.manager.config.imageFormat).toBe('png')
    expect(stub.calls).toContain('capture')

    const replay = await (
      await fetch(`${handle.url}/api/obs/save-replay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
    ).json()
    expect(replay.ok).toBe(true)
    expect(stub.calls).toContain('replay')
  })

  it('pushes manager events over SSE', async () => {
    const controller = new AbortController()
    const response = await fetch(`${handle.url}/api/events`, { signal: controller.signal })
    expect(response.status).toBe(200)
    const reader = response.body?.getReader()
    expect(reader).toBeTruthy()

    const decoder = new TextDecoder()
    let buffered = ''
    const readUntil = async (needle: string, timeoutMs = 2000): Promise<string> => {
      const deadline = Date.now() + timeoutMs
      while (!buffered.includes(needle)) {
        const remaining = deadline - Date.now()
        if (remaining <= 0) throw new Error(`timed out waiting for ${needle}; got: ${buffered}`)
        const chunk = await Promise.race([
          reader!.read(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('read timed out')), remaining)),
        ])
        if (chunk.done) break
        buffered += decoder.decode(chunk.value, { stream: true })
      }
      return buffered
    }

    await readUntil('event: ready')
    stub.emit({ type: 'screenshot', data: { ok: true, filePath: '/tmp/a.png', timestamp: 1, format: 'png' } })
    const streamed = await readUntil('event: screenshot')
    expect(streamed).toContain('"/tmp/a.png"')
    expect(backgroundEvents).toHaveLength(0)
    expect(showOverlayNotification).toHaveBeenCalledTimes(1)
    expect(showOverlayNotification).toHaveBeenCalledWith(expect.objectContaining({ img: '/tmp/a.png' }), stub.manager.config)

    controller.abort()
    await reader!.cancel().catch(() => undefined)
  })

  it('routes background feedback only when no page is connected', () => {
    stub.emit({ type: 'screenshot', data: { ok: true, filePath: '/tmp/a.png', timestamp: 1, format: 'png' } })
    expect(backgroundEvents).toHaveLength(1)
    expect(backgroundEvents[0].type).toBe('screenshot')
    expect(backgroundEvents[0].data).toMatchObject({ filePath: '/tmp/a.png' })
    expect(showOverlayNotification).toHaveBeenCalledTimes(1)
  })

  it('shows one desktop overlay for a manual capture while a page is connected', async () => {
    const controller = new AbortController()
    const stream = await fetch(`${handle.url}/api/events`, { signal: controller.signal })
    try {
      const response = await fetch(`${handle.url}/api/capture`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
      })
      expect((await response.json()).ok).toBe(true)
      expect(backgroundEvents).toHaveLength(0)
      expect(showOverlayNotification).toHaveBeenCalledTimes(1)
    } finally {
      controller.abort()
      await stream.body?.cancel().catch(() => undefined)
    }
  })

  it('honours disabled overlays for capture events and manual captures', async () => {
    stub.manager.config.overlayNotify = 'hide'
    stub.emit({ type: 'screenshot', data: { ok: true, filePath: '/tmp/a.png', timestamp: 1, format: 'png' } })
    await fetch(`${handle.url}/api/capture`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    })
    expect(showOverlayNotification).not.toHaveBeenCalled()
  })

  it('shows replay overlays even when a page is connected', async () => {
    const controller = new AbortController()
    const stream = await fetch(`${handle.url}/api/events`, { signal: controller.signal })
    try {
      stub.emit({ type: 'replayBuffer', data: { ok: true } })
      expect(showOverlayNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'video' }), stub.manager.config)
    } finally {
      controller.abort()
      await stream.body?.cancel().catch(() => undefined)
    }
  })

  it('accepts notification requests via /api/notify', async () => {
    const notifyRes = await (
      await fetch(`${handle.url}/api/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test Toast', desc: 'Message body', type: 'text' }),
      })
    ).json()
    expect(notifyRes.ok).toBe(true)
    expect(notifyRes).toHaveProperty('shown')
    expect(notifyRes).toHaveProperty('backend')
  })

  it.each(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const)('preserves %s and the theme in notification requests', async (position) => {
    await fetch(`${handle.url}/api/notify`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Position test', position, theme: 'dark', force: true }),
    })
    expect(showOverlayNotification).toHaveBeenCalledWith(
      expect.objectContaining({ position, theme: 'dark' }),
      expect.objectContaining({ overlayNotify: 'show' }),
    )
  })

  it('reports failed overlay startup through /api/notify', async () => {
    vi.mocked(showOverlayNotification).mockResolvedValue({
      shown: false, backend: 'electron', reason: 'Incomplete Electron runtime',
    })
    const response = await fetch(`${handle.url}/api/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test Toast' }),
    })
    expect(await response.json()).toEqual({
      ok: false, shown: false, backend: 'electron', reason: 'Incomplete Electron runtime',
    })
  })

  it('rejects cross-origin page requests', async () => {
    const response = await fetch(`${handle.url}/api/state`, {
      headers: { Origin: 'https://evil.example' },
    })
    expect(response.status).toBe(403)
  })
})
