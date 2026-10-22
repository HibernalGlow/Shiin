import * as React from 'react'
import type { IconProps } from './xbox-icons.js'

/**
 * MD3 Expressive Monolith & Dual-Capsule Keycap Tokens — Nintendo Switch Pro & Joy-Con Spirit ("神似而不求形似")
 */
const NS_COOKIE_CONFIRM =
  'M16 2.2 C20.2 2.2 22.4 4.8 26.2 6.8 C28.2 10.6 30.2 12.8 30.2 16 C30.2 19.2 28.2 21.4 26.2 25.2 C22.4 27.2 20.2 29.8 16 29.8 C11.8 29.8 9.6 27.2 5.8 25.2 C3.8 21.4 1.8 19.2 1.8 16 C1.8 12.8 3.8 10.6 5.8 6.8 C9.6 4.8 11.8 2.2 16 2.2 Z'
const NS_SQUIRCLE =
  'M16 2.6 C24.6 2.6 29.4 7.4 29.4 16 C29.4 24.6 24.6 29.4 16 29.4 C7.4 29.4 2.6 24.6 2.6 16 C2.6 7.4 7.4 2.6 16 2.6 Z'

export const NintendoButtonA: React.FC<IconProps> = ({ size = 24, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-ns-a ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <path
      d={NS_COOKIE_CONFIRM}
      fill={active ? '#e60012' : '#fadad8'}
      stroke={active ? '#45050a' : '#c9252d'}
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <text
      x="16"
      y="20.6"
      textAnchor="middle"
      fill={active ? '#ffffff' : '#9f1219'}
      fontSize="14.5"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      A
    </text>
  </svg>
)

export const NintendoButtonB: React.FC<IconProps> = ({ size = 24, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-ns-b ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <path
      d={active ? NS_COOKIE_CONFIRM : NS_SQUIRCLE}
      fill={active ? '#c8f000' : '#e6e4d8'}
      stroke={active ? '#273000' : '#4a4e42'}
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <text
      x="16"
      y="20.6"
      textAnchor="middle"
      fill={active ? '#1d2600' : '#2e322a'}
      fontSize="14.5"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      B
    </text>
  </svg>
)

export const NintendoButtonX: React.FC<IconProps> = ({ size = 24, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-ns-x ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <path
      d={active ? NS_COOKIE_CONFIRM : NS_SQUIRCLE}
      fill={active ? '#00b4d8' : '#d9f0f5'}
      stroke={active ? '#052c36' : '#0e7490'}
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <text
      x="16"
      y="20.6"
      textAnchor="middle"
      fill={active ? '#04222a' : '#155e75'}
      fontSize="14.5"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      X
    </text>
  </svg>
)

export const NintendoButtonY: React.FC<IconProps> = ({ size = 24, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-ns-y ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <path
      d={active ? NS_COOKIE_CONFIRM : NS_SQUIRCLE}
      fill={active ? '#00b4d8' : '#e6e4d8'}
      stroke={active ? '#052c36' : '#4a4e42'}
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <text
      x="16"
      y="20.6"
      textAnchor="middle"
      fill={active ? '#04222a' : '#2e322a'}
      fontSize="14.5"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      Y
    </text>
  </svg>
)

export const NintendoPlusButton: React.FC<IconProps> = ({ size = 20, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-ns-plus ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    {/* Sculpted M3E Plus Cross */}
    <path
      d="M9 3.5 H15 V9 H20.5 V15 H15 V20.5 H9 V15 H3.5 V9 H9 V3.5 Z"
      rx="2"
      fill={active ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface-container, #e4e2d6)'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
)

export const NintendoMinusButton: React.FC<IconProps> = ({ size = 20, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-ns-minus ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <rect
      x="3"
      y="8.5"
      width="18"
      height="7"
      rx="3.5"
      fill={active ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface-container, #e4e2d6)'}
      stroke="currentColor"
      strokeWidth="1.8"
    />
  </svg>
)

export const NintendoHomeButton: React.FC<IconProps> = ({ size = 24, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-ns-home ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    {/* M3E Arch Ring */}
    <rect
      x="3"
      y="3"
      width="26"
      height="26"
      rx="13"
      fill={active ? '#00c3e3' : 'var(--gp-surface-high, #dedccf)'}
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M16 9.5L9.5 15.2V22.5H14V18.5H18V22.5H22.5V15.2L16 9.5Z"
      fill={active ? '#062028' : 'currentColor'}
    />
  </svg>
)

export const NintendoCaptureButton: React.FC<IconProps> = ({ size = 20, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-ns-capture ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <rect
      x="3.5"
      y="3.5"
      width="17"
      height="17"
      rx="5"
      fill={active ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface-container, #e4e2d6)'}
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <circle cx="12" cy="12" r="4.5" fill="currentColor" />
  </svg>
)
