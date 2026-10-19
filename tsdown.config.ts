import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/xaihi/index.ts',
    cli: 'src/app/cli/index.ts',
    core: 'src/core/index.ts',
    main: 'src/app/electron/main.ts',
    preload: 'src/app/electron/preload.ts',
    'gamepad-worker': 'src/app/electron/gamepad-worker.ts',
  },
  outDir: 'lib',
  format: ['esm'],
  platform: 'node',
  target: 'node22',
  dts: true,
  clean: true,
  deps: {
    neverBundle: [
      '@deepseek-ai/cordis',
      '@deepseek-ai/dsh-tools',
      'electron',
      '@kmamal/sdl',
      'uiohook-napi',
      'screenshot-desktop',
      'node-screenshots',
      'active-win',
    ],
    alwaysBundle: [
      'obs-websocket-js',
      '@msgpack/msgpack',
      'isomorphic-ws',
      'crypto-js',
      'eventemitter3',
    ],
  },
})
