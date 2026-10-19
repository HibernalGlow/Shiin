import type { Condition } from './conditions.js'
import type { XaihiI18nText } from './manifest.js'

export type NodeTransform = 'identity' | 'trim' | 'trimOrOmit' | 'lines' | 'delimited' | 'asInteger' | 'asBoolean'

export interface NodeField {
  id: string
  label: XaihiI18nText
  kind: 'text' | 'multiline' | 'path-list' | 'number' | 'boolean' | 'select'
  isActionSelector?: boolean
  options?: Array<{ value: string; label: XaihiI18nText }>
  default?: unknown
  visible?: Condition
  rules?: Array<{
    rule: { type: string; [key: string]: unknown }
    when?: Condition
  }>
}

export interface NodeAction {
  id: string
  label: XaihiI18nText
  description?: XaihiI18nText
}

export interface NodeBinding {
  fieldId: string
  slot: string
  transform?: NodeTransform
}

export interface NodeDanger {
  type: 'none' | 'actionIn' | 'fieldFlag' | 'all' | 'any' | 'pluginExport'
  actionField?: string
  dangerous?: string[]
  fieldId?: string
  predicates?: any[]
  exportName?: string
}

export interface NodeDefinition {
  definitionVersion: number
  nodeId: string
  title: XaihiI18nText
  description: XaihiI18nText
  icon?: string
  category?: string
  actions: NodeAction[]
  fields: NodeField[]
  inputBindings: NodeBinding[]
  danger?: NodeDanger
  reportsProgress?: boolean
  publishesOutputPath?: boolean
  help?: Record<string, unknown>
}

export function validateNodeDefinition(def: unknown): { ok: true; value: NodeDefinition } | { ok: false; errors: string[] } {
  if (typeof def !== 'object' || def === null) {
    return { ok: false, errors: ['Node definition must be an object'] }
  }
  const d = def as Partial<NodeDefinition>
  const errors: string[] = []

  if (!d.nodeId || typeof d.nodeId !== 'string') errors.push('nodeId is required')
  if (!d.title || typeof d.title !== 'object') errors.push('title is required')
  if (!Array.isArray(d.actions) || d.actions.length === 0) errors.push('actions array must not be empty')
  if (!Array.isArray(d.fields)) errors.push('fields array is required')
  if (!Array.isArray(d.inputBindings)) d.inputBindings = []

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, value: d as NodeDefinition }
}
