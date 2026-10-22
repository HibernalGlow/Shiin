import * as React from 'react'
import { AppIcon } from '../AppIcon.js'
import { DashboardWidgetFrame } from './DashboardWidgetFrame.js'
import type { WidgetSize } from '../../dashboard-layout.js'
import type { ActivityStatsData } from '../../../core/stats.js'
import { getButtonDisplayName, getButtonShortName } from './dashboard-utils.js'

export interface GamepadHeatmapWidgetProps {
  size: WidgetSize
  isEditing: boolean
  locale: string
  stats: ActivityStatsData
  activeDeviceName?: string
  onResize?: (size: WidgetSize) => void
  onMove?: (dir: 'prev' | 'next') => void
  onRemove?: () => void
}

export const GamepadHeatmapWidget: React.FC<GamepadHeatmapWidgetProps> = ({
  size,
  isEditing,
  locale,
  stats,
  activeDeviceName,
  onResize,
  onMove,
  onRemove,
}) => {
  const isZh = locale.startsWith('zh')
  const isWide = size === '3x2' || size === '4x2'

  const sortedButtons = React.useMemo(() => {
    return Object.entries(stats.buttonCounts).sort((a, b) => b[1] - a[1])
  }, [stats.buttonCounts])

  const totalPresses = React.useMemo(() => {
    return sortedButtons.reduce((acc, [, count]) => acc + count, 0) || 1
  }, [sortedButtons])

  const maxButtonPress = sortedButtons[0]?.[1] || 1

  // Category aggregates for expanded mode
  const categoryStats = React.useMemo(() => {
    let actionCount = 0
    let shoulderCount = 0
    let dpadCount = 0
    let otherCount = 0

    for (const [key, count] of Object.entries(stats.buttonCounts)) {
      if (['Button0', 'Button1', 'Button2', 'Button3'].includes(key)) {
        actionCount += count
      } else if (['Button4', 'Button5', 'Button6', 'Button7'].includes(key)) {
        shoulderCount += count
      } else if (['Button12', 'Button13', 'Button14', 'Button15'].includes(key)) {
        dpadCount += count
      } else {
        otherCount += count
      }
    }

    return {
      action: { count: actionCount, pct: Math.round((actionCount / totalPresses) * 100) },
      shoulder: { count: shoulderCount, pct: Math.round((shoulderCount / totalPresses) * 100) },
      dpad: { count: dpadCount, pct: Math.round((dpadCount / totalPresses) * 100) },
      other: { count: otherCount, pct: Math.round((otherCount / totalPresses) * 100) },
    }
  }, [stats.buttonCounts, totalPresses])

  const getHeatStyle = (key: string): React.CSSProperties => {
    const count = stats.buttonCounts[key] || 0
    const ratio = Math.min(1, count / maxButtonPress)
    if (count === 0) {
      return {
        background: 'var(--md-sys-color-surface-container)',
        color: 'var(--shiin-muted)',
        borderColor: 'transparent',
      }
    }
    return {
      background: `color-mix(in srgb, var(--md-sys-color-primary) ${Math.round(20 + ratio * 80)}%, var(--md-sys-color-surface-container-high))`,
      color: ratio > 0.4 ? 'var(--md-sys-color-on-primary)' : 'var(--shiin-ink)',
      boxShadow: ratio > 0.45 ? `0 0 ${Math.round(ratio * 14)}px rgba(200, 240, 0, ${ratio * 0.45})` : 'none',
      borderColor: ratio > 0.6 ? 'var(--md-sys-color-primary)' : 'transparent',
    }
  }

  const renderKey = (key: string, customLabel?: string) => {
    const count = stats.buttonCounts[key] || 0
    const label = customLabel || getButtonShortName(key)
    return (
      <div
        key={key}
        className="shiin-pad-key"
        style={getHeatStyle(key)}
        title={`${getButtonDisplayName(key, isZh)}: ${count} ${isZh ? '次' : 'presses'}`}
      >
        <span className="shiin-pad-key__name">{label}</span>
        <span className="shiin-pad-key__count">{count}</span>
      </div>
    )
  }

  return (
    <DashboardWidgetFrame
      id="gamepad_heatmap"
      size={size}
      isEditing={isEditing}
      locale={locale}
      onResize={onResize}
      onMove={onMove}
      onRemove={onRemove}
      badge={
        <span className="shiin-dash-chip">
          <AppIcon name="gamepad" size={12} />
          <span>{activeDeviceName || (isZh ? '通用手柄' : 'Controller')}</span>
        </span>
      }
    >
      <div className={`shiin-pad-heatmap ${isWide ? 'is-wide' : ''}`}>
        {/* Left Stage: Visual Schematic */}
        <div className="shiin-pad-schematic-pane">
          <div className="shiin-pad-schematic">
            {/* Top Shoulder & Trigger Rows */}
            <div className="shiin-pad-cluster is-shoulders">
              <div className="shiin-pad-pair">
                {renderKey('Button6', 'LT')}
                {renderKey('Button4', 'LB')}
              </div>
              <div className="shiin-pad-center-nav">
                {renderKey('Button8', 'Back')}
                {renderKey('Button16', 'Home')}
                {renderKey('Button9', 'Start')}
              </div>
              <div className="shiin-pad-pair">
                {renderKey('Button5', 'RB')}
                {renderKey('Button7', 'RT')}
              </div>
            </div>

            {/* Main Control Cluster: Dpad (Left), Sticks (Center), Diamond (Right) */}
            <div className="shiin-pad-main-row">
              {/* D-Pad cross */}
              <div className="shiin-pad-dpad-wrap">
                <span className="shiin-pad-cluster-label">{isZh ? '方向键' : 'D-Pad'}</span>
                <div className="shiin-pad-dpad">
                  <div className="shiin-pad-dpad__up">{renderKey('Button12', '↑')}</div>
                  <div className="shiin-pad-dpad__mid">
                    {renderKey('Button14', '←')}
                    <div className="shiin-pad-dpad__core" />
                    {renderKey('Button15', '→')}
                  </div>
                  <div className="shiin-pad-dpad__down">{renderKey('Button13', '↓')}</div>
                </div>
              </div>

              {/* Sticks */}
              <div className="shiin-pad-sticks">
                <div className="shiin-pad-stick-box">
                  {renderKey('Button10', 'L3')}
                  <small>{isZh ? '左摇杆' : 'Left Stick'}</small>
                </div>
                <div className="shiin-pad-stick-box">
                  {renderKey('Button11', 'R3')}
                  <small>{isZh ? '右摇杆' : 'Right Stick'}</small>
                </div>
              </div>

              {/* ABXY Action Diamond */}
              <div className="shiin-pad-diamond-wrap">
                <span className="shiin-pad-cluster-label">{isZh ? '动作键' : 'Action ABXY'}</span>
                <div className="shiin-pad-diamond">
                  <div className="shiin-pad-diamond__y">{renderKey('Button3', 'Y')}</div>
                  <div className="shiin-pad-diamond__mid">
                    {renderKey('Button2', 'X')}
                    <div className="shiin-pad-diamond__core" />
                    {renderKey('Button1', 'B')}
                  </div>
                  <div className="shiin-pad-diamond__a">{renderKey('Button0', 'A')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Heat Spectrum Legend */}
          <div className="shiin-pad-legend">
            <span>{isZh ? '低频 (0次)' : 'Cold'}</span>
            <div className="shiin-pad-legend__bar" />
            <span>{isZh ? `高频 (${maxButtonPress}次)` : 'Hot'}</span>
          </div>
        </div>

        {/* Right Stage: Detailed Button Analytics & Ranking */}
        <div className="shiin-pad-ranking-pane">
          {/* Category Distribution Pills (in wide mode) */}
          {isWide && (
            <div className="shiin-pad-categories">
              <div className="shiin-pad-cat-chip">
                <span>{isZh ? '动作键' : 'Action'}</span>
                <strong>{categoryStats.action.pct}%</strong>
              </div>
              <div className="shiin-pad-cat-chip">
                <span>{isZh ? '肩键/扳机' : 'Shoulders'}</span>
                <strong>{categoryStats.shoulder.pct}%</strong>
              </div>
              <div className="shiin-pad-cat-chip">
                <span>{isZh ? '方向键' : 'D-Pad'}</span>
                <strong>{categoryStats.dpad.pct}%</strong>
              </div>
              <div className="shiin-pad-cat-chip">
                <span>{isZh ? '摇杆/菜单' : 'Sticks'}</span>
                <strong>{categoryStats.other.pct}%</strong>
              </div>
            </div>
          )}

          <div className="shiin-pad-ranking">
            <div className="shiin-pad-ranking__head">
              <strong>{isZh ? '按键频次排名' : 'Key Press Rankings'}</strong>
              <small>{isZh ? '有效边缘检测 · 排除长按重采' : 'Edge detected · No hold duplicate'}</small>
            </div>
            <div className="shiin-pad-ranking__list">
              {sortedButtons.slice(0, isWide ? 7 : 5).map(([key, count], index) => {
                const pct = Math.round((count / totalPresses) * 100)
                return (
                  <div key={key} className="shiin-pad-ranking__item">
                    <span className="shiin-pad-ranking__pos">#{index + 1}</span>
                    <span className="shiin-pad-ranking__key">{getButtonDisplayName(key, isZh)}</span>
                    <div className="shiin-pad-ranking__bar">
                      <div
                        className="shiin-pad-ranking__bar-fill"
                        style={{ width: `${Math.round((count / maxButtonPress) * 100)}%` }}
                      />
                    </div>
                    <strong className="shiin-pad-ranking__count">{count} {isZh ? '次' : ''}</strong>
                    <span className="shiin-pad-ranking__pct">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardWidgetFrame>
  )
}
