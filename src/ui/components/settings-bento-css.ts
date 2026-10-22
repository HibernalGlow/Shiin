export const SETTINGS_BENTO_CSS = String.raw`
/* Workspace (工作台) Bento layout */
.shiin-bento .sb-capture-hero {
  grid-column: span 8;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 250px;
  gap: 18px;
  align-items: center;
  min-height: 360px;
  padding: 32px;
  background: var(--sb-primary-container);
  border-color: transparent;
}
.shiin-bento .sb-capture-copy { min-width: 0; }
.shiin-bento .sb-capture-copy .sb-eyebrow { color: var(--sb-on-primary-container); opacity: .62; }
.shiin-bento .sb-capture-copy h2 {
  margin: 0;
  font-size: 72px;
  line-height: .92;
  font-weight: 600;
  letter-spacing: -3px;
  color: var(--sb-on-primary-container);
}
.shiin-bento .sb-capture-copy .sb-lede {
  max-width: 38ch;
  margin: 10px 0 0;
  color: color-mix(in srgb, var(--sb-on-primary-container) 76%, transparent);
}
.shiin-bento .sb-capture-status { display: flex; flex-wrap: wrap; gap: 6px; margin: 14px 0 18px; }
.shiin-bento .sb-capture-status .sb-status-chip {
  background: rgba(0, 0, 0, .28);
  border-color: transparent;
  color: var(--sb-on-primary-container);
}
.shiin-bento .sb-capture-status .sb-status-chip.warn i { background: var(--sb-error); }
.shiin-bento .sb-capture-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.shiin-bento .sb-capture-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 72px;
  padding: 0 30px;
  border: 0;
  border-radius: 28px;
  background: var(--sb-primary);
  color: var(--sb-on-primary);
  font-size: 18px;
  font-weight: 700;
  transition: border-radius 320ms var(--sb-spring-default), transform 240ms var(--sb-spring-fast), background-color 180ms var(--sb-effects);
}
.shiin-bento .sb-capture-primary:hover { background: color-mix(in srgb, var(--sb-primary) 88%, #000); }
.shiin-bento .sb-capture-primary:active { border-radius: 999px; transform: scale(.96); }
.shiin-bento .sb-cta-icon {
  position: relative;
  width: 30px;
  height: 30px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--sb-primary);
}
.shiin-bento .sb-cta-icon-shape {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  fill: var(--sb-on-primary);
  pointer-events: none;
}
.shiin-bento .sb-cta-icon .app-icon { position: relative; }
.shiin-bento .sb-capture-art { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.shiin-bento .sb-capture-orb {
  position: relative;
  width: 210px;
  height: 210px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--sb-on-primary);
  cursor: pointer;
  transition: transform 320ms var(--sb-spring-default);
}
.shiin-bento .sb-capture-shape {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  fill: var(--sb-primary);
  transition: transform 320ms var(--sb-spring-default), fill 180ms var(--sb-effects);
}
.shiin-bento .sb-capture-orb .app-icon { position: relative; width: 38px; height: 38px; stroke-width: 1.6; }
.shiin-bento .sb-capture-orb:hover .sb-capture-shape { transform: rotate(-5deg) scale(1.05); }
.shiin-bento .sb-capture-orb:active { transform: scale(.94); }
.shiin-bento .sb-capture-orb:active .sb-capture-shape { transform: scale(.9) rotate(-8deg); }
.shiin-bento .sb-capture-shape-label {
  font-size: 12px;
  letter-spacing: .14em;
  font-weight: 700;
  color: var(--sb-on-primary-container);
  opacity: .72;
}
.shiin-bento .sb-capture-hint { font-size: 12px; color: var(--sb-on-primary-container); opacity: .55; }
.shiin-bento .sb-hero-session {
  position: relative;
  overflow: hidden;
  grid-column: span 4;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px;
  background: var(--sb-surface-low);
}
.shiin-bento .sb-session-ghost {
  position: absolute;
  width: 260px;
  height: 260px;
  right: -72px;
  bottom: -84px;
  fill: none;
  stroke: color-mix(in srgb, var(--sb-tertiary) 16%, transparent);
  stroke-width: 1.5;
  transform: rotate(16deg);
  pointer-events: none;
}
.shiin-bento .sb-session-focus .sb-session-orb.is-searching {
  width: 72px;
  height: 72px;
  color: var(--sb-on-primary);
}
.shiin-bento .sb-session-orb.is-searching .sb-mask { fill: var(--sb-primary); }
.shiin-bento .sb-session-orb.is-searching::after {
  content: "";
  position: absolute;
  inset: -6px;
  border: 1px solid color-mix(in srgb, var(--sb-primary) 38%, transparent);
  border-radius: 50%;
  animation: sb-session-pulse 2.2s var(--sb-effects) infinite;
}
@keyframes sb-session-pulse {
  0% { transform: scale(.94); opacity: .8; }
  70% { transform: scale(1.16); opacity: 0; }
  100% { transform: scale(1.16); opacity: 0; }
}
.shiin-bento .sb-session-device {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 20px;
  background: var(--sb-surface);
}
.shiin-bento .sb-session-orb {
  position: relative;
  width: 52px;
  height: 52px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--sb-on-primary-container);
}
.shiin-bento .sb-session-orb .sb-mask { fill: var(--sb-primary-container); }
.shiin-bento .sb-session-orb .app-icon { position: relative; width: 20px; height: 20px; }
.shiin-bento .sb-session-device strong { display: block; font-size: 13.5px; }
.shiin-bento .sb-session-device small { display: block; margin-top: 2px; font-size: 11.5px; color: var(--sb-muted); }
.shiin-bento .sb-hero-session .sb-row { padding: 8px 0; }
.shiin-bento .sb-hero-session .sb-row-copy strong { font-size: 12px; }
.shiin-bento .sb-hero-session .sb-row > span { font-size: 12px; color: var(--sb-muted-strong); }
.shiin-bento .sb-hero-session .sb-action-risk { width: 100%; justify-content: center; margin-top: 4px; }
.shiin-bento .sb-hero-session .sb-note { margin-top: 2px; }
.shiin-bento .sb-action-tile {
  grid-column: span 12;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 16px 20px;
}
.shiin-bento .sb-stat-tile {
  grid-column: span 3;
  display: grid;
  gap: 4px;
  padding: 16px 18px;
}
.shiin-bento .sb-stat-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 28px;
  line-height: 1.15;
  font-weight: 500;
  letter-spacing: -.8px;
  color: var(--sb-primary);
}
.shiin-bento .sb-stat-label {
  font-size: 11.5px;
  color: var(--sb-muted);
}
.shiin-bento .sb-capture-tile { grid-column: span 7; }
.shiin-bento .sb-combos-tile {
  position: relative;
  overflow: hidden;
  grid-column: span 5;
}
.shiin-bento .sb-combos-tile > :not(.sb-combo-ghost) {
  position: relative;
  z-index: 1;
}
.shiin-bento .sb-combo-ghost {
  position: absolute;
  width: 220px;
  height: 220px;
  right: -76px;
  bottom: -70px;
  fill: none;
  stroke: color-mix(in srgb, var(--sb-tertiary) 15%, transparent);
  stroke-width: 1.5;
  transform: rotate(12deg);
  pointer-events: none;
}
.shiin-bento .sb-listener-tile { grid-column: span 7; }
.shiin-bento .sb-tester-tile { grid-column: span 5; }
.shiin-bento .sb-action-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 20px;
  border: 0;
  border-radius: 999px;
  background: var(--sb-primary);
  color: var(--sb-on-primary);
  font-size: 14px;
  font-weight: 700;
  transition: border-radius 320ms var(--sb-spring-default), transform 240ms var(--sb-spring-fast), background-color 180ms var(--sb-effects);
}
.shiin-bento .sb-action-primary:active { border-radius: 14px; transform: scale(.96); }
.shiin-bento .sb-action-secondary {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid var(--sb-outline);
  border-radius: 999px;
  background: transparent;
  color: var(--sb-text);
  font-size: 13px;
  font-weight: 600;
  transition: background-color 180ms var(--sb-effects), border-radius 320ms var(--sb-spring-default), transform 240ms var(--sb-spring-fast);
}
.shiin-bento .sb-action-secondary:hover { background: var(--sb-surface-high); }
.shiin-bento .sb-action-secondary:active { border-radius: 14px; transform: scale(.96); }
.shiin-bento .sb-action-risk {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid rgba(186, 26, 26, .24);
  border-radius: 999px;
  background: rgba(186, 26, 26, .07);
  color: var(--sb-error);
  font-size: 13px;
  font-weight: 600;
}
.shiin-bento .sb-status-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 32px;
  padding: 0 11px;
  border-radius: 999px;
  background: var(--sb-surface);
  border: 1px solid var(--sb-outline-soft);
  color: var(--sb-muted-strong);
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
}
.shiin-bento .sb-status-chip i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--sb-muted);
}
.shiin-bento .sb-status-chip.on i { background: var(--sb-tertiary); }
.shiin-bento .sb-status-chip.warn i { background: var(--sb-error); }
.shiin-bento .sb-combo-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.shiin-bento .sb-combo-key {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 10px;
  border-radius: 12px;
  background: var(--sb-surface-low);
  border: 1px solid var(--sb-outline-soft);
  font-size: 12px;
  font-weight: 650;
}
.shiin-bento .sb-combo-key .sb-key-code {
  font-family: var(--sb-mono, "SFMono-Regular", Menlo, monospace);
  font-size: 12px;
}
.shiin-bento .sb-combo-key button {
  width: 18px;
  height: 18px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--sb-surface-high);
  color: var(--sb-muted);
  display: grid;
  place-items: center;
}
.shiin-bento .sb-combo-key button:hover { background: var(--sb-error); color: #fff; }
.shiin-bento .sb-preset-strip { display: grid; gap: 7px; margin-top: 14px; }
.shiin-bento .sb-preset-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.shiin-bento .sb-preset-chip {
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid var(--sb-outline-soft);
  border-radius: 999px;
  background: var(--sb-surface-low);
  color: var(--sb-muted-strong);
  font-size: 11.5px;
  font-weight: 600;
  transition: background-color 180ms var(--sb-effects), color 180ms var(--sb-effects), border-color 180ms var(--sb-effects);
}
.shiin-bento .sb-preset-chip:hover {
  background: var(--sb-surface-high);
  border-color: var(--sb-outline);
  color: var(--sb-text);
}
.shiin-bento .sb-preset-chip[aria-pressed="true"] {
  background: var(--sb-secondary);
  border-color: transparent;
  color: var(--sb-on-secondary);
}
.shiin-bento .sb-preset-row { display: flex; flex-wrap: wrap; gap: 6px; }
.shiin-bento .sb-preset {
  min-height: 32px;
  padding: 0 10px;
  border: 1px solid var(--sb-outline-soft);
  border-radius: 999px;
  background: var(--sb-surface);
  color: var(--sb-muted-strong);
  font-size: 11px;
  font-weight: 600;
}
.shiin-bento .sb-preset:hover { background: var(--sb-surface-high); color: var(--sb-text); border-color: var(--sb-outline); }
.shiin-bento .sb-test-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(44px, 1fr)); gap: 6px; }
.shiin-bento .sb-test-key {
  min-height: 42px;
  padding: 4px 2px;
  border-radius: 12px;
  background: var(--sb-surface-low);
  border: 1px solid var(--sb-outline-soft);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  font-family: var(--sb-mono, "SFMono-Regular", Menlo, monospace);
  font-size: 9.5px;
  color: var(--sb-muted);
  transition: background-color 80ms linear, color 80ms linear, transform 80ms var(--sb-spring-fast);
}
.shiin-bento .sb-test-key strong { font-size: 10px; color: var(--sb-muted-strong); }
.shiin-bento .sb-test-key.pressed {
  background: var(--sb-primary);
  border-color: var(--sb-primary);
  color: var(--sb-on-primary);
  transform: scale(1.04);
}
.shiin-bento .sb-test-key.pressed strong { color: var(--sb-on-primary); }
.shiin-bento .sb-axis-row {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) 34px;
  align-items: center;
  gap: 8px;
  font-size: 10.5px;
  color: var(--sb-muted);
}
.shiin-bento .sb-axis-track {
  position: relative;
  height: 6px;
  border-radius: 999px;
  background: var(--sb-surface-highest);
  overflow: hidden;
}
.shiin-bento .sb-axis-fill {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  background: var(--sb-primary);
  border-radius: 999px;
}
.shiin-bento .sb-output-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.shiin-bento .sb-field {
  display: grid;
  gap: 5px;
}
.shiin-bento .sb-field-label {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: .08em;
  color: var(--sb-muted);
}
.shiin-bento .sb-input {
  width: 100%;
  min-width: 0;
  height: 34px;
  padding: 0 10px;
  border: 1px solid var(--sb-outline);
  border-radius: 10px;
  background: var(--sb-surface);
  color: var(--sb-text);
  font: inherit;
  font-size: 12px;
  outline: none;
}
.shiin-bento .sb-input:focus { border-color: var(--sb-primary); }
.shiin-bento .sb-path {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 9px 11px;
  border-radius: 10px;
  background: var(--sb-surface-low);
  color: var(--sb-muted-strong);
  font-family: var(--sb-mono, "SFMono-Regular", Menlo, monospace);
  font-size: 11px;
}
.shiin-bento .sb-note {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--sb-muted);
}
.shiin-bento .sb-note.warn { color: var(--sb-error); }
.shiin-bento .sb-divider {
  height: 1px;
  background: var(--sb-outline-soft);
  margin: 12px 0;
}
.shiin-bento .sb-loading-blob {
  display: inline-grid;
  place-items: center;
  flex: none;
}
.shiin-bento .sb-loading-blob svg {
  width: 100%;
  height: 100%;
  overflow: visible;
  fill: var(--sb-primary);
  animation: sb-blob-rotate 3.2s linear infinite;
}
.shiin-bento .sb-loading-blob path {
  transition: d 650ms cubic-bezier(.34, 1.56, .64, 1);
}
@keyframes sb-blob-rotate {
  to { transform: rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  .shiin-bento .sb-loading-blob svg { animation: none; }
  .shiin-bento .sb-loading-blob path { transition: none; }
}
.shiin-bento .sb-masthead-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.shiin-bento .sb-sheet-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.shiin-bento .sb-sheet-title {
  font-size: 11px;
  letter-spacing: .16em;
  font-weight: 700;
  color: var(--sb-muted);
}

/* Expressive workspace components */
.shiin-bento .sb-session-focus {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 6px 0 4px;
}
.shiin-bento .sb-session-focus .sb-session-orb { width: 64px; height: 64px; }
.shiin-bento .sb-session-focus .sb-session-orb .app-icon { width: 24px; height: 24px; }
.shiin-bento .sb-session-copy { display: grid; gap: 2px; min-width: 0; }
.shiin-bento .sb-session-copy .sb-eyebrow { margin: 0; font-size: 10px; color: var(--sb-muted); }
.shiin-bento .sb-session-copy strong {
  font-size: 24px;
  line-height: 1.08;
  letter-spacing: -.7px;
  color: var(--sb-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.shiin-bento .sb-session-copy small { font-size: 11.5px; color: var(--sb-muted); }
.shiin-bento .sb-session-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0 10px; }
.shiin-bento .sb-session-actions { display: flex; width: 100%; gap: 3px; padding: 3px; }
.shiin-bento .sb-session-actions button { flex: 1; min-height: 40px; justify-content: center; padding: 0 8px; }
.shiin-bento .sb-session-actions.has-alert button:first-child { color: var(--sb-error); }

.shiin-bento .sb-metric-carousel {
  grid-column: span 12;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding: 2px 2px 6px;
}
.shiin-bento .sb-metric-carousel::-webkit-scrollbar { display: none; }
.shiin-bento .sb-metric {
  --metric-color: var(--sb-primary);
  flex: 1 0 200px;
  min-height: 132px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 4px;
  padding: 18px;
  border-radius: 30px;
  background: var(--sb-surface);
  border: 1px solid var(--sb-outline-soft);
  scroll-snap-align: start;
  transition: flex-grow 360ms var(--sb-spring-default), background-color 180ms var(--sb-effects), border-color 180ms var(--sb-effects);
}
.shiin-bento .sb-metric:first-child { flex: 1.45 0 280px; }
.shiin-bento .sb-metric[data-tone="secondary"] { --metric-color: var(--sb-secondary); }
.shiin-bento .sb-metric[data-tone="tertiary"] { --metric-color: var(--sb-tertiary); }
.shiin-bento .sb-metric:hover { flex-grow: 1.7; background: var(--sb-surface-low); border-color: var(--sb-outline); }
.shiin-bento .sb-metric-shape {
  position: relative;
  width: 34px;
  height: 34px;
  margin-bottom: auto;
}
.shiin-bento .sb-metric-shape .sb-mask { fill: var(--metric-color); }
.shiin-bento .sb-metric-shape svg { width: 100%; height: 100%; fill: var(--metric-color); }
.shiin-bento .sb-metric-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 28px;
  line-height: 1.05;
  font-weight: 500;
  letter-spacing: -.8px;
  color: var(--metric-color);
}
.shiin-bento .sb-metric-label { font-size: 11.5px; color: var(--sb-muted); }

.shiin-bento .sb-target-group {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 30px;
  background: var(--sb-surface-low);
}
.shiin-bento .sb-target-group button {
  flex: 1;
  min-width: 0;
  min-height: 56px;
  padding: 0 14px;
  border: 0;
  border-radius: 26px;
  background: transparent;
  color: var(--sb-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 650;
  white-space: nowrap;
  transition: flex-grow 360ms var(--sb-spring-default), background-color 180ms var(--sb-effects), color 180ms var(--sb-effects), border-radius 320ms var(--sb-spring-default);
}
.shiin-bento .sb-target-group button[aria-pressed="true"] {
  flex: 1.4;
  background: var(--sb-primary);
  color: var(--sb-on-primary);
  border-radius: 28px;
}
.shiin-bento .sb-target-group button:hover:not([aria-pressed="true"]) {
  background: var(--sb-surface-high);
  color: var(--sb-text);
}

.shiin-bento .sb-source-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 22px;
  background: var(--sb-surface-low);
  border: 1px solid var(--sb-outline-soft);
}
.shiin-bento .sb-source-icon {
  width: 40px;
  height: 40px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: var(--sb-surface-high);
  color: var(--sb-primary);
}
.shiin-bento .sb-source-copy { flex: 1; min-width: 0; display: grid; gap: 2px; }
.shiin-bento .sb-source-select {
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--sb-text);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  outline: none;
}
.shiin-bento .sb-source-value { font-size: 14px; font-weight: 600; color: var(--sb-text); }
.shiin-bento .sb-icon-button {
  width: 40px;
  height: 40px;
  flex: none;
  display: grid;
  place-items: center;
  border: 1px solid var(--sb-outline-soft);
  border-radius: 14px;
  background: var(--sb-surface-high);
  color: var(--sb-text);
  transition: border-radius 320ms var(--sb-spring-default), color 180ms var(--sb-effects);
}
.shiin-bento .sb-icon-button:hover { border-radius: 50%; color: var(--sb-primary); }

.shiin-bento .sb-output-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.shiin-bento .sb-chip-group {
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  border-radius: 999px;
  background: var(--sb-surface-low);
}
.shiin-bento .sb-chip-group button {
  min-height: 38px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--sb-muted);
  font-size: 12px;
  font-weight: 700;
}
.shiin-bento .sb-chip-group button[aria-pressed="true"] {
  background: var(--sb-primary);
  color: var(--sb-on-primary);
}
.shiin-bento .sb-chip-select {
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--sb-outline-soft);
  border-radius: 999px;
  background: var(--sb-surface-low);
  color: var(--sb-text);
  font-size: 12px;
  outline: none;
}
.shiin-bento .sb-chip-input {
  flex: 1;
  min-width: 180px;
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--sb-outline-soft);
  border-radius: 999px;
  background: var(--sb-surface-low);
  color: var(--sb-text);
  font-size: 12px;
  outline: none;
}
.shiin-bento .sb-chip-input:focus, .shiin-bento .sb-chip-select:focus { border-color: var(--sb-primary); }
.shiin-bento .sb-folder-row { display: flex; align-items: center; gap: 6px; margin-top: 10px; }
.shiin-bento .sb-path-chip {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 999px;
  background: var(--sb-surface-low);
  color: var(--sb-muted-strong);
  font-family: var(--sb-mono, "SFMono-Regular", Menlo, monospace);
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.shiin-bento .sb-path-chip span { overflow: hidden; text-overflow: ellipsis; }

.shiin-bento .sb-split-wrap { position: relative; margin-top: 12px; }
.shiin-bento .sb-split-button { display: flex; gap: 2px; }
.shiin-bento .sb-split-main {
  flex: 1;
  min-height: 52px;
  padding: 0 18px;
  border: 0;
  border-radius: 26px 6px 6px 26px;
  background: var(--sb-primary);
  color: var(--sb-on-primary);
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: border-radius 320ms var(--sb-spring-default), transform 240ms var(--sb-spring-fast);
}
.shiin-bento .sb-split-trail {
  width: 52px;
  min-height: 52px;
  border: 0;
  border-radius: 6px 26px 26px 6px;
  background: var(--sb-primary-container);
  color: var(--sb-on-primary-container);
  display: grid;
  place-items: center;
  transition: border-radius 320ms var(--sb-spring-default), transform 240ms var(--sb-spring-fast);
}
.shiin-bento .sb-split-main:active, .shiin-bento .sb-split-trail:active { border-radius: 16px; transform: scale(.97); }
.shiin-bento .sb-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 60;
  display: grid;
  gap: 2px;
  padding: 6px;
  border-radius: 20px;
  background: var(--sb-surface-high);
  border: 1px solid var(--sb-outline-soft);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.5);
}
.shiin-bento .sb-menu button {
  min-height: 44px;
  padding: 0 12px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: var(--sb-text);
  text-align: left;
  font-size: 12.5px;
}
.shiin-bento .sb-menu button:hover { background: var(--sb-surface-highest); }
.shiin-bento .sb-menu button.is-danger { color: var(--sb-error); }
.shiin-bento .sb-menu-divider { height: 1px; background: var(--sb-outline-soft); margin: 4px 2px; }

.shiin-bento .sb-toggle-group {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
  padding: 4px;
  margin-top: 10px;
  border-radius: 28px;
  background: var(--sb-surface-low);
}
.shiin-bento .sb-toggle {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  min-height: 100px;
  padding: 14px;
  border: 0;
  border-radius: 24px;
  background: transparent;
  color: var(--sb-muted);
  text-align: left;
  transition: background-color 180ms var(--sb-effects), color 180ms var(--sb-effects), border-radius 320ms var(--sb-spring-default), transform 240ms var(--sb-spring-fast);
}
.shiin-bento .sb-toggle:hover { background: var(--sb-surface-high); color: var(--sb-text); }
.shiin-bento .sb-toggle[aria-pressed="true"] {
  background: var(--sb-primary);
  color: var(--sb-on-primary);
  border-radius: 28px;
}
.shiin-bento .sb-toggle-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--sb-surface-high);
  color: var(--sb-primary);
}
.shiin-bento .sb-toggle[aria-pressed="true"] .sb-toggle-icon {
  background: rgba(0, 0, 0, 0.16);
  color: var(--sb-on-primary);
}
.shiin-bento .sb-toggle-copy strong { display: block; font-size: 13px; }
.shiin-bento .sb-toggle-copy small { display: block; margin-top: 2px; font-size: 10.5px; opacity: .8; }

.shiin-bento .sb-wavy-axis { display: block; min-width: 0; }
.shiin-bento .sb-wavy-axis svg { width: 100%; height: 22px; }
.shiin-bento .sb-axis-readout {
  justify-content: center;
  min-width: 54px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10.5px;
}
.shiin-bento .sb-tester-empty {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 18px 0;
}
.shiin-bento .sb-tester-orb {
  position: relative;
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  color: var(--sb-on-primary);
}
.shiin-bento .sb-tester-orb .sb-mask { fill: var(--sb-primary); }
.shiin-bento .sb-tester-orb .app-icon { position: relative; }
.shiin-bento .sb-keyboard-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 20px;
  background: var(--sb-surface-high);
}
.shiin-bento .sb-keyboard-row .sb-toggle-icon {
  background: var(--sb-surface-low);
  color: var(--sb-primary);
}
.shiin-bento .sb-keyboard-row .sb-row-copy { flex: 1; min-width: 0; }
.shiin-bento .sb-test-key {
  border-radius: 16px;
  transition: background-color 90ms linear, color 90ms linear, border-radius 320ms var(--sb-spring-default), transform 240ms var(--sb-spring-fast);
}
.shiin-bento .sb-test-key.pressed { border-radius: 50%; transform: scale(1.06); }

/* Self-drawn select menu (ADR-0007: no native selects) */
.shiin-bento .sb-select-control { position: relative; min-width: 0; }
.shiin-bento .sb-select-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--sb-outline-soft);
  border-radius: 999px;
  background: var(--sb-surface-low);
  color: var(--sb-text);
  font: inherit;
  font-size: 12.5px;
  font-weight: 650;
  cursor: pointer;
  transition: border-color 180ms var(--sb-effects), background-color 180ms var(--sb-effects), border-radius 320ms var(--sb-spring-default);
}
.shiin-bento .sb-select-button:hover { border-color: var(--sb-outline); background: var(--sb-surface-high); }
.shiin-bento .sb-select-button[data-variant="chip"] { height: 44px; padding: 0 14px; font-size: 12px; }
.shiin-bento .sb-select-button[data-variant="inline"] {
  height: 30px;
  padding: 0;
  border: 0;
  background: transparent;
  border-radius: 8px;
  justify-content: flex-start;
  font-size: 14px;
}
.shiin-bento .sb-select-button[data-variant="notify"] {
  border-color: var(--sb-outline-soft);
  background: var(--sb-surface-high);
  color: var(--sb-text);
}
.shiin-bento .sb-select-value { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.shiin-bento .sb-select-popover {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 100%;
  max-height: 320px;
  overflow-y: auto;
  z-index: 80;
  display: grid;
  gap: 2px;
  padding: 6px;
  border-radius: 20px;
  background: var(--sb-surface-high);
  border: 1px solid var(--sb-outline-soft);
  box-shadow: 0 18px 40px rgba(0, 0, 0, .5);
}
.shiin-bento .sb-select-popover button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
  padding: 8px 12px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: var(--sb-text);
  font: inherit;
  font-size: 12.5px;
  text-align: left;
  cursor: pointer;
}
.shiin-bento .sb-select-popover button:hover { background: var(--sb-surface-highest); }
.shiin-bento .sb-select-popover button.is-selected {
  background: var(--sb-primary-container);
  color: var(--sb-on-primary-container);
}
.shiin-bento .sb-select-popover strong { display: block; font-weight: 650; }
.shiin-bento .sb-select-popover small { display: block; margin-top: 2px; font-size: 10.5px; color: var(--sb-muted); }
.shiin-bento .sb-select-popover .is-selected small { color: color-mix(in srgb, var(--sb-on-primary-container) 72%, transparent); }

.shiin-bento .sb-toggle-group--two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.shiin-bento .sb-settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 10px;
}
.shiin-bento .sb-setting-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--sb-outline-soft);
}
.shiin-bento .sb-notify-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 64px;
  margin-top: 10px;
  padding: 10px 12px;
  border: 0;
  border-radius: 20px;
  background: var(--sb-surface-high);
  color: var(--sb-text);
  text-align: left;
  transition: background-color 180ms var(--sb-effects), color 180ms var(--sb-effects), border-radius 320ms var(--sb-spring-default);
}
.shiin-bento .sb-notify-toggle[aria-pressed="true"] {
  background: var(--sb-tertiary);
  color: var(--sb-on-tertiary);
  border-radius: 24px;
}
.shiin-bento .sb-notify-toggle .sb-toggle-icon {
  background: var(--sb-surface-highest);
  color: var(--sb-text);
}
.shiin-bento .sb-notify-toggle[aria-pressed="true"] .sb-toggle-icon {
  background: rgba(0, 0, 0, .14);
  color: var(--sb-on-tertiary);
}
.shiin-bento .sb-notify-toggle .sb-toggle-copy { flex: 1; }
.shiin-bento .sb-notify-track {
  width: 52px;
  height: 30px;
  flex: none;
  display: flex;
  align-items: center;
  padding: 3px;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 16%, transparent);
}
.shiin-bento .sb-notify-thumb {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--sb-muted-strong);
  color: var(--sb-surface-low);
  transform: translateX(0);
  transition: transform 320ms var(--sb-spring-default), background-color 180ms var(--sb-effects), color 180ms var(--sb-effects);
}
.shiin-bento .sb-notify-track[data-on="true"] .sb-notify-thumb {
  transform: translateX(22px);
  background: var(--sb-on-tertiary);
  color: var(--sb-tertiary);
}
.shiin-bento .sb-notify-thumb .app-icon {
  width: 13px;
  height: 13px;
  opacity: 0;
  transition: opacity 160ms var(--sb-effects);
}
.shiin-bento .sb-notify-track[data-on="true"] .sb-notify-thumb .app-icon { opacity: 1; }
.shiin-bento .sb-notify-select-control { width: 100%; margin-top: 10px; }
.shiin-bento .sb-notify-position-field { display: grid; gap: 5px; margin-top: 10px; }
.shiin-bento .sb-notify-position-field .sb-notify-select-control { margin-top: 0; }
.shiin-bento .sb-language-select { width: 160px; max-width: 100%; }
.shiin-bento .sb-source-select-control { width: 100%; }
.shiin-bento .sb-save-way-select { min-width: 140px; }
.shiin-bento .sb-gamepad-select { width: 100%; }

/* Permissions center */
.shiin-bento .sb-permission-hero {
  grid-column: span 12;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 24px;
  align-items: center;
  min-height: 300px;
  padding: 30px;
  background: var(--sb-primary-container);
  border-color: transparent;
}
.shiin-bento .sb-permission-hero[data-state="ready"] { background: var(--sb-tertiary-container); }
.shiin-bento .sb-permission-hero-copy .sb-eyebrow { color: color-mix(in srgb, var(--sb-on-primary-container) 62%, transparent); }
.shiin-bento .sb-permission-count { display: flex; align-items: baseline; gap: 10px; }
.shiin-bento .sb-permission-count strong {
  font-size: 84px;
  line-height: .8;
  font-weight: 600;
  letter-spacing: -4px;
  color: var(--sb-on-primary-container);
}
.shiin-bento .sb-permission-count span { font-size: 18px; color: color-mix(in srgb, var(--sb-on-primary-container) 72%, transparent); }
.shiin-bento .sb-permission-hero[data-state="ready"] .sb-permission-count strong,
.shiin-bento .sb-permission-hero[data-state="ready"] .sb-permission-count span { color: var(--sb-on-tertiary-container); }
.shiin-bento .sb-permission-hero .sb-action-primary {
  min-height: 56px;
  padding: 0 24px;
  font-size: 15px;
}
.shiin-bento .sb-permission-hero .sb-action-secondary {
  min-height: 48px;
  padding: 0 20px;
  font-size: 13.5px;
}
.shiin-bento .sb-permission-wave { max-width: 460px; height: 24px; margin: 16px 0 18px; }
.shiin-bento .sb-permission-wave svg { width: 100%; height: 24px; }
.shiin-bento .sb-permission-hero .sb-note { color: color-mix(in srgb, var(--sb-on-primary-container) 72%, transparent); }
.shiin-bento .sb-permission-hero-art { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.shiin-bento .sb-permission-orb {
  position: relative;
  width: 200px;
  height: 200px;
  display: grid;
  place-items: center;
  color: var(--sb-on-primary);
}
.shiin-bento .sb-permission-orb .sb-mask { position: absolute; inset: 0; width: 100%; height: 100%; fill: var(--sb-primary); }
.shiin-bento .sb-permission-orb .app-icon { position: relative; width: 38px; height: 38px; }
.shiin-bento .sb-permission-hero-art > span { font-size: 11px; letter-spacing: .14em; color: var(--sb-on-primary-container); opacity: .7; }
.shiin-bento .sb-perm-tile { grid-column: span 6; --perm-color: var(--sb-primary); }
.shiin-bento .sb-perm-tile[data-tone="tertiary"] { --perm-color: var(--sb-tertiary); }
.shiin-bento .sb-perm-tile[data-tone="secondary"] { --perm-color: var(--sb-secondary); }
.shiin-bento .sb-perm-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.shiin-bento .sb-perm-icon { position: relative; width: 46px; height: 46px; display: grid; place-items: center; color: #101014; }
.shiin-bento .sb-perm-icon .sb-mask { position: absolute; inset: 0; width: 100%; height: 100%; fill: var(--perm-color); }
.shiin-bento .sb-perm-icon .app-icon { position: relative; width: 19px; height: 19px; }
.shiin-bento .sb-perm-tile h3 { margin: 0 0 4px; font-size: 20px; font-weight: 600; letter-spacing: -.4px; }
.shiin-bento .sb-perm-tile p { margin: 0; font-size: 12.5px; line-height: 1.5; color: var(--sb-muted); }
.shiin-bento .sb-perm-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.shiin-bento .sb-perm-test,
.shiin-bento .sb-perm-folder { grid-column: span 6; }
.shiin-bento .sb-perm-test-body { display: grid; gap: 10px; margin-top: 12px; }
.shiin-bento .sb-perm-result { display: grid; gap: 8px; }
.shiin-bento .sb-perm-result img {
  width: 100%;
  max-height: 170px;
  object-fit: contain;
  border-radius: 16px;
  background: var(--sb-surface-lowest);
  border: 1px solid var(--sb-outline-soft);
}
.shiin-bento .sb-perm-hid {
  grid-column: span 12;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  background: var(--sb-surface-low);
}
.shiin-bento .sb-perm-hid-copy { display: grid; gap: 2px; }
.shiin-bento .sb-perm-hid-copy .sb-eyebrow { margin: 0; }
.shiin-bento .sb-perm-hid-copy strong { font-size: 18px; letter-spacing: -.3px; }
.shiin-bento .sb-perm-hid-copy small { font-size: 11.5px; color: var(--sb-muted); }
.shiin-bento .sb-perm-hid-actions { display: flex; gap: 6px; flex-wrap: wrap; }

@container node (max-width: 1080px) {
  .shiin-bento .sb-stat-tile { grid-column: span 6; }
  .shiin-bento .sb-capture-hero,
  .shiin-bento .sb-hero-session,
  .shiin-bento .sb-capture-tile,
  .shiin-bento .sb-combos-tile,
  .shiin-bento .sb-listener-tile,
  .shiin-bento .sb-tester-tile { grid-column: span 12; }
}
@container node (max-width: 860px) {
  .shiin-bento .sb-perm-tile,
  .shiin-bento .sb-perm-test,
  .shiin-bento .sb-metadata-tile,
  .shiin-bento .sb-hub-tile,
  .shiin-bento .sb-perm-folder { grid-column: span 12; }
}
@container node (max-width: 680px) {
  .shiin-bento .sb-stat-tile { grid-column: span 6; }
  .shiin-bento .sb-capture-hero {
    grid-template-columns: minmax(0, 1fr);
    padding: 20px;
    min-height: 0;
  }
  .shiin-bento .sb-capture-copy h2 { font-size: 46px; letter-spacing: -2px; }
  .shiin-bento .sb-metric { flex: 0 0 220px; }
  .shiin-bento .sb-metric:first-child { flex: 0 0 250px; }
  .shiin-bento .sb-target-group button { padding: 0 10px; font-size: 11.5px; }
  .shiin-bento .sb-toggle-group { grid-template-columns: 1fr; }
  .shiin-bento .sb-settings-grid { grid-template-columns: 1fr; }
  .shiin-bento .sb-permission-hero { grid-template-columns: minmax(0, 1fr); padding: 22px; }
  .shiin-bento .sb-permission-hero-art { display: none; }
  .shiin-bento .sb-permission-count strong { font-size: 64px; }
  .shiin-bento .sb-perm-hid { align-items: flex-start; flex-direction: column; }
  .shiin-bento .sb-toggle { min-height: 72px; flex-direction: row; align-items: center; }
  .shiin-bento .sb-output-row { align-items: stretch; }
  .shiin-bento .sb-chip-select,
  .shiin-bento .sb-chip-input { flex: 1 0 100%; width: 100%; min-width: 0; }
  .shiin-bento .sb-folder-row { flex-wrap: wrap; }
  .shiin-bento .sb-path-chip { flex: 1 0 100%; }
  .shiin-bento .sb-session-copy strong { font-size: 20px; }
  .shiin-bento .sb-capture-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .shiin-bento .sb-capture-primary { grid-column: 1 / -1; width: 100%; }
  .shiin-bento .sb-capture-art { padding-top: 4px; }
  .shiin-bento .sb-capture-orb { width: 160px; height: 160px; }
  .shiin-bento .sb-action-tile {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    padding: 14px;
  }
  .shiin-bento .sb-action-primary,
  .shiin-bento .sb-action-secondary,
  .shiin-bento .sb-action-risk { width: 100%; justify-content: center; }
  .shiin-bento .sb-action-tile .sb-note {
    grid-column: 1 / -1;
    margin-left: 0 !important;
    text-align: left;
  }
  .shiin-bento .sb-output-grid { grid-template-columns: 1fr; }
}
@container node (max-width: 430px) {
  .shiin-bento .sb-stat-tile { grid-column: span 12; }
}

.shiin-bento {
  --sb-bg: var(--shiin-ground, #f2f0e8);
  --sb-surface: var(--shiin-surface, #fbfaf4);
  --sb-surface-low: var(--shiin-surface-low, #e8e5d9);
  --sb-surface-high: var(--shiin-surface-high, #ded9c8);
  --sb-surface-highest: #d4cfbe;
  --sb-text: var(--shiin-ink, #343831);
  --sb-muted: var(--shiin-muted, #64685d);
  --sb-muted-strong: var(--shiin-muted-strong, #4c5148);
  --sb-outline: var(--shiin-line, #b9b9aa);
  --sb-outline-soft: var(--shiin-line-soft, #b9b9aa80);
  --sb-primary: var(--shiin-accent, #c8f000);
  --sb-on-primary: var(--shiin-on-accent, #273000);
  --sb-primary-container: var(--shiin-accent-soft, #e7f6a8);
  --sb-on-primary-container: var(--shiin-ink, #343831);
  --sb-secondary: var(--shiin-olive, #85864a);
  --sb-on-secondary: var(--shiin-on-olive, #fbf8df);
  --sb-secondary-container: var(--shiin-sand, #d0c6ad);
  --sb-on-secondary-container: var(--shiin-ink, #343831);
  --sb-tertiary: var(--shiin-red, #a72d3b);
  --sb-on-tertiary: var(--shiin-on-red, #fff5f2);
  --sb-tertiary-container: #f0c4bd;
  --sb-on-tertiary-container: #62151f;
  --sb-error: var(--shiin-red, #a72d3b);
  --sb-error-container: #f0c4bd;
  --sb-on-error-container: #62151f;
  --sb-spring-fast: cubic-bezier(.42, 1.67, .21, .9);
  --sb-spring-default: cubic-bezier(.38, 1.21, .22, 1);
  --sb-effects: cubic-bezier(.34, .8, .34, 1);
  --sb-font: "Google Sans", "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Segoe UI", system-ui, sans-serif;

  height: 100%;
  overflow-y: auto;
  background: var(--sb-bg);
  color: var(--sb-text);
  font-family: var(--sb-font);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
.shiin-bento *,
.shiin-bento *::before,
.shiin-bento *::after {
  box-sizing: border-box;
}
.shiin-bento button,
.shiin-bento input,
.shiin-bento select {
  font: inherit;
  color: inherit;
}
.shiin-bento button {
  cursor: pointer;
}
.shiin-bento .sb-page {
  width: min(1376px, 100%);
  margin: 0 auto;
  padding: 32px 40px 48px;
}
.shiin-bento .sb-masthead {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}
.shiin-bento .sb-eyebrow {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .18em;
  color: var(--sb-primary);
}
.shiin-bento .sb-masthead h2 {
  margin: 0;
  font-size: 64px;
  line-height: .98;
  font-weight: 500;
  letter-spacing: -2px;
}
.shiin-bento .sb-lede {
  max-width: 58ch;
  margin: 9px 0 0;
  font-size: 14.5px;
  line-height: 1.55;
  color: var(--sb-muted);
}
.shiin-bento .sb-save-state {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: none;
  padding: 9px 14px;
  border-radius: 999px;
  background: var(--sb-secondary-container);
  color: var(--sb-on-secondary-container);
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
}
.shiin-bento .sb-save-state i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--sb-tertiary);
}
.shiin-bento button:focus-visible,
.shiin-bento select:focus-visible,
.shiin-bento input:focus-visible {
  outline: 2px solid var(--sb-primary);
  outline-offset: 2px;
}

.shiin-bento .sb-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 18px;
  align-items: stretch;
}
.shiin-bento .sb-tile {
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--sb-outline-soft);
  border-radius: 32px;
  background: var(--sb-surface);
  scroll-margin-top: 16px;
}
.shiin-bento .sb-tile-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.shiin-bento .sb-tile-head h3 {
  margin: 0;
  font-size: 22px;
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: -.5px;
}
.shiin-bento .sb-tile-head p {
  margin: 5px 0 0;
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--sb-muted);
}
.shiin-bento .sb-chip {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--sb-secondary-container);
  color: var(--sb-on-secondary-container);
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
}
.shiin-bento .sb-chip.warn {
  background: var(--sb-error-container);
  color: var(--sb-on-error-container);
}
.shiin-bento .sb-chip.tertiary {
  background: var(--sb-tertiary-container);
  color: var(--sb-on-tertiary-container);
}

.shiin-bento .sb-shape-tile {
  grid-column: span 8;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
}
.shiin-bento .sb-shape-lab {
  display: grid;
  grid-template-columns: 230px minmax(0, 1fr);
  gap: 16px;
  flex: 1;
  min-height: 0;
}
.shiin-bento .sb-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px;
  border-radius: 26px;
  background: var(--sb-surface-low);
  overflow: hidden;
}
.shiin-bento .sb-stage::before {
  content: "";
  position: absolute;
  width: 184px;
  height: 184px;
  border-radius: 50%;
  background: var(--sb-primary-container);
  opacity: .5;
  transition: border-radius 400ms var(--sb-spring-default);
}
.shiin-bento .sb-stage-ghost {
  position: absolute;
  width: 212px;
  height: 212px;
  fill: none;
  stroke: color-mix(in srgb, var(--sb-tertiary) 22%, transparent);
  stroke-width: 1.5;
  transform: rotate(12deg) scale(1.06);
  pointer-events: none;
}
.shiin-bento .sb-hero-shape {
  position: relative;
  width: 132px;
  height: 132px;
  display: grid;
  place-items: center;
  color: var(--sb-on-primary-container);
}
.shiin-bento .sb-mask {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  fill: var(--sb-primary);
  transition: fill 180ms var(--sb-effects), transform 320ms var(--sb-spring-default);
}
.shiin-bento .sb-hero-shape .app-icon {
  position: relative;
  width: 46px;
  height: 46px;
  stroke-width: 1.5;
}
.shiin-bento .sb-stage-label {
  position: relative;
  font-size: 11.5px;
  letter-spacing: .14em;
  color: var(--sb-muted-strong);
  font-weight: 700;
  text-align: center;
}
.shiin-bento .sb-stage-role {
  position: relative;
  font-size: 10.5px;
  line-height: 1.35;
  color: var(--sb-muted);
  text-align: center;
}
.shiin-bento .sb-role-picker { display: grid; gap: 6px; }
.shiin-bento .sb-role-list {
  display: grid;
  gap: 4px;
  padding: 4px;
  border-radius: 22px;
  background: var(--sb-surface-low);
}
.shiin-bento .sb-role-row {
  display: flex;
  min-width: 0;
  min-height: 52px;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border: 0;
  border-radius: 18px;
  background: transparent;
  color: var(--sb-muted);
  text-align: left;
  transition: background-color 180ms var(--sb-effects), color 180ms var(--sb-effects), border-radius 320ms var(--sb-spring-default), transform 240ms var(--sb-spring-fast);
}
.shiin-bento .sb-role-row:hover { background: var(--sb-surface-high); color: var(--sb-text); }
.shiin-bento .sb-role-row[aria-pressed="true"] {
  background: var(--sb-secondary-container);
  color: var(--sb-on-secondary-container);
  border-radius: 20px;
}
.shiin-bento .sb-role-row:active { transform: scale(.98); border-radius: 14px; }
.shiin-bento .sb-role-row-shape {
  position: relative;
  width: 30px;
  height: 30px;
  flex: none;
  display: grid;
  place-items: center;
}
.shiin-bento .sb-role-row-shape .sb-mask {
  fill: currentColor;
  opacity: .85;
}
.shiin-bento .sb-role-row-copy {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 1px;
}
.shiin-bento .sb-role-row-copy strong { font-size: 12px; font-weight: 700; }
.shiin-bento .sb-role-row-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10.5px;
  opacity: .72;
}
.shiin-bento .sb-role-row .sb-readout-pill {
  min-height: 22px;
  font-size: 10px;
  background: color-mix(in srgb, currentColor 12%, transparent);
  color: inherit;
}
.shiin-bento .sb-role-row[aria-pressed="true"] .sb-readout-pill {
  background: color-mix(in srgb, var(--sb-on-secondary-container) 14%, transparent);
}
.shiin-bento .sb-role-row .app-icon { flex: none; opacity: .6; }
.shiin-bento .sb-preset-section { display: grid; gap: 7px; }
.shiin-bento .sb-preset-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(68px, 1fr));
  gap: 6px;
}
.shiin-bento .sb-preset-card {
  display: flex;
  min-width: 0;
  min-height: 74px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
  padding: 9px 10px;
  border: 0;
  border-radius: 16px;
  background: var(--sb-surface-low);
  color: var(--sb-muted-strong);
  font-size: 11px;
  font-weight: 650;
  text-align: left;
  transition: background-color 180ms var(--sb-effects), color 180ms var(--sb-effects), border-radius 320ms var(--sb-spring-default), transform 240ms var(--sb-spring-fast);
}
.shiin-bento .sb-preset-card:hover { background: var(--sb-surface-high); color: var(--sb-text); }
.shiin-bento .sb-preset-card:active { transform: scale(.96); border-radius: 11px; }
.shiin-bento .sb-preset-card[aria-pressed="true"] {
  background: var(--sb-primary-container);
  color: var(--sb-on-primary-container);
}
.shiin-bento .sb-preset-art {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 26px;
  width: 100%;
}
.shiin-bento .sb-preset-art svg { width: 22px; height: 22px; flex: none; }
.shiin-bento .sb-preset-art svg:nth-child(1) { fill: var(--sb-primary); }
.shiin-bento .sb-preset-art svg:nth-child(2) { fill: var(--sb-secondary); }
.shiin-bento .sb-preset-art svg:nth-child(3) { fill: var(--sb-tertiary); }
.shiin-bento .sb-randomize-all {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: 100%;
  min-height: 52px;
  border: 0;
  border-radius: 22px;
  background: var(--sb-tertiary-container);
  color: var(--sb-on-tertiary-container);
  font-size: 13px;
  font-weight: 700;
  transition: border-radius 320ms var(--sb-spring-default), transform 240ms var(--sb-spring-fast), background-color 180ms var(--sb-effects);
}
.shiin-bento .sb-randomize-all:hover { background: color-mix(in srgb, var(--sb-tertiary-container) 82%, var(--sb-tertiary)); }
.shiin-bento .sb-randomize-all:active { border-radius: 15px; transform: scale(.97); }
.shiin-bento .sb-shape-controls {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.shiin-bento .sb-strategy {
  display: grid;
  gap: 8px;
}
.shiin-bento .sb-strategy-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.shiin-bento .sb-strategy-state {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: .04em;
  color: var(--sb-muted);
}
.shiin-bento .sb-strategy-group {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: 100%;
  padding: 4px;
  border-radius: 24px;
  background: var(--sb-surface-low);
}
.shiin-bento .sb-strategy-group button {
  justify-content: center;
  min-height: 48px;
  padding: 0 12px;
  border-radius: 20px;
  font-size: 13px;
  gap: 8px;
}
.shiin-bento .sb-connected.sb-strategy-group button[aria-pressed="true"] {
  background: var(--sb-secondary-container);
  color: var(--sb-on-secondary-container);
  border-radius: 22px;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--sb-secondary) 26%, transparent);
}
.shiin-bento .sb-strategy-note {
  font-size: 12px;
  line-height: 1.45;
  color: var(--sb-muted);
}
.shiin-bento .sb-connected {
  display: inline-flex;
  flex: none;
  gap: 2px;
  padding: 3px;
  border-radius: 999px;
  background: var(--sb-surface-high);
}
.shiin-bento .sb-connected button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 38px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--sb-muted-strong);
  font-size: 12.5px;
  font-weight: 700;
  transition: background-color 180ms var(--sb-effects), color 180ms var(--sb-effects), border-radius 320ms var(--sb-spring-default);
}
.shiin-bento .sb-connected button[aria-pressed="true"] {
  background: var(--sb-primary);
  color: var(--sb-on-primary);
}
.shiin-bento .sb-ribbon-label {
  font-size: 11px;
  letter-spacing: .14em;
  font-weight: 700;
  color: var(--sb-muted);
  margin-bottom: 4px;
}
.shiin-bento .sb-picker-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}
.shiin-bento .sb-readout-pill {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--sb-surface-high);
  color: var(--sb-muted-strong);
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.shiin-bento .sb-shape-picker {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) 34px;
  align-items: center;
  gap: 6px;
}
.shiin-bento .sb-picker-scroll {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: var(--sb-surface-high);
  color: var(--sb-muted-strong);
  transition: background-color 180ms var(--sb-effects), color 180ms var(--sb-effects), border-radius 320ms var(--sb-spring-default);
}
.shiin-bento .sb-picker-scroll:hover { background: var(--sb-surface-highest); color: var(--sb-text); }
.shiin-bento .sb-picker-scroll:active { border-radius: 12px; }
.shiin-bento .sb-picker-scroll[data-dir="prev"] .app-icon { transform: rotate(180deg); }
.shiin-bento .sb-shape-ribbon {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 88px;
  gap: 6px;
  overflow-x: auto;
  padding: 2px;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}
.shiin-bento .sb-shape-ribbon::-webkit-scrollbar { display: none; }
.shiin-bento .sb-shape-option {
  display: flex;
  min-width: 0;
  min-height: 84px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 12px 6px 10px;
  border: 0;
  border-radius: 18px;
  background: var(--sb-surface-low);
  scroll-snap-align: start;
  color: var(--sb-muted-strong);
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
  transition: background-color 180ms var(--sb-effects), color 180ms var(--sb-effects), border-radius 320ms var(--sb-spring-default), transform 240ms var(--sb-spring-fast);
}
.shiin-bento .sb-shape-option svg {
  width: 32px;
  height: 32px;
  fill: currentColor;
  transition: transform 320ms var(--sb-spring-default);
}
.shiin-bento .sb-shape-option:hover {
  background: var(--sb-surface-high);
  color: var(--sb-text);
}
.shiin-bento .sb-shape-option[aria-pressed="true"] {
  background: var(--sb-secondary-container);
  color: var(--sb-on-secondary-container);
  border-radius: 22px;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--sb-secondary) 26%, transparent);
}
.shiin-bento .sb-shape-option[aria-pressed="true"] svg {
  transform: rotate(-5deg) scale(1.08);
}
.shiin-bento .sb-shape-option:active {
  transform: scale(.93);
  border-radius: 12px;
}
.shiin-bento .sb-text-shape-row {
  display: grid;
  gap: 7px;
}
.shiin-bento .sb-text-label {
  font-size: 11px;
  letter-spacing: .14em;
  font-weight: 700;
  color: var(--sb-muted);
}
.shiin-bento .sb-text-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  width: 100%;
}
.shiin-bento .sb-text-option {
  min-height: 40px;
  padding: 0 12px;
  border: 0;
  background: var(--sb-surface-low);
  color: var(--sb-muted-strong);
  font-size: 12px;
  font-weight: 600;
  transition: background-color 180ms var(--sb-effects), color 180ms var(--sb-effects), border-color 180ms var(--sb-effects), border-radius 320ms var(--sb-spring-default);
}
.shiin-bento .sb-text-option:hover { background: var(--sb-surface-high); color: var(--sb-text); }
.shiin-bento .sb-text-option[data-text="round"] { border-radius: 12px; }
.shiin-bento .sb-text-option[data-text="soft"] { border-radius: 26px; }
.shiin-bento .sb-text-option[data-text="pill"] { border-radius: 999px; }
.shiin-bento .sb-text-option[aria-pressed="true"] {
  background: var(--sb-tertiary);
  border-color: var(--sb-tertiary);
  color: var(--sb-on-tertiary);
}

.shiin-bento .sb-session-tile {
  position: relative;
  overflow: hidden;
  grid-column: span 4;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: var(--sb-surface-low);
}
.shiin-bento .sb-session-tile > :not(.sb-session-tile-ghost) {
  position: relative;
  z-index: 1;
}
.shiin-bento .sb-session-tile-ghost {
  position: absolute;
  width: 230px;
  height: 230px;
  right: -86px;
  bottom: -88px;
  fill: none;
  stroke: color-mix(in srgb, var(--sb-tertiary) 15%, transparent);
  stroke-width: 1.5;
  transform: rotate(-14deg);
  pointer-events: none;
}
.shiin-bento .sb-session-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.shiin-bento .sb-session-badge {
  position: relative;
  width: 56px;
  height: 56px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--sb-on-secondary-container);
}
.shiin-bento .sb-session-badge svg.sb-mask {
  fill: var(--sb-secondary-container);
}
.shiin-bento .sb-session-badge .app-icon {
  position: relative;
  width: 20px;
  height: 20px;
}
.shiin-bento .sb-session-copy h3 {
  margin: 0;
  font-size: 22px;
  line-height: 1.15;
  font-weight: 600;
  letter-spacing: -.6px;
}
.shiin-bento .sb-session-copy p {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.45;
  color: var(--sb-muted);
}
.shiin-bento .sb-session-combo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 22px;
  background: var(--sb-surface);
}
.shiin-bento .sb-session-combo-art {
  position: relative;
  width: 44px;
  height: 44px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--sb-on-primary);
}
.shiin-bento .sb-session-combo-art .sb-mask { fill: var(--sb-primary); }
.shiin-bento .sb-session-combo-art .app-icon { position: relative; }
.shiin-bento .sb-session-combo strong {
  display: block;
  font-size: 14px;
  font-weight: 700;
}
.shiin-bento .sb-session-combo small {
  display: block;
  margin-top: 2px;
  font-size: 11.5px;
  color: var(--sb-muted);
}
.shiin-bento .sb-session-actions {
  display: flex;
  gap: 6px;
  margin-top: auto;
}
.shiin-bento .sb-session-actions button {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 42px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 700;
  transition: border-radius 320ms var(--sb-spring-default), transform 240ms var(--sb-spring-fast), background-color 180ms var(--sb-effects);
}
.shiin-bento .sb-session-actions button:disabled {
  opacity: .45;
  cursor: default;
}
.shiin-bento .sb-session-actions button:active {
  border-radius: 14px;
  transform: scale(.96);
}
.shiin-bento .sb-lock {
  border: 0;
  background: var(--sb-primary);
  color: var(--sb-on-primary);
}
.shiin-bento .sb-next {
  border: 1px solid var(--sb-outline);
  background: transparent;
  color: var(--sb-text);
}
.shiin-bento .sb-next:disabled {
  opacity: .45;
  cursor: default;
}

.shiin-bento .sb-permission-tile {
  grid-column: span 5;
  background: color-mix(in srgb, var(--sb-secondary-container) 46%, var(--sb-surface-low));
  border-color: color-mix(in srgb, var(--sb-secondary) 14%, transparent);
}
.shiin-bento .sb-permission-tile .sb-permission-list li {
  background: rgba(255, 255, 255, .055);
}
.shiin-bento .sb-permission-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 14px;
  align-items: end;
  margin-top: 12px;
}
.shiin-bento .sb-permission-big {
  font-size: 54px;
  line-height: .9;
  font-weight: 500;
  letter-spacing: -2.4px;
  color: var(--sb-primary);
}
.shiin-bento .sb-permission-big small {
  font-size: 16px;
  letter-spacing: -.2px;
  color: var(--sb-muted);
  font-weight: 500;
}
.shiin-bento .sb-wavy {
  grid-column: 1 / -1;
  height: 24px;
}
.shiin-bento .sb-wavy svg {
  width: 100%;
  height: 24px;
  overflow: visible;
}
.shiin-bento .sb-permission-list {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.shiin-bento .sb-permission-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 9px 11px;
  border-radius: 14px;
  background: var(--sb-surface-low);
  font-size: 12px;
}
.shiin-bento .sb-permission-list .sb-dot {
  width: 8px;
  height: 8px;
  flex: none;
  border-radius: 50%;
  background: var(--sb-tertiary);
}
.shiin-bento .sb-permission-list .sb-dot.bad { background: var(--sb-error); }
.shiin-bento .sb-permission-list .sb-state {
  margin-left: auto;
  font-size: 10.5px;
  color: var(--sb-muted);
  white-space: nowrap;
}
.shiin-bento .sb-permission-list .sb-state.bad {
  color: var(--sb-error);
  font-weight: 700;
}
.shiin-bento .sb-permission-action {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  flex-wrap: wrap;
}

.shiin-bento .sb-startup-tile {
  grid-column: span 4;
}
.shiin-bento .sb-startup-list {
  display: grid;
  gap: 2px;
  margin-top: 10px;
}
.shiin-bento .sb-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 0;
}
.shiin-bento .sb-row + .sb-row {
  border-top: 1px solid var(--sb-outline-soft);
}
.shiin-bento .sb-row-copy {
  min-width: 0;
}
.shiin-bento .sb-row-copy strong {
  display: block;
  font-size: 12.5px;
  font-weight: 600;
}
.shiin-bento .sb-row-copy small {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  line-height: 1.35;
  color: var(--sb-muted);
}
.shiin-bento .sb-select {
  max-width: 150px;
  height: 32px;
  padding: 0 9px;
  border: 1px solid var(--sb-outline);
  border-radius: 10px;
  background: var(--sb-surface);
  color: var(--sb-text);
  font-size: 11.5px;
  outline: none;
}
.shiin-bento .sb-switch {
  position: relative;
  width: 56px;
  height: 34px;
  flex: none;
  padding: 0;
  border: 2px solid var(--sb-outline);
  border-radius: 999px;
  background: var(--sb-surface-high);
}
.shiin-bento .sb-switch-thumb {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--sb-muted);
  color: transparent;
  transition: transform 320ms var(--sb-spring-default), background-color 180ms var(--sb-effects), color 180ms var(--sb-effects), border-radius 240ms var(--sb-spring-fast);
}
.shiin-bento .sb-switch-thumb .app-icon {
  width: 13px;
  height: 13px;
  stroke-width: 2.4;
}
.shiin-bento .sb-switch[aria-checked="true"] {
  background: var(--sb-tertiary);
  border-color: var(--sb-tertiary);
}
.shiin-bento .sb-switch[aria-checked="true"] .sb-switch-thumb {
  transform: translateX(22px);
  background: #ffffff;
  color: var(--sb-tertiary);
}
.shiin-bento .sb-switch:active .sb-switch-thumb {
  border-radius: 9px;
}

.shiin-bento .sb-notify-tile {
  grid-column: span 3;
  background: color-mix(in srgb, var(--sb-tertiary-container) 34%, var(--sb-surface-low));
  border-color: color-mix(in srgb, var(--sb-tertiary) 14%, transparent);
}
.shiin-bento .sb-notify-tile .sb-tile-head h3 { color: var(--sb-text); }
.shiin-bento .sb-notify-tile .sb-tile-head p { color: var(--sb-muted); }
.shiin-bento .sb-sound-row {
  margin-top: 12px;
}
.shiin-bento .sb-sound-label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}
.shiin-bento .sb-sound-label strong {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--sb-text);
}
.shiin-bento .sb-sound-label output {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 11px;
  border-radius: 999px;
  background: var(--sb-surface-high);
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0;
  color: var(--sb-text);
  font-variant-numeric: tabular-nums;
}
.shiin-bento .sb-volume-control {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) 38px;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.shiin-bento .sb-volume-step {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 14px;
  background: var(--sb-surface-high);
  color: var(--sb-text);
  transition: background-color 180ms var(--sb-effects), border-radius 320ms var(--sb-spring-default);
}
.shiin-bento .sb-volume-step:hover { background: var(--sb-surface-highest); }
.shiin-bento .sb-volume-step:active { border-radius: 18px; }
.shiin-bento .sb-volume-step:disabled { opacity: .35; cursor: default; }
.shiin-bento .sb-slider {
  width: 100%;
  height: 38px;
  margin-top: 0;
  appearance: none;
  background: transparent;
  cursor: ew-resize;
}
.shiin-bento .sb-slider::-webkit-slider-runnable-track {
  height: 18px;
  border-radius: 999px;
  background: linear-gradient(to right, var(--sb-tertiary) 0 var(--sb-progress, 68%), rgba(255, 255, 255, .16) var(--sb-progress, 68%) 100%);
}
.shiin-bento .sb-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 30px;
  margin-top: -6px;
  border: 2px solid var(--sb-tertiary);
  border-radius: 999px;
  background: var(--sb-surface-low);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--sb-tertiary-container) 48%, transparent);
}
.shiin-bento .sb-notify-select {
  width: 100%;
  height: 34px;
  margin-top: 8px;
  padding: 0 9px;
  border: 1px solid rgba(255, 255, 255, .2);
  border-radius: 10px;
  background: rgba(255, 255, 255, .08);
  color: var(--sb-on-tertiary-container);
  font-size: 11.5px;
  outline: none;
}
.shiin-bento .sb-notify-actions {
  display: flex;
  gap: 6px;
  margin-top: 12px;
}
.shiin-bento .sb-notify-actions button {
  flex: 1;
  min-height: 36px;
  border: 1px solid var(--sb-outline);
  border-radius: 999px;
  background: transparent;
  color: var(--sb-text);
  font-size: 11.5px;
  font-weight: 700;
}
.shiin-bento .sb-notify-actions button:hover {
  background: var(--sb-surface-high);
}

.shiin-bento .sb-metadata-tile {
  grid-column: span 5;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.shiin-bento .sb-hub-tile {
  grid-column: span 12;
}

.shiin-bento .sb-data-tile {
  grid-column: span 12;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
}
.shiin-bento .sb-version {
  font-size: 26px;
  font-weight: 500;
  letter-spacing: -1px;
  white-space: nowrap;
}
.shiin-bento .sb-data-meta {
  font-size: 12px;
  color: var(--sb-muted);
  white-space: nowrap;
}
.shiin-bento .sb-data-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  padding: 4px;
  border-radius: 24px;
  background: var(--sb-surface-low);
}
.shiin-bento .sb-data-actions .sb-secondary-button {
  min-height: 36px;
  border: 0;
  background: transparent;
}
.shiin-bento .sb-data-actions .sb-secondary-button:hover { background: var(--sb-surface-high); }
.shiin-bento .sb-data-lang {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--sb-muted);
}
.shiin-bento .sb-secondary-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 40px;
  padding: 0 15px;
  border: 1px solid var(--sb-outline);
  border-radius: 999px;
  background: transparent;
  color: var(--sb-text);
  font-size: 12.5px;
  font-weight: 600;
  transition: background-color 180ms var(--sb-effects), border-radius 320ms var(--sb-spring-default), transform 240ms var(--sb-spring-fast);
}
.shiin-bento .sb-secondary-button:hover { background: var(--sb-surface-high); }
.shiin-bento .sb-secondary-button:active { border-radius: 14px; transform: scale(.96); }
.shiin-bento .sb-primary-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 40px;
  padding: 0 16px;
  border: 0;
  border-radius: 999px;
  background: var(--sb-primary);
  color: var(--sb-on-primary);
  font-size: 12.5px;
  font-weight: 700;
  transition: border-radius 320ms var(--sb-spring-default), transform 240ms var(--sb-spring-fast), background-color 180ms var(--sb-effects);
}
.shiin-bento .sb-primary-button:active { border-radius: 14px; transform: scale(.96); }
.shiin-bento .sb-primary-button:disabled,
.shiin-bento .sb-secondary-button:disabled {
  opacity: .45;
  cursor: default;
}

.shiin-bento ::-webkit-scrollbar { width: 8px; height: 8px; }
.shiin-bento ::-webkit-scrollbar-thumb { background: var(--sb-surface-highest); border-radius: 999px; }
.shiin-bento ::-webkit-scrollbar-track { background: transparent; }

/* Expressive workspace components */
.shiin-bento .sb-session-focus {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 6px 0 4px;
}
.shiin-bento .sb-session-focus .sb-session-orb { width: 64px; height: 64px; }
.shiin-bento .sb-session-focus .sb-session-orb .app-icon { width: 24px; height: 24px; }
.shiin-bento .sb-session-copy { display: grid; gap: 2px; min-width: 0; }
.shiin-bento .sb-session-copy .sb-eyebrow { margin: 0; font-size: 10px; color: var(--sb-muted); }
.shiin-bento .sb-session-copy strong {
  font-size: 24px;
  line-height: 1.08;
  letter-spacing: -.7px;
  color: var(--sb-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.shiin-bento .sb-session-copy small { font-size: 11.5px; color: var(--sb-muted); }
.shiin-bento .sb-session-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0 10px; }
.shiin-bento .sb-session-actions { display: flex; width: 100%; gap: 3px; padding: 3px; }
.shiin-bento .sb-session-actions button { flex: 1; min-height: 40px; justify-content: center; padding: 0 8px; }
.shiin-bento .sb-session-actions.has-alert button:first-child { color: var(--sb-error); }

.shiin-bento .sb-metric-carousel {
  grid-column: span 12;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding: 2px 2px 6px;
}
.shiin-bento .sb-metric-carousel::-webkit-scrollbar { display: none; }
.shiin-bento .sb-metric {
  --metric-color: var(--sb-primary);
  flex: 1 0 200px;
  min-height: 132px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 4px;
  padding: 18px;
  border-radius: 30px;
  background: var(--sb-surface);
  border: 1px solid var(--sb-outline-soft);
  scroll-snap-align: start;
  transition: flex-grow 360ms var(--sb-spring-default), background-color 180ms var(--sb-effects), border-color 180ms var(--sb-effects);
}
.shiin-bento .sb-metric:first-child { flex: 1.45 0 280px; }
.shiin-bento .sb-metric[data-tone="secondary"] { --metric-color: var(--sb-secondary); }
.shiin-bento .sb-metric[data-tone="tertiary"] { --metric-color: var(--sb-tertiary); }
.shiin-bento .sb-metric:hover { flex-grow: 1.7; background: var(--sb-surface-low); border-color: var(--sb-outline); }
.shiin-bento .sb-metric-shape {
  position: relative;
  width: 34px;
  height: 34px;
  margin-bottom: auto;
}
.shiin-bento .sb-metric-shape .sb-mask { fill: var(--metric-color); }
.shiin-bento .sb-metric-shape svg { width: 100%; height: 100%; fill: var(--metric-color); }
.shiin-bento .sb-metric-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 28px;
  line-height: 1.05;
  font-weight: 500;
  letter-spacing: -.8px;
  color: var(--metric-color);
}
.shiin-bento .sb-metric-label { font-size: 11.5px; color: var(--sb-muted); }

.shiin-bento .sb-target-group {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 30px;
  background: var(--sb-surface-low);
}
.shiin-bento .sb-target-group button {
  flex: 1;
  min-width: 0;
  min-height: 56px;
  padding: 0 14px;
  border: 0;
  border-radius: 26px;
  background: transparent;
  color: var(--sb-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 650;
  white-space: nowrap;
  transition: flex-grow 360ms var(--sb-spring-default), background-color 180ms var(--sb-effects), color 180ms var(--sb-effects), border-radius 320ms var(--sb-spring-default);
}
.shiin-bento .sb-target-group button[aria-pressed="true"] {
  flex: 1.4;
  background: var(--sb-primary);
  color: var(--sb-on-primary);
  border-radius: 28px;
}
.shiin-bento .sb-target-group button:hover:not([aria-pressed="true"]) {
  background: var(--sb-surface-high);
  color: var(--sb-text);
}

.shiin-bento .sb-source-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 22px;
  background: var(--sb-surface-low);
  border: 1px solid var(--sb-outline-soft);
}
.shiin-bento .sb-source-icon {
  width: 40px;
  height: 40px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: var(--sb-surface-high);
  color: var(--sb-primary);
}
.shiin-bento .sb-source-copy { flex: 1; min-width: 0; display: grid; gap: 2px; }
.shiin-bento .sb-source-select {
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--sb-text);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  outline: none;
}
.shiin-bento .sb-source-value { font-size: 14px; font-weight: 600; color: var(--sb-text); }
.shiin-bento .sb-icon-button {
  width: 40px;
  height: 40px;
  flex: none;
  display: grid;
  place-items: center;
  border: 1px solid var(--sb-outline-soft);
  border-radius: 14px;
  background: var(--sb-surface-high);
  color: var(--sb-text);
  transition: border-radius 320ms var(--sb-spring-default), color 180ms var(--sb-effects);
}
.shiin-bento .sb-icon-button:hover { border-radius: 50%; color: var(--sb-primary); }

.shiin-bento .sb-output-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.shiin-bento .sb-chip-group {
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  border-radius: 999px;
  background: var(--sb-surface-low);
}
.shiin-bento .sb-chip-group button {
  min-height: 38px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--sb-muted);
  font-size: 12px;
  font-weight: 700;
}
.shiin-bento .sb-chip-group button[aria-pressed="true"] {
  background: var(--sb-primary);
  color: var(--sb-on-primary);
}
.shiin-bento .sb-chip-select {
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--sb-outline-soft);
  border-radius: 999px;
  background: var(--sb-surface-low);
  color: var(--sb-text);
  font-size: 12px;
  outline: none;
}
.shiin-bento .sb-chip-input {
  flex: 1;
  min-width: 180px;
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--sb-outline-soft);
  border-radius: 999px;
  background: var(--sb-surface-low);
  color: var(--sb-text);
  font-size: 12px;
  outline: none;
}
.shiin-bento .sb-chip-input:focus, .shiin-bento .sb-chip-select:focus { border-color: var(--sb-primary); }
.shiin-bento .sb-folder-row { display: flex; align-items: center; gap: 6px; margin-top: 10px; }
.shiin-bento .sb-path-chip {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 999px;
  background: var(--sb-surface-low);
  color: var(--sb-muted-strong);
  font-family: var(--sb-mono, "SFMono-Regular", Menlo, monospace);
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.shiin-bento .sb-path-chip span { overflow: hidden; text-overflow: ellipsis; }

.shiin-bento .sb-split-wrap { position: relative; margin-top: 12px; }
.shiin-bento .sb-split-button { display: flex; gap: 2px; }
.shiin-bento .sb-split-main {
  flex: 1;
  min-height: 52px;
  padding: 0 18px;
  border: 0;
  border-radius: 26px 6px 6px 26px;
  background: var(--sb-primary);
  color: var(--sb-on-primary);
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: border-radius 320ms var(--sb-spring-default), transform 240ms var(--sb-spring-fast);
}
.shiin-bento .sb-split-trail {
  width: 52px;
  min-height: 52px;
  border: 0;
  border-radius: 6px 26px 26px 6px;
  background: var(--sb-primary-container);
  color: var(--sb-on-primary-container);
  display: grid;
  place-items: center;
  transition: border-radius 320ms var(--sb-spring-default), transform 240ms var(--sb-spring-fast);
}
.shiin-bento .sb-split-main:active, .shiin-bento .sb-split-trail:active { border-radius: 16px; transform: scale(.97); }
.shiin-bento .sb-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 60;
  display: grid;
  gap: 2px;
  padding: 6px;
  border-radius: 20px;
  background: var(--sb-surface-high);
  border: 1px solid var(--sb-outline-soft);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.5);
}
.shiin-bento .sb-menu button {
  min-height: 44px;
  padding: 0 12px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: var(--sb-text);
  text-align: left;
  font-size: 12.5px;
}
.shiin-bento .sb-menu button:hover { background: var(--sb-surface-highest); }
.shiin-bento .sb-menu button.is-danger { color: var(--sb-error); }
.shiin-bento .sb-menu-divider { height: 1px; background: var(--sb-outline-soft); margin: 4px 2px; }

.shiin-bento .sb-toggle-group {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
  padding: 4px;
  margin-top: 10px;
  border-radius: 28px;
  background: var(--sb-surface-low);
}
.shiin-bento .sb-toggle {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  min-height: 100px;
  padding: 14px;
  border: 0;
  border-radius: 24px;
  background: transparent;
  color: var(--sb-muted);
  text-align: left;
  transition: background-color 180ms var(--sb-effects), color 180ms var(--sb-effects), border-radius 320ms var(--sb-spring-default), transform 240ms var(--sb-spring-fast);
}
.shiin-bento .sb-toggle:hover { background: var(--sb-surface-high); color: var(--sb-text); }
.shiin-bento .sb-toggle[aria-pressed="true"] {
  background: var(--sb-primary);
  color: var(--sb-on-primary);
  border-radius: 28px;
}
.shiin-bento .sb-toggle-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--sb-surface-high);
  color: var(--sb-primary);
}
.shiin-bento .sb-toggle[aria-pressed="true"] .sb-toggle-icon {
  background: rgba(0, 0, 0, 0.16);
  color: var(--sb-on-primary);
}
.shiin-bento .sb-toggle-copy strong { display: block; font-size: 13px; }
.shiin-bento .sb-toggle-copy small { display: block; margin-top: 2px; font-size: 10.5px; opacity: .8; }

.shiin-bento .sb-wavy-axis { display: block; min-width: 0; }
.shiin-bento .sb-wavy-axis svg { width: 100%; height: 22px; }
.shiin-bento .sb-axis-readout {
  justify-content: center;
  min-width: 54px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10.5px;
}
.shiin-bento .sb-tester-empty {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 18px 0;
}
.shiin-bento .sb-tester-orb {
  position: relative;
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  color: var(--sb-on-primary);
}
.shiin-bento .sb-tester-orb .sb-mask { fill: var(--sb-primary); }
.shiin-bento .sb-tester-orb .app-icon { position: relative; }
.shiin-bento .sb-keyboard-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 20px;
  background: var(--sb-surface-high);
}
.shiin-bento .sb-keyboard-row .sb-toggle-icon {
  background: var(--sb-surface-low);
  color: var(--sb-primary);
}
.shiin-bento .sb-keyboard-row .sb-row-copy { flex: 1; min-width: 0; }
.shiin-bento .sb-test-key {
  border-radius: 16px;
  transition: background-color 90ms linear, color 90ms linear, border-radius 320ms var(--sb-spring-default), transform 240ms var(--sb-spring-fast);
}
.shiin-bento .sb-test-key.pressed { border-radius: 50%; transform: scale(1.06); }

/* Self-drawn select menu (ADR-0007: no native selects) */
.shiin-bento .sb-select-control { position: relative; min-width: 0; }
.shiin-bento .sb-select-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--sb-outline-soft);
  border-radius: 999px;
  background: var(--sb-surface-low);
  color: var(--sb-text);
  font: inherit;
  font-size: 12.5px;
  font-weight: 650;
  cursor: pointer;
  transition: border-color 180ms var(--sb-effects), background-color 180ms var(--sb-effects), border-radius 320ms var(--sb-spring-default);
}
.shiin-bento .sb-select-button:hover { border-color: var(--sb-outline); background: var(--sb-surface-high); }
.shiin-bento .sb-select-button[data-variant="chip"] { height: 44px; padding: 0 14px; font-size: 12px; }
.shiin-bento .sb-select-button[data-variant="inline"] {
  height: 30px;
  padding: 0;
  border: 0;
  background: transparent;
  border-radius: 8px;
  justify-content: flex-start;
  font-size: 14px;
}
.shiin-bento .sb-select-button[data-variant="notify"] {
  border-color: var(--sb-outline-soft);
  background: var(--sb-surface-high);
  color: var(--sb-text);
}
.shiin-bento .sb-select-value { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.shiin-bento .sb-select-popover {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 100%;
  max-height: 320px;
  overflow-y: auto;
  z-index: 80;
  display: grid;
  gap: 2px;
  padding: 6px;
  border-radius: 20px;
  background: var(--sb-surface-high);
  border: 1px solid var(--sb-outline-soft);
  box-shadow: 0 18px 40px rgba(0, 0, 0, .5);
}
.shiin-bento .sb-select-popover button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
  padding: 8px 12px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: var(--sb-text);
  font: inherit;
  font-size: 12.5px;
  text-align: left;
  cursor: pointer;
}
.shiin-bento .sb-select-popover button:hover { background: var(--sb-surface-highest); }
.shiin-bento .sb-select-popover button.is-selected {
  background: var(--sb-primary-container);
  color: var(--sb-on-primary-container);
}
.shiin-bento .sb-select-popover strong { display: block; font-weight: 650; }
.shiin-bento .sb-select-popover small { display: block; margin-top: 2px; font-size: 10.5px; color: var(--sb-muted); }
.shiin-bento .sb-select-popover .is-selected small { color: color-mix(in srgb, var(--sb-on-primary-container) 72%, transparent); }

.shiin-bento .sb-toggle-group--two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.shiin-bento .sb-settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 10px;
}
.shiin-bento .sb-setting-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--sb-outline-soft);
}
.shiin-bento .sb-notify-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 64px;
  margin-top: 10px;
  padding: 10px 12px;
  border: 0;
  border-radius: 20px;
  background: var(--sb-surface-high);
  color: var(--sb-text);
  text-align: left;
  transition: background-color 180ms var(--sb-effects), color 180ms var(--sb-effects), border-radius 320ms var(--sb-spring-default);
}
.shiin-bento .sb-notify-toggle[aria-pressed="true"] {
  background: var(--sb-tertiary);
  color: var(--sb-on-tertiary);
  border-radius: 24px;
}
.shiin-bento .sb-notify-toggle .sb-toggle-icon {
  background: var(--sb-surface-highest);
  color: var(--sb-text);
}
.shiin-bento .sb-notify-toggle[aria-pressed="true"] .sb-toggle-icon {
  background: rgba(0, 0, 0, .14);
  color: var(--sb-on-tertiary);
}
.shiin-bento .sb-notify-toggle .sb-toggle-copy { flex: 1; }
.shiin-bento .sb-notify-track {
  width: 52px;
  height: 30px;
  flex: none;
  display: flex;
  align-items: center;
  padding: 3px;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 16%, transparent);
}
.shiin-bento .sb-notify-thumb {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--sb-muted-strong);
  color: var(--sb-surface-low);
  transform: translateX(0);
  transition: transform 320ms var(--sb-spring-default), background-color 180ms var(--sb-effects), color 180ms var(--sb-effects);
}
.shiin-bento .sb-notify-track[data-on="true"] .sb-notify-thumb {
  transform: translateX(22px);
  background: var(--sb-on-tertiary);
  color: var(--sb-tertiary);
}
.shiin-bento .sb-notify-thumb .app-icon {
  width: 13px;
  height: 13px;
  opacity: 0;
  transition: opacity 160ms var(--sb-effects);
}
.shiin-bento .sb-notify-track[data-on="true"] .sb-notify-thumb .app-icon { opacity: 1; }
.shiin-bento .sb-notify-select-control { width: 100%; margin-top: 10px; }
.shiin-bento .sb-notify-position-field { display: grid; gap: 5px; margin-top: 10px; }
.shiin-bento .sb-notify-position-field .sb-notify-select-control { margin-top: 0; }
.shiin-bento .sb-language-select { width: 160px; max-width: 100%; }
.shiin-bento .sb-source-select-control { width: 100%; }
.shiin-bento .sb-save-way-select { min-width: 140px; }
.shiin-bento .sb-gamepad-select { width: 100%; }

/* Permissions center */
.shiin-bento .sb-permission-hero {
  grid-column: span 12;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 24px;
  align-items: center;
  min-height: 300px;
  padding: 30px;
  background: var(--sb-primary-container);
  border-color: transparent;
}
.shiin-bento .sb-permission-hero[data-state="ready"] { background: var(--sb-tertiary-container); }
.shiin-bento .sb-permission-hero-copy .sb-eyebrow { color: color-mix(in srgb, var(--sb-on-primary-container) 62%, transparent); }
.shiin-bento .sb-permission-count { display: flex; align-items: baseline; gap: 10px; }
.shiin-bento .sb-permission-count strong {
  font-size: 84px;
  line-height: .8;
  font-weight: 600;
  letter-spacing: -4px;
  color: var(--sb-on-primary-container);
}
.shiin-bento .sb-permission-count span { font-size: 18px; color: color-mix(in srgb, var(--sb-on-primary-container) 72%, transparent); }
.shiin-bento .sb-permission-hero[data-state="ready"] .sb-permission-count strong,
.shiin-bento .sb-permission-hero[data-state="ready"] .sb-permission-count span { color: var(--sb-on-tertiary-container); }
.shiin-bento .sb-permission-hero .sb-action-primary {
  min-height: 56px;
  padding: 0 24px;
  font-size: 15px;
}
.shiin-bento .sb-permission-hero .sb-action-secondary {
  min-height: 48px;
  padding: 0 20px;
  font-size: 13.5px;
}
.shiin-bento .sb-permission-wave { max-width: 460px; height: 24px; margin: 16px 0 18px; }
.shiin-bento .sb-permission-wave svg { width: 100%; height: 24px; }
.shiin-bento .sb-permission-hero .sb-note { color: color-mix(in srgb, var(--sb-on-primary-container) 72%, transparent); }
.shiin-bento .sb-permission-hero-art { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.shiin-bento .sb-permission-orb {
  position: relative;
  width: 200px;
  height: 200px;
  display: grid;
  place-items: center;
  color: var(--sb-on-primary);
}
.shiin-bento .sb-permission-orb .sb-mask { position: absolute; inset: 0; width: 100%; height: 100%; fill: var(--sb-primary); }
.shiin-bento .sb-permission-orb .app-icon { position: relative; width: 38px; height: 38px; }
.shiin-bento .sb-permission-hero-art > span { font-size: 11px; letter-spacing: .14em; color: var(--sb-on-primary-container); opacity: .7; }
.shiin-bento .sb-perm-tile { grid-column: span 6; --perm-color: var(--sb-primary); }
.shiin-bento .sb-perm-tile[data-tone="tertiary"] { --perm-color: var(--sb-tertiary); }
.shiin-bento .sb-perm-tile[data-tone="secondary"] { --perm-color: var(--sb-secondary); }
.shiin-bento .sb-perm-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.shiin-bento .sb-perm-icon { position: relative; width: 46px; height: 46px; display: grid; place-items: center; color: #101014; }
.shiin-bento .sb-perm-icon .sb-mask { position: absolute; inset: 0; width: 100%; height: 100%; fill: var(--perm-color); }
.shiin-bento .sb-perm-icon .app-icon { position: relative; width: 19px; height: 19px; }
.shiin-bento .sb-perm-tile h3 { margin: 0 0 4px; font-size: 20px; font-weight: 600; letter-spacing: -.4px; }
.shiin-bento .sb-perm-tile p { margin: 0; font-size: 12.5px; line-height: 1.5; color: var(--sb-muted); }
.shiin-bento .sb-perm-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.shiin-bento .sb-perm-test,
.shiin-bento .sb-perm-folder { grid-column: span 6; }
.shiin-bento .sb-perm-test-body { display: grid; gap: 10px; margin-top: 12px; }
.shiin-bento .sb-perm-result { display: grid; gap: 8px; }
.shiin-bento .sb-perm-result img {
  width: 100%;
  max-height: 170px;
  object-fit: contain;
  border-radius: 16px;
  background: var(--sb-surface-lowest);
  border: 1px solid var(--sb-outline-soft);
}
.shiin-bento .sb-perm-hid {
  grid-column: span 12;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  background: var(--sb-surface-low);
}
.shiin-bento .sb-perm-hid-copy { display: grid; gap: 2px; }
.shiin-bento .sb-perm-hid-copy .sb-eyebrow { margin: 0; }
.shiin-bento .sb-perm-hid-copy strong { font-size: 18px; letter-spacing: -.3px; }
.shiin-bento .sb-perm-hid-copy small { font-size: 11.5px; color: var(--sb-muted); }
.shiin-bento .sb-perm-hid-actions { display: flex; gap: 6px; flex-wrap: wrap; }

@container node (max-width: 1080px) {
  .shiin-bento .sb-shape-tile { grid-column: span 7; }
  .shiin-bento .sb-session-tile { grid-column: span 5; }
  .shiin-bento .sb-permission-tile { grid-column: span 6; }
  .shiin-bento .sb-startup-tile { grid-column: span 6; }
  .shiin-bento .sb-notify-tile { grid-column: span 6; }
  .shiin-bento .sb-notify-tile .sb-notify-actions { max-width: 320px; }
  .shiin-bento .sb-metadata-tile { grid-column: span 12; }
  .shiin-bento .sb-hub-tile { grid-column: span 12; }
}
@container node (max-width: 860px) {
  .shiin-bento .sb-shape-tile { grid-column: span 12; }
  .shiin-bento .sb-session-tile { grid-column: span 12; }
  .shiin-bento .sb-shape-lab { grid-template-columns: 220px minmax(0, 1fr); }
  .shiin-bento .sb-perm-tile,
  .shiin-bento .sb-perm-test,
  .shiin-bento .sb-metadata-tile,
  .shiin-bento .sb-hub-tile,
  .shiin-bento .sb-perm-folder { grid-column: span 12; }
  .shiin-bento .sb-data-tile { flex-wrap: wrap; }
  .shiin-bento .sb-data-actions { margin-left: 0; width: 100%; }
}
@container node (max-width: 680px) {
  .shiin-bento .sb-page { padding: 18px 16px 96px; }
  .shiin-bento .sb-masthead { flex-wrap: wrap; align-items: flex-start; }
  .shiin-bento .sb-masthead h2 { font-size: 46px; }
  .shiin-bento .sb-shape-lab { grid-template-columns: minmax(0, 1fr); }
  .shiin-bento .sb-shape-picker { grid-template-columns: minmax(0, 1fr); }
  .shiin-bento .sb-picker-scroll { display: none; }
  .shiin-bento .sb-permission-tile,
  .shiin-bento .sb-startup-tile,
  .shiin-bento .sb-notify-tile,
  .shiin-bento .sb-metadata-tile,
  .shiin-bento .sb-hub-tile { grid-column: span 12; }
  .shiin-bento .sb-permission-list { grid-template-columns: 1fr; }
  .shiin-bento .sb-data-tile { align-items: flex-start; }
  .shiin-bento .sb-data-lang { width: 100%; }
}
@container node (max-width: 430px) {
  .shiin-bento .sb-page { padding-inline: 12px; }
  .shiin-bento .sb-tile { border-radius: 24px; padding: 16px; }
  .shiin-bento .sb-strategy { align-items: flex-start; flex-direction: column; }
  .shiin-bento .sb-connected { width: 100%; }
  .shiin-bento .sb-connected button { flex: 1; justify-content: center; }
  .shiin-bento .sb-text-shape-row { align-items: flex-start; flex-direction: column; }
  .shiin-bento .sb-text-options { width: 100%; }
  .shiin-bento .sb-text-option { flex: 1; }
  .shiin-bento .sb-session-actions { flex-direction: column; }
  .shiin-bento .sb-data-actions { flex-direction: row; align-items: center; }
  .shiin-bento .sb-data-actions button { flex: 1 1 auto; justify-content: center; }
}
@container shiin-shell (max-width: 599px) {
  .shiin-bento .sb-page { padding-bottom: 104px; }
}
@container node (max-width: 680px) {
  .shiin-bento .sb-permission-hero {
    grid-template-columns: minmax(0, 1fr);
    min-height: 0;
    padding: 22px;
  }
  .shiin-bento .sb-permission-hero-art { display: none; }
  .shiin-bento .sb-permission-count strong { font-size: 64px; }
  .shiin-bento .sb-permission-hero .sb-capture-actions {
    display: flex;
    flex-wrap: wrap;
  }
  .shiin-bento .sb-permission-hero .sb-action-primary,
  .shiin-bento .sb-permission-hero .sb-action-secondary {
    white-space: nowrap;
  }
}
@container node (max-width: 430px) {
  .shiin-bento .sb-permission-hero { padding: 18px; }
  .shiin-bento .sb-permission-hero .sb-capture-actions {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
  }
  .shiin-bento .sb-permission-hero .sb-action-primary,
  .shiin-bento .sb-permission-hero .sb-action-secondary {
    width: 100%;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shiin-bento *,
  .shiin-bento *::before,
  .shiin-bento *::after {
    transition: none !important;
    animation: none !important;
  }
}

/* ============================================================
   Shiin Activity Dashboard (MD3 Expressive Grid & Widgets)
   ============================================================ */
.shiin-dashboard {
  min-height: 100%;
}

.shiin-dash-hero {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 28px;
  margin-bottom: 20px;
  background: var(--md-sys-color-surface-container-low);
  border: 1px solid var(--shiin-line-soft);
  border-radius: 32px;
}

.shiin-dash-hero__copy {
  max-width: 680px;
}

.shiin-dash-hero__kicker {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.shiin-dash-hero__emblem {
  position: relative;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  color: var(--md-sys-color-on-primary-container);
}

.shiin-dash-hero__emblem-shape {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  fill: var(--md-sys-color-primary-container);
}

.shiin-dash-hero__kicker-text {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--shiin-muted);
}

.shiin-dash-hero__edit-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 10px;
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  animation: shiin-pulse-soft 2s infinite ease-in-out;
}

@keyframes shiin-pulse-soft {
  0%, 100% { opacity: 0.9; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.03); }
}

.shiin-dash-hero__title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--shiin-ink);
}

.shiin-dash-hero__lede {
  margin: 6px 0 0;
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--shiin-muted);
}

.shiin-dash-hero__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.shiin-dash-hero__data-tools {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 6px;
  border-left: 1px solid var(--shiin-line-soft);
}

.shiin-dash-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
  transition: all 180ms ease;
  user-select: none;
}

.shiin-dash-btn.is-primary {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  box-shadow: 0 2px 8px rgba(200, 240, 0, 0.25);
}

.shiin-dash-btn.is-tonal {
  background: var(--md-sys-color-surface-container-high);
  color: var(--shiin-ink);
  border-color: var(--shiin-line-soft);
}

.shiin-dash-btn.is-ghost {
  background: transparent;
  color: var(--shiin-muted);
  border-color: var(--shiin-line-soft);
}

.shiin-dash-btn.is-ghost:hover {
  background: var(--md-sys-color-surface-container);
  color: var(--shiin-ink);
}

.shiin-dash-btn.is-danger {
  color: var(--md-sys-color-error);
}

.shiin-dash-btn.is-danger:hover {
  background: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
}

.shiin-dash-badge-count {
  padding: 1px 7px;
  border-radius: 999px;
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  font-size: 11px;
  font-weight: 800;
}

.shiin-dash-add-wrap {
  position: relative;
}

.shiin-dash-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 100;
  min-width: 260px;
  padding: 8px;
  background: var(--shiin-surface);
  border: 1px solid var(--shiin-line-soft);
  border-radius: 20px;
  box-shadow: var(--shiin-shadow-2);
}

.shiin-dash-menu__title {
  padding: 6px 10px 4px;
  font-size: 11px;
  font-weight: 700;
  color: var(--shiin-muted);
  text-transform: uppercase;
}

.shiin-dash-menu__item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: var(--shiin-ink);
  text-align: left;
  cursor: pointer;
}

.shiin-dash-menu__item:hover {
  background: var(--md-sys-color-surface-container);
}

.shiin-dash-menu__item-copy {
  flex: 1;
  min-width: 0;
}

.shiin-dash-menu__item-copy strong {
  display: block;
  font-size: 12.5px;
}

.shiin-dash-menu__item-copy small {
  display: block;
  font-size: 11px;
  color: var(--shiin-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ============================================================
   Grid & Discrete Dimensions
   ============================================================ */
.shiin-dash-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: minmax(130px, auto);
  gap: 16px;
}

.shiin-dash-grid.is-editing .shiin-dash-cell {
  position: relative;
  outline: 2px dashed color-mix(in srgb, var(--md-sys-color-primary) 65%, transparent);
  outline-offset: 4px;
  border-radius: 32px;
  transition: outline-color 180ms ease;
}

.shiin-dash-cell--1x1 {
  grid-column: span 1;
  grid-row: span 1;
}

.shiin-dash-cell--2x1 {
  grid-column: span 2;
  grid-row: span 1;
}

.shiin-dash-cell--2x2 {
  grid-column: span 2;
  grid-row: span 2;
}

.shiin-dash-cell--3x2 {
  grid-column: span 3;
  grid-row: span 2;
}

.shiin-dash-cell--4x2 {
  grid-column: span 4;
  grid-row: span 2;
}

/* Tablet Layout (600px - 1199px) */
@media (max-width: 1199px) {
  .shiin-dash-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .shiin-dash-cell--3x2,
  .shiin-dash-cell--4x2 {
    grid-column: span 2;
  }
}

/* Mobile Layout (<600px) */
@media (max-width: 600px) {
  .shiin-dash-grid {
    grid-template-columns: 1fr;
  }
  .shiin-dash-cell--1x1,
  .shiin-dash-cell--2x1,
  .shiin-dash-cell--2x2,
  .shiin-dash-cell--3x2,
  .shiin-dash-cell--4x2 {
    grid-column: span 1;
  }
}

/* ============================================================
   Widget Frame Card
   ============================================================ */
.shiin-dash-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px 22px;
  background: var(--shiin-surface);
  border: 1px solid var(--shiin-line-soft);
  border-radius: 28px;
  box-shadow: var(--shiin-shadow-1);
  overflow: hidden;
  container-type: inline-size;
  container-name: widget;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.shiin-dash-card.is-editing {
  box-shadow: var(--shiin-shadow-2);
}

.shiin-dash-card__resize-grip {
  position: absolute;
  right: 6px;
  bottom: 6px;
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  cursor: nwse-resize;
  color: var(--shiin-muted);
  opacity: 0.65;
  transition: opacity 140ms ease, transform 140ms ease, color 140ms ease;
  z-index: 10;
  touch-action: none;
  user-select: none;
}

.shiin-dash-card__resize-grip:hover {
  opacity: 1;
  color: var(--md-sys-color-primary);
  transform: scale(1.25);
}

.shiin-dash-card__edit-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 6px 10px;
  margin: -10px -12px 14px;
  background: var(--md-sys-color-surface-container-high);
  border-radius: 18px;
  border: 1px solid var(--shiin-line-soft);
}

.shiin-dash-card__edit-drag {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: grab;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--shiin-muted);
}

.shiin-dash-card__edit-sizes {
  display: flex;
  align-items: center;
  gap: 3px;
  background: var(--md-sys-color-surface-container);
  padding: 2px;
  border-radius: 12px;
}

.shiin-dash-card__size-btn {
  padding: 2px 7px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--shiin-muted);
  font-size: 10.5px;
  font-weight: 700;
  cursor: pointer;
}

.shiin-dash-card__size-btn.is-active {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.shiin-dash-card__edit-actions {
  display: flex;
  align-items: center;
  gap: 3px;
}

.shiin-dash-card__ctrl-btn {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--shiin-muted);
  cursor: pointer;
}

.shiin-dash-card__ctrl-btn:hover {
  background: var(--md-sys-color-surface-container);
  color: var(--shiin-ink);
}

.shiin-dash-card__ctrl-btn.is-danger:hover {
  background: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
}

.shiin-dash-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.shiin-dash-card__title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.shiin-dash-card__icon-seat {
  position: relative;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  color: var(--md-sys-color-on-secondary-container);
  flex-shrink: 0;
}

.shiin-dash-card__icon-shape {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  fill: var(--md-sys-color-secondary-container);
}

.shiin-dash-card__titles {
  min-width: 0;
}

.shiin-dash-card__title {
  margin: 0;
  font-size: 15px;
  font-weight: 750;
  letter-spacing: -0.02em;
  color: var(--shiin-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shiin-dash-card__desc {
  display: block;
  font-size: 11.5px;
  color: var(--shiin-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shiin-dash-card__head-aside {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.shiin-dash-card__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.shiin-dash-card__body.is-1x1 {
  height: 100%;
}

.shiin-dash-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  background: var(--md-sys-color-surface-container-high);
  border: 1px solid var(--shiin-line-soft);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
  color: var(--shiin-muted);
}

.shiin-dash-chip.is-live {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border-color: transparent;
}

.shiin-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #14b82c;
  box-shadow: 0 0 6px rgba(20, 184, 44, 0.6);
  animation: shiin-live-pulse 1.8s infinite ease-in-out;
}

@keyframes shiin-live-pulse {
  0%, 100% { opacity: 0.6; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.15); }
}

.shiin-dash-tabs {
  display: inline-flex;
  background: var(--md-sys-color-surface-container);
  padding: 2px;
  border-radius: 14px;
}

.shiin-dash-tab {
  padding: 3px 10px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--shiin-muted);
  font-size: 11px;
  font-weight: 650;
  cursor: pointer;
  transition: all 140ms ease;
}

.shiin-dash-tab.is-active {
  background: var(--shiin-surface);
  color: var(--shiin-ink);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.shiin-dash-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
  min-height: 140px;
  color: var(--shiin-muted);
  text-align: center;
}

.shiin-dash-empty p {
  margin: 0;
  font-size: 12.5px;
  max-width: 280px;
}

/* ============================================================
   Metric 1x1 / 2x1 Card
   ============================================================ */
.shiin-metric-frame .shiin-dash-card__body {
  padding: 0;
}

.shiin-metric-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  min-height: 120px;
}

.shiin-metric-card.is-2x1 {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.shiin-metric-card__left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.shiin-metric-card.is-2x1 .shiin-metric-card__left {
  height: auto;
}

.shiin-metric-card__right {
  flex: 0 0 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.shiin-metric-extra-gauge {
  padding: 10px 12px;
  border-radius: 16px;
  background: var(--md-sys-color-surface-container-low);
  border: 1px solid var(--shiin-line-soft);
}

.shiin-metric-extra-gauge__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 11px;
  font-weight: 700;
  color: var(--shiin-muted);
  margin-bottom: 5px;
}

.shiin-metric-extra-gauge__head strong {
  font-size: 13px;
  font-weight: 800;
  color: var(--shiin-ink);
}

.shiin-metric-extra-gauge__track {
  height: 6px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 5px;
}

.shiin-metric-extra-gauge__fill {
  height: 100%;
  background: var(--md-sys-color-primary);
  border-radius: 999px;
  transition: width 380ms ease;
}

.shiin-metric-extra-gauge small {
  display: block;
  font-size: 10px;
  color: var(--shiin-muted);
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shiin-metric-card__watermark {
  position: absolute;
  right: -10px;
  bottom: -15px;
  width: 90px;
  height: 90px;
  pointer-events: none;
  opacity: 0.28;
}

.shiin-metric-card.is-2x1 .shiin-metric-card__watermark {
  right: 150px;
  opacity: 0.16;
}

.shiin-metric-card__shape {
  width: 100%;
  height: 100%;
  fill: var(--md-sys-color-primary);
}

.shiin-metric-card__top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.shiin-metric-card__icon-seat {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 10px;
  background: var(--md-sys-color-surface-container);
  color: var(--shiin-ink);
}

.shiin-metric-card__label {
  font-size: 12px;
  font-weight: 700;
  color: var(--shiin-muted);
  white-space: nowrap;
}

.shiin-metric-card__pill-wrap {
  margin-left: auto;
}

.shiin-metric-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--md-sys-color-surface-container);
  color: var(--shiin-muted);
  font-size: 10.5px;
  font-weight: 700;
}

.shiin-metric-chip.is-accent {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.shiin-metric-chip.is-live {
  background: rgba(20, 184, 44, 0.12);
  color: #15803d;
}

.shiin-metric-card__hero {
  margin-top: 10px;
  z-index: 1;
}

.shiin-metric-card__value {
  display: block;
  font-size: 32px;
  font-weight: 850;
  letter-spacing: -0.04em;
  line-height: 1.1;
  color: var(--shiin-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shiin-metric-card__sub {
  display: block;
  margin-top: 3px;
  font-size: 11.5px;
  color: var(--shiin-muted);
}

/* ============================================================
   Top Apps Widget (Responsive Comparative Layout)
   ============================================================ */
.shiin-top-apps {
  flex: 1;
  overflow-y: auto;
}

.shiin-top-apps.is-wide,
@container widget (min-width: 480px) {
  .shiin-top-apps__dual-pane {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    gap: 16px;
    height: 100%;
  }
}

.shiin-top-apps__col {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.shiin-top-apps__col-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--shiin-line-soft);
}

.shiin-top-apps__col-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--shiin-ink);
}

.shiin-top-apps__col-head small {
  font-size: 10.5px;
  color: var(--shiin-muted);
  font-weight: 600;
}

.shiin-app-champion-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 8px;
  border-radius: 16px;
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.shiin-app-champion-card__icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  flex-shrink: 0;
}

.shiin-app-champion-card__body {
  flex: 1;
  min-width: 0;
}

.shiin-app-champion-card__badge {
  display: block;
  font-size: 9.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.8;
}

.shiin-app-champion-card__name {
  display: block;
  font-size: 13.5px;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shiin-app-champion-card__stats {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  opacity: 0.85;
}

.shiin-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: currentColor;
}

.shiin-top-apps__sublist {
  display: grid;
  gap: 6px;
  overflow-y: auto;
  max-height: 240px;
}

.shiin-top-apps__list {
  display: grid;
  gap: 9px;
}

.shiin-top-app-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 7px 10px;
  border-radius: 16px;
  background: var(--md-sys-color-surface-container-low);
  transition: background 140ms ease;
}

.shiin-top-app-row:hover {
  background: var(--md-sys-color-surface-container);
}

.shiin-top-app-row.is-champion {
  background: color-mix(in srgb, var(--md-sys-color-primary-container) 45%, var(--md-sys-color-surface-container-low));
}

.shiin-top-app-row__info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.shiin-top-app-row__rank {
  font-size: 11px;
  font-weight: 800;
  color: var(--shiin-muted);
  width: 20px;
}

.shiin-top-app-row.is-champion .shiin-top-app-row__rank {
  color: var(--md-sys-color-on-primary-container);
}

.shiin-top-app-row__name-block {
  flex: 1;
  min-width: 0;
}

.shiin-top-app-row__name {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: var(--shiin-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shiin-top-app-row__sub {
  display: block;
  font-size: 11px;
  color: var(--shiin-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shiin-top-app-row__stats {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.shiin-top-app-row__time {
  font-size: 11px;
  color: var(--shiin-muted);
}

.shiin-top-app-row__count {
  font-size: 13px;
  font-weight: 800;
  color: var(--shiin-ink);
}

.shiin-top-app-row__pct {
  font-size: 11px;
  font-weight: 700;
  color: var(--shiin-muted);
  width: 32px;
  text-align: right;
}

.shiin-top-app-row__bar-track {
  height: 5px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.shiin-top-app-row__bar-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--md-sys-color-secondary);
  transition: width 380ms ease;
}

.shiin-top-app-row.is-champion .shiin-top-app-row__bar-fill {
  background: var(--md-sys-color-primary);
}

/* ============================================================
   Capture Heatmap Widget (Responsive Panoramic & Streaks)
   ============================================================ */
.shiin-heatmap {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  gap: 14px;
}

.shiin-heatmap.is-compact-h {
  justify-content: center;
  gap: 4px;
}

.shiin-heatmap.is-wide,
@container widget (min-width: 500px) {
  .shiin-heatmap__panoramic {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.85fr);
    gap: 16px;
    min-height: 130px;
  }
}

.shiin-heatmap__pane-left,
.shiin-heatmap__pane-right {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.shiin-heatmap__subhead {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: var(--shiin-ink);
  margin-bottom: 6px;
}

.shiin-heatmap__subhead small {
  margin-left: auto;
  font-size: 10px;
  color: var(--shiin-muted);
  font-weight: 600;
}

.shiin-heatmap__chart-wrap,
.shiin-heatmap__week-wrap {
  flex: 1;
  min-height: 110px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.shiin-heatmap__bars {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 105px;
  padding-bottom: 20px;
}

.shiin-heatmap__bars.is-compact {
  height: 60px;
  padding-bottom: 14px;
}

.shiin-heatmap__bar-col {
  position: relative;
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}

.shiin-heatmap__bar-track {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: var(--md-sys-color-surface-container);
  border-radius: 6px;
  overflow: hidden;
}

.shiin-heatmap__bar-fill {
  width: 100%;
  background: var(--md-sys-color-secondary);
  border-radius: 6px;
  transition: height 320ms ease;
}

.shiin-heatmap__bar-col.is-peak .shiin-heatmap__bar-fill {
  background: var(--md-sys-color-primary);
  box-shadow: 0 0 10px rgba(200, 240, 0, 0.45);
}

.shiin-heatmap__bar-label {
  position: absolute;
  bottom: -18px;
  font-size: 9.5px;
  font-weight: 700;
  color: var(--shiin-muted);
  white-space: nowrap;
}

.shiin-heatmap__bar-tip {
  position: absolute;
  top: -26px;
  opacity: 0;
  pointer-events: none;
  background: #111;
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 6px;
  white-space: nowrap;
  transition: opacity 140ms ease;
  z-index: 10;
}

.shiin-heatmap__bar-col:hover .shiin-heatmap__bar-tip {
  opacity: 1;
}

.shiin-heatmap__week-bars {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 105px;
  padding-bottom: 20px;
}

.shiin-heatmap__week-col {
  position: relative;
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
}

.shiin-heatmap__week-count {
  font-size: 11px;
  font-weight: 800;
  color: var(--shiin-muted);
}

.shiin-heatmap__week-col.is-peak .shiin-heatmap__week-count {
  color: var(--shiin-ink);
}

.shiin-heatmap__streak-panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--shiin-line-soft);
}

.shiin-streak-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 16px;
  background: var(--md-sys-color-surface-container-low);
}

.shiin-streak-pill__content strong {
  display: block;
  font-size: 13.5px;
  font-weight: 800;
  color: var(--shiin-ink);
  line-height: 1.1;
}

.shiin-streak-pill__content small {
  display: block;
  font-size: 10.5px;
  color: var(--shiin-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ============================================================
   Gamepad Heatmap Widget (Responsive Dual-Pane)
   ============================================================ */
.shiin-pad-heatmap {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  gap: 14px;
}

.shiin-pad-heatmap.is-wide,
@container widget (min-width: 480px) {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: 16px;
  align-items: start;
}

.shiin-pad-schematic-pane {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.shiin-pad-legend {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 8px;
  font-size: 9.5px;
  color: var(--shiin-muted);
}

.shiin-pad-legend__bar {
  flex: 1;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(to right, var(--md-sys-color-surface-container), var(--md-sys-color-primary));
}

.shiin-pad-ranking-pane {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.shiin-pad-categories {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.shiin-pad-cat-chip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 8px;
  border-radius: 10px;
  background: var(--md-sys-color-surface-container-low);
  font-size: 10.5px;
}

.shiin-pad-cat-chip span { color: var(--shiin-muted); }
.shiin-pad-cat-chip strong { color: var(--shiin-ink); font-weight: 750; }

.shiin-pad-schematic {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 12px;
  background: var(--md-sys-color-surface-container-low);
  border-radius: 22px;
}

.shiin-pad-cluster.is-shoulders {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shiin-pad-pair {
  display: flex;
  gap: 4px;
}

.shiin-pad-center-nav {
  display: flex;
  gap: 5px;
}

.shiin-pad-main-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 8px;
}

.shiin-pad-cluster-label {
  display: block;
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--shiin-muted);
  text-align: center;
  margin-bottom: 4px;
}

.shiin-pad-dpad {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.shiin-pad-dpad__mid {
  display: flex;
  align-items: center;
}

.shiin-pad-dpad__core {
  width: 22px;
  height: 22px;
  background: var(--md-sys-color-surface-container);
}

.shiin-pad-diamond {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.shiin-pad-diamond__mid {
  display: flex;
  align-items: center;
}

.shiin-pad-diamond__core {
  width: 22px;
  height: 22px;
}

.shiin-pad-sticks {
  display: flex;
  gap: 10px;
}

.shiin-pad-stick-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.shiin-pad-stick-box small {
  font-size: 9.5px;
  color: var(--shiin-muted);
}

.shiin-pad-key {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 10px;
  border: 1px solid transparent;
  cursor: default;
  transition: transform 120ms ease;
  user-select: none;
}

.shiin-pad-key:hover {
  transform: scale(1.08);
}

.shiin-pad-key__name {
  font-size: 10.5px;
  font-weight: 800;
  line-height: 1;
}

.shiin-pad-key__count {
  font-size: 8px;
  opacity: 0.85;
  font-family: var(--shiin-mono);
}

.shiin-pad-ranking {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.shiin-pad-ranking__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.shiin-pad-ranking__head strong {
  font-size: 12.5px;
  color: var(--shiin-ink);
}

.shiin-pad-ranking__head small {
  font-size: 10px;
  color: var(--shiin-muted);
}

.shiin-pad-ranking__list {
  display: grid;
  gap: 4px;
}

.shiin-pad-ranking__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 10px;
  background: var(--md-sys-color-surface-container-low);
  font-size: 11px;
}

.shiin-pad-ranking__pos {
  font-weight: 800;
  color: var(--shiin-muted);
  width: 16px;
}

.shiin-pad-ranking__key {
  font-weight: 700;
  color: var(--shiin-ink);
  min-width: 80px;
}

.shiin-pad-ranking__bar {
  flex: 1;
  height: 4px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 999px;
  overflow: hidden;
}

.shiin-pad-ranking__bar-fill {
  height: 100%;
  background: var(--md-sys-color-primary);
  border-radius: 999px;
}

.shiin-pad-ranking__count {
  font-family: var(--shiin-mono);
  font-weight: 750;
  font-size: 11px;
}

.shiin-pad-ranking__pct {
  color: var(--shiin-muted);
  font-size: 10px;
  width: 28px;
  text-align: right;
}

/* ============================================================
   Listener Stats Widget (Responsive Deck)
   ============================================================ */
.shiin-listener-stats {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  gap: 12px;
}

.shiin-listener-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 20px;
  background: var(--md-sys-color-surface-container-low);
  border: 1px solid var(--shiin-line-soft);
}

.shiin-listener-banner.is-active {
  background: var(--md-sys-color-primary-container);
  border-color: transparent;
  color: var(--md-sys-color-on-primary-container);
}

.shiin-listener-banner__icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: var(--shiin-surface);
  color: var(--shiin-ink);
  flex-shrink: 0;
}

.shiin-listener-banner.is-active .shiin-listener-banner__icon {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.shiin-listener-banner__copy {
  flex: 1;
  min-width: 0;
}

.shiin-listener-banner__copy strong {
  display: block;
  font-size: 13.5px;
  font-weight: 750;
}

.shiin-listener-banner__copy p {
  margin: 2px 0 0;
  font-size: 11.5px;
  color: var(--shiin-muted);
}

.shiin-listener-banner.is-active .shiin-listener-banner__copy p {
  color: var(--md-sys-color-on-primary-container);
  opacity: 0.85;
}

.shiin-listener-banner__aside {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.shiin-listener-metric-pill {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.08);
  font-size: 10px;
}

.shiin-listener-metric-pill strong {
  font-size: 13px;
  font-weight: 800;
}

.shiin-listener-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.shiin-listener-grid.is-4cols,
@container widget (min-width: 500px) {
  .shiin-listener-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.shiin-sub-tile {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 18px;
  background: var(--md-sys-color-surface-container-low);
}

.shiin-sub-tile__label {
  font-size: 11px;
  font-weight: 700;
  color: var(--shiin-muted);
}

.shiin-sub-tile__val {
  display: block;
  margin: 4px 0 2px;
  font-size: 20px;
  font-weight: 850;
  letter-spacing: -0.03em;
  color: var(--shiin-ink);
}

.shiin-sub-tile__val small {
  font-size: 11.5px;
  font-weight: 600;
}

.shiin-sub-tile__note {
  font-size: 10px;
  color: var(--shiin-muted);
}

/* ============================================================
   Activity Stream Widget (Responsive Split Inspector)
   ============================================================ */
.shiin-stream-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.shiin-icon-chip-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  border: 1px solid var(--shiin-line-soft);
  background: var(--md-sys-color-surface-container);
  color: var(--shiin-ink);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.shiin-icon-chip-btn.is-paused {
  background: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
  border-color: transparent;
}

.shiin-activity-stream {
  flex: 1;
  overflow-y: auto;
  max-height: 280px;
}

.shiin-activity-stream.is-wide,
@container widget (min-width: 580px) {
  .shiin-stream-split {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.95fr);
    gap: 14px;
    height: 100%;
    min-height: 240px;
  }
}

.shiin-stream-list.is-scrollable {
  overflow-y: auto;
  max-height: 260px;
  padding-right: 4px;
}

.shiin-stream-list {
  display: grid;
  gap: 8px;
}

.shiin-stream-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 16px;
  background: var(--md-sys-color-surface-container-low);
  cursor: pointer;
  transition: background 140ms ease, transform 140ms ease;
}

.shiin-stream-item:hover {
  background: var(--md-sys-color-surface-container);
}

.shiin-stream-item.is-selected {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border: 1px solid var(--md-sys-color-primary);
}

.shiin-stream-item.is-selected .shiin-stream-title {
  color: var(--md-sys-color-on-primary-container);
}

.shiin-stream-icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 10px;
  background: var(--shiin-surface);
  color: var(--shiin-ink);
  flex-shrink: 0;
  margin-top: 2px;
}

.shiin-stream-icon.is-screenshot {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.shiin-stream-icon.is-button_press {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.shiin-stream-icon.is-obs_replay {
  background: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
}

.shiin-stream-content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.shiin-stream-main {
  min-width: 0;
}

.shiin-stream-title {
  display: block;
  font-size: 12.5px;
  font-weight: 750;
  color: var(--shiin-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shiin-stream-desc {
  display: block;
  font-size: 11px;
  color: var(--shiin-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: var(--shiin-mono);
}

.shiin-stream-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.shiin-stream-exact {
  font-size: 11px;
  color: var(--shiin-ink);
  font-family: var(--shiin-mono);
}

.shiin-stream-rel {
  font-size: 10.5px;
  color: var(--shiin-muted);
}

.shiin-stream-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: 6px;
  border: 0;
  background: transparent;
  color: var(--shiin-muted);
  font-size: 10.5px;
  cursor: pointer;
}

.shiin-stream-copy-btn:hover {
  background: var(--md-sys-color-surface-container);
  color: var(--shiin-ink);
}

/* Event Inspector (Right Pane in Wide Mode) */
.shiin-stream-inspector {
  height: 100%;
  background: var(--md-sys-color-surface-container-low);
  border: 1px solid var(--shiin-line-soft);
  border-radius: 18px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.shiin-event-inspector {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  justify-content: space-between;
}

.shiin-event-inspector__head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.shiin-event-inspector__titles strong {
  display: block;
  font-size: 13px;
  font-weight: 800;
  color: var(--shiin-ink);
}

.shiin-event-inspector__titles small {
  display: block;
  font-size: 10.5px;
  color: var(--shiin-muted);
}

.shiin-event-inspector__body {
  display: grid;
  gap: 8px;
  font-size: 11px;
}

.shiin-inspector-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.shiin-inspector-row span {
  color: var(--shiin-muted);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.shiin-inspector-row strong {
  color: var(--shiin-ink);
  word-break: break-all;
}

.shiin-inspector-row code {
  font-family: var(--shiin-mono);
  font-size: 10px;
  background: var(--md-sys-color-surface-container);
  padding: 4px 6px;
  border-radius: 6px;
  word-break: break-all;
  border: 1px solid var(--shiin-line-soft);
}

.shiin-event-inspector__actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 6px;
  border-top: 1px solid var(--shiin-line-soft);
}

/* Material 3 Expressive 4-Corner Overlay Picker */
.sb-screen-corner-picker {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}
.sb-screen-corner-picker[data-disabled="true"] {
  opacity: 0.45;
  pointer-events: none;
}
.sb-screen-mockup {
  position: relative;
  width: 100%;
  height: 110px;
  border-radius: 16px;
  background: rgba(14, 17, 12, 0.88);
  border: 1.5px solid var(--sb-outline-soft);
  overflow: hidden;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.5);
}
.sb-screen-mockup__bezel {
  position: relative;
  width: 100%;
  height: 100%;
}
.sb-screen-mockup__hud-radar {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 1px dashed rgba(255, 255, 255, 0.08);
}
.sb-screen-mockup__crosshair {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  border-left: 1px solid rgba(255, 255, 255, 0.15);
}
.sb-screen-mockup__hud-bars {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.08);
}
.sb-screen-corner-hotspot {
  position: absolute;
  width: 90px;
  height: 38px;
  display: flex;
  align-items: center;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 0 10px;
  z-index: 2;
}
.sb-screen-corner-hotspot--top-left {
  top: 6px;
  left: 6px;
  justify-content: flex-start;
}
.sb-screen-corner-hotspot--top-right {
  top: 6px;
  right: 6px;
  justify-content: flex-end;
}
.sb-screen-corner-hotspot--bottom-left {
  bottom: 6px;
  left: 6px;
  justify-content: flex-start;
}
.sb-screen-corner-hotspot--bottom-right {
  bottom: 6px;
  right: 6px;
  justify-content: flex-end;
}
.sb-screen-corner-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--sb-muted);
  opacity: 0.35;
  transition: opacity 180ms ease, transform 180ms ease, background-color 180ms ease;
}
.sb-screen-corner-hotspot:hover .sb-screen-corner-dot {
  opacity: 0.9;
  transform: scale(1.4);
  background: var(--shiin-accent, #c9f56d);
}
.sb-screen-corner-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(201, 245, 109, 0.22);
  border: 1px solid rgba(201, 245, 109, 0.55);
  color: #c9f56d;
  font-size: 10px;
  font-weight: 750;
  box-shadow: 0 0 12px rgba(201, 245, 109, 0.3);
}
.sb-corner-chips {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}
.sb-corner-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-height: 32px;
  padding: 0 4px;
  border-radius: 999px;
  border: 1px solid var(--sb-outline-soft);
  background: var(--sb-surface-low);
  color: var(--sb-muted-strong);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 180ms ease, color 180ms ease, border-color 180ms ease;
}
.sb-corner-chip:hover {
  background: var(--sb-surface-high);
  color: var(--sb-text);
}
.sb-corner-chip.active {
  background: var(--sb-secondary);
  color: var(--sb-on-secondary);
  border-color: transparent;
}
.sb-corner-chip__badge {
  font-size: 8.5px;
  padding: 1px 4px;
  border-radius: 999px;
  background: rgba(201, 245, 109, 0.25);
  color: inherit;
  font-weight: 800;
}
.sb-corner-hint {
  margin: 3px 0 0;
  font-size: 11px;
  color: var(--sb-muted);
  line-height: 1.4;
}
`
