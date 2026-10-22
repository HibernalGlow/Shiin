import * as React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AppIcon } from './AppIcon.js'
import { LANGUAGES, getLanguage } from '../i18n.js'
import type { MacOSPermissionsStatus } from '../adapter/types.js'

export interface TitleBarProps {
  listening: boolean
  uiScale: number
  onSetUiScale: (scale: number) => void
  locale?: string
  onSelectLocale?: (locale: string) => void
  onToggleLocale?: () => void
  maximized: boolean
  onMinimize: () => void
  onToggleMaximize: () => void
  onClose: () => void
  version?: string
  isMac?: boolean
  onOpenUpdate?: () => void
  hasUpdate?: boolean
  permissions?: MacOSPermissionsStatus | null
  onOpenPermissions?: () => void
}


const UI_SCALES = [0.9, 1, 1.1, 1.25]
const popoverMotion = {
  initial: { opacity: 0, y: -8, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -5, scale: 0.98 },
  transition: { duration: 0.18 },
}

export const TitleBar: React.FC<TitleBarProps> = ({
  listening, uiScale, onSetUiScale, locale = 'zh', onSelectLocale, onToggleLocale,
  maximized, onMinimize, onToggleMaximize, onClose, version = '2.0.0',
  isMac = false, onOpenUpdate, hasUpdate = false, permissions, onOpenPermissions,
}) => {
  const isZh = locale.startsWith('zh')
  const currentLang = getLanguage(locale)
  const [menu, setMenu] = React.useState<'scale' | 'language' | null>(null)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const missing = Boolean(permissions?.isMac && !permissions.allGranted)

  React.useEffect(() => {
    if (!menu) return
    const closeOutside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenu(null)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenu(null); triggerRef.current?.focus() }
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [menu])

  return (
    <header className="shiin-titlebar" data-mac={isMac}>
      <div className="shiin-titlebar__brand">
        <span className="shiin-titlebar__mark"><AppIcon name="camera" size={16} /></span>
        <strong className="shiin-titlebar__name">Shiin</strong>
        <button type="button" className="shiin-titlebar__version" onClick={onOpenUpdate}
          title={isZh ? '检查更新' : 'Check for updates'}>
          v{version}{hasUpdate && <span className="shiin-titlebar__update">{isZh ? '有更新' : 'NEW'}</span>}
        </button>
      </div>
      <div className="shiin-titlebar__status" data-listening={listening} role="status">
        <i aria-hidden="true" />{listening ? (isZh ? '监听已接通' : 'Listener connected') : (isZh ? '待命 · 随时捕获' : 'Standby · ready to capture')}
      </div>
      <div className="shiin-titlebar__actions" ref={menuRef}>
        {onOpenPermissions && <button type="button" className="shiin-titlebar-button" data-tone={missing ? 'danger' : 'default'}
          onClick={onOpenPermissions} aria-label={isZh ? '权限自检' : 'Permission diagnostics'}
          title={missing ? (isZh ? '有权限待处理' : 'Permissions need attention') : (isZh ? '权限自检' : 'Permission diagnostics')}>
          <AppIcon name="shield" size={16} />{missing && <i className="shiin-alert-dot" />}
        </button>}
        <div className="shiin-titlebar-menu">
          <button type="button" className="shiin-titlebar-button" data-active={menu === 'scale'}
            aria-label={isZh ? '界面缩放' : 'Interface scale'} aria-expanded={menu === 'scale'} aria-haspopup="true"
            onClick={(event) => { triggerRef.current = event.currentTarget; setMenu(menu === 'scale' ? null : 'scale') }}>
            <AppIcon name="textSize" size={16} />
          </button>
          <AnimatePresence>{menu === 'scale' && <motion.div className="shiin-titlebar-popover" {...popoverMotion}>
            {UI_SCALES.map(scale => <button type="button" key={scale} aria-pressed={uiScale === scale}
              onClick={() => { onSetUiScale(scale); setMenu(null); triggerRef.current?.focus() }}>
              {Math.round(scale * 100)}%{uiScale === scale && <AppIcon name="check" size={13} />}
            </button>)}
          </motion.div>}</AnimatePresence>
        </div>
        <div className="shiin-titlebar-menu">
          <button type="button" className="shiin-titlebar-button" data-active={menu === 'language'}
            aria-label={isZh ? '界面语言' : 'Interface language'} title={currentLang.native}
            aria-expanded={menu === 'language'} aria-haspopup="true"
            onClick={(event) => { triggerRef.current = event.currentTarget; setMenu(menu === 'language' ? null : 'language') }}>
            {currentLang.short}
          </button>
          <AnimatePresence>{menu === 'language' && <motion.div className="shiin-titlebar-popover" {...popoverMotion}>
            {LANGUAGES.map(lang => <button type="button" key={lang.code} aria-pressed={locale === lang.code}
              onClick={() => { if (onSelectLocale) onSelectLocale(lang.code); else onToggleLocale?.(); setMenu(null); triggerRef.current?.focus() }}>
              {lang.native}<small>{lang.short}</small>
            </button>)}
          </motion.div>}</AnimatePresence>
        </div>
        {!isMac && <div className="shiin-window-controls">
          <button type="button" className="shiin-window-button" onClick={onMinimize} aria-label={isZh ? '最小化' : 'Minimize'}><AppIcon name="minus" size={14} /></button>
          <button type="button" className="shiin-window-button" onClick={onToggleMaximize} aria-label={maximized ? (isZh ? '还原' : 'Restore') : (isZh ? '最大化' : 'Maximize')}><AppIcon name={maximized ? 'restore' : 'square'} size={13} /></button>
          <button type="button" className="shiin-window-button" data-close="true" onClick={onClose} aria-label={isZh ? '关闭' : 'Close'}><AppIcon name="close" size={14} /></button>
        </div>}
      </div>
    </header>
  )
}
