import * as React from 'react'
import { AppIcon } from './AppIcon.js'
import type { MacOSPermissionsStatus, PermissionTargetType, ScreenshotPermissionTestResult } from '../adapter/types.js'

export interface PermissionSettingsProps {
  locale: string
  isMac: boolean
  permissions?: MacOSPermissionsStatus | null
  initialSection?: 'general' | 'permissions'
  revealRequest?: number
  folder?: string
  onRefresh: () => Promise<void>
  onRequest: (target: PermissionTargetType) => Promise<void>
  onTest: () => Promise<ScreenshotPermissionTestResult | null>
  onSelectFolder?: () => void
  onOpenFolder?: () => void
}

/** Permissions are contextual settings, expanded only when the user needs them. */
export function PermissionSettings({ locale, isMac, permissions, initialSection, revealRequest, folder,
  onRefresh, onRequest, onTest, onSelectFolder, onOpenFolder,
}: PermissionSettingsProps) {
  const isZh = locale.startsWith('zh')
  const [expanded, setExpanded] = React.useState(initialSection === 'permissions')
  const [busy, setBusy] = React.useState<string | null>(null)
  const busyRef = React.useRef(false)
  const [message, setMessage] = React.useState('')
  const [failed, setFailed] = React.useState(false)
  const [testResult, setTestResult] = React.useState<ScreenshotPermissionTestResult | null>(null)
  const sectionRef = React.useRef<HTMLDetailsElement>(null)

  React.useEffect(() => {
    if (initialSection !== 'permissions') return
    setExpanded(true)
    sectionRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
    sectionRef.current?.querySelector('summary')?.focus({ preventScroll: true })
  }, [initialSection, revealRequest])

  const run = async (key: string, action: () => Promise<void>, success?: string) => {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(key)
    setMessage('')
    setFailed(false)
    try {
      await action()
      if (success) setMessage(success)
    } catch (error) {
      setFailed(true)
      setMessage(error instanceof Error ? error.message : String(error))
    } finally {
      busyRef.current = false
      setBusy(null)
    }
  }
  const rows = [
    { id: 'screen' as const, icon: 'monitor', title: isZh ? '屏幕录制' : 'Screen recording',
      description: isZh ? '用于截取屏幕与窗口画面。' : 'Capture your screen and windows.',
      granted: isMac ? permissions?.screenCapture : true, required: true },
    { id: 'accessibility' as const, icon: 'appWindow', title: isZh ? '辅助功能' : 'Accessibility',
      description: isZh ? '用于全局快捷键与前台窗口识别。' : 'Global shortcuts and focused window recognition.',
      granted: isMac ? permissions?.accessibility : true, required: false },
    { id: 'input' as const, icon: 'keyboard', title: isZh ? '输入监控' : 'Input monitoring',
      description: isZh ? '使用后台键盘快捷键时开启；手柄不需要。' : 'For background keyboard shortcuts; gamepads work without it.',
      granted: isMac ? permissions?.inputMonitoring : true, required: false },
    { id: 'folder' as const, icon: 'folder', title: isZh ? '保存目录' : 'Save folder',
      description: permissions?.resolvedSavePath || folder || (isZh ? '系统默认截图目录' : 'System default capture folder'),
      granted: permissions?.folderAccess, required: true },
  ]
  const screenMissing = isMac && permissions?.screenCapture === false
  return <details className="shiin-permission-settings" id="settings-permission" ref={sectionRef}
    open={expanded} onToggle={(event) => setExpanded(event.currentTarget.open)}>
    <summary>
      <span className="shiin-permission-heading"><AppIcon name="shield" size={22} /><strong>{isZh ? '权限与访问' : 'Permissions & access'}</strong></span>
      <span className="shiin-permission-summary" data-warning={screenMissing}>{screenMissing
        ? (isZh ? '屏幕录制待授权' : 'Screen access needed')
        : (isZh ? '管理系统访问' : 'Manage system access')}</span>
      <AppIcon name="chevronDown" size={19} />
    </summary>
    <div className="shiin-permission-content">
      <div className="shiin-permission-intro"><p>{isZh ? '仅开启你要使用的功能。授权后重新检测即可。' : 'Enable the access your workflow needs, then check again.'}</p>
        <button type="button" className="sb-secondary-button" disabled={busy !== null}
          onClick={() => void run('refresh', onRefresh, isZh ? '状态已更新' : 'Status updated')}>
          <AppIcon name="refresh" size={16} />{busy === 'refresh' ? (isZh ? '检测中…' : 'Checking…') : (isZh ? '重新检测' : 'Check again')}
        </button>
      </div>
      <div className="shiin-permission-rows">
        {rows.map(row => <div className="shiin-permission-row" key={row.id}>
          <span className="shiin-permission-row__icon"><AppIcon name={row.icon} size={21} /></span>
          <div className="shiin-permission-row__copy"><strong>{row.title}</strong><span>{row.description}</span></div>
          <span className="shiin-permission-state" data-state={row.granted === true ? 'ready' : row.granted === false && row.required ? 'missing' : 'optional'}>
            {row.granted === true ? <><AppIcon name="check" size={14} />{isZh ? (row.id === 'folder' ? '可写入' : isMac ? '已开启' : '无需授权') : (row.id === 'folder' ? 'Writable' : isMac ? 'Enabled' : 'Not required')}</>
              : row.granted === undefined ? (isZh ? '待检测' : 'Not checked')
              : row.required ? (isZh ? '待处理' : 'Needs access') : (isZh ? '按需开启' : 'Optional')}
          </span>
          {(row.id === 'folder' || isMac) && <button type="button" className="sb-secondary-button" disabled={busy !== null}
            onClick={() => row.id === 'folder' ? onSelectFolder?.() : void run(row.id, () => onRequest(row.id), isZh ? '已打开系统授权，请在完成后重新检测。' : 'Complete the system prompt, then check again.')}>
            {row.id === 'folder' ? (isZh ? '更换目录' : 'Change folder') : (isZh ? '系统设置' : 'System settings')}<AppIcon name="external" size={14} />
          </button>}
        </div>)}
      </div>
      <div className="shiin-permission-footer"><button type="button" className="sb-secondary-button" disabled={busy !== null}
        onClick={() => void run('test', async () => {
          const result = await onTest()
          setTestResult(result)
          setFailed(!result?.ok)
          setMessage(result?.ok ? (isZh ? '屏幕捕获实测通过' : 'Screen capture verified') : result?.error || (isZh ? '未能完成捕获，请检查权限。' : 'Capture failed. Check system access.'))
        })}>
        <AppIcon name="camera" size={17} />{busy === 'test' ? (isZh ? '正在测试…' : 'Testing…') : (isZh ? '测试截图' : 'Test capture')}
      </button><span role="status" data-error={failed}>{message || (isZh ? '实际捕获一帧，确认权限是否生效。' : 'Capture one frame to verify access.')}</span></div>
      {testResult?.ok && testResult.previewDataUrl && <div className="shiin-permission-preview"><img src={testResult.previewDataUrl} alt={isZh ? '刚刚捕获的测试画面' : 'Test capture'} /><button type="button" className="sb-secondary-button" onClick={onOpenFolder}>{isZh ? '打开目录' : 'Open folder'}</button></div>}
    </div>
  </details>
}
