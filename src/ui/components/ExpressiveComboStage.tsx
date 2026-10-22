import * as React from 'react'
import {
  detectController,
  GamepadButtonIcon,
  type ControllerFamily,
} from '@hibernalglow/gamepad-expressive'
import type { GamepadDeviceInfo } from '../../core/types.js'

export interface ExpressiveComboStageProps {
  activeDevice?: GamepadDeviceInfo
  comboKeys: string[]
  liveRecordingKeys: string[]
  recordingCombo: boolean
  buttons: boolean[]
  axes: number[]
  locale: string
}

interface AbstractKeyNode {
  key: string
  cx: number
  cy: number
  zone: 'shoulder' | 'dpad' | 'stick' | 'center' | 'face'
  labelXbox: string
  labelPs: string
  labelNs: string
  restPath: string
  activePath: string
  restFill?: string
}

/**
 * M3E Expressive Geometric Paths (centered at 0,0)
 * Each key category has a distinct resting M3E silhouette and morphs into a burst/cookie when active.
 */
const SHAPE_WING_LEFT =
  'M -24 4 C -22 -8, -8 -12, 18 -10 C 24 -9, 26 -4, 24 4 C 22 10, 12 11, -18 11 C -23 11, -25 8, -24 4 Z'
const SHAPE_WING_RIGHT =
  'M 24 4 C 22 -8, 8 -12, -18 -10 C -24 -9, -26 -4, -24 4 C -22 10, -12 11, 18 11 C 23 11, 25 8, 24 4 Z'
const SHAPE_WING_ACTIVE =
  'M -26 0 C -26 -9, -14 -14, 0 -12 C 14 -14, 26 -9, 26 0 C 26 9, 14 14, 0 12 C -14 14, -26 9, -26 0 Z'

const SHAPE_SQUIRCLE =
  'M 0 -15 C 11 -15, 15 -11, 15 0 C 15 11, 11 15, 0 15 C -11 15, -15 11, -15 0 C -15 -11, -11 -15, 0 -15 Z'
const SHAPE_PEBBLE =
  'M -1 -15 C 10 -16, 16 -9, 16 0 C 16 9, 10 16, -1 15 C -10 14, -15 8, -15 0 C -15 -8, -10 -14, -1 -15 Z'
const SHAPE_GEM =
  'M 0 -16 C 7 -16, 16 -7, 16 0 C 16 9, 9 16, 0 16 C -9 16, -16 9, -16 0 C -16 -7, -7 -16, 0 -16 Z'
const SHAPE_COOKIE4 =
  'M 0 -16 C 5 -16, 9 -12, 13 -9 C 16 -5, 16 5, 13 9 C 9 12, 5 16, 0 16 C -5 16, -9 12, -13 9 C -16 5, -16 -5, -13 -9 C -9 -12, -5 -16, 0 -16 Z'
const SHAPE_BURST8 =
  'M 0 -18 L 5 -13 L 13 -13 L 13 -5 L 18 0 L 13 5 L 13 13 L 5 13 L 0 18 L -5 13 L -13 13 L -13 5 L -18 0 L -13 -5 L -13 -13 L -5 -13 Z'

const SHAPE_DPAD_UP = 'M -8 -13 C -8 -16, 8 -16, 8 -13 L 9 6 L 0 13 L -9 6 Z'
const SHAPE_DPAD_DOWN = 'M -9 -6 L 0 -13 L 9 -6 L 8 13 C 8 16, -8 16, -8 13 Z'
const SHAPE_DPAD_LEFT = 'M -13 -8 L 6 -9 L 13 0 L 6 9 L -13 8 C -16 8, -16 -8, -13 -8 Z'
const SHAPE_DPAD_RIGHT = 'M -6 -9 L 13 -8 C 16 -8, 16 8, 13 8 L -6 9 L -13 0 Z'

const SHAPE_PILL_SM =
  'M -13 -8 H 13 C 17 -8, 17 8, 13 8 H -13 C -17 8, -17 -8, -13 -8 Z'

const KEY_NODES: readonly AbstractKeyNode[] = [
  // Top Left Wing: LT & LB
  {
    key: 'Button6',
    cx: 56,
    cy: 26,
    zone: 'shoulder',
    labelXbox: 'LT',
    labelPs: 'L2',
    labelNs: 'ZL',
    restPath: SHAPE_WING_LEFT,
    activePath: SHAPE_WING_ACTIVE,
  },
  {
    key: 'Button4',
    cx: 122,
    cy: 24,
    zone: 'shoulder',
    labelXbox: 'LB',
    labelPs: 'L1',
    labelNs: 'L',
    restPath: SHAPE_WING_LEFT,
    activePath: SHAPE_WING_ACTIVE,
  },
  // Top Right Wing: RB & RT
  {
    key: 'Button5',
    cx: 298,
    cy: 24,
    zone: 'shoulder',
    labelXbox: 'RB',
    labelPs: 'R1',
    labelNs: 'R',
    restPath: SHAPE_WING_RIGHT,
    activePath: SHAPE_WING_ACTIVE,
  },
  {
    key: 'Button7',
    cx: 364,
    cy: 26,
    zone: 'shoulder',
    labelXbox: 'RT',
    labelPs: 'R2',
    labelNs: 'ZR',
    restPath: SHAPE_WING_RIGHT,
    activePath: SHAPE_WING_ACTIVE,
  },

  // Center System Triad: View/Create/-, Guide/PS/Home, Menu/Options/+
  {
    key: 'Button8',
    cx: 174,
    cy: 58,
    zone: 'center',
    labelXbox: 'View',
    labelPs: 'Create',
    labelNs: '-',
    restPath: SHAPE_PILL_SM,
    activePath: SHAPE_COOKIE4,
  },
  {
    key: 'Button16',
    cx: 210,
    cy: 50,
    zone: 'center',
    labelXbox: 'Guide',
    labelPs: 'PS',
    labelNs: 'Home',
    restPath: SHAPE_COOKIE4,
    activePath: SHAPE_BURST8,
  },
  {
    key: 'Button9',
    cx: 246,
    cy: 58,
    zone: 'center',
    labelXbox: 'Menu',
    labelPs: 'Opt',
    labelNs: '+',
    restPath: SHAPE_PILL_SM,
    activePath: SHAPE_COOKIE4,
  },

  // Left Kinetic Domain: L3 Orb & Clover D-Pad
  {
    key: 'Button10',
    cx: 66,
    cy: 76,
    zone: 'stick',
    labelXbox: 'L3',
    labelPs: 'L3',
    labelNs: 'L3',
    restPath: SHAPE_COOKIE4,
    activePath: SHAPE_BURST8,
  },
  {
    key: 'Button12',
    cx: 132,
    cy: 78,
    zone: 'dpad',
    labelXbox: '↑',
    labelPs: '↑',
    labelNs: '↑',
    restPath: SHAPE_DPAD_UP,
    activePath: SHAPE_COOKIE4,
  },
  {
    key: 'Button13',
    cx: 132,
    cy: 126,
    zone: 'dpad',
    labelXbox: '↓',
    labelPs: '↓',
    labelNs: '↓',
    restPath: SHAPE_DPAD_DOWN,
    activePath: SHAPE_COOKIE4,
  },
  {
    key: 'Button14',
    cx: 106,
    cy: 102,
    zone: 'dpad',
    labelXbox: '←',
    labelPs: '←',
    labelNs: '←',
    restPath: SHAPE_DPAD_LEFT,
    activePath: SHAPE_COOKIE4,
  },
  {
    key: 'Button15',
    cx: 158,
    cy: 102,
    zone: 'dpad',
    labelXbox: '→',
    labelPs: '→',
    labelNs: '→',
    restPath: SHAPE_DPAD_RIGHT,
    activePath: SHAPE_COOKIE4,
  },

  // Right Expressive Action Domain: R3 Orb & 4-Petal Action Cluster
  {
    key: 'Button11',
    cx: 266,
    cy: 118,
    zone: 'stick',
    labelXbox: 'R3',
    labelPs: 'R3',
    labelNs: 'R3',
    restPath: SHAPE_COOKIE4,
    activePath: SHAPE_BURST8,
  },
  {
    key: 'Button3',
    cx: 344,
    cy: 62,
    zone: 'face',
    labelXbox: 'Y',
    labelPs: '△',
    labelNs: 'X',
    restPath: SHAPE_GEM,
    activePath: SHAPE_BURST8,
    restFill: '#faecc8',
  },
  {
    key: 'Button2',
    cx: 314,
    cy: 92,
    zone: 'face',
    labelXbox: 'X',
    labelPs: '□',
    labelNs: 'Y',
    restPath: SHAPE_SQUIRCLE,
    activePath: SHAPE_BURST8,
    restFill: '#dceafb',
  },
  {
    key: 'Button1',
    cx: 374,
    cy: 92,
    zone: 'face',
    labelXbox: 'B',
    labelPs: '○',
    labelNs: 'A',
    restPath: SHAPE_PEBBLE,
    activePath: SHAPE_BURST8,
    restFill: '#f9ded8',
  },
  {
    key: 'Button0',
    cx: 344,
    cy: 122,
    zone: 'face',
    labelXbox: 'A',
    labelPs: '✕',
    labelNs: 'B',
    restPath: SHAPE_COOKIE4,
    activePath: SHAPE_BURST8,
    restFill: '#e3f3c8',
  },
]

export function getPlatformButtonLabel(
  key: string,
  family: ControllerFamily,
  isZh: boolean
): { short: string; name: string } {
  const node = KEY_NODES.find((item) => item.key === key)
  if (node) {
    const short =
      family === 'playstation'
        ? node.labelPs
        : family === 'nintendo'
          ? node.labelNs
          : node.labelXbox
    const descMap: Record<string, { zh: string; en: string }> = {
      Button0: { zh: '主动作键', en: 'South action' },
      Button1: { zh: '东侧动作键', en: 'East action' },
      Button2: { zh: '西侧动作键', en: 'West action' },
      Button3: { zh: '北侧动作键', en: 'North action' },
      Button4: { zh: '左肩键', en: 'Left bumper' },
      Button5: { zh: '右肩键', en: 'Right bumper' },
      Button6: { zh: '左扳机', en: 'Left trigger' },
      Button7: { zh: '右扳机', en: 'Right trigger' },
      Button8: { zh: '视图 / 分享', en: 'Select / Share' },
      Button9: { zh: '菜单 / 选项', en: 'Start / Menu' },
      Button10: { zh: '左摇杆下压', en: 'Left stick click' },
      Button11: { zh: '右摇杆下压', en: 'Right stick click' },
      Button12: { zh: '十字键上', en: 'D-Pad Up' },
      Button13: { zh: '十字键下', en: 'D-Pad Down' },
      Button14: { zh: '十字键左', en: 'D-Pad Left' },
      Button15: { zh: '十字键右', en: 'D-Pad Right' },
      Button16: { zh: '主引导键', en: 'Guide / Home' },
    }
    const desc = descMap[key]
    return {
      short,
      name: desc ? (isZh ? `${short} · ${desc.zh}` : `${short} · ${desc.en}`) : short,
    }
  }
  return { short: key, name: key }
}

/**
 * MD 3 Expressive Abstract Gamepad Key Recognition Stage ("神似而不求形似")
 * Renders an artistic M3E key topology where physical button presses and bound combo keys
 * morph geometric tokens (Squircle, Pebble, Cookie4, Clover, Wing) and link via tension chords.
 */
export const ExpressiveComboStage: React.FC<ExpressiveComboStageProps> = ({
  activeDevice,
  comboKeys,
  liveRecordingKeys,
  recordingCombo,
  buttons,
  axes,
  locale,
}) => {
  const isZh = locale.startsWith('zh')
  const [showTopology, setShowTopology] = React.useState(false)
  const detection = React.useMemo(() => detectController(activeDevice), [activeDevice])
  const family: ControllerFamily = detection.family === 'generic' ? 'xbox' : detection.family

  const activeSet = React.useMemo(() => {
    const keys = recordingCombo && liveRecordingKeys.length > 0 ? liveRecordingKeys : comboKeys
    return new Set(keys)
  }, [comboKeys, liveRecordingKeys, recordingCombo])

  const livePressedSet = React.useMemo(() => {
    const pressed = new Set<string>()
    buttons.forEach((isDown, idx) => {
      if (isDown) pressed.add(`Button${idx}`)
    })
    if ((axes[4] ?? 0) > 0.5) pressed.add('Button6')
    if ((axes[5] ?? 0) > 0.5) pressed.add('Button7')
    liveRecordingKeys.forEach((k) => pressed.add(k))
    return pressed
  }, [buttons, axes, liveRecordingKeys])

  // Compute chord coordinates connecting active combo nodes
  const activeNodes = React.useMemo(
    () => KEY_NODES.filter((node) => activeSet.has(node.key) || livePressedSet.has(node.key)),
    [activeSet, livePressedSet]
  )

  return (
    <div
      className={`sb-combo-art-stage ${recordingCombo ? 'is-recording' : ''}`}
      data-family={family}
    >
      <div className="sb-combo-art-head">
        <div className="sb-combo-art-copy">
          <span className="sb-combo-art-badge">
            <i aria-hidden="true" />
            {activeDevice
              ? `${detection.brandLabel} · ${family.toUpperCase()}`
              : isZh
                ? 'MD3 Expressive 输入状态'
                : 'MD3 Expressive input state'}
          </span>
          <span className="sb-combo-art-hint">
            {recordingCombo
              ? isZh
                ? '正在感应手柄输入… 松开即锁定组合'
                : 'Sensing controller chord… release to bind'
              : isZh
                ? '只显示当前组合与实时按键'
                : 'Display current combo and live keys'}
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={showTopology}
          className="sb-combo-art-switch"
          onClick={() => setShowTopology((value) => !value)}
        >
          <span className="sb-combo-art-switch-track" aria-hidden="true"><i /></span>
          {showTopology ? (isZh ? '隐藏拓扑' : 'Hide topology') : (isZh ? '显示拓扑' : 'Show topology')}
        </button>
      </div>

      {!showTopology ? (
        <div className="sb-combo-art-collapsed" aria-live="polite">
          {activeNodes.length > 0 ? activeNodes.map((node) => {
            const label = family === 'playstation' ? node.labelPs : family === 'nintendo' ? node.labelNs : node.labelXbox
            const isLive = livePressedSet.has(node.key)
            return <span key={node.key} className={`sb-combo-art-token ${isLive ? 'is-live' : ''}`}><i aria-hidden="true" />{label}</span>
          }) : (
            <span className="sb-combo-art-empty">{isZh ? '等待手柄输入…' : 'Waiting for gamepad input…'}</span>
          )}
        </div>
      ) : <svg
        viewBox="0 0 420 156"
        className="sb-combo-art-svg"
        role="group"
        aria-label={isZh ? 'MD3 Expressive 手柄按键识别拓扑' : 'MD3 Expressive Gamepad Key Topology'}
      >
        {/* 1. M3E topology field: routes and zones replace the controller chassis. */}
        <g className="sb-combo-topology-bg" aria-hidden="true">
          <rect x="18" y="18" width="384" height="120" rx="28" fill="var(--sb-surface-low)" opacity="0.64" />
          <path d="M 32 74 C 78 42, 116 42, 154 72 S 234 102, 272 72 S 342 40, 388 74" fill="none" stroke="var(--sb-outline)" strokeWidth="1.2" strokeDasharray="2 7" opacity="0.78" />
          <path d="M 42 116 C 90 88, 116 88, 150 104 S 220 128, 260 104 S 330 82, 378 112" fill="none" stroke="var(--sb-outline)" strokeWidth="1" strokeDasharray="1 8" opacity="0.58" />
          <path d="M 202 26 V 130" fill="none" stroke="var(--sb-outline)" strokeWidth="1" strokeDasharray="2 6" opacity="0.56" />
          <circle cx="132" cy="102" r="34" fill="none" stroke="var(--sb-outline)" strokeWidth="1" strokeDasharray="3 5" opacity="0.7" />
          <circle cx="344" cy="92" r="40" fill="none" stroke="var(--sb-outline)" strokeWidth="1" strokeDasharray="3 5" opacity="0.7" />
          <circle cx="210" cy="56" r="24" fill="var(--sb-surface-high)" opacity="0.5" />
          {family === 'playstation' ? (
            <>
              <path d="M 44 44 Q 116 18 192 54" fill="none" stroke="var(--sb-tertiary)" strokeWidth="3" strokeLinecap="round" opacity="0.52" />
              <path d="M 228 54 Q 304 18 376 44" fill="none" stroke="var(--sb-tertiary)" strokeWidth="3" strokeLinecap="round" opacity="0.52" />
              <path d="M 184 28 H 236" fill="none" stroke="var(--sb-primary)" strokeWidth="2" strokeLinecap="round" opacity="0.72" />
            </>
          ) : family === 'nintendo' ? (
            <>
              <path d="M 46 42 Q 112 24 172 58" fill="none" stroke="var(--sb-secondary)" strokeWidth="4" strokeLinecap="round" opacity="0.52" />
              <path d="M 248 58 Q 308 24 374 42" fill="none" stroke="var(--sb-tertiary)" strokeWidth="4" strokeLinecap="round" opacity="0.52" />
            </>
          ) : (
            <path d="M 44 106 L 190 50 L 376 106" fill="none" stroke="var(--sb-secondary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.46" />
          )}
        </g>

        {/* 2. Dynamic M3E Chord Arcs Connecting Active Combo Keys */}
        {activeNodes.length >= 2 && (
          <g className="sb-combo-chord-lines" aria-hidden="true">
            {activeNodes.slice(0, -1).map((fromNode, idx) => {
              const toNode = activeNodes[idx + 1]
              const midX = (fromNode.cx + toNode.cx) / 2
              const midY = Math.min(fromNode.cy, toNode.cy) - 22
              const d = `M ${fromNode.cx} ${fromNode.cy} Q ${midX} ${midY} ${toNode.cx} ${toNode.cy}`
              return (
                <React.Fragment key={`${fromNode.key}-${toNode.key}`}>
                  <path
                    d={d}
                    fill="none"
                    stroke="var(--sb-primary)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    opacity="0.32"
                  />
                  <path
                    d={d}
                    fill="none"
                    stroke="var(--sb-ink)"
                    strokeWidth="2.2"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                  />
                </React.Fragment>
              )
            })}
          </g>
        )}

        {/* 3. Interactive MD 3 Expressive Abstract Key Nodes */}
        {KEY_NODES.map((node) => {
          const isBound = activeSet.has(node.key)
          const isLive = livePressedSet.has(node.key)
          const isActive = isBound || isLive
          const label =
            family === 'playstation'
              ? node.labelPs
              : family === 'nintendo'
                ? node.labelNs
                : node.labelXbox

          return (
            <g
              key={node.key}
              transform={`translate(${node.cx}, ${node.cy})`}
              className={`sb-combo-node ${isActive ? 'is-active' : ''} ${isLive ? 'is-live' : ''}`}
              aria-label={`${label} (${node.key})`}
            >
              <path
                d={isActive ? node.activePath : node.restPath}
                fill={
                  isActive
                    ? 'var(--sb-primary)'
                    : node.restFill || 'var(--sb-surface-lowest)'
                }
                stroke="var(--sb-ink)"
                strokeWidth={isActive ? 2.2 : 1.6}
                strokeLinejoin="round"
              />
              <text
                x="0"
                y="4"
                textAnchor="middle"
                fill={isActive ? 'var(--sb-on-primary)' : 'var(--sb-ink)'}
                fontSize={label.length > 2 ? '8.5' : '10.5'}
                fontWeight="900"
              >
                {label}
              </text>
            </g>
          )
        })}
      </svg>}
    </div>
  )
}

export { GamepadButtonIcon }
