import type { InboxItem, InboxItemStatus } from '../../../core/inbox.js'
import type { CaptureProfile } from '../../../core/profile.js'
import type { AutomationRule } from '../../../core/rule-engine.js'

export type InboxViewMode = 'grid' | 'timeline'

export interface HubFilterState {
  status: 'all' | InboxItemStatus
  profileId?: string
  appName?: string
  tag?: string
  searchQuery: string
}

export const INITIAL_DEMO_ITEMS: InboxItem[] = [
  {
    id: 'demo_1',
    filePath: 'screenshots/Gaming/2026-10/EldenRing_BossFight.png',
    timestamp: Date.now() - 5 * 60 * 1000,
    status: 'inbox',
    profileId: 'gaming',
    appName: 'Elden Ring',
    windowTitle: 'ELDEN RING™ v1.12',
    tags: ['Game', 'Highlight', 'BossFight'],
    rating: 5,
    format: 'png',
    width: 3840,
    height: 2160,
    sizeBytes: 4210000,
    pHash: 'ffff0000ffff0000',
  },
  {
    id: 'demo_2',
    filePath: 'screenshots/Gaming/2026-10/EldenRing_Ending.png',
    timestamp: Date.now() - 6 * 60 * 1000,
    status: 'inbox',
    profileId: 'gaming',
    appName: 'Elden Ring',
    windowTitle: 'ELDEN RING™ v1.12',
    tags: ['Game', 'Achievement'],
    rating: 4,
    format: 'png',
    width: 3840,
    height: 2160,
    sizeBytes: 4190000,
    pHash: 'ffff0000ffff0001', // 近似连拍
  },
  {
    id: 'demo_3',
    filePath: 'screenshots/Dev/2026-10/Terminal_CompileError.png',
    timestamp: Date.now() - 25 * 60 * 1000,
    status: 'inbox',
    profileId: 'development',
    appName: 'Terminal',
    windowTitle: 'zsh - vitest test run',
    tags: ['Dev', 'Bug', 'NeedsTriage'],
    ocrText: 'TypeError: Cannot read properties of undefined (reading "captureWindow")',
    rating: 3,
    format: 'png',
    width: 1920,
    height: 1080,
    sizeBytes: 850000,
  },
  {
    id: 'demo_4',
    filePath: 'screenshots/Research/2026-10/Nature_QuantumDiagram.png',
    timestamp: Date.now() - 2 * 3600 * 1000,
    status: 'archived',
    profileId: 'research',
    appName: 'Safari',
    windowTitle: 'Nature Article: Quantum Coherence',
    tags: ['Research', 'Reference', 'Paper'],
    ocrText: 'Figure 3. Topological phase transition in topological insulators at 4K.',
    rating: 4,
    format: 'png',
    width: 2560,
    height: 1440,
    sizeBytes: 1450000,
  },
  {
    id: 'demo_5',
    filePath: 'screenshots/Design/2026-10/Figma_MD3E_Exploration.png',
    timestamp: Date.now() - 5 * 3600 * 1000,
    status: 'starred',
    profileId: 'design',
    appName: 'Figma',
    windowTitle: 'Shiin 2.0 Design System · Figma',
    tags: ['Design', 'Inspiration', 'Bento'],
    rating: 5,
    format: 'png',
    width: 2880,
    height: 1800,
    sizeBytes: 2300000,
    pHash: '00ff00ff00ff00ff',
  },
]

export const INITIAL_DEMO_RULES: AutomationRule[] = [
  {
    id: 'rule_dev_bugs',
    name: '开发报错自动打标并加星',
    enabled: true,
    description: '当来源为终端或代码编辑器且 OCR 检测到 Error 时自动标记',
    conditions: {
      all: [
        { field: 'appName', operator: 'in', value: ['Code', 'Cursor', 'Terminal', 'iTerm2'] },
        { field: 'ocrText', operator: 'containsAny', value: ['Error', 'Exception', 'Failed', 'TypeError'] },
      ],
    },
    actions: [
      { type: 'addTags', value: ['AutoBug', 'HighPriority'] },
      { type: 'star', value: true },
    ],
  },
  {
    id: 'rule_figma_inspo',
    name: 'Figma 设计稿自动关联灵感分类',
    enabled: true,
    description: '来自 Figma 的截图自动归为设计灵感 Profile',
    conditions: {
      all: [
        { field: 'appName', operator: 'equals', value: 'Figma' },
      ],
    },
    actions: [
      { type: 'setProfile', value: 'design' },
      { type: 'addTags', value: ['FigmaExport', 'Inspiration'] },
    ],
  },
]
