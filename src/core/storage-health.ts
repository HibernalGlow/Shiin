/**
 * Shiin Multi-Vault Storage Health Engine
 *
 * Manages multiple storage targets (internal drive, external SSD, network shares),
 * detects offline state vs deletion to prevent phantom cache purging,
 * and monitors disk space warnings.
 */

import fs from 'node:fs'
import path from 'node:path'

export type VaultStatus = 'online' | 'offline' | 'warning' | 'error'

export interface StorageVault {
  id: string
  name: string
  path: string
  isPrimary?: boolean
  isReadOnly?: boolean
  status: VaultStatus
  lastCheckedAt: number
  freeSpaceBytes?: number
  totalSpaceBytes?: number
  errorMessage?: string
}

export interface VaultHealthReport {
  vaultId: string
  status: VaultStatus
  accessible: boolean
  writable: boolean
  isOffline: boolean
  freeSpaceBytes?: number
  messageZh: string
  messageEn: string
}

/**
 * 探测单个存储库的健康状态
 */
export async function checkVaultHealth(vault: StorageVault): Promise<VaultHealthReport> {
  const targetPath = vault.path

  // 1. 检查物理目录是否存在
  if (!fs.existsSync(targetPath)) {
    return {
      vaultId: vault.id,
      status: 'offline',
      accessible: false,
      writable: false,
      isOffline: true,
      messageZh: '存储位置离线或未挂载，已保护现有索引不被清除',
      messageEn: 'Storage location offline or unmounted; cache indexing preserved',
    }
  }

  // 2. 检查读写权限
  let writable = false
  const probeFile = path.join(targetPath, `.shiin_health_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`)

  try {
    if (!vault.isReadOnly) {
      await fs.promises.writeFile(probeFile, 'ok', 'utf-8')
      writable = true
      await fs.promises.unlink(probeFile)
    }
  } catch {
    writable = false
  }

  // 3. 磁盘空间检查 (Node 18+ statfs)
  let freeSpace: number | undefined
  let spaceWarning = false

  try {
    if (typeof (fs.promises as any).statfs === 'function') {
      const stats = await (fs.promises as any).statfs(targetPath)
      freeSpace = stats.bavail * stats.bsize
      // 若剩余空间小于 1GB (1073741824 bytes) 则发出空间警报
      if (freeSpace < 1073741824) {
        spaceWarning = true
      }
    }
  } catch {
    // 忽略 statfs 平台差异
  }

  if (spaceWarning) {
    return {
      vaultId: vault.id,
      status: 'warning',
      accessible: true,
      writable,
      isOffline: false,
      freeSpaceBytes: freeSpace,
      messageZh: '存储磁盘剩余空间不足 1 GB，请及时清理',
      messageEn: 'Low disk space warning: less than 1 GB remaining',
    }
  }

  if (!writable && !vault.isReadOnly) {
    return {
      vaultId: vault.id,
      status: 'warning',
      accessible: true,
      writable: false,
      isOffline: false,
      freeSpaceBytes: freeSpace,
      messageZh: '存储目录可读但不可写（写保护）',
      messageEn: 'Storage directory is readable but write-protected',
    }
  }

  return {
    vaultId: vault.id,
    status: 'online',
    accessible: true,
    writable: writable || Boolean(vault.isReadOnly),
    isOffline: false,
    freeSpaceBytes: freeSpace,
    messageZh: '存储状态正常，读写就绪',
    messageEn: 'Storage health OK, read/write ready',
  }
}
