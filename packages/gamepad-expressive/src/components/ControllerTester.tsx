import * as React from 'react'
import type {
  ControllerFamily,
  GamepadSourceDeviceInfo,
  StandardGamepadState,
} from '../types.js'
import { detectController } from '../detector/rules.js'
import { findSdlMapping } from '../db/database.js'
import { mapSdlToStandard, mapStandardHardware } from '../db/mapper.js'
import { ExpressiveGamepad } from './ExpressiveGamepad.js'
import { StickCoordinatePlot } from './StickCoordinatePlot.js'
import { GamepadButtonIcon } from '../icons/GamepadButtonIcon.js'
import { GAMEPAD_EXPRESSIVE_CSS } from '../styles/gamepad-expressive-css.js'

export interface ControllerTesterProps {
  deviceInfo?: GamepadSourceDeviceInfo | null
  state?: StandardGamepadState
  buttons?: boolean[]
  axes?: number[]
  hats?: string[] | number[]
  locale?: 'zh' | 'en'
  initialFamily?: ControllerFamily | 'auto'
  allowFamilySwitch?: boolean
  showRawInspector?: boolean
  onFamilyChange?: (family: ControllerFamily | 'auto') => void
  onButtonPress?: (buttonKey: string) => void
  className?: string
  style?: React.CSSProperties
}

export const ControllerTester: React.FC<ControllerTesterProps> = ({
  deviceInfo,
  state: externalState,
  buttons = [],
  axes = [],
  hats = [],
  locale = 'zh',
  initialFamily = 'auto',
  allowFamilySwitch = true,
  showRawInspector: defaultShowRaw = false,
  onFamilyChange,
  onButtonPress,
  className = '',
  style,
}) => {
  const isZh = locale.startsWith('zh')
  const [selectedFamily, setSelectedFamily] = React.useState<ControllerFamily | 'auto'>(initialFamily)
  const [rawInspectorOpen, setRawInspectorOpen] = React.useState<boolean>(defaultShowRaw)

  // Derive standardized state from external state or raw inputs
  const mapping = React.useMemo(() => {
    if (!deviceInfo || deviceInfo.inputLayout !== 'raw') return null
    return findSdlMapping({
      guid: deviceInfo.guid,
      vendorId: deviceInfo.vendorId,
      productId: deviceInfo.productId,
      name: deviceInfo.name,
    })
  }, [deviceInfo])

  const standardState: StandardGamepadState = React.useMemo(() => {
    if (externalState) return externalState
    return mapping ? mapSdlToStandard({ buttons, axes, hats }, mapping) : mapStandardHardware({ buttons, axes })
  }, [externalState, buttons, axes, hats, mapping])

  // Detect device characteristics
  const detection = React.useMemo(() => detectController(deviceInfo), [deviceInfo])

  const handleFamilySelect = (fam: ControllerFamily | 'auto') => {
    setSelectedFamily(fam)
    if (onFamilyChange) onFamilyChange(fam)
  }

  const effectiveFamily: ControllerFamily =
    selectedFamily === 'auto' ? detection.family : selectedFamily

  // List active buttons with both icon key and label for live M3E feedback
  const activeKeys = React.useMemo(() => {
    const list: Array<{ iconKey: string; label: string }> = []
    if (standardState.south)
      list.push({
        iconKey: 'south',
        label: effectiveFamily === 'playstation' ? '✕' : effectiveFamily === 'nintendo' ? 'B' : 'A',
      })
    if (standardState.east)
      list.push({
        iconKey: 'east',
        label: effectiveFamily === 'playstation' ? '○' : effectiveFamily === 'nintendo' ? 'A' : 'B',
      })
    if (standardState.west)
      list.push({
        iconKey: 'west',
        label: effectiveFamily === 'playstation' ? '□' : effectiveFamily === 'nintendo' ? 'Y' : 'X',
      })
    if (standardState.north)
      list.push({
        iconKey: 'north',
        label: effectiveFamily === 'playstation' ? '△' : effectiveFamily === 'nintendo' ? 'X' : 'Y',
      })

    if (standardState.l1)
      list.push({
        iconKey: 'l1',
        label: effectiveFamily === 'playstation' ? 'L1' : effectiveFamily === 'nintendo' ? 'L' : 'LB',
      })
    if (standardState.r1)
      list.push({
        iconKey: 'r1',
        label: effectiveFamily === 'playstation' ? 'R1' : effectiveFamily === 'nintendo' ? 'R' : 'RB',
      })
    if (standardState.l2)
      list.push({
        iconKey: 'l2',
        label: effectiveFamily === 'playstation' ? 'L2' : effectiveFamily === 'nintendo' ? 'ZL' : 'LT',
      })
    if (standardState.r2)
      list.push({
        iconKey: 'r2',
        label: effectiveFamily === 'playstation' ? 'R2' : effectiveFamily === 'nintendo' ? 'ZR' : 'RT',
      })

    if (standardState.dpadUp) list.push({ iconKey: 'dpadUp', label: isZh ? '十字键 ↑' : 'D-Up' })
    if (standardState.dpadDown) list.push({ iconKey: 'dpadDown', label: isZh ? '十字键 ↓' : 'D-Down' })
    if (standardState.dpadLeft) list.push({ iconKey: 'dpadLeft', label: isZh ? '十字键 ←' : 'D-Left' })
    if (standardState.dpadRight) list.push({ iconKey: 'dpadRight', label: isZh ? '十字键 →' : 'D-Right' })

    if (standardState.l3) list.push({ iconKey: 'l3', label: 'L3' })
    if (standardState.r3) list.push({ iconKey: 'r3', label: 'R3' })
    if (standardState.select)
      list.push({
        iconKey: 'select',
        label: effectiveFamily === 'playstation' ? 'Create' : effectiveFamily === 'nintendo' ? '-' : 'View',
      })
    if (standardState.start)
      list.push({
        iconKey: 'start',
        label: effectiveFamily === 'playstation' ? 'Options' : effectiveFamily === 'nintendo' ? '+' : 'Menu',
      })
    if (standardState.guide)
      list.push({
        iconKey: 'guide',
        label: effectiveFamily === 'playstation' ? 'PS' : effectiveFamily === 'nintendo' ? 'Home' : 'Guide',
      })
    if (standardState.touchpad) list.push({ iconKey: 'touchpad', label: 'Touchpad' })
    if (standardState.misc) list.push({ iconKey: 'misc', label: effectiveFamily === 'nintendo' ? 'Capture' : 'Share' })

    return list
  }, [standardState, effectiveFamily, isZh])

  const isConnected = Boolean(deviceInfo || buttons.length > 0)

  return (
    <div className={`gp-controller-root gp-tester-card ${className}`} style={style}>
      <style>{GAMEPAD_EXPRESSIVE_CSS}</style>
      {/* 1. Tester Header & Brand Metadata */}
      <div className="gp-tester-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span className="gp-model-badge">
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: isConnected ? 'var(--gp-primary, #c8f000)' : '#888',
              }}
            />
            {detection.displayName || (isZh ? '未识别手柄' : 'Unknown Gamepad')}
          </span>
          <span style={{ fontSize: 11, color: 'var(--gp-muted, #5c6054)', fontWeight: 600 }}>
            {detection.brandLabel}
          </span>
        </div>

        {/* Family Override Selector */}
        {allowFamilySwitch && (
          <div className="gp-family-selector" role="radiogroup" aria-label="Controller skin">
            <button
              type="button"
              className={`gp-family-btn ${selectedFamily === 'auto' ? 'active' : ''}`}
              onClick={() => handleFamilySelect('auto')}
            >
              {isZh ? '自动' : 'Auto'}
            </button>
            <button
              type="button"
              className={`gp-family-btn ${selectedFamily === 'xbox' ? 'active' : ''}`}
              onClick={() => handleFamilySelect('xbox')}
            >
              Xbox
            </button>
            <button
              type="button"
              className={`gp-family-btn ${selectedFamily === 'playstation' ? 'active' : ''}`}
              onClick={() => handleFamilySelect('playstation')}
            >
              PlayStation
            </button>
            <button
              type="button"
              className={`gp-family-btn ${selectedFamily === 'nintendo' ? 'active' : ''}`}
              onClick={() => handleFamilySelect('nintendo')}
            >
              Switch
            </button>
            <button
              type="button"
              className={`gp-family-btn ${selectedFamily === 'generic' ? 'active' : ''}`}
              onClick={() => handleFamilySelect('generic')}
            >
              {isZh ? '通用' : 'Generic'}
            </button>
          </div>
        )}
      </div>

      {/* 2. Visual Controller SVG */}
      <ExpressiveGamepad
        state={standardState}
        deviceInfo={deviceInfo}
        family={effectiveFamily}
        interactive={true}
        onButtonPress={onButtonPress}
      />

      {/* 3. Live Readout Deck: Coordinates & Trigger Gauges */}
      <div className="gp-readout-deck">
        <StickCoordinatePlot
          label={isZh ? '左摇杆' : 'Left Stick'}
          vector={standardState.leftStick}
          isPressed={standardState.l3}
        />
        <StickCoordinatePlot
          label={isZh ? '右摇杆' : 'Right Stick'}
          vector={standardState.rightStick}
          isPressed={standardState.r3}
        />

        <div className="gp-readout-item" style={{ minWidth: 120 }}>
          <span className="gp-readout-label">{isZh ? '实时触发按键' : 'Active Inputs'}</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, minHeight: 28, alignItems: 'center' }}>
            {activeKeys.length > 0 ? (
              activeKeys.map((item, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 8px 2px 4px',
                    borderRadius: 999,
                    background: 'var(--gp-primary, #c8f000)',
                    color: 'var(--gp-on-primary, #273000)',
                    border: '1.5px solid var(--gp-ink, #343831)',
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  <GamepadButtonIcon button={item.iconKey} family={effectiveFamily} size={16} active={true} />
                  {item.label}
                </span>
              ))
            ) : (
              <span style={{ fontSize: 11, color: 'var(--gp-muted, #5c6054)' }}>
                {isZh ? '等待按键或转动摇杆…' : 'Tilt sticks or press buttons…'}
              </span>
            )}
          </div>
        </div>

        <div className="gp-readout-item" style={{ minWidth: 110 }}>
          <span className="gp-readout-label">{isZh ? '扳机模拟行程' : 'Triggers'}</span>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--gp-ink, #343831)' }}>
            LT: {Math.round(standardState.l2Value * 100)}% | RT: {Math.round(standardState.r2Value * 100)}%
          </div>
        </div>
      </div>

      {/* 4. Collapsible Hardware Raw Signal Matrix */}
      <div style={{ marginTop: 2 }}>
        <button
          type="button"
          onClick={() => setRawInspectorOpen((prev) => !prev)}
          style={{
            border: 'none',
            background: 'transparent',
            color: 'var(--gp-muted, #5c6054)',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            padding: '4px 0',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>{rawInspectorOpen ? '▼' : '▶'}</span>
          {isZh ? '底层硬件原始信号矩阵 (Raw Signals Inspector)' : 'Raw Hardware Signals Inspector'}
        </button>

        {rawInspectorOpen && (
          <div
            style={{
              marginTop: 8,
              padding: 12,
              borderRadius: 14,
              background: 'var(--gp-surface-container, #e4e2d6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {/* Raw Buttons Matrix */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gp-muted, #5c6054)', marginBottom: 6 }}>
                {isZh ? '原始按钮位状态 (B0 ~ B19)' : 'Raw Button Bits (B0 ~ B19)'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(42px, 1fr))', gap: 6 }}>
                {(standardState.rawButtons.length > 0 ? standardState.rawButtons : new Array(18).fill(false)).map(
                  (pressed, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '4px 2px',
                        borderRadius: pressed ? 12 : 8,
                        textAlign: 'center',
                        fontSize: 10,
                        fontWeight: 800,
                        background: pressed ? 'var(--gp-primary, #c8f000)' : 'var(--gp-surface, #fbfaf4)',
                        color: pressed ? 'var(--gp-on-primary, #273000)' : 'var(--gp-muted, #5c6054)',
                        border: '1.5px solid var(--gp-ink, #343831)',
                        transition: 'all 120ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}
                    >
                      B{idx}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Raw Axis Sliders */}
            {standardState.rawAxes.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gp-muted, #5c6054)', marginBottom: 6 }}>
                  {isZh ? '原始轴位移 (Axis 0 ~ N)' : 'Raw Axis Displacements (Axis 0 ~ N)'}
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {standardState.rawAxes.map((val, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '50px 1fr 45px',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 10.5,
                        color: 'var(--gp-muted, #5c6054)',
                      }}
                    >
                      <span>Axis {idx}</span>
                      <div
                        style={{
                          position: 'relative',
                          height: 6,
                          borderRadius: 3,
                          background: 'var(--gp-surface, #fbfaf4)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            left: `${Math.min(50, (val + 1) * 50)}%`,
                            width: `${Math.abs(val) * 50}%`,
                            height: '100%',
                            background: Math.abs(val) > 0.05 ? 'var(--gp-primary, #c8f000)' : '#aaa',
                          }}
                        />
                      </div>
                      <span style={{ fontFamily: 'ui-monospace, monospace', textAlign: 'right' }}>
                        {val.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
