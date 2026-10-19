import * as React from 'react'
import {
  ALIAS,
  MD3E_ALIAS,
  XMd3eSection,
  XMd3eStatTile,
  XMd3eShapeBadge,
  XMd3eActionGroup,
  XMd3eFactRow,
  XButton,
} from '../md3e.js'
import { AppIcon } from './AppIcon.js'
import type {
  MacOSPermissionsStatus,
  ScreenshotPermissionTestResult,
  MacPermissionPane,
} from '../adapter/types.js'
import type { ScreenshotConfig, GamepadDeviceInfo } from '../../core/types.js'

export interface PermissionTestViewProps {
  config: ScreenshotConfig
  locale?: 'zh' | 'en'
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
  onNavigateLens?: (lens: 'studio' | 'combos' | 'capture' | 'tester' | 'permissions' | 'settings') => void
}

export const PermissionTestView: React.FC<PermissionTestViewProps> = ({
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
  onNavigateLens,
}) => {
  const isZh = locale === 'zh'
  const [busyAction, setBusyAction] = React.useState<string | null>(null)
  const [shotTestResult, setShotTestResult] = React.useState<ScreenshotPermissionTestResult | null>(null)
  const [folderTestResult, setFolderTestResult] = React.useState<{
    ok: boolean
    path?: string
    error?: string
    testedAt: number
  } | null>(null)
  const [statusMessage, setStatusMessage] = React.useState<string>('')

  const screenGranted = Boolean(permissions?.screenCapture || shotTestResult?.granted)
  const accessibilityGranted = Boolean(permissions?.accessibility)
  const inputGranted = Boolean(permissions?.inputMonitoring ?? permissions?.accessibility)
  const folderGranted = Boolean(permissions?.folderAccess ?? true)
  const allGranted = Boolean(screenGranted && accessibilityGranted && inputGranted && folderGranted)

  const grantedCount = [screenGranted, accessibilityGranted, inputGranted, folderGranted].filter(Boolean).length
  const resolvedSavePath =
    folderTestResult?.path || permissions?.resolvedSavePath || config.path || './screenshots'

  const handleRequestAll = async () => {
    setBusyAction('request-all')
    setStatusMessage(
      isZh
        ? '正在主动向 macOS 请求全部系统权限（请注意屏幕弹出的系统授权框）…'
        : 'Actively requesting macOS permissions...'
    )
    try {
      const next = await onRequestPermission('all', { openSettingsIfDenied: true })
      if (next?.allGranted) {
        setStatusMessage(isZh ? '✅ 全部系统权限均已成功授予！' : '✅ All system permissions are granted!')
      } else {
        setStatusMessage(
          isZh
            ? '⚠️ 已触发系统权限请求。若部分权限仍显示未授权，请在弹出的「系统设置 -> 隐私与安全性」中勾选开启。'
            : '⚠️ Permission prompt triggered. Toggle any remaining items in System Settings > Privacy & Security.'
        )
      }
    } finally {
      setBusyAction(null)
    }
  }

  const handleRefreshAll = async () => {
    setBusyAction('refresh')
    setStatusMessage(isZh ? '正在全面检测系统权限与硬件状态…' : 'Running full permission diagnostics...')
    try {
      await onRefreshPermissions(true)
      if (onRefreshGamepads) await onRefreshGamepads()
      setStatusMessage(isZh ? '已完成最新权限状态同步' : 'Diagnostics refreshed')
    } finally {
      setBusyAction(null)
    }
  }

  const handleRunScreenshotTest = async () => {
    setBusyAction('test-shot')
    setStatusMessage(isZh ? '正在执行真实屏幕截图权限测试…' : 'Testing live screen capture permission...')
    try {
      const res = await onTestScreenshot()
      if (res) {
        setShotTestResult(res)
        if (res.ok && res.granted) {
          setStatusMessage(
            isZh
              ? `✅ 截图权限实测通过！耗时 ${res.latencyMs ?? 0}ms，已保存至 ${res.filePath || '剪贴板'}`
              : `✅ Screenshot test passed in ${res.latencyMs ?? 0}ms!`
          )
        } else {
          setStatusMessage(
            isZh
              ? `❌ 截图权限测试未通过：${res.error || '请授予屏幕录制权限'}`
              : `❌ Screenshot test failed: ${res.error || 'Screen Recording permission required'}`
          )
        }
      }
    } finally {
      setBusyAction(null)
    }
  }

  const handleTestOpenFolder = async () => {
    setBusyAction('test-folder')
    setStatusMessage(isZh ? '正在解析并呼出 Finder 打开截图目录…' : 'Opening screenshot directory in Finder...')
    try {
      const res = await onOpenFolder(config.path || '')
      setFolderTestResult({
        ok: res.ok,
        path: res.path || resolvedSavePath,
        error: res.error,
        testedAt: Date.now(),
      })
      if (res.ok) {
        setStatusMessage(
          isZh
            ? `✅ 已成功在 Finder 中打开目录：${res.path || resolvedSavePath}`
            : `✅ Opened folder in Finder: ${res.path || resolvedSavePath}`
        )
      } else {
        setStatusMessage(
          isZh
            ? `❌ 打开目录失败：${res.error || '请检查文件夹访问权限'}`
            : `❌ Failed to open folder: ${res.error}`
        )
      }
      await onRefreshPermissions(false)
    } finally {
      setBusyAction(null)
    }
  }

  const renderBadge = (ok: boolean, labelOk: string, labelFail: string) => (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 800,
        background: ok ? 'rgba(74, 222, 128, 0.16)' : 'rgba(251, 95, 118, 0.18)',
        color: ok ? '#4ade80' : '#fb5f76',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'currentColor',
        }}
      />
      {ok ? labelOk : labelFail}
    </span>
  )

  return (
    <div style={{ display: 'grid', gap: 12 }} data-testid="permission-test-view">
      {/* 顶部诊断概览区 */}
      <XMd3eSection
        title={
          isZh
            ? 'macOS 权限识别与全功能自检中心'
            : 'macOS Permission Recognition & Capability Diagnostics'
        }
        description={
          isZh
            ? '主动触发 macOS 系统授权弹窗，并实测「屏幕录制截图权限」、「辅助功能与窗口识别」、「全局热键监控」及「截图目录读写与打开」。'
            : 'Actively trigger macOS TCC permission dialogs and verify Screen Recording, Accessibility, Input Monitoring, and Folder Opening.'
        }
        actions={
          <XMd3eActionGroup>
            <XButton
              variant="filled"
              size="sm"
              disabled={busyAction !== null}
              onClick={() => void handleRequestAll()}
              data-testid="btn-request-all-permissions"
            >
              <AppIcon name="shield" size={13} />
              {busyAction === 'request-all'
                ? isZh
                  ? '正在请求…'
                  : 'Requesting…'
                : isZh
                  ? '一键主动请求全部权限'
                  : 'Request All Permissions'}
            </XButton>
            <XButton
              variant="tonal"
              size="sm"
              disabled={busyAction !== null}
              onClick={() => void handleRunScreenshotTest()}
              data-testid="btn-test-screenshot-permission"
            >
              <AppIcon name="camera" size={13} />
              {busyAction === 'test-shot'
                ? isZh
                  ? '正在实测截图…'
                  : 'Testing Capture…'
                : isZh
                  ? '实测截图权限'
                  : 'Test Screenshot'}
            </XButton>
            <XButton
              variant="tonal"
              size="sm"
              disabled={busyAction !== null}
              onClick={() => void handleTestOpenFolder()}
              data-testid="btn-test-open-folder"
            >
              <AppIcon name="folder" size={13} />
              {busyAction === 'test-folder'
                ? isZh
                  ? '正在打开…'
                  : 'Opening…'
                : isZh
                  ? '测试打开目录'
                  : 'Test Open Folder'}
            </XButton>
            <XButton
              variant="ghost"
              size="sm"
              disabled={busyAction !== null}
              onClick={() => void handleRefreshAll()}
              data-testid="btn-refresh-permissions"
            >
              <AppIcon name="refresh" size={13} />
              {isZh ? '刷新状态' : 'Refresh'}
            </XButton>
          </XMd3eActionGroup>
        }
      >
        {/* 4 格核心权限状态指标卡 */}
        <div className="xaihi-md3e-stats-grid">
          <XMd3eStatTile
            value={screenGranted ? (isZh ? '🟢 已授权' : '🟢 Granted') : (isZh ? '🔴 未授权' : '🔴 Denied')}
            label={isZh ? '1. 屏幕录制 / 截图权限' : '1. Screen Recording'}
          />
          <XMd3eStatTile
            value={accessibilityGranted ? (isZh ? '🟢 已授权' : '🟢 Granted') : (isZh ? '🔴 未授权' : '🔴 Denied')}
            label={isZh ? '2. 辅助功能 / 窗口识别' : '2. Accessibility'}
          />
          <XMd3eStatTile
            value={inputGranted ? (isZh ? '🟢 已就绪' : '🟢 Ready') : (isZh ? '🟡 待授权' : '🟡 Pending')}
            label={isZh ? '3. 全局按键输入监控' : '3. Input Monitoring'}
          />
          <XMd3eStatTile
            value={folderGranted ? (isZh ? '🟢 可读写' : '🟢 Writable') : (isZh ? '🔴 异常' : '🔴 Blocked')}
            label={isZh ? `4. 目录权限 (${grantedCount}/4)` : `4. Folder Access (${grantedCount}/4)`}
          />
        </div>

        {/* 实时诊断反馈条 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
            padding: '12px 16px',
            borderRadius: '18px 12px 16px 10px',
            background: allGranted
              ? 'color-mix(in srgb, #4ade80 12%, var(--xaihi-md3e-surface-high, #222630))'
              : 'color-mix(in srgb, #fb5f76 14%, var(--xaihi-md3e-surface-high, #222630))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <XMd3eShapeBadge shape={allGranted ? 'clover' : 'sunny'} size="sm" active={allGranted}>
              <AppIcon name={allGranted ? 'check' : 'shield'} size={14} />
            </XMd3eShapeBadge>
            <div style={{ display: 'grid', gap: 2 }}>
              <span style={{ fontWeight: 800, fontSize: 13, color: ALIAS.onSurface }}>
                {allGranted
                  ? isZh
                    ? '全部核心权限已授予 · 截图与后台监听功能完全可用'
                    : 'All Core Permissions Granted · Ready for Capture & Listening'
                  : isZh
                    ? `当前已授予 ${grantedCount}/4 项核心权限 · 请对未授权项点击「主动请求权限」`
                    : `${grantedCount}/4 Core Permissions Granted · Click Request on missing items`}
              </span>
              <span style={{ fontSize: 11.5, color: ALIAS.onSurfaceVariant }}>
                {statusMessage ||
                  (isZh
                    ? '提示：macOS 首次授权「屏幕录制」或「辅助功能」后，点击「刷新状态」或「实测截图权限」即可立即验证生效。'
                    : 'Tip: After toggling permissions in macOS System Settings, click Refresh or Test Screenshot to verify.')}
              </span>
            </div>
          </div>
          {!isMac && (
            <span style={{ fontSize: 11, color: ALIAS.onSurfaceVariant }}>
              {isZh ? '当前为非 macOS 平台，系统权限默认放行' : 'Non-macOS platform'}
            </span>
          )}
        </div>
      </XMd3eSection>

      {/* 双栏布局：左侧 5 项权限逐一请求与检测，右侧截图权限实测预览与目录打开测试 */}
      <div className="xaihi-md3e-main-grid">
        {/* 左栏：逐项权限识别与主动请求 */}
        <div style={{ display: 'grid', gap: 12 }}>
          <XMd3eSection
            title={isZh ? '分项权限识别与主动请求' : 'Individual Permission Recognition & Active Request'}
            description={
              isZh
                ? '点击「主动请求权限」将直接调用 macOS 原生 API 拉起授权提示框；若曾拒绝过，可一键直达系统隐私设置对应面板。'
                : 'Click Request Permission to invoke native macOS prompt, or open the corresponding System Settings privacy pane.'
            }
          >
            {/* 1. 屏幕录制权限 */}
            <div
              style={{
                display: 'grid',
                gap: 8,
                padding: '14px 16px',
                borderRadius: '20px 14px 18px 10px',
                background: MD3E_ALIAS.surfaceHigh,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AppIcon name="camera" size={15} style={{ color: MD3E_ALIAS.primary }} />
                  <span style={{ fontWeight: 800, fontSize: 13 }}>
                    {isZh ? '屏幕录制与窗口截图权限 (Screen Recording)' : 'Screen Recording & Capture'}
                  </span>
                </div>
                {renderBadge(
                  screenGranted,
                  isZh ? '已授权 (Granted)' : 'Granted',
                  isZh ? `未授权 (${permissions?.screenCaptureStatus || 'Denied'})` : 'Not Granted'
                )}
              </div>
              <div style={{ fontSize: 11.5, color: ALIAS.onSurfaceVariant, lineHeight: 1.5 }}>
                {isZh
                  ? '用于截取全屏桌面、3D 游戏窗口画面及读取非焦点窗口标题。未授予时截图只会截取到空白桌面背景或报错。'
                  : 'Required for capturing full desktop screens, game windows, and window thumbnails.'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                <XButton
                  variant={screenGranted ? 'tonal' : 'filled'}
                  size="sm"
                  disabled={busyAction !== null}
                  onClick={async () => {
                    setBusyAction('req-screen')
                    setStatusMessage(isZh ? '正在主动请求屏幕录制权限…' : 'Requesting Screen Recording permission...')
                    try {
                      await onRequestPermission('screen', { openSettingsIfDenied: true })
                    } finally {
                      setBusyAction(null)
                    }
                  }}
                >
                  <AppIcon name="shield" size={12} />
                  {isZh ? '主动请求录屏权限' : 'Request Screen Permission'}
                </XButton>
                <XButton
                  variant="tonal"
                  size="sm"
                  disabled={busyAction !== null}
                  onClick={() => void handleRunScreenshotTest()}
                >
                  <AppIcon name="camera" size={12} />
                  {isZh ? '实测截图验证' : 'Live Capture Test'}
                </XButton>
                <XButton
                  variant="ghost"
                  size="sm"
                  onClick={() => void onOpenPreference('screen')}
                >
                  <AppIcon name="external" size={12} />
                  {isZh ? '系统录屏设置' : 'System Settings'}
                </XButton>
              </div>
            </div>

            {/* 2. 辅助功能权限 */}
            <div
              style={{
                display: 'grid',
                gap: 8,
                padding: '14px 16px',
                borderRadius: '20px 14px 18px 10px',
                background: MD3E_ALIAS.surfaceHigh,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AppIcon name="appWindow" size={15} style={{ color: MD3E_ALIAS.primary }} />
                  <span style={{ fontWeight: 800, fontSize: 13 }}>
                    {isZh ? '辅助功能与活动窗口识别 (Accessibility)' : 'Accessibility & Window Discovery'}
                  </span>
                </div>
                {renderBadge(
                  accessibilityGranted,
                  isZh ? '已授权 (Trusted)' : 'Trusted',
                  isZh ? '未授权 (Untrusted)' : 'Untrusted'
                )}
              </div>
              <div style={{ fontSize: 11.5, color: ALIAS.onSurfaceVariant, lineHeight: 1.5 }}>
                {isZh
                  ? `用于识别当前前台游戏窗口名称（按游戏名自动归档目录）及枚举桌面活动窗口。当前已识别窗口数：${permissions?.detectedWindowsCount ?? 0} 个${permissions?.activeWindowTitle ? `（前台：${permissions.activeWindowTitle}）` : ''}。`
                  : `Required for active window title recognition and global hotkeys. Detected windows: ${permissions?.detectedWindowsCount ?? 0}.`}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                <XButton
                  variant={accessibilityGranted ? 'tonal' : 'filled'}
                  size="sm"
                  disabled={busyAction !== null}
                  onClick={async () => {
                    setBusyAction('req-ax')
                    setStatusMessage(
                      isZh
                        ? '正在调用系统 API 弹出辅助功能授权请求框…'
                        : 'Triggering native Accessibility prompt...'
                    )
                    try {
                      await onRequestPermission('accessibility', { openSettingsIfDenied: true })
                    } finally {
                      setBusyAction(null)
                    }
                  }}
                >
                  <AppIcon name="shield" size={12} />
                  {isZh ? '主动请求辅助功能 (弹窗)' : 'Prompt Accessibility'}
                </XButton>
                <XButton
                  variant="ghost"
                  size="sm"
                  onClick={() => void onOpenPreference('accessibility')}
                >
                  <AppIcon name="external" size={12} />
                  {isZh ? '辅助功能设置' : 'Accessibility Settings'}
                </XButton>
              </div>
            </div>

            {/* 3. 输入监控权限 */}
            <div
              style={{
                display: 'grid',
                gap: 8,
                padding: '14px 16px',
                borderRadius: '20px 14px 18px 10px',
                background: MD3E_ALIAS.surfaceHigh,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AppIcon name="keyboard" size={15} style={{ color: MD3E_ALIAS.primary }} />
                  <span style={{ fontWeight: 800, fontSize: 13 }}>
                    {isZh ? '全局输入监控权限 (Input Monitoring)' : 'Input Monitoring (Global Hotkeys)'}
                  </span>
                </div>
                {renderBadge(
                  inputGranted,
                  isZh ? '已就绪 (Ready)' : 'Ready',
                  isZh ? '需授权 (Required)' : 'Required'
                )}
              </div>
              <div style={{ fontSize: 11.5, color: ALIAS.onSurfaceVariant, lineHeight: 1.5 }}>
                {isZh
                  ? '用于后台全局键盘辅助快捷键触发截图（物理手柄通过 SDL2 / WebGamepad 监听无需此权限也可正常工作）。'
                  : 'Required for global background keyboard shortcut triggers.'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                <XButton
                  variant={inputGranted ? 'tonal' : 'filled'}
                  size="sm"
                  disabled={busyAction !== null}
                  onClick={async () => {
                    setBusyAction('req-input')
                    try {
                      await onRequestPermission('input', { openSettingsIfDenied: true })
                    } finally {
                      setBusyAction(null)
                    }
                  }}
                >
                  <AppIcon name="keyboard" size={12} />
                  {isZh ? '主动请求输入监控' : 'Request Input Monitoring'}
                </XButton>
                <XButton
                  variant="ghost"
                  size="sm"
                  onClick={() => void onOpenPreference('input')}
                >
                  <AppIcon name="external" size={12} />
                  {isZh ? '输入监控设置' : 'Input Monitoring Settings'}
                </XButton>
              </div>
            </div>

            {/* 4. 游戏手柄 HID 识别 */}
            <div
              style={{
                display: 'grid',
                gap: 8,
                padding: '14px 16px',
                borderRadius: '20px 14px 18px 10px',
                background: MD3E_ALIAS.surfaceHigh,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AppIcon name="gamepad" size={15} style={{ color: MD3E_ALIAS.primary }} />
                  <span style={{ fontWeight: 800, fontSize: 13 }}>
                    {isZh ? '游戏手柄 HID 硬件通信 (Gamepad HID)' : 'Gamepad HID Hardware Access'}
                  </span>
                </div>
                {renderBadge(
                  true,
                  gamepads.length > 0
                    ? isZh
                      ? `已连接 ${gamepads.length} 台手柄`
                      : `${gamepads.length} Connected`
                    : isZh
                      ? '通道就绪 (待唤醒手柄)'
                      : 'HID Ready',
                  ''
                )}
              </div>
              <div style={{ fontSize: 11.5, color: ALIAS.onSurfaceVariant, lineHeight: 1.5 }}>
                {gamepads.length > 0
                  ? isZh
                    ? `当前已识别手柄：${gamepads.map((g) => g.name).join('、')}`
                    : `Connected: ${gamepads.map((g) => g.name).join(', ')}`
                  : isZh
                    ? 'SDL2 与 Web Gamepad 双轨驱动已就绪。连接手柄并按任意键即可自动唤醒。'
                    : 'SDL2 & Web Gamepad drivers ready. Press any button on your controller to wake.'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                {onRefreshGamepads && (
                  <XButton variant="tonal" size="sm" onClick={() => void onRefreshGamepads()}>
                    <AppIcon name="refresh" size={12} />
                    {isZh ? '重新扫描手柄' : 'Rescan Gamepads'}
                  </XButton>
                )}
                {onNavigateLens && (
                  <XButton variant="ghost" size="sm" onClick={() => onNavigateLens('tester')}>
                    <AppIcon name="target" size={12} />
                    {isZh ? '打开手柄物理测试器' : 'Open Gamepad Tester'}
                  </XButton>
                )}
              </div>
            </div>
          </XMd3eSection>
        </div>

        {/* 右栏：截图权限实测工作台 + 目录读写与打开测试 */}
        <div style={{ display: 'grid', gap: 12 }}>
          {/* 截图权限实测与预览 */}
          <XMd3eSection
            title={isZh ? '截图权限实测与画面验证' : 'Live Screenshot Permission Test & Preview'}
            description={
              isZh
                ? '直接执行一次真实屏幕捕获，检验 macOS 屏幕录制权限是否真正生效（而非仅截到空白壁纸或黑屏）。'
                : 'Execute a live screen capture to verify that macOS Screen Recording permission produces a valid image.'
            }
            actions={
              <XButton
                variant="filled"
                size="sm"
                disabled={busyAction !== null}
                onClick={() => void handleRunScreenshotTest()}
              >
                <AppIcon name="camera" size={12} />
                {busyAction === 'test-shot'
                  ? isZh
                    ? '正在截图…'
                    : 'Capturing…'
                  : isZh
                    ? '立即执行截图测试'
                    : 'Run Capture Test'}
              </XButton>
            }
          >
            {shotTestResult ? (
              <div
                style={{
                  display: 'grid',
                  gap: 10,
                  padding: '14px',
                  borderRadius: '20px 14px 18px 10px',
                  background: MD3E_ALIAS.surfaceHigh,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: 13 }}>
                    {shotTestResult.ok && shotTestResult.granted
                      ? isZh
                        ? '✅ 截图权限实测通过（画面捕获正常）'
                        : '✅ Screenshot Permission Verified'
                      : isZh
                        ? '❌ 截图实测失败（请检查屏幕录制权限）'
                        : '❌ Screenshot Capture Failed'}
                  </span>
                  <span style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', color: MD3E_ALIAS.primary }}>
                    {shotTestResult.latencyMs !== undefined ? `${shotTestResult.latencyMs} ms` : ''}
                  </span>
                </div>

                {shotTestResult.previewDataUrl && (
                  <div
                    style={{
                      borderRadius: 14,
                      overflow: 'hidden',
                      background: '#050608',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      maxHeight: 220,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={shotTestResult.previewDataUrl}
                      alt="Screenshot permission test preview"
                      style={{
                        width: '100%',
                        maxHeight: 220,
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </div>
                )}

                <div>
                  {shotTestResult.width && shotTestResult.height ? (
                    <XMd3eFactRow
                      label={isZh ? '捕获画面分辨率' : 'Captured Resolution'}
                      value={`${shotTestResult.width} × ${shotTestResult.height}`}
                    />
                  ) : null}
                  {shotTestResult.sizeBytes ? (
                    <XMd3eFactRow
                      label={isZh ? '图像数据大小' : 'Image Size'}
                      value={`${(shotTestResult.sizeBytes / 1024).toFixed(1)} KB`}
                    />
                  ) : null}
                  {shotTestResult.filePath ? (
                    <XMd3eFactRow
                      label={isZh ? '测试文件保存位置' : 'Saved File Path'}
                      value={shotTestResult.filePath}
                    />
                  ) : null}
                  {shotTestResult.error ? (
                    <div style={{ color: '#fb5f76', fontSize: 11.5, marginTop: 6 }}>
                      {shotTestResult.error}
                    </div>
                  ) : null}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {shotTestResult.filePath && onShowItemInFolder && (
                    <XButton
                      variant="tonal"
                      size="sm"
                      onClick={() => void onShowItemInFolder(shotTestResult.filePath!)}
                    >
                      <AppIcon name="folder" size={12} />
                      {isZh ? '在 Finder 中定位该截图' : 'Reveal in Finder'}
                    </XButton>
                  )}
                  <XButton variant="ghost" size="sm" onClick={() => void handleTestOpenFolder()}>
                    <AppIcon name="external" size={12} />
                    {isZh ? '打开截图保存目录' : 'Open Save Folder'}
                  </XButton>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '22px 16px',
                  borderRadius: 18,
                  border: '1px dashed rgba(255, 255, 255, 0.12)',
                  textAlign: 'center',
                  color: ALIAS.onSurfaceVariant,
                  fontSize: 12,
                  display: 'grid',
                  gap: 8,
                  justifyItems: 'center',
                }}
              >
                <AppIcon name="camera" size={22} style={{ color: MD3E_ALIAS.primary, opacity: 0.85 }} />
                <span>
                  {isZh
                    ? '点击右上角「立即执行截图测试」，系统将实际截取一张屏幕画面并在本页展示缩略预览与耗时指标。'
                    : 'Click "Run Capture Test" above to capture a live frame and preview it here.'}
                </span>
              </div>
            )}
          </XMd3eSection>

          {/* 目录读写与打开测试 */}
          <XMd3eSection
            title={isZh ? '截图保存目录读写与打开测试' : 'Save Directory Read/Write & Finder Open Test'}
            description={
              isZh
                ? '自动解析 macOS 安全可写路径（避免只读根目录 `/` 导致无法打开），支持一键测试在 Finder 中呼出目录。'
                : 'Resolves a writable macOS directory and tests opening it directly in Finder.'
            }
          >
            <div
              style={{
                display: 'grid',
                gap: 10,
                padding: '14px 16px',
                borderRadius: '20px 14px 18px 10px',
                background: MD3E_ALIAS.surfaceHigh,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AppIcon name="folder" size={15} style={{ color: MD3E_ALIAS.primary }} />
                  <span style={{ fontWeight: 800, fontSize: 13 }}>
                    {isZh ? '当前生效截图目录' : 'Active Screenshot Directory'}
                  </span>
                </div>
                {renderBadge(
                  folderGranted,
                  isZh ? '读写正常 (Writable)' : 'Writable',
                  isZh ? '无写入权限 (Read-Only)' : 'Read-Only'
                )}
              </div>

              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 12,
                  background: MD3E_ALIAS.surfaceLowest,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: 11.5,
                  color: ALIAS.onSurface,
                  wordBreak: 'break-all',
                }}
              >
                {resolvedSavePath}
              </div>

              {folderTestResult && (
                <div
                  style={{
                    fontSize: 11.5,
                    color: folderTestResult.ok ? '#4ade80' : '#fb5f76',
                    fontWeight: 650,
                  }}
                >
                  {folderTestResult.ok
                    ? isZh
                      ? `✓ Finder 目录打开测试成功：${folderTestResult.path}`
                      : `✓ Opened in Finder: ${folderTestResult.path}`
                    : isZh
                      ? `✕ 打开目录失败：${folderTestResult.error}`
                      : `✕ Failed: ${folderTestResult.error}`}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <XButton
                  variant="filled"
                  size="sm"
                  disabled={busyAction !== null}
                  onClick={() => void handleTestOpenFolder()}
                >
                  <AppIcon name="folder" size={12} />
                  {isZh ? '立即打开截图目录 (Finder)' : 'Open Folder in Finder'}
                </XButton>
                <XButton
                  variant="tonal"
                  size="sm"
                  disabled={busyAction !== null}
                  onClick={() => void onSelectFolder()}
                >
                  <AppIcon name="save" size={12} />
                  {isZh ? '浏览 / 更换目录' : 'Select Folder'}
                </XButton>
                <XButton
                  variant="ghost"
                  size="sm"
                  disabled={busyAction !== null}
                  onClick={async () => {
                    setBusyAction('req-folder')
                    try {
                      await onRequestPermission('folder', { openSettingsIfDenied: true })
                    } finally {
                      setBusyAction(null)
                    }
                  }}
                >
                  <AppIcon name="check" size={12} />
                  {isZh ? '验证读写权限' : 'Verify Write Access'}
                </XButton>
                {isMac && (
                  <XButton
                    variant="ghost"
                    size="sm"
                    onClick={() => void onOpenPreference('files')}
                  >
                    <AppIcon name="external" size={12} />
                    {isZh ? '文件与文件夹权限' : 'Files & Folders Settings'}
                  </XButton>
                )}
              </div>
            </div>
          </XMd3eSection>
        </div>
      </div>
    </div>
  )
}
