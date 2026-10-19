import * as React from 'react'
import { AppIcon } from './AppIcon.js'
import {
  type ScreenshotConfig,
  ScreenshotSoundEnum,
} from '../../core/types.js'
import { SOUND_DEFINITIONS, playCaptureSound } from '../audio.js'

export interface AudioCardProps {
  config: ScreenshotConfig
  onChange: (patch: Partial<ScreenshotConfig>) => void
  onPlayTestSound?: () => void
  locale?: string
}

export const AudioCard: React.FC<AudioCardProps> = ({
  config,
  onChange,
  onPlayTestSound,
  locale = 'zh',
}) => {
  const isZh = locale.startsWith('zh')

  const handleTestSound = () => {
    if (onPlayTestSound) {
      onPlayTestSound()
    } else {
      void playCaptureSound(config.sound, config.soundPower)
    }
  }

  return (
    <div className="shiin-card" style={{ gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ padding: 4, borderRadius: 6, background: 'var(--surface-2)' }}>
            <AppIcon name="volume" size={14} />
          </div>
          <span style={{ fontWeight: 600, fontSize: 13 }}>{isZh ? '音效反馈' : 'Audio Feedback'}</span>
        </div>
        <span style={{
          fontSize: 10,
          padding: '2px 8px',
          borderRadius: 99,
          background: 'var(--surface-2)',
          color: 'var(--ink-2)',
        }}>
          {config.sound === ScreenshotSoundEnum.None ? (isZh ? '已静音' : 'Muted') : config.sound}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}>
            <AppIcon name="wave" size={13} />
            {isZh ? '快门音效' : 'Shutter Sound'}
          </span>
          <select
            className="shiin-select"
            value={config.sound}
            onChange={(e) => {
              const nextSound = e.target.value as ScreenshotSoundEnum
              onChange({ sound: nextSound })
              // 用户切换音效时自动试听一下，提升用户体验
              if (nextSound !== ScreenshotSoundEnum.None) {
                void playCaptureSound(nextSound, config.soundPower)
              }
            }}
          >
            {SOUND_DEFINITIONS.map((def) => (
              <option key={def.id} value={def.id}>
                {isZh ? def.zh : def.en}
              </option>
            ))}
            <option value={ScreenshotSoundEnum.None}>{isZh ? '静音 (无声音)' : 'Mute (None)'}</option>
          </select>
        </div>

        {config.sound !== ScreenshotSoundEnum.None && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}>
              <AppIcon name="sliders" size={13} />
              {isZh ? '音量大小' : 'Volume'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                style={{ width: 100 }}
                value={config.soundPower ?? 1}
                onChange={(e) => onChange({ soundPower: Number(e.target.value) })}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, width: 36, textAlign: 'right' }}>
                {Math.round((config.soundPower ?? 1) * 100)}%
              </span>
              <button
                className="shiin-btn"
                data-variant="tonal"
                onClick={handleTestSound}
                style={{ height: 26, padding: '0 8px', fontSize: 11 }}
                title={isZh ? '播放试听' : 'Test Sound'}
              >
                {isZh ? '试听' : 'Test'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
