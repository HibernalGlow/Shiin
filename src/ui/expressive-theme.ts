/** Shiin semantic theme and adaptive Expressive web components. */
export const EXPRESSIVE_CSS = String.raw`
.shiin-shell, .shiin-panel {
  --md-sys-color-primary: #c8f000;
  --md-sys-color-on-primary: #273000;
  --md-sys-color-primary-container: #e7f6a8;
  --md-sys-color-on-primary-container: #343831;
  --md-sys-color-secondary: #62652f;
  --md-sys-color-on-secondary: #fff9e6;
  --md-sys-color-secondary-container: #e6e3cd;
  --md-sys-color-on-secondary-container: #343831;
  --md-sys-color-tertiary: #536644;
  --md-sys-color-on-tertiary: #ffffff;
  --md-sys-color-tertiary-container: #dcebcf;
  --md-sys-color-on-tertiary-container: #34452b;
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
  --md-sys-color-on-surface-variant: #606457;
  --md-sys-color-outline: #777c6d;
  --md-sys-color-outline-variant: #c5c8b9;
  --md-sys-shape-corner-small: 8px;
  --md-sys-shape-corner-large: 16px;
  --md-sys-shape-corner-extra-large: 28px;
  --md-sys-shape-corner-extra-large-increased: 32px;
  --md-sys-shape-corner-full: 999px;
  --shiin-space-1: 8px;
  --shiin-space-2: 16px;
  --shiin-space-3: 24px;
  --shiin-space-4: 32px;
  --shiin-space-6: 48px;
  --shiin-ground: var(--md-sys-color-surface);
  --shiin-surface: var(--md-sys-color-surface-container-lowest);
  --shiin-surface-low: var(--md-sys-color-surface-container-low);
  --shiin-surface-high: var(--md-sys-color-surface-container-high);
  --shiin-ink: var(--md-sys-color-on-surface);
  --shiin-muted: var(--md-sys-color-on-surface-variant);
  --shiin-muted-strong: #4c5148;
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
  --shiin-shadow-1: 0 2px 6px #34383110;
  --shiin-shadow-2: 0 8px 24px #34383120;
  --shiin-spatial: 380ms linear(0,.22 8%,.76 23%,1.08 42%,1.02 65%,1);
  --shiin-effects: 180ms cubic-bezier(.2,0,0,1);
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
  font: 14px/1.6 var(--shiin-font);
  color: var(--shiin-ink);
  -webkit-font-smoothing: antialiased;
}
.shiin-shell *, .shiin-panel *, .shiin-shell *::before, .shiin-shell *::after { box-sizing: border-box; }
.shiin-shell button, .shiin-shell input, .shiin-shell select, .shiin-panel button { font: inherit; color: inherit; }
.shiin-shell button, .shiin-panel button { cursor: pointer; -webkit-tap-highlight-color: transparent; }
.shiin-shell button:disabled, .shiin-panel button:disabled { cursor: default; opacity: .55; }
.shiin-shell :focus-visible, .shiin-panel :focus-visible { outline: 3px solid var(--shiin-olive); outline-offset: 3px; }
.shiin-shell { height: 100vh; height: 100dvh; display: flex; flex-direction: column; overflow: hidden; background: var(--shiin-ground); }
.shiin-app-layout { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.shiin-tabs { display: flex; flex: none; gap: 8px; padding: 0 max(32px, calc((100vw - 1184px) / 2)); background: var(--shiin-ground); border-bottom: 1px solid var(--shiin-line-soft); }
.shiin-tabs > button { position: relative; display: flex; align-items: center; justify-content: center; gap: 8px; min-width: 144px; height: 64px; padding: 0 24px; border: 0; background: transparent; color: var(--shiin-muted); font-size: 15px; font-weight: 650; }
.shiin-tabs > button[aria-selected="true"] { color: var(--shiin-ink); font-weight: 800; }
.shiin-tabs > button:hover { background: var(--shiin-surface-low); border-radius: 24px 24px 0 0; }
.shiin-tab-indicator { position: absolute; height: 5px; left: 24px; right: 24px; bottom: 0; border-radius: 8px 8px 0 0; background: var(--shiin-olive); }
.shiin-node { flex: 1; min-height: 0; min-width: 0; overflow: auto; container-type: inline-size; container-name: node; scrollbar-color: var(--shiin-line) transparent; scrollbar-width: thin; }
.shiin-view-transition { min-height: 100%; }
.shiin-node .shiin-bento { height: auto; overflow: visible; min-height: 100%; --sb-font: var(--shiin-font); --sb-secondary: var(--shiin-olive); --sb-on-secondary: var(--shiin-on-olive); --sb-tertiary: var(--md-sys-color-tertiary); --sb-on-tertiary: var(--md-sys-color-on-tertiary); --sb-tertiary-container: var(--md-sys-color-tertiary-container); --sb-on-tertiary-container: var(--md-sys-color-on-tertiary-container); }
.shiin-node .shiin-bento .sb-page { max-width: 1248px; padding: 32px 32px 48px; }
.shiin-node .shiin-bento .sb-grid { gap: 16px; }
.shiin-node .shiin-bento .sb-tile { border: 0; box-shadow: none; padding: 24px; border-radius: 32px; }
.shiin-node .shiin-bento .sb-tile-head h3 { font-size: 22px; font-weight: 750; letter-spacing: -.03em; }
.shiin-node .shiin-bento .sb-tile-head p, .shiin-node .shiin-bento .sb-note { font-size: 13px; line-height: 1.65; }
.shiin-node .shiin-bento .sb-field-label { font-size: 13px; letter-spacing: 0; font-weight: 600; }
.shiin-node .shiin-bento .sb-masthead h2 { font-size: 40px; font-weight: 800; line-height: 1.2; letter-spacing: -.04em; }
.shiin-node .shiin-bento .sb-masthead { margin-bottom: 24px; }
.shiin-node .shiin-bento .sb-save-state { background: transparent; font-size: 13px; padding-right: 0; }
.shiin-node .shiin-bento .sb-save-state i { background: var(--shiin-olive); }
.shiin-node .shiin-bento .sb-save-state[data-state="error"] { color: var(--shiin-red); }
.shiin-node .shiin-bento .sb-save-state[data-state="error"] i { background: currentColor; }
.shiin-node .shiin-bento .sb-source-row { border: 0; background: var(--shiin-surface-low); }
.shiin-node .shiin-bento .sb-source-icon { position: relative; isolation: isolate; background: transparent; color: var(--shiin-olive); }
.shiin-node .shiin-bento .sb-source-shape { position: absolute; inset: 0; width: 100%; height: 100%; fill: var(--shiin-sand); z-index: -1; }
.shiin-node .shiin-bento .sb-filename-field { display: grid; grid-template-columns: auto minmax(0,1fr); align-items: center; gap: 12px; margin-top: 16px; }
.shiin-node .shiin-bento .sb-filename-field input { min-width: 0; width: 100%; border-radius: 12px 12px 4px 4px; font-size: 13px; }
.shiin-node .shiin-bento .sb-folder-row { flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.shiin-node .shiin-bento .sb-folder-action { min-height: 40px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 0 12px; background: var(--shiin-surface-low); border: 0; border-radius: 20px; font-size: 13px; font-weight: 650; }
.shiin-node .shiin-bento .sb-folder-action:hover { background: var(--shiin-sand); }
.shiin-node .shiin-bento .sb-listener-tile, .shiin-node .shiin-bento .sb-tester-tile { align-self: start; }
.shiin-node .shiin-bento .sb-split-main { background: var(--shiin-sand); color: var(--shiin-ink); }
.shiin-node .shiin-bento .sb-split-trail { background: var(--shiin-surface-low); color: var(--shiin-ink); }
.shiin-node .shiin-bento .sb-control-seat { position: relative; width: 32px; height: 32px; display: grid; place-items: center; isolation: isolate; }
.shiin-node .shiin-bento .sb-control-seat > svg:first-child { position: absolute; width: 100%; height: 100%; fill: var(--shiin-surface); z-index: -1; }
.shiin-node .shiin-bento .sb-axis-row { grid-template-columns: 48px minmax(0,1fr) 54px; font-size: 12px; }
.shiin-node .shiin-bento .sb-axis-signal { position: relative; height: 6px; margin: 8px 6px; border-radius: 8px; background: var(--shiin-surface-high); }
.shiin-node .shiin-bento .sb-axis-center { position: absolute; height: 14px; width: 1px; top: -4px; left: 50%; background: var(--shiin-line); }
.shiin-node .shiin-bento .sb-axis-marker { position: absolute; width: 12px; height: 12px; top: -3px; transform: translateX(-50%); border-radius: 50%; background: var(--shiin-muted); }
.shiin-node .shiin-bento .sb-axis-signal-fill { position: absolute; height: 100%; border-radius: inherit; background: var(--shiin-line); }
.shiin-node .shiin-bento .sb-axis-signal[data-active="true"] .sb-axis-signal-fill { background: var(--shiin-accent); }
.shiin-node .shiin-bento .sb-axis-signal[data-active="true"] .sb-axis-marker { background: var(--shiin-olive); }
.shiin-node .shiin-bento .sb-tester-empty { padding: 24px 0; text-align: center; }
.shiin-node .shiin-bento .sb-target-group { gap: 4px; background: transparent; padding: 0; }
.shiin-node .shiin-bento .sb-target-group button { min-height: 48px; border-radius: 8px; font-size: 14px; background: var(--shiin-surface-low); }
.shiin-node .shiin-bento .sb-target-group button:first-child { border-radius: 24px 8px 8px 24px; }
.shiin-node .shiin-bento .sb-target-group button:last-child { border-radius: 8px 24px 24px 8px; }
.shiin-node .shiin-bento .sb-target-group button[aria-pressed="true"] { background: var(--shiin-accent-soft); color: var(--shiin-ink); border-radius: 24px; }
.shiin-node .shiin-bento .sb-tile button { transition: background var(--shiin-effects), color var(--shiin-effects), border-radius var(--shiin-spatial), transform var(--shiin-spatial); }
.shiin-node .shiin-bento .sb-tile button:active { transform: scale(.97); }
.shiin-node .shiin-bento .sb-secondary-button { min-height: 40px; font-size: 13px; }
.shiin-node .shiin-bento .sb-chip, .shiin-node .shiin-bento .sb-path-chip, .shiin-node .shiin-bento .sb-preset-chip { font-size: 13px; }
.shiin-node .shiin-bento .sb-combo-ghost { display: none; }
.shiin-node .shiin-bento .sb-toggle-group { gap: 4px; }
.shiin-node .shiin-bento .sb-toggle { border-radius: 8px; }
.shiin-node .shiin-bento .sb-toggle:first-child { border-radius: 24px 8px 8px 24px; }
.shiin-node .shiin-bento .sb-toggle:last-child { border-radius: 8px 24px 24px 8px; }
.shiin-node .shiin-bento .sb-toggle-copy small { font-size: 13px; }
.shiin-node .shiin-bento .sb-toggle-icon,
.shiin-node .shiin-bento .sb-keyboard-row .sb-toggle-icon { color: var(--shiin-olive); }
.shiin-node .shiin-bento .sb-icon-button:hover { color: var(--shiin-olive); }
.shiin-node .shiin-bento .sb-listener-tile .sb-toggle[aria-pressed="true"] { background: var(--shiin-sand); color: var(--shiin-ink); border-radius: 24px; }
.shiin-node .shiin-bento .sb-listener-tile .sb-toggle[aria-pressed="true"] .sb-toggle-icon { background: var(--shiin-olive); color: var(--shiin-on-olive); }
.shiin-node .shiin-bento .sb-secondary-button { border-radius: var(--shiin-text-radius, 20px); }
.shiin-node .shiin-bento .sb-combo-key > span { font-size: 13px !important; }
.shiin-node .shiin-bento .sb-connected { gap: 4px; border-radius: 24px; padding: 4px; }
.shiin-node .shiin-bento .sb-connected button { min-height: 40px; }
.shiin-node .shiin-bento .sb-connected button[aria-pressed="true"] { background: var(--shiin-accent); color: var(--shiin-on-accent); }
.shiin-node .shiin-bento .sb-toggle-copy small,
.shiin-node .shiin-bento .sb-row-copy small { color: var(--shiin-muted-strong); opacity: 1; }
.shiin-shell .shiin-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 40px; padding: 0 16px; border: 0; border-radius: 20px; background: var(--shiin-sand); }
.shiin-shell .shiin-btn[data-variant="primary"] { background: var(--shiin-accent); color: var(--shiin-on-accent); }
.shiin-shell .shiin-btn[data-variant="ghost"] { background: transparent; }
.shiin-node .shiin-bento .sb-role-row-copy small { color: var(--shiin-muted-strong); opacity: 1; }
.shiin-node .shiin-bento .sb-role-row .sb-readout-pill { background: var(--shiin-sand); color: var(--shiin-ink); }
.shiin-node .shiin-bento .sb-save-state > button { background: transparent; color: var(--shiin-red); border: 0; min-height: 40px; text-decoration: underline; font-weight: 700; }
.shiin-node .shiin-bento .sb-notify-toggle[aria-pressed="true"] .sb-toggle-copy small { color: var(--sb-on-tertiary); opacity: 1; }
.shiin-mobile-toolbar { display: none; }

.shiin-capture-desk { grid-column: 1/-1; display: grid; grid-template-columns: minmax(0,1fr) 168px; gap: 16px 32px; align-items: center; min-width: 0; padding: 8px 24px 24px 0; }
.shiin-capture-desk h1 { font-size: clamp(32px,3.3vw,44px); font-weight: 850; line-height: 1.2; letter-spacing: -.05em; margin: 0 0 16px; }
.shiin-capture-context { display: flex; align-items: center; gap: 8px; margin: 0; color: var(--shiin-muted); font-size: 14px; }
.shiin-capture-context > span:first-of-type { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 40ch; }
.shiin-capture-context__output { border-left: 1px solid var(--shiin-line); margin-left: 8px; padding-left: 16px; flex: none; }
.shiin-desk-actions { display: flex; gap: 4px; margin-top: 24px; }
.shiin-desk-actions button { min-height: 48px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 0 20px; border: 0; border-radius: 8px; background: var(--shiin-sand); font-size: 14px; font-weight: 650; transition: border-radius var(--shiin-spatial), background var(--shiin-effects); }
.shiin-desk-actions button:first-child { border-radius: 24px 8px 8px 24px; background: var(--shiin-ink); color: var(--shiin-ground); }
.shiin-desk-actions button:first-child[aria-pressed="true"] { background: var(--shiin-accent-soft); color: var(--shiin-on-accent); }
.shiin-desk-actions button:last-child { border-radius: 8px 24px 24px 8px; padding: 0 16px; }
.shiin-desk-actions button:hover { border-radius: 24px; background: var(--shiin-surface-high); color: var(--shiin-ink); }
.shiin-shutter { position: relative; width: 168px; height: 168px; display: grid; place-items: center; isolation: isolate; border: 0; background: transparent; padding: 0; color: var(--shiin-on-accent)!important; }
.shiin-shutter__shape { position: absolute; inset: 0; width: 100%; height: 100%; fill: var(--shiin-accent); z-index: -1; }
.shiin-shutter__face { display: grid; justify-items: center; gap: 8px; }
.shiin-shutter__face strong { font-size: 17px; font-weight: 800; }
.shiin-shutter[aria-busy="true"] .shiin-shutter__face > .app-icon { animation: shiin-capture-spin 1.6s linear infinite; }
.shiin-permission-notice { grid-column: 1/-1; display: flex; align-items: center; gap: 8px; background: var(--md-sys-color-error-container); color: var(--md-sys-color-on-error-container)!important; border: 0; border-radius: 16px; padding: 16px; text-align: left; font-size: 14px!important; }
.shiin-permission-notice > strong { margin-left: auto; flex: none; }
.shiin-capture-feedback { grid-column: 1/-1; display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--shiin-olive); min-width: 0; }
.shiin-capture-feedback > span { overflow-wrap: anywhere; min-width: 0; }
.shiin-capture-feedback > button { display: flex; gap: 8px; align-items: center; flex: none; background: transparent; border: 0; padding: 8px; margin-left: auto; font-weight: 650; }
.shiin-capture-feedback[data-error="true"] { color: var(--shiin-red); }

.shiin-permission-settings { margin-bottom: 24px; background: var(--shiin-surface); border-radius: 28px; scroll-margin-top: 24px; }
.shiin-permission-settings summary { display: flex; align-items: center; gap: 16px; padding: 24px; min-height: 80px; list-style: none; cursor: pointer; }
.shiin-permission-settings summary::-webkit-details-marker { display: none; }
.shiin-permission-settings summary > .app-icon { transition: transform var(--shiin-spatial); }
.shiin-permission-settings[open] summary > .app-icon { transform: rotate(180deg); }
.shiin-permission-heading { display: flex; align-items: center; gap: 12px; }
.shiin-permission-heading strong { font-size: 20px; font-weight: 750; }
.shiin-permission-summary { margin-left: auto; color: var(--shiin-muted); font-size: 14px; }
.shiin-permission-summary[data-warning="true"] { color: var(--shiin-red); }
.shiin-permission-content { padding: 0 24px 24px; }
.shiin-permission-intro { display: flex; align-items: center; gap: 16px; justify-content: space-between; margin-bottom: 16px; }
.shiin-permission-intro p { margin: 0; color: var(--shiin-muted); font-size: 14px; }
.shiin-permission-rows { display: grid; gap: 4px; }
.shiin-permission-row { display: grid; grid-template-columns: 40px minmax(0,1fr) auto auto; align-items: center; gap: 16px; padding: 16px; background: var(--shiin-surface-low); border-radius: 8px; }
.shiin-permission-row:first-child { border-radius: 24px 24px 8px 8px; }
.shiin-permission-row:last-child { border-radius: 8px 8px 24px 24px; }
.shiin-permission-row__icon { width: 40px; height: 40px; display: grid; place-items: center; background: var(--shiin-surface); border-radius: 14px; color: var(--shiin-olive); }
.shiin-permission-row__copy { min-width: 0; display: grid; gap: 4px; }
.shiin-permission-row__copy strong { font-size: 15px; font-weight: 700; }
.shiin-permission-row__copy > span { font-size: 13px; color: var(--shiin-muted); overflow-wrap: anywhere; }
.shiin-permission-state { display: flex; gap: 4px; align-items: center; font-size: 13px; white-space: nowrap; color: var(--shiin-muted); }
.shiin-permission-state[data-state="ready"] { color: var(--shiin-olive); }
.shiin-permission-state[data-state="missing"] { color: var(--shiin-red); }
.shiin-permission-row > button { background: var(--shiin-surface); }
.shiin-permission-footer { display: flex; gap: 16px; align-items: center; padding-top: 16px; }
.shiin-permission-footer > span { font-size: 13px; color: var(--shiin-muted); }
.shiin-permission-footer > span[data-error="true"] { color: var(--shiin-red); }
.shiin-permission-preview { display: flex; align-items: flex-end; gap: 16px; margin-top: 16px; }
.shiin-permission-preview img { width: 200px; max-height: 120px; object-fit: contain; border-radius: 16px; }
.shiin-action { min-height: 48px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 0 20px; border: 0; border-radius: 24px; font-size: 14px; font-weight: 700; }
.shiin-action--primary { background: var(--shiin-accent); color: var(--shiin-on-accent); }
.shiin-action--olive { background: var(--shiin-olive); color: var(--shiin-on-olive); }
.shiin-brand__mark { width: 48px; height: 48px; flex: none; display: grid; place-items: center; background: var(--shiin-accent); color: var(--shiin-on-accent); border-radius: 24px 24px 8px 24px; }
.shiin-titlebar{height:50px;flex:0 0 50px;display:flex;align-items:center;gap:14px;padding:0 12px 0 78px;border-bottom:1px solid var(--shiin-line-soft);background:color-mix(in srgb,var(--shiin-surface) 92%,transparent);user-select:none;-webkit-app-region:drag;position:relative;z-index:40}
.shiin-titlebar__brand{display:inline-flex;align-items:center;gap:9px;min-width:0}.shiin-titlebar__mark{width:27px;height:27px;display:grid;place-items:center;border-radius:12px 12px 12px 4px;background:var(--shiin-accent);color:var(--shiin-on-accent);transform:rotate(-7deg);box-shadow:var(--shiin-shadow-1)}.shiin-titlebar__name{font-size:14px;font-weight:850;letter-spacing:-.04em}
.shiin-titlebar__version{min-height:24px;display:inline-flex;align-items:center;gap:5px;padding:0 9px;border:0;border-radius:999px;background:var(--shiin-surface-low);color:var(--shiin-muted);font:700 10px/1 var(--shiin-mono);-webkit-app-region:no-drag;transition:background var(--shiin-effects),border-radius var(--shiin-spatial),color var(--shiin-effects)}.shiin-titlebar__version:hover{background:var(--shiin-accent-soft);color:var(--shiin-ink);border-radius:12px}.shiin-titlebar__update{padding:3px 6px;border-radius:8px;background:var(--shiin-red);color:var(--shiin-on-red);font:800 9px/1 var(--shiin-font)}
.shiin-titlebar__status{position:absolute;left:50%;transform:translateX(-50%);display:inline-flex;align-items:center;gap:8px;min-height:28px;padding:0 14px;border-radius:999px;background:var(--shiin-surface-low);color:var(--shiin-muted);font-size:11px;font-weight:760;pointer-events:none}.shiin-titlebar__status[data-listening="true"]{background:var(--shiin-accent);color:var(--shiin-on-accent)}.shiin-titlebar__status i{width:7px;height:7px;border-radius:50%;background:var(--shiin-line)}.shiin-titlebar__status[data-listening="true"] i{background:var(--shiin-ink);box-shadow:0 0 0 4px rgba(52,56,49,.14)}
.shiin-titlebar__actions{display:flex;align-items:center;gap:4px;margin-left:auto;-webkit-app-region:no-drag}.shiin-titlebar-button{min-width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 9px;border:0;border-radius:13px;background:transparent;color:var(--shiin-muted);transition:background var(--shiin-effects),color var(--shiin-effects),border-radius var(--shiin-spatial),transform var(--shiin-effects)}.shiin-titlebar-button:hover,.shiin-titlebar-button[data-active="true"]{background:var(--shiin-surface-high);color:var(--shiin-ink);border-radius:22px}.shiin-titlebar-button:active{transform:scale(.95);border-radius:10px}.shiin-titlebar-button[data-tone="danger"]{color:var(--shiin-red)}
.shiin-titlebar-popover{position:absolute;top:calc(100% + 8px);right:0;min-width:118px;display:grid;gap:3px;padding:6px;border:1px solid var(--shiin-line-soft);border-radius:18px;background:var(--shiin-surface);box-shadow:var(--shiin-shadow-2);z-index:100}.shiin-titlebar-popover button{min-height:30px;border:0;border-radius:12px;background:transparent;color:var(--shiin-muted);text-align:left;padding:0 10px;font-size:12px}.shiin-titlebar-popover button:hover,.shiin-titlebar-popover button[aria-selected="true"]{background:var(--shiin-accent-soft);color:var(--shiin-ink)}
.shiin-window-controls{display:inline-flex;align-items:center;gap:2px;margin-left:4px}.shiin-window-button{width:34px;height:34px;display:grid;place-items:center;border:0;border-radius:10px;background:transparent;color:var(--shiin-muted)}.shiin-window-button:hover{background:var(--shiin-surface-high);border-radius:18px}.shiin-window-button[data-close="true"]:hover{background:var(--shiin-red);color:var(--shiin-on-red)}


.shiin-panel{padding:clamp(20px,4vw,42px);background:var(--shiin-ground);container-type:inline-size;min-width:0;border-radius:24px}.shiin-panel__heading{display:flex;align-items:center;gap:20px;margin-bottom:28px}.shiin-panel__heading .shiin-brand__mark{width:60px;height:60px;flex-basis:60px}.shiin-panel .shiin-kicker{font-size:12px;margin:0;color:var(--shiin-muted)}.shiin-panel h2{font-size:clamp(25px,4vw,42px);letter-spacing:-.04em;line-height:1.2;margin:5px 0;font-weight:800}.shiin-panel__heading p:last-child{font-size:14px;color:var(--shiin-muted);margin:8px 0 0}.shiin-panel__actions{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:24px}.shiin-panel .shiin-action--plain{background:var(--shiin-sand);color:var(--shiin-ink)}.shiin-panel__console{background:var(--shiin-ink);color:var(--shiin-ground);border-radius:18px 18px 18px 5px;overflow:hidden}.shiin-panel__console>div{display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid #565b50;padding:12px 20px;color:#d0cbb9;font-size:12px}.shiin-panel__console pre{font:13px/1.7 var(--shiin-mono);margin:0;padding:20px;min-height:115px;white-space:pre-wrap;overflow-wrap:anywhere}.shiin-panel__console[data-error="true"] pre{color:#ffb8b4}

.shiin-titlebar[data-mac="false"] { padding-left: 24px; }
.shiin-titlebar-button, .shiin-titlebar-menu { position: relative; }
.shiin-titlebar__status { font-size: 13px; }
.shiin-titlebar-popover button { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 40px; }
.shiin-titlebar-popover button[aria-pressed="true"] { background: var(--shiin-accent-soft); }
.shiin-alert-dot { position: absolute; right: 4px; top: 4px; width: 5px; height: 5px; background: var(--shiin-red); border-radius: 50%; }
@keyframes shiin-capture-spin { to { transform: rotate(360deg); } }
@media(max-width:839px) {
  .shiin-tabs { padding-inline: 24px; }
  .shiin-node .shiin-bento .sb-page { padding: 24px 24px 40px; }
  .shiin-capture-desk { padding-right: 8px; grid-template-columns: minmax(0,1fr) 144px; }
  .shiin-shutter { width: 144px; height: 144px; }
  .shiin-node .shiin-bento .sb-capture-tile, .shiin-node .shiin-bento .sb-combos-tile { grid-column: span 12; }
  .shiin-permission-row { grid-template-columns: 40px minmax(0,1fr) auto; gap: 8px 16px; }
  .shiin-permission-row > button { grid-column: 2; justify-self: start; }
  .shiin-permission-state { grid-column: 3; grid-row: 1; }
}
@media(max-width:599px) {
  .shiin-titlebar { height: 48px; flex-basis: 48px; padding-right: 8px; gap: 8px; }
  .shiin-titlebar[data-mac="false"] { padding-left: 16px; }
  .shiin-titlebar[data-mac="true"] { padding-left: 76px; }
  .shiin-titlebar__status, .shiin-titlebar__compact-hide { display: none; }
  .shiin-titlebar__mark { width: 24px; height: 24px; }
  .shiin-titlebar__version { font-size: 11px; }
  .shiin-titlebar__actions { gap: 0; }
  .shiin-titlebar-button { min-width: 32px; padding: 0 6px; }
  .shiin-window-controls { gap: 0; }
  .shiin-window-button { width: 28px; }
  .shiin-tabs { padding: 0 16px; gap: 0; }
  .shiin-tabs > button { min-width: 0; flex: 1; height: 56px; }
  .shiin-tab-indicator { left: 24px; right: 24px; }
  .shiin-node .shiin-bento .sb-page { padding: 24px 16px 32px; }
  .shiin-node .shiin-bento .sb-grid { gap: 16px; }
  .shiin-node .shiin-bento .sb-tile { padding: 20px; border-radius: 28px; }
  .shiin-node .shiin-bento .sb-tile-head h3 { font-size: 21px; }
  .shiin-node .shiin-bento .sb-capture-tile { padding: 20px 16px; }
  .shiin-node .shiin-bento .sb-folder-row .sb-path-chip { flex-basis: 100%; }
  .shiin-node .shiin-bento .sb-folder-action { flex: 1; min-height: 48px; }
  .shiin-capture-desk { grid-template-columns: minmax(0,1fr); gap: 16px; padding: 0 4px 8px; }
  .shiin-capture-desk h1 { font-size: 32px; margin-bottom: 12px; }
  .shiin-capture-context { flex-wrap: wrap; gap: 8px; font-size: 13px; }
  .shiin-capture-context > span:first-of-type { max-width: 28ch; }
  .shiin-capture-context__output { margin-left: 0; padding-left: 8px; }
  .shiin-capture-desk > .shiin-shutter, .shiin-desk-actions { display: none; }
  .shiin-permission-notice { font-size: 13px!important; padding: 12px; flex-wrap: wrap; }
  .shiin-permission-notice > strong { margin-left: 0; }
  .shiin-permission-notice > .app-icon:last-child { margin-left: auto; }
  .shiin-capture-feedback { flex-wrap: wrap; font-size: 13px; }
  .shiin-mobile-toolbar { display: flex; flex: none; width: 100%; align-items: center; gap: 8px; padding: 12px 16px max(12px, env(safe-area-inset-bottom)); min-height: 80px; background: var(--shiin-surface); border-top: 1px solid var(--shiin-line-soft); z-index: 20; }
  .shiin-mobile-toolbar > button { display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 2px; width: 56px; height: 56px; border: 0; border-radius: 20px; background: var(--shiin-surface-low); font-size: 13px; }
  .shiin-mobile-toolbar > .shiin-mobile-capture { flex: 1; width: auto; flex-direction: row; gap: 8px; background: var(--shiin-accent); color: var(--shiin-on-accent); border-radius: 28px; font-size: 17px; font-weight: 800; }
  .shiin-mobile-toolbar > button[aria-pressed="true"] { background: var(--shiin-accent-soft); }
  .shiin-node .shiin-bento .sb-target-group button { padding: 0 8px; font-size: 13px; }
  .shiin-node .shiin-bento .sb-target-group .app-icon { width: 16px; height: 16px; }
  .shiin-node .shiin-bento .sb-toggle:first-child { border-radius: 24px 24px 8px 8px; }
  .shiin-node .shiin-bento .sb-toggle:last-child { border-radius: 8px 8px 24px 24px; }
  .shiin-node .shiin-bento .sb-masthead h2 { font-size: 32px; }
  .shiin-node .shiin-bento .sb-masthead { gap: 12px; }
  .shiin-node .shiin-bento .sb-save-state { padding: 0; }
  .shiin-permission-settings summary { gap: 8px; padding: 20px; flex-wrap: wrap; }
  .shiin-permission-heading { flex: 1; }
  .shiin-permission-heading strong { font-size: 19px; }
  .shiin-permission-summary { order: 3; flex-basis: 100%; margin-left: 34px; font-size: 13px; }
  .shiin-permission-content { padding: 0 12px 16px; }
  .shiin-permission-intro { padding: 0 8px; flex-wrap: wrap; gap: 8px; }
  .shiin-permission-intro p { font-size: 13px; }
  .shiin-permission-row { grid-template-columns: 32px minmax(0,1fr) auto; gap: 8px; padding: 16px 12px; }
  .shiin-permission-row__icon { width: 32px; height: 32px; border-radius: 12px; }
  .shiin-permission-row__copy > span { line-height: 1.65; }
  .shiin-permission-state { font-size: 12px; align-self: start; padding-top: 3px; }
  .shiin-permission-footer { flex-wrap: wrap; padding: 16px 8px 0; gap: 8px; }
  .shiin-permission-preview { flex-wrap: wrap; padding: 0 8px; }
}
@media(prefers-reduced-motion:reduce) {
  .shiin-shell *, .shiin-shell *::before, .shiin-shell *::after, .shiin-panel * { animation: none!important; transition: none!important; scroll-behavior: auto!important; }
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
