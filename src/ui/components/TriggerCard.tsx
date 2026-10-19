import * as React from 'react'
import { AppIcon } from './AppIcon.js'
import type { ScreenshotConfig, GamepadDeviceInfo } from '../../core/types.js'

export interface TriggerCardProps {
  config: ScreenshotConfig
  onChange: (patch: Partial<ScreenshotConfig>) => void
  gamepads: GamepadDeviceInfo[]
  selectedGamepadIndex: number
  onSelectGamepad: (index: number) => void
  onDetectGamepadKey?: (comboIndex: number) => void
  detectingComboIndex?: number
  onDetectKeyboardKey?: () => void
  detectingKeyboard?: boolean
  locale?: 'zh' | 'en'
}

export const TriggerCard: React.FC<TriggerCardProps> = ({
  config,
  onChange,
  gamepads,
  selectedGamepadIndex,
  onSelectGamepad,
  onDetectGamepadKey,
  detectingComboIndex = -1,
  onDetectKeyboardKey,
  detectingKeyboard = false,
  locale = 'zh',
}) => {
  const isZh = locale === 'zh'

  const addCombo = () => {
    onChange({ comboKeys: [...config.comboKeys, 'Button0'] })
  }

  const removeCombo = (idx: number) => {
    const next = [...config.comboKeys]
    next.splice(idx, 1)
    onChange({ comboKeys: next })
  }

  const updateComboKey = (idx: number, val: string) => {
    const next = [...config.comboKeys]
    next[idx] = val
    onChange({ comboKeys: next })
  }

  return (
    <div className="shiin-card" style={{ gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ padding: 4, borderRadius: 6, background: 'var(--surface-2)' }}>
            <AppIcon name="gamepad" size={14} />
          </div>
          <span style={{ fontWeight: 600, fontSize: 13 }}>{isZh ? '手柄与触发' : 'Controller & Trigger'}</span>
        </div>
        <button
          className="shiin-btn"
          data-variant="tonal"
          onClick={addCombo}
          style={{ height: 26, padding: '0 8px', fontSize: 11 }}
        >
          <AppIcon name="plus" size={12} />
          {isZh ? '加组合键' : 'Add Key'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
        {/* 选择手柄 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}>
            <AppIcon name="gamepad" size={13} />
            {isZh ? '活动手柄' : 'Active Gamepad'}
          </span>
          <select
            className="shiin-select"
            style={{ maxWidth: 220 }}
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

        {/* 组合键列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {config.comboKeys.map((key, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 16, textAlign: 'center', color: 'var(--ink-3)', fontSize: 10 }}>
                {idx + 1}
              </span>
              <input
                className="shiin-input"
                style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
                value={key}
                onChange={(e) => updateComboKey(idx, e.target.value)}
              />
              {onDetectGamepadKey && (
                <button
                  className="shiin-btn"
                  data-variant={detectingComboIndex === idx ? 'filled' : 'ghost'}
                  onClick={() => onDetectGamepadKey(idx)}
                  style={{ height: 30, padding: '0 8px', fontSize: 11 }}
                >
                  {detectingComboIndex === idx ? (isZh ? '请按手柄…' : 'Press...') : (isZh ? '识别' : 'Detect')}
                </button>
              )}
              <button
                className="shiin-btn"
                data-variant="danger"
                onClick={() => removeCombo(idx)}
                style={{ height: 30, padding: '0 8px' }}
                title={isZh ? '删除' : 'Delete'}
              >
                <AppIcon name="trash" size={12} />
              </button>
            </div>
          ))}
          {config.comboKeys.length === 0 && (
            <div style={{
              padding: '8px 10px',
              border: '1px dashed var(--line-strong)',
              borderRadius: 8,
              fontSize: 11,
              color: 'var(--ink-3)',
              textAlign: 'center',
            }}>
              {isZh ? '暂无手柄按键组合，点击右上角「加组合键」添加' : 'No combo keys, click Add Key above'}
            </div>
          )}
        </div>

        {/* 键盘辅助热键 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 6,
          borderTop: '1px dashed var(--line, rgba(255, 255, 255, 0.08))',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}>
            <AppIcon name="keyboard" size={13} />
            {isZh ? '键盘热键触发' : 'Keyboard Trigger'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {config.keyboardTrigger && (
              <>
                <span style={{
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'var(--surface-2)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                }}>
                  {config.keyboardTriggerKeyCode ? `KeyCode: ${config.keyboardTriggerKeyCode}` : 'None'}
                </span>
                {onDetectKeyboardKey && (
                  <button
                    className="shiin-btn"
                    data-variant={detectingKeyboard ? 'filled' : 'ghost'}
                    onClick={onDetectKeyboardKey}
                    style={{ height: 26, padding: '0 8px', fontSize: 10 }}
                  >
                    {detectingKeyboard ? (isZh ? '请按键盘…' : 'Press...') : (isZh ? '识别' : 'Detect')}
                  </button>
                )}
              </>
            )}
            <input
              type="checkbox"
              checked={config.keyboardTrigger}
              onChange={(e) => onChange({ keyboardTrigger: e.target.checked })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
