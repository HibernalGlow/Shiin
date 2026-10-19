# ADR-0005: 配置与数据持久化适配策略（Electron 本地存储 vs Xaihi DSH Settings）

- **状态**：提议中 (Proposed)
- **日期**：2026-10-19
- **相关方**：Shiin 开发组 / Xaihi 生态

---

## 背景与问题

原应用通过本地单个 JSON 文件（`localStorage.json`）存储所有配置项（包括全局截图路径、快捷键组合、OBS 连接凭据、主题缩放等）。

然而在 Xaihi 插件体系中：
1. 遵循 Xaihi 规则（`docs/adr/0013-config-goes-through-dsh-settings.md`）：Xaihi 不自带专有配置文件，所有配置读写必须走 DSH 标准面（`ctx.settings` / `ctx.remote.settings`），定义采用 `@deepseek-ai/schemastery`；
2. 敏感信息（如 OBS 密码）在 DSH 中要求通过路径操作进行安全脱敏；
3. 但在独立应用模式下，Xaihi 的 DSH 运行时并不存在，必须保持本地磁盘持久化。

## 决策

我们决定设计一个统一的存储接口 `IConfigStorage`：

```typescript
export interface IConfigStorage {
  get<T>(key: string, defaultValue: T): Promise<T> | T;
  set<T>(key: string, value: T): Promise<void> | void;
}
```

1. **独立应用实现 (`LocalFileConfigStorage`)**：
   - 继承原有逻辑，将配置保存在用户数据目录或可执行文件旁的 `config/localStorage.json` 中；
   - 保证应用迁移后既有用户的旧配置能被平滑读取与自动升级。
2. **Xaihi 插件实现 (`DshSettingsConfigStorage`)**：
   - 将插件的核心设置（默认截图路径、图片格式、音效、OBS 地址与端口）通过 `@deepseek-ai/schemastery` 的 `Config` Schema 进行声明；
   - 运行时桥接到 DSH 的 `ctx.settings`，支持在 Xaihi 工作台的 Settings 界面统一可视化编辑与持久化；
   - 历史截图数据或运行日志使用 DSH Storage Domain（`xaihi_shiin`）。

## 权衡与后果

- **正面**：业务逻辑完全通过统一的 Storage 抽象存取配置，独立运行时不依赖 DSH，插件运行时不污染本地文件系统，严格符合两边规范。
- **代价**：两套存储结构需要维护字段映射与默认值对齐。
