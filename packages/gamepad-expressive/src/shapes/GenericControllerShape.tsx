import * as React from 'react'
import type { ControllerShapeProps } from './XboxControllerShape.js'
import { XboxControllerShape } from './XboxControllerShape.js'

/**
 * MD3 Expressive Field-Desk Modular Controller Shape for Generic / Domestic Pro Controllers
 * (8BitDo, Flydigi, Beitong, Machenike, GameSir, Gulikit)
 */
export const GenericControllerShape: React.FC<ControllerShapeProps> = (props) => {
  return (
    <XboxControllerShape
      {...props}
      accentColor={props.accentColor || 'var(--gp-primary, #c8f000)'}
      className={`gp-generic-field-deck ${props.className || ''}`}
    />
  )
}
