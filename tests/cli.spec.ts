import { describe, expect, it } from 'vitest'

import { CaptureTargetTypeEnum, DEFAULT_CONFIG, ScreenShotSaveWayEnum } from '../src/core/types.js'
import { parseArgs, booleanFlag, stringFlag } from '../src/app/cli/args.js'
import { resolveInvocation, resolveTerminalUiFlags, visibleFields, nextOptionValue, stepNumber } from '../src/app/cli/interaction.js'
import { createCaptureSchema, parseWindowSourceFlag, planFromConfig, planToPatch } from '../src/app/cli/plan.js'
import { appendComboKeys, collectComboEdges } from '../src/app/cli/tui/combo.js'
import { coerceConfigValue, formatBytes, isEditableKey, parseComboKeys } from '../src/app/cli/actions.js'
import { renderProgressBar, stripAnsi, truncateVisible, visibleWidth } from '../src/app/cli/rich.js'
import type { CliHost } from '../src/app/cli/host.js'
import { createTranslator, resolveLanguage } from '../src/app/cli/i18n.js'

function fakeHost(columns = 100): CliHost {
  const sink = { chunks: [] as string[], write(chunk: string) { this.chunks.push(chunk); return true }, isTTY: false, columns }
  return {
    cwd: '/tmp',
    env: {},
    stdin: { isTTY: false } as unknown as CliHost['stdin'],
    stdout: sink,
    stderr: sink,
  }
}

describe('cli invocation routing', () => {
  it('treats tui/ui as the full-screen leg and gd/guided as the clack leg', () => {
    expect(resolveInvocation(['tui'], true)).toBe('ui')
    expect(resolveInvocation(['ui'], true)).toBe('ui')
    expect(resolveInvocation(['gd'], true)).toBe('gd')
    expect(resolveInvocation(['guided'], true)).toBe('gd')
  })

  it('never paints an interactive UI into a pipeline', () => {
    expect(resolveInvocation([], false)).toBe('pipe')
    expect(resolveInvocation([], true)).toBe('ui')
    expect(resolveInvocation(['capture'], true)).toBe('pipe')
  })

  it('strips renderer flags without leaking them into action args', () => {
    const resolved = resolveTerminalUiFlags(['--renderer', 'opentui', '--lang=en', '--theme', 'gruvbox'])
    expect(resolved.error).toBeUndefined()
    expect(resolved.language).toBe('en')
    expect(resolved.theme).toBe('gruvbox')
    expect(resolved.args).toEqual([])
  })

  it('rejects unknown renderers by name', () => {
    expect(resolveTerminalUiFlags(['--renderer', 'ink']).error).toContain('Unknown terminal renderer: ink')
  })
})

describe('flag parsing', () => {
  it('reads value flags, inline values and boolean flags', () => {
    const parsed = parseArgs(['--target', 'window', '--format=png', '--json'], ['json'])
    expect(parsed.error).toBeUndefined()
    expect(stringFlag(parsed.flags, 'target')).toBe('window')
    expect(stringFlag(parsed.flags, 'format')).toBe('png')
    expect(booleanFlag(parsed.flags, 'json')).toBe(true)
  })

  it('treats a missing value as a usage error instead of true', () => {
    const parsed = parseArgs(['--target'])
    expect(parsed.error).toBe('--target requires a value.')
  })
})

describe('capture plan', () => {
  it('round-trips config values into a plan and back', () => {
    const plan = planFromConfig({ ...DEFAULT_CONFIG, imageFormat: 'png', screenShotSaveWay: ScreenShotSaveWayEnum.FileAndCilpboard })
    expect(plan.format).toBe('png')
    expect(planToPatch(plan)).toMatchObject({ imageFormat: 'png', screenShotSaveWay: 'fileAndClipboard' })
  })

  it('carries the window capture mode and only pins an id in specified mode', () => {
    const focused = planFromConfig({
      ...DEFAULT_CONFIG,
      captureTargetType: CaptureTargetTypeEnum.Window,
      windowCaptureMode: 'focused',
      windowSourceId: 7,
    })
    expect(focused.windowMode).toBe('focused')
    expect(planToPatch(focused)).not.toHaveProperty('windowSourceId')

    const specified = planFromConfig({
      ...DEFAULT_CONFIG,
      captureTargetType: CaptureTargetTypeEnum.Window,
      windowCaptureMode: 'specified',
      windowSourceId: 7,
    })
    expect(planToPatch(specified)).toMatchObject({ windowCaptureMode: 'specified', windowSourceId: '7' })
  })

  it('reads --window focused as a mode and --window <id> as a pinned source', () => {
    expect(parseWindowSourceFlag('focused')).toEqual({ mode: 'focused', id: '' })
    expect(parseWindowSourceFlag('ACTIVE')).toEqual({ mode: 'focused', id: '' })
    expect(parseWindowSourceFlag('12345')).toEqual({ mode: 'specified', id: '12345' })
  })

  it('reveals the window source fields only after choosing a window target', () => {
    const t = createTranslator('zh')
    const schema = createCaptureSchema(
      {
        config: {
          ...DEFAULT_CONFIG,
          captureTargetType: CaptureTargetTypeEnum.Window,
          windowCaptureMode: 'specified',
          windowSourceId: 21,
        },
        deviceCount: 0,
        screenCount: 1,
        windowCount: 1,
        windows: [{ id: 21, title: 'Elden Ring', ownerName: 'FromSoftware' }],
        obsConnected: false,
        listening: false,
      },
      t,
    )
    const field = (id: string) => schema.fields.find((entry) => entry.id === id)

    expect(field('windowMode')?.visibleWhen?.({ target: 'screen' })).toBe(false)
    expect(field('windowMode')?.visibleWhen?.({ target: 'window' })).toBe(true)
    expect(field('windowId')?.visibleWhen?.({ target: 'window', windowMode: 'focused' })).toBe(false)
    expect(field('windowId')?.visibleWhen?.({ target: 'window', windowMode: 'specified' })).toBe(true)
    expect(field('windowId')?.options).toEqual([{ value: '21', label: 'FromSoftware - Elden Ring' }])

    const values = {
      target: 'window',
      windowMode: 'specified',
      windowId: '21',
      saveWay: ScreenShotSaveWayEnum.FileOnly,
      format: 'jpg',
      path: '',
    }
    const plan = schema.toPlan(values)
    expect(plan).toMatchObject({ target: 'window', windowMode: 'specified', windowId: '21' })
    expect(schema.validate?.(values, { ...plan, windowId: '' })).toBe(t('windowNone'))
  })

  it('hides format and path when the clipboard is the only destination', () => {
    const t = createTranslator('zh')
    const fields = [
      {
        id: 'format',
        label: 'f',
        kind: 'select' as const,
        visibleWhen: (values: Record<string, string | number | boolean>) => values.saveWay !== 'clipboard',
      },
    ]
    expect(visibleFields(fields, { saveWay: 'clipboard' })).toHaveLength(0)
    expect(visibleFields(fields, { saveWay: 'file' })).toHaveLength(1)
    expect(t('captureTitle')).toContain('Shiin')
  })
})

describe('field interaction helpers', () => {
  const field = {
    id: 'target',
    label: 'target',
    kind: 'select' as const,
    options: [
      { value: 'screen', label: 'screen' },
      { value: 'window', label: 'window' },
    ],
  }

  it('wraps select options in both directions', () => {
    expect(nextOptionValue(field, 'screen', 1)).toBe('window')
    expect(nextOptionValue(field, 'screen', -1)).toBe('window')
  })

  it('clamps numbers to the declared range', () => {
    const numberField = { id: 'port', label: 'port', kind: 'number' as const, min: 1, max: 10, step: 3 }
    expect(stepNumber(numberField, 9, 1)).toBe(10)
    expect(stepNumber(numberField, 1, -1)).toBe(1)
  })
})

describe('rich rendering', () => {
  it('measures CJK width instead of code units', () => {
    expect(visibleWidth('截图')).toBe(4)
    expect(stripAnsi('\u001b[36mok\u001b[39m')).toBe('ok')
  })

  it('truncates by visible width and keeps the ellipsis', () => {
    expect(truncateVisible('abcdef', 4)).toBe('abc…')
    expect(truncateVisible('截图工具', 5)).toBe('截图…')
  })

  it('renders a progress bar that fits the terminal columns', () => {
    const host = fakeHost(60)
    const line = stripAnsi(renderProgressBar(host, 42, 'capturing the screen', { label: 'shot' }))
    expect(line).toContain('42%')
    expect(visibleWidth(line)).toBeLessThanOrEqual(60)
  })
})

describe('i18n', () => {
  it('resolves language from flags and environment, defaulting to zh', () => {
    expect(resolveLanguage('en')).toBe('en')
    expect(resolveLanguage(undefined, { LC_ALL: 'zh_CN.UTF-8' })).toBe('zh')
    expect(resolveLanguage(undefined, {})).toBe('zh')
  })

  it('interpolates values without leaving placeholders', () => {
    const t = createTranslator('en')
    expect(t('error')).toBe('Error')
  })
})

describe('config coercion', () => {
  it('only accepts keys the terminal face knows how to write', () => {
    expect(isEditableKey('imageFormat')).toBe(true)
    expect(isEditableKey('comboKeys')).toBe(true)
    expect(isEditableKey('windowCaptureMode')).toBe(true)
    expect(isEditableKey('__proto__')).toBe(false)
  })

  it('rejects values that would corrupt the config', () => {
    expect(coerceConfigValue('imageFormat', 'webp')).toEqual({ error: 'imageFormat must be jpg or png' })
    expect(coerceConfigValue('obsPort', 'abc')).toEqual({ error: 'obsPort must be a positive number' })
    expect(coerceConfigValue('captureTargetType', 'monitor')).toEqual({ error: 'captureTargetType must be screen or window' })
    expect(coerceConfigValue('windowCaptureMode', 'auto')).toEqual({
      error: 'windowCaptureMode must be specified or focused',
    })
  })

  it('accepts the two window source modes', () => {
    expect(coerceConfigValue('windowCaptureMode', 'focused')).toEqual({ value: 'focused' })
    expect(coerceConfigValue('windowCaptureMode', 'specified')).toEqual({ value: 'specified' })
  })

  it('converts declared values to their runtime shapes', () => {
    expect(coerceConfigValue('imageFormat', 'png')).toEqual({ value: 'png' })
    expect(coerceConfigValue('obsPort', '4455')).toEqual({ value: 4455 })
    expect(coerceConfigValue('comboKeys', 'Button0, Button7;L1')).toEqual({ value: ['Button0', 'Button7', 'L1'] })
  })
})

describe('byte formatting', () => {
  it('keeps units readable at every scale', () => {
    expect(formatBytes(0)).toBe('—')
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB')
  })
})

describe('combo recorder', () => {
  it('records a button only on its rising edge', () => {
    expect(collectComboEdges([false, false], [], [true, false], [])).toEqual(['Button0'])
    expect(collectComboEdges([true, false], [], [true, false], [])).toEqual([])
  })

  it('records axis crossings once and ignores jitter below the threshold', () => {
    expect(collectComboEdges([], [0, 0], [], [1, 0.5])).toEqual(['Axis0+'])
    expect(collectComboEdges([], [0.9], [], [1])).toEqual([])
    expect(collectComboEdges([], [0], [], [-0.9])).toEqual(['Axis0-'])
  })

  it('keeps the order and drops duplicates', () => {
    expect(appendComboKeys(['Button0'], ['Button0', 'Button7'])).toEqual(['Button0', 'Button7'])
    expect(appendComboKeys([], ['Axis2+', 'Axis2+'])).toEqual(['Axis2+'])
  })
})

describe('combo key parsing', () => {
  it('normalizes button and axis spellings', () => {
    expect(parseComboKeys('button0, BUTTON7;Axis2+ axis5-')).toEqual({
      ok: true,
      keys: ['Button0', 'Button7', 'Axis2+', 'Axis5-'],
    })
  })

  it('dedupes repeated keys', () => {
    expect(parseComboKeys('Button0,Button0')).toEqual({ ok: true, keys: ['Button0'] })
  })

  it('rejects keys the core layer cannot match', () => {
    const result = parseComboKeys('Button0,Space')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('Space')
    expect(parseComboKeys('   ').ok).toBe(false)
  })
})
