import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { electronRuntimeProblem, launchElectronOverlay } from '../src/app/cli/overlay.js'

vi.setConfig({ testTimeout: 20_000 })
const HOST_TIMEOUT = 15_000

describe('overlay startup confirmation', () => {
  let directory: string

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'shiin-overlay-test-'))
    vi.stubEnv('SHIIN_OVERLAY_SOCKET', path.join(directory, 'host.sock'))
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    fs.rmSync(directory, { recursive: true, force: true })
  })

  function script(source: string): string {
    const target = path.join(directory, 'host.cjs')
    fs.writeFileSync(target, source)
    return target
  }

  it('waits for the window receipt and cleans up even when the host stays alive', async () => {
    const host = script(`
      const fs = require('node:fs');
      const receipt = process.env.SHIIN_OVERLAY_RECEIPT;
      fs.writeFileSync(${JSON.stringify(path.join(directory, 'receipt-path'))}, receipt);
      setTimeout(() => fs.writeFileSync(receipt, JSON.stringify({shown: true})), 150);
      setTimeout(() => process.exit(0), 500);
    `)
    let settled = false
    const result = launchElectronOverlay(process.execPath, host, { title: 'test' }, HOST_TIMEOUT).then((value) => {
      settled = true
      return value
    })
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(settled).toBe(false)
    expect(await result).toEqual({ shown: true, backend: 'electron' })
    const receiptPath = fs.readFileSync(path.join(directory, 'receipt-path'), 'utf8')
    expect(fs.existsSync(path.dirname(receiptPath))).toBe(false)
  })

  it('reports a native crash with stderr instead of claiming the overlay was shown', async () => {
    const host = script(`process.stderr.write('dyld: Library not loaded: Electron Framework'); process.exit(1);`)
    expect(await launchElectronOverlay(process.execPath, host, {}, HOST_TIMEOUT)).toMatchObject({
      shown: false,
      backend: 'electron',
      reason: expect.stringContaining('dyld: Library not loaded: Electron Framework'),
    })
  })

  it('reports executable spawn errors', async () => {
    expect(await launchElectronOverlay(path.join(directory, 'missing-electron'), 'host.mjs', {}, HOST_TIMEOUT)).toMatchObject({
      shown: false,
      reason: expect.stringContaining('ENOENT'),
    })
  })

  it('waits for the resident host after the forwarding process exits successfully', async () => {
    const host = script(`
      const forwarded = require('node:child_process').spawn(process.execPath, ['-e',
        "setTimeout(() => require('node:fs').writeFileSync(process.env.SHIIN_OVERLAY_RECEIPT, JSON.stringify({shown: true})), 150)"
      ], { detached: true, stdio: 'ignore', env: process.env });
      forwarded.unref();
    `)
    expect(await launchElectronOverlay(process.execPath, host, {}, HOST_TIMEOUT)).toEqual({ shown: true, backend: 'electron' })
  })

  it('does not accept a successful process exit without a visible-window receipt', async () => {
    const host = script('process.exit(0)')
    expect(await launchElectronOverlay(process.execPath, host, {}, 200)).toMatchObject({
      shown: false,
      reason: expect.stringContaining('did not confirm a visible overlay'),
    })
  })

  it('propagates page loading failures reported by the host', async () => {
    const host = script(`require('node:fs').writeFileSync(process.env.SHIIN_OVERLAY_RECEIPT, JSON.stringify({shown: false, reason: 'ERR_FILE_NOT_FOUND'}))`)
    expect(await launchElectronOverlay(process.execPath, host, {}, HOST_TIMEOUT)).toEqual({
      shown: false,
      backend: 'electron',
      reason: 'ERR_FILE_NOT_FOUND',
    })
  })

  it.skipIf(process.platform !== 'darwin')('rejects a partial macOS bundle even when its launcher exists', () => {
    const executable = path.join(directory, 'Electron.app/Contents/MacOS/Electron')
    fs.mkdirSync(path.dirname(executable), { recursive: true })
    fs.writeFileSync(executable, '', { mode: 0o755 })
    expect(electronRuntimeProblem(executable)).toContain('Incomplete Electron runtime')
    const framework = path.join(directory, 'Electron.app/Contents/Frameworks/Electron Framework.framework/Electron Framework')
    fs.mkdirSync(path.dirname(framework), { recursive: true })
    fs.writeFileSync(framework, '')
    expect(electronRuntimeProblem(executable)).toBeNull()
  })
})
