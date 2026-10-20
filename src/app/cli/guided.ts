/**
 * `gd` 引导式问答：@clack/prompts 把同一张字段表问出来，再走一次确认。
 *
 * 参考 Xaihi `runGuidedInteraction` 的结构（面板 → 逐字段 → 预览 → 确认 → 执行 → 结果），
 * 但只保留截图这一件事：参数少、路径要能看懂、失败要能照着改。
 */

import {
  confirm,
  intro,
  isCancel,
  log,
  note,
  outro,
  select,
  spinner,
  text,
} from '@clack/prompts'
import type { Readable, Writable } from 'node:stream'

import type { ScreenshotManager } from '../../core/index.js'
import { collectContext, executeCapture } from './actions.js'
import type { CliHost } from './host.js'
import { createTranslator, type Language, type Translator } from './i18n.js'
import { visibleFields, type InteractionField, type InteractionValue, type InteractionValues } from './interaction.js'
import { createCaptureSchema } from './plan.js'

function clackContext(host: CliHost) {
  return {
    input: host.stdin as unknown as Readable,
    output: host.stdout as unknown as Writable,
  }
}

function isCancelValue(value: unknown): value is symbol {
  return isCancel(value) || typeof value === 'symbol'
}

/** 取消用异常穿透字段循环：clack 的 cancel 不是错误，但需要一次性跳出整条问答。 */
class GuidedCancel extends Error {
  constructor() {
    super('cancelled')
    this.name = 'GuidedCancel'
  }
}

async function promptField(host: CliHost, field: InteractionField, values: InteractionValues, t: Translator): Promise<InteractionValue> {
  if (field.kind === 'select') {
    const answer = await select<InteractionValue>({
      message: field.label,
      options: (field.options ?? []).map((option) => ({
        value: option.value,
        label: option.label,
        hint: option.hint,
      })),
      initialValue: values[field.id] as string,
      ...clackContext(host),
    })
    if (isCancelValue(answer)) throw new GuidedCancel()
    return answer
  }

  if (field.kind === 'boolean') {
    const answer = await confirm({
      message: field.label,
      initialValue: Boolean(values[field.id]),
      ...clackContext(host),
    })
    if (isCancelValue(answer)) throw new GuidedCancel()
    return answer
  }

  while (true) {
    const answer = await text({
      message: field.label,
      placeholder: field.placeholder,
      defaultValue: String(values[field.id] ?? ''),
      ...clackContext(host),
    })
    if (isCancelValue(answer)) throw new GuidedCancel()
    const value: InteractionValue = field.kind === 'number' && String(answer).trim() !== '' ? Number(answer) : String(answer).trim()
    const error = field.validate?.(value, values) ?? null
    if (!error) return value
    log.error(error)
  }
}

export async function runGuidedCapture(manager: ScreenshotManager, host: CliHost, language: Language): Promise<number> {
  const t = createTranslator(language)
  const context = await collectContext(manager)
  const schema = createCaptureSchema(context, t)
  const values: InteractionValues = { ...schema.initialValues }

  intro(t('captureTitle'))
  note(t('captureIntro'), t('appName'))

  try {
    // 逐字段重算可见性：选了“窗口”后，窗口来源/窗口 id 才需要接着问。
    for (const field of schema.fields) {
      if (visibleFields([field], values).length === 0) continue
      values[field.id] = await promptField(host, field, values, t)
    }

    const plan = schema.toPlan(values)
    const formError = schema.validate?.(values, plan) ?? null
    if (formError) {
      log.error(formError)
      outro(t('cancel'))
      return 2
    }

    note(schema.preview(plan).join('\n'), t('preview'))

    const confirmed = await confirm({
      message: t('confirm'),
      initialValue: true,
      active: t('yes'),
      inactive: t('no'),
      ...clackContext(host),
    })
    if (isCancelValue(confirmed) || !confirmed) {
      outro(t('cancel'))
      return 0
    }

    const progress = spinner()
    progress.start(t('running'))
    const result = await executeCapture(manager, plan, t, (event) => {
      if (event.progress !== undefined) progress.message(`${event.message} ${Math.round(event.progress)}%`)
    })
    if (result.success) {
      progress.stop(t('done'))
      if (result.lines?.length) note(result.lines.join('\n'), t('result'))
      outro(result.message)
      return 0
    }
    progress.error(t('failed'))
    log.error(result.lines?.join('\n') ?? result.message)
    outro(t('captureFailed'))
    return 1
  } catch (error) {
    if (error instanceof GuidedCancel) {
      outro(t('cancel'))
      return 0
    }
    throw error
  }
}
