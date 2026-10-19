/**
 * Material 3 Expressive 规范设计令牌 (Design Tokens)
 * 严格支持 Xaihi 宿主槽位 --xaihi-* 与 --dsw-alias-*
 */

export const ALIAS = {
  surface: 'var(--xaihi-surface, var(--dsw-alias-bg-layer-1, var(--surface, #12141a)))',
  onSurface: 'var(--xaihi-on-surface, var(--dsw-alias-label-primary, var(--ink, #f2f4f8)))',
  onSurfaceVariant: 'var(--xaihi-on-surface-variant, var(--dsw-alias-label-secondary, var(--ink-2, #98a1b0)))',
  outline: 'var(--xaihi-outline, var(--dsw-alias-border-l2, var(--line, rgba(255, 255, 255, 0.1))))',
  primary: 'var(--xaihi-primary, var(--accent, #b4f461))',
  onPrimary: 'var(--xaihi-on-primary, var(--accent-ink, #0a0c08))',
  secondaryContainer: 'var(--xaihi-secondary-container, var(--surface-2, rgba(255, 255, 255, 0.06)))',
  onSecondaryContainer: 'var(--xaihi-on-secondary-container, var(--ink, inherit))',
  error: 'var(--xaihi-error, var(--danger, #fb5f76))',
} as const

export const SHAPE = {
  cornerXS: 6,
  cornerS: 8,
  cornerM: 14,
  cornerL: 18,
  full: 9999,
} as const

export const SPACE = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
} as const

export const STYLE_TAG_ID = 'shiin-ui-kit'

export const KIT_CSS = `
:root {
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: "Cascadia Mono", Consolas, Menlo, Monaco, monospace;
}

.shiin-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: ${SHAPE.cornerS}px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 550;
  cursor: pointer;
  user-select: none;
  transition: all 0.16s ease;
  white-space: nowrap;
}

.shiin-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: currentColor;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.16s ease;
}

.shiin-btn:hover::after { opacity: 0.08; }
.shiin-btn:active::after { opacity: 0.14; }
.shiin-btn:focus-visible { outline: 2px solid ${ALIAS.primary}; outline-offset: 2px; }

.shiin-btn[data-variant="filled"] {
  background: ${ALIAS.primary};
  color: ${ALIAS.onPrimary};
}
.shiin-btn[data-variant="tonal"] {
  background: ${ALIAS.secondaryContainer};
  color: ${ALIAS.onSecondaryContainer};
  border-color: ${ALIAS.outline};
}
.shiin-btn[data-variant="ghost"] {
  background: transparent;
  color: ${ALIAS.onSurface};
  border-color: ${ALIAS.outline};
}
.shiin-btn[data-variant="danger"] {
  background: rgba(251, 95, 118, 0.12);
  color: ${ALIAS.error};
  border-color: rgba(251, 95, 118, 0.3);
}

.shiin-btn[disabled] {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}

.shiin-card {
  display: flex;
  flex-direction: column;
  background: ${ALIAS.surface};
  border: 1px solid ${ALIAS.outline};
  border-radius: ${SHAPE.cornerM}px;
  padding: 14px 16px;
  color: ${ALIAS.onSurface};
}

.shiin-input, .shiin-select {
  height: 30px;
  padding: 0 10px;
  background: ${ALIAS.secondaryContainer};
  border: 1px solid ${ALIAS.outline};
  border-radius: ${SHAPE.cornerXS}px;
  color: inherit;
  font-family: inherit;
  font-size: 12px;
  outline: none;
  transition: border-color 0.15s ease;
}
.shiin-input:focus, .shiin-select:focus {
  border-color: ${ALIAS.primary};
}
`

export function registerKitStyles(): () => void {
  if (typeof document === 'undefined') return () => {}
  if (document.getElementById(STYLE_TAG_ID)) return () => {}
  const tag = document.createElement('style')
  tag.id = STYLE_TAG_ID
  tag.textContent = KIT_CSS
  document.head.append(tag)
  return () => tag.remove()
}
