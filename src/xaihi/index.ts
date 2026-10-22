import { createRequire } from 'node:module'
import Schema from '@deepseek-ai/schemastery'
import { defineNode, type NodeHandlers } from './sdk/index.js'
import { ScreenshotManager, ScreenShotWayEnum, CaptureTargetTypeEnum, ScreenShotSaveWayEnum, type ImageFormat } from '../core/index.js'

export const name = '@hibernalglow/xaihi-shiin'

export const inject = ['commands']

export interface Config {
  screenshotPath: string
  imageFormat: ImageFormat
  imageQuality: number
  imageLossless: boolean
  obsIp: string
  obsPort: number
  obsPassword: string
  saveReplayOnLongPress: boolean
}

export const Config = Schema.object({
  screenshotPath: Schema.string().default('').description('默认截图保存目录（留空则保存在运行目录下的 screenshots 文件夹）'),
  imageFormat: Schema.union(['jpg', 'png', 'webp', 'avif']).default('jpg').description('图片格式 (jpg, png, webp, avif)'),
  imageQuality: Schema.number().min(1).max(100).default(90).description('图片编码质量 (1-100)'),
  imageLossless: Schema.boolean().default(false).description('是否开启无损编码 (适用于 WebP / AVIF)'),
  obsIp: Schema.string().default('127.0.0.1').description('OBS WebSocket 服务器 IP'),
  obsPort: Schema.number().default(4455).description('OBS WebSocket 服务器端口'),
  obsPassword: Schema.string().role('secret').default('').description('OBS WebSocket 访问密码'),
  saveReplayOnLongPress: Schema.boolean().default(false).description('长按手柄组合键是否触发 OBS 保存即时回放缓存'),
})

function ownNodeDefinition(): unknown {
  const require = createRequire(import.meta.url)
  const candidates = ['../package.json', '../../package.json', './package.json']
  for (const p of candidates) {
    try {
      const pkg = require(p) as { xaihi?: { node?: unknown } }
      if (pkg?.xaihi?.node) {
        return pkg.xaihi.node
      }
    } catch {}
  }
  throw new Error(`${name}: package.json#xaihi.node definition is missing`)
}

export function apply(ctx: any, config: Config): void {
  const nodeDef = ownNodeDefinition()
  const manager = new ScreenshotManager()

  // 将 DSH 配置同步到 manager 内存中
  void manager.init().then(() => {
    if (config.screenshotPath) manager.config.path = config.screenshotPath
    if (config.imageFormat) manager.config.imageFormat = config.imageFormat
    if (config.imageQuality) manager.config.imageQuality = config.imageQuality
    if (config.imageLossless !== undefined) manager.config.imageLossless = config.imageLossless
    if (config.obsIp) manager.config.obsIp = config.obsIp
    if (config.obsPort) manager.config.obsPort = config.obsPort
    if (config.obsPassword) manager.config.obsPassword = config.obsPassword
    manager.config.obsReplayBufferOnLongPress = config.saveReplayOnLongPress
  })

  // 严格的生命周期守卫：插件卸载、重载或宿主退出时销毁所有物理设备监听
  ctx.effect(() => () => {
    manager.dispose()
  }, 'shiin: dispose manager and release handles on unload')

  const handlers: NodeHandlers = {
    status: async () => {
      const devices = manager.gamepad.getConnectedDevices()
      const deviceNames = devices.map((d) => `#${d._index}: ${d.name}`).join(', ') || '无'
      const statusText = manager.listening ? '正在监听手柄' : '闲置'
      return `【手柄截图工具】\n状态: ${statusText}\n连接设备: ${deviceNames}\n保存路径: ${manager.config.path || '默认目录'}\n格式: ${manager.config.imageFormat}`
    },

    capture: async () => {
      const res = await manager.capture()
      if (!res.ok) {
        throw new Error(`截图失败: ${res.error}`)
      }
      return `截图成功！已保存至: ${res.filePath || '剪贴板'}`
    },

    list_devices: async () => {
      const devices = manager.gamepad.getConnectedDevices()
      if (devices.length === 0) {
        return '未检测到任何连接的游戏手柄设备。'
      }
      return devices.map((d) => `• [Index ${d._index}] ${d.name} (${d.type || 'joystick'})`).join('\n')
    },

    start_listen: async () => {
      const res = await manager.startListening()
      if (!res.ok) {
        throw new Error(res.reason || '启动监听失败')
      }
      return '手柄全局监听已成功启动！'
    },

    stop_listen: async () => {
      manager.stopListening()
      return '手柄全局监听已暂停。'
    },

    obs_save_replay: async () => {
      const res = await manager.saveOBSReplay()
      if (!res.ok) {
        throw new Error(`保存 OBS 回放失败: ${res.error}`)
      }
      return 'OBS 即时回放缓存已成功触发保存！'
    },
  }

  const node = defineNode(ctx, {
    definition: nodeDef,
    handlers,
  })

  // 注册斜杠命令 /shiin
  if (ctx.commands && typeof ctx.commands.register === 'function') {
    ctx.effect(() => ctx.commands.register({
      name: 'shiin',
      description: '游戏手柄截图指令: /shiin status | capture | list | start | stop | replay',
      async handler({ rawInput }: { rawInput: string }) {
        const cmd = rawInput.trim().split(/\s+/)[0] || 'status'
        try {
          switch (cmd) {
            case 'capture':
            case 'shot':
              return { kind: 'success', text: await node.invoke('capture') }
            case 'list':
            case 'devices':
              return { kind: 'success', text: await node.invoke('list_devices') }
            case 'start':
              return { kind: 'success', text: await node.invoke('start_listen') }
            case 'stop':
              return { kind: 'success', text: await node.invoke('stop_listen') }
            case 'replay':
              return { kind: 'success', text: await node.invoke('obs_save_replay') }
            case 'status':
            default:
              return { kind: 'success', text: await node.invoke('status') }
          }
        } catch (err: any) {
          return { kind: 'error', text: `执行 /shiin ${cmd} 失败: ${err?.message || String(err)}` }
        }
      },
    }), 'shiin: register slash command')
  }
}
