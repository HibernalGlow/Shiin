# @hibernalglow/gamepad-expressive

> Material Design 3 Expressive Gamepad Visualizer, Full Vector Line-Art Shapes, Button Icons, and SDL_GameControllerDB Standardizer.

Supports **Xbox** (Series, One, 360), **PlayStation** (DualSense, DualShock 4), **Nintendo Switch** (Pro Controller, Joy-Cons), and **Domestic / Generic Third-Party Gamepads** (8BitDo, Beitong, Flydigi, Machenike, GameSir, Gulikit, Thunderobot, PXN, etc.).

---

## Features

- 🎮 **Full Controller Vector Shapes**: Real vector SVG controller bodies with animated thumbstick displacement (with 3D tilt & shadow), trigger depression & fill gauges, L3/R3 clicks, D-pad rocking, and tactile button presses.
- 📐 **Decoupled Button Architecture**: Decouples physical face positions (`south`, `east`, `west`, `north`) from visual platform symbols:
  - **Xbox**: South = A, East = B, West = X, North = Y
  - **PlayStation**: South = ✕, East = ○, West = □, North = △
  - **Nintendo**: South = B, East = A, West = Y, North = X
- 🔍 **Three-Tier Identification Engine**:
  - Exact match via Vendor ID (VID) and Product ID (PID)
  - SDL GUID byte extraction
  - Regex heuristics for domestic third-party controllers in PC / XInput mode
  - Fallback to modern Xbox layout with manual skin switching
- 🗄️ **Bundled SDL_GameControllerDB Database**: Includes 2,200+ official SDL mappings for automatic raw-to-standard mapping across macOS, Windows, Linux, Android, iOS.
- 🎨 **Material 3 Expressive (MD3 Expressive)**: Fluid, tactile, responsive, supports adaptive CSS color tokens (`--md-sys-color-*`).
- 📦 **Zero Runtime Dependencies**: Pure React + SVG, works in React 18, React 19, Next.js, Vite, Electron, and Xaihi / Cordis micro-frontends.

---

## Installation

```bash
pnpm add @hibernalglow/gamepad-expressive
# or
npm install @hibernalglow/gamepad-expressive
```

Import styles in your app entry:
```ts
import '@hibernalglow/gamepad-expressive/css'
```

---

## Quick Start

### 1. Ready-to-Use Controller Tester Card

```tsx
import { ControllerTester } from '@hibernalglow/gamepad-expressive'
import '@hibernalglow/gamepad-expressive/css'

export function App() {
  const [buttons, setButtons] = useState<boolean[]>([])
  const [axes, setAxes] = useState<number[]>([])

  return (
    <ControllerTester
      buttons={buttons}
      axes={axes}
      locale="zh"
      allowFamilySwitch={true}
    />
  )
}
```

### 2. Standalone Controller Visualizer Component

```tsx
import { ExpressiveGamepad, type StandardGamepadState } from '@hibernalglow/gamepad-expressive'

export function GamepadView({ state }: { state: StandardGamepadState }) {
  return (
    <ExpressiveGamepad
      state={state}
      family="playstation" // 'xbox' | 'playstation' | 'nintendo' | 'generic' | 'auto'
      interactive={true}
      onButtonPress={(key) => console.log('Pressed:', key)}
    />
  )
}
```

### 3. Standalone Platform Button Icons

```tsx
import { GamepadButtonIcon } from '@hibernalglow/gamepad-expressive/icons'

// Renders PlayStation ✕ (Cross)
<GamepadButtonIcon button="south" family="playstation" size={28} />

// Renders Xbox A (Green)
<GamepadButtonIcon button="south" family="xbox" size={28} />

// Renders Nintendo B (Back)
<GamepadButtonIcon button="south" family="nintendo" size={28} />
```

### 4. Input Standardization & SDL Mapping

```ts
import {
  findSdlMapping,
  mapSdlToStandard,
  mapStandardHardware,
  detectController,
} from '@hibernalglow/gamepad-expressive'

// 1. Detect device family
const info = detectController({
  name: 'DualSense Wireless Controller',
  guid: '030057564c050000e60c000000016800',
  vendorId: 1356,
  productId: 3302,
})
console.log(info.family) // 'playstation'
console.log(info.displayName) // 'DualSense Wireless Controller'

// 2. Query SDL GameControllerDB
const mapping = findSdlMapping({ guid: '030057564c050000e60c000000016800' })

// 3. Map raw inputs into standardized state
const standardState = mapSdlToStandard(
  { buttons: rawButtons, axes: rawAxes },
  mapping
)
```

---

## License

MIT © AmagiSakuya / HibernalGlow
Line art vector paths derived from [Gamepad Line Art Pack](https://gidedin.itch.io/gamepad-line-art-pack) (CC0 1.0 Universal).
Database derived from [SDL_GameControllerDB](https://github.com/mdqinc/SDL_GameControllerDB) (Zlib License).
