/**
 * Material 3 Expressive (MD3E) 表达性几何形状系统
 * 严格遵循 Xaihi ADR-0033 与 md3eShapeSystem 规范
 */

export type Md3eExpressiveShapeId =
  | 'circle'
  | 'squircle'
  | 'rounded'
  | 'flower-8'
  | 'cookie-6'
  | 'cookie-8'
  | 'cookie-12'
  | 'sunny-10'
  | 'clover-4'
  | 'gem'
  | 'pentagon'
  | 'arch'
  | 'hexagon'
  | 'shield'
  | 'pebble'
  | 'capsule'

export interface Md3eExpressiveShapeSpec {
  id: Md3eExpressiveShapeId
  name: string
  svgPath: string
}

function generatePolarPetalPath(petals: number, rMin: number, rMax: number): string {
  const points: [number, number][] = []
  const steps = petals * 6
  for (let i = 0; i < steps; i++) {
    const theta = (i / steps) * 2 * Math.PI - Math.PI / 2
    const r = rMin + (rMax - rMin) * (0.5 + 0.5 * Math.cos(petals * theta))
    const x = Math.round((50 + r * Math.cos(theta)) * 100) / 100
    const y = Math.round((50 + r * Math.sin(theta)) * 100) / 100
    points.push([x, y])
  }
  return `M ${points[0][0]} ${points[0][1]} ` + points.slice(1).map(([x, y]) => `L ${x} ${y}`).join(' ') + ' Z'
}

export const MD3E_EXPRESSIVE_SHAPES: readonly Md3eExpressiveShapeSpec[] = [
  {
    id: 'circle',
    name: '经典圆',
    svgPath: 'M 50, 0 A 50, 50 0 1, 0 50, 100 A 50, 50 0 1, 0 50, 0 Z',
  },
  {
    id: 'squircle',
    name: '方圆',
    svgPath: 'M 50 2 C 78 2 98 22 98 50 C 98 78 78 98 50 98 C 22 98 2 78 2 50 C 2 22 22 2 50 2 Z',
  },
  {
    id: 'flower-8',
    name: '八瓣波纹',
    svgPath: generatePolarPetalPath(8, 38, 48),
  },
  {
    id: 'cookie-6',
    name: '六瓣曲奇',
    svgPath: generatePolarPetalPath(6, 36, 48),
  },
  {
    id: 'cookie-8',
    name: '八瓣曲奇',
    svgPath: generatePolarPetalPath(8, 36, 48),
  },
  {
    id: 'sunny-10',
    name: '太阳芒',
    svgPath:
      'M 50 20.24 L 53.59 15.87 L 59.03 7.51 L 64.83 4.35 L 67.67 10.32 L 67.16 20.28 L 67.49 25.92 L 72.96 24.5 L 82.28 20.93 L 88.83 21.79 L 87.62 28.28 L 81.35 36.04 L 78.3 40.8 L 83.57 42.86 L 93.2 45.46 L 98 50 L 93.2 54.54 L 83.57 57.14 L 78.3 59.2 L 81.35 63.96 L 87.62 71.72 L 88.83 78.21 L 82.28 79.07 L 72.96 75.5 L 67.49 74.08 L 67.16 79.72 L 67.67 89.68 L 64.83 95.65 L 59.03 92.49 L 53.59 84.13 L 50 79.76 L 46.41 84.13 L 40.97 92.49 L 35.17 95.65 L 32.33 89.68 L 32.84 79.72 L 32.51 74.08 L 27.04 75.5 L 17.72 79.07 L 11.17 78.21 L 12.38 71.72 L 18.65 63.96 L 21.7 59.2 L 16.43 57.14 L 6.8 54.54 L 2 50 L 6.8 45.46 L 16.43 42.86 L 21.7 40.8 L 18.65 36.04 L 12.38 28.28 L 11.17 21.79 L 17.72 20.93 L 27.04 24.5 L 32.51 25.92 L 32.84 20.28 L 32.33 10.32 L 35.17 4.35 L 40.97 7.51 L 46.41 15.87 Z',
  },
  {
    id: 'clover-4',
    name: '幸运四叶草',
    svgPath:
      'M 50 14.48 L 53.98 12.09 L 58.44 10.29 L 63.24 9.24 L 68.22 9.08 L 73.16 9.88 L 77.85 11.66 L 82.07 14.38 L 85.62 17.93 L 88.34 22.15 L 90.12 26.84 L 90.92 31.78 L 90.76 36.76 L 89.71 41.56 L 87.91 46.02 L 85.52 50 L 87.91 53.98 L 89.71 58.44 L 90.76 63.24 L 90.92 68.22 L 90.12 73.16 L 88.34 77.85 L 85.62 82.07 L 82.07 85.62 L 77.85 88.34 L 73.16 90.12 L 68.22 90.92 L 63.24 90.76 L 58.44 89.71 L 53.98 87.91 L 50 85.52 L 46.02 87.91 L 41.56 89.71 L 36.76 90.76 L 31.78 90.92 L 26.84 90.12 L 22.15 88.34 L 17.93 85.62 L 14.38 82.07 L 11.66 77.85 L 9.88 73.16 L 9.08 68.22 L 9.24 63.24 L 10.29 58.44 L 12.09 53.98 L 14.48 50 L 12.09 46.02 L 10.29 41.56 L 9.24 36.76 L 9.08 31.78 L 9.88 26.84 L 11.66 22.15 L 14.38 17.93 L 17.93 14.38 L 22.15 11.66 L 26.84 9.88 L 31.78 9.08 L 36.76 9.24 L 41.56 10.29 L 46.02 12.09 Z',
  },
  {
    id: 'gem',
    name: '多面宝石',
    svgPath: 'M 25 6 L 75 6 L 96 50 L 50 96 L 4 50 Z',
  },
  {
    id: 'shield',
    name: '守护盾徽',
    svgPath: 'M 12 12 L 88 12 L 88 56 C 88 78 50 94 50 94 C 50 94 12 78 12 56 Z',
  },
  {
    id: 'rounded',
    name: '圆角方块',
    svgPath:
      'M 24 6 L 76 6 C 88 6 94 12 94 24 L 94 76 C 94 88 88 94 76 94 L 24 94 C 12 94 6 88 6 76 L 6 24 C 6 12 12 6 24 6 Z',
  },
  {
    id: 'capsule',
    name: '胶囊药丸',
    svgPath: 'M 25 0 L 75 0 A 25 25 0 0 1 75 100 L 25 100 A 25 25 0 0 1 25 0 Z',
  },
]

export function getShapeSpec(id: Md3eExpressiveShapeId): Md3eExpressiveShapeSpec {
  return MD3E_EXPRESSIVE_SHAPES.find((s) => s.id === id) || MD3E_EXPRESSIVE_SHAPES[0]
}

/**
 * 将 0..100 坐标系的 SVG Path 转换为 CSS clip-path 语法 (path(...))
 * 或者直接以内联 SVG 剪裁路径渲染
 */
export function getSvgClipPath(id: Md3eExpressiveShapeId): string {
  const spec = getShapeSpec(id)
  return `path("${spec.svgPath}")`
}
