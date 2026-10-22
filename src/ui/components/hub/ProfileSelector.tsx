import * as React from 'react'
import { BUILTIN_PROFILES } from '../../../core/profile.js'
import { AppIcon } from '../AppIcon.js'

interface ProfileSelectorProps {
  selectedProfileId?: string
  onSelectProfile: (id: string | undefined) => void
  locale?: string
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  selectedProfileId,
  onSelectProfile,
  locale = 'zh',
}) => {
  const isZh = locale.startsWith('zh')

  return (
    <div
      className="shiin-dash-tabs"
      role="group"
      aria-label={isZh ? '场景配置筛选' : 'Capture Profile filter'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        overflowX: 'auto',
        maxWidth: '100%',
        padding: '3px',
      }}
    >
      <button
        type="button"
        className={`shiin-dash-tab ${!selectedProfileId ? 'is-active' : ''}`}
        onClick={() => onSelectProfile(undefined)}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <AppIcon name="filter" size={12} />
          <span>{isZh ? '全部' : 'All'}</span>
        </span>
      </button>

      {BUILTIN_PROFILES.map((p) => {
        const isSelected = selectedProfileId === p.id
        return (
          <button
            key={p.id}
            type="button"
            className={`shiin-dash-tab ${isSelected ? 'is-active' : ''}`}
            onClick={() => onSelectProfile(isSelected ? undefined : p.id)}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <AppIcon name={p.icon} size={12} />
              <span>{isZh ? p.nameZh : p.nameEn}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
