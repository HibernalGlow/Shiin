import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SHAPE_PREFERENCES,
  MD3E_ICON_SHAPES,
  MD3E_SHAPE_PRESETS,
  MD3E_SHAPE_ROLES,
  MD3E_TEXT_SHAPES,
  SHAPE_POINT_COUNT,
  createShapeSeed,
  blendShapePaths,
  createShapeSession,
  getIconShape,
  getTextShape,
  normalizeShapePreferences,
  seededRandom,
} from '../src/ui/md3e-shapes.js'

function pathNumbers(path: string): number[] {
  return (path.match(/-?\d+(?:\.\d+)?/g) || []).map(Number)
}

function pathSegments(path: string): { moves: number; curves: number; closed: boolean } {
  return {
    moves: (path.match(/M/g) || []).length,
    curves: (path.match(/C/g) || []).length,
    closed: path.trim().endsWith('Z'),
  }
}

describe('MD3E icon shape catalog', () => {
  it('exposes the full 35-shape expressive catalog', () => {
    expect(MD3E_ICON_SHAPES).toHaveLength(35)
    expect(new Set(MD3E_ICON_SHAPES.map((shape) => shape.id)).size).toBe(35)
  })

  it('shares a morph-compatible structure across every shape', () => {
    for (const shape of MD3E_ICON_SHAPES) {
      const segments = pathSegments(shape.svgPath)
      expect(segments.moves, shape.id).toBe(1)
      expect(segments.curves, shape.id).toBe(SHAPE_POINT_COUNT)
      expect(segments.closed, shape.id).toBe(true)
    }
  })

  it('keeps every generated coordinate inside the 100×100 viewBox', () => {
    for (const shape of MD3E_ICON_SHAPES) {
      const numbers = pathNumbers(shape.svgPath)
      expect(numbers.length, shape.id).toBeGreaterThan(0)
      for (const value of numbers) {
        expect(value, `${shape.id} coordinate`).toBeGreaterThanOrEqual(0)
        expect(value, `${shape.id} coordinate`).toBeLessThanOrEqual(100)
      }
    }
  })

  it('produces visibly different outlines for circle, clover and arch', () => {
    const circle = getIconShape('circle').svgPath
    const clover = getIconShape('clover').svgPath
    const arch = getIconShape('arch').svgPath
    expect(new Set([circle, clover, arch]).size).toBe(3)
  })

  it('falls back to the first shape for unknown ids', () => {
    expect(getIconShape('missing' as never).id).toBe(MD3E_ICON_SHAPES[0].id)
  })
})

describe('MD3E shape morph', () => {
  it('interpolates between catalog paths without changing their structure', () => {
    const circle = getIconShape('circle').svgPath
    const clover = getIconShape('clover').svgPath
    expect(blendShapePaths(circle, clover, 0)).toBe(circle)
    expect(blendShapePaths(circle, clover, 1)).toBe(clover)
    const middle = blendShapePaths(circle, clover, 0.5)
    const segments = pathSegments(middle)
    expect(segments.moves).toBe(1)
    expect(segments.curves).toBe(SHAPE_POINT_COUNT)
    expect(segments.closed).toBe(true)
    for (const value of pathNumbers(middle)) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(100)
    }
  })
})

describe('MD3E text shape catalog', () => {
  it('maps round, soft and pill to the documented radii', () => {
    expect(getTextShape('round').radius).toBe(12)
    expect(getTextShape('soft').radius).toBe(26)
    expect(getTextShape('pill').radius).toBe(999)
    expect(MD3E_TEXT_SHAPES).toHaveLength(3)
  })

  it('falls back to pill for unknown ids', () => {
    expect(getTextShape('missing' as never).id).toBe('pill')
  })
})

describe('shape preferences', () => {
  it('normalizes missing or invalid persisted values', () => {
    expect(normalizeShapePreferences(null)).toEqual(DEFAULT_SHAPE_PREFERENCES)
    expect(normalizeShapePreferences({ mode: 'nope', icon: 'nope', text: 'nope' })).toEqual(
      DEFAULT_SHAPE_PREFERENCES
    )
  })

  it('preserves a valid fixed role combination', () => {
    const shapes = {
      hero: 'clover',
      device: 'cookie6',
      control: 'arch',
      icon: 'puffy',
      metric: 'star5',
    } as const
    expect(
      normalizeShapePreferences({ mode: 'fixed', preset: 'custom', shapes, text: 'soft' })
    ).toEqual({ mode: 'fixed', preset: 'custom', shapes, text: 'soft' })
  })

  it('migrates the legacy single icon into every role', () => {
    const migrated = normalizeShapePreferences({ mode: 'fixed', icon: 'clover', text: 'soft' })
    expect(migrated.shapes).toEqual({
      hero: 'clover',
      device: 'clover',
      control: 'clover',
      icon: 'clover',
      metric: 'clover',
    })
  })

  it('keeps presets independent per role', () => {
    for (const preset of MD3E_SHAPE_PRESETS) {
      expect(Object.keys(preset.shapes).sort()).toEqual([...MD3E_SHAPE_ROLES].sort())
    }
  })
})

describe('shape session resolution', () => {
  it('is deterministic for the same seed and preferences', () => {
    const first = createShapeSession({ ...DEFAULT_SHAPE_PREFERENCES, mode: 'random' }, 123456)
    const second = createShapeSession({ ...DEFAULT_SHAPE_PREFERENCES, mode: 'random' }, 123456)
    expect(MD3E_SHAPE_ROLES.map((role) => first.shapes[role].id)).toEqual(
      MD3E_SHAPE_ROLES.map((role) => second.shapes[role].id)
    )
    expect(first.text.id).toBe(second.text.id)
    expect(first.randomized).toBe(true)
  })

  it('draws a different shape for each role within a random session', () => {
    for (let seed = 1; seed <= 25; seed += 1) {
      const session = createShapeSession({ ...DEFAULT_SHAPE_PREFERENCES, mode: 'random' }, seed)
      const ids = MD3E_SHAPE_ROLES.map((role) => session.shapes[role].id)
      expect(new Set(ids).size, `seed ${seed}`).toBe(MD3E_SHAPE_ROLES.length)
    }
  })

  it('keeps fixed role preferences regardless of the seed', () => {
    const shapes = {
      hero: 'arch',
      device: 'heart',
      control: 'cookie4',
      icon: 'clover',
      metric: 'star8',
    } as const
    const session = createShapeSession(
      { mode: 'fixed', preset: 'custom', shapes, text: 'round' },
      999
    )
    expect(MD3E_SHAPE_ROLES.map((role) => session.shapes[role].id)).toEqual(
      MD3E_SHAPE_ROLES.map((role) => shapes[role])
    )
    expect(session.text.id).toBe('round')
    expect(session.mode).toBe('fixed')
    expect(session.randomized).toBe(false)
  })

  it('re-rolls roles across startup seeds instead of freezing one combination', () => {
    const combinations = new Set<string>()
    for (let seed = 1; seed <= 40; seed += 1) {
      const session = createShapeSession({ ...DEFAULT_SHAPE_PREFERENCES, mode: 'random' }, seed)
      combinations.add(MD3E_SHAPE_ROLES.map((role) => session.shapes[role].id).join(':'))
    }
    expect(combinations.size).toBeGreaterThan(1)
  })

  it('only ever picks catalog members', () => {
    const iconIds = new Set(MD3E_ICON_SHAPES.map((shape) => shape.id))
    const textIds = new Set(MD3E_TEXT_SHAPES.map((shape) => shape.id))
    for (let seed = 0; seed < 100; seed += 1) {
      const session = createShapeSession({ ...DEFAULT_SHAPE_PREFERENCES, mode: 'random' }, seed)
      for (const role of MD3E_SHAPE_ROLES) {
        expect(iconIds.has(session.shapes[role].id)).toBe(true)
      }
      expect(textIds.has(session.text.id)).toBe(true)
    }
  })

  it('keeps all controls of one class on their own shape within a session', () => {
    const session = createShapeSession({ ...DEFAULT_SHAPE_PREFERENCES, mode: 'random' }, 7)
    for (const role of MD3E_SHAPE_ROLES) {
      expect(getIconShape(session.shapes[role].id).svgPath).toBe(session.shapes[role].svgPath)
    }
    expect(getTextShape(session.text.id).radius).toBe(session.text.radius)
  })
})

describe('seededRandom / createShapeSeed', () => {
  it('produces the same stream for the same seed and stays in [0, 1)', () => {
    const a = seededRandom(42)
    const b = seededRandom(42)
    for (let index = 0; index < 50; index += 1) {
      const value = a()
      expect(value).toBe(b())
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('creates uint32 seeds', () => {
    for (let index = 0; index < 10; index += 1) {
      const seed = createShapeSeed()
      expect(Number.isInteger(seed)).toBe(true)
      expect(seed).toBeGreaterThanOrEqual(0)
      expect(seed).toBeLessThanOrEqual(0xffffffff)
    }
  })
})
