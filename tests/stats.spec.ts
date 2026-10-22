import { describe, it, expect } from 'vitest'
import {
  calculateConsecutiveStreaks,
  GamepadEdgeDetector,
  createEmptyStatsData,
  createSeedStatsData,
  recordScreenshot,
  recordButtonPress,
  recordListenToggle,
  recordObsReplay,
} from '../src/core/stats.js'
import {
  getDefaultDashboardLayout,
  normalizeDashboardLayout,
  moveWidget,
  WIDGET_REGISTRY,
} from '../src/ui/dashboard-layout.js'

describe('Activity & Statistics Engine', () => {
  describe('calculateConsecutiveStreaks', () => {
    it('handles empty and single timestamp inputs', () => {
      expect(calculateConsecutiveStreaks([])).toEqual({
        sessionsCount: 0,
        maxDurationMs: 0,
        longestSession: null,
        currentSessionStreak: 0,
      })

      const now = 1_000_000
      const single = calculateConsecutiveStreaks([now])
      expect(single.sessionsCount).toBe(1)
      expect(single.maxDurationMs).toBe(0)
      expect(single.longestSession?.count).toBe(1)
    })

    it('groups timestamps within 5-minute threshold into consecutive streaks', () => {
      const base = 1_000_000
      // 3 shots within 1 minute of each other
      const timestamps = [base, base + 30_000, base + 75_000]
      const result = calculateConsecutiveStreaks(timestamps, 5 * 60 * 1000)

      expect(result.sessionsCount).toBe(1)
      expect(result.maxDurationMs).toBe(75_000)
      expect(result.longestSession?.count).toBe(3)
    })

    it('splits sessions when gap exceeds threshold', () => {
      const base = 1_000_000
      const tenMinutes = 10 * 60 * 1000
      // Session 1: 2 shots across 60 seconds
      // Gap: 10 minutes
      // Session 2: 3 shots across 120 seconds
      const timestamps = [
        base,
        base + 60_000,
        base + 60_000 + tenMinutes,
        base + 120_000 + tenMinutes,
        base + 180_000 + tenMinutes,
      ]

      const result = calculateConsecutiveStreaks(timestamps, 5 * 60 * 1000)
      expect(result.sessionsCount).toBe(2)
      expect(result.longestSession?.count).toBe(3)
      expect(result.longestSession?.durationMs).toBe(120_000)
    })
  })

  describe('GamepadEdgeDetector', () => {
    it('detects rising edge and avoids duplicate counts while holding', () => {
      const detector = new GamepadEdgeDetector()
      const presses: string[] = []
      const releases: string[] = []

      const onPress = (_idx: number, key: string) => presses.push(key)
      const onRelease = (_idx: number, key: string) => releases.push(key)

      // Poll 1: Initial state - no buttons pressed
      detector.processButtons([false, false, false], onPress, onRelease)
      expect(presses).toHaveLength(0)

      // Poll 2: User presses A (Button0)
      detector.processButtons([true, false, false], onPress, onRelease)
      expect(presses).toEqual(['Button0'])

      // Poll 3, 4, 5: User continues holding A (Button0) down
      detector.processButtons([true, false, false], onPress, onRelease)
      detector.processButtons([true, false, false], onPress, onRelease)
      detector.processButtons([true, false, false], onPress, onRelease)
      // Must NOT re-trigger!
      expect(presses).toEqual(['Button0'])

      // Poll 6: User releases A
      detector.processButtons([false, false, false], onPress, onRelease)
      expect(releases).toEqual(['Button0'])

      // Poll 7: User presses B (Button1)
      detector.processButtons([false, true, false], onPress, onRelease)
      expect(presses).toEqual(['Button0', 'Button1'])
    })
  })

  describe('Event Recording & Aggregations', () => {
    it('records screenshots with app and window titles and hourly distribution', () => {
      let stats = createEmptyStatsData()
      expect(stats.totalCaptures).toBe(0)

      stats = recordScreenshot(stats, {
        filePath: '/test/screen1.jpg',
        appName: '明日方舟：终末地',
        windowTitle: '明日方舟：终末地 - 游戏画面',
        format: 'jpg',
        isListening: true,
      })

      expect(stats.totalCaptures).toBe(1)
      expect(stats.capturesWhileListening).toBe(1)
      expect(stats.appCounts['明日方舟：终末地'].count).toBe(1)
      expect(stats.windowCounts['明日方舟：终末地 - 游戏画面'].count).toBe(1)
      expect(stats.events).toHaveLength(1)
      expect(stats.events[0].type).toBe('screenshot')
      expect(stats.events[0].meta?.appName).toBe('明日方舟：终末地')

      // Record another shot for the same app
      stats = recordScreenshot(stats, {
        filePath: '/test/screen2.jpg',
        appName: '明日方舟：终末地',
        windowTitle: '明日方舟：终末地 - 战斗画面',
        format: 'jpg',
        isListening: false,
      })

      expect(stats.totalCaptures).toBe(2)
      expect(stats.capturesWhileListening).toBe(1)
      expect(stats.appCounts['明日方舟：终末地'].count).toBe(2)
      expect(stats.windowCounts['明日方舟：终末地 - 战斗画面'].count).toBe(1)
    })

    it('records listen toggle and accumulates duration', () => {
      let stats = createEmptyStatsData()

      // Start listening
      stats = recordListenToggle(stats, true)
      expect(stats.totalListenStarts).toBe(1)
      expect(stats.events[0].type).toBe('listen_start')

      // Stop listening after 30 minutes
      const thirtyMinutes = 30 * 60 * 1000
      stats = recordListenToggle(stats, false, thirtyMinutes)
      expect(stats.totalListenDurationMs).toBe(thirtyMinutes)
      expect(stats.maxSingleListenDurationMs).toBe(thirtyMinutes)
      expect(stats.events[0].type).toBe('listen_stop')
    })

    it('records button presses and OBS replays', () => {
      let stats = createEmptyStatsData()

      stats = recordButtonPress(stats, 'Button0', 'A 键', 'Xbox Controller')
      expect(stats.buttonCounts['Button0']).toBe(1)

      stats = recordButtonPress(stats, 'Button0', 'A 键', 'Xbox Controller')
      expect(stats.buttonCounts['Button0']).toBe(2)

      stats = recordObsReplay(stats, true, undefined, true)
      expect(stats.totalReplaysSaved).toBe(1)
      expect(stats.replaysWhileListening).toBe(1)
    })

    it('creates rich seed data for initial presentation', () => {
      const seed = createSeedStatsData()
      expect(seed.totalCaptures).toBeGreaterThan(100)
      expect(seed.appCounts['明日方舟：终末地'].count).toBe(82)
      expect(seed.buttonCounts['Button0']).toBe(352)
      expect(seed.events.length).toBeGreaterThan(0)
    })
  })

  describe('Dashboard Layout Configuration', () => {
    it('provides standard default layout with discrete sizes', () => {
      const layout = getDefaultDashboardLayout()
      expect(layout.widgets.length).toBeGreaterThanOrEqual(8)
      expect(layout.widgets.find((w) => w.id === 'top_apps')?.size).toBe('2x2')
      expect(layout.widgets.find((w) => w.id === 'gamepad_heatmap')?.size).toBe('2x2')
      expect(layout.widgets.find((w) => w.id === 'metric_today_captures')?.size).toBe('1x1')
    })

    it('reorders widgets cleanly with moveWidget', () => {
      const layout = getDefaultDashboardLayout()
      const firstId = layout.widgets[0].id
      const secondId = layout.widgets[1].id

      const reordered = moveWidget(layout.widgets, 0, 1)
      expect(reordered[0].id).toBe(secondId)
      expect(reordered[1].id).toBe(firstId)
    })

    it('normalizes stored layouts and fills missing widgets', () => {
      const partial = {
        version: 1,
        widgets: [{ id: 'top_apps', size: '3x2', visible: true }],
      }

      const normalized = normalizeDashboardLayout(partial)
      expect(normalized.widgets.find((w) => w.id === 'top_apps')?.size).toBe('3x2')
      // All other widgets are filled in
      expect(normalized.widgets.length).toBe(Object.keys(WIDGET_REGISTRY).length)
    })
  })
})
