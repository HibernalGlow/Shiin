/**
 * Shiin Capture Profiles (场景配置) Core Engine
 *
 * Defines orthogonal 4-dimension capture profiles (matching, privacy, metadata, pipeline)
 * for Gaming, Dev/Debug, Research, Design, and user-customized workflows.
 */

export type ProfileCategory = 'gaming' | 'development' | 'research' | 'design' | 'custom'

export interface ProfileMatchingRule {
  appNames?: string[]
  windowTitleKeywords?: string[]
  gamepadCombos?: string[][]
}

export interface ProfileCapturePolicy {
  target: 'screen' | 'window' | 'region'
  stripWindowTitle: boolean
  stripAppPath: boolean
  excludeBlacklistedApps: boolean
  blacklistedApps?: string[]
}

export interface ProfileMetadataPolicy {
  defaultTags: string[]
  category: ProfileCategory
  creator?: string
  copyright?: string
}

export interface ProfilePipelinePolicy {
  targetInbox: boolean
  destinationVaultId?: string
  folderTemplate: string
  fileNameTemplate: string
  enableOCR: boolean
  enablePerceptualHash: boolean
  notifyOnCapture: boolean
}

export interface CaptureProfile {
  id: string
  nameZh: string
  nameEn: string
  icon: string
  badgeColor: string
  isDefault?: boolean
  descriptionZh: string
  descriptionEn: string
  matching: ProfileMatchingRule
  capturePolicy: ProfileCapturePolicy
  metadataPolicy: ProfileMetadataPolicy
  pipeline: ProfilePipelinePolicy
}

export const BUILTIN_PROFILES: CaptureProfile[] = [
  {
    id: 'gaming',
    nameZh: '娱乐与游戏',
    nameEn: 'Gaming & Entertainment',
    icon: 'gamepad',
    badgeColor: '#C8F000', // Lime
    isDefault: true,
    descriptionZh: '无感连续截图成簇，游戏画面收藏，沉浸式免打扰',
    descriptionEn: 'Continuous screenshot clustering, favorites, distraction-free',
    matching: {
      appNames: ['Steam', 'EpicGames', 'GenshinImpact', 'RetroArch', 'Dolphin', 'Yuzu', 'Ryujinx'],
    },
    capturePolicy: {
      target: 'screen',
      stripWindowTitle: false,
      stripAppPath: true,
      excludeBlacklistedApps: true,
      blacklistedApps: ['1Password', 'Bitwarden', 'KeePassXC', 'Keychain Access'],
    },
    metadataPolicy: {
      defaultTags: ['Game', 'Highlight'],
      category: 'gaming',
    },
    pipeline: {
      targetInbox: true,
      folderTemplate: 'Gaming/{YYYY-MM}/{appName}',
      fileNameTemplate: 'Game_{timestamp}',
      enableOCR: false, // 游戏截图默认不跑 OCR 节省算力
      enablePerceptualHash: true, // 连续截图计算相似度折叠
      notifyOnCapture: true,
    },
  },
  {
    id: 'development',
    nameZh: '开发与排障',
    nameEn: 'Dev & Debug',
    icon: 'code',
    badgeColor: '#85864A', // Olive Khaki
    descriptionZh: '记录 Bug 报错与网络抓包，保留窗口标题与上下文',
    descriptionEn: 'Capture bug reports, stack traces, and terminal logs',
    matching: {
      appNames: ['Code', 'Cursor', 'Terminal', 'iTerm2', 'Xcode', 'IntelliJ IDEA', 'WebStorm', 'Postman'],
      windowTitleKeywords: ['Error', 'Exception', 'Debug', 'DevTools', 'localhost'],
    },
    capturePolicy: {
      target: 'window',
      stripWindowTitle: false,
      stripAppPath: false,
      excludeBlacklistedApps: true,
      blacklistedApps: ['1Password', 'Bitwarden', 'KeePassXC'],
    },
    metadataPolicy: {
      defaultTags: ['Dev', 'Bug', 'NeedsTriage'],
      category: 'development',
    },
    pipeline: {
      targetInbox: true,
      folderTemplate: 'Dev/{YYYY-MM}/{appName}',
      fileNameTemplate: 'Dev_{appName}_{timestamp}',
      enableOCR: true, // 开发报错自动 OCR 便于全文搜错误码
      enablePerceptualHash: false,
      notifyOnCapture: true,
    },
  },
  {
    id: 'research',
    nameZh: '研究与资料',
    nameEn: 'Research & Reference',
    icon: 'book',
    badgeColor: '#8FA866', // Moss Green
    descriptionZh: '论文图表摘录与网页精读，全文 OCR 索引，窗口脱敏',
    descriptionEn: 'Paper excerpts, reading notes, full-text OCR indexing',
    matching: {
      appNames: ['Zotero', 'Safari', 'Google Chrome', 'Arc', 'Obsidian', 'Notion', 'Preview', 'Acrobat'],
    },
    capturePolicy: {
      target: 'region',
      stripWindowTitle: true, // 隐私脱敏：研究截图不记录私密窗口名
      stripAppPath: true,
      excludeBlacklistedApps: true,
    },
    metadataPolicy: {
      defaultTags: ['Research', 'Reference'],
      category: 'research',
    },
    pipeline: {
      targetInbox: true,
      folderTemplate: 'Research/{YYYY-MM}',
      fileNameTemplate: 'Ref_{timestamp}',
      enableOCR: true, // 强制 OCR 全文索引
      enablePerceptualHash: false,
      notifyOnCapture: true,
    },
  },
  {
    id: 'design',
    nameZh: '设计与灵感',
    nameEn: 'Design & Inspiration',
    icon: 'palette',
    badgeColor: '#D0C6AD', // Sand
    descriptionZh: '灵感素材采集，构图与色彩参考，相似构图聚类',
    descriptionEn: 'Inspiration clippings, composition & color references',
    matching: {
      appNames: ['Figma', 'Sketch', 'Photoshop', 'Illustrator', 'Blender', 'PureRef', 'Eagle'],
    },
    capturePolicy: {
      target: 'window',
      stripWindowTitle: false,
      stripAppPath: true,
      excludeBlacklistedApps: false,
    },
    metadataPolicy: {
      defaultTags: ['Design', 'Inspiration', 'Asset'],
      category: 'design',
    },
    pipeline: {
      targetInbox: true,
      folderTemplate: 'Design/{YYYY-MM}/{appName}',
      fileNameTemplate: 'Inspo_{timestamp}',
      enableOCR: false,
      enablePerceptualHash: true, // 相似灵感图聚类
      notifyOnCapture: true,
    },
  },
]

export interface CaptureContext {
  appName?: string
  windowTitle?: string
  comboKeys?: string[]
}

/**
 * 根据前台上下文与快捷键自动推断最匹配的场景配置 (Capture Profile)
 */
export function matchProfileForCapture(
  profiles: CaptureProfile[],
  context: CaptureContext
): CaptureProfile {
  const profileList = profiles.length > 0 ? profiles : BUILTIN_PROFILES
  const activeApp = (context.appName || '').toLowerCase()
  const activeTitle = (context.windowTitle || '').toLowerCase()

  // 1. 优先通过前台应用精确或包含匹配
  if (activeApp) {
    for (const p of profileList) {
      if (p.matching.appNames && p.matching.appNames.length > 0) {
        const found = p.matching.appNames.some((targetApp) =>
          activeApp.includes(targetApp.toLowerCase()) || targetApp.toLowerCase().includes(activeApp)
        )
        if (found) return p
      }
    }
  }

  // 2. 其次通过窗口标题关键词匹配
  if (activeTitle) {
    for (const p of profileList) {
      if (p.matching.windowTitleKeywords && p.matching.windowTitleKeywords.length > 0) {
        const found = p.matching.windowTitleKeywords.some((kw) =>
          activeTitle.includes(kw.toLowerCase())
        )
        if (found) return p
      }
    }
  }

  // 3. 兜底回退到默认 Profile
  const def = profileList.find((p) => p.isDefault)
  return def || profileList[0] || BUILTIN_PROFILES[0]
}
