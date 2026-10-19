export interface ConditionPredicate {
  test: {
    type: 'always' | 'actionIs' | 'fieldEquals' | 'fieldTrue' | string
    actionField?: string
    fieldId?: string
    value?: unknown
    allowed?: string[]
  }
  negated?: boolean
}

export type Condition =
  | { type: 'single'; predicate: ConditionPredicate }
  | { type: 'all'; predicates?: ConditionPredicate[] }
  | { type: 'any'; predicates?: ConditionPredicate[] }

export function testPredicate(
  predicate: ConditionPredicate,
  args: Record<string, unknown>,
  actionId?: string
): boolean {
  const t = predicate.test
  let raw = false

  if (t.type === 'always') {
    raw = true
  } else if (t.type === 'actionIs') {
    const current = actionId ?? (t.actionField ? String(args[t.actionField] ?? '') : '')
    raw = Array.isArray(t.allowed) && t.allowed.includes(current)
  } else if (t.type === 'fieldEquals') {
    const val = t.fieldId ? args[t.fieldId] : undefined
    raw = val === t.value
  } else if (t.type === 'fieldTrue') {
    const val = t.fieldId ? args[t.fieldId] : undefined
    raw = val === true || val === 'true'
  }

  return predicate.negated ? !raw : raw
}

export function matchCondition(
  condition: Condition | undefined,
  args: Record<string, unknown>,
  actionId?: string
): boolean {
  if (!condition) return true

  if (condition.type === 'single') {
    return testPredicate(condition.predicate, args, actionId)
  }
  if (condition.type === 'all') {
    const list = condition.predicates ?? []
    return list.every((p) => testPredicate(p, args, actionId))
  }
  if (condition.type === 'any') {
    const list = condition.predicates ?? []
    return list.some((p) => testPredicate(p, args, actionId))
  }
  return true
}
