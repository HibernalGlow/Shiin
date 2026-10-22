import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { AppIcon } from './AppIcon.js'
import {
  WORKSPACE_WIDGET_REGISTRY,
  type WorkspaceLayoutConfig,
  type WorkspacePlacedWidget,
  type WorkspaceWidgetId,
  type WorkspaceWidgetSize,
  getDefaultWorkspaceLayout,
  workspaceSpan,
  workspaceTabletSpan,
} from '../workspace-layout.js'
import { useWidgetLayout, type WidgetLayoutController } from '../use-widget-layout.js'

/**
 * Workspace grid plumbing.
 *
 * The workbench reuses the analytics widget framework — the same layout engine,
 * the same persistence, the same discrete spanning model — but wears it more
 * quietly: a single low-contrast pencil button reveals per-card placement
 * controls that are otherwise invisible, so the everyday view stays untouched.
 */

interface WorkspaceGridContextValue {
  locale: string
  isEditing: boolean
  layout: WorkspaceLayoutConfig
  availableIds: Set<string>
  hiddenWidgets: WorkspacePlacedWidget[]
  draggingId: WorkspaceWidgetId | null
  toggleEditing: () => void
  setEditing: (next: boolean) => void
  setSize: (id: WorkspaceWidgetId, size: WorkspaceWidgetSize) => void
  moveBy: (id: WorkspaceWidgetId, delta: number) => void
  hide: (id: WorkspaceWidgetId) => void
  show: (id: WorkspaceWidgetId) => void
  reset: () => void
  beginDrag: (id: WorkspaceWidgetId) => void
  endDrag: () => void
  dropOn: (targetId: WorkspaceWidgetId) => void
  reorder: (draggedId: WorkspaceWidgetId, targetId: WorkspaceWidgetId) => void
}

const WorkspaceGridContext = React.createContext<WorkspaceGridContextValue | null>(null)

export function useWorkspaceGrid(): WorkspaceGridContextValue | null {
  return React.useContext(WorkspaceGridContext)
}

export interface WorkspaceGridProviderProps {
  locale: string
  initialLayout?: WorkspaceLayoutConfig
  onSaveLayout?: (layout: WorkspaceLayoutConfig) => void
  /** Controlled from the title bar; omit to keep the state inside the grid. */
  isEditing?: boolean
  onEditingChange?: (next: boolean) => void
  /** Widget ids the host currently allows to render (e.g. the opt-in capture hub). */
  availability?: Partial<Record<WorkspaceWidgetId, boolean>>
  children: React.ReactNode
}

export const WorkspaceGridProvider: React.FC<WorkspaceGridProviderProps> = ({
  locale,
  initialLayout,
  onSaveLayout,
  isEditing,
  onEditingChange,
  availability,
  children,
}) => {
  const controller: WidgetLayoutController<WorkspaceWidgetSize, WorkspaceWidgetId> =
    useWidgetLayout<WorkspaceWidgetSize, WorkspaceWidgetId>({
      createDefault: getDefaultWorkspaceLayout,
      initialLayout,
      onSave: onSaveLayout,
      isEditing,
      onEditingChange,
    })
  const [draggingId, setDraggingId] = React.useState<WorkspaceWidgetId | null>(null)
  // Mirrors `draggingId` so drop handlers never read a stale closure value.
  const draggingRef = React.useRef<WorkspaceWidgetId | null>(null)

  const availableIds = React.useMemo(() => {
    const ids = new Set<string>()
    for (const id of Object.keys(WORKSPACE_WIDGET_REGISTRY)) {
      if (availability?.[id as WorkspaceWidgetId] === false) continue
      ids.add(id)
    }
    return ids
  }, [availability])

  /**
   * Step one slot in the *rendered* order: widgets that are hidden (or not
   * available on this host) are skipped so a single tap always moves the card
   * past something visible.
   */
  const moveBy = React.useCallback(
    (id: WorkspaceWidgetId, delta: number) => {
      const widgets = controller.layout.widgets
      const index = widgets.findIndex((widget) => widget.id === id)
      if (index < 0) return
      const isRendered = (widget: WorkspacePlacedWidget) =>
        widget.visible && availableIds.has(widget.id)
      let target = index + delta
      while (target >= 0 && target < widgets.length && !isRendered(widgets[target])) {
        target += delta
      }
      if (target < 0 || target >= widgets.length) return
      controller.reorder(id, widgets[target].id)
    },
    [controller, availableIds]
  )

  const value = React.useMemo<WorkspaceGridContextValue>(
    () => ({
      locale,
      isEditing: controller.isEditing,
      layout: controller.layout,
      availableIds,
      hiddenWidgets: controller.hiddenWidgets.filter((widget) => availableIds.has(widget.id)),
      draggingId,
      toggleEditing: controller.toggleEditing,
      setEditing: controller.setEditing,
      setSize: controller.setSize,
      moveBy,
      hide: controller.hide,
      show: controller.show,
      reset: controller.reset,
      beginDrag: (id: WorkspaceWidgetId) => {
        draggingRef.current = id
        setDraggingId(id)
      },
      endDrag: () => {
        draggingRef.current = null
        setDraggingId(null)
      },
      dropOn: (targetId: WorkspaceWidgetId) => {
        const source = draggingRef.current
        draggingRef.current = null
        setDraggingId(null)
        if (source && source !== targetId) controller.reorder(source, targetId)
      },
      reorder: controller.reorder,
    }),
    [
      locale,
      controller.isEditing,
      controller.layout,
      controller.hiddenWidgets,
      controller.toggleEditing,
      controller.setEditing,
      controller.setSize,
      moveBy,
      controller.hide,
      controller.show,
      controller.reset,
      controller.reorder,
      availableIds,
      draggingId,
    ]
  )

  return <WorkspaceGridContext.Provider value={value}>{children}</WorkspaceGridContext.Provider>
}

/**
 * Orders its `<WorkspaceCell>` children by the persisted layout while keeping
 * real DOM order in sync (no CSS `order` trickery, so focus follows the eye).
 */
export const WorkspaceSortGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const grid = useWorkspaceGrid()
  const items = React.Children.toArray(children)
  if (!grid) return <>{items}</>

  const rank = new Map<string, number>()
  grid.layout.widgets.forEach((widget, index) => rank.set(widget.id, index))

  const sorted = [...items].sort((a, b) => {
    const idA = React.isValidElement(a) ? String((a.props as { id?: string }).id ?? '') : ''
    const idB = React.isValidElement(b) ? String((b.props as { id?: string }).id ?? '') : ''
    return (rank.get(idA) ?? Number.MAX_SAFE_INTEGER) - (rank.get(idB) ?? Number.MAX_SAFE_INTEGER)
  })

  return <>{sorted}</>
}

export interface WorkspaceCellProps {
  id: WorkspaceWidgetId
  children: React.ReactNode
}

export const WorkspaceCell: React.FC<WorkspaceCellProps> = ({ id, children }) => {
  const grid = useWorkspaceGrid()
  if (!grid) return <>{children}</>

  const meta = WORKSPACE_WIDGET_REGISTRY[id]
  const placed = grid.layout.widgets.find((widget) => widget.id === id)
  if (!meta || !placed || !placed.visible || !grid.availableIds.has(id)) return null

  const isZh = grid.locale.startsWith('zh')
  const span = workspaceSpan(placed.size)
  const tabletSpan = workspaceTabletSpan(span)
  const isDragging = grid.draggingId === id

  const cellStyle = {
    '--ws-span': String(span),
    '--ws-span-md': String(tabletSpan),
  } as React.CSSProperties

  return (
    <div
      className={`shiin-ws-cell ${grid.isEditing ? 'is-editing' : ''} ${isDragging ? 'is-dragging' : ''}`}
      style={cellStyle}
      data-widget-id={id}
      data-size={placed.size}
      onDragOver={(event) => {
        if (!grid.isEditing) return
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
      }}
      onDrop={(event) => {
        if (!grid.isEditing) return
        event.preventDefault()
        grid.dropOn(id)
      }}
    >
      {grid.isEditing && (
        <div className="shiin-ws-cell__chrome" aria-label={isZh ? '模块布局工具' : 'Widget placement tools'}>
          <span className="shiin-ws-cell__grip" title={isZh ? '拖拽调整顺序' : 'Drag to reorder'}>
            <AppIcon name="move" size={12} />
          </span>
          <span className="shiin-ws-cell__label">{isZh ? meta.titleZh : meta.titleEn}</span>

          <div
            className="shiin-ws-cell__sizes"
            role="group"
            aria-label={isZh ? '占位宽度（共 12 列）' : 'Column span (of 12)'}
          >
            <span className="shiin-ws-cell__unit" aria-hidden="true">
              {isZh ? '宽' : 'W'}
            </span>
            {meta.supportedSizes.map((size) => (
              <button
                key={size}
                type="button"
                className={`shiin-ws-cell__size ${placed.size === size ? 'is-active' : ''}`}
                aria-pressed={placed.size === size}
                title={`${isZh ? '宽度' : 'Width'} ${size}/12`}
                onClick={() => grid.setSize(id, size)}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="shiin-ws-cell__actions">
            <button
              type="button"
              className="shiin-ws-cell__ctrl"
              onClick={() => grid.moveBy(id, -1)}
              title={isZh ? '向前移动' : 'Move earlier'}
              aria-label={isZh ? '向前移动' : 'Move earlier'}
            >
              <AppIcon name="chevronRight" size={12} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <button
              type="button"
              className="shiin-ws-cell__ctrl"
              onClick={() => grid.moveBy(id, 1)}
              title={isZh ? '向后移动' : 'Move later'}
              aria-label={isZh ? '向后移动' : 'Move later'}
            >
              <AppIcon name="chevronRight" size={12} />
            </button>
            <button
              type="button"
              className="shiin-ws-cell__ctrl is-danger"
              onClick={() => grid.hide(id)}
              title={isZh ? '暂时收起此模块' : 'Hide this widget'}
              aria-label={isZh ? '暂时收起此模块' : 'Hide this widget'}
            >
              <AppIcon name="close" size={11} />
            </button>
          </div>
        </div>
      )}

      <div
        className="shiin-ws-cell__body"
        draggable={grid.isEditing}
        onDragStart={(event) => {
          if (!grid.isEditing) return
          grid.beginDrag(id)
          event.dataTransfer.setData('text/plain', id)
          event.dataTransfer.effectAllowed = 'move'
        }}
        onDragEnd={grid.endDrag}
      >
        {children}
      </div>
    </div>
  )
}

/** Edit-mode tools, driven from the title bar's pencil. */
export const WorkspaceLayoutToolbar: React.FC = () => {
  const grid = useWorkspaceGrid()
  const reduceMotion = useReducedMotion()
  const [addOpen, setAddOpen] = React.useState(false)
  const [confirmReset, setConfirmReset] = React.useState(false)
  const isEditing = grid?.isEditing ?? false

  React.useEffect(() => {
    if (!isEditing) {
      setAddOpen(false)
      setConfirmReset(false)
    }
  }, [isEditing])

  // "恢复默认" asks once, then quietly forgets after a moment.
  React.useEffect(() => {
    if (!confirmReset) return
    const timer = window.setTimeout(() => setConfirmReset(false), 3600)
    return () => window.clearTimeout(timer)
  }, [confirmReset])

  if (!grid || !grid.isEditing) return null

  const isZh = grid.locale.startsWith('zh')

  return (
    <div className="shiin-ws-tools" data-editing={grid.isEditing || undefined}>
      <AnimatePresence initial={false}>
        {grid.hiddenWidgets.length > 0 && (
          <motion.div
            className="shiin-ws-tools__add"
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.9 }}
            transition={{ duration: 0.14 }}
          >
            <button
              type="button"
              className="shiin-ws-tool"
              aria-haspopup="menu"
              aria-expanded={addOpen}
              onClick={() => setAddOpen((open) => !open)}
              title={isZh ? '重新放回已收起的模块' : 'Put hidden widgets back'}
            >
              <AppIcon name="plus" size={15} />
              <span className="shiin-ws-tool__count">{grid.hiddenWidgets.length}</span>
            </button>

            <AnimatePresence>
              {addOpen && (
                <motion.div
                  className="shiin-dash-menu shiin-ws-tools__menu"
                  role="menu"
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.14 }}
                >
                  {grid.hiddenWidgets.map((widget) => {
                    const meta = WORKSPACE_WIDGET_REGISTRY[widget.id]
                    if (!meta) return null
                    return (
                      <button
                        key={widget.id}
                        type="button"
                        role="menuitem"
                        className="shiin-dash-menu__item"
                        onClick={() => {
                          grid.show(widget.id)
                          setAddOpen(false)
                        }}
                      >
                        <AppIcon name={meta.icon} size={15} />
                        <div className="shiin-dash-menu__item-copy">
                          <strong>{isZh ? meta.titleZh : meta.titleEn}</strong>
                          <small>{isZh ? meta.descriptionZh : meta.descriptionEn}</small>
                        </div>
                        <AppIcon name="plus" size={12} />
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        className="shiin-ws-tool shiin-ws-tool--label"
        data-confirming={confirmReset || undefined}
        onClick={() => {
          if (confirmReset) {
            grid.reset()
            setConfirmReset(false)
            return
          }
          setConfirmReset(true)
        }}
        title={isZh ? '把所有卡片恢复成默认排版' : 'Restore every card to the default layout'}
        aria-label={isZh ? '恢复默认排版' : 'Restore default layout'}
      >
        <AppIcon name="restore" size={14} />
        <span>
          {confirmReset ? (isZh ? '确认恢复' : 'Confirm') : isZh ? '恢复默认' : 'Restore'}
        </span>
      </button>

      <button
        type="button"
        className="shiin-ws-tool is-toggle is-active"
        aria-pressed
        aria-label={isZh ? '完成布局调整' : 'Done adjusting layout'}
        title={isZh ? '完成布局调整' : 'Done'}
        onClick={() => grid.setEditing(false)}
      >
        <AppIcon name="check" size={16} />
      </button>
    </div>
  )
}
