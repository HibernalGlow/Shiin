# ADR-0006: 独立手柄采集子进程解耦与 CC Switch 式轻量生命周期架构

- **状态**：已采纳 (Accepted)
- **日期**：2026-10-19
- **相关方**：Shiin 核心开发组 / Electron 桌面端架构组

---

## 背景与问题

Shiin 桌面端最初为了规避在 Electron 主进程（macOS Cocoa RunLoop / NSApplication）下直接加载 `@kmamal/sdl` 原生扩展引发的底层崩溃与兼容性风险，在 [src/core/gamepad.ts](../../src/core/gamepad.ts) 中对 Electron 环境做出了直接跳过 SDL 加载的安全限制。这一设计导致手柄输入采集退化并强耦合于前端渲染进程：
1. **输入与 UI 生命周期强绑定**：手柄状态依赖渲染进程 [src/ui/App.tsx](../../src/ui/App.tsx) 依靠浏览器 `navigator.getGamepads()` 每 60ms 轮询，再通过 IPC `syncWebGamepad` 注入主进程。一旦关闭或销毁主窗口，手柄输入完全中断，游戏内组合键截图与 OBS 回放随之失效。
2. **伪托盘模式与资源占用**：原 `--tray` 启动参数仅调用 `createWindow(false)` 将窗口置为隐藏，前端渲染进程、Chromium WebContents 与 React 完整组件树依然常驻内存，无法实现类似 CC Switch（销毁 UI 释放渲染资源、仅保留后台业务引擎）的轻量模式。
3. **组合键重复判定与事件竞争**：前端 `App.tsx` 与核心层 `GamepadCore` 分别实现了一套组合键匹配与截图触发逻辑，窗口打开时存在双重判定和重复截图隐患。
4. **窗口重建与状态丢失**：窗口重新创建时若简单调用设备重连，原有 `openDevice` 逻辑会调用 `stopListening()` 导致原本正常运行的后台监听被意外中断；且前端组件重新挂载时若未从后台核心同步状态，界面状态会脱节。

## 决策

我们决定遵循「销毁的是 UI，而非应用业务引擎」的原则，对输入采集与桌面宿主生命周期进行架构重构：

### 1. 基于 Electron `utilityProcess` 的手柄独立采集进程
- **原生扩展进程隔离**：将 `@kmamal/sdl` 从主进程中完全剥离，放置于专用的独立子进程 [src/app/electron/gamepad-worker.ts](../../src/app/electron/gamepad-worker.ts) 中运行。
- **技术选型**：优先采用 Electron 官方的 `utilityProcess.fork()` API（而非依赖环境变量的 `ELECTRON_RUN_AS_NODE=1`），规避 runAsNode fuse 限制，确保在打包生产环境中的稳定性与官方支持。
- **明确的进程角色判断**：在 [src/core/gamepad.ts](../../src/core/gamepad.ts) 中实现 `canLoadNativeSdl()`，根据 `process.type === 'utility'`、`SHIIN_GAMEPAD_WORKER === '1'` 或非 Electron 环境明确放行 SDL 加载，同时严格禁止在 Electron 主进程 (`browser`) 和渲染进程 (`renderer`) 中直载。
- **按需差分推送与自愈容错**：Worker 进程以 ~60Hz 采样手柄轴与按键，仅在设备插拔或轴/按键发生实质变动时向主进程推送状态快照（静止时 IPC 吞吐为零）；主进程设置 1.5s 崩溃自动重拉起守卫，确保原生驱动异常不拖垮整个应用。

### 2. 统一组合键判定引擎与防抖冷却
- **唯一触发源**：移除前端 `App.tsx` 中的组合键匹配判定与快门触发逻辑，将其完全收拢于核心层 `GamepadCore`，前端仅保留按键实时指示与组合键录制状态机。
- **防连发冷却与长按拦截**：`GamepadCore` 内置 300ms 触发冷却保护，杜绝按键物理抖动引发的连发重复截屏；长按（≥1000ms）触发 OBS 回放缓存后自动标记拦截，松开组合键时不再触发快门截屏。

### 3. CC Switch 式三态生命周期与按需重建
应用在桌面宿主下明确支持三种运行状态：
| 运行状态 | 主窗口 (BrowserWindow) | 渲染进程 (WebContents) | 后台业务引擎 / 手柄 Worker / 托盘 | macOS 状态 |
| :--- | :--- | :--- | :--- | :--- |
| **正常运行模式** | 显示 | 活跃常驻 | 持续运行 | 显示 Dock 图标 |
| **最小化到托盘** (`closeType: 'tray'`) | 隐藏 | 驻留内存（快速唤醒） | 持续运行 | 保持当前 Dock 状态 |
| **轻量模式** (`isLightweightMode: true`) | **彻底销毁** (`win.destroy()`) | **完全释放** (零内存消耗) | 持续运行（手柄截图/OBS随时响应） | 隐藏 Dock 图标 (`app.dock.hide()`) |

- **进入轻量模式 (`enterLightweightMode`)**：设置轻量模式标志，主动销毁 `BrowserWindow` 实例，macOS 下隐藏 Dock 图标，刷新托盘菜单勾选项；后台 `ScreenshotManager`、手柄采集 Worker、键盘钩子与 OBS 连接继续保持工作。
- **打开主界面 / 退出轻量模式 (`showMainWindow`)**：macOS 恢复 Dock 图标，按需重新创建 `BrowserWindow` 并加载 React 页面，通过 `getRuntimeState()` 从后台核心无损同步当前监听状态、活动手柄与全局配置。
- **无窗口快门音效保底**：当主窗口销毁处于轻量模式时，主进程接管快门音效，通过原生音频通道自动播放快门反馈声，保证用户操作反馈一致。
- **生命周期守卫**：通过 `isLightweightMode` 守卫 `window-all-closed` 与 `close` 事件，防止主动销毁窗口触发应用退出；将单实例二次激活 (`second-instance`)、macOS 点击 Dock 图标 (`activate`) 与托盘点击事件统一路由至 `showMainWindow()`。

### 4. 真正的 `--tray` 轻量冷启动
启动参数包含 `--tray`、`--lightweight` 或配置了 `startInLightweightMode` 时，主进程在 `app.on('ready')` 中跳过 `createWindow()`，直接执行 `enterLightweightMode()`。此时应用以纯后台服务形态启动，仅显示托盘图标，前端资源在用户主动点击托盘前完全不加载。

## 权衡与后果

- **正面收益**：
  - **内存大幅削减**：轻量模式下彻底释放 Chromium 渲染树与 React 内存开销，使 Shiin 能够作为后台常驻工具长效运行。
  - **架构健壮与隔离**：原生手柄扩展运行于独立子进程，硬件驱动或 ABI 异常不会导致主进程退出，具备自我修复重启能力。
  - **业务一致性**：后台服务与 UI 解耦，无论界面是否存在，手柄组合键截图、长按 OBS 回放、全屏浮层通知与快门音效行为完全一致。
- **代价与权衡**：
  - 引入了主进程与 `utilityProcess` 的跨进程通信调度，但通过脏检查与变化阈值将空闲开销降到了最低。
  - 打包分发时需要在 [package.json](../../package.json) 的 `build.asarUnpack` 中显式解包 `node_modules/@kmamal/sdl/**` 原生二进制文件。
