import * as React from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { AppIcon } from './AppIcon.js'
import type { OverlayNotifyPosition } from '../../core/types.js'

export interface ScreenCornerPickerProps {
  value?: OverlayNotifyPosition
  onChange: (next: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => void
  locale?: string
  disabled?: boolean
}

type CornerKey = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const CORNERS: { id: CornerKey; labelZh: string; labelEn: string; recommended?: boolean }[] = [
  { id: 'top-left', labelZh: '左上角', labelEn: 'Top Left' },
  { id: 'top-right', labelZh: '右上角', labelEn: 'Top Right', recommended: true },
  { id: 'bottom-left', labelZh: '左下角', labelEn: 'Bottom Left' },
  { id: 'bottom-right', labelZh: '右下角', labelEn: 'Bottom Right' },
]

export const ScreenCornerPicker: React.FC<ScreenCornerPickerProps> = ({
  value = 'top-right',
  onChange,
  locale = 'zh',
  disabled = false,
}) => {
  const isZh = locale.startsWith('zh')
  const reduced = useReducedMotion()

  const normalized: CornerKey = React.useMemo(() => {
    if (value === 'top-left' || value === 'left') return 'top-left'
    if (value === 'bottom-left') return 'bottom-left'
    if (value === 'bottom-right') return 'bottom-right'
    return 'top-right'
  }, [value])

  return (
    <div className="sb-screen-corner-picker" data-disabled={disabled}>
      <div className="sb-screen-mockup" aria-hidden="true">
        <div className="sb-screen-mockup__bezel">
          {/* Simulated HUD elements */}
          <div className="sb-screen-mockup__hud-radar" />
          <div className="sb-screen-mockup__hud-bars" />
          <div className="sb-screen-mockup__crosshair" />

          {/* 4 Interactive Corner Hotspots */}
          {CORNERS.map((corner) => {
            const isSelected = normalized === corner.id
            return (
              <button
                key={corner.id}
                type="button"
                className={`sb-screen-corner-hotspot sb-screen-corner-hotspot--${corner.id} ${
                  isSelected ? 'active' : ''
                }`}
                onClick={() => !disabled && onChange(corner.id)}
                title={isZh ? corner.labelZh : corner.labelEn}
                aria-label={isZh ? corner.labelZh : corner.labelEn}
                tabIndex={disabled ? -1 : 0}
              >
                {isSelected ? (
                  <motion.div
                    className="sb-screen-corner-chip"
                    layoutId="active-overlay-corner"
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                  >
                    <AppIcon name="camera" size={11} />
                    <span>{isZh ? '截图已保存' : 'Saved'}</span>
                  </motion.div>
                ) : (
                  <span className="sb-screen-corner-dot" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 4 Segmented Control Buttons */}
      <div className="sb-corner-chips" role="radiogroup" aria-label={isZh ? '通知出现位置' : 'Notification Position'}>
        {CORNERS.map((corner) => {
          const isSelected = normalized === corner.id
          return (
            <button
              key={corner.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`sb-corner-chip ${isSelected ? 'active' : ''}`}
              onClick={() => !disabled && onChange(corner.id)}
              disabled={disabled}
            >
              <span>{isZh ? corner.labelZh : corner.labelEn}</span>
              {corner.recommended && (
                <span className="sb-corner-chip__badge">{isZh ? '推荐' : 'Rec'}</span>
              )}
            </button>
          )
        })}
      </div>

      <p className="sb-corner-hint">
        {isZh
          ? '游戏全屏时，浮窗在所选角落弹出并留出安全边距，避开小地图与 HUD。'
          : 'Docks notification in selected corner with 24px margin to avoid HUD & minimap.'}
      </p>
    </div>
  )
}
