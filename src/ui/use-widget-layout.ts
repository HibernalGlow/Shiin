/**
 * useWidgetLayout — the behavior layer shared by every editable bento surface.
 *
 * Both the analytics dashboard and the workspace workbench drive their grids
 * through this hook so that editing, reordering, sizing, hiding and persistence
 * stay identical (and bug fixes land in one place).
 */

import * as React from 'react'
import {
  type PlacedWidget,
  type WidgetLayoutConfig,
  type WidgetMetaBase,
  moveInList,
} from './widget-layout.js'

export interface UseWidgetLayoutOptions<S extends string, I extends string> {
  createDefault: () => WidgetLayoutConfig<S, I>
  initialLayout?: WidgetLayoutConfig<S, I>
  onSave?: (layout: WidgetLayoutConfig<S, I>) => void
  /** Controlled editing state — omit to let the surface own it. */
  isEditing?: boolean
  onEditingChange?: (next: boolean) => void
}

export interface WidgetLayoutController<S extends string, I extends string> {
  layout: WidgetLayoutConfig<S, I>
  isEditing: boolean
  visibleWidgets: PlacedWidget<S, I>[]
  hiddenWidgets: PlacedWidget<S, I>[]
  setEditing: (next: boolean) => void
  toggleEditing: () => void
  setSize: (id: I, size: S) => void
  moveBy: (id: I, delta: number) => void
  reorder: (draggedId: I, targetId: I) => void
  hide: (id: I) => void
  show: (id: I) => void
  reset: () => void
}

export function useWidgetLayout<S extends string, I extends string>({
  createDefault,
  initialLayout,
  onSave,
  isEditing,
  onEditingChange,
}: UseWidgetLayoutOptions<S, I>): WidgetLayoutController<S, I> {
  const [layout, setLayout] = React.useState<WidgetLayoutConfig<S, I>>(
    () => initialLayout ?? createDefault()
  )
  const [internalEditing, setInternalEditing] = React.useState(false)

  // Adopt a layout that finishes loading from the host store after first paint.
  React.useEffect(() => {
    if (initialLayout) setLayout(initialLayout)
  }, [initialLayout])

  const onSaveRef = React.useRef(onSave)
  onSaveRef.current = onSave
  const onEditingChangeRef = React.useRef(onEditingChange)
  onEditingChangeRef.current = onEditingChange

  const editing = isEditing ?? internalEditing
  const setEditing = React.useCallback(
    (next: boolean) => {
      if (isEditing === undefined) setInternalEditing(next)
      onEditingChangeRef.current?.(next)
    },
    [isEditing]
  )
  const toggleEditing = React.useCallback(() => setEditing(!editing), [setEditing, editing])

  const setSize = React.useCallback((id: I, size: S) => {
    setLayout((current) => {
      const widgets = current.widgets.map((widget) =>
        widget.id === id ? { ...widget, size } : widget
      )
      const next = { ...current, widgets }
      onSaveRef.current?.(next)
      return next
    })
  }, [])

  const moveBy = React.useCallback((id: I, delta: number) => {
    setLayout((current) => {
      const index = current.widgets.findIndex((widget) => widget.id === id)
      if (index < 0) return current
      // Skip hidden widgets so a step always moves the card past something the
      // user can actually see.
      let target = index + delta
      while (target >= 0 && target < current.widgets.length && !current.widgets[target].visible) {
        target += delta
      }
      if (target < 0 || target >= current.widgets.length) return current
      const widgets = moveInList(current.widgets, index, target)
      if (widgets === current.widgets) return current
      const next = { ...current, widgets }
      onSaveRef.current?.(next)
      return next
    })
  }, [])

  const reorder = React.useCallback((draggedId: I, targetId: I) => {
    setLayout((current) => {
      const from = current.widgets.findIndex((widget) => widget.id === draggedId)
      const to = current.widgets.findIndex((widget) => widget.id === targetId)
      const widgets = moveInList(current.widgets, from, to)
      if (widgets === current.widgets) return current
      const next = { ...current, widgets }
      onSaveRef.current?.(next)
      return next
    })
  }, [])

  const setVisibility = React.useCallback((id: I, visible: boolean) => {
    setLayout((current) => {
      const widgets = current.widgets.map((widget) =>
        widget.id === id ? { ...widget, visible } : widget
      )
      const next = { ...current, widgets }
      onSaveRef.current?.(next)
      return next
    })
  }, [])

  const reset = React.useCallback(() => {
    const next = createDefault()
    setLayout(next)
    onSaveRef.current?.(next)
  }, [createDefault])

  return {
    layout,
    isEditing: editing,
    visibleWidgets: layout.widgets.filter((widget) => widget.visible),
    hiddenWidgets: layout.widgets.filter((widget) => !widget.visible),
    setEditing,
    toggleEditing,
    setSize,
    moveBy,
    reorder,
    hide: (id: I) => setVisibility(id, false),
    show: (id: I) => setVisibility(id, true),
    reset,
  }
}

/** Convenience: look up the metadata of a placed widget in a registry. */
export function widgetMetaOf<S extends string, I extends string>(
  registry: Record<string, WidgetMetaBase<S, I>>,
  id: string
): WidgetMetaBase<S, I> | undefined {
  return registry[id]
}
