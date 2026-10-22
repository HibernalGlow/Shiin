import * as React from 'react'

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  active?: boolean
}

/**
 * MD3 Expressive Abstract Keycap Tokens — Xbox Series / Elite Spirit ("神似而不求形似")
 * Uses M3E expressive silhouettes (Cookie4, Puffy, Squircle, Soft Gem, Sunny8) that morph on press.
 */
const PATH_COOKIE4 =
  'M16 2.2 C19.8 2.2 21.8 4.6 25.6 6.4 C27.4 10.2 29.8 12.2 29.8 16 C29.8 19.8 27.4 21.8 25.6 25.6 C21.8 27.4 19.8 29.8 16 29.8 C12.2 29.8 10.2 27.4 6.4 25.6 C4.6 21.8 2.2 19.8 2.2 16 C2.2 12.2 4.6 10.2 6.4 6.4 C10.2 4.6 12.2 2.2 16 2.2 Z'
const PATH_SQUIRCLE =
  'M16 2.5 C24.5 2.5 29.5 7.5 29.5 16 C29.5 24.5 24.5 29.5 16 29.5 C7.5 29.5 2.5 24.5 2.5 16 C2.5 7.5 7.5 2.5 16 2.5 Z'
const PATH_PEBBLE_EAST =
  'M15.2 2.6 C23.8 2.2 29.8 8.2 29.8 16 C29.8 23.8 23.8 29.8 15.2 29.4 C7.4 29 2.4 23.5 2.4 16 C2.4 8.5 7.4 3 15.2 2.6 Z'
const PATH_GEM_NORTH =
  'M16 2 C21.5 2 29.6 10.2 29.6 16 C29.6 22.8 23.2 29.4 16 29.4 C8.8 29.4 2.4 22.8 2.4 16 C2.4 10.2 10.5 2 16 2 Z'
const PATH_BURST6 =
  'M16 1.8 C19.2 1.8 20.8 4.4 23.8 5.2 C26.8 6 28.8 9.2 28.4 12.4 C28 15.6 30.2 18.2 28.4 21.2 C26.6 24.2 23.6 24.8 21.4 27.2 C19.2 29.6 16 29.8 16 29.8 C16 29.8 12.8 29.6 10.6 27.2 C8.4 24.8 5.4 24.2 3.6 21.2 C1.8 18.2 4 15.6 3.6 12.4 C3.2 9.2 5.2 6 8.2 5.2 C11.2 4.4 12.8 1.8 16 1.8 Z'

export const XboxButtonA: React.FC<IconProps> = ({ size = 24, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-xbox-a ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <path
      d={active ? PATH_BURST6 : PATH_COOKIE4}
      fill={active ? '#c8f000' : '#e3f3c8'}
      stroke={active ? '#273000' : '#2e6f3e'}
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <circle cx="16" cy="25.5" r="1.4" fill={active ? '#273000' : '#2e6f3e'} opacity="0.65" />
    <text
      x="16"
      y="20.5"
      textAnchor="middle"
      fill={active ? '#1d2600' : '#1b4d27'}
      fontSize="14.5"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      A
    </text>
  </svg>
)

export const XboxButtonB: React.FC<IconProps> = ({ size = 24, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-xbox-b ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <path
      d={active ? PATH_COOKIE4 : PATH_PEBBLE_EAST}
      fill={active ? '#e0533c' : '#f9ded8'}
      stroke={active ? '#3a0b05' : '#a72d3b'}
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <circle cx="25.5" cy="16" r="1.4" fill={active ? '#ffffff' : '#a72d3b'} opacity="0.65" />
    <text
      x="15.8"
      y="20.5"
      textAnchor="middle"
      fill={active ? '#ffffff' : '#7d1d28'}
      fontSize="14.5"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      B
    </text>
  </svg>
)

export const XboxButtonX: React.FC<IconProps> = ({ size = 24, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-xbox-x ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <path
      d={active ? PATH_COOKIE4 : PATH_SQUIRCLE}
      fill={active ? '#388bfd' : '#dceafb'}
      stroke={active ? '#082042' : '#2563eb'}
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <circle cx="6.5" cy="16" r="1.4" fill={active ? '#ffffff' : '#2563eb'} opacity="0.65" />
    <text
      x="16.2"
      y="20.5"
      textAnchor="middle"
      fill={active ? '#ffffff' : '#1d4ed8'}
      fontSize="14.5"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      X
    </text>
  </svg>
)

export const XboxButtonY: React.FC<IconProps> = ({ size = 24, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-xbox-y ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <path
      d={active ? PATH_BURST6 : PATH_GEM_NORTH}
      fill={active ? '#f5b82e' : '#faecc8'}
      stroke={active ? '#382400' : '#b4690e'}
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <circle cx="16" cy="6.5" r="1.4" fill={active ? '#382400' : '#b4690e'} opacity="0.65" />
    <text
      x="16"
      y="21"
      textAnchor="middle"
      fill={active ? '#291a00' : '#854d0e'}
      fontSize="14.5"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      Y
    </text>
  </svg>
)

export const XboxGuideJewel: React.FC<IconProps> = ({ size = 28, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-xbox-guide ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    {/* M3E Scalloped Sunny Jewel */}
    <path
      d="M18 2.2 C21.8 2.2 24.4 4.8 28.2 6.8 C31.2 9.8 33.8 14.2 33.8 18 C33.8 21.8 31.2 26.2 28.2 29.2 C24.4 31.2 21.8 33.8 18 33.8 C14.2 33.8 11.6 31.2 7.8 29.2 C4.8 26.2 2.2 21.8 2.2 18 C2.2 14.2 4.8 9.8 7.8 6.8 C11.6 4.8 14.2 2.2 18 2.2 Z"
      fill={active ? '#c8f000' : 'var(--gp-surface-high, #dedccf)'}
      stroke={active ? '#273000' : 'var(--gp-ink, #343831)'}
      strokeWidth="2.2"
    />
    {/* Abstracted Nexus X-Arc ("神似" without trademark clutter) */}
    <path
      d="M11.5 11.5 C15 14.5 21 14.5 24.5 11.5 M11 23.5 C14.8 18.5 21.2 18.5 25 23.5"
      stroke={active ? '#273000' : 'var(--gp-ink, #343831)'}
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
)

export const XboxViewButton: React.FC<IconProps> = ({ size = 20, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-xbox-view ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <rect
      x="2"
      y="4"
      width="20"
      height="16"
      rx="8"
      fill={active ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface-container, #e4e2d6)'}
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <rect x="6.5" y="7.5" width="6.5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
    <rect x="10.5" y="11" width="6.5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6" fill={active ? 'currentColor' : 'none'} />
  </svg>
)

export const XboxMenuButton: React.FC<IconProps> = ({ size = 20, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-xbox-menu ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <rect
      x="2"
      y="4"
      width="20"
      height="16"
      rx="8"
      fill={active ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface-container, #e4e2d6)'}
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <line x1="7.5" y1="9" x2="16.5" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="7.5" y1="12" x2="16.5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="7.5" y1="15" x2="16.5" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const XboxShareButton: React.FC<IconProps> = ({ size = 18, active = false, className = '', style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`gp-icon gp-icon-xbox-share ${active ? 'active' : ''} ${className}`}
    style={style}
    {...props}
  >
    <rect
      x="4"
      y="3"
      width="16"
      height="18"
      rx="8"
      fill={active ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface-container, #e4e2d6)'}
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path d="M12 7V15M12 7L9 10M12 7L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="8.5" y1="17" x2="15.5" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)
