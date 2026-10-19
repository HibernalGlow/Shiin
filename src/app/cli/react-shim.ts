import * as ReactModule from 'react'
import { createRequire } from 'node:module'

export function ensureReactShim(): void {
  // 1. Shim ESM React namespace default
  const anyReactModule = (ReactModule as any).default || ReactModule
  if (anyReactModule && !anyReactModule.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE) {
    try {
      anyReactModule.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = {
        ...(anyReactModule.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED || {}),
        S: null,
        A: null,
        T: null,
        H: null,
      }
    } catch {
      // Ignore if object is frozen
    }
  }

  // 2. Shim CommonJS React export instance
  try {
    const require = createRequire(import.meta.url)
    const ReactCjs = require('react')
    if (ReactCjs && !ReactCjs.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE) {
      ReactCjs.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = {
        ...(ReactCjs.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED || {}),
        S: null,
        A: null,
        T: null,
        H: null,
      }
    }
  } catch {
    // Ignore if require is unavailable
  }
}

// Auto-run on module load
ensureReactShim()
