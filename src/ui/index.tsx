import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.js'
import { I18nProvider } from './i18n.js'

const container = document.getElementById('app')
if (container) {
  const root = createRoot(container)
  root.render(
    <I18nProvider>
      <App />
    </I18nProvider>
  )
}

