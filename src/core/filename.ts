import type { ActiveWinResult } from './types.js'

/**
 * 清理非法文件夹字符
 */
export function sanitizeToValidFolderName(str?: string): string {
  if (!str || typeof str !== 'string') return 'untitled_folder'
  let cleaned = str
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1f\x7f\\/:*?"<>|]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^[\s_]+|[\s_]+$/g, '')
    .substring(0, 255)

  if (!cleaned) return 'untitled_folder'

  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i.test(cleaned)) {
    cleaned = `_${cleaned}`
  }

  return cleaned || 'untitled_folder'
}

/**
 * 文件名模板占位符替换
 */
export function formatFileName(
  template: string,
  activeWinInfo?: ActiveWinResult | null,
  customDate?: Date
): string {
  if (!template || typeof template !== 'string' || template.trim() === '') {
    return `Screenshot_${Date.now()}`
  }

  const now = customDate || new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const cs = String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0')
  const ms = String(now.getMilliseconds()).padStart(3, '0')

  const title = activeWinInfo?.title ? sanitizeToValidFolderName(activeWinInfo.title) : 'UnknownWindow'
  const owner = activeWinInfo?.owner?.name ? sanitizeToValidFolderName(activeWinInfo.owner.name) : 'UnknownOwner'

  const map: Record<string, string | number> = {
    timestamp: now.getTime(),
    datetime: `${year}_${month}_${date}-${hours}_${minutes}_${seconds}`,
    YYYY: year,
    MM: month,
    DD: date,
    hh: hours,
    mm: minutes,
    ss: seconds,
    cs: cs,
    ms: ms,
    activeWinTitle: title,
    activeWinOwner: owner,
  }

  return template.replace(
    /(?:%|\$\{?)(timestamp|datetime|YYYY|MM|DD|hh|mm|ss|cs|ms|activeWinTitle|activeWinOwner)(?:%|\}?)/g,
    (_, key) => String(map[key] ?? _)
  )
}
