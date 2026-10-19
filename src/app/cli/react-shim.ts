import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
try {
  const React = require('react')
  if (React && !React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE) {
    React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = {
      ...(React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED || {}),
      S: null,
      A: null,
      T: null,
      H: null,
    }
  }
} catch {
  // Ignored if react cannot be resolved
}
