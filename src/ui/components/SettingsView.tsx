import * as React from 'react'
import { AppIcon } from './AppIcon.js'
import type { ScreenshotConfig } from '../../core/types.js'
import type { MacOSPermissionsStatus, MacPermissionPane } from '../adapter/types.js'

export interface SettingsViewProps {
  config: ScreenshotConfig
  onChange: (patch: Partial<ScreenshotConfig>) => void
  onClearLogs?: () => void
  onCheckUpdate?: () => void
  onOpenGithub?: () => void
  appVersion?: string
  locale?: 'zh' | 'en'
  isMac?: boolean
  macPermissions?: MacOSPermissionsStatus | null
  onOpenMacPreference?: (pane: MacPermissionPane) => void
  onOpenPermissionsView?: () => void
  onToggleAutoStart?: (enable: boolean) => void
  onEnterLightweightMode?: () => void
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
  onOpenPermissionsView,
  onToggleAutoStart,
  onEnterLightweightMode,
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent, #b4f461)' }}>
              <AppIcon name="cpu" size={14} />
              {isZh ? 'macOS 系统权限与环境检测' : 'macOS System Permissions & Environment'}
            </span>
            {onOpenPermissionsView && (
              <button
                className="shiin-btn"
                data-variant="filled"
                style={{ height: 26, fontSize: 11, padding: '0 10px', gap: 4 }}
                onClick={onOpenPermissionsView}
              >
                <AppIcon name="shield" size={12} />
                {isZh ? '打开权限自检中心' : 'Open Diagnostics'}
              </button>
            )}
          </div>
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
          {isZh ? '启动与托盘（含轻量模式）' : 'Startup, Tray & Lightweight Mode'}
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
              <div>{isZh ? '启动时直接进入轻量托盘模式 (--tray)' : 'Launch Directly in Lightweight Mode (--tray)'}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                {isZh
                  ? '启动时不创建主窗口与 React 渲染进程，仅初始化后台手柄监听与托盘'
                  : 'Skip creating main window and renderer on startup'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.startInLightweightMode || false}
              onChange={(e) => {
                onChange({ startInLightweightMode: e.target.checked })
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div>{isZh ? '关闭主窗口策略' : 'Close Button Behavior'}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                {isZh
                  ? '保留「普通隐藏到托盘（保留界面）」与「轻量模式（销毁主窗口释放内存）」两个独立选项'
                  : 'Choose between exiting, hiding to tray, or destroying the window in lightweight mode'}
              </div>
            </div>
            <select
              className="shiin-select"
              value={config.closeType || 'exit'}
              onChange={(e) => onChange({ closeType: e.target.value as any })}
            >
              <option value="exit">{isZh ? '直接退出程序' : 'Exit application'}</option>
              <option value="tray">{isZh ? '隐藏到系统托盘（保留界面资源）' : 'Hide to tray (Keep UI in memory)'}</option>
              <option value="lightweight">{isZh ? '进入轻量模式（销毁窗口释放内存）' : 'Lightweight mode (Destroy UI window)'}</option>
            </select>
          </div>

          {onEnterLightweightMode && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div>{isZh ? '立即切换至轻量模式' : 'Enter Lightweight Mode Now'}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                  {isZh
                    ? '立即销毁当前主窗口并释放前端渲染内存，手柄后台监听与托盘继续运行（可通过托盘随时恢复界面）'
                    : 'Destroy main window to free renderer memory while keeping gamepad listener active in tray'}
                </div>
              </div>
              <button
                className="shiin-btn"
                data-variant="tonal"
                style={{ height: 28, fontSize: 11, padding: '0 12px' }}
                onClick={onEnterLightweightMode}
              >
                <AppIcon name="minimize" size={12} />
                {isZh ? '进入轻量模式' : 'Lightweight Mode'}
              </button>
            </div>
          )}

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

      {/* 语言与区域 */}
      <div className="shiin-card" style={{ gap: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <AppIcon name="sparkles" size={14} />
          {isZh ? '界面语言 (Language)' : 'Interface Language'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
          <div>
            <div>{isZh ? '系统界面多语言' : 'Display Language'}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
              {isZh ? '即时切换，无需重启应用' : 'Hot-switched instantly without restart'}
            </div>
          </div>
          <select
            className="shiin-select"
            value={locale}
            onChange={(e) => {
              const nextLoc = e.target.value
              if ((window as any).electronAPI?.applyLocale) {
                void (window as any).electronAPI.applyLocale(nextLoc)
              }
              if ((window as any).electronAPI?.setStore) {
                void (window as any).electronAPI.setStore('locale', nextLoc)
              }
              onChange({ locale: nextLoc } as any)
            }}
          >
            <option value="zh">简体中文 (zh)</option>
            <option value="zh-TW">繁體中文 (zh-TW)</option>
            <option value="en">English (en)</option>
            <option value="ja">日本語 (ja)</option>
            <option value="ko">한국어 (ko)</option>
            <option value="de">Deutsch (de)</option>
            <option value="fr">Français (fr)</option>
            <option value="es">Español (es)</option>
            <option value="ru">Русский (ru)</option>
          </select>
        </div>
      </div>

      {/* 截图通知浮窗 */}
      <div className="shiin-card" style={{ gap: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <AppIcon name="bell" size={14} />
          {isZh ? '覆层通知与提示' : 'Overlay Toast Notifications'}
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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div>{isZh ? '悬浮通知显示位置' : 'Toast Position'}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                {isZh ? '屏幕左上角或右上角浮层展示' : 'Top-left or top-right of the screen'}
              </div>
            </div>
            <select
              className="shiin-select"
              value={config.overlayNotifyPosition || 'right'}
              onChange={(e) => onChange({ overlayNotifyPosition: e.target.value as any })}
            >
              <option value="right">{isZh ? '屏幕右上角' : 'Top Right'}</option>
              <option value="left">{isZh ? '屏幕左上角' : 'Top Left'}</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div>{isZh ? '测试通知与音效' : 'Test Notification & Sound'}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                {isZh ? '立即预览当前音效与屏幕浮层通知效果' : 'Preview toast overlay and shutter sound'}
              </div>
            </div>
            <button
              className="shiin-btn"
              data-variant="tonal"
              style={{ height: 28, fontSize: 11, padding: '0 12px' }}
              onClick={async () => {
                const { playCaptureSound } = await import('../audio.js')
                void playCaptureSound(config.sound, config.soundPower)
                if ((window as any).electronAPI?.showScreenshotNotification) {
                  void (window as any).electronAPI.showScreenshotNotification({
                    title: isZh ? '截图测试通知' : 'Screenshot Toast Test',
                    desc: isZh ? '通知浮层与音效工作正常' : 'Toast and sound are working properly',
                    duration: 3500,
                  })
                }
              }}
            >
              <AppIcon name="sparkles" size={13} />
              {isZh ? '测试通知浮层' : 'Test Overlay'}
            </button>
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
