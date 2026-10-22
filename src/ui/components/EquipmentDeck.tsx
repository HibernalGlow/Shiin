import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { AppIcon } from './AppIcon.js'
import { Md3eMorphShape } from './bento-controls.js'
import { useMd3eShapes } from '../md3e-shape-context.js'
import { getPressedShape } from '../md3e-shapes.js'
import type { GamepadDeviceInfo, ScreenshotResult } from '../../core/types.js'

export interface EquipmentDeckProps {
  locale: string
  listening: boolean
  pending: boolean
  result: ScreenshotResult | null
  activeDevice?: GamepadDeviceInfo
  target: string
  targetModeLabel: string
  output: string
  folder: string
  comboSummary: string
  comboCount: number
  autoArchive: boolean
  obsReplay: boolean
  permissionMissing: boolean
  onCapture: () => void
  onToggleListen: () => void
  onSaveOBS: () => void
  onOpenFolder: () => void
  onOpenPermissions: () => void
  onRefreshGamepads?: () => void
}

/**
 * Material 3 Expressive Bento Hero Stage:
 * - .sb-capture-hero (span 8): Display headline, live pipeline chips, 68px primary CTA, connected quick actions, and 204px morphing shutter orb
 * - .sb-hero-session (span 4): 64px morphing device orb, controller telemetry, and pipeline readout rows
 * - .sb-metric-carousel (span 12): 4 interactive spring-expanding M3E metric cards
 */
export function EquipmentDeck({
  locale,
  listening,
  pending,
  result,
  activeDevice,
  target,
  targetModeLabel,
  output,
  folder,
  comboSummary,
  comboCount,
  autoArchive,
  obsReplay,
  permissionMissing,
  onCapture,
  onToggleListen,
  onSaveOBS,
  onOpenFolder,
  onOpenPermissions,
  onRefreshGamepads,
}: EquipmentDeckProps) {
  const isZh = locale.startsWith('zh')
  const { session } = useMd3eShapes()
  const reduced = useReducedMotion()
  const [pressed, setPressed] = React.useState(false)

  const heroShape = session.shapes.hero
  const deviceShape = session.shapes.device
  const controlShape = session.shapes.control
  const metricShape = session.shapes.metric
  const fileName = result?.filePath?.split(/[\\/]/).pop()

  return (
    <>
      {/* Left 8-col Expressive Capture Hero Card */}
      <motion.section
        className="sb-tile sb-capture-hero"
        aria-label={isZh ? '截图主舞台' : 'Capture hero stage'}
        initial={{ opacity: 0, y: reduced ? 0 : 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        <div className="sb-capture-copy">
          <p className="sb-eyebrow">
            SHIIN STUDIO · {isZh ? '即时捕获与回放工作台' : 'INSTANT CAPTURE & REPLAY'}
          </p>
          <h2>{isZh ? '留住，这一帧。' : 'Keep this frame.'}</h2>
          <p className="sb-lede">
            {isZh
              ? '手柄组合键或手动快门一键留存当前游戏画面，自动按窗口归档并衔接 OBS 回放缓冲。'
              : 'Capture any frame via gamepad combos or the manual shutter, with automatic per-game filing and OBS replay.'}
          </p>

          <div className="sb-capture-status">
            <span className={`sb-status-chip ${listening ? 'on' : ''}`}>
              <i aria-hidden="true" />
              {listening
                ? isZh
                  ? '后台监听已接通'
                  : 'Listener active'
                : isZh
                  ? '手动快门待命'
                  : 'Manual shutter ready'}
            </span>
            <span className="sb-status-chip">
              <AppIcon name="monitor" size={13} />
              {target}
            </span>
            <span className="sb-status-chip">
              <AppIcon name="save" size={13} />
              {output}
            </span>
            {permissionMissing && (
              <button
                type="button"
                className="sb-status-chip warn shiin-chip-btn"
                onClick={onOpenPermissions}
              >
                <i aria-hidden="true" />
                {isZh ? '屏幕录制权限待开启' : 'Screen permission needed'}
                <AppIcon name="chevronRight" size={13} />
              </button>
            )}
          </div>

          <div className="sb-capture-actions">
            <motion.button
              type="button"
              className="sb-capture-primary"
              onClick={onCapture}
              disabled={pending}
              aria-busy={pending}
              whileTap={reduced ? undefined : { scale: 0.96 }}
            >
              <span className="sb-cta-icon" aria-hidden="true">
                <Md3eMorphShape path={controlShape.svgPath} className="sb-cta-icon-shape" />
                <AppIcon name={pending ? 'clock' : 'camera'} size={17} />
              </span>
              {pending ? (isZh ? '正在捕获画面…' : 'Capturing frame…') : isZh ? '立即截图' : 'Capture now'}
            </motion.button>

            <div className="shiin-hero-connected" role="group" aria-label={isZh ? '快捷操作' : 'Quick actions'}>
              <button type="button" aria-pressed={listening} onClick={onToggleListen}>
                <AppIcon name={listening ? 'stop' : 'play'} size={16} />
                {listening
                  ? isZh
                    ? '暂停监听'
                    : 'Pause listener'
                  : isZh
                    ? '开启监听'
                    : 'Start listening'}
              </button>
              <button type="button" onClick={onSaveOBS}>
                <AppIcon name="wave" size={16} />
                {isZh ? '保存回放' : 'Save replay'}
              </button>
              <button type="button" onClick={onOpenFolder} title={folder || undefined}>
                <AppIcon name="folder" size={16} />
                {isZh ? '截图目录' : 'Folder'}
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {result && (
              <motion.div
                className="shiin-hero-delivery"
                data-error={!result.ok}
                key={result.timestamp}
                role="status"
                aria-live="polite"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: reduced ? 0 : 0.2 }}
              >
                <AppIcon name={result.ok ? 'check' : 'alert'} size={16} />
                <strong>
                  {result.ok
                    ? isZh
                      ? '已交付这一帧'
                      : 'Frame delivered'
                    : isZh
                      ? '捕获未完成'
                      : 'Capture failed'}
                </strong>
                <span>
                  {result.ok
                    ? fileName || (isZh ? '已写入系统剪贴板' : 'Copied to clipboard')
                    : result.error}
                </span>
                {result.ok && result.filePath && (
                  <button type="button" onClick={onOpenFolder}>
                    {isZh ? '打开目录' : 'Open folder'}
                    <AppIcon name="external" size={13} />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="sb-capture-art">
          <div className="shiin-orb-stage">
            <svg className="shiin-orb-ring" viewBox="0 0 240 240" aria-hidden="true">
              <circle
                cx="120"
                cy="120"
                r="112"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeDasharray="3 8"
              />
              <path
                d="M120 2v12M238 120h-12M120 238v-12M2 120h12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            <motion.button
              type="button"
              className="sb-capture-orb"
              onClick={onCapture}
              disabled={pending}
              aria-label={isZh ? '立即截图' : 'Capture now'}
              aria-busy={pending}
              onPointerDown={() => setPressed(true)}
              onPointerUp={() => setPressed(false)}
              onPointerLeave={() => setPressed(false)}
              onPointerCancel={() => setPressed(false)}
              onBlur={() => setPressed(false)}
              whileHover={reduced ? undefined : { rotate: -5, scale: 1.04 }}
              whileTap={reduced ? undefined : { scale: 0.91, rotate: 6 }}
              animate={pending && !reduced ? { rotate: 14, scale: 0.94 } : { rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 360, damping: 20 }}
            >
              <Md3eMorphShape
                path={heroShape.svgPath}
                pressed={pressed || pending}
                pressedPath={getPressedShape(heroShape.id).svgPath}
                className="sb-capture-shape"
              />
              <span className="shiin-orb-face">
                <AppIcon name={pending ? 'clock' : 'camera'} size={36} />
                <strong>{pending ? (isZh ? '捕获中' : 'Busy') : isZh ? '快门' : 'Shutter'}</strong>
              </span>
            </motion.button>
          </div>
          <span className="sb-capture-shape-label">
            {isZh ? heroShape.name : heroShape.nameEn} · {isZh ? '快门轮廓' : 'SHUTTER'}
          </span>
          <span className="sb-capture-hint">
            {isZh ? '点击球体或主按钮立即截取' : 'Click orb or primary button to capture'}
          </span>
        </div>
      </motion.section>

      {/* Right 4-col Controller & Pipeline Session Card */}
      <motion.section
        className="sb-tile sb-hero-session"
        aria-label={isZh ? '设备与管线状态' : 'Controller and pipeline session'}
        initial={{ opacity: 0, y: reduced ? 0 : 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28, delay: reduced ? 0 : 0.04 }}
      >
        <Md3eMorphShape path={deviceShape.svgPath} className="sb-session-ghost" />

        <div className="sb-session-focus">
          <span
            className={`sb-session-orb ${activeDevice ? 'is-connected' : 'is-searching'}`}
            aria-hidden="true"
          >
            <Md3eMorphShape path={deviceShape.svgPath} className="sb-mask" />
            <AppIcon name="gamepad" size={24} />
          </span>
          <div className="sb-session-copy">
            <p className="sb-eyebrow">{isZh ? '当前输入通道' : 'ACTIVE CONTROLLER'}</p>
            <strong>{activeDevice ? activeDevice.name : isZh ? '等待手柄接入' : 'No controller'}</strong>
            <small>
              {activeDevice
                ? listening
                  ? isZh
                    ? '组合键监听已就绪'
                    : 'Combo trigger armed'
                  : isZh
                    ? '已连接 · 开启监听即可用组合键'
                    : 'Connected · enable listener for combos'
                : isZh
                  ? '连接手柄按任意键唤醒，或直接使用手动快门'
                  : 'Press any gamepad button or use manual shutter'}
            </small>
          </div>
        </div>

        <div className="shiin-session-rows">
          <div className="shiin-session-row">
            <span>{isZh ? '捕获目标' : 'Target'}</span>
            <strong title={target}>{target}</strong>
          </div>
          <div className="shiin-session-row">
            <span>{isZh ? '触发组合' : 'Combo'}</span>
            <strong>{comboSummary}</strong>
          </div>
          <div className="shiin-session-row">
            <span>{isZh ? '保存目录' : 'Folder'}</span>
            <strong title={folder || undefined}>
              {folder ? folder.split(/[\\/]/).filter(Boolean).pop() || folder : isZh ? '系统默认目录' : 'System default'}
            </strong>
          </div>
        </div>

        <div className="sb-connected sb-session-actions">
          {onRefreshGamepads && (
            <button type="button" onClick={onRefreshGamepads}>
              <AppIcon name="refresh" size={14} />
              {isZh ? '扫描手柄' : 'Rescan'}
            </button>
          )}
          <button type="button" onClick={onOpenPermissions}>
            <AppIcon name="shield" size={14} />
            {permissionMissing
              ? isZh
                ? '开启权限'
                : 'Fix access'
              : isZh
                ? '系统访问'
                : 'Access'}
          </button>
        </div>
      </motion.section>

      {/* 12-col Expressive Spring Metric Strip */}
      <div className="sb-metric-carousel" role="region" aria-label={isZh ? '管线速览' : 'Pipeline overview'}>
        <article className="sb-metric" data-tone="primary">
          <span className="sb-metric-shape" aria-hidden="true">
            <Md3eMorphShape path={metricShape.svgPath} className="sb-mask" />
          </span>
          <strong className="sb-metric-value">{targetModeLabel}</strong>
          <span className="sb-metric-label">{target}</span>
        </article>

        <article className="sb-metric" data-tone="secondary">
          <span className="sb-metric-shape" aria-hidden="true">
            <Md3eMorphShape path={controlShape.svgPath} className="sb-mask" />
          </span>
          <strong className="sb-metric-value">
            {comboCount > 0 ? `${comboCount} ${isZh ? '键组合' : 'Keys'}` : isZh ? '未绑定' : 'Unbound'}
          </strong>
          <span className="sb-metric-label">{comboSummary}</span>
        </article>

        <article className="sb-metric" data-tone="tertiary">
          <span className="sb-metric-shape" aria-hidden="true">
            <Md3eMorphShape path={session.shapes.icon.svgPath} className="sb-mask" />
          </span>
          <strong className="sb-metric-value">{output.split(' · ')[0]}</strong>
          <span className="sb-metric-label">
            {output} · {autoArchive ? (isZh ? '按游戏归档' : 'Per-game folder') : isZh ? '统一目录' : 'Single folder'}
          </span>
        </article>

        <article className="sb-metric" data-tone="secondary">
          <span className="sb-metric-shape" aria-hidden="true">
            <Md3eMorphShape path={deviceShape.svgPath} className="sb-mask" />
          </span>
          <strong className="sb-metric-value">
            {listening ? (isZh ? '监听运行中' : 'Listening') : isZh ? '待命状态' : 'Standby'}
          </strong>
          <span className="sb-metric-label">
            {obsReplay
              ? isZh
                ? '长按 1 秒保存 OBS 回放'
                : 'Hold 1s for OBS replay'
              : isZh
                ? '可随时开启长按回放'
                : 'Long-press replay optional'}
          </span>
        </article>
      </div>
    </>
  )
}
