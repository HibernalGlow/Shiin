/**
 * Shared utility helpers for formatting numbers, timestamps, durations, and keys.
 */

export function formatDuration(ms: number, isZh = true): string {
  if (ms <= 0) return isZh ? '0 分钟' : '0 min'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    if (minutes > 0) {
      return isZh ? `${hours} 小时 ${minutes} 分钟` : `${hours}h ${minutes}m`
    }
    return isZh ? `${hours} 小时` : `${hours}h`
  }

  if (minutes > 0) {
    return isZh ? `${minutes} 分钟` : `${minutes}m`
  }

  return isZh ? `${seconds} 秒` : `${seconds}s`
}

export function formatCompactDuration(ms: number, isZh = true): string {
  if (ms <= 0) return '0h'
  const hours = ms / 3600_000
  if (hours >= 1) {
    return `${hours.toFixed(1)} ${isZh ? '小时' : 'h'}`
  }
  const minutes = Math.round(ms / 60_000)
  return `${minutes} ${isZh ? '分钟' : 'min'}`
}

export function formatTimeAgo(timestamp: number, isZh = true): string {
  const diff = Date.now() - timestamp
  if (diff < 10_000) return isZh ? '刚刚' : 'just now'
  if (diff < 60_000) return isZh ? `${Math.floor(diff / 1000)} 秒前` : `${Math.floor(diff / 1000)}s ago`
  if (diff < 3600_000) return isZh ? `${Math.floor(diff / 60_000)} 分钟前` : `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86400_000) return isZh ? `${Math.floor(diff / 3600_000)} 小时前` : `${Math.floor(diff / 3600_000)}h ago`
  const days = Math.floor(diff / 86400_000)
  return isZh ? `${days} 天前` : `${days}d ago`
}

export function formatExactTime(timestamp: number): string {
  const d = new Date(timestamp)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function formatTimerClock(seconds: number): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hrs > 0 ? `${pad(hrs)}:` : ''}${pad(mins)}:${pad(secs)}`
}

export const GAMEPAD_BUTTON_PRETTY_NAMES: Record<string, { zh: string; en: string; short: string }> = {
  Button0: { zh: 'A 键', en: 'A Button', short: 'A' },
  Button1: { zh: 'B 键', en: 'B Button', short: 'B' },
  Button2: { zh: 'X 键', en: 'X Button', short: 'X' },
  Button3: { zh: 'Y 键', en: 'Y Button', short: 'Y' },
  Button4: { zh: '左肩键 (LB)', en: 'Left Bumper (LB)', short: 'LB' },
  Button5: { zh: '右肩键 (RB)', en: 'Right Bumper (RB)', short: 'RB' },
  Button6: { zh: '左扳机 (LT)', en: 'Left Trigger (LT)', short: 'LT' },
  Button7: { zh: '右扳机 (RT)', en: 'Right Trigger (RT)', short: 'RT' },
  Button8: { zh: '返回 / 视图 (Back)', en: 'Back / View', short: 'Back' },
  Button9: { zh: '菜单 / 开始 (Start)', en: 'Menu / Start', short: 'Start' },
  Button10: { zh: '左摇杆按下 (L3)', en: 'Left Stick (L3)', short: 'L3' },
  Button11: { zh: '右摇杆按下 (R3)', en: 'Right Stick (R3)', short: 'R3' },
  Button12: { zh: '十字键 ↑ (D-Up)', en: 'D-Pad Up', short: '↑' },
  Button13: { zh: '十字键 ↓ (D-Down)', en: 'D-Pad Down', short: '↓' },
  Button14: { zh: '十字键 ← (D-Left)', en: 'D-Pad Left', short: '←' },
  Button15: { zh: '十字键 → (D-Right)', en: 'D-Pad Right', short: '→' },
  Button16: { zh: '主页 / 徽标 (Home)', en: 'Home / Guide', short: 'Home' },
}

export function getButtonDisplayName(key: string, isZh = true): string {
  const info = GAMEPAD_BUTTON_PRETTY_NAMES[key]
  if (info) return isZh ? info.zh : info.en
  return key
}

export function getButtonShortName(key: string): string {
  const info = GAMEPAD_BUTTON_PRETTY_NAMES[key]
  return info ? info.short : key.replace(/^Button/, 'B')
}
