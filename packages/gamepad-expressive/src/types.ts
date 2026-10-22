/**
 * Types for @hibernalglow/gamepad-expressive
 */

export type ControllerFamily = 'xbox' | 'playstation' | 'nintendo' | 'generic'

export type ControllerModel =
  | 'xbox360'
  | 'xboxOne'
  | 'xboxSeries'
  | 'xboxElite'
  | 'ps3'
  | 'ps4'
  | 'ps5'
  | 'switchPro'
  | 'joyconLeft'
  | 'joyconRight'
  | 'joyconGrip'
  | 'domestic'
  | 'generic'

export type DetectionConfidence = 'exact' | 'vendor' | 'name' | 'fallback'

export interface ControllerDetectionResult {
  family: ControllerFamily
  model: ControllerModel
  confidence: DetectionConfidence
  displayName: string
  brandLabel: string
  vendorId?: number
  productId?: number
  guid?: string
  hasMapping: boolean
  isDomestic: boolean
}

export type PhysicalFacePosition = 'south' | 'east' | 'west' | 'north'

export interface StickVector {
  x: number // -1.0 to 1.0
  y: number // -1.0 to 1.0
}

/**
 * Standardized Gamepad State across all platforms and controllers.
 * Decouples physical positions (south, east, west, north) from visual labels (A/B/X/Y, ✕/○/□/△).
 */
export interface StandardGamepadState {
  // Face buttons (physical 4-button cluster)
  south: boolean // Xbox A | PS ✕ | Switch B
  east: boolean // Xbox B | PS ○ | Switch A
  west: boolean // Xbox X | PS □ | Switch Y
  north: boolean // Xbox Y | PS △ | Switch X

  // D-pad directions
  dpadUp: boolean
  dpadDown: boolean
  dpadLeft: boolean
  dpadRight: boolean

  // Shoulders & Triggers
  l1: boolean // LB / L1 / L
  r1: boolean // RB / R1 / R
  l2: boolean // LT / L2 / ZL (binary pressed state)
  r2: boolean // RT / R2 / ZR (binary pressed state)
  l2Value: number // 0.0 ~ 1.0
  r2Value: number // 0.0 ~ 1.0

  // Thumbsticks
  l3: boolean // Left stick click
  r3: boolean // Right stick click
  leftStick: StickVector
  rightStick: StickVector

  // Center / System Controls
  select: boolean // Back / View / Share / - / Create
  start: boolean // Start / Menu / Options / +
  guide: boolean // Xbox Jewel / PS Home / Switch Home
  touchpad: boolean // PlayStation Touchpad button
  misc: boolean // Dedicated Share / Capture / Mic Mute

  // Raw hardware inputs preserved for complete transparency
  rawButtons: boolean[]
  rawAxes: number[]
}

/**
 * Device metadata provided by SDL, Web Gamepad API, or OS
 */
export interface GamepadSourceDeviceInfo {
  id?: string | number
  name?: string
  guid?: string
  vendorId?: number
  productId?: number
  version?: number
  mapping?: string
  type?: string
  buttonsCount?: number
  axesCount?: number
  /** Whether button/axis arrays already use the Web Gamepad / SDL GameController layout. */
  inputLayout?: 'standard' | 'raw'
  controllerFamily?: ControllerFamily
}

/**
 * Raw input snapshot
 */
export interface RawGamepadInput {
  buttons: boolean[]
  axes: number[]
  hats?: string[] | number[]
}

/**
 * SDL GameController parsed mapping entry
 */
export interface SdlMappingEntry {
  guid: string
  name: string
  platform?: string
  bindings: Record<string, string>
  rawLine?: string
}

export interface ButtonLabelSpec {
  label: string
  symbol?: string
  accentColor: string
  textColor: string
  descriptionZh: string
  descriptionEn: string
}
