/**
 * Shiin Widget Layout Engine
 *
 * The shared, surface-agnostic core behind every editable bento surface
 * (analytics dashboard, workspace workbench, …):
 *
 * - discrete widget sizes with per-widget supported sets
 * - ordered placement + visibility
 * - defensive normalization / migration of persisted layouts
 * - reordering helpers
 *
 * A surface supplies its own widget registry and size vocabulary; this module
 * only owns the invariants so persisted layouts from older builds never break
 * a view.
 */

export interface WidgetMetaBase<S extends string = string, I extends string = string> {
  id: I
  titleZh: string
  titleEn: string
  descriptionZh: string
  descriptionEn: string
  icon: string
  defaultSize: S
  supportedSizes: S[]
  category: string
}

export interface PlacedWidget<S extends string = string, I extends string = string> {
  id: I
  size: S
  visible: boolean
}

export interface WidgetLayoutConfig<S extends string = string, I extends string = string> {
  version: 1
  widgets: PlacedWidget<S, I>[]
  gapPx: number
}

/** Move an item inside an ordered list, returning the original list on no-ops. */
export function moveInList<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex < 0 ||
    fromIndex >= items.length ||
    toIndex < 0 ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items
  }
  const next = [...items]
  const [removed] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, removed)
  return next
}

/**
 * Validates and migrates a stored layout against the live registry:
 * - unknown widget ids are dropped
 * - duplicate ids keep their first occurrence
 * - unsupported sizes fall back to the widget's default size
 * - widgets added in newer builds are appended so they never disappear
 */
export function normalizeWidgetLayout<S extends string, I extends string>(
  input: unknown,
  registry: Record<string, WidgetMetaBase<S, I>>,
  fallback: WidgetLayoutConfig<S, I>
): WidgetLayoutConfig<S, I> {
  if (!input || typeof input !== 'object') return fallback

  const candidate = input as Partial<WidgetLayoutConfig<S, I>>
  if (!Array.isArray(candidate.widgets)) return fallback

  const knownIds = new Set<string>(Object.keys(registry))
  const seenIds = new Set<string>()
  const validWidgets: PlacedWidget<S, I>[] = []

  for (const item of candidate.widgets as unknown[]) {
    if (
      item &&
      typeof item === 'object' &&
      typeof (item as PlacedWidget<S, I>).id === 'string' &&
      knownIds.has((item as PlacedWidget<S, I>).id) &&
      !seenIds.has((item as PlacedWidget<S, I>).id)
    ) {
      const placed = item as PlacedWidget<S, I>
      seenIds.add(placed.id)
      const meta = registry[placed.id]
      const size = meta.supportedSizes.includes(placed.size) ? placed.size : meta.defaultSize
      validWidgets.push({
        id: placed.id,
        size,
        visible: placed.visible !== false,
      })
    }
  }

  for (const fallbackWidget of fallback.widgets) {
    if (!seenIds.has(fallbackWidget.id)) {
      validWidgets.push({ ...fallbackWidget })
    }
  }

  return {
    version: 1,
    gapPx: fallback.gapPx,
    widgets: validWidgets,
  }
}
