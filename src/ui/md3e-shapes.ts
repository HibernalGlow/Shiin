/**
 * Material 3 Expressive 形状系统
 *
 * 路径以 100×100 视口生成，全部形状共享同一组 72 个采样点与三次贝塞尔段数，
 * 因此可以在形状之间做同构过渡。随机策略遵循以下会话语义：
 * - random：每次启动抽取一次，同类控件共享同一形状，使用期间不再重抽；
 * - fixed：始终使用用户锁定的形状与文字形态。
 */

export const MD3E_ICON_SHAPE_IDS = [
  'circle',
  'squircle',
  'square',
  'pill',
  'diamond',
  'cookie4',
  'cookie6',
  'cookie7',
  'cookie',
  'cookie12',
  'clover',
  'sunny',
  'burst8',
  'burst16',
  'flower6',
  'flower8',
  'flower10',
  'boom8',
  'boom12',
  'pebble',
  'puffy',
  'gem',
  'arch',
  'slanted',
  'heart',
  'egg',
  'star5',
  'star8',
  'notch',
  'wedge',
  'lens',
  'ticket',
  'octagon',
  'pixelCircle',
  'pixelBurst',
] as const

export type Md3eExpressiveShapeId = (typeof MD3E_ICON_SHAPE_IDS)[number]

export type Md3eTextShapeId = 'round' | 'soft' | 'pill'
export type Md3eShapeMode = 'fixed' | 'random'

export interface Md3eShapeSpec {
  id: Md3eExpressiveShapeId
  name: string
  nameEn: string
  svgPath: string
}

export interface Md3eTextShapeSpec {
  id: Md3eTextShapeId
  name: string
  nameEn: string
  radius: number
}

export const MD3E_SHAPE_ROLES = ['hero', 'device', 'control', 'icon', 'metric'] as const
export type Md3eShapeRole = (typeof MD3E_SHAPE_ROLES)[number]

export interface Md3eShapeRoleMeta {
  id: Md3eShapeRole
  name: string
  nameEn: string
  description: string
}

export const MD3E_SHAPE_ROLE_META: Record<Md3eShapeRole, Md3eShapeRoleMeta> = {
  hero: { id: 'hero', name: '主视觉', nameEn: 'Hero artwork', description: '截图球与权限主图形' },
  device: { id: 'device', name: '会话头像', nameEn: 'Session artwork', description: '本次会话与设备头像' },
  control: { id: 'control', name: '操作控件', nameEn: 'Controls', description: '主操作与组合控件' },
  icon: { id: 'icon', name: '图标', nameEn: 'Icon seats', description: '导航、标题栏与图标座' },
  metric: { id: 'metric', name: '指标', nameEn: 'Metrics', description: '指标卡与状态贴片' },
}

export type Md3eRoleShapes = Record<Md3eShapeRole, Md3eExpressiveShapeId>

export interface Md3eShapePreferences {
  mode: Md3eShapeMode
  preset: string
  shapes: Md3eRoleShapes
  text: Md3eTextShapeId
}

export interface Md3eShapeSession {
  seed: number
  mode: Md3eShapeMode
  preset: string
  shapes: Record<Md3eShapeRole, Md3eShapeSpec>
  text: Md3eTextShapeSpec
  randomized: boolean
}

export const SHAPE_POINT_COUNT = 72
const VIEWBOX_PADDING = 4
const SHAPE_SPAN = 100 - VIEWBOX_PADDING * 2

type Point = readonly [number, number]

function polarPoints(radiusAt: (angle: number) => number): Point[] {
  return Array.from({ length: SHAPE_POINT_COUNT }, (_, index) => {
    const angle = (index / SHAPE_POINT_COUNT) * Math.PI * 2 - Math.PI / 2
    const radius = radiusAt(angle)
    return [Math.cos(angle) * radius, Math.sin(angle) * radius] as Point
  })
}

function superellipsePoints(exponent: number, radius = 46): Point[] {
  return Array.from({ length: SHAPE_POINT_COUNT }, (_, index) => {
    const angle = (index / SHAPE_POINT_COUNT) * Math.PI * 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const power = 2 / exponent
    return [
      Math.sign(cos) * Math.abs(cos) ** power * radius,
      Math.sign(sin) * Math.abs(sin) ** power * radius,
    ] as Point
  })
}

function resamplePolyline(points: readonly Point[], count = SHAPE_POINT_COUNT): Point[] {
  const closed = [...points, points[0]]
  const arc: number[] = [0]
  for (let index = 1; index < closed.length; index += 1) {
    const dx = closed[index][0] - closed[index - 1][0]
    const dy = closed[index][1] - closed[index - 1][1]
    arc.push(arc[index - 1] + Math.hypot(dx, dy))
  }
  const total = arc[arc.length - 1]
  const result: Point[] = []
  for (let index = 0; index < count; index += 1) {
    const target = (index / count) * total
    let segment = 1
    while (segment < arc.length - 1 && arc[segment] < target) segment += 1
    const span = arc[segment] - arc[segment - 1]
    const t = span > 0 ? (target - arc[segment - 1]) / span : 0
    result.push([
      closed[segment - 1][0] + t * (closed[segment][0] - closed[segment - 1][0]),
      closed[segment - 1][1] + t * (closed[segment][1] - closed[segment - 1][1]),
    ])
  }
  return result
}

function archPoints(): Point[] {
  const outline: Point[] = [[10, 94], [10, 46]]
  for (let step = 1; step <= 18; step += 1) {
    const angle = Math.PI - (step / 18) * Math.PI
    outline.push([50 + Math.cos(angle) * 40, 46 - Math.sin(angle) * 40])
  }
  outline.push([90, 94], [10, 94])
  return resamplePolyline(outline)
}

function gemPoints(): Point[] {
  const outline: Point[] = [
    [50, 4],
    [72, 12],
    [93, 34],
    [80, 74],
    [50, 97],
    [20, 74],
    [7, 34],
    [28, 12],
  ]
  return resamplePolyline(outline)
}

function starPoints(vertices: number, innerScale = 0.58): Point[] {
  const outline: Point[] = []
  for (let index = 0; index < vertices * 2; index += 1) {
    const angle = -Math.PI / 2 + (index / (vertices * 2)) * Math.PI * 2
    const radius = index % 2 === 0 ? 46 : 46 * innerScale
    outline.push([50 + Math.cos(angle) * radius, 50 + Math.sin(angle) * radius])
  }
  return resamplePolyline(outline)
}

function lensPoints(): Point[] {
  const outline: Point[] = []
  const steps = 36
  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps
    outline.push([8 + 84 * t, 50 - 40 * Math.pow(Math.sin(Math.PI * t), 0.7)])
  }
  for (let index = 1; index < steps; index += 1) {
    const t = index / steps
    outline.push([8 + 84 * t, 50 + 40 * Math.pow(Math.sin(Math.PI * t), 0.7)])
  }
  return resamplePolyline(outline)
}

function heartPoints(): Point[] {
  const outline: Point[] = []
  for (let index = 0; index < 120; index += 1) {
    const t = (index / 120) * Math.PI * 2
    const x = 16 * Math.sin(t) ** 3
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    outline.push([50 + x * 2.5, 50 - y * 2.5])
  }
  return resamplePolyline(outline)
}

function pixelRingPoints(alternate: boolean): Point[] {
  const outline: Point[] = []
  const steps = 32
  for (let index = 0; index < steps; index += 1) {
    const angle = -Math.PI / 2 + (index / steps) * Math.PI * 2
    const radius = alternate && index % 2 === 1 ? 31 : 42
    const x = Math.round((50 + Math.cos(angle) * radius) / 7) * 7
    const y = Math.round((50 + Math.sin(angle) * radius) / 7) * 7
    outline.push([x, y])
  }
  return resamplePolyline(outline)
}

function normalizePoints(points: readonly Point[]): Point[] {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const [x, y] of points) {
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  const scale = SHAPE_SPAN / Math.max(maxX - minX, maxY - minY, 1)
  return points.map(([x, y]) => [
    50 + (x - centerX) * scale,
    50 + (y - centerY) * scale,
  ])
}

function toSvgPath(points: readonly Point[]): string {
  const format = (value: number) => Number(Math.min(100, Math.max(0, value)).toFixed(2))
  const count = points.length
  let path = `M${format(points[0][0])} ${format(points[0][1])}`
  for (let index = 0; index < count; index += 1) {
    const previous = points[(index - 1 + count) % count]
    const current = points[index]
    const next = points[(index + 1) % count]
    const following = points[(index + 2) % count]
    const control1X = current[0] + (next[0] - previous[0]) / 6
    const control1Y = current[1] + (next[1] - previous[1]) / 6
    const control2X = next[0] - (following[0] - current[0]) / 6
    const control2Y = next[1] - (following[1] - current[1]) / 6
    path += ` C${format(control1X)} ${format(control1Y)} ${format(control2X)} ${format(control2Y)} ${format(next[0])} ${format(next[1])}`
  }
  return `${path} Z`
}

interface ShapeDefinition {
  id: Md3eExpressiveShapeId
  name: string
  nameEn: string
  points: Point[]
}

const SHAPE_DEFINITIONS: readonly ShapeDefinition[] = [
  { id: 'circle', name: '圆形', nameEn: 'Circle', points: polarPoints(() => 46) },
  { id: 'squircle', name: '方圆', nameEn: 'Squircle', points: superellipsePoints(4.2) },
  {
    id: 'square',
    name: '方形',
    nameEn: 'Square',
    points: resamplePolyline([[8, 8], [92, 8], [92, 92], [8, 92]]),
  },
  {
    id: 'pill',
    name: '胶囊',
    nameEn: 'Pill',
    points: superellipsePoints(2.6).map(([x, y]) => [x * 1.35, y] as Point),
  },
  {
    id: 'diamond',
    name: '菱形',
    nameEn: 'Diamond',
    points: resamplePolyline([[50, 5], [93, 50], [50, 95], [7, 50]]),
  },
  { id: 'cookie4', name: '曲奇 4', nameEn: 'Cookie 4', points: polarPoints((angle) => 42 + 4.2 * Math.cos(4 * angle)) },
  { id: 'cookie6', name: '曲奇 6', nameEn: 'Cookie 6', points: polarPoints((angle) => 42 + 3.6 * Math.cos(6 * angle)) },
  { id: 'cookie7', name: '曲奇 7', nameEn: 'Cookie 7', points: polarPoints((angle) => 42 + 3.2 * Math.cos(7 * angle)) },
  { id: 'cookie', name: '曲奇 9', nameEn: 'Cookie 9', points: polarPoints((angle) => 42 + 4.2 * Math.cos(9 * angle)) },
  { id: 'cookie12', name: '曲奇 12', nameEn: 'Cookie 12', points: polarPoints((angle) => 42 + 2.8 * Math.cos(12 * angle)) },
  { id: 'clover', name: '四叶草', nameEn: 'Clover', points: polarPoints((angle) => 34 + 12 * Math.cos(4 * angle)) },
  { id: 'sunny', name: '旭日', nameEn: 'Sunny', points: polarPoints((angle) => 39 + 8 * Math.cos(12 * angle)) },
  { id: 'burst8', name: '爆裂 8', nameEn: 'Burst 8', points: polarPoints((angle) => 38 + 8 * Math.cos(8 * angle + 0.3)) },
  { id: 'burst16', name: '爆裂 16', nameEn: 'Burst 16', points: polarPoints((angle) => 39 + 6 * Math.cos(16 * angle)) },
  { id: 'flower6', name: '花形 6', nameEn: 'Flower 6', points: polarPoints((angle) => 36 + 10 * Math.cos(6 * angle + 0.2)) },
  { id: 'flower8', name: '花形 8', nameEn: 'Flower 8', points: polarPoints((angle) => 37 + 8.5 * Math.cos(8 * angle - 0.3)) },
  { id: 'flower10', name: '花形 10', nameEn: 'Flower 10', points: polarPoints((angle) => 38 + 7.5 * Math.cos(10 * angle + 0.4)) },
  {
    id: 'boom8',
    name: '轰鸣 8',
    nameEn: 'Boom 8',
    points: polarPoints((angle) => 40 + 5 * Math.cos(8 * angle) + 1.8 * Math.cos(16 * angle + 0.5)),
  },
  {
    id: 'boom12',
    name: '轰鸣 12',
    nameEn: 'Boom 12',
    points: polarPoints((angle) => 40 + 4.8 * Math.cos(12 * angle) + 1.5 * Math.cos(24 * angle)),
  },
  {
    id: 'pebble',
    name: '卵石',
    nameEn: 'Pebble',
    points: polarPoints((angle) => 42 + 3.5 * Math.sin(3 * angle + 0.8) + 2.4 * Math.cos(5 * angle - 0.5)),
  },
  {
    id: 'puffy',
    name: '蓬松',
    nameEn: 'Puffy',
    points: polarPoints((angle) => 41 + 4 * Math.cos(3 * angle + 0.4) + 2.5 * Math.sin(5 * angle)),
  },
  { id: 'gem', name: '宝石', nameEn: 'Gem', points: gemPoints() },
  { id: 'arch', name: '拱门', nameEn: 'Arch', points: archPoints() },
  {
    id: 'slanted',
    name: '斜切',
    nameEn: 'Slanted',
    points: resamplePolyline([[30, 8], [92, 8], [70, 92], [8, 92]]),
  },
  { id: 'heart', name: '心形', nameEn: 'Heart', points: heartPoints() },
  {
    id: 'egg',
    name: '蛋形',
    nameEn: 'Egg',
    points: polarPoints((angle) => 40 + 6 * Math.cos(angle) + 2 * Math.sin(2 * angle)),
  },
  { id: 'star5', name: '五角星', nameEn: 'Star 5', points: starPoints(5) },
  { id: 'star8', name: '八角星', nameEn: 'Star 8', points: starPoints(8, 0.62) },
  {
    id: 'notch',
    name: '缺角',
    nameEn: 'Notch',
    points: resamplePolyline([[8, 8], [72, 8], [92, 28], [92, 92], [8, 92]]),
  },
  {
    id: 'wedge',
    name: '楔形',
    nameEn: 'Wedge',
    points: resamplePolyline([[50, 6], [94, 88], [6, 88]]),
  },
  { id: 'lens', name: '透镜', nameEn: 'Lens', points: lensPoints() },
  {
    id: 'ticket',
    name: '票券',
    nameEn: 'Ticket',
    points: resamplePolyline([
      [8, 26], [28, 26], [34, 14], [66, 14], [72, 26], [92, 26],
      [92, 74], [72, 74], [66, 86], [34, 86], [28, 74], [8, 74],
    ]),
  },
  {
    id: 'octagon',
    name: '八边形',
    nameEn: 'Octagon',
    points: resamplePolyline([[30, 8], [70, 8], [92, 30], [92, 70], [70, 92], [30, 92], [8, 70], [8, 30]]),
  },
  { id: 'pixelCircle', name: '像素圆', nameEn: 'Pixel circle', points: pixelRingPoints(false) },
  { id: 'pixelBurst', name: '像素爆裂', nameEn: 'Pixel burst', points: pixelRingPoints(true) },
]

export const MD3E_ICON_SHAPES: readonly Md3eShapeSpec[] = SHAPE_DEFINITIONS.map((shape) => ({
  id: shape.id,
  name: shape.name,
  nameEn: shape.nameEn,
  svgPath: toSvgPath(normalizePoints(shape.points)),
}))

export const MD3E_TEXT_SHAPES: readonly Md3eTextShapeSpec[] = [
  { id: 'round', name: '圆角', nameEn: 'Round', radius: 12 },
  { id: 'soft', name: '柔和', nameEn: 'Soft', radius: 26 },
  { id: 'pill', name: '胶囊', nameEn: 'Pill', radius: 999 },
]

export const DEFAULT_ROLE_SHAPES: Md3eRoleShapes = {
  hero: 'pebble',
  device: 'clover',
  control: 'cookie',
  icon: 'squircle',
  metric: 'cookie6',
}

export interface Md3eShapePreset {
  id: string
  name: string
  nameEn: string
  shapes: Md3eRoleShapes
  text: Md3eTextShapeId
}

export const MD3E_SHAPE_PRESETS: readonly Md3eShapePreset[] = [
  { id: 'default', name: '默认', nameEn: 'Default', shapes: { ...DEFAULT_ROLE_SHAPES }, text: 'soft' },
  {
    id: 'friendly',
    name: '友好',
    nameEn: 'Friendly',
    shapes: { hero: 'heart', device: 'flower6', control: 'cookie4', icon: 'puffy', metric: 'star5' },
    text: 'soft',
  },
  {
    id: 'cheerful',
    name: '明快',
    nameEn: 'Cheerful',
    shapes: { hero: 'sunny', device: 'burst8', control: 'star5', icon: 'flower8', metric: 'burst16' },
    text: 'pill',
  },
  {
    id: 'modern',
    name: '现代',
    nameEn: 'Modern',
    shapes: { hero: 'gem', device: 'lens', control: 'arch', icon: 'square', metric: 'octagon' },
    text: 'round',
  },
  {
    id: 'organic',
    name: '自然',
    nameEn: 'Organic',
    shapes: { hero: 'pebble', device: 'cookie', control: 'clover', icon: 'cookie6', metric: 'puffy' },
    text: 'soft',
  },
  {
    id: 'geometric',
    name: '几何',
    nameEn: 'Geometric',
    shapes: { hero: 'diamond', device: 'octagon', control: 'wedge', icon: 'gem', metric: 'lens' },
    text: 'round',
  },
]

const PRESET_MAP = new Map(MD3E_SHAPE_PRESETS.map((preset) => [preset.id, preset]))
const ICON_SHAPE_MAP = new Map(MD3E_ICON_SHAPES.map((shape) => [shape.id, shape]))
const TEXT_SHAPE_MAP = new Map(MD3E_TEXT_SHAPES.map((shape) => [shape.id, shape]))

export const DEFAULT_SHAPE_PREFERENCES: Md3eShapePreferences = {
  mode: 'random',
  preset: 'custom',
  shapes: { ...DEFAULT_ROLE_SHAPES },
  text: 'soft',
}

export function getShapePreset(id: string): Md3eShapePreset | undefined {
  return PRESET_MAP.get(id)
}

export function sessionRoleShapeIds(session: Md3eShapeSession): Md3eRoleShapes {
  const shapes = {} as Md3eRoleShapes
  for (const role of MD3E_SHAPE_ROLES) shapes[role] = session.shapes[role].id
  return shapes
}

export function isMd3eExpressiveShapeId(value: unknown): value is Md3eExpressiveShapeId {
  return typeof value === 'string' && ICON_SHAPE_MAP.has(value as Md3eExpressiveShapeId)
}

export function isMd3eTextShapeId(value: unknown): value is Md3eTextShapeId {
  return typeof value === 'string' && TEXT_SHAPE_MAP.has(value as Md3eTextShapeId)
}

export function getIconShape(id: Md3eExpressiveShapeId): Md3eShapeSpec {
  return ICON_SHAPE_MAP.get(id) || MD3E_ICON_SHAPES[0]
}

export function getTextShape(id: Md3eTextShapeId): Md3eTextShapeSpec {
  return TEXT_SHAPE_MAP.get(id) || MD3E_TEXT_SHAPES[MD3E_TEXT_SHAPES.length - 1]
}

export function normalizeShapePreferences(value: unknown): Md3eShapePreferences {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const source =
    record.shapes && typeof record.shapes === 'object'
      ? (record.shapes as Record<string, unknown>)
      : {}
  const legacy = isMd3eExpressiveShapeId(record.icon) ? record.icon : undefined
  const shapes = {} as Md3eRoleShapes
  for (const role of MD3E_SHAPE_ROLES) {
    const candidate = source[role] ?? legacy
    shapes[role] = isMd3eExpressiveShapeId(candidate)
      ? candidate
      : DEFAULT_SHAPE_PREFERENCES.shapes[role]
  }
  return {
    mode: record.mode === 'fixed' ? 'fixed' : 'random',
    preset: typeof record.preset === 'string' ? record.preset : 'custom',
    shapes,
    text: isMd3eTextShapeId(record.text) ? record.text : DEFAULT_SHAPE_PREFERENCES.text,
  }
}

export function createShapeSeed(): number {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const buffer = new Uint32Array(1)
    crypto.getRandomValues(buffer)
    return buffer[0]
  }
  return (Math.random() * 0x100000000) >>> 0
}

/** Mulberry32：小而稳定的种子 PRNG，保证同一次启动得到同一组形状。 */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 0x100000000
  }
}

export function createShapeSession(
  preferences: Md3eShapePreferences,
  seed: number = createShapeSeed()
): Md3eShapeSession {
  const normalized = normalizeShapePreferences(preferences)
  if (normalized.mode === 'fixed') {
    const shapes = {} as Record<Md3eShapeRole, Md3eShapeSpec>
    for (const role of MD3E_SHAPE_ROLES) shapes[role] = getIconShape(normalized.shapes[role])
    return {
      seed,
      mode: 'fixed',
      preset: normalized.preset,
      shapes,
      text: getTextShape(normalized.text),
      randomized: false,
    }
  }

  const random = seededRandom(seed)
  const pool = [...MD3E_ICON_SHAPES]
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1))
    ;[pool[index], pool[swap]] = [pool[swap], pool[index]]
  }
  const shapes = {} as Record<Md3eShapeRole, Md3eShapeSpec>
  MD3E_SHAPE_ROLES.forEach((role, index) => {
    shapes[role] = pool[index % pool.length]
  })
  const text = MD3E_TEXT_SHAPES[Math.floor(random() * MD3E_TEXT_SHAPES.length)]
  return { seed, mode: 'random', preset: 'custom', shapes, text, randomized: true }
}

/** 兼容旧 API：返回固定形状规格。 */
export type Md3eExpressiveShapeSpec = Md3eShapeSpec
export const MD3E_EXPRESSIVE_SHAPES = MD3E_ICON_SHAPES

export function getShapeSpec(id: Md3eExpressiveShapeId): Md3eShapeSpec {
  return getIconShape(id)
}

export function getSvgClipPath(id: Md3eExpressiveShapeId): string {
  return `path("${getIconShape(id).svgPath}")`
}

const PATH_NUMBER = /-?\d+(?:\.\d+)?/g
const PATH_FORMAT = (value: number) => Number(Math.min(100, Math.max(0, value)).toFixed(2))

/** 同构路径插值：所有目录形状共享 M + 72×C 结构，可直接对坐标做连续形变。 */
export function blendShapePaths(from: string, to: string, progress: number): string {
  const start = (from.match(PATH_NUMBER) || []).map(Number)
  const end = (to.match(PATH_NUMBER) || []).map(Number)
  if (start.length !== end.length || start.length < 8) return progress < 0.5 ? from : to
  const t = Math.min(1, Math.max(0, progress))
  const values = start.map((value, index) => value + (end[index] - value) * t)
  let path = `M${PATH_FORMAT(values[0])} ${PATH_FORMAT(values[1])}`
  for (let index = 2; index + 5 < values.length; index += 6) {
    path += ` C${PATH_FORMAT(values[index])} ${PATH_FORMAT(values[index + 1])} ${PATH_FORMAT(values[index + 2])} ${PATH_FORMAT(values[index + 3])} ${PATH_FORMAT(values[index + 4])} ${PATH_FORMAT(values[index + 5])}`
  }
  return `${path} Z`
}

export function getPressedShape(id: Md3eExpressiveShapeId): Md3eShapeSpec {
  return getIconShape(id === 'circle' ? 'squircle' : 'circle')
}
