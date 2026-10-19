import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

let uIOhook: any = null

try {
  const uio = require('uiohook-napi')
  uIOhook = uio.uIOhook || uio.default?.uIOhook
} catch (e) {
  console.warn('[KeyboardCore] uiohook-napi not available on this platform or architecture:', e)
}

export type KeyboardHookCallback = (keycode: number) => void

export class KeyboardCore {
  private isHookRunning = false
  private callback: KeyboardHookCallback | null = null

  constructor() {
    if (uIOhook) {
      uIOhook.on('keydown', (event: { keycode: number }) => {
        if (this.callback) {
          this.callback(event.keycode)
        }
      })
    }
  }

  public onKeyDown(cb: KeyboardHookCallback): void {
    this.callback = cb
  }

  public start(): boolean {
    if (!uIOhook) return false
    if (this.isHookRunning) return true
    try {
      uIOhook.start()
      this.isHookRunning = true
      return true
    } catch (err) {
      console.error('[KeyboardCore] Failed to start uIOhook:', err)
      return false
    }
  }

  public stop(): void {
    if (!uIOhook || !this.isHookRunning) return
    try {
      uIOhook.stop()
    } catch {
      // ignore
    }
    this.isHookRunning = false
  }

  public get isRunning(): boolean {
    return this.isHookRunning
  }
}
