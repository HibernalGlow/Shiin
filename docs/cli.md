# 终端面（CLI / TUI）

Shiin 的终端入口分三条腿，规则只有一条：**带子命令就走管道面**，绝不把交互 UI 画进管道。

| 腿 | 引擎 | 入口 | 适合 |
| :--- | :--- | :--- | :--- |
| `ui` | OpenTUI | `shiin`、`shiin ui`、`shiin tui`、`shiin-tui` | 盯着手柄输入、反复截图 / 存回放 |
| `gd` | `@clack/prompts` | `shiin gd`、`shiin guided` | 偶尔截一张，按提示选参数 |
| `pipe` | 纯 stdout | `capture` / `replay` / `devices` / `listen` / `config` / `doctor` | 脚本、SSH、`--json` |

另有 `shiin serve`：本地 HTTP 宿主，浏览器只做显示；手柄、全局热键、截图和配置都留在 Node 进程里。它和 TUI 共用同一个 `ScreenshotManager`，只是 TUI 在进程内直接调用，Web 经过一层 HTTP + SSE。

## 全局安装

`bin` 指向 `lib/` 里的构建产物，所以先构建，再把三个入口挂到全局前缀：

```bash
pnpm build:node

PREFIX="$(npm prefix -g)"                       # Homebrew node: /opt/homebrew；系统 node: /usr/local
ln -sfn "$PWD" "$PREFIX/lib/node_modules/@hibernalglow/xaihi-shiin"
for b in shiin shiin-cli; do
  ln -sfn ../lib/node_modules/@hibernalglow/xaihi-shiin/lib/cli.mjs "$PREFIX/bin/$b"
done
ln -sfn ../lib/node_modules/@hibernalglow/xaihi-shiin/lib/tui-bin.mjs "$PREFIX/bin/shiin-tui"
```

装完就是 `shiin`、`shiin-cli`、`shiin-tui` 三个命令，且**指向本仓**（改完 `pnpm build:node` 立即生效）。
卸载：删掉这三条软链和 `$PREFIX/lib/node_modules/@hibernalglow/xaihi-shiin`。

> pnpm 12 的 `pnpm add -g <path>` 要求全局 bin 目录已在 PATH 里（`pnpm setup` 会改 shell 配置）。
> 没配过 `PNPM_HOME` 的机器用上面的软链更省事，也不动 dotfiles。

Windows 上用 bun 装（`bun` 的全局 bin 目录默认就在 PATH 里）：

```bat
pnpm build:node
bun add -g D:\Base\Code\Prometheus\Shiin --omit optional --ignore-scripts
```

- `--omit optional` 跳过 `electron` 这个可选依赖；
- `--ignore-scripts` 绕开 bun 全局树里别的包（例如 vite 的 esbuild）的 postinstall 冲突；
- bun 默认是**拷贝**安装。想让 `pnpm build:node` 立即生效，把全局目录换成指向仓库的 junction：

```bat
rmdir /s /q "%USERPROFILE%\..\scoop\persist\bun\install\global\node_modules\@hibernalglow\xaihi-shiin"
mklink /J "%USERPROFILE%\..\scoop\persist\bun\install\global\node_modules\@hibernalglow\xaihi-shiin" "D:\Base\Code\Prometheus\Shiin"
```

> 注意：`bun add -g` 产出的 `shiin.exe` 会读入口的 shebang，所以仍然用 `node` 跑；Windows 的 Node 没有
> `node:ffi`，TUI 会自动接力到 bun。若机器上还留着 npm 的全局链接（`%APPDATA%\npm\shiin.cmd`），
> 它会先于 bun 命中，先 `npm unlink -g @hibernalglow/xaihi-shiin` 再装。

### 装到全局后的路径

在仓库目录里运行时，配置和截图仍落在 `./config`、`./screenshots`（开发时的老行为）；
从**任意其他目录**运行时，默认落到用户目录，不会污染当前目录：

| 内容 | 仓库内 | 仓库外 |
| :--- | :--- | :--- |
| 配置 | `<repo>/config/localStorage.json` | macOS：`~/Library/Application Support/Shiin`；Windows：`%APPDATA%\Shiin`；Linux：`~/.config/shiin` |
| 截图 | `<repo>/screenshots` | `~/Pictures/Shiin`；Windows 上若 `Pictures` 不可用（例如指向已失效的 OneDrive junction），退到 `%APPDATA%\Shiin\Screenshots` |

显式覆盖：`SHIIN_CONFIG_DIR=/path`、`SHIIN_SCREENSHOT_DIR=/path`。

## 命令

```bash
shiin                      # 终端里打开全屏工作台；非 TTY 打印帮助
shiin ui | tui             # 全屏 TUI（OpenTUI）
shiin gd | guided          # 引导式问答截图
shiin capture [flags]      # 立即截图
shiin replay               # 保存 OBS 回放缓存
shiin notify [flags]       # 弹出桌面端同款覆层通知（可带截图预览）
shiin listen               # 前台监听手柄组合键与快捷键（Ctrl+C 停止）
shiin serve [flags]        # 启动本地 Web 控制台（--port 3800 --host 127.0.0.1 --no-open）
shiin devices              # 手柄 / 显示器 / 窗口清单
shiin config               # 查看配置（--json 可机读）
shiin config set <k> <v>   # 写配置，例如：shiin config set imageFormat webp（另有 imageQuality / imageLossless / imageEffort）
shiin config get <k>       # 读单个键
shiin doctor               # 环境自检：运行时 / FFI / SDL / OBS / 目录
```

`combo` 的用法：

```bash
shiin combo                              # 进录制：按下要绑定的键，静置 1.2 秒自动保存
shiin combo --set "Button0,Button7"      # 直接写（脚本用；也接受 Axis2+ / Axis5-）
shiin combo --set "Button0,Axis2+" --json
shiin combo --clear                      # 清空
shiin combo --json                       # 只读当前值
```

录制时按下的键会逐条打印（`+ Button0`）；Ctrl+C 取消，30 秒没有任何输入则超时退出。
组合键**按设备保存**（存储键就是手柄名），换一只手柄要重录——不同手柄的按键编号本来就不一样。

`capture` 的旗标：`--target screen|window`、`--screen <id>` / `--window <id|focused>`（直接指定源，id 来自 `shiin devices`）、`--window-mode specified|focused`、`--save file|clipboard|both`、`--format jpg|png|webp|avif`、`--quality 1-100`、`--lossless`（WebP / AVIF 无损）、`--path <dir>`、`--json`、`--no-notify`（本次不弹覆层）。

## 窗口目标：指定窗口 vs 聚焦窗口

窗口捕获有两种口径，桌面端、`capture`、`gd`、TUI 共用同一份配置：

| 口径 | 行为 |
| :--- | :--- |
| `focused`（聚焦窗口） | 每次触发时重新读取**当前前台窗口**。切到哪个窗口就截哪个，不需要预先选择。 |
| `specified`（指定窗口） | 始终截 `windowSourceId` 保存的那一扇窗口；窗口不存在就报错，不会偷偷换成别的窗口。 |

命令行：

```bash
shiin capture --target window --window focused   # 这一次直接截当前聚焦窗口
shiin capture --target window --window 12345     # 这一次截指定 id（见 shiin devices）
shiin config set windowCaptureMode focused       # 以后所有触发都跟随聚焦窗口
shiin config set windowCaptureMode specified
shiin config set windowSourceId 12345            # 指定口径下要截的窗口
```

TUI 的设置页在「截图目标 → 窗口」下可切换「聚焦窗口 / 指定窗口」；选「指定窗口」时会列出可捕获窗口。
桌面端工作台的捕获目标同样有「指定窗口 / 聚焦窗口」两个入口。

新配置默认是 `focused`。老存档如果没有 `windowCaptureMode`：存过 `windowSourceId` 的按 `specified` 迁移，没存过的使用 `focused`。

全局旗标：`--lang zh|en`、`--theme <name>`、`--renderer opentui`、`--version`、`--help`。
主题名见 `src/app/cli/tui/theme.tsx`（`nord`、`dracula`、`tokyo-night`、`catppuccin`、`gruvbox`、`matrix`、`high-contrast-light`）。

## 覆层通知（与桌面端同一份）

`capture`、`replay`、`listen` 以及 TUI 里的截图/回放，都会弹出和桌面端**同一份** `screenshot-notification.html`
（TUI 里也可以按 `N` 单独测一条）：
透明圆角卡片、四角任选（`top-left` / `top-right` / `bottom-left` / `bottom-right`，旧的 `left` / `right` 归到对应上角）、跨工作区置顶、不抢焦点，截图成功时带 64×64 缩略图。位置和尺寸读配置里的
`overlayNotifyPosition` / `overlayNotifySize`，时长默认 4.5 秒。

实现上由 `src/app/electron/overlay.ts` 起一个 Electron 辅助进程，CLI 通过 `SHIIN_OVERLAY_PAYLOAD`
传图与文案；已在显示时再触发会走 Electron 单实例锁，后一条替换前一条，不会叠出一排通知。
辅助进程在第一次弹出后**不会立刻退出**：窗口按 `duration` 关闭，进程保留 10 分钟空闲时间给下一次通知复用
（`SHIIN_OVERLAY_IDLE_MS` 可改，设为 `0` 则窗口关闭后立即退出）。Electron 在本包里是
`optionalDependencies`：

- 正常安装（含 optional）会直接用 Electron 弹同款卡片。
- `--omit optional` / 没装 Electron 时退到系统通知（macOS `osascript`、Windows Toast、Linux `notify-send`）；
  文本仍在，但**没有同款卡片与缩略图**。要保证图片预览，装回 Electron，或用 `SHIIN_ELECTRON=/path/to/Electron` 指定运行时。
- `SHIIN_OVERLAY=off` 全局关闭；`shiin doctor` 的 `overlay` 一行会读出当前后端。
- 排查启动链路：`SHIIN_OVERLAY_DEBUG=1` 会把 payload、Electron 路径与子进程退出码写到系统临时目录的 `shiin-overlay.log`；TUI 占用终端时也能看。

手动测试（会绕过配置里的 `overlayNotify: hide`，方便验证渲染）：

```bash
shiin notify --img ./shot.png --title "截图成功" --desc "shot.png"
shiin notify --img ./shot.png --position left --size 1.25 --duration 6000 --json
shiin notify --title "只弹文字" --type text
```

`notify` 旗标：`--img <file>`、`--title <text>`、`--desc <text>`、`--type video|text`、
`--position left|right`、`--size 0.6-2`、`--duration <ms>`、`--json`。`notify` 与 `/api/notify` 的
`--position` 目前仍只收旧的两个值；屏幕四角走配置键 `overlayNotifyPosition`（设置页有四角选择器）。

## 退出码

| 码 | 含义 |
| :--- | :--- |
| `0` | 成功 |
| `1` | 动作失败（截图失败、OBS 未连接……） |
| `2` | 用法错误，或在非交互终端里请求了 `ui` / `gd` |
| `3` | OpenTUI 起不来，且没有可接力的 bun |

## 运行时与降级

OpenTUI 的后端是 Zig 编译的原生库，必须经 FFI 加载：bun 用 `bun:ffi`，Node 用 `node:ffi`（Node ≥ 26，实验特性）。
判据不是"`import('@opentui/core')` 成功"，而是 **FFI 底座在不在、平台原生库能不能构造**——Node 22 上 import 照样成功，一调 `createCliRenderer` 就炸；Windows 的 Node 26 干脆没有 `node:ffi`。`shiin doctor` 会真的把原生库构造一次再 dispose，失败就点名。

- Node ≥ 26 或 bun：`ui` 直接用。
- Node 22 且 PATH 上有 bun：先打印一行原因，再把进程交给 bun 重跑（**显式接力**，不是偷偷换运行时）。
- 两者都没有：点名缺什么，退出码 3，并提示改用 `gd`。

`shiin doctor` 会把这条链路上的每一环读回来：

```
✓ 运行时: node 26.11.1
✓ OpenTUI FFI: ok (257 exports)
✓ 手柄后端 (SDL): loaded
✗ OBS WebSocket: 未连接
✓ 保存目录: /Users/<you>/Pictures/Screenshots
```

## 键位（TUI）

| 键 | 动作 |
| :--- | :--- |
| `Space` | 开关手柄 / 快捷键监听 |
| `C` | 立即截图 |
| `R` | 保存 OBS 回放缓存 |
| `N` | 弹一条测试覆层通知（验证与桌面端同款卡片） |
| `S` | 设置页（目标、窗口来源、保存方式、格式、目录） |
| `D` | 设备页（手柄 / 显示器 / 窗口） |
| `?` / `H` | 帮助 |
| `T` | 切换主题 |
| `L` | 切换中 / 英文 |
| `Q` / `Esc` | 退出 |

设置页里点「录制组合键」或按 `R`，然后按下要绑定的手柄按键，静置 1.2 秒自动保存；`Esc` 取消。
TUI 启动时就会打开第一只手柄的设备句柄，**不需要先开监听**也能读到按键（工作台左栏的实时输入同理）。
路径输入框聚焦时，字母键归输入框，`Esc` 让它失焦（不会关掉设置页）。

录制时没有任何反应的话，先确认设备本身被系统看见了：

```bash
shiin devices        # 列表里要能出现你的手柄
```

组合键按设备保存，换一只手柄要重录；`shiin combo --json` 可以确认当前值。

## 结构

```
src/app/cli/
├─ index.ts          入口：命令表、模式路由、运行时探测与接力
├─ host.ts           CliHost（stdin/stdout/cwd/env 的抽象）
├─ args.ts           旗标解析
├─ rich.ts           boxen / chalk / string-width 的面板与进度条
├─ i18n.ts           CLI 与 TUI 共用的中英文案
├─ interaction.ts    渲染器中立的字段表 + 模式路由
├─ plan.ts           一次截图的参数表（gd 用）
├─ guided.ts         @clack/prompts 的问答流
├─ actions.ts        执行层：截图 / 回放 / 监听 / 设备 / 配置 / 自检
├─ clipboard.ts      命令行下的图片剪贴板（osascript / PowerShell / xclip）
├─ overlay.ts        覆层通知启动器：Electron 辅助进程 / 系统通知回退
├─ paths.ts          工作区判定与配置/截图目录口径
├─ runtime.ts        FFI 探测、降级文案、bun 查找
└─ tui/
   ├─ runner.tsx     createCliRenderer + createRoot + 退出收敛
   ├─ app.tsx        全局键盘、页头页脚、页面路由
   ├─ screens.tsx    工作台 / 设置 / 设备 / 帮助
   ├─ session.ts     手柄轮询、事件订阅、动作与日志
   ├─ combo.ts       组合键录制的纯逻辑（边沿检测/去重）
   ├─ components.tsx 面板、按钮、键帽、轴条
   ├─ theme.tsx      调色板与 Provider
   └─ icons.ts       语义图标
```

## 测试

`tests/cli.spec.ts` 覆盖模式路由、旗标解析、计划往返、宽度截断等纯逻辑，任何 Node 版本都跑。
`tests/overlay.spec.ts` 覆盖覆层 payload（位置/尺寸/时长收敛）、`SHIIN_OVERLAY` 开关与 `--no-notify` 的映射。
`tests/tui.spec.tsx` 用 `@opentui/react/test-utils` 真渲染一帧并断言按键能触发截图，但测试渲染器仍要 FFI，
所以在 Node < 26 上**跳过**而不是伪造渲染器。想跑它：`/opt/homebrew/bin/node node_modules/vitest/vitest.mjs run tests/tui.spec.tsx`（Node 26+）。
