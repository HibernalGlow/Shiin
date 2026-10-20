/**
 * 终端渲染器跑不跑得起来：**探测 FFI 底座，不偷偷换运行时。**
 *
 * 结论与 Xaihi `packages/cli-runtime/src/tui/runtime-capability.ts` 一致：
 * OpenTUI 的渲染后端是 Zig 编译出来的原生库，bun 走 `bun:ffi`，Node 走 `node:ffi`
 * （Node 26 起的内置模块）。所以"`import('@opentui/core')` 成功"不是判据——
 * Node 22 上它照样有导出，一调 `createCliRenderer` 就炸。判据必须是 FFI 在不在。
 *
 * 与 Xaihi 的差别只有一条，且是使用者的选择：本仓的 TUI 一直是可用的，
 * 使用者机器上装了 bun 时允许**显式**接力（`shiin tui` 会先说明一句再交给 bun 重跑），
 * 没有 bun 就把缺失项点名说清楚并退回 `gd`。两条路都在终端上读得回来。
 */

import { spawnSync } from 'node:child_process'

export type RuntimeName = 'bun' | 'node'
export type FfiSubstrate = 'bun:ffi' | 'node:ffi' | 'missing'

export interface RuntimeCapability {
  ok: boolean
  runtime: RuntimeName
  version: string
  ffi: FfiSubstrate
  exports?: number
  detail: string
}

type Versions = Record<string, string | undefined>

function runtimeName(): RuntimeName {
  return (process.versions as Versions).bun !== undefined ? 'bun' : 'node'
}

function runtimeVersion(): string {
  const versions = process.versions as Versions
  return (runtimeName() === 'bun' ? versions.bun : versions.node) ?? 'unknown'
}

let cached: RuntimeCapability | null = null

async function probeFfi(): Promise<FfiSubstrate> {
  if (runtimeName() === 'bun') return 'bun:ffi'
  // 经变量 import：`node:ffi` 是 Node 26 的实验内置模块，@types/node 没有它的声明。
  const nodeFfi = 'node:ffi'
  try {
    await import(nodeFfi)
    return 'node:ffi'
  } catch {
    return 'missing'
  }
}

export async function probeTerminalRuntime(refresh = false): Promise<RuntimeCapability> {
  if (cached && !refresh) return cached
  const runtime = runtimeName()
  const version = runtimeVersion()
  const ffi = await probeFfi()
  if (ffi === 'missing') {
    cached = {
      ok: false,
      runtime,
      version,
      ffi,
      detail: `${runtime} ${version} 没有 node:ffi（Node 26 起才有，实验特性），OpenTUI 的原生库无法 dlopen。`,
    }
    return cached
  }
  try {
    const core = await import('@opentui/core')
    const exports = Object.keys(core).length
    // `import` 成功不等于能渲染：平台原生库缺失时导出照样有。真正可靠的判据是
    // 把原生库构造一次（失败会抛 `Failed to initialize OpenTUI render library`），
    // 立刻 dispose，渲染器随后用的仍是模块自己的单例。
    const Lib = (core as unknown as { FFIRenderLib?: new () => { dispose?: () => void } }).FFIRenderLib
    if (typeof Lib === 'function') {
      const nativeLib = new Lib()
      try {
        nativeLib.dispose?.()
      } catch {
        // dispose 失败不影响判定：能构造出来就说明原生库在
      }
    }
    cached = {
      ok: exports > 0,
      runtime,
      version,
      ffi,
      exports,
      detail: exports > 0
        ? `@opentui/core 在 ${runtime} ${version} 上加载成功（${exports} 个导出，原生库已就位，FFI 底座 ${ffi}）`
        : `@opentui/core 在 ${runtime} ${version} 上一个导出都没有。`,
    }
  } catch (error) {
    cached = {
      ok: false,
      runtime,
      version,
      ffi,
      detail: `${runtime} ${version} 起不了 OpenTUI：${error instanceof Error ? error.message : String(error)}`,
    }
  }
  return cached
}

/** 探测失败时给使用者看的那句话：口径与 Xaihi 相同，让"退化"读起来是同一件事。 */
export function terminalRuntimeHint(capability: RuntimeCapability): string {
  if (capability.ok) return ''
  return [
    capability.detail,
    '',
    '全屏 TUI 这一面已退化：交互面请用引导式问答（gd）；pipe 子命令不受影响。',
    `当前运行时是 ${capability.runtime} ${capability.version}。`,
    'OpenTUI 需要经 FFI 加载 Zig 原生后端：bun 用 bun:ffi，Node 用 node:ffi（Node ≥ 26，实验特性）。',
  ].join('\n')
}

/** 是否在 PATH 上找得到可用的 bun（用于"显式接力"这一条腿）。 */
export function findBun(): string | null {
  if (runtimeName() === 'bun') return null
  try {
    const result = spawnSync(process.platform === 'win32' ? 'where' : 'which', ['bun'], { encoding: 'utf8' })
    if (result.status !== 0) return null
    const path = (result.stdout ?? '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean)[0]
    if (!path) return null
    const version = spawnSync(path, ['--version'], { encoding: 'utf8' })
    return version.status === 0 ? path : null
  } catch {
    return null
  }
}
