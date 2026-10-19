/**
 * Material 3 Expressive (MD3E) 标准设计体系与核心组件
 * 严格对齐 Xaihi @hibernalglow/xaihi-ui-kit 与 Rossi 灵动几何规范
 * 参考 shellect / bitv 最佳工程实践，完全基于 CSS 变量 --xaihi-* 与 --dsw-alias-*
 */
import * as React from 'react'


export const ALIAS = {
  surface: 'var(--xaihi-surface, var(--dsw-alias-bg-layer-1, #12141a))',
  onSurface: 'var(--xaihi-on-surface, var(--dsw-alias-label-primary, #f2f4f8))',
  onSurfaceVariant: 'var(--xaihi-on-surface-variant, var(--dsw-alias-label-secondary, #98a1b0))',
  outline: 'var(--xaihi-outline, var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.12)))',
  primary: 'var(--xaihi-primary, var(--dsw-alias-label-primary, #b4f461))',
  onPrimary: 'var(--xaihi-on-primary, var(--dsw-alias-label-primary-inverted, #0a0c08))',
  secondaryContainer: 'var(--xaihi-secondary-container, var(--dsw-alias-interactive-bg-hover, rgba(128, 128, 128, 0.16)))',
  onSecondaryContainer: 'var(--xaihi-on-secondary-container, var(--dsw-alias-label-primary, #ffffff))',
  error: 'var(--xaihi-error, var(--dsw-alias-state-error-primary, #fb5f76))',
} as const

export const MD3E_ALIAS = {
  surface: 'var(--xaihi-md3e-surface, var(--md3e-surface, var(--xaihi-surface, #12141a)))',
  surfaceLowest: 'var(--xaihi-md3e-surface-lowest, var(--md3e-surface-lowest, #0a0c0f))',
  surfaceLow: 'var(--xaihi-md3e-surface-low, var(--md3e-surface-low, #181b22))',
  surfaceHigh: 'var(--xaihi-md3e-surface-high, var(--md3e-surface-high, #222630))',
  primary: 'var(--xaihi-md3e-primary, var(--md3e-primary, #b4f461))',
  onPrimary: 'var(--xaihi-md3e-on-primary, var(--md3e-on-primary, #0a0c08))',
  primaryContainer: 'var(--xaihi-md3e-primary-container, var(--md3e-primary-container, color-mix(in srgb, #b4f461 24%, #181b22)))',
  onPrimaryContainer: 'var(--xaihi-md3e-on-primary-container, var(--md3e-on-primary-container, #d5ff88))',
  secondaryContainer: 'var(--xaihi-md3e-secondary-container, var(--md3e-secondary-container, rgba(255, 255, 255, 0.08)))',
  onSecondaryContainer: 'var(--xaihi-md3e-on-secondary-container, var(--md3e-on-secondary-container, #f2f4f8))',
  tertiaryContainer: 'var(--xaihi-md3e-tertiary-container, var(--md3e-tertiary-container, color-mix(in srgb, #61d5f4 20%, #181b22)))',
  onTertiaryContainer: 'var(--xaihi-md3e-on-tertiary-container, var(--md3e-on-tertiary-container, #b0f0ff))',
  error: 'var(--xaihi-md3e-error, var(--md3e-error, #fb5f76))',
} as const

export type XMd3eTone = 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'error'
export type XMd3eBadgeShape = 'circle' | 'rounded' | 'clover' | 'sunny' | 'gem' | 'arch' | 'pebble'

export const MD3E_CSS = `
.xaihi-md3e-node-frame {
  container: node / size;
  display: flex;
  min-width: 0;
  min-height: 0;
  flex: 1;
  width: 100%;
  height: 100%;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  padding: 14px;
  box-sizing: border-box;
  color: ${ALIAS.onSurface};
  background: ${MD3E_ALIAS.surfaceLowest};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.xaihi-md3e-node-frame > * {
  min-width: 0;
  flex-shrink: 0;
}

@keyframes xaihi-entry-fade-up {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.995);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.xaihi-md3e-hero {
  display: grid;
  gap: 12px;
  padding: 18px 22px;
  border-radius: 26px 16px 28px 12px;
  background: linear-gradient(114deg, ${MD3E_ALIAS.primaryContainer}, ${MD3E_ALIAS.surfaceHigh} 62%, ${MD3E_ALIAS.tertiaryContainer});
  color: ${MD3E_ALIAS.onPrimaryContainer};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  position: relative;
  box-sizing: border-box;
  animation: xaihi-entry-fade-up 380ms cubic-bezier(.22, 1.4, .36, 1) both;
}

.xaihi-md3e-hero[data-tone="secondary"] {
  background: linear-gradient(114deg, ${MD3E_ALIAS.secondaryContainer}, ${MD3E_ALIAS.surfaceHigh});
  color: ${MD3E_ALIAS.onSecondaryContainer};
}

.xaihi-md3e-hero-title {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.2px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.xaihi-md3e-hero-description {
  max-width: 72ch;
  font-size: 13px;
  line-height: 1.5;
  opacity: 0.88;
}

.xaihi-md3e-hero-meta {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 650;
}

.xaihi-md3e-badge {
  display: inline-grid;
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  place-items: center;
  background: ${MD3E_ALIAS.primary};
  color: ${MD3E_ALIAS.onPrimary};
  transition: transform 220ms cubic-bezier(.22, 1.4, .36, 1);
  font-weight: 800;
  font-size: 16px;
  user-select: none;
}
.xaihi-md3e-badge[data-size="sm"] { width: 30px; height: 30px; font-size: 13px; }
.xaihi-md3e-badge[data-size="lg"] { width: 50px; height: 50px; font-size: 20px; }
.xaihi-md3e-badge[data-shape="circle"] { border-radius: 50%; }
.xaihi-md3e-badge[data-shape="rounded"] { border-radius: 14px 8px 12px 6px; }
.xaihi-md3e-badge[data-shape="clover"] { clip-path: polygon(50% 5%, 62% 18%, 78% 8%, 82% 26%, 98% 30%, 84% 50%, 98% 70%, 82% 74%, 78% 92%, 62% 82%, 50% 95%, 38% 82%, 22% 92%, 18% 74%, 2% 70%, 16% 50%, 2% 30%, 18% 26%, 22% 8%, 38% 18%); }
.xaihi-md3e-badge[data-shape="sunny"] { clip-path: polygon(50% 0%, 58% 15%, 70% 4%, 72% 22%, 90% 14%, 84% 32%, 100% 38%, 82% 50%, 100% 62%, 84% 68%, 90% 86%, 72% 78%, 70% 96%, 58% 85%, 50% 100%, 42% 85%, 30% 96%, 28% 78%, 10% 86%, 16% 68%, 0% 62%, 18% 50%, 0% 38%, 16% 32%, 10% 14%, 28% 22%, 30% 4%, 42% 15%); }
.xaihi-md3e-badge[data-shape="gem"] { clip-path: polygon(22% 4%, 78% 4%, 98% 50%, 50% 98%, 2% 50%); }
.xaihi-md3e-badge[data-shape="pebble"] { border-radius: 58% 42% 56% 44% / 42% 54% 46% 58%; }
.xaihi-md3e-badge[data-active="true"] { transform: rotate(-5deg) scale(1.08); }

.xaihi-md3e-action-group {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.xaihi-md3e-section {
  display: grid;
  gap: 12px;
  min-width: 0;
  box-sizing: border-box;
  padding: 16px;
  border-radius: 24px;
  background: ${MD3E_ALIAS.surfaceLow};
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
}

.xaihi-md3e-section-header {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.xaihi-md3e-section-title {
  font-size: 14.5px;
  font-weight: 800;
  color: ${ALIAS.onSurface};
  display: flex;
  align-items: center;
  gap: 6px;
}

.xaihi-md3e-section-description {
  color: ${ALIAS.onSurfaceVariant};
  font-size: 13px;
  line-height: 1.5;
  margin-top: 3px;
}

.xaihi-md3e-stat {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 12px 14px;
  border-radius: 20px 12px 18px 10px;
  background: ${MD3E_ALIAS.surfaceHigh};
  transition: transform 200ms cubic-bezier(.22, 1.4, .36, 1);
}
.xaihi-md3e-stat:hover { transform: translateY(-2px); }
.xaihi-md3e-stat-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 20px;
  font-weight: 850;
  letter-spacing: -0.3px;
  color: ${MD3E_ALIAS.primary};
}
.xaihi-md3e-stat-label {
  color: ${ALIAS.onSurfaceVariant};
  font-size: 11px;
  font-weight: 700;
}

.xaihi-md3e-segmented {
  display: flex;
  min-width: 0;
  overflow: auto hidden;
  border-radius: 18px;
  background: ${MD3E_ALIAS.surfaceHigh};
  padding: 4px;
  gap: 2px;
}
.xaihi-md3e-segment {
  flex: 1;
  text-align: center;
  min-width: max-content;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: ${ALIAS.onSurfaceVariant};
  padding: 8px 14px;
  font: inherit;
  font-size: 11px;
  font-weight: 750;
  cursor: pointer;
  transition: all 180ms cubic-bezier(.22, 1.4, .36, 1);
}
.xaihi-md3e-segment[data-active="true"] {
  background: ${MD3E_ALIAS.primary};
  color: ${MD3E_ALIAS.onPrimary};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  transform: translateY(-1px);
}

.xaihi-md3e-switch-row {
  display: flex;
  min-width: 0;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 0;
  border-radius: 20px 14px 18px 10px;
  background: ${MD3E_ALIAS.surfaceHigh};
  color: inherit;
  font: inherit;
  cursor: pointer;
  text-align: left;
  transition: background-color 180ms ease, transform 180ms cubic-bezier(.22, 1.4, .36, 1);
}
.xaihi-md3e-switch-row:hover {
  background: ${MD3E_ALIAS.secondaryContainer};
}
.xaihi-md3e-switch-row:active {
  transform: scale(0.99);
}
.xaihi-md3e-switch-copy {
  display: grid;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.xaihi-md3e-switch-label {
  font-size: 12.5px;
  font-weight: 750;
  color: ${ALIAS.onSurface};
}
.xaihi-md3e-switch-description {
  font-size: 11px;
  color: ${ALIAS.onSurfaceVariant};
  line-height: 1.4;
}
.xaihi-md3e-switch-track {
  width: 44px;
  height: 26px;
  border-radius: 999px;
  background: ${MD3E_ALIAS.surfaceLowest};
  position: relative;
  transition: background-color 200ms ease;
  flex: 0 0 44px;
}
.xaihi-md3e-switch-row[data-checked="true"] .xaihi-md3e-switch-track {
  background: ${MD3E_ALIAS.primary};
}
.xaihi-md3e-switch-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
  transition: transform 220ms cubic-bezier(.34, 1.56, .64, 1);
}
.xaihi-md3e-switch-row[data-checked="true"] .xaihi-md3e-switch-thumb {
  transform: translateX(18px);
  background: ${MD3E_ALIAS.onPrimary};
}

.xaihi-md3e-slider-card {
  display: grid;
  gap: 8px;
  min-width: 0;
  padding: 12px 14px;
  border-radius: 20px 14px 18px 10px;
  background: ${MD3E_ALIAS.surfaceHigh};
}
.xaihi-md3e-slider-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 750;
}
.xaihi-md3e-slider-rail {
  position: relative;
  height: 18px;
  display: flex;
  align-items: center;
}
.xaihi-md3e-slider-rail input {
  width: 100%;
  accent-color: ${MD3E_ALIAS.primary};
  cursor: pointer;
}

.xaihi-md3e-fact {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  color: ${ALIAS.onSurfaceVariant};
  font-size: 11.5px;
}
.xaihi-md3e-fact + .xaihi-md3e-fact {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.xaihi-md3e-fact-value {
  color: ${ALIAS.onSurface};
  font-weight: 750;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

button {
  font-family: inherit;
  font-size: inherit;
  color: inherit;
}

.xaihi-btn,
.shiin-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-sizing: border-box;
  padding: 8px 16px;
  border: 0;
  border-radius: 999px;
  font: inherit;
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;
  transition: transform 180ms cubic-bezier(.22, 1.4, .36, 1), background-color 160ms ease;
  user-select: none;
}
.xaihi-btn:hover,
.shiin-btn:hover { transform: translateY(-1px); }
.xaihi-btn:active,
.shiin-btn:active { transform: scale(0.97); }
.xaihi-btn[data-variant="filled"],
.shiin-btn[data-variant="filled"] {
  background: ${MD3E_ALIAS.primary};
  color: ${MD3E_ALIAS.onPrimary};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}
.xaihi-btn[data-variant="tonal"],
.shiin-btn[data-variant="tonal"] {
  background: ${MD3E_ALIAS.surfaceHigh};
  color: ${ALIAS.onSurface};
}
.xaihi-btn[data-variant="ghost"],
.shiin-btn[data-variant="ghost"] {
  background: transparent;
  color: ${ALIAS.onSurfaceVariant};
}
.xaihi-btn[data-variant="danger"],
.shiin-btn[data-variant="danger"] {
  background: color-mix(in srgb, ${MD3E_ALIAS.error} 18%, transparent);
  color: ${MD3E_ALIAS.error};
}
.xaihi-btn[disabled],
.shiin-btn[disabled] {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
}

.xaihi-md3e-main-grid {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(360px, 1.25fr);
  gap: 12px;
  align-items: start;
}
.xaihi-md3e-main-grid[data-single-column="true"] {
  grid-template-columns: 1fr;
}
.xaihi-md3e-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}
@container (max-width: 720px) {
  .xaihi-md3e-main-grid {
    grid-template-columns: 1fr !important;
  }
}
@container (max-width: 580px) {
  .xaihi-md3e-stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}
@container (max-width: 340px) {
  .xaihi-md3e-stats-grid {
    grid-template-columns: 1fr !important;
  }
  .xaihi-md3e-hero {
    padding: 12px 14px;
    border-radius: 18px 12px 20px 8px;
  }
  .xaihi-md3e-hero-title {
    font-size: 15px;
  }
}

/* 宽屏侧栏与窄屏底部 Dock 响应式架构 */
.xaihi-md3e-app-layout {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.xaihi-md3e-sidebar {
  display: flex;
  flex-direction: column;
  width: 220px;
  flex-shrink: 0;
  gap: 8px;
  padding: 14px 10px;
  background: ${MD3E_ALIAS.surfaceLow};
  box-sizing: border-box;
  box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.04);
  animation: xaihi-entry-fade-up 320ms cubic-bezier(.22, 1.4, .36, 1) both;
  overflow-y: auto;
  overflow-x: hidden;
}

.xaihi-md3e-sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 4px;
}

.xaihi-md3e-sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 38px;
  padding: 0 14px;
  box-sizing: border-box;
  border: 0;
  border-radius: 14px 8px 12px 6px;
  background: transparent;
  color: ${ALIAS.onSurfaceVariant};
  font: inherit;
  font-size: 12.5px;
  font-weight: 750;
  cursor: pointer;
  text-align: left;
  flex-shrink: 0;
  transition: all 180ms cubic-bezier(.34, 1.56, .64, 1);
  user-select: none;
}
.xaihi-md3e-sidebar-item:hover {
  background: ${MD3E_ALIAS.secondaryContainer};
  color: ${ALIAS.onSurface};
  border-radius: 18px 10px 16px 8px;
}
.xaihi-md3e-sidebar-item[data-active="true"] {
  background: ${MD3E_ALIAS.primaryContainer};
  color: ${MD3E_ALIAS.onPrimaryContainer};
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, ${MD3E_ALIAS.primary} 32%, transparent), 0 2px 8px rgba(0, 0, 0, 0.2);
}
.xaihi-md3e-sidebar-item-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.xaihi-md3e-sidebar-item-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.xaihi-md3e-sidebar-item-badge {
  padding: 1px 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 10px;
  font-weight: 800;
  font-family: ui-monospace, monospace;
}
.xaihi-md3e-sidebar-item[data-active="true"] .xaihi-md3e-sidebar-item-badge {
  background: rgba(0, 0, 0, 0.25);
  color: ${MD3E_ALIAS.onPrimary};
}

.xaihi-md3e-sidebar-footer {
  margin-top: auto;
  display: grid;
  gap: 6px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.xaihi-md3e-dock-wrapper {
  display: none;
  position: fixed;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  pointer-events: auto;
  animation: xaihi-dock-slide-up 320ms cubic-bezier(.34, 1.56, .64, 1) both;
}

@keyframes xaihi-dock-slide-up {
  0% {
    opacity: 0;
    transform: translate(-50%, 18px) scale(0.96);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
}

.xaihi-md3e-navigation-dock {
  display: flex;
  align-items: center;
  gap: 4px;
  box-sizing: border-box;
  padding: 5px 8px;
  border-radius: 999px;
  background: color-mix(in srgb, ${MD3E_ALIAS.surfaceHigh} 85%, transparent);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  color: ${ALIAS.onSurface};
}

.xaihi-md3e-navigation-item {
  display: inline-flex;
  min-width: 54px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 4px 6px;
  border: 0;
  background: transparent;
  color: ${ALIAS.onSurfaceVariant};
  font: inherit;
  font-size: 10.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 180ms cubic-bezier(.34, 1.56, .64, 1);
  user-select: none;
}
.xaihi-md3e-nav-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 26px;
  border-radius: 999px;
  transition: all 200ms cubic-bezier(.34, 1.56, .64, 1);
}
.xaihi-md3e-navigation-item:hover .xaihi-md3e-nav-indicator {
  background: ${MD3E_ALIAS.secondaryContainer};
  color: ${ALIAS.onSurface};
}
.xaihi-md3e-navigation-item[data-active="true"] .xaihi-md3e-nav-indicator {
  background: ${MD3E_ALIAS.primaryContainer};
  color: ${MD3E_ALIAS.onPrimaryContainer};
  box-shadow: inset 0 0 0 1px color-mix(in srgb, ${MD3E_ALIAS.primary} 32%, transparent);
}
.xaihi-md3e-navigation-item[data-active="true"] {
  color: ${ALIAS.onSurface};
  font-weight: 800;
}

@media (max-width: 860px) {
  .xaihi-md3e-sidebar {
    display: none !important;
  }
  .xaihi-md3e-dock-wrapper {
    display: block !important;
  }
  .xaihi-md3e-node-frame {
    padding-bottom: 84px !important;
  }
}

@media (min-width: 861px) {
  .xaihi-md3e-sidebar {
    display: flex !important;
  }
  .xaihi-md3e-dock-wrapper {
    display: none !important;
  }
}
`

export function registerKitStyles(): () => void {
  if (typeof document === 'undefined') return () => {}
  const id = 'xaihi-shiin-md3e-kit'
  if (document.getElementById(id)) return () => {}
  const style = document.createElement('style')
  style.id = id
  style.textContent = MD3E_CSS
  document.head.append(style)
  return () => style.remove()
}

export function XMd3eNodeFrame({
  className = '',
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <div className={`xaihi-md3e-node-frame ${className}`.trim()} {...rest}>
      {children}
    </div>
  )
}

export function XMd3eHeroBanner({
  title,
  description,
  meta,
  badge,
  tone = 'primary',
  children,
  className = '',
  ...rest
}: {
  title: React.ReactNode
  description?: React.ReactNode
  meta?: React.ReactNode
  badge?: React.ReactNode
  tone?: XMd3eTone
  children?: React.ReactNode
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>): React.ReactElement {
  return (
    <div className={`xaihi-md3e-hero ${className}`.trim()} data-tone={tone} {...rest}>
      <div style={{ display: 'flex', minWidth: 0, alignItems: 'start', gap: 12 }}>
        {badge}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="xaihi-md3e-hero-title">{title}</div>
          {description !== undefined && <div className="xaihi-md3e-hero-description">{description}</div>}
        </div>
      </div>
      {meta !== undefined && <div className="xaihi-md3e-hero-meta">{meta}</div>}
      {children}
    </div>
  )
}

export function XMd3eShapeBadge({
  shape = 'rounded',
  size = 'md',
  active = false,
  children,
  className = '',
  ...rest
}: {
  shape?: XMd3eBadgeShape
  size?: 'sm' | 'md' | 'lg'
  active?: boolean
  children?: React.ReactNode
} & React.HTMLAttributes<HTMLSpanElement>): React.ReactElement {
  return (
    <span
      className={`xaihi-md3e-badge ${className}`.trim()}
      data-shape={shape}
      data-size={size}
      data-active={active ? 'true' : 'false'}
      {...rest}
    >
      {children}
    </span>
  )
}

export function XMd3eActionGroup({
  children,
  className = '',
  ...rest
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <div className={`xaihi-md3e-action-group ${className}`.trim()} {...rest}>
      {children}
    </div>
  )
}

export function XMd3eSection({
  title,
  description,
  actions,
  children,
  className = '',
  ...rest
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  children?: React.ReactNode
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>): React.ReactElement {
  return (
    <section className={`xaihi-md3e-section ${className}`.trim()} {...rest}>
      {(title !== undefined || description !== undefined || actions !== undefined) && (
        <div className="xaihi-md3e-section-header">
          <div style={{ minWidth: 0, flex: 1 }}>
            {title !== undefined && <div className="xaihi-md3e-section-title">{title}</div>}
            {description !== undefined && <div className="xaihi-md3e-section-description">{description}</div>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}

export function XMd3eStatTile({
  value,
  label,
  className = '',
  ...rest
}: {
  value: React.ReactNode
  label: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <div className={`xaihi-md3e-stat ${className}`.trim()} {...rest}>
      <span className="xaihi-md3e-stat-value">{value}</span>
      <span className="xaihi-md3e-stat-label">{label}</span>
    </div>
  )
}

export function XMd3eSegmentedTrack({
  options,
  value,
  onChange,
  className = '',
  ...rest
}: {
  options: readonly { value: string; label: React.ReactNode; disabled?: boolean }[]
  value: string
  onChange: (value: string) => void
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>): React.ReactElement {
  return (
    <div role="radiogroup" className={`xaihi-md3e-segmented ${className}`.trim()} {...rest}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          className="xaihi-md3e-segment"
          data-active={opt.value === value ? 'true' : 'false'}
          aria-checked={opt.value === value}
          disabled={opt.disabled}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function XMd3eSwitch({
  checked,
  onCheckedChange,
  label,
  description,
  value,
  leading,
  className = '',
  onClick,
  ...rest
}: {
  checked: boolean
  onCheckedChange?: (checked: boolean) => void
  label: React.ReactNode
  description?: React.ReactNode
  value?: React.ReactNode
  leading?: React.ReactNode
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value'>): React.ReactElement {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-checked={checked ? 'true' : 'false'}
      className={`xaihi-md3e-switch-row ${className}`.trim()}
      onClick={(e) => {
        onCheckedChange?.(!checked)
        onClick?.(e)
      }}
      {...rest}
    >
      {leading}
      <span className="xaihi-md3e-switch-copy">
        <span className="xaihi-md3e-switch-label">{label}</span>
        {description !== undefined && <span className="xaihi-md3e-switch-description">{description}</span>}
      </span>
      {value !== undefined && <span className="xaihi-md3e-value-chip">{value}</span>}
      <span aria-hidden="true" className="xaihi-md3e-switch-track">
        <span className="xaihi-md3e-switch-thumb" />
      </span>
    </button>
  )
}

export function XMd3eSliderCard({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  className = '',
  ...rest
}: {
  label: React.ReactNode
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (val: number) => void
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>): React.ReactElement {
  return (
    <div className={`xaihi-md3e-slider-card ${className}`.trim()} {...rest}>
      <div className="xaihi-md3e-slider-header">
        <span>{label}</span>
        <span className="xaihi-md3e-value-chip">{value}%</span>
      </div>
      <div className="xaihi-md3e-slider-rail">
        <input
          type="range"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.currentTarget.value))}
        />
      </div>
    </div>
  )
}

export function XMd3eFactRow({
  label,
  value,
  className = '',
  ...rest
}: {
  label: React.ReactNode
  value: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <div className={`xaihi-md3e-fact ${className}`.trim()} {...rest}>
      <span>{label}</span>
      <span className="xaihi-md3e-fact-value">{value}</span>
    </div>
  )
}

export function XButton({
  variant = 'filled',
  shape = 'pill',
  size = 'md',
  children,
  className = '',
  ...rest
}: {
  variant?: 'filled' | 'tonal' | 'ghost' | 'danger'
  shape?: 'pill' | 'expressive'
  size?: 'sm' | 'md' | 'lg'
} & React.ButtonHTMLAttributes<HTMLButtonElement>): React.ReactElement {
  return (
    <button
      type="button"
      className={`xaihi-btn ${className}`.trim()}
      data-variant={variant}
      data-shape={shape}
      data-size={size}
      {...rest}
    >
      {children}
    </button>
  )
}

export interface XMd3eDockItem {
  id: string
  label: React.ReactNode
  icon?: React.ReactNode
  badge?: React.ReactNode
}

export function XMd3eNavigationDock({
  items,
  value,
  onValueChange,
  className = '',
  ...rest
}: {
  items: readonly XMd3eDockItem[]
  value?: string
  onValueChange?: (val: string) => void
} & React.HTMLAttributes<HTMLElement>): React.ReactElement {
  return (
    <nav className={`xaihi-md3e-navigation-dock ${className}`.trim()} role="tablist" {...rest}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={item.id === value}
          className="xaihi-md3e-navigation-item"
          data-active={item.id === value ? 'true' : 'false'}
          onClick={() => onValueChange?.(item.id)}
        >
          <span className="xaihi-md3e-nav-indicator" style={{ position: 'relative' }}>
            {item.icon}
            {item.badge}
          </span>
          <span style={{ fontSize: 10.5, lineHeight: 1.2 }}>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

export function XMd3eSidebar({
  children,
  className = '',
  ...rest
}: React.HTMLAttributes<HTMLElement>): React.ReactElement {
  return (
    <aside className={`xaihi-md3e-sidebar ${className}`.trim()} {...rest}>
      {children}
    </aside>
  )
}

export function XMd3eSidebarItem({
  active = false,
  icon,
  label,
  badge,
  onClick,
  className = '',
  ...rest
}: {
  active?: boolean
  icon?: React.ReactNode
  label: React.ReactNode
  badge?: React.ReactNode
  onClick?: () => void
} & React.ButtonHTMLAttributes<HTMLButtonElement>): React.ReactElement {
  return (
    <button
      type="button"
      className={`xaihi-md3e-sidebar-item ${className}`.trim()}
      data-active={active ? 'true' : 'false'}
      onClick={onClick}
      {...rest}
    >
      {icon && <span className="xaihi-md3e-sidebar-item-icon">{icon}</span>}
      <span className="xaihi-md3e-sidebar-item-label">{label}</span>
      {badge && <span className="xaihi-md3e-sidebar-item-badge">{badge}</span>}
    </button>
  )
}

