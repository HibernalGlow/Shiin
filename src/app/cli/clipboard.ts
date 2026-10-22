/**
 * 命令行下的图片剪贴板写入。
 *
 * 核心层只接受一个 `writeClipboard` 回调（桌面端由 Electron 注入），CLI 没有那个注入点，
 * 所以这里用系统自带工具补一条最小通路：失败就返回 false，由上层的文案把它说出来，
 * 而不是假装写进去了。
 */

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { ImageFormat } from '../../core/types.js'

function run(command: string, args: string[]): boolean {
  try {
    const result = spawnSync(command, args, { stdio: 'ignore' })
    return result.status === 0
  } catch {
    return false
  }
}

export function clipboardImageSupported(): boolean {
  if (process.platform === 'darwin') return true
  if (process.platform === 'win32') return true
  if (process.platform === 'linux') return run('sh', ['-c', 'command -v xclip || command -v wl-copy'])
  return false
}

/** 把一张图片写进系统剪贴板；返回是否成功。 */
export function writeImageToClipboard(buffer: Buffer, format: ImageFormat | string): boolean {
  // 检查 buffer 魔数：如果实际数据是 PNG（例如核心层对 WebP/AVIF 输出做了剪贴板解耦），直接按 PNG 处理
  const isActuallyPng =
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47

  const effectiveFormat = isActuallyPng ? 'png' : format
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'shiin-clip-'))
  const source = path.join(tempDir, `capture.${effectiveFormat}`)
  fs.writeFileSync(source, buffer)

  try {
    if (process.platform === 'darwin') {
      // AppleScript 只认 PNG；JPEG 先让 sips 转一份。
      const png = effectiveFormat === 'png' ? source : path.join(tempDir, 'capture.png')
      if (effectiveFormat !== 'png' && !run('sips', ['-s', 'format', 'png', source, '--out', png])) return false
      const script = `set the clipboard to (read (POSIX file "${png}") as «class PNGf»)`
      return run('osascript', ['-e', script])
    }
    if (process.platform === 'win32') {
      const script = [
        'Add-Type -AssemblyName System.Windows.Forms;',
        'Add-Type -AssemblyName System.Drawing;',
        `$img=[System.Drawing.Image]::FromFile('${source.replace(/'/g, "''")}');`,
        '[System.Windows.Forms.Clipboard]::SetImage($img);',
        '$img.Dispose();',
      ].join(' ')
      return run('powershell', ['-NoProfile', '-STA', '-Command', script])
    }
    if (process.platform === 'linux') {
      const mime = effectiveFormat === 'png' ? 'image/png' : 'image/jpeg'
      if (run('xclip', ['-selection', 'clipboard', '-t', mime, '-i', source])) return true
      try {
        return spawnSync('wl-copy', ['--type', mime], { input: fs.readFileSync(source) }).status === 0
      } catch {
        return false
      }
    }
    return false
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
}

/** 给核心层用的回调：成功返回 void，失败抛出可读错误（核心只做 warn，不会中断截图）。 */
export function createClipboardWriter(format: ImageFormat | string): (buffer: Buffer) => void {
  return (buffer: Buffer) => {
    if (!writeImageToClipboard(buffer, format)) {
      throw new Error('clipboard tool unavailable')
    }
  }
}
