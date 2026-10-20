import * as React from 'react'
import { AppIcon } from './AppIcon.js'
import { BentoWavyProgress, Md3eLoadingBlob, Md3eMorphShape } from './bento-controls.js'
import { useMd3eShapes } from '../md3e-shape-context.js'
import type {
  MacOSPermissionsStatus,
  ScreenshotPermissionTestResult,
  MacPermissionPane,
} from '../adapter/types.js'
import type { ScreenshotConfig, GamepadDeviceInfo } from '../../core/types.js'

export interface PermissionsViewProps {
  config: ScreenshotConfig
  locale?: string
  isMac?: boolean
  permissions: MacOSPermissionsStatus | null
  gamepads: GamepadDeviceInfo[]
  onRefreshPermissions: (activeProbe?: boolean) => Promise<MacOSPermissionsStatus | null>
  onRequestPermission: (
    target: 'screen' | 'accessibility' | 'input' | 'folder' | 'all',
    options?: { openSettingsIfDenied?: boolean }
  ) => Promise<MacOSPermissionsStatus | null>
  onTestScreenshot: () => Promise<ScreenshotPermissionTestResult | null>
  onOpenPreference: (pane: MacPermissionPane) => Promise<void>
  onOpenFolder: (customPath?: string) => Promise<{ ok: boolean; path?: string; error?: string }>
  onSelectFolder: () => Promise<void>
  onShowItemInFolder?: (fullPath: string) => Promise<void>
  onRefreshGamepads?: () => Promise<void>
  onNavigateWorkspace?: () => void
}

function ShapeMask({ path }: { path: string }) {
  return (
    <svg className="sb-mask" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <path d={path} />
    </svg>
  )
}

export const PermissionsView: React.FC<PermissionsViewProps> = ({
  config,
  locale = 'zh',
  isMac = true,
  permissions,
  gamepads,
  onRefreshPermissions,
  onRequestPermission,
  onTestScreenshot,
  onOpenPreference,
  onOpenFolder,
  onSelectFolder,
  onShowItemInFolder,
  onRefreshGamepads,
  onNavigateWorkspace,
}) => {
  const { session } = useMd3eShapes()
  const isZh = locale.startsWith('zh')
  const [busy, setBusy] = React.useState<string | null>(null)
  const [message, setMessage] = React.useState('')
  const [testResult, setTestResult] = React.useState<ScreenshotPermissionTestResult | null>(null)
  const [folderResult, setFolderResult] = React.useState<{ ok: boolean; path?: string; error?: string } | null>(null)

  const screenGranted = isMac ? Boolean(permissions?.screenCapture) : true
  const accessibilityGranted = isMac ? Boolean(permissions?.accessibility) : true
  const inputGranted = isMac ? Boolean(permissions?.inputMonitoring ?? permissions?.accessibility) : true
  const folderGranted = isMac
    ? permissions
      ? (permissions.folderAccess ?? !permissions.folderError)
      : false
    : true
  const grantedCount = [screenGranted, accessibilityGranted, inputGranted, folderGranted].filter(Boolean).length
  const pendingCount = 4 - grantedCount
  const checking = permissions === null && isMac

  const run = async (key: string, task: () => Promise<void>) => {
    if (busy) return
    setBusy(key)
    try {
      await task()
    } finally {
      setBusy(null)
    }
  }

  const requestAll = () =>
    run('all', async () => {
      const next = await onRequestPermission('all', { openSettingsIfDenied: true })
      setMessage(
        next?.allGranted
          ? isZh
            ? '全部核心权限已授予'
            : 'All core permissions granted'
          : isZh
            ? '已触发系统权限请求；未授权的项目可在系统设置中开启'
            : 'Permission prompt triggered; enable any remaining items in System Settings'
      )
    })

  const requestOne = (target: 'screen' | 'accessibility' | 'input') =>
    run(target, async () => {
      await onRequestPermission(target, { openSettingsIfDenied: true })
      setMessage(isZh ? '已触发系统权限请求' : 'Permission prompt triggered')
    })

  const refresh = () =>
    run('refresh', async () => {
      await onRefreshPermissions(true)
      if (onRefreshGamepads) await onRefreshGamepads()
      setMessage(isZh ? '权限状态已刷新' : 'Permission state refreshed')
    })

  const testCapture = () =>
    run('test', async () => {
      const result = await onTestScreenshot()
      setTestResult(result)
      setMessage(
        result?.ok
          ? isZh
            ? `截图权限实测通过，耗时 ${result.latencyMs ?? 0}ms`
            : `Screenshot permission verified in ${result.latencyMs ?? 0}ms`
          : isZh
            ? `截图权限实测失败：${result?.error || '请检查屏幕录制权限'}`
            : `Screenshot test failed: ${result?.error || 'Check screen recording permission'}`
      )
    })

  const testFolder = () =>
    run('folder', async () => {
      const result = await onOpenFolder(config.path)
      setFolderResult(result)
      setMessage(
        result.ok
          ? isZh
            ? `目录可用：${result.path || config.path}`
            : `Folder accessible: ${result.path || config.path}`
          : isZh
            ? `目录不可用：${result.error || '请检查文件夹访问权限'}`
            : `Folder unavailable: ${result.error || 'Check folder access'}`
      )
    })

  const permissionTiles = [
    {
      id: 'screen',
      title: isZh ? '屏幕录制' : 'Screen recording',
      description: isZh ? '捕获桌面、游戏窗口与当前前台窗口。' : 'Capture the desktop, game windows and the focused window.',
      granted: screenGranted,
      shape: 'cookie' as const,
      icon: 'camera',
      tone: 'primary',
      pane: 'screen' as const,
      action: () => requestOne('screen'),
    },
    {
      id: 'accessibility',
      title: isZh ? '辅助功能' : 'Accessibility',
      description: isZh ? '识别前台窗口名称，用于自动归档与窗口裁切。' : 'Read the focused window title for filing and cropping.',
      granted: accessibilityGranted,
      shape: 'clover' as const,
      icon: 'shield',
      tone: 'tertiary',
      pane: 'accessibility' as const,
      action: () => requestOne('accessibility'),
    },
    {
      id: 'input',
      title: isZh ? '输入监控' : 'Input monitoring',
      description: isZh ? '后台键盘快捷键监听；手柄输入不依赖此权限。' : 'Background keyboard hotkeys; gamepad input does not require it.',
      granted: inputGranted,
      shape: 'sunny' as const,
      icon: 'keyboard',
      tone: 'secondary',
      pane: 'input' as const,
      action: () => requestOne('input'),
    },
    {
      id: 'folder',
      title: isZh ? '截图目录' : 'Screenshot folder',
      description: config.path || (isZh ? '系统默认截图目录' : 'System default folder'),
      granted: folderGranted,
      shape: 'gem' as const,
      icon: 'folder',
      tone: 'primary',
      pane: 'files' as const,
      action: () => (folderGranted ? onOpenFolder(config.path) : onSelectFolder()),
    },
  ] as const

  return (
    <div className="shiin-bento">
      <div className="sb-page">
        <header className="sb-masthead">
          <div>
            <p className="sb-eyebrow">PERMISSIONS / {isZh ? '权限中心' : 'PERMISSIONS'}</p>
            <h2>{isZh ? '权限中心' : 'Permissions'}</h2>
            <p className="sb-lede">
              {isZh
                ? '系统权限决定截图、窗口识别与后台快捷键能否工作。处理完可以直接回到工作台。'
                : 'System permissions control capture, window recognition and background hotkeys.'}
            </p>
          </div>
          <div className="sb-masthead-actions">
            <span className={`sb-chip ${pendingCount > 0 ? 'warn' : 'tertiary'}`}>
              {pendingCount > 0 ? (isZh ? `${pendingCount} 项待处理` : `${pendingCount} pending`) : isZh ? '全部就绪' : 'Ready'}
            </span>
          </div>
        </header>

        <div className="sb-grid">
          <section
            className="sb-tile sb-permission-hero"
            data-state={pendingCount > 0 ? 'missing' : 'ready'}
            aria-label={isZh ? '权限总览' : 'Permission overview'}
          >
            <div className="sb-permission-hero-copy">
              <p className="sb-eyebrow">{isZh ? '当前系统能力' : 'CURRENT CAPABILITIES'}</p>
              <div className="sb-permission-count">
                <strong>{checking ? '…' : grantedCount}</strong>
                <span>/ 4 {isZh ? '已授予' : 'granted'}</span>
              </div>
              <div className="sb-permission-wave">
                <BentoWavyProgress value={(grantedCount / 4) * 100} />
              </div>
              <div className="sb-capture-actions">
                {pendingCount > 0 && (
                  <button type="button" className="sb-action-primary" onClick={() => void requestAll()} disabled={busy !== null}>
                    <AppIcon name="shield" size={16} />
                    {busy === 'all' ? (isZh ? '请求中…' : 'Requesting…') : isZh ? '一键请求全部权限' : 'Request all'}
                  </button>
                )}
                <button type="button" className="sb-action-secondary" onClick={() => void refresh()} disabled={busy !== null}>
                  <AppIcon name="refresh" size={15} />
                  {busy === 'refresh' ? (isZh ? '刷新中…' : 'Refreshing…') : isZh ? '刷新状态' : 'Refresh'}
                </button>
              </div>
              {message && (
                <p className="sb-note" style={{ marginTop: 10 }} role="status" aria-live="polite">
                  {message}
                </p>
              )}
            </div>
            <div className="sb-permission-hero-art" aria-hidden="true">
              <div className="sb-permission-orb">
                <Md3eMorphShape path={session.shapes.hero.svgPath} />
                <AppIcon name="shield" size={38} />
              </div>
              <span>{session.shapes.hero.nameEn.toUpperCase()} · {isZh ? session.shapes.hero.name : session.shapes.hero.nameEn}</span>
              {checking && <Md3eLoadingBlob size={36} label={isZh ? '正在检查权限' : 'Checking permissions'} />}
            </div>
          </section>

          {permissionTiles.map((tile) => (
            <section key={tile.id} className="sb-tile sb-perm-tile" data-tone={tile.tone}>
              <div className="sb-perm-head">
                <span className="sb-perm-icon" aria-hidden="true">
                  <ShapeMask path={session.shapes.icon.svgPath} />
                  <AppIcon name={tile.icon} size={18} />
                </span>
                <span className={`sb-chip ${tile.granted ? 'tertiary' : 'warn'}`}>
                  <AppIcon name={tile.granted ? 'check' : 'alert'} size={12} />
                  {tile.granted ? (isZh ? '已授权' : 'Granted') : isZh ? '未授权' : 'Denied'}
                </span>
              </div>
              <h3>{tile.title}</h3>
              <p>{tile.description}</p>
              <div className="sb-perm-actions">
                {!tile.granted && (
                  <button type="button" className="sb-secondary-button" onClick={() => void tile.action()} disabled={busy !== null}>
                    <AppIcon name="shield" size={13} />
                    {isZh ? '主动请求' : 'Request'}
                  </button>
                )}
                <button type="button" className="sb-secondary-button" onClick={() => void onOpenPreference(tile.pane)}>
                  <AppIcon name="external" size={13} />
                  {isZh ? '系统设置' : 'Settings'}
                </button>
              </div>
            </section>
          ))}

          <section className="sb-tile sb-perm-test" aria-label={isZh ? '截图权限实测' : 'Screenshot permission test'}>
            <div className="sb-tile-head">
              <div>
                <h3>{isZh ? '截图权限实测' : 'Capture test'}</h3>
                <p>{isZh ? '实际抓取一帧，验证权限是否真正生效。' : 'Grab a real frame to verify the permission actually works.'}</p>
              </div>
              <span className="sb-chip tertiary">LIVE</span>
            </div>
            <div className="sb-perm-test-body">
              <button type="button" className="sb-action-primary" onClick={() => void testCapture()} disabled={busy !== null}>
                <AppIcon name="camera" size={16} />
                {busy === 'test' ? (isZh ? '实测中…' : 'Testing…') : isZh ? '立即实测截图' : 'Run capture test'}
              </button>
              {testResult && (
                <div className="sb-perm-result">
                  <span className={`sb-chip ${testResult.ok ? 'tertiary' : 'warn'}`}>
                    {testResult.ok ? (isZh ? `通过 · ${testResult.latencyMs ?? 0}ms` : `Pass · ${testResult.latencyMs ?? 0}ms`) : isZh ? '失败' : 'Failed'}
                  </span>
                  {testResult.previewDataUrl && (
                    <img src={testResult.previewDataUrl} alt={isZh ? '截图实测预览' : 'Capture test preview'} />
                  )}
                  {testResult.filePath && onShowItemInFolder && (
                    <button type="button" className="sb-secondary-button" onClick={() => void onShowItemInFolder(testResult.filePath!)}>
                      <AppIcon name="folder" size={13} />
                      {isZh ? '定位截图' : 'Reveal'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="sb-tile sb-perm-folder" aria-label={isZh ? '截图目录' : 'Screenshot folder'}>
            <div className="sb-tile-head">
              <div>
                <h3>{isZh ? '截图目录' : 'Screenshot folder'}</h3>
                <p>{isZh ? '确认目录可读写，并可直接在 Finder 中打开。' : 'Verify the folder is writable and open it in Finder.'}</p>
              </div>
            </div>
            <div className="sb-perm-test-body">
              <div className="sb-path-chip" title={config.path || ''}>
                <AppIcon name="folder" size={13} />
                <span>{config.path || (isZh ? '系统默认截图目录' : 'System default folder')}</span>
              </div>
              <div className="sb-perm-actions">
                <button type="button" className="sb-action-secondary" onClick={() => void testFolder()} disabled={busy !== null}>
                  <AppIcon name="check" size={13} />
                  {busy === 'folder' ? (isZh ? '测试中…' : 'Testing…') : isZh ? '验证读写' : 'Validate'}
                </button>
                <button type="button" className="sb-action-secondary" onClick={() => void onOpenFolder(config.path)}>
                  <AppIcon name="external" size={13} />
                  {isZh ? '打开目录' : 'Open'}
                </button>
                <button type="button" className="sb-action-secondary" onClick={() => void onSelectFolder()}>
                  <AppIcon name="save" size={13} />
                  {isZh ? '更换' : 'Change'}
                </button>
              </div>
              {folderResult && (
                <span className={`sb-chip ${folderResult.ok ? 'tertiary' : 'warn'}`}>
                  {folderResult.ok ? (isZh ? '读写正常' : 'Writable') : folderResult.error || (isZh ? '不可写' : 'Blocked')}
                </span>
              )}
            </div>
          </section>

          <section className="sb-tile sb-perm-hid" aria-label={isZh ? '手柄 HID 通道' : 'Gamepad HID channel'}>
            <div className="sb-perm-hid-copy">
              <span className="sb-eyebrow">GAMEPAD HID</span>
              <strong>
                {gamepads.length > 0
                  ? isZh ? `已检测到 ${gamepads.length} 个手柄` : `${gamepads.length} gamepad(s) detected`
                  : isZh ? '等待手柄唤醒' : 'Waiting for a gamepad'}
              </strong>
              <small>{isZh ? 'SDL2 / Web Gamepad 双轨驱动已就绪' : 'SDL2 / Web Gamepad dual driver ready'}</small>
            </div>
            <div className="sb-perm-hid-actions">
              <button type="button" className="sb-action-secondary" onClick={() => void onRefreshGamepads?.()}>
                <AppIcon name="refresh" size={14} />
                {isZh ? '重新扫描' : 'Rescan'}
              </button>
              <button type="button" className="sb-action-secondary" onClick={onNavigateWorkspace}>
                <AppIcon name="target" size={14} />
                {isZh ? '打开测试器' : 'Open tester'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
