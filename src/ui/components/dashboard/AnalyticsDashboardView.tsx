import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { AppIcon } from '../AppIcon.js'
import { useMd3eShapes } from '../../md3e-shape-context.js'
import { Md3eMorphShape } from '../bento-controls.js'
import {
  type DashboardLayoutConfig,
  type PlacedWidget,
  type WidgetId,
  type WidgetSize,
  WIDGET_REGISTRY,
  getDefaultDashboardLayout,
} from '../../dashboard-layout.js'
import { useWidgetLayout } from '../../use-widget-layout.js'
import type { ActivityStatsData } from '../../../core/stats.js'
import { MetricCardWidget } from './MetricCardWidget.js'
import { TopAppsWidget } from './TopAppsWidget.js'
import { CaptureHeatmapWidget } from './CaptureHeatmapWidget.js'
import { GamepadHeatmapWidget } from './GamepadHeatmapWidget.js'
import { ListenerStatsWidget } from './ListenerStatsWidget.js'
import { ActivityStreamWidget } from './ActivityStreamWidget.js'

export interface AnalyticsDashboardViewProps {
  stats: ActivityStatsData
  listening: boolean
  activeDeviceName?: string
  locale: string
  initialLayout?: DashboardLayoutConfig
  onSaveLayout?: (layout: DashboardLayoutConfig) => void
  onClearData: () => void
  onSeedDemoData: () => void
}

export const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({
  stats,
  listening,
  activeDeviceName,
  locale,
  initialLayout,
  onSaveLayout,
  onClearData,
  onSeedDemoData,
}) => {
  const isZh = locale.startsWith('zh')
  const reduceMotion = useReducedMotion()
  const { session } = useMd3eShapes()

  const [addMenuOpen, setAddMenuOpen] = React.useState(false)
  const [draggedWidgetId, setDraggedWidgetId] = React.useState<WidgetId | null>(null)

  const {
    isEditing,
    visibleWidgets,
    hiddenWidgets,
    setEditing: setIsEditing,
    setSize,
    moveBy,
    reorder,
    hide,
    show,
    reset: resetLayout,
  } = useWidgetLayout<WidgetSize, WidgetId>({
    createDefault: getDefaultDashboardLayout,
    initialLayout,
    onSave: onSaveLayout,
  })

  const handleResize = (id: WidgetId, nextSize: WidgetSize) => setSize(id, nextSize)

  const handleMove = (id: WidgetId, direction: 'prev' | 'next') =>
    moveBy(id, direction === 'prev' ? -1 : 1)

  const handleRemove = (id: WidgetId) => hide(id)

  const handleAddWidget = (id: WidgetId) => {
    show(id)
    setAddMenuOpen(false)
  }

  const handleResetLayout = () => resetLayout()

  // Drag and Drop handlers
  const handleDragStart = (id: WidgetId, e: React.DragEvent) => {
    if (!isEditing) return
    setDraggedWidgetId(id)
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (isEditing) e.preventDefault()
  }

  const handleDrop = (targetId: WidgetId, e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedWidgetId || draggedWidgetId === targetId) return
    reorder(draggedWidgetId, targetId)
    setDraggedWidgetId(null)
  }

  // Render a specific widget instance
  const renderWidget = (item: PlacedWidget) => {
    const { id, size } = item

    const commonProps = {
      id,
      size,
      isEditing,
      locale,
      onResize: (s: WidgetSize) => handleResize(id, s),
      onMove: (dir: 'prev' | 'next') => handleMove(id, dir),
      onRemove: () => handleRemove(id),
    }

    switch (id) {
      case 'metric_today_captures':
      case 'metric_listen_duration':
      case 'metric_top_app':
      case 'metric_top_button':
        return (
          <MetricCardWidget
            key={id}
            {...commonProps}
            stats={stats}
            listening={listening}
          />
        )
      case 'top_apps':
        return <TopAppsWidget key={id} {...commonProps} stats={stats} />
      case 'capture_heatmap':
        return <CaptureHeatmapWidget key={id} {...commonProps} stats={stats} />
      case 'gamepad_heatmap':
        return (
          <GamepadHeatmapWidget
            key={id}
            {...commonProps}
            stats={stats}
            activeDeviceName={activeDeviceName}
          />
        )
      case 'listener_stats':
        return (
          <ListenerStatsWidget
            key={id}
            {...commonProps}
            stats={stats}
            listening={listening}
          />
        )
      case 'activity_stream':
        return (
          <ActivityStreamWidget
            key={id}
            {...commonProps}
            stats={stats}
            onClearEvents={onClearData}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="shiin-bento shiin-dashboard">
      <div className="sb-page">
        {/* Expressive Header Hero Stage */}
        <section className="shiin-dash-hero" aria-label={isZh ? '数据统计看板概览' : 'Activity dashboard header'}>
          <div className="shiin-dash-hero__copy">
            <div className="shiin-dash-hero__kicker">
              <span className="shiin-dash-hero__emblem" aria-hidden="true">
                <Md3eMorphShape path={session.shapes.icon.svgPath} className="shiin-dash-hero__emblem-shape" />
                <AppIcon name="barChart" size={16} />
              </span>
              <span className="shiin-dash-hero__kicker-text">
                {isZh ? 'Shiin · 使用统计工作台' : 'Shiin · Activity Dashboard'}
              </span>
              {isEditing && (
                <span className="shiin-dash-hero__edit-pill">
                  <AppIcon name="layout" size={13} />
                  <span>{isZh ? '编辑布局模式中' : 'Editing Layout'}</span>
                </span>
              )}
            </div>

            <h2 className="shiin-dash-hero__title">
              {isZh ? '活动与手柄统计' : 'Usage & Gamepad Insights'}
            </h2>
            <p className="shiin-dash-hero__lede">
              {isZh
                ? '自由组合的截图习惯分析、后台监听记录与手柄按键热度看板，按需调整离散网格尺寸。'
                : 'Customizable workbench for capture frequency, listener sessions, and gamepad button heatmaps.'}
            </p>
          </div>

          <div className="shiin-dash-hero__actions">
            {/* Toggle Edit Layout Mode */}
            <motion.button
              type="button"
              className={`shiin-dash-btn ${isEditing ? 'is-active is-primary' : 'is-tonal'}`}
              onClick={() => setIsEditing(!isEditing)}
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            >
              <AppIcon name={isEditing ? 'check' : 'layout'} size={16} />
              <strong>{isEditing ? (isZh ? '完成编辑' : 'Done') : isZh ? '编辑布局' : 'Edit Layout'}</strong>
            </motion.button>

            {/* In Edit Mode: Add Widget & Reset */}
            {isEditing && (
              <>
                <div className="shiin-dash-add-wrap">
                  <button
                    type="button"
                    className="shiin-dash-btn is-tonal"
                    onClick={() => setAddMenuOpen(!addMenuOpen)}
                    disabled={hiddenWidgets.length === 0}
                    title={hiddenWidgets.length === 0 ? (isZh ? '全部模块已添加' : 'All widgets active') : undefined}
                  >
                    <AppIcon name="plus" size={16} />
                    <span>{isZh ? '添加模块' : 'Add Widget'}</span>
                    {hiddenWidgets.length > 0 && (
                      <span className="shiin-dash-badge-count">{hiddenWidgets.length}</span>
                    )}
                  </button>

                  <AnimatePresence>
                    {addMenuOpen && hiddenWidgets.length > 0 && (
                      <motion.div
                        className="shiin-dash-menu"
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        transition={{ duration: 0.16 }}
                      >
                        <div className="shiin-dash-menu__title">
                          {isZh ? '可添加的模块' : 'Available Widgets'}
                        </div>
                        {hiddenWidgets.map((hw) => {
                          const meta = WIDGET_REGISTRY[hw.id]
                          return (
                            <button
                              key={hw.id}
                              type="button"
                              className="shiin-dash-menu__item"
                              onClick={() => handleAddWidget(hw.id)}
                            >
                              <AppIcon name={meta?.icon || 'activity'} size={15} />
                              <div className="shiin-dash-menu__item-copy">
                                <strong>{isZh ? meta?.titleZh : meta?.titleEn}</strong>
                                <small>{isZh ? meta?.descriptionZh : meta?.descriptionEn}</small>
                              </div>
                              <AppIcon name="plus" size={13} />
                            </button>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  className="shiin-dash-btn is-ghost"
                  onClick={handleResetLayout}
                  title={isZh ? '恢复系统默认网格排版' : 'Reset default layout'}
                >
                  <AppIcon name="restore" size={16} />
                  <span>{isZh ? '重置布局' : 'Reset'}</span>
                </button>
              </>
            )}

            {/* Data options */}
            <div className="shiin-dash-hero__data-tools">
              <button
                type="button"
                className="shiin-dash-btn is-ghost"
                onClick={onSeedDemoData}
                title={isZh ? '载入包含《终末地》等游戏示例的统计数据' : 'Load sample statistics'}
              >
                <AppIcon name="dice" size={16} />
                <span>{isZh ? '演示数据' : 'Demo Data'}</span>
              </button>
              <button
                type="button"
                className="shiin-dash-btn is-ghost is-danger"
                onClick={onClearData}
                title={isZh ? '清空所有统计与事件流记录' : 'Clear all stats and event log'}
              >
                <AppIcon name="trash" size={16} />
                <span>{isZh ? '清空' : 'Clear'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Dashboard Grid Container */}
        <section
          className={`shiin-dash-grid ${isEditing ? 'is-editing' : ''}`}
          aria-label={isZh ? '模块网格' : 'Widget grid'}
        >
          {visibleWidgets.map((item) => (
            <div
              key={item.id}
              className={`shiin-dash-cell shiin-dash-cell--${item.size}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(item.id, e)}
            >
              <div
                draggable={isEditing}
                onDragStart={(e) => handleDragStart(item.id, e)}
                style={{ height: '100%' }}
              >
                {renderWidget(item)}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
