import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { AppIcon } from './AppIcon.js'
import { useI18n } from '../i18n.js'

export interface UpdateState {
  status: 'idle' | 'checking' | 'uptodate' | 'available' | 'downloading' | 'ready' | 'applying' | 'manual' | 'error'
  currentVersion: string
  latestVersion?: string
  progress?: number
  size?: number
  downloadedBytes?: number
  totalBytes?: number
  speed?: number
  releaseUrl?: string
  notes?: string
  error?: string
  mode?: 'hot' | 'manual'
  mandatory?: boolean
  publishedAt?: string
}

export interface UpdateDialogProps {
  open: boolean
  onClose: () => void
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let n = bytes
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i++
  }
  return `${n.toFixed(1)} ${units[i]}`
}

export const UpdateDialog: React.FC<UpdateDialogProps> = ({ open, onClose }) => {
  const { t } = useI18n()
  const [state, setState] = useState<UpdateState>({
    status: 'checking',
    currentVersion: '2.0.0',
    progress: 0,
  })

  // 监听主进程 updater 状态推送
  useEffect(() => {
    const api = (window as any).electronAPI
    if (!api) return

    if (api.getUpdateState) {
      api.getUpdateState().then((s: UpdateState) => {
        if (s) setState((prev) => ({ ...prev, ...s }))
      })
    }

    if (api.onUpdaterState) {
      const unsub = api.onUpdaterState((nextState: UpdateState) => {
        if (nextState) setState((prev) => ({ ...prev, ...nextState }))
      })
      return () => {
        if (unsub) unsub()
        else if (api.offUpdaterState) api.offUpdaterState()
      }
    }
  }, [])

  // 弹窗打开时自动检查一次（如果正处于 idle 或 error）
  useEffect(() => {
    if (open && (state.status === 'idle' || state.status === 'error')) {
      handleCheckUpdate()
    }
  }, [open])

  const handleCheckUpdate = useCallback(async () => {
    const api = (window as any).electronAPI
    if (api?.checkUpdate) {
      setState((prev) => ({ ...prev, status: 'checking', error: undefined }))
      try {
        const nextState = await api.checkUpdate({ quiet: false })
        if (nextState) setState((prev) => ({ ...prev, ...nextState }))
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: err?.message || String(err),
        }))
      }
    }
  }, [])

  const handleDownload = useCallback(async () => {
    const api = (window as any).electronAPI
    if (api?.downloadUpdate) {
      try {
        await api.downloadUpdate()
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: err?.message || String(err),
        }))
      }
    }
  }, [])

  const handleApply = useCallback(async () => {
    const api = (window as any).electronAPI
    if (api?.applyUpdate) {
      try {
        await api.applyUpdate()
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: err?.message || String(err),
        }))
      }
    }
  }, [])

  const handleCancel = useCallback(() => {
    const api = (window as any).electronAPI
    if (api?.cancelUpdate) {
      api.cancelUpdate()
    }
  }, [])

  const handleOpenRelease = useCallback(() => {
    const api = (window as any).electronAPI
    if (api?.openUpdateReleasePage) {
      api.openUpdateReleasePage(state.releaseUrl)
    } else if (api?.openExternal && state.releaseUrl) {
      api.openExternal(state.releaseUrl)
    }
  }, [state.releaseUrl])

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'shiinFadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && state.status !== 'downloading' && state.status !== 'applying') {
          onClose()
        }
      }}
    >
      <div
        className="shiin-card"
        style={{
          width: 440,
          maxWidth: '90vw',
          borderRadius: 20,
          background: 'var(--surface-overlay, rgba(30, 32, 40, 0.94))',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.36), 0 0 0 1px var(--line-strong)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* 头部标题与版本对比 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background:
                  state.status === 'uptodate'
                    ? 'rgba(40, 199, 111, 0.16)'
                    : state.status === 'error'
                    ? 'rgba(234, 84, 85, 0.16)'
                    : 'var(--accent-soft, rgba(80, 140, 255, 0.16))',
                color:
                  state.status === 'uptodate'
                    ? '#28c76f'
                    : state.status === 'error'
                    ? '#ea5455'
                    : 'var(--accent, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppIcon
                name={
                  state.status === 'uptodate'
                    ? 'check'
                    : state.status === 'error'
                    ? 'close'
                    : state.status === 'downloading'
                    ? 'sliders'
                    : 'sparkles'
                }
                size={20}
              />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{t('Update.title', { version: state.currentVersion })}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>v{state.currentVersion}</span>
                {state.latestVersion && state.latestVersion !== state.currentVersion && (
                  <>
                    <span style={{ opacity: 0.5 }}>→</span>
                    <span style={{ color: 'var(--accent, #3b82f6)', fontWeight: 600 }}>v{state.latestVersion}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shiin-btn"
            data-variant="ghost"
            style={{ width: 32, height: 32, padding: 0, borderRadius: 10 }}
          >
            <AppIcon name="close" size={14} />
          </button>
        </div>

        {/* 主体状态卡片 */}
        <div style={{ minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {state.status === 'checking' && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--ink-2)', fontSize: 13 }}>
              <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginBottom: 12 }}>
                <AppIcon name="refresh" size={24} />
              </div>
              <div>{t('Update.checking', '正在检查最新版本...')}</div>
            </div>
          )}

          {state.status === 'uptodate' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{t('Update.upToDate', '已是最新版本')}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                {t('Update.upToDateDesc', { version: state.currentVersion }) || `当前版本 v${state.currentVersion} 已是最新稳定版`}
              </div>
            </div>
          )}

          {(state.status === 'available' || state.status === 'manual') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, flexWrap: 'wrap' }}>
                {state.size && (
                  <span style={{ padding: '2px 8px', borderRadius: 6, background: 'var(--surface-2)', color: 'var(--ink-2)' }}>
                    {formatBytes(state.size)}
                  </span>
                )}
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: state.mode === 'hot' ? 'rgba(40, 199, 111, 0.15)' : 'rgba(80, 140, 255, 0.15)',
                    color: state.mode === 'hot' ? '#28c76f' : 'var(--accent, #3b82f6)',
                    fontWeight: 600,
                  }}
                >
                  {state.mode === 'hot' ? t('Update.inApp', '应用内热更新') : t('Update.manualMode', '完整安装包')}
                </span>
                {state.mandatory && (
                  <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(234, 84, 85, 0.15)', color: '#ea5455', fontWeight: 600 }}>
                    {t('Update.mandatory', '关键更新')}
                  </span>
                )}
              </div>
              <div
                style={{
                  maxHeight: 140,
                  overflowY: 'auto',
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: 'var(--surface-2)',
                  fontSize: 12,
                  lineHeight: 1.6,
                  color: 'var(--ink-1)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {state.notes || t('Update.noNotes', '新版本已发布，带来体验优化与稳定性修复。')}
              </div>
            </div>
          )}

          {state.status === 'downloading' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '10px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--ink-2)' }}>{t('Update.downloading', '正在下载补丁...')}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{(state.progress || 0).toFixed(1)}%</span>
              </div>
              <div style={{ width: '100%', height: 6, borderRadius: 99, background: 'var(--surface-2)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, Math.max(0, state.progress || 0))}%`,
                    height: '100%',
                    background: 'var(--accent, #3b82f6)',
                    borderRadius: 99,
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-3)' }}>
                <span>{state.downloadedBytes ? formatBytes(state.downloadedBytes) : ''}</span>
                <span>{state.totalBytes ? formatBytes(state.totalBytes) : ''}</span>
              </div>
            </div>
          )}

          {state.status === 'ready' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{t('Update.ready', '更新已下载就绪')}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>{t('Update.readyDesc', '点击下方按钮将立即重启应用并完成版本替换')}</div>
            </div>
          )}

          {state.status === 'applying' && (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--ink-2)', fontSize: 13 }}>
              <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginBottom: 12 }}>
                <AppIcon name="refresh" size={24} />
              </div>
              <div>{t('Update.applying', '正在应用更新并重新启动...')}</div>
            </div>
          )}

          {state.status === 'error' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#ea5455', marginBottom: 6 }}>
                {t('Update.error', '检查更新失败')}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', wordBreak: 'break-all' }}>{state.error}</div>
            </div>
          )}
        </div>

        {/* 底部操作按钮 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, paddingTop: 8, borderTop: '1px solid var(--line)' }}>
          {state.status === 'available' && (
            <>
              <button className="shiin-btn" data-variant="tonal" onClick={handleOpenRelease} style={{ fontSize: 12, height: 32 }}>
                {t('Update.openBrowser', '浏览器下载')}
              </button>
              <button className="shiin-btn" data-variant="primary" onClick={handleDownload} style={{ fontSize: 12, height: 32 }}>
                {t('Update.downloadNow', '立即下载更新')}
              </button>
            </>
          )}

          {state.status === 'manual' && (
            <button className="shiin-btn" data-variant="primary" onClick={handleOpenRelease} style={{ fontSize: 12, height: 32 }}>
              {t('Update.openBrowser', '前往发布页下载')}
            </button>
          )}

          {state.status === 'downloading' && (
            <button className="shiin-btn" data-variant="tonal" onClick={handleCancel} style={{ fontSize: 12, height: 32 }}>
              {t('Update.cancel', '取消')}
            </button>
          )}

          {state.status === 'ready' && (
            <button className="shiin-btn" data-variant="primary" onClick={handleApply} style={{ fontSize: 12, height: 32 }}>
              {t('Update.restartNow', '立即重启并安装')}
            </button>
          )}

          {(state.status === 'uptodate' || state.status === 'error') && (
            <button className="shiin-btn" data-variant="tonal" onClick={handleCheckUpdate} style={{ fontSize: 12, height: 32 }}>
              {t('Update.recheck', '重新检查')}
            </button>
          )}

          <button className="shiin-btn" data-variant="ghost" onClick={onClose} style={{ fontSize: 12, height: 32 }}>
            {t('ui.close', '关闭')}
          </button>
        </div>
      </div>
    </div>
  )
}
