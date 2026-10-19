import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack'
import { rspack } from '@rspack/core'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isApp = process.env.BUILD_TARGET === 'app'

// shared.import: false => 拿不到宿主 React 就硬失败，严格遵守 Xaihi 规范
const reactShared = { singleton: true, requiredVersion: '^18.3.1', import: false }

export default isApp
  ? {
      mode: 'production',
      entry: './src/ui/index.tsx',
      output: {
        path: path.resolve(__dirname, 'dist/ui'),
        filename: 'bundle.[contenthash:8].js',
        clean: true,
      },
      resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
        extensionAlias: {
          '.js': ['.ts', '.tsx', '.js'],
          '.jsx': ['.tsx', '.jsx'],
        },
      },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: [
              {
                loader: 'builtin:swc-loader',
                options: {
                  jsc: {
                    parser: { syntax: 'typescript', tsx: true },
                    transform: { react: { runtime: 'automatic' } },
                  },
                },
              },
            ],
            type: 'javascript/auto',
          },
          {
            test: /\.css$/,
            type: 'css',
          },
        ],
      },
      plugins: [
        new rspack.HtmlRspackPlugin({
          templateContent: `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gamepad Screenshot Tool (Shiin)</title>
  <style>
    * { box-sizing: border-box; }
    html, body, #app { height: 100%; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="app"></div>
</body>
</html>`,
        }),
      ],
    }
  : {
      mode: 'production',
      // Xaihi 模块联邦面板构建
      entry: './src/ui/container-entry.ts',
      output: {
        path: path.resolve(__dirname, 'dist'),
        clean: false,
        publicPath: 'auto',
      },
      resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
        extensionAlias: {
          '.js': ['.ts', '.tsx', '.js'],
          '.jsx': ['.tsx', '.jsx'],
        },
      },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: [
              {
                loader: 'builtin:swc-loader',
                options: {
                  jsc: {
                    parser: { syntax: 'typescript', tsx: true },
                    transform: { react: { runtime: 'automatic' } },
                  },
                },
              },
            ],
            type: 'javascript/auto',
          },
          {
            test: /\.css$/,
            type: 'css',
          },
        ],
      },
      plugins: [
        new ModuleFederationPlugin({
          name: 'shiin',
          filename: 'remoteEntry.js',
          exposes: {
            './Panel': './src/ui/Panel.tsx',
          },
          shared: {
            react: reactShared,
            'react-dom': reactShared,
          },
          dts: false,
        }),
      ],
    }
