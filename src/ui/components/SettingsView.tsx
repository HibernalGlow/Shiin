import * as React from 'react'
import { AppIcon } from './AppIcon.js'
import type { ScreenshotConfig } from '../../core/types.js'

export interface SettingsViewProps {
  config: ScreenshotConfig
  onChange: (patch: Partial<ScreenshotConfig>) => void
  onClearLogs?: () => void
  onCheckUpdate?: () => void
  onOpenGithub?: () => void
  appVersion?: string
  locale?: 'zh' | 'en'
  isMac?: boolean
  macPermissions?: { screenCapture: boolean; accessibility: boolean } | null
  onOpenMacPreference?: (pane: 'screen' | 'accessibility') => void
  onToggleAutoStart?: (enable: boolean) => void
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  onChange,
  onClearLogs,
  onCheckUpdate,
  onOpenGithub,
  appVersion = '2.0.0',
  locale = 'zh',
  isMac = false,
  macPermissions,
  onOpenMacPreference,
  onToggleAutoStart,
}) => {
  const isZh = locale === 'zh'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
        {isZh ? '系统与运行设置' : 'System & Behavior Settings'}
      </h2>

      {/* macOS 专用系统权限与集成卡片 */}
      {isMac && (
        <div className="shiin-card" style={{ gap: 12, border: '1px solid rgba(110, 227, 240, 0.25)', background: 'rgba(110, 227, 240, 0.03)' }}>
          <span style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent, #b4f461)' }}>
            <AppIcon name="cpu" size={14} />
            {isZh ? 'macOS 系统权限与环境检测' : 'macOS System Permissions & Environment'}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
            {/* 屏幕录制权限 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{isZh ? '屏幕录制权限 (Screen Recording)' : 'Screen Recording'}</span>
                  <span style={{
                    fontSize: 10,
                    padding: '1px 6px',
                    borderRadius: 4,
                    background: macPermissions?.screenCapture ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: macPermissions?.screenCapture ? '#4ade80' : '#ef4444',
                    fontWeight: 600,
                  }}>
                    {macPermissions?.screenCapture ? (isZh ? '已授权' : 'Granted') : (isZh ? '未授权' : 'Denied')}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                  {isZh ? '截取桌面与游戏窗口画面的核心系统权限' : 'Required to capture desktop screens and game windows'}
                </div>
              </div>
              {!macPermissions?.screenCapture && (
                <button
                  className="shiin-btn"
                  data-variant="tonal"
                  style={{ height: 26, fontSize: 11, padding: '0 10px' }}
                  onClick={() => onOpenMacPreference?.('screen')}
                >
                  {isZh ? '前往系统设置' : 'Open Settings'}
                </button>
              )}
            </div>

            {/* 辅助功能权限 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{isZh ? '辅助功能 / 输入监控 (Accessibility)' : 'Accessibility / Input Monitoring'}</span>
                  <span style={{
                    fontSize: 10,
                    padding: '1px 6px',
                    borderRadius: 4,
                    background: macPermissions?.accessibility ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: macPermissions?.accessibility ? '#4ade80' : '#ef4444',
                    fontWeight: 600,
                  }}>
                    {macPermissions?.accessibility ? (isZh ? '已授权' : 'Granted') : (isZh ? '未授权' : 'Denied')}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                  {isZh ? '全局键盘快捷键监听所需权限（手柄监听无需此权限）' : 'Required for background global hotkeys'}
                </div>
              </div>
              {!macPermissions?.accessibility && (
                <button
                  className="shiin-btn"
                  data-variant="tonal"
                  style={{ height: 26, fontSize: 11, padding: '0 10px' }}
                  onClick={() => onOpenMacPreference?.('accessibility')}
                >
                  {isZh ? '前往系统设置' : 'Open Settings'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 启动与窗口行为 */}
      <div className="shiin-card" style={{ gap: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <AppIcon name="power" size={14} />
          {isZh ? '启动与托盘' : 'Startup & Tray'}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div>{isZh ? '开机自启动' : 'Launch at Startup'}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                {isZh ? '登录系统后自动在后台启动' : 'Start automatically upon system login'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.autoStart || false}
              onChange={(e) => {
                const val = e.target.checked
                onChange({ autoStart: val })
                onToggleAutoStart?.(val)
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div>{isZh ? '关闭主窗口策略' : 'Close Button Behavior'}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                {isZh ? '点击红叉时是最小化到托盘还是彻底退出' : 'Minimize to system tray or exit process'}
              </div>
            </div>
            <select
              className="shiin-select"
              value={config.closeType || 'exit'}
              onChange={(e) => onChange({ closeType: e.target.value as any })}
            >
              <option value="exit">{isZh ? '直接退出程序' : 'Exit application'}</option>
              <option value="tray">{isZh ? '最小化到系统托盘' : 'Minimize to tray'}</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div>{isZh ? '同名文件冲突策略' : 'Filename Conflict'}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                {isZh ? '截图保存路径已存在同名文件时的处理方案' : 'Action when file already exists'}
              </div>
            </div>
            <select
              className="shiin-select"
              value={config.filenameConflictResolution || 'overwrite'}
              onChange={(e) => onChange({ filenameConflictResolution: e.target.value as any })}
            >
              <option value="overwrite">{isZh ? '直接覆盖' : 'Overwrite'}</option>
              <option value="appendTimestamp">{isZh ? '追加时间戳' : 'Append Timestamp'}</option>
              <option value="notSave">{isZh ? '放弃保存' : 'Do Not Save'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 截图通知浮窗 */}
      <div className="shiin-card" style={{ gap: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <AppIcon name="bell" size={14} />
          {isZh ? '通知与提示' : 'Notifications'}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div>{isZh ? '截图成功屏幕悬浮通知' : 'Overlay Toast Notification'}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                {isZh ? '截图完成后在屏幕角展示缩略图卡片' : 'Show preview toast on completion'}
              </div>
            </div>
            <select
              className="shiin-select"
              value={config.overlayNotify || 'show'}
              onChange={(e) => onChange({ overlayNotify: e.target.value as any })}
            >
              <option value="show">{isZh ? '开启显示' : 'Enabled'}</option>
              <option value="hide">{isZh ? '关闭' : 'Disabled'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 数据与版本 */}
      <div className="shiin-card" style={{ gap: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <AppIcon name="database" size={14} />
          {isZh ? '数据维护与更新' : 'Data & Updates'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 550 }}>Gamepad Screenshot Tool · Shiin</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
              Version {appVersion}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {onClearLogs && (
              <button className="shiin-btn" data-variant="danger" onClick={onClearLogs}>
                <AppIcon name="trash" size={13} />
                {isZh ? '清理日志' : 'Clear Logs'}
              </button>
            )}
            {onCheckUpdate && (
              <button className="shiin-btn" data-variant="tonal" onClick={onCheckUpdate}>
                <AppIcon name="refresh" size={13} />
                {isZh ? '检查更新' : 'Check Updates'}
              </button>
            )}
            {onOpenGithub && (
              <button className="shiin-btn" data-variant="ghost" onClick={onOpenGithub}>
                <AppIcon name="github" size={13} />
                GitHub
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
