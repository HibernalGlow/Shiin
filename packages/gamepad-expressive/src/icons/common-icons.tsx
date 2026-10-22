import * as React from 'react'
import type { IconProps } from './xbox-icons.js'

/**
 * MD3 Expressive Common Controller Tokens:
 * - Sculpted 4-Petal Clover D-Pad with directional highlight
 * - Contoured Wing Capsule Bumpers (LB / RB / L1 / R1 / L / R)
 * - Liquid-Fill Arch Paddles (LT / RT / L2 / R2 / ZL / ZR)
 * - Concentric Cookie6 Stick Click Orbs (L3 / R3)
 */
const DPAD_CROSS_BASE =
  'M9.5 2.5 H14.5 L15.2 9.2 L21.5 9.5 V14.5 L15.2 14.8 L14.5 21.5 H9.5 L8.8 14.8 L2.5 14.5 V9.5 L8.8 9.2 Z'

export const DpadUpIcon: React.FC<IconProps> = ({ size = 22, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-dpad-up ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <path d={DPAD_CROSS_BASE} fill="var(--gp-surface-container, #e4e2d6)" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path
      d="M9.2 2.5 H14.8 L15.5 10.5 L12 13 L8.5 10.5 Z"
      fill={active ? 'var(--gp-primary, #c8f000)' : 'currentColor'}
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
)

export const DpadDownIcon: React.FC<IconProps> = ({ size = 22, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-dpad-down ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <path d={DPAD_CROSS_BASE} fill="var(--gp-surface-container, #e4e2d6)" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path
      d="M8.5 13.5 L12 11 L15.5 13.5 L14.8 21.5 H9.2 Z"
      fill={active ? 'var(--gp-primary, #c8f000)' : 'currentColor'}
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
)

export const DpadLeftIcon: React.FC<IconProps> = ({ size = 22, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-dpad-left ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <path d={DPAD_CROSS_BASE} fill="var(--gp-surface-container, #e4e2d6)" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path
      d="M2.5 9.2 L10.5 8.5 L13 12 L10.5 15.5 L2.5 14.8 Z"
      fill={active ? 'var(--gp-primary, #c8f000)' : 'currentColor'}
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
)

export const DpadRightIcon: React.FC<IconProps> = ({ size = 22, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-dpad-right ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <path d={DPAD_CROSS_BASE} fill="var(--gp-surface-container, #e4e2d6)" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path
      d="M13.5 8.5 L21.5 9.2 V14.8 L13.5 15.5 L11 12 Z"
      fill={active ? 'var(--gp-primary, #c8f000)' : 'currentColor'}
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
)

export const ShoulderBumperIcon: React.FC<IconProps & { label?: string }> = ({
  size = 28,
  active = false,
  label = 'LB',
  className = '',
  style,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 38 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-bumper ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    {/* Contoured M3E Wing Arch */}
    <path
      d="M4 17 C3 10 9 4.5 19 4.5 C29 4.5 35 10 34 17 C33.5 19.5 31 20.5 27.5 20.5 H10.5 C7 20.5 4.5 19.5 4 17 Z"
      fill={active ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface-container, #e4e2d6)'}
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
    />
    <text
      x="19"
      y="16.2"
      textAnchor="middle"
      fill={active ? 'var(--gp-on-primary, #1e2600)' : 'currentColor'}
      fontSize="10.5"
      fontWeight="850"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      {label}
    </text>
  </svg>
)

export const ShoulderTriggerIcon: React.FC<IconProps & { label?: string; value?: number }> = ({
  size = 30,
  active = false,
  label = 'LT',
  value = 0,
  className = '',
  style,
  ...props
}) => {
  const fillLevel = active ? Math.max(value, 1) : value
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`gp-icon gp-icon-trigger ${active ? 'active' : ''} ${className}`}
      style={style}
      {...props}
    >
      {/* Sculpted M3E Trigger Paddle */}
      <path
        d="M8 3.5 C13 2 23 2 28 3.5 C31.5 4.6 33 8 31.5 15 L29.5 22.5 C28.5 25 25.5 26 18 26 C10.5 26 7.5 25 6.5 22.5 L4.5 15 C3 8 4.5 4.6 8 3.5 Z"
        fill={fillLevel > 0.05 ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface-container, #e4e2d6)'}
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <text
        x="18"
        y="17.5"
        textAnchor="middle"
        fill={fillLevel > 0.05 ? 'var(--gp-on-primary, #1e2600)' : 'currentColor'}
        fontSize="10.5"
        fontWeight="850"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {label}
      </text>
    </svg>
  )
}

export const StickClickIcon: React.FC<IconProps & { label?: string }> = ({
  size = 26,
  active = false,
  label = 'L3',
  className = '',
  style,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-stick-click ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    {/* Scalloped Cookie6 Stick Orb */}
    <path
      d="M16 2.5 C20 2.5 22.2 4.8 25.8 6.8 C28.4 10.2 29.5 13 29.5 16 C29.5 19 28.4 21.8 25.8 25.2 C22.2 27.2 20 29.5 16 29.5 C12 29.5 9.8 27.2 6.2 25.2 C3.6 21.8 2.5 19 2.5 16 C2.5 13 3.6 10.2 6.2 6.8 C9.8 4.8 12 2.5 16 2.5 Z"
      fill={active ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface-container, #e4e2d6)'}
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle
      cx="16"
      cy="16"
      r="9.2"
      stroke={active ? 'var(--gp-on-primary, #1e2600)' : 'currentColor'}
      strokeWidth="1.4"
      strokeDasharray="3 2"
    />
    <text
      x="16"
      y="19.8"
      textAnchor="middle"
      fill={active ? 'var(--gp-on-primary, #1e2600)' : 'currentColor'}
      fontSize="10.5"
      fontWeight="850"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      {label}
    </text>
  </svg>
)
