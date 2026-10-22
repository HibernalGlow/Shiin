import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { BUILTIN_PROFILES, type CaptureProfile } from '../../../core/profile.js'
import { simulateRules, type AutomationRule, type RuleMatchResult } from '../../../core/rule-engine.js'
import type { InboxItem } from '../../../core/inbox.js'
import { AppIcon } from '../AppIcon.js'
import { ProfileBadge } from './ProfileBadge.js'
import { INITIAL_DEMO_RULES } from './types.js'

interface WorkflowsViewProps {
  items: InboxItem[]
  locale?: string
  onClose?: () => void
}

export const WorkflowsView: React.FC<WorkflowsViewProps> = ({
  items,
  locale = 'zh',
  onClose,
}) => {
  const isZh = locale.startsWith('zh')
  const [profiles] = React.useState<CaptureProfile[]>(BUILTIN_PROFILES)
  const [rules, setRules] = React.useState<AutomationRule[]>(INITIAL_DEMO_RULES)
  const [simResults, setSimResults] = React.useState<RuleMatchResult[] | null>(null)
  const [simulating, setSimulating] = React.useState(false)

  const toggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    )
  }

  const handleDryRun = () => {
    setSimulating(true)
    setTimeout(() => {
      const results = simulateRules(items, rules)
      setSimResults(results)
      setSimulating(false)
    }, 200)
  }

  return (
    <div
      className="shiin-workflows-view"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '8px 0',
      }}
    >
      {/* 1. Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid var(--shiin-line-soft)',
          paddingBottom: '14px',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--shiin-ink)' }}>
            {isZh ? '工作流与场景配置 (Capture Profiles & Rules)' : 'Capture Profiles & Automation'}
          </h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--shiin-muted)' }}>
            {isZh
              ? '通过“触发 - 隐私 - 元数据 - 动作”四维管道定义场景，无感自动分流'
              : 'Define workflows through triggers, privacy rules, metadata, and post-capture actions'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="shiin-dash-tab is-active"
            onClick={handleDryRun}
            disabled={simulating}
            style={{
              padding: '6px 14px',
              backgroundColor: 'var(--md-sys-color-primary, #c8f000)',
              color: 'var(--md-sys-color-on-primary, #273000)',
              fontWeight: 700,
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <AppIcon name="play" size={13} />
              <span>{simulating ? (isZh ? '仿真中...' : 'Simulating...') : (isZh ? 'Dry-Run 规则仿真测试' : 'Dry-Run Simulation')}</span>
            </span>
          </button>

          {onClose && (
            <button
              type="button"
              className="shiin-dash-tab"
              onClick={onClose}
              aria-label={isZh ? '关闭' : 'Close'}
            >
              <AppIcon name="close" size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Dry Run Preview Drawer */}
      <AnimatePresence>
        {simResults && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="shiin-dash-card"
            style={{
              backgroundColor: 'var(--md-sys-color-primary-container)',
              color: 'var(--md-sys-color-on-primary-container)',
              borderColor: 'var(--md-sys-color-primary)',
              padding: '14px 18px',
              borderRadius: '18px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                <AppIcon name="check" size={16} />
                <span>{isZh ? `Dry-Run 仿真完成：命中 ${simResults.length} 条规则` : `Dry-Run Complete: ${simResults.length} rules matched`}</span>
              </strong>
              <button
                type="button"
                onClick={() => setSimResults(null)}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                <AppIcon name="close" size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {simResults.map((r) => (
                <div
                  key={r.ruleId}
                  style={{
                    backgroundColor: 'var(--shiin-surface)',
                    color: 'var(--shiin-ink)',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid var(--shiin-line-soft)',
                  }}
                >
                  <strong style={{ fontWeight: 650 }}>{r.ruleName}</strong>
                  <span style={{ color: 'var(--md-sys-color-secondary)' }}>
                    {isZh ? `预期影响 ${r.matchedItemIds.length} 张图片` : `Will affect ${r.matchedItemIds.length} items`}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Capture Profiles Cards */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--shiin-ink)', marginBottom: '10px' }}>
          {isZh ? '内置场景配置 (Capture Profiles)' : 'Built-in Capture Profiles'}
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '12px',
          }}
        >
          {profiles.map((p) => (
            <div
              key={p.id}
              className="shiin-dash-card"
              style={{
                padding: '14px',
                borderRadius: '18px',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <ProfileBadge profileId={p.id} locale={locale} />
                {p.isDefault && (
                  <span className="shiin-dash-chip" style={{ fontSize: '10px', padding: '1px 6px' }}>
                    {isZh ? '默认' : 'DEFAULT'}
                  </span>
                )}
              </div>

              <p style={{ margin: 0, fontSize: '12px', color: 'var(--shiin-muted)', lineHeight: '1.4' }}>
                {isZh ? p.descriptionZh : p.descriptionEn}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--shiin-muted)' }}>
                <div>
                  <strong style={{ color: 'var(--shiin-ink)' }}>{isZh ? '目标目录: ' : 'Target: '}</strong>
                  <span>{p.pipeline.folderTemplate}</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--shiin-ink)' }}>{isZh ? 'OCR 索引: ' : 'OCR: '}</strong>
                  <span style={{ fontWeight: 600, color: p.pipeline.enableOCR ? 'var(--md-sys-color-secondary)' : 'inherit' }}>
                    {p.pipeline.enableOCR ? (isZh ? '开启' : 'Enabled') : (isZh ? '关闭' : 'Disabled')}
                  </span>
                </div>
                <div>
                  <strong style={{ color: 'var(--shiin-ink)' }}>{isZh ? '隐私脱敏: ' : 'Privacy: '}</strong>
                  <span>{p.capturePolicy.stripWindowTitle ? (isZh ? '隐藏标题' : 'Strip Title') : (isZh ? '保留上下文' : 'Keep Title')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Automation Rules Engine */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--shiin-ink)', marginBottom: '10px' }}>
          {isZh ? '自动化规则库 (Automation Rules)' : 'Automation Rules'}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {rules.map((r) => (
            <div
              key={r.id}
              className="shiin-dash-card"
              style={{
                padding: '14px 18px',
                borderRadius: '16px',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '500px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontWeight: 700, color: 'var(--shiin-ink)', fontSize: '13.5px' }}>
                    {r.name}
                  </strong>
                  <span
                    className="shiin-dash-chip"
                    style={{
                      fontSize: '10.5px',
                      padding: '1px 6px',
                      backgroundColor: r.enabled ? 'var(--md-sys-color-primary-container)' : undefined,
                      color: r.enabled ? 'var(--md-sys-color-on-primary-container)' : undefined,
                    }}
                  >
                    {r.enabled ? (isZh ? '启用中' : 'Active') : (isZh ? '已停用' : 'Disabled')}
                  </span>
                </div>
                {r.description && (
                  <span style={{ fontSize: '11.5px', color: 'var(--shiin-muted)' }}>
                    {r.description}
                  </span>
                )}
              </div>

              <div>
                <button
                  type="button"
                  className="shiin-dash-tab"
                  onClick={() => toggleRule(r.id)}
                  style={{
                    backgroundColor: r.enabled ? 'var(--md-sys-color-surface-container-high)' : undefined,
                    color: r.enabled ? 'var(--shiin-ink)' : 'var(--shiin-muted)',
                    fontWeight: 650,
                  }}
                >
                  {r.enabled ? (isZh ? '停用规则' : 'Disable') : (isZh ? '启用规则' : 'Enable')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
