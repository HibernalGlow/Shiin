import * as React from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { AppIcon } from '../AppIcon.js'
import { useMd3eShapes } from '../../md3e-shape-context.js'
import { Md3eMorphShape } from '../bento-controls.js'
import type { WidgetId, WidgetSize } from '../../dashboard-layout.js'
import { WIDGET_REGISTRY } from '../../dashboard-layout.js'

export interface DashboardWidgetFrameProps {
  id: WidgetId
  size: WidgetSize
  isEditing: boolean
  locale: string
  onResize?: (nextSize: WidgetSize) => void
  onMove?: (direction: 'prev' | 'next') => void
  onRemove?: () => void
  headerActions?: React.ReactNode
  badge?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export const DashboardWidgetFrame: React.FC<DashboardWidgetFrameProps> = ({
  id,
  size,
  isEditing,
  locale,
  onResize,
  onMove,
  onRemove,
  headerActions,
  badge,
  children,
  className = '',
}) => {
  const isZh = locale.startsWith('zh')
  const reduceMotion = useReducedMotion()
  const { session } = useMd3eShapes()
  const meta = WIDGET_REGISTRY[id]

  const title = isZh ? meta?.titleZh : meta?.titleEn
  const icon = meta?.icon || 'activity'
  const supportedSizes = meta?.supportedSizes || [size]

  // Interactive corner drag-to-resize
  const handlePointerDownResize = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!onResize || supportedSizes.length <= 1) return
    e.preventDefault()
    e.stopPropagation()
    const target = e.currentTarget
    target.setPointerCapture(e.pointerId)

    const startX = e.clientX
    const startY = e.clientY
    let currentSuggestedSize = size

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY

      // Determine candidate size based on drag vector
      let candidate: WidgetSize = size
      if (meta?.category === 'metric') {
        if (dx > 70) candidate = '2x1'
        else if (dx < -70) candidate = '1x1'
      } else {
        // Detail / stream widgets: 2x1, 2x2, 3x2, 4x2
        if (dx > 180) candidate = '4x2'
        else if (dx > 70) candidate = '3x2'
        else if (dx < -120) candidate = supportedSizes.includes('2x1') && dy < -50 ? '2x1' : '2x2'
        else if (dy < -80 && supportedSizes.includes('2x1')) candidate = '2x1'
        else if (dy > 80 && supportedSizes.includes('2x2') && size === '2x1') candidate = '2x2'
      }

      if (candidate !== currentSuggestedSize && supportedSizes.includes(candidate)) {
        currentSuggestedSize = candidate
        onResize(candidate)
      }
    }

    const onPointerUp = (upEvent: PointerEvent) => {
      target.releasePointerCapture(upEvent.pointerId)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
  }

  return (
    <motion.div
      className={`shiin-dash-card shiin-dash-card--${size} ${isEditing ? 'is-editing' : ''} ${className}`}
      data-widget-id={id}
      data-size={size}
      layout={!reduceMotion}
      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
    >
      {/* Edit Mode Overlay Toolbar */}
      {isEditing && (
        <div className="shiin-dash-card__edit-bar" aria-label={isZh ? '模块编辑栏' : 'Widget editor'}>
          <div className="shiin-dash-card__edit-drag" title={isZh ? '拖拽调整顺序' : 'Drag to reorder'}>
            <AppIcon name="move" size={14} />
            <span className="shiin-dash-card__edit-name">{title}</span>
          </div>

          <div className="shiin-dash-card__edit-sizes" role="group" aria-label={isZh ? '尺寸' : 'Size'}>
            {supportedSizes.map((s) => (
              <button
                key={s}
                type="button"
                className={`shiin-dash-card__size-btn ${size === s ? 'is-active' : ''}`}
                onClick={() => onResize?.(s)}
                title={`${isZh ? '调整尺寸为' : 'Resize to'} ${s}`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="shiin-dash-card__edit-actions">
            <button
              type="button"
              className="shiin-dash-card__ctrl-btn"
              onClick={() => onMove?.('prev')}
              title={isZh ? '向前移动' : 'Move backward'}
              aria-label={isZh ? '向前移动' : 'Move backward'}
            >
              <AppIcon name="chevronDown" size={13} style={{ transform: 'rotate(90deg)' }} />
            </button>
            <button
              type="button"
              className="shiin-dash-card__ctrl-btn"
              onClick={() => onMove?.('next')}
              title={isZh ? '向后移动' : 'Move forward'}
              aria-label={isZh ? '向后移动' : 'Move forward'}
            >
              <AppIcon name="chevronRight" size={13} />
            </button>
            <button
              type="button"
              className="shiin-dash-card__ctrl-btn is-danger"
              onClick={onRemove}
              title={isZh ? '移除模块' : 'Remove widget'}
              aria-label={isZh ? '移除模块' : 'Remove widget'}
            >
              <AppIcon name="close" size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Normal Header (if not compact metric 1x1) */}
      {size !== '1x1' && (
        <div className="shiin-dash-card__head">
          <div className="shiin-dash-card__title-wrap">
            <span className="shiin-dash-card__icon-seat" aria-hidden="true">
              <Md3eMorphShape path={session.shapes.icon.svgPath} className="shiin-dash-card__icon-shape" />
              <AppIcon name={icon} size={16} />
            </span>
            <div className="shiin-dash-card__titles">
              <h3 className="shiin-dash-card__title">{title}</h3>
              {meta?.descriptionZh && (
                <span className="shiin-dash-card__desc">
                  {isZh ? meta.descriptionZh : meta.descriptionEn}
                </span>
              )}
            </div>
          </div>

          <div className="shiin-dash-card__head-aside">
            {badge && <div className="shiin-dash-card__badge">{badge}</div>}
            {headerActions && <div className="shiin-dash-card__actions">{headerActions}</div>}
          </div>
        </div>
      )}

      {/* Widget Body Content */}
      <div className={`shiin-dash-card__body ${size === '1x1' ? 'is-1x1' : ''}`}>
        {children}
      </div>

      {/* Interactive Corner Drag-to-Resize Handle */}
      {isEditing && supportedSizes.length > 1 && (
        <div
          className="shiin-dash-card__resize-grip"
          onPointerDown={handlePointerDownResize}
          title={isZh ? '拖拽角标调整卡片尺寸' : 'Drag corner to resize'}
          aria-label={isZh ? '拉伸卡片尺寸' : 'Resize widget'}
        >
          <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true">
            <line x1="9" y1="2" x2="2" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="9" y1="6" x2="6" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </motion.div>
  )
}
