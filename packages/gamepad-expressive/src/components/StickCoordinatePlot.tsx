import * as React from 'react'
import type { StickVector } from '../types.js'

export interface StickCoordinatePlotProps {
  label: string
  vector: StickVector
  isPressed?: boolean
  size?: number
  deadzone?: number
  accentColor?: string
}

/**
 * MD3 Expressive Squircle-Clover Radar Plot for Analog Thumbstick Telemetry
 */
export const StickCoordinatePlot: React.FC<StickCoordinatePlotProps> = ({
  label,
  vector,
  isPressed = false,
  size = 76,
  deadzone = 0.1,
  accentColor = 'var(--gp-primary, #c8f000)',
}) => {
  const center = size / 2
  const radius = size * 0.4
  const px = center + vector.x * radius
  const py = center + vector.y * radius
  const dist = Math.sqrt(vector.x * vector.x + vector.y * vector.y)
  const inDeadzone = dist < deadzone

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* M3E Squircle Well Boundary */}
        <rect
          x={center - radius}
          y={center - radius}
          width={radius * 2}
          height={radius * 2}
          rx={radius * 0.62}
          fill="var(--gp-surface, #fbfaf4)"
          stroke="var(--gp-ink, #343831)"
          strokeWidth="1.6"
        />
        {/* Crosshair Axes */}
        <line
          x1={center - radius + 6}
          y1={center}
          x2={center + radius - 6}
          y2={center}
          stroke="var(--gp-outline, #c5c8b9)"
          strokeWidth="1.2"
          strokeDasharray="2 3"
        />
        <line
          x1={center}
          y1={center - radius + 6}
          x2={center}
          y2={center + radius - 6}
          stroke="var(--gp-outline, #c5c8b9)"
          strokeWidth="1.2"
          strokeDasharray="2 3"
        />
        {/* Deadzone Ring */}
        <circle
          cx={center}
          cy={center}
          r={Math.max(4, radius * deadzone)}
          fill="none"
          stroke="var(--gp-outline, #c5c8b9)"
          strokeWidth="1.2"
        />
        {/* Elastic M3E Vector Tension Band */}
        {!inDeadzone && (
          <line
            x1={center}
            y1={center}
            x2={px}
            y2={py}
            stroke={accentColor}
            strokeWidth="4.5"
            strokeLinecap="round"
            opacity={0.75}
          />
        )}
        {/* Morphing Thumb Puck */}
        <rect
          x={px - (isPressed ? 7.5 : 6.5)}
          y={py - (isPressed ? 7.5 : 6.5)}
          width={isPressed ? 15 : 13}
          height={isPressed ? 15 : 13}
          rx={isPressed ? 4 : 6.5}
          transform={isPressed ? `rotate(45 ${px} ${py})` : undefined}
          fill={inDeadzone && !isPressed ? 'var(--gp-surface-high, #dedccf)' : accentColor}
          stroke="var(--gp-ink, #343831)"
          strokeWidth="1.8"
        />
      </svg>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gp-muted, #5c6054)', textAlign: 'center' }}>
        {label} ({vector.x.toFixed(2)}, {vector.y.toFixed(2)})
      </div>
    </div>
  )
}
