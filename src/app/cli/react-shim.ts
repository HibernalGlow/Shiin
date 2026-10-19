import * as ReactModule from 'react'
import { createRequire } from 'node:module'

export function ensureReactShim(): void {
  const require = createRequire(import.meta.url)
  let ReactCjs: any = null
  try {
    ReactCjs = require('react')
  } catch {}

  const secretInternals =
    ReactCjs?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED ||
    (ReactModule as any)?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED ||
    (ReactModule as any)?.default?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED ||
    {}

  const clientInternals = {
    ...secretInternals,
    H: null,
    A: null,
    T: null,
    S: null,
    actQueue: null,
    isBatchingLegacy: false,
    didUsePromise: false,
    asyncTransitions: null,
    thrownErrors: [],
    recentlyCreatedOwnerStacks: null,
    getCurrentStack: null,
  }

  // 1. Shim CommonJS React export instance
  if (ReactCjs) {
    if (!ReactCjs.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE) {
      ReactCjs.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = clientInternals
    } else {
      Object.assign(ReactCjs.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, clientInternals)
    }
  }

  // 2. Shim ESM React namespace and default
  const anyReactModule = (ReactModule as any).default || ReactModule
  if (anyReactModule) {
    try {
      if (!anyReactModule.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE) {
        anyReactModule.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = clientInternals
      } else {
        Object.assign(anyReactModule.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, clientInternals)
      }
    } catch {}
  }
}

// Auto-run on module load
ensureReactShim()
