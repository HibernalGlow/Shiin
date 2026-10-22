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
