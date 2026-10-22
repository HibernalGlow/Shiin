import * as React from 'react'
import { AppIcon } from '../AppIcon.js'
import { BUILTIN_PROFILES, type CaptureProfile } from '../../../core/profile.js'

interface ProfileBadgeProps {
  profileId: string
  locale?: string
  showDescription?: boolean
  className?: string
}

export const ProfileBadge: React.FC<ProfileBadgeProps> = ({
  profileId,
  locale = 'zh',
  showDescription = false,
  className = '',
}) => {
  const isZh = locale.startsWith('zh')
  const profile: CaptureProfile =
    BUILTIN_PROFILES.find((p) => p.id === profileId) || BUILTIN_PROFILES[0]

  const name = isZh ? profile.nameZh : profile.nameEn

  return (
    <span
      className={`shiin-profile-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: '999px',
        backgroundColor: 'var(--md-sys-color-surface-container-high, rgba(128,128,128,0.12))',
        color: 'var(--shiin-ink, #343831)',
        border: '1px solid var(--shiin-line-soft, rgba(128,128,128,0.2))',
        fontSize: '11.5px',
        fontWeight: 650,
        letterSpacing: '0.02em',
      }}
      title={isZh ? profile.descriptionZh : profile.descriptionEn}
    >
      <span style={{ color: 'var(--md-sys-color-secondary, #62652f)', display: 'flex' }}>
        <AppIcon name={profile.icon} size={13} />
      </span>
      <span>{name}</span>
      {showDescription && (
        <span style={{ opacity: 0.7, fontWeight: 400, marginLeft: '4px', color: 'var(--shiin-muted)' }}>
          · {isZh ? profile.descriptionZh : profile.descriptionEn}
        </span>
      )}
    </span>
  )
}
