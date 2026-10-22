import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import {
  WORKSPACE_WIDGET_REGISTRY,
  getDefaultWorkspaceLayout,
  moveWorkspaceWidget,
  normalizeWorkspaceLayout,
  workspaceSpan,
  workspaceTabletSpan,
} from '../src/ui/workspace-layout.js'
import {
  WorkspaceCell,
  WorkspaceGridProvider,
  WorkspaceSortGrid,
} from '../src/ui/components/WorkspaceGrid.js'
import { normalizeWidgetLayout, moveInList } from '../src/ui/widget-layout.js'

describe('Workspace widget layout (shared framework)', () => {
  it('ships a default layout that covers every registered widget once', () => {
    const layout = getDefaultWorkspaceLayout()
    const ids = layout.widgets.map((widget) => widget.id)

    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(ids)).toEqual(new Set(Object.keys(WORKSPACE_WIDGET_REGISTRY)))

    // The hand-tuned asymmetric bento is the default: 8 + 4 hero pair,
    // full-width overview, and 7 + 5 pane pairs.
    expect(layout.widgets.map((widget) => widget.size)).toEqual(['8', '4', '12', '12', '7', '5', '7', '5'])
    expect(layout.widgets.every((widget) => widget.visible)).toBe(true)
  })

  it('declares only sizes the widget actually supports', () => {
    for (const meta of Object.values(WORKSPACE_WIDGET_REGISTRY)) {
      expect(meta.supportedSizes).toContain(meta.defaultSize)
      for (const size of meta.supportedSizes) {
        expect(workspaceSpan(size)).toBeGreaterThan(0)
        expect(workspaceSpan(size)).toBeLessThanOrEqual(12)
      }
    }
  })

  it('normalizes stored layouts: drops unknown ids, repairs sizes, appends new widgets', () => {
    const layout = normalizeWorkspaceLayout({
      version: 1,
      gapPx: 16,
      widgets: [
        { id: 'ws_combos', size: '9', visible: true }, // 9 is not supported by combos
        { id: 'ws_ghost', size: '6', visible: true }, // unknown id
        { id: 'ws_capture', size: '6', visible: false },
        { id: 'ws_capture', size: '5', visible: true }, // duplicate
      ],
    })

    const combos = layout.widgets[0]
    expect(combos).toEqual({ id: 'ws_combos', size: WORKSPACE_WIDGET_REGISTRY.ws_combos.defaultSize, visible: true })

    expect(layout.widgets.find((widget) => widget.id === 'ws_capture')).toEqual({
      id: 'ws_capture',
      size: '6',
      visible: false,
    })
    expect(layout.widgets.some((widget) => (widget.id as string) === 'ws_ghost')).toBe(false)
    // Widgets missing from the stored payload are appended, never lost.
    expect(layout.widgets).toHaveLength(Object.keys(WORKSPACE_WIDGET_REGISTRY).length)
  })

  it('falls back to the default layout for malformed payloads', () => {
    expect(normalizeWorkspaceLayout(null)).toEqual(getDefaultWorkspaceLayout())
    expect(normalizeWorkspaceLayout({ widgets: 'nope' })).toEqual(getDefaultWorkspaceLayout())
  })

  it('maps spans to the tablet two-column rhythm', () => {
    expect(workspaceTabletSpan(12)).toBe(12)
    expect(workspaceTabletSpan(8)).toBe(12)
    expect(workspaceTabletSpan(7)).toBe(6)
    expect(workspaceTabletSpan(5)).toBe(6)
    // A narrow companion keeps the full width so it never strands its pair.
    expect(workspaceTabletSpan(4)).toBe(12)
    expect(workspaceTabletSpan(3)).toBe(12)
  })

  it('clamps out-of-range spans', () => {
    expect(workspaceSpan('0')).toBe(12)
    expect(workspaceSpan('99')).toBe(12)
    expect(workspaceSpan('abc')).toBe(12)
    expect(workspaceSpan('6')).toBe(6)
  })

  it('reorders widgets without mutating the source list', () => {
    const widgets = getDefaultWorkspaceLayout().widgets
    const moved = moveWorkspaceWidget(widgets, 4, 0)
    expect(moved.map((widget) => widget.id)[0]).toBe('ws_capture')
    expect(widgets[0].id).toBe('ws_capture_hero')
  })

  it('shares the reorder + normalization core with the analytics surface', () => {
    const list = ['a', 'b', 'c']
    expect(moveInList(list, 0, 2)).toEqual(['b', 'c', 'a'])
    expect(moveInList(list, 1, 1)).toBe(list)
    expect(moveInList(list, -1, 2)).toBe(list)
    expect(list).toEqual(['a', 'b', 'c'])

    const registry = {
      only: {
        id: 'only',
        titleZh: '',
        titleEn: '',
        descriptionZh: '',
        descriptionEn: '',
        icon: 'camera',
        defaultSize: '6',
        supportedSizes: ['6'],
        category: 'panel',
      },
    }
    const fallback = { version: 1 as const, gapPx: 16, widgets: [{ id: 'only', size: '6' as const, visible: true }] }
    expect(normalizeWidgetLayout({ widgets: [] }, registry, fallback)).toEqual(fallback)
  })
})

describe('Workspace grid rendering', () => {
  const renderCell = (id: Parameters<typeof WorkspaceCell>[0]['id'], label: string) =>
    React.createElement(WorkspaceCell, {
      id,
      key: id,
      children: React.createElement('div', null, label),
    })

  const renderGrid = (layout?: ReturnType<typeof getDefaultWorkspaceLayout>) =>
    renderToStaticMarkup(
      React.createElement(WorkspaceGridProvider, {
        locale: 'zh',
        initialLayout: layout,
        availability: { ws_hub: false },
        children: React.createElement(
          WorkspaceSortGrid,
          null,
          renderCell('ws_capture_hero', 'hero'),
          renderCell('ws_session', 'session'),
          renderCell('ws_metric_strip', 'metrics'),
          renderCell('ws_hub', 'hub')
        ),
      })
    )

  it('emits span variables and falls back to the default layout', () => {
    const html = renderGrid()
    expect(html).toContain('--ws-span:8')
    expect(html).toContain('--ws-span-md:12')
    expect(html).toContain('--ws-span:4')
    expect(html).toContain('data-widget-id="ws_capture_hero"')
    // Hidden chrome is invisible until editing starts.
    expect(html).not.toContain('shiin-ws-cell__chrome')
  })

  it('renders cells in the persisted order and skips hidden widgets', () => {
    const layout = normalizeWorkspaceLayout({
      widgets: [
        { id: 'ws_metric_strip', size: '12', visible: true },
        { id: 'ws_session', size: '4', visible: false },
        { id: 'ws_capture_hero', size: '8', visible: true },
        { id: 'ws_hub', size: '12', visible: true },
      ],
    })
    const html = renderGrid(layout)

    const metrics = html.indexOf('data-widget-id="ws_metric_strip"')
    const hero = html.indexOf('data-widget-id="ws_capture_hero"')
    expect(metrics).toBeGreaterThan(-1)
    expect(metrics).toBeLessThan(hero)
    expect(html).not.toContain('data-widget-id="ws_session"')
    // The capture hub is opt-in, so it never renders without host availability.
    expect(html).not.toContain('data-widget-id="ws_hub"')
  })
})
