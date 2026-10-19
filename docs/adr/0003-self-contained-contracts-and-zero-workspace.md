# ADR-0003: 依赖自包含与零 workspace 构建发布契约

- **状态**：提议中 (Proposed)
- **日期**：2026-10-19
- **相关方**：Shiin 开发组 / Xaihi 生态

---

## 背景与问题

需求对仓库的构建独立性有极严格的要求：
1. 仓库必须完整声明自身依赖，全新检出后按说明安装即可构建；
2. 不允许依赖 Xaihi monorepo 内部的 `workspace:*` 依赖或隐式相对路径；
3. 不要求 GitHub Actions 额外检出 Xaihi 宿主源码；
4. 目前 `@hibernalglow/xaihi-sdk` 尚未在公共 npm 发布。如果简单声明为无法解析的外部包，全新检出或 CI 构建将直接报错失败；如果声明为 `workspace:*`，则违反了插件安装隔离和独立仓库的原则（见 Xaihi ADR-0002 与 `check-installable` 门禁）。

## 决策

1. **零 workspace 依赖原则**：
   - 本仓库 `package.json` 的 `dependencies` 与 `devDependencies` 中严禁出现任何 `workspace:*` 标识符。
2. **契约接口内嵌策略**：
   - 将 Xaihi 的纯接口与声明契约（`manifest.ts`, `node.ts`, `define-node.ts`, `conditions.ts`, `operations.ts`）内嵌至本项目的 `src/xaihi/sdk/` 目录。
   - 这些文件只包含纯 TypeScript 类型与无外部状态的辅助函数，不引入除已在 npm 发布的 `@deepseek-ai/schemastery` 和 `@deepseek-ai/cordis` 之外的任何专有外部包。
   - 在构建插件时，TypeScript 编译器和打包工具（`tsdown` / `rspack`）直接内联这些契约代码，产出的 `lib/index.js` 和 `dist/remoteEntry.js` 是完全自包含的，绝不向外部引用未发布的 `@hibernalglow/*` 运行时包。
3. **包管理器统一**：
   - 遵从用户规则，本仓库统一使用 `yarn` 管理依赖和执行生命周期脚本。
4. **独立发布流水线**：
   - 配置 GitHub Actions 工作流：
     - `build-app.yml`：测试构建 Electron 安装包（Windows exe / macOS dmg）；
     - `build-plugin.yml`：构建插件产物（校验 `cordis.patch.yml`、`package.json#xaihi`，输出独立 tarball）。

## 权衡与后果

- **正面**：仓库彻底自包含，开箱即用，任何人 clone 后运行 `yarn install && yarn build` 都能 100% 成功构建，CI 不受外部 monorepo 制约。
- **代价**：当 Xaihi 上游核心契约发生大版本变动时，需要同步更新内嵌的契约定义文件。
