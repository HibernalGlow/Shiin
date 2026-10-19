/**
 * Xaihi 标准微前端工作台面板 (Module Federation 导出组件)
 * 遵循 MD 3 Expressive 设计规范，严格对齐宿主主题 --xaihi-*
 */
import * as React from 'react'
import { registerKitStyles } from './tokens.js'
import { AppIcon } from './components/AppIcon.js'

export const Probe = { react: React, version: React.version }

export interface XaihiPanelProps {
  contribution: {
    id: string
    title: { zh: string; en: string }
    area?: string
  }
  locale?: 'zh' | 'en'
  host: {
    runCommand(line: string): Promise<{ ok: boolean; text?: string; reason?: string }>
  }
}

interface ActionBtn {
  line: string
  zh: string
  en: string
  variant: 'filled' | 'tonal' | 'ghost' | 'danger'
  icon: string
}

const PANEL_ACTIONS: ActionBtn[] = [
  { line: '/shiin status', zh: '检查状态', en: 'Status', variant: 'ghost', icon: 'info' },
  { line: '/shiin capture', zh: '执行截图', en: 'Capture', variant: 'filled', icon: 'camera' },
  { line: '/shiin list', zh: '手柄设备', en: 'Gamepads', variant: 'tonal', icon: 'gamepad' },
  { line: '/shiin start', zh: '开启监听', en: 'Start Listen', variant: 'tonal', icon: 'play' },
  { line: '/shiin stop', zh: '停止监听', en: 'Stop Listen', variant: 'ghost', icon: 'stop' },
  { line: '/shiin replay', zh: '保存OBS回放', en: 'OBS Replay', variant: 'ghost', icon: 'wave' },
]

export default function Panel({ contribution, locale = 'zh', host }: XaihiPanelProps): React.ReactElement {
  const isZh = locale === 'zh'
  const [output, setOutput] = React.useState<string>('')
  const [busy, setBusy] = React.useState<string | null>(null)

  React.useEffect(() => {
    return registerKitStyles()
  }, [])

  const runAction = async (action: ActionBtn) => {
    setBusy(action.line)
    try {
      const outcome = await host.runCommand(action.line)
      setOutput(`${action.line}\n${outcome.ok ? outcome.text : `[ERROR] ${outcome.reason}`}`)
    } catch (err: any) {
      setOutput(`${action.line}\n[ERROR] ${err?.message || String(err)}`)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="shiin-card" style={{ margin: 12, gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ padding: 4, borderRadius: 6, background: 'var(--xaihi-secondary-container, rgba(128,128,128,0.15))' }}>
            <AppIcon name="camera" size={16} />
          </div>
          <strong>{isZh ? contribution.title.zh : contribution.title.en}</strong>
        </div>
        <span style={{ fontSize: 11, color: 'var(--xaihi-on-surface-variant, gray)' }}>
          {isZh ? 'Xaihi 标准扩展节点' : 'Standard Xaihi Node'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {PANEL_ACTIONS.map((action) => (
          <button
            key={action.line}
            className="shiin-btn"
            data-variant={action.variant}
            disabled={busy !== null}
            onClick={() => void runAction(action)}
            style={{ height: 28, padding: '0 10px', fontSize: 11 }}
          >
            <AppIcon name={action.icon} size={13} />
            {busy === action.line ? '…' : isZh ? action.zh : action.en}
          </button>
        ))}
      </div>

      <div style={{
        marginTop: 4,
        padding: '10px 12px',
        borderRadius: 8,
        background: 'var(--xaihi-surface-variant, rgba(0,0,0,0.2))',
        border: '1px solid var(--xaihi-outline, rgba(128,128,128,0.2))',
      }}>
        <div style={{ fontSize: 11, color: 'var(--xaihi-on-surface-variant, gray)', marginBottom: 4 }}>
          {isZh ? '控制台输出（经由 DSH 命令通道）：' : 'Console Output (via DSH command wire):'}
        </div>
        <pre style={{
          margin: 0,
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: 11.5,
          whiteSpace: 'pre-wrap',
          color: output.includes('[ERROR]') ? 'var(--xaihi-error, #ff6b6b)' : 'inherit',
        }}>
          {output || (isZh ? '点击上方动作即可通过宿主命令执行截屏、启停监听或回放。' : 'Click buttons above to trigger capture or listener via host command.')}
        </pre>
      </div>
    </div>
  )
}
