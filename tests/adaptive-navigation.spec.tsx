import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { CaptureDock } from '../src/ui/components/CaptureDock.js'
import { Md3eShapeProvider } from '../src/ui/md3e-shape-context.js'
import { createShapeSession, DEFAULT_SHAPE_PREFERENCES } from '../src/ui/md3e-shapes.js'
import type { WorkspaceDestination } from '../src/ui/components/CaptureDock.js'

describe('CaptureDock Adaptive Navigation (Rhythm-consistent Mobile & Tablet)', () => {
  const session = createShapeSession(DEFAULT_SHAPE_PREFERENCES)
  const defaultProps = {
    destination: 'workspace' as WorkspaceDestination,
    onNavigate: () => {},
    onCapture: () => {},
    onToggleListen: () => {},
    onSaveOBS: () => {},
    onOpenFolder: () => {},
    listening: false,
    pending: false,
    result: null,
    notice: '',
    noticeRevision: 0,
    locale: 'zh-CN',
  }

  const renderDock = (props = {}) =>
    renderToStaticMarkup(
      <Md3eShapeProvider preferences={DEFAULT_SHAPE_PREFERENCES} session={session}>
        <CaptureDock {...defaultProps} {...props} />
      </Md3eShapeProvider>
    )

  describe('Tablet Navigation Rail (600px - 1199px)', () => {
    it('renders the tablet rail with active indicator and keyboard navigation', () => {
      const html = renderDock({ destination: 'workspace' })

      expect(html).toContain('class="shiin-tablet-rail"')
      expect(html).toMatch(/id="rail-tab-workspace"[^>]*aria-selected="true"/)
      expect(html).toMatch(/id="rail-tab-analytics"[^>]*aria-selected="false"/)
      expect(html).toMatch(/id="rail-tab-settings"[^>]*aria-selected="false"/)

      expect(html).toContain('class="shiin-tablet-rail__indicator"')
      expect(html).toContain('class="shiin-tablet-rail__label"')
      expect(html).toContain('工作台')
      expect(html).toContain('统计')
      expect(html).toContain('设置')
    })

    it('updates active state when destination switches to analytics', () => {
      const html = renderDock({ destination: 'analytics' })

      expect(html).toMatch(/id="rail-tab-analytics"[^>]*aria-selected="true"/)
      expect(html).toMatch(/id="rail-tab-workspace"[^>]*aria-selected="false"/)
      expect(html).toMatch(/id="rail-tab-settings"[^>]*aria-selected="false"/)
    })
  })

  describe('Mobile Floating Dual Dock (<600px)', () => {
    it('renders the mobile dock with Rhythm dynamic pill structure', () => {
      const html = renderDock({ destination: 'workspace' })

      expect(html).toContain('class="shiin-dual-dock"')
      expect(html).toContain('class="shiin-dock-navigation"')

      // Active tab (workspace)
      expect(html).toMatch(/id="dock-tab-workspace"[^>]*aria-selected="true"/)
      expect(html).toContain('class="shiin-dock-navigation__label"')
      expect(html).toContain('工作台')

      // Inactive tabs (analytics, settings)
      expect(html).toMatch(/id="dock-tab-analytics"[^>]*aria-selected="false"/)
      expect(html).toContain('title="统计"')
      expect(html).toContain('aria-label="统计"')

      expect(html).toMatch(/id="dock-tab-settings"[^>]*aria-selected="false"/)
      expect(html).toContain('title="设置"')
      expect(html).toContain('aria-label="设置"')
    })

    it('updates active tab correctly when destination switches to settings', () => {
      const html = renderDock({ destination: 'settings' })

      expect(html).toMatch(/id="dock-tab-settings"[^>]*aria-selected="true"/)
      expect(html).toMatch(/id="dock-tab-workspace"[^>]*aria-selected="false"/)
      expect(html).toMatch(/id="dock-tab-analytics"[^>]*aria-selected="false"/)
      expect(html).toContain('设置')
    })
  })
})
