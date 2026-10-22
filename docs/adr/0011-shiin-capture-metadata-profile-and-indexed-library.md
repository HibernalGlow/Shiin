# ADR-0011：Shiin 截图元数据规范 (SCMP) 与索引式多来源图库架构

- **状态**：已采纳 / 规范确立
- **日期**：2026-10-22
- **相关方**：Shiin 开发组 / 桌面端 (Electron) / Xaihi 生态 / CLI Headless
- **前置依赖**：[ADR-0001](./0001-dual-mode-architecture-and-shared-core.md)、[ADR-0005](./0005-storage-and-config-abstraction.md)、[ADR-0010](./0010-oil-ui-expressive-visual-direction.md)
- **行业标准参考**：ISO 16684-1 (XMP 规范)、IPTC Photo Metadata Standard 2023.1、Dublin Core Metadata Element Set

---

## 背景与问题

Shiin 现有核心 `ScreenshotConfig` 与 `ScreenshotResult` 仅记录基础执行状态（如路径、文件大小、耗时、布尔状态）。当前存在以下局限：
1. **截图上下文流失**：截图触发时的前台应用标识、窗口标题、手柄型号、组合键配置、捕获引擎等重要技术与操作上下文未沉淀在图片中；
2. **缺乏资产管理能力**：用户截图散落在不同目录（游戏专用目录、系统图片库、外置移动盘、NAS 归档），缺乏集中、快速的检索与分类视图；
3. **不能做专有壁垒**：不能搞“仅在 Shiin 能读”的孤立私有格式，必须能与 digiKam、darktable、Lightroom 等现代数字资产管理（DAM）工具兼容，同时绝对不能强制移动用户原文件。

## 决策核心

### 1. 采用 ISO XMP + IPTC Photo Metadata 作为标准载体
- **标准属性对齐**：创建时间 (`xmp:CreateDate`)、标题 (`dc:title`)、说明 (`dc:description`)、标签 (`dc:subject`)、评分 (`xmp:Rating`) 均采用 IPTC/Dublin Core 通用标准，第三方工具可直接读取。
- **开源公开扩展规范**：定义 `Shiin Capture Metadata Profile (SCMP v1.0)`，XML 命名空间为 `xmlns:shiin="https://shiin.app/schema/capture/1.0/"`。专门承载应用名 (`shiin:appName`)、应用标识 (`shiin:appId`)、窗口标题 (`shiin:windowTitle`)、捕获引擎 (`shiin:captureEngine`)、触发方式 (`shiin:triggerWay`) 与设备型号 (`shiin:triggerDevice`)。

### 2. 三层存储与零重编码（Zero Re-encoding）注入
- **物理内嵌优先**：支持 PNG (`iTXt` 块)、JPEG (`APP1` 标记)、WebP (`XMP ` Chunk) 的纯二进制流无损切片拼接。严禁对原图进行有损二次压缩，保证 100% 原始画质与零色域漂移。
- **伴随文件备选**：对于只读介质、RAW/特殊格式或用户配置为“只读原文件”模式时，输出同名 `.xmp` 附属文件（Sidecar）。
- **外部修改双向协商**：以图片文件本身的 XMP 为 Single Source of Truth。当第三方工具修改标签且文件 `mtime` 更新时，重新扫描并增量合并至本地 SQLite 数据库，避免旧缓存覆盖新元数据。

### 3. 多来源只读索引库（Multi-Source Indexed Library）
- **来源与实体分离**：来源为物理路径（支持本地目录、NAS、移动硬盘，具备 `online` / `offline` 弹性状态探测）；实体为原始文件；
- **智能集合为动态视图**：所有分类、筛选、推荐均为虚拟规则，原文件永不复制或移动；
- **本地高性能 SQLite**：维护文件指纹、缩略图映射、元数据缓存与 FTS5 全文搜索，支撑 10 万+ 张截图的毫秒级检索。

### 4. 表现层选型
- **TanStack Virtual (`@tanstack/react-virtual`)**：承载大型虚拟滚动网格，支持 Oil UI / MD3 Expressive 风格的动态卡片。
- **Yet Another React Lightbox (YARL)**：作为全屏图片交互查看器，外挂 Shiin 自定义元数据 HUD 与快速打标面板。
- **Chokidar v4**：作为受控的文件系统监视器，保障 Node 18 / Electron 28 运行时兼容性。

## 分期演进策略

- **Phase 1**：元数据规范定义、纯 TS 无损 XMP 注入器、隐私矩阵与截图管线集成。
- **Phase 2**：SQLite 索引库、多来源状态机、Chokidar 增量同步与 Sharp 缩略图管线。
- **Phase 3**：TanStack Virtual 网格、YARL 大图查看与元数据 HUD、多选批量操作。
- **Phase 4**：智能集合规则引擎、快速指纹去重、连续截图时间窗口折叠。
