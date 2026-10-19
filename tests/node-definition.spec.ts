import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { validateNodeDefinition } from '../src/xaihi/sdk/node.js'

describe('package.json Xaihi manifest and node specification', () => {
  it('validates node schema strictly', () => {
    const pkgPath = join(process.cwd(), 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    const nodeDef = pkg.xaihi?.node

    expect(nodeDef).toBeDefined()
    const result = validateNodeDefinition(nodeDef)
    expect(result.ok).toBe(true)

    if (result.ok) {
      expect(result.value.nodeId).toBe('shiin')
      const actionIds = result.value.actions.map((a) => a.id)
      expect(actionIds).toContain('capture')
      expect(actionIds).toContain('status')
      expect(actionIds).toContain('list_devices')
      expect(actionIds).toContain('start_listen')
      expect(actionIds).toContain('stop_listen')
    }
  })
})
