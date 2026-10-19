import { validateNodeDefinition, type NodeDefinition, type NodeField, type NodeTransform } from './node.js'
import { matchCondition } from './conditions.js'
import { NULL_RUN, type OperationJournal, type OperationRun } from './operations.js'

export interface NodeCall {
  args: Record<string, unknown>
  inputs: Record<string, unknown>
  run: OperationRun
}

export type NodeActionHandler = (call: NodeCall) => Promise<string>
export type NodeHandlers = Record<string, NodeActionHandler>

export interface NodeToolContext {
  tools?: { register(definition: unknown): unknown }
  commands?: {
    register(command: {
      name: string
      description: string
      handler: (args: { rawInput: string }) => Promise<{ kind: string; text?: string }>
    }): unknown
  }
  on?(event: string, listener: (...args: any[]) => any): unknown
  effect(callback: () => unknown, label?: string): unknown
}

export interface DefineNodeOptions {
  definition: unknown
  handlers: NodeHandlers
  journal?: OperationJournal | (() => OperationJournal | undefined)
}

export interface NodeHandle {
  invoke(actionId: string, args?: Record<string, unknown>): Promise<string>
}

export function transformValue(value: unknown, transform: NodeTransform): unknown {
  const absent = value === undefined || value === null
  const asText = (input: unknown): string =>
    typeof input === 'string' ? input : input === undefined || input === null ? '' : String(input)
  switch (transform) {
    case 'identity':
      return value
    case 'trim':
      return absent ? undefined : asText(value).trim()
    case 'trimOrOmit': {
      const trimmed = asText(value).trim()
      return trimmed === '' ? undefined : trimmed
    }
    case 'lines':
      return asText(value).split('\n').map((line) => line.trim()).filter((line) => line !== '')
    case 'delimited':
      return asText(value).split(',').map((part) => part.trim()).filter((part) => part !== '')
    case 'asInteger': {
      const parsed = Number.parseInt(asText(value), 10)
      return Number.isNaN(parsed) ? undefined : parsed
    }
    case 'asBoolean':
      return absent ? undefined : value === true || asText(value).toLowerCase() === 'true' || asText(value) === '1'
  }
  return value
}

export function bindInputs(definition: NodeDefinition, args: Record<string, unknown>): Record<string, unknown> {
  const inputs: Record<string, unknown> = {}
  for (const binding of definition.inputBindings) {
    inputs[binding.slot] = transformValue(args[binding.fieldId], binding.transform ?? 'identity')
  }
  return inputs
}

export function defineNode(ctx: NodeToolContext, options: DefineNodeOptions): NodeHandle {
  const validation = validateNodeDefinition(options.definition)
  if (!validation.ok) {
    throw new Error(`xaihi.node/v1 invalid: ${validation.errors.join('; ')}`)
  }
  const definition = validation.value

  const invoke = async (actionId: string, raw: Record<string, unknown> = {}): Promise<string> => {
    const handler = options.handlers[actionId]
    if (!handler) {
      throw new Error(`xaihi.node/v1: no handler for action "${actionId}"`)
    }
    const inputs = { ...raw, ...bindInputs(definition, raw) }
    return await handler({ args: raw, inputs, run: NULL_RUN })
  }

  // 如果宿主有 tools 服务，注册 tools 工具
  if (ctx.tools && typeof ctx.tools.register === 'function') {
    for (const action of definition.actions) {
      if (options.handlers[action.id]) {
        try {
          ctx.tools.register({
            name: `${definition.nodeId}_${action.id}`,
            description: `${definition.title.en} · ${action.label.en}`,
            execute: (args: Record<string, unknown>) => invoke(action.id, args || {}),
          })
        } catch {
          // ignore
        }
      }
    }
  }

  return { invoke }
}
