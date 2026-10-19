import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/xaihi/index.ts',
    cli: 'src/app/cli/index.ts',
    core: 'src/core/index.ts',
    main: 'src/app/electron/main.ts',
    preload: 'src/app/electron/preload.ts',
  },
  outDir: 'lib',
  format: ['esm'],
  platform: 'node',
  target: 'node22',
  dts: true,
  clean: true,
  external: [
    '@deepseek-ai/cordis',
    '@deepseek-ai/dsh-tools',
    'electron',
    '@kmamal/sdl',
    'uiohook-napi',
    'screenshot-desktop',
    'node-screenshots',
    'active-win',
  ],
})
