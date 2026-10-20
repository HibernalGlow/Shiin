import * as React from 'react'
import { AppIcon } from './AppIcon.js'
import { MD3E_ICON_SHAPES, blendShapePaths } from '../md3e-shapes.js'

export function Md3eLoadingBlob({ size = 48, label }: { size?: number; label?: string }) {
  const [index, setIndex] = React.useState(0)
  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % MD3E_ICON_SHAPES.length)
    }, 650)
    return () => clearInterval(timer)
  }, [])
  return (
    <span
      className="sb-loading-blob"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <path d={MD3E_ICON_SHAPES[index].svgPath} />
      </svg>
    </span>
  )
}

export function BentoSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: React.ReactNode
  description?: React.ReactNode
}) {
  return (
    <div className="sb-row">
      <div className="sb-row-copy">
        <strong>{label}</strong>
        {description !== undefined && <small>{description}</small>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={typeof label === 'string' ? label : undefined}
        className="sb-switch"
        onClick={() => onChange(!checked)}
      >
        <span className="sb-switch-thumb">
          <AppIcon name="check" size={13} />
        </span>
      </button>
    </div>
  )
}


export function Md3eMorphShape({
  path,
  pressed = false,
  pressedPath,
  className = 'sb-mask',
  duration = 280,
  preserveAspectRatio = 'xMidYMid meet',
}: {
  path: string
  pressed?: boolean
  pressedPath?: string
  className?: string
  duration?: number
  preserveAspectRatio?: string
}) {
  const [displayPath, setDisplayPath] = React.useState(path)
  const currentRef = React.useRef(path)
  const frameRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    const target = pressed && pressedPath ? pressedPath : path
    const from = currentRef.current
    if (from === target) return
    const reduceMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion || typeof requestAnimationFrame !== 'function') {
      currentRef.current = target
      setDisplayPath(target)
      return
    }
    const startedAt = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = blendShapePaths(from, target, eased)
      currentRef.current = next
      setDisplayPath(next)
      if (progress < 1) frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [path, pressedPath, pressed, duration])

  return (
    <svg
      data-shape-morph="true"
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio={preserveAspectRatio}
      aria-hidden="true"
      focusable="false"
    >
      <path d={displayPath} />
    </svg>
  )
}

export function BentoWavyProgress({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value))
  const start = 4
  const trackEnd = 520
  const waveEnd = start + (clamped / 100) * (trackEnd - start)
  const points: string[] = []
  for (let x = start; x <= waveEnd; x += 2) {
    const y = 12 + Math.sin(((x - start) / 40) * Math.PI * 2) * 4
    points.push(`${x === start ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return (
    <svg viewBox="0 0 528 24" preserveAspectRatio="none" aria-hidden="true">
      {points.length > 1 && (
        <path
          d={points.join(' ')}
          fill="none"
          stroke="var(--sb-primary)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {clamped < 100 && (
        <>
          <path
            d={`M${Math.min(waveEnd + 10, trackEnd).toFixed(1)} 12 H${trackEnd}`}
            fill="none"
            stroke="var(--sb-surface-highest)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="525" cy="12" r="2.5" fill="var(--sb-primary)" />
        </>
      )}
    </svg>
  )
}


export interface BentoSelectOption {
  value: string
  label: string
  description?: string
}

export function BentoSelect({
  value,
  options,
  onChange,
  ariaLabel,
  variant = 'default',
  className = '',
}: {
  value: string
  options: readonly BentoSelectOption[]
  onChange: (next: string) => void
  ariaLabel: string
  variant?: 'default' | 'chip' | 'inline' | 'notify'
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const current = options.find((option) => option.value === value)

  React.useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className={`sb-select-control ${className}`.trim()} ref={rootRef}>
      <button
        type="button"
        className="sb-select-button"
        data-variant={variant}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
      >
        <span className="sb-select-value">{current?.label ?? '—'}</span>
        <AppIcon name="chevronDown" size={14} />
      </button>
      {open && (
        <div className="sb-select-popover" role="listbox" aria-label={ariaLabel}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={option.value === value ? 'is-selected' : ''}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
            >
              <span>
                <strong>{option.label}</strong>
                {option.description !== undefined && <small>{option.description}</small>}
              </span>
              {option.value === value && <AppIcon name="check" size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
