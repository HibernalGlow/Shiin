/**
 * 全局安装后的路径口径。
 *
 * `getDefaultConfigDir()` / `resolveScreenshotSaveDir()` 的历史行为是"cwd 可写就落在 cwd"，
 * 这对仓库内的开发和桌面端是对的；但 `shiin` 装到 PATH 以后，使用者在任何目录敲一条命令
 * 都会在当前目录生成 `config/` 与 `screenshots/`——那是副作用，不是功能。
 *
 * 所以 CLI 进来先判一次"这是不是本仓工作区"：
 * - 是（`package.json` 的 name 对得上）⇒ 保持 `cwd/config`、`cwd/screenshots`，开发时行为不变；
 * - 否 ⇒ 配置落到 `~/Library/Application Support/Shiin`（或 `~/.config/shiin`），
 *   截图落到 `~/Pictures/Shiin`，与桌面端打包后的位置一致。
 *
 * `SHIIN_CONFIG_DIR` / `SHIIN_SCREENSHOT_DIR` 可以显式覆盖两者。
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { getDefaultConfigDir, resolveScreenshotSaveDir } from '../../core/index.js'

const WORKSPACE_PACKAGE_NAME = '@hibernalglow/xaihi-shiin'

export interface CliPaths {
  configDir: string
  screenshotDir: string
  /** 当前目录是不是本仓工作区（决定用 cwd 还是用户目录）。 */
  workspace: boolean
}

export function isShiinWorkspace(cwd = process.cwd()): boolean {
  try {
    const raw = fs.readFileSync(path.join(cwd, 'package.json'), 'utf8')
    const pkg = JSON.parse(raw) as { name?: string }
    return pkg.name === WORKSPACE_PACKAGE_NAME
  } catch {
    return false
  }
}

function expandHome(value: string): string {
  if (value === '~') return os.homedir()
  if (value.startsWith('~/') || value.startsWith('~\\')) return path.join(os.homedir(), value.slice(2))
  return value
}

export function resolveCliPaths(env: Record<string, string | undefined> = process.env): CliPaths {
  const workspace = isShiinWorkspace()
  const configOverride = env.SHIIN_CONFIG_DIR?.trim()
  const screenshotOverride = env.SHIIN_SCREENSHOT_DIR?.trim()

  const configDir = configOverride
    ? path.resolve(expandHome(configOverride))
    : getDefaultConfigDir(workspace)

  const screenshotDir = screenshotOverride
    ? resolveScreenshotSaveDir(path.resolve(expandHome(screenshotOverride)), workspace)
    : resolveScreenshotSaveDir('', workspace)

  return { configDir, screenshotDir, workspace }
}
