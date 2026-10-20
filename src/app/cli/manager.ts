/**
 * Node 宿主共用的 ScreenshotManager 初始化。
 *
 * TUI、pipe、serve 三个入口拿到的是同一份配置目录、同一个 preferCwd 口径、
 * 同一套"先认第一只手柄"的行为——差别只在后面怎么驱动它。
 */

import path from 'node:path'

import { FileConfigStorage, ScreenshotManager } from '../../core/index.js'
import { resolveCliPaths } from './paths.js'

export async function createManager(): Promise<ScreenshotManager> {
  const paths = resolveCliPaths()
  const manager = new ScreenshotManager(new FileConfigStorage(path.join(paths.configDir, 'localStorage.json')))
  // preferCwd 只给工作区：全局安装后从任意目录调用，默认目录不该落在使用者的 cwd 里。
  await manager.init(undefined, { preferCwd: paths.workspace })
  // 环境变量是"显式覆盖"，压过配置文件里的值（脚本/多账号场景靠它隔离）。
  if (process.env.SHIIN_SCREENSHOT_DIR?.trim()) manager.config.path = paths.screenshotDir
  // 组合键按设备存；先把第一只手柄认下来，否则读不到也写不回去。
  const device = manager.gamepad.getConnectedDevices()[0]
  if (device?.name) await manager.bindDevice(device.name)
  return manager
}
