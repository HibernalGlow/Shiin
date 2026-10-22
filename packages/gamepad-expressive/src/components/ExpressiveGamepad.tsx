import * as React from 'react'
import type {
  ControllerFamily,
  GamepadSourceDeviceInfo,
  StandardGamepadState,
} from '../types.js'
import { detectController } from '../detector/rules.js'
import { ExpressiveInputField } from './ExpressiveInputField.js'

export interface ExpressiveGamepadProps extends React.HTMLAttributes<HTMLDivElement> {
  state: StandardGamepadState
  deviceInfo?: GamepadSourceDeviceInfo | null
  family?: ControllerFamily | 'auto'
  interactive?: boolean
  onButtonPress?: (buttonKey: string) => void
  showLabels?: boolean
  accentColor?: string
}

export const ExpressiveGamepad: React.FC<ExpressiveGamepadProps> = ({
  state,
  deviceInfo,
  family = 'auto',
  interactive = true,
  onButtonPress,
  showLabels = true,
  accentColor,
  className = '',
  style,
  ...props
}) => {
  // Determine effective family
  const effectiveFamily: ControllerFamily = React.useMemo(() => {
    if (family && family !== 'auto') return family
    return detectController(deviceInfo).family
  }, [family, deviceInfo])

  return (
    <div
      className={`gp-controller-wrap gp-family-${effectiveFamily} ${className}`}
      style={style}
      {...props}
    >
      <ExpressiveInputField state={state} family={effectiveFamily} interactive={interactive}
        onButtonPress={onButtonPress} showLabels={showLabels} accentColor={accentColor} />
    </div>
  )
}
