import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it } from 'vitest'

import { TitleBar } from '../src/ui/components/TitleBar.js'
import { ElectronHostBridge } from '../src/ui/adapter/electron.js'
import { XaihiHostBridge } from '../src/ui/adapter/xaihi.js'

describe('TitleBar & Platform Controller Adaptation', () => {
  const defaultProps = {
    listening: false,
    uiScale: 1.0,
    onSetUiScale: () => {},
    maximized: false,
    onMinimize: () => {},
    onToggleMaximize: () => {},
    onClose: () => {},
  }

  beforeEach(() => {
    delete (globalThis as any).window?.electronAPI
  })

  describe('Web Mode (网页模式自动识别与无空隙适配)', () => {
    it('automatically identifies web mode when electronAPI is absent, leaving no space for desktop controls', () => {
      const html = renderToStaticMarkup(<TitleBar {...defaultProps} />)

      expect(html).toContain('data-web="true"')
      expect(html).toContain('data-platform="web"')
      expect(html).toContain('data-controls="none"')
      expect(html).toContain('data-mac="false"')

      // 网页模式不渲染任何桌面控制按钮
      expect(html).not.toContain('shiin-window-controls')
      expect(html).not.toContain('shiin-window-button')
    })

    it('does not leave 80px space even when client OS is Mac (fixing the empty left gap in browser on macOS)', () => {
      // 用户在 macOS 浏览器中访问，isMac 为 true，但处于网页模式
      const html = renderToStaticMarkup(
        <TitleBar {...defaultProps} isMac={true} isWeb={true} />
      )

      expect(html).toContain('data-web="true"')
      expect(html).toContain('data-platform="web"')
      expect(html).toContain('data-controls="none"')
      // 关键：data-mac 必须为 false，避免命中 [data-mac="true"] 的 80px/76px 留白
      expect(html).toContain('data-mac="false"')
      expect(html).not.toContain('shiin-window-controls')
    })

    it('does not render Windows minimize/maximize/close buttons in web mode on Windows', () => {
      // 用户在 Windows 浏览器中访问，isMac 为 false，处于网页模式
      const html = renderToStaticMarkup(
        <TitleBar {...defaultProps} isMac={false} isWeb={true} />
      )

      expect(html).toContain('data-web="true"')
      expect(html).toContain('data-platform="web"')
      expect(html).toContain('data-controls="none"')
      expect(html).not.toContain('shiin-window-controls')
    })
  })

  describe('Desktop Mac vs Windows Adaptation (Mac在左，Windows在右)', () => {
    it('adapts for macOS desktop: reserves left space for native traffic lights and hides right controls', () => {
      const html = renderToStaticMarkup(
        <TitleBar {...defaultProps} isMac={true} isWeb={false} />
      )

      expect(html).toContain('data-web="false"')
      expect(html).toContain('data-platform="mac"')
      expect(html).toContain('data-controls="left"')
      expect(html).toContain('data-mac="true"')

      // 原生 macOS 交通灯由系统在左侧 (16, 14) 绘制，因此右侧不应有控制按钮，且默认不重复绘制 HTML 按钮
      expect(html).not.toContain('shiin-window-controls')
    })

    it('adapts for macOS desktop with custom controls: renders window controls on the LEFT', () => {
      const html = renderToStaticMarkup(
        <TitleBar
          {...defaultProps}
          isMac={true}
          isWeb={false}
          customControls={true}
        />
      )

      expect(html).toContain('data-controls="left"')
      expect(html).toContain('shiin-window-controls--left')
      expect(html).toContain('data-position="left"')

      // Mac 控制器在左侧，顺序为：关闭、最小化、最大化（Mac 红黄绿次序）
      const leftControlsIndex = html.indexOf('shiin-window-controls--left')
      const brandIndex = html.indexOf('shiin-titlebar__brand')
      expect(leftControlsIndex).toBeLessThan(brandIndex)

      // 验证包含关闭、最小化、最大化按钮
      expect(html).toContain('shiin-window-button--close')
      expect(html).toContain('shiin-window-button--min')
      expect(html).toContain('shiin-window-button--max')
    })

    it('adapts for Windows desktop: renders window controls on the RIGHT and leaves no traffic light space on the left', () => {
      const html = renderToStaticMarkup(
        <TitleBar {...defaultProps} isMac={false} isWeb={false} />
      )

      expect(html).toContain('data-web="false"')
      expect(html).toContain('data-platform="windows"')
      expect(html).toContain('data-controls="right"')
      expect(html).toContain('data-mac="false"')

      // Windows 控制器在右侧
      expect(html).toContain('shiin-window-controls--right')
      expect(html).toContain('data-position="right"')

      const brandIndex = html.indexOf('shiin-titlebar__brand')
      const rightControlsIndex = html.indexOf('shiin-window-controls--right')
      expect(brandIndex).toBeLessThan(rightControlsIndex)
    })

    it('supports explicit windowControlsPosition overrides', () => {
      // 显式指定在左侧渲染控制器
      const htmlLeft = renderToStaticMarkup(
        <TitleBar
          {...defaultProps}
          windowControlsPosition="left"
          customControls={true}
        />
      )
      expect(htmlLeft).toContain('data-controls="left"')
      expect(htmlLeft).toContain('shiin-window-controls--left')

      // 显式指定在右侧渲染控制器
      const htmlRight = renderToStaticMarkup(
        <TitleBar
          {...defaultProps}
          windowControlsPosition="right"
        />
      )
      expect(htmlRight).toContain('data-controls="right"')
      expect(htmlRight).toContain('shiin-window-controls--right')

      // 显式指定无控制器
      const htmlNone = renderToStaticMarkup(
        <TitleBar
          {...defaultProps}
          windowControlsPosition="none"
        />
      )
      expect(htmlNone).toContain('data-controls="none"')
      expect(htmlNone).not.toContain('shiin-window-controls')
    })
  })

  describe('Host Adapters (isWeb / isDesktop detection)', () => {
    it('ElectronHostBridge detects web mode when electronAPI is absent and desktop when present', () => {
      const bridge = new ElectronHostBridge()
      expect(bridge.hasElectronApi).toBe(false)
      expect(bridge.isWeb).toBe(true)
      expect(bridge.isDesktop).toBe(false)
    })

    it('XaihiHostBridge correctly exposes isWeb as true and isDesktop as false', () => {
      const bridge = new XaihiHostBridge({ runCommand: async () => ({ ok: true }) })
      expect(bridge.isWeb).toBe(true)
      expect(bridge.isDesktop).toBe(false)
      expect(bridge.platform).toBe('web')
    })
  })
})
