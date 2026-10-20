export const SETTINGS_BENTO_CSS = String.raw`
.xaihi-md3e-node-frame[data-surface="bento"] {
  padding: 0;
  overflow: hidden;
  background: #fdf8f4;
  color: #241713;
}
.xaihi-md3e-node-frame[data-surface="bento"] > .shiin-bento {
  flex: 1 1 auto;
  min-height: 0;
}

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
  /* Tonal roles are derived from the lime seed: green-tinted neutrals,
     a low-chroma green secondary and a hue-shifted teal tertiary. */
  --sb-bg: #0c0e09;
  --sb-surface: #191c14;
  --sb-surface-low: #141710;
  --sb-surface-high: #24281d;
  --sb-surface-highest: #303526;
  --sb-text: #eef1e5;
  --sb-muted: #aeb6a1;
  --sb-muted-strong: #d1d9c4;
  --sb-outline: #55604a;
  --sb-outline-soft: rgba(238, 241, 229, 0.1);
  --sb-primary: var(--xaihi-md3e-primary, #c9f56d);
  --sb-on-primary: var(--xaihi-md3e-on-primary, #1c2a05);
  --sb-primary-container: var(--xaihi-md3e-primary-container, #34491c);
  --sb-on-primary-container: var(--xaihi-md3e-on-primary-container, #e5ffb2);
  --sb-secondary: var(--xaihi-md3e-secondary, #c2d3a0);
  --sb-on-secondary: var(--xaihi-md3e-on-secondary, #28341a);
  --sb-secondary-container: var(--xaihi-md3e-secondary-container, #3d4b28);
  --sb-on-secondary-container: var(--xaihi-md3e-on-secondary-container, #dcebbe);
  --sb-tertiary: var(--xaihi-md3e-tertiary, #7df2d2);
  --sb-on-tertiary: var(--xaihi-md3e-on-tertiary, #00382d);
  --sb-tertiary-container: var(--xaihi-md3e-tertiary-container, #164a3e);
  --sb-on-tertiary-container: var(--xaihi-md3e-on-tertiary-container, #c9ffee);
  --sb-error: #ffb4ab;
  --sb-error-container: #4a1f1c;
  --sb-on-error-container: #ffdad6;
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
  .shiin-bento .sb-notify-tile { grid-column: span 12; }
  .shiin-bento .sb-notify-tile .sb-notify-actions { max-width: 320px; }
}
@container node (max-width: 860px) {
  .shiin-bento .sb-shape-tile { grid-column: span 12; }
  .shiin-bento .sb-session-tile { grid-column: span 12; }
  .shiin-bento .sb-shape-lab { grid-template-columns: 220px minmax(0, 1fr); }
  .shiin-bento .sb-data-tile { flex-wrap: wrap; }
  .shiin-bento .sb-data-actions { margin-left: 0; width: 100%; }
}
@container node (max-width: 860px) {
  .shiin-bento .sb-perm-tile,
  .shiin-bento .sb-perm-test,
  .shiin-bento .sb-perm-folder { grid-column: span 12; }
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
  .shiin-bento .sb-notify-tile { grid-column: span 12; }
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
`
