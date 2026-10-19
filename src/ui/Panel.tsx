/**
 * Xaihi 标准微前端工作台面板 (Module Federation 导出组件)
 * 严格按照 Xaihi MD3E 设计体系重构，参考 bitv / shellect 最佳规范
 */
import * as React from 'react'
import {
  registerKitStyles,
  ALIAS,
  MD3E_ALIAS,
  XMd3eNodeFrame,
  XMd3eHeroBanner,
  XMd3eShapeBadge,
  XMd3eActionGroup,
  XMd3eStatTile,
  XMd3eSection,
  XButton,
} from './md3e.js'
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
    <XMd3eNodeFrame data-testid="shiin-panel-md3e" data-ui-variant="md3e">
      <XMd3eHeroBanner
        title={isZh ? contribution.title.zh : contribution.title.en}
        description={
          isZh
            ? 'Xaihi 标准游戏手柄截图与录屏回放节点 · 经由 DSH 管道与 DXGI DDA 显存直通'
            : 'Standard Xaihi Gamepad Screen Capture & Replay Node'
        }
        tone="primary"
        badge={
          <XMd3eShapeBadge shape="sunny" size="sm" active>
            🎮
          </XMd3eShapeBadge>
        }
        meta={
          <>
            <span style={{
              borderRadius: 999,
              padding: '2px 8px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: MD3E_ALIAS.primary,
              fontSize: 10.5,
              fontWeight: 750,
            }}>
              xaihi-shiin · node/v1
            </span>
            <span style={{
              borderRadius: 999,
              padding: '2px 8px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: ALIAS.onSurfaceVariant,
              fontSize: 10.5,
            }}>
              {isZh ? 'DSH 接通' : 'DSH Connected'}
            </span>
          </>
        }
      >
        <XMd3eActionGroup>
          {PANEL_ACTIONS.map((action) => (
            <XButton
              key={action.line}
              variant={action.variant}
              disabled={busy !== null}
              onClick={() => void runAction(action)}
            >
              <AppIcon name={action.icon} size={12} />
              {busy === action.line ? '…' : isZh ? action.zh : action.en}
            </XButton>
          ))}
        </XMd3eActionGroup>
      </XMd3eHeroBanner>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
        <XMd3eStatTile value="DXGI DDA" label={isZh ? '显存管线' : 'Pipeline'} />
        <XMd3eStatTile value="Session 1" label={isZh ? '交互会话' : 'Session'} />
        <XMd3eStatTile value="50ms" label={isZh ? '直通延迟' : 'Latency'} />
        <XMd3eStatTile value="OBS Ready" label={isZh ? '回放缓冲' : 'Replay'} />
      </div>

      <XMd3eSection
        title={isZh ? '控制台输出 (经由 DSH 命令通道)' : 'Console Output (via DSH Wire)'}
        description={isZh ? '实时查看手柄监听、截图输出与节点反馈。' : 'Node command outputs.'}
      >
        <pre style={{
          margin: 0,
          padding: '12px 14px',
          borderRadius: 16,
          background: MD3E_ALIAS.surfaceHigh,
          color: output.includes('[ERROR]') ? MD3E_ALIAS.error : ALIAS.onSurface,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 11.5,
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}>
          {output || (isZh ? '就绪。点击上方操作按钮或触发手柄组合键。' : 'Ready. Click action buttons or press gamepad combos.')}
        </pre>
      </XMd3eSection>
    </XMd3eNodeFrame>
  )
}
