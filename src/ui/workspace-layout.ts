/**
 * Shiin Workspace Layout (Workbench surface)
 *
 * The workbench shares the analytics widget framework — ordered, resizable,
 * hideable widgets with persisted placement — but its grid is a 12-column
 * canvas whose rows keep their natural height. A widget's size therefore only
 * encodes its **column span** (`size` = the number of columns it occupies).
 *
 * Default spans reproduce the hand-tuned asymmetric bento (8/4 hero pair,
 * full-width overview, 7/5 pane pairs); editing simply re-arranges that.
 */

import {
  type PlacedWidget as BasePlacedWidget,
  type WidgetLayoutConfig as BaseWidgetLayoutConfig,
  type WidgetMetaBase,
  moveInList,
  normalizeWidgetLayout,
} from './widget-layout.js'

/** Column span on the 12-column workbench grid. */
export type WorkspaceWidgetSize = '3' | '4' | '5' | '6' | '7' | '8' | '9' | '12'

export type WorkspaceWidgetId =
  | 'ws_capture_hero'
  | 'ws_session'
  | 'ws_metric_strip'
  | 'ws_hub'
  | 'ws_capture'
  | 'ws_combos'
  | 'ws_listener'
  | 'ws_tester'

export interface WorkspaceWidgetMeta extends WidgetMetaBase<WorkspaceWidgetSize, WorkspaceWidgetId> {
  id: WorkspaceWidgetId
  category: 'hero' | 'strip' | 'panel' | 'hub'
}

export const WORKSPACE_COLUMNS = 12

export const WORKSPACE_WIDGET_REGISTRY: Record<WorkspaceWidgetId, WorkspaceWidgetMeta> = {
  ws_capture_hero: {
    id: 'ws_capture_hero',
    titleZh: '截图主舞台',
    titleEn: 'Capture stage',
    descriptionZh: '快门主舞台、实时管线状态与快捷动作',
    descriptionEn: 'Shutter stage, live pipeline status and quick actions',
    icon: 'camera',
    defaultSize: '8',
    supportedSizes: ['6', '8', '12'],
    category: 'hero',
  },
  ws_session: {
    id: 'ws_session',
    titleZh: '设备与管线',
    titleEn: 'Device & pipeline',
    descriptionZh: '当前输入通道、捕获目标与保存目录',
    descriptionEn: 'Active controller, capture target and destination folder',
    icon: 'gamepad',
    defaultSize: '4',
    supportedSizes: ['4', '5', '6', '7'],
    category: 'hero',
  },
  ws_metric_strip: {
    id: 'ws_metric_strip',
    titleZh: '管线速览',
    titleEn: 'Pipeline overview',
    descriptionZh: '目标模式、组合键数量、输出格式与监听状态四联速览',
    descriptionEn: 'Target mode, combo count, output format and listener state at a glance',
    icon: 'barChart',
    defaultSize: '12',
    supportedSizes: ['6', '12'],
    category: 'strip',
  },
  ws_hub: {
    id: 'ws_hub',
    titleZh: '捕获中枢',
    titleEn: 'Capture hub',
    descriptionZh: '跨应用捕获的待整理收件箱；需在设置中开启',
    descriptionEn: 'Cross-app capture inbox — enable it in settings first',
    icon: 'inbox',
    defaultSize: '12',
    supportedSizes: ['12'],
    category: 'hub',
  },
  ws_capture: {
    id: 'ws_capture',
    titleZh: '画面捕获与输出',
    titleEn: 'Capture & output',
    descriptionZh: '捕获目标、图像格式、质量与归档位置',
    descriptionEn: 'Capture source, image format, quality and destination folder',
    icon: 'appWindow',
    defaultSize: '7',
    supportedSizes: ['5', '6', '7', '8'],
    category: 'panel',
  },
  ws_combos: {
    id: 'ws_combos',
    titleZh: '触发组合',
    titleEn: 'Trigger combos',
    descriptionZh: '手柄组合键的识别、预设与抽象键位舞台',
    descriptionEn: 'Gamepad chord detection, presets and the abstract key stage',
    icon: 'target',
    defaultSize: '5',
    supportedSizes: ['4', '5', '6', '7'],
    category: 'panel',
  },
  ws_listener: {
    id: 'ws_listener',
    titleZh: '监听与自动化',
    titleEn: 'Listener & automation',
    descriptionZh: '后台监听、长按回放、按游戏归档与键盘辅助键',
    descriptionEn: 'Background listening, hold-to-replay, per-game filing and hotkey',
    icon: 'wave',
    defaultSize: '7',
    supportedSizes: ['5', '6', '7', '8'],
    category: 'panel',
  },
  ws_tester: {
    id: 'ws_tester',
    titleZh: '实时测试器',
    titleEn: 'Live tester',
    descriptionZh: '手柄实时信号、抽象外观预览与按键拾取',
    descriptionEn: 'Live gamepad telemetry, expressive skins and button picking',
    icon: 'gamepad',
    defaultSize: '5',
    supportedSizes: ['4', '5', '6', '7'],
    category: 'panel',
  },
}

export type WorkspacePlacedWidget = BasePlacedWidget<WorkspaceWidgetSize, WorkspaceWidgetId>

export type WorkspaceLayoutConfig = BaseWidgetLayoutConfig<WorkspaceWidgetSize, WorkspaceWidgetId>

export function getDefaultWorkspaceLayout(): WorkspaceLayoutConfig {
  return {
    version: 1,
    gapPx: 16,
    widgets: [
      { id: 'ws_capture_hero', size: '8', visible: true },
      { id: 'ws_session', size: '4', visible: true },
      { id: 'ws_metric_strip', size: '12', visible: true },
      { id: 'ws_hub', size: '12', visible: true },
      { id: 'ws_capture', size: '7', visible: true },
      { id: 'ws_combos', size: '5', visible: true },
      { id: 'ws_listener', size: '7', visible: true },
      { id: 'ws_tester', size: '5', visible: true },
    ],
  }
}

export function normalizeWorkspaceLayout(input: unknown): WorkspaceLayoutConfig {
  return normalizeWidgetLayout(input, WORKSPACE_WIDGET_REGISTRY, getDefaultWorkspaceLayout())
}

export function moveWorkspaceWidget(
  widgets: WorkspacePlacedWidget[],
  fromIndex: number,
  toIndex: number
): WorkspacePlacedWidget[] {
  return moveInList(widgets, fromIndex, toIndex)
}

/** Column span (1-based) for a stored size token. */
export function workspaceSpan(size: WorkspaceWidgetSize | string): number {
  const parsed = Number(size)
  if (!Number.isFinite(parsed) || parsed <= 0) return WORKSPACE_COLUMNS
  return Math.min(Math.max(Math.round(parsed), 1), WORKSPACE_COLUMNS)
}

/**
 * Tablet span (600px – 1199px): the workbench collapses to a two-column
 * rhythm, so very wide cards stay full width while the 7/5 panes pair up as
 * half columns. `span <= 4` keeps the companion card full width because its
 * pair partner is already full width.
 */
export function workspaceTabletSpan(span: number): number {
  if (span >= 8 || span <= 4) return WORKSPACE_COLUMNS
  return 6
}
