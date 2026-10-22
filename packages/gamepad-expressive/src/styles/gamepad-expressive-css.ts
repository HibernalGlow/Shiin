/**
 * Embedded CSS for Gamepad Expressive components (MD3 Expressive "神似而不求形似")
 */
export const GAMEPAD_EXPRESSIVE_CSS = String.raw`
.gp-controller-root {
  --gp-primary: var(--md-sys-color-primary, #c8f000);
  --gp-on-primary: var(--md-sys-color-on-primary, #273000);
  --gp-primary-container: var(--md-sys-color-primary-container, #e7f6a8);
  --gp-surface: var(--md-sys-color-surface-container-lowest, #fbfaf4);
  --gp-surface-container-low: var(--md-sys-color-surface-container-low, #eae8de);
  --gp-surface-container: var(--md-sys-color-surface-container, #e4e2d6);
  --gp-surface-high: var(--md-sys-color-surface-container-high, #dedccf);
  --gp-outline: var(--md-sys-color-outline-variant, #c5c8b9);
  --gp-ink: var(--md-sys-color-on-surface, #343831);
  --gp-muted: var(--md-sys-color-on-surface-variant, #5c6054);
  --gp-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --gp-tactile: cubic-bezier(0.18, 0.89, 0.32, 1.28);

  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.gp-controller-wrap {
  position: relative;
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  aspect-ratio: 16 / 10.5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gp-controller-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
  user-select: none;
}

/* Abstract input field: it preserves the user's mental map without drawing a branded chassis. */
.gp-input-field {
  --gp-coral: #d86b5d;
  --gp-cyan: #6f9da0;
  --gp-olive: #85864a;
  position: relative;
  display: grid;
  gap: 12px;
  width: 100%;
  padding: 16px;
  overflow: hidden;
  border-radius: 30px 18px 30px 18px;
  background: var(--gp-surface-container-low);
  color: var(--gp-ink);
  isolation: isolate;
}
.gp-input-field--xbox { --gp-primary: #b9e600; --gp-coral: #cf6b5d; --gp-cyan: #6f9da0; --gp-olive: #85864a; }
.gp-input-field--playstation { --gp-primary: #b7d7f1; --gp-coral: #d47f93; --gp-cyan: #6e9db9; --gp-olive: #8d86aa; }
.gp-input-field--nintendo { --gp-primary: #b8e1d2; --gp-coral: #e18476; --gp-cyan: #78aeba; --gp-olive: #918a55; }
.gp-input-field--generic { --gp-primary: #c8d2a0; --gp-coral: #c78a78; --gp-cyan: #81a6a8; --gp-olive: #8b8c69; }
.gp-input-field::before,
.gp-input-field::after { content: ''; position: absolute; z-index: -1; pointer-events: none; border: 1px solid color-mix(in srgb, var(--gp-outline) 68%, transparent); border-radius: 50%; }
.gp-input-field::before { width: 240px; height: 240px; left: -122px; bottom: -156px; }
.gp-input-field::after { width: 300px; height: 300px; right: -170px; top: -190px; }
.gp-input-field__rail { display: flex; align-items: center; gap: 8px; padding: 0 6px; color: var(--gp-outline); }
.gp-input-field__rail-line { height: 1px; flex: 1; background: currentColor; opacity: .72; }
.gp-input-field__rail-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gp-primary); box-shadow: 0 0 0 4px color-mix(in srgb, var(--gp-primary) 18%, transparent); }
.gp-input-field__header { display: flex; align-items: center; gap: 9px; min-height: 30px; padding: 0 4px; }
.gp-input-field__family-mark { position: relative; display: flex; align-items: center; width: 34px; height: 24px; flex: none; }
.gp-input-field__family-mark span { position: absolute; display: block; border: 1.5px solid var(--gp-ink); background: var(--gp-primary); }
.gp-input-field__family-mark-primary { width: 18px; height: 18px; left: 0; border-radius: 8px 3px 8px 3px; transform: rotate(-10deg); }
.gp-input-field__family-mark-secondary { width: 13px; height: 13px; left: 10px; top: 1px; border-radius: 50%; background: var(--gp-coral) !important; transform: rotate(18deg); }
.gp-input-field__family-mark-tertiary { width: 9px; height: 9px; left: 21px; top: 9px; border-radius: 3px 50% 3px 50%; background: var(--gp-cyan) !important; transform: rotate(-18deg); }
.gp-input-field--playstation .gp-input-field__family-mark-primary { border-radius: 50%; transform: rotate(0); }
.gp-input-field--playstation .gp-input-field__family-mark-secondary { border-radius: 2px; transform: rotate(45deg); }
.gp-input-field--nintendo .gp-input-field__family-mark-primary { border-radius: 999px; width: 21px; height: 12px; top: 5px; transform: rotate(-18deg); }
.gp-input-field--nintendo .gp-input-field__family-mark-secondary { width: 20px; height: 12px; left: 14px; top: 7px; border-radius: 999px; transform: rotate(18deg); }
.gp-input-field--nintendo .gp-input-field__family-mark-tertiary { display: none; }
.gp-input-field__family-copy { display: grid; gap: 1px; min-width: 0; }
.gp-input-field__family-copy strong { color: var(--gp-ink); font: 800 11px/1.1 ui-sans-serif, system-ui, sans-serif; letter-spacing: .02em; }
.gp-input-field__family-copy span { color: var(--gp-muted); font: 800 8px/1 ui-monospace, monospace; letter-spacing: .14em; }
.gp-input-field__live { display: inline-flex; align-items: center; gap: 5px; margin-left: auto; color: var(--gp-muted); font: 800 8px/1 ui-monospace, monospace; letter-spacing: .12em; }
.gp-input-field__live i { width: 6px; height: 6px; border-radius: 50%; background: var(--gp-primary); box-shadow: 0 0 0 4px color-mix(in srgb, var(--gp-primary) 18%, transparent); animation: gp-live-breathe 1.8s ease-in-out infinite; }
@keyframes gp-live-breathe { 0%, 100% { transform: scale(.82); opacity: .72; } 50% { transform: scale(1.15); opacity: 1; } }
.gp-input-field__shoulders, .gp-input-field__triggers { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 10px; }
.gp-input-field__triggers { grid-template-columns: 1fr 1fr; }
.gp-input-field__channel { display: grid; place-items: center; gap: 3px; color: var(--gp-muted); font: 800 9px/1 ui-monospace, monospace; letter-spacing: .14em; }
.gp-input-field__channel i { width: 28px; height: 4px; border-radius: 999px; background: var(--gp-primary); }
.gp-input-field__plane { display: grid; grid-template-columns: minmax(0,1fr) 112px minmax(0,1fr); gap: 10px; align-items: center; }
.gp-input-field__left, .gp-input-field__right { position: relative; display: block; min-width: 0; min-height: 142px; }
.gp-input-field__left > .gp-dpad-signal,
.gp-input-field__right > .gp-face-signal { position: absolute; top: 0; transform: scale(.82); }
.gp-input-field__left > .gp-dpad-signal { left: 0; transform-origin: top left; }
.gp-input-field__right > .gp-face-signal { right: 0; transform-origin: top right; }
.gp-input-field__left > .gp-stick-signal,
.gp-input-field__right > .gp-stick-signal { position: absolute; bottom: 0; transform: scale(.82); }
.gp-input-field__left > .gp-stick-signal { right: 0; transform-origin: bottom right; }
.gp-input-field__right > .gp-stick-signal { left: 0; transform-origin: bottom left; }
.gp-input-field__core { display: grid; justify-items: center; gap: 8px; padding: 12px 8px; border: 1px solid var(--gp-outline); border-radius: 24px 12px 24px 12px; background: color-mix(in srgb, var(--gp-surface) 76%, transparent); }
.gp-input-core-mark { display: flex; gap: 5px; }
.gp-input-core-mark span { width: 6px; height: 6px; border-radius: 50%; background: var(--gp-outline); }
.gp-input-core-mark span:first-child { background: var(--gp-primary); }
.gp-input-core-label { color: var(--gp-muted); font: 800 8px/1 ui-monospace, monospace; letter-spacing: .16em; white-space: nowrap; }
.gp-input-core-meter { width: 76px; height: 4px; overflow: hidden; border-radius: 999px; background: var(--gp-surface-high); }
.gp-input-core-meter i { display: block; width: 100%; height: 100%; transform-origin: left center; border-radius: inherit; background: var(--gp-primary); transition: transform 120ms ease-out; }
.gp-input-core-system { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px; }
.gp-signal-button { position: relative; display: grid; place-items: center; min-width: 38px; min-height: 34px; padding: 5px 10px; border: 1px solid var(--gp-outline); border-radius: 14px 8px 14px 8px; background: var(--gp-surface); color: var(--gp-ink); font: 800 11px/1 ui-monospace, monospace; transition: transform 180ms var(--gp-spring), border-radius 260ms var(--gp-spring), background 160ms ease, color 160ms ease; }
.gp-signal-button:disabled { cursor: default; opacity: 1; }
.gp-signal-button:not(:disabled) { cursor: pointer; }
.gp-signal-button:hover:not(:disabled) { transform: translateY(-2px); }
.gp-signal-button.is-active { border-color: var(--gp-ink); border-radius: 50% 12px 50% 12px; background: var(--gp-primary); color: var(--gp-on-primary); transform: scale(1.06); }
.gp-input-field--playstation .gp-face-signal .gp-signal-button { border-radius: 50%; }
.gp-input-field--playstation .gp-face-signal__north { border-radius: 50% 50% 12px 12px; }
.gp-input-field--playstation .gp-face-signal__west { border-radius: 50% 12px 12px 50%; }
.gp-input-field--playstation .gp-face-signal__east { border-radius: 12px 50% 50% 12px; }
.gp-input-field--playstation .gp-face-signal__south { border-radius: 12px 12px 50% 50%; }
.gp-input-field--nintendo .gp-face-signal .gp-signal-button { border-radius: 18px 8px 18px 8px; }
.gp-input-field--nintendo .gp-face-signal__north { transform: rotate(6deg); }
.gp-input-field--nintendo .gp-face-signal__south { transform: rotate(-6deg); }
.gp-input-field--nintendo .gp-face-signal__west { transform: rotate(-6deg); }
.gp-input-field--nintendo .gp-face-signal__east { transform: rotate(6deg); }
.gp-input-field--nintendo .gp-face-signal .gp-signal-button.is-active { transform: rotate(0) scale(1.08); }
.gp-input-field--xbox .gp-face-signal .gp-signal-button { border-radius: 14px 8px 14px 8px; }
.gp-signal-button--coral.is-active { background: var(--gp-coral); color: #fff7f4; }
.gp-signal-button--cyan.is-active { background: var(--gp-cyan); color: #102c2d; }
.gp-signal-button--olive.is-active { background: var(--gp-olive); color: #fff9e6; }
.gp-signal-button--shoulder { min-width: 0; width: 100%; justify-self: stretch; }
.gp-signal-button__pulse { position: absolute; inset: -5px; border: 1px solid currentColor; border-radius: inherit; opacity: .5; animation: gp-signal-pulse 780ms var(--gp-spring) both; }
@keyframes gp-signal-pulse { from { transform: scale(.82); opacity: .7; } to { transform: scale(1.16); opacity: 0; } }
.gp-dpad-signal { position: relative; width: 96px; height: 96px; flex: none; }
.gp-dpad-signal .gp-signal-button { position: absolute; width: 30px; min-width: 30px; height: 30px; min-height: 30px; padding: 0; }
.gp-dpad-signal__up { left: 33px; top: 0; border-radius: 14px 14px 6px 6px; }
.gp-dpad-signal__left { left: 0; top: 33px; border-radius: 14px 6px 6px 14px; }
.gp-dpad-signal__center { left: 33px; top: 33px; border-radius: 50%; pointer-events: none; }
.gp-dpad-signal__right { right: 0; top: 33px; border-radius: 6px 14px 14px 6px; }
.gp-dpad-signal__down { left: 33px; bottom: 0; border-radius: 6px 6px 14px 14px; }
.gp-face-signal { position: relative; width: 100px; height: 100px; flex: none; }
.gp-face-signal .gp-signal-button { position: absolute; width: 34px; min-width: 34px; height: 34px; min-height: 34px; padding: 0; }
.gp-face-signal__north { left: 33px; top: 0; }
.gp-face-signal__west { left: 0; top: 33px; }
.gp-face-signal__east { right: 0; top: 33px; }
.gp-face-signal__south { left: 33px; bottom: 0; }
.gp-stick-signal { position: relative; display: grid; gap: 4px; min-width: 76px; padding: 0; border: 0; background: transparent; color: var(--gp-muted); }
.gp-stick-signal:disabled { cursor: default; }
.gp-stick-signal__ring { position: relative; display: block; width: 70px; height: 70px; border: 1px solid var(--gp-outline); border-radius: 50%; background: var(--gp-surface); }
.gp-stick-signal__cross { position: absolute; background: var(--gp-outline); opacity: .6; }
.gp-stick-signal__cross--x { left: 12px; right: 12px; top: 50%; height: 1px; }
.gp-stick-signal__cross--y { top: 12px; bottom: 12px; left: 50%; width: 1px; }
.gp-stick-signal__marker { position: absolute; width: 14px; height: 14px; border: 2px solid var(--gp-ink); border-radius: 50% 35% 50% 35%; background: var(--gp-primary); transform: translate(-50%, -50%); transition: left 45ms linear, top 45ms linear, transform 180ms var(--gp-spring); }
.gp-stick-signal.is-active .gp-stick-signal__marker { transform: translate(-50%, -50%) scale(1.25); }
.gp-stick-signal__label { text-align: center; font: 800 9px/1 ui-monospace, monospace; letter-spacing: .1em; }
.gp-trigger-signal { position: relative; display: flex; align-items: center; gap: 8px; min-height: 28px; padding: 5px 8px; overflow: hidden; border-radius: 14px 6px 14px 6px; background: var(--gp-surface); color: var(--gp-muted); font: 800 10px/1 ui-monospace, monospace; }
.gp-trigger-signal i { position: absolute; left: 0; bottom: 0; height: 3px; background: var(--gp-primary); transition: width 80ms linear; }
@media (max-width: 560px) {
  .gp-input-field { padding: 12px; }
  .gp-input-field__plane { grid-template-columns: minmax(0,1fr) 84px minmax(0,1fr); gap: 4px; }
  .gp-input-field__left, .gp-input-field__right { min-height: 116px; }
  .gp-input-field__left > .gp-dpad-signal,
  .gp-input-field__right > .gp-face-signal { transform: scale(.66); }
  .gp-input-field__left > .gp-stick-signal,
  .gp-input-field__right > .gp-stick-signal { transform: scale(.7); }
  .gp-stick-signal__ring { width: 58px; height: 58px; }
  .gp-input-core-system .gp-signal-button { min-width: 30px; padding-inline: 5px; font-size: 9px; }
}

/* M3E Spring Tactile Button Morphing */
.gp-interactive-btn {
  cursor: pointer;
  transition:
    transform 160ms var(--gp-spring),
    filter 140ms ease-out,
    opacity 120ms ease-out;
  transform-box: fill-box;
  transform-origin: center;
}

.gp-interactive-btn:hover {
  transform: scale(1.06);
}

.gp-interactive-btn:active,
.gp-interactive-btn.active {
  transform: scale(0.9) rotate(-3deg);
  filter: drop-shadow(0 0 8px rgba(200, 240, 0, 0.65));
}

/* Analog Stick Motion */
.gp-stick-cap {
  transition: transform 45ms linear;
  will-change: transform;
  transform-box: fill-box;
  transform-origin: center;
}

.gp-stick-cap.clicked {
  filter: drop-shadow(0 2px 6px rgba(200, 240, 0, 0.55));
}

/* Trigger Progress Fill */
.gp-trigger-fill {
  transition: width 40ms linear, x 40ms linear;
  will-change: width, x;
}

/* Lightbar Halo Glow (DualSense) */
.gp-lightbar-halo {
  animation: gp-pulse-halo 2.8s ease-in-out infinite;
}

@keyframes gp-pulse-halo {
  0%, 100% { opacity: 0.72; }
  50% { opacity: 1; }
}

/* Tester Card Chrome */
.gp-tester-card {
  background: var(--gp-surface);
  border: 1.5px solid var(--gp-outline);
  border-radius: 24px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.gp-tester-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.gp-model-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: var(--gp-surface-container);
  border: 1.5px solid var(--gp-ink);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 750;
  color: var(--gp-ink);
}

.gp-family-selector {
  display: inline-flex;
  align-items: center;
  background: var(--gp-surface-container);
  border: 1.5px solid var(--gp-outline);
  border-radius: 999px;
  padding: 2px;
  gap: 2px;
}

.gp-family-btn {
  border: none;
  background: transparent;
  color: var(--gp-muted);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 160ms var(--gp-spring);
}

.gp-family-btn:hover {
  color: var(--gp-ink);
}

.gp-family-btn.active {
  background: var(--gp-primary);
  color: var(--gp-on-primary);
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.14);
}

.gp-readout-deck {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 10px;
  background: var(--gp-surface-container);
  border-radius: 18px;
  padding: 12px 14px;
}

.gp-readout-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.gp-readout-label {
  font-size: 10px;
  font-weight: 750;
  text-transform: uppercase;
  color: var(--gp-muted);
  letter-spacing: 0.6px;
}

.gp-readout-val {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  font-weight: 800;
  color: var(--gp-ink);
}
`
