# ADR-0009: 形状按控件角色独立随机

- **状态**：已接受 (Accepted)
- **日期**：2026-10-20
- **关联**：ADR-0007（Expressive 控件语法）、ADR-0013（单一种子色调）

## 背景

早期实现把一次随机会话抽到的**同一个轮廓**同时套在截图球、会话头像、指标卡、
导航图标座和主操作图标上。视觉上等于整站只有一个形状，既不是 Rhythm 的
做法，也让“随机形状”退化成“换一次轮廓”。用户明确指出：
“不是说随机到了这个图形，所有地方就都用这同一个图形。”

查看 Rhythm 源码（`ExpressiveShapesSettingsScreen.kt`、`AppSettings.kt`）后确认：

- 它有多个独立形状目标：Album Artwork、Player Artwork、Song Artwork、
  Playlist Artwork、Artist Artwork、Player Controls、Mini Player；
- `randomizeExpressiveShapes()` 对每个目标独立取形；
- 预设（Default / Friendly / Cheerful / Modern / Playful / Organic /
  Geometric / Retro）是**每个目标各自一个形状**的组合；
- 每个目标可以在 Individual Shape Settings 里单独替换。

## 决策

### 1. 五个形状角色

Shiin 定义以下独立角色：

| 角色 | 用在 | 设置文案 |
| --- | --- | --- |
| `hero` | 工作台截图球、权限主图形、形状实验室主预览 | 主视觉 |
| `device` | 工作台本次会话头像、设置会话头像 | 会话头像 |
| `control` | 截图 CTA 图标座、组合控件 | 操作控件 |
| `icon` | 导航图标座、标题栏图标、权限 tile 图标座 | 图标 |
| `metric` | 四张指标卡、实时测试器空态 | 指标 |

**同类控件共享同一角色的轮廓；不同角色默认抽取不同形状。**

### 2. 随机会话

- `createShapeSession()` 在 random 模式下对角色池洗牌，为五个角色各取一个不同形状；
- 结构仍是 `{ seed, shapes: Record<role, spec>, text }`，同一个 seed 可复现；
- 文本按钮形态（圆角/柔和/胶囊）独立于图标角色；
- 固定模式使用 `preferences.shapes` 中每个角色的选择。

### 3. 设置页结构（对齐 Rhythm）

- **角色列表**：主视觉 / 会话头像 / 操作控件 / 图标 / 指标，每行显示当前形状名；
- 选中角色后，主预览与 35 档形状选择器编辑该角色；
- **快速预设**：Default / Friendly / Cheerful / Modern（后续可扩展），每个预设是
  一组角色形状 + 文本形态；
- **随机全部形状**：一次重抽所有角色；
- 固定当前组合：把当前会话的五个角色形状写入本机设置。

### 4. 旧数据迁移

旧的 `shapePreferences.icon` 会迁移为**所有角色同一个形状**，保持可读性；
下一次选择角色或预设后会写入 `shapes` 映射。

## 后果

- 工作台会同时看到主视觉、会话头像、控件、图标、指标各自不同的轮廓；
- 同类控件仍然一致，不会出现同类按钮形状打架；
- 预设和 Randomize All 都有了真实语义，而不是只换一个全局形状；
- 验收：
  - 随机会话中五个角色的 `data-*` 形状 id 必须互不相同；
  - 同一个角色下的所有图标/卡必须引用同一形状；
  - 选择单角色后，模式切换为固定且其他角色保持不变；
  - 35 档目录、按压形变与预设仍通过结构测试。
