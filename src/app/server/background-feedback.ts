/**
 * Web/Node 宿主的后台反馈：页面没开时，快门声必须由服务端自己放。
 *
 * 音效数据与桌面端同源（`SOUND_DATA_URIS`），播放走系统命令，
 * 不依赖 BrowserWindow 或渲染进程。
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import { SOUND_DATA_URIS } from '../../ui/audio-data.js'
import { ScreenshotSoundEnum } from '../../core/types.js'

const execFileAsync = promisify(execFile)
const cachedSoundFilePaths = new Map<string, string>()

export async function playBackgroundShutterSound(
  sound?: ScreenshotSoundEnum | string,
  power = 1,
): Promise<void> {
  if (!sound || sound === ScreenshotSoundEnum.None || sound === 'None') return
  const dataUri = SOUND_DATA_URIS[sound]
  if (!dataUri) return

  try {
    let wavPath = cachedSoundFilePaths.get(sound)
    if (!wavPath || !fs.existsSync(wavPath)) {
      const base64Data = dataUri.split(',')[1]
      if (!base64Data) return
      wavPath = path.join(os.tmpdir(), `shiin-shutter-${sound}.wav`)
      fs.writeFileSync(wavPath, Buffer.from(base64Data, 'base64'))
      cachedSoundFilePaths.set(sound, wavPath)
    }

    const volume = Math.max(0.05, Math.min(2, Number(power) || 1))
    if (process.platform === 'darwin') {
      await execFileAsync('/usr/bin/afplay', ['-v', String(volume), wavPath])
    } else if (process.platform === 'win32') {
      const escaped = wavPath.replace(/'/g, "''")
      await execFileAsync('powershell', [
        '-NoProfile',
        '-NonInteractive',
        '-WindowStyle',
        'Hidden',
        '-Command',
        `(New-Object Media.SoundPlayer '${escaped}').PlaySync()`,
      ])
    } else {
      await execFileAsync('paplay', [wavPath])
    }
  } catch (error) {
    console.warn('[BackgroundFeedback] play shutter sound failed:', error)
  }
}
