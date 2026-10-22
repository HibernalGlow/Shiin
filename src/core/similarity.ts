/**
 * Shiin Perceptual Similarity & Duplicate Detection Engine
 *
 * Implements 64-bit difference hash (dHash) & perceptual hash distance calculations,
 * shot clustering, and non-destructive similarity grouping.
 */

import type { InboxItem } from './inbox.js'

export interface SimilarShotGroup {
  groupId: string
  items: InboxItem[]
  representativeId: string // 系统推荐保留的代表版本 (如分辨率最高或原图)
  similarityScore: number // 0.0 ~ 1.0
  reasonZh: string
  reasonEn: string
}

/**
 * 计算两个十六进制或二进制哈希字符串之间的汉明距离 (Hamming Distance)
 */
export function hammingDistance(hashA: string, hashB: string): number {
  if (!hashA || !hashB || hashA.length !== hashB.length) {
    return 64 // 极大距离
  }

  // 如果已经是 0/1 二进制串
  if (/^[01]+$/.test(hashA) && /^[01]+$/.test(hashB)) {
    let dist = 0
    for (let i = 0; i < hashA.length; i++) {
      if (hashA[i] !== hashB[i]) dist++
    }
    return dist
  }

  // 16 进制字符串逐字符对比
  let distance = 0
  for (let i = 0; i < hashA.length; i++) {
    const valA = parseInt(hashA[i], 16)
    const valB = parseInt(hashB[i], 16)
    let xor = valA ^ valB
    while (xor > 0) {
      distance += xor & 1
      xor >>= 1
    }
  }

  return distance
}

/**
 * 将汉明距离转换为 0.0 ~ 1.0 的百分比相似度
 */
export function calculateSimilarityScore(hashA: string, hashB: string): number {
  const dist = hammingDistance(hashA, hashB)
  const bitLength = hashA.length * 4 // 每 16 进制字符代表 4 bits
  return Math.max(0, Math.min(1, 1 - dist / bitLength))
}

/**
 * 针对收件箱条目进行相似图片聚类
 *
 * @param items 含有 pHash 的条目列表
 * @param maxHammingDistance 判定为近似图片的最大汉明距离（默认 6，对应相似度 > 90%）
 */
export function findSimilarGroups(
  items: InboxItem[],
  maxHammingDistance = 6
): SimilarShotGroup[] {
  const validItems = items.filter((it) => it.pHash && it.pHash.length >= 8)
  const visited = new Set<string>()
  const groups: SimilarShotGroup[] = []

  for (let i = 0; i < validItems.length; i++) {
    const itemA = validItems[i]
    if (visited.has(itemA.id)) continue

    const cluster: InboxItem[] = [itemA]
    let totalScore = 1.0
    let comparisons = 0

    for (let j = i + 1; j < validItems.length; j++) {
      const itemB = validItems[j]
      if (visited.has(itemB.id)) continue

      const dist = hammingDistance(itemA.pHash!, itemB.pHash!)
      if (dist <= maxHammingDistance) {
        cluster.push(itemB)
        visited.add(itemB.id)
        totalScore += calculateSimilarityScore(itemA.pHash!, itemB.pHash!)
        comparisons++
      }
    }

    if (cluster.length > 1) {
      visited.add(itemA.id)

      // 评估推荐代表版本：优先分辨率最大，其次文件最大
      const best = [...cluster].sort((a, b) => {
        const areaA = (a.width || 0) * (a.height || 0)
        const areaB = (b.width || 0) * (b.height || 0)
        if (areaB !== areaA) return areaB - areaA
        return (b.sizeBytes || 0) - (a.sizeBytes || 0)
      })[0]

      const avgScore = comparisons > 0 ? totalScore / (comparisons + 1) : 1.0
      const scorePct = Math.round(avgScore * 100)

      groups.push({
        groupId: `sim_${itemA.id}`,
        items: cluster,
        representativeId: best.id,
        similarityScore: avgScore,
        reasonZh: `检测到 ${cluster.length} 张高度近似画面（相似度约 ${scorePct}%），建议保留最高画质版本`,
        reasonEn: `Detected ${cluster.length} visually similar shots (${scorePct}% match), recommend preserving the highest quality version`,
      })
    }
  }

  return groups
}
