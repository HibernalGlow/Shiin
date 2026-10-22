/**
 * Shiin Capture Sessions & Timeline Clustering Engine
 *
 * Automatically clusters consecutive captures within a temporal window into a
 * cohesive "Capture Session", allowing users to review "what I was just doing"
 * as a single contextual activity block.
 */

import type { InboxItem } from './inbox.js'

export interface CaptureSession {
  id: string
  startTime: number
  endTime: number
  durationMs: number
  primaryAppName: string
  profileId: string
  items: InboxItem[]
  count: number
  uniqueApps: string[]
  summaryZh: string
  summaryEn: string
}

const DEFAULT_SESSION_GAP_MS = 3 * 60 * 1000 // 3 minutes

/**
 * 将平铺的时间线截图列表按时间窗口与上下文聚类为会话 (Capture Sessions)
 *
 * @param items 截图条目列表（无需预先排序，内部自动按时间正序聚类）
 * @param maxGapMs 判定为同一次会话的最大时间间隔，默认 180 秒
 */
export function clusterIntoSessions(
  items: InboxItem[],
  maxGapMs = DEFAULT_SESSION_GAP_MS
): CaptureSession[] {
  if (!items || items.length === 0) return []

  // 按时间升序排序聚类
  const sorted = [...items].sort((a, b) => a.timestamp - b.timestamp)
  const sessions: CaptureSession[] = []

  let currentCluster: InboxItem[] = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const curr = sorted[i]
    const gap = curr.timestamp - prev.timestamp

    if (gap <= maxGapMs) {
      currentCluster.push(curr)
    } else {
      sessions.push(finalizeSession(currentCluster))
      currentCluster = [curr]
    }
  }

  if (currentCluster.length > 0) {
    sessions.push(finalizeSession(currentCluster))
  }

  // 返回时按最近时间倒序排列（最新会话在最前）
  return sessions.sort((a, b) => b.endTime - a.endTime)
}

function finalizeSession(cluster: InboxItem[]): CaptureSession {
  const startTime = cluster[0].timestamp
  const endTime = cluster[cluster.length - 1].timestamp
  const durationMs = Math.max(0, endTime - startTime)
  const count = cluster.length

  // 统计出现频率最高的 App 作为主要应用
  const appCounts = new Map<string, number>()
  for (const it of cluster) {
    const app = it.appName || 'Unknown'
    appCounts.set(app, (appCounts.get(app) || 0) + 1)
  }

  let primaryAppName = 'Desktop'
  let maxCount = 0
  for (const [app, c] of appCounts.entries()) {
    if (c > maxCount) {
      maxCount = c
      primaryAppName = app
    }
  }

  const uniqueApps = Array.from(appCounts.keys())
  const profileId = cluster[0].profileId || 'general'

  const durationSec = Math.round(durationMs / 1000)
  const durationDescZh =
    durationSec < 60
      ? `${durationSec} 秒内`
      : `${Math.round(durationSec / 60)} 分钟内`
  const durationDescEn =
    durationSec < 60
      ? `in ${durationSec}s`
      : `in ${Math.round(durationSec / 60)}m`

  const appSummary =
    uniqueApps.length > 1
      ? `${primaryAppName} 等 ${uniqueApps.length} 个应用`
      : primaryAppName

  const summaryZh = `${durationDescZh}截取 ${count} 张 · ${appSummary}`
  const summaryEn = `${count} captures ${durationDescEn} · ${appSummary}`

  return {
    id: `sess_${startTime}_${cluster.length}`,
    startTime,
    endTime,
    durationMs,
    primaryAppName,
    profileId,
    // 会话内部的条目倒序排列（最新一张在左侧）
    items: [...cluster].sort((a, b) => b.timestamp - a.timestamp),
    count,
    uniqueApps,
    summaryZh,
    summaryEn,
  }
}
