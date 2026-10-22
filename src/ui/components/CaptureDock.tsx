import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { ScreenshotResult } from '../../core/types.js'
import { useMd3eShapes } from '../md3e-shape-context.js'
import { getPressedShape } from '../md3e-shapes.js'
import { AppIcon } from './AppIcon.js'
import { Md3eMorphShape } from './bento-controls.js'

export type WorkspaceDestination = 'workspace' | 'analytics' | 'settings'

interface CaptureDockProps {
  destination: WorkspaceDestination
  onNavigate: (next: WorkspaceDestination) => void
  onCapture: () => void
  onToggleListen: () => void
  onSaveOBS: () => void
  onOpenFolder: () => void
  listening: boolean
  pending: boolean
  result: ScreenshotResult | null
  notice: string
  noticeRevision: number
  locale: string
}

/**
 * Adaptive navigation & capture surfaces across breakpoints:
 * - Tablet (600px–1199px): Left Expressive Navigation Rail (.shiin-tablet-rail) with top morphing Shutter FAB
 * - Mobile (<600px): Bottom Floating Two-Zone Dock (.shiin-dock-base) with navigation pill + independent Shutter FAB
 * - Desktop (>=1200px): Navigation lives in TitleBar and primary shutter lives in the Bento Hero stage
 */
export function CaptureDock({
  destination,
  onNavigate,
  onCapture,
  onToggleListen,
  onSaveOBS,
  onOpenFolder,
  listening,
  pending,
  result,
  notice,
  noticeRevision,
  locale,
}: CaptureDockProps) {
  const isZh = locale.startsWith('zh')
  const reduced = useReducedMotion()
  const { session } = useMd3eShapes()
  const [pressed, setPressed] = React.useState(false)

  const items: { id: WorkspaceDestination; label: string; icon: string }[] = [
    { id: 'workspace', label: isZh ? '工作台' : 'Workspace', icon: 'monitor' },
    { id: 'analytics', label: isZh ? '统计' : 'Analytics', icon: 'barChart' },
    { id: 'settings', label: isZh ? '设置' : 'Settings', icon: 'settings' },
  ]

  return (
    <>
      {/* Tablet Expressive Navigation Rail (600px – 1199px only) */}
      <aside className="shiin-tablet-rail" aria-label={isZh ? '平板导航栏' : 'Tablet navigation rail'}>
        <motion.button
          type="button"
          className="shiin-tablet-rail__shutter"
          onClick={onCapture}
          disabled={pending}
          aria-label={isZh ? '立即截图' : 'Capture now'}
          aria-busy={pending}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onPointerLeave={() => setPressed(false)}
          onPointerCancel={() => setPressed(false)}
          onBlur={() => setPressed(false)}
          whileHover={reduced ? undefined : { rotate: -4, scale: 1.05 }}
          whileTap={reduced ? undefined : { scale: 0.9, rotate: 4 }}
          transition={{ type: 'spring', stiffness: 380, damping: 23 }}
        >
          <Md3eMorphShape
            path={session.shapes.hero.svgPath}
            pressed={pressed || pending}
            pressedPath={getPressedShape(session.shapes.hero.id).svgPath}
            className="shiin-tablet-rail__shutter-shape"
          />
          <span className="shiin-tablet-rail__shutter-face">
            <AppIcon name={pending ? 'clock' : 'camera'} size={22} />
            <strong>{pending ? (isZh ? '捕获' : 'Busy') : isZh ? '快门' : 'Shot'}</strong>
          </span>
        </motion.button>

        <nav className="shiin-tablet-rail__nav" role="tablist" aria-label={isZh ? '平板主导航' : 'Tablet navigation'}>
          {items.map((item, index) => {
            const active = destination === item.id
            return (
              <button
                key={item.id}
                id={`rail-tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="shiin-main-panel"
                tabIndex={active ? 0 : -1}
                title={item.label}
                aria-label={item.label}
                onClick={() => onNavigate(item.id)}
                onKeyDown={(event) => {
                  if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return
                  event.preventDefault()
                  const next =
                    event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? items.length - 1
                        : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
                  onNavigate(items[next].id)
                  document.getElementById(`rail-tab-${items[next].id}`)?.focus()
                }}
              >
                <span className="shiin-tablet-rail__indicator">
                  <AppIcon name={item.icon} size={20} />
                </span>
                <span className="shiin-tablet-rail__label">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="shiin-tablet-rail__actions" role="group" aria-label={isZh ? '监听与回放' : 'Listener and replay'}>
          <button
            type="button"
            className="shiin-tablet-rail__action"
            aria-pressed={listening}
            onClick={onToggleListen}
            title={listening ? (isZh ? '暂停监听' : 'Pause listener') : isZh ? '开启监听' : 'Start listening'}
            aria-label={listening ? (isZh ? '暂停监听' : 'Pause listener') : isZh ? '开启监听' : 'Start listening'}
          >
            <AppIcon name={listening ? 'stop' : 'play'} size={18} />
          </button>
          <button
            type="button"
            className="shiin-tablet-rail__action"
            onClick={onSaveOBS}
            title={isZh ? '保存 OBS 回放' : 'Save OBS replay'}
            aria-label={isZh ? '保存 OBS 回放' : 'Save OBS replay'}
          >
            <AppIcon name="wave" size={18} />
          </button>
          <button
            type="button"
            className="shiin-tablet-rail__action"
            onClick={onOpenFolder}
            title={isZh ? '打开截图目录' : 'Open capture folder'}
            aria-label={isZh ? '打开截图目录' : 'Open capture folder'}
          >
            <AppIcon name="folder" size={18} />
          </button>
        </div>
      </aside>

      {/* Mobile Two-Zone Floating Dock (<600px) */}
      <div className="shiin-dock-base">
        <motion.div
          className="shiin-dual-dock"
          initial={{ y: reduced ? 0 : 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        >
          <nav className="shiin-dock-navigation" role="tablist" aria-label={isZh ? '主导航' : 'Main navigation'}>
            {items.map((item, index) => {
              const active = destination === item.id
              return (
                <button
                  key={item.id}
                  id={`dock-tab-${item.id}`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls="shiin-main-panel"
                  tabIndex={active ? 0 : -1}
                  title={item.label}
                  aria-label={item.label}
                  onClick={() => onNavigate(item.id)}
                  onKeyDown={(event) => {
                    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
                    event.preventDefault()
                    const next =
                      event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? items.length - 1
                          : (index + (event.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length
                    onNavigate(items[next].id)
                    document.getElementById(`dock-tab-${items[next].id}`)?.focus()
                  }}
                >
                  <span className="shiin-dock-navigation__icon">
                    <AppIcon name={item.icon} size={18} />
                  </span>
                  <span className="shiin-dock-navigation__label" aria-hidden="true">
                    <span className="shiin-dock-navigation__label-inner">{item.label}</span>
                  </span>
                </button>
              )
            })}
          </nav>

          <motion.button
            type="button"
            className="shiin-dock-shutter"
            onClick={onCapture}
            disabled={pending}
            aria-label={isZh ? '立即截图' : 'Capture now'}
            aria-busy={pending}
            onPointerDown={() => setPressed(true)}
            onPointerUp={() => setPressed(false)}
            onPointerLeave={() => setPressed(false)}
            onPointerCancel={() => setPressed(false)}
            onBlur={() => setPressed(false)}
            whileHover={reduced ? undefined : { rotate: -4, scale: 1.04 }}
            whileTap={reduced ? undefined : { scale: 0.9, rotate: 4 }}
            animate={pending && !reduced ? { scale: 0.94, rotate: 8 } : { scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 23 }}
          >
            <Md3eMorphShape
              path={session.shapes.hero.svgPath}
              pressed={pressed || pending}
              pressedPath={getPressedShape(session.shapes.hero.id).svgPath}
              className="shiin-dock-shutter__shape"
            />
            <span className="shiin-dock-shutter__face">
              <AppIcon name={pending ? 'clock' : 'camera'} size={24} />
              <strong>{pending ? (isZh ? '捕获中' : 'Capturing') : isZh ? '截图' : 'Capture'}</strong>
            </span>
          </motion.button>
        </motion.div>
      </div>
    </>
  )
}
