/** Shiin semantic theme and adaptive Expressive web components. */
export const EXPRESSIVE_CSS = String.raw`
.shiin-shell, .shiin-panel {
  --md-sys-color-primary: #c8f000;
  --md-sys-color-on-primary: #273000;
  --md-sys-color-primary-container: #e7f6a8;
  --md-sys-color-on-primary-container: #262b1c;
  --md-sys-color-secondary: #62652f;
  --md-sys-color-on-secondary: #fff9e6;
  --md-sys-color-secondary-container: #e6e3cd;
  --md-sys-color-on-secondary-container: #343831;
  --md-sys-color-tertiary: #536644;
  --md-sys-color-on-tertiary: #ffffff;
  --md-sys-color-tertiary-container: #dcebcf;
  --md-sys-color-on-tertiary-container: #2b3b23;
  --md-sys-color-error: #a72d3b;
  --md-sys-color-on-error: #fff5f2;
  --md-sys-color-error-container: #ffdad9;
  --md-sys-color-on-error-container: #721e2b;
  --md-sys-color-surface: #f2f0e8;
  --md-sys-color-surface-container-lowest: #fbfaf4;
  --md-sys-color-surface-container-low: #eae8de;
  --md-sys-color-surface-container: #e4e2d6;
  --md-sys-color-surface-container-high: #dedccf;
  --md-sys-color-surface-container-highest: #d4d3c5;
  --md-sys-color-on-surface: #343831;
  --md-sys-color-on-surface-variant: #5c6054;
  --md-sys-color-outline: #777c6d;
  --md-sys-color-outline-variant: #c5c8b9;
  --md-sys-shape-corner-extra-small: 4px;
  --md-sys-shape-corner-small: 8px;
  --md-sys-shape-corner-medium: 14px;
  --md-sys-shape-corner-large: 20px;
  --md-sys-shape-corner-extra-large: 28px;
  --md-sys-shape-corner-extra-large-increased: 36px;
  --md-sys-shape-corner-full: 999px;
  --shiin-space-1: 8px;
  --shiin-space-2: 16px;
  --shiin-space-3: 24px;
  --shiin-space-4: 32px;
  --shiin-space-6: 48px;
  --shiin-ground: var(--md-sys-color-surface);
  --shiin-surface: var(--md-sys-color-surface-container-lowest);
  --shiin-surface-low: var(--md-sys-color-surface-container-low);
  --shiin-surface-container: var(--md-sys-color-surface-container);
  --shiin-surface-high: var(--md-sys-color-surface-container-high);
  --shiin-ink: var(--md-sys-color-on-surface);
  --shiin-muted: var(--md-sys-color-on-surface-variant);
  --shiin-muted-strong: #464a41;
  --shiin-accent: var(--md-sys-color-primary);
  --shiin-on-accent: var(--md-sys-color-on-primary);
  --shiin-accent-soft: var(--md-sys-color-primary-container);
  --shiin-olive: var(--md-sys-color-secondary);
  --shiin-on-olive: var(--md-sys-color-on-secondary);
  --shiin-sand: var(--md-sys-color-secondary-container);
  --shiin-red: var(--md-sys-color-error);
  --shiin-on-red: var(--md-sys-color-on-error);
  --shiin-line: var(--md-sys-color-outline-variant);
  --shiin-line-soft: #d5d7c8;
  --shiin-shadow-1: 0 2px 8px rgba(52, 56, 49, 0.06);
  --shiin-shadow-2: 0 12px 32px -8px rgba(52, 56, 49, 0.16);
  --shiin-spatial: 380ms linear(0, 0.22 8%, 0.76 23%, 1.08 42%, 1.02 65%, 1);
  --shiin-effects: 180ms cubic-bezier(0.2, 0, 0, 1);
  --shiin-font: "Roboto Flex", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif;
  --shiin-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  --surface-overlay: var(--shiin-surface);
  --surface-2: var(--shiin-surface-low);
  --ink-1: var(--shiin-ink);
  --ink-2: var(--shiin-muted);
  --ink-3: var(--shiin-muted);
  --accent: var(--shiin-accent);
  --accent-soft: var(--shiin-accent-soft);
  --line: var(--shiin-line-soft);
  --line-strong: var(--shiin-line);
  --font-mono: var(--shiin-mono);

  /* === Shiin MD3 Expressive Feedback & Toast Tokens (Light Bento Default) === */
  --shiin-toast-bg: rgba(255, 255, 255, 0.92);
  --shiin-toast-border: var(--shiin-line-soft);
  --shiin-toast-shadow: 0 12px 32px -4px rgba(52, 56, 49, 0.12), 0 3px 10px rgba(52, 56, 49, 0.05);
  --shiin-toast-ink: var(--shiin-ink);
  --shiin-toast-title: #20241d;
  --shiin-toast-muted: var(--shiin-muted);
  --shiin-toast-close-hover: rgba(52, 56, 49, 0.08);

  --shiin-toast-chip-bg: rgba(83, 102, 68, 0.08);
  --shiin-toast-chip-color: #37530c;
  --shiin-toast-chip-border: rgba(83, 102, 68, 0.18);

  --shiin-toast-success-chip-bg: rgba(158, 200, 0, 0.22);
  --shiin-toast-success-icon: #38550c;
  --shiin-toast-success-border: rgba(158, 200, 0, 0.35);

  --shiin-toast-warning-chip-bg: rgba(230, 145, 0, 0.18);
  --shiin-toast-warning-icon: #824f00;
  --shiin-toast-warning-border: rgba(230, 145, 0, 0.32);

  --shiin-toast-error-chip-bg: rgba(210, 45, 55, 0.15);
  --shiin-toast-error-icon: #a72d3b;
  --shiin-toast-error-border: rgba(210, 45, 55, 0.28);

  --shiin-toast-action-bg: rgba(83, 102, 68, 0.08);
  --shiin-toast-action-color: #273b12;
  --shiin-toast-action-border: rgba(83, 102, 68, 0.2);

  --shiin-toast-preview-bg: #edece4;
  --shiin-toast-preview-border: var(--shiin-line-soft);

  font: 14px/1.6 var(--shiin-font);
  color: var(--shiin-ink);
  -webkit-font-smoothing: antialiased;
}

/* ============================================================
   Shiin Dark Theme Overrides (data-theme="dark" & system auto)
   ============================================================ */
.shiin-shell[data-theme="dark"],
[data-theme="dark"] .shiin-shell,
.shiin-panel[data-theme="dark"],
.shiin-feedback-host[data-theme="dark"],
.shiin-toast-pill[data-theme="dark"],
.shiin-screenshot-toast[data-theme="dark"],
.shiin-task-banner[data-theme="dark"] {
  --md-sys-color-primary: #c8f000;
  --md-sys-color-on-primary: #273000;
  --md-sys-color-primary-container: #3d4a14;
  --md-sys-color-on-primary-container: #e7f6a8;
  --md-sys-color-secondary: #c2c9af;
  --md-sys-color-on-secondary: #2c3320;
  --md-sys-color-secondary-container: #424935;
  --md-sys-color-on-secondary-container: #dee5cb;
  --md-sys-color-tertiary: #b0cd9b;
  --md-sys-color-on-tertiary: #1c3611;
  --md-sys-color-surface: #141711;
  --md-sys-color-surface-container-lowest: #1c2018;
  --md-sys-color-surface-container-low: #22271d;
  --md-sys-color-surface-container: #282e22;
  --md-sys-color-surface-container-high: #31382a;
  --md-sys-color-surface-container-highest: #3b4334;
  --md-sys-color-on-surface: #f1f4e8;
  --md-sys-color-on-surface-variant: #9ea595;
  --md-sys-color-outline: #8c9384;
  --md-sys-color-outline-variant: #42493b;

  --shiin-ground: #141711;
  --shiin-surface: #1c2018;
  --shiin-surface-low: #22271d;
  --shiin-surface-container: #282e22;
  --shiin-surface-high: #31382a;
  --shiin-ink: #f1f4e8;
  --shiin-muted: #9ea595;
  --shiin-muted-strong: #d2d8c7;
  --shiin-line: #42493b;
  --shiin-line-soft: rgba(255, 255, 255, 0.12);
  --shiin-shadow-1: 0 2px 8px rgba(0, 0, 0, 0.35);
  --shiin-shadow-2: 0 16px 40px rgba(0, 0, 0, 0.6);

  --shiin-toast-bg: rgba(26, 30, 22, 0.94);
  --shiin-toast-border: rgba(255, 255, 255, 0.14);
  --shiin-toast-shadow: 0 16px 40px rgba(0, 0, 0, 0.52), 0 2px 8px rgba(0, 0, 0, 0.25);
  --shiin-toast-ink: #eef1e5;
  --shiin-toast-title: #f5f8ec;
  --shiin-toast-muted: #9ea595;
  --shiin-toast-close-hover: rgba(255, 255, 255, 0.12);

  --shiin-toast-chip-bg: rgba(255, 255, 255, 0.08);
  --shiin-toast-chip-color: #c9f56d;
  --shiin-toast-chip-border: rgba(201, 245, 109, 0.28);

  --shiin-toast-success-chip-bg: rgba(201, 245, 109, 0.2);
  --shiin-toast-success-icon: #c9f56d;
  --shiin-toast-success-border: rgba(201, 245, 109, 0.35);

  --shiin-toast-warning-chip-bg: rgba(255, 186, 40, 0.2);
  --shiin-toast-warning-icon: #ffba28;
  --shiin-toast-warning-border: rgba(255, 186, 40, 0.35);

  --shiin-toast-error-chip-bg: rgba(255, 180, 171, 0.18);
  --shiin-toast-error-icon: #ffb4ab;
  --shiin-toast-error-border: rgba(255, 180, 171, 0.35);

  --shiin-toast-action-bg: rgba(201, 245, 109, 0.18);
  --shiin-toast-action-color: #c9f56d;
  --shiin-toast-action-border: rgba(201, 245, 109, 0.35);

  --shiin-toast-preview-bg: #141710;
  --shiin-toast-preview-border: rgba(255, 255, 255, 0.14);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .shiin-shell,
  :root:not([data-theme="light"]) .shiin-feedback-host,
  :root:not([data-theme="light"]) .shiin-toast-pill,
  :root:not([data-theme="light"]) .shiin-screenshot-toast,
  :root:not([data-theme="light"]) .shiin-task-banner {
    --shiin-ground: #141711;
    --shiin-surface: #1c2018;
    --shiin-surface-low: #22271d;
    --shiin-surface-container: #282e22;
    --shiin-surface-high: #31382a;
    --shiin-ink: #f1f4e8;
    --shiin-muted: #9ea595;
    --shiin-muted-strong: #d2d8c7;
    --shiin-line: #42493b;
    --shiin-line-soft: rgba(255, 255, 255, 0.12);
    --shiin-shadow-1: 0 2px 8px rgba(0, 0, 0, 0.35);
    --shiin-shadow-2: 0 16px 40px rgba(0, 0, 0, 0.6);

    --shiin-toast-bg: rgba(26, 30, 22, 0.94);
    --shiin-toast-border: rgba(255, 255, 255, 0.14);
    --shiin-toast-shadow: 0 16px 40px rgba(0, 0, 0, 0.52), 0 2px 8px rgba(0, 0, 0, 0.25);
    --shiin-toast-ink: #eef1e5;
    --shiin-toast-title: #f5f8ec;
    --shiin-toast-muted: #9ea595;
    --shiin-toast-close-hover: rgba(255, 255, 255, 0.12);

    --shiin-toast-chip-bg: rgba(255, 255, 255, 0.08);
    --shiin-toast-chip-color: #c9f56d;
    --shiin-toast-chip-border: rgba(201, 245, 109, 0.28);

    --shiin-toast-success-chip-bg: rgba(201, 245, 109, 0.2);
    --shiin-toast-success-icon: #c9f56d;
    --shiin-toast-success-border: rgba(201, 245, 109, 0.35);

    --shiin-toast-warning-chip-bg: rgba(255, 186, 40, 0.2);
    --shiin-toast-warning-icon: #ffba28;
    --shiin-toast-warning-border: rgba(255, 186, 40, 0.35);

    --shiin-toast-error-chip-bg: rgba(255, 180, 171, 0.18);
    --shiin-toast-error-icon: #ffb4ab;
    --shiin-toast-error-border: rgba(255, 180, 171, 0.35);

    --shiin-toast-action-bg: rgba(201, 245, 109, 0.18);
    --shiin-toast-action-color: #c9f56d;
    --shiin-toast-action-border: rgba(201, 245, 109, 0.35);

    --shiin-toast-preview-bg: #141710;
    --shiin-toast-preview-border: rgba(255, 255, 255, 0.14);
  }
}

.shiin-shell *, .shiin-panel *, .shiin-shell *::before, .shiin-shell *::after {
  box-sizing: border-box;
}
.shiin-shell button, .shiin-shell input, .shiin-shell select, .shiin-panel button {
  font: inherit;
  color: inherit;
}
.shiin-shell button, .shiin-panel button {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.shiin-shell button:disabled, .shiin-panel button:disabled {
  cursor: default;
  opacity: 0.55;
}
.shiin-shell :focus-visible, .shiin-panel :focus-visible {
  outline: 3px solid var(--shiin-olive);
  outline-offset: 2px;
}

.shiin-shell {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--shiin-ground);
}

.shiin-app-layout {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: row;
}

.shiin-node {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
  container-type: inline-size;
  container-name: node;
  scrollbar-color: var(--shiin-line) transparent;
  scrollbar-width: thin;
}

.shiin-view-transition {
  min-height: 100%;
}

/* ============================================================
   TitleBar & Desktop Segmented Navigation (>=1200px)
   ============================================================ */
.shiin-titlebar {
  height: 54px;
  flex: 0 0 54px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 14px 0 20px;
  border-bottom: 1px solid var(--shiin-line-soft);
  background: color-mix(in srgb, var(--shiin-surface) 92%, transparent);
  backdrop-filter: blur(16px);
  user-select: none;
  -webkit-app-region: drag;
  position: relative;
  z-index: 40;
}
.shiin-titlebar[data-web="true"],
.shiin-titlebar[data-platform="web"],
.shiin-titlebar[data-controls="none"] {
  -webkit-app-region: no-drag;
  padding-left: 20px;
}
.shiin-titlebar[data-controls="left"]:not([data-web="true"]):not([data-custom-controls="true"]),
.shiin-titlebar[data-platform="mac"]:not([data-web="true"]):not([data-custom-controls="true"]) {
  padding-left: 80px;
}
.shiin-titlebar[data-controls="right"],
.shiin-titlebar[data-platform="windows"] {
  padding-left: 20px;
}
.shiin-titlebar[data-mac="false"] {
  padding-left: 20px;
}
.shiin-titlebar__brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}
.shiin-titlebar__mark {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 12px 12px 12px 4px;
  background: var(--shiin-accent);
  color: var(--shiin-on-accent);
  transform: rotate(-6deg);
  box-shadow: var(--shiin-shadow-1);
}
.shiin-titlebar__name {
  font-size: 15px;
  font-weight: 850;
  letter-spacing: -0.04em;
}
.shiin-titlebar__version {
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0 9px;
  border: 0;
  border-radius: 999px;
  background: var(--shiin-surface-low);
  color: var(--shiin-muted);
  font: 700 10.5px/1 var(--shiin-mono);
  -webkit-app-region: no-drag;
  transition: background var(--shiin-effects), border-radius var(--shiin-spatial), color var(--shiin-effects);
}
.shiin-titlebar__version:hover {
  background: var(--shiin-accent-soft);
  color: var(--shiin-ink);
  border-radius: 10px;
}
.shiin-titlebar__update {
  padding: 3px 6px;
  border-radius: 8px;
  background: var(--shiin-red);
  color: var(--shiin-on-red);
  font: 800 9px/1 var(--shiin-font);
}

/* Desktop Integrated Segmented Navigation Pill (Rhythm-inspired Dynamic Pill, visible >=1200px) */
.shiin-desktop-nav {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px;
  margin-left: 10px;
  border-radius: var(--md-sys-shape-corner-full);
  background: color-mix(in srgb, var(--shiin-surface-low) 88%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--shiin-line-soft);
  box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  -webkit-app-region: no-drag;
}
.shiin-desktop-nav > button {
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  min-width: 32px;
  padding: 0 8px;
  border: 0;
  border-radius: var(--md-sys-shape-corner-full);
  background: transparent;
  color: var(--shiin-muted);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  -webkit-app-region: no-drag;
  transition: background-color 0.22s cubic-bezier(0.2, 0, 0, 1),
              color 0.18s cubic-bezier(0.2, 0, 0, 1),
              padding 0.24s cubic-bezier(0.2, 0, 0, 1),
              transform 0.12s cubic-bezier(0.2, 0, 0, 1),
              box-shadow 0.22s cubic-bezier(0.2, 0, 0, 1);
}
.shiin-desktop-nav > button:hover:not([aria-selected="true"]) {
  color: var(--shiin-ink);
  background: color-mix(in srgb, var(--shiin-ink) 8%, transparent);
}
.shiin-desktop-nav > button:active {
  transform: scale(0.92);
}
.shiin-desktop-nav > button[aria-selected="true"] {
  padding: 0 13px 0 9px;
  color: var(--shiin-on-olive);
  background: var(--shiin-olive);
  font-weight: 800;
  box-shadow: 0 2px 10px color-mix(in srgb, var(--shiin-olive) 42%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.35);
}
.shiin-desktop-nav__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  pointer-events: none;
  transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1);
}
.shiin-desktop-nav > button[aria-selected="true"] .shiin-desktop-nav__icon {
  transform: scale(1.06);
}
.shiin-desktop-nav__label {
  display: inline-grid;
  grid-template-columns: 0fr;
  transition: grid-template-columns 0.24s cubic-bezier(0.2, 0, 0, 1),
              opacity 0.18s cubic-bezier(0.2, 0, 0, 1);
  opacity: 0;
  pointer-events: none;
  vertical-align: middle;
}
.shiin-desktop-nav > button[aria-selected="true"] .shiin-desktop-nav__label {
  grid-template-columns: 1fr;
  opacity: 1;
}
.shiin-desktop-nav__label-inner {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  padding-left: 6px;
  padding-right: 2px;
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

@media (prefers-reduced-motion: reduce) {
  .shiin-desktop-nav > button,
  .shiin-desktop-nav__icon,
  .shiin-desktop-nav__label {
    transition: none !important;
  }
}

.shiin-titlebar__center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  -webkit-app-region: no-drag;
}
.shiin-titlebar__status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;
  padding: 0 14px;
  border-radius: 999px;
  background: var(--shiin-surface-low);
  color: var(--shiin-muted);
  font-size: 12px;
  font-weight: 700;
  pointer-events: none;
}
.shiin-titlebar__status[data-listening="true"] {
  background: var(--shiin-sand);
  color: var(--shiin-ink);
}
.shiin-titlebar__status i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--shiin-line);
}
.shiin-titlebar__status[data-listening="true"] i {
  background: var(--shiin-olive);
  box-shadow: 0 0 0 3px rgba(98, 101, 47, 0.22);
}
.shiin-titlebar__capture {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 13px;
  border: 0;
  border-radius: 999px;
  background: var(--shiin-accent);
  color: var(--shiin-on-accent);
  font-size: 12px;
  font-weight: 800;
  transition: border-radius var(--shiin-spatial), transform var(--shiin-effects);
}
.shiin-titlebar__capture:hover {
  border-radius: 10px;
}
.shiin-titlebar__capture:active {
  transform: scale(0.95);
}

.shiin-titlebar__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  -webkit-app-region: no-drag;
}
.shiin-titlebar-button, .shiin-titlebar-menu {
  position: relative;
}
.shiin-titlebar-button {
  min-width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 9px;
  border: 0;
  border-radius: 13px;
  background: transparent;
  color: var(--shiin-muted);
  transition: background var(--shiin-effects), color var(--shiin-effects), border-radius var(--shiin-spatial), transform var(--shiin-effects);
}
.shiin-titlebar-button:hover, .shiin-titlebar-button[data-active="true"] {
  background: var(--shiin-surface-high);
  color: var(--shiin-ink);
  border-radius: 22px;
}
.shiin-titlebar-button:active {
  transform: scale(0.95);
  border-radius: 10px;
}
.shiin-titlebar-button[data-tone="danger"] {
  color: var(--shiin-red);
}
.shiin-titlebar-button[data-tone="accent"] {
  background: var(--shiin-olive);
  color: var(--shiin-on-olive);
  border-radius: 22px;
}
.shiin-titlebar-button[data-tone="accent"]:hover {
  background: color-mix(in srgb, var(--shiin-olive) 88%, var(--shiin-ink));
  color: var(--shiin-on-olive);
}
.shiin-alert-dot {
  position: absolute;
  right: 4px;
  top: 4px;
  width: 5px;
  height: 5px;
  background: var(--shiin-red);
  border-radius: 50%;
}
.shiin-titlebar-popover {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 132px;
  display: grid;
  gap: 3px;
  padding: 6px;
  border: 1px solid var(--shiin-line-soft);
  border-radius: 18px;
  background: var(--shiin-surface);
  box-shadow: var(--shiin-shadow-2);
  z-index: 100;
}
.shiin-titlebar-popover button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 38px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: var(--shiin-muted);
  text-align: left;
  padding: 0 10px;
  font-size: 12px;
}
.shiin-titlebar-popover button:hover,
.shiin-titlebar-popover button[aria-pressed="true"] {
  background: var(--shiin-accent-soft);
  color: var(--shiin-ink);
}
.shiin-window-controls {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: 4px;
  -webkit-app-region: no-drag;
}
.shiin-window-controls--left,
.shiin-window-controls[data-position="left"] {
  margin-left: 0;
  margin-right: 10px;
  gap: 6px;
  -webkit-app-region: no-drag;
}
.shiin-window-controls--left .shiin-window-button {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: var(--shiin-surface-high);
}
.shiin-window-controls--left .shiin-window-button--close:hover {
  background: var(--shiin-red);
  color: var(--shiin-on-red);
}
.shiin-window-controls--left .shiin-window-button--min:hover {
  background: #FFBD2E;
  color: #1a1a1a;
}
.shiin-window-controls--left .shiin-window-button--max:hover {
  background: #27C93F;
  color: #1a1a1a;
}
.shiin-window-button {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--shiin-muted);
  -webkit-app-region: no-drag;
}
.shiin-window-button:hover {
  background: var(--shiin-surface-high);
  border-radius: 18px;
}
.shiin-window-button[data-close="true"]:hover {
  background: var(--shiin-red);
  color: var(--shiin-on-red);
}

/* ============================================================
   Adaptive Navigation Surfaces:
   - Tablet Rail (.shiin-tablet-rail): 600px–1199px ONLY
   - Mobile Two-Zone Dock (.shiin-dual-dock): <600px ONLY
   ============================================================ */
.shiin-tablet-rail {
  display: none;
}

.shiin-dock-base {
  position: fixed;
  z-index: 50;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  pointer-events: none;
}

/* Desktop & Tablet hide the Mobile Two-Zone Dock! */
.shiin-dual-dock {
  display: none;
}

/* ============================================================
   Material 3 Expressive Feedback System:
   - FeedbackHost (.shiin-feedback-host):
     * Desktop: Content Area Bottom-Left (left: 24px, bottom: 24px, max 420px)
     * Tablet: Left Rail offset (left: 112px, bottom: 24px)
     * Mobile: Bottom-Center (bottom: 96px, centered)
   - Operational Toast (.shiin-toast-pill): 4s auto-dismiss pill
   - Screenshot Floating Card (.shiin-screenshot-toast): thumbnail, meta, actions
   - Task Banner (.shiin-task-banner): permission & recovery guidance
   ============================================================ */
.shiin-feedback-host {
  position: fixed;
  z-index: 900;
  bottom: 24px;
  left: 24px;
  max-width: min(420px, calc(100vw - 48px));
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  pointer-events: none;
}

/* 1. 操作反馈: 轻量 MD3 Expressive Snackbar Pill */
.shiin-toast-pill {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: max-content;
  max-width: 100%;
  padding: 8px 12px 8px 14px;
  border-radius: 999px;
  background: var(--shiin-toast-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  color: var(--shiin-toast-ink);
  border: 1px solid var(--shiin-toast-border);
  box-shadow: var(--shiin-toast-shadow);
  font-size: 13.5px;
  user-select: none;
  transition: background-color 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
}
.shiin-toast-pill__icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--shiin-toast-chip-bg);
  color: var(--shiin-toast-chip-color);
  border: 1px solid var(--shiin-toast-chip-border);
}
.shiin-toast-pill[data-severity="success"] .shiin-toast-pill__icon {
  background: var(--shiin-toast-success-chip-bg);
  color: var(--shiin-toast-success-icon);
  border-color: var(--shiin-toast-success-border);
}
.shiin-toast-pill[data-severity="warning"] .shiin-toast-pill__icon {
  background: var(--shiin-toast-warning-chip-bg);
  color: var(--shiin-toast-warning-icon);
  border-color: var(--shiin-toast-warning-border);
}
.shiin-toast-pill[data-severity="error"] .shiin-toast-pill__icon {
  background: var(--shiin-toast-error-chip-bg);
  color: var(--shiin-toast-error-icon);
  border-color: var(--shiin-toast-error-border);
}
.shiin-toast-pill__content {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.shiin-toast-pill__title {
  font-weight: 750;
  color: var(--shiin-toast-title);
}
.shiin-toast-pill__message {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 550;
}
.shiin-toast-pill__action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  border: 1px solid var(--shiin-toast-action-border);
  background: var(--shiin-toast-action-bg);
  color: var(--shiin-toast-action-color);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 150ms ease, transform 120ms ease;
}
.shiin-toast-pill__action:hover {
  background: var(--shiin-accent);
  color: var(--shiin-on-accent);
  transform: translateY(-1px);
}
.shiin-toast-pill__close {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--shiin-toast-muted);
  cursor: pointer;
  transition: opacity 150ms ease, background-color 150ms ease, color 150ms ease;
}
.shiin-toast-pill__close:hover {
  color: var(--shiin-toast-ink);
  background: var(--shiin-toast-close-hover);
}

/* 2. 内容型浮窗: 截图与回放通知浮窗 */
.shiin-screenshot-toast {
  pointer-events: auto;
  display: grid;
  grid-template-columns: 58px 1fr auto;
  gap: 14px;
  align-items: center;
  width: 100%;
  min-width: 320px;
  max-width: 420px;
  padding: 12px 14px;
  border-radius: 22px;
  background: var(--shiin-toast-bg);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border: 1px solid var(--shiin-toast-border);
  box-shadow: var(--shiin-toast-shadow);
  color: var(--shiin-toast-ink);
  user-select: none;
  transition: background-color 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
}
.shiin-screenshot-toast__preview {
  width: 58px;
  height: 58px;
  border-radius: 14px;
  overflow: hidden;
  background: var(--shiin-toast-preview-bg);
  border: 1.5px solid var(--shiin-toast-preview-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: var(--shiin-shadow-1);
}
.shiin-screenshot-toast__thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.shiin-screenshot-toast__fallback-icon {
  color: var(--shiin-toast-success-icon);
}
.shiin-screenshot-toast__video-icon {
  width: 100%;
  height: 100%;
  background: var(--shiin-accent);
  color: var(--shiin-on-accent);
  display: flex;
  align-items: center;
  justify-content: center;
}
.shiin-screenshot-toast__body {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}
.shiin-screenshot-toast__header {
  display: flex;
  align-items: center;
  gap: 6px;
}
.shiin-screenshot-toast__title {
  font-size: 14.5px;
  font-weight: 750;
  color: var(--shiin-toast-title);
  letter-spacing: -0.2px;
}
.shiin-screenshot-toast__count-badge {
  font-size: 10.5px;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: 999px;
  background: var(--shiin-toast-success-chip-bg);
  color: var(--shiin-toast-success-icon);
  border: 1px solid var(--shiin-toast-success-border);
}
.shiin-screenshot-toast__meta {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11.5px;
}
.shiin-toast-chip {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 6px;
  background: var(--shiin-toast-chip-bg);
  color: var(--shiin-toast-chip-color);
  border: 1px solid var(--shiin-toast-chip-border);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.shiin-toast-time {
  color: var(--shiin-toast-muted);
}
.shiin-toast-filename {
  color: var(--shiin-toast-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 140px;
}
.shiin-screenshot-toast__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}
.shiin-toast-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 10px;
  border: 1px solid var(--shiin-toast-border);
  background: var(--shiin-toast-action-bg);
  color: var(--shiin-toast-ink);
  font-size: 11.5px;
  font-weight: 650;
  cursor: pointer;
  transition: all 150ms ease;
}
.shiin-toast-action-btn:hover {
  border-color: var(--shiin-toast-chip-border);
  transform: translateY(-1px);
}
.shiin-toast-action-btn.primary {
  background: var(--shiin-accent);
  border-color: var(--shiin-toast-success-border);
  color: var(--shiin-on-accent);
}
.shiin-screenshot-toast__close {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--shiin-toast-muted);
  cursor: pointer;
  transition: opacity 150ms ease, background-color 150ms ease, color 150ms ease;
}
.shiin-screenshot-toast__close:hover {
  color: var(--shiin-toast-ink);
  background: var(--shiin-toast-close-hover);
}

/* 3. 任务型提示 / 面板 */
.shiin-task-banner {
  pointer-events: auto;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: flex-start;
  width: 100%;
  min-width: 320px;
  max-width: 440px;
  padding: 14px 16px;
  border-radius: 22px;
  background: var(--shiin-toast-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--shiin-toast-warning-border);
  box-shadow: var(--shiin-toast-shadow);
  color: var(--shiin-toast-ink);
  transition: background-color 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
}
.shiin-task-banner__icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--shiin-toast-warning-chip-bg);
  color: var(--shiin-toast-warning-icon);
  border: 1px solid var(--shiin-toast-warning-border);
}
.shiin-task-banner__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.shiin-task-banner__title {
  font-size: 14px;
  font-weight: 750;
  color: var(--shiin-toast-title);
}
.shiin-task-banner__message {
  margin: 0;
  font-size: 12.5px;
  color: var(--shiin-toast-ink);
  line-height: 1.45;
}
.shiin-task-banner__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.shiin-task-banner__primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 12px;
  border: 0;
  background: var(--shiin-toast-warning-icon);
  color: #ffffff;
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;
  transition: transform 120ms ease, opacity 120ms ease;
}
.shiin-task-banner__primary-btn:hover {
  opacity: 0.92;
  transform: scale(1.02);
}
.shiin-task-banner__action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 12px;
  border: 1px solid var(--shiin-toast-border);
  background: var(--shiin-toast-action-bg);
  color: var(--shiin-toast-ink);
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}
.shiin-task-banner__secondary-btn {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 12px;
  border: 0;
  background: transparent;
  color: var(--shiin-toast-muted);
  font-size: 12px;
  cursor: pointer;
}
.shiin-task-banner__secondary-btn:hover {
  color: var(--shiin-toast-ink);
}
.shiin-task-banner__close {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--shiin-toast-muted);
  cursor: pointer;
}
.shiin-task-banner__close:hover {
  color: var(--shiin-toast-ink);
  background: var(--shiin-toast-close-hover);
}

/* 兼容旧式反馈类名 */
.shiin-dock-feedback {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  width: max-content;
  max-width: min(440px, calc(100vw - 32px));
  padding: 8px 8px 8px 16px;
  border-radius: 24px;
  background: var(--shiin-ink);
  color: var(--shiin-ground);
  box-shadow: var(--shiin-shadow-2);
  font-size: 13px;
}
.shiin-dock-feedback > span {
  min-width: 0;
  overflow-wrap: anywhere;
  max-height: 96px;
  overflow-y: auto;
}
.shiin-dock-feedback > button {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex: none;
  padding: 0;
  border: 0;
  border-radius: 18px;
  background: transparent;
  color: inherit;
}
.shiin-dock-feedback > button:hover {
  background: color-mix(in srgb, currentColor 14%, transparent);
}
.shiin-dock-feedback[data-error="true"] {
  background: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
}

/* ============================================================
   Workspace Bento Hero & Expressive Cards (Desktop Baseline >=1200px)
   ============================================================ */
.shiin-node .shiin-bento {
  height: auto;
  overflow: visible;
  min-height: 100%;
  --sb-font: var(--shiin-font);
  --sb-secondary: var(--shiin-olive);
  --sb-on-secondary: var(--shiin-on-olive);
  --sb-tertiary: var(--md-sys-color-tertiary);
  --sb-on-tertiary: var(--md-sys-color-on-tertiary);
  --sb-tertiary-container: var(--md-sys-color-tertiary-container);
  --sb-on-tertiary-container: var(--md-sys-color-on-tertiary-container);
}
.shiin-node .shiin-bento .sb-page {
  max-width: 1320px;
  padding: 28px 32px 56px;
}
.shiin-node .shiin-bento .sb-grid {
  gap: 16px;
}
.shiin-node .shiin-bento .sb-tile {
  border: 1px solid var(--shiin-line-soft);
  box-shadow: var(--shiin-shadow-1);
  padding: 24px 26px;
  border-radius: 32px;
  background: var(--shiin-surface);
}
.shiin-node .shiin-bento .sb-tile-head h3 {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.shiin-node .shiin-bento .sb-tile-head p,
.shiin-node .shiin-bento .sb-note {
  font-size: 13px;
  line-height: 1.6;
}
.shiin-node .shiin-bento .sb-field-label {
  font-size: 12px;
  letter-spacing: 0.02em;
  font-weight: 700;
}

/* Hero Stage (span 8) */
.shiin-node .shiin-bento .sb-capture-hero {
  grid-column: span 8;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 232px;
  gap: 24px;
  align-items: center;
  min-height: 332px;
  padding: 30px 32px;
  border-radius: 36px 36px 36px 12px;
  background:
    radial-gradient(120% 140% at 88% 12%, color-mix(in srgb, var(--shiin-accent-soft) 72%, transparent), transparent 60%),
    linear-gradient(135deg, var(--shiin-surface), var(--shiin-surface-low));
  border: 1px solid var(--shiin-line-soft);
}
.shiin-node .shiin-bento .sb-capture-copy .sb-eyebrow {
  margin: 0 0 8px;
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--shiin-olive);
}
.shiin-node .shiin-bento .sb-capture-copy h2 {
  margin: 0;
  font-size: clamp(38px, 4vw, 56px);
  line-height: 1.04;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: var(--shiin-ink);
}
.shiin-node .shiin-bento .sb-capture-copy .sb-lede {
  max-width: 44ch;
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.65;
  color: var(--shiin-muted);
}
.shiin-node .shiin-bento .sb-capture-status {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 16px 0 20px;
}
.shiin-node .shiin-bento .sb-capture-status .sb-status-chip {
  background: var(--shiin-surface);
  border: 1px solid var(--shiin-line-soft);
  color: var(--shiin-ink);
  font-size: 12px;
  min-height: 30px;
}
.shiin-node .shiin-bento .sb-capture-status .sb-status-chip.on {
  background: var(--shiin-sand);
  border-color: transparent;
}
.shiin-node .shiin-bento .sb-capture-status .sb-status-chip.on i {
  background: var(--shiin-olive);
}
.shiin-node .shiin-bento .sb-capture-status .sb-status-chip.warn {
  background: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
  border-color: transparent;
}
.shiin-chip-btn {
  cursor: pointer;
}

.shiin-node .shiin-bento .sb-capture-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.shiin-node .shiin-bento .sb-capture-primary {
  min-height: 60px;
  padding: 0 26px;
  border-radius: 28px;
  background: var(--shiin-accent);
  color: var(--shiin-on-accent);
  font-size: 16px;
  font-weight: 850;
  box-shadow: 0 10px 24px -10px rgba(52, 56, 49, 0.28);
  transition: border-radius var(--shiin-spatial), transform var(--shiin-spatial), background var(--shiin-effects);
}
.shiin-node .shiin-bento .sb-capture-primary:hover {
  border-radius: 18px;
  transform: translateY(-1px);
}
.shiin-node .shiin-bento .sb-capture-primary:active {
  border-radius: 999px;
  transform: scale(0.96);
}

/* Connected Quick Actions inside Hero */
.shiin-hero-connected {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 4px;
  border-radius: 26px;
  background: var(--shiin-surface-low);
  border: 1px solid var(--shiin-line-soft);
}
.shiin-hero-connected > button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 48px;
  padding: 0 15px;
  border: 0;
  border-radius: 8px;
  background: var(--shiin-surface);
  color: var(--shiin-ink);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  transition: border-radius var(--shiin-spatial), background var(--shiin-effects), color var(--shiin-effects), transform var(--shiin-spatial);
}
.shiin-hero-connected > button:first-child {
  border-radius: 22px 8px 8px 22px;
}
.shiin-hero-connected > button:last-child {
  border-radius: 8px 22px 22px 8px;
}
.shiin-hero-connected > button:hover {
  background: var(--shiin-sand);
  border-radius: 20px;
}
.shiin-hero-connected > button[aria-pressed="true"] {
  background: var(--shiin-olive);
  color: var(--shiin-on-olive);
  border-radius: 22px;
}

.shiin-hero-delivery {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding: 10px 14px;
  border-radius: 18px;
  background: var(--shiin-sand);
  color: var(--shiin-ink);
  font-size: 12.5px;
  overflow: hidden;
}
.shiin-hero-delivery[data-error="true"] {
  background: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
}
.shiin-hero-delivery > strong {
  flex: none;
  font-weight: 800;
}
.shiin-hero-delivery > span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.shiin-hero-delivery > button {
  margin-left: auto;
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 0;
  border-radius: 999px;
  background: var(--shiin-surface);
  font-size: 12px;
  font-weight: 700;
}

/* Right Orb Stage inside Hero */
.shiin-orb-stage {
  position: relative;
  width: 216px;
  height: 216px;
  display: grid;
  place-items: center;
}
.shiin-orb-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  color: var(--shiin-olive);
  opacity: 0.45;
  pointer-events: none;
  animation: shiin-orb-ring-spin 28s linear infinite;
}
@keyframes shiin-orb-ring-spin {
  to { transform: rotate(360deg); }
}
.shiin-node .shiin-bento .sb-capture-orb {
  width: 184px;
  height: 184px;
  color: var(--shiin-on-accent);
  filter: drop-shadow(0 12px 20px rgba(52, 56, 49, 0.18));
}
.shiin-orb-face {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 4px;
}
.shiin-orb-face strong {
  font-size: 15px;
  font-weight: 850;
  letter-spacing: -0.02em;
}

/* Hero Session Card (span 4) */
.shiin-node .shiin-bento .sb-hero-session {
  grid-column: span 4;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
  padding: 26px;
  border-radius: 12px 36px 36px 36px;
  background: var(--shiin-surface-low);
  border: 1px solid var(--shiin-line-soft);
}
.shiin-node .shiin-bento .sb-session-orb.is-connected .sb-mask {
  fill: var(--shiin-accent);
}
.shiin-node .shiin-bento .sb-session-orb.is-connected {
  color: var(--shiin-on-accent);
}
.shiin-node .shiin-bento .sb-session-orb.is-searching {
  width: 64px;
  height: 64px;
  color: var(--shiin-on-olive);
}
.shiin-node .shiin-bento .sb-session-orb.is-searching .sb-mask {
  fill: var(--shiin-olive);
}
.shiin-session-rows {
  display: grid;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 20px;
  background: var(--shiin-surface);
}
.shiin-session-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  font-size: 12.5px;
}
.shiin-session-row + .shiin-session-row {
  padding-top: 8px;
  border-top: 1px dashed var(--shiin-line-soft);
}
.shiin-session-row > span {
  color: var(--shiin-muted);
  flex: none;
}
.shiin-session-row > strong {
  font-weight: 700;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Expressive Metric Strip (span 12) */
.shiin-node .shiin-bento .sb-metric-carousel {
  grid-column: span 12;
  display: flex;
  gap: 12px;
  padding: 2px 0 4px;
}
.shiin-node .shiin-bento .sb-metric {
  min-height: 118px;
  padding: 18px 20px;
  border-radius: 28px;
  background: var(--shiin-surface);
  border: 1px solid var(--shiin-line-soft);
}
.shiin-node .shiin-bento .sb-metric[data-tone="primary"] {
  --metric-color: var(--shiin-olive);
  background: color-mix(in srgb, var(--shiin-accent-soft) 42%, var(--shiin-surface));
}
.shiin-node .shiin-bento .sb-metric[data-tone="secondary"] {
  --metric-color: var(--shiin-olive);
}
.shiin-node .shiin-bento .sb-metric[data-tone="tertiary"] {
  --metric-color: var(--md-sys-color-tertiary);
}
.shiin-node .shiin-bento .sb-metric-value {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--shiin-ink);
}
.shiin-node .shiin-bento .sb-metric-label {
  font-size: 12px;
  color: var(--shiin-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Asymmetric 7:5 Bento Configuration & Inspection Cards */
.shiin-node .shiin-bento .sb-capture-tile {
  grid-column: span 7;
  border-radius: 32px 32px 12px 32px;
}
.shiin-node .shiin-bento .sb-combos-tile {
  grid-column: span 5;
  border-radius: 32px 12px 32px 32px;
  overflow: visible;
}
.shiin-node .shiin-bento .sb-listener-tile {
  grid-column: span 7;
  border-radius: 12px 32px 32px 32px;
  align-self: start;
}
.shiin-node .shiin-bento .sb-tester-tile {
  grid-column: span 5;
  border-radius: 32px 32px 32px 12px;
  align-self: start;
}

/* M3E Connected Target Group with active flex expansion */
.shiin-node .shiin-bento .sb-target-group {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 28px;
  background: var(--shiin-surface-low);
}
.shiin-node .shiin-bento .sb-target-group button {
  flex: 1;
  min-height: 48px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 700;
  background: var(--shiin-surface);
  color: var(--shiin-muted);
  transition: flex-grow var(--shiin-spatial), border-radius var(--shiin-spatial), background var(--shiin-effects), color var(--shiin-effects);
}
.shiin-node .shiin-bento .sb-target-group button:first-child {
  border-radius: 24px 8px 8px 24px;
}
.shiin-node .shiin-bento .sb-target-group button:last-child {
  border-radius: 8px 24px 24px 8px;
}
.shiin-node .shiin-bento .sb-target-group button[aria-pressed="true"] {
  flex: 1.35;
  background: var(--shiin-accent);
  color: var(--shiin-on-accent);
  border-radius: 24px;
}

.shiin-node .shiin-bento .sb-source-row {
  border: 0;
  background: var(--shiin-surface-low);
  margin-top: 14px;
}
.shiin-node .shiin-bento .sb-source-icon {
  position: relative;
  isolation: isolate;
  background: transparent;
  color: var(--shiin-olive);
}
.shiin-node .shiin-bento .sb-source-shape {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  fill: var(--shiin-sand);
  z-index: -1;
}

.shiin-node .shiin-bento .sb-output-row {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.shiin-node .shiin-bento .sb-filename-field {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  margin-top: 14px;
}
.shiin-node .shiin-bento .sb-filename-field input {
  min-width: 0;
  width: 100%;
  height: 42px;
  border-radius: 14px;
  font-size: 13px;
}
.shiin-node .shiin-bento .sb-folder-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}
.shiin-node .shiin-bento .sb-folder-action {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 14px;
  background: var(--shiin-surface-low);
  border: 0;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  transition: background var(--shiin-effects), border-radius var(--shiin-spatial);
}
.shiin-node .shiin-bento .sb-folder-action:hover {
  background: var(--shiin-sand);
  border-radius: 12px;
}

/* Split Button & Presets in Trigger Combos */
.shiin-node .shiin-bento .sb-split-main {
  background: var(--shiin-sand);
  color: var(--shiin-ink);
}
.shiin-node .shiin-bento .sb-split-trail {
  background: var(--shiin-surface-low);
  color: var(--shiin-ink);
}
.shiin-node .shiin-bento .sb-control-seat {
  position: relative;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  isolation: isolate;
}
.shiin-node .shiin-bento .sb-control-seat > svg:first-child {
  position: absolute;
  width: 100%;
  height: 100%;
  fill: var(--shiin-surface);
  z-index: -1;
}

/* 3-Column Expressive Tonal Toggle Cards in Listener Tile */
.shiin-node .shiin-bento .sb-listener-tile .sb-toggle-group {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  padding: 5px;
  margin-top: 14px;
  border-radius: 28px;
  background: var(--shiin-surface-low);
}
.shiin-node .shiin-bento .sb-listener-tile .sb-toggle {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  min-height: 104px;
  padding: 14px;
  border-radius: 12px;
  background: var(--shiin-surface);
  color: var(--shiin-muted);
  transition: border-radius var(--shiin-spatial), background var(--shiin-effects), color var(--shiin-effects), transform var(--shiin-spatial);
}
.shiin-node .shiin-bento .sb-listener-tile .sb-toggle:first-child {
  border-radius: 24px 10px 10px 24px;
}
.shiin-node .shiin-bento .sb-listener-tile .sb-toggle:last-child {
  border-radius: 10px 24px 24px 10px;
}
.shiin-node .shiin-bento .sb-listener-tile .sb-toggle:hover {
  background: var(--shiin-surface-high);
  color: var(--shiin-ink);
}
.shiin-node .shiin-bento .sb-listener-tile .sb-toggle[aria-pressed="true"] {
  background: var(--shiin-sand);
  color: var(--shiin-ink);
  border-radius: 24px;
}
.shiin-node .shiin-bento .sb-toggle-icon,
.shiin-node .shiin-bento .sb-keyboard-row .sb-toggle-icon {
  color: var(--shiin-olive);
  background: var(--shiin-surface-low);
}
.shiin-node .shiin-bento .sb-listener-tile .sb-toggle[aria-pressed="true"] .sb-toggle-icon {
  background: var(--shiin-olive);
  color: var(--shiin-on-olive);
}
.shiin-node .shiin-bento .sb-toggle-copy small,
.shiin-node .shiin-bento .sb-row-copy small {
  color: var(--shiin-muted-strong);
  opacity: 1;
  font-size: 12px;
}

/* Tester & Axis Bars */
.shiin-node .shiin-bento .sb-axis-row {
  grid-template-columns: 48px minmax(0, 1fr) 54px;
  font-size: 12px;
}
.shiin-node .shiin-bento .sb-axis-signal {
  position: relative;
  height: 6px;
  margin: 8px 6px;
  border-radius: 8px;
  background: var(--shiin-surface-high);
}
.shiin-node .shiin-bento .sb-axis-center {
  position: absolute;
  height: 14px;
  width: 1px;
  top: -4px;
  left: 50%;
  background: var(--shiin-line);
}
.shiin-node .shiin-bento .sb-axis-marker {
  position: absolute;
  width: 12px;
  height: 12px;
  top: -3px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: var(--shiin-muted);
}
.shiin-node .shiin-bento .sb-axis-signal-fill {
  position: absolute;
  height: 100%;
  border-radius: inherit;
  background: var(--shiin-line);
}
.shiin-node .shiin-bento .sb-axis-signal[data-active="true"] .sb-axis-signal-fill {
  background: var(--shiin-accent);
}
.shiin-node .shiin-bento .sb-axis-signal[data-active="true"] .sb-axis-marker {
  background: var(--shiin-olive);
}
.shiin-node .shiin-bento .sb-tester-empty {
  padding: 24px 0;
  text-align: center;
}

.shiin-workspace-tile__body {
  min-width: 0;
}
.shiin-tile-disclosure,
.shiin-node .shiin-bento .shiin-tile-summary {
  display: none;
}

/* ============================================================
   Settings & Permission Disclosure Styling
   ============================================================ */
.shiin-node .shiin-bento .sb-masthead h2 {
  font-size: 38px;
  font-weight: 850;
  line-height: 1.15;
  letter-spacing: -0.04em;
}
.shiin-node .shiin-bento .sb-masthead {
  margin-bottom: 24px;
}
.shiin-node .shiin-bento .sb-save-state {
  background: transparent;
  font-size: 13px;
  padding-right: 0;
}
.shiin-node .shiin-bento .sb-save-state i {
  background: var(--shiin-olive);
}
.shiin-node .shiin-bento .sb-save-state[data-state="error"] {
  color: var(--shiin-red);
}
.shiin-node .shiin-bento .sb-save-state[data-state="error"] i {
  background: currentColor;
}
.shiin-node .shiin-bento .sb-save-state > button {
  background: transparent;
  color: var(--shiin-red);
  border: 0;
  min-height: 36px;
  text-decoration: underline;
  font-weight: 700;
}
.shiin-node .shiin-bento .sb-role-row-copy small {
  color: var(--shiin-muted-strong);
  opacity: 1;
}
.shiin-node .shiin-bento .sb-role-row .sb-readout-pill {
  background: var(--shiin-sand);
  color: var(--shiin-ink);
}
.shiin-node .shiin-bento .sb-notify-toggle[aria-pressed="true"] .sb-toggle-copy small {
  color: var(--sb-on-tertiary);
  opacity: 1;
}

.shiin-permission-settings {
  margin-bottom: 20px;
  background: var(--shiin-surface);
  border: 1px solid var(--shiin-line-soft);
  border-radius: 28px;
  scroll-margin-top: 24px;
}
.shiin-permission-settings summary {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  min-height: 76px;
  list-style: none;
  cursor: pointer;
}
.shiin-permission-settings summary::-webkit-details-marker {
  display: none;
}
.shiin-permission-settings summary > .app-icon {
  transition: transform var(--shiin-spatial);
}
.shiin-permission-settings[open] summary > .app-icon {
  transform: rotate(180deg);
}
.shiin-permission-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}
.shiin-permission-heading strong {
  font-size: 19px;
  font-weight: 800;
}
.shiin-permission-summary {
  margin-left: auto;
  color: var(--shiin-muted);
  font-size: 13.5px;
}
.shiin-permission-summary[data-warning="true"] {
  color: var(--shiin-red);
  font-weight: 700;
}
.shiin-permission-content {
  padding: 0 24px 24px;
}
.shiin-permission-intro {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 14px;
}
.shiin-permission-intro p {
  margin: 0;
  color: var(--shiin-muted);
  font-size: 13.5px;
}
.shiin-permission-rows {
  display: grid;
  gap: 4px;
}
.shiin-permission-row {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  background: var(--shiin-surface-low);
  border-radius: 8px;
}
.shiin-permission-row:first-child {
  border-radius: 22px 22px 8px 8px;
}
.shiin-permission-row:last-child {
  border-radius: 8px 8px 22px 22px;
}
.shiin-permission-row__icon {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  background: var(--shiin-surface);
  border-radius: 14px;
  color: var(--shiin-olive);
}
.shiin-permission-row__copy {
  min-width: 0;
  display: grid;
  gap: 2px;
}
.shiin-permission-row__copy strong {
  font-size: 14.5px;
  font-weight: 750;
}
.shiin-permission-row__copy > span {
  font-size: 12.5px;
  color: var(--shiin-muted);
  overflow-wrap: anywhere;
}
.shiin-permission-state {
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 12.5px;
  white-space: nowrap;
  color: var(--shiin-muted);
}
.shiin-permission-state[data-state="ready"] {
  color: var(--shiin-olive);
  font-weight: 700;
}
.shiin-permission-state[data-state="missing"] {
  color: var(--shiin-red);
  font-weight: 700;
}
.shiin-permission-row > button {
  background: var(--shiin-surface);
}
.shiin-permission-footer {
  display: flex;
  gap: 16px;
  align-items: center;
  padding-top: 14px;
}
.shiin-permission-footer > span {
  font-size: 13px;
  color: var(--shiin-muted);
}
.shiin-permission-footer > span[data-error="true"] {
  color: var(--shiin-red);
}
.shiin-permission-preview {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  margin-top: 14px;
}
.shiin-permission-preview img {
  width: 200px;
  max-height: 120px;
  object-fit: contain;
  border-radius: 16px;
}

/* Xaihi Panel & Shared Buttons */
.shiin-action {
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 20px;
  border: 0;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 750;
}
.shiin-action--primary {
  background: var(--shiin-accent);
  color: var(--shiin-on-accent);
}
.shiin-action--olive {
  background: var(--shiin-olive);
  color: var(--shiin-on-olive);
}
.shiin-brand__mark {
  width: 48px;
  height: 48px;
  flex: none;
  display: grid;
  place-items: center;
  background: var(--shiin-accent);
  color: var(--shiin-on-accent);
  border-radius: 24px 24px 8px 24px;
}
.shiin-panel {
  padding: clamp(20px, 4vw, 42px);
  background: var(--shiin-ground);
  container-type: inline-size;
  min-width: 0;
  border-radius: 24px;
}
.shiin-panel__heading {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
}
.shiin-panel__heading .shiin-brand__mark {
  width: 60px;
  height: 60px;
  flex-basis: 60px;
}
.shiin-panel .shiin-kicker {
  font-size: 12px;
  margin: 0;
  color: var(--shiin-muted);
}
.shiin-panel h2 {
  font-size: clamp(25px, 4vw, 42px);
  letter-spacing: -0.04em;
  line-height: 1.2;
  margin: 5px 0;
  font-weight: 800;
}
.shiin-panel__heading p:last-child {
  font-size: 14px;
  color: var(--shiin-muted);
  margin: 8px 0 0;
}
.shiin-panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 24px;
}
.shiin-panel .shiin-action--plain {
  background: var(--shiin-sand);
  color: var(--shiin-ink);
}
.shiin-panel__console {
  background: var(--shiin-ink);
  color: var(--shiin-ground);
  border-radius: 18px 18px 18px 5px;
  overflow: hidden;
}
.shiin-panel__console > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid #565b50;
  padding: 12px 20px;
  color: #d0cbb9;
  font-size: 12px;
}
.shiin-panel__console pre {
  font: 13px/1.7 var(--shiin-mono);
  margin: 0;
  padding: 20px;
  min-height: 115px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.shiin-panel__console[data-error="true"] pre {
  color: #ffb8b4;
}
.shiin-shell .shiin-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 16px;
  border: 0;
  border-radius: 20px;
  background: var(--shiin-sand);
}
.shiin-shell .shiin-btn[data-variant="primary"] {
  background: var(--shiin-accent);
  color: var(--shiin-on-accent);
}
.shiin-shell .shiin-btn[data-variant="ghost"] {
  background: transparent;
}

@keyframes shiin-capture-spin {
  to { transform: rotate(360deg); }
}

/* ============================================================
   TABLET ARCHITECTURE (600px – 1199px):
   - Expressive Left Navigation Rail (.shiin-tablet-rail)
   - No Desktop Header Nav, No Mobile Bottom Dock
   - Split 2-Pane Workbench Layout
   ============================================================ */
@media (min-width: 600px) and (max-width: 1199px) {
  .shiin-desktop-nav,
  .shiin-titlebar__capture,
  .shiin-dual-dock {
    display: none !important;
  }

  .shiin-feedback-host {
    left: 112px;
    bottom: 24px;
    max-width: min(420px, calc(100vw - 136px));
    align-items: flex-start;
  }

  .shiin-tablet-rail {
    display: flex;
    flex: 0 0 88px;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 18px 8px;
    background: var(--shiin-surface-low);
    border-right: 1px solid var(--shiin-line-soft);
    z-index: 30;
  }

  .shiin-tablet-rail__shutter {
    position: relative;
    isolation: isolate;
    width: 64px;
    height: 64px;
    display: grid;
    place-items: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--shiin-on-accent) !important;
    filter: drop-shadow(0 6px 14px rgba(52, 56, 49, 0.18));
  }
  .shiin-tablet-rail__shutter-shape {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    fill: var(--shiin-accent);
    z-index: -1;
  }
  .shiin-tablet-rail__shutter-face {
    display: grid;
    justify-items: center;
    gap: 1px;
  }
  .shiin-tablet-rail__shutter-face strong {
    font-size: 10px;
    font-weight: 850;
    line-height: 1.1;
  }

  .shiin-tablet-rail__nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 100%;
  }
  .shiin-tablet-rail__nav > button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    width: 100%;
    padding: 6px 0;
    border: 0;
    border-radius: 16px;
    background: transparent;
    color: var(--shiin-muted);
    font-size: 11.5px;
    font-weight: 700;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.12s cubic-bezier(0.2, 0, 0, 1), color 0.18s cubic-bezier(0.2, 0, 0, 1);
  }
  .shiin-tablet-rail__nav > button:active {
    transform: scale(0.92);
  }
  .shiin-tablet-rail__nav > button[aria-selected="true"] {
    color: var(--shiin-ink);
    font-weight: 850;
  }
  .shiin-tablet-rail__indicator {
    position: relative;
    isolation: isolate;
    width: 56px;
    height: 32px;
    display: grid;
    place-items: center;
    border-radius: 999px;
    background: transparent;
    color: var(--shiin-muted);
    transition: background-color 0.22s cubic-bezier(0.2, 0, 0, 1),
                color 0.18s cubic-bezier(0.2, 0, 0, 1),
                transform 0.2s cubic-bezier(0.2, 0, 0, 1),
                box-shadow 0.22s cubic-bezier(0.2, 0, 0, 1);
  }
  .shiin-tablet-rail__nav > button:hover:not([aria-selected="true"]) .shiin-tablet-rail__indicator {
    background: color-mix(in srgb, var(--shiin-ink) 8%, transparent);
    color: var(--shiin-ink);
  }
  .shiin-tablet-rail__nav > button[aria-selected="true"] .shiin-tablet-rail__indicator {
    background: var(--shiin-olive);
    color: var(--shiin-on-olive);
    transform: scale(1.04);
    box-shadow: 0 2px 10px color-mix(in srgb, var(--shiin-olive) 42%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.35);
  }
  .shiin-tablet-rail__label {
    letter-spacing: -0.01em;
    line-height: 1.1;
  }

  .shiin-tablet-rail__actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 4px;
    border-radius: 22px;
    background: var(--shiin-surface);
    border: 1px solid var(--shiin-line-soft);
  }
  .shiin-tablet-rail__action {
    width: 42px;
    height: 40px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 8px;
    background: var(--shiin-surface-low);
    color: var(--shiin-muted);
    transition: border-radius var(--shiin-spatial), background var(--shiin-effects), color var(--shiin-effects);
  }
  .shiin-tablet-rail__action:first-child {
    border-radius: 18px 18px 8px 8px;
  }
  .shiin-tablet-rail__action:last-child {
    border-radius: 8px 8px 18px 18px;
  }
  .shiin-tablet-rail__action:hover {
    background: var(--shiin-sand);
    color: var(--shiin-ink);
  }
  .shiin-tablet-rail__action[aria-pressed="true"] {
    background: var(--shiin-olive);
    color: var(--shiin-on-olive);
    border-radius: 18px;
  }

  /* Tablet Content Grid & 2-Pane Split Workbench */
  .shiin-node .shiin-bento .sb-page {
    padding: 24px 24px 48px;
  }
  .shiin-node .shiin-bento .sb-capture-hero {
    grid-column: span 12;
    grid-template-columns: minmax(0, 1fr) 188px;
    min-height: 260px;
    padding: 24px 26px;
  }
  .shiin-orb-stage {
    width: 176px;
    height: 176px;
  }
  .shiin-node .shiin-bento .sb-capture-orb {
    width: 152px;
    height: 152px;
  }
  .shiin-node .shiin-bento .sb-hero-session {
    grid-column: span 12;
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.2fr) auto;
    align-items: center;
    gap: 16px;
    padding: 20px 24px;
    border-radius: 28px;
  }
  .shiin-node .shiin-bento .sb-hero-session .sb-session-actions {
    width: auto;
    flex-direction: column;
  }
  .shiin-node .shiin-bento .sb-metric-carousel {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  /* Tablet 2-Pane Split: Left = Capture & Output, Right = Combos, then Listener + Tester */
  .shiin-node .shiin-bento .sb-capture-tile {
    grid-column: span 7;
  }
  .shiin-node .shiin-bento .sb-combos-tile {
    grid-column: span 5;
  }
  .shiin-node .shiin-bento .sb-listener-tile {
    grid-column: span 7;
  }
  .shiin-node .shiin-bento .sb-tester-tile {
    grid-column: span 5;
  }

  /* Portrait Tablet (600px–899px): balanced 2-column cards */
  @media (max-width: 899px) {
    .shiin-node .shiin-bento .sb-hero-session {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }
    .shiin-node .shiin-bento .sb-hero-session .sb-session-actions {
      grid-column: 1 / -1;
      flex-direction: row;
    }
    .shiin-node .shiin-bento .sb-capture-tile,
    .shiin-node .shiin-bento .sb-combos-tile,
    .shiin-node .shiin-bento .sb-listener-tile,
    .shiin-node .shiin-bento .sb-tester-tile {
      grid-column: span 6;
    }
    .shiin-node .shiin-bento .sb-listener-tile .sb-toggle-group {
      grid-template-columns: 1fr;
    }
    .shiin-node .shiin-bento .sb-listener-tile .sb-toggle {
      min-height: 68px;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
    }
    .shiin-permission-row {
      grid-template-columns: 40px minmax(0, 1fr) auto;
      gap: 8px 16px;
    }
    .shiin-permission-row > button {
      grid-column: 2;
      justify-self: start;
    }
    .shiin-permission-state {
      grid-column: 3;
      grid-row: 1;
    }
  }
}

/* ============================================================
   MOBILE ARCHITECTURE (<600px):
   - Floating Two-Zone Bottom Dock (.shiin-dual-dock) ONLY on Mobile!
   - Compact Hero Pipeline Header (no duplicate shutter orb)
   - Progressive Disclosure Accordion Tiles
   ============================================================ */
@media (max-width: 599px) {
  .shiin-desktop-nav,
  .shiin-titlebar__capture,
  .shiin-tablet-rail {
    display: none !important;
  }

  .shiin-feedback-host {
    left: 16px;
    right: 16px;
    bottom: 96px;
    margin: 0 auto;
    max-width: calc(100vw - 32px);
    align-items: center;
    justify-content: center;
  }

  .shiin-app-layout {
    flex-direction: column;
  }

  .shiin-titlebar {
    height: 48px;
    flex-basis: 48px;
    padding-left: 16px;
    padding-right: 8px;
    gap: 8px;
  }
  .shiin-titlebar[data-mac="false"],
  .shiin-titlebar[data-web="true"],
  .shiin-titlebar[data-platform="web"],
  .shiin-titlebar[data-controls="none"] {
    padding-left: 16px;
  }
  .shiin-titlebar[data-controls="left"]:not([data-web="true"]):not([data-custom-controls="true"]),
  .shiin-titlebar[data-platform="mac"]:not([data-web="true"]):not([data-custom-controls="true"]) {
    padding-left: 76px;
  }
  .shiin-titlebar__center {
    display: none;
  }
  .shiin-titlebar__mark {
    width: 24px;
    height: 24px;
  }
  .shiin-titlebar__version {
    font-size: 11px;
  }
  .shiin-titlebar__actions {
    gap: 0;
  }
  .shiin-titlebar-button {
    min-width: 32px;
    padding: 0 6px;
  }
  .shiin-window-controls {
    gap: 0;
  }
  .shiin-window-button {
    width: 28px;
  }

  /* Mobile Two-Zone Floating Bottom Dock */
  .shiin-dock-base {
    position: absolute;
    z-index: 45;
    bottom: max(10px, env(safe-area-inset-bottom));
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    width: calc(100% - 24px);
    max-width: 420px;
    align-items: center;
  }
  .shiin-dual-dock {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    pointer-events: auto;
  }
  .shiin-dock-navigation {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: space-evenly;
    gap: 4px;
    padding: 4px 6px;
    height: 52px;
    min-width: 0;
    border-radius: var(--md-sys-shape-corner-full);
    background: color-mix(in srgb, var(--shiin-surface-high) 90%, transparent);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--shiin-line-soft);
    box-shadow: 0 8px 32px -4px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }
  .shiin-dock-navigation > button {
    position: relative;
    isolation: isolate;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 42px;
    min-width: 42px;
    padding: 0 10px;
    border: 0;
    border-radius: var(--md-sys-shape-corner-full);
    background: transparent;
    color: var(--shiin-muted);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background-color 0.22s cubic-bezier(0.2, 0, 0, 1),
                color 0.18s cubic-bezier(0.2, 0, 0, 1),
                padding 0.24s cubic-bezier(0.2, 0, 0, 1),
                transform 0.12s cubic-bezier(0.2, 0, 0, 1),
                box-shadow 0.22s cubic-bezier(0.2, 0, 0, 1);
  }
  .shiin-dock-navigation > button:hover:not([aria-selected="true"]) {
    color: var(--shiin-ink);
    background: color-mix(in srgb, var(--shiin-ink) 8%, transparent);
  }
  .shiin-dock-navigation > button:active {
    transform: scale(0.92);
  }
  .shiin-dock-navigation > button[aria-selected="true"] {
    padding: 0 16px 0 12px;
    color: var(--shiin-on-olive);
    background: var(--shiin-olive);
    font-weight: 800;
    box-shadow: 0 2px 12px color-mix(in srgb, var(--shiin-olive) 42%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.35);
  }
  .shiin-dock-navigation__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    pointer-events: none;
    transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1);
  }
  .shiin-dock-navigation > button[aria-selected="true"] .shiin-dock-navigation__icon {
    transform: scale(1.06);
  }
  .shiin-dock-navigation__label {
    display: inline-grid;
    grid-template-columns: 0fr;
    transition: grid-template-columns 0.24s cubic-bezier(0.2, 0, 0, 1),
                opacity 0.18s cubic-bezier(0.2, 0, 0, 1);
    opacity: 0;
    pointer-events: none;
    vertical-align: middle;
  }
  .shiin-dock-navigation > button[aria-selected="true"] .shiin-dock-navigation__label {
    grid-template-columns: 1fr;
    opacity: 1;
  }
  .shiin-dock-navigation__label-inner {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    padding-left: 6px;
    padding-right: 2px;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: -0.01em;
  }
  .shiin-dock-shutter {
    position: relative;
    isolation: isolate;
    display: grid;
    place-items: center;
    width: 88px;
    height: 88px;
    flex: none;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--shiin-on-accent) !important;
    filter: drop-shadow(0 8px 18px rgba(52, 56, 49, 0.24));
  }
  .shiin-dock-shutter__shape {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    fill: var(--shiin-accent);
    z-index: -1;
  }
  .shiin-dock-shutter__face {
    display: grid;
    justify-items: center;
    gap: 2px;
  }
  .shiin-dock-shutter__face strong {
    font-size: 13px;
    line-height: 1.2;
    font-weight: 850;
  }
  .shiin-dock-shutter[aria-busy="true"] .app-icon {
    animation: shiin-capture-spin 1.6s linear infinite;
  }
  .shiin-dock-feedback {
    width: 100%;
    max-width: 100%;
  }

  /* Mobile Content Layout */
  .shiin-node .shiin-bento .sb-page {
    padding: 18px 16px 148px;
  }
  .shiin-node .shiin-bento .sb-grid {
    gap: 14px;
  }
  .shiin-node .shiin-bento .sb-tile {
    grid-column: span 12;
    padding: 18px;
    border-radius: 26px;
  }
  /* On Mobile, the Two-Zone Dock owns the Shutter, so the Hero becomes a sleek pipeline card */
  .shiin-node .shiin-bento .sb-capture-hero {
    grid-template-columns: minmax(0, 1fr);
    min-height: 0;
    padding: 20px;
  }
  .shiin-node .shiin-bento .sb-capture-art,
  .shiin-node .shiin-bento .sb-capture-primary {
    display: none;
  }
  .shiin-node .shiin-bento .sb-capture-copy h2 {
    font-size: 32px;
  }
  .shiin-hero-connected {
    width: 100%;
  }
  .shiin-hero-connected > button {
    flex: 1;
    padding: 0 10px;
    font-size: 12px;
    min-height: 44px;
  }
  .shiin-node .shiin-bento .sb-metric-carousel {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .shiin-node .shiin-bento .sb-metric {
    min-height: 96px;
    padding: 14px;
    border-radius: 22px;
  }
  .shiin-node .shiin-bento .sb-metric-value {
    font-size: 17px;
  }

  /* Mobile Progressive Disclosure for Secondary Tiles */
  .shiin-node .shiin-workspace .shiin-workspace-tile .sb-tile-head {
    align-items: center;
    gap: 8px;
  }
  .shiin-node .shiin-workspace .shiin-workspace-tile .sb-tile-head > div {
    flex: 1;
    min-width: 0;
  }
  .shiin-node .shiin-workspace .shiin-tile-disclosure {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    flex: none;
    padding: 0;
    border: 0;
    border-radius: 21px;
    background: var(--shiin-surface-low);
  }
  .shiin-tile-disclosure .app-icon {
    transition: transform var(--shiin-spatial);
  }
  .shiin-workspace-tile[data-expanded="true"] .shiin-tile-disclosure .app-icon {
    transform: rotate(180deg);
  }
  .shiin-node .shiin-workspace .shiin-tile-description {
    display: none;
  }
  .shiin-node .shiin-workspace .shiin-tile-summary {
    display: block;
    font-size: 12.5px;
    color: var(--shiin-muted);
    margin-top: 2px;
  }
  .shiin-workspace-tile:not([data-expanded="true"]) .shiin-workspace-tile__body {
    display: none;
  }
  .shiin-node .shiin-bento .sb-listener-tile .sb-toggle-group {
    grid-template-columns: 1fr;
  }
  .shiin-node .shiin-bento .sb-listener-tile .sb-toggle {
    min-height: 64px;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }
  .shiin-node .shiin-bento .sb-filename-field {
    grid-template-columns: minmax(0, 1fr);
    gap: 6px;
  }
  .shiin-node .shiin-bento .sb-folder-row .sb-path-chip {
    flex-basis: 100%;
  }
  .shiin-node .shiin-bento .sb-folder-action {
    flex: 1;
    min-height: 44px;
  }
  .shiin-permission-settings summary {
    gap: 8px;
    padding: 18px;
    flex-wrap: wrap;
  }
  .shiin-permission-heading {
    flex: 1;
  }
  .shiin-permission-summary {
    order: 3;
    flex-basis: 100%;
    margin-left: 34px;
    font-size: 13px;
  }
  .shiin-permission-content {
    padding: 0 12px 16px;
  }
  .shiin-permission-row {
    grid-template-columns: 32px minmax(0, 1fr) auto;
    gap: 8px;
    padding: 14px 12px;
  }
  .shiin-permission-row > button {
    grid-column: 2;
    justify-self: start;
  }
}

/* ============================================================
   WORKSPACE WIDGET GRID
   The workbench runs on the same discrete widget framework as the analytics
   dashboard, but its chrome stays out of the way: one faint pencil reveals the
   per-card placement tools, and nothing changes until you ask for it.
   ============================================================ */
.shiin-node .shiin-bento .shiin-ws-grid {
  /* Cards keep their own height: a short card next to a tall one must not
     stretch into a mostly-empty surface. */
  align-items: start;
}

.shiin-node .shiin-bento .shiin-ws-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  grid-column: span var(--ws-span, 12);
  container-type: inline-size;
  container-name: ws-cell;
  transition: opacity 180ms var(--shiin-effects);
}

.shiin-node .shiin-bento .shiin-ws-cell__body {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
}

.shiin-node .shiin-bento .shiin-ws-cell__body > * {
  flex: 1 1 auto;
  min-width: 0;
  width: 100%;
  /* Legacy tiles pin align-self: start from their grid-item days; inside a cell
     the card always has to fill the column. */
  align-self: stretch;
}

/* Editing: a hairline of intent, never a full editor skin */
.shiin-node .shiin-bento .shiin-ws-cell.is-editing {
  padding-top: 34px;
  border-radius: 34px;
  outline: 1.5px dashed color-mix(in srgb, var(--shiin-accent) 52%, transparent);
  outline-offset: 4px;
}

.shiin-node .shiin-bento .shiin-ws-cell.is-editing .shiin-ws-cell__body {
  cursor: grab;
}

.shiin-node .shiin-bento .shiin-ws-cell.is-dragging {
  opacity: 0.5;
}

.shiin-ws-cell__chrome {
  position: absolute;
  inset: 0 4px auto 4px;
  height: 28px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--shiin-muted);
  font-size: 11.5px;
  font-weight: 700;
  min-width: 0;
}

.shiin-ws-cell__grip {
  display: inline-flex;
  opacity: 0.6;
}

.shiin-ws-cell__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.shiin-ws-cell__sizes {
  display: flex;
  gap: 2px;
  margin-left: auto;
  padding: 2px;
  border-radius: 999px;
  background: var(--shiin-surface-low);
}

.shiin-ws-cell__unit {
  display: grid;
  place-items: center;
  padding: 0 4px 0 2px;
  color: var(--shiin-muted);
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.02em;
  opacity: 0.7;
}

.shiin-ws-cell__size {
  display: grid;
  place-items: center;
  min-width: 22px;
  min-height: 18px;
  padding: 1px 5px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--shiin-muted);
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  transition: background 160ms var(--shiin-effects), color 160ms var(--shiin-effects);
}

.shiin-ws-cell__size:hover {
  color: var(--shiin-ink);
}

.shiin-ws-cell__size.is-active {
  background: var(--shiin-olive);
  color: var(--shiin-on-olive);
}

.shiin-ws-cell__actions {
  display: flex;
  gap: 2px;
}

.shiin-ws-cell__ctrl {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--shiin-muted);
  cursor: pointer;
}

.shiin-ws-cell__ctrl:hover {
  background: var(--shiin-surface-low);
  color: var(--shiin-ink);
}

.shiin-ws-cell__ctrl.is-danger:hover {
  background: color-mix(in srgb, var(--md-sys-color-error) 14%, transparent);
  color: var(--md-sys-color-error);
}

/* Edit-mode tool cluster — the pencil itself lives in the title bar */
.shiin-node .shiin-bento .shiin-ws-tools {
  position: sticky;
  top: 8px;
  z-index: 45;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  margin: 0;
  padding: 0 10px 10px 0;
  pointer-events: none;
}

.shiin-node .shiin-bento .shiin-ws-tools > * {
  pointer-events: auto;
}

.shiin-ws-tool {
  position: relative;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 12px;
  background: color-mix(in srgb, var(--shiin-surface) 60%, transparent);
  backdrop-filter: blur(12px);
  color: var(--shiin-muted);
  opacity: 0.4;
  cursor: pointer;
  transition: opacity 180ms var(--shiin-effects), background 180ms var(--shiin-effects),
    color 180ms var(--shiin-effects), border-color 180ms var(--shiin-effects),
    transform 180ms var(--shiin-effects);
}

.shiin-ws-tool:hover,
.shiin-ws-tool:focus-visible {
  opacity: 1;
  background: var(--shiin-surface);
  color: var(--shiin-ink);
  border-color: var(--shiin-line-soft);
}

.shiin-ws-tools:hover .shiin-ws-tool,
.shiin-ws-tools:focus-within .shiin-ws-tool {
  opacity: 0.85;
}

.shiin-ws-tools[data-editing] .shiin-ws-tool {
  opacity: 1;
  background: var(--shiin-surface);
  border-color: var(--shiin-line-soft);
}

.shiin-ws-tool.is-active {
  background: var(--shiin-olive);
  color: var(--shiin-on-olive);
  border-color: transparent;
}

/* Labelled tool ("恢复默认") — wider, still part of the same cluster */
.shiin-ws-tool--label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: auto;
  padding: 0 13px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.shiin-ws-tool--label[data-confirming] {
  background: var(--shiin-accent);
  border-color: transparent;
  color: var(--shiin-on-accent);
}

.shiin-ws-tool--label[data-confirming]:hover {
  background: color-mix(in srgb, var(--shiin-accent) 86%, var(--shiin-ink));
  color: var(--shiin-on-accent);
}

.shiin-ws-tool__count {
  position: absolute;
  top: -3px;
  right: -3px;
  display: grid;
  place-items: center;
  min-width: 15px;
  height: 15px;
  padding: 0 3px;
  border-radius: 999px;
  background: var(--shiin-accent);
  color: var(--shiin-on-accent);
  font-size: 9.5px;
  font-weight: 800;
}

.shiin-ws-tools__add {
  position: relative;
}

.shiin-ws-tools__menu {
  top: calc(100% + 8px);
  min-width: 236px;
}

/* Tablet: the workbench collapses onto a two-column rhythm */
@media (max-width: 1199px) {
  .shiin-node .shiin-bento .shiin-ws-cell {
    grid-column: span var(--ws-span-md, 12);
  }
}

/* Mobile: everything stacks, tools stay reachable by touch */
@media (max-width: 599px) {
  .shiin-node .shiin-bento .shiin-ws-cell {
    grid-column: span 12;
  }

  .shiin-node .shiin-bento .shiin-ws-cell.is-editing {
    padding-top: 32px;
  }

  .shiin-ws-cell__chrome {
    gap: 6px;
    font-size: 11px;
  }

  .shiin-ws-cell__label {
    max-width: 34%;
  }

  .shiin-ws-tool {
    width: 32px;
    height: 32px;
    border-radius: 11px;
    opacity: 0.72;
  }

  .shiin-node .shiin-bento .shiin-ws-tools {
    top: 4px;
  }
}

/* A resized card reflows from its own width, not the viewport width */
@container ws-cell (max-width: 700px) {
  .shiin-node .shiin-bento .sb-capture-hero {
    grid-template-columns: minmax(0, 1fr) 156px;
    gap: 16px;
    padding: 24px;
  }

  .shiin-node .shiin-bento .sb-capture-copy h2 {
    font-size: clamp(28px, 7cqi, 42px);
  }

  .shiin-node .shiin-bento .shiin-orb-stage {
    width: 152px;
    height: 152px;
  }

  .shiin-node .shiin-bento .sb-capture-orb {
    width: 132px;
    height: 132px;
  }

  .shiin-node .shiin-bento .sb-metric-carousel {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
}

@container ws-cell (max-width: 560px) {
  .shiin-node .shiin-bento .sb-capture-hero {
    grid-template-columns: minmax(0, 1fr);
  }

  .shiin-node .shiin-bento .sb-capture-art {
    display: none;
  }

  .shiin-node .shiin-bento .sb-capture-copy h2 {
    font-size: clamp(26px, 9cqi, 34px);
  }
}

@media (hover: none) {
  .shiin-ws-tool {
    opacity: 0.75;
  }

  .shiin-ws-tools:hover .shiin-ws-tool,
  .shiin-ws-tools:focus-within .shiin-ws-tool {
    opacity: 0.75;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shiin-shell *,
  .shiin-shell *::before,
  .shiin-shell *::after,
  .shiin-panel * {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
`

let styleElement: HTMLStyleElement | null = null
export function registerExpressiveStyles(): () => void {
  if (typeof document === 'undefined') return () => undefined
  if (!styleElement) {
    styleElement = document.createElement('style')
    styleElement.id = 'shiin-expressive-styles'
    styleElement.textContent = EXPRESSIVE_CSS
    document.head.append(styleElement)
  }
  return () => undefined
}
