import * as React from 'react'
import { AppIcon } from './AppIcon.js'
import type { GamepadDeviceInfo } from '../../core/types.js'

export interface TesterViewProps {
  gamepads: GamepadDeviceInfo[]
  selectedGamepadIndex: number
  onSelectGamepad: (index: number) => void
  buttons: boolean[]
  axes: number[]
  locale?: 'zh' | 'en'
}

export const TesterView: React.FC<TesterViewProps> = ({
  gamepads,
  selectedGamepadIndex,
  onSelectGamepad,
  buttons,
  axes,
  locale = 'zh',
}) => {
  const isZh = locale === 'zh'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
            {isZh ? '手柄硬件测试器' : 'Gamepad Hardware Tester'}
          </h2>
          <p style={{ fontSize: 12, color: 'var(--ink-2)', margin: '4px 0 0' }}>
            {isZh ? '按下手柄按键或转动摇杆，实时测试硬件连接与键位响应' : 'Press buttons or tilt sticks to test live input'}
          </p>
        </div>
        <select
          className="shiin-select"
          style={{ minWidth: 200 }}
          value={selectedGamepadIndex}
          onChange={(e) => onSelectGamepad(Number(e.target.value))}
        >
          {gamepads.map((g) => (
            <option key={g._index} value={g._index}>
              {g.name}
            </option>
          ))}
          {gamepads.length === 0 && <option value={-1}>{isZh ? '未检测到手柄' : 'No gamepad'}</option>}
        </select>
      </div>

      {/* 按键指示阵列 */}
      <div className="shiin-card" style={{ gap: 10 }}>
        <span style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <AppIcon name="gamepad" size={14} />
          {isZh ? '按键与十字键响应' : 'Buttons & D-Pad'}
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {buttons.map((pressed, i) => (
            <div
              key={i}
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 600,
                background: pressed ? 'var(--accent, #b4f461)' : 'var(--surface-2, rgba(255, 255, 255, 0.05))',
                color: pressed ? 'var(--accent-ink, #000)' : 'var(--ink-2)',
                border: `1px solid ${pressed ? 'var(--accent)' : 'var(--line-strong)'}`,
                boxShadow: pressed ? '0 0 10px var(--accent-soft)' : 'none',
                transition: 'all 0.08s ease',
              }}
            >
              <span>B{i}</span>
              <span style={{ fontSize: 8 }}>{pressed ? 'ON' : 'OFF'}</span>
            </div>
          ))}
          {buttons.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--ink-3)', padding: 12 }}>
              {isZh ? '暂无按键数据，请先连接并打开手柄' : 'No button data, connect a gamepad first'}
            </div>
          )}
        </div>
      </div>

      {/* 摇杆轴偏转指示 */}
      <div className="shiin-card" style={{ gap: 10 }}>
        <span style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <AppIcon name="target" size={14} />
          {isZh ? '模拟轴（摇杆与线性扳机）' : 'Analog Axes & Triggers'}
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {axes.map((val, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              borderRadius: 6,
              background: 'var(--surface-2)',
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
            }}>
              <span style={{ color: 'var(--ink-2)' }}>Axis {idx}</span>
              <div style={{ width: 80, height: 6, background: 'var(--line-strong)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.round(((val + 1) / 2) * 100)}%`,
                  background: 'var(--accent)',
                  transition: 'width 0.05s ease',
                }} />
              </div>
              <span style={{ width: 45, textAlign: 'right' }}>{val.toFixed(2)}</span>
            </div>
          ))}
          {axes.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--ink-3)', padding: 12 }}>
              {isZh ? '暂无轴数据' : 'No axes data'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
