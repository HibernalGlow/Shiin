/**
 * `gd`（引导式问答）这一条腿的业务表：一次截图需要哪些参数、缺省值从哪来、预览说些什么。
 *
 * 与 Xaihi 的做法一致：字段表与渲染器无关，@clack 只负责把它们问出来。
 * TUI 走的是自绘工作台（`tui/`），但它读的是同一份 `ShiinConfigPatch` 口径。
 */

import { isDirectoryWritable } from '../../core/config.js'
import {
  CaptureTargetTypeEnum,
  ScreenShotSaveWayEnum,
  type CaptureWindowInfo,
  type ScreenshotConfig,
  type WindowCaptureMode,
} from '../../core/types.js'
import type {
  InteractionField,
  InteractionValue,
  InteractionValues,
  TerminalInteractionSchema,
  TerminalViewTable,
} from './interaction.js'
import type { Translator } from './i18n.js'

export type CaptureTarget = 'screen' | 'window'
export type ImageFormat = 'jpg' | 'png'

export interface ShiinPlan {
  target: CaptureTarget
  /** 窗口目标：指定某一扇窗口，还是每次触发时取当前聚焦窗口。 */
  windowMode: WindowCaptureMode
  /** `windowMode === 'specified'` 时使用的窗口 id（字符串与配置存储一致）。 */
  windowId: string
  saveWay: ScreenShotSaveWayEnum
  format: ImageFormat
  path: string
}

export interface ShiinContext {
  config: ScreenshotConfig
  deviceCount: number
  screenCount: number
  windowCount: number
  windows: CaptureWindowInfo[]
  activeDeviceName?: string
  obsConnected: boolean
  listening: boolean
}

export interface ShiinActionResult {
  success: boolean
  message: string
  lines?: string[]
  table?: TerminalViewTable
}

/** 计划 → 配置补丁：只在内存里生效，除非调用方显式 `saveConfig()`。 */
export function planToPatch(plan: ShiinPlan): Partial<ScreenshotConfig> {
  return {
    captureTargetType: plan.target === 'window' ? CaptureTargetTypeEnum.Window : CaptureTargetTypeEnum.Screen,
    windowCaptureMode: plan.windowMode,
    ...(plan.target === 'window' && plan.windowMode === 'specified' && plan.windowId
      ? { windowSourceId: plan.windowId }
      : {}),
    screenShotSaveWay: plan.saveWay,
    imageFormat: plan.format,
    path: plan.path,
  }
}

export function planFromConfig(config: ScreenshotConfig, overridePath?: string): ShiinPlan {
  return {
    target: config.captureTargetType === CaptureTargetTypeEnum.Window ? 'window' : 'screen',
    windowMode: config.windowCaptureMode === 'specified' ? 'specified' : 'focused',
    windowId: config.windowSourceId === undefined || config.windowSourceId === null ? '' : String(config.windowSourceId),
    saveWay: config.screenShotSaveWay ?? ScreenShotSaveWayEnum.FileOnly,
    format: config.imageFormat === 'png' ? 'png' : 'jpg',
    path: overridePath ?? config.path ?? '',
  }
}

export function createCaptureSchema(context: ShiinContext, t: Translator): TerminalInteractionSchema<ShiinPlan, ShiinActionResult> {
  const plan = planFromConfig(context.config)
  const writesFile = (values: Readonly<InteractionValues>) => values.saveWay !== ScreenShotSaveWayEnum.CilpboardOnly

  const windowOptions = context.windows.map((window) => ({
    value: String(window.id),
    label: window.ownerName ? `${window.ownerName} - ${window.title}` : window.title,
  }))

  const fields: InteractionField[] = [
    {
      id: 'target',
      label: t('target'),
      kind: 'select',
      role: 'action',
      options: [
        { value: 'screen', label: t('targetScreen'), hint: `${context.screenCount}` },
        { value: 'window', label: t('targetWindow'), hint: `${context.windowCount}`, disabled: context.windowCount === 0 },
      ],
      validate: (value) => (value === 'screen' || value === 'window' ? null : t('invalidValue')),
    },
    {
      id: 'windowMode',
      label: t('windowMode'),
      kind: 'select',
      options: [
        { value: 'focused', label: t('windowFocused'), hint: t('windowFocusedHint') },
        { value: 'specified', label: t('windowSpecified'), hint: t('windowSpecifiedHint') },
      ],
      visibleWhen: (values) => values.target === 'window',
      validate: (value) => (value === 'focused' || value === 'specified' ? null : t('invalidValue')),
    },
    {
      id: 'windowId',
      label: t('windowSource'),
      kind: 'select',
      options: windowOptions.length > 0 ? windowOptions : [{ value: '', label: t('noWindows') }],
      visibleWhen: (values) => values.target === 'window' && values.windowMode === 'specified',
      validate: (value, values) => {
        if (values.target !== 'window' || values.windowMode !== 'specified') return null
        return String(value ?? '').trim() ? null : t('windowNone')
      },
    },
    {
      id: 'saveWay',
      label: t('saveWay'),
      kind: 'select',
      options: [
        { value: ScreenShotSaveWayEnum.FileOnly, label: t('saveFile') },
        { value: ScreenShotSaveWayEnum.CilpboardOnly, label: t('saveClipboard') },
        { value: ScreenShotSaveWayEnum.FileAndCilpboard, label: t('saveBoth') },
      ],
    },
    {
      id: 'format',
      label: t('format'),
      kind: 'select',
      options: [
        { value: 'jpg', label: t('formatJpg') },
        { value: 'png', label: t('formatPng') },
      ],
      visibleWhen: writesFile,
    },
    {
      id: 'path',
      label: t('path'),
      kind: 'text',
      description: t('fieldPathHint'),
      placeholder: plan.path,
      visibleWhen: writesFile,
      validate: (value, values) => {
        if (!writesFile(values)) return null
        const declared = String(value ?? '').trim()
        if (!declared) return null
        return isDirectoryWritable(declared) ? null : `${t('invalidValue')}: ${declared}`
      },
    },
  ]

  return {
    id: 'shiin.capture',
    title: t('captureTitle'),
    description: t('fieldActionHint'),
    initialValues: {
      target: plan.target,
      windowMode: plan.windowMode,
      windowId: plan.windowId || windowOptions[0]?.value || '',
      saveWay: plan.saveWay,
      format: plan.format,
      path: plan.path,
    },
    fields,
    view: {
      sections: [
        { id: 'target', title: t('target'), fieldIds: ['target', 'windowMode', 'windowId'] },
        { id: 'output', title: t('saveWay'), fieldIds: ['saveWay', 'format', 'path'] },
      ],
      dashboard: {
        title: t('status'),
        display: (values) => ({
          primary: values.target === 'window' ? targetText(values, t) : t('targetScreen'),
          secondary: context.activeDeviceName || t('noDevices'),
          metrics: [
            { label: t('saveWay'), value: saveWayLabel(values.saveWay, t) },
            { label: t('format'), value: String(values.format ?? plan.format).toUpperCase() },
            {
              label: t('listeningStatus'),
              value: context.listening ? t('connected') : t('disconnected'),
            },
          ],
        }),
      },
    },
    toPlan: (values) => ({
      target: values.target === 'window' ? 'window' : 'screen',
      windowMode: values.windowMode === 'specified' ? 'specified' : 'focused',
      windowId: String(values.windowId ?? '').trim(),
      saveWay: values.saveWay as ScreenShotSaveWayEnum,
      format: values.format === 'png' ? 'png' : 'jpg',
      path: String(values.path ?? '').trim(),
    }),
    validate: (values, planned) => {
      if (planned.target === 'window' && planned.windowMode === 'specified' && !planned.windowId) {
        return t('windowNone')
      }
      if (planned.saveWay === ScreenShotSaveWayEnum.CilpboardOnly) return null
      if (!planned.path) return null
      return isDirectoryWritable(planned.path) ? null : `${t('invalidValue')}: ${planned.path}`
    },
    preview: (planned) => previewPlan(planned, context, t),
    isDangerous: () => false,
    result: (result) => result,
  }
}

/**
 * `--window` 的取值：`focused` / `focus` / `active` 是“跟随当前聚焦窗口”的哨兵，
 * 其余一律当窗口 id。窗口 id 是数字，所以不会和哨兵撞车。
 */
export function parseWindowSourceFlag(raw: string): { mode: WindowCaptureMode; id: string } {
  const value = raw.trim()
  const normalized = value.toLowerCase()
  if (normalized === 'focused' || normalized === 'focus' || normalized === 'active') {
    return { mode: 'focused', id: '' }
  }
  return { mode: 'specified', id: value }
}

export function targetText(values: Readonly<InteractionValues>, t: Translator): string {
  if (values.target !== 'window') return t('targetScreen')
  return values.windowMode === 'specified' ? t('windowSpecified') : t('windowFocused')
}

export function previewPlan(plan: ShiinPlan, context: ShiinContext, t: Translator): string[] {
  const lines = [
    `${t('target')}: ${plan.target === 'window' ? t('targetWindow') : t('targetScreen')}`,
  ]
  if (plan.target === 'window') {
    const pinned = plan.windowId
      ? context.windows.find((window) => String(window.id) === plan.windowId)
      : undefined
    lines.push(
      plan.windowMode === 'specified'
        ? `${t('windowMode')}: ${t('windowSpecified')} · ${pinned ? pinned.title : plan.windowId || t('windowNone')}`
        : `${t('windowMode')}: ${t('windowFocused')} (${t('windowFocusedHint')})`,
    )
  }
  lines.push(`${t('saveWay')}: ${saveWayLabel(plan.saveWay, t)}`)
  if (plan.saveWay !== ScreenShotSaveWayEnum.CilpboardOnly) {
    lines.push(`${t('format')}: ${plan.format.toUpperCase()}`)
    lines.push(`${t('path')}: ${plan.path || t('fieldPathHint')}`)
  }
  lines.push(`${t('comboKeys')}: ${context.config.comboKeys?.length ? context.config.comboKeys.join(' + ') : t('comboUnset')}`)
  lines.push(`${t('obsStatus')}: ${context.obsConnected ? t('connected') : t('disconnected')}`)
  return lines
}

export function saveWayLabel(value: InteractionValue | undefined, t: Translator): string {
  if (value === ScreenShotSaveWayEnum.CilpboardOnly) return t('saveClipboard')
  if (value === ScreenShotSaveWayEnum.FileAndCilpboard) return t('saveBoth')
  return t('saveFile')
}
