/**
 * 2.0 国际化多语言系统 (React Context & Hook)
 * 整合 9 种语言包并支持全量热切换（无需重启）
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import zh from '../locales/zh.json' with { type: 'json' }
import zhTW from '../locales/zh-TW.json' with { type: 'json' }
import en from '../locales/en.json' with { type: 'json' }
import ja from '../locales/ja.json' with { type: 'json' }
import ko from '../locales/ko.json' with { type: 'json' }
import de from '../locales/de.json' with { type: 'json' }
import fr from '../locales/fr.json' with { type: 'json' }
import es from '../locales/es.json' with { type: 'json' }
import ru from '../locales/ru.json' with { type: 'json' }

export interface LanguageItem {
  code: string
  native: string
  short: string
}

export const LANGUAGES: LanguageItem[] = [
  { code: 'zh', native: '简体中文', short: '中' },
  { code: 'zh-TW', native: '繁體中文', short: '繁' },
  { code: 'en', native: 'English', short: 'EN' },
  { code: 'ja', native: '日本語', short: '日' },
  { code: 'ko', native: '한국어', short: '한' },
  { code: 'de', native: 'Deutsch', short: 'DE' },
  { code: 'fr', native: 'Français', short: 'FR' },
  { code: 'es', native: 'Español', short: 'ES' },
  { code: 'ru', native: 'Русский', short: 'RU' },
]

export const DEFAULT_LOCALE = 'zh'

const MESSAGES: Record<string, Record<string, any>> = {
  zh,
  'zh-TW': zhTW,
  en,
  ja,
  ko,
  de,
  fr,
  es,
  ru,
}

export function normalizeLocale(code?: string): string {
  if (!code) return DEFAULT_LOCALE
  const hit = LANGUAGES.find((item) => item.code.toLowerCase() === code.toLowerCase())
  return hit ? hit.code : DEFAULT_LOCALE
}

export function getLanguage(code?: string): LanguageItem {
  const norm = normalizeLocale(code)
  return LANGUAGES.find((item) => item.code === norm) || LANGUAGES[0]
}

interface I18nContextValue {
  locale: string
  setLocale: (nextLocale: string) => Promise<void>
  t: (key: string, varsOrFallback?: Record<string, string | number> | string, fallback?: string) => string
  languages: typeof LANGUAGES
  currentLanguage: LanguageItem
}

const I18nContext = createContext<I18nContextValue | null>(null)

async function readStoredLocale(): Promise<string | null> {
  const api = typeof window !== 'undefined' ? (window as any).electronAPI : undefined
  if (api?.getStore) {
    return (await api.getStore('locale', DEFAULT_LOCALE)) ?? null
  }
  try {
    const res = await fetch('/api/store/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'locale', defaultValue: DEFAULT_LOCALE }),
    })
    if (res.ok) {
      const data = (await res.json()) as { value?: unknown }
      if (typeof data.value === 'string') return data.value
    }
  } catch {
    // 没有 Node Web 宿主时退回浏览器本地存储
  }
  try {
    return localStorage.getItem('shiin_locale')
  } catch {
    return null
  }
}

async function writeStoredLocale(locale: string): Promise<void> {
  const api = typeof window !== 'undefined' ? (window as any).electronAPI : undefined
  if (api?.setStore) {
    await api.setStore('locale', locale)
  } else {
    try {
      await fetch('/api/store/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'locale', value: locale }),
      })
    } catch {
      // 交给下面的 localStorage 兜底
    }
  }
  if (api?.applyLocale) await api.applyLocale(locale)
  try {
    localStorage.setItem('shiin_locale', locale)
  } catch {
    // ignore
  }
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<string>(DEFAULT_LOCALE)

  // 挂载时从 Electron Store、Node Web 宿主或 localStorage 读取
  useEffect(() => {
    let mounted = true
    async function loadSavedLocale() {
      try {
        const saved = await readStoredLocale()
        if (mounted && saved) {
          setLocaleState(normalizeLocale(saved))
        }
      } catch (err) {
        console.warn('[i18n] Failed to load saved locale:', err)
      }
    }
    void loadSavedLocale()
    return () => {
      mounted = false
    }
  }, [])

  const setLocale = useCallback(async (nextLocale: string) => {
    const norm = normalizeLocale(nextLocale)
    setLocaleState(norm)
    try {
      await writeStoredLocale(norm)
    } catch (err) {
      console.warn('[i18n] Failed to persist locale:', err)
    }
  }, [])

  const t = useCallback(
    (key: string, varsOrFallback?: Record<string, string | number> | string, fallback?: string): string => {
      const vars = typeof varsOrFallback === 'object' && varsOrFallback !== null ? varsOrFallback : undefined
      const defaultText = typeof varsOrFallback === 'string' ? varsOrFallback : fallback

      const dict = MESSAGES[locale] || MESSAGES.zh || {}
      const fallbackDict = MESSAGES.zh || MESSAGES.en || {}

      const getVal = (target: any, pathStr: string) => {
        return pathStr.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), target)
      }

      let text = getVal(dict, key)
      if (text === undefined) {
        text = getVal(fallbackDict, key)
      }
      if (text === undefined) {
        return defaultText || key
      }

      if (typeof text !== 'string') {
        return String(text)
      }

      if (vars && typeof vars === 'object') {
        return text.replace(/\{(\w+)\}/g, (_, varName) => {
          return vars[varName] !== undefined ? String(vars[varName]) : `{${varName}}`
        })
      }

      return text
    },
    [locale]
  )

  const currentLanguage = getLanguage(locale)

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        languages: LANGUAGES,
        currentLanguage,
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    // 兜底返回静态翻译，避免在 Provider 外调用崩溃
    const defaultLang = LANGUAGES[0]
    return {
      locale: DEFAULT_LOCALE,
      setLocale: async () => {},
      t: (key: string) => key,
      languages: LANGUAGES,
      currentLanguage: defaultLang,
    }
  }
  return ctx
}
