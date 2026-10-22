import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'

import { parseArgs } from '../src/app/cli/args.js'
import { createTranslator } from '../src/app/cli/i18n.js'
import {
  buildOverlayPayload,
  captureOverlayRequest,
  overlayDisabledByEnv,
  replayOverlayRequest,
  showOverlayNotification,
} from '../src/app/cli/overlay.js'
import { normalizeOverlayScale, parseOverlayPayload, toImageUrl } from '../src/app/electron/overlay-payload.js'

describe('overlay payload', () => {
  it('keeps the desktop defaults when nothing is declared', () => {
    expect(buildOverlayPayload({ img: '/tmp/a.png', title: 'ok' })).toMatchObject({
      img: '/tmp/a.png',
      title: 'ok',
      duration: 4500,
      position: 'right',
      scale: 1,
    })
  })

  it('reads position and size from config but lets explicit flags win', () => {
    const config = { overlayNotifyPosition: 'left' as const, overlayNotifySize: 1.3 }
    expect(buildOverlayPayload({ img: '/tmp/a.png' }, config)).toMatchObject({ position: 'left', scale: 1.3 })
    expect(buildOverlayPayload({ img: '/tmp/a.png', position: 'right', scale: 0.8 }, config)).toMatchObject({
      position: 'right',
      scale: 0.8,
    })
    // 4-corner positions
    expect(buildOverlayPayload({ img: '/tmp/a.png', position: 'top-left' }, config)).toMatchObject({ position: 'top-left' })
    expect(buildOverlayPayload({ img: '/tmp/a.png', position: 'bottom-right' }, config)).toMatchObject({ position: 'bottom-right' })
  })

  it('drops unknown fields and clamps out-of-range durations', () => {
    expect(parseOverlayPayload({ title: 't', type: 'image', position: 'center', duration: 10 })).toMatchObject({
      title: 't',
      type: undefined,
      position: undefined,
      duration: 500,
    })
    expect(parseOverlayPayload({ position: 'bottom-left' })).toMatchObject({ position: 'bottom-left' })
    expect(parseOverlayPayload({ position: 'top-right' })).toMatchObject({ position: 'top-right' })
    expect(parseOverlayPayload({ duration: 999_999 }).duration).toBe(30_000)
    expect(parseOverlayPayload(null)).toEqual({})
  })

  it('keeps the configured corner, duration and theme for automatic captures', () => {
    const payload = buildOverlayPayload({ img: '/tmp/a.png' }, {
      overlayNotifyPosition: 'top-left', overlayNotifyDuration: 2, theme: 'dark',
    })
    expect(parseOverlayPayload(payload)).toMatchObject({ position: 'top-left', duration: 2000, theme: 'dark' })
  })

  it('accepts a lower-case duration and scale from JSON', () => {
    expect(parseOverlayPayload({ duration: '2500', scale: '1.25' })).toMatchObject({ duration: 2500, scale: 1.25 })
  })

  it('clamps the desktop size range and URL-encodes image paths', () => {
    expect(normalizeOverlayScale(0.1)).toBe(0.6)
    expect(normalizeOverlayScale('9')).toBe(2)
    expect(normalizeOverlayScale(undefined)).toBe(1)
    expect(toImageUrl('/tmp/a b/预览.png')).toBe(pathToFileURL(path.resolve('/tmp/a b/预览.png')).href)
    expect(toImageUrl('data:image/png;base64,AA==')).toBe('data:image/png;base64,AA==')
  })
})

describe('capture/replay notification copy', () => {
  const t = createTranslator('en')

  it('shows the captured file as the image preview and its basename as the description', () => {
    const request = captureOverlayRequest(
      { ok: true, filePath: '/tmp/shots/Screenshot_1.png', timestamp: 0, format: 'png' },
      t,
    )
    expect(request).toMatchObject({
      img: '/tmp/shots/Screenshot_1.png',
      title: 'Screenshot saved',
      desc: 'Screenshot_1.png',
      type: undefined,
    })
  })

  it('falls back to a text card when only the clipboard was written', () => {
    expect(captureOverlayRequest({ ok: true, filePath: null, timestamp: 0, format: 'jpg' }, t)).toMatchObject({
      img: '',
      desc: 'Saved locally',
      type: 'text',
    })
  })

  it('reports capture failures with the real error', () => {
    expect(captureOverlayRequest({ ok: false, error: 'no monitor', timestamp: 0, format: 'jpg' }, t)).toMatchObject({
      title: 'Capture failed',
      desc: 'no monitor',
      type: 'text',
    })
  })

  it('uses the video card for replay and text for replay failures', () => {
    expect(replayOverlayRequest({ ok: true }, t)).toMatchObject({ title: 'OBS replay saved', type: 'video' })
    expect(replayOverlayRequest({ ok: false, error: 'OBS is not connected' }, t)).toMatchObject({
      title: 'Failed to save OBS replay',
      desc: 'OBS is not connected',
      type: 'text',
    })
  })
})

describe('overlay switches', () => {
  it('honours SHIIN_OVERLAY=off and its aliases', () => {
    expect(overlayDisabledByEnv({ SHIIN_OVERLAY: 'off' })).toBe(true)
    expect(overlayDisabledByEnv({ SHIIN_OVERLAY: '0' })).toBe(true)
    expect(overlayDisabledByEnv({ SHIIN_OVERLAY: 'false' })).toBe(true)
    expect(overlayDisabledByEnv({ SHIIN_OVERLAY: 'on' })).toBe(false)
    expect(overlayDisabledByEnv({})).toBe(false)
  })

  it('does not spawn anything when the config says hide', async () => {
    expect(await showOverlayNotification({ title: 'x' }, { overlayNotify: 'hide' })).toEqual({
      shown: false,
      backend: 'none',
      reason: 'disabled',
    })
  })

  it('maps --no-notify to notify=false instead of a new key', () => {
    const parsed = parseArgs(['--no-notify'], ['notify'])
    expect(parsed.flags.notify).toBe(false)
    expect(parsed.flags['no-notify']).toBeUndefined()
  })
})
