/**
 * Shiin Activity & Usage Statistics Core Engine
 *
 * Provides event-driven data models, edge detection for gamepad buttons,
 * session-based consecutive screenshot streak calculation, and persistence structures.
 */

export type ActivityEventType =
  | 'screenshot'
  | 'listen_start'
  | 'listen_stop'
  | 'button_press'
  | 'obs_replay'

export interface ActivityEvent {
  id: string
  type: ActivityEventType
  timestamp: number
  titleZh: string
  titleEn: string
  description?: string
  meta?: {
    appName?: string
    windowTitle?: string
    filePath?: string
    buttonKey?: string
    buttonName?: string
    gamepadName?: string
    durationMs?: number
    ok?: boolean
    format?: string
  }
}

export interface StreakSession {
  startTime: number
  endTime: number
  count: number
  durationMs: number
}

export interface StreakStats {
  sessionsCount: number
  maxDurationMs: number
  longestSession: StreakSession | null
  currentSessionStreak: number
}

export interface ActivityStatsData {
  version: 1
  totalCaptures: number
  totalListenStarts: number
  totalListenDurationMs: number
  maxSingleListenDurationMs: number
  capturesWhileListening: number
  replaysWhileListening: number
  totalReplaysSaved: number

  // App & Window aggregations
  appCounts: Record<string, { count: number; lastSeen: number }>
  windowCounts: Record<string, { appName?: string; count: number; lastSeen: number }>

  // Gamepad button counts: buttonKey -> count
  buttonCounts: Record<string, number>

  // Hourly captures distribution: 0..23
  hourlyCaptures: number[]

  // Day of week distribution: 0..6 (0=Sun, 1=Mon, ..., 6=Sat)
  dayOfWeekCaptures: number[]

  // Recent screenshot timestamps (for streaks calculation, capped at 1000)
  captureTimestamps: number[]

  // Event stream (capped at 200 for local storage efficiency)
  events: ActivityEvent[]

  lastUpdatedAt: number
}

/**
 * Calculate consecutive screenshot streaks.
 * Two screenshots within `thresholdMs` (default 5 minutes) belong to the same session.
 */
export function calculateConsecutiveStreaks(
  timestamps: number[],
  thresholdMs = 5 * 60 * 1000
): StreakStats {
  if (!timestamps || timestamps.length === 0) {
    return { sessionsCount: 0, maxDurationMs: 0, longestSession: null, currentSessionStreak: 0 }
  }

  const sorted = [...timestamps].sort((a, b) => a - b)
  const sessions: StreakSession[] = []
  let currentStart = sorted[0]
  let currentLast = sorted[0]
  let currentCount = 1

  for (let i = 1; i < sorted.length; i++) {
    const diff = sorted[i] - currentLast
    if (diff <= thresholdMs) {
      currentLast = sorted[i]
      currentCount++
    } else {
      sessions.push({
        startTime: currentStart,
        endTime: currentLast,
        count: currentCount,
        durationMs: currentLast - currentStart,
      })
      currentStart = sorted[i]
      currentLast = sorted[i]
      currentCount = 1
    }
  }

  sessions.push({
    startTime: currentStart,
    endTime: currentLast,
    count: currentCount,
    durationMs: currentLast - currentStart,
  })

  let maxDurationMs = 0
  let longestSession: StreakSession | null = null
  for (const s of sessions) {
    if (s.durationMs >= maxDurationMs) {
      maxDurationMs = s.durationMs
      longestSession = s
    }
  }

  const now = Date.now()
  const latestSession = sessions[sessions.length - 1]
  const currentSessionStreak =
    latestSession && now - latestSession.endTime <= thresholdMs ? latestSession.count : 0

  return {
    sessionsCount: sessions.length,
    maxDurationMs,
    longestSession,
    currentSessionStreak,
  }
}

/**
 * Gamepad button edge detector to prevent long-press multi-sampling.
 * Only triggers `onPress` upon a valid rising edge (0 -> 1).
 */
export class GamepadEdgeDetector {
  private prevButtons: boolean[] = []
  private pressTimestamps: Map<number, number> = new Map()

  public processButtons(
    currentButtons: boolean[],
    onPress: (buttonIndex: number, buttonKey: string) => void,
    onRelease?: (buttonIndex: number, buttonKey: string, heldDurationMs: number) => void
  ): void {
    const now = Date.now()
    const maxLen = Math.max(this.prevButtons.length, currentButtons.length)

    for (let i = 0; i < maxLen; i++) {
      const wasPressed = this.prevButtons[i] || false
      const isPressed = Boolean(currentButtons[i])

      if (!wasPressed && isPressed) {
        this.pressTimestamps.set(i, now)
        onPress(i, `Button${i}`)
      } else if (wasPressed && !isPressed) {
        const pressedAt = this.pressTimestamps.get(i) || now
        const heldDuration = now - pressedAt
        this.pressTimestamps.delete(i)
        onRelease?.(i, `Button${i}`, heldDuration)
      }
    }

    this.prevButtons = [...currentButtons]
  }

  public reset(): void {
    this.prevButtons = []
    this.pressTimestamps.clear()
  }
}

export function createEmptyStatsData(): ActivityStatsData {
  return {
    version: 1,
    totalCaptures: 0,
    totalListenStarts: 0,
    totalListenDurationMs: 0,
    maxSingleListenDurationMs: 0,
    capturesWhileListening: 0,
    replaysWhileListening: 0,
    totalReplaysSaved: 0,
    appCounts: {},
    windowCounts: {},
    buttonCounts: {},
    hourlyCaptures: new Array(24).fill(0),
    dayOfWeekCaptures: new Array(7).fill(0),
    captureTimestamps: [],
    events: [],
    lastUpdatedAt: Date.now(),
  }
}

/**
 * Generates realistic seed activity data for initial dashboard experience.
 */
export function createSeedStatsData(): ActivityStatsData {
  const now = Date.now()
  const hourMs = 3600_000
  const minuteMs = 60_000

  // Seed hourly capture counts (peaking in the evening 19:00 - 23:00)
  const hourly = [
    2, 1, 0, 0, 0, 0, 0, 2, 5, 8, 12, 14,
    11, 9, 8, 15, 18, 22, 35, 48, 52, 38, 21, 8
  ]

  // Seed day of week (0=Sun..6=Sat)
  const dayOfWeek = [28, 16, 19, 22, 25, 38, 42]

  const timestamps: number[] = []
  // Generate timestamps for today and yesterday
  for (let i = 0; i < 128; i++) {
    const offset = (128 - i) * (7 * minuteMs) + Math.floor(Math.random() * (4 * minuteMs))
    timestamps.push(now - offset)
  }

  const events: ActivityEvent[] = [
    {
      id: `ev-seed-1`,
      type: 'screenshot',
      timestamp: now - 3 * minuteMs,
      titleZh: '截图成功 · 明日方舟：终末地',
      titleEn: 'Captured · Arknights: Endfield',
      description: 'Screenshot_Endfield_20261022_194512.jpg',
      meta: {
        appName: '明日方舟：终末地',
        windowTitle: '明日方舟：终末地 - 游戏画面',
        filePath: '~/Pictures/Shiin/明日方舟：终末地/Screenshot_Endfield_20261022_194512.jpg',
        format: 'jpg',
        ok: true,
      },
    },
    {
      id: `ev-seed-2`,
      type: 'button_press',
      timestamp: now - 4 * minuteMs,
      titleZh: '手柄按键触发 · A 键',
      titleEn: 'Gamepad Trigger · A Button',
      description: 'Xbox Wireless Controller · Button0 (A)',
      meta: {
        buttonKey: 'Button0',
        buttonName: 'A / ✕',
        gamepadName: 'Xbox Wireless Controller',
      },
    },
    {
      id: `ev-seed-3`,
      type: 'obs_replay',
      timestamp: now - 18 * minuteMs,
      titleZh: 'OBS 精彩瞬间回放已保存',
      titleEn: 'OBS Replay Buffer Saved',
      description: 'Replay_2026-10-22_19-30-00.mp4',
      meta: {
        ok: true,
      },
    },
    {
      id: `ev-seed-4`,
      type: 'screenshot',
      timestamp: now - 25 * minuteMs,
      titleZh: '截图成功 · Google Chrome',
      titleEn: 'Captured · Google Chrome',
      description: 'Screenshot_React_Grid_Layout_20261022.png',
      meta: {
        appName: 'Google Chrome',
        windowTitle: 'React Grid Layout - GitHub',
        filePath: '~/Pictures/Shiin/Chrome/Screenshot_React_Grid_Layout.png',
        format: 'png',
        ok: true,
      },
    },
    {
      id: `ev-seed-5`,
      type: 'listen_start',
      timestamp: now - 2 * hourMs - 36 * minuteMs,
      titleZh: '后台监听服务已激活',
      titleEn: 'Background Listener Started',
      description: '已就绪手柄与全局热键捕获',
    },
    {
      id: `ev-seed-6`,
      type: 'screenshot',
      timestamp: now - 42 * minuteMs,
      titleZh: '截图成功 · 终端 (Ghostty)',
      titleEn: 'Captured · Terminal (Ghostty)',
      description: 'Screenshot_Terminal_20261022.jpg',
      meta: {
        appName: 'Ghostty',
        windowTitle: 'shiin serve · dev',
        filePath: '~/Pictures/Shiin/Terminal/Screenshot_Terminal.jpg',
        format: 'jpg',
        ok: true,
      },
    },
  ]

  return {
    version: 1,
    totalCaptures: 190,
    totalListenStarts: 14,
    totalListenDurationMs: Math.round(2.6 * hourMs), // 2.6 hours
    maxSingleListenDurationMs: Math.round(1.4 * hourMs),
    capturesWhileListening: 142,
    replaysWhileListening: 6,
    totalReplaysSaved: 9,

    appCounts: {
      '明日方舟：终末地': { count: 82, lastSeen: now - 3 * minuteMs },
      'Google Chrome': { count: 31, lastSeen: now - 25 * minuteMs },
      'Ghostty': { count: 15, lastSeen: now - 42 * minuteMs },
      'Visual Studio Code': { count: 12, lastSeen: now - 3 * hourMs },
      'Discord': { count: 8, lastSeen: now - 5 * hourMs },
      'Steam': { count: 5, lastSeen: now - 8 * hourMs },
      '其他应用': { count: 37, lastSeen: now - 1 * hourMs },
    },

    windowCounts: {
      '明日方舟：终末地 - 游戏画面': { appName: '明日方舟：终末地', count: 82, lastSeen: now - 3 * minuteMs },
      'React Grid Layout - GitHub - Google Chrome': { appName: 'Google Chrome', count: 22, lastSeen: now - 25 * minuteMs },
      'shiin serve · dev - Ghostty': { appName: 'Ghostty', count: 15, lastSeen: now - 42 * minuteMs },
      'Shiin / Xaihi - Visual Studio Code': { appName: 'Visual Studio Code', count: 12, lastSeen: now - 3 * hourMs },
      'Bilibili 动态 - Google Chrome': { appName: 'Google Chrome', count: 9, lastSeen: now - 2 * hourMs },
    },

    buttonCounts: {
      Button0: 352, // A
      Button1: 146, // B
      Button2: 91,  // X
      Button3: 73,  // Y
      Button5: 58,  // RB
      Button4: 42,  // LB
      Button12: 34, // DpadUp
      Button13: 28, // DpadDown
      Button15: 25, // DpadRight
      Button14: 19, // DpadLeft
      Button9: 16,  // Start
      Button8: 12,  // Back
      Button10: 8,  // L3
      Button11: 7,  // R3
    },

    hourlyCaptures: hourly,
    dayOfWeekCaptures: dayOfWeek,
    captureTimestamps: timestamps,
    events,
    lastUpdatedAt: now,
  }
}

/**
 * Record a new screenshot event and update aggregates.
 */
export function recordScreenshot(
  data: ActivityStatsData,
  result: {
    filePath?: string | null
    appName?: string
    windowTitle?: string
    format?: string
    isListening?: boolean
  }
): ActivityStatsData {
  const now = Date.now()
  const date = new Date(now)
  const hour = date.getHours()
  const day = date.getDay()

  const next = { ...data }
  next.totalCaptures += 1
  if (result.isListening) {
    next.capturesWhileListening += 1
  }

  // Hourly and Day distribution
  const hourly = [...next.hourlyCaptures]
  hourly[hour] = (hourly[hour] || 0) + 1
  next.hourlyCaptures = hourly

  const dayOfWeek = [...next.dayOfWeekCaptures]
  dayOfWeek[day] = (dayOfWeek[day] || 0) + 1
  next.dayOfWeekCaptures = dayOfWeek

  // Timestamps (keep latest 1000)
  next.captureTimestamps = [...next.captureTimestamps, now].slice(-1000)

  // App count
  const rawAppName = result.appName?.trim() || '桌面 / 未知应用'
  const appCounts = { ...next.appCounts }
  appCounts[rawAppName] = {
    count: (appCounts[rawAppName]?.count || 0) + 1,
    lastSeen: now,
  }
  next.appCounts = appCounts

  // Window count
  const rawWinTitle = result.windowTitle?.trim() || rawAppName
  const windowCounts = { ...next.windowCounts }
  windowCounts[rawWinTitle] = {
    appName: rawAppName,
    count: (windowCounts[rawWinTitle]?.count || 0) + 1,
    lastSeen: now,
  }
  next.windowCounts = windowCounts

  // New Event
  const fileBasename = result.filePath?.split(/[\\/]/).pop() || '剪贴板'
  const newEvent: ActivityEvent = {
    id: `ev-${now}-${Math.random().toString(36).slice(2, 6)}`,
    type: 'screenshot',
    timestamp: now,
    titleZh: `截图成功 · ${rawAppName}`,
    titleEn: `Captured · ${rawAppName}`,
    description: fileBasename,
    meta: {
      appName: rawAppName,
      windowTitle: rawWinTitle,
      filePath: result.filePath || undefined,
      format: result.format,
      ok: true,
    },
  }

  next.events = [newEvent, ...next.events].slice(0, 200)
  next.lastUpdatedAt = now
  return next
}

/**
 * Record a button press edge.
 */
export function recordButtonPress(
  data: ActivityStatsData,
  buttonKey: string,
  buttonName: string,
  gamepadName?: string
): ActivityStatsData {
  const now = Date.now()
  const next = { ...data }
  const counts = { ...next.buttonCounts }
  counts[buttonKey] = (counts[buttonKey] || 0) + 1
  next.buttonCounts = counts

  // Append to recent events (throttle: don't flood if pressed within 500ms of same button)
  const lastEvent = next.events[0]
  const isSameRecent =
    lastEvent &&
    lastEvent.type === 'button_press' &&
    lastEvent.meta?.buttonKey === buttonKey &&
    now - lastEvent.timestamp < 1000

  if (!isSameRecent) {
    const newEvent: ActivityEvent = {
      id: `ev-btn-${now}-${buttonKey}`,
      type: 'button_press',
      timestamp: now,
      titleZh: `按键按下 · ${buttonName}`,
      titleEn: `Button Pressed · ${buttonName}`,
      description: gamepadName || '手柄控制器',
      meta: {
        buttonKey,
        buttonName,
        gamepadName,
      },
    }
    next.events = [newEvent, ...next.events].slice(0, 200)
  }

  next.lastUpdatedAt = now
  return next
}

/**
 * Record listening state toggle.
 */
export function recordListenToggle(
  data: ActivityStatsData,
  isListening: boolean,
  sessionDurationMs = 0
): ActivityStatsData {
  const now = Date.now()
  const next = { ...data }

  if (isListening) {
    next.totalListenStarts += 1
    const newEvent: ActivityEvent = {
      id: `ev-ls-start-${now}`,
      type: 'listen_start',
      timestamp: now,
      titleZh: '后台监听服务已开启',
      titleEn: 'Listener Activated',
      description: '手柄与快捷键进入全局捕获状态',
    }
    next.events = [newEvent, ...next.events].slice(0, 200)
  } else {
    if (sessionDurationMs > 0) {
      next.totalListenDurationMs += sessionDurationMs
      next.maxSingleListenDurationMs = Math.max(next.maxSingleListenDurationMs, sessionDurationMs)
    }
    const durationMin = Math.round(sessionDurationMs / 60_000)
    const newEvent: ActivityEvent = {
      id: `ev-ls-stop-${now}`,
      type: 'listen_stop',
      timestamp: now,
      titleZh: '后台监听服务已暂停',
      titleEn: 'Listener Paused',
      description: sessionDurationMs > 0 ? `本次持续监听约 ${durationMin} 分钟` : '监听释放',
      meta: {
        durationMs: sessionDurationMs,
      },
    }
    next.events = [newEvent, ...next.events].slice(0, 200)
  }

  next.lastUpdatedAt = now
  return next
}

/**
 * Record OBS replay buffer save.
 */
export function recordObsReplay(
  data: ActivityStatsData,
  ok: boolean,
  error?: string,
  isListening = false
): ActivityStatsData {
  const now = Date.now()
  const next = { ...data }
  if (ok) {
    next.totalReplaysSaved += 1
    if (isListening) {
      next.replaysWhileListening += 1
    }
  }

  const newEvent: ActivityEvent = {
    id: `ev-obs-${now}`,
    type: 'obs_replay',
    timestamp: now,
    titleZh: ok ? 'OBS 精彩回放缓冲已保存' : 'OBS 回放缓冲保存失败',
    titleEn: ok ? 'OBS Replay Buffer Saved' : 'OBS Replay Failed',
    description: error || '回放视频已成功导出',
    meta: {
      ok,
    },
  }

  next.events = [newEvent, ...next.events].slice(0, 200)
  next.lastUpdatedAt = now
  return next
}
