# 开发与构建指南 (Development Guide)

## 📦 包管理规范（Package Manager Policy）

> **重要声明**：本项目由团队与自动化工具统一维护，**唯一受支持的包管理工具为 `pnpm`**。
> **严禁使用 `yarn`、`npm`、`bun` 或其他工具提交 lockfile 或运行构建**。

- 推荐版本：`pnpm >= 9.0.0`（开发环境推荐 `pnpm 12.x`）
- 引擎锁配置：已在 `package.json` 声明 `"packageManager": "pnpm@12.11.2"`
- 依赖安装：
  ```bash
  pnpm install
  ```

---

## 🚀 常用构建脚本 (Scripts)

| 脚本命令 | 说明 |
| :--- | :--- |
| `pnpm build:packages` | 先编译 `packages/*` 两个 workspace 包到各自的 `dist/`（干净检出必须先跑这一步） |
| `pnpm build:node` | 先构建 workspace 包，再编译核心库 `src/core` 及相关 Node.js / Electron 入口到 `lib/` |
| `pnpm build:app-ui` | 使用 Rspack 编译独立客户端 UI 资源 |
| `pnpm build:app` | 一键编译核心库 + 独立客户端 UI 资源 |
| `pnpm electron:start` | 启动开发环境桌面端 Electron |
| `pnpm pack:app` | 打包当前平台免安装可执行程序目录（Windows / macOS） |
| `pnpm dist:app` | 生成安装包（exe 安装器 / dmg 镜像） |
| `pnpm test` | 执行核心单元测试（Vitest） |
| `pnpm typecheck` | 执行全工程 TypeScript 类型检查 |
| `pnpm cli --help` | 构建后运行终端入口（`node lib/cli.mjs`） |
| `pnpm serve` | 启动本地 Web 控制台（浏览器只做显示，Node 进程持有 ScreenshotManager） |
| `pnpm tui` | 直接启动全屏终端工作台（OpenTUI；需要 Node ≥ 26 的 `node:ffi` 或 bun） |

> 终端面的设计、键位与降级说明见 [`docs/cli.md`](docs/cli.md)。
> `tests/tui.spec.tsx` 需要 FFI，Node 22 上会自动跳过；Node 26 上可单独跑。 React 版本固定为 19.x —— OpenTUI 的 reconciler 要求 `react >= 19.2`，降级到 18 会让 TUI 渲染空白。

---

## 🎮 双端开发环境 (Windows & macOS)

- **macOS 工作区**：`/Users/glow/Base/Code/Prometheus/Shiin`
- **Windows 工作区**：`D:\Base\Code\Prometheus\Shiin`
- 双端同步与构建时均必须在终端中调用 `pnpm`。
