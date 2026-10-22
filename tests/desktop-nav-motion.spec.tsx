import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { TitleBar } from '../src/ui/components/TitleBar.js'
import type { WorkspaceDestination } from '../src/ui/components/CaptureDock.js'

describe('TitleBar Desktop Navigation (Rhythm-inspired Dynamic Pill)', () => {
  const defaultProps = {
    listening: false,
    uiScale: 1.0,
    onSetUiScale: () => {},
    maximized: false,
    onMinimize: () => {},
    onToggleMaximize: () => {},
    onClose: () => {},
    destination: 'workspace' as WorkspaceDestination,
    onNavigate: () => {},
    locale: 'zh-CN',
  }

  it('renders the navigation bar container with desktop-nav class and tablist role', () => {
    const html = renderToStaticMarkup(<TitleBar {...defaultProps} />)
    expect(html).toContain('class="shiin-desktop-nav"')
    expect(html).toContain('role="tablist"')
  })

  it('sets aria-selected="true" for active destination and gives accessible labels to all tabs', () => {
    const html = renderToStaticMarkup(<TitleBar {...defaultProps} destination="workspace" />)

    // Active tab (workspace)
    expect(html).toMatch(/id="desktop-tab-workspace"[^>]*aria-selected="true"/)
    expect(html).toContain('工作台')

    // Inactive tabs (analytics, settings)
    expect(html).toMatch(/id="desktop-tab-analytics"[^>]*aria-selected="false"/)
    expect(html).toContain('id="desktop-tab-analytics"')
    expect(html).toContain('aria-label="统计"')
    expect(html).toContain('title="统计"')

    expect(html).toMatch(/id="desktop-tab-settings"[^>]*aria-selected="false"/)
    expect(html).toContain('id="desktop-tab-settings"')
    expect(html).toContain('aria-label="设置"')
    expect(html).toContain('title="设置"')
  })

  it('dynamically adapts active state when destination changes to analytics', () => {
    const html = renderToStaticMarkup(<TitleBar {...defaultProps} destination="analytics" />)

    // Analytics is now active
    expect(html).toMatch(/id="desktop-tab-analytics"[^>]*aria-selected="true"/)
    expect(html).toMatch(/id="desktop-tab-workspace"[^>]*aria-selected="false"/)
    expect(html).toMatch(/id="desktop-tab-settings"[^>]*aria-selected="false"/)
    expect(html).toContain('统计')
  })

  it('supports English localization properly', () => {
    const html = renderToStaticMarkup(<TitleBar {...defaultProps} locale="en" destination="settings" />)

    expect(html).toMatch(/id="desktop-tab-settings"[^>]*aria-selected="true"/)
    expect(html).toContain('Settings')
    expect(html).toContain('title="Workspace"')
    expect(html).toContain('title="Analytics"')
  })
})
