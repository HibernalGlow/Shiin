import * as React from 'react'
import type {
  ControllerFamily,
  GamepadSourceDeviceInfo,
  StandardGamepadState,
} from '../types.js'
import { detectController } from '../detector/rules.js'
import { XboxControllerShape } from '../shapes/XboxControllerShape.js'
import { PlayStationControllerShape } from '../shapes/PlayStationControllerShape.js'
import { NintendoControllerShape } from '../shapes/NintendoControllerShape.js'
import { GenericControllerShape } from '../shapes/GenericControllerShape.js'

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

  const renderShape = () => {
    switch (effectiveFamily) {
      case 'playstation':
        return (
          <PlayStationControllerShape
            state={state}
            interactive={interactive}
            onButtonPress={onButtonPress}
            showLabels={showLabels}
            accentColor={accentColor || '#58a6ff'}
          />
        )
      case 'nintendo':
        return (
          <NintendoControllerShape
            state={state}
            interactive={interactive}
            onButtonPress={onButtonPress}
            showLabels={showLabels}
            accentColor={accentColor || '#e60012'}
          />
        )
      case 'generic':
        return (
          <GenericControllerShape
            state={state}
            interactive={interactive}
            onButtonPress={onButtonPress}
            showLabels={showLabels}
            accentColor={accentColor || '#c8f000'}
          />
        )
      case 'xbox':
      default:
        return (
          <XboxControllerShape
            state={state}
            interactive={interactive}
            onButtonPress={onButtonPress}
            showLabels={showLabels}
            accentColor={accentColor || '#56c271'}
          />
        )
    }
  }

  return (
    <div
      className={`gp-controller-wrap gp-family-${effectiveFamily} ${className}`}
      style={style}
      {...props}
    >
      {renderShape()}
    </div>
  )
}
