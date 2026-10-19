export interface XaihiI18nText {
  zh: string
  en: string
}

export interface XaihiPanelContribution {
  id: string
  title: XaihiI18nText
  area: 'workspace' | 'sidebar' | 'dialog'
  remote: string
  export: string
}

export interface XaihiManifest {
  schema: 'xaihi.manifest/1'
  id: string
  title: XaihiI18nText
  ui?: {
    remote: string
    entry: string
  }
  panels?: XaihiPanelContribution[]
  node?: unknown
}
