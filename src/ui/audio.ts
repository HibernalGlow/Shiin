/**
 * 截图音效统一管理与播放器
 * 支持 5 种 2.0 专业单反/无损提示音：
 * - Sound1: 徕卡 M10 快门 (96ms)
 * - Sound2: 柔和铃声 (373ms)
 * - Sound3: 单反快门 (100ms)
 * - Sound4: 机械反光板 (143ms)
 * - Sound5: 佳能 5D 快门 (164ms)
 */

import { SOUND_DATA_URIS } from './audio-data.js'
import { ScreenshotSoundEnum } from '../core/types.js'

export const SOUND_DEFINITIONS = [
  {
    id: ScreenshotSoundEnum.Sound1,
    key: 'Sound1',
    zh: '音效 1 (徕卡 M10 快门)',
    en: 'Sound 1 (Leica M10)',
    duration: '96ms',
  },
  {
    id: ScreenshotSoundEnum.Sound2,
    key: 'Sound2',
    zh: '音效 2 (柔和提示铃声)',
    en: 'Sound 2 (Soft Chime)',
    duration: '373ms',
  },
  {
    id: ScreenshotSoundEnum.Sound3,
    key: 'Sound3',
    zh: '音效 3 (单反快门)',
    en: 'Sound 3 (SLR Shutter)',
    duration: '100ms',
  },
  {
    id: ScreenshotSoundEnum.Sound4,
    key: 'Sound4',
    zh: '音效 4 (机械反光板咔哒)',
    en: 'Sound 4 (SLR Clack)',
    duration: '143ms',
  },
  {
    id: ScreenshotSoundEnum.Sound5,
    key: 'Sound5',
    zh: '音效 5 (佳能 5D 快门)',
    en: 'Sound 5 (Canon 5D)',
    duration: '164ms',
  },
] as const

// 预解码 AudioBuffer 缓存池
let audioCtx: AudioContext | null = null
const bufferCache = new Map<string, AudioBuffer>()
const audioElementCache = new Map<string, HTMLAudioElement>()

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    void audioCtx.resume()
  }
  return audioCtx
}

// 防抖：短时间内连续快门只发声一次
let lastPlayTimestamp = 0
const MIN_PLAY_INTERVAL_MS = 60

/**
 * 播放截图提示音
 * @param sound 音效编号或枚举 (Sound1 ~ Sound5, None)
 * @param power 音量比例 (0.0 ~ 1.0 或更高)
 */
export async function playCaptureSound(
  sound?: ScreenshotSoundEnum | string,
  power: number = 1
): Promise<boolean> {
  if (!sound || sound === ScreenshotSoundEnum.None || sound === 'None') {
    return false
  }

  const now = Date.now()
  if (now - lastPlayTimestamp < MIN_PLAY_INTERVAL_MS) {
    return false
  }
  lastPlayTimestamp = now

  const dataUri = SOUND_DATA_URIS[sound]
  if (!dataUri) {
    return false
  }

  const volume = Math.max(0, Math.min(2, Number(power) || 1))

  try {
    const ctx = getAudioContext()
    if (ctx) {
      let buffer = bufferCache.get(sound)
      if (!buffer) {
        // 解码 base64
        const binaryStr = atob(dataUri.split(',')[1] || '')
        const len = binaryStr.length
        const bytes = new Uint8Array(len)
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i)
        }
        buffer = await ctx.decodeAudioData(bytes.buffer)
        bufferCache.set(sound, buffer)
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer

      const gainNode = ctx.createGain()
      gainNode.gain.setValueAtTime(volume, ctx.currentTime)

      source.connect(gainNode)
      gainNode.connect(ctx.destination)
      source.start(0)
      return true
    }
  } catch (err) {
    // 降级使用 HTMLAudioElement
  }

  try {
    let audio = audioElementCache.get(sound)
    if (!audio) {
      audio = new Audio(dataUri)
      audioElementCache.set(sound, audio)
    }
    audio.volume = Math.max(0, Math.min(1, volume))
    audio.currentTime = 0
    await audio.play()
    return true
  } catch (e) {
    console.warn('[Audio] Failed to play capture sound:', e)
    return false
  }
}

/** 辅助获取音效可读标签 */
export function getSoundLabel(soundId: string, locale: string = 'zh'): string {
  const item = SOUND_DEFINITIONS.find((d) => d.id === soundId || d.key === soundId)
  if (!item) {
    return soundId === ScreenshotSoundEnum.None ? (locale.startsWith('zh') ? '静音 (关闭)' : 'Mute') : soundId
  }
  return locale.startsWith('zh') ? item.zh : item.en
}
