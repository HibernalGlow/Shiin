# ADR-0002: 前端技术栈迁移（Vue 3 -> React 18 + MD 3 Expressive 设计规范）

- **状态**：提议中 (Proposed)
- **日期**：2026-10-19
- **相关方**：Shiin 开发组 / Xaihi 生态

---

## 背景与问题

目前 Shiin 的界面是基于 Vue 3 + Vue CLI 构建的单文件组件（SFC）。
然而：
1. 主 Xaihi 插件体系的前端采用 React 18 + Module Federation（MF2）微前端加载机制。如果保留 Vue，将无法被主 Xaihi 原生加载为第一方节点面板（若强行套 iframe 则破坏了宿主的主题集成、事件管道与窗口融合，不符合插件规范）。
2. 同时维护 Vue 和 React 两套前端会造成巨大的重复工作和设计割裂。
3. Xaihi 最新规范要求采用 Material 3 Expressive（MD3）设计语言，使用标准的 `--xaihi-*` / `--dsw-*` 颜色槽位与形状。

## 决策

1. **全面将前端迁移至 React 18**：
   - 彻底废弃 Vue 依赖与构建插件（`vue`, `vue-i18n`, `@vue/cli-*`, `vue-cli-plugin-electron-builder`）。
   - 将原 Vue 组件（`App.vue`, `MainPage.vue`, `ControllerSettingsPage.vue`, `SystemSettingsPage.vue`, `OBSConnectPage.vue`）改写为 TypeScript React 函数组件。
   - 使用自定义 Hooks（`useConfig`, `useGamepad`, `useTheme`, `useI18n`）替代原有的 Options API 和 data/computed。
2. **样式体系与 MD 3 Expressive 规范**：
   - 保留原应用的自绘精细风格、多主题色（Lime, Violet, Cyan, Amber, Rose, Azure）与深浅色模式。
   - 面板组件对齐 MD 3 Expressive 规范：
     - 卡片与按钮使用 M3 形状刻度（CornerXS, CornerM）与状态层（Hover 8%, Active 12%）；
     - 优先吃 `--xaihi-*` 与 `--dsw-alias-*` token，保证在 Xaihi 宿主动态换肤时天衣无缝；
     - 在独立桌面模式下，由根容器注入对应的 CSS 变量，确保离线独立运行时视觉风格完全一致。
3. **前端代码复用与两用构建**：
   - 核心业务组件（状态 Hero、截图来源、保存方式、手柄组合键、音效、测试器、设置）完全共享。
   - 构建配置分为两套入口：
     - **独立应用**：构建生成标准 SPA（`index.html` + `bundle.js`），由 Electron 窗口加载；
     - **Xaihi 插件**：通过 `@rspack/core` + `@module-federation/enhanced/rspack` 构建出 `dist/remoteEntry.js`，导出 `./Panel`，设置 `react` / `react-dom` 为外部单例（`import: false, singleton: true`）。

## 权衡与后果

- **正面**：前端一套代码两处使用，完美融入 Xaihi 微前端架构，同时保持独立桌面端的完整视觉表现。
- **代价**：Vue 到 React 的组件代码改写需逐行仔细核对按键映射、动画与 DOM 操作。
