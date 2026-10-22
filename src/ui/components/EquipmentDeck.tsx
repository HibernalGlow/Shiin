import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { AppIcon } from './AppIcon.js'
import { Md3eMorphShape } from './bento-controls.js'
import { useMd3eShapes } from '../md3e-shape-context.js'
import { getPressedShape } from '../md3e-shapes.js'
import type { ScreenshotResult } from '../../core/types.js'

export interface EquipmentDeckProps {
  locale: string
  listening: boolean
  pending: boolean
  result: ScreenshotResult | null
  target: string
  output: string
  permissionMissing: boolean
  onCapture: () => void
  onToggleListen: () => void
  onSaveOBS: () => void
  onOpenFolder: () => void
  onOpenPermissions: () => void
  notice?: string
  noticeRevision?: number
}

/** A compact capture surface keeps the source controls in the first viewport. */
export function EquipmentDeck({ locale, listening, pending, result, target, output,
  permissionMissing, onCapture, onToggleListen, onSaveOBS, onOpenFolder, onOpenPermissions, notice, noticeRevision,
}: EquipmentDeckProps) {
  const isZh = locale.startsWith('zh')
  const { session } = useMd3eShapes()
  const reduced = useReducedMotion()
  const [pressed, setPressed] = React.useState(false)
  const [activeResult, setActiveResult] = React.useState(result)
  // Later actions replace the capture message; a fresh capture wins its own completion notice.
  React.useEffect(() => setActiveResult(null), [notice, noticeRevision])
  React.useEffect(() => setActiveResult(result), [result])
  const fileName = activeResult?.filePath?.split(/[\\/]/).pop()
  const resultText = activeResult ? (activeResult.ok
    ? fileName || (isZh ? '已复制到剪贴板' : 'Copied to clipboard')
    : activeResult.error || (isZh ? '截图未完成' : 'Capture failed')) : ''

  return <motion.section className="shiin-capture-desk" aria-label={isZh ? '截图工作台' : 'Capture workspace'}
    initial={{ opacity: 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 28 }} data-busy={pending}>
    <div className="shiin-capture-desk__copy">
      <h1>{isZh ? '截图工作台' : 'Capture workspace'}</h1>
      <p className="shiin-capture-context"><AppIcon name="monitor" size={17} /><span>{target}</span><span className="shiin-capture-context__output">{output}</span></p>
      <div className="shiin-desk-actions" role="group" aria-label={isZh ? '快捷操作' : 'Quick actions'}>
        <motion.button type="button" aria-pressed={listening} whileTap={reduced ? undefined : { scale: 0.95 }} onClick={onToggleListen}>
          <AppIcon name={listening ? 'stop' : 'play'} size={18} />{listening ? (isZh ? '暂停监听' : 'Pause listener') : (isZh ? '开启监听' : 'Start listening')}
        </motion.button>
        <motion.button type="button" whileTap={reduced ? undefined : { scale: 0.95 }} onClick={onSaveOBS}>
          <AppIcon name="wave" size={18} />{isZh ? '保存回放' : 'Save replay'}
        </motion.button>
        <button type="button" onClick={onOpenFolder} aria-label={isZh ? '打开截图目录' : 'Open capture folder'}><AppIcon name="folder" size={19} /></button>
      </div>
    </div>
    <motion.button type="button" className="shiin-shutter" onClick={onCapture} disabled={pending}
      aria-label={isZh ? '立即截图' : 'Capture now'} aria-busy={pending}
      onPointerDown={() => setPressed(true)} onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)} onPointerCancel={() => setPressed(false)} onBlur={() => setPressed(false)}
      whileHover={reduced ? undefined : { rotate: -5, scale: 1.045 }}
      whileTap={reduced ? undefined : { scale: 0.9, rotate: 5 }}
      animate={pending && !reduced ? { scale: 0.93, rotate: 12 } : { scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 21 }}>
      <Md3eMorphShape path={session.shapes.hero.svgPath} pressed={pressed || pending}
        pressedPath={getPressedShape(session.shapes.hero.id).svgPath} className="shiin-shutter__shape" />
      <span className="shiin-shutter__face"><AppIcon name={pending ? 'clock' : 'camera'} size={30} />
        <strong>{pending ? (isZh ? '捕获中' : 'Capturing') : (isZh ? '立即截图' : 'Capture now')}</strong></span>
    </motion.button>
    {permissionMissing && <button className="shiin-permission-notice" type="button" onClick={onOpenPermissions}>
      <AppIcon name="shield" size={18} /><span>{isZh ? '截图需要屏幕录制权限' : 'Screen recording permission is required'}</span>
      <strong>{isZh ? '前往设置' : 'Open settings'}</strong><AppIcon name="chevronRight" size={16} />
    </button>}
    <AnimatePresence initial={false}>
      {(activeResult || notice) && <motion.div className="shiin-capture-feedback" data-error={activeResult?.ok === false || (!activeResult && /失败|未保存|failed|not saved/i.test(notice || ''))}
        key={activeResult?.timestamp ?? noticeRevision ?? notice} role="status" aria-live="polite"
        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
        transition={{ duration: reduced ? 0 : 0.2 }}>
        <AppIcon name={activeResult ? activeResult.ok ? 'check' : 'alert' : 'info'} size={18} />
        <span>{activeResult ? resultText : notice}</span>
        {activeResult?.ok && activeResult.filePath && <button type="button" onClick={onOpenFolder}>{isZh ? '查看目录' : 'Open folder'}<AppIcon name="external" size={14} /></button>}
      </motion.div>}
    </AnimatePresence>
  </motion.section>
}
