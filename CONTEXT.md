# Gamepad Screenshot (Shiin) Domain Model

The cross-host, dual-mode tool for capturing game screens and saving instant replays via gamepad combos, hotkeys, or host-native operations.

## Language

**Standalone Mode**:
The desktop execution mode where the application runs independently via Electron without requiring Xaihi or any external host.
_Avoid_: Local mode, offline mode, native mode

**Plugin Mode**:
The modular execution mode where the package is installed into Xaihi as a standard node and bundle, rendering via Module Federation and executing via Cordis.
_Avoid_: Xaihi mode, embedded mode, extension mode

**Shared Core**:
The headless, framework-agnostic business logic layer encompassing gamepad polling, screenshot capture, active window discovery, OBS orchestration, and filename formatting.
_Avoid_: Backend, common utils, shared library

**Gamepad Combo**:
A configured combination of physical buttons, axes, or directional hat positions on a gamepad that triggers capture or buffer actions upon press or release.
_Avoid_: Keybinding, hotkey combination, shortcut

**Replay Buffer**:
The rolling recording cache maintained in OBS that can be saved to disk upon a long-press of a gamepad combo.
_Avoid_: Instant replay, clip, DVR cache

**Host Bridge**:
The abstract interface decoupling UI views from underlying host mechanics (Electron IPC vs. Xaihi Command/DSH wire).
_Avoid_: RPC layer, adapter shim, event bus

**Tray Runner**:
The lightweight background daemon mode living strictly in the system tray without a foreground window.
_Avoid_: Silent mode, daemon process, background task
