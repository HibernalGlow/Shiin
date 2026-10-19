#!/usr/bin/env node
import { ScreenshotManager, getScreenDisplays } from '../../core/index.js'

async function main() {
  const args = process.argv.slice(2)
  const cmd = args[0] || 'help'

  const manager = new ScreenshotManager()
  await manager.init()

  if (cmd === 'tui') {
    const { runOpenTui } = await import('./tui.js')
    await runOpenTui(manager)
    process.exit(0)
  }

  if (cmd === 'capture' || cmd === 'shot') {
    console.log('📸 正在执行截图…')
    const res = await manager.capture()
    if (res.ok) {
      console.log(`✅ 截图成功！保存至: ${res.filePath || '剪贴板'}`)
      process.exit(0)
    } else {
      console.error(`❌ 截图失败: ${res.error}`)
      process.exit(1)
    }
  }

  if (cmd === 'devices' || cmd === 'list') {
    const devices = manager.gamepad.getConnectedDevices()
    console.log(`🎮 当前检测到 ${devices.length} 个游戏手柄:`)
    for (const d of devices) {
      console.log(`  • [Index ${d._index}] ${d.name} (${d.type || 'joystick'})`)
    }
    const screens = await getScreenDisplays()
    console.log(`🖥️ 当前检测到 ${screens.length} 个屏幕源:`)
    for (const s of screens) {
      console.log(`  • [ID ${s.id}] ${s.name}`)
    }
    process.exit(0)
  }

  if (cmd === 'listen') {
    console.log('🎮 正在启动手柄与快捷键监听（按 Ctrl+C 退出）…')
    const res = await manager.startListening()
    if (!res.ok) {
      console.error(`❌ 启动失败: ${res.reason}`)
      process.exit(1)
    }
    console.log('🟢 监听中… 按手柄组合键即可触发截图。')

    manager.subscribe((ev) => {
      if (ev.type === 'screenshot') {
        console.log(`[EVENT] 截图完成: ${ev.data?.filePath || '已写入剪贴板'}`)
      } else if (ev.type === 'replayBuffer') {
        console.log('[EVENT] OBS 回放缓存已保存！')
      }
    })

    process.on('SIGINT', () => {
      console.log('\n🛑 正在停止监听并释放句柄…')
      manager.dispose()
      process.exit(0)
    })
    return
  }

  // 默认帮助信息
  console.log(`
🎮 Shiin - 游戏手柄截图与录屏回放工具 (Gamepad Screenshot Tool)

用法:
  shiin <command> [options]

常用命令:
  tui         进入 OpenTUI 终端交互仪表盘（实时按键监控、快速测试与操作）
  capture     立即执行一次屏幕/窗口截图并保存
  devices     列出当前系统连接的所有游戏手柄与显示器
  listen      在前台无头终端模式下持续监听手柄组合键
  help        显示本帮助信息

示例:
  shiin tui
  shiin capture
  shiin listen
`)
  process.exit(0)
}

main().catch((err) => {
  console.error('[CLI Error]', err)
  process.exit(1)
})
