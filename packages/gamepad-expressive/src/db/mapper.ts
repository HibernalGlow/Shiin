import type {
  RawGamepadInput,
  SdlMappingEntry,
  StandardGamepadState,
} from '../types.js'

/**
 * Creates an empty/default StandardGamepadState.
 */
export function createEmptyGamepadState(rawButtons: boolean[] = [], rawAxes: number[] = []): StandardGamepadState {
  return {
    south: false,
    east: false,
    west: false,
    north: false,
    dpadUp: false,
    dpadDown: false,
    dpadLeft: false,
    dpadRight: false,
    l1: false,
    r1: false,
    l2: false,
    r2: false,
    l2Value: 0,
    r2Value: 0,
    l3: false,
    r3: false,
    leftStick: { x: 0, y: 0 },
    rightStick: { x: 0, y: 0 },
    select: false,
    start: false,
    guide: false,
    touchpad: false,
    misc: false,
    rawButtons: rawButtons.slice(),
    rawAxes: rawAxes.slice(),
  }
}

/**
 * Resolves an individual SDL binding target string against raw buttons and axes.
 * Target can be:
 * - 'b0', 'b1', ... (button index)
 * - 'a0', 'a1', ... (axis index, normalized)
 * - '+a0', '-a0'    (half-axis / direction)
 * - '~a0'           (inverted axis)
 * - 'h0.1', 'h0.2', 'h0.4', 'h0.8' (hat switch directions: 1=up, 2=right, 4=down, 8=left)
 */
function resolveButtonBinding(target: string | undefined, input: RawGamepadInput): boolean {
  if (!target) return false

  // Button binding: 'bN'
  if (target.startsWith('b')) {
    const idx = parseInt(target.slice(1), 10)
    return Boolean(input.buttons[idx])
  }

  // Positive half axis: '+aN'
  if (target.startsWith('+a')) {
    const idx = parseInt(target.slice(2), 10)
    return (input.axes[idx] ?? 0) > 0.5
  }

  // Negative half axis: '-aN'
  if (target.startsWith('-a')) {
    const idx = parseInt(target.slice(2), 10)
    return (input.axes[idx] ?? 0) < -0.5
  }

  // Hat binding: 'hN.D' (e.g. h0.1, h0.4)
  if (target.startsWith('h')) {
    const match = target.match(/^h(\d+)\.(\d+)$/)
    if (match) {
      const hatIdx = parseInt(match[1], 10)
      const dirMask = parseInt(match[2], 10)
      if (Array.isArray(input.hats)) {
        const hatVal = input.hats[hatIdx]
        if (typeof hatVal === 'number') {
          return (hatVal & dirMask) !== 0
        }
        if (typeof hatVal === 'string') {
          const s = hatVal.toLowerCase()
          if (dirMask === 1) return s.includes('up')
          if (dirMask === 2) return s.includes('right')
          if (dirMask === 4) return s.includes('down')
          if (dirMask === 8) return s.includes('left')
        }
      }
    }
  }

  // Plain axis as button: 'aN' (e.g. triggers mapped as axes)
  if (target.startsWith('a')) {
    const idx = parseInt(target.slice(1), 10)
    return (input.axes[idx] ?? 0) > 0.2
  }

  return false
}

function resolveAxisBinding(target: string | undefined, input: RawGamepadInput): number {
  if (!target) return 0

  let inverted = false
  let rawKey = target

  if (rawKey.startsWith('~')) {
    inverted = true
    rawKey = rawKey.slice(1)
  }

  if (rawKey.startsWith('a')) {
    const idx = parseInt(rawKey.slice(1), 10)
    let val = input.axes[idx] ?? 0
    if (inverted) val = -val
    return Math.max(-1, Math.min(1, val))
  }

  // Button acting as axis
  if (rawKey.startsWith('b')) {
    const idx = parseInt(rawKey.slice(1), 10)
    return input.buttons[idx] ? 1 : 0
  }

  return 0
}

function resolveTriggerBinding(target: string | undefined, input: RawGamepadInput): { pressed: boolean; value: number } {
  if (!target) return { pressed: false, value: 0 }

  if (target.startsWith('b')) {
    const idx = parseInt(target.slice(1), 10)
    const pressed = Boolean(input.buttons[idx])
    return { pressed, value: pressed ? 1 : 0 }
  }

  if (target.startsWith('a') || target.startsWith('+a') || target.startsWith('~a')) {
    const axisVal = resolveAxisBinding(target.replace(/^\+/, ''), input)
    // SDL triggers are often reported in range 0.0 to 1.0, or -1.0 to 1.0 (where -1.0 is released)
    let normalized = axisVal
    if (axisVal < 0 && target.includes('trigger')) {
      normalized = (axisVal + 1) / 2
    }
    const clamped = Math.max(0, Math.min(1, normalized))
    return {
      pressed: clamped >= 0.15,
      value: clamped,
    }
  }

  return { pressed: false, value: 0 }
}

/**
 * Maps raw inputs using an SDL GameController mapping entry to StandardGamepadState.
 */
export function mapSdlToStandard(raw: RawGamepadInput, mapping?: SdlMappingEntry | null): StandardGamepadState {
  if (!mapping || !mapping.bindings || Object.keys(mapping.bindings).length === 0) {
    return mapStandardHardware(raw)
  }

  const b = mapping.bindings

  const lt = resolveTriggerBinding(b.lefttrigger, raw)
  const rt = resolveTriggerBinding(b.righttrigger, raw)

  return {
    south: resolveButtonBinding(b.a, raw),
    east: resolveButtonBinding(b.b, raw),
    west: resolveButtonBinding(b.x, raw),
    north: resolveButtonBinding(b.y, raw),

    dpadUp: resolveButtonBinding(b.dpup, raw),
    dpadDown: resolveButtonBinding(b.dpdown, raw),
    dpadLeft: resolveButtonBinding(b.dpleft, raw),
    dpadRight: resolveButtonBinding(b.dpright, raw),

    l1: resolveButtonBinding(b.leftshoulder, raw),
    r1: resolveButtonBinding(b.rightshoulder, raw),
    l2: lt.pressed,
    r2: rt.pressed,
    l2Value: lt.value,
    r2Value: rt.value,

    l3: resolveButtonBinding(b.leftstick, raw),
    r3: resolveButtonBinding(b.rightstick, raw),
    leftStick: {
      x: resolveAxisBinding(b.leftx, raw),
      y: resolveAxisBinding(b.lefty, raw),
    },
    rightStick: {
      x: resolveAxisBinding(b.rightx, raw),
      y: resolveAxisBinding(b.righty, raw),
    },

    select: resolveButtonBinding(b.back, raw),
    start: resolveButtonBinding(b.start, raw),
    guide: resolveButtonBinding(b.guide, raw),
    touchpad: resolveButtonBinding(b.touchpad, raw),
    misc: resolveButtonBinding(b.misc1, raw),

    rawButtons: raw.buttons.slice(),
    rawAxes: raw.axes.slice(),
  }
}

/**
 * Maps standard layout inputs (Standard Gamepad specification used by Web Gamepad API and SDL GameController).
 */
export function mapStandardHardware(raw: RawGamepadInput): StandardGamepadState {
  const btns = raw.buttons || []
  const axes = raw.axes || []

  // Triggers: check buttons first, then axes
  const ltValue = axes.length > 4 ? Math.max(0, Math.min(1, axes[4])) : btns[6] ? 1 : 0
  const rtValue = axes.length > 5 ? Math.max(0, Math.min(1, axes[5])) : btns[7] ? 1 : 0

  return {
    south: Boolean(btns[0]),
    east: Boolean(btns[1]),
    west: Boolean(btns[2]),
    north: Boolean(btns[3]),

    l1: Boolean(btns[4]),
    r1: Boolean(btns[5]),
    l2: Boolean(btns[6]) || ltValue >= 0.15,
    r2: Boolean(btns[7]) || rtValue >= 0.15,
    l2Value: ltValue,
    r2Value: rtValue,

    select: Boolean(btns[8]),
    start: Boolean(btns[9]),
    l3: Boolean(btns[10]),
    r3: Boolean(btns[11]),

    dpadUp: Boolean(btns[12]),
    dpadDown: Boolean(btns[13]),
    dpadLeft: Boolean(btns[14]),
    dpadRight: Boolean(btns[15]),

    guide: Boolean(btns[16]),
    touchpad: Boolean(btns[17]),
    misc: Boolean(btns[18]),

    leftStick: {
      x: axes.length > 0 ? axes[0] : 0,
      y: axes.length > 1 ? axes[1] : 0,
    },
    rightStick: {
      x: axes.length > 2 ? axes[2] : 0,
      y: axes.length > 3 ? axes[3] : 0,
    },

    rawButtons: btns.slice(),
    rawAxes: axes.slice(),
  }
}
