# ADR-0008: 本地 Web 宿主与共享 ScreenshotManager

- **状态**：已采纳 (Accepted)
- **日期**：2026-10-20
- **相关方**：Shiin 核心 / CLI / Web 宿主

---

## 背景与问题

1. **核心层已经与 Electron 解耦**：截图（`node-screenshots` / `screenshot-desktop` / `active-win`）、手柄（`@kmamal/sdl`）、全局键盘（`uiohook-napi`）均为 Node 原生模块；TUI 与 pipe 命令已经在纯 Node 进程中直接持有 `ScreenshotManager`。
2. **旧的 Web 预览是另一套实现**：`src/app/preview.mjs` 只托管 `dist/ui` 并直接调用 `performScreenshot()`，没有实例化 `ScreenshotManager`，因此没有手柄设备列表、没有监听生命周期、没有共享配置；UI 的 `startListening` 在 Web 回退路径中甚至直接返回 `true` 而未真正启动。
3. **需求形态是“Node 常驻、浏览器只做显示”**：页面关闭或刷新不应影响手柄组合键、全局热键、截图与 OBS 回放；Web 与 TUI/CLI 必须读写同一份配置。
4. **浏览器手柄 API 不能作为真源**：Web Gamepad API 需要标签页聚焦，且按钮索引由浏览器映射，与 SDL 的 `ButtonN` 不保证一致，不能用于全局监听或组合键持久化。

## 决策

### 1. 唯一的手柄/截图引擎初始化入口

新增 [src/app/cli/manager.ts](../../src/app/cli/manager.ts) 的 `createManager()`，统一负责：

- 解析 CLI 配置目录与工作区口径（`preferCwd`）；
- 创建 `ScreenshotManager` 与 `FileConfigStorage`；
- 应用 `SHIIN_SCREENSHOT_DIR` 覆盖；
- 启动时绑定第一只手柄并读回其组合键。

TUI、pipe 与 Web 三个入口都从这里拿到同一份 `ScreenshotManager`，差别只在驱动方式：TUI/pipe 在进程内直接调用，Web 经过 HTTP。

### 2. `shiin serve`：Node 是应用本体，浏览器是显示器

新增本地 HTTP 宿主 [src/app/server/index.ts](../../src/app/server/index.ts) 的 `startWebServer()`，由 `shiin serve` / `shiin web` 启动：

- 默认监听 `127.0.0.1:3800`，支持 `--port`、`--host`、`--no-open` 与 `SHIIN_WEB_PORT`；
- 托管 `dist/ui`，并自动打开浏览器；
- 进程内持续持有 `ScreenshotManager`、SDL 设备句柄、`uiohook-napi` 键盘钩子与 OBS 连接；
- 页面刷新、关标签页都不影响后台监听；
- 没有页面通过 SSE 连接时，由 Node 宿主直接播放快门声并弹系统通知（[src/app/server/background-feedback.ts](../../src/app/server/background-feedback.ts)）；页面打开时交给前端，避免重复；
- `src/app/preview.mjs` 改为 `shiin serve` 的薄启动器，避免维护第二套 Web 桥。

### 3. HTTP 与 SSE 契约

宿主直接调用同一个 manager，不引入 Web 框架：

| 方法 | 路径 | 作用 |
| :--- | :--- | :--- |
| `GET` | `/api/state` | 配置、监听状态、活动手柄、设备列表 |
| `GET` | `/api/gamepads` | 手柄设备列表 |
| `GET` | `/api/gamepad/state` | 当前 buttons / axes 快照 |
| `POST` | `/api/gamepads/open`、`/api/gamepads/close` | 打开/关闭设备句柄 |
| `POST` | `/api/listen/start`、`/api/listen/stop` | 监听生命周期 |
| `GET` | `/api/listen/state` | 当前监听状态 |
| `POST` | `/api/store/get`、`/api/store/set` | 服务端配置存储（含 `globalConfig` 同步） |
| `POST` | `/api/capture`、`/api/test-screenshot` | 走 manager 的截图与权限实测 |
| `POST` | `/api/obs/save-replay` | 保存 OBS 回放缓存 |
| `GET` | `/api/permissions`、`POST /api/request-permission` | 无 `systemPreferences` 时的主动探测与设置面板 |
| `GET` | `/api/events` | SSE：截图、回放、设备插拔、监听状态 |
| 其他 | `GET /api/screens`、`GET /api/windows`；`POST /api/open-folder`、`/api/select-folder`、`/api/show-in-folder` | 设备枚举与本地文件操作 |

UI 侧 [src/ui/adapter/electron.ts](../../src/ui/adapter/electron.ts) 在不存在 `window.electronAPI` 时改走上述 `/api/*`：

- 配置读写落到服务端 `FileConfigStorage`，`localStorage` 只保留 UI-only 兜底；
- 按钮/轴状态读取 `/api/gamepad/state`，Web Gamepad API 仅在 Node 宿主不可达时兜底；
- 截图完成/回放完成/监听变化通过 SSE 事件进入 [src/ui/App.tsx](../../src/ui/App.tsx)，不再直接依赖 `window.electronAPI` 的事件。

### 4. 本地安全边界

本地 HTTP 能触发截图、开启全局监听，因此宿主在路由前强制校验：

- 默认只绑定回环地址；
- `Host` 必须是回环地址，阻断 DNS rebinding；
- 带 `Origin` 的请求必须来自回环页面或与 `Host` 同源，否则返回 `403`；
- 不发送 CORS 头，跨站页面无法读取响应；
- 使用 `--host` 绑定非回环地址时在终端明确告警，鉴权交给使用者自己的反代。

### 5. Electron 保持为可选宿主

本次不删除 Electron。桌面端继续提供托盘、透明覆层通知、轻量模式、自动更新等系统壳能力；Web 模式放弃这些壳能力，但保留核心引擎。这样 `electron` 仍是 `optionalDependencies`，而 Web/TUI/CLI 不依赖它。

## 权衡与后果

**正面收益**

- **单一真源**：TUI、CLI、Web 共用同一份配置、同一套手柄索引与组合键解析，避免“网页和终端各存一份”的分裂。
- **后台行为一致**：浏览器关闭后监听继续；重新打开页面即可从 `/api/state` 恢复状态。
- **无 Electron 也能用**：`node lib/cli.mjs serve` 即可完成核心截图/手柄/热键工作。
- **可测试**：HTTP 宿主以窄接口接收 manager，服务端 API、SSE、安全校验都可以在 vitest 中用 stub manager 覆盖。

**代价与限制**

- Node 进程必须常驻；关掉终端或服务进程就失去全局监听。
- 浏览器里的手柄状态只是显示，不能把 Web Gamepad API 当作录制/触发真源。
- macOS 的屏幕录制/辅助功能权限归属于启动 Node 的宿主进程（终端或签名的二进制）；这与 Electron 打包签名是两套 TCC 口径，需要在发布形态上明确。
- 托盘、透明覆层通知、轻量模式、自动更新仍只在 Electron 宿主中存在；Web 模式用系统通知与系统快门声补齐“页面未打开”时的后台反馈。
- 手柄状态通过 HTTP 轮询（UI 约 60ms，服务端 25ms 快照缓存）；若未来需要更低延迟，可把状态也并入 SSE。

**明确不做**

- 不做多用户/公网 Web 部署，也不在内置宿主里实现登录鉴权。
- 不让浏览器承担全局监听或组合键触发。
- 不为了 Web 模式引入 Express/Fastify 等额外 HTTP 框架。

## 备选方案

1. **保留旧的 preview 直调 core 函数**：只适合看 UI，无法共享配置与手柄状态，且会继续出现“监听假成功”。已否决。
2. **以 Web Gamepad API 作为唯一手柄源**：标签页失去焦点就冻结，按钮索引与 SDL 不一致，无法满足全局触发。已否决。
3. **在 Electron 内嵌 Web 服务器**：仍然要求安装 Electron，CLI/TUI 无法复用。已否决。
4. **引入 Web 框架**：当前 API 面小且同源本地访问，原生 `node:http` 足够，避免额外依赖。已否决。

## 验证

- `tests/web-server.spec.ts`：6 条测试覆盖静态托管、state/store、监听生命周期、手柄打开、截图/OBS 分发、SSE 推送、后台反馈触发条件与跨源拒绝。
- `pnpm typecheck` 通过；`pnpm test` 全部 95 条通过。
- `pnpm build:node` 与 `pnpm build:app-ui` 通过。
- 实机启动 `shiin serve --port 3818 --no-open` 后：页面可加载，UI 显示 SDL 识别到的 DualSense、共享配置中的 `Button10/Button12`、截图目录与实时 buttons/axes；浏览器网络记录显示 `/api/events` 以 `text/event-stream` 连接；恶意 `Origin` 与伪造 `Host` 均返回 `403`；`SIGTERM` 后宿主与预览启动器都能干净退出。
