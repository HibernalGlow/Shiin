/** Electron 辅助进程与 CLI 之间的通知 payload（纯函数，便于单测）。 */

import path from 'node:path'
import { pathToFileURL } from 'node:url'

import type { ScreenshotNotificationOptions } from './overlay-window.js'

const MIN_DURATION_MS = 500
const MAX_DURATION_MS = 30_000

export function normalizeOverlayScale(raw: number | string | undefined): number {
  let scale = typeof raw === 'number' ? raw : parseFloat(String(raw ?? ''))
  if (!Number.isFinite(scale) || scale <= 0) scale = 1
  return Math.min(2, Math.max(0.6, scale))
}

export function toImageUrl(img: string): string {
  if (!img) return ''
  if (img.startsWith('file://') || img.startsWith('data:')) return img
  // 路径可能带空格或非 ASCII：交给 URL 编码，别手拼 file://。
  return pathToFileURL(path.resolve(img)).href
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asFiniteNumber(value: unknown): number | undefined {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) ? number : undefined
}

export function parseOverlayPayload(raw: unknown): ScreenshotNotificationOptions {
  if (!raw || typeof raw !== 'object') return {}
  const source = raw as Record<string, unknown>
  const duration = asFiniteNumber(source.duration)
  const scale = asFiniteNumber(source.scale)
  const type = source.type === 'video' || source.type === 'text' ? source.type : undefined
  const position = source.position === 'left' || source.position === 'right' ? source.position : undefined

  return {
    img: asString(source.img),
    title: asString(source.title) || undefined,
    desc: asString(source.desc) || undefined,
    type,
    duration: duration === undefined ? undefined : Math.min(MAX_DURATION_MS, Math.max(MIN_DURATION_MS, duration)),
    position,
    scale,
  }
}
