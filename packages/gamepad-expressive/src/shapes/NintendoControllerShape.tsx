import * as React from 'react'
import type { ControllerShapeProps } from './XboxControllerShape.js'

/**
 * MD3 Expressive Abstracted Nintendo Switch Pro & Joy-Con Controller Art ("神似而不求形似")
 * Distills the iconic traits from gamepad-line-art-pack (switch-pro / joy-con / joy-con-2):
 * - Dual-Capsule Asymmetric Grip Wings: Left Cool Cyan-Sage Wing + Right Warm Coral-Red Wing
 * - Translucent central technical deck with 4-Player square LED indicator strip
 * - Playful oversized geometric system tokens (- Pill, + Cross, Squircle Capture, Arch Home)
 * - Nintendo X/A/B/Y monolith cluster with A (East) as the Cookie4 confirm focal point
 */
export const NintendoControllerShape: React.FC<ControllerShapeProps> = ({
  state,
  interactive = true,
  onButtonPress,
  showLabels = true,
  accentColor = '#e60012',
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
      className={`gp-controller-svg gp-md3e-controller gp-nintendo ${className}`}
      style={style}
      role="img"
      aria-label="Nintendo Switch Controller (MD3 Expressive)"
      {...props}
    >
      <defs>
        <filter id="nsChassisShadow" x="-8%" y="-8%" width="116%" height="122%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#262b1c" floodOpacity="0.09" />
        </filter>
        <filter id="nsStickShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#1e2218" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* 1. Wide Switch Pro / Joy-Con Contoured Shoulder & ZL/ZR Deck */}
      <g className="gp-md3e-top-deck">
        {/* ZL Capsule Paddle */}
        <g
          className={`gp-interactive-btn ${state.l2 ? 'active' : ''}`}
          onClick={() => handlePress('Button6')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <rect
            x="76"
            y="16"
            width="104"
            height="28"
            rx="14"
            fill={state.l2 ? '#00b4d8' : 'var(--gp-surface-container, #e4e2d6)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2"
          />
          <text x="128" y="34" textAnchor="middle" fill="var(--gp-ink, #343831)" fontSize="11" fontWeight="850">
            ZL {Math.round(state.l2Value * 100)}%
          </text>
        </g>

        {/* ZR Capsule Paddle */}
        <g
          className={`gp-interactive-btn ${state.r2 ? 'active' : ''}`}
          onClick={() => handlePress('Button7')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <rect
            x="420"
            y="16"
            width="104"
            height="28"
            rx="14"
            fill={state.r2 ? '#e60012' : 'var(--gp-surface-container, #e4e2d6)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2"
          />
          <text
            x="472"
            y="34"
            textAnchor="middle"
            fill={state.r2 ? '#ffffff' : 'var(--gp-ink, #343831)'}
            fontSize="11"
            fontWeight="850"
          >
            ZR {Math.round(state.r2Value * 100)}%
          </text>
        </g>

        {/* L Wide Shoulder Bar */}
        <g
          className={`gp-interactive-btn ${state.l1 ? 'active' : ''}`}
          onClick={() => handlePress('Button4')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d="M 88 62 C 114 42, 178 38, 232 44 L 228 64 L 84 70 Z"
            fill={state.l1 ? '#00b4d8' : 'var(--gp-surface-high, #dedccf)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <text x="158" y="57" textAnchor="middle" fill="var(--gp-ink, #343831)" fontSize="12" fontWeight="900">
            L
          </text>
        </g>

        {/* R Wide Shoulder Bar */}
        <g
          className={`gp-interactive-btn ${state.r1 ? 'active' : ''}`}
          onClick={() => handlePress('Button5')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d="M 512 62 C 486 42, 422 38, 368 44 L 372 64 L 516 70 Z"
            fill={state.r1 ? '#e60012' : 'var(--gp-surface-high, #dedccf)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <text
            x="442"
            y="57"
            textAnchor="middle"
            fill={state.r1 ? '#ffffff' : 'var(--gp-ink, #343831)'}
            fontSize="12"
            fontWeight="900"
          >
            R
          </text>
        </g>
      </g>

      {/* 2. Abstracted Switch Pro + Joy-Con Dual-Capsule Chassis */}
      <g filter="url(#nsChassisShadow)">
        {/* Main Central Technical Deck */}
        <path
          d="M 164 50
             C 232 46, 368 46, 436 50
             C 496 54, 542 86, 558 142
             C 574 198, 560 278, 518 320
             C 482 356, 426 336, 392 268
             C 368 222, 338 214, 300 214
             C 262 214, 232 222, 208 268
             C 174 336, 118 356, 82 320
             C 40 278, 26 198, 42 142
             C 58 86, 104 54, 164 50 Z"
          fill="var(--gp-surface-container-low, #eae8de)"
          stroke="var(--gp-ink, #343831)"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />

        {/* Joy-Con L Spirit: Left Cyan-Sage Capsule Grip Wing */}
        <path
          d="M 78 106
             C 106 94, 128 118, 122 162
             C 116 210, 144 268, 184 298
             C 154 342, 108 346, 80 318
             C 40 276, 28 198, 44 142
             C 50 122, 62 112, 78 106 Z"
          fill="#d6eef2"
          stroke="var(--gp-ink, #343831)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Joy-Con R Spirit: Right Warm Coral Capsule Grip Wing */}
        <path
          d="M 522 106
             C 494 94, 472 118, 478 162
             C 484 210, 456 268, 416 298
             C 446 342, 492 346, 520 318
             C 560 276, 572 198, 556 142
             C 550 122, 538 112, 522 106 Z"
          fill="#f9dbd6"
          stroke="var(--gp-ink, #343831)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Translucent Technical Inner Ring */}
        <rect
          x="228"
          y="70"
          width="144"
          height="112"
          rx="36"
          fill="var(--gp-surface-container, #e4e2d6)"
          stroke="var(--gp-outline, #c5c8b9)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
        />
      </g>

      {/* 3. Center Playful System Tokens: - Pill, + Cross, Capture Squircle, Home Arch, 4 Player LEDs */}
      <g className="gp-md3e-center">
        {/* Minus (-) Pill Button (cx=248, cy=96) */}
        <g
          className={`gp-interactive-btn ${state.select ? 'active' : ''}`}
          onClick={() => handlePress('Button8')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <rect
            x="234"
            y="89"
            width="28"
            height="14"
            rx="7"
            fill={state.select ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface, #fbfaf4)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2"
          />
        </g>

        {/* Plus (+) Sculpted Cross Button (cx=352, cy=96) */}
        <g
          className={`gp-interactive-btn ${state.start ? 'active' : ''}`}
          onClick={() => handlePress('Button9')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d="M 347 84 H 357 V 91 H 364 V 101 H 357 V 108 H 347 V 101 H 340 V 91 H 347 Z"
            fill={state.start ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface, #fbfaf4)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </g>

        {/* Capture Button (M3E Squircle + Inner Shutter Circle: cx=268, cy=142) */}
        <g
          className={`gp-interactive-btn ${state.misc ? 'active' : ''}`}
          onClick={() => handlePress('Button18')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <rect
            x="255"
            y="129"
            width="26"
            height="26"
            rx="8"
            fill={state.misc ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface, #fbfaf4)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2"
          />
          <circle cx="268" cy="142" r="5.5" fill="var(--gp-ink, #343831)" />
        </g>

        {/* Home Button (M3E Arch Circle + House Icon: cx=332, cy=142) */}
        <g
          className={`gp-interactive-btn ${state.guide ? 'active' : ''}`}
          onClick={() => handlePress('Button16')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <circle
            cx="332"
            cy="142"
            r="14"
            fill={state.guide ? '#00b4d8' : 'var(--gp-surface, #fbfaf4)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2"
          />
          <path d="M 332 135 L 325 141 V 148 H 330 V 144 H 334 V 148 H 339 V 141 Z" fill="var(--gp-ink, #343831)" />
        </g>

        {/* 4-Player Square LED Strip at Bridge Base */}
        <rect x="275" y="196" width="8" height="5" rx="2" fill="#c8f000" stroke="var(--gp-ink, #343831)" strokeWidth="1.2" />
        <rect x="289" y="196" width="8" height="5" rx="2" fill="var(--gp-surface, #fbfaf4)" stroke="var(--gp-outline, #c5c8b9)" strokeWidth="1.2" />
        <rect x="303" y="196" width="8" height="5" rx="2" fill="var(--gp-surface, #fbfaf4)" stroke="var(--gp-outline, #c5c8b9)" strokeWidth="1.2" />
        <rect x="317" y="196" width="8" height="5" rx="2" fill="var(--gp-surface, #fbfaf4)" stroke="var(--gp-outline, #c5c8b9)" strokeWidth="1.2" />
      </g>

      {/* 4. Left Analog Stick (Upper-Left: cx=156, cy=134) */}
      <g className="gp-md3e-stick-left" transform="translate(156, 134)">
        <circle cx="0" cy="0" r="42" fill="var(--gp-surface-high, #dedccf)" stroke="var(--gp-ink, #343831)" strokeWidth="2" />
        {(Math.abs(lx) > 0.5 || Math.abs(ly) > 0.5) && (
          <line x1="0" y1="0" x2={lx} y2={ly} stroke="#00b4d8" strokeWidth="8" strokeLinecap="round" opacity="0.65" />
        )}
        <g
          transform={`translate(${lx}, ${ly})`}
          filter="url(#nsStickShadow)"
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
            fill={state.l3 ? '#00b4d8' : 'var(--gp-surface, #fbfaf4)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
          />
          <circle cx="0" cy="0" r="17" stroke="var(--gp-ink, #343831)" strokeWidth="1.5" opacity="0.45" />
          {showLabels && (
            <text x="0" y="4" textAnchor="middle" fill="var(--gp-ink, #343831)" fontSize="10.5" fontWeight="850">
              L3
            </text>
          )}
        </g>
      </g>

      {/* 5. Sculpted Cross D-Pad (Lower-Left: cx=226, cy=220) */}
      <g className="gp-md3e-dpad" transform="translate(226, 220)">
        <circle cx="0" cy="0" r="42" fill="var(--gp-surface-high, #dedccf)" stroke="var(--gp-ink, #343831)" strokeWidth="2" />
        {/* Up */}
        <path
          d="M -11 -35 H 11 V -11 L 0 -2 L -11 -11 Z"
          fill={state.dpadUp ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface, #fbfaf4)'}
          stroke="var(--gp-ink, #343831)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          className={`gp-interactive-btn ${state.dpadUp ? 'active' : ''}`}
          onClick={() => handlePress('Button12')}
        />
        {/* Down */}
        <path
          d="M -11 11 L 0 2 L 11 11 V 35 H -11 Z"
          fill={state.dpadDown ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface, #fbfaf4)'}
          stroke="var(--gp-ink, #343831)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          className={`gp-interactive-btn ${state.dpadDown ? 'active' : ''}`}
          onClick={() => handlePress('Button13')}
        />
        {/* Left */}
        <path
          d="M -35 -11 H -11 L -2 0 L -11 11 H -35 Z"
          fill={state.dpadLeft ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface, #fbfaf4)'}
          stroke="var(--gp-ink, #343831)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          className={`gp-interactive-btn ${state.dpadLeft ? 'active' : ''}`}
          onClick={() => handlePress('Button14')}
        />
        {/* Right */}
        <path
          d="M 11 -11 H 35 V 11 H 11 L 2 0 Z"
          fill={state.dpadRight ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface, #fbfaf4)'}
          stroke="var(--gp-ink, #343831)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          className={`gp-interactive-btn ${state.dpadRight ? 'active' : ''}`}
          onClick={() => handlePress('Button15')}
        />
      </g>

      {/* 6. Right Analog Stick (Lower-Right: cx=368, cy=220) */}
      <g className="gp-md3e-stick-right" transform="translate(368, 220)">
        <circle cx="0" cy="0" r="42" fill="var(--gp-surface-high, #dedccf)" stroke="var(--gp-ink, #343831)" strokeWidth="2" />
        {(Math.abs(rx) > 0.5 || Math.abs(ry) > 0.5) && (
          <line x1="0" y1="0" x2={rx} y2={ry} stroke="#e60012" strokeWidth="8" strokeLinecap="round" opacity="0.65" />
        )}
        <g
          transform={`translate(${rx}, ${ry})`}
          filter="url(#nsStickShadow)"
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
            fill={state.r3 ? '#e60012' : 'var(--gp-surface, #fbfaf4)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
          />
          <circle cx="0" cy="0" r="17" stroke="var(--gp-ink, #343831)" strokeWidth="1.5" opacity="0.45" />
          {showLabels && (
            <text
              x="0"
              y="4"
              textAnchor="middle"
              fill={state.r3 ? '#ffffff' : 'var(--gp-ink, #343831)'}
              fontSize="10.5"
              fontWeight="850"
            >
              R3
            </text>
          )}
        </g>
      </g>

      {/* 7. Nintendo X / A / B / Y Expressive Monolith Cluster (cx=444, cy=134) */}
      <g className="gp-md3e-face-buttons" transform="translate(444, 134)">
        <circle cx="0" cy="0" r="48" fill="var(--gp-surface-container, #e4e2d6)" stroke="var(--gp-outline, #c5c8b9)" strokeWidth="1.4" />

        {/* North: X (Squircle in Cool Cyan) */}
        <g
          className={`gp-interactive-btn ${state.north ? 'active' : ''}`}
          transform="translate(0, -30)"
          onClick={() => handlePress('Button3')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <rect
            x="-17"
            y="-17"
            width="34"
            height="34"
            rx="12"
            fill={state.north ? '#00b4d8' : 'var(--gp-surface, #fbfaf4)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
          />
          <text x="0" y="5.5" textAnchor="middle" fill="var(--gp-ink, #343831)" fontSize="14.5" fontWeight="900">
            X
          </text>
        </g>

        {/* East: A (Nintendo Primary Confirm — M3E Cookie4 in Coral Red) */}
        <g
          className={`gp-interactive-btn ${state.east ? 'active' : ''}`}
          transform="translate(30, 0)"
          onClick={() => handlePress('Button1')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <path
            d="M 0 -18 C 6 -18, 10 -14, 15 -11 C 18 -6, 18 6, 15 11 C 10 14, 6 18, 0 18 C -6 18, -10 14, -15 11 C -18 6, -18 -6, -15 -11 C -10 -14, -6 -18, 0 -18 Z"
            fill={state.east ? '#e60012' : '#fadad8'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.3"
          />
          <text x="0" y="5.5" textAnchor="middle" fill={state.east ? '#ffffff' : '#9f1219'} fontSize="15" fontWeight="900">
            A
          </text>
        </g>

        {/* South: B (M3E Squircle in Fluorescent Lime / Warm Paper) */}
        <g
          className={`gp-interactive-btn ${state.south ? 'active' : ''}`}
          transform="translate(0, 30)"
          onClick={() => handlePress('Button0')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <rect
            x="-17"
            y="-17"
            width="34"
            height="34"
            rx="12"
            fill={state.south ? '#c8f000' : 'var(--gp-surface, #fbfaf4)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
          />
          <text x="0" y="5.5" textAnchor="middle" fill="var(--gp-ink, #343831)" fontSize="14.5" fontWeight="900">
            B
          </text>
        </g>

        {/* West: Y (M3E Squircle) */}
        <g
          className={`gp-interactive-btn ${state.west ? 'active' : ''}`}
          transform="translate(-30, 0)"
          onClick={() => handlePress('Button2')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          <rect
            x="-17"
            y="-17"
            width="34"
            height="34"
            rx="12"
            fill={state.west ? '#00b4d8' : 'var(--gp-surface, #fbfaf4)'}
            stroke="var(--gp-ink, #343831)"
            strokeWidth="2.2"
          />
          <text x="0" y="5.5" textAnchor="middle" fill="var(--gp-ink, #343831)" fontSize="14.5" fontWeight="900">
            Y
          </text>
        </g>
      </g>
    </svg>
  )
}
