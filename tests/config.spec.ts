import { describe, it, expect } from 'vitest'
import { MemoryConfigStorage, loadFullConfig, saveFullConfig } from '../src/core/config.js'
import { DEFAULT_CONFIG, ScreenShotWayEnum } from '../src/core/types.js'

describe('Config Storage', () => {
  it('loads default config from empty storage', async () => {
    const storage = new MemoryConfigStorage()
    const config = await loadFullConfig(storage)
    expect(config.imageFormat).toBe('jpg')
    expect(config.screenshotWay).toBe(ScreenShotWayEnum.DesktopCapturer)
    expect(config.comboKeys).toEqual([])
  })

  it('persists and reloads config accurately', async () => {
    const storage = new MemoryConfigStorage()
    const custom = {
      ...DEFAULT_CONFIG,
      imageFormat: 'png' as const,
      comboKeys: ['Button0', 'Button7'],
    }
    await saveFullConfig(storage, custom, 'Xbox Controller')

    const loaded = await loadFullConfig(storage, 'Xbox Controller')
    expect(loaded.imageFormat).toBe('png')
    expect(loaded.comboKeys).toEqual(['Button0', 'Button7'])
  })
})
