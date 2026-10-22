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
  device?: string
  target: string
  output: string
  folder: string
  permissionMissing: boolean
  onCapture: () => void
  onToggleListen: () => void
  onSaveOBS: () => void
  onOpenFolder: () => void
  onOpenPermissions: () => void
  notice?: string
}

/** The shutter is a control; its iris and signal rail follow real capture state. */
export function EquipmentDeck({ locale, listening, pending, result, device, target, output, folder,
  permissionMissing, onCapture, onToggleListen, onSaveOBS, onOpenFolder, onOpenPermissions, notice,
}: EquipmentDeckProps) {
  const isZh = locale.startsWith('zh')
  const { session } = useMd3eShapes()
  const reduced = useReducedMotion()
  const [pressed, setPressed] = React.useState(false)
  const state = pending ? 'capturing' : result ? (result.ok ? 'success' : 'error') : 'idle'
  const status = pending ? (isZh ? '正在捕获' : 'Capturing') : result
    ? result.ok ? (isZh ? '这一帧，已收好' : 'Frame delivered') : (isZh ? '捕获未完成' : 'Capture failed')
    : permissionMissing ? (isZh ? '屏幕权限待授权' : 'Screen permission required') : (isZh ? '快门待命' : 'Shutter ready')
  const fileName = result?.filePath?.split(/[\\/]/).pop()

  return (
    <motion.section className="oil-equipment" data-state={state} data-listening={listening}
      aria-label={isZh ? '截图器材台' : 'Capture equipment desk'}
      initial={{ opacity: 0, y: reduced ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="oil-equipment__heading">
        <div><p className="oil-kicker">{isZh ? '你的截图工作台' : 'Your capture desk'}</p>
          <h1>{isZh ? '留住，这一帧。' : 'Keep this frame.'}</h1></div>
        <button type="button" className="oil-readiness" data-warning={permissionMissing} onClick={onOpenPermissions}>
          <i aria-hidden="true" />{permissionMissing ? (isZh ? '检查权限' : 'Check permissions') : (isZh ? '手动快门可用' : 'Manual capture available')}<AppIcon name="chevronRight" size={14} />
        </button>
      </div>
      <div className="oil-viewfinder">
        <div className="oil-viewfinder__top"><span>SHIIN <span className="oil-mono">/</span> {isZh ? '即时捕获' : 'INSTANT CAPTURE'}</span>
          <span className="oil-live" data-active={listening}><i />{listening ? (isZh ? '正在监听' : 'Listening') : (isZh ? '手动快门' : 'Manual shutter')}</span></div>
        <div className="oil-viewfinder__body">
          <div className="oil-endpoint oil-endpoint--input">
            <span className="oil-endpoint__port"><AppIcon name="gamepad" size={24} /></span>
            <span className="oil-kicker">{isZh ? '输入端' : 'Input'}</span>
            <strong>{device || (isZh ? '等待手柄接入' : 'Connect a gamepad')}</strong>
            <p>{device ? (listening ? (isZh ? '组合键监听已接通' : 'Combo listener connected') : (isZh ? '开启监听以使用组合键' : 'Enable listening for combos')) : (isZh ? '也可以直接按下快门' : 'You can still capture manually')}</p>
          </div>
          <div className="oil-shutter-stage">
            <svg className="oil-shutter-ruler" viewBox="0 0 260 260" aria-hidden="true">
              <circle cx="130" cy="130" r="122" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1 10" />
              <path d="M130 0v13M260 130h-13M130 260v-13M0 130h13" fill="none" stroke="currentColor" />
            </svg>
            <motion.button type="button" className="oil-shutter" onClick={onCapture} disabled={pending}
              aria-label={isZh ? '立即截图' : 'Capture now'} aria-busy={pending}
              onPointerDown={() => setPressed(true)} onPointerUp={() => setPressed(false)}
              onPointerLeave={() => setPressed(false)} onPointerCancel={() => setPressed(false)} onBlur={() => setPressed(false)}
              whileHover={reduced ? undefined : { rotate: -5, scale: 1.035 }}
              whileTap={reduced ? undefined : { scale: 0.9, rotate: 6 }}
              animate={pending && !reduced ? { rotate: [0, 90, 180], scale: [1, 0.94, 1] } : { rotate: 0, scale: 1 }}
              transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 350, damping: 19 }}>
              <Md3eMorphShape path={session.shapes.hero.svgPath} pressed={pressed || pending}
                pressedPath={getPressedShape(session.shapes.hero.id).svgPath} className="oil-shutter__shape" />
              <span className="oil-shutter__face"><AppIcon name={pending ? 'clock' : 'camera'} size={36} />
                <strong>{pending ? (isZh ? '捕获中' : 'Capturing') : (isZh ? '立即截图' : 'Capture')}</strong>
                <span>{isZh ? '按下 · 留住' : 'PRESS TO KEEP'}</span>
              </span>
            </motion.button>
            <span className="oil-shutter-stage__caption">{target}</span>
          </div>
          <div className="oil-endpoint oil-endpoint--output">
            <motion.span className="oil-endpoint__port" key={result?.timestamp ?? 'waiting'}
              initial={result && !reduced ? { scale: 0.65, rotate: -15 } : false} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 14 }}>
              <AppIcon name={result ? (result.ok ? 'check' : 'alert') : 'save'} size={24} />
            </motion.span>
            <span className="oil-kicker">{isZh ? '输出端' : 'Output'}</span>
            <strong>{fileName || (result?.ok ? (isZh ? '已写入剪贴板' : 'Copied to clipboard') : output)}</strong>
            <p>{result && !result.ok ? result.error : (isZh ? '结果在这里交付' : 'Your result arrives here')}</p>
          </div>
        </div>
        <div className="oil-signal-rail" aria-hidden="true"><i /><span /><i /><span /><i /></div>
        <div className="oil-telemetry">
          <div><span>{isZh ? '手柄' : 'Controller'}</span><strong>{device || (isZh ? '未连接' : 'Not connected')}</strong></div>
          <div><span>{isZh ? '捕获目标' : 'Target'}</span><strong>{target}</strong></div>
          <button type="button" onClick={onOpenFolder} title={folder}><span>{isZh ? '输出' : 'Output'}</span><strong>{output}<AppIcon name="external" size={13} /></strong></button>
        </div>
        <AnimatePresence initial={false}>{(pending || result) && <motion.div className="oil-delivery" role="status" aria-live="polite"
          key={pending ? 'pending' : result?.timestamp} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
          <AppIcon name={pending ? 'clock' : result?.ok ? 'check' : 'alert'} size={17} />
          <strong>{status}</strong><span title={result?.filePath || undefined}>{pending ? (isZh ? '正在获取画面…' : 'Acquiring frame…') : result?.filePath || result?.error || (isZh ? '系统剪贴板' : 'System clipboard')}</span>
        </motion.div>}</AnimatePresence>
      </div>
      <div className="oil-equipment__controls">
        <div className="oil-joined" role="group" aria-label={isZh ? '捕获操作' : 'Capture actions'}>
          <motion.button type="button" data-listening={listening} onClick={onToggleListen} whileTap={{ scale: 0.97 }}>
            <AppIcon name={listening ? 'stop' : 'play'} size={16} />{listening ? (isZh ? '暂停监听' : 'Pause listener') : (isZh ? '开启监听' : 'Start listening')}
          </motion.button>
          <motion.button type="button" onClick={onSaveOBS} whileTap={{ scale: 0.97 }}><AppIcon name="wave" size={17} />{isZh ? '保存 OBS 回放' : 'Save OBS replay'}</motion.button>
          <motion.button type="button" onClick={onOpenFolder} whileTap={{ scale: 0.97 }}><AppIcon name="folder" size={17} />{isZh ? '打开目录' : 'Open folder'}</motion.button>
        </div>
        <span className="oil-equipment__notice" role="status">{notice || (isZh ? '手动快门随时可用，组合键需要开启监听。' : 'Capture manually anytime; enable listening for combos.')}</span>
      </div>
    </motion.section>
  )
}
