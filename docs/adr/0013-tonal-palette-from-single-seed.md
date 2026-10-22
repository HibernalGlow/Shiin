# ADR-0013: 单一青色种子派生全部 MD3 色调角色

- **状态**：已接受 (Accepted)
- **日期**：2026-10-20
- **关联**：ADR-0007（Expressive 控件语法）

## 背景

形状实验室与权限摘要在迭代中引入了手写的紫罗兰
`--sb-secondary-container: #3b2d5c` 与淡紫描边 `#c7b7ff`。它们与
`#c9f56d` 的青柠种子不在同一色相，也不属于 MD3 tonal palette 的任何
角色：既不是 primary 的降彩度版本，也不是可由 tertiary 色相偏移解释的
颜色。表面中性色（`#1c1a21`、`#332f3a`）同时带有紫调，使整个界面看起来
像“青柠按钮 + 紫色主题”的拼贴，违背了颜色 token 算法。

参考集也明确要求“配色与造型是两条独立的轴”：同一套形状可以换种子色，
但每个种子必须完整派生自己的角色，而不是挑选一个不相干的强调色。

## 决策

### 1. 只允许一个种子

当前主题种子为青柠 `#C9F56D`。所有内容区与壳层色调角色都从它派生：

| 角色 | Tone | 值 | 说明 |
| --- | --- | --- | --- |
| primary | 80 | `#C9F56D` | 主操作、选中形状座位 |
| on-primary | 20 | `#1C2A05` | 主操作上的文字/图标 |
| primary-container | 30 | `#34491C` | 高亮容器、导航选中底 |
| on-primary-container | 90 | `#E5FFB2` | 高亮容器上的文字 |
| secondary | 80 | `#C2D3A0` | 低彩度同色相强调 |
| on-secondary | 20 | `#28341A` | |
| secondary-container | 30 | `#3D4B28` | 形状/策略选中底 |
| on-secondary-container | 90 | `#DCEBBE` | |
| tertiary | 80 | `#7DF2D2` | 种子色相偏移后的三级强调 |
| on-tertiary | 20 | `#00382D` | |
| tertiary-container | 30 | `#164A3E` | 通知/就绪状态容器 |
| on-tertiary-container | 90 | `#C9FFEE` | |

中性色使用同一青柠色相的低彩度版本：
`surface-lowest #0C0E09`、`surface-low #141710`、`surface #191C14`、
`surface-high #24281D`、`on-surface #EEF1E5`、`outline #55604A`。

### 2. Secondary 不得换色相

Secondary 必须是 primary 色相的低彩度版本（上表的绿色），用于选中形状、
策略段、保存状态等“选中但非主操作”的场景。禁止再出现紫色、蓝色等
与种子无关的容器色。

### 3. 壳层与内容共用角色

`src/ui/md3e.tsx` 的 `.shiin-expressive-surface` 定义壳层 token；
`settings-bento-css.ts` 的 `.shiin-bento` 通过 `var(--xaihi-md3e-*)` 引用同一组
角色，而不是各自写死颜色。标题栏、通知浮层、Electron 窗口底色也必须
引用这些角色。

### 4. 新增强调色的唯一方式

需要新的语义色时，只能：

- 从种子派生新的 tonal role（同色相或规范允许的 tertiary 偏移），或
- 使用语义角色（error / success），并同时给出 on- 配对色。

不得直接在一个卡片或按钮里写一个“看起来好看”的十六进制色。

## 后果

- 形状选中态、策略选中态、权限摘要与环境面板回到同一绿色家族，紫色消失。
- 颜色对比度仍由 tone 80/90 对 tone 20/30 的配对保证。
- 设计评审需要检查：新颜色是否能在种子 tonal palette 中找到角色。
- 验收：源码中不得再出现 `#3b2d5c`、`#ede3ff`、`#c7b7ff`；三个页面的
  表面中性色必须保持绿调；选中形状与策略段使用 secondary 角色。
