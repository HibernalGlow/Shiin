/**
 * Shiin Automation Rule Engine
 *
 * Declarative, sandbox-safe Condition -> Action execution pipeline
 * with Dry-Run preview simulation and Undo rollback capabilities.
 * No arbitrary `eval` or dynamic code execution is permitted.
 */

import type { InboxItem, InboxItemStatus } from './inbox.js'

export type RuleConditionField =
  | 'appName'
  | 'windowTitle'
  | 'profileId'
  | 'ocrText'
  | 'width'
  | 'height'
  | 'tags'
  | 'format'

export type RuleOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'containsAny'
  | 'notContainsAny'
  | 'in'
  | 'notIn'
  | 'greaterThan'
  | 'lessThan'

export interface RuleCondition {
  field: RuleConditionField
  operator: RuleOperator
  value: any
}

export type RuleActionType =
  | 'addTags'
  | 'removeTags'
  | 'setProfile'
  | 'star'
  | 'archive'
  | 'moveToFolder'

export interface RuleAction {
  type: RuleActionType
  value: any
}

export interface AutomationRule {
  id: string
  name: string
  enabled: boolean
  description?: string
  conditions: {
    all?: RuleCondition[]
    any?: RuleCondition[]
  }
  actions: RuleAction[]
}

export interface RuleMatchResult {
  ruleId: string
  ruleName: string
  matchedItemIds: string[]
  plannedActions: RuleAction[]
}

export interface UndoEntry {
  itemId: string
  field: 'tags' | 'profileId' | 'status' | 'filePath'
  previousValue: any
}

/**
 * 单一条件求值（沙箱安全比较）
 */
export function evaluateCondition(item: InboxItem, cond: RuleCondition): boolean {
  let targetVal: any = undefined

  switch (cond.field) {
    case 'appName':
      targetVal = item.appName || ''
      break
    case 'windowTitle':
      targetVal = item.windowTitle || ''
      break
    case 'profileId':
      targetVal = item.profileId || ''
      break
    case 'ocrText':
      targetVal = item.ocrText || ''
      break
    case 'width':
      targetVal = item.width ?? 0
      break
    case 'height':
      targetVal = item.height ?? 0
      break
    case 'tags':
      targetVal = item.tags || []
      break
    case 'format':
      targetVal = item.format || ''
      break
    default:
      return false
  }

  const op = cond.operator
  const expected = cond.value

  if (typeof targetVal === 'string' && typeof expected === 'string') {
    const sTarget = targetVal.toLowerCase()
    const sExpected = expected.toLowerCase()
    if (op === 'equals') return sTarget === sExpected
    if (op === 'notEquals') return sTarget !== sExpected
    if (op === 'contains') return sTarget.includes(sExpected)
    if (op === 'notContains') return !sTarget.includes(sExpected)
  }

  if (op === 'containsAny' && Array.isArray(expected)) {
    const sTarget = String(targetVal).toLowerCase()
    return expected.some((kw: string) => sTarget.includes(String(kw).toLowerCase()))
  }

  if (op === 'notContainsAny' && Array.isArray(expected)) {
    const sTarget = String(targetVal).toLowerCase()
    return !expected.some((kw: string) => sTarget.includes(String(kw).toLowerCase()))
  }

  if (op === 'in' && Array.isArray(expected)) {
    return expected.map((v) => String(v).toLowerCase()).includes(String(targetVal).toLowerCase())
  }

  if (op === 'notIn' && Array.isArray(expected)) {
    return !expected.map((v) => String(v).toLowerCase()).includes(String(targetVal).toLowerCase())
  }

  if (typeof targetVal === 'number' && typeof expected === 'number') {
    if (op === 'equals') return targetVal === expected
    if (op === 'greaterThan') return targetVal > expected
    if (op === 'lessThan') return targetVal < expected
  }

  if (Array.isArray(targetVal)) {
    // 针对 tags 数组
    if (op === 'contains') return targetVal.includes(expected)
    if (op === 'containsAny' && Array.isArray(expected)) {
      return expected.some((t) => targetVal.includes(t))
    }
  }

  return false
}

/**
 * 校验条目是否匹配指定规则的所有条件 (AND / OR)
 */
export function matchesRule(item: InboxItem, rule: AutomationRule): boolean {
  if (!rule.enabled) return false

  const { all, any } = rule.conditions

  if (all && all.length > 0) {
    const allPassed = all.every((cond) => evaluateCondition(item, cond))
    if (!allPassed) return false
  }

  if (any && any.length > 0) {
    const anyPassed = any.some((cond) => evaluateCondition(item, cond))
    if (!anyPassed) return false
  }

  return true
}

/**
 * Dry-Run 仿真测试：预览规则命中效果，不修改任何条目
 */
export function simulateRules(
  items: InboxItem[],
  rules: AutomationRule[]
): RuleMatchResult[] {
  const results: RuleMatchResult[] = []

  for (const rule of rules) {
    if (!rule.enabled) continue
    const matched = items.filter((item) => matchesRule(item, rule))
    if (matched.length > 0) {
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        matchedItemIds: matched.map((m) => m.id),
        plannedActions: rule.actions,
      })
    }
  }

  return results
}

/**
 * 执行规则集合，生成可回滚的 Undo 日志
 */
export function applyRules(
  items: InboxItem[],
  rules: AutomationRule[]
): {
  affectedItemIds: string[]
  undoLog: UndoEntry[]
} {
  const affected = new Set<string>()
  const undoLog: UndoEntry[] = []

  for (const rule of rules) {
    if (!rule.enabled) continue

    for (const item of items) {
      if (!matchesRule(item, rule)) continue

      affected.add(item.id)

      for (const action of rule.actions) {
        switch (action.type) {
          case 'addTags': {
            if (Array.isArray(action.value)) {
              undoLog.push({
                itemId: item.id,
                field: 'tags',
                previousValue: [...item.tags],
              })
              item.tags = Array.from(new Set([...item.tags, ...action.value]))
            }
            break
          }
          case 'removeTags': {
            if (Array.isArray(action.value)) {
              undoLog.push({
                itemId: item.id,
                field: 'tags',
                previousValue: [...item.tags],
              })
              item.tags = item.tags.filter((t) => !action.value.includes(t))
            }
            break
          }
          case 'setProfile': {
            if (typeof action.value === 'string') {
              undoLog.push({
                itemId: item.id,
                field: 'profileId',
                previousValue: item.profileId,
              })
              item.profileId = action.value
            }
            break
          }
          case 'archive': {
            undoLog.push({
              itemId: item.id,
              field: 'status',
              previousValue: item.status,
            })
            item.status = 'archived'
            break
          }
          case 'star': {
            undoLog.push({
              itemId: item.id,
              field: 'status',
              previousValue: item.status,
            })
            item.status = action.value ? 'starred' : item.status
            break
          }
        }
      }
    }
  }

  return {
    affectedItemIds: Array.from(affected),
    undoLog,
  }
}

/**
 * 根据 Undo 日志回滚变更
 */
export function rollbackUndoLog(items: InboxItem[], undoLog: UndoEntry[]): number {
  const itemMap = new Map<string, InboxItem>()
  for (const it of items) itemMap.set(it.id, it)

  let reverted = 0
  // 逆序回滚
  for (let i = undoLog.length - 1; i >= 0; i--) {
    const entry = undoLog[i]
    const item = itemMap.get(entry.itemId)
    if (!item) continue

    if (entry.field === 'tags') {
      item.tags = [...entry.previousValue]
      reverted++
    } else if (entry.field === 'status') {
      item.status = entry.previousValue as InboxItemStatus
      reverted++
    } else if (entry.field === 'profileId') {
      item.profileId = entry.previousValue
      reverted++
    }
  }

  return reverted
}
