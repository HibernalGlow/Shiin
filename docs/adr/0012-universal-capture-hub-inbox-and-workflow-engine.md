# ADR-0012：Shiin 跨应用捕获中枢（Capture Hub）、收件箱工作流与自动化规则引擎

- **状态**：已采纳 / 实施中
- **日期**：2026-10-22
- **相关方**：Shiin 开发组 / 桌面端 (Electron) / 本地 Web 控制台 / CLI / Xaihi 生态
- **前置依赖**：[ADR-0001](./0001-dual-mode-architecture-and-shared-core.md)、[ADR-0008](./0008-web-host-and-shared-screenshot-manager.md)、[ADR-0010](./0010-oil-ui-expressive-visual-direction.md)、[ADR-0011](./0011-shiin-capture-metadata-profile-and-indexed-library.md)
- **行业与规范参考**：ISO 16684-1 (XMP)、IPTC Photo Metadata 2023.1、Dublin Core、Perceptual Hash (pHash/dHash)

---

## 一、背景与战略跃迁

### 1.1 从“截图小工具”到“全场景视觉资产捕获中枢”
Shiin 2.0 成功实现了手柄无感截图、OBS 联动回放和四端同构共享内核。然而，单纯的“手柄截图”或“增加一个常规图片浏览器”天花板有限，文件的分散存放与整理成本依然很高。
用户在不同场景下的捕获诉求高度统一：
- **游戏娱乐**：沉浸式游戏画面记录、成就高光、连续截图成簇；
- **开发与排障**：记录 Bug 报错、复现步骤、网络抓包与终端异常；
- **学术与科研**：论文图表摘录、文献引用、网页关键论点抓取；
- **设计与灵感**：UI 界面构图参考、配色采集、灵感素材沉淀。

Shiin 的战略方向是：**无需为每种场景单独开发一套界面，而是通过“跨应用的捕获中心（Capture Hub）+ 通用图片库 + 可自动化的图片工作流”建立统一的沉淀闭环。**

### 1.2 核心设计哲学
1. **零认知阻力捕获（Zero-Cognitive Capture）**：按下按键瞬间，不需要弹窗打断工作流去选文件夹、写标签。标准上下文自动记录，进入统一收件箱稍后批量处理。
2. **标准元数据为真源（Single Source of Truth in Files）**：图片与标准 XMP/IPTC 元数据文件是资产的最终真源，本地 SQLite 数据库仅为加速检索的高速缓存，随时可由磁盘扫描重建。
3. **正交场景配置（Orthogonal Capture Profiles）**：通过“触发-隐私-元数据-动作”四维管道定义场景，而不是固化业务分支。

---

## 二、六大高优先级核心系统

```mermaid
flowchart TD
    subgraph Ingestion["统一摄入层 (Unified Ingestion)"]
        G[手柄触发]
        K[全局热键]
        C[剪贴板粘贴]
        D[外部拖拽]
        CLI[CLI: shiin ingest / API]
    end

    subgraph Pipeline["场景配置管道 (Capture Profile)"]
        Context[上下文捕获: App/Window/Time]
        ProfileMatch{Profile 匹配\n(游戏/开发/研究/设计)}
        PrivacyScrub[隐私脱敏: 字段过滤/应用黑名单]
        MetaEnrich[标准元数据注入\nIPTC / XMP dc & shiin]
    end

    subgraph InboxEngine["收件箱与存储 (Inbox & Storage)"]
        InboxPool[("📥 统一捕获收件箱 (Inbox)")]
        SessionCluster[会话与时间线折叠 (Sessions)]
        SidecarWrite[XMP 伴随文件 / 内嵌元数据写入]
        CacheIndex[("⚡ SQLite FTS5 / pHash 索引缓存")]
    end

    subgraph AutoEngine["自动化与感知 (Automation Engine)"]
        RuleMatcher{声明式规则引擎\n(Conditions -> Actions)}
        LocalOCR[系统原生离线 OCR\n(Apple Vision / WinRT)]
        SimDetector[感知哈希相似度分析\n(pHash / dHash 汉明距离)]
        ArchiveDest[("📁 结构化归档目标 (Vaults)")]
    end

    Ingestion --> Context --> ProfileMatch --> PrivacyScrub --> MetaEnrich
    MetaEnrich --> InboxPool
    InboxPool --> SessionCluster
    InboxPool --> SidecarWrite
    InboxPool --> CacheIndex
    InboxPool --> RuleMatcher
    RuleMatcher -->|自动匹配| ArchiveDest
    RuleMatcher -->|按需索引| LocalOCR
    RuleMatcher -->|相似聚合| SimDetector
```

### 2.1 捕获收件箱（Capture Inbox）
- **核心机制**：所有新捕获、新拖拽或从剪贴板导入的图片默认进驻 `Inbox` 状态池。
- **状态转移**：
  $$\text{Capture} \xrightarrow{} \text{inbox} \xrightarrow{\text{Triage}} \{\text{archived}, \text{starred}, \text{trashed}\}$$
- **稍后分拣（Triage Later）**：收件箱支持键盘极速键位（`E` 归档、`S` 标星、`Delete` 废弃、`T` 打标、`1-9` 直达场景目标库）。

### 2.2 捕获会话与时间线（Capture Sessions & Timeline）
- **时间窗口聚类算法**：以 $\Delta t \le 180\text{s}$（可配置）且前台应用上下文一致或关联的操作，自动聚合为一次“会话（Capture Session）”。
- **会话卡片呈现**：在时间线上按“前台活动卡片”呈现（例如：“15 分钟前 · 8 张连续截图 · Visual Studio Code & Chrome”）。支持以会话为单位进行一键批量打标、一键归档或整会话导出。

### 2.3 自动化规则引擎（Automation Rule Engine）
- **声明式 AST 规则模型**：
  ```json
  {
    "id": "rule_dev_error",
    "name": "开发报错自动归档",
    "enabled": true,
    "conditions": {
      "all": [
        { "field": "appName", "operator": "in", "value": ["Code", "Terminal", "iTerm2"] },
        { "field": "ocrText", "operator": "containsAny", "value": ["Error", "Exception", "failed", "panic"] }
      ]
    },
    "actions": [
      { "type": "addTags", "value": ["Bug", "NeedsTriage"] },
      { "type": "moveToVault", "target": "DevVault/Bugs" }
    ]
  }
  ```
- **安全与防失控**：
  1. 不开放动态 `eval` 任意执行，全部采用沙箱化操作语素；
  2. 提供 **Dry Run（试运行预览）**：高亮命中的图片列表及预期变更，用户确认后生效；
  3. 提供 **Undo Log（操作回滚日志）**：每一次自动化移动和标签变更均可一键撤销。

### 2.4 本地 OCR 与全文检索（Local OCR & FTS）
- **零重量级包袱**：坚决不打包数百兆庞大的 Python / PyTorch / 重型模型：
  - **macOS**：优先调用系统底层内置的 **Apple Vision Framework** 原生识别中英日等多国语言，识别延迟低于 60ms；
  - **Windows**：调用 Windows 10/11 系统原生自带的 **Windows.Media.Ocr (WinRT API)**；
- **索引与原文分离**：OCR 文本直接写入 SQLite FTS5 全文索引表中，不篡改原图片像素。允许用户按需开启或针对特定敏感目录彻底排除 OCR。

### 2.5 感知哈希与重复/相似图片检测（Perceptual Similarity & Deduplication）
- **算法选型**：同时计算 64 位 **dHash（差异哈希）** 与 **pHash（离散余弦感知哈希）**。
- **相似度判定**：
  $$\text{Distance} = \text{HammingDistance}(H_A, H_B) \le 5 \implies \text{近似图片 (相似度} \ge 92\%)$$
- **保护性交互**：相似图片以“镜头簇（Shot Cluster）”形式折叠展示，系统推荐保留最佳分辨率或原图版本，但**默认绝不自动静默删除**，防止误伤连拍与分支设计稿。

### 2.6 标准元数据同步与 Sidecar（XMP / IPTC Interoperability）
- 严格遵循 ADR-0011 规范：写入 `dc:title`、`dc:subject`、`photoshop:Source`、`xmp:CreateDate`。
- 对于不可写只读卷或需保持绝对洁净的文件，生成同名 `.xmp` 伴随文件。
- 第三方工具（如 Lightroom、DigiKam、macOS 标签）更新文件元数据后，Shiin 在增量扫描时能够双向合并，绝不覆盖外部新编辑。

---

## 三、扩展能力架构与安全边界

### 3.1 统一摄入层（Ingestion Hub）
无论是手柄快捷键、全局键盘热键、系统托盘右键、截屏延迟定时器、选区截图，还是从系统剪贴板粘贴、从浏览器直接拖入图片、乃至外部自动化通过 CLI `shiin ingest <file>` 触发，全部归一化为标准的 `RawCapturePayload`，经过统一的 Profile 管道后落入收件箱。

### 3.2 衍生版本与版本树（Image Lineage）
记录原图、裁剪版、打码版与标注版的衍生血缘关系：
```typescript
export interface ImageDerivation {
  sourceId: string       // 原始图指纹
  derivedId: string      // 衍生图指纹
  relation: 'crop' | 'annotated' | 'redacted' | 'compressed' | 'exported'
  createdAt: number
}
```
在 XMP 中映射为标准 `xmpMM:DerivedFrom`，用户随时可以追踪并回退到未修改的纯净原始画面。

### 3.3 隐私脱敏保护（Privacy Guard）
- **字段级开关**：支持针对特定场景关闭“窗口标题记录”、“应用进程路径记录”；
- **敏感应用黑名单**：检测到 1Password、Bitwarden、KeePass、银行客户端或浏览器隐身窗口时，自动拒绝捕获或执行强制脱敏；
- **安全导出（Sanitized Export）**：导出用于分享到公共社区的图片时，一键清除 GPS、用户名、窗口标题等敏感私有元数据。

### 3.4 存储来源健康监控（Storage Health Monitor）
- 支持多存储库挂载（如 `Local SSD`、`External Hard Drive`、`SMB NAS`）。
- **离线容错状态机**：
  $$\text{Path Unreachable} \implies \text{Status: offline (保护所有索引与缩略图，禁止误标已删除)}$$
  $$\text{Path Restored} \implies \text{Status: online (增量扫描校验变更)}$$
- 实时监测磁盘剩余空间阈值（低于 1GB 时预警）。

---

## 四、场景配置（Capture Profiles）模型

场景配置是 Shiin 的灵魂中枢，由四个正交规则块组合而成：

```typescript
export interface CaptureProfile {
  id: string
  nameZh: string
  nameEn: string
  icon: string
  badgeColor: string
  isDefault?: boolean
  descriptionZh: string
  descriptionEn: string

  // 1. 触发匹配规则 (何时自动匹配此 Profile)
  matching: {
    appNames?: string[]          // 如 ['Code', 'Terminal', 'iTerm2']
    windowTitleKeywords?: string[]
    gamepadCombos?: string[][]   // 指定快捷键直接绑定此 Profile
  }

  // 2. 捕获与隐私控制
  capturePolicy: {
    target: 'screen' | 'window' | 'region'
    stripWindowTitle: boolean    // 脱敏窗口标题
    stripAppPath: boolean        // 脱敏应用路径
    excludeBlacklistedApps: boolean
  }

  // 3. 元数据映射 (IPTC / XMP)
  metadataPolicy: {
    defaultTags: string[]
    category: 'entertainment' | 'development' | 'research' | 'design' | 'custom'
  }

  // 4. 保存目标与后处理管道
  pipeline: {
    targetInbox: boolean         // 默认落入收件箱待整理
    destinationVaultId?: string  // 归档目标图库
    folderTemplate: string       // 如: "{category}/{YYYY-MM}/{appName}"
    fileNameTemplate: string
    enableOCR: boolean           // 是否执行本地 OCR
    enablePerceptualHash: boolean// 是否计算相似度哈希
    notifyOnCapture: boolean
  }
}
```

内置四大标准场景：
1. **娱乐与游戏（Gaming & Entertainment）**：连续截图智能聚类、画面收藏、沉浸式通知、免打扰；
2. **开发与排障（Dev & Debug）**：自动抓取应用版本与报错堆栈、自动打上 Dev 标签、按需 OCR；
3. **研究与资料（Research & Reference）**：强制开启 OCR 全文索引、脱敏窗口私密信息、归入研究收集池；
4. **设计与灵感（Design & Inspiration）**：计算感知哈希相似聚类、支持色彩提取、保留原始无损色深。

---

## 五、明确的第一阶段不为清单（Non-Goals for Phase 1）

为了防止工程臃肿失焦，第一阶段明确**不开发**以下功能：
1. ❌ **全库多模态大模型实时理解与自动聊天问答**（占用过量显存与计算资源，降低高频截图流畅度）；
2. ❌ **私有云存储与跨设备云同步基础设施**（先做好本地文件管理，保持本地优先与零隐私外泄）；
3. ❌ **重量级专业画板图像编辑器**（聚焦轻量裁剪/打码/高亮，复杂排版让位于专业外部软件）；
4. ❌ **复杂的在线插件应用商店**（维持当前 Xaihi / Cordis 规范，不额外造重量级生态）；
5. ❌ **动态 eval 任意代码执行环境**（规则引擎必须为声明式纯函数，杜绝安全沙箱逃逸）。

---

## 六、表现层：Material 3 Expressive UI 架构

遵循 ADR-0010 确立的 Material 3 Expressive 规范与《明日方舟》稀音配色：
1. **主色调**：荧光青柠 (`#C8F000`)、器材橄榄 (`#62652F`)、纸面暖白 (`#F2F0E8` / `#191C14` 暗色底)、装备墨灰 (`#343831`)；
2. **非对称 Bento 网格**：收件箱采用非对称动态 Bento 瀑布布局，卡片外轮廓按内容角色应用 MD3E Expressive 几何圆角；
3. **导航中枢（Capture Dock & TitleBar）**：
   - `workspace`：实时设备与快门工作台
   - `inbox`：统一捕获收件箱与时间线聚类
   - `workflows`：场景配置（Profiles）与自动化规则引擎
   - `analytics`：活动统计与复盘看板
   - `settings`：全局设置与权限中心
4. **高复用模块化组件**：
   - `src/ui/components/hub/InboxView.tsx`（收件箱与分拣操作栏）
   - `src/ui/components/hub/SessionTimeline.tsx`（会话时间线成簇组件）
   - `src/ui/components/hub/ProfileSelector.tsx`（场景配置选择器与编辑器）
   - `src/ui/components/hub/RuleEditorView.tsx`（可视化规则条件-动作编辑器）
   - `src/ui/components/hub/ItemDetailModal.tsx`（标准 XMP 元数据 HUD 与 OCR 检视器）
