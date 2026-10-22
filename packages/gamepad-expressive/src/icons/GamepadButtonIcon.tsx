import * as React from 'react'
import type { ControllerFamily } from '../types.js'
import {
  XboxButtonA,
  XboxButtonB,
  XboxButtonX,
  XboxButtonY,
  XboxGuideJewel,
  XboxMenuButton,
  XboxViewButton,
  XboxShareButton,
} from './xbox-icons.js'
import {
  PsCrossButton,
  PsCircleButton,
  PsSquareButton,
  PsTriangleButton,
  PsLogoButton,
  PsCreateButton,
  PsOptionsButton,
  PsTouchpadIcon,
} from './ps-icons.js'
import {
  NintendoButtonA,
  NintendoButtonB,
  NintendoButtonX,
  NintendoButtonY,
  NintendoPlusButton,
  NintendoMinusButton,
  NintendoHomeButton,
  NintendoCaptureButton,
} from './nintendo-icons.js'
import {
  DpadUpIcon,
  DpadDownIcon,
  DpadLeftIcon,
  DpadRightIcon,
  ShoulderBumperIcon,
  ShoulderTriggerIcon,
  StickClickIcon,
} from './common-icons.js'

export type GamepadButtonKey =
  | 'south'
  | 'east'
  | 'west'
  | 'north'
  | 'a'
  | 'b'
  | 'x'
  | 'y'
  | 'dpadUp'
  | 'dpadDown'
  | 'dpadLeft'
  | 'dpadRight'
  | 'l1'
  | 'r1'
  | 'l2'
  | 'r2'
  | 'l3'
  | 'r3'
  | 'select'
  | 'start'
  | 'guide'
  | 'touchpad'
  | 'misc'

export interface GamepadButtonIconProps extends React.SVGProps<SVGSVGElement> {
  button: GamepadButtonKey | string
  family?: ControllerFamily
  size?: number | string
  active?: boolean
  triggerValue?: number
}

const RAW_BUTTON_MAP: Record<string, string> = {
  button0: 'south',
  button1: 'east',
  button2: 'west',
  button3: 'north',
  button4: 'l1',
  button5: 'r1',
  button6: 'l2',
  button7: 'r2',
  button8: 'select',
  button9: 'start',
  button10: 'l3',
  button11: 'r3',
  button12: 'dpadup',
  button13: 'dpaddown',
  button14: 'dpadleft',
  button15: 'dpadright',
  button16: 'guide',
  button17: 'touchpad',
  button18: 'misc',
  'axis4+': 'l2',
  'axis5+': 'r2',
}

export const GamepadButtonIcon: React.FC<GamepadButtonIconProps> = ({
  button,
  family = 'xbox',
  size = 24,
  active = false,
  triggerValue = 0,
  className = '',
  style,
  ...props
}) => {
  const rawKey = String(button).toLowerCase().trim()
  const normKey = RAW_BUTTON_MAP[rawKey] || rawKey

  // 1. South Button (Bottom Action Button)
  if (
    normKey === 'south' ||
    (family === 'xbox' && normKey === 'a') ||
    (family === 'nintendo' && normKey === 'b') ||
    (family === 'playstation' && (normKey === 'cross' || normKey === 'x'))
  ) {
    if (family === 'playstation') return <PsCrossButton size={size} active={active} className={className} style={style} {...props} />
    if (family === 'nintendo') return <NintendoButtonB size={size} active={active} className={className} style={style} {...props} />
    return <XboxButtonA size={size} active={active} className={className} style={style} {...props} />
  }

  // 2. East Button (Right Action Button)
  if (
    normKey === 'east' ||
    (family === 'xbox' && normKey === 'b') ||
    (family === 'nintendo' && normKey === 'a') ||
    (family === 'playstation' && (normKey === 'circle' || normKey === 'o'))
  ) {
    if (family === 'playstation') return <PsCircleButton size={size} active={active} className={className} style={style} {...props} />
    if (family === 'nintendo') return <NintendoButtonA size={size} active={active} className={className} style={style} {...props} />
    return <XboxButtonB size={size} active={active} className={className} style={style} {...props} />
  }

  // 3. West Button (Left Action Button)
  if (
    normKey === 'west' ||
    (family === 'xbox' && normKey === 'x') ||
    (family === 'nintendo' && normKey === 'y') ||
    (family === 'playstation' && normKey === 'square')
  ) {
    if (family === 'playstation') return <PsSquareButton size={size} active={active} className={className} style={style} {...props} />
    if (family === 'nintendo') return <NintendoButtonY size={size} active={active} className={className} style={style} {...props} />
    return <XboxButtonX size={size} active={active} className={className} style={style} {...props} />
  }

  // 4. North Button (Top Action Button)
  if (
    normKey === 'north' ||
    (family === 'xbox' && normKey === 'y') ||
    (family === 'nintendo' && normKey === 'x') ||
    (family === 'playstation' && normKey === 'triangle')
  ) {
    if (family === 'playstation') return <PsTriangleButton size={size} active={active} className={className} style={style} {...props} />
    if (family === 'nintendo') return <NintendoButtonX size={size} active={active} className={className} style={style} {...props} />
    return <XboxButtonY size={size} active={active} className={className} style={style} {...props} />
  }

  // Direct Button Letters fallback
  if (normKey === 'a') return family === 'nintendo' ? <NintendoButtonA size={size} active={active} {...props} /> : <XboxButtonA size={size} active={active} {...props} />
  if (normKey === 'b') return family === 'nintendo' ? <NintendoButtonB size={size} active={active} {...props} /> : <XboxButtonB size={size} active={active} {...props} />
  if (normKey === 'x') return family === 'nintendo' ? <NintendoButtonX size={size} active={active} {...props} /> : <XboxButtonX size={size} active={active} {...props} />
  if (normKey === 'y') return family === 'nintendo' ? <NintendoButtonY size={size} active={active} {...props} /> : <XboxButtonY size={size} active={active} {...props} />

  // D-pad
  if (normKey === 'dpadup' || normKey === 'dpup') return <DpadUpIcon size={size} active={active} {...props} />
  if (normKey === 'dpaddown' || normKey === 'dpdown') return <DpadDownIcon size={size} active={active} {...props} />
  if (normKey === 'dpadleft' || normKey === 'dpleft') return <DpadLeftIcon size={size} active={active} {...props} />
  if (normKey === 'dpadright' || normKey === 'dpright') return <DpadRightIcon size={size} active={active} {...props} />

  // Bumpers & Triggers
  if (normKey === 'l1' || normKey === 'lb') {
    const lbl = family === 'playstation' ? 'L1' : family === 'nintendo' ? 'L' : 'LB'
    return <ShoulderBumperIcon label={lbl} size={size} active={active} {...props} />
  }
  if (normKey === 'r1' || normKey === 'rb') {
    const lbl = family === 'playstation' ? 'R1' : family === 'nintendo' ? 'R' : 'RB'
    return <ShoulderBumperIcon label={lbl} size={size} active={active} {...props} />
  }
  if (normKey === 'l2' || normKey === 'lt') {
    const lbl = family === 'playstation' ? 'L2' : family === 'nintendo' ? 'ZL' : 'LT'
    return <ShoulderTriggerIcon label={lbl} value={triggerValue} size={size} active={active} {...props} />
  }
  if (normKey === 'r2' || normKey === 'rt') {
    const lbl = family === 'playstation' ? 'R2' : family === 'nintendo' ? 'ZR' : 'RT'
    return <ShoulderTriggerIcon label={lbl} value={triggerValue} size={size} active={active} {...props} />
  }

  // Thumbsticks Click & Axes
  if (normKey === 'l3' || normKey === 'leftstick' || /^axis[01][+-]$/.test(normKey)) {
    return <StickClickIcon label="L3" size={size} active={active} {...props} />
  }
  if (normKey === 'r3' || normKey === 'rightstick' || /^axis[23][+-]$/.test(normKey)) {
    return <StickClickIcon label="R3" size={size} active={active} {...props} />
  }

  // Center System Buttons
  if (normKey === 'guide' || normKey === 'home') {
    if (family === 'playstation') return <PsLogoButton size={size} active={active} {...props} />
    if (family === 'nintendo') return <NintendoHomeButton size={size} active={active} {...props} />
    return <XboxGuideJewel size={size} active={active} {...props} />
  }

  if (normKey === 'select' || normKey === 'back' || normKey === 'view' || normKey === 'share' || normKey === 'create') {
    if (family === 'playstation') return <PsCreateButton size={size} active={active} {...props} />
    if (family === 'nintendo') return <NintendoMinusButton size={size} active={active} {...props} />
    return <XboxViewButton size={size} active={active} {...props} />
  }

  if (normKey === 'start' || normKey === 'menu' || normKey === 'options') {
    if (family === 'playstation') return <PsOptionsButton size={size} active={active} {...props} />
    if (family === 'nintendo') return <NintendoPlusButton size={size} active={active} {...props} />
    return <XboxMenuButton size={size} active={active} {...props} />
  }

  if (normKey === 'touchpad') return <PsTouchpadIcon size={size} active={active} {...props} />
  if (normKey === 'misc') {
    if (family === 'nintendo') return <NintendoCaptureButton size={size} active={active} {...props} />
    return <XboxShareButton size={size} active={active} {...props} />
  }

  return <XboxButtonA size={size} active={active} {...props} />
}
