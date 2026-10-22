import * as React from 'react'
import type { ControllerFamily, StandardGamepadState } from '../types.js'

export interface ExpressiveInputFieldProps {
  state: StandardGamepadState
  family: ControllerFamily
  interactive?: boolean
  onButtonPress?: (buttonKey: string) => void
  showLabels?: boolean
  accentColor?: string
}

const FACE_LABELS: Record<ControllerFamily, Record<string, string>> = {
  xbox: { south: 'A', east: 'B', west: 'X', north: 'Y' },
  playstation: { south: '×', east: '○', west: '□', north: '△' },
  nintendo: { south: 'B', east: 'A', west: 'Y', north: 'X' },
  generic: { south: 'A', east: 'B', west: 'X', north: 'Y' },
}

const SIGNAL_COLORS: Record<string, string> = {
  south: 'primary',
  east: 'coral',
  west: 'cyan',
  north: 'olive',
  dpad: 'olive',
  stick: 'ink',
  shoulder: 'sand',
  system: 'surface',
}

const FAMILY_META: Record<ControllerFamily, { name: string; code: string; cue: string }> = {
  xbox: { name: 'Xbox', code: 'X / FIELD', cue: 'offset action field' },
  playstation: { name: 'PlayStation', code: 'PS / LIGHT', cue: 'split light field' },
  nintendo: { name: 'Nintendo', code: 'NS / PAIR', cue: 'paired action field' },
  generic: { name: 'Universal', code: 'GEN / FIELD', cue: 'standard action field' },
}

function SignalButton({
  label,
  active,
  tone,
  pressed,
  onClick,
  showLabel,
  className = '',
}: {
  label: string
  active: boolean
  tone: string
  pressed?: boolean
  onClick?: () => void
  showLabel: boolean
  className?: string
}) {
  const content = <span className="gp-signal-button__face">{showLabel ? label : '•'}</span>
  return <button type="button" className={`gp-signal-button gp-signal-button--${tone} ${active ? 'is-active' : ''} ${className}`}
    aria-pressed={active || undefined} disabled={!onClick} onClick={onClick}>
    {content}
    {pressed && <span className="gp-signal-button__pulse" aria-hidden="true" />}
  </button>
}

function StickSignal({ label, x, y, active, onPress, showLabel }: { label: string; x: number; y: number; active: boolean; onPress?: () => void; showLabel: boolean }) {
  const left = `${50 + Math.max(-1, Math.min(1, x)) * 35}%`
  const top = `${50 + Math.max(-1, Math.min(1, y)) * 35}%`
  return <button type="button" className={`gp-stick-signal ${active ? 'is-active' : ''}`} aria-label={label}
    aria-pressed={active || undefined} disabled={!onPress} onClick={onPress}>
    <span className="gp-stick-signal__ring"><span className="gp-stick-signal__cross gp-stick-signal__cross--x" /><span className="gp-stick-signal__cross gp-stick-signal__cross--y" />
      <span className="gp-stick-signal__marker" style={{ left, top }} /></span>
    <span className="gp-stick-signal__label">{showLabel ? label : 'STICK'}</span>
  </button>
}

function DpadSignal({ state, onPress, showLabels }: { state: StandardGamepadState; onPress?: (key: string) => void; showLabels: boolean }) {
  return <div className="gp-dpad-signal" aria-label={showLabels ? 'D-pad' : undefined}>
    <SignalButton label="↑" tone={SIGNAL_COLORS.dpad} active={state.dpadUp} showLabel={showLabels} onClick={onPress ? () => onPress('Button12') : undefined} className="gp-dpad-signal__up" />
    <SignalButton label="←" tone={SIGNAL_COLORS.dpad} active={state.dpadLeft} showLabel={showLabels} onClick={onPress ? () => onPress('Button14') : undefined} className="gp-dpad-signal__left" />
    <SignalButton label="·" tone="surface" active={false} showLabel={showLabels} className="gp-dpad-signal__center" />
    <SignalButton label="→" tone={SIGNAL_COLORS.dpad} active={state.dpadRight} showLabel={showLabels} onClick={onPress ? () => onPress('Button15') : undefined} className="gp-dpad-signal__right" />
    <SignalButton label="↓" tone={SIGNAL_COLORS.dpad} active={state.dpadDown} showLabel={showLabels} onClick={onPress ? () => onPress('Button13') : undefined} className="gp-dpad-signal__down" />
  </div>
}

export const ExpressiveInputField: React.FC<ExpressiveInputFieldProps> = ({ state, family, interactive = true, onButtonPress, showLabels = true, accentColor }) => {
  const face = FACE_LABELS[family]
  const meta = FAMILY_META[family]
  const press = interactive ? onButtonPress : undefined
  return <div
    className={`gp-input-field gp-input-field--${family}`}
    data-accent={accentColor}
    data-family={family}
    aria-label={`${meta.name} ${meta.cue}`}
  >
    <div className="gp-input-field__rail" aria-hidden="true">
      <span className="gp-input-field__rail-line" />
      <span className="gp-input-field__rail-dot" />
      <span className="gp-input-field__rail-dot" />
      <span className="gp-input-field__rail-dot" />
      <span className="gp-input-field__rail-line" />
    </div>
    <div className="gp-input-field__header">
      <div className="gp-input-field__family-mark" aria-hidden="true">
        <span className="gp-input-field__family-mark-primary" />
        <span className="gp-input-field__family-mark-secondary" />
        <span className="gp-input-field__family-mark-tertiary" />
      </div>
      <div className="gp-input-field__family-copy">
        <strong>{meta.name}</strong>
        <span>{meta.code}</span>
      </div>
      <div className="gp-input-field__live"><i />{showLabels ? 'LIVE INPUT' : 'LIVE'}</div>
    </div>
    <div className="gp-input-field__shoulders">
      <SignalButton label={family === 'playstation' ? 'L1' : family === 'nintendo' ? 'L' : 'LB'} tone={SIGNAL_COLORS.shoulder} active={state.l1} showLabel={showLabels} onClick={press ? () => press('Button4') : undefined} />
      <div className="gp-input-field__channel"><span>{showLabels ? 'INPUT' : '•'}</span><i /></div>
      <SignalButton label={family === 'playstation' ? 'R1' : family === 'nintendo' ? 'R' : 'RB'} tone={SIGNAL_COLORS.shoulder} active={state.r1} showLabel={showLabels} onClick={press ? () => press('Button5') : undefined} />
    </div>
    <div className="gp-input-field__plane">
      <div className="gp-input-field__left">
        <DpadSignal state={state} onPress={press} showLabels={showLabels} />
        <StickSignal label={showLabels ? 'L3' : 'LEFT'} x={state.leftStick.x} y={state.leftStick.y} active={state.l3} onPress={press ? () => press('Button10') : undefined} showLabel={showLabels} />
      </div>
      <div className="gp-input-field__core">
        <div className="gp-input-core-mark"><span /><span /><span /></div>
        <div className="gp-input-core-label">{showLabels ? 'SIGNAL FIELD' : '•'}</div>
        <div className="gp-input-core-meter"><i style={{ transform: `scaleX(${Math.max(.12, Math.min(1, Math.max(state.l2Value, state.r2Value, Math.abs(state.leftStick.x), Math.abs(state.leftStick.y), Math.abs(state.rightStick.x), Math.abs(state.rightStick.y))))})` }} /></div>
        <div className="gp-input-core-system">
          <SignalButton label={family === 'playstation' ? 'PS' : family === 'nintendo' ? 'HOME' : 'GUIDE'} tone={SIGNAL_COLORS.system} active={state.guide} showLabel={showLabels} onClick={press ? () => press('Button16') : undefined} />
          <SignalButton label={family === 'nintendo' ? '-' : 'VIEW'} tone={SIGNAL_COLORS.system} active={state.select} showLabel={showLabels} onClick={press ? () => press('Button8') : undefined} />
          <SignalButton label={family === 'nintendo' ? '+' : 'MENU'} tone={SIGNAL_COLORS.system} active={state.start} showLabel={showLabels} onClick={press ? () => press('Button9') : undefined} />
        </div>
      </div>
      <div className="gp-input-field__right">
        <div className="gp-face-signal" aria-label={showLabels ? 'Face buttons' : undefined}>
          <SignalButton label={face.north} tone={SIGNAL_COLORS.north} active={state.north} showLabel={showLabels} onClick={press ? () => press('Button3') : undefined} className="gp-face-signal__north" />
          <SignalButton label={face.west} tone={SIGNAL_COLORS.west} active={state.west} showLabel={showLabels} onClick={press ? () => press('Button2') : undefined} className="gp-face-signal__west" />
          <SignalButton label={face.east} tone={SIGNAL_COLORS.east} active={state.east} showLabel={showLabels} onClick={press ? () => press('Button1') : undefined} className="gp-face-signal__east" />
          <SignalButton label={face.south} tone={SIGNAL_COLORS.south} active={state.south} showLabel={showLabels} onClick={press ? () => press('Button0') : undefined} className="gp-face-signal__south" />
        </div>
        <StickSignal label={showLabels ? 'R3' : 'RIGHT'} x={state.rightStick.x} y={state.rightStick.y} active={state.r3} onPress={press ? () => press('Button11') : undefined} showLabel={showLabels} />
      </div>
    </div>
    <div className="gp-input-field__triggers">
      <div className="gp-trigger-signal"><span>{showLabels ? (family === 'playstation' ? 'L2' : family === 'nintendo' ? 'ZL' : 'LT') : 'L'}</span><i style={{ width: `${Math.round(state.l2Value * 100)}%` }} /></div>
      <div className="gp-trigger-signal"><span>{showLabels ? (family === 'playstation' ? 'R2' : family === 'nintendo' ? 'ZR' : 'RT') : 'R'}</span><i style={{ width: `${Math.round(state.r2Value * 100)}%` }} /></div>
    </div>
  </div>
}
