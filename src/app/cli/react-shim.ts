import * as React from 'react'

// React 18 -> 19 reconciler compatibility shim for @opentui/react
const anyReact = React as any
if (anyReact && !anyReact.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE) {
  anyReact.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = {
    ...(anyReact.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED || {}),
    S: null,
    A: null,
    T: null,
    H: null,
  }
}
