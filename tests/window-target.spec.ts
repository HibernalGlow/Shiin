import { describe, expect, it } from 'vitest'

import { pickFocusedWindow, resolveWindowCaptureTarget } from '../src/core/screenshot.js'
import type { ActiveWinResult, CaptureWindowInfo } from '../src/core/types.js'

const windows: CaptureWindowInfo[] = [
  { id: 101, title: 'Elden Ring', ownerName: 'Game' },
  { id: 102, title: 'Settings', ownerName: 'Shiin' },
  { id: 103, title: 'Settings', ownerName: 'Other' },
]

function active(partial: Partial<ActiveWinResult>): ActiveWinResult {
  return { title: '', ...partial }
}

describe('focused window resolution', () => {
  it('uses the foreground window id when active-win provides one', () => {
    expect(pickFocusedWindow(active({ id: 101, title: 'Elden Ring' }), windows)).toMatchObject({
      id: 101,
      title: 'Elden Ring',
    })
  })

  it('matches by title when the foreground id is missing', () => {
    expect(pickFocusedWindow(active({ title: 'Elden Ring', owner: { name: 'Game', processId: 1, path: '' } }), windows)).toMatchObject({
      id: 101,
    })
  })

  it('uses the owner to disambiguate duplicate titles', () => {
    expect(
      pickFocusedWindow(active({ title: 'Settings', owner: { name: 'Other', processId: 2, path: '' } }), windows),
    ).toMatchObject({ id: 103 })
  })

  it('matches a unique owner when only the app name is known', () => {
    expect(
      pickFocusedWindow(active({ title: 'Shiin', owner: { name: 'Shiin', processId: 2, path: '' } }), windows),
    ).toMatchObject({ id: 102 })
  })

  it('refuses to guess when the foreground window cannot be matched', () => {
    expect(() => pickFocusedWindow(active({ title: 'Unknown', owner: { name: 'Nope', processId: 3, path: '' } }), windows)).toThrow(
      /not a capturable window/,
    )
    expect(() => pickFocusedWindow(null, windows)).toThrow(/No focused window/)
  })
})

describe('configured window target', () => {
  it('uses the pinned id in specified mode', async () => {
    await expect(
      resolveWindowCaptureTarget({ windowCaptureMode: 'specified', windowSourceId: 101 }),
    ).resolves.toMatchObject({ id: 101 })
  })

  it('reports an empty pinned selection instead of falling back silently', async () => {
    await expect(
      resolveWindowCaptureTarget({ windowCaptureMode: 'specified', windowSourceId: '' }),
    ).rejects.toThrow(/No target window selected/)
  })
})
