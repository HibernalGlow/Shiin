/** Xaihi command panel: the same equipment palette and controls as the desktop. */
import * as React from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { registerExpressiveStyles } from './expressive-theme.js'
import { AppIcon } from './components/AppIcon.js'

export const Probe = { react: React, version: React.version }

export interface XaihiPanelProps {
  contribution: { id: string; title: { zh: string; en: string }; area?: string }
  locale?: 'zh' | 'en'
  host: { runCommand(line: string): Promise<{ ok: boolean; text?: string; reason?: string }> }
}

const PANEL_ACTIONS = [
  { line: '/shiin capture', zh: '立即截图', en: 'Capture now', icon: 'camera', tone: 'primary' },
  { line: '/shiin start', zh: '开启监听', en: 'Start listening', icon: 'play', tone: 'olive' },
  { line: '/shiin stop', zh: '暂停监听', en: 'Stop listening', icon: 'stop', tone: 'plain' },
  { line: '/shiin replay', zh: '保存回放', en: 'Save replay', icon: 'wave', tone: 'plain' },
  { line: '/shiin status', zh: '检查状态', en: 'Check status', icon: 'info', tone: 'plain' },
  { line: '/shiin list', zh: '手柄设备', en: 'Gamepads', icon: 'gamepad', tone: 'plain' },
] as const

export default function Panel({ contribution, locale = 'zh', host }: XaihiPanelProps): React.ReactElement {
  const isZh = locale === 'zh'
  const [output, setOutput] = React.useState('')
  const [busy, setBusy] = React.useState<string | null>(null)
  const [failed, setFailed] = React.useState(false)
  const busyRef = React.useRef(false)
  React.useEffect(registerExpressiveStyles, [])

  const runAction = async (action: typeof PANEL_ACTIONS[number]) => {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(action.line)
    setFailed(false)
    try {
      const outcome = await host.runCommand(action.line)
      setFailed(!outcome.ok)
      setOutput(`${action.line}\n${outcome.ok ? (outcome.text || (isZh ? '命令已完成' : 'Command completed')) : outcome.reason || (isZh ? '命令未完成' : 'Command failed')}`)
    } catch (error) {
      setFailed(true)
      setOutput(`${action.line}\n${error instanceof Error ? error.message : String(error)}`)
    } finally { busyRef.current = false; setBusy(null) }
  }

  return <MotionConfig reducedMotion="user"><section className="shiin-panel" data-testid="shiin-panel" data-ui-variant="expressive">
    <div className="shiin-panel__heading"><span className="shiin-brand__mark"><AppIcon name="gamepad" size={25} /></span>
      <div><p className="shiin-kicker">Shiin / Xaihi</p><h2>{isZh ? contribution.title.zh : contribution.title.en}</h2>
        <p>{isZh ? '从手柄输入，到这一帧的交付。' : 'From controller input to a frame worth keeping.'}</p></div>
    </div>
    <div className="shiin-panel__actions">{PANEL_ACTIONS.map(action => <motion.button type="button" key={action.line}
      className={`shiin-action shiin-action--${action.tone}`} disabled={busy !== null} aria-busy={busy === action.line}
      whileTap={{ scale: 0.96 }} onClick={() => void runAction(action)}>
      <AppIcon name={busy === action.line ? 'clock' : action.icon} size={17} />
      {busy === action.line ? (isZh ? '执行中…' : 'Running…') : isZh ? action.zh : action.en}
    </motion.button>)}</div>
    <div className="shiin-panel__console" data-error={failed}>
      <div><span>{isZh ? '命令反馈' : 'Command response'}</span><span>DSH</span></div>
      <AnimatePresence mode="wait" initial={false}><motion.pre key={output} role="status" aria-live="polite"
        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
        {output || (isZh ? '等待操作。选择快门、监听，或检查当前设备。' : 'Waiting. Capture, listen, or check your devices.')}
      </motion.pre></AnimatePresence>
    </div>
  </section></MotionConfig>
}
