/**
 * 组合键录制的纯逻辑：把手柄轮询的两次采样变成"这一拍新按下了什么"。
 *
 * 单独拎出来是为了能测：TUI 里那段 effect 只负责把结果塞进 state，
 * 真正的判定（按键由松到按、轴越过 ±0.85、去重）在这里。
 * 键名与 `GamepadCore.tickCheckCombo` 的解析口径一致：`Button0`、`Axis2+`、`Axis5-`。
 */

export const AXIS_TRIGGER_THRESHOLD = 0.85

export function collectComboEdges(
  previousButtons: readonly boolean[],
  previousAxes: readonly number[],
  buttons: readonly boolean[],
  axes: readonly number[],
): string[] {
  const edges: string[] = []

  buttons.forEach((pressed, index) => {
    if (pressed && !previousButtons[index]) edges.push(`Button${index}`)
  })

  axes.forEach((value, index) => {
    const before = previousAxes[index] ?? 0
    if (value >= AXIS_TRIGGER_THRESHOLD && before < AXIS_TRIGGER_THRESHOLD) edges.push(`Axis${index}+`)
    if (value <= -AXIS_TRIGGER_THRESHOLD && before > -AXIS_TRIGGER_THRESHOLD) edges.push(`Axis${index}-`)
  })

  return edges
}

/** 追加而不重复：同一根轴来回推、同一个键连按，都只留一条。 */
export function appendComboKeys(current: readonly string[], added: readonly string[]): string[] {
  const merged = [...current]
  for (const key of added) {
    if (!merged.includes(key)) merged.push(key)
  }
  return merged
}
