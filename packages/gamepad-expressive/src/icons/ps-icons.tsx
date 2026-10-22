import * as React from 'react'
import type { IconProps } from './xbox-icons.js'

/**
 * MD3 Expressive Sacred Geometry Keycap Tokens — PlayStation DualSense Spirit ("神似而不求形似")
 * Each button's outer container shape embodies its geometric symbol:
 * - Cross (✕): 4-Petal Diagonal Clover (Clover-X)
 * - Circle (○): 8-Lobe Scalloped Orb (Cookie8-O)
 * - Square (□): Superellipse Squircle (Squircle-Box)
 * - Triangle (△): Soft Rounded Wedge Arch (Wedge-Delta)
 */
const PS_CLOVER_X =
  'M16 3.6 C19.5 3.6 21.8 1.8 25.2 5.2 C28.6 8.6 26.8 10.9 26.8 14.4 C26.8 17.9 28.6 20.2 25.2 23.6 C21.8 27 19.5 25.2 16 25.2 C12.5 25.2 10.2 27 6.8 23.6 C3.4 20.2 5.2 17.9 5.2 14.4 C5.2 10.9 3.4 8.6 6.8 5.2 C10.2 1.8 12.5 3.6 16 3.6 Z'
const PS_COOKIE_ORB =
  'M16 2.2 C20.4 2.2 23.8 4.4 26.8 7.4 C29.8 10.4 29.8 15.6 29.8 16 C29.8 20.4 27.6 23.8 24.6 26.8 C21.6 29.8 16.4 29.8 16 29.8 C11.6 29.8 8.2 27.6 5.2 24.6 C2.2 21.6 2.2 16.4 2.2 16 C2.2 11.6 4.4 8.2 7.4 5.2 C10.4 2.2 15.6 2.2 16 2.2 Z'
const PS_SQUIRCLE_BOX =
  'M16 2.8 C24.8 2.8 29.2 7.2 29.2 16 C29.2 24.8 24.8 29.2 16 29.2 C7.2 29.2 2.8 24.8 2.8 16 C2.8 7.2 7.2 2.8 16 2.8 Z'
const PS_WEDGE_ARCH =
  'M16 2.4 C21.2 2.4 29.6 14.8 29.2 22.4 C28.8 27.8 23.6 29.4 16 29.4 C8.4 29.4 3.2 27.8 2.8 22.4 C2.4 14.8 10.8 2.4 16 2.4 Z'

export const PsCrossButton: React.FC<IconProps> = ({ size = 24, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-ps-cross ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <path
      d={PS_CLOVER_X}
      transform="translate(0, 1.5)"
      fill={active ? '#58a6ff' : '#dceafb'}
      stroke={active ? '#0a2540' : '#2563eb'}
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <path
      d="M11 11L21 21M21 11L11 21"
      stroke={active ? '#081c34' : '#1d4ed8'}
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
)

export const PsCircleButton: React.FC<IconProps> = ({ size = 24, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-ps-circle ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <path
      d={PS_COOKIE_ORB}
      fill={active ? '#f85149' : '#f9ded8'}
      stroke={active ? '#3a0b05' : '#c9353f'}
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <circle cx="16" cy="16" r="6.2" stroke={active ? '#ffffff' : '#b4232c'} strokeWidth="2.8" />
  </svg>
)

export const PsSquareButton: React.FC<IconProps> = ({ size = 24, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-ps-square ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <path
      d={PS_SQUIRCLE_BOX}
      fill={active ? '#ec4899' : '#fae0ee'}
      stroke={active ? '#4a0826' : '#be185d'}
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <rect
      x="10.2"
      y="10.2"
      width="11.6"
      height="11.6"
      rx="2.6"
      stroke={active ? '#ffffff' : '#9d174d'}
      strokeWidth="2.6"
    />
  </svg>
)

export const PsTriangleButton: React.FC<IconProps> = ({ size = 24, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-ps-triangle ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <path
      d={PS_WEDGE_ARCH}
      fill={active ? '#3fb950' : '#dcf4e1'}
      stroke={active ? '#062c10' : '#15803d'}
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <path
      d="M16 9.5L22.4 21.2H9.6L16 9.5Z"
      stroke={active ? '#05240d' : '#166534'}
      strokeWidth="2.6"
      strokeLinejoin="round"
    />
  </svg>
)

export const PsLogoButton: React.FC<IconProps> = ({ size = 28, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-ps-logo ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <path
      d="M18 3 C26.8 3 33 9.2 33 18 C33 26.8 26.8 33 18 33 C9.2 33 3 26.8 3 18 C3 9.2 9.2 3 18 3 Z"
      fill={active ? '#38bdf8' : 'var(--gp-surface-high, #dedccf)'}
      stroke={active ? '#082f49' : 'var(--gp-ink, #343831)'}
      strokeWidth="2.2"
    />
    {/* Abstracted DualSense Center Emblem */}
    <circle cx="18" cy="18" r="5.5" stroke={active ? '#082f49' : 'var(--gp-ink, #343831)'} strokeWidth="2.2" />
    <circle cx="18" cy="18" r="2" fill={active ? '#082f49' : 'var(--gp-ink, #343831)'} />
  </svg>
)

export const PsCreateButton: React.FC<IconProps> = ({ size = 20, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-ps-create ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <rect
      x="5"
      y="2.5"
      width="14"
      height="19"
      rx="7"
      transform="rotate(-12 12 12)"
      fill={active ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface-container, #e4e2d6)'}
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path d="M12 7.5V16.5M8.5 10L15.5 14M15.5 10L8.5 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

export const PsOptionsButton: React.FC<IconProps> = ({ size = 20, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-ps-options ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <rect
      x="5"
      y="2.5"
      width="14"
      height="19"
      rx="7"
      transform="rotate(12 12 12)"
      fill={active ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface-container, #e4e2d6)'}
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <line x1="8.5" y1="9" x2="15.5" y2="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="8.5" y1="12" x2="15.5" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="8.5" y1="15" x2="15.5" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

export const PsTouchpadIcon: React.FC<IconProps> = ({ size = 24, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-ps-touchpad ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <path
      d="M4 3.5 H28 C29.5 3.5 30.2 5 29.6 6.8 L26.8 16.8 C26.2 18.2 24.8 19 23.2 19 H8.8 C7.2 19 5.8 18.2 5.2 16.8 L2.4 6.8 C1.8 5 2.5 3.5 4 3.5 Z"
      stroke="currentColor"
      strokeWidth="1.8"
      fill={active ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface-container, #e4e2d6)'}
    />
    <line x1="10" y1="7" x2="22" y2="7" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
  </svg>
)
