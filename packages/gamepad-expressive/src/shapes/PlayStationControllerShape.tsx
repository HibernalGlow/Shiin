import * as React from 'react'
import type { ControllerShapeProps } from './XboxControllerShape.js'

/**
 * MD3 Expressive Abstracted PlayStation DualSense / Edge Controller Art ("神似而不求形似")
 * Distills the iconic traits from gamepad-line-art-pack (dualsense / dualsense-edge / dualshock-4):
 * - Two-tone split armor: bright outer wings tapering into sharp pointed DualSense grip tips
 * - Darker tonal inner core housing the symmetrical twin analog pods
 * - Floating central trapezoidal squircle Touchpad flanked by glowing Lightbar slits
 * - 4 separate inward-pointing Wedge-Petal D-pad buttons
 * - Sacred Geometry M3E Face Buttons: Wedge (△), Cookie-Orb (○), Clover-X (✕), Squircle (□)
 */
export const PlayStationControllerShape: React.FC<ControllerShapeProps> = ({
  state,
  interactive = true,
  onButtonPress,
  showLabels = true,
  accentColor = '#38bdf8',
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
      className={`gp-controller-svg gp-md3e-controller gp-playstation ${className}`}
      style={style}
      role="img"
      aria-label="PlayStation Controller (MD3 Expressive)"
      {...props}
    >
      <defs>
        <filter id="psChassisShadow" x="-8%" y="-8%" width="116%" height="122%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#262b1c" floodOpacity="0.09" />
        </filter>
        <filter id="psStickShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#1e2218" floodOpacity="0.18" />
        </filter>
        <clipPath id="psL2Clip">
          <path d="M 92 46 C 102 18, 148 12, 190 22 L 198 52 L 86 56 Z" />
        </clipPath>
        <clipPath id="psR2Clip">
          <path d="M 508 46 C 498 18, 452 12, 410 22 L 402 52 L 514 56 Z" />
        </clipPath>
      </defs>

      {/* 1. Contoured Adaptive Trigger Paddles & L1/R1 Shoulder Wings */}
      <g className="gp-md3e-top-deck">
        {/* L2 Adaptive Trigger Paddle */}
        <g
          className={`gp-interactive-btn ${state.l2 ? 'active' : ''}`}
          onClick={() => handlePress('Button6')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d="M 92 46 C 102 18, 148 12, 190 22 L 198 52 L 86 56 Z"
            fill="var(--gp-surface-container, #e4e2d6)"
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <g clipPath="url(#psL2Clip)">
            <rect
              x="86"
              y="12"
              width={Math.max(0, Math.min(114, state.l2Value * 114))}
              height="46"
              fill={state.l2 ? 'var(--gp-primary, #c8f000)' : '#bae6fd'}
              className="gp-trigger-fill"
            />
          </g>
          <text x="142" y="36" textAnchor="middle" fill="var(--gp-ink, #343831)" fontSize="10.5" fontWeight="850">
            L2 {Math.round(state.l2Value * 100)}%
          </text>
        </g>

        {/* R2 Adaptive Trigger Paddle */}
        <g
          className={`gp-interactive-btn ${state.r2 ? 'active' : ''}`}
          onClick={() => handlePress('Button7')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d="M 508 46 C 498 18, 452 12, 410 22 L 402 52 L 514 56 Z"
            fill="var(--gp-surface-container, #e4e2d6)"
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <g clipPath="url(#psR2Clip)">
            <rect
              x={514 - Math.max(0, Math.min(114, state.r2Value * 114))}
              y="12"
              width={Math.max(0, Math.min(114, state.r2Value * 114))}
              height="46"
              fill={state.r2 ? 'var(--gp-primary, #c8f000)' : '#bae6fd'}
              className="gp-trigger-fill"
            />
          </g>
          <text x="458" y="36" textAnchor="middle" fill="var(--gp-ink, #343831)" fontSize="10.5" fontWeight="850">
            R2 {Math.round(state.r2Value * 100)}%
          </text>
        </g>

        {/* L1 Wing Bumper */}
        <g
          className={`gp-interactive-btn ${state.l1 ? 'active' : ''}`}
          onClick={() => handlePress('Button4')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d="M 96 64 C 122 44, 166 40, 202 48 L 198 68 L 90 74 Z"
            fill={state.l1 ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface-high, #dedccf)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <text x="150" y="59" textAnchor="middle" fill="var(--gp-ink, #343831)" fontSize="11.5" fontWeight="900">
            L1
          </text>
        </g>

        {/* R1 Wing Bumper */}
        <g
          className={`gp-interactive-btn ${state.r1 ? 'active' : ''}`}
          onClick={() => handlePress('Button5')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d="M 504 64 C 478 44, 434 40, 398 48 L 402 68 L 510 74 Z"
            fill={state.r1 ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface-high, #dedccf)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <text x="450" y="59" textAnchor="middle" fill="var(--gp-ink, #343831)" fontSize="11.5" fontWeight="900">
            R1
          </text>
        </g>
      </g>

      {/* 2. DualSense Two-Tone Split Armor Chassis (Pointed Outer Wings + Dark Tonal Inner Core) */}
      <g filter="url(#psChassisShadow)">
        {/* Inner Dark-Tonal Core & Symmetrical Lower Bridge */}
        <path
          d="M 184 56
             H 416
             L 458 188
             L 510 334
             C 484 352, 446 336, 412 284
             C 388 248, 356 244, 300 244
             C 244 244, 212 248, 188 284
             C 154 336, 116 352, 90 334
             L 142 188 Z"
          fill="var(--gp-surface-high, #dedccf)"
          stroke="var(--gp-ink, #343831)"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />

        {/* Left Bright Sculpted Wing (Tapering to DualSense Pointed Grip Tip) */}
        <path
          d="M 196 52
             C 134 54, 82 78, 56 132
             C 30 186, 40 268, 76 332
             C 82 342, 94 342, 102 330
             C 132 252, 164 156, 196 52 Z"
          fill="var(--gp-surface, #fbfaf4)"
          stroke="var(--gp-ink, #343831)"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />

        {/* Right Bright Sculpted Wing (Tapering to DualSense Pointed Grip Tip) */}
        <path
          d="M 404 52
             C 466 54, 518 78, 544 132
             C 570 186, 560 268, 524 332
             C 518 342, 506 342, 498 330
             C 468 252, 436 156, 404 52 Z"
          fill="var(--gp-surface, #fbfaf4)"
          stroke="var(--gp-ink, #343831)"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />

        {/* Symmetrical Twin Stick Unified Tonal Pill Bridge */}
        <rect
          x="174"
          y="182"
          width="252"
          height="96"
          rx="48"
          fill="var(--gp-surface-container, #e4e2d6)"
          stroke="var(--gp-ink, #343831)"
          strokeWidth="2"
        />
      </g>

      {/* 3. Center Section: Floating Trapezoidal Touchpad + Lightbar Slits + Create/Options/PS */}
      <g className="gp-md3e-center">
        {/* DualSense Lightbar Accent Slits Flanking the Touchpad */}
        <path
          d="M 196 60 L 212 138"
          stroke={state.touchpad || state.guide ? '#c8f000' : '#38bdf8'}
          strokeWidth="4.5"
          strokeLinecap="round"
          className="gp-lightbar-halo"
        />
        <path
          d="M 404 60 L 388 138"
          stroke={state.touchpad || state.guide ? '#c8f000' : '#38bdf8'}
          strokeWidth="4.5"
          strokeLinecap="round"
          className="gp-lightbar-halo"
        />

        {/* Sculpted Trapezoidal Squircle Touchpad */}
        <g
          className={`gp-interactive-btn ${state.touchpad ? 'active' : ''}`}
          onClick={() => handlePress('Button17')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d="M 208 50
               H 392
               C 400 50, 404 56, 402 64
               L 386 128
               C 384 136, 376 140, 368 140
               H 232
               C 224 140, 216 136, 214 128
               L 198 64
               C 196 56, 200 50, 208 50 Z"
            fill={state.touchpad ? 'var(--gp-primary-container, #e7f6a8)' : 'var(--gp-surface, #fbfaf4)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          {/* Subtle M3E Micro-Dot Texture & Speaker Grille */}
          <circle cx="288" cy="156" r="2" fill="var(--gp-ink, #343831)" opacity="0.5" />
          <circle cx="300" cy="156" r="2" fill="var(--gp-ink, #343831)" opacity="0.5" />
          <circle cx="312" cy="156" r="2" fill="var(--gp-ink, #343831)" opacity="0.5" />
          <text
            x="300"
            y="98"
            textAnchor="middle"
            fill="var(--gp-muted, #5c6054)"
            fontSize="10"
            fontWeight="800"
            letterSpacing="2"
          >
            TOUCHPAD
          </text>
        </g>

        {/* Create Button (Tilted M3E Pill at Left Collar: 176, 76) */}
        <g
          className={`gp-interactive-btn ${state.select ? 'active' : ''}`}
          onClick={() => handlePress('Button8')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <rect
            x="166"
            y="62"
            width="18"
            height="28"
            rx="9"
            transform="rotate(-14 175 76)"
            fill={state.select ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface-container, #e4e2d6)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="1.8"
          />
        </g>

        {/* Options Button (Tilted M3E Pill at Right Collar: 424, 76) */}
        <g
          className={`gp-interactive-btn ${state.start ? 'active' : ''}`}
          onClick={() => handlePress('Button9')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <rect
            x="416"
            y="62"
            width="18"
            height="28"
            rx="9"
            transform="rotate(14 425 76)"
            fill={state.start ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface-container, #e4e2d6)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="1.8"
          />
        </g>

        {/* PS Center Emblem (M3E Gem-Pill between Sticks: cx=300, cy=214) */}
        <g
          className={`gp-interactive-btn ${state.guide ? 'active' : ''}`}
          onClick={() => handlePress('Button16')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d="M 300 196 C 312 196, 318 202, 318 214 C 318 226, 312 232, 300 232 C 288 232, 282 226, 282 214 C 282 202, 288 196, 300 196 Z"
            fill={state.guide ? '#38bdf8' : 'var(--gp-surface, #fbfaf4)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
          />
          <text x="300" y="218" textAnchor="middle" fill="var(--gp-ink, #343831)" fontSize="10" fontWeight="900">
            PS
          </text>
        </g>

        {/* Mic Mute Pill (cx=300, cy=252) */}
        <g
          className={`gp-interactive-btn ${state.misc ? 'active' : ''}`}
          onClick={() => handlePress('Button18')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <rect
            x="290"
            y="247"
            width="20"
            height="9"
            rx="4.5"
            fill={state.misc ? '#f59e0b' : 'var(--gp-surface, #fbfaf4)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="1.6"
          />
        </g>
      </g>

      {/* 4. PlayStation Split 4-Wedge D-Pad (Upper-Left Wing: cx=140, cy=136) */}
      <g className="gp-md3e-dpad" transform="translate(140, 136)">
        <circle cx="0" cy="0" r="46" fill="var(--gp-surface-container-low, #eae8de)" stroke="var(--gp-outline, #c5c8b9)" strokeWidth="1.4" />

        {/* Up Wedge Petal */}
        <path
          d="M -13 -38 C -13 -42, 13 -42, 13 -38 L 11 -14 L 0 -5 L -11 -14 Z"
          fill={state.dpadUp ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface, #fbfaf4)'}
          stroke="var(--gp-ink, #343831)"
          strokeWidth="2"
          strokeLinejoin="round"
          className={`gp-interactive-btn ${state.dpadUp ? 'active' : ''}`}
          onClick={() => handlePress('Button12')}
        />
        {/* Down Wedge Petal */}
        <path
          d="M -11 14 L 0 5 L 11 14 L 13 38 C 13 42, -13 42, -13 38 Z"
          fill={state.dpadDown ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface, #fbfaf4)'}
          stroke="var(--gp-ink, #343831)"
          strokeWidth="2"
          strokeLinejoin="round"
          className={`gp-interactive-btn ${state.dpadDown ? 'active' : ''}`}
          onClick={() => handlePress('Button13')}
        />
        {/* Left Wedge Petal */}
        <path
          d="M -38 -13 L -14 -11 L -5 0 L -14 11 L -38 13 C -42 13, -42 -13, -38 -13 Z"
          fill={state.dpadLeft ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface, #fbfaf4)'}
          stroke="var(--gp-ink, #343831)"
          strokeWidth="2"
          strokeLinejoin="round"
          className={`gp-interactive-btn ${state.dpadLeft ? 'active' : ''}`}
          onClick={() => handlePress('Button14')}
        />
        {/* Right Wedge Petal */}
        <path
          d="M 14 -11 L 38 -13 C 42 -13, 42 13, 38 13 L 14 11 L 5 0 Z"
          fill={state.dpadRight ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface, #fbfaf4)'}
          stroke="var(--gp-ink, #343831)"
          strokeWidth="2"
          strokeLinejoin="round"
          className={`gp-interactive-btn ${state.dpadRight ? 'active' : ''}`}
          onClick={() => handlePress('Button15')}
        />
      </g>

      {/* 5. Symmetrical Twin Sticks (Left: 224, 230 | Right: 376, 230) */}
      <g className="gp-md3e-stick-left" transform="translate(224, 230)">
        <circle cx="0" cy="0" r="40" fill="var(--gp-surface-high, #dedccf)" stroke="var(--gp-ink, #343831)" strokeWidth="2" />
        {(Math.abs(lx) > 0.5 || Math.abs(ly) > 0.5) && (
          <line x1="0" y1="0" x2={lx} y2={ly} stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" opacity="0.65" />
        )}
        <g
          transform={`translate(${lx}, ${ly})`}
          filter="url(#psStickShadow)"
          className={`gp-stick-cap ${state.l3 ? 'clicked' : ''}`}
          onClick={() => handlePress('Button10')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d={
              state.l3
                ? 'M 0 -28 L 8 -21 L 19 -19 L 21 -8 L 28 0 L 21 8 L 19 19 L 8 21 L 0 28 L -8 21 L -19 19 L -21 8 L -28 0 L -21 -8 L -19 -19 L -8 -21 Z'
                : 'M 0 -27 C 15 -27, 27 -15, 27 0 C 27 15, 15 27, 0 27 C -15 27, -27 15, -27 0 C -27 -15, -15 -27, 0 -27 Z'
            }
            fill={state.l3 ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface, #fbfaf4)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
          />
          <circle cx="0" cy="0" r="16" stroke="var(--gp-ink, #343831)" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />
          {showLabels && (
            <text x="0" y="4" textAnchor="middle" fill="var(--gp-ink, #343831)" fontSize="10.5" fontWeight="850">
              L3
            </text>
          )}
        </g>
      </g>

      <g className="gp-md3e-stick-right" transform="translate(376, 230)">
        <circle cx="0" cy="0" r="40" fill="var(--gp-surface-high, #dedccf)" stroke="var(--gp-ink, #343831)" strokeWidth="2" />
        {(Math.abs(rx) > 0.5 || Math.abs(ry) > 0.5) && (
          <line x1="0" y1="0" x2={rx} y2={ry} stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" opacity="0.65" />
        )}
        <g
          transform={`translate(${rx}, ${ry})`}
          filter="url(#psStickShadow)"
          className={`gp-stick-cap ${state.r3 ? 'clicked' : ''}`}
          onClick={() => handlePress('Button11')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d={
              state.r3
                ? 'M 0 -28 L 8 -21 L 19 -19 L 21 -8 L 28 0 L 21 8 L 19 19 L 8 21 L 0 28 L -8 21 L -19 19 L -21 8 L -28 0 L -21 -8 L -19 -19 L -8 -21 Z'
                : 'M 0 -27 C 15 -27, 27 -15, 27 0 C 27 15, 15 27, 0 27 C -15 27, -27 15, -27 0 C -27 -15, -15 -27, 0 -27 Z'
            }
            fill={state.r3 ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface, #fbfaf4)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
          />
          <circle cx="0" cy="0" r="16" stroke="var(--gp-ink, #343831)" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />
          {showLabels && (
            <text x="0" y="4" textAnchor="middle" fill="var(--gp-ink, #343831)" fontSize="10.5" fontWeight="850">
              R3
            </text>
          )}
        </g>
      </g>

      {/* 6. Sacred Geometry M3E Face Buttons (Upper-Right Wing: cx=460, cy=136) */}
      <g className="gp-md3e-face-buttons" transform="translate(460, 136)">
        <circle cx="0" cy="0" r="48" fill="var(--gp-surface-container-low, #eae8de)" stroke="var(--gp-outline, #c5c8b9)" strokeWidth="1.4" />

        {/* North: Triangle △ (M3E Soft Rounded Wedge-Triangle Container) */}
        <g
          className={`gp-interactive-btn ${state.north ? 'active' : ''}`}
          transform="translate(0, -30)"
          onClick={() => handlePress('Button3')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d="M 0 -18 C 6 -18, 18 4, 17 12 C 16 17, 9 18, 0 18 C -9 18, -16 17, -17 12 C -18 4, -6 -18, 0 -18 Z"
            fill={state.north ? '#3fb950' : '#dcf4e1'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
          />
          <path d="M 0 -8 L 7.5 7 H -7.5 Z" stroke="#14532d" strokeWidth="2.4" strokeLinejoin="round" fill="none" />
        </g>

        {/* East: Circle ○ (M3E Scalloped Cookie8 Orb Container) */}
        <g
          className={`gp-interactive-btn ${state.east ? 'active' : ''}`}
          transform="translate(30, 0)"
          onClick={() => handlePress('Button1')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d="M 0 -18 C 11 -18, 18 -11, 18 0 C 18 11, 11 18, 0 18 C -11 18, -18 11, -18 0 C -18 -11, -11 -18, 0 -18 Z"
            fill={state.east ? '#f85149' : '#f9ded8'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
          />
          <circle cx="0" cy="0" r="7" stroke={state.east ? '#ffffff' : '#991b1b'} strokeWidth="2.6" fill="none" />
        </g>

        {/* South: Cross ✕ (M3E 4-Petal Diagonal Clover Container echoing ✕) */}
        <g
          className={`gp-interactive-btn ${state.south ? 'active' : ''}`}
          transform="translate(0, 30)"
          onClick={() => handlePress('Button0')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d="M 0 -15 C 5 -15, 9 -19, 14 -14 C 19 -9, 15 -5, 15 0 C 15 5, 19 9, 14 14 C 9 19, 5 15, 0 15 C -5 15, -9 19, -14 14 C -19 9, -15 5, -15 0 C -15 -5, -19 -9, -14 -14 C -9 -19, -5 -15, 0 -15 Z"
            fill={state.south ? '#58a6ff' : '#dceafb'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
          />
          <path d="M -6 -6 L 6 6 M 6 -6 L -6 6" stroke="#1e3a8a" strokeWidth="2.8" strokeLinecap="round" />
        </g>

        {/* West: Square □ (M3E Superellipse Squircle Container) */}
        <g
          className={`gp-interactive-btn ${state.west ? 'active' : ''}`}
          transform="translate(-30, 0)"
          onClick={() => handlePress('Button2')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d="M 0 -17.5 C 13 -17.5, 17.5 -13, 17.5 0 C 17.5 13, 13 17.5, 0 17.5 C -13 17.5, -17.5 13, -17.5 0 C -17.5 -13, -13 -17.5, 0 -17.5 Z"
            fill={state.west ? '#ec4899' : '#fae0ee'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
          />
          <rect x="-6.5" y="-6.5" width="13" height="13" rx="2.5" stroke={state.west ? '#ffffff' : '#9d174d'} strokeWidth="2.5" fill="none" />
        </g>
      </g>
    </svg>
  )
}
