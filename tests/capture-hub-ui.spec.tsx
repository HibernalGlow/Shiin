import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { ProfileBadge } from '../src/ui/components/hub/ProfileBadge.js'
import { ProfileSelector } from '../src/ui/components/hub/ProfileSelector.js'
import { SessionTimeline } from '../src/ui/components/hub/SessionTimeline.js'
import { InboxView } from '../src/ui/components/hub/InboxView.js'
import { WorkflowsView } from '../src/ui/components/hub/WorkflowsView.js'
import { CaptureHubWidget } from '../src/ui/components/hub/CaptureHubWidget.js'
import { INITIAL_DEMO_ITEMS } from '../src/ui/components/hub/types.js'
import { WorkspaceView } from '../src/ui/components/WorkspaceView.js'
import { SettingsView } from '../src/ui/components/SettingsView.js'
import { DEFAULT_CONFIG } from '../src/core/types.js'
import { DEFAULT_SHAPE_PREFERENCES, createShapeSession } from '../src/ui/md3e-shapes.js'

describe('Capture Hub MD3 Expressive UI Components (Dashboard Reused)', () => {
  it('renders ProfileBadge with localized profile names and semantic colors', () => {
    const htmlZh = renderToStaticMarkup(<ProfileBadge profileId="gaming" locale="zh" />)
    expect(htmlZh).toContain('娱乐与游戏')
    expect(htmlZh).toContain('shiin-profile-badge')
  })

  it('renders ProfileBadge in English when locale is en', () => {
    const htmlEn = renderToStaticMarkup(<ProfileBadge profileId="development" locale="en" />)
    expect(htmlEn).toContain('Dev &amp; Debug')
  })

  it('renders ProfileSelector with dashboard tab styles', () => {
    const html = renderToStaticMarkup(
      <ProfileSelector selectedProfileId="gaming" onSelectProfile={() => {}} locale="zh" />
    )

    expect(html).toContain('shiin-dash-tabs')
    expect(html).toContain('全部')
    expect(html).toContain('娱乐与游戏')
    expect(html).toContain('开发与排障')
    expect(html).toContain('研究与资料')
    expect(html).toContain('设计与灵感')
  })

  it('renders SessionTimeline with clustered activity sessions and cards', () => {
    const html = renderToStaticMarkup(
      <SessionTimeline
        items={INITIAL_DEMO_ITEMS}
        onItemClick={() => {}}
        onSessionArchive={() => {}}
        onSessionStar={() => {}}
        locale="zh"
      />
    )

    expect(html).toContain('shiin-session-timeline')
    expect(html).toContain('Elden Ring')
  })

  it('renders InboxView with metrics and filters', () => {
    const html = renderToStaticMarkup(<InboxView locale="zh" />)

    expect(html).toContain('捕获收件箱 (Capture Inbox)')
    expect(html).toContain('收件箱待整理')
    expect(html).toContain('收藏标星')
    expect(html).toContain('已归档')
    expect(html).toContain('Bento 网格')
    expect(html).toContain('会话时间线')
  })

  it('renders WorkflowsView with builtin profiles and automation rules', () => {
    const html = renderToStaticMarkup(
      <WorkflowsView items={INITIAL_DEMO_ITEMS} locale="zh" />
    )

    expect(html).toContain('工作流与场景配置 (Capture Profiles &amp; Rules)')
    expect(html).toContain('内置场景配置 (Capture Profiles)')
    expect(html).toContain('自动化规则库 (Automation Rules)')
    expect(html).toContain('Dry-Run 规则仿真测试')
  })

  it('renders CaptureHubWidget inside workspace bento grid as an entry card', () => {
    const html = renderToStaticMarkup(<CaptureHubWidget locale="zh" />)

    expect(html).toContain('sb-capture-hub-tile')
    expect(html).toContain('捕获中枢 · 待整理收件箱')
    expect(html).toContain('打开收件箱')
    expect(html).toContain('工作流与规则')
    expect(html).toContain('待整理')
  })

  it('defaults enableCaptureHub to false in DEFAULT_CONFIG', () => {
    expect(DEFAULT_CONFIG.enableCaptureHub).toBe(false)
  })

  it('hides CaptureHubWidget in WorkspaceView by default (enableCaptureHub is false)', () => {
    const html = renderToStaticMarkup(
      <WorkspaceView
        config={{ ...DEFAULT_CONFIG, enableCaptureHub: false }}
        onChange={() => {}}
        listening={false}
        onToggleListen={() => {}}
        onCapture={() => {}}
        onSaveOBS={() => {}}
        onOpenFolder={() => {}}
        onSelectFolder={() => {}}
        gamepads={[]}
        selectedGamepadIndex={0}
        onSelectGamepad={() => {}}
        screens={[]}
        windows={[]}
        onRefreshWindows={() => {}}
        buttons={[]}
        axes={[]}
        recordingCombo={false}
        liveRecordingKeys={[]}
        onStartComboRecording={() => {}}
        onCancelComboRecording={() => {}}
        onAddKey={() => {}}
        onClearKeys={() => {}}
        onRemoveKey={() => {}}
        detectingKeyboard={false}
        onDetectKeyboard={() => {}}
        onOpenPermissions={() => {}}
        locale="zh"
      />
    )

    expect(html).not.toContain('sb-capture-hub-tile')
    expect(html).not.toContain('捕获中枢 · 待整理收件箱')
  })

  it('shows CaptureHubWidget in WorkspaceView when enableCaptureHub is true', () => {
    const html = renderToStaticMarkup(
      <WorkspaceView
        config={{ ...DEFAULT_CONFIG, enableCaptureHub: true }}
        onChange={() => {}}
        listening={false}
        onToggleListen={() => {}}
        onCapture={() => {}}
        onSaveOBS={() => {}}
        onOpenFolder={() => {}}
        onSelectFolder={() => {}}
        gamepads={[]}
        selectedGamepadIndex={0}
        onSelectGamepad={() => {}}
        screens={[]}
        windows={[]}
        onRefreshWindows={() => {}}
        buttons={[]}
        axes={[]}
        recordingCombo={false}
        liveRecordingKeys={[]}
        onStartComboRecording={() => {}}
        onCancelComboRecording={() => {}}
        onAddKey={() => {}}
        onClearKeys={() => {}}
        onRemoveKey={() => {}}
        detectingKeyboard={false}
        onDetectKeyboard={() => {}}
        onOpenPermissions={() => {}}
        locale="zh"
      />
    )

    expect(html).toContain('sb-capture-hub-tile')
    expect(html).toContain('捕获中枢 · 待整理收件箱')
  })

  it('renders Capture Hub switch in SettingsView with toggle support', () => {
    const shapeSession = createShapeSession(DEFAULT_SHAPE_PREFERENCES, 1)

    // When disabled
    const htmlDisabled = renderToStaticMarkup(
      <SettingsView
        config={{ ...DEFAULT_CONFIG, enableCaptureHub: false }}
        onChange={() => {}}
        onRefreshPermissions={async () => {}}
        onRequestPermission={async () => {}}
        onTestScreenshot={async () => null}
        shapePreferences={DEFAULT_SHAPE_PREFERENCES}
        shapeSession={shapeSession}
        onShapePreferencesChange={() => {}}
        onRerollShapeSession={() => {}}
        locale="zh"
      />
    )
    expect(htmlDisabled).toContain('settings-hub')
    expect(htmlDisabled).toContain('跨应用捕获中枢 (Capture Hub)')
    expect(htmlDisabled).toContain('工作台显示捕获中枢')
    expect(htmlDisabled).toContain('默认关闭 · 隐藏该组件以保持工作台极简专注')

    // When enabled
    const htmlEnabled = renderToStaticMarkup(
      <SettingsView
        config={{ ...DEFAULT_CONFIG, enableCaptureHub: true }}
        onChange={() => {}}
        onRefreshPermissions={async () => {}}
        onRequestPermission={async () => {}}
        onTestScreenshot={async () => null}
        shapePreferences={DEFAULT_SHAPE_PREFERENCES}
        shapeSession={shapeSession}
        onShapePreferencesChange={() => {}}
        onRerollShapeSession={() => {}}
        locale="zh"
      />
    )
    expect(htmlEnabled).toContain('settings-hub')
    expect(htmlEnabled).toContain('已启用 · 工作台显示待整理收件箱与工作流')
  })
})
