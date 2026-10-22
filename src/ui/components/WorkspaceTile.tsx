import * as React from 'react'
import { AppIcon } from './AppIcon.js'

interface WorkspaceTileProps {
  className: string
  title: string
  description: string
  summary: string
  badge?: React.ReactNode
  children: React.ReactNode
}

/** Low-frequency phone controls unfold in place; larger windows show their full contents. */
export function WorkspaceTile({ className, title, description, summary, badge, children }: WorkspaceTileProps) {
  const [expanded, setExpanded] = React.useState(false)
  const bodyId = React.useId()
  return <section className={`sb-tile shiin-workspace-tile ${className}`} aria-label={title} data-expanded={expanded}>
    <div className="sb-tile-head">
      <div><h3>{title}</h3><p className="shiin-tile-description">{description}</p><p className="shiin-tile-summary">{summary}</p></div>
      {badge}
      <button type="button" className="shiin-tile-disclosure" aria-expanded={expanded} aria-controls={bodyId}
        aria-label={title} onClick={() => setExpanded(current => !current)}><AppIcon name="chevronDown" size={22} /></button>
    </div>
    <div className="shiin-workspace-tile__body" id={bodyId}>{children}</div>
  </section>
}
