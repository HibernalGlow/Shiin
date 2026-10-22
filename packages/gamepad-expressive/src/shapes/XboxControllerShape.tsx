import * as React from 'react'
import type { StandardGamepadState } from '../types.js'

export interface ControllerShapeProps extends React.SVGProps<SVGSVGElement> {
  state: StandardGamepadState
  interactive?: boolean
  onButtonPress?: (buttonKey: string) => void
  showLabels?: boolean
  accentColor?: string
}

/**
 * MD3 Expressive Abstracted Xbox Series X|S & Elite Controller Art ("神似而不求形似")
 * Distills the iconic traits from gamepad-line-art-pack (xbox-series / xbox-elite-2):
 * - Sculpted chamfered Nexus crown & fuller grounded grips
 * - Asymmetric diagonal tension band linking Upper-Left Stick (L3) to Lower-Right Stick (R3)
 * - Faceted octagonal Elite hybrid D-pad dish with morphing clover petals
 * - M3E expressive pebble/cookie/gem face buttons (Y/B/A/X) that morph into bursts on press
 */
export const XboxControllerShape: React.FC<ControllerShapeProps> = ({
  state,
  interactive = true,
  onButtonPress,
  showLabels = true,
  accentColor = 'var(--gp-primary, #c8f000)',
  className = '',
  style,
  ...props
}) => {
  const maxRadius = 14
  const lx = state.leftStick.x * maxRadius
  const ly = state.leftStick.y * maxRadius
  const rx = state.rightStick.x * maxRadius
  const ry = state.rightStick.y * maxRadius

  const handlePress = (key: string) => {
    if (interactive && onButtonPress) {
      onButtonPress(key)
    }
  }

  return (
    <svg
      viewBox="0 0 600 370"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`gp-controller-svg gp-md3e-controller gp-xbox ${className}`}
      style={style}
      role="img"
      aria-label="Xbox Controller (MD3 Expressive)"
      {...props}
    >
      <defs>
        <filter id="md3eChassisShadow" x="-8%" y="-8%" width="116%" height="122%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#262b1c" floodOpacity="0.09" />
        </filter>
        <filter id="md3eStickShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#1e2218" floodOpacity="0.18" />
        </filter>
        <clipPath id="xboxLtClip">
          <path d="M 88 46 C 96 18, 146 12, 188 22 L 196 52 L 82 58 Z" />
        </clipPath>
        <clipPath id="xboxRtClip">
          <path d="M 512 46 C 504 18, 454 12, 412 22 L 404 52 L 518 58 Z" />
        </clipPath>
      </defs>

      {/* 1. Contoured Shoulder & Liquid Trigger Wings (Hugging the upper silhouette) */}
      <g className="gp-md3e-top-deck">
        {/* LT Sculpted Trigger Paddle */}
        <g
          className={`gp-interactive-btn ${state.l2 ? 'active' : ''}`}
          onClick={() => handlePress('Button6')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d="M 88 46 C 96 18, 146 12, 188 22 L 196 52 L 82 58 Z"
            fill="var(--gp-surface-container, #e4e2d6)"
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <g clipPath="url(#xboxLtClip)">
            <rect
              x="82"
              y="12"
              width={Math.max(0, Math.min(116, state.l2Value * 116))}
              height="48"
              fill={state.l2 ? accentColor : 'var(--gp-primary-container, #e7f6a8)'}
              className="gp-trigger-fill"
            />
          </g>
          <path
            d="M 88 46 C 96 18, 146 12, 188 22"
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <text x="138" y="36" textAnchor="middle" fill="var(--gp-ink, #343831)" fontSize="10.5" fontWeight="850">
            LT {Math.round(state.l2Value * 100)}%
          </text>
        </g>

        {/* RT Sculpted Trigger Paddle */}
        <g
          className={`gp-interactive-btn ${state.r2 ? 'active' : ''}`}
          onClick={() => handlePress('Button7')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d="M 512 46 C 504 18, 454 12, 412 22 L 404 52 L 518 58 Z"
            fill="var(--gp-surface-container, #e4e2d6)"
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <g clipPath="url(#xboxRtClip)">
            <rect
              x={518 - Math.max(0, Math.min(116, state.r2Value * 116))}
              y="12"
              width={Math.max(0, Math.min(116, state.r2Value * 116))}
              height="48"
              fill={state.r2 ? accentColor : 'var(--gp-primary-container, #e7f6a8)'}
              className="gp-trigger-fill"
            />
          </g>
          <path
            d="M 512 46 C 504 18, 454 12, 412 22"
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <text x="462" y="36" textAnchor="middle" fill="var(--gp-ink, #343831)" fontSize="10.5" fontWeight="850">
            RT {Math.round(state.r2Value * 100)}%
          </text>
        </g>

        {/* LB Contoured Wing Capsule */}
        <g
          className={`gp-interactive-btn ${state.l1 ? 'active' : ''}`}
          onClick={() => handlePress('Button4')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d="M 104 64 C 128 44, 186 38, 232 46 L 226 68 L 98 76 Z"
            fill={state.l1 ? accentColor : 'var(--gp-surface-high, #dedccf)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <text
            x="166"
            y="58"
            textAnchor="middle"
            fill={state.l1 ? 'var(--gp-on-primary, #273000)' : 'var(--gp-ink, #343831)'}
            fontSize="11.5"
            fontWeight="900"
          >
            LB
          </text>
        </g>

        {/* RB Contoured Wing Capsule */}
        <g
          className={`gp-interactive-btn ${state.r1 ? 'active' : ''}`}
          onClick={() => handlePress('Button5')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d="M 496 64 C 472 44, 414 38, 368 46 L 374 68 L 502 76 Z"
            fill={state.r1 ? accentColor : 'var(--gp-surface-high, #dedccf)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <text
            x="434"
            y="58"
            textAnchor="middle"
            fill={state.r1 ? 'var(--gp-on-primary, #273000)' : 'var(--gp-ink, #343831)'}
            fontSize="11.5"
            fontWeight="900"
          >
            RB
          </text>
        </g>
      </g>

      {/* 2. Abstracted Xbox Series / Elite Chassis with Chamfered Crown & Grounded Grips */}
      <g filter="url(#md3eChassisShadow)">
        <path
          d="M 224 54
             L 254 40
             H 346
             L 376 54
             C 438 54, 498 68, 528 112
             C 562 162, 574 242, 536 306
             C 508 352, 444 352, 404 294
             C 376 254, 354 234, 300 234
             C 246 234, 224 254, 196 294
             C 156 352, 92 352, 64 306
             C 26 242, 38 162, 72 112
             C 102 68, 162 54, 224 54 Z"
          fill="var(--gp-surface-container-low, #eae8de)"
          stroke="var(--gp-ink, #343831)"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />

        {/* M3E Asymmetric Diagonal Tension Ribbon (L-Stick to R-Stick flow) */}
        <path
          d="M 154 134 L 368 224"
          stroke="var(--gp-surface-container, #e4e2d6)"
          strokeWidth="56"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* Sculpted Chamfered Crown Arch (Xbox Series Nexus Bridge) */}
        <path
          d="M 226 55 L 254 42 H 346 L 374 55 C 362 96, 336 116, 300 116 C 264 116, 238 96, 226 55 Z"
          fill="var(--gp-surface-container, #e4e2d6)"
          stroke="var(--gp-outline, #c5c8b9)"
          strokeWidth="1.5"
        />

        {/* Ergonomic Textured Grip Cheek Inlays (Xbox Elite 2 Spirit) */}
        <path
          d="M 76 138 C 52 192, 56 258, 86 306 C 108 326, 138 318, 162 282 C 122 246, 108 190, 114 142 Z"
          fill="var(--gp-surface-container, #e4e2d6)"
          stroke="var(--gp-outline, #c5c8b9)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M 524 138 C 548 192, 544 258, 514 306 C 492 326, 462 318, 438 282 C 478 246, 492 190, 486 142 Z"
          fill="var(--gp-surface-container, #e4e2d6)"
          stroke="var(--gp-outline, #c5c8b9)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </g>

      {/* 3. Center Functional Cluster: M3E Sunny Nexus Jewel, View, Menu, Share Pill */}
      <g className="gp-md3e-center">
        {/* Xbox Nexus Jewel (M3E Scalloped Sunny8 Shape at cx=300, cy=82) */}
        <g
          className={`gp-interactive-btn ${state.guide ? 'active' : ''}`}
          onClick={() => handlePress('Button16')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d="M 300 61 C 306 61, 310 65, 315 67 C 319 72, 321 76, 321 82 C 321 88, 319 92, 315 97 C 310 99, 306 103, 300 103 C 294 103, 290 99, 285 97 C 281 92, 279 88, 279 82 C 279 76, 281 72, 285 67 C 290 65, 294 61, 300 61 Z"
            fill={state.guide ? accentColor : 'var(--gp-surface, #fbfaf4)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
          />
          <path
            d="M 292 75 C 296 79, 304 79, 308 75 M 291 89 C 296 83, 304 83, 309 89"
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>

        {/* View Button (M3E Squircle Pill at cx=252, cy=126) */}
        <g
          className={`gp-interactive-btn ${state.select ? 'active' : ''}`}
          onClick={() => handlePress('Button8')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <rect
            x="237"
            y="115"
            width="30"
            height="22"
            rx="11"
            fill={state.select ? accentColor : 'var(--gp-surface, #fbfaf4)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="1.8"
          />
          <rect x="246" y="121" width="7" height="5.5" rx="1.2" stroke="var(--gp-ink, #343831)" strokeWidth="1.4" fill="none" />
          <rect x="251" y="125" width="7" height="5.5" rx="1.2" stroke="var(--gp-ink, #343831)" strokeWidth="1.4" fill={state.select ? 'var(--gp-ink, #343831)' : 'var(--gp-surface, #fbfaf4)'} />
        </g>

        {/* Menu Button (M3E Squircle Pill at cx=348, cy=126) */}
        <g
          className={`gp-interactive-btn ${state.start ? 'active' : ''}`}
          onClick={() => handlePress('Button9')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <rect
            x="333"
            y="115"
            width="30"
            height="22"
            rx="11"
            fill={state.start ? accentColor : 'var(--gp-surface, #fbfaf4)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="1.8"
          />
          <line x1="342" y1="122" x2="354" y2="122" stroke="var(--gp-ink, #343831)" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="342" y1="126" x2="354" y2="126" stroke="var(--gp-ink, #343831)" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="342" y1="130" x2="354" y2="130" stroke="var(--gp-ink, #343831)" strokeWidth="1.8" strokeLinecap="round" />
        </g>

        {/* Xbox Series Dedicated Share Capsule (cx=300, cy=152) */}
        <g
          className={`gp-interactive-btn ${state.misc ? 'active' : ''}`}
          onClick={() => handlePress('Button18')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <rect
            x="286"
            y="143"
            width="28"
            height="18"
            rx="9"
            fill={state.misc ? accentColor : 'var(--gp-surface-high, #dedccf)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="1.8"
          />
          <path d="M 300 147 V 155 M 300 147 L 297 150 M 300 147 L 303 150" stroke="var(--gp-ink, #343831)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      {/* 4. Left Analog Stick (Upper-Left Primary Zone: cx=154, cy=134) */}
      <g className="gp-md3e-stick-left" transform="translate(154, 134)">
        {/* M3E Squircle-Clover Socket Basin */}
        <path
          d="M 0 -44 C 28 -44, 44 -28, 44 0 C 44 28, 28 44, 0 44 C -28 44, -44 28, -44 0 C -44 -28, -28 -44, 0 -44 Z"
          fill="var(--gp-surface-high, #dedccf)"
          stroke="var(--gp-ink, #343831)"
          strokeWidth="2"
        />
        <circle cx="0" cy="0" r="30" stroke="var(--gp-outline, #c5c8b9)" strokeWidth="1.2" strokeDasharray="4 4" />

        {/* Dynamic M3E Tension Vector Tether */}
        {(Math.abs(lx) > 0.5 || Math.abs(ly) > 0.5) && (
          <line
            x1="0"
            y1="0"
            x2={lx}
            y2={ly}
            stroke={accentColor}
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.65"
          />
        )}

        {/* Morphing Cookie/Burst Thumb Puck */}
        <g
          transform={`translate(${lx}, ${ly})`}
          filter="url(#md3eStickShadow)"
          className={`gp-stick-cap ${state.l3 ? 'clicked' : ''}`}
          onClick={() => handlePress('Button10')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d={
              state.l3
                ? 'M 0 -29 L 8 -22 L 20 -20 L 22 -8 L 29 0 L 22 8 L 20 20 L 8 22 L 0 29 L -8 22 L -20 20 L -22 8 L -29 0 L -22 -8 L -20 -20 L -8 -22 Z'
                : 'M 0 -28 C 16 -28, 28 -16, 28 0 C 28 16, 16 28, 0 28 C -16 28, -28 16, -28 0 C -28 -16, -16 -28, 0 -28 Z'
            }
            fill={state.l3 ? accentColor : 'var(--gp-surface, #fbfaf4)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <circle cx="0" cy="0" r="16" stroke="var(--gp-ink, #343831)" strokeWidth="1.5" opacity="0.45" />
          {showLabels && (
            <text x="0" y="4" textAnchor="middle" fill="var(--gp-ink, #343831)" fontSize="10.5" fontWeight="850">
              L3
            </text>
          )}
        </g>
      </g>

      {/* 5. Faceted Hybrid Octagonal D-Pad Dish (Lower-Left: cx=228, cy=220) */}
      <g className="gp-md3e-dpad" transform="translate(228, 220)">
        {/* Xbox Series / Elite Octagonal Faceted Dish */}
        <path
          d="M -18 -44 H 18 L 44 -18 V 18 L 18 44 H -18 L -44 18 V -18 Z"
          rx="8"
          fill="var(--gp-surface-high, #dedccf)"
          stroke="var(--gp-ink, #343831)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Subtle Facet Web Lines */}
        <line x1="-44" y1="-18" x2="44" y2="18" stroke="var(--gp-outline, #c5c8b9)" strokeWidth="1" opacity="0.5" />
        <line x1="-44" y1="18" x2="44" y2="-18" stroke="var(--gp-outline, #c5c8b9)" strokeWidth="1" opacity="0.5" />

        {/* Up Petal */}
        <path
          d="M -11 -37 C -11 -40, 11 -40, 11 -37 L 13 -11 L 0 -3 L -13 -11 Z"
          fill={state.dpadUp ? accentColor : 'var(--gp-surface, #fbfaf4)'}
          stroke="var(--gp-ink, #343831)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          className={`gp-interactive-btn ${state.dpadUp ? 'active' : ''}`}
          onClick={() => handlePress('Button12')}
        />
        {/* Down Petal */}
        <path
          d="M -13 11 L 0 3 L 13 11 L 11 37 C 11 40, -11 40, -11 37 Z"
          fill={state.dpadDown ? accentColor : 'var(--gp-surface, #fbfaf4)'}
          stroke="var(--gp-ink, #343831)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          className={`gp-interactive-btn ${state.dpadDown ? 'active' : ''}`}
          onClick={() => handlePress('Button13')}
        />
        {/* Left Petal */}
        <path
          d="M -37 -11 L -11 -13 L -3 0 L -11 13 L -37 11 C -40 11, -40 -11, -37 -11 Z"
          fill={state.dpadLeft ? accentColor : 'var(--gp-surface, #fbfaf4)'}
          stroke="var(--gp-ink, #343831)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          className={`gp-interactive-btn ${state.dpadLeft ? 'active' : ''}`}
          onClick={() => handlePress('Button14')}
        />
        {/* Right Petal */}
        <path
          d="M 11 -13 L 37 -11 C 40 -11, 40 11, 37 11 L 11 13 L 3 0 Z"
          fill={state.dpadRight ? accentColor : 'var(--gp-surface, #fbfaf4)'}
          stroke="var(--gp-ink, #343831)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          className={`gp-interactive-btn ${state.dpadRight ? 'active' : ''}`}
          onClick={() => handlePress('Button15')}
        />
        <circle cx="0" cy="0" r="7" fill="var(--gp-surface-high, #dedccf)" stroke="var(--gp-ink, #343831)" strokeWidth="1.4" />
      </g>

      {/* 6. Right Analog Stick (Lower-Right: cx=368, cy=220) */}
      <g className="gp-md3e-stick-right" transform="translate(368, 220)">
        <path
          d="M 0 -44 C 28 -44, 44 -28, 44 0 C 44 28, 28 44, 0 44 C -28 44, -44 28, -44 0 C -44 -28, -28 -44, 0 -44 Z"
          fill="var(--gp-surface-high, #dedccf)"
          stroke="var(--gp-ink, #343831)"
          strokeWidth="2"
        />
        <circle cx="0" cy="0" r="30" stroke="var(--gp-outline, #c5c8b9)" strokeWidth="1.2" strokeDasharray="4 4" />

        {(Math.abs(rx) > 0.5 || Math.abs(ry) > 0.5) && (
          <line
            x1="0"
            y1="0"
            x2={rx}
            y2={ry}
            stroke={accentColor}
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.65"
          />
        )}

        <g
          transform={`translate(${rx}, ${ry})`}
          filter="url(#md3eStickShadow)"
          className={`gp-stick-cap ${state.r3 ? 'clicked' : ''}`}
          onClick={() => handlePress('Button11')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d={
              state.r3
                ? 'M 0 -29 L 8 -22 L 20 -20 L 22 -8 L 29 0 L 22 8 L 20 20 L 8 22 L 0 29 L -8 22 L -20 20 L -22 8 L -29 0 L -22 -8 L -20 -20 L -8 -22 Z'
                : 'M 0 -28 C 16 -28, 28 -16, 28 0 C 28 16, 16 28, 0 28 C -16 28, -28 16, -28 0 C -28 -16, -16 -28, 0 -28 Z'
            }
            fill={state.r3 ? accentColor : 'var(--gp-surface, #fbfaf4)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <circle cx="0" cy="0" r="16" stroke="var(--gp-ink, #343831)" strokeWidth="1.5" opacity="0.45" />
          {showLabels && (
            <text x="0" y="4" textAnchor="middle" fill="var(--gp-ink, #343831)" fontSize="10.5" fontWeight="850">
              R3
            </text>
          )}
        </g>
      </g>

      {/* 7. ABXY Expressive Morphing Cluster (Upper-Right: cx=444, cy=134) */}
      <g className="gp-md3e-face-buttons" transform="translate(444, 134)">
        {/* M3E Clover Cluster Halo */}
        <path
          d="M 0 -52 C 18 -52, 26 -26, 52 0 C 26 26, 18 52, 0 52 C -18 52, -26 26, -52 0 C -26 -26, -18 -52, 0 -52 Z"
          fill="var(--gp-surface-container, #e4e2d6)"
          stroke="var(--gp-outline, #c5c8b9)"
          strokeWidth="1.4"
        />

        {/* North: Y (Soft Diamond-Gem in Warm Amber) */}
        <g
          className={`gp-interactive-btn ${state.north ? 'active' : ''}`}
          transform="translate(0, -30)"
          onClick={() => handlePress('Button3')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d={
              state.north
                ? 'M 0 -20 L 7 -14 L 17 -12 L 14 -2 L 19 7 L 9 12 L 4 20 L -4 20 L -9 12 L -19 7 L -14 -2 L -17 -12 L -7 -14 Z'
                : 'M 0 -18 C 8 -18, 18 -8, 18 0 C 18 10, 10 18, 0 18 C -10 18, -18 10, -18 0 C -18 -8, -8 -18, 0 -18 Z'
            }
            fill={state.north ? '#f5b82e' : '#faecc8'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
          />
          <text x="0" y="5.5" textAnchor="middle" fill="#5c3804" fontSize="14.5" fontWeight="900">
            Y
          </text>
        </g>

        {/* East: B (Puffy Pebble in Terracotta Coral) */}
        <g
          className={`gp-interactive-btn ${state.east ? 'active' : ''}`}
          transform="translate(30, 0)"
          onClick={() => handlePress('Button1')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d={
              state.east
                ? 'M 0 -20 C 8 -20, 12 -12, 20 -8 C 20 0, 20 8, 12 16 C 4 20, -4 20, -12 16 C -20 8, -20 0, -20 -8 C -12 -12, -8 -20, 0 -20 Z'
                : 'M -2 -17 C 11 -18, 19 -10, 19 0 C 19 10, 11 18, -2 17 C -12 16, -18 9, -18 0 C -18 -9, -12 -16, -2 -17 Z'
            }
            fill={state.east ? '#e0533c' : '#f9ded8'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
          />
          <text x="0" y="5.5" textAnchor="middle" fill={state.east ? '#ffffff' : '#7d1d28'} fontSize="14.5" fontWeight="900">
            B
          </text>
        </g>

        {/* South: A (M3E Cookie4 Primary Anchor in Fluorescent Lime / Emerald) */}
        <g
          className={`gp-interactive-btn ${state.south ? 'active' : ''}`}
          transform="translate(0, 30)"
          onClick={() => handlePress('Button0')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d="M 0 -18 C 6 -18, 10 -14, 15 -11 C 18 -6, 18 6, 15 11 C 10 14, 6 18, 0 18 C -6 18, -10 14, -15 11 C -18 6, -18 -6, -15 -11 C -10 -14, -6 -18, 0 -18 Z"
            fill={state.south ? '#c8f000' : '#e3f3c8'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.3"
          />
          <text x="0" y="5.5" textAnchor="middle" fill="#1b3a12" fontSize="15" fontWeight="900">
            A
          </text>
        </g>

        {/* West: X (M3E Squircle in Sky/Cobalt) */}
        <g
          className={`gp-interactive-btn ${state.west ? 'active' : ''}`}
          transform="translate(-30, 0)"
          onClick={() => handlePress('Button2')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d="M 0 -17.5 C 12 -17.5, 17.5 -12, 17.5 0 C 17.5 12, 12 17.5, 0 17.5 C -12 17.5, -17.5 12, -17.5 0 C -17.5 -12, -12 -17.5, 0 -17.5 Z"
            fill={state.west ? '#388bfd' : '#dceafb'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
          />
          <text x="0" y="5.5" textAnchor="middle" fill={state.west ? '#ffffff' : '#1d4ed8'} fontSize="14.5" fontWeight="900">
            X
          </text>
        </g>
      </g>
    </svg>
  )
}
