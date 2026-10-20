import * as React from 'react'
import {
  DEFAULT_SHAPE_PREFERENCES,
  createShapeSession,
  normalizeShapePreferences,
  sessionRoleShapeIds,
  type Md3eExpressiveShapeId,
  type Md3eShapePreferences,
  type Md3eShapeSession,
  type Md3eTextShapeId,
} from './md3e-shapes.js'

export interface Md3eShapeContextValue {
  preferences: Md3eShapePreferences
  session: Md3eShapeSession
  selectIconShape: (id: Md3eExpressiveShapeId) => void
  selectTextShape: (id: Md3eTextShapeId) => void
  lockCurrentSession: () => void
}

const fallbackSession = createShapeSession(DEFAULT_SHAPE_PREFERENCES)

const fallbackValue: Md3eShapeContextValue = {
  preferences: DEFAULT_SHAPE_PREFERENCES,
  session: fallbackSession,
  selectIconShape: () => {},
  selectTextShape: () => {},
  lockCurrentSession: () => {},
}

const Md3eShapeContext = React.createContext<Md3eShapeContextValue>(fallbackValue)

export function Md3eShapeProvider({
  preferences: controlledPreferences,
  session: controlledSession,
  onPreferencesChange,
  children,
}: {
  preferences: Md3eShapePreferences
  session?: Md3eShapeSession
  onPreferencesChange?: (next: Md3eShapePreferences) => void
  children: React.ReactNode
}): React.ReactElement {
  const preferences = React.useMemo(
    () => normalizeShapePreferences(controlledPreferences),
    [controlledPreferences]
  )
  const generatedSession = React.useMemo(() => createShapeSession(preferences), [preferences])
  const session = controlledSession ?? generatedSession

  const selectIconShape = React.useCallback(
    (icon: Md3eExpressiveShapeId) => {
      onPreferencesChange?.(
        normalizeShapePreferences({
          ...preferences,
          mode: 'fixed',
          preset: 'custom',
          shapes: { ...preferences.shapes, icon },
        })
      )
    },
    [onPreferencesChange, preferences]
  )

  const selectTextShape = React.useCallback(
    (text: Md3eTextShapeId) => {
      onPreferencesChange?.(
        normalizeShapePreferences({
          mode: 'fixed',
          preset: 'custom',
          shapes: sessionRoleShapeIds(session),
          text,
        })
      )
    },
    [onPreferencesChange, session]
  )

  const lockCurrentSession = React.useCallback(() => {
    onPreferencesChange?.(
      normalizeShapePreferences({
        mode: 'fixed',
        preset: 'custom',
        shapes: sessionRoleShapeIds(session),
        text: session.text.id,
      })
    )
  }, [onPreferencesChange, session])

  const value = React.useMemo<Md3eShapeContextValue>(
    () => ({ preferences, session, selectIconShape, selectTextShape, lockCurrentSession }),
    [lockCurrentSession, preferences, selectIconShape, selectTextShape, session]
  )

  return (
    <Md3eShapeContext.Provider value={value}>
      <div
        className="xaihi-md3e-shape-scope"
        data-shape-mode={session.mode}
        data-hero-shape={session.shapes.hero.id}
        data-device-shape={session.shapes.device.id}
        data-control-shape={session.shapes.control.id}
        data-icon-shape={session.shapes.icon.id}
        data-metric-shape={session.shapes.metric.id}
        data-text-shape={session.text.id}
        style={
          {
            display: 'contents',
            '--shiin-text-radius': `${session.text.radius}px`,
            '--shiin-shape-path': `path("${session.shapes.hero.svgPath}")`,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </Md3eShapeContext.Provider>
  )
}

export function useMd3eShapes(): Md3eShapeContextValue {
  return React.useContext(Md3eShapeContext)
}
