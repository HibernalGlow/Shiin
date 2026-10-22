/**
 * Shiin Activity Dashboard Layout & Grid System
 *
 * Implements discrete size constraints (1x1, 2x1, 2x2, 3x2, 4x2),
 * layout reordering, widget visibility management, and persistence serialization.
 */

export type WidgetSize = '1x1' | '2x1' | '2x2' | '3x2' | '4x2'

export type WidgetId =
  | 'metric_today_captures'
  | 'metric_listen_duration'
  | 'metric_top_app'
  | 'metric_top_button'
  | 'top_apps'
  | 'gamepad_heatmap'
  | 'capture_heatmap'
  | 'listener_stats'
  | 'activity_stream'

export interface WidgetMeta {
  id: WidgetId
  titleZh: string
  titleEn: string
  descriptionZh: string
  descriptionEn: string
  icon: string
  defaultSize: WidgetSize
  supportedSizes: WidgetSize[]
  category: 'metric' | 'detail' | 'stream'
}

export const WIDGET_REGISTRY: Record<WidgetId, WidgetMeta> = {
  metric_today_captures: {
    id: 'metric_today_captures',
    titleZh: '今日截图',
    titleEn: 'Today Captures',
    descriptionZh: '今日已完成的截图数量与目标概览',
    descriptionEn: 'Number of screenshots captured today',
    icon: 'camera',
    defaultSize: '1x1',
    supportedSizes: ['1x1', '2x1'],
    category: 'metric',
  },
  metric_listen_duration: {
    id: 'metric_listen_duration',
    titleZh: '监听时长',
    titleEn: 'Listen Duration',
    descriptionZh: '后台监听在线时长与会话动态',
    descriptionEn: 'Background listener uptime and sessions',
    icon: 'clock',
    defaultSize: '1x1',
    supportedSizes: ['1x1', '2x1'],
    category: 'metric',
  },
  metric_top_app: {
    id: 'metric_top_app',
    titleZh: '主力应用',
    titleEn: 'Top Active App',
    descriptionZh: '截图频率最高的游戏或活动窗口',
    descriptionEn: 'Most frequently captured game or window',
    icon: 'target',
    defaultSize: '1x1',
    supportedSizes: ['1x1', '2x1'],
    category: 'metric',
  },
  metric_top_button: {
    id: 'metric_top_button',
    titleZh: '最常按键',
    titleEn: 'Top Button',
    descriptionZh: '手柄按下频次最高的动作按键',
    descriptionEn: 'Most triggered gamepad button',
    icon: 'gamepad',
    defaultSize: '1x1',
    supportedSizes: ['1x1', '2x1'],
    category: 'metric',
  },
  top_apps: {
    id: 'top_apps',
    titleZh: '最常截图的应用 / 窗口',
    titleEn: 'Top Captured Apps / Windows',
    descriptionZh: '前台活动应用与具体窗口的截图次数排名与占比',
    descriptionEn: 'Ranking and proportions of captured foreground applications and windows',
    icon: 'appWindow',
    defaultSize: '2x2',
    supportedSizes: ['2x2', '3x2', '4x2'],
    category: 'detail',
  },
  gamepad_heatmap: {
    id: 'gamepad_heatmap',
    titleZh: '手柄按键热度图',
    titleEn: 'Gamepad Button Heatmap',
    descriptionZh: 'A/B/X/Y/肩键/方向键按压热度可视化与统计排名',
    descriptionEn: 'Visual heat distribution and counts of gamepad button presses',
    icon: 'flame',
    defaultSize: '2x2',
    supportedSizes: ['2x2', '3x2', '4x2'],
    category: 'detail',
  },
  capture_heatmap: {
    id: 'capture_heatmap',
    titleZh: '截图活跃时段',
    titleEn: 'Capture Activity Heatmap',
    descriptionZh: '按小时与星期统计截图频率，并分析最长连续截图活动时段',
    descriptionEn: 'Hourly and day-of-week capture frequencies and longest streak analysis',
    icon: 'barChart',
    defaultSize: '2x2',
    supportedSizes: ['2x1', '2x2', '3x2', '4x2'],
    category: 'detail',
  },
  listener_stats: {
    id: 'listener_stats',
    titleZh: '监听活动统计',
    titleEn: 'Listener Activity Stats',
    descriptionZh: '监听启动次数、累计时长、单次最长时长与触发记录',
    descriptionEn: 'Listener start counts, duration metrics, and triggers during sessions',
    icon: 'activity',
    defaultSize: '2x2',
    supportedSizes: ['2x2', '3x2', '4x2'],
    category: 'detail',
  },
  activity_stream: {
    id: 'activity_stream',
    titleZh: '实时活动流',
    titleEn: 'Live Activity Stream',
    descriptionZh: '监听启停、截图成功、手柄按键等操作的时间流，支持筛选与调试',
    descriptionEn: 'Timeline of listener toggles, captures, button inputs, and OBS triggers',
    icon: 'list',
    defaultSize: '4x2',
    supportedSizes: ['2x2', '3x2', '4x2'],
    category: 'stream',
  },
}

export interface PlacedWidget {
  id: WidgetId
  size: WidgetSize
  visible: boolean
}

export interface DashboardLayoutConfig {
  version: 1
  widgets: PlacedWidget[]
  gapPx: number
}

export function getDefaultDashboardLayout(): DashboardLayoutConfig {
  return {
    version: 1,
    gapPx: 16,
    widgets: [
      { id: 'metric_today_captures', size: '1x1', visible: true },
      { id: 'metric_listen_duration', size: '1x1', visible: true },
      { id: 'metric_top_app', size: '1x1', visible: true },
      { id: 'metric_top_button', size: '1x1', visible: true },
      { id: 'top_apps', size: '2x2', visible: true },
      { id: 'gamepad_heatmap', size: '2x2', visible: true },
      { id: 'capture_heatmap', size: '2x2', visible: true },
      { id: 'listener_stats', size: '2x2', visible: true },
      { id: 'activity_stream', size: '4x2', visible: true },
    ],
  }
}

/**
 * Validates and migrates stored layout configurations.
 */
export function normalizeDashboardLayout(input: unknown): DashboardLayoutConfig {
  const fallback = getDefaultDashboardLayout()
  if (!input || typeof input !== 'object') return fallback

  const candidate = input as Partial<DashboardLayoutConfig>
  if (!Array.isArray(candidate.widgets)) return fallback

  const knownIds = new Set<string>(Object.keys(WIDGET_REGISTRY))
  const seenIds = new Set<string>()
  const validWidgets: PlacedWidget[] = []

  for (const item of candidate.widgets) {
    if (
      item &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      knownIds.has(item.id) &&
      !seenIds.has(item.id)
    ) {
      seenIds.add(item.id)
      const meta = WIDGET_REGISTRY[item.id as WidgetId]
      const validSize = meta.supportedSizes.includes(item.size as WidgetSize)
        ? (item.size as WidgetSize)
        : meta.defaultSize
      validWidgets.push({
        id: item.id as WidgetId,
        size: validSize,
        visible: item.visible !== false,
      })
    }
  }

  // Ensure any missing widgets are included at the end
  for (const defaultItem of fallback.widgets) {
    if (!seenIds.has(defaultItem.id)) {
      validWidgets.push({ ...defaultItem })
    }
  }

  return {
    version: 1,
    gapPx: 16,
    widgets: validWidgets,
  }
}

/**
 * Move a widget within the layout array.
 */
export function moveWidget(
  widgets: PlacedWidget[],
  fromIndex: number,
  toIndex: number
): PlacedWidget[] {
  if (
    fromIndex < 0 ||
    fromIndex >= widgets.length ||
    toIndex < 0 ||
    toIndex >= widgets.length ||
    fromIndex === toIndex
  ) {
    return widgets
  }
  const next = [...widgets]
  const [removed] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, removed)
  return next
}
